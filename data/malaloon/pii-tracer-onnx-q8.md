# malaloon/PII-Tracer-ONNX-Q8

## Resumen

PII-Tracer-ONNX-Q8 es una exportación a ONNX con cuantización de 8 bits del modelo perplexity-ai/PII-Tracer, desarrollado originalmente por Perplexity AI y publicado por Malaloon Studio. Se trata de un modelo de token-classification especializado en la detección de información personal identificable (PII) en texto, pensado para ejecutarse localmente en el ordenador del usuario dentro de la aplicación privada Efitra, donde se utiliza para localizar y ocultar datos personales antes de enviar una consulta a un modelo en la nube.

El modelo no introduce pesos nuevos: parte de los pesos originales en PyTorch, los exporta a ONNX con opset 18 y aplica cuantización de bloques de 8 bits tanto a las matrices de pesos (`MatMulNBits`) como a la tabla de vocabulario (`GatherBlockQuantized`), con las operaciones en fp32. El resultado reduce el tamaño del artefacto de 2,4 GB a 680 MB manteniendo una calidad prácticamente idéntica al modelo original sobre el conjunto de pruebas del autor.

Su relevancia actual radica en el despliegue de pipelines de privacidad en local: al ser un modelo ONNX cuantizado, puede ejecutarse en CPU con ONNX Runtime sin GPU dedicada, lo que lo hace adecuado como capa de redacción de PII en aplicaciones de escritorio, gateways de LLM y flujos de cumplimiento normativo. La arquitectura subyacente, el número de parámetros y la longitud de contexto del modelo base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de token-classification; exportado a ONNX opset 18) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en bloques de 32 (`MatMulNBits`) para pesos; 8 bits (`GatherBlockQuantized`) para la tabla de vocabulario; operaciones en fp32 |
| Idiomas soportados | no disponible como lista oficial; el conjunto de pruebas del autor incluye textos en inglés, francés y español |
| Licencia | MIT (copyright 2026 Perplexity AI, Inc.) |
| Formato de pesos | ONNX (`pii_tracer.onnx` + `pii_tracer.onnx.data`) y `tokenizer.json` |
| Tamano del repositorio | 0,7 GB (artefacto reducido desde 2,4 GB) |
| Pipeline | token-classification |
| Libreria | ONNX Runtime (probado con la version 1.31 en CPU) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base perplexity-ai/PII-Tracer ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). Lo que sí documenta la model card es el proceso de conversión: exportación de PyTorch a ONNX con opset 18, verificación de equivalencia numérica con el modelo fp32 original sobre 103 textos de prueba, y cuantización posterior de los pesos y de la tabla de vocabulario a 8 bits en bloques de 32, manteniendo los cálculos en fp32.

La innovación técnica destacable es la cuantización de la tabla de vocabulario mediante `GatherBlockQuantized`, que junto con `MatMulNBits` permite pasar de 2,4 GB a 680 MB sin pérdida apreciable de calidad. El tokenizador es idéntico al del modelo original (mismo SHA-256). El autor publica los hashes SHA-256 de los tres ficheros para verificación de integridad.

## Capacidades

