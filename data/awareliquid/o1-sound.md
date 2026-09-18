# AwareLiquid/O1-Sound

## Resumen

O1-Sound es un detector de palabra de activacion (wake word / keyword spotting) desarrollado por AwareLiquid, construido sobre el nucleo recurrente de la linea de investigacion O-Series. Su funcion es escuchar de forma continua una senal de microfono y disparar una activacion cuando detecta un saludo ("hello", "hola", "bonjour", "你好"). El modelo esta pensado para ejecucion always-on en dispositivos alimentados por bateria: el estado interno que arrastra entre frames es de tamano constante (5.120 bytes por stream con la configuracion por defecto), independientemente de cuanto tiempo lleve abierto el microfono, por lo que el coste de streaming es O(1).

La arquitectura es una red neuronal liquida (liquid neural network) de multiples escalas temporales: cada canal dispone de una constante de tiempo tau aprendible, parametrizada como `softplus(log_tau) + tau_min` e inicializada de forma geometrica entre 10 y 240 ms. La configuracion por defecto es `hidden=640, layers=2`, con 1.298.064 parametros para `n_classes=2`, lo que ocupa 5,19 MB en fp32 y 1,30 MB en int8. El front-end es un log-mel fijo sin pesos; la salida es binaria wake / not-wake, con una variante multiclase experimental (una clase por saludo mas "other").

