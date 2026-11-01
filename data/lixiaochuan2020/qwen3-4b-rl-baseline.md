# lixiaochuan2020/qwen3-4b-rl-baseline

## Resumen

`qwen3-4b-rl-baseline` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo `lixiaochuan2020/qwen3-4b-midtrain-baseline`, que a su vez deriva de `Qwen/Qwen3-4B` tras un entrenamiento intermedio sobre trayectorias de agente de búsqueda generadas por `Qwen/Qwen3-32B`. Lo desarrolla el usuario de HuggingFace `lixiaochuan2020` y su proposito es servir como linea base (baseline) de un experimento de investigacion sobre atencion local por documento en agentes de busqueda.

El modelo se entrena con GRPO (Group Relative Policy Optimization) durante 300 pasos de rollout para resolver tareas de busqueda multi-salto: el modelo debe formular llamadas a una herramienta `wiki_search`, leer los pasajes recuperados y emitir una respuesta final verificable. El reward es binario y lo otorga un juez externo (`Qwen/Qwen3.5-9B`) que compara la respuesta final con las respuestas doradas.

Su relevancia es acotada y de caracter experimental: no es un modelo de proposito general ni un lanzamiento de producto, sino un artefacto reproducible de investigacion (pesos en float32, 4.022.468.096 parametros, contexto de 16.384 tokens durante el RL) que documenta con detalle la configuracion de entrenamiento y la metodologia de evaluacion. La licencia Apache 2.0 permite reutilizarlo, pero su utilidad practica esta ligada al dominio de busqueda sobre wiki-18.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con atencion causal completa |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (maximo usado durante el RL) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el autor sugiere castear a bfloat16 para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B sin modificaciones estructurales: un transformer decoder-only con atencion causal completa (full attention), tanto en los rollouts (SGLang con backend `fa3`) como en el entrenamiento (FlashAttention 3). El modelo parte de `qwen3-4b-midtrain-baseline`, que fue entrenado durante 1 epoca (4.763 pasos, 8 filas empaquetadas de 18.432 tokens por paso, trayectorias de hasta 16.384 tokens) sobre 297.720 trayectorias de agente de busqueda juzgadas como correctas, escritas por un profesor `Qwen/Qwen3-32B` con busqueda sobre wiki-18. En ese mid-training se uso Muon para las matrices de las capas del decoder y AdamW para el resto, learning rate 2e-5 con schedule coseno y warmup 0.03, pesos en float32 con computo en bf16.

El RL se ejecuta con el framework `miles` (entrenamiento FSDP, rollouts con SGLang) y el algoritmo GRPO. Se realizan 300 pasos de rollout, con 56 prompts por paso, 16 muestras por prompt y 4 pasos de optimizador por paso de RL. La temperatura de rollout es 1.0, se generan 4.096 tokens nuevos por turno, el contexto maximo es de 16.384 tokens y se permiten hasta 10 busquedas por rollout. La busqueda es `wiki_search` sobre wiki-18 con e5-base-v2 y top-5 pasajes. El coeficiente de KL es 0.001 con estimador `low_var_kl`, clip epsilon 0.2, coeficiente de entropia 0, optimizador Adam (beta1 0.9, beta2 0.999), learning rate 1e-6, warmup de 40 pasos de optimizador, schedule constante, weight decay 0 y norma maxima de gradiente 1.0. El entrenamiento y los rollouts se colocaron en 7 GPUs, con 1 GPU adicional para la busqueda y el juez del reward.

