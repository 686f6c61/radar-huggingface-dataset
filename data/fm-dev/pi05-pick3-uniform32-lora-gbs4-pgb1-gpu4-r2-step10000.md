# fm-dev/pi05-pick3-uniform32-lora-gbs4-pgb1-gpu4-r2-step10000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo de visión-lenguaje-acción (VLA) π0.5 para la tarea de manipulación robótica denominada **pick3**, entrenado por el usuario `fm-dev` sobre una plataforma **Franka**. Se trata de la segunda ronda de entrenamiento (`r2`) y corresponde al paso **10.000** de un total planificado de **12.500 actualizaciones del optimizador**, lo que equivale a **40.000 exposiciones de muestra** de las 50.000 previstas. El ajuste se realizó con **LoRA de rango 32** sobre 4 GPU **NVIDIA RTX A6000**, con batch global 4 y batch por GPU 1, sin acumulación de gradientes.

El interés de esta publicación es fundamentalmente de investigación: no es un modelo de propósito general ni un artefacto listo para producción, sino un punto intermedio de una curva de entrenamiento que se publica con fines de reproducibilidad. El repositorio incluye pesos EMA de servicio, activos de normalización e historial, código de inferencia, versiones exactas de dependencias y el estado completo de reanudación (pesos no EMA, optimizador, RNG y sampler). El autor advierte explícitamente de que la publicación intermedia no constituye una evaluación de calidad de la política y de que una evaluación offline no establece la tasa de éxito en robot real.

La configuración de observación empleada, denominada **Uniform32**, muestrea 32 fotogramas de forma uniforme a lo largo del prefijo completo del episodio observado [0,t], con 512 tokens visuales e incluyendo el historial de demostraciones. El modelo base π0.5 pertenece a la familia de modelos VLA publicados por Physical Intelligence; el repositorio no declara el recuento de parámetros del modelo base ni detalles completos de su arquitectura, por lo que esos datos figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) π0.5 con adaptadores LoRA de rango 32; el repositorio no detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible (no se declara en el repositorio ni en la model card) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en terminos de tokens de lenguaje; ventana de observacion configurada en Uniform32: 32 fotogramas muestreados uniformemente sobre el prefijo [0,t] y 512 tokens visuales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta redactada en ingles; no se declara soporte multilingue) |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; el repositorio incluye pesos EMA de servicio, pesos no EMA, estado de optimizador/RNG/sampler y se carga mediante `from load_model import load, observe; policy = load()` |
| Tamano del repositorio | 12,8 GB (incluye pesos de servicio, activos de normalizacion/historial y estado de reanudacion completo) |
| Tarea objetivo | pick3 sobre manipulador Franka |
| Forma de salida | `(20, 8)`: xyz absoluto, cuaternion XYZW unitario en la carta de qx positiva y comando de pinza en [0,1] |
| Normalizacion | STD para estado y acciones numericas; los tokens de estado usan una vista acotada train-q01/q99 independiente |

## Arquitectura y entrenamiento

El artefacto es un ajuste fino de segunda ronda del modelo π0.5 mediante **LoRA de rango 32**, optimizado con **AdamW** y semilla 42. El entrenamiento se ejecuto localmente en 4 GPU RTX A6000 con batch global 4 y batch por GPU 1, sin acumulacion de gradientes, lo que implica un numero de actualizaciones igual al numero de muestras procesadas dividido por 4. El checkpoint publicado corresponde al paso 10.000 (40.000 exposiciones de muestra), dentro de una ejecucion cuyo objetivo son 12.500 actualizaciones del optimizador (50.000 exposiciones). El calendario de learning rate incluye un calentamiento de 250 actualizaciones hasta 5e-5 y una decaida coseno hasta 5e-6 en el paso 12.500. Se aplica un promedio exponencial de pesos con factor 0,999^4 = 0,996005996001, y los pesos EMA son los empleados para servicio.

La innovacion metodologica mas destacable es la estrategia de observacion **Uniform32**: se muestrean 32 fotogramas distribuidos uniformemente sobre el prefijo completo del episodio observado [0,t], incluyendo el historial de demostraciones, con 512 tokens visuales; las incrustaciones de estado historicas estan desactivadas. Solo las filas correspondientes a ejecucion del robot supervisan las acciones; las imagenes, caracteristicas y coordenadas originales de las demostraciones permanecen disponibles como historial, y el inicio de la ejecucion no reinicia el historial visual. Las particiones de episodios y la normalizacion usan unicamente el split de entrenamiento. Los componentes de accion desconocidos permanecen como NaN/false en el conjunto de datos y se enmascaran tanto en el condicionamiento de flujo como en la perdida; la model card indica que la lista de componentes totalmente sin supervisar es `[]`.

