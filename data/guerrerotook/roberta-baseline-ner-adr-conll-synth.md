# guerrerotook/RoBERTa-baseline-NER-ADR-CONLL-SYNTH

## Resumen

El modelo `guerrerotook/RoBERTa-baseline-NER-ADR-CONLL-SYNTH` es un clasificador de tokens (NER) en espanol especializado en la extraccion de entidades vinculadas a reacciones adversas a medicamentos (RAM). Lo desarrolla Luis Miguel Guerrero Guirado en el marco de su Proyecto Fin de Grado en la UNED y se publica bajo licencia CC BY 4.0. Parte directamente de `PlanTL-GOB-ES/roberta-base-biomedical-es`, sin una fase intermedia de adaptacion por enmascaramiento (MLM) sobre el corpus CIMA, y aplica un fine-tuning supervisado conjunto con el corpus sintetico `guerrerotook/CIMA-4.8-ADR-NER-EXTENDED`.

Se trata de un modelo denso de arquitectura transformer tipo RoBERTa base, con 125.397.513 parametros (encoder mas cabeza de clasificacion de tokens) y un total de nueve etiquetas en formato IOB2 que cubren cuatro tipos de entidad: `REACT` (reaccion adversa), `ACTIVE` (principio activo), `FREQ` (frecuencia de aparicion) y `SYS` (sistema u organo afectado). Su relevancia actual radica en que aborda una tarea de farmacovigilancia muy concreta sobre texto biomedico en espanol, un ambito con menos recursos que el ingles, y lo hace con un modelo pequeno y desplegable en hardware modesto.

El interes practico del modelo esta en su coste de inferencia: al tratarse de un encoder de 125 millones de parametros, puede ejecutarse en CPU o en GPUs de consumo con una huella de memoria reducida. La propia model card advierte, no obstante, que las metricas publicadas provienen de un test sintetico que tambien se uso para parada temprana y seleccion del mejor checkpoint, por lo que no constituyen una estimacion sobre un conjunto independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa base con cabeza de clasificacion de tokens (token classification) |
| Parametros totales | 125.397.513 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredada de roberta-base; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Espanol (es) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Etiquetas (IOB2) | 9: `O`, `B-REACT`, `I-REACT`, `B-ACTIVE`, `I-ACTIVE`, `B-FREQ`, `I-FREQ`, `B-SYS`, `I-SYS` |
| Tarea (pipeline) | token-classification |
| Modelo base | PlanTL-GOB-ES/roberta-base-biomedical-es (relacion: finetune) |
| Dataset de ajuste | guerrerotook/CIMA-4.8-ADR-NER-EXTENDED |
| Tamano del repositorio | 0.5 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo RoBERTa base (aproximadamente 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, segun la configuracion estandar de roberta-base y coherente con el recuento de parametros) con una cabeza lineal de clasificacion de tokens. El modelo se inicializa desde los pesos de `PlanTL-GOB-ES/roberta-base-biomedical-es`, un encoder ya adaptado al dominio biomedico en espanol, y no se aplica ninguna fase MLM intermedia sobre el corpus CIMA antes del fine-tuning supervisado. El orden de `id2label` esta almacenado en `config.json`.

El ajuste se realizo sobre el corpus sintetico `CIMA-4.8-ADR-NER-EXTENDED` con 70 textos sinteticos correspondientes a 35 medicamentos de origen para entrenamiento y 28 textos de 14 medicamentos para evaluacion. Las variantes de un mismo medicamento se mantienen siempre en una unica particion para evitar fuga de informacion entre entrenamiento y evaluacion. La model card no especifica el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a una tarea de etiquetado). Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto biomedico y farmacologico en espanol.
- Extraccion de reacciones adversas (`REACT`) a partir de texto libre.
- Identificacion de principios activos (`ACTIVE`).
- Deteccion de frecuencias de aparicion (`FREQ`).
- Identificacion de sistemas u organos afectados (`SYS`).
- Etiquetado a nivel de token en formato IOB2 con agregacion de entidades mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Uso directo con la libreria `transformers` (clase `pipeline("token-classification")`).
- Soporte de tool calling / function calling: no disponible (es un modelo de clasificacion, no genera texto).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo espanol.
- Capacidades especiales (modo thinking, vision, audio, generacion): no disponible.

## Casos de uso

- Farmacovigilancia automatizada: extraer sistematicamente reacciones adversas, principios activos, frecuencias y sistemas afectados de notas o informes en espanol para poblar bases de datos de seguridad farmacologica, usando las cuatro entidades del modelo y su salida IOB2.
- Analisis de fichas tecnicas y prospectos: procesar documentos regulatorios en espanol y normalizar las menciones de RAM por medicamento, partiendo del hecho de que el corpus de ajuste sigue el estilo de estas fuentes; conviene validar antes con datos reales, ya que el modelo solo se ha medido sobre texto sintetico.
- Preprocesado para sistemas de extraccion de conocimiento: actuar como primer eslabon de un pipeline que alimente un modulo de relaciones o un grafo de conocimiento farmacologico, aprovechando el etiquetado fino de principio activo y reaccion.
- Indexacion y busqueda semantica en corpus clinicos: enriquecer documentos con anotaciones de entidades para permitir consultas del tipo "reacciones asociadas al principio activo X", sobre corpus en espanol dentro del limite de 512 tokens por secuencia.
- Monitorizacion de literatura cientifica: detectar de forma automatica menciones de RAM en resumenes o articulos en espanol para priorizar revisiones manuales por parte de farmaceuticos.
- Deteccion de senales en redes sociales o foros de salud: extraer reacciones adversas descritas por pacientes en espanol para generar alertas preliminares, con la advertencia de que el modelo no se ha validado en ese dominio.
- Anotacion asistida (human-in-the-loop): preetiquetar corpus para que anotadores humanos corrijan, reduciendo el coste de construir datasets NER biomedicos en espanol.
- Despliegue en entornos con recursos limitados: ejecutar en CPU o en una GPU de consumo para laboratorios pequenos o proyectos academicos, dado el tamano del modelo (0.5 GB de repositorio).

