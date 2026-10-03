# robgarct/attention-120m-ce-6k

## Resumen

attention-120m-ce-6k es un checkpoint de investigacion publicado por el usuario robgarct en Hugging Face: un transformer denso de 120 millones de parametros con atencion auto-regresiva estandar (self-attention), entrenado desde cero con entropia cruzada plana sobre el dataset Pile durante 6.000 actualizaciones, lo que equivale a 3.146 millones de tokens vistos. Su proposito declarado no es el uso generalista, sino servir de referencia de atencion dentro de la escalera de ablacion del enrutador "M=1 ahead-router" del proyecto recurrent-recall-circuits, con un presupuesto de tokens fijado para que todas las variantes de la escalera sean comparables entre si.

El modelo se distribuye como un unico fichero `final.ckpt` (con el estado del optimizador eliminado, `global_step` = 6000), acompanado de `resolved-config.yaml` y `metadata.json`. La model card reporta tres metricas: perplejidad de 11,79 en Pile sobre 1.000 secuencias de validacion, perplejidad de 3,56 en el conjunto "Rare-AR" y un 26,9% de "Natural FDA" sobre 1.102 ejemplos. Su relevancia actual es acotada y muy especifica: es una pieza de infraestructura de investigacion reproducible para estudiar circuitos de recall en contexto, no un modelo apto para producto.

Se enmarca en una familia de checkpoints de 120M del mismo autor que incluye variantes con mezcladores Hebbian (feature_dim 16 y 64), lo que permite comparar mecanismos de mezcla de secuencias con el mismo presupuesto de tokens. No se declara licencia ni idiomas soportados, y el repositorio no tiene descargas ni likes, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con self-attention auto-regresiva (language modeling) |
| Parametros totales | 120 millones (aproximado, segun model card) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; solo se distribuye el checkpoint en precision de entrenamiento |
| Idiomas soportados | No disponible (el entrenamiento usa Pile, corpus mayoritariamente en ingles) |
| Licencia | No disponible |
| Formato de pesos | PyTorch checkpoint (`.ckpt`), estado del optimizador eliminado; sin safetensors ni GGUF |
| Autor | robgarct |
| Fecha de publicacion | 2026-10-02 (creacion en Hugging Face) |
| Libreria | recurrent-recall-circuits |
| Tokens de entrenamiento | 3.146 mil millones (6.000 actualizaciones) |
| Dataset | Pile |
| Tamano del repositorio | 0,5 GB |
| Ficheros incluidos | `final.ckpt`, `resolved-config.yaml`, `metadata.json` |
| Identificador en el registro | `attention_120m_ce_6k` (configs/models/ladder_m1.yaml) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 120M de parametros con atencion completa (self-attention) y objetivo de modelado de lenguaje causal con entropia cruzada plana, sin tecnicas de regularizacion adicionales declaradas ni fases posteriores de ajuste (no hay RLHF, DPO ni SFT). El entrenamiento se realizo sobre Pile con una semilla fija (1111) y un presupuesto de 6.000 actualizaciones que suman 3.146 millones de tokens, lo que situaria el modelo en el entorno del presupuesto aproximadamente optimo segun las leyes de escala tipo Chinchilla para su tamano (en torno a 20 tokens por parametro). El fichero `resolved-config.yaml` incluido en el repositorio contiene la configuracion exacta de entrenamiento, pero su contenido no forma parte de la informacion proporcionada.

La innovacion tecnica no esta en el modelo en si, sino en el marco experimental: este checkpoint actua como referencia de atencion de la escalera de ablacion del enrutador "M=1 ahead-router" del proyecto recurrent-recall-circuits, con el presupuesto de tokens de la escalera. Al congelar tokens, semilla y numero de actualizaciones, las variantes de mezclador (atencion frente a mezcladores Hebbian) se pueden comparar sin confundir el efecto del mecanismo con el del presupuesto de computo. El checkpoint se registra en `configs/models/ladder_m1.yaml` bajo la clave `attention_120m_ce_6k`, apuntando a la configuracion `configs/experiment/lm/120m/attention/ce_6k.yaml`, y se descarga automaticamente desde el repositorio la primera vez que se usa.

