# modrez/jarvis-R2-GGUF

# jarvis-R2-GGUF (modrez)

## Resumen

jarvis-R2-GGUF es una publicacion de pesos en formato GGUF subida por el usuario modrez a HuggingFace. Los nombres de los ficheros incluidos (`gemma-4-12b-it.BF16-mmproj.gguf`, `gemma-4-12b-it.Q4_K_M.gguf` y `gemma-4-12b-it.Q5_K_M.gguf`) indican que se trata de una conversion a GGUF de un modelo base identificado como gemma-4-12b-it, presumiblemente un modelo de la familia Gemma 4 en su variante instruct de aproximadamente 12.000 millones de parametros. La etiqueta `vision-language-model` y el fichero `mmproj` confirman que se trata de un modelo multimodal con capacidad de procesar imagenes, no solo texto.

El modelo declara 11.907.350.576 parametros totales en safetensors (aproximadamente 11,9 mil millones), lo que es coherente con la denominacion comercial "12b" de los ficheros. El repositorio ocupa 16,1 GB en total, suma de las tres cuantizaciones publicadas. La etiqueta `gemma4_unified` sugiere que la arquitectura subyacente es la variante unificada de Gemma 4, aunque no se aporta ninguna documentacion tecnica al respecto en la model card.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay datos de licencia, idiomas, benchmarks ni detalles de entrenamiento. Se trata ademas de un repositorio sin descargas ni valoraciones en el momento de la consulta, creado y actualizado el 4 de octubre de 2026, con apenas cuatro minutos de diferencia entre ambos eventos. Es, por tanto, una publicacion de conversion de formato, no un modelo entrenado desde cero por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `gemma4_unified` sugiere arquitectura unificada de la familia Gemma 4; sin confirmar) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyector multimodal, mmproj), Q4_K_M y Q5_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); pesos originales segun safetensors para el conteo de parametros |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizados, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en el modelo base. La model card se limita a indicar que la conversion a GGUF se realizo con las herramientas de Unsloth, un proyecto conocido por sus utilidades de cuantizacion y conversion de pesos.

Lo unico inferible a partir de los metadatos es de caracter estructural: la presencia de un fichero `mmproj` (proyector multimodal) en BF16 junto a los pesos del modelo indica una arquitectura de tipo vision-language, con un codificador visual independiente cuyas representaciones se proyectan al espacio de embeddings del modelo de lenguaje. El tag `unsloth` y `llama.cpp` confirman que la publicacion es un artefacto de despliegue, no un entrenamiento. Cualquier afirmacion adicional sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, mezcla de expertos) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Procesamiento de imagenes: el tag `vision-language-model` y el fichero de proyector multimodal `gemma-4-12b-it.BF16-mmproj.gguf` confirman soporte de entrada visual.
- Ejecucion con plantillas de chat Jinja, ya que los ejemplos de la model card invocan `llama-cli` y `llama-mtmd-cli` con el flag `--jinja`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el artefacto puede servirse en infraestructuras de inferencia compatibles con el formato de la plataforma.
- Capacidades de tool calling, function calling, razonamiento multi-paso o modo "thinking": no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Descripcion automatica de imagenes en castellano: el modelo puede recibir una fotografia o captura como entrada visual y generar un texto descriptivo, aprovechando el proyector multimodal incluido en el repositorio. Es adecuado porque el artefacto `mmproj` esta ya convertido y listo para `llama-mtmd-cli`.
- Asistente conversacional local en puesto de trabajo: desplegado con Ollama o LM Studio sobre una GPU de consumo, el modelo permite mantener dialogos multi-turno sin enviar datos a servicios externos, algo relevante para entornos con requisitos de confidencialidad.
- Extraccion de informacion de documentos escaneados: combinando la entrada visual con instrucciones de texto, se pueden transcribir y estructurar campos de facturas, albaranes o formularios en un pipeline interno.
- Generacion de codigo asistida en editor: el modelo puede integrarse en extensiones tipo Continue o similar a traves del servidor compatible con la API de OpenAI que ofrecen llama.cpp y Ollama.
- Prototipado rapido de aplicaciones multimodales: al estar en GGUF, es posible validar una idea de producto con una sola GPU consumer antes de decidir si se migra a una infraestructura mayor en BF16.
- Clasificacion y etiquetado de imagenes en lotes: mediante procesamiento por lotes en `llama-mtmd-cli` o en un servidor vLLM con soporte multimodal, se pueden categorizar grandes volumenes de imagenes con prompts fijos.
- Base para fine-tuning ligero: los pesos en safetensors (11,9 mil millones de parametros) pueden servir de punto de partida para un ajuste con LoRA sobre un dominio concreto, aunque la licencia no esta declarada y esto debe verificarse antes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV ni proyector):
  - BF16: aproximadamente 24 GB (11,9 mil millones de parametros a 2 bytes por parametro).
  - Q5_K_M: aproximadamente 8,5-9 GB.
  - Q4_K_M: aproximadamente 7,5-8 GB.
