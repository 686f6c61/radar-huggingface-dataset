# Loke-60000/deepseek-v4-flash-0731-spark-vision-exp

## Resumen

DeepSeek-V4-Flash-0731-Spark-Vision-Exp es un overlay experimental de visión sobre el backbone `0xSero/deepseek-v4-flash-0731-spark`, una versión podada y cuantizada de DeepSeek-V4-Flash-0731. El autor, Loke-60000, combina la torre de visión DeepEncoderV2 (SAM ViT-B más Qwen2) y un proyector procedentes de `FlyCockpit/DeepSeek-V4-Flash-0731-vision` con el backbone de lenguaje, y lo ejecuta sobre un único NVIDIA DGX Spark. El resultado es un endpoint compatible con OpenAI que sirve texto e imágenes con una ventana de contexto de 262144 tokens y decodificación especulativa DSpark activada.

El repositorio de HuggingFace no contiene pesos, sino documentación y mediciones; el código para construir y ejecutar el modelo vive en GitHub. El backbone está podado con REAP de 256 a 216 expertos enrutados y cuantizado con ExLlamaV3 (expertos en fp4, cola con codebook trellis de 3.0 bits, base fp8 e4m3). Las pruebas cualitativas muestran que la geometría de alto contraste y el texto renderizado se leen correctamente, pero las descripciones de ilustraciones y fotografías son poco fiables. El autor lo califica explícitamente como artefacto de investigación, no apto para usos donde una respuesta incorrecta tenga coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con torre de vision DeepEncoderV2 (SAM ViT-B + Qwen2) y proyector propio; 43 capas, 3 capas hash |
| Parametros totales | no disponible (el backbone original DeepSeek-V4-Flash-0731 tiene 284B; el proyector tiene 20.459.520 parametros) |
| Parametros activos | no disponible (el original declara 13B activos; esta version podada no publica el dato) |
| Longitud de contexto | 262144 tokens |
| Tipos de cuantizacion | fp4 (expertos), trellis MCG-codebook de 3.0 bits (cola), fp8 e4m3 con escalas ue8m0 (base), via ExLlamaV3 |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (tensores int16, int8, fp8_e4m3 y bf16) |

## Arquitectura y entrenamiento

El modelo es un MoE de 43 capas con enrutamiento híbrido: las capas 0, 1 y 2 seleccionan expertos mediante una tabla `tid2eid` de dimensiones `(129280, 6)` que mapea IDs de token a 216 expertos supervivientes, mientras que las capas 3 a 42 enrutan por estados ocultos. El podado REAP redujo el conjunto de expertos de 256 a 216 y reasignó la tabla sin dejar huecos. La cuantización ExLlamaV3 combina fp4 para expertos, un codebook trellis de 3.0 bits para la cola y fp8 e4m3 con escalas ue8m0 para la base.

La torre de visión DeepEncoderV2 (SAM ViT-B más Qwen2) produce embeddings que se proyectan mediante un MLP `Linear(896, 4096)`, GELU, `Linear(4096, 4096)` más un vector aprendido `view_seperator` de 4096 valores. El proyector es un checkpoint de desarrollo en el paso 4800, entrenado con pérdida de modelado de lenguaje contra el backbone congelado del modelo sin podar, no contra esta versión REAP/ExLlamaV3. El servidor es un fork de vLLM con SparkInfer que activa la decodificación especulativa DSpark. No se menciona entrenamiento con RLHF o DPO.

## Capacidades

- Generacion de texto: responde con normalidad a prompts de texto, segun las mediciones del autor.
- Vision basica: identifica formas y colores en imagenes de alto contraste (por ejemplo, "un circulo rojo y un rectangulo azul").
- OCR limitado: lee cadenas cortas de texto renderizado con alto contraste (por ejemplo, "GADGET-LAB42").
- Contexto largo: ventana de 262144 tokens, util para conversaciones o documentos extensos.
- Decodificacion especulativa: modulo DSpark adjunto para acelerar la inferencia.
- Enrutamiento por tabla de tokens: los embeddings de imagen no llevan informacion de enrutamiento; el sistema pasa `input_ids` junto a `inputs_embeds` para que el MoE seleccione expertos.
- Limitacion critica: las descripciones de fotografias e ilustraciones son poco fiables; el autor las considera un artefacto de investigacion.

## Casos de uso

