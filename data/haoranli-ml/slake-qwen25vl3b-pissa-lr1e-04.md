# haoranli-ml/slake-qwen25vl3b-pissa-lr1e-04

## Resumen

`haoranli-ml/slake-qwen25vl3b-pissa-lr1e-04` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario haoranli-ml, construido sobre el modelo base multimodal `Qwen/Qwen2.5-VL-3B-Instruct`. El nombre del repositorio sugiere un ajuste fino orientado al conjunto de datos SLAKE (un benchmark de preguntas y respuestas visuales en el dominio medico, con imagenes radiologicas y preguntas en ingles y chino), aunque la model card no documenta explicitamente el dataset ni el procedimiento. El sufijo `pissa-lr1e-04` apunta a PiSSA (Principal Singular values and Singular vectors Adaptation) como metodo de inicializacion del adaptador, con una tasa de aprendizaje de 1e-4.

Se trata, por tanto, de un adaptador de bajo rango y no de un modelo completo: el repositorio ocupa 0,2 GB y contiene unicamente los pesos del adaptador en formato safetensors junto con la configuracion de PEFT (version 0.21.2). Para utilizarlo es imprescindible cargar primero el modelo base Qwen2.5-VL-3B-Instruct y aplicar despues el adaptador mediante la libreria `peft` de Hugging Face.

Su relevancia es acotada y experimental: no tiene descargas ni likes, la model card es la plantilla por defecto sin rellenar y no se publican resultados de evaluacion. Resulta util como referencia para quienes investigan tecnicas de ajuste eficiente (LoRA frente a PiSSA) sobre modelos vision-lenguaje pequenos en dominios especializados como la radiologia, pero no debe considerarse un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre transformer multimodal Qwen2.5-VL (vision-lenguaje) |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; el modelo base Qwen2.5-VL-3B-Instruct tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no documentada aqui) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango entrenado con PEFT 0.21.2 sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El nombre del repositorio indica el uso de PiSSA, una variante de inicializacion de LoRA que descompone en valores singulares los pesos originales para inicializar las matrices del adaptador, lo que en la literatura suele acelerar la convergencia frente a LoRA estandar con el mismo presupuesto de rangos. La tasa de aprendizaje empleada parece ser 1e-4 segun el sufijo del identificador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango del adaptador, el valor de alpha, el dropout ni si se aplicaron tecnicas de alineacion adicionales (RLHF/DPO). Tampoco se documentan innovaciones tecnicas propias mas alla del uso de PiSSA. Todo lo relativo al entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto y respuesta a preguntas, heredadas del modelo base Qwen2.5-VL-3B-Instruct.
- Procesamiento de imagenes y razonamiento visual (vision-lenguaje), presumiblemente orientado a imagenes medicas por el nombre del repositorio, aunque no confirmado en la model card.
- Respuesta a preguntas visuales (VQA) en el dominio medico, segun la denominacion `slake`.
- Soporte de tool calling y function calling: no documentado en este adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion en ajuste eficiente: servir como punto de comparacion entre LoRA clasico y PiSSA sobre un mismo modelo base y dominio, midiendo convergencia y calidad final en tareas de VQA medica.
- Prototipado de asistentes de radiologia: aplicar el adaptador sobre Qwen2.5-VL-3B-Instruct para experimentar con preguntas y respuestas sobre imagenes radiologicas en un entorno de laboratorio, nunca en diagnostico clinico real.
- Reproduccion de experimentos academicos: utilizar el identificador y los hiperparametros inferibles del nombre (`pissa`, `lr1e-04`) para replicar el entrenamiento sobre SLAKE y contrastar resultados.
- Evaluacion de adaptadores de bajo rango en dominios especializados: medir la degradacion de capacidades generales del modelo base tras el ajuste, comparando respuestas antes y despues de aplicar el adaptador.
- Base para ajustes posteriores: emplear este adaptador como inicializacion en experimentos de continued fine-tuning sobre otros datasets medicos con recursos limitados, dado su reducido tamano (0,2 GB).
- Docencia y formacion: ilustrar en cursos de machine learning el flujo completo de carga de un adaptador PEFT con `transformers` y `peft` sobre un modelo vision-lenguaje pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,2 GB, pero requiere cargar el modelo base Qwen2.5-VL-3B-Instruct. En precision bf16/fp16 se estiman en torno a 6-7 GB para los pesos del modelo base mas el codificador visual y el overhead de activaciones; en cuantizacion de 8 bits, aproximadamente 3-4 GB; en 4 bits, en torno a 2-3 GB. Estas cifras son estimaciones a partir del tamano del modelo base y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con lotes grandes; RTX 4090 o RTX 3090 para uso individual en bf16.
- GPU de consumo: cabe en GPUs consumer con 8 GB o mas en cuantizacion de 4 u 8 bits (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070); en bf16 completo requiere al menos 8-12 GB, por lo que una RTX 4090 o 3090 es lo recomendable.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; vLLM y TGI para servicio en produccion (compatibilidad con adaptadores PEFT sujeta a la version y al soporte multimodal); llama.cpp/Ollama requeririan fusionar el adaptador con el modelo base y convertirlo a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-pissa-lr1e-04 | Adaptador sobre 3B | no disponible | Adaptador LoRA/PiSSA | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | Modelo completo vision-lenguaje | no disponible en esta ficha | Hugging Face (modelo base) |
| Adaptadores LoRA genericos sobre Qwen2.5-VL-3B | Adaptador sobre 3B | no disponible | LoRA estandar | variable | Hugging Face |

La comparacion con alternativas concretas no puede completarse con rigor porque no se dispone de datos de rendimiento ni de licencia del adaptador evaluado. La referencia natural es el modelo base sin ajustar, que conserva las capacidades generales del Qwen2.5-VL-3B-Instruct y sirve como linea base para medir el efecto del ajuste.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base Qwen2.5-VL-3B-Instruct y contactar con el autor.
- Riesgo de alucinacion elevado en dominio medico: cualquier salida sobre imagenes radiologicas debe tratarse como experimental y no como consejo clinico.
- El adaptador esta especializado en un unico dataset (presumiblemente SLAKE); es probable que degrade el rendimiento general del modelo base fuera de ese dominio, algo no cuantificado por el autor.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de que el adaptador funcione segun lo esperado.
- El repositorio solo contiene los pesos del adaptador; es imprescindible disponer del modelo base para cualquier uso.
- No se documentan sesgos conocidos, limitaciones de contexto ni restricciones de idioma mas alla de las heredadas del modelo base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-pissa-lr1e-04
- Perfil del autor: https://huggingface.co/haoranli-ml
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Referencia de PEFT: https://github.com/huggingface/peft
- Paper de LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
