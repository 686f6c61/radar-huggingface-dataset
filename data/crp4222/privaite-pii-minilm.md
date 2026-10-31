# crp4222/privaite-pii-minilm

## Resumen

PrivAiTe PII MiniLM es un clasificador de tokens multilingüe de pequeño tamaño, desarrollado por el usuario crp4222, cuya función es detectar datos personales (PII, *Personally Identifiable Information*) en texto para poder enmascararlos antes de que salgan de la máquina local. Está diseñado específicamente para PrivAiTe, un proxy local que anonimiza el tráfico hacia modelos de lenguaje, de modo que los prompts enviados a un LLM no contengan información personal sin protección.

El modelo se basa en microsoft/Multilingual-MiniLM-L12-H384 (12 capas, dimensión oculta 384, vocabulario de XLM-R) y tiene 117,5 millones de parámetros, de los cuales unos 96 millones corresponden a la tabla de embeddings multilingüe congelada. Detecta 15 tipos de entidades mediante etiquetado BIO (31 etiquetas), incluyendo personas, datos de contacto, direcciones, identificadores gubernamentales, datos financieros y secretos como contraseñas o claves API.

Su relevancia actual radica en el creciente interés por la privacidad en el uso local de LLM: al pesar poco y estar disponible en PyTorch, ONNX (con cuantización int8) y Core ML para el Apple Neural Engine, permite filtrar PII con latencias de milisegundos en hardware de consumo, compitiendo en precisión con modelos de PII entre 2,5 y 7 veces mayores según los propios datos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM L12 H384), clasificador de tokens con etiquetado BIO |
| Parametros totales | 117.517.855 (117,5 M) |
| Parametros activos | no disponible (no es MoE; 96 M corresponden a la tabla de embeddings congelada) |
| Longitud de contexto | 256 tokens (entrenado y evaluado con ventanas de 256 tokens y solapamiento de 64) |
| Tipos de cuantizacion | fp32 (PyTorch/ONNX), int8 (ONNX), fp16 (Core ML) |
| Idiomas soportados | multilingüe: en, fr, de, es, it, pt, nl, sv, da, fi |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors, ONNX (fp32 e int8), Core ML (mlpackage) |

## Arquitectura y entrenamiento

La arquitectura es un codificador transformer tipo BERT en su variante MiniLM: 12 capas con dimensión oculta de 384 y vocabulario de XLM-R, lo que explica que cerca de 96 de los 117,5 millones de parámetros sean la matriz de embeddings multilingüe (congelada durante el entrenamiento). Sobre el codificador se añade una cabeza de clasificación de tokens con 31 etiquetas en formato BIO, correspondientes a 15 tipos de entidad (PERSON, CONTACT, ADDRESS, LOCATION, ORGANIZATION, DATE, DATE_OF_BIRTH, AGE, DEMOGRAPHIC, GOV_ID, FINANCIAL, NETWORK_ID, RECORD_ID, SECRET y OTHER).

El entrenamiento se realizó sobre una combinación de seis conjuntos de datos públicos especializados en detección de PII: nvidia/Nemotron-PII, ai4privacy/pii-masking-openpii-1m, gretelai/gretel-pii-masking-en-v1, gretelai/synthetic_pii_finance_multilingual, joelniklaus/mapa y MultiCoNER/multiconer_v2. Esta mezcla combina datos sintéticos de enmascaramiento, texto financiero multilingüe y el corpus MultiCoNER de reconocimiento de entidades en contexto complejo. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO (que no aplican a este tipo de tarea). Una innovación destacable es la triple exportación del mismo encoder: PyTorch, ONNX optimizado para CPU y Core ML reescrito con el layout de Apple para el Neural Engine con entrada fija de 256 tokens.

## Capacidades

