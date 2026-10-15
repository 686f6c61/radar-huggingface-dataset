# Jeesup/svd-safety-llama2_13b_chat_up_svdllm_seed42_finetuned_keep_0p70

## Resumen

`svd-safety-llama2_13b_chat_up_svdllm_seed42_finetuned_keep_0p70` es un artefacto de investigación publicado por el usuario Jeesup en HuggingFace. Consiste en el modelo `meta-llama/Llama-2-13b-chat-hf` comprimido mediante el método completo SVD-LLM (descomposición en valores singulares con destilación de rango bajo), en el que se ha eliminado el 30 % de los parámetros efectivos y se conserva una fracción realizada de 0,6999.

El interés del modelo es metodológico: aplica la canalización oficial de SVD-LLM (data whitening, truncado SVD, ajuste LoRA sobre los factores U y V, fusión y plegado a un checkpoint denso) sobre un modelo conversacional de 13B, y publica métricas tanto de utilidad (perplejidad, benchmarks de razonamiento) como de seguridad (tasas de ataque exitoso de generación dañina y sobre-rechazo). Se enmarca así en la línea de investigación sobre compresión de LLM y su efecto sobre la alineación.

El checkpoint está plegado a formas densas de Llama (`W = U @ V`), por lo que se carga con `transformers` estándar sin código de modelado propio. Es importante subrayar que el modelo es de rango deficiente, pero no ocupa menos en disco: el repositorio pesa 26,1 GB y declara 13.015.864.320 parámetros, la misma cuenta densa que el Llama-2-13b original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), checkpoint denso de rango deficiente resultante de SVD-LLM |
| Parametros totales | 13.015.864.320 (cuenta densa en safetensors; fraccion realizada efectiva 0,69993704803719) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada de meta-llama/Llama-2-13b-chat-hf); no verificada especificamente para este checkpoint |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (repositorio distribuido en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-13b-chat-hf |
| Tamano del repositorio | 26,1 GB |
| Casilla de compresion | 30 % de parametros eliminados (conserva el 70 %) |

## Arquitectura y entrenamiento

El punto de partida es `meta-llama/Llama-2-13b-chat-hf`, un transformer decoder-only con normalizacion RMSNorm, RoPE, atencion con Grouped-Query Attention (GQA) y funciones de activacion SwiGLU. Sobre esta base se aplica la canalizacion completa de SVD-LLM (repositorio `AIoT-MLSys-Lab/SVD-LLM`, commit `7538cca98880`), ejecutada con el codigo original de los autores en lugar de una reimplementacion. El proceso es: data whitening, truncado SVD para eliminar el 30 % del rango, ajuste con LoRA sobre los factores U, fusion, ajuste con LoRA sobre los factores V, fusion y plegado final a un checkpoint denso con formas de Llama.

El ajuste de parametros tras la compresion se realizo con LoRA de rango `r=8`, 2 epocas por factor, tasa de aprendizaje 0,0001 y tamano de lote 64, sobre el conjunto `yahma/alpaca-cleaned`. La calibracion del data whitening figura como «n/a» en la model card, con semilla 42. No se documenta en la informacion disponible si hubo fases adicionales de RLHF o DPO mas alla del ajuste del propio Llama-2-chat original y del ajuste LoRA descrito.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat y decodificacion greedy en la evaluacion.
- Razonamiento de sentido comun y comprension lectora de opcion multiple (evaluado en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA y PIQA).
- Resolucion de problemas matematicos basicos (evaluado en MathQA, con rendimiento bajo; ver benchmarks).
- Alineacion de seguridad: el checkpoint muestra tasas de ataque exitoso (ASR) muy bajas frente a AdvBench y StrongREJECT segun el juez HarmBench.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible; se trata de un modelo exclusivamente de texto.

## Casos de uso

- Investigacion en compresion de modelos: sirve como punto de comparacion reproducible frente a otros ratios de retencion SVD-LLM (por ejemplo, las variantes `keep_0p50` y `keep_0p60` del mismo autor) y frente al modelo base sin comprimir.
- Estudio del efecto de la compresion sobre la alineacion: las metricas de ASR (AdvBench 0,0038; StrongREJECT 0,0160) junto con el sobre-rechazo permiten analizar si la compresion degrada o altera el comportamiento de seguridad respecto al Llama-2-13b-chat original.
- Evaluacion de sobre-rechazo en produccion: con tasas medidas en XSTest-safe (0,1680) y OR-Bench-Hard-1K (0,4829), es util para estudiar el equilibrio entre seguridad y utilidad en asistentes conversacionales.
- Prototipado de asistentes conversacionales en ingles con `transformers` estandar: al plegarse a formas densas de Llama, se carga sin codigo de modelado personalizado, lo que simplifica la integracion en pipelines existentes.
- Reproduccion de experimentos de compresion: dado que la model card documenta la canalizacion, la semilla y los hiperparametros de LoRA, permite replicar el flujo completo sobre el mismo modelo base.
- Analisis de degradacion de calidad bajo compresion: la perplejidad en WikiText-2 (8,0129) y los benchmarks de razonamiento permiten cuantificar la perdida de calidad a un ratio de retencion del 70 %.
- Comparacion entre tecnicas de compresion: util como referencia para contrastar SVD-LLM con otras familias de compresion de rango bajo.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card del autor. La generacion usa la plantilla de chat con decodificacion greedy. Las tasas de ASR se juzgaron con `cais/HarmBench-Llama-2-13b-cls` y el sobre-rechazo con `allenai/wildguard`.

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,6999 |
| Perplejidad WikiText-2 | 8,0129 |
| ARC-Easy (acc_norm) | 0,6545 |
| ARC-Challenge (acc_norm) | 0,4249 |
| HellaSwag (acc_norm) | 0,7140 |
| WinoGrande (acc) | 0,6875 |
| OpenBookQA (acc_norm) | 0,4100 |
| PIQA (acc_norm) | 0,7476 |
| MathQA (acc_norm) | 0,2697 |
| AdvBench HarmBench ASR | 0,0038 |
| StrongREJECT HarmBench ASR | 0,0160 |
| Tasa de sobre-rechazo (XSTest-safe) | 0,1680 |
| Tasa de sobre-rechazo (OR-Bench-Hard-1K) | 0,4829 |
| Tasa de sobre-rechazo macro | 0,3255 |

No se han publicado en la informacion disponible resultados comparativos directos frente al modelo base sin comprimir ni frente a otras alternativas, por lo que no es posible establecer una tabla comparativa de rendimiento con datos verificados.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 26 GB para los pesos densos (13B parametros), mas la cache KV; alrededor de 28-32 GB en funcion de la longitud de contexto.
- VRAM estimada en 8 bits: aproximadamente 13-14 GB mas cache KV.
- VRAM estimada en 4 bits: aproximadamente 7-8 GB mas cache KV.
- GPU recomendadas: A100 40/80 GB y H100 para fp16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) puede alojar el modelo en 8 bits o 4 bits, y en fp16 requeriria reparto u offloading.
- GPU de consumo: cabe en tarjetas consumer de 24 GB (RTX 3090/4090) en cuantizacion de 8 o 4 bits; en fp16 no cabe holgadamente sin offloading.
- Opciones de despliegue: `transformers` estandar (carga directa al ser un checkpoint denso); vLLM y TGI para servicio; llama.cpp/Ollama requieren conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el checkpoint de rango deficiente no reduce el espacio en disco ni la VRAM respecto al Llama-2-13b denso, segun la propia model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ratio de compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (13b_chat_up_svdllm_keep_0p70) | 13.015.864.320 densos (0,6999 realizados) | 4096 tokens (heredado) | 30 % eliminado | llama2 | safetensors |
| Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_finetuned_keep_0p50 | ~7B (60 % retenido segun variante homonima) | no disponible | 50 % eliminado | llama2 | safetensors |
| Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbsft_finetuned_keep_0p60 | ~7B | no disponible | 40 % eliminado | llama2 | safetensors |
| Jeesup/svd-safety-llama2_7b_chat_remove_40_seed42 | ~7B | no disponible | 40 % eliminado | llama2 | safetensors |
| meta-llama/Llama-2-13b-chat-hf (base sin comprimir) | ~13B | 4096 tokens | ninguno | llama2 | safetensors |

