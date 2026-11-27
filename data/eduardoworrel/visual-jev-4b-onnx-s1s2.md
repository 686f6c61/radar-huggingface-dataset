# eduardoworrel/Visual-Jev-4B-ONNX-S1S2

## Resumen

Visual-Jev-4B-ONNX-S1S2 es una compilación en formato ONNX del modelo visual-jev-4b-answer-sft, un adaptador LoRA entrenado sobre Qwen3-VL-4B-Instruct que responde preguntas de elección cerrada sobre una única imagen. El modelo devuelve, para cada pregunta, una distribución de probabilidad sobre las opciones suministradas (de 2 a 16), leyendo el logit de la letra correspondiente en la cabeza LM. Lo publica el usuario eduardoworrel y está pensado para ejecutarse en navegador (WebGPU) y en Node mediante la librería s1s2.js.

La propuesta técnica es un esquema de doble sistema (system-1 / system-2): una única codificación de la imagen sirve para responder cualquier número de preguntas posteriores, lo que abarata el coste cuando se lanzan muchas consultas sobre la misma imagen. El adaptador está fusionado en un decodificador de texto cuantizado a int4 (RTN, bloque 32) con activaciones en float32, y el conjunto pesa 3,82 GB.

Es relevante porque demuestra inferencia multimodal con decisiones tipadas y probabilísticas directamente en el cliente, sin servidor, sobre la base de Qwen3-VL-4B. La licencia es Apache-2.0 y el modelo base es de Qwen Team. El modelo solo declara soporte de inglés y está orientado a tareas de elección cerrada, no a generación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-4B) con adaptador LoRA fusionado y cabeza de decisión tipada; decodificador de texto + torre de visión con DeepStack |
| Parametros totales | 4B (modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de píxeles de 65.536 a 200.704, con un máximo de 196 tokens de imagen) |
| Tipos de cuantizacion | int4 (RTN, bloque 32) en texto y visión; embeddings en float16; activaciones float32 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (text.onnx + text.onnx.data, vision.onnx + vision.onnx.data), embedding.fp16, option_rows.f16, tokenizer.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal con torre de visión y decodificador de lenguaje. Sobre él se aplica un adaptador LoRA (visual-jev-4b-answer-sft, de Guanxu Yu y Yuhang Yao) que transforma la tarea en una clasificación de elección cerrada: la pregunta se formula como una instrucción más una lista de opciones, y la respuesta se extrae del logit de la letra de cada opción (de ` A` a ` P`, con 16 filas precalculadas en `option_rows.f16`). La cabeza LM está atada a los embeddings, de modo que las puntuaciones usan las mismas filas.

La compilación ONNX separa el grafo de texto (decodificador int4 con el adaptador fusionado, entradas `inputs_embeds`, `attention_mask`, `position_ids` [3, B, S], caché KV y `deepstack_0..2`) del grafo de visión (torre int4 con las tres características DeepStack como salidas extra). Los embeddings se consultan en JavaScript desde `embedding.fp16`. Una sola codificación de imagen alimenta todas las preguntas posteriores, lo que constituye la innovación principal del esquema. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas visuales de elección cerrada (visual question answering) con 2 a 16 opciones por pregunta.
- Salida probabilística tipada: `decision`, `probability`, `probabilities` por opción, `margin` (p1 - p2) y `rawMargin` (diferencia de logits).
- Codificación compartida de una imagen para múltiples preguntas, con contexto compartido opcional.
- Soporte de contexto textual adicional por imagen (por ejemplo, descripciones o metadatos del inventario visual).
- Ejecución en navegador mediante WebGPU y en Node mediante onnxruntime-node (CPU).
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, audio o generación de texto libre: no disponibles.

## Casos de uso

- Inventario visual automatizado: una sola imagen de un producto o estantería se codifica una vez y se lanzan varias preguntas de sí/no o de categoría (color, presencia de objetos, estado), aprovechando que la codificación se comparte entre preguntas.
- Verificación de control de calidad en línea de producción: preguntas cerradas del tipo "¿la etiqueta es legible?", "¿el precinto está intacto?" con probabilidad por opción para umbralizar decisiones.
- Asistentes web sin backend: al ejecutarse en el navegador con WebGPU, permite clasificar imágenes del usuario sin enviar datos a un servidor, útil en aplicaciones de privacidad sensible.
- Anotación asistida de datasets: preguntas de elección cerrada sobre imágenes para preetiquetar categorías o atributos antes de la revisión humana.
- Accesibilidad y descripción guiada: responder consultas cerradas sobre el contenido de una imagen (por ejemplo, "¿hay una persona?", "¿qué color domina?") en aplicaciones de asistencia.
- Triaje en Node/CLI: procesamiento por lotes en CPU con onnxruntime-node para clasificar imágenes con preguntas predefinidas en pipelines ligeros (2,2 a 3,0 s por pregunta en la medición del autor).
- Filtrado previo en moderación de contenido: preguntas cerradas con opción explícita de "not enough evidence" para derivar casos ambiguos a revisión humana.

