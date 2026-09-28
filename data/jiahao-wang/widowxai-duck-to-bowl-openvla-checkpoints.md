# Jiahao-Wang/widowxai-duck-to-bowl-openvla-checkpoints

## Resumen

WidowXAI Duck-to-Bowl OpenVLA checkpoints es un conjunto de adaptadores LoRA publicados por el usuario Jiahao-Wang sobre el modelo base `openvla/openvla-7b`, un modelo vision-language-action (VLA) de 7.000 millones de parametros. El adaptador especializa el modelo base para una unica tarea de manipulacion robotica descrita en lenguaje natural: "Pick up the yellow duck and place it in the blue bowl". No se trata de un modelo de proposito general, sino de un artefacto de investigacion ligado a un robot WidowXAI, una camara, una escena y una convencion de acciones concretas.

El repositorio contiene dos checkpoints (`step-2000` y `step-5000`) en formato PEFT LoRA, junto con el procesador de OpenVLA y las estadisticas de normalizacion de acciones bajo la clave `widowxai_single_task`. El checkpoint recomendado por el autor es `step-2000`, seleccionado por validacion con un L1 normalizado de 0,132152 frente a 0,135928 de `step-5000`. Ambos deben cargarse sobre el modelo base publico y fusionarse con `merge_and_unload()` antes de la inferencia.

La relevancia actual es metodologica: muestra un flujo reproducible de ajuste fino eficiente (LoRA de rango 32) de un VLA de 7B con datos de teleoperacion reales en formato RLDS, con 45 trayectorias de entrenamiento y 5.633 transiciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 1,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre `openvla/openvla-7b` con adaptador PEFT LoRA; la descripcion detallada del backbone no se especifica en la informacion proporcionada (referencia: arXiv 2406.09246) |
| Parametros totales | 7B en el modelo base; el numero de parametros entrenables del adaptador LoRA no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento en BF16 sin cuantizacion; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; las instrucciones documentadas estan en ingles |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptadores PEFT LoRA), mas `dataset_statistics.json` y procesador de OpenVLA |

## Arquitectura y entrenamiento

El modelo base es OpenVLA-7B, un VLA que consume observaciones visuales e instrucciones en lenguaje natural y produce acciones motoras. Sobre el se aplica un adaptador LoRA de rango 32, alpha 16 y dropout 0, lo que limita el numero de parametros entrenables. El entrenamiento emplea datos de teleoperacion real del robot WidowXAI en formato RLDS: 45 trayectorias de entrenamiento (`train+test`) con 5.633 transiciones, y un conjunto de validacion reservado de 5 trayectorias con 630 transiciones.

La configuracion de entrenamiento usa un tamano de lote global efectivo de 16, tasa de aprendizaje constante de 5e-4, precision BF16 sin cuantizacion, aumento de imagen activado y semilla 7. Durante el entrenamiento se aplica un recorte aleatorio redimensionado al 90% del area; en despliegue y evaluacion debe usarse el recorte centrado al 90%, siguiendo la convencion de evaluacion de OpenVLA. No se documenta el uso de RLHF ni DPO, ni el numero total de tokens de entrenamiento del modelo base.

## Capacidades

- Manipulacion robotica de una sola tarea: generar acciones para la instruccion "Pick up the yellow duck and place it in the blue bowl" a partir de observaciones de camara.
- Acondicionamiento por lenguaje natural: la politica acepta la instruccion textual como entrada, aunque el ajuste se ha realizado sobre una unica frase.
- Inferencia sobre observaciones visuales reales del setup WidowXAI, con normalizacion de acciones especifica (`widowxai_single_task`).
- Integracion con el ecosistema Hugging Face: carga mediante `AutoProcessor`, `AutoModelForVision2Seq` y `PeftModel`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision general, audio: no disponibles; la unica capacidad documentada es la politica visomotora de la tarea especifica.

## Casos de uso

- Replicacion de experimentos de ajuste fino de VLA: el repositorio sirve como referencia exacta de hiperparametros (LoRA r=32, alpha=16, lr=5e-4, batch 16, semilla 7) para reproducir el resultado sobre el mismo robot y escena.
- Plantilla para nuevas tareas de manipulacion: cambiando el dataset RLDS y las estadisticas de normalizacion, el mismo pipeline permite ajustar OpenVLA-7B a otras instrucciones de pick-and-place.
- Evaluacion offline de politicas: calcular el L1 normalizado autoregresivo sobre observaciones registradas para comparar checkpoints sin ejecutar el robot.
- Estudio de sobreajuste en datasets pequenos: con 5.633 transiciones y 45 trayectorias, permite analizar por que el paso 2.000 supera al paso 5.000 en validacion (0,132152 frente a 0,135928).
- Banco de pruebas de normalizacion de acciones: util para validar convenciones de escala, marcos de coordenadas y estadisticas de normalizacion antes de desplegar en hardware.
- Docencia e investigacion en robotica: ejemplo completo y de tamano manejable (1,0 GB de adaptadores) para ilustrar el ciclo datos RLDS, ajuste PEFT y evaluacion offline.
- Comparacion de tecnicas de ajuste eficiente: punto de partida para contrastar LoRA frente a ajuste completo u otras variantes sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos son diagnosticos de imitacion offline sobre observaciones registradas, que no equivalen a tasas de exito en bucle cerrado.

