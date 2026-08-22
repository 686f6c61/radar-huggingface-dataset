# Atomic-Germ/Qwen2.5-VL-3B-Instruct-NPU2

## Resumen

Atomic-Germ/Qwen2.5-VL-3B-Instruct-NPU2 es una adaptacion del modelo vision-language Qwen2.5-VL-3B-Instruct, desarrollado por el equipo Qwen de Alibaba, orientada a su despliegue en unidades de procesamiento neuronal (NPU). El sufijo NPU2 sugiere una optimizacion para aceleradores como el Rockchip RK3588, un SoC muy usado en dispositivos embebidos y de borde. El modelo original es un vision-language model de 3.000 millones de parametros capaz de procesar imagenes, videos y texto de forma interleaved, con capacidades de agente, localizacion visual y generacion de salidas estructuradas. La ficha se basa en la model card del modelo base, ya que la card de esta adaptacion no aporta datos adicionales sobre la optimizacion NPU.

El modelo hereda la arquitectura Qwen2.5-VL, que combina un codificador visual (ViT) con el LLM Qwen2.5, e incorpora mejoras como resolucion dinamica, muestreo de FPS dinamico para video y atencion con ventana en el ViT. La licencia es qwen-research, que restringe el uso comercial, y el repositorio tiene un tamano de 4.0 GB, consistente con pesos en fp16 de un modelo de 3B. No hay descargas ni likes registrados, lo que indica que es un modelo recien publicado y sin uso documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (ViT + LLM Qwen2.5, transformer decoder-only) |
| Parametros totales | 3B (aproximadamente 3.000 millones) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo de 4.0 GB, probablemente fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-VL-3B-Instruct usa una arquitectura multimodal que combina un vision encoder (ViT) con el LLM Qwen2.5. El ViT ha sido optimizado con atencion de ventana para acelerar el entrenamiento e inferencia, y utiliza SwiGLU y RMSNorm, alineandose con la estructura del LLM. Para video, se emplea un muestreo de FPS dinamico que extiende la resolucion dinamica al eje temporal, y se actualiza mRoPE en la dimension temporal con IDs y alineacion absoluta, permitiendo al modelo comprender la secuencia temporal y localizar eventos concretos en videos de mas de una hora.

El entrenamiento incluye un proceso de instruction tuning, aunque la informacion proporcionada no detalla el numero de tokens ni la composicion del dataset. No se menciona el uso de RLHF o DPO. La adaptacion NPU2 de Atomic-Germ no documenta cambios arquitectonicos adicionales; se asume que es una conversion o cuantizacion para inferencia en NPU, probablemente siguiendo el trabajo de la comunidad Qengineering sobre el RK3588, que convierte el modelo a formatos rkllm y rknn.

## Capacidades

- Procesamiento multimodal de imagenes, videos y texto de forma interleaved.
- Reconocimiento de objetos, textos, graficos, iconos y layouts dentro de imagenes.
- Capacidad de agente visual: puede razonar y dirigir herramientas, incluyendo uso de ordenador y telefono.
- Comprension de videos de larga duracion (mas de una hora) y localizacion de eventos concretos.
- Localizacion visual en multiples formatos: genera bounding boxes o puntos de coordenadas con salidas JSON estables.
- Generacion de salidas estructuradas para documentos como facturas, formularios y tablas.
- Soporte de tool calling implicito a traves de su capacidad de agente.
- Razonamiento multimodal en tareas de matematicas y diagramas.

## Casos de uso

- Automatizacion de atencion al cliente con analisis de imagenes: el modelo puede procesar capturas de pantalla o fotos de productos y generar respuestas contextuales, gracias a su capacidad de razonar sobre el contenido visual y generar texto en conversaciones multi-turno.
- Extraccion de datos de documentos: puede leer facturas, formularios y tablas escaneadas y devolver el contenido en formato JSON estructurado, util para flujos de contabilidad o gestion documental.
- Agente de control de interfaz: con su capacidad de localizacion visual y razonamiento, puede actuar como agente que interactua con aplicaciones moviles o de escritorio, automatizando tareas repetitivas.
- Analisis de video de vigilancia o seguridad: puede comprender secuencias largas y localizar eventos concretos, permitiendo busqueda de momentos relevantes en horas de grabacion.
- Asistente para personas con discapacidad visual: describe objetos, textos y escenas en tiempo real desde una camara, con respuestas en lenguaje natural.
- Educacion y tutoria: el modelo puede explicar diagramas, graficos o problemas de matematicas visuales, generando soluciones paso a paso.
- Prototipado de aplicaciones embebidas: en dispositivos con NPU como el RK3588, el modelo puede usarse para vision por computador en robotica o IoT, con inferencia local sin conexion.

## Benchmarks y rendimiento

