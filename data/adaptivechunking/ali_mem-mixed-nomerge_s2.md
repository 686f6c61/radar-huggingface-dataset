# AdaptiveChunking/ali_mem-mixed-nomerge_s2

## Resumen

`ali_mem-mixed-nomerge_s2` es un modelo de investigación de tokenización dinámica a nivel de byte, desarrollado por el colectivo AdaptiveChunking y entrenado con el framework `beetle-hnet`. No es un modelo de lenguaje conversacional al uso: se trata de un experimento sobre segmentación adaptativa de secuencias (dynamic chunking) con arquitectura H-Net, cuyo objetivo es aprender a agrupar bytes en unidades de mayor nivel antes de procesarlas, en lugar de depender de un tokenizador BPE fijo. El modelo tiene 22.785.088 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El checkpoint publicado corresponde a la semilla 2 de una campaña de entrenamiento de 6000 pasos sobre secuencias de 32 × 1024 bytes, con textos en inglés, turco y finés. La nomenclatura `mixed-nomerge` indica que se entrenó con mezcla de idiomas y sin etapa de fusión de chunks, y `ali` es la etiqueta de arquitectura interna del framework. El repositorio incluye ramas `step-N` con checkpoints intermedios en una programación logarítmica por fases, además de estado completo del entrenador para reanudación.

Su relevancia es metodológica: sirve como banco de pruebas reproducible para estudiar tokenización libre de vocabulario, sondas de frontera sobre FLORES+ y el comportamiento de H-Net con decodificación por EMA de chunks. No está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (variante `ali`, framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 secuencias × 1024 bytes por paso de entrenamiento (contexto efectivo de 1024 bytes por muestra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `tied_weights` en `config.json`), más `checkpoint.pt` de PyTorch para reanudación |

## Arquitectura y entrenamiento

El modelo sigue la familia H-Net (hierarchical network) aplicada a entrada byte-level: en lugar de tokenizar el texto con un vocabulario cerrado, procesa bytes y aprende dinámicamente a agruparlos en chunks mediante un mecanismo de segmentación adaptativa. La variante `ali` corresponde a una configuración interna del framework `beetle-hnet`, con objetivo `ratio` y decodificación de chunks por media móvil exponencial (`dechunk=ema`). Los pesos están atados (tied weights): `model.safetensors` almacena cada tensor una sola vez y `config.json` mapea los nombres eliminados a los almacenados.

El entrenamiento se realizó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre corpus en inglés, turco y finés. La programación de checkpoints es logarítmica y consciente de fases (0, 1, 2, 4, 6, 8, 16, …, 2^k desde cada inicio de fase objetivo, más el paso final). No se documenta en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; dado el tamaño y la naturaleza del experimento, es improbable que se aplicaran.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica de secuencias.
- Aprendizaje de fronteras de chunk sin vocabulario predefinido (tokenización libre).
- Sondas de frontera sobre FLORES+ incluidas en la rama `main` (`probe/`) para evaluar la calidad de la segmentación multilingüe.
- Soporte multilingüe limitado a los tres idiomas de entrenamiento: inglés, turco y finés.
- Reanudación exacta del entrenamiento gracias al estado completo en `training_state/checkpoint.pt`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en tokenización sin vocabulario: comparar H-Net byte-level frente a BPE o SentencePiece en las mismas condiciones de datos y pasos, usando los checkpoints intermedios para estudiar la evolución de las fronteras de chunk.
- Análisis de segmentación multilingüe: las sondas FLORES+ permiten medir cómo el modelo agrupa bytes en inglés, turco y finés, idiomas con morfología muy distinta, y detectar sesgos hacia patrones del inglés.
- Reproducción de experimentos: el estado resumible del entrenador permite continuar la campaña desde cualquier paso logarítmico sin recalcular, útil para ablaciones controladas.
- Estudio de decodificación por EMA: la configuración `dechunk=ema` permite analizar el efecto de la media móvil exponencial en la reconstrucción de texto a partir de chunks.
- Docencia y formación: modelo pequeño (22,8 M de parámetros) que cabe en CPU y permite ilustrar en clase el funcionamiento de arquitecturas jerárquicas sobre bytes.
- Base para extensiones: punto de partida para añadir fusión de chunks (`nomerge` desactivado), ampliar idiomas o escalar el número de pasos en trabajos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (22,8 M de parámetros ≈ 91 MB de pesos), más overhead del runtime; holgado en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 2 GB (GTX 1650, RTX 3050, RTX 4090) es suficiente.
- Cabe en GPU consumer: sí, en todas las tarjetas actuales, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo (carga vía `torch.load` o `safetensors`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de chat con tokenizador estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nomerge_s2 | 22,8 M | 1024 bytes/muestra | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE pequeños (p. ej. GPT-2 small) | ~124 M | 1024 tokens | Transformer con tokenizador BPE fijo | MIT | Hugging Face |
| Byte-level transformers (p. ej. ByT5-small) | ~300 M | 512-1024 bytes | Transformer encoder-decoder sobre bytes | Apache 2.0 | Hugging Face |

La comparación directa no es posible en términos de rendimiento porque no hay benchmarks publicados para este checkpoint. La diferencia conceptual clave frente a ByT5 es que este modelo aprende la segmentación en lugar de procesar cada byte de forma independiente, y frente a GPT-2 small prescinde por completo del vocabulario.

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente conversacional ni está alineado con instrucciones; no debe usarse como chatbot.
- Idiomas limitados a inglés, turco y finés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Riesgo alto de alucinación y salidas incoherentes si se usa fuera de su distribución de entrenamiento.
- Contexto efectivo de 1024 bytes por muestra, insuficiente para documentos largos.
- Sesgos: no documentados, pero heredados de los corpus de entrenamiento en tres idiomas; probable sesgo hacia el inglés.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción.
- El repositorio pesa 8,8 GB por la acumulación de checkpoints intermedios y estados del entrenador; conviene descargar solo la rama necesaria.
- No se documentan cuantizaciones ni formatos GGUF/ONNX; el despliegue requiere PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nomerge_s2
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil del autor en Hugging Face: https://huggingface.co/AdaptiveChunking
