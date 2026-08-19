# just1nseo/qwen3-4b-if-rlvr-subset4k-n3-ci99-outer-ep5

## Resumen

El modelo `just1nseo/qwen3-4b-if-rlvr-subset4k-n3-ci99-outer-ep5` es un fine-tuning experimental del modelo base Qwen/Qwen3-4B, desarrollado por el usuario just1nseo. Se trata de un experimento de investigación en aprendizaje por refuerzo con recompensas verificables (RLVR) que explora el uso de anclajes de intervalo de confianza exteriores de Student-t para definir umbrales de recompensa. El nombre del repositorio indica que usa un subconjunto de 4.096 prompts, con N=3 muestras independientes por prompt, un intervalo de confianza del 99% y anclaje exterior (outer), entrenado durante 5 épocas.

El modelo se publica como una serie de checkpoints exportados en BF16 a Hugging Face, correspondientes a los pasos 16, 32, 48, 64 y 80 del entrenamiento. La arquitectura es la misma que la de Qwen3-4B, un transformer denso con modo de razonamiento (thinking) activado durante el entrenamiento. El objetivo del experimento es evaluar si los intervalos de confianza calculados a partir de múltiples muestras (draws) mejoran la señal de recompensa frente a anclajes puntuales, un tema relevante para la comunidad de investigación en RLHF/RLVR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4.000 millones (aprox., BF16 repo 8,1 GB) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (base Qwen3-4B; hasta 131.072 con YaRN) |
| Tipos de cuantizacion | BF16 (exportacion oficial); cuantizaciones derivadas no especificadas |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3-4B: principalmente ingles y chino, con soporte multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso con 4.000 millones de parametros, disenado por Alibaba Cloud. Qwen3-4B incorpora un modo de razonamiento hibrido (thinking y non-thinking) que se controla mediante tokens especiales. En este fine-tuning, el modo thinking se mantiene activado durante todo el entrenamiento.

El entrenamiento sigue un esquema de RLVR con recompensas basadas en intervalos de confianza. Para cada prompt del subconjunto de 4.096 filas, se generan hasta tres muestras independientes (draws) con temperatura 1.0, top-p 0.95, top-k 20 y sin penalizacion de presencia. Los anclajes se calculan como intervalos de Student-t bilaterales: para N=3 se usa df=2, para N=2 df=1, y para N=1 se conserva el anclaje puntual de la primera muestra. El intervalo exterior se define con el extremo inferior para la NLL media por token (solo x) y el extremo superior para la NLL media por token (x+c). La recompensa es +0.1 si la respuesta cae dentro del intervalo valido, con un piso duro de cero.

Los hiperparametros principales son: batch 256, 16 pasos por epoca, 5 epocas, tasa de aprendizaje 1e-6, 8 rollouts, 2.048 tokens de prompt y 8.192 tokens de respuesta. Los checkpoints se exportan en los pasos 16, 32, 48, 64 y 80. No se mencionan tecnicas como decodificacion especulativa ni atencion lineal; la innovacion reside en el metodo de anclaje por intervalos.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de Qwen3-4B, incluyendo el modo thinking para problemas complejos de matematicas, logica y codigo.
- Soporte de tool calling y function calling: disponible en el modelo base Qwen3-4B, presumiblemente heredado (no verificado en este fine-tuning).
- Capacidades multilingues: el base soporta mas de 100 idiomas, aunque el fine-tuning se ha realizado sobre un subconjunto de prompts en ingles (no se especifica la composicion linguistica).
- Capacidades especiales: el modelo esta disenado para experimentos de RLVR con recompensas basadas en intervalos de confianza; no se han documentado capacidades adicionales como vision o audio.
- Modo thinking: activado durante el entrenamiento, por lo que el modelo genera razonamientos internos antes de la respuesta final.

## Casos de uso