- Detección y etiquetado de información personal identificable (PII) a nivel de token (token-classification).
- Redacción o enmascaramiento de datos personales en texto antes de su envío a servicios externos.
- Procesamiento multilingüe verificado en inglés, francés y español en el conjunto de pruebas del autor.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Integración como componente de preprocesado en pipelines de privacidad (por ejemplo, antes de una llamada a un LLM en la nube).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling ni modo de pensamiento; es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Redacción de PII antes de consultas a LLM en la nube: el modelo identifica nombres, direcciones, importes y otros datos personales en la consulta del usuario y permite enmascararlos antes de enviarla a un proveedor externo, tal como hace Efitra en su modo privado.
- Gateways de privacidad para APIs de terceros: se puede intercalar en un proxy que intercepte peticiones salientes y sustituya entidades PII por marcadores, reduciendo la exposición de datos en integraciones con servicios cloud.
- Cumplimiento de RGPD en aplicaciones de escritorio: integrado en herramientas locales, permite auditar y anonimizar textos antes de almacenarlos o compartirlos, sin depender de servicios externos.
- Anonimización de logs y trazas: procesar en lote registros de aplicaciones para eliminar datos personales antes de enviarlos a sistemas de observabilidad o almacenamiento a largo plazo.
- Preprocesado en pipelines de datos para entrenamiento: filtrar o enmascarar PII en corpus antes de usarlos en fine-tuning o análisis, reduciendo riesgos legales.
- Procesamiento de documentos multilingües en local: al funcionar en CPU con ONNX Runtime, es adecuado para redactar correos, formularios o notas en inglés, francés y español en equipos sin GPU.
- Capa de privacidad en asistentes de escritorio: integración en aplicaciones de productividad que necesitan detectar datos sensibles en el texto del usuario antes de cualquier operación externa.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor sí documenta una evaluación de calidad sobre 103 textos de prueba en inglés, francés y español, comparando la versión ONNX Q8 con el modelo fp32 original:

| Metrica | Resultado |
|---|---|
| Textos de prueba | 103 (ingles, frances, espanol) |
| Salidas identicas al fp32 | 99 de 103 |
| PII no detectada | 0 casos |
| Diferencias observadas | 3 detecciones extra (un numero tipo codigo postal, una palabra medica y un importe) y 1 deteccion perdida (la palabra "francaise") |
| Equivalencia fp32 ONNX vs PyTorch fp32 | identica en los 103 textos |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- Tamaño en disco: 680 MB para los artefactos ONNX cuantizados (frente a 2,4 GB del fp32).
- GPU recomendadas: no aplica; no se documentan requisitos de GPU. Cualquier GPU compatible con ONNX Runtime podría usarse, pero no se especifican modelos.
- CPU: no se especifican requisitos mínimos; el autor probó con ONNX Runtime 1.31 en CPU.
- Despliegue: ONNX Runtime (probado en versión 1.31). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de token-classification en formato ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base más allá de su licencia y su tarea, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. Como referencia cualitativa:

| Modelo | Tarea | Formato | Licencia | Contexto | Parametros |
|---|---|---|---|---|---|
| malaloon/PII-Tracer-ONNX-Q8 | Deteccion de PII (token-classification) | ONNX 8 bits | MIT | no disponible | no disponible |
| perplexity-ai/PII-Tracer | Deteccion de PII (token-classification) | PyTorch (fp32) | MIT | no disponible | no disponible |
| Alternativas de deteccion de PII | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo original: misma calidad sobre el conjunto de pruebas del autor, con una reducción de tamaño de 2,4 GB a 680 MB y ejecución en CPU.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda los sesgos y limitaciones del modelo base perplexity-ai/PII-Tracer, que no se documentan en la información disponible.
- Riesgo de falsos negativos y falsos positivos: en la evaluación del autor se produjeron 3 detecciones extra y 1 detección perdida sobre 103 textos; en producción esto puede implicar tanto el enmascaramiento de datos no sensibles como la fuga de PII no detectada.
- Cobertura lingüística limitada verificada: solo se han probado textos en inglés, francés y español; no hay lista oficial de idiomas soportados.
- Conjunto de evaluación reducido: 103 textos es una muestra pequeña, por lo que la calidad en dominios específicos (textos legales, médicos, técnicos) no está caracterizada.
- Dependencia de ONNX Runtime: el autor solo documenta pruebas con la versión 1.31 en CPU; el comportamiento en otras versiones o backends no está verificado.
- Licencia MIT: permite uso comercial y modificación, pero requiere mantener el aviso de copyright de Perplexity AI, Inc.
- No apto para generación de texto ni para tareas distintas de la clasificación de tokens.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malaloon/PII-Tracer-ONNX-Q8
- Modelo base: https://huggingface.co/perplexity-ai/PII-Tracer
