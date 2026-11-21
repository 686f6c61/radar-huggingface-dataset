# rao-studios/Inkling-2-Mini

## Resumen

Inkling-2-Mini es un modelo de lenguaje de tipo texto generativo desarrollado por Thinking Machines Lab, distribuido bajo licencia Apache 2.0. La versión aquí descrita es un espejo (mirror) publicado por Rao Studios del checkpoint original `thinkingmachines/Inkling-2-Mini` en el commit `ed40e7da625f594fc9c4990f5f66be24873c22d7`, sin recuantización ni modificación de pesos, tokenizador, plantilla de chat o configuración. El espejo existe para que la aplicación Craft (una app de programación para macOS que ejecuta el modelo en local) descargue siempre los mismos bytes desde un repositorio controlado por Rao Studios, fijado a un commit concreto.

El modelo emplea una arquitectura propietaria denominada `inkling2_loop` con 24 capas y 26.388.646.440 parámetros totales (aproximadamente 26,4 mil millones). Se distribuye con cuantización NVFP4 generada con NVIDIA ModelOpt (expertos en NVFP4 y MXFP8, resto en BF16), lo que reduce el peso en disco a 19,5 GB de safetensors distribuidos en 1.244 tensores. Su ventana de contexto alcanza 1.048.576 tokens (1M), una cifra notable para un modelo de este tamaño.

