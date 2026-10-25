# orangejuicesmith/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es un conjunto de versiones cuantizadas del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicado por el usuario orangejuicesmith en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino documentado: la model card indica explicitamente que se parte de los pesos originales del modelo base de Qwen y que el trabajo consiste en empaquetar dichos pesos en formatos de cuantizacion (GGUF, safetensors FP8/INT8/NVFP4 y MLX de 4, 6 y 8 bits) junto con el codificador de texto Qwen3-VL 8B y el VAE necesarios para ejecutarlo en ComfyUI.

El problema que resuelve es de despliegue: el repositorio ofrece variantes desde 4,00 GB (MLX 4-bit) hasta 14,23 GB (BF16), ademas de un abanico de cuantizaciones GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0) pensadas para ejecutarse en GPU de consumo, Apple Silicon o GPU de centro de datos con soporte de FP8/NVFP4. El transformer de difusion declara 7.115.124.736 parametros (dato de safetensors), y la licencia es `qwen-research`.

Es relevante ahora por dos motivos: por un lado, permite probar un modelo de la familia Qwen-Image en hardware modesto sin depender de servicios en la nube; por otro, la etiqueta "Uncensored" del nombre no va acompanada de ninguna explicacion tecnica en la model card, lo que exige cautela antes de usarlo en produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su model card enlaza a ficheros alojados bajo la cuenta `abenzerps`, no bajo `orangejuicesmith`, un detalle de procedencia que conviene verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (los ficheros se colocan en `models/diffusion_models/` de ComfyUI); detalles del bloque no disponibles |
| Parametros totales | 7.115.124.736 (~7,1 mil millones), dato real de safetensors |
| Parametros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | `other`, con `license_name: qwen-research` |
| Formato de pesos | GGUF (`.gguf`) y safetensors (`.safetensors`); codificador de texto y VAE tambien en safetensors |
| Codificador de texto | Qwen3-VL 8B en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB) |
| VAE | `qwen_image_2.1_vae_bf16.safetensors` (676 MB) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: `quantized`) |
| Libreria / ecosistema | `gguf`, ComfyUI, ComfyUI-GGUF, MLX |
| Tamano del repositorio | 105,2 GB (incluye todas las variantes y ficheros auxiliares) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del transformer de difusion (numero de bloques, tipo de atencion, mecanismo de condicionamiento, resoluciones nativas) ni el proceso de entrenamiento del modelo base: no hay datos sobre numero de tokens, composicion del dataset, fases de RLHF/DPO ni tecnicas de optimizacion. Lo unico documentado es la estructura de despliegue: un transformer de difusion de ~7,1 mil millones de parametros, un codificador de texto Qwen3-VL 8B y un VAE especifico (`qwen_image_2.1_vae_bf16`), que es el esquema habitual en los flujos de ComfyUI para modelos texto-a-imagen.

En cuanto al proceso aplicado, la model card afirma que las cuantizaciones se generan "using the original upstream base weights", es decir, sin reentrenamiento ni modificacion declarada de los pesos mas alla de la propia cuantizacion. Esto plantea una discrepancia relevante: el nombre del repositorio incluye "Uncensored" y los ficheros llevan el sufijo `UC`, pero no se documenta ninguna fase de eliminacion de filtros, ajuste fino sin censura ni modificacion del dataset. Tampoco se especifica que metodo de cuantizacion se ha empleado para cada formato (salvo la nomenclatura estandar de GGUF y las etiquetas INT8 ConvRot, NVFP4 y MLX). Las innovaciones tecnicas declaradas se limitan a la disponibilidad de formatos: NVFP4 e INT8 ConvRot para GPU compatibles, MLX para Apple Silicon y GGUF para VRAM reducida.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (pipeline `text-to-image`), usando el codificador Qwen3-VL 8B para procesar el prompt.
- Ejecucion local en ComfyUI mediante el nodo personalizado ComfyUI-GGUF, con carga de transformer, codificador de texto y VAE desde directorios separados.
- Cobertura de multiples backends de cuantizacion: GGUF (`Q4_0` a `Q8_0`) para equipos con poca VRAM, FP8 e INT8 ConvRot para GPU con soporte, NVFP4 para hardware compatible y MLX 4/6/8-bit para Apple Silicon.
- Interoperabilidad con flujos de trabajo de ComfyUI: el modelo se puede insertar en grafos existentes, sustituyendo el transformer o el codificador de texto por variantes mas ligeras.
- Posibilidad de comparar precisiones con los mismos pesos base (de BF16 a Q4_0), util para evaluaciones de degradacion por cuantizacion.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, controlnet, img2img, tool calling, function calling, agentes, razonamiento multi-paso, audio ni vision mas alla del uso del codificador Qwen3-VL como encoder de texto.
- No se documenta soporte multilingue explicito; el campo de idiomas no esta disponible.
- No se documenta ningun modo especial tipo "thinking", vision o audio.

