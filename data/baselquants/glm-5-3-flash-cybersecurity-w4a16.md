# baselquants/GLM-5.3-Flash-CYBERSECURITY-W4A16

## Resumen

GLM-5.3-Flash-CYBERSECURITY-W4A16 es una cuantización y ajuste fino publicado por el usuario baselquants sobre `zai-org/GLM-5.3-Flash`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con torre de visión (vision-language) y cabeza de predicción multitoken (MTP). El repositorio contiene 321.323.031.390 parámetros totales (≈321,3 mil millones) en formato safetensors cuantizado W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante `compressed-tensors`, con un tamaño de repositorio de 194,7 GB. La licencia declarada es MIT y el pipeline es `text-generation`.

El valor diferencial que declara la model card es un ajuste de "compliance" que elimina los rechazos del modelo base: según los datos del autor, la tasa de cumplimiento real en HarmBench pasa del 30,3% al 100,0% en seis categorías de daño real, con el coste de una caída de 1,85 puntos en MMLU (de 86,08% a 84,23%). La torre de visión y la cabeza MTP de la capa 45 se mantienen intactas, y el modelo se sirve con vLLM mediante parsers específicos de razonamiento (`glm45`) y de tool calling (`glm47`).

Es relevante ahora por dos motivos: por un lado, es un ejemplo de cuantización W4A16 de un MoE de gran tamaño con decodificación especulativa MTP activada; por otro, es un caso de estudio de modificación de la política de rechazo (uncensoring) con métricas de seguridad explícitas. La búsqueda web realizada no ha devuelto ninguna fuente técnica relacionada con el modelo: los resultados obtenidos eran contenido de agencias de viajes sobre las islas Galápagos, sin relación alguna, por lo que toda la información procede exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con torre de visión y cabeza de predicción multitoken (MTP) |
| Parámetros totales | 321.323.031.390 (≈321,3 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (pesos 4 bits, activaciones 16 bits), formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizado W4A16, `compressed-tensors`) |
| Modelo base | zai-org/GLM-5.3-Flash (base_model:quantized) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-18 |
| Tamaño del repositorio | 194,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo MoE (etiqueta `moe` y `glm5_next` en los tags) con 321,3 mil millones de parámetros totales; no se especifica el número de parámetros activos por token ni el número de expertos. Incluye dos componentes adicionales: una torre de visión (`vision`, `vision-language`) que habilita entrada multimodal, y una cabeza de predicción multitoken situada en la capa 45 (`multi-token-prediction`), que el autor declara intacta tras el proceso de ajuste. La presencia de esa capa en la posición 45 es el único indicio indirecto sobre la profundidad de la red.

El modelo parte de una versión ya cuantizada del base (`base_model:quantized:zai-org/GLM-5.3-Flash`) y se publica en W4A16 con `compressed-tensors`. La model card describe el trabajo realizado como un ajuste de "compliance" que elimina los rechazos en las seis categorías de daño real evaluadas en HarmBench, sin degradar la profundidad de razonamiento y preservando la torre de visión y la cabeza MTP. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras; tampoco se detalla el procedimiento exacto de ajuste. Toda esa información debe considerarse no disponible.