Los datos de las variantes de 7B provienen de los resultados de busqueda web y estan incompletos; no se dispone de sus metricas de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- La propia model card advierte de que la compresion a este ratio puede degradar la calidad de generacion; los numeros de seguridad de un modelo degradado no deben considerarse evidencia sobre alineacion.
- El rendimiento en razonamiento matematico es bajo (MathQA acc_norm 0,2697); no es adecuado para tareas de matematicas exigentes.
- La tasa de sobre-rechazo en OR-Bench-Hard-1K es elevada (0,4829), lo que sugiere que el modelo rechaza peticiones seguras con frecuencia.
- El checkpoint es de rango deficiente pero no mas pequeno en disco (26,1 GB), por lo que no aporta ventajas de eficiencia de almacenamiento ni de VRAM frente al modelo denso original.
- Los idiomas soportados no estan documentados en la informacion disponible; el Llama-2-chat original esta optimizado principalmente para ingles.
- La licencia es `llama2`, con las restricciones de uso comercial y de redistribucion que impone la Llama 2 Community License; es necesario revisar sus condiciones antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos de la familia Llama 2 y potencialmente agravado por la compresion; no hay mediciones especificas en la informacion disponible.
- Sesgos conocidos: no documentados especificamente para este checkpoint.
- Las cifras de seguridad y sobre-rechazo estan ligadas a los jueces automaticos empleados (HarmBench-Llama-2-13b-cls y wildguard) y a un protocolo de generacion greedy; pueden no reproducirse con otros decodificadores o plantillas.
- No hay informacion sobre cuantizaciones publicadas ni sobre rendimiento de latencia y throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama2_13b_chat_up_svdllm_seed42_finetuned_keep_0p70
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-chat-hf
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juez de seguridad HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo WildGuard: https://huggingface.co/allenai/wildguard
- Variante relacionada 7B keep_0p50: https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_finetuned_keep_0p50
- Variante relacionada 7B keep_0p60 (jbbsft): https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbsft_finetuned_keep_0p60
- Variante relacionada 7B remove_40: https://featherless.ai/models/Jeesup/svd-safety-llama2_7b_chat_remove_40_seed42
- Guia de Llama 2 13B: https://ultraaiguide.com/llama-2-13b-complete-guide/
