# pngwn/memcap-m-near-capacity

## Resumen

El modelo `pngwn/memcap-m-near-capacity` es un checkpoint de investigación de 1,86 millones de parámetros, desarrollado por pngwn como parte de una reproducción a pequeña escala del artículo *"How much do language models memorize?"* (Morris et al., arXiv:2505.24832). El objetivo del experimento es medir la capacidad de memorización de un modelo GPT-2 entrenado desde cero sobre secuencias de tokens uniformemente aleatorios, donde la generalización es imposible y toda reducción de pérdida se atribuye a memorización.

Este checkpoint concreto se sitúa en el punto de saturación del modelo: la memorización ha alcanzado una meseta de **3,50 bits por parámetro**, el valor más cercano al ~3,6 bits/parámetro reportado en el paper (fp32: ~3,83). La entropía del dataset (26,3 Mbits, ~3,9 veces el punto de saturación) supera la capacidad del modelo, por lo que este almacena únicamente lo que puede. Es un modelo puramente experimental, sin utilidad práctica como generador de texto, pero relevante para la comunidad que estudia los límites de la memorización en redes neuronales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (via `transformers`), d_model 128, 8 capas, 4 cabezas |
| Parametros totales | 1.856.768 (1,86 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible (entrenado en fp32, TF32 desactivado) |
| Idiomas soportados | no disponible (tokens aleatorios, sin idioma real) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar implementada en `transformers`, con 8 capas, 4 cabezas de atención y dimensión de modelo 128. Se entrenó desde cero con semilla de inicialización 0, en precisión fp32 con TF32 desactivado, usando el optimizador AdamW con tasa de aprendizaje constante de 1e-3 y lotes de 1024 secuencias. El entrenamiento duró 37.750 pasos, hasta convergencia (crecimiento extrapolado de memorización inferior al 0,3% en 2.000 pasos adicionales).

Los datos de entrenamiento consisten en secuencias de 64 tokens uniformemente aleatorios de un vocabulario de 2048 tokens, con un total de 38.000 secuencias (semilla de datos 200). La entropía del dataset es de 693 bits por secuencia (63 tokens predecibles × log2(2048)), lo que suma 26.334.000 bits en total. Al ser datos aleatorios, no existe ninguna estructura que aprender; la única forma de reducir la pérdida es memorizar las secuencias. La métrica de memorización se calcula como la entropía del dataset menos la log-verosimilitud negativa del modelo sobre los datos, expresada en bits.

## Capacidades

- Memorización de secuencias aleatorias: el modelo almacena 6.503.686 bits de información (24,7% de la entropía del dataset), lo que equivale a 3,50 bits por parámetro.
- No posee capacidades de generación de texto coherente, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural, al estar entrenado exclusivamente con tokens aleatorios.
- No incluye tokenizer: los datos de entrenamiento son IDs de token crudos en el rango [0, 2048).

## Casos de uso

- Investigación sobre capacidad de memorización: el modelo sirve como punto de referencia para estudiar cuántos bits puede almacenar una red neuronal por parámetro, replicando los resultados del paper de Morris et al. a escala reducida.
- Validación de metodologías de medición de memorización: permite contrastar la fórmula "bits memorizados = entropía del dataset - NLL" y verificar su comportamiento en un entorno controlado con datos aleatorios.
- Estudio de curvas de aprendizaje y saturación: al estar en el punto de meseta, es útil para analizar cómo la memorización se estanca cuando la entropía del dataset supera la capacidad del modelo.
- Comparación de arquitecturas a escala mínima: se puede usar como baseline para medir el impacto de cambios en profundidad, ancho o número de cabezas en la capacidad de memorización.
- Reproducibilidad de experimentos científicos: al ser un checkpoint público con datos y scripts de entrenamiento asociados, permite verificar y extender los resultados del paper original.
- Docencia en aprendizaje automático: como ejemplo didáctico de qué significa la capacidad de un modelo y por qué la memorización no equivale a generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está diseñado para tareas de lenguaje natural. La única métrica de rendimiento reportada es la de memorización:

| Metrica | Valor |
|---|---|
| Entropia del dataset | 26.334.000 bits |
| Bits memorizados | 6.503.686 bits (24,7% de la entropia) |
| Bits por parametro | 3,50 |

Este valor de 3,50 bits/parámetro es el resultado principal de la reproducción y se acerca al ~3,6 bits/parámetro reportado en el paper original (fp32: ~3,83).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,86 millones de parámetros en fp32, lo que ocupa aproximadamente 7,4 MB de memoria. Con overhead de ejecución, cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problema.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 10xx en adelante, RTX serie 20/30/40) o incluso hardware integrado. No requiere GPU profesional.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede cargar con `AutoModelForCausalLM.from_pretrained`. También es compatible con cualquier framework que soporte GPT-2 (llama.cpp, vLLM, etc.), aunque su utilidad práctica es nula fuera del ámbito de investigación.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo minúsculo, la inferencia es prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo rango de parámetros y con el mismo propósito (medición de memorización pura). El paper original de Morris et al. (arXiv:2505.24832) entrena modelos GPT-2 de mayor tamaño (desde ~1M hasta ~1B parámetros) sobre datos aleatorios, pero no se han publicado checkpoints públicos de esos modelos. Este checkpoint es una reproducción independiente a escala mínima, por lo que la comparativa directa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje útil: no genera texto coherente ni responde a instrucciones. Su único propósito es la medición de memorización.
- No incluye tokenizer: los datos de entrada deben ser IDs de token crudos en el rango [0, 2048). No se puede usar con texto natural sin un preprocesado externo.
- Sesgos: al entrenarse con datos aleatorios, no presenta sesgos lingüísticos, pero tampoco tiene ninguna capacidad de generalización.
- Riesgo de alucinación: no aplica, ya que no genera contenido semántico.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación sin restricciones, pero el modelo no tiene valor comercial práctico.
- Caveat para producción: no debe usarse en ningún sistema de producción real. Es exclusivamente un artefacto de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pngwn/memcap-m-near-capacity
- Paper original: https://arxiv.org/abs/2505.24832
- Dataset de entrenamiento: https://huggingface.co/datasets/pngwn/memcap-random-data
- Resultados completos (curvas de aprendizaje y 18 celdas): https://huggingface.co/datasets/pngwn/memcap-results
- Repositorio de runs (checkpoint en rama `m_n38000_s0_fp32`): https://huggingface.co/pngwn/memcap-runs
- Perfil del autor: https://huggingface.co/pngwn
