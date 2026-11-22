# BigFamTLLM/da-cpt5-anneal

## Resumen

da-cpt5-anneal es un modelo de lenguaje de 2.115.305.088 parametros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un checkpoint intermedio de un experimento de adaptacion linguistica: parte de un modelo entrenado desde cero en danes (da-base) y se adapta al noruego mediante el cambio del tokenizador, entrenamiento solo de embeddings y preentrenamiento continuado sobre texto noruego. Este modelo concreto corresponde al checkpoint 5 de 10 del preentrenamiento continuado (paso 24.300 de 48.600), seguido de una fase de annealing de 916 pasos adicionales sobre texto de alta calidad en bokmal y nynorsk.

El modelo emplea la arquitectura Qwen3 (transformer decoder-only denso) con 36 capas, tamano oculto 2176, 34 cabezas de atencion y 17 cabezas KV, con embeddings atados (tied embeddings). Su longitud de contexto es de 4096 tokens y el tokenizador es especifico para noruego con un vocabulario de 32k. Ha visto 13.740 millones de tokens noruegos durante el entrenamiento, con una mezcla del 85% bokmal y 15% nynorsk, procedente del corpus HPLT 4.0.

Es relevante como pieza de un estudio controlado y reproducible sobre adaptacion cross-linguistica (danes a noruego) y sobre el efecto del annealing en modelos pequenos. No es un modelo de proposito general: es un modelo base sin ajuste por instrucciones, con 0 descargas y 0 likes en el momento de la consulta, y el propio autor lo declara no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3): 36 capas, hidden size 2176, 34 cabezas de atencion, 17 cabezas KV, tied embeddings |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el autor solo documenta carga en bfloat16) |
| Idiomas soportados | Noruego (bokmal y nynorsk); tags: da, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers; conversion con Megatron-Bridge) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen3, con 36 capas, dimension oculta de 2176, 34 cabezas de atencion con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizo con Megatron-LM sobre 8 GPUs GH200 en el cluster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW, learning rate maximo de 5e-4 con 2000 pasos de warmup y sin decaimiento (1e-4 en la etapa de solo embeddings). Los pesos se convirtieron a formato Hugging Face con Megatron-Bridge y las configuraciones se ajustaron para cargar en transformers 4.x.

El proceso de adaptacion tiene tres fases documentadas: (1) sustitucion del tokenizador danes por uno noruego de 32k, donde los tokens compartidos conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo; (2) 1000 pasos de entrenamiento solo de embeddings; y (3) preentrenamiento continuado sobre noruego hasta el paso 24.300 (checkpoint 5 de 10), con 13.740 millones de tokens noruegos vistos en total. Sobre ese checkpoint se aplica el annealing: 916 pasos adicionales (0,48B tokens) sobre texto de alta calidad en bokmal y nynorsk con decaimiento lineal del learning rate hasta 0. Los datos provienen de HPLT 4.0, con una mezcla del 85% bokmal y 15% nynorsk.

## Capacidades

- Generacion de texto en noruego bokmal y nynorsk, con especial enfasis en completar texto y continuar secuencias.
- Comprension lectora y respuesta a tareas de conocimiento del mundo en noruego, evaluadas en NorEval 1.1.
- Ortografia noruega: el modelo alcanza 0,855 de exactitud en la tarea de ortografia de NorEval (0-shot).
- Capacidad multilingue limitada: los tags declaran danes (da), noruego generico (no), bokmal (nb) y nynorsk (nn); no hay evidencia documentada de otras lenguas.
- No es un modelo instruido: no soporta de forma nativa tool calling, function calling, agentes ni razonamiento multi-paso, ya que es un modelo base sin ajuste por instrucciones.
- No dispone de modo thinking, vision ni audio.
- Robustez ante ruido documentada: 0,385 en entrada limpia y una caida media de 0,039 bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigacion en adaptacion cross-linguistica: sirve como punto de comparacion controlado frente a da-cpt5 (sin annealing) y frente a los modelos no-base entrenados desde cero, para medir el efecto del annealing en un presupuesto fijo.
- Experimentos de tokenizacion: util para estudiar el impacto del cambio de tokenizador (32k noruego) y de la inicializacion de embeddings nuevos a partir de la media de piezas del tokenizador antiguo.
- Evaluacion de modelos pequenos en noruego: con 2,12B parametros y contexto de 4096, es adecuado para reproducir NorEval 1.1 en entornos academicos con recursos limitados.
- Generacion de texto en bokmal y nynorsk como modelo base: puede usarse para completar texto o como punto de partida para fine-tuning supervisado en tareas concretas de noruego.
- Estudio de robustez: las variantes con ruido de tres tareas de NorEval permiten analizar la degradacion del modelo bajo perturbaciones.
- Baseline en pipelines de investigacion: integrable en transformers con `AutoModelForCausalLM` y `dtype=torch.bfloat16`, util como referencia en experimentos de preentrenamiento continuado.
- Docencia: forma parte de un conjunto de 50 modelos del curso IN5640, pensado para comparaciones sistematicas entre arquitecturas y estrategias de adaptacion.

