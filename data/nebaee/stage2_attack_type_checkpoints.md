# Nebaee/stage2_attack_type_checkpoints

## Resumen

El modelo `Nebaee/stage2_attack_type_checkpoints` es un ajuste fino (fine-tuning) de `meta-llama/Llama-Prompt-Guard-2-22M`, un clasificador de texto desarrollado por Meta para la detección de inyecciones de prompts. El nombre sugiere que está orientado a la clasificación de tipos de ataque en prompts, probablemente como parte de un pipeline de seguridad en dos etapas. Sin embargo, la información pública es escasa: la model card es automática, no se especifican los datos de entrenamiento ni las clases objetivo, y no se han publicado resultados de benchmarks.

El modelo tiene 70,8 millones de parámetros, un tamaño considerablemente mayor que el del modelo base (22M), lo que indica que se ha modificado la arquitectura o se ha añadido una cabeza de clasificación más compleja. Está disponible en formato `safetensors` y se distribuye bajo una licencia "other" no especificada. Su relevancia actual radica en la creciente necesidad de proteger sistemas basados en LLM contra ataques de inyección de prompts, aunque la falta de documentación limita su uso directo en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (fine-tuning de Llama-Prompt-Guard-2-22M) |
| Parametros totales | 70.831.107 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Llama-Prompt-Guard-2-22M`, que a su vez está basado en la arquitectura DeBERTa-v2. El proceso de entrenamiento se realizó con el `Trainer` de Hugging Face, utilizando un dataset no especificado (indicado como "None" en la model card). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-5, tamaño de lote de 2 (con acumulación de gradientes de 2, lote efectivo de 4), optimizador AdamW, scheduler lineal y una época. Se usó precisión mixta nativa (AMP). No se mencionan técnicas como RLHF o DPO; se trata de un fine-tuning supervisado estándar.

No se dispone de información sobre la composición del dataset, el número de tokens de entrenamiento ni innovaciones técnicas específicas. El aumento de parámetros respecto al modelo base (de 22M a 70,8M) sugiere que se añadieron capas adicionales, pero no hay detalles públicos al respecto.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación, probablemente para categorizar tipos de ataque en prompts.
- Detección de inyección de prompts: hereda la funcionalidad del modelo base, que clasifica prompts como benignos o maliciosos.
- No se han documentado capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe.
- No se especifica si soporta modos especiales (thinking, vision, audio, etc.).

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado que es un fine-tuning de un clasificador de prompts, se pueden considerar los siguientes usos potenciales, aunque requieren validación:

- Filtrado de prompts en aplicaciones de chat: integrar el modelo como capa de seguridad para clasificar y bloquear intentos de inyección antes de que lleguen al LLM principal.
- Análisis de logs de ataques: usar el modelo para etiquetar automáticamente tipos de ataques en registros de interacciones con sistemas basados en LLM.
- Investigación en seguridad de IA: como herramienta de referencia para estudiar la distribución de tipos de ataque en conjuntos de datos académicos.
- Desarrollo de sistemas de defensa en dos etapas: combinar este clasificador con otro modelo que detecte la presencia de ataques, para luego clasificar su tipo.
- Auditoría de prompts en pipelines de generación de código: detectar prompts maliciosos que intenten inducir al modelo a generar código vulnerable.
- Evaluación de robustez de LLMs: usar el modelo para generar datos de prueba etiquetados con tipos de ataque y medir la resiliencia de otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección `model-index` con resultados vacíos. Los únicos datos de evaluación reportados son:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.3978 |
| F1 (validacion) | 0.6447 |

Estos valores provienen del entrenamiento automático, pero no se comparan con otros modelos ni se detalla el conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: al tener 70,8M de parámetros, en fp32 ocupa aproximadamente 283 MB; en fp16, unos 142 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060 o superiores. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que no requiere hardware especializado.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, exportar a ONNX o convertir a GGUF para ejecución con llama.cpp u Ollama, aunque no hay conversiones oficiales publicadas.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Nebaee/stage2_attack_type_checkpoints | 70,8M | No disponible | other | Clasificacion de tipos de ataque en prompts |
| meta-llama/Llama-Prompt-Guard-2-22M | 22M | 512 tokens (segun documentacion de Meta) | Llama 2 Community License | Deteccion de inyeccion de prompts (binario) |
| ProtectAI/deberta-v3-base-prompt-injection | 184M | 512 tokens | MIT | Deteccion de inyeccion de prompts (binario) |

La comparativa se basa en el propósito similar de clasificación de prompts. El modelo de Nebaee tiene más parámetros que el base, pero no se dispone de datos de rendimiento para comparar. La licencia "other" puede ser más restrictiva que las licencias abiertas de los otros modelos.

## Limitaciones y advertencias

- Falta de documentación: no se especifican las clases de clasificación, el dataset de entrenamiento ni los criterios de evaluación, lo que dificulta su uso fiable en producción.
- Riesgo de sesgos: al no conocer los datos de entrenamiento, no se puede evaluar la presencia de sesgos en las predicciones.
- Alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones incorrectas si los datos de entrenamiento no son representativos.
- Licencia "other": no se especifican los términos exactos; podría restringir el uso comercial o la redistribución. Se recomienda contactar al autor antes de usarlo en entornos empresariales.
- Limitaciones de contexto: no se conoce la longitud máxima de entrada; el modelo base tiene un contexto de 512 tokens, pero el fine-tuning podría haberlo modificado.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a otros clasificadores, por lo que su eficacia relativa es desconocida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Nebaee/stage2_attack_type_checkpoints)
- [Modelo base: meta-llama/Llama-Prompt-Guard-2-22M](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M)

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en la búsqueda web.
