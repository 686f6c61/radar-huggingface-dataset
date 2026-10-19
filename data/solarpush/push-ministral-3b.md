# solarpush/push-ministral-3b

## Resumen

`push_ministral:3b` es un modelo de decisión estructurada publicado por el usuario `solarpush` en HuggingFace, construido como adaptación del modelo instructivo `mistralai/Ministral-3-3B-Instruct-2512`. No es un modelo conversacional al uso: la versión publicada sustituye la cabeza de salida original por una cabeza no atada (untied output head) más un puntero de opciones basado en kernel Fisher ARD, calibrada dentro de la especificación propietaria `llm-logits-v1` de Ollaya. El resultado es un clasificador de opciones discretas que devuelve logits puntuados, no texto libre.

El paquete se distribuye en formato GGUF Q4_K_M (2,31 GiB) con la matriz `output.weight` en Q6_K, e incluye además los ficheros `decision.json`, `calibration.json` y `ollaya_config.json` que describen la tarea y el runtime. Su atractivo principal es la relación coste/prestación: con 52 ms de latencia p50 en una RX 9070 XT y un 37 % del tamaño del baseline `winnow:e4b` (6,20 GiB), consigue ventajas en subconjuntos concretos como `civil_comments` (86,0 % frente a 78,0 %) o `pubmedqa` (68,0 % frente a 62,0 %).

