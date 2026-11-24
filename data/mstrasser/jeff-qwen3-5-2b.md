# mstrasser/Jeff-Qwen3.5-2B

## Resumen

Jeff-Qwen3.5-2B es un fine-tune del modelo Qwen3.5-2B desarrollado por mstrasser, orientado a clasificación zero-shot y toma de decisiones probabilística. No es un modelo generativo de texto: recibe una descripción de situación y una lista de opciones en lenguaje natural, y devuelve una probabilidad calibrada para cada opción en un único forward pass. La arquitectura subyacente es la del transformer de Qwen3.5-2B, con 2.213.241.664 parámetros totales, adaptada mediante fine-tuning supervisado sobre datos sintéticos.

El modelo resuelve un problema concreto: sustituir pipelines de clasificación basados en generación de texto y parseo posterior por una inferencia directa de logits sobre etiquetas candidatas. Esto elimina la latencia de decodificación autoregresiva y el riesgo de salidas malformadas. Según la model card, la inferencia tarda aproximadamente 24 ms por decisión en una RTX PRO 6000 y 60 ms en un Apple M4 Max con MLX.

Es relevante en el contexto actual de modelos pequeños desplegables localmente: con 2B parámetros y licencia Apache 2.0, ofrece una alternativa práctica para enrutado de intenciones, moderación o clasificación de tickets sin depender de APIs externas. La versión documentada es la v1.2 (1 de octubre de 2026), que prioriza calibración y honestidad de evaluación sobre puntuación bruta; el autor indica que esta release está superada por Jeff v1.3 (`mstrasser/jeff-base`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B), fine-tune para clasificación zero-shot |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only denso de 2,2 mil millones de parámetros. El fine-tune convierte la cabeza de lenguaje en un clasificador sobre opciones candidatas: en lugar de generar texto, el modelo puntúa cada opción de la lista y normaliza las puntuaciones en una distribución de probabilidad calibrada. La salida es una probabilidad por opción, sin decodificación autoregresiva ni parseo posterior.

El entrenamiento se realizó sobre 284.747 preguntas sintéticas durante una sola época, con un checkpoint final y una temperatura ajustada. Los datos sintéticos de entrenamiento del modelo base fueron generados por Qwen3.8-Flash-Next sobre dos DGX Spark; todo el cómputo de entrenamiento se hizo en una única GPU RTX PRO 6000 (unas 3,5 horas para el 2B). La v1.2 incorpora datos limpiados: eliminación de solapamientos con los conjuntos de test (incluidas todas las preguntas de MAUD), supresión de atajos por orden y longitud de respuesta, y traslado de los datos de navegación por voz a un adaptador separado (`nav`). La v1.1 añadió 32.000 preguntas con entre 20 y 254 opciones para corregir el sesgo hacia las primeras posiciones de la lista.

## Capacidades

- Clasificación zero-shot entre opciones arbitrarias descritas en lenguaje natural, sin necesidad de que las categorías aparezcan en el entrenamiento.
- Salida de probabilidades calibradas por opción en un único forward pass (error de calibración ECE de 0,021 en el panel de evaluación).
- Manejo de listas largas de opciones: hasta 254 alternativas, con un 93,6 % de acierto en el test Long lists v2 (1.886 preguntas).
- Clasificación sobre documentos largos (contratos, consultas condicionales), con un 65,6 % en el conjunto ContractNLI, CUAD, MAUD y ConditionalQA.
- Evaluación de calidad de respuestas y detección de alucinaciones en contextos RAG (RAGTruth, 85,5 %).
- Juicio comparativo entre respuestas (JudgeBench, 62,0 %).
- Razonamiento de sentido común acotado (WinoGrande, 80,7 %; BBH, 66,4 %).
- Capacidad de adaptación rápida: un fine-tune corto sobre ejemplos propios eleva sustancialmente la precisión (el caso documentado de navegación por voz pasa de 31,7 % a 95,8 % en menos de media hora en una GPU).
- Solo inglés; no se documentan capacidades multilingües, tool calling, agentes, visión ni audio.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: se describen las intenciones posibles (reservar, cancelar, consultar estado, escalar a humano) y el modelo devuelve la probabilidad de cada una en unos 24 ms, lo que permite decidir el flujo antes de invocar un LLM generativo.
- Moderación de contenido: clasificación de mensajes en categorías de política (spam, acoso, contenido sensible, permitido) con probabilidades calibradas que permiten fijar umbrales de revisión humana de forma defendible.
- Triaje de tickets de soporte: asignación de colas o prioridades a partir de la descripción del ticket y una lista de categorías, aprovechando el soporte de listas largas de hasta 254 opciones para taxonomías extensas.
- Verificación de respuestas en pipelines RAG: dado un contexto recuperado y una respuesta generada, el modelo puntúa si la respuesta está respaldada por el contexto, útil como filtro previo a la entrega al usuario (rendimiento del 85,5 % en RAGTruth).
- Evaluación automática de respuestas de modelos: comparación por pares o contra criterios descritos en lenguaje natural, con probabilidades calibradas que permiten agregar juicios sin depender de un LLM juez de mayor coste.
- Clasificación de cláusulas en documentos legales: identificación de tipos de cláusula o de cumplimiento de condiciones en contratos, con la advertencia de que el rendimiento en documentos largos es del 65,6 % y puede requerir fine-tune específico.
- Comandos de voz en aplicaciones locales: con el adaptador `nav` o un fine-tune propio, mapeo de transcripciones a acciones de la aplicación; el caso documentado alcanza el 95,8 % de precisión en comandos retenidos.
- Filtro de seguridad previo a generación: decisión rápida y local sobre si una petición debe bloquearse, redirigirse o procesarse, sin coste de API y con latencia compatible con interfaces interactivas.

