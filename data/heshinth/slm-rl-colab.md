# heshinth/slm-rl-colab

## Resumen

`heshinth/slm-rl-colab` es un adaptador LoRA (PEFT) desarrollado por heshinth que se integra sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` para permitir que este pequeño modelo de lenguaje (SLM) juegue a *Space Invaders* en el entorno de texto del framework [SLM-RL](https://github.com/CraftsMan-Labs/SLM-RL). El adaptador se entrena mediante *reject_sft* sobre demostraciones generadas por un profesor DQN, y su objetivo es "warm-start" (inicializar) el comportamiento del modelo en el juego, mejorando la puntuación primaria de 0.1458 a 0.4167 con una tasa de acciones inválidas y de intervención nulas.

Este adaptador es relevante porque demuestra un enfoque práctico de auto-mejora para SLMs: el modelo juega, sus decisiones se recopilan en un dataset reutilizable, se fine-tune sobre su propia experiencia y el modelo mejorado vuelve a jugar. Aunque el adaptador es específico para una tarea concreta, ilustra cómo aplicar técnicas de RL a modelos de lenguaje pequeños con recursos limitados, algo útil para investigación en agentes y entornos de juego.

El repositorio contiene únicamente los pesos del adaptador (tamaño 0.0 GB), que se cargan mediante la librería `peft` con el subdirectorio `adapter/`. No se proporcionan detalles sobre la arquitectura interna del modelo base, el número de parámetros del adaptador ni la longitud de contexto, ya que no están documentados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `LiquidAI/LFM2.5-1.2B-Instruct` (modelo base de 1.2B parámetros) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros, pero no se especifica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 o float32 según el dispositivo) |
| Idiomas soportados | No disponible (la model card no indica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que añade matrices de bajo rango a las capas del modelo base para ajustarlo a una tarea específica sin modificar los pesos originales. El modelo base, `LiquidAI/LFM2.5-1.2B-Instruct`, es un SLM instruct de 1.2B parámetros, pero no se detalla su arquitectura interna (si es transformer, MoE, etc.) en la información disponible.

El entrenamiento se realizó con el framework SLM-RL, que implementa un ciclo de auto-mejora: el modelo juega en un entorno de texto, sus decisiones se registran en un dataset, y luego se fine-tune mediante *reject_sft* (rejection sampling + supervised fine-tuning) sobre las demostraciones de un profesor DQN. Las métricas de entrenamiento indican una pérdida de -0.0046, una recompensa media de 0.169 y una entropía de 2.20, aunque no se especifica el número de tokens ni la composición del dataset. El dataset asociado es `heshinth/slm-rl-colab-data`, que contiene las demostraciones utilizadas.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés principal reside en la aplicación de RL a un SLM para juegos de Atari en formato texto.

## Capacidades

- Generación de texto: el adaptador permite al modelo generar respuestas de acción (por ejemplo, `ACTION: <id>`) en el contexto de *Space Invaders*.
- Razonamiento específico de juego: el modelo aprende a seleccionar acciones legales (NOOP, UP, etc.) en función del estado del juego representado en texto.
- Integración con SLM-RL: funciona como un adaptador que puede ser cargado y evaluado dentro del pipeline de evolución del framework.
- Soporte de tool calling: no disponible (no se documenta).
- Soporte de agentes: no es un agente general; está especializado en la tarea de juego.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no hay modo de pensamiento, visión ni audio; es exclusivamente texto.

## Casos de uso

- Investigación en RL para SLMs: el adaptador sirve como punto de partida para experimentos sobre cómo los modelos de lenguaje pequeños pueden aprender a jugar juegos de Atari mediante refuerzo, permitiendo reproducir y extender los resultados del framework SLM-RL.
- Benchmarking de auto-mejora: se puede utilizar para comparar la eficacia de diferentes estrategias de entrenamiento (reject_sft, DPO, etc.) en entornos de juego, ya que el adaptador proporciona una línea base con métricas conocidas (primary 0.4167, invalid_rate 0.0).
- Desarrollo de agentes de juego en texto: el adaptador puede integrarse en pipelines que requieran un modelo capaz de tomar decisiones secuenciales en entornos simulados, como pruebas de concepto de agentes conversacionales para juegos.
- Fine-tuning eficiente con PEFT: sirve como ejemplo de cómo aplicar LoRA a un SLM para una tarea específica con recursos limitados, útil para desarrolladores que quieran replicar el flujo de trabajo en Google Colab.
- Evaluación de robustez: al tener una tasa de acciones inválidas nula, puede usarse para probar la estabilidad del modelo en entornos con restricciones de formato de salida.
- Educación y tutoriales: el adaptador y su documentación son un recurso didáctico para aprender sobre RL aplicado a modelos de lenguaje, ya que el código de carga es sencillo y reproducible.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas de evaluación, obtenidas tras el entrenamiento:

| Metrica | Valor |
|---|---|
| Primary score | 0.4167 |
| Invalid rate | 0.0000 |
| Intervention rate | 0.0000 |
| Win rate | 0.0000 |
| Mean score (eval) | 0.4167 |
| Episodios de evaluacion | 8 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los datos se limitan a la evaluación interna del adaptador dentro del framework SLM-RL.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Un modelo de 1.2B parámetros puede ejecutarse en GPUs consumer con al menos 6-8 GB de VRAM en cuantización de 16 bits, o menos si se cuantiza a 8 bits.
- El adaptador en sí añade una sobrecarga mínima de memoria (tamaño del repo 0.0 GB, probablemente unos pocos MB).
- GPU recomendadas: NVIDIA RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10G o T4. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` en Python, o integrarse en frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base. Para uso en Colab, el código de ejemplo de la model card es suficiente.
- Latencia y throughput: no se especifican, pero para un modelo de 1.2B en una GPU moderna se espera una generación de 24 tokens en menos de un segundo.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para la misma tarea (jugar a *Space Invaders* con SLMs). El adaptador es específico de un framework y un modelo base concretos, por lo que no es directamente comparable con modelos generales de lenguaje. Se podría comparar con otros adaptadores LoRA entrenados para juegos de Atari, pero no se han encontrado en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está diseñado exclusivamente para *Space Invaders* en el entorno de texto de SLM-RL; no es un modelo de propósito general y no debe usarse fuera de este contexto.
- No se documentan sesgos conocidos, pero al ser un modelo de lenguaje base, puede heredar sesgos de su entrenamiento original. No se ha realizado una evaluación de sesgos específica.
- Riesgo de alucinación: aunque la tasa de acciones inválidas es 0.0 en la evaluación, el modelo podría generar respuestas fuera del formato esperado en situaciones no vistas.
- Limitaciones de contexto: no se especifica la longitud de contexto del modelo base, por lo que no se conoce el límite de tokens para las observaciones del juego.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener su propia licencia; se debe verificar antes de usar en producción.
- Para producción, es necesario fusionar el adaptador con el modelo base o gestionar la carga con PEFT en cada inferencia, lo que añade complejidad operativa.

## Enlaces

- [HuggingFace - heshinth/slm-rl-colab](https://huggingface.co/heshinth/slm-rl-colab)
- [Dataset asociado - heshinth/slm-rl-colab-data](https://huggingface.co/datasets/heshinth/slm-rl-colab-data)
- [Modelo base - LiquidAI/LFM2.5-1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct)
- [Framework SLM-RL (GitHub)](https://github.com/CraftsMan-Labs/SLM-RL)
