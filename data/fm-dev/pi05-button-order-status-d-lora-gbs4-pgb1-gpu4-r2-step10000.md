# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step10000

## Resumen

Este repositorio contiene un ajuste fino por LoRA de segunda ronda (`r2`) sobre el modelo π0.5, orientado a la tarea robótica denominada **button_order** en un entorno Franka. Se publica el checkpoint correspondiente a 10.000 actualizaciones del optimizador, dentro de un entrenamiento que tiene como objetivo 12.500 actualizaciones (50.000 exposiciones de muestra). El autor es `fm-dev` y el repositorio ocupa 12,8 GB, incluyendo pesos de servicio EMA, activos de normalización e historial, código de inferencia y estado completo de reanudación.

El interés de esta ficha es acotado: no se trata de un modelo de lenguaje generalista, sino de una política visomotora (vision-language-action) especializada en manipulación robótica, con una variante concreta denominada **Status-D** que incorpora 32 fotogramas muestreados uniformemente del prefijo de episodio observado [0,t], un keyframe nullable del componente Writer (528 tokens visuales en total) y un subobjetivo actual mantenido por el Writer. El propio autor advierte que la publicación intermedia no constituye una evaluación de calidad de la política.

La relevancia para desarrolladores e investigadores es doble: por un lado, documenta un pipeline reproducible de ajuste fino LoRA sobre π0.5 con configuración de entrenamiento detallada; por otro, expone explícitamente las cautelas metodológicas del experimento (etiquetas no revisadas enmascaradas, supervisión solo en filas de ejecución real, proveniencia de revisión por agente/modelo y no por humano). No obstante, la información pública es incompleta: no se declaran licencia, idiomas, número de parámetros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste fino LoRA (rank 32) sobre el modelo base π0.5; condicionamiento por flow matching segun la model card; detalle completo de la arquitectura base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible en tokens; la variante Status-D emplea 32 fotogramas muestreados del prefijo [0,t] mas un keyframe Writer (528 tokens visuales) y un contexto de Status de 48 pasos |
| Tipos de cuantizacion | no disponible (se publican pesos de servicio EMA; no se documentan cuantizaciones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni en los metadatos de HuggingFace ni en la model card) |
| Formato de pesos | no especificado; el repositorio incluye pesos EMA de servicio, activos de normalizacion/historial, codigo de inferencia, versiones exactas de dependencias y estado de reanudacion (no-EMA, optimizador, RNG y sampler) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino de segunda ronda (`r2`) sobre π0.5, con adaptadores LoRA de rango 32. El entrenamiento se realizó localmente en 4 GPU RTX A6000, con batch global 4 y batch por GPU 1, sin acumulación de gradientes. El checkpoint publicado corresponde a 10.000 actualizaciones, equivalentes a 40.000 exposiciones de muestra, de un total planificado de 12.500 actualizaciones y 50.000 exposiciones. Los checkpoints se guardan cada 1.000 actualizaciones y en la actualización final 12.500. Se emplea AdamW con semilla 42, warmup de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500. El EMA aplicado es 0.999^4 = 0.996005996001 y la configuración completa está en `training_config.json`.

La innovación técnica del experimento reside en el esquema **Status-D**: se toman 32 fotogramas uniformemente muestreados del prefijo de episodio observado [0,t], más un keyframe nullable del Writer, con un subobjetivo actual mantenido. El Writer se inicializa al comienzo de la ejecución y se actualiza en los eventos de Status; su temporización offline se proyecta mediante estimaciones gruesas de eventos, lo que el autor describe explícitamente como condicionamiento de profesor (teacher conditioning) y no como una rollout online con Status predicho. Las ventanas positivas de Status usan corchetes de eventos soportados, y la supervisión de endpoints y negativos proviene únicamente de ventanas revisadas explícitamente; las etiquetas no revisadas permanecen enmascaradas. El contexto de Status de 48 pasos utiliza comandos de pose registrados y estado medido. Solo las filas de ejecución del robot supervisan acciones, mientras que las imágenes y características de demostración permanecen como historial; el inicio de ejecución no reinicia el historial visual. Los componentes sin supervisión alguna quedan declarados como lista vacía.

## Capacidades

- Generación de acciones robóticas: salida con forma `(20,8)` compuesta por xyz absolutos, cuaternión XYZW unitario en la carta de qx positiva y comando de gripper en [0,1].
- Control de manipulador Franka en la tarea button_order, con convención de pose cartesiana del efector final/herramienta registrada por el controlador de recolección.
- Condicionamiento visomotor con historial: la variante Status-D procesa 32 fotogramas del prefijo observado más un keyframe Writer, con 528 tokens visuales en total.
- Razonamiento multi-paso sobre subobjetivos: el Writer mantiene un subobjetivo actual y se actualiza en eventos de Status.
- Entrada de contexto causal: la inferencia de Status-D requiere `history_keyframe_index`, `current_subgoal` y entradas `transition_context_*`.
- Salida adicional de estado de transición: `transition_status` en el resultado de `policy.infer(...)`.
- API de historial: `observe(policy, base_rgb, state)` debe invocarse en cada fotograma observado, incluidas las demostraciones, con reinicio entre episodios.
- No se documentan capacidades de tool calling, function calling, agentes, visión general, audio ni generación de texto libre.

