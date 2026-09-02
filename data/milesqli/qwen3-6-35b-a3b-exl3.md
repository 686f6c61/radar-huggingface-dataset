# MilesQLi/Qwen3.6-35B-A3B-exl3

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje multimodal de codigo abierto desarrollado por Alibaba, perteneciente a la linea Qwen3.6. Se trata de la rama de mezcla de expertos (MoE) de esta familia, con 35 000 millones de parametros totales de los cuales solo 3 000 millones se activan por token, lo que permite un rendimiento elevado con un coste computacional reducido. El modelo esta disenado para tareas de agente, generacion de codigo, razonamiento de contexto largo y comprension de imagenes y video, integrando un modo de pensamiento hibrido que alterna entre razonamiento explicito y respuesta directa.

La arquitectura se basa en Gated Delta Networks, una innovacion reciente que sustituye los mecanismos de atencion tradicionales por un enfoque de estado recurrente con compuertas, lo que mejora la eficiencia en secuencias largas. El contexto nativo alcanza 262 144 tokens y puede extenderse hasta aproximadamente 1,01 millones mediante tecnicas de interpolacion. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. La version alojada en Hugging Face bajo el identificador `MilesQLi/Qwen3.6-35B-A3B-exl3` es una adaptacion con cuantizacion EXL3 realizada por el usuario MilesQLi, aunque el modelo base es el publicado por Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated Delta Networks (MoE) |
| Parametros totales | 35 000 millones |
| Parametros activos | 3 000 millones |
| Longitud de contexto | 262 144 tokens (extensible a ~1,01 millones) |
| Tipos de cuantizacion | EXL3 (en esta version), otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumiblemente), EXL3 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) sobre una base de Gated Delta Networks (GDN). A diferencia de los transformers con atencion completa, GDN utiliza un mecanismo de estado recurrente con compuertas que permite procesar secuencias largas con complejidad lineal en lugar de cuadratica, lo que resulta especialmente adecuado para contextos de 262 000 tokens o mas. La seleccion de expertos activa solo 3 000 millones de parametros por token, lo que reduce la carga computacional en inferencia manteniendo la capacidad de un modelo de 35 000 millones.

Los datos de entrenamiento no se han detallado en la informacion disponible. Se sabe que el modelo ha sido ajustado para tareas de agente y codigo, con soporte nativo de tool calling y un modo de pensamiento hibrido que permite al usuario elegir entre razonamiento explicito (thinking mode) o respuesta directa. La extension de contexto hasta 1,01 millones de tokens sugiere el uso de tecnicas de interpolacion posicional o ventanas deslizantes, aunque no se especifica el metodo concreto. No se menciona el uso de RLHF o DPO en los datos proporcionados.

## Capacidades

- Generacion de texto y razonamiento de contexto largo: maneja secuencias de hasta 262 000 tokens de forma nativa, con extension hasta aproximadamente 1,01 millones.
- Codigo: optimizado para tareas de programacion, incluyendo generacion, depuracion y refactorizacion.
- Agentes y tool calling: soporte integrado para invocar funciones externas y realizar flujos de trabajo multi-paso.
- Multimodal: acepta entradas de texto, imagen y video, lo que permite tareas de vision-lenguaje como descripcion de imagenes, respuesta a preguntas visuales y analisis de video.
- Modo de pensamiento hibrido: alterna entre razonamiento explicito (cadena de pensamiento) y respuesta directa, segun la configuracion del usuario.
- Razonamiento matematico y logico: no se han publicado benchmarks especificos, pero la arquitectura y el entrenamiento orientado a agentes sugieren capacidades solidas en estas areas.

## Casos de uso

