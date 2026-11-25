# reaperdoesntknow/SAGI

## Resumen

SAGI (Swarm AGI Language Model) es un modelo de lenguaje causal de tipo decoder-only desarrollado por el usuario independiente reaperdoesntknow bajo la licencia Apache 2.0. Se presenta como un experimento de investigación que combina una arquitectura transformer convencional con un conjunto de dinámicas inspiradas en la inteligencia de enjambre: enrutamiento diferenciable, mecanismos de confianza, memoria episódica y semántica, y un motor de curiosidad. El modelo tiene 52,7 millones de parámetros, una dimensión oculta de 512, 6 capas y 8 cabezas de atención, con una longitud de contexto de 2048 tokens y tokenizador GPT-2 (50.257 tokens).

La propuesta técnica central es la integración de un módulo denominado Swarm-7 V2.2 que mantiene un estado interno (S) actualizado a partir de las observaciones derivadas de los embeddings de los tokens, y que condiciona la atención y las capas feed-forward del transformer mediante proyecciones aprendidas. Esto crea un flujo bidireccional entre el procesamiento simbólico (tokens) y el subsimbólico (dinámicas de enjambre). El modelo incorpora además presupuestos de recursos (cómputo, memoria, energía) y un mecanismo de iteración de pensamiento de hasta 5 pasos por token generado.

Es relevante ahora como objeto de estudio para quienes investigan arquitecturas cognitivas híbridas y sistemas multiagente internos, no como modelo de producción. El propio autor lo describe como un modelo temprano de investigación, entrenado sobre un subconjunto de TinyStories, con calidad de generación limitada y sin resultados de benchmarks publicados. Su interés es fundamentalmente arquitectónico y educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder + Swarm Dynamics (Swarm-7 V2.2) |
| Parametros totales | 52.729.731 |
| Parametros activos | No aplica (no es MoE; el enrutamiento diferenciable es interno, no de expertos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32/FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros parametros de la arquitectura: hidden size 512, 6 capas, 8 cabezas de atencion, vocabulario de 50.257 tokens (tokenizador GPT-2), embeddings RoPE. Configuracion del enjambre: `max_agents`=20, `dim_s`=64, `dim_t`=32, `dim_obs`=48, `topk_route`=5, `K_thought_max`=5. Presupuestos de recursos por paso: computo 60.0, memoria 20.0, energia 25.0. Tasa de aprendizaje de confianza 0.07; EMA rapida 0.10; EMA lenta 0.002.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención RoPE, aumentado con un módulo de dinámicas de enjambre. El módulo Swarm-7 V2.2 procesa observaciones derivadas de los embeddings de tokens y actualiza un estado interno S que condiciona las pautas de atención y las activaciones feed-forward del transformer mediante proyecciones aprendidas. El modelo integra varios componentes diferenciables: un enrutador continuo (`DiffRouter`) que implementa una mezcla de expertos suave vía atención en lugar de selección dura de módulos; un `MetaController` con gating adaptativo y dinámicas de confianza que sesga hacia componentes fiables; memoria episódica y semántica dual con utilidad de recuperación entrenable; un motor de curiosidad que inyecta objetivos novedosos cuando la sorpresa es baja; un auto-modelo con rollback que predice transiciones de estado y detecta anomalías; dinámicas de recursos con conservación suave y conversor aprendido; y monitorización de valores que congela la plasticidad ante deriva respecto a los valores núcleo ("truth", "safety", "efficiency").

El entrenamiento se realizó sobre un subconjunto de TinyStories, con optimizador AdamW (lr=3e-4, betas=(0.9, 0.999), weight_decay=0.01), scheduler de annealing coseno y precisión FP32. El hardware de entrenamiento fue CPU (compatible con CUDA). No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. El autor reconoce que el modelo está infraentrenado.

## Capacidades

- Generación de texto causal en inglés, con salidas de estilo narrativo simple derivadas de TinyStories.
- Razonamiento multi-paso interno mediante iteraciones de pensamiento (`K_thought_max`=5) por paso de generación.
- Enrutamiento diferenciable entre agentes internos (hasta 20) con top-k=5, lo que permite especialización suave dentro del modelo.
- Mecanismos de auto-corrección basados en predicción de transiciones de estado y detección de anomalías (self-model y rollback).
- Memoria dual episódica y semántica con recuperación entrenable, orientada a mantener coherencia en contextos de hasta 2048 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes externos ni orquestación multi-agente a nivel de API.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Investigación en arquitecturas cognitivas híbridas: el modelo sirve como banco de pruebas para estudiar cómo las dinámicas de enjambre condicionan la atención y las activaciones de un transformer, con componentes como `DiffRouter` y `MetaController` instrumentables y modificables.
- Experimentos educativos sobre inteligencia de enjambre aplicada a LLM: permite a estudiantes y docentes examinar el flujo de información entre el estado S y las capas del decoder, y comparar el comportamiento con un transformer estándar de tamaño similar.
- Estudio de mecanismos de auto-corrección: el auto-modelo con rollback y la detección de anomalías pueden evaluarse en tareas controladas de generación para medir la utilidad de la predicción de transiciones de estado.
- Análisis de dinámicas de confianza y plasticidad: los parámetros de trust learning rate y las EMAs rápida/lenta permiten investigar cómo un modelo sesga su comportamiento hacia componentes fiables y cómo consolida conocimiento.
- Prototipado de sistemas de memoria dual: la memoria episódica y semántica con recuperación entrenable es un caso de estudio para quienes diseñan arquitecturas con memoria externa en modelos pequeños.
- Docencia sobre limitaciones de modelos infraentrenados: el modelo ilustra de forma práctica los efectos de entrenar sobre TinyStories (salidas repetitivas, incoherencia) y sirve para enseñar evaluación crítica de modelos.
- No es adecuado para atención al cliente, generación de código en producción, sistemas de seguridad crítica ni generación de contenido factual.

## Benchmarks y rendimiento

El model-index del autor declara una entrada para SAGI con la lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 52,7 millones de parámetros, en FP32 los pesos ocupan aproximadamente 211 MB; en FP16, unos 105 MB. El estado del enjambre y las memorias añaden una sobrecarga no cuantificada, pero el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El autor entrenó en CPU, lo que indica que la inferencia también es viable en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería nativa), con posibilidad de exportación a otros runtimes no documentada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado el tamaño, transformers es la vía directa.
- Latencia y throughput estimados: no disponibles. El autor advierte que las dinámicas de enjambre añaden sobrecarga de cómputo respecto a un transformer estándar del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAGI | 52,7 M | 2048 | Transformer decoder + swarm dynamics | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1024 | Transformer decoder | MIT | Hugging Face |
| TinyLlama | 1,1 B | 2048 | Transformer decoder (Llama) | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2048 | Transformer decoder | Apache 2.0 | Hugging Face |

