# brulee-1/Rill-51M-A25M-Base

## Resumen

Rill-51M-A25M-Base es un modelo de lenguaje causal de pequeno tamano (51,5 millones de parametros totales, 25 millones activos por token) desarrollado por el usuario brulee-1 y publicado en Hugging Face. Se trata de un modelo preentrenado desde cero con una arquitectura hibrida propia que combina capas Gated DeltaNet-2 (atención lineal recurrente) con capas de atención GQA clásica, y una red feed-forward de tipo Mixture-of-Experts con 8 expertos enrutados (top-2) mas un experto compartido.

El modelo se entrena sobre 2.000 millones de tokens de texto en inglés procedente de FineWeb-Edu (70%) y FineWeb (30%), e incorpora entrenamiento consciente de cuantización (QAT) con expertos enrutados en NVFP4 y proyecciones de atención en FP8. Su relevancia es fundamentalmente investigadora: permite experimentar con arquitecturas hibridas y MoE en hardware de consumo (se entrenó en una sola RTX 5090 en unas 5,4 horas) y ejecutarse localmente en CUDA, Apple Silicon o CPU.

No es un modelo de propósito general: sus resultados en benchmarks estándar están cerca del azar en varias tareas (WinoGrande 50,28%, ARC-Challenge 23,29%, MMLU 22,95%), lo que refleja su escala reducida y su naturaleza de experimento de arquitectura mas que de asistente utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only hibrida: Gated DeltaNet-2 + GQA, FFN Mixture-of-Experts |
| Parametros totales | 51.524.854 |
| Parametros activos | 24.982.774 por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | BF16 (canónico); QAT simulado con expertos enrutados NVFP4 y proyecciones de atención/KV en FP8; no se publican pesos GGUF ni otros formatos cuantizados |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (pesos y código); datos de entrenamiento bajo ODC-By 1.0 |
| Formato de pesos | safetensors (BF16) |

Otras especificaciones: hidden size 384; 12 capas (9 GDN2 + 3 GQA, patrón GDN2 ×3 → GQA repetido 3 veces); Gated DeltaNet-2 con 6 cabezas, dimensión de cabeza 64 y convolución corta de 4; GQA con 6 cabezas de query, 2 de KV, dimensión 64 y RoPE θ=10000; MoE con 8 expertos SwiGLU enrutados (intermediate 320), top-2, mas 1 experto compartido (intermediate 128); RMSNorm pre-norm y RMSNorm con puerta en salidas GDN2; embedding factorizado con ataduras, rango 128; vocabulario de 32.768 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only híbrido. Nueve de las doce capas usan Gated DeltaNet-2, un mecanismo de atención lineal recurrente con estado recurrente de tamano fijo, y tres usan atención GQA convencional con caché KV. Esta combinación busca reducir el coste de memoria y cómputo en secuencias largas manteniendo capacidad de atención global en puntos estratégicos de la red. La FFN es un MoE con 8 expertos enrutados SwiGLU (top-2) mas un experto compartido, lo que da lugar a los 25 millones de parametros activos frente a los 51,5 millones totales. El tokenizador es un BPE a nivel de byte con normalización NFKC y 32.768 entradas.

El preentrenamiento se realizó desde cero durante exactamente 2.000 millones de tokens (30.518 pasos de 65.536 tokens, secuencia de 4.096, documentos empaquetados con reinicio de estado y atención por documento). Los datos son 1,4B tokens de FineWeb-Edu (int_score ≥ 3) y 0,6B de FineWeb sample-10BT, en inglés y deduplicados. Se usó AdamW (β = 0,9/0,95, weight decay 0,1), LR pico 4e-4 con warmup de 40M tokens y decaimiento coseno hasta 4e-5. Destaca el entrenamiento consciente de cuantización: BF16 hasta 100M tokens, luego expertos enrutados en NVFP4 y, desde 200M tokens, también proyecciones de atención y KV en FP8. La pérdida de validación final fue 3,426 en BF16 y 3,439 con simulación de cuantización. Todo el entrenamiento cupo en una NVIDIA RTX 5090 en aproximadamente 5,4 horas.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo base de completado, sin plantilla de chat ni ajuste por instrucciones).
- Razonamiento básico y modelado del lenguaje a escala muy reducida; útil como banco de pruebas de arquitectura, no como asistente fiable.
- Inferencia incremental eficiente: cada capa GDN2 mantiene un estado recurrente de tamano fijo y cada capa GQA una caché KV.
- Ejecución local en CUDA, Apple Silicon (MPS) y CPU con un único script autónomo (`inference.py`).
- Tokens especiales definidos para turnos (`<|instruction|>`, `<|context|>`, `<|response|>`, `<|endoftext|>`, `<|pad|>`), aunque el modelo no está ajustado para seguirlos de forma fiable.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Investigación en arquitecturas híbridas: sirve para reproducir y estudiar la combinación Gated DeltaNet-2 + GQA con estado recurrente y caché KV, comparando coste de memoria y calidad frente a un transformer puro de igual tamano.
- Experimentación con MoE de escala reducida: permite analizar el comportamiento del enrutamiento top-2 con experto compartido y el efecto del QAT con expertos en NVFP4 en un modelo que cabe en una sola GPU de consumo.
- Pruebas de cuantización: el checkpoint BF16 y el esquema QAT documentado permiten validar pipelines de cuantización y medir la degradación de perplejidad (3,426 → 3,439) en hardware limitado.
- Desarrollo y depuración de kernels de inferencia: el estado recurrente de tamano fijo de GDN2 y la caché KV de GQA son un caso de prueba útil para implementar decodificación incremental eficiente en CUDA, MPS o CPU.
- Educación y demostraciones: su tamano (repo de 0,1 GB) y licencia MIT facilitan su uso en cursos y talleres sobre entrenamiento de LLM desde cero en una sola GPU.
- Generación de texto de baja exigencia en local: completado de texto en inglés para prototipos y pruebas de integración donde la calidad no es crítica y se prioriza ejecución en CPU o portátil.
- Baseline para ablaciones: punto de partida controlado para comparar cambios de arquitectura, datos o esquemas de cuantización en experimentos académicos.