La model card del modelo base incluye resultados de benchmarks para Qwen2.5-VL-3B. Se presentan a continuacion los datos disponibles, comparados con modelos similares.

### Benchmark de imagen

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
| :--- | :---: | :---: | :---: |
| MMMU val | 52.3 | 54.1 | 53.1 |
| MMMU-Pro val | 32.7 | 30.5 | 31.6 |
| AI2D test | 81.4 | 83.0 | 81.5 |
| DocVQA test | 91.6 | 94.5 | 93.9 |
| InfoVQA test | 72.1 | 76.5 | 77.1 |
| TextVQA val | 76.8 | 84.3 | 79.3 |
| MMBench-V1.1 test | 79.3 | 80.7 | 77.6 |
| MMStar | 58.3 | 60.7 | 55.9 |
| MathVista testmini | 60.5 | 58.2 | 62.3 |
| MathVision full | 20.9 | 16.3 | 21.2 |

### Benchmark de video

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
| :--- | :---: | :---: | :---: |
| MVBench | 71.6 | 67.0 | 67.0 |
| VideoMME | 63.6/62.3 | 69.0/63.3 | 67.6/61.5 |
| MLVU | 48.3 | - | 68.2 |
| LVBench | - | - | 43.3 |
| MMBench-Video | 1.73 | 1.44 | 1.63 |
| EgoSchema | - | - | 64.8 |
| PerceptionTest | - | - | 66.9 |
| TempCompass | - | - | 64.4 |
| LongVideoBench | 55.2 | 55.6 | 54.2 |
| CharadesSTA/mIoU | - | - | 38.8 |

### Benchmark de agente

| Benchmark | Qwen2.5-VL-3B |
|-------------------------|---------------|
| ScreenSpot | 55.5 |
| ScreenSpot Pro | 23.9 |
| AITZ_EM | 76.9 |
| Android Control High_EM | 63.7 |
| Android Control Low_EM | 22.2 |
| AndroidWorld_SR | 90.8 |
| MobileMiniWob++_SR | 67.9 |

No hay datos de benchmark para la version NPU2 especifica.

## Requisitos de hardware

- El modelo base tiene 3B de parametros, por lo que en fp16 requiere aproximadamente 6 GB de VRAM para inferencia.
- En cuantizacion int8, la memoria se reduce a unos 3-4 GB; en int4, a unos 2-3 GB.
- Se puede ejecutar en GPU de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, siempre que se use cuantizacion.
- Para la version NPU2, el objetivo es el SoC Rockchip RK3588, que dispone de una NPU de 6 TOPS. El repositorio de Qengineering proporciona archivos rkllm y rknn para su ejecucion en este hardware.
- Opciones de despliegue: para GPU, se puede usar vLLM, TGI o transformers; para NPU, se requiere el runtime de Rockchip (rkllm) o herramientas como llama.cpp adaptado.
- La latencia y el throughput no estan documentados para esta adaptacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU val | DocVQA test | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible | 53.1 | 93.9 | qwen-research |
| Qwen2-VL-7B | 7B | no disponible | 54.1 | 94.5 | Apache-2.0 |
| InternVL2.5-4B | 4B | no disponible | 52.3 | 91.6 | MIT |

La adaptacion NPU2 no introduce cambios de rendimiento documentados; su valor reside en la optimizacion para hardware de borde. Qwen2-VL-7B ofrece mejor rendimiento en general, pero con mas parametros y mayor coste de inferencia. InternVL2.5-4B es la alternativa mas cercana en tamano y licencia mas permisiva (Apache-2.0), aunque con resultados ligeramente inferiores en los benchmarks mostrados.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial, por lo que no es adecuado para aplicaciones de produccion con fines lucrativos.
- No hay informacion sobre la adaptacion NPU2 en la model card; no se documentan cambios en la arquitectura, el entrenamiento o los benchmarks.
- El modelo solo soporta ingles en su card, lo que limita su uso en contextos multilingues.
- Riesgo de alucinacion en tareas de razonamiento complejo o en respuestas factuales, como es comun en modelos de 3B.
- La longitudes de contexto no se ha confirmado en la informacion disponible; se recomienda validar antes de desplegar.
- La version NPU puede requerir herramientas especificas de Rockchip y no es compatible con el ecosistema estandar de transformers.
- Sin uso registrado (0 descargas) y sin evaluaciones independientes de la adaptacion, por lo que su robustez en entornos reales no esta verificada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwen2.5-VL-3B-Instruct-NPU2
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Blog oficial de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Proyecto de Qengineering para Qwen2.5-VL-3B en RK3588: https://github.com/Qengineering/Qwen2.5-VL-3B-NPU
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen2.5-vl-3b-instruct-qwen
- Modelo en ModelScope: https://modelscope.ai/models/Qwen/Qwen2.5-VL-3B-Instruct
