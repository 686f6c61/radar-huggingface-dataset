# Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-nnm

## Resumen

`Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-nnm` es el checkpoint final de una destilación de conocimiento (knowledge distillation) realizada por el usuario Savoxism sobre el modelo denso `Qwen/Qwen2.5-0.5B-Instruct`, tomando como profesor a `Qwen/Qwen3-4B-Instruct-2507` en fp16. El objetivo del experimento era transferir el comportamiento del profesor de 4.000 millones de parámetros a un alumno de aproximadamente 0,5 B mediante ajuste fino completo sobre respuestas generadas por el profesor a partir del dataset `VoCuc/UltraInteract-Infer` (79.751 registros de entrenamiento).

Forma parte de la ejecución de investigación `amid-kd-8xh200`, que explora una variante concreta de destilación: divergencia KL forward con sesgo (skew) y un regularizador NNM, con umbral adaptativo en la generación del alumno. El entrenamiento se hizo en 8 GPU H200 con DeepSpeed en bf16, a lo largo de 2 épocas (2.492 pasos) y con una longitud máxima de secuencia de 1.025 tokens (512 de prompt).

Es importante señalar desde el principio que este no es un modelo listo para producción: la propia model card documenta que el modelo se degradó durante el entrenamiento, que la pérdida de validación subió respecto al punto de partida y que las generaciones caen con frecuencia en bucles de repetición. Los resultados de benchmarks son muy bajos y el autor recomienda explícitamente no usarlo como asistente. Su interés es, por tanto, principalmente metodológico y de reproducibilidad del experimento de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones aproximadamente (modelo alumno Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-0.5B-Instruct; el entrenamiento uso longitud maxima de 1.025 tokens y prompt maximo de 512 (no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene `pytorch_model.bin`; no se han publicado versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el modelo base Qwen2.5 es multilingue) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen2.5-0.5B-Instruct) |
| Formato de pesos | `pytorch_model.bin` (binario de PyTorch, sin safetensors); el repositorio pesa 1,0 GB. El checkpoint incluye 4 tensores adicionales del proyector NNM (`projectors.{0..3}.weight`) que transformers ignora con un aviso de "unused weights" |

## Arquitectura y entrenamiento

La arquitectura es la del alumno, un transformer decoder-only denso de la familia Qwen2 con aproximadamente 0,5 B de parámetros. No se introduce ninguna modificación estructural en el modelo: la innovación del experimento está en el procedimiento de destilación, no en la arquitectura. El profesor es `Qwen/Qwen3-4B-Instruct-2507` (commit `cdbee75`, fp16) y el alumno parte de `Qwen/Qwen2.5-0.5B-Instruct` (commit `7ae5576`).

