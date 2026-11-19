# ikimyaii/Mamba-1.3B-unstructured-SparseGPT-90pct

## Resumen

Mamba-1.3B-unstructured-SparseGPT-90pct es una variante podada del modelo de espacio de estados Mamba-1.3B-100B (fla-hub), publicada por el usuario ikimyaii. Se trata de un ejercicio de investigación sobre poda no estructurada: aplicar el algoritmo SparseGPT oficial de IST-DASLab sobre un transformer híbrido basado en SSM (state space model), sin reentrenamiento posterior, para alcanzar una esparsidad objetivo del 90 % en las capas lineales internas de los bloques.

El modelo no es un modelo de producción ni un checkpoint destinado a uso general: es una línea base (baseline) para comparar con otras variantes del mismo autor (los modelos EHWS mencionados en la model card). Su interés es metodológico: demuestra cómo se comporta SparseGPT cuando se traslada del dominio transformer clásico (OPT, LLaMA) a la arquitectura Mamba, y documenta el coste en calidad de una poda one-shot agresiva sin recuperación.

Los resultados son contundentes en el lado negativo: la perplejidad en WikiText-2 pasa de 10,03 a 2075,52, y la media de zero-shot en lm-evaluation-harness cae de 0,4350 a 0,3247. Es, por tanto, un artefacto de investigación útil para estudiar límites de compresión, no un modelo recomendable para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model selectivo, SSM), con capas lineales internas podadas |
| Parametros totales | 1.334.740.992 (1,33 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, fla-hub/mamba-1.3B-100B, es un Mamba de 1,3 mil millones de parametros entrenado sobre 100 000 millones de tokens (de ahi el sufijo 100B). La arquitectura Mamba sustituye la atencion por un SSM selectivo con recurrencia lineal, lo que da complejidad lineal en la longitud de secuencia. Cada bloque contiene proyecciones lineales (`in_proj`, `x_proj`, `out_proj`), una convolucion 1D, una proyeccion `dt_proj` y parametros `A_log` y `D`.

Sobre esta base, el autor aplica poda no estructurada one-shot con el codigo oficial de SparseGPT (IST-DASLab/sparsegpt, commit 147d215, modo `fasterprune`, blocksize 128, damping 0,01). La calibracion usa 128 secuencias de C4 de 2048 tokens con semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, replicando el esquema de los drivers oficiales. El recorrido de capas es codigo nuevo del autor, ya que los drivers oficiales solo soportan OPT y LLaMA; la matematica de poda es la oficial. Los pesos se podan en bfloat16 y el proceso completo tardo 5,3 minutos en una A100 de 40 GB.

Se podan todas las capas lineales internas de los bloques; `dt_proj` se mantiene densa (aproximadamente el 2 % de los pesos lineales de cada bloque), igual que `conv1d`, `A_log` y `D`. Los embeddings y el `lm_head` permanecen densos. La mascara usa un umbral por bloque de 128 columnas, por lo que las filas acaban con distinto numero de ceros. La esparsidad medida sobre estos pesos es de 0,8821 (88,21 %), no el 90 % nominal. Las filas no estan equilibradas: entre las 192 capas podadas, la fila mas densa tiene de media 2,80 veces los no-ceros medios de la fila (peor capa: 7,75 veces).

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje causal, heredada del Mamba base.
- Razonamiento y conocimiento general muy degradados respecto al base (ver benchmarks).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la degradacion de calidad lo hace inviable en la practica.
- Capacidades multilingues: no disponibles.
- Capacidad especial: ninguna destacable; el interes es exclusivamente metodologico (estudio de poda).

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como referencia cuantitativa del coste de SparseGPT one-shot al 90 % en arquitecturas SSM, para comparar contra variantes con recuperacion o con mascaras equilibradas.
- Estudio de la transferencia de algoritmos de poda: permite analizar por que SparseGPT, disenado para transformers con atencion, degrada tanto en Mamba, y aislar el efecto de la poda por bloques de 128 columnas.
- Analisis de esparsidad por filas: los datos de desequilibrio (2,80x media, peor capa 7,75x) sirven para estudiar tecnicas de reequilibrado de mascaras.
- Reproducibilidad de pipelines de poda: el codigo de recorrido de capas para Mamba es reutilizable en experimentos similares con otros checkpoints de fla-hub.
- Docencia y divulgacion: ejemplo claro de que una poda agresiva sin reentrenamiento destruye la calidad, util para ilustrar el papel de la recuperacion.
- Benchmark de infraestructura: medir tiempos de poda (5,3 min en A100 40 GB) y requisitos de memoria para experimentos de compresion.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, en bfloat16 por desbordamiento de Mamba en fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 10,03 | 2075,52 |
| C4 | 14,12 | 2030,34 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2090 |
| arc_easy | 0,5644 | 0,2803 |
| boolq | 0,6040 | 0,3783 |
| hellaswag | 0,3898 | 0,2642 |
| openbookqa | 0,1980 | 0,1300 |
| rte | 0,5343 | 0,5162 |
| winogrande | 0,5217 | 0,4949 |
| Media | 0,4350 | 0,3247 |

## Requisitos de hardware

- VRAM para inferencia: el repo ocupa 2,7 GB en safetensors (bfloat16). En bf16 se necesitan aproximadamente 2,7 GB de pesos mas overhead de activaciones; en fp16 no es fiable porque Mamba desborda en fp16 segun la model card.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o A100 son suficientes.
- Cabe en GPU de consumo: si, en tarjetas con soporte bf16 (RTX 30xx en adelante, A-series).
- Opciones de despliegue: requiere `flash-linear-attention` instalado (`import fla`) y carga via `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. El modelo base Mamba tiene coste lineal en secuencia, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Estado |
|---|---|---|---|---|---|
| Mamba-1.3B-unstructured-SparseGPT-90pct (este) | 1,33 B | no disponible | 2075,52 | no disponible | Investigacion, 0 descargas |
| fla-hub/mamba-1.3B-100B (base denso) | 1,33 B | no disponible | 10,03 | no disponible | Modelo base de referencia |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Mencionadas en la model card sin datos |

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad severamente degradada: la perplejidad en WikiText-2 se multiplica por mas de 200 respecto al denso; la media zero-shot cae 11 puntos porcentuales. No es apto para uso general.
- Poda sin recuperacion: no hubo reentrenamiento ni destilacion posterior, por lo que el dano es irreversible en este checkpoint.
- Esparsidad real del 88,21 %, no del 90 % nominal; la mascara por bloques de 128 columnas deja filas muy desequilibradas (hasta 7,75 veces la media).
- Riesgo de alucinacion: no evaluado formalmente, pero esperable muy alto dado el colapso de perplejidad.
- Sesgos: no documentados; se heredan los del Mamba base, sin analisis especifico.
- Idiomas: no se especifican; probablemente limitados al ingles de C4 y del corpus de entrenamiento del base.
- Licencia no declarada: no se puede asumir uso comercial sin verificar la del modelo base fla-hub/mamba-1.3B-100B.
- Requiere dependencia especifica (`flash-linear-attention`) y bfloat16; no funciona correctamente en fp16.
- Cero descargas y cero likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-unstructured-SparseGPT-90pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
