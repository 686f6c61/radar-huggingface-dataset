# DunkRonit/anlp-a2-part1-mlp

## Resumen

anlp-a2-part1-mlp es un transformer decoder-only entrenado desde cero para traducir vietnamita y japones a ingles. Lo publica el usuario DunkRonit en HuggingFace como parte de un trabajo academico (tag `anlp-assignment`), con un total de 17.011.584 parametros y un unico checkpoint derivado del dataset `belumind/en-vi-ja-curated-500k-triplets`. El modelo se entrena sobre 39.003.133 tokens, un volumen muy reducido que lo situa en la categoria de modelos experimentales mas que de produccion.

La arquitectura es un transformer de solo decodificador con variante de red feed-forward etiquetada como `mlp`. Aunque el repositorio lleva la etiqueta `mixture-of-experts`, la propia model card indica que los parametros activos por token coinciden con los parametros totales (17.011.584), por lo que en la practica se comporta como un modelo denso y no como un MoE con enrutado disperso. La interfaz de uso es una plantilla de prompt con tokens especiales: `<vi> fuente <en>` o `<ja> fuente <en>`, tras lo cual el modelo continua generando el texto en ingles hasta `<eos>`.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como referencia reproducible de un pipeline completo de traduccion entrenado desde cero con presupuesto minimo, y como linea base para comparar variantes de FFN dentro del mismo trabajo. No compite en calidad con sistemas de traduccion neuronales establecidos, y su licencia no esta declarada, lo que limita cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (solo decodificador), variante de FFN `mlp` |
| Parametros totales | 17.011.584 |
| Parametros activos | 17.011.584 (todos activos por token; el tag `mixture-of-experts` no se corresponde con un enrutado disperso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Direccionalidad | traduccion vi -> en y ja -> en (no se documenta en -> vi ni en -> ja) |
| Tokens de entrenamiento | 39.003.133 |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-10-04 (creacion), 2026-10-04 (ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, sin inicializacion a partir de un checkpoint preentrenado. La unica variacion documentada respecto a otras variantes del mismo trabajo es el tipo de bloque feed-forward, identificado como `mlp`, lo que sugiere una comparacion controlada entre alternativas de FFN (por ejemplo, MLP densa frente a variantes con mezcla de expertos) dentro del mismo conjunto de datos y presupuesto de computo. El entrenamiento consume 39.003.133 tokens procedentes del dataset `belumind/en-vi-ja-curated-500k-triplets`, una coleccion de tripletas alineadas en vietnamita, japones e ingles.

No se documenta en la informacion disponible el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la longitud de contexto maxima soportada, la estrategia de tokenizacion ni si se aplicaron tecnicas de ajuste posteriores como RLHF, DPO o instruction tuning. Tampoco se especifica si el entrenamiento se realizo con precision mixta, que optimizador se uso ni el numero total de pasos; el unico artefacto de seguimiento referenciado es una ejecucion de Weights & Biases. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion con ventana deslizante) mas alla de la eleccion del bloque FFN.

## Capacidades

- Traduccion de vietnamita a ingles mediante la plantilla `<vi> fuente <en>`.
- Traduccion de japones a ingles mediante la plantilla `<ja> fuente <en>`.
- Generacion autoregresiva de texto en ingles hasta la emision del token `<eos>`.
- Manejo de dos idiomas de origen distintos con un mismo conjunto de pesos, seleccionables mediante el token de idioma de entrada.
- No hay evidencia documentada de soporte de tool calling, function calling, uso agentico ni razonamiento multi-paso.
- No hay evidencia documentada de capacidades de vision, audio, modo de razonamiento explicito (*thinking mode*) ni generacion de codigo.
- No se documenta ninguna capacidad multilingue mas alla de los tres idiomas declarados.

## Casos de uso

- Linea base academica en investigacion sobre traduccion neuronica: permite reproducir un experimento completo de traduccion vi/ja -> en entrenado desde cero con 39 millones de tokens y comparar variantes de FFN bajo el mismo presupuesto, algo util para articulos sobre eficiencia en regimen de datos limitados.
- Prototipado rapido de demostradores de traduccion: al ocupar 0,1 GB y 17 millones de parametros, se puede cargar en un portatil o en una instancia CPU barata para montar un demo funcional de traduccion vi -> en sin coste de GPU.
- Evaluacion de pipelines de datos paralelos: sirve para comprobar la calidad de un corpus vi-ja-en antes de invertir en el entrenamiento de un modelo mayor, detectando pares mal alineados por la degradacion evidente de la salida.
- Ensenanza de arquitecturas transformer: el modelo es lo bastante pequeno para inspeccionar pesos, capas y comportamiento de atencion en un aula o en un cuaderno de Jupyter, y su carga mediante `Transformer.from_pretrained` simplifica el ejercicio.
- Generacion de datos sinteticos de bajo coste: se puede usar para producir traducciones aproximadas en grandes volumenes que despues se filtren con un modelo de mayor calidad, aprovechando su bajo coste por token.
- Pruebas de cuantizacion y despliegue: con 17 millones de parametros es un candidato comodo para validar flujos de conversion a GGUF, cuantizacion a int8 y despliegue en llama.cpp u Ollama antes de aplicarlos a modelos mayores.
- Traduccion de contenidos no criticos en tiempo real: en escenarios donde el coste y la latencia importan mas que la fidelidad (por ejemplo, previsualizacion de mensajes de usuario), puede ofrecer una primera pasada inmediata en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, COMET ni resultados en tareas estandar como MMLU, HumanEval o GSM8K, y tampoco se aportan numeros de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 68 MB en fp32, 34 MB en fp16/bf16 y 17 MB en int8, calculado a partir de los 17.011.584 parametros. El consumo adicional de memoria en tiempo de ejecucion dependera del tamano de lote y de la longitud de secuencia, que no se documenta.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es mas que suficiente; el modelo cabe sin problema en GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100. La eleccion de GPU resultaria irrelevante frente al cuello de botella de latencia del propio modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en GPU integradas y en CPU. El repositorio de 0,1 GB se puede descargar y mantener en memoria sin dificultad.
- Opciones de despliegue: al publicarse solo safetensors y requerir codigo propio del repositorio de la asignatura (`src.part1.model.Transformer.from_pretrained`), no hay integracion directa documentada con vLLM, llama.cpp, Ollama o TGI. Seria necesario convertir los pesos a GGUF para usarlo con llama.cpp u Ollama. El despliegue mas directo es un script de PyTorch en CPU o GPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera que la generacion sea rapida en CPU, pero la ausencia de datos de longitud de contexto y de arquitectura detallada impide dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part1-mlp | 17.011.584 | vi, ja -> en | no disponible | no disponible | HuggingFace, pesos safetensors |
| Helsinki-NLP/opus-mt-vi-en | alrededor de 74-77 millones | vi -> en | CC-BY-4.0 | no aplica (seq2seq con limite practico de 512 tokens) | HuggingFace, integrado en transformers y en pipelines de traduccion |
| facebook/nllb-200-distilled-600M | alrededor de 600 millones | 200 idiomas, incluidos vi, ja y en | CC-BY-NC-4.0 (uso no comercial) | 512 tokens | HuggingFace, soporte amplio en transformers |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, cobertura idiomatica, licencia y disponibilidad. Conviene senalar que el modelo de este analisis esta tres ordenes de magnitud por debajo de NLLB-200-distilled-600M en numero de parametros y no ha sido preentrenado, por lo que no es esperable una calidad de traduccion comparable.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido (39.003.133 tokens) y ausencia de preentrenamiento: la calidad de traduccion sera limitada y previsiblemente inferior a la de cualquier modelo de traduccion establecido.
- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, por lo que conviene tratar el modelo como no apto para produccion hasta que el autor la especifique.
- Ambiguedad en la etiqueta `mixture-of-experts`: la model card afirma que los parametros activos igualan a los totales, lo que contradice una interpretacion MoE con enrutado disperso. No se debe asumir eficiencia de inferencia propia de un MoE.
- Direccionalidad unica: solo traduce vi -> en y ja -> en. No se documenta traduccion inversa ni entre vietnamita y japones de forma directa.
- Sin datos de contexto: se desconoce la longitud maxima de secuencia soportada, lo que impide garantizar el comportamiento con entradas largas y hace arriesgado su uso con documentos extensos.
- Riesgo de alucinacion y de deriva de idioma: un modelo de este tamano entrenado desde cero puede generar contenido no fiel al original o mezclar idiomas, especialmente con entradas fuera de dominio o con vocabulario poco frecuente en el corpus.
- Sesgos potenciales: el corpus `belumind/en-vi-ja-curated-500k-triplets` puede sobrerrepresentar determinados dominios o registros, sesgo que se trasladara a las traducciones y del que no se ofrece analisis alguno.
- Dependencia de codigo externo: la carga requiere el repositorio de la asignatura (`src.part1.model.Transformer`), por lo que el modelo no es directamente utilizable con las clases estandar de `transformers` sin trabajo adicional de integracion.
- Cero descargas y cero valoraciones en el momento de la consulta: no existe validacion por parte de la comunidad sobre su comportamiento real.
- Fecha de publicacion registrada en 2026: conviene verificar la vigencia y posibles actualizaciones del repositorio antes de citarlo o reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part1-mlp
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part1/runs/mlp-d97442fc
- Dataset de entrenamiento citado: belumind/en-vi-ja-curated-500k-triplets (referencia en la model card; no se proporciona URL directa)
- Repositorio de la asignatura con el codigo de carga `src.part1.model.Transformer`: no disponible en la informacion proporcionada
