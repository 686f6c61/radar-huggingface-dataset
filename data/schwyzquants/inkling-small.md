# schwyzquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines (publicado en el repositorio `schwyzquants/Inkling-Small` como espejo del oficial `thinkingmachines/Inkling-Small`). Acepta entradas de texto, imagen y audio, y genera exclusivamente texto. Está pensado para desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG).

Técnicamente es un transformer autoregresivo decoder-only de 42 capas con una columna vertebral de mezcla dispersa de expertos (MoE): cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales. El modelo es multimodal de forma nativa: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido.

La model card declara 276B parámetros totales y 12B activos, mientras que los pesos en safetensors del repositorio suman 265.956.439.090 parámetros (unos 266B). El repositorio ocupa 531,9 GB. Se distribuye bajo licencia Apache 2.0 con pesos abiertos, lo que lo sitúa como una alternativa open weights a modelos MoE multimodales de escala comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only multimodal con MoE dispersa (42 capas) |
| Parametros totales | 265.956.439.090 (~266B) segun safetensors del repositorio; la model card declara 276B |
| Parametros activos | 12B (6 de 256 expertos enrutados + 2 expertos compartidos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (soportes declarados por el autor); no se han publicado pesos GGUF en la informacion disponible |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas; soporta multiples lenguajes de programacion |
| Licencia | Apache 2.0 (con politica de uso aceptable de Thinking Machines enlazada en la model card) |
| Formato de pesos | safetensors; libreria transformers (etiqueta `inkling_mm_model`) |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only de 42 capas con una columna vertebral feed-forward de mezcla dispersa de expertos. El enrutamiento es disperso: cada token activa 6 de 256 expertos más 2 expertos compartidos que se ejecutan siempre, lo que da lugar a 12B parámetros activos sobre un total de 266B-276B. La atención es híbrida, alternando capas locales y globales, un patrón habitual para reducir el coste cuadrático en secuencias largas manteniendo capacidad de recuperación a largo alcance. La multimodalidad es nativa: un codificador jerárquico de parches procesa las imágenes y una codificación de tokens discretos procesa el audio; ambas modalidades se proyectan al mismo espacio oculto que el texto y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas, de terceros y de generación o aumento sintético. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento. Tampoco detalla innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes con entrada basada en píxeles; el autor recomienda dimensiones de imagen entre 40px y 4096px por lado para un rendimiento óptimo.
- Comprensión de audio en formato WAV a 16kHz, con duración recomendada inferior a 2 minutos.
- Salida exclusivamente textual (UTF-8); el modelo no genera imagen ni audio.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Uso multilingüe, con inglés como idioma principal y capacidades generales en otros idiomas.
- Orientado a sistemas agénticos y de uso de herramientas, asistentes de código, chatbots y RAG, segun declara el autor.
- Compatible con endpoints (`endpoints_compatible`) y con las librerias SGLang, vLLM, TokenSpeed, Unsloth y transformers.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar capturas de pantalla o fotografías enviadas por el usuario junto con texto de conversación, manteniendo un único decoder conjunto para ambas modalidades y evitando pipelines separados de visión y lenguaje.
- Asistentes de código en producción: dado su soporte declarado de uso de herramientas y su entrenamiento en múltiples lenguajes de programación, puede integrarse en pipelines de CI/CD para revisión de cambios, generación de tests o explicación de errores de compilación.
- Análisis de documentos escaneados y formularios: el codificador jerárquico de parches permite procesar imágenes de documentos de hasta 4096px por lado, útil para extracción de campos y resumen estructurado.
- Transcripción y análisis de reuniones: con entradas WAV a 16kHz de hasta 2 minutos por fragmento, se puede segmentar audio y generar actas, resúmenes o listas de tareas en texto.
- Sistemas RAG multimodales: indexación de bases de conocimiento con texto e imágenes, donde el modelo responde consultas combinando contexto recuperado de ambas modalidades en un mismo espacio latente.
- Agentes multi-paso: al declararse apto para sistemas agénticos y uso de herramientas, puede encadenar llamadas a APIs, consultas a bases de datos y razonamiento intermedio antes de emitir la respuesta final.
- Moderación y clasificación de contenido en aplicaciones con vídeo o audio: la cobertura de entrenamiento declarada incluye vídeo, aunque la modalidad de entrada publicada es texto, imagen y audio.
- Despliegue de chatbots generalistas autoalojados: con pesos abiertos y licencia Apache 2.0, es posible ajustarlo con datos propios y servirlo en infraestructura propia mediante vLLM o SGLang.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una tabla de evaluación categorizada (modelos de pesos abiertos frente a pesos cerrados) en la que se mencionan como comparadores Inkling-Small, Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, entre otros, pero el extracto disponible está truncado y no contiene los valores numéricos de ninguna métrica (MMLU, HumanEval, GSM8K ni otras). No se deben inferir cifras a partir de esa tabla.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones derivadas del número de parámetros y del tamaño del repositorio; no proceden de mediciones publicadas por el autor.

- Pesos en BF16: aproximadamente 532 GB (coincide con el tamaño de repositorio de 531,9 GB). Requiere al menos 7 GPU de 80 GB o 8 para dejar margen de caché KV.
- Pesos en NVFP4 (4 bits): aproximadamente 133 GB, más overhead de activaciones y caché KV. Requiere un mínimo de 2 GPU de 80 GB para los pesos, con margen recomendable de 3-4 GPU.
- GPU recomendadas: H100 80GB, H200 141GB, B200 o A100 80GB en configuraciones multi-GPU con NVLink. Para NVFP4 se recomienda hardware Blackwell, que soporta el formato de forma nativa.
- No cabe en GPU de consumo. Con 266B parámetros totales y 12B activos, el cuello de botella es la memoria de pesos, no el cómputo, por lo que una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son insuficientes incluso en 4 bits.
- Opciones de despliegue soportadas segun el autor: SGLang, vLLM, TokenSpeed, Unsloth y transformers/Hugging Face. No hay recetas publicadas para llama.cpp, Ollama, TGI ni LM Studio en la información disponible, ni pesos GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con 12B parámetros activos sobre 266B totales, el throughput esperado es sustancialmente mayor que el de un modelo denso del mismo tamaño, pero condicionado por el ancho de banda de memoria necesario para leer los expertos activados.

## Comparativa con modelos similares

Los únicos comparadores nombrados en la información disponible provienen de la tabla de evaluación del propio autor. No se dispone de sus especificaciones verificadas dentro de este material, por lo que la mayoría de celdas quedan como no disponibles.

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small | ~266B (safetensors) / 276B (model card) | 12B | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace (BF16 y NVFP4) |
| Qwen3.5 397B-A17B | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |

## Limitaciones y advertencias

- Discrepancia en el recuento de parámetros: los safetensors suman 265.956.439.090 parámetros mientras que la model card declara 276B. Conviene verificar la configuración real antes de dimensionar infraestructura.
- El repositorio analizado pertenece al usuario `schwyzquants`, no a Thinking Machines, y no tiene descargas ni likes. La model card apunta a los repositorios oficiales `thinkingmachines/Inkling-Small` y `thinkingmachines/Inkling-Small-NVFP4`, por lo que esta copia debe tratarse como un espejo no verificado.
- La fecha de creación registrada (2026-09-14) es posterior a la fecha actual y no se corresponde con un lanzamiento verificable; conviene comprobar la procedencia de los pesos antes de usarlos en producción.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado por el autor en la información disponible.
- El audio se limita a WAV a 16kHz y a fragmentos de menos de 2 minutos para un rendimiento óptimo; no se documenta manejo de audio más largo ni de otros códecs.
- Las imágenes deben estar entre 40px y 4096px por lado; fuera de ese rango el rendimiento puede degradarse.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas largas.
- La model card enlaza una política de uso aceptable de Thinking Machines junto a la licencia Apache 2.0; conviene revisar si esa política impone restricciones adicionales al uso comercial más allá de los términos de Apache 2.0.
- No se documentan sesgos evaluados, composición demográfica del dataset ni resultados de seguridad, pese a que el pipeline de curación menciona filtrado con objetivos de seguridad.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los resultados obtenidos corresponden a reseñas de un producto antivirus sin relación alguna con Inkling-Small. No se ha podido verificar información externa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schwyzquants/Inkling-Small
- Pesos BF16 oficiales: https://huggingface.co/thinkingmachines/Inkling-Small
- Pesos NVFP4 oficiales: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentacion de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
