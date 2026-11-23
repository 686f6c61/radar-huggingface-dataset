# fubolibs/Qwen3.5-0.8B-pureland-buddhism

## Resumen

Qwen3.5-0.8B-pureland-buddhism es un modelo de lenguaje de la familia Qwen 3.5 en su variante más pequena, con aproximadamente 772,8 millones de parámetros totales, publicado por el usuario fubolibs en Hugging Face. El modelo se distribuye exclusivamente en formato GGUF, convertido mediante Unsloth, y está pensado para su uso con llama.cpp. La nomenclatura del repositorio sugiere un ajuste fino orientado a contenido de budismo de la Tierra Pura, aunque la model card no documenta el proceso de entrenamiento ni los datos utilizados.

El interés técnico del modelo reside en su reducido tamano (menos de 1.000 millones de parámetros) combinado con la etiqueta de vision-language-model y la presencia de un fichero mmproj, lo que indica capacidad multimodal. Esto lo situa en la categoria de modelos pequenos desplegables en hardware de consumo, con la particularidad de incluir entrada visual. No obstante, la ausencia de especificaciones detalladas en la model card limita considerablemente la evaluacion rigurosa de sus capacidades.

El repositorio no presenta descargas ni likes en el momento de la consulta, y carece de información sobre licencia, idiomas soportados o pipeline. La fecha de creacion indicada (2026-11-23) y el propio nombre de la familia (Qwen 3.5) no permiten verificar la procedencia oficial del modelo base, por lo que debe tratarse como una publicacion de terceros sin respaldo documental del desarrollador original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5; probablemente transformer con modulo de vision) |
| Parametros totales | 772.845.888 (dato de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (mmproj), F16, Q4_0, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. La etiqueta `qwen3_5` y el nombre del modelo apuntan a la familia Qwen 3.5 de Alibaba, y la presencia de un fichero `Qwen3.5-0.8B.BF16-mmproj.gguf` junto con la etiqueta `vision-language-model` confirma que el modelo incorpora un proyector multimodal para procesar imágenes. El fichero mmproj es el componente que en llama.cpp conecta el codificador visual con el modelo de lenguaje.

El proceso de conversion a GGUF se realizo con Unsloth, segun indica la model card. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF o DPO, ni las innovaciones tecnicas del modelo base. Tampoco se especifica el procedimiento de ajuste fino que justifica el sufijo `pureland-buddhism`, por lo que se desconoce si se trata de un fine-tuning supervisado, de una adaptacion por instrucciones o de otra tecnica.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes: la etiqueta `vision-language-model` y el fichero mmproj indican soporte multimodal de entrada visual.
- Compatibilidad con llama.cpp mediante `llama-cli` (texto) y `llama-mtmd-cli` (multimodal), con soporte de plantillas Jinja (`--jinja`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso mediante APIs compatibles con llama.cpp.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional especializado en budismo de la Tierra Pura: el ajuste fino declarado en el nombre permite generar respuestas y explicaciones dentro de esa tradicion, con un modelo de menos de 800 millones de parametros desplegable en local.
- Procesamiento de imagenes devocionales o textos escaneados: gracias al modulo mmproj, el modelo puede recibir una imagen junto con una consulta de texto, util para describir o contextualizar material grafico religioso.
- Despliegue en entornos con recursos limitados: con cuantizacion Q4_0, el modelo cabe en equipos modestos y puede ejecutarse con llama.cpp sin GPU dedicada de gama alta, lo que facilita prototipos y demos.
- Generacion de contenido educativo en un dominio acotado: el ajuste tematico permite producir material divulgativo sobre practicas, textos y conceptos de la tradicion, siempre con supervision humana por el riesgo de alucinacion.
- Integracion en aplicaciones de escritorio o moviles mediante llama.cpp: la disponibilidad de varios niveles de cuantizacion (Q4_0 a F16) permite ajustar el equilibrio entre calidad y consumo de memoria segun la plataforma.
- Experimentacion con modelos pequenos multimodales: sirve como banco de pruebas para pipelines de vision-lenguaje en llama.cpp con un coste computacional minimo.
- Base para fine-tuning adicional: al ser un modelo de 0,8B en GGUF, puede servir de referencia para comparar tecnicas de cuantizacion o de adaptacion de dominio en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 772,8 millones de parametros. En F16 ocuparia aproximadamente 1,5 GB de pesos; en Q8_0 en torno a 0,8-0,9 GB; en Q6_K cerca de 0,7 GB; en Q4_0 aproximadamente 0,5 GB. A estas cifras hay que sumar el fichero mmproj para uso multimodal y el overhead del contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojar las cuantizaciones bajas.
- Cabe en GPU consumer: si, previsiblemente en practicamente todas las GPU consumer modernas con al menos 4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal). No se confirma soporte de vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-pureland-buddhism | 772,8 M | no disponible | Si (mmproj) | no disponible | GGUF |
| Qwen2.5-0.5B | ~500 M | no disponible en esta ficha | No | Apache 2.0 (familia Qwen2.5) | safetensors, GGUF |
| SmolVLM-256M / SmolVLM-500M | 256-500 M | no disponible en esta ficha | Si | Apache 2.0 (familia SmolVLM) | safetensors, GGUF |

La comparacion con alternativas oficiales de la misma categoria se ve limitada porque no se dispone de datos verificados sobre contexto, rendimiento o licencia del modelo evaluado. Los modelos de referencia citados pertenecen a familias con documentacion publica, pero sus cifras exactas no se detallan aqui al no formar parte de la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta licencia, idiomas, contexto ni proceso de entrenamiento, lo que impide verificar el uso comercial permitido.
- Al tratarse de un ajuste tematico sobre un modelo base no confirmado oficialmente, existe riesgo de alucinacion en contenidos doctrinales o historicos.
- El sufijo `pureland-buddhism` sugiere un ajuste de dominio estrecho; es probable un rendimiento inferior en tareas generales fuera de ese ambito.
- El repositorio no registra descargas ni likes, y la fecha de creacion (2026-11-23) no es verificable contra fuentes oficiales; debe tratarse como publicacion de terceros sin validacion.
- No se especifican sesgos conocidos, pero un modelo de este tamano y dominio puede reproducir sesgos de sus datos de entrenamiento, no documentados.
- El fichero Q4_0 puede degradar la calidad de forma apreciable en un modelo de menos de 1B de parametros; se recomienda Q6_K o Q8_0 si el hardware lo permite.
- No hay evidencia de soporte de tool calling ni de razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes sin validacion previa.
- La compatibilidad multimodal depende de usar `llama-mtmd-cli` y el fichero mmproj correspondiente; un uso incorrecto del CLI puede ignorar la entrada visual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fubolibs/Qwen3.5-0.8B-pureland-buddhism
- Unsloth (herramienta de conversion citada): https://github.com/unslothai/unsloth
