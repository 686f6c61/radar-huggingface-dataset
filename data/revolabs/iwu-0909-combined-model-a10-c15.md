# Revolabs/iwu-0909-combined-model-a10-c15

## Resumen

Revolabs/iwu-0909-combined-model-a10-c15 es una política de control robótico (no un modelo de lenguaje) publicada por Revolabs y entrenada con LeRobot, la biblioteca de aprendizaje por imitación de Hugging Face. El modelo se registra bajo el tipo de política `cortex_agv` y está diseñado para una única tarea: conducir un vehículo de guiado automático (AGV) del tipo `revobots_agv_follower`. Con 51.607.354 parámetros (unos 51,6 millones), es un modelo compacto orientado a inferencia en el borde, muy lejos de la escala de los LLM.

La política consume dos entradas: el estado del robot (`observation.state`, vector de 5 dimensiones) y una imagen frontal RGB de 480x640 píxeles (`observation.images.front`). Produce como salida una acción de 2 dimensiones (`action`), lo que sugiere un control diferencial de bajo grado de libertad. Se entrenó sobre el dataset Revolabs/iwu_0909_combined_merged, compuesto por 121 episodios y 210.382 fotogramas capturados a 15 FPS, todos ellos etiquetados con la misma instrucción: "Drive the AGV.".

