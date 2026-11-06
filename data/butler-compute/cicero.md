# butler-compute/Cicero

## Resumen

Cicero es un modelo de decisión desarrollado por Butler Compute, Inc. a partir de un ajuste fino (post-train) del modelo MoE Qwen/Qwen3.5-35B-A3B. A diferencia de un modelo generativo convencional, Cicero no produce texto: recibe un estado (texto, una conversación o hasta 4 imágenes) junto con hasta 64 preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta en un único forward pass.

El modelo resuelve el problema de la clasificación y la toma de decisiones estructurada con latencia muy baja: según el autor, alcanza 71,33 puntos en el índice público JDI (Jev Decision Index) con solo 3B de parámetros activos y una latencia mediana de 41 ms. Soporta tres tipos de pregunta (sí/no, elección entre hasta 255 opciones y puntuación en escala) y contextos de hasta 131.072 tokens.

Es relevante ahora porque propone una alternativa a la generación de texto para tareas de enrutamiento, clasificación de intenciones, invocación de herramientas y evaluación, donde la salida estructurada con probabilidades calibradas y la latencia de decenas de milisegundos son más útiles que una respuesta generada. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) derivado de Qwen3.5-35B-A3B, con torre de visión del modelo base |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | 3B (aproximado, según model card) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | Texto, chat, hasta 4 imágenes |
| Salida | Probabilidad por opción (sin generación de texto) |
| Tipos de pregunta | sí/no (`noul`), elección (`choice`, hasta 255 opciones), puntuación (`score`) |
| Preguntas por petición | hasta 64 |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

Cicero es un post-train de Qwen3.5-35B-A3B, un transformer con arquitectura de mezcla de expertos (MoE) de 35B parámetros totales y aproximadamente 3B activos por token. La torre de visión es la del modelo base, lo que permite introducir hasta 4 imágenes como parte del estado de entrada. El modelo conserva la ventana de contexto de 131.072 tokens del base.

El mecanismo de inferencia no genera texto: cada pregunta se serializa como texto plano (el contexto, la pregunta y sus opciones etiquetadas A, B, C...), el modelo lee ese prompt en un único forward pass y la respuesta se extrae de las puntuaciones (logits) asignadas a las letras de las opciones al final del prompt. Esas puntuaciones se convierten en probabilidades y se calibran por tipo de pregunta. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; únicamente indica que se trata de un ajuste fino del modelo base.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de sí/no, de elección única entre hasta 255 opciones y de puntuación en escala (por ejemplo, 1-5), devolviendo una probabilidad por opción.
- Calibración por tipo de pregunta: las probabilidades se ajustan según la naturaleza de la pregunta, lo que permite usarlas directamente como umbrales en producción.
- Procesamiento de múltiples preguntas por petición: hasta 64 preguntas tipadas en una sola llamada.
- Entrada multimodal: acepta texto, conversaciones y hasta 4 imágenes.
- Contexto largo: hasta 131.072 tokens, útil para documentos extensos o historiales de conversación.
- Detección de invocación de herramientas: la model card muestra su uso para decidir qué herramienta invocar en un contexto de function calling (ejemplo BFCL).
- Clasificación de intenciones: ejemplo de la model card con BANKING77 y 77 intenciones.
- Capacidad multilingüe: limitada al inglés según el campo `language: en`.
- No genera texto: no es adecuado para tareas de generación libre, resumen o diálogo generativo.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: clasificar el mensaje del usuario entre decenas de intenciones (como en el ejemplo BANKING77 con 77 clases) y obtener una probabilidad calibrada que permita derivar a un agente humano cuando la confianza sea baja.
- Selección de herramientas en agentes: decidir qué función o API invocar ante una petición en lenguaje natural, usando preguntas de elección sobre el catálogo de herramientas disponibles en un solo forward pass.
- Moderación y filtrado de contenido: formular preguntas de sí/no sobre políticas concretas y usar la probabilidad resultante como señal de decisión con umbral configurable.
- Evaluación automática de respuestas: puntuar en escala (por ejemplo, 1-5) la calidad de una respuesta generada por otro modelo, aprovechando la calibración por tipo de pregunta.
- Clasificación de documentos con contexto largo: analizar contratos, informes o hilos de conversación de hasta 131.072 tokens y responder varias preguntas estructuradas sobre ellos en una sola llamada.
- Triage multimodal: incorporar hasta 4 imágenes junto con texto para decidir categorías en flujos de inspección o verificación documental.
- Enrutamiento de bajo coste en pipelines de producción: con 3B de parámetros activos y 41 ms de latencia mediana, puede colocarse como primera etapa de decisión antes de invocar modelos generativos más caros.

