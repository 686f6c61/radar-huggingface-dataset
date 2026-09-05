# openai/privacy-filter

## Resumen

OpenAI Privacy Filter es un modelo de clasificación de tokens (token-classification) desarrollado por OpenAI para la detección y el enmascaramiento de información personal identificable (PII) en texto. Está diseñado para flujos de trabajo de sanitización de datos de alto rendimiento, con la posibilidad de ejecutarse en local, de forma rápida, consciente del contexto y ajustable a necesidades específicas. El modelo parte de un checkpoint preentrenado de forma autorregresiva con una arquitectura similar a gpt-oss, aunque de menor tamaño, y se convierte posteriormente en un clasificador bidireccional de tokens sobre una taxonomía de etiquetas de privacidad.

La arquitectura final es un stack tipo transformer encoder con pre-norm, atención grouped-query con posiciones rotatorias y bloques feed-forward de mezcla de expertos (MoE) dispersa. Cuenta con 1.399.486.865 parámetros totales (aproximadamente 1.400 millones) y 50 millones de parámetros activos por token, lo que permite una inferencia eficiente. Su ventana de contexto alcanza los 128.000 tokens, lo que facilita el procesamiento de documentos largos sin necesidad de trocearlos. Se distribuye bajo licencia Apache 2.0, lo que favorece su uso comercial y su personalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-style pre-norm con atención grouped-query, posiciones rotatorias y MoE dispersa |
| Parametros totales | 1.399.486.865 |
| Parametros activos | 50.000.000 |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se entrena en dos fases. Primero se preentrena de forma autorregresiva un checkpoint con una arquitectura similar a gpt-oss, pero de menor escala. A continuación, se sustituye la cabeza de salida del modelo de lenguaje por una cabeza de clasificación de tokens sobre etiquetas de privacidad, y se realiza un post-entrenamiento supervisado con pérdida de clasificación a nivel de token. El resultado es un clasificador bidireccional con atención de banda (banded attention) de tamaño 128, lo que implica una ventana efectiva de atención de 257 tokens incluyendo el propio token.

La arquitectura final consiste en un stack de 8 bloques transformer con pre-norm, embeddings de tokens, atención grouped-query con 14 cabezas de consulta y 2 cabezas de clave/valor (grupo de 7 consultas por cabeza), y bloques feed-forward de mezcla de expertos dispersa con 128 expertos y enrutamiento top-4 por token. La anchura del residual stream es de 640. En lugar de generar texto token a token, el modelo etiqueta toda la secuencia en una única pasada y aplica un procedimiento de decodificación Viterbi restringido para producir etiquetas de span coherentes en formato BIOES (Begin, Inside, Outside, End, Single). No se han publicado datos específicos sobre la composición del dataset de entrenamiento ni sobre procesos de RLHF o DPO.

## Capacidades

- Detección y enmascaramiento de PII en texto, cubriendo 8 categorías: `account_number`, `private_address`, `private_email`, `private_person`, `private_phone`, `private_url`, `private_date` y `secret`.
- Clasificación de tokens en una sola pasada (forward pass) con decodificación Viterbi restringida para obtener spans coherentes.
- Contexto largo de 128.000 tokens, que permite procesar documentos extensos sin trocear.
- Control en tiempo de ejecución de los tradeoffs entre precisión y recall, así como de la longitud de los spans detectados, mediante puntos de operación preestablecidos.
- Tamaño reducido y eficiencia: 1.400 millones de parámetros totales y solo 50 millones activos, lo que permite ejecutarlo en un navegador o en un portátil.
- Fine-tuning eficiente en datos para adaptar el modelo a distribuciones de datos específicas.
- Integración con Transformers (Python), Transformers.js (WebGPU/WebAssembly), ONNX y despliegue en SageMaker.
- No es un modelo generativo: no genera texto, no soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente. Su función es exclusivamente la clasificación de tokens.

## Casos de uso

- Sanitización de logs de aplicaciones: el modelo escanea logs en tiempo real y enmascara correos electrónicos, números de teléfono, direcciones y otros datos personales antes de almacenarlos o enviarlos a sistemas externos. Su ventana de 128.000 tokens permite procesar lotes grandes de logs sin dividirlos.
- Cumplimiento normativo (GDPR, HIPAA): en entornos on-premises, permite detectar PII en documentos, correos electrónicos o bases de datos para aplicar políticas de privacidad. La licencia Apache 2.0 facilita el uso comercial y la integración en sistemas de cumplimiento.
- Filtrado de datos para entrenamiento de modelos: antes de utilizar datos de texto para entrenar modelos de lenguaje, se aplica el filtro para eliminar o enmascarar PII. La alta velocidad de inferencia y el bajo coste computacional (50 millones de parámetros activos) permiten procesar grandes volúmenes de datos.
- Redacción automática en atención al cliente: en conversaciones de soporte, se pueden enmascarar datos personales del usuario (nombre, correo, teléfono) antes de enviar el historial a agentes o a sistemas de análisis, reduciendo el riesgo de exposición.
- Detección de secretos en repositorios de código: la categoría `secret` permite identificar tokens de API, contraseñas o claves en ficheros de configuración y commits, integrándose en pipelines de CI/CD para evitar fugas de credenciales.
- Análisis de documentos legales: en contratos o expedientes, extrae y clasifica entidades como direcciones, fechas, números de cuenta y nombres, para automatizar la revisión de privacidad o la anonimización de documentos.
- Aplicaciones en navegador con Transformers.js: gracias a su tamaño reducido y al soporte de WebGPU, puede ejecutarse en el cliente para redactar datos antes de enviarlos a un servidor, minimizando la exposición de información personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, alrededor de 2,8 GB; en INT8, alrededor de 1,4 GB; con cuantización q4 (Transformers.js), aproximadamente 0,7 GB. Estas cifras son estimaciones basadas en el número de parámetros totales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. No se requieren GPUs de centro de datos como A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de gama media e incluso en CPUs modernas, dado su reducido número de parámetros activos.
- Opciones de despliegue: Transformers (PyTorch), Transformers.js (WebGPU), ONNX Runtime y SageMaker. Al ser un modelo de clasificación, no se utiliza vLLM ni TGI.
- Latencia y throughput estimados: no disponible. No obstante, al realizar una única pasada por la secuencia y activar solo 50 millones de parámetros por token, el coste computacional por token es bajo.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con modelos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser un clasificador de tokens, no genera texto, por lo que no hay alucinación en el sentido generativo. Sin embargo, puede cometer errores de clasificación (falsos positivos y falsos negativos). El modelo permite ajustar el equilibrio entre precisión y recall, lo que indica que estos errores son esperables.
- Limitaciones de contexto o idioma: los idiomas soportados no están especificados. Aunque la ventana de contexto es de 128.000 tokens, la atención de banda limita la ventana efectiva de atención a 257 tokens, lo que puede afectar a la captura de dependencias de muy largo alcance.
- Restricciones de licencia: la licencia Apache 2.0 permite el uso comercial, pero exige mantener el aviso de licencia y no utilizar las marcas registradas de OpenAI.
- Advertencia para producción: el modelo no es un generador de texto y no debe usarse para tareas de generación. La precisión en la detección de PII puede variar según el dominio y el idioma; se recomienda realizar fine-tuning con datos propios para mejorar el rendimiento en casos de uso específicos.

## Enlaces

- HuggingFace: https://huggingface.co/openai/privacy-filter
- Anuncio de OpenAI: https://openai.com/index/introducing-openai-privacy-filter/
- Repositorio de GitHub: https://github.com/openai/privacy-filter
- OpenAI (sitio general): https://openai.com/
