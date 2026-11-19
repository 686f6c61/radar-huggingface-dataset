# MachinePulseAI/karpo-decision-31B

## Resumen

Karpo Decision 31B es un modelo de decisión multimodal desarrollado por MachinePulseAI, afinado a partir de google/gemma-4-31B-it. Su particularidad es que no genera texto: dado un estado (una página web con su captura de pantalla, un documento, una conversación en texto, JSON e imágenes) y una serie de preguntas tipadas, devuelve en una única pasada forward una probabilidad para cada opción de cada pregunta. Está pensado como un "modelo de sistema uno": decisiones rápidas y probabilísticas en lugar de generación autoregresiva.

El modelo tiene 31.273.088.876 parámetros en bf16 más un readout lineal de 255 × 5.376 en fp32, con una ventana de contexto de 32.768 tokens por secuencia. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (un nivel en una escala). Se distribuye con licencia Apache-2.0 y una API Python junto con un servidor HTTP en el formato System One.

Su relevancia actual radica en que ocupa el primer puesto del leaderboard Decision Index 0.4.1 (edición del 12 de noviembre de 2026) con una puntuación Full de 73,9, compartiendo el primer lugar con GLiDE 27B (73,4) dentro del margen de 0,9 puntos que agrupa a los modelos. Frente a los modelos generativos, ofrece latencia de 94 ms por petición en una sola GPU, lo que lo hace atractivo para pipelines de clasificación y enrutamiento de alta frecuencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 31B) con readout lineal sobre opciones |
| Parámetros totales | 31.273.088.876 (bf16) + readout 255 × 5.376 (fp32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal que procesa texto e imágenes, y le añade un readout lineal de 255 × 5.376 en fp32 sobre las opciones de cada pregunta. En lugar de generar texto token a token, el modelo calcula en una sola pasada forward la probabilidad de cada opción de cada pregunta tipada (`choice`, `noul`, `score`). La entrada es multimodal: texto, JSON e imágenes, incluyendo una captura de pantalla en `state.viewport_screenshot` o data URLs en `images`. Cuando una petición excede los 32.768 tokens, se divide por preguntas, cada parte con el estado completo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card solo indica que es un fine-tune del modelo base con un readout lineal, sin detallar la innovación técnica más allá de la propia formulación de decisión tipada en una pasada. La calibración declarada es de 4,8 puntos de error.

## Capacidades

- Decisión tipada multimodal: responde preguntas de tipo `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (nivel en una escala) sobre un estado dado.
- Entrada multimodal: procesa texto, JSON e imágenes, incluyendo capturas de pantalla de páginas web y data URLs.
- Decisión en una pasada forward: devuelve probabilidades por opción sin generar texto, lo que reduce la latencia frente a modelos generativos.
- Contexto de 32.768 tokens por secuencia, con división automática de peticiones largas por preguntas.
- Interfaz Python y servidor HTTP en el formato System One (`POST /v1/systemone`).
- Capacidades de conocimiento y razonamiento, comprensión del lenguaje, recuperación y clasificación, herramientas y automatización, y artes y gusto humano, según las categorías del Decision Index.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Clasificación y enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y su captura de pantalla asociada y devuelve la probabilidad de cada categoría o cola de destino en una sola pasada, con latencia de 94 ms por petición, lo que permite procesar grandes volúmenes en tiempo real.
- Decisión sobre páginas web y formularios: dado el DOM y la captura de pantalla de una página, responde preguntas `choice` sobre qué acción tomar (rellenar un campo, hacer clic en un botón, descartar), adecuado para automatización de navegación y testing de interfaces.
- Evaluación de documentos con preguntas tipadas: sobre un documento o JSON, el modelo responde preguntas `noul` (¿contiene esta cláusula?) y `score` (nivel de riesgo en una escala), útil en revisión contractual y cumplimiento normativo.
- Moderación y filtrado de contenido: con preguntas `noul` sobre texto e imágenes, el modelo emite probabilidades de que un contenido cumpla o incumpla una política, aprovechando la calibración declarada de 4,8 puntos de error.
- Enrutamiento en pipelines de agentes: como "sistema uno" que decide rápidamente qué herramienta o subagente invocar a partir del estado de la conversación, antes de delegar en un modelo generativo de "sistema dos".
- Análisis de conversaciones multi-turno: con 32.768 tokens de contexto, el modelo evalúa el estado completo de una conversación y responde preguntas `score` sobre satisfacción o intención, adecuado para analítica de atención al cliente.
- Verificación de extracción de datos: comparar el JSON extraído con la imagen del documento original mediante preguntas `noul` por campo, como paso de control de calidad en pipelines de OCR y extracción estructurada.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Notas |
|---|---|---|---|
| Decision Index 0.4.1, Full score | decision_index_full | 73,86 | Leaderboard del 12 de noviembre de 2026; rank #1 de 300 entradas |
| Decision Index 0.4.1, tests privados mismas habilidades | escala pública | 70,7 | 60% de los tests privados |
| Decision Index 0.4.1, tareas de nuevos dominios | escala pública | 78,6 | 40% de los tests privados |
| Decision Index 0.3, índice público | decision_index | 75,05 | Corregido por azar; ejecución propia del kit oficial |
| Índice bruto (0.3) | raw index | 80,9 | — |
| Breadth (0.3) | breadth | 74,7 | — |
| Knowledge & Reasoning (0.3) | — | 65,5 | — |
| Language Understanding (0.3) | — | 76,8 | — |
| Retrieval & Classification (0.3) | — | 76,4 | — |
| Tools & Automation (0.3) | — | 88,4 | — |
| Arts & Human Taste (0.3) | — | 68,2 | — |
| Latencia mediana | — | 94 ms por petición | Una GPU, una petición a la vez |
| Error de calibración | — | 4,8 puntos | — |

El suite público consta de 140.178 peticiones puntuadas, con 11 no soportadas (preguntas que junto con su estado superan los 32.768 tokens). El leaderboard agrupa en un mismo rank a los modelos dentro de 0,9 puntos del primero: karpo-decision-31B (73,9) y GLiDE 27B (73,4) comparten el #1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 31,3B parámetros en bf16 los pesos ocupan aproximadamente 62,6 GB, por lo que se necesita al menos una GPU de 80 GB en bf16.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una A100 80 GB o H100 80 GB permitirían cargar los pesos en bf16.
- ¿Cabe en GPU de consumo? No en bf16; se requeriría cuantización, cuyos tipos no están documentados.
- Opciones de despliegue: API Python y servidor HTTP en el formato System One (`POST /v1/systemone`) incluidos por el autor; compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: latencia mediana de 94 ms por petición en una GPU con una petición a la vez; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.4.1 Full | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karpo-decision-31B | 31,3B | 32.768 | 73,9 (rank #1) | Apache-2.0 | Hugging Face |
| GLiDE 27B | 27B (aprox.) | no disponible | 73,4 (rank #1 compartido) | no disponible | no disponible |
| karpo-decision-12B | 12,0B | no disponible | no disponible | no disponible | Hugging Face |
| karpo-decision-9B | 8,4B | no disponible | no disponible | no disponible | Hugging Face |

Dentro de la propia familia Karpo Decision existen variantes de 12B (base Gemma 4 12B), 9B y 4B (base Qwen3.5) y 2B, pero no se han proporcionado sus puntuaciones en el Decision Index 0.4.1. No se dispone de datos de benchmarks de modelos comparables de otros autores más allá de GLiDE 27B.

## Limitaciones y advertencias

- El modelo no genera texto: solo emite probabilidades sobre opciones predefinidas, por lo que no sirve para tareas generativas.
- Límite de 32.768 tokens por secuencia; las peticiones más largas se dividen por preguntas, lo que puede perder contexto global.
- Máximo de 255 opciones por pregunta de tipo `choice`.
- Los resultados del Decision Index son declarados por el autor y no están verificados (`verified: false` en el model-index); conviene tratarlos con cautela.
- El leaderboard agrupa a modelos dentro de 0,9 puntos, por lo que el #1 se comparte con GLiDE 27B y no es una ventaja concluyente.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento (error de calibración de 4,8 puntos en el suite evaluado).
- Idiomas soportados: no disponible; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base google/gemma-4-31B-it, de la que depende.
- No hay información sobre cuantizaciones disponibles ni sobre el rendimiento en GPUs de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio GitHub: https://github.com/machinepulse-ai/karpo-decision
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados del run en el Decision Index: https://huggingface.co/datasets/MachinePulseAI/karpo-decision-31B-decision-index
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-31B/blob/main/LICENSE
- Variante 12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Variante 9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Variante 4B: https://huggingface.co/MachinePulseAI/karpo-decision-4B
