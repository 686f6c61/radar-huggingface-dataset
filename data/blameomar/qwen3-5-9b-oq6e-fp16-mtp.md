# BlameOmar/Qwen3.5-9B-oQ6e-fp16-mtp

## Resumen

BlameOmar/Qwen3.5-9B-oQ6e-fp16-mtp es una version cuantizada del modelo Qwen3.5 9B, publicada por el usuario BlameOmar en HuggingFace el 13 de octubre de 2026. No se trata de un modelo entrenado desde cero, sino de un artefacto de pesos derivado: el autor ha aplicado cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.1.dev1) sobre el modelo base de Qwen, y ha publicado el resultado en formato MLX safetensors para su ejecucion en hardware Apple Silicon.

El modelo base, Qwen3.5 9B, es el mayor de los cuatro modelos densos pequenos de la familia Qwen3.5 de Alibaba Qwen: un modelo vision-lenguaje nativamente multimodal, con modo de razonamiento (thinking) activado por defecto, 262.144 tokens de contexto nativo extensibles a 1 millon mediante YaRN, soporte declarado de 201 idiomas, tool calling nativo y pesos abiertos bajo licencia Apache 2.0. Este repositorio concreto pesa 9,65 mil millones de parametros y ocupa 9,4 GB en el Hub.

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantizacion concreta (6 bits, group size 64, con un modulo adicional en fp16) que reduce el peso del modelo para que quepa en equipos de consumo con memoria unificada; por otro, sirve de aviso de que el repositorio no incluye model card tecnica, datos de entrenamiento ni resultados de evaluacion propios, por lo que cualquier evaluacion de calidad debe remitirse al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (declarada por el autor como model type); la familia Qwen3.5 se describe publicamente como multimodal e hibrida |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base, extensible a 1.000.000 con YaRN (no confirmado en esta cuantizacion) |
| Tipos de cuantizacion | 6 bits, group size 64, cuantizacion mixta oQ con modulo fp16 adicional |
| Idiomas soportados | 201 idiomas en el modelo base; no disponible para esta cuantizacion |
| Licencia | no disponible en el repositorio; el modelo base Qwen3.5 se publica bajo Apache 2.0 |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 9,4 GB |
| Biblioteca | mlx |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

El autor no aporta informacion sobre arquitectura ni entrenamiento en la model card. Los unicos datos tecnicos declarados son los de la cuantizacion: model type qwen3_5, 6 bits, group size 64 y formato MLX safetensors, generados con oQ (oMLX v0.7.1.dev1), una herramienta de cuantizacion de precision mixta para MLX. Segun la documentacion publica del modelo base, la familia Qwen3.5 es nativamente multimodal (vision-lenguaje), con arquitectura descrita como hibrida, modo thinking activado por defecto y soporte de tool calling nativo. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica de este repositorio es exclusivamente la receta de cuantizacion: 6 bits con group size 64 en la mayor parte de las capas y un componente adicional conservado en fp16, senalado por el sufijo "-fp16-mtp" del nombre. El sufijo "-mtp" sugiere un modulo de multi-token prediction, habitual en recetas de decodificacion especulativa, pero no hay documentacion en la informacion disponible que confirme su funcion ni su composicion.

## Capacidades

Las capacidades enumeradas a continuacion corresponden al modelo base Qwen3.5 9B, segun la documentacion publica de la familia, y se asumen heredadas por esta cuantizacion. No han sido verificadas de forma independiente sobre estos pesos.

- Generacion de texto y razonamiento con modo thinking activado por defecto.
- Comprension de imagen y razonamiento vision-lenguaje (modelo nativamente multimodal).
- Tool calling / function calling nativo.
- Flujos agenticos y razonamiento multi-paso.
- Cobertura multilingue de hasta 201 idiomas.
- Procesamiento de contexto largo: 262.144 tokens nativos, extensibles a 1.000.000 con YaRN.
- Capacidades de codigo y matematicas: no disponible (no se aportan resultados de evaluacion en la informacion disponible).

## Casos de uso

- Ejecucion local en portatiles Apple Silicon: al estar en formato MLX con cuantizacion de 6 bits, el modelo puede cargarse con mlx-lm en un Mac con memoria unificada de 16 GB o superior, lo que permite prototipar un modelo de 9,65 mil millones de parametros sin conexion a servicios en la nube.
- Asistente de documentacion tecnica sobre repositorios largos: los 262.144 tokens de contexto nativo del modelo base permiten indexar y consultar ficheros completos de codigo o manuales extensos en una sola ventana, sin troceado agresivo.
- Extraccion de informacion de documentos con imagenes: al ser un modelo vision-lenguaje, puede procesar capturas, diagramas o facturas escaneadas y devolver campos estructurados mediante tool calling.
- Automatizacion de atencion al cliente multilingue: el soporte declarado de 201 idiomas permite atender consultas en varios idiomas con un unico despliegue, manteniendo el contexto de la conversacion en ventanas largas.
- Agentes con llamada a herramientas en local: el tool calling nativo y el razonamiento multi-paso permiten construir agentes que consulten APIs o bases de datos desde un portatil, sin enviar datos a terceros.
- Laboratorio de investigacion en cuantizacion: el repositorio sirve como punto de comparacion reproducible frente a la variante de 8 bits (scottlowry/Qwen3.5-9B-oQ8e-fp16-mtp) para medir la degradacion entre 6 y 8 bits sobre las mismas tareas.
- Generacion asistida de codigo en entornos con requisitos de privacidad: al ejecutarse en local con MLX, encaja en flujos donde el codigo fuente no puede salir de la maquina del desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, MMMU u otras evaluaciones, ni para esta cuantizacion ni para el modelo base Qwen3.5 9B. Tampoco se dispone de mediciones de latencia o throughput para esta receta de 6 bits.

