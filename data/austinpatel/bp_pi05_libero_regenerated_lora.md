# austinpatel/bp_pi05_libero_regenerated_lora

## Resumen

`pi05_libero_regenerated_lora` es un checkpoint de ajuste fino mediante LoRA del modelo de robotica `pi05_base` de Physical Intelligence, publicado por el usuario austinpatel y asociado al articulo "What Enables In-Context Behavior Prompting for Manipulation?". El modelo parte de la arquitectura pi0.5, un modelo vision-language-action (VLA) construido sobre PaliGemma, y esta especializado en las cuatro suites originales del benchmark LIBERO de manipulacion robotica.

El repositorio contiene un checkpoint nativo de openpi en formato Orbax (no safetensors ni GGUF), correspondiente al paso 29999 de entrenamiento con la configuracion `pi05_libero_lora_my_regeneration`. Se entreno sobre el dataset `austinpatel/libero_regenerated_openpi`, una conversion propia a LeRobot de 256x256 del dataset LIBERO original, distinta del dataset LIBERO que proporciona openpi.

Su relevancia es acotada pero especifica: sirve como referencia reproducible para investigacion en behavior prompting y evaluacion en LIBERO, y demuestra el flujo de ajuste fino con LoRA sobre pi0.5 dentro del ecosistema openpi. El repositorio ocupa 9,6 GB, no tiene descargas ni likes, y la licencia es Apache-2.0 con la restriccion adicional de los terminos de uso de Gemma por su base PaliGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 sobre PaliGemma, ajuste fino LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de manipulacion, no a dialogo general) |
| Licencia | Apache-2.0, sujeta ademas a los Gemma Terms of Use |
| Formato de pesos | Orbax (checkpoint openpi: `params/`, `train_state/`, `assets/`, `_CHECKPOINT_METADATA`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del checkpoint `pi05_base` de Physical Intelligence, que a su vez es un modelo pi0.5 basado en PaliGemma. La arquitectura combina un backbone vision-language con una cabeza de accion para control robotico, dentro del framework openpi. El checkpoint publicado corresponde al paso 29999 de la configuracion `pi05_libero_lora_my_regeneration` (experimento `pi05_libero_my_regeneration_lora_seed0_v1`).

El entrenamiento se realizo sobre `austinpatel/libero_regenerated_openpi`, una regeneracion propia del dataset LIBERO en formato LeRobot a resolucion 256x256, en lugar del dataset LIBERO estandar de openpi. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal asociada es el paradigma de behavior prompting descrito en el paper vinculado, que estudia que condiciones permiten al modelo seguir demostraciones o comportamientos en contexto.

## Capacidades

- Control robotico de manipulacion: genera acciones motoras a partir de observaciones visuales e instrucciones de tarea.
- Ejecucion de tareas del benchmark LIBERO (las cuatro suites originales) mediante comportamiento condicionado por prompt.
- Behavior prompting en contexto: el modelo esta disenado para aprovechar demostraciones o ejemplos de comportamiento proporcionados en el contexto, segun el paper asociado.
- Procesamiento de entrada visual a 256x256, coherente con el dataset de entrenamiento.
- Integracion con el ecosistema openpi para servir y evaluar el checkpoint.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, dialogo multilingue ni modos de razonamiento explicito.

## Casos de uso

- Evaluacion reproducible en LIBERO: servir el checkpoint con openpi y ejecutar las cuatro suites originales para comparar resultados con otras variantes de pi0.5 o configuraciones de ajuste fino.
- Investigacion en behavior prompting: usar el modelo como punto de partida para experimentos que midan como influyen las demostraciones en contexto sobre el exito de la tarea, tal como plantea el paper asociado.
- Baseline para ajuste fino con LoRA: el checkpoint y su configuracion (`pi05_libero_lora_my_regeneration`) sirven de referencia para reproducir el pipeline de entrenamiento LoRA sobre pi0.5 en openpi.
- Reentrenamiento o continuacion del ajuste: el directorio `train_state/` permite reanudar el entrenamiento desde el paso 29999, util para ablaciones con semillas o datasets distintos.
- Validacion de conversiones de dataset: al haberse entrenado sobre una conversion propia a LeRobot de LIBERO a 256x256, sirve para verificar la equivalencia entre el dataset regenerado y el original de openpi.
- Prototipado de politicas de manipulacion en simulacion: integrable en pipelines de evaluacion robotica simulada antes de trasladar politicas a entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 9,6 GB, pero no se especifica el consumo en inferencia ni el reparto entre pesos base y adaptadores LoRA.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base pi0.5 y del backend openpi, cuyos requisitos no se detallan.
- Opciones de despliegue: servidor de openpi (rama `liberogen` del fork del autor); el checkpoint se descarga con `hf download` en la ruta `checkpoints/pi05_libero_lora_my_regeneration/pi05_libero_my_regeneration_lora_seed0_v1/29999`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_libero_regenerated_lora` | no disponible | no disponible | no disponible | Apache-2.0 + Gemma Terms | HuggingFace, 0 descargas |
| `physical-intelligence/pi05_base` | no disponible | no disponible | no disponible | no disponible en esta ficha | HuggingFace (modelo base) |
| Checkpoints LIBERO de openpi | no disponible | no disponible | no disponible | Apache-2.0 | Repositorio openpi |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a las cuatro suites originales de LIBERO; no se garantiza su transferencia a otras tareas o entornos.
- Dependencia del dataset regenerado: se entreno sobre una conversion propia a LeRobot de LIBERO, no sobre el dataset estandar de openpi, lo que puede introducir diferencias respecto a otros checkpoints LIBERO.
- Formato no estandar: al ser un checkpoint Orbax de openpi, no es directamente cargable con vLLM, llama.cpp, Ollama o TGI; requiere el stack openpi y la rama `liberogen` del fork del autor.
- Licencia compuesta: aunque los pesos LoRA son Apache-2.0, el uso esta sujeto a los Gemma Terms of Use por su base PaliGemma; conviene revisar `LICENSE_GEMMA.txt` antes de un uso comercial.
- Sin validacion externa: el repositorio no registra descargas ni likes, y no se han publicado resultados de benchmarks en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentado; al tratarse de un modelo de accion, el fallo se manifiesta como ejecucion incorrecta de la tarea mas que como texto inventado.
- Idiomas: no se especifican los idiomas de las instrucciones soportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austinpatel/bp_pi05_libero_regenerated_lora
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_regenerated_openpi
- Paper: https://huggingface.co/papers/2606.30457
- Codigo: https://github.com/real-stanford/behavior_prompting
- Documentacion de evaluacion LIBERO: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
- Fork de openpi del autor: https://github.com/austinapatel/openpi
- openpi original: https://github.com/Physical-Intelligence/openpi
