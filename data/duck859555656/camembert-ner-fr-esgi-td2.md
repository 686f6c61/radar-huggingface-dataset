# Duck859555656/camembert-ner-fr-esgi-td2

## Resumen

camembert-ner-fr-esgi-td2 es un modelo de reconocimiento de entidades nombradas (NER, *token classification*) obtenido mediante *fine-tuning* de almanach/camembert-base, una variante de RoBERTa entrenada sobre corpus en frances. Lo publica el usuario Duck859555656 y se distribuye con licencia MIT. El modelo tiene 110.032.898 parametros totales (arquitectura encoder-only densa) y un repositorio de 2,0 GB que incluye pesos en formato safetensors.

La relevancia del modelo es limitada y conviene ser explicito al respecto: los resultados de evaluacion declarados por el autor muestran precision, recall y F1 iguales a 0,0 junto con una accuracy de 0,9965. Esa combinacion es la firma tipica de un clasificador degenerado que predice unicamente la etiqueta mayoritaria (la clase "O", es decir, "fuera de entidad"), por lo que no detecta ninguna entidad real. El modelo no aporta mejoras sobre el modelo base y no deberia considerarse apto para produccion en su estado actual.

Se trata, por el nombre del identificador ("esgi-td2") y por el patron de metricas, de un artefacto de entrenamiento academico o de practicas, publicado sin documentacion sustantiva: la propia model card indica "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia RoBERTa / CamemBERT) |
| Parametros totales | 110.032.898 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base CamemBERT soporta 512 tokens |
| Tipos de cuantizacion | no disponibles (el autor no declara ninguna) |
| Idiomas soportados | no disponibles (el modelo base almanach/camembert-base esta entrenado sobre corpus en frances) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | almanach/camembert-base |
| Pipeline | token-classification |
| Libreria | transformers |
| Tamano del repositorio | 2,0 GB |
| Versiones de framework | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer de tipo encoder con atencion bidireccional, derivado de la receta de RoBERTa y adaptado al frances mediante el tokenizador y el corpus de CamemBERT. Sobre ese encoder se anade una cabeza de clasificacion de tokens (*token classification head*) que asigna una etiqueta BIO a cada *token*, en la linea estandar de los modelos NER.

El autor documenta los hiperparametros de entrenamiento: learning rate 5e-05, tamano de lote de 16 (tanto en entrenamiento como en evaluacion), semilla 42, optimizador AdamW con *fused* activado y betas (0,9; 0,999), epsilon 1e-08, planificador de learning rate lineal y 4 epocas. No se especifica el conjunto de datos de *fine-tuning* (la plantilla indica "on the None dataset"), ni el numero de tokens de entrenamiento, ni la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. No se documenta ninguna innovacion tecnica ni variante de atencion.

El punto critico es el resultado: el *validation loss* desciende de 0,0437 (epoca 1) a 0,0186 (epoca 4) mientras la accuracy sube de 0,9937 a 0,9965, pero precision, recall y F1 se mantienen en 0,0 en las cuatro epocas. La divergencia entre una accuracy casi perfecta y un F1 nulo indica que el modelo ha colapsado hacia la clase mayoritaria y no reconoce entidades. Es un caso de desequilibrio de clases extremo o de datos de evaluacion mal etiquetados, no un modelo funcional.

## Capacidades

- Clasificacion de tokens (*token classification*), que teoricamente permite el etiquetado de entidades nombradas en texto.
- En la practica, los propios resultados declarados (precision, recall y F1 = 0,0) indican que no detecta entidades: la salida se limita a la etiqueta mayoritaria.
- Capacidades multilingues: no declaradas. El modelo base esta orientado al frances; el identificador incluye "fr", pero no hay confirmacion de cobertura de idiomas.
- Soporte de *tool calling* / *function calling*: no. Es un encoder discriminativo, no un modelo generativo.
- Soporte de agentes y razonamiento multi-paso: no.
- Generacion de texto, codigo o matematicas: no. La arquitectura no es generativa.
- Modo de razonamiento explicito (*thinking*), vision o audio: no.
- Integracion con la libreria transformers y compatibilidad con *endpoints* (etiqueta endpoints_compatible).

## Casos de uso

Debido a los resultados declarados, no se pueden recomendar casos de uso en produccion. Se listan a continuacion los escenarios en los que un modelo NER frances funcionaria, indicando que este artefacto concreto no los cubre hoy:

- Extraccion de entidades en documentos legales franceses: un CamemBERT afinado para NER permitiria extraer personas, organizaciones y localizaciones de contratos y sentencias. Este modelo no lo hace, ya que devuelve F1 = 0,0.
- Anonimizacion de datos personales (PII) antes de almacenar registros: requiere detectar nombres y direcciones con alta exhaustividad. Con recall 0,0 el modelo no detecta ninguna entidad y no cumple el requisito.
- Enriquecimiento de bases de conocimiento a partir de prensa: serviria para poblar grafos con entidades detectadas. No viable con este modelo.
- Indexacion semantica y busqueda por entidad en corpus en frances: no aplicable en el estado actual.
- Preprocesado en pipelines de analitica de opiniones sobre resenas: requiriria entidades de producto y marca fiables. No disponible con este modelo.
- Etiquetado asistido en anotacion humana: la salida mayoritaria no aporta informacion util al anotador.

