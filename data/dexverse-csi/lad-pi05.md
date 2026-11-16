# Dexverse-CSI/lad-pi05

## Resumen

`lad-pi05` es un conjunto de checkpoints de investigación publicados por Dexverse-CSI en Hugging Face. Se trata de réplicas del modelo de política robótica pi0.5 (policy pi0.5) entrenadas con el mismo pipeline que el modelo hermano `Dexverse-CSI/xlvla-pi05`, con la única diferencia del espacio de acciones utilizado: en lugar del espacio de acciones nativo de pi0.5, se emplea un espacio de acción latente contrastivo denominado LAD (latent action space), definido en el repositorio `Dexverse-CSI/shared-action-spaces` bajo el identificador `dexverse/lad/right-6hand-ft`.

El objetivo del artefacto es servir como baseline reproducible para experimentos de manipulación robótica multi-tarea con seis manos (six hands) y cuatro tareas de un brazo, dentro del contexto del evento RSS2027 (Robotics: Science and Systems). No se trata de un modelo de lenguaje generalista, sino de un checkpoint de política (policy) para control robótico, por lo que muchas de las métricas habituales de LLM (contexto en tokens, cuantización, benchmarks de texto) no aplican directamente.

La información publicada es extremadamente escasa: la model card solo describe la estructura de directorios y la diferencia respecto al baseline, sin especificar arquitectura interna, número de parámetros, licencia ni idiomas. Esta ficha refleja fielmente lo disponible y marca como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política pi0.5; detalles internos no documentados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la card menciona `checkpoint/<step>/`, `dataset/` y `config.yaml` por experimento, sin especificar formato de serialización) |

## Arquitectura y entrenamiento

La model card indica que `lad-pi05` reutiliza la misma política que `Dexverse-CSI/xlvla-pi05`: mismo modelo pi0.5, mismos datos, misma configuración de entrenamiento y misma evaluación. La única modificación es el espacio de acciones, que pasa a ser el espacio latente contrastivo LAD (`dexverse/lad/right-6hand-ft`), definido en el repositorio `Dexverse-CSI/shared-action-spaces`. El autor aclara explícitamente que no se utiliza la política de difusión (diffusion policy) descrita en el paper de LAD, sino que se mantiene la política pi0.5 original.

La estructura de experimentos documentada incluye: `multitask/pi05_LAD/` con 6 manos y 4 tareas de un brazo entrenadas durante 20k pasos; `bimanual_pi05_LAD/` con 6 manos y 4 tareas de dos brazos (condicional, "if run"); `zeroshot/pi05_LAD/{GB,GP,GK,FH}/` (condicional); y `diagonal/pi05_LAD/` (condicional). No se especifican el número de tokens, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en políticas robóticas). Tampoco se documentan innovaciones técnicas adicionales más allá del cambio de espacio de acciones.

## Capacidades

- Control robótico de manipulación: política entrenada para tareas de manipulación con seis manos y cuatro tareas de un brazo (según la estructura `multitask/pi05_LAD/`).
- Ejecución multi-tarea: el checkpoint `multitask/pi05_LAD/` está entrenado para varias tareas simultáneamente (4 tareas de un brazo, 6 manos).
- Posible extensión bimanual: existe un directorio `bimanual_pi05_LAD/` para tareas de dos brazos, aunque la card lo marca como condicional ("if run").
- Evaluación zero-shot: la estructura contempla `zeroshot/pi05_LAD/{GB,GP,GK,FH}/` para evaluar generalización a configuraciones no vistas (condicional, no confirmado que se haya ejecutado).
- Espacio de acciones latente LAD: el modelo opera sobre representaciones latentes de acción contrastivas, lo que permite abstraer el espacio de acciones nativo.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes conversacionales ni multilingüismo. La model card no las menciona y el artefacto es una política robótica, no un LLM.

## Casos de uso

