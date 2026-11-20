# ikimyaii/Mamba-370M-unstructured-ELSA-80pct

## Resumen
Mamba-370M-unstructured-ELSA-80pct es un modelo derivado de state-spaces/mamba-370m-hf, publicado por el usuario ikimyaii en Hugging Face, que aplica una poda no estructurada del 80 % mediante el codigo oficial del metodo ELSA (paper arXiv:2510.01650). No se trata de un modelo entrenado desde cero, sino de una variante dispersa del Mamba-370M original, pensada como referencia base para comparar frente a los modelos EHWS publicados en la misma cuenta. Su interes es metodologico: permite estudiar como se degrada un modelo de estado (SSM) cuando se eliminan por magnitud el 80 % de los pesos lineales de sus bloques.

El modelo conserva la arquitectura Mamba original (SSM selectivo, sin atencion) con 423.003.136 parametros totales segun los pesos safetensors. La poda afecta a las capas lineales internas de cada bloque (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos. La dispersion medida sobre los pesos finales es de 0,7842, ligeramente por debajo del 80 % nominal, y las filas no estan balanceadas.

Es relevante ahora porque la literatura sobre compresion de SSM es mucho menos madura que la de transformers, y este artefacto documenta de forma reproducible una receta concreta (ADMM con ELSA) aplicada a Mamba, con perplexity y resultados zero-shot publicados. No obstante, los numeros reportados son muy pobres: la perplexity en WikiText-2 es de 343,04, lo que indica una degradacion severa respecto al modelo denso de referencia, y la media zero-shot es 0,3197.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, sin atencion) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Mamba-370M se entrena con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (solo se menciona carga en bf16; fp16 provoca desbordamiento en Mamba) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga con `AutoModelForCausalLM.from_pretrained` en `transformers`) |

## Arquitectura y entrenamiento
La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo en el que las matrices de transicion dependen de la entrada, lo que sustituye la atencion cuadratica por un mecanismo recurrente de coste lineal en la longitud de secuencia. El checkpoint parte de state-spaces/mamba-370m-hf y no ha sido reentrenado: la unica transformacion es la poda.

El procedimiento de poda sigue el codigo oficial de ELSA (`main.py`) con los hiperparametros del run HGRN-1.3B @80 % del propio paper, sin cambios entre modelos y niveles de dispersion: 4.096 pasos ADMM, paso z cada 32 pasos, batch 1 x 8 de acumulacion, lr 2e-4, lambda 0,01, precision bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizer del modelo y semilla 0. El run completo tardo 2,85 horas en una A100 de 40 GB. La poda es no estructurada con un unico umbral de magnitud por capa, de modo que las filas resultantes tienen distinto numero de ceros; se aplica a las capas lineales de cada bloque y se mantienen densos `dt_proj` (aproximadamente el 2 % de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, embeddings y `lm_head`.

## Capacidades
- Generacion de texto autoregresiva basica mediante `AutoModelForCausalLM`, con la API estandar de `transformers`.
- Razonamiento y conocimiento factual muy degradados: la perplexity en WikiText-2 de 343,04 y la media zero-shot de 0,3197 indican que la poda destruye buena parte de la capacidad del modelo denso.
- Codigo y matematicas: no hay evidencia de resultados en HumanEval, GSM8K ni tareas equivalentes en la informacion disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- El modelo es util principalmente como referencia de ablation y como objeto de estudio de compresion, no como modelo de produccion.

## Casos de uso
- Referencia base para ablations de poda: sirve como linea base frente a los modelos EHWS de la misma cuenta, permitiendo medir si tecnicas de dispersion estructurada o hardware-aware superan esta receta no estructurada.
- Investigacion sobre compresion de SSM: permite estudiar como se distribuyen los no-ceros por fila (la fila mas densa tiene de media 1,82 veces los no-ceros de la fila media, y en la peor capa 3,16 veces) y correlacionarlo con la perdida de perplexity.
- Reproducibilidad de ELSA sobre Mamba: al usar exactamente los hiperparametros del run HGRN-1.3B del paper, facilita replicar y auditar el metodo sobre una familia de modelos distinta de la original.
- Docencia y divulgacion: ilustra de forma concreta el impacto de la poda agresiva no estructurada en un modelo de 423 M de parametros con un coste de entrenamiento de menos de 3 horas en una A100.
- Experimentos de decodificacion en bf16: la model card advierte que Mamba desborda en fp16, por lo que cualquier pipeline de inferencia debe fijar bf16 como precision minima.
- Analisis de eficiencia teorica de kernels dispersos: la dispersion no estructurada medida (0,7842) es un caso de prueba para kernels que explotan sparse patterns irregulares.

## Benchmarks y rendimiento
Perplexity segun el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, calculada en bf16):

