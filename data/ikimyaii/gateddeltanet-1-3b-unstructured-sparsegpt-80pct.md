# ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-80pct

## Resumen

GatedDeltaNet-1.3B-unstructured-SparseGPT-80pct es un modelo derivado del checkpoint base m-a-p/1.3B-100B-GatedDeltaNet-pure, al que se le ha aplicado poda one-shot no estructurada al 80 % mediante el codigo oficial de SparseGPT. Lo publica el usuario ikimyaii en Hugging Face y su proposito declarado es servir como baseline frente a los modelos EHWS de la misma cuenta. No es un modelo pensado para uso en produccion, sino un artefacto de investigacion sobre compresion y dispersidad en arquitecturas GatedDeltaNet.

La arquitectura subyacente es GatedDeltaNet, una familia de modelos de estado (linear attention con reglas delta y compuertas) alternativa a los transformers clasicos. El checkpoint cuenta con 1.466.343.808 parametros totales (aproximadamente 1,3 B) y fue entrenado originalmente sobre 100 B tokens segun indica el nombre del modelo base. El proceso de poda afecta a todas las capas lineales dentro de los bloques, mientras que los embeddings y la lm_head permanecen densos.

El interes tecnico del modelo radica en documentar el coste real de la poda agresiva sin reentrenamiento: la perplejidad en WikiText-2 pasa de 10,31 a 146,19 y la precision media zero-shot cae de 0,5123 a 0,3480. Estos numeros lo convierten en una referencia util para medir cuantas capacidades se pierden al aplicar SparseGPT a una arquitectura que no es un transformer estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (linear attention con reglas delta y compuertas) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante la poda) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersion | 80 % no estructurada en capas lineales; embeddings y lm_head densos |
| Metodo de poda | SparseGPT oficial (IST-DASLab/sparsegpt@147d215), blocksize 128, damping 0.01 |
| Calibracion | 128 secuencias C4 de 2.048 tokens, seed 0 |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Tamano del repo | 2,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del checkpoint base m-a-p/1.3B-100B-GatedDeltaNet-pure, entrenado sobre 100 B tokens. GatedDeltaNet es una propuesta de atencion lineal con actualizaciones de estado tipo delta y compuertas, orientada a reducir el coste computacional del contexto largo frente a la atencion cuadratica clasica. El checkpoint resultante conserva esa estructura y solo modifica los pesos de las capas lineales.

Sobre ese modelo se aplico una poda one-shot no estructurada al 80 % con el codigo oficial de SparseGPT (commit 147d215, modo `fasterprune`). La calibracion uso 128 secuencias C4 de 2.048 tokens con semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados, siguiendo el esquema de los drivers oficiales; el recorrido de capas es codigo nuevo del autor, mientras que la matematica de poda es la oficial. Los pesos se podaron en bfloat16 y el proceso completo tardo 4,2 minutos en una A100 de 40 GB. La mascara usa un umbral por bloque de 128 columnas, de modo que las filas acaban con distinto numero de ceros: en las 240 capas podadas, la fila mas densa tiene de media 1,98 veces los no-cero de la fila media, y la peor capa llega a 3,95 veces.

## Capacidades

- Generacion de texto autoregresiva con la arquitectura GatedDeltaNet del modelo base.
- Razonamiento y tareas de comprension lectora en ingles, evaluadas con lm-evaluation-harness.
- No hay evidencia de soporte de tool calling o function calling en la informacion disponible.
- No hay evidencia de soporte de agentes o razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles; las evaluaciones publicadas son en ingles.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.
- Carga mediante `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (`import fla`).

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia para medir la degradacion de SparseGPT al 80 % sobre GatedDeltaNet y comparar contra los modelos EHWS de la misma cuenta.
- Estudio de dispersidad no estructurada: permite analizar el desbalanceo de filas (hasta 3,95 veces la media en la peor capa) y su impacto en kernels de inferencia dispersa.
- Evaluacion de protocolos de calibracion: al usar 128 secuencias C4 de 2.048 tokens y semilla 0, facilita reproducir y variar el conjunto de calibracion en experimentos controlados.
- Investigacion sobre linear attention: al conservar la arquitectura GatedDeltaNet, permite estudiar como responde este tipo de atencion lineal a la poda frente a transformers clasicos.
- Referencia de perdida de capacidad: los resultados de perplejidad (146,19 en WikiText-2 y 131,26 en C4) y de zero-shot (media 0,3480) permiten cuantificar el coste de la poda agresiva sin reentrenamiento.
- Pruebas de tooling de compresion: valida pipelines de carga con `flash-linear-attention` y de evaluacion con lm-evaluation-harness sobre checkpoints podados.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 10,31 | 146,19 |
| C4 | 13,76 | 131,26 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,1809 |
| arc_easy | 0,7222 | 0,3106 |
| boolq | 0,6159 | 0,4878 |
| hellaswag | 0,4629 | 0,2782 |
| openbookqa | 0,2920 | 0,1360 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5154 |
| Media | 0,5123 | 0,3480 |

Dispersion medida sobre estos pesos: 0,8000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,47 B parametros, en bfloat16 o fp16 ronda los 2,9 GB de pesos, y en cuantizaciones de 8 bits o 4 bits seria considerablemente menor (estimacion propia, no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada; la poda se realizo en una A100 de 40 GB.
- Cabe en GPU de consumo por tamano de pesos, pero la informacion disponible no confirma compatibilidad ni rendimiento en RTX 4090 u otras tarjetas.
- Opciones de despliegue: carga con `AutoModelForCausalLM.from_pretrained` y `flash-linear-attention` (`import fla`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Precision media zero-shot | Licencia |
|---|---|---|---|---|---|
| Este modelo (GatedDeltaNet podado 80 %) | 1,47 B | no disponible | 146,19 | 0,3480 | no disponible |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (base denso) | ~1,3 B | no disponible | 10,31 | 0,5123 | no disponible |
| Alternativas de poda SparseGPT en transformers | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es contra el checkpoint base denso, cuyos numeros se incluyen en la model card. No se dispone de datos de otros modelos podados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa: la perplejidad en WikiText-2 se multiplica por mas de 14 (de 10,31 a 146,19) y la media zero-shot cae 0,1643 puntos absolutos.
- Rendimiento muy bajo en tareas de razonamiento: arc_easy baja de 0,7222 a 0,3106 y hellaswag de 0,4629 a 0,2782.
- La unica tarea que mejora es rte (de 0,4982 a 0,5271), probablemente por sesgo hacia una clase mayoritaria; no debe interpretarse como ganancia real de capacidad.
- Mascara desbalanceada: la fila mas densa tiene de media 1,98 veces los no-cero de la fila media y la peor capa 3,95 veces, lo que complica el aprovechamiento real de la dispersion en kernels.
- Poda one-shot sin reentrenamiento: no hay recuperacion de capacidades tras el recorte.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- Idiomas no declarados: las evaluaciones publicadas son solo en ingles.
- Longitud de contexto no documentada; el calibrado uso 2.048 tokens, pero no se confirma que sea el limite operativo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; con perplejidad tan alta, la calidad de generacion libre es previsiblemente pobre.
- Sesgos conocidos: no documentados en la informacion disponible.
- No apto para produccion segun los propios resultados; su uso previsto es como baseline de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
