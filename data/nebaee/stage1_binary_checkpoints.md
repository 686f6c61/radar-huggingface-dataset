# Nebaee/stage1_binary_checkpoints

## Resumen

El modelo `Nebaee/stage1_binary_checkpoints` es un clasificador de texto binario obtenido mediante fine-tuning de `meta-llama/Llama-Prompt-Guard-2-22M`, un modelo de Meta especializado en la detección de inyecciones de prompts y contenido malicioso en entradas de modelos de lenguaje. El nombre "stage1_binary" sugiere que forma parte de un pipeline de seguridad en varias etapas, donde esta primera fase clasifica si un prompt es benigno o sospechoso. Con 70,8 millones de parámetros, es un modelo ligero y rápido, adecuado para filtrar entradas en tiempo real antes de pasarlas a un LLM más grande.

La relevancia actual de este modelo radica en la creciente necesidad de proteger aplicaciones basadas en LLM frente a ataques de prompt injection, que buscan manipular el comportamiento del modelo mediante instrucciones maliciosas. Al ser un fine-tune de un modelo ya diseñado para esta tarea, hereda su arquitectura de encoder transformer (etiquetado como DeBERTa-v2) y su enfoque de clasificación. Sin embargo, la información pública es muy limitada: no se especifica el dataset de entrenamiento, la licencia exacta ni se publican benchmarks estándar, lo que dificulta una evaluación independiente de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2) con head de clasificación binaria |
| Parametros totales | 70.830.722 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32 probablemente) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `meta-llama/Llama-Prompt-Guard-2-22M`, un encoder transformer de 22 millones de parámetros diseñado por Meta para clasificar prompts. El fine-tuning añade una capa de clasificación binaria, lo que eleva el total a 70,8 millones de parámetros. Los tags de HuggingFace indican que la arquitectura subyacente es DeBERTa-v2, aunque no se confirma si el modelo base original usa exactamente esa variante. El entrenamiento se realizó con una sola época, un learning rate de 2e-05, batch size efectivo de 4 (con acumulación de gradientes de 2), optimizador AdamW y scheduler lineal. Se usó precisión mixta nativa (AMP). El dataset de entrenamiento no está especificado en la model card, lo que impide conocer la composición y el volumen de datos.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El proceso es un fine-tuning supervisado estándar para clasificación de texto. La pérdida de validación final fue de 0,1929, con F1 de 0,9596 y accuracy de 0,964, según los datos reportados por el autor.

## Capacidades

- Clasificación binaria de texto: el modelo asigna una etiqueta (probablemente "benigno" vs "malicioso") a cada prompt de entrada.
- Detección de inyecciones de prompts: hereda la función del modelo base Llama-Prompt-Guard-2-22M, orientado a identificar intentos de manipulación de LLMs.
- Procesamiento de texto en inglés (presumiblemente, aunque no se confirma): el modelo base de Meta está entrenado principalmente en inglés.
- Inferencia rápida: al ser un modelo pequeño (70,8M parámetros), puede ejecutarse en CPU o GPU de baja gama con latencia baja.
- No soporta generación de texto, tool calling, agentes, visión ni audio. Es exclusivamente un clasificador.

## Casos de uso

- Filtrado de prompts en aplicaciones LLM: integrar el modelo como paso previo a un LLM generativo para bloquear entradas que contengan instrucciones maliciosas o intentos de prompt injection, reduciendo el riesgo de respuestas no deseadas.
- Moderación de contenido en chatbots: clasificar mensajes de usuarios en tiempo real para detectar contenido abusivo o manipulador antes de que llegue al modelo de conversación.
- Pipeline de seguridad en varias etapas: como sugiere el nombre "stage1", puede usarse como primera capa de un sistema de defensa, descartando rápidamente prompts obvios y pasando los dudosos a un clasificador más complejo.
- Auditoría de logs de prompts: procesar históricos de interacciones con LLMs para identificar intentos de ataque y mejorar las políticas de seguridad.
- Evaluación de datasets de prompts: clasificar grandes volúmenes de texto para etiquetar automáticamente ejemplos maliciosos en la creación de datasets de entrenamiento.
- Protección de APIs de LLM: desplegar el modelo como un proxy de filtrado en servicios que exponen modelos de lenguaje, evitando que usuarios malintencionados exploten vulnerabilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor reporta únicamente métricas de validación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 0,1929 |
| F1 | 0,9596 |
| Accuracy | 0,964 |

Estos valores corresponden al conjunto de evaluación usado por el autor, pero no se especifica su composición ni se comparan con otros modelos. No se puede establecer una comparación objetiva con alternativas sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: con 70,8M parámetros en fp32, el modelo ocupa aproximadamente 283 MB. En cuantización int8 (si estuviera disponible) bajaría a ~71 MB, y en int4 a ~36 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA GTX 1050 Ti o superior puede ejecutarlo sin problemas. También funciona en CPU con latencia aceptable (inferencia en milisegundos).
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como FastAPI con la librería `transformers`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no se dispone de mediciones oficiales. Dado el tamaño, se estima una latencia de 5-20 ms por muestra en GPU y 50-200 ms en CPU, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nebaee/stage1_binary_checkpoints | 70,8M | no disponible | Clasificación binaria de prompts | other | HuggingFace |
| meta-llama/Llama-Prompt-Guard-2-22M | 22M | no disponible | Clasificación de prompts (inyección, jailbreak, etc.) | Llama License | HuggingFace |
| ProtectAI/deberta-v3-base-prompt-injection | 184M | 512 tokens | Detección de inyección de prompts | MIT | HuggingFace |

El modelo base de Meta tiene menos parámetros y una licencia más clara (Llama License), mientras que el de ProtectAI es más grande y está específicamente entrenado para inyección de prompts. El modelo de Nebaee añade una capa de clasificación binaria, pero su licencia "other" es ambigua y su rendimiento comparativo no está documentado.

## Limitaciones y advertencias

- Licencia incierta: la etiqueta "other" no especifica los términos de uso. No se recomienda su uso comercial sin aclarar la licencia con el autor.
- Dataset de entrenamiento desconocido: no se indica qué datos se usaron para el fine-tuning, lo que impide evaluar posibles sesgos o la cobertura de distintos tipos de ataques.
- Sin benchmarks independientes: las métricas reportadas (F1, accuracy) provienen del autor y no han sido validadas externamente.
- Riesgo de falsos positivos/negativos: como clasificador binario, puede bloquear prompts legítimos o dejar pasar ataques sofisticados. No es una solución completa de seguridad.
- Limitación de idioma: el modelo base de Meta está entrenado principalmente en inglés; su rendimiento en otros idiomas no está garantizado.
- Contexto limitado: no se especifica la longitud máxima de entrada, pero los modelos DeBERTa suelen tener ventanas de 512 tokens, lo que limita el análisis de prompts largos.
- No apto para producción sin evaluación previa: dado el desconocimiento del dataset y la falta de pruebas, se recomienda validar el modelo en el dominio específico antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nebaee/stage1_binary_checkpoints
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M
- Repositorio de configuración relacionado (referencia externa): https://github.com/Povendhan-robotics/ai_competition_housekeeping/blob/main/configs/stage1_binary.yaml
