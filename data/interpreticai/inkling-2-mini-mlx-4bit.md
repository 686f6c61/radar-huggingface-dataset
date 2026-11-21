# InterpreticAI/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo multimodal Inkling 2 Mini, desarrollado por Thinking Machines Lab y redistribuido por Interpretic AI. Se trata de un modelo de mezcla de expertos (MoE) con arquitectura "looped" (capas centrales que se recorren varias veces), 26.388.559.360 parametros totales y 3,4 mil millones de parametros activos por token (5,4 mil millones efectivos al pasar tres veces por las capas centrales del bucle). Acepta entrada de texto e imagen y declara una ventana de contexto de hasta 1 millon de tokens.

La relevancia de esta ficha concreta reside en el empaquetado para Apple Silicon: es una cuantizacion sin modificaciones del checkpoint oficial (revision `1fb4134`) pensada para ejecutarse en MLX, oMLX y LM Studio sobre Macs con 32 GB o mas de memoria unificada. El repositorio ocupa 17,3 GB y mantiene la torre de vision en bfloat16, los expertos enrutados en su cuantizacion NVFP4 original y el resto de pesos (atencion, embeddings y salida) en 4 bits con grupo de 64.

El modelo base es un modelo de razonamiento ("thinking model") que escribe su cadena de pensamiento antes de la respuesta, y esta publicado bajo licencia Apache 2.0. La cuantizacion es reciente y el soporte de su arquitectura en los runtimes es nuevo, por lo que requiere builds recientes de mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas centrales "looped" (mezcla de expertos multimodal) |
| Parametros totales | 26.388.559.360 |
| Parametros activos | 3,4 B por token (5,4 B efectivos con tres pasadas por el bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | 4 bits (grupo de 64) en atencion, embeddings y salida; expertos enrutados en NVFP4 original; torre de vision en bfloat16 |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; se han hecho comprobaciones puntuales en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 17,3 GB en total), formato MLX |

## Arquitectura y entrenamiento

Inkling 2 Mini es un modelo de mezcla de expertos con una innovacion estructural: capas centrales que se recorren en bucle ("looped middle layers"). El modelo tiene 26,4 mil millones de parametros totales pero solo activa 3,4 mil millones por token en una pasada; al ejecutar tres pasadas por las capas centrales del bucle, el computo efectivo asciende a 5,4 mil millones de parametros activos. Esta construccion busca aumentar la profundidad efectiva y la capacidad de razonamiento sin disparar el coste por token. Es multimodal: incorpora una torre de vision que procesa imagenes junto al texto.

