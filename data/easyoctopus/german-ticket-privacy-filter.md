# EasyOctopus/german-ticket-privacy-filter

## Resumen

German ticket privacy filter es un modelo compacto de clasificación de tokens (token-classification) especializado en la detección y redacción de datos personales (PII) en tickets de soporte técnico en alemán. Lo desarrolla EasyOctopus (autor de la model card: Mahir Isikli) y parte del checkpoint EasyOctopus/german-support-pii-model, que a su vez desciende de la variante cased de DistilBERT en alemán. Su tarea concreta es leer una pregunta de soporte opcional junto con la respuesta del cliente y devolver los fragmentos privados que aparecen en esa respuesta.

El modelo resuelve un problema acotado pero crítico en flujos de atención al cliente: la fuga de identificadores, números de cliente, direcciones u otros datos sensibles al procesar tickets. A diferencia de detectores genéricos, incorpora el contexto de la pregunta previa, lo que según la evaluación independiente del autor mejora de forma notable la precisión sobre respuestas ambiguas: la comparación de respuestas emparejadas pasa de 4/28 a 22/28 frente al detector compacto anterior.

Con 66,8 millones de parámetros y un tamaño de repositorio de 0,3 GB, está pensado para ejecutarse en CPU (78 ms de mediana en la evaluación del autor). La licencia es Apache 2.0 y el modelo se publica con pesos en safetensors y un script de inferencia (runtime.py) que implementa el formato pregunta/respuesta y la decodificación con ventanas solapadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT cased en alemán, ajustado para token-classification) |
| Parametros totales | 66.832.159 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 caracteres de pregunta (máximo 80 subwords retenidos) y 12.000 caracteres de respuesta mediante ventanas solapadas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo DistilBERT en su variante cased para alemán, reajustado como clasificador de tokens para etiquetar tramos privados. La entrada se estructura como pregunta de soporte opcional más respuesta del cliente; la pérdida de gradiente se aplica únicamente a los tokens de la respuesta. Para respuestas largas se emplean ventanas solapadas y cada token recibe la predicción de la ventana con mayor margen en los bordes.

El checkpoint seleccionado se entrenó con 4.200 conversaciones ficticias nuevas más 650 registros del split público anterior, con un split de desarrollo de 420 registros. Se realizaron cuatro épocas en una NVIDIA A100-SXM4-80GB con AdamW, semilla 181153 y learning rate 0,000028. El desarrollo seleccionó la época 2, un umbral de corte de 0,55 y la expansión dentro de palabra activada. El SHA-256 completo de los pesos es `4b11077b8ed8c33af653df2440236091e420ed6bb68be9f3c9a18c68d9ec65f8`. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre etiquetas de spans privados.

## Capacidades

- Detección de datos personales (PII) en texto alemán de tickets de soporte: identificadores, números de cliente y otros valores privados presentes en la respuesta del cliente.
- Redacción contextual: aprovecha la pregunta de soporte previa para desambiguar respuestas que, aisladas, serían ambiguas.
- Salida con offsets de puntos de código Unicode en formato semiabierto, junto con el texto redactado.
- Procesamiento de entradas largas mediante ventanas solapadas (hasta 12.000 caracteres de respuesta).
- Puntuaciones de confianza por token (no calibradas como probabilidad de privacidad).
- Ejecución en CPU con latencia baja (78 ms de mediana, 107 ms en el percentil 95 en dos hilos de CPU Contabo).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es un clasificador de tokens puro.

## Casos de uso

- Redacción de tickets antes de almacenarlos: el modelo se integra en el pipeline de ingesta para enmascarar identificadores en las respuestas de clientes antes de persistirlas en bases de datos o sistemas de ticketing, reduciendo la exposición de PII en logs.
- Cumplimiento de protección de datos en soporte: como paso previo a la revisión humana o al envío a sistemas de analítica, se aplica el filtro para minimizar datos personales conforme a principios de minimización (RGPD), dado que el modelo opera en local y con licencia Apache 2.0.
- Preprocesado para entrenamiento de modelos de soporte: antes de usar conversaciones reales como corpus, el filtro elimina datos privados, permitiendo construir datasets de entrenamiento con menor riesgo legal.
- Enrutamiento y triaje de tickets: al detectar y redactar PII, el ticket puede clasificarse y enrutarse a colas o equipos sin exponer datos sensibles a sistemas intermedios.
- Auditoría de fugas de datos: ejecutar el modelo sobre históricos de tickets para identificar respuestas que contienen PII no redactada y priorizar su saneamiento.
- Despliegue en entornos con recursos limitados: al ser un modelo de 66,8 M de parámetros que corre en CPU en decenas de milisegundos, es adecuado para servicios on-premise o edge donde no hay GPU disponible.
- Filtro secundario en pipelines de detección existentes: la model card documenta su uso como modelo secundario dentro de un lote privado con un detector rápido y un router, preservando las máscaras primarias por construcción.

## Benchmarks y rendimiento

Evaluación independiente del autor sobre un panel de 121 tickets ficticios (26 respuestas sueltas); una mención privada cuenta como correcta solo si se enmascaran todos sus caracteres no blancos:

| Metodo | Menciones privadas totalmente enmascaradas | Tickets limpios marcados | Ambas respuestas emparejadas correctas |
|---|---:|---:|---:|
| Detector compacto anterior | 60/73 | 22/56 | 4/28 |
| Digitflow German Privacy Filter | 58/73 | 33/56 | 5/28 |
| Modelo contextual nuevo | 63/73 | 4/56 | 22/28 |
| Modelo nuevo sin la pregunta previa | 55/73 | 22/56 | 0/28 |
| Lote privado anterior con Digitflow | 63/73 | 26/56 | 5/28 |
| Lote privado con el modelo nuevo | 65/73 | 23/56 | 7/28 |

Evaluación anterior sobre 90 diálogos:

| Metodo | Menciones privadas totalmente enmascaradas | Tickets limpios marcados | Ambas respuestas emparejadas correctas |
|---|---:|---:|---:|
| Detector compacto anterior | 31/44 | 17/49 | 3/25 |
| Digitflow German Privacy Filter | 36/44 | 27/49 | 2/25 |
| Modelo contextual nuevo | 40/44 | 5/49 | 23/25 |
| Modelo nuevo sin la pregunta previa | 34/44 | 21/49 | 0/25 |
| Lote privado anterior con Digitflow | 36/44 | 20/49 | 6/25 |
| Lote privado con el modelo nuevo | 39/44 | 20/49 | 7/25 |

Transferencia externa a finanzas alemanas (453 documentos sintéticos de Gretel): el modelo nuevo enmascaró completamente 568 de 1.025 menciones en alcance, frente a 663 de 1.025 del detector compacto anterior. Las anotaciones externas pueden omitir valores privados, por lo que esta prueba no estima falsos positivos. Latencia en CPU sobre el panel nuevo: 78 ms de mediana y 107 ms en el percentil 95.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con 66,8 M de parámetros en fp32 ocupa aproximadamente 0,27 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060 o superior) y en CPU.
- GPU recomendadas: no necesarias; el autor reporta inferencia en CPU con dos hilos (Contabo) en 78 ms de mediana. Cualquier GPU moderna aportaría margen adicional para lotes grandes.
- Cabe en GPU consumer: sí, en todas las gamas actuales, dado el tamaño del modelo.
- Opciones de despliegue: pipeline de token-classification de Hugging Face (transformers) para texto suelto; el repositorio incluye runtime.py, que implementa el layout pregunta/respuesta, el decodificador seleccionado y los offsets relativos a la respuesta. Requiere torch 2.6.0 y transformers 4.49.0 según el ejemplo del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 78 ms de mediana y 107 ms en el percentil 95 por ticket en CPU (dos hilos, en caliente). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| German ticket privacy filter (este) | 66,8 M | 12.000 caracteres de respuesta + 512 de pregunta | PII en tickets alemanes con contexto pregunta/respuesta | Apache 2.0 | Hugging Face |
| Detector compacto anterior (referencia del autor) | no disponible | no disponible | PII en navegador, sin contexto | no disponible | no disponible |
| Digitflow German Privacy Filter | no disponible | no disponible | PII en alemán, fine-tune de OpenAI Privacy Filter | no disponible | no disponible |

En la evaluación del autor, el modelo contextual nuevo supera a ambos alternativas en menciones totalmente enmascaradas y, sobre todo, en respuestas emparejadas correctas (22/28 frente a 4/28 y 5/28), a costa de un mayor número de tickets limpios marcados en el lote privado (23/56 frente a 26/56 y 5/28). En la transferencia a finanzas alemanas queda por debajo del detector compacto anterior en cobertura (568/1.025 frente a 663/1.025).

## Limitaciones y advertencias

- El modelo puede exponer detalles privados (falsos negativos) y redactar texto ordinario (falsos positivos); el rendimiento en tickets de clientes reales es desconocido según el propio autor.
- Las dos evaluaciones sintéticas cubren solo una fracción del lenguaje de soporte en alemán; los resultados no garantizan generalización.
- Las puntuaciones de salida representan confianza del modelo, no una probabilidad calibrada de privacidad.
- En la transferencia externa a finanzas alemanas la cobertura cae por debajo del detector anterior; conviene consultar los resultados emparejados completos (comparison.json) antes de adoptarlo en otro producto.
- La demo pública del navegador tiene su propio punto de operación y runtime, distinto del checkpoint.
- Solo soporta alemán; no hay capacidades multilingües documentadas.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni cláusulas adicionales de responsabilidad.
- No se han publicado datos de sesgos; al ser un modelo entrenado con conversaciones ficticias, su comportamiento ante dialectos, jerga o variantes regionales del alemán no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EasyOctopus/german-ticket-privacy-filter
- Modelo base: https://huggingface.co/EasyOctopus/german-support-pii-model
- Dataset de entrenamiento: https://huggingface.co/datasets/EasyOctopus/german-ticket-privacy-data
- Dataset de soporte PII: https://huggingface.co/datasets/EasyOctopus/german-support-pii-data
- Corpus externo de finanzas alemanas (Gretel): https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Resultados emparejados completos: ./comparison.json (incluido en el repositorio del modelo)
