# Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-lasso128

## Resumen

Qwen3-8B-speculator.kvn-dspark-lasso128 es un modelo borrador (draft model) para decodificacion especulativa sobre el verificador Qwen/Qwen3-8B, desarrollado por Infomaniak AI. No es un modelo de lenguaje autonomo: su funcion es proponer bloques de hasta 8 tokens que el modelo grande verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del verificador. Emplea una arquitectura poco habitual, `KvNDSparkDraftModel`, basada en un backbone de 5 capas Koopman-von Neumann con Random Fourier Features y atencion de estado cero (Zero-KV), en lugar de la atencion de ventana deslizante convencional.

La variante `lasso128` parte de un backbone entrenado con 512 modos y aplica una poda estructural 4x guiada por el penalty LASSO del teorema 5.6 de Barthe, reduciendo el estado recurrente por secuencia a 2,56 KB (un 99,976 % menos que el baseline DSpark SWA). El modelo tiene 975,3 millones de parametros totales en safetensors, de los cuales 841,46 millones son parametros activos del drafter, y se distribuye con licencia Apache 2.0.

Su relevancia es experimental: forma parte de un estudio de ablacion controlado de cuatro vias que compara KvN-RFF frente a atencion de ventana deslizante sobre el mismo verificador, con condiciones de entrenamiento identicas. Sirve como referencia para investigar alternativas de bajo coste de memoria en decodificacion especulativa, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `KvNDSparkDraftModel` (`kvn_dspark`), backbone de 5 capas Zero-KV Causal Symplectic Koopman-von Neumann con Random Fourier Features |
| Parametros totales | 975.339.009 |
| Parametros activos | 841,46 M (drafter activo; reduccion del 21,5 % frente a DSpark SWA) |
| Longitud de contexto | Entrenado y evaluado con contexto de 4.096 tokens; longitud maxima no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda el comportamiento del verificador Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

El drafter sustituye la atencion de ventana deslizante por un backbone Koopman-von Neumann de 5 capas que aproxima la dinamica del estado oculto mediante Random Fourier Features y un operador lineal (Koopman). El estado recurrente por secuencia se limita a 2,56 KB, lo que elimina practicamente el coste de cache KV del borrador. Sobre ese backbone se anaden dos cabezas: una cabeza Markov bilineal de bajo rango con puerta (`markov_rank: 256`, vocabulario de borrador de 32.000 tokens) y una cabeza de confianza que incorpora observables de regla de Born amplificados segun el teorema 4.2 de Barthe, con la expresion `2M(q_m^2 + p_m^2) - 1`. El modelo consume estados ocultos auxiliares del verificador en las capas 2, 18 y 33, mas la capa de normalizacion final 36, y predice bloques de hasta K = 8 tokens por pasada.

El entrenamiento se realizo en 2x NVIDIA H200 (143.771 MiB de HBM3e por GPU) bajo condiciones ceteris paribus respecto al resto de la familia de ablacion: split identico de 900 conversaciones de entrenamiento y 100 de validacion sobre UltraChat-4K, profundidad de 5 capas, `block_size=8`, cabeza Markov-256 con puerta, optimizador Muon con `lr=3e-4`, 5 epocas y 3.730 pasos. En esta variante concreta, el backbone se entreno con M_train = 512 modos y un penalty LASSO de `2e-4` (teorema 5.6 de Barthe), tras lo cual se podo estructuralmente 4x hasta M_infer = 128 modos. No se documenta en la informacion disponible el uso de RLHF ni DPO; el objetivo de entrenamiento es la prediccion multi-token con perdida compuesta (cross-entropy mas total variation) y una perdida auxiliar de calibracion de la cabeza de confianza.

## Capacidades

- Prediccion multi-token especulativa: genera hasta 8 tokens candidatos por pasada para su verificacion por Qwen/Qwen3-8B.
- Aceleracion de decodificacion: reduce la latencia de generacion del verificador mediante aceptacion de bloques, con un factor reportado de 3,33x en H200 con B=128.
- Cabeza de confianza calibrada: estima la probabilidad de aceptacion por token, con error absoluto medio de 0,1938 en validacion.
- Estado recurrente minimo: 2,56 KB por secuencia, lo que permite servir lotes grandes sin presion de cache KV en el borrador.
- Integracion con el ecosistema `speculators` mediante codigo personalizado (`custom_code`).
- No es un modelo de chat: no genera respuestas de forma autonoma, no soporta tool calling por si mismo y no aporta capacidades multimodales, de vision ni de audio. Cualquier capacidad de lenguaje, razonamiento o codigo procede del verificador Qwen3-8B.

