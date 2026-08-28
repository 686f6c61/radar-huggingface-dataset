# DoBinh/pit2022-gpt2-124m-diffdml

## Resumen

`pit2022-gpt2-124m-diffdml` es un modelo de lenguaje de la clase GPT-2 de 124 millones de parámetros, preentrenado desde cero exclusivamente con datos publicados hasta el 31 de diciembre de 2022. Lo desarrolla DoBinh como parte de una serie de artefactos de investigación sobre entrenamiento temporalmente acotado (point-in-time) y objetivos de entrenamiento alternativos. Este checkpoint concreto es el resultado de una ablación controlada que sustituye la función de pérdida estándar de entropía cruzada por Differentiated Deep Mutual Learning (Diff-DML), una técnica propuesta en CVPR 2025 que entrena dos modelos en paralelo con un intercambio de logits desacoplados.

El modelo no pretende superar a sus homólogos entrenados con entropía cruzada (CE) o con EMO; de hecho, según la model card, empata con EMO en perplejidad, queda por detrás de CE y pierde los duelos de calidad frente a ambos. Su única ventaja demostrada es la calibración: alcanza un error de calibración esperado (ECE) de 0,287 % (0,192 % con los pesos EMA), el mejor de los tres. Está pensado como artefacto reproducible para la comunidad de investigación, no como modelo de producción.

