# Dohyeon-Lee-02/SkillVLA-checkpoints

## Resumen

SkillVLA-checkpoints es un repositorio de checkpoints de entrenamiento publicado en HuggingFace por el usuario Dohyeon-Lee-02. No se trata de un modelo empaquetado y documentado al uso, sino de un árbol de salidas de entrenamiento del proyecto SkillVLA que incluye tanto los baselines pi0.5 como los propios modelos SkillVLA. El repositorio está etiquetado como `lerobot`, `robotics` y `vision-language-action`, y se distribuye con la biblioteca LeRobot, lo que lo sitúa en el ámbito de los modelos visión-lenguaje-acción (VLA) para control robótico.

El contenido se organiza replicando la estructura de salida del entrenamiento: `<outputs_root>/<group>/<run>/checkpoints/<step>/`, con dos subdirectorios por checkpoint, `pretrained_model/` (pesos, configuraciones de política y entrenamiento, estadísticas de normalización) y `training_state/` (optimizador, scheduler, estado del RNG y step). Esto indica que el propósito declarado es permitir inspeccionar los runs en curso o reanudarlos en otra máquina, más que servir como modelo listo para inferencia en producción.

Técnicamente, los checkpoints son obras derivadas de `lerobot/pi05_base` (PaliGemma más un experto de acciones basado en Gemma), y los checkpoints de SkillVLA incorporan además pesos de visión DINOv3 (`facebook/dinov3-*-pretrain-lvd1689m`). Los datos de entrenamiento citados son el benchmark LIBERO. No se especifican en la información disponible el número de parámetros, la longitud de contexto ni los idiomas soportados, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `lerobot/pi05_base`: PaliGemma + experto de acciones Gemma; los checkpoints SkillVLA incorporan además pesos de visión DINOv3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `other`; términos aplicables: Gemma Terms of Use y DINOv3 License (`gemma-terms-of-use-and-dinov3-license`) |
| Formato de pesos | no disponible (checkpoints organizados en `pretrained_model/` y `training_state/`; no se especifica formato de fichero) |
| Tarea | vision-language-action (robótica) |
| Biblioteca | LeRobot |
| Datos de entrenamiento citados | LIBERO (CC BY 4.0), Liu et al., 2023 |
| Autor | Dohyeon-Lee-02 |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un sistema visión-lenguaje-acción construido a partir de `lerobot/pi05_base`, que combina un backbone PaliGemma con un "action expert" basado en Gemma. Sobre esa base, los checkpoints de SkillVLA añaden pesos de visión procedentes de DINOv3, lo que sugiere un componente perceptivo adicional orientado a representaciones visuales densas. No se detalla en la model card si se trata de un transformer con cabezas de acción, de un modelo de difusión de acciones ni de ninguna otra variante concreta, ni se indican innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.).

En cuanto al entrenamiento, la única referencia es el uso del benchmark LIBERO como dato de entrenamiento, citado con licencia CC BY 4.0. No se especifica el número de tokens, la composición del dataset más allá de LIBERO, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. La presencia de directorios `training_state/` con estado de optimizador, scheduler y RNG, junto con el step, confirma que el material publicado corresponde a puntos de control intermedios de entrenamiento y no necesariamente a un modelo final consolidado.

## Capacidades

- Control robótico guiado por lenguaje: al ser un modelo VLA, su función prevista es generar acciones a partir de observaciones visuales e instrucciones en lenguaje natural.
- Manipulación en tareas del benchmark LIBERO: los datos de entrenamiento citados corresponden a este conjunto de evaluación de transferencia de conocimiento en aprendizaje robótico continuo.
- Percepción visual reforzada: los checkpoints de SkillVLA incorporan pesos de DINOv3 como componente de visión.
- Reanudación de entrenamiento: los checkpoints incluyen estado de optimizador, scheduler y RNG, lo que permite continuar un run en otra máquina.
- Inspección de runs: la estructura publicada permite examinar configuraciones de política y entrenamiento, pesos y estadísticas de normalización por step.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Investigación en modelos visión-lenguaje-acción: el repositorio permite inspeccionar la evolución de los checkpoints de SkillVLA y de los baselines pi0.5 para analizar cómo progresa el entrenamiento en tareas de manipulación.
- Reproducción de experimentos: al incluir `training_state/` con optimizador, scheduler, RNG y step, es posible reanudar un run exactamente en el punto publicado y verificar resultados de forma reproducible.
- Comparación de baselines frente a SkillVLA: la estructura `<group>/<run>` permite contrastar los runs de pi0.5 contra los de SkillVLA en condiciones equivalentes de configuración.
- Evaluación sobre LIBERO: los checkpoints pueden emplearse para medir transferencia de habilidades y aprendizaje continuo en las tareas de ese benchmark, que es el dataset de entrenamiento citado.
- Fine-tuning posterior: al estar en formato LeRobot, los pesos pueden servir como punto de partida para reentrenar sobre otros conjuntos de demostraciones robóticas.
- Depuración de pipelines de entrenamiento: las estadísticas de normalización y las configuraciones de política incluidas en `pretrained_model/` son útiles para diagnosticar discrepancias entre entrenamiento e inferencia.
- Análisis del componente visual: la inclusión de pesos DINOv3 permite estudiar el efecto de representaciones visuales preentrenadas en el rendimiento del controlador.
- Despliegue experimental en robot real o simulado con LeRobot: sujeta a que el checkpoint seleccionado esté completo y a la validación previa del usuario, dado que no hay documentación de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en LIBERO ni comparaciones cuantitativas entre los baselines pi0.5 y los modelos SkillVLA. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la información publicada no incluye número de parámetros ni tamaño de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no puede determinarse sin conocer el tamaño del modelo.
- Opciones de despliegue: el repositorio está etiquetado con la biblioteca LeRobot, que es la vía de integración prevista. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Consideración de almacenamiento: al publicarse checkpoints intermedios con estado completo de entrenamiento (`training_state/`), cada punto de control ocupa espacio adicional más allá de los pesos, lo que afecta al almacenamiento necesario para reanudar runs.

