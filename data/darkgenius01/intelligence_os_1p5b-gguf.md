# DarkGenius01/Intelligence_OS_1p5B-GGUF

## Resumen

Intelligence_OS_1p5B-GGUF es una conversion al formato GGUF del modelo `shreyansh-programmer/Intelligence_OS_1p5B`, un transformer decoder-only con mezcla de expertos (MoE) dispersa entrenado desde cero. El repositorio lo publica DarkGenius01 y su principal aportacion es hacer utilizable un checkpoint que en su origen solo se distribuia como pesos PyTorch crudos (`intelligence_os_1p5b_latest.pt`) con un `model.py` personalizado, sin modelo compatible con `transformers` ni tokenizer funcional.

A pesar del nombre, el modelo real tiene 718.505.984 parametros (unos 0,72 B) en fp16, no 1,5 B: la etiqueta "1p5B" corresponde a una configuracion teorica del `config.json` original (26 capas, hidden 2048, vocab 49152) que nunca coincidio con los pesos publicados. La arquitectura es estructuralmente Mixtral (GQA, RoPE, RMSNorm pre-norm, MoE SwiGLU top-2) y fue entrenada durante 40.009 pasos con 163.876.864 tokens, unas 60 horas.

Es relevante ahora porque demuestra un flujo de conversion y cuantizacion reproducible para checkpoints no estandar, con verificacion token a token frente a la referencia PyTorch y una perplexity de 134,8 en f16 y 134,1 en Q4_K_M. No obstante, es un prototipo de investigacion sin ajuste por instrucciones, con un tokenizer inferido y un comportamiento de continuacion de texto muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa (estructura tipo Mixtral) |
| Parametros totales | 718.505.984 (~0,72 B) en fp16 |
| Parametros activos | 4 expertos SwiGLU, top-2 (hidden de experto 2048) |
| Longitud de contexto | 4096 tokens (RoPE, theta 10000) |
| Tipos de cuantizacion | Q4_K_M (424 MiB) y f16 (1.371 MiB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); origen PyTorch `.pt` |
| Capas | 24 |
| Hidden size | 1024 |
| Atencion | GQA, 16 cabezas de query / 4 de KV, `head_dim` 64 |
| Normalizacion | RMSNorm pre-norm, eps 1e-5 |
| Vocabulario | 50.257 (GPT-2 BPE, embeddings atados) |
| Entrenamiento | 40.009 pasos, 163.876.864 tokens, ~60 h |

## Arquitectura y entrenamiento

El modelo sigue un esquema transformer decoder-only con pre-norm RMSNorm y atencion con GQA (16 cabezas de query y 4 de KV, con `head_dim` de 64), codificacion posicional RoPE con theta 10000 y una FFN de mezcla de expertos con 4 expertos SwiGLU y enrutamiento top-2 con hidden de experto 2048. Los embeddings estan atados y el vocabulario es de 50.257 entradas. La conversion renombro los tensores al layout de `MixtralForCausalLM`, que `llama.cpp` mapea a su arquitectura `llama` con soporte MoE, y se realizo con el `convert_hf_to_gguf.py` estandar.

El entrenamiento se limito a 163.876.864 tokens, aproximadamente 85 veces menos de lo que seria optimo segun Chinchilla para este tamano, lo que explica en gran medida su distribucion de siguiente token muy puntiaguda y su tendencia a la repeticion. No hay informacion sobre la composicion del dataset ni sobre fases de RLHF o DPO. Dos detalles tecnicos destacables del proceso de conversion son la correccion de la convencion RoPE (el modelo rota pares de valores contiguos, mientras que el script asume el layout `rotate_half` de HF-Llama, por lo que se aplica la permutacion inversa sobre `q_proj` y `k_proj`, usando `n_kv_heads` = 4 para `k_proj` y no `n_heads` = 16) y la reconstruccion del tokenizer, ya que el repositorio original solo incluia un stub de 512 tokens y se opto por GPT-2 BPE al tener el embedding 50.257 filas. La verificacion confirma que la decodificacion greedy del build f16 reproduce la referencia PyTorch token a token con `temperature = 0`, y que la perplexity baja de 3739 (build con el bug de `k_proj`) a 134,8 en f16 y 134,1 en Q4_K_M.

## Capacidades

- Generacion de texto en ingles mediante continuacion de secuencias, con especial tendencia a reproducir patrones de "libro de texto": problemas de matematicas con pasos `Step 1: ...`, derivadas, fracciones y formulas.
- Razonamiento aritmetico basico encadenado en formato de pasos, siempre que se le proporcione un prefijo adecuado.
- No soporta tool calling ni function calling: no hay formato de instrucciones ni plantilla de chat embebida.
- No soporta agentes ni razonamiento multi-paso dirigido; es un modelo base sin ajuste instructivo.
- Capacidades multilingues practicamente nulas: solo se declara ingles y el tokenizer es GPT-2 BPE.
- No dispone de modo thinking, vision ni audio.
- Contexto de 4096 tokens, suficiente para continuaciones cortas pero no para documentos largos.

## Casos de uso