- Asistente de programacion en entornos de desarrollo integrado: el modelo puede generar codigo, explicar fragmentos existentes y sugerir correcciones, aprovechando su contexto largo para mantener el estado completo del proyecto en memoria.
- Automatizacion de tareas de agente con herramientas externas: gracias al soporte nativo de tool calling, puede orquestar llamadas a APIs, bases de datos o servicios web en flujos multi-paso, por ejemplo para consultar informacion, actualizar registros o enviar notificaciones.
- Analisis de documentos extensos: con 262 000 tokens de contexto, puede procesar libros, informes anuales o expedientes completos de una sola vez, extrayendo resumenes, respondiendo preguntas o detectando patrones.
- Moderacion y clasificacion de contenido visual: al aceptar imagenes y video, puede etiquetar contenido, detectar objetos o generar descripciones accesibles para personas con discapacidad visual.
- Chatbots de atencion al cliente con memoria persistente: el contexto largo permite mantener conversaciones de muchas interacciones sin perder informacion relevante, mejorando la coherencia en servicios de soporte.
- Investigacion academica y revision de literatura: el modelo puede resumir articulos, comparar metodologias y extraer conclusiones de corpus cientificos extensos, acelerando la fase de revision bibliografica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo. Se recomienda consultar la documentacion oficial de Qwen para obtener metricas comparativas cuando esten disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo MoE con 3 000 millones de parametros activos, la memoria necesaria depende de la cuantizacion. Con cuantizacion de 4 bits, los 35 000 millones de parametros totales requieren aproximadamente 18-20 GB de VRAM, lo que permite ejecucion en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). Con cuantizacion de 8 bits, se necesitan alrededor de 35-40 GB, lo que exige GPUs profesionales como la A100 (40 GB) o la RTX A6000 (48 GB).
- GPU recomendadas: para uso productivo con contexto largo, se recomienda al menos una A100 de 40 GB o una H100 de 80 GB. Para experimentacion local, una RTX 4090 con cuantizacion de 4 bits es suficiente.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con motores de inferencia como vLLM, llama.cpp, Ollama y TGI. La version EXL3 especifica requiere el motor ExLlamaV3.
- Latencia y throughput: no se han publicado datos concretos. En general, los modelos MoE con 3 000 millones de parametros activos ofrecen una latencia por token significativamente menor que un modelo denso del mismo tamano total, aunque la velocidad exacta depende del hardware y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Modalidades |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35 000 millones | 3 000 millones | 262 000 (ext. 1,01 M) | Apache 2.0 | Texto, imagen, video |
| Qwen3.6-27B (denso) | 27 000 millones | 27 000 millones | 262 000 | Apache 2.0 | Texto, imagen, video |
| Qwen3-30B-A3B (generacion anterior) | 30 000 millones | 3 000 millones | 131 000 | Apache 2.0 | Texto |

La comparativa se basa en datos publicos de la familia Qwen. El modelo Qwen3.6-35B-A3B mejora a su predecesor Qwen3-30B-A3B en contexto (262 000 frente a 131 000) y anade capacidades multimodales. Frente al denso Qwen3.6-27B, ofrece un coste de inferencia menor gracias a la activacion selectiva de expertos, aunque con un tamano total mayor. No se dispone de datos de rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos de internet, puede reflejar sesgos sociales, culturales o de genero presentes en el corpus de entrenamiento. No se han publicado evaluaciones especificas de sesgo para esta version.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide informacion muy especifica. Se recomienda verificacion humana en aplicaciones criticas.
- Limitaciones de contexto: aunque el contexto nativo es de 262 000 tokens, el rendimiento en la parte final de secuencias muy largas puede degradarse. La extension a 1,01 millones de tokens puede requerir tecnicas adicionales de interpolacion y no esta garantizada en todos los motores de inferencia.
- Limitaciones de idioma: no se han publicado los idiomas soportados. Se asume un soporte multilingue similar a otros modelos Qwen, pero no hay confirmacion oficial en la informacion disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero no se proporciona una politica de uso aceptable especifica. Se recomienda revisar los terminos de Qwen para usos de alto riesgo.
- Advertencia para produccion: la version `MilesQLi/Qwen3.6-35B-A3B-exl3` es una adaptacion de terceros con cuantizacion EXL3. No se ha verificado su equivalencia exacta con el modelo original de Qwen. Para despliegues criticos, se recomienda utilizar el modelo base oficial.

## Enlaces

- Modelo en Hugging Face (version EXL3): https://huggingface.co/MilesQLi/Qwen3.6-35B-A3B-exl3
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Documentacion del framework Miles (post-entrenamiento): https://github.com/jliu678/miles_LLM-post-training/blob/main/scripts/models/qwen3.6-35B-A3B.sh
- Documentacion tecnica de Qwen3.6 MoE: https://github.com/radixark/miles/blob/main/docs/models/qwen/qwen3-6-moe.md
- Version abliterada por huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
