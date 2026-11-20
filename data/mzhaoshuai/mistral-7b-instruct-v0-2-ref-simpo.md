# mzhaoshuai/Mistral-7B-Instruct-v0.2-ref-simpo

## Resumen

Mistral-7B-Instruct-v0.2-ref-simpo es un ajuste fino del modelo mistralai/Mistral-7B-Instruct-v0.2 desarrollado por el usuario mzhaoshuai como artefacto de investigacion del marco RL2R (anteriormente RefAlign), presentado en el paper "Reinforcement Learning with Reference-Based Rewards for Language Model Reasoning and Alignment" (arXiv:2504.09895). El modelo aplica una alineacion SimPO en linea sobre el modelo base, empleando BERTScore como funcion de recompensa basada en referencias en lugar de un reward model entrenado con pares de preferencia binarios.

La propuesta tecnica del trabajo es sustituir las recompensas binarias de los verificadores de reglas y los costosos reward models por una medida de similitud semantica (BERTScore, usando bart-large-mnli como encoder) entre la generacion muestreada y una respuesta de referencia. Esta senal preserva informacion ordinal de calidad que la retroalimentacion binaria descarta, y permite cubrir tanto tareas de razonamiento como de alineacion con un unico mecanismo de recompensa de bajo coste.

El modelo conserva la arquitectura y el tamano del Mistral-7B-Instruct-v0.2 original (7.241.732.096 parametros, pesos en safetensors, licencia Apache 2.0), por lo que hereda sus caracteristicas de contexto y tokenizador. Es un artefacto de investigacion con muy baja traccion en el Hub (7 descargas, 0 likes en el momento de la consulta) y sin model card propia mas alla de la descripcion del metodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.2) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se publican en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de mistralai/Mistral-7B-Instruct-v0.2, un transformer decoder-only denso de 7.241.732.096 parametros. Sobre esa base se aplica un proceso de alineacion SimPO en linea descrito en el paper RL2R: se muestrean K=3 generaciones por prompt, se calcula BERTScore (modelo bart-large-mnli) contra una respuesta de referencia y se usa esa similitud como recompensa para optimizar la politica. Los hiperparametros declarados en la model card son LR 3e-7, batch size 120, 1 epoch, longitud de prompt 512, longitud de generacion 1024, beta de SimPO 2.5 y beta/gamma 0.3.

El entrenamiento se realiza sobre el dataset mzhaoshuai/Llama-3.3-70B-Inst-awq_ultrafeedback_1in3, una variante de UltraFeedback generada con Llama-3.3-70B-Instruct en cuantizacion AWQ. La innovacion principal del trabajo no esta en la arquitectura del modelo, que es la del Mistral-7B original, sino en el diseno de la recompensa: la similitud semantica con una referencia preserva senales ordinales de calidad y permite dar credito a derivaciones correctas aunque la respuesta final sea erronea, algo que la verificacion binaria de reglas no captura. El metodo se presenta como una alternativa sin critico (REINFORCE-style) a los reward models clasicos.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Mistral-7B-Instruct-v0.2.
- Razonamiento y matematicas: el paper evalua el marco en tareas de razonamiento matematico con verificacion de reglas augmentada con similitud a nivel de respuesta y de paso.
- Alineacion de preferencias: el ajuste SimPO busca mejorar la utilidad, la inocuidad y la honestidad de las respuestas.
- Tareas de seguridad y calibracion de confianza: el paper menciona instanciaciones del metodo para preferencia general, seguridad y confianza.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; el modelo base no lo documenta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en alineacion con recompensas basadas en referencias: el modelo sirve como punto de partida reproducible para experimentar con RL2R/RefAlign y SimPO en linea usando BERTScore como recompensa, comparando frente a metodos con reward model.
- Generacion de respuestas conversacionales en prototipos: al ser un ajuste de Mistral-7B-Instruct-v0.2, puede usarse para construir asistentes de chat en entornos de desarrollo donde se quiera evaluar el efecto del ajuste SimPO frente al modelo base.
- Experimentos de razonamiento matematico con supervision de proceso de bajo coste: util para replicar el resultado del paper de que la similitud a nivel de paso augmenta la verificacion solo-respuesta.
- Evaluacion comparativa de funciones de recompensa: el checkpoint permite medir diferencias de comportamiento frente a variantes alineadas con reward models clasicos sobre el mismo dataset de UltraFeedback.
- Fine-tuning posterior y ablaciones: al publicarse en safetensors con licencia Apache 2.0, se puede usar como inicializacion para estudios de ablacion sobre beta de SimPO, K de muestreo o encoder de BERTScore.
- Despliegue en entornos de investigacion con TGI o transformers: los tags incluyen text-generation-inference y endpoints_compatible, lo que facilita servirlo en infraestructura estandar de Hugging Face para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el metodo y los hiperparametros de entrenamiento, pero no incluye tablas con MMLU, HumanEval, GSM8K ni comparaciones numericas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 16-24 GB.
- Cuantizacion a 8 bits: en torno a 7-8 GB de pesos; cuantizacion a 4 bits: en torno a 4-5 GB de pesos (estimaciones genericas para un modelo denso de 7B, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB o H100 para servir en fp16 con lotes grandes; RTX 4090 (24 GB) para inferencia en fp16 con lotes pequenos; RTX 3090/4080 (16-24 GB) para fp16 o 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en fp16, y en tarjetas de 8-12 GB si se cuantiza a 4-8 bits (siempre que se generen los pesos cuantizados, no incluidos en el repo).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente) y endpoints compatibles de Hugging Face. No se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.2-ref-simpo | 7.241.732.096 | no disponible | Apache 2.0 | Hugging Face (7 descargas) | Ajuste SimPO con recompensa BERTScore (RL2R) |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.241.732.096 | no disponible | Apache 2.0 | Hugging Face (modelo base) | Referencia directa; sin ajuste RL2R |
| Mistral-7B-Instruct-v0.3 | no disponible | no disponible | Apache 2.0 | Hugging Face | Version posterior del mismo linaje; no comparada en la informacion disponible |
| Zephyr-7B-beta | no disponible | no disponible | no disponible | Hugging Face | Alternativa de 7B alineada con DPO; no comparada en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion con muy baja adopcion (7 descargas, 0 likes): no hay evidencia de validacion externa ni de uso en produccion.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto y depende del modelo base.
- Riesgo de alucinacion inherente a un modelo de 7B ajustado sobre UltraFeedback; no se documentan evaluaciones de factualidad.
- La recompensa basada en BERTScore puede favorecer respuestas superficialmente similares a la referencia sin garantizar correccion factual, especialmente si las referencias del dataset contienen errores.
- No se publican resultados de benchmarks ni evaluaciones de seguridad, sesgo o toxicidad en la informacion disponible.
- La model card no documenta el contexto maximo efectivo tras el ajuste; conviene verificar el comportamiento en ventanas largas antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte del autor.
- El repositorio conserva el nombre antiguo (ref-simpo) aunque el metodo se haya renombrado a RL2R; conviene revisar el repositorio GitHub para la version vigente del codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/Mistral-7B-Instruct-v0.2-ref-simpo
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Dataset de entrenamiento: https://huggingface.co/datasets/mzhaoshuai/Llama-3.3-70B-Inst-awq_ultrafeedback_1in3
- Paper (arXiv): https://arxiv.org/abs/2504.09895
- Repositorio GitHub (rama alignment): https://github.com/mzhaoshuai/RL2R/tree/alignment
