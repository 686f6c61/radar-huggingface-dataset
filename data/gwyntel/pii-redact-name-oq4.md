# gwyntel/PII-Redact-Name-oQ4

## Resumen

PII-Redact-Name-oQ4 es una version cuantizada a 4 bits del modelo OpenPipe/PII-Redact-Name, especializado en la deteccion y anonimizacion de nombres de persona (PII) en texto. Lo publica el usuario gwyntel y esta pensado para ejecutarse sobre MLX, la libreria de Apple para inferencia en silicio unificado. El modelo base es un transformer de tipo llama con 1.235.814.400 parametros (aproximadamente 1,24 mil millones), por lo que se trata de un modelo compacto orientado a tareas concretas de etiquetado y redaccion, no a generacion generalista.

La relevancia de esta ficha radica en que es un ejemplo de cuantizacion mixta de precision aplicada a una tarea sensible: la eliminacion de datos personales. Segun el autor, el proceso de cuantizacion se realizo con la herramienta oQ (oMLX v0.7.0) en formato MLX safetensors, con 4 bits y tamano de grupo 64. La validacion sobre un conjunto etiquetado de 18 documentos indica que el recall se mantiene respecto al modelo de precision completa, con un F1 de 0,816 frente a 0,833 y una precision de 0,870 frente a 0,909.

