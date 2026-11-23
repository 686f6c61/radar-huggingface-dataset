# AttoFlow-AI/legal-ai-prompt-guard

## Resumen

Legal AI Prompt Guard es un clasificador de intake (admisión) de peticiones para asistentes legales, desarrollado por AttoFlow-AI. Su función no es generar texto jurídico, sino decidir si una petición entrante debe aceptarse o rechazarse antes de llegar al modelo generativo, y asignar una ruta de aplicación (`action`) para el despacho posterior. El modelo incorpora el contexto de la conversación reciente y el estado de extracción de documentos, y puede devolver una etiqueta `review` cuando la confianza es baja o la entrada excede los límites, actuando como capa de guardrails y no como generador.

Técnicamente es un modelo lineal de 8 bits con 4.096 características hasheadas, empaquetado en un `weights.json.gz` de 55,2 KB que se ejecuta con la biblioteca estándar de Python, sin dependencias de inferencia pesadas. El repositorio incluye además variantes piloto: un modelo disperso de 4 bits de 24,6 KB y dos encoders BERT Tiny en ONNX INT8 (uno entrenado sobre datos piloto y otro sobre datos expandidos). La tarea es clasificación de texto binaria (aceptar/rechazar) con enrutado asociado, y el idioma declarado es únicamente inglés.

Su relevancia actual reside en el nicho: guardrails deterministas y de huella mínima para pipelines legales, donde el coste de un falso positivo (aceptar trabajo no elegible) es alto y el despliegue en entornos restringidos o air-gapped es habitual. La licencia no está declarada en los metadatos del repositorio, lo que limita su adopción comercial sin aclaración previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo lineal de 8 bits con 4.096 características hasheadas (modelo por defecto); variantes encoder BERT Tiny en ONNX INT8 |
| Parámetros totales | No disponible (el modelo por defecto se describe como lineal de 8 bits; las variantes BERT Tiny derivan de `google/bert_uncased_L-2_H-128_A-2`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo declara límites de entrada que activan la etiqueta `review`, sin cifra publicada) |
| Tipos de cuantización | 8 bits (modelo por defecto), 4 bits (variante sparse-pilot-compressed), INT8 ONNX (variantes BERT Tiny) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible en los metadatos del repositorio; las variantes BERT Tiny incluyen la licencia Apache 2.0 del checkpoint base de Google |
| Formato de pesos | `weights.json.gz` (JSON comprimido), ONNX INT8 para las variantes BERT Tiny |

## Arquitectura y entrenamiento

El artefacto principal es un clasificador lineal de 8 bits sobre 4.096 características hasheadas, con un tamaño de 55,2 KB y ejecución mediante la biblioteca estándar de Python. Esto implica un pipeline de extracción de características por hashing, sin tokenizador subword ni red neuronal profunda en la ruta por defecto. Las variantes `bert-tiny-pilot` y `bert-tiny-expanded` son encoders BERT Tiny convertidos a ONNX INT8, derivados del checkpoint `google/bert_uncased_L-2_H-128_A-2` de Google, e incluyen tokenizador y metadatos de enrutado. Existe además una variante dispersa de 4 bits de 24,6 KB.

El corpus de entrenamiento es sintético: 10.000 ejemplos en 18 temáticas, con una mezcla autoral de 60/40 aceptar/rechazar para el perfil exclusivo de India. El modelo final se entrenó sobre 8.270 candidatos tras validar las etiquetas autorales contra «Gemini Decision 1». La release compacta se reajustó sobre ejemplos con nombres de producto ficticios. La evaluación se realizó sobre peticiones sintéticas retenidas con el perfil por defecto `general_legal`. El modelo soporta dos perfiles: `general_legal` (por defecto, trabajo legal elegible en cualquier jurisdicción) e `india_legal` (limitado a derecho indio). No se documenta RLHF ni DPO; el ajuste es supervisado sobre etiquetas de política.

## Capacidades

- Clasificación binaria de peticiones legales en aceptar o rechazar, con una decisión de admisión previa a la generación.
- Enrutado de aplicación: devuelve una `action` que el sistema anfitrión usa para despachar la petición.
- Uso de contexto conversacional: incorpora la petición actual, los turnos recientes de la conversación y el estado de extracción de documentos.
- Fallback por confianza: entradas fuera de los límites de confianza o de longitud devuelven `review` para que la política del sistema decida.
- Perfiles de política: `general_legal` por defecto e `india_legal` para restringir el alcance a derecho indio.
- Ejecución local y determinista con la biblioteca estándar de Python en la ruta por defecto, apta para entornos restringidos o air-gapped.
- No genera texto, no razona de forma multi-paso, no soporta tool calling ni function calling, y no tiene capacidades multimodales ni de audio.
- Cobertura lingüística limitada al inglés.

## Casos de uso

