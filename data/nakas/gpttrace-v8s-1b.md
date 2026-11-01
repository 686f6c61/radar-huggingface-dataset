# nakas/gpttrace-v8s-1b

## Resumen

GPTTrace v8s 1B es un clasificador binario de texto que distingue escritura humana de texto generado por máquina. Lo desarrolla el usuario nakas y se publica en HuggingFace bajo el identificador `nakas/gpttrace-v8s-1b`. Resuelve un problema concreto: la detección de texto generado por IA en un ecosistema donde los "humanizadores" comerciales y los modelos de 2026 (GPT-6.x, Claude Opus 5.5, Gemini 3, Qwen3) degradan con rapidez los detectores entrenados con corpus anteriores. El modelo se presenta como sustituto de `nakas/gpttrace-v5-1b`, que según la model card ocupaba la segunda posición en RAID.

La arquitectura es un encoder transformer de 1B parámetros construido sobre `jhu-clsp/ettin-encoder-1b` (licencia MIT). El modelo no genera texto: emite dos logits, `[human, machine]`, y la puntuación de máquina se obtiene con `softmax[...,1]`. La ventana de contexto efectiva para inferencia es de 512 tokens, según el ejemplo de uso de la model card.

La relevancia actual del modelo está en su enfoque en falsos positivos sobre prosa humana real: la model card reporta que v5 marcaba aproximadamente el 60% del texto web humano anterior a 2022 como IA en su umbral bruto, mientras que v8s baja esa cifra al 2,3% sobre 2.000 páginas de FineWeb reservadas. Además, publica un umbral calibrado (logit 9,3) que marca el 1% de textos humanos en el conjunto de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base `jhu-clsp/ettin-encoder-1b`), clasificación de secuencias con dos logits `[human, machine]` |
| Parametros totales | 1B (heredados de Ettin-1B; no se detalla el desglose exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`max_length=512` en el ejemplo de uso de la model card) |
| Tipos de cuantizacion | Full precision (PyTorch), ONNX fp32, ONNX 4-bit para CPU (MatMulNBits block 32) |
| Idiomas soportados | Inglés (`language: en`) |
| Licencia | CC BY-SA 4.0 (el modelo base es MIT) |
| Formato de pesos | safetensors (`model/`), ONNX fp32 (`onnx-fp32/`), ONNX 4-bit (`onnx/`) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-1b`, un encoder transformer de 1B parámetros. Sobre esa base se aplica un ajuste fino supervisado para clasificación binaria. El punto de partida del entrenamiento de v8s es una media ponderada de pesos de dos checkpoints anteriores: 0,7·v5 + 0,3·v6, ambos también sobre Ettin-1B y con v6 afinado a partir de v5.

Desde ese punto se realizan dos ajustes finos independientes, de una época cada uno, con learning rate 1e-5, scheduler coseno, batch de 64 y bf16 sobre una única A100. El primero usa 0,44 millones de textos; el segundo usa 1,1 millones de textos e incorpora 26.000 páginas web anteriores a 2022 como texto humano. v8s es la media 50/50 de los pesos de ambos ajustes, lo que según la model card conserva la corrección de falsos positivos en web del run grande y la mayor parte del recall sobre humanizadores del run pequeño.

Los datos de entrenamiento incluyen el split de entrenamiento de RAID (MIT, con títulos reservados nunca usados) con ejemplos difíciles minados por v5, el split de entrenamiento de MAGE (Apache-2.0), textos de Wikipedia, PMC de acceso abierto, resúmenes de arXiv y Gutenberg, páginas de FineWeb anteriores a 2022 (ODC-BY), la parte pública de `nakas/gpttrace-text-train` (pares humano/IA y reescrituras por humanizadores de modelos abiertos, Claude y GPT-6.x), textos sintéticos "espejo" que imitan el género de los textos humanos y emulaciones de operaciones de humanizadores comerciales. Se eliminaron los textos con coincidencia de 8-gramas con los conjuntos de evaluación.

## Capacidades

- Clasificación binaria de texto: distingue escritura humana de texto generado por máquina, con salida de dos logits.
- Detección de texto pasado por humanizadores comerciales y por reescritura con modelos abiertos.
- Detección de texto generado por modelos de 2026 según la model card: GPT-6.x, Claude Opus 5.5, Gemini 3 y Qwen3.
- Detección sobre texto reescrito o parafraseado (paraphrase attacks) y sobre ataques de reescritura entrenados con RL (StealthRL).
- Detección a nivel de documento en escenarios de coedición progresiva humano→IA (OpAI-Bench).
- Robustez frente a ataques de RAID (todos los ataques evaluados en la model card).
- Capacidad de calibración de umbral: se publica un umbral (logit 9,3) orientado a un 1% de falsos positivos sobre textos humanos de referencia.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Moderación de contenido en plataformas: filtrar envíos sospechosos de ser generados por IA antes de revisión humana, usando el umbral calibrado (logit 9,3 ≈ 1% FPR) para limitar falsos positivos sobre prosa humana legítima.
- Verificación editorial en medios: marcar artículos o colaboraciones externas que puedan haber sido generados o reescritos con IA, con la advertencia de que la puntuación es evidencia y no prueba.
- Detección en pipelines académicos: revisar resúmenes de arXiv o envíos a conferencias, dado que el modelo se entrenó con resúmenes de arXiv y textos de PMC como parte del corpus humano.
- Análisis forense de documentos: evaluar textos completos o fragmentos largos (por encima de ~150 palabras) en investigaciones internas, combinando la puntuación con revisión humana.
- Monitorización de contenido web a escala: procesar páginas web con la variante ONNX 4-bit en CPU, que según la model card mantiene AUROC 0,9955 frente a 0,9958 en PyTorch sobre 300 textos de MAGE y un 99% de acuerdo de signo.
- Evaluación de proveedores de "humanización": comprobar si el texto devuelto por servicios comerciales de humanización sigue siendo detectable, con la cautela de que el recall sobre humanizadores comerciales baja respecto a v5 (0,791 frente a 0,956 a TPR@5% FPR).
- Integración en herramientas de escritura: señalar al usuario fragmentos con alta probabilidad de ser generados por IA en un editor, usando la salida de logits para graduar la confianza en lugar de una decisión binaria.

## Benchmarks y rendimiento

Resultados publicados en la model card, ejecutados por los autores con scripts en `eval/bench/humbench/`. Los umbrales de las columnas TPR se fijan sobre los textos humanos de cada benchmark; los benchmarks sin textos humanos usan un conjunto de referencia fijo de literatura, Wikipedia y PMC. Solo se listan benchmarks cuya licencia de datos permite uso comercial.

| Benchmark | Metrica | v5-1b | v8s | Mejor publicado conocido |
|---|---|---|---|---|
| RAID, títulos reservados de entrenamiento (todos los ataques) | TPR @ 5% FPR | 99,93 | 99,94 | No disponible |
| MAGE, fuera de distribución, parafraseado | AUROC | 0,810 | 0,919 | 0,87 (DivEye, arXiv 2509.18880) |
| TextSight AI-text benchmark 2026 | AUROC | 0,863 | 0,999 | 0,867 (dataset card) |
| MELD-eval (GPT-5.4-mini, Gemini 3 Flash, Claude Haiku, Qwen 3.6; ataques) | TPR @ 1% FPR | 99,90 | 100,0 | 99,9 (paper MELD) |
| UChicago/Booth detector benchmark (4 LLM + StealthGPT) | AUROC | 0,860 | 0,914 | No disponible |
| ARB (reescrituras LLM de texto humano y de IA) | AUROC | 0,745 | 0,931 | No disponible |
| StealthRL (ataque de paráfrasis entrenado con RL sobre MAGE) | TPR @ 5% FPR | 0,902 | 0,936 | No disponible |
| OpAI-Bench (coedición progresiva humano→IA, nivel de documento) | AUROC | 0,608 | 0,765 | No disponible |
| AI Humanizer Benchmark + HumanizerBench (humanizadores comerciales) | TPR @ 5% FPR | 0,956 | 0,791 | No disponible |
| Holdout propio de humanizadores (cadenas de reescritura Claude Opus 5.5 / GPT-6.x) | TPR @ 5% FPR | 0,870 | 0,986 | No disponible |
| Holdout propio de humanizadores con modelos abiertos | TPR @ 5% FPR | 0,868 | 0,980 | No disponible |
| Texto web humano anterior a 2022 (2.000 páginas FineWeb reservadas) | Marcado como IA en logit 0 | ~60% | 2,3% | No disponible |

La model card indica que las predicciones para el conjunto de test oficial de RAID se han enviado al leaderboard y que la puntuación se añadirá cuando el CI del leaderboard la reporte.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32/bf16): el repositorio ocupa 9,2 GB, lo que incluye pesos PyTorch y variantes ONNX; un encoder de 1B en bf16 requiere del orden de 2 GB de pesos más memoria de activaciones para secuencias de 512 tokens.
- GPU recomendadas: A100 (usada por los autores para el ajuste fino con batch 64 en bf16), H100 y GPUs con al menos 8-16 GB de VRAM para inferencia en precisión reducida.
- GPU de consumo: al tratarse de un encoder de 1B, cabe en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090, 4080 o 3090) en fp16/bf16; la variante ONNX 4-bit está pensada para servir en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (ejemplo oficial), ONNX Runtime con los artefactos `onnx-fp32/` y `onnx/` (4-bit MatMulNBits block 32), y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo reporta la degradación de la variante 4-bit ONNX (AUROC 0,9955 frente a 0,9958 en PyTorch sobre 300 textos de MAGE, 99% de acuerdo de signo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPTTrace v8s 1B (`nakas/gpttrace-v8s-1b`) | 1B | 512 tokens | Detección humano/IA con foco en humanizadores y modelos de 2026 | CC BY-SA 4.0 | HuggingFace, ONNX, demo web |
| GPTTrace v5 1B (`nakas/gpttrace-v5-1b`) | 1B | No disponible | Detección humano/IA, predecesor directo; #2 en RAID según la model card | No disponible en la información | HuggingFace |
| DivEye (referencia en MAGE parafraseado, arXiv 2509.18880) | No disponible | No disponible | Detección de texto parafraseado | No disponible | No disponible |
| Detectores del benchmark UChicago/Booth | No disponible | No disponible | Detección frente a 4 LLM y StealthGPT | No disponible | No disponible |

La información proporcionada no incluye especificaciones detalladas de los modelos alternativos (parámetros, contexto, licencia), por lo que la comparativa se limita a los datos publicados en la model card de v8s y a las referencias que esta cita.

## Limitaciones y advertencias

- La puntuación de un detector es evidencia, no prueba: la propia model card advierte de que nunca debe usarse una puntuación aislada para acusar a alguien.
- Textos cortos (menos de ~150 palabras) son poco fiables según la model card.
- Todo detector puede ser evadido con reescritura deliberada; el modelo no es una excepción.
- Punto débil declarado: el recall sobre salida de humanizadores comerciales baja respecto a v5 (0,791 frente a 0,956 a TPR@5% FPR).
- Punto débil declarado: la prosa formal o académica de hablantes no nativos se marca con más frecuencia en el umbral bruto de logit 0; debe usarse un umbral calibrado (9,3 para ~1% FPR, 10,7 para ~0,5%) en lugar de 0.
- Solo soporta inglés (`language: en`); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Ventana de contexto de 512 tokens: los documentos largos deben truncarse o dividirse, lo que puede perder señal en textos extensos.
- Licencia CC BY-SA 4.0: parte del texto humano de entrenamiento es share-alike (Wikipedia), por lo que los pesos heredan esos términos; el uso comercial debe respetar las condiciones de compartición bajo la misma licencia. El modelo base es MIT.
- Riesgo de sesgo: el corpus de entrenamiento combina fuentes web, académicas y literarias, y el comportamiento del clasificador puede variar según el género textual; la model card no publica un análisis de sesgos por dominio o demografía.
- No se han publicado resultados del conjunto de test oficial de RAID en el momento de la información; las cifras de RAID en la tabla corresponden a títulos reservados del entrenamiento, no al test oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nakas/gpttrace-v8s-1b
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-1b
- Predecesor: https://huggingface.co/nakas/gpttrace-v5-1b
- Dataset de entrenamiento público: https://huggingface.co/datasets/nakas/gpttrace-text-train
- Código: https://github.com/andrewnakas/gpttrace
- Demo: https://gpttrace.com/ai-text-detector/
- Dataset RAID: https://huggingface.co/datasets/liamdugan/raid
- Repositorio RAID: https://github.com/liamdugan/raid
- Dataset MAGE: https://huggingface.co/datasets/yaful/MAGE
- Referencia DivEye: arXiv 2509.18880
