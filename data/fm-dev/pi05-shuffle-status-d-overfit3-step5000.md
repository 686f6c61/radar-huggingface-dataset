# fm-dev/pi05-shuffle-status-d-overfit3-step5000

## Resumen

`fm-dev/pi05-shuffle-status-d-overfit3-step5000` es un checkpoint de inferencia de una política robótica para un brazo Franka, construido sobre el modelo base `physical-intelligence/pi05_base` (familia π0.5 de Physical Intelligence). El modelo está diseñado para una única tarea de manipulación: tras barajar unos vasos, pulsar el botón que hay junto al vaso que oculta un cubo. No se trata de un modelo de propósito general, sino de un experimento de sobreajuste (overfit) deliberado sobre tres trayectorias de entrenamiento concretas.

El checkpoint corresponde a una exportación EMA tras 5.000 actualizaciones del optimizador, con batch global 8 sobre una única GPU RTX A6000, lo que equivale a aproximadamente 227,27 épocas del sampler. La inicialización parte de π0.5 base con proyecciones cartesianas nuevas y adaptadores LoRA. El subconjunto de comportamiento contiene 158 ventanas de acción H20, y el modelo Status-D mezcla además ejemplos auxiliares de Status en su sampler.

Su relevancia es acotada y experimental: sirve como referencia para evaluar la receta de mezcla de datos, el uso de un head de Status aprendido y la integración de un componente externo ("Writer", desplegado con gemini-3.7-flash con actualizaciones disparadas por estado). No se ha publicado licencia, idiomas soportados, recuento de parámetros ni resultados de benchmarks, y la validación incluida se limita a comprobaciones de carga y salida sobre observaciones grabadas de entrenamiento, no a éxito real en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; política visión-lenguaje-acción derivada de `physical-intelligence/pi05_base` (π0.5), con proyecciones cartesianas nuevas y adaptadores LoRA |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible como ventana de tokens; consume 32 fotogramas de historial de cámara base, 528 tokens visuales y un contexto causal de transición de 48 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la única instrucción de tarea documentada está en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio incluye el directorio `params/`, `assets/`, `code/`, `requirements.txt` y `load_model.py` |

Datos adicionales del repositorio: tamano del repo 5,8 GB; pipeline declarado `robotics`; etiquetas `robotics`, `pi05`, `franka`, `lora`, `overfit`; creado el 2026-09-10; revisión de código fuente `4449f2c621e88d9a1b54f25c950d007708399caa`.

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion proporcionada. Se sabe que el modelo parte de `physical-intelligence/pi05_base` y que la inicialización anade proyecciones cartesianas nuevas mas adaptadores LoRA, manteniendo la normalización con las estadísticas originales del split de entrenamiento. La entrada combina vistas RGB de cámara base y de muñeca, estado Cartesian8 medido, 32 fotogramas de historial de cámara base muestreados uniformemente, un fotograma clave opcional del Writer, 528 tokens visuales, un subobjetivo actual del Writer y un head de transición Status aprendido. La receta desplegada del Writer usa gemini-3.7-flash con actualizaciones disparadas por estado, y el contexto causal de transición de 48 pasos desactiva el componente de mando del gripper.

El entrenamiento es intencionadamente de sobreajuste: 5.000 actualizaciones del optimizador sobre las mismas tres trayectorias Shuffle (episodios 111 `shuffle_20260908_170331_290`, 115 `shuffle_20260908_170704_618` y 131 `shuffle_20260908_171900_631`), con batch global 8 en una sola RTX A6000 y aproximadamente 227,27 épocas del sampler. El subconjunto de comportamiento contiene 158 ventanas de acción H20, y Status-D incorpora ejemplos auxiliares de Status al sampler, por lo que los recuentos de épocas incluyen esa mezcla. El resultado es una exportación de inferencia: no se incluye estado del optimizador ni de reanudación. La salida es de forma `[20,8]`, con acciones absolutas `[x, y, z, qx, qy, qz, qw, gripper_open]` en metros y cuaterniones XYZW unitarios, donde gripper 0 = cerrado y 1 = abierto. El componente de acción 7 no tiene supervisión de mando conocida en este subconjunto Shuffle y sus predicciones crudas quedan sin supervisar, tal como se registra en `assets/policy_metadata.json`.

## Capacidades

- Generación de acciones de manipulación robótica: produce trayectorias de 20 pasos con posición cartesiana, orientación en cuaternión y estado del gripper a partir de observaciones visuales y de estado.
- Política condicionada por lenguaje: acepta una instrucción textual de tarea; la documentada es "After the cups are shuffled, press the button next to the cup hiding the cube."
- Fusión multimodal: integra vistas RGB de cámara base y de muñeca, estado Cartesian8 medido, historial visual y contexto causal de transición.
- Head de Status aprendido: genera una señal de estado de transición usada para disparar actualizaciones del subobjetivo del componente Writer.
- Integración con componentes externos: requiere un subobjetivo vigente del Writer y su fotograma clave opcional, producidos por una receta separada basada en gemini-3.7-flash.
- Inferencia con historial causal real: la política exige historial observado real; la validación offline usa características de historial causal almacenadas y proyecciones del Writer grabadas.
- Soporte de tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión general o audio: no disponible; no se documenta ninguna de estas capacidades.

