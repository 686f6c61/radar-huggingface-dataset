# HanzoHuang/Qwen3-VL-2B-Instruct-RKLLM

## Resumen

Qwen3-VL-2B-Instruct-RKLLM es una conversión del modelo multimodal Qwen3-VL-2B-Instruct de Alibaba Qwen al formato RKLLM, pensada para ejecutarse en los SoC Rockchip RK3576 y RK3588 (placas tipo reComputer). El autor de la conversión es HanzoHuang, que publica los artefactos listos para el runtime NPU de Rockchip junto con un contenedor Docker compatible con la API de OpenAI. No se trata de un modelo nuevo ni de un fine-tune: los pesos del modelo base se mantienen y lo que cambia es el formato, la cuantización y el grafo de ejecución para la NPU.

El modelo base es un transformer multimodal de 2.000 millones de parámetros que acepta texto e imagen y devuelve texto. En esta conversión la longitud de contexto de exportación es de 8192 tokens, aunque las pruebas funcionales se hicieron a 4096 y el benchmark de velocidad a 2048. La entrada de visión está fijada a RGB 448×448, batch 1, 196 tokens de imagen.

Su relevancia es práctica: permite llevar un VLM de 2B a placas embebidas de bajo consumo con cuantizaciones W4A16-g128 y W8A8, con un consumo de RAM adicional de entre 2,57 y 3,18 GB según placa y cuantización, y velocidades de decodificación de 9 a 14 tokens por segundo. Es una pieza para prototipos de visión en el borde, no para despliegues de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) del modelo base Qwen3-VL-2B-Instruct; convertido a RKLLM para NPU Rockchip |
| Parametros totales | 2B (modelo base Qwen3-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en exportación; 4096 validados en pruebas de API; 2048 en el benchmark de velocidad |
| Tipos de cuantizacion | W4A16-g128 (GRQ) y W8A8 (cuantización normal) para el modelo de lenguaje; encoder de visión en RKNN |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rkllm` (modelo de lenguaje) y `.rknn` (encoder de visión) |
| Toolkit de conversión | RKLLM Toolkit 1.3.1 y RKNN Toolkit2 2.5.0 |
| Entrada / salida | texto + una imagen → texto (vídeo y audio no soportados en este runtime) |
| Resolución de imagen | RGB 448×448, batch 1, 196 tokens de imagen, mean/std 0.5 |
| Placas soportadas | RK3576 (2 núcleos NPU) y RK3588 (3 núcleos NPU) |
| Tamaño del repo | 8,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-2B-Instruct, un transformer multimodal de la familia Qwen3-VL que procesa texto e imágenes y genera texto. Esta publicación no entrena ni ajusta el modelo: parte del checkpoint de ModelScope `Qwen/Qwen3-VL-2B-Instruct` en la revisión `ae9985b208c074c10cfbe3a61b5cb7268cdc9c53` y lo exporta con RKLLM Toolkit 1.3.1 y RKNN Toolkit2 2.5.0. Los pesos de origen no se modifican; los arreglos de compatibilidad de exportación seleccionan las cuatro salidas de visión de ancho de lenguaje bajo Transformers 5 e importan solo la familia de modelos de calibración solicitada.

La calibración de cuantización se hizo con los 20 ejemplos de imagen y texto del SDK, capturados con el procesador de origen y un hook en la entrada del modelo de lenguaje. W4A16-g128 usa GRQ y W8A8 usa cuantización normal. La carga en float32 se realizó en CUDA y la ejecución reparte el trabajo entre dos núcleos NPU en RK3576 y tres en RK3588. La imagen se rellena a cuadrado con RGB 127 y se redimensiona bilinealmente; la salida de visión sigue el orden pooler más tres features deepstack por token. La fidelidad numérica del encoder de visión frente a los embeddings float32 originales es de 0,99767705 (coseno) en RK3576 y 0,99805251 en RK3588.

## Capacidades

- Generación de texto e imagen a texto: descripción de imágenes, respuesta a preguntas sobre una imagen y chat multimodal de un solo turno de imagen.
- Conversión de texto a texto con contexto de hasta 8192 tokens en exportación, aunque solo 4096 están validados funcionalmente.
- Razonamiento aritmético básico, verificado en las pruebas de humo de la API.
- Recuerdo exacto de conversación dentro de la ventana de contexto, verificado en las pruebas de API.
- Streaming de respuestas vía SSE, verificado en las pruebas de API.
- Servicio compatible con la API de OpenAI a través del contenedor `ghcr.io/hanzo-huang/rkllm-docker`, incluidas peticiones de imagen.
- Una sola imagen por petición; no hay soporte de vídeo ni de audio en este runtime.
- No se documentan tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Inspección visual en el borde: desplegar el modelo en una placa RK3576 o RK3588 para describir o clasificar imágenes capturadas por una cámara local, sin depender de la nube. El encoder fijo a 448×448 y los 196 tokens de imagen acotan el coste por inferencia.
- Asistente de documentación con OCR ligero: enviar una imagen de un documento o etiqueta y pedir extracción de texto o resumen. La ventana de 4096 tokens validados permite incluir instrucciones largas junto a la imagen.
- Chat de atención al cliente en kiosco embebido: el modelo mantiene el hilo de conversación dentro del contexto y responde en streaming por SSE, lo que encaja con interfaces de chat locales en dispositivos sin conectividad.
- Prototipado rápido de producto con Docker: el contenedor expone un endpoint compatible con OpenAI en el puerto 8001, de modo que se puede integrar con clientes existentes y validar la viabilidad de un caso de uso antes de invertir en hardware mayor.
- Monitorización industrial con verificación visual: usar el modelo para responder preguntas concretas sobre una imagen de una línea de producción (por ejemplo, presencia de un componente o color de un indicador), con la latencia de 9 a 14 tokens/s que ofrecen estas placas.
- Educación y demos de IA en el borde: ejecutar un VLM de 2B en hardware de bajo consumo para talleres o demostraciones, con un consumo de RAM adicional de 2,57 a 3,18 GB que cabe en placas de 8 GB.
- Filtrado previo en pipelines de datos: generar descripciones automáticas de imágenes en un dispositivo local antes de enviarlas a un modelo mayor en servidor, reduciendo ancho de banda y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que las pruebas realizadas son comprobaciones funcionales y numéricas de humo, no un benchmark amplio de calidad.

Rendimiento medido el 2026-10-22 (decodificación nativa, mediana de tres ejecuciones de 128 tokens tras un calentamiento de 32 tokens, greedy, EOS ignorado, contexto 2048):

| Placa | Cuantización | Decode tok/s | RAM al arrancar (GB) | RAM estable (GB) |
|---|---|---:|---:|---:|
| RK3576 | W4A16-g128 | 11,11 | 2,60 | 2,57 |
| RK3576 | W8A8 | 9,02 | 3,18 | 3,18 |
| RK3588 | W8A8 | 14,05 | 3,03 | 3,07 |

La RAM indicada es el uso adicional sobre una línea base en reposo de cinco segundos, en GB decimales, con el encoder correspondiente cargado y `embed_flash=1`. La medición de RK3576 W8A8 se hizo con swap zram desactivado temporalmente.

Ficheros publicados:

| Placa | Cuantización | Tamaño | Fichero de lenguaje |
|---|---|---:|---|
| RK3576 | W4A16-g128 | 1,74 GiB | `Qwen3-VL-2B-Instruct_RK3576_w4a16_g128.rkllm` |
| RK3576 | W8A8 | 2,28 GiB | `Qwen3-VL-2B-Instruct_RK3576_w8a8.rkllm` |
| RK3588 | W8A8 | 2,22 GiB | `Qwen3-VL-2B-Instruct_RK3588_w8a8.rkllm` |

| Placa | Tamaño | Encoder de visión |
|---|---:|---|
| RK3576 | 0,81 GiB | `Qwen3-VL-2B-Instruct_vision_RK3576.rknn` |
| RK3588 | 0,80 GiB | `Qwen3-VL-2B-Instruct_vision_RK3588.rknn` |

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3576 o RK3588 con NPU. No está pensado para GPU de escritorio ni para CPU x86.
- RAM adicional necesaria: 2,57 GB (RK3576 W4A16-g128), 3,18 GB (RK3576 W8A8) y 3,07 GB (RK3588 W8A8), medidos como uso por encima de la línea base en reposo.
- Núcleos NPU utilizados: dos en RK3576 y tres en RK3588.
- GPU recomendadas: no aplica; el runtime es NPU Rockchip. La carga de pesos en float32 durante la conversión se hizo en CUDA, pero la inferencia no usa GPU.
- ¿Cabe en GPU de consumo? No es el caso de uso; los artefactos `.rkllm` y `.rknn` no son ejecutables en CUDA.
- Despliegue: contenedor Docker `ghcr.io/hanzo-huang/rkllm-docker:env-latest` con variables `MODEL_KIND=vlm`, `TARGET_PLATFORM`, `MODEL_FILE`, `VISION_MODEL_FILE` y `RKLLM_EMBED_FLASH=1`; endpoint compatible con OpenAI en el puerto 8001. Requiere `--privileged` y montaje de `/dev`.
- Throughput: 11,11 tok/s (RK3576 W4A16-g128), 9,02 tok/s (RK3576 W8A8) y 14,05 tok/s (RK3588 W8A8) en decodificación nativa con contexto 2048.
- Latencia del primer token: no disponible (el autor la mantiene en un informe privado).
- El contexto de ejecución recomendado en los comandos de ejemplo es 4096; no se ha validado contexto mayor en estas placas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct-RKLLM (esta ficha) | 2B | 8192 exportado / 4096 validado | `.rkllm` + `.rknn`, NPU RK3576 y RK3588 | Apache 2.0 | Hugging Face, 327 descargas |
| Qwen3-VL-2B-Instruct (modelo base) | 2B | no disponible en la información | safetensors, GPU/CPU con Transformers | Apache 2.0 | Hugging Face |
| Otras conversiones RKLLM de VLMs pequeños | no disponible | no disponible | `.rkllm`, NPU Rockchip | depende del modelo base | no disponible en la información |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta conversión con alternativas. La comparación relevante es de formato y despliegue: frente al modelo base, esta versión gana ejecutabilidad en NPU Rockchip y pierde flexibilidad (resolución de imagen fija, sin vídeo ni audio, contexto validado menor).

## Limitaciones y advertencias

- Las pruebas publicadas son comprobaciones funcionales y numéricas de humo, no un benchmark de calidad; la cuantización y la resolución fija de imagen pueden reducir la precisión frente al modelo base.
- La resolución de imagen está fijada a 448×448 con 196 tokens de imagen; imágenes con detalles finos o texto pequeño pueden perder información.
- Solo se admite una imagen por petición y no hay soporte de vídeo ni de audio en este runtime.
- El contexto de exportación es 8192 tokens, pero solo se han validado 4096 en pruebas de API y 2048 en el benchmark; contextos mayores no están verificados en estas placas.
- El rendimiento depende de la placa, la frecuencia, la refrigeración y la carga de fondo; las cifras de tok/s y RAM son mediciones puntuales del 2026-10-22.
- La medición de RK3576 W8A8 requirió desactivar temporalmente el swap zram; con crecimiento de swap en segundo plano las mediciones se descartaron.
- No se documentan sesgos conocidos, comportamiento multilingüe ni riesgos específicos de alucinación en la información disponible; se heredan los del modelo base Qwen3-VL-2B-Instruct.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar también la licencia y las condiciones del modelo base y de los toolkits de Rockchip utilizados en la conversión.
- Los artefactos están atados a la versión del runtime RKLLM 1.3.1; cambios de versión del runtime o del SDK pueden romper la compatibilidad.
- El contenedor requiere `--privileged` y acceso a `/dev`, lo que implica privilegios elevados en el dispositivo de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HanzoHuang/Qwen3-VL-2B-Instruct-RKLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Runtime Docker del autor: https://github.com/Hanzo-Huang/rkllm-docker
- reComputer AI Lab (guías de despliegue en RK3588): https://sensecraft.seeed.cc/ai-lab/en/models?device=rk3588
- README en chino: README_zh-CN.md (incluido en el repositorio del modelo)
- Licencia: LICENSE (incluido en el repositorio del modelo)
