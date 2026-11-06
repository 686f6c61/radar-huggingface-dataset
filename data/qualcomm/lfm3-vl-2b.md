# qualcomm/LFM3-VL-2B

## Resumen

LFM3-VL-2B es un modelo de visión-lenguaje (VLM) desarrollado por Liquid AI y distribuido por Qualcomm en un repositorio optimizado para dispositivos con chipsets Snapdragon. El modelo original entiende texto e imágenes, lo que le permite resolver tareas como respuesta a preguntas visuales (VQA), generación de descripciones de imágenes y reconocimiento óptico de caracteres (OCR). Este repositorio de Qualcomm no contiene los pesos originales en formato estándar, sino artefactos pre-exportados y compilados para su despliegue en dispositivos móviles y de cómputo de Qualcomm mediante el runtime GenieX.

La relevancia de esta ficha radica en su enfoque de despliegue en el borde (edge): el modelo se distribuye en cuantización q4_0 dentro de un GGUF específico para el runtime GENIEX_LLAMACPP, con métricas de rendimiento publicadas por Qualcomm para distintos chipsets (Snapdragon 8 Elite, 8 Elite Gen 5, X Elite y X2 Elite). Con 2.000 millones de parámetros, está pensado para inferencia local en hardware de gama alta sin depender de la nube.

No se dispone de información detallada sobre la arquitectura interna, la composición del dataset de entrenamiento ni los idiomas soportados en la documentación proporcionada; la model card se centra en el proceso de exportación y despliegue más que en las características del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje; implementación base en LiquidAI/LFM3-VL-2B) |
| Parámetros totales | 2.000 millones (según el nombre del modelo; cifra exacta no disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512 y 4096 tokens evaluados en las métricas de rendimiento; máximo no confirmado |
| Tipos de cuantización | q4_0 (única precisión publicada en los assets pre-exportados) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; consultar términos del autor) |
| Formato de pesos | GGUF (LFM3-VL-2B-QAD-Q4_0.gguf); exportación personalizada vía Qualcomm AI Hub Models |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, encoder visual, etc.). Se sabe que es un modelo de visión-lenguaje de 2.000 millones de parámetros desarrollado por Liquid AI, y que el repositorio de Qualcomm contiene una implementación derivada de la versión original publicada en LiquidAI/LFM3-VL-2B. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable de este repositorio no está en el entrenamiento, sino en el pipeline de despliegue: Qualcomm AI Hub Models permite compilar y exportar el modelo con configuraciones personalizadas (pesos ajustados, formas de entrada, dispositivo y runtime objetivo), y el runtime GenieX ejecuta el modelo cuantizado en q4_0 sobre chipsets Snapdragon. El asset publicado emplea el runtime GENIEX_LLAMACPP con cuantización q4_0 y chipset "Universal".

## Capacidades

- Comprensión conjunta de texto e imágenes (modelo de visión-lenguaje).
- Respuesta a preguntas visuales (visual question answering).
- Generación de descripciones de imágenes (image captioning).
- Reconocimiento óptico de caracteres (OCR).
- Generación de texto condicionada por entrada multimodal.
- Despliegue en dispositivo con el runtime GenieX sobre chipsets Snapdragon.
- Soporte de exportación con configuraciones personalizadas mediante la librería Qualcomm AI Hub Models.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, modo thinking ni soporte multilingüe detallado.

## Casos de uso

