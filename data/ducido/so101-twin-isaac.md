# ducido/so101-twin-isaac

## Resumen

`ducido/so101-twin-isaac` no es un modelo de lenguaje: es un repositorio de activos de simulación para Isaac Sim que contiene un gemelo digital del robot SO-101 (brazo manipulador de bajo coste de la familia LeRobot). El autor, `ducido`, publica un paquete orientado a reproducir en simulación la tarea "coger el cubo rojo y volver a dejarlo en su sitio" (`lift the red cube and then place it back`), con la articulación del robot, el cubo, la mesa, las cámaras calibradas y la escena estática.

El contenido principal son dos piezas: un USD unificado (`so101_twin.usdz`) que, según la model card, estaba en proceso de exportación en el momento de la publicación y aún no había sido verificado en Isaac (carga headless más 60 pasos de física), y una reconstrucción 3DGS (Gaussian Splatting) de la escena estática en formato INRIA con grado de armónicos esféricos 3 y 817 000 gaussianas, ofrecida tanto en `.ply` como en `.usdc` para su uso como `ParticleField3DGaussianSplat`.

La relevancia es acotada pero clara para quien trabaja en sim-to-real con robots de bajo coste: el paquete fija el frame del mundo al `base_link` del robot, incluye cámaras con intrínsecos y pose calibrados (`cam_agentview` cenital y `cam_robot0_eye_in_hand` en muñeca) y documenta qué elementos no viajan dentro del USD (ganancia de color por cámara, placa de fondo y ajustes de render RTX), lo que evita sorpresas al replicar el pipeline de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un paquete de activos de simulación: USD/PhysX + 3D Gaussian Splatting) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.usdz` (USD empaquetado), `.ply` (3DGS, layout INRIA, SH grado 3), `.usdc` (ParticleField3DGaussianSplat), `SHA256SUMS` |
| Tamaño del repositorio | 0,4 GB |
| Versión de Isaac Sim probada | 6.2.0 |
| Gaussians en el splat | 817 000 |
| Cámaras incluidas | `cam_agentview` (cenital), `cam_robot0_eye_in_hand` (muñeca), con K y pose calibrados |

## Arquitectura y entrenamiento

El paquete no entrena ninguna red. El componente USD describe una articulación SO-101 con *joint drives* de PhysX fijados a la pose inicial de la demo, un cubo con masa y material físico, mesa y partes estáticas con texturas horneadas, dos cámaras con intrínsecos y pose calibrados, iluminación de tipo domo más luz distante proveniente de `shade.json`, y una escena física. El objetivo declarado es que, al pulsar Play, el brazo mantenga la pose de arranque y el cubo repose sobre la mesa.

El segundo componente es una reconstrucción 3DGS de la escena estática (`splat_v4.ply`, "oa1 v4"), en layout INRIA con grado de armónicos esféricos 3 y 817 000 gaussianas, cuyo sistema de referencia coincide con el `base_link` del robot y, por tanto, con el frame del mundo del gemelo. Se ofrece también convertida a `ParticleField3DGaussianSplat` mediante `omni.kit.converter.gsplat`, con prim por defecto `/Splat` y transformación identidad. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, porque no aplican.

## Capacidades

- Reproducción en Isaac Sim de la escena de manipulación de la tarea "coger el cubo rojo y devolverlo a su sitio".
- Articulación SO-101 con *joint drives* PhysX configurados a la pose inicial de la demo.
- Cámaras calibradas (vista cenital de agente y vista de muñeca) listas para usarse en pipelines de aprendizaje por imitación o visión.
- Fondo fotorrealista opcional mediante Gaussian Splatting, con requisito de GPU RTX.
- Verificación de integridad de todos los ficheros mediante `SHA256SUMS`.
- Exportación de los ajustes de render RTX dentro de `customLayerData` (`so101_twin`) y en `export_info.json`, para replicar la configuración de render.
- No incluye: modelos de política, checkpoints de aprendizaje, tool calling, capacidades de lenguaje, visión semántica ni agentes.

## Casos de uso

- **Entrenamiento de políticas por imitación en simulación**: cargar `so101_twin.usdz` en Isaac Sim 6.2.0 y usar las cámaras `cam_agentview` y `cam_robot0_eye_in_hand` como observaciones para entrenar una política que recoja y deposite el cubo, aprovechando que la pose inicial y la física ya están fijadas.
- **Sim-to-real con SO-101**: emplear el gemelo como entorno de referencia para transferir políticas al robot físico, dado que el frame del mundo coincide con el `base_link` y las cámaras llevan intrínsecos y pose calibrados.
- **Validación de reconstrucciones 3DGS en Isaac**: usar `splat/splat_v4.usdc` como fondo de la escena para evaluar cómo afecta el realismo visual a la robustez de políticas entrenadas con observaciones sintéticas.
- **Depuración de setups de física**: al pulsar Play, comprobar que el cubo reposa sobre la mesa y el brazo mantiene la pose, lo que sirve como test de humo de la configuración de PhysX y de los drives antes de lanzar entrenamientos largos.
- **Reproducción de experimentos de terceros**: el paquete fija pose inicial, materiales, iluminación y ajustes de render, lo que permite replicar exactamente la escena de la demo en otra máquina y comparar resultados de políticas.
- **Generación de datos sintéticos con anotaciones de cámara**: las cámaras calibradas permiten proyectar puntos 3D a imagen y generar pares imagen-anotación para tareas de detección o segmentación del cubo en el contexto de la manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el USD no había sido verificado en Isaac (carga headless más 60 pasos de física) en el momento de la publicación y que el resultado se añadiría más adelante.

## Requisitos de hardware

- **GPU**: se requiere una GPU RTX para renderizar el fondo de Gaussian Splatting; para el USD con PhysX no se especifica requisito adicional en la información disponible.
- **VRAM estimada**: no disponible.
- **GPU recomendadas**: no disponible (la model card solo menciona "RTX GPU" para el splat).
- **Compatibilidad con GPU de consumo**: no disponible; la única referencia es la necesidad de una RTX para el splat.
- **Software**: Isaac Sim 6.2.0 (versión probada). Para el splat, extensión `omni.kit.converter.gsplat`; si no renderiza, ejecutar `isaacsim.replicator.nurec_utils.rendering_setup.setup_for_rendering(stage)`.
- **Opciones de despliegue**: apertura directa en Isaac Sim (File → Open → `so101_twin.usdz`); el splat se añade como referencia en `/World/Splat` con transformación identidad.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros gemelos digitales de SO-101 ni paquetes comparables de escenas 3DGS para Isaac Sim con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El USD `so101_twin.usdz` no estaba verificado en Isaac en el momento de la publicación (carga headless más 60 pasos de física pendientes); su correcto funcionamiento no está confirmado.
- No se transportan dentro del USD la ganancia de color por cámara ni la placa de fondo, que forman parte del posprocesado del pipeline de entrenamiento; replicar el aspecto exacto exige reconstruir ese posprocesado.
- Los ajustes de render RTX no viajan en el USD y deben recuperarse de `customLayerData` (`so101_twin`) y de `export_info.json`.
- El splat requiere GPU RTX y puede necesitar la llamada de inicialización `setup_for_rendering` si no se renderiza a la primera.
- La licencia no está declarada, por lo que no puede asumirse uso comercial ni redistribución sin consultar al autor.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline ni idiomas declarados: no hay evidencia de uso por terceros ni de validación externa.
- No es un modelo de lenguaje: no admite inferencia de texto, tool calling, agentes ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ducido/so101-twin-isaac
- Artículo de referencia sobre entrenamiento sim-to-real de SO-101 con NVIDIA Isaac (resultado de búsqueda, URL ofuscada): http://go/v1/AX8ifOQusj2rawQdKAGQ_m93m6OxByu50nE1g2ckg9SFYtpuP7boOuPyo4Wi0_Em14uIHti0x3YqgyS3GvNvHI-mx04R1d2aak3aHxHidfzCNaeqyUs-O2dAk_B1WCUiXmbNEjKZlIIOwJ1mJciyOxGHR816f4KtL2s_yhOc9f84QMAh0lY99TgjgRHBt8tBcmDEV7gB9a2_341pfPGi46vZXFc3M2moGXP-_MzIRw6kwUflVdtQ_FLkN-gqx743RbrDw
- Documentación de Isaac Sim: no disponible en la información proporcionada.
- Paper de 3D Gaussian Splatting (INRIA): no disponible en la información proporcionada.
