# josueu/m2m100-T4-Tokv2-es-zap-datav1

## Resumen

m2m100-T4-Tokv2-es-zap-datav1 es un ajuste fino supervisado de facebook/m2m100_418M, el modelo de traduccion multilingue encoder-decoder publicado por Meta AI. Lo desarrolla el usuario josueu y su proposito declarado es la traduccion castellano-zapoteco, una direccion de traduccion con recursos muy limitados dentro del ecosistema de modelos abiertos. El modelo base aporta la arquitectura transformer encoder-decoder de 12 capas y aproximadamente 418 millones de parametros, mientras que el ajuste fino especializa los pesos para el par es-zap.

El repositorio tiene 191 descargas y ningun "like", y la model card es la plantilla autogenerada por el Trainer de Hugging Face, con secciones de descripcion, usos previstos y datos de entrenamiento sin completar. El autor solo documenta hiperparametros de entrenamiento y una curva de evaluacion con BLEU final de 30,84, TER de 53,06, METEOR de 0,5757 y chrF de 57,08 sobre el conjunto de evaluacion (no identificado en la informacion disponible).

Su relevancia es practica: los zapotecos son una familia de lenguas indigenas de Mexico con escasisimos recursos digitales, y cualquier modelo abierto que mueva la aguja en es-zap tiene valor para investigacion de lenguas de bajos recursos. No obstante, la documentacion es muy escasa y la model card no especifica el dataset, el tokenizador modificado ni los criterios de evaluacion, lo que limita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100) |
| Parametros totales | 483.898.368 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base usa sentencias cortas; M2M-100 original entrena con segmentos de 128 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite conversion a GGUF/ONNX por herramientas externas, no documentado por el autor) |
| Idiomas soportados | castellano y zapoteco (inferido del nombre del modelo); el resto de idiomas del modelo base no esta confirmado tras el ajuste fino |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos Transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de facebook/m2m100_418M, un transformer encoder-decoder con atencion multi-cabeza estandar, 12 capas en encoder y decoder, y un vocabulario multilingue compartido de aproximadamente 128.000 tokens en el modelo original. El nombre del repositorio sugiere una modificacion del tokenizador ("Tokv2"), pero la informacion disponible no detalla en que consiste ese cambio ni si se anadieron tokens especificos para el zapoteco.

El entrenamiento se realizo con el Trainer de Hugging Face: learning rate 5e-05, batch efectivo de 16 (batch 4 con 4 pasos de acumulacion), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 15 epochs, semilla 42 y AMP nativo. El conjunto de datos no se identifica ("on the None dataset") y no hay informacion sobre tamano del corpus, composicion, variante de zapoteco cubierta ni si se aplicaron tecnicas de aumento o filtrado. Tampoco se documenta RLHF, DPO ni ninguna innovacion de decodificacion.

La curva de validacion muestra sobreajuste a partir de la epoch 8-9: la perdida de validacion baja hasta 1,2655 en la epoch 6 y luego repunta hasta 1,3530 en la epoch 15, mientras el BLEU sigue subiendo de forma moderada hasta 31,81 en la epoch 13 y se estabiliza alrededor de 30,8. El checkpoint publicado corresponde a la epoch 15.

## Capacidades

- Traduccion de texto castellano-zapoteco (direccion es-zap declarada en el nombre; la direccion inversa no esta confirmada).
- Generacion de texto seq2seq condicionada a la sentencia de entrada, con salida unica por pasada.
- Traduccion multilingue heredada del modelo base M2M-100, aunque el ajuste fino puede haber degradado pares distintos de es-zap.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explicito ni de agentes multi-paso.
- No dispone de vision, audio ni otras modalidades.
- Capacidad multilingue limitada al par entrenado mas lo que conserve del modelo base; no documentada.

## Casos de uso