## Casos de uso

- Prototipado local de generacion de imagenes en GPU de consumo: con la variante Q4_K_M (4,60 GB) y el codificador INT8 (9,35 GB) el conjunto ronda los 14-15 GB, por lo que encaja en tarjetas de 16 GB o superiores y permite iterar sobre prompts sin coste por API.
- Produccion por lotes de ilustracion y concept art en estaciones de trabajo: el formato Q8_0 o BF16, combinado con el VAE en BF16, permite generar catalogos de variaciones de un mismo estilo dentro de un grafo de ComfyUI automatizado por su API.
- Flujos creativos en Apple Silicon: las variantes MLX 4-bit (4,00 GB), 6-bit (5,78 GB) y 8-bit (7,56 GB) estan pensadas para memoria unificada de Mac, lo que facilita trabajar en portatiles sin GPU dedicada.
- Inferencia de mayor rendimiento en centros de datos: FP8 (6,63 GB), INT8 ConvRot (6,76 GB) y NVFP4 (4,20 GB) reducen huella de memoria y aprovechan unidades de calculo de baja precision en GPU compatibles, util para servir varias instancias o aumentar el throughput por nodo.
- Investigacion sobre cuantizacion: al publicarse BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 de los mismos pesos, se pueden medir diferencias de calidad (fidelidad al prompt, artefactos, coherencia) manteniendo constante el resto del pipeline.
- Evaluacion de seguridad y red teaming: la etiqueta "Uncensored" hace que este repositorio sea un candidato para estudiar el comportamiento de modelos sin filtros de salida en entornos controlados, siempre que se respete la licencia y la legislacion aplicable.
- Automatizacion de assets para videojuegos o interfaces en fase de preproduccion: generacion de bocetos y variaciones dentro de un pipeline interno de ComfyUI, con la advertencia de que la licencia `qwen-research` limita el uso comercial.
- Docencia y talleres: el rango de tamanos (de 4,00 GB a 14,23 GB) permite montar practicas de generacion de imagen en aulas con hardware heterogeneo.

## Benchmarks y rendimiento

La model card incluye una referencia a una imagen de benchmarks (`assets/Qwen-Image-2.1-Benchmark.png`) y a una comparativa del modelo base, pero no se proporciona ningun dato numerico en el texto (ni MMLU, ni FID, ni CLIP score, ni comparaciones cifradas con otros modelos).

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir de los tamanos de fichero publicados en el repositorio (pesos del transformer + codificador de texto + VAE), sin incluir el consumo exacto de activaciones ni el overhead del runtime.

| Variante del transformer | Transformer | Codificador de texto | VAE | Total aproximado de pesos |
|---|---:|---:|---:|---:|
| BF16 | 14,23 GB | 17,53 GB (BF16) | 0,68 GB | ~32,4 GB |
| Q8_0 | 7,59 GB | 9,35 GB (INT8) | 0,68 GB | ~17,6 GB |
| Q6_K | 5,88 GB | 9,35 GB (INT8) | 0,68 GB | ~15,9 GB |
| Q5_K_M | 5,22 GB | 9,35 GB (INT8) | 0,68 GB | ~15,3 GB |
| Q4_K_M | 4,60 GB | 9,35 GB (INT8) | 0,68 GB | ~14,6 GB |
| Q4_0 | 4,15 GB | 9,35 GB (INT8) | 0,68 GB | ~14,2 GB |
| NVFP4 | 4,20 GB | 9,35 GB (INT8) | 0,68 GB | ~14,2 GB |
| MLX 4-bit | 4,00 GB | segun variante MLX | 0,68 GB | ~4,7 GB solo transformer + VAE |

