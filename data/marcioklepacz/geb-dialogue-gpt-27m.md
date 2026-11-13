# marcioklepacz/geb-dialogue-gpt-27M

## Resumen

GEB Dialogs GPT es un modelo de lenguaje de tipo GPT entrenado desde cero por el usuario marcioklepacz, cuyo objetivo es generar diálogos al estilo de *Gödel, Escher, Bach: an Eternal Golden Braid*, la obra de Douglas Hofstadter, con personajes como Aquiles, la Tortuga, el Cangrejo y compañía. Se trata de un proyecto de afición y aprendizaje, no de un modelo de producción: con aproximadamente 27,4 millones de parámetros y un corpus de entrenamiento muy reducido, el modelo reproduce el tono y la estructura de los diálogos del libro más que su contenido lógico.

Arquitectónicamente es un transformer decoder de solo 2 capas, con 4 cabezas de atención, dimensión de embedding de 256 y feed-forward de 1024, usando el tokenizador BPE de GPT-2 ampliado con 24 tokens de hablante hasta un vocabulario de 50.281 entradas. El modelo se distribuye en formato ONNX (opset 18) para ejecutarse íntegramente en el navegador mediante onnxruntime-web y transformers.js, con una variante cuantizada a uint8 de unos 66 MB pensada para la web.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo completo de un pipeline de entrenamiento from scratch, exportación a ONNX y despliegue client-side sin servidor. No está pensado para tareas generales de generación, razonamiento o código, y su licencia es "other" con restricciones explícitas a uso no comercial por los derechos del texto fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (capas `nn.Transformer` de PyTorch) con LM head lineal |
| Parametros totales | ~27,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el grafo ONNX no fija longitud; sin KV cache) |
| Tipos de cuantizacion | fp32 (~110 MB) y uint8 dinamica solo de pesos (~66 MB) |
| Idiomas soportados | ingles (en) |
| Licencia | other (uso no comercial, educativo e investigacion) |
| Formato de pesos | ONNX (opset 18); tokenizer en `tokenizer.json` |
| Capas | 2 |
| Cabezas de atencion | 4 (dimension por cabeza 64) |
| Dimension de embedding | 256 |
| Dimension feed-forward | 1024 |
| Vocabulario | 50.281 (GPT-2 50.257 + 24 tokens de hablante) |
| Entradas ONNX | `input_ids`: `int64[1, seq_len]` |
| Salidas ONNX | `logits`: `float32[1, seq_len, 50281]` |
| Batch size | 1 (fijo en el grafo exportado) |
| KV cache | no (cada paso regenera toda la secuencia) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 2 capas construido con las capas `nn.Transformer` de PyTorch y una cabeza de lenguaje lineal sobre el vocabulario de 50.281 tokens. Usa el tokenizador BPE de GPT-2 al que se añadieron 24 tokens especiales de hablante (`<|Achilles|>`, `<|Tortoise|>`, `<|Crab|>`, etc.), más `<|endoftext|>` como BOS/EOS/UNK y `<|pad|>` para padding. El grafo exportado a ONNX tiene batch size fijo de 1 y no incluye KV cache, de modo que cada paso de generación vuelve a procesar la secuencia completa, lo que limita la eficiencia en secuencias largas.

El entrenamiento se realizó desde cero (sin pesos preentrenados) con objetivo de entropía cruzada de siguiente token. El corpus son los diálogos de *Gödel, Escher, Bach* (1979) extraídos en turnos etiquetados por hablante: aproximadamente 2.500 turnos repartidos en 19 diálogos. La distribución está muy desequilibrada: Aquiles concentra unos 1.000 turnos, la Tortuga unos 680 y el Cangrejo unos 310, mientras que personajes con pocos turnos apenas se aprenden. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; por el tamaño del proyecto y la descripción, cabe suponer un entrenamiento supervisado puro, pero este dato no está confirmado en la información disponible.

## Capacidades

- Generación de texto conversacional en formato de diálogo con turnos etiquetados por hablante.
- Reproducción de estilos y voces de personajes concretos (Aquiles, Tortuga, Cangrejo, Anteater, Zeno, Sloth, Genie, etc.), con calidad decreciente para los personajes con menos datos.
- Generación condicionada por token de hablante: se indica `<|Tortoise|>` y el modelo continúa el turno.
- Parada controlada mediante `<|endoftext|>` o límite de tokens.
- Inferencia client-side en navegador con onnxruntime-web (WASM) y transformers.js, sin backend.
- Inferencia en Python con onnxruntime y la librería `tokenizers`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- Multilingüe: no; únicamente inglés.
- Razonamiento y matemáticas: no es una capacidad fiable del modelo; su salida es estilística, no lógica.

