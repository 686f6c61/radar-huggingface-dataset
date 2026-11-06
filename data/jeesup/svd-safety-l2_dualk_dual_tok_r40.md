# Jeesup/svd-safety-l2_dualk_dual_tok_r40

## Resumen

`svd-safety-l2_dualk_dual_tok_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD blanqueado con K-FAC de doble dominio (curvatura de utilidad y de seguridad) y posteriormente recuperado con el LoRA de segunda etapa de SVD-LLM. El autor (Jeesup) lo publica como artefacto de investigacion para medir como la compresion por SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. No es un modelo conversacional de proposito general.

El checkpoint conserva el 59,98 % de los parametros densos del modelo original (se elimina el 40,00 %), lo que se traduce en 6.738.415.616 parametros almacenados en safetensors. La arquitectura subyacente es la de Llama 2 7B chat: transformer decoder-only con 32 capas, atencion multi-cabeza con GQA en el original y contexto nativo de 4096 tokens.

Su relevancia es metodologica: forma parte de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de rango, con calibracion explicita de utilidad (wikitext-2) y de seguridad (512 muestras con perdida sobre tokens de respuesta). Los resultados medidos incluyen ASR de 0,0058 en AdvBench y 0,0192 en StrongREJECT (juez HarmBench), y una perplexity de 9,9229 en WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2 7B chat), comprimido por SVD |
| Parametros totales | 6.738.415.616 (59,98 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 7B chat. La compresion aplica SVD blanqueado con K-FAC en dos dominios: una curvatura de utilidad calibrada con wikitext-2-raw-v1 (muestreador de SVD-LLM, 255 ventanas de 2048 tokens, semilla 42, entropia cruzada de siguiente token) y una curvatura de seguridad calibrada con 512 muestras de `results/dual_kfac_wj/wj_safe_l2.jsonl` (perdida sobre tokens de respuesta). El objetivo conjunto es `F_dual = (1-a) G_u (x) A_u + a G_s (x) A_s`, con peso de seguridad `a = 0,2639` y normalizacion `tok` (A dividido por posiciones, G dividido por tokens de perdida, por dominio). El solver es `dual`: optimo de bajo rango por ALS de base conjunta (hasta 300 barridos, rtol 1e-07, ridge 1e-06) partiendo de la solucion mezcla. El presupuesto de rango por matriz es el de SVD-LLM al mismo ratio de eliminacion.

Tras la compresion se aplica la recuperacion de segunda etapa de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con dataset alpaca-cleaned, r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, condicionada por la compresion.
- Razonamiento y respuesta a instrucciones a nivel de modelo base, sin garantias tras la compresion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no declaradas por el autor.
- No dispone de modo thinking, vision ni audio.
- Valor principal: servir como sujeto experimental para estudiar el equilibrio seguridad/utilidad bajo compresion SVD.

## Casos de uso

- Investigacion sobre compresion de modelos: usar el checkpoint como celda de una rejilla para comparar reglas de seleccion de componentes (dual frente a solo utilidad) a un presupuesto fijo del 60 % de parametros.
- Estudio de degradacion de seguridad: medir ASR en AdvBench y StrongREJECT con juez HarmBench y contrastar con el modelo denso sin comprimir para cuantificar el dano inducido por la compresion.
- Analisis de sobre-rechazo: emplear la metrica de sobre-rechazo macro con WildGuard (0,4586 en este checkpoint) para estudiar el coste en utilidad de las intervenciones de seguridad.
- Evaluacion de recuperacion con LoRA: reproducir la etapa 2 de SVD-LLM (alpaca-cleaned, r=8) y medir cuanto recupera en perplexity de WikiText-2 (9,9229) y en ASR.
- Benchmarking de pipelines de compresion: integrar el checkpoint en un banco de pruebas que compare SVD-LLM, K-FAC simple y K-FAC de doble dominio bajo el mismo presupuesto de rango.
- Analisis de interpretabilidad: inspeccionar las bases U y V resultantes y la asignacion de rango por matriz para estudiar que componentes concentran la informacion relacionada con seguridad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0058 |
| StrongREJECT ASR (juez HarmBench) | 0,0192 |
| Sobre-rechazo macro (WildGuard) | 0,4586 |
| Perplexity WikiText-2 | 9,9229 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 13,5 GB solo para pesos, mas activaciones y cache KV; en la practica 16-24 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB (no se publican variantes cuantizadas oficiales, habria que generarlas).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio; RTX 4090 (24 GB) para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requeririan conversion previa a los formatos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_dual_tok_r40 | 6.738.415.616 (59,98 % del denso) | 4096 | Llama 2 Community | ASR AdvBench 0,0058; PPL WikiText-2 9,9229; artefacto de investigacion |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | 4096 | Llama 2 Community | Modelo base sin comprimir; referencia para medir la degradacion |
| Otras celdas de la rejilla del autor | no disponible | 4096 | Llama 2 Community | Distintas reglas de seleccion y presupuestos; no se publican sus metricas en la informacion disponible |

No se dispone de datos para comparar con alternativas de compresion de terceros (por ejemplo, variantes SVD-LLM de otros autores) en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.
- Riesgo de alucinacion heredado de Llama 2 7B y potencialmente agravado por la compresion al 60 % de parametros.
- El sobre-rechazo macro de 0,4586 (WildGuard) indica una tasa elevada de rechazos en peticiones benignas.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base y los del dataset alpaca-cleaned usado en la recuperacion LoRA.
- Idiomas soportados no declarados; el entrenamiento de recuperacion usa alpaca-cleaned, predominantemente en ingles.
- Licencia Llama 2 Community: restricciones de uso comercial y obligaciones de la USE_POLICY; el repo incluye `LICENSE.txt` y `USE_POLICY.md`.
- No se publican variantes cuantizadas ni resultados de benchmarks de razonamiento o codigo; cualquier evaluacion adicional corre a cargo del usuario.
- El checkpoint se creo el 2026-11-06 y no registra descargas ni likes, por lo que no existe validacion externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales del autor.
