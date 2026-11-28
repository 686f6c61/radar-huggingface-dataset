# reaperdoesntknow/SAGI

## Resumen

SAGI (Swarm AGI Language Model) es un modelo de lenguaje causal de tipo decoder-only desarrollado por el usuario reaperdoesntknow, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo experimental de pequeno tamano (52,7 millones de parametros) que combina una arquitectura transformer convencional con un modulo de dinamicas de inteligencia de enjambre (swarm intelligence) que actua como estado cognitivo interno condicionante de la atencion y las capas feed-forward.

El modelo propone un enfoque poco habitual: en lugar de un transformer puro, incorpora un subsistema llamado Swarm-7 V2.2 que procesa observaciones derivadas de los embeddings de tokens y mantiene un estado interno que modula el comportamiento del decoder. Este estado incluye mecanismos de enrutamiento diferenciable, confianza adaptativa, memoria episodica y semantica, un motor de curiosidad y monitorizacion de valores. La idea central es tratar la cognicion como un sistema dinamico multiagente interno, con hasta 20 agentes cognitivos y hasta 5 iteraciones de "pensamiento" por paso.

Es relevante ahora unicamente como objeto de investigacion sobre arquitecturas cognitivas hibridas, no como modelo de produccion. El propio autor lo describe como un modelo temprano de investigacion, entrenado sobre un subconjunto de TinyStories, con calidad de generacion limitada y no apto para aplicaciones reales. Su contexto es de 2048 tokens y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder + dinamicas de enjambre (Swarm-7 V2.2) |
| Parametros totales | 52.729.731 |
| Parametros activos | no disponible (no es MoE clasico; usa enrutamiento diferenciable top-5 sobre 20 agentes) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenado en FP32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer decoder convencional con embeddings RoPE, 6 capas, tamano oculto 512 y 8 cabezas de atencion, con un modulo de dinamicas de enjambre que mantiene un estado interno S y un estado de tarea T. El modulo de enjambre procesa observaciones (dimension 48) derivadas de los embeddings de tokens, actualiza su estado (dimension 64) y condiciona mediante proyecciones aprendidas los patrones de atencion y las activaciones feed-forward del decoder, creando un flujo bidireccional entre procesamiento simbolico (tokens) y subsimbolico (dinamicas de enjambre). Incluye enrutamiento diferenciable tipo mixture-of-experts con top-5 sobre 20 agentes, gating adaptativo con presupuestos de recursos (computo 60, memoria 20, energia 25), memoria dual episodica y semantica, un motor de curiosidad y un mecanismo de auto-modelo con rollback para autocorreccion.

El entrenamiento se realizo sobre un subconjunto de TinyStories, con optimizador AdamW (lr=3e-4, betas 0.9/0.999, weight decay 0.01), scheduler de cosine annealing, precision FP32 y hardware CPU (compatible con CUDA). No se especifica el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO. El vocabulario es el tokenizador de GPT-2 (50.257 tokens). El autor reconoce que el modelo esta infraentrenado.

## Capacidades

- Generacion de texto causal autoregresiva basica, orientada a historias simples por el corpus de entrenamiento (TinyStories).
- Razonamiento interno multi-paso mediante hasta 5 iteraciones de "pensamiento" por paso (K_thought_max = 5).
- Enrutamiento interno entre hasta 20 agentes cognitivos con seleccion top-5.
- Mecanismos de memoria episodica y semantica con recuperacion entrenable.
- Motor de curiosidad que inyecta objetivos novedosos cuando la sorpresa es baja.
- Auto-modelo y rollback para deteccion de anomalias y autocorreccion.
- Monitorizacion de valores (truth, safety, efficiency) con congelacion de plasticidad ante deriva.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes externos y multi-step reasoning externo: no disponible.
- Capacidades multilingues: solo ingles.
- Vision, audio o thinking mode explicito: no disponible.

## Casos de uso

- Investigacion en arquitecturas cognitivas multiagente: el modelo sirve como banco de pruebas para estudiar como un estado de enjambre condiciona la atencion de un transformer, con parametros configurables (max_agents, topk_route, K_thought_max) que permiten experimentar con distintas dinamicas.
- Educacion sobre inteligencia de enjambre aplicada a LLM: por su tamano reducido (52,7M parametros) y su codigo accesible via transformers, es adecuado para demostraciones en aula o talleres sobre integracion de mecanismos subsimbolicos en transformers.
- Experimentacion con memoria dual: permite investigar como un sistema de memoria episodica y semantica con recuperacion entrenable afecta la generacion en contextos de 2048 tokens.
- Estudio de mecanismos de curiosidad y exploracion: util para analizar como la inyeccion de objetivos novedosos ante baja sorpresa altera el comportamiento generativo en tareas de historia corta.
- Analisis de monitorizacion de valores y plasticidad: sirve para estudiar tecnicas de congelacion de plasticidad ante deriva de valores en modelos pequenos.
- Prototipado de dinamicas de recursos en inferencia: el modelo incorpora presupuestos de computo, memoria y energia, lo que permite experimentar con conservacion de recursos aprendida en un entorno controlado y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada para SAGI con la lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (52,7M parametros, aproximadamente 211 MB de pesos) y menos de 150 MB en FP16/BF16. El estado de enjambre anade overhead moderado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM, y en CPU sin problema.
- Opciones de despliegue: transformers (via AutoModelForCausalLM), integracion con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. El autor advierte que las dinamicas de enjambre anaden overhead frente a un transformer estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAGI | 52,7M | 2048 | Transformer + swarm dynamics | Apache 2.0 | Hugging Face |
| GPT-2 small | 124M | 1024 | Transformer decoder | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | Transformer decoder (Llama) | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135M | 2048 | Transformer decoder | Apache 2.0 | Hugging Face |

La comparativa es orientativa por tamano y categoria (modelos pequenos de generacion de texto). SAGI se distingue por su arquitectura hibrida con dinamicas de enjambre, pero su calidad de generacion es inferior por estar infraentrenado sobre TinyStories. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo experimental de investigacion temprana; el autor lo declara no apto para produccion ni para sistemas criticos de seguridad.
- Entrenado sobre un subconjunto de TinyStories: las salidas tienden a ser simples, tipo historia, y pueden resultar repetitivas o incoherentes.
- Modelo infraentrenado segun el propio autor; calidad de generacion limitada.
- No debe usarse para generar contenido factual; riesgo elevado de alucinacion.
- Solo soporta ingles; no hay capacidades multilingues.
- Contexto limitado a 2048 tokens.
- Las dinamicas de enjambre anaden overhead computacional frente a un transformer estandar del mismo tamano.
- No se documentan sesgos especificos, pero al entrenarse sobre TinyStories puede heredar sesgos y simplificaciones del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y la naturaleza experimental del modelo desaconsejan cualquier despliegue productivo.
- No se documenta soporte de tool calling, function calling ni integracion con frameworks de agentes externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SAGI
- TinyStories (dataset de entrenamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- Tokenizador GPT-2: https://huggingface.co/gpt2
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Paper de referencia sobre inteligencia de enjambre: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
