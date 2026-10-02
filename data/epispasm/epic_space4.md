# epispasm/epic_space4

## Resumen

epic_space4 es un modelo de lenguaje y visión (vision-language model) publicado por el usuario epispasm en HuggingFace, distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Según los tags del repositorio y el nombre de sus archivos, deriva de la familia Qwen3.5 en su variante de 9B, y el sufijo del nombre de archivo (`nsfw-captioning-v5`) indica que se trata de un ajuste fino orientado a la generacion de descripciones de imagenes, presumiblemente en el ambito de contenido para adultos.

El dato objetivo mas relevante es el recuento de parametros verificado en safetensors: 8.953.803.264 parametros (aproximadamente 8,95 mil millones), lo que situa al modelo en la gama media, comparable a otros VLM de 7-9B. El repositorio ocupa 18,8 GB, coherente con pesos en BF16 mas el proyector multimodal. La conversion a GGUF se realizo con Unsloth, y el repositorio ofrece dos unicos archivos: los pesos principales y el `mmproj` necesario para la parte de vision.

Es relevante ahora como ejemplo de la tendencia a publicar ajustes finos de VLM de proposito especifico con empaquetado listo para inferencia local. Sin embargo, la ausencia total de model card descriptiva (no hay licencia, idiomas, datos de entrenamiento ni benchmarks), junto con cero descargas y cero likes en el momento de la consulta, obliga a tratarlo como un artefacto experimental sin garantias de calidad ni de trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags `qwen3_5` y el nombre de archivo `qwen3.5-9b-...` apuntan a la familia Qwen3.5, variante 9B; no se especifica el tipo de transformer) |
| Parametros totales | 8.953.803.264 (datos reales de safetensors) |
| Parametros activos | no disponible (sin indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 unicamente (archivos publicados); no se incluyen cuantizaciones Q4, Q5, Q8 ni similares |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (pesos principales + `mmproj` en GGUF para la torre de vision) |

Archivos incluidos en el repositorio:

| Archivo | Contenido |
|---|---|
| `qwen3.5-9b-nsfw-captioning-v5.BF16.gguf` | Pesos principales del modelo en BF16 |
| `qwen3.5-9b-nsfw-captioning-v5.BF16-mmproj.gguf` | Proyector multimodal (vision) en BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. Los unicos indicios son los tags del repositorio (`qwen3_5`, `vision-language-model`) y el nombre del archivo de pesos, que sugiere una base Qwen3.5 de 9B. La presencia de un archivo `mmproj` independiente confirma una topologia de VLM con una torre de vision separada conectada al modelo de lenguaje mediante un proyector, que es el esquema habitual en esta familia y en implementaciones compatibles con llama.cpp (`llama-mtmd-cli`).

Tampoco hay informacion sobre el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo etapas de SFT, DPO, RLHF u otro tipo de alineamiento, ni el metodo de ajuste (el tag `unsloth` se refiere a la herramienta usada para la conversion a GGUF, no necesariamente al entrenamiento). El sufijo `nsfw-captioning-v5` es la unica pista sobre la tarea de ajuste: generacion de descripciones de imagenes con contenido explicito. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modo de razonamiento explicito, etc.).

## Capacidades

- Generacion de texto conversacional, heredada de la base Qwen3.5 segun los tags del modelo (`conversational`).
- Comprension de imagenes y generacion de descripciones (captioning), gracias al proyector multimodal incluido en el repositorio.
- Ajuste especifico para descripcion de imagenes con contenido para adultos, segun el nombre del archivo de pesos.
- Ejecucion local mediante llama.cpp, con soporte declarado para plantillas Jinja (`--jinja`) y compatibilidad con endpoints, segun los tags `llama.cpp`, `llama-cpp` y `endpoints_compatible`.
- Capacidades de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito, audio u otras modalidades: no disponible (unicamente vision y texto).

## Casos de uso

