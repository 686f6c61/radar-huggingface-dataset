# austinpatel/bp_pi05_libero_gen_goal_chain_no_secondstep_lora

## Resumen

Este repositorio contiene un checkpoint de ajuste fino mediante LoRA del modelo de robotica pi0.5 (pi05_base) de Physical Intelligence, especializado en tareas de manipulacion del benchmark LIBERO. Lo publica el usuario austinpatel como material de ablacion del paper "What Enables In-Context Behavior Prompting for Manipulation?", y su proposito concreto es servir como referencia experimental: es la variante entrenada sin demostraciones de segundo paso (no second step), lo que permite aislar el efecto de esa componente en el paradigma de behavior prompting.

El modelo no es un LLM de proposito general ni un asistente conversacional: es una politica visuomotora (vision-language-action) que recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones de control para un brazo robotico. Se distribuye como checkpoint nativo de openpi en formato Orbax, no como safetensors ni GGUF, y requiere el fork de openpi del autor para servirse y evaluarse.

Su relevancia es acotada y experimental: 0 descargas y 0 likes en el momento de la consulta, tamano de repositorio de 9.6 GB (incluye `train_state/` para reanudar entrenamiento) y un unico paso de entrenamiento (step 100000). Es util para reproducir la ablacion del paper, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5, construida sobre PaliGemma; ajuste fino con LoRA |
| Parametros totales | no disponible (el repositorio contiene solo los adaptadores LoRA y el estado de entrenamiento, no los pesos completos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precision de entrenamiento; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones son en lenguaje natural, probablemente ingles por el dataset LIBERO, sin confirmacion en la model card) |
| Licencia | Apache-2.0, sujeta adicionalmente a los Gemma Terms of Use por derivar de PaliGemma |
| Formato de pesos | Orbax (checkpoint openpi: `params/`, `train_state/`, `assets/`, `_CHECKPOINT_METADATA`) |

## Arquitectura y entrenamiento

El modelo parte de pi05_base, la politica pi0.5 de Physical Intelligence, que combina un backbone vision-language basado en PaliGemma con un cabezal de acciones para control robotico. Sobre esa base se aplica un ajuste fino LoRA (no un entrenamiento completo), lo que reduce el coste de adaptacion y explica que el repositorio ocupe 9.6 GB en lugar del tamano completo del modelo. El checkpoint corresponde al paso 100000 de la configuracion `pi05_libero_gen_goal_chain_no_secondstep_lora` del fork de openpi del autor, con nombre de experimento `pi05_libero_gen_goal_chain_no_secondstep_lora_seed0_v2_no_horizontal_flip`.

