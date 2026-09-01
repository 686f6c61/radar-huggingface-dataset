# oddadmix/Nawah-RuleCheck-1M

## Resumen

Nawah-RuleCheck-1M es un clasificador de secuencias en árabe, desarrollado por oddadmix (Ahmed Wasfy), que determina si un texto cumple o no una regla escrita en lenguaje natural. El modelo recibe un par texto-regla y devuelve una etiqueta binaria: "مطابق" (cumple) o "مخالف" (no cumple). Está diseñado para tareas de verificación de reglas, cumplimiento normativo y moderación de contenido en árabe, con un tamaño extremadamente reducido que permite su despliegue en dispositivos con recursos limitados.

Con 1.073.504 parámetros y un archivo de pesos de solo 4,30 MB, el modelo se basa en una arquitectura transformer de 4 capas con tamaño oculto 32, implementada como `LlamaForSequenceClassification`. El 95,4% de los parámetros corresponden a la tabla de embeddings (32.000 × 32), lo que refleja que la capacidad de razonamiento real es muy limitada. Forma parte de una escalera de cuatro modelos (500K, 1M, 5M y 51M) entrenados con los mismos datos y evaluados con el mismo harness, lo que permite estudiar cómo el tamaño afecta a la robustez ante reformulaciones de reglas.

La relevancia de este modelo radica en su aplicabilidad para verificación de reglas en árabe en entornos on-device, donde el peso y la latencia son críticos. Sin embargo, sus limitaciones son notables: solo cubre 19 reglas decidibles desde la propia cadena de texto, y su rendimiento cae significativamente cuando las reglas se expresan con vocabulario no visto durante el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForSequenceClassification (transformers), 4 capas, hidden size 32 |
| Parametros totales | 1.073.504 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en la arquitectura Llama, con 4 capas transformer y tamaño oculto de 32. La cabeza de clasificación realiza pooling sobre el último token no-pad de la secuencia de entrada, que sigue el formato `النص: {texto}\nالقاعدة: {regla}` con `add_special_tokens=False`. De los 1.073.504 parámetros totales, solo 49.504 corresponden al cuerpo transformer; los 1.024.000 restantes (95,4%) son la tabla de embeddings de 32.000 × 32. Esta distribución implica que la capacidad de razonamiento del modelo es mínima y que la mayor parte de los parámetros se dedican a representar el vocabulario árabe.

El entrenamiento se realizó sobre el dataset `oddadmix/arabic-rule-checking`, que contiene 19 reglas decidibles a partir de la propia cadena de texto (presencia de números, teléfonos, URLs, fechas, precios, límites de palabras, etc.). El modelo base es `oddadmix/Emhotob-1M-v2`, un modelo de lenguaje árabe entrenado desde cero. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado estándar para clasificación de secuencias. El dataset incluye textos de 1 a 3 líneas de documentos de negocio árabes (anuncios clasificados, tickets de soporte, ofertas de trabajo, quejas, listados de alquiler) de nueve regiones.

## Capacidades

- Clasificación binaria de cumplimiento de reglas: dado un texto y una regla en árabe natural, devuelve si el texto cumple o no la regla.
- Soporte de 19 reglas específicas: termina con pregunta, tiene número, no email, no URL, no latín, tiene fecha, tiene precio, no teléfono, tiene teléfono, tiene ciudad, límites de palabras (mínimo y máximo de 15, 20, 25, 30, 40, 50), no puntuación excesiva.
- Funciona exclusivamente con texto en árabe; no soporta otros idiomas.
- No es generativo: no produce texto, solo clasifica.
- No soporta tool calling, agentes, razonamiento multi-paso ni visión.
- Diseñado para inferencia on-device gracias a su tamaño reducido (4,30 MB) y baja latencia.

## Casos de uso