| Checkpoint | Paso de entrenamiento | L1 normalizado en validacion | L1 normalizado autoregresivo (recorte centrado) | Uso previsto |
|---|---:|---:|---:|---|
| `step-2000/` | 2.000 | 0,132152 | 0,162955 | Recomendado; seleccionado por validacion |
| `step-5000/` | 5.000 | 0,135928 | 0,168481 | Checkpoint de comparacion en el paso final |

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 7B parametros del modelo base ocupan aproximadamente 14 GB, por lo que se necesita un minimo practico de 16-20 GB contando procesador de vision y activaciones. No se publican medidas especificas de memoria para estos adaptadores.
- GPU recomendadas: A100 (40 u 80 GB), H100 y tarjetas profesionales con 24 GB o mas.
- GPU de consumo: una RTX 4090 (24 GB) deberia poder alojar el modelo en BF16; en GPUs de 12-16 GB seria necesario recurrir a cuantizacion, no documentada por el autor.
- Opciones de despliegue: `transformers` con `AutoModelForVision2Seq` y `peft` (`PeftModel.from_pretrained` seguido de `merge_and_unload()`), usando `trust_remote_code=True`. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, dado que OpenVLA requiere codigo remoto y una convencion de acciones propia.
- Latencia y throughput: no disponibles.
- Nota operativa: el autor indica que antes de ejecutar en robot hay que validar marcos de coordenadas, escalado de acciones, normalizacion, limites del espacio de trabajo, latencia y comportamiento de parada de emergencia.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos en la informacion proporcionada. La unica comparacion posible con datos es frente al modelo base y entre los dos checkpoints del propio repositorio.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WidowXAI Duck-to-Bowl `step-2000` | 7B (base) + LoRA r=32 | No disponible | L1 validacion normalizado 0,132152 | MIT | Hugging Face, 0 descargas |
| WidowXAI Duck-to-Bowl `step-5000` | 7B (base) + LoRA r=32 | No disponible | L1 validacion normalizado 0,135928 | MIT | Hugging Face |
| `openvla/openvla-7b` (modelo base) | 7B | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face |
| Otras politicas roboticas (RT-2, Octo, OpenVLA-OFT, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especializacion extrema: los checkpoints estan entrenados para un robot, una camara, una escena, una convencion de acciones y una unica instruccion; no generalizan a otras tareas ni entornos sin nuevo ajuste fino.
- Sesgos conocidos: no se documentan sesgos especificos, pero el modelo hereda los del VLA base y los del dataset de teleoperacion, limitado a un operador y a una configuracion fisica concreta.
- Riesgo de alucinacion: en un VLA la consecuencia no es texto incorrecto, sino acciones fisicas incorrectas; el autor advierte explicitamente de que los errores offline no son evidencia de operacion autonoma segura.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y las instrucciones registradas estan en ingles; no se declaran idiomas soportados.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base OpenVLA-7B tiene su propia licencia que debe verificarse por separado.
- Caveat de evaluacion: el L1 reportado es un diagnostico de imitacion sobre observaciones registradas, no una tasa de exito en bucle cerrado; la diferencia entre `step-2000` y `step-5000` es pequena (0,132152 frente a 0,135928).
- Requisito de despliegue: hay que usar recorte centrado al 90% en inferencia, no el recorte aleatorio del entrenamiento, y cargar las estadisticas de normalizacion con `unnorm_key="widowxai_single_task"`.
- Seguridad operativa: empezar con pruebas supervisadas a baja velocidad y validar parada de emergencia antes de cualquier ejecucion real.
- Madurez: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jiahao-Wang/widowxai-duck-to-bowl-openvla-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiahao-Wang/widowxai-duck-to-bowl-openvla
- Modelo base: https://huggingface.co/openvla/openvla-7b
- Paper de OpenVLA: https://arxiv.org/abs/2406.09246
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (corresponden al sitio ameli.fr de la Assurance Maladie francesa), por lo que no se han incluido como fuentes.