- Detección de 15 tipos de datos personales en texto mediante token classification con esquema BIO de 31 etiquetas: nombres de persona, correos, teléfonos, URLs, direcciones, ubicaciones, organizaciones, fechas, fechas de nacimiento, edades, datos demográficos, documentos de identidad, datos financieros (IBAN, tarjetas, SWIFT), identificadores de red (IP, MAC) y secretos (contraseñas, PINs, claves API).
- Cobertura multilingüe en diez lenguas: inglés, francés, alemán, español, italiano, portugués, neerlandés, sueco, danés y finés.
- Procesado de textos largos mediante ventanas de 256 tokens con solapamiento de 64 tokens (parámetro `stride=64` en el pipeline de Transformers).
- Despliegue multiplataforma: PyTorch con safetensors, ONNX para CPU (con versión int8 aproximadamente el doble de rápida y cuatro veces más ligera) y Core ML optimizado para el Apple Neural Engine en macOS.
- Integración directa como motor de enmascaramiento en el proxy local PrivAiTe (presets `minilm` y `ultrafast` desde la versión 0.8.0).
- Fusión opcional de tramos adyacentes del mismo tipo (por ejemplo, nombre y apellido) antes del enmascaramiento.
- No es un modelo generativo: no produce texto, no razona, no genera código y no soporta tool calling ni agentes; su única función es la clasificación de tokens.

## Casos de uso

- Enmascaramiento de PII en prompts hacia LLM: el caso de uso principal. Un proxy local como PrivAiTe intercepta el tráfico del usuario, detecta los datos personales con este modelo y los sustituye por marcadores antes de enviar la petición a un LLM externo, reduciendo la exposición de datos sensibles a servicios de terceros.
- Cumplimiento normativo (RGPD) en aplicaciones que procesan texto de usuarios: al identificar nombres, direcciones, identificadores gubernamentales o datos financieros, permite seudonimizar contenido antes de almacenarlo o registrar it en logs, aunque el propio autor advierte que se trata de seudonimización, no anonimización.
- Depuración de logs y telemetría: el modelo puede ejecutarse en CPU con ONNX int8 sobre textos de registro para detectar y eliminar PII antes de que los logs se exporten a sistemas de análisis.
- Filtrado de documentos en flujos de trabajo empresariales: dado que cubre tipos de entidad financieros (IBAN, números de tarjeta, códigos SWIFT) y gubernamentales (DNI, pasaporte, número de la seguridad social), es adecuado para revisar correos, contratos o formularios antes de su compartición.
- Privacidad en dispositivos Apple: la versión Core ML para el Neural Engine permite ejecutar la detección en local en Mac con latencias muy bajas (9 ms por 1.000 caracteres en un M1 Pro), sin enviar nada a la nube.
- Procesamiento multilingüe en entornos europeos: con soporte de diez lenguas europeas, sirve para pipelines de privacidad que reciben texto en varias lenguas con un único modelo.
- Preprocesado para chatbots de atención al cliente: detección de datos de contacto e identificadores de cliente (RECORD_ID) en conversaciones multi-turno antes de que el texto llegue al motor conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable al tratarse de un clasificador de tokens y no de un modelo generativo. La model card del autor afirma que, sobre 9 conjuntos de test no vistos, el modelo iguala o supera en detección de personas al mejor de cinco modelos abiertos de PII (entre 2,5 y 7 veces mayores en disco) en 6 de esos conjuntos, generalmente con mayor precisión, y que la versión int8 de ONNX mantiene la misma precisión dentro de un punto respecto a fp32. No se incluyen las cifras numéricas detalladas de esas evaluaciones en la información proporcionada, por lo que no es posible reproducirlas aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras exactas; el modelo completo en fp32 ocupa aproximadamente 450 MB de pesos (117,5 M de parámetros), por lo que unos 0,5-1 GB de memoria son suficientes. La versión int8 de ONNX es cuatro veces menor y la de Core ML es fp16.
- GPU recomendadas: no requiere GPU; está diseñado para ejecutarse en CPU mediante ONNX Runtime. En macOS puede usar el Apple Neural Engine vía Core ML.
- Consumer GPUs: no es necesario usar GPU dedicada; el caso de uso previsto es local, en portátiles y ordenadores de escritorio convencionales (se documenta rendimiento en un Apple M1 Pro).
- Opciones de despliegue: librería transformers de Hugging Face (pipeline de token-classification), ONNX Runtime (CPU, fp32 o int8), Core ML con coremltools (CPU_AND_NE), e integración nativa en PrivAiTe 0.8.0 o superior (presets `minilm` y `ultrafast`).
- Latencia y throughput: 9 ms por 1.000 caracteres en el Neural Engine de un M1 Pro; 23 ms por 1.000 caracteres en CPU con la versión int8, según datos del autor.

