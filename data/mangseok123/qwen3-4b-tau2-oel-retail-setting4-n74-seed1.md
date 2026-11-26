# MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n74-seed1

## Resumen

qwen3-4b-tau2-oel-retail-setting4-n74-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario MANGSEOK123 y publicado en Hugging Face. El modelo aplica una técnica de "internalización de habilidades" (skill internalization) mediante autodestilación on-policy (OPSD, on-policy self-distillation) sobre el benchmark tau2-bench en su variante retail (v1.0.1). El objetivo es que el modelo estudiante aprenda a resolver tareas conversacionales de atención al cliente sin necesidad de recibir la habilidad correspondiente en el prompt de sistema, imitando a un profesor congelado que sí la tiene.

El modelo parte de la arquitectura Qwen3-4B-Instruct-2507, un transformer denso de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) con pesos en BF16. El repositorio ocupa 8,8 GB y se distribuye en formato safetensors bajo la librería transformers, con compatibilidad declarada con text-generation-inference y endpoints. Se trata de un experimento de investigación centrado en destilación y no de un modelo de propósito general con documentación extensa.

La relevancia de esta ficha es acotada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y su model card se limita a describir el procedimiento de entrenamiento. Es útil como referencia para quienes investigan autodestilación on-policy y internalización de habilidades en agentes conversacionales, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); detalles internos no disponibles |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible como spec del modelo; en entrenamiento se usaron prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens por turno |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B-Instruct-2507, un transformer denso de unos 4,4 mil millones de parámetros. No se documentan en la información disponible cambios estructurales respecto al modelo base; el ajuste es de pesos, no de arquitectura. Los pesos se publican en BF16 y el repositorio ocupa 8,8 GB.

El entrenamiento consistió en una época de autodestilación on-policy (OPSD) sobre tau2-bench retail v1.0.1, usando el codebase OEL (LMOps). Se emplearon 74 pares tarea-habilidad de los 176 pares TANI Full (habilidades validadas cruzadas con tareas fuente y de sonda, con utilidad > 0), con un presupuesto equiparado a la línea base de Task Aug. La semilla 1 determina el submuestreo de pares (`random.Random(1).sample(pool, N)`), el orden de los datos y el muestreo de rollouts. Se procesaron 8 pares por actualización. El estudiante resuelve cada tarea sin la habilidad en el prompt (temperatura 0,7, con un simulador de usuario GPT-4.1-mini), mientras que un profesor congelado, copia del modelo inicial, dispone de la habilidad en su prompt de sistema. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, con AdamW a learning rate constante de 3e-6, weight decay 0,01 y grad clip 1,0. Los límites por turno son prompt ≤ 8192 tokens y respuesta ≤ 1024 tokens.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a tareas de atención al cliente en dominio retail.
- Ejecución de tareas de tau2-bench retail sin la habilidad explícita en el prompt de sistema, como resultado de la internalización.
- Razonamiento de agente en varios pasos dentro de diálogos con herramientas y estado de la conversación (el entorno tau2-bench implica interacción con un simulador de usuario).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el dominio de entrenamiento (retail con herramientas) lo hace plausible; no se documenta en la model card.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en autodestilación on-policy: el modelo sirve como artefacto reproducible para estudiar cómo un estudiante absorbe habilidades de un profesor congelado sin acceso a la habilidad en inferencia. Los hiperparámetros y la semilla están documentados en la model card.
- Evaluación comparativa en tau2-bench retail: puede usarse como checkpoint de referencia en la variante retail v1.0.1 para medir el efecto de la internalización frente al modelo base Qwen3-4B-Instruct-2507.
- Agentes conversacionales de atención al cliente en dominio retail: el ajuste está orientado a diálogos multi-turno con estado y acciones de tienda, por lo que encaja en prototipos de soporte al cliente con catálogo y pedidos, siempre que se valide fuera del conjunto de entrenamiento.
- Reproducción de experimentos de destilación: al especificar pares, semilla y presupuesto, permite replicar el pipeline OEL con otras semillas o subconjuntos de pares.
- Estudio de la pérdida KL inversa a nivel de token: útil para analizar el efecto de restringir la destilación a los 256 tokens más probables del estudiante en tareas de diálogo.
- Base para ajustes posteriores en dominios específicos: al ser un modelo de 4,4 mil millones de parámetros en BF16, puede servir como punto de partida para fine-tuning con SFT o DPO en dominios retail concretos, con coste de cómputo moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB de VRAM para secuencias de contexto moderado.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los pesos BF16.
- GPU recomendadas: para BF16, una RTX 4090 (24 GB) o A100/H100 cubren con holgura; en GPUs consumer de 16 GB (RTX 4080, 4060 Ti 16 GB) puede caber con contexto limitado.
- Cabe en GPU consumer: sí, en modelos con 16 GB o más en BF16; en GPUs de 8-12 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n74-seed1 | 4,41 B | No disponible (entrenamiento con prompt ≤ 8192) | No disponible | Hugging Face, 0 descargas | Ajuste OPSD sobre tau2-bench retail |
| Qwen/Qwen3-4B-Instruct-2507 | Aproximadamente 4 B | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face (modelo base) | Modelo base sin internalización de habilidades |
| Alternativas de 4 B para agentes conversacionales | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este ajuste con el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3-4B-Instruct-2507, hereda los sesgos de su modelo base y de los datos de entrenamiento, no descritos en la model card.
- Riesgo de alucinación: no evaluado; el ajuste se centra en tareas de diálogo retail y no se han publicado métricas de fidelidad fuera de ese dominio.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados; el entrenamiento usó prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens por turno, lo que puede limitar el rendimiento en conversaciones más largas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Caveat de producción: es un checkpoint de investigación con 0 descargas y 0 likes, sin evaluación externa ni documentación de robustez; no se recomienda su uso en producción sin validación propia.
- Especificidad del dominio: el ajuste está hecho sobre 74 pares de tau2-bench retail con una semilla concreta; el rendimiento puede no generalizar a otros dominios, idiomas o distribuciones de tareas.
- Dependencia de un simulador de usuario concreto: el entrenamiento usó GPT-4.1-mini como simulador, lo que puede introducir sesgos hacia ese estilo de interacción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n74-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: no disponible en la información proporcionada
- Codebase OEL (LMOps): no disponible en la información proporcionada
- Paper de OPSD: no disponible en la información proporcionada
