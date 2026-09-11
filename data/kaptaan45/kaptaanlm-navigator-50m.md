# kaptaan45/KaptaanLM-Navigator-50M

## Resumen

KaptaanLM-Navigator-50M es un modelo de lenguaje decoder-only de 52,72 millones de parámetros desarrollado por Rudransh Shekhar dentro del proyecto KaptaanLM. Se trata del tier de 50M de una familia de modelos pequenos (SLM) cuyo objetivo declarado es cubrir el rango de 10M a 100M de parámetros con arquitecturas entrenadas especificamente sobre Google Cloud TPU con JAX/Flax. El modelo resuelve el problema de disponer de un checkpoint minimo, entrenable y desplegable en hardware muy modesto, util como banco de pruebas de pipelines de entrenamiento en TPU y como base para experimentos de destilacion o decodificacion especulativa.

El checkpoint publicado es un piloto de pre-entrenamiento: 1.000 millones de tokens procesados en 3.815 pasos sobre una TPU v5e-8 en 2,24 horas, con una perdida final de 2,0172 y una perplejidad de validacion de 31,27 sobre un conjunto reservado de 131.000 tokens. La arquitectura es un transformer denso con 16 capas, d_model de 512, 16 cabezas de atencion y 4 cabezas KV (GQA 4:1), con atencion de ventana deslizante de 512 tokens sobre una longitud de contexto total de 2.048 tokens.

Su relevancia es fundamentalmente metodologica: documenta con detalle las dinamicas de entrenamiento (throughput, descenso de perdida, uso de memoria HBM) y publica artefactos tanto en PyTorch como en JAX/Flax. No es un modelo orientado a produccion generalista: con 52,72M de parámetros y solo 1.000 millones de tokens de entrenamiento, sus capacidades linguisticas son muy limitadas y estan restringidas al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con bloque propio `KaptaanBlock`; atencion con ventana deslizante de 512 tokens |
| Parametros totales | 52.718.336 (52,72M); 44.335.104 no correspondientes a embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (ventana deslizante de 512 tokens) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo artefactos FP32 en PyTorch y JAX/Flax) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (211,5 MB); JAX/Flax `.pkl` (632,4 MB por checkpoint) |
| Capas | 16 |
| Dimension del modelo (d_model) | 512 |
| Cabezas de atencion | 16 (4 cabezas KV, GQA 4:1) |
| Dimension de la FFN | 1.376 (SwiGLU) |
| Vocabulario | 16.384 tokens, BPE, con embeddings atados (tied embeddings) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en HuggingFace | 2026-09-11 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 16 capas con d_model de 512, 16 cabezas de atencion y 4 cabezas de clave-valor, lo que supone una agrupacion 4:1 (GQA). La capa feed-forward usa SwiGLU con d_ffn de 1.376 y el vocabulario de 16.384 tokens emplea embeddings atados, de modo que la matriz de embedding y la de proyeccion de salida se comparten. La atencion combina una ventana deslizante de 512 tokens dentro de un contexto maximo de 2.048 tokens. El autor define la "densidad de razonamiento activa" como el 84,11% de los parámetros ubicados en capas Transformer, cifra que coincide con la proporcion de parámetros no de embedding (44,34M de 52,72M) y que no debe interpretarse como un mecanismo de activacion selectiva tipo MoE.

El pre-entrenamiento se ejecuto sobre una unica TPU v5e-8 (8 chips TensorCore, 128 GB de HBM) con paralelismo de datos puro (DP=8) mediante NamedSharding de JAX/Flax. Se procesaron 1.000 millones de tokens en 3.815 pasos y 2,24 horas, con un rendimiento medio de 619.226 tokens/s y un pico de 1.071.984 tokens/s (el autor lo compara con un factor ~19,5x frente a dos Tesla T4). El uso de `nn.remat(KaptaanBlock)` (rematerializacion de activaciones) mantuvo el pico de HBM en 2,85 GB de 15,75 GB por nucleo, con mas del 81% de margen de seguridad. La perdida descendio de forma monotona desde 10,1630 (paso 1) hasta 3,2965 (paso 3.000) y se anelo hasta 2,0172 (paso 3.800). La perplejidad de validacion sobre 131.000 tokens reservados bajo de 98,77 a 31,27, un 68,3%. No se documenta en la informacion disponible ninguna fase de ajuste por instrucciones, RLHF, DPO u otros metodos de alineacion.

