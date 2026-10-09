# despair101/bge-small-en-v1.5-conll2003-ner

## Resumen

bge-small-en-v1.5-conll2003-ner es un modelo de reconocimiento de entidades nombradas (NER) publicado por el usuario `despair101` en HuggingFace. Se trata de un fine-tuning del encoder `BAAI/bge-small-en-v1.5` sobre una tarea de clasificacion de tokens (pipeline `token-classification`), segun el nombre del repositorio sobre el corpus CoNLL-2003, aunque la propia model card indica que el dataset de entrenamiento es "unknown". El resultado es un extractor de entidades de proposito especifico, no un modelo generativo.

El modelo tiene 33.215.625 parametros (dato real extraido de los pesos en safetensors), lo que lo situa en la gama "small" de la familia BGE. Su repo ocupa 0,1 GB y esta publicado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. Es relevante porque demuestra el patron habitual de reutilizar un encoder de embeddings ya entrenado (BGE, orientado a recuperacion semantica) y especializarlo en una tarea de etiquetado secuencial con relativamente poco coste computacional.

En la evaluacion declarada por el autor alcanza un F1 de 0,9129, precision de 0,9002 y recall de 0,9260, con una perdida de validacion de 0,0802 tras 10 epocas. El modelo no tiene descargas ni "likes" en el momento del registro, y la model card esta generada automaticamente por el `Trainer` de HuggingFace, por lo que carece de documentacion sobre usos previstos y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (transformer denso) heredado de BAAI/bge-small-en-v1.5, con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 admite secuencias de hasta 512 tokens |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (FP32/FP16). Al ser un encoder de 33 M de parametros es convertible a INT8, ONNX y GGUF |
| Idiomas soportados | no declarado; el modelo base y el corpus CoNLL-2003 son en ingles, por lo que el uso practico se limita al ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Version de transformers usada en entrenamiento | 4.50.0 |
| Version de PyTorch usada en entrenamiento | 2.11.0+cu128 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `BAAI/bge-small-en-v1.5`: un transformer encoder de tipo BERT, denso, de 33 M de parametros, sobre el que se ha anadido una cabeza de clasificacion por token (token classification head) y se ha realizado un fine-tuning supervisado. El modelo base pertenece a la familia BGE (BAAI General Embedding), optimizada originalmente para recuperacion de informacion y similitud semantica; reutilizarla para NER implica reaprovechar las representaciones contextuales ya aprendidas y reorientarlas hacia el etiquetado de entidades.

Los hiperparametros declarados en la model card son: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal y 10 epocas. El conjunto de evaluacion sobre el que se reportan las metricas no esta identificado en la model card (figura como "unknown dataset"); por el nombre del repositorio cabe esperar CoNLL-2003, tipicamente con las etiquetas PER, ORG, LOC y MISC en formato BIO, aunque esto no se confirma en la documentacion disponible. La evolucion del entrenamiento es estable: la perdida de entrenamiento baja de 0,4806 (epoca 1) a 0,0287 (epoca 10) y la perdida de validacion se estabiliza en torno a 0,079-0,080 desde la epoca 6, sin senales claras de sobreajuste. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con una tarea discriminativa.

## Capacidades

- Reconocimiento de entidades nombradas (NER) por token: clasifica cada token de la secuencia de entrada en una categoria de entidad segun el esquema de etiquetado del dataset de entrenamiento.
- Extraccion de entidades tipicas de CoNLL-2003: personas, organizaciones, localizaciones y miscelanea (no confirmado explicitamente en la model card).
- Procesamiento por lotes: al ser un encoder de 33 M de parametros, admite lotes grandes en GPU y ejecucion eficiente en CPU.
- Multilingue: no. El modelo base y el corpus de entrenamiento son en ingles, por lo que el rendimiento fuera del ingles es impredecible.
- Tool calling / function calling: no aplica, es un modelo discriminativo, no genera texto ni llamadas a herramientas.
- Capacidades de agente o razonamiento multi-paso: no. No hay generacion de texto ni modo "thinking".
- Vision o audio: no.
- Modo de generacion de texto: no aplica; la salida es una secuencia de etiquetas alineada con los tokens de entrada.
- Uso como encoder de embeddings para similitud o recuperacion: no es su funcion declarada, aunque conserva la arquitectura del modelo base.

