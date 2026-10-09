# mattewg/pi05-xarm7-shaver-v2

## Resumen

pi05-xarm7-shaver-v2 es un ajuste fino del modelo pi0.5 (referenciado en la model card como `pi05_base`) orientado a control robótico. Lo publica el usuario mattewg y esta pensado para un robot bimanual xArm7 que debe realizar una tarea concreta de manipulacion de una caja de maquinilla de afeitar ("shaver box"). Se trata, por tanto, de un modelo de vision-lenguaje-accion (VLA) especializado, no de un modelo de lenguaje de proposito general.

El modelo parte del dataset `panasonicai/shaver_v2_human`, compuesto por 116 episodios de teleoperacion humana a 60 fps, con cuatro camaras (dos de escena y dos de muneса) y pinzas analogicas. El entrenamiento se hizo durante 30.000 pasos con tamano de lote 32, y el autor publica cuatro variantes que constituyen un test A/B: con y sin recorte de las camaras laterales, y en dos infraestructuras distintas (Lambda con 8x H100 y Leonardo con 4x A100).

Su relevancia es acotada pero util para la comunidad de robotica: documenta de forma detallada el preprocesado (recorte normalizado, filtro de zona muerta), los parametros de accion (deltas sobre 14 articulaciones y pinzas analogicas absolutas en fragmentos de 16 pasos a 60 Hz) y las decisiones de configuracion, lo que lo convierte en un ejemplo reproducible de ajuste fino de pi0.5 para un brazo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) de la familia pi0.5; ajuste fino de `pi05_base`. Detalle interno no disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el config limita el prompt a `max_token_len=256` tokens (el valor por defecto de pi0.5, 200, truncaba el estado discretizado) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (el prompt de tarea es la cadena de 4 etapas del dataset) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de openpi: carpeta `params/` mas `assets/panasonicai/shaver_v2_human/norm_stats.json` (y `crop.json` en las variantes con recorte). No se publican safetensors ni GGUF |
| Tamano del repositorio | 348,3 GB |
| Libreria | openpi |
| Pipeline | robotics |
| Paso de entrenamiento | 30.000 (checkpoints cada 5.000 y el final 29.999) |
| Fecha de publicacion | 2026-10-08 (actualizado el 2026-10-09) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `pi05_base`, el checkpoint base de pi0.5, sobre el dataset `panasonicai/shaver_v2_human` (116 episodios de teleoperacion humana, 60 fps, 4 camaras, pinzas analogicas). El entrenamiento se hizo durante 30.000 pasos con lote 32. No se detalla en la informacion proporcionada el numero total de tokens de entrenamiento ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (en modelos de politica de este tipo, el ajuste suele ser por imitacion supervisada, pero esto no se confirma en la model card).

La innovacion metodologica principal que documenta el autor es un test A/B de recorte de las camaras laterales. Para las variantes con recorte, se aplican cajas normalizadas `(x0, y0, x1, y1)`: `side_1` usa `(0.0, 0.0, 0.6667, 1.0)` (x de 0 a 320, altura completa) y `side_2` usa `(0.3333, 0.0, 1.0, 1.0)` (x de 160 a 480, altura completa); las camaras de muñeca no se recortan. Las cajas conservan la caja de la maquinilla, el area de trabajo y todas las posiciones iniciales de los objetos en los 116 episodios, y aportan aproximadamente 1,5 veces mas pixeles a la tarea. `side_1` es la unica camara de escena en inferencia; `side_2` se sortea aleatoriamente en su lugar durante el entrenamiento (aumento de vista base). Ambos recortes son de 320x300, y despues se aplica el `ResizeImages(224, 224)` habitual de openpi con relleno tipo letterbox.

