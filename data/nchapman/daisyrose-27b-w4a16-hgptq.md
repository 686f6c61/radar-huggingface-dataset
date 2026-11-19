# nchapman/DaisyRose-27B-W4A16-HGPTQ

## Resumen

DaisyRose-27B-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal RadixArk/DaisyRose-27B, publicada por el usuario nchapman. Emplea una combinación de rotación Hadamard, GPTQ con inicialización Cholesky y destilación KL con maestro en FP32 para comprimir un modelo BF16 de 55,56 GB hasta 16,14 GiB (17,33 GB), lo que supone una reducción de 3,21 veces. El objetivo es claro: hacer que un modelo de lenguaje y visión de 27B parámetros, junto con su cabecera de decodificación especulativa MTP nativa, quepa en una única GPU de 24 GB.

El modelo base es de arquitectura híbrida Qwen3.5, con 64 capas de decodificador que combinan 16 capas de atención completa y 48 capas GatedDeltaNet (atención lineal), más un codificador visual ViT de 27 bloques y un cabezal MTP para decodificación especulativa. La cuantización preserva tanto la torre de visión como el drafter MTP, algo poco habitual en cuantizaciones de este tamaño, y mantiene el vocabulario completo de 248.320 tokens con una lm_head en 8 bits.

La relevancia de esta ficha radica en que demuestra que es posible ejecutar un VLM de 27B con decodificación especulativa en hardware de consumo (RTX 3090, 4090 o 5090), con una degradación de perplejidad negativa (-3,12 % en probe-v4) y una tasa de acuerdo Top-1 del 96,30 % en el cabezal MTP aislado. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 64 capas (16 de atención completa + 48 GatedDeltaNet), ViT de 27 bloques, cabecera MTP nativa |
| Parametros totales | 29.105.255.152 (29,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (GPTQ grupo 64) en backbone, MTP y visión; W8_g64 en lm_head y mtp.fc; BF16 en embed_tokens, in_proj_a/b, patch_embed, normas y sesgos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized int32), 18 shards |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida: 64 capas de decodificador en las que 16 usan atención completa (self_attn con proyecciones q, k, v, o) y 48 usan GatedDeltaNet con atención lineal (in_proj_qkv, in_proj_z, out_proj). Todas las capas incluyen un MLP con gate, up y down. La torre visual consta de 27 bloques ViT con atención qkv, proyección y MLP de dos capas, más dos proyecciones de fusión espacial (merger). El modelo incorpora además una cabecera nativa de Multi-Token Prediction (MTP) con una capa transformer propia, que actúa como drafter para decodificación especulativa.

