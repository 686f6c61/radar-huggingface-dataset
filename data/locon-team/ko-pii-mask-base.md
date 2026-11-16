# locon-team/ko-pii-mask-base

## Resumen

ko-pii-mask-base es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en coreano. Lo desarrolla locon-team y se distribuye como un grafo ONNX cuantizado en 8 bits, derivado del encoder monologg/koelectra-base-v3-discriminator. Su propósito es servir como primera etapa de un pipeline de pseudonimización local: enmascarar nombres, teléfonos, identificadores y otros datos sensibles antes de enviar texto a servicios de IA externos, y restaurar después los valores originales.

El modelo resuelve un problema concreto de privacidad en flujos con LLM: evitar que datos personales salgan del perímetro del usuario. Para ello etiqueta cada token con un esquema BIO de 57 etiquetas (28 tipos de entidad con prefijos B/I más la clase O) y se acompaña de una capa de postprocesado (`PiiDetector`) que consolida los spans detectados.

Técnicamente es un transformer encoder de 12 capas y 768 dimensiones, con unos 110 millones de parámetros, empaquetado en un único fichero ONNX de aproximadamente 108 MB. Está entrenado y evaluado principalmente sobre datos sintéticos en coreano, con una licencia Apache-2.0 que permite uso comercial. Su relevancia actual reside en que ofrece inferencia en CPU sin dependencias de PyTorch, con latencias de milisegundos por línea de chat, lo que lo hace apto para despliegue en el propio dispositivo del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (KoELECTRA-base-v3), clasificación de tokens con esquema BIO de 57 etiquetas |
| Parámetros totales | Aproximadamente 110 millones (dato del autor) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | ONNX con cuantización dinámica de 8 bits por canal; 12 capas de salida FFN mantienen activaciones en fp32 y solo los pesos en 8 bits |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_int8w8.onnx`), más `tokenizer.json` y `tags.json` |

## Arquitectura y entrenamiento

El modelo parte de KoELECTRA-base-v3-discriminator, un encoder transformer de 12 capas y 768 dimensiones de representación con aproximadamente 110 millones de parámetros. Sobre esa base se añade una cabeza de clasificación de tokens que predice 57 etiquetas BIO correspondientes a 28 tipos de entidad más la clase O. La distribución se realiza exclusivamente en ONNX con cuantización dinámica de 8 bits por canal; según el autor, las 12 capas de salida de la FFN conservan las activaciones en fp32 porque reducir también estas a 8 bits degradaba la tasa de omisión del 0,7 % al 15,9 % debido a valores atípicos en las activaciones.

Los datos de entrenamiento combinan documentos sintéticos en coreano generados por un generador propio (documentos, chats, correos, consultas de atención al cliente y formularios), con valores de PII totalmente ficticios e identificadores deliberadamente construidos con checksums inválidos. Se complementan con la porción coreana de ai4privacy/pii-masking-openpii-1.5m (CC-BY-4.0), las plantillas de 1T/veil-pii-ko-synth (Apache-2.0) rellenadas con el generador propio, y las plantillas conversacionales de los conjuntos de AI Hub sobre consultas de atención ciudadana y automatización de tareas administrativas, también rellenadas sintéticamente. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste por preferencias; se trata de un modelo de etiquetado supervisado.

## Capacidades

- Detección de entidades PII en coreano mediante clasificación de tokens con 28 tipos de entidad y esquema BIO.
- Etiquetado de nombres de persona, números de teléfono, identificadores y otras categorías de datos personales presentes en el esquema de 57 etiquetas.
- Pseudonimización con reemplazo por marcadores tipados (por ejemplo `[PERSON_1]`, `[PHONE_1]`) y tabla de restauración asociada, implementada en el paquete `ko-pii-mask`.
- Ejecución sin PyTorch: el paquete de inferencia solo requiere ONNX Runtime y `huggingface_hub`.
- Inferencia en CPU con bajo consumo de memoria (conjunto de trabajo de aproximadamente 280 MB según el autor).
- Procesamiento de documentos, correos, chats y transcripciones de consultas, según la composición del corpus de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Enmascarado previo al envío a LLM externos: el modelo detecta y sustituye PII en el prompt antes de que el texto salga del dispositivo, y la tabla de restauración permite reinsertar los valores originales en la respuesta. Es adecuado por su ejecución local en CPU y su latencia de 16,6 ms por línea de chat.
- Atención al cliente con datos de terceros: en un chat de soporte en coreano, el modelo puede anonimizar números de teléfono, nombres y direcciones antes de registrar o reenviar la conversación a sistemas analíticos, reduciendo la exposición de datos personales en logs.
- Cumplimiento y minimización de datos en pipelines de registro: integrado como paso previo al almacenamiento de correos o formularios, permite generar versiones pseudonimizadas de documentos para entornos de prueba o análisis, manteniendo la estructura del texto.
- Preparación de corpus para investigación: dado que trabaja sobre documentos, correos y consultas, puede usarse para limpiar conjuntos de datos coreanos antes de compartirlos con equipos externos, con la advertencia de que no garantiza una desidentificación completa.
- Despliegue en el borde (edge) y aplicaciones de escritorio: al distribuirse como ONNX de 108 MB y ejecutarse en 2 hilos de CPU sin GPU, encaja en clientes de escritorio o extensiones que necesiten filtrar PII en local sin infraestructura de servidor.
- Preprocesado en sistemas de traducción o transcripción: antes de enviar transcripciones de consultas a un servicio de traducción, el modelo puede sustituir identificadores por marcadores tipados y restaurarlos después, preservando la coherencia del texto traducido.
- Filtrado de datos en herramientas de soporte interno: para equipos que construyen asistentes sobre bases documentales coreanas, permite anonimizar los documentos indexados y evitar que el recuperador exponga datos personales en las respuestas.

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor, con postprocesado incluido y la configuración por defecto de `PiiDetector`:

| Conjunto | Descripción | Tasa de omisión (alguna entidad no detectada) | Tasa con enmascarado excesivo |
|---|---|---|---|
| KDPII, partición de test (externa, CC-BY-4.0) | Conversaciones con habla real | 22,3 % (por intervención) | 7,4 % |
| Partición de test de openpii | Documentos traducidos y sintéticos | 1,9 % | 7,2 % |
| Documentos, correos, chats y consultas sintéticos | 6 conjuntos, 2.100 casos | 1,3 % – 10,0 % | 37 % – 53 % (ver nota) |
| Conjunto sintético con tipos de institución no vistos | 600 casos | 3,8 % | 15,5 % |
| Conjunto de topónimos en contexto personal | 200 frases | 94 % de los topónimos personales detectados (con ruido) | 15,5 % de topónimos genéricos enmascarados también |

Nota del autor: en los conjuntos sintéticos, la referencia no etiqueta los cargos junto a los nombres (por ejemplo, «송동현 부장님»), por lo que se contabilizan como enmascarado excesivo; el exceso real es menor que la cifra indicada.

Rendimiento de inferencia medido en Intel Core Ultra 7, 2 hilos, sin GPU: 4,15 segundos por cada 10.000 caracteres, 16,6 ms por línea de chat, conjunto de trabajo de aproximadamente 280 MB. La coincidencia de spans (F1) con el modelo PyTorch original es del 99,0 %.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU.
- Memoria RAM: conjunto de trabajo de aproximadamente 280 MB según el autor, más el overhead de ONNX Runtime.
- GPU recomendadas: no aplica; no se documenta soporte ni aceleración por GPU.
- GPU de consumo: irrelevante para este modelo, ya que su objetivo es ejecución en CPU.
- Opciones de despliegue: ONNX Runtime a través del paquete `ko-pii-mask` (instalación desde el repositorio de GitHub del proyecto); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de tokens.
- Latencia y throughput: 4,15 s por 10.000 caracteres y 16,6 ms por línea de chat en Intel Core Ultra 7 con 2 hilos; el rendimiento escala con el número de hilos y la CPU utilizada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| locon-team/ko-pii-mask-base | Clasificación de tokens PII | ~110 M | No disponible | Coreano | Apache-2.0 | ONNX int8 |
| monologg/koelectra-base-v3-discriminator | Encoder base (modelo del que deriva) | ~110 M | No disponible | Coreano | Apache-2.0 | PyTorch |
| Modelos NER coreanos genéricos (por ejemplo, variantes de KoELECTRA afinadas para NER) | Clasificación de tokens | ~110 M | No disponible | Coreano | Variable según autor | PyTorch, a veces ONNX |

No se dispone en la información proporcionada de resultados de benchmarks comparativos frente a alternativas específicas de detección de PII en coreano, por lo que la comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Omisión de entidades en texto real: la tasa de omisión sobre el conjunto externo KDPII alcanza el 22,3 % por intervención, muy superior a la de los conjuntos sintéticos; el modelo está entrenado y evaluado mayoritariamente con datos sintéticos.
- Entidades no vistas: los nombres de instituciones y los alias no presentes en el corpus de entrenamiento tienden a no detectarse (3,8 % de omisión en el conjunto de instituciones no vistas, pero con peor comportamiento en casos reales).
- Enmascarado excesivo: se documenta un 15,5 % de topónimos genéricos enmascarados en contextos personales, y tasas del 37 % al 53 % en conjuntos sintéticos (parcialmente atribuibles a un etiquetado de referencia incompleto).
- No garantiza una desidentificación completa ni constituye una herramienta de cumplimiento normativo; el propio autor recomienda revisión humana en documentos críticos.
- Sesgos: no se documentan análisis específicos de sesgo demográfico, geográfico o de género en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección.
- Idioma: soporta únicamente coreano; no se documenta rendimiento en otros idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe conservar el fichero `NOTICE` con las atribuciones de los modelos y datos de origen; parte de los datos de entrenamiento (AI Hub) no se redistribuyen y las plantillas derivadas de ellos deben tratarse con cautela.
- Longitud de contexto: no documentada; en la práctica, el modelo procesa fragmentos acotados por la arquitectura del encoder y el pipeline de postprocesado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/locon-team/ko-pii-mask-base
- Repositorio del paquete de inferencia: https://github.com/locon-team/ko-pii-mask
- Modelo base: https://huggingface.co/monologg/koelectra-base-v3-discriminator
- Dataset ai4privacy/pii-masking-openpii-1.5m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset 1T/veil-pii-ko-synth: https://huggingface.co/datasets/1T/veil-pii-ko-synth
