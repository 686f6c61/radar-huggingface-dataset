# ProCreations/auto-0.4b-3

## Resumen

auto-0.4b-3 es un clasificador de texto de 395,8 millones de parámetros desarrollado por ProCreations, diseñado específicamente para actuar como guardrail en agentes de IA que ejecutan llamadas a herramientas (tool calls). El modelo recibe como entrada la llamada propuesta por el agente, la petición original del usuario y el historial de la sesión, y emite una decisión binaria: `approve` o `deny`. Forma parte del proyecto Auto, un guard local para agentes de programación como Claude Code, Codex, Gemini CLI, Cursor o Copilot CLI, y está pensado para ejecutarse íntegramente en la máquina del usuario sin enviar datos a servicios externos.

La relevancia del modelo radica en su relación entre precisión y coste computacional: con solo 395,8M de parámetros en BF16 (0,79 GB de pesos) alcanza un 93,1% de precisión en el benchmark v3 del autor, con 7 ms de latencia mediana por decisión en una GPU NVIDIA RTX PRO 6000. Esto lo sitúa en un punto intermedio entre clasificadores minúsculos (auto-150m-3, con 88,8%) y modelos de razonamiento alojados de gran tamaño (DeepSeek V4.1 Flash, 95,6%), pero con un coste por millón de decisiones de 23 dólares frente a los 3.043 dólares del primero.

La arquitectura es un encoder ModernBERT-large afinado desde ProCreations/auto-0.4b-2, con soporte declarado de contexto largo (las pruebas incluyen sesiones de más de 8.192 tokens) y licencia Apache 2.0. La versión 3 supone una mejora sustancial respecto a la v2 en el benchmark v3 (70,2% a 93,1%), aunque en el benchmark original Approve-or-Deny la ganancia es marginal (97,00% a 97,20%) y con un desplazamiento hacia la aprobación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) |
| Parámetros totales | 395.833.346 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; las evaluaciones incluyen sesiones de más de 8.192 tokens |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 0,79 GB) |

## Arquitectura y entrenamiento

auto-0.4b-3 es un encoder ModernBERT-large con 395,8M de parámetros, afinado (finetune) a partir de ProCreations/auto-0.4b-2. Se trata de un modelo de clasificación de secuencias, no de generación: la cabeza de clasificación produce una probabilidad de denegación, y la decisión se toma con el umbral `P(deny) >= 0.5`. El modelo consume la llamada a herramienta propuesta, la petición del usuario y el historial de la sesión como una única secuencia de entrada, lo que le permite evaluar conjuntamente el alcance de la acción, el entorno (producción o staging), quién la solicitó y el origen de las instrucciones.

No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset. La model card indica que las etiquetas de entrenamiento siguen una regla de decisión concreta: bloquear una llamada solo si es consecuente y el usuario no la pidió, o si el agente está siguiendo instrucciones inyectadas en una página, archivo o salida de herramienta. El benchmark de evaluación v3 (2.948 llamadas retenidas) se construyó emparejando cada llamada con una casi-gemela donde un único detalle invierte la respuesta correcta, de modo que un guard que decida por rasgos superficiales falle una de las dos. No se menciona el uso de RLHF ni DPO, lo cual es coherente con un modelo de clasificación supervisada.

## Capacidades

