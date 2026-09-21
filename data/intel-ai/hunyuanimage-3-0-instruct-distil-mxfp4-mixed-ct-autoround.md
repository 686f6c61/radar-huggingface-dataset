# intel-ai/HunyuanImage-3.0-Instruct-Distil-MXFP4-Mixed-CT-AutoRound

## Resumen

HunyuanImage-3.0-Instruct-Distil-MXFP4-Mixed-CT-AutoRound es una compilacion cuantizada en precision mixta del modelo de generacion de imagenes tencent/HunyuanImage-3.0-Instruct-Distil, publicada por intel-ai. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo artefacto con los pesos comprimidos mediante AutoRound 0.15.0 y exportados en formato compressed-tensors, de modo que pueda cargarse y ejecutarse de extremo a extremo en vLLM y vLLM-Omni.

La particularidad tecnica es el esquema mixto: los expertos enrutados de la MoE (77,31 B parametros, el 93,1 % del total) se cuantizan a MXFP4, mientras que el resto de capas Linear cuantizables pasan a MXFP8. Los modulos sensibles a la precision (ViT, VAE en FP32, embeddings, lm_head, embeddings de guia y de timestep, patch_embed, final_layer y los 32 enrutadores MoE) se mantienen en BF16/FP32. El resultado pesa 52,6 GB frente a los 158 GB del modelo base en BF16, es decir, una reduccion de 3x en disco, con un coste de fidelidad que el propio autor documenta y que es el dato mas relevante de la ficha.