- Investigacion en RLVR y metodos de recompensa: el modelo sirve como punto de comparacion para estudiar como los anclajes de intervalo exterior afectan la convergencia y la calidad de las respuestas frente a anclajes puntuales o interiores.
- Analisis de robustez estadistica: los checkpoints permiten evaluar el efecto del numero de muestras (N=1, 2, 3) sobre la senal de recompensa y la estabilidad del entrenamiento.
- Desarrollo de pipelines de RLHF experimentales: el repositorio incluye manifiestos con validacion de tensores y commits verificados, util para reproducir experimentos y comparar metricas.
- Estudio de sobreajuste en fine-tuning con pocos datos: con solo 4.096 prompts, el modelo es un caso de estudio sobre los limites de generalizacion en entornos de datos limitados.
- Benchmarking de modelos thinking de 4B: puede usarse como referencia para comparar el rendimiento en tareas de razonamiento frente al Qwen3-4B base y otros fine-tunes.
- Educacion en tecnicas de RLVR: el codigo y la documentacion del entrenamiento (aunque no se publica el codigo completo) sirven como ejemplo didactico de diseno experimental con intervalos de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. El unico dato cuantitativo es el tamano del repositorio (8,1 GB) y los hiperparametros de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8 GB en BF16 (4B parametros × 2 bytes). Con cuantizacion a 8 bits (~4 GB) o 4 bits (~2 GB) puede reducirse sustancialmente.
- GPU recomendadas: RTX 3090/4090 (24 GB) para BF16 con margen; RTX 3060 12 GB o similar para cuantizacion 8 bits. Para entrenamiento o fine-tuning adicional se necesitarian GPUs con al menos 24 GB (A100, H100) o varias GPUs.
- Compatibilidad con consumer GPU: si, cabe en GPUs de 12-16 GB con cuantizacion ligera (por ejemplo, GGUF Q4_K_M).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con accelerate. Al ser un modelo de 4B, la latencia es baja en hardware moderno; por ejemplo, en una RTX 4090 se pueden alcanzar decenas de tokens por segundo en modo non-thinking, aunque el modo thinking genera mas tokens.
- Throughput estimado: no disponible; depende del hardware y de la longitud de las respuestas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B (base) | 4B | 32k (131k con YaRN) | Apache 2.0 | Modelo original, sin fine-tuning RLVR |
| Qwen3-4B-IF-RLVR (este) | 4B | 32k (heredado) | Apache 2.0 | Fine-tuning experimental con anclajes de intervalo exterior |
| Qwen3-4B-Instruct | 4B | 32k | Apache 2.0 | Variante instruct del base, entrenado con SFT y RLHF |

La comparativa se limita al propio base y a la variante instruct, ya que no se dispone de otros modelos de la misma categoria con tecnicas de RLVR por intervalos. La diferencia clave es el metodo de entrenamiento: este modelo usa un esquema de recompensa basado en intervalos de confianza de Student-t, mientras que el base no ha pasado por RLVR y la variante instruct usa metodos convencionales.

## Limitaciones y advertencias

- Modelo experimental: no esta validado para uso en produccion; es un artefacto de investigacion con un subconjunto de datos muy reducido (4.096 prompts).
- Sin benchmarks publicados: no hay evidencia de que el fine-tuning mejore o mantenga el rendimiento del base en tareas estandar.
- Riesgo de sobreajuste: el entrenamiento con pocos datos y 5 epocas puede provocar memorizacion de los prompts de entrenamiento.
- Sesgos heredados: el modelo base Qwen3-4B puede contener sesgos sociales, culturales o linguisticos; este fine-tuning no los corrige.
- Alucinacion: como cualquier LLM, puede generar contenido falso o inconsistente, especialmente en modo thinking cuando el razonamiento se alarga.
- Limitaciones de contexto: aunque el base soporta 32k tokens, el entrenamiento se realizo con 2.048 tokens de prompt y 8.192 de respuesta; no se ha verificado el comportamiento con contextos mas largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3-4B, se deben respetar los terminos de la licencia original (tambien Apache 2.0).
- Reproducibilidad: los checkpoints incluyen manifiestos con validacion de tensores, pero no se publican los scripts de entrenamiento completos, lo que dificulta replicar el experimento exactamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/just1nseo/qwen3-4b-if-rlvr-subset4k-n3-ci99-outer-ep5
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper tecnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Dataset de anclajes (run 2): https://huggingface.co/datasets/sangyon/anchor_cache/commit/bc72af3622590af3459181932e3e4949c162c0e8
- Dataset de anclajes (run 3): https://huggingface.co/datasets/sangyon/anchor_cache/commit/0e030ca1600da5306e5474985137060b7231d254
