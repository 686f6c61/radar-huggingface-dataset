# k4rth33k/Qwen-9B-decision

## Resumen

Qwen-9B-decision es un modelo de decision de pesos abiertos publicado por el usuario k4rth33k, construido con la herramienta Summit. No es un asistente conversacional generico, sino un modelo especializado en puntuar opciones: dado un estado, una pregunta y un conjunto de opciones candidatas, devuelve una distribucion de probabilidad sobre las opciones y la opcion seleccionada. El repositorio contiene dos artefactos: un padre causal Qwen3.5-9B con ajuste fino completo y un adaptador QLoRA especialista sobre el conjunto Typed Decisions.

El modelo deriva de Qwen/Qwen3.5-9B (fijado en el commit c202236235762e1c871ad0ccb60c8ee5ba337b9a), del que se conserva unicamente el componente de lenguaje causal de solo texto, sin encoder de vision. Cuenta con 8.953.803.264 parametros en configuracion Qwen3_5ForCausalLM / qwen3_5_text y utiliza la licencia Apache 2.0. El adaptador QLoRA anade 58.195.968 parametros entrenables (~223 MiB) y depende del padre ajustado, no de los pesos originales de Qwen.

Su relevancia radica en el enfoque de "decision scoring" restringido y en el resultado reportado: el especialista alcanza un 75,8% de exactitud (1.516/2.000 decisiones) en el conjunto de test Typed Decisions, 3,1 puntos porcentuales por encima de la referencia publicada de Jev 1.13.0 (72,7%). El propio autor advierte que no se trata de una comparacion head-to-head equiparable, ya que el especialista si ha visto la distribucion de entrenamiento del benchmark mientras que la fila de Jev es zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de solo texto, configuracion Qwen3_5ForCausalLM / qwen3_5_text (derivada de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors FP32, con carga recomendada en BF16 para inferencia. Adaptador QLoRA (PEFT) con 58.195.968 parametros entrenables (~223 MiB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, 35,82 GB); adaptador QLoRA en formato PEFT |

## Arquitectura y entrenamiento

El modelo es un transformer causal de solo texto derivado de Qwen3.5-9B. El repositorio se compone de un checkpoint padre con ajuste fino completo (no los pesos originales de Qwen) y de un adaptador QLoRA especialista. Los pesos del padre se conservan en safetensors FP32 (35,82 GB) y para inferencia se recomienda cargarlos explicitamente en BF16. El adaptador QLoRA depende de este padre exacto y no del checkpoint upstream sin ajustar.

El entrenamiento se realizo con Summit, que aporta recetas YAML, validacion de dataset, adaptadores opcionales, bucle de entrenamiento/evaluacion, orquestacion en la nube y comprobaciones de guardado/recarga de checkpoints. En la etapa 1 (ajuste fino completo del padre causal) se usaron 512 decisiones de entrenamiento convertidas de CLINC150/ContractNLI, con una permutacion adicional del orden de opciones por decision, lo que produjo 1.024 vistas de entrenamiento; se reservaron 256 decisiones de desarrollo independientes. El profesor fueron respuestas de razonamiento nativo de Qwen Max, solicitadas mediante el alias de Fireworks `accounts/fireworks/models/qwen3p8-max`, codificadas como etiquetas one-hot duras (no logits ni distribuciones calibradas). El objetivo combinó `0,5 × CE de etiqueta de referencia + 0,5 × KL forward` hacia los objetivos one-hot del profesor a temperatura 1. Se comparo con un control de solo CE y con CE/KD mixto partiendo del mismo Qwen fijado; cada brazo ejecuto 128 actualizaciones del optimizador y el KD se selecciono por exactitud de desarrollo. La optimizacion uso parametros completos en FP32 y estados AdamW, computo en BF16, gradient checkpointing, batch 1, acumulacion 8, LR 2e-7, tope de norma de gradiente 1, weight decay 0 y semilla 42, sobre una unica GPU RunPod B300 de 288 GB orquestada por Summit a traves de dstack. El brazo KD seleccionado alcanzo 226/256 decisiones de desarrollo (88,28%) frente a 223/256 del brazo CE. Los detalles de la etapa 2 (entrenamiento del adaptador QLoRA) no estan disponibles en la informacion proporcionada.

## Capacidades

- Puntuacion de decisiones restringida: dado un estado, una pregunta y opciones candidatas, devuelve una distribucion de probabilidad y la opcion seleccionada.
- Clasificacion de texto (pipeline declarado: text-classification).
- Especializacion por dominios del benchmark Typed Decisions: atencion al cliente, procesamiento de facturas, incidentes de seguridad y observabilidad de trazas de agentes.
- Disponibilidad de dos modos: cargar solo el padre en la raiz del repositorio (61,1% de exactitud) o cargar el padre mas el adaptador `qlora/` (75,8%).
- Funciona como componente de decision, no como servicio de generacion JSON arbitraria.
- Idioma: ingles.
- Sin encoder de vision (componente de solo texto).
- No se documentan capacidades de tool calling, function calling, uso de agentes multi-paso ni modo de razonamiento explicito ("thinking mode") en la informacion disponible.
- No se documentan capacidades multilingues mas alla del ingles.

## Casos de uso

- Enrutamiento de decisiones en atencion al cliente: dado el estado de una conversacion y varias acciones candidatas (escalar, responder, ofrecer reembolso), el modelo devuelve la opcion mas probable, apoyandose en el dominio de customer service presente en su conjunto de entrenamiento.
- Procesamiento de facturas: ante una factura con campos ambiguos y varias categorias contables u opciones de resolucion, el modelo puntua cada opcion y selecciona la mas adecuada, un escenario incluido explicitamente en las 400 cases del benchmark.
- Triaje de incidentes de seguridad: dada la descripcion de un incidente y un conjunto de respuestas posibles (aislar el host, escalar, monitorizar), el modelo produce una distribucion de probabilidad que permite priorizar la accion.
- Observabilidad de trazas de agentes: en pipelines donde un agente genera multiples trazas, el modelo puede clasificar o seleccionar la siguiente decision coherente con el estado observado.
- Scoring de opciones en pipelines de decision automatizada: uso como clasificador de decision en un sistema mayor, consumiendo la distribucion de probabilidad en lugar de una unica etiqueta.
- Evaluacion interna de sistemas de decision: emplear las metricas guardadas (Brier, KL, ECE, MAE ordinal) y la particion de test para comparar otros modelos de decision bajo el mismo protocolo.
- Anotacion asistida: generar etiquetas con distribucion de probabilidad sobre opciones para tareas de etiquetado en los dominios cubiertos.

## Benchmarks y rendimiento

Datos del conjunto de test retenido Typed Decisions (2.000 decisiones; 400 cases con cinco decisiones cada uno):

| Modelo | Exposicion de entrenamiento | Forma de la peticion | Exactitud |
|---|---|---:|---:|
| Qwen-9B-decision padre | Sin entrenamiento en Typed Decisions | Una pregunta por prompt | 61,1% |
| Jev 1.13.0, referencia publicada | General, zero-shot | Cinco preguntas por peticion | 72,7% |
| Qwen-9B-decision + QLoRA | Entrenado en el split de train de Typed Decisions | Una pregunta por prompt | 75,8% |

Metricas adicionales del especialista:

| Metrica | Valor |
|---|---|
| Exactitud (1.516/2.000) | 75,8% |
| Intervalo bootstrap por case al 95% | 73,65-77,90% (10.000 remuestreos, semilla 42) |
| Brier sobre objetivos suaves | 0,05413 |
| KL respecto al gold | 0,09613 |
| ECE bruto | 0,13244 |
| MAE de puntuacion ordinal | 0,22709 |

Advertencias indicadas por el autor: no es una victoria equiparable frente a Jev (el especialista ha visto la distribucion de train del benchmark mientras que la fila de Jev es zero-shot); el protocolo oficial envia las cinco preguntas en una sola peticion, mientras que la evaluacion del autor puntua cada pregunta por separado; la exactitud mide la concordancia con etiquetas que promedian tres muestras del profesor del benchmark, no la correccion objetiva; y el intervalo bootstrap no es una prueba de significacion emparejada frente a Jev.

## Requisitos de hardware

- El autor reporta el uso de una unica GPU RunPod B300 de 288 GB para la etapa de ajuste fino del padre.
- Pesos del padre en FP32: 35,82 GB en disco (coincide con 8.953.803.264 parametros a 4 bytes).
- Estimacion de VRAM para inferencia segun el recuento de parametros (no publicada por el autor, calculo propio a partir de 8,95B):
  - FP32: aproximadamente 36 GB solo para pesos.
  - BF16 (recomendado por el autor): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV.
  - Cuantizaciones INT8/INT4: no documentadas por el autor; no se publican pesos GGUF ni variantes cuantizadas en el repositorio.
- No cabe en GPUs de consumo con VRAM limitada en BF16 (16 GB) sin cuantizacion adicional no documentada; podria requerir GPUs de 24 GB o mas (RTX 3090/4090, A6000) con margen ajustado en BF16 y contexto corto.
- GPU profesionales recomendadas para BF16: A100 40/80 GB, H100, L40S, B300. Para FP32, se necesita una GPU de 40 GB o mas.
- Opciones de despliegue: la libreria declarada es transformers; el adaptador es PEFT/QLoRA. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud en Typed Decisions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-9B-decision + QLoRA | 8,95B (+58,2M adaptador) | no disponible | 75,8% (entrenado en train) | Apache 2.0 | HuggingFace |
| Qwen-9B-decision padre | 8,95B | no disponible | 61,1% (zero-shot respecto al benchmark) | Apache 2.0 | HuggingFace |
| Jev 1.13.0 | no disponible | no disponible | 72,7% (zero-shot) | no disponible | referencia publicada |

No se dispone de datos de parametros, contexto ni licencia de Jev 1.13.0, ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y alcance: el modelo esta especializado en cuatro dominios concretos (atencion al cliente, facturas, seguridad y trazas de agentes) derivados del dataset Typed Decisions; su comportamiento fuera de ellos no esta documentado.
- Riesgo de sobreajuste al benchmark: el especialista se ha entrenado sobre el split de train de Typed Decisions, por lo que su 75,8% no es comparable de forma directa con la referencia zero-shot de Jev.
- Protocolo de evaluacion divergente: el autor puntua cada pregunta por separado, mientras que el protocolo oficial envia las cinco preguntas en una unica peticion; el propio benchmark advierte que la forma de la peticion afecta a los resultados.
- Etiquetas de referencia: la exactitud mide la concordancia con etiquetas que promedian tres muestras de un profesor del benchmark, no la correccion objetiva.
- Alucinacion: no se documenta comportamiento especifico, pero al ser un modelo de decision restringido no debe usarse como generador libre de texto.
- Idioma: solo ingles; sin soporte multilingue declarado.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los artefactos derivados (padre y adaptador) y de los datasets de origen (CLINC150/ContractNLI).
- Produccion: no se documentan cuantizaciones disponibles ni integraciones con servidores de inferencia de alto rendimiento; el despliegue requiere cargar el padre en BF16 y el adaptador QLoRA por separado, y cargar solo la raiz del repositorio produce un resultado inferior (61,1%).
- Fecha de los datos: las evaluaciones guardadas son del 1 de octubre de 2026 y la publicacion no ha reentrenado ni reejecutado el modelo; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Detalles de la etapa 2 (QLoRA) no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/k4rth33k/Qwen-9B-decision
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset Typed Decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Benchmark card (referencia de Jev y protocolo): https://huggingface.co/datasets/LocalLLaMA/typed-decisions/blob/561333a8576d22875380b14d25a13065b046538c/README.md
- Repositorio de Summit: https://github.com/k4rth33k/summit
- Receta de entrenamiento causal de Summit: https://github.com/k4rth33k/summit/blob/7faf6575ea29402b14c6ac2ec1a5bb270defd602/examp (enlace truncado en la informacion proporcionada)
- Metricas del especialista (relativo al repositorio): eval/specialist_metrics.json
- Metricas del padre (relativo al repositorio): eval/base_metrics.json
- Grafico de exactitud (relativo al repositorio): assets/typed-decisions-accuracy.png
