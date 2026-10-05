# db1boy/bge-small-ner

## Resumen

bge-small-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino (*fine-tuning*) del modelo de embeddings BAAI/bge-small-en-v1.5. Lo publica el usuario db1boy en HuggingFace y se distribuye bajo licencia MIT. Se trata de un encoder tipo BERT de 33.215.625 parametros (unos 33,2 millones) con cabeza de clasificacion de tokens, por lo que su tarea es etiquetar secuencias (token classification), no generar texto.

El modelo resuelve el problema clasico de extraer entidades (personas, organizaciones, lugares u otras categorias definidas por el conjunto de etiquetas) de un texto. Su relevancia practica radica en el tamano: al tener 33 millones de parametros ocupa unos 133 MB en FP32, lo que permite ejecutarlo en CPU o en cualquier GPU consumer con latencias muy bajas, algo atractivo para pipelines de extraccion de informacion a gran escala donde el coste por token importa.

La informacion publicada es escasa: la model card es la generada automaticamente por el `Trainer` de HuggingFace y no documenta el conjunto de datos de entrenamiento, el conjunto de etiquetas, la procedencia de los datos ni los idiomas soportados. La unica evaluacion disponible son las metricas de validacion del propio entrenamiento: precision 0.9002, recall 0.9260, F1 0.9129 y accuracy 0.9817, con una perdida de 0.0802.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens segun la configuracion tipica del modelo base BAAI/bge-small-en-v1.5; no especificado en la model card de este modelo |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni ONNX publicadas) |
| Idiomas soportados | no disponible (el modelo base es la variante inglesa `bge-small-en-v1.5`, lo que sugiere entrenamiento en ingles, pero la model card no lo declara) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | token-classification |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 descargas, 0 likes en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-10-04 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT, heredado directamente de BAAI/bge-small-en-v1.5, al que se le ha anadido (o reutilizado) una cabeza de clasificacion por token para producir etiquetas BIO/BILUO sobre la secuencia de entrada. El modelo base bge-small-en-v1.5 pertenece a la familia BGE de BAAI, disenada originalmente para recuperacion y similitud semantica; su variante "small" es una red de ~33 millones de parametros, lo que la situa muy por debajo de un BERT-base (110 millones) en coste computacional.

El ajuste fino se realizo con el `Trainer` de HuggingFace durante 10 epocas, con tasa de aprendizaje 2e-05, scheduler lineal, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), semilla 42 y tamano de lote de 16 tanto en entrenamiento como en evaluacion. El repositorio no indica cuantos tokens ni que dataset se usaron ("on an unknown dataset", segun la propia model card), ni si hubo una etapa previa de RLHF/DPO (algo que, por otra parte, no aplica a un modelo discriminativo de este tipo). Las versiones de framework declaradas son Transformers 4.50.0, PyTorch 2.10.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4.

La unica innovacion tecnica reseñable es la eleccion del punto de partida: reutilizar un encoder de recuperacion densa ya preentrenado, en lugar de partir de un BERT generico, lo que puede aportar representaciones mas robustas para dominios con vocabulario especializado. No se documenta ninguna tecnica adicional (atencion lineal, decodificacion especulativa, destilacion, etc.).

## Capacidades

- Etiquetado de secuencias (NER): clasificacion token a token sobre texto de entrada, con salida de etiquetas en formato estandar de `transformers` (`token-classification`).
- Extraccion de entidades en texto: la tarea para la que fue ajustado, aunque el conjunto concreto de etiquetas no esta documentado en el repositorio.
- Inferencia rapida: al ser un encoder de 33,2 millones de parametros, la pasada hacia delante es muy barata y admite lotes grandes en hardware modesto.
- Compatibilidad con `endpoints_compatible`: puede desplegarse en HuggingFace Inference Endpoints sin adaptaciones.
- Capacidades multilingues: no disponibles ni declaradas; el modelo base es la variante en ingles.
- Tool calling / function calling: no disponible (no es un modelo generativo ni soporta plantillas de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo discriminativo, sin generacion de texto).
- Modo "thinking", vision o audio: no disponible.
- Capacidades de generacion de texto, codigo o matematicas: no aplica.

