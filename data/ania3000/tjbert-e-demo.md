# ania3000/tjbert-e-demo

## Resumen

`ania3000/tjbert-e-demo` es un modelo de tipo BERT (encoder-only, 105.267.880 parámetros) especializado en la tarea de `fill-mask`, publicado en HuggingFace por el usuario `ania3000`. Se trata de un fine-tune del checkpoint `ania3000/untrained-tjbert-e`, que por su nombre y por la propia model card parece ser un modelo BERT sin preentrenamiento previo (pesos inicializados aleatoriamente). El entrenamiento se realizó con la librería Transformers 4.57.1 y el `Trainer` estándar, y la model card se generó automáticamente sin completar las secciones de descripción, usos previstos ni datos.

El interés del modelo es, por tanto, fundamentalmente instrumental: sirve como artefacto de demostración de un pipeline de fine-tuning, no como modelo listo para producción. La pérdida de validación final es de 5,2437, un valor alto que sugiere un ajuste deficiente, coherente con haber partido de un checkpoint no preentrenado y con un conjunto de datos no documentado (la model card indica literalmente `None` como dataset).

No hay información sobre idiomas, licencia, composición del corpus ni resultados de benchmarks. Cualquier evaluación de calidad debe hacerse por cuenta del usuario antes de considerar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only) |
| Parametros totales | 105.267.880 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos BERT suelen admitir 512 tokens) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (precision no especificada) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de la familia BERT, con 105.267.880 parametros, lo que lo situa en el rango de BERT-base (que ronda los 110 millones). El checkpoint de partida es `ania3000/untrained-tjbert-e`, cuyo nombre indica que no recibio preentrenamiento: los pesos se inicializarian de forma aleatoria y el fine-tune se aplicaria directamente sobre esa inicializacion. Esto explica en gran medida el valor de perdida obtenido.

El entrenamiento se ejecuto con los siguientes hiperparametros declarados: learning rate 5e-05, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 5 epocas. El log registra 1.600 pasos totales con evaluacion cada 200 pasos; a partir de la columna de epoca (200 pasos = 0,6116 epocas) se deduce un conjunto de entrenamiento de aproximadamente 327 pasos por epoca, es decir, del orden de 2.600 ejemplos con batch 8. La perdida de validacion descendio de 6,0650 (paso 200) a 5,2437 (paso 1.600), sin que se registre la perdida de entrenamiento. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, RLHF/DPO, etc.).

## Capacidades

- Relleno de mascaras (`fill-mask`): unica tarea declarada en el pipeline del modelo. Dado un texto con un token `[MASK]`, devuelve candidatos para esa posicion.
- No se ha documentado soporte de generacion de texto libre, razonamiento, codigo, matematicas ni vision.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades agenticas ni de razonamiento multi-paso.
- Capacidades multilingues: no declaradas; el tokenizador y el vocabulario no estan documentados en la informacion disponible.
- No dispone de modo "thinking", audio ni modalidad adicional alguna.
- El tag `endpoints_compatible` indica que puede servirse a traves de la infraestructura de inferencia de HuggingFace, pero no implica ninguna capacidad funcional adicional.

## Casos de uso