En esta cuantizacion concreta no se modifican los pesos respecto al checkpoint oficial: los expertos enrutados conservan la cuantizacion NVFP4 del modelo original, mientras que atencion, embeddings y capa de salida se han cuantizado a 4 bits con tamano de grupo 64, y la torre de vision se mantiene en bfloat16. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en el material proporcionado. El modelo es de tipo "thinking": genera razonamiento explicito antes de la respuesta final y requiere un cliente o servidor de chat que aplique su plantilla de conversacion.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito (cadena de razonamiento previa a la respuesta).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`); la torre de vision se conserva en bfloat16.
- Procesamiento de contexto muy largo, hasta 1 millon de tokens declarados.
- Capacidades de codigo: la model card cita comprobaciones puntuales en codigo como parte de sus verificaciones de calidad.
- Soporte multilingue parcial verificado de forma puntual en ingles y chino; no hay lista oficial de idiomas.
- Capacidades de tool calling y uso como agente: no disponibles en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Razonamiento asistido en local sobre Apple Silicon: un desarrollador puede ejecutar el modelo en un Mac de 32 GB o mas con MLX u LM Studio y obtener cadenas de razonamiento completas sin enviar datos a la nube, lo que resulta adecuado para prototipado y trabajo con informacion sensible.
- Analisis de documentos extensos: la ventana de hasta 1 millon de tokens permite cargar contratos, expedientes o bases de codigo completas y formular preguntas sobre el conjunto sin trocear el material en fragmentos.
- Asistencia a la programacion en estaciones de trabajo Mac: con soporte de codigo verificado de forma puntual y un coste de 3,4 B parametros activos por token, el modelo puede integrarse en editores o scripts de revision de codigo que corran en local.
- Procesamiento de imagenes y texto combinados: al aceptar entrada image-text-to-text, sirve para tareas de descripcion de capturas, extraccion de datos de documentos escaneados o respuesta a preguntas sobre figuras, siempre que se use un runtime con soporte de vision (mlx-vlm), que en esta cuantizacion no ha sido probado por el autor.
- Experimentacion en investigacion de MoE con bucles: la arquitectura looped con expertos enrutados en NVFP4 hace de este checkpoint un banco de pruebas util para estudiar el equilibrio entre parametros totales y activos en hardware de consumo.
- Evaluacion comparativa de cuantizaciones: al existir variantes GGUF Q4_K_M e IQ3_XXS del mismo modelo del mismo autor, permite medir en una misma maquina el impacto de distintos esquemas de cuantizacion sobre la calidad del razonamiento.
- Despliegue de agentes de razonamiento en entornos con requisitos de privacidad: el formato MLX y la licencia Apache 2.0 facilitan su integracion en flujos internos donde no se permite salida de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones de calidad realizadas son "spot checks" en ingles, chino, codigo y una imagen, y no un benchmark completo.

## Requisitos de hardware

- VRAM/memoria unificada: el autor indica que funciona en un Mac con 32 GB de memoria unificada o mas; el repositorio pesa 17,3 GB.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (requisito declarado). No se especifican modelos concretos de chip.
- GPU de consumo NVIDIA: no disponible; esta cuantizacion es especifica de MLX para Apple Silicon. Para GPUs NVIDIA existen las variantes GGUF del mismo autor.
- Opciones de despliegue: MLX, oMLX y LM Studio. El soporte de esta arquitectura en mlx-lm esta en el PR ml-explore/mlx-lm#2086 y aun no forma parte de una release, por lo que hay que instalar el build desde esa rama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato/runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4bit (esta ficha) | 26,4 B | 3,4 B (5,4 B efectivos) | Hasta 1 M tokens | Apache 2.0 | MLX 4 bits, Apple Silicon |
| Inkling-2-Mini-GGUF Q4_K_M (InterpreticAI) | 26,4 B | 3,4 B (5,4 B efectivos) | Hasta 1 M tokens | Apache 2.0 | GGUF, llama.cpp |
| Inkling-2-Mini-IQ3_XXS-GGUF (InterpreticAI) | 26,4 B | 3,4 B (5,4 B efectivos) | Hasta 1 M tokens | Apache 2.0 | GGUF IQ3_XXS, llama.cpp |
| Inkling-2-Mini (original, Thinking Machines Lab) | 26,4 B | 3,4 B (5,4 B efectivos) | Hasta 1 M tokens | Apache 2.0 | Pesos originales |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada; las unicas alternativas documentadas son las otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Modelo de razonamiento: escribe su cadena de pensamiento antes de responder, lo que incrementa la latencia y el consumo de tokens de salida; debe usarse con una plantilla de chat adecuada.
- Soporte de runtime inmaduro: la arquitectura es nueva en todos los runtimes; en mlx-lm solo funciona con el build del PR #2086, no incluido en ninguna release.
- Vision no probada en esta cuantizacion: el autor solo ha probado entrada de texto; la entrada de imagen mediante mlx-vlm no ha sido verificada.
- Verificacion de calidad limitada: las comprobaciones son puntuales (ingles, chino, codigo y una imagen), no un benchmark exhaustivo; el rendimiento real en tareas complejas no esta cuantificado.
- Riesgo de alucinacion: no hay datos especificos publicados para este modelo; como en cualquier LLM, debe validarse la salida en produccion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Idiomas: no hay lista oficial de idiomas soportados; la cobertura mas alla de ingles y chino no esta verificada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base remite a la politica de uso aceptable de Thinking Machines Lab, que debe consultarse antes de desplegarlo.
- Requisito de hardware restrictivo: solo Apple Silicon con 32 GB o mas de memoria unificada para esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF
- Variante GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Sitio del autor de la cuantizacion: https://interpretic.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