## Capacidades

- Modelado de lenguaje causal: predice el siguiente token y genera texto coherente a nivel local.
- Recall en contexto: el modelo esta etiquetado y evaluado especificamente para tareas de recuperacion de informacion dentro del contexto (in-context recall), con la metrica "Natural FDA" como indicador reportado.
- Reproduccion de resultados: integrable como baseline en el CLI `recurrent_recall_circuits.cli.evaluate` con el suite `baseline`.
- Capacidad de ajuste fino: al ser un transformer de 120M en formato PyTorch, es plausible ajustarlo para tareas concretas, aunque no se documenta ningun ajuste realizado.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenado.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- Capacidades multilingues: no declaradas; el corpus de entrenamiento (Pile) es mayoritariamente ingles.
- No esta alineado con instrucciones: es un modelo base, no un modelo instruct.

## Casos de uso

- Baseline de la escalera de ablacion M=1: se usa para calcular la referencia de atencion contra la que se comparan variantes de mezclador con el mismo presupuesto de tokens, ejecutando `python -m recurrent_recall_circuits.cli.evaluate --suite baseline --registry configs/models/ladder_m1.yaml --models attention_120m_ce_6k`.
- Investigacion sobre circuitos de recall en contexto: al estar etiquetado con `in-context-recall` y evaluado con Rare-AR y Natural FDA, sirve para estudiar como un transformer pequeno resuelve recuperacion de asociaciones dentro del contexto, y contrastarlo con mecanismos recurrentes.
- Comparativa controlada de mecanismos de mezcla: confrontar este checkpoint con `hebbian-120m-featdim16-fast-20k` y `hebbian-120m-featdim64-fast-20k` permite aislar el efecto del mecanismo (atencion frente a Hebbian) manteniendo tamano y corpus.
- Ajuste fino para tareas concretas de NLP: con 120M de parametros y 0,5 GB de checkpoint, un ajuste supervisado de clasificacion, extraccion de entidades o reescritura cabe en una sola GPU de consumo, partiendo de representaciones ya entrenadas sobre Pile.
- Destilacion y experimentos de compresion: es un candidato razonable como estudiante (o como base de un estudiante) en experimentos de destilacion desde modelos mayores, por su bajo coste de inferencia.
- Inferencia en CPU y entornos con recursos limitados: el checkpoint en fp32 ocupa aproximadamente 0,5 GB, de modo que puede ejecutarse en portatiles, servidores sin GPU o dispositivos tipo Raspberry Pi 5 tras convertir los pesos a un runtime de CPU.
- Generacion masiva de datos sinteticos: su bajo coste por token permite producir grandes volumenes de texto para preentrenamiento o para aumentar datasets, asumiendo la baja calidad esperable de un modelo de 120M.
- Docencia y prototipado reproducible: semilla fija, configuracion resuelta incluida y presupuesto de tokens documentado hacen de este checkpoint un caso de estudio util para ensenar pipelines de entrenamiento y evaluacion end-to-end.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card; no se ha publicado comparacion directa con otros modelos en el mismo entorno de evaluacion.

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Perplejidad Pile | 11,79 | 1.000 secuencias de validacion |
| Perplejidad Rare-AR | 3,56 | No disponible el tamano del conjunto |
| Natural FDA | 26,9% | 1.102 ejemplos (conjunto completo) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, sin medicion publicada): aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16 y 0,12 GB en int8 para los pesos, mas el coste de activaciones y cache KV (que depende de la longitud de contexto, no declarada).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente para fp16; se puede usar desde una GTX 1650 o RTX 3050 hasta A100/H100, aunque en estas ultimas el modelo esta muy infrautilizado.
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en iGPU con memoria compartida y en CPU.
- Opciones de despliegue: el checkpoint es un `.ckpt` de PyTorch y se carga a traves de la libreria recurrent-recall-circuits. Para usar vLLM, TGI, llama.cpp u Ollama seria necesario convertir previamente los pesos al formato esperado (Hugging Face `safetensors` o GGUF); no se proporciona ningun script de conversion en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Por tamano, es esperable un throughput de cientos de tokens por segundo en una GPU moderna de gama media, pero no se ha publicado ninguna medicion.
- Coste de entrenamiento de referencia: 3.146 millones de tokens y 6.000 actualizaciones, reproducible en una unica GPU en un plazo corto segun la configuracion incluida.

