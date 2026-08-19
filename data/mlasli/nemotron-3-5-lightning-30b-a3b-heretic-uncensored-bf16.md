# mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-BF16

## Resumen

El modelo **Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-BF16** es una variante del modelo híbrido de NVIDIA **NVIDIA-Nemotron-3.5-Lightning-30B-A3B** (31,6B parámetros totales, 3B activos) a la que se le ha eliminado la dirección de rechazo mediante la técnica de ablación **Heretic**. El autor, mlasli, ha aplicado una ablación de una sola dirección con búsqueda de hiperparámetros basada en Optuna, logrando un 0% de rechazos con una divergencia KL de aproximadamente 0,04 respecto al modelo original. El resultado es un modelo que conserva las capacidades lingüísticas y de razonamiento del base, pero que responde directamente a peticiones que el modelo original rechazaría, lo que lo hace especialmente adecuado para roleplay sin censura y tareas de agente con contexto largo.

La arquitectura combina **Mamba-2** (estado espacial), **MoE** (mezcla de expertos) y **atención** tradicional, lo que permite un uso eficiente de recursos al activar solo 3B de los 31,6B parámetros por token. El modelo soporta seis idiomas (inglés, español, francés, alemán, italiano y japonés) y se distribuye en formato BF16 (safetensors) y cuantizaciones GGUF (Q8_0, Q6_K, Q4_K_M). No se especifica la longitud de contexto en la información disponible, aunque por su diseño híbrido se espera que herede la ventana del modelo base de NVIDIA. La licencia es la **NVIDIA Open Model License**, que permite uso comercial con ciertas restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + MoE + attention (nemotron_h) |
| Parametros totales | 31.577.937.344 (31,6B) |
| Parametros activos | 3B (aproximadamente, según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original), GGUF Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (BF16), GGUF (en repositorios separados) |

## Arquitectura y entrenamiento

El modelo base, desarrollado por NVIDIA, emplea una arquitectura híbrida que combina capas de **Mamba-2** (modelos de espacio de estado) con capas de **atención** tradicional y una mezcla de expertos (**MoE**) de 3B parámetros activos de un total de 31,6B. Esta combinación busca equilibrar la eficiencia computacional de Mamba con la capacidad de atención para tareas que requieren contexto largo. El entrenamiento original fue realizado por NVIDIA, aunque no se proporcionan detalles sobre el dataset ni el proceso de alineación en la información disponible.

La modificación principal de este modelo es la aplicación de **Heretic**, una técnica de ablación de una sola dirección que elimina el vector de rechazo aprendido durante el alineamiento de seguridad. Heretic utiliza una búsqueda de parámetros con **Optuna** para encontrar el punto óptimo en el frente de Pareto entre cumplimiento de peticiones y divergencia KL del primer token. En este caso, se realizaron 200 pruebas, seleccionándose el trial 141, que logró un 86% de cumplimiento en la evaluación interna y una divergencia KL de 0,0392. La evaluación independiente posterior sobre 50 prompts de comportamiento dañino reportó un 0% de rechazos y un 100% de cumplimiento, con una divergencia KL de 0,0397. Es importante señalar que la ablación solo afecta al backbone lingüístico; el resto de capacidades del modelo base se conservan.

## Capacidades

- Generación de texto sin censura: responde directamente a peticiones que el modelo base rechazaría, incluyendo contenido explícito, violento o ilegal.
- Roleplay y narrativa interactiva: adecuado para juegos de rol textuales y creación de historias con personajes y diálogos sin restricciones.
- Conversación multilingüe: soporta seis idiomas (inglés, español, francés, alemán, italiano y japonés) con capacidad de cambio de idioma en una misma conversación.
- Razonamiento y resolución de problemas: conserva las capacidades de razonamiento del modelo base de NVIDIA, aunque no se han publicado benchmarks específicos.
- Procesamiento de contexto largo: gracias a la combinación de Mamba-2 y atención, puede manejar secuencias extensas, aunque la longitud máxima no está documentada.
- Integración con frameworks de agentes: al no rechazar peticiones, puede utilizarse en pipelines de agentes que requieran respuestas directas a instrucciones potencialmente sensibles.

## Casos de uso

- **Roleplay sin censura en juegos de texto**: el modelo puede interpretar personajes y responder a acciones del usuario sin filtros morales, ideal para comunidades de roleplay adulto o narrativa interactiva.
- **Generación de contenido creativo explícito**: escritores y creadores pueden usarlo para producir borradores de novelas, guiones o fanfiction con escenas adultas o violentas sin necesidad de sortear rechazos.
- **Agentes conversacionales para investigación en alineación**: investigadores pueden estudiar el comportamiento de un modelo sin dirección de rechazo para analizar los efectos de la ablación en la seguridad y la utilidad.
- **Asistente multilingüe para entornos sin restricciones**: empresas que necesitan un chatbot que responda a cualquier consulta sin evasivas, por ejemplo en soporte técnico donde el usuario puede hacer preguntas incómodas.
- **Prototipado rápido de aplicaciones de chat**: desarrolladores pueden integrar el modelo en entornos de prueba donde se requiere una respuesta directa a cualquier prompt, sin preocuparse por rechazos.
- **Evaluación de técnicas de ablación**: el modelo sirve como caso de estudio para comparar el rendimiento de diferentes métodos de eliminación de la dirección de rechazo (Heretic vs. otros enfoques).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card reporta métricas específicas de la ablación:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (evaluación independiente) | 0% |
| Cumplimiento (evaluación independiente) | 100% |
| Divergencia KL (primer token) | 0,0397 |
| Trials de Optuna | 200 |
| Mejor trial (ID) | 141 |
| Cumplimiento en el mejor trial | 86% |
| Divergencia KL en el mejor trial | 0,0392 |

