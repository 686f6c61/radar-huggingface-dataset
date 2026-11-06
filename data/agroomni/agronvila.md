# AgroOmni/AgroNVILA

## Resumen

AgroNVILA es un modelo vision-lenguaje multimodal especializado en agricultura y teledetección, desarrollado por AgroOmni. Se construye mediante fine-tuning supervisado (SFT) del modelo base NVILA-Lite-8B sobre el corpus AgroOmni y, posteriormente, se alinea con Group Relative Policy Optimization (GRPO), una variante de aprendizaje por refuerzo con retroalimentación. El resultado es el checkpoint final de una familia de dos modelos: el SFT puro (AgroNVILA-SFT) y este checkpoint alineado con GRPO.

El modelo aborda tareas de razonamiento visual sobre imágenes agrícolas y de satélite: detección de anomalías en cultivos, delimitación de parcelas, estadísticas de superficie y razonamiento con indicaciones visuales. Su relevancia radica en la combinación de un backbone multimodal eficiente de 8B parámetros con un corpus de dominio de 268.119 pares pregunta-respuesta sobre 97.926 imágenes, y en el uso de GRPO con recompensas específicas por tarea para mejorar la precisión frente al SFT.

La arquitectura subyacente es LLaVA-Llama (vision encoder más LLM), heredada de NVILA-Lite-8B, con licencia Apache-2.0. El modelo solo declara soporte para inglés y está publicado en formato safetensors con un tamaño de repositorio de 16,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-Llama (vision-lenguaje multimodal), base NVILA-Lite-8B |
| Parametros totales | 8B (heredados del modelo base NVILA-Lite-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AgroNVILA parte de NVILA-Lite-8B, un modelo multimodal de tipo LLaVA-Llama que combina un codificador visual con un LLM de 8B parámetros. El entrenamiento se realiza en dos etapas. La primera es un fine-tuning supervisado sobre el corpus AgroOmni, compuesto por 268.119 pares de pregunta y respuesta asociados a 97.926 imágenes de dominio agrícola y de teledetección. La segunda etapa aplica GRPO (Group Relative Policy Optimization) con recompensas específicas por tarea, con el objetivo de alinear las respuestas del modelo con los criterios de evaluación del benchmark AgroMind.

La innovación principal es el uso de GRPO con recompensas diseñadas para tareas agrícolas concretas, lo que permite una mejora medible aunque moderada sobre el checkpoint SFT (de 59,52 a 59,86 de media global en AgroMind). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento visual sobre imágenes agrícolas y de satélite.
- Detección y razonamiento sobre anomalías en cultivos (Anomaly Reasoning).
- Detección de límites y delimitación de parcelas (Boundary Detection).
- Cálculo y estimación de estadísticas de área (Area Statistics).
- Razonamiento con indicaciones visuales, incluyendo preguntas que referencian regiones concretas de la imagen (Visual Prompt Reasoning).
- Procesamiento multimodal imagen-texto en inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de pensamiento explícito.

## Casos de uso

- Monitorización de cultivos por satélite: el modelo puede analizar imágenes de teledetección y responder preguntas sobre el estado de las parcelas, apoyándose en su especialización en razonamiento sobre anomalías para detectar estrés hídrico o plagas.
- Delimitación automática de parcelas agrícolas: gracias a su capacidad de Boundary Detection, puede asistir en la generación de polígonos de parcelas a partir de imágenes aéreas para catastros o sistemas de gestión de explotaciones.
- Estimación de superficies cultivadas: la capacidad de Area Statistics permite responder consultas sobre extensión de cultivos en una imagen, útil para informes agrarios y planificación de recursos.
- Asistencia a técnicos agrónomos: un asistente conversacional en inglés que interpreta fotografías de campo tomadas por el agricultor y responde preguntas sobre síntomas visibles en las plantas.
- Análisis de imágenes con indicaciones visuales: integración en herramientas donde el usuario señala una región de la imagen (por ejemplo, una zona concreta de un mapa de satélite) y formula una pregunta sobre ella, aprovechando Visual Prompt Reasoning.
- Investigación en visión-lenguaje aplicada a agricultura: sirve como punto de partida para experimentos de alineación con RL en dominios de teledetección, dado que se publican tanto el checkpoint SFT como el alineado con GRPO y el código de entrenamiento.
- Evaluación comparativa de modelos multimodales en dominio agrícola: útil como referencia en pipelines de benchmarking con AgroMind para medir la brecha entre SFT y RL en tareas de percepción remota.

## Benchmarks y rendimiento

Resultados publicados en el benchmark AgroMind (13 tareas, micro-media global):

| Benchmark / tarea | AgroNVILA (GRPO) | AgroNVILA-SFT |
|---|---|---|
| AgroMind (global) | 59,86 | 59,52 |
| Anomaly Reasoning | 75,74 | no disponible |
| Boundary Detection | 58,02 | no disponible |
| Area Statistics | 70,18 | no disponible |
| Visual Prompt Reasoning | 55,63 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo multimodal de 8B parámetros, en FP16 se requieren aproximadamente 16 GB de VRAM solo para los pesos, más el codificador visual y el espacio de activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar uso en A100, H100 o GPUs consumer de gama alta con suficiente VRAM, pero no hay datos confirmados.
- ¿Cabe en GPU consumer? No confirmado. Un modelo de 8B en cuantización de 8 bits o inferior podría caber en GPUs con 12-24 GB, pero no se documentan cuantizaciones ni requisitos oficiales.
- Opciones de despliegue: la model card solo muestra la carga mediante `llava.model.builder.load_pretrained_model` con el tipo `llava_llama`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgroNVILA | 8B | no disponible | Agricultura y teledetección | Apache-2.0 | Hugging Face |
| NVILA-Lite-8B (base) | 8B | no disponible | Multimodal general | Apache-2.0 (heredada) | Hugging Face |
| AgroNVILA-SFT | 8B | no disponible | Agricultura y teledetección | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Es un modelo de dominio específico (agricultura y teledetección); su rendimiento en tareas generales puede degradarse respecto al base NVILA-Lite-8B.
- Riesgo de alucinación inherente a los modelos vision-lenguaje, especialmente en la interpretación de imágenes ambiguas o de baja resolución.
- La mejora de GRPO sobre SFT es moderada (0,34 puntos en la media global de AgroMind), por lo que la ganancia práctica puede ser limitada en algunas tareas.
- No se documentan sesgos conocidos, pero el corpus de entrenamiento (AgroOmni) puede introducir sesgos geográficos o de tipo de cultivo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del modelo NVILA-Lite-8B y de los datos de entrenamiento.
- No se especifican la longitud de contexto ni las cuantizaciones soportadas, lo que dificulta planificar despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/AgroOmni/AgroNVILA
- Checkpoint SFT: https://huggingface.co/AgroOmni/AgroNVILA-SFT
- Dataset AgroOmni: https://huggingface.co/datasets/AgroOmni/AgroOmni
- Modelo base: https://huggingface.co/Efficient-Large-Model/NVILA-Lite-8B
- Código: https://github.com/Jrookie2005/AgroOmni