Se publican tres artefactos: los pesos PyTorch `KaptaanLM-50M-0.1.pt`, el checkpoint convergido de JAX/Flax `Kaptaan-50M_step3815.pkl` y un checkpoint previo al enfriamiento `Kaptaan-50M_late_plateau_step3000.pkl`.

## Capacidades

- Generacion de texto en ingles: el modelo esta entrenado exclusivamente como modelo de lenguaje causal, sin ajuste por instrucciones documentado.
- Modelado de lenguaje y continuation de texto: es su capacidad principal y la unica verificable con los datos publicados (perplejidad de validacion de 31,27).
- Tag de "reasoning" declarado por el autor: aparece en los metadatos de HuggingFace, pero la model card no aporta evaluaciones de razonamiento que lo respalden.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el modelo esta declarado unicamente para ingles (`language: en`).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible; no se documenta ninguna.
- Eficiencia de despliegue: al ser un modelo de 52,72M de parámetros, es viable como modelo auxiliar (por ejemplo, borrador en decodificacion especulativa) o como componente embebido, aunque esto no se valida en la model card.

## Casos de uso

- Reproduccion de pipelines de entrenamiento en TPU: el checkpoint y sus hiperparametros documentados (DP=8, NamedSharding, rematerializacion) permiten reproducir el flujo completo de JAX/Flax sobre TPU v5e-8 y medir throughput y uso de HBM con una carga de trabajo que cabe en 2,85 GB por nucleo.
- Investigacion en eficiencia de atencion: la combinacion de contexto de 2.048 tokens con ventana deslizante de 512 y GQA 4:1 lo convierte en un banco de pruebas barato para comparar variantes de atencion y estrategias de cache KV.
- Modelo borrador en decodificacion especulativa: con 52,72M de parámetros y 211,5 MB en FP32, puede actuar como draft model para un modelo mayor del mismo tokenizador, aunque el autor no documenta esta integracion ni un tokenizador compartido con otros modelos.
- Experimentos de destilacion y poda: su tamano reducido permite usarlo como alumno en destilacion desde modelos mayores o como sujeto de pruebas de cuantizacion y poda, midiendo el impacto en perplejidad sobre el mismo conjunto de validacion.
- Prototipado educativo y docencia: sirve para ilustrar de extremo a extremo el ciclo de pre-entrenamiento (descenso de perdida, perplejidad, checkpoints intermedios) con un coste de computo de 2,24 horas en TPU.
- Pruebas de integracion en despliegues ligeros: al ocupar menos de 1 GB en cualquiera de sus formatos, permite validar cadenas de inferencia (carga de pesos, tokenizacion, generacion con cache KV) en GPUs de gama baja, iGPUs o CPU antes de escalar a modelos mayores.
- Investigacion sobre el regimen de modelos pequenos: permite estudiar los limites de calidad alcanzables con 52,72M de parámetros y 1.000 millones de tokens, y comparar con alternativas del mismo orden de magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Los unicos datos de rendimiento publicados son metricas de entrenamiento y validacion, que se recogen a continuacion como tales y no como benchmarks de capacidad:

| Metrica | Valor |
|---|---|
| Perdida en el paso 1 | 10,1630 |
| Perdida en el paso 3.000 | 3,2965 |
| Perdida en el paso 3.800 | 2,0172 |
| Perplejidad de validacion (inicio) | 98,77 |
| Perplejidad de validacion (final) | 31,27 |
| Reduccion de perplejidad | 68,3% |
| Tokens de entrenamiento | 1.000.000.000 |
| Pasos de entrenamiento | 3.815 |
| Tiempo total de entrenamiento | 2,24 horas en 1x TPU v5e-8 |
| Throughput medio | 619.226 tokens/s |
| Throughput pico | 1.071.984 tokens/s |
| Conjunto de validacion | 131.000 tokens (held-out) |

## Requisitos de hardware

