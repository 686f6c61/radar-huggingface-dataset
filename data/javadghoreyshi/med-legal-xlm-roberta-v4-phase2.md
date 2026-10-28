# JavadGhoreyshi/med-legal-xlm-roberta-v4-phase2

## Resumen

`JavadGhoreyshi/med-legal-xlm-roberta-v4-phase2` es un checkpoint de tipo encoder basado en la familia XLM-RoBERTa, publicado en HuggingFace con pipeline `fill-mask` y pesos en `safetensors`. El recuento real de parametros del repositorio es de 279.826.265, un orden de magnitud coherente con la variante *base* de XLM-RoBERTa (~278 M), lo que situa al modelo en la gama de encoders multilingues de tamano medio, no en la categoria de modelos generativos. El identificador sugiere una adaptacion de dominio orientada a texto medico-legal ("med-legal") y una segunda fase de entrenamiento ("v4-phase2"), pero esa informacion no esta documentada en la model card.

La relevancia de este checkpoint es acotada y hay que enmarcarla con honestidad: la model card es la plantilla autogenerada por HuggingFace y no contiene ni una sola seccion completada. No hay descripcion del dataset, del procedimiento de entrenamiento, de la licencia ni de evaluacion alguna. Con 0 descargas y 0 likes en el momento del registro, se trata de un experimento personal o de un artefacto intermedio de un pipeline de fine-tuning, no de un modelo validado para produccion.

Por tanto, esta ficha debe leerse como una evaluacion de viabilidad tecnica mas que como una revision de capacidades demostradas. Lo unico verificable son la arquitectura inferida (encoder transformer XLM-RoBERTa, objetivo de masked language modeling), el numero de parametros y el formato de pesos. Todo lo relativo a calidad, sesgos o rendimiento queda marcado como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-RoBERTa, tipo BERT), objetivo de masked language modeling (MLM); inferido del tag `xlm-roberta` y del pipeline `fill-mask` |
| Parametros totales | 279.826.265 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de la arquitectura XLM-RoBERTa; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas). Al ser un encoder de ~280 M, es viable cuantizacion dinamica int8 (PyTorch) y exportacion a ONNX/ONNX Runtime |
| Idiomas soportados | No disponible en la model card. La arquitectura base XLM-RoBERTa se entreno sobre 100 idiomas, pero el fine-tuning pudo restringir el alcance efectivo |
| Licencia | No disponible (campo vacio en HuggingFace) |
| Formato de pesos | `safetensors` (repositorio de 1,1 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa, un transformer encoder de tipo BERT con embeddings posicionales absolutos y atencion bidireccional completa, entrenado originalmente con el objetivo de masked language modeling sobre corpus multilingues (el tag `arxiv:1910.09700` remite al paper *Unsupervised Cross-lingual Representation Learning at Scale*). El recuento de 279,8 M de parametros encaja con la configuracion *base* de esta familia (12 capas, 768 dimensiones ocultas, vocabulario SentencePiece de gran tamano), aunque la configuracion exacta de este checkpoint concreto no se ha publicado. Al ser un encoder MLM no dispone de cabeza causal: no genera texto libre, solo predice tokens enmascarados.

No hay informacion sobre el entrenamiento: ni volumen de tokens, ni composicion del corpus medico-legal, ni si hubo una fase intermedia de domain-adaptive pretraining seguida de fine-tuning supervisado, ni hiperparametros, ni regimen de precision (fp32/fp16/bf16), ni infraestructura de computo. El sufijo "phase2" y la fecha de creacion (2026-10-28, posterior a la fecha habitual de publicacion de la familia XLM-RoBERTa) apuntan a un reentrenamiento o continuacion de un checkpoint previo del mismo autor, pero es una inferencia a partir del nombre, no un dato documentado. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, destilacion).

## Capacidades

