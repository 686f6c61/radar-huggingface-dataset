# Modusnsus/laya-nli-conflict-v12-r1

## Resumen

laya-nli-conflict-v12-r1 es un modelo de clasificacion de texto (pipeline `text-classification`) publicado por el usuario Modusnsus en HuggingFace. Se trata de un ajuste fino del modelo `convaiinnovations/laya-multilingual` orientado a la deteccion de conflictos de memoria (memory-conflict) mediante inferencia de relacion textual (NLI), con etiquetas del tipo compatibilidad, negacion y contradiccion. El repositorio se presenta explicitamente como un "archivo hermano de investigacion" (research sibling archive) y no como la cabeza entregada del proyecto.

El modelo es la ejecucion r1 del protocolo de tres ejecuciones de la version v12, y segun la model card las 14 ejes de validacion (gate axes) se superaron. La cabeza entregada es la ejecucion r2, `Modusnsus/laya-nli-conflict-v12`, seleccionada por ser la unica con las tres baterias de aceptacion a puntuacion completa. El autor indica que los pesos de r1 nunca deben servirse, por lo que su utilidad es la inspeccion de varianza entre ejecuciones, no el despliegue en produccion.

El artefacto pesa 643.835.524 bytes en un unico fichero `model.safetensors`, con licencia Apache-2.0 y entrenamiento sobre un corpus completamente sintetico de 15.914 filas (procedente de v11) mas 36 filas nuevas con palancas de negacion conocidas. No se han publicado datos de arquitectura interna, numero de parametros, longitud de contexto ni idiomas concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de `convaiinnovations/laya-multilingual` para clasificacion de texto; no se detalla el tipo de encoder ni la configuracion de capas) |
| Parametros totales | no disponible (el fichero de pesos ocupa 643.835.524 bytes, pero no se indica la precision de almacenamiento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes documentadas) |
| Idiomas soportados | no disponible (la etiqueta del repositorio indica "multilingual", pero no se lista ningun idioma concreto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tarea | Clasificacion de texto: NLI orientado a conflicto de memoria |
| Modelo base | `convaiinnovations/laya-multilingual` |
| Tamano del fichero de pesos | 643.835.524 bytes |
| Hash SHA256 de los pesos | 4269ec6bf8a64eee8aed9693395ac2f3d37119531f7d582869b05f048a27dc9b |
| Ficheros auxiliares | `rl_agent_config.json` (umbral tau y configuracion), `val_probs.json` (probabilidades por fila de validacion) |
| Estado del repositorio | Archivo de investigacion; los pesos no deben servirse en produccion |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-06 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo: ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion, ni si se trata de un encoder transformer clasico con cabecera de clasificacion. Lo unico documentado es que es un ajuste fino del modelo `convaiinnovations/laya-multilingual` con `library_name: transformers` y `pipeline_tag: text-classification`, etiquetado con los descriptores `laya`, `system-one`, `typed-decisions`, `nli` y `memory-conflict`.

En cuanto al entrenamiento, el corpus v12 (Kaggle dataset v17) se compone de las 15.914 filas de v11 transportadas de forma literal mas 36 filas de palancas de negacion conocidas, lo que da un total de 15.950 filas. Todo el contenido es sintetico y, segun el autor, no contiene datos personales ni de usuarios reales. La model card no detalla el numero de tokens, la composicion del dataset, el numero de epocas, la tasa de aprendizaje ni si se emplearon tecnicas de RLHF o DPO; tampoco describe innovaciones tecnicas como decodificacion especulativa o atencion lineal, algo coherente con un modelo de clasificacion y no de generacion.

La innovacion metodologica que si se documenta es el protocolo de tres ejecuciones con ejes de validacion (gates) y una regla conformal adoptada para la abtencion, con umbrales tau registrados en `rl_agent_config.json`.

## Capacidades

- Clasificacion de relaciones de inferencia textual (NLI) orientada a la deteccion de conflictos de memoria entre una afirmacion y el contenido almacenado.
- Decisiones tipadas ("typed-decisions") en una unica pasada, segun la etiqueta `system-one`, es decir, clasificacion rapida sin bucle de razonamiento.
- Manejo de casos de negacion: la bateria `negation-5` obtiene 5/5 y la familia de negacion presenta un `mean-p` de 0.7872 en casos de baja confianza.
- Discriminacion de conflictos suaves (soft-conflict): 2 errores sobre 300 casos de validacion `val_soft`.
- Soporte multilingue declarado mediante la etiqueta `multilingual` y el modelo base, sin listado explicito de idiomas.
- Calibracion de confianza: ECE de 0.0207 sobre la validacion principal, lo que permite umbrales de abtencion.
- Capacidad de calibracion conformal: la regla adoptada alcanza 36/50 con un 34,2 % de automatizacion en la ejecucion s1.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso. Se trata de un clasificador, no de un modelo generativo ni de un agente.

## Casos de uso

- Deteccion de contradicciones en la memoria de agentes conversacionales: antes de escribir un nuevo hecho en el almacenamiento de memoria a largo plazo, el modelo clasifica si ese hecho contradice lo ya almacenado, evitando la acumulacion de entradas incompatibles.
- Validacion de respuestas en pipelines RAG: comparar el pasaje recuperado con la respuesta candidata generada y marcar incompatibilidad semantica antes de mostrar la respuesta al usuario.
- Filtrado de pares contradictorios en la construccion de datasets: usar el clasificador para etiquetar automaticamente pares (premisa, hipotesis) y separar los que expresan negacion o conflicto, aprovechando su `mean-p` de 0.7872 en la familia de negacion.
- Enrutado rapido en arquitecturas de doble sistema: al ser un modelo "system-one" de decision tipada, puede actuar como primera etapa barata que resuelve los casos claros y deriva unicamente los ambiguos a un modelo mayor.
- Control de consistencia de politicas corporativas: comprobar si una respuesta o un documento generado contradice una politica interna almacenada, empleando el umbral tau registrado en `rl_agent_config.json`.
- Abtencion con tasa de error controlada: la regla conformal adoptada (36/50 al 34,2 % de automatizacion) permite fijar un objetivo de cobertura en produccion y derivar a revision humana el resto de casos.
- Auditoria de varianza entre ejecuciones: al conservarse este repositorio como hermano de investigacion, sirve para comparar r1 con la cabeza entregada r2 y cuantificar la variabilidad del entrenamiento.
- Evaluacion de sistemas de memoria a largo plazo: emplear las baterias de validacion (`old-20`, `negation-5`, `new-10`) como prueba de regresion al modificar componentes de memoria de un agente.

## Benchmarks y rendimiento

Los unicos resultados publicados son las lecturas de los ejes de validacion (gates) del protocolo v12 para esta ejecucion r1:

| Eje | Lectura de r1 | Umbral (gate) |
|---|---|---|
| Precision de validacion principal / ECE | 0,904 / 0,0207 | mediana >= 0,896 |
| Casos reales old-20 | 19/20 | mediana = 20, sin fallo repetido |
| Negacion (negation-5) | 5/5 | mediana = 5, sin fallo repetido |
| Nuevos (new-10) | 10/10 | mediana = 10, sin fallo repetido |
| Errores en val_soft (soft-conflict) | 2/300 | <= 3 |
| swap / polaridad x2 / banda | PASS x4 | todas las ejecuciones |
| Regla conformal adoptada | 36/50 al 34,2 % (s1) | >= 50 % con <= 35 % |
| Diagnostico de sesgo | 13/14 | >= 13/14 en >= 2 de 3 ejecuciones |
| Familia de compatibilidad, mean-p (casos de alta confianza) | 0,0806 (0) | mediana < 0,5, <= 1 por ejecucion |
| Familia de negacion, mean-p (casos de baja confianza) | 0,7872 (1) | mediana >= 0,5, <= 1 por ejecucion |
| tau(noul) / automatizacion al 5 % (informe) | 1,0887 / 0,814 | auxiliar |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor afirma que los 14 ejes de validacion se superaron en esta ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,64 GB solo para los pesos; con sobrecarga de runtime, activaciones y tokenizador, una estimacion razonable es de 1 a 2 GB en precision nativa y lote pequeno. Es una estimacion, no un dato publicado.
- Caben en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). No se documentan requisitos oficiales.
- GPU de centro de datos (A100, H100, L40S) no son necesarias por tamano, aunque pueden usarse para servir grandes lotes concurrentes.
- Inferencia en CPU: viable por el tamano reducido del fichero, aunque no hay cifras publicadas de latencia.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `pipeline("text-classification")`, servidores de inferencia compatibles con tareas de clasificacion (TGI, ONNX Runtime) y envoltorios propios tipo FastAPI. vLLM y Ollama estan mas orientados a decodificacion generativa, por lo que su idoneidad para este clasificador no esta documentada.
- Latencia y throughput estimados: no disponible.
- Advertencia de despliegue: el autor indica explicitamente que estos pesos no deben servirse; para produccion debe usarse la cabeza entregada `Modusnsus/laya-nli-conflict-v12` (r2).