Es relevante ahora porque demuestra que es posible mantener un detector de wake word con estado acotado y huella de memoria de pocos megabytes, exportable a ONNX para inferencia en el borde. Ahora bien, el propio autor es explicito: el modelo **no es de grado produccion**. Las metricas publicadas muestran que la arquitectura funciona en ingles con volumen de datos suficiente (FRR 0,146 a FAR 0,046 en el Run 2), pero el planteamiento multilingue esta limitado por la cantidad de datos por idioma, no por la arquitectura; de hecho, en el Run 1 (9 idiomas, 91 clips de activacion) el FRR fue de 0,909, peor que no disparar nunca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal liquida (LNN) recurrente con constantes de tiempo multiples (tau aprendible por canal); front-end log-mel fijo sin pesos; salida de clasificacion binaria o multiclase con cabeza OR |
| Parametros totales | 1.298.064 (configuracion por defecto `hidden=640, layers=2`, `n_classes=2`); otras configuraciones: 483.984 (`hidden=384, layers=2`), 841.872 (`hidden=512, layers=2`), 1.367.184 (`hidden=512, layers=3`), 1.852.560 (`hidden=768, layers=2`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de ventana de tokens; el estado recurrente arrastrado es de 5.120 bytes por stream con la configuracion por defecto (3.072 B con `hidden=384`, 4.096 B con `hidden=512`) y es constante, verificado sobre 500 frames |
| Tipos de cuantizacion | fp32 (5,03 MB el grafo ONNX por defecto) e int8 (1,27 MB el grafo ONNX por defecto); el checkpoint PyTorch por defecto ocupa 5,19 MB en fp32 y 1,30 MB en int8 |
| Idiomas soportados | Etiquetado como `en`. Entrenado experimentalmente con hasta 10 idiomas (MSWC); el soporte multilingue no esta validado a la escala de datos actual |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`, grafo streaming fp32 con `step()` de un solo frame) |

## Arquitectura y entrenamiento

El nucleo es una red recurrente de la familia de redes neuronales liquidas, con multiples escalas temporales. Cada canal lleva su propia constante de tiempo aprendible tau, parametrizada como `softplus(log_tau) + tau_min` e inicializada geometricamente en el rango de 10 a 240 ms. Los canales con tau corta siguen el fonema actual, mientras que los canales con tau larga retienen la envolvente de la palabra completa, lo que permite separar una frase de activacion de un vecino foneticamente cercano sin necesidad de apilar profundidad. El front-end es un log-mel fijo (sin pesos) y la salida es wake / not-wake. El streaming es O(1): el estado arrastrado no crece con el tiempo que lleva abierto el microfono.

La model card documenta varias ejecuciones de entrenamiento. El Run 2 (1 de agosto de 2026, solo ingles, 301 clips de activacion) alcanzo FRR 0,146 a FAR 0,046 sobre test reservado, con una precision de desarrollo de 0,919 frente a una linea base de "nunca disparar" de 0,780. El Run 7 (18 de agosto de 2026, 10 idiomas, MSWC completo) obtuvo una precision de desarrollo de 0,885 (0,849 balanceada), con el ingles como unico idioma con datos significativos (FRR 0,098 a FAR 0,133, 41 clips) y un FRR del peor idioma de 1,000 con solo 2 clips positivos. El experimento multiclase (septiembre de 2026, 10 idiomas, cabeza OR) logro una precision balanceada de desarrollo de 0,84 y un FRR de test de 0,35 a FAR 0,046 en el global. No se documenta en la informacion disponible el uso de RLHF ni DPO, ni el numero exacto de tokens o frames de entrenamiento mas alla de las cifras de clips por ejecucion.

En el plano de validacion de ingenieria, la model card indica que pasan 32 tests: el `step()` en streaming es numericamente identico al `forward()` por lotes y el estado arrastrado permanece constante a lo largo de 500 frames. La exportacion ONNX presenta un error maximo absoluto entre ONNX y torch de 3,7e-09.

## Capacidades

- Deteccion de palabra de activacion (wake word) en streaming continuo, con salida binaria wake / not-wake.
- Deteccion de saludos concretos: "hello", "hola", "bonjour", "你好" (variante multiclase experimental, con una clase por saludo mas "other").
- Clasificacion de audio (pipeline declarado: `audio-classification`) sobre caracteristicas log-mel.
- Inferencia en streaming con estado de tamano fijo, sin crecimiento de memoria con la duracion de la senal.
- Exportacion a ONNX con soporte de `step()` de un solo frame: entra un frame, salen logits y el siguiente estado.
- Cuantizacion a int8 para despliegue en el borde.
- Multilingue: experimental y no validado a la escala de datos actual.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento.

## Casos de uso

- Activacion por voz en dispositivos con bateria: el modelo escucha de forma continua con un estado constante de 5.120 bytes por stream, lo que permite mantener el microfono abierto indefinidamente sin crecimiento de memoria y despertar el dispositivo solo cuando se pronuncia un saludo.
- Investigacion en redes neuronales liquidas: sirve como banco de pruebas reproducible para estudiar el efecto de las constantes de tiempo tau aprendibles en tareas de clasificacion de audio en streaming, con metricas de FRR/FAR publicadas por ejecucion.
- Prototipado de wake word en ingles con datos propios: es la configuracion con mejores resultados medidos (Run 2: FRR 0,146 a FAR 0,046 con 301 clips), por lo que un equipo puede partir de ahi y reentrenar con su propio vocabulario y acento.
- Despliegue en microcontroladores y SBCs: con 1,30 MB en int8 y 0,84 MB en la configuracion `hidden=512, layers=2`, el grafo ONNX es candidato para dispositivos con memoria muy limitada; la latencia y el consumo reales no estan medidos sobre hardware real.
- Integracion en pipelines de audio embebido: el grafo ONNX de un solo frame se puede insertar en un bucle de captura que alimente frames log-mel sucesivos y consuma el estado devuelto en cada paso.
- Estudio comparativo de cabezas de clasificacion: la variante multiclase con cabeza OR permite analizar el compromiso entre clasificar varios saludos y la tasa de falsas activaciones (FRR 0,35 a FAR 0,046 en test).
- Verificacion de propiedades de recurrencia: el par de tests `step()` frente a `forward()` y estado constante a 500 frames es util como referencia para validar implementaciones propias de modelos recurrentes en streaming.
- Filtrado previo de audio en prototipos de asistente domestico: como etapa de bajo coste antes de un reconocedor de voz completo, aceptando que en audio fuera de dominio (por ejemplo tonos puros) puede dispararse por error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las metricas publicadas son especificas de la tarea de keyword spotting y se recogen a continuacion tal como aparecen en la model card.

| Ejecucion | Idiomas | Datos de activacion | Metrica | Valor |
|---|---|---|---|---|
| Run 1 (2026-07-31) | 9 | 91 clips | FRR a FAR 0,049 | 0,909 |
| Run 2 (2026-08-01) | Ingles | 301 clips | FRR a FAR 0,046 | 0,146 |
| Run 2 (2026-08-01) | Ingles | 301 clips | Precision de desarrollo (linea base 0,780) | 0,919 |
| Run 7 (2026-08-18) | 10 (MSWC completo) | No disponible | Precision de desarrollo / balanceada | 0,885 / 0,849 |
| Run 7 (2026-08-18) | Ingles | 41 clips | FRR a FAR 0,133 | 0,098 |
| Run 7 (2026-08-18) | Peor idioma | 2 clips positivos | FRR | 1,000 |
| Multiclase (2026-09) | 10 | No disponible | Precision balanceada de desarrollo | 0,84 |
| Multiclase (2026-09) | 10 | No disponible | FRR a FAR 0,046 (test global) | 0,35 |

Metricas de validacion de ingenieria:

| Metrica | Valor |
|---|---|
| Error maximo absoluto ONNX frente a torch | 3,7e-09 |
| Tamano del grafo ONNX (fp32 / int8) | 5,03 MB / 1,27 MB |
| Estado arrastrado por stream (config. por defecto) | 5.120 bytes, constante sobre 500 frames |
| Tests que pasan | 32 |
| Latencia del bucle `step()` en Python sobre CPU de escritorio | ~0,5 ms por frame |

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El grafo ONNX por defecto ocupa 5,03 MB en fp32 y 1,27 MB en int8; el checkpoint PyTorch por defecto ocupa 5,19 MB en fp32 y 1,30 MB en int8. La configuracion mas pequena (`hidden=384, layers=2`, 483.984 parametros) baja a 1,94 MB en fp32 y 0,48 MB en int8.
- GPU recomendadas: no aplica en el escenario objetivo; el modelo esta disenado para CPU y hardware de borde. No se documentan requisitos de GPU ni se aportan datos de ejecucion sobre A100, H100 o RTX 4090.
- Cabida en GPU de consumo: si, cualquier GPU de consumo dispone de memoria mas que suficiente; no obstante, el caso de uso previsto es CPU o microcontrolador, no GPU.
- Opciones de despliegue: ONNX Runtime para el grafo `o1sound.onnx` (fp32 o int8); el codigo de entrenamiento, exportacion y demo de streaming esta en el repositorio de GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: el bucle `step()` en Python tarda aproximadamente 0,5 ms por frame sobre una CPU de escritorio. La latencia y el consumo energetico no se han medido sobre hardware real.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificados de modelos comparables, por lo que los campos numericos se marcan como no disponibles. Como alternativas de la misma categoria (keyword spotting / wake word en el borde) pueden citarse openWakeWord y Picovoice Porcupine, pero no se dispone de sus cifras en esta busqueda y no se deben asumir valores.

| Modelo | Parametros | Contexto / estado | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AwareLiquid/O1-Sound | 1.298.064 (config. por defecto) | Estado recurrente fijo de 5.120 B por stream | FRR 0,146 a FAR 0,046 en ingles (Run 2); multilingue no soportado a esta escala | MIT | HuggingFace (`.pt` y `.onnx`) y GitHub |
| openWakeWord | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Picovoice Porcupine | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El propio autor declara explicitamente que el modelo **no es de grado produccion**. Las palabras de activacion desplegadas funcionan con FRR de un solo digito a una tasa de falsa aceptacion expresada por hora, no por clip; las metricas de O1-Sound estan expresadas por clip.
- El soporte multilingue no esta validado. En el Run 1 (9 idiomas, 91 clips) el FRR fue de 0,909 a FAR 0,049, peor que no disparar nunca; en el experimento multiclase el FRR de test fue de 0,35 a FAR 0,046. El cuello de botella es la cantidad de datos por idioma, no la arquitectura, segun el autor.
- El ingles es el unico idioma con datos significativos (FRR 0,098 a FAR 0,133 con solo 41 clips). El FRR del peor idioma es 1,000 con 2 clips positivos.
- Riesgo de falsa activacion en audio fuera de dominio: la model card indica que con audio como tonos puros el modelo puede dispararse.
- Precision de desarrollo de 0,919 (Run 2) y 0,885 (Run 7) frente a lineas base de 0,780 y un FRR de 0,146 en el mejor caso: margen limitado y sensible al volumen y la composicion de los datos.
- Latencia y consumo energetico no medidos sobre hardware real, pese a que el caso de uso declarado es always-on con bateria.
- No hay informacion sobre sesgos por acento, edad, sexo o calidad de microfono mas alla del desglose por idioma.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo solo produce una decision de clasificacion wake / not-wake.
- Licencia MIT: permite uso comercial y modificacion, pero el estado de validacion descrito desaconseja un despliegue en produccion sin reevaluacion sobre datos propios.
- El repositorio en HuggingFace registra 0 descargas y 0 likes, y un tamano de 0,0 GB en el momento de la consulta; se trata de una publicacion de investigacion con muy poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwareLiquid/O1-Sound
- Codigo, entrenamiento y demo de streaming: https://github.com/AwareLiquid/O1-Sound
- Notas de la release de investigacion `research-2026-08-18`: https://github.com/AwareLiquid/O1-Sound/releases/tag/research-2026-08-18
- Linea de investigacion MT-LNN / O-Series: https://github.com/AwareLiquid/M1
- Investigacion de arquitectura de siguiente generacion: https://github.com/AwareLiquid/M2
- Benchmarks y retractaciones del autor: https://awareliquid.ai

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