- Traduccion de documentacion administrativa y sanitaria del castellano al zapoteco: el modelo puede procesar frases cortas de formularios, avisos y consentimientos, donde el contexto requerido es bajo y el valor social alto.
- Localizacion de interfaces de aplicaciones moviles: traduccion de cadenas cortas de UI (botones, mensajes de error, notificaciones) en pipelines de internacionalizacion, aprovechando que el modelo trabaja bien en segmentos de una o dos frases.
- Preservacion linguistica y corpus paralelos: generacion de borradores de traduccion para revisión por hablantes nativos, acelerando la creacion de corpus es-zap alineados que hoy son escasos.
- Investigacion en lenguas de bajos recursos: linea base reproducible para experimentos de ajuste fino, comparacion de tokenizadores y evaluacion de metricas (BLEU, chrF) en un par de bajos recursos.
- Educacion bilingue: apoyo a materiales escolares castellano-zapoteco, con supervision humana obligatoria dado el TER de 53,06.
- Subtitulado y transcripcion de contenido audiovisual comunitario: traduccion de subtitulos en segmentos cortos, integrable en flujos con revision posterior por hablantes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluacion (no identificado). El model-index oficial no contiene entradas; los datos provienen de la tabla de entrenamiento de la model card.

| Metrica | Valor final (epoch 15) | Mejor valor observado |
|---|---|---|
| Loss (validacion) | 1,3530 | 1,2655 (epoch 6) |
| BLEU | 30,8381 | 31,8118 (epoch 13) |
| TER | 53,0637 | 51,7157 (epoch 11) |
| METEOR | 0,5757 | 0,5783 (epoch 14) |
| chrF | 57,0849 | 57,2482 (epoch 13) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,9 GB de pesos (483,9 M de parametros) mas activaciones; en la practica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1 GB de pesos mas activaciones; entre 2 y 3 GB.
- VRAM estimada en int8: aproximadamente 0,5 GB de pesos; entre 1,5 y 2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 4060, GTX 1660) es suficiente; para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamano reducido del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline text2text-generation), vLLM, TGI y llama.cpp via conversion a GGUF; Ollama requiere conversion previa no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera decodificacion de decenas a cientos de tokens por segundo en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| m2m100-T4-Tokv2-es-zap-datav1 | 483,9 M | no disponible | Traduccion es-zap ajustada | MIT | Hugging Face, 191 descargas |
| facebook/m2m100_418M | 418 M (nominal) | segmentos de 128 tokens | Traduccion multilingue general | MIT | Hugging Face, ampliamente usado |
| Helsinki-NLP/opus-mt-es-* | ~77 M por par | segmentos cortos | Traduccion por par de idiomas | CC-BY-4.0 | Hugging Face, muchos pares |
| NLLB-200-distilled-600M | 600 M | 512 tokens | Traduccion multilingue 200 idiomas | CC-BY-NC-4.0 | Hugging Face, uso no comercial |

La comparacion con NLLB es relevante porque cubre 200 idiomas con licencia no comercial, mientras que este ajuste permite uso comercial bajo MIT pero solo para el par es-zap y sin documentacion de calidad fuera de ese par. Los modelos OPUS-MT por par son mucho mas ligeros pero no cubren zapoteco de forma fiable.

## Limitaciones y advertencias

- Model card incompleta: no se especifica el dataset de entrenamiento, el tamano del corpus, la variante de zapoteco ni el conjunto de evaluacion, lo que impide reproducir o auditar los resultados.
- TER de 53,06 indica que mas de la mitad del texto de referencia requiere edicion; la calidad no es apta para publicacion sin revision humana.
- Sobreajuste evidente: la perdida de validacion empeora desde la epoch 6 mientras el BLEU se estanca, y el checkpoint publicado es el de la epoch 15, no el mejor en validacion.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas, especialmente en terminologia tecnica o regional del zapoteco.
- Cobertura de variantes dialectales del zapoteco no documentada; el zapoteco es una familia linguistica con variantes mutuamente inteligibles limitadas.
- El ajuste fino puede haber degradado el rendimiento multilingue del modelo base en idiomas distintos de es-zap; no hay evaluacion al respecto.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal del uso recae en el integrador.
- El tokenizador modificado ("Tokv2") no esta documentado, lo que puede romper la compatibilidad con pipelines que asuman el vocabulario original de M2M-100.
- Sin datos de sesgos; al ser un modelo entrenado sobre corpus no descrito, pueden persistir sesgos de genero, registro o terminologia del corpus de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josueu/m2m100-T4-Tokv2-es-zap-datav1
- Modelo base: https://huggingface.co/facebook/m2m100_418M
- Paper de M2M-100 (Fan et al., 2020): https://arxiv.org/abs/2010.11125
- Repositorio fairseq de Meta AI: https://github.com/facebookresearch/fairseq
- Documentacion de Transformers para M2M100: https://huggingface.co/docs/transformers/model_doc/m2m_100