## Casos de uso

- Extraccion de entidades en pipelines de analitica de texto: procesar grandes volumenes de documentos (noticias, tickets, correos) y extraer nombres de personas, organizaciones o lugares. El reducido tamano del modelo permite escalar horizontalmente a bajo coste.
- Preprocesado para sistemas RAG: anonimizar o etiquetar entidades antes de indexar documentos, de modo que las consultas puedan filtrarse por entidad. Su coste por token es minimo frente a un modelo generativo.
- Anonimizacion y cumplimiento normativo (RGPD): deteccion de nombres y datos personales en textos antes de almacenarlos o compartirlos, ejecutando el modelo en local sin enviar datos a terceros.
- Enriquecimiento de bases de datos y CRM: normalizar campos de contacto o empresa a partir de texto libre introducido por usuarios, integrado como tarea previa a un proceso ETL.
- Indexacion semantica combinada: usar el mismo encoder ajustado para NER y, en su variante base, para embeddings de recuperacion, simplificando el *stack* de dependencias en produccion.
- Inferencia en el borde o en CPU: al ocupar unos 133 MB en FP32 (66 MB en FP16), puede desplegarse en contenedores ligeros, funciones serverless o dispositivos sin GPU.
- Filtrado previo en pipelines de moderacion o clasificacion: descartar o marcar documentos irrelevantes por las entidades que contienen antes de pasarlos a modelos mayores y mas caros.

## Benchmarks y rendimiento

El campo `model-index` del repositorio no contiene ningun resultado (`results: []`), por lo que no hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K, CoNLL-2003, etc.). Los unicos datos disponibles son las metricas de validacion del propio entrenamiento, declaradas por el autor, y no permiten una comparacion directa con otros modelos porque no se especifica el dataset de evaluacion ni el conjunto de etiquetas.

| Metrica (conjunto de validacion, autor) | Valor |
|---|---|
| Loss | 0,0802 |
| Precision | 0,9002 |
| Recall | 0,9260 |
| F1 | 0,9129 |
| Accuracy | 0,9817 |

Evolucion durante el entrenamiento (datos de la model card):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 625 | 0,1772 | 0,7692 | 0,8174 | 0,7926 | 0,9623 |
| 2,0 | 1250 | 0,1126 | 0,8626 | 0,8920 | 0,8770 | 0,9764 |
| 3,0 | 1875 | 0,0920 | 0,8615 | 0,9079 | 0,8841 | 0,9779 |
| 4,0 | 2500 | 0,0836 | 0,8834 | 0,9155 | 0,8992 | 0,9806 |
| 5,0 | 3125 | 0,0830 | 0,8883 | 0,9199 | 0,9038 | 0,9807 |
| 6,0 | 3750 | 0,0782 | 0,8897 | 0,9216 | 0,9053 | 0,9811 |
| 7,0 | 4375 | 0,0792 | 0,8925 | 0,9254 | 0,9087 | 0,9812 |
| 8,0 | 5000 | 0,0808 | 0,8987 | 0,9231 | 0,9108 | 0,9816 |
| 9,0 | 5625 | 0,0799 | 0,8988 | 0,9254 | 0,9119 | 0,9817 |
| 10,0 | 6250 | 0,0802 | 0,9002 | 0,9260 | 0,9129 | 0,9817 |

