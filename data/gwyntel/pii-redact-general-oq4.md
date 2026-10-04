# gwyntel/PII-Redact-General-oQ4

## Resumen

PII-Redact-General-oQ4 es una cuantización de 4 bits del modelo OpenPipe/PII-Redact-General, publicada por el usuario gwyntel en HuggingFace. Se trata de un modelo especializado en la detección y redacción de información de identificación personal (PII) en texto, no de un modelo de propósito general: su función es señalar y sustituir entidades sensibles (nombres, direcciones, identificadores, etc.) dentro de flujos de datos. El repositorio ocupa 0,7 GB y declara 1.235.814.400 parámetros totales en safetensors, lo que lo sitúa en la gama de ~1,2 mil millones de parámetros.

La pieza diferencial no es el modelo en sí, sino el proceso de cuantización: se ha generado con oQ (oMLX v0.7.0), un esquema de cuantización de precisión mixta, en formato MLX safetensors con 4 bits y tamaño de grupo 64. Esto implica que el modelo está pensado para ejecutarse sobre Apple Silicon mediante el servidor oMLX, y no mediante los runners habituales de CUDA. El autor lo distribuye como componente de un fork específico (pii-redact-mlx) que empareja este modelo con un segundo modelo ("Name model") y gestiona el etiquetado, la redacción y la sustitución por datos falsos.

Su relevancia es práctica: permite desplegar un pipeline de anonimización de datos en hardware de consumo (portátiles Mac) sin depender de APIs externas, algo crítico cuando el propio material a redactar es sensible y no puede salir de la organización. La validación publicada por el autor sobre un conjunto etiquetado de 18 documentos indica que la cuantización conserva el recall del modelo de precisión completa, con una pérdida pequeña pero medible en precisión y F1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (tipo declarado en la model card); transformer decoder-only. La arquitectura exacta del modelo base no se detalla en la información disponible |
| Parametros totales | 1.235.814.400 (~1,24 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, tamaño de grupo 64, precisión mixta (oQ / oMLX v0.7.0). Formato MLX safetensors. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la validación publicada se realizó sobre documentos en inglés) |
| Licencia | no disponible (ni la model card ni los metadatos del repositorio la especifican) |
| Formato de pesos | safetensors (MLX), etiquetado como `mlx`, `oq`, `quantized` |

Otros datos del repositorio: descargas 0, likes 0, pipeline no declarado, modelo base OpenPipe/PII-Redact-General, creado el 2026-10-03 y actualizado el 2026-10-03 según los metadatos de HuggingFace.

## Arquitectura y entrenamiento

La model card únicamente declara `Model type: llama`, por lo que la arquitectura de referencia es un transformer decoder-only de tipo Llama. No se especifica en la información disponible el número de capas, dimensión oculta, cabezas de atención, tipo de positional encoding ni si se emplearon variantes como GQA. Tampoco se documentan los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de SFT, RLHF o DPO), ni si el ajuste se hizo específicamente para la tarea de redacción de PII. Todo ello queda como no disponible.

Lo que sí está documentado es el proceso de cuantización posterior: se aplicó oQ (oMLX v0.7.0), un esquema de precisión mixta que asigna distintos niveles de cuantización según la sensibilidad de cada capa, con 4 bits y tamaño de grupo 64. El resultado se serializa en safetensors para el runtime MLX. No se han publicado detalles sobre qué capas quedaron en mayor precisión ni sobre el error de reconstrucción introducido.

El otro elemento técnico relevante es el pipeline de uso: el fork pii-redact-mlx combina este modelo con un "Name model" separado. Es decir, la redacción no recae en un único modelo, sino en una orquestación de dos: uno para nombres y otro para el resto de categorías de PII, más lógica de etiquetado y sustitución por datos sintéticos. El fork ofrece también un backend basado en `transformers`/torch, inferencia concurrente y un arnés de validación etiquetado.

## Capacidades

