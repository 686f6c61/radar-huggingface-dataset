# BurnyCoder/multi-agent-swe-rl-qwen3.5-2b-pilot

## Resumen

`BurnyCoder/multi-agent-swe-rl-qwen3.5-2b-pilot` es un adaptador LoRA de investigación publicado en Hugging Face sobre el modelo base `Qwen/Qwen3.5-2B`. Lo desarrolla el usuario BurnyCoder como artefacto de un experimento de autoaprendizaje multiagente (self-play) orientado a ingeniería de software, en el que varios agentes comparten un único adaptador para resolver tareas de reparación de código. El repositorio se distribuye bajo licencia Apache 2.0 y con la librería PEFT.

Es importante subrayar que, según la propia model card, el adaptador es un artefacto de investigación sin ningún paso de optimización completado: el piloto registró cero actualizaciones del optimizador y el estado del informe es `pilot_failed`. Por tanto, no debe considerarse un checkpoint entrenado ni un modelo listo para producción, sino una instantánea reproducible de un experimento fallido que documenta la infraestructura de recogida de datos y evaluación.

El interés técnico del artefacto reside en su valor como material de reproducibilidad: incluye metadatos de checkpoint, estado del optimizador y del RNG, configuración del experimento y registros de evaluación, junto con un arnés de investigación público que permite regenerar informes y tablas sin necesidad de invocar al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only `Qwen/Qwen3.5-2B`; pesos base congelados |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 2B según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,2 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se aplica sobre el modelo base `Qwen/Qwen3.5-2B`, fijado a la revisión exacta `15852e8c16360a2fea060d615a32b45270f8a8fc`. Según la model card, los pesos base, la torre de visión, los embeddings y la cabeza de salida permanecen congelados; solo el adaptador sería susceptible de entrenamiento. Todos los agentes primarios y subagentes asíncronos del experimento comparten exactamente el mismo adaptador, lo que constituye el eje del diseño multiagente.

El aspecto crítico es que el piloto no completó ninguna actualización del optimizador. La model card indica que el adaptador seleccionado (versión de política `0`, huella `9312a507ea4ffa381a7dedfb8b880b1169761ac338a899ce4ed6732b0c503958`) no tiene pasos de optimización y que los grupos de recogida con ventaja cero pueden dejarlo inalterado. Se registraron dos grupos de recogida completados y el estado del informe es `pilot_failed`. La etiqueta `trained` en el análisis guardado identifica la condición de evaluación final, no evidencia de una actualización del optimizador. No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO más allá del marco de reinforcement learning del experimento.

## Capacidades

- El adaptador no aporta capacidades propias verificadas: al no haber actualizaciones del optimizador, su comportamiento efectivo equivale al del modelo base `Qwen/Qwen3.5-2B` con el adaptador LoRA aplicado sin modificación aprendida.
- El experimento está orientado a tareas de ingeniería de software: resolución de issues en repositorios (se citan tareas de `psf/requests` y `pylint-dev/pylint`).
- Soporte de delegación multiagente: el arnés registra delegaciones a subagentes asíncronos (3 delegaciones por condición en la evaluación registrada).
- Generación con configuración específica del arnés: la codificación de prompt desactiva el modo thinking y unifica los EOS del modelo base con el EOS de chat del tokenizador.
- Registro de trazas: se conservan tokens exactos de prompt, tokens de acción generados, log-probabilidades de comportamiento, versiones de política e identidades padre.
- Capacidades multilingües, tool calling, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de investigación: el bundle incluye checkpoint, estado del optimizador y RNG, configuración y registros, lo que permite reconstruir el pipeline de autoaprendizaje multiagente con el arnés público fijado al commit `a4a95e81d2d753539786a2a0671db4e99050b532`.
- Auditoría de pipelines de RL para código: los registros conservan tokens de prompt y acción, log-probabilidades e identidades padre, útiles para depurar por qué un piloto no produjo ventaja ni actualizaciones.
- Estudio de evaluación SWE: el resumen de evaluación incluye 32 tareas humanas y 16 sintéticas planificadas, con estados por tarea, lo que sirve como base para diseñar protocolos de evaluación de agentes de software.
- Desarrollo de infraestructura multiagente: el diseño de adaptador compartido entre agentes primarios y subagentes puede reutilizarse como plantilla para experimentos de self-play con pesos congelados.
- Regeneración de informes sin inferencia: el comando `selfplay report` permite regenerar tablas, figuras, paper y dashboard sin llamadas al modelo, adecuado para validar resultados en CI.
- Formación y docencia: como ejemplo documentado de un piloto fallido con trazabilidad completa (hashes, inventario de bytes), resulta útil para enseñar prácticas de reproducibilidad en investigación de IA.
- Verificación de integridad de artefactos: `bundle-inventory.json` con recuentos de bytes y SHA256 permite auditar la cadena de custodia de un checkpoint de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente resultados de evaluación del piloto, no comparables con benchmarks estándar:

| Condición | Tareas registradas | Completadas | Intentadas | Éxitos | Tasa | Tokens generados | Tiempo (s) | Delegaciones |
|---|---|---|---|---|---|---|---|---|
| human / base | 32 | 21 | 22 | 0 | 0.0 | 25 254 | 8 523,81 | 3 |
| human / trained | 32 | 29 | 30 | 0 | 0.0 | 31 365 | 10 009,67 | 3 |
| synthetic / base | 16 | 0 | 0 | 0 | null | 0 | 0 | 0 |
| synthetic / trained | 16 | 0 | 0 | 0 | null | 0 | 0 | 0 |

En la comparación pareada de la condición humana se registraron 21 tareas emparejadas, entre ellas `psf__requests-1142`, `psf__requests-1766`, `psf__requests-1921`, `psf__requests-2931`, `psf__requests-5414`, `pylint-dev__pylint-4551`, `pylint-dev__pylint-4661` y `pylint-dev__pylint-4970`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al tratarse de un adaptador sobre un modelo base de 2B parámetros, la inferencia requeriría cargar el modelo base completo más el adaptador; el repositorio del adaptador ocupa 0,2 GB.
- GPU recomendadas: no disponibles en la información; la model card remite a un "documented GPU environment" del arnés de investigación sin especificarlo.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: el arnés propio (`multi_agent_ssr.model.LocalPolicy`) con carga desde el bundle; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la evaluación registrada reporta 8 523,81 s para 25 254 tokens generados en la condición base y 10 009,67 s para 31 365 tokens en la condición trained, pero sin especificar el hardware empleado, por lo que no permiten estimar throughput por GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un checkpoint entrenado: el piloto completó cero actualizaciones del optimizador y el estado del informe es `pilot_failed`. No debe presentarse como modelo afinado ni usarse como referencia de rendimiento.
- Tasa de éxito nula en la evaluación registrada: 0 éxitos sobre 22 intentos (base) y 0 sobre 30 (trained) en la condición humana, con 11 y 3 tareas sin puntuar respectivamente.
- Condición sintética sin ejecutar: las 16 tareas planificadas quedaron en estado `not_run_budget` en ambas condiciones, por lo que no hay datos de ese escenario.
- Reproducibilidad parcial: la model card advierte de que volver a muestrear no garantiza reproducir las acciones bit a bit.
- Configuración de generación específica: reutilizar solo los valores por defecto del modelo base puede continuar más allá de un turno de chat; es necesario conservar la configuración del arnés.
- El bundle excluye snapshots de repositorios, cachés del scorer oficial y correcciones de referencia; las rutas almacenadas son metadatos de procedencia, no instrucciones para descargar archivos.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas: no documentados en la información disponible; al no haber entrenamiento efectivo, cualquier sesgo provendría del modelo base.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero su naturaleza de investigación fallida desaconseja cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/multi-agent-swe-rl-qwen3.5-2b-pilot
- Arnés de investigación (commit del informe/export): https://github.com/BurnyCoder/multi-agent-llm-self-play-reinforcement-learning-for-software-engineering/tree/a4a95e81d2d753539786a2a0671db4e99050b532
- Configuración de generación del arnés: https://github.com/BurnyCoder/multi-agent-llm-self-play-reinforcement-learning-for-software-engineering/blob/a4a95e81d2d753539786a2a0671db4e99050b532/src/multi_agent_ssr/model.py
- Código de PEFT referenciado (resolución del modelo base): https://github.com/huggingface/peft/blob/v0.21.2/src/peft/auto.py#L104
