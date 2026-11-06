# macmacmacmac/SecJev-4B-Action-Monitor-C1

## Resumen

SecJev-4B-Action-Monitor-C1 es un checkpoint de seguridad derivado de SecJev-4B, un modelo de decisión construido sobre el backbone Qwen/Qwen3.5-4B-Base y publicado por el usuario macmacmacmac. Su función es actuar como monitor de acciones ("action monitor") en agentes LLM que usan herramientas: antes de que se ejecute una llamada a herramienta propuesta, el modelo puntúa si esa llamada está autorizada por la petición del usuario, a la luz de las salidas de herramientas que el agente ha visto. Resuelve, por tanto, el problema de las inyecciones de prompt indirectas que intentan desviar llamadas a herramientas hacia acciones no solicitadas.

El checkpoint se corresponde con la mitad "Spot 2" (llamada saliente a herramienta) de la defensa JEV evaluada en el repositorio de investigación jev-stageA; la mitad "Spot 1" (filtrado de salidas entrantes de herramienta) usa el SecJev-4B original, disponible en macmacmacmac/SecJev-4B. Combinados, ambos checkpoints forman la defensa `secjev_cascade`. Es relevante porque aborda un vector de ataque específico y creciente en sistemas agénticos (tool hijacking) con un modelo pequeño de 4B parámetros, desplegable en hardware modesto.

