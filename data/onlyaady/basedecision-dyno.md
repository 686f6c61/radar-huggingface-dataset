# onlyaady/BaseDecision-Dyno

## Resumen

BaseDecision-Dyno es un modelo de decisión de 4.206.404.096 parámetros desarrollado por el usuario onlyaady y publicado en Hugging Face bajo licencia Apache 2.0. Se construye como un fine-tuning (con fusión de adaptadores LoRA) sobre Qwen/Qwen3.5-4B, y no está pensado para generar texto de forma autorregresiva, sino para puntuar directamente opciones de respuesta definidas por el llamante sobre un estado o documento dado. Devuelve la opción seleccionada y una probabilidad normalizada para cada opción, sin decodificar una secuencia de respuesta ni producir explicaciones.

El modelo aborda un problema concreto: la clasificación de decisiones con opciones múltiples y calibración de probabilidades en contextos estructurados (documentos, conversaciones, políticas, registros). En lugar de emplear un LLM generativo y parsear su salida, BaseDecision-Dyno realiza una pasada de scoring por pregunta sobre un backbone transformer con atención bidireccional completa y recurrencia nativa en las capas de atención lineal, con una ventana de 16.384 tokens renderizados por pregunta (incluyendo el overhead del prompt).

Su relevancia actual reside en dos elementos: por un lado, el modo "read twice" por defecto, que repite el estado y las opciones dentro de una misma secuencia renderizada antes de una única pasada de scoring, y por otro, la calibración interna aplicada tanto en modo por defecto como en modo `flash` (lectura única). El checkpoint en BF16 reporta 53,83 puntos en la suite pública completa Decision Index 0.3 usando el kit oficial de evaluación. El modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención completa bidireccional y capas de atención lineal con recurrencia nativa; sin generación autorregresiva |
| Parametros totales | 4.206.404.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens renderizados por pregunta, incluyendo overhead del prompt |
| Tipos de cuantizacion | no disponible (release validado en BF16 con readout de decisión y softmax en FP32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 8,4 GB), con código custom de modelo para `AutoModel` |
| Modelo base | Qwen/Qwen3.5-4B (fine-tune con LoRA fusionado) |
| Modalidad | solo texto |
| Opciones por pregunta | 2 a 255 a través del adaptador Decision Index evaluado |
| Precisión | backbone BF16; readout de decisión y softmax en FP32 |
| Caché de decodificación | deshabilitada (sin generación autorregresiva) |
| Pipeline | text-classification |
| Descargas | 49 |
| Likes | 0 |

## Arquitectura y entrenamiento

BaseDecision-Dyno parte de Qwen/Qwen3.5-4B y se obtiene mediante un fine-tune con adaptadores LoRA que se fusionan en un checkpoint standalone, de modo que no se requiere apilar adaptadores en tiempo de inferencia. La arquitectura resultante conserva el backbone transformer del modelo base, pero el uso es radicalmente distinto: las capas de atención completa operan de forma bidireccional y las capas de atención lineal mantienen recurrencia nativa. No hay generación autorregresiva ni caché KV de decodificación; cada pregunta se procesa en su propia secuencia y en su propio forward pass, y varias preguntas de una misma petición no comparten un único prefill.

El entrenamiento está orientado a la tarea de decisión: el modelo puntúa opciones definidas por el llamante y devuelve una distribución normalizada sobre ellas. La innovación técnica destacable es el modo "read twice" por defecto, que repite el contenido del estado y de la pregunta/opciones dentro de una misma secuencia renderizada y realiza después una única pasada de scoring por pregunta; no se trata de dos predicciones independientes, ni de votación, ni de razonamiento generado. La calibración se aplica internamente tanto en el modo por defecto como en `mode="flash"` (lectura única), y el límite de 16.384 tokens se aplica después del renderizado y de la repetición, por lo que el modo por defecto admite menos contenido original que el modo flash. Las peticiones que exceden el límite provocan un error de longitud: no hay truncamiento silencioso ni caída automática a flash. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisiones con opciones múltiples: recibe un estado (documento, conversación, política o registro estructurado) y preguntas con opciones definidas por el llamante, y devuelve la opción elegida junto con una probabilidad normalizada para cada opción.
- Preguntas de tipo `choice` con entre 2 y 255 opciones a través del adaptador Decision Index evaluado.
- Preguntas de tipo `noul` (decisión binaria), que devuelven probabilidades con claves `"true"` y `"false"`.
- Scoring directo sin generación de explicaciones ni decodificación de una secuencia de respuesta.
- Calibración interna de probabilidades en ambos modos de inferencia (read twice por defecto y flash de lectura única).
- Procesamiento de múltiples preguntas por petición, cada una en su propia secuencia y forward pass independiente.
- Interfaz estructurada `decide()` que preserva el prompt entrenado, la atención, el mapeo de opciones y la calibración.
- Capacidades multilingües: solo inglés declarado.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito según la información disponible.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia y un conjunto de equipos posibles (facturación, técnico, ventas), el modelo devuelve el equipo asignado con su probabilidad, lo que permite enrutar automáticamente y aplicar umbrales de confianza para escalar a revisión humana.
- Detección de duplicados o anomalías en facturación: con un estado que describe un cargo repetido y una pregunta binaria de tipo `noul`, se obtiene la probabilidad de que el caso sea un duplicado, adecuada para pipelines de conciliación con calibración explícita.
- Clasificación de políticas y cumplimiento normativo: a partir de un documento de política y opciones de categoría, el modelo puntúa la categoría aplicable, lo que sirve para etiquetar expedientes en flujos de compliance donde se necesita una probabilidad por clase y no una explicación generada.
- Enrutamiento en conversaciones multi-turno: el estado puede incluir el historial de la conversación y las opciones pueden ser intenciones o departamentos; la ventana de 16.384 tokens renderizados permite incluir contexto amplio, aunque el modo read twice reduce el contenido original admisible frente al modo flash.
- Extracción de decisiones en registros estructurados: sobre registros JSON o formularios serializados como texto, el modelo selecciona entre opciones predefinidas (por ejemplo, estado de aprobación o nivel de riesgo) y devuelve la distribución completa para auditoría.
- Evaluación calibrada en investigación: el modelo sirve como componente de scoring en experimentos que comparan decisiones humanas con decisiones de modelo, gracias a que expone probabilidades normalizadas por opción y a que su evaluación se realizó con el kit oficial de Decision Index 0.3.
- Moderación o filtrado con umbrales: con preguntas binarias y probabilidades calibradas, se puede fijar un umbral operativo para derivar casos dudosos a revisión, evitando el parseo frágil de salidas generativas.