## Casos de uso

- Investigacion en decodificacion especulativa: banco de pruebas controlado para comparar backbones KvN-RFF frente a atencion de ventana deslizante con el mismo verificador, mismo dataset y mismos hiperparametros, aislando el efecto de la arquitectura del borrador.
- Serving de alto lote con Qwen3-8B: al mantener un estado recurrente de 2,56 KB por secuencia, el borrador permite escalar el tamano de lote (hasta B=128 en las mediciones) sin que la cache del drafter se convierta en cuello de botella de memoria.
- Despliegue en entornos con memoria limitada: el repo ocupa 2,0 GB y el drafter activo ronda los 841 M de parametros, por lo que puede convivir con el verificador en GPUs de 80 GB o en configuraciones multi-GPU sin desplazar al modelo principal.
- Reduccion de coste por token en APIs internas: con una tasa de aceptacion media del 28,23 % y una longitud esperada de aceptacion de 2,28 tokens, se traduce en menos pasos de decodificacion del modelo de 8B y, por tanto, menor coste computacional por respuesta.
- Evaluacion de tecnicas de poda estructural: la variante `lasso128` sirve para medir la perdida de calidad al pasar de 512 a 128 modos (val loss 0,6838 frente a 0,6784 de la variante M=512) y validar metodos de poda guiada por regularizacion.
- Estudio de calibracion de cabezas de confianza: los datos de error absoluto y sesgo de producto acumulado (+0,0320) permiten investigar el sesgo de supervivencia en la aceptacion de bloques especulativos.

## Benchmarks y rendimiento

Resultados de validacion sobre el split retenido de Qwen/Qwen3-8B (100 conversaciones, contexto de 4.096, K=8):

| Metrica | Valor |
|---|---|
| Perdida de validacion compuesta | 0,6838 |
| Cross-entropy | 1,8754 |
| Total variation loss | 0,3013 |
| Longitud esperada de aceptacion (tau) | 2,2756 |
| Longitud esperada de aceptacion greedy (EAL) | 2,3765 |
| Tasa media de aceptacion de tokens | 28,23 % |
| Precision de bloque completo | 32,15 % |
| Perdida de la cabeza de confianza | 0,2251 |
| Error absoluto de confianza | 0,1938 |
| Sesgo de supervivencia acumulado | +0,0320 |

Aceptacion por posicion dentro del bloque:

| Split | tau | EAL | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---|---|---|---|---|---|---|---|---|---|
| UltraChat validacion (100 convs, 4K) | 2,2756 | 2,3765 | 78,7 % | 42,3 % | 29,5 % | 24,9 % | 22,5 % | 20,8 % | 19,4 % | 18,8 % |

Comparativa dentro de la familia de ablacion (mismas condiciones de entrenamiento):

| Repo | Backbone | Estado por secuencia | Parametros activos | Val loss | tau | EAL | Pos-0 | Latencia B=128 en H200 |
|---|---|---|---|---|---|---|---|---|
| kvn-dspark (M3) | 5x KvN-RFF (M=128) | 2,56 KB | 841,46 M | 0,6556 | 2,3607 | 2,4591 | 80,44 % | 3,661 ms (3,34x) |
| kvn-dspark-lasso128 (M4-Pruned) | 5x KvN-RFF (512->128 LASSO) | 2,56 KB | 841,46 M | 0,6838 | 2,2760 | 2,3760 | 78,70 % | 3,666 ms (3,33x) |
| kvn-dspark-m512 (M4) | 5x KvN-RFF (M=512) | 10,24 KB | 844,61 M | 0,6784 | 2,2678 | 2,3696 | 79,01 % | 3,655 ms (3,34x) |
| kvn-dspark-hybrid (M2) | 1x SWA-128 + 4x KvN | 2,10 MB | 914,83 M | 0,6930 | 2,2440 | 2,3500 | 77,30 % | 5,317 ms (2,30x) |
| dspark-swa (M1) | 5x SWA-128 | 10,49 MB | 1.072,20 M | 0,7900 | 1,9020 | 1,9780 | 51,80 % | 12,223 ms (1,00x) |