Los datos de RL son una muestra aleatoria (semilla 0) del pool `nq_hotpotqa_train` de Search-R1 tras eliminar preguntas presentes en los datos SFT de AFM y preguntas repetidas: 32.000 preguntas de entrenamiento, de las cuales 16.524 son de HotpotQA y 15.476 de NQ. Las respuestas doradas solo se usan en el calculo del reward. El reward vale 1 cuando `Qwen/Qwen3.5-9B` (sin thinking, temperatura 0) juzga correcta la respuesta final contra las respuestas doradas, y 0 en caso contrario; se considera que no hay respuesta si el razonamiento no se cierra, si el ultimo turno sigue llamando a una herramienta o si la respuesta esta vacia o supera las 50 palabras. La conversion del checkpoint FSDP de miles a formato HuggingFace se valido contra el modelo de partida: mismos 4.022.468.096 parametros, todos finitos y cambio relativo L2 de los pesos de 0.0214.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen3.
- Razonamiento multi-turno orientado a agentes de busqueda: planificacion de consultas, lectura de pasajes y sintesis de una respuesta final.
- Tool calling en el formato `<tool_call>` de Qwen3, con una unica herramienta entrenada: `wiki_search`.
- Razonamiento multi-paso con hasta 10 busquedas por rollout y 4.096 tokens nuevos por turno.
- Emision de respuestas finales delimitadas por las etiquetas `<answer>` o `<final_answer>`, con la restriccion de no superar las 50 palabras para recibir reward.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponibles; el juez del reward usa `Qwen/Qwen3.5-9B` sin thinking, pero no se documenta un modo thinking para este modelo.

## Casos de uso

- Investigacion en RL para agentes de busqueda: sirve como linea base reproducible frente a `qwen3-4b-rl-local-kv-per-document`, que aplica el mismo RL con atencion local-KV por documento, permitiendo aislar el efecto de la atencion sobre el rendimiento.
- Experimentos de ablacion sobre GRPO: la configuracion completa (56 prompts por paso, 16 muestras, KL 0.001, clip 0.2, learning rate 1e-6) esta documentada y permite replicar o variar hiperparametros con una referencia clara.
- Respuesta a preguntas multi-salto sobre Wikipedia: el modelo esta entrenado para consultar wiki-18 con `wiki_search` y responder preguntas de HotpotQA, NQ, 2WikiMultihopQA, Bamboogle, FEVER, MuSiQue y PopQA, por lo que es adecuado para evaluar pipelines de RAG con recuperacion iterativa.
- Evaluacion de jueces automaticos como reward: el uso de `Qwen/Qwen3.5-9B` como juez binario con criterios explicitos (misma entidad, fecha o numero; listas de candidatos incorrectas) es un caso practico de diseno de funciones de recompensa verificables.
- Prototipado de pipelines de busqueda con vLLM o SGLang: el modelo se ejecuta sin parches en vLLM y SGLang estandar, lo que facilita integrarlo en un banco de pruebas de agentes con llamadas a herramientas.
- Analisis de robustez fuera de dominio: el conjunto OOD (Bamboogle, FEVER, MuSiQue, PopQA) permite medir la degradacion del agente cuando cambia la distribucion de preguntas respecto al entrenamiento.

## Benchmarks y rendimiento

