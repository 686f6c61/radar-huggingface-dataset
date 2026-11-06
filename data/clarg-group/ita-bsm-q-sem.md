# CLArg-group/ita-bsm-q-sem

## Resumen

ITA BSM-Q (bsm-q-sem) es un modelo de puntuación base (*base score model*, BSM) para argumentación en tiempo de inferencia (*inference-time argumentation*, ITA), desarrollado por el grupo CLArg y presentado en el artículo *Neurosymbolic Learning for Inference-Time Argumentation*. No es un modelo generativo de propósito general: recibe una afirmación (*claim*) junto con un argumento que la apoya o la ataca, y devuelve una puntuación en el intervalo [0, 1] que representa la fuerza intrínseca del argumento. Esa puntuación se combina después mediante la semántica gradual DF-QuAD para calcular la fuerza agregada de la afirmación y emitir un veredicto Verdadero / Falso / Incierto.

Técnicamente es un adaptador LoRA sobre el modelo base Qwen/Qwen3-8B (8.000 millones de parámetros), al que se añade una cabeza de regresión almacenada en `regression_head.safetensors` y configurada por `model_config.json`. El repositorio ocupa 0,1 GB, lo que corresponde únicamente a los pesos del adaptador y de la cabeza, no al backbone completo. La variante se denomina **BSM-Q (primed & sem)** en el artículo: la cabeza se inicializa (*priming*) con puntuaciones obtenidas al interrogar al propio backbone y después se entrena de extremo a extremo a través de la semántica DF-QuAD con una pérdida semántica.

