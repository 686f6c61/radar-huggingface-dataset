# ikimyaii/HGRN-340M-semi-structured-ELSA-70pct

## Resumen

HGRN-340M-semi-structured-ELSA-70pct es un modelo de lenguaje derivado de m-a-p/340M-20B-HGRN-pure-baseline, un transformer con capas HGRN (Hierarchically Gated Recurrent Network) de 341 millones de parametros entrenado sobre 20.000 millones de tokens. El modelo ha sido podado por el autor ikimyaii mediante ELSA, una tecnica de poda semi-estructurada basada en ADMM, hasta alcanzar un 70% de esparsidad en todas las capas lineales internas de los bloques. El resultado es un checkpoint de investigacion orientado a estudiar el compromiso entre eficiencia computacional y calidad del lenguaje en arquitecturas recurrentes lineales.

La relevancia de este checkpoint es metodologica: sirve como linea base densa-podada para una familia de modelos denominados EHWS en la misma cuenta, y documenta de forma transparente el coste en perplejidad y en tareas de razonamiento cero-disparo al aplicar una poda agresiva con proyeccion por filas. La esparsidad resultante es perfectamente equilibrada por fila (168 capas verificadas), lo que la hace atractiva para kernels de decodificacion dispersa con carga uniforme.

No se trata de un modelo listo para produccion: la perplejidad en WikiText-2 pasa de 21,96 a 39,93 y la media de tareas cero-disparo cae de 0,4400 a 0,3952. Su interes es experimental, no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas HGRN (recurrentes lineales con puertas jerarquicas) |
| Parametros totales | 341.148.672 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Esparsidad | 70% semi-estructurada (0,6994 medida; 30% superior por fila) |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base m-a-p/340M-20B-HGRN-pure-baseline: un transformer de 340 millones de parametros con capas HGRN, un tipo de red recurrente lineal con compuertas jerarquicas que sustituye la atencion cuadratica por recurrencias de coste lineal. El prefijo "20B" del nombre del base indica que fue entrenado con 20.000 millones de tokens. No se dispone de informacion detallada sobre la composicion del dataset de preentrenamiento ni sobre si hubo fases de RLHF o DPO.

La poda se realizo con el codigo oficial de ELSA (arXiv:2510.01650) usando los hiperparametros del run propio de ELSA sobre HGRN-1.3B al 80%, sin modificarlos: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 con acumulacion de 8, learning rate 2e-4, lambda 0,01, precision bf16 y 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo, semilla 0. El entrenamiento completo consumio 2,11 horas en una unica A100 de 40 GB. La innovacion clave es la proyeccion por filas (`--admm_comparison_group=row`), una opcion anadida por el autor sobre el codigo de ELSA que fuerza a que cada fila de cada capa lineal podada conserve exactamente el mismo numero de pesos (el 30% superior). Se podan todas las capas lineales dentro de los bloques; los embeddings y el lm_head permanecen densos.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base; no hay evidencia de capacidades multilingues.
- Razonamiento basico y respuesta a preguntas de sentido comun, con degradacion notable respecto al denso (ver benchmarks).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de pensamiento explicito.
- La esparsidad uniforme por fila permite, en principio, kernels de inferencia dispersa con balance de carga perfecto, aunque no se proporcionan implementaciones de inferencia optimizada.

## Casos de uso

- Investigacion sobre poda semi-estructurada: sirve como punto de comparacion reproducible para estudiar el efecto de la proyeccion por filas frente a la poda no estructurada, ya que el autor publica hiperparametros exactos y tiempo de ejecucion.
- Estudio de kernels dispersos: al tener todas las filas el mismo numero de no ceros en las 168 capas podadas, es un banco de pruebas ideal para validar kernels de SpMM o de decodificacion dispersa con carga uniforme.
- Linea base en experimentos de destilacion o recuperacion: util para medir cuanto se puede recuperar de un modelo al 70% de poda mediante fine-tuning posterior.
- Analisis de degradacion por tarea: permite estudiar que tareas (arc_easy, openbookqa) son mas sensibles a la poda que otras (rte, boolq) en arquitecturas recurrentes lineales.
- Prototipado en entornos con recursos muy limitados: con 341M de parametros y pesos dispersos, puede ejecutarse en GPU de consumo para pruebas de concepto, aunque sin garantias de calidad.
- Reproduccion de resultados academicos: el checkpoint permite verificar las cifras de perplejidad y cero-disparo reportadas por el autor sin reejecutar el pipeline de poda de 2,11 horas.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, fp16, ejecucion unica):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (70% poda) | 39,93 | 32,75 |

Precision cero-disparo (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2125 |
| arc_easy | 0,6153 | 0,4895 |
| boolq | 0,6028 | 0,5844 |
| hellaswag | 0,3423 | 0,3011 |
| openbookqa | 0,2380 | 0,1620 |
| rte | 0,5126 | 0,5235 |
| winogrande | 0,5059 | 0,4933 |
| Media | 0,4400 | 0,3952 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 0,7 GB solo para pesos (341M parametros), mas overhead de activaciones y cache; en la practica, menos de 2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- GPU recomendadas para experimentacion: A100 40GB (usada por el autor para la poda) o cualquier GPU con al menos 4 GB para inferencia.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y al tratarse de pesos safetensors dispersos probablemente requieran conversion previa.
- Latencia y throughput: no disponibles. La ventaja teorica de la esparsidad solo se materializa con kernels dispersos especificos, que no se proporcionan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media cero-disparo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (70% poda) | 341M | No disponible | 0,3952 | No disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 341M | No disponible | 0,4400 | No disponible | Hugging Face |
| HGRN-1.3B (referencia de ELSA al 80%) | 1,3B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados de otros modelos podados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion clara de calidad: la perplejidad en WikiText-2 casi se duplica (21,96 a 39,93) y la precision media cero-disparo cae 4,5 puntos.
- Tareas especialmente afectadas: openbookqa (0,2380 a 0,1620) y arc_easy (0,6153 a 0,4895); rte es la unica que mejora ligeramente (0,5126 a 0,5235), probablemente por ruido.
- Riesgo elevado de alucinacion y respuestas incoherentes en generacion libre, dada la poda agresiva y el tamano reducido del modelo base.
- Sesgos conocidos: no documentados, pero hereda los del corpus de preentrenamiento del modelo base, no especificado.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo base parece orientado a ingles.
- Licencia no especificada: no hay garantia de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Restricciones tecnicas: requiere `flash-linear-attention`; los pesos dispersos pueden no ser compatibles con herramientas de inferencia estandar sin conversion.
- Ejecucion unica de evaluacion: los numeros de benchmarks provienen de una sola tirada, sin intervalos de confianza.
- El articulo de ELSA no reporta el ajuste de proyeccion por filas, por lo que este resultado no esta validado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-ELSA-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650
