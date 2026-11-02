# dungxnd/XanvuMT

## Resumen

XanvuMT es un modelo de traduccion automatica chino-vietnamita entrenado desde cero por el desarrollador independiente dungxnd, sin partir de un checkpoint preentrenado. El modelo esta especializado en texto de novelas web (webnovel), un dominio con registro informal, dialogos abundantes y terminologia recurrente que los traductores genericos suelen manejar con dificultad. La relevancia del modelo es acotada: se trata de un checkpoint de entrenamiento experimental, no de un artefacto de inferencia listo para produccion, y su corpus de entrenamiento contiene traducciones generadas por un modelo profesor, por lo que aprende a imitar a ese profesor mas que a traducir con calidad humana verificada.

Arquitectonicamente es un transformer encoder-decoder de tipo secuencia a secuencia con solo 30,45 millones de parametros unicos, d_model de 512, vocabulario compartido de 24.000 piezas y atencion GQA con 8 cabezas de consulta y 2 de clave/valor. El encoder emplea una estructura poco convencional de 4 nucleos compartidos con 12 pasadas, y el decoder tiene 2 capas con atencion propia y cruzada fusionada. Se entreno durante 39.000 pasos sobre aproximadamente 1.145 millones de tokens objetivo, alcanzando una perdida de validacion minima de 2,1429.