## Benchmarks y rendimiento

NorEval 1.1, resultados publicados por el autor:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,245 | 0,276 |
| nob_orthography | acc | 0,855 | 0,862 |
| nob_reading | f1 | 0,244 | 0,252 |
| nob_world | acc | 0,297 | 0,299 |
| nno_language | em_first | 0,499 | 0,562 |
| nno_world | acc | 0,315 | 0,314 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,385 en entrada limpia y -0,039 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos (el repo ocupa 4,2 GB), mas overhead de activaciones y cache KV; en la practica, entre 5 y 6 GB con contexto corto.
- En cuantizacion de 8 bits, la huella de pesos se reduce a unos 2,1 GB; en 4 bits, a unos 1,1 GB (estimacion a partir del numero de parametros, no documentada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o GH200 para entrenamiento y evaluacion a gran escala.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante) en bfloat16 con contexto moderado.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama o vLLM no estan documentados para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| da-cpt5-anneal | 2,12B | 4096 | Noruego (nb, nn), danes | no disponible | Checkpoint 5 con annealing; resultados NorEval publicados |
| da-cpt5 | 2,12B | 4096 | Noruego (nb, nn), danes | no disponible | Mismo checkpoint sin annealing; permite aislar el efecto del annealing |
| no-base-anneal | no disponible | no disponible | Noruego | no disponible | Entrenado desde cero en noruego, con annealing; mismo presupuesto y arquitectura |
| da-base-anneal | no disponible | no disponible | Danes | no disponible | Entrenado desde cero en danes, con annealing; origen de la cadena de adaptacion |

La comparacion con modelos externos de la misma categoria (por ejemplo, modelos noruegos de 2B de otros autores) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin fine-tuning adicional.
- El propio autor advierte que son modelos de investigacion entrenados con texto web y que pueden producir salidas erroneas u ofensivas; no estan pensados para produccion.
- Riesgo de alucinacion y de reproducir sesgos presentes en HPLT 4.0, un corpus web sin filtrado documentado en la ficha.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica restringida a noruego (bokmal y nynorsk) y, por herencia, danes; sin capacidades documentadas en otras lenguas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Sin datos de cuantizacion ni de despliegue en motores de inferencia de alto rendimiento (vLLM, llama.cpp), lo que limita su uso en produccion.
- Rendimiento bajo en tareas de conocimiento del mundo (0,297 en nob_world 0-shot) y de lectura (0,244 de F1), coherente con su tamano y su naturaleza de modelo base.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt5-anneal
- Modelo base (sin annealing): https://huggingface.co/BigFamTLLM/da-cpt5
- Modelo de origen danes: https://huggingface.co/BigFamTLLM/da-base
- Version con annealing del modelo de origen: https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Version con annealing del modelo noruego: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingue desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Version con annealing del modelo multilingue: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Checkpoints de preentrenamiento continuado (del 1 al 10): https://huggingface.co/BigFamTLLM/da-cpt1, https://huggingface.co/BigFamTLLM/da-cpt2, https://huggingface.co/BigFamTLLM/da-cpt3, https://huggingface.co/BigFamTLLM/da-cpt4, https://huggingface.co/BigFamTLLM/da-cpt5, https://huggingface.co/BigFamTLLM/da-cpt6, https://huggingface.co/BigFamTLLM/da-cpt7, https://huggingface.co/BigFamTLLM/da-cpt8, https://huggingface.co/BigFamTLLM/da-cpt9, https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints con annealing (del 1 al 10): https://huggingface.co/BigFamTLLM/da-cpt1-anneal, https://huggingface.co/BigFamTLLM/da-cpt2-anneal, https://huggingface.co/BigFamTLLM/da-cpt3-anneal, https://huggingface.co/BigFamTLLM/da-cpt4-anneal, https://huggingface.co/BigFamTLLM/da-cpt5-anneal, https://huggingface.co/BigFamTLLM/da-cpt6-anneal, https://huggingface.co/BigFamTLLM/da-cpt7-anneal, https://huggingface.co/BigFamTLLM/da-cpt8-anneal, https://huggingface.co/BigFamTLLM/da-cpt9-anneal, https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Corpus HPLT 4.0: no disponible (enlace no proporcionado en la informacion)
- Paper o blog del proyecto: no disponible en la informacion proporcionada
