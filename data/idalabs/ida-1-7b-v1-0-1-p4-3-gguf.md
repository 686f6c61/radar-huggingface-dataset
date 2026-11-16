# idalabs/IDA-1.7B-v1.0.1-P4.3-GGUF

## Resumen

IDA-1.7B-v1.0.1-P4.3-GGUF es un modelo de generación de texto en formato GGUF desarrollado por IDA Labs, un proyecto experimental de asistente conversacional orientado en primer lugar al indonesio. Se trata de un ajuste fino mediante QLoRA sobre Qwen3-1.7B del equipo Qwen, con 1.720.574.976 parámetros totales y una licencia Apache 2.0 heredada del modelo base. El artefacto publicado es una cuantización Q4_K_M de 1,11 GB, generada tras fusionar el adaptador PEFT con los pesos base y convertir el resultado con llama.cpp.

El modelo se publica explícitamente como versión de investigación y evaluación: según la propia model card, no ha superado su puerta de aceptación de calidad. En una prueba ciega de 24 casos (B5), obtuvo 10 PASS, 3 PASS con notas y 11 FAIL, con 9 fallos críticos. Esta transparencia es el rasgo más destacable del lanzamiento: el autor publica métricas agregadas, checksum del fichero y limitaciones conocidas, en lugar de puntuaciones de capacidad autodeclaradas.

