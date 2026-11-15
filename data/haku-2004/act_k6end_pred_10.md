# Haku-2004/act_k6end_pred_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo `Haku-2004/act_k6end_pred_10` es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg`, publicada en Hugging Face por el usuario Haku-2004 con licencia Apache 2.0. No es un modelo de lenguaje: es una política de control robótico que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a secuencias de comandos motores.

Con 51.672.714 parámetros en formato safetensors y un repositorio de 0,2 GB, se trata de un modelo compacto, pensado para ejecutarse en hardware de consumo y para ciclos de entrenamiento rápidos sobre datasets de teleoperación. Su relevancia radica en que ejemplifica el flujo actual de LeRobot: entrenamiento reproducible de políticas de imitación con un comando (`lerobot-train`) y evaluación directa sobre un robot real o simulado (`lerobot-record`).

La información disponible es limitada: la model card es la plantilla estándar de LeRobot y no incluye detalles sobre el dataset de entrenamiento, la morfología del robot objetivo ni métricas de éxito. Todo lo que no consta en la información proporcionada se indica como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers); codificador visual + decoder transformer que predice chunks de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observación definidas en la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-11-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone de visión (que procesa las imágenes de las cámaras del robot) con un transformer encoder-decoder que genera un chunk de acciones futuras de una sola pasada, en lugar de predecir una acción por paso. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad temporal del control. El paper original también introduce técnicas como el ensamblaje temporal (temporal ensembling) para suavizar las transiciones entre chunks consecutivos.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_4seg`, presumiblemente compuesto por episodios de teleoperación de 4 segundos (el sufijo "4seg" sugiere esta duración). No se dispone de información sobre el número de episodios, el número de tokens o frames, la morfología del robot (la plantilla de evaluación menciona `so100_follower`, pero no se confirma que sea el robot usado en el entrenamiento), la resolución de las cámaras ni si se aplicaron aumentos de datos. Tampoco se documenta el uso de RLHF, DPO ni fine-tuning posterior; ACT es puramente aprendizaje supervisado por imitación.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) a partir de observaciones visuales y de estado del robot.
- Predicción de acciones en lote: emite varios pasos de control por inferencia, lo que reduce la frecuencia efectiva de cómputo necesaria.
- Aprendizaje a partir de teleoperación: el pipeline de LeRobot permite grabar episodios con un líder y entrenar la política sobre ellos.
- Integración con LeRobot: entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`) mediante CLI.
- No soporta tool calling, function calling, agentes de texto, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- Capacidades especiales (thinking mode, visión general, audio): no disponible; la visión se limita al procesamiento de imágenes de las cámaras del robot para el control.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, aprovechando la predicción por chunks para movimientos suaves y continuos.
- Prototipado rápido de políticas con LeRobot: un investigador puede grabar un dataset de 4 segundos por episodio, entrenar con `lerobot-train` en una GPU de consumo y evaluar con `lerobot-record` en el mismo día, lo que acelera la iteración experimental.
- Evaluación comparativa de métodos de imitación: al ser una política ACT estándar de LeRobot, sirve como línea base reproducible frente a otros métodos (Diffusion Policy, VQ-BeT) en el mismo dataset.
- Educación y docencia en robótica: el modelo y su pipeline asociado permiten demostrar el ciclo completo de aprendizaje por imitación (teleoperación, entrenamiento, despliegue) con hardware asequible tipo SO-100.
- Automatización de tareas repetitivas en entornos controlados: tareas de ensamblaje o clasificación de piezas donde la variabilidad del entorno es baja y el dataset de demostración cubre los casos esperados.
- Investigación en generalización visual: al sustituir o aumentar el dataset `k6_4seg`, se puede estudiar cómo varía la robustez de la política ante cambios de iluminación, posición de cámara o fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas sobre el dataset `Haku-2004/k6_4seg`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 0,2 GB; la VRAM total dependerá del backbone visual y del tamaño de las imágenes de entrada, pero es esperable que quepa holgadamente en cualquier GPU con 4-8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento, una RTX 4090 o superior acorta los tiempos; para inferencia, una GPU de gama media es suficiente.
- Cabe en GPU de consumo: sí, con margen amplio; incluso podría ejecutarse en CPU para inferencia de baja frecuencia, aunque no se documentan latencias.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, de la resolución de las cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6end_pred_10 (este) | 51,7 M | ACT (LeRobot) | chunk de acciones; ventana no documentada | apache-2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | variable (decenas de M) | ACT | chunk de acciones | apache-2.0 (segun repositorio) | Hugging Face / LeRobot |
| Diffusion Policy | no disponible | difusión para control | horizonte de acción configurable | no disponible | implementaciones en LeRobot |
| VQ-BeT | no disponible | transformer discretizado | horizonte de acción configurable | no disponible | implementaciones en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en el dataset `k6_4seg`, por lo que la comparación se limita a aspectos de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos: al entrenarse exclusivamente con teleoperación de un operador concreto, la política puede heredar sesgos de estilo de movimiento, velocidad y posiciones preferidas del demostrador.
- Riesgo de fallo fuera de distribución: cambios en iluminación, posición de objetos, fondo o calibración del robot pueden degradar el éxito de forma abrupta; no se documenta ninguna evaluación de robustez.
- Alucinación en el sentido de acciones incorrectas: la política puede generar comandos plausibles pero erróneos cuando la observación se aleja de la distribución del dataset; en robótica esto se traduce en colisiones o movimientos inseguros.
- Contexto y horizonte limitados: la predicción por chunks impone un horizonte corto; tareas de larga duración requieren encadenar chunks y pueden acumular error.
- Idioma: no aplica; no es un modelo de lenguaje.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validar la seguridad del despliegue recae en el integrador.
- Datos insuficientes para producción: sin métricas de éxito, sin descripción del robot objetivo y sin documentación del dataset, no se recomienda su uso en entornos reales sin una evaluación previa exhaustiva.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6end_pred_10
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
