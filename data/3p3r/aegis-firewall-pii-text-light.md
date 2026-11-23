# 3p3r/aegis-firewall-pii-text-light

## Resumen

Aegis Firewall PII Text Light es un clasificador binario de texto desarrollado por el usuario 3p3r que responde a una unica pregunta: si un fragmento de texto en ingles contiene informacion personal identificable (PII) o no. El modelo devuelve exactamente "yes" o "no" y esta pensado como un filtro ligero de primera linea para pipelines de proteccion de datos, no como un sistema de extraccion o enmascaramiento de entidades.

Tecnicamente es un fine-tuning de `all-MiniLM-L6-v2` (encoder transformer de tipo BERT, aproximadamente 22 millones de parametros) ejecutado sobre un acelerador Hailo-10H integrado en un Asus UGen300. La cabeza de clasificacion es una capa lineal que se ejecuta en el host, mientras que el encoder se ejecuta en el NPU. El modelo se ha ajustado con cuatro datasets publicos de PII en ingles: Nemotron-PII, OpenPII 1.5M, pii-masking-400k y Gretel PII Masking EN v1.

Su relevancia es acotada pero concreta: ocupa el nicho de la deteccion PII de muy baja latencia en hardware de borde, con tiempos de inferencia de unos 9 ms por llamada en batch 1. La licencia GPLv3 y el sesgo marcado de su rendimiento entre dominios (99,9% en Nemotron frente a 13,9% en PIILO) condicionan fuertemente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning de `all-MiniLM-L6-v2`) con cabeza lineal binaria en host |
| Parametros totales | no disponible (el modelo base `all-MiniLM-L6-v2` tiene aproximadamente 22,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, tipicamente 256 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 0,0 GB; la model card menciona ejecucion en Hailo-10H, lo que implica un artefacto compilado para el NPU, pero no se especifica el formato) |

## Arquitectura y entrenamiento

El modelo parte de `all-MiniLM-L6-v2`, un encoder transformer derivado de la familia BERT con aproximadamente 22,7 millones de parametros y 6 capas, disenado originalmente para embeddings de frases. Sobre esa base se ha realizado un fine-tuning supervisado para clasificacion binaria, anadiendo una capa lineal en el host que produce la respuesta "yes"/"no". La parte encoder se compila y ejecuta en el NPU Hailo-10H del Asus UGen300; la cabeza lineal permanece en CPU. No se especifica en la model card si hubo RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero exacto de tokens de entrenamiento.

Los datos de ajuste provienen de cuatro conjuntos publicos en ingles: `nvidia/Nemotron-PII`, `ai4privacy/pii-masking-openpii-1.5m`, `ai4privacy/pii-masking-400k` y `gretelai/gretel-pii-masking-en-v1`. No se detalla la composicion exacta del dataset final, el reparto train/validacion/test, ni si se aplico balanceo de clases. La innovacion tecnica destacable no esta en la arquitectura sino en el despliegue: inferencia de un clasificador PII en un acelerador de borde con latencias de milisegundos.

## Capacidades

- Clasificacion binaria de texto en ingles: indica si el texto contiene PII ("yes") o no ("no").
- Deteccion de PII en texto plano de dominios diversos, con rendimiento muy variable segun la distribucion del dato de entrada.
- Inferencia de baja latencia en hardware de borde (Hailo-10H), con tiempos medios de 9,0 ms y mediana de 8,9 ms por llamada en batch 1.
- Ejecucion local sin dependencia de servicios en la nube, adecuada para entornos con requisitos de privacidad estrictos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue: solo ingles.

## Casos de uso

- Filtro previo en pipelines de logging: interceptar mensajes de aplicacion antes de escribirlos en un sistema de logs centralizado y descartar o marcar aquellos que contengan PII, reduciendo el riesgo de exposicion en herramientas de observabilidad.
- Puerta de admision en sistemas de atencion al cliente: clasificar cada mensaje entrante de un usuario antes de enviarlo a un LLM o a un agente externo, para decidir si requiere un tratamiento especial (redaccion previa, enrutado a un flujo seguro).
- Cumplimiento en exportacion de datos: prevalidar lotes de registros antes de exportarlos a terceros o a entornos de analitica, marcando los que contienen PII y evitando fugas accidentales.
- Preprocesado en pipelines de anonimizacion: usar el clasificador como primera etapa para decidir si un documento merece pasar por un extractor de entidades mas costoso, ahorrando computo en el caso mayoritario de textos sin PII.
- Despliegue en dispositivos de borde: integracion en el Asus UGen300 u otro hardware Hailo-10H para filtrado PII local en entornos sin conectividad o con restricciones de soberania del dato, aprovechando la latencia de ~9 ms.
- Control de calidad en datasets: auditar corpus de entrenamiento o evaluacion para detectar contaminacion con datos personales antes de publicarlos o usarlos en el ajuste de otros modelos.
- Moderacion de contenido en foros o formularios: clasificar envios de usuarios en tiempo real para alertar sobre posible exposicion de datos personales en texto publico.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en Hailo-10H, con un maximo de 2.000 filas por bench y contando como correcta solo una respuesta exacta "yes" o "no":

