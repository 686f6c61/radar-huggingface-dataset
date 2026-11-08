# janmusic/NCM-TinyStories-87M-MLX

## Resumen

NCM-TinyStories-87M-MLX es un generador de texto de 87,4 millones de parámetros entrenado desde cero sobre el dataset TinyStories mediante Next-Concept Modeling (NCM), una técnica no autorregresiva propuesta por Kumbong et al. y reimplementada de forma independiente en MLX por el autor del modelo (janmusic). En lugar de emitir un token por llamada al modelo, NCM emite un nivel completo de códigos latentes discretos por llamada, de grueso a fino: una historia de 128 tokens se genera en 11 llamadas al generador más un nivel 0 muestreado de un unigrama almacenado. El modelo se distribuye junto con el códec congelado de 15,5 millones de valores en el que genera.

El modelo es, en palabras del propio autor, un artefacto de investigación y no un buen generador de texto: su perplejidad generativa medida con GPT-2-large es de 24,404, aproximadamente 2,13 veces la del baseline autorregresivo AR-TinyStories-91M-MLX (11,484) construido con los mismos bloques y entrenado sobre las mismas ventanas. Su interés es metodológico: permite estudiar el compromiso entre número de llamadas al modelo y calidad de la generación en un régimen de decodificación paralela, y sirve como referencia reproducible para comparar arquitecturas no autorregresivas frente a autorregresivas a igualdad de datos y tamaño.

La relevancia actual del modelo es acotada y experimental: demuestra que la brecha NCM/AR se reduce con el tamaño y con más datos (de 3,33 a 2,38 en proporción al pasar de 12M a 87M parámetros con 1x datos, y de 3,05 a 2,13 con 4x datos), pero se mantiene por encima de 2 en todos los puntos medidos. No está pensado para producción ni para uso comercial general, aunque su licencia MIT lo permita formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo NCM (Next-Concept Modeling), 12 bloques, anchura 768, 12 cabezas, atención block-diagonal, cabezas de salida atadas al codebook |
| Parametros totales | 87.426.059 (generador); 15.508.096 valores en el códec congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 128 tokens (jerarquía de 12 niveles: 1, 8, 16, 24, 32, 40, 52, 64, 76, 92, 108, 128) |
| Tipos de cuantizacion | no disponible; pesos en float32 safetensors, entrenamiento en bf16 con pesos maestros fp32 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors float32, cargados por `ncm_mlx`; no es un checkpoint de Transformers ni de `mlx_lm` |

## Arquitectura y entrenamiento

El generador es un transformer de 12 bloques con anchura 768 y 12 cabezas de atención, con atención block-diagonal y cabezas de salida atadas al codebook del códec. La generación es jerárquica y de grueso a fino: el nivel 0 se muestrea de un unigrama almacenado y los 11 niveles restantes (8, 16, 24, 32, 40, 52, 64, 76, 92, 108, 128 posiciones) se producen en llamadas sucesivas al generador, cada una escribiendo todas las posiciones del nivel y refinándolas. El códec es un modelo de cuantización vectorial residual con 15,5 millones de valores, congelado, entrenado originalmente para los experimentos de 12M (E21). El tokenizador es un BPE de 8.192 tokens y las ventanas de entrenamiento son de 128 tokens.

El entrenamiento se realizó desde cero con `ncm-mlx` sobre el dataset `roneneldan/TinyStories`, con 60.000 actualizaciones a batch 64, lo que equivale a 3.840.000 ventanas (cuatro veces las 960.000 originales), en bf16 con pesos maestros fp32 y semilla 0. La condicionalidad es nula: el modelo genera de forma incondicional a partir de un prefijo inicial de un token. La innovación técnica destacable es la decodificación paralela por niveles, que reduce las llamadas al modelo de 128 (autorregresivo) a 11 por muestra de 128 tokens; el autor advierte explícitamente que menos llamadas no implica menor latencia, porque cada llamada NCM es de mayor tamaño y hay que añadir la decodificación del códec.

## Capacidades

