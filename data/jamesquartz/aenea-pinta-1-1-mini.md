# JamesQuartz/aenea-pinta-1.1-mini

## Resumen

AENEA Pinta-1.1 Mini Beta es un enrutador semántico de 50 millones de parámetros desarrollado por JamesQuartz (familia AENEA/Pinta). No es un modelo generativo: clasifica el prompt entrante en uno de nueve dominios de despacho y emite un token de enrutamiento reservado que los sistemas posteriores utilizan para seleccionar el modelo experto o la herramienta adecuada. Está pensado para clasificación always-on en enjambres de agentes, sidecars de CLI y despacho en el edge, donde la latencia importa más que la precisión máxima.

Técnicamente es un transformer denso de 20 capas con hidden size 512, 8 cabezas de atención y atención ortogonal basada en Block Householder con 8 reflexiones (block_size 64). Emplea el tokenizador QT-Cittern-1.0 con un vocabulario de 9.216 tokens y una ventana de contexto de 2.048 tokens. La cabeza de enrutamiento es causal de forma `[B, S, V]` restringida a una rebanada de 9 tokens reservados.

La relevancia actual del modelo radica en su relación rendimiento/latencia: según la model card, ofrece un 72,50% de precisión estricta (frente al 79,22% del Pinta-1.1 de 226M) con una inferencia de ~14 ms p50 en CPU de 4 hilos y un binario ONNX de 98 MB. Se distribuye como release Beta y requiere calibración en inferencia mediante un vector de sesgo de clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 20 capas ("Cartan"), hidden size 512, 8 cabezas de atencion, atencion ortogonal Block Householder (8 reflexiones, block_size 64) |
| Parametros totales | 50 millones |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bf16 y ONNX fp32 (no se han publicado variantes GGUF/INT8/INT4) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32, ~98 MB) con fichero de datos externo; se menciona tambien bf16 en la model card |
| Vocabulario | 9.216 tokens (tokenizador QT-Cittern-1.0) |
| Cabeza de enrutamiento | Causal `[B, S, V]` con rebanada de 9 tokens reservados |
| Clases de despacho | 9: Formatting, Code, Creative, RAG, Architecture, Math, Knowledge, Law, Conversational |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La model card describe un transformer denso de 50M de parámetros con 20 capas, hidden size 512 y 8 cabezas de atención. La innovación arquitectónica destacada es el uso de atención ortogonal con transformaciones Block Householder (8 reflexiones, block_size 64). El modelo no genera texto: en una única pasada forward proyecta sobre una rebanada de 9 tokens reservados del vocabulario y devuelve la clase de despacho correspondiente, imitando la decisión que tomaría un modelo generativo completo sobre cuál sería su siguiente token.

El entrenamiento se realizó mediante SFT (supervised fine-tuning), según se deduce del aviso de Beta que menciona un desequilibrio en las clases del conjunto de SFT: la cabeza de enrutamiento arrastra un prior de clase medible, con un pico de logits de aproximadamente +12 sobre el token `<|reserved_27|>` (clase Architecture). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases posteriores de RLHF o DPO. La model card indica que la evaluación completa sobre el benchmark Pinta Gold (1.020 prompts, 8 dominios puntuados más una suite de inmunidad adversarial) está pendiente; los números publicados corresponden a un subconjunto etiquetado de 40 prompts con `bias_scale` óptimo de 0,60.

## Capacidades

- Clasificación de prompts en 9 dominios de despacho: Formatting, Code, Creative, RAG, Architecture, Math, Knowledge, Law y Conversational.
- Emisión de un token de enrutamiento reservado (`<|reserved_23|>` a `<|reserved_31|>`) consumible directamente por sistemas de despacho posteriores.
- Inferencia en una sola pasada forward sin decodificación autoregresiva.
- Ejecución en CPU: ~14 ms p50 y ~16 ms p95 con 4 hilos.
- Puerta de confianza integrada en el wrapper (umbral por defecto 0,35) que redirige a `<|reserved_29|>` (Knowledge) cuando la probabilidad máxima no supera el umbral, evitando enrutamientos silenciosos de baja confianza.
- Calibración en inferencia mediante vector de sesgo de 9 floats aplicado antes de softmax con `bias_scale=0.60`.
- Resistencia adversarial: 91,18% de inmunidad reportada en la suite adversarial del benchmark.
- No soporta tool calling, agentes multi-step, visión, audio ni generación de texto; su única salida es la etiqueta de clase y la confianza asociada.
- Capacidad multilingüe: limitada a inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Despacho en enjambres de agentes: cada prompt entrante se clasifica en ~14 ms en CPU y se enruta al experto correspondiente (modelo de código, de matemáticas, de derecho) sin consumir GPU ni añadir latencia perceptible al pipeline.
- Sidecar de CLI: el daemon en C++ (`pinta_router.cpp`) incluido en el repositorio permite ejecutar el enrutador como proceso local junto a herramientas de línea de comandos, decidiendo a qué backend enviar cada consulta del usuario.
- Middleware en pasarelas de API de LLM: intercalado antes del modelo generativo, permite seleccionar el endpoint más barato o más adecuado según la clase detectada (Code, Math, Law) y reducir coste por token.
- Pre-filtrado en pipelines RAG: la clase RAG (`<|reserved_26|>`) permite desviar consultas que requieren recuperación documental antes de invocar al modelo de generación, evitando llamadas innecesarias a la base vectorial.
- Despliegue en edge o dispositivos con recursos limitados: con 98 MB en ONNX y ejecución en CPU, cabe en routers, gateways IoT o dispositivos tipo Raspberry Pi donde no hay GPU disponible.
- Enrutamiento de tickets de soporte en inglés: la clase Conversational frente a Knowledge, Law o Code permite triaje automático previo a la asignación a un agente humano o a un modelo especializado.
- Control de admisión en sistemas multi-modelo: la puerta de confianza con umbral 0,35 evita enviar prompts ambiguos a un experto equivocado, derivándolos a un modelo generalista de respaldo.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados sobre el benchmark Pinta Gold (nota del autor: precisión estricta medida sobre un conjunto etiquetado de 40 prompts con `bias_scale` óptimo de 0,60; la evaluación completa de 1.020 prompts está pendiente):

