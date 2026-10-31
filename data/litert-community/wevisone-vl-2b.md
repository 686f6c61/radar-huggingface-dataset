# litert-community/WeVisOne-VL-2B

## Resumen

WeVisOne-VL-2B es un modelo vision-language (VLM) de 2.000 millones de parametros desarrollado por WeChat Vision (Tencent), construido sobre la arquitectura de Qwen3-VL. Esta diseñado para responder tareas de percepcion visual —deteccion de objetos, comprension de expresiones de referencia, recuento de objetos, pointing y OCR— mediante texto estructurado, devolviendo cajas y puntos como tokens de coordenadas `<0>`…`<1000>` (milesimas del ancho y alto de la imagen). Su relevancia radica en que convierte tareas que tradicionalmente requieren modelos de deteccion especializados en algo resoluble por un unico modelo generativo compacto.

Esta ficha cubre la conversion del modelo a LiteRT-LM publicada por litert-community, pensada para ejecucion en dispositivos moviles y de escritorio (on-device). El repositorio ofrece dos ficheros `.litertlm`: una version int8 (con el decoder de 28 capas y el token embedder cuantizados a int8, y el vision encoder y adapter en float16) y una version float16 completa. En un Galaxy S26 con GPU, la version int8 genera el primer token tras 1,26 segundos y decodifica 21,1 tokens por segundo, con un pico de memoria de 2,70 GB, lo que la hace viable en telefonos actuales.

Cabe destacar que los ficheros `.litertlm` no incluyen el pixel decoder de 9,5 millones de parametros del modelo original, por lo que no pueden realizar segmentacion ni matting; solo las tareas de texto estructurado (cajas, puntos, OCR, recuento). El contexto por defecto en esta conversion es de 2.048 tokens para prompt y respuesta combinados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basado en Qwen3-VL (vision encoder + adapter + decoder transformer de 28 capas) |
| Parametros totales | 2B (aproximado, no disponible el dato exacto); el pixel decoder excluido tiene 9,5M de parametros |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 2.048 tokens (prompt + respuesta, en la conversion LiteRT-LM) |
| Tipos de cuantizacion | int8 (decoder y token embedder) + float16 (vision encoder y adapter); variante float16 completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM / TFLite); el modelo base esta en el repositorio de origen |

## Arquitectura y entrenamiento

El modelo sigue el esquema tipico de un VLM: un vision encoder que procesa la imagen, un adapter que proyecta los embeddings visuales al espacio del LLM, y un decoder transformer de 28 capas (heredado de Qwen3-VL) que genera texto. Cada fichero `.litertlm` empaqueta los cuatro componentes junto con el `tokenizer.json` del repositorio original. La salida estructurada usa tokens de coordenadas especiales `<0>` a `<1000>`, que representan milesimas de las dimensiones de la imagen, permitiendo expresar cajas delimitadoras y puntos de referencia como texto plano.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no hay informacion disponible en la model card. En cuanto a la conversion, se realizo con litert-torch 0.10.0 para LiteRT-LM 0.18.1. Los ficheros no declaran tipo de activacion, por lo que en GPU el decoder se ejecuta con activaciones float16 por defecto y el vision encoder en float32. Un detalle tecnico importante: LiteRT-LM 0.18.1 redimensiona imagenes de otro tamano a 512 × 512 con el filtro Catmull-Rom de stb, lo que produce respuestas distintas a las obtenidas con el preprocesado recomendado (Pillow BICUBIC tras corregir la orientacion EXIF), llegando a divergir en 20 de 29 preguntas de prueba en GPU de Mac.

## Capacidades

- Deteccion de objetos: localiza instancias y devuelve cajas delimitadoras como texto estructurado (`<ref>truck</ref><box><60><359><608><951></box>`).
- Comprension de expresiones de referencia (referring expression comprehension): identifica el objeto que corresponde a una descripcion en lenguaje natural.
- Point grounding: devuelve puntos de referencia sobre la imagen con el mismo esquema de coordenadas.
- Recuento de objetos (object counting).
- OCR: extraccion de texto de imagenes.
- Respuesta a preguntas sobre imagenes (image-text-to-text) con una sola imagen por peticion.
- No soporta segmentacion ni matting en esta conversion (requieren el pixel decoder de 9,5M parametros no incluido).
- Soporte de tool calling / agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Deteccion de objetos en movil sin servidor: una app Android puede ejecutar el fichero int8 localmente (2,70 GB de pico de memoria en Galaxy S26) para detectar camiones, gruas u otras clases descritas por texto, sin enviar imagenes a la nube.
- OCR en documentos en dispositivos de gama media: el modelo extrae texto de fotografias de documentos con latencias aceptables en CPU (aunque lenta: 13,58 s al primer token en Pixel 8a).
- Busqueda visual por descripcion: dado un catalogo de imagenes, generar cajas de los objetos que coinciden con una consulta en lenguaje natural para indexar o verificar contenido.
- Verificacion de contenido generado: comprobar que una imagen contiene los elementos anunciados (recuento y localizacion) antes de publicarla, todo on-device.
- Anotacion asistida de datasets: preetiquetar cajas y puntos en imagenes para tareas de supervision, revisando las salidas estructuradas del modelo.
- Accesibilidad: describir la posicion de objetos relevantes en la escena (mediante coordenadas que se traducen a posiciones relativas) para aplicaciones de asistencia visual.
- Prototipado rapido en portatiles Mac: en un M4 Max la version int8 alcanza 113,3 tokens/s con 0,29 s al primer token, adecuada para iterar prompts de grounding sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. La model card si reporta mediciones de latencia y una evaluacion interna de correccion (44 puntos sobre 29 preguntas de prueba; la version f16 reproduce 35 puntos en Galaxy S26 GPU frente a 28 de la int8).

