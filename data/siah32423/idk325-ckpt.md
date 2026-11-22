# Siah32423/idk325-ckpt

## Resumen

NanoReasoner-300M es un modelo de lenguaje de 352.321.602 parámetros entrenado desde pesos aleatorios por el usuario Siah32423, orientado a razonamiento matemático y generación de código Python. El entrenamiento se realizó en GPUs Modal (B200 y H100) y Google Colab, con el objetivo declarado de ejecutarse localmente en una GTX 1050 Ti de 4 GB. El modelo se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés.

La relevancia del proyecto es metodológica más que de rendimiento: documenta de forma exhaustiva todo el pipeline (pretrain, midtrain de cooldown, SFT y GRPO), incluye checkpoints intermedios para ablaciones y publica resultados de benchmarks con metodología detallada. La arquitectura es un transformer denso de 24 capas con `d_model=1024`, GQA 4:1, atención híbrida (ventana deslizante de 256 tokens en 18 capas y atención completa de 2048 tokens cada 4 capas) y tokenizer SuperBPE propio de 49.152 tokens.

Los resultados son modestos en términos absolutos: 6,97% de precisión greedy en GSM8K y 16,67% de Pass@4 en MBPP con el checkpoint SFT recomendado. El autor presenta el modelo como una prueba de concepto de bajo presupuesto y anuncia una v2 de 600M parámetros con arquitectura compatible con Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con GQA 4:1, ReLU^2 MLP, QK-Norm por cabeza, skip connections tipo U-Net, mezclas de residuo x0 y atención híbrida (sliding window 256 + atención completa 2048) |
| Parametros totales | 352.321.602 (264,24M en 24 bloques, 50,33M en embedding atado, 37,75M en 3 tablas `value_embeds`, 66 escalares) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (atención completa cada 4 capas; 256 tokens de ventana en las otras 18) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en `.pt` en float32; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints: `sft_v4_4_final.pt`, `pretrain_final.pt`, `midtrain_final.pt`, `sft_v4_1_final.pt`, `grpo_v4_1_final.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con `d_model=1024`, 16 cabezas de consulta y 4 cabezas KV (GQA 4:1), MLP con activación `ReLU^2` de dimensión 4096, `QK-Norm` por cabeza, conexiones skip tipo U-Net y mezclas de residuo `x0`. La atención es híbrida: 18 capas usan ventana deslizante de 256 tokens y cada cuarta capa aplica atención completa de 2048 tokens mediante `FlexAttention`. El tokenizer es un SuperBPE propio de 49.152 tokens con separación de dígitos individuales (0-9) y tokens de control fijos `<think>` / `</think>`.

El entrenamiento se divide en tres fases. El pretrain cubre 65.000 pasos y 8,52B tokens sobre FineWeb-Edu, Cosmopedia v2, FineMath 4+ y CodeParrot Clean. El midtrain de cooldown añade 8.000 pasos de annealing (1,07B tokens) centrados en matemáticas, Python y ejercicios aritméticos, hasta 9,59B tokens totales. El SFT final (`sft_v4_4_final.pt`) se entrena 1.600 pasos desde `midtrain_final.pt` con `val_loss=0.4751`. También se publica un baseline GRPO de 150 pasos desde el SFT temprano. El optimizador es `MuonWithAdamW`, con ortogonalización Newton-Schulz Polar Express de 5 pasos y escalado RMS Moonlight sobre pesos 2D, más AdamW fusionado para embeddings y escalares.

## Capacidades

- Generación de texto en inglés con modo de razonamiento explícito delimitado por `<think>` y `</think>`; el checkpoint recomendado cierra el bloque de pensamiento en el 99,01% de los casos en GSM8K greedy.
- Razonamiento aritmético y matemático de nivel básico (problemas GSM8K).
- Generación de código Python (evaluado en MBPP).
- Separación de dígitos individuales en el tokenizer, pensada para mejorar la aritmética a nivel de token.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del bloque de pensamiento.
- Soporte multilingüe limitado al inglés.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: el repositorio incluye checkpoints de pretrain, midtrain, SFT temprano, GRPO y SFT final, lo que permite reproducir ablaciones por fase y estudiar el efecto del cooldown y del RL.
- Experimentación con optimizadores Muon: útil para validar implementaciones de `MuonWithAdamW` con Newton-Schulz y escalado Moonlight en un modelo pequeño que cabe en GPUs de consumo.
- Prototipado de pipelines de razonamiento con tokens `<think>`: sirve para probar parsers de cadenas de pensamiento y formatos de salida estructurada sin coste elevado de inferencia.
- Docencia y divulgación: el modelo corre en una GTX 1050 Ti de 4 GB a 33,4-49,2 tok/s en float32, lo que permite demostrar generación de texto con KV cache y CUDA Graphs en hardware muy limitado.
- Evaluación de tokenizers SuperBPE con separación de dígitos: permite medir el impacto de decisiones de tokenización en tareas aritméticas.
- Generación de código Python para tareas triviales en entornos controlados, asumiendo la baja tasa de acierto (16,67% Pass@4 en MBPP) y sin uso en producción crítica.
- Base para destilación y fine-tuning: al ser pequeño y Apache 2.0, puede servir como alumno en experimentos de destilación desde modelos mayores.

## Benchmarks y rendimiento

GSM8K completo (1.319 problemas, `temp=0.0`, `max_new_tokens=512`):

| Checkpoint | Precisión estricta | Precisión flexible | `</think>` cerrado | Alcanza límite de 512 |
|---|---|---|---|---|
| `sft_v4_1_final.pt` | 26/1319 (1,97%) | 33/1319 (2,50%) | 80,44% | 259 |
| `grpo_v4_1_final.pt` | 37/1319 (2,81%) | 38/1319 (2,88%) | 94,92% | 71 |
| `sft_v4_4_final.pt` | 92/1319 (6,97%) | 93/1319 (7,05%) | 99,01% | 11 |

Held-out de 24 problemas GSM8K y 12 MBPP (`k=4`, `temp=0.65`):

| Checkpoint | Pass@1 global | Pass@4 global | Pass@4 matemáticas | Pass@4 código | `</think>` cerrado |
|---|---|---|---|---|---|
| `sft_v4_1_final.pt` | 2,08% | 8,33% | 8,33% | 8,33% | 96,53% |
| `grpo_v4_1_final.pt` | 4,2% | 13,9% | 16,7% | 8,3% | 98,6% |
| `sft_v4_4_final.pt` | 7,64% | 22,22% | 25,00% | 16,67% | 100,0% |

Zero-shot con `lm-eval` (124.839 pares por checkpoint):

| Benchmark | `pretrain_final.pt` | `midtrain_final.pt` | `sft_v4_1_final.pt` | `grpo_v4_1_final.pt` |
|---|---|---|---|---|
| `arc_easy` | 42,17 | 45,24 | 40,03 | 39,69 |
| `arc_challenge` | 24,49 | 25,34 | 25,26 | 25,17 |
| `piqa` | 59,30 | 58,27 | 59,74 | 59,90 |
| `hellaswag` | 31,13 | 30,64 | 30,72 | 30,66 |
| `winogrande` | 49,49 | 49,72 | 48,54 | 49,72 |
| `openbookqa` | 26,20 | 29,00 | 27,20 | 26,80 |
| `mmlu_continuation` | 24,91 | 25,20 | 24,63 | 24,48 |

Inferencia local: 33,4-49,2 tok/s en float32 sobre GTX 1050 Ti de 4 GB con decodificación KV-cached y CUDA Graphs.

## Requisitos de hardware

- VRAM estimada: los pesos en float32 ocupan aproximadamente 1,41 GB (352,3M parámetros × 4 bytes); con overhead de activaciones y KV cache, el modelo cabe en 4 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: el autor valida GTX 1050 Ti de 4 GB; cualquier GPU con al menos 4 GB de VRAM es suficiente en float32. Para entrenamiento se usaron B200 y H100 en Modal.
- Cabe en GPUs de consumo: sí, GTX 1050 Ti (4 GB) es el mínimo documentado.
- Opciones de despliegue: el repositorio proporciona `chat.py` con decodificación KV-cached y CUDA Graphs (`python chat.py --checkpoint checkpoints/sft_v4_4_final.pt`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 33,4-49,2 tok/s en float32 sobre GTX 1050 Ti.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NanoReasoner-300M (`sft_v4_4_final.pt`) | 352,3M | 2048 | 6,97% greedy | 16,67% Pass@4 | Apache 2.0 | Hugging Face (`.pt`) |
| Qwen2.5-0.5B | 494M | 32.768 | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 362M | 8192 | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Qwen3-0.6B | 596M | 32.768 | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | Hugging Face |

Los datos de benchmarks de los modelos comparables no se han incluido porque no forman parte de la información proporcionada; se indica "no disponible" para evitar cifras no verificadas. La comparación relevante es de escala y contexto: NanoReasoner-300M ofrece 2048 tokens de contexto frente a 8.192-32.768 de las alternativas, y un rendimiento en GSM8K muy inferior al esperable en modelos de su rango entrenados con pipelines estándar.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: 6,97% de precisión greedy en GSM8K y 16,67% de Pass@4 en MBPP; no es apto para tareas de producción que requieran fiabilidad.
- Contexto limitado a 2048 tokens, con solo 6 capas de atención completa; las otras 18 usan ventana de 256 tokens, lo que restringe el razonamiento sobre contextos largos.
- Solo inglés; no se declara ni evalúa soporte multilingüe.
- Riesgo elevado de alucinación y de razonamiento incorrecto: el 99,01% de cierres de `</think>` no implica corrección de la respuesta.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- El repositorio pesa 121,9 GB por la acumulación de checkpoints en float32; la descarga completa no es necesaria si solo se usa el SFT final.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni integración con servidores de inferencia estándar; el despliegue requiere cargar el `.pt` con PyTorch.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento del modelo hace desaconsejable su uso en productos reales sin fine-tuning adicional y validación exhaustiva.
- Proyecto experimental de un solo autor, con 0 descargas y 1 like en el momento de la consulta; no hay garantía de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Siah32423/idk325-ckpt
- Documento de benchmarks citado en la model card: `NANO_REASONER_V1_BENCHMARKS.md` (incluido en el repositorio)
- Plan de la v2 citado en la model card: `NANO_REASONER_V2_600M_PLAN.md` (incluido en el repositorio)
- Script de inferencia citado: `chat.py` (incluido en el repositorio)
- Script de destilación citado: `distill_test_inkling2_modal.py` (incluido en el repositorio)
- No se han encontrado papers, blogs, repositorios externos ni demos adicionales en la información proporcionada.
