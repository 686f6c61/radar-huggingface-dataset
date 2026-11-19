# hanseungwook/codeparrot-llama-1.6b-scratch-seed-7

## Resumen

`codeparrot-llama-1.6b-scratch-seed-7` es un modelo de lenguaje causal base (no instruido, no afinado para chat) entrenado desde cero sobre el corpus CodeParrot. Lo publica el usuario de Hugging Face `hanseungwook` como parte de una familia de experimentos comparativos sobre inicialización y preentrenamiento, en la que se contrastan modelos entrenados desde cero ("scratch") con modelos inicializados a partir de un checkpoint previo de NCA (Neural Cellular Automata). Este checkpoint concreto corresponde a la semilla 7 del brazo "scratch".

Arquitectónicamente es un transformer decoder-only con la configuración de Llama: 24 capas, dimensión oculta 2048, tamaño intermedio 8192 y 32 cabezas de atención/KV. Tiene 1.872.857.088 parámetros totales (aproximadamente 1,61B excluyendo los embeddings de entrada y salida, que están desacoplados y cuentan con 64.000 filas cada uno). La longitud de contexto de entrenamiento es de 1.024 tokens, muy corta para los estándares actuales, lo que lo sitúa como una pieza de investigación más que como un modelo de producción.

Su relevancia es acotada y experimental: sirve como línea base para estudiar el efecto de distintas inicializaciones y semillas en el preentrenamiento sobre código, no como un asistente de código listo para usar. No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; solo se reportan pérdidas de validación internas del propio entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (causal LM) |
| Parámetros totales | 1.872.857.088 (~1,61B excluyendo embeddings de entrada/salida) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (contexto de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en FP32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32 sin pérdida), compatible con `LlamaForCausalLM` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal estándar, 24 capas, `hidden_size` 2048, `intermediate_size` 8192 y 32 cabezas de atención (y de KV, es decir, sin GQA). Los embeddings de entrada (64.000 filas) y la cabeza de salida están desacoplados ("untied") y se preservan exactamente tal cual. El tokenizador es el de GPT-2 (50.257 tokens definidos), aunque el modelo retiene 64.000 filas de vocabulario; la configuración de generación guardada suprime los IDs 50.257–63.999 para evitar tokens no decodificables, sin alterar los pesos ni los logits del forward.

El entrenamiento se realizó desde cero (sin inicialización NCA) sobre el corpus CodeParrot, con semilla 7, hasta el paso de optimizador 24.545. El nombre interno del run es `full-codeparrot/scratch-10-colors-gzip-0.5-1.0-2-seed/7-seed` (W&B run ID `92txka87`); la referencia a "GZIP" en el nombre forma parte del esquema de nomenclatura del experimento y no implica un band de GZIP aplicable a este modelo. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF/DPO (el modelo es explícitamente base, no instruido). La pérdida de validación registrada en el paso 24.000 fue de 0,665801837119, la más alta de las cuatro variantes comparadas en la model card (las dos NCA y las dos scratch), aunque la comparación entre semillas y brazos no aísla efectos individuales.

## Capacidades

