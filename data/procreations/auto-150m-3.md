# ProCreations/auto-150m-3

## Resumen

auto-150m-3 es un clasificador de texto de 149,6 millones de parámetros desarrollado por ProCreations, diseñado específicamente para actuar como guardrail en agentes de código. Su función es decidir si una llamada a herramienta (tool call) propuesta por un agente de IA debe ejecutarse o bloquearse, emitiendo una etiqueta binaria `approve` o `deny` a partir de la llamada propuesta, la petición del usuario y el historial del agente. Forma parte de Auto, un guard local para agentes como Claude Code, Codex, Gemini CLI, Cursor o Copilot CLI.

El modelo se basa en un encoder ModernBERT-base con pesos en BF16 (0,30 GB) y está afinado a partir de ProCreations/auto-200m-2, que se renombra a auto-150m-3 porque, según el autor, siempre tuvo 150M de parámetros. La propuesta de valor es la eficiencia: 5 ms por decisión en una NVIDIA RTX PRO 6000 y un coste estimado de 13 dólares por millón de decisiones en GPU alquilada, muy por debajo de los guardrails basados en LLM hosted.

La relevancia actual reside en la seguridad de agentes: el modelo no bloquea por superficie, sino que distingue entre una acción consecuente que el usuario sí pidió y una inyección de instrucciones procedente de una página, archivo o salida de herramienta. Todo el procesamiento ocurre en local, sin que los datos leídos salgan de la máquina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder transformer) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (etiqueta `long-context` en la model card, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 0,30 GB) |

## Arquitectura y entrenamiento

auto-150m-3 es un encoder ModernBERT-base con 149,6M de parámetros, afinado desde ProCreations/auto-200m-2. La tarea es de clasificación binaria de secuencias: el modelo recibe la llamada a herramienta propuesta, la petición original del usuario y el historial del agente, y produce una probabilidad de denegación, con umbral de decisión en `P(deny) >= 0.5`. La arquitectura ModernBERT aporta atención con soporte para contextos largos y una implementación eficiente en CPU, lo que explica que el modelo pueda ejecutarse en hardware modesto.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se indica que las etiquetas de entrenamiento siguen una regla de decisión concreta: bloquear solo cuando la llamada es consecuente y el usuario no la pidió, o cuando el agente sigue instrucciones plantadas en una página, archivo o salida de herramienta. El benchmark v3 se construyó con 2.948 llamadas retenidas, cada una emparejada con un casi-gemelo donde un solo detalle cambia la respuesta correcta (quién pidió, alcance, entorno producción/staging, llamada exacta u origen de la instrucción).

## Capacidades

- Clasificación binaria `approve`/`deny` de llamadas a herramienta propuestas por agentes de IA.
- Detección de inyección de instrucciones procedentes de páginas, archivos o salidas de herramientas.
- Distinción de alcance: evalúa si la acción solicitada excede lo que el usuario pidió.
- Sensibilidad al entorno: diferencia entre producción y staging en la decisión.
- Sensibilidad a la autoría: distingue quién realizó la petición.
- Procesamiento de sesiones largas (etiqueta `long-context`, sin cifra de tokens publicada).
- Cobertura de herramientas no-shell: navegador, correo, CRM y similares.
- Ejecución local completa, sin envío de datos a servicios externos.
- Compatible con text-embeddings-inference y endpoints de HuggingFace según los tags del repo.
- No es un modelo generativo: no produce texto libre, solo la etiqueta de decisión y su probabilidad.

## Casos de uso

