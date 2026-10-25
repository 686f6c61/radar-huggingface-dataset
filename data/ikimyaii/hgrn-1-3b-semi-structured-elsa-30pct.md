# ikimyaii/HGRN-1.3B-semi-structured-ELSA-30pct

## Resumen

HGRN-1.3B-semi-structured-ELSA-30pct es un checkpoint de 1.364.396.032 parametros publicado por el usuario ikimyaii en HuggingFace. No es un modelo entrenado desde cero, sino el resultado de podar el modelo base fla-hub/hgrn-1.3B-100B (un HGRN de 1,3 B de parametros entrenado sobre 100.000 millones de tokens) hasta un 30 % de esparsidad semi-estructurada mediante ELSA, la herramienta oficial del paper arXiv:2510.01650. El resultado es un modelo denso en embeddings y lm_head, pero con todas las capas lineales internas de los bloques podadas por filas.

El interes del checkpoint es fundamentalmente metodologico: sirve como baseline reproducible para comparar tecnicas de poda (en la misma cuenta existen variantes EHWS con esparsidades del 70 % y 80 %). La poda es semi-estructurada a nivel de fila: cada fila de cada capa podada conserva exactamente el mismo numero de pesos (el 70 % superior), de modo que el trabajo por fila queda perfectamente balanceado. La esparsidad medida sobre los pesos publicados es 0,2998 y se ha verificado sobre las 168 capas podadas.

