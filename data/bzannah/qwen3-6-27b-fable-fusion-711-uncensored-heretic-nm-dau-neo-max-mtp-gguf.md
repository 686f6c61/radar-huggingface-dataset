# bzannah/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

El modelo `Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF` es un fine-tune multi-etapa del modelo Qwen3.6-27B de Alibaba, desarrollado por bzannah en colaboración con DavidAU, Nightmedia, TeichAI, armand0e y trohrbaugh. Se distribuye como GGUF cuantizado (variantes regulares y MTP) y está diseñado para mejorar el seguimiento de instrucciones, el razonamiento y la capacidad de resolución de problemas del modelo base, manteniendo intactas sus capacidades originales, incluida la visión.

La relevancia de este modelo radica en que, según la model card, es el primer fine-tune de este tamaño que supera la puntuación de 700 en ARC-C tanto en cuantización de 8 bits como de 4 bits, un umbral que la comunidad asocia con modelos propietarios de OpenAI, Claude y Gemini. El modelo supera al Qwen3.6-27B base en 6 de 7 benchmarks y al Qwen3.6-35B-A3B en los 7, según los datos publicados. Incluye un enfoque "uncensored" (heretic) mediante técnicas de abliteration, lo que elimina ciertos filtros de seguridad del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.6-27B) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada en la model card; hereda la del modelo base Qwen3.6-27B |
| Tipos de cuantizacion | GGUF NEO IMATRIX (4-bit, 8-bit y otros niveles; variantes regulares y MTP con tensor de salida en 16-bit y tensores MTP en Q8_0) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.6-27B, un modelo denso de 27 B parametros con capacidades multimodales (texto e imagen). El proceso de entrenamiento es descrito como un fine-tune multi-etapa, multi-fine-tune y multi-stage merge: se aplicaron varias etapas de ajuste fino sobre datasets propios (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets), combinadas con trazas de razonamiento de Claude Opus y GPT-5 (Polaris), y un proceso de "heretic" (abliteration) para eliminar restricciones de seguridad del modelo base.

La metodologia fue validada primero en modelos Qwen3.5 de 9 B antes de aplicarse al modelo de 27 B. El entrenamiento se realizo con Unsloth en hardware de consumo. Los cuantizados NEO IMATRIX mejoran la precision de la cuantizacion entre un 2 % y un 4 % respecto a GGUF convencionales, y el tensor de salida se mantiene en precision completa (16-bit) en todos los quants. Las variantes MTP (multi-token prediction) incluyen tensores dedicados en Q8_0 para acelerar la generacion.

## Capacidades

- Generacion de texto y razonamiento: mejora en el seguimiento de instrucciones y en la resolucion de problemas frente al modelo base.
- Razonamiento y modo "thinking": mantiene las capacidades de razonamiento explicito de Qwen3.6, con mejoras en el proceso de pensamiento.
- Vision: soporta entrada de imagenes (pipeline image-text-to-text), heredado del modelo base.
- Generacion de codigo: el modelo base Qwen3.6 destaca en tareas de programacion; el fine-tune preserva estas capacidades.
- Escritura creativa: aunque no fue el objetivo principal, el modelo muestra habilidades notables en narrativa, ficcion y roleplaying, como se ejemplifica en la model card.
- Sin censura (uncensored/heretic): mediante abliteration se eliminan los rechazos tipicos de seguridad, permitiendo generar contenido que el modelo base bloquearia.
- Multilingue: soporta ingles y chino.
- Compatibilidad con herramientas: no se especifica soporte explicito de tool calling en la model card, pero al basarse en Qwen3.6 es probable que lo herede; no se confirma.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede integrarse en pipelines de desarrollo para generar codigo, explicar fragmentos y depurar errores, aprovechando la mejora en razonamiento y la ventana de contexto del modelo base.
- Analisis de documentos con vision: al soportar entrada de imagenes, puede procesar capturas de pantalla, diagramas o documentos escaneados para extraer informacion y responder preguntas sobre ellos.
- Creacion de contenido narrativo: escritura de ficcion, dialogos y roleplaying de alta calidad, con un estilo descrito como "visceral" y "sin concesiones", util para guiones, novelas o juegos de rol.
- Investigacion y razonamiento multistep: tareas que requieren cadenas de pensamiento largas, como resumen de articulos cientificos, analisis comparativo o planificacion de proyectos, donde la mejora en ARC-C indica mayor capacidad de razonamiento abstracto.
- Chatbots sin restricciones de contenido: para entornos controlados donde se necesita un asistente que no rechace temas sensibles (por ejemplo, investigacion academica sobre temas controvertidos o simulaciones de personajes).
- Educacion y tutoria: explicacion de conceptos complejos en matematicas, fisica o filosofia, con capacidad de adaptar el nivel de detalle y seguir preguntas de seguimiento.

