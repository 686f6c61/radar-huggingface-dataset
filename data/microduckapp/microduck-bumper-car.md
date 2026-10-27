# microduckapp/microduck-bumper-car

## Resumen

Microduck bumper car (identificador `microduckapp/microduck-bumper-car`) no es un modelo de lenguaje, sino una política de control motriz en formato ONNX publicada para el robot bípedo Microduck. El autor, `microduckapp`, la distribuye como un "move" o movimiento concreto dentro de la aplicación MicroDuck: una secuencia de 12,8 segundos que hace que el robot avance, choque, retroceda girando y vuelva a embestir, imitando el comportamiento de un coche de choque de feria.

El artefacto principal es `policy.onnx`, una política que recibe 61 observaciones y emite 14 objetivos de articulación a 50 Hz, acompañada de un `manifest.json` con los requisitos de instalación y reproducción y un vídeo de previsualización. El repositorio no incluye pesos en safetensors, tokenizador, vocabulario ni documentación sobre el conjunto de entrenamiento: el modelo card se limita a describir el comportamiento observable y el contrato de entrada/salida.

Su relevancia es de ecosistema más que de investigación: Microduck es la plataforma bípeda de 25 cm y código abierto presentada por Pollen Robotics y Hugging Face (filial de robótica de Hugging Face) como banco de pruebas de aprendizaje por refuerzo y transferencia sim-a-real. Este repositorio es un ejemplo de distribución de habilidades entrenadas como políticas ONNX ligeras, instalables desde una app, lo que acerca el despliegue de comportamientos RL a usuarios sin infraestructura de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de control para robot bípedo, exportada a ONNX; topología interna no documentada (no se especifica si es MLP, transformer u otra) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` y `media/preview.mp4` |
| Entradas | 61 observaciones por paso |
| Salidas | 14 objetivos de articulación por paso |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Duración del movimiento | 12,8 segundos |
| Pipeline declarado en Hugging Face | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Autor | microduckapp |
| Fecha de creación / actualización | 2026-10-27 / 2026-10-27 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna de la política: no se indica el número de capas, el tipo de red ni el número de parámetros. Lo que sí queda fijado es el contrato de inferencia, que sitúa la política en el bucle de control del robot a 50 Hz con 61 observaciones de entrada y 14 consignas de articulación de salida. Ese interfaz es coherente con una política de locomoción/reactividad entrenada para un bípedo de 14 grados de libertad de actuación, aunque el desglose de las 14 salidas (por articulación o por grupo) no está documentado en el repositorio.

Tampoco se detalla el proceso de entrenamiento de esta política concreta: no hay número de tokens ni de pasos de simulación, ni composición del dataset, ni referencia a RLHF/DPO (fuera de lugar en este dominio). El contexto de plataforma indica que Microduck se entrena con aprendizaje por refuerzo en simulación (MuJoCo según la cobertura de prensa, e Isaac Sim en la demostración de NVIDIA GTC Berlin), y que los comportamientos se transfieren después al hardware real. El `manifest.json` actúa como contrato de instalación y reproducción dentro de la app MicroDuck, pero su contenido no se reproduce en la model card.

## Capacidades

- Ejecución de un movimiento pregrabado de 12,8 segundos con patrón cíclico de avance, colisión, retroceso giratorio y nueva embestida.
- Generación de consignas de control a 50 Hz para 14 actuaciones a partir de 61 observaciones, apta para bucle cerrado en tiempo real.
- Distribución como grafo ONNX portable, ejecutable con ONNX Runtime sin depender de frameworks de entrenamiento.
- Integración con la app MicroDuck mediante `manifest.json` para instalación y reproducción del movimiento.
- Previsualización del comportamiento mediante `media/preview.mp4`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión, audio ni multilingüismo.

## Casos de uso

- Demostración de comportamiento reactivo en Microduck: cargar `policy.onnx` desde la app y reproducir el movimiento para mostrar locomoción con colisiones controladas en ferias, aulas o vídeos de producto.
- Prueba de banco del robot: usar el ciclo de embestida y retroceso giratorio como secuencia de estrés para verificar respuesta de actuadores, consumo y recuperación tras impacto.
- Material docente de sim-a-real: emplear el movimiento como ejemplo mínimo de política RL exportada a ONNX, con entradas y salidas bien definidas, en cursos de robótica o aprendizaje por refuerzo.
- Desarrollo de la app MicroDuck: servir como referencia del formato `microduck-move` (política más manifiesto más vídeo) para que terceros publiquen sus propios movimientos.
- Pruebas de integración de ONNX Runtime en hardware embebido: medir latencia de inferencia real frente al presupuesto de 20 ms por paso que impone el control a 50 Hz.
- Recolección de datos de comportamiento: grabar las 61 observaciones y las 14 salidas durante la reproducción para analizar estabilidad y comparar con políticas propias.
- Base para ajuste fino o imitación: usar el par observación-acción como referencia de estilo de movimiento al entrenar políticas alternativas en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de recompensa, tasas de éxito, comparaciones con otras políticas ni evaluaciones cuantitativas de transferencia sim-a-real. Los únicos datos de rendimiento declarados son el contrato temporal (50 Hz, 12,8 s) y las dimensiones de entrada y salida (61 y 14).

## Comparativa con modelos similares

No se dispone de datos verificables de otras políticas comparables para la plataforma Microduck, y las comparaciones habituales entre modelos de lenguaje (MMLU, HumanEval, GSM8K) no aplican a este artefacto.

| Aspecto | microduck-bumper-car | Otras políticas `microduck-move` | Políticas de locomoción de otros bípedos |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto / ventana de observacion | 61 observaciones por paso | no disponible | no disponible |
| Salidas | 14 objetivos de articulación | no disponible | no disponible |
| Frecuencia de control | 50 Hz | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | pública en Hugging Face, 0 descargas | no identificadas con datos públicos | no comparable (plataformas distintas) |

## Requisitos de hardware

- VRAM: no aplica en el robot; la inferencia está pensada para ejecutarse en CPU. No se publica el tamaño del fichero ONNX, por lo que no se puede estimar memoria de forma fiable (el repositorio figura como 0.0 GB en los metadatos).
- Hardware de destino: el propio Microduck, bípedo de 25 cm presentado por Pollen Robotics y Hugging Face.
- GPU: no se requieren GPU para la inferencia. Para reentrenar o simular políticas del mismo tipo, la documentación de plataforma cita simulación en MuJoCo e Isaac Sim y entrenamiento en servidores en la nube, sin especificar modelos de GPU.
- GPU de consumo: no aplica para la ejecución del movimiento; cualquier equipo capaz de correr ONNX Runtime sirve para inspeccionar el grafo.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y la app MicroDuck mediante `manifest.json`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control.
- Latencia y throughput: el control a 50 Hz impone un presupuesto de 20 ms por paso de inferencia; no se publica la latencia medida del grafo ni el coste por paso en el hardware del robot.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial, la redistribución o la modificación están permitidos. Es un bloqueo potencial para integrarlo en productos.
- Ausencia total de documentación técnica: sin detalles de arquitectura, entrenamiento, dataset ni evaluación, la reproducibilidad y la auditoría del comportamiento son muy limitadas.
- Movimiento específico y cerrado: reproduce un patrón concreto de 12,8 segundos; no es una política general de locomoción ni admite comandos arbitrarios de alto nivel.
- Entrada fija de 61 observaciones: cualquier cambio en el conjunto de sensores o en el orden de las observaciones invalida la política.
- Riesgo físico real: el patrón incluye colisiones deliberadas; su uso requiere espacio despejado y supervisión, y no se documentan márgenes de seguridad ni paradas de emergencia.
- Sin métricas de robustez: no hay datos sobre comportamiento ante terreno irregular, empujones externos o fallos de actuador.
- Sesgos y alucinación: no aplican en el sentido de los modelos de lenguaje, pero sí existe el riesgo análogo de generalización errónea fuera de las condiciones de simulación con las que se entrenó la política.
- Idiomas: no aplica; el artefacto no procesa texto ni voz.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día, sin historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-bumper-car
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cobertura de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Cobertura de OpenSourceForU: https://www.opensourceforu.com/2026/08/hugging-face-launches-open-source-microduck-robotc/
- Cobertura de NDTV Profit sobre la demo en NVIDIA GTC Berlin: https://www.ndtvprofit.com/technology/microducks-steal-the-show-at-nvidias-gtc-berlin-keynote-demonstrate-ai-powered-robot-training-12220206
- Paper y blog oficial del modelo: no disponible
- Demo interactiva: no disponible (solo `media/preview.mp4` dentro del repositorio)