## Comparativa con modelos similares

| Modelo | Rol | Precision de validacion principal | Estado | Licencia |
|---|---|---|---|---|
| `Modusnsus/laya-nli-conflict-v12-r1` | Ejecucion r1, archivo de investigacion | 0,904 (ECE 0,0207) | Pesos no servibles | Apache-2.0 |
| `Modusnsus/laya-nli-conflict-v12` (r2) | Cabeza entregada, unica con las tres baterias de aceptacion a puntuacion completa | no disponible | Cabeza de produccion | no disponible en la informacion proporcionada |
| `convaiinnovations/laya-multilingual` | Modelo base sobre el que se ajusta | no disponible | Modelo base | no disponible en la informacion proporcionada |
| Otros clasificadores NLI multilingues | Alternativas genericas de la misma tarea | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Los pesos de este repositorio no deben servirse en produccion; el propio autor lo indica de forma explicita. Es un archivo de investigacion para inspeccion de varianza.
- Es un clasificador, no un modelo generativo: no produce texto, codigo ni razonamiento multi-paso, y no soporta tool calling.
- Se desconoce el numero de parametros, la arquitectura interna y la longitud de contexto, lo que dificulta estimar con precision los requisitos de despliegue.
- No se publica la lista de idiomas soportados pese a la etiqueta "multilingual"; el comportamiento fuera de los idiomas del corpus de entrenamiento es desconocido.
- El entrenamiento se realizo exclusivamente con datos sinteticos, lo que puede provocar deriva de dominio (domain shift) al enfrentarse a texto real. La propia bateria `old-20` de casos reales muestra 19/20 aciertos, es decir, un fallo.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion incorrecta en casos limite, especialmente en conflictos suaves (2 errores sobre 300 en `val_soft`).
- El diagnostico de sesgo obtiene 13/14, por lo que un eje de sesgo queda por debajo del maximo.
- La familia de compatibilidad muestra un `mean-p` de 0,0806 en casos de alta confianza y la familia de negacion un 0,7872 en casos de baja confianza, lo que sugiere una asimetria de calibracion entre ambas familias que conviene vigilar con umbrales por clase.
- La regla conformal adoptada alcanza 36/50 con un 34,2 % de automatizacion: el 65,8 % restante requeriria intervencion o revision adicional en un flujo automatizado.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero la restriccion del autor sobre no servir estos pesos es una advertencia operativa, no una clausula de la licencia.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa independiente conocida.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Modusnsus/laya-nli-conflict-v12-r1
- Cabeza entregada (r2): https://huggingface.co/Modusnsus/laya-nli-conflict-v12
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Protocolo y handoff del autor: https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V12.md
- Dataset de linaje de entrenamiento: https://huggingface.co/datasets/Modusnsus/nli-conflict-train-lineage
- Conjunto de evaluacion: https://huggingface.co/datasets/Modusnsus/laya-nli-conflict-eval
- Coleccion completa del proyecto: https://huggingface.co/collections/Modusnsus/laya-nli-memory-conflict-head-v4-and-three-run-protocol-6ac03c397eb43e9e3ecf87f0
