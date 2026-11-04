# HarleyCooper/weight-space-breakout-failure-driven-02

## Resumen

`HarleyCooper/weight-space-breakout-failure-driven-02` no es un modelo de lenguaje: es un controlador de juego para Breakout con 17.253 parámetros, entrenado mediante un protocolo iterativo de reparación de pesos en espacio de pesos (*weight-space programming*). El autor, HarleyCooper, parte de una política deliberadamente defectuosa (controles invertidos) y aplica un bucle de retroalimentación en el que un modelo de lenguaje externo (Qwen 3.6 35B A3B alojado en Prime Intellect) propone asignaciones escalares sobre los pesos, que un verificador valida contra 512 semillas emparejadas antes de promover el candidato a una revisión versionada del repositorio.

El interés técnico no reside en el controlador en sí, sino en el método: demuestra un ciclo cerrado de diagnóstico de fallos, edición de pesos y auditoría reproducible sin necesidad de GPU para el juego. Cada ronda registra checkpoint inicial, respuesta exacta del editor, hash del candidato, informe del verificador y decisión de aceptación, lo que convierte el repositorio en un artefacto de auditoría más que en un modelo desplegable.

Es relevante como referencia metodológica para investigación en optimización de políticas de baja dimensionalidad, *prompting* sobre pesos y verificación estadística de ediciones, no como componente de producción en pipelines de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Controlador de política de red neuronal (no transformer, no LM); pesos serializados en safetensors y numpy |
| Parametros totales | 17.253 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.npz`; sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors`, `policy.npz`, `policy.json`, `initial_baseline.safetensors`, `manifest.json` |

## Arquitectura y entrenamiento

El artefacto es una política de control para el entorno Breakout, con 17.253 parámetros escalares organizados en una red de pequeña dimensión. No hay evidencia en la información disponible de que se trate de un transformer, MoE o SSM; se describe explícitamente como "game controller, not a language model". Los pesos se serializan en `safetensors` y `npz`, y el repositorio conserva además `initial_baseline.safetensors` con la política inicial conocida como defectuosa (controles invertidos), que sirve de referencia de comparación.

El entrenamiento no es gradient-based en el sentido habitual: es un bucle de reparación iterativa en espacio de pesos. Cada ronda congela un plan (tres rondas por defecto), envía el snapshot actual y su hash al entorno alojado `harleycooper/weight-space-breakout@0.2.1`, ejecuta 32 partidas de práctica con semillas fijas (`40000 + 32*round` a `40031 + 32*round`) y pasa las trayectorias cortas a `qwen/qwen3.6-35b-a3b`, que propone hasta 64 asignaciones escalares sin uso de herramientas. El verificador compara candidato e incumbente sobre 512 semillas frescas emparejadas (`60000 + 512*round` a `60511 + 512*round`) y acepta solo si la ganancia media supera 0,10 y `gain - 2 * paired_standard_error > 0`. La auditoría final se ejecuta sobre 1.024 partidas (`90000..91023`) contra la política defectuosa original, sin uso para promoción. La versión 0.3.0 añade la configuración `failure-driven-v1` con herramientas, hasta ocho turnos de editor, diagnóstico explícito y puertas de replay dirigido y evaluación amplia; la 0.4.0 introduce reparación asistida por herramientas preparadas sin límite de turnos y con herramienta final `submit_edits`.

## Capacidades

- Control de política para el entorno Breakout: selección de acciones a partir del estado del juego.
- Reparación iterativa de pesos guiada por fallos: acepta ediciones escalares propuestas externamente y las valida estadísticamente.
- Serialización y publicación versionada de pesos con verificación de hashes (commit inmutable por revisión en Hugging Face).
- Auditoría reproducible: conserva candidatos rechazados, informes del verificador y decisiones por ronda en `experiment/`.
- Ejecución en CPU: la simulación del juego no requiere GPU.
- Integración con un editor LLM externo (Qwen 3.6 35B A3B) mediante protocolo de una respuesta por ronda (o multi-turno en `failure-driven-v1`).
- No soporta tool calling propio, agentes, multilingüismo, visión, audio ni generación de texto.

