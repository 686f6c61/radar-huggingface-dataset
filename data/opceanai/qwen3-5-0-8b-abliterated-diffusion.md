# OpceanAI/Qwen3.5-0.8B-abliterated-diffusion

## Resumen

Qwen3.5-0.8B-abliterated-diffusion es un checkpoint experimental publicado por OpceanAI que convierte un modelo de lenguaje autorregresivo de la familia Qwen3.5 (en su variante "abliterated", es decir, con el alineamiento de seguridad suprimido) en un modelo de difusión de lenguaje por enmascaramiento (masked diffusion). El modelo parte de `OpceanAI/Qwen3.5-0.8B-abliterated` y aplica la receta de conversión de summerMC (dqwen), que adapta el método LLaDA/Dream a la arquitectura híbrida de Qwen3.5. Cuenta con 752.393.024 parámetros reales en safetensors y un tamaño de repositorio de 1,5 GB.

El interés técnico reside en la conversión de una arquitectura híbrida (18 capas Gated DeltaNet y 6 capas de atención completa) a un esquema de generación no causal. Para ello se elimina la máscara causal en la atención completa y se ejecuta la recurrencia DeltaNet dos veces: un escaneo directo más un escaneo inverso con puerta por canal (`rev_gate`) inicializada a cero, de modo que el paso 0 de entrenamiento es idéntico al modelo base. En este checkpoint cada una de las 18 puertas aprendió una magnitud media de entre 0,05 y 0,075, por lo que el modelo utiliza aproximadamente un 6 % de la ruta inversa.

Es relevante ahora como artefacto de investigación: demuestra que la conversión funciona y permite medir el compromiso entre velocidad de decodificación y calidad. El propio autor advierte que no es un asistente utilizable: se entrenó durante unos 55 minutos sobre 65 millones de tokens, repite palabras, entra en bucles y pierde el hilo. Su valor es metodológico y comparativo, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (18 capas Gated DeltaNet + 6 capas de atención completa) convertido a masked diffusion; tipo `qwen3_5_text` |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer híbrido Qwen3.5 con 24 capas en total: 18 capas Gated DeltaNet (recurrencia lineal con compuertas) y 6 capas de atención completa. La conversión a difusión por enmascaramiento requiere que el modelo vea la secuencia en ambas direcciones, algo imposible para una recurrencia causal. La receta lo resuelve ejecutando la recurrencia dos veces según `out = orig(h) + rev_gate * flip(orig(flip(h)))`, donde `rev_gate` es un parámetro por canal inicializado a cero. Además, se elimina la máscara causal de la atención completa, se usa `<|fim_pad|>` (id 248063) como token `[MASK]` con embedding aprendido, se aplica una pérdida de entropía cruzada sobre tokens enmascarados con ponderación ELBO `1/t` y predicción desplazada para mantener alineado el `lm_head` preentrenado, y se decodifica mediante desenmascaramiento por bloques con confianza.

El entrenamiento usó LoRA con r=32 y alpha=64, fusionado en los pesos, con 20,5 millones de parámetros entrenables (LoRA, las 18 `rev_gate` y `mask_embed`). Los datos fueron 51.927 ejemplos de `tatsu-lab/alpaca`, con longitud de secuencia 512, 4.000 pasos, unos 65 millones de tokens vistos, batch de 32 sin acumulación, sobre una H200 SXM en Modal durante aproximadamente 55 minutos. La pérdida final fue de 0,19 en el último paso, con EMA de 0,30. La decodificación es por desenmascaramiento por bloques con confianza, con un número de pasos de denoising configurable (16, 32 o 64 en las pruebas publicadas).

## Capacidades

- Generación de texto mediante desenmascaramiento paralelo iterativo, no autorregresivo.
- Conocimiento factual de un solo paso: retiene parte del conocimiento del modelo base (MMLU generativo del 45,5 %).
- Decodificación por bloques con control del número de pasos de denoising, que ajusta el compromiso velocidad/calidad.
- Capacidad multilingüe limitada al inglés según la model card.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso; de hecho, el razonamiento secuencial se degrada severamente (GSM8K del 4,0 %).
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre modelos de difusión de lenguaje: el checkpoint sirve para estudiar cómo se comporta la conversión de una arquitectura híbrida DeltaNet/atención a un esquema de enmascaramiento bidireccional, midiendo la contribución de la ruta inversa mediante las magnitudes aprendidas de `rev_gate`.
- Medición del compromiso velocidad/calidad en decodificación paralela: permite comparar 16, 32 y 64 pasos de denoising sobre las mismas prompts y cuantificar la pérdida de calidad frente a la ganancia de throughput (de 61,7 a 218,9 tok/s).
- Estudio de la degradación del razonamiento multi-paso: la caída de GSM8K del 21,0 % al 4,0 % frente al modelo autorregresivo base es un caso de análisis sobre la ausencia de scratchpad secuencial en difusión enmascarada.
- Reproducción de la receta dqwen: el código de conversión (escaneo directo más escaneo inverso con puerta) y los hiperparámetros publicados permiten replicar el procedimiento sobre otros checkpoints de la familia Qwen3.5.
- Pruebas de infraestructura de inferencia no autorregresiva: útil para validar samplers de desenmascaramiento por bloques y su integración con kernels de atención lineal (flash-linear-attention).
- Análisis de alineamiento y abliteración: al derivar de un checkpoint abliterated, permite estudiar cómo interactúan la supresión de direcciones de rechazo y la conversión a difusión en las respuestas generadas.
- Benchmarking de implementaciones: comparar la ruta de decodificación DeltaNet en kernels de referencia PyTorch frente a alternativas optimizadas, usando el modelo autorregresivo base como referencia en la misma máquina.

