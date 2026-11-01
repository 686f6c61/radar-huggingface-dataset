# Magnuss85/Vor-Icelandic-PII-31B-GGUF

## Resumen

Vör es un detector de datos personales en islandés desarrollado por Magnús Smári Smárason (Magnuss85) como un fine-tune LoRA de google/gemma-4-31B-it, fusionado y cuantizado a GGUF. El modelo resuelve un problema muy concreto: leer texto en islandés y devolver en JSON cada fragmento de información personal, clasificado según la Ley islandesa de Protección de Datos n.º 90/2018 (que implementa el RGPD), marcando además si el documento completo es sensible. Es la quinta entrega de la línea Norn del mismo autor.

Con 30.697.345.596 parámetros totales, el modelo está pensado para tareas de anonimización y cumplimiento normativo en un idioma con escasos recursos, donde los detectores genéricos multilingües rinden peor. Su salida es estructurada y verificable: cada entidad incluye el texto literal, un índice de ocurrencia, un tipo, una clase normativa (ALM, VIÐK, REFS, FJÁR) y la base legal aplicada.

Es relevante ahora porque demuestra que un fine-tune LoRA pequeño (1.518 documentos de PII sobre un generador de personas ficticias) puede superar claramente al modelo base en una tarea especializada, aunque sus propios autores advierten que la evaluación se hizo sobre un conjunto sintético y que el rendimiento en documentos reales será inferior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 31B-it), fine-tune LoRA fusionado |
| Parámetros totales | 30.697.345.596 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la configuración de Ollama usa num_ctx 8192; el entrenamiento usó secuencia 2048) |
| Tipos de cuantización | Q5_K_M (21,8 GB), Q8_0 (32,6 GB) |
| Idiomas soportados | islandés (is) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer decoder-only de 31B parámetros, y se adapta mediante un LoRA en bf16 con r = 64 y alpha = 64, entrenado durante 1 época, 560 pasos, learning rate 1e-4 y longitud de secuencia 2048, con pérdida solo sobre los turnos del asistente. El entrenamiento se ejecutó en una NVIDIA DGX Spark y la pérdida de validación bajó de 5,38 a 0,78. Posteriormente el adaptador se fusionó con el modelo base y se cuantizó a GGUF.

El conjunto de datos consta de 5.795 filas: 1.518 documentos de PII construidos alrededor de personas ficticias generadas programáticamente (con dígitos de control de kennitala válidos y nombres declinados en los cuatro casos según BÍN), con etiquetas derivadas de la construcción y no de anotación manual; 2.845 respuestas en prosa islandesa filtradas con GreynirCorrect; 1.500 ejercicios de declinación calculados desde BÍN; y 237 filas de identidad. Todos los datos personales de entrenamiento y test son ficticios. No se menciona RLHF ni DPO.

La innovación principal no es arquitectónica sino de diseño de datos y de salida: el esquema JSON con `texti`, `tilvik`, `tegund`, `flokkur` y `grunnur` permite resolver offsets por búsqueda de cadena y rechazar cualquier span que no exista literalmente en el texto de entrada, lo que facilita una capa de validación determinista posterior.

## Capacidades

- Detección de información personal en islandés con salida JSON estructurada.
- Clasificación normativa en cuatro clases: ALM (datos generales, art. 3(2)), VIÐK (datos sensibles, art. 3(3): salud, genética, vida sexual, opiniones políticas, religión, afiliación sindical, origen étnico, biometría), REFS (registros penales, art. 12) y FJÁR (datos financieros, art. 15).
- Clasificación a nivel de documento: campo `viðkvæmt_skjal` verdadero cuando hay datos VIÐK o REFS.
- Resumen agregado por clase en el campo `samantekt`.
- Extracción verbatim con índice de ocurrencia para resolución de offsets.
- Generación de texto general en islandés, aunque más débil que Norn v4.
- Capacidad conversacional según el pipeline declarado (text-generation, conversational).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Anonimización previa a compartición de documentos: el modelo devuelve cada span con su texto literal y su índice de ocurrencia, de modo que un pipeline puede localizar y enmascarar nombres, kennitalas, teléfonos, correos, direcciones e IBAN antes de enviar el documento a terceros.
- Cumplimiento del RGPD en gestoría y administración pública islandesa: la clasificación en ALM, VIÐK, REFS y FJÁR con la base legal citada permite generar un registro de tratamiento y marcar expedientes sensibles para revisión humana.
- Triaje de expedientes médicos: con una recall de 0,962 en datos sensibles (VIÐK), el modelo sirve como primera pasada para detectar menciones de salud, genética o vida sexual en historiales antes de una revisión legal.
- Procesamiento de resoluciones judiciales: el modelo se evaluó específicamente sobre sentencias; puede extraer partes, identificadores y referencias a registros penales, aunque con la recall más baja de todas las clases (0,769 en REFS), por lo que requiere revisión manual en ese supuesto.
- Enriquecimiento de pipelines de DLP en correo y chat: funciona sobre hilos de conversación y correos, tipos incluidos en el conjunto de evaluación, y puede integrarse como paso previo a un clasificador determinista de patrones (dígito de control de kennitala, IBAN mod 97, teléfono y correo).
- Auditoría de formularios y tablas: el conjunto de test incluye formularios, tablas y escaneos con estilo OCR, por lo que el modelo puede usarse para detectar campos con datos personales en digitalizaciones antes de almacenarlas.
- Validación cruzada con reglas deterministas: la recomendación del autor es tomar la unión de la salida del modelo y una capa de patrones, lo que encaja en arquitecturas de dos pasadas para reducir falsos negativos en producción.

