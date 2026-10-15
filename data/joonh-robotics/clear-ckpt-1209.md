# joonh-robotics/clear-ckpt-1209

## Resumen

CLEAR es un planificador para robótica publicado en HuggingFace bajo el identificador `joonh-robotics/clear-ckpt-1209`. Se distribuye como copia anónima de revisión (*anonymous review copy*): incluye el árbol de código fuente completo bajo `clear/` y 153 checkpoints preentrenados. El repositorio ocupa 4,1 GB y los checkpoints suman 1,8 GB. No hay model card convencional; el README funciona como guion de reproducción.

El modelo cubre tres familias de tareas: planificación en rejillas 2D (`grid`), navegación en laberintos (`maze`) y políticas de locomoción para los robots G1 (humanoide), Go1 y Spot (cuadrúpedos). La salida del planificador incluye transitabilidad predicha, interacciones ordenadas con objetos y ruta resultante.

Su relevancia ahora mismo es doble: expone un pipeline reproducible en CPU en unos cinco minutos y distribuye los pesos en formato `.pt` de PyTorch, lo que obliga a aplicar precauciones de seguridad al cargarlos. Licencia, idiomas y número de parámetros no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo lo describe como "planner"; no detalla tipo de red, capas ni mecanismo de atención) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (153 checkpoints, 1,8 GB, verificados por SHA-256); código fuente en Python y `.zip` |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna: describe CLEAR como un planificador con cinco acciones en `run.py` (`train`, `plan`, `evaluate`, `refine`, `report`) y una separación entre código de runtime (`runtime/clear/`, con modelo, datos y planificación) y código de experimentos (`runtime/experiments/`). No se indican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o aprendizaje por refuerzo, aunque la presencia de políticas de locomoción para G1, Go1 y Spot es compatible con entrenamiento en simulación física, cuyos extras opcionales se declaran en `pyproject.toml`.

Los artefactos distribuidos se organizan en cuatro bloques: `checkpoints/grid/` (modelos de referencia, variantes e historial de entrenamiento en rejillas 2D), `checkpoints/maze/` (navegación de referencia con semillas 0-2, transferencia de cuerpo y planificación conjunta) y `checkpoints/locomotion/` (políticas para G1, Go1 y Spot). Existen además cinco experimentos de referencia: exp1 grid, exp2 manipulation, exp3 maze, exp4 replanning y exp5 maze v4. El autor afirma que la planificación y la evaluación con los checkpoints de referencia están verificadas, pero no reclama poder reentrenar cada experimento de extremo a extremo.

## Capacidades

- Planificación de rutas: genera `plan.json` con transitabilidad predicha, interacciones ordenadas con objetos y ruta resultante.
- Navegación en laberintos: checkpoints de referencia `maze/reference/seed0-2` para entornos de navegación.
- Planificación en rejillas 2D: modelos de referencia y variantes en `checkpoints/grid/`, con historial de entrenamiento incluido.
- Replanificación: experimento exp4 dedicado a recalcular planes ante cambios en el entorno.
- Manipulación: experimento exp2 orientado a interacciones ordenadas con objetos.
- Locomoción de cuadrúpedos: políticas para Go1 (Unitree) y Spot (Boston Dynamics).
- Locomoción humanoide: políticas para G1 (Unitree).
- Transferencia de cuerpo (*body transfer*): reutilización de políticas entre morfologías distintas.
- Planificación conjunta (*joint planning*): combina locomoción y planificación en un mismo pipeline.
- Entrenamiento y refinamiento: `run.py train` y `run.py refine` sobre el árbol de código fuente.
- Evaluación e informes: `run.py evaluate` y `run.py report`.
- No se declara soporte de *tool calling*, agentes conversacionales, capacidades multilingües ni visión.

## Casos de uso

