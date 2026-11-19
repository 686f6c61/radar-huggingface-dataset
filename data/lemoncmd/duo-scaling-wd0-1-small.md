# lemoncmd/duo-scaling-wd0.1-small

## Resumen

`lemoncmd/duo-scaling-wd0.1-small` es una familia de cinco modelos de difusión discreta de lenguaje (uniform-state discrete diffusion, variante `duo_base`) entrenados por el usuario lemoncmd como parte de un estudio de leyes de escala sobre la fracción de datos de entrenamiento. Los cinco modelos son idénticos en arquitectura y configuración de optimización (AdamW con weight decay 0.1) y solo difieren en el tamaño del conjunto de entrenamiento: subconjuntos anidados de OpenWebText que contienen el 10%, 25%, 50%, 75% y 100% de los bloques de entrenamiento. El objetivo no es publicar un modelo listo para producción, sino ofrecer una trayectoria de entrenamiento completa y analizable (checkpoints en una rejilla fija de pasos, métricas de validación, normas de pesos) para estudiar cómo la pérdida de test escala con la cantidad de datos y con la norma de los pesos.

El backbone es un DiT (Diffusion Transformer) de configuración `small` con 169.627.218 parámetros, longitud de contexto de 1.024 tokens y tokenizador GPT-2 (vocabulario de 50.258). Se entrena sobre la NELBO exacta con un schedule de ruido log-lineal, sin currículo ni destilación. El entrenamiento está pausado antes de su objetivo de 1.000.000 de pasos (detenido para ahorrar cómputo, con posibilidad de reanudarse), y el repositorio conserva el estado exacto de reanudación en `checkpoints/last.ckpt` de cada ejecución.

