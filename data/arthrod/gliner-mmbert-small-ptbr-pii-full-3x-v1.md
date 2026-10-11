# arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1

## Resumen

`gliner-mmbert-small-ptbr-pii-full-3x-v1` es un modelo de deteccion de informacion personal identificable (PII) en portugues de Brasil, publicado por el usuario arthrod y construido sobre el encoder multilingue `jhu-clsp/mmBERT-small` (ModernBERT de 22 capas, aproximadamente 140M de parametros y vocabulario de 256k tokens). Se distribuye como modelo GLiNER, es decir, una cabeza de reconocimiento de entidades entrenada para operar en modo zero-shot: en lugar de depender de un conjunto fijo de etiquetas, recibe la lista de etiquetas en tiempo de inferencia.

El problema que resuelve es concreto y muy demandado en el contexto regulatorio brasileiro: localizar y clasificar datos personales (CPF, direcciones, codigos postales, etc.) en texto libre en pt-BR para poder anonimizarlos. La model card lo posiciona explicitamente como el modelo GLiNER mas fuerte de su familia, con un F1 estricto medio de 0.7532 sobre las cuatro fuentes holdout de PII, frente a 0.5707 del variante basado en `ettin-encoder-68m`.

Su relevancia actual radica en la combinacion de tres factores: un encoder pequeno que permite inferencia en CPU o en cualquier GPU de consumo, una licencia Apache 2.0 sin restricciones de uso comercial y una cabecera zero-shot que evita reentrenar cuando cambia el catalogo de etiquetas. El compromiso principal, documentado por el propio autor, es que el modelo no se abstiene ante texto sin PII: genera 8.666 falsos positivos sobre 2.419 filas de spam y phishing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional ModernBERT (mmBERT-small, 22 capas) con cabeza GLiNER de NER zero-shot |
| Parametros totales | Aproximadamente 140M en el encoder mmBERT-small; parametros de la cabeza GLiNER no disponibles de forma separada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugues (pt-BR) y multilingue (heredado del encoder mmBERT) |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` (PyTorch), `gliner_config.json`, `tokenizer.json`, `tokenizer_config.json`; no se publican safetensors ni GGUF |
| Libreria y version | `gliner` 0.2.25 |
| Etiquetas de entrenamiento | 24 etiquetas evaluadas en el benchmark PT-BR PII bench v1 |
| Checkpoint servido en la raiz | Paso 41.400 (mejor F1 medio sobre las cuatro fuentes de PII) |
| Checkpoints adicionales | `checkpoint-65550/`, `checkpoint-69000/` (estado completo de Trainer, incluyen `optimizer.pt`, `scheduler.pt`, `rng_state.pth`) |
| Tamano del repositorio | 14,4 GB |
| Descargas / likes | 49 descargas, 0 likes |
| Fecha de creacion / actualizacion | 22 de abril de 2026 / 10 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo combina un encoder `jhu-clsp/mmBERT-small` preentrenado (arquitectura ModernBERT multilingue, 22 capas, aproximadamente 140M de parametros, vocabulario de 256k tokens) con una cabeza GLiNER. A diferencia de las variantes de la familia construidas sobre encoders Ettin, aqui la cabeza GLiNER se entreno desde cero, no como continuacion de un checkpoint GLiNER existente, y se ajusto de forma conjunta con el encoder preentrenado.

El entrenamiento utilizo aproximadamente 986.000 filas de PII en pt-BR (el conjunto completo de aproximadamente 984.000 filas mas unas 2.000 filas adicionales de Ritapolis, segun la descripcion del split `train_with_ritapolis`), durante 69.000 pasos con un scheduler de coseno. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion, algo esperable en un modelo discriminativo de etiquetado de tokens. Tampoco se detalla la composicion exacta del dataset ni la procedencia de las anotaciones.

La innovacion practica del enfoque GLiNER es que las etiquetas se proporcionan como texto en el momento de la inferencia (`predict_entities(text, labels, threshold=0.3, flat_ner=True)`), lo que permite adaptar el catalogo de entidades sin reentrenar. El repositorio conserva ademas un fichero `eval_holdout_strict_f1.parquet` con el F1 estricto por fuente de evaluacion, extraido del `trainer_state.json` del checkpoint 69.000.

## Capacidades

- Deteccion y clasificacion de entidades de PII en portugues de Brasil mediante etiquetado de tokens (`token-classification`).
- Funcionamiento zero-shot: acepta etiquetas arbitrarias descritas en lenguaje natural, por ejemplo `"cpf document number"`, `"location street"`, `"location city"`, `"location state abbreviation"` o `"location zip"`.
- Modo `flat_ner=True` con umbral de confianza configurable, lo que permite ajustar el compromiso entre exhaustividad y falsos positivos por despliegue.
- 24 etiquetas de PII cubiertas en el benchmark de validacion PT-BR PII bench v1.
- Soporte multilingue heredado del encoder mmBERT, aunque el ajuste fino esta especializado en pt-BR.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto, vision ni audio: es exclusivamente un modelo discriminativo de extraccion de entidades.
- No se documenta un modo de razonamiento explicito ni decodificacion especulativa.

## Casos de uso

- Anonimizacion previa a APIs de terceros: el modelo detecta CPF, direcciones, codigos postales y ciudad/estado en el texto pt-BR y permite enmascararlos antes de enviarlo a un LLM externo, evitando transferir datos personales fuera del perimetro de la organizacion.
- Cumplimiento de la LGPD en pipelines de datos: integrado como paso de preprocesado, etiqueta las columnas de texto libre de un data lake para localizar donde residen datos personales y alimentar registros de tratamiento o evaluaciones de impacto.
- Gestion de tickets de atencion al cliente: al procesar conversaciones multi-turno en portugues, permite separar la parte del ticket que contiene datos identificativos de la que no, de modo que el resto del flujo (busqueda, clasificacion, resumen) opere sobre texto seudonimizado.
- Revision documental juridica y contractual: extrae partes, direcciones y numeros de documento de contratos y expedientes en pt-BR para poblar indices de busqueda sin almacenar el dato original en claro.
- Auditoria y depuracion de logs de aplicacion: el modelo marca mensajes de log que contienen PII antes de que se escriban en un sistema de observabilidad, reduciendo la exposicion en herramientas de terceros.
- Filtrado de correo entrante y deteccion de phishing: puede usarse para marcar mensajes con datos personales embebidos, aunque en este escenario hay que asumir la tasa alta de falsos positivos en texto sin PII documentada por el autor.
- Generacion de conjuntos de datos sinteticos o anonimizados: como etiquetador previo a un proceso de sustitucion por valores ficticios, manteniendo la coherencia de las entidades detectadas.
- Extraccion estructurada configurable: al aceptar etiquetas en tiempo de inferencia, se puede reutilizar el mismo checkpoint para dominios con catalogos distintos (salud, financiero, recursos humanos) sin reentrenar.

## Benchmarks y rendimiento

Todos los resultados proceden del `model-index` de la model card y estan declarados por el autor con `verified: false`; no han sido verificados de forma independiente.

| Tarea | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Deteccion de PII (pt-BR) | PT-BR PII bench v1, split `val_5k`, 24 etiquetas | Partial F1 (nervaluate) | 0,888 |
| Deteccion de PII (pt-BR) | PT-BR PII bench v1, split `val_5k`, 24 etiquetas | Exact F1 (nervaluate) | 0,870 |
| Falsos positivos en texto sin PII | PT-BR PII bench v1, split `negatives` (spam y phishing) | Falsos positivos | 8.666 |
| Falsos positivos en texto sin PII | PT-BR PII bench v1, split `negatives` (spam y phishing) | Filas sin PII evaluadas | 2.419 |
| Media sobre fuentes holdout de PII | Declarado en la model card (4 fuentes) | Mean strict F1 | 0,7532 |

El autor compara ese 0,7532 de media estricta con el 0,5707 de `gliner-ettin-68m-ptbr-pii-full-3x-v1`, y anade que los checkpoints intermedios 44.850 a 62.100 se subieron y se eliminaron posteriormente. El fichero `eval_holdout_strict_f1.parquet` contiene el F1 estricto por fuente de evaluacion para las 11 fuentes holdout. No hay datos publicados de MMLU, HumanEval, GSM8K ni de tareas generativas, ya que el modelo no las cubre.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB en fp16 para el encoder de 140M de parametros mas la cabeza GLiNER; en fp32 alrededor de 1-1,5 GB. Son estimaciones derivadas del tamano del encoder, no cifras publicadas por el autor.
- El repositorio ocupa 14,4 GB, pero ese tamano corresponde casi por completo a los checkpoints de Trainer (`optimizer.pt`, `scheduler.pt`, `rng_state.pth`), que no son necesarios para inferencia. Para desplegar basta el contenido de la raiz o de un subdirectorio `checkpoint-*`.
- Cabe holgadamente en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en CPU para cargas de baja concurrencia.
- GPU recomendadas para despliegue en produccion con alto throughput: A100, H100 o L40S, aunque el cuello de botella real sera la CPU de preprocesado y no la GPU.
- Opciones de despliegue: la ruta documentada es la libreria `gliner` en version 0.2.25 mediante `GLiNER.from_pretrained`. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama, TGI ni exportaciones a ONNX o TensorRT.
- Limitacion operativa conocida: `GLiNER.from_pretrained` en la version 0.2.25 no acepta el argumento `subfolder`, por lo que los checkpoints 65.550 y 69.000 requieren descarga local con `snapshot_download` y carga desde ruta. El checkpoint de la raiz (paso 41.400) se carga directamente con el identificador del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Encoder base | Rol en la familia | Mean strict F1 (4 fuentes holdout) | Partial F1 (val PT-BR) | Licencia |
|---|---|---|---|---|---|
| `arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1` | `jhu-clsp/mmBERT-small` (~140M, 22 capas) | Modelo mas fuerte de la familia; conjunto completo mas 2k filas de Ritapolis, 69.000 pasos | 0,7532 | 0,888 | Apache 2.0 |
| `arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1` | `jhu-clsp/ettin-encoder-68m` | Mismo conjunto completo, 69.000 pasos (estado subido hasta el paso 58.650) | 0,5707 | No disponible | No disponible |
| `arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1` | `jhu-clsp/ettin-encoder-32m` | Modelo mas pequeno de la familia | No disponible | No disponible | No disponible |
| `arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1` | `jhu-clsp/ettin-encoder-68m` | Ablacion con subconjunto curado de 50k filas y 11.700 pasos; el autor indica que infrageneraliza | No disponible | No disponible | No disponible |
| `arthrod/gliner-opf-ptbr-pii-v1` | Fine-tune de OpenAI Privacy Filter (no es GLiNER pese al nombre) | Mejor partial F1 en el conjunto de validacion en distribucion y muchos menos falsos positivos en texto sin PII | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos de la propia familia, ya que no se dispone de resultados de alternativas externas en la informacion proporcionada. El criterio de eleccion que da el autor es claro: este checkpoint cuando se prioriza recall sobre texto con PII, y `gliner-opf-ptbr-pii-v1` cuando los falsos positivos resultan costosos.

## Limitaciones y advertencias

- Ausencia de abandono (no abstention): el modelo no se abstiene ante texto sin PII. Sobre 2.419 filas de spam y phishing genero 8.666 falsos positivos, lo que supone aproximadamente 3,58 falsos positivos por fila. Cualquier despliegue que dependa de la ausencia de detecciones debe calibrar el umbral o usar otro modelo.
- Metricas no verificadas: los valores del `model-index` estan declarados por el autor con `verified: false` y no han sido reproducidos por terceros.
- Sesgo de dominio y de idioma: el ajuste fino se realizo sobre PII en portugues de Brasil; el comportamiento en portugues europeo, en criollo o en texto con mezcla de idiomas no esta documentado.
- Riesgo de alucinacion de entidades: como etiquetador discriminativo, el fallo tipico no es inventar texto, sino asignar etiquetas de PII a fragmentos que no lo son, lo que en un pipeline de anonimizacion produce enmascaramiento excesivo.
- Limitacion de licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial. Sin embargo, la licencia del encoder base `jhu-clsp/mmBERT-small` no se detalla en la informacion proporcionada, por lo que conviene verificarla antes de un despliegue comercial.
- Restricciones de contexto: la longitud maxima de secuencia no esta documentada en la informacion disponible; no se debe asumir un valor concreto.
- Carga de checkpoints: la libreria `gliner` 0.2.25 no admite `subfolder` en `from_pretrained`, lo que complica el uso de los checkpoints 65.550 y 69.000 en entornos gestionados.
- Formatos de despliegue limitados: solo se publican pesos en `pytorch_model.bin`; no hay safetensors, GGUF ni ONNX, lo que descarta su uso directo en llama.cpp u Ollama.
- Repositorio pesado: 14,4 GB por los estados de optimizador y scheduler, un coste relevante si se descarga el snapshot completo en lugar de patrones concretos.
- Sin soporte generativo: no puede usarse para resumir, redactar ni mantener conversaciones; es una pieza dentro de un pipeline mayor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Variante sobre ettin-32m: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Variante sobre ettin-68m (conjunto completo): https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- Variante sobre ettin-68m (subconjunto top 50k): https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1
- Fine-tune de OpenAI Privacy Filter: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Dataset de benchmark: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Demo Gradio (ejecuta el fine-tune de Privacy Filter): https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Barrido previo de 18 modelos GLiNER por 9 conjuntos de evaluacion: https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Datos de revision y comparacion GLiNER: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- DOI: https://doi.org/10.57967/hf/8518
