# GoyalLab/ExPert

## Resumen

ExPert v0.1.0 es un modelo de prediccion de perturbaciones geneticas desarrollado por GoyalLab. A diferencia de un modelo de lenguaje, ExPert opera sobre datos de expresion genica de celula unica (scRNA-seq): recibe un perfil transcripcional y devuelve que perturbaciones geneticas se parecen mas a esa respuesta. El modelo se entrena con datos de Perturb-seq, una tecnica que combina edicion genetica con secuenciacion de ARN de celula unica para medir el efecto de miles de perturbaciones sobre el transcriptoma.

El modelo fue entrenado sobre 22 conjuntos de datos de Perturb-seq y mantiene un prototipo por perturbacion en un espacio latente compartido. De las 19.895 entradas de su vocabulario genetico, 8.964 prototipos se aprenden directamente de los cribados y el resto se predicen a partir de conocimiento previo codificado como embeddings de texto. Puede puntuar celulas individuales o pseudobulks de cualquier consulta de scRNA-seq humana o de raton.

Su relevancia radica en que permite reutilizar el conocimiento acumulado en multiples cribados de perturbacion para anotar experimentos nuevos sin necesidad de repetir el cribado completo, y en que publica pesos y codigo de reconstruccion de datos bajo licencia MIT. El repositorio ocupa 2,3 GB y se distribuye con la libreria `expert-model`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de espacio latente con prototipos por perturbacion; no es un transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre perfiles de expresion genica, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada biologica: scRNA-seq humano y de raton) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch) y `gene_embeddings.npz` (NumPy) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red. Lo que si se especifica es el diseno funcional: un espacio latente compartido en el que cada perturbacion tiene un prototipo, y un mecanismo de comparacion que puntua la respuesta transcripcional de una consulta contra esos prototipos. El vocabulario cubre 19.895 genes; de ellos, 8.964 prototipos se aprenden de los cribados de Perturb-seq y el resto se inicializa o predice a partir de embeddings de texto de conocimiento previo almacenados en `gene_embeddings.npz`. El fichero `model.pt` incluye pesos, configuracion, vocabularios de genes y perturbaciones, y la calibracion de lectura.

El entrenamiento se realizo sobre 22 conjuntos de datos de Perturb-seq. La model card no especifica el numero de celulas, la composicion exacta del dataset ni si se aplicaron tecnicas de refinamiento como RLHF o DPO (no aplicables en este dominio). Los datos de entrenamiento pueden reconstruirse con el repositorio `ExPert-data`. La referencia al preprint figura como pendiente de anadir.

## Capacidades

- Prediccion de perturbaciones: dado un perfil de expresion (celula individual o pseudobulk), devuelve una matriz de predicciones suaves (`soft_predictions`) de celulas por perturbaciones.
- Anotacion de experimentos de scRNA-seq humano y de raton, con independencia del cribado de origen.
- Manejo de genes no vistos en los cribados mediante prototipos derivados de conocimiento previo (embeddings de texto).
- Entrada en formato AnnData (`.h5ad`) con conteos crudos y simbolos genicos; la columna `obs['perturbation']` marca los controles.
- Integracion con el ecosistema Scanpy para el preprocesado de la consulta.
- No dispone de tool calling, capacidades de agente, generacion de texto ni multimodalidad en el sentido de los modelos de lenguaje.

## Casos de uso

- Anotacion de cribados de perturbacion nuevos: cargar un `.h5ad` de un experimento Perturb-seq reciente y obtener, celula a celula, que perturbaciones conocidas se parecen mas a la respuesta observada, lo que acelera la interpretacion biologica.
- Reutilizacion de cribados historicos: comparar experimentos de distintos laboratorios y lineas celulares contra un espacio latente comun entrenado con 22 datasets, lo que facilita meta-analisis.
- Priorizacion de dianas terapeuticas: identificar que perturbaciones conocidas reproducen el fenotipo transcripcional de un estado celular de interes (por ejemplo, un estado patologico) para generar hipotesis sobre genes causales.
- Control de calidad experimental: detectar celulas cuya respuesta no encaja con ninguna perturbacion del vocabulario, lo que puede indicar fallos de edicion o contaminacion.
- Analisis de perturbaciones combinadas o de genes fuera del vocabulario entrenado: usar los prototipos derivados de conocimiento previo para obtener una aproximacion razonable cuando no hay datos de cribado directos.
- Integracion en pipelines de biologia computacional: el modelo se carga desde Hugging Face con `snapshot_download` y se usa como un paso mas dentro de flujos basados en Scanpy, con salida en forma de matriz de puntuaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 2,3 GB, lo que da una cota inferior del espacio necesario para cargar pesos y embeddings en memoria, pero la model card no desglosa el consumo.
- GPU recomendadas: no disponible. No se especifica si el modelo requiere GPU o puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio sugiere que podria caber en GPUs con 8-16 GB de VRAM, pero es una estimacion no verificada.
- Opciones de despliegue: la unica via documentada es el paquete Python `expert` instalado desde el repositorio de GitHub, junto con `huggingface_hub` y `scanpy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Existen otros enfoques de prediccion de perturbaciones en la literatura (por ejemplo, modelos de traduccion de expresion genica o autoencoders condicionados), pero la model card no incluye comparaciones ni datos que permitan establecer una tabla rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ExPert v0.1.0 | no disponible | no aplica | no disponible | MIT | Hugging Face + GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La prediccion se limita al vocabulario de 19.895 genes y a las perturbaciones cubiertas por los 22 cribados; las respuestas fuera de ese espacio se aproximan mediante prototipos derivados de conocimiento previo, con menor fiabilidad.
- Solo cubre organismos humano y de raton; no se documenta soporte para otras especies.
- La calidad depende de que la consulta siga el formato esperado: conteos crudos, simbolos genicos y controles etiquetados correctamente en `obs['perturbation']`.
- Riesgo de falsos positivos al asignar una perturbacion a celulas con respuesta debil o ruidosa; la model card no documenta umbrales de confianza ni calibracion publicada.
- No hay preprint ni resultados de benchmarks publicados en el momento de la ficha, por lo que la validacion independiente es inexistente.
- La licencia MIT permite uso comercial, pero el modelo no es una herramienta clinica: cualquier aplicacion biomedica requiere validacion experimental propia.
- El modelo no genera texto ni razona en lenguaje natural; no debe confundirse con un LLM pese a la etiqueta generica de "modelo".

## Enlaces

- Hugging Face: https://huggingface.co/GoyalLab/ExPert
- Repositorio de codigo y documentacion: https://github.com/GoyalLab/ExPert
- Repositorio de reconstruccion de datos: https://github.com/GoyalLab/ExPert-data
- Preprint: pendiente de publicacion segun la model card (no disponible)
