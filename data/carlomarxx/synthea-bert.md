# carlomarxx/synthea-bert

## Resumen

`synthea-bert` es un modelo de tipo BERT (encoder-only) entrenado sobre secuencias de eventos de salud generados por el simulador sintético [Synthea](https://github.com/synthetichealth/synthea). Ha sido desarrollado por Germans Savcisens (usuario `carlomarxx`) como material didáctico para el taller *Transformer Architectures for Computational Social Science* (ICSC 2026, Oxford). El modelo añade codificaciones temporales Time2Vec a las embeddings de entrada y está diseñado para trabajar sobre secuencias de eventos médicos, no sobre texto natural. Con solo 958.356 parámetros, es un modelo extremadamente ligero pensado para demostrar conceptos de arquitecturas transformer en datos secuenciales de salud, no para uso clínico real.

La relevancia actual radica en que ilustra cómo adaptar arquitecturas transformer a dominios estructurados (eventos discretos con marcas temporales) y en que documenta explícitamente las limitaciones de entrenar sobre datos sintéticos generados por reglas. El modelo no debe cargarse con `AutoModelForMaskedLM` estándar, sino con un loader específico incluido en el repositorio, ya que la capa Time2Vec es esencial para su funcionamiento correcto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder-only con codificaciones Time2Vec en las embeddings |
| Parametros totales | 958.356 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario de eventos de salud, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT estándar (encoder-only, masked language modeling) pero con una modificación clave: las embeddings de entrada se combinan con codificaciones temporales Time2Vec. Esto permite que el modelo capture tanto la identidad del evento como su posición temporal dentro de la secuencia. El vocabulario consta de 1036 tokens: 5 especiales, 46 de fondo (atributos estáticos del paciente: 6 rangos de edad, 2 sexos, 6 razas, 2 etnias, 5 estados civiles y 25 bins de ingresos de igual frecuencia) y el resto son tipos de eventos. Los tokens de fondo se colocan al inicio de la secuencia, siguiendo el enfoque de life2vec en lugar de usarlos como características adicionales en la salida.

El entrenamiento se realizó sobre una población sintética generada por Synthea, un simulador basado en reglas. Esto implica que las estructuras aprendidas reflejan las reglas del generador, no epidemilogía real. La model card indica que en predicción de siguiente evento el modelo alcanza un top-1 de 0.619 frente a 0.303 de un baseline bigram, mientras que en resultados escalares (probablemente regresión o clasificación sobre variables de salud) empata o pierde contra un baseline tabular simple (edad + volumen de registros). No se especifican detalles del proceso de entrenamiento (número de tokens, épocas, función de pérdida, etc.).

## Capacidades

- Modelo encoder-only para secuencias de eventos de salud (no generativo).
- Predicción de siguiente evento en una secuencia de eventos clínicos.
- Representaciones de pacientes (embeddings) que pueden usarse para tareas posteriores.
- Captura de vías de atención médica (care pathways) como calendarios de vacunación, paquetes dentales o baterías de cribado.
- Integración de atributos estáticos del paciente como tokens de fondo en la secuencia.
- No soporta tool calling, visión, audio ni razonamiento multi-paso.
- No es un modelo de lenguaje: su vocabulario son códigos de eventos, no palabras.

## Casos de uso

- **Investigación académica en ciencias sociales computacionales**: sirve como ejemplo didáctico de cómo adaptar transformers a datos de eventos secuenciales, especialmente en talleres o cursos sobre arquitecturas transformer aplicadas a dominios no lingüísticos.
- **Predicción de siguiente evento en flujos de atención simulados**: dado un historial de eventos de un paciente sintético, el modelo puede predecir cuál será el próximo evento, útil para explorar las reglas implícitas del generador Synthea.
- **Generación de embeddings de pacientes sintéticos**: las representaciones generadas pueden alimentar modelos downstream (clasificadores, regresores) para tareas de investigación sobre datos simulados, siempre que se valide que las representaciones son útiles para la tarea concreta.
- **Evaluación de la complejidad de los datos sintéticos**: comparar el rendimiento del modelo con baselines (bigram, tabular) permite cuantificar cuánta estructura secuencial hay en los datos generados por reglas.
- **Prototipado de pipelines de ML en salud**: como modelo ligero y de código abierto, puede usarse para probar infraestructuras (carga de modelos, inferencia, etc.) antes de escalar a modelos más grandes en entornos reales.
- **Material de referencia para implementaciones propias**: el código del loader (`event_bert.py`) y el enfoque Time2Vec son reutilizables para otros dominios de eventos temporales.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados:

| Tarea | Modelo synthea-bert | Baseline bigram |
|---|---|---|
| Predicción de siguiente evento (top-1) | 0.619 | 0.303 |

Además, se indica que en resultados escalares (probablemente regresión o clasificación sobre variables de salud) el modelo empata o pierde frente a un baseline tabular de edad más volumen de registros. No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) ni comparaciones con otros modelos transformer.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB (modelo de 958k parámetros, cabe en cualquier GPU moderna, incluso en CPU).
- GPU recomendada: ninguna específica; puede ejecutarse en CPU (por ejemplo, un portátil estándar) o en GPUs de gama baja (GTX 1650, RTX 3060).
- Compatible con hardware de consumo: sí, cualquier máquina con al menos 2 GB de RAM y Python.
- Opciones de despliegue: el modelo se carga con PyTorch y Transformers (usando el loader personalizado `EventBertForMaskedLM`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, pero dado el tamaño, la inferencia es prácticamente instantánea en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el ámbito de secuencias de eventos de salud con arquitectura transformer y Time2Vec. Existen trabajos como life2vec, pero no hay datos públicos de comparación directa con este modelo. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos de Synthea: las estructuras aprendidas reflejan las reglas del generador, no patrones epidemiológicos reales. No debe usarse para decisiones clínicas ni sobre datos reales sin una validación exhaustiva.
- No es un modelo de lenguaje natural: su vocabulario son códigos de eventos, por lo que no sirve para tareas de NLP.
- Requiere el loader específico (`EventBertForMaskedLM`); cargarlo con `AutoModelForMaskedLM` produce salidas aparentemente plausibles pero sin sentido, mientras la pérdida parece normal (riesgo de alucinación silenciosa).
- El vocabulario y los pesos solo son válidos como par; el parámetro `expected_vocab_size` debe coincidir con el tamaño del vocabulario del dataset asociado.
- No se han publicado resultados de benchmarks adicionales ni análisis de sesgos.
- Licencia MIT permite uso comercial, pero el autor no recomienda uso en producción sin entender las limitaciones de los datos sintéticos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/carlomarxx/synthea-bert)
- [Dataset asociado `carlomarxx/synthea-workshop-data`](https://huggingface.co/datasets/carlomarxx/synthea-workshop-data)
- [Repositorio de código `carlomarxxdk/workshop-transformers`](https://github.com/carlomarxxdk/workshop-transformers)
- [Synthea (simulador de pacientes sintéticos)](https://github.com/synthetichealth/synthea)
- [Perfil del autor en Hugging Face](https://huggingface.co/carlomarxx)
