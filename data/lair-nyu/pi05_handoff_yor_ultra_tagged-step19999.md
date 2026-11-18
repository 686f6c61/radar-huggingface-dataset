# lair-nyu/pi05_handoff_yor_ultra_tagged-step19999

## Resumen

pi05_handoff_yor_ultra_tagged-step19999 es un checkpoint de un modelo de política robótica (vision-language-action, VLA) derivado de la familia pi05 (openpi), desarrollado por el grupo lair-nyu. El modelo se ha entrenado con la librería openpi y un fork de entrenamiento denominado multi-agent-r2s2r, y su propósito es generar acciones motoras para robots a partir de observaciones visuales e instrucciones en lenguaje natural, con etiquetas de robot explícitas (`<yor>` y `<ultra>`) en cada prompt.

El checkpoint corresponde al paso 19.999 de un entrenamiento de 20.000 pasos bajo la configuración `c1tag_v1`, que combina datos de dos robots (YOR y Ultra) en un esquema de co-training con etiquetado de agente. El repositorio ocupa 12,4 GB e incluye únicamente los pesos (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y metadatos del checkpoint; el estado del optimizador se ha eliminado.

Es relevante porque ilustra una práctica emergente en robótica open source: reutilizar un backbone VLA preentrenado (pi05) y especializarlo mediante co-training multi-robot con etiquetas de identidad, de modo que una sola política pueda controlar plataformas distintas. No obstante, es un artefacto de investigación sin model card completa, sin licencia declarada y sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi05 (openpi); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones se procesan como texto; no se declara cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | pesos openpi (directorio `params/`) más `norm_stats.json`; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi05 de openpi, un esquema VLA que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones. No se dispone de detalles sobre el número de parámetros, la composición del backbone ni el mecanismo exacto de generación de acciones (difusión, flow matching o regresión directa), ya que la model card no los especifica.

El entrenamiento se realizó durante 20.000 pasos con la configuración `c1tag_v1` del repositorio multi-agent-r2s2r (commit `e1ee16594119f65f0756d7db21576c799f93dadd`), sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)`. La innovación principal es el co-training multi-robot con etiquetas `<yor>` y `<ultra>` insertadas en cada prompt, lo que permite a una única política distinguir la plataforma objetivo y compartir representaciones entre ambos dominios. El repositorio incluye `subtask_summary.json` con la lista de subtareas, recuento de chunks, proporción de muestras y episodios reservados para validación. No se documenta el volumen total de datos, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (política VLA).
- Co-training multi-robot: una sola política controla las plataformas YOR y Ultra, seleccionadas mediante las etiquetas `<yor>` y `<ultra>` en el prompt.
- Ejecución de subtareas encadenadas, según la lista de subtareas incluida en `subtask_summary.json`.
- Procesamiento de instrucciones en lenguaje natural como condicionamiento de la política.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso genérico: no disponible (el modelo está especializado en control motor, no en razonamiento textual).
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general, audio: no disponibles.

## Casos de uso

- Control de brazo robótico en laboratorio: la política recibe imágenes de la escena y una instrucción textual y emite comandos de acción; es adecuada para experimentos de manipulación con las plataformas YOR y Ultra.
- Co-training multi-robot en investigación: permite evaluar si compartir un único modelo entre dos robots con etiquetas de identidad mejora la generalización frente a entrenar políticas separadas.
- Reanudación y fine-tuning: al conservar `params/`, `assets/` y metadatos, sirve como punto de partida para nuevos entrenamientos con la configuración de multi-agent-r2s2r.
- Evaluación de generalización a episodios reservados: los episodios held-out documentados en `subtask_summary.json` permiten medir el rendimiento en tareas no vistas durante el entrenamiento.
- Reproducción de experimentos: el checkpoint fija commits concretos de openpi y del fork de entrenamiento, lo que facilita replicar los resultados en un entorno controlado.
- Estudio de etiquetado de agente en prompts: útil para analizar cómo afecta la inclusión de etiquetas `<yor>`/`<ultra>` al comportamiento de una política compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario; la VRAM requerida para inferencia no está documentada.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, es probable que requiera GPU de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: la carga requiere la configuración de entrenamiento de multi-agent-r2s2r mediante `policy_config.create_trained_policy` y `registry.get_config("pi05_handoff_yor_ultra_tagged")`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_handoff_yor_ultra_tagged-step19999 | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face (lair-nyu) |
| pi05 (openpi base) | no disponible en la información | no disponible | no disponible | no disponible | openpi (referencia en la model card) |
| Otros checkpoints de multi-agent-r2s2r | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- Es un checkpoint de investigación en el paso 19.999 de 20.000; no se documenta su rendimiento final ni su robustez en producción.
- La carga depende de un fork externo (multi-agent-r2s2r) y de commits concretos de openpi, incluido un estado `dirty`; la reproducibilidad exacta no está garantizada.
- No se incluye el estado del optimizador (`train_state/`), por lo que no es posible reanudar el entrenamiento tal cual, solo hacer fine-tuning desde los pesos.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento fuera de distribución; en robótica, los fallos de política pueden provocar daños físicos.
- El modelo está especializado en las plataformas YOR y Ultra; su transferencia a otros robots no está documentada.
- No se especifican idiomas soportados ni limitaciones de contexto.
- Ausencia de benchmarks y de model card detallada: no debe asumirse ningún nivel de rendimiento sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_handoff_yor_ultra_tagged-step19999
- Repositorio de entrenamiento multi-agent-r2s2r: https://github.com/LucaMacesanu/multi-agent-r2s2r
- openpi (referencia en la model card): no se proporciona URL directa en la información disponible
