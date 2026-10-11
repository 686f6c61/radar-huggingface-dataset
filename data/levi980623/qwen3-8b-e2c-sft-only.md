# Levi980623/Qwen3-8B-E2C-SFT-only

## Resumen

Qwen3-8B-E2C-SFT-only es un ajuste fino supervisado (SFT) de parámetros completos del modelo base Qwen/Qwen3-8B, publicado por el usuario Levi980623. El modelo se entrena sobre los datos oficiales de Explore-Execute Chain (E²C), una metodología que enseña al modelo a separar explícitamente una fase de planificación (`<EXPLORATION>`) de una fase de ejecución (`<EXECUTION>`) con la respuesta final dentro de `\boxed{}`. El objetivo es mejorar el razonamiento matemático estructurado y verificable en tareas de tipo MATH.

Es el gemelo de 8B del modelo zhaohq/Qwen3-4B-E2C-SFT-only: comparte procesamiento de datos, parche del entrenador e hiperparámetros, de modo que los resultados de 4B y 8B son directamente comparables. El repositorio contiene 8.190.735.360 parámetros en bf16 (≈32,8 GB de pesos), con licencia Apache 2.0, y la revisión `main` corresponde al checkpoint del paso 800 (el de menor pérdida de validación completa), mientras que el paso 1000 final vive en la rama `step-1000`.

