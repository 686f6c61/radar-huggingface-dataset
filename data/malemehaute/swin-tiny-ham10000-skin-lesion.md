# malemehaute/swin-tiny-ham10000-skin-lesion

## Resumen

Swin-tiny-ham10000-skin-lesion es un modelo de clasificacion de imagenes desarrollado por el usuario malemehaute, consistente en un Swin Transformer en su variante tiny (a traves de la libreria `timm`) afinado sobre el conjunto de datos dermatoscopicos HAM10000. El modelo resuelve una tarea de clasificacion multiclase con siete categorias diagnosticas de lesiones cutaneas, un problema clasico en dermatologia computacional donde el desbalance de clases y la similitud visual entre lesiones benignas y malignas son los principales retos tecnicos.

Se trata de un proyecto final del curso MIA-ViT (FIUBA), no de un modelo de produccion sanitaria. La model card reporta un F1 macro de 0,715 y un recall macro de 0,767 sobre clases malignas en el test interno de HAM10000, ademas de una evaluacion fuera de dominio sobre PAD-UFES-20 y Fitzpatrick17k y una comparacion contra un baseline CLIP zero-shot. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

La relevancia de esta ficha es acotada: se trata de un artefacto academico con licencia MIT, util como referencia para reproducir pipelines de fine-tuning de vision transformers en imagenes medicas, pero sin validacion clinica ni documentacion suficiente sobre sesgos, calibracion o rendimiento por subgrupo demografico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer, variante tiny (implementacion `timm`) |
| Parametros totales | no disponible en la model card (la variante Swin-Tiny original de Microsoft publica aproximadamente 28 M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, tamano no especificado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,1 GB; no se especifica si son safetensors, PyTorch binario u otro) |

## Arquitectura y entrenamiento

La arquitectura es un Swin Transformer, un vision transformer jerarquico que construye representaciones multiescala mediante ventanas de atencion desplazadas (shifted windows), lo que reduce el coste computacional cuadratico de la atencion global y permite extraer caracteristicas a distintas resoluciones. La variante tiny se carga a traves de `timm`, aunque la model card no detalla el tamano de entrada, el numero de epocas, la estrategia de aumento de datos ni el esquema de optimizacion empleados en el fine-tuning.

El entrenamiento se realizo sobre HAM10000, un conjunto de 10.015 imagenes dermatoscopicas etiquetadas en siete clases diagnosticas. La model card no especifica el numero de tokens o imagenes efectivamente usadas, la division train/validacion/test, ni si se aplicaron tecnicas de reequilibrado de clases pese al fuerte desbalance del dataset. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de alineacion, logicamente innecesarias en una tarea de clasificacion supervisada. Como elemento metodologico, el autor menciona una evaluacion de robustez fuera de dominio en PAD-UFES-20 y Fitzpatrick17k, y una comparacion contra un baseline CLIP zero-shot, cuyos resultados no se reproducen en la model card.

## Capacidades

- Clasificacion de imagenes dermatoscopicas en siete clases diagnosticas de lesiones cutaneas, correspondientes al esquema de etiquetado de HAM10000.
- Inferencia de una unica etiqueta por imagen a traves del pipeline `image-classification` de HuggingFace.
- Evaluacion de robustez fuera de dominio sobre al menos dos conjuntos adicionales (PAD-UFES-20 y Fitzpatrick17k), segun indica el autor.
- Generacion de texto: no disponible (modelo exclusivamente de vision).
- Tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponible.
- Segmentacion, deteccion de objetos o generacion de imagenes: no disponible.

## Casos de uso

- Reproduccion academica de pipelines de fine-tuning: el modelo sirve como punto de partida documentado para experimentar con Swin Transformer sobre HAM10000 en un entorno de investigacion, dado que la carga de `timm` y la licencia MIT facilitan su adopcion.
- Evaluacion de robustez fuera de dominio: el autor proporciona referencias a PAD-UFES-20 y Fitzpatrick17k, lo que permite estudiar como se degrada un clasificador entrenado en dermatoscopia de poblaciones concretas al aplicarse a fotografias clinicas o a tonos de piel subrepresentados.
- Baseline para comparativas metodologicas: con un F1 macro de 0,715 y un recall macro de 0,767 en clases malignas, el modelo puede usarse como referencia frente a arquitecturas alternativas (EfficientNet, ViT, ConvNeXt) en el mismo dataset.
- Docencia en vision por computador aplicada a medicina: permite ilustrar el tratamiento del desbalance de clases, la eleccion de metricas macro y la necesidad de validacion externa en imagenes medicas.
- Prototipado de herramientas de triaje educativo: con las reservas de la seccion de limitaciones, podria integrarse en demostraciones no clinicas que ilustren como un clasificador distingue nevus de melanoma, siempre con supervision profesional y sin uso diagnostico real.
- Estudio de sesgos demograficos: la evaluacion en Fitzpatrick17k, si se documenta adecuadamente, habilita analisis de equidad por fototipo cutaneo, un area critica en dermatologia algoritmica.
- Investigacion sobre calibracion de confianza: al ser un clasificador de siete clases con clases minoritarias, es util para estudiar tecnicas de calibracion y deteccion de incertidumbre antes de cualquier despliegue sanitario.