## Casos de uso

- Investigación en sobreajuste de políticas robóticas: el checkpoint permite reproducir y estudiar cómo una política π0.5 se especializa en tres trayectorias concretas, sirviendo de línea base frente a variantes con más datos.
- Validación de pipelines de carga y exportación: al incluir `load_model.py`, `requirements.txt`, `params/` y `assets/`, es útil para verificar que un flujo de exportación de π0.5 con LoRA se reconstruye correctamente antes de escalar a modelos mayores.
- Pruebas de integración del head de Status: permite comprobar cómo una señal de estado aprendida dispara actualizaciones de subobjetivo en la receta del Writer y cómo afecta eso a las acciones emitidas.
- Depuración de esquemas de acción en Franka: la salida `[20,8]` en metros y cuaterniones XYZW con gripper binario sirve para validar conversiones y convenciones de marcos antes de desplegar en hardware.
- Evaluación de mezclas de sampler: al documentar el número de épocas incluyendo los ejemplos auxiliares de Status, sirve para estudiar el efecto de mezclar tareas auxiliares en un conjunto de comportamiento pequeño de 158 ventanas H20.
- Comprobación de supervisión incompleta: el componente de acción 7 sin supervisión conocida es un caso de estudio útil para detectar y aislar dimensiones no supervisadas en políticas de manipulación.
- No es adecuado como componente de producción en robot real: la validación documentada se restringe a observaciones grabadas y no establece éxito en tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `inference-check.json` que verifica la carga del modelo y la forma de salida sobre observaciones grabadas de los tres episodios de entrenamiento, incluyendo entradas de aproximación y de contacto profundo con historial causal real. El propio autor indica que estas comprobaciones de carga y salida no establecen éxito en robot real ni un despliegue online del Writer.

## Requisitos de hardware

- Entrenamiento documentado: una única NVIDIA RTX A6000 (48 GB de VRAM), con batch global 8 y aproximadamente 227,27 épocas del sampler.
- VRAM de inferencia: no publicada. Como referencia, el repositorio ocupa 5,8 GB en disco para el export de inferencia, a lo que hay que anadir los pesos del modelo base π0.5 y el overhead del runtime; no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles. La única GPU mencionada en la informacion proporcionada es la RTX A6000 usada para entrenar.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ningún requisito mínimo de VRAM ni si cabe en tarjetas de gama consumer.
- Opciones de despliegue: el repositorio proporciona `load_model.py` y `requirements.txt` para construir la política y llamar a `observe` con observaciones reales. No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que se trata de una política robótica con entradas multimodales de estado y acción, estos servidores de LLM no son aplicables de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fm-dev/pi05-shuffle-status-d-overfit3-step5000` | Checkpoint objeto de esta ficha | no disponible | 32 fotogramas de historial, 528 tokens visuales, contexto causal de 48 pasos | no disponible | HuggingFace, repo de 5,8 GB |
| `physical-intelligence/pi05_base` | Modelo base sobre el que se construye | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de robótica VLA en la informacion proporcionada, ni de datos de rendimiento que permitan una comparación cuantitativa con el modelo base.

## Limitaciones y advertencias

- Sobreajuste deliberado: el modelo se ha entrenado durante 5.000 pasos sobre las mismas tres trayectorias, por lo que no cabe esperar generalización a tareas, objetos o entornos distintos.
- Sin licencia declarada: al no especificarse licencia, no hay autorización explícita de uso comercial ni condiciones de redistribución.
- Validación limitada: las comprobaciones documentadas se realizan sobre observaciones grabadas de entrenamiento y no demuestran éxito en robot real ni funcionamiento online del Writer.
- Dimensión no supervisada: el componente de acción 7 carece de supervisión de mando conocida en este subconjunto Shuffle, por lo que sus predicciones crudas no son fiables.
- Dependencia de historial real: la política requiere historial causal observado real; no funciona correctamente sin él, y la validación offline depende de características almacenadas y proyecciones grabadas del Writer.
- Dependencia de componentes externos: necesita el subobjetivo y el fotograma clave del Writer, generados por una receta separada basada en gemini-3.7-flash, lo que introduce una dependencia de terceros en el bucle de control.
- Contexto causal fijo: el contexto de transición de 48 pasos desactiva el componente de mando del gripper, un comportamiento que debe tenerse en cuenta al interpretar las acciones.
- Export de solo inferencia: no incluye estado de optimizador ni de reanudación, por lo que no es reanudable para continuar el entrenamiento tal cual.
- Idiomas: no se declara soporte multilingüe y la única instrucción documentada está en inglés.
- Sesgos conocidos y riesgo de alucinación: no disponibles en la informacion proporcionada; el head de Status y el subobjetivo del Writer son fuentes plausibles de error, pero no se cuantifican.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-status-d-overfit3-step5000
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Descarga directa: `hf download fm-dev/pi05-shuffle-status-d-overfit3-step5000 --local-dir ./shuffle-status-d-step5000`
- Revision del codigo fuente incluida: `4449f2c621e88d9a1b54f25c950d007708399caa`
- Papers, blogs, repositorios y demos adicionales: no disponible; la busqueda web realizada no devolvio resultados relacionados con el modelo.