La relevancia actual del modelo radica en su combinación de contexto extremadamente largo, soporte nativo de tool calling estructurado mediante el formato de "frames" de Inkling y un tamaño que permite ejecución local en equipos Apple Silicon de gama alta (48 GB de memoria unificada o más según las recomendaciones de Craft). Está orientado a tareas de generación de código y construcción de aplicaciones, aunque su pipeline declarado es text-generation genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop`, 24 capas |
| Parametros totales | 26.388.646.440 (aprox. 26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (expertos), MXFP8 (expertos), BF16 (resto); publicados con NVIDIA ModelOpt |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1.244 tensores, 19,5 GB) |
| Libreria de inferencia | MLX (Frigate, mlx-lm) |
| Tamano del repositorio | 19,6 GB |
| Modelo base | thinkingmachines/Inkling-2-Mini (commit `ed40e7da625f594fc9c4990f5f66be24873c22d7`) |

## Arquitectura y entrenamiento

La arquitectura declarada en `config.json` es `inkling2_loop` con 24 capas. No se dispone de información pública en la documentación proporcionada sobre la naturaleza exacta de esta arquitectura (si es un transformer denso, un modelo con capas recurrentes o un esquema híbrido con "looping" de capas, como sugiere el nombre). El checkpoint publicado emplea cuantización mixta: los expertos están en NVFP4 y MXFP8, mientras que el resto de tensores permanece en BF16. Esta combinación la genera NVIDIA ModelOpt y MLX la lee directamente sin conversión.

El repositorio original incluye un componente denominado `mtp.safetensors` (cabeza de predicción multi-token, destinada a decodificación especulativa) y un `processor_config.json` de un procesador multimodal, que el espejo de Rao Studios ha eliminado deliberadamente porque el motor de Craft decodifica un token a la vez y solo procesa texto. También se ha descartado `hf_quant_config.json` y el tokenizador en formato tiktoken, conservando `tokenizer.json`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica más destacable documentada es el formato de tool calling mediante "frames": la plantilla de chat declara el esquema JSON de cada herramienta en un frame de sistema y el modelo responde con un frame por llamada que contiene el nombre de la herramienta y un objeto JSON con sus argumentos, por ejemplo `<|message_model|>edit_file<|content_invoke_tool_json|>{"name":"edit_file","args":{...}}<|end_message|>`.

## Capacidades

- Generación de texto conversacional y de código, con pipeline declarado `text-generation` y etiquetas `code` y `craft`.
- Tool calling / function calling estructurado mediante el formato de frames de Inkling, con esquemas JSON declarados en el frame de sistema y respuestas parseables por llamada.
- Planificación multi-paso y orquestación de agentes: la documentación de Craft describe que el modelo planifica y luego invoca en orden quince agentes de su tienda para construir una app completa desde una carpeta vacía.
- Edición de ficheros y manipulación de código en disco mediante herramientas como `edit_file`, con parámetros `path`, `old_string` y `new_string`.
- Contexto extremadamente largo (1M tokens), adecuado para indexar y razonar sobre proyectos de código completos.
- Capacidades multimodales: el repositorio original incluye un procesador multimodal (`processor_config.json`), aunque el espejo lo elimina y declara uso solo de texto.
- Decodificación especulativa: el checkpoint original incluye la cabeza `mtp.safetensors`, descartada en este espejo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Construcción de aplicaciones iOS desde cero: el modelo planifica y encadena llamadas a agentes especializados (proyecto, diseño, cliente tipado, mundo simulado, kit de cada pantalla, navegación, tests y capturas) y después compila, prueba y captura pantallas. La documentación de Craft reporta que, en dos ejecuciones medidas, la app compiló, sus tests pasaron y las 62 pantallas coincidieron con la app original en modo claro y oscuro.
- Asistente de programación local en macOS: integrado en Craft sobre Apple Silicon, el modelo y el índice del proyecto permanecen en la máquina, sin envío de código a servicios externos, lo que resulta adecuado para equipos con requisitos de confidencialidad.
- Edición de código asistida con tool calling: el modelo puede emitir llamadas estructuradas a herramientas de edición de ficheros (`edit_file` con `path`, `old_string`, `new_string`), lo que permite integrarlo en pipelines de refactorización automatizada con validación posterior.
- Análisis de repositorios completos: con 1.048.576 tokens de contexto, puede ingerir proyectos enteros o grandes porciones de ellos para responder preguntas de arquitectura, dependencias o coherencia entre módulos.
- Orquestación de agentes en flujos multi-paso: su formato de frames permite encadenar llamadas a herramientas con argumentos JSON verificables, útil en sistemas de agentes que necesitan trazas estructuradas.
- Generación de tests y verificación: la documentación de Craft menciona que el modelo ejecuta tests como parte del flujo de construcción de apps, por lo que encaja en tareas de generación y ejecución de suites de prueba.
- Prototipado rápido de interfaces: dado su uso documentado en la generación de pantallas y kits de UI, puede emplearse para producir borradores de interfaces y su código asociado en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una comparación cualitativa: en dos ejecuciones medidas, la calidad alcanzada en la construcción de una app igualó la de Claude Opus en la misma tarea, aunque esas ejecuciones se realizaron con Qwopus 3.5 122B en un M4 Max con 128 GB (2026-11-16), no con este modelo.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 19,5 GB en safetensors con la cuantización NVFP4/MXFP8/BF16 publicada; se requiere memoria adicional para el contexto (hasta 1M tokens) y el estado de inferencia.
- Memoria del sistema: Craft ofrece el modelo en Macs con 48 GB de memoria unificada o más y lo recomienda a partir de 48 GB.
- GPU recomendadas: no disponible para GPU discretas; el ecosistema documentado es Apple Silicon (MLX). La comparación de calidad de la model card se midió en un M4 Max con 128 GB.
- Compatibilidad con GPU de consumo: no disponible; la información proporcionada no documenta ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: MLX mediante Frigate (motor de Craft) y mlx-lm a partir de la versión que añade el tipo de modelo `inkling2_loop`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (este espejo) | 26,4 B | 1.048.576 | Apache 2.0 | Hugging Face, MLX | Cuantización NVFP4/MXFP8/BF16; tool calling por frames |
| Qwopus 3.5 122B | 122 B (no confirmado) | no disponible | no disponible | no disponible | Usado en la medición de Craft en M4 Max 128 GB; calidad comparable en la tarea de construcción de app |
| Claude Opus | no disponible | no disponible | propietaria | API | Referencia de calidad en la misma tarea según la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la documentación proporcionada no incluye evaluación de sesgos.
- Riesgo de alucinación: no cuantificado; como modelo generativo sin benchmarks publicados, no hay evidencia en la información disponible sobre su tasa de alucinación.
- Idiomas: no se declaran idiomas soportados en la información disponible.
- Contexto: aunque la ventana es de 1.048.576 tokens, no se documenta el rendimiento real en contextos largos ni la degradación esperada.
- Licencia: Apache 2.0 permite uso comercial, pero el espejo añade únicamente el texto de la licencia; el repositorio original no incluye fichero LICENSE propio.
- Naturaleza del espejo: este repositorio no es el oficial; los pesos son idénticos al commit indicado, pero las actualizaciones del modelo original no se reflejarán aquí automáticamente.
- Componentes eliminados: se han descartado `mtp.safetensors` (decodificación especulativa), `processor_config.json` (multimodal), `tiktoken/tokenizer.model` y `hf_quant_config.json`, por lo que este espejo no sirve para flujos multimodales ni de decodificación especulativa.
- Dependencia de herramienta: requiere Frigate o una versión de mlx-lm que soporte `inkling2_loop`; no hay soporte documentado para otros motores de inferencia.
- Advertencia de seguridad del espejo: el autor declara una pasada de verificación (SHA-256 por fichero, ausencia de pickle, ausencia de `auto_map`), pero dicha verificación no es auditable desde la información proporcionada.

## Enlaces

- Repositorio del espejo: https://huggingface.co/rao-studios/Inkling-2-Mini
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Aplicación Craft: https://craft.rao.nyc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
