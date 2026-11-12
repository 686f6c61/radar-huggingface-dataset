# jjge007/jaaiva-i1

## Resumen

JAAIVA i1 (Just Another Artificial Intelligence Virtual Assistant) es un modelo de lenguaje conversacional de 503.381.760 parámetros entrenado **desde cero** por el desarrollador independiente jjge007. No parte de pesos preentrenados, no usa destilación ni datos generados por API: es un transformer tipo GPT-2 con embeddings posicionales aprendidos, pre-LayerNorm, QKV fusionado, activación GELU y embeddings de entrada/salida atados. El repositorio publicado contiene únicamente una build en formato GGUF F16 (0,94 GiB) lista para llama.cpp.

El modelo se distribuye como una **release experimental e inestable**, así declarada por el propio autor. Está pensado como prototipo de investigación sobre entrenamiento from-scratch en hardware de consumo (una AMD Radeon RX 9070 XT vía ROCm), no como producto. Su corpus de entrenamiento es pequeño (367 millones de tokens en una sola época) y el contexto máximo es de solo 1.024 tokens, lo que lo sitúa muy por debajo de los estándares actuales de modelos conversacionales.

Su relevancia es fundamentalmente didáctica y de referencia: documenta de forma transparente el pipeline completo (tokenizador BPE byte-level de 8.192 tokens aprendido del corpus, preentrenamiento, preentrenamiento continuado, instruction tuning y conversión a GGUF) con métricas de pérdida y perplejidad publicadas. Resulta útil para quienes quieran estudiar el comportamiento de un modelo pequeño entrenado íntegramente desde cero, no para aplicaciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (pre-LayerNorm, QKV fusionado, GELU con aproximación tanh, embeddings posicionales aprendidos, embeddings entrada/salida atados) |
| Parametros totales | 503.381.760 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (publicado, 0,94 GiB); F32 (1,88 GiB) generable con el script de conversión; no se publican builds Q4/Q5/Q8 |
| Idiomas soportados | inglés únicamente |
| Licencia | other (licencia personalizada, sin términos detallados en la información disponible) |
| Formato de pesos | GGUF (F16); checkpoint original en PyTorch disponible vía repositorio GitHub |

Datos arquitectónicos adicionales: 25 capas, 20 cabezas de atención, anchura 1.280, feed-forward de 5.120, vocabulario de 8.192 tokens (BPE byte-level aprendido del corpus). Tokens especiales: `<|pad|>`=0, `<|bos|>`=1, `<|eos|>`=2, `<|user|>`=3, `<|assistant|>`=4.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de estilo GPT-2, sin innovaciones modernas como atención lineal, MoE, decodificación especulativa ni modos de razonamiento. Emplea normalización pre-LayerNorm, proyección QKV fusionada, activación GELU con aproximación tanh, embeddings posicionales aprendidos y atado de embeddings de entrada y salida. El tokenizador es un BPE byte-level de 8.192 tokens entrenado específicamente sobre el corpus, sin reutilizar ningún tokenizador preentrenado.

El entrenamiento se dividió en tres fases. El **preentrenamiento** cubrió 367.477.225 tokens en una sola época (3.739 pasos, 98.304 tokens por paso con 12 secuencias de 1.024 tokens y acumulación de 8), en bf16 con AdamW fusionado y warmup + cosine decay. Un **preentrenamiento continuado** repitió el mismo corpus con un optimizador nuevo y learning rate máximo menor (1,5e-4) durante otros 3.739 pasos. El **instruction tuning** añadió 2.500 pasos con learning rate de 4e-5 a 4e-6, mezclando pares de identidad y small-talk, cadenas multiturno, replay general, UltraChat-200k y Dolly-15k, calculando la pérdida solo sobre tokens del asistente y el token de fin de respuesta. Los datos de preentrenamiento provinieron de DailyDialog, PersonaChat, EmpatheticDialogues, BlendedSkillTalk, SODA y WikiText-103. Todo el entrenamiento se ejecutó en una AMD Radeon RX 9070 XT (gfx1201) con ROCm 7.2, a unos 16,1k tokens/s y con un pico de ~11 GiB de VRAM.

## Capacidades