- Moderación de contenido en plataformas árabes: verificar que anuncios clasificados o publicaciones de usuarios no contengan números de teléfono, URLs, correos electrónicos o caracteres latinos, aplicando reglas predefinidas en tiempo real.
- Validación de formularios y entradas de usuario: comprobar que un campo de texto cumple requisitos de formato, como presencia de fecha, precio o ciudad, o límites de longitud (mínimo/máximo de palabras), antes de aceptar el envío.
- Filtrado de tickets de soporte: detectar automáticamente si un ticket de atención al cliente incluye información de contacto no permitida (teléfono, email) o si cumple con la política de contenido de la empresa.
- Cumplimiento normativo en publicaciones: aplicar reglas de negocio sobre contenido generado por usuarios en árabe, como prohibición de enlaces o de puntuación excesiva, en aplicaciones móviles o web.
- Control de calidad de datos: validar que descripciones de productos o listados cumplan con reglas de contenido y longitud en sistemas de comercio electrónico, reduciendo la revisión manual.
- Automatización de políticas de contenido en dispositivos edge: desplegar el modelo en aplicaciones móviles o dispositivos IoT para verificar reglas de forma local, sin conexión a servidores, gracias a su peso de 4,30 MB y latencia de ~0,55 ms en CPU.

## Benchmarks y rendimiento

La model card incluye resultados de una evaluación sistemática con cuatro conjuntos de prueba: "seen wording" (textos no vistos con redacción de reglas similar al entrenamiento), "unseen wording" (textos no vistos con redacción de reglas no vista), "minimal pairs" (pares de texto donde una edición quirúrgica invierte el veredicto) y "hand-written wording" (reglas redactadas desde cero con vocabulario coloquial). La siguiente tabla compara este modelo con los otros peldaños de la escalera y con la línea base de mayoría.

| Modelo | Parametros | Peso | Seen wording | Unseen wording | Minimal pairs | Hand-written wording | CPU ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nawah-RuleCheck-500K | 518.256 | 2,08 MB | 0,9866 | 0,9778 | 0,9926 | 0,5558 | 0,32 |
| **Nawah-RuleCheck-1M (este)** | **1.073.504** | **4,30 MB** | **0,9952** | **0,9864** | **0,9991** | **0,7708** | **0,55** |
| Nawah-RuleCheck-5M | 5.080.704 | 20,33 MB | 0,9979 | 0,9949 | 0,9926 | 0,8642 | 1,06 |
| Nawah-RuleCheck-v2 | 51.787.264 | 207,16 MB | 0,9928 | 0,9799 | 0,9981 | 0,8667 | 16,42 |
| Linea base de mayoria | — | — | 0,6401 | 0,6401 | 0,5000 | 0,5925 | — |

*CPU ms: ejemplo individual, batch 1, float32, 2 hilos, mediana de 200 ejecuciones. En RTX 5090, este modelo tarda 1,53 ms.*

La precisión por regla en "unseen wording" es alta para la mayoría de reglas, pero baja en las de conteo de palabras:

| Regla | Precisión (unseen wording) |
|---|---:|
| ends_question | 1,000 |
| has_number | 1,000 |
| no_email | 1,000 |
| no_url | 1,000 |
| no_latin | 0,998 |
| has_date | 0,998 |
| has_price | 0,998 |
| no_phone | 0,996 |
| has_phone | 0,994 |
| has_city | 0,991 |
| max_words_30 | 0,978 |
| no_excess_punct | 0,930 |
| min_words_15 | 0,929 |
| max_words_25 | 0,900 |
| min_words_20 | 0,886 |
| max_words_50 | 0,884 |
| min_words_25 | 0,875 |
| max_words_40 | 0,826 |
| min_words_30 | 0,821 |

En "hand-written wording" (redacción desde cero), la precisión cae drásticamente en varias reglas:

| Regla | Precisión (hand-written wording) |
|---|---:|
| no_url | 1,000 |
| has_price | 1,000 |
| no_excess_punct | 0,992 |
| has_date | 0,950 |
| no_email | 0,875 |
| has_number | 0,858 |
| no_latin | 0,667 |
| ends_question | 0,592 |
| no_phone | 0,533 |
| has_phone | 0,242 |

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en float32 (4,30 MB de pesos), por lo que cabe en cualquier dispositivo, incluidos microcontroladores con suficiente memoria.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Si se usa GPU, cualquier modelo moderno (RTX 5090, A100, etc.) es válido, aunque la latencia en GPU (1,53 ms) es mayor que en CPU (0,55 ms) debido al overhead de transferencia.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 1 GB de VRAM es más que suficiente.
- Opciones de despliegue: transformers (Python), text-embeddings-inference (mencionado en los tags), endpoints compatibles con Hugging Face. También puede exportarse a ONNX para entornos de producción, aunque no se documenta explícitamente.
- Latencia y throughput: 0,55 ms por ejemplo en CPU (batch 1, float32, 2 hilos); 1,53 ms en RTX 5090. El throughput depende del hardware, pero al ser un modelo de 1M parámetros, puede procesar miles de ejemplos por segundo en hardware moderno.

## Comparativa con modelos similares

La comparación directa es con los otros modelos de la escalera de Nawah-RuleCheck, entrenados con los mismos datos y evaluados con el mismo harness. No se han encontrado otros modelos públicos de verificación de reglas en árabe con características comparables.

| Modelo | Parametros | Peso | Unseen wording | Hand-written wording | CPU ms |
|---|---:|---:|---:|---:|---:|
| Nawah-RuleCheck-500K | 518.256 | 2,08 MB | 0,9778 | 0,5558 | 0,32 |
| **Nawah-RuleCheck-1M** | **1.073.504** | **4,30 MB** | **0,9864** | **0,7708** | **0,55** |
| Nawah-RuleCheck-5M | 5.080.704 | 20,33 MB | 0,9949 | 0,8642 | 1,06 |
| Nawah-RuleCheck-v2 | 51.787.264 | 207,16 MB | 0,9799 | 0,8667 | 16,42 |

La elección entre estos modelos depende del equilibrio entre tamaño, latencia y robustez ante reformulaciones. Para un catálogo fijo de reglas con redacción controlada, los modelos pequeños son casi gratuitos; si los usuarios pueden expresar reglas con vocabulario libre, el tamaño importa y ningún peldaño de la escalera es suficiente.

## Limitaciones y advertencias

- Entrenado exclusivamente en 19 reglas decidibles a partir de la propia cadena de texto. Reglas que requieren conocimiento del mundo, juicio o inferencia multi-paso están fuera de distribución y el modelo no puede manejarlas.
- Los textos de entrenamiento son documentos de negocio árabes de 1 a 3 líneas (anuncios, tickets, ofertas, quejas, listados) de nueve regiones. Textos más largos o de dominios muy diferentes no han sido probados y probablemente degraden el rendimiento.
- Las reglas de conteo de palabras son la familia más débil: en "hand-written wording", la precisión cae a 0,821 o menos, porque contar palabras no puede resolverse por patrones superficiales.
- En "hand-written wording", el modelo de 500K cae por debajo de la línea base de mayoría (0,5558 vs 0,5925); este modelo de 1M alcanza 0,7708, pero sigue lejos de ser fiable para producción con redacción libre.
- No se han documentado sesgos específicos, pero al entrenarse en un corpus acotado de documentos de negocio, el modelo puede tener sesgos de registro, vocabulario y región.
- Al ser un clasificador, no hay riesgo de alucinación generativa, pero sí de clasificaciones incorrectas, especialmente con reglas reformuladas o textos fuera del dominio.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el autor advierte explícitamente que ningún peldaño de la escalera está "terminado" para escenarios de redacción libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/Nawah-RuleCheck-1M
- Script de evaluación (`eval_all.py`): https://huggingface.co/oddadmix/Nawah-RuleCheck-1M/blob/main/eval_all.py
- Modelo Nawah-RuleCheck-500K: https://huggingface.co/oddadmix/Nawah-RuleCheck-500K
- Modelo Nawah-RuleCheck-5M: https://huggingface.co/oddadmix/Nawah-RuleCheck-5M
- Modelo Nawah-RuleCheck-v2: https://huggingface.co/oddadmix/Nawah-RuleCheck-v2
- Perfil del autor en Hugging Face: https://huggingface.co/oddadmix
- Perfil del autor en GitHub: https://github.com/Oddadmix
- Dataset de entrenamiento: https://huggingface.co/datasets/oddadmix/arabic-rule-checking
