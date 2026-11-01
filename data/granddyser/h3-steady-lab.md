# Granddyser/H3-Steady-Lab

## Resumen

H3 Steady Lab es un parche de modelo (model patch) para ComfyUI disenado para su uso con MiniMax H3, un modelo de generacion de video. Lo desarrolla el usuario Granddyser y se distribuye bajo licencia Apache 2.0. No es un modelo de lenguaje ni un modelo de difusion autonomo: es un componente que se inserta en el grafo de ComfyUI entre el cargador del modelo y el sampler para reducir fallos y artefactos durante la generacion de video.

Su proposito concreto es mitigar resultados defectuosos mientras el video se esta generando, actuando exclusivamente sobre los tokens de imagen. El autor advierte explicitamente de que no es un mejorador general de calidad ni una herramienta de reparacion de videos ya terminados, y de que no puede evitar todos los errores. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con un artefacto ligero que incluye un fichero de perfil (`profil_lab.safetensors`) y codigo de nodo.

El proyecto es experimental y esta etiquetado como tal. Se ha probado, segun el autor, pero no en todos los modelos, ajustes y escenarios posibles, por lo que los resultados pueden variar. Su relevancia actual radica en que aborda un problema practico de los pipelines de generacion de video en ComfyUI: la inestabilidad y los artefactos que aparecen a lo largo de la generacion, especialmente en clips largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parche de modelo para MiniMax H3 en ComfyUI (no es un modelo autonomo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `profil_lab.safetensors` (perfil incluido) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del parche mas alla de su funcion: se conecta en la ruta del MODEL antes del muestreo (`Model loader → H3 Steady Lab → KSampler`) y actua sobre los tokens de imagen exclusivamente. En flujos de muestreo avanzados, su salida MODEL se conecta tanto a BasicGuider como a BasicScheduler, dejando intactas las conexiones de condicionamiento, latente, video y audio.

El componente incluye un perfil calibrado (`profil_lab.safetensors`) ajustado para la configuracion `er_sde / beta / 20 steps`. No se han publicado datos sobre el proceso de calibracion, el volumen de datos empleado ni si hubo entrenamiento supervisado, RLHF o DPO. La unica innovacion tecnica documentada es el control de la intensidad del parche por pasos de muestreo: los parametros Step 0, Step 1 y Step 2 actuan como multiplicadores de fuerza para los tres primeros pasos de muestreo (contados desde cero), y los limites Start/End block permiten restringir el efecto a un rango de bloques del modelo.

## Capacidades

- Reduccion de fallos y artefactos durante la generacion de video con MiniMax H3 en ComfyUI.
- Control granular de la intensidad del efecto por paso de muestreo (Step 0, Step 1, Step 2).
- Restriccion del efecto a un rango de bloques del modelo (Start / End block).
- Limitacion temporal del efecto dentro del clip mediante Start second, End second y offset.
- Umbral de activacion configurable (Threshold), con modo estricto al 100 %.
- Perfiles diferenciados para modelos Turbo y no Turbo.
- Desactivacion limpia poniendo Strength a 0, para comparar con la misma semilla.
- Actuacion exclusiva sobre tokens de imagen, sin tocar audio ni condicionamiento.

## Casos de uso

- Generacion de video de larga duracion en ComfyUI: el parche permite mantener la estabilidad a lo largo del clip, con control temporal (Start second / End second) para aplicar el efecto solo en el tramo problematico; el ejemplo del autor cubre el segmento de 22 segundos hasta el final.
- Produccion de clips con audio nativo: al actuar solo sobre tokens de imagen, se puede estabilizar el video sin alterar la pista de audio generada por MiniMax H3.
- Flujos con modelos Turbo: la tabla de valores recomendados incluye una configuracion especifica para Turbo (Strength 3.0, Step 0 entre 0.10 y 0.20, bloques 42/48, umbral estricto del 100 %), lo que permite integrarlo en pipelines de generacion rapida.
- Comparacion A/B de semillas en investigacion: poner Strength a 0 permite generar el mismo clip con y sin el parche usando la misma semilla, util para evaluar su impacto real.
- Estandarizacion de pipelines de estudio: al ser un nodo de `advanced/model_patches`, se puede incorporar a workflows de produccion en ComfyUI de forma reproducible junto al workflow de ejemplo incluido.
- Ajuste fino de muestreo avanzado: en flujos con BasicGuider y BasicScheduler, el parche se inserta en la ruta del modelo sin reconfigurar el resto del grafo, lo que facilita experimentar con la estabilidad sin rehacer el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta una comparacion cualitativa mediante dos videos (con y sin el parche) del segmento de 22 segundos hasta el final, sin metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el parche; depende del modelo MiniMax H3 y de la configuracion de generacion (resolucion, numero de frames).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: exclusivamente como nodo de ComfyUI con soporte nativo de MiniMax H3, en `ComfyUI/custom_nodes/h3_steady_lab/`, manteniendo `__init__.py` y `profil_lab.safetensors` juntos en esa carpeta.
- Latencia y throughput: no disponibles. El workflow de ejemplo usa 1344 × 768, 124 frames y 24 fps, pero el autor indica que no se ejecuto una generacion completa de video para ese ejemplo.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada alternativas comparables de parches de estabilizacion para MiniMax H3 en ComfyUI.

## Limitaciones y advertencias

- Proyecto experimental: el autor advierte de que no se ha probado en todos los modelos, ajustes y escenarios, y que los resultados pueden variar.
- No es un mejorador general de calidad ni repara videos ya terminados; su objetivo es evitar resultados defectuosos durante la generacion y no puede prevenir todos los errores.
- Los valores recomendados son puntos de partida, no ajustes optimos garantizados; una fuerza mayor no implica automaticamente mejores resultados.
- El perfil incluido esta calibrado para `er_sde / beta / 20 steps`; usarlo con otra configuracion de muestreo puede degradar el resultado.
- Requiere una instalacion de ComfyUI con soporte nativo de MiniMax H3 y los ficheros de modelo H3 correspondientes; no funciona de forma aislada.
- No se han publicado datos sobre sesgos, riesgo de alucinacion, limitaciones de idioma ni rendimiento cuantitativo.
- La licencia Apache 2.0 permite uso comercial, pero al ser un componente experimental conviene validarlo en el pipeline concreto antes de llevarlo a produccion.
- El repositorio no incluye pesos de un modelo generativo; el tamano de 0.0 GB refleja que solo contiene codigo de nodo y un perfil.

## Enlaces

- HuggingFace: https://huggingface.co/Granddyser/H3-Steady-Lab
- GitHub: https://github.com/Dyser-Space/H3-Steady-Lab
- Workflow de ejemplo: https://huggingface.co/Granddyser/H3-Steady-Lab/blob/main/example_workflow.json
- Video sin el parche: https://huggingface.co/Granddyser/H3-Steady-Lab/resolve/main/Media/without_h3_steady_lab.mp4
- Video con el parche: https://huggingface.co/Granddyser/H3-Steady-Lab/resolve/main/Media/with_h3_steady_lab.mp4
