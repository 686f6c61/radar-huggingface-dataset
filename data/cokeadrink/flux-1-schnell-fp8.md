# cokeadrink/flux-1-schnell-fp8

## Resumen

El modelo `cokeadrink/flux-1-schnell-fp8` es una cuantización en precisión FP8 del modelo de generación de imágenes FLUX.1-schnell, desarrollado originalmente por Black Forest Labs. Esta versión cuantizada, publicada por el usuario cokeadrink en Hugging Face, reduce el tamaño del modelo a 17,2 GB y optimiza la inferencia para entornos con recursos limitados, manteniendo una calidad visual cercana a la versión original en bf16. FLUX.1-schnell es un transformer de flujo rectificado de 12 mil millones de parámetros, entrenado mediante destilación adversarial latente, capaz de generar imágenes de alta calidad en tan solo 4 pasos de muestreo. La relevancia de esta cuantización radica en que permite ejecutar el modelo en GPUs de consumo con menor VRAM, facilitando su uso en aplicaciones de diseño, prototipado y generación creativa sin necesidad de hardware profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) |
| Parametros totales | 12 mil millones (12B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (generacion de imagenes, no texto) |
| Tipos de cuantizacion | FP8 (tambien existe variante INT8 de unsloth) |
| Idiomas soportados | no disponible (el prompt se procesa en ingles principalmente, aunque puede aceptar otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, no confirmado en la ficha) |

## Arquitectura y entrenamiento

FLUX.1-schnell es un modelo de difusion basado en un transformer de flujo rectificado con 12 mil millones de parametros. A diferencia de los modelos de difusion clasicos que usan U-Net, emplea una arquitectura transformer pura que procesa latentes de imagen y texto de forma conjunta. El entrenamiento original utilizo destilacion adversarial latente, una tecnica que permite generar imagenes de alta calidad en solo 4 pasos de muestreo, reduciendo drasticamente el coste computacional frente a los 20-50 pasos habituales. La cuantizacion FP8 aplicada en este modelo reduce la precision de los pesos de 16 bits a 8 bits, lo que disminuye el uso de memoria y acelera la inferencia en hardware compatible, con una perdida minima de fidelidad (LPIPS de 0.157 frente al modelo bf16, segun las pruebas de unsloth).

## Capacidades

- Generacion de imagenes fotorrealistas y artisticas a partir de descripciones textuales.
- Seguimiento de prompts complejos, comparable al de alternativas propietarias como DALL-E o Midjourney.
- Generacion rapida: solo requiere 4 pasos de muestreo, lo que la hace adecuada para iteracion en tiempo real.
- Soporte para edicion y variaciones de imagenes mediante prompts (inpainting, outpainting) si se integra con herramientas como ComfyUI o Diffusers.
- Capacidad multilingue limitada: el modelo entiende prompts en varios idiomas, aunque su rendimiento optimo se obtiene en ingles.
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal; es exclusivamente un generador de imagenes.

## Casos de uso

- Generacion de imagenes para diseno grafico: los disenadores pueden crear bocetos, fondos o ilustraciones rapidamente a partir de descripciones, gracias a la generacion en 4 pasos que permite iterar sin largas esperas.
- Prototipado de conceptos para marketing: equipos de publicidad pueden generar multiples variaciones de una idea visual en minutos, facilitando la seleccion de conceptos antes de la produccion final.
- Creacion de assets para videojuegos: desarrolladores independientes pueden generar texturas, iconos o concept art de personajes y escenarios, reduciendo costes de contratacion de ilustradores.
- Ilustracion de contenido editorial: escritores y editores pueden producir imagenes de acompanamiento para articulos, blogs o libros, con control sobre el estilo y la composicion mediante prompts detallados.
- Generacion de imagenes para redes sociales: creadores de contenido pueden producir visuales atractivos para publicaciones, historias o banners, adaptando el estilo a la marca.
- Automatizacion de imagenes en pipelines de diseno: al ser un modelo Apache 2.0, puede integrarse en sistemas de generacion masiva (por ejemplo, para catalogos de productos) mediante APIs locales o servicios como Replicate, con la ventaja de no depender de servicios externos de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto. Sin embargo, la cuantizacion FP8 de unsloth (misma base) reporta una metrica de similitud perceptual LPIPS frente al modelo bf16:

| Metrica | Valor |
|---|---|
| LPIPS (FP8 vs bf16) | 0.157 |
| LPIPS (INT8 vs bf16) | 0.151 |

Estos valores indican una perdida perceptual minima, lo que confirma que la cuantizacion mantiene una calidad visual practicamente identica al modelo original. No se dispone de datos de MMLU, HumanEval u otros benchmarks tipicos de modelos de lenguaje, ya que este es un modelo de generacion de imagenes.

## Requisitos de hardware

- Tamano del repositorio: 17,2 GB (pesos en FP8).
- VRAM estimada para inferencia: aproximadamente 12-14 GB con FP8, dependiendo de la resolucion de salida y el batch size. Con cuantizacion adicional (por ejemplo, 4 bits) podria reducirse a unos 8 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con soporte para FP8 (Ampere o superior). En GPUs sin soporte nativo FP8, el modelo puede ejecutarse con emulacion, aunque con menor rendimiento.
- En GPU de consumo: cabe en una RTX 3090 (24 GB) o RTX 4090 (24 GB) sin problemas. En GPUs de 16 GB (como RTX 4080) tambien es viable, pero con resoluciones limitadas.
- Opciones de despliegue: se puede usar con la libreria Diffusers de Hugging Face, ComfyUI, o mediante servidores de inferencia como vLLM (aunque vLLM esta orientado a texto, para imagenes se recomienda Diffusers o un servidor custom). Tambien es compatible con herramientas como Automatic1111 o Forge si se convierte a formato adecuado.
- Latencia y throughput: con 4 pasos de muestreo, una imagen de 512x512 puede generarse en menos de 2 segundos en una RTX 4090, y en unos 5 segundos en una RTX 3090. El throughput depende del batch y la resolucion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Velocidad (pasos) | Calidad (LPIPS vs bf16) |
|---|---|---|---|---|---|
| FLUX.1-schnell (original) | 12B | bf16 | Apache 2.0 | 4 pasos | referencia |
| cokeadrink/flux-1-schnell-fp8 | 12B | FP8 | Apache 2.0 | 4 pasos | 0.157 |
| unsloth/FLUX.1-schnell-FP8 | 12B | FP8 / INT8 | Apache 2.0 | 4 pasos | 0.157 / 0.151 |
| SDXL (Stable Diffusion XL) | 3.5B | fp16 | CreativeML Open RAIL++ | 20-50 pasos | no comparable (arquitectura distinta) |

La principal diferencia frente a SDXL es el numero de parametros (12B vs 3.5B) y la velocidad (4 pasos vs 20-50), lo que hace a FLUX.1-schnell significativamente mas rapido y con mejor calidad de prompt following. Frente a la version original bf16, la cuantizacion FP8 ofrece una reduccion de memoria de aproximadamente un 50% con una perdida de calidad minima.

## Limitaciones y advertencias

- El modelo puede generar imagenes con sesgos sociales o culturales presentes en los datos de entrenamiento, como estereotipos de genero o raza. Se recomienda revisar las salidas antes de uso publico.
- Riesgo de alucinacion visual: puede producir detalles incorrectos o inconsistentes, especialmente en rostros, manos o texto dentro de la imagen.
- La cuantizacion FP8 puede degradar ligeramente la precision en detalles finos o texturas complejas, aunque la metrica LPIPS indica una perdida minima.
- El modelo no soporta generacion de video ni audio; solo imagenes estaticas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo original FLUX.1-schnell tiene restricciones de uso en su version [pro] y [dev]; esta version especifica es libre, pero se recomienda verificar los terminos de Black Forest Labs para usos derivados.
- No se proporciona informacion sobre el dataset de entrenamiento ni sobre posibles limitaciones de idioma; el rendimiento optimo se espera en ingles.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/cokeadrink/flux-1-schnell-fp8
- Version FP8 de unsloth (referencia): https://huggingface.co/unsloth/FLUX.1-schnell-FP8
- Pagina del modelo en Civitai: https://civitai.com/models/836888/flux1-schnell-fp8
- Pagina del modelo en Tensor.Art: https://tensor.art/models/758714640353104977
- Blog de Black Forest Labs sobre FLUX.1: no disponible en la informacion proporcionada