La relevancia actual del modelo radica en que demuestra que un SFT ligero (~1,29 época sobre 49.684 muestras) con formato de cadena estructurada mejora la precisión en problemas matemáticos retenidos (19/20 en 20 problemas de MATH-500 con decodificación greedy en el paso 800), y que no necesita RL ni LoRA para hacerlo. Está pensado para inglés y para generación de texto con plantilla de chat, sin modo de razonamiento extendido (`enable_thinking`) ni tokens `<think>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), basado en Qwen/Qwen3-8B |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el base Qwen3-8B (ampliable con YaRN); el SFT se entrenó con `max_length` de 4.096 tokens |
| Tipos de cuantizacion | No especificado por el autor; al ser safetensors bf16 admite cuantizaciones derivadas (GGUF, AWQ, GPTQ, bitsandbytes) generadas por terceros |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `model-0000x-of-00004.safetensors`, `lm_head` sin atar) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B original: un transformer decoder-only denso con atención de consultas agrupadas (GQA) y RMSNorm, sin mezcla de expertos. El ajuste se hizo de forma full-parameter (sin LoRA ni RL) sobre la revisión `b968826d9c46dd6066d109eabc6255188de91218` del base, con FSDP2 en bf16, gradient checkpointing y Flash-Attention 2. Hiperparámetros: AdamW con lr 2e-5, betas (0.9, 0.95), weight decay 0.01, warmup del 10 % y decaimiento coseno durante 1000 pasos, recorte de gradiente 1.0, batch global 64 (micro batch 1 por GPU, 4×H200 con 16 acumulaciones). El entrenamiento completo duró 2 h 04 min en 4×H200 (6,8 s/paso, 24,4 GB/GPU).

Los datos provienen del dataset oficial TingheOliver/Explore-Execute-Chain-Datasets con división 95/5 (semilla 42): 49.684 muestras de entrenamiento y 2.611 de validación, tras descartar las muestras cuya ejecución se trunca en origen (tokens supervisados ≥ 1995). Se añade `<|im_end|>` al objetivo. La innovación clave es el formato E²C: el modelo genera primero `<EXPLORATION>` con un plan paso a paso y luego `<EXECUTION>` con la derivación y la respuesta dentro de `\boxed{}`, terminando en `<|im_end|>` (que actúa como token de parada aprendido, sin necesidad de stop strings externos). No se usó RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat estándar de Qwen3 (sin `enable_thinking`).
- Razonamiento matemático estructurado mediante el formato Explore-Execute Chain: planificación explícita seguida de ejecución con derivaciones.
- Emisión de planes en `<EXPLORATION>` y ejecución en `<EXECUTION>`, con respuesta final en `\boxed{}`.
- Terminación limpia de la generación mediante `<|im_end|>`, aprendido como EOS durante el SFT.
- Capacidad de responder sin plan explícito (el autor reporta evaluaciones con y sin plan), aunque con mayor pérdida de entropía cruzada sin él (0,210 frente a 0,140).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el formato E²C sí estructura un razonamiento en pasos.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: none de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Resolución de problemas matemáticos de nivel competición: el modelo está afinado sobre MATH y ejecuta razonamientos paso a paso con respuesta en `\boxed{}`, adecuado para evaluación automática de resultados.
- Tutoría matemática interactiva: la separación entre plan y ejecución permite mostrar al estudiante el razonamiento antes del resultado, útil en plataformas educativas que requieren explicaciones trazables.
- Generación de soluciones verificables en pipelines de datos: el formato estructurado facilita el parseo automático de la respuesta final y la comprobación con un verificador simbólico.
- Investigación sobre formatos de razonamiento: sirve como referencia reproducible frente al gemelo de 4B para estudiar el efecto del tamaño del modelo en SFT de cadena explore-execute.
- Evaluación comparativa de SFT ligero: con solo ~1,29 época y 2 h de cómputo en 4×H200, es un caso práctico para medir el coste-beneficio de un ajuste acotado.
- Base para futuros ajustes específicos de dominio matemático: al ser full-parameter SFT con licencia Apache 2.0, se puede continuar entrenando sobre datos propios.
- Generación de conjuntos de datos sintéticos de razonamiento matemático: sus salidas con plan y ejecución pueden usarse como datos de destilación o aumento de dataset.

## Benchmarks y rendimiento

| Metrica | 8B (este repo, paso 800) | 8B (paso 1000) | 4B gemelo (paso 1000) |
|---|---|---|---|
| Pérdida de train, paso 1 | 0,467 | — | 0,521 |
| Pérdida de validación completa (2.611 registros) | 0,15884 (800) / 0,15893 (900) / 0,15893 (1000) | 0,15893 | 0,18234 |
| MATH-500 retenido (20 problemas, greedy): formato / parada EOS / correcto | 20/20 · 20/20 · 19/20 | 20/20 · 20/20 · 18/20 | 20/20 · 20/20 · 15/20 |
| Entropía cruzada de ejecución en tokens no repetidos con / sin plan | 0,140 / 0,210 | — | ≈0,158 / ≈0,230 |
| Tensores idénticos al base tras el SFT (bf16, ganancias RMSNorm) | 51 / 399 | — | 55 / 398 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K completos) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~16,4 GB solo de pesos, más caché KV (crece con la longitud de secuencia; para 4.096 tokens depende del batch).
- Cuantización de 8 bits: ~8,2 GB; 4 bits: ~4,1 GB (requiere conversión a GGUF/AWQ/GPTQ, no incluida en el repo).
- GPU recomendadas: H100, H200 o A100 80 GB para bf16 con lotes grandes y contexto largo; A100 40 GB sirve para batch reducido.
- Cabe en GPU de consumo: sí en bf16 ajustado sobre RTX 4090 / 3090 (24 GB) con batch 1 y contextos moderados; en 4 bits cabe cómodamente en 8-12 GB.
- Opciones de despliegue: transformers (según el ejemplo del autor), vLLM, TGI (el repo está etiquetado como text-generation-inference y endpoints_compatible), llama.cpp/Ollama tras conversión a GGUF.
- Entrenamiento de referencia: FSDP2 con 24,4 GB/GPU y 6,8 s/paso en 4×H200 a `max_length` 4.096.
- Latencia y throughput de inferencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (20 retenidos, greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-E2C-SFT-only (este) | 8,19 B | 32.768 (SFT a 4.096) | 19/20 (paso 800) | Apache 2.0 | HuggingFace |
| zhaohq/Qwen3-4B-E2C-SFT-only | ~4 B | 32.768 (SFT a 4.096) | 15/20 (paso 1000) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B (base) | 8,19 B | 32.768 (ampliable) | No evaluado en esta comparativa | Apache 2.0 | HuggingFace |

La comparación con otros modelos de razonamiento matemático del mismo rango (por ejemplo destilados de DeepSeek-R1 o series Qwen2.5-Math) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Alucinación: al ser un modelo de razonamiento matemático, puede producir derivaciones plausibles pero incorrectas, especialmente fuera del dominio de MATH.
- Sesgos: no se documentan análisis de sesgo; el entrenamiento monolingüe en inglés limita su uso en otros idiomas.
- Idiomas: únicamente inglés; no hay soporte multilingüe declarado.
- Contexto: aunque el base soporta 32.768 tokens, el SFT se hizo con `max_length` de 4.096, por lo que el comportamiento más allá de esa longitud no está validado.
- Tokenización del plan/ejecución: la secuencia `><` en `</EXPLORATION><EXECUTION>` es un único token, de modo que no existe una frontera token a token limpia entre plan y ejecución.
- Pesos sin master fp32: 51 tensores de ganancia RMSNorm nunca cambiaron durante el SFT (configuración oficial del base en bf16).
- Desviaciones del protocolo oficial: exposición de ~1,29 época en lugar de ~2,9; `max_length`, EOS y el filtro de truncado difieren del script oficial.
- 352 muestras de entrenamiento conservadas no contienen `\boxed{}` (el filtro es solo por longitud), lo que puede inducir respuestas sin delimitador final en algunos casos.
- Uso comercial: permitido bajo Apache 2.0, pero conviene verificar la licencia del dataset y de los modelos base heredados.
- Estado del repositorio: sin descargas ni likes en el momento de la ficha, con lo que no hay validación externa independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/Levi980623/Qwen3-8B-E2C-SFT-only
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Gemelo de 4B: https://huggingface.co/zhaohq/Qwen3-4B-E2C-SFT-only
- Dataset E²C: https://huggingface.co/datasets/TingheOliver/Explore-Execute-Chain-Datasets
- Repositorio GitHub de Explore-Execute Chain: https://github.com/OliverZ-dot/Explore-Execute-Chain
