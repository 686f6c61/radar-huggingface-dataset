# DeepLearnPhysics/panda-v2-instance.tpcpp-10m

## Resumen

panda-v2-instance.tpcpp-10m es un modelo de segmentacion de instancias para fisica de particulas desarrollado por DeepLearnPhysics. Se construye sobre el encoder panda-v2.tpcpp-10m, preentrenado en el conjunto TPCpp-10M, y anade una cabeza de segmentacion afinada sobre las 70.000 muestras etiquetadas de dicho conjunto. El modelo forma parte del ecosistema `pimm` (particle-imaging-models), una libreria orientada al procesamiento de imagenes de detectores en forma de nube de puntos.

El modelo resuelve la tarea de identificar y separar instancias individuales (trazas o depositos de energia) dentro de eventos de un detector TPC (Time Projection Chamber), un problema central en la reconstruccion de eventos de colisionadores como sPHENIX. Su relevancia radica en que aplica tecnicas de vision por computador basadas en point clouds y adaptacion eficiente con LoRA al analisis de datos experimentales de fisica de altas energias.

Con aproximadamente 59,8 millones de parametros y un peso de repositorio de 0,2 GB, es un modelo compacto disenado para inferencia sobre eventos individuales, no un modelo de lenguaje. La adaptacion mediante LoRA de rango 16 permite reutilizar el encoder preentrenado con un coste de ajuste reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (`panda-detector-v2m1`) con encoder preentrenado y cabeza de segmentacion de instancias; adaptacion LoRA de rango 16 |
| Parametros totales | 59.836.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de point cloud, no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura del detector Panda V2 (`panda-detector-v2m1`), un diseno orientado a nubes de puntos para datos de detectores de particulas. El encoder es panda-v2.tpcpp-10m, preentrenado sobre el conjunto TPCpp-10M. Sobre ese encoder se aplica una adaptacion LoRA de rango 16 junto con la cabeza de segmentacion, y el conjunto se afina sobre las 70.000 muestras etiquetadas de TPCpp-10M. Los pesos publicados corresponden al mejor checkpoint de validacion del entrenamiento `panda-v2-sphenix-n70k`, evaluado sobre el split de test del articulo asociado.

La innovacion principal es la combinacion de un encoder preentrenado a gran escala en datos de TPC con una adaptacion de bajo rango (LoRA) que permite ajustar la tarea de segmentacion de instancias con un coste computacional reducido. El modelo esta integrado en la libreria `pimm`, que gestiona la carga mediante `pimm.from_pretrained` y permite seleccionar el backend de atencion (`attention_backend="torch"` en GPUs sin FlashAttention). No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO, dado que no es un modelo generativo de lenguaje.

## Capacidades

- Segmentacion de instancias sobre nubes de puntos de eventos de detectores TPC.
- Identificacion y separacion de instancias individuales (trazas o depositos) dentro de un evento.
- Procesamiento de datos de fisica de particulas en formato point cloud.
- Integracion con la libreria `pimm` para carga y ejecucion (`pimm.from_pretrained`).
- Inferencia en GPU con backend de atencion configurable (FlashAttention o `torch`).
- Adaptacion eficiente mediante LoRA, reutilizable sobre el encoder preentrenado.
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues.

## Casos de uso

- Reconstruccion de eventos en sPHENIX: el modelo segmenta las instancias de un evento TPC y permite separar trazas y depositos de energia para la reconstruccion posterior, aprovechando su entrenamiento especifico sobre TPCpp-10M.
- Analisis offline de datos de colisionador: se integra en pipelines de procesamiento por lotes para etiquetar eventos almacenados, dado su tamano compacto (0,2 GB) y su bajo coste de inferencia.
- Etiquetado y control de calidad de datos: sirve como generador de mascaras de instancia para comparar con reconstrucciones clasicas y detectar discrepancias en eventos anomalos.
- Investigacion en vision por computador para fisica: proporciona un punto de partida preentrenado sobre el que aplicar LoRA para nuevas tareas de segmentacion en otros detectores o configuraciones.
- Desarrollo de nuevas cabezas de tarea: al estar el encoder adaptado con LoRA, se puede reutilizar para tareas derivadas (clasificacion de eventos, regresion de propiedades) con un ajuste ligero.
- Despliegue en entornos con recursos limitados: sus 59,8 millones de parametros permiten ejecucion en GPUs de gama media para experimentacion y prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que estos pesos son los evaluados sobre el split de test del articulo asociado, pero no se incluyen las metricas numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 59,8 millones de parametros en safetensors (aproximadamente 0,24 GB en fp32) el modelo es muy ligero y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no especificadas por el autor; el modelo soporta FlashAttention cuando esta disponible y permite `attention_backend="torch"` como alternativa.
- Cabe en GPU de consumo: si, dado su tamano reducido (0,2 GB de repositorio); cualquier GPU consumer con soporte CUDA es suficiente en terminos de memoria.
- Opciones de despliegue: libreria `pimm` (carga via `pimm.from_pretrained` con `device="cuda"`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (segmentacion de instancias en point clouds para fisica de particulas) ni sus metricas.

## Limitaciones y advertencias

- Modelo especializado en un unico dominio (nubes de puntos de detectores TPC); no es aplicable a tareas generales de vision o lenguaje.
- Entrenado sobre el conjunto TPCpp-10M y la configuracion de sPHENIX; su generalizacion a otros detectores o condiciones experimentales no esta documentada.
- Requiere preprocesar las entradas con las transformaciones de evaluacion de `configs/panda/v2/finetune/_base_/datasets/sphenix.py` del repositorio `pimm`; un preprocesado incorrecto invalida la inferencia.
- En GPUs sin FlashAttention es necesario pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de sesgo derivado de la distribucion de los datos de entrenamiento (TPCpp-10M); el rendimiento fuera de esa distribucion no esta caracterizado.
- No se han publicado metricas de benchmarks en la informacion disponible, por lo que no es posible validar el rendimiento de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.tpcpp-10m
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.tpcpp-10m
- Repositorio `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models
