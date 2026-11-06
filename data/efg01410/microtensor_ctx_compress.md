# Efg01410/microtensor_ctx_compress

## Resumen

`microtensor_ctx_compress` es un repositorio de plantilla publicado por el usuario Efg01410 en Hugging Face, concebido como submission de referencia para las "arenas" de Microtensor, una plataforma de evaluación descentralizada de modelos de lenguaje. No se trata de un modelo entrenado con pesos publicados, sino de un esqueleto de repositorio que incluye un harness de ejecución, un router y un módulo de escalado a modelos frontier, junto con instrucciones para sustituir el modelo base por uno propio especializado.

El repositorio está orientado específicamente al adaptador `context_compression`, cuyo cometido es compactar sesiones de agentes de código en un JSON de cinco campos (`ctx_compress`) respetando un presupuesto de tokens. La plantilla asume un contexto máximo de 32768 tokens, hasta 3072 tokens nuevos por generación y formato de chat Qwen, con instrucciones para adaptarlo a Phi 4 mini.

Su relevancia es metodológica más que de modelado: documenta el flujo completo de una submission certificada (entrenamiento del SLM, compresión, entrenamiento del router, verificación en sandbox y replay en CPU), lo que resulta útil para investigadores que quieran entender el protocolo de evaluación de Microtensor. No hay información sobre parámetros, licencia ni idiomas del modelo en sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la plantilla asume un transformer con formato de chat Qwen o Phi 4 mini) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 32768 tokens (valor configurado en `config.json` para el adaptador `context_compression`) |
| Tipos de cuantización | no disponible (la plantilla menciona "compression" en el pipeline de entrenamiento, sin detallar esquemas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (referenciado en el layout `router/model.safetensors` y `slm_repo/model.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo, ya que el repositorio es una plantilla y no un modelo entrenado. El documento indica que el SLM debe entrenarse y comprimirse a partir del modelo base definido por la arena correspondiente, y que debe registrarse un "training record" con receta, fuentes de datos, destilación, compresión, ejecuciones y scripts bajo el directorio `training/`.

El pipeline de evaluación incluye un router entrenado como clasificador de secuencias de un solo logit (`router/training/train_router.py`), etiquetado por el grader de la arena sobre ítems públicos de muestra, y un módulo de "frontier repair" que escala consultas a modelos frontier mediante un relay con recibos firmados verificados en replay. El harness se ejecuta en sandbox sin red salvo el gateway de grabación, y los validadores replican el harness en CPU contra la transcripción. No se especifican volúmenes de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto estructurado: el adaptador `context_compression` produce un objeto JSON de cinco campos que resume una sesión de agente de código.
- Verificación de presupuesto de tokens: el verificador comprueba que la salida respeta el límite indicado en la instrucción.
- Normalización de salidas: pliega claves extra dentro de `summary` y convierte entradas de objeto en cadenas planas.
- Tool calling implícito vía harness: el `main.py` expone endpoints `/harness/run`, `/escalation/repair` y `/system/run`.
- Escalado a modelos frontier: el módulo `escalation/` permite reparar borradores con llamadas a modelos de mayor capacidad mediante tickets y recibos firmados.
- Routing condicional: un clasificador de un logit decide si se acepta el borrador del SLM o se escala.
- Adaptadores alternativos: `generic` (texto libre o estructurado) y `sql_generation` (generación de SQLite validada con sqlglot y ejecución sobre base de datos de muestra).
- Resistencia a inyección de instrucciones: el adaptador `generic` rechaza instrucciones inyectadas.
- Soporte de formato de chat Qwen y Phi 4 mini (marcadores `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`).

## Casos de uso

- Compactación de sesiones de agentes de código: el adaptador `context_compression` convierte un historial largo de un agente en un JSON de cinco campos con presupuesto de tokens acotado, lo que permite mantener contexto útil en ventanas de 32k tokens sin perder información crítica.
- Evaluación comparativa de SLMs en entornos certificados: el repositorio sirve como plantilla para participar en arenas de Microtensor, permitiendo medir un modelo propio frente a componentes de referencia con replay verificable en CPU.
- Enrutado coste-eficiente entre modelos: el router de un logit permite decidir cuándo un SLM local es suficiente y cuándo conviene escalar a un modelo frontier, reduciendo el coste por consulta en pipelines de producción.
- Generación de SQL validada: con el adaptador `sql_generation`, el harness produce consultas SQLite que se parsean con sqlglot, se restringen a tablas conocidas y se ejecutan sobre la base de datos de muestra antes de devolverse.
- Reparación de borradores con modelos frontier: el módulo `escalation/` permite corregir salidas defectuosas del SLM mediante llamadas pagadas con recibos firmados, útil en flujos donde la precisión es crítica y el coste de la llamada frontier está justificado.
- Investigación sobre evaluación descentralizada: el repositorio documenta el protocolo de perfiles de hardware, hashes de pesos y digests de imágenes oficiales, lo que facilita reproducir experimentos de evaluación certificada en GPUs propias.
- Integración en pipelines de CI/CD para agentes: el harness puede ejecutarse como servicio con endpoints HTTP, lo que permite incorporarlo a flujos automatizados de resumen de sesiones o verificación de salidas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no especificarse el tamaño del modelo base ni los parámetros del SLM.
- GPU recomendadas: no disponible; la plantilla exige declarar un perfil de hardware de entre los permitidos por la arena (`evaluation.profiles`), descritos en la documentación de Microtensor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el harness se sirve mediante la imagen oficial del motor de Microtensor en sandbox; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Restricciones de tamaño: `harness/` y `escalation/` deben ocupar conjuntamente menos de 2 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Efg01410/microtensor_ctx_compress` | no disponible | 32768 tokens (configurado) | no disponible | Hugging Face, 0 descargas, 0 likes |
| Plantillas de submission para otras arenas de Microtensor | no disponible | según arena | no disponible | referenciadas en la documentación de Microtensor |
| Modelos base citados (Qwen chat, Phi 4 mini) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo entrenado: el repositorio es una plantilla; los pesos, la licencia y las capacidades reales dependen del SLM que cada usuario entrene y suba a `mt_slm_<arena>`.
- Ausencia total de metadatos: no hay licencia, idiomas, pipeline ni parámetros declarados, lo que impide evaluar su idoneidad para uso comercial o producción.
- Sin benchmarks: no se han publicado resultados que permitan estimar calidad, latencia o robustez.
- Dependencia de la plataforma: el flujo de validación, los perfiles de hardware y los graders están ligados a la infraestructura de Microtensor; fuera de ella, el harness pierde su función certificadora.
- Riesgo de alucinación: no evaluado; el adaptador `context_compression` mitiga parcialmente mediante verificación de estructura JSON y presupuesto de tokens, pero no valida la fidelidad semántica del resumen.
- Restricciones de empaquetado: `harness/` y `escalation/` deben sumar menos de 2 MB, lo que limita la complejidad del código auxiliar.
- Dependencia de modelos frontier externos: el módulo de escalado requiere tickets y relay operativos, con coste asociado y verificación por recibos firmados.
- Sesgos: no disponibles; dependen del modelo base y de los datos de entrenamiento que cada usuario aporte.
- Fecha de creación futura (2026-11-03) en los metadatos de Hugging Face, lo que sugiere posible desfase o error en el registro.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Efg01410/microtensor_ctx_compress
- Documentación de evaluación descentralizada: https://www.microtensor.cloud/docs/certified-inference/system/decentralised-evaluation
- Documentación de perfiles de hardware: https://www.microtensor.cloud/docs/certified-inference/system/hardware-profiles
- API de arenas: https://api.microtensor.cloud/v2/arenas/<arena>