En inferencia, el modelo aprovecha decodificación especulativa basada en MTP (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`), que el autor cifra en una mejora de rendimiento de decodificación de entre 1,5 y 2 veces, además de prefix caching para reutilizar la caché KV en prefijos idénticos.

## Capacidades

- Generación de texto y conversación multiturno en formato chat compatible con la API de OpenAI.
- Modo de razonamiento explícito: emite bloques `<think>...</think>` que el parser `glm45` enruta al campo `reasoning_content`. Admite control mediante `enable_thinking` y `reasoning_effort`.
- Tool calling / function calling con `--tool-call-parser glm47` y `--enable-auto-tool-choice`, en el formato de llamada a herramientas de GLM-4.7.
- Flujos de agente con caché de prefijos (`--enable-prefix-caching`), útil en cargas de trabajo con system prompt y contexto repetidos.
- Capacidad de visión (vision-language): la torre de visión se declara intacta y verificada, por lo que acepta entrada de imágenes junto a texto.
- Decodificación especulativa con cabeza MTP para acelerar la generación.
- Ajuste de "compliance": según los datos del autor, el modelo responde sin rechazos a solicitudes que el base rechazaba en seis categorías de daño real, en los tres modos de razonamiento evaluados.
- Capacidades multilingües: no disponible (los idiomas soportados no figuran en la información).

## Casos de uso

- Red teaming y evaluación de guardrails: el modelo puede emplearse en un entorno aislado como generador adversario para producir solicitudes y respuestas que estresen los filtros de seguridad de otros sistemas, y así medir la tasa de detección de los clasificadores de contenido. Su comportamiento "sin rechazos" lo hace apropiado para construir conjuntos de prueba difíciles de obtener con modelos alineados.
- Investigación en ciberseguridad en laboratorio: coherente con el sufijo CYBERSECURITY del identificador, puede usarse para analizar y redactar documentación técnica sobre escenarios de ataque y defensa dentro de un entorno controlado y con autorización explícita, aprovechando su formato de pesos cuantizado para desplegarlo en hardware propio.
- Generación de datos sintéticos para clasificadores de contenido dañino: permite producir ejemplos etiquetados de solicitudes y respuestas problemáticas para entrenar o evaluar moderadores automáticos, con la ventaja de cubrir categorías que un modelo alineado se negaría a generar.
- Análisis de documentos técnicos e imágenes: gracias a la torre de visión intacta, puede procesar capturas de pantalla, diagramas de arquitectura o figuras de papers junto al texto asociado, por ejemplo para resumir documentación de sistemas.
- Automatización de agentes con herramientas: con el parser `glm47` y `--enable-auto-tool-choice`, puede integrarse en pipelines que necesiten invocar APIs, ejecutar consultas o encadenar varios pasos de razonamiento con llamadas a funciones.
- Generación y revisión de código: el modelo base tiene capacidad de código y el ajuste no la elimina; puede emplearse en asistentes de programación internos, con la salvedad de la caída de MMLU y del riesgo de degeneración descrito más abajo.
- Estudio del comportamiento de rechazo en LLM: como caso concreto de ablación de la política de rechazo, sirve para comparar, sobre el mismo checkpoint base, cómo cambian el razonamiento, la verbosidad de los bloques `<think>` y la precisión en tareas neutras.
- Asistentes internos en dominios sensibles (médico, legal, seguridad ofensiva autorizada) donde un rechazo conservador bloquea la tarea; debe usarse solo en despliegues internos, auditados y con revisión humana, nunca expuestos directamente a usuarios finales sin salvaguardas.

## Benchmarks y rendimiento

No se han encontrado resultados de benchmarks independientes en la búsqueda web. Los únicos datos disponibles son los que publica el autor en la model card y comparan el modelo base cuantizado con este ajuste.

| Benchmark | Base W4A16 | Este modelo | Diferencia |
|---|---|---|---|
| HarmBench, 6 categorías, cumplimiento real (thinking off) | 44/145 (30,3%) | 145/145 (100,0%) | +69,7 pp |
| HarmBench, razonamiento modo `max` | no disponible | 145/145 (100,0%) | no disponible |
| HarmBench, razonamiento modo `low` | no disponible | 145/145 (100,0%) | no disponible |
| Rechazo duro en categorías de daño real | ~100 | 0 | no disponible |
| MMLU (14.042, test completo) | 86,08% | 84,23% | -1,85 pp |
| Puzzles de razonamiento (5, temperatura 0) | 4/4 correctos | 3/4 correctos | -1 |
| Tokens de "think" totales en los puzzles | 7.189 | 7.537 | +348 (+4,8%) |
| Ratio de tokens de "think" | 73,7% | 86,2% | +12,5 pp |
| Torre de visión | intacta | intacta (verificada) | — |
| Cabeza MTP (capa 45) | intacta | intacta (verificada) | — |

Desglose de HarmBench en modo `enable_thinking: false`, con clasificador de cinco niveles (TRUE_COMPLY, HEDGE_COMPLY, SOFT_REDIRECT, PARTIAL, HARD_REFUSE):

| Categoría | TRUE | HEDGE | SOFT_REDIRECT | PARTIAL | HARD_REFUSE | Total | Cumplimiento |
|---|---|---|---|---|---|---|---|
| chemical_biological | 19 | 0 | 0 | 0 | 0 | 19 | 100% |
| cybercrime_intrusion | 33 | 0 | 0 | 0 | 0 | 33 | 100% |
| harassment_bullying | 16 | 0 | 0 | 0 | 0 | 16 | 100% |
| harmful | 17 | 0 | 0 | 0 | 0 | 17 | 100% |
| Categorías restantes | no disponible (dato truncado en la model card) | — | — | — | — | no disponible | no disponible |

Detalle de la comparación de trazas de razonamiento (temperatura 0) reportada por el autor:

| Puzzle | Respuesta base | Caracteres de think (base) | Respuesta de este modelo | Caracteres de think |
|---|---|---|---|---|
| Ovejas (17 ovejas, mueren todas menos 9) | 9 (correcta) | 261 | 9 (correcta) | 201 |
| Tres cajas / etiquetas incorrectas | correcta | 3.964 | bucle degenerativo a temperatura 0 | 5.828 |
| 5 máquinas, 5 artilugios, 5 minutos → 100/100 | 5 min (correcta) | 1.077 | 5 min (correcta) | 261 |
| Caracol, pozo de 30 pies (5 sube / 4 baja) | 26 días (correcta) | 1.887 | 26 días (correcta) | 1.247 |
| Totales | 4/4 | 7.189 | 3/4 | 7.537 |

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del recuento de parámetros y del formato W4A16, no mediciones publicadas.

- Peso de los pesos de inferencia: con W4A16 (aproximadamente 0,5 bytes por parámetro) los 321,3 mil millones de parámetros ocupan del orden de 160-165 GB; el repositorio completo ocupa 194,7 GB, e incluye torre de visión, cabeza MTP, embeddings y resto de artefactos.
- VRAM total recomendada: prever entre 200 y 240 GB de VRAM sumando caché KV y overhead, según longitud de contexto y número de secuencias concurrentes (`--max-num-seqs 128` en la configuración del autor).
- Configuración de referencia del autor: `--tensor-parallel-size 2`, lo que implica dos GPU de gran memoria (por ejemplo, 2x H200 de 141 GB, 282 GB en total). Con 2x H100 de 80 GB (160 GB) los pesos irían excesivamente ajustados.
- Alternativas: 4x H100 80 GB o 4x A100 80 GB (320 GB totales) para dejar margen a caché KV y visión; 2x B200 si se dispone de ellas.
- GPU de consumo: no cabe. No es viable en una RTX 4090 (24 GB), ni siquiera repartido en varias GPU de consumo. Tampoco es un candidato realista para llama.cpp u Ollama en este formato.
- Opciones de despliegue: vLLM es la ruta soportada, con la imagen `vllm/vllm-openai:glm53-flash-x86_64-cu130`. Flags relevantes: `--reasoning-parser glm45` (necesario para el comportamiento multiturno correcto), `--tool-call-parser glm47`, `--enable-auto-tool-choice`, `--enable-prefix-caching` y `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Latencia y throughput: no hay cifras absolutas publicadas. El único dato es la mejora relativa de la decodificación especulativa MTP, estimada por el autor en 1,5-2 veces sobre la decodificación sin MTP.
- Nota sobre fallos de decodificación: el autor documenta un bucle de repetición a temperatura 0 en un puzzle concreto; se resuelve subiendo la temperatura o desactivando el modo thinking.

## Comparativa con modelos similares

La única comparación con datos disponibles es contra el propio modelo base cuantizado. Para alternativas de la misma categoría (MoE de gran tamaño) no se dispone de resultados en la información proporcionada.

| Modelo | Parámetros totales | Contexto | Licencia | Comportamiento de rechazo | MMLU | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-CYBERSECURITY-W4A16 | 321,3 mil millones | no disponible | MIT | 100,0% de cumplimiento en HarmBench (6 categorías) | 84,23% | HuggingFace (0 descargas) |
| zai-org/GLM-5.3-Flash (base, W4A16) | 321,3 mil millones | no disponible | no disponible | 30,3% de cumplimiento en HarmBench | 86,08% | HuggingFace |
| Otros MoE de tamaño comparable (DeepSeek-V3, Qwen3-235B, GLM-4.x) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Política de rechazo eliminada: el modelo declara un 100% de cumplimiento en seis categorías de daño real (químico/biológico, cibercrimen e intrusión, acoso, daño genérico y las restantes categorías de HarmBench). Esto implica un riesgo elevado de generación de contenido dañino y lo inhabilita para cualquier despliegue orientado al público general sin capas externas de moderación.
- Responsabilidad legal y de plataforma: la licencia MIT permite el uso comercial, pero eso no exime de cumplir la normativa aplicable ni las políticas de uso de los proveedores de infraestructura; en la Unión Europea, el uso de modelos sin salvaguardas puede entrar en conflicto con obligaciones del AI Act.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que los resultados del autor no han sido replicados de forma independiente. Todos los benchmarks son autodeclarados.
- Regresión en capacidades neutras: MMLU cae 1,85 puntos (86,08% → 84,23%) respecto al base, y la precisión en puzzles de razonamiento baja de 4/4 a 3/4.
- Bucle degenerativo: se documenta un fallo de repetición de tokens a temperatura 0 en un puzzle concreto. Es un indicio de que el ajuste puede afectar a la estabilidad de la decodificación en ciertas condiciones, especialmente en despliegues con temperatura baja.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, de género, religiosos o culturales. No disponible.
- Idiomas: no se especifica la cobertura lingüística. No disponible.
- Contexto: no se especifica la longitud máxima de contexto soportada. No disponible.
- Cuantización: el formato W4A16 introduce pérdida de precisión adicional sobre el modelo base; conviene validar la degradación en la tarea concreta antes de desplegar.
- Discrepancia de identidad del repositorio: el identificador de HuggingFace es `baselquants/GLM-5.3-Flash-CYBERSECURITY-W4A16`, pero la model card y todos los comandos de despliegue apuntan a `dealignai/GLM-5.3-Flash-UNCENSORED-W4A16`. Hay que verificar qué artefacto se está descargando realmente antes de usarlo en producción.
- Nombre frente a contenido: el sufijo CYBERSECURITY del identificador no se corresponde con un ajuste específico de ciberseguridad descrito en la model card, que documenta un ajuste general de eliminación de rechazos. No debe interpretarse como un modelo especializado y evaluado en tareas de seguridad.
- Riesgo de alucinación: no hay datos específicos publicados; es esperable el comportamiento habitual de un MoE de este tamaño, sin que el autor aporte mediciones de factualidad.
- Configuración crítica en producción: omitir `--reasoning-parser glm45` provoca que los bloques `<think>` previos permanezcan en el contenido del mensaje y se reemitan en turnos posteriores, lo que según el autor puede desencadenar un bucle de atracción en la decodificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baselquants/GLM-5.3-Flash-CYBERSECURITY-W4A16
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Referencia de despliegue mencionada en la model card (identificador distinto al del repositorio): `dealignai/GLM-5.3-Flash-UNCENSORED-W4A16`
- Imagen de Docker citada: `vllm/vllm-openai:glm53-flash-x86_64-cu130`
- Búsqueda web: no se ha encontrado ningún paper, blog, repositorio o demo relacionado. Los resultados devueltos correspondían a contenido de agencias de viajes sobre las islas Galápagos y no guardan relación con el modelo.