La model card describe la metodologia de evaluacion pero no incluye los valores numericos de los resultados. La evaluacion ID usa 1.200 preguntas retenidas (HotpotQA dev 720, NQ test 240, 2WikiMultihopQA dev 240) con 3 muestras cada una; la evaluacion OOD usa 1.025 preguntas (Bamboogle 125, FEVER 300, MuSiQue 300, PopQA 300) con 1 muestra cada una. Los ajustes de generacion son temperatura 0.7, top-p 0.95, 4.096 tokens nuevos por turno, hasta 10 busquedas en wiki-18 y top-5 pasajes, con vLLM 0.24. El unico dato numerico de validacion publicado es la comprobacion del generador de vLLM frente al bucle de PyTorch sobre el modelo `Qwen3-1.7B` local-KV mid-trained: la precision juzgada difiere en +0.010 (IC −0.005 a +0.026) en modo Full y +0.002 (IC −0.011 a +0.016) en modo Local.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 16,1 GB (tamano del repo); en bfloat16 se reducen a unos 8,0 GB, y una cuantizacion a 8 bits quedaria en torno a 4 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: para float32 se necesita una GPU con al menos 24 GB (RTX 3090, RTX 4090, A10G, L4 de 24 GB); para bfloat16 bastan 12-16 GB (RTX 4080, RTX 4070 Ti Super, A4000). Para servir en produccion con contexto completo de 16.384 tokens conviene una A100 40 GB o H100.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en float32 o bfloat16, y en GPUs de 16 GB si se castea a bfloat16 con margen para el KV cache.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained` con `dtype=torch.float32`), vLLM 0.24 (usado en la evaluacion), SGLang con backend `fa3`, y text-generation-inference segun los tags del repositorio. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lixiaochuan2020/qwen3-4b-rl-baseline` | 4.022.468.096 | 16.384 tokens | GRPO, 300 pasos, atencion completa | Apache 2.0 | Publico en HuggingFace |
| `lixiaochuan2020/qwen3-4b-rl-local-kv-per-document` | no disponible (deriva del mismo mid-trained) | 16.384 tokens | GRPO, mismo RL con atencion local-KV por documento | no disponible | Publico en HuggingFace |
| `lixiaochuan2020/qwen3-4b-midtrain-baseline` | 4.022.468.096 | 16.384 tokens | Mid-training supervisado sobre trayectorias de `Qwen3-32B` | no disponible | Publico en HuggingFace |
| `Qwen/Qwen3-4B` | no disponible en la informacion | no disponible en la informacion | Preentrenamiento y post-entrenamiento de Qwen | no disponible en la informacion | Publico en HuggingFace |

La comparacion relevante es interna al linaje: el baseline RL frente a la variante local-KV y frente al modelo de mid-training sin RL. No se dispone de datos de rendimiento comparativos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no es un asistente de proposito general; esta especializado en busqueda multi-salto sobre wiki-18 y su rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: el reward solo penaliza respuestas incorrectas segun el juez, no la fabricacion de contenido en los pasajes leidos; el modelo puede producir respuestas plausibles no respaldadas por las fuentes recuperadas.
- Dependencia del juez: el reward se define con `Qwen/Qwen3.5-9B`, por lo que los sesgos y errores de ese juez se incorporan al comportamiento aprendido.
- Restriccion de formato: las respuestas de mas de 50 palabras o sin etiqueta de respuesta se consideran incorrectas durante el entrenamiento, lo que puede sesgar la longitud y el estilo de las respuestas.
- Herramienta unica: solo se entrena `wiki_search` sobre wiki-18 con top-5 pasajes; no hay garantia de generalizacion a otras herramientas o indices.
- Idiomas: no se documenta que idiomas soporta; el entrenamiento usa preguntas en ingles de HotpotQA y NQ.
- Pesos en float32: el repositorio ocupa 16,1 GB, lo que encarece el almacenamiento y la carga; es necesario castear a bfloat16 para un uso eficiente.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3-4B y conviene verificar las condiciones de la licencia original de Qwen.
- Reproducibilidad parcial: el codigo del pipeline (`ashmitkx/kv-midtrain`) se describe como repositorio privado, lo que limita la replicacion completa del entrenamiento y del reward.
- Sin datos de benchmarks publicados: no es posible comparar su rendimiento con alternativas sin ejecutar la evaluacion descrita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lixiaochuan2020/qwen3-4b-rl-baseline
- Modelo de mid-training: https://huggingface.co/lixiaochuan2020/qwen3-4b-midtrain-baseline
- Variante con atencion local-KV por documento: https://huggingface.co/lixiaochuan2020/qwen3-4b-rl-local-kv-per-document
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del pipeline (privado segun la model card): https://github.com/ashmitkx/kv-midtrain
- Rama del RL con GRPO: https://github.com/ashmitkx/kv-midtrain/tree/claude/rl-grpo