- Relleno de mascaras (masked language modeling): predice tokens enmascarados en una secuencia, uso nativo del pipeline `fill-mask`.
- Representaciones contextuales bidireccionales: utilizable como extractor de embeddings de frases o tokens para tareas downstream (clasificacion, NER, reranking) tras el fine-tuning correspondiente.
- Base para fine-tuning supervisado en dominio medico-legal: el identificador sugiere adaptacion a ese dominio, aunque no hay evaluacion que lo respalde.
- Capacidad multilingue potencial heredada de XLM-RoBERTa, no verificada en este checkpoint.
- Soporte de tool calling / function calling: no, es un encoder MLM sin interfaz de instrucciones.
- Soporte de agentes y razonamiento multi-paso: no.
- Generacion de texto libre, codigo, matematicas o vision: no disponible en esta arquitectura.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Fine-tuning para reconocimiento de entidades nombradas (NER) en textos juridicos y clinicos: partiendo del checkpoint como inicializacion, se anotarian entidades como partes procesales, articulos, principios activos, diagnosticos o dosis; la ventaja frente a un BERT generico es la presunta especializacion del vocabulario y del dominio.
- Clasificacion documental en despachos y servicios de documentacion clinica: categorizar escritos, informes de alta o resoluciones usando la representacion del token `[CLS]` tras anadir una cabeza lineal, con un coste de entrenamiento bajo (~280 M de parametros).
- Recuperacion de informacion y busqueda semantica sobre corpus legales o historiales: generar embeddings de fragmentos de 512 tokens e indexarlos en un motor vectorial para preguntas-respuesta extractivas con reranking.
- Normalizacion de terminologia y desambiguacion: el relleno de mascaras permite comprobar que termino encaja mejor en una plantilla ("el paciente presenta [MASK] agudo"), util para validar plantillas de informes o detectar incoherencias.
- Preprocesado y enmascaramiento de datos personales (pseudonimizacion): combinar un modelo NER afinado sobre esta base con reglas para detectar nombres, identificadores y direcciones antes de almacenar documentos.
- Etiquetado asistido y anotacion semiautomatica: usar las predicciones MLM y las probabilidades por token para preanotar corpus y reducir el coste de anotacion humana en proyectos de investigacion juridica o sanitaria.
- Baseline academico: servir como punto de partida reproducible en experimentos sobre dominio medico-legal en castellano, comparando frente a BETO, MarIA o XLM-R generico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada (todas las metricas figuran como "[More Information Needed]") y no hay datos de MMLU, HumanEval, GSM8K ni de tareas propias de encoder (NER, classification accuracy, perplexity de masked LM).

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,1 GB en fp32, ~560 MB en fp16/bf16 y ~280 MB en int8 dinamico.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100/H100. Suficiente con RTX 3060, RTX 4090, T4, L4 o incluso GPUs integradas.
- Cabe holgadamente en GPU de consumo, y la inferencia en CPU es practica para lotes pequenos (cientos de documentos por minuto con ONNX Runtime en funcion del hardware).
- Opciones de despliegue: `transformers` (referencia), ONNX Runtime u Optimum para exportacion, TorchScript, y servicios de embeddings/encoders como HuggingFace Text Embeddings Inference si se usa como extractor. vLLM y TGI estan orientados a modelos generativos y no cubren el pipeline `fill-mask`. llama.cpp no es una via soportada de forma fiable para este tipo de encoder.
- Latencia y throughput: no disponibles (no hay mediciones publicadas). Como referencia de escala, un encoder de 12 capas y 768 dimensiones procesa secuencias de 512 tokens en decenas de milisegundos por lote en GPU moderna, pero es una estimacion generica, no medida sobre este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| med-legal-xlm-roberta-v4-phase2 (este) | 279,8 M | 512 tokens (arquitectura) | MLM adaptado a dominio (presunto) | No disponible | Repo HuggingFace, 0 descargas |
| xlm-roberta-base (FacebookAI) | ~278 M | 512 tokens | MLM multilingue (100 idiomas) | MIT | Ampliamente disponible y validado |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | MLM multilingue (104 idiomas) | Apache-2.0 | Ampliamente disponible |
| BETO (bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | MLM en castellano | Apache-2.0 | Disponible, con evaluacion publicada en tareas en espanol |
| MarIA (roberta-base-bne) | ~125 M | 512 tokens | MLM en castellano (corpus BNE) | Apache-2.0 | Disponible, con evaluacion publicada |

La comparacion relevante es frente a `xlm-roberta-base`: mismo orden de parametros y misma arquitectura, pero con licencia conocida, model card completa y millones de descargas. Sin evaluacion publicada, este checkpoint no ofrece ninguna ventaja demostrable sobre el modelo del que deriva.

## Limitaciones y advertencias

- Model card autogenerada y sin contenido: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto; imposible auditar el modelo.
- Licencia no disponible: no se puede asumir permiso de uso comercial. En ausencia de licencia explicita, el uso en produccion o en productos de pago es juridicamente arriesgado.
- Riesgo de alucinacion en el sentido de predicciones plausibles pero incorrectas: el relleno de mascaras siempre devuelve un token, aunque el contexto no permita inferirlo con fiabilidad.
- Ambito limitado a 512 tokens: no apto para documentos legales o informes clinicos largos sin troceado previo.
- Dominio sensible: predicciones sobre texto medico o juridico pueden tener consecuencias reales; el modelo no es una herramienta de diagnostico ni de asesoramiento legal.
- Idiomas no declarados: no se puede confirmar que el castellano sea un idioma objetivo real del fine-tuning ni que el multilingueismo de la base se conserve.
- Posible contaminacion de datos: al no documentarse el corpus, no se descarta la presencia de datos personales o material con derechos de autor en el entrenamiento.
- Fecha de creacion inusual (2026-10-28) y ausencia total de traccion (0 descargas, 0 likes): indicios de un artefacto no validado ni revisado por la comunidad.
- Sin versiones cuantizadas ni artefactos ONNX publicados: cualquier optimizacion para despliegue debe hacerse por cuenta propia.
- No es un modelo generativo: no debe plantearse para tareas de chat, resumen abstractivo o generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JavadGhoreyshi/med-legal-xlm-roberta-v4-phase2
- Paper de referencia de la arquitectura XLM-RoBERTa: https://arxiv.org/abs/1910.09700
- Documentacion de XLM-RoBERTa en transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- No se han encontrado papers, blogs, repositorios ni demos especificos de este checkpoint en la informacion disponible.
