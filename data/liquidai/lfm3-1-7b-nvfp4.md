# LiquidAI/LFM3-1.7B-NVFP4

## Resumen

LFM3-1.7B-NVFP4 es la variante cuantizada en NVFP4 de LFM3-1.7B, un modelo de generacion de texto de Liquid AI. Se distribuye como un checkpoint listo para inferencia en GPU, generado con las herramientas de cuantizacion de NVIDIA (ModelOpt), y mantiene intactas las decisiones de diseno del modelo original: atencion con ventana deslizante, RoPE y el mismo tokenizador. Su proposito es reducir el coste de memoria y aumentar el throughput en servidores de inferencia sin reentrenar el modelo base.

El punto tecnicamente diferencial es el esquema de cuantizacion: solo las capas feed-forward (pesos y activaciones) se almacenan en NVFP4 con bloques de 16 valores, es decir, un regimen W4A4. El resto de componentes —atencion, convoluciones, embeddings, cabeza de salida y normalizaciones— permanece en BF16. Este reparto es deliberado: las partes mas sensibles a la precision numerica quedan en coma flotante de 16 bits, mientras que el bloque de mayor volumen de parametros se comprime a 4 bits.

El modelo declarado es de 1,7B, pero el recuento real de parametros en los safetensors es de 1.162.570.496 (~1,16B), una discrepancia que conviene tener en cuenta al planificar presupuestos de memoria. El repositorio ocupa 1,8 GB y se publica bajo licencia LFM 1.0 (etiquetada como "other" en HuggingFace), con acceso libre a traves de la API y el playground de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje con capas de atencion de ventana deslizante y capas de convolucion; arquitectura completa no detallada en la informacion disponible (remite a la model card de LFM3-1.7B) |
| Parametros totales | 1.162.570.496 (~1,16B), segun safetensors; el nombre comercial indica 1,7B |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, bloques de 16 valores) en pesos y activaciones de las capas feed-forward; atencion, convoluciones, embeddings, cabeza de salida y normas en BF16. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (no se declara listado de idiomas) |
| Licencia | LFM 1.0 (identificador `lfm1.0`, etiqueta `license: other`) |
| Formato de pesos | safetensors (checkpoint NVFP4 empaquetado, generado con ModelOpt); repositorio de 1,8 GB |

## Arquitectura y entrenamiento

La model card de esta variante no describe la arquitectura completa y remite a la del modelo base. Lo que si se explicita es que el modelo combina capas de atencion con ventana deslizante y capas de convolucion, con ajustes de ventana deslizante y RoPE identicos a los del modelo original. La cuantizacion respeta esa estructura: se aplica unicamente al bloque feed-forward, dejando en BF16 la atencion, las convoluciones, los embeddings, la cabeza de salida y las normalizaciones. El resultado es un checkpoint mixto en el que solo las matrices de mayor tamano se comprimen a 4 bits.

Sobre el entrenamiento no hay informacion en los materiales proporcionados: no se indican el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla el proceso de calibracion usado por ModelOpt para determinar las escalas de cuantizacion, ni si se aplico alguna tecnica de recuperacion de precision (por ejemplo, busqueda de escalas o ajuste de capas sensibles) mas alla del reparto BF16/NVFP4 descrito.

## Capacidades