## Benchmarks y rendimiento

| Metrica | Conjunto de evaluacion | Valor |
|---|---|---|
| F1 macro | Test interno HAM10000 | 0,715 |
| Recall macro (clases malignas) | Test interno HAM10000 | 0,767 |
| Rendimiento fuera de dominio | PAD-UFES-20 y Fitzpatrick17k | no disponible (el autor remite al notebook del proyecto, seccion `cross_df`) |
| Comparacion con baseline CLIP zero-shot | no especificado | no disponible (el autor remite a la seccion 9.1 del proyecto) |

No se han publicado resultados desglosados por clase, matrices de confusion, curvas ROC-AUC ni intervalos de confianza en la informacion disponible. Tampoco se aporta comparacion cuantitativa con otros modelos sobre HAM10000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como estimacion orientativa para una variante Swin-Tiny de aproximadamente 28 M de parametros con entradas de 224x224, la inferencia en precision FP32 requiere del orden de 0,5 a 1,5 GB de VRAM contando pesos y activaciones; en FP16 se reduce sustancialmente. Estas cifras son estimaciones de ingenieria, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Cualquier GPU consumer moderna (por ejemplo, serie RTX 30 o 40) deberia ser suficiente para inferencia dado el tamano reducido del modelo; para entrenamiento o fine-tuning se recomienda al menos 8 GB de VRAM, valor tambien estimado.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano del modelo, aunque el autor no lo confirma.
- Opciones de despliegue: no disponibles de forma explicita. Al estar implementado sobre `timm` y publicarse con pipeline `image-classification`, es compatible con `transformers` y con servidores de inferencia para modelos de vision; no se documenta soporte de llama.cpp, Ollama, vLLM ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malemehaute/swin-tiny-ham10000-skin-lesion | Swin Transformer Tiny | Clasificacion de 7 clases en HAM10000 | F1 macro 0,715; recall macro maligno 0,767 | MIT | HuggingFace, 0 descargas |
| Baseline CLIP zero-shot citado por el autor | CLIP | Clasificacion en HAM10000 | no disponible (referenciado en la seccion 9.1 del proyecto) | no disponible | no disponible |
| Clasificadores EfficientNet sobre HAM10000 | CNN | Clasificacion de 7 clases | no disponible | variable | multiples implementaciones publicas sin ficha verificada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa rigurosa con alternativas de la misma categoria. La informacion proporcionada no incluye los resultados del baseline CLIP ni de otros modelos evaluados en el mismo protocolo.

## Limitaciones y advertencias

- Modelo academico sin validacion clinica: es un proyecto final de curso (MIA-ViT, FIUBA), no un dispositivo medico. No debe emplearse para diagnostico, triaje clinico ni decision terapeutica.
- Sesgos demograficos previsibles: HAM10000 esta compuesto mayoritariamente por imagenes dermatoscopicas de poblaciones concretas; la propia existencia de una evaluacion en Fitzpatrick17k sugiere preocupacion por el rendimiento segun fototipo cutaneo, pero no se publican los resultados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos negativos en clases malignas, especialmente relevante dado que el recall macro reportado es de 0,767, lo que implica que aproximadamente una de cada cuatro lesiones malignas podria no detectarse.
- Desbalance de clases: HAM10000 presenta una sobrerrepresentacion clara de la clase nevus, lo que afecta al aprendizaje de las clasesminoritarias; la model card no documenta estrategias de reequilibrado.
- Ausencia de documentacion tecnica: no se especifican hiperparametros, divisiones de datos, preprocesado, tamano de entrada ni proceso de seleccion de checkpoint, lo que dificulta la reproducibilidad.
- Licencia MIT: permite uso comercial y modificacion, pero la licencia del modelo no exime del cumplimiento del Reglamento Europeo de IA ni de la normativa sanitaria aplicable a software con finalidad medica.
- Contexto y idioma: al ser un modelo de vision, no procesa texto ni mantiene conversaciones; no soporta tool calling, agentes ni razonamiento multi-paso.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso externo ni de validacion por terceros.
- Idiomas soportados: no aplicable. No hay informacion sobre metadatos de idioma porque el modelo no trabaja con texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malemehaute/swin-tiny-ham10000-skin-lesion
- Paper original de Swin Transformer: https://arxiv.org/abs/2103.14030
- Dataset HAM10000: https://doi.org/10.1038/sdata.2018.161
- Dataset PAD-UFES-20: no disponible en la informacion proporcionada
- Dataset Fitzpatrick17k: no disponible en la informacion proporcionada
- Repositorio del proyecto MIA-ViT (FIUBA) y notebook con los resultados `cross_df` y la seccion 9.1: no disponible en la informacion proporcionada
- Libreria `timm`: https://github.com/huggingface/pytorch-image-models