Su relevancia es acotada pero específica: cubre la verificación de afirmaciones con argumentos estructurados dentro de un pipeline neurosimbólico, un nicho poco cubierto por los modelos conversacionales al uso. La licencia es MIT, aunque el uso queda sujeto también a la licencia de Qwen3-8B y a los términos de los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3-8B) más cabeza de regresión |
| Parámetros totales | No disponible (el adaptador y la cabeza ocupan 0,1 GB; el backbone Qwen3-8B tiene 8.000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3-8B, no especificada en la información) |
| Tipos de cuantización | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | MIT (sujeta además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT + `regression_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer decoder preentrenado, Qwen3-8B, con un adaptador LoRA de bajo rango y una cabeza de regresión que proyecta la representación del par (claim, argumento) a un escalar en [0, 1]. La innovación no está en la arquitectura del lenguaje, sino en el procedimiento de entrenamiento neurosimbólico: la cabeza de regresión se inicializa primero con puntuaciones base generadas al pedir al propio Qwen3-8B que evalúe los argumentos, y después la cabeza y el adaptador se entrenan conjuntamente de extremo a extremo propagando el gradiente a través de la semántica gradual DF-QuAD mediante una pérdida semántica.

Los datos de entrenamiento proceden del conjunto TFU Training Claims, en concreto del fichero `training_true_false_uncertain_with_arguments_qwen.json`, con argumentos generados por Qwen3-8B para afirmaciones etiquetadas como verdaderas, falsas o inciertas. No se especifican en la información disponible el número de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO; el entrenamiento descrito es supervisado con la citada pérdida semántica.

## Capacidades

- Puntuación de argumentos: asigna a un argumento individual una fuerza intrínseca en [0, 1] condicionada a la afirmación que apoya o ataca.
- Integración en semántica DF-QuAD: sus puntuaciones alimentan el cálculo agregado de fuerza de la afirmación dentro del pipeline ITA.
- Emisión de veredictos: a través del pipeline completo, produce veredictos Verdadero / Falso / Incierto sobre afirmaciones.
- Verificación de afirmaciones (*claim verification*) con argumentos estructurados.
- Procesamiento por lotes: la herramienta `infer_on_arguments` acepta un CSV con columnas `claim,is_support,argument` y genera un CSV de puntuaciones.
- No es un modelo conversacional ni generativo de uso directo: no se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo puntúa cada argumento aportado a favor o en contra de una afirmación y el sistema DF-QuAD agrega esas puntuaciones para emitir un veredicto Verdadero / Falso / Incierto.
- Moderación de contenido argumentativo en foros: dado un hilo donde un usuario defiende o rebate una afirmación, se puntúa la fuerza de cada intervención para priorizar revisiones humanas sobre los argumentos más débiles o más sólidos.
- Investigación en argumentación computacional: sirve como componente reproducible para experimentos de semántica gradual, al estar publicado junto al repositorio que define el pipeline completo.
- Evaluación de resúmenes o respuestas generadas: se descompone una respuesta en afirmaciones y argumentos y se mide la fuerza argumentativa de cada uno antes de aceptar la salida en un sistema de control de calidad.
- Construcción de datasets etiquetados: el modelo permite anotar automáticamente la fuerza de argumentos en corpus existentes, generando puntuaciones continuas reutilizables para entrenar otros clasificadores.
- Sistemas de apoyo a la decisión con trazabilidad: al producir puntuaciones numéricas por argumento combinadas con una semántica formal, el resultado es auditable, a diferencia de un veredicto emitido directamente por un LLM.
- Análisis de debates estructurados: comparación de la solidez de los argumentos de cada parte en un debate con formato fijo, agregando puntuaciones por intervención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador y la cabeza suman 0,1 GB, pero la inferencia requiere cargar el backbone Qwen3-8B completo.
- VRAM estimada para el backbone en precisión nativa (BF16): en torno a 16 GB solo para pesos, más memoria para activaciones y contexto.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB; con 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones a partir del tamaño del backbone, no datos publicados por los autores.
- GPU recomendadas: A100 o H100 para lotes grandes y máxima comodidad; RTX 4090 (24 GB) suficiente para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16, y en GPUs de 8-12 GB si se cuantiza el backbone.
- Opciones de despliegue: el repositorio oficial (`CLArg-group/inference-time-argumentation`) con el comando `python -m ita.base_score_model.infer_on_arguments`; al ser un adaptador PEFT, puede cargarse con la librería `peft` y `transformers`, y el backbone puede servirse con vLLM o TGI si se integra la cabeza de regresión por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de puntuación de argumentos con la misma formulación neurosimbólica. La comparación más directa es con el propio backbone sin adaptar:

| Modelo | Parámetros | Contexto | Función | Licencia |
|---|---|---|---|---|
| ITA BSM-Q (bsm-q-sem) | Adaptador LoRA + cabeza sobre 8.000 M | No disponible | Puntuación de argumentos en [0, 1] | MIT |
| Qwen/Qwen3-8B (base) | 8.000 M | No disponible en esta ficha | Generación de texto y razonamiento | Según Qwen |
| LLM genérico instruido | Variable | Variable | Veredicto directo sin puntuación formal | Variable |

La diferencia clave frente a un LLM instruido es que este modelo no emite un veredicto textual, sino un escalar que se agrega con una semántica formal, lo que hace el resultado auditable y reproducible.

## Limitaciones y advertencias

- Alcance muy restringido: solo puntúa argumentos; no genera texto, no conversa y no responde preguntas de forma directa.
- Dependencia del pipeline: sin la semántica DF-QuAD y el código del repositorio, las puntuaciones aisladas tienen utilidad limitada.
- Sesgos heredados: al entrenarse sobre argumentos generados por Qwen3-8B, puede reproducir los sesgos y el estilo argumentativo del backbone y de los prompts empleados.
- Riesgo de calibración deficiente: la puntuación en [0, 1] es una estimación aprendida; no se documentan métricas de calibración ni de error en la información disponible.
- Idiomas: no se especifica qué idiomas cubre; los datos de entrenamiento parecen estar en inglés, por lo que el rendimiento en castellano es incierto.
- Licencia: MIT para los pesos, pero el uso comercial queda condicionado por la licencia de Qwen/Qwen3-8B y por los términos de los datos de entrenamiento, que deben consultarse en el repositorio.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Fecha de creación del repositorio: 5 de noviembre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-bsm-q-sem
- Repositorio del proyecto: https://github.com/CLArg-group/inference-time-argumentation
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Artículo: *Neurosymbolic Learning for Inference-Time Argumentation* (referenciado en la model card; no se proporciona URL directa en la información disponible)