- Detección y redacción de información de identificación personal (PII) en texto, que es la tarea para la que fue ajustado el modelo base.
- Sustitución de entidades detectadas por datos falsos, no solo eliminación, según se describe en el flujo del fork pii-redact-mlx.
- Procesamiento de trazas y ficheros JSONL por lotes mediante la CLI `pii-redact convert-traces`, con opción `--auto-max-tokens`.
- Trabajo conjunto con un "Name model" complementario para el tratamiento específico de nombres propios.
- Inferencia concurrente a través del backend oMLX.
- Ejecución local sobre Apple Silicon, sin envío de datos a servicios externos.
- Generación de texto general: no disponible; no hay evidencia en la información proporcionada de que el modelo conserve capacidades conversacionales amplias tras el ajuste.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Soporte multilingüe: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio solo contiene pesos de lenguaje.

## Casos de uso

- Redacción de trazas de agentes y logs de aplicaciones: la CLI del fork acepta ficheros JSONL de entrada y salida, de modo que se pueden procesar por lotes las trazas que genera un agente antes de almacenarlas o enviarlas a un sistema de observabilidad, evitando que datos personales de usuarios acaben en la plataforma de telemetría.
- Cumplimiento del RGPD en pipelines de datos: antes de que un fichero con conversaciones de clientes entre en un data lake o en un sistema de analítica, el modelo marca y sustituye identificadores, reduciendo la exposición de datos personales en entornos con requisitos de minimización.
- Anonimización de datasets de entrenamiento: para equipos que quieren reutilizar corpus propios (tickets de soporte, correos, transcripciones) en el ajuste de otros modelos, este modelo actúa como paso previo de limpieza, con la ventaja de poder ejecutarse en local sobre el propio material sensible.
- Preprocesado de conversaciones de atención al cliente: los historiales multi-turno contienen nombres, teléfonos, direcciones y números de pedido; el pipeline puede etiquetar y reemplazar esas entidades antes de pasar el texto a sistemas de análisis de calidad.
- Documentación legal y expedientes: redacción de contratos, reclamaciones o informes antes de compartirlos con terceros (asesorías, peritajes, proveedores), manteniendo la estructura del texto y sustituyendo los datos identificativos.
- Entornos con restricción de salida de datos: al ejecutarse sobre MLX en un Mac, encaja en organizaciones que no pueden usar APIs en la nube para procesar material confidencial, por ejemplo en sanidad o en departamentos jurídicos internos.
- Sanitización de datos en pruebas y desarrollo: generar copias de bases de datos o ficheros de ejemplo con datos falsos coherentes para entornos de staging, a partir de datos de producción previamente redactados.

## Benchmarks y rendimiento

El autor publica una única validación, realizada sobre un conjunto etiquetado de 18 documentos. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros); para esos casos, no hay datos disponibles.

| Métrica (18 documentos etiquetados) | oQ4 (este modelo) | Precisión completa (referencia) |
|---|---|---|
| Recall | Igual que el modelo de precisión completa | Línea base |
| F1 | 0,816 | 0,833 |
| Precisión | 0,870 | 0,909 |

