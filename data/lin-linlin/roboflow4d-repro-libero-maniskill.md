# LIN-linlin/roboflow4d-repro-libero-maniskill

## Resumen

RoboFlow4D es un modelo de flujo (flow model) orientado a robótica que se distribuye en este repositorio como una reproducción del entrenamiento oficial sobre los entornos simulados LIBERO y ManiSkill3. El autor del repositorio, LIN-linlin, publica el checkpoint resultante de aplicar la receta oficial del proyecto EDEM-AI/RoboFlow4D (commit 31c9507) con dos modificaciones explícitas: sin preentrenamiento en DROID y con 10 épocas en lugar de 100. El artefacto principal es `flow/lbms_flow_best_ep2.pt`, el mejor checkpoint tras la época 2 de 10 (17.834 de 89.165 actualizaciones).

El modelo resuelve el problema de generar trayectorias de flujo para manipulación robótica a partir de representaciones 3D, empleando las etiquetas exportadas de los simuladores en el formato nativo de RoboFlow4D y características VGGT. No es un modelo de lenguaje: no procesa texto ni mantiene conversación, y su pipeline en Hugging Face es `robotics`, no `text-generation`. Su relevancia es la de un artefacto de reproducibilidad: permite a otros grupos verificar el pipeline de entrenamiento y comparar el efecto de recortar el preentrenamiento y el número de épocas.

El repositorio pesa 3,1 GB e incluye, además del checkpoint, el código oficial sin modificar, el entrenador parcheado que se ejecutó realmente y los scripts de exportación de datos y de extracción de características. No se dispone de información sobre arquitectura interna, número de parámetros ni longitud de contexto, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de flujo para robótica, RoboFlow4D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de identificarlo como un flow model de RoboFlow4D, un enfoque de generación de flujos aplicado a robótica. El entrenamiento se realizó con el entrenador oficial del proyecto EDEM-AI/RoboFlow4D (commit 31c9507) más ganchos de reanudación y registro (`code/run/rf4d_patch.py`); según la model card, el modelo, la función de pérdida y el optimizador no se modificaron respecto al original.

Los datos de entrenamiento proceden de los simuladores LIBERO y ManiSkill3, exportados al formato de RoboFlow4D mediante `rf4d_export.py`, y se emplearon características VGGT. La receta difiere de la oficial en dos puntos declarados: ausencia de preentrenamiento en DROID y reducción de 100 a 10 épocas. El checkpoint publicado corresponde a la época 2 (17.834 de 89.165 actualizaciones, md5 `d5ceaebb32fc700380219e19ca9b0e23`); el checkpoint final de 10 épocas no se conservó. No se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de flujos de acción para manipulación robótica en entornos simulados LIBERO y ManiSkill3.
- Procesamiento de representaciones 3D y características VGGT como entrada.
- Entrenamiento y evaluación reproducibles mediante el código y los scripts incluidos en el repositorio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.
- No se documentan capacidades de generación de texto, código o matemáticas.

## Casos de uso

- Reproducción de experimentos de RoboFlow4D: el repositorio permite reejecutar el entrenamiento con el entrenador parcheado y comparar el checkpoint de la época 2 con la receta oficial completa, aislando el efecto de eliminar el preentrenamiento en DROID.
- Investigación en políticas de manipulación simulada: el checkpoint sirve como punto de partida para evaluar flujos de acción en tareas de LIBERO y ManiSkill3 antes de escalar a entrenamientos más largos.
- Auditoría de pipelines de datos: los scripts de exportación (`rf4d_export.py`) y de extracción de características VGGT documentan cómo transformar etiquetas de simulador al formato RoboFlow4D, útil para construir datasets propios.
- Comparación de recetas de entrenamiento: al conservar el código oficial sin modificar junto al parcheado, se puede medir el impacto de los ganchos de reanudación y registro sobre la dinámica de entrenamiento.
- Docencia y formación en robótica basada en simulación: el tamaño manejable del repositorio (3,1 GB) y la presencia de todos los artefactos facilitan su uso en cursos prácticos de aprendizaje por imitación.
- Base para experimentos de transferencia sim-to-real: aunque no se documenta evaluación en hardware real, el checkpoint y el pipeline permiten iniciar estudios de transferencia desde los entornos simulados incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se indican parámetros ni tamaño del checkpoint).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el artefacto es un checkpoint PyTorch (`.pt`) pensado para cargarse con el código de RoboFlow4D incluido.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio completo ocupa 3,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RoboFlow4D (repro LIBERO + ManiSkill3, este repo) | no disponible | no disponible | other | Hugging Face, checkpoint época 2 | Sin preentrenamiento DROID, 10 épocas |
| RoboFlow4D oficial (EDEM-AI/RoboFlow4D, commit 31c9507) | no disponible | no disponible | no disponible | Repositorio de código referenciado | Receta completa: preentrenamiento DROID y 100 épocas |
| Otros modelos robóticos de flujo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El checkpoint publicado es la época 2 de 10, no el modelo final; el checkpoint de la época 10 no se conservó, por lo que el rendimiento está lejos del entrenamiento completo.
- Se omite el preentrenamiento en DROID, lo que aleja esta reproducción de la receta oficial y limita la comparabilidad directa con los resultados del proyecto original.
- `rf4d_export.py` importa funciones auxiliares de una base de código del autor que no se ha publicado, por lo que la exportación de datos no es totalmente reproducible con lo disponible.
- La licencia es "other" sin texto adicional en la información proporcionada; es imprescindible revisar los términos antes de cualquier uso comercial.
- Solo se ha entrenado y evaluado en simulación (LIBERO y ManiSkill3); no hay evidencia de transferencia a robots reales.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al no ser un modelo lingüístico, esas métricas no aplican directamente, pero sí existe riesgo de fallo silencioso en políticas de acción.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.
- No se dispone de información sobre parámetros, contexto ni cuantizaciones, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/LIN-linlin/roboflow4d-repro-libero-maniskill
- Código oficial RoboFlow4D (referenciado en la model card): EDEM-AI/RoboFlow4D, commit 31c9507
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
