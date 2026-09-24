# MANGSEOK123/qwen3-4b-tau2-telecom_2_setting4_n74-1ep

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 sobre el dominio `telecom` del benchmark tau2-bench. No es un modelo generalista nuevo, sino un experimento de destilación de experiencia (etiquetado como OEL en la model card) en el que el mismo conjunto de pesos actúa simultáneamente como profesor y como alumno: el profesor recibe en el system prompt la memoria de una tarea concreta y el alumno debe reproducir la conversación sin acceso a esa memoria. El objetivo es que el modelo internalice en sus pesos los procedimientos y políticas que normalmente se inyectarían como contexto en cada llamada.

El entrenamiento es deliberadamente reducido: 72 pares tarea-memoria, batch de 6, una sola época y 12 pasos de optimización con tasa de aprendizaje constante de 3e-6. La pérdida es una KL completa sobre todos los tokens de respuesta (`kl_topk` 256) y no se utiliza ninguna señal de recompensa. Con 4.411.424.256 parámetros y un repositorio de 8,8 GB en safetensors, hereda la arquitectura densa y la licencia Apache-2.0 del modelo base.

Su interés es metodológico más que de rendimiento: permite estudiar si un modelo de 4B puede absorber conocimiento procedimental de tareas de agente mediante destilación KL sobre el profesor, sin RL. El propio autor indica que el modelo no fue evaluado tras el entrenamiento, por lo que cualquier uso en producción exige una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3; ajuste fino de Qwen/Qwen3-4B-Instruct-2507 |
| Parámetros totales | 4.411.424.256 (≈4,4B) |
| Parámetros activos | No aplica (modelo denso, sin capas MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo oficial de despliegue usa `--max-model-len 40960` |
| Tipos de cuantización | No se publican pesos cuantizados (ni GGUF ni GPTQ/AWQ). El repositorio contiene pesos en safetensors a precisión completa/bf16 (8,8 GB para 4,41B parámetros) |
| Idiomas soportados | No declarados en la model card (hereda los del modelo base, no verificados en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso decoder-only de la familia Qwen3, sin mezcla de expertos ni capas recurrentes. El ajuste no modifica la topología de la red, solo los pesos. El identificador del repositorio codifica la configuración experimental (`telecom_2_setting4_n74-1ep`), aunque la model card describe 72 pares de entrenamiento, no 74, y una única época.

El procedimiento de destilación consiste en lo siguiente: el alumno reproduce cada tarea sin memoria en el prompt; el profesor son los mismos pesos con la memoria de esa tarea inyectada en el system prompt. Solo difiere el prompt entre ambos, y no se emplea recompensa alguna. Los hiperparámetros son batch size 6, 1 época, learning rate 3e-6 constante, gradient clipping 1.0 (valor por defecto de verl) y pérdida KL completa sobre todos los tokens de respuesta con `kl_topk` 256. El simulador de usuario fue gpt-4.1-mini con temperatura 0. La dinámica de entrenamiento reportada es la siguiente:

| Paso | Pérdida KL | Entropía | Norma del gradiente |
|---|---|---|---|
| 1 | 0,032 | 0,079 | 13,128 |
| 2 | 0,028 | 0,108 | 8,678 |
| 3 | 0,013 | 0,513 | 1,865 |
| 4 | 0,012 | 0,502 | 0,970 |
| 5 | 0,010 | 0,360 | 0,749 |
| 6 | 0,017 | 0,341 | 2,415 |
| 7 | 0,045 | 0,140 | 8,076 |
| 8 | 0,090 | 0,108 | 6,857 |
| 9 | 0,060 | 0,112 | 5,150 |
| 10 | 0,017 | 0,506 | 8,958 |
| 11 | 0,017 | 0,323 | 2,048 |
| 12 | 0,016 | 0,453 | 1,190 |

El autor advierte explícitamente de que cada paso lee un batch distinto, de modo que la columna de pérdida refleja la dificultad del batch y no una curva de convergencia. No se documentan composición del dataset más allá de los 72 pares, ni fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional orientada a diálogo de atención al cliente en el dominio de telecomunicaciones.
- Ejecución de flujos de agente multi-turno con uso de herramientas, según el ejemplo oficial de vLLM con `--enable-auto-tool-choice` y `--tool-call-parser hermes`.
- Internalización de memoria de tarea: el modelo ha sido entrenado para resolver tareas sin que la memoria correspondiente aparezca en el system prompt.
- Seguimiento de políticas y procedimientos específicos de dominio, aprendidos por imitación de la distribución del profesor.
- Razonamiento multi-paso dentro de una conversación de soporte (diagnóstico, aplicación de políticas, resolución).
- Herencia de las capacidades generales del base Qwen3-4B-Instruct-2507 (comprensión lectora, generación de texto y capacidades multilingües del modelo original), aunque no verificadas tras el ajuste.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) específicas de este ajuste.

## Casos de uso

- Agente de atención al cliente en telecomunicaciones: el modelo está entrenado sobre el dominio `telecom` de tau2-bench, que modela conversaciones de soporte con verificación de identidad, consultas de facturación y cambios de plan; es el escenario para el que existe evidencia de entrenamiento.
- Evaluación y reproducción de experimentos en tau2-bench: sirve como punto de comparación para medir cuánto aporta la destilación de experiencia frente al base (avg 0,056 / pass@4 0,175 en el test split de telecom).
- Investigación en destilación de experiencia: el par profesor/alumno comparte pesos y solo difiere en el prompt, lo que lo convierte en un banco de pruebas controlado para estudiar internalización de contexto sin señal de recompensa.
- Reducción de coste de prompt en producción: si la memoria de tarea se internaliza de forma efectiva, se eliminan los tokens de política del system prompt en cada llamada, lo que reduce coste y latencia de prefill.
- Despliegue de un agente de soporte con tool calling en vLLM: con el parser `hermes` y `--enable-auto-tool-choice` puede integrarse en un servicio HTTP que consulte sistemas de facturación, CRM o inventario.
- Generación de datos sintéticos para dominios verticales: al imitar el estilo del profesor con memoria, puede producir diálogos etiquetados útiles para otros pipelines de ajuste en el sector telco.
- Triaje en arquitecturas multiagente: por su tamaño de 4,4B puede actuar como primer nivel de clasificación y enrutado antes de derivar a un modelo mayor.
- Experimentos académicos de bajo coste: cabe en una única GPU de consumo, lo que facilita replicar estudios de destilación sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este modelo en la información disponible. El autor indica que el modelo se subió inmediatamente después del entrenamiento y que no fue evaluado. Como referencia, la model card proporciona las cifras del modelo base:

| Modelo | Conjunto | Métrica | Resultado |
|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | tau2-bench telecom, test split | avg | 0,056 |
| Qwen3-4B-Instruct-2507 (base) | tau2-bench telecom, test split | pass@4 | 0,175 |
| Este modelo | tau2-bench telecom | No evaluado | no disponible |

No se dispone de MMLU, HumanEval, GSM8K ni de ningún otro resultado para este ajuste.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 8,8 GB, a los que hay que sumar el KV cache y el overhead del runtime; con 40.960 tokens de contexto configurados la reserva de memoria crece de forma apreciable.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM (RTX 4090, RTX 4080, A100 40 GB, H100). Con 24 GB (RTX 3090/4090) hay margen suficiente para bf16 con contextos largos.
- GPU de consumo: sí, cabe en GPU de consumo. En tarjetas de 8-12 GB sería necesario cuantizar a 8 o 4 bits, pero el repositorio no publica pesos cuantizados, por lo que habría que generarlos.
- Opciones de despliegue: vLLM es la ruta documentada por el autor (`vllm serve MANGSEOK123/qwen3-4b-tau2-telecom_2_setting4_n74-1ep --enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`). Al ser un modelo Qwen3 estándar en safetensors, también es compatible con TGI, SGLang o llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el parser de herramientas `hermes` es requisito para que el tool calling funcione; sin él, las llamadas a funciones pueden no parsearse correctamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | tau2-bench telecom | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (qwen3-4b-tau2-telecom, setting4, n74, 1ep) | 4,41B | No especificado (ejemplo con 40.960) | Apache-2.0 | No evaluado | HuggingFace, 0 descargas, 0 likes |
| Qwen3-4B-Instruct-2507 (modelo base) | ≈4,4B | No disponible en esta ficha | Apache-2.0 | avg 0,056 / pass@4 0,175 | HuggingFace |
| Qwen2.5-7B-Instruct (alternativa de tamaño superior) | no disponible | no disponible | Apache-2.0 | no disponible | HuggingFace |
| Llama-3.2-3B-Instruct (alternativa de tamaño inferior) | no disponible | no disponible | Llama 3.2 Community License | no disponible | HuggingFace |

Los datos del modelo base proceden de la model card del autor. El resto de la comparativa se apoya en la documentación pública de cada modelo y no se ha verificado en esta ficha; no se dispone de resultados comparables en tau2-bench telecom para las alternativas.

## Limitaciones y advertencias

- Modelo no evaluado: el autor lo subió inmediatamente después del entrenamiento, sin medir el efecto del ajuste. No hay evidencia de mejora sobre el base en ninguna tarea.
- Entrenamiento con 72 pares y 12 pasos: el riesgo de sobreajuste al conjunto concreto de tareas es alto, y es esperable degradación del comportamiento fuera del dominio `telecom`.
- Riesgo de fuga del conjunto de tareas: al internalizar memorias de tareas específicas, el modelo puede reproducir procedimientos concretos del conjunto de entrenamiento; conviene verificar el solapamiento con el test split antes de reportar cualquier resultado en tau2-bench.
- Alucinación: en un dominio procedimental como el soporte telco, la generación de políticas o pasos inexistentes puede tener consecuencias operativas directas; se recomienda validación contra fuentes autoritativas.
- Idiomas: no declarados. No hay garantía de que el comportamiento aprendido se transfiera a conversaciones en castellano.
- Sesgos: no se ha publicado ningún análisis de sesgo, toxicidad o comportamiento diferencial por segmento de usuario.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero no exime de responsabilidad sobre el comportamiento del modelo en producción ni sobre los datos con los que se haya ajustado.
- Discrepancia en el identificador: el nombre del repositorio indica `n74` mientras que la model card describe 72 pares; conviene tratarlo como un detalle sin confirmar.
- Sin cuantizaciones publicadas: desplegarlo en hardware limitado exige generar los pesos cuantizados por cuenta propia y validar la pérdida de calidad resultante.
- Simulador de usuario basado en gpt-4.1-mini: la calidad del ajuste depende del comportamiento y de los sesgos de ese simulador.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de redactar esta ficha, sin mantenimiento demostrable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_2_setting4_n74-1ep
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Benchmark tau2-bench (referencia del dominio `telecom`): https://github.com/sierra-research/tau2-bench
- Paper de tau2-bench, blog del autor o repositorio de entrenamiento: no disponibles en la información proporcionada.