## Requisitos de hardware

- El formato es MLX safetensors, por lo que el destino natural es hardware Apple Silicon (series M1, M2, M3 y M4). No es un formato directamente utilizable en CUDA sin conversion.
- VRAM/memoria unificada estimada para los pesos: aproximadamente 7,2 GB para los tensores a 6 bits (9,65e9 x 0,75 bytes), sobre un repositorio de 9,4 GB que incluye el componente fp16 adicional. Es una estimacion derivada del numero de parametros, no un dato publicado.
- Memoria recomendada para inferencia comoda: 16 GB de memoria unificada o mas, teniendo en cuenta la cache KV para contexto largo, que crece de forma lineal con la ventana utilizada.
- Equipos compatibles: cualquier Mac con chip de la serie M y 16 GB o mas (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). En configuraciones de 8 GB no cabe con margen suficiente para contexto largo.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible para este formato sin reconversion previa de los pesos a un formato compatible con CUDA.
- Opciones de despliegue: mlx-lm y mlx_lm.server para servir una API compatible con OpenAI; LM Studio en equipos Apple Silicon; otros runners MLX. Ollama y vLLM no figuran como soportados en la informacion disponible para este repositorio concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlameOmar/Qwen3.5-9B-oQ6e-fp16-mtp | 9,65 mil millones | 6 bits, group size 64, oQ | 262.144 en el modelo base | no disponible en el repo (base Apache 2.0) | HuggingFace, 0 descargas |
| scottlowry/Qwen3.5-9B-oQ8e-fp16-mtp | 9,65 mil millones (mismo base) | 8 bits, oQ, formato MLX | 262.144 en el modelo base | no disponible en el repo | HuggingFace, formato MLX |
| Qwen3.5 9B (oficial) | 9 mil millones aprox. | fp16/BF16 sin cuantizar | 262.144 nativos, 1M con YaRN | Apache 2.0 | Ollama, Modal, Together AI |
| huihui_ai/qwen3.5-abliterated:9b-fp16 | 9 mil millones aprox. | fp16, abliterated (sin filtros de rechazo) | no disponible | no disponible | Ollama |

La diferencia principal frente a la variante de 8 bits es el compromiso entre tamano en disco y fidelidad numerica: 6 bits ocupa menos memoria pero introduce mas error de cuantizacion. No se dispone de datos de evaluacion que cuantifiquen esa diferencia para ninguno de los dos repositorios.

## Limitaciones y advertencias

- La model card no incluye licencia explicita. Aunque el modelo base Qwen3.5 se distribuye bajo Apache 2.0, conviene verificar los terminos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo intervalo de dos minutos: no hay evidencia de uso, validacion por terceros ni mantenimiento posterior.
- No se aportan resultados de evaluacion. La degradacion introducida por la cuantizacion a 6 bits con group size 64 es desconocida y debe medirse en el caso de uso concreto antes de llevarlo a produccion.
- El componente senalado como "-mtp" en el nombre no esta documentado. Si se trata de un modulo de decodificacion especulativa, su comportamiento y su impacto en la calidad de salida no han sido publicados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; el riesgo aumenta con el nivel de cuantizacion y no ha sido caracterizado en este repositorio.
- Sesgos: no disponibles. No hay documentacion de sesgos ni de medidas de mitigacion para esta cuantizacion, y la documentacion publica del modelo base no detalla la composicion de su dataset.
- Limites de idioma: aunque el modelo base declara 201 idiomas, el rendimiento real por idioma no esta documentado; el castellano no aparece con evaluacion especifica en la informacion disponible.
- Limite de contexto practico: la ventana de 262.144 tokens dispara el consumo de memoria de la cache KV, lo que puede hacer inviable aprovechar el contexto completo en equipos de 16 GB.
- Restriccion de plataforma: al ser pesos MLX, el modelo no es directamente desplegable en infraestructura CUDA (NVIDIA) ni en servicios gestionados que esperen safetensors estandar.
- Advertencia sobre derivados: existen versiones "abliterated" del mismo modelo base en circulacion (huihui_ai/qwen3.5-abliterated) con filtros de seguridad reducidos. No deben confundirse con este repositorio.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/BlameOmar/Qwen3.5-9B-oQ6e-fp16-mtp
- Repositorio de la herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Variante de 8 bits del mismo modelo: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ8e-fp16-mtp
- Ficha del modelo base Qwen3.5 9B en Together AI: https://www.together.ai/models/qwen3-5-9b
- Ficha del modelo base en Modal: https://modal.com/library/qwen/qwen3-5-9b
- Modelo base en la libreria de Ollama: https://ollama.com/library/qwen3.5:9b
- Version abliterated de terceros (referencia, no equivalente): https://ollama.com/huihui_ai/qwen3.5-abliterated:9b-fp16
- Paper o blog oficial de Qwen3.5: no disponible en la informacion proporcionada.