En cualquier caso, el uso sensato del artefacto se limita a su estudio como ejemplo de entrenamiento fallido por desequilibrio de clases o a la reproduccion de la receta de *fine-tuning* sobre el modelo base almanach/camembert-base para corregirla.

## Benchmarks y rendimiento

El campo `model-index` de la model card declara el modelo pero con la lista de resultados vacia, por lo que no hay benchmarks externos publicados (MMLU, HumanEval, GSM8K u otros no aplican a un modelo de clasificacion de tokens). El autor si publica la tabla de entrenamiento:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 160 | 0,0437 | 0,0 | 0,0 | 0,0 | 0,9937 |
| 2,0 | 320 | 0,0238 | 0,0 | 0,0 | 0,0 | 0,9961 |
| 3,0 | 480 | 0,0198 | 0,0 | 0,0 | 0,0 | 0,9963 |
| 4,0 | 640 | 0,0186 | 0,0 | 0,0 | 0,0 | 0,9965 |

Evaluacion final declarada: loss 0,0186; precision 0,0; recall 0,0; F1 0,0; accuracy 0,9965. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 110 millones de parametros ocupan aproximadamente 440 MB, mas el *overhead* de activaciones y tokenizador; en FP16/BF16 baja a unos 220 MB. En la practica cabe comodamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). En centro de datos, una T4 o L4 es mas que suficiente; no se justifica A100 ni H100 para inferencia de este modelo.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 4 GB de VRAM. Tambien puede ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: transformers con `pipeline("token-classification")`, TorchServe o un servidor FastAPI propio, y Hugging Face Inference Endpoints (el modelo lleva la etiqueta `endpoints_compatible`). La conversion a ONNX o a formatos de runtime ligero seria factible dado el tamano, aunque el autor no la proporciona.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

No se dispone de datos verificables de estos modelos comparables dentro de la informacion proporcionada; la columna de rendimiento se deja como "no disponible" para no inventar cifras.

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Duck859555656/camembert-ner-fr-esgi-td2 | 110 M | no disponible (base: 512) | token-classification NER | MIT | F1 = 0,0 declarado |
| almanach/camembert-base (modelo base) | 110 M | 512 | modelado de lenguaje enmascarado (preentrenamiento) | MIT | no disponible en esta informacion |
| Otros modelos NER en frances de la comunidad (p. ej. variantes Jean-Baptiste/camembert-ner o modelos Flair en frances) | no disponible | no disponible | token-classification NER | no disponible | no disponible |

No se proporcionan datos de rendimiento de terceros, por lo que no es posible establecer una comparacion cuantitativa en esta ficha.

## Limitaciones y advertencias

- Modelo no funcional para NER en su estado actual: precision, recall y F1 son 0,0 segun la propia model card. La accuracy de 0,9965 es enganosa y refleja el predominio de la clase mayoritaria.
- Riesgo de colapso de clase muy alto: el desequilibrio entre etiquetas "O" y etiquetas de entidad no se ha corregido (no se documenta reponderacion, *focal loss* ni muestreo estratificado).
- Documentacion insuficiente: la model card deja "More information needed" en descripcion, usos previstos y datos de entrenamiento; no se puede auditar el corpus ni el esquema de etiquetas.
- Idiomas: no declarados. Al derivar de un modelo frances, es probable que solo tenga sentido sobre texto en frances, pero no hay confirmacion.
- Sesgos conocidos: no disponibles, al no documentarse el dataset de entrenamiento.
- Alucinacion: no aplica en el sentido generativo (modelo discriminativo), pero la salida de etiquetas es poco fiable y esta sesgada hacia "O".
- Licencia MIT: permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright. No obstante, la calidad del artefacto hace desaconsejable su uso comercial.
- Produccion: no recomendado. Antes de cualquier despliegue habria que reentrenar o corregir el *fine-tuning* y validar con metricas por clase.
- Reproducibilidad: se documentan los hiperparametros y las versiones de framework, pero no la particion de datos ni la semilla de division, por lo que la reproduccion exacta no esta garantizada.
- Fecha de creacion registrada: 2026-09-14, con ultima actualizacion 2026-09-14.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Duck859555656/camembert-ner-fr-esgi-td2
- Modelo base: https://huggingface.co/almanach/camembert-base
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a un paper, a un repositorio de codigo ni a demos. Los resultados de busqueda devueltos corresponden a contenidos sin relacion (prospectos del draft de la NFL) y se descartan.