Lectura de los datos: la cuantización a 4 bits no degrada el recall, es decir, no se pierden entidades que el modelo completo sí detectaba, pero sí introduce una pérdida de precisión de 0,039 puntos, lo que se traduce en un aumento de falsos positivos. Con solo 18 documentos, el tamaño de muestra es reducido y no permite extraer conclusiones robustas sobre el comportamiento en dominios distintos al evaluado.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con 1,24 mil millones de parámetros a 4 bits, los pesos ocupan aproximadamente 0,6-0,7 GB (el repositorio completo pesa 0,7 GB). Sumando overhead de runtime, buffers y estado de inferencia, hay que prever del orden de 1,5-3 GB de memoria.
- Cabe holgadamente en GPUs de consumo y en equipos Apple Silicon. Cualquier Mac con 16 GB de memoria unificada (series M1, M2, M3, M4) es suficiente; en configuraciones de 8 GB puede ser ajustado pero probablemente viable dado el tamaño del modelo.
- GPU recomendadas: no hay recomendaciones oficiales. El formato MLX está orientado a Apple Silicon; para CUDA haría falta convertir los pesos a otro formato (por ejemplo, mediante el backend `transformers`/torch que menciona el fork), y en ese caso servirían desde una RTX 3060/4060 en adelante.
- Opciones de despliegue: servidor oMLX (el escenario previsto por el autor, escuchando por defecto en `http://localhost:27473/v1`), y backend `transformers`/torch con el fork pii-redact-mlx. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son utilizables directamente sin conversión. vLLM y TGI no soportan el formato MLX tal cual.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento en redacción de PII |
|---|---|---|---|---|---|
| PII-Redact-General-oQ4 (este) | 1.235.814.400 | no disponible | MLX safetensors 4 bits | no disponible | F1 0,816; precisión 0,870; recall igual a precisión completa (18 documentos) |
| OpenPipe/PII-Redact-General (modelo base) | no disponible (el cuantizado declara 1.235.814.400) | no disponible | safetensors sin cuantizar | no disponible | F1 0,833; precisión 0,909 (referencia de la validación del autor) |
| Alternativas de propósito general del mismo orden (por ejemplo, Llama 3.2 1B Instruct o Qwen2.5 1.5B Instruct) | ~1,2-1,5 mil millones | no disponible en esta ficha | safetensors, GGUF | licencias propias de cada modelo | no disponible: no son modelos ajustados para redacción de PII y no hay comparación publicada en la fuente consultada |

No se dispone de otros modelos especializados en redacción de PII con datos comparables en la información consultada, por lo que la comparativa se limita al par cuantizado/base y a una referencia genérica de tamaño.

## Limitaciones y advertencias

- Licencia no especificada: ni el repositorio ni la model card indican licencia. Esto bloquea en la práctica cualquier uso comercial o distribución hasta que se aclare, y es un riesgo legal relevante si se integra en un producto.
- Evaluación muy limitada: la validación se apoya en 18 documentos etiquetados. No hay evidencia sobre dominios distintos (texto médico, jurídico, técnico), ni sobre idiomas distintos del inglés, ni sobre textos largos.
- Pérdida de precisión por cuantización: la precisión baja de 0,909 a 0,870 respecto al modelo de precisión completa, lo que implica más falsos positivos (datos no personales marcados como PII). En un pipeline de anonimización esto suele ser aceptable, pero degrada la calidad del texto resultante.
- Riesgo de falsos negativos no medido: el recall se mantiene en el conjunto evaluado, pero no hay garantía de que se mantenga en textos con formatos poco habituales de identificadores (IBAN, documentos de identidad de distintos países, matrículas).
- Riesgo de alucinación: como cualquier modelo generativo, puede introducir sustituciones incorrectas o inventar entidades al generar los datos falsos de reemplazo. La salida debería validarse antes de darla por buena en contextos con consecuencias legales.
- Dependencia del ecosistema MLX: los pesos solo son utilizables de forma directa en Apple Silicon con oMLX. Esto limita el despliegue en infraestructura de servidores Linux con GPU y complica el escalado horizontal.
- Dependencia de un segundo modelo: el flujo previsto requiere el "Name model" complementario y el fork pii-redact-mlx; el modelo por sí solo no cubre todas las categorías.
- Soporte ecosistémico mínimo: 0 descargas y 0 likes en el momento de la consulta, y un único autor. No hay comunidad que valide los resultados ni mantenimiento garantizado.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (2026-10-03) son posteriores a la fecha de esta ficha, lo que sugiere un error en el registro o en el reloj del sistema que lo publicó; conviene verificarlo antes de tratar el repositorio como referencia estable.
- Idiomas: no se declara soporte multilingüe. Un uso en castellano requeriría validación específica, ya que los patrones de PII (DNI, NIE, IBAN español con formato ES) difieren de los anglosajones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/gwyntel/PII-Redact-General-oQ4
- Modelo base: https://huggingface.co/OpenPipe/PII-Redact-General
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- Fork de redacción de PII (CLI y pipeline): https://github.com/gwyntel-git/pii-redact-mlx
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo en la búsqueda realizada; los resultados devueltos eran contenido no relacionado con el modelo y se han descartado.
