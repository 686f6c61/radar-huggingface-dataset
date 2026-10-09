# kdemyokhin/bert-finetuned-ner

## Resumen

`kdemyokhin/bert-finetuned-ner` es un checkpoint de clasificacion de tokens (token classification) obtenido por fine-tuning del modelo de embeddings `BAAI/bge-small-en-v1.5`, un transformer encoder-only de tipo BERT de 33.215.625 parametros. El autor lo publica bajo licencia MIT con pesos en safetensors y lo etiqueta para la pipeline `token-classification` de la libreria `transformers`, con el objetivo declarado de resolver reconocimiento de entidades nombradas (NER), aunque la model card no especifica el dataset, el esquema de etiquetas ni el dominio de aplicacion.

La relevancia de esta ficha es mas bien metodologica que practica: el modelo registra 0 descargas y 0 likes, y los resultados que declara en su propio conjunto de evaluacion son Precision 0,0, Recall 0,0 y F1 0,0, con una accuracy de 0,7737. Esa combinacion (accuracy alta con F1 nulo) es la firma tipica de un entrenamiento que ha colapsado hacia la clase mayoritaria "O" (fuera de entidad), algo coherente con la tabla de entrenamiento publicada, que solo registra 4 epocas y 16 pasos de optimizacion cuando los hiperparametros declarados apuntan a 10 epocas.

En la practica, el checkpoint no es utilizable como extractor de entidades en produccion y solo sirve como material de estudio sobre fallos de fine-tuning, como punto de partida para reentrenar sobre un dataset anotado real o como ejemplo de model card autogenerada por el `Trainer` de HuggingFace sin revision posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (modelo base `BAAI/bge-small-en-v1.5`) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base emplea por configuracion estandar ventanas de 512 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors en precision completa (0,4 GB de tamano de repo) |
| Idiomas soportados | no disponible en los metadatos del modelo; el modelo base `BAAI/bge-small-en-v1.5` esta orientado a ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `BAAI/bge-small-en-v1.5`, un encoder transformer de tipo BERT de 12 capas y 33,2 millones de parametros, originalmente entrenado por BAAI para retrieval denso y similitud semantica. Sobre esa base se anade una cabeza de clasificacion de tokens para NER. La model card no documenta ninguna innovacion arquitectonica adicional, ni atencion lineal, ni decodificacion especulativa, ni mecanismos MoE o hibridos: se trata de un fine-tuning convencional de la tarea completa.

La informacion de entrenamiento publicada es incompleta y presenta incoherencias. Los hiperparametros declarados son learning rate 1e-05, `train_batch_size` 32, `eval_batch_size` 128, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y `num_epochs` 10. Sin embargo, la tabla de resultados solo registra 4 epocas y 16 pasos totales, lo que sugiere que el entrenamiento se interrumpio o que el conjunto de entrenamiento es extremadamente pequeno. No se especifica el dataset, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo fases de RLHF o DPO (improbables en un encoder de NER). La evolucion de la perdida de validacion (1,8721 en el paso 4, 1,7732 en el paso 8, 1,6852 en el paso 12 y 1,6079 en el paso 16) es monotamente descendente, pero la precision y el recall caen a cero en el ultimo registro, lo que confirma el colapso hacia la clase mayoritaria.

## Capacidades

Advertencia previa: dado que el checkpoint publica F1 0,0 y Precision 0,0 en su propio conjunto de evaluacion, las capacidades que se enumeran a continuacion describen lo que cabria esperar de un modelo NER construido sobre este backbone, no lo que este checkpoint concreto entrega hoy.

- Clasificacion de tokens (NER): asignacion de etiquetas BIO/BILUO a cada token de entrada, con soporte para notacion subword. En este checkpoint la prediccion efectiva es practicamente siempre la clase "O".
- Extraccion de entidades planas: personas, organizaciones, localizaciones y miscelanea son los esquemas habituales de este tipo de modelos; el esquema real de este checkpoint es desconocido porque el dataset no se documenta.
- Codificacion de frases: al derivar de `bge-small-en-v1.5`, el backbone conserva la capacidad de producir embeddings de frase utiles para similitud semantica y retrieval, aunque la cabeza de clasificacion de tokens no se usa para eso.
- Tool calling / function calling: no soportado. Es un modelo encoder-only sin generacion autoregresiva ni formato de mensajes conversacionales.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles en los metadatos; el modelo base esta orientado a ingles.
- Capacidades especiales (thinking mode, vision, audio): ninguna. No hay modo de razonamiento, ni encoder multimodal, ni procesamiento de audio.
- Inferencia por lotes: si, es un encoder pequeno que se beneficia de lotes grandes (`eval_batch_size` 128 en el entrenamiento declarado).