- VRAM estimada para los pesos (calculo derivado del numero de parámetros declarado): ~211 MB en FP32, ~106 MB en FP16/BF16, ~53 MB en INT8 y ~26 MB en INT4. No son cifras publicadas por el autor, sino estimaciones a partir de los 52,72M de parámetros.
- Cache KV estimada (calculo derivado de la arquitectura declarada: 16 capas, 4 cabezas KV, dimension de cabeza 32): ~256 elementos por capa y token, es decir ~4.096 elementos por token; en FP16 alrededor de 8 KB por token y ~16 MB para una secuencia completa de 2.048 tokens. La ventana deslizante de 512 tokens podria reducir esta cifra si la implementacion limita la cache, algo que la model card no especifica.
- Consumo total estimado en inferencia: por debajo de 1 GB en cualquiera de los formatos publicados, incluyendo cache y activaciones.
- GPU recomendadas: no disponible; no se han publicado mediciones de inferencia. El entrenamiento se realizo en Google Cloud TPU v5e-8 (8 chips, 128 GB de HBM), con un pico de 2,85 GB por nucleo gracias a la rematerializacion.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo actual, en iGPU e incluso en CPU, segun los tamanos estimados de pesos y cache.
- Opciones de despliegue: los artefactos publicados son pesos PyTorch (`.pt`) y checkpoints JAX/Flax (`.pkl`). No se distribuyen pesos en safetensors ni en GGUF, por lo que llama.cpp, Ollama y LM Studio requeririan una conversion previa que el autor no documenta. El soporte en vLLM, TGI o TensorRT-LLM es no disponible, dado que el bloque `KaptaanBlock` es una implementacion propia.
- Latencia y throughput de inferencia: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas publicas y conviene verificarlos antes de citarlos. El modelo analizado no dispone de evaluaciones estandar, por lo que la comparacion se limita a especificaciones.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Peso / formato publicado | Evaluaciones publicadas |
|---|---|---|---|---|---|---|
| KaptaanLM-Navigator-50M | 52,72M | 2.048 tokens (ventana deslizante 512) | Apache-2.0 | en | `.pt` FP32 y `.pkl` JAX/Flax | Solo perdida y perplejidad de entrenamiento |
| Pythia-70M | ~70M | 2.048 tokens | Apache-2.0 | en | safetensors (PyTorch) | Si (suite de evaluacion de Pythia) |
| GPT-2 small | 124M | 1.024 tokens | Modified MIT | en | safetensors / PyTorch | Si (evaluaciones parciales) |
| SmolLM-135M | ~135M | 2.048 tokens | Apache-2.0 | en | safetensors, GGUF | Si (benchmarks publicados) |
| Qwen2.5-0.5B | ~494M | 32.768 tokens | Apache-2.0 | multilingue | safetensors, GGUF | Si (benchmarks publicados) |

Frente a estas alternativas, la ventaja de KaptaanLM-Navigator-50M es su tamano minimo y la documentacion detallada del pipeline de entrenamiento en TPU con JAX/Flax; su desventaja es la ausencia de ajuste por instrucciones, de evaluaciones estandar y de formatos cuantizados listos para usar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El autor no documenta ningun analisis de sesgos, toxicidad o composicion del corpus de entrenamiento.
- Riesgo de alucinacion: alto. Con 52,72M de parámetros y 1.000 millones de tokens de entrenamiento, el modelo tiene una capacidad muy limitada para retener hechos; la perplejidad de validacion de 31,27 indica un ajuste aun debil del lenguaje.
- Idiomas: unicamente ingles. No hay soporte declarado de castellano ni de ningun otro idioma.
- Contexto: 2.048 tokens como maximo, con ventana deslizante de 512 tokens, lo que limita tareas que requieran razonamiento sobre documentos largos o conversaciones multi-turno extensas.
- Alineacion: no se documenta ninguna fase de ajuste por instrucciones (SFT), RLHF o DPO. El modelo no debe esperarse que siga instrucciones ni que mantenga un formato conversacional coherente.
- Metadatos potencialmente enganosos: el tag `reasoning` de HuggingFace no esta respaldado por ninguna evaluacion en la model card, y la metrica "Active Reasoning Density" (84,11%) es en realidad la proporcion de parámetros no de embedding, no un mecanismo de activacion selectiva.
- Licencia: Apache-2.0, que permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia. No se declaran restricciones adicionales.
- Estado del artefacto: se trata de un checkpoint piloto de pre-entrenamiento (0 descargas, 0 likes, repositorio de 0,2 GB) sin garantia de mantenimiento, sin versionado estable y sin soporte en frameworks de inferencia habituales.
- Produccion: no recomendado para casos de uso en produccion orientados al usuario final sin un ajuste posterior y una evaluacion propia.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/kaptaan45/KaptaanLM-Navigator-50M
- Repositorio del proyecto KaptaanLM (segun la cita BibTeX de la model card): https://github.com/rudy-07/KaptaanLM
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el autor o el proyecto KaptaanLM; los enlaces recuperados no guardan relacion con el contenido de esta ficha.