El proceso de cuantización aplica una rotación Hadamard determinista de Sylvester-Walsh (b=64 para el backbone y la mayoría de visión, b=16 para visual.blocks.*.mlp.linear_fc2) sobre las activaciones de entrada antes de la GEMM, y pre-rota los pesos offline (W' = W H_b / √b). Sobre esa base se aplica GPTQ con inicialización MSE y Cholesky, group_size=64, actorder estático y dos pasadas de descenso coordinado de Hessian (Gauss-Seidel H-CD). Posteriormente se realiza una destilación KL end-to-end con maestro FP32 sobre las RMSNorm, usando el conjunto de calibración data/calib-cascade-v1.jsonl. La lm_head y mtp.fc se cuantizan a 8 bits sin rotación para evitar sobrecarga online. En total se cuantizan 519 capas lineales: 400 del backbone, 7 del MTP, 110 de visión y 2 de la cabeza de salida/fusión.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia (chat_template.jinja) y parámetros de muestreo por defecto: temperature 1.0, top_p 0.95, top_k 20.
- Comprensión de imagen y texto (pipeline image-text-to-text) mediante torre ViT con fusión espacial, preservada en la cuantización con un 99,01 % de acuerdo Top-1 aislado en vision-probe-v2.
- Decodificación especulativa nativa mediante cabecera MTP, compatible con vLLM (--speculative-config '{"method":"mtp","num_speculative_tokens":1}').
- Razonamiento matemático y científico: los conjuntos de evaluación incluyen math, science y coding con divergencias KL medidas de 0,0802 y 0,0751 respectivamente.
- Uso de herramientas (tool use): incluido explícitamente en el conjunto de evaluación probe-v4.
- Capacidades multilingües: evaluadas en probe-guard (holdout general y multilingüe) con KL ponderada de 0,0751.
- Soporte de instrucciones (instruction following): KL de 0,0412 en la categoría correspondiente de probe-v4.
- Compatibilidad con vLLM 0.34+ sin parches, incluyendo tensor parallelism (tp>=1) y gráficos CUDA.

## Casos de uso

- Despliegue de un VLM de 27B en una sola GPU de 24 GB: gracias a los 16,14 GiB de pesos, quedan aproximadamente 7,8 GiB libres en una RTX 3090/4090/5090 para caché KV de contexto largo, tokens de visión, decodificación especulativa MTP y gráficos CUDA. Adecuado para prototipos y entornos de desarrollo con hardware de consumo.
- Asistente multimodal conversacional: la torre ViT preservada al 99,01 % de acuerdo Top-1 permite responder preguntas sobre imágenes en conversaciones multi-turno, con plantilla de chat incluida y parámetros de muestreo predefinidos.
- Generación de código asistida: el modelo base incluye coding en su conjunto de evaluación y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD o asistentes de IDE que requieran ejecución local sin depender de API externas.
- Razonamiento matemático y científico en local: con KL de 0,0802 en math y 0,0751 en science frente al BF16, es viable para tutoría, verificación de cálculos y análisis técnico donde la privacidad de los datos impide usar servicios en la nube.
- Servicio de inferencia con vLLM y decodificación especulativa: la cabecera MTP nativa con 89,38 % de acuerdo E2E Top-1 permite acelerar la generación en producción usando --speculative-config con method mtp, reduciendo la latencia por token en comparación con decodificación autoregresiva estándar.
- Evaluación e investigación de técnicas de cuantización: el checkpoint incluye métricas detalladas de KL, perplejidad y acuerdo Top-1 por dominio, lo que lo convierte en un caso de estudio reproducible para investigar rotaciones Hadamard, GPTQ con Cholesky y destilación KL en modelos híbridos con atención lineal.
- Procesamiento de documentos con imágenes en entornos con requisitos de soberanía de datos: al ejecutarse en una GPU única y con licencia Apache 2.0, puede desplegarse on-premise para extracción de información de facturas, informes o capturas sin enviar datos a terceros.

## Benchmarks y rendimiento

| Evaluacion | BF16 base (RadixArk/DaisyRose-27B) | DaisyRose-27B-W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors | 51,75 GiB (55.562.855.904 B) | 16,14 GiB (17.329.725.200 B) | Compresión 3,21x (-35,61 GiB) |
| Perplejidad texto (probe-v4, 378 prompts, 852.269 tokens) | 8,5603 | 8,2929 (-3,12 %) | Chat, math, science, coding, tool use, multilingüe |
| Divergencia texto vs BF16 (probe-v4, KL ponderada / KL media por token) | 0,0000 | 0,1110 / 0,2864 | chat 0,0230; instruction_following 0,0412; science 0,0751; math 0,0802 |
| Holdout general y multilingüe (probe-guard, 76 prompts, 22.746 tokens) | 60,2295 | 55,9007 (-7,19 %) | KL ponderada 0,0751 (KL media 0,0548) |
| Cabecera MTP especulativa nativa (12.339 posiciones) | 100,0 % Top-1 (NLL 2,9731) | 96,30 % aislado / 89,38 % E2E Top-1 | KL MTP aislada 0,0092; KL E2E 0,1720 (NLL 2,9460) |
| Visión (vision-probe-v2, 96 imágenes, 302 tokens de respuesta) | 100,0 % Top-1 | 99,01 % aislado / 95,03 % E2E Top-1 | KL ViT aislada 0,0102; KL E2E 0,1126; vision-guard-v2: 98,52 % / 94,81 % |

## Requisitos de hardware

- VRAM estimada: 16,14 GiB para pesos completos (VLM + MTP); 15,70 GiB en modo solo texto. En una GPU de 24 GB quedan aproximadamente 7,8 GiB para caché KV, tokens de visión, decodificación especulativa y gráficos CUDA.
- GPU recomendadas: RTX 3090, RTX 4090 y RTX 5090 (24 GB o más). Para tensor parallelism se puede distribuir en varias GPU mediante vLLM con tp>=1.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 24 GB de VRAM. No se especifica compatibilidad con GPU de 16 GB o menos.
- Opciones de despliegue: vLLM 0.34+ sin parches (compatible con compressed-tensors y pack-quantized int32); incluye vllm_warp_quant.py con auto_map para soporte de SharedWeightParameter y Hadamard en linear_fc2 de visión. Compatible con transformers. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa MTP con num_speculative_tokens=1 está soportada, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-W4A16-HGPTQ | 29,1B | no disponible | W4A16 + W8 (GPTQ + Hadamard) | Apache 2.0 | Hugging Face (nchapman) |
| RadixArk/DaisyRose-27B (BF16) | 29,1B (55,56 GB) | no disponible | BF16 | Apache 2.0 | Hugging Face (RadixArk) |
| Alternativas de 27B-30B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento frente a terceros.

## Limitaciones y advertencias

- La cuantización introduce divergencia respecto al BF16: KL ponderada de 0,1110 en probe-v4 y 0,0751 en probe-guard, con un acuerdo Top-1 del 89,38 % E2E en la cabecera MTP. En tareas de razonamiento matemático y científico la divergencia es mayor (KL 0,0802 y 0,0751) que en chat (0,0230).
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad o tasa de alucinación en la información disponible.
- Sesgos conocidos: no disponibles. El modelo base no documenta en la información proporcionada sesgos específicos de género, idioma o dominio.
- Idiomas soportados: no disponibles. Aunque se evalúa un holdout multilingüe, no se enumeran los idiomas cubiertos.
- Longitud de contexto: no disponible. El autor indica que quedan ~7,8 GiB para caché KV de contexto largo en una GPU de 24 GB, pero no especifica la ventana máxima.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base RadixArk/DaisyRose-27B.
- Requiere vLLM 0.34+ para el soporte completo de compressed-tensors y MTP; versiones anteriores pueden no cargar correctamente los grupos de cuantización vision_fc2_channel o w8_head.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 19 de noviembre de 2026; se trata de una publicación reciente sin validación comunitaria independiente.
- La destilación KL con maestro FP32 y el conjunto de calibración data/calib-cascade-v1.jsonl son específicos del autor; no se documenta la composición del conjunto de calibración ni su cobertura lingüística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/DaisyRose-27B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Repositorio vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- GPTQ (paper): https://arxiv.org/abs/2210.17323
- QuIP (paper): https://arxiv.org/abs/2307.13304
- HadaCore: no disponible
- Demos: no disponibles