La comparación es orientativa por tamaño y categoría (modelos pequeños de generación de texto en inglés). SAGI es aproximadamente la mitad de GPT-2 small en parámetros y un orden de magnitud menor que TinyLlama. No hay datos de rendimiento publicados para SAGI que permitan una comparación cuantitativa con estos modelos; los benchmarks de los alternativos no se incluyen aquí por no formar parte de la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación temprana: el autor lo describe explícitamente como experimental y no apto para producción.
- Entrenado sobre un subconjunto de TinyStories: las salidas tienden a ser simples, de estilo narrativo y potencialmente repetitivas o incoherentes.
- Infraentrenado según el propio autor: la calidad de generación es limitada y no debe esperarse coherencia sostenida en contextos largos.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación elevado: al ser un modelo pequeño e infraentrenado, no es fiable para contenido factual.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento sobre TinyStories puede introducir sesgos narrativos y de estilo, pero no hay análisis publicado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso en producción y en sistemas de seguridad crítica.
- Sin benchmarks: no hay evidencia cuantitativa de rendimiento que respalde afirmaciones de capacidad.
- Sobrecarga computacional: las dinámicas de enjambre añaden coste frente a un transformer estándar del mismo tamaño.
- Contexto limitado a 2048 tokens, insuficiente para muchas aplicaciones de contexto largo.
- El repositorio tiene 0,2 GB y 2.516 descargas con solo 2 likes, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SAGI
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