## Benchmarks y rendimiento

Resultados del índice JDI 0.4.1 (suite pública), con corrección por azar (0 = azar, 100 = perfecto), según la model card:

| Area | Cicero | mammoth-1 | elephant-1 | Decider v1.2 | Drex Max |
|---|---:|---:|---:|---:|---:|
| Tools & Automation | 87.0 | 88.6 | 88.0 | 85.4 | 81.9 |
| Retrieval & Classification | 76.1 | 77.4 | 76.2 | 68.1 | 68.8 |
| Language Understanding | 74.6 | 76.1 | 73.8 | 71.9 | 72.2 |
| Arts & Human Taste | 64.4 | 64.1 | 61.6 | 56.2 | 53.4 |
| Knowledge & Reasoning | 56.1 | 68.0 | 60.6 | 55.3 | 57.1 |
| **Public JDI** | 71.33 | 75.34 | 72.24 | 67.74 | 67.52 |

Datos adicionales declarados por el autor: latencia mediana de 41 ms. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 35,1B parámetros totales y pesos en safetensors (repo de 70,2 GB), la inferencia en precisión completa requiere del orden de decenas de GB de VRAM; no se especifican requisitos oficiales.
- GPU recomendadas: no disponible. Por tamaño, el despliegue en precisión completa encajaría en aceleradores de clase A100/H100 de 80 GB; no confirmado por el autor.
- ¿Cabe en GPU de consumo? No hay datos oficiales. Con cuantización agresiva podría plantearse en GPUs de 24 GB, pero no se han publicado tipos de cuantización ni pesos GGUF.
- Opciones de despliegue: la model card marca `inference: false`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato safetensors es compatible con stacks habituales de Hugging Face Transformers, aunque el flujo de decisión requiere el procedimiento de lectura de logits descrito por el autor.
- Latencia y throughput: latencia mediana de 41 ms según el autor; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JDI público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cicero | 35,1B totales / 3B activos | 131.072 | 71,33 | Apache 2.0 | Hugging Face |
| mammoth-1 | no disponible | no disponible | 75,34 | no disponible | no disponible |
| elephant-1 | no disponible | no disponible | 72,24 | no disponible | no disponible |
| Decider v1.2 | no disponible | no disponible | 67,74 | no disponible | no disponible |
| Drex Max | no disponible | no disponible | 67,52 | no disponible | no disponible |

Cicero lidera en Arts & Human Taste (64,4) y supera a Decider v1.2 en todas las áreas, pero queda por detrás de mammoth-1 y elephant-1 en el índice global. Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre, resúmenes ni diálogo; su salida es siempre un conjunto de probabilidades.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad.
- Riesgo de calibración incorrecta fuera de distribución: las probabilidades están calibradas para los tipos de pregunta y dominios evaluados; su fiabilidad en dominios nuevos no está garantizada.
- Conocimiento y razonamiento: es el área más débil según el propio autor (56,1 frente a 68,0 de mammoth-1), por lo que no es adecuado para tareas que exijan razonamiento profundo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-35B-A3B.
- Estado del modelo: publicación muy reciente (noviembre de 2026) con 0 descargas y 1 like en Hugging Face; no hay evidencia de uso en producción ni de terceros independientes.
- Despliegue: la model card marca `inference: false` y no documenta cuantizaciones ni integraciones con servidores de inferencia, lo que añade trabajo de integración.
- Los benchmarks proceden de una ejecución propia del autor sobre la suite pública JDI, no de una evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/butler-compute/Cicero
- Sitio web de Butler Compute: https://butlercompute.com
- Investigación: https://butlercompute.com/research
- Contacto: https://butlercompute.com/contact
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