El método se etiqueta como `--type adaptive-sfkl`: divergencia KL forward con sesgo (skew α=0,05) y un regularizador NNM (ratio 0,2, K=128, 4 capas, d'=256, `--delta-threshold 0,03`). Se trata de un ajuste fino completo (todos los parámetros entrenables), no de LoRA ni de adaptadores. Los datos son 79.751 registros de entrenamiento derivados de `VoCuc/UltraInteract-Infer` (commit `3c2fb0d`), con respuestas generadas por el profesor; el dataset es de interacción multi-turno orientada a razonamiento y uso de herramientas. La generación del alumno usa un umbral adaptativo que arranca en 0,0, con `--loss-eps 0,1` y un replay buffer de 1.000 por rango.

El optimizador es AdamW con lr 1e-4, decaimiento coseno, sin warmup, weight decay 1e-2, grad clip 1,0 y `--kd-ratio 1,0`. Se ejecutaron 2 épocas × 1.246 pasos = 2.492 pasos, con batch global de 64 (8 GPU × 8 por dispositivo × 1 de acumulación) en 8× H200 con DeepSpeed bf16 y semilla 10. Un detalle relevante para la reproducibilidad: el alumno Qwen2.5 se entrenó sobre datos tokenizados con el tokenizador y la plantilla de chat del profesor (Qwen3-4B-Instruct-2507), no con los del alumno.

## Capacidades

- Generación de texto conversacional: es un modelo instruct/chat, por lo que la generación de texto en formato diálogo es su función principal. En la práctica, las generaciones presentan bucles de repetición frecuentes.
- Razonamiento matemático: los resultados en GSM8K, GSM-Plus y MATH son prácticamente nulos (strict-match 0,0 en las tres; flexible-extract 0,0106, 0,0088 y math_verify 0,0168 respectivamente). No puede considerarse una capacidad funcional.
- Generación de código: MBPP 3-shot pass@1 = 0,096. Capacidad marginal.
- Conocimiento científico/STEM: MMLU-STEM acc = 0,2125 (por debajo del nivel de azar de 0,25 en 4 opciones); SciQ 0-shot acc = 0,704. Rendimiento desigual y poco fiable.
- Tool calling / function calling: no disponible (el dataset de entrenamiento, UltraInteract, contiene interacciones con herramientas, pero la model card no documenta ni evalúa esta capacidad).
- Agentes y razonamiento multi-paso: no disponible (sin evaluación específica).
- Capacidades multilingües: no disponible (la model card no documenta idiomas ni evaluación multilingüe).
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Investigación sobre destilación de conocimiento: el uso principal y realista es estudiar el protocolo `adaptive-sfkl` con regularizador NNM y sus hiperparámetros (skew α, ratio NNM, umbral adaptativo). El checkpoint sirve como referencia de "qué ocurre cuando se ajusta a fondo un modelo de 0,5 B con lr 1e-4".
- Reproducción de experimentos de KD: permite comparar la curva de pérdida de validación documentada (1,867 antes de entrenar → 2,563 al final de la época 1 → 2,516 al final de la época 2) con implementaciones propias.
- Estudio de degradación por ajuste fino completo: caso de análisis de sobreajuste y colapso de modelos pequeños con learning rates altos y sin warmup.
- Pruebas de infraestructura de inferencia: al ser un modelo de 0,5 B (~1 GB de pesos), resulta útil para validar pipelines con transformers, vLLM (fue evaluado con vLLM 0.17.1) o TGI sin consumir recursos relevantes.
- Docencia y demostraciones: ilustrar en clase o en un blog qué es un checkpoint intermedio o degradado y cómo se interpreta una model card honesta.
- No se recomienda ningún caso de uso en producción (atención al cliente, generación de código, asistentes, extracción de información) porque el propio autor advierte de que no debe usarse como asistente capaz.

## Benchmarks y rendimiento

Evaluación de validación interna (conjunto de desarrollo de 200 registros, extraídos de los propios datos de entrenamiento):

| Metrica | Antes de entrenar | Fin de epoca 1 | Fin de epoca 2 |
|---|---|---|---|
| avg_loss | 1,867 | 2,563 | 2,516 |
| rougeL | 5,57 | 8,10 | 8,45 |
| exact_match | 0,0 | 0,0 | 0,0 |
| umbral adaptativo final | - | - | 0,03 |

Evaluación con lm-eval 0.4.12 sobre vLLM 0.17.1 (valor ± error estandar). GSM8K, GSM-Plus, MATH, MMLU-STEM y SciQ usan la plantilla de chat; MBPP no la usa (temperatura 0):

| Tarea | Metrica | Valor |
|---|---|---|
| GSM8K (5-shot, n=1319) | strict-match | 0,0 |
| GSM8K (5-shot, n=1319) | flexible-extract | 0,0106 ± 0,0028 |
| MATH `minerva_math` (4-shot, n=5000) | exact_match | 0,0 |
| MATH `minerva_math` (4-shot, n=5000) | math_verify | 0,0168 ± 0,0018 |
| GSM-Plus (5-shot, n=10552) | strict-match | 0,0 |
| GSM-Plus (5-shot, n=10552) | flexible-extract | 0,0088 ± 0,0009 |
| MMLU-STEM (5-shot, n=3153) | acc | 0,2125 ± 0,0073 |
| SciQ (0-shot, n=1000) | acc | 0,704 ± 0,0144 |
| SciQ (0-shot, n=1000) | acc_norm | 0,633 ± 0,0152 |
| MBPP (3-shot, n=500) | pass@1 | 0,096 ± 0,0132 |

Advertencia metodológica del propio autor: no se evaluó ninguna línea base (ni el alumno sin entrenar ni el profesor), por lo que estas cifras no demuestran ni una ganancia ni una pérdida atribuible a la destilación. Además, el conjunto de desarrollo procede de los datos de entrenamiento, de modo que mide ajuste, no generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 1 GB de pesos más el coste de caché KV (muy reducido con contexto corto); en 8 bits, ~0,5 GB; en 4 bits, ~0,3 GB. Cifras estimadas a partir del tamaño del repositorio (1,0 GB), no publicadas por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. El entrenamiento se realizó en 8× NVIDIA H200, pero eso responde al pipeline de destilación, no a la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU e integradas de gama baja.
- Opciones de despliegue: `transformers` (uso documentado en la model card, con `torch_dtype="bfloat16"`), vLLM (usado en la evaluación, versión 0.17.1) y, en principio, TGI, dado el tag `text-generation-inference`; llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada. El checkpoint incluye 4 tensores del proyector NNM que conviene eliminar antes de servir el modelo.
- Latencia y throughput estimados: no disponible (la model card no publica mediciones de latencia ni de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| amid-kd-8xh200-qwen2.5-0.5b-it-nnm | ~0,5 B | 32.768 (heredado del base) | Apache 2.0 | HuggingFace, solo `pytorch_model.bin` | Checkpoint de destilacion degradado; benchmarks propios muy bajos |
| Qwen2.5-0.5B-Instruct (base) | ~0,5 B | 32.768 | Apache 2.0 | HuggingFace, safetensors y GGUF | Modelo instruct de referencia de la misma familia; su rendimiento en benchmarks no se incluye en la informacion disponible |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Apache 2.0 | HuggingFace, safetensors y GGUF | Alternativa de mayor tamano y calidad dentro de la misma familia; cifras comparativas no disponibles en la informacion proporcionada |
| SmolLM2-360M-Instruct | ~0,36 B | 8.192 | Apache 2.0 | HuggingFace, safetensors y GGUF | Alternativa de tamano similar orientada a dispositivos; cifras comparativas no disponibles |

No se dispone de resultados de benchmarks de los modelos comparables dentro de la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El modelo se degradó durante el entrenamiento: la pérdida de validación pasó de 1,867 (antes de entrenar) a 2,516 al final de la época 2, y las generaciones caen a menudo en bucles de repetición. El autor atribuye la causa probable a un ajuste fino completo con lr 1e-4 sobre un modelo de 0,5 B, aunque no está confirmado.
- El propio autor indica explícitamente: "Do not use it as a capable assistant" (no lo uses como asistente capaz).
- MMLU-STEM acc = 0,2125 queda por debajo del nivel de azar (0,25) en preguntas de 4 opciones.
- No se evaluó ninguna línea base (ni el alumno sin entrenar ni el profesor), por lo que no hay evidencia de ganancia por destilación.
- El conjunto de desarrollo (200 registros) se extrae de los datos de entrenamiento, así que las métricas de desarrollo miden ajuste, no generalización.
- Solo se usó una semilla de entrenamiento (10) y el checkpoint final no se seleccionó por puntuación de desarrollo.
- Discrepancia de tokenizador: el alumno se entrenó con datos tokenizados con el tokenizador y la plantilla de chat del profesor (`Qwen3-4B-Instruct-2507`), no con los del alumno, lo que puede afectar a la coherencia en inferencia.
- El checkpoint contiene 4 tensores del proyector NNM que `transformers` ignora con un aviso de pesos no usados; las cifras de lm-eval se midieron sobre una copia con esos tensores eliminados.
- Riesgo de alucinación: elevado en un modelo de 0,5 B degradado; no hay evaluación específica de fidelidad factual más allá de MMLU-STEM y SciQ.
- Sesgos conocidos: no disponible (no se documenta ninguna evaluación de sesgos).
- Limitaciones de idioma: no disponible (la model card no especifica idiomas soportados ni evaluación multilingüe).
- Licencia: Apache 2.0, heredada de Qwen2.5-0.5B-Instruct, por lo que el uso comercial está permitido por licencia. Esto no implica que el modelo sea apto para producción dado su estado de degradación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-nnm
- Modelo base (alumno): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/VoCuc/UltraInteract-Infer
- Paper o blog del metodo `amid-kd-8xh200` / `adaptive-sfkl`: no disponible
- Repositorio de codigo del entrenamiento: no disponible
- Demo interactiva: no disponible
