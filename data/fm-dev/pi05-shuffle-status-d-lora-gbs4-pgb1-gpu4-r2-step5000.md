# fm-dev/pi05-shuffle-status-d-lora-gbs4-pgb1-gpu4-r2-step5000

## Resumen

Este repositorio contiene un adaptador LoRA de segunda ronda (identificador `r2`) sobre el modelo base π0.5, ajustado específicamente para la tarea robótica denominada **shuffle** sobre un brazo **Franka**. El autor, `fm-dev`, lo publica como el checkpoint correspondiente al paso **5.000** de un entrenamiento que aspira a alcanzar los **12.500 pasos** de optimización (equivalentes a 50.000 exposiciones de muestra). Se trata, por tanto, de una publicación intermedia y no de una versión final del entrenamiento.

El modelo se entrenó localmente sobre **4 GPU RTX A6000**, con batch global de **4** y batch por GPU de **1**, sin acumulación de gradientes, lo que sitúa este checkpoint en **20.000 exposiciones de muestra** de las 50.000 previstas. Emplea optimizador AdamW, LoRA de rango 32, semilla 42, un calentamiento de 250 actualizaciones hasta 5e-5 y un decaimiento coseno hasta 5e-6 en el paso 12.500, con un factor EMA efectivo de 0,999^4.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino una política de visión-lenguaje-acción (VLA) orientada a control robótico de manipulación. Resulta de interés para investigadores que trabajan en fine-tuning de π0.5, en representaciones de estado y subobjetivos (el esquema **Status-D** y el componente **Writer**) y en la reproducibilidad de entrenamientos LoRA sobre hardware de gama profesional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre el modelo base π0.5 (visión-lenguaje-acción); detalles de la arquitectura base no disponibles |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (la ventana de observación de Status-D usa 32 fotogramas y 528 tokens visuales; el contexto de Status abarca 48 pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se publican pesos EMA de serving y estado de reanudación no-EMA/optimizador/RNG/sampler) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de **rango 32** sobre π0.5, un modelo de visión-lenguaje-acción. La información disponible no detalla la arquitectura interna del modelo base (número de parámetros, tipo de transformer, mecanismos de atención ni tokenizador), por lo que esos datos quedan como no disponibles. Lo que sí se especifica es la interfaz de salida: el modelo produce tensores de forma **(20, 8)**, correspondientes a un horizonte de 20 pasos de acción, cada uno con posición absoluta xyz, cuaternión unitario XYZW en la carta de qx positivo y comando de pinza en el rango [0, 1]. El estado y las acciones numéricas usan normalización por desviación estándar (STD), mientras que los tokens de estado emplean una vista separada acotada entre los cuantiles q01 y q99 del conjunto de entrenamiento.

El entrenamiento se realizó con AdamW, semilla 42 y un esquema de calentamiento de 250 actualizaciones hasta 5e-5, seguido de decaimiento coseno hasta 5e-6 en el paso 12.500. Los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500. La innovación técnica destacable es el esquema **Status-D**: se muestrean 32 fotogramas uniformemente sobre el prefijo completo de episodio observado [0, t], más un fotograma clave (*keyframe*) opcional del componente Writer, sumando 528 tokens visuales, junto con un subobjetivo actual retenido. El Writer se inicializa al comenzar la ejecución y se actualiza en los eventos de Status. La supervisión de acciones proviene exclusivamente de las filas de ejecución del robot; las imágenes y características de las demostraciones permanecen como historial, de modo que el inicio de la ejecución no reinicia el historial visual. Los componentes de acción desconocidos se mantienen como NaN/false y se enmascaran tanto en el condicionamiento de flujo como en la pérdida.

## Capacidades

- Control robótico de manipulación: genera comandos de acción cartesiana (xyz + cuaternión) y comando de pinza para un brazo Franka en la tarea **shuffle**.
- Predicción de estado de transición: la variante Status-D expone una salida `transition_status` a partir de un subobjetivo actual y un contexto de transición causal.
- Modelado de historial visual: mantiene historial de fotogramas observados (incluidas demostraciones) mediante la llamada `observe(policy, base_rgb, state)`, con reinicio entre episodios.
- Condicionamiento por subobjetivos: acepta un `current_subgoal` explícito y un `history_keyframe_index` (un fotograma observado o `None`).
- Reanudación exacta de entrenamiento: incluye estado de reanudación no-EMA, optimizador, RNG y sampler, además de versiones exactas de dependencias.
- Etiquetado parcial con enmascaramiento: las etiquetas no revisadas permanecen enmascaradas y solo las ventanas revisadas explícitamente aportan supervisión de extremos y negativos.
- No se declaran capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes, audio ni multilingüismo; se trata de una política robótica, no de un modelo conversacional.

## Casos de uso