| Metrica | Este modelo |
|---|---|
| WikiText-2 (perplexity) | 343,04 |
| C4 (perplexity) | 168,08 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,1749 |
| arc_easy | 0,2782 |
| boolq | 0,3777 |
| hellaswag | 0,2588 |
| openbookqa | 0,1120 |
| rte | 0,5271 |
| winogrande | 0,5091 |
| Media | 0,3197 |

Dispersion de las capas podadas medida sobre estos pesos: 0,7842. No se han publicado resultados del modelo denso de referencia ni de alternativas en la informacion disponible, por lo que no se puede presentar una comparativa numerica fiable.

## Requisitos de hardware
- Un modelo de 423 M de parametros en bf16 ocupa aproximadamente 0,85 GB de VRAM solo para los pesos; con overhead de activaciones y cache, cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU con soporte bf16 (A100, H100, RTX 4090, RTX 3090, RTX 4080, L4, etc.). El run de poda se hizo en una A100 de 40 GB, pero la inferencia no requiere esa capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con bf16; tambien podria ejecutarse en CPU, aunque Mamba requiere kernels especificos para buen rendimiento.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es el camino documentado en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad de estos con checkpoints Mamba podados no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo reporta el tiempo de poda (2,85 horas en A100 40 GB), no metricas de inferencia.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Dispersion | Perplexity WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Mamba-370M-unstructured-ELSA-80pct | 423 M | no disponible | 78,42 % no estructurada | 343,04 | no disponible |
| state-spaces/mamba-370m-hf (base denso) | ~370 M (nominal) | no disponible | 0 % | no disponible en la informacion | no disponible |
| Modelos EHWS de la misma cuenta | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados numericos del modelo denso ni de los EHWS en la informacion proporcionada, por lo que la comparacion cuantitativa queda incompleta. Cualitativamente, este checkpoint es una variante podada del base denso y la referencia declarada de los EHWS.

## Limitaciones y advertencias
- Degradacion severa de calidad: perplexity de 343,04 en WikiText-2 y media zero-shot de 0,3197, muy por debajo de lo esperable en un modelo de este tamano; no es apto para uso en produccion.
- Poda no estructurada: no produce patrones regulares (por ejemplo 2:4 o bloques), por lo que no se beneficia directamente de aceleracion en hardware consumer; el ahorro es principalmente de almacenamiento.
- Filas desbalanceadas: la fila mas densa tiene de media 1,82 veces los no-ceros de la fila media y hasta 3,16 veces en la peor capa, lo que complica kernels eficientes y el balanceo de carga.
- Desbordamiento en fp16: la model card advierte explicitamente que Mamba desborda en fp16; hay que usar bf16.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse el repositorio del modelo base.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue.
- Sin datos de tool calling, agentes, codigo ni matematicas: no hay evidencia de estas capacidades.
- Riesgo de alucinacion elevado por la perdida de calidad tras la poda.
- Run unico y sin semillas multiples: los resultados provienen de una sola ejecucion con semilla 0, sin intervalos de confianza.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-ELSA-80pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper de ELSA: https://arxiv.org/abs/2510.01650
