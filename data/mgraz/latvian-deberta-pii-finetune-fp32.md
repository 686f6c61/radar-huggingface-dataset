# mgraz/latvian-deberta-pii-finetune-fp32

## Resumen

Latvian DeBERTa PII native v3 FP32 es un modelo de clasificación de tokens (token classification) derivado de la familia DeBERTa, ajustado por el desarrollador mgraz para la detección y el redactado de información personal identificable (PII) en letón. El repositorio no solo incluye los pesos en FP32, sino también el tokenizador, un adaptador en Python (`pii_redactor`) y 47 ejemplos ejecutables con resultados registrados, lo que lo convierte en un paquete autocontenido de redacción offline.

El modelo resuelve un problema concreto: enmascarar entidades sensibles en textos en letón preservando el resto del contenido de forma exacta. Soporta siete etiquetas: `PERSON`, `ADDRESS`, `EMAIL`, `PERSONAL_CODE`, `PHONE`, `ID_CARD` y `PASSPORT`, todas enmascaradas por defecto. Está pensado para ejecutarse en CPU en float32, sin dependencia de red una vez cargado, lo que encaja en flujos de cumplimiento y preprocesado de datos que no pueden enviar texto a servicios externos.

La relevancia actual del modelo es acotada pero clara: cubre una lengua con poca cobertura en herramientas de PII (el letón) y ofrece un artefacto reproducible con evaluación documentada. El contexto está limitado a 512 tokens y el proyecto advierte explícitamente de que la redacción no garantiza el anonimato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa (encoder transformer para token classification); variante exacta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens; textos más largos se procesan con ventanas solapadas de stride 64 |
| Tipos de cuantización | FP32 (única versión publicada en este repo) |
| Idiomas soportados | Letón (principal); los ejemplos incluyen entradas en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder tipo DeBERTa adaptado a clasificación de tokens, con una cabeza de etiquetado sobre las representaciones contextuales para asignar una etiqueta PII (o ninguna) a cada token. El adaptador reconstruye las entidades a partir de las etiquetas y devuelve los offsets en índices de caracteres Unicode de Python (con `end` exclusivo). Para textos que exceden los 512 tokens, el pipeline aplica ventanas solapadas con stride 64 y rechaza por defecto entradas de más de 100.000 caracteres Unicode.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF o DPO (no aplicable habitualmente en token classification). La evaluación se realizó sobre un conjunto de 1.000 mensajes sintéticos en letón redactados por el autor del proyecto y revisados por él mismo; los resultados están en `evaluation_results.json` y `cpu_benchmark_verification.json`. El autor advierte que los 47 ejemplos incluidos son demostraciones y no una estimación independiente de precisión.

## Capacidades

- Detección de siete categorías de PII en texto: `PERSON`, `ADDRESS`, `EMAIL`, `PERSONAL_CODE`, `PHONE`, `ID_CARD` y `PASSPORT`.
- Redacción por sustitución de etiquetas (`[PERSON]`, `[PASSPORT]`, etc.) preservando exactamente el texto no sensible.
- Devolución de spans con etiqueta y offsets de caracteres, con opción de incluir el texto original de la entidad (`include_span_text=True`).
- Procesamiento de documentos largos mediante ventanas solapadas (stride 64) sobre el límite de 512 tokens.
- Filtrado de etiquetas: se puede limitar el enmascarado a un subconjunto de categorías.
- Ejecución offline tras la carga del modelo; inferencia en CPU float32 como configuración probada.
- Adaptador Python con control de hilos (`num_threads`), CLI (`cli.py`) y servidor HTTP local opcional.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni modo de pensamiento: es un modelo exclusivamente extractivo de etiquetado.

## Casos de uso

