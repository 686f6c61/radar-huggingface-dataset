# richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-SOM-heretic-GGUF es una coleccion de cuantizaciones GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-SOM-heretic, una version "abliterada" (con el mecanismo de rechazo eliminado) de Qwen/Qwen2.5-7B-Instruct. El autor, Richard J. Young, aplico la tecnica Heretic 2.0, que emplea mapas autoorganizados (SOM) para realizar una ablacion multi-direccional de las direcciones de rechazo en el espacio de activaciones. El resultado es un modelo que responde a peticiones que el original rechaza, manteniendo una divergencia KL de primer token de 0,076 respecto al original.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros y una ventana de contexto de 32.768 tokens (caracteristica de la familia Qwen2.5). Esta publicacion concreta ofrece los pesos en formato GGUF para su uso con llama.cpp y Ollama, con cuantizaciones Q4_K_M (4,7 GB) y Q8_0 (8,1 GB), ademas de una matriz de importancia (imatrix) para cuantizaciones de mayor calidad.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigacion sobre eliminacion de rechazos en modelos open-weight, evaluado en el articulo "Is Abliteration Getting Harder?" de Young (2026); por otro, sirve como ejemplo practico de cuantizacion GGUF con imatrix. No obstante, el propio autor advierte que no esta pensado como asistente de proposito general y que las cuantizaciones no fueron evaluadas en el paper, por lo que el comportamiento de rechazo puede variar tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | Q4_K_M, Q8_0; en preparacion: IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion por grupos de consultas (GQA), normalizacion RMSNorm y activacion SwiGLU, preentrenado y ajustado por instrucciones por Alibaba Qwen. Sobre ese modelo, Richard J. Young aplico Heretic 2.0, una variante del metodo de ablacion que utiliza mapas autoorganizados para identificar multiples direcciones de rechazo en lugar de una unica direccion. La seleccion de la configuracion se realizo mediante una busqueda de 100 ensayos con la regla de menor numero de rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token menor o igual a 0,1.

Los datos de entrenamiento del modelo base no se detallan en la informacion proporcionada. La model card indica que el proceso de ablacion se evaluo sobre 972 prompts daninos reservados (held-out) con el juez WildGuard, y que el modelo resultante reduce la tasa de rechazo del 72,1% al 12,2% (119 de 972). No se menciona el uso de RLHF o DPO adicional en esta version; la intervencion es puramente de edicion de pesos (ablacion de direcciones). La cuantizacion se realizo con llama.cpp (commit 468fde9) mediante convert_hf_to_gguf.py y llama-quantize en CPU, usando una matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens) para IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas basicas (capacidades del modelo base, no verificadas especificamente en esta version).
- Eliminacion parcial del mecanismo de rechazo: el modelo cumple muchas peticiones que el original rechaza, segun la evaluacion con WildGuard.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para esta version; el modelo base Qwen2.5-Instruct lo soporta, pero la ablacion podria afectar al formato.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles (en); no se confirman otros idiomas.
- Modo thinking, vision o audio: no disponible (no se declaran).

## Casos de uso

- Investigacion sobre eliminacion de rechazos: el modelo sirve como artefacto de estudio para medir la eficacia de la ablacion SOM y comparar tasas de rechazo antes y despues del proceso, usando el juez WildGuard y el conjunto de 972 prompts reservados.
- Evaluacion de defensas frente a abliteracion: permite a investigadores de seguridad probar tecnicas de restauracion de rechazos o de deteccion de modelos manipulados, comparando la divergencia KL y las tasas de cumplimiento.
- Despliegue local con Ollama: gracias a la cuantizacion Q4_K_M (4,7 GB), puede ejecutarse en equipos de consumo mediante `ollama run richardyoung/qwen2.5-7b-instruct-som-heretic`, lo que facilita experimentos reproducibles sin infraestructura de GPU dedicada.
- Pruebas de cuantizacion con imatrix: la publicacion incluye una matriz de importancia y builds IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M, utiles para estudiar el impacto de la cuantizacion en el comportamiento de rechazo y en la perplejidad.
- Analisis de sesgos y alineacion: al eliminar el rechazo, el modelo expone sesgos y respuestas que el original filtra, lo que permite auditar el comportamiento latente del modelo base en entornos controlados de investigacion.
- Generacion de texto en ingles sin restricciones de contenido: para tareas creativas o de investigacion donde el rechazo del modelo original supone un obstaculo, siempre que el uso sea licito y este supervisado.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo en precision completa (bf16), no a las cuantizaciones GGUF de este repositorio:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 72,1% | 12,2% (119/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 27 |
| Divergencia KL de primer token respecto al original | no disponible | 0,076 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card advierte que las cuantizaciones no fueron evaluadas en el paper y que la cuantizacion puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para Q4_K_M (4,7 GB de pesos mas overhead de contexto) y 9-10 GB para Q8_0 (8,1 GB de pesos).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100. Para Q8_0 se recomienda al menos 12 GB de VRAM.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 8 GB o mas; Q8_0 en GPUs de 12 GB o mas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier runtime compatible con GGUF; el tag indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (WildGuard, 972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-SOM-heretic-GGUF (este) | 7,6B | no disponible | 12,2% (bf16) | apache-2.0 | GGUF |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6B | 32.768 | 72,1% | apache-2.0 | safetensors |
| richardyoung/Qwen2.5-7B-Instruct-SOM-heretic (bf16) | 7,6B | no disponible | 12,2% | apache-2.0 | safetensors |

Como alternativas de la misma categoria (modelos abliterados de ~7B) no se dispone de datos comparativos en la informacion proporcionada; no disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es para investigacion sobre abliteracion y su evaluacion, no como asistente de proposito general.
- La eliminacion del rechazo puede producir respuestas daninas, sesgadas o inexactas; el modelo cumple muchas peticiones que el original rechaza (12,2% de rechazo frente a 72,1%).
- La cuantizacion puede alterar el comportamiento de rechazo; las cuantizaciones de este repositorio no fueron evaluadas en el paper.
- Riesgo de alucinacion: inherente al modelo base Qwen2.5-7B-Instruct, no cuantificado en la informacion disponible.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: apache-2.0, con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso licito.
- La divergencia KL de 0,076 indica cambios en la distribucion de salida respecto al original, lo que puede afectar a la calidad en tareas generales.
- No se han publicado benchmarks estandar de rendimiento (MMLU, HumanEval, GSM8K) para esta version.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Articulo citado: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026), enlace arXiv pendiente de publicacion.
