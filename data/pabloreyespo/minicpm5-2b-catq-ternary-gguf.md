# pabloreyespo/MiniCPM5-2B-CATQ-ternary-GGUF

## Resumen

MiniCPM5-2B-CATQ-ternary-GGUF es una cuantización ternaria del modelo openbmb/MiniCPM5-2B, publicada por el usuario pabloreyespo. Cada peso lineal de las 42 capas del decodificador (294 tensores) se almacena como {-1, 0, +1} con una escala fp16 por cada 128 pesos, lo que resulta en 2,125 bits por peso y un fichero de 0,87 GiB frente a los 1,78 GiB de un Q5_K_M del mismo modelo. El método empleado es CAT-Q (Wang et al., ICML 2026), una técnica de cuantización post-entrenamiento que no requiere quantization-aware training.

La relevancia de esta ficha es doble: por un lado, demuestra la viabilidad de comprimir un modelo de 2.516.756.480 parámetros hasta menos de 1 GB manteniendo una generación fluida; por otro, es un experimento independiente, no una release oficial de CAT-Q, ya que la calibración se reconstruyó a partir del código de inferencia y exportación publicado por Intel en BitTern y del bucle de ventana deslizante de SliderQuant. El autor advierte explícitamente que la calidad se resiente: la media de cinco benchmarks de sentido común cae 12,6 puntos respecto al modelo en bf16.

El modelo base MiniCPM5-2B es un modelo de razonamiento con soporte de inglés y chino, licencia Apache 2.0. Esta cuantización hereda esa licencia pero requiere un fork específico de llama.cpp (PrismML, rama `prism`) para cargarse, ya que usa el tipo ggml 142 (`PQ2_0`) con grupos de 128 pesos, no soportado por llama.cpp mainline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 42 capas (modelo base MiniCPM5-2B); pesos lineales ternarios {-1, 0, +1} con escala fp16 por grupo de 128 |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Ternaria W1.58A16 (2,125 bits por peso); tensores no ternarios: `token_embd` Q5_K, `output` Q6_K, norms F32 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipo ggml 142, `PQ2_0`, grupos de 128); fichero `MiniCPM5-2B-catq-pq2_0.gguf` de 935 MB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 42 capas con 2.516.756.480 parámetros. La cuantización ternaria se aplica a las 294 matrices lineales del decodificador: cada peso se representa como `scale * code`, donde `code` pertenece a {-1, 0, +1} y `scale` es un fp16 por grupo de 128 pesos. Los embeddings, la cabeza de salida y las normas se copian sin modificar desde el Q5_K_M de bartowski/MiniCPM5-2B-GGUF.

El proceso de calibración sigue CAT-Q (secciones 2.2 y 2.3 del paper): desplazamiento de media por grupo y escala absmean con factores de modulación aprendidos, ternarización suavizada con tanh que incrementa la nitidez hasta 30 durante el 80% inicial de los pasos de cada ventana, y ternarización dura final con gradiente straight-through. Se añadió LoRA de rango 64 a cada peso durante la calibración, fusionado antes de la ternarización. La calibración usó ventanas deslizantes de 4 capas con stride 2 y relleno 4 (26 ventanas para 42 capas), 60 épocas por ventana, pérdida Huber (delta 0,1) entre la salida de la ventana con entradas cuantizadas y la salida del modelo bf16 con entradas bf16. Los datos de calibración fueron 512 ventanas aleatorias de 2048 tokens de C4 (`en/c4-train.00000-of-01024`), semilla 2. El coste estimado fue de unas 5 GPU-horas en una NVIDIA H100 en Modal.

