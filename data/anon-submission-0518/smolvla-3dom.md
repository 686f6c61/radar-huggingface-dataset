# anon-submission-0518/SmolVLA-3dom

## Resumen

SmolVLA-3dom es un checkpoint de investigación derivado de la arquitectura oficial SmolVLA de LeRobot, que combina el modelo vision-lenguaje SmolVLM2-500M con un "action expert" entrenado mediante flow matching. En concreto, este modelo está ajustado para predecir secuencias de poses de manos (21 keypoints del modelo MANO más el movimiento de muñeca por mano, a 80 Hz) a partir de una única imagen egocéntrica y una instrucción en lenguaje natural. El checkpoint se presenta como baseline anónimo para revisión por pares, con pesos serializados en un único fichero PyTorch (`smolvla-3dom.pt`).

El modelo se ha fine-tuneado sobre una mezcla de tres conjuntos de datos públicos de interacción mano-objeto, lo que lo orienta a tareas de imitación y comprensión de manipulación manual en robótica y visión por computador. Su relevancia actual radica en que extiende el paradigma VLA (vision-language-action) a la predicción de poses de mano de alta frecuencia temporal (chunks de 16 pasos a 80 Hz), un componente clave para teleoperación, aprendizaje por imitación y análisis de destreza manual.

El repositorio ocupa 1,8 GB y no registra descargas ni interacciones en el momento de la consulta. La información pública es mínima: no se documentan benchmarks, idiomas, ni pipeline de Hugging Face, y la model card se limita a describir la arquitectura base y el formato de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (SmolVLM2-500M como backbone vision-lenguaje + action expert con flow matching) |
| Parametros totales | no disponible (backbone VLM de 500M; total no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32/fp16 sin indicacion explicita) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura oficial SmolVLA de LeRobot: un backbone SmolVLM2-500M que codifica la observación visual (una única imagen egocéntrica) junto con la instrucción textual, y un "action expert" acoplado que genera las acciones mediante flow matching. En este caso, la salida no son acciones de robot convencionales, sino chunks de 16 pasos de poses de mano futuras: 21 keypoints MANO más el desplazamiento de muñeca por cada mano, muestreados a 80 Hz. Los buffers de normalización están embebidos dentro del propio state_dict.

El fine-tuning se realizó sobre una mezcla de tres conjuntos de datos públicos de interacción mano-objeto (los nombres concretos no se detallan en la model card). El checkpoint corresponde al paso 18.000 de entrenamiento. No se especifican el volumen total de tokens, la composición exacta del dataset, ni si se aplicaron etapas de RLHF/DPO; al tratarse de un modelo VLA de predicción de poses, el entrenamiento es probablemente supervisado por imitación, pero este extremo no está confirmado en la información disponible.

## Capacidades

- Predicción de poses de mano futuras: genera chunks de 16 pasos a 80 Hz con 21 keypoints MANO y movimiento de muñeca por mano.
- Comprensión de instrucciones en lenguaje natural combinadas con una imagen egocéntrica.
- Codificación visual mediante SmolVLM2-500M para escenas de interacción mano-objeto.
- Generación de acciones condicionada por flow matching (action expert).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes multi-paso ni razonamiento de múltiples etapas.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan modos especiales como thinking mode, visión multi-imagen, audio u otras modalidades.

## Casos de uso

- Teleoperación y retargeting de manos: el modelo predice poses futuras de mano a 80 Hz a partir de una imagen egocéntrica, lo que permite anticipar movimientos y mapearlos a un efector final robótico con varios dedos.
- Aprendizaje por imitación en robótica: los chunks de 16 pasos pueden usarse como etiquetas o como política auxiliar en pipelines de imitation learning sobre demostraciones mano-objeto.
- Análisis de destreza manual en vídeo egocéntrico: estimación de keypoints MANO y movimiento de muñeca para estudiar agarres y manipulación en datasets de primera persona.
- Preentrenamiento o inicialización de políticas VLA: al ser un baseline derivado de SmolVLA, puede servir como punto de partida para fine-tuning en dominios específicos de manipulación.
- Generación de datos sintéticos de pose: predicción de continuaciones plausibles de movimiento de mano para aumentar datasets de interacción.
- Investigación en modelos vision-lenguaje-acción: comparación de arquitecturas VLA con salidas de alta frecuencia temporal en lugar de acciones discretas de bajo nivel.
- Evaluación reproducible en revisión por pares: al ser un checkpoint anónimo con pesos y paso de entrenamiento documentados, permite replicar experimentos de la arquitectura SmolVLA en tareas mano-objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 1,8 GB, lo que sugiere que el checkpoint completo (backbone de 500M más action expert) puede cargarse en GPUs con 8-16 GB de VRAM en precisión completa, aunque este dato no está confirmado.
- GPU recomendadas: no disponibles; por tamaño del backbone (500M) cabría en GPUs consumer tipo RTX 3060/4060/4090, pero no hay validación publicada.
- Compatibilidad con GPU consumer: probable por el tamaño del backbone, sin confirmación oficial.
- Opciones de despliegue: al distribuirse como state_dict PyTorch (`.pt`), requiere cargarlo con el código de LeRobot/SmolVLA; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA-3dom | backbone 500M + action expert (total no disponible) | no disponible | chunks de 16 poses de mano a 80 Hz | apache-2.0 | Hugging Face (checkpoint anonimo) |
| SmolVLA oficial (LeRobot) | backbone 500M + action expert | no disponible | acciones de robot | apache-2.0 (segun LeRobot) | Hugging Face / LeRobot |
| SmolVLM2-500M | 500M | no disponible | texto / VLM | apache-2.0 (segun SmolVLM2) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint anónimo de revisión: no está validado para uso en producción y puede cambiar o desaparecer tras el proceso de revisión.
- Información incompleta: no se documentan benchmarks, idiomas, contexto, ni composición exacta del dataset de entrenamiento.
- Sesgos: al entrenarse sobre tres datasets públicos de mano-objeto, puede heredar sesgos de dominio (escenas, objetos, demografía de manos) presentes en esas fuentes; no cuantificados.
- Riesgo de alucinación: como modelo generativo condicionado por instrucción, puede producir poses plausibles pero incorrectas cuando la observación visual es ambigua o fuera de distribución.
- Limitaciones de contexto e idioma: no especificadas; la instrucción textual se procesa con SmolVLM2-500M, cuyo multilingüismo no está documentado en esta ficha.
- Licencia Apache 2.0: permite uso comercial con atribución, pero el estado de revisión anónima y la falta de validación desaconsejan su despliegue directo en producción.
- Formato de pesos: requiere el stack de LeRobot para cargar el state_dict; no hay conversiones GGUF/ONNX publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/anon-submission-0518/SmolVLA-3dom
- LeRobot (arquitectura SmolVLA): https://github.com/huggingface/lerobot
- SmolVLM2-500M: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Modelo MANO (keypoints de mano): https://mano.is.tue.mpg.de/