- Investigacion de arquitecturas MoE de bajo coste: sirve como banco de pruebas para estudiar enrutamiento top-2 con 4 expertos en un modelo de 0,72 B que cabe en un portatil, comparando el comportamiento de los expertos y la perplexity entre cuantizaciones.
- Validacion de pipelines de conversion de checkpoints no estandar: los scripts `ios2hf.py`, `inspect_ckpt.py` y `check_gguf.py` documentan un flujo completo de repack PyTorch a HF a GGUF, util como referencia para otros modelos con `model.py` personalizado.
- Pruebas de cuantizacion y evaluacion de degradacion: la diferencia de perplexity entre f16 (134,8) y Q4_K_M (134,1) permite estudiar el impacto de la cuantizacion de 4 bits en un MoE pequeno con un caso reproducible.
- Generacion de texto sintetico de estilo academico o de libro de matematicas: con temperatura 0,1-0,3, top_k 20-40, top_p 0,9 y repeat_penalty 1,2-1,3 se obtienen continuaciones coherentes de problemas y derivaciones, utiles para aumentar datos de entrenamiento de dominios muy acotados.
- Docencia y demostraciones de LLM en local: al ocupar 424 MiB en Q4_K_M, se puede ejecutar en LM Studio, `llama.cpp` u `ollama` en hardware modesto para explicar el funcionamiento de un MoE y de la decodificacion con muestreo.
- Test de robustez frente a bucles degenerativos: su distribucion puntiaguda lo convierte en un caso de estudio para tecnicas de penalizacion por repeticion y DRY (0,8 / 1,75 / 2 / 512), midiendo como cambia la salida con cada configuracion de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos publicados son de verificacion interna:

| Metrica | f16 | Q4_K_M | Build con bug de `k_proj` |
|---|---|---|---|
| Perplexity (texto de prueba) | 134,8 | 134,1 | 3739 |
| Reproduccion greedy frente a PyTorch | token a token | no disponible | no disponible |
| Tamano del fichero | 1.371 MiB | 424 MiB | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M y 1,5 GB con f16, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en RTX 3050, RTX 4060, GTX 1660 y superiores; tambien en Apple Silicon (el autor convirtio y cuantizo en Apple Silicon).
- Opciones de despliegue: `llama.cpp` (`llama-cli`), LM Studio (runtime llama.cpp 2.70.0), `ollama` mediante importacion con Modelfile, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intelligence_OS_1p5B-GGUF | 0,72 B (MoE top-2) | 4096 | MoE tipo Mixtral | Apache-2.0 | GGUF en HF |
| Qwen2.5-0.5B | 0,49 B | 32.768 | Transformer denso | Apache-2.0 | HF, GGUF, amplio ecosistema |
| SmolLM2-360M | 0,36 B | 8192 | Transformer denso | Apache-2.0 | HF, GGUF |
| TinyLlama-1.1B | 1,1 B | 2048 | Transformer denso | Apache-2.0 | HF, GGUF |

Los modelos comparables son densos y estan ajustados por instrucciones, mientras que Intelligence_OS_1p5B es un modelo base sin ajuste y con un tokenizer inferido; la comparacion de rendimiento no es posible porque no hay benchmarks publicados de este ultimo.

## Limitaciones y advertencias

- No es un asistente: fue entrenado con solo 164 M tokens (unas 85 veces menos de lo optimo segun Chinchilla) y tiende a continuar patrones de libro de texto; ante una pregunta suele devolver "sopa matematica" en lugar de una respuesta.
- No incluye plantilla de chat (`tokenizer.chat_template` ausente de forma intencionada) porque no tiene formato de instrucciones; usar cualquier scaffolding de chat empeora la salida.
- El tokenizer es una inferencia (GPT-2 BPE): si el entrenamiento original uso un vocabulario GPT-2 extendido, algunos prompts se tokenizaran de forma distinta.
- Distribucion de siguiente token extremadamente puntiaguda: con los valores por defecto de LM Studio (temp 0,8, top_k 40, top_p 0,95, repeat_penalty 1,1) colapsa en bucles del tipo `$16 * $16 * $16 ...` o `second second second`.
- El `config.json` original no coincide con los pesos: el modelo real es de 0,72 B, no de 1,5 B, lo que afecta a cualquier estimacion de recursos basada en el nombre.
- El autor original lo describe como prototipo de investigacion (`"status": "architecture scaffold"`); este repositorio es una conversion fiel de ese estado.
- Riesgo alto de alucinacion y de respuestas sin sentido fuera del dominio de continuacion de texto tecnico.
- Licencia Apache-2.0 heredada del modelo original: permite uso comercial, pero sin garantias de calidad ni de idoneidad para produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DarkGenius01/Intelligence_OS_1p5B-GGUF
- Modelo base: https://huggingface.co/shreyansh-programmer/Intelligence_OS_1p5B
- Scripts de conversion: https://huggingface.co/DarkGenius01/Intelligence_OS_1p5B-GGUF/tree/main/scripts
- `convert_hf_to_gguf.py` de llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/convert_hf_to_gguf.py
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