No se trata de un modelo generativo de propósito general, sino de un clasificador de decisión: LoRA adapter más una cabeza de decisión ("pointer decision head") sobre el backbone congelado. La distribución no incluye los pesos completos del backbone, que se descargan por separado desde Qwen bajo Apache-2.0. El repositorio ocupa 0,2 GB y solo se publican el adaptador, la cabeza y el tokenizer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base congelado) + LoRA adapter + cabeza de decisión pointer |
| Parámetros totales | 4B en el backbone (no disponible el número exacto del adaptador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | SecJev Use and Distribution Agreement v1.0 (con términos upstream adicionales) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), `head.pt`, `adapter_config.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del backbone Qwen/Qwen3.5-4B-Base, que permanece congelado y se distribuye por separado bajo Apache-2.0. Sobre él se aplica un adaptador LoRA junto con una cabeza de decisión de tipo pointer que produce la puntuación de autorización. Respecto al SecJev-4B upstream (v1.2.0), solo difieren `adapter_model.safetensors`, `head.pt` y `adapter_config.json`.

El ajuste fino consistió en una época (variante C1: learning rate 3e-5, sin replay de corpus, vista de contenido) sobre preguntas de autorización de acciones construidas a partir de ejecuciones grabadas de AgentDojo. El entrenamiento usó únicamente las suites workspace y travel; las suites banking y slack se reservaron para evaluación. Los detalles completos de procedencia están en `provenance.json`, y los registros del upstream se conservan en `upstream-secjev-4b/` y `upstream-provenance.json`. El checkpoint se empaqueta como directorio Kev/SecJev (adaptador + cabeza + tokenizer), con un script de bootstrap que descarga el backbone fijado y el código fuente de Kev.

## Capacidades

- Puntuación de autorización de llamadas a herramientas: dado un certificado con la petición del usuario, las salidas de herramientas vistas y la llamada propuesta, emite una puntuación de si la acción está autorizada.
- Defensa frente a inyección de prompt indirecta en agentes con herramientas (tool hijacking).
- Modos de operación "stop" (bloquear la llamada) y "redact" (redactar o sanear la llamada) mediante `defenses.py` y `secjev_scorer.py`.
- Funcionamiento en cascada con el SecJev-4B original (`secjev_cascade`): Spot 1 filtra salidas entrantes, Spot 2 filtra llamadas salientes.
- Integración con el loader de checkpoints Kev, aceptando el repo id de Hugging Face directamente.
- Inferencia sobre CUDA (`--device cuda`) mediante `infer.py`.
- Idioma: únicamente inglés.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-step; su salida es una decisión/puntuación.

## Casos de uso

- Protección de agentes corporativos con acceso a herramientas sensibles (correo, calendario, banca): el monitor evalúa cada llamada saliente antes de su ejecución y bloquea o redacta las que no estén respaldadas por la petición original del usuario, reduciendo el impacto de inyecciones indirectas.
- Auditoría y registro de decisiones: al puntuar cada llamada propuesta, permite construir trazas de por qué se permitió o bloqueó una acción, útil para cumplimiento y análisis forense de incidentes.
- Despliegue en pipelines de agentes existentes como capa externa: se integra mediante `defenses.py` y `secjev_scorer.py` sin modificar el agente, pasando el directorio como `--secjev`.
- Investigación en seguridad de agentes: sirve como checkpoint de referencia para reproducir y extender los resultados de jev-stageA, incluida la evaluación frente a atacantes adaptativos.
- Filtrado en modo redact para preservar utilidad: en escenarios donde bloquear rompe la tarea, el modo redact sanea la llamada y mantiene la tasa de tareas completadas bajo ataque (75,5 % reportado) a costa de una menor protección.
- Defensa en cascada en entornos de alta exposición: combinado con el SecJev-4B original, cubre tanto la entrada (salidas de herramienta contaminadas) como la salida (llamadas no autorizadas) del bucle agéntico.
- Validación previa a producción: permite medir la tasa de falsos positivos y la degradación de tareas normales (89,9 %-90,5 % reportado) antes de adoptar la defensa en un sistema real.

## Benchmarks y rendimiento

Resultados reportados por el autor en AgentDojo v1.2.2, suites held-out banking+slack, agente `gpt-5.4-mini`, conjunto de ataque bland-note, ejecuciones en vivo, umbral 0,35 ajustado en workspace+travel:

| Modo | Tareas normales | Hijacked | Tareas completadas bajo ataque |
|---|---:|---:|---:|
| Sin defensa | 97,3 % | 34,1 % | 78,3 % |
| C1 monitor, stop | 89,9 % | 1,6 % | 55,4 % |
| C1 monitor, redact | 90,5 % | 0,8 % | 75,5 % |
| LLM judge (`gpt-5.4-mini`), redact | 95,3 % | 0,0 % | 28,5 % |

Frente a un atacante adaptativo de 10 rondas (`gpt-5.5`, 100 objetivos banking+slack), C1 por sí solo es débil: 58 % hijacked en modo stop y 53 % en modo redact, frente a 64 % sin defensa y 25 % del LLM judge. El README de jev-stageA recoge los resultados completos, incluidas las reglas de decisión que C1 no superó.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone es de 4B parámetros, por lo que en FP16 requeriría del orden de 8 GB solo para pesos, más overhead del adaptador y la cabeza (estimación orientativa, no publicada por el autor).
- GPU recomendadas: el autor documenta ejecución en CUDA (`--device cuda`) sin especificar modelos; no se publican requisitos mínimos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño del backbone (4B) es plausible en GPUs de consumo con suficiente VRAM, pero no se aportan datos.
- Opciones de despliegue: script propio `bootstrap.py` (modo `--inference-only`) e `infer.py`; integración como defensa con `defenses.py` y `secjev_scorer.py` de jev-stageA; loader de checkpoints Kev. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecJev-4B-Action-Monitor-C1 | 4B (backbone) + LoRA | no disponible | Monitor de llamadas salientes (Spot 2) | SecJev Use and Distribution Agreement v1.0 | Hugging Face (macmacmacmac) |
| SecJev-4B (upstream v1.2.0) | 4B (backbone) + LoRA | no disponible | Filtro de salidas entrantes (Spot 1) | términos upstream SecJev | Hugging Face (macmacmacmac/SecJev-4B) |
| LLM judge `gpt-5.4-mini` | no disponible | no disponible | Juez genérico de seguridad | propietaria | API comercial |

La comparación con el LLM judge se limita a los resultados de la tabla de benchmarks (mayor protección pero mucha menor tasa de tareas completadas en modo redact). No se dispone de comparativas con otros modelos de seguridad de agentes en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no una defensa completa: frente a un atacante adaptativo de 10 rondas alcanza 58 % (stop) y 53 % (redact) de hijacking, claramente por encima del 25 % del LLM judge.
- Degrada la utilidad en tareas normales: 89,9 %-90,5 % frente al 97,3 % sin defensa, y solo 55,4 % de tareas completadas bajo ataque en modo stop.
- El umbral (0,35) se ajustó en workspace+travel; el rendimiento en otras suites o dominios puede diferir.
- Solo soporta inglés.
- No es el SecJev-4B original y no debe citarse como tal; es una release modificada.
- Licencia restrictiva: SecJev Use and Distribution Agreement v1.0, con condiciones upstream adicionales (incluidos límites de uso comercial de ToN-IoT en SecJev-Corpus) que no quedan eliminados por esta release; revisar `LICENSE`, `UPSTREAM.md`, `SOURCES.md` y `THIRD_PARTY_NOTICES.md` antes de cualquier uso comercial.
- El backbone no se redistribuye: requiere descarga separada desde Qwen (Apache-2.0) y ejecución del script de bootstrap.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un clasificador de decisión, el riesgo principal es de falsos positivos y falsos negativos, no de generación.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/macmacmacmac/SecJev-4B-Action-Monitor-C1
- SecJev-4B upstream (Spot 1): https://huggingface.co/macmacmacmac/SecJev-4B
- Repositorio de investigación jev-stageA: https://github.com/maceip/jev-stagea
- Release SecJev-4B v1.2.0: https://github.com/UESTC1010/SecJev/releases/tag/v1.2.0
- Backbone Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
