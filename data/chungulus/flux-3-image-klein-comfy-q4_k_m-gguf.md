# Chungulus/flux-3-image-klein-comfy-Q4_K_M-GGUF

## Resumen

FLUX 3 Image Klein Q4_K_M GGUF es una cuantización de tipo GGUF del transformer de difusión destilado que forma parte del paquete ComfyUI de FLUX 3 Image Klein publicado por Black Forest Labs (BFL). El artefacto lo distribuye el usuario independiente Chungulus y no es una release oficial ni avalada por BFL: se trata de un derivado comunitario modificado que conserva los nombres y formas de los tensores originales para que ComfyUI pueda reconocer la red FLUX3 nativa. El transformer cuantizado tiene 5.548.681.984 parámetros y el repositorio ocupa 3,3 GB.

El modelo resuelve el problema de ejecutar un modelo de generación y edición de imágenes de gran tamaño en entornos con VRAM limitada, ofreciendo una versión de 4 bits del transformer de difusión que se carga mediante la extensión ComfyUI-GGUF. Es relevante porque permite probar el pipeline FLUX 3 Image Klein en GPUs de consumo sin necesidad de los pesos BF16 completos, manteniendo el codificador de texto, el VAE y el upsampler de prompt en su precisión original.

La ficha se centra en el artefacto GGUF y su integración en ComfyUI. No hay información publicada sobre benchmarks, composición del dataset de entrenamiento ni métricas de calidad objetivas; las validaciones del autor son comprobaciones funcionales limitadas, no una evaluación de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image transformer) destilado, parte del pipeline FLUX 3 Image Klein; cuantizado en GGUF |
| Parametros totales | 5.548.681.984 (transformer cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de texto) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); el autor indica que genero cada formato de forma independiente desde los pesos BF16, sin recuantizar desde baja precision |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (license: other, license_name: flux-kommunity-license) |
| Formato de pesos | GGUF (transformer); los acompanantes se mantienen en safetensors BF16 |

## Arquitectura y entrenamiento

El artefacto es una cuantización Q4_K_M del transformer de difusión destilado incluido en el paquete BF16 original de BFL para ComfyUI. No se trata de un modelo de lenguaje: es el componente de difusión que genera y edita imágenes, y se consume desde ComfyUI mediante la extensión ComfyUI-GGUF, no desde la CLI de generación de texto de llama.cpp. El repositorio no incluye cuantizados el checkpoint base sin destilar, el codificador de texto, el upsampler de prompt ni el VAE; estos deben tomarse del paquete fuente original.

El autor declara que cada artefacto se genero de forma independiente a partir de los pesos BF16 originales, sin recuantizar desde una fuente de baja precision y sin matriz de calibración ni de importancia. Durante la conversión se comprobaron los payloads de los tensores fuente y, para cada tensor cuantizado, el nombre y la forma. Los modelos acompanantes se mantuvieron en su precision original. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni las tecnicas de alineacion (RLHF/DPO) empleadas por BFL en el modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen (text-to-image) mediante el pipeline FLUX 3 Image Klein en ComfyUI.
- Edicion de imagenes (image-to-image) adjuntando imagenes de referencia a traves de ReferenceMultiLatent.
- Integracion nativa con ComfyUI: el modelo se detecta como red FLUX3 gracias a los nombres de tensor preservados.
- Carga mediante Unet Loader (GGUF) de la extension ComfyUI-GGUF, sustituyendo al cargador de modelo de difusion original.
- Uso con el codificador de texto `qwen3vl_4b_bf16.safetensors` (CLIPLoader, tipo `flux3`) y el VAE `flux2-vae.safetensors` (VAELoader) del paquete fuente.
- Soporte de prompts cortos mediante el upsampler de prompt upstream o un LLM de expansion de caption; tambien admite directamente un caption de escena completamente expandido.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.

## Casos de uso

