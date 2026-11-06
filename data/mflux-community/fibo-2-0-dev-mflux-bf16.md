# mflux-community/fibo-2-0-dev-mflux-bf16

## Resumen

Fibo-2.0-dev MFlux BF16 es una conversión comunitaria del modelo de generación de imágenes a partir de texto Fibo-2.0-dev, desarrollado originalmente por Bria AI. Esta versión, publicada por mflux-community, reempaqueta los pesos originales en formato MLX con precisión BF16 para ejecutarse de forma nativa en Apple Silicon mediante MFlux, la herramienta de código abierto de Filip Strand que permite correr modelos generativos de imagen localmente en Mac.

El modelo resuelve el problema de desplegar un modelo text-to-image de alta fidelidad en hardware Apple sin depender de CUDA ni de servicios en la nube. Al ser la variante BF16 (sin cuantización), constituye la referencia de máxima fidelidad del modelo original dentro del ecosistema MFlux, con un tamaño de repositorio de 25,1 GB.

Es relevante para desarrolladores que trabajan en entornos macOS y necesitan inferencia local de generación de imágenes con la máxima calidad posible, o que quieren usar esta versión como punto de partida para cuantizar al vuelo con `--quantize`. La licencia del modelo original (fibo-2.0-dev-license) se mantiene sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un modelo text-to-image en el sentido de LLM) |
| Tipos de cuantizacion | BF16 (esta version, sin cuantizar); versiones Q8, Q6, Q5, Q4 y Q3 publicadas en repos separados |
| Idiomas soportados | no disponible (prompts en lenguaje natural; idiomas no declarados) |
| Licencia | fibo-2.0-dev-license (heredada del modelo original briaai/Fibo-2.0-dev) |
| Formato de pesos | safetensors en formato MLX (BF16) |
| Tamano del repositorio | 25,1 GB |
| Libreria | mflux |
| Pipeline | text-to-image |
| Modelo base | briaai/Fibo-2.0-dev |
| Relacion con el base | quantized (conversion a MLX) |
| Fecha de conversion | 2026-10-25, con MFlux 0.23.0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. La model card de esta conversion solo indica que se trata de una conversion de los pesos de briaai/Fibo-2.0-dev a MLX en precision BF16, sin modificar el modelo mas alla del cambio de formato. Para conocer la arquitectura (tipo de difusion, backbone, VAE, text encoder) y los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas) es necesario consultar la model card del modelo original.

La innovacion tecnica destacable de este repositorio no esta en el modelo en si, sino en el ecosistema: MFlux implementa la inferencia en MLX nativo para Apple Silicon, lo que permite ejecutar el modelo localmente en Mac. La version BF16 es la de mayor fidelidad y sirve como referencia; ademas, MFlux permite aplicar cuantizacion al vuelo mediante el flag `--quantize`.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resoluciones configurables mediante los parametros `--width` y `--height` (el ejemplo de la model card usa 1024x1024).
- Control de reproducibilidad mediante semilla (`--seed`).
- Inferencia local nativa en Apple Silicon a traves de MLX.
- Ejecucion como referencia de maxima fidelidad en BF16, o con cuantizacion al vuelo mediante `--quantize`.
- Descarga automatica de pesos desde Hugging Face en el primer uso, o uso de copia local con `--model`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento, lo cual es coherente con un modelo puramente text-to-image.

## Casos de uso