- Sumar a lo anterior el proyector multimodal en BF16, el cache KV (que crece con la longitud de contexto) y el overhead del runtime; en la practica conviene dejar un margen de entre 1 y 3 GB adicionales.
- GPU recomendadas:
  - BF16: A100 40 GB, L40S 48 GB o H100 80 GB; tambien RTX 4090 o RTX 3090 de 24 GB con contexto corto y margen muy ajustado.
  - Q5_K_M: RTX 4080, RTX 4090, RTX 3090, RTX 4060 Ti 16 GB, L4 24 GB.
  - Q4_K_M: RTX 4070, RTX 3080 12 GB, RTX 4060 Ti 16 GB; en GPUs de 8 GB puede requerir descarga parcial a CPU.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_K_M y Q5_K_M sobre tarjetas de 12 GB o mas. La variante BF16 queda fuera del alcance de la mayoria de equipos domesticos.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal, con `--jinja`), Ollama, LM Studio, servidores compatibles con la API de OpenAI y vLLM o TGI si admiten el proyector multimodal.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor y no procede extrapolar cifras fiables.

## Comparativa con modelos similares

La ausencia de datos publicos sobre arquitectura, contexto, entrenamiento y licencia impide una comparacion rigurosa. La tabla siguiente recoge unicamente los parametros conocidos del modelo objeto de la ficha frente a alternativas de tamano comparable del panorama abierto, marcando como "no disponible" todo aquello que no se ha declarado.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jarvis-R2-GGUF (modrez) | 11,9 mil millones | no disponible | Si (mmproj) | no disponible | GGUF en HuggingFace |
| Gemma 3 12B IT | 12 mil millones | 128.000 tokens | Si (variante multimodal) | Gemma Terms of Use | Pesos abiertos en HuggingFace |
| Llama 3.2 11B Vision Instruct | 11 mil millones | 128.000 tokens | Si | Llama 3.2 Community License | Pesos abiertos en HuggingFace |
| Qwen2.5-VL 7B Instruct | 7 mil millones | 128.000 tokens | Si | Apache 2.0 | Pesos abiertos en HuggingFace |

Nota: los datos de las filas comparativas corresponden a informacion publica de cada proyecto y no se han verificado contra este repositorio concreto. No se dispone de benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio. Sin una licencia explicita, el uso comercial es juridicamente inseguro y debe aclararse con el autor antes de cualquier despliegue en produccion.
- La model card no documenta el modelo base con detalle (solo aparece en los nombres de fichero), por lo que no se puede confirmar que los pesos se correspondan exactamente con una version oficial de Gemma 4 12B IT ni que la conversion a GGUF sea fiel.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano. En tareas de extraccion de informacion de imagenes (facturas, formularios) se recomienda validacion posterior por reglas o por un segundo modelo.
- No se ha publicado la longitud de contexto soportada, lo que impide planificar cargas de trabajo con documentos largos o conversaciones extensas.
- No se declaran los idiomas soportados; el rendimiento en castellano de Espana es desconocido y deberia validarse empiricamente antes de asumirlo.
- El repositorio registra cero descargas y cero valoraciones en el momento de la consulta. No existe evidencia de uso en produccion ni de replicacion independiente de resultados.
- El tag `endpoints_compatible` no garantiza comportamiento correcto en todas las plataformas de inferencia, especialmente en lo relativo al procesamiento multimodal y al manejo del proyector `mmproj`.
- Al ser una publicacion de conversion, no hay garantia de mantenimiento, actualizaciones ni soporte por parte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/modrez/jarvis-R2-GGUF
- Unsloth (herramienta de conversion citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia para GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada. Los resultados obtenidos en dicha busqueda no guardan relacion con el modelo y se han descartado.