- Generación de texto incondicional en inglés sobre el dominio de TinyStories (historias infantiles cortas).
- Decodificación paralela por niveles con refinamiento de grueso a fino; el flag `--levels` imprime la decodificación tras cada nivel.
- Generación de 128 tokens en 11 llamadas al generador más el nivel 0 del unigrama.
- Ejecución en Apple Silicon vía Metal con `ncm-mlx` (Python 3.12) y en CPU con `--cpu`; soporte CUDA en Linux con NVIDIA mediante `ncm-mlx[cuda]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.
- No soporta condicionalidad por prompt más allá de un prefijo inicial de un token.

## Casos de uso

- Investigación en decodificación no autorregresiva: sirve como referencia reproducible para medir el compromiso entre número de llamadas al modelo y perplejidad generativa frente a un baseline autorregresivo de tamaño y datos comparables.
- Estudio de escalado de NCM: el modelo forma parte de una escalera de tamaños (12M, 50M, 87M) con datos a 1x y 4x, útil para analizar cómo evoluciona la brecha NCM/AR con parámetros y datos.
- Reproducción de experimentos en MLX: el paquete `ncm-mlx` y los pesos permiten replicar la generación en Apple Silicon o CUDA sin depender de PyTorch.
- Docencia y divulgación: la demo de replay y el flag `--levels` permiten visualizar el refinamiento nivel a nivel de una muestra, útil para explicar decodificación jerárquica.
- Benchmarking de códecs de cuantización vectorial residual: al distribuirse con el códec congelado, permite evaluar el impacto del códec en la calidad final de la generación.
- Pruebas de integración de pipelines MLX: sirve para validar flujos de descarga, carga de safetensors float32 y ejecución en Metal o CUDA dentro de herramientas propias.

## Benchmarks y rendimiento

| Metrica | NCM-TinyStories-87M-MLX | AR-TinyStories-91M-MLX |
|---|---:|---:|
| Parámetros | 87.426.059 (generador) | 91.348.992 |
| Perplejidad generativa GPT-2-large, media (SD) sobre 5 semillas | 24,404 (0,848) | 11,484 (0,341) |
| Ratio NCM / AR | 2,13 | — |
| Pérdida teacher-forced limpia | 1,51620 nats por código | 1,01081 nats por token BPE |
| Llamadas al modelo por muestra de 128 tokens | 11 (más el unigrama nivel 0 almacenado) | 128 |

Referencias bajo el mismo scorer: texto real retenido 8,529; checkpoint TinyStories publicado por Kumbong et al. 16,259 (con un presupuesto de entrenamiento mucho mayor). La perplejidad generativa usa 1.280 muestras incondicionales por modelo (5 semillas × 256), temperatura 1, sin top-k ni top-p, evaluadas con GPT-2 large (`openai-community/gpt2-large@32b71b1`) sin token BOS y hasta 1.024 tokens. La pérdida de código y la de token son objetivos distintos y no se comparan entre sí.

Progresión de la ratio NCM/AR por tamaño y datos: con 1x datos y fp32, 3,33 (12M), 2,43 (50M) y 2,38 (87M); con 4x datos y bf16, 3,05 y 2,89 para dos semillas de 12M, 2,21 a 50M y 2,13 a 87M. El paso de 50M a 87M (de 26,148 a 24,404 con 4x datos) es menor que la diferencia entre semillas medida a 12M, por lo que no es distinguible de la variación por semilla de entrenamiento. Una semilla por punto excepto el punto de 12M con 4x datos; el cómputo no está igualado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo ocupa 0,4 GB y los pesos son float32 safetensors, por lo que el generador y el códec caben holgadamente en memoria de una GPU de consumo.
- GPU recomendadas: no disponible; el autor documenta ejecución en Apple Silicon vía Metal, en CPU y en Linux con NVIDIA mediante `ncm-mlx[cuda]`.
- Cabe en GPU de consumo: sí, por tamaño (87,4M de parámetros en float32), aunque no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: `ncm-mlx` 0.4.0 (Python 3.12) con `huggingface-hub`; no es compatible con vLLM, llama.cpp, Ollama, TGI ni `mlx_lm`, al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles; el autor advierte que menos llamadas al modelo no implica generación más rápida, porque cada llamada NCM es mayor y se añade la decodificación del códec.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad generativa GPT-2-large | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| NCM-TinyStories-87M-MLX | 87,4M (generador) | 128 tokens | 24,404 | MIT | Hugging Face, MLX |
| AR-TinyStories-91M-MLX | 91,3M | 128 tokens | 11,484 | no disponible en la información | Hugging Face, MLX |
| NCM-TinyStories-89M-Upstream-MLX | no disponible | no disponible | 16,259 | no disponible en la información | Hugging Face, MLX |
| Checkpoint TinyStories de Kumbong et al. | no disponible | no disponible | 16,259 (misma referencia) | no disponible en la información | paper arXiv:2610.14162 |

La comparación más directa es con AR-TinyStories-91M-MLX, construido con los mismos bloques y entrenado sobre las mismas ventanas: NCM obtiene 2,13 veces su perplejidad generativa. Frente al checkpoint de Kumbong et al., la diferencia de perplejidad (24,404 frente a 16,259) se explica en parte por el presupuesto de entrenamiento, mucho mayor en el modelo original.

## Limitaciones y advertencias

- Calidad de texto baja: el propio autor lo describe como un artefacto de investigación, no un buen generador; la perplejidad generativa duplica la del baseline autorregresivo comparable.
- Generación incondicional: no acepta prompts más allá de un prefijo inicial de un token, lo que limita su uso práctico.
- Dominio restringido: entrenado únicamente sobre TinyStories, con vocabulario y estilo de historias infantiles; no generaliza a otros dominios.
- Idioma: solo inglés.
- Contexto corto: ventanas de 128 tokens, insuficiente para la mayoría de aplicaciones reales.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre un dataset sintético de historias infantiles, los sesgos esperables son los del generador que produjo TinyStories, no analizados aquí.
- Riesgo de alucinación: no evaluado en la información disponible; las decodificaciones intermedias pueden ser incoherentes y no deben interpretarse como rastro de razonamiento del modelo.
- Licencia MIT: permite uso comercial formalmente, pero la calidad y el dominio del modelo lo hacen inadecuado para producción.
- Compatibilidad: no es un checkpoint de Transformers ni de `mlx_lm`; requiere `ncm-mlx` y no funciona con las herramientas estándar de despliegue.
- Menos llamadas al modelo no equivale a menor latencia: cada llamada NCM es mayor y se añade la decodificación del códec.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janmusic/NCM-TinyStories-87M-MLX
- Repositorio GitHub: https://github.com/janmus1c/ncm-mlx
- Documentación: https://janmus1c.github.io/ncm-mlx/
- Página de plataformas: https://janmus1c.github.io/ncm-mlx/platforms/
- Working paper (Zenodo): https://doi.org/10.5281/zenodo.23953213
- Paper NCM (arXiv): https://arxiv.org/abs/2610.14162
- Demo de replay: https://huggingface.co/spaces/janmusic/NCM-Refinement-Replay
- Baseline autorregresivo: https://huggingface.co/janmusic/AR-TinyStories-91M-MLX
- Checkpoint upstream de Kumbong et al.: https://huggingface.co/janmusic/NCM-TinyStories-89M-Upstream-MLX
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Nombre anterior del modelo: https://huggingface.co/janmusic/ncm-tinystories-87m-x4-mlx