| Bench | Correctos | Precision |
|---|---|---|
| Argilla | 1753/2000 | 87,7% |
| Gretel | 1977/2000 | 98,9% |
| Nemotron | 1999/2000 | 99,9% |
| OpenPII | 1997/1999 | 99,9% |
| PIILO | 278/1999 | 13,9% |
| PIIMB | 1589/1999 | 79,5% |
| TAB | 127/127 | 100,0% |
| Micro (agregado) | 9720/12124 | 80,2% |

Latencia en batch 1, 300 llamadas tras warmup: media 9,0 ms, mediana 8,9 ms.

## Requisitos de hardware

- Inferencia objetivo en NPU Hailo-10H (Asus UGen300). No se documentan requisitos de VRAM para GPU.
- VRAM estimada para ejecucion en GPU: no disponible. Por el tamano del modelo base (~22,7 M de parametros), cabria en cualquier GPU consumer, pero no hay datos publicados de rendimiento en GPU.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del encoder, aunque no hay confirmacion ni cifras de throughput en GPU.
- Opciones de despliegue: ejecucion en Hailo-10H con cabeza lineal en host segun la model card. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a modelos generativos, no a este clasificador).
- Latencia: media 9,0 ms y mediana 8,9 ms por llamada en batch 1 sobre Hailo-10H. Throughput agregado no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base `all-MiniLM-L6-v2` (Sentence Transformers, licencia Apache-2.0, ~22,7 M de parametros) es el encoder del que deriva este fine-tuning, pero no es un clasificador PII y no se han publicado comparaciones directas. Alternativas como clasificadores PII basados en modelos mayores (BERT, DeBERTa, modelos generativos) no estan evaluadas en la model card, por lo que no es posible una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aegis Firewall PII Text Light | ~22,7 M (base) | no disponible | GPL-3.0 | Hugging Face |
| `all-MiniLM-L6-v2` (base) | ~22,7 M | 256 tokens (tipico) | Apache-2.0 | Hugging Face |
| Otros clasificadores PII | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy dependiente del dominio: 13,9% de precision en PIILO frente a 99,9% en Nemotron y OpenPII. El 80,2% micro agregado oculta una varianza enorme; no debe asumirse un rendimiento uniforme.
- Solo ingles. Textos en otros idiomas no estan soportados y pueden producir clasificaciones erroneas.
- Salida estrictamente binaria "yes"/"no": no identifica que entidad es PII, no la localiza ni la enmascara. No sustituye a un sistema de redaccion o anonimizacion.
- Riesgo de falsos negativos en dominios no representados en el entrenamiento (ver PIILO), lo que en un filtro de seguridad implica fugas potenciales de datos personales.
- Riesgo de falsos positivos en textos que contengan cadenas con formato similar a PII (numeros, nombres comunes) sin serlo realmente.
- Benchmarks limitados a 2.000 filas por conjunto por limitaciones de velocidad en el hardware; el autor indica que planea eliminar el tope, pero los resultados actuales no cubren los conjuntos completos.
- Licencia GPL-3.0: copyleft fuerte. El uso comercial es posible, pero la distribucion de software derivado obliga a liberar el codigo bajo la misma licencia; conviene revisar implicaciones antes de integrarlo en productos propietarios.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion independiente por parte de la comunidad.
- Repo de 0,0 GB y formato de pesos no documentado: la integracion requiere conocer el artefacto compilado para Hailo-10H, lo que limita la portabilidad a otros entornos.
- No hay informacion sobre sesgos demograficos, de genero o geograficos en la deteccion de PII; la sensibilidad puede variar segun el origen de los nombres o la estructura de los datos personales.
- No apto para decisiones de cumplimiento normativo sin supervision humana: la clasificacion binaria no constituye una garantia legal de anonimizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3p3r/aegis-firewall-pii-text-light
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset OpenPII 1.5M: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset pii-masking-400k: https://huggingface.co/datasets/ai4privacy/pii-masking-400k
- Dataset Gretel PII Masking EN v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
