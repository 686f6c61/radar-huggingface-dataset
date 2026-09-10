# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step9000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino con LoRA de segunda ronda (`r2`, paso 9.000) sobre el modelo π0.5, orientado a la tarea robotica denominada **button_order** y ejecutado sobre un brazo Franka. No es un modelo de lenguaje ni un modelo multimodal de proposito general: es una politica visio-linguistica-accion (VLA) para control de manipulacion, publicada por el usuario `fm-dev`. El entrenamiento se realizo localmente en 4 GPU RTX A6000 con batch global 4 y batch por GPU 1, sin acumulacion de gradiente, y el checkpoint representa 36.000 exposiciones de muestra de las 50.000 previstas en el objetivo de la ejecucion (12.500 actualizaciones del optimizador).

El interes tecnico del artefacto esta en su variante **Status-D**, que introduce condicionamiento explicito por eventos: 32 fotogramas muestreados uniformemente sobre el prefijo observado del episodio [0,t] mas un keyframe Writer anulable (528 tokens visuales en total) y un subobjetivo actual retenido. El Writer se inicializa al arrancar la ejecucion y se actualiza en los eventos de Status. El bundle incluye pesos EMA de servicio, activos de normalizacion e historial, codigo de inferencia y el estado completo de reanudacion (no EMA, optimizador, RNG y sampler).

