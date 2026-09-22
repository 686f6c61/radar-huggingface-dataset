# kontext-security/Merlin

## Resumen

Merlin es un encoder de 70,8 millones de parametros desarrollado por kontext-security que clasifica como `safe` o `unsafe` una invocacion de herramienta (tool call) propuesta por un agente de IA, teniendo en cuenta el contexto que la rodea. Tecnicamente es un fine-tuning de `microsoft/deberta-v3-xsmall` (revision `4b419818330868dff6a60ad3e6b1c730f8b8c0c6`) con una cabeza de clasificacion binaria, publicado como checkpoint portable en formato safetensors.

El problema que resuelve es concreto: los agentes basados en LLM ejecutan herramientas con efectos reales (envio de correo, escritura en base de datos, llamadas a APIs externas) y son vulnerables a prompt injection directa e indirecta. Merlin actúa como una senal de seguridad local y de baja latencia que se evalua antes de ejecutar la accion, no como sustituto del modelo generativo. El modelo consume cuatro campos de entrada (peticion del usuario, historial de interaccion previo, nombre y argumentos de la herramienta actual, y descripciones/esquemas de herramientas) empaquetados en una secuencia de 512 tokens con presupuestos de tokens independientes por campo.

Su relevancia actual viene de la ausencia de capas de control ligeras y desplegables en local para agentes: con 70,8 M de parametros cabe en cualquier GPU de consumo e incluso en CPU, y su licencia y tamano lo hacen apropiado para integrarse como guardrail previo en pipelines de agentes. No obstante, los propios autores advierten que el rendimiento no es uniforme entre entornos de evaluacion (ver benchmarks) y que el modelo debe combinarse con minimo privilegio, politica determinista, sandboxing y confirmacion humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atencion desacoplada / disentangled attention) con cabeza de clasificacion binaria |
| Parametros totales | 70.794.242 (~70,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (secuencia empaquetada con presupuestos de tokens independientes por campo) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; ~0,3 GB, compatible con pesos en fp32) |
| Idiomas soportados | no disponible |
| Licencia | other / `merlin-research-release` (el modelo base es MIT; el checkpoint se marca `other` por la procedencia de los datos) |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-xsmall |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0,3 GB |
| Etiquetas de despliegue | text-embeddings-inference, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

Merlin parte del backbone encoder-only `microsoft/deberta-v3-xsmall`, un transformer con atencion desacoplada (DeBERTa-v3), preentrenado con objetivos tipo ELECTRA y un vocabulario SentencePiece de gran tamano. Sobre ese backbone se anade una cabeza de clasificacion binaria y se ajusta de forma supervisada para la tarea de seguridad de tool calls. Los tags del repositorio incluyen tanto `deberta-v2` como `deberta-v3`, pero la base declarada explicitamente en la model card es `deberta-v3-xsmall`.

El entrenamiento se realizo sobre 2.192 ejemplos (841 `safe`, 1.351 `unsafe`) con 789 ejemplos de validacion, durante 5 epocas, con learning rate 2e-5, batch size 8 y acumulacion de gradiente 2. La salida se calibra con una sigmoide ajustada sobre validacion: coeficiente 1,427213430140093 e intercepto 2,953687013257505, con umbral por defecto de 0,5. La innovacion tecnica no esta en la arquitectura sino en el preprocesado de la entrada: el historial ReAct previo se convierte en eventos canonicos JSON de tipo tool/argument/observation, se excluye el texto de `Thought` y `Final Answer`, y la accion actual se reduce a nombre de herramienta y argumentos. Cada uno de los cuatro campos recibe su propio presupuesto de tokens dentro de una unica secuencia empaquetada de 512 tokens. Por este motivo, un pipeline generico de Transformers no reproduce los resultados publicados: se necesita el paquete de referencia, la normalizacion determinista del historial y el calibrador ajustado.

## Capacidades

