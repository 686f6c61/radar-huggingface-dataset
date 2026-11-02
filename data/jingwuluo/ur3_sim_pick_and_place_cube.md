# JingwuLuo/ur3_sim_pick_and_place_cube

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de checkpoints de políticas robóticas basadas en π0.5 (pi0.5) del proyecto openpi de Physical Intelligence, adaptadas a una célula de trabajo con dos brazos UR3. La tarea consiste en que uno de los brazos coja uno de tres cubos y lo deposite sobre la mesa, un plato, una caja blanca u otro cubo. El autor, JingwuLuo, publica cuatro grupos de checkpoints que cubren desde el preentrenamiento en simulación MuJoCo hasta el ajuste fino con grabaciones reales teleoperadas.

El interés técnico del repositorio está en la comparación sistemática de tres esquemas de etiquetado del chunk de acciones de 10 puntos (por fotograma, bifásico y por curvatura) manteniendo idénticos datos, modelo y receta. Además, documenta un resultado contraintuitivo: el error en bucle abierto sobre datos reales no predice el éxito en bucle cerrado sobre el robot, ya que los adaptadores LoRA de la etapa 2 no completan la tarea a escala completa del adaptador mientras que la política de curvatura entrenada solo en simulación sí lo hace.

El repositorio ocupa 121,6 GB y no dispone de licencia declarada ni de idiomas especificados. No se trata, por tanto, de un modelo de propósito general, sino de un artefacto de investigación en robótica de manipulación con un alcance muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (openpi) con action expert; políticas VLA derivadas de pi05_base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints openpi por paso (carpetas tipo `3999/`); no se especifica safetensors ni GGUF |
| Tamano del repositorio | 121,6 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | JingwuLuo/ur3_sim_pick_and_place_cube (simulación) y 223 episodios reales teleoperados |
| Chunk de acciones | 10 puntos por inferencia |

## Arquitectura y entrenamiento

Las políticas se construyen sobre π0.5 mediante openpi y se organizan en dos etapas. La etapa 1 entrena únicamente el action expert sobre episodios guionizados de MuJoCo: 500 episodios en `sim/` (checkpoints en los pasos 5000 y 9999) y 1000 episodios en `sim2/` (paso 14999), esta última con relés entre los dos brazos y aproximaciones perturbadas. La etapa 2 parte de los checkpoints de la etapa 1: `sim_real/` aplica adaptadores LoRA sobre el action expert con 223 episodios reales teleoperados (paso 3999), mientras que `sim2_mix/` reentrena el action expert completo mezclando filas simuladas en cada lote con una proporción decreciente a lo largo del entrenamiento (paso 7999); una de las políticas incorpora además el estado del robot como entrada, activado de forma gradual.

La innovación metodológica no está en la arquitectura sino en el etiquetado del chunk de acciones. La variante per-frame etiqueta los siguientes 10 fotogramas de control (0,33 s de alcance). La bifásica distribuye 10 puntos uniformemente en el tiempo sobre 48 fotogramas, con un punto por fotograma alrededor de agarre, elevación y liberación. La de curvatura remuestrea sobre 48 fotogramas (1,6 s) colocando los puntos según la curvatura de la trayectoria, con mayor densidad por unidad de camino articular en los giros, como la inversión en un agarre o una liberación, y sin densidad extra en el tiempo ni en los eventos del gripper. Todo lo demás (datos, modelo y receta) es idéntico entre las tres variantes de cada grupo.

## Capacidades

- Manipulación robótica de pick-and-place sobre una célula UR3 de dos brazos: coger uno de tres cubos y colocarlo en mesa, plato, caja blanca u otro cubo.
- Generación de chunks de acciones de 10 puntos para control articular, con tres esquemas de etiquetado temporal distintos.
- Políticas entrenadas en simulación MuJoCo transferibles al robot real (la política de curvatura de `sim/` completa la tarea en bucle cerrado).
- Adaptación mediante LoRA sobre el action expert a partir de grabaciones reales teleoperadas.
- Entrenamiento con mezcla de datos simulados y reales (`sim2_mix/`), con proporción de simulación decreciente.
- Incorporación opcional del estado del robot como entrada en una de las políticas de `sim2_mix/`.
- No se documentan capacidades de lenguaje, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en etiquetado de acciones: comparar per-frame, bifásico y curvatura sobre datos, modelo y receta idénticos permite aislar el efecto del etiquetado en el error de predicción y en el éxito en bucle cerrado.
- Preentrenamiento en simulación como inicialización: usar los checkpoints de `sim/` o `sim2/` como punto de partida para ajuste fino con pocas grabaciones reales, aprovechando que la política de curvatura solo simulada ya resuelve la tarea en el robot.
- Estudio de transferencia sim-a-real: el repositorio documenta explícitamente que el error en bucle abierto sobre datos reales no predice el éxito en bucle cerrado, lo que lo convierte en material para diseñar métricas de evaluación más fiables.
- Ajuste con mezcla de datos: `sim2_mix/` sirve como referencia de receta para entrenar con filas simuladas intercaladas y proporción decreciente, útil cuando las grabaciones reales son escasas (223 episodios).
- Evaluación de adaptadores LoRA en robótica: `sim_real/` documenta el fallo a escala completa del adaptador y el éxito parcial a escala 0,5, un caso práctico para estudiar el escalado de actualizaciones de adaptadores en políticas VLA.
- Replicación de una célula UR3 en MuJoCo: el dataset de simulación asociado (revisiones `7fa3c586` y `5cd89567`) y los checkpoints permiten reproducir el entorno y las trayectorias guionizadas para experimentos propios.
- Docencia y experimentación en robótica de manipulación: el repositorio ofrece checkpoints intermedios y finales por etapa, lo que facilita analizar la evolución del entrenamiento paso a paso.

