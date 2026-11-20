# AndyLiuys/Ki-OCR

## Resumen

Ki-OCR es un modelo especializado en reconocimiento óptico de caracteres (OCR) de fórmulas matemáticas en su forma visual (displayed-formula), desarrollado por AndyLiuys. Se trata de un derivado destilado de SoMarkAI/OXR-1.0, cuyo código y configuración han sido adaptados para el nuevo modelo, incluyendo cambios de registro y compatibilidad de carga. El modelo cuenta con aproximadamente 1.380 millones de parámetros (1.378.795.752 exactos según los pesos en safetensors) y un tamaño de repositorio de 2,8 GB.

El problema que aborda es la transcripción automática de fórmulas matemáticas presentadas en imágenes a su representación textual (presumiblemente LaTeX o similar), una tarea crítica en digitalización de documentación científica, procesamiento de apuntes y accesibilidad. La relevancia actual radica en que la conversión fiable de fórmulas visuales a texto estructurado sigue siendo un cuello de botella en pipelines de extracción de conocimiento científico.

La innovación principal del modelo es su proceso de entrenamiento mediante destilación on-policy (On-Policy Distillation, OPD), donde OXR-1.0 actúa como estudiante y MiniCPM-OCR 1.0 como profesor, sobre un conjunto de datos reducido y específico (IBEM500). La licencia es la OXR License, con términos de atribución a SoMark que permanecen aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de SoMarkAI/OXR-1.0; tag `ki_ocr` con `custom_code`) |
| Parametros totales | 1.378.795.752 (aprox. 1,38 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | OXR License (`oxr-license`, etiquetada como `other`); incluye Apache License 2.0 en archivo separado |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ki-OCR es un derivado destilado de SoMarkAI/OXR-1.0. La model card indica que el código y la configuración del modelo se han adaptado para Ki-OCR, incluyendo cambios en el registro del modelo y en la compatibilidad de carga, lo que sugiere que la arquitectura subyacente es la de OXR-1.0 con modificaciones de integración. No se especifica en la información disponible si la arquitectura es un transformer puro, un modelo híbrido o si incorpora mecanismos de atención lineal; el tag `custom_code` indica que requiere código personalizado para su carga.

El entrenamiento se realizó sobre IBEM500, un conjunto de 500 imágenes de fórmulas en forma visual (displayed-formula) seleccionadas de IBEM-v1-cropped, que a su vez deriva del dataset original IBEM. La técnica de entrenamiento es On-Policy Distillation (OPD), con OXR-1.0 como modelo estudiante y MiniCPM-OCR 1.0 como modelo profesor. No se proporcionan datos sobre el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Reconocimiento óptico de fórmulas matemáticas en imágenes (displayed-formula) y transcripción a texto estructurado.
- Especialización en un dominio acotado: fórmulas presentadas en forma visual, no OCR general de texto.
- Capacidad de destilación de un modelo profesor de OCR (MiniCPM-OCR 1.0) hacia un estudiante de menor tamaño.
- No se documentan capacidades de tool calling, function calling ni soporte de agentes.
- No se documentan capacidades multilingües explícitas.
- No se documentan modos de razonamiento (thinking mode), visión general, audio ni otras modalidades.

## Casos de uso

- Digitalización de documentación científica: el modelo transcribe fórmulas matemáticas extraídas de artículos y papers a texto estructurado, facilitando la indexación y búsqueda de contenido matemático en repositorios.
- Procesamiento de apuntes manuscritos o escaneados: conversión de fórmulas presentes en imágenes de cuadernos o pizarras a formato editable para su inclusión en documentos digitales.
- Accesibilidad: generación de descripciones textuales de fórmulas para lectores de pantalla y herramientas de asistencia a personas con discapacidad visual.
- Extracción de conocimiento en pipelines de investigación: integración en flujos automáticos que convierten PDFs escaneados en bases de datos de fórmulas consultables.
- Enriquecimiento de datasets de entrenamiento: uso del modelo para generar pares imagen-fórmula que alimenten otros sistemas de OCR o de razonamiento matemático.
- Verificación y control de calidad en editoriales científicas: transcripción automática de fórmulas para comparar con el texto original y detectar erratas en la composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,38 mil millones de parámetros, en FP16 requeriría aproximadamente 2,8 GB solo para los pesos, y en cuantización de 8 bits alrededor de 1,4 GB, más el overhead de activaciones y del código personalizado.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 para despliegues de mayor throughput.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, aunque no confirmada oficialmente.
- Opciones de despliegue: no se documentan; el tag `custom_code` sugiere que requiere cargar el código del repositorio y puede no ser compatible directamente con vLLM, llama.cpp, Ollama o TGI sin adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ki-OCR | ~1,38 mil millones | No disponible | OXR License | Derivado destilado de OXR-1.0, especializado en fórmulas |
| SoMarkAI/OXR-1.0 | No disponible | No disponible | No disponible | Modelo base del que deriva Ki-OCR |
| MiniCPM-OCR 1.0 | No disponible | No disponible | No disponible | Modelo profesor usado en la destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en fórmulas matemáticas en forma visual; no es un OCR general y no se documenta su comportamiento con texto corrido, tablas u otras estructuras.
- El entrenamiento se realizó sobre un conjunto muy reducido (500 imágenes), lo que puede limitar la generalización a dominios, estilos tipográficos o calidades de imagen distintos de los del dataset IBEM.
- No se documentan sesgos conocidos, pero al ser un modelo de OCR especializado, los errores se manifestarán como transcripciones incorrectas de símbolos, subíndices o superíndices.
- Riesgo de alucinación: no se documenta, aunque en modelos de OCR la generación de contenido no presente en la imagen es un riesgo relevante que conviene validar.
- La licencia OXR License es de tipo `other` y no equivale a una licencia permisiva estándar; los términos de atribución a SoMark permanecen aplicables, y el uso comercial debe verificarse contra el archivo `LICENSE` del repositorio.
- El modelo requiere código personalizado (`custom_code`) para su carga, lo que puede complicar su integración en frameworks de despliegue estándar.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en escenarios multilingües o con documentos extensos.

## Enlaces

- Hugging Face: https://huggingface.co/AndyLiuys/Ki-OCR
- Modelo base SoMarkAI/OXR-1.0: https://huggingface.co/SoMarkAI/OXR-1.0
- Modelo profesor MiniCPM-OCR 1.0: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Repositorio GitHub Ki-OCR: https://github.com/AndyLiuYS-AI/Ki-OCR
- Repositorio GitHub SoMark OXR: https://github.com/SoMarkAI/OXR
- Dataset IBEM-v1-cropped: https://huggingface.co/datasets/deepcopy/IBEM-v1-cropped
- Dataset original IBEM (DOI): https://doi.org/10.5281/zenodo.7963703