## Comparativa con modelos similares

Comparacion con los checkpoints de la misma familia y presupuesto del mismo autor, segun los datos publicados en sus respectivas model cards. No existe una evaluacion head-to-head publicada.

| Modelo | Parametros | Mecanismo | Entrenamiento | Perplejidad Pile | Licencia |
|---|---|---|---|---|---|
| attention-120m-ce-6k | 120M | Self-attention | Pile, 6.000 updates (3,146B tokens) | 11,79 | No disponible |
| hebbian-120m-featdim16-fast-20k | 120M | Mezclador Hebbian (online_hebbian_v10, feature_dim 16) | Pile, 20.000 pasos | No disponible | No disponible |
| hebbian-120m-featdim64-fast-20k | 120M | Mezclador Hebbian (online_hebbian_v10, feature_dim 64) | Pile, 20.000 pasos | No disponible | No disponible |

Referencias externas de la misma categoria de tamano (especificaciones tomadas de sus fichas publicas, no medidas en un entorno comun; el rendimiento comparable no esta disponible):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| attention-120m-ce-6k | 120M | No disponible | No disponible | Hugging Face, sin descargas |
| GPT-2 (124M) | 124M | 1.024 tokens | MIT | Ampliamente desplegado |
| OPT-125M | 125M | 2.048 tokens | MIT | Hugging Face |
| Pythia-160M | 160M | 2.048 tokens | Apache 2.0 | Hugging Face |

La diferencia practica relevante frente a esas alternativas no es el rendimiento, sino el proposito: este checkpoint existe como referencia experimental reproducible, con semilla y presupuesto de tokens documentados, mientras que las alternativas citadas estan pensadas para uso general.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineacion (no hay RLHF ni DPO): no sigue ordenes y no debe usarse como asistente conversacional.
- Perplejidad de 11,79 en Pile: la calidad de generacion es la esperable en un modelo de 120M entrenado con 3,146B tokens; el texto es coherente a nivel local pero se degrada rapidamente en tramos largos.
- Riesgo alto de alucinacion y de afirmaciones factualmente incorrectas; no debe usarse como fuente de informacion.
- Idiomas soportados no declarados y corpus de entrenamiento mayoritariamente en ingles: el comportamiento en castellano no esta caracterizado.
- Licencia no declarada: no hay autorizacion explicita de uso comercial. No deberia desplegarse en produccion ni integrarse en productos sin aclarar previamente los terminos con el autor.
- Soporte practicamente nulo: 0 descargas y 0 likes, sin documentacion externa ni comunidad que valide el checkpoint.
- El estado del optimizador esta eliminado del `.ckpt`, por lo que no es posible reanudar el entrenamiento exactamente desde `global_step` 6000.
- El formato `.ckpt` es un checkpoint de PyTorch basado en `pickle`; cargarlo implica riesgo de ejecucion de codigo arbitrario si el fichero no es de confianza. Se recomienda usar `torch.load` con `weights_only=True` o convertir previamente a `safetensors`.
- No se documenta el tokenizador utilizado ni la longitud de contexto de entrenamiento, lo que complica la integracion en pipelines existentes sin inspeccionar `resolved-config.yaml`.
- El significado exacto de las metricas "Rare-AR" y "Natural FDA" no se detalla en la model card, por lo que no son interpretables de forma aislada sin consultar el repositorio recurrent-recall-circuits.
- No hay evidencia de evaluacion multilingue, de robustez frente a sesgos ni de seguridad, y tampoco se documenta la composicion del dataset mas alla de "Pile".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robgarct/attention-120m-ce-6k
- Repositorio de codigo recurrent-recall-circuits: https://github.com/HazyResearch/recurrent-recall-circuits
- Modelo hermano (Hebbian, feature_dim 64): https://huggingface.co/robgarct/hebbian-120m-featdim64-fast-20k
- Modelo hermano (Hebbian, feature_dim 16): https://huggingface.co/robgarct/hebbian-120m-featdim16-fast-20k
