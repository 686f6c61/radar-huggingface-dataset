# hollowfound/Llama-3.3-70B-Instruct-NVFP4-GGUF

## Resumen

Llama-3.3-70B-Instruct-NVFP4-GGUF es una cuantización NVFP4 (pesos a 4 bits en formato de punto flotante) del modelo Llama 3.3 70B Instruct de Meta, publicada por el usuario hollowfound en HuggingFace. El modelo base es un transformer decoder-only de 70.553 millones de parámetros optimizado para instrucciones, y esta versión cuantizada reduce las 136,9 GB de pesos bf16 de las capas lineales a 38,5 GB, resultando en un archivo GGUF de 42,7 GB.

El problema que resuelve es la barrera de hardware para ejecutar modelos de 70B: mientras que el modelo original en bf16 requiere varias GPU de gama alta, esta versión cabe en una única GPU de 48 GB con contexto moderado. La cuantización se ha realizado con la herramienta hollowQuant, sin datos de calibración, y el resultado se ha convertido al formato GGUF mediante el script oficial de llama.cpp.

Su relevancia actual radica en la verificación empírica de la degradación: en GSM8K la pérdida respecto al modelo bf16 es de solo 0,61 puntos (92,19 frente a 92,80), lo que demuestra que la cuantización NVFP4 weight-only preserva casi por completo la capacidad de razonamiento matemático del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.3) |
| Parametros totales | 70.553.707.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha (el modelo base Llama 3.3 soporta 128.000 tokens) |
| Tipos de cuantizacion | NVFP4 weight-only (valores E2M1, una escala E4M3 por cada 16 pesos, una escala fp32 por tensor); W4A16 |
| Idiomas soportados | ingles (etiquetado; el modelo base soporta mas idiomas) |
| Licencia | Llama 3.3 Community License |
| Formato de pesos | GGUF (archivo unico de 42,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.3 70B: un transformer decoder-only con las 560 capas lineales de atencion y MLP cuantizadas a NVFP4 a 4,50 bits por peso. Los token embeddings, la cabecera de salida (`lm_head`) y las normas se mantienen en bf16. El esquema NVFP4 usa valores E2M1 con una escala E4M3 por bloque de 16 pesos y una escala fp32 por tensor, y los grupos q/k/v y gate/up comparten una misma escala de tensor. Los tensores estan etiquetados como W4A16, de modo que llama.cpp mantiene las activaciones en alta precision, incluso en GPUs Blackwell.

El metodo de cuantizacion es round-to-nearest con una busqueda de ±1 codepoint sobre la escala E4M3 de cada bloque, sin datos de calibracion. El proceso completo tardo 138 segundos (2,8 s en GPU). Respecto al modelo base, Llama 3.3 70B Instruct fue entrenado por Meta con preentrenamiento a gran escala y posterior afinado con instrucciones (SFT, RLHF y DPO segun la documentacion de Meta); esta ficha no aporta detalles adicionales del entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento matematico: 92,19 en GSM8K 5-shot tras la cuantizacion.
- Generacion de codigo y razonamiento general heredados de Llama 3.3 70B Instruct.
- Soporte de tool calling / function calling heredado del modelo base (no verificado en esta cuantizacion; no disponible).
- Ejecucion eficiente en llama.cpp con kernels NVFP4, con activaciones en 8 bits en GPUs no Blackwell y en alta precision en Blackwell.

## Casos de uso

- Chatbots y asistentes conversacionales en un solo servidor GPU de 48 GB: el archivo GGUF de 42,7 GB permite desplegar un modelo de 70B instruct sin repartir pesos entre varias GPUs.
- Razonamiento matematico y resolucion de problemas: mantiene 92,19 en GSM8K, adecuado para asistentes de calculo y educacion STEM.
- Generacion y revision de codigo local: ejecucion privada con llama-server para flujos de trabajo de programacion sin enviar codigo a servicios externos.
- Prototipado y evaluacion de cuantizaciones FP4: el README documenta la metodologia (flips vs bf16), util como referencia para comparar metodos de cuantizacion.
- Inferencia en hardware Blackwell: los tensores W4A16 permiten mantener activaciones en alta precision aprovechando soporte NVFP4 nativo.
- Despliegue autoalojado economico: reduce el coste de VRAM a la mitad aproximadamente frente a cuantizaciones de 8 bits, con perdida de precision minima en benchmarks.

## Benchmarks y rendimiento

Resultados de GSM8K publicados en la model card (5-shot, plantilla de chat, decodificacion greedy, 1.319 preguntas, lm-eval 0.4.13, flexible-extract):

| Modelo | GSM8K | Flips vs bf16 (perdidas / ganadas) | Motor |
|---|---|---|---|
| bf16 (referencia) | 92,80 | – | vllm 0.31.0 |
| NVFP4A16, compressed-tensors | 92,34 | 68 (37 / 31) | vllm 0.31.0 |
| **este GGUF** | 92,19 | 60 (34 / 26) | llama.cpp b11559 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 43 GB para los pesos, mas KV cache; cabe en una GPU de 48 GB con contexto modesto (ejemplo del README: `-c 8192`).
- GPU recomendadas: GPUs de 48 GB como la A6000, L40S, A40 o RTX 6000 Ada; en Blackwell aprovecha kernels NVFP4 nativos.
- Consumer GPUs: no cabe en GPUs de consumo tipicas de 16-24 GB; se requeriria descarga de capas a CPU o GPUs multiplano.
- Despliegue: llama.cpp (build b11559 o posterior, con soporte NVFP4) mediante `llama-server -m Llama-3.3-70B-Instruct-NVFP4.gguf -ngl 999 -c 8192`. No se menciona compatibilidad con vLLM, Ollama o TGI para este archivo concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | GSM8K | Licencia |
|---|---|---|---|---|---|
| Llama-3.3-70B-Instruct (bf16) | 70,55B | bf16 | ~141 GB | 92,80 | Llama 3.3 Community |
| Llama-3.3-70B-Instruct-NVFP4A16 (compressed-tensors) | 70,55B | NVFP4 W4A16 | no disponible | 92,34 | Llama 3.3 Community |
| Este GGUF (hollowfound) | 70,55B | NVFP4 W4A16 (GGUF) | 42,7 GB | 92,19 | Llama 3.3 Community |

Alternativas de cuantizacion equivalentes para el mismo modelo base (por ejemplo GGUF Q4_K_M de terceros) existen en HuggingFace, pero no se dispone de datos comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible: 60 preguntas de GSM8K cambian de resultado respecto a bf16 (34 perdidas, 26 ganadas); en tareas sensibles puede haber regresiones no documentadas.
- Cuantizacion sin datos de calibracion (round-to-nearest): metodos con GPTQ/AWQ pueden preservar mejor la calidad en algunas tareas.
- Idioma etiquetado como ingles; el rendimiento en castellano u otros idiomas tras la cuantizacion no ha sido verificado.
- Requiere llama.cpp b11559 o posterior; versiones anteriores no cargaran los tensores NVFP4.
- En GPUs no Blackwell, llama.cpp usa activaciones de 8 bits, lo que puede introducir diferencias adicionales respecto a la referencia W4A16.
- Licencia Llama 3.3 Community: uso comercial permitido con condiciones (atribucion con "Built with Llama", aceptacion de la Acceptable Use Policy y restricciones para entidades con mas de 700 millones de usuarios activos mensuales).
- Riesgo de alucinacion inherente a los LLM; no hay evaluaciones de seguridad especificas de esta cuantizacion.
- Repositorio con baja traccion (104 descargas, 1 like): verificacion comunitaria limitada.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hollowfound/Llama-3.3-70B-Instruct-NVFP4-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Llama 3.3 Community License: https://huggingface.co/meta-llama/Llama-3.3/blob/main/LICENSE
- Acceptable Use Policy de Meta: https://www.llama.com/llama3/use-policy
- llama.cpp (repositorio y script convert_hf_to_gguf.py): https://github.com/ggml-org/llama.cpp
- No se han encontrado enlaces a papers, blogs o demos adicionales en la informacion disponible.