La relevancia de esta ficha es acotada pero concreta: es un ejemplo de política visuomotora de imitación lista para desplegar con `lerobot-rollout`, con licencia Apache 2.0 y pesos en safetensors. Conviene subrayar que el repositorio no incluye ninguna evaluación en robot real ni resultados de benchmarks, y que acumula 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, por lo que carece de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política de imitación visuomotora registrada en LeRobot como `cortex_agv`; la model card no detalla el tipo de red (no se especifica si es ACT, diffusion policy u otra) |
| Parametros totales | 51.607.354 (≈51,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control paso a paso; no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible / no aplica (modelo de robótica; la entrada textual se limita a la instrucción de tarea "Drive the AGV.") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Entradas | `observation.state` (STATE, shape `(5,)`) y `observation.images.front` (VISUAL, shape `(3, 480, 640)`) |
| Salidas | `action` (ACTION, shape `(2,)`) |
| Tipo de robot | `revobots_agv_follower` |
| Camaras | `front` (una sola cámara frontal) |
| Frecuencia de captura del dataset | 15 FPS |
| Biblioteca | lerobot (entrenado y publicado con LeRobot 0.6.1) |
| Tarea | "Drive the AGV." |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna de la política. Se sabe que está registrada en LeRobot bajo el identificador `cortex_agv`, que se invoca mediante `--policy.type=cortex_agv`, y que la firma de entrada/salida es la típica de una política de imitación visuomotora: un codificador visual que procesa una imagen RGB de 480x640 junto con un vector de estado de 5 dimensiones, y una cabeza que emite una acción continua de 2 dimensiones. No se documenta si emplea transformers, difusión, un enfoque tipo ACT con action chunking o una mezcla de ellos. El sufijo "a10-c15" del identificador no está explicado en la información disponible.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos provienen íntegramente del dataset Revolabs/iwu_0909_combined_merged: 121 episodios, 210.382 fotogramas a 15 FPS, una única tarea ("Drive the AGV.") y una única cámara. No se menciona el uso de RLHF, DPO, reward modelling ni ningún esquema de refinamiento posterior al aprendizaje por imitación; tampoco se indica el número total de tokens ni la composición detallada del dataset más allá de los recuentos citados.

## Capacidades

- Control visuomotor de un AGV: genera acciones continuas de 2 dimensiones a partir de una imagen frontal y del estado del robot de 5 dimensiones.
- Aprendizaje por imitación supervisado: reproduce la política de conducción demostrada en 121 episodios de teleoperación.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`, con duración configurable o ejecución indefinida.
- Integración nativa con el ecosistema LeRobot: permite `lerobot-train` para reentrenar o hacer fine-tuning sobre nuevos datasets.
- Reentrenamiento y ajuste fino: la configuración de entrenamiento está documentada, de modo que se puede reproducir el pipeline con otra semilla o dataset.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "pensamiento": no es un modelo de lenguaje ni un agente conversacional.
- No se documentan capacidades de visión más allá de la codificación de la imagen frontal (sin detección explícita de objetos, segmentación ni profundidad declaradas).

## Casos de uso

- Navegación autónoma de AGV en almacén: la política traduce la imagen frontal y el estado del vehículo en comandos de dirección de 2 grados de libertad, adecuada para recorridos repetitivos aprendidos por demostración en pasillos y zonas de tránsito.
- Transporte interno de materiales en línea de producción: al estar entrenada exclusivamente con la tarea "Drive the AGV.", encaja en flujos logísticos donde el vehículo debe trasladar piezas entre estaciones siguiendo rutas previamente demostradas.
- Replicación de flotas por clonación de política: al ser un modelo de 51,6 M de parámetros con pesos safetensors, se puede desplegar la misma política en varias unidades `revobots_agv_follower` con calibración equivalente.
- Ajuste fino por instalación: partiendo de estos pesos, un equipo puede reentrenar con `lerobot-train --policy.type=cortex_agv` sobre datos propios de una planta concreta, aprovechando la configuración documentada (AdamW, lr 1e-5, batch 8).
- Inferencia en el borde: por su tamaño reducido, es candidata a ejecutarse en hardware embebido a bordo del AGV, evitando dependencia de conectividad de red.
- Base de comparación interna en investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline LeRobot completo (dataset, entrenamiento, rollout) para experimentos controlados.
- Teleoperación asistida con intervención humana: puede usarse como capa inicial de autonomía y corregirse manualmente, generando nuevos episodios que alimenten futuras iteraciones del modelo.
- Validación de pipelines de datos y calibración: útil para comprobar que la cadena de captura (cámara frontal a 640x480, estado de 5 dimensiones) y la cadencia de control funcionan antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente el marcador "_No evaluation results have been provided for this policy yet._" y la tabla de evaluación en robot real (tarea, ensayos, éxitos, tasa de éxito) está vacía. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna métrica de robótica (tasa de éxito por tarea, error de posición, etc.).

| Metrica | Resultado |
|---|---|
| Evaluacion en robot real | No disponible (el autor indica que no se han proporcionado resultados) |
| Tasa de exito por tarea | No disponible |
| Benchmarks de lenguaje o codigo | No aplica (no es un modelo de lenguaje) |

## Comparativa con modelos similares

No se dispone de datos cuantitativos de comparación en la información proporcionada. Existen otras políticas nativas del ecosistema LeRobot (por ejemplo, ACT o Diffusion Policy) que cubren el mismo nicho de imitación visuomotora, pero no se han facilitado cifras de parámetros, contexto ni rendimiento de esas alternativas en esta ficha, por lo que cualquier comparación numérica sería inventada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Revolabs/iwu-0909-combined-model-a10-c15 | 51,6 M | No aplica | No disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| ACT (LeRobot) | No disponible | No aplica | No disponible | No disponible en la informacion facilitada | Ecosistema LeRobot |
| Diffusion Policy (LeRobot) | No disponible | No aplica | No disponible | No disponible en la informacion facilitada | Ecosistema LeRobot |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que el rendimiento real en robot es desconocido. No debería desplegarse en producción sin una validación propia.
- Dominio muy estrecho: un único conjunto de datos, una única tarea ("Drive the AGV.") y una única cámara frontal. Es previsible un mal comportamiento ante cambios de recorrido, layout, tipo de suelo o condiciones de iluminación no representadas.
- Sesgo de recogida de datos: la política reproduce las trayectorias y los sesgos del teleoperador y del entorno concreto de los 121 episodios; no hay indicios de diversidad de escenarios, operadores ni condiciones ambientales.
- Percepción limitada: solo dispone de visión frontal, sin cobertura lateral o trasera, lo que restringe la detección de obstáculos fuera del campo de visión.
- Grado de libertad bajo: la salida es un vector de 2 dimensiones, suficiente para conducción diferencial pero no para manipulación ni para control de articulaciones adicionales.
- Dependencia de hardware y calibración: requiere un robot `revobots_agv_follower`, una cámara cuyo nombre coincida con la clave de observación (`observation.images.front`) y una calibración coherente con la del dataset de entrenamiento.
- Sin validación comunitaria: 0 descargas y 0 "me gusta" en el momento de la consulta; no hay informes independientes de terceros.
- Arquitectura no documentada: al no detallarse el tipo de red ni el preprocesado exacto, la reproducibilidad depende de la versión de LeRobot (0.6.1) y del registro del tipo de política `cortex_agv`.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite correctamente. No se declaran restricciones adicionales, pero conviene verificar los términos del dataset asociado.
- Riesgo de sobreajuste al dataset: 100.000 pasos de entrenamiento sobre 210.382 fotogramas de una sola tarea hacen plausible un ajuste excesivo a las trayectorias demostradas.
- No aplica riesgo de alucinación en el sentido lingüístico, pero sí existe el equivalente conductual: la política puede producir acciones erróneas o incoherentes fuera de la distribución de estados visitados durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Revolabs/iwu-0909-combined-model-a10-c15
- Dataset de entrenamiento: https://huggingface.co/datasets/Revolabs/iwu_0909_combined_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Revolabs/iwu_0909_combined_merged
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al., 2024): https://github.com/huggingface/lerobot

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces recuperados correspondían a un portal administrativo sin relación con el contenido de esta ficha.
