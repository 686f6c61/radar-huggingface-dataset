# FEGE16/robot-task-observer-completion-history

## Resumen

Robot Task Observer es un adaptador LoRA sobre el modelo vision-lenguaje Qwen3-VL-4B-Instruct, publicado por el usuario FEGE16, que implementa una de las dos tareas de observación offline de un sistema de supervision de robots. El adaptador recibe una tarea global, un objetivo de subtarea y una secuencia causal de hasta ocho pares de imagenes (escena y muneca) a 224x224 pixeles, y predice si el efecto de la subtarea se ha cumplido. Su vocabulario de salida se limita a tres etiquetas: `DONE`, `NOT_DONE` y `UNKNOWN`.

El modelo resuelve un problema concreto en el ambito de la robotica manipulativa: proporcionar senal de finalizacion de subtarea a un sistema externo que observa una politica VLA (vision-language-action) congelada, sin necesidad de reentrenar dicha politica. La arquitectura subyacente es la de Qwen3-VL-4B-Instruct (transformer multimodal con decodificador de lenguaje y torre visual), sobre la que se aplica un LoRA unicamente en el lado del lenguaje, manteniendo congelados tanto el modelo base como los componentes visuales.

Es relevante por su caracter de componente especializado y ligero (33 millones de parametros entrenables, 132 MB de pesos) dentro de un pipeline de robotica que combina VLA y VLM externos, y por publicar metricas de evaluacion en un conjunto de test retenido. No obstante, se trata de un checkpoint de investigacion con alcance acotado: los resultados no demuestran generalizacion a familias de tareas no vistas ni a robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-4B-Instruct (transformer multimodal vision-lenguaje); adaptacion solo en el decodificador de lenguaje |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-4B-Instruct tiene 4B (segun su denominacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; la entrada se limita a una ventana de hasta 8 timestamps con 2 imagenes de 224x224 cada uno |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en safetensors; el ejemplo de carga usa bfloat16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3-VL-4B-Instruct en revision `ebb281ec70b05090aa6165b016eac8ec08e71b17` |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-4B-Instruct, un modelo vision-lenguaje con decodificador de lenguaje y torre visual. La adaptacion es un LoRA de rango 16, alpha 32 y dropout 0.05, aplicado exclusivamente a las proyecciones de atencion q/k/v/o y a las proyecciones MLP gate/up/down del decodificador de lenguaje. El modelo base y los componentes visuales permanecen congelados y los pesos originales se preservan byte a byte. El adaptador entrena 33.030.144 parametros y el checkpoint liberado corresponde a la epoca 2, seleccionada sobre validacion.

Los datos de entrenamiento se construyeron a partir de 63 trayectorias de robot compartidas, generadas con OpenPI / pi0.5 y tareas basadas en LIBERO (incluyendo LIBERO-Long, LoHo y LiLo Long++). Las variantes de trayectoria se agruparon en 39 grupos fisicos de origen, manteniendo separacion entre grupos en los splits: 39 trayectorias de entrenamiento, 12 de validacion y 12 de test. El entrenamiento usa entropia cruzada supervisada sobre los tokens de respuesta, learning rate 5e-5, micro-batch de 1, acumulacion de gradiente de 16 y semilla 42. La representacion de historial retiene hasta ocho timestamps ordenados de pasado a presente, con una imagen de escena y otra de muneca por timestamp, sin observaciones futuras, etiquetas de estado del simulador ni resultados finales del episodio como entradas.

## Capacidades

- Juicio de finalizacion de subtarea: dado un objetivo global, un objetivo de subtarea y una secuencia causal de imagenes, predice `DONE`, `NOT_DONE` o `UNKNOWN`.
- Razonamiento temporal sobre historial visual: procesa hasta ocho timestamps ordenados de pasado a presente, con pares de imagenes de escena y muneca.
- Observacion multimodal: combina informacion de camara de escena y de muneca a 224x224 pixeles.
- Integracion en sistemas de supervision: pensado para observar una politica VLA congelada y emitir senal de finalizacion de subtarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el adaptador esta especializado en una unica tarea de clasificacion.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: ninguna declarada mas alla de la tarea de observacion (sin thinking mode, vision general, audio ni otras).

## Casos de uso

- Supervision de politicas VLA en simulacion: el adaptador observa la ejecucion de una politica congelada (por ejemplo, pi0.5 sobre tareas LIBERO) y emite `DONE`/`NOT_DONE` para segmentar subtareas sin reentrenar la politica.
- Deteccion de fallos de subtarea en pipelines de evaluacion: al calcular la tasa de falsos positivos sobre `NOT_DONE`, permite marcar episodios donde la politica declara exito sin haber completado el efecto requerido.
- Anotacion asistida de trayectorias: con 82,61 % de accuracy en el test retenido, puede preetiquetar la finalizacion de subtareas en nuevos registros para revision humana posterior.
- Investigacion en recuperacion por feedback de lenguaje: el adaptador es un componente del bucle de recuperacion propuesto por el autor, util para experimentar con senal de lenguaje hacia politicas VLA.
- Benchmarking de modelos de observacion robotica: sirve como linea base reproducible (checkpoint fijado, semilla 42, splits por grupo de origen) para comparar variantes de adaptadores de observacion.
- Filtrado de datos para entrenamiento de VLA: las predicciones `DONE`/`NOT_DONE` pueden usarse para seleccionar o descartar segmentos de trayectoria antes de alimentar un entrenamiento posterior.
- Prototipado de sistemas de robotica con VLM externo: permite validar la arquitectura de observador externo con un coste computacional bajo (adaptador de 132 MB sobre un base de 4B).

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido del proyecto (184 consultas de historial), en porcentajes:

| Metrica | Valor |
|---|---:|
| Accuracy | 82,61 |
| Macro-F1 | 77,45 |
| Recall de `DONE` | 60,38 |
| Tasa de falsos positivos | 8,40 |

La Macro-F1 promedia las clases `DONE` y `NOT_DONE` presentes en el split; no hay ejemplos de referencia `UNKNOWN`. La tasa de falsos positivos es la proporcion de ejemplos `NOT_DONE` predichos como `DONE`. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador anade 132 MB a los pesos del base Qwen3-VL-4B-Instruct, que en bfloat16 requiere del orden de 8 GB solo para pesos (estimacion a partir del tamano del base, no confirmada en la documentacion).
- GPU recomendadas: no disponible; el ejemplo de carga asume una GPU compatible con bfloat16 y usa `device_map="auto"`.
- Compatibilidad con GPU de consumo: no confirmada; un base de 4B en bfloat16 puede caber en GPUs de consumo con 12-16 GB de VRAM, pero no se aporta dato oficial.
- Opciones de despliegue: el autor documenta carga mediante `transformers` (clase `Qwen3VLForConditionalGeneration`) y `peft` (`PeftModel`), con PEFT 0.17.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada. Comparativa estructural con adaptadores de observacion sobre el mismo base y con el base sin adaptar:

| Modelo | Parametros entrenables | Contexto de entrada | Tarea | Licencia |
|---|---|---|---|---|
| Robot Task Observer (este adaptador) | 33.030.144 | Hasta 8 timestamps x 2 imagenes 224x224 | Juicio de finalizacion de subtarea | Apache 2.0 |
| Qwen3-VL-4B-Instruct (base, sin adaptar) | 0 (no adaptado a la tarea) | Contexto del modelo base; no disponible | Vision-lenguaje general | Apache 2.0 |
| Otros adaptadores del mismo autor | No disponible | No disponible | Otras tareas de observacion offline | Apache 2.0 |

No se han identificado en la informacion disponible modelos comparables de la misma categoria con metricas publicadas.

## Limitaciones y advertencias

- Los resultados miden observacion offline sobre estados iniciales retenidos de las configuraciones de tarea del proyecto; no establecen generalizacion a familias de tareas no vistas ni a robots reales.
- El bucle de recuperacion por feedback de lenguaje es un diseno de sistema; la mejora de tasa de exito en bucle cerrado no se ha evaluado en esta release.
- El adaptador esta entrenado con historial; eliminar el historial cambia su distribucion de entrada y degrada el comportamiento esperado.
- Recall de `DONE` bajo (60,38 %): el modelo tiende a no detectar subtareas completadas, con una tasa de falsos positivos del 8,40 %.
- No hay ejemplos de referencia `UNKNOWN` en el test, por lo que el comportamiento de esa clase no esta validado.
- Entrenamiento sobre solo 39 trayectorias de entrenamiento y 12 de test; tamano muestral reducido.
- Idioma limitado al ingles.
- Riesgo de alucinacion no cuantificado en la documentacion; al ser una clasificacion cerrada de tres etiquetas, el riesgo se manifiesta como predicciones erroneas mas que como texto libre.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0, permisiva para uso comercial; el modelo base Qwen3-VL-4B-Instruct tambien es Apache 2.0. Verificar las condiciones de las dependencias (OpenPI, LIBERO) si se redistribuyen datos derivados.
- No se incluyen imagenes de entrenamiento, anotaciones originales ni estados del optimizador en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FEGE16/robot-task-observer-completion-history
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- OpenPI: https://github.com/Physical-Intelligence/openpi
- LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Paper, blog, demo o repositorio del proyecto: no disponibles en la informacion proporcionada.