## Casos de uso

- Deteccion y anonimizacion de datos personales (PII): el modelo puede etiquetar nombres de personas y organizaciones en textos en ingles para enmascararlos antes de almacenar o compartir datos. Su bajo coste computacional permite aplicar la anonimizacion en pipelines de ingesta de alto volumen sin depender de APIs externas.
- Enriquecimiento de metadatos en sistemas RAG: extraer entidades de los documentos antes de indexarlos permite anadir filtros estructurados (por organizacion, lugar o persona) al motor de recuperacion, mejorando la precision de las consultas frente a la busqueda puramente vectorial.
- Analisis de noticias y monitorizacion de marcas: procesar flujos de articulos en ingles para detectar menciones de empresas, personas y lugares, construyendo series temporales de cobertura mediatica o alertas de reputacion.
- Preprocesado para tareas downstream de NLP: usar las etiquetas de entidades como caracteristicas de entrada en clasificadores de documentos, sistemas de extraccion de relaciones o analisis de sentimiento a nivel de entidad.
- Procesamiento por lotes de documentos legales o financieros: identificar partes implicadas, jurisdicciones y organizaciones citadas en contratos o informes en ingles, como paso previo a la revision humana.
- Clasificacion de tickets de soporte: extraer nombres de producto, empresa o ubicacion mencionados en las solicitudes de clientes para enrutarlas automaticamente al equipo correspondiente.
- Etiquetado a gran escala en CPU: con 33 M de parametros, el modelo puede ejecutarse en servidores sin GPU para procesar millones de documentos en modo batch, a un coste por token muy inferior al de un LLM generativo.
- Prototipado e investigacion academica: servir como linea base ligera para experimentos de NER o para comparar estrategias de fine-tuning sobre encoders de embeddings en lugar de encoders puros tipo BERT.

## Benchmarks y rendimiento

La model card declara resultados en el conjunto de evaluacion (dataset no identificado). El `model-index` del repositorio no contiene ninguna entrada de resultados, por lo que los unicos datos disponibles son los de la tabla de entrenamiento del autor.

| Metrica | Valor (epoca 10) |
|---|---|
| Loss (evaluacion) | 0,0802 |
| Precision | 0,9002 |
| Recall | 0,9260 |
| F1 | 0,9129 |
| Accuracy | 0,9817 |

Evolucion durante el entrenamiento:

| Epoca | Step | Loss validacion | Precision | Recall | F1 | Accuracy |
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

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; ninguno de ellos es aplicable a un modelo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en FP32 y 66 MB en FP16 para los pesos; con overhead de activaciones y lotes de 16-64 secuencias de 512 tokens, el consumo tipico se mantiene por debajo de 1-2 GB.
- Cuantizacion: al no haber versiones cuantizadas publicadas, para reducir memoria habria que convertir los pesos a INT8 (unos 33 MB) o exportar a ONNX Runtime / GGUF.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100; en las GPU de gama alta el modelo queda limitado por el ancho de banda y el overhead de CPU, no por la memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU con memoria compartida.
- Inferencia en CPU: totalmente viable. Es el escenario recomendado para procesamiento batch de gran volumen, con hilos de OpenMP o MKL.
- Opciones de despliegue: pipeline de `transformers` con `AutoModelForTokenClassification`, ONNX Runtime para reducir latencia en CPU, TorchServe o un servicio FastAPI propio, y `optimum` para exportacion. vLLM y TGI no estan orientados a tareas de `token-classification` y no aportan ventaja aqui; llama.cpp y Ollama tampoco son la via natural para un modelo discriminativo.
- Latencia y throughput: no disponibles. Como referencia orientativa no medida, un encoder de 33 M de parametros procesa secuencias de 512 tokens en el orden de milisegundos por lote en una GPU moderna y de decenas de milisegundos por lote en CPU.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, por lo que cabe en cualquier entorno, incluidos contenedores serverless.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos dentro de la informacion proporcionada; los datos de la columna de rendimiento se marcan como no disponibles y deben verificarse en las model cards originales antes de tomar decisiones.