- Navegación autónoma en interiores: usar `checkpoints/maze/reference/seed0/clear.pt` con una escena de entrada en JSON para obtener transitabilidad y ruta antes de ejecutar el movimiento en el robot.
- Replanificación ante obstáculos dinámicos: el experimento exp4 permite recalcular el plan cuando el entorno cambia, algo necesario en almacenes con tráfico de personas o vehículos.
- Manipulación secuenciada: el experimento exp2 devuelve interacciones ordenadas con objetos, útil para tareas de recogida y colocación donde el orden importa.
- Control de cuadrúpedos: las políticas de locomoción para Go1 y Spot pueden emplearse como capa de bajo nivel bajo un planificador de alto nivel.
- Control de humanoides: las políticas para G1 permiten trasladar el mismo esquema de planificación a un robot bípedo.
- Transferencia de políticas entre robots: la carpeta de *body transfer* sirve para adaptar una política entrenada en una morfología a otra sin reentrenar desde cero.
- Investigación reproducible: el pipeline de CPU con verificación SHA-256 y 1,8 GB de checkpoints permite validar resultados en una máquina sin GPU.
- Docencia y evaluación de planificadores: `run.py evaluate` y `run.py report` permiten montar comparativas entre variantes del propio modelo sobre las escenas de `runtime/data/`.
- Integración en simulación: los *assets* de robots y simulación en `runtime/assets/` permiten cerrar el bucle entre plan y ejecución en un entorno simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma que la planificación y la evaluación con los checkpoints de referencia están verificadas, sin cifras de éxito, error de ruta ni comparaciones cuantitativas.

## Requisitos de hardware

- Inferencia en CPU: verificada por el autor para `plan` y `evaluate` con los checkpoints de referencia, en Python 3.11 y `torch>=2.7` (rueda de CPU). El ejemplo de reproducción tarda unos cinco minutos.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible. No se citan modelos concretos de GPU.
- GPU de consumo: no se especifica; el flujo verificado es exclusivamente en CPU.
- Almacenamiento: 4,1 GB de repositorio más 1,8 GB de checkpoints descargables por separado mediante `tools/fetch_checkpoints.py` (descarga reanudable y verificada por SHA-256).
- Simulación física y experimentos de manipulación: requieren los extras opcionales declarados en `pyproject.toml`; no se detallan dependencias ni hardware.
- Despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el único punto de entrada documentado es `python run.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni especificaciones de parámetros de CLEAR, y tampoco datos de modelos alternativos de la misma categoría de planificación robótica, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| CLEAR (`joonh-robotics/clear-ckpt-1209`) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial; hay que tratarlo como uso restringido a investigación hasta que el autor lo aclare.
- Formato `.pt`: a diferencia de `safetensors`, los ficheros pickle de PyTorch pueden ejecutar código al cargarse. Se recomienda cargar con `weights_only=True` y verificar el SHA-256 contra `docs/checkpoint_paths.json`.
- Copia de revisión anónima: el repositorio y el ZIP de origen apuntan a un dominio anónimo (`anonymous-hf.com`), por lo que la disponibilidad a largo plazo y la autoría no están garantizadas.
- Sin resultados de benchmarks: no hay cifras públicas de éxito, robustez ni generalización.
- Reentrenamiento no garantizado: el autor solo verifica planificación y evaluación con los checkpoints de referencia; no reclama reproducir el entrenamiento completo de cada experimento.
- Dependencia de simulación: parte de los experimentos (simulación física y manipulación) necesitan extras opcionales no detallados, lo que puede complicar la reproducción exacta.
- Sin datos de sesgo ni de alucinación: al no ser un modelo de lenguaje, estas categorías no aplican, pero tampoco se documenta el comportamiento del planificador ante escenas fuera de distribución.
- Idiomas no declarados: no hay información sobre localización ni sobre el idioma de la documentación más allá del README en inglés.
- Cero descargas y cero likes: no existe validación por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joonh-robotics/clear-ckpt-1209
- Archivo de código fuente citado en la model card: https://anonymous-hf.com/api/a/p5icltdspejh/resolve/clear-source.zip
- Perfil de HuggingFace `jwhong1209` (Jeongwoo Hong), aparecido en la búsqueda web; relación con el autor no confirmada: https://huggingface.co/jwhong1209
- Guía sobre diferencias de seguridad entre `.safetensors`, `.ckpt` y `.pt`: https://modeltrends.ai/ai-model-guides/safetensors-vs-ckpt-safe-model-downloads
- Documentación de InvokeAI sobre ficheros `.ckpt`: https://invoke.ai/concepts/models/
- Ejemplo de `model.ckpt` en el repositorio TripoSR de Stability AI: https://huggingface.co/stabilityai/TripoSR/blob/main/model.ckpt
- Lista curada de modelos de seguridad ofensiva (resultado de búsqueda, sin relación con CLEAR): https://github.com/JoasASantos/Offensive-Security-AI-Models