- Clasificacion binaria de seguridad (`safe` / `unsafe`) de una invocacion de herramienta propuesta por un agente.
- Condicionado por contexto multi-campo: peticion del usuario, historial de interaccion, accion actual y esquemas de herramientas.
- Normalizacion determinista de trayectorias ReAct a eventos JSON canonicos (tool, argumentos, observacion), descartando texto de razonamiento.
- Deteccion de prompt injection directa e indirecta vehiculada a traves de argumentos de herramientas o contenido externo.
- Inferencia local de baja latencia, con un modelo lo bastante pequeno para ejecutarse en CPU o en GPU de consumo.
- Salida calibrada de probabilidad, con umbral configurable (por defecto 0,5).
- Integrable como senal previa a la ejecucion de una accion, no como generador de texto.
- No realiza generacion de texto, razonamiento multi-paso, codigo, matematicas, vision ni tool calling por si mismo: es exclusivamente un clasificador.
- Capacidades multilingues: no disponibles (no se declara cobertura de idiomas).

## Casos de uso

- Guardrail previo a la ejecucion de tool calls: antes de que el agente invoque una herramienta, el orquestador consulta a Merlin con los cuatro campos de entrada; si la salida supera el umbral de 0,5, la llamada se bloquea o se enruta a revision. Es adecuado por su baja latencia y por consumir directamente la representacion de la accion.
- Defensa frente a prompt injection indirecta: cuando el agente procesa contenido externo (paginas web, correos, resultados de busqueda) que puede contener instrucciones maliciosas, Merlin evalua la accion resultante en lugar del texto fuente, detectando desvios de politica en los argumentos de la herramienta.
- Confirmacion humana para acciones consecuentes: para operaciones sensibles (transferencias, borrado de datos, envio masivo de correo), la puntuacion de Merlin puede disparar un flujo de aprobacion humana en lugar de un bloqueo automatico.
- Cumplimiento y registro de auditoria: almacenar la puntuacion calibrada y la etiqueta de cada decision permite reconstruir por que se permitio o bloqueo una accion, un requisito habitual en entornos regulados.
- Despliegue on-premise con requisitos de privacidad: al ser un modelo de 70,8 M de parametros ejecutable en local, permite clasificar trayectorias sin enviar datos de herramientas ni historiales a APIs externas.
- Deteccion de exfiltracion de datos mediante herramientas: casos en los que el agente es inducido a pasar credenciales o datos internos como argumentos de una llamada a una API externa; el modelo evalua la combinacion de herramienta + argumentos + peticion.
- Red-teaming y evaluacion de agentes: puntuar trayectorias generadas por un agente bajo ataque para medir su robustez antes de ponerlo en produccion, usando Merlin como juez automatizado de cada paso.
- Filtrado en pipelines de CI/CD de agentes: integrar la clasificacion en pruebas automatizadas que ejecutan trayectorias sinteticas de ataque y fallan el build si el agente propone acciones marcadas como `unsafe`.

## Benchmarks y rendimiento

Evaluacion binaria estricta sobre TS-Bench (`0.0` = safe; `0.5` y `1.0` = unsafe), con umbral fijo de 0,5:

| Split | N | Accuracy | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| All TS-Bench | 7.182 | 91,19% | 92,66% | 88,45% | 90,51% |
| ASB-Traj | 5.231 | 99,73% | 99,76% | 99,68% | 99,72% |
| AgentDojo-Traj | 1.220 | 71,80% | 51,14% | 50,85% | 51,00% |
| AgentHarm-Traj | 731 | 62,38% | 83,42% | 59,43% | 69,41% |