## Casos de uso

- Demostración educativa de entrenamiento from scratch: sirve para ilustrar en un curso o artículo el ciclo completo de tokenización, entrenamiento de un transformer pequeño, exportación a ONNX y despliegue, con un modelo lo bastante pequeño para reproducirse en hardware modesto.
- Generador de diálogos de fans de GEB: permite producir turnos nuevos con el tono de Aquiles, la Tortuga o el Cangrejo, útil para contenido divulgativo o experimentos creativos sobre la obra, siempre con el aviso de que el texto es generado y no del autor.
- Inferencia 100 % en navegador sin servidor: al pesar 66 MB en uint8 y ejecutarse con onnxruntime-web, puede integrarse en una página estática o demo interactiva sin backend ni costes de GPU, algo adecuado para talleres y prototipos.
- Prueba de concepto de despliegue edge: sirve como banco de pruebas para medir latencia y consumo de WASM en distintos navegadores y dispositivos con un modelo de 27 M de parámetros.
- Generación de datos sintéticos de diálogo con estilo concreto: útil para aumentar un corpus pequeño de diálogos estilo GEB en experimentos de investigación sobre estilo, aceptando la baja fidelidad semántica.
- Ejercicio de cuantización: la comparación entre `geb_gpt.onnx` (fp32, ~110 MB) y `geb_gpt_uint8.onnx` (~66 MB) permite estudiar el impacto de la cuantización dinámica uint8 en calidad y tamaño en un modelo pequeño.
- Base para fine-tuning o arquitecturas de juguete: su tamaño reducido y su código de referencia lo hacen apropiado como punto de partida para experimentos docentes con arquitecturas transformer mínimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo fp32 ocupa ~110 MB y el uint8 ~66 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 1 GB de memoria libre es suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en muchas integradas.
- Despliegue: onnxruntime-web (WASM) en navegador, onnxruntime en Python, y potencialmente conversión a otros runtimes ONNX; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que el formato distribuido es ONNX y no GGUF.
- Latencia y throughput: no disponibles de forma medida. Cabe esperar latencia por token baja en CPU y navegador por el tamaño del modelo, pero la ausencia de KV cache obliga a reprocesar la secuencia completa en cada paso, lo que penaliza la generación de secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| GEB Dialogs GPT | ~27,4 M | no disponible | other (no comercial) | ONNX | Diálogo estilístico GEB, from scratch |
| GPT-2 small | 124 M | 1.024 tokens | MIT | safetensors, GGUF, ONNX | Generación general en inglés |
| TinyStories-1M/33M (Microsoft) | 1 M – 33 M | no disponible | MIT / otras | safetensors, GGUF | Modelos pequeños para narrativa simple |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | safetensors, GGUF | Destilación de GPT-2 para generación general |

La comparación es aproximada: GEB Dialogs GPT no compite en capacidades generales con GPT-2 small ni con DistilGPT-2, sino en tamaño y en propósito didáctico. TinyStories es el referente más cercano en escala y filosofía de modelo pequeño entrenado desde cero, aunque su dominio es la narrativa infantil y no el diálogo filosófico.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño (~2.500 turnos en 19 diálogos): el modelo memoriza estilo y estructuras, pero su coherencia semántica es baja; la propia model card advierte de "lively nonsense".
- Fuerte desequilibrio de personajes: Aquiles, la Tortuga y el Cangrejo funcionan mejor; los personajes con pocos turnos apenas están aprendidos.
- Riesgo alto de alucinación y de deriva temática: no debe usarse para responder preguntas factuales ni para razonamiento lógico o matemático.
- Solo inglés; no hay capacidades multilingües.
- Sin KV cache y con batch size 1: ineficiente para generación larga y no apto para servir a múltiples usuarios concurrentes.
- Licencia "other" con uso restringido a fines no comerciales, educativos y de investigación, derivada de los derechos de autor del texto fuente; no se redistribuye el texto de entrenamiento.
- Proyecto independiente no afiliado a Douglas Hofstadter ni a Basic Books; el texto generado no representa al autor.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad más allá de la observación cualitativa del autor.
- No soporta tool calling, agentes, visión ni audio; no es adecuado para pipelines de producción que requieran fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcioklepacz/geb-dialogue-gpt-27M
- onnxruntime-web (documentación): https://onnxruntime.ai/docs/tutorials/web/
- Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
- onnxruntime (Python): https://onnxruntime.ai/
- Librería tokenizers de Hugging Face: https://github.com/huggingface/tokenizers
- Paper y blog: no disponibles en la información proporcionada.
- Repositorio de código y demos: no disponibles en la información proporcionada.