Por su tamaño y su enfoque idiomático, el modelo es relevante para quienes necesitan un asistente ligero en indonesio que quepa en hardware modesto y pueda ejecutarse con Ollama o llama.cpp. No obstante, sus fallos documentados en identidad propia, verificación de acciones externas y seguimiento de instrucciones lo sitúan fuera de cualquier uso en producción con decisiones de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | Indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`IDA-1.7B-v1.0.1-P4.3-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1,7 mil millones de parámetros del equipo Qwen. Sobre esa base, IDA Labs aplicó un adaptador QLoRA controlado de rango 8 (denominado P4.3) entrenado con datos privados que no se han publicado junto al modelo. El proceso de publicación consistió en fusionar el adaptador LoRA con los pesos base mediante `merge_and_unload` de PEFT, convertir el resultado a GGUF en F16 y cuantizarlo finalmente a Q4_K_M con llama.cpp.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card indica que un experimento posterior de adaptador de 12 pasos no mejoró los resultados agregados de la prueba B5, por lo que se seleccionó P4.3 como versión final. El checksum SHA-256 del fichero GGUF está publicado (`a4c4f4183ed27a84485b7289526a9100cbbf66dca10742aff612f30d08410006`), lo que permite verificar la integridad de la descarga.

## Capacidades

- Generación de texto conversacional multi-turno en indonesio e inglés.
- Asistencia tipo chat con rol de asistente personal (correo, calendario, borradores de mensajes), según los casos de evaluación del autor.
- Comprensión y generación en inglés heredada del modelo base Qwen3-1.7B.
- Formato GGUF compatible con motores de inferencia locales (Ollama, llama.cpp) y con endpoints compatibles.
- No incluye ejecución integrada de herramientas, envío de correo, acceso web ni verificación en tiempo de ejecución.
- No se documentan capacidades de visión, audio, tool calling nativo ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en indonesio: el modelo puede mantener diálogos multi-turno y generar respuestas en registro conversational, lo que permite validar flujos de producto antes de invertir en un modelo mayor.
- Evaluación comparativa de ajustes finos ligeros: sirve como referencia para investigadores que quieran medir el efecto de un adaptador QLoRA de rango 8 sobre Qwen3-1.7B en una lengua de bajos recursos.
- Despliegue local en hardware de gama baja: con 1,11 GB en Q4_K_M, puede ejecutarse en CPU o en GPU consumer para demos y pruebas de concepto sin infraestructura dedicada.
- Generación de borradores de mensajes: adecuado para experimentar con redacción asistida de correos y respuestas, siempre con revisión humana dado que la model card documenta respuestas incompletas o con detalles no solicitados.
- Investigación sobre alineación e identidad de modelo: los fallos documentados de autoidentificación (el modelo puede responder como Qwen en lugar de IDA) lo convierten en un caso de estudio útil para técnicas de consolidación de persona.
- Educación y experimentación con cuantización: el repositorio incluye checksum, Modelfile y métricas de velocidad, lo que facilita reproducir el pipeline PEFT → GGUF → Q4_K_M en entornos como Kaggle.
- Banqueo de pruebas de seguridad conversacional: sus fallos críticos conocidos permiten construir conjuntos de evaluación para detectar afirmaciones falsas de acciones completadas.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). El campo `model-index` está vacío. Los únicos datos publicados son una evaluación ciega propia y mediciones de velocidad.

| Prueba | Resultado |
|---|---|
| B5 prueba ciega (24 casos, P4.3) | 10 PASS / 3 PASS con notas / 11 FAIL |
| Fallos críticos | 9 |
| Revisor | Revisión estructurada asistida por IA, firma humana pendiente |
| Velocidad GPU (Tesla T4, Transformers + adaptador PEFT) | 13,17 tokens/s (media ponderada, 26 turnos, 1286 tokens en 97,61 s) |
| Velocidad GPU, mediana por turno | 13,43 tokens/s |
| Velocidad CPU (llama.cpp, este GGUF) | ~11 tokens/s (una sola ejecución de prueba, no reproducible) |

El autor advierte explícitamente que las mediciones en GPU con el adaptador y en CPU con el GGUF usan motores y entornos distintos y no deben compararse de forma controlada. Las métricas excluyen carga del modelo y procesamiento del prompt.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB para el fichero Q4_K_M con contexto moderado; el fichero pesa 1,11 GB y requiere espacio adicional para caché KV y overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el autor reporta pruebas en NVIDIA Tesla T4 (16 GB) en Kaggle.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- Despliegue: Ollama (con el `Modelfile` incluido), llama.cpp y runtimes compatibles con GGUF y endpoints compatibles.
- CPU: ejecutable en CPU; el autor registra ~11 tokens/s en una prueba puntual con llama.cpp, sin garantía de reproducibilidad.
- Latencia y throughput: 13,17 tokens/s de media en Tesla T4 con Transformers y el adaptador PEFT; sin datos de throughput con vLLM ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IDA-1.7B-P4.3 (este) | 1,7 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste en indonesio, experimental, sin puerta de calidad superada |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en la informacion | Apache 2.0 | Safetensors, GGUF (comunidad) | Modelo base; capacidades multilingues generales |
| Alternativas de ~1-2 B para indonesio | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparación directa con otros ajustes en indonesio de tamaño similar no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización idiomática y el adaptador QLoRA, a costa de un conjunto de evaluación pequeño y no estandarizado.

## Limitaciones y advertencias

- Modelo experimental: no ha superado la puerta de aceptación de calidad del autor; 11 de 24 casos fallaron en la prueba B5, con 9 fallos críticos.
- Puede afirmar falsamente que un correo, evento de calendario o transacción se ha completado sin prueba externa.
- Puede usar una identidad incorrecta (Qwen en lugar de IDA) durante la inferencia aislada con el GGUF.
- Se han observado imprecisiones en explicaciones científicas y en el seguimiento de instrucciones.
- Algunas respuestas de borradores de mensajes son incompletas o introducen detalles no solicitados.
- No incluye ejecución de herramientas, envío de correo, acceso web ni salvaguardas de verificación en tiempo de ejecución; el GGUF no incorpora protecciones del lado del servidor.
- El conjunto de evaluación es pequeño y revisado por IA, con firma humana pendiente; no constituye un benchmark de capacidad general.
- El dataset de entrenamiento es privado y no se ha publicado, lo que limita la reproducibilidad del ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe validar de forma independiente el comportamiento del modelo y cumplir los requisitos aplicables.
- Uso desaconsejado por el propio autor para transacciones financieras, confirmación de acciones externas, decisiones de alto riesgo y agentes autónomos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/idalabs/IDA-1.7B-v1.0.1-P4.3-GGUF
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Evidencias agregadas (BENCHMARKS.json): https://huggingface.co/idalabs/IDA-1.7B-v1.0.1-P4.3-GGUF/blob/main/BENCHMARKS.json
- Ollama: https://ollama.com/
- llama.cpp: no disponible enlace directo en la informacion proporcionada