## Capacidades

- Generacion de acciones roboticas de manipulacion: produce trayectorias de efector final en forma `(20, 8)` con posicion absoluta xyz, orientacion como cuaternion unitario XYZW en la carta de qx positiva y comando de pinza normalizado en [0,1].
- Condicionamiento por historial visual: la configuracion Uniform32 permite procesar 32 fotogramas del prefijo del episodio con 512 tokens visuales, incorporando historial de demostraciones.
- Inferencia con estado persistente entre fotogramas mediante la funcion `observe(policy, base_rgb, state)`, que debe invocarse para cada fotograma observado, incluidas las demostraciones, y reiniciarse entre episodios.
- Modo Status-D: la inferencia acepta entradas explicitas `history_keyframe_index` (un fotograma observado o `None`), `current_subgoal` y entradas causales `transition_context_*`, y devuelve una salida `transition_status`.
- Reanudacion exacta del entrenamiento: el repositorio incluye estado no EMA, de optimizador, de RNG y de sampler, ademas de las dependencias fijadas.
- Integracion con un calendario de escritura exportado (`Writer schedule`) y su fotograma de control correspondiente.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento. Estas capacidades no estan documentadas en la informacion disponible.

## Casos de uso

- Manipulacion pick3 sobre Franka en laboratorio: el checkpoint se carga con `load()` y se despliega sobre un robot Franka cuyo controlador de recoleccion coincida con la convencion de pose cartesiana registrada, sin aplicar desplazamientos adicionales de herramienta o brida.
- Estudio de curvas de aprendizaje en VLA: al existir repositorios independientes para los pasos 5.000, 10.000 y 12.500, permite comparar el comportamiento de la politica en tres puntos de la misma ejecucion y aislar el efecto del numero de exposiciones de muestra.
- Reanudacion controlada de entrenamientos largos: el estado completo de resume permite continuar la ejecucion desde el paso 10.000 hasta las 12.500 actualizaciones previstas sin reconstruir el pipeline de datos ni el sampler.
- Reproduccion de experimentos de ajuste fino con LoRA: la semilla fija (42), el optimizador AdamW, el rango LoRA 32 y las versiones exactas de dependencias permiten replicar el ajuste en hardware equivalente (4 GPU de 48 GB, batch por GPU 1).
- Investigacion sobre condicionamiento por historial visual: la configuracion Uniform32, con 32 fotogramas y 512 tokens visuales por observacion, sirve para estudiar como afecta la longitud y el muestreo del historial a las politicas de manipulacion.
- Auditoria de supervisores incompletos: la model card documenta componentes sin supervisión de comando, en particular la salida de pinza de la tarea Shuffle, que no debe interpretarse como control aprendido, y las etiquetas limitadas de comando cerrado de Button Order; util para disenar enmascarados de perdida y de condicionamiento de flujo.
- Evaluacion offline de politicas: el repositorio permite ejecutar evaluaciones offline sobre datos, teniendo en cuenta que el autor advierte que estas no establecen la tasa de exito en robot real.
- Punto de partida para nuevas tareas de manipulacion: sirve como inicializacion para ajustes posteriores en tareas de picking dentro de la misma plataforma Franka y con la misma convencion de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de exito de tarea, y el propio autor senala que la publicacion intermedia no constituye una evaluacion de calidad de la politica y que la evaluacion offline, cuando se incluye, no establece la tasa de exito en robot real.

## Requisitos de hardware

