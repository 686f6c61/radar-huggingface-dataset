# DQN-Labs/nexustest1-magicoder75k-oct29

## Resumen

nexustest1-magicoder75k-oct29 es un ajuste fino (finetune) publicado por DQN-Labs sobre el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, una variante cuantizada a 4 bits en formato bitsandbytes del Qwen3.8-27B. El modelo se distribuye a traves de Hugging Face con la libreria transformers y pesos en safetensors, y su pipeline declarado es `image-text-to-text`, lo que indica que conserva la torre de vision del modelo base multimodal de Qwen. El nombre del repositorio sugiere un entrenamiento orientado a generacion de codigo sobre un dataset de aproximadamente 75.000 muestras (magicoder75k), aunque la model card no documenta el dataset ni la receta de entrenamiento.

Con 27.781.427.952 parametros totales (unos 27,8 mil millones) y un tamano de repositorio de 55,6 GB, el modelo se situa en la gama alta de modelos abiertos de proposito general con capacidades multimodales. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el unico idioma declarado es el ingles. Es relevante ahora porque combina un modelo base reciente de la familia Qwen con un ajuste fino especializado en codigo, un patron habitual para crear asistentes de programacion autoalojados, aunque la ausencia de documentacion detallada y de benchmarks publicados limita seriamente su evaluacion previa.

La informacion disponible es escasa: la model card es practicamente un esqueleto generado por Unsloth, sin detalles sobre datos, hiperparametros ni evaluacion. Cualquier decision de adopcion deberia basarse en una evaluacion empirica propia, no en la documentacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base es una cuantizacion 4-bit bitsandbytes (`bnb-4bit`); los pesos publicados son safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Modelo base | unsloth/Qwen3.8-27B-unsloth-bnb-4bit |
| Descargas / likes | 54 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B, etiquetado en Hugging Face con el tag `qwen3_5`, que corresponde a un transformer multimodal capaz de procesar imagen y texto (pipeline `image-text-to-text`). No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador, ya que la model card no los documenta. El modelo base empleado es una version cuantizada a 4 bits con bitsandbytes generada por Unsloth, lo que implica que el ajuste fino se realizo sobre pesos ya comprimidos, un enfoque tipico de QLoRA.

El entrenamiento se realizo, segun la model card, con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un ajuste fino supervisado (SFT) o posiblemente DPO, aunque no se especifica el metodo. El nombre del repositorio apunta a un dataset de aproximadamente 75.000 muestras de codigo (posiblemente una variante de Magicoder), pero no se confirma la composicion, el numero de tokens vistos ni si hubo etapas de RLHF. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con el tag `conversational` declarado.
- Generacion y asistencia de codigo, inferida del nombre del repositorio (magicoder75k) y del ajuste fino, aunque no verificada en la model card.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), heredado del modelo base multimodal.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion autoalojado: el ajuste fino sobre un dataset de codigo de ~75.000 muestras sugiere un uso como copiloto de codigo en entornos con requisitos de privacidad, desplegado en infraestructura propia con vLLM o TGI.
- Generacion de codigo en pipelines de CI/CD: integrable mediante la API de transformers o TGI para tareas de autocompletado, generacion de tests o revision de parches, siempre que se valide su calidad empiricamente.
- Procesamiento de documentacion tecnica con imagenes: gracias al pipeline `image-text-to-text`, puede extraer informacion de capturas de pantalla, diagramas de arquitectura o documentacion escaneada y generar explicaciones en texto.
- Chat de soporte tecnico en ingles: el tag `conversational` y su naturaleza de instrucciones permiten construir asistentes multi-turno para soporte de producto en ingles.
- Prototipado rapido de aplicaciones multimodales: util para equipos que necesitan un modelo de ~28B con vision y licencia Apache 2.0 para experimentar sin restricciones comerciales.
- Investigacion en ajuste fino: sirve como punto de partida para experimentos de QLoRA con Unsloth, dado que el propio modelo se genero con ese flujo de trabajo.
- Generacion de codigo a partir de diagramas o capturas: combinando vision y generacion de codigo, puede convertir maquetas o esquemas en esqueletos de codigo, aunque sin garantias de calidad documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de ~55,6 GB, la inferencia en precision completa (bf16/fp16) requiere aproximadamente 56 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; en la practica, se necesitan 64-80 GB. En cuantizacion 4-bit (como el modelo base), se estima un uso de ~16-20 GB de VRAM, aunque no se distribuyen pesos GGUF oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o multiples GPUs para precision completa; una RTX 4090 (24 GB) o L40S (48 GB) podria alojar el modelo en cuantizacion 4-bit, sujeto a validacion.
- Cabe en GPU de consumo: potencialmente en RTX 4090 / RTX 3090 (24 GB) solo con cuantizacion 4-bit y contexto reducido; no cabe en GPUs de 8-16 GB.
- Opciones de despliegue: transformers (nativo), Text Generation Inference (TGI, tag declarado), vLLM (compatible con safetensors, aunque la cuantizacion bnb-4bit puede requerir configuracion adicional). llama.cpp y Ollama no tienen pesos GGUF publicados en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| DQN-Labs/nexustest1-magicoder75k-oct29 | ~27,8B | no disponible | Apache 2.0 | en | Finetune de codigo sobre Qwen3.8-27B, multimodal, sin benchmarks |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit (base) | ~27,8B | no disponible | Apache 2.0 | en | Modelo base cuantizado 4-bit del que deriva |
| Qwen2.5-Coder-32B | 32B | 128K | Apache 2.0 | multilingue | Modelo de codigo con benchmarks publicados; referencia habitual en la categoria |
| Codestral-22B | 22B | 32K | Licencia no comercial (MNPL) | multilingue | Especializado en codigo, pero con restricciones de uso comercial |

La comparativa con Qwen2.5-Coder-32B y Codestral-22B es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia documentada de su calidad en codigo, razonamiento o vision.
- Model card practicamente vacia: no se especifican dataset, hiperparametros, numero de tokens de entrenamiento ni metodo (SFT/DPO), lo que impide reproducir o auditar el ajuste.
- Solo ingles declarado: el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: inherente a los modelos de ~28B sin evaluacion publicada; especialmente relevante en generacion de codigo, donde puede producir APIs o funciones inexistentes.
- Entrenado sobre un modelo base cuantizado a 4 bits: la cuantizacion previa al ajuste puede degradar la calidad respecto a un finetune sobre pesos completos.
- Sesgos: no documentados por el autor; se heredan los del modelo base Qwen3.8, no evaluados en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las licencias de los datos de entrenamiento, no documentadas.
- Repositorio con muy poca traccion (54 descargas, 0 likes): senal de escasa validacion por parte de la comunidad.
- Longitud de contexto no documentada: critico para planificar aplicaciones con documentos largos o conversaciones extensas.

## Enlaces

- Hugging Face: https://huggingface.co/DQN-Labs/nexustest1-magicoder75k-oct29
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