## Benchmarks y rendimiento

Datos publicados en la model card para la versión v1.2, comparados con la v1.1 y con modelos de la misma familia:

| Test | Preguntas | v1.1 | v1.2 |
|---|---|---|---|
| Panel de benchmarks (cinco) | 4.599 | 82,0 % | 81,7 % |
| Error de calibración (ECE) en el panel | 4.599 | 0,026 | 0,021 |
| Long lists v2 (20 a 254 opciones) | 1.886 | no medido | 93,6 % |
| Long lists v1 | 2.400 | 95,2 % | 95,0 % |
| Documentos largos (ContractNLI, CUAD, MAUD, ConditionalQA) | 2.009 | 85,8 % | 65,6 % |
| Navegación por voz (comandos retenidos) | 3.324 | 95,8 % | 91,4 % |
| JevBench hard tier | 105 | 57,1 % | 57,1 % |

Desglose por benchmark (v1.1 → v1.2): BBH 68,7 → 66,4; Financial PhraseBank 94,7 → 95,6; JudgeBench 59,4 → 62,0; RAGTruth 87,7 → 85,5; WinoGrande 78,8 → 80,7.

Comparación de familia según la model card:

| Modelo | Base | Precisión del panel (base sin entrenar) | Precisión de Jeff | ECE | Tiempo por decisión (RTX PRO 6000) |
|---|---|---|---|---|---|
| Jeff-Qwen3.5-0.8B (v1.2) | Qwen3.5-0.8B | 45,3 % | 78,7 % | 0,028 | 22 ms |
| Jeff-Qwen3.5-2B v1.2 | Qwen3.5-2B | 46,5 % | 81,7 % | 0,021 | 24 ms |
| Jeff-Qwen3.5-2B v1.1 | Qwen3.5-2B | 46,5 % | 82,0 % | 0,026 | 24 ms |
| Jeff-Gemma4-E2B | Gemma 4 E2B | 62,5 % | 81,6 % | 0,031 | 29 ms |
| Jev (publicado) | — | — | 83,0 % | ≈0,06 | 212 ms por llamada vía API |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada en la información disponible. Como referencia orientativa por tamaño, un modelo de 2,2B parámetros en fp16 requiere en torno a 4,4 GB de pesos, y en cuantización de 8 bits alrededor de 2,2 GB; estas cifras son estimaciones por tamaño, no datos del autor.
- GPU de entrenamiento documentada: una RTX PRO 6000 (3,5 horas para el 2B, una época).
- Latencia medida: 24 ms por decisión en RTX PRO 6000; 60 ms por decisión en Apple M4 Max con MLX.
- Cabe en GPU de consumo por tamaño, aunque el autor no publica requisitos oficiales ni cuantizaciones disponibles.
- Opciones de despliegue: transformers (librería declarada); el autor menciona MLX para Apple Silicon. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión panel | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeff-Qwen3.5-2B v1.2 | 2,21B | no disponible | 81,7 % | 0,021 | Apache 2.0 | Hugging Face |
| Jeff-Qwen3.5-0.8B v1.2 | no disponible | no disponible | 78,7 % | 0,028 | Apache 2.0 | Hugging Face |
| Jeff-Gemma4-E2B | no disponible | no disponible | 81,6 % | 0,031 | no disponible | Hugging Face |
| Jev (publicado) | no disponible (modelo mayor) | no disponible | 83,0 % | ≈0,06 | propietario (TypeSafe) | API |

El 2B ofrece una mejora de 3 puntos sobre el 0.8B con un coste de latencia de 2 ms y mejor calibración. Frente a Jev, queda 1,3 puntos por debajo en precisión pero con un ECE muy inferior y latencia de 24 ms frente a 212 ms por llamada de API. Frente a Jeff-Gemma4-E2B, la precisión es prácticamente idéntica con mejor calibración y menor latencia.

## Limitaciones y advertencias

- Modelo superado: el autor indica que esta release ya no se actualiza y que la versión vigente es Jeff v1.3 (`mstrasser/jeff-base`).
- Solo inglés; no se documentan otros idiomas.
- No es un modelo generativo: no produce texto, razonamiento libre ni código. Su uso está restringido a elegir entre opciones descritas.
- A este tamaño, su razonamiento no iguala al de modelos jueces de mayor escala; la model card lo señala explícitamente frente a Jev.
- El rendimiento en documentos largos cae del 85,8 % (v1.1) al 65,6 % (v1.2) al eliminar documentos filtrados del test; quien dependiera de la cifra anterior debe asumir la nueva.
- Riesgo de sesgo hacia posiciones o longitudes de respuesta: corregido en parte en v1.2, pero es un modo de fallo conocido en clasificadores de este tipo.
- La precisión zero-shot puede ser insuficiente para dominios específicos; el autor recomienda un fine-tune corto con ejemplos propios.
- Datos de entrenamiento sintéticos generados por un modelo abierto (Qwen3.8-Flash-Next); algunos conjuntos públicos del mix contienen texto generado por modelos cerrados.
- No se publican requisitos de hardware, cuantizaciones ni contexto máximo, lo que dificulta planificar el despliegue en producción.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías del autor sobre idoneidad para casos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/Jeff-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Versión vigente Jeff v1.3: https://huggingface.co/mstrasser/jeff-base
- Jeff-Qwen3.5-0.8B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-0.8B
- Jeff-Gemma4-E2B: https://huggingface.co/mstrasser/Jeff-Gemma4-E2B
- Sitio del proyecto: https://jeffhub.ai
- Receta de entrenamiento AutoJev: https://github.com/denis-pplx/autojev
- Repositorio e incidencias: https://github.com/firelex/jeff
- Incidencia sobre listas largas: https://github.com/firelex/jeff/issues/1
