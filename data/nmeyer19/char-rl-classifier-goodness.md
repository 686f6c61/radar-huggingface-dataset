# nmeyer19/char-rl-classifier-goodness

## Resumen

`nmeyer19/char-rl-classifier-goodness` es un clasificador binario de secuencias derivado de `answerdotai/ModernBERT-base` mediante ajuste fino. Lo publica el usuario nmeyer19 en Hugging Face y su función es puntuar la "bondad" (goodness) de respuestas generadas en el contexto de un pipeline de *character-level reinforcement learning* (char-rl). El modelo recibe una respuesta y devuelve una probabilidad entre 0 y 1 que indica si la respuesta se considera buena o mala, sirviendo como señal de recompensa o de filtrado.

Técnicamente es un encoder transformer de 149,6 millones de parámetros (arquitectura ModernBERT-base) con una cabeza de clasificación, distribuido en formato safetensors y con licencia Apache 2.0. El repositorio ocupa 0,6 GB y no registra descargas ni *likes* en el momento de la consulta, lo que indica una publicación muy reciente y de nicho.

Su relevancia es acotada: no es un modelo generativo, sino un componente de evaluación dentro de un sistema mayor. Resulta útil para quien quiera reproducir o integrar un clasificador de calidad de respuestas con calibración razonable (ECE de 0,0146) y un ROC-AUC de 0,9963 en el *split* de test declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder transformer) con cabeza de clasificación binaria |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de ModernBERT-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de la familia ModernBERT, y se ajusta como clasificador binario. La model card no detalla la arquitectura interna ni las modificaciones aplicadas sobre el modelo base; únicamente declara la etiqueta `char-rl` y el *baseline* de procedencia. El número de parámetros (149,6 M) es coherente con un ModernBERT-base con una cabeza de clasificación añadida.

Respecto a los datos, la model card indica 3000 *prompts* y un reparto de 2400 para entrenamiento, 300 para validación y 300 para test (600 respuestas en test, dos por *prompt*). Se registran 475 respuestas truncadas en el conjunto "oct" y 2088 en el conjunto "base", y 0 respuestas truncadas en el clasificador. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra técnica de alineación; tampoco se documentan innovaciones técnicas adicionales más allá del ajuste fino supervisado implícito.

## Capacidades

- Clasificación binaria de respuestas: devuelve una probabilidad de que una respuesta sea "buena" según el criterio del dataset de entrenamiento.
- Puntuación calibrada: el ECE de 0,0146 en 10 *bins* sugiere que las probabilidades son razonablemente interpretables como confianza.
- Evaluación de calidad en pipelines de RL a nivel de carácter (`char-rl`), actuando como señal de recompensa o filtro.
- Procesamiento de texto en formato encoder: no genera texto, solo puntúa entradas.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Filtrado de respuestas en pipelines de RL: usar la probabilidad de salida como recompensa para descartar respuestas de baja calidad antes de incorporarlas al entrenamiento, aprovechando el ROC-AUC de 0,9963 reportado en test.
- Evaluación automática de calidad en generación de texto: puntuar lotes de respuestas candidatas y ordenarlas por probabilidad de "bondad" para selección *best-of-n*.
- Control de calidad en producción de asistentes conversacionales: marcar respuestas con probabilidad baja para revisión humana, apoyándose en la calibración (ECE 0,0146) para fijar umbrales.
- Investigación en *reward modeling*: servir como componente base o comparativa frente a clasificadores de recompensa más grandes en experimentos de alineación.
- Reproducción de experimentos `char-rl`: integrar el clasificador en el mismo pipeline para el que fue entrenado y validar resultados frente a las métricas publicadas.
- Detección de respuestas degeneradas o truncadas: combinado con heurísticas de longitud, ya que el *baseline* solo por longitud alcanza un ROC-AUC de 0,7486 y el modelo lo supera ampliamente.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (test: n=600 respuestas, 300 *prompts*):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9600 |
| F1 | 0,9613 |
| ROC-AUC | 0,9963 |
| ECE (10 bins) | 0,0146 |
| ROC-AUC baseline solo longitud | 0,7486 |
| ROC-AUC validacion | 0,9962 |

Distribución de fiabilidad en test por *bins*:

| Bin | n | Media predicha | Fraccion positiva |
|---|---|---|---|
| [0,0, 0,1] | 274 | 0,004 | 0,000 |
| [0,1, 0,2] | 2 | 0,179 | 0,000 |
| [0,2, 0,3] | 1 | 0,204 | 1,000 |
| [0,3, 0,4] | 1 | 0,361 | 0,000 |
| [0,4, 0,5] | 2 | 0,482 | 0,500 |
| [0,5, 0,6] | 15 | 0,561 | 0,400 |
| [0,6, 0,7] | 24 | 0,641 | 0,625 |
| [0,7, 0,8] | 9 | 0,752 | 0,889 |
| [0,8, 0,9] | 3 | 0,871 | 0,333 |
| [0,9, 1,0] | 269 | 0,995 | 0,996 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos (149,6 M de parámetros), más memoria de activaciones y *batch*.
- VRAM estimada en fp16/bf16: alrededor de 0,3 GB de pesos, holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes, aunque para este tamaño las consumer son adecuadas.
- Cabe en GPU consumer: sí, en la práctica totalidad de modelos actuales, e incluso en CPU para *batch* pequeños.
- Opciones de despliegue: `transformers` con PyTorch, `vLLM` (soporte de encoders limitado), `TGI`, `ONNX Runtime`; `llama.cpp`/`Ollama` no aplican de forma estándar a un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nmeyer19/char-rl-classifier-goodness | 149,6 M | no disponible | Clasificación binaria de calidad | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | no disponible en la informacion | no disponible | Encoder base (fine-tuning) | Apache 2.0 | Hugging Face |
| Clasificadores de recompensa tipo ArmoRM / Skywork-Reward | cientos de M a varios B | variable | Reward modeling generativo | variable | Hugging Face |

La comparación con modelos de *reward modeling* de mayor tamaño no es directa: este clasificador opera sobre respuestas de un pipeline `char-rl` concreto y no se han publicado comparativas cruzadas. No disponible información adicional sobre alternativas equivalentes.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para un pipeline `char-rl` específico; su generalización a otros dominios o distribuciones de texto no está documentada.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de ModernBERT-base hereda los sesgos de su corpus de preentrenamiento, no cuantificados aquí.
- Riesgo de alucinación: no aplica en sentido generativo (no produce texto), pero puede asignar probabilidades erróneas fuera de la distribución de entrenamiento.
- Test pequeño: n=600 respuestas y 300 *prompts*; las métricas tienen intervalos de confianza amplios y la mayoría de ejemplos se concentran en los extremos (274 en [0,0, 0,1] y 269 en [0,9, 1,0]), lo que limita la evidencia en la zona intermedia.
- Idiomas: no se declara soporte multilingüe; el comportamiento fuera del idioma de entrenamiento es desconocido.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue en producción.
- Sin descargas ni validación externa: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso independiente.
- Repositorio de 0,6 GB con pesos en safetensors; no se documentan cuantizaciones GGUF/ONNX listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nmeyer19/char-rl-classifier-goodness
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
