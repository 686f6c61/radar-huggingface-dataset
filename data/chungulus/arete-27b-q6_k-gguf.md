# Chungulus/Arete-27B-Q6_K-GGUF

## Resumen

Arete-27B es un ajuste fino supervisado (SFT) desarrollado por Nous Research sobre Qwen3.8-27B, el modelo base de Alibaba/Qwen. Se distribuye originalmente en BF16 con un codificador visual integrado, lo que lo convierte en un modelo multimodal de tipo image-text-to-text con cerca de 27.360 millones de parametros totales. La ficha que nos ocupa, Chungulus/Arete-27B-Q6_K-GGUF, es una cuantizacion independiente en formato GGUF Q6_K del checkpoint original, pensada para su ejecucion en llama.cpp.

El interes de esta publicacion reside en que permite desplegar un modelo de ~27B con capacidades de vision en hardware de consumo o en estaciones de trabajo sin GPU de datacenter, manteniendo el proyector multimodal en BF16 completo (mmproj-Arete-27B-BF16.gguf). El repositorio ocupa 23,0 GB y contiene 26.895.998.464 parametros en el GGUF de texto, frente a los 27.356.728.560 del checkpoint fuente (la diferencia corresponde al codificador visual, exportado por separado).

La cuantizacion es de tipo Q6_K, sin dataset de calibracion ni importance matrix, generada de forma independiente desde el export BF16 original y con los 18 shards de origen verificados por SHA256. La licencia es Apache 2.0. El autor advierte explicitamente de que no se han evaluado benchmarks, alineamiento, uso de herramientas ni calidad en contexto completo sobre el modelo cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.5/Qwen3.8 segun el autor |
| Parametros totales | 27.356.728.560 (checkpoint fuente, incluye vision); 26.895.998.464 en el GGUF de texto |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de uso emplean 8192 tokens) |
| Tipos de cuantizacion | Q6_K (esta publicacion); el autor menciona que cada formato se cuantizo de forma independiente |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal mmproj-Arete-27B-BF16.gguf incluido |

## Arquitectura y entrenamiento

Arete-27B es un ajuste fino supervisado de Qwen3.8-27B realizado por Nous Research. La informacion disponible no detalla la composicion del dataset de SFT, el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. El checkpoint fuente incluye un codificador visual, por lo que la arquitectura es multimodal con entrada de imagen y texto; el pipeline declarado es image-text-to-text. El autor de la cuantizacion etiqueta la familia como Qwen3.5/Qwen3.8 y recomienda un runtime reciente de llama.cpp que soporte dichas variantes.

La innovacion tecnica relevante en esta publicacion es el proceso de cuantizacion: cada formato se genero de forma independiente desde el export BF16 original, sin recuantizar checkpoints de baja precision y sin dataset de calibracion ni importance matrix. Los 18 shards originales se verificaron con SHA256 antes de la conversion y las cabeceras de tensores confirmaron el recuento completo de parametros. El proyector multimodal se conserva en BF16. El autor indica que MTP (multi-token prediction) esta deshabilitado y ausente en la fuente, y recomienda desactivar la prediccion especulativa en los frontends que intenten habilitarla.

## Capacidades

- Generacion de texto conversacional multirround con plantilla Jinja (`--jinja` en llama.cpp).
- Comprension de imagenes mediante el proyector multimodal: descripcion de contenido, identificacion de objetos centrales y tareas de image-text-to-text.
- Razonamiento aritmetico y comprobaciones factuales basicas, segun las validaciones funcionales del autor.
- Generacion y validacion de JSON en pruebas nativas del runtime.
- Capacidad de codigo: el ejemplo de la model card plantea preguntas sobre construcciones de Python, aunque no se aportan evaluaciones formales.
- Soporte de tool calling / function calling: no evaluado por el autor de la cuantizacion.
- Comportamiento agente y razonamiento multi-paso: no evaluado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: los ejemplos de validacion se ejecutaron con thinking desactivado; no se documenta su comportamiento.

## Casos de uso