- Entrenamiento declarado: 4 GPU NVIDIA RTX A6000 (48 GB de VRAM cada una), con batch por GPU 1 y batch global 4 sin acumulacion de gradientes.
- Tamano del repositorio: 12,8 GB, que incluye pesos EMA de servicio, pesos no EMA, estado de optimizador, RNG y sampler. El peso de los artefactos necesarios solo para inferencia es menor, pero su tamano exacto no esta declarado.
- VRAM necesaria para inferencia: no disponible. No se publican requisitos minimos ni perfiles de memoria para servicio.
- Encaje en GPU de consumo: no confirmado por el autor. Dado que el ajuste se hizo con adaptadores LoRA de rango 32 sobre el modelo base, es plausible que la inferencia quepa en GPU de consumo de gama alta, pero esta ficha no puede confirmarlo con la informacion disponible.
- Opciones de despliegue: la unica via documentada es la carga mediante el codigo incluido en el repositorio (`from load_model import load, observe`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; estos servidores estan orientados a modelos de lenguaje y no se declaran compatibles con esta politica VLA.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de tiempo por accion.
- Requisito de integracion: la convencion de pose cartesiana del efector final o herramienta grabada debe coincidir con la del controlador de recoleccion; no debe aplicarse un desplazamiento adicional de herramienta o brida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana de observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-pick3-uniform32-lora-gbs4-pgb1-gpu4-r2-step10000 | Ajuste LoRA de π0.5 (VLA) | no disponible | 32 fotogramas, 512 tokens visuales | pick3 sobre Franka | no disponible | Repositorio HuggingFace publico, 0 descargas, 0 likes |
| π0.5 base | VLA de Physical Intelligence | no disponible en la informacion proporcionada | no disponible | Manipulacion general | no disponible en la informacion proporcionada | Modelo base referenciado por el autor |
| Otros checkpoints de la misma ejecucion (pasos 5.000 y 12.500) | Mismo ajuste LoRA en distintos pasos | Identicos al modelo descrito | Identica configuracion Uniform32 | pick3 sobre Franka | no disponible | Repositorios independientes citados en la model card |
| Checkpoints intermedios en el archivo de respaldo (`fm-dev/pi05-checkpoint-backups`, ruta `checkpoints/r2`) | Mismo ajuste LoRA en otros pasos | Identicos al modelo descrito | Identica configuracion Uniform32 | pick3 sobre Franka | no disponible | Alojados en un repositorio de tipo dataset |

No se dispone de comparativas cuantitativas con alternativas de otros autores (por ejemplo, otras familias VLA open source) porque la informacion proporcionada no incluye resultados de rendimiento de ningun modelo.

## Limitaciones y advertencias

- La publicacion intermedia no es una evaluacion de calidad de la politica: el autor lo advierte de forma explicita. El checkpoint no debe interpretarse como una politica validada.
- La evaluacion offline, cuando se incluye, no establece la tasa de exito en robot real; se requiere validacion en hardware fisico.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial, la redistribucion o el uso derivado. Debe contactarse con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: el modelo esta orientado a acciones roboticas y no se documenta soporte multilingue ni capacidades de generacion de texto de proposito general.
- Convencion de pose critica: si la convencion cartesiana del efector final o herramienta no coincide con la del controlador de recoleccion, o si se aplica un desplazamiento adicional de herramienta o brida, las acciones resultantes seran incorrectas.
- Componentes sin supervisión: la salida de pinza de la tarea Shuffle no tiene supervision de comando y no debe interpretarse como control de pinza aprendido. Button Order solo dispone de etiquetas verificadas limitadas de comando cerrado.
- Muestras no supervisadas enmascaradas: los componentes de accion desconocidos permanecen como NaN/false y se enmascaran en el condicionamiento de flujo y en la perdida, lo que implica que el modelo no aprende sobre esas dimensiones.
- Normalizacion dependiente del split: la normalizacion y las particiones de episodios usan unicamente el split de entrenamiento, por lo que la transferencia a distribuciones de datos distintas no esta garantizada.
- Gestion de estado obligatoria: para modelos con historial, `observe()` debe llamarse en cada fotograma observado, incluidas las demostraciones, y el estado debe reiniciarse entre episodios; omitir este paso degrada o invalida la inferencia.
- Requisitos adicionales en modo Status-D: exige `history_keyframe_index` explicito, `current_subgoal` y entradas causales `transition_context_*`, ademas del calendario de escritura exportado y su fotograma de control correspondiente.
- Riesgo de sobreajuste a la plataforma: el ajuste esta especializado en la tarea pick3 sobre Franka, con un unico conjunto de datos y una unica convencion de control; no se documenta generalizacion a otras tareas, robots u objetos.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, mas alla de los derivados de la distribucion de demostraciones utilizada.
- Riesgo de alucinacion: no disponible; no se documenta comportamiento generativo de texto en este repositorio.
- Rendimiento no medido: no hay benchmark, ni latencia, ni throughput, ni tasa de exito publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fm-dev/pi05-pick3-uniform32-lora-gbs4-pgb1-gpu4-r2-step10000
- Archivo de respaldo de checkpoints (repositorio de tipo dataset): https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Repositorios independientes de los pasos 5.000 y 12.500: citados en la model card, sin URL explicita en la informacion proporcionada
- Modelo base π0.5 (Physical Intelligence): no se proporciona enlace en la informacion disponible
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada
