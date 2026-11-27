# slopdam/chatter-tagger

## Resumen

`slopdam/chatter-tagger` es un modelo de clasificación de tokens (token classification) construido mediante fine-tuning de `distilbert-base-multilingual-cased`. Lo desarrolla el proyecto slopdam y resuelve un problema muy acotado: eliminar las aperturas conversacionales ("Great news!", "Heads up:", "좋은 소식입니다!") que los asistentes de IA anteponen a mensajes de log y consola, en inglés y coreano. No genera texto: asigna a cada subpalabra una etiqueta KEEP, DELETE o UPPER, de modo que el modelo solo puede borrar palabras o capitalizar la siguiente.

El modelo no funciona de forma aislada. Está diseñado para aplicarse después de las reglas deterministas de slopdam (`clean` con perfil `reader`), que ya normalizan guiones, emoji y Markdown. La justificación es que las aperturas conversacionales son demasiado variadas para una lista de palabras, pero lo bastante acotadas como para que un clasificador pequeño (134,7 millones de parámetros) las detecte con precisión. Toda eliminación propuesta pasa además por una guarda fija (`chatter.py`) que descarta borrados que afecten a números, rutas, nombres de fichero, pares `key=value` o mezclas de latino y hangul.

Es relevante para equipos que procesan logs generados o reescritos por LLM y necesitan limpiarlos de forma determinista y auditable antes de indexarlos, mostrarlos o analizarlos. Su tamaño reducido, licencia Apache-2.0 y enfoque conservador (ante la duda, conserva la línea) lo hacen apto para ejecutarse en local dentro de pipelines de preprocesado de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 134.736.387 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de distilbert-base-multilingual-cased; la model card no la declara) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es `distilbert-base-multilingual-cased`, un encoder Transformer destilado de BERT, preentrenado sobre Wikipedia en 104 idiomas y con licencia Apache-2.0. Sobre esa base se aplica una cabeza de clasificacion de tokens con tres etiquetas: KEEP, DELETE y UPPER. El modelo nunca escribe texto nuevo; solo puede marcar palabras para borrar y capitalizar la palabra siguiente, lo que restringe el espacio de salidas posibles y reduce el riesgo de alterar contenido.

El ajuste fino se realizo sobre 89.166 filas del split `train` del dataset `slopdam/log-slop`, excluyendo las filas con adverbios de relleno (que slopdam gestiona con lista de palabras). Las etiquetas se derivan de los campos `reader` y `target`. Se entrenaron 3 epocas con AdamW, learning rate 5e-5 con schedule one-cycle, batch de 32, en una GPU Apple M-series durante 50 minutos. El codigo de entrenamiento e inferencia esta en `hf/model/finetune.py` y `hf/model/chatter.py` del repositorio slopdam. La innovacion principal no es arquitectonica sino de diseno: un modelo minimo acoplado a una guarda determinista que veta cualquier borrado que no sea un bloque de palabras completas al inicio de linea (tras marcador de lista o encabezado), terminado en puntuacion o conector coreano, que deje algo detras y que no contenga digitos, rutas, nombres de fichero, `key=value` ni mezcla de latino y hangul.

## Capacidades

- Etiquetado de tokens para clasificar cada subpalabra como KEEP, DELETE o UPPER.
- Eliminacion de aperturas conversacionales en ingles y coreano en lineas de log.
- Capitalizacion de la palabra siguiente a una apertura eliminada (etiqueta UPPER).
- Integracion con las reglas deterministas de slopdam mediante el modulo `chatter.py`.
- Guarda de seguridad que conserva la linea intacta si el borrado propuesto no cumple las condiciones fijas.
- No genera texto libre; la salida es siempre un subconjunto de las palabras de entrada, con posibles cambios de capitalizacion.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta vision ni audio.
- No es un detector de texto generado por IA.

## Casos de uso

- Limpieza de logs en pipelines de observabilidad: antes de indexar lineas en Elasticsearch, Loki o similar, aplicar `clean` de slopdam y despues este tagger para eliminar aperturas como "Great news!" o "Heads up:" y dejar solo el contenido util, manteniendo intactos numeros de pod, rutas y pares `key=value`.
- Normalizacion de mensajes de consola en CI/CD: procesar la salida de herramientas que han sido reescritas por asistentes de IA para que los mensajes vuelvan a un formato estable y comparable entre ejecuciones, lo que facilita el diff y la deteccion de regresiones.
- Preprocesado de datasets de logs para entrenamiento o evaluacion: limpiar corpus sinteticos o reales de aperturas conversacionales antes de usarlos como datos de entrada, reduciendo ruido en tareas posteriores de clasificacion o agrupamiento.
- Limpieza de mensajes de error en aplicaciones bilingues ingles-coreano: el soporte de ambos idiomas permite aplicar el mismo paso de preprocesado a bases de codigo con equipos mixtos sin mantener dos pipelines distintos.
- Filtrado previo a la visualizacion en paneles de monitorizacion: eliminar el tono conversacional de alertas generadas por agentes para que el operador vea solo el evento tecnico, con la garantia de que la guarda no borrara identificadores ni rutas.
- Auditoria y cumplimiento de formato de logs: al ser determinista en la guarda y no generar texto, el resultado es reproducible y auditable, lo que encaja en entornos donde se exige trazabilidad de las transformaciones aplicadas a los mensajes.
- Extraccion de la parte tecnica de mensajes para sistemas de alertas: al conservar siempre digitos, rutas y `key=value`, el tagger permite limpiar el prefijo conversacional sin perder la informacion accionable de la alerta.