- Prueba de humo de infraestructura de inferencia: el modelo ocupa 0,4 GB y admite `pipeline("fill-mask")`, por lo que sirve para verificar que un endpoint, un contenedor o un balanceador responde correctamente antes de desplegar un modelo real.
- Test de integracion en CI para la libreria Transformers: al ser un checkpoint pequeno y con `transformers` 4.57.1 declarado, permite comprobar que la carga de safetensors y la API de `fill-mask` funcionan tras una actualizacion de dependencias.
- Material docente: ejemplo reproducible de un ciclo completo de `Trainer` (hiperparametros, evaluacion por pasos, generacion automatica de model card) en un curso o taller de fine-tuning.
- Baseline de ablation: punto de comparacion para medir cuanto aporta el preentrenamiento, entrenando el mismo pipeline sobre un checkpoint preentrenado y comparando la perdida de validacion.
- Andamiaje para un fine-tune posterior: el script y los hiperparametros documentados pueden reutilizarse cambiando el `base_model` por un BERT preentrenado y el dataset por un corpus real.
- Validacion de formatos de publicacion: util para comprobar el flujo de subida a HuggingFace con safetensors, tags de `base_model` y model card autogenerada sin consumir ancho de banda ni almacenamiento significativos.
- Demostracion de la API `fill-mask` en documentacion o tutoriales, siempre que se advierta de que las predicciones no son fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` del repositorio declara el nombre `tjbert-e-demo` con una lista de resultados vacia.

Los unicos datos numericos disponibles son las perdidas del entrenamiento, extraidas de la model card:

| Epoca | Paso | Perdida de validacion |
|---|---|---|
| 0,6116 | 200 | 6,0650 |
| 1,2232 | 400 | 5,8033 |
| 1,8349 | 600 | 5,6377 |
| 2,4465 | 800 | 5,5243 |
| 3,0581 | 1000 | 5,4072 |
| 3,6697 | 1200 | 5,3189 |
| 4,2813 | 1400 | 5,3018 |
| 4,8930 | 1600 | 5,2437 |

La perdida de entrenamiento no se registro en ningun punto ("No log"). No hay resultados de MMLU, GLUE, SQuAD, HumanEval ni de ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 y unos 0,2 GB en fp16; con overhead de runtime, entre 1 y 2 GB es suficiente.
- GPU recomendadas: cualquier GPU con 4 GB o mas sirve; el modelo no aprovecha tarjetas de gama alta (A100, H100) salvo en escenarios de batched inference masivo.
- Cabe en GPU de consumo sin problema: GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU viable: con 105 millones de parametros, un solo nucleo moderno puede procesar peticiones individuales en decenas de milisegundos.
- Opciones de despliegue: `transformers` con `pipeline("fill-mask")`, exportacion a ONNX Runtime, TorchServe o un servicio FastAPI propio. No es un buen candidato para vLLM ni para TGI en modo generativo, ya que no es un modelo causal. llama.cpp no esta pensado para `fill-mask` de BERT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia orientativa de orden de magnitud, un modelo de este tamano en CPU suele resolver decenas de peticiones por segundo en batch pequeno, pero no hay medicion publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| `ania3000/tjbert-e-demo` | 105,27 M | no disponible | fill-mask | no disponible | demo, sin evaluacion publicada |
| `google-bert/bert-base-uncased` | 109,48 M | 512 | fill-mask / encoder general | Apache 2.0 | preentrenado, ampliamente evaluado en GLUE |
| `FacebookAI/roberta-base` | 124,65 M | 512 | fill-mask / encoder general | MIT | preentrenado, mejor rendimiento en tareas de clasificacion |
| `distilbert/distilbert-base-uncased` | 66,36 M | 512 | fill-mask / encoder general | Apache 2.0 | destilado de BERT-base, mas rapido con perdida moderada |

Los datos de los tres modelos de referencia corresponden a informacion publica de sus repositorios. La comparacion relevante es que `tjbert-e-demo` parte de un checkpoint sin preentrenar y no reporta metricas, por lo que no es equiparable en calidad a ninguna de las alternativas, aunque su huella de memoria sea similar a la de BERT-base.

## Limitaciones y advertencias

- Calidad muy baja esperada: la perdida de validacion de 5,2437 implica una perplejidad del orden de 189, coherente con un modelo que apenas ha aprendido el dominio. Las predicciones de `fill-mask` pueden ser incoherentes o directamente aleatorias.
- El modelo base es `untrained-tjbert-e`, es decir, presumiblemente sin preentrenamiento. El fine-tune no compensa la falta de conocimiento linguistico previo.
- Dataset de entrenamiento no documentado: la model card indica `None` y no describe composicion, tamano real, idioma ni proceso de limpieza. No se puede evaluar el sesgo ni la cobertura.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial. Debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ingles. El vocabulario del tokenizador no esta documentado.
- Sin evaluacion de sesgos ni de toxicidad: no se ha realizado ninguna auditoria conocida.
- Riesgo de alucinacion irrelevante en la tarea, pero riesgo alto de completaciones sin sentido.
- Sin mantenimiento: 0 descargas y 0 likes en el momento de la consulta; el repositorio parece un experimento puntual.
- Los metadatos indican fecha de creacion 2026-10-28, posterior a la fecha habitual de publicacion de esta ficha; puede deberse a un error de reloj del entorno de entrenamiento o a un repositorio de pruebas.
- No usar como sustituto de un modelo preentrenado en produccion: para cualquier tarea real conviene partir de BERT-base, RoBERTa-base o DistilBERT, con licencia y evaluacion conocidas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ania3000/tjbert-e-demo
- Modelo base: https://huggingface.co/ania3000/untrained-tjbert-e
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
