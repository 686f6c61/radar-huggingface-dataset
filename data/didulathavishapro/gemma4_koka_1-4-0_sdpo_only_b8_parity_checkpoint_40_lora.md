# DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_40_lora

## Resumen

`gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_40_lora` es un adaptador LoRA de PEFT publicado por el usuario DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. Su proposito es la generacion de codigo en el lenguaje Koka, un lenguaje funcional con sistema de efectos algebraicos desarrollado por Microsoft Research. El adaptador se obtiene tras un proceso de ajuste fino en dos etapas: primero un SFT (supervised fine-tuning) sobre el modelo base y despues una fase de optimizacion de politica por auto-destilacion (SDPO, self-distillation policy optimisation) que parte del checkpoint `checkpoint-747` del adaptador SFT.

El resultado es un adaptador de rango 16 y alpha 32, guardado en la ronda 40 de 40 del entrenamiento SDPO, con semilla 3407. El repositorio ocupa 0,6 GB e incluye unicamente los pesos del adaptador en safetensors, la configuracion PEFT, los ficheros de tokenizer, la plantilla de chat y un `trainer_state.pt` para reanudar el entrenamiento. No se publican datos de benchmarks, idiomas soportados ni pipeline de inferencia.

La relevancia de esta ficha es limitada a un nicho muy concreto: desarrolladores que trabajen con Koka y quieran un modelo capaz de generar codigo en ese lenguaje. Al no haber descargas ni validacion publica, debe tratarse como un artefacto experimental de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B (modelo base `unsloth/gemma-4-E4B-it`) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 16 y alpha 32; el modelo base es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-E4B-it`, un modelo Gemma 4 de la variante E4B (eficiente, 4B) en su version instruction-tuned, segun la nomenclatura del autor. La arquitectura subyacente es la del transformer Gemma 4, aunque la model card no detalla capas, atencion ni contexto. El adaptador LoRA en si es de rango 16 con alpha 32, lo que implica una actualizacion de bajo rango sobre las matrices del modelo base.

El entrenamiento se estructura en dos fases. La primera es un SFT sobre el modelo base, cuyo resultado se publica en el repositorio `DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints` bajo el subdirectorio `checkpoint-747`; ese adaptador se fusiona en 16 bits con el modelo base para producir el punto de partida de la segunda fase. La segunda fase es SDPO (self-distillation policy optimisation), un esquema de optimizacion de politica con auto-destilacion, que se ejecuta durante 40 rondas con semilla 3407. El resultado final es este adaptador, guardado en la ronda 40 de 40. El repositorio incluye `trainer_state.pt` con el estado del optimizador, el schedule de learning rate, el profesor EMA y el estado del generador aleatorio, lo que permite reanudar el entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF adicional.

## Capacidades

- Generacion de codigo en el lenguaje Koka, orientada a la sintaxis y semantica de efectos algebraicos del lenguaje.
- Generacion de texto general heredada del modelo base Gemma 4 E4B instruction-tuned.
- Razonamiento y respuesta a instrucciones, segun las capacidades del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base, no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo Koka en entornos de investigacion: el adaptador permite producir fragmentos de codigo en Koka con manejo de efectos algebraicos, un lenguaje con poca representacion en corpus de entrenamiento generales, por lo que un ajuste especifico aporta valor frente al modelo base sin adaptar.
- Asistencia a desarrolladores que migran codigo a Koka: el modelo puede proponer traducciones de patrones funcionales (map/fold, handlers de efectos) a la sintaxis de Koka, apoyandose en el SFT previo sobre el lenguaje.
- Prototipado de ejemplos docentes: util para generar ejercicios y ejemplos de codigo Koka en cursos de programacion funcional con efectos, dado que el adaptador esta especializado en ese dominio.
- Experimentacion con SDPO: el repositorio incluye `trainer_state.pt`, lo que permite reproducir o continuar el entrenamiento y estudiar el efecto de la auto-destilacion en la generacion de codigo.
- Base para nuevos adaptadores: al ser un adaptador PEFT de rango 16, puede fusionarse o combinarse con otros adaptadores sobre el mismo modelo base para tareas de codigo en lenguajes funcionales.
- Evaluacion comparativa de tecnicas de alineacion: sirve como artefacto de referencia para comparar SFT frente a SDPO en tareas de generacion de codigo de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; depende del modelo base `unsloth/gemma-4-E4B-it` (variante E4B) y de la cuantizacion elegida. El adaptador en si ocupa 0,6 GB en safetensors.
- GPU recomendadas: no disponible. Al tratarse de un modelo base de 4B, es plausible que quepa en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantizacion.
- Opciones de despliegue: el adaptador es compatible con PEFT; para servirlo es necesario fusionarlo con el modelo base o cargarlo como adaptador en frameworks que soporten PEFT (por ejemplo, transformers + PEFT). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_40_lora` | Adaptador LoRA sobre Gemma 4 E4B | no disponible | LoRA PEFT especializado en Koka | gemma | Hugging Face (0 descargas) |
| `DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints` (checkpoint-747) | Adaptador LoRA sobre Gemma 4 E4B | no disponible | LoRA PEFT SFT en Koka | gemma | Hugging Face |
| `unsloth/gemma-4-E4B-it` | Modelo base Gemma 4 E4B | no disponible | Transformer instruction-tuned | gemma | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de validacion publica: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes.
- Sesgos conocidos: no documentados; al derivar de Gemma 4, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinacion: no cuantificado; en generacion de codigo de un lenguaje poco representado como Koka, el riesgo de sintaxis o semantica incorrecta es elevado y no ha sido medido.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica longitud de contexto ni idiomas soportados.
- Restricciones de licencia: la licencia es `gemma`, sujeta a los terminos de uso de Gemma; es necesario revisar las condiciones de uso comercial del modelo base antes de desplegarlo en produccion.
- Dependencia de fusion: el adaptador requiere fusionar previamente el adaptador SFT `checkpoint-747` en el modelo base; `adapter_config.json` apunta a una ruta local de esa fusion, lo que puede complicar la reproducibilidad fuera del entorno del autor.
- Estado experimental: el artefacto incluye `trainer_state.pt` y esta pensado para reanudar entrenamiento, no como un modelo final validado.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_40_lora
- Adaptador SFT de partida: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Repositorio del lenguaje Koka: no disponible en la informacion proporcionada
