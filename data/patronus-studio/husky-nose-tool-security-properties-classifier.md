# patronus-studio/husky-nose-tool-security-properties-classifier

## Resumen

Husky Nose es un clasificador multilingüe basado en ModernBERT (mmBERT-small) desarrollado por Patronus Studio como parte de su stack de seguridad Patronus Protect. Su función es identificar las propiedades de flujo de datos relevantes para la seguridad en herramientas y operaciones de agentes de IA: si una herramienta puede acceder a datos sensibles, ingerir datos no confiables o transmitir datos a un destino externo. A diferencia de un clasificador de tres clases convencional, Husky Nose realiza clasificación multi-etiqueta, de modo que varias propiedades pueden aplicarse simultáneamente a una misma entrada.

El modelo pertenece a la familia Husky de análisis de herramientas, junto con Husky Sight (tipo de herramienta) y Husky Paw (operación). Es la contraparte de cabeza única del clasificador Lion Warden. Con 140 millones de parámetros y una arquitectura encoder, está diseñado para integrarse en pipelines de seguridad en tiempo real, ofreciendo señales para políticas de agentes, enrutamiento de riesgo y prevención de pérdida de datos. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en el crecimiento de agentes de IA que invocan herramientas externas, donde la capacidad de evaluar automáticamente si una operación cruza límites de confianza es crítica para prevenir fugas de datos y ataques de inyección de prompts. Husky Nose cubre este hueco con un modelo ligero y específico, entrenado con datos propietarios de Patronus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small), encoder transformer |
| Parametros totales | 140.642.691 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (safetensors), FP16 (ONNX) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Husky Nose se basa en mmBERT-small, una variante de ModernBERT optimizada para multilingüismo. Es un transformer encoder de 140 millones de parámetros que produce tres salidas independientes con activación sigmoide, entrenado con binary cross-entropy with logits. Cada salida corresponde a una propiedad de seguridad: `source:sensitive`, `source:untrusted` y `sink:external`. El entrenamiento se realizó sobre un dataset interno de Patronus con descripciones de herramientas, peticiones de usuario y operaciones serializadas, etiquetadas con tres objetivos binarios independientes. No se menciona el uso de RLHF ni DPO; el enfoque es supervisado clásico.

La innovación principal no está en la arquitectura (que sigue el estándar de encoder), sino en la formulación multi-etiqueta para seguridad de agentes. El modelo no genera texto, sino que clasifica entradas textuales (descripciones de herramientas, llamadas serializadas) en un espacio de tres etiquetas independientes. Se proporcionan también variantes ONNX FP16 y, en un repositorio separado, versiones cuantizadas para edge (int8, int8_int4_embeddings).

## Capacidades

- Clasificacion multi-etiqueta de propiedades de flujo de datos en herramientas de agentes: acceso a datos sensibles, ingesta de datos no confiables y transmision a destinos externos.
- Deteccion de operaciones que combinan varias propiedades, por ejemplo leer un archivo interno y enviarlo a un endpoint remoto (`source:sensitive` + `sink:external`).
- Soporte multilingue para aleman e ingles, con evaluacion principal en estos dos idiomas.
- Salida de probabilidades independientes por etiqueta, lo que permite ajustar umbrales por propiedad segun el caso de uso.
- Integracion con pipelines de seguridad: puede usarse como señal para politicas de agentes, enrutamiento de riesgo, flujos de aprobacion y monitoreo en runtime.
- Compatible con el ecosistema Hugging Face Transformers y con ONNX Runtime para despliegue ligero.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su funcion es estrictamente clasificatoria.

## Casos de uso