## Benchmarks y rendimiento

Evaluacion publicada en la model card sobre el test sintetico del PFG: 28 textos de 14 medicamentos de origen no vistos durante el entrenamiento supervisado, 1.577 oraciones, 26.213 tokens y 3.366 entidades de referencia. Las metricas son a nivel de entidad.

| Criterio | Precision | Recall | F1 |
|---|---:|---:|---:|
| Strict / seqeval | 0,9663 | 0,9789 | 0,9726 |
| Partial | 0,9761 | 0,9889 | 0,9824 |
| Ent-type | 0,9848 | 0,9976 | 0,9911 |

Advertencia importante recogida en la propia model card: el split denominado `test` se uso tambien para parada temprana y seleccion del mejor checkpoint, por lo que estas cifras no constituyen una estimacion sobre un holdout independiente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a una tarea de etiquetado de secuencias.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 125,4 millones de parametros): aproximadamente 0,5 GB en FP32, 0,25 GB en FP16/BF16 y 0,13 GB en INT8, sin contar el overhead del runtime ni del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; por ejemplo GTX 1650, RTX 3060, RTX 4090, T4, L4, A100 o H100. El modelo esta muy por debajo de la capacidad de cualquiera de ellas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida.
- Ejecucion en CPU: viable para lotes pequenos, dado el tamano del modelo.
- Opciones de despliegue: `transformers` (pipeline `token-classification`) es la ruta documentada por el autor. Para servidores de inferencia, las alternativas habituales para encoders de clasificacion son ONNX Runtime, TorchServe, Triton Inference Server o FastAPI con PyTorch. El uso de vLLM no es la via natural para tareas de token classification, y no se documenta ningun despliegue con llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles (no se publican cifras de latencia ni de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Metricas |
|---|---|---|---|---|---|
| guerrerotook/RoBERTa-baseline-NER-ADR-CONLL-SYNTH | 125,4 M | 512 tokens (heredado del base) | NER biomedico RAM en espanol | cc-by-4.0 | F1 0,9726 strict en test sintetico |
| PlanTL-GOB-ES/roberta-base-biomedical-es | ~125 M | 512 tokens | Modelo base biomedico en espanol (MLM), sin cabeza NER | no disponible en la informacion proporcionada | No aplica (no es un NER) |
| Alternativas de NER biomedico en espanol de la familia PlanTL-GOB-ES / BSC | No disponible | No disponible | NER biomedico en espanol | No disponible | No disponible |
| dominiqueblok/roberta-base-finetuned-ner | ~125 M | 512 tokens | NER general (CoNLL-2003) en ingles | No disponible en la informacion proporcionada | F1 0,9567 en CoNLL-2003 (no comparable por idioma ni dominio) |

No se dispone de datos publicados en la informacion proporcionada para comparar directamente el rendimiento de este modelo con alternativas equivalentes de NER de RAM en espanol, ya que las metricas del modelo se midieron sobre un test sintetico del propio autor y no sobre un benchmark comun.

## Limitaciones y advertencias

- Los resultados publicados corresponden a un test sintetico que tambien se uso para parada temprana y seleccion del checkpoint: no son una estimacion sobre un holdout independiente.
- Los resultados miden el ajuste al regimen sintetico generado y no demuestran transferencia a fichas tecnicas reales.
- La validacion del corpus comprueba que las superficies anotadas aparecen en el texto, pero no garantiza una anotacion clinica exhaustiva.
- El modelo no se ha validado para decisiones clinicas; no debe usarse como unico criterio en contextos medicos.
- Riesgo de alucinacion: al ser un modelo discriminativo de etiquetado, no genera texto, pero puede asignar etiquetas incorrectas a menciones ambiguas o fuera de dominio.
- Sesgos conocidos: no disponibles; no se documenta ningun analisis de sesgos.
- Limitaciones de contexto e idioma: ventana de 512 tokens por secuencia (heredada de roberta-base) y soporte unicamente de espanol.
- Volumen de entrenamiento reducido: 70 textos sinteticos de 35 medicamentos para entrenamiento y 28 textos de 14 medicamentos para evaluacion, con particiones separadas por medicamento de origen.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; debe citarse al autor y la obra segun los terminos de la licencia.
- Para produccion: no se documentan tipos de cuantizacion, latencias, throughput ni pruebas de robustez fuera del dominio sintetico; se recomienda validar en el dominio objetivo antes de desplegar.
- El modelo presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guerrerotook/RoBERTa-baseline-NER-ADR-CONLL-SYNTH
- Dataset de ajuste: https://huggingface.co/datasets/guerrerotook/CIMA-4.8-ADR-NER-EXTENDED
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-es
- Documentacion de RoBERTa en transformers: https://huggingface.co/docs/transformers/model_doc/roberta
- Referencia de NER con RoBERTa (proyecto externo): https://github.com/acd19ml/ner-extractor/tree/main/RoBERTa
- Articulo sobre fine-tuning de RoBERTa para NER (referencia externa): https://arxiv.org/abs/2412.15252
- Ejemplo de modelo NER con RoBERTa (referencia externa): https://huggingface.co/dominiqueblok/roberta-base-finetuned-ner
- Cita del trabajo: Guerrero Guirado, Luis Miguel. "Aplicacion de modelos de Inteligencia Artificial para la identificacion y catalogacion de reacciones adversas de medicamentos". Proyecto Fin de Grado, UNED, 2026.
