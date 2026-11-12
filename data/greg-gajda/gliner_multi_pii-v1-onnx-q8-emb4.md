# greg-gajda/gliner_multi_pii-v1-onnx-q8-emb4

## Resumen

`greg-gajda/gliner_multi_pii-v1-onnx-q8-emb4` es una conversión a ONNX del modelo `urchade/gliner_multi_pii-v1`, un modelo de reconocimiento de entidades nombradas (NER) especializado en detección de información personal identificable (PII). El autor de esta variante es greg-gajda, que publica una versión cuantizada en formato ONNX con cuantización de 8 bits y embeddings reducidos a 4 dimensiones (según indica el sufijo `q8-emb4` del identificador).

El modelo subyacente, desarrollado por Urchade Zaratiana, pertenece a la familia GLiNER (Generalist and Lightweight Named Entity Recognition), una arquitectura que permite detectar entidades de tipos arbitrarios especificados en tiempo de inferencia mediante prompts de texto, sin necesidad de reentrenar el modelo para cada esquema de etiquetas. La especialización en PII lo hace relevante para pipelines de anonimización y cumplimiento normativo (RGPD), donde es necesario detectar nombres, direcciones, documentos de identidad y otros datos sensibles.

Esta variante concreta está orientada a despliegue eficiente en CPU o entornos con recursos limitados gracias al formato ONNX y a la cuantización. La información pública disponible es mínima: la model card únicamente declara licencia Apache 2.0, idioma polaco (`pl`) y el modelo base, sin detallar parámetros, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLiNER, encoder tipo transformer para NER zero-shot; detalles no especificados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX con cuantizacion de 8 bits (sufijo `q8`); reduccion de embeddings a 4 dimensiones (sufijo `emb4`), segun el identificador del modelo |
| Idiomas soportados | polaco (`pl`) declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la informacion proporcionada. El modelo base `urchade/gliner_multi_pii-v1` pertenece a la familia GLiNER, que emplea un encoder transformer bidireccional para proyectar tanto el texto de entrada como las etiquetas de entidad en un espacio comun, permitiendo la deteccion de entidades de tipos arbitrarios definidos en inferencia. Esta variante concreta es una conversion a ONNX con cuantizacion de 8 bits y embeddings reducidos, presumiblemente orientada a reducir el tamano del modelo y acelerar la inferencia en CPU.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia conversion ONNX y la cuantizacion.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: permite definir los tipos de entidad en tiempo de inferencia mediante prompts de texto.
- Deteccion de informacion personal identificable (PII): especializacion del modelo base en categorias como nombres, direcciones, identificadores y otros datos sensibles.
- Inferencia optimizada: el formato ONNX con cuantizacion de 8 bits facilita el despliegue en CPU y en entornos con recursos limitados.
- Soporte multilingue: el modelo base es multilingue, aunque esta variante declara unicamente el polaco como idioma.
- No se documentan en la informacion disponible capacidades de generacion de texto, tool calling, agentes, vision ni audio, coherentes con la naturaleza discriminativa de un modelo NER.

## Casos de uso

- Anonimizacion de documentos en polaco: el modelo puede detectar entidades PII en textos antes de almacenarlos o compartirlos, apoyando el cumplimiento del RGPD en organizaciones que procesan documentacion en polaco.
- Pipeline de redaccion de datos en logs: integrado como paso previo al almacenamiento de logs de aplicaciones, permite enmascarar nombres, correos y direcciones detectados en texto libre.
- Preprocesado para modelos de lenguaje: actuar como filtro de PII antes de enviar datos a APIs de terceros o a modelos generativos, reduciendo el riesgo de fuga de informacion sensible.
- Procesamiento por lotes en CPU: gracias al formato ONNX cuantizado, puede ejecutarse en servidores sin GPU para clasificar grandes volumenes de documentos de forma economica.
- Enriquecimiento de bases de datos: extraccion de entidades de tipo definido por el usuario (por ejemplo, identificadores fiscales) para poblar campos estructurados a partir de texto no estructurado.
- Despliegue en el borde (edge): el modelo cuantizado y en ONNX puede integrarse en aplicaciones locales o dispositivos con recursos limitados donde no es viable ejecutar un transformer completo en FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX cuantizado a 8 bits, se espera que pueda ejecutarse en CPU sin GPU dedicada, aunque no se especifica el consumo exacto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecucion en CPU, lo que reduce la dependencia de GPU.
- Opciones de despliegue: ONNX Runtime es la opcion natural dado el formato de los pesos; no se documentan otras integraciones (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `greg-gajda/gliner_multi_pii-v1-onnx-q8-emb4` | no disponible | no disponible | pl | Apache 2.0 | ONNX |
| `urchade/gliner_multi_pii-v1` (modelo base) | no disponible | no disponible | multilingue | no disponible en esta ficha | no disponible en esta ficha |
| Otros modelos NER especializados en PII | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de equidad; se desconoce el comportamiento del modelo en subgrupos demograficos o dominios especificos.
- Riesgo de alucinacion o falsos positivos/negativos en la deteccion de entidades: al ser un modelo NER, puede omitir entidades PII o marcar entidades incorrectamente, lo que en un contexto de cumplimiento normativo exige validacion humana o capas adicionales.
- El idioma declarado es unicamente el polaco; el rendimiento en otros idiomas no esta garantizado por esta variante, aunque el modelo base sea multilingue.
- La cuantizacion a 8 bits y la reduccion de embeddings pueden degradar la precision respecto al modelo base en FP32; no se han publicado evaluaciones que cuantifiquen esta perdida.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento originales antes de un despliegue en produccion.
- No se documentan limitaciones de longitud de contexto; se desconoce el maximo de tokens procesables.
- El artefacto tiene cero descargas y cero likes en el momento de la consulta, y no cuenta con pipeline declarado en Hugging Face, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/greg-gajda/gliner_multi_pii-v1-onnx-q8-emb4)
- [Modelo base: urchade/gliner_multi_pii-v1](https://huggingface.co/urchade/gliner_multi_pii-v1)