Estas métricas indican que la ablación elimina por completo los rechazos con una pérdida mínima de fidelidad respecto al modelo original, pero no proporcionan información sobre la calidad general de generación de texto, razonamiento o código.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en BF16, los pesos completos ocupan aproximadamente 63,2 GB (31,6B × 2 bytes), por lo que se necesitan al menos 64 GB de VRAM para cargar el modelo sin cuantizar. Con cuantización Q4_K_M (24,3 GB), cabe en una GPU de 24 GB como la RTX 3090 o RTX 4090. Con Q8_0 (33,6 GB) se requiere una GPU de 40 GB o más (A100 40GB, A6000).
- **GPU recomendadas**: para BF16, se recomienda una NVIDIA A100 80GB o H100, o múltiples GPUs en paralelo. Para GGUF Q4_K_M, una RTX 4090 (24 GB) es suficiente. Para Q8_0, una A100 40GB o RTX A6000.
- **Compatibilidad con GPU de consumo**: sí, con cuantización Q4_K_M es posible ejecutarlo en una RTX 3090/4090 (24 GB). Con Q6_K (33,5 GB) no cabe en GPUs de consumo típicas.
- **Opciones de despliegue**: 
  - **Transformers** (PyTorch) para el formato safetensors, con `device_map="auto"` para distribución en múltiples GPUs.
  - **llama.cpp** para los GGUF, con la arquitectura `nemotron_h_moe` (build b10326 o superior).
  - **vLLM** o **TGI** pueden ser compatibles, aunque no se mencionan explícitamente en la documentación.
- **Latencia y throughput**: no se proporcionan datos específicos. Al ser un modelo MoE con solo 3B activos, la inferencia es significativamente más rápida que un modelo denso de 31B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| **Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored** | 31,6B | 3B | no disponible | NVIDIA Open Model License | Variante sin dirección de rechazo |
| **NVIDIA-Nemotron-3.5-Lightning-30B-A3B** (base) | 31,6B | 3B | no disponible | NVIDIA Open Model License | Modelo original con alineación de seguridad |
| **Mixtral 8x7B** (Mistral AI) | 46,7B | 12,9B | 32K | Apache 2.0 | MoE denso, sin ablación, con rechazos estándar |
| **Qwen2.5-32B** (Alibaba) | 32,5B | 32,5B (denso) | 128K | Apache 2.0 | Denso, con alineación, no es MoE |

La comparativa se centra en la categoría de modelos MoE de tamaño similar. El modelo de mlasli se diferencia por su falta de rechazos, lo que lo hace único frente a las alternativas que mantienen alineación de seguridad. No se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- **Eliminación de la alineación de seguridad**: el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito sin restricciones. Su uso debe ser responsable y conforme a las leyes locales.
- **Riesgo de alucinación**: al igual que otros modelos de lenguaje, puede inventar información, especialmente en temas especializados. No se han evaluado sus tasas de alucinación.
- **Longitud de contexto no documentada**: no se especifica la ventana máxima de contexto, lo que dificulta planificar su uso en tareas que requieren secuencias muy largas.
- **Sin cabezal de decodificación especulativa (MTP)**: el modelo fusionado omite el cabezal NextN del modelo base, por lo que la inferencia es de una sola cabeza y no se beneficia de la decodificación especulativa.
- **Restricciones de licencia**: la NVIDIA Open Model License impone condiciones de uso, incluyendo limitaciones en la reventa y la obligación de mantener avisos de copyright. No es una licencia de código abierto estándar.
- **Idiomas limitados**: aunque soporta seis idiomas, el rendimiento puede variar entre ellos; no se han publicado evaluaciones de calidad por idioma.
- **Sin benchmarks de rendimiento general**: no hay datos de MMLU, HumanEval, etc., por lo que no se puede evaluar su calidad en tareas estándar.

## Enlaces

- [Modelo en HuggingFace (BF16)](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-BF16)
- [Modelo base de NVIDIA](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [Repositorio de Heretic (GitHub)](https://github.com/mlabonne/heretic-llm)
- [Cuantización GGUF Q8_0](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q8_0-GGUF)
- [Cuantización GGUF Q6_K](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q6_K-GGUF)
- [Cuantización GGUF Q4_K_M](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q4_K_M-GGUF)
- [Licencia NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