Los propios autores senalan que la puntuacion agregada (91,19%) esta dominada por ASB-Traj (5.231 de 7.182 ejemplos) y no constituye evidencia de rendimiento uniforme entre entornos. No se han publicado en la informacion disponible resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un clasificador encoder-only.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 70,79 M de parametros; son estimaciones, no cifras publicadas por el autor): ~283 MB en fp32, ~142 MB en fp16/bf16, ~71 MB en int8. A esto hay que sumar el coste de activaciones de una secuencia de 512 tokens, reducido por el tamano del modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre sirve; no se requiere A100, H100 ni hardware de centro de datos. Una RTX 4090, una RTX 3060 o una iGPU moderna son mas que suficientes.
- Cabe en GPU de consumo: si, con margen amplio, en cualquier GPU consumer reciente, e incluso en CPU (el modelo esta pensado como senal local de baja latencia).
- Opciones de despliegue: Transformers (libreria declarada), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles de Hugging Face (tag `endpoints_compatible`) y el paquete de referencia en `github.com/kontext-security/merlin`, que es obligatorio para reproducir el benchmark. No se declara soporte oficial de llama.cpp, Ollama, GGUF ni vLLM.
- Latencia y throughput: no se publican cifras concretas. La model card describe el modelo como una senal de seguridad local de baja latencia; no hay numeros de tokens/s ni de milisegundos por clasificacion en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kontext-security/Merlin | 70,8 M | 512 tokens (4 campos empaquetados) | Clasificacion safe/unsafe de tool calls | other (`merlin-research-release`) | HuggingFace + repo de referencia |
| microsoft/deberta-v3-xsmall (modelo base) | no disponible (mismo backbone) | 512 tokens | Encoder generico preentrenado (no es un clasificador de seguridad) | MIT | HuggingFace |
| Clasificadores de seguridad para agentes de terceros | no disponible | no disponible | Guardrails y deteccion de prompt injection | no disponible | no disponible |

La informacion proporcionada no incluye resultados comparativos con alternativas de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, contexto o coste frente a otros guardrails de agentes. Cualquier cifra de terceros deberia verificarse contra sus propias evaluaciones, ya que los protocolos de preprocesado y calibracion (clave en Merlin) rara vez son equivalentes entre modelos.

## Limitaciones y advertencias

- Rendimiento muy desigual segun el entorno: sobre AgentDojo-Traj el F1 cae al 51,00% (precision 51,14%, recall 50,85%), practicamente a nivel de azar, y sobre AgentHarm-Traj el F1 es del 69,41% con un recall del 59,43%. El 91,19% agregado esta dominado por ASB-Traj y no debe presentarse como rendimiento uniforme.
- No es una capa de autorizacion completa. Los autores indican explicitamente que debe combinarse con minimo privilegio, politica determinista, sandboxing y confirmacion humana en acciones consecuentes.
- No debe usarse como unico control para acciones de alto impacto ni como moderador de contenido general.
- No debe aplicarse fuera de la representacion de entrada documentada sin una evaluacion previa: el modelo depende de los cuatro campos con presupuestos de tokens, de la normalizacion determinista del historial y del calibrador ajustado en validacion.
- Un pipeline generico de Transformers no reproduce los resultados publicados; es necesario usar el paquete de referencia para replicar el preprocesado y la calibracion.
- Datos de entrenamiento reducidos: 2.192 ejemplos de entrenamiento y 789 de validacion, con un fuerte desequilibrio hacia `unsafe` (1.351 frente a 841). Existe riesgo de sobreajuste al dominio y al formato de TS-Bench.
- Umbral fijo por defecto de 0,5: en produccion conviene recalibrar el umbral segun el coste relativo de falsos positivos y falsos negativos de cada organizacion.
- Licencia: el modelo base es MIT, pero Merlin se ajusto sobre datos de TS-Bench (`github.com/MurrayTom/ToolSafe`) que no tenian licencia explicita en el momento de su publicacion. Por eso el checkpoint se marca como `other` / `merlin-research-release` y no se replican ejemplos crudos del dataset. Es obligatorio revisar los terminos del upstream antes de cualquier uso comercial o redistribucion. El codigo de referencia es Apache-2.0.
- Riesgo de falsos negativos: al ser un clasificador binario, un `unsafe` no detectado se traduce directamente en ejecucion de una accion peligrosa; no hay capa generativa que explique la decision.
- Idiomas soportados y sesgos conocidos: no disponibles. No se declara cobertura multilingue ni analisis de sesgo.
- Adopcion practicamente nula en el momento de la ficha (0 descargas, 0 likes), lo que implica poca validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kontext-security/Merlin
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
- Paquete de referencia (obligatorio para reproducir el benchmark): https://github.com/kontext-security/merlin
- Dataset TS-Bench / ToolSafe: https://github.com/MurrayTom/ToolSafe
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces recuperados correspondian a plataformas de video analitico en el edge de Qualcomm y no guardan relacion con Merlin.
