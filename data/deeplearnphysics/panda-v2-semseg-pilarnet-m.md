# DeepLearnPhysics/panda-v2-semseg.pilarnet-m

## Resumen

panda-v2-semseg.pilarnet-m es un modelo de segmentacion semantica de nubes de puntos para fisica de particulas, desarrollado por el grupo DeepLearnPhysics. Concretamente, se trata de un cabezal de segmentacion (MLP) montado sobre el encoder panda-v2.pilarnet-m, un backbone preentrenado en el conjunto de datos PILArNet-M de la camara de proyeccion liquida (LArTPC) del experimento ProtoDUNE. El modelo asigna una clase semantica a cada punto del evento, lo que permite separar las trazas de particulas cargadas de las senales de ruido o de las deposiciones electromagneticas.

El modelo se ha adaptado mediante LoRA (rango 16) y se ha afinado con el cabezal sobre un millon de eventos etiquetados de PILArNet-M. Los pesos publicados corresponden al mejor checkpoint de validacion de la ejecucion `panda-v2-lar-semseg-mlp-lora-n1m`, evaluado sobre el split de test del articulo asociado. Cuenta con 55.982.744 parametros y un tamano de repositorio de 0,2 GB, en formato safetensors y empaquetado para la libreria `pimm` (particle-imaging-models).

Su relevancia radica en que ofrece un modelo de referencia reproducible para tareas de segmentacion semantica en detectores de proyeccion liquida, un paso previo habitual en pipelines de reconstruccion de eventos en experimentos de neutrinos. Al estar publicado con pesos abiertos y una API sencilla (`pimm.from_pretrained`), facilita la evaluacion y la comparacion con otros backbones de la misma familia panda-v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder panda-v2.pilarnet-m con cabezal MLP de segmentacion (`DefaultSegmentorV2`); adaptacion LoRA (rango 16) |
| Parametros totales | 55.982.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo sobre nubes de puntos, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `pimm`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder ligero: el encoder es el backbone panda-v2.pilarnet-m, preentrenado sobre PILArNet-M, y sobre el se anade un cabezal MLP que produce puntuaciones por clase para cada punto de la nube. La adaptacion al dominio de segmentacion se realiza con LoRA de rango 16, lo que mantiene congelados los pesos del encoder y entrena solo los adaptadores de bajo rango junto con el cabezal. El ajuste fino se llevo a cabo sobre 1 millon de eventos etiquetados de PILArNet-M.

La model card no detalla el numero total de tokens ni la composicion exacta del dataset de entrenamiento, ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se especifica la innovacion arquitectonica concreta del backbone panda-v2 mas alla de su uso sobre nubes de puntos. El modelo requiere GPUs con FlashAttention para el backend de atencion por defecto; en GPUs sin FlashAttention debe pasarse `attention_backend="torch"` a `pimm.from_pretrained`.

## Capacidades

- Segmentacion semantica por punto: asigna una clase a cada punto de un evento de LArTPC.
- Procesamiento de nubes de puntos 3D procedentes de detectores de proyeccion liquida.
- Inferencia sobre lotes de eventos mediante la API `pimm` (`model(batch)` devuelve puntuaciones por punto).
- Adaptacion mediante LoRA, lo que permite reutilizar el encoder preentrenado con bajo coste de ajuste.
- Compatibilidad con backend de atencion FlashAttention y fallback a `torch`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Reconstruccion de eventos en LArTPC: el modelo etiqueta cada punto del evento para separar trazas de particulas cargadas de otras deposiciones, paso previo a la reconstruccion de vertices y trayectorias en experimentos de neutrinos.
- Filtrado de ruido en datos de ProtoDUNE: al asignar clases por punto, permite descartar deposiciones no fisicas antes de etapas posteriores del pipeline de analisis.
- Evaluacion comparativa de backbones: sirve como referencia de segmentacion semantica para comparar panda-v2 con otros encoders sobre PILArNet-M usando el split de test del articulo.
- Ajuste fino con LoRA sobre nuevos conjuntos de datos: al estar adaptado con LoRA de rango 16, es una base practica para reentrenar el cabezal en dominios cercanos con recursos moderados.
- Prototipado en investigacion: la API `pimm.from_pretrained` permite cargar el modelo en una GPU y obtener puntuaciones por punto con pocas lineas de codigo.
- Generacion de etiquetas pseudo-reales: las predicciones del modelo pueden usarse para preetiquetar eventos no anotados y acelerar el etiquetado manual en campanas de anotacion.
- Integracion en pipelines de analisis de fisica de particulas: el modelo puede encadenarse con etapas de clustering y reconstruccion de trazas dentro de flujos de analisis existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los pesos corresponden al mejor checkpoint de validacion de la ejecucion `panda-v2-lar-semseg-mlp-lora-n1m` evaluado sobre el split de test del articulo, pero no se proporcionan cifras concretas de metricas (por ejemplo, IoU o accuracy por clase).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 55,98 millones de parametros y pesos en safetensors, el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque el consumo real depende del tamano de lote y del numero de puntos por evento.
- GPU recomendadas: no especificadas en la model card; se menciona el uso de FlashAttention, disponible en GPUs modernas (por ejemplo, serie A100, H100 y RTX 40xx), con fallback a `attention_backend="torch"` en GPUs sin FlashAttention.
- Cabe en GPU de consumo: si, por el reducido numero de parametros; no se detalla el modelo concreto.
- Opciones de despliegue: libreria `pimm` (particle-imaging-models); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| panda-v2-semseg.pilarnet-m | 55.982.744 | no disponible | Segmentacion semantica de nubes de puntos | no disponible | Hugging Face (`pimm`) |
| panda-v2.pilarnet-m (encoder base) | no disponible | no disponible | Backbone preentrenado en PILArNet-M | no disponible | Hugging Face |
| Otros modelos de la familia panda-v2 | no disponible | no disponible | Distintas tareas de vision de particulas | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Dominio muy especifico: el modelo esta entrenado para nubes de puntos de LArTPC (PILArNet-M) y no es transferible directamente a otros dominios sin ajuste.
- Licencia no disponible: no se especifican los terminos de uso comercial; debe consultarse con el autor antes de un uso en produccion.
- Riesgo de alucinacion no aplicable en el sentido de modelos de lenguaje, pero si existe riesgo de clasificacion erronea por punto en eventos fuera de la distribucion de entrenamiento.
- Dependencia de la libreria `pimm` y de las transformaciones de evaluacion especificas (`configs/panda/v2/finetune/_base_/datasets/lartpc.py`); un preprocesado incorrecto degrada las predicciones.
- Requiere atencion FlashAttention para el backend por defecto; en GPUs sin soporte debe configurarse `attention_backend="torch"`, lo que puede afectar al rendimiento.
- No se han publicado metricas de benchmarks en la informacion disponible, lo que dificulta una evaluacion cuantitativa independiente.
- Sesgos conocidos: no documentados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-semseg.pilarnet-m
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.pilarnet-m
- Repositorio pimm (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models