## Benchmarks y rendimiento

El autor reporta una puntuación de 53,83 en la suite pública completa Decision Index 0.3, usando el kit oficial de evaluación y el checkpoint BF16 calibrado. No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Decision Index 0.3 (suite pública completa) | 53,83 | Checkpoint BF16 calibrado, kit oficial de evaluación, auto-evaluación del autor |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 8,4 GB en disco; en memoria se requiere espacio para los 4.206.404.096 parámetros en BF16 (unos 8,4 GB) más el readout de decisión y el softmax en FP32, además del overhead de activaciones para secuencias de hasta 16.384 tokens renderizados. No se dispone de cifras oficiales de VRAM pico.
- GPU validadas por el autor: NVIDIA A100-SXM4-80GB, donde se comprobó la carga del paquete y las verificaciones de protocolo por muestreo. Los ejemplos requieren una GPU NVIDIA CUDA compatible.
- Entorno validado: Python 3.12.15, PyTorch 2.14.0+cu130 y Transformers 5.17.0.
- Ajuste en GPU de consumo: no disponible en la información proporcionada; el tamaño de pesos en BF16 sugiere que cabría en GPUs con 16 GB o más, pero no hay validación publicada ni soporte de cuantización documentado.
- Opciones de despliegue: carga mediante `AutoModel.from_pretrained` con `trust_remote_code=True` y el código custom incluido; el repositorio incluye un runner JSONL persistente (`inference.py`) que mantiene el modelo residente entre peticiones. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni cuantización, compilación o batching entre peticiones en el runner.
- Latencia y throughput: no disponibles. El autor indica que el runner no habilita compilación, cuantización ni batching entre peticiones, y que cada pregunta se procesa en su propio forward pass.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos conocidos del modelo base y de BaseDecision-Dyno; las filas de alternativas se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BaseDecision-Dyno | 4.206.404.096 | 16.384 tokens renderizados por pregunta | Clasificación de decisiones con opciones y probabilidades calibradas | apache-2.0 | Hugging Face (49 descargas) |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la información | no disponible en la información | Generación de texto | no disponible en la información | Hugging Face |
| Alternativas de clasificación con opciones | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo admite inglés según la model card; no se declaran otros idiomas.
- No es un modelo generativo: no produce explicaciones, razonamiento textual ni respuestas en lenguaje natural, solo la opción seleccionada y sus probabilidades.
- El límite de 16.384 tokens se aplica tras el renderizado y la repetición del modo read twice, por lo que el contenido original admisible en el modo por defecto es menor que en modo flash. Las peticiones sobredimensionadas lanzan un error de longitud sin truncamiento ni fallback automático.
- El comportamiento de lectura doble está implementado en el código del modelo, no en el prompt del llamante; modificar el código o usar los pesos de bajo nivel puede alterar la calibración y el protocolo entrenado.
- Requiere `trust_remote_code=True` y código custom de Hugging Face Transformers; el autor recomienda revisar ese código antes de habilitarlo.
- El runner incluido no soporta compilación, cuantización ni batching entre peticiones, lo que limita el throughput en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un fine-tune de un modelo base sin datos de entrenamiento publicados, no es posible evaluar la composición del dataset ni los sesgos heredados.
- La puntuación de 53,83 en Decision Index 0.3 es una auto-evaluación del autor con el kit oficial; no se dispone de verificación independiente.
- La licencia Apache 2.0 permite uso comercial, pero debe revisarse el cumplimiento de las condiciones del modelo base Qwen/Qwen3.5-4B.
- El modelo tiene 0 likes y 49 descargas en el momento de la ficha, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onlyaady/BaseDecision-Dyno
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
