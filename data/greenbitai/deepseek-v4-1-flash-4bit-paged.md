# GreenBitAI/DeepSeek-V4.1-Flash-4bit-paged

## Resumen

GreenBitAI/DeepSeek-V4.1-Flash-4bit-paged es una compilacion cuantizada y con paginacion de expertos del modelo DeepSeek-V4.1-Flash, publicada por GreenBitAI. No es un modelo entrenado desde cero, sino una redistribucion de pesos derivada de `pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit`, a su vez una cuantizacion mixta 4/8 bits en formato MLX del checkpoint oficial de DeepSeek. Su proposito es permitir la ejecucion de un modelo de mezcla de expertos (MoE) de gran tamano en equipos con memoria y almacenamiento limitados, cargando solo los expertos necesarios en cada momento.

La innovacion principal es la paginacion de pesos: los expertos enrutados (`experts.bin`, 284,77 GiB) y las tablas "engram" (dos directorios de 51,50 GiB cada uno) residen en contenedores separados, de modo que la maquina carga bajo demanda lo que necesita en lugar de todo el conjunto. La decision entre mantener los pesos residentes en memoria o transmitirlos desde disco la toma el propio sistema a partir de la memoria disponible, sin necesidad de indicar un flag manualmente.

El modelo conserva sin cambios la cuantizacion, el tokenizador, la plantilla de chat y la licencia de la compilacion de origen. Incluye ademas la cabeza de borrador DSpark del propio DeepSeek para decodificacion especulativa, que esta desactivada por defecto. El resultado declarado por el autor es bit-identico al checkpoint original en las comprobaciones realizadas durante la construccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), base DeepSeek-V4.1-Flash; compilacion MLX |
| Parametros totales | 8.784.305.264 (segun safetensors; ver advertencias sobre la discrepancia con el tamano en disco) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits mixto (4/8 bits), heredado de `pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit`; presente etiqueta fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos residentes) + `experts.bin` (expertos enrutados) + tablas engram por capas + `mtp/` (cabeza de borrador) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a DeepSeek-V4.1-Flash, un transformer de mezcla de expertos (MoE) segun la etiqueta `mixture-of-experts` de la ficha. Esta publicacion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos deben consultarse en el modelo base. La contribucion de esta compilacion es de infrastructura de despliegue, no de entrenamiento: los pesos, el tokenizador, la plantilla de chat y la licencia son identicos a los de la compilacion MLX de origen.

La innovacion tecnica destacable es la organizacion de los pesos en contenedores paginables. Los pesos residentes ocupan `model.safetensors` (10,48 GiB); los expertos enrutados se aíslan en `experts.bin` (284,77 GiB); hay dos tablas engram de 51,50 GiB cada una (capas 1 y 14); y la cabeza de borrador `mtp/` ocupa 7,85 GiB. En total 406,10 GiB. El cargador decide en tiempo de ejecucion si los expertos caben en memoria (ruta estandar, velocidad nominal) o si deben transmitirse desde disco. Los flags `GBX_PAGING=off` y `GBX_ENGRAM=off` fuerzan el comportamiento residente. La decodificacion especulativa contra la cabeza DSpark se activa con `GBX_DEEPSEEK_MTP=on` y esta desactivada por defecto. El autor declara dos comprobaciones superadas: logits bit-identicos en 5 prompts hasta 160 tokens y verificacion capa a capa frente a la version residente (40 capas x 2 extracciones exactas, con un pico de 377,86 GiB).

## Capacidades