- Respuesta a preguntas visuales en movilidad: el modelo puede procesar una imagen capturada por la cámara del dispositivo y responder preguntas sobre su contenido, aprovechando la inferencia local en Snapdragon para evitar el envío de imágenes a la nube.
- Reconocimiento óptico de caracteres en el dispositivo: digitalización de documentos, tickets o carteles directamente en el terminal, con latencia de primera token publicada entre 0,04 y 19,3 segundos según chipset y longitud de contexto.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo para fotos en aplicaciones móviles, ejecutando el modelo cuantizado en q4_0 sobre el propio dispositivo.
- Asistentes de cámara en tiempo real: análisis de la escena capturada y generación de respuestas en lenguaje natural, con tasas de generación de hasta 87,3 tokens por segundo en Snapdragon X2 Elite con contexto de 512 tokens.
- Procesamiento de documentos en portátiles con Snapdragon X Elite: extracción y descripción de contenido visual en flujos de trabajo de oficina, con contexto de hasta 4096 tokens y tasas de 31 a 55 tokens por segundo.
- Prototipado y evaluación en hardware Qualcomm: uso del repositorio y de Qualcomm AI Hub Workbench para compilar, perfilar y evaluar el modelo en dispositivos alojados antes de integrarlo en un producto.
- Integración en aplicaciones Android: el tag `android` y el runtime GenieX permiten desplegar el modelo en aplicaciones móviles nativas con pesos pre-exportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente incluye métricas de rendimiento de inferencia (tokens por segundo y tiempo hasta el primer token) por chipset y longitud de contexto:

| Chipset | Contexto | Tasa de respuesta (tokens/s) | TTFT (s) |
|---|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy | 512 | 50,72 | 0,30 - 1,19 |
| Snapdragon 8 Elite Gen 5 for Galaxy | 4096 | 40,38 | 0,60 - 19,34 |
| Snapdragon 8 Elite for Galaxy | 512 | 51,52 | 0,32 - 1,30 |
| Snapdragon 8 Elite for Galaxy | 4096 | 36,67 | 0,58 - 18,48 |
| Snapdragon X2 Elite | 512 | 87,34 | 0,09 - 0,36 |
| Snapdragon X2 Elite | 4096 | 70,60 | 0,14 - 4,41 |
| Snapdragon X Elite | 512 | 57,00 | 0,31 - 1,25 |
| Snapdragon X Elite | 4096 | 54,74 | 0,38 - 12,32 |

Los rangos de TTFT corresponden a distintas longitudes de prompt dentro de cada configuración de contexto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo de 2.000 millones de parámetros en q4_0, la huella de pesos ronda los 1,2-1,5 GB, aunque la memoria total depende del runtime y del contexto.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está optimizado para NPU/CPU de chipsets Qualcomm Snapdragon (8 Elite, 8 Elite Gen 5, X Elite, X2 Elite).
- Cabe en hardware de consumo: sí, en dispositivos con los chipsets Snapdragon indicados; no se documenta soporte para GPU NVIDIA o AMD en este repositorio.
- Opciones de despliegue: runtime GenieX (GENIEX_LLAMACPP) con el asset GGUF pre-exportado; exportación personalizada mediante la librería Qualcomm AI Hub Models y Qualcomm AI Hub Workbench.
- Latencia y throughput: ver tabla de benchmarks; el throughput varía entre aproximadamente 31 y 87 tokens por segundo según chipset y contexto, con TTFT desde 0,04 s hasta 19,3 s en los casos de contexto largo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, ni de datos de rendimiento de calidad que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; se recomienda evaluar el modelo en el dominio objetivo antes de producción.
- El repositorio contiene artefactos optimizados exclusivamente para hardware Qualcomm; no se garantiza su funcionamiento en otras plataformas.
- Solo se publica una precisión (q4_0); la pérdida de calidad frente a los pesos originales en mayor precisión no está cuantificada.
- La licencia es "other", con términos personalizados; es imprescindible revisar las condiciones del autor antes de un uso comercial.
- El contexto máximo confirmado en las métricas es de 4096 tokens; no se documenta una ventana mayor.
- El TTFT en contexto de 4096 tokens puede alcanzar valores altos (hasta 19,3 s en Snapdragon 8 Elite Gen 5), lo que condiciona la experiencia en aplicaciones interactivas.
- No se dispone de información sobre el soporte multilingüe ni sobre capacidades de tool calling o agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qualcomm/LFM3-VL-2B
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Pesos GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF/resolve/main/LFM3-VL-2B-QAD-Q4_0.gguf
- Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/lfm3_vl_2b
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/lfm3_vl_2b
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Guía de inicio de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