## Benchmarks y rendimiento

| Metrica | Resultado | Umbral de release |
|---|---:|---:|
| `test`: aperturas no vistas eliminadas (exact match) | 94,4% (422 de 447) | 90% |
| `test`: ingles / coreano | 98,7% / 89,9% | no disponible |
| `test`: otras lineas sin cambios | 100% (4.050) | 99,5% |
| `test`: negativos dificiles sin cambios | 100% (1.009) | 100% |
| Set manuscrito 3: lineas de contenido sin cambios | 20 de 20 | 20 de 20 |
| Set manuscrito 3: aperturas eliminadas | 21 de 24 | 18 de 24 |
| Set manuscrito 2: lineas de contenido sin cambios | 20 de 20 | no disponible |
| Set manuscrito 2: aperturas eliminadas | 17 de 24 | no disponible |

Los conjuntos manuscritos constan de 44 lineas cada uno, escritas a mano con palabras que no aparecen en las listas del generador. El set 3 se redacto a ciegas como puerta de release antes de la cuarta ronda de entrenamiento. Tras esa ronda se anadieron dos reglas de guarda (sin terminacion `-서` y sin mezcla de latino y hangul en un mismo borrado) porque tres lineas de test como `orders에서 테스트 6458개 실패` perdian su primera palabra; las cifras anteriores incluyen ese cambio. Un modelo de caracteres anterior entrenado desde cero, evaluado sobre una version previa del split de test, elimino el 55% de las reescrituras y modifico el 4% de las lineas que debia dejar intactas; no se ha publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-0,6 GB en fp32 para los 134,7 millones de parametros; aproximadamente 0,15-0,2 GB en int8 y menos de 0,15 GB en int4.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Cabe en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y tambien en CPU para lotes pequenos.
- Opciones de despliegue: transformers con PyTorch (via `chatter.ChatterTagger`), y en general cualquier runtime compatible con modelos de clasificacion de tokens de transformers (por ejemplo, ONNX Runtime tras exportacion). No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento completo (3 epocas sobre 89.166 filas, batch 32) tardo 50 minutos en una GPU Apple M-series, lo que da una idea del orden de magnitud del coste de computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|---|---|
| slopdam/chatter-tagger | 134,7 M | no disponible | Clasificacion de tokens para limpieza de logs | en, ko | Apache-2.0 | Hugging Face |
| distilbert-base-multilingual-cased (base) | 134,7 M | 512 tokens (estandar de DistilBERT) | Modelo base enmascarado | 104 idiomas | Apache-2.0 | Hugging Face |
| Modelo de caracteres previo de slopdam | no disponible | no disponible | Limpieza de aperturas conversacionales | en, ko | no disponible | No publicado |
| Modelos generativos tipo LLM para reescritura de logs | miles de millones | variable | Generacion de texto | multilingue | variable | Hugging Face y APIs |

La comparacion con LLM generativos es cualitativa: un modelo generativo podria reescribir logs, pero introduce riesgo de alucinacion y cambios no controlados en el contenido, mientras que este tagger solo puede borrar o capitalizar. No se dispone de resultados de benchmarks de alternativas directas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con mensajes de log sinteticos del dataset `log-slop`; la prosa larga, transcripciones de chat y otros idiomas quedan fuera de alcance.
- El coreano es mas debil que el ingles: 89,9% frente a 98,7% de aperturas no vistas eliminadas.
- Falla con aperturas que parecen contenido o carecen de puntuacion: `Plot twist:` y `Right, so ...` se conservan. Ante la duda, conserva la linea por diseno.
- No debe usarse sin la guarda `chatter.py`; la model card indica explicitamente que llamar al modelo sin la guarda no esta soportado.
- Requiere ejecutar antes `clean` de slopdam con perfil `reader`, ya que el modelo se entreno sobre esa salida.
- Los adverbios de relleno (`Successfully`, `성공적으로`) quedan fuera de su alcance y se gestionan con lista de palabras en slopdam.
- No es un detector de texto generado por IA y no aporta informacion sobre la autoria de una linea.
- Riesgo de sesgo: no documentado por el autor; al operar solo sobre logs sinteticos, la representatividad de dominios reales no esta validada.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto nuevo; el riesgo se limita a borrados incorrectos, mitigados por la guarda.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas; los datos de entrenamiento y el codigo de slopdam son MIT.
- Para produccion: conviene validar el comportamiento sobre el formato concreto de logs de cada organizacion, ya que la evaluacion se hizo sobre plantillas sinteticas y conjuntos manuscritos pequenos (44 lineas por set).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slopdam/chatter-tagger
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/slopdam/log-slop
- Repositorio de slopdam: https://github.com/slopdam/slopdam
