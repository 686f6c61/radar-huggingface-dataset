# machinez/karpo-decision-31B-NVFP4

## Resumen
Karpo Decision 31B es un modelo de decisión multimodal desarrollado por machinez (familia MachinePulseAI), afinado a partir de google/gemma-4-31B-it. Su función no es generar texto, sino responder preguntas tipadas sobre un estado dado (una página web y su captura, un documento o una conversación en texto, JSON e imágenes) devolviendo, en un único forward pass, una probabilidad para cada opción de cada pregunta. Resuelve el problema de la toma de decisiones estructurada y evaluable dentro de pipelines de agentes, donde se necesita una salida probabilística calibrada en lugar de una generación libre.

La arquitectura parte del transformer de Gemma 4 31B, con un cabezal lineal de lectura (readout) de 255 × 5.376 en fp32 sobre las opciones. Admite tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (un nivel en una escala). El contexto es de 32.768 tokens por secuencia, y las peticiones más largas se dividen por preguntas, cada parte con el estado completo.

Es relevante ahora porque encabeza el leaderboard Decision Index 0.4.1 (12 de noviembre de 2026) con una puntuación Full de 73,9, la más alta de 300 entradas, compartiendo el primer puesto con GLiDE 27B (73,4). Se distribuye en formato NVFP4 de 8 bits mediante compressed-tensors, lo que reduce el peso del repositorio a 20,5 GB frente a los 31,3B parámetros en bf16 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con cabezal lineal de lectura sobre opciones; multimodal texto e imagen |
| Parametros totales | 18.460.143.972 (pesos cuantizados en el repo); 31,3B en bf16 segun la model card, mas readout de 255 × 5.376 en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantizacion | NVFP4 (8 bits, compressed-tensors); el modelo base admite bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento
El modelo es un fine-tune de google/gemma-4-31B-it, un transformer multimodal que procesa texto e imágenes. La innovación principal es la sustitución de la generación autoregresiva por un readout lineal en fp32 de 255 × 5.376 dimensiones que proyecta el estado oculto sobre las opciones de cada pregunta, produciendo una distribución de probabilidad en un solo forward pass. Esto elimina la latencia de decodificación token a token y permite evaluar hasta 255 opciones simultáneamente. El modelo acepta una captura de pantalla en `state.viewport_screenshot` o imágenes como data URLs en el campo `images`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card únicamente indica que se trata de un fine-tune con readout lineal y que el autor lo describe como un modelo "system-one", en referencia a la toma de decisiones rápida e intuitiva. El contexto se gestiona partiendo las peticiones largas por preguntas, replicando el estado completo en cada fragmento, lo que implica un consumo de contexto proporcional al número de preguntas cuando el estado es extenso.

