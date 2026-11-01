# l666A/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una distribucion de pesos cuantizados del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicada por el usuario l666A (con enlaces internos a la organizacion abenzerps). Se trata de un modelo text-to-image de aproximadamente 7.115 millones de parametros que el autor redistribuye en multiples formatos: GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16), safetensors en FP8, INT8 ConvRot y NVFP4, y variantes MLX de 4, 6 y 8 bits optimizadas para Apple Silicon. El paquete incluye ademas el text encoder Qwen3-VL de 8B y el VAE del modelo base, empaquetados para su uso directo en ComfyUI mediante el nodo ComfyUI-GGUF.

La relevancia de esta publicacion es practica: permite ejecutar localmente un modelo de difusion de ~7B de parametros en GPUs de consumo y en equipos Apple Silicon, algo impensable con los pesos en BF16 (14,23 GB solo el transformer). Las cuantizaciones de 4 bits reducen el transformer a entre 4 y 4,6 GB, lo que abre la generacion de imagenes por difusion a tarjetas con 8-12 GB de VRAM. La etiqueta "uncensored" indica que el autor ha publicado pesos sin el filtrado de seguridad del modelo original, un aspecto que condiciona fuertemente su uso responsable y su encaje legal.

No se dispone de informacion detallada sobre la arquitectura interna del modelo base, el proceso de entrenamiento, los idiomas soportados ni resultados de benchmarks numericos en la informacion proporcionada. La model card incluye una imagen de benchmark del modelo base, pero no se transcriben cifras en el texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image; el paquete incluye text encoder Qwen3-VL 8B y VAE) |
| Parametros totales | 7.115.124.736 (~7,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF y safetensors (incluye variantes MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen-Image-2.1 es un modelo de generacion de imagenes a partir de texto. El paquete cuantizado incluye tres componentes diferenciados: el transformer de difusion (~7,1B de parametros), un text encoder basado en Qwen3-VL de 8B (17,53 GB en BF16, 9,35 GB en INT8 ConvRot) y un VAE de 676 MB en BF16. Esta separacion en tres ficheros es la habitual en pipelines de difusion modernos y es la que espera ComfyUI para ensamblar el grafo de inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas del modelo base en la informacion proporcionada. La model card del autor se limita a listar los ficheros cuantizados y las instrucciones de instalacion en ComfyUI, sin describir el proceso de entrenamiento ni la arquitectura del transformer de difusion. La modificacion "uncensored" consiste, segun la denominacion del autor, en redistribuir los pesos del modelo base sin el filtrado de seguridad, pero no se documenta la metodologia exacta empleada.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (pipeline text-to-image).
- Soporte de multiples niveles de cuantizacion para adaptarse a distintos presupuestos de VRAM y plataformas (NVIDIA, Apple Silicon).
- Integracion nativa con ComfyUI mediante el nodo ComfyUI-GGUF, incluyendo grafos con transformer, text encoder y VAE separados.
- Variantes MLX optimizadas para inferencia en Apple Silicon (4, 6 y 8 bits).
- Variantes NVFP4 e INT8 ConvRot para GPUs compatibles con formatos de baja precision.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo "thinking"; es un modelo puramente generativo de imagen.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: con la cuantizacion Q4_K_M (4,60 GB) el modelo cabe en GPUs de 8-12 GB de VRAM, lo que permite iterar sobre bocetos visuales en un equipo de desarrollo sin depender de APIs externas.
- Creacion de assets para videojuegos y entornos 3D: el pipeline completo (transformer + text encoder INT8 + VAE) puede ejecutarse en local para generar variaciones de texturas, concept art y sprites con control total sobre los pesos.
- Experimentacion en investigacion sobre difusion: al ofrecer el mismo modelo en BF16, FP8, INT8, NVFP4 y MLX, permite comparar el impacto de la cuantizacion en la calidad de imagen con un unico checkpoint de referencia.
- Despliegue en estaciones de trabajo Apple Silicon: las variantes MLX de 4, 6 y 8 bits (4,00-7,56 GB) estan pensadas para ejecutarse en Macs con memoria unificada, habilitando generacion de imagen local en portatiles de gama alta.
- Automatizacion de contenido creativo en pipelines internos: integrado en ComfyUI, el modelo puede encadenarse con nodos de postprocesado, upscaling o inpainting para producir lotes de imagenes de forma reproducible.
- Evaluacion de riesgos y seguridad en IA generativa: al tratarse de una version "uncensored", es util en entornos de red teaming para estudiar como se comportan los modelos de difusion sin filtros y disenar mitigaciones.
- Prototipado rapido en ComfyUI: la disponibilidad de todos los ficheros companion (text encoder y VAE) en el mismo repositorio simplifica la puesta en marcha y reduce errores de configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) del modelo base, pero no se transcriben cifras en el texto proporcionado, por lo que no se presentan datos comparativos.

## Requisitos de hardware

- VRAM estimada para el transformer segun cuantizacion: BF16 ~14,23 GB; Q8_0 ~7,59 GB; Q6_K ~5,88 GB; Q5_K_M ~5,22 GB; Q4_K_M ~4,60 GB; Q4_0 ~4,15 GB; FP8 ~6,63 GB; INT8 ConvRot ~6,76 GB; NVFP4 ~4,20 GB; MLX 4-bit ~4,00 GB; MLX 6-bit ~5,78 GB; MLX 8-bit ~7,56 GB.
- A esa cifra hay que sumar el text encoder (17,53 GB en BF16 o 9,35 GB en INT8 ConvRot) y el VAE (676 MB). Para un presupuesto ajustado, la combinacion recomendada es transformer Q4_K_M + text encoder INT8 ConvRot + VAE BF16, con un total aproximado de 14,6 GB en disco y un pico de VRAM que depende de si los componentes se cargan de forma secuencial o simultanea.
- GPU recomendadas: no especificadas por el autor. Por el tamano de los ficheros, una RTX 4090 (24 GB) permite ejecutar el pipeline completo en BF16 o FP8; una RTX 4080/4070 Ti (12-16 GB) puede ejecutar Q4_K_M con text encoder INT8; GPUs de 8 GB quedan muy justas y probablemente requieran offloading a RAM.
- Cabe en GPU de consumo: si, en el rango de 12-24 GB de VRAM con cuantizaciones Q4-Q8. En 8 GB solo con Q4_0 y text encoder INT8, con riesgo de offloading.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet, con soporte nativo de Qwen-Image 2.1), MLX para Apple Silicon. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a pipelines de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (este) | ~7,1B | no disponible | GGUF, safetensors, MLX | qwen-research | HuggingFace, ~163 descargas |
| Qwen/Qwen-Image-2.1 (base) | ~7,1B | no disponible | safetensors | qwen-research | HuggingFace (oficial) |
| Alternativas de difusion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este paquete y otras alternativas de generacion de imagen en la informacion proporcionada. La comparativa se limita a la relacion con su modelo base, del que se diferencia por la cuantizacion y por la eliminacion del filtrado de seguridad.