- Baseline reproducible para investigación en espacios de acción latentes: el checkpoint `multitask/pi05_LAD/` sirve para comparar el rendimiento de pi0.5 con espacio de acciones LAD frente al espacio nativo (`xlvla-pi05`) bajo idénticas condiciones de datos y entrenamiento, aislando el efecto del espacio de acciones.
- Manipulación multi-tarea con seis manos: entrenado para 4 tareas de un brazo con 6 manos, puede emplearse como punto de partida para experimentos de generalización entre manos y tareas en entornos de laboratorio.
- Evaluación zero-shot de políticas robóticas: los directorios `zeroshot/pi05_LAD/{GB,GP,GK,FH}/` (si se ejecutaron) permiten medir la transferencia a configuraciones no vistas, útil para estudiar robustez de espacios de acción latentes.
- Experimentos bimanuales: el directorio `bimanual_pi05_LAD/` (condicional) está pensado para tareas de dos brazos, adecuado para investigar coordinación bimanual con representaciones latentes.
- Reproducción de resultados para RSS2027: el artefacto está diseñado como baseline para el evento RSS2027, por lo que sirve para replicar y comparar resultados de otros equipos que participen en la misma pista.
- Estudio del efecto del espacio de acciones en políticas de imitación: al mantener constantes datos, política y evaluación, permite aislar experimentalmente cómo afecta el uso de un espacio latente contrastivo al aprendizaje de políticas.
- Integración en pipelines de investigación con `dataset/` y `config.yaml`: cada experimento incluye su dataset y configuración, lo que facilita la reevaluación y el ajuste fino sobre los mismos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de éxito por tarea, tasas de éxito en simulación o en hardware real, ni comparaciones numéricas con `xlvla-pi05` u otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros del checkpoint).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no puede determinarse sin conocer el tamaño del modelo.
- Opciones de despliegue: no disponible. La card no menciona vLLM, llama.cpp, Ollama, TGI ni ningún runtime específico para políticas robóticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Política | Espacio de acciones | Datos / entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Dexverse-CSI/lad-pi05` | pi0.5 | LAD latente contrastivo (`dexverse/lad/right-6hand-ft`) | Mismos que `xlvla-pi05`; 20k pasos en multitask | no disponible | Hugging Face (0 descargas, 0 likes) |
| `Dexverse-CSI/xlvla-pi05` | pi0.5 | Espacio nativo de pi0.5 | Referencia del autor | no disponible | Hugging Face (referenciado en la card) |
| `Dexverse-CSI/shared-action-spaces` | no aplica (repositorio de espacios de acción) | Define LAD y otros espacios | no disponible | no disponible | Hugging Face (referenciado en la card) |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas pi0.5 con espacios de acción alternativos) más allá de los referenciados por el propio autor.

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica arquitectura interna, número de parámetros, licencia, idiomas ni formato de pesos, lo que impide evaluar su idoneidad para producción sin inspeccionar los ficheros del repositorio.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue comercial.
- Artefacto de investigación: el modelo está publicado como baseline para RSS2027, no como producto listo para producción; los directorios marcados "if run" indican que parte de los experimentos pueden no haberse ejecutado.
- Dependencia de un espacio de acciones externo: el modelo requiere el espacio LAD `dexverse/lad/right-6hand-ft` del repositorio `shared-action-spaces`, lo que añade una dependencia de código y posibles incompatibilidades de versión.
- Sin métricas publicadas: no hay tasas de éxito, curvas de aprendizaje ni comparaciones numéricas con el baseline `xlvla-pi05`, por lo que no puede verificarse la mejora o degradación atribuible al espacio LAD.
- Riesgo de sobreajuste a las 4 tareas y 6 manos del dataset de entrenamiento: la card no documenta la diversidad del dataset ni la composición de las tareas, lo que limita la evaluación de generalización.
- Sin información sobre sesgos: al ser una política robótica, los sesgos relevantes serían de comportamiento (por ejemplo, sesgo hacia configuraciones de manos del dataset), pero no se documentan.
- Advertencia de seguridad: cualquier uso en robots reales requiere validación adicional; la card no incluye protocolos de seguridad ni límites de par/velocidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Dexverse-CSI/lad-pi05
- Repositorio de espacios de acción referenciado: https://huggingface.co/Dexverse-CSI/shared-action-spaces
- Modelo baseline referenciado: https://huggingface.co/Dexverse-CSI/xlvla-pi05
- Paper de LAD: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