Es relevante ahora porque documenta un flujo de trabajo reproducible de ajuste fino parametrizado eficientemente (LoRA rango 32) sobre politicas VLA en hardware de gama profesional (no de centro de datos), con publicacion de checkpoints intermedios y trazabilidad de las etiquetas de supervision. Conviene subir la advertencia: el propio autor indica que la publicacion intermedia **no** es una evaluacion de calidad de la politica. El repositorio ocupa 12,8 GB, no tiene descargas ni likes, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica VLA basada en π0.5 con adaptador LoRA (rango 32) sobre el modelo base; no se detalla la topologia interna del modelo base en la informacion disponible |
| Parametros totales | no disponible (el repositorio de 12,8 GB incluye pesos EMA de servicio, activos de normalizacion e historial y estado de reanudacion del optimizador, RNG y sampler, por lo que no permite inferir el numero de parametros) |
| Longitud de contexto | no se documenta una ventana de contexto en tokens al estilo LLM. Modo Status-D: 32 fotogramas muestreados uniformemente del prefijo del episodio [0,t] mas un keyframe Writer anulable (528 tokens visuales en total) y contexto de Status de 48 pasos con comandos de pose registrados y estado medido |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de politica robotica; no se documentan capacidades de lenguaje natural) |
| Licencia | no disponible (no especificada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | no especificado en la informacion disponible; el bundle incluye pesos EMA para servicio, activos de normalizacion e historial, codigo fuente de inferencia y estado de reanudacion completo (no EMA, optimizador, RNG y sampler) |
| Tamano del repositorio | 12,8 GB |
| Tarea | `button_order` (pulsado/orden de botones) sobre robot Franka |
| Pipeline declarado | robotics |
| Salida de acciones | tensor de forma `(20,8)`: xyz absoluto, cuaternion XYZW unitario en la carta de qx positivo y comando de gripper en [0,1] |
| Normalizacion | estado y acciones numericas con normalizacion STD; los tokens de estado usan una vista acotada separada train-q01/q99 |
| Pool de EMA | 0,999^4 = 0,996005996001 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de segunda ronda sobre π0.5 mediante LoRA de rango 32, entrenado con AdamW, semilla 42 y un esquema de learning rate con warmup de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500. La ejecucion se llevo a cabo en 4 RTX A6000 con batch global 4 y batch por GPU 1, sin acumulacion de gradiente. Los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500; este repositorio corresponde al paso 9.000 (36.000 exposiciones de muestra) y el sufijo `r2` mantiene los artefactos separados del experimento original de 6.250 pasos. La configuracion completa esta en `training_config.json`.

La innovacion principal es el esquema **Status-D**. Se muestrean 32 fotogramas uniformemente sobre el prefijo completo del episodio observado [0,t], se anade un keyframe Writer anulable y se mantiene un subobjetivo actual del Writer. El Writer se inicializa al inicio de la ejecucion y se actualiza en los eventos de Status; su temporizacion offline se proyecta con estimaciones gruesas de eventos, lo que constituye condicionamiento de profesor (*teacher conditioning*) y no una afirmacion de despliegue online con Status predicho. Los positivos de intervalo de Status usan brackets de eventos soportados, y la supervision de endpoints y negativos procede unicamente de ventanas revisadas explicitamente; las etiquetas no revisadas permanecen enmascaradas. La procedencia de la revision es revision por agente/modelo, no verdad fundamental humana. El contexto de Status de 48 pasos usa comandos de pose registrados y estado medido; la caracteristica de comando de gripper esta deshabilitada de forma consistente en entrenamiento e inferencia (no se inventa ningun comando de gripper ausente) y los embeddings de estado historicos estan deshabilitados. Solo las filas de ejecucion del robot supervisan acciones; las imagenes y caracteristicas de demostracion y las coordenadas originales de episodio/fotograma quedan disponibles como historial, sin que el inicio de ejecucion reinicie el historial visual. Las particiones de episodios y la normalizacion usan unicamente el split de entrenamiento.

## Capacidades

- Generacion de acciones de manipulacion robotica en espacio cartesiano: salida `(20,8)` con xyz absoluto, cuaternion XYZW unitario y comando de gripper en [0,1].
- Ejecucion de la tarea `button_order` sobre un brazo Franka, con politica condicionada por observaciones visuales y estado medido.
- Condicionamiento por eventos (Status-D): mantiene un subobjetivo actual y expone `transition_status` en la salida de `policy.infer(...)`.
- Inferencia con historial: la funcion `observe(policy, base_rgb, state)` debe invocarse en cada fotograma observado, incluidas las demostraciones, con reinicio entre episodios.
- Entrada de keyframe explicito: `history_keyframe_index` (un fotograma observado o `None`) y entradas causales `transition_context_*`.
- Enmascaramiento de componentes desconocidos: los componentes de accion no supervisados permanecen como NaN/false y se enmascaran tanto en el condicionamiento de flujo como en la perdida. La lista de componentes totalmente no supervisados declarada es vacia (`[]`).
- Reanudacion exacta del entrenamiento: el bundle incluye estado de optimizador, RNG y sampler, ademas de pesos EMA de servicio.
- **No** se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, agentes, audio ni modo de pensamiento. Se trata de una politica de control, no de un asistente conversacional.

## Casos de uso

- **Automatizacion de pulsado de botones en celda industrial**: la politica esta ajustada especificamente para `button_order` sobre Franka, por lo que puede emplearse para ejecutar secuencias de accionamiento de botones/paneles en un banco de pruebas, siempre que el convenio de pose cartesiana del controlador coincida con el de recogida de datos.
- **Investigacion en condicionamiento por eventos en politicas VLA**: el esquema Status-D (32 fotogramas del prefijo, keyframe Writer anulable, subobjetivo retenido, contexto de Status de 48 pasos) sirve como banco de pruebas para estudiar como la informacion de eventos mejora la coherencia temporal de una politica de manipulacion.
- **Ajuste fino eficiente con LoRA sobre hardware de gama profesional**: la receta documentada (LoRA rango 32, AdamW, 4x RTX A6000, batch global 4 sin acumulacion de gradiente, warmup a 5e-5 y decaimiento coseno a 5e-6) es directamente reutilizable como linea base para reproducir o escalar el entrenamiento en un cluster pequeno.
- **Analisis de estabilidad entre checkpoints**: al publicarse cada 1.000 actualizaciones y conservarse el estado de reanudacion completo, es posible estudiar la evolucion de la politica entre pasos (por ejemplo 8.000, 9.000 y 10.000) y detectar inestabilidades antes de llegar al paso 12.500.
- **Reanudacion y continuacion de una ejecucion de entrenamiento**: el estado no EMA, de optimizador, RNG y sampler permite retomar exactamente la ejecucion en el paso 9.000, lo que resulta util para barridos de hiperparametros con semilla fija (semilla 42).
- **Evaluacion offline de prediccion de Status**: el modelo produce `transition_status` a partir de entradas de contexto causal, lo que permite medir la calidad del condicionamiento de eventos frente a etiquetas revisadas antes de plantear cualquier despliegue en robot real.
- **Transferencia a otros brazos o utilidades dentro de la misma familia**: el bundle separa pesos EMA de servicio, activos de normalizacion e historial y codigo de inferencia, lo que facilita reutilizar la tuberia en variantes de la misma celda de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion intermedia no constituye una evaluacion de calidad de la politica y que la evaluacion offline, cuando se incluye, no establece la tasa de exito en robot real. Tampoco se proporcionan cifras de exito por tarea, ni comparaciones con otros checkpoints, ni metricas de latencia.

## Requisitos de hardware

- **Hardware de entrenamiento documentado**: 4 GPU RTX A6000, batch global 4, batch por GPU 1, sin acumulacion de gradiente.
- **VRAM para inferencia**: no disponible. El repositorio ocupa 12,8 GB, pero ese tamano incluye pesos EMA de servicio, activos de normalizacion e historial y estado de reanudacion del optimizador, RNG y sampler, por lo que no permite derivar la huella de memoria en inferencia.
- **GPU recomendadas**: no disponible. Como referencia, el entrenamiento se realizo en RTX A6000 (48 GB); no se documenta el consumo de memoria ni si la inferencia cabe en GPU de consumo (RTX 4090, 4080, etc.).
- **Opciones de despliegue**: el bundle proporciona su propio cargador, con `from load_model import load, observe; policy = load()`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a una politica VLA de este tipo.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros checkpoints de la misma ejecucion ni de modelos comparables de la misma categoria (por ejemplo, otras variantes de π0.5, el experimento original de 6.250 pasos o ajustes equivalentes sobre Franka), ni parametros, contexto, rendimiento o licencia de alternativas. Los resultados de busqueda web recuperados no guardan relacion con el modelo (contenido de ayuda de Gmail y YouTube, Zhihu y un foro sobre Booking.com), por lo que no aportan comparativas utilizables.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia en la model card ni en los metadatos. No puede asumirse uso comercial sin consultar al autor.
- **Checkpoint intermedio, no final**: el paso 9.000 esta a mitad de camino del objetivo de 12.500 actualizaciones (36.000 de 50.000 exposiciones de muestra). El autor advierte que la publicacion intermedia no es una evaluacion de calidad de la politica.
- **Sin evidencia de exito en robot real**: la evaluacion offline, si existe, no establece la tasa de exito en robot fisico. No hay cifras de exito publicadas.
- **Procedencia de las etiquetas**: la revision de etiquetas es responsabilidad de agente/modelo, no verdad fundamental humana. Las etiquetas no revisadas permanecen enmascaradas, y la supervision de endpoints y negativos proviene solo de ventanas revisadas explicitamente.
- **Temporizacion del Writer fuera de linea**: la temporizacion offline del Writer se proyecta con estimaciones gruesas de eventos; es condicionamiento de profesor y no una afirmacion de despliegue online con Status predicho.
- **Gripper de Shuffle sin supervision**: la salida de gripper de Shuffle no tiene supervision de comando y no debe interpretarse como control de gripper aprendido. La tarea Button Order solo dispone de etiquetas verificadas de comando cerrado limitadas.
- **Componentes no supervisados**: los componentes de accion desconocidos permanecen como NaN/false y se enmascaran en condicionamiento de flujo y perdida. La lista declarada de componentes totalmente no supervisados es vacia (`[]`), lo que debe verificarse contra el dataset antes de reutilizar la politica.
- **Dependencia estricta del convenio de pose**: el convenio de pose cartesiana del efector final o herramienta debe coincidir con el del controlador de recogida; no debe aplicarse un desplazamiento adicional de herramienta o brida.
- **API de inferencia con estado**: es obligatorio llamar a `observe(policy, base_rgb, state)` en cada fotograma observado (incluidas demostraciones) y reiniciar entre episodios. En Status-D hay que proporcionar explicitamente `history_keyframe_index`, `current_subgoal` y las entradas causales `transition_context_*`, y usar el calendario de Writer exportado junto con el fotograma de control correspondiente.
- **Emisiones historicas y gripper deshabilitados**: los embeddings de estado historicos estan deshabilitados y la caracteristica de comando de gripper del contexto de Status de 48 pasos esta deshabilitada de forma consistente en entrenamiento e inferencia.
- **Sin capacidades de lenguaje ni multilingues**: no es un modelo conversacional ni de texto; no se documentan idiomas, sesgos linguisticos ni riesgos de alucinacion textual. Su ambito es exclusivamente el control de manipulacion.
- **Adopcion nula y trazabilidad limitada**: 0 descargas y 0 likes, autor sin informacion adicional publica y resultados de busqueda web no relacionados. No hay evaluacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step9000
- No se han encontrado papers, blogs, repositorios ni demos asociados en la busqueda web proporcionada (los resultados recuperados no guardan relacion con el modelo).