- Generacion de ilustraciones y concept art en local: un disenador puede lanzar `mflux-generate-fibo2` con prompts descriptivos y obtener imagenes a 1024x1024 sin enviar datos a servicios externos, lo que resulta adecuado para material creativo confidencial.
- Prototipado rapido de assets para videojuegos o interfaces: gracias a la semilla fija y a la posibilidad de repetir generaciones, se pueden producir variaciones controladas de un mismo concepto para iterar sobre direcciones visuales.
- Referencia de calidad para evaluacion de cuantizaciones: al ser la version BF16 sin perdida, sirve para comparar visualmente los resultados de las variantes Q8, Q6, Q5, Q4 y Q3 y decidir el equilibrio calidad/tamano adecuado para produccion.
- Pipelines de generacion por lotes en macOS: integrable en scripts que invoquen la CLI de MFlux con distintos prompts, tamanos y semillas, aprovechando la ejecucion local en equipos Apple.
- Generacion de imagenes para documentacion tecnica o blogs: el modelo puede producir ilustraciones a partir de descripciones textuales sin depender de conectividad ni de APIs de terceros.
- Investigacion sobre difusion en Apple Silicon: util para estudiar el rendimiento y la fidelidad de modelos text-to-image ejecutados en MLX frente a implementaciones CUDA, usando esta version BF16 como linea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio BF16 ocupa 25,1 GB; se requiere memoria unificada suficiente para cargar los pesos en MLX, por lo que en la practica conviene disponer de un Mac con al menos 32 GB de memoria unificada (no confirmado en la informacion disponible).
- GPU recomendadas: hardware Apple Silicon (serie M). No aplica a GPU NVIDIA/AMD, ya que la implementacion es MLX nativa.
- Cabe en consumer GPU: no en el sentido tradicional; esta pensado para Macs con Apple Silicon. Para equipos con menos memoria, las variantes cuantizadas reducen el requisito: Q8 13,4 GB, Q6 10,3 GB, Q5 8,8 GB, Q4 7,2 GB y Q3 5,6 GB.
- Opciones de despliegue: MFlux (CLI `mflux-generate-fibo2`), instalable con `uv tool install --upgrade mflux`. No se documentan opciones como vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibo-2-0-dev-mflux-bf16 (esta ficha) | no disponible | no aplica | MLX safetensors BF16 | fibo-2.0-dev-license | Hugging Face, 145 descargas |
| briaai/Fibo-2.0-dev (original) | no disponible | no aplica | no disponible en la informacion | fibo-2.0-dev-license | Hugging Face (modelo base) |
| mflux-community/fibo-2-0-dev-mflux-q4 | no disponible | no aplica | MLX safetensors Q4 (7,2 GB) | fibo-2.0-dev-license | Hugging Face |
| mflux-community/fibo-2-0-dev-mflux-q8 | no disponible | no aplica | MLX safetensors Q8 (13,4 GB) | fibo-2.0-dev-license | Hugging Face |

No se dispone de datos de rendimiento comparado con modelos de otras familias (por ejemplo, otros text-to-image) en la informacion proporcionada.

## Limitaciones y advertencias

- Esta es una conversion comunitaria, no una publicacion oficial de Bria AI; los pesos solo se han modificado para convertirlos a MLX.
- La licencia fibo-2.0-dev-license puede imponer restricciones de uso comercial; es imprescindible revisar los terminos completos en la model card del modelo original antes de usarlo en produccion.
- El modelo esta disenado para Apple Silicon; no es ejecutable en GPU NVIDIA o AMD con esta implementacion.
- El tamano BF16 (25,1 GB) exige equipos con memoria unificada abundante; en Macs con menos RAM conviene usar las variantes cuantizadas.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible; al ser un modelo de imagen, el concepto de alucinacion se traduce en posible fidelidad limitada al prompt, pero no hay datos concretos publicados.
- No se dispone de informacion sobre resoluciones maximas soportadas, numero de pasos de inferencia recomendados ni parametros de guia (guidance scale) en la documentacion proporcionada.
- La fecha de creacion del repositorio (2026-10-25) y la version de MFlux usada (0.23.0) deben tenerse en cuenta para reproducir exactamente la conversion.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-bf16
- Modelo original: https://huggingface.co/briaai/Fibo-2.0-dev
- MFlux (GitHub): https://github.com/filipstrand/mflux
- Comunidad MFlux en Hugging Face: https://huggingface.co/mflux-community
- Version Q8: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q8
- Version Q6: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q6
- Version Q5: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q5
- Version Q4: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q4
- Version Q3: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q3
