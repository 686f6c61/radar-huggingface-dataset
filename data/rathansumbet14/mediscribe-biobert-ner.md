# RATHANSUMBET14/mediscribe-biobert-ner

## Resumen

Mediscribe-biobert-ner es un modelo de clasificacion de tokens (token classification) publicado en HuggingFace por el usuario RATHANSUMBET14. Por su identificador y sus etiquetas, se trata de un ajuste fino orientado a reconocimiento de entidades nombradas (NER) sobre dominio biomedico, construido sobre una arquitectura BERT con 107.723.525 parametros, un tamano que coincide con el de BERT-base. El repositorio pesa 0,4 GB y distribuye los pesos en formato safetensors, por lo que es compatible con la libreria transformers y con el pipeline `token-classification`.

El problema que aborda es recurrente en el sector sanitario: convertir texto clinico o cientifico no estructurado (informes, historias, resumenes de articulos) en entidades etiquetadas, como farmacos, enfermedades, procedimientos o dosis. Un encoder tipo BERT es adecuado para esta tarea porque no genera texto libre, sino que asigna una etiqueta a cada token, lo que reduce el riesgo de contenido inventado y abarata la inferencia frente a modelos generativos.

La relevancia de esta ficha es limitada pero conviene ser explicito: la model card es la plantilla autogenerada de HuggingFace y no contiene informacion sustantiva sobre datos de entrenamiento, conjunto de etiquetas, idioma, licencia ni evaluacion. El repositorio presenta 0 descargas y 0 likes, y no declara licencia, por lo que cualquier uso en produccion exige una verificacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only); etiqueta `bert` declarada por el autor |
| Parametros totales | 107.723.525 (dato real de los safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT-base trabaja habitualmente con 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible; al ser safetensors en precision completa, admite conversion a fp16/int8 mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es la etiqueta `bert` y el recuento de parametros. Con 107,7 millones de parametros, la configuracion es consistente con BERT-base (12 capas de transformer, 768 dimensiones ocultas, 12 cabezas de atencion), aunque la model card no confirma esta configuracion explicitamente. Se trata de un encoder bidireccional con atencion completa, sobre el que se anade una cabeza de clasificacion token a token; el pipeline declarado (`token-classification`) confirma que la salida es una etiqueta por token y no texto generado.

No hay ningun dato disponible sobre el procedimiento de entrenamiento: se desconoce el corpus de ajuste fino, el esquema de etiquetado (por ejemplo BIO o BIOES), el numero de entidades, si hubo entrenamiento con precision mixta, ni si se aplicaron tecnicas de regularizacion o calibracion. Tampoco se documenta si el modelo parte de un checkpoint preentrenado en dominio biomedico (tipo BioBERT o PubMedBERT) o de BERT-base generico, pese a que el nombre del repositorio sugiere lo primero. La referencia arXiv incluida en las etiquetas (1910.09700) corresponde al articulo de Lacoste et al. sobre calculo de emisiones de carbono, citado en la propia plantilla de la model card, y no a un paper de este modelo.

## Capacidades

- Clasificacion de tokens sobre texto: asignacion de una etiqueta a cada token de entrada, tipico de tareas de NER.
- Extraccion de entidades de dominio biomedico o clinico, segun el conjunto de etiquetas con el que se haya ajustado (no documentado).
- Procesamiento de entradas de hasta la longitud de contexto de la arquitectura base (probablemente 512 tokens, no confirmado).
- No es un modelo generativo: no produce texto libre, resumenes ni respuestas conversacionales.
- Tool calling / function calling: no soportado (no es un modelo instruido ni generativo).
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponible; el idioma de entrenamiento no esta documentado.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Extraccion de entidades en informes clinicos: el modelo puede etiquetar farmacos, diagnosticos, procedimientos y dosis en notas medicas en texto libre, actuando como primer paso de un pipeline de estructuración antes de volcar los datos a una base clinica.
- Ayuda a la codificacion clinica: las entidades detectadas pueden mapearse despues a terminologias como CIE-10, SNOMED CT o ATC, reduciendo el trabajo manual de codificacion en facturacion y estadistica hospitalaria.
- De-identificacion de historiales: un NER entrenado en dominio clinico permite localizar nombres, fechas, identificadores y localizaciones para su anonimizacion previa a la investigacion o al entrenamiento de otros modelos.
- Farmacovigilancia: extraccion de reacciones adversas y farmacos implicados en informes de casos o notificaciones espontaneas, para su agregacion en sistemas de senalizacion.
- Indexacion y busqueda en literatura biomedica: al etiquetar entidades en resumenes y articulos, se puede construir un indice enriquecido que mejore la recuperacion de documentos en buscadores internos o en bases tipo PubMed.
- Preprocesado para pipelines de RAG clinico: las entidades extraidas sirven como metadatos o filtros en un sistema de recuperacion aumentada, mejorando la precision del contexto recuperado antes de pasarlo a un modelo generativo.
- Limpieza y curacion de corpus de investigacion: el modelo puede marcar automaticamente entidades relevantes en grandes volumenes de texto para revision posterior, reduciendo el etiquetado manual a una fase de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, ni metricas de precision, recall o F1 sobre conjuntos como BC5CDR, NCBI-disease, JNLPBA o i2b2, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 430 MB; en fp16, unos 215 MB; en int8, alrededor de 108 MB. Con activaciones y batch pequeno, el consumo total se situa en el rango de 1 a 2 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente (RTX 3060, RTX 4090, etc.); en entornos de servidor, una T4 o L4 basta, e incluso una A100 o H100 estarian sobredimensionadas para un solo flujo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, y tambien en CPU con latencias aceptables para procesamiento por lotes.
- Opciones de despliegue: pipeline de `transformers` (PyTorch), exportacion a ONNX Runtime o TorchScript para reducir latencia, y servidores de inferencia con soporte para modelos encoder como Triton Inference Server o FastAPI con batching dinamico. Los servidores orientados a modelos generativos (vLLM, TGI) no estan pensados para este tipo de tarea.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas. Al tratarse de un encoder de 107 M de parametros con secuencias de hasta 512 tokens, el coste por lote es bajo en GPU moderna, pero cualquier cifra concreta requeriria una medicion propia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mediscribe-biobert-ner (este modelo) | 107,7 M | no disponible | Encoder BERT para NER | no disponible | HuggingFace, 0 descargas |
| dmis-lab/biobert-base-cased-v1.1 | ~108 M | 512 tokens | Encoder BERT preentrenado en PubMed y PMC | MIT (segun el repositorio original; verificar) | HuggingFace, ampliamente usado |
| microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract | ~110 M | 512 tokens | Encoder BERT preentrenado desde cero en PubMed | MIT (segun el repositorio original; verificar) | HuggingFace, ampliamente usado |
| allenai/scibert_scivocab_uncased | ~110 M | 512 tokens | Encoder BERT preentrenado en literatura cientifica | Apache-2.0 (segun el repositorio original; verificar) | HuggingFace, ampliamente usado |

Nota: los tres modelos alternativos son checkpoints de proposito general que habitualmente requieren ajuste fino para NER, mientras que este repositorio ya se presenta como modelo de clasificacion de tokens. No hay datos de rendimiento que permitan comparar la calidad de las etiquetas entre ellos.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que genera incertidumbre juridica para uso comercial o para su integracion en productos. Debe aclararse con el autor antes de cualquier despliegue.
- Trazabilidad nula del entrenamiento: no se documentan datos, etiquetas, hiperparametros ni procedimiento, por lo que no es posible auditar sesgos ni reproducir resultados.
- Riesgo de sesgo de dominio: al desconocerse el corpus de ajuste, no se puede garantizar el comportamiento sobre jerga clinica de un pais o especialidad concretos, ni sobre abreviaturas locales.
- Riesgo de error en las etiquetas: aunque no es un modelo generativo y no alucina texto, si puede asignar etiquetas incorrectas, especialmente en entidades ambiguas, anidadas o poco frecuentes en el corpus de entrenamiento.
- Cobertura limitada por contexto: si se confirma la ventana de 512 tokens de BERT-base, los documentos largos requeriran troceado, con el consiguiente riesgo de partir entidades entre fragmentos.
- Idioma no declarado: no hay evidencia de soporte multilingue; asumir que funciona en castellano sin validacion previa es un error frecuente.
- Repositorio sin validacion social: 0 descargas y 0 likes implican que no hay experiencia comunitaria documentada sobre su calidad ni sobre problemas conocidos.
- Uso clinico: no debe emplearse como herramienta de decision diagnostica sin supervision profesional; su funcion razonable es la extraccion y estructuración de informacion, no la interpretacion clinica.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-11, lo que sugiere una fecha mal configurada o un entorno de pruebas; conviene verificar la procedencia del artefacto antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RATHANSUMBET14/mediscribe-biobert-ner
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/1910.09700 (Lacoste et al., calculo de emisiones de carbono; aparece en la plantilla de la model card y no es un paper de este modelo)
- Referencia contextual sobre la arquitectura base BERT: https://arxiv.org/abs/1810.04805
- Referencia contextual sobre BioBERT: https://arxiv.org/abs/1901.08746
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo.
