# OrisTeam/Aster-150M-v1.5

## Resumen

Aster-150M-v1.5 es un modelo de lenguaje causal decoder-only de 147.096.832 parámetros (aproximadamente 147M) desarrollado por OrisTeam, entrenado desde inicialización aleatoria como parte de la familia Aster. Se trata de un modelo base en inglés, pensado como fundamento para preentrenamiento continuado, adaptación de dominio y ajuste fino, no como un asistente conversacional listo para usar. La familia Aster y Koliber anteriores eran en polaco; esta versión traslada la receta aprendida al inglés, el idioma principal de los benchmarks de modelos pequeños.

La arquitectura es un Transformer denso de 20 capas con tamaño oculto 768, atención de consulta agrupada (GQA) con 12 cabezas de consulta y 2 cabezas KV, FFN SwiGLU con tamaño intermedio 1.792 y embeddings de entrada/salida atados. El entrenamiento consumió 50.000.297.984 tokens (unos 340 tokens por parámetro) en una única ejecución de 22,9 horas sobre 8 × RTX 4090, con un coste aproximado de 105 dólares de cómputo.

El modelo resulta relevante por su enfoque de eficiencia extrema: demuestra qué rendimiento se puede alcanzar con un presupuesto de cómputo muy reducido y una receta de entrenamiento cuidadosamente fijada de antemano, sin reinicios. Su contexto de trabajo es de 2.048 tokens (aunque la configuración permite 4.096 posiciones, no validadas). Se publica bajo licencia CC BY-SA 4.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, 20 capas, hidden size 768, GQA (12 cabezas query / 2 KV, dim 64), SwiGLU (intermedio 1.792), RoPE θ=100.000, QK-Norm, puerta sigmoide en atención, Pre-RMSNorm en FP32 |
| Parametros totales | 147.096.832 (embeddings atados; límite duro < 150M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens entrenados; 4.096 posiciones configuradas (no validadas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo es un Transformer denso decoder-only con 20 bloques de 768 dimensiones. Los embeddings de entrada y salida están atados (32.768 × 768, 25,2M parámetros), y los 20 bloques suman 121,9M. Bajo el límite de 150M, atar los embeddings permitió invertir el presupuesto en profundidad (20 × 768 en lugar de 16 × 768). La atención usa GQA con 12 cabezas de consulta y 2 de KV, con dimensión de cabeza 64, más una puerta sigmoide elementwise sobre la salida de atención (`out = W_o · (a ⊙ σ(W_g · h))`), QK-Norm mediante RMSNorm sobre la dimensión de cabeza, y RoPE con θ = 100.000.

El entrenamiento usó predicción del siguiente token con documentos empaquetados en ventanas de 2.048 tokens separadas por `<|endoftext|>`. Se procesaron 50.000.297.984 tokens en 47.684 actualizaciones, con batch global de 1.048.576 tokens. El optimizador fue Muon para las matrices 2-D de los bloques (momentum Nesterov 0,95, 5 pasos Newton–Schulz, lr 0,02) y AdamW para el embedding atado (lr 3e-3, wd 0,1) y los pesos de normalización (lr 3e-3, wd 0, β = (0,9, 0,95)). El schedule fue warmup–stable–decay por tokens: 0,5B de warmup, constante hasta 40B, y decaimiento 1−√ hasta cero en los últimos 10B (20%). Se usó clipping de norma global 1,0, pesos maestros y estado del optimizador en FP32, autocast BF16, DDP de PyTorch, SDPA con backend FlashAttention y `torch.compile`. El hardware fueron 8 × RTX 4090 (PCIe, sin NVLink), con un throughput de ~615k tokens/s, MFU ≈ 0,59 y 14,4 GB de pico de memoria por GPU.

Los datos son exclusivamente en inglés, de fuentes públicas fijadas a revisiones exactas, sin datos sintéticos, sin datos de instrucción o chat y sin splits de benchmark: FineWeb-Edu dedup (28,3B tokens entrenados), DCLM-baseline (8,6B), Cosmopedia v2 (4,7B), FineMath 3+ (4,0B), Wikipedia EN (3,4B) e InfiWebMath 4+ (1,0B), sobre 60,32B únicos disponibles.

## Capacidades

- Generación de texto causal en inglés: el modelo produce inglés fluido como modelo base de continuación de texto.
- Razonamiento y conocimiento general: entrenado con mezcla de web educativa, matemáticas y Wikipedia, cubre conocimiento enciclopédico y matemático básico.
- Matemáticas: incluye 5,0B tokens de FineMath e InfiWebMath, lo que le da exposición específica a contenido matemático.
- Punto de partida para ajuste fino: diseñado explícitamente como base para preentrenamiento continuado, adaptación de dominio y fine-tuning.
- No soporta tool calling ni function calling de forma nativa (modelo base sin ajuste de instrucciones).
- No soporta agentes ni razonamiento multi-paso de forma fiable (sin instruction tuning).
- Capacidades multilingües: solo inglés; no se ha entrenado en otros idiomas.
- Sin modo thinking, visión ni audio: es un modelo de texto puro.

## Casos de uso

- Preentrenamiento continuado en dominio: partir de los pesos de Aster-150M-v1.5 y continuar el entrenamiento con datos propios (por ejemplo, documentación técnica o corpus jurídico en inglés) para adaptar el modelo a un dominio concreto con un coste de cómputo reducido.
- Ajuste fino supervisado para tareas concretas: usar el modelo como base para SFT en tareas de clasificación, extracción o generación estructurada, aprovechando que sus 147M parámetros permiten iterar rápido en una sola GPU consumer.
- Generación de texto asistida en entornos con recursos limitados: desplegar el modelo para completar texto o redactar borradores en inglés en dispositivos con poca VRAM, dado su tamaño reducido.
- Investigación en eficiencia de modelos pequeños: reproducir o extender la receta (Muon, GQA, atención con puerta) como banco de pruebas para experimentos de arquitectura y optimización a bajo coste.
- Filtrado y puntuación de datos: usar la perplejidad del modelo como señal para clasificar o filtrar corpus en inglés, ya que está entrenado sobre mezclas web, matemáticas y Wikipedia.
- Educación y demostraciones: servir como modelo didáctico para explicar el ciclo completo de preentrenamiento desde cero (tokenizador propio, mezcla de datos, schedule) en cursos o talleres.
- Base para destilación: emplearlo como estudiante o profesor en experimentos de destilación de conocimiento con modelos mayores, gracias a su bajo coste de inferencia y entrenamiento.

## Benchmarks y rendimiento

La model card indica que el modelo figura en el Open SLM Intelligence Index con una puntuación de 21,51, en la posición 22 de 253 modelos de menos de 150M parámetros. No se han publicado en la información disponible resultados detallados por benchmark (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos similares.

| Benchmark | Resultado |
|---|---|
| Open SLM Intelligence Index | 21,51 (#22 de 253 modelos <150M) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 147M parámetros ocupan aproximadamente 0,3 GB de pesos; con overhead de activaciones y contexto, cabe holgadamente en GPUs de 4-8 GB. En cuantizaciones de 8 bits o 4 bits (si se generan) el consumo sería aún menor, aunque el autor no publica cuantizaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (librería nativa, con `custom_code`), y previsiblemente llama.cpp/Ollama si se convierten los pesos a GGUF (no publicado por el autor); vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no se publican cifras de inferencia. Como referencia de entrenamiento, el autor reporta ~615k tokens/s con 8 × RTX 4090 en entrenamiento, dato no trasladable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Aster-150M-v1.5 | 147M | 2.048 (4.096 config.) | CC BY-SA 4.0 | inglés | Modelo base, entrenado desde cero con 50B tokens, coste ~105 USD |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | inglés | Modelo base de HuggingFaceTB, comparable en tamaño y propósito |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | multilingüe | Mayor tamaño y contexto, pero no es de la misma escala |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | inglés | Modelo base de EleutherAI, referencia clásica en modelos pequeños |

La comparación numérica de rendimiento entre estos modelos no está disponible en la información proporcionada; solo se conoce la posición de Aster-150M-v1.5 en el Open SLM Intelligence Index (21,51, puesto 22 de 253).

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni alineación de seguridad: no debe usarse como asistente conversacional sin fine-tuning y salvaguardas.
- Alucinación: el autor advierte explícitamente que inventa hechos, números y nombres, y que puede desviarse o repetirse en la generación.
- Contexto limitado: el contexto de trabajo real es de 2.048 tokens; las 4.096 posiciones configuradas no están validadas y no deben asumirse como soporte de contexto largo.
- Solo inglés: no se ha entrenado en castellano ni en otros idiomas, por lo que su uso en español no es fiable.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Sin datos de benchmarks detallados ni de cuantizaciones publicadas: la evaluación disponible se limita a una puntuación agregada del índice.
- Sin soporte nativo de tool calling ni de agentes: cualquier uso en pipelines de herramientas requiere ajuste fino específico.
- Sesgos: al entrenarse con corpus web (FineWeb-Edu, DCLM) y Wikipedia, puede heredar sesgos de esas fuentes; el autor no documenta evaluaciones de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/OrisTeam/Aster-150M-v1.5
- Dataset FineWeb-Edu (smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM-baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Wikipedia (EN): https://huggingface.co/datasets/wikimedia/wikipedia
