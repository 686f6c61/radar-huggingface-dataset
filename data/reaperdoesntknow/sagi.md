# reaperdoesntknow/SAGI

## Resumen

SAGI (Swarm AGI Language Model) es un modelo de lenguaje causal experimental que integra dinámicas de inteligencia de enjambre con una arquitectura transformer. Desarrollado por el usuario reaperdoesntknow, el modelo trata la cognición como un sistema adaptativo en el que múltiples «agentes» internos colaboran mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida. Con 52,72 millones de parámetros, 6 capas y una ventana de contexto de 2048 tokens, SAGI es un modelo pequeño orientado exclusivamente a la investigación.

La relevancia de SAGI reside en su propuesta arquitectónica: combina un decoder transformer estándar con un módulo de enjambre que condiciona la atención y las capas feed-forward mediante proyecciones aprendidas. Esto crea un flujo bidireccional entre el procesamiento simbólico (tokens) y subsimbólico (dinámicas de enjambre). El modelo está entrenado únicamente sobre un subconjunto de TinyStories, por lo que su capacidad de generación es limitada y no está pensado para uso productivo. Su licencia Apache 2.0 permite uso libre, incluido comercial, aunque el propio autor desaconseja su empleo en sistemas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Decoder + Swarm Dynamics |
| Parametros totales | 52.729.731 (52,72 M) |
| Parametros activos | no disponible (no es MoE declarado) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SAGI combina un decoder transformer estándar (6 capas, 8 cabezas de atención, hidden size 512, embeddings RoPE) con un módulo de enjambre denominado Swarm-7 V2.2. Este módulo procesa observaciones derivadas de los embeddings de los tokens y actualiza un estado interno S, que condiciona los patrones de atención y las activaciones feed-forward mediante proyecciones aprendidas. El sistema incorpora varias innovaciones: enrutamiento diferenciable tipo mixture-of-experts continuo (DiffRouter), un MetaController que activa capacidad bajo restricciones de recursos, un sistema de memoria dual (episódica y semántica) con utilidad de recuperación entrenable, un motor de curiosidad que inyecta objetivos novedosos cuando la sorpresa es baja, un self-model que predice transiciones de estado y detecta anomalías para autocorrección, dinámicas de recursos con conservación suave (compute, memoria y energía) y un monitor de valores que congela la plasticidad ante desviaciones de los valores núcleo (verdad, seguridad, eficiencia).

El entrenamiento se realizó sobre un subconjunto de TinyStories con optimizador AdamW (lr=3e-4, betas=(0.9, 0.999), weight_decay=0.01), scheduler de coseno y precisión FP32. El hardware declarado es CPU, aunque el modelo es compatible con CUDA. No se especifica el número de tokens de entrenamiento.

## Capacidades

- Generación de texto causal con condicionamiento por dinámicas de enjambre.
- Enrutamiento diferenciable entre agentes internos (top-k de 5 sobre un máximo de 20 agentes).
- Memoria dual episódica y semántica con recuperación entrenable.
- Motor de curiosidad para exploración cuando la sorpresa es baja.
- Autocorrección mediante predicción de transiciones de estado y detección de anomalías.
- Gestión de recursos internos (cómputo, memoria y energía) con presupuestos fijos.
- Monitoreo de valores con congelación de plasticidad ante deriva.
- Capacidades multilingües: no disponible, solo inglés declarado.
- Sin soporte de tool calling ni function calling.
- Sin modo de razonamiento explícito más allá de las iteraciones internas de pensamiento (K_thought_max=5).

## Casos de uso

- Investigación en arquitecturas multi-agente: SAGI permite estudiar cómo el enrutamiento diferenciable y los mecanismos de confianza afectan a la generación de texto en comparación con transformers estándar del mismo tamaño.
- Educación sobre inteligencia de enjambre aplicada a LLMs: su código y configuración documentada sirven como material didáctico para comprender la integración de dinámicas colectivas en modelos de lenguaje.
- Experimentación con memoria episódica y semántica: los investigadores pueden analizar el impacto de la memoria dual en tareas de generación de historias cortas, dado su entrenamiento en TinyStories.
- Evaluación de mecanismos de autocorrección: el self-model y el sistema de rollback permiten probar estrategias de detección de anomalías en secuencias generadas.
- Estudio de la relación entre recursos computacionales y calidad de salida: los presupuestos de cómputo, memoria y energía son configurables, lo que facilita experimentos de escalado y eficiencia.
- Benchmark de arquitecturas híbridas simbólico-subsimbólicas: SAGI sirve como punto de partida para comparar el rendimiento de modelos que combinan procesamiento simbólico y subsimbólico frente a arquitecturas puramente transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del autor declara una lista vacía de resultados.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 52,72 M de parámetros en FP32, el peso ocupa aproximadamente 210 MB. Con overhead de inferencia, se estima un uso de VRAM inferior a 1 GB en GPU.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., GTX 1050 Ti, RTX 2060) es suficiente. También es ejecutable en CPU con memoria RAM estándar.
- Compatibilidad con consumer GPU: sí, ampliamente.
- Opciones de despliegue: transformers (PyTorch), compatible con vLLM y TGI por ser un modelo causal estándar, aunque no hay integraciones probadas documentadas. También puede usarse con llama.cpp si se convierte a GGUF, pero no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no disponible. El overhead de las dinámicas de enjambre añade coste computacional adicional frente a un transformer del mismo tamaño, pero al ser un modelo pequeño la latencia en CPU es aceptable para experimentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Uso principal |
|---|---|---|---|---|---|
| SAGI | 52,72 M | 2048 | Transformer + Swarm Dynamics | Apache 2.0 | Investigación |
| GPT-2 small | 124 M | 1024 | Transformer decoder | MIT | Generación general |
| TinyStories-1M | 1 M | 512 | Transformer decoder | Apache 2.0 | Investigación educativa |

No se dispone de benchmarks comparativos entre estos modelos. SAGI se distingue por su arquitectura híbrida, pero su entrenamiento limitado en TinyStories lo sitúa muy por detrás de GPT-2 small en calidad de generación. TinyStories-1M es comparable en propósito educativo, aunque con menos parámetros.

## Limitaciones y advertencias

- Modelo experimental y subentrenado: las salidas pueden ser repetitivas o incoherentes, tal como advierte el autor.
- Entrenado exclusivamente en un subconjunto de TinyStories, lo que limita su vocabulario y temática a historias simples en inglés.
- Sin soporte multilingüe: solo inglés.
- Overhead computacional: las dinámicas de enjambre añaden coste de inferencia en comparación con transformers estándar del mismo tamaño.
- No apto para producción, sistemas críticos de seguridad ni generación de contenido factual.
- No se han publicado cuantizaciones oficiales ni resultados de benchmarks.
- El autor indica que el entrenamiento se realizó en CPU, lo que sugiere una calidad de convergencia limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/SAGI
- Colección SAGI: https://huggingface.co/collections/reaperdoesntknow/sagi-swarm-agi-language-model
- Modelo relacionado S-AGI: https://huggingface.co/reaperdoesntknow/S-AGI
- Modelo relacionado SharperSwarm: https://huggingface.co/reaperdoesntknow/SharperSwarm
- Colección DiscoverLM: https://huggingface.co/collections/reaperdoesntknow/discoverlm
