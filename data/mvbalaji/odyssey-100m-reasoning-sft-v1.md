# mvbalaji/ODYSSEY-100M-REASONING-SFT-V1

## Resumen

ODYSSEY-100M-REASONING-SFT-V1 es un modelo de lenguaje causal de 100.248.960 parámetros desarrollado por Balaji Venkateswaran (mvbalaji) como artefacto de investigación. Se trata de un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base ODYSSEY-100M-5B-BASE, que fue preentrenado desde cero con 5.000 millones de tokens. El ajuste consistió en un piloto de 10 millones de tokens sobre datos verificados de matemáticas, código, lógica e instrucciones, ejecutado íntegramente en una GPU local RTX 4060.

El modelo aborda el problema de dotar de capacidades de razonamiento básico a un modelo de lenguaje de escala muy reducida mediante SFT selectivo, sin recurrir a RLHF ni a métodos de parcheo de pesos. Su relevancia radica en que documenta de forma transparente y reproducible qué mejoras y qué regresiones se obtienen al aplicar SFT a un modelo de 100M de parámetros, incluyendo resultados emparejados contra el modelo base en elementos retenidos idénticos.

La arquitectura es un transformer de 15 capas con dimensión oculta 640, atención GQA con 10 cabezas de consulta y 2 de clave/valor, activación SwiGLU, RoPE y vocabulario de 32.768 tokens con embeddings atados. La longitud de contexto es de solo 1.024 tokens, lo que limita su uso a tareas cortas. El modelo está pensado exclusivamente para investigación y evaluación, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (15 capas, d=640, GQA 10/2, SwiGLU, RoPE) |
| Parametros totales | 100.248.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (implementación PyTorch propia, `modeling_odyssey.py`) |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder-only de 15 capas con dimensión 640, atención de consultas agrupadas (GQA) con 10 cabezas de consulta y 2 de clave/valor, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y vocabulario de 32.768 tokens con pesos de embedding atados. La implementación es personalizada y no corresponde a ninguna clase de `transformers`; el repositorio incluye `modeling_odyssey.py` y `example.py` para su carga y ejecución.

El preentrenamiento del base consumió 5.000 millones de tokens. El SFT posterior utilizó 10 millones de tokens (9.989.644 en total, de los cuales 4.842.368 supervisados) con la siguiente composición: 35% matemáticas (GSM8K train más sintéticos verificados), 30% código (sintéticos con tests unitarios, MBPP train y self-oss-instruct), 20% lógica sintética y 15% instrucciones más replay general. La receta de entrenamiento fue AdamW con β=(0.9, 0.95), LR pico de 3e-5 seleccionado de {1e-5, 3e-5, 1e-4}, warmup del 3%, decaimiento coseno hasta 0.1×, weight decay 0.1, clipping 1.0 y precisión bf16, durante 305 pasos. El entrenamiento completo duró 535 segundos a 18,7k tokens/s con un pico de 5,2 GB de VRAM, sumando 1,07 horas de GPU local en la fase 5. No se aplicó RLHF ni ajuste de seguridad, y el modelo no fue entrenado mediante WSP ni ningún método de parcheo de pesos. El formato de prompt es obligatorio: `### Instruction:\n{task}\n\n### Response:\n`, con tokenización separada de prompt y respuesta.

## Capacidades

- Generación de texto causal con formato de instrucción fijo.
- Razonamiento matemático básico: fracciones, comparación de números, álgebra elemental y problemas verbales de 1-2 pasos (mejoras de +0.52, +0.40, +0.19 y +0.24 frente al base).
- Razonamiento lógico: mejora de 0.16 a 0.36 en el conjunto completo y de 0.12 a 0.29 en elementos no vistos.
- Seguimiento de instrucciones verificables: de 0 a 0.46 en el conjunto evaluado (espacio de contenido pequeño).
- Generación de código limitada: pass@1 de 1,6% en MBPP y 0,6% en HumanEval; 97% en familias de código entrenadas con argumentos nuevos (memorización de familias).
- Respuestas terminadas en `Final answer: …` o en bloque de código seguido de EOS.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso complejo.
- Capacidades multilingües: únicamente inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre SFT en modelos pequeños: el modelo sirve como caso de estudio reproducible para medir el efecto del SFT en un transformer de 100M, con receta, datos y evaluación documentados y scripts de reproducción (`build_data`, `train_sft`, `evaluate_sft`).
- Evaluación de regresiones por ajuste fino: permite analizar empíricamente cómo el SFT mejora fracciones y lógica pero degrada la aritmética de un dígito (de 0.48 a 0.12), útil para estudiar olvido catastrófico en modelos reducidos.
- Generación de problemas matemáticos elementales con formato controlado: con el prompt `### Instruction:` puede producir respuestas estructuradas para problemas de 1-2 pasos, aprovechable en experimentos de destilación o generación de datos sintéticos de baja calidad controlada.
- Clasificación y resolución de acertijos lógicos simples: su mejora en lógica (0.36) lo hace apto para prototipos de evaluación de razonamiento simbólico en entornos de investigación.
- Pruebas de infraestructura de inferencia: al necesitar solo 5,2 GB de pico en entrenamiento y un repo de 0,4 GB, es útil para validar pipelines de carga con `safetensors`, `tokenizers` y `huggingface_hub` en hardware consumer.
- Docencia y demostraciones de arquitecturas transformer: su implementación autocontenida en PyTorch (`modeling_odyssey.py`) permite ilustrar GQA, SwiGLU y RoPE en un modelo de tamaño manejable.
- Reproducción de experimentos de alineación sin RLHF: sirve como línea base para comparar con las variantes V2, P7-C1, P7-C2 y P7-C3-RL de la misma familia.