- Redacción de PII en expedientes internos: el adaptador procesa lotes de mensajes en letón y sustituye nombres, códigos personales y direcciones por etiquetas antes de almacenar o compartir los textos, manteniendo el resto del contenido intacto.
- Cumplimiento normativo en pipelines de datos: al ejecutarse offline en CPU, encaja en entornos donde el texto no puede salir de la infraestructura; el filtrado de etiquetas permite aplicar políticas distintas por tipo de dato.
- Preprocesado para entrenamiento de modelos: se puede aplicar como paso previo para eliminar PII de corpus en letón antes de usarlos en ajuste fino, con la cautela de validar la cobertura sobre el dominio concreto.
- Atención al cliente y registros de conversaciones: redacción de transcripciones o tickets antes de su análisis o archivado, aprovechando el procesamiento por ventanas para hilos de varios turnos.
- Anonimización de datos para investigación: preparación de muestras de mensajes en letón para estudios o demos, con revisión manual posterior dado que el autor no garantiza el anonimato.
- Integración en herramientas de edición o formularios: el servidor HTTP local opcional permite exponer el redactor a una aplicación interna que envíe texto y reciba el resultado con offsets para resaltar entidades en la interfaz.
- Auditoría de fugas de datos: ejecutar el modelo sobre exportaciones de texto para localizar patrones de PII (códigos personales, pasaportes) y revisar los spans detectados.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la etiqueta `PASSPORT` sobre el conjunto sintético de 1.000 mensajes:

| Métrica | Valor |
|---|---|
| Recall de `PASSPORT` (almacenado) | 75 % (120/160) |
| F1 de `PASSPORT` | 85,41 % |
| Conjunto de evaluación | 1.000 mensajes sintéticos en letón, revisados por el autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares. El autor indica que los 47 ejemplos incluidos son demostraciones y no una estimación separada de precisión.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no publicarse el número de parámetros; el repo ocupa 0,4 GB en FP32, lo que sugiere un modelo de tamaño moderado que cabe holgadamente en GPU de consumo.
- Configuración probada: CPU en float32, que es el valor por defecto y el único validado.
- CUDA: aceptado por el adaptador pero no probado según el autor. MPS (Apple Silicon) no está expuesto por el adaptador.
- GPU recomendadas: no disponibles; cualquier GPU con suficiente memoria para los pesos en FP32 debería servir, pero no hay validación publicada.
- Despliegue: adaptador Python propio (`pii_redactor`), CLI (`cli.py`) y servidor HTTP local opcional. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; los ejemplos incluyen tiempos registrados en `examples/results.jsonl` y en `cpu_benchmark_verification.json`, pero no se recogen cifras en la información proporcionada.
- Requisitos de entorno: Python 3.11–3.13; la instalación de dependencias necesita internet, la inferencia posterior es offline.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de PII ni con alternativas multilingües, y no se dispone de datos de parámetros, contexto o rendimiento de competidores en esta ficha.

## Limitaciones y advertencias

- Confusión entre `PASSPORT` e `ID_CARD`: el ejemplo `My passport number is LV7292723.` se etiqueta como `[ID_CARD]`. Si se filtra para enmascarar solo `PASSPORT`, los números mal clasificados pueden quedar visibles.
- Recall de `PASSPORT` del 75 % (120/160): una de cada cuatro entidades de ese tipo no se detecta en el conjunto de evaluación.
- Contexto limitado a 512 tokens; los textos largos dependen del troceado con solapamiento, lo que puede partir entidades en los bordes de ventana.
- Límite por defecto de 100.000 caracteres Unicode por entrada; las entradas mayores se rechazan.
- Evaluación sobre datos sintéticos redactados y revisados por el propio autor: no hay validación independiente ni sobre datos reales de producción.
- La redacción no garantiza el anonimato; el autor recomienda validar sobre los datos de la aplicación.
- Idiomas: el modelo está orientado al letón; los ejemplos en inglés existen, pero no se documenta cobertura multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar `ATTRIBUTION.md` y `notices/`.
- CUDA no probado y MPS no soportado por el adaptador; el rendimiento en GPU es desconocido.
- Sin datos de sesgos conocidos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mgraz/latvian-deberta-pii-finetune-fp32
- Resultados de evaluación: `evaluation_results.json` (en el repositorio)
- Verificación del benchmark en CPU: `cpu_benchmark_verification.json` (en el repositorio)
- Ejemplos de entrada: `examples/inputs.jsonl` (en el repositorio)
- Resultados registrados de los ejemplos: `examples/results.jsonl` (en el repositorio)
- Guía de configuración: `SETUP.md` (en el repositorio)
- Atribución y términos: `ATTRIBUTION.md` y `notices/` (en el repositorio)
