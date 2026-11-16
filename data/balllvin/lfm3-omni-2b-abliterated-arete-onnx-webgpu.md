# balllvin/LFM3-Omni-2B-Abliterated-Arete-ONNX-WebGPU

## Resumen

LFM3-Omni-2B-Abliterated-Arete-ONNX-WebGPU es una exportación a formato ONNX del modelo LFM3-Omni-2B-Abliterated-Arete-NVFP4-MLX, publicado por el usuario balllvin en Hugging Face. Se trata de una conversión orientada a la ejecución en navegador mediante WebGPU a través de onnxruntime-web, lo que permite desplegar un modelo multimodal de 2.000 millones de parámetros (entrada imagen-texto a texto) directamente en el cliente sin necesidad de infraestructura de servidor dedicada. El pipeline declarado es image-text-to-text, lo que confirma que el modelo conserva capacidades de visión además de generación de texto.

El modelo deriva de la familia LFM3-Omni de Liquid AI, aunque el sufijo "Abliterated" indica que se ha aplicado un proceso de modificación (habitualmente eliminación o atenuación de mecanismos de rechazo o alineación) sobre los pesos originales, y "Arete" hace referencia a un fine-tuning o variante concreta del publicador. La cadena de conversiones incluye un paso previo a NVFP4/MLX (formato de cuantización de 4 bits optimizado para Apple Silicon) y una exportación posterior a ONNX para WebGPU.

La relevancia de esta ficha radica en su carácter de artefacto de despliegue: no se trata de un modelo entrenado desde cero, sino de un contenedor optimizado para inferencia en el navegador. El repositorio es de acceso restringido (gated), requiere aceptar condiciones en Hugging Face, y su licencia declarada es lfm1.0, la licencia propia de Liquid AI para la familia LFM. El tamaño del repositorio es de 1,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3-Omni; transformer multimodal, detalles no publicados) |
| Parametros totales | 2B (según el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (modelo base MLX); exportación ONNX para WebGPU (precisión exacta no disponible) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, etiquetada como "other" en HF) |
| Formato de pesos | ONNX (onnxruntime / onnxruntime-web) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. Por el nombre y la familia (LFM3-Omni), se trata de un modelo multimodal de la saga LFM3 de Liquid AI, con capacidad de procesar imagen y texto y generar texto. El pipeline declarado en Hugging Face es image-text-to-text, lo que confirma la entrada multimodal. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información disponible.

El artefacto publicado es el resultado de una cadena de transformaciones: el modelo base LFM3-Omni-2B-Abliterated-Arete-NVFP4-MLX (una variante cuantizada a NVFP4 para MLX, presumiblemente con modificaciones de alineación del sufijo "Abliterated") se exporta a ONNX para su ejecución con onnxruntime-web sobre WebGPU. La innovación técnica destacable es precisamente esta: permitir inferencia multimodal de un modelo de 2B en el navegador del cliente mediante WebGPU, con un repositorio de 1,6 GB. No se dispone de información sobre técnicas de decodificación especulativa, atención lineal u otras optimizaciones internas.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline conversational declarado).
- Comprensión de imágenes y texto combinados (image-text-to-text), lo que habilita tareas de descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento sobre contenido visual.
- Ejecución en navegador mediante WebGPU y onnxruntime-web, sin backend de servidor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades especiales: no disponible en la información proporcionada (el nombre "Omni" sugiere multimodalidad amplia, pero no se confirma en los datos).

## Casos de uso

- Asistentes conversacionales en el navegador: al ejecutarse con onnxruntime-web sobre WebGPU, el modelo puede gestionar diálogos multi-turno directamente en el cliente, sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones de privacidad sensible (salud, finanzas personales, educación).
- Descripción y análisis de imágenes en el cliente: el pipeline image-text-to-text permite subir una imagen en una webapp y obtener una descripción o responder preguntas sobre ella sin subir el archivo a un backend, útil en herramientas de accesibilidad o catalogación de fotos.
- Demos y prototipos de producto sin infraestructura: un equipo puede publicar una demo funcional de un asistente multimodal en una página estática, reduciendo costes de GPU y simplificando el despliegue.
- Aplicaciones de escritorio o PWA offline: al empaquetar el modelo ONNX de 1,6 GB, es viable una experiencia offline con WebGPU en equipos con GPU integrada o dedicada reciente.
- Filtrado y moderación de contenido local: clasificación y anotación de imágenes y texto en el propio dispositivo, sin exposición de datos a terceros.
- Investigación y experimentación con cuantización y despliegue web: sirve como referencia para estudiar el rendimiento de modelos multimodales de 2B en WebGPU y comparar con alternativas de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 1,6 GB, por lo que se requiere al menos esa cantidad de memoria de GPU accesible desde el navegador, más overhead de activaciones y del runtime.
- GPU recomendadas: no disponibles de forma específica. WebGPU requiere navegadores compatibles (Chrome/Edge recientes) y GPU con soporte WebGPU (integradas modernas o dedicadas).
- ¿Cabe en consumer GPU? Sí, previsiblemente en GPUs de consumo con WebGPU habilitado, dado el tamaño del artefacto (1,6 GB) y los 2B parámetros.
- Opciones de despliegue: onnxruntime-web con backend WebGPU; el modelo base está en formato MLX/NVFP4 (Apple Silicon); no se indica soporte para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Despliegue web |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Abliterated-Arete-ONNX-WebGPU | 2B | no disponible | Sí (imagen-texto) | lfm1.0 | Sí (ONNX/WebGPU) |
| LFM3-Omni-2B-Abliterated-Arete-NVFP4-MLX (modelo base) | 2B | no disponible | Sí | lfm1.0 | No (MLX, Apple Silicon) |
| Alternativas de 2B multimodales para navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Licencia lfm1.0 (etiquetada como "other"): es una licencia propia de Liquid AI; deben revisarse las condiciones de uso comercial antes de integrarlo en producción.
- El sufijo "Abliterated" indica que se han modificado los mecanismos de alineación o rechazo del modelo original; esto puede aumentar el riesgo de respuestas inapropiadas, sesgadas o dañinas, y reduce las garantías de seguridad del modelo base.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de razonamiento complejo o matemáticas.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Limitaciones de contexto no documentadas.
- Es un artefacto de conversión, no un modelo oficial: la calidad de la exportación ONNX y su fidelidad respecto al modelo original no están verificadas en la información disponible.
- La inferencia en navegador depende de la disponibilidad de WebGPU y de la memoria de GPU del dispositivo del usuario; el rendimiento puede variar significativamente entre equipos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/balllvin/LFM3-Omni-2B-Abliterated-Arete-ONNX-WebGPU
- Modelo base: https://huggingface.co/balllvin/LFM3-Omni-2B-Abliterated-Arete-NVFP4-MLX
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