| Metrica | Pinta-1.1 (226M) | Pinta-1.1 Mini (50M) |
|---|---|---|
| Precision estricta | 79,22% | 72,50% |
| Precision flexible | 82,35% | 75,49% |
| Inmunidad adversarial | 94,12% | 91,18% |
| Latencia p50 (4 hilos, CPU) | ~45 ms | ~14 ms |
| Latencia p95 (4 hilos, CPU) | ~52 ms | ~16 ms |
| Tamano del modelo (ONNX) | 452 MB | 98 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general, lo cual es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El binario ONNX fp32 ocupa 98 MB en disco, por lo que el modelo en memoria se mantiene holgadamente por debajo de 1 GB tanto en CPU como en GPU.
- GPU recomendadas: ninguna en particular; el modelo está diseñado para inferencia en CPU. Puede ejecutarse en cualquier GPU, incluida una RTX 4090, pero no se aprovecharía su capacidad de cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en hardware sin GPU (CPU de escritorio, portátil, placas tipo Raspberry Pi o Jetson).
- Opciones de despliegue: ONNX Runtime (`onnxruntime`) con el wrapper Python `pinta_router.py`, y daemon en C++ (`pinta_router.cpp`) para despliegue en edge. No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: ~14 ms p50 y ~16 ms p95 con 4 hilos de CPU (datos del autor). No se publica throughput agregado ni latencias para otras configuraciones de hilos.
- Almacenamiento: repositorio de 0,3 GB, incluyendo modelo, tokenizador, vector de sesgo y scripts.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la información proporcionada. La única comparación documentada es con el modelo hermano de la misma familia:

| Modelo | Parametros | Contexto | Precision estricta | Latencia p50 (CPU, 4 hilos) | Tamano ONNX | Licencia |
|---|---|---|---|---|---|---|
| AENEA Pinta-1.1 Mini | 50M | 2.048 tokens | 72,50% | ~14 ms | 98 MB | Apache 2.0 |
| AENEA Pinta-1.1 | 226M | no disponible | 79,22% | ~45 ms | 452 MB | Apache 2.0 (misma familia) |

Alternativas de terceros en la categoría de enrutadores semánticos ligeros: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Release Beta: el autor advierte explícitamente de que se trata de una versión Beta con estabilidad no garantizada.
- Sesgo de clase conocido: la cabeza de enrutamiento arrastra un prior procedente del desequilibrio del conjunto de SFT, con un pico de logits de aproximadamente +12 sobre `<|reserved_27|>` (Architecture). Es obligatorio aplicar el fichero de sesgo con `bias_scale=0.60` antes de softmax; sin esta calibración los enrutamientos serán sistemáticamente incorrectos.
- Riesgo de enrutamiento erróneo: la precisión estricta es del 72,50%, es decir, aproximadamente uno de cada cuatro prompts se clasifica en el dominio equivocado si se mide con criterio estricto.
- Cobertura de evaluación limitada: los números publicados corresponden a 40 prompts etiquetados; la evaluación completa sobre 1.020 prompts está pendiente, por lo que las cifras deben tratarse como provisionales.
- Idioma: solo inglés. El comportamiento con prompts en castellano u otros idiomas no está documentado y no se puede asumir que sea correcto.
- Ventana de contexto corta: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas; el router debe recibir únicamente el prompt o un resumen del mismo.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step. No debe utilizarse como sustituto de un LLM.
- Limitaciones de integración: a diferencia de Pinta-1.1 (226M), no incluye el motor de enrutamiento FastAPI (`pinta_engine.py`); solo proporciona el wrapper de clasificación, por lo que la integración con backends externos (Ollama, vLLM, OpenAI) debe implementarla el usuario.
- Confianza baja en prompts ambiguos: el modelo puede devolver confianzas muy reducidas (el ejemplo de la model card muestra 0,188 para una pregunta general), lo que activa el fallback a Knowledge; conviene revisar el umbral de la puerta de confianza según el caso de uso.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero al ser una Beta conviene validar el comportamiento en producción antes de depender de ella.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/JamesQuartz/aenea-pinta-1.1-mini
- HuggingFace (modelo completo de la familia): https://huggingface.co/JamesQuartz/aenea-pinta-1.1
- Repositorio GitHub, paper, blog o demo: no disponible en la información proporcionada.
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a foros de traducción de efectos de Adobe After Effects) y no aportan enlaces relevantes.
