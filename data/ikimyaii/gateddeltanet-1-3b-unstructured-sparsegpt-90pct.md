# ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-90pct

## Resumen

GatedDeltaNet-1.3B-unstructured-SparseGPT-90pct es un modelo de lenguaje derivado de m-a-p/1.3B-100B-GatedDeltaNet-pure, al que se le ha aplicado una poda no estructurada del 90 % mediante SparseGPT en modo one-shot, sin reentrenamiento posterior. Lo publica el usuario ikimyaii en Hugging Face y su proposito es servir como linea base (baseline) para una familia de modelos denominada EHWS dentro de la misma cuenta. No es, por tanto, un modelo pensado para uso productivo, sino un artefacto de investigacion para estudiar los limites de la poda extrema en arquitecturas de estado recurrente lineal.

La arquitectura subyacente es GatedDeltaNet, un modelo tipo transformer hibrido con atencion lineal basada en delta rule con compuertas, entrenado originalmente por el equipo m-a-p sobre 100B tokens. El checkpoint podado conserva 1.466.343.808 parametros (aproximadamente 1,3B) y un peso en disco de 2,9 GB en safetensors. La poda afecta a todas las capas lineales dentro de los bloques, mientras que los embeddings y la lm_head permanecen densos.

Su relevancia es metodologica: demuestra que una poda no estructurada del 90 % sin destilacion ni fine-tuning destruye practicamente la calidad del modelo, con una perplejidad en WikiText-2 que pasa de 10,31 a 768,16. Resulta util como referencia negativa para comparar con tecnicas de poda mas sofisticadas o con esquemas de sparsity estructurada y equilibrada por filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atencion lineal con delta rule y compuertas), transformer hibrido |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrena con secuencias de 2.048 tokens en calibracion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Sparsity | 90 % no estructurada (0.9000 medido sobre los pesos) |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Tamano del repositorio | 2,9 GB |

## Arquitectura y entrenamiento

El modelo base es GatedDeltaNet, una variante de atencion lineal que sustituye la atencion softmax clasica por un mecanismo de estado recurrente con delta rule y compuertas de olvido, orientado a contextos largos con coste lineal. El checkpoint original fue entrenado por m-a-p sobre 100B tokens (segun el nombre del modelo base). Sobre ese checkpoint, el autor aplico poda one-shot con el codigo oficial de SparseGPT (IST-DASLab/sparsegpt, commit 147d215, modo `fasterprune`, blocksize 128, damping 0.01).

La calibracion se realizo con el cargador oficial, 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, calibrando cada bloque sobre las salidas de los bloques ya podados, siguiendo el esquema de los drivers oficiales. El recorrido de capas es codigo nuevo del autor, ya que los drivers oficiales solo soportan OPT y LLaMA; la matematica de poda es la del codigo oficial. La poda se ejecuto en bfloat16 y tardo 4,2 minutos en una A100 de 40 GB. El umbral se aplica por bloque de 128 columnas, por lo que las filas resultantes tienen distinto numero de ceros: en las 240 capas podadas, la fila mas densa tiene de media 2,74 veces los no-ceros de la fila media (peor capa: 6,95x). No hubo reentrenamiento, destilacion ni recuperacion de precision posterior.

## Capacidades

- Generacion de texto autoregresiva: hereda la capacidad del modelo base, aunque severamente degradada por la poda.
- Razonamiento y conocimiento factual: muy mermados; la precision zero-shot media cae de 0,5123 a 0,3288.
- Codigo y matematicas: no disponible (no se han publicado evaluaciones especificas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Carga requiere `flash-linear-attention` instalado (`import fla`) junto con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Linea base para investigacion en poda: sirve como referencia negativa para medir la mejora de tecnicas como EHWS, poda estructurada o poda con recuperacion, comparando perplejidad y zero-shot bajo el mismo protocolo (ELSA, lm-evaluation-harness).
- Estudio de degradacion por sparsity extrema: permite analizar como afecta una sparsity no estructurada del 90 % a una arquitectura de atencion lineal frente a transformers clasicos.
- Validacion de herramientas de poda: util para comprobar la reproducibilidad de SparseGPT sobre arquitecturas distintas de OPT/LLaMA, dado que el autor aporta el recorrido de capas nuevo.
- Analisis de desequilibrio por filas: el modelo permite estudiar el efecto del umbral por bloque de 128 columnas y del desbalanceo de no-ceros (hasta 6,95x en la peor capa) sobre la calidad.
- Benchmarking de kernels sparse: puede emplearse para probar kernels de inferencia dispersa o comparar throughput denso frente a sparse en GatedDeltaNet.
- Docencia y divulgacion: ejemplo reproducible de poda one-shot con resultados publicados (perplejidad, tareas zero-shot) para explicar los limites del pruning sin reentrenamiento.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni despliegues reales: la perplejidad en WikiText-2 (768,16) y C4 (468,85) hace inviable su uso practico.

## Benchmarks y rendimiento

Perplejidad con protocolo ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Dense (base) | 10,31 | 13,76 |
| Este modelo | 768,16 | 468,85 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Dense | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2031 |
| arc_easy | 0,7222 | 0,2698 |
| boolq | 0,6159 | 0,3786 |
| hellaswag | 0,4629 | 0,2633 |
| openbookqa | 0,2920 | 0,1520 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5075 |
| Media | 0,5123 | 0,3288 |

Sparsity medida sobre los pesos: 0,9000. Desbalanceo por filas: media de 2,74x en la fila mas densa respecto a la media (peor capa 6,95x) en las 240 capas podadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,9 GB en bfloat16 (pesos) mas overhead de activaciones y cache de estado recurrente; en la practica, entre 4 y 6 GB segun longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100 40 GB o H100 para evaluacion a gran escala y calibracion.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: requiere `flash-linear-attention` (`import fla`) y `AutoModelForCausalLM.from_pretrained`. No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que la arquitectura no es transformer estandar, el soporte en esos runners es dudoso y no esta documentado.
- Latencia y throughput: no disponibles. La poda no estructurada no garantiza aceleracion en hardware denso sin kernels especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (90 % sparse) | 1,466B | no disponible | 768,16 | no disponible | Hugging Face |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | ~1,3B | no disponible | 10,31 | no disponible | Hugging Face |
| Otros modelos EHWS de ikimyaii | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados en la model card) |

No se dispone de datos de benchmarks de los modelos EHWS ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad se multiplica por mas de 70 en WikiText-2 y por mas de 34 en C4 respecto al modelo denso.
- Perdida de conocimiento factual y razonamiento: la media zero-shot cae 18,35 puntos porcentuales (de 0,5123 a 0,3288).
- Desequilibrio de sparsity por filas: el umbral por bloque de 128 columnas produce filas con hasta 6,95x los no-ceros de la media, lo que puede generar inestabilidad en ciertas capas.
- Sin reentrenamiento ni recuperacion: no se aplico destilacion ni fine-tuning, por lo que los errores de poda no se corrigen.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure.
- Idiomas no documentados: no hay informacion sobre cobertura multilingue.
- Riesgo de alucinacion elevado: la degradacion de perplejidad sugiere alta probabilidad de texto incoherente.
- Dependencia de `flash-linear-attention`: sin esa libreria el modelo no carga correctamente.
- No apto para produccion: es un artefacto de investigacion, no un modelo desplegable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-90pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