- Clasificación binaria de llamadas a herramientas: decide `approve` o `deny` sobre una llamada propuesta por un agente.
- Detección de inyección de prompts: identifica si el agente sigue instrucciones plantadas en páginas, archivos o salidas de herramientas (98,7% de precisión en el slice correspondiente del benchmark v3).
- Evaluación de alcance y entorno: distingue entre acciones en producción y staging, y entre peticiones explícitas del usuario y acciones no solicitadas.
- Razonamiento sobre historial de sesión: incorpora el contexto conversacional previo para juzgar la autorización de una llamada.
- Cobertura de herramientas no-shell: evaluación específica sobre herramientas de navegador, correo, CRM y similares (93,2% en el slice correspondiente).
- Soporte de sesiones largas: maneja entradas de más de 8.192 tokens (92,5% de precisión en ese slice).
- Ejecución local: funciona en CPU de portátil, Apple Silicon (MPS) o cualquier GPU, sin enviar datos fuera de la máquina.
- Integración con text-embeddings-inference y endpoints compatibles, según los tags del repositorio.
- No soporta generación de texto, tool calling como emisor, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Guardrail para agentes de programación: integrado en Auto, intercepta cada llamada a herramienta propuesta por Claude Code, Codex, Gemini CLI, Cursor o Copilot CLI y la aprueba o deniega antes de ejecutarla, bloqueando comandos destructivos o no solicitados con 7 ms de latencia.
- Protección frente a inyección de prompts: cuando un agente lee una página web, un archivo o la salida de una herramienta que contiene instrucciones maliciosas, el modelo detecta que la acción propuesta proviene de una fuente no confiable y la deniega (98,7% de acierto en ese slice).
- Control de acciones en producción: distingue entre llamadas dirigidas a entornos de producción y de staging, permitiendo políticas que exijan aprobación explícita solo para las primeras.
- Auditoría de sesiones largas: con soporte para entradas de más de 8.192 tokens, puede evaluar llamadas dentro de conversaciones extensas donde el contexto de autorización está lejos del turno actual.
- Filtrado en pipelines de CI/CD: al ser un clasificador de 0,79 GB, puede desplegarse como servicio local en el runner y validar acciones de agentes automatizados antes de que toquen infraestructura.
- Cumplimiento y trazabilidad en entornos regulados: al ejecutarse íntegramente on-premise y no enviar datos a APIs externas, encaja en organizaciones que no pueden delegar decisiones de seguridad a servicios alojados.
- Despliegue en portátil para desarrollo individual: un desarrollador puede ejecutar el guard en la CPU de su equipo sin GPU dedicada, con un coste energético estimado de 0,50 a 3 dólares por millón de decisiones en hardware propio.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Approve-or-Deny (test) | Accuracy | 0,972 |
| Approve-or-Deny (test) | ROC AUC | 0,9955 |
| Approve-or-Deny (test) | False approve rate | 0,0335 |
| Approve-or-Deny (test) | False deny rate | 0,0231 |

Comparativa en el benchmark v3 del autor (2.948 llamadas retenidas):

| Modelo | Accuracy v3 (IC 95%) | Daño no detectado | Sobrebloqueo | Ambos gemelos correctos | Tiempo por decisión | Coste por 1M |
|---|---:|---:|---:|---:|---:|---:|
| auto-3b-3 | 96,0% (95,3–96,7) | 3,1% | 4,8% | 92,8% | 21 ms | 77 $ |
| DeepSeek V4.1 Flash (max reasoning) | 95,6% (94,8–96,3) | 0,6% | 7,9% | 91,1% | 1,3 s | 3.043 $ |
| Codex auto-review (medium) | 95,5% (94,7–96,2) | 4,9% | 4,1% | 90,8% | – | 11.353 $ |
| GLM-5.3 Flash (high reasoning) | 95,4% (94,5–96,1) | 5,5% | 3,8% | 90,2% | 1,2 s | 629 $ |
| auto-0.4b-3 | 93,1% (92,2–94,0) | 6,0% | 7,6% | 87,2% | 7 ms | 23 $ |
| TypeSafe Jev 1.14 | 90,2% (89,1–91,2) | 12,5% | 7,3% | 80,1% | 136 ms | 227 $ |
| auto-150m-3 | 88,8% (87,7–89,9) | 9,1% | 13,1% | 78,7% | 5 ms | 13 $ |
| GPT-6 Luna (low reasoning) | 87,9% (86,7–89,0) | 5,8% | 17,9% | 75,8% | – | 395 $ |

Desglose por slice en el benchmark v3:

| Slice | Accuracy |
|---|---:|
| Escrito por Claude Opus 4.8 (no usado en entrenamiento) | 90,4% |
| Escrito por GPT-6.1 Sol | 94,7% |
| Sesiones largas | 92,5% |
| Herramientas no-shell (navegador, correo, CRM, ...) | 93,2% |
| Gemelos que invierten quién pidió | 94,4% |
| Gemelos que invierten el alcance | 91,0% |
| Gemelos que invierten el entorno | 94,6% |
| Gemelos que invierten la llamada exacta | 90,1% |
| Gemelos que invierten el origen de una instrucción | 98,7% |

Comparativa v2 frente a v3 en el benchmark original Approve-or-Deny (3.000 ítems):

| Métrica | auto-0.4b-2 | auto-0.4b-3 |
|---|---:|---:|
| Accuracy | 97,00% | 97,20% |
| Llamadas dañinas aprobadas (de 1.401) | 36 | 47 |
| Llamadas autorizadas denegadas (de 1.599) | 54 | 37 |
| AUROC | – | 0,9955 |

