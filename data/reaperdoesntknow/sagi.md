# reaperdoesntknow/SAGI

## Resumen

SAGI (Swarm AGI Language Model) es un modelo de lenguaje causal de tipo decoder-only desarrollado por el usuario reaperdoesntknow y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como una exploracion de investigacion que integra dinamicas de inteligencia de enjambre (swarm intelligence) con una arquitectura transformer convencional, tratando la cognicion como un sistema adaptativo en el que multiples "agentes" internos colaboran mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida.

El modelo es deliberadamente pequeno: 52,7 millones de parametros, 512 dimensiones ocultas, 6 capas y 8 cabezas de atencion, con una longitud de contexto de 2048 tokens y tokenizador GPT-2 (50.257 entradas de vocabulario). Su proposito no es competir con modelos de gran escala, sino servir como banco de pruebas para arquitecturas cognitivas multi-agente aplicadas a la generacion de texto.

Es relevante ahora unicamente en el ambito de la investigacion experimental: el propio autor lo describe como un modelo infraentrenado, entrenado sobre un subconjunto de TinyStories, no apto para produccion ni para sistemas criticos. Su valor reside en la propuesta arquitectonica (enrutamiento diferenciable, control meta-cognitivo, memoria episodica y semantica, motor de curiosidad), no en su calidad de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder + dinamicas de enjambre (Swarm-7 V2.2) |
| Parametros totales | 52.729.731 |
| Parametros activos | no aplica (no es MoE clasico; usa enrutamiento diferenciable con top-k=5 sobre 20 agentes internos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer decoder de 6 capas y 512 dimensiones ocultas con un modulo de dinamicas cognitivas denominado Swarm-7 V2.2. Este modulo procesa observaciones derivadas de los embeddings de tokens y actualiza un estado interno S que condiciona, mediante proyecciones aprendidas, los patrones de atencion y las activaciones de las capas feed-forward del transformer, generando un flujo de informacion bidireccional entre el procesamiento simbolico (tokens) y el subsimbolico (dinamicas de enjambre). Emplea embeddings RoPE y un cabezal de lenguaje estandar.

Los componentes destacados incluyen un `DiffRouter` que implementa una mezcla de expertos continua mediante atencion (frente a seleccion dura de modulos), un `MetaController` con gating adaptativo y dinamicas de confianza, un sistema de memoria dual (episodica y semantica) con recuperacion entrenable, un motor de curiosidad que inyecta objetivos novedosos cuando la sorpresa es baja, un automodelo con rollback para detectar anomalias y autocorregirse, y un monitor de valores que congela la plasticidad ante desviaciones. La configuracion del enjambre fija `max_agents`=20, `dim_s`=64, `dim_t`=32, `dim_obs`=48, `topk_route`=5 y `K_thought_max`=5, con presupuestos de recursos de computo 60,0, memoria 20,0 y energia 25,0.

El entrenamiento se realizo sobre un subconjunto de TinyStories, con optimizador AdamW (lr=3e-4, betas=(0,9; 0,999), weight_decay=0,01), scheduler de annealing coseno y precision FP32. El autor indica que el entrenamiento se ejecuto en CPU (compatible con CUDA). No se documenta el numero de tokens vistos, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto causal en ingles con decodificacion por muestreo (temperature, top-k, top-p).
- Razonamiento multi-paso interno mediante iteraciones de pensamiento acotadas (`K_thought_max`=5).
- Enrutamiento diferenciable entre 20 agentes internos con seleccion top-k=5.
- Mecanismos de confianza y gating adaptativo para priorizar componentes fiables.
- Memoria episodica y semantica con recuperacion entrenable.
- Motor de curiosidad para exploracion cuando la sorpresa es baja.
- Automodelo con deteccion de anomalias y rollback para autocorreccion.
- Monitorizacion de valores alineados con "truth", "safety" y "efficiency".
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion en arquitecturas cognitivas multi-agente: el modelo sirve como implementacion de referencia para estudiar enrutamiento diferenciable y dinamicas de confianza en transformers de pequena escala, con un coste computacional minimo.
- Experimentacion educativa sobre inteligencia de enjambre aplicada a LLM: permite reproducir y modificar los componentes (DiffRouter, MetaController, memoria dual) en entornos academicos sin grandes recursos de GPU.
- Pruebas de concepto de memoria episodica y semantica: util para evaluar mecanismos de recuperacion entrenable en tareas de generacion de historias cortas.
- Estudio de mecanismos de autocorreccion: el automodelo con rollback permite investigar deteccion de anomalias y recuperacion de estado en modelos generativos pequenos.
- Analisis de alineacion basica: el monitor de valores y el congelamiento de plasticidad ofrecen un caso de estudio para tecnicas de control de deriva en modelos de investigacion.
- Generacion de texto simple en ingles para validacion de pipelines: dado su tamano (0,2 GB de repo) y entrenamiento sobre TinyStories, puede usarse para probar flujos de inferencia con transformers antes de escalar a modelos mayores.
- Docencia y talleres: su huella reducida permite ejecutarlo en CPU o en GPU consumer para demostraciones practicas de arquitecturas hibridas.

## Benchmarks y rendimiento

El model-index oficial del autor declara una entrada para SAGI con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (52,7 M de parametros, aproximadamente 211 MB de pesos) y en torno a 0,3-0,5 GB contando estados de activacion y cache KV para contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor indica que el entrenamiento se realizo en CPU, por lo que la inferencia en CPU es viable.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: transformers (AutoModelForCausalLM) es la via documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados, llama.cpp y Ollama no son aplicables directamente sin conversion.
- Latencia y throughput estimados: no disponibles. Las dinamicas de enjambre anaden sobrecarga computacional respecto a un transformer estandar del mismo tamano, segun el propio autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SAGI (reaperdoesntknow) | 52,7 M | 2048 | Apache 2.0 | Transformer + dinamicas de enjambre | Hugging Face, transformers |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Transformer decoder estandar | Hugging Face, ampliamente soportado |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Transformer decoder con RoPE | Hugging Face, vLLM, llama.cpp |
| SmolLM-135M (Hugging Face) | 135 M | 2048 | Apache 2.0 | Transformer decoder | Hugging Face, transformers, GGUF |

La comparativa es orientativa: SAGI es un modelo de investigacion con un objetivo arquitectonico distinto al de los modelos de proposito general. No se dispone de datos de rendimiento comparables para SAGI, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigacion temprana: el autor lo califica explicitamente como experimental y no apto para produccion.
- Entrenado sobre un subconjunto de TinyStories: las salidas tienden a ser simples, repetitivas o incoherentes, y de estilo narrativo infantil.
- Infraentrenado: la calidad de generacion es baja y no debe usarse para contenido factual.
- Solo ingles: no hay soporte multilingue documentado.
- Riesgo elevado de alucinacion: al no estar entrenado para precision factual, cualquier afirmacion generada debe tratarse como no fiable.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset TinyStories puede introducir sesgos narrativos y de estilo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja explicitamente su uso en produccion y sistemas criticos.
- No apto para sistemas de seguridad critica ni para generacion de contenido factual.
- Sobrecarga computacional: las dinamicas de enjambre anaden coste frente a un transformer estandar del mismo tamano.
- Sin pesos cuantizados ni integraciones documentadas con motores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/SAGI
- Model card (README): https://huggingface.co/reaperdoesntknow/SAGI/blob/main/README.md
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
