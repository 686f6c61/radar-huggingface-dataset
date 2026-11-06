# prompt-armor/l2-deberta-onnx

## Resumen

`prompt-armor/l2-deberta-onnx` es una compilación ONNX cuantizada a INT8 del clasificador de inyección de prompts `protectai/deberta-v3-base-prompt-injection-v2`, publicado por el proyecto prompt-armor como capa L2 de su sistema de defensa contra inyección de prompts. No es un modelo entrenado por prompt-armor: los pesos proceden íntegramente de Protect AI, que los liberó bajo licencia Apache 2.0 sobre la base de `microsoft/deberta-v3-base`. La única intervención del publicador es la cuantización dinámica y el reempaquetado para su distribución estable.

El modelo resuelve una tarea concreta: clasificación binaria de texto en inglés entre `SAFE` (etiqueta 0) e `INJECTION` (etiqueta 1), con una longitud máxima de secuencia de 512 tokens. Su relevancia actual deriva del contexto de su publicación: Protect AI archivó el proyecto llm-guard y retiró del Hub la revisión original de la que dependía prompt-armor 0.9.1, de modo que esta copia cuantizada garantiza que las instalaciones del sistema sigan funcionando sin depender de la disponibilidad del repositorio upstream.

Arquitectura DeBERTa-v3-base (transformer encoder con atención disentangled y embedding de posiciones relativas), distribuida como grafo ONNX que se ejecuta únicamente con ONNX Runtime, sin necesidad de PyTorch. El repositorio ocupa 0,2 GB y el fichero cuantizado `model_quant.onnx` pesa 233 MB frente a los 738 MB del export FP32 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformer encoder), exportada a ONNX |
| Parametros totales | no disponible (el modelo base DeBERTa-v3-base ronda los 184M; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max sequence length) |
| Tipos de cuantizacion | INT8 dinamica de ONNX Runtime, per-channel, sobre `MatMul` (solo pesos) y `Gather`; FP32 disponible en el export upstream |
| Idiomas soportados | en (ingles); el autor declara que no maneja texto no ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quant.onnx`), mas `tokenizer.json` y `config.json` |
| Tarea | Clasificacion de texto binaria (`0 = SAFE`, `1 = INJECTION`) |
| Modelo base | protectai/deberta-v3-base-prompt-injection-v2 (revision 90c9989b1a342275dd0d1a95aad283c04e075671) |
| Tamano del repo | 0,2 GB |
| Ejecucion | ONNX Runtime exclusivamente, sin PyTorch |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tuning de `microsoft/deberta-v3-base` realizado por Protect AI para clasificacion binaria de inyeccion de prompts. DeBERTa-v3 combina atencion disentangled (vectores separados para contenido y posicion) con embeddings de posiciones relativas y una variante mejorada del mecanismo de atención; el resultado es un encoder de 512 tokens que produce una representacion por secuencia sobre la que se aplica una cabeza de clasificacion de dos clases. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La intervencion de prompt-armor se limita a la cuantizacion: parte del export ONNX FP32 oficial de Protect AI y aplica cuantizacion dinamica INT8 per-channel sobre las matrices de pesos de `MatMul` y sobre las operaciones `Gather`. La model card documenta que la cuantizacion per-tensor degrada gravemente el modelo (AUC 0,92 a 0,65), mientras que la per-channel preserva el rendimiento (AUC 0,914 y 98,5 % de coincidencia de decision con FP32). El script `scripts/export_l2_model.py` del repositorio de prompt-armor reconstruye el fichero de forma determinista a partir de la revision fijada del upstream.

## Capacidades

- Clasificacion binaria de texto en ingles para detectar intentos de inyeccion de prompts (instrucciones que intentan sobrescribir, ignorar o exfiltrar el prompt de sistema).
- Deteccion semantica de ataques sutiles e indirectos que un filtro por expresiones regulares no captura, segun la descripcion del proyecto prompt-armor.
- Integracion como capa L2 dentro de una pipeline de cinco capas que fusiona puntuaciones mediante un meta-clasificador entrenado.
- Inferencia offline en CPU mediante ONNX Runtime, sin dependencias de PyTorch ni de servicios externos.
- Salida de probabilidad calibrada por clase, apta para umbralizacion configurable.
- No soporta tool calling, function calling, generacion de texto, agentes, vision ni audio: es exclusivamente un clasificador.
- No detecta jailbreaks por si mismo: en el benchmark interno de prompt-armor marca 0 de las 100 solicitudes daninas de JailbreakBench.
- No procesa texto en idiomas distintos del ingles.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: se ejecuta el clasificador sobre cada mensaje de usuario antes de enviarlo al LLM; si `P(INJECTION)` supera el umbral, se bloquea o se marca la peticion. La latencia baja y la ejecucion en CPU lo hacen viable en linea.
- Defensa en profundidad en pipelines RAG: se clasifican tanto la consulta del usuario como los documentos recuperados, de modo que se detectan inyecciones indirectas incrustadas en el contenido recuperado antes de que lleguen al modelo generativo.
- Puerta de seguridad en agentes con acceso a herramientas: antes de permitir que un agente ejecute una funcion o acceda a un recurso, se valida el texto de la instruccion con esta capa para reducir el riesgo de secuestro de herramientas.
- Moderacion de contenido generado por usuarios en foros o plataformas de soporte: se analizan los mensajes entrantes para detectar intentos de manipular bots de atencion al cliente desplegados sobre LLM.
- Evaluacion y monitorizacion en CI/CD de sistemas LLM: se integra el clasificador en la bateria de pruebas de regresion para medir la tasa de deteccion ante un corpus conocido de ataques y detectar degradaciones tras cambios en el prompt de sistema.
- Despliegue en entornos con recursos limitados o air-gapped: al ejecutarse solo con ONNX Runtime y ocupar 233 MB, cabe en contenedores ligeros y en maquinas sin GPU, sin llamadas a servicios externos.
- Analisis de registros historicos: se reprocesan conversaciones almacenadas para identificar intentos de inyeccion pasados y auditar la exposicion del sistema.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la propia cuantizacion, medidos por prompt-armor:

| Metrica | FP32 (upstream) | INT8 per-channel (este modelo) | INT8 per-tensor |
|---|---|---|---|
| AUC | 0,92 | 0,914 | 0,65 |
| Coincidencia de decision con FP32 | referencia | 98,5 % | no disponible |
| Tamano del fichero | 738 MB | 233 MB | no disponible |

En el benchmark interno de prompt-armor (1.534 muestras), el modelo marca 0 de las 100 solicitudes daninas de JailbreakBench. La model card advierte que los datos de entrenamiento upstream incluyen `jackhhao/jailbreak-classification`, que es tambien una de las fuentes del benchmark de prompt-armor (119 de 565 ataques), por lo que las cifras aisladas sobre ese benchmark sobreestiman el rendimiento en datos no vistos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para `CPUExecutionProvider` de ONNX Runtime.
- Memoria RAM estimada: en torno a 300-500 MB para el modelo INT8 mas el tokenizador y el overhead del runtime.
- GPU recomendadas: ninguna en particular; cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) puede acelerar la inferencia, pero no es el escenario objetivo.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el limite practico es la CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), con posibilidad de servirlo detras de un microservicio propio; no se distribuye en formato GGUF ni como modelo de Ollama, vLLM o TGI, ya que no es un modelo generativo.
- Latencia: el proyecto prompt-armor declara aproximadamente 24 ms para la pipeline completa de cinco capas en CPU; no se proporciona una cifra aislada de esta capa.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| prompt-armor/l2-deberta-onnx | no disponible (base DeBERTa-v3-base) | 512 | Clasificacion de inyeccion de prompts | Apache 2.0 | ONNX INT8 |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible (base DeBERTa-v3-base) | 512 | Clasificacion de inyeccion de prompts | Apache 2.0 | safetensors / ONNX FP32 |
| DeBERTa-v3-xsmall L2 de prompt-armor | 22M (segun el repositorio del proyecto) | no disponible | Clasificacion de inyeccion de prompts | no disponible | ONNX |

La diferencia principal frente al modelo upstream es el tamano (233 MB frente a 738 MB) y el formato de ejecucion (solo ONNX Runtime frente a safetensors y ONNX FP32), con una perdida de AUC de 0,92 a 0,914. Frente a la variante xsmall del propio proyecto, esta version prioriza precision sobre velocidad y huella de memoria. No se dispone de datos para comparar con clasificadores alternativos de terceros.

## Limitaciones y advertencias

- Solo ingles: el autor declara explicitamente que el modelo no maneja texto en otros idiomas.
- No detecta jailbreaks: en el benchmark de prompt-armor marca 0 de las 100 solicitudes daninas de JailbreakBench; necesita capas adicionales para cubrir ese vector.
- Riesgo de sobreajuste al benchmark: parte de los datos de entrenamiento upstream coincide con una fuente del benchmark de prompt-armor, por lo que las metricas publicadas sobreestiman el rendimiento en datos no vistos.
- Sesgos: no se documenta una evaluacion de sesgos; al ser un clasificador entrenado sobre datos de seguridad, puede producir falsos positivos en textos legitimos que discutan tecnicas de inyeccion de prompts (documentacion, auditorias, articulos tecnicos).
- Riesgo de falsos negativos ante ataques noveles, ofuscados o en otros idiomas, dado el caracter supervisado del entrenamiento.
- La cuantizacion per-tensor degrada el modelo de forma severa (AUC 0,65); cualquier reexportacion debe mantener la cuantizacion per-channel.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y atribuir a Protect AI como autor del modelo; prompt-armor solo debe acreditarse por la cuantizacion.
- Dependencia de un unico mantenedor: el modelo upstream fue retirado del Hub y su proyecto archivado; esta copia existe precisamente para mitigar ese riesgo, pero su mantenimiento futuro depende de prompt-armor.
- No es un modelo generativo: no puede sustituir a un LLM en ninguna tarea de generacion, razonamiento o codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prompt-armor/l2-deberta-onnx
- Modelo base upstream: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Modelo base de Microsoft: https://huggingface.co/microsoft/deberta-v3-base
- Repositorio del proyecto prompt-armor: https://github.com/prompt-armor/prompt-armor
- Script de exportacion y cuantizacion: https://github.com/prompt-armor/prompt-armor/blob/main/scripts/export_l2_model.py
- Paquete en PyPI: https://pypi.org/project/prompt-armor/
- Protect AI: https://protectai.com