| Modelo | Arquitectura | Parametros | Contexto | F1 en NER | Licencia |
|---|---|---|---|---|---|
| despair101/bge-small-en-v1.5-conll2003-ner | Encoder tipo BERT (base BGE-small) + cabeza de clasificacion | 33,2 M | no disponible (base: 512 tokens) | 0,9129 (evaluacion declarada por el autor, dataset no identificado) | MIT |
| BAAI/bge-small-en-v1.5 | Encoder tipo BERT para embeddings | 33 M (aproximado, segun el modelo base) | 512 tokens | no aplica (no es un modelo NER) | MIT |
| dslim/bert-base-NER | Encoder BERT-base + cabeza de clasificacion, fine-tuneado sobre CoNLL-2003 | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | MIT |
| spaCy en_core_web_trf | Pipeline de transformer para NER | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | MIT |

La ventaja diferencial de este modelo frente a alternativas de mayor tamano es el coste: 33 M de parametros permiten inferencia en CPU a gran escala, a cambio de una capacidad de generalizacion presumiblemente inferior a la de un BERT-base o un modelo basado en LLM.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card esta generada automaticamente, sin seccion de usos previstos, limitaciones ni composicion del dataset de entrenamiento. Esto impide auditar sesgos o cobertura de entidades.
- Dataset de evaluacion no identificado: las metricas de F1 0,9129 no pueden atribuirse con certeza a CoNLL-2003, pese al nombre del repositorio. Los numeros no son comparables con los de otras publicaciones sin esa confirmacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos en la deteccion de entidades, especialmente con entidades ambiguas, nombres poco frecuentes o limites de entidad mal delimitados.
- Sesgos: al derivar de un modelo base entrenado predominantemente con datos web en ingles, es probable que herede sesgos de representacion en cuanto a genero, origen geografico y tipo de entidades. No hay analisis de sesgo disponible.
- Limitacion idiomatica severa: el modelo es en ingles. En castellano o en textos multilingues el rendimiento no esta medido y previsiblemente sera bajo.
- Limitacion de contexto: si se hereda la ventana del modelo base, las secuencias superiores a 512 tokens requieren truncado o segmentacion con ventana deslizante, lo que puede romper entidades a caballo entre fragmentos.
- Sin garantia de soporte: cero descargas, cero "likes" y una unica version publicada en octubre de 2026. No hay evidencia de mantenimiento, versiones posteriores ni comunidad de usuarios.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin obligacion de publicar derivados, siempre que se conserve el aviso de copyright. Conviene verificar de forma independiente la licencia del modelo base y del corpus CoNLL-2003 si se va a reentrenar o redistribuir.
- Caveat de produccion: no incluye tokenizer ni configuracion especifica mas alla de los artefactos estandar de `transformers`; antes de desplegarlo hay que validar el mapeo de etiquetas (`id2label`) y el esquema BIO empleado, ya que no se documenta.
- Sesgo de seleccion en las metricas: el autor reporta la mejor epoca sobre el conjunto de evaluacion, sin conjunto de test independiente, lo que puede sobreestimar el rendimiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/despair101/bge-small-en-v1.5-conll2003-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio de la familia BGE (BAAI): https://github.com/FlagOpen/FlagEmbedding
- Paper de BGE (C-Pack): https://arxiv.org/abs/2309.07597
- Dataset CoNLL-2003 en HuggingFace: https://huggingface.co/datasets/conll2003
- Documentacion de `AutoModelForTokenClassification` de transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Busqueda web realizada: los resultados devueltos no guardan ninguna relacion con el modelo (contenido sobre la serie de animacion Uncle Grandpa), por lo que no se ha incorporado ningun enlace adicional.