- Etiquetado automatico de imagenes a escala: el modelo puede generar descripciones textuales de lotes de imagenes para construir datasets de entrenamiento o indexar repositorios multimedia, aprovechando su naturaleza de captioning ajustado especificamente para esta tarea.
- Moderacion y clasificacion de contenido adulto: util como componente de un pipeline que necesite describir o etiquetar material sensible para aplicar politicas de plataforma, siempre con supervision humana y revision legal previa.
- Generacion de texto alternativo para accesibilidad: puede producir descripciones de imagenes para lectores de pantalla; conviene validar la calidad fuera del dominio de ajuste, ya que el ajuste NSFW puede degradar el rendimiento en imagenes genericas.
- Asistentes multimodales en local: despliegue con llama.cpp u Ollama en equipos sin conectividad, para consultas sobre imagenes sin enviar datos a servicios externos, un requisito habitual en entornos sanitarios, legales o industriales.
- Analisis forense o de investigacion sobre seguridad de contenido: sirve como herramienta de anotacion asistida en estudios academicos sobre moderacion, con la advertencia de que no hay model card que documente sesgos.
- Prototipado rapido de aplicaciones de vision-lenguaje: al estar en un unico archivo GGUF con su `mmproj`, permite levantar una demo funcional en minutos con `llama-mtmd-cli` sin infraestructura de servido compleja.
- Conversion como base para cuantizacion propia: dado que solo se publica BF16, un equipo puede generar sus propias versiones Q4_K_M o Q8_0 con llama.cpp y adaptar el modelo a hardware mas modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU, TextVQA ni de ninguna otra evaluacion, ni comparaciones con modelos similares aportadas por el autor.

## Requisitos de hardware

- VRAM estimada en BF16 (formato publicado): aproximadamente 17,9 GB solo para los pesos, mas el proyector multimodal y la cache KV, lo que situa el consumo real en torno a 20-22 GB.
- GPU recomendadas para BF16: NVIDIA A100 40 GB, H100, L40S, RTX A6000 (48 GB) o RTX 6000 Ada. Una RTX 4090 o RTX 3090 de 24 GB queda muy justa y puede requerir reducir el contexto.
- Cuantizacion a Q8_0 (generada por el usuario): aproximadamente 9,5 GB, viable en RTX 4080/4090, RTX 3090 y GPUs de 12-16 GB con contexto reducido.
- Cuantizacion a Q4_K_M (generada por el usuario): aproximadamente 5,5 GB, viable en GPUs consumer de 8 GB, como RTX 3060 Ti, RTX 4060 o incluso en Apple Silicon con memoria unificada de 16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal, ambos con `--jinja`), Ollama mediante importacion del GGUF, LM Studio, y servidores compatibles con endpoints OpenAI. No se documenta soporte oficial en vLLM ni TGI, que requieren transformar los pesos a safetensors.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa con la informacion disponible: el modelo carece de licencia, idiomas declarados, contexto y benchmarks publicados, por lo que cualquier comparacion numerica seria especulativa. A continuacion se recogen unicamente los datos verificables.

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| epispasm/epic_space4 | 8.953.803.264 | no disponible | no disponible | no publicado | GGUF BF16 en HuggingFace, 0 descargas |
| Alternativas de la misma categoria (VLM de 7-9B) | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, la categoria de VLM de 7-9B incluye habitualmente modelos como la propia familia Qwen-VL o variantes similares, pero no se dispone en la informacion proporcionada de sus cifras concretas para este modelo.

## Limitaciones y advertencias

- Ausencia total de model card: no hay licencia, ni idiomas, ni datos de entrenamiento, ni informacion sobre sesgos. Esto impide cualquier evaluacion de riesgos previa a un uso en produccion.
- Licencia no disponible: sin licencia explicita, no puede asumirse permiso de uso comercial. En la practica, el modelo queda en una zona legal ambigua.
- Ajuste orientado a contenido NSFW: el ajuste fino puede degradar el comportamiento en tareas generales de vision-lenguaje y aumentar la probabilidad de generar descripciones inapropiadas en contextos profesionales.
- Riesgo de alucinacion: al ser un modelo generativo de 9B sin evaluaciones publicadas, es esperable que invente detalles no presentes en la imagen. No hay datos de fidelidad de captioning.
- Idiomas no declarados: se desconoce si el modelo mantiene un rendimiento equilibrado en castellano o si esta sesgado hacia el ingles, que es lo habitual en ajustes de captioning.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o conversaciones multi-turno extensas sin medirla empiricamente.
- Solo se publican pesos BF16: el usuario debe generar sus propias cuantizaciones, lo que anade un paso de conversion y un riesgo de degradacion no documentado.
- Trazabilidad limitada: cero descargas y cero likes en el momento de la consulta, sin repositorio de codigo, paper ni demo asociados.
- Uso responsable: cualquier aplicacion sobre material sensible debe acompanarse de revision humana, control de acceso y cumplimiento normativo (por ejemplo, verificacion de edad y normativa de contenido).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/epispasm/epic_space4
- Unsloth (herramienta citada para la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime implicito en los tags y en los comandos de ejemplo de la model card): no se proporciona enlace en la informacion disponible
- Paper, blog o demo oficial: no disponible