## Benchmarks y rendimiento

Resultados emparejados contra el modelo base en elementos retenidos idénticos, según la model card:

| Capacidad | Base → SFT | Estado |
|---|---|---|
| Compuesto matemático (R-EVAL 1.140) | 0,077 → 0,139 | Significativo, replicado |
| Fracciones | +0,52 | Significativo |
| Comparación de números | +0,40 | Significativo |
| Álgebra | +0,19 | Significativo |
| Problemas verbales de 1-2 pasos | +0,24 | Significativo |
| Aritmética de un dígito | 0,48 → 0,12 | Regresión, replicada |
| Multi-dígito ×, ÷; 5 dígitos +/−; problemas de 3 pasos | ≈0 | Sin ganancia |
| GSM8K | 0,022 → 0,025 | No significativo |
| Lógica (todo / no visto) | 0,16 → 0,36 / 0,12 → 0,29 | Significativo |
| Instrucciones verificables | 0 → 0,46 | Significativo (espacio pequeño) |
| MBPP pass@1 | 0 → 1,6% | Marginal |
| HumanEval pass@1 | 0 → 0,6% | Marginal |
| Familias de código entrenadas (argumentos nuevos) | 0 → 97% | Memorización de familias |
| NLL dev general / matemáticas / código | +0,013 / +0,057 / +0,042 | General dentro del guard de 0,05 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento tuvo un pico de 5,2 GB en bf16, por lo que la inferencia en bf16 debería situarse por debajo de esa cifra.
- GPU recomendadas: el autor entrenó en una RTX 4060; cualquier GPU consumer con al menos 6 GB de VRAM es suficiente para inferencia en bf16.
- Cabe en GPU consumer: sí, en RTX 4060, RTX 3060, RTX 4070 y superiores; también en GPUs integradas o CPU para pruebas puntuales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el repositorio incluye su propia implementación PyTorch (`modeling_odyssey.py`) y un script `example.py`.
- Latencia y throughput: 18,7k tokens/s durante el entrenamiento en RTX 4060; no se publican cifras de inferencia.
- Dependencias: `torch`, `safetensors`, `tokenizers` y `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ODYSSEY-100M-REASONING-SFT-V1 | 100,2M | 1.024 | Apache-2.0 | SFT sobre base de 5B tokens; inglés; sin benchmarks frente a terceros |
| ODYSSEY-100M-5B-BASE | 100,2M | 1.024 | Apache-2.0 | Modelo base sin SFT; mismo autor y familia |
| ODYSSEY-100M-REASONING-SFT-V2 | 100,2M | 1.024 | Apache-2.0 | V1 + 2M tokens de SFT calibrado en pasos; mejor modelo registrado de la familia |
| SmolLM-135M | 135M | 2.048 | Apache-2.0 | Modelo pequeño de Hugging Face; no comparable en benchmarks con los datos disponibles |

No se dispone de comparaciones directas con modelos de terceros en la información proporcionada; los únicos datos emparejados son contra el modelo base de la misma familia.

## Limitaciones y advertencias

- Regresión en aritmética de un dígito: empeora de 0,48 a 0,12 frente al base.
- Sin generalización en longitud aritmética: multiplicaciones y divisiones multi-dígito, sumas/restas de 5 dígitos y problemas de 3 pasos no muestran ganancia.
- Añade pasos de cálculo espurios y produce respuestas finales incorrectas con alta confianza.
- Genera código funcionalmente incorrecto o autorrecursivo en problemas nuevos; el 97% en familias entrenadas refleja memorización.
- Alucinación factual heredada del preentrenamiento.
- Repetición en texto libre bajo decodificación greedy (rep-4 de 0,645).
- Sin ajuste de seguridad ni RLHF: puede reproducir texto dañino o sesgado procedente de datos web.
- Contexto muy limitado (1.024 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés.
- Formato de prompt obligatorio; el incumplimiento degrada la calidad de la respuesta.
- Artefacto de investigación de 100M de parámetros: no apto para producción.
- La model card original queda truncada en la sección de uso responsable; no se especifican restricciones adicionales más allá de la licencia Apache-2.0.
- Los informes citados (`PHASE7_FINAL_REPORT.md`, `docs/research/REASONING_SFT_DATA_MANIFEST.md`) no forman parte de la subida a Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V1
- Modelo base: https://huggingface.co/mvbalaji/ODYSSEY-100M-5B-BASE
- Base intermedio: https://huggingface.co/mvbalaji/ODYSSEY-100M-2B-BASE
- Variante V2: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V2
- Variante experimental P7-C1: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C1-DIVERSE-SFT
- Variante experimental P7-C2: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C2-MATCHED-SFT
- Variante experimental P7-C3-RL: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C3-RL
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de matemáticas: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset de código: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