- Generacion de texto y uso conversacional: la etiqueta `conversational` y la pipeline `text-generation` confirman el caso de uso principal.
- Modo de razonamiento: el ejemplo de despliegue en SGLang utiliza el parser `qwen3-thinking`, lo que apunta a que el modelo emite cadenas de razonamiento separadas del texto final; no se detalla el formato exacto en la informacion disponible.
- Inferencia en GPU con precision de 4 bits en el bloque feed-forward, manteniendo el resto de la red en BF16.
- Compatibilidad con el ecosistema `transformers` (requiere `trust_remote_code` por el tag `custom_code`).
- Despliegue en SGLang mediante el soporte en revision del PR sgl-project/sglang#46858.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Idiomas: no se declara cobertura linguistica.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Despliegue de chat en GPU de gama media: al ocupar el checkpoint 1,8 GB y mantenerse las capas sensibles en BF16, el modelo permite servir conversaciones multi-turno en tarjetas con poca memoria, reservando el resto del presupuesto de VRAM para cache KV.
- Backend de bajo coste por token en produccion: la combinacion W4A4 en el feed-forward reduce el trafico de memoria en las matrices mas grandes, lo que se traduce en mayor throughput por GPU en servicios con muchas peticiones concurrentes.
- Prototipado rapido de asistentes conversacionales: la disponibilidad de endpoint en la API de Liquid AI y de un playground permite validar prompts y flujos antes de montar la infraestructura propia.
- Pipelines de generacion con razonamiento explicito: usando el parser de razonamiento en SGLang se puede separar la traza de pensamiento de la respuesta final, util para sistemas que necesitan auditar el razonamiento o filtrar la salida mostrada al usuario.
- Clasificacion y extraccion de informacion a escala: tareas de etiquetado, resumen corto o extraccion de campos sobre grandes volumenes de texto, donde un modelo de ~1,2B cuantizado ofrece un coste por documento muy inferior al de modelos de mayor tamano.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de NVFP4 frente al checkpoint BF16 en tareas propias, antes de decidir el formato de despliegue definitivo.
- Servicio en el borde o en entornos con GPU compartida: al necesitar poca memoria, encaja en instancias donde no es posible reservar una GPU completa para un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones de perplexidad frente al modelo base en BF16, por lo que no es posible cuantificar la degradacion introducida por la cuantizacion NVFP4.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,8 GB. Como estimacion propia (no publicada por el autor), un despliegue con contexto corto deberia manejarse en el entorno de 3-4 GB de VRAM, y con contextos largos o lotes grandes en el entorno de 6-8 GB, dependiendo del tamano de la cache KV y del backend.
- GPU recomendadas: para aprovechar NVFP4 de forma nativa se necesita hardware con soporte de 4 bits en los tensor cores (familia Blackwell: B100, B200, RTX 50, RTX Pro Blackwell). En GPUs Ampere, Ada u Hopper el checkpoint se ejecuta con conversiones a formatos soportados y parte de la ventaja de memoria y velocidad se pierde.
- GPU de consumo: si cabe en tarjetas de 8 GB o mas de VRAM en cualquier gama moderna; en GPUs sin soporte nativo de NVFP4 el rendimiento sera closer al de un modelo BF16 del mismo tamano.
- Opciones de despliegue: SGLang (soporte en revision en el PR sgl-project/sglang#46858, con el comando de ejemplo publicado), `transformers` con `trust_remote_code`, y la API alojada de Liquid AI. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; llama.cpp y Ollama requeririan una conversion a GGUF que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-NVFP4 | ~1,16B (safetensors) | No disponible | NVFP4 W4A4 en feed-forward + BF16 | LFM 1.0 | Objeto de esta ficha; 1,8 GB de repo |
| LFM3-1.7B (base) | ~1,16B | No disponible | BF16 | LFM 1.0 | Referencia de calidad; misma arquitectura y tokenizador |
| Otros modelos de ~1-2B (Qwen, Llama, etc.) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No se aportan datos comparativos de rendimiento |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de su categoria, ni de datos sobre otras variantes cuantizadas de LFM3 publicadas por Liquid AI.

## Limitaciones y advertencias

- La cuantizacion NVFP4 en pesos y activaciones del feed-forward introduce un error numerico que no se ha cuantificado publicamente; la degradacion en tareas sensibles a la precision (matematicas, codigo, razonamiento de varios pasos) puede ser mayor que en generacion abierta.
- El modelo base es de ~1,16B de parametros pese a la denominacion "1.7B"; las expectativas de capacidad deben ajustarse a ese orden de magnitud, con el riesgo de alucinacion propio de modelos pequenos.
- No se declara cobertura de idiomas; el rendimiento en castellano no esta documentado y requiere evaluacion propia.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en documentos largos sin medirlo.
- El soporte en SGLang esta en revision en el momento de la publicacion del repositorio (PR #46858); hasta que se publique una release, el despliegue en produccion con ese backend no es estable.
- Requiere `trust_remote_code` en `transformers`, lo que implica ejecutar codigo del repositorio; conviene revisar y fijar la revision concreta del modelo.
- El rendimiento de NVFP4 depende del hardware; en GPUs sin soporte nativo se pierden las ventajas y el checkpoint puede ser mas lento que la version BF16.
- Licencia LFM 1.0: no es una licencia permisiva tipo Apache 2.0. Es imprescindible revisar el fichero LICENSE del repositorio para verificar las condiciones de uso comercial, los umbrales de facturacion y las restricciones aplicables antes de desplegar en produccion.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad sin validacion previa.
- Sesgos conocidos: no documentados en la informacion disponible; al no publicarse la composicion del corpus de entrenamiento no es posible evaluar los sesgos de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola / API: https://console.liquid.ai/dashboard
- PR de soporte en SGLang: https://github.com/sgl-project/sglang/pull/46858
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4/blob/main/LICENSE