La model card incluye una tabla de escalado por lotes (B=1 a 128) medida en una H200 con bfloat16, CUDA Events, 50 iteraciones cronometradas tras 15 de calentamiento, pero los valores completos de esa tabla no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 2,0 GB en safetensors; en bfloat16 el drafter de 841 M de parametros activos requiere aproximadamente 2 GB adicionales de pesos, mas el estado recurrente (2,56 KB por secuencia, despreciable incluso con lotes grandes). El grueso de la VRAM la consume el verificador Qwen3-8B.
- GPU de referencia: el modelo se entreno y evaluo en 2x NVIDIA H200 (143 GB HBM3e), con mediciones de latencia en una sola H200.
- GPU recomendadas: H200 o H100 para el escenario medido; A100 80 GB es una opcion razonable para servir el par drafter + verificador. En GPUs de consumo, el drafter cabe holgadamente, pero el verificador de 8B en bfloat16 necesita unos 16 GB, por lo que una RTX 4090 (24 GB) puede alojar el conjunto con contexto moderado.
- Despliegue: la libreria `speculators` es el mecanismo previsto (incluye `custom_code`); no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 3,666 ms por bloque de 8 tokens en borrador con B=128 en H200, equivalente a un factor de aceleracion de 3,33x frente al baseline; con B=1 y otros tamanos de lote los valores no estan disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Estado por secuencia | tau / EAL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-lasso128 | Drafter KvN-RFF podado | 975,3 M totales / 841,46 M activos | 2,56 KB | 2,2760 / 2,3760 | Apache 2.0 | Hugging Face |
| Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark | Drafter KvN-RFF | 841,46 M activos | 2,56 KB | 2,3607 / 2,4591 | Apache 2.0 | Hugging Face |
| Infomaniak-AI/Qwen3-8B-speculator.dspark-swa | Drafter SWA (baseline) | 1.072,20 M activos | 10,49 MB | 1,9020 / 1,9780 | Apache 2.0 | Hugging Face |
| mgoin/Qwen3-8B-speculator.dspark | Drafter DFlash + Markov + confianza | no disponible | no disponible | no disponible | no disponible | Hugging Face (checkpoint de investigacion) |
| deepseek-ai/dspark_qwen3_8b_block7 | Drafter DSpark, bloque 7 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el verificador Qwen/Qwen3-8B no produce respuestas utiles; cualquier evaluacion de calidad debe hacerse sobre el par completo.
- Rendimiento inferior al flagship de la familia: la poda de 512 a 128 modos degrada la perdida de validacion de 0,6556 a 0,6838 y la longitud esperada de aceptacion de 2,3607 a 2,2760, con una precision en posicion 0 que cae del 80,44 % al 78,70 %.
- Tasa de aceptacion moderada: solo el 28,23 % de los tokens propuestos se aceptan de media y la precision de bloque completo es del 32,15 %, por lo que la aceleracion efectiva depende mucho del dominio y del prompt.
- Sesgo de calibracion: la cabeza de confianza presenta un sesgo de supervivencia acumulado de +0,0320, lo que puede sobreestimar la probabilidad de aceptar cadenas largas.
- Entrenamiento limitado a UltraChat-4K: 900 conversaciones de entrenamiento y contexto de 4.096 tokens; el comportamiento fuera de ese regimen (contextos largos, codigo, matematicas) no esta documentado.
- Idiomas no declarados en la model card; el soporte multilingue depende exclusivamente del verificador.
- Requiere `custom_code` y la libreria `speculators`, lo que complica el despliegue en stacks de inferencia estandar y exige auditar el codigo remoto antes de cargarlo.
- Estado de publicacion muy reciente (creado el 2026-11-08) y sin descargas ni likes: no hay evidencia de uso en produccion ni validacion independiente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks estandar (MMLU, HumanEval, GSM8K) impide comparar su calidad de forma directa con otros drafters.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-lasso128
- Flagship de la familia: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark
- Variante M=512: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-m512
- Variante hibrida: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-hybrid
- Baseline DSpark SWA: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.dspark-swa
- Modelo verificador: https://huggingface.co/Qwen/Qwen3-8B
- Drafter DSpark de referencia (mgoin): https://huggingface.co/mgoin/Qwen3-8B-speculator.dspark
- Drafter DSpark de DeepSeek: https://huggingface.co/deepseek-ai/dspark_qwen3_8b_block7