- Generación de texto conversacional en inglés: diálogo multiturno básico con plantilla de chat embebida en el GGUF.
- Small-talk e identidad: responde a preguntas sobre sí mismo y mantiene conversación trivial (saludos, bromas, expresiones empáticas).
- Comprensión de instrucciones simples: ajustado con UltraChat-200k y Dolly-15k para seguir peticiones cortas.
- Historial multiturno limitado: la CLI de referencia conserva como máximo tres intercambios de historial.
- Servidor compatible con OpenAI: se puede desplegar con `llama-server` y consumir vía `/v1/chat/completions` con un array estándar de `messages`.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No dispone de visión, audio ni modo de razonamiento extendido.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Estudio de entrenamiento from-scratch: reproducir el pipeline completo (tokenizador, preentrenamiento, instruction tuning, conversión GGUF) para entender el coste y las limitaciones de entrenar un modelo pequeño desde cero en una sola GPU de consumo.
- Docencia sobre tokenización BPE: analizar el vocabulario de 8.192 tokens aprendido del corpus y comparar su comportamiento con tokenizadores de modelos grandes.
- Pruebas de integración con llama.cpp: validar el flujo de conversión PyTorch → GGUF, la plantilla de chat embebida y el servidor compatible con OpenAI en un entorno controlado.
- Experimentos de sampling: el autor documenta que la penalización de repetición 1.15 es crítica para evitar bucles; sirve como caso de estudio de cómo los parámetros de muestreo afectan a modelos pequeños.
- Prototipado de chatbots triviales sin requisitos de calidad: respuestas de small-talk, saludos y empatía básica en demos internas donde la corrección factual no es relevante.
- Benchmark de referencia para modelos pequeños: comparar perplejidad (3,83 en test tras el segundo pase) y comportamiento conversacional con otros modelos de ~500M entrenados desde cero.
- Evaluación de deriva numérica PyTorch vs ggml: el autor documenta divergencia en decodificación greedy en prompts creativos, útil para estudiar diferencias de implementación entre backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica únicamente métricas de pérdida y perplejidad del modelo base:

| Split | Loss | Perplejidad |
|---|---|---|
| Validación, primer pase | 1,4599 | 4,31 |
| Test, primer pase | 1,4290 | 4,17 |
| Validación, pase continuado | 1,3749 | 3,95 |
| Test, pase continuado | 1,3429 | 3,83 |

Datos de entrenamiento: ~16,1k tok/s de throughput y ~11 GiB de pico de VRAM en una AMD Radeon RX 9070 XT con ROCm 7.2. No se publican latencias de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GiB para la build F16 (0,94 GiB de pesos) y ~2 GiB para una build F32 (1,88 GiB), más overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GiB de VRAM; el modelo cabe holgadamente en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU.
- Cabe en consumer GPU: sí, sin ninguna dificultad por tamaño; el cuello de botella es la calidad del modelo, no el hardware.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` con endpoint compatible con OpenAI), y cualquier runtime que consuma GGUF con arquitectura GPT-2.
- Latencia y throughput estimados: no disponibles para inferencia; el autor solo reporta throughput de entrenamiento.
- Parámetros de muestreo recomendados: `--temp 0.5 --top-k 30 --top-p 0.85 --repeat-penalty 1.15` (con 1.05 el modelo entra en bucles de repetición).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada. A continuación se comparan características estructurales con alternativas de tamaño similar ampliamente conocidas, indicando "no disponible" donde no hay datos verificables para este modelo:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JAAIVA i1 | 503M | 1.024 | other | GGUF F16 | Entrenado from-scratch, inglés, inestable |
| GPT-2 small | 124M | 1.024 | MIT | safetensors, GGUF | Referencia clásica; preentrenado en corpus mucho mayor |
| GPT-2 medium | 355M | 1.024 | MIT | safetensors, GGUF | Comparable en orden de magnitud; preentrenado en WebText |
| Qwen2.5-0.5B | ~500M | 32.768 | Apache 2.0 | safetensors, GGUF | Multilingüe, instruction-tuned, benchmarks publicados |

La comparación de rendimiento con estos modelos no está disponible para JAAIVA i1, ya que no se han publicado evaluaciones en benchmarks estándar. Por escala y contexto, JAAIVA i1 es sustancialmente más limitado que Qwen2.5-0.5B en ventana de contexto y cobertura de idiomas, y su licencia "other" es menos permisiva que Apache 2.0 o MIT.

## Limitaciones y advertencias

- **Modelo declarado inestable por el autor**: no es un producto y no debe usarse para nada importante.
- **Infraentrenado**: dos pasadas sobre 367M tokens es muy poco; el modelo es fluido pero no tiene conocimiento factual fiable.
- **Alucinación y errores factuales**: el autor advierte explícitamente de que da datos incorrectos y ocasionalmente consejos inseguros o de baja calidad.
- **Repetición**: puede entrar en bucles ("the sky is blue because it is blue") con penalizaciones de repetición bajas; requiere `repeat-penalty` de 1.15.
- **Contexto muy limitado**: 1.024 tokens; la CLI de referencia conserva como máximo tres intercambios de historial.
- **Solo inglés**: no comprende ni genera otros idiomas.
- **Restricciones de licencia**: licencia "other" sin términos detallados en la información disponible; verificar antes de cualquier uso comercial.
- **Comportamiento cambiante**: el autor advierte de que el comportamiento puede cambiar entre revisiones sin aviso.
- **Uso prohibido recomendado**: preguntas médicas, legales, financieras o de seguridad crítica.
- **Deriva numérica**: se documenta divergencia entre PyTorch y ggml en decodificación greedy para prompts creativos abiertos (deriva numérica normal, no error estructural).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjge007/jaaiva-i1
- Repositorio GitHub (script de conversión y checkpoint PyTorch): https://github.com/jjgd008/jaaiva-i1
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
