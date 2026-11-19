# dissembill/mirror-qwen-image-2-1-mflux-q4

## Resumen

Esta ficha describe `dissembill/mirror-qwen-image-2-1-mflux-q4`, una conversion comunitaria del modelo de generacion de imagenes Qwen-Image-2.1 de Alibaba Qwen al formato MLX de Apple, cuantizada a 4 bits mediante la herramienta MFlux. No se trata de un modelo entrenado desde cero, sino de un espejo (mirror) de los pesos oficiales de Qwen-Image-2.1 transformados para ejecutarse de forma nativa en Apple Silicon a traves del framework MLX. El repositorio ocupa 10,6 GB y se distribuye en formato safetensors con cuantizacion afina de 4 bits aplicada al text encoder, al transformer y al VAE.

La relevancia de esta version radica en que permite ejecutar un modelo de difusion de ultima generacion para text-to-image en hardware de consumo de Apple (Mac con chip M-series), sin necesidad de GPUs NVIDIA ni de infraestructura en la nube. Frente a la version BF16 original (33,1 GB), la cuantizacion Q4 reduce el peso a menos de un tercio, manteniendo la arquitectura y el pipeline del modelo base. Es, por tanto, una pieza pensada para desarrolladores que quieren prototipar o desplegar generacion de imagenes localmente en macOS.

El modelo hereda la licencia `qwen-research` del modelo original, lo que condiciona su uso comercial. La conversion fue realizada por MFlux-Community con MFlux 0.24.0 el 31 de octubre de 2026, y este repositorio concreto (bajo la cuenta `dissembill`) actua como espejo del publicado originalmente por dicha comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (transformer + text encoder + VAE), ejecutado en MLX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (MLX affine quantization, 4 bits) sobre text encoder, transformer y VAE; existen variantes Q3, Q5, Q6, Q8 y BF16 en el repositorio de MFlux-Community |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (heredada del modelo base Qwen/Qwen-Image-2.1) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un generador de imagenes condicionado por texto que combina un text encoder, un transformer de difusion y un VAE, siguiendo el paradigma habitual de los modelos de difusion latente modernos. Esta version no aporta cambios arquitectonicos: se limita a convertir los pesos originales al formato MLX y a aplicar cuantizacion afina de 4 bits en los tres componentes. El nivel de cuantizacion queda almacenado en los propios pesos, de modo que no es necesario pasar un flag `--quantize` en tiempo de inferencia.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion, ya que la model card de esta conversion no los detalla. La unica innovacion tecnica documentada es la propia conversion a MLX con cuantizacion Q4, realizada con MFlux 0.24.0, que permite ejecutar el modelo en Apple Silicon de forma nativa.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resoluciones configurables, por ejemplo 1024x1024.
- Control de semilla (`--seed`) para reproducibilidad de resultados.
- Control de dimensiones de salida mediante `--width` y `--height`.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de CUDA.
- Compatibilidad con el ecosistema MFlux (`mflux-generate-qwen-2.1`) y descarga automatica de pesos desde Hugging Face.
- No se documentan capacidades de edicion de imagen, inpainting, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Prototipado local de generacion de imagenes en macOS: un desarrollador con un Mac equipado con chip M-series puede instalar MFlux con `uv tool install mflux` y generar imagenes sin salir del entorno local, aprovechando la cuantizacion Q4 para reducir el consumo de memoria.
- Generacion de ilustraciones para documentacion tecnica o blogs: con prompts descriptivos y resoluciones de 1024x1024, el modelo produce imagenes de acompanamiento para articulos, sin coste de API y con control de semilla para repetir resultados.
- Experimentacion con pipelines de difusion en MLX: investigadores que quieran estudiar el comportamiento de un modelo text-to-image de ultima generacion en el stack de Apple pueden usar esta conversion como banco de pruebas, comparando variantes Q3 a Q8 disponibles en el repositorio de MFlux-Community.
- Creacion de assets para maquetas y demos: equipos de producto pueden generar imagenes de relleno (placeholders) realistas para prototipos de interfaz sin depender de servicios externos.
- Evaluacion comparativa de cuantizaciones: al existir versiones Q3, Q4, Q5, Q6, Q8 y BF16, es posible medir el compromiso entre calidad de imagen y uso de memoria en el mismo hardware, usando este repo como punto de partida.
- Entornos con restricciones de privacidad: al ejecutarse en local, los prompts y las imagenes generadas no salen del equipo, lo que resulta adecuado para contenido sensible que no deba enviarse a APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ejecutarse en Apple Silicon, la metrica relevante es la memoria unificada. El repositorio pesa 10,6 GB en disco; se requiere memoria unificada suficiente para cargar los pesos cuantizados y el estado de inferencia, aunque no se especifica un minimo oficial en la informacion disponible.
- GPU recomendadas: chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte MLX. No aplica a GPUs NVIDIA o AMD, dado que el formato es MLX.
- Cabe en hardware de consumo: si, en equipos Mac con memoria unificada suficiente; las variantes Q3 (8,7 GB) y Q4 (10,6 GB) son las mas ligeras de la familia.
- Opciones de despliegue: MFlux (CLI `mflux-generate-qwen-2.1`), con descarga automatica desde Hugging Face o uso de copia local via `hf download`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dissembill/mirror-qwen-image-2-1-mflux-q4 | no disponible | no disponible | safetensors (MLX, Q4) | qwen-research | Hugging Face |
| mflux-community/qwen-image-2-1-mflux-bf16 | no disponible | no disponible | safetensors (MLX, BF16) | qwen-research | Hugging Face |
| mflux-community/qwen-image-2-1-mflux-q8 | no disponible | no disponible | safetensors (MLX, Q8) | qwen-research | Hugging Face |
| Qwen/Qwen-Image-2.1 (original) | no disponible | no disponible | safetensors | qwen-research | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de otros generadores text-to-image comparables (parametros, contexto o benchmarks).

## Limitaciones y advertencias

- Es una conversion comunitaria, no una release oficial de los autores de Qwen-Image-2.1; la calidad y fidelidad de la cuantizacion Q4 no estan validadas por el equipo original.
- La licencia `qwen-research` impone restricciones de uso; es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- La cuantizacion a 4 bits puede degradar la calidad de las imagenes generadas frente a las versiones BF16 o Q8, especialmente en detalles finos y texto dentro de la imagen.
- El modelo esta disenado exclusivamente para Apple Silicon con MLX; no es portable a CUDA, ROCm ni otras plataformas sin reconversion.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma en la informacion disponible; al ser text-to-image, el riesgo principal es la generacion de contenido no deseado o estereotipado segun el prompt.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- No se especifican requisitos minimos de memoria unificada ni latencias, por lo que el rendimiento real en cada Mac debe medirse empiricamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dissembill/mirror-qwen-image-2-1-mflux-q4
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q5
- Variante Q3: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q3