Una innovación destacable es que la media se descarta en la exportación (`drop_quant_mu`), de modo que cada peso es exactamente `scale * code`, simplificando la inferencia. El autor reconoce diferencias conocidas: el producto LoRA se calculó en bf16 y se exportó en fp32, por lo que una pequeña fracción de códigos cercanos a un umbral puede diferir de los vistos en calibración.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de varios pasos (el modelo base MiniCPM5-2B es un modelo de razonamiento), aunque el autor advierte que matemáticas, código y razonamiento largo se degradan más que los benchmarks de sentido común.
- Generación fluida en uso general, con menor fiabilidad en hechos (el autor cita que para "The capital of Chile is" la continuación greedy no nombra Santiago).
- Soporte de decodificación con llama.cpp mediante el fork PrismML (CPU y Vulkan probados).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.
- Capacidad multilingüe limitada a inglés y chino según los tags del modelo.

## Casos de uso

- Experimentación en hardware de gama baja: el fichero de 0,87 GiB permite ejecutar un modelo de 2.500 millones de parámetros en portátiles con 15,4 GB de RAM (medido en un Intel Core Ultra 7 155H), útil para prototipos y demos sin GPU dedicada.
- Evaluación de técnicas de cuantización ternaria: sirve como referencia práctica para investigadores que quieran medir la degradación de CAT-Q frente a cuantizaciones de 4-5 bits en tareas de sentido común y generación libre.
- Generación de texto a alta velocidad en CPU: con 49,8-56,5 tok/s a 16 hilos frente a 34,0-34,1 tok/s del Q5_K_M, es adecuado para aplicaciones interactivas donde la latencia importa más que la precisión factual.
- Chat conversacional de bajo coste en inglés o chino: para asistentes simples con prompts cortos, siempre que se acepte la menor fiabilidad factual y el riesgo de bucles en prompts cortos.
- Pruebas de integración de nuevos tipos ggml: el uso del tipo 142 (`PQ2_0`) del fork PrismML lo convierte en un banco de pruebas para desarrolladores que quieran validar soporte de tipos ternarios en sus pipelines.
- Investigación sobre el equilibrio tamaño/calidad: permite comparar directamente el rendimiento de un modelo de 2B en bf16, Q5_K_M y ternario sobre el mismo conjunto de benchmarks, con los datos ya publicados por el autor.

## Benchmarks y rendimiento

Precisión zero-shot con lm-eval 0.4.7 mediante el código de evaluación de BitTern (`acc_norm` donde se reporta):

| Modelo | PIQA | ARC-e | ARC-c | HellaSwag | WinoGrande | avg-5 |
|---|---|---|---|---|---|---|
| MiniCPM5-2B, bf16 | 72,42 | 68,73 | 44,54 | 58,84 | 59,75 | 60,86 |
| Este fichero (equivalente fake-quantized) | 65,89 | 51,09 | 29,01 | 42,91 | 52,57 | 48,29 |

La ternarización cuesta 12,6 puntos de media en avg-5. El autor señala que estas cifras son una cota inferior de lo que logra CAT-Q, ya que su reimplementación de la calibración podría ser más débil que el método oficial: con un presupuesto más corto (20 épocas, 256 muestras) sobre Qwen3-1.7B obtuvo 44,65 avg-5 frente a 51,33 del checkpoint CAT-Q oficial de Intel evaluado igual.

Velocidad preliminar en Intel Core Ultra 7 155H, 15,4 GB RAM, Windows, build CPU de PrismML b12178, `llama-bench -p 0 -n 128`, 6 repeticiones por ejecución, configuraciones intercaladas en 3 rondas (se reportan las dos últimas):

| Fichero | 6 hilos (tok/s) | 16 hilos (tok/s) |
|---|---|---|
| Q5_K_M (bartowski) | 22,9; 22,8 | 34,0; 34,1 |
| Este fichero | 42,9; 41,2 | 49,8; 56,5 |