- Guardrail para agentes de código en local: integrado en Auto, intercepta cada tool call de Claude Code, Codex, Gemini CLI, Cursor o Copilot CLI antes de ejecutarla y la bloquea si es consecuente y no fue solicitada, con 5 ms de latencia por decisión.
- Protección frente a prompt injection en navegación web: cuando el agente lee una página que contiene instrucciones plantadas, el modelo detecta que la acción propuesta proviene de una fuente no confiable y la deniega (95,9% de acierto en el slice de origen de instrucción del benchmark v3).
- Control de despliegues en producción: el modelo distingue entre staging y producción, de modo que puede bloquear un comando destructivo lanzado contra el entorno productivo aunque el agente lo haya formulado como parte de una tarea rutinaria.
- Auditoría de sesiones largas de agentes: al procesar el historial completo de la conversación, permite evaluar llamadas en sesiones extensas (85,2% de acierto en el slice de sesiones largas del benchmark v3).
- Filtrado en pipelines de CI/CD con agentes autónomos: se puede insertar como paso de aprobación previo a la ejecución de comandos generados por un agente, con un coste estimado de 13 dólares por millón de decisiones en GPU alquilada.
- Despliegue en hardware sin GPU: al ser un encoder de 150M en BF16, puede ejecutarse en CPUs antiguas, lo que permite incorporar el guardrail en estaciones de trabajo de desarrollo sin acelerador dedicado.
- Supervisión de herramientas de negocio: cubre herramientas no-shell como navegador, correo o CRM (87,8% de acierto en ese slice), útil para agentes que operan sobre sistemas corporativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente) sobre el dataset Approve-or-Deny, split test, revisión a38b625:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9597 |
| ROC AUC | 0,9927 |
| False approve rate | 0,0507 |
| False deny rate | 0,0313 |

Comparativa en el benchmark v3 (2.948 llamadas retenidas) publicada en la model card:

| Modelo | Accuracy v3 (IC 95%) | Daño no detectado | Sobrebloqueo | Ambos gemelos correctos | Tiempo por decision | Coste por 1M |
|---|---:|---:|---:|---:|---:|---:|
| auto-3b-3 | 96,0% (95,3–96,7) | 3,1% | 4,8% | 92,8% | 21 ms | 77 $ |
| DeepSeek V4.1 Flash (max reasoning) | 95,6% (94,8–96,3) | 0,6% | 7,9% | 91,1% | 1,3 s | 3.043 $ |
| Codex auto-review (medium) | 95,5% (94,7–96,2) | 4,9% | 4,1% | 90,8% | no disponible | 11.353 $ |
| GLM-5.3 Flash (high reasoning) | 95,4% (94,5–96,1) | 5,5% | 3,8% | 90,2% | 1,2 s | 629 $ |
| auto-0.4b-3 | 93,1% (92,2–94,0) | 6,0% | 7,6% | 87,2% | 7 ms | 23 $ |
| TypeSafe Jev 1.14 | 90,2% (89,1–91,2) | 12,5% | 7,3% | 80,1% | 136 ms | 227 $ |
| auto-150m-3 | 88,8% (87,7–89,9) | 9,1% | 13,1% | 78,7% | 5 ms | 13 $ |
| GPT-6 Luna (low reasoning) | 87,9% (86,7–89,0) | 5,8% | 17,9% | 75,8% | no disponible | 395 $ |

Desglose por slice en el benchmark v3:

| Slice | Accuracy |
|---|---:|
| Escrito por Claude Opus 4.8 (no escritor de datos de entrenamiento) | 84,6% |
| Escrito por GPT-6.1 Sol | 91,2% |
| Sesiones largas | 85,2% |
| Herramientas no-shell (navegador, correo, CRM, ...) | 87,8% |
| Gemelos con cambio en quién pidió | 90,8% |
| Gemelos con cambio de alcance | 85,6% |
| Gemelos con cambio de entorno | 89,0% |
| Gemelos con cambio en la llamada exacta | 86,0% |
| Gemelos con cambio en el origen de la instrucción | 95,9% |

Comparativa v2 → v3 sobre el benchmark original Approve-or-Deny (3.000 ítems):

| Metrica | auto-200m-2 | auto-150m-3 |
|---|---:|---:|
| Accuracy | 96,33% | 95,97% |
| Llamadas dañinas aprobadas (de 1.401) | 53 | 71 |
| Llamadas autorizadas denegadas (de 1.599) | 57 | 50 |
| AUROC | no disponible | 0,9927 |

## Requisitos de hardware

