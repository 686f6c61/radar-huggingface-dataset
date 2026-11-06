# AbstractFramework/kev-0.8b-mlx-4bit

## Resumen

Kev-0.8b-mlx-4bit es una cuantizacion en formato MLX del modelo de decision jaredpalmer/kev-0.8b, publicada por el usuario AbstractFramework. No es un modelo generativo al uso: se trata de un modelo de decision que lee un documento (el *state*) y responde preguntas tipadas sobre el mismo (eleccion entre opciones nombradas, probabilidad de que una afirmacion sea cierta y puntuacion sobre niveles ordenados) con probabilidades calibradas, en un unico paso forward y sin generar texto. El modelo base es un LoRA de rango 16 con una cabeza *pointer* montada sobre una base Qwen3.5, con licencia Apache-2.0.

Esta version concreta pliega el adaptador en la base y cuantiza el backbone para mlx-lm a 4 bits con grupo 32, manteniendo las proyecciones Gated DeltaNet y las proyecciones gate/up del MLP a 8 bits. El resultado ocupa 0.65 GB, con la cabeza *pointer* en float32 y un fichero `decision.json` que registra la receta y el checkpoint de origen. Con 752.393.024 parametros reales y un pipeline declarado de text-classification, esta pensado para ejecutarse en Apple Silicon mediante MLX.

La relevancia de esta publicacion es acotada pero clara: ofrece una via de despliegue local y de baja latencia (24 ms por registro en un M5 Max) para un modelo de decision calibrado, con una perdida de precision medida y documentada frente a bf16. Es un artefacto derivado, no un modelo original, y su utilidad depende del ecosistema AbstractCore y de la calidad del modelo base de Jared Palmer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet (base Qwen3.5) mas cabeza pointer; adaptador LoRA de rango 16 plegado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, grupo 32, con proyecciones Gated DeltaNet y MLP gate/up a 8 bits; cabeza pointer en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `head.safetensors` y `decision.json` |

## Arquitectura y entrenamiento

El modelo base jaredpalmer/kev-0.8b se construye sobre modelos Qwen3.5 de Alibaba y consiste en un LoRA de rango 16 junto con una cabeza *pointer* sobre el backbone. La arquitectura del backbone incorpora proyecciones Gated DeltaNet, lo que sugiere un diseno hibrido con componentes de atencion lineal o de estado recurrente, aunque la informacion disponible no detalla la composicion exacta de capas ni el numero de tokens de entrenamiento. La cabeza *pointer* es la que produce las respuestas tipadas sobre el documento de entrada en un unico paso forward, sin decodificacion autoregresiva.

Esta version de AbstractFramework no reentrena el modelo: pliega el adaptador LoRA en la base y aplica una receta de cuantizacion para mlx-lm. La receta parte de la observacion de que cuantizar solo las proyecciones DeltaNet a 8 bits daba una concordancia de 0.954 con bf16 en este modelo pequeno; mantener tambien las proyecciones gate/up del MLP a 8 bits recupera la mayor parte de la precision restante a cambio de un 15 % mas de tamano. El checkpoint de 8 bits (0.8 GB) es indistinguible de bf16 segun el autor. La conversion se realizo con `python -m abstractcore.decision.convert`. No se documentan datos de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion y decision tipada sobre un documento de entrada: preguntas de tipo `choice` sobre opciones nombradas con criterios, `noul` (probabilidad de que una afirmacion sea verdadera) y `score` sobre niveles ordenados.
- Salida de probabilidades calibradas (ECE 0.024 en el conjunto de desarrollo public-pool-v6) en un unico paso forward, sin generacion de texto.
- Inferencia de baja latencia: 24 ms por registro en un M5 Max.
- Integracion con el ecosistema AbstractCore mediante API Python (`create_llm`, `llm.generate(..., output="decision")`) y servidor HTTP (`POST /v1/decisions`).
- No soporta tool calling ni function calling en el sentido habitual: su interfaz es la definicion de preguntas tipadas, no la invocacion de herramientas.
- No se documentan capacidades de agente, razonamiento multi-paso, vision, audio ni modo *thinking*.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).

## Casos de uso