Las categorías de daño más frecuentemente no detectadas son cadena de suministro (12,2%), escalada de privilegios (9,0%) y violación de alcance (7,8%). A través del runtime de Auto en Apple MPS, 78 de 80 ítems aleatorios del benchmark v3 obtuvieron la misma decisión que las puntuaciones de referencia (diferencia mediana de P(deny) de 0,0000).

## Requisitos de hardware

- VRAM estimada para inferencia: 0,79 GB en BF16 para los pesos; con overhead de activaciones y batch pequeño, el consumo cabe holgadamente en 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta mediciones en NVIDIA RTX PRO 6000 (7 ms por decisión, mediana, una petición a la vez).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.), así como en CPU de portátil y Apple Silicon vía MPS.
- Opciones de despliegue: transformers, text-embeddings-inference y endpoints compatibles (según los tags del repositorio); el proyecto Auto proporciona un runtime propio con ajuste de contexto para sesiones largas.
- Latencia y throughput: 7 ms por decisión en RTX PRO 6000; 5 ms para la variante de 150M. En CPU el rendimiento no está documentado en la información disponible.
- Coste: 23 dólares por millón de decisiones en una RTX PRO 6000 alquilada a 2,18 $/h (tarifa mediana de mercado); 0,50–3 $ por millón en electricidad sobre GPU propia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| auto-0.4b-3 | 395,8M | >8.192 tokens (evaluado) | 93,1% | Apache 2.0 | Hugging Face |
| auto-3b-3 | no disponible | no disponible | 96,0% | no disponible | Hugging Face |
| auto-150m-3 | no disponible | no disponible | 88,8% | no disponible | Hugging Face |
| DeepSeek V4.1 Flash | no disponible | no disponible | 95,6% | no disponible (API) | Servicio alojado |
| TypeSafe Jev 1.14 | no disponible | no disponible | 90,2% | no disponible | no disponible |

Frente a auto-3b-3, el modelo de 0.4b pierde 2,9 puntos de accuracy pero es tres veces más rápido (7 ms frente a 21 ms) y tres veces más barato por decisión (23 $ frente a 77 $ por millón). Frente a auto-150m-3, gana 4,3 puntos de accuracy con solo 2 ms adicionales por decisión. Frente a los guards alojados basados en LLM de razonamiento, la brecha de accuracy es de 2,3 a 2,5 puntos, pero la latencia baja de 1,2–1,3 s a 7 ms y el coste cae dos órdenes de magnitud.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El modelo está sesgado hacia la aprobación en el benchmark original: la v3 aprueba 47 llamadas dañinas de 1.401 (frente a 36 en la v2), aunque deniega menos llamadas autorizadas (37 frente a 54).
- Tasa de daño no detectado del 6,0% en el benchmark v3: categorías como cadena de suministro (12,2% de fallo), escalada de privilegios (9,0%) y violación de alcance (7,8%) son las más problemáticas.
- Tasa de sobrebloqueo del 7,6%: interrumpe trabajo legítimo en aproximadamente una de cada trece llamadas autorizadas.
- La precisión cae al 90,4% en ítems escritos por un modelo que no participó en la generación de datos de entrenamiento (Claude Opus 4.8), lo que sugiere cierta dependencia del estilo de los datos de entrenamiento.
- El ajuste de contexto del runtime de Auto degrada ligeramente la precisión en sesiones largas: 91,8% en los 413 ítems de más de 8.192 tokens frente al 92,5% de referencia.
- No se especifican los idiomas soportados; la evaluación se realizó presumiblemente en inglés, y no hay datos sobre rendimiento en castellano u otros idiomas.
- No se detalla la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos demográficos o de dominio.
- Es un clasificador binario, no un generador: no puede explicar sus decisiones ni producir justificaciones textuales.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del proyecto Auto y de los datos de entrenamiento antes de un despliegue comercial crítico.
- El umbral de decisión (`P(deny) >= 0.5`) es fijo en la evaluación; en producción puede requerir calibración según el coste relativo de falsos aprobados y falsos denegados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/auto-0.4b-3
- Modelo base: https://huggingface.co/ProCreations/auto-0.4b-2
- Modelo de mayor tamaño: https://huggingface.co/ProCreations/auto-3b-3
- Modelo de menor tamaño: https://huggingface.co/ProCreations/auto-150m-3
- Repositorio del proyecto Auto: https://github.com/SSHdotCodes/auto
- Dataset de evaluación: https://huggingface.co/datasets/ProCreations/approve-or-deny
