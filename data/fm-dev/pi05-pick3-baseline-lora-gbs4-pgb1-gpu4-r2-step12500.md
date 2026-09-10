# fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step12500

## Resumen

Este repositorio contiene un checkpoint de ajuste fino con LoRA de segundo ciclo (r2) sobre el modelo visión-lenguaje-acción π0.5 de Physical Intelligence, especializado en la tarea de manipulación robótica "pick3" sobre una plataforma Franka. Lo publica el usuario fm-dev y corresponde al paso 12.500 de optimización, equivalente a 50.000 exposiciones de muestra. El entrenamiento se realizó localmente en 4 GPU RTX A6000, con batch global 4 (batch por GPU 1) y sin acumulación de gradientes, con AdamW, rango LoRA 32 y semilla 42.

El interés de la ficha reside en que no es un modelo fundacional nuevo, sino un artefacto de investigación reproducible: el bundle incluye pesos EMA de serving, recursos de normalización e historial, código de inferencia, versiones exactas de dependencias y el estado completo de reanudación (no EMA, optimizador, RNG y sampler). El autor advierte explícitamente de que la publicación intermedia no constituye una evaluación de calidad de la política y de que no existe ninguna afirmación de tasa de éxito en robot físico.

Se trata de un repositorio con 0 descargas y 0 likes, sin licencia ni idiomas declarados, y con un peso total de 11,5 GB. La relevancia es por tanto acotada al ámbito de la robótica de investigación: sirve para reproducir y comparar el ajuste de π0.5 en una tarea concreta, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 de Physical Intelligence, ajustada con LoRA (rango 32) sobre el checkpoint base |
| Parametros totales | no disponible (el autor no publica recuento; el adaptador LoRA tiene rango 32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (configuracion no historial: imagen base, imagen de muneca, estado e instruccion de tarea del frame actual; el historial visual se conserva como recurso pero no reinicia con el inicio de ejecucion) |
| Tipos de cuantizacion | no disponible (se sirven pesos EMA; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (la instruccion de tarea se aporta como texto, pero no se declara idioma) |
| Licencia | no disponible (la model card no la especifica; el modelo base π0.5 tiene su propia licencia) |
| Formato de pesos | no disponible de forma explicita; el bundle incluye pesos EMA de serving, recursos de normalizacion e historial, codigo de inferencia y versiones exactas de dependencias (11,5 GB en total) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, la evolución del π0 de Physical Intelligence descrita como un VLA con generalización de mundo abierto, entrenado con "knowledge insulation" y sobre más de 10.000 horas de datos de robot según la documentación pública del modelo base. El ajuste aplicado aquí es un LoRA de rango 32 sobre ese backbone, orientado a una única tarea. La configuración menciona explícitamente "flow conditioning" en el enmascaramiento de componentes de acción no supervisados, coherente con el objetivo de flow matching del cabezal de acción de la familia π0.5.

El régimen de entrenamiento está documentado con detalle: warmup de 250 actualizaciones hasta 5e-5, decaimiento coseno hasta 5e-6 en el paso 12.500, EMA de 0,999^4 = 0,996005996001, optimizador AdamW, semilla 42 y guardado de checkpoints cada 1.000 actualizaciones. Los pasos 5.000, 10.000 y 12.500 tienen repositorios propios; el resto se conserva en un dataset de respaldo con estructura `task/method/stepN/`. Un detalle metodológico relevante es que solo las filas de ejecución del robot supervisan las acciones: las imágenes y características de demostración, así como las coordenadas originales de episodio y frame, se mantienen como historial, y el inicio de la ejecución no reinicia dicho historial visual.

Las salidas tienen forma `(20,8)`: posición absoluta xyz, cuaternión unitario XYZW en la carta de qx positivo y comando de gripper en [0,1]. El estado y las acciones numéricas usan normalización por desviación típica, mientras que los tokens de estado emplean una vista acotada train-q01/q99. Las componentes de acción desconocidas permanecen como NaN/false en el dataset y se enmascaran tanto en el condicionamiento de flow como en la pérdida. La convención de pose cartesiana del efector final grabada debe coincidir con la del controlador de recolección, sin aplicar offset adicional de herramienta o brida.

## Capacidades

- Generación de acciones de manipulación robótica en chunks de 20 pasos y 8 dimensiones (xyz absoluto, cuaternión XYZW, comando de gripper).
- Política visomotora que consume imagen de cámara base, imagen de muñeca, estado del robot e instrucción de tarea en lenguaje natural.
- Ejecución especializada en la tarea "pick3" sobre plataforma Franka, objeto del ajuste LoRA.
- Herencia de las capacidades del VLA base π0.5, descrito públicamente como modelo con generalización de mundo abierto, aunque el ajuste está orientado a una tarea concreta.
- Soporte de modo historial mediante `observe(policy, base_rgb, state)` por cada frame observado, incluidas las demostraciones, con reinicio entre episodios; el baseline publicado funciona sin historial.
- Variante Status-D con entradas causales adicionales: `history_keyframe_index` (frame observado o None), `current_subgoal` y `transition_context_*`, con salida que incluye `transition_status`.
- Supervisión parcial declarada: la salida de gripper de "Shuffle" no tiene supervisión de comando y no debe interpretarse como control de gripper aprendido; "Button Order" solo dispone de etiquetas de comando cerrado verificadas de forma limitada.
- No se documenta soporte de tool calling, function calling, comportamiento de agente multi-paso, capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo genera comandos de efector final y gripper directamente desde imágenes y estado, adecuado para reproducir la tarea "pick3" sobre un Franka en un entorno controlado de investigación.
- Estudio de ajuste eficiente de VLA: al ser un LoRA de rango 32 sobre π0.5, permite analizar cuánto rendimiento se obtiene con un presupuesto de 12.500 actualizaciones y 50.000 exposiciones de muestra.
- Comparación de checkpoints y ablaciones: los pasos 5.000, 10.000 y 12.500 tienen repositorios independientes, lo que facilita trazar curvas de aprendizaje con un protocolo homogéneo.
- Reproducción de experimentos: el bundle incluye semilla 42, `training_config.json`, estado completo de reanudación (optimizador, RNG, sampler) y versiones exactas de dependencias, lo que permite reanudar o auditar el entrenamiento.
- Punto de partida para ajustes propios: el pipeline de carga (`from load_model import load, observe; policy = load()`) y los recursos de normalización permiten continuar el ajuste hacia otras tareas de manipulación sobre el mismo tipo de robot.
- Verificación de interfaces de observación y acción: útil para validar convenciones de pose, normalización q01/q99 y forma de salida `(20,8)` antes de integrar una política en un stack mayor.
- Integración en pipelines de robótica basados en LeRobot u OpenPI: el modelo base π0.5 dispone de implementación en LeRobot adaptada del repositorio OpenPI, lo que da una vía de despliegue conocida.
- Docencia y formación interna: sirve como ejemplo completo de artefacto de fine-tuning en robótica, con pesos EMA, estado de reanudación y comprobaciones de inferencia empaquetada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica únicamente que se completó una evaluación offline y que las comprobaciones de inferencia desde el código empaquetado y de salidas finitas pasaron (`evaluation.json` y `packaged-inference-check.txt`). El propio autor subraya que la publicación intermedia no es una evaluación de calidad de la política y que la evaluación offline no establece una tasa de éxito en robot real.

## Requisitos de hardware

- Hardware de entrenamiento (dato confirmado por el autor): 4 GPU NVIDIA RTX A6000, batch global 4, batch por GPU 1, sin acumulación de gradientes.
- VRAM de inferencia: no publicada. Depende del checkpoint base π0.5 y de la precisión de servicio; el único dato sólido es la clase de acelerador usada en entrenamiento (RTX A6000, 48 GB por GPU).
- GPU de consumo: no disponible. No hay confirmación de que el bundle quepa o funcione correctamente en GPUs de consumo.
- Tamaño del bundle: 11,5 GB, que incluye pesos EMA de serving, estado no EMA, estado del optimizador, RNG y sampler; el almacenamiento necesario para servir la política es inferior al tamaño total del repositorio.
- Opciones de despliegue: carga mediante el propio bundle (`from load_model import load, observe; policy = load()`); el ecosistema de referencia es LeRobot, con implementación de π0.5 adaptada de OpenPI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step12500 (este) | LoRA sobre VLA π0.5, tarea pick3 | no disponible | no disponible (baseline sin historial) | no disponible | HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_base | VLA π0.5 base de Physical Intelligence | no disponible | no disponible | no disponible en la informacion | HuggingFace, documentado en LeRobot |
| π0.5 original (OpenPI) | VLA con generalizacion de mundo abierto, entrenado con knowledge insulation | no disponible | no disponible | no disponible en la informacion | Repositorio OpenPI y checkpoints base preentrenados con mas de 10.000 horas de datos de robot |
| π0 | VLA predecesor de π0.5 | no disponible | no disponible | no disponible en la informacion | Repositorio OpenPI |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este checkpoint ni cifras comparables extraídas de la información proporcionada. La diferencia funcional principal es que este repositorio es un artefacto de ajuste específico de tarea, con estado de reanudación completo, mientras que los modelos base son checkpoints generalistas de propósito amplio.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial ni redistribución sin aclarar la licencia del modelo base π0.5 y del adaptador.
- Sin evaluación de tasa de éxito en robot físico: el autor indica explícitamente que la evaluación offline no establece éxito real y que la publicación intermedia no es una evaluación de calidad.
- Supervisión parcial de acciones: la salida de gripper de "Shuffle" carece de supervisión de comando y no debe interpretarse como control de gripper aprendido; "Button Order" solo cuenta con etiquetas cerradas verificadas de forma limitada.
- Componentes de acción desconocidos se codifican como NaN/false y se enmascaran en el condicionamiento de flow y en la pérdida, lo que implica que el modelo no aprende sobre ellos.
- Convención de pose crítica: debe coincidir con la del controlador de recolección y no debe aplicarse un offset adicional de herramienta o brida; un desajuste produce comandos incorrectos.
- Dependencia del modo de uso: el baseline no usa historial, mientras que los modelos de historial requieren llamar a `observe()` en cada frame, incluidas las demostraciones, y reiniciar entre episodios; Status-D exige además `history_keyframe_index`, `current_subgoal` y entradas `transition_context_*` causales.
- Sesgos conocidos: no disponibles. Al derivar de un conjunto de demostraciones y de un modelo base entrenado con datos de robot, es esperable un sesgo hacia el entorno, la iluminación, la plataforma Franka y la distribución de la tarea pick3, pero no hay análisis publicado.
- Riesgo de alucinación: no evaluado en la información disponible; en políticas visomotoras el equivalente es la generación de trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento.
- Idiomas y contexto: no declarados; la instrucción de tarea es textual pero no se especifica cobertura lingüística.
- Tamaño del bundle: 11,5 GB con estado de reanudación, optimizador, RNG y sampler; conviene separar los pesos de serving antes de cualquier despliegue.
- Madurez: 0 descargas y 0 likes, con creación y actualización el mismo día, lo que indica ausencia de validación por terceros.
- Restricciones de producción: al ser un checkpoint de paso fijo y un experimento de investigación, no se recomienda su uso directo en sistemas críticos sin evaluación propia en el robot objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step12500
- Dataset de respaldo de checkpoints: https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Documentación de la política π0.5 en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Modelo base π0.5 de LeRobot: https://huggingface.co/lerobot/pi05_base
- Repositorio π0.5 (OpenPI): https://github.com/ldddddddl/pi05
- Código de LoRA (loralib): https://github.com/QingruZhang/baseline-lora
- Referencia de baselines del reto BEHAVIOR: https://behavior.stanford.edu/challenge/baselines.html
