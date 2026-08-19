# iNLP-Lab/Myna-Hokkien

## Resumen

Myna-Hokkien es un modelo conversacional de voz de extremo a extremo, de codigo abierto, desarrollado por el iNLP Lab de la SUTD (Singapore University of Technology and Design) para el hokkien de Singapur. Es el primer modelo de tipo omni (audio a audio) que soporta nativamente el hokkien, una lengua hablada por decenas de millones de personas en Asia y practicamente ausente de los sistemas de IA de voz comerciales. El modelo permite mantener conversaciones habladas completas en hokkien sin necesidad de una tuberia en cascada ASR-LLM-TTS, aunque tambien acepta entrada y salida de texto.

Con 35,26 mil millones de parametros, la arquitectura se basa en Qwen3-Omni con estructura de mezcla de expertos (MoE), segun las etiquetas del repositorio. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion libre, y se publica en formato safetensors con un peso total de 70,7 GB. Su relevancia radica en ofrecer una receta reutilizable para que otras comunidades linguisticas de bajos recursos puedan replicar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Omni (mezcla de expertos, MoE) |
| Parametros totales | 35.259.818.545 (~35,26 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | hokkien / minnan (nan), acento de Singapur en esta version |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Myna-Hokkien se construye sobre la arquitectura Qwen3-Omni, un modelo multimodal de audio a audio que integra codificacion de voz, razonamiento y sintesis de habla en un unico paso, sin depender de una cadena ASR-LLM-TTS. La etiqueta `qwen3_omni_moe` indica que emplea una arquitectura de mezcla de expertos, aunque el numero de parametros activos por inferencia no se ha publicado. El modelo acepta audio como entrada y genera audio como salida, con soporte adicional para consultas de texto que se interpretan como instrucciones para el asistente, no como transcripciones para TTS.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La version publicada se centra en el acento de Singapur, aunque el hokkien se habla en diversas variantes en toda Asia.

## Capacidades

- Conversacion de voz a voz de extremo a extremo en hokkien: el usuario habla y el modelo responde con habla natural en hokkien, sin texto intermedio.
- Soporte de entrada y salida de texto: las consultas de texto se tratan como preguntas o instrucciones para el asistente.
- Sintesis de voz en hokkien con acento singapurense.
- Comprension auditiva de hokkien hablado en contexto conversacional.
- Integracion sencilla via la libreria `mynahokkien` con `from_pretrained` y un metodo `generate` unificado.
- Comparacion demostrativa en la model card frente a GPT Audio, Qwen3.5-Omni-Plus, Gemini Live y GLM-4-Voice, donde Myna-Hokkien es el unico que soporta hokkien nativamente.

## Casos de uso

- Asistente de voz para comunidades hokkien en Singapur y Malasia: permite a hablantes nativos, especialmente personas mayores, interactuar con tecnologia mediante voz en su lengua materna sin necesidad de alfabetizacion digital.
- Preservacion y revitalizacion linguistica: sirve como herramienta de practica conversacional para aprendices de hokkien y como archivo vivo de la lengua hablada.
- Atencion al cliente en hokkien: integrable en sistemas de soporte telefonico o quioscos interactivos para comercios y servicios publicos que atienden a poblacion hokkien-hablante.
- Educacion y aprendizaje de idiomas: los estudiantes pueden mantener conversaciones de practica con el modelo, que responde en hokkien natural y permite practicar comprension y expresion oral.
- Accesibilidad para hablantes monolingues de hokkien: proporciona acceso a informacion y servicios digitales mediante voz a personas que no dominan el mandarin ni el ingles.
- Investigacion en IA de bajos recursos: el repositorio incluye la receta completa, lo que permite a otros grupos linguisticos replicar el proceso para sus propias lenguas.
- Mediacion linguistica en entornos multilingues: aunque el modelo no es un traductor, puede facilitar la interaccion entre hablantes de hokkien y sistemas digitales que operan en otros idiomas mediante texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye muestras de audio comparativas frente a GPT Audio, Qwen3.5-Omni-Plus, Gemini Live y GLM-4-Voice, pero sin metricas cuantitativas. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 70 GB (35,26 mil millones de parametros × 2 bytes por parametro), lo que requiere una GPU de clase A100 80GB, H100 o similar.
- En cuantizacion INT8 (si se publica soporte): aproximadamente 35 GB de VRAM, compatible con RTX 4090 o A6000.
- En cuantizacion INT4 (si se publica soporte): aproximadamente 18 GB de VRAM, compatible con GPUs consumer de gama alta.
- El repositorio pesa 70,7 GB, por lo que se necesita espacio en disco de al menos esa cantidad, mas margen para descarga e instalacion.
- La libreria `mynahokkien` se instala directamente desde el repositorio de Hugging Face mediante `pip install "$MODEL_DIR"`, y el ejemplo de uso emplea `device_map="cuda:0"` con `dtype=torch.float16`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; la inferencia se realiza a traves de la libreria propia.

## Comparativa con modelos similares

La model card compara Myna-Hokkien con cuatro modelos comerciales cerrados en la tarea especifica de conversacion en hokkien:

| Modelo | Tipo | Soporte hokkien nativo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Myna-Hokkien | Audio a audio, 35,26B, Qwen3-Omni MoE | Si | Apache 2.0 | Abierto, pesos publicos |
| GPT Audio | Cerrado, propietario | No | Propietaria | API comercial |
| Qwen3.5-Omni-Plus | Cerrado, propietario | No | Propietaria | API comercial |
| Gemini Live | Cerrado, propietario | No | Propietaria | API comercial |
| GLM-4-Voice | Cerrado, propietario | No | Propietaria | API comercial |

No se han encontrado modelos abiertos comparables que soporten hokkien de forma nativa; Myna-Hokkien es el unico de su categoria en el momento de la publicacion.

## Limitaciones y advertencias

- La version publicada se centra exclusivamente en el acento de Singapur; otras variantes del hokkien (Taiwan, Fujian, Malasia, etc.) pueden no funcionar correctamente.
- No se han publicado benchmarks cuantitativos, por lo que el rendimiento real en tareas estandarizadas es desconocido.
- Como modelo de bajos recursos, puede presentar alucinaciones o errores de comprension en entradas poco representadas en los datos de entrenamiento.
- No se documenta la longitud de contexto soportada, lo que limita la planificacion de conversaciones largas en produccion.
- El modelo requiere aproximadamente 70 GB de VRAM en FP16, lo que excluye su uso en GPUs consumer sin cuantizacion adicional, cuyo soporte no esta documentado.
- No hay informacion sobre sesgos potenciales del modelo ni sobre la procedencia y curaduria de los datos de entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, no se ofrecen garantias de soporte ni SLAs para despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/iNLP-Lab/Myna-Hokkien
- Repositorio GitHub: https://github.com/iNLP-Lab/Myna-Hokkien
- Pagina del grupo iNLP Lab en SUTD: https://isakzhang.github.io/group.html
- Anuncio en LinkedIn: https://www.linkedin.com/posts/wenxuan-zhang-608b88153_speechai-hokkien-opensource-activity-7492875738438868992-Yxrv