## Capacidades
- Clasificación y decisión tipada: responde preguntas `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (nivel en una escala), devolviendo probabilidades calibradas por opción.
- Procesamiento multimodal: acepta texto, JSON e imágenes (capturas de pantalla de páginas web o data URLs).
- Decisión en un solo forward pass: no genera texto, lo que reduce la latencia y evita derivas de generación.
- Evaluación de estados complejos: páginas web con su captura, documentos y conversaciones multi-turno.
- Salida probabilística calibrada: error de calibración de 4,8 puntos según la model card.
- Interfaces de despliegue: API Python y servidor HTTP en formato System One (`POST /v1/systemone`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes multi-step y modo thinking: no disponibles en la información proporcionada.

## Casos de uso
- Enrutamiento de peticiones en agentes: dado un estado conversacional y una pregunta `choice` con las posibles acciones o herramientas, el modelo devuelve la probabilidad de cada una en 94 ms de latencia mediana, lo que permite seleccionar la ruta sin coste de generación.
- Verificación de formularios y flujos web: con la captura de pantalla en `state.viewport_screenshot`, responde preguntas `noul` sobre si un campo está relleno o un botón visible, útil en automatización de navegador.
- Moderación y clasificación de contenido: preguntas `score` sobre niveles de riesgo o gravedad en documentos y conversaciones, aprovechando la calibración de 4,8 puntos para fijar umbrales operativos.
- Extracción de decisiones en documentos largos: con 32.768 tokens de contexto por secuencia y partición por preguntas, evalúa documentos extensos respondiendo múltiples cuestiones tipadas sobre el mismo estado.
- Evaluación automática de respuestas de otros modelos: dado un estado con la pregunta y la respuesta candidata, decide con `choice` o `score` si la respuesta es correcta o su calidad, integrándose en pipelines de evaluación.
- Control de calidad en atención al cliente: sobre una conversación multi-turno, responde preguntas `noul` sobre si se ha resuelto la incidencia o `score` sobre la satisfacción, sin generar texto adicional.
- Clasificación multimodal de capturas de interfaz: detecta estados de UI (errores, pantallas de carga, diálogos) combinando la imagen con el texto del estado para decidir la siguiente acción de un agente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decision Index 0.4.1, Full score (leaderboard, 12 nov 2026) | 73,86 (rank #1 de 300 entradas; comparte #1 con GLiDE 27B, 73,4) |
| Tests privados, mismas habilidades (escala pública) | 70,7 |
| Tareas privadas, nuevos dominios (escala pública) | 78,6 |
| Indice publico (ejecucion propia, adoptada por el board) | 75,05 |
| Indice bruto | 80,9 |
| Breadth | 74,7 |
| Knowledge & Reasoning | 65,5 |
| Language Understanding | 76,8 |
| Retrieval & Classification | 76,4 |
| Tools & Automation | 88,4 |
| Arts & Human Taste | 68,2 |
| Latencia mediana (una GPU, una peticion a la vez) | 94 ms por peticion |
| Error de calibracion | 4,8 puntos |

La suite pública consta de 140.178 peticiones puntuadas, con 11 no soportadas por exceder los 32.768 tokens junto con su estado. Los resultados proceden de la ejecución propia del autor y de la model card; no se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware
- VRAM estimada: el repositorio NVFP4 de 8 bits ocupa 20,5 GB, por lo que la inferencia requiere aproximadamente 22-24 GB de VRAM incluyendo overhead de activaciones y contexto.
- GPU recomendadas: A100 40GB, H100 80GB o L40S 48GB para despliegue en producción con contexto completo; RTX 4090 24GB puede ajustar el modelo cuantizado, aunque con margen limitado para contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090 24GB y potencialmente en RTX 3090 24GB con cuantización NVFP4; no cabe en GPUs de 16GB o menos.
- Opciones de despliegue: transformers con compressed-tensors para los pesos NVFP4; el autor proporciona API Python y servidor HTTP en formato System One. No se especifica soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 94 ms de latencia mediana por petición en una GPU con una petición a la vez, según la model card. No se dispone de datos de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.4.1 Full | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karpo-decision-31B | 31,3B (18,46B en NVFP4) | 32.768 | 73,9 (#1) | Apache-2.0 | Hugging Face |
| GLiDE 27B | 27B | no disponible | 73,4 (#1 compartido) | no disponible | no disponible |
| karpo-decision-12B | 12,0B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| karpo-decision-9B | 8,4B | no disponible | no disponible | Apache-2.0 | Hugging Face |

El modelo comparte el primer puesto del leaderboard con GLiDE 27B dentro del margen de 0,9 puntos que el board aplica para agrupar posiciones. Los modelos de la misma familia (12B, 9B, 4B, 2B) ofrecen alternativas de menor tamaño, pero no se han publicado sus puntuaciones Full en la información disponible.

## Limitaciones y advertencias
- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas; no sirve para tareas de generación.
- Límite de contexto: 32.768 tokens por secuencia; las peticiones que exceden este límite con su estado se dividen por preguntas, lo que puede incrementar el coste y el número de llamadas.
- Límite de opciones: máximo de 255 opciones por pregunta `choice`.
- Idiomas soportados no declarados: se desconoce el rendimiento en castellano u otros idiomas distintos del inglés.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Gemma 4, hereda los sesgos del modelo base, no documentados en esta ficha.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a la calibración de probabilidades; el error de calibración de 4,8 puntos implica que las probabilidades no son exactas y deben usarse con umbrales adecuados.
- Resultados no verificados: las métricas del model-index tienen `verified: false`; proceden del autor y del leaderboard, no de una verificación independiente.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base google/gemma-4-31B-it, cuyos términos pueden imponer restricciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/machinez/karpo-decision-31B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados de la ejecución en el Decision Index: https://huggingface.co/datasets/MachinePulseAI/karpo-decision-31B-decision-index/tree/main/runs/karpo-decision-31B
- Repositorio GitHub: https://github.com/machinepulse-ai/karpo-decision
- Modelo karpo-decision-12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo karpo-decision-9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