## Benchmarks y rendimiento

El autor no reproduce los benchmarks del paper. Las únicas mediciones publicadas son de coste y latencia sobre el split de test de ScienceQA (primeras 240 preguntas con imagen y 2 a 8 opciones), en un Mac Apple Silicon de 16 GB con Chrome headless y onnxruntime-web 1.31.1:

| Metrica | Valor |
|---|---|
| Tiempo por pregunta (mediana / p95) | 15,6 s / 28,3 s |
| De los cuales visión en WASM (mediana) | 10,8 s |
| De los cuales rama de pregunta en WebGPU (mediana) | 4,3 s |
| Node CPU (onnxruntime-node), 3 preguntas | 2,2 a 3,0 s |
| Visión en WebGPU (valores incorrectos en ORT-web 1.31.1) | 3,7 s |
| Ambos grafos en WASM | 65 a 85 s por pregunta |
| Memoria residente pico en Chrome (240 preguntas) | ~3,0 GB |

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el autor indica explícitamente que ScienceQA queda fuera de las familias de entrenamiento (GQA y SNLI-VE) y que el repositorio no reprodujo los números del paper.

## Requisitos de hardware

- Descarga: 3,82 GB (3,56 GiB); el texto ocupa 2,04 + 0,48 GB y la visión 0,33 + 0,18 GB.
- Memoria residente: alrededor de 3 GB en Chrome al cargar los pesos; pico cercano a 3,0 GB en la ejecución de 240 preguntas.
- GPU recomendadas: no disponibles; el autor solo reporta ejecución en Apple Silicon (16 GB) con WebGPU para el grafo de texto y WASM de un solo hilo para visión.
- Cabe en GPU de consumo: no disponible como dato medido; la cuantización int4 del decodificador de 4B sugiere que es viable en hardware de consumo, pero no se aportan cifras de VRAM.
- Opciones de despliegue: onnxruntime-web (WebGPU/WASM) en navegador, onnxruntime-node (CPU) en Node, y la librería @s1s2/web con el bloque `image` del manifiesto (no presente en la versión 0.2.1).
- Latencia: 15,6 s de mediana por pregunta en el entorno medido; 2,2 a 3,0 s por pregunta en Node CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Visual-Jev-4B-ONNX-S1S2 | 4B | no disponible (máx. 196 tokens de imagen) | ONNX int4 | Apache-2.0 | Elección cerrada con probabilidades, en navegador |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | safetensors | Apache-2.0 (según modelo base) | Generación multimodal libre |
| Alternativas de VQA de elección cerrada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Las probabilidades son un softmax crudo sobre las opciones suministradas y están sobreconfiadas; no hay abstención fuera de las opciones, por lo que conviene añadir una opción como "not enough evidence".
- El orden de las opciones forma parte de la pregunta y nunca se permuta; alterarlo puede cambiar el resultado.
- La torre de visión en WebGPU devuelve valores incorrectos en onnxruntime-web 1.31.1, por lo que el paquete ejecuta la visión en WASM y la latencia se dispara (10,8 s de mediana solo en visión).
- Solo se declara inglés; no hay soporte multilingüe documentado.
- El presupuesto de píxeles limita la imagen a un máximo de 196 tokens; las imágenes grandes se reescalan con un redimensionado bicúbico que replica Pillow.
- El modelo está entrenado sobre registros de preguntas de GQA y SNLI-VE; ScienceQA queda fuera de esas familias y el autor advierte de que no se reprodujeron los benchmarks del paper.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser elección cerrada, el riesgo se traslada a la calibración de las probabilidades.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse el archivo LICENSE, el NOTICE con créditos y la lista de modificaciones.
- Requiere una versión de @s1s2/web con el lector de imágenes (bloque `image` del manifiesto), ausente en la 0.2.1.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Visual-Jev-4B-ONNX-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Adaptador: https://huggingface.co/guanxuyu/visual-jev-4b-answer-sft
- Paper: https://arxiv.org/abs/2609.25845
- Librería s1s2.js: https://github.com/eduardoworrel/s1s2.js
- Dataset de evaluación: https://huggingface.co/datasets/derek-thomas/ScienceQA
