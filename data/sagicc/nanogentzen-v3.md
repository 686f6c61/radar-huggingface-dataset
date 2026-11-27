# Sagicc/nanoGentzen-v3

## Resumen

nanoGentzen-v3 es un motor de decisión formal neuro-simbólico de 4,89 millones de parámetros desarrollado por Sagicc. Combina un transformer bidireccional con RoPE (policy-value) con el cálculo de secuentes intuicionista LJ de Gentzen (1935) y la búsqueda de pruebas sin contracción G4ip de Dyckhoff (1992). Su propósito es emitir decisiones certificadas y matemáticamente explicables sobre estados JSON arbitrarios, predicados numéricos o regex, políticas en lenguaje natural y criterios de rúbrica, sin alucinación.

El modelo clasifica secuentes en tres clases epistémicas según la semántica de Kripke (1965): `PROVEN_FALSE` (0,0), `INTUITIONISTIC_UNDECIDED` (0,5) y `PROVEN_TRUE` (1,0). Además, serializa términos lambda tipados según Curry-Howard como certificados verificables de una línea, isomorfos al árbol de prueba. Se distribuye bajo licencia MIT, con pesos en safetensors y pipeline de `text-classification`.

Es relevante porque demuestra que un modelo de menos de 5M de parámetros puede superar en tareas de decisión tipada a modelos de hasta 35B, según los datos del autor, gracias a la verificación deductiva en un segundo sistema. Está en fase de desarrollo y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con RoPE (policy-value) + motor deductivo G4ip/LJ |
| Parámetros totales | 4.890.659 (4,89M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es híbrida neuro-simbólica de dos sistemas. El Sistema 1 es un transformer bidireccional con RoPE que actúa como policy-value y realiza una pasada neural epistémica rápida (~778 decisiones/s, < 1,3 ms de latencia). El Sistema 2 añade búsqueda deductiva de pruebas con verificación estricta G4ip de Dyckhoff y calibración posterior a la verificación (~204 decisiones/s en evaluación completa). La valoración epistémica sigue la semántica de Kripke de tres clases y el seguimiento de testigos de relevancia intuicionista (IR) aísla las premisas causalmente ejercidas en la derivación frente a hechos distractores.

El entrenamiento se apoya en el dataset `Sagicc/Gentzen-Kripke-240K`, propiedad del autor. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es la serialización Curry-Howard de términos lambda tipados como certificados verificables, isomorfos al DAG del árbol de prueba, junto con la doble API (decisión verificada y compuerta epistémica rápida).

## Capacidades

- Clasificación de secuentes en tres clases epistémicas (`PROVEN_FALSE`, `INTUITIONISTIC_UNDECIDED`, `PROVEN_TRUE`) en menos de 1,5 ms según el autor.
- Decisión sobre estados JSON arbitrarios con predicados numéricos y regex.
- Evaluación de políticas en lenguaje natural y criterios de rúbrica.
- Seguimiento de relevancia intuicionista (IR): separa premisas causales de hechos distractores.
- Serialización de certificados matemáticos Curry-Howard de una línea, verificables.
- Búsqueda de pruebas intuicionista sin contracción (G4ip) con contraejemplos de Kripke.
- Doble modo de ejecución: Sistema 1 (pasada neural rápida) y Sistema 2 (prueba deductiva completa).
- Cumplimiento declarado con los 137 benchmarks de `S1MB-english-v1`.
- Soporte multilingüe: solo inglés declarado.
- No se documentan tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Procesamiento de facturas: el modelo decide sobre estados JSON de facturas con predicados numéricos y criterios de rúbrica; el flujo `invoice_processing` alcanza 0,86 de precisión global según el autor, lo que lo hace adecuado para validación automatizada con certificado de decisión.
- Triaje de incidentes de seguridad: clasifica y puntúa incidentes según políticas definidas, con 0,734 de precisión global y 0,97 de acierto dentro de ±1 en la puntuación, útil para priorización auditable.
- Observabilidad de trazas de agentes: evalúa trazas multi-paso de agentes y emite decisiones certificadas (0,726 de precisión global, 0,99 dentro de ±1 en puntuación), integrable en pipelines de monitorización.
- Atención al cliente automatizada: aplica políticas de negocio en lenguaje natural a conversaciones o tickets, con 0,75 de precisión global y 0,97 dentro de ±1 en puntuación; la ventana de contexto no está documentada, por lo que la gestión multi-turno larga no puede confirmarse.
- Verificación formal en CI/CD: la API `POST /v1/decide` devuelve árboles de prueba y términos Curry-Howard que pueden validarse automáticamente en pipelines como condición de aceptación.
- Gate epistémico de bajo coste: la API `POST /v1/systemone` (~778 decisiones/s) sirve como filtro previo para descartar casos triviales antes de invocar la verificación completa del Sistema 2.
- Cumplimiento normativo y auditoría: los certificados Curry-Howard y los contraejemplos de Kripke proporcionan trazabilidad matemática de cada decisión, adecuada para entornos que exigen explicabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `S1MB english-v1` (137 benchmarks, 26.269 decisiones):

| Ámbito | Task Avg | Choice | Noul | Score | Generalization Choice | Decisiones/s |
|---|---|---|---|---|---|---|
| Sistema 2 (motor completo) | 4,42 | 8,63 | 2,12 | 2,50 | 30,06 | ~204 |
| Sistema 1 (pasada neural) | 4,24 | 8,63 | 2,12 | 1,97 | 30,06 | ~778 |

Resultados declarados sobre `LocalLLaMA/typed-decisions` (400 casos, 2.000 decisiones):

| Modelo | Tamaño | Accuracy | Noul | Choice | Score | Dentro de ±1 | MAE | KL | Brier | ECE | Latencia p50 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| nanoGentzen-v3 | 4,93M | 0,7675 | 0,8467 | 0,7533 | 0,7188 | 0,9638 | 0,3143 | 0,2065 | 0,0999 | 0,0728 | 18,27 ms |
| nanoGentzen-Jev-v3 | 4,93M | 0,7310 | 0,8283 | 0,6850 | 0,6925 | 0,9725 | 0,2843 | 0,1498 | 0,0809 | 0,0871 | 69,38 ms |
| nanoGentzen-v2 | 4,93M | 0,7245 | 0,8183 | 0,6767 | 0,6900 | 0,9713 | 0,3191 | 0,1639 | 0,0869 | 0,1268 | 43,65 ms |

Desglose por flujo (500 decisiones cada uno):

| Flujo | Accuracy | Noul | Choice | Score | Dentro de ±1 | KL | Brier | ECE |
|---|---|---|---|---|---|---|---|---|
| `invoice_processing` | 0,8600 | 0,9450 | 0,8000 | 0,8050 | 0,9250 | 0,2217 | 0,0999 | 0,0597 |
| `security_incidents` | 0,7340 | 0,7850 | 0,7600 | 0,6700 | 0,9700 | 0,1557 | 0,0796 | 0,0976 |
| `agent_trace_observability` | 0,7260 | 0,8400 | 0,7000 | 0,6950 | 0,9900 | 0,1626 | 0,0881 | 0,0929 |
| `customer_service` | 0,7500 | 0,7800 | 0,7800 | 0,7050 | 0,9700 | 0,2858 | 0,1321 | 0,1097 |

El autor declara que el modelo supera a `CLM-v0.1-8B` (7,6B, Score 1,19), `JevK5-Lite` (437M, 1,57), `Verdict ModernBERT` (151M, 1,57), `LFM2.5-350M-RLCD` (354M, 1,26) y `gliner2.5-small-v1` (74M, 0,86) en la tarea Score del leaderboard S1MB. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 4,89M de parámetros en fp32, los pesos ocupan aproximadamente 19,6 MB; en fp16, unos 9,8 MB. La VRAM total depende del runtime y del contexto, no documentado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB libres (RTX 3060, RTX 4090, etc.); también es viable en CPU.
- Opciones de despliegue: `transformers` con `AutoModel` y `custom_code`; servidor HTTP propio `jev_server.py` con endpoints `POST /v1/decide` y `POST /v1/systemone`. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput declarados: Sistema 1 ~778 decisiones/s (< 1,3 ms); Sistema 2 ~204 decisiones/s (10–25 ms por decisión vía API); latencia p50 de 18,27 ms en `typed-decisions`.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Accuracy en typed-decisions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanoGentzen-v3 | 4,89M | No disponible | 0,7675 | MIT | Hugging Face |
| nanoGentzen-Jev-v3 | 4,93M | No disponible | 0,7310 | MIT (según repo del autor) | Hugging Face |
| nanoGentzen-v2 | 4,93M | No disponible | 0,7245 | MIT (según repo del autor) | Hugging Face |
| Verdict ModernBERT | 151M | No disponible | Score S1MB 1,57 | No disponible | Leaderboard S1MB |
| JevK5-Lite | 437M | No disponible | Score S1MB 1,57 | No disponible | Leaderboard S1MB |
| CLM-v0.1-8B | 7,6B | No disponible | Score S1MB 1,19 | No disponible | Leaderboard S1MB |

Las cifras de los modelos comparables provienen del leaderboard S1MB citado por el autor; no se dispone de sus especificaciones completas ni de una evaluación independiente.

## Limitaciones y advertencias

- Modelo en fase de desarrollo según el propio autor; la API y los resultados pueden cambiar.
- Solo declara soporte para inglés; el comportamiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está disponible, lo que impide garantizar conversaciones o documentos largos.
- Riesgo de alucinación reducido por la verificación deductiva del Sistema 2, pero el Sistema 1 es una pasada neural sin verificación y puede producir clasificaciones epistémicas erróneas.
- Los benchmarks y comparativas proceden exclusivamente del autor; no hay validación independiente en la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineación.
- Licencia MIT: permite uso comercial, pero conviene revisar las dependencias de `custom_code` y del servidor incluido.
- El pipeline declarado es `text-classification` con `feature-extraction` en los tags; no es un modelo generativo de texto general.
- No se documentan cuantizaciones oficiales ni soporte para runtimes de inferencia estándar más allá de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sagicc/nanoGentzen-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Sagicc/Gentzen-Kripke-240K
- Referencia del cálculo de secuentes LJ de Gentzen (1935): no disponible como enlace en la información proporcionada.
- Referencia de la búsqueda G4ip de Dyckhoff (1992): no disponible como enlace en la información proporcionada.
- Referencia de la semántica de Kripke (1965): no disponible como enlace en la información proporcionada.
- Leaderboard S1MB: no disponible como enlace en la información proporcionada.
- Repositorio o demo adicional: no disponible.