Es relevante ahora porque los estudios de leyes de escala en difusión discreta para lenguaje son escasos en comparación con los de transformers autorregresivos, y este repositorio publica checkpoints intermedios, normas de pesos (incluida la complejidad espectral de Bartlett) y la permutación exacta que define los subconjuntos anidados, lo que permite reproducir y analizar curvas de aprendizaje con precisión. No obstante, el tamaño del repositorio (332,8 GB) y la naturaleza de investigación del artefacto lo alejan del uso como modelo de inferencia convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), difusion discreta uniform-state (`duo_base`) |
| Parametros totales | 169.627.218 (backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (checkpoints en bf16/PyTorch; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (entrenado sobre OpenWebText, predominantemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de PyTorch Lightning (`.ckpt`), con pesos raw y EMA, estado del optimizador y estado del sampler |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) de configuracion `small` con 169.627.218 parametros en el backbone, contexto de 1.024 tokens, tokenizador GPT-2 (vocabulario 50.258) y embeddings no atados. El algoritmo es `duo_base`: difusion discreta de estado uniforme entrenada sobre la NELBO exacta con un schedule de ruido log-lineal, sin curriculo ni destilacion. La optimizacion usa AdamW con learning rate 3e-4 constante tras 2.500 pasos de warm-up, weight decay 0.1 desacoplado en un unico grupo de parametros (por lo que tambien se aplica a biases, pesos de LayerNorm y embeddings), clipping de gradiente 1.0, EMA con decaimiento 0.9999, precision mixta bf16 y batch global de 512 secuencias de 1.024 tokens. El objetivo de entrenamiento es de 1.000.000 de pasos con semilla 1.

Los datos son OpenWebText (revision `79d93d7`), tokenizado con GPT-2 y empaquetado en bloques de 1.024 tokens: 8.730.942 bloques de entrenamiento y una particion de validacion de 110.464 bloques (los ultimos 100.000 documentos). La fraccion *f* usa los primeros `floor(f x N + 0.5)` bloques de una permutacion fija (semilla 20250927), de modo que los subconjuntos son anidados y comparables con el estudio de weight decay (`duo-scaling-small`). El orden de los datos depende solo del paso del optimizador, no del layout de GPUs, lo que permite reanudaciones exactas. El codigo es una version modificada de `s-sahoo/duo` (rama scaling-study, commit `7ac5b2294c36`).

Innovaciones tecnicas destacables del artefacto: publicacion de checkpoints en una rejilla fija de pasos (0, 100, 200, 400, 700, 1k, 1.5k, 2.5k, 4k, 6k, 10k, 15k, 20k y despues cada 25k hasta 1M), normas de pesos cada 500 pasos (raw y EMA) con estadisticos por matriz (norma espectral, Frobenius, L1, normas (2,1) por fila y columna, y `log_R` como complejidad espectral de Bartlett), y metadatos de reanudacion exacta (estado del optimizador, del sampler y del bucle de entrenamiento).

## Capacidades

- Generacion de texto mediante muestreo por difusion discreta (denoising iterativo), no decodificacion autorregresiva.
- Modelado de lenguaje y calculo de NELBO (negative evidence lower bound) para evaluacion.
- Entrenamiento y ajuste fino: los checkpoints incluyen estado completo del optimizador, lo que permite reanudar o continuar el entrenamiento.
- Analisis de leyes de escala: cinco puntos de fraccion de datos con la misma configuracion permiten estudiar curvas de aprendizaje.
- Inspeccion de normas de pesos y complejidad espectral para investigacion sobre sesgo implicito y generalizacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (datos en ingles).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre leyes de escala en difusion discreta: usar los cinco checkpoints de fraccion de datos para ajustar curvas de perdida de validacion frente a tokens vistos y comparar con predicciones teoricas de sesgo implicito (D'Amico, Bocchi & Negri).
- Estudio de weight decay y norma de pesos: los ficheros `norms/*.jsonl` permiten correlacionar la norma de las matrices con la perdida de test en cada checkpoint, replicando el analisis que motiva el estudio.
- Reproduccion de experimentos: la permutacion publicada (`subsets/owt_train_perm_s20250927.npy`) y los `run_info.json` permiten reconstruir exactamente los subconjuntos anidados y verificar resultados.
- Reanudacion y extension del entrenamiento: `checkpoints/last.ckpt` contiene el estado exacto (optimizador, sampler, bucle) para continuar hasta el objetivo de 1.000.000 de pasos sin desviarse de la trayectoria original.
- Benchmark de algoritmos de difusion discreta: el backbone DiT `small` con `duo_base` sirve como linea base para comparar variantes de schedule de ruido, objetivos de entrenamiento o arquitecturas en el mismo regimen de datos.
- Docencia y formacion: los checkpoints intermedios y las metricas por segmento permiten ilustrar el comportamiento de un modelo de difusion de lenguaje a lo largo del entrenamiento sin necesidad de entrenar desde cero.
- Analisis de eficiencia computacional: los ficheros `segments.jsonl` registran el tipo de GPU (H100/H200) por segmento, lo que permite normalizar tiempos y estudiar throughput por hardware.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son la NELBO de validacion (nats/token) en el paso indicado, calculada con pesos EMA sobre la particion completa de validacion de OpenWebText (110.464 bloques) con ruido fijo:

| Fraccion | Bloques de entrenamiento | Paso | Epocas | Val NELBO (nats/token) | Horas de entrenamiento | Paso de `last.ckpt` |
|---|---|---|---|---|---|---|
| 0.10 | 873.094 | 475.000 | 279 | 3,3461 | 94 | 478.640 |
| 0.25 | 2.182.736 | 200.000 | 47 | 3,3763 | 43 | 222.980 |
| 0.50 | 4.365.471 | 200.000 | 23 | 3,3719 | 43 | 222.580 |
| 0.75 | 6.548.207 | 250.000 | 20 | 3,3599 | 47 | 253.720 |
| 1.00 | 8.730.942 | 250.000 | 15 | 3,3607 | 47 | 254.640 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las horas de entrenamiento mezclan segmentos en H100 y H200, por lo que no son directamente comparables entre ejecuciones sin normalizar por tipo de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: con 169,6 M de parametros, los pesos en bf16 ocupan aproximadamente 0,34 GB; en fp32, unos 0,68 GB. El coste dominante en inferencia por difusion es el numero de pasos de denoising y el tamano del batch, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el backbone en bf16; para entrenamiento o reanudacion se necesitan GPUs de datacenter (H100/H200, segun `segments.jsonl`) por el estado del optimizador y el batch global de 512 secuencias.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4090, siempre que se cargue solo el backbone y no el estado completo del optimizador.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el artefacto es un checkpoint de PyTorch Lightning que requiere cargar con `torch.load` y ejecutar el codigo de `s-sahoo/duo`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lemoncmd/duo-scaling-wd0.1-small` | 169,6 M | 1.024 | Difusion discreta (DiT) | Apache 2.0 | Hugging Face, checkpoints de investigacion |
| `duo-scaling-small` (mismo autor, estudio weight decay 0) | 169,6 M (misma config) | 1.024 | Difusion discreta (DiT) | Apache 2.0 | Hugging Face, subconjuntos anidados con estos |
| Modelos autorregresivos GPT-2 `small` | ~124 M | 1.024 | Transformer autorregresivo | MIT | Ampliamente disponible |
| `s-sahoo/duo` (codigo base) | configurable | configurable | Difusion discreta | no disponible | GitHub |

La comparacion con modelos autorregresivos no es directa: la NELBO de difusion no es equivalente a la perplejidad autorregresiva y los benchmarks estandar no se han publicado para este artefacto.

## Limitaciones y advertencias

- Entrenamiento incompleto: las cinco ejecuciones estan pausadas antes del objetivo de 1.000.000 de pasos; los resultados reflejan trayectorias parciales y no un modelo convergido.
- Artefacto de investigacion: no esta pensado para uso en produccion ni para generacion de texto de calidad; no se documentan evaluaciones cualitativas.
- Idiomas: entrenado exclusivamente sobre OpenWebText en ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Sesgos: OpenWebText es un corpus web con los sesgos inherentes a ese tipo de datos; no se documenta ninguna mitigacion (RLHF, DPO, filtrado).
- Riesgo de alucinacion: no evaluado; al ser un modelo de difusion de lenguaje pequeno y parcialmente entrenado, la coherencia a contexto largo es limitada por la ventana de 1.024 tokens.
- Licencia: Apache 2.0 permite uso comercial, pero el estado incompleto del entrenamiento y la ausencia de evaluaciones desaconsejan su uso en produccion.
- Repositorio de gran tamano (332,8 GB): la descarga y el almacenamiento requieren planificacion; los checkpoints incluyen estado del optimizador, no solo pesos.
- Tiempos de reloj no comparables entre ejecuciones por la mezcla de H100 y H200; usar pasos o normalizar por GPU.
- `trainer/loss` en las metricas depende del layout de GPU; para comparar ejecuciones debe usarse `val/nll`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lemoncmd/duo-scaling-wd0.1-small
- Codigo base (version modificada): https://github.com/s-sahoo/duo
- Dataset: https://huggingface.co/datasets/Skylion007/openwebtext
- Referencia del estudio de leyes de escala: D'Amico, Bocchi & Negri, *Implicit bias produces neural scaling laws in learning curves* (no se proporciona URL en la informacion disponible)
- Paper de referencia de Duo: no disponible en la informacion proporcionada
- Demo: no disponible
