# 3p3r/aegis-firewall-pii-text-heavy

## Resumen

Aegis Firewall PII Text Heavy es un clasificador binario de texto disenado para detectar la presencia de informacion personal identificable (PII) en fragmentos de texto en ingles. Lo desarrolla el usuario 3p3r y se distribuye como un adaptador LoRA denominado `yesno` sobre el modelo base Qwen2-1.5B-Instruct, aplicado especificamente sobre los modulos MLP. La tarea es deliberadamente simple: el modelo responde "yes" o "no" a la pregunta de si el texto contiene datos personales.

El modelo esta pensado para su despliegue en hardware de borde especializado, concretamente en el acelerador Hailo-10H integrado en el dispositivo Asus UGen300. Esta orientacion a inferencia local de bajo consumo lo diferencia de clasificadores PII basados en modelos mucho mayores que requieren GPU dedicada. El repositorio ocupa 2,3 GB, coherente con un adaptador LoRA empaquetado junto con los pesos del modelo base.

Su relevancia actual radica en la necesidad creciente de filtrado PII en pipelines de datos, cumplimiento normativo (RGPD) y proteccion de datos antes de enviar texto a servicios externos. No obstante, los resultados publicados son desiguales: alcanza un 93,0% en OpenPII pero cae a un 15,6% en PIILO, lo que sugiere una generalizacion limitada fuera de las distribuciones de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (`yesno`) sobre Qwen2-1.5B-Instruct, aplicada a modulos MLP |
| Parametros totales | 1.500 millones (modelo base Qwen2-1.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 2,3 GB; el autor no detalla safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango sobre Qwen2-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El adaptador, llamado `yesno`, se inserta unicamente en los modulos MLP del modelo base, no en las capas de atencion. La salida se interpreta como una respuesta binaria restringida a las cadenas exactas "yes" o "no"; cualquier otra salida no cuenta como acierto segun los criterios de evaluacion del autor.

El entrenamiento se realizo sobre la union de cuatro datasets publicos de PII en ingles: nvidia/Nemotron-PII, ai4privacy/pii-masking-openpii-1.5m, ai4privacy/pii-masking-400k y gretelai/gretel-pii-masking-en-v1. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta de la mezcla, hiperparametros, ni si se aplico RLHF o DPO (poco probable en una tarea de clasificacion binaria). La innovacion tecnica destacable es el objetivo de despliegue en el acelerador Hailo-10H, que impone un presupuesto de computo muy reducido y explica la eleccion de un modelo base pequeno con adaptador LoRA.

## Capacidades

- Clasificacion binaria de texto: determina si un fragmento contiene PII, respondiendo "yes" o "no".
- Deteccion de PII en texto en ingles, entrenado sobre datasets de enmascaramiento y anonimizacion.
- Inferencia en hardware de borde: disenado para ejecutarse en Hailo-10H (Asus UGen300).
- Baja latencia de primera respuesta: 0,398 s hasta el primer token en el dispositivo de referencia.
- No soporta tool calling ni function calling (no documentado; la tarea es clasificacion).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado previo en pipelines de datos: antes de ingerir texto en un sistema de analitica o entrenamiento, el modelo marca los registros que contienen PII para su enmascaramiento o exclusion, aprovechando su bajo coste de inferencia en hardware de borde.
- Cumplimiento del RGPD en pasarelas de datos: integrado como paso de comprobacion en un gateway que procesa texto de usuarios, bloquea o redirige los fragmentos con datos personales antes de que salgan de la infraestructura controlada.
- Proteccion de logs y telemetria: clasificar lineas de log antes de almacenarlas o enviarlas a un SIEM, evitando persistir nombres, correos o identificadores personales en sistemas menos protegidos.
- Preprocesado para anonimizacion: usar la salida binaria como disparador para invocar un modelo de enmascaramiento (NER o regex) solo cuando el texto contiene PII, reduciendo el coste computacional del pipeline completo.
- Despliegue en dispositivos de borde con Hailo-10H: escenarios donde no hay GPU disponible y se requiere un filtro PII local de bajo consumo, como estaciones de trabajo o equipos embebidos.
- Moderacion de contenido en aplicaciones de mensajeria: comprobar mensajes entrantes en busca de datos personales antes de reenviarlos o registrarlos, con latencia de primera respuesta inferior a medio segundo.
- Triaje en revision documental: clasificar rapidamente lotes de documentos en ingles para priorizar la revision manual de aquellos que contienen PII.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en Hailo-10H, con un maximo de 2.000 filas por banco de pruebas. Un acierto requiere que la respuesta sea exactamente "yes" o "no".

| Bench | Correctos | Precision |
|---|---|---|
| Argilla | 1637/2000 | 81,9% |
| Gretel | 1562/2000 | 78,1% |
| Nemotron | 1066/2000 | 53,3% |
| OpenPII | 1860/1999 | 93,0% |
| PIILO | 312/1999 | 15,6% |
| PIIMB | 1582/1999 | 79,1% |
| TAB | 81/127 | 63,8% |
| Micro (agregado) | 8100/12124 | 66,8% |

Tiempo hasta el primer token: 0,398 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el modelo base Qwen2-1.5B-Instruct en FP16 requiere aproximadamente 3 GB, y en cuantizacion de 4 bits alrededor de 1 GB, aunque el autor no publica cifras.
- GPU recomendadas: no documentadas; el autor reporta ejecucion en el acelerador Hailo-10H del Asus UGen300, no en GPU.
- Compatibilidad con GPU de consumo: probable dado el tamano del modelo base (1.500 millones de parametros), pero no confirmada por el autor.
- Opciones de despliegue: el autor solo documenta el despliegue en Hailo-10H; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,398 s hasta el primer token en Hailo-10H; throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, el modelo se apoya en Qwen2-1.5B-Instruct (1.500 millones de parametros, licencia Apache-2.0 en su version original) frente a la licencia GPL-3.0 de este adaptador. Otros clasificadores PII publicos como los basados en modelos BERT o en Microsoft Presidio no cuentan con resultados comparables en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Aegis Firewall PII Text Heavy | 1.500 M (base) + LoRA | no disponible | GPL-3.0 | Clasificacion binaria PII en borde |
| Qwen2-1.5B-Instruct (base) | 1.500 M | no disponible | Apache-2.0 | LLM generativo general |
| Clasificadores PII basados en BERT | no disponible | no disponible | variable | NER / clasificacion PII |

## Limitaciones y advertencias

- Precision muy desigual entre dominios: 15,6% en PIILO frente a 93,0% en OpenPII, lo que indica escasa generalizacion a distribuciones no vistas.
- Precision agregada del 66,8% (micro), insuficiente para muchos casos de produccion sin supervision humana o capas adicionales.
- Solo ingles: no cubre otros idiomas, lo que limita su uso en entornos multilingues.
- Evaluacion limitada a 2.000 filas por banco de pruebas por restricciones de velocidad en el dispositivo; el autor indica que planea eliminar ese limite, por lo que las cifras podrian variar.
- Riesgo de falsos negativos con implicaciones de cumplimiento normativo (RGPD) si se usa como unico filtro.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios; revisar antes de uso comercial.
- Sin documentacion sobre sesgos, composicion del dataset de entrenamiento ni hiperparametros, lo que dificulta la auditoria.
- Formato de pesos y opciones de cuantizacion no documentados, lo que complica su integracion en stacks estandar.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3p3r/aegis-firewall-pii-text-heavy
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset OpenPII 1.5M: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset pii-masking-400k: https://huggingface.co/datasets/ai4privacy/pii-masking-400k
- Dataset Gretel PII Masking EN v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
