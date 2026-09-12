# CocaKova/Agnes-3.0-Flash-Preview-NVFP4

## Resumen

Agnes-3.0-Flash-Preview-NVFP4 es una compilacion cuantizada a NVFP4 del checkpoint abierto Agnes-AI/Agnes-3.0-Flash (version Preview, publicada el 11 de septiembre de 2026) realizada por el usuario CocaKova. El modelo original es un modelo multimodal de tipo image-text-to-text con capacidades de razonamiento, construido sobre la arquitectura de Qwen3.5-27B: 72 capas, atencion hibrida con gated delta rule en proporcion 3:1 respecto a atencion completa con mRoPE, torre de vision y una capa MTP (multi-token prediction) para decodificacion especulativa. Cuenta con 32.665.802.288 parametros reales segun los safetensors del repositorio.

La aportacion principal de esta ficha no es el modelo base, sino el proceso de cuantizacion: se pliega la arquitectura original (que anade un segundo SwiGLU estrecho de 2048 unidades por capa, `parallel_ffn`) a un grafo estandar `Qwen3_5ForConditionalGeneration`, de modo que el modelo se carga en vLLM sin `trust_remote_code`. El resultado reduce el peso de 61,6 GiB a 22,0 GiB, lo que permite ejecutarlo en una unica NVIDIA DGX Spark (GB10) manteniendo intactas la vision y la cabeza MTP de borrador.

