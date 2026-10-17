# shrg7/pi05-oer10mix-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-16k

## Resumen

Este repositorio contiene un checkpoint de pi0.5 (openpi, JAX) publicado por el usuario shrg7. Se trata de un modelo vision-language-action (VLA) orientado a manipulación robótica, concretamente a tareas de pick-and-place. El checkpoint corresponde al paso 15.999, es decir, 16.000 actualizaciones del optimizador de un entrenamiento previsto hasta 100.000, por lo que es un estado intermedio y no el modelo final.

La particularidad del checkpoint es que la política recibe una descripción del robot que controla: una tabla de hasta 8 articulaciones por 27 números por articulación (límites articulares, anchura del gripper, etc.) que se codifica mediante una red pequeña denominada URMA y se inyecta en el condicionamiento del experto de acciones. Esto permite, en principio, adaptar la política a distintos robots sin cambiar los pesos. El entrenamiento parte de pi05_base con ajuste fino completo y mezcla datos de DROID (60,1%), MolmoBot (15,4%), simulación real-rig (7,4%) y simulación multi-robot OER-10 (17,2%).

El repositorio ocupa 12,5 GB e incluye pesos en formato Orbax, estadísticas de normalización y la tabla de descripciones de robots. No se documentan parámetros totales, contexto, licencia ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA) con cabeza FAST-token y experto de acciones flow-matching; implementación JAX/openpi |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos Orbax, sin cuantizaciones documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX); incluye assets/ y oer10_urma_v1/robot_descriptions_v1.npz |
| Tarea | pick-and-place |
| Horizonte de acción | 16 |
| Checkpoint | 15999 (16.000 actualizaciones); rama pi05-oer10-urma, commit 37764198 |
| Entrenamiento | 4xH200, FSDP 4, batch 512 (256 x 2 acumulados) hasta el paso 6.000; después 256 |
| Tamaño del repo | 12,5 GB |
| Normalización | tabla global de cuantiles sobre la mezcla de datos |
| Pesos publicados | EMA con decay 0,99; no incluye estado del optimizador |

## Arquitectura y entrenamiento

El modelo se describe como pi0.5, un VLA de openpi implementado en JAX. La receta emplea un objetivo dual con aislamiento de conocimiento: una cabeza FAST-token y un experto de acciones basado en flow-matching. La política se inicializa desde pi05_base y se ajusta completamente; las capas URMA se inicializan desde cero con su capa de salida a cero. Para cada ejemplo, el modelo lee una tabla de hasta 8 articulaciones x 27 números por articulación, la codifica con URMA y la usa como condicionamiento del experto de acciones. La fila correspondiente se localiza mediante una huella (fingerprint) de la cadena embodiment_params del episodio.

El entrenamiento usa una mezcla por recuento de episodios: DROID 60,1%, MolmoBot 15,4%, simulación real-rig (realrig9k) 7,4% y simulación multi-robot OER-10 17,2%. Se aplica calentamiento de 1.000 pasos, LR plano de 5e-5, EMA 0,99 y horizonte de acción 16. El lote es 512 (256 x 2 acumulados) hasta el paso 6.000 y después 256; el nombre de la configuración sigue indicando b512. La normalización utiliza una única tabla global de cuantiles sobre esta mezcla, incluida en assets/. El checkpoint publicado es el 15999 (16.000 actualizaciones) de un run que llega a 100.000; solo se incluyen pesos EMA y no el estado del optimizador. El entrenamiento se realizó con 4xH200 y FSDP 4.

## Capacidades

- Manipulación pick-and-place: la política está entrenada específicamente para tareas de recogida y colocación; no se documentan otras habilidades de manipulación.
- Condicionamiento por robot: lee una tabla de hasta 8 articulaciones x 27 números por articulación y la codifica mediante URMA para condicionar el experto de acciones.
- Control con horizonte de acción 16: genera secuencias de acción de 16 pasos, según la configuración del entrenamiento.
- Modelo VLA: se etiqueta como vision-language-action, aunque la model card no detalla el formato exacto de las entradas visuales o de lenguaje.
- Entrenamiento multi-robot: incluye datos de simulación multi-robot OER-10 y una tabla de descripciones para cada robot de entrenamiento.
- Soporte de tool calling / function calling: no documentado; no es un modelo de texto general.
- Soporte de agentes y multi-step reasoning: no documentado; la política está orientada a control de manipulación.
- Capacidades multilingües: no disponible.
- Capacidades especiales: condicionamiento URMA por descripción del robot, pesos EMA y normalización global sobre la mezcla de datos.