## Casos de uso

Advertencia previa: el checkpoint actual no supera un F1 de 0,0, por lo que ninguno de los escenarios siguientes es desplegable con estos pesos tal cual. Se listan como casos de uso objetivo de un NER sobre este backbone, asumiendo un reentrenamiento con datos anotados y validacion previa.

- Extraccion de entidades en documentos legales o contractuales: un encoder de 33 millones de parametros procesa cada pagina en milisegundos en CPU, lo que permite anotar grandes volumenes de contratos para poblar indices de partes, fechas y jurisdicciones. Requiere reentrenar sobre un corpus anotado del dominio legal.
- Preanotacion en pipelines de etiquetado humano: el modelo se conecta al backend de una herramienta de anotacion para proponer entidades y reducir el trabajo manual. Aqui el requisito no es un F1 perfecto, sino un recall razonable, que este checkpoint no alcanza en absoluto.
- Enriquecimiento de registros en CRM o ERP: deteccion de nombres de empresa, personas y direcciones dentro de correos y notas de texto libre para normalizar campos estructurados.
- Analisis de noticias y monitorizacion de medios: extraccion de organizaciones y localizaciones para construir grafos de co-ocurrencia y seguimiento de entidades a lo largo del tiempo.
- Filtrado y moderacion de contenido: identificacion de menciones a personas concretas en textos de usuario para aplicar politicas de privacidad o de escalado a revision humana.
- Anonimizacion y cumplimiento de proteccion de datos: deteccion de nombres propios y localizaciones para su enmascaramiento previo a almacenar o compartir texto, en linea con requisitos tipo RGPD. Es el caso de uso donde la precision importa mas que el recall, y donde un modelo que no detecta nada resulta inutil.
- Indexacion semantica combinada: uso del backbone `bge-small-en-v1.5` para generar embeddings de fragmentos y de la cabeza NER para etiquetar metadatos, todo en un unico paso de inferencia.
- Clasificacion de tickets de soporte: extraccion de producto, version y componente citados en el ticket para enrutarlo automaticamente al equipo correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, CoNLL-2003, etc.) en la informacion disponible. El campo `model-index` del modelo esta vacio (`"results": []`). Los unicos datos numericos son los que el propio autor declara sobre su conjunto de evaluacion no identificado:

| Metrica | Valor (evaluacion final) |
|---|---|
| Loss | 1,6079 |
| Precision | 0,0 |
| Recall | 0,0 |
| F1 | 0,0 |
| Accuracy | 0,7737 |

Evolucion durante el entrenamiento declarado (16 pasos, 4 epocas registradas de las 10 configuradas):

| Training loss | Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1,9071 | 1,0 | 4 | 1,8721 | 0,0255 | 0,0253 | 0,0254 | 0,6889 |
| 1,8096 | 2,0 | 8 | 1,7732 | 0,0597 | 0,0202 | 0,0302 | 0,7456 |
| 1,6804 | 3,0 | 12 | 1,6852 | 0,1111 | 0,0101 | 0,0185 | 0,7687 |
| 1,5551 | 4,0 | 16 | 1,6079 | 0,0 | 0,0 | 0,0 | 0,7737 |

Interpretacion: la accuracy sube mientras precision y recall se desploman a cero, patron clasico de un modelo que predice exclusivamente la etiqueta mayoritaria. No hay datos comparativos propios ni evaluacion sobre un test set publico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32 (33.215.625 parametros x 4 bytes), unos 66 MB en fp16/bf16 y unos 33 MB en int8. Son estimaciones aritmeticas a partir del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo no aprovecha ni necesita A100, H100 ni tarjetas de gama alta. Una T4, una GTX 1650 o incluso una iGPU moderna bastan.
- Cabe en GPU de consumo: si, con enorme margen, en cualquier RTX, GTX o incluso en CPU exclusivamente. El cuello de botella real es el preprocesado del tokenizador, no la GPU.
- Opciones de despliegue: pipeline `token-classification` de `transformers`; exportacion a ONNX con `optimum` y ejecucion con ONNX Runtime; TorchScript; servido con FastAPI, Triton (backend ONNX) o BentoML. No aplican vLLM ni TGI, orientados a modelos generativos, ni Ollama, orientado a LLM generativos. `llama.cpp` soporta BERT principalmente en modo embeddings, no como clasificador de tokens.
- Latencia y throughput estimados: no publicados. Para un encoder de 33 millones de parametros y secuencias de hasta 512 tokens, lo esperable es un orden de magnitud de unidades de milisegundos por lote en GPU y decenas de milisegundos en CPU; se trata de una estimacion orientativa, no de una medicion del autor.
- Almacenamiento: el repositorio ocupa 0,4 GB, muy por encima de los 133 MB de los pesos en fp32, probablemente por artefactos adicionales del `Trainer` u optimizador.

