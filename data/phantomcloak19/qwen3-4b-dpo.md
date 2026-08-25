# Phantomcloak19/qwen3-4b-dpo

## Resumen

`Phantomcloak19/qwen3-4b-dpo` es un modelo de lenguaje de 4 mil millones de parámetros, resultado de un fine-tuning con *Direct Preference Optimization* (DPO) sobre el modelo base `Qwen/Qwen3-4B`. Ha sido desarrollado por el usuario Phantomcloak19 dentro de un pipeline de entrenamiento secuencial que contempla tres fases: SFT (supervised fine-tuning), DPO y Safety-GRPO. Según la model card, el checkpoint publicado corresponde al resultado tras la fase DPO, fusionado en precisión completa (full precision).

El modelo está orientado a generación de texto y conversación, aunque no se detallan en la documentación disponible las capacidades específicas, idiomas soportados ni licencia. Es relevante como ejemplo de aplicación de la técnica DPO para alinear un modelo base de tamaño medio, y su disponibilidad en formato `safetensors` permite su despliegue en entornos de inferencia estándar. No obstante, la información pública es limitada y no se aportan métricas de rendimiento ni especificaciones técnicas detalladas más allá de su origen y parámetros totales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la de `Qwen/Qwen3-4B`, sin detalles públicos) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con pesos `safetensors`, se desconoce la precisión exacta) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública indica que el modelo es un *fine-tune* del checkpoint `Qwen/Qwen3-4B` mediante un proceso de DPO, ejecutado como segunda fase de un pipeline denominado `LLMPR` (posiblemente HorusLLM, según aparece en la página de FriendliAI). El pipeline consta de tres etapas secuenciales: SFT → DPO → Safety-GRPO. El checkpoint publicado es el resultado de la fase DPO, con pesos fusionados en precisión completa.

No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento, la configuración del optimizador ni las técnicas de regularización empleadas. Tampoco se indica si se aplicaron métodos de alineación adicionales (RLHF, etc.) más allá del propio DPO. Por tanto, la arquitectura interna y los detalles de entrenamiento quedan sin especificar.

## Capacidades

No se han documentado capacidades específicas del modelo en la model card ni en los resultados de búsqueda. Al ser un *fine-tuning* de Qwen3-4B, se espera que herede las capacidades generales de este modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay confirmación oficial ni datos verificables sobre el comportamiento real de este checkpoint. Por tanto, se indica:

- Generación de texto: no confirmado explícitamente, aunque es el pipeline declarado.
- Razonamiento, código, matemáticas: no documentado.
- Tool calling / function calling: no disponible.
- Soporte para agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking o capacidades especiales: no disponible.

## Casos de uso

Dado que no hay documentación específica, los casos de uso son propuestas razonables basadas en el tipo de modelo (un LLM conversacional de 4B parámetros) y en la técnica DPO (que suele mejorar la alineación con preferencias humanas). Sin embargo, no existe evidencia pública que garantice el rendimiento en estos escenarios:

- Asistente conversacional: podría utilizarse en chatbots para generar respuestas coherentes y útiles, aunque no se han reportado pruebas de robustez en diálogos multi-turno.
- Generación de texto en aplicaciones de contenido (resúmenes, redacción): un modelo de 4B puede ser suficiente para tareas de redacción sencillas, pero no hay validación.
- Soporte técnico automatizado: en principio podría responder preguntas frecuentes, pero sin datos de evaluación no se puede confirmar su precisión.
- Generación de código asistida: el modelo base Qwen3 tiene capacidades de código, pero este checkpoint no las garantiza.
- Ajuste fino adicional para tareas específicas: al ser un checkpoint intermedio del pipeline, podría servir como base para más entrenamiento, aunque su licencia y permisos no están claros.
- Investigación en alineación DPO: el modelo es útil como ejemplo de aplicación de DPO en un modelo de 4B, para estudios comparativos de técnicas de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint concreto.

## Requisitos de hardware

Los siguientes son estimaciones orientativas basadas en el tamaño de parámetros (4,022 M) y suponiendo que los pesos se sirven en `fp16` o cuantizados. No hay datos oficiales del autor.

- VRAM estimada para inferencia:
  - `fp16` (pesos sin cuantizar): ~8 GB para los pesos, más overhead de activaciones, por lo que se recomienda al menos 10-12 GB de VRAM.
  - Cuantización `8-bit`: ~4 GB.
  - Cuantización `4-bit`: ~2-3 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o A100 (40/80 GB) para ejecución en `fp16` con margen de contexto. Para cuantización 4-bit, una GPU con 6-8 GB podría ser suficiente (por ejemplo RTX 3060).
- Si cabe en consumer GPU: sí, en cuantizaciones bajas (4-bit) cabe en GPUs de gama media con 8 GB, aunque el rendimiento dependerá del contexto y la implementación.
- Opciones de despliegue: al ser un modelo de `transformers` con pesos `safetensors`, es compatible con `vLLM`, `TGI`, `Ollama` (si se convierte a GGUF), `llama.cpp` (tras conversión) y `text-generation-inference`. No se han publicado configuraciones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo para comparar con alternativas. Como referencia estructural, se puede comparar con el modelo base `Qwen/Qwen3-4B` y con otros modelos de ~4B parámetros, pero no hay información de benchmarks ni licencias para establecer una tabla comparativa objetiva. La comparación queda pendiente de publicaciones de resultados.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado, pero como cualquier LLM entrenado con datos web, puede heredar sesgos sociales, culturales o de género.
- **Riesgo de alucinación**: no se ha evaluado; es un riesgo inherente a los modelos generativos.
- **Limitaciones de contexto**: la longitud de contexto no está especificada, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas o documentos extensos.
- **Restricciones de licencia**: la licencia es "no disponible"; esto impide su uso comercial sin verificación legal previa.
- **Caveats para producción**: al ser un checkpoint intermedio de un pipeline, no hay garantías de robustez, seguridad ni calidad de respuestas. No se recomienda su uso en producción sin una evaluación exhaustiva.

## Enlaces

- [Hugging Face - Phantomcloak19/qwen3-4b-dpo](https://huggingface.co/Phantomcloak19/qwen3-4b-dpo)
- [FriendliAI - qwen3-4b-dpo](https://friendli.ai/models/Phantomcloak19/qwen3-4b-dpo)
- [Antbase - Qwen3 4b Dpo V2](https://antbase.ai/models/qwen3-4b-dpo-v2)
- [Hugging Face - Phantomcloak19/qwen3-dpo-grpo](https://huggingface.co/Phantomcloak19/qwen3-dpo-grpo) (modelo hermano del mismo pipeline)