- Politicas de agentes de IA: antes de ejecutar una llamada a herramienta, el modelo clasifica la operacion y bloquea o requiere aprobacion si detecta `sink:external` o `source:sensitive`, evitando fugas de datos no autorizadas.
- Enrutamiento de riesgo en sistemas MCP: las herramientas expuestas via Model Context Protocol pueden clasificarse dinamicamente segun sus propiedades, permitiendo asignar diferentes niveles de confianza o entornos de ejecucion.
- Flujos de aprobacion en entornos empresariales: cuando un agente solicita acceso a una base de datos interna o envio a un API externo, Husky Nose genera una senal que dispara un proceso de doble verificacion humana.
- Prevencion de perdida de datos (DLP): integrado en un proxy de red, el modelo analiza las operaciones serializadas de agentes y emite alertas cuando se combinan `source:sensitive` con `sink:external`, indicando posible exfiltracion.
- Monitoreo de seguridad en runtime: en produccion, cada llamada a herramienta se clasifica en tiempo real para detectar desviaciones respecto al comportamiento esperado, alimentando dashboards de seguridad.
- Analisis estatico de herramientas: durante el desarrollo de un agente, se pueden analizar las descripciones de todas las herramientas registradas para generar un inventario de riesgos antes del despliegue.
- Filtrado de entradas no confiables: cuando un agente procesa contenido web o respuestas remotas, el modelo marca `source:untrusted`, permitiendo aplicar politicas de saneamiento o aislamiento.

## Benchmarks y rendimiento

Resultados sobre conjunto de test retenido (n = 2.914), clasificacion multi-etiqueta:

| Metrica | Puntuacion |
|---|---|
| F1 (macro) | 0.965 |
| Precision (macro) | 0.966 |
| Recall (macro) | 0.963 |

Desglose por propiedad:

| Propiedad | Precision | Recall | F1 |
|---|---|---|---|
| source:sensitive | 0.977 | 0.971 | 0.974 |
| source:untrusted | 0.968 | 0.969 | 0.969 |
| sink:external | 0.951 | 0.950 | 0.950 |

No se han publicado comparaciones con otros clasificadores de seguridad de herramientas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 562 MB (140 M parametros × 4 bytes); en FP16, unos 281 MB. Con overhead de activaciones y tokenizador, la VRAM necesaria en FP16 ronda los 1-2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente para FP16. Para FP32 se recomienda 4 GB. Tambien puede ejecutarse en CPU con razonable latencia dado su tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluso en integradas con suficiente RAM compartida.
- Opciones de despliegue: Transformers (Python), ONNX Runtime via Optimum, y el repositorio edge ofrece versiones cuantizadas para entornos con restricciones de memoria. No se menciona soporte explicito para vLLM, TGI u Ollama, aunque al ser un encoder clasico podria adaptarse.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 140 M parametros en FP16 sobre GPU consumer, se espera una latencia por inferencia de pocos milisegundos y throughput de cientos de peticiones por segundo en batch.

## Comparativa con modelos similares

No se dispone de informacion publicada sobre modelos directamente comparables en la misma categoria (clasificacion de propiedades de seguridad de herramientas de agentes). La familia Husky (Sight, Paw, Nose) cubre aspectos complementarios, pero no son alternativas sino modulos del mismo sistema. Se indica "no disponible" para una comparativa externa.

## Limitaciones y advertencias

- Una prediccion positiva describe una capacidad aparente, no prueba que la accion se haya ejecutado realmente.
- `source:sensitive` no confirma que se accediera o devolviera informacion sensible; solo indica que la herramienta puede hacerlo.
- `source:untrusted` no implica que la entrada sea maliciosa ni que contenga inyeccion de prompts.
- `sink:external` senala un posible destino externo, no una exfiltracion confirmada.
- Herramientas genericas (shell, navegador, cliente HTTP, base de datos) pueden resultar ambiguas sin sus argumentos concretos.
- El modelo no rastrea el flujo de informacion a traves de multiples pasos de un agente; cada operacion se evalua de forma aislada.
- Solo se han validado activamente aleman e ingles; otros idiomas pueden producir resultados menos fiables.
- Existen falsos positivos y negativos. Para enforcement de alto impacto se recomienda combinar el modelo con politicas deterministicas y umbrales calibrados por propiedad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantias de exactitud ni soporte oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/patronus-studio/husky-nose-tool-security-properties-classifier
- Repositorio edge (cuantizaciones): https://huggingface.co/patronus-studio/husky-nose-tool-security-properties-classifier-edge
- Blog de Patronus sobre el zoo de modelos: https://patronus.studio/posts/our-ai-security-model-zoo-is-now-open-source
- Repositorio GitHub de Patronus Protect: https://github.com/patronus-protect/patronus-security/blob/main/docs/assets.md