Arquitectónicamente es un transformer de 12 capas, 12 cabezas de atención, dimensión oculta 768 y ventana de contexto de 1024 tokens, con RoPE, RMSNorm con QK-norm, MLP ReLU² y head sin sesgos. El formato de pesos es safetensors y el tipo de modelo registrado es `wigin-pitgpt`. La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (12L, 12H, d768, seq 1024) con RoPE, RMSNorm + QK-norm, MLP ReLU², head untied zero-init, sin biases |
| Parametros totales | 162.201.600 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16/fp32 nativos) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), checkpoint nativo PyTorch (ckpt.pt), EMA (ema/ckpt_ema.pt), auxiliar (aux/ckpt_aux.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de 12 capas con 12 cabezas de atención y dimensión oculta 768, similar a GPT-2 pequeño pero con modificaciones modernas: posiciones rotatorias (RoPE), normalización RMSNorm sin parámetro de gain, QK-norm en las cabezas de atención, MLP con activación ReLU² y una head de salida sin sesgos y con pesos no compartidos con la capa de embedding. El vocabulario del tokenizer GPT-2 se rellena hasta 50304 tokens.

El entrenamiento se realizó sobre un subconjunto del dataset `ichangzii/pit2022-10b`, compuesto por 47 shards y 4.700 millones de tokens, todos con fecha de publicación anterior o igual al 31 de diciembre de 2022. La composición es: web 40,4 %, DCLM 25,5 %, libros 12,8 %, Wikipedia 10,6 %, código 6,4 % y matemáticas 4,3 %. Se procesaron 4.690 millones de tokens en una sola época, con 8.950 pasos de 0,52 millones de tokens cada uno, usando el mismo sampler y semilla que los checkpoints de referencia (CE y EMO), de modo que el orden de tokens es idéntico.

La innovación principal es el objetivo Diff-DML. Dos modelos entrenan en paralelo: el primario `f` (este checkpoint) minimiza `CE(f, y) + α·KL(g‖f)` con α = 0,4, mientras que el auxiliar `g` nunca ve etiquetas y minimiza `KL(f‖g)` (DPLO), con una tasa de aprendizaje constante de 0,1× la de `f` (DTS) y una inicialización distinta. Cada modelo ve al otro solo a través de logits desacoplados (detached). El optimizador es Muon (tasa 0,02) para las matrices ocultas y AdamW (tasa 0,006) para embeddings y head, con programación WSD para `f` (warmup de 250 pasos, fase constante y cooldown lineal del 30 %) y constante para `g`. El entrenamiento se ejecutó en una única RTX 5090 durante 14,4 horas a aproximadamente 83.000 tokens por segundo para el par de modelos, 2,2 veces el tiempo del checkpoint CE. El run se interrumpió una vez en el paso 975 y se reanudó desde el checkpoint del paso 750, reproduciendo exactamente las pérdidas originales.

## Capacidades

- Generación de texto autónoma en inglés, con capacidad de completar secuencias de hasta 1024 tokens.
- Modelo de lenguaje causal estándar: puede usarse para modelado de lenguaje, perplejidad y generación condicionada.
- Capacidad de calibración superior a la de sus homólogos CE y EMO: ECE de 0,287 % (0,192 % con EMA), la mejor de los tres, gracias al efecto de suavizado de etiquetas aprendido que induce el objetivo Diff-DML.
- Entrenamiento temporalmente acotado: todos los datos de entrenamiento son anteriores a 2023, lo que lo hace adecuado para estudios de contaminación temporal y evaluación de conocimiento con corte en 2022.
- No dispone de soporte para tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícitos.
- Multilingüe: no, solo inglés.

## Casos de uso

- Investigación en calibración de modelos de lenguaje: su bajo ECE (0,287 %) y su alta entropía predictiva media (2,917) lo convierten en un banco de pruebas ideal para estudiar técnicas de calibración y su transferencia a modelos más grandes.
- Ablación controlada de objetivos de entrenamiento: al compartir arquitectura, datos, sampler y semilla con los checkpoints CE y EMO, permite aislar el efecto del objetivo Diff-DML sobre perplejidad, precisión y calibración.
- Evaluación de conocimiento temporal (point-in-time): al estar entrenado solo con datos hasta 2022, puede usarse como modelo de referencia para medir la fuga de información posterior a 2022 en otros modelos, mediante el evaluador `AI-Temporal-LLM-Evaluator`.
- Estudio de deep mutual learning en pretraining de lenguaje: el checkpoint auxiliar `g` (incluido en el repo) permite analizar la dinámica de colaboración entre modelos y el efecto del intercambio de logits desacoplados.
- Comparación de métricas de calidad frente a CE y EMO: los duelos ciegos con juez gpt-4o-mini (49–61 vs EMO, 46–57 vs CE) ofrecen datos para investigar la relación entre calibración y calidad percibida.
- Reproducibilidad de experimentos: al publicar logs de entrenamiento (`log.jsonl`), argumentos de lanzamiento (`args.json`) y checkpoints nativos, sirve como referencia para verificar la reproducibilidad de runs interrumpidos y reanudados.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La model card reporta métricas propias bajo un protocolo común para los tres checkpoints (CE, EMO y este modelo): perplejidad en WikiText-2 con ventana deslizante (1024, stride 512), pérdida final de validación, precisión top-1, ECE, entropía predictiva media y sondas de corte temporal.

| Metrica | CE (muon) | EMO | Este modelo (f) | Pesos EMA | Auxiliar g |
|---|---|---|---|---|---|
| WikiText-2 ppl ↓ | **24.91** | 25.46 | 25.53 | 25.59 | 29.23 |
| Pérdida final de validación ↓ | **2.786** | 2.797 | 2.798 | 2.799 | 2.899 |
| Precisión top-1 siguiente token ↑ | 46.15 % | 46.21 % | 45.84 % | 45.86 % | 44.68 % |
| ECE siguiente token ↓ | 0.587 % | 3.818 % | **0.287 %** | **0.192 %** | 0.377 % |
| Entropía predictiva media | 2.813 | 2.626 | 2.917 | 2.910 | 3.035 |
| Sonda de corte ≤2022 ↑ | 0.2357 | **0.2556** | 0.2313 | 0.2282 | 0.1915 |
| Sonda de corte post-2022 ↓ | 0.0000 | 0.0005 | 0.0001 | 0.0001 | 0.0000 |
| Veredicto de corte | CERTIFIED | CERTIFIED | CERTIFIED | CERTIFIED | CERTIFIED |

Además, el evaluador temporal `AI-Temporal-LLM-Evaluator` (corpus `pit2022-124m`, año 2022) otorga a este modelo una puntuación de fuga en etapa 1 de −2.53 (EMA −2.50) frente a un umbral de −3.0, por debajo de la barra que sí superan CE (−3.83) y EMO (−3.93). Los recuentos de aciertos son cercanos (21/50 frente a 23/50), pero la nitidez es menor. En los duelos ciegos de calidad de la etapa 2 (juez gpt-4o-mini, 3 × 40 prompts), el modelo pierde 49–61 contra EMO y 46–57 contra CE.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de 162 millones de parámetros, en bf16 ocupa aproximadamente 325 MB de VRAM, y en fp32 unos 650 MB. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- Entrenamiento: el run original se ejecutó en una única RTX 5090 (32 GB) durante 14,4 horas a ~83.000 tokens por segundo para el par de modelos. Una GPU con 24 GB (RTX 4090) o superior es suficiente para reproducir el entrenamiento.
- Despliegue: al ser un modelo denso pequeño, puede servirse con `transformers` en CPU o GPU, o convertirse a GGUF para `llama.cpp` y `Ollama`. También es compatible con `vLLM` y `TGI` si se registra la arquitectura `wigin-pitgpt` mediante el paquete `wigin_tllm`.
- Latencia y throughput: no se han publicado mediciones específicas de latencia o throughput en inferencia. Dado el tamaño, se espera una latencia de milisegundos por token en GPU moderna y decenas de tokens por segundo en CPU.

## Comparativa con modelos similares

La comparación más directa es con los otros dos checkpoints de la misma serie, que comparten arquitectura, datos y protocolo de entrenamiento, diferenciándose solo en el objetivo:

| Modelo | Objetivo | WikiText-2 ppl ↓ | ECE ↓ | Veredicto temporal | Licencia |
|---|---|---|---|---|---|
| `pit2022-gpt2-124m-muon` | CE | **24.91** | 0.587 % | CERTIFIED | MIT |
| `pit2022-gpt2-124m-emo` | CE + EMO | 25.46 | 3.818 % | CERTIFIED | MIT |
| `pit2022-gpt2-124m-diffdml` | Diff-DML | 25.53 | **0.287 %** | CERTIFIED (pero leak score bajo umbral) | MIT |

Frente al GPT-2 original de OpenAI (124M, contexto 1024, licencia MIT), este modelo incorpora mejoras arquitectónicas (RoPE, RMSNorm, QK-norm, ReLU²) y un entrenamiento temporalmente acotado, pero no se dispone de comparativas directas de rendimiento en benchmarks estándar. El repositorio del autor menciona un baseline nanoGPT con la misma familia de datos que alcanza una perplejidad WikiText-2 de 43,1 a 4.200 millones de tokens, muy por encima de los valores aquí reportados, lo que sugiere que las modificaciones arquitectónicas y de optimización aportan una mejora sustancial.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. La propia model card advierte explícitamente que no sustituye a los checkpoints CE o EMO y que su única ventaja es la calibración.
- Pierde en calidad frente a sus homólogos: perplejidad ligeramente peor que CE, precisión top-1 inferior (45,84 % frente a 46,15 % de CE y 46,21 % de EMO) y derrotas en duelos ciegos de calidad.
- Falla el umbral de consistencia temporal del evaluador: la puntuación de fuga de −2.53 queda por debajo de la barra de −3.0, lo que indica una menor nitidez en la distinción de conocimiento pre-2022 frente a post-2022, aunque el veredicto global sea CERTIFIED.
- Ventana de contexto limitada a 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, agravado por la falta de fine-tuning instructivo.
- El repositorio pesa 43,8 GB debido a los checkpoints nativos, EMA y auxiliares, lo que puede dificultar su descarga en entornos con ancho de banda limitado.
- La arquitectura `wigin-pitgpt` no está registrada en `transformers` de serie; requiere instalar el paquete `wigin_tllm` del evaluador para cargarlo en formato HuggingFace.
- Licencia MIT: permite uso comercial sin restricciones, pero al ser un modelo de investigación sin garantías, cualquier uso en producción debe validarse previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DoBinh/pit2022-gpt2-124m-diffdml
- Checkpoint CE de referencia: https://huggingface.co/DoBinh/pit2022-gpt2-124m-muon-hf
- Repositorio del entrenador (branch `research/diffdml`): https://github.com/WiginLLC/AI-Temporal-LLM-Trainer
- Informe completo del run Diff-DML: https://github.com/WiginLLC/AI-Temporal-LLM-Trainer/blob/research/diffdml/docs/DIFFDML_FULL_RUN_REPORT.md
- Evaluador temporal: https://github.com/WiginLLC/AI-Temporal-LLM-Evaluator
- Dataset de entrenamiento: https://huggingface.co/datasets/ichangzii/pit2022-10b
- Repositorio del autor (baseline nanoGPT): https://github.com/DoBinh04/LLM_trainer
- Paper de Diff-DML (Liu et al., CVPR 2025): *Improving Accuracy and Calibration via Differentiated Deep Mutual Learning* (no se ha localizado el enlace directo en la información proporcionada)