Ahora bien, en la métrica agregada queda por debajo: 66,9 % de macro accuracy y 48,8 de Public Skill frente a 72,2 % y 56,8 del baseline, y con peor calibración (ECE agrupado 0,124 frente a 0,083). El repositorio es muy reciente (creado el 18 de octubre de 2026), no tiene descargas ni likes, y no documenta idiomas, contexto ni detalles del entrenamiento, por lo que debe tratarse como un artefacto experimental a validar antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Ministral-3-3B-Instruct-2512, con cabeza de salida no atada y cabeza de puntero de opciones (Trainaya) |
| Parámetros totales | 3.831.659.520 (3,83 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M en los pesos principales; Q6_K (`ttype=14`) en `output.weight` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF (`model.gguf`) + JSON auxiliares (`decision.json`, `calibration.json`, `ollaya_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Ministral (3B instructivos) y conserva el cuerpo del modelo base, pero modifica la parte final: la cabeza de salida queda desacoplada (untied) y se calibra en Q6_K, y sobre ella se añade una base de plantillas duales biortogonales (`U` / `U_s`) junto con una cabeza de puntero de opciones basada en un kernel Fisher ARD. Este esquema convierte la generación token a token en una puntuación directa sobre un conjunto finito de opciones, que es lo que la especificación `llm-logits-v1` consume para emitir decisiones (`Choice`, `Noul`, `Score`).

No se dispone de información sobre el volumen de tokens de adaptación, la composición del dataset ni si se aplicaron etapas de RLHF o DPO durante el ajuste. La adaptación se realizó con la herramienta Trainaya del ecosistema Ollaya, según indica la model card, y el resultado se empaqueta para el runtime de Ollaya y para Ollama. El vector de escalado por tarea incluido en `calibration.json` es `[1.0, 1.0, 1.0]`, lo que implica que en la práctica no se aplica un ajuste de temperatura adicional sobre los logits.

## Capacidades

- Decisión estructurada sobre opciones discretas: selección de una alternativa entre varias y emisión de una puntuación de confianza asociada.
- Salidas en tres modalidades dentro de `llm-logits-v1`: `Choice` (elección entre opciones), `Noul` (abstención / no respuesta) y `Score` (puntuación numérica).
- Calibración de probabilidades por tarea, con ECE reportado de 0,124 agrupado y 0,164 macro.
- Evaluación multi-tarea: el benchmark público cubre 13 subconjuntos, entre ellos `civil_comments`, `pubmedqa`, `summeval-consistency` y `squad2`.
- Inferencia de baja latencia: 52 ms p50 en RX 9070 XT, gracias al tamaño reducido del paquete (2,31 GiB).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y despliegue vía Ollaya/Ollama con `trainaya register --runtime both`.
- Generación de texto libre: no documentada en la ficha; la cabeza adaptada está orientada a puntuar opciones, no a decodificar texto abierto.
- Tool calling / function calling y razonamiento multi-paso: no documentados para esta variante adaptada.

## Casos de uso

- Moderación de comentarios en plataformas: el modelo obtiene 86,0 % en `civil_comments` con un ECE de 0,074, por lo que puede clasificar toxicidad o civismo por comentario con una confianza razonablemente ajustada y a 52 ms por decisión.
- Triaje de evidencia biomédica: con 68,0 % en `pubmedqa` y ECE 0,136, sirve como primer filtro para decidir si un fragmento responde a una pregunta clínica antes de escalar a un modelo mayor.
- Control de consistencia en resúmenes automáticos: 78,0 % en `summeval-consistency` lo hace útil como verificador de que un resumen generado no contradice el documento fuente en pipelines de generación aumentada.
- Verificación de respuestas sobre contexto: 64,0 % en `squad2`, aprovechable para descartar respuestas no soportadas por el pasaje antes de mostrarlas al usuario.
- Enrutado de decisiones en agentes: al devolver logits sobre opciones, encaja como selector de herramienta o de siguiente acción en un bucle de agente, con umbrales de abstención vía la clase `Noul` cuando la confianza es baja.
- Guardarraíl económico en producción: 2,31 GiB y 52 ms permiten ejecutarlo en paralelo a un modelo grande como prefiltro que solo escale los casos ambiguos, reduciendo coste por petición.
- Etiquetado y anotación semiautomática: útil para preetiquetar grandes volúmenes de pares pregunta/respuesta, con revisión humana centrada en los casos de baja confianza.
- Puntuación automática de pares en evaluación de LLM: la modalidad `Score` permite puntuar respuestas, aunque con la cautela de que es la tarea más floja del conjunto (55,3 % de accuracy).

## Benchmarks y rendimiento

Resultados publicados en el Ollaya Public Decision Benchmark (`bench.ollaya.dev`, 13 subconjuntos):

| Métrica | `push_ministral:3b` (2,31 GiB) | `winnow:e4b` (6,20 GiB) |
|---|---|---|
| Macro accuracy | 66,9 % | 72,2 % |
| Public Skill (0–100) | 48,8 | 56,8 |
| Accuracy `Choice` | 68,8 % | 76,8 % |
| Accuracy `Noul` | 72,0 % | 76,0 % |
| Accuracy `Score` | 55,3 % | 58,0 % |
| ECE agrupado (menor es mejor) | 0,124 | 0,083 |
| ECE macro (menor es mejor) | 0,164 | 0,133 |
| Latencia p50 (RX 9070 XT) | 52 ms | 113 ms |

Subconjuntos con victoria o empate frente a `winnow:e4b`:

| Subconjunto | `push_ministral:3b` | `winnow:e4b` | Delta |
|---|---|---|---|
| `civil_comments` | 86,0 % (ECE 0,074) | 78,0 % | +8,0 |
| `pubmedqa` | 68,0 % (ECE 0,136) | 62,0 % | +6,0 |
| `summeval-consistency` | 78,0 % | 76,0 % | +2,0 |
| `squad2` | 64,0 % | 64,0 % | 0,0 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni en benchmarks estándar de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 2,5–4 GB en inferencia con Q4_K_M, sumando pesos (2,31 GiB) y caché KV; el tamaño exacto depende del contexto configurado, que no se documenta.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 4060, RX 6600) debería poder cargarlo; con 6–8 GB se dispone de margen para lotes mayores.
- GPU de referencia en las mediciones: AMD RX 9070 XT, con 52 ms p50 por decisión.
- GPU de datacenter (A100, H100) no aportan ventaja significativa por tamaño; su interés sería el batching masivo, no la latencia individual.
- Despliegue: Ollama y runtime Ollaya mediante `trainaya register --name push_ministral:3b --path . --runtime both`; al ser GGUF también es compatible con llama.cpp. Soporte en vLLM o TGI no está documentado para esta cabeza de decisión.
- Throughput: no disponible; solo se publica latencia p50. Como referencia relativa, es 2,2 veces más rápido que el baseline `winnow:e4b` en la misma GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro accuracy (Ollaya) | Licencia | Formato |
|---|---|---|---|---|---|
| `push_ministral:3b` | 3,83 B | No disponible | 66,9 % | Apache 2.0 | GGUF Q4_K_M (2,31 GiB) |
| `winnow:e4b` (baseline) | No disponible | No disponible | 72,2 % | No disponible | No disponible (6,20 GiB) |
| `Ministral-3-3B-Instruct-2512` (base) | ~3,8 B (clase 3B) | No disponible | No evaluado en Ollaya | No disponible (verificar términos de Mistral) | Safetensors originales |

El único comparador directo con datos es `winnow:e4b`, que gana en agregado pero pierde en `civil_comments` y `pubmedqa` a costa de casi triplicar el tamaño del paquete. Frente al modelo base, la comparación no es de rendimiento sino de propósito: la variante de `solarpush` está especializada en decisión con logits, mientras que el original es un instructivo generalista.

## Limitaciones y advertencias

- Menor precisión agregada que el baseline: 66,9 % frente a 72,2 % de macro accuracy y 48,8 frente a 56,8 de Public Skill, pese a la ventaja en subconjuntos concretos.
- Peor calibración de lo que sugiere la etiqueta "calibrated": ECE agrupado 0,124 y macro 0,164, frente a 0,083 y 0,133 del baseline.
- El vector de calibración incluido es `[1.0, 1.0, 1.0]`, es decir, no aplica escalado de temperatura efectivo; las probabilidades dependen del ajuste interno de la cabeza.
- La tarea `Score` es claramente la más débil (55,3 %), por lo que no es recomendable para puntuaciones finas sin validación propia.
- Repositorio sin tracción: 0 descargas y 0 likes, creado el 18 de octubre de 2026, sin validación comunitaria ni informes independientes.
- Idiomas soportados no documentados; el comportamiento multilingüe heredado del modelo base no está verificado para esta cabeza adaptada.
- Longitud de contexto no documentada, lo que impide planificar escenarios de contexto largo.
- Licencia Apache 2.0 declarada por el autor, pero al derivar de un modelo de Mistral conviene revisar los términos aplicables al modelo base antes de un uso comercial.
- El tag `conversational` puede inducir a error: la cabeza está adaptada para emitir decisiones sobre opciones, no texto libre; no debe asumirse comportamiento de chat estándar.
- Riesgo de sesgo y alucinación heredado del modelo base, no evaluado en esta ficha; el buen resultado en `civil_comments` puede reflejar particularidades del conjunto de datos más que una robustez general.
- Los benchmarks provienen del propio ecosistema Ollaya (13 subconjuntos), sin contraste con evaluaciones externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/solarpush/push-ministral-3b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Repositorio de Trainaya: https://github.com/ollaya/trainaya
- Benchmark público de Ollaya: https://bench.ollaya.dev