- Triaje de tickets de atencion al cliente: el modelo recibe el texto del ticket como *state* y responde con preguntas `choice` para asignar departamento (devoluciones, envios, facturacion) y `noul` para decidir si requiere atencion humana urgente, con probabilidades calibradas que permiten fijar umbrales de escalado. Es el escenario que ilustra la propia model card.
- Enrutamiento de correo entrante: clasificacion en un unico paso forward con latencia de 24 ms por registro, adecuada para procesar volumenes altos en local sin depender de una API externa.
- Moderacion o priorizacion de contenido: uso de preguntas `score` para asignar niveles ordenados (por ejemplo, gravedad de una queja) y `noul` para flags binarios con umbral calibrado.
- Extraccion de decisiones en pipelines de datos: etiquetado estructurado de documentos con probabilidades asociadas, util para construir datasets o para auditoria con confianza explicita.
- Despliegue en portatiles Apple Silicon: al ocupar 0.65 GB y ejecutarse con MLX, cabe en un Mac con memoria unificada moderada para prototipado y pruebas locales.
- Servicio HTTP interno de decisiones: exposicion via `POST /v1/decisions` de un servidor AbstractCore para que otras aplicaciones consulten decisiones tipadas sobre documentos sin gestionar generacion de texto.

## Benchmarks y rendimiento

| Metrica | Valor (4-bit MLX) | Referencia bf16 |
|---|---|---|
| Precision (public-pool-v6 dev, 1.328 registros) | 0.754 | 0.763 |
| ECE (calibracion) | 0.024 | no disponible |
| Concordancia de argmax con bf16 | 0.960 | - |
| Media de \|delta p\| frente a bf16 | 0.028 | - |
| Preguntas desplazadas mas de 0.10 | 4.2 % | - |
| Latencia por registro (M5 Max) | 24 ms | no disponible |

El autor indica ademas que la receta de 4 bits con solo las proyecciones DeltaNet a 8 bits daba 0.954 de concordancia, y que el checkpoint de 8 bits (0.8 GB) es indistinguible de bf16. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 0.65 GB para los pesos en 4 bits; el repo completo ocupa 0.7 GB.
- Hardware objetivo: Apple Silicon con MLX (la medicion de latencia se hizo en un M5 Max); no se documenta soporte CUDA.
- GPU consumer: no aplica en el sentido habitual; el modelo esta pensado para memoria unificada de Mac. No se dispone de datos para GPUs NVIDIA.
- Despliegue: libreria mlx-lm y el ecosistema AbstractCore (`create_llm("mlx", ...)`); servidor HTTP AbstractCore con el endpoint `/v1/decisions`.
- Latencia: 24 ms por registro en un M5 Max; no se documenta throughput agregado ni latencia en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AbstractFramework/kev-0.8b-mlx-4bit | 752 M | no disponible | safetensors MLX 4-bit | Apache-2.0 | Cuantizacion 4-bit del modelo de decision; precision 0.754, ECE 0.024 |
| jaredpalmer/kev-0.8b (base) | no disponible | no disponible | no disponible | Apache-2.0 | Modelo original en bf16; referencia de precision 0.763 |
| Checkpoint 8-bit de Kev-0.8B | no disponible | no disponible | safetensors MLX 8-bit | Apache-2.0 | 0.8 GB; indistinguible de bf16 segun el autor |

No se dispone de informacion sobre otros modelos de decision comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto derivado y cuantizado: la precision cae de 0.763 a 0.754 y un 4.2 % de las preguntas se desplazan mas de 0.10 en probabilidad respecto a bf16, lo que puede alterar decisiones cerca de umbrales.
- El modelo no genera texto: solo responde a preguntas tipadas predefinidas; no sirve para tareas generativas, resumen o dialogo abierto.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones por idioma; el soporte multilingue es desconocido.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con documentos largos.
- Dependencia del ecosistema AbstractCore y de MLX: la integracion practica requiere estas librerias y, para el despliegue HTTP, un servidor AbstractCore.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de los modelos base de Alibaba y del modelo de Jared Palmer.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue publicado el 2026-11-01; no hay evidencia de uso en produccion ni validacion independiente.
- Riesgo de alucinacion: aunque el modelo no genera texto libre, las probabilidades de las preguntas `noul` y `score` pueden estar mal calibradas fuera de la distribucion del conjunto de desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractFramework/kev-0.8b-mlx-4bit
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Documentacion de modelos de decision de AbstractCore: https://github.com/lpalbou/AbstractCore/blob/main/docs/decision-models.md
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
