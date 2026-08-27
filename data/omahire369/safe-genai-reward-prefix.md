# OmAhire369/safe-genai-reward-prefix

## Resumen

`safe-genai-reward-prefix` es un modelo de recompensa basado en el enfoque Bradley-Terry, entrenado mediante *prefix tuning* sobre el modelo base `bert-base-uncased`. Su objetivo es puntuar respuestas de modelos de lenguaje según su seguridad y alineación con preferencias humanas, especialmente frente a prompts dañinos o que activan estereotipos. El modelo forma parte de un estudio comparativo entre PPO y DPO, así como de un barrido de cuatro estrategias de fine-tuning (full, prefix, LoRA y QLoRA), desarrollado por Om Ahire, estudiante de M.Tech en IA en IIT Kharagpur.

Con solo 0,369 millones de parámetros entrenables (0,34% del total), el modelo es extremadamente ligero y se entrena en menos de cinco minutos en una GPU de consumo. Aunque no es un modelo generativo, actúa como un clasificador de preferencias que puede integrarse en pipelines de alineación de LLMs. Su relevancia radica en demostrar que un reward model pequeño y eficiente puede alcanzar una precisión de preferencia superior al 81% en datos de seguridad, lo que lo convierte en una opción interesante para experimentos de alineación de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) con cabezal de regresión para reward |
| Parametros totales | 109,85 M (base) + 0,369 M entrenables (prefix) |
| Parametros activos | 0,369 M (solo los parámetros del prefix son entrenables) |
| Longitud de contexto | 512 tokens (límite de BERT base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

El modelo se construye sobre `bert-base-uncased`, un transformer encoder de 12 capas con 110M de parámetros, al que se añade una cabeza de regresión con una sola salida (num_labels=1) para producir una puntuación escalar. La técnica de fine-tuning empleada es *prefix tuning*, que inserta vectores de prefijo aprendibles en las capas de atención, dejando congelados los pesos del modelo base. Esto reduce drásticamente el número de parámetros entrenables (0,369M) y el coste computacional.

El entrenamiento utiliza datos de preferencia del conjunto *Cultural Kaleidoscope*, con 4000 pares de respuestas (elegidas y rechazadas) etiquetadas según criterios de seguridad y ausencia de estereotipos. Se optimiza la pérdida de Bradley-Terry, que modela la probabilidad de que una respuesta sea preferida sobre otra. El entrenamiento se completó en 267,31 segundos con un pico de uso de GPU de 2946,3 MB, lo que indica que es viable en hardware de gama media. No se aplicaron técnicas de RLHF o DPO directamente sobre este modelo; es el componente de recompensa para dichos métodos.

## Capacidades

- Clasificación de preferencias: asigna una puntuación escalar a una respuesta dada, indicando su nivel de seguridad y alineación con preferencias humanas.
- Detección de respuestas dañinas o estereotipadas: entrenado específicamente para penalizar contenido que pueda resultar ofensivo o perjudicial.
- Integración en pipelines de RLHF/DPO: puede usarse como función de recompensa para entrenar políticas de LLMs mediante optimización por refuerzo o divergencia de preferencias.
- Eficiencia computacional: al ser un adaptador PEFT, se puede cargar y ejecutar en GPU con menos de 3 GB de VRAM, o incluso en CPU.
- No genera texto: es un modelo discriminativo, no generativo, por lo que no produce respuestas por sí mismo.

## Casos de uso

- Alineación de seguridad en LLMs: integrar el reward model en un bucle PPO o DPO para ajustar un modelo generativo, penalizando respuestas que contengan lenguaje dañino o estereotipado.
- Filtrado de respuestas en producción: usar la puntuación del modelo como umbral para descartar respuestas de un LLM que no alcancen un nivel mínimo de seguridad antes de mostrarlas al usuario.
- Evaluación de datasets de preferencias: puntuar pares de respuestas para verificar la consistencia de anotaciones humanas o para crear nuevos conjuntos de entrenamiento.
- Investigación académica en alineación: servir como baseline en estudios comparativos de métodos de fine-tuning (prefix vs LoRA vs QLoRA) y de algoritmos de optimización (PPO vs DPO).
- Prototipado rápido de sistemas de moderación: dado su bajo coste de inferencia, puede desplegarse en entornos de prueba para validar flujos de moderación de contenido antes de escalar a modelos más grandes.
- Educación y experimentación: útil para estudiantes e investigadores que quieran entender cómo funcionan los reward models y cómo se integran en pipelines de alineación sin necesidad de grandes recursos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de test:

| Metrica | Valor |
|---|---|
| Precision de preferencia (test) | 0,8114 |
| Bradley-Terry NLL (test) | 0,4534 |
| Margen medio de recompensa | 1,5796 |

No se han publicado comparaciones con otros reward models en la información disponible. Estos valores indican que el modelo acierta en aproximadamente el 81% de los pares de preferencia, con una pérdida NLL relativamente baja y un margen de recompensa positivo, lo que sugiere una separación clara entre respuestas seguras e inseguras.

## Requisitos de hardware

- VRAM estimada: el pico de entrenamiento fue de 2946,3 MB, por lo que la inferencia requiere menos de 3 GB. Es compatible con GPUs de 4 GB o más, como la NVIDIA GTX 1650, RTX 3050 o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. También puede ejecutarse en CPU, aunque con mayor latencia.
- Despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` y `transformers`. No se mencionan integraciones con vLLM, Ollama o TGI, pero al ser un modelo pequeño, puede servirse mediante una API simple con FastAPI o similar.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño de BERT base y el bajo número de parámetros activos, la inferencia en GPU debería ser del orden de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor también publicó `OmAhire369/reward-model-safe-ai`, que parece ser un reward model similar, pero no se detallan diferencias. No se incluyen comparativas con otros reward models de la literatura (p. ej., RewardBench, modelos basados en DeBERTa, etc.) por falta de datos.

## Limitaciones y advertencias

- El modelo base `bert-base-uncased` es pequeño y desactualizado; no tiene instrucciones de fine-tuning, por lo que la alineación solo afecta al estilo y la seguridad, no a la factualidad.
- El reward model hereda los sesgos de anotación del dataset *Cultural Kaleidoscope*, que pueden no generalizar a otros dominios o culturas.
- No debe tratarse como un clasificador de seguridad universal; su rendimiento fuera del dominio de entrenamiento no está garantizado.
- La longitud de contexto está limitada a 512 tokens, lo que impide evaluar respuestas largas o conversaciones extensas.
- No se especifican los idiomas soportados; aunque BERT base está entrenado principalmente en inglés, no hay garantía de buen rendimiento en otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo no es apto para producción sin una validación adicional exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmAhire369/safe-genai-reward-prefix
- Repositorio del autor en GitHub: https://github.com/Omahire369
- Modelo relacionado (reward-model-safe-ai): https://huggingface.co/OmAhire369/reward-model-safe-ai
- Paquete PyPI safe-genai (proyecto distinto, no relacionado directamente): https://pypi.org/project/safe-genai/