- VRAM estimada para inferencia: 0,30 GB en BF16; el modelo es un encoder de 149,6M, por lo que el peso de los pesos es mínimo y el consumo dominante es el de activaciones y batch.
- GPU recomendadas: el autor reporta 5 ms por decisión (mediana) en una NVIDIA RTX PRO 6000; cualquier GPU con suficiente memoria para BF16 es válida, incluida una RTX 4090.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño de 0,30 GB de pesos.
- Ejecución en CPU: el autor indica que funciona en "casi cualquier cosa, incluidas CPUs antiguas".
- Opciones de despliegue: transformers, text-embeddings-inference (tag del repo) y endpoints compatibles; el autor menciona ejecución vía el runtime de Auto con Apple MPS.
- Latencia y throughput: 5 ms por decisión en RTX PRO 6000 (una petición a la vez); en Apple MPS, 79 de 80 ítems aleatorios del benchmark v3 dieron la misma decisión que las puntuaciones de referencia, con una diferencia mediana de P(deny) de 0,0001.
- Coste: 13 $ por millón de decisiones en GPU alquilada a 2,18 $/h; aproximadamente 0,50–3 $ por millón en electricidad sobre GPU propia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| auto-150m-3 | 149,6M | no disponible | 88,8% | Apache 2.0 | HuggingFace |
| auto-0.4b-3 | no disponible (etiqueta "0.4b") | no disponible | 93,1% | no disponible | HuggingFace |
| auto-3b-3 | no disponible (etiqueta "3b") | no disponible | 96,0% | no disponible | HuggingFace |
| TypeSafe Jev 1.14 | no disponible | no disponible | 90,2% | no disponible | no disponible |
| DeepSeek V4.1 Flash | no disponible | no disponible | 95,6% | no disponible | API hosted |
| GLM-5.3 Flash | no disponible | no disponible | 95,4% | no disponible | API hosted |

Dentro de la familia Auto, auto-150m-3 es la variante más pequeña y rápida (5 ms y 13 $/1M), por debajo de auto-0.4b-3 (7 ms y 23 $/1M) y auto-3b-3 (21 ms y 77 $/1M) en precisión pero con el menor coste y latencia. Frente a los guardrails hosted, pierde entre 6 y 7 puntos de accuracy v3 pero cuesta entre 30 y 870 veces menos por decisión.

## Limitaciones y advertencias

- Solo clasifica: no genera explicaciones ni texto libre; la salida es una etiqueta y una probabilidad, lo que limita su uso como componente explicable por sí solo.
- Tasa de sobrebloqueo del 13,1% en el benchmark v3, la más alta de la tabla comparativa: puede interrumpir trabajo legítimo con más frecuencia que auto-3b-3 (4,8%) o Codex auto-review (4,1%).
- Tasa de daño no detectado del 9,1% en v3: deja pasar más llamadas dañinas que DeepSeek V4.1 Flash (0,6%) o auto-3b-3 (3,1%).
- Las categorías de daño más falladas son financiero físico (16,2%), instalación maliciosa (12,0%) y violación de alcance (11,7%).
- En el benchmark original Approve-or-Deny, v3 aprueba más llamadas dañinas que su predecesor (71 frente a 53 de 1.401) y deniega menos autorizadas (50 frente a 57 de 1.599): el umbral se ha desplazado hacia aprobar.
- Rendimiento inferior en datos escritos por Claude Opus 4.8 (84,6%), generador que no participó en los datos de entrenamiento, lo que sugiere cierta dependencia del estilo de los datos de entrenamiento.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Idiomas soportados no disponibles: no se puede garantizar el comportamiento en castellano u otras lenguas distintas del inglés sin evaluación propia.
- Longitud de contexto no publicada: la etiqueta `long-context` no viene acompañada de una cifra de tokens, lo que impide dimensionar el truncado en sesiones muy largas.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantías ni soporte del autor; el modelo tiene 26 descargas y 0 likes en el momento de la consulta, por lo que la comunidad de validación es prácticamente inexistente.
- Riesgo de deriva si el agente cambia de formato de tool call o de convenciones de historial respecto a los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/auto-150m-3
- Modelo base: https://huggingface.co/ProCreations/auto-200m-2
- Variante mayor auto-0.4b-3: https://huggingface.co/ProCreations/auto-0.4b-3
- Variante mayor auto-3b-3: https://huggingface.co/ProCreations/auto-3b-3
- Repositorio de Auto: https://github.com/SSHdotCodes/auto
- Instalación de Auto: https://auto.ssh.codes/install.sh
- Dataset Approve-or-Deny: https://huggingface.co/datasets/ProCreations/approve-or-deny