Otros detalles de entrenamiento relevantes: se aplica un filtro de zona muerta (`DataConfig.drop_still`) que descarta como inicio de muestra los fotogramas dentro de rachas de al menos 1 segundo en las que ambos brazos estan quietos (toda articulacion por debajo de 0,05 rad/s y pinzas sin cambios); se descartaron 31.137 de 898.102 fotogramas (3,5 %). Las muestras siguen leyendo el episodio continuo, por lo que no hay empalmes. Las estadisticas de normalizacion (`norm_stats.json`) se calcularon sobre los mismos fotogramas filtrados (866.944). Las acciones son deltas sobre las 14 articulaciones y pinzas analogicas absolutas (0 abierto, 1 cerrado), en fragmentos de 16 pasos a 60 Hz.

## Capacidades

- Control de manipulacion bimanual sobre un robot xArm7, con salida de acciones sobre 14 articulaciones mas pinzas analogicas absolutas.
- Generacion de fragmentos de accion de 16 pasos a 60 Hz (action chunking).
- Percepcion visual a partir de cuatro camaras (dos de escena, dos de muñeca), con soporte de recorte normalizado y aumento de vista base.
- Condicionamiento por lenguaje: el prompt es la cadena de tarea de 4 etapas del dataset, que junto con el estado discretizado ocupa unos 230 tokens.
- Clasificacion de etapa de tarea mediante el componente auxiliar `stage_detector/`, pensado para un cliente con conmutacion de etapas.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de software; el modelo ejecuta una politica de manipulacion.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de pensamiento, vision general o audio no disponibles; la unica modalidad de entrada documentada es imagen mas prompt de tarea mas estado del robot.

## Casos de uso

- Automatizacion de la tarea de empaquetado o manipulacion de la caja de maquinilla: el modelo esta ajustado especificamente para esta tarea sobre xArm7, por lo que es adecuado como politica directa en una celda robotizada dedicada.
- Investigacion en manipulacion bimanual: sirve como referencia reproducible para estudiar coordinacion de dos brazos con 14 articulaciones y pinzas analogicas a 60 Hz.
- Ajuste fino de politicas VLA por imitacion: el repositorio documenta el flujo completo (dataset, recorte, filtro de zona muerta, estadisticas de normalizacion), lo que permite replicar el proceso en otras tareas o brazos.
- Ablacion de estrategias de vision: el test A/B con y sin recorte de camaras laterales permite medir el efecto del preprocesado de imagen sobre el rendimiento de la politica.
- Despliegue con openpi: la model card incluye el comando `serve_policy.py` con la configuracion correspondiente, de modo que puede servirse como endpoint de politica conectado a un cliente robot.
- Flujos con conmutacion de etapas: gracias al `stage_detector/` adjunto, se puede construir un cliente que cambie de etapa de tarea (las 4 etapas del prompt) de forma automatica.
- Comparacion de infraestructuras de entrenamiento: las variantes de Lambda (8x H100) y Leonardo (4x A100) permiten comparar el coste y el resultado del mismo ajuste en hardware distinto.
- Prototipado en laboratorio de robotica: util para grupos que ya dispongan de un xArm7 y quieran evaluar una politica preentrenada antes de invertir en datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un test A/B (con recorte frente a sin recorte, y en dos clusters distintos), pero no incluye cifras de exito, tasas de finalizacion ni metricas comparativas entre variantes.

## Requisitos de hardware