- VRAM estimada para inferencia: entre 15 y 17 GB con cuantizaciones Q4/Q5/Q6 y codificador INT8; en torno a 18-20 GB con Q8_0; 32 GB o mas con BF16 y codificador BF16 (se anaden activaciones y overhead no cuantificado).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080/A5000 (16 GB) para las variantes Q4_K_M y Q4_0; A100 40/80 GB o H100 para BF16 y FP8; GPU con soporte nativo de FP8 e INT8 ConvRot para esas variantes; GPU de generacion compatible con NVFP4 para el fichero de 4,20 GB.
- Cabe en GPU de consumo: si, con Q4_0 (4,15 GB) o Q4_K_M (4,60 GB) siempre que se use el codificador INT8 y se disponga de 16 GB de VRAM o mas; en tarjetas de 12 GB el cuello de botella es el codificador de texto de 9,35 GB, por lo que habria que buscar una variante mas ligera no incluida en este repositorio.
- Apple Silicon: variantes MLX 4-bit, 6-bit y 8-bit para memoria unificada; el tamano del transformer mas el VAE y el codificador determina el minimo practico de memoria del sistema.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (se recomienda el fork `leejet/ComfyUI-GGUF`, que segun la model card anade soporte nativo de Qwen-Image 2.1; con `city96/ComfyUI-GGUF` se reporta el error `Unknown model architecture!`). Los ficheros safetensors FP8/INT8/NVFP4 y MLX se cargan desde los directorios de ComfyUI; el formato GGUF de este repositorio esta orientado a ComfyUI-GGUF, no se documenta su uso con llama.cpp.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, pasos de muestreo ni rendimiento medido en ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (este repositorio) | 7.115.124.736 | No disponible | GGUF, safetensors (FP8, INT8, NVFP4, MLX) | `qwen-research` | Repositorio publico; 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | Mismo numero de parametros segun la relacion `quantized` | No disponible | Pesos originales del autor (formato no detallado aqui) | `qwen-research` | Repositorio oficial de Qwen |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa significativa que permite la informacion disponible es contra el modelo base: este repositorio no anade capacidades ni ajustes declarados, solo empaquetado en precisiones reducidas y ficheros auxiliares (codificador Qwen3-VL 8B y VAE) listos para ComfyUI. La ventaja frente al original es la reduccion de VRAM (de 14,23 GB en BF16 a 4,00-4,60 GB en las variantes mas agresivas) y la disponibilidad de formatos para Apple Silicon. El coste es la posible perdida de calidad por cuantizacion y un repositorio de 105,2 GB del que solo se descargan los ficheros necesarios.

## Limitaciones y advertencias

- No hay informacion sobre los datos de entrenamiento del modelo base, por lo que no se pueden evaluar sesgos de representacion, sesgos culturales ni cobertura de idiomas; el campo de idiomas no esta disponible.
- El nombre incluye "Uncensored" y los ficheros el sufijo `UC`, pero la model card no documenta ninguna modificacion de pesos, dataset o filtros de seguridad. O bien la etiqueta es puramente comercial, o bien la informacion es incompleta; en ambos casos no hay base tecnica para asumir un comportamiento concreto.
- Si el modelo carece efectivamente de filtrado de salida, existe riesgo de generar contenido no apto, difamatorio o ilegal segun la jurisdiccion; el uso en productos de cara al publico requiere moderacion externa obligatoria.
- Riesgo de alucinacion visual: como cualquier modelo generativo texto-a-imagen, puede producir texto ilegible en la imagen, anatomia incorrecta, marcas o logotipos inventados y falso realismo. No se publican metricas de fidelidad al prompt.
- Licencia `qwen-research`: es una licencia de investigacion, no una licencia comercial generica. Antes de cualquier uso en produccion o redistribution hay que revisar los terminos completos del modelo base; la model card no aclara condiciones de uso comercial.
- Discrepancia de procedencia: el repositorio se sirve bajo `orangejuicesmith`, pero todos los enlaces de descarga de la model card apuntan a `abenzerps/Qwen-Image-2.1-Uncensored-Quantized`. Conviene verificar el origen real de los pesos y su integridad antes de desplegarlos.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion documentadas; no hay evidencia externa de calidad.
- Dependencia estricta de ComfyUI-GGUF en su variante `leejet`; con otras implementaciones se documenta un error de arquitectura desconocida.
- El codificador de texto en BF16 ocupa 17,53 GB, mas que el propio transformer cuantizado; en equipos con poca VRAM es obligatorio usar la version INT8 y aun asi es el componente dominante.
- Las variantes INT8 ConvRot y NVFP4 requieren GPU con soporte de esas precisiones; en hardware no compatible no se pueden ejecutar aunque el fichero sea mas pequeno.
- No se publican tiempos de inferencia, numero de pasos recomendado, resoluciones soportadas ni guias de sampler/scheduler, lo que dificulta estimar costes de despliegue.
- El repositorio completo ocupa 105,2 GB; una descarga ingenua del snapshot completo puede ser inviable en muchos entornos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/orangejuicesmith/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado, con soporte Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos del autor de la model card: https://abenzerps.com/request-a-model/
- Imagen de benchmarks citada en la model card (sin cifras en el texto): `assets/Qwen-Image-2.1-Benchmark.png` dentro del repositorio
