# gradiated/linden-1

## Resumen

linden-1 es un modelo de decisión de 31 000 millones de parámetros desarrollado por Gradiated. No es un modelo generativo: recibe un estado (una conversación, un correo, un diff, un tique de soporte) y una o varias preguntas tipadas —sí/no (`noul`), elección entre k opciones (`choice`) o puntuación sobre una rúbrica (`score`)— y devuelve, en un único forward pass, una probabilidad calibrada para cada opción. No produce texto libre.

Es un fine-tune completo de Gemma 4 31B (google/gemma-4-31B-it), partiendo del checkpoint KnowLine-31B-Gen1.5 de PelaAI (Apache-2.0). La propuesta es sustituir llamadas a un LLM generativo por un clasificador de decisión especializado con latencias de decenas a cientos de milisegundos y mejor calibración. Según la model card, supera a TypeSafe Jev 1.14 y GPT-6 Luna en la mayoría de benchmarks de decisión publicados, con un error de calibración top-1 (ECE) de 0,031 frente a 0,067 y 0,093 respectivamente.

El modelo está pensado para integrarse en pipelines de moderación, enrutado de herramientas, triaje de soporte o revisión de contratos, donde la salida estructurada y la fiabilidad probabilística importan más que la generación de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Gemma 4 31B) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

linden-1 es un transformer denso de 31B parámetros obtenido por fine-tune completo (no LoRA) sobre Gemma 4 31B, con cómputo en BF16 y pesos maestros en FP32. La cabeza de salida no genera tokens: distribuye probabilidad sobre las opciones de una pregunta tipada. La función de pérdida combina entropía cruzada suave sobre la distribución de opciones más 0,5 veces el Brier score, lo que empuja hacia una calibración explícita de las probabilidades.

El entrenamiento se hizo en dos etapas. La etapa 1 usó 952 000 filas y 1155 pasos (0,25 épocas) con decisiones tipadas procedurales, las filas con licencia comercial de las decisiones en formato Jev de tasksource, los splits de entrenamiento oficiales de 14 benchmarks del Decision Index y los conjuntos de sn92. La etapa 2 partió de la etapa 1 con 563 000 filas y 1000 pasos (0,35 épocas), centrada en los puntos débiles detectados: razonamiento temporal y numérico (TempReason, TimeQA, TAT-QA, FinQA), políticas y contratos largos (ShARC, CUAD, MAUD, LexGLUE), juicio de preferencias (HelpSteer2/3, OASST2, Stack Exchange) y estado de diálogo (MultiWOZ); cerca de un sexto de las filas se reutilizó de la etapa 1 para evitar olvido catastrófico. Los pesos publicados son la mezcla 0,5 × checkpoint inicial + 0,5 × checkpoint de etapa 2. El cómputo total fue de unas 101 GPU-horas en B200/B300.

Todos los datos de entrenamiento son públicos y se excluyeron fuentes sin licencia comercial o con licencia no declarada, se eliminaron filas escritas por modelos de OpenAI, Anthropic o Google en fuentes de autoría mixta y se descontaminó cada fuente (coincidencia exacta y solapamiento de 13-gramas) contra los tests del Decision Index 0.3, los pools de test del kit y los ítems de JevBench y del panel de lanzamiento de Gemini.

## Capacidades

- Clasificación de decisión tipada: preguntas sí/no (`noul`), elección única entre k opciones (`choice`) y puntuación sobre rúbrica (`score`), con una probabilidad calibrada por opción.
- Procesamiento de estados multimodales vía pipeline `image-text-to-text` (etiqueta del repo), aunque la model card solo documenta estados textuales.
- Respuesta a múltiples preguntas sobre un mismo estado en una sola pasada.
- No genera texto: la salida es siempre una distribución de probabilidad sobre opciones.
- Capacidad de calibración explícita: ECE top-1 medio de 0,031 en los seis benchmarks reportados.
- Razonamiento temporal y numérico (entrenado sobre TempReason, TimeQA, TAT-QA, FinQA).
- Juicio de preferencias y evaluación de respuestas (HelpSteer2/3, OASST2, Stack Exchange).
- Seguimiento de estado de diálogo (MultiWOZ).
- Lectura de políticas y contratos largos (ShARC, CUAD, MAUD, LexGLUE).
- Soporte de tool calling implícito: puede usarse como enrutador de herramientas respondiendo preguntas sí/no sobre un chat y un conjunto de herramientas.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés, aunque obtiene 84,2 en Global-MMLU-Lite no inglés.

## Casos de uso

- Moderación de contenido: clasificar un comentario de foro (~150 tokens) con una pregunta sí/no sobre si viola una política; la latencia medida es de 48 ms de mediana (p90 49), adecuada para filtrado en línea a gran escala.
- Enrutado de herramientas en agentes: dado un chat corto y cinco herramientas (~400 tokens), formular cinco preguntas sí/no para decidir qué herramienta invocar; 113 ms de mediana, integrable en un bucle de agente sin penalizar la latencia percibida.
- Triaje de soporte al cliente: sobre un correo (~1000 tokens), combinar una pregunta `choice` (departamento), una `score` (urgencia) y una `noul` (¿requiere escalado?) en una sola llamada; 184 ms de mediana.
- Revisión de contratos: sobre un acuerdo de servicios (~3400 tokens), responder preguntas `choice` y `noul` sobre cláusulas de riesgo, jurisdicción o renovación automática; 273 ms de mediana.
- Análisis de postmortems e informes de incidentes: sobre un documento de ~8500 tokens, decidir si el incidente requiere acción correctiva o si cumple los criterios de cierre; 483 ms de mediana.
- Evaluación de respuestas de otros modelos: usar las preguntas de tipo `score` sobre pares de preferencia para construir un juez automático calibrado, apoyándose en el entrenamiento con HelpSteer2/3 y OASST2.
- Enrutado de tiques con múltiples etiquetas: clasificar tiques de soporte en categorías (BANKING77, CLINC150) usando `choice`, con la ventaja de obtener una distribución de probabilidad en lugar de una etiqueta dura.
- Filtrado en pipelines de CI/CD: sobre un diff, responder preguntas sí/no sobre si el cambio toca superficies sensibles o requiere revisión adicional, con latencia de decenas de milisegundos.