- Generacion de texto en el marco de un modelo de mezcla de expertos, segun la etiqueta `text-generation`.
- Decodificacion especulativa opcional mediante la cabeza de borrador DSpark, activable con `GBX_DEEPSEEK_MTP=on`.
- Carga selectiva de expertos con paginacion desde disco para ajustar el consumo de memoria.
- Uso de tablas engram por capas (capas 1 y 14 en esta compilacion).
- Ejecucion nativa sobre Apple Silicon a traves del framework MLX.
- No se dispone de informacion verificada sobre tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni modos de "pensamiento" en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos Apple Silicon con memoria unificada limitada: la paginacion de expertos permite ejecutar un MoE cuyo conjunto completo de pesos (406,10 GiB) no cabe en memoria, transmitiendo desde disco solo los expertos que se activan en cada token.
- Evaluacion y experimentacion con DeepSeek-V4.1-Flash en cuantizacion 4 bits: sirve como banco de pruebas para medir el impacto de la cuantizacion mixta sobre las salidas del modelo, dado que el autor reporta logits bit-identicos en las comprobaciones realizadas.
- Despliegue en estaciones de trabajo con almacenamiento NVMe rapido: al residir los expertos en `experts.bin`, un SSD de alta velocidad reduce la penalizacion de la transmision desde disco.
- Reproduccion de resultados frente al checkpoint original: la funcion de verificacion capa a capa y la comparacion de logits permiten validar la fidelidad de la compilacion en un pipeline propio.
- Investigacion sobre decodificacion especulativa: la inclusion de la cabeza DSpark (`mtp/`) permite experimentar con generacion especulativa en un entorno MLX.
- Prototipado de aplicaciones de generacion de texto en macOS: la integracion con la libreria `gbx-lm` y el cargador `load()` facilita incorporar el modelo a scripts de Python nativos del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comprobaciones internas de fidelidad (logits bit-identicos en 5 prompts hasta 160 tokens y verificacion capa a capa de 40 capas), sin cifras de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 436,0 GB (406,10 GiB desglosados en la model card). Se necesita espacio en disco suficiente para el conjunto completo, incluso con paginacion en tiempo de ejecucion.
- Memoria: los pesos residentes (`model.safetensors`) requieren unos 10,48 GiB. A ello se suma la memoria de trabajo para la capa en ejecucion, la cache KV y, si no hay paginacion, los expertos y tablas engram.
- Plataforma: el modelo esta orientado a Apple Silicon (etiqueta `apple-silicon`) y se ejecuta mediante el framework MLX, por lo que el hardware de referencia son equipos Mac con memoria unificada, como las familias M-series con configuraciones de memoria alta.
- Cabe en GPU de consumo: no aplica de forma directa, ya que el destino es Apple Silicon y MLX; no se documenta soporte para CUDA ni para GPU de consumo en esta compilacion.
- Opciones de despliegue: libreria `gbx-lm` con la funcion `gbx_lm.utils.load(...)`. Los flags `GBX_PAGING=off` y `GBX_ENGRAM=off` controlan la residencia de expertos y tablas engram. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta compilacion.
- Latencia y throughput: no disponibles. La model card indica que, cuando los pesos caben, se ejecuta "a velocidad nominal", y que si no caben se transmiten desde disco, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GreenBitAI/DeepSeek-V4.1-Flash-4bit-paged | 8.784.305.264 segun safetensors (conjunto en disco de 406,10 GiB) | no disponible | 4/8 bits mixto | MIT | HuggingFace, libreria gbx-lm |
| pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit | no disponible | no disponible | 4/8 bits mixto | no disponible en la informacion proporcionada | HuggingFace |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | no disponible | no disponible | sin cuantizar | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento que permitan comparar objetivamente esta compilacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Riesgo de alucinacion: no evaluado en la informacion proporcionada. Al no haber benchmarks publicados, no puede estimarse su fiabilidad en tareas de razonamiento o conocimiento factual.
- Discrepancia de parametros: safetensors declara 8.784.305.264 parametros, una cifra incoherente con un conjunto de pesos de 406,10 GiB en cuantizacion 4/8 bits. Es probable que la cifra refleje solo una parte del modelo, por lo que no debe tomarse como el total real de parametros.
- Idiomas: no se documenta la lista de idiomas soportados; se desconoce el comportamiento multilingue de esta compilacion.
- Restricciones de licencia: la compilacion se publica bajo licencia MIT, pero conserva la licencia del modelo base y de la compilacion de origen. Debe verificarse la licencia de `deepseek-ai/DeepSeek-V4.1-Flash` antes de un uso comercial, ya que la model card indica que la licencia no cambia respecto al origen.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no se ofrece una ruta documentada para hardware CUDA ni para otros entornos.
- Rendimiento dependiente del disco: cuando los expertos no caben en memoria, la velocidad queda ligada al ancho de banda del almacenamiento, lo que puede degradar fuertemente la latencia.
- Estado de validacion: las pruebas de fidelidad se hicieron en el momento de la construccion contra el checkpoint de origen, que ya no estaba presente despues; no constituyen una garantia permanente para todas las entradas.
- Madurez: el repositorio registra 0 descargas y 0 "likes", sin adopcion comunitaria documentada.
- Dependencia de herramienta: utiliza la libreria `gbx-lm`, con menor difusion que otros runtimes de inferencia, lo que puede limitar el soporte y la integracion.

## Enlaces

- HuggingFace: https://huggingface.co/GreenBitAI/DeepSeek-V4.1-Flash-4bit-paged
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Compilacion de origen: https://huggingface.co/pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web proporcionados (los resultados devueltos no guardan relacion con el modelo).