Es relevante ahora porque demuestra un flujo reproducible de cuantizacion NVFP4 (W4A4, grupo 16) sobre hardware Blackwell de gama de escritorio, con verificacion numerica explicita del plegado (KL media 5,0e-3, coincidencia de argmax del 99,2 %) y mediciones de rendimiento reales en vLLM: 10,6 tok/s sin especulacion y hasta 26 tok/s con MTP k=3 en texto muy predecible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal derivado de Qwen3.5-27B: 72 capas, gated delta rule (linear attention) y atencion completa en proporcion 3:1, mRoPE, torre de vision, 1 capa MTP; plegado a `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 32.665.802.288 (32,67 B) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue del autor usa `--max-model-len 131072`, y la cache KV medida alcanza 206k tokens con `--gpu-memory-utilization 0.35` |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) con escalas FP8 por grupo de 16, via llm-compressor y `compressed-tensors`; se mantienen en BF16 `lm_head`, torre de vision, `conv1d` del delta rule y la cabeza MTP. El repositorio incluye la etiqueta `8-bit` |
| Idiomas soportados | No disponible (la model card no publica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato `compressed-tensors`), compatible con vLLM; no requiere `trust_remote_code` |
| Tamano del repositorio | 23,6 GB (pesos cuantizados ~22,0 GiB) |
| Pipeline | image-text-to-text |
| Cuantizado por | CocaKova (a partir de Agnes-AI/Agnes-3.0-Flash) |

## Arquitectura y entrenamiento

Agnes-3.0-Flash parte de la arquitectura de Qwen3.5-27B: 72 capas con un esquema hibrido de atencion que combina gated delta rule (atencion lineal con puerta) y atencion completa en una proporcion 3:1, mRoPE para el modelado posicional, una torre de vision compartida y una unica capa MTP que actua como modelo borrador para decodificacion especulativa. Sobre esa base, el modelo original anade un segundo SwiGLU mas estrecho por capa (`parallel_ffn`, 2048 unidades) cuya salida se suma a la del MLP principal. El proceso de plegado de esta compilacion aprovecha que dos SwiGLU sobre la misma entrada equivalen a uno mas ancho: concatena `gate`/`up` en la dimension de salida y `down` en la de entrada, de modo que `intermediate_size` pasa a ser 17408 + 2048 = 19456. El renombrado de modulos (`delta_attn` → `linear_attn`, `global_attn` → `self_attn`) es el mismo que aplica el parche de SGLang incluido con el modelo en tiempo de carga.

La verificacion del plegado se hizo comparando logits forzados por profesor sobre los mismos 242 tokens: el checkpoint original ejecutado con su `modeling_agnes.py` (transformers 5.12.1) frente al checkpoint plegado con `Qwen3_5ForConditionalGeneration` estandar (transformers 5.10.1), con KL media de 5,0e-3, coincidencia de argmax del 99,2 % y perplejidad 164,3 frente a 163,0. La cuantizacion posterior se realizo con llm-compressor en modo NVFP4 (pesos y activaciones en FP4, escalas FP8 por grupo de 16) usando 32 muestras de calibracion de 4096 tokens procedentes de ultrachat_200k. La cabeza MTP se readjunto tras cuantizar y se listo en `quantization_config.ignore`; como no tiene rama paralela en el modelo original, su SwiGLU se relleno con ceros de 17408 a 19456 para que el modelo borrador de vLLM coincida con la anchura plegada. No se documentan en la informacion disponible detalles sobre el dataset de preentrenamiento, el numero de tokens ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional y multimodal: acepta imagenes y texto como entrada (pipeline `image-text-to-text`) y produce respuestas de texto.
- Razonamiento explicito con modo de pensamiento: soporta `enable_thinking: false` para desactivarlo y niveles de esfuerzo configurables mediante `chat_template_kwargs: {"reasoning_effort": "low"|"medium"|"xhigh"}`, con `xhigh` como valor por defecto.
- Tool calling / function calling: verificado de extremo a extremo con el parser `qwen3_xml` en vLLM (`--enable-auto-tool-choice --tool-call-parser qwen3_xml`).
- Razonamiento multi-paso orientado a agentes: el autor recomienda reducir `reasoning_effort` para cargas de trabajo de agente.
- Decodificacion especulativa integrada: incluye la cabeza MTP readjunta, usable con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Capacidades aritmeticas y de conteo: en la verificacion del autor ambos modelos alcanzan las mismas conclusiones (por ejemplo, pi(200) = 46).
- Generacion de codigo: el autor informa de 21 tok/s con MTP k=3 en dominios de codigo y menciona respuestas correctas con funcion de merge y tests.
- Capacidades multilingues: no disponible (sin lista de idiomas publicada).

## Casos de uso

- Despliegue multimodal en un unico equipo Blackwell: con 22,0 GiB de pesos y vision intacta, el modelo cabe en una DGX Spark (GB10) y permite servir peticiones de imagen + texto sin repartir el modelo entre varias GPU.
- Asistente conversacional de contexto largo: el ejemplo de servicio admite 131.072 tokens de contexto y la cache KV medida alcanza 206k tokens con `--gpu-memory-utilization 0.35`, lo que habilita conversaciones multi-turno sobre documentos o historiales extensos.
- Agente con tool calling en produccion: al usar el parser `qwen3_xml` y `--enable-auto-tool-choice`, puede integrarse en orquestadores de agentes que invoquen APIs o funciones externas, ajustando `reasoning_effort` a `low` o `medium` para reducir latencia.
- Generacion de codigo asistida en local: con 21 tok/s en modo MTP k=3 sobre codigo y una ventana amplia, es viable como autocompletado o generacion de funciones dentro de un IDE o de un pipeline de CI/CD, siempre que se validen las salidas con tests.
- Analisis de documentos con imagenes: al mantener la torre de vision en BF16 y el pipeline image-text-to-text, sirve para extraer y resumir informacion de capturas, diagramas o formularios junto con texto.
- Razonamiento matematico con verificacion: el modelo resuelve tareas de conteo y calculo (por ejemplo, pi(200) = 46) y puede usarse como motor de razonamiento en tareas de comprobacion, con el modo `xhigh` activado.
- Evaluacion y "benchmarking" de cuantizaciones: el repositorio incluye los scripts de plegado, cuantizacion y verificacion, por lo que es util como caso de referencia reproducible para medir el impacto de NVFP4 sobre un modelo multimodal.
- Inferencia de bajo consumo en hardware unico: al liberar el resto de los 128 GB de memoria unificada de la DGX Spark (la cache KV a 0.35 de utilizacion ocupa 206k tokens), permite co-alojar otros servicios en la misma maquina.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). La unica evaluacion disponible es de perplejidad forzada por profesor sobre texto, comparando el modelo plegado en BF16 con esta compilacion NVFP4:

| Texto evaluado | BF16 (plegado, vLLM) | NVFP4 (esta compilacion) |
|---|---|---|
| Tokens de asistente (respuestas greedy del BF16, 2.001 tokens) | 1,131 | 1,259 |
| Prosa sin formato (hechos, 58 tokens) | 2,836 | 2,984 |
| Parrafo de licencia Apache (87 tokens) | 1,099 | 1,149 |
| Conteo de 1 a 30 (108 tokens) | 1,108 | 1,131 |

El propio autor advierte de que no deben puntuarse los tokens de sistema o usuario: el modelo es un checkpoint SFT que nunca se entrena sobre esas posiciones, y las cifras no son comparables (el BF16 lee 160 de perplejidad sobre un prompt de usuario y el NVFP4 68). Verificacion del plegado: KL media 5,0e-3, coincidencia de argmax 99,2 %, perplejidad 164,3 (original) frente a 163,0 (plegado). Rendimiento medido en una DGX Spark (GB10, sm_121a), un solo flujo y pensamiento desactivado:

| Escenario | Rendimiento |
|---|---|
| Decodificacion sin especulacion | 10,6 tok/s (limite de ancho de banda de memoria para ~20 GB de pesos) |
| Decodificacion con MTP k=3, prosa | 15 tok/s (longitud de aceptacion ~3,4) |
| Decodificacion con MTP k=3, codigo | 21 tok/s |
| Decodificacion con MTP k=3, texto muy predecible | 26 tok/s (aceptacion ~4,0) |
| Prefill en frio, prompt de 31k tokens | 1.650 tok/s |
| Cache KV con `--gpu-memory-utilization 0.35` | 206k tokens con KV en bf16 |

## Requisitos de hardware

- Pesos: 22,0 GiB tras la cuantizacion (frente a 61,6 GiB en BF16). El repositorio ocupa 23,6 GB.
- VRAM estimada: no publicada de forma explicita; por el tamano de los pesos, se necesita espacio para ~22 GiB de pesos mas la cache KV en bf16, que a 0.35 de utilizacion de los 128 GB de la DGX Spark da 206k tokens. En una GPU discreta, hay que reservar ademas memoria para activaciones y buffers de vision.
- GPU verificada: NVIDIA DGX Spark (GB10, sm_121a), con 128 GB de memoria unificada.
- Compatibilidad de arquitectura: la compilacion requiere kernels NVFP4 para Blackwell (etiquetas `nvfp4`, `blackwell`); el autor la ejecuta con `FlashInferCutlassNvFp4LinearKernel` y kernels Triton/FLA GDN. No se documenta compatibilidad con GPUs anteriores a Blackwell (Ada, Ampere).
- Cabe en GPU de consumo: no confirmado. La variante NVFP4 esta pensada para Blackwell; cualquier GPU Blackwell con al menos ~24 GB de memoria seria el minimo teorico para los pesos, pero no hay mediciones publicadas en ese hardware.
- Opciones de despliegue: vLLM (unica ruta verificada), con `--enable-auto-tool-choice --tool-call-parser qwen3_xml --reasoning-parser deepseek_r1`, `--kv-cache-dtype bfloat16` y decodificacion especulativa MTP. El autor uso vLLM 0.20.2-dev compilado para sm_121a. No se mencionan llama.cpp, Ollama ni TGI para este build.
- Latencia y throughput: decodificacion de 10,6 a 26 tok/s segun especulacion y tipo de texto; prefill de 1.650 tok/s en un prompt de 31k tokens. Todo medido en una DGX Spark con un solo flujo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Flash-Preview-NVFP4 (esta ficha) | 32,67 B | Ejemplo de servicio a 131.072 tokens; cache KV medida de 206k tokens | NVFP4 W4A4 grupo 16 | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Agnes-AI/Agnes-3.0-Flash (modelo base, BF16) | 32,67 B (mismo plegado) | No disponible | BF16, 61,6 GiB | Apache 2.0 | HuggingFace |
| Receta de referencia NVFP4 de NVIDIA para Qwen3.8-27B | No disponible | No disponible | NVFP4 con la misma receta (proyecciones del delta rule cuantizadas, `conv1d` en bf16) | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos con otras alternativas de la misma categoria (modelos multimodales de ~30 B con razonamiento) en la informacion proporcionada. La unica comparacion cuantitativa publicada es la perplejidad frente al propio modelo base en BF16, incluida en la seccion de benchmarks.

## Limitaciones y advertencias

- Es el checkpoint abierto Preview, no la version produccion/API Agnes 3.0 Flash que aparece listada en Artificial Analysis; el comportamiento y la calidad pueden diferir de la version servida.
- Se trata de una cuantizacion de terceros (CocaKova), no del autor original del modelo; conviene validar la calidad en el dominio propio antes de usarla en produccion.
- La divergencia respecto al BF16 es temprana: el autor indica que las respuestas greedy de ambos modelos se separan pronto, aunque llegan a las mismas conclusiones. La perplejidad sobre tokens de asistente sube de 1,131 a 1,259.
- No deben evaluarse tokens de sistema o usuario para juzgar la calidad: al ser un modelo SFT, esas posiciones no se entrenan y las cifras de perplejidad no son significativas.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad ni de tasa de alucinacion en la informacion disponible.
- Idiomas soportados: no se publica lista de idiomas, por lo que el soporte multilingue no puede garantizarse sin pruebas propias.
- Dependencia de hardware muy reciente: el build requiere kernels NVFP4 para Blackwell (verificado en sm_121a) y la version de vLLM usada por el autor (0.20.2-dev compilada a medida); no se documenta funcionamiento en GPUs anteriores ni en otros motores de inferencia.
- Limitacion de contexto: la model card no declara la longitud de contexto oficial; el valor de 131.072 tokens proviene del ejemplo de servicio y la cifra de 206k tokens corresponde a la cache KV configurada, no a una ventana de contexto validada.
- La cabeza MTP se relleno con ceros de 17408 a 19456 para igualar la anchura plegada, un ajuste estructural que conviene tener en cuenta al reproducir el proceso.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar avisos de licencia y atribucion; el modelo base tambien se distribuye bajo Apache 2.0.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CocaKova/Agnes-3.0-Flash-Preview-NVFP4
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Scripts de plegado, cuantizacion y verificacion: https://github.com/CocaKova/agnes-nvfp4
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre el modelo, su autor o su proceso de cuantizacion; los enlaces obtenidos no guardan relacion con el tema.