El fichero ternario genera entre 1,5 y 1,9 veces más rápido que el Q5_K_M en esa CPU. El autor advierte de deriva térmica del 10% o más y de que varias ejecuciones fueron marcadas por carga de CPU superior al 10% tras la medición; las cifras de GPU (Arc iGPU) no se consideran fiables y no se reportan.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 935 MB; con overhead de contexto y runtime, cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: no se han publicado mediciones fiables en GPU; el autor probó Vulkan en una Arc iGPU sin resultados concluyentes. Para CPU se validó un Intel Core Ultra 7 155H con 15,4 GB de RAM.
- Cabe en GPU consumer: sí, por tamaño (menos de 1 GB de pesos), aunque no hay benchmarks publicados en RTX 4090, RTX 3060 u otras.
- Opciones de despliegue: exclusivamente el fork PrismML de llama.cpp (rama `prism`), probado con las releases `prism-b12178-03ec600` (CPU y Vulkan) y `prism-b12128` (Vulkan). llama.cpp mainline no puede cargar el fichero.
- Latencia y throughput estimados: 42,9-56,5 tok/s en CPU de portátil según hilos (ver tabla de benchmarks); sin datos de GPU.
- Nota de compatibilidad: los ficheros etiquetados con el id antiguo 42 (`Q2_0`, grupo 128) no cargan en b12178, que interpreta el id 42 como formato de grupo 64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | avg-5 (zero-shot) | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| MiniCPM5-2B-CATQ-ternary (este) | 2.516.756.480 | no disponible | 48,29 | Apache 2.0 | GGUF ternario; fork PrismML |
| MiniCPM5-2B bf16 (base) | 2.516.756.480 | no disponible | 60,86 | Apache 2.0 | safetensors; transformers |
| MiniCPM5-2B Q5_K_M (bartowski) | 2.516.756.480 | no disponible | no disponible | Apache 2.0 | GGUF Q5_K; llama.cpp mainline |
| Qwen3-1.7B CAT-Q oficial (referencia del autor) | no disponible | no disponible | 51,33 | no disponible | no disponible |

La comparación directa con Q5_K_M en velocidad está en la tabla de benchmarks (34,0-34,1 tok/s frente a 49,8-56,5 tok/s a 16 hilos). No se dispone de datos de benchmarks del Q5_K_M ni del contexto de MiniCPM5-2B en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: 12,6 puntos de avg-5 frente al bf16; ARC-c cae de 44,54 a 29,01 y HellaSwag de 58,84 a 42,91.
- Menor fiabilidad factual: el autor documenta que la continuación greedy para "The capital of Chile is" no nombra Santiago.
- Riesgo de bucles en prompts cortos.
- Degradación esperada mayor en matemáticas, código y razonamiento largo que en los benchmarks de sentido común mostrados, por ser MiniCPM5-2B un modelo de razonamiento.
- No es una release oficial de CAT-Q: la calibración es una reimplementación independiente y los resultados deben tratarse como cota inferior del método.
- Diferencia conocida de calibración: producto LoRA calculado en bf16 y exportado en fp32, con posible divergencia en códigos cercanos a umbral.
- Compatibilidad restringida: solo carga en el fork PrismML de llama.cpp; no funciona en llama.cpp mainline ni, presumiblemente, en vLLM, TGI, Ollama u otros runtimes estándar.
- Idiomas limitados a inglés y chino; sin soporte documentado de otros idiomas.
- Sin datos de sesgos publicados; al ser calibrado con C4 en inglés, es probable un sesgo hacia ese dominio, aunque no se documenta explícitamente.
- Licencia Apache 2.0 permite uso comercial, pero la degradación de calidad y la dependencia de un fork no oficial desaconsejan su uso en producción sin evaluación propia.
- Cifras de velocidad con deriva térmica del 10% o más y ejecuciones marcadas por carga de CPU; tratar como indicativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pabloreyespo/MiniCPM5-2B-CATQ-ternary-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- GGUF Q5_K_M de referencia: https://huggingface.co/bartowski/MiniCPM5-2B-GGUF
- Paper CAT-Q: https://arxiv.org/abs/2606.26650
- Repositorio BitTern de Intel: https://github.com/IntelChina-AI/BitTern
- Repositorio SliderQuant: https://github.com/deep-optimization/SliderQuant
- Fork PrismML de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