- Prototipado de generacion de imagenes en equipos con VRAM limitada: cargar el GGUF Q4_K_M en ComfyUI permite iterar sobre prompts y estilos sin disponer de los pesos BF16 completos del transformer.
- Edicion de imagenes por referencia: adjuntar una o varias imagenes mediante ReferenceMultiLatent y aplicar transformaciones guiadas por prompt, usando los ajustes validados por el autor (512 x 512, 16 pasos, Euler/simple, CFG 1.0, alpha 16).
- Pruebas de pipeline en CI o entornos de desarrollo: el menor tamano del artefacto (3,3 GB de repositorio) facilita su descarga y despliegue en maquinas de pruebas frente al paquete BF16.
- Evaluacion comparativa de cuantizaciones: al ser un Q4_K_M generado desde BF16 sin recuantizar, sirve para medir la perdida de calidad frente a otros formatos del mismo transformer.
- Generacion de material grafico asistida en flujos ComfyUI existentes: sustituir el cargador de difusion por Unet Loader (GGUF) sin cambiar el resto del grafo.
- Docencia y experimentacion con modelos de difusion: permite estudiar el comportamiento de un transformer de difusion destilado de ~5,5 mil millones de parametros en hardware de consumo.
- Creacion de variantes comunitarias: servir de base para otras cuantizaciones o derivados, respetando las condiciones de la FLUX Kommunity License.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta validaciones funcionales: cada artefacto se cargo como modelo FLUX3 nativo y genero una muestra texto-a-imagen y una edicion de imagen. Se trata de comprobaciones limitadas, no de un benchmark ni de una garantia de calidad de imagen sin cambios. Los detalles de ajustes y limites estan en `validation.json` y `quantizatia-manifest.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 3,3 GB y el transformer cuantizado pesa menos que los pesos BF16, por lo que se reduce el requisito de VRAM del componente de difusion, pero deben sumarse el codificador de texto Qwen3-VL 4B en BF16, el VAE y el upsampler.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el proposito declarado de la cuantizacion es facilitar la ejecucion en entornos con menos VRAM.
- Opciones de despliegue: ComfyUI con soporte nativo de FLUX3 y la extension ComfyUI-GGUF (Unet Loader GGUF). No es compatible con la CLI de generacion de texto de llama.cpp.
- Latencia y throughput: no disponibles. Los ajustes de validacion reportados son 512 x 512, 16 pasos, sampler Euler/simple, CFG 1.0 y alpha 16 (ModelSamplingFlux shift `log(16)`).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein Q4_K_M GGUF (este) | 5.548.681.984 (transformer) | GGUF Q4_K_M | no aplica | FLUX Kommunity License | Hugging Face, derivado comunitario |
| FLUX 3 Image Klein ComfyUI (BF16, BFL) | no disponible | safetensors BF16 | no aplica | FLUX Kommunity License | Hugging Face, release oficial |
| Otras cuantizaciones del mismo transformer | 5.548.681.984 (transformer) | GGUF (varios formatos) | no aplica | FLUX Kommunity License | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- No es una release oficial de Black Forest Labs: es un derivado comunitario modificado e independiente, sin aval de BFL.
- Las validaciones del autor son comprobaciones funcionales limitadas; no garantizan que la calidad de imagen se mantenga respecto a los pesos BF16.
- La cuantizacion a 4 bits puede introducir degradacion en la fidelidad de las imagenes generadas o editadas; no se han publicado metricas al respecto.
- Requiere los archivos acompanantes del paquete fuente (codificador de texto Qwen3-VL 4B BF16, VAE flux2 y upsampler de prompt); el repositorio no los incluye cuantizados.
- No es utilizable desde llama.cpp ni como modelo de texto: solo funciona como modelo de difusion en ComfyUI con ComfyUI-GGUF.
- Sujeto a la FLUX Kommunity License, incluida sus condiciones de uso y distribucion; los terceros reciben los derechos directamente de BFL, no una sublicencia de Chungulus. No se hace ninguna afirmacion de uso comercial sin restricciones. Debe leerse `LICENSE.md` y `NOTICE.md`.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion aplicables a un modelo de imagen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Revision concreta del paquete fuente citada por el autor: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/tree/9d36114cf7a2e03a45c28f5cc4987d20ebfdb6c1
- Extension ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia FLUX Kommunity: LICENSE.md (en el repositorio)
- Aviso de modificacion: NOTICE.md (en el repositorio)