## Comparativa con modelos similares

La información disponible no incluye datos cuantitativos que permitan una comparación rigurosa. La siguiente tabla recoge únicamente relaciones verificables a partir de la model card; el resto de campos se marcan como no disponibles.

| Modelo | Relación con SkillVLA-checkpoints | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillVLA-checkpoints | Objeto de esta ficha | no disponible | no disponible | Gemma Terms + DINOv3 License | HuggingFace, 0 descargas |
| `lerobot/pi05_base` | Modelo base del que derivan todos los checkpoints | no disponible | no disponible | Gemma Terms of Use | HuggingFace (referenciado) |
| `facebook/dinov3-*-pretrain-lvd1689m` | Origen de los pesos de visión incorporados en los checkpoints SkillVLA | no disponible | no disponible | DINOv3 License | HuggingFace (referenciado) |
| Otros modelos VLA de robótica | No se dispone de datos comparativos en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Obras derivadas con licencias encadenadas: cada checkpoint es un derivado de `lerobot/pi05_base`, por lo que se aplican los Gemma Terms of Use, incluida la Prohibited Use Policy, y estos términos viajan con cada copia.
- Obligación de atribución por DINOv3: los checkpoints de SkillVLA contienen pesos de visión DINOv3, y las publicaciones que los utilicen deben reconocer explícitamente a DINOv3 conforme a su licencia.
- Atribución de datos: el entrenamiento cita LIBERO bajo CC BY 4.0 (Liu et al., 2023), lo que exige el reconocimiento correspondiente.
- Restricciones de uso comercial: la licencia figura como `other` con nombre `gemma-terms-of-use-and-dinov3-license`; cualquier uso comercial debe verificarse contra los términos de Gemma y de DINOv3 antes de desplegar.
- Ausencia de documentación técnica: no hay datos publicados de parámetros, contexto, idiomas, cuantizaciones ni formato de pesos, lo que impide dimensionar el despliegue.
- Checkpoints intermedios: el autor indica que se suben "tal y como se escriben", por lo que pueden corresponder a estados parciales de entrenamiento y no a un modelo final validado.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de funcionamiento.
- Riesgo de fallo fuera del dominio de entrenamiento: al haberse entrenado sobre LIBERO, el comportamiento en entornos, morfologías de robot o tareas distintas no está documentado y puede degradarse.
- Riesgo de alucinación y errores de acción: no se han publicado evaluaciones de seguridad ni tasas de error en ejecución real; en robótica, un fallo de acción tiene consecuencias físicas.
- Fechas de publicación inconsistentes: el repositorio figura creado y actualizado el 2026-09-22, una fecha posterior a la habitual en catálogos públicos; conviene verificar la vigencia y procedencia del material.
- Idiomas no disponibles: no se puede confirmar si las instrucciones en lenguaje natural deben estar en inglés ni qué cobertura lingüística tiene el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dohyeon-Lee-02/SkillVLA-checkpoints
- Gemma Terms of Use (aplicables a los checkpoints derivados de `lerobot/pi05_base`): https://ai.google.dev/gemma/terms
- Fichero de licencia del repositorio: `LICENSE.md`
- Licencia de DINOv3 en el repositorio: `LICENSE-DINOv3.md`
- Aviso de atribución de dependencias: `NOTICE` (en el repositorio)
- Modelo base referenciado: `lerobot/pi05_base`
- Pesos de visión referenciados: `facebook/dinov3-*-pretrain-lvd1689m`
- Dataset de entrenamiento citado: LIBERO, Liu et al., "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning", 2023 (sin URL incluida en la información disponible)
- Paper o blog técnico de SkillVLA: no disponible
- Demo o espacio de inferencia: no disponible