## Casos de uso

- Investigación en *weight-space programming*: usar el repositorio como caso de estudio reproducible de edición de pesos guiada por un LLM, con semillas, hashes y veredictos documentados.
- Benchmark de protocolos de verificación estadística: el esquema de 512 semillas emparejadas con umbral `gain - 2*SE > 0` sirve como plantilla para evaluar ediciones de políticas en entornos de control.
- Auditoría de experimentos de RL: `experiment/` y `manifest.json` permiten reconstruir cada ronda, incluyendo candidatos rechazados, para análisis post-hoc.
- Docencia en optimización de políticas de baja dimensionalidad: 17.253 parámetros y ejecución en CPU lo hacen viable en entornos sin GPU.
- Reproducción de fallos de control: la política inicial con controles invertidos es un caso didáctico de diagnóstico de fallos y reparación dirigida.
- Integración en pipelines de CI para validación de checkpoints: el controlador ligero serializa, valida JSON y comprueba hashes antes de desplegar una revisión, patrón reutilizable en MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de rondas (Incumbent, Candidate, Mean gain, Decision) sin valores rellenados en el extracto proporcionado, y especifica que las medias de distintas filas no son directamente comparables al usar semillas distintas por ronda.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el controlador corre en CPU (17.253 parámetros, repo de 0,0 GB).
- GPU recomendadas: ninguna para el juego; la inferencia del editor LLM (Qwen 3.6 35B A3B) se ejecuta en infraestructura alojada de Prime Intellect y puede generar costes.
- Compatibilidad con GPU de consumo: irrelevante para el controlador; el editor LLM externo requiere hardware alojado.
- Opciones de despliegue: carga directa de `model.safetensors` / `policy.npz` desde Hugging Face; demo en Hugging Face Spaces (CPU); orquestación vía controlador propio y entorno Prime.
- Latencia y throughput: no disponibles. La model card indica un timeout de servicio de 60 minutos por trabajo alojado y un límite de 16.384 tokens de salida por respuesta del editor.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (controladores de política de ~17K parámetros con protocolo de reparación en espacio de pesos).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde prompts y no debe evaluarse con métricas tipo MMLU o HumanEval.
- El estado actual del repositorio corresponde a una política inicial defectuosa (controles invertidos); no es un controlador funcional listo para uso.
- La regla de promoción es un cribado de ingeniería, no una prueba de significación estadística general; el propio autor recomienda replicación independiente.
- Los resultados pueden estancarse o todos los candidatos pueden fallar; una edición no aceptada no modifica la política publicada.
- Divulgación del arnés: el arnés por defecto de Prime anunciaba herramientas `bash` y `edit`, aunque el prompt de la tarea prohibía su uso (y afirmaba incorrectamente que no estaban disponibles); el controlador exige una llamada de modelo completada y cero llamadas reales a herramientas, por lo que la ejecución demuestra ediciones sin uso de herramientas, no un arnés técnicamente libre de herramientas.
- Costes potenciales: la inferencia del LLM editor y la evaluación alojada en Prime pueden generar cargos.
- Licencia MIT permite uso comercial, pero el artefacto no tiene aplicación comercial directa como modelo; su valor es metodológico y de auditoría.
- Sin datos de sesgos, alucinación o cobertura idiomática por no ser un modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-failure-driven-02
- Demo (Space): https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-failure-driven-demo-02
- Código del pipeline: https://github.com/HarleyCoops/weight-space-breakout-pipeline
- Entorno en Prime Intellect: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
- Documentación de reparación asistida (`PREPARED_EDITOR.md`): referenciada en la model card, sin URL directa disponible
- Documentación de reparación guiada por fallos (`FAILURE_DRIVEN.md`): referenciada en la model card, sin URL directa disponible
