# positron-ai/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo Qwen de Alibaba. Con 35.951.822.704 parametros totales y un nombre que indica aproximadamente 3.000 millones de parametros activos por token, esta disenado para ofrecer un equilibrio entre capacidad de razonamiento y coste de inferencia, activando solo una fraccion de sus expertos en cada paso. El identificador de arquitectura en los metadatos es `qwen3_5_moe`, lo que lo situa en la familia Qwen 3.5/3.6 con enrutamiento disperso.

El repositorio analizado, `positron-ai/Qwen3.6-35B-A3B`, no es el modelo original: es un espejo (mirror) verificado byte a byte del repositorio oficial `Qwen/Qwen3.6-35B-A3B` en la revision `995ad96eacd98c81ed38be0c5b274b04031597b0`, publicado por Positron AI como fuente de descarga anonima y fijada para sus pipelines de integracion continua. La unica modificacion respecto al original es el archivo `README.md`; el resto de archivos conservan los mismos identificadores de objeto (sha256 de LFS y sha1 de git) que el upstream.

Su relevancia practica es doble: por un lado, permite acceder a los pesos de un MoE de ~36.000 millones de parametros con licencia Apache 2.0 sin depender de gating ni de limites de tasa del repositorio original; por otro, al tratarse de una copia verbatim, cualquier evaluacion o despliegue realizado sobre este espejo es atribuible al modelo upstream. No se han publicado en la informacion disponible datos de contexto, idiomas ni benchmarks propios de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer, identificada como `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | no disponible (el nombre del modelo sugiere ~3B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (26 shards, ~71,9 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos es `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos dispersa. El recuento real de parametros derivado de los safetensors es de 35.951.822.704, coherente con la denominacion "35B" del nombre. El sufijo "A3B" del identificador sugiere un regimen de aproximadamente 3.000 millones de parametros activos por token, tipico de los MoE con enrutamiento top-k sobre un subconjunto de expertos, aunque la informacion proporcionada no incluye el numero de expertos, el valor de k ni la distribucion de parametros entre atencion y capas feed-forward.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras etapas de alineacion, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento explicito). El repositorio incluye `preprocessor_config.json` y `video_preprocessor_config.json`, lo que indica soporte de entrada multimodal de imagen y video en el pipeline original, ademas de un `chat_template.jinja` de 7.764 bytes que define el formato de conversacion. Toda esta informacion proviene del upstream y no ha sido validada ni ampliada por el espejo.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante la plantilla de chat incluida (`chat_template.jinja`).
- Procesamiento de imagen y video: la presencia de `preprocessor_config.json` y `video_preprocessor_config.json` apunta a capacidades multimodales de entrada en el modelo upstream.
- Razonamiento y codigo: no disponible de forma explicita en la informacion proporcionada; el nombre de la familia Qwen sugiere competencia general, pero no hay confirmacion documental en este repositorio.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas en los metadatos.
- Modo de pensamiento (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Integracion continua con descarga anonima: el proposito declarado del repositorio es servir como fuente fijada y anonima para pipelines de CI, de modo que las pruebas automaticas no dependan del gating, los limites de tasa ni los cambios de revision del repositorio original de Qwen.
- Reproducibilidad de experimentos: al conservar los identificadores sha256 y sha1 de cada archivo, permite reconstruir exactamente el estado de los pesos en la revision `995ad96eacd98c81ed38be0c5b274b04031597b0`, lo que facilita auditorias y comparaciones entre ejecuciones.
- Despliegue autoalojado de un MoE de ~36B: con licencia Apache 2.0 y pesos en safetensors, puede servirse en infraestructura propia mediante frameworks compatibles con MoE, sin restricciones de uso comercial derivadas de la licencia.
- Procesamiento de documentos con componentes visuales: la presencia de preprocesadores de imagen y video sugiere su uso en tareas que combinen texto con capturas, graficos o fotogramas, siempre que se valide el comportamiento real del modelo upstream.
- Evaluacion comparativa de modelos abiertos: al ser un espejo verbatim, sirve como referencia estable para comparar un MoE de ~36B con alternativas densas o dispersas de tamano similar en tareas de generacion y razonamiento.
- Base para ajuste fino supervisado: los pesos en safetensors y la licencia permisiva permiten partir de este checkpoint para adaptaciones con LoRA o QLoRA sobre dominios concretos, sujeto a los requisitos de memoria que impone el numero total de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explicitamente que no reporta resultados de evaluacion y que ninguno debe atribuirse a este espejo; los datos oficiales, si existen, corresponderian al repositorio upstream `Qwen/Qwen3.6-35B-A3B`.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 72 GB solo para pesos (35,95 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; requiere multiples GPU o una GPU de 80 GB con margen limitado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 36 GB de pesos, viable en una A100 80 GB o H100 80 GB con holgura para contexto.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 18-20 GB de pesos, lo que permitiria su ejecucion en GPUs consumer de 24 GB (RTX 3090, RTX 4090) si existen pesos cuantizados compatibles; no se listan en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa; RTX 4090/3090 para cuantizacion agresiva.
- Opciones de despliegue: no se documentan en el repositorio; al ser pesos safetensors de un MoE, los candidatos habituales serian vLLM, TGI o SGLang para servido en GPU, y llama.cpp/Ollama solo si se generan conversiones GGUF, que no estan disponibles aqui.
- Latencia y throughput: no disponible; dependeran del numero real de parametros activos, del hardware y del backend, y no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este espejo) | 35,95B | no disponible (~3B segun nombre) | no disponible | Apache 2.0 | safetensors, espejo anonimo |
| Qwen/Qwen3.6-35B-A3B (upstream) | 35,95B | no disponible (~3B segun nombre) | no disponible | Apache 2.0 | safetensors, repositorio canonico |
| Alternativas de ~30-40B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparacion cuantitativa con modelos de la misma categoria. La unica comparacion posible con la informacion proporcionada es frente al repositorio upstream, del que este es copia byte a byte.

## Limitaciones y advertencias

- El repositorio no es el modelo canonico: es un espejo para CI. Cualquier cita, evaluacion o atribucion de resultados debe referirse a `Qwen/Qwen3.6-35B-A3B`, no a `positron-ai/Qwen3.6-35B-A3B`.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma en la informacion proporcionada; deben consultarse en la model card upstream (`README.upstream.md`).
- No se dispone de la longitud de contexto soportada, lo que impide planificar despliegues con requisitos de ventana larga sin verificacion adicional.
- No se listan tipos de cuantizacion ni variantes GGUF, AWQ o GPTQ; el uso en GPUs consumer requiere generar conversiones propias y validarlas.
- La licencia Apache 2.0 permite uso comercial, pero el espejo no ofrece garantias de mantenimiento ni de actualizacion ante cambios del upstream; la revision esta fijada y no se sincroniza automaticamente.
- El repositorio tiene un volumen de descargas muy bajo (20) y cero likes en el momento de la consulta, lo que no implica problemas tecnicos pero reduce la senal de validacion por parte de la comunidad.
- El tamano del repositorio (~71,9 GB) y el numero de shards (26) exigen espacio en disco y ancho de banda considerables para la descarga inicial.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/positron-ai/Qwen3.6-35B-A3B
- Repositorio upstream canonico: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Revision upstream fijada: `995ad96eacd98c81ed38be0c5b274b04031597b0`
- Model card upstream preservada en el espejo: `README.upstream.md`
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