## Benchmarks y rendimiento

La model card no proporciona una tabla numerica detallada de benchmarks, pero indica los siguientes resultados cualitativos:

- ARC-C de 711 tanto en cuantizacion de 8 bits como de 4 bits, superando el umbral de 700 que la comunidad asocia con modelos propietarios de alto rendimiento.
- Supera al Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el septimo.
- Supera al Qwen3.6-35B-A3B en los 7 benchmarks evaluados.
- Un modelo hermano de 9 B (Qwen3.5-9B-The-Defiant-Fable) supera los 640 en ARC-C en 4 y 8 bits, lo que sugiere consistencia en la metodologia.

No se publican resultados numericos especificos para MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 26,9 B parametros; con cuantizacion GGUF de 4 bits ocupa aproximadamente 15-16 GB de VRAM, y en 8 bits alrededor de 28-30 GB.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar el quants de 4 bits; para 8 bits se recomienda una GPU con 32 GB o mas (A100 40 GB, H100, o multiples GPUs).
- En hardware de consumo, el quants de 4 bits cabe en GPUs de 24 GB como la RTX 3090/4090; el de 8 bits requiere tarjetas profesionales o configuraciones con mas VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se proporcionan datos especificos; al ser un modelo denso de 27 B, la velocidad de generacion dependera del hardware y del quants utilizado. Las variantes MTP pueden acelerar la decodificacion al predecir multiples tokens por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C (4-bit) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 26,9 B | no especificado | 711 | Apache-2.0 | GGUF en HF |
| Qwen3.6-27B (base) | 26,9 B | no especificado | inferior (6/7 benchmarks) | Apache-2.0 | pesos originales |
| Qwen3.6-35B-A3B | 35 B (3 B activos, MoE) | no especificado | inferior (7/7 benchmarks) | Apache-2.0 | pesos originales |
| Qwen3.5-9B-The-Defiant-Fable | 9 B | no especificado | >640 | Apache-2.0 | GGUF en HF |

El modelo se posiciona como una alternativa de alto rendimiento en el rango de 27 B, superando al base y a un modelo MoE mas grande en las metricas evaluadas. Su principal diferencia frente a alternativas propietarias es la licencia Apache-2.0, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Contenido sin censura: el proceso de abliteration elimina los mecanismos de rechazo del modelo, por lo que puede generar contenido ofensivo, violento, sexual o ilegal. No es adecuado para despliegues publicos sin moderacion externa.
- Idiomas limitados: solo se garantiza soporte para ingles y chino; el rendimiento en otros idiomas no esta validado.
- Riesgo de alucinacion: como todos los modelos generativos, puede producir informacion falsa o inventada, especialmente en tareas factuales.
- Datos de entrenamiento parcialmente desconocidos: los datasets utilizados (Polar-STRICT, F451-STRICT) no estan documentados en detalle, lo que dificulta evaluar sesgos o calidad de los datos.
- Benchmarks limitados: solo se reporta ARC-C; no hay datos publicos de MMLU, HumanEval, GSM8K u otras metricas estandar, lo que impide una comparacion completa con otros modelos.
- Compatibilidad de vision: aunque el pipeline es image-text-to-text, no se especifica la resolucion de imagen soportada ni el rendimiento en tareas visuales complejas.
- Rendimiento MTP: la model card advierte que el rendimiento de las variantes MTP se degrada con temperaturas superiores a 1 o con repeticion penalizada alta; hay que ajustar los parametros de generacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bzannah/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (antes de cuantizacion): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Modelo hermano de 40 B (Eleanor): https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo hermano de 40 B (Grand Intelligence): https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo de 9 B relacionado: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Datasets utilizados: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets y https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
