# devopsfortunato/Fonzie0.2-4B-GGUF

## Resumen

Fonzie0.2-4B-GGUF es la cuantizacion en formato GGUF de Fonzie0.2-4B, un fine-tuning de 4.326 millones de parametros basado en Qwen3.5-4B (Qwen) desarrollado por Alfonso Fortunato (devopsfortunato). El modelo esta disenado para operar dentro de aplicaciones agenticas: busca en la web cuando no conoce la respuesta, responde citando fuentes, reconoce cuando algo no existe y puede preguntar al usuario mediante la herramienta `ask` en el entorno oh-my-pi. Ademas, es multimodal (vision) y bilingue, con soporte de italiano e ingles.

Respecto a su predecesor Fonzie0.1, esta version reintenta busquedas fallidas, lanza busquedas proactivas para consultas del tipo "lo ultimo sobre X" y comunica explicitamente cuando un recurso no existe. La relevancia de esta ficha radica en que se trata de la distribucion GGUF, pensada para ejecucion local con llama.cpp, LM Studio u Ollama, con un consumo de memoria muy contenido (2,8 GB en Q4_K_M) y decodificacion especulativa mediante MTP (multi-token prediction) que eleva el throughput hasta 157 tokens/s en una RTX 4070 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-4B), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens (limite del modelo) |
| Tipos de cuantizacion | Q4_K_M (2,8 GB), Q8_0 (4,6 GB), bf16 original; proyector de vision en F16 (0,7 GB) |
| Idiomas soportados | Italiano, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp); original en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder de la familia Qwen, al que se ha aplicado un fine-tuning orientado a comportamiento agentico: uso de herramientas de busqueda web, citacion de fuentes, manejo de reintentos tras busquedas fallidas y formulacion de preguntas al usuario mediante tool calling. Incorpora una cabeza de multi-token prediction (MTP) que permite decodificacion especulativa de tipo draft-MTP en llama.cpp, acelerando la generacion sin modelo draft externo.

No se han publicado detalles del dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO en la informacion disponible; el autor remite a la model card del modelo completo Fonzie0.2-4B para los detalles de entrenamiento y evaluacion. Las cuantizaciones GGUF se generaron desde una conversion F16: la Q4_K_M procede de esa conversion F16 y la Q8_0 es la mas cercana al bf16 original (sin evaluar todavia).

## Capacidades

- Generacion de texto conversacional en italiano e ingles, con respuestas que citan fuentes cuando usa busqueda web.
- Vision multimodal: acepta imagenes mediante el proyector `mmproj-Fonzie0.2-4B-F16.gguf`.
- Comportamiento agentico: entrenado para funcionar dentro de apps de agentes como oh-my-pi y opencode.
- Tool calling y web search: busca activamente cuando no sabe la respuesta, reintenta tras busquedas fallidas y busca primero en consultas sobre novedades ("the latest X").
- Comunicacion honesta: indica cuando algo no existe y usa la herramienta `ask` para preguntar al usuario en oh-my-pi.
- Modo razonamiento largo: sin herramientas y con system prompt, recurre al "long thinking" del modelo base (compatible con `--reasoning-format deepseek`).
- Decodificacion especulativa nativa via MTP (draft de hasta 2 tokens).

## Casos de uso

- Agentes de busqueda web locales: el modelo esta entrenado explicitamente para decidir cuando buscar, citar las fuentes devueltas por las herramientas y admitir cuando un resultado no existe, lo que lo hace adecuado para asistentes de investigacion que corren en local.
- Asistentes en italiano e ingles: soporte bilingue nativo, util para chatbots orientados al mercado italiano que necesiten respuestas con referencias verificables.
- Ejecucion en portatiles y PCs de consumo: con 2,8 GB en Q4_K_M y unos 4,2 GiB de VRAM a 8k de contexto, cabe con holgura en GPUs de 8-12 GB, permitiendo agentes privados sin nube.
- Coding agents con opencode: evaluado dentro de opencode con resultados equivalentes al bf16, apto para asistentes de codigo con herramientas integradas.
- Analisis de imagenes en local: mediante el archivo mmproj puede describir y razonar sobre imagenes sin salir de la maquina, util para moderacion o catalogacion privada.
- Chat con contexto muy largo: hasta 262.144 tokens de contexto; con KV cache q8_0 en una GPU de 12 GB alcanza los 229.376 tokens con proyector de vision cargado, adecuado para resumir documentos extensos o conversaciones multi-turno muy largas.
- Prototipado en LM Studio: carga del modelo junto al mmproj en dos clics, ideal para explorar el comportamiento agentico antes de integrarlo en produccion.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando el bf16 (en vLLM 0.32) frente a la cuantizacion Q4_K_M (en llama-server). En negrita, diferencias cuyo intervalo de confianza del 95% emparejado excluye el cero:

| Prueba | bf16 | Q4_K_M |
|---|---:|---:|
| Frozen test: accuracy | 66,5% | 64,8% |
| Frozen test: respuestas erroneas con confianza | 24,6% | 27,4% |
| Frozen test: enlaces inventados | 2,6% | **7,2%** |
| Preguntas cotidianas, accuracy (oh-my-pi) | 66,9% | **54,2%** |
| Preguntas cotidianas, accuracy (opencode) | 66,7% | 66,7% |
| Preguntas cotidianas, accuracy (Hermes) | 76,4% | 73,2% |
| Nuevo test set, accuracy (oh-my-pi) | 55,4% | 52,1% |
| Nuevo test set, accuracy (opencode) | 61,1% | 67,2% |
| Nuevo test set, accuracy (Hermes) | 67,8% | 60,6% |

El autor advierte que estas ejecuciones no pueden separar el efecto de los pesos a 4 bits del del motor (llama.cpp frente a vLLM). En opencode y Hermes la Q4_K_M es equiparable al bf16; en oh-my-pi pierde unos 13 puntos en preguntas cotidianas y genera mas enlaces que ninguna herramienta devolvio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

**Velocidad** (RTX 4070 Ti, un usuario): 118,1 tokens/s en Q4_K_M; 157,0 tokens/s con MTP 2 activado.

## Requisitos de hardware

- VRAM con proyector de vision, MTP y KV cache f16 (medido/calculado por el autor):
  - Q4_K_M: 4,2 GiB a 8k; 5,1 GiB a 32k; 6,3 GiB a 64k; 8,7 GiB a 128k; 10,1 GiB a 160k; ≥13,4 GiB a 262k.
  - Q8_0: 5,9 GiB a 8k; 6,8 GiB a 32k; 8,0 GiB a 64k; 10,4 GiB a 128k; 11,8 GiB a 160k; ≥15,1 GiB a 262k (calculado, no ejecutado).
- Sin MTP ni proyector, la parte fija baja a 3,0 GiB.
- Con KV cache q8_0 (`-ctk q8_0 -ctv q8_0`) el consumo por token se reduce a menos de la mitad: en una GPU de 12 GB, la Q4_K_M alcanza 229.376 tokens con proyector (pico de 10,0 GiB) o los 262.144 completos solo con texto.
- GPU de referencia en las mediciones: RTX 4070 Ti (12 GB). Cabe en GPUs consumer de 8 GB para contextos cortos/medios en Q4_K_M; para contextos de 128k o mas se recomienda una tarjeta de 12 GB o superior. No hay mediciones en A100/H100.
- Despliegue: llama.cpp (`llama-server`, configuracion de referencia del autor), LM Studio (cargando modelo + mmproj) y, en general, cualquier runtime GGUF (Ollama, llama-cpp-python). El bf16 original se sirvio con vLLM 0.32.
- Throughput medido: 118,1 tokens/s (Q4_K_M, RTX 4070 Ti, un usuario); 157,0 tokens/s con decodificacion especulativa MTP 2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Fonzie0.2-4B-GGUF (este modelo) | 4,3B | 262.144 | Vision (mmproj) | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-4B (base) | 4,3B | no disponible en la informacion proporcionada | Vision (segun tags del derivado) | Apache 2.0 | safetensors |
| Fonzie0.2-4B (modelo completo) | 4,3B | 262.144 | Vision | Apache 2.0 | safetensors (servido con vLLM) |

Frente a su modelo base Qwen3.5-4B, Fonzie0.2-4B anade el comportamiento agentico (busqueda web con reintentos, citacion de fuentes, herramienta `ask`). Frente a la version completa en bf16, esta variante GGUF sacrifica algo de precision (especialmente en oh-my-pi, con mas enlaces inventados) a cambio de poder ejecutarse en GPUs consumer con llama.cpp y mayor velocidad efectiva gracias a MTP.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M degrada el comportamiento agentico en algunos entornos: en oh-my-pi pierde unos 13 puntos de accuracy en preguntas cotidianas frente al bf16 y triplica los enlaces inventados (7,2% frente a 2,6%). Para produccion critica, considerar Q8_0 o el bf16.
- La Q8_0 no ha sido evaluada todavia segun el autor.
- Sin herramientas de busqueda web y con system prompt, el modelo cae en el "long thinking" del modelo base, con latencias mucho mayores: es imprescindible dotarle de una herramienta de busqueda.
- Idiomas limitados a italiano e ingles; no hay soporte declarado para castellano ni otros idiomas.
- Las mediciones de velocidad y memoria corresponden a una sola GPU (RTX 4070 Ti) y un solo usuario; el rendimiento en otros entornos puede diferir.
- Las aplicaciones de escritorio comparten VRAM en la misma tarjeta: el autor recomienda dejar margen de memoria.
- Riesgo de alucinacion de enlaces: la propia model card mide enlaces inventados en hasta un 7,2% de respuestas en la Q4_K_M; conviene validar las fuentes citadas en flujos sensibles.
- No se han publicado detalles sobre sesgos, dataset de entrenamiento ni tecnicas de alineacion (RLHF/DPO) en la informacion disponible.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo GGUF: https://huggingface.co/devopsfortunato/Fonzie0.2-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo completo (Fonzie0.2-4B, con evaluaciones y detalles de entrenamiento): no disponible URL directa; referenciado en la model card del autor
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor: Alfonso Fortunato (https://huggingface.co/devopsfortunato)
