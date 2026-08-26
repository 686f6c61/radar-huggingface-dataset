# lemonade-sdk/pii_policy_llm_classifier

## Resumen

`lemonade-sdk/pii_policy_llm_classifier` no es un modelo de pesos, sino un conjunto de políticas de enrutamiento para el servidor Lemonade, un framework open source de inferencia local. Estas políticas implementan un **router basado en LLM** (tipo `routing.router.type: "llm"`) que decide, mediante un prompt de sistema, si una solicitud debe enrutarse a un modelo local o a un candidato en la nube, en lugar de usar un clasificador dedicado. El objetivo es prevenir fugas de datos personales (PII) hacia proveedores cloud, manteniendo el tráfico sensible en local.

Se publican tres variantes, una por tamaño del modelo router: Qwen3.5-9B-GGUF, Qwen3.5-2B-GGUF y Qwen3.5-0.8B-GGUF. En todas ellas, el router LLM y el candidato local de completado son el mismo modelo, que hace doble función: decide el enrutamiento y, si corresponde, atiende la solicitud. El candidato cloud es `fireworks.kimi-k2p6`. El repositorio contiene únicamente los archivos de configuración JSON, no los pesos de los modelos.

La relevancia actual radica en que ofrece una alternativa a los clasificadores ONNX tradicionales para privacidad, con una convención opuesta: el default es **local** cuando el router no está seguro, priorizando la privacidad sobre el rendimiento. Los benchmarks sobre una muestra de 2500 casos del corpus Nemotron-PII muestran tasas de fuga entre 2,84 % y 6,16 % según el tamaño del router.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los modelos router son Qwen3.5 en formato GGUF, pero la arquitectura interna no se especifica) |
| Parametros totales | 9B, 2B y 0.8B (según la variante; los archivos se llaman `pii_policy_llm_classifier_9b.json`, `_2b.json` y `_0.8b.json`) |
| Parametros activos | No disponible (no se indica si son MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (los candidatos locales se referencian como `Qwen3.5-9B-GGUF`, `Qwen3.5-2B-GGUF`, `Qwen3.5-0.8B-GGUF`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (el repositorio solo contiene configuraciones JSON de política, no pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna de los modelos Qwen3.5 referenciados, ni sobre los datos de entrenamiento, el número de tokens, ni técnicas como RLHF o DPO. El repositorio se centra en la capa de enrutamiento, no en el entrenamiento de los modelos.

La innovación técnica principal es el uso de un **LLM como router** dentro del sistema `collection.router` de Lemonade. En lugar de un clasificador binario entrenado específicamente para PII, el router LLM lee cada prompt y, mediante un prompt de sistema, decide si enrutar a local o a cloud. El prompt del router es editable y constituye toda la lógica de enrutamiento: se puede modificar para cambiar qué se considera sensible, añadir categorías o ajustar el default de privacidad. La convención de privacidad es inversa a la de los clasificadores: si el router no está seguro, el tráfico va a local.

## Capacidades

- **Enrutamiento de privacidad**: decide si una solicitud contiene PII y debe quedarse en local o puede ir a cloud, basándose en un prompt de sistema.
- **Generación de justificación**: los modelos más grandes (9B) emiten una justificación parseable junto a la decisión de enrutamiento en el 99,5 % de los casos, mientras que los pequeños lo hacen mucho menos (18,3 % en 0.8B).
- **Doble función del modelo**: el mismo LLM actúa como router y como candidato local de completado, simplificando el despliegue.
- **Personalización**: el campo `prompt` del JSON se puede editar para cambiar la lógica de sensibilidad sin reentrenar.
- **Soporte de Lemonade Server**: se integra con el servidor local mediante `lemonade-server pull` y la API de chat completions.

## Casos de uso

- **Protección de datos en aplicaciones de chat local**: desplegar un asistente que mantenga las conversaciones con PII (nombres, direcciones, números de documento) en el modelo local, y solo envíe a cloud peticiones sin datos sensibles, usando la política `pii_policy_llm_classifier_2b.json`.
- **Cumplimiento normativo en entornos sanitarios**: en una aplicación que procese consultas de pacientes, el router decide si el prompt contiene información de salud identificable y lo mantiene en local, reduciendo el riesgo de incumplimiento del RGPD o HIPAA.
- **Filtrado de prompts en pipelines de RAG**: antes de enviar una consulta a un LLM cloud, el router clasifica si el texto contiene PII; si es así, la consulta se procesa con el modelo local de la organización.
- **Enrutamiento híbrido local/cloud en empresas**: usar la política como capa de control de costes: el tráfico sin PII puede ir a cloud (más barato o más rápido) mientras el sensible se queda local, según la configuración de candidatos.
- **Auditoría de fuga de datos**: gracias a la justificación emitida por el router (en los modelos grandes), se puede auditar el porqué de cada decisión de enrutamiento, útil para cumplimiento y revisión manual.
- **Adaptación a categorías específicas**: editar el `prompt` del router para detectar no solo PII estándar sino también datos de tarjetas de crédito, números de cuenta, o información de menores, y enrutar en consecuencia.

## Benchmarks y rendimiento

La model card proporciona resultados sobre una muestra de 2.500 casos del corpus Nemotron-PII:

| Metrica | Qwen3.5-9B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|
| Tasa de fuga (PII a cloud) | 6,16 % (154/2.500) | 3,28 % (82/2.500) | 2,84 % (71/2.500) |
| Recall | 93,84 % | 96,72 % | 97,16 % |
| Justificación emitida | 99,5 % | 59,4 % | 18,30 % |
| Fallos de prompt (de fugas) | 129/153 (84 %) | 61/82 (74 %) | 40/71 (56 %) |
| Fallos genuinos (de fugas) | 24/153 (16 %) | 21/82 (26 %) | 31/71 (44 %) |
| Categorías falladas | no registrado | no registrado | no registrado |
| Runtime E2E (corpus completo) | 6 horas | 2,5 horas | 2,1 horas |
| Tiempo de enrutamiento | no registrado | 2,28 horas | 1,5 horas |
| Tiempo de procesamiento de prompt | no registrado | 21 minutos | 18 minutos |

Nota: el autor advierte que los resultados no son directamente comparables con los de las políticas basadas en clasificadores ONNX, que usaron un corpus de 20.001 casos. La aparente mejoría en recall de los modelos más pequeños debe tomarse con cautela, porque emiten mucha menos justificación (18,3 % frente a 99,5 %), lo que sugiere que toman decisiones con razonamiento menos visible, no necesariamente mejor juicio.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Depende del modelo Qwen3.5 elegido (0.8B, 2B o 9B) y de su cuantización GGUF.
- **GPUs recomendadas**: no se especifican. Los tamaños de 0.8B y 2B deberían caber en GPUs de consumo (8-12 GB VRAM) en cuantización GGUF; el 9B requeriría más memoria, típicamente 16 GB o más en cuantización de 4 bits.
- **Soporte en GPU consumer**: probablemente sí, dado que se distribuye en formato GGUF, pero no está confirmado.
- **Opciones de despliegue**: Lemonade Server (vía `lemonade-server pull`), que soporta GGUF, FLM y ONNX en CPU, GPU y NPU. No se mencionan vLLM, llama.cpp u Ollama en la información.
- **Latencia y throughput**: los tiempos de enrutamiento en el benchmark (2,28 h para 2B y 1,5 h para 0.8B en 2.500 casos) sugieren una latencia media de varios segundos por decisión, pero no hay datos de throughput en tiempo real.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de la misma categoría en la información proporcionada. Los benchmarks se limitan a las tres variantes de Qwen3.5. Existen otras políticas de Lemonade para clasificación de PII basadas en ONNX (por ejemplo, `pii_policy_openmed-privacy-filter-multilingual-v2-onnx` y `pii_policy_mmbert32k-pii-detector-merged-onnx`), pero sus métricas no son comparables directamente por el tamaño del corpus (20.001 casos frente a 2.500).

## Limitaciones y advertencias

- **No es un modelo de pesos**: el repositorio solo contiene configuraciones JSON de política; los pesos del router LLM deben obtenerse por separado (Qwen3.5-* en GGUF).
- **Riesgo de fuga de PII**: las tasas de fuga oscilan entre 2,84 % y 6,16 % en la muestra; no es una barrera absoluta contra fugas.
- **Menor justificación en modelos pequeños**: los routers de 2B y 0.8B emiten justificación en menos del 60 % y 19 % de los casos, lo que dificulta la auditoría y depuración de decisiones.
- **Fallos de prompt vs. genuinos**: en el 9B, el 84 % de las fugas se atribuyen a que el prompt no mostraba claramente la PII, pero en el 0.8B los fallos genuinos son el 44 %, indicando que puede fallar incluso con señales presentes.
- **Dependencia del modelo cloud**: el candidato cloud es `fireworks.kimi-k2p6`; si este no está disponible o registrado, la política no funcionará correctamente.
- **Límites de contexto**: no se especifica la longitud de contexto de los Qwen3.5, lo que puede afectar al enrutamiento de prompts muy largos.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que verificar las licencias de los modelos Qwen3.5 subyacentes (no cubiertas por este repositorio).
- **Sesgos y alucinaciones**: al ser un LLM como router, puede alucinar categorías o decisiones; no se han evaluado sesgos específicos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/lemonade-sdk/pii_policy_llm_classifier
- Lemonade SDK en GitHub: https://github.com/lemonade-sdk
- Lemonade Server (repo principal): https://github.com/lemonade-sdk (flagship repo)
- Documentación de Lemonade Server: https://lemonade-server.ai/docs/api/lemonade/
- Guía de multi-modelo de Lemonade: https://lemonade-server.ai/docs/guide/configuration/multi-model/
- PyPI de lemonade-sdk: https://pypi.org/project/lemonade-sdk/
- Documentación de políticas de router en DeepWiki: https://deepwiki.com/lemonade-sdk/lemonade/5.7-router-policies-(collection.router)
- Política de clasificador ONNX (para comparación): https://huggingface.co/lemonade-sdk/pii_policy_openmed-privacy-filter-multilingual-v2-onnx
- Política de clasificador ONNX (mmbert32k): https://huggingface.co/lemonade-sdk/pii_policy_mmbert32k-pii-detector-merged-onnx