## Comparativa con modelos similares

| Modelo | Arquitectura / base | Parametros | Dataset de fine-tuning | F1 declarado | Licencia |
|---|---|---|---|---|---|
| `kdemyokhin/bert-finetuned-ner` | BERT encoder (`BAAI/bge-small-en-v1.5`) | 33,2 M | desconocido | 0,0 | MIT |
| `SlavaKemDev/bert-finetuned-ner` | BERT encoder (`BAAI/bge-small-en-v1.5`) | 33,2 M | desconocido | no disponible | no disponible |
| `nt-ai/bert-finetuned-ner` | BERT encoder (`bert-base-cased`) | no disponible (~110 M en `bert-base`) | conll2003 | 0,9420 | no disponible |
| `BAAI/bge-small-en-v1.5` | BERT encoder (modelo base sin cabeza NER) | 33,2 M | no aplica (entrenado para retrieval) | no aplica | no verificada en la informacion disponible |

Observaciones: `SlavaKemDev/bert-finetuned-ner` comparte modelo base y dataset "unknown" con el modelo analizado, lo que sugiere un checkpoint hermano o duplicado dentro de la misma practica de entrenamiento. `nt-ai/bert-finetuned-ner` es la referencia funcional mas cercana: mismo tipo de arquitectura, dataset publico (CoNLL-2003) y F1 de 0,9420, frente al F1 de 0,0 del modelo analizado. La diferencia de tamano (110 M frente a 33 M) no explica por si sola una brecha de casi 95 puntos de F1; la causa mas probable es el dataset de entrenamiento no documentado y el entrenamiento truncado a 16 pasos.

## Limitaciones y advertencias

- Modelo no funcional para NER: Precision 0,0, Recall 0,0 y F1 0,0 en la evaluacion declarada por el propio autor. Cualquier uso en produccion requeriria reentrenamiento y validacion.
- Colapso hacia la clase mayoritaria: la accuracy de 0,7737 con F1 nulo indica que el modelo predice sistematicamente la etiqueta "O". Sobre un texto real, no extraeria ninguna entidad.
- Entrenamiento posiblemente truncado: la tabla publicada solo refleja 4 epocas y 16 pasos, frente a las 10 epocas configuradas. Si el checkpoint corresponde al paso 16, esta muy lejos de converger.
- Dataset desconocido: la model card indica explicitamente "unknown dataset". No se puede saber el esquema de etiquetas, el dominio, el idioma ni la distribucion de clases, lo que impide evaluar su sesgo o su transferibilidad.
- Idiomas: los metadatos no declaran idiomas. El modelo base esta orientado a ingles, por lo que el rendimiento en castellano es, como minimo, incierto.
- Riesgo de alucinacion: en un clasificador de tokens no hay generacion de texto, pero si hay falsos positivos y falsos negativos; con este checkpoint, el fallo dominante es el falso negativo sistematico.
- Sesgos: no documentados. Al desconocerse el dataset, no se puede auditar el sesgo de representacion de nombres, origenes o generos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No hay restricciones adicionales conocidas, pero la licencia no cubre las obligaciones derivadas de tratar datos personales en los casos de uso de anonimizacion.
- Trazabilidad: la model card es la autogenerada por el `Trainer`, con secciones "More information needed" sin completar. No hay paper, ni demo, ni informe de evaluacion.
- Cero adopcion: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusiones que permitan contrastar experiencias de uso.
- Idoneidad para produccion: nula en su estado actual. Solo es razonable como punto de partida para un reentrenamiento supervisado con datos anotados propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdemyokhin/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Checkpoint hermano con el mismo modelo base: https://huggingface.co/SlavaKemDev/bert-finetuned-ner
- NER funcional sobre `bert-base-cased` y CoNLL-2003: https://huggingface.co/nt-ai/bert-finetuned-ner
- Ficha de registro en Free2AITools (SlavaKemDev): https://free2aitools.com/model/slavakemdev/bert-finetuned-ner
- Ficha de registro en Free2AITools (petneb): https://free2aitools.com/model/petneb/bert-finetuned-ner
- Ficha en AIBase: https://model.aibase.com/models/details/1915693484838903810