## Casos de uso

- Manipulación robótica de precisión en tarea button_order: el modelo está ajustado específicamente para esta tarea sobre un brazo Franka, con acciones cartesianas absolutas y comando de gripper, lo que permite desplegarlo directamente sobre el controlador de recolección.
- Investigación en ajuste fino eficiente de políticas VLA: el repositorio documenta LoRA rank 32, AdamW, warmup, decaimiento coseno y EMA, lo que permite reproducir o comparar el pipeline sobre π0.5 con hardware de gama profesional (4x RTX A6000).
- Reanudación exacta de entrenamientos: al incluir estado no-EMA, de optimizador, RNG y sampler, el bundle permite continuar el run desde el paso 10.000 hasta el objetivo de 12.500 sin reconstruir la dinámica del entrenamiento.
- Evaluación offline de políticas con historial: la API `observe(...)` más `history_keyframe_index` permite reproducir rollouts offline sobre episodios con prefijos observados y comprobar `transition_status`.
- Estudio de condicionamiento por eventos de Status: investigadores interesados en etiquetado temporal débil pueden analizar cómo el esquema Status-D usa corchetes de eventos soportados y ventanas revisadas, con etiquetas no revisadas enmascaradas.
- Integración en pipelines internos de robótica con carga personalizada: el bundle expone `from load_model import load, observe` y fija versiones exactas de dependencias, lo que facilita empaquetar el despliegue en entornos controlados y reproducibles.
- Análisis de enmascaramiento de pérdidas en componentes desconocidos: al mantenerse NaN/false y enmascararse en el condicionamiento de flujo y en la pérdida, sirve como caso de estudio sobre supervisión parcial en políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la publicación intermedia no es una evaluación de calidad de la política y que la evaluación offline, cuando se incluye, no establece una tasa de éxito real en robot. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de éxito en tarea, por lo que no se presentan tablas comparativas de rendimiento.

## Requisitos de hardware

- Entrenamiento documentado: 4 GPU RTX A6000 (48 GB cada una), batch global 4, batch por GPU 1, sin acumulación de gradientes.
- VRAM de inferencia: no disponible de forma oficial. El repositorio completo ocupa 12,8 GB, pero ese tamaño incluye pesos EMA de servicio, estado de reanudación (optimizador, RNG y sampler) y activos de normalización, por lo que el conjunto estrictamente necesario para servir es un subconjunto de esa cifra.
- GPU recomendadas: no disponibles. Como referencia, el entrenamiento se realizó en RTX A6000; no se documentan recomendaciones para A100, H100 u otras.
- Viabilidad en GPU de consumo: no confirmada. Si los pesos de servicio EMA resultan ser un subconjunto reducido del repositorio, podrían caber en tarjetas de 24 GB (RTX 3090/4090), pero es una estimación no verificada.
- Opciones de despliegue: el bundle proporciona su propio cargador (`load_model.py` con `load` y `observe`) y código de inferencia, no un formato estándar de servidor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y por la naturaleza de política robótica con API de historial no son directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step10000 | no disponible | 32 fotogramas + keyframe (528 tokens visuales), Status 48 pasos | sin benchmarks publicados | no disponible | HuggingFace, repo de 12,8 GB |
| π0.5 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otros ajustes LoRA de π0.5 para robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: ni los metadatos de HuggingFace ni la model card especifican términos de uso, por lo que el uso comercial queda sin cobertura legal explícita.
- Advertencia del autor: esta publicación intermedia no es una evaluación de calidad de la política.
- La evaluación offline, cuando se incluye, no establece una tasa de éxito en robot real.
- Proveniencia de etiquetas: la revisión de ventanas es de agente/modelo, no ground truth humano.
- Etiquetas no revisadas: permanecen enmascaradas, lo que limita la cobertura efectiva de supervisión.
- La salida de gripper de la tarea Shuffle no tiene supervisión de comando y no debe interpretarse como control aprendido de gripper.
- Button Order solo cuenta con etiquetas verificadas limitadas de comando cerrado.
- Componentes de acción desconocidos permanecen como NaN/false y se enmascaran tanto en el condicionamiento de flujo como en la pérdida, lo que implica que la política no aprende esas dimensiones.
- Features deshabilitadas: el feature command-gripper está desactivado de forma consistente en entrenamiento e inferencia; los embeddings de estado histórico están deshabilitados.
- El condicionamiento del Writer es de profesor, con temporización offline proyectada mediante estimaciones gruesas de eventos; no es una rollout online con Status predicho.
- Riesgo de desalineación de convención: la convención de pose cartesiana del efector final/herramienta debe coincidir con el controlador de recolección; no debe aplicarse un offset adicional de herramienta/brida.
- Sin datos de sesgo, idioma ni alucinación: no se documentan idiomas soportados ni evaluaciones de sesgo.
- Sin benchmarks: no hay ninguna métrica pública de rendimiento que permita estimar fiabilidad en producción.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step10000
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo, su modelo base π0.5 ni documentación técnica asociada; los enlaces obtenidos correspondían a servicios de radio en línea sin relación con el contenido.
