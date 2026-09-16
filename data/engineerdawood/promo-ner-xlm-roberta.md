# engineerdawood/promo-ner-xlm-roberta

## Resumen

promo-ner-xlm-roberta es un modelo de reconocimiento de entidades nombradas (NER) publicado en Hugging Face por el usuario engineerdawood. Se trata de un ajuste fino de FacebookAI/xlm-roberta-base, el encoder multilingue de Meta AI con 278 millones de parametros y 12 capas, sobre un conjunto de datos que el propio autor no documenta ("trained on an unknown dataset"). El checkpoint resultante contiene 277.459.977 parametros, ocupa 2,2 GB en el repositorio (pesos en safetensors) y se distribuye bajo licencia MIT con el pipeline token-classification de la libreria transformers.

El modelo esta etiquetado como generated_from_trainer, es decir, su model card fue generada automaticamente por el Trainer de Hugging Face y no ha sido revisada ni completada. El entrenamiento consistio en 3 epochs con una unica actualizacion por epoch (pasos 1, 2 y 3), lo que implica un conjunto de entrenamiento de aproximadamente 16 ejemplos o menos. Las metricas declaradas por el autor en el conjunto de evaluacion son precision 0,0, recall 0,0, F1 0,0 y accuracy 0,2, con una perdida final de 2,1336.

En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, no tiene resultados en el model-index y su rendimiento declarado en la tarea objetivo es nulo. Su interes practico es, por tanto, muy limitado: funciona como ejemplo documentado de ajuste fino fallido o incompleto sobre XLM-RoBERTa y como advertencia sobre la publicacion de checkpoints con metricas sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo RoBERTa (12 capas, 768 de dimension oculta, 12 cabezas de atencion) |
| Parametros totales | 277.459.977 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredada de xlm-roberta-base, 514 posiciones incluyendo offsets) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (el autor no los documenta; el modelo base XLM-R cubre 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |
| Tarea | token-classification (reconocimiento de entidades nombradas) |
| Modelo base | FacebookAI/xlm-roberta-base |
| Tamano del repositorio | 2,2 GB |
| Libreria | transformers |
| Vocabulario | 250.002 tokens SentencePiece (heredado del modelo base) |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa-base: un transformer encoder-only de 12 capas con atencion bidireccional completa, 768 dimensiones ocultas, 12 cabezas de atencion y una capa feed-forward intermedia de 3072. El modelo base fue preentrenado con masked language modeling (MLM) sobre CC-100, un corpus de aproximadamente 2,5 TB de CommonCrawl filtrado en 100 idiomas, sin objetivo de prediccion de frase siguiente (estilo RoBERTa) y con un vocabulario SentencePiece de 250.002 entradas. Al ser un encoder, no emplea RLHF ni DPO, y no dispone de decodificacion autoregresiva.

Sobre ese modelo base se anadio una cabeza de clasificacion de tokens y se ajusto con los siguientes hiperparametros: learning rate 2e-05, scheduler lineal, batch de entrenamiento y evaluacion de 16, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, seed 42 y 3 epochs. El registro de entrenamiento muestra un unico step por epoch, lo que confirma un dataset de entrenamiento minimo. La perdida de validacion apenas se movio (2,1836 en la epoch 1, 2,1437 en la 2 y 2,1336 en la 3) y las metricas de entidad permanecieron en cero durante todo el proceso. No se documenta ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal ni tecnicas de eficiencia.

## Capacidades

- Clasificacion de tokens a nivel de secuencia, es decir, asignacion de una etiqueta BIO a cada token de entrada. El nombre del modelo sugiere un dominio de promociones, pero no hay documentacion del esquema de etiquetas ni del dataset.
- Extraccion de entidades nombradas: en teoria, identificacion de entidades en texto. En la practica, las metricas declaradas (precision, recall y F1 iguales a 0,0) indican que el checkpoint no recupera ninguna entidad en el conjunto de evaluacion.
- Capacidad multilingue potencial heredada de XLM-RoBERTa (100 idiomas en el preentrenamiento), sin verificar ni documentar por el autor.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de thinking mode ni de ningun modo especial de inferencia.
- Salida limitada a logits por token; la entrada esta restringida a 512 tokens.

## Casos de uso

- Validacion de pipelines de NER multilingue: el modelo puede usarse como caso de prueba para comprobar que un pipeline de token-classification con transformers carga correctamente, ejecuta la inferencia y devuelve etiquetas por token. Es adecuado para esto porque el checkpoint es funcional a nivel de codigo, aunque no de calidad.
- Punto de partida para un reajuste fino: al ser un XLM-RoBERTa-base ajustado, puede servir como inicializacion intermedia o como referencia de comparacion en experimentos de formacion. Requiere reentrenamiento con un dataset anotado real antes de cualquier uso productivo.
- Anonimizacion y deteccion de PII (uso previsto, no verificado): un modelo de clasificacion de tokens es la familia adecuada para etiquetar nombres, direcciones o identificadores antes de enmascararlos. Con este checkpoint concreto, la tasa de deteccion declarada es nula, por lo que la tarea no se cumple sin un reentrenamiento.
- Extraccion de entidades en textos promocionales (uso previsto por el nombre): identificacion de marcas, productos, descuentos o fechas en materiales de marketing. Es el escenario que sugiere el identificador del modelo, pero no hay dataset, esquema de etiquetas ni metricas que lo respalden.
- Etiquetado para indexacion y busqueda: enriquecer documentos con entidades para construir indices o filtros. El modelo no aportaria etiquetas fiables en su estado actual; solo seria viable tras un ajuste fino supervisado.
- Investigacion y docencia sobre errores de entrenamiento: el registro de 3 steps y metricas a cero es un ejemplo util para ilustrar sintomas de underfitting, datasets insuficientes y model cards autogeneradas sin revision.
- Evaluacion comparativa de encoders multilingues: puede incluirse como linea base trivial (modelo que no detecta entidades) frente a otros checkpoints NER en un banco de pruebas propio.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model-index sin entradas; los datos proceden de la tabla de entrenamiento de la model card):

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 2,1336 |
| Precision | 0,0 |
| Recall | 0,0 |
| F1 | 0,0 |
| Accuracy | 0,2 |