## Benchmarks y rendimiento

Evaluación zero-shot con lm-evaluation-harness 0.4.13, sin plantilla de chat, pesos BF16 en CUDA, conjuntos completos de test/validación.

| Tarea | Métrica | Shots | Base |
|---|---|---:|---:|
| HellaSwag | acc_norm | 0 | 27,88% |
| PIQA | acc_norm | 0 | 59,85% |
| ARC-Easy | acc_norm | 0 | 37,96% |
| ARC-Challenge | acc_norm | 0 | 23,29% |
| LAMBADA OpenAI | acc | 0 | 20,20% |
| WinoGrande | acc | 0 | 50,28% |
| BoolQ | acc | 0 | 51,53% |
| MMLU (57 materias, ponderado por tamano) | acc | 0 | 22,95% |
| Media de las ocho tareas | — | 0 | 36,74% |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint BF16 ocupa aproximadamente 0,1 GB, por lo que cabe holgadamente en cualquier GPU con 1-2 GB libres. En FP32 en CPU/MPS el uso de memoria es algo mayor pero sigue siendo trivial.
- GPU recomendadas: cualquier GPU moderna; se entrenó en una NVIDIA RTX 5090 y funciona en GPUs de consumo como RTX 3060/4060/4090. También en Apple Silicon vía MPS y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el bundle incluye `inference.py` autónomo (dependencias: torch, safetensors, tokenizers). No es compatible con `transformers.AutoModel` ni con vLLM, llama.cpp, Ollama o TGI de forma nativa, al ser una arquitectura personalizada sin pesos GGUF publicados.
- Latencia y throughput: no disponibles de forma medida; el autor documenta que la decodificación es incremental (estado recurrente fijo en GDN2 y caché KV en GQA) y que el cómputo va en BF16 en CUDA y FP32 en MPS/CPU, con router, estado recurrente, estadísticas de normalización y logits siempre en FP32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rill-51M-A25M-Base | 51,5M totales / 25M activos | 4.096 | Híbrida GDN2 + GQA, MoE | MIT | Hugging Face, inferencia propia |
| GPT-2 small | 124M | 1.024 | Transformer decoder-only | MIT | Hugging Face, transformers |
| Pythia-70M | 70M | 2.048 | Transformer decoder-only | Apache 2.0 | Hugging Face, transformers |
| SmolLM-135M | 135M | 2.048 | Transformer decoder-only | Apache 2.0 | Hugging Face, transformers |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; los benchmarks publicados de Rill corresponden solo a sí mismo. En terminos de ecosistema, la principal diferencia es que Rill requiere su propio cargador y no es compatible con `transformers`, mientras que los modelos citados se integran directamente en las librerías estándar.

## Limitaciones y advertencias

- Modelo muy pequeno: el propio autor advierte que produce errores factuales, repeticiones e incoherencia, y que está pensado para investigación y experimentación local, no como asistente fiable.
- Rendimiento cerca del azar en WinoGrande (50,28%), ARC-Challenge (23,29%) y MMLU (22,95%), lo que indica ausencia de conocimiento factual y razonamiento robustos.
- Solo entrenado en texto web en inglés; no hay capacidades multilingües ni datos en castellano.
- No ha recibido ajuste de seguridad (safety tuning) ni alineación por instrucciones; puede generar contenido inapropiado o sesgado presente en los datos web.
- Riesgo alto de alucinación y de degradación en generaciones largas.
- Contexto limitado a 4.096 tokens.
- Sin soporte en `transformers`, vLLM, llama.cpp u Ollama; requiere el script de inferencia incluido y dependencias específicas.
- Licencia MIT para pesos y código, pero los datos de entrenamiento conservan su licencia (ODC-By 1.0), lo que conviene revisar para usos derivados.
- No se incluyen datos de entrenamiento, estado del optimizador ni otros artefactos de entrenamiento en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brulee-1/Rill-51M-A25M-Base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
