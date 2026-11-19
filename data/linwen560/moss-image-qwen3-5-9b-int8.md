# linwen560/MOSS-Image-Qwen3.5-9B-int8

## Resumen

MOSS-Image-Qwen3.5-9B-int8 es una cuantizacion INT8 (W8A8) del codificador de texto Qwen3.5-9B que forma parte del modelo multimodal MOSS-Image, desarrollado por el equipo OpenMOSS (OpenMOSS-Team). El modelo original MOSS-Image-Base combina un codificador de texto Qwen3.5-9B con una torre de vision para tareas de generacion y comprension de imagenes; este repositorio, publicado por el usuario linwen560, extrae unicamente el text encoder y lo empaqueta en un unico fichero de 9,2 GB en lugar de los shards bf16 de 16,8 GB.

La relevancia de esta ficha es practica: se trata de un artefacto de despliegue orientado a ComfyUI y a pipelines de inferencia con VRAM limitada. El autor reporta que las matmuls se ejecutan en int8 tanto en pesos como en activaciones (W8A8) mediante el formato `int8_tensorwise` + `convrot` de ComfyUI, con una velocidad de codificacion aproximadamente 1,7 veces superior a la version fp8 con el mismo consumo de VRAM y un error de embedding practicamente identico.

No se dispone de informacion sobre el pipeline declarado en Hugging Face, los idiomas soportados de forma oficial ni resultados de benchmarks estandar (MMLU, HumanEval, etc.). La informacion disponible se centra en el proceso de cuantizacion, las metricas de error de embedding y las mediciones de velocidad y VRAM en una RTX 5070 Ti de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atencion y proyecciones gated-DeltaNet (GDN); incluye torre de vision en el modelo base |
| Parametros totales | 9B (heredados de Qwen3.5-9B; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones), con rotacion Hadamard ConvRot por grupos de 256 columnas y una `weight_scale` fp32 por fila de salida; tambien permite dequantizar a bf16 (weight-only) |
| Idiomas soportados | no disponible oficialmente; el conjunto de calibracion incluye prompts en ingles, japones, coreano y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen35_9b_int8_convrot.safetensors`, 9,20 GiB) + `config.json` de Qwen3.5-9B para transformers |

## Arquitectura y entrenamiento

El modelo es el codificador de texto Qwen3.5-9B, un transformer decoder de 32 capas con atencion y proyecciones gated-DeltaNet (GDN). La cuantizacion afecta a las 248 capas lineales del decoder (atencion, proyecciones GDN y MLP): cada peso se rota por grupos de 256 columnas mediante una matriz de Hadamard (ConvRot) y se cuantiza a int8 con una escala fp32 por fila de salida. Se mantienen sin cuantizar el token embedding, las `conv1d`/`A_log`/`dt_bias` del GDN y la torre de vision. Los pesos de RMSNorm del decoder se almacenan en fp32 y llevan incorporadas las escalas de SmoothQuant, por lo que no son intercambiables con los del modelo bf16.

El proceso de cuantizacion combina SmoothQuant con alpha 0,5 (traslada los outliers de activacion al peso y pliega las escalas en la RMSNorm precedente y, para `down_proj`, en las filas de `up_proj`) y GPTQ sensible a activaciones, donde la matriz de Hessian se calcula a partir de las entradas ya rotadas y redondeadas a int8 que vera el kernel W8A8. La calibracion se realizo capa por capa sobre las salidas W8A8 de las capas anteriores, usando captions de etiquetas, JSON de layout, prompts en ingles y JA/KO/ZH y paginas de manga/colorize procesadas por la torre de vision. El script empleado es `te_gptq.py --grid int8_convrot --smooth 0.5 --act_aware` del repositorio anima_lora. No se dispone de informacion sobre el entrenamiento original de Qwen3.5-9B ni sobre el de MOSS-Image-Base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Codificacion de texto e imagenes a embeddings para el pipeline MOSS-Image (generacion y caching).
- Procesamiento de captions de etiquetas, JSON de layout, lenguaje natural y captions OCR.
- Soporte multilingue parcial en el conjunto de calibracion: ingles, japones, coreano y chino.
- Procesamiento de filas de imagen (paginas de manga y colorize) a traves de la torre de vision del modelo base.
- Integracion con ComfyUI mediante el nodo `MOSS-Image Load Qwen3.5` (`moss-image`), que lee `comfy_quant` por capa con el cargador de precision mixta.
- Uso como text encoder por defecto en anima_lora (`text_encoder=int8`), con las 32 capas del decoder residentes en una GPU de 16 GB.
- No se documentan capacidades de tool calling, function calling, agentes ni modo thinking para este artefacto.

## Casos de uso

- Generacion de imagenes en ComfyUI con VRAM limitada: colocar el fichero en `models/text_encoders/` y cargarlo con el nodo MOSS-Image Load Qwen3.5 permite ejecutar el text encoder completo en tarjetas de 16 GB, frente a los 12,59 GiB de pico del encoder bf16.
- Caching de embeddings de texto para MOSS: anima_lora lo usa como encoder por defecto (`text_encoder=int8` o `--text_encoder int8`), con descarga automatica en el primer uso mediante `make download-model ARGS=moss-te-int8`.
- Pipelines de inferencia con requisitos de latencia: a 2459 tokens/s en una RTX 5070 Ti, supera al fp8 (1467 tokens/s) y al bf16 (2250 tokens/s), lo que resulta adecuado para servir prompts cortos en produccion interactiva.
- Procesamiento de prompts multilingues (JA/KO/ZH) en flujos de generacion de imagenes: el conjunto de calibracion cubre estos idiomas con errores relativos L2 de 0,053, comparable al fp8 GPTQ (0,054).
- Digitalizacion de paginas de manga o colorize: las filas de imagen a traves de la torre de vision mantienen un error relativo L2 de 0,10, igual que la version fp8, por lo que es apto para pipelines de layout y OCR sobre paginas escaneadas.
- Despliegue en entornos con presupuesto de memoria estricto: el fichero unico de 9,20 GiB sustituye a los shards bf16 de 16,8 GB, reduciendo el almacenamiento y el pico de VRAM de las capas del decoder a 6,54 GiB.

## Benchmarks y rendimiento

Mediciones del autor en RTX 5070 Ti 16 GB contra el encoder bf16 (bench/moss_te_fp8, 34 prompts, mismo formato y kernel):

| Metrica | bf16 | fp8 (weight-only) | INT8 W8A8 |
|---|---|---|---|
| Codificacion, tokens/s | 2250 (2 capas paginadas) | 1467 | 2459 |
| VRAM pico, capas del decoder residentes | 12,59 GiB | 6,69 GiB | 6,54 GiB |

Error relativo L2 de embedding en el split de validacion del conjunto de calibracion (121 entradas):

| Categoria | fp8 GPTQ | INT8 (este fichero) |
|---|---|---|
| Etiquetas | 0,039 | 0,042 |
| Clausulas de posicion | 0,040 | 0,046 |
| Lenguaje natural | 0,044 | 0,043 |
| JSON de layout | 0,039 | 0,047 |
| Captions OCR | 0,051 | 0,053 |
| JA / KO / ZH | 0,054 | 0,053 |
| Pagina + caption (filas de imagen) | 0,10 | 0,10 |
| Global | 0,095 | 0,097 |

El autor indica que INT8 GPTQ sin smoothing lee 0,105 global en el mismo modo W8A8, y que el redondeo round-to-nearest es peor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,54 GiB de pico con las capas del decoder residentes en modo INT8 W8A8 (medido en RTX 5070 Ti); el fichero ocupa 9,20 GiB en disco.
- GPU recomendadas: RTX 5070 Ti 16 GB (medicion reportada); cualquier GPU con al menos 16 GB de VRAM para mantener las 32 capas del decoder residentes.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB como la RTX 5070 Ti; el encoder bf16 requiere paginacion de capas (2 capas paginadas en la medicion) y un pico de 12,59 GiB.
- Opciones de despliegue: ComfyUI (cargador de precision mixta con `comfy_quant` por capa), anima_lora (flag `--text_encoder int8`), transformers (mediante el `config.json` incluido y dequantizacion a bf16 para matmul weight-only). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2459 tokens/s de codificacion en RTX 5070 Ti, aproximadamente 1,7 veces la velocidad del fichero fp8 (1467 tokens/s) y superior al bf16 (2250 tokens/s) con el mismo VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Qwen3.5-9B-int8 (este) | 9B | no disponible | INT8 W8A8 + ConvRot | Apache-2.0 | Hugging Face (linwen560) |
| MOSS-Image-Qwen3.5-9B-fp8 (sorryhyun) | 9B | no disponible | fp8 weight-only | no disponible | Hugging Face (sorryhyun) |
| MOSS-Image-Base text encoder (bf16) | 9B | no disponible | bf16 (shards de 16,8 GB) | Apache-2.0 | Hugging Face (OpenMOSS-Team) |

No se dispone de datos de benchmarks estandar ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de cuantizacion, no un modelo entrenado: los pesos derivan de `OpenMOSS-Team/MOSS-Image-Base` `text_encoder/` y requieren el tokenizer del modelo base.
- Los pesos de RMSNorm del decoder llevan escalas SmoothQuant incorporadas y no son intercambiables con los del modelo bf16; mezclar ficheros provoca resultados incorrectos.
- El error de embedding es ligeramente superior al fp8 GPTQ en etiquetas (0,042 frente a 0,039), clausulas de posicion (0,046 frente a 0,040) y JSON de layout (0,047 frente a 0,039); en el global es practicamente identico (0,097 frente a 0,095).
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de contexto o idioma para este artefacto.
- El soporte de despliegue documentado se limita a ComfyUI y anima_lora; no hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- La licencia Apache-2.0 se hereda de MOSS-Image y Qwen3.5, pero conviene verificar los terminos del modelo base antes de uso comercial en produccion.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia (2026-11-19), por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/linwen560/MOSS-Image-Qwen3.5-9B-int8
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Fichero fp8 de referencia: https://huggingface.co/sorryhyun/MOSS-Image-Qwen3.5-9B-fp8
- Repositorio anima_lora (script de cuantizacion `te_gptq.py`): https://github.com/sorryhyun/anima_lora