- Asistente conversacional local con imagenes: desplegando el GGUF Q6_K junto con el mmproj BF16 en llama.cpp, se puede construir un asistente que reciba capturas de pantalla o fotografias y responda en lenguaje natural, sin depender de APIs externas.
- Descripcion y catalogacion de imagenes en local: el modelo puede procesar imagenes con 1024 tokens visuales y generar descripciones del objeto central, util para etiquetado semiautomatico de archivos fotograficos en entornos con requisitos de privacidad.
- Prototipado de aplicaciones multimodales en estaciones de trabajo: con 23 GB de repositorio y un runtime llama.cpp reciente, un equipo con GPU de consumo de gama alta puede iterar sobre prompts y plantillas Jinja sin infraestructura cloud.
- Generacion de codigo asistida en el editor: el modelo responde a preguntas sobre construcciones de lenguajes (el ejemplo oficial usa Python) y puede integrarse mediante llama.cpp en plugins locales de autocompletado o explicacion de codigo.
- Validacion de pipelines de datos estructurados: las pruebas del autor incluyen comprobaciones de JSON, por lo que el modelo sirve para generar y verificar salidas estructuradas en procesos ETL o de extraccion de informacion.
- Evaluacion comparativa de cuantizaciones: al estar construido sin importance matrix y con verificacion SHA256 de los shards, es util como referencia para estudiar el impacto de Q6_K frente al BF16 original en tareas de aritmetica, JSON y vision.
- Despliegue en entornos air-gapped: al ser un unico GGUF mas el proyector, se puede distribuir en medios fisicos y ejecutar sin conexion, algo relevante en laboratorios o administraciones con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta validaciones funcionales cortas (aritmetica, JSON, comprobaciones factuales y pruebas de comprension de imagen con cuadrados y circulos de colores opuestos), ejecutadas con temperatura 0, semilla 42, contexto de 8192 tokens, maximo de 128 tokens generados, thinking desactivado y 1024 tokens de imagen. Indica explicitamente que no se evaluaron el alineamiento politico, las afirmaciones del creador, la precision en benchmarks, el uso de herramientas, el video ni la calidad en contexto completo.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 23,0 GB; el GGUF Q6_K de texto mas el proyector BF16 requieren aproximadamente 23-24 GB de VRAM para cargarse completos en GPU con `-ngl 99`.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 para carga completa; A100 40/80 GB y H100 para despliegues con margen de contexto y concurrencia. En GPUs de 16 GB o menos es necesario descargar capas a CPU.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas; en 16 GB funciona parcialmente con offload a RAM, con penalizacion de latencia.
- Opciones de despliegue: llama.cpp (runtime recomendado, commit de referencia `6414d5b0c9e5895473036c90c2bd305ce4ceccc4` probado en Apple Silicon), `llama-completion` para texto y `llama-mtmd-cli` para vision. No se mencionan otros backends en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo confirma que las pruebas se ejecutaron en Apple Silicon con ese commit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Chungulus/Arete-27B-Q6_K-GGUF | 26,9B en texto (27,4B con vision en la fuente) | no disponible | GGUF Q6_K, Apache 2.0 | Cuantizacion independiente sin importance matrix, proyector BF16 incluido |
| UraionLabs/Arete-27B-GGUF | 27B | no disponible | GGUF, licencia no indicada en los resultados | Otra cuantizacion comunitaria del mismo modelo base |
| bartowski/NousResearch_Arete-27B-GGUF | 27B | no disponible | GGUF con variantes Q4_K_L, Q6_K_S/M/L, etc. | Cuantizaciones de referencia de bartowski, con nomenclatura extendida de tamanos |
| NousResearch/Arete-27B (original) | 27,4B | no disponible | BF16, Apache 2.0 | Checkpoint fuente con vision integrada; requiere hardware de mayor capacidad |

## Limitaciones y advertencias

- El autor no ha evaluado el alineamiento politico ni de valores, las afirmaciones del creador sobre entrenamiento, la precision en benchmarks, el uso de herramientas, el video ni la calidad en contexto completo.
- No se garantiza que la calidad del modelo cuantizado sea identica a la del BF16 original; el autor declara explicitamente que no reclama calidad sin cambios.
- La cuantizacion se realizo sin dataset de calibracion ni importance matrix, lo que puede afectar a la fidelidad en algunas capas frente a cuantizaciones calibradas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones especificas de factualidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano.
- Longitud de contexto: no disponible; los ejemplos oficiales usan 8192 tokens, por lo que contextos mayores no estan validados.
- MTP y prediccion especulativa estan deshabilitados y deben desactivarse en los frontends que intenten habilitarlos.
- Requiere un runtime de llama.cpp reciente que soporte Qwen3.5/Qwen3.8; versiones antiguas pueden no cargar el modelo.
- Licencia Apache 2.0 con atribucion a Nous Research (modelo original) y Alibaba/Qwen (modelo base); deben conservarse los avisos de licencia al redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en produccion.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/Chungulus/Arete-27B-Q6_K-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Checkpoint fuente fijado: https://huggingface.co/NousResearch/Arete-27B/tree/108f0afbdcfaa1ceeda4a635004304dfff6d4da2
- Cuantizacion alternativa UraionLabs: https://huggingface.co/UraionLabs/Arete-27B-GGUF
- Cuantizacion alternativa bartowski: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