## Limitaciones y advertencias

- La denominacion "uncensored" implica que los pesos se distribuyen sin el filtrado de seguridad del modelo original; esto puede facilitar la generacion de contenido no deseado, ofensivo o ilegal segun la jurisdiccion, y traslada al usuario la responsabilidad de moderacion.
- La licencia qwen-research (etiquetada como "other") no es una licencia de codigo abierto permisiva; conviene revisar los terminos del modelo base antes de cualquier uso comercial, ya que las licencias de investigacion suelen restringir el despliegue en produccion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar imagenes que no corresponden fielmente al prompt, con artefactos en manos, texto y estructuras geometricas complejas.
- La cuantizacion a 4 bits (Q4_K_M, Q4_0, MLX 4-bit, NVFP4) puede degradar la fidelidad de la imagen respecto a BF16; el autor recomienda Q4_K_M como equilibrio, pero no publica comparativas de calidad por cuantizacion.
- No se documentan sesgos conocidos ni idiomas soportados; el text encoder Qwen3-VL sugiere cobertura multilingue amplia, pero no esta confirmado en la informacion disponible.
- El repositorio tiene un tamano de 105,2 GB y solo 163 descargas, con 0 likes; es una publicacion reciente (25 de octubre de 2026) sin validacion comunitaria extensa.
- La instalacion requiere el fork de leejet de ComfyUI-GGUF; la version antigua de city96 puede fallar con el error "Unknown model architecture!", segun advierte el autor.
- No se especifican requisitos minimos de hardware ni latencias, por lo que el rendimiento real en produccion debe medirse en cada entorno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/l666A/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
- Referencia a los ficheros del autor (organizacion abenzerps): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