El modelo se publica como checkpoint de PyTorch (351 MiB, incluyendo estado del optimizador AdamW) que requiere la libreria `xanvu` del repositorio de entrenamiento para recargarse. No incluye exportacion a ONNX ni a CTranslate2, no declara licencia y no ofrece resultados de benchmarks. Su interes es principalmente de investigacion: documenta un diseno de encoder con nucleos compartidos y sirve como referencia reproducible de un pipeline de destilacion en un par de idiomas de bajos recursos como el chino-vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder secuencia a secuencia; encoder de 4 nucleos compartidos x 12 pasadas, decoder de 2 capas con atencion propia y cruzada fusionada |
| Parametros totales | 30.450.283 parametros unicos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos fp32 en el checkpoint) |
| Idiomas soportados | chino (origen) y vietnamita (destino) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`) con pesos, especificacion, descriptores de vocabulario y offset objetivo; sin exportacion ONNX ni CTranslate2 |
| d_model | 512 |
| FFN | 2048 |
| Cabezas de atencion | GQA, 8 cabezas de consulta / 2 cabezas KV |
| Vocabulario | 24.000 piezas compartidas (tied), tokenizador SentencePiece |
| Normalizacion | RMSNorm |
| LayerScale por pasada | no |
| Pendiente de longitud aprendida | si |
| Tamano del repositorio | 2,0 GB |
| Tamano del checkpoint | 351 MiB (122 MiB de pesos fp32; el resto es estado AdamW) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura descrita en la seccion 4 del documento `docs/NEW_MT_MODEL.md` del repositorio de entrenamiento. La innovacion principal reside en el encoder: en lugar de apilar 12 capas independientes, utiliza 4 nucleos compartidos que se aplican en 12 pasadas, lo que reduce el numero de parametros unicos manteniendo profundidad efectiva. El decoder es deliberadamente ligero (2 capas) y fusiona la atencion propia con la cruzada. La atencion usa GQA con 8 cabezas de consulta y 2 de clave/valor, y la normalizacion es RMSNorm. El vocabulario de 24.000 piezas esta compartido entre origen y destino, con tokenizador SentencePiece en ambos lados. No se aplica LayerScale por pasada, pero si una pendiente de longitud aprendida.

El entrenamiento se realizo en CUDA con precision mixta automatica (AMP) durante 39.000 pasos, con un objetivo de 1.145.168.395 tokens vistos. La curva de perdida de validacion descendio desde 4,5734 hasta un minimo de 2,1429, con ligeras oscilaciones en las ultimas etapas (2,1483, 2,1454, 2,1467). El corpus es un conjunto de aproximadamente 350.000 filas de novelas web chino-vietnamita que contiene traducciones generadas por un modelo profesor. Se trata, por tanto, de un objetivo de destilacion y no de datos de referencia humana: las metricas contra ese corpus miden la concordancia con el profesor, no la calidad real de traduccion. No se documenta el uso de RLHF ni de DPO.

## Capacidades

- Traduccion de texto de chino a vietnamita, unidireccional, en el dominio de novelas web.
- Generacion de texto secuencia a secuencia con vocabulario compartido origen-destino.
- Manejo de registro informal y dialogos propios de la ficcion serializada, segun el corpus de entrenamiento.
- Recarga reproducible del checkpoint junto con su especificacion, vocabularios y offset objetivo mediante la libreria `xanvu`.
- Reanudacion del entrenamiento desde el checkpoint, ya que incluye el estado `exp_avg` y `exp_avg_sq` de AdamW.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No se documentan capacidades multilingues mas alla del par chino-vietnamita.

## Casos de uso

- Traduccion asistida de novelas web chinas al vietnamita: el modelo se usaria como primer paso de traduccion automatica sobre capitulos serializados, con revision humana posterior, aprovechando que el corpus de entrenamiento cubre ese dominio y registro concretos.
- Prototipado de pipelines de traduccion en pares de bajos recursos: sirve como referencia reproducible para experimentar con arquitecturas encoder-decoder compactas de 30 millones de parametros en entornos con recursos limitados.
- Investigacion sobre destilacion de modelos de traduccion: al haberse entrenado contra traducciones de un modelo profesor, permite estudiar tecnicas de imitacion y medir la concordancia con el profesor en lugar de con referencias humanas.
- Experimentacion con encoders de nucleos compartidos: el diseno de 4 nucleos x 12 pasadas es un caso de estudio util para comparar eficiencia de parametros frente a apilamientos convencionales en tareas seq2seq.
- Reentrenamiento y ajuste fino sobre corpus propios: al incluir el estado del optimizador, el checkpoint se puede reanudar con `--resume` para continuar el entrenamiento con datos adicionales o corregir el sesgo del profesor.
- Docencia y reproduccion de experimentos: el repositorio de entrenamiento y el checkpoint permiten reproducir el pipeline completo en una unica GPU, dado el reducido tamano del modelo (122 MiB de pesos en fp32).
- Despliegue experimental en local previa exportacion: aunque no se incluye el artefacto de inferencia, el modelo es lo bastante pequeno para exportarse a ONNX o CTranslate2 y ejecutarse en CPU, siempre que se complete ese paso por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion inicial | 4,5734 |
| Perdida de validacion minima | 2,1429 |
| Pasos de entrenamiento | 39.000 |
| Tokens objetivo vistos | 1.145.168.395 |

No se proporcionan resultados de BLEU, chrF, COMET ni de conjuntos como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de traduccion de este tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos (122 MiB), mas el estado de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en CUDA y el modelo es compatible con tarjetas de gama baja.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 3050, RTX 4060 y similares.
- Opciones de despliegue: la unica via documentada es la libreria `xanvu` con PyTorch (`torch.load` + `MTModel`). No se incluye exportacion a ONNX ni a CTranslate2, por lo que no hay soporte directo de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de XanvuMT que permitan una comparacion cuantitativa fiable. A continuacion se contrastan caracteristicas estructurales con alternativas genericas del mismo nicho:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XanvuMT | 30,45 M | no disponible | Entrenado desde cero, chino-vietnamita, dominio webnovel | no disponible | Checkpoint PyTorch, requiere libreria `xanvu` |
| NLLB-200 (variante distilled 600M) | 600 M | 512 tokens | Multilingue, 200 idiomas, entrenado con datos paralelos supervisados | CC-BY-NC 4.0 | Pesos en HuggingFace, compatible con Transformers |
| MarianMT (Helsinki-NLP) | ~70-80 M por par | 512 tokens | Seq2seq especifico por par de idiomas | MIT / CC-BY 4.0 segun variante | Pesos en HuggingFace, compatible con Transformers |
| M2M-100 (418M) | 418 M | 1024 tokens | Multilingue, 100 idiomas | MIT | Pesos en HuggingFace, compatible con Transformers |

XanvuMT destaca por su tamano reducido (30 millones de parametros frente a cientos de millones en las alternativas) y por su especializacion en un dominio concreto, pero carece de licencia declarada, de artefacto de inferencia listo para usar y de evaluacion publica, lo que limita su comparacion directa con modelos establecidos.

## Limitaciones y advertencias

- El corpus de entrenamiento contiene traducciones generadas por un modelo profesor, no referencias humanas; el modelo aprende a imitar al profesor e hereda sus errores y sesgos.
- La perdida de validacion de 2,1429 no equivale a calidad de traduccion; no se reportan metricas como BLEU o COMET.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal y no puede recomendarse sin aclaracion del autor.
- Es un checkpoint de entrenamiento, no un artefacto de inferencia: requiere la libreria `xanvu` y un paso de exportacion adicional para desplegarse.
- El checkpoint incluye estado del optimizador AdamW (351 MiB frente a 122 MiB de pesos); para distribucion de solo inferencia hay que ejecutar `python -m xanvu.training.upload --strip-optimizer`.
- La longitud de contexto no esta documentada, lo que impide planificar el troceado de textos largos con garantias.
- El modelo es unidireccional (chino a vietnamita) y esta especializado en novelas web; su rendimiento fuera de ese dominio es incierto.
- Riesgo de alucinacion y de deriva en terminologia consistente a lo largo de capitulos largos, agravado por la ausencia de datos de evaluacion.
- No soporta tool calling, agentes, vision ni audio.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (31 de octubre y 2 de noviembre de 2026) son posteriores a la fecha actual, lo que sugiere un posible error de metadatos o una publicacion programada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dungxnd/XanvuMT
- Repositorio de entrenamiento y documentacion: no disponible como URL publica; la model card referencia `docs/NEW_MT_MODEL.md` seccion 4 dentro del repositorio de entrenamiento
- Paper: no disponible
- Blog o demo: no disponible