- Fine-tuning de políticas VLA sobre π0.5: sirve como punto de partida documentado para reproducir un ajuste LoRA de rango 32 sobre el modelo base, con hiperparámetros y esquema de muestreo de estado explícitos.
- Investigación en representación de estado y subobjetivos: el esquema Status-D y el componente Writer permiten estudiar cómo el condicionamiento por subobjetivos afecta a la política en tareas de manipulación larga.
- Manipulación robótica en laboratorio: ejecución de la tarea shuffle sobre un Franka con salida de acciones cartesianas de 20 pasos, útil en entornos controlados de investigación.
- Reanudación de entrenamientos multi-GPU: el estado de optimizador, RNG y sampler incluido permite continuar la ejecución desde el paso 5.000 hacia el objetivo de 12.500 actualizaciones.
- Evaluación de infraestructura de entrenamiento: al documentar batch global 4, batch por GPU 1 y 4 GPU A6000 sin acumulación de gradientes, sirve de referencia para comparar configuraciones de hardware y throughput.
- Auditoría de procedencia de etiquetas: el repositorio distingue entre revisión por agente/modelo y verdad humana, lo que resulta útil para estudiar el impacto de etiquetas parcialmente supervisadas.
- Integración en pipelines de investigación con `load_model`: la función `load()` y la API `observe()`/`infer()` permiten incorporar la política a un bucle de control existente sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card advierte que la publicación intermedia no constituye una evaluación de calidad de la política y que cualquier evaluación offline incluida no establece una tasa de éxito en robot real.

## Requisitos de hardware

- Entrenamiento: 4 GPU RTX A6000 (48 GB cada una), según declara el autor, con batch global 4 y batch por GPU 1, sin acumulación de gradientes.
- VRAM de inferencia: no disponible; no se especifica el número de parámetros del modelo base ni el tamaño de los pesos EMA de serving por separado.
- Tamaño del repositorio: 12,8 GB, que incluye pesos EMA de serving, activos de normalización e historial, código de inferencia, versiones de dependencias y estado de reanudación no-EMA/optimizador/RNG/sampler; el checkpoint de serving puro es, por tanto, un subconjunto de ese total.
- GPU recomendadas: no disponibles para inferencia; el único dato de hardware confirmado es el uso de RTX A6000 durante el entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio indica carga mediante `from load_model import load, observe; policy = load()` desde el propio bundle; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada, ni de resultados de benchmarks que permitan situar este checkpoint frente a alternativas. La model card únicamente referencia, como contextualización interna, la existencia de un experimento previo de 6.250 pasos del que `r2` se mantiene separado.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-shuffle-status-d-lora-gbs4-pgb1-gpu4-r2-step5000 | no disponible | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| π0.5 base | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Publicación intermedia: el checkpoint corresponde al paso 5.000 de un objetivo de 12.500, por lo que no representa el resultado final del entrenamiento.
- Ausencia de supervisión de pinza: la salida de pinza de Shuffle no tiene supervisión de comando y no debe interpretarse como control de pinza aprendido. El componente de acción [7] está completamente sin supervisar.
- Etiquetas parciales: en Button Order solo hay etiquetas verificadas limitadas de comando cerrado, y las ventanas no revisadas permanecen enmascaradas.
- Procedencia de revisión: la revisión proviene de agentes/modelos, no de verdad humana (*ground truth*).
- Condicionamiento de profesor: la temporización del Writer offline se proyecta con estimaciones gruesas de eventos; se trata de condicionamiento de profesor y no de una afirmación de despliegue online con Status predicho.
- Función deshabilitada: la característica de comando de pinza del contexto de Status de 48 pasos se desactiva de forma coherente en entrenamiento e inferencia, y no se inventa ningún comando de pinza ausente.
- Embeddings de estado histórico desactivados.
- Convención de pose: la convención cartesiana registrada de pose del efector final/herramienta debe coincidir con el controlador de recogida; no debe aplicarse un desplazamiento adicional de herramienta/brida.
- Riesgo de alucinación y sesgos: no se documentan explícitamente; al ser una política de acción, el riesgo se manifiesta como acciones incorrectas o inseguras más que como texto inventado.
- Idiomas y contexto: no disponibles; el repositorio no declara idiomas soportados ni longitud de contexto formal.
- Licencia: no disponible, por lo que no puede confirmarse si se permite el uso comercial.
- Evaluación: la evaluación offline, cuando se incluye, no establece una tasa de éxito en robot real.
- Advertencia de seguridad: cualquier uso sobre hardware físico requiere validación previa en entornos controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-status-d-lora-gbs4-pgb1-gpu4-r2-step5000
- Configuración de entrenamiento: `training_config.json`, incluido en el repositorio del modelo.
- Código de carga e inferencia: `load_model.py`, incluido en el repositorio del modelo.
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
