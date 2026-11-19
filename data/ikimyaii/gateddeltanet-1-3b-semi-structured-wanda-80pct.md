# ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-80pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-Wanda-80pct es una variante podada del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. Se trata de un experimento de poda one-shot (sin reentrenamiento) que elimina el 80% de los pesos de todas las capas lineales internas del transformer, manteniendo densas las matrices de embeddings y la cabeza de lenguaje (lm_head). El modelo conserva 1.466.343.808 parametros totales en almacenamiento, aunque la mayoria de las capas internas presentan una dispersion del 79,98%.

La relevancia de esta publicacion es metodologica: sirve como linea base (baseline) para comparar otras tecnicas de poda desarrolladas por el mismo autor (los modelos "EHWS" mencionados en la model card). Utiliza el codigo oficial de Wanda (locuslab/wanda, commit 8e8fc87, rama unstructured con `use_variant=False`), una tecnica de poda por magnitud ponderada por la norma de activaciones (`|W| * sqrt(||X||)`), aplicada capa a capa siguiendo el orden del grafo y calibrando cada bloque sobre las salidas de los bloques ya podados.

El resultado es un modelo con una degradacion severa de calidad: la perplejidad en WikiText-2 pasa de 10,31 a 160,67 y en C4 de 13,76 a 156,07. La precision zero-shot media en lm-evaluation-harness cae de 0,5123 a 0,3286. Es, por tanto, una pieza de investigacion sobre compresion de modelos, no un modelo destinado a produccion. La arquitectura subyacente es GatedDeltaNet, un modelo de estado (SSM hibrido con mecanismos de atencion lineal) entrenado sobre 100B tokens segun el nombre del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (modelo de estado hibrido, transformer con atencion lineal tipo delta) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrena con secuencias de 2.048 tokens en calibracion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure emplea la arquitectura GatedDeltaNet, una variante de atencion lineal con compuertas (gating) que sustituye la atencion cuadratica clasica por un mecanismo de estado recurrente de coste lineal en la longitud de secuencia. El nombre del checkpoint indica un entrenamiento sobre 100B tokens con un tamano de 1.3B parametros. No se dispone de informacion detallada sobre la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales de entrenamiento en la informacion proporcionada.

La intervencion de este checkpoint es exclusivamente de poda. Se aplico Wanda one-shot sin reentrenamiento: calibracion con 128 secuencias de C4 de 2.048 tokens (semilla 0), poda de cada bloque en orden topologico, calibrando cada bloque sobre las salidas de los bloques ya podados, y pesos podados en bfloat16. La poda afecta a todas las capas lineales dentro de los bloques (240 capas verificadas), con dispersion medida de 0,7998 y el mismo numero de no-ceros en cada fila, lo que garantiza equilibrio de trabajo por fila. El proceso completo tardo 1,5 minutos en una A100 de 40 GB. No se aplico destilacion, recuperacion ni ajuste fino posterior.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base, aunque con calidad muy degradada tras la poda.
- Razonamiento y conocimiento factual limitados: la caida de precision zero-shot (de 0,5123 a 0,3286 de media) indica una perdida sustancial de capacidades.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Requiere `flash-linear-attention` instalado (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Linea base para investigacion en poda: sirve como referencia contra la que comparar tecnicas de poda mas sofisticadas (por ejemplo, los modelos EHWS del mismo autor), midiendo perplejidad y precision zero-shot con el mismo protocolo.
- Estudio de la degradacion por dispersion: permite analizar como afecta una dispersion uniforme del 80% por fila a tareas especificas (arc, boolq, hellaswag) y detectar que capacidades son mas fragiles.
- Benchmark de eficiencia en hardware: al tener todas las filas el mismo numero de no-ceros, es util para medir el rendimiento real de kernels de multiplicacion dispersa semi-estructurada sin desequilibrio de carga.
- Reproducibilidad de pipelines de poda: el checkpoint documenta calibracion, orden de capas y commit exacto de Wanda, lo que facilita replicar el experimento en otros modelos.
- Validacion de protocolos de evaluacion: util para contrastar la implementacion de ELSA (perplejidad en WikiText-2/C4) y lm-evaluation-harness frente a otros resultados publicados.
- Docencia y divulgacion: ejemplo concreto de los limites de la poda one-shot agresiva sin reentrenamiento, con numeros medibles de perdida de calidad.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, fp16):

| Conjunto | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 10,31 | 160,67 |
| C4 | 13,76 | 156,07 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,1783 |
| arc_easy | 0,7222 | 0,3165 |
| boolq | 0,6159 | 0,3829 |
| hellaswag | 0,4629 | 0,2746 |
| openbookqa | 0,2920 | 0,1300 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,4909 |
| Media | 0,5123 | 0,3286 |

Dispersion medida en las capas podadas: 0,7998. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,9 GB en bfloat16 (tamano del repo), mas overhead de activaciones y cache de estado; en la practica, unos 4-6 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100 40GB fue la GPU usada para la poda (1,5 minutos).
- Cabe en GPU consumer: si, en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: requiere `flash-linear-attention`; compatible con `AutoModelForCausalLM.from_pretrained`. No hay versiones GGUF/Ollama publicadas. vLLM y TGI no estan confirmados para esta arquitectura.
- Latencia y throughput: no disponibles. La dispersion uniforme por fila (mismo numero de no-ceros en cada fila, 240 capas) facilita el equilibrio de carga en kernels dispersos, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Precision media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Wanda 80%) | 1,47B | no disponible | 160,67 | 0,3286 | no disponible | Hugging Face |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | ~1,3B | no disponible | 10,31 | 0,5123 | no disponible | Hugging Face |
| Otros modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion natural es con su modelo base denso, del que se separa por un factor de aproximadamente 15,6x en perplejidad WikiText-2 y una caida de 0,18 puntos en precision media. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad se multiplica por mas de 15 en WikiText-2 y C4; la precision zero-shot media cae 0,18 puntos.
- Poda one-shot sin reentrenamiento: no hay recuperacion de capacidades, por lo que el modelo no es apto para uso en produccion sin un ajuste fino posterior.
- Riesgo elevado de alucinacion y respuestas incoherentes debido a la perdida de pesos en todas las capas lineales.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar soporte multilingue.
- Dependencia de `flash-linear-attention`: sin esa libreria el modelo no se carga correctamente.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos.
- Contexto maximo no documentado; la calibracion uso secuencias de 2.048 tokens, pero no se confirma el limite real del modelo base.
- Modelo con 0 descargas y 0 likes: sin validacion externa de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