- Investigacion de integracion vision-lenguaje en MoE podados: permite estudiar como se comporta un proyector entrenado para un modelo sin podar cuando se monta sobre un backbone REAP y cuantizado, y como afecta la cuantizacion a la calidad de la vision.
- Experimentacion con decodificacion especulativa en vision: el fork de vLLM con SparkInfer y DSpark permite medir el rendimiento de la generacion especulativa con entradas multimodales en un DGX Spark.
- Pruebas de OCR en entornos controlados: para cadenas cortas de texto de alto contraste, el modelo puede servir como banco de pruebas de extraccion de texto en imagenes sinteticas.
- Desarrollo de servidores OpenAI-compatibles multimodales: el endpoint unico para texto e imagen con contexto de 262K puede usarse para validar pipelines de despliegue con vLLM.
- Analisis de enrutamiento en MoE con vision: la tabla `tid2eid` y el comportamiento de las capas hash ofrecen un caso real para estudiar como se distribuyen los expertos con entradas de imagen.
- Educacion y divulgacion: como ejemplo documentado de como combinar componentes de terceros (torre de vision, proyector, backbone cuantizado) y de los problemas de calibracion de escala entre espacios de embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card solo incluye mediciones cualitativas de salida con temperatura 0:

| Entrada | Prompt | Salida |
|---|---|---|
| 448x448, circulo rojo y cuadrado azul sobre blanco | what shapes and colors | "A red circle and a blue rectangle." |
| 448x200, texto "GADGET-LAB 42" en negro | what text is written | "GADGET-LAB42" |
| Ilustracion 1358x1358, redimensionada a 1024 | describe in two or three sentences | Descripcion no relacionada con el contenido real |

No hay datos de latencia, throughput ni puntuaciones estandar (MMLU, HumanEval, etc.).

## Requisitos de hardware

- Hardware de referencia: un unico NVIDIA DGX Spark, segun la documentacion del autor.
- Tamano en disco del backbone: 98.8 GiB en 48 shards; la torre de vision ocupa 906.533.408 bytes.
- VRAM estimada: no disponible; el autor no publica el consumo de memoria en inferencia.
- GPU recomendadas: DGX Spark (no se documentan otras opciones).
- Opciones de despliegue: servidor vLLM con fork SparkInfer, imagen de contenedor `ghcr.io/0xsero/deepseek-v4-flash-0731-spark-sparkinfer`; endpoint compatible con OpenAI.
- Concurrencia: probada hasta cuatro secuencias; por encima de ese valor no esta testeada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loke-60000/deepseek-v4-flash-0731-spark-vision-exp | no disponible (backbone 284B original, podado a 216 expertos) | 262144 | Si, limitada y experimental | other | Documentacion y codigo; sin pesos publicados |
| deepseek-ai/DeepSeek-V4-Flash-0731 | 284B/13B activos | 1M (384K salida) | No (solo texto) | no disponible | Pesos oficiales en HuggingFace |
| 0xSero/deepseek-v4-flash-0731-spark | no disponible (version podada y cuantizada) | no disponible | No | other | Pesos en HuggingFace |

La comparativa se limita a especificaciones porque no hay benchmarks publicados para el overlay de vision. El modelo original de DeepSeek tiene capacidades agénticas mejoradas y una ventana de contexto mayor, pero carece de vision; este overlay anade vision a costa de fiabilidad.

## Limitaciones y advertencias

- Descripciones de fotografias e ilustraciones poco fiables: el autor documenta que la descripcion de una ilustracion compleja no guarda relacion con su contenido real.
- Proyector de desarrollo: es un checkpoint del paso 4800 entrenado para el modelo sin podar, no para esta version REAP y ExLlamaV3; la calidad de vision no es representativa del modelo original.
- OCR limitado: solo se ha probado con cadenas cortas de alto contraste; el OCR fino no esta testeado.
- Concurrencia no probada por encima de cuatro secuencias.
- Tiling condicionado: solo se activa cuando el lado mas largo de la imagen alcanza 1536 pixeles; una imagen de 1024 pixeles produce una sola vista de 256 tokens.
- No apto para produccion: el autor lo califica como artefacto de investigacion y desaconseja su uso donde una respuesta incorrecta tenga coste.
- Licencia "other": no se especifican los terminos exactos; hay que verificar las restricciones antes de cualquier uso comercial.
- El repositorio de HuggingFace no contiene pesos, solo documentacion; para reproducir el modelo hay que seguir el codigo de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Loke-60000/deepseek-v4-flash-0731-spark-vision-exp
- Repositorio de codigo: https://github.com/Loke-60000/deepseek-v4-flash-spark-vision
- Backbone base: https://huggingface.co/0xSero/deepseek-v4-flash-0731-spark
- Torre de vision y proyector: https://huggingface.co/FlyCockpit/DeepSeek-V4-Flash-0731-vision
- Servidor SparkInfer: https://github.com/0xSero/deepseek-v4-flash-0731-spark-sparkinfer
- Fix de EAGLE3 (PR en FlyCockpit): https://github.com/FlyCockpit/DeepSeek-V4-Vision-2x-DGX-Sparks/pull/1
- Issue de crash mtp0 en SparkInfer: https://github.com/0xSero/deepseek-v4-flash-0731-spark-sparkinfer/issues/4
- Modelo original DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