La curva muestra mejoras marginales a partir de la epoca 5 y una perdida de validacion que deja de descender tras la epoca 6-7, con un ligero repunte en la ultima epoca; no se documenta una parada temprana.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en FP32, 66 MB en FP16/BF16 y 33 MB en INT8 (calculo derivado de 33.215.625 parametros, sin contar activaciones ni memoria del runtime de PyTorch).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. Para despliegue a gran escala con lotes grandes son adecuadas T4, L4, A10 o A100/H100, aunque estas ultimas quedan muy sobredimensionadas para 33 millones de parametros.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer actual y tambien en iGPU. El cuello de botella real sera el preprocesado de texto, no el modelo.
- CPU: puede ejecutarse en CPU sin problemas; es probablemente el escenario de despliegue mas razonable por coste.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportacion a ONNX Runtime o TorchScript, servidores genericos como FastAPI + Uvicorn, Triton Inference Server o TorchServe, y HuggingFace Inference Endpoints (el tag `endpoints_compatible` lo indica). vLLM, TGI, LMDeploy o llama.cpp estan orientados a modelos generativos y no aplican directamente a esta tarea; no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. No se publican mediciones y la model card no incluye informacion de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| db1boy/bge-small-ner | 33,2 M | 512 tokens (heredado del modelo base; no confirmado) | token-classification (NER) | MIT | HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 | 33,2 M | 512 tokens | embeddings / similitud semantica | MIT | HuggingFace, ampliamente usado |
| dslim/bert-base-NER | 110 M | 512 tokens | token-classification (NER en ingles, etiquetas CoNLL: PER/ORG/LOC/MISC) | MIT | HuggingFace, muy extendido |
| Jean-Baptiste/roberta-large-ner-english | 355 M | 512 tokens | token-classification (NER en ingles) | MIT | HuggingFace |

La comparacion de rendimiento con estas alternativas no es posible con los datos disponibles: bge-small-ner no documenta el dataset de evaluacion ni el conjunto de etiquetas, por lo que sus metricas (F1 0,9129) no son equiparables a las publicadas por dslim/bert-base-NER o Jean-Baptiste/roberta-large-ner-english sobre CoNLL-2003. En coste computacional, bge-small-ner es entre 3 y 10 veces mas ligero que esas alternativas.

## Limitaciones y advertencias

- Model card auto-generada y sin revisar: la propia plantilla indica que el autor deberia completarla; faltan descripcion, usos previstos, limitaciones y datos de entrenamiento.
- Dataset de entrenamiento desconocido: no se puede evaluar la cobertura de dominios, la calidad de las anotaciones ni el posible sesgo de las etiquetas.
- Conjunto de etiquetas no documentado: se desconoce que entidades detecta realmente; es imprescindible inspeccionar `config.json` (campos `id2label`/`label2id`) antes de usarlo.
- Idioma: el modelo base es la variante inglesa, por lo que el rendimiento en castellano u otros idiomas es, como minimo, incierto y no esta respaldado por ninguna evaluacion.
- Accuracy potencialmente enganosa: en tareas de etiquetado de secuencias, un 0,9817 de accuracy puede deberse en gran medida a la etiqueta mayoritaria "O" (fuera de entidad); conviene guiarse por el F1 (0,9129) y por metricas por clase.
- Riesgo de falsos negativos y positivos: con precision 0,9002 y recall 0,9260 sobre un conjunto sin especificar, en produccion cabe esperar entidades no detectadas y etiquetas incorrectas, especialmente en textos largos o dominios alejados del entrenamiento.
- Alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de etiquetados erroneos con alta confianza; no debe usarse como unica fuente en tareas criticas sin revision humana.
- Limite de contexto: los textos que excedan la ventana del modelo deberan trocearse, con el consiguiente riesgo de cortar entidades a mitad de mencion y degradar el recall en los bordes.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica poca validacion externa del comportamiento real del modelo.
- Licencia: MIT, permisiva para uso comercial, redistribution y modificacion; se recomienda mantener la atribucion y conservar la licencia del modelo base BAAI/bge-small-en-v1.5 (tambien MIT).
- Fecha de publicacion inusual (2026-10-04): conviene verificar la procedencia del repositorio antes de integrarlo en un pipeline de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/db1boy/bge-small-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de la familia BGE (C-Pack: Packed Resources For General Chinese Embeddings, que describe el preentrenamiento de los modelos BGE): https://arxiv.org/abs/2309.07597
- Repositorio FlagEmbedding de BAAI: https://github.com/FlagOpen/FlagEmbedding
- Documentacion de la tarea token-classification en Transformers: https://huggingface.co/docs/transformers/tasks/token_classification