- Puerta de admisión en un asistente legal: el clasificador se sitúa delante del modelo generativo y rechaza peticiones no elegibles antes de consumir tokens, reduciendo coste y superficie de riesgo. Es adecuado por su latencia mínima y su ejecución sin dependencias.
- Enrutado de solicitudes a colas especializadas: la `action` devuelta permite despachar cada petición aceptada a la cola de contrato, arrendamiento, laboral o litigio, con reglas de política definidas por el despacho.
- Cumplimiento de alcance jurisdiccional: con el perfil `india_legal`, el modelo limita la operación a derecho indio y evita que el asistente responda sobre jurisdicciones fuera de alcance.
- Despliegue en entornos air-gapped o de recursos mínimos: al ejecutarse con la biblioteca estándar de Python sobre un fichero de 55,2 KB, encaja en contenedores ligeros, funciones serverless o dispositivos sin GPU.
- Moderación de conversaciones multi-turno: al incorporar turnos recientes y estado de documentos, puede detectar cuándo una conversación deriva hacia una petición no elegible y forzar `review` o rechazo.
- Capa de guardrails en pipelines de evaluación: sirve como clasificador de referencia para medir la tasa de falsos positivos de un asistente legal antes de producción, con métricas de aceptación automática y falsos aceptos ya reportadas.
- Filtrado previo en plataformas de asesoría legal B2B: descarta solicitudes de consumidores o de materias no cubiertas antes de asignar abogado, reduciendo el trabajo manual de triaje.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente, `verified: false`). La precisión binaria cuenta cada decisión aceptar/rechazar antes de que los casos de baja confianza pasen a `review`.

| Conjunto de evaluación | Precisión binaria | Acciones correctas entre rutas automáticas | Falsos aceptos automáticos |
|---|---:|---:|---:|
| Test agrupado, 238 ejemplos | 93,7 % (223/238) | 203 de 213 | 3 |
| Challenge independiente, 138 ejemplos | 87,7 % (121/138) | 106 de 113 | 1 |

No se han publicado resultados de benchmarks en la información disponible para tareas estándar (MMLU, HumanEval, GSM8K u otras); las métricas anteriores son específicas de la tarea de admisión legal sobre el dataset del autor.

## Requisitos de hardware

- VRAM estimada: 0 GB para el modelo por defecto (ejecución en CPU con la biblioteca estándar de Python); las variantes BERT Tiny en ONNX INT8 requieren un consumo mínimo de memoria, no cuantificado en la información disponible.
- GPU recomendadas: no se requiere GPU para el modelo por defecto; las variantes ONNX pueden ejecutarse en CPU o en cualquier GPU compatible con ONNX Runtime.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el artefacto principal ocupa 55,2 KB y la variante dispersa 24,6 KB.
- Opciones de despliegue: ejecución directa con `python -m legal_gate` desde el repositorio fuente; las variantes ONNX son compatibles con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (lineal sobre características hasheadas), se espera una latencia muy baja, pero no se publica cifra concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Legal AI Prompt Guard (AttoFlow-AI) | Clasificador lineal 8 bits + variantes BERT Tiny ONNX | No disponible (55,2 KB en disco) | No disponible | No disponible | Hugging Face, 0 descargas |
| Llama Guard (Meta) | Clasificador de seguridad basado en LLM | No disponible en esta ficha | No disponible | No disponible | No disponible en esta ficha |
| BERT Tiny (Google) | Encoder transformer | 4,4 M aprox. (L-2, H-128, A-2) | 512 tokens (típico de BERT) | Apache 2.0 | Hugging Face |
| Clasificadores de guardrails genéricos (p. ej. prompt-injection detectors) | Variados | Variados | Variados | Variadas | Variados |

La comparación directa con Llama Guard u otros guardrails de propósito general no está disponible en la información proporcionada; este modelo se distingue por su especialización en admisión legal y su huella mínima, no por rendimiento generalista.

## Limitaciones y advertencias

- Licencia no declarada en los metadatos del repositorio: no se puede confirmar el uso comercial sin aclaración del autor. Las variantes BERT Tiny conservan la licencia Apache 2.0 del checkpoint base de Google.
- Entrenamiento exclusivamente sintético (10.000 ejemplos, 18 temáticas): el rendimiento sobre peticiones reales de producción puede diferir; el propio autor advierte que las tasas de error pueden cambiar con la mezcla operativa real.
- Cobertura lingüística limitada al inglés: no apto para peticiones en castellano u otros idiomas sin evaluación adicional.
- Sesgo de dominio: el perfil `india_legal` está calibrado sobre una mezcla autoral 60/40 aceptar/rechazar específica de India; el perfil `general_legal` no documenta calibración por jurisdicción.
- Riesgo de falsos aceptos: se reportan 3 falsos aceptos automáticos en el test agrupado y 1 en el challenge, es decir, peticiones no elegibles que pasarían la puerta sin revisión.
- Las métricas están declaradas por el autor y marcadas como no verificadas (`verified: false`); no hay evaluación independiente.
- El modelo no genera respuestas ni aplica grounding: el asistente legal anfitrión debe aplicar sus propias reglas de permisos y seguridad posterior sobre el trabajo aceptado.
- Los umbrales de confianza y los límites de longitud de entrada no se publican con cifras concretas, lo que dificulta reproducir el comportamiento de `review`.
- Repositorio con 0 descargas y 1 like: ecosistema mínimo, sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AttoFlow-AI/legal-ai-prompt-guard
- Dataset: https://huggingface.co/datasets/AttoFlow-AI/legal-ai-prompt-guard
- Repositorio fuente y guía de uso: https://github.com/NoelShallum/legal-ai-prompt-guard
- Informe de benchmarks: https://github.com/NoelShallum/legal-ai-prompt-guard/blob/main/RESULTS.md
- Checkpoint base BERT Tiny: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
