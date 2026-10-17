# ND911/flux-3-image-klein-pup-Q8_0-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF (cuantización Q8_0) del modelo `black-forest-labs/flux-3-image-klein-pup`, publicada por el usuario ND911 mediante el espacio GGUF-my-repo de ggml.ai. No se trata del modelo generador de imágenes FLUX 3 Image Klein (que es un modelo de 5,6B parámetros para texto-a-imagen y edición), sino de su componente complementario: el *prompt upsampler* (de ahí el sufijo "pup"), un modelo de visión-lenguaje de aproximadamente 9B parámetros cuyo propósito es expandir una petición de imagen corta en el prompt detallado y estructurado que FLUX 3 Image Klein necesita para funcionar bien.

El modelo base resuelve un problema práctico de los flujos de trabajo de generación de imágenes: los usuarios suelen escribir instrucciones breves y ambiguas, mientras que los modelos de difusión rinden mucho mejor con descripciones largas y ricas en detalle. Este upsampler se encarga de esa reescritura de forma automática. La documentación oficial de FLUX 3 Image Klein insiste en que no debe usarse sin este componente, lo que lo convierte en una pieza obligatoria de la cadena de inferencia.

La ficha que sigue describe la versión cuantizada en Q8_0, empaquetada para su uso con `llama.cpp`, con licencia Apache 2.0 y soporte exclusivo de inglés. El dato de parámetros reales declarado para el repositorio (safetensors) es de 8.953.803.264 parámetros, coherente con la cifra de "9B" que aparece en la documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision-lenguaje (VLM) para reescritura de prompts; detalles internos de arquitectura no disponibles |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos del README usan `-c 2048`, pero es un valor de ejemplo, no una especificacion del modelo) |
| Tipos de cuantizacion | Q8_0 (unico formato publicado en este repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del prompt upsampler. Se sabe que es un modelo de vision-lenguaje de aproximadamente 9B parametros con pipeline `image-text-to-text`, lo que implica que acepta texto e imagenes como entrada y produce texto como salida (el prompt ampliado). El repositorio original lo etiqueta con `prompt-upsampling` y `prompt-rewriting`, y la documentacion de ModelScope lo describe como un VLM de 9B que transforma una peticion breve en el prompt detallado optimo para FLUX 3 Image Klein. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

En cuanto al proceso de cuantizacion de este repositorio concreto, se ha convertido el checkpoint original a GGUF en precision Q8_0 mediante `llama.cpp` y el espacio GGUF-my-repo de ggml.ai. No se documentan innovaciones tecnicas adicionales mas alla de la propia funcion de reescritura de prompts, que actua como etapa previa imprescindible en el pipeline de generacion y edicion de imagenes del modelo principal.

## Capacidades

- Reescritura y ampliacion de prompts (prompt upsampling): convierte instrucciones breves en descripciones largas y detalladas.
- Entrada multimodal texto-imagen (pipeline `image-text-to-text`), orientada a generar texto a partir de una peticion y, potencialmente, imagenes de referencia.
- Generacion de texto en ingles; no se documenta soporte multilingue.
- Encaje en flujos de generacion y edicion de imagenes como etapa de preprocesado del prompt.
- Ejecucion local mediante `llama.cpp` (CLI y servidor) y descarga directa de pesos GGUF desde HuggingFace.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Preprocesado de prompts para texto-a-imagen: antes de invocar FLUX 3 Image Klein, este modelo expande la peticion del usuario en un prompt detallado, mejorando la fidelidad del resultado.
- Edicion de imagenes guiada por lenguaje natural: la reescritura del prompt ayuda a traducir instrucciones vagas ("haz que parezca de noche") en descripciones precisas para el modelo de edicion.
- Composicion multi-referencia: cuando se trabaja con varias imagenes de referencia (hasta 10 en el modelo principal), el upsampler genera prompts que describen con claridad como combinarlas.
- Control de composicion por bounding boxes: al generar prompts que incluyen descripciones de posicion y distribucion de objetos, facilita el uso del control de layout basado en cajas delimitadoras.
- Herramienta previa en pipelines de ComfyUI o Diffusers: se integra como nodo de reescritura de prompt antes del muestreo de difusion, en flujos de produccion de imagenes.
- Generacion por lotes en servidor: desplegado con `llama-server`, puede atender peticiones concurrentes de reescritura de prompt para granjas de generacion de imagenes.
- Prototipado e investigacion: permite estudiar el impacto de la calidad del prompt en la salida de un modelo de difusion sin depender de servicios en la nube.
- Aplicaciones de bajo coste en hardware de consumo: al ser un GGUF Q8_0 de ~9,5 GB, puede ejecutarse localmente en GPUs de gama alta de consumo para estas tareas de reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 9,5 GB, por lo que se necesitan del orden de 10-12 GB de VRAM teniendo en cuenta el contexto y el overhead de la libreria (estimacion orientativa; no confirmada por el autor).
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100, H100 para despliegue en servidor. Una GPU de 16 GB podria ser suficiente en el limite, pero sin margen para contextos largos.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12-16 GB o mas; el repositorio no ofrece variantes de menor precision (Q4, Q5) que reduzcan el requisito.
- Opciones de despliegue: `llama.cpp` (tanto `llama-cli` como `llama-server`), con soporte para aceleracion CUDA (Linux/NVIDIA), y compilacion con `LLAMA_CURL=1`. No se documenta despliegue con vLLM ni TGI para este repositorio GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ND911/flux-3-image-klein-pup-Q8_0-GGUF | ~8,95B | Prompt upsampling (VLM) | no disponible | Apache 2.0 | GGUF Q8_0 |
| black-forest-labs/flux-3-image-klein-pup | ~9B | Prompt upsampling (modelo base) | no disponible | Apache 2.0 | safetensors |
| black-forest-labs/flux-3-image-klein | 5,6B | Texto-a-imagen y edicion | no disponible | no disponible | BF16 / FP8 / NVFP4 / GGUF |

Nota: el modelo base `flux-3-image-klein-pup` es la misma entidad que este repositorio pero sin cuantizar; `flux-3-image-klein` es el modelo generador de imagenes complementario, no un sustituto, ya que la documentacion oficial recomienda usar ambos juntos. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- No es un modelo generador de imagenes: produce texto (prompts ampliados), no pixeles. Confundirlo con FLUX 3 Image Klein llevaria a un uso incorrecto.
- Soporte exclusivo de ingles: las entradas en otros idiomas, incluido el castellano, pueden degradar la calidad de la reescritura.
- No se dispone de datos sobre sesgos, alucinaciones o comportamiento en dominios especificos; al ser un reescritor de prompts, puede introducir o inventar detalles que el usuario no pidio, alterando el resultado final.
- Longitud de contexto no documentada: se desconoce el limite real de tokens de entrada, lo que dificulta planificar el despliegue con prompts largos.
- Unica cuantizacion disponible (Q8_0): no hay variantes de menor precision para GPUs con poca VRAM.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta: no cuenta con validacion de la comunidad, lo que aumenta el riesgo de errores en la conversion.
- La licencia del repositorio cuantizado es Apache 2.0, pero conviene verificar las condiciones de la licencia del modelo base original de Black Forest Labs antes de un uso comercial en produccion.
- Fechas de creacion y actualizacion registradas (16 de octubre de 2026) posteriores a la fecha habitual de referencia; conviene confirmar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace (GGUF Q8_0): https://huggingface.co/ND911/flux-3-image-klein-pup-Q8_0-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Repositorio GitHub de FLUX 3 Image Klein: https://github.com/black-forest-labs/flux-3-image-klein
- Model card en ModelScope del prompt upsampler: https://www.modelscope.cn/models/black-forest-labs/flux-3-image-klein-pup
- Model card en NVIDIA NIM: https://build.nvidia.com/black-forest-labs/flux-3-image-klein/modelcard
- Tutorial de ejecucion local (Windows, Mac, Kali Linux): https://www.logeshwaran.org/2026/10/flux-3-image-klein-run-locally.html
- Articulo con variantes y flujos de trabajo: https://www.stablediffusiontutorials.com/2026/10/flux3-image-klein.html
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