## Benchmarks y rendimiento

Resultados medidos en una H200, decodificación greedy, mismas prompts y mismo parser para ambos modelos. La línea base autorregresiva es el checkpoint del que deriva.

| Benchmark | n | AR abliterated | Diffusion | Delta |
|---|---:|---:|---:|---:|
| MMLU, generativo | 200 | 42,0 % | 45,5 % | +3,5 pp |
| GSM8K | 50 | 21,0 % | 4,0 % | −17,0 pp |

El azar en MMLU es del 25 % y un error estándar de una proporción con n=200 es de aproximadamente 3,1 pp; la diferencia de 3,5 puntos queda dentro del ruido. La conclusión del autor es que la conversión conservó el conocimiento y perdió el razonamiento multi-paso.

Throughput con 128 tokens, misma prompt, sin warmup, tres configuraciones del sampler:

| Decodificación | tok/s | Tiempo para 128 tokens |
|---|---:|---:|
| AR con KV cache | 27,3 | 4,68 s |
| Diffusion, 16 pasos | 218,9 | 0,58 s |
| Diffusion, 32 pasos | 124,2 | 1,03 s |
| Diffusion, 64 pasos | 61,7 | 2,07 s |

La ventaja es estructural: 16 pasos de denoising emiten 128 tokens, mientras que la ruta autorregresiva necesita 128 pasadas forward. El autor advierte que la línea base AR es más lenta de lo que debería en este hardware porque la ruta de decodificación DeltaNet híbrida aún recurre a kernels de referencia de PyTorch; la ratio debe interpretarse como comparación entre dos implementaciones en la misma máquina, no como cifra absoluta de ninguna de las dos arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 752 millones de parámetros en safetensors y un repositorio de 1,5 GB, la inferencia en precisión completa requiere del orden de 3 GB solo para pesos, más activaciones y buffers del sampler de difusión.
- GPU recomendadas: el entrenamiento se realizó en una H200 SXM; para inferencia no se publican recomendaciones específicas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,8B, aunque no se documentan modelos concretos ni cuantizaciones probadas.
- Opciones de despliegue: transformers con el parche de conversión aplicado (obligatorio; `AutoModelForCausalLM` sin parche devuelve un modelo causal, no de difusión), más `accelerate`, `huggingface_hub`, `safetensors` y `flash-linear-attention`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 218,9 tok/s con 16 pasos de denoising, 124,2 tok/s con 32 pasos y 61,7 tok/s con 64 pasos, medidos en una H200 con 128 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-abliterated-diffusion (este) | 752,4 M | no disponible (entrenado a 512) | Masked diffusion sobre híbrido DeltaNet | apache-2.0 | Hugging Face, 181 descargas |
| OpceanAI/Qwen3.5-0.8B-abliterated (base) | no disponible | no disponible | Autorregresivo, abliterated | no disponible | Hugging Face |
| summerAIO/Diffusion-Qwen3.8-27B (dqwen) | no disponible | no disponible | Masked diffusion sobre Qwen3.5, escala 27B | no disponible | Hugging Face |
| Qwen3.5-0.8B (original) | no disponible | no disponible | Autorregresivo híbrido Qwen3.5 | no disponible | Hugging Face / apxml |

La comparación cuantitativa directa solo está publicada frente al checkpoint abliterated del que deriva: MMLU 45,5 % frente a 42,0 % y GSM8K 4,0 % frente a 21,0 %. Para el resto de alternativas no se han publicado resultados comparables en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente utilizable: el autor lo declara explícitamente. Repite palabras, entra en bucles y pierde el hilo del discurso.
- Entrenamiento muy corto: unos 55 minutos y 65 millones de tokens, lo que explica la degradación de la coherencia frente a un modelo instruido.
- Razonamiento multi-paso severamente degradado: GSM8K cae 17 puntos porcentuales respecto al modelo base, por la ausencia de scratchpad secuencial en la difusión enmascarada.
- Riesgo elevado de alucinación y de degradación de la respuesta en generaciones largas; los ejemplos publicados muestran repeticiones desde las primeras frases.
- Idiomas: solo inglés según la model card; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: entrenado con secuencias de 512 tokens; no se documenta una longitud de contexto operativa mayor.
- Procedencia "abliterated": el checkpoint base tiene suprimidas las direcciones de rechazo, por lo que las salvaguardas de seguridad del modelo original no están garantizadas.
- Licencia apache-2.0, que permite uso comercial, pero el estado experimental y la calidad de salida hacen desaconsejable cualquier despliegue en producción.
- Requiere aplicar un parche de conversión antes de la inferencia; usar `AutoModelForCausalLM` directamente produce un modelo causal, no de difusión.
- Las cifras de velocidad comparan dos implementaciones en la misma máquina y no deben tomarse como valores absolutos de ninguna arquitectura, según advierte el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-diffusion
- Checkpoint base abliterated: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated
- Receta de conversión dqwen (summerMC): https://huggingface.co/summerAIO/Diffusion-Qwen3.8-27B
- Finetunes del modelo base en Hugging Face: https://huggingface.co/models?other=base_model%3Afinetune%3AOpceanAI%2FQwen3.5-0.8B-abliterated
- Ficha de especificaciones de Qwen3.5-0.8B (apxml): https://apxml.com/models/qwen35-08b