## Comparativa con modelos similares

El autor menciona haber comparado el modelo con cinco modelos abiertos de PII de entre 2,5 y 7 veces su tamaño en disco, pero no los identifica nominalmente en la información disponible. Como referencia de categoría:

| Modelo | Tipo | Tamaño | Idiomas | Licencia |
|---|---|---|---|---|
| crp4222/privaite-pii-minilm | Clasificador de tokens PII (15 tipos) | 117,5 M | 10 lenguas europeas | BSD-3-Clause |
| Microsoft Presidio (con spaCy/transformers) | Framework de detección de PII basado en reglas + NER | variable | multilingüe (según NER subyacente) | MIT |
| ai4privacy modelos de pii-masking-openpii | Clasificadores de tokens PII | variable (no disponible) | multilingüe | no disponible |

La ventaja diferencial declarada es el tamaño reducido y la latencia baja frente a modelos de PII mucho mayores, manteniendo precisión comparable en la mayoría de los conjuntos de test del autor. No se dispone de cifras comparativas numéricas verificables de terceros.

## Limitaciones y advertencias

- El enmascaramiento que realiza es seudonimización, no anonimización: los datos se sustituyen pero el resultado no garantiza anonimato completo, según advierte el propio autor en la model card.
- El modelo omitirá algunos datos personales; no se declara una tasa de recall garantizada y las cifras de evaluación provienen del propio autor con su propio scorer (privaite-bench), no de una evaluación independiente.
- La ventana de contexto es corta (256 tokens), por lo que los textos largos requieren procesamiento por ventanas con solapamiento de 64 tokens; el tokenizador debe configurarse a 256 para reproducir el comportamiento de entrenamiento.
- La versión de Core ML tiene entrada fija de 256 tokens y requiere padding explícito, lo que añade complejidad de integración.
- Los 96 millones de parámetros de embeddings están congelados, lo que limita la adaptación por fine-tuning a la cabeza de clasificación salvo reentrenamiento completo.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse mayoritariamente con datos sintéticos (Gretel, Nemotron-PII) y corpora como MultiCoNER, el rendimiento puede degradarse en dominios o formatos no representados.
- Riesgo de alucinación: no aplicable al tratarse de un clasificador; el riesgo relevante son los falsos negativos (PII no detectada) y falsos positivos (texto legítimo enmascarado).
- Licencia BSD-3-Clause: permite uso comercial, modificación y redistribución con retención del aviso de copyright; no impone restricciones significativas.
- Proyecto de autor individual con muy poca tracción pública (42 descargas, 2 likes en el momento de los datos), sin auditoría externa conocida: conviene validarlo en el dominio propio antes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crp4222/privaite-pii-minilm
- Repositorio del proyecto PrivAiTe: https://github.com/crp4222/PrivAiTe
- Scorer de evaluación privaite-bench: https://github.com/crp4222/privaite-bench
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Conjuntos de datos de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII, https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m, https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1, https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual, https://huggingface.co/datasets/joelniklaus/mapa, https://huggingface.co/datasets/MultiCoNER/multiconer_v2