Evolucion durante el entrenamiento:

| Epoch | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 1 | 2,1836 | 0,0 | 0,0 | 0,0 | 0,2 |
| 2,0 | 2 | 2,1437 | 0,0 | 0,0 | 0,0 | 0,2 |
| 3,0 | 3 | 2,1336 | 0,0 | 0,0 | 0,0 | 0,2 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, CoNLL-2003, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32, unos 0,55 GB en fp16/bf16 y en torno a 0,3 GB con cuantizacion dinamica int8. El repo ocupa 2,2 GB porque incluye los pesos y los ficheros del Trainer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problemas en RTX 3060, RTX 4090, T4, L4, A10G, A100 y H100; en estas dos ultimas el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (GTX 1650 o superior) e incluso en CPU con tiempos de inferencia aceptables para lotes pequenos.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime (con cuantizacion dinamica), TorchScript y Hugging Face Inference Endpoints (el modelo lleva la etiqueta endpoints_compatible). No es un caso de uso de vLLM ni de TGI, orientados a decodificacion autoregresiva, y no existe conversion oficial a GGUF para Ollama o llama.cpp en token-classification.
- Latencia y throughput estimados: no disponibles. No se publican mediciones del autor ni resultados de la busqueda web.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de sus fichas publicas y de sus modelos base; deben verificarse en cada repositorio antes de tomar decisiones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento NER |
|---|---|---|---|---|---|
| engineerdawood/promo-ner-xlm-roberta | 277.459.977 | 512 tokens | no disponible | MIT | F1 0,0 (declarado) |
| FacebookAI/xlm-roberta-base | 277.459.977 | 512 tokens | 100 idiomas | MIT | no es un modelo NER (requiere ajuste) |
| Davlan/bert-base-multilingual-cased-ner-hrl | aprox. 178 millones | 512 tokens | 10 idiomas de alta recursos | consultar ficha | no disponible en esta busqueda |
| dslim/bert-base-NER | aprox. 108 millones | 512 tokens | ingles | MIT | no disponible en esta busqueda |

La comparacion de rendimiento no es posible con la informacion disponible: el unico dato cuantitativo de este checkpoint es un F1 de 0,0, y no se han recogido resultados de referencia de los modelos alternativos en la busqueda realizada.

## Limitaciones y advertencias

- Rendimiento declarado nulo: precision, recall y F1 iguales a 0,0. El modelo no extrae entidades de forma fiable y no es apto para produccion en su estado actual.
- Accuracy de 0,2 con F1 de 0,0 sugiere un comportamiento cercano a la prediccion constante de la clase "O" (sin entidad), un sintoma tipico de underfitting severo.
- Dataset de entrenamiento no documentado: la model card indica explicitamente "trained on an unknown dataset". Se desconoce el esquema de etiquetas, el dominio, el idioma y el tamano real de los datos.
- Entrenamiento insuficiente: 3 steps en total (uno por epoch), compatible con un conjunto de aproximadamente 16 ejemplos. Es inviable aprender un etiquetado NER con esa cantidad de datos.
- Idiomas no documentados. Aunque el modelo base cubre 100 idiomas, no hay ninguna evidencia de que este ajuste funcione en castellano ni en ninguna otra lengua.
- Limite de contexto de 512 tokens, heredado del encoder. Los documentos largos requieren fragmentacion con solapamiento y postprocesado de entidades cortadas.
- Riesgo de alucinacion no aplicable como tal (no genera texto), pero si hay riesgo de falsos negativos sistematicos y de etiquetado incoherente fuera de la distribucion de entrenamiento.
- Sesgos: no se documentan sesgos propios, pero el modelo base XLM-R hereda los sesgos presentes en CC-100 (sobrerrepresentacion de determinados idiomas, dominios y perspectivas).
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas. El modelo base tambien es MIT, por lo que no hay limitacion legal anadida.
- Model card incompleta: secciones de descripcion, usos previstos, datos de entrenamiento y limitaciones contienen "More information needed", y el model-index no incluye resultados.
- Versiones de framework poco habituales en la model card (Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1, Tokenizers 0.23.2), lo que puede complicar la reproducibilidad del entorno de entrenamiento declarado.
- Antes de cualquier uso real, es imprescindible reentrenar con un dataset anotado propio, definir el esquema de etiquetas y medir con una particion de evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/engineerdawood/promo-ner-xlm-roberta
- Modelo base XLM-RoBERTa-base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Documentacion de XLM-RoBERTa en transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Guia de token classification de transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre el modelo; los resultados obtenidos corresponden a un portal de reservas de hoteles y no guardan relacion con esta ficha.
