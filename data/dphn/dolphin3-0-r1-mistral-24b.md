# dphn/Dolphin3.0-R1-Mistral-24B

## Resumen

Dolphin3.0-R1-Mistral-24B es un modelo de lenguaje de tipo instruct/razonamiento desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury y colaboradores) y publicado bajo el identificador `dphn/Dolphin3.0-R1-Mistral-24B`. Se trata de un fine-tune del modelo base `mistralai/Mistral-Small-24B-Base-2501`, con 23.572.423.680 parámetros reales (aproximadamente 24B) y pesos en formato safetensors. Forma parte de la colección Dolphin 3.0, orientada a ofrecer un modelo local de propósito general con control total por parte del propietario del sistema (system prompt, alineamiento y datos).

El modelo está entrenado específicamente para razonar: la versión R1 se ha entrenado durante 3 épocas sobre 800.000 trazas de razonamiento del dataset Dolphin-R1, lo que le permite generar cadenas de pensamiento internas delimitadas por etiquetas `<think></think>`. Además de razonamiento, cubre código, matemáticas, uso de herramientas (function calling) y conversación general, lo que lo sitúa como una alternativa local a modelos propietarios para integraciones empresariales.

Su relevancia actual radica en la licencia Apache 2.0, su tamaño contenido (24B) que permite despliegue en hardware de gama alta de consumo con cuantización, y su filosofía de modelo "steerable" sin restricciones de alineamiento impuestas por el proveedor. Los idiomas declarados oficialmente se limitan al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral-Small-24B-Base-2501) |
| Parametros totales | 23.572.423.680 (~24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF disponible (repositorio de bartowski); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo de terceros |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Mistral-Small-24B-Base-2501, con 23.572.423.680 parametros. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento ni sobre la composicion exacta del dataset en la informacion proporcionada, mas alla de la lista de datasets declarados en la model card.

El entrenamiento combina datos de instruccion y razonamiento de multiples fuentes: `cognitivecomputations/dolphin-r1`, `OpenCoder-LLM/opc-sft-stage1` y `opc-sft-stage2`, `microsoft/orca-agentinstruct-1M-v1`, `microsoft/orca-math-word-problems-200k`, `NousResearch/hermes-function-calling-v1`, `AI-MO/NuminaMath-CoT`, `AI-MO/NuminaMath-TIR`, `allenai/tulu-3-sft-mixture`, `cognitivecomputations/dolphin-coder`, `HuggingFaceTB/smoltalk`, `cognitivecomputations/samantha-data`, `m-a-p/CodeFeedback-Filtered-Instruction` y `m-a-p/Code-Feedback`. La version R1 se ha entrenado durante 3 epocas sobre 800.000 trazas de razonamiento del dataset Dolphin-R1. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO.

Como innovacion destacable, el modelo emplea un modo de razonamiento explicito mediante etiquetas `<think></think>`: la seccion de pensamiento es espacio de borrador interno no compartido con el usuario, y el modelo puede cerrar el bloque en cualquier momento. La plantilla de chat es ChatML (`<|im_start|>system ... <|im_end|>`). El autor recomienda temperaturas bajas (0,05-0,1), ya que temperaturas altas pueden provocar que el modelo se autocuestione y abandone respuestas correctas.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento explicito con cadenas de pensamiento internas delimitadas por `<think></think>`.
- Generacion y asistencia de codigo (entrenado con datasets de codigo como OpenCoder, dolphin-coder y CodeFeedback).
- Razonamiento matematico (NuminaMath-CoT, NuminaMath-TIR, orca-math-word-problems).
- Soporte de function calling / tool calling (hermes-function-calling-v1).
- Capacidades agenticas y de instruccion multi-paso (orca-agentinstruct-1M-v1).
- Control de comportamiento y alineamiento mediante system prompt definido por el usuario.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de codigo local: el modelo puede generar y explicar codigo en multiples lenguajes y respetar restricciones de lenguaje impuestas via system prompt (por ejemplo, forzar salida en Go), lo que lo hace util en entornos de desarrollo con requisitos estrictos de stack.
- Razonamiento matematico asistido: gracias a su entrenamiento con NuminaMath-CoT y TIR, puede resolver problemas paso a paso mostrando el desarrollo interno en `<think></think>` y devolviendo solo la respuesta final al usuario.
- Agentes con tool calling: su entrenamiento con hermes-function-calling-v1 permite integrarlo en pipelines donde el modelo decide que funcion invocar y con que argumentos, por ejemplo en automatizacion de tareas o consulta de APIs internas.
- Atencion al cliente autoalojada: al ser un modelo Apache 2.0 desplegable on-premise, permite gestionar conversaciones multi-turno sin enviar datos a terceros, con el tono y las reglas definidas por el propietario en el system prompt.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD o herramientas de revision automatica, con la ventaja de que el proveedor no cambia silenciosamente la version del modelo ni el system prompt.
- Investigacion sobre razonamiento y alineamiento: su modo `<think>` explicito y su naturaleza steerable lo hacen adecuado para experimentos sobre cadenas de pensamiento, control de comportamiento y evaluacion de sesgos en modelos abiertos.
- Despliegue en local para privacidad: con cuantizacion GGUF (repositorio de bartowski) y soporte en Ollama (aproximadamente 13 GB), puede ejecutarse en estaciones de trabajo sin conexion a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 47 GB solo para pesos, por lo que requiere GPUs de 48 GB o mas (A100 80GB, H100, L40S 48GB) o multi-GPU.
- Cuantizacion GGUF: el autor referencia el repositorio de bartowski con cuantizaciones; el ejemplo de Ollama indica un tamano de aproximadamente 13 GB, lo que sugiere una cuantizacion de 4 bits.
- GPU de consumo: con cuantizacion de 4 bits (aproximadamente 13 GB) cabe en GPUs consumer de 16 GB o mas (RTX 4080, RTX 4090, RTX 4060 Ti 16GB), asi como en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), Ollama (Modelfile oficial) y llama.cpp via GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dolphin3.0-R1-Mistral-24B | ~24B | no disponible | Apache 2.0 | Fine-tune de Mistral-Small-24B con razonamiento R1, steerable |
| Mistral-Small-24B-Base-2501 | ~24B | no disponible | Apache 2.0 | Modelo base sin instruccion ni razonamiento |
| Modelos de razonamiento abiertos de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion incorrecta, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Razonamiento circular: el autor advierte que con temperaturas altas el modelo puede autocuestionarse y abandonar respuestas correctas; recomienda temperaturas de 0,05 a 0,1.
- Alineamiento definido por el usuario: el modelo no impone directrices eticas propias; la responsabilidad sobre el contenido generado recae en el propietario del sistema, lo que exige definir un system prompt adecuado.
- Sin contexto declarado: no se especifica la longitud de contexto en la informacion disponible, por lo que debe verificarse antes de usarlo en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribucion correspondiente y revisarse las licencias de los datasets de entrenamiento si se redistribuye.
- Capacidades multimodales: no se declaran vision ni audio; no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/dphn/Dolphin3.0-R1-Mistral-24B
- Coleccion Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Base-2501
- Cuantizaciones GGUF (bartowski): https://huggingface.co/bartowski/cognitivecomputations_Dolphin3.0-R1-Mistral-24B-GGUF
- Discord de Cognitive Computations: https://discord.gg/tCMkMDDHwm
- Ensayo sobre modelos sin censura de Eric Hartford: https://erichartford.com/uncensored-models
- Patrocinadores: https://dria.co, https://chutes.ai, https://crusoe.ai/, https://a16z.com/