- Generación de texto causal autoregresiva en inglés, orientada a continuación de código fuente.
- Modelo base sin ajuste de instrucciones ni de chat: no sigue instrucciones de forma fiable ni mantiene diálogos estructurados.
- Capacidad de completar fragmentos de código (funciones, bloques, expresiones) dado un prefijo, según el ejemplo de uso de la model card (`def fibonacci(n):`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Multilingüe: no; solo inglés.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- No se documentan capacidades especiales adicionales más allá de la generación de texto.

## Casos de uso

- Línea base de investigación en preentrenamiento sobre código: sirve para comparar el efecto de la inicialización (scratch frente a NCA) y de la semilla en la pérdida de validación sobre CodeParrot, con un checkpoint reproducible y metadatos de entrenamiento adjuntos.
- Estudio de dinámica de entrenamiento a pequeña escala: con 1,6B parámetros y contexto de 1.024 tokens, es viable reproducir o extender experimentos de preentrenamiento en un solo nodo de GPU, midiendo curvas de pérdida y estabilidad.
- Evaluación de tokenizadores y vocabularios: el desajuste entre el tokenizador GPT-2 (50.257) y las 64.000 filas de vocabulario, junto con la supresión documentada de IDs, lo convierte en un caso de estudio útil para validar pipelines de exportación y decodificación.
- Generación de código en entornos controlados de laboratorio: puede completar fragmentos de Python u otros lenguajes presentes en CodeParrot, pero sin garantías de corrección; adecuado para experimentos internos, no para producción.
- Verificación de pipelines de exportación a Transformers: el repositorio incluye `conversion_report.json` con comprobaciones de igualdad de logits originales frente a Transformers en longitudes 8, 128 y 1024, paridad de tokenizador con `tiktoken` GPT-2 y pruebas de forward con caché, útil como referencia para validar conversiones de checkpoints.
- Docencia y demostraciones sobre arquitecturas Llama: la configuración compacta (24 capas, 2048 de dimensión) permite ilustrar el ciclo completo de preentrenamiento, exportación y carga con `AutoModelForCausalLM` sin código personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación internas del entrenamiento, medidas en el paso 24.000 y no recalculadas sobre los pesos finales exportados:

| Checkpoint | Band GZIP NCA | Pérdida de validación CodeParrot registrada |
|---|---|---:|
| NCA semilla 7 | 0,3–0,4 | 0,612319200089 |
| NCA semilla 8 | 0,5–1,0 | 0,610557624325 |
| Scratch semilla 7 (este modelo) | No aplicable | 0,665801837119 |
| Scratch semilla 8 | No aplicable | 0,616333815306 |

Estas cifras son métricas históricas del run de entrenamiento, no mediciones sobre los pesos finales exportados (paso 24.545 en scratch, 24.521 en NCA).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 7,5 GB solo para pesos (1,872B × 4 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 9–12 GB en FP32 según longitud de secuencia y batch.
- En FP16/BF16: aproximadamente 3,75 GB de pesos; en torno a 5–6 GB con overhead, aunque no se documentan checkpoints en estos formatos en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 12–16 GB de VRAM para FP32 (RTX 4080/4090, A10, L4, A100, H100). En GPUs consumer de 24 GB (RTX 3090/4090) cabe holgadamente en FP32.
- Cabe en GPU consumer: sí, en modelos con 12 GB o más en FP32 y con 8 GB o más si se convierte a FP16/BF16.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), text-generation-inference (el repositorio está etiquetado como `endpoints_compatible` y `text-generation-inference`). No se documentan variantes GGUF para llama.cpp/Ollama ni soporte verificado de vLLM o TGI con versiones concretas.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| codeparrot-llama-1.6b-scratch-seed-7 (este) | ~1,87B | 1.024 | no disponible | Hugging Face | Base, solo inglés, pérdida val. 0,6658 (paso 24.000) |
| codeparrot-llama-1.6b-scratch-seed-8 | ~1,87B | 1.024 | no disponible | Hugging Face | Misma familia, semilla 8, pérdida val. 0,6163 |
| codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7 | ~1,87B | 1.024 | no disponible | Hugging Face | Inicialización NCA, pérdida val. 0,6123 |
| codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8 | ~1,87B | 1.024 | no disponible | Hugging Face | Inicialización NCA, pérdida val. 0,6106 |

No se dispone de comparaciones con modelos de código de propósito general (por ejemplo, CodeLlama, StarCoder o Qwen2.5-Coder) en la información proporcionada; cualquier comparación de rendimiento con ellos sería especulativa.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de chat: no debe usarse como asistente conversacional ni esperar que siga instrucciones.
- Contexto de entrenamiento de solo 1.024 tokens: insuficiente para tareas que requieran contexto largo (archivos completos, repositorios, conversaciones multi-turno).
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo elevado de alucinación y de generar código sintácticamente plausible pero incorrecto; no hay evaluaciones de corrección funcional publicadas.
- Desajuste de vocabulario: el tokenizador GPT-2 define 50.257 tokens frente a las 64.000 filas del modelo; si se sustituye `generation_config` o se implementa un bucle de muestreo propio, es imprescindible mantener la supresión de los IDs 50.257–63.999 para evitar tokens no decodificables.
- El padding usa el token EOS de GPT-2 (50256); en lotes con padding es necesario proporcionar una máscara de atención.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Las pérdidas reportadas son del paso 24.000 y no de los pesos finales; no deben citarse como rendimiento del checkpoint exportado.
- Sin datos de sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-7
- Metadatos de entrenamiento: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-7/blob/main/training_metadata.json
- Informe de conversión: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-7/blob/main/conversion_report.json
- Modelo de referencia de la familia (FineWeb-Edu Llama 1.6B from NCA): https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
- Variante NCA semilla 7: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7
- Variante NCA semilla 8: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8
- Variante scratch semilla 8: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-8