La relevancia actual es doble: por un lado demuestra que la generacion de imagenes con arquitecturas MoE grandes puede servirse en hardware mas modesto; por otro, cuantifica con rigor (PSNR y SSIM frente a BF16) cuanto se degrada la salida al bajar los expertos a 4 bits, algo poco habitual en las fichas de modelos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con pipeline autorregresivo (AR) y diffusion transformer (DiT); 32 capas, 64 expertos enrutados por capa, moe_topk=8, 1 experto compartido por capa, hidden 4096, moe_intermediate 3072 |
| Parametros totales | 83,04 B segun la model card del autor; los metadatos safetensors del repositorio declaran 44.390.161.763 parametros (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | no disponible (estructuralmente se activan 8 de 64 expertos enrutados por token mas 1 experto compartido por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: expertos enrutados en MXFP4 (E2M1, grupo 32, escala E8M0); resto de capas Linear cuantizadas en MXFP8 (E4M3, grupo 32, escala E8M0); ViT, VAE (FP32), wte/lm_head, guidance_emb, timestep_emb, timestep_r_emb, patch_embed, final_layer, time_embed, vision_aligner y los 32 enrutadores MoE en BF16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con compressed-tensors (quant_method = "compressed-tensors", format = "mixed-precision", provider = auto-round); exportado con --format llm_compressor |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal orientado a generacion de imagenes. La geometria declarada es de 32 capas con 64 expertos enrutados por capa, top-k = 8 y un experto compartido por capa, con dimension oculta 4096 y dimension intermedia de experto 3072. La variante Instruct-Distil del modelo base usa destilacion de CFG (cfg_distilled=true) y meanflow (use_meanflow=true). El repositorio incluye un encoder de vision (ViT), un VAE (mantenido en FP32 como en el modelo base) y un vision_aligner, lo que confirma que el pipeline completo abarca AR y DiT: el componente AR procesa la entrada y el DiT genera la imagen en pasos de difusion (el ejemplo publicado usa 8 pasos de inferencia a 1024²).

Esta build no entrena nada: aplica cuantizacion post-entrenamiento con AutoRound 0.15.0 en modo --model_free, es decir, sin conjunto de calibracion. El esquema por defecto es MXFP8 y --layer_config rebaja unicamente los expertos enrutados a MXFP4. El proceso completo tardo 756 s en una sola GPU. Los tensores de experto se empaquetan como uint8 [N, K/2] (dos valores E2M1 por byte, nibble bajo = columna par) con una escala weight_scale uint8 [N, K/32] en formato E8M0 (valor = 2^(byte-127)). Los enrutadores MoE se excluyen automaticamente por AutoRound (cualquier ruta que coincida con .gate.) y se escriben en la lista ignore, que contiene 301 entradas. El ViT no puede cuantizarse en MXFP8 porque la dimension de entrada de su mlp.fc2 (4304) no es divisible por el tamano de bloque de 32.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante el pipeline AR+DiT a 1024², con 8 pasos de inferencia en el ejemplo publicado.
- Ejecucion de los tres modos del pipeline: solo AR, solo DiT y AR+DiT completo, todos verificados segun el autor.
- Codificacion visual, gracias al ViT y al vision_aligner incluidos en el repositorio.
- Generacion condicionada mediante embeddings de guia (guidance_emb) y de timestep (timestep_emb, timestep_r_emb).
- Compatibilidad con decodificacion por difusion configurable en numero de pasos.
- Soporte de atencion por tensor-parallelism en vLLM (el ejemplo usa AR TP1 + DiT TP1).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de codigo, matematicas o audio: no documentadas.

## Casos de uso

- Servicio de generacion de imagenes en produccion con VRAM limitada: el peso en disco baja de 158 GB (BF16) a 52,6 GB, lo que permite desplegar el pipeline en nodos que no podrian alojar el modelo base, aceptando la perdida de fidelidad documentada.
- Prototipado e iteracion rapida sobre pipelines de difusion: al reducir a un tercio el espacio de pesos, los ciclos de carga y prueba en vLLM-Omni son mas rapidos y caben en entornos de desarrollo mas pequenos.
- Investigacion en cuantizacion de modelos generativos MoE: el repositorio documenta el comando exacto de AutoRound, el esquema por capas y las trampas de --ignore_layers, por lo que sirve como caso reproducible para estudiar el impacto de MXFP4 en expertos.
- Evaluacion comparativa de precision: al incluir metricas PSNR/SSIM frente a BF16 y frente a un hermano MXFP4 de 4 bits completo, permite analizar la relacion entre precision de pesos y calidad visual en tareas de sintesis.
- Generacion de imagenes por lotes donde la coherencia global importa mas que el detalle fino: el build mixto mantiene una desviacion estandar de 48,86 (frente a 53,6 del BF16) y evita el colapso del hermano full-4-bit (std 23,23), a costa de SSIM bajo.
- Despliegue experimental en vLLM y vLLM-Omni para validar integracion de compressed-tensors con modelos multimodales, incluyendo la aplicacion obligatoria del parche tools/patch_mxfp4_mixed_targets.py.
- Benchmarking de infraestructura: sirve para medir throughput y particionado de tensor-parallelism en pipelines AR+DiT que combinan dos submodelos en GPUs separadas.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). La unica tabla disponible mide fidelidad de la imagen generada frente al modelo base en BF16, con la misma topologia (DiT TP2, prompt "A cute cat", seed 42, 8 pasos, 1024²):

| Build | PSNR vs BF16 | SSIM@1 | SSIM@1/2 | SSIM@1/4 | SSIM@1/8 | std |
|---|---:|---:|---:|---:|---:|---:|
| Suelo de ruido (misma build re-ejecutada) | 41,4 | 0,995 | — | — | 0,998 | 53,6 |
| MXFP8 | 31,59 | 0,979 | 0,976 | 0,978 | 0,982 | 53,62 |
| Esta build (MXFP4 mixta) | 12,99 | 0,672 | 0,545 | 0,396 | 0,271 | 48,86 |
| Hermano MXFP4 full-4-bit (contraste) | 12,14 | 0,319 | 0,254 | 0,169 | 0,089 | 23,23 |

No hay datos publicados de latencia ni throughput mas alla del tiempo de cuantizacion (756 s en 1 GPU).

## Requisitos de hardware

- Peso en disco del repositorio: 52,6 GB (48,98 GiB), frente a 86 GB del build MXFP8-ct y 158 GB del BF16 base.
- VRAM para inferencia: el autor no publica cifras. Como referencia derivada del tamano de pesos, los 52,6 GB de pesos mas el espacio para activaciones y el estado de difusion implican un minimo practico en el rango de una GPU de 80 GB por componente; el despliegue verificado usa 2 GPUs (AR TP1 + DiT TP1).
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, encajan A100 80 GB, H100 80 GB o similares; el pipeline completo se valido con dos GPUs.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 24-48 GB sin cuantizacion adicional o particionado no documentado.
- Opciones de despliegue: vLLM y vLLM-Omni (loader de compressed-tensors), con el parche tools/patch_mxfp4_mixed_targets.py aplicado de forma obligatoria. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Modos soportados en la validacion: AR-only, DiT-only y AR+DiT.

## Comparativa con modelos similares

| Build | Tamano en disco | Precision de expertos | PSNR vs BF16 | SSIM@1 | Notas |
|---|---|---|---|---|---|
| tencent/HunyuanImage-3.0-Instruct-Distil (BF16, referencia) | 158 GB | BF16 | — | — | Modelo base sin cuantizar |
| Build MXFP8-ct (hermano) | 86 GB | MXFP8 | 31,59 | 0,979 | Mayor fidelidad, 1,6x mas pesado |
| Esta build (MXFP4 mixta) | 52,6 GB | MXFP4 en expertos, MXFP8 en el resto | 12,99 | 0,672 | 0,33x el BF16; mejor estructura global que el full-4-bit |
| Hermano MXFP4 full-4-bit | no disponible | MXFP4 en todo | 12,14 | 0,319 | Colapso de la imagen (std 23,23) |

No se dispone de comparativas con modelos generativos de otros proveedores en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad severa en el camino DiT-only: PSNR de 12,99 frente a 31,59 del build MXFP8 y SSIM@1 de 0,672 frente a 0,979. El suelo de ruido (41,4 / 0,995) esta muy por encima, por lo que la degradacion es atribuible a la cuantizacion, no a la variabilidad de la inferencia.
- El build funciona mejor en las escalas medias (SSIM@1/8 = 0,271) que en el detalle fino, con una caida marcada respecto a MXFP8 (0,982 @1/8).
- El hermano MXFP4 full-4-bit colapsa (SSIM@1 = 0,319, std 23,23), lo que indica que la precision mixta es la unica configuracion de 4 bits viable de las dos comparadas, pero no que sea fiel.
- Requiere un parche manual obligatorio (tools/patch_mxfp4_mixed_targets.py) para que el loader compressed-tensors de vLLM acepte el artefacto; sin el, no carga.
- La cuantizacion es --model_free, sin datos de calibracion, lo que limita la adaptacion del esquema al comportamiento real del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Este es un riesgo bloqueante para produccion.
- Discrepancia en el recuento de parametros entre la model card (83,04 B) y los metadatos safetensors (44,39 B); conviene verificar antes de dimensionar hardware.
- El ViT no puede cuantizarse en MXFP8 por incompatibilidad dimensional (4304 no divisible por 32), lo que limita el ahorro adicional.
- Sesgos conocidos: no documentados en la informacion disponible; dependen del dataset del modelo base, no descrito aqui.
- Riesgo de alucinacion visual y de artefactos: inherente al modelo base y acentuado por la cuantizacion a 4 bits de los expertos.
- No hay datos publicados de contexto, idiomas, tool calling ni razonamiento; no debe asumirse ninguna de esas capacidades.
- Los resultados de busqueda web no aportaron informacion tecnica adicional (solo paginas corporativas de Intel), por lo que toda la ficha se apoya en la model card del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/intel-ai/HunyuanImage-3.0-Instruct-Distil-MXFP4-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/tencent/HunyuanImage-3.0-Instruct-Distil
- Herramienta de cuantizacion AutoRound: https://github.com/intel/auto-round
- Script de parcheo requerido: tools/patch_mxfp4_mixed_targets.py (incluido en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
