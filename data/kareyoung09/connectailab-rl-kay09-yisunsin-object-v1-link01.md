# kareyoung09/connectailab-rl-kay09-yisunsin-object-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (RL) construido sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla el autor kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS, orientado al robot bípedo LINK-01. El modelo resuelve una tarea muy concreta de decisión de alto nivel: seleccionar un objeto (choose_object) a partir de la información de observación del robot, actuando como una política ligera expresada en lenguaje natural en lugar de como un controlador de bajo nivel.

La relevancia del modelo es acotada y específica: demuestra el uso de un LLM pequeño (0,8 mil millones de parámetros) afinado con PPO como política de decisión para robótica, con una tasa de acierto del 92,3 % en el conjunto de prueba y un 100,0 % de éxito en 20 episodios de conducción real. No es un modelo de propósito general: es un artefacto de investigación con un dominio de aplicación restringido a una persona (yisunsin) y una tarea (choose_object) dentro de la plataforma LINK-01.

El repositorio tiene un tamaño de 0,0 GB, no registra descargas ni interacciones y está publicado bajo licencia Apache 2.0. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks más allá de las dos métricas citadas es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con aprendizaje por refuerzo (PPO, según las etiquetas del repositorio) sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. No se modifica la arquitectura del modelo base: el adaptador inyecta matrices de bajo rango en las capas del transformer y se carga mediante la librería PEFT. El pipeline declarado es reinforcement-learning y la tarea se formula como una decisión de alto nivel (choose_object) condicionada por la observación del robot bípedo LINK-01.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de anotación de recompensas ni los hiperparámetros del entrenamiento PPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El autor reporta dos métricas de evaluación: una tasa de acierto del 92,3 % en el examen de la tarea y un 100,0 % de éxito en 20 episodios de conducción real.

## Capacidades

- Decisión de alto nivel para robótica: selección de objeto (choose_object) a partir de la observación del robot bípedo LINK-01.
- Generación de texto en coreano para expresar la acción o decisión elegida.
- Aprendizaje por refuerzo (PPO) como mecanismo de ajuste, no solo supervisión.
- Integración con el ecosistema HuggingFace Transformers y PEFT para carga del adaptador.
- Capacidades de propósito general heredadas del modelo base Qwen3.5-0.8B: no documentadas en la información disponible para este adaptador.
- Soporte de tool calling, agentes, visión, audio o modo de razonamiento extendido: no disponible.

## Casos de uso

- Política de decisión en el robot LINK-01: el adaptador recibe la observación del robot y emite la decisión de qué objeto seleccionar, sustituyendo o complementando una política codificada a mano en la capa de alto nivel.
- Investigación en RL con LLM pequeños: sirve como referencia reproducible de cómo un modelo de 0,8 mil millones de parámetros puede actuar como política de decisión con PPO en un dominio acotado.
- Evaluación de LoRA para robótica: permite comparar el rendimiento del adaptador frente al modelo base sin ajuste en la misma tarea, dado que el adaptador es ligero y se carga sobre Qwen3.5-0.8B.
- Prototipado de sistemas de decisión en entornos simulados: el formato de salida en lenguaje natural facilita la inspección y depuración de las decisiones del robot antes de desplegarlas en hardware real.
- Docencia y demostraciones: el tamaño reducido del modelo base permite ejecutarlo en hardware modesto para mostrar el ciclo completo observación-decisión en un robot bípedo.
- Base para transferencia a otras tareas del proyecto LINK-01: el mismo esquema de adaptador LoRA con PPO podría reutilizarse para otras tareas de decisión del mismo robot, aunque esto no está documentado por el autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de acierto en el examen de la tarea (Accuracy) | 92,3 % |
| Tasa de éxito en 20 episodios de conducción real (Drive Success) | 100,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base de 0,8 mil millones de parámetros en precisión de 16 bits requiere aproximadamente 1,6 GB solo para los pesos, más el adaptador LoRA y el coste de activaciones y KV cache.
- GPU recomendadas: no disponibles en la documentación del autor; por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder cargar el modelo base en FP16.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base, aunque el autor no lo confirma.
- Opciones de despliegue: carga mediante Transformers y PEFT (el único método documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 B (base) + LoRA | no disponible | Decisión robótica choose_object | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base sin ajuste) | 0,8 B | no disponible | Propósito general | no disponible en la información | HuggingFace |
| Adaptadores LoRA de robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de RL para robótica directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el adaptador está entrenado para una única tarea (choose_object) y una única persona (yisunsin) del proyecto LINK-01; no es un modelo de propósito general.
- Idioma limitado al coreano; no se documenta soporte de otros idiomas.
- Riesgo de alucinación: no evaluado por el autor; al ser un modelo de lenguaje, puede generar decisiones no válidas fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- El tamaño del repositorio es de 0,0 GB y no registra descargas ni interacciones, lo que sugiere que el artefacto puede no estar completamente subido o que su validación externa es nula.
- No se documentan los datos de entrenamiento ni los hiperparámetros de PPO, lo que dificulta la reproducibilidad.
- Para producción en robótica real, el 100 % de éxito en 20 episodios es una muestra pequeña y no garantiza robustez ante condiciones no vistas.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yisunsin-object-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