Su caso de uso natural no es el consumo directo como modelo de chat, sino su integracion en un pipeline de redaccion de PII gestionado mediante oMLX y el fork pii-redact-mlx, que se encarga del etiquetado, la redaccion y la sustitucion por datos falsos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer decoder-only) |
| Parametros totales | 1.235.814.400 (aproximadamente 1,24 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, oQ mixed-precision (oMLX v0.7.0), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint OpenPipe/PII-Redact-Name, que a su vez es un transformer de tipo llama. No se ha entrenado ningun modelo nuevo: la operacion realizada es una cuantizacion mixta de precision a 4 bits con la herramienta oQ, integrada en oMLX v0.7.0, con un tamano de grupo de 64 y salida en formato MLX safetensors. El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que esa informacion corresponde al modelo base y no se incluye en la model card.

La innovacion tecnica destacable es precisamente el esquema de cuantizacion: el uso de precision mixta (oQ) en lugar de una cuantizacion uniforme permite mantener el recall de deteccion de entidades tras reducir el modelo a 4 bits. La validacion publicada sobre 18 documentos etiquetados muestra que la cuantizacion apenas penaliza la recuperacion de entidades (recall identico al modelo de precision completa), aunque si reduce ligeramente la precision, lo que se traduce en un F1 algo menor.

## Capacidades

- Deteccion y redaccion de nombres de persona (PII) en texto.
- Etiquetado de entidades dentro de pipelines de anonimizacion.
- Sustitucion de datos personales por datos falsos, segun el flujo descrito en el fork pii-redact-mlx.
- Procesamiento por lotes de ficheros JSONL de trazas, con opcion de calculo automatico del maximo de tokens (`--auto-max-tokens`).
- Inferencia concurrente a traves del backend oMLX del fork, y tambien mediante un backend basado en transformers/torch.
- Integracion con un servidor oMLX local expuesto por API compatible en el puerto 27473 del ejemplo.

No se documentan capacidades de razonamiento general, codigo, matematicas, vision, audio, tool calling ni modo thinking. El alcance declarado es especificamente la redaccion de PII.

## Casos de uso

- Redaccion de PII en trazas de produccion: el modelo se integra en el fork pii-redact-mlx para procesar ficheros JSONL de trazas y sustituir nombres por datos falsos antes de almacenarlos o compartirlos, usando `pii-redact convert-traces`.
- Cumplimiento de RGPD en pipelines de datos: al eliminar nombres de persona de los registros, reduce el riesgo de tratar datos personales en entornos de analitica y logging.
- Preparacion de datasets de entrenamiento: permite anonimizar corpus textuales antes de reutilizarlos para entrenar otros modelos, evitando filtrar informacion identificativa.
- Sanitizacion de logs de atencion al cliente: los nombres presentes en conversaciones o tickets pueden redactarse antes de que los logs salgan del entorno controlado.
- Despliegue local en hardware Apple: al ser un cuantizado MLX de aproximadamente 0,7 GB, puede ejecutarse en un portatil con chip Apple Silicon sin enviar datos sensibles a la nube.
- Validacion de calidad de anonimizacion: el fork incluye un harness de validacion etiquetado que permite medir recall, precision y F1 sobre un conjunto propio antes de poner el sistema en produccion.
- Procesamiento de documentos regulados: en sectores como salud o banca, el modelo puede servir como primera capa de redaccion de nombres en textos que no deben salir del perimetro de la organizacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a la validacion del autor sobre un conjunto etiquetado de 18 documentos, comparando el modelo cuantizado con el modelo de precision completa:

| Metrica | oQ4 (cuantizado) | Precision completa |
|---|---|---|
| Recall | coincide con el modelo de precision completa | referencia |
| Precision | 0,870 | 0,909 |
| F1 | 0,816 | 0,833 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4 bits con un repositorio de 0,7 GB, la huella en memoria ronda el entorno de 0,7 a 1,5 GB, dependiendo del runtime y del contexto utilizado (estimacion a partir del tamano del repo, no confirmada por el autor).
- GPU compatibles: no disponible para GPU NVIDIA o AMD; la libreria declarada es MLX, orientada a Apple Silicon.
- Cabe en hardware de consumo: si, en equipos con chip Apple Silicon (familias M1, M2, M3, M4) gracias a la memoria unificada; el tamano reducido lo hace viable incluso en configuraciones basicas de memoria.
- Opciones de despliegue: servidor oMLX (oMLX v0.7.0 o superior) exponiendo una API compatible, y el fork pii-redact-mlx, que ademas ofrece un backend basado en transformers/torch e inferencia concurrente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se compara con su modelo base y con la alternativa de usar el modelo sin cuantizar, ya que no se dispone de informacion sobre otros modelos de redaccion de PII comparables en la documentacion aportada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gwyntel/PII-Redact-Name-oQ4 | 1,24 B | no disponible | no disponible | MLX safetensors (4 bits) | Cuantizacion oQ, validada en 18 documentos |
| OpenPipe/PII-Redact-Name | no disponible | no disponible | no disponible | no disponible | Modelo base de precision completa, F1 0,833 en el mismo conjunto |
| Otras alternativas de redaccion de PII | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse la viabilidad de un uso comercial sin consultar previamente al autor y al modelo base.
- La validacion se realizo sobre un unico conjunto de 18 documentos etiquetados, un tamano muy reducido que limita la generalizacion de las metricas F1 y precision.
- La cuantizacion reduce la precision respecto al modelo de precision completa (0,870 frente a 0,909), lo que aumenta el riesgo de falsos positivos al marcar nombres.
- No se especifican los idiomas soportados; el comportamiento en castellano u otras lenguas distintas del ingles no esta garantizado.
- No se documenta la longitud de contexto, lo que impide planificar el procesamiento de documentos largos sin pruebas previas.
- Como modelo de redaccion de PII, un fallo de deteccion (falso negativo) puede suponer una fuga de datos personales; se recomienda combinarlo con validacion humana o capas adicionales en entornos regulados.
- El modelo esta orientado a MLX y a un flujo de despliegue concreto (oMLX mas pii-redact-mlx); su uso fuera de ese ecosistema requiere adaptaciones.
- El riesgo de alucinacion se refiere aqui a sustituciones incorrectas de datos falsos o a etiquetados erroneos, no a generacion libre de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gwyntel/PII-Redact-Name-oQ4
- Modelo base: https://huggingface.co/OpenPipe/PII-Redact-Name
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Fork de redaccion de PII: https://github.com/gwyntel-git/pii-redact-mlx
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes; los resultados devueltos no guardan relacion con el modelo.