- Entrenamiento documentado: 8x H100 (variante `v2_crop_still`) y 4x A100 (variantes `v2_crop_leonardo` y `v2_nocrop_leonardo`).
- VRAM de inferencia: no disponible de forma explicita. Como estimacion orientativa (no confirmada por el autor), un checkpoint de la familia pi0.5 en precision bf16 requiere del orden de una decena de gigabytes solo en pesos, por lo que se recomienda una GPU con al menos 16-24 GB.
- GPU recomendadas: para entrenamiento, H100 y A100; para inferencia, cualquier GPU profesional o de gama alta con memoria suficiente. No se especifican modelos concretos de consumo.
- Compatibilidad con GPU de consumo: no confirmada. No se indica que quepa en una RTX 4090 ni en GPUs de gama inferior.
- Opciones de despliegue: servidor de politicas de openpi (`scripts/serve_policy.py` con `policy:checkpoint`), ejecutado con `uv run`. La libreria es openpi (ecosistema JAX). Qualcomm AI Hub mantiene un modelo pi05 optimizado para dispositivos Qualcomm, aunque no se confirma que corresponda a este ajuste concreto.
- Latencia y throughput: no disponibles. La politica genera fragmentos de 16 pasos a 60 Hz, lo que en operacion real implicaria una frecuencia objetivo de 60 Hz, pero no se publican medidas de latencia.
- Almacenamiento: el repositorio ocupa 348,3 GB, ya que incluye varias variantes y multiples checkpoints (cada 5.000 pasos y el final 29.999).

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mattewg/pi05-xarm7-shaver-v2 | pi05_base | Manipulacion bimanual xArm7, tarea "shaver box" | `max_token_len=256` | no disponible | Hugging Face (openpi) |
| mattewg/pi05-xarm7-shaver-all60-step15000 | pi05_base | Manipulacion bimanual xArm7, variante del mismo dataset | no disponible | no disponible | Hugging Face (openpi) |
| pi05_base (openpi / pi0.5 base) | Modelo base de pi0.5 | Politica VLA de proposito general | no disponible | no disponible | Referenciado como origen del ajuste |

No se dispone de datos de rendimiento comparativos entre estas variantes ni con otros modelos VLA (por ejemplo, OpenVLA o RDT), por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, por lo que no puede confirmarse su uso comercial sin aclaracion previa del autor.
- Modelo altamente especializado: esta ajustado para una unica tarea (caja de maquinilla) sobre un robot concreto (xArm7 bimanual). No es una politica generalizable a otras tareas o morfologias sin reentrenamiento.
- Dependencia estricta de la configuracion: un checkpoint con recorte debe servirse con la config de recorte y uno sin recorte con la config `_nocrop`. El servidor avisa con "crop mismatch" si no coinciden, pero el uso incorrecto puede degradar el comportamiento.
- Preprocesado fragil: el cliente debe enviar fotogramas completos de 300x480 sin recortar; el recorte se aplica en el servidor. Recortar tambien en el cliente produciria un resultado incorrecto.
- Sesgos del dataset: los datos provienen de 116 episodios de teleoperacion humana, de modo que el modelo hereda los sesgos, la variabilidad y las limitaciones de esa recogida concreta (posiciones iniciales, objetos y entorno fijos).
- Riesgo de alucinacion en el sentido linguistico: no aplica como en un modelo de lenguaje; el riesgo equivalente es la ejecucion de acciones incorrectas ante estados o vision fuera de distribucion.
- Idioma: no se documentan idiomas soportados; el prompt de tarea es una cadena fija del dataset.
- Limitaciones de contexto: el prompt se limita a 256 tokens, y el estado discretizado ocupa una parte importante, lo que reduce el margen disponible para texto adicional.
- Pinzas: el despliegue debe hacerse sin binarizar las pinzas; la accion de pinza es analogica absoluta (0 abierto a 1 cerrado).
- Coste de almacenamiento y despliegue: el repositorio de 348,3 GB y la necesidad de GPU profesional dificultan su uso en entornos ligeros.
- Sin benchmarks publicos: no hay evidencia cuantitativa de la tasa de exito de la tarea en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattewg/pi05-xarm7-shaver-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/panasonicai/shaver_v2_human
- Repositorio de codigo (rama `shaver-crop`, openpi en `policy/openpi`): https://github.com/KKallidromitis/xarm-robotics
- Variante relacionada `all60-step15000`: https://huggingface.co/mattewg/pi05-xarm7-shaver-all60-step15000
- Modelos etiquetados con `xarm7` en Hugging Face: https://huggingface.co/models?other=xarm7
- Modelo pi05 en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
