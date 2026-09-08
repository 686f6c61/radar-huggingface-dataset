# redmadrobot-rnd/rubert-base-pii-ner

## Resumen

El modelo `redmadrobot-rnd/rubert-base-pii-ner` es un clasificador de tokens especializado en la detección de datos personales (PII) en texto ruso. Ha sido desarrollado por el equipo de investigación y desarrollo de Red Mad Robot y se presenta como el componente NER del pipeline de anonimización `pii-guard`. Su objetivo es identificar de forma automática nombres, direcciones, contactos y números de documentos de identidad rusos, facilitando tareas de privacidad, guardrails y cumplimiento normativo.

Se trata de un fine-tune del modelo `ai-forever/ruBert-base`, una arquitectura BERT (encoder-only transformer) preentrenada para ruso. El modelo tiene 177.749.803 parámetros totales y una longitud de contexto de 512 tokens. Su cabeza de clasificación maneja 21 tipos de entidades y un esquema BIO con 43 etiquetas. El entrenamiento se realizó sobre 17.137 frases rusas anotadas, con 39.687 spans de entidades, incluyendo logs de producción pseudonimizados, textos sintéticos de documentos y negativos duros.

La relevancia actual de este modelo radica en la necesidad creciente de proteger datos personales en sistemas automatizados, especialmente en pipelines de datos, aplicaciones de atención al cliente y procesos de preparación de datasets para modelos de lenguaje. Al estar publicado bajo licencia Apache 2.0 y ofrecer resultados sólidos en el benchmark propio de la organización, se presenta como una opción práctica para entornos que manejan texto ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 177.749.803 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ai-forever/ruBert-base`, un transformer encoder-only preentrenado en ruso, y añade una cabeza de clasificación de tokens con 43 etiquetas BIO (`B-<TYPE>`, `I-<TYPE>` y `O`) para 21 tipos de entidades. No incorpora innovaciones arquitectónicas destacables; es un fine-tune estándar con una capa de clasificación lineal sobre las representaciones del último token.

El entrenamiento se llevó a cabo sobre el dataset `redmadrobot-rnd/pii_train`, compuesto por 17.137 frases rusas con 39.687 spans anotados. Los datos incluyen logs de producción verificados manualmente y pseudonimizados, textos sintéticos que imitan documentos rusos y negativos duros (cadenas numéricas que parecen identificadores pero no lo son). Se eliminaron del conjunto de entrenamiento las filas presentes en `pii_benchmark` para garantizar una evaluación limpia. Los hiperparámetros declarados son: 10 épocas, tasa de aprendizaje 3e-5 con decaimiento lineal sin warmup, batch size 16, AdamW con weight decay 0.01, fp32, longitud máxima de secuencia 512 y semilla 42.

## Capacidades

- Detección de entidades de PII en texto ruso: nombres, direcciones, contactos y documentos de identidad.
- Reconocimiento de 21 tipos de entidades, incluyendo `FIRST_NAME`, `LAST_NAME`, `MIDDLE_NAME`, `COUNTRY`, `REGION`, `DISTRICT`, `CITY`, `STREET`, `HOUSE`, `EMAIL`, `PHONE`, `URL`, `IP_ADDRESS`, `PASSPORT`, `INN`, `SNILS`, `OMS`, `CREDIT_CARD`, `DRIVER_LICENSE`, `MILITARY_ID` y `BIRTH_CERTIFICATE`.
- Soporte para el esquema de etiquetado BIO con 43 etiquetas, lo que permite detectar entidades con múltiples tokens.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de clasificación de tokens, no un modelo de chat ni de agentes.
- Capacidad multilingüe limitada al ruso; no está entrenado para otros idiomas.
- Como capacidad especial, está diseñado para integrarse en el pipeline `pii-guard`, que añade reglas, filtrado por confianza, ventanas deslizantes sobre textos largos y fusión de fragmentos adyacentes.

## Casos de uso

- Anonimización de logs de producción: el modelo identifica nombres, teléfonos, correos y números de documento en registros de aplicaciones, permitiendo enmascarar PII antes de enviar datos a sistemas externos o a modelos de lenguaje.
- Enmascaramiento de documentos administrativos: en procesos de digitalización de expedientes rusos, el modelo localiza números de pasaporte, SNILS, INN, OMS, licencias de conducir, IDs militares y certificados de nacimiento para su redacción automática.
- Guardrails en pipelines de datos: se puede colocar como etapa previa en flujos de ingesta de datos para detectar y bloquear o etiquetar registros que contengan PII, reduciendo el riesgo de fugas de información.
- Auditoría de datasets: al preparar conjuntos de datos para entrenamiento de LLMs, el modelo permite escanear textos y señalar posibles datos personales antes de publicarlos o usarlos.
- Preprocesamiento para LLMs: extraer y reemplazar PII en conversaciones o documentos antes de enviarlos a un modelo generativo, evitando que la información sensible se incorpore a respuestas o se almacene.
- Extracción de datos de contacto: en sistemas de gestión de clientes, el modelo extrae correos electrónicos, teléfonos, URLs y direcciones IP de textos libres, facilitando la normalización y validación de registros.

## Benchmarks y rendimiento

Los resultados declarados por el autor sobre el dataset `redmadrobot-rnd/pii_benchmark` (2.841 frases reservadas) son los siguientes:

| Metrica | Valor |
|---|---|
| Precision (14 categorias, exact match) | 81.9 |
| Recall (14 categorias, exact match) | 85.5 |
| F1 (14 categorias, exact match) | 83.6 |
| F1 (PERSON + LOCATION, overlap match — protocolo del leaderboard) | 94.7 |

La model card también compara el modelo aislado con el pipeline completo `pii-guard` (reglas + modelo) sobre las 14 categorías compartidas, en matching exacto:

| Sistema | Precision | Recall | F1 |
|---|---|---|---|
| Este modelo aislado | 81.9 | 85.5 | 83.6 |
| Pipeline `pii-guard` (reglas + modelo) | 90.4 | 87.5 | 88.9 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de NER y no de un modelo de lenguaje de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 0,7 GB (177,7 M parámetros × 4 bytes). Con activaciones para secuencias de 512 tokens y batch pequeño, se recomienda un mínimo de 2 GB de VRAM.
- GPU recomendadas: cualquier tarjeta con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3050 o superiores. En GPU de mayor capacidad como A100 o H100 el modelo es trivial de ejecutar.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPU de consumo de gama baja y media.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime, TorchServe o FastAPI. No es adecuado para `llama.cpp` ni `Ollama`, ya que no es un modelo de lenguaje generativo. `vLLM` no es necesario, aunque puede servir como servidor para modelos BERT.
- Latencia y throughput: no disponible en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada. El modelo base `ai-forever/ruBert-base` comparte la arquitectura y el número de parámetros, pero no está especializado en NER de PII, por lo que no constituye una alternativa directa para esta tarea.

## Limitaciones y advertencias

- El modelo solo soporta texto en ruso; no ofrece capacidades para otros idiomas.
- La longitud de contexto está limitada a 512 tokens. Para textos más largos es responsabilidad del llamador aplicar ventanas deslizantes (el pipeline `pii-guard` usa `max_length=512` y `stride=128`).
- Punto débil conocido: la detección de direcciones IP (`IP_ADDRESS`) presenta un F1 de 36,0 en matching exacto, ya que el modelo tiende a dividir la entidad en los puntos. En `pii-guard` esta categoría se cubre con una regla regex.
- El modelo no dispone de cabeza para los tipos `DATE_TIME`, `BANK_ACCOUNT`, `BIK` y `TELEGRAM`, que sí están cubiertos por el pipeline completo.
- Las etiquetas de persona se emiten por separado (`FIRST_NAME`, `LAST_NAME`, `MIDDLE_NAME`). Para obtener una entidad `PERSON` consolidada es necesario fusionar fragmentos adyacentes, tarea que no realiza el modelo por sí solo.
- La evaluación se basa en un benchmark propio y no ha sido verificada de forma externa. Los resultados deben interpretarse con cautela al comparar con otros modelos.
- La licencia Apache 2.0 permite uso comercial, pero no garantiza el cumplimiento de normativas de protección de datos como el RGPD. La implementación del proceso de anonimización debe validarse en cada caso.
- No es un modelo generativo: no puede producir texto ni razonar. Su uso se limita a la clasificación de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redmadrobot-rnd/rubert-base-pii-ner
- Dataset de entrenamiento: https://huggingface.co/datasets/redmadrobot-rnd/pii_train
- Dataset de evaluación: https://huggingface.co/datasets/redmadrobot-rnd/pii_benchmark
- Repositorio del pipeline `pii-guard`: https://github.com/redmadrobot-rnd/pii-guard