El entrenamiento usa el dataset `austinpatel/libero_gen_goal_chain_no_secondstep_train_openpi`, una variante de LIBERO-Gen Goal Chain construida especificamente para esta ablacion: se eliminan las demostraciones de segundo paso, de modo que el modelo aprende la cadena de objetivos sin ese apoyo. El nombre del experimento indica ademas que no se aplico volteo horizontal como aumento de datos. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; al tratarse de una politica de imitacion supervisada, lo esperable es entrenamiento por behavior cloning, pero no esta confirmado en la model card.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales e instrucciones en lenguaje natural (pipeline `robotics`).
- Ejecucion de tareas del benchmark LIBERO, en particular las variantes de goal chain con objetivos encadenados.
- Behavior prompting in-context: el modelo esta disenado para el paradigma estudiado en el paper, en el que el prompt de comportamiento condiciona la politica.
- Ajuste LoRA sobre pi0.5, lo que permite reutilizar la base y reentrenar solo los adaptadores.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo thinking; es una politica de control, no un modelo conversacional.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de la ablacion del paper: cargar el checkpoint en el fork de openpi (`liberogen`) y evaluarlo con `docs/libero_openpi.md` para comparar el rendimiento con y sin demostraciones de segundo paso en LIBERO-Gen Goal Chain.
- Investigacion en behavior prompting: usar este checkpoint como linea base controlada para medir cuanto aporta el segundo paso en el condicionamiento in-context de politicas de manipulacion.
- Estudio de eficiencia de LoRA en VLA: al ser un ajuste LoRA sobre pi0.5, sirve para analizar el coste/beneficio de adaptar una politica grande con adaptadores de bajo rango frente a un fine-tuning completo.
- Reanudacion de entrenamiento: el repositorio incluye `train_state/`, por lo que se puede continuar el entrenamiento desde el paso 100000 con la misma configuracion y semilla.
- Base para nuevas ablaciones: partir de estos pesos para entrenar variantes con volteo horizontal, con segundo paso o con otros datasets derivados de LIBERO, manteniendo la comparabilidad.
- Validacion de pipelines de evaluacion robotica: probar la infraestructura de serving de openpi (descarga via `hf download`, servicio del checkpoint y evaluacion en simulacion) antes de escalar a experimentos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 9.6 GB incluye `train_state/`, que puede excluirse con `--exclude "train_state/*"` para inferencia, reduciendo el espacio en disco, pero no se publica el consumo de VRAM.
- GPU recomendadas: no disponible. Al derivar de pi0.5/PaliGemma, es esperable que requiera GPU de datacenter (A100/H100) para inferencia comoda, pero no hay dato confirmado en la model card.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: openpi (fork `liberogen` del autor) para serving y evaluacion; descarga con `hf download`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un checkpoint Orbax de politica robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_libero_gen_goal_chain_no_secondstep_lora (este) | no disponible (LoRA sobre pi0.5) | no disponible | sin benchmarks publicados | Apache-2.0 + Gemma Terms | Hugging Face, 0 descargas |
| physical-intelligence/pi05_base | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| Otras variantes LIBERO-Gen Goal Chain del mismo autor | no disponible | no disponible | no disponible | Apache-2.0 (previsible) | no disponible en la informacion |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (otras politicas VLA como OpenVLA u Octo) sin inventar cifras; la comparacion queda limitada al modelo base y a las variantes del propio autor.

## Limitaciones y advertencias

- Es un checkpoint de ablacion, no un modelo final: esta entrenado deliberadamente sin demostraciones de segundo paso, por lo que su rendimiento sera inferior al de la variante completa en tareas que requieran esa componente.
- Solo contiene adaptadores LoRA y estado de entrenamiento; no es autonomo, requiere pi05_base y el fork de openpi del autor para funcionar.
- Formato Orbax especifico de openpi: no es compatible con stacks de inferencia genericos (vLLM, llama.cpp, Ollama, TGI).
- Uso comercial: la licencia Apache-2.0 se ve condicionada por los Gemma Terms of Use heredados de PaliGemma; conviene revisar `LICENSE_GEMMA.txt` antes de cualquier despliegue productivo.
- Sin benchmarks publicados ni descargas: no hay evidencia externa de rendimiento ni validacion por terceros.
- Riesgo de alucinacion y sesgos: no documentados; en politicas de imitacion el riesgo principal es el fallo silencioso ante distribuciones de observacion no vistas, no la generacion de texto incorrecto.
- Limitaciones de idioma: el dataset es LIBERO (instrucciones en ingles), por lo que el soporte de instrucciones en castellano no esta verificado.
- Repositorio de 9.6 GB con `train_state/` incluido; para inferencia conviene excluirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/austinpatel/bp_pi05_libero_gen_goal_chain_no_secondstep_lora
- Paper: https://huggingface.co/papers/2606.30457
- Codigo del proyecto (Behavior Prompting): https://github.com/real-stanford/behavior_prompting
- Documentacion de evaluacion LIBERO en openpi: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
- Fork de openpi del autor: https://github.com/austinapatel/openpi
- openpi original (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_gen_goal_chain_no_secondstep_train_openpi
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