## Benchmarks y rendimiento

| Benchmark | linden-1 | TypeSafe Jev 1.14 | GPT-6 Luna |
|---|---|---|---|
| Decision Index 0.3, tests públicos | 71,3 | 60,5 | 47,3 |
| JevBench (split público, 231) | 91,3 | 88,3 | 89,6 |
| Amazon ESCI (5000, macro-F1) | 63,5 | 56,9 | 53,7 |
| New Yorker caption contest (528) | 87,5 | 72,0 | 69,5 |
| PubMedQA (1000) | 81,2 | 79,4 | 71,9 |
| Global-MMLU-Lite, no inglés (8800) | 84,2 | 84,7 | 80,4 |
| When2Call (3652) | 91,2 | 81,9 | 69,1 |
| Error de calibración top-1 (ECE), media de los seis, menor es mejor | 0,031 | 0,067 | 0,093 |

Latencia (mediana y p90 de 15 peticiones por caso, cliente en el mismo host para linden-1 y a ~15 ms de los endpoints para los modelos vía API):

| Petición | linden-1 | TypeSafe Jev 1.14 | GPT-6 Luna |
|---|---|---|---|
| Moderación: comentario (~150 tokens), 1 pregunta sí/no | 48 ms (p90 49) | 165 ms (p90 187) | 334 ms (p90 415) |
| Enrutado de herramientas: chat y 5 herramientas (~400 tokens), 5 sí/no | 113 ms (p90 113) | 158 ms (p90 177) | 333 ms (p90 513) |
| Triaje de soporte: correo (~1000 tokens), choice, score y sí/no | 184 ms (p90 186) | 163 ms (p90 188) | 284 ms (p90 463) |
| Revisión de contratos: acuerdo (~3400 tokens), choice y sí/no | 273 ms (p90 274) | 172 ms (p90 181) | 344 ms (p90 397) |
| Informe de incidente: postmortem (~8500 tokens), 1 sí/no | 483 ms (p90 485) | 219 ms (p90 228) | 275 ms (p90 341) |

linden-1 se midió en una única NVIDIA B300 sirviéndolo en exclusiva. Es más rápido en peticiones cortas y estable en todos los tamaños; Jev 1.14 es más rápido a partir de ~1000 tokens, donde linden-1 lee dos veces las entradas cortas por precisión y su coste crece con la longitud de entrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 31,27B parámetros, en BF16 requiere aproximadamente 62,6 GB de pesos (tamaño del repo), por lo que no cabe en GPUs de consumo sin cuantización.
- GPU recomendadas: B300 (configuración usada para las mediciones), B200; para despliegue en BF16 se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) o varias en tensor parallel.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB sin cuantización; no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers (librería declarada); también disponible vía API de Gradiated (`gradiated/linden-1`) con endpoint `/v1/systemone`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencias por petición medidas en B300 (ver tabla de benchmarks); throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | ECE top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| linden-1 | 31,27B denso | no disponible | 71,3 | 0,031 | Apache-2.0 | Pesos en HF y API de Gradiated |
| TypeSafe Jev 1.14 | no disponible | no disponible | 60,5 | 0,067 | no disponible | Solo API de TypeSafe |
| GPT-6 Luna | no disponible | no disponible | 47,3 | 0,093 | propietaria | API de OpenAI (Decisions API) |

linden-1 es el único de los tres con pesos abiertos y licencia Apache-2.0. Frente a Jev 1.14 pierde en latencia para entradas de más de ~1000 tokens y en Global-MMLU-Lite no inglés (84,2 frente a 84,7), pero gana en Decision Index, ESCI, New Yorker, PubMedQA, When2Call y calibración.

## Limitaciones y advertencias

- Solo inglés declarado; el rendimiento multilingüe existe pero no está garantizado ni documentado como soportado.
- No genera texto: no puede usarse como chatbot ni para tareas generativas.
- Riesgo de alucinación estructural: al devolver probabilidades calibradas, una probabilidad alta no implica corrección factual; el modelo puede estar seguro y equivocado.
- Sesgos: no se documentan análisis de sesgo específicos; los datos de entrenamiento son públicos y se filtraron por licencia y autoría, pero no se reportan evaluaciones de equidad.
- La calibración (ECE 0,031) se midió sobre los seis benchmarks reportados; puede degradarse fuera de esa distribución.
- En entradas largas (>1000 tokens) es más lento que Jev 1.14, lo que puede ser un problema en pipelines con documentos extensos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 31B tiene sus propios términos que deben verificarse para el despliegue.
- El modelo se publicó el 18 de noviembre de 2026 y no tiene descargas ni likes; no hay validación independiente de los resultados reportados por el autor.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gradiated/linden-1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Documentación de la API de Gradiated: https://gradiated.com/docs
- Decision Index (kit de evaluación): https://github.com/apolinario/decision-index