## Casos de uso

- Pick-and-place en almacén con flota heterogénea: el modelo puede adaptar la política a distintos robots leyendo su tabla de límites articulares y anchura de gripper, lo que evita reentrenar por cada modelo de brazo.
- Automatización de laboratorio: uso en tareas de recogida y colocación de muestras o viales, aprovechando el horizonte de acción de 16 para secuencias cortas y repetitivas.
- Investigación en políticas VLA multi-robot: el checkpoint sirve como punto de partida para reproducir la receta de aislamiento de conocimiento y comparar el efecto del condicionamiento URMA frente a políticas sin descripción del robot.
- Evaluación en simulación many-robot: los datos OER-10 (17,2% de la mezcla) permiten probar la política en entornos simulados con varios robots antes de pasar a hardware real.
- Despliegue en entornos tipo DROID: al proceder el 60,1% de los episodios de DROID, el checkpoint es más adecuado para configuraciones y cámaras similares a ese conjunto.
- Ajuste fino posterior: al ser un ajuste completo desde pi05_base, puede usarse como inicialización para especializar la política en una célula o robot concreto, aunque no incluye estado del optimizador para reanudar el entrenamiento original.
- Prototipos de células flexibles: permite cambiar la descripción del robot sin modificar los pesos, lo que facilita probar la misma política en bancos de pruebas con articulaciones y grippers distintos.
- Ablaciones sobre normalización global: la tabla global de cuantiles incluida en assets/ permite estudiar cómo afecta una normalización única frente a normalizaciones por robot o por conjunto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,5 GB en disco, pero no se especifica el uso de VRAM.
- GPU recomendadas: para entrenamiento se documentan 4xH200 con FSDP 4; para inferencia no se indican modelos concretos.
- ¿Cabe en GPU consumer?: no disponible; no se documenta el despliegue en GPU de consumo.
- Opciones de despliegue: el checkpoint es Orbax para JAX/openpi; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.
- Espacio en disco: 12,5 GB para el repositorio completo, incluyendo params/, assets/ y la tabla NPZ de descripciones de robots.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este checkpoint | pi0.5 VLA ajustado, 16.000 actualizaciones | no disponible | no disponible | pick-and-place | no disponible | Orbax |
| pi05_base | pi0.5 base usado como inicialización | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Otros VLA de la misma categoría | alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto, rendimiento o licencia de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Sin benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K ni métricas de manipulación en la información disponible.
- Checkpoint intermedio: corresponde al paso 15.999 de un entrenamiento previsto hasta 100.000, por lo que no representa el estado final de la receta.
- Solo pesos EMA: no incluye el estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde este punto.
- Tarea limitada: está entrenado para pick-and-place; no se documentan garantías para otras tareas de manipulación.
- Dependencia de la tabla de robot: el condicionamiento URMA requiere la tabla de hasta 8 articulaciones x 27 números por articulación y la huella de embodiment_params; robots fuera de la tabla pueden no funcionar correctamente.
- Normalización global: una única tabla de cuantiles sobre la mezcla puede no transferir bien a robots o entornos fuera de la distribución de entrenamiento.
- Sesgo hacia DROID: el 60,1% de los episodios provienen de DROID, por lo que el comportamiento puede estar dominado por ese dominio.
- Brecha sim-to-real: parte de los datos son de simulación (realrig9k 7,4% y OER-10 17,2%), con el riesgo de transferencia que ello implica.
- No se documentan sesgos, idiomas, seguridad ni comportamiento en entornos no controlados.
- No es un modelo de texto general: no se documentan tool calling, agentes multi-step, thinking mode, visión general, audio ni capacidades multilingües.
- Requisitos de inferencia no documentados: no hay estimación de VRAM, latencia o throughput para despliegue.

## Enlaces

- https://huggingface.co/shrg7/pi05-oer10mix-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-16k
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