## Benchmarks y rendimiento

La model card presenta una tabla en bucle abierto (no mide éxito de tarea) sobre 5 episodios reales reservados (índices 54, 102, 122, 180, 185) y 10 simulados reservados (2, 100, 231, 234, 243, 287, 323, 325, 349, 463), con el servidor en modo `--uniform --cap 1`, inferencia cada 8 fotogramas y mediana en radianes del error máximo sobre las 12 articulaciones. Columnas: points / head / stitched.

| Etiqueta | Modelo | Simulado reservado | Real reservado |
|---|---|---|---|
| per-frame | etapa 1 | 0,138 / 0,112 / 0,045 | 0,157 / 0,130 / 0,066 |
| per-frame | etapa 2 | 0,174 / 0,140 / 0,066 | 0,132 / 0,108 / 0,055 |
| bifásica | etapa 1 | 0,236 / 0,106 / 0,046 | 0,296 / 0,119 / 0,063 |
| bifásica | etapa 2 | 0,276 / 0,122 / 0,054 | 0,229 / 0,107 / 0,055 |
| curvatura | etapa 1 | 0,472 / 0,110 / 0,053 | 0,418 / 0,116 / 0,061 |
| curvatura | etapa 2 | 0,499 / 0,135 / 0,067 | 0,382 / 0,107 / 0,058 |
| curvatura | solo episodios reales | 0,522 / 0,154 / 0,078 | 0,288 / 0,087 / 0,052 |

Conclusiones declaradas por el autor: la etapa 2 reduce el error real reservado de todas las etiquetas respecto a la etapa 1 y eleva el error simulado reservado. La política de curvatura entrenada solo con episodios reales (action expert completo desde `pi05_base`, 20.000 pasos, carpeta `223TrialsTrainData/pi05_ur3_cube_quick_v4h5_curvature_s48_pp/19999` de JingwuLuo/pick_and_place_cube_quick_ur3) obtiene menor error real reservado. Las políticas de `sim2/` no han sido evaluadas. No se publican tasas de éxito en bucle cerrado ni resultados en el simulador.

Prueba en robot real (cualitativa, sin tasas de éxito registradas): la política de curvatura de la etapa 1 de `sim/` realiza la tarea; una política entrenada solo con episodios reales realiza la tarea; las políticas de etapa 2 de `sim_real/` (LoRA) no realizan la tarea a escala completa del adaptador y aciertan a veces con la actualización escalada a 0,5. Las políticas de `sim2/` no se han ejecutado en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 121,6 GB e incluye múltiples checkpoints por etapa, por lo que el peso de un checkpoint individual no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. El autor no especifica hardware de entrenamiento ni de servicio.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas de openpi (el autor menciona el flag `--uniform --cap 1` en el servidor); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible; la evaluación usa una inferencia nueva cada 8 fotogramas y el despliegue es más rápido que la grabación, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (π0.5 UR3) | π0.5 / openpi | no disponible | no disponible | Simulación MuJoCo (500 y 1000 episodios) + 223 episodios reales | no disponible | HuggingFace, 0 descargas, 1 like |
| JingwuLuo/pick_and_place_cube_quick_ur3 | π0.5 / openpi | no disponible | no disponible | Solo episodios reales (20.000 pasos, curvatura) | no disponible | HuggingFace |
| π0.5 base (pi05_base, openpi) | π0.5 | no disponible | no disponible | Preentrenamiento general de Physical Intelligence | no disponible en la información proporcionada | openpi (GitHub) |

La comparación cuantitativa disponible se limita al error en bucle abierto: la política de curvatura entrenada solo con datos reales de `pick_and_place_cube_quick_ur3` obtiene 0,288 / 0,087 / 0,052 en real reservado frente a 0,382 / 0,107 / 0,058 de la etapa 2 equivalente de este repositorio. No hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje.

## Limitaciones y advertencias

- No hay licencia declarada: el uso comercial queda sin marco legal explícito y requiere contactar con el autor.
- El repositorio es un artefacto de investigación de alcance muy estrecho (una célula UR3 concreta, tres cubos y cuatro destinos); no generaliza a otras tareas ni robots sin reentrenamiento.
- El fallo documentado de los adaptadores LoRA de `sim_real/` en bucle cerrado a escala completa indica riesgo de que el error en bucle abierto no refleje el rendimiento real de despliegue.
- Las políticas de `sim2/` y `sim2_mix/` no se han probado en el robot y las de `sim2/` tampoco se han evaluado; su rendimiento real es desconocido.
- No se registran tasas de éxito en bucle cerrado ni resultados en simulador, solo pruebas cualitativas.
- El conjunto de evaluación real es de 5 episodios y el simulado de 10, tamaños reducidos que limitan la significación estadística.
- El repositorio de 121,6 GB agrupa muchos checkpoints; descargarlo completo puede ser inviable en entornos con espacio limitado.
- Riesgo de sobreajuste al entorno simulado: la etapa 2 eleva el error simulado reservado, lo que sugiere deriva respecto a la distribución de simulación.
- No se documentan sesgos, idiomas ni comportamientos de alucinación porque el artefacto no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JingwuLuo/ur3_sim_pick_and_place_cube
- Dataset de simulación: https://huggingface.co/datasets/JingwuLuo/ur3_sim_pick_and_place_cube
- Política entrenada solo con datos reales: https://huggingface.co/JingwuLuo/pick_and_place_cube_quick_ur3
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