Arquitectonicamente hereda el diseno HGRN (Hierarchically Gated Recurrent Neural Network, NeurIPS 2023 spotlight): una RNN lineal con puerta de olvido jerarquica, sin atencion y con coste lineal en la longitud de secuencia. El autor reporta perplejidad de 17,25 en WikiText-2 y 17,64 en C4 con la evaluacion propia de ELSA en fp16, en una unica ejecucion. No hay datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K), ni de licencia, idiomas o ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Neural Network), RNN lineal con puerta de olvido jerarquica, sin atencion |
| Parametros totales | 1.364.396.032 (~1,36 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el proceso de poda usa secuencias de 2.048 tokens; la model card no declara ventana de contexto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el corpus de poda es C4, mayoritariamente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 30 % semi-estructurada por filas (medida: 0,2998; 168 capas podadas) |
| Modelo base | fla-hub/hgrn-1.3B-100B (fine-tune/poda) |
| Tamano del repositorio | 5,5 GB |
| Requisitos de carga | `flash-linear-attention` instalado (`import fla`) y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN, presentada como spotlight en NeurIPS 2023: una red recurrente lineal en la que cada capa aplica una puerta de olvido con cotas inferiores jerarquicas, lo que permite modelar dependencias a varias escalas sin atencion cuadratica. El coste de inferencia es lineal en la longitud de la secuencia y el estado recurrente sustituye a la cache KV, lo que reduce la memoria necesaria durante la generacion frente a un transformer equivalente. La implementacion depende de la libreria flash-linear-attention (FLA), motivo por el que la carga exige `trust_remote_code=True`. El modelo base se entreno sobre 100.000 millones de tokens, segun indica su identificador.

La poda se realizo con el `main.py` oficial de ELSA y los mismos hiperparametros del run HGRN-1.3B al 80 % de los autores, sin cambios entre modelos y niveles de esparsidad: 4.096 pasos ADMM, un paso z cada 32 pasos, batch de 1 con acumulacion de 8, learning rate 2e-4, lambda 0,01, precision bf16, 32.768 secuencias de C4 de 2.048 tokens (unos 67 millones de tokens) y semilla 0. La proyeccion ELSA se aplico con `--admm_comparison_group=row`, que fuerza a que todas las filas conserven el mismo numero de no ceros. El proceso completo tardo 5,55 horas en una unica A100 de 40 GB. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional.

## Capacidades

- Generacion de texto autoregresiva en ingles principalmente, heredada del modelo base HGRN-1.3B-100B; no se han publicado evaluaciones de calidad mas alla de la perplejidad.
- Modelado de secuencias con coste lineal: adecuado para flujos largos o streaming, ya que el estado recurrente es de tamano constante.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Capacidades multilingues: no disponibles; el corpus de poda (C4) es mayoritariamente anglofono.
- Capacidad destacable: patron de esparsidad balanceado por filas, pensado para experimentacion con kernels sparse y comparacion de tecnicas de compresion.

## Casos de uso

- Baseline de investigacion en poda: punto de referencia para medir la degradacion de tecnicas como EHWS (variantes al 70 % y 80 % en la misma cuenta) sobre el mismo modelo base y los mismos hiperparametros de ELSA, con perplejidad directamente comparable.
- Reproduccion de experimentos de compresion: el autor documenta semilla, pasos ADMM, learning rate, batch y horas de GPU, lo que permite replicar el run completo en una sola A100 40 GB en aproximadamente 5,5 horas.
- Fine-tuning de bajo coste en dominio especifico: con ~2,7 GB de pesos en bf16 cabe en cualquier GPU consumer de 8 GB o mas, lo que facilita adaptar el modelo a un corpus propio sin infraestructura dedicada.
- Prototipado de generacion de texto en local: util para iterar sobre pipelines de inferencia (prompting, decodificacion, post-procesado) antes de escalar a modelos mayores.
- Experimentacion con kernels sparse: el patron row-wise balanceado permite validar implementaciones que asumen el mismo numero de no ceros por fila, comprobando el equilibrio de carga real sobre las 168 capas podadas.
- Despliegue en entornos con memoria limitada o CPU: al no necesitar cache KV y tener coste lineal por token, encaja en escenarios de inferencia secuencial larga donde un transformer 1B requeriria memoria creciente.
- Docencia y divulgacion: ejemplo compacto y reproducible de un pipeline completo de poda ADMM semi-estructurada sobre un modelo open source.

## Benchmarks y rendimiento

Unica metrica publicada: perplejidad con la evaluacion propia de ELSA (sus conjuntos de test de WikiText-2 y C4, fp16), en una unica ejecucion.

| Modelo | Tipo de esparsidad | WikiText-2 (ppl) | C4 (ppl) |
|---|---|---|---|
| HGRN-1.3B-semi-structured-ELSA-30pct | semi-estructurada (row-wise, 30 %) | 17,25 | 17,64 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Tampoco se aporta la perplejidad del modelo base denso ni de las variantes al 70 %/80 %, por lo que no es posible cuantificar la perdida atribuible a la poda con los datos disponibles.

## Requisitos de hardware

- VRAM estimada en bf16: ~2,7 GB solo para pesos; con overhead de activaciones y estado recurrente, un presupuesto practico de 3-4 GB es suficiente.
- VRAM estimada en fp32: ~5,46 GB de pesos (el repositorio ocupa 5,5 GB, consistente con fp32 o con copias duplicadas de los tensores).
- VRAM estimada en int8: ~1,4 GB; en int4: ~0,7 GB, aunque no se publican pesos cuantizados y requeriria conversion propia.
- GPU recomendadas: cualquier GPU con >= 8 GB para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10). El run de poda se ejecuto en una A100 40 GB, pero la inferencia no requiere esa capacidad.
- Cabe holgadamente en GPU consumer; tambien es viable en CPU, aunque sin datos de latencia publicados.
- Opciones de despliegue: `transformers` + `flash-linear-attention` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` es la unica via documentada. No se confirma soporte en vLLM, TGI, llama.cpp u Ollama; requeriria conversion a GGUF y soporte de la arquitectura HGRN en el runtime.
- Latencia y throughput: no disponibles. La ventaja teorica es el coste lineal por token y un estado recurrente de tamano constante, pero el ahorro real de la esparsidad row-wise depende de kernels propios, ya que el patron no es 2:4 y no se acelera con los tensor cores sparse de Ampere/Hopper.

## Comparativa con modelos similares

| Modelo | Parametros | Esparsidad | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| HGRN-1.3B-semi-structured-ELSA-30pct (este) | 1,36 B | 30 % row-wise | no disponible | no disponible | WikiText-2 ppl 17,25; C4 ppl 17,64 |
| fla-hub/hgrn-1.3B-100B (base) | ~1,3 B | densa | no disponible | no disponible | Entrenado con 100 B tokens; referencia densa del mismo autor |
| ikimyaii/HGRN-1.3B-semi-structured-ELSA-70pct | ~1,3 B | 70 % row-wise | no disponible | no disponible | Mismo pipeline ELSA; run de 4,95 h en A100 40 GB; perplejidad no disponible en la informacion consultada |
| ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct | ~1,3 B | 80 % (EHWS) | no disponible | no disponible | Variante EHWS; perplejidad no disponible en la informacion consultada |

No hay datos publicados que permitan comparar este checkpoint con transformers de tamano similar (por ejemplo, modelos de la familia Llama de ~1 B o TinyLlama): no existen resultados de benchmarks estandar ni evaluaciones de calidad que hagan la comparacion significativa. Cualquier comparacion se limita, por tanto, a la familia HGRN del mismo autor.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- Modelo de investigacion sin publico: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de calidad.
- Solo se reporta perplejidad, en una unica ejecucion y con una unica semilla (0). No hay evaluaciones de razonamiento, codigo, matematicas ni instrucciones.
- No se aporta la perplejidad del modelo denso de referencia, por lo que no se puede aislar cuanto degrada la poda al 30 %.
- Sesgos conocidos: no documentados. El corpus de poda es C4, mayoritariamente ingles, lo que probablemente sesga el comportamiento hacia ese idioma y hacia sus sesgos de dominio web.
- Riesgo de alucinacion: inherente a un modelo de lenguaje de 1,3 B sin fase de alineacion documentada; no se ha evaluado factualidad.
- Limitaciones de contexto e idioma: no se declara ventana de contexto; el entrenamiento de poda usa secuencias de 2.048 tokens.
- Dependencia tecnica fuerte: requiere instalar flash-linear-attention y confiar en codigo remoto (`trust_remote_code=True`), lo que anade superficie de riesgo y complica el despliegue en stacks estandar.
- La esparsidad row-wise no es compatible con los formatos 2:4 acelerados por hardware; el beneficio practico exige kernels sparse especificos y no esta cuantificado.
- El checkpoint esta pensado como baseline comparativo dentro de una serie de experimentos, no como modelo listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-30pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Variante al 70 % de esparsidad: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-70pct
- Variante EHWS ALPS fase 1 al 80 %: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct
- Repositorio oficial de HGRN (OpenNLPLab): https://github.com/OpenNLPLab/HGRN
- Ficha de terceros del baseline denso: https://llm-explorer.com/model/ikimyaii%2Fhgrn-1.3B-dense-baseline,7LYYStHHXgTcslfsAFK4Gl