| Dispositivo / backend | Fichero | Primer token | Tokens/s | Memoria pico |
|---|---|---:|---:|---:|
| Galaxy S26 (GPU) | int8 | 1,26 s | 21,1 | 2,70 GB |
| Galaxy S26 (GPU) | f16 | 1,54 s | 12,9 | 6,86–6,90 GB |
| Pixel 8a (CPU) | int8 | 13,58 s | 8,0 | no disponible |
| Mac M4 Max (GPU) | int8 | 0,29 s | 113,3 | 3,85 GB |
| Mac M4 Max (GPU) | f16 | 0,30 s | 81,4 | 8,0 GB |
| Mac M4 Max (CPU) | int8 | 4,64 s | 26,8 | 7,6 GB (pico CPU) |
| Mac M4 Max (CPU) | f16 | 4,85 s | 12,6 | no disponible |

## Requisitos de hardware

- Version int8 (2,91 GB en disco): pico de 2,70 GB de memoria en Galaxy S26 GPU; cabe en telefonos con 8 GB de RAM (verificado en Pixel 8a en CPU, con 8,0 tokens/s).
- Version f16 (4,90 GB en disco): necesita ~6,9 GB en GPU de Galaxy S26 y 8,0 GB en Mac M4 Max; no arranca en un telefono de 8 GB como el Pixel 8a.
- GPU recomendadas en movil: GPU de gama alta reciente (Galaxy S26 verificado); en GPU de Pixel 8a la creacion del motor int8 se aborto por falta de memoria libre.
- Escritorio: Mac con Apple Silicon (M4 Max verificado) via backend GPU o CPU; en CPU el pico es de 7,6 GB de memoria y genera 5,11 GB de ficheros de cache junto al modelo.
- Despliegue: LiteRT-LM 0.18.1 (`pip install litert-lm==0.18.1`), con backends `gpu` y `cpu` tanto para el LLM como para la vision (`--backend`, `--vision-backend`); no consta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Preprocesado obligatorio: corregir orientacion EXIF y redimensionar a 512 × 512 con Pillow BICUBIC sin padding ni recorte; usar otros filtros o rutas de redimensionado degrada gravemente la correccion de las respuestas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato on-device | Licencia |
|---|---|---|---|---|
| WeVisOne-VL-2B (LiteRT-LM) | 2B | 2.048 tokens (conversion) | `.litertlm` int8 / f16 | Apache 2.0 |
| Qwen3-VL (base de origen) | 2B (familia) | no disponible | PyTorch / safetensors | no disponible |
| PaliGemma / SmolVLM (categoria VLM compacto) | ~2–3B | no disponible | GGUF / safetensors | no disponible |

No hay datos de rendimiento comparativo publicados frente a estos alternativos en la informacion disponible; la comparacion se limita a la categoria y al formato de despliegue. La ventaja diferencial de esta conversion es el soporte nativo de grounding (cajas, puntos, recuento) en formato LiteRT-LM para movil, algo que la mayoria de VLM genericos no ofrece sin heads adicionales.

## Limitaciones y advertencias

- Sin segmentacion ni matting: los ficheros `.litertlm` no contienen el pixel decoder de 9,5M parametros; para esas tareas hay que usar el modelo original de Tencent.
- Contexto reducido a 2.048 tokens (prompt + respuesta) en la conversion; el contexto del modelo original no esta especificado.
- Sensibilidad extrema al preprocesado: si la imagen no se redimensiona a 512 × 512 con Pillow BICUBIC tras exif_transpose, las respuestas pueden divergir sustancialmente (solo 9/29 coincidencias en Mac GPU con el redimensionado interno de LiteRT-LM).
- La version int8 pierde correccion frente a la f16 (28 frente a 35 puntos sobre 44 en 29 preguntas de prueba en Galaxy S26 GPU).
- En CPU las coordenadas de la version int8 varian unas milesimas entre ejecuciones (no determinismo numerico).
- No hay informacion sobre sesgos, riesgos de alucinacion ni idiomas soportados; al ser un modelo base cuantizado sin ajuste de alineamiento documentado, conviene validar las salidas en produccion.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Consumo de disco adicional: hasta 5,11 GB de ficheros de cache generados junto al modelo en Mac.
- Rendimiento en CPU de movil muy limitado (8 tokens/s, 13,58 s al primer token en Pixel 8a): desaconsejado para interaccion en tiempo real en gama media.

## Enlaces

- Modelo convertido (LiteRT-LM): https://huggingface.co/litert-community/WeVisOne-VL-2B
- Modelo base (Tencent / WeChat Vision): https://huggingface.co/tencent/WeVisOne-VL-2B
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Imagen de ejemplo usada en la model card (NASA): https://images-assets.nasa.gov/image/KSC-08pd3809/KSC-08pd3809~orig.jpg
