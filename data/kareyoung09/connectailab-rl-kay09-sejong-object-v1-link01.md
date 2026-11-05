# kareyoung09/connectailab-rl-kay09-sejong-object-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (PPO) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS dentro del proyecto LINK-01. Su función es actuar como módulo de decisión de alto nivel para un robot bípedo: a partir de la información de observación del robot, el modelo selecciona la acción de alto nivel correspondiente a la tarea `choose_object` (selección de objetos). No es un modelo de propósito general, sino un componente especializado dentro de una arquitectura de control robótico.

El modelo se distribuye como adaptador PEFT (LoRA) en formato safetensors, lo que implica que requiere descargar y cargar el modelo base Qwen3.5-0.8B para funcionar. Con 0,8 mil millones de parámetros en la base, está diseñado para inferencia de baja latencia en entornos de control, donde la decisión debe producirse en el bucle del robot. La model card reporta una precisión del 88,0 % en la prueba de selección de objetos y un 100,0 % de éxito de conducción en 20 episodios de prueba.

Su relevancia radica en el enfoque: aplicar un modelo de lenguaje pequeño afinado con RL para la capa de decisión simbólica de un robot, en lugar de un policy network clásico. El soporte de idioma declarado es exclusivamente coreano (ko), y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA/PEFT |
| Parámetros totales | 0,8 mil millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena con aprendizaje por refuerzo, concretamente PPO (Proximal Policy Optimization), según los tags del repositorio. El pipeline declarado es `reinforcement-learning` y el dominio de aplicación es robótica y toma de decisiones. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de SFT o DPO.

La innovación técnica principal no está en la arquitectura del modelo, sino en el uso del LLM como policy de alto nivel para un robot bípedo: el modelo recibe observaciones y emite decisiones discretas de acción (selección de objeto). El entrenamiento RL se realizó sobre una tarea concreta (`choose_object`) y una persona concreta (`sejong`), lo que sugiere un ajuste muy específico al entorno de evaluación del proyecto LINK-01. No se dispone de detalles sobre la función de recompensa, el entorno de simulación o el número de pasos de entrenamiento.

## Capacidades

- Toma de decisiones de alto nivel para robótica: selección de objetos (`choose_object`) a partir de observaciones del robot bípedo LINK-01.
- Generación de acciones discretas en formato de texto, aprovechando la interfaz de lenguaje del modelo base.
- Razonamiento de decisión de un solo paso orientado a política (policy), no a conversación abierta.
- Soporte multilingüe limitado al coreano (ko) según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad de generación de texto general heredada del modelo base Qwen3.5-0.8B, no evaluada en esta ficha.

## Casos de uso

- Control de selección de objetos en robot bípedo: el modelo recibe el estado observado del robot y emite la decisión de qué objeto elegir; es su caso de uso principal y el único validado con métricas (88,0 % de precisión en prueba, 100,0 % de éxito en 20 episodios).
- Capa de decisión simbólica en pipelines de robótica: integrado como nodo de política de alto nivel que traduce observaciones en acciones discretas, delegando el control motor de bajo nivel a otro módulo.
- Evaluación de políticas RL basadas en LLM: sirve como referencia para comparar el enfoque de LLM+LoRA+PPO frente a policy networks clásicos en tareas de manipulación y selección.
- Prototipado de agentes encarnados en simulación: útil para experimentar con la interfaz lenguaje-acción en entornos de investigación con presupuesto de cómputo reducido (0,8B de parámetros).
- Investigación en ajuste fino con RL sobre modelos pequeños: el adaptador es un ejemplo reproducible de PPO sobre un modelo de 0,8B para una tarea de decisión concreta.
- Despliegue en hardware embebido o de borde: al tratarse de un modelo de 0,8B con adaptador LoRA, el coste de inferencia es bajo comparado con LLM de mayor tamaño, lo que permite ejecutarlo cerca del robot si se cuantiza adecuadamente.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas internas del proyecto, no benchmarks estándar:

| Métrica | Valor |
|---|---|
| Precisión en prueba (tarea `choose_object`) | 88,0 % |
| Éxito de conducción en 20 episodios | 100,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 0,8B en FP16 se estiman aproximadamente 1,6 GB de pesos, más overhead de activaciones y del adaptador LoRA.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer con 8 GB o más es suficiente para FP16, y menos de 4 GB en cuantización de 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, así como en hardware de borde con suficiente memoria.
- Opciones de despliegue: transformers + PEFT (método documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador y requerirían conversión o soporte de LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores RL para decisión robótica sobre LLM pequeños) en la documentación proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | no disponible | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: el adaptador está entrenado para una única tarea (`choose_object`) y una única persona (`sejong`) del proyecto LINK-01; no es un modelo de propósito general.
- Idioma: solo se declara soporte de coreano (ko); el rendimiento en otros idiomas no está evaluado.
- Dependencia del modelo base: requiere Qwen/Qwen3.5-0.8B; sin él, el adaptador no es funcional.
- Métricas no verificables de forma independiente: el 88,0 % de precisión y el 100,0 % de éxito en 20 episodios son datos internos del autor, sin protocolo de evaluación publicado.
- Riesgo de alucinación: al ser un LLM, puede generar acciones no válidas o inconsistentes fuera de la distribución de observaciones de entrenamiento.
- Sesgos: no documentados; el entrenamiento sobre una persona y tarea concretas puede introducir sesgos de entorno no evaluados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B debe cumplir su propia licencia, que no se detalla en la información disponible.
- Sin datos de contexto máximo, cuantización validada ni latencia: riesgos para planificación de producción en robótica en tiempo real.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-sejong-object-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos del proyecto LINK-01.
