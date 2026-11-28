# JJchih/Swift1.5-Qwen3.8-Flash-Next-Heretic-oQ6e-fp16-mtp-zhTW

## Resumen

Swift1.5-Qwen3.8-Flash-Next-Heretic-oQ6e-fp16-mtp-zhTW es una derivación cuantizada y adaptada al chino tradicional del modelo Qwen3.8-Flash-Next de Alibaba Qwen. La cadena de derivación parte del modelo base Qwen/Qwen3.8-Flash-Next, pasa por el ajuste fino ukisai/Swift1.5-Qwen3.8-Flash-Next, se le aplica una fusión de extensión de capas de atención mediante la herramienta heretic y finalmente se cuantiza en formato oQ6e de KTransformers con corrección imatrix, añadiendo una cabeza MTP (multi-token prediction) y una modificación local de la plantilla de chat para favorecer la salida en chino tradicional.

El modelo emplea una arquitectura Qwen3Moe de 64 capas con hidden size de 4096 y 512 expertos con top-10, lo que lo sitúa en la categoría de modelos MoE de gran escala. Su contexto nativo es de 262.144 tokens. El paquete de pesos ocupa aproximadamente 142 GB repartidos en 29 shards safetensors, con cuantización mixta oQ6e (~6,57 bits por peso) más capas en fp16 y la mencionada cabeza MTP.

Es relevante para desarrolladores que necesitan ejecutar un modelo MoE grande en hardware de gama alta de escritorio (el autor reporta pruebas en un Mac Studio M5 Ultra de 256 GB) manteniendo decodificación especulativa mediante MTP. La licencia del modelo base es la Qwen Research License, de carácter no comercial, y las capas derivadas no alteran esa restricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Moe (transformer MoE), 64 capas, hidden 4096, 512 expertos, top-10, MTP de 1 capa |
| Parametros totales | no disponible (pesos ~142 GB en 29 shards) |
| Parametros activos | no disponible (top-10 sobre 512 expertos) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | oQ6e (~6,57 bpw) + fp16 en capas seleccionadas + cabeza MTP, con corrección imatrix |
| Idiomas soportados | no disponible (el autor ajusta la plantilla para priorizar chino tradicional) |
| Licencia | other (Qwen Research License, no comercial) |
| Formato de pesos | safetensors (formato oQ de KTransformers, cargable en KTransformers y oMLX) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con 64 capas, dimensión oculta de 4096 y 512 expertos con activación top-10 por token. Incorpora una capa adicional de multi-token prediction (MTP) pensada para decodificación especulativa, lo que permite proponer varios tokens por paso y acelerar la generación. La cuantización oQ6e de KTransformers aplica una mezcla de precisión: pesos mayoritariamente a ~6,57 bits por peso con corrección imatrix, mientras que ciertas capas se mantienen en fp16 para preservar calidad.

Sobre el entrenamiento original no se dispone de detalles en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). La cadena de derivación incluye un ajuste fino (Swift1.5) y una fusión de extensión de capas de atención realizada con heretic. La modificación zhTW consiste únicamente en cambios de plantilla de chat y configuración de generación para forzar salida en chino tradicional; no altera los pesos.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Razonamiento y generación de contenido en contexto largo, hasta 262.144 tokens nativos.
- Decodificación especulativa mediante cabeza MTP (recomendada su activación por el autor).
- Salida orientada a chino tradicional por defecto gracias a la plantilla de chat modificada.
- Capacidad multilingüe: no documentada explícitamente; el ajuste local prioriza zh-TW.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de texto en chino tradicional: el modelo está configurado para producir respuestas en zh-TW de forma predeterminada, útil para asistentes y contenidos dirigidos a Taiwán, Hong Kong o comunidades que emplean esa variante.
- Procesamiento de documentos largos: con 262.144 tokens de contexto puede resumir contratos, informes técnicos o expedientes completos sin troceado, manteniendo coherencia entre secciones.
- Inferencia local en estaciones de trabajo de gran memoria: el formato oQ6e y la compatibilidad con oMLX y KTransformers permiten desplegar el modelo en equipos como un Mac Studio de 256 GB sin depender de la nube.
- Investigación sobre decodificación especulativa: la cabeza MTP integrada sirve para experimentar con técnicas de aceleración de inferencia y medir su impacto en latencia y throughput.
- Analítica de conversaciones y atención al cliente: conversaciones multi-turno extensas se benefician del contexto largo y de la estabilidad de un MoE de gran escala.
- Experimentación con cuantización mixta: el paquete oQ6e + fp16 es un caso de estudio para evaluar el equilibrio entre tamaño, calidad y velocidad en modelos MoE.
- Generación asistida en pipelines de contenido: integrable en flujos de redacción, traducción o adaptación de textos hacia chino tradicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una medición local: aproximadamente 30 tok/s de decodificación con contexto de 32k en un Mac Studio M5 Ultra de 256 GB usando oMLX con decodificación especulativa MTP activada.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos ocupan ~142 GB, por lo que se necesita al menos esa cantidad de memoria unificada o de VRAM, más overhead de contexto y caché KV.
- GPU recomendadas: no especificadas por el autor; por tamaño, se requiere hardware de gama alta (H100 80 GB en configuración multi-GPU, A100 80 GB, o soluciones con memoria unificada de 256 GB o superior).
- Consumer GPU: no cabe en tarjetas de consumo convencionales (RTX 4090 24 GB, RTX 5090 32 GB) sin offloading o sharding extremo.
- Opciones de despliegue: KTransformers (ruta oQ) y oMLX; el autor no documenta otros backends.
- Latencia y throughput: ~30 tok/s en decodificación con 32k de contexto en Mac Studio M5 Ultra 256 GB con MTP activado; el resto de configuraciones no ha sido medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (derivado) | no disponible (~142 GB) | 262.144 | Qwen Research (no comercial) | safetensors oQ6e + fp16 + MTP | Cuantizado, orientado a zh-TW, con MTP |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | 262.144 | Qwen Research (no comercial) | safetensors | Modelo original sin cuantizar |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | safetensors | Ajuste fino upstream |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License del modelo base restringe el uso comercial; las capas derivadas no relajan esta condición.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual.
- Idiomas: la información no detalla cobertura multilingüe; el ajuste local prioriza chino tradicional y puede degradar el rendimiento en otras lenguas.
- Sesgos: no se documentan análisis de sesgo; el ajuste fino y la fusión de capas pueden introducir comportamientos no evaluados.
- Reproducibilidad: al ser una derivación con cuantización mixta e imatrix, los resultados pueden diferir de los del modelo base.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Compatibilidad limitada: solo se documentan KTransformers y oMLX; otros backends no están verificados.
- Requisitos de memoria muy elevados (~142 GB) que excluyen GPUs de consumo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JJchih/Swift1.5-Qwen3.8-Flash-Next-Heretic-oQ6e-fp16-mtp-zhTW
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Ajuste fino upstream: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta heretic: https://github.com/v3ct0r1d3/heretic