## Benchmarks y rendimiento

Evaluación sobre 317 documentos islandeses reservados de 10 tipos (historiales médicos, sentencias, registros laborales, actas de reuniones, correos, formularios, hilos de chat, texto de noticias, tablas y escaneos tipo OCR), generados por una familia de modelos distinta a la de entrenamiento. Se eliminaron documentos de test que compartían kennitala, IBAN, teléfono, correo o cualquier secuencia de 8 palabras con el entrenamiento. Puntuación estricta: texto exacto y tipo correcto. Todas las ejecuciones con Q5_K_M en Ollama a temperatura 0.

| Métrica | Vör | Norn v4 | Gemma 4 31B-it |
|---|---|---|---|
| Span F1 (coincidencia de texto) | 0,984 | 0,865 | 0,827 |
| Recall en datos sensibles (VIÐK) | 0,962 | no disponible | no disponible |
| Recall en identificadores directos (nombre, kennitala, teléfono, correo, dirección, IBAN) | 0,997 | no disponible | no disponible |
| Precisión (estricta) | 0,982 | no disponible | no disponible |
| Clasificación de documento (sensible / no) | 0,997 | no disponible | no disponible |
| JSON válido | 317 / 317 | no disponible | no disponible |
| Recall en nombres nunca vistos en entrenamiento | 0,991 (324/327) | no disponible | no disponible |
| Recall en registros penales (REFS) | 0,769 (30/39) | no disponible | no disponible |

Las baselines no conocen los nombres de los tipos, por lo que solo se comparan en span F1. En calidad de islandés general, la precisión de declinación en el test BÍN es 0,794 (Norn v4: 0,856) y GreynirCorrect marca 2,16 incidencias por 100 palabras (Norn v4: 1,93).

## Requisitos de hardware

- VRAM estimada: aproximadamente 22 GB para Q5_K_M y 33 GB para Q8_0, más overhead de contexto y caché KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o más para Q5_K_M.
- Cabe en GPU de consumo: sí, Q5_K_M entra en una RTX 3090 o RTX 4090 de 24 GB con contexto moderado; Q8_0 requiere 40 GB o más y no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: Ollama (con `RENDERER gemma4` y `PARSER gemma4` obligatorios para aplicar el formato de chat), llama.cpp y otros runners compatibles con GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Span F1 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vör Icelandic PII 31B | 30,7B | no disponible (entrenamiento a 2048) | Detección de PII en islandés | 0,984 | Apache 2.0 | GGUF en HuggingFace |
| Norn v4 Icelandic 31B | no disponible | no disponible | Modelo general en islandés | 0,865 | no disponible | GGUF en HuggingFace |
| Gemma 4 31B-it | 31B | no disponible | Modelo general multilingüe | 0,827 | no disponible | Pesos originales de Google |

La comparación con Norn v4 y Gemma 4 31B-it se limita a span F1 porque las baselines no conocen el esquema de tipos. No se dispone de comparación con detectores de PII multilingües especializados en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de test es sintético: test y entrenamiento se generaron con el mismo generador de personas ficticias y los mismos tipos de documento, por lo que las métricas miden rendimiento dentro de esa distribución y serán inferiores en documentos reales.
- Frases cortas y sueltas rinden peor que documentos completos: en una comprobación puntual, una línea perdió una mención de salud y clasificó afiliación sindical como dato financiero.
- Los registros penales (REFS) son la clase más débil, con recall 0,769.
- El islandés general es peor que en Norn v4 (declinación 0,794 frente a 0,856; 2,16 frente a 1,93 incidencias por 100 palabras en GreynirCorrect). El autor recomienda Norn v4 para escritura general y Vör para detección.
- El esquema de tipos es un borrador de trabajo y no ha sido revisado por un abogado; la salida no constituye una opinión legal y está pensada para apoyar a un revisor humano.
- Riesgo de alucinación de spans: mitigado parcialmente por el diseño verbatim, ya que cualquier span que no exista en el texto puede rechazarse por búsqueda de cadena.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0, igual que el modelo base, sin restricciones comerciales adicionales indicadas.
- Para producción, el autor recomienda combinar el modelo con una capa determinista (dígito de control de kennitala, IBAN mod 97, patrones de teléfono y correo) y tomar la unión de ambas salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Magnuss85/Vor-Icelandic-PII-31B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Norn v4 Icelandic 31B GGUF: https://huggingface.co/Magnuss85/Norn-v4-Icelandic-31B-GGUF
- Sitio del autor: https://smarason.is
- Perfil del autor en HuggingFace: https://huggingface.co/Magnuss85
