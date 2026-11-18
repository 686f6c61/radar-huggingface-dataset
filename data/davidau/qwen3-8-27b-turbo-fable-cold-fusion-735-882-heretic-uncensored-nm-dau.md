# DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU es un ajuste fino (finetune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario DavidAU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado a conversacion, con licencia Apache 2.0 y un unico idioma declarado (ingles). El autor lo presenta como la "release #1" de una familia de variantes construidas sobre Qwen 3.8 27B, con un pipeline de ajuste por etapas que combina tecnicas que denomina "Cold Fusion", "GAIN Training" y "Multi-stage tuning", e incluye un proceso de "heretic" (eliminacion de rechazos y censura) que da lugar a la etiqueta "uncensored".

El modelo cuenta con 27.781.427.952 parametros segun los pesos en safetensors, lo que lo situa en la categoria de modelos densos de ~28B. El repositorio ocupa 55,6 GB, coherente con pesos en precision completa o semi-precision. La model card menciona de forma explicita mejoras en "reduccion de tokens de razonamiento" (de 1/2 a 1/10) y la existencia de modos de razonamiento e instruccion, aunque no se aportan especificaciones formales de longitud de contexto ni de arquitectura interna mas alla del tag `qwen3_5` en los metadatos.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de la practica de finetunes comunitarios sobre modelos Qwen, con tecnicas de "decensura" y ajuste multi-etapa; por otro, sirve de advertencia sobre la escasa verificabilidad de muchas de las afirmaciones de rendimiento en este tipo de publicaciones, donde los benchmarks citados son internos y no reproducibles de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.8-27B; tag de libreria `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta repo; el autor publica GGUFs (NEO-CODER MAX DiMatrix) en repos separados |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repos derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,8 mil millones de parametros. El autor no detalla la arquitectura interna (numero de capas, dimensiones, tipo de atencion, uso de RoPE, etc.) ni la composicion del dataset de ajuste. La model card describe un proceso de ajuste en multiples etapas ("Multi-stage tuning", "Cold Fusion", "GAIN Training") sobre el que no se aportan hiperparametros, numero de tokens de entrenamiento ni mezcla de datos. Se menciona la participacion de "Nightmedia" en las tres primeras etapas y el uso de finetunes propios y de terceros como material de partida, sin que se enumeren.

La innovacion declarada mas concreta es la reduccion de tokens de razonamiento (entre 1/2 y 1/10, segun el autor) y la existencia de modos de razonamiento e instruccion, ademas de un proceso de "heretic" destinado a reducir los rechazos del modelo base. No se documenta si hubo RLHF, DPO o un pipeline de preferencias, ni se especifican las tecnicas de decodificacion (especulativa, atencion lineal, etc.). Toda la informacion tecnica procede de la model card del autor y no ha sido verificada de forma independiente.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque no se detallan las capacidades de vision mas alla del tag.
- Razonamiento con modos diferenciados (el autor menciona "3 nuevos modos de razonamiento" de Qwen 3.8 y, en releases hermanas, 5 modos de razonamiento y 5 de instruccion).
- Reduccion de tokens de razonamiento declarada (1/2 a 1/10) para abaratar la inferencia en tareas de thinking.
- Generacion de codigo: el autor lo promociona bajo la etiqueta "NEO-CODER" en los GGUFs asociados.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo base declinaria.
- Soporte de tool calling / function calling: no disponible (no se documenta explicitamente).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explicitamente).
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Generacion creativa y ficcion: el ajuste "Fable" y la reduccion de censura permiten producir narrativa sin los rechazos tipicos del modelo base; adecuado para escritura de relatos, guiones y dialogos donde el modelo base aplicaria filtros.
- Asistente conversacional en ingles para prototipos: con 27,8B parametros y pesos safetensors, se puede desplegar en un endpoint compatible con la API de transformers para pruebas de producto en fase temprana.
- Analisis de imagenes con descripcion textual: el pipeline image-text-to-text permite construir flujos de captioning o respuesta a preguntas sobre imagenes, siempre que se validen las capacidades reales de vision del modelo base.
- Generacion de codigo en entornos controlados: la etiqueta "NEO-CODER" sugiere uso para autocompletado y explicacion de codigo; conviene validar con tests propios antes de integrarlo en CI/CD.
- Investigacion sobre alineacion y censura: util como objeto de estudio para comparar el comportamiento del modelo base frente al finetune "heretic" en tareas sensibles, midiendo tasas de rechazo y deriva de estilo.
- Experimentacion con reduccion de tokens de razonamiento: si las cifras del autor se confirman, sirve para estudiar el coste/calidad de cadenas de pensamiento mas cortas en tareas de matematicas y logica.
- Base para nuevos finetunes comunitarios: al ser Apache 2.0 y estar en safetensors, se puede reentrenar con LoRA o QLoRA sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona cifras internas (por ejemplo, "640 ARC-C" para un modelo hermano de 9B y afirmaciones genericas de superar a "todos los modelos Qwen 27B"), pero no se aportan tablas con MMLU, HumanEval, GSM8K ni comparaciones reproducibles para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 64-80 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB; cabe en una A100 40GB o en dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: en torno a 15-18 GB; cabe en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80GB o H100 para BF16; A100 40GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4-5 bits (GGUF) en tarjetas de 24 GB; en 8 bits requiere 24 GB con holgura limitada o configuraciones multi-GPU.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI para safetensors; llama.cpp y Ollama para los GGUFs publicados en repos derivados del autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,8B | no disponible | Apache 2.0 | Finetune comunitario "uncensored" con modos de razonamiento; benchmarks no verificados |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | Apache 2.0 | Modelo original, con filtros de seguridad y sin ajuste "heretic" |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (mismo autor) | ~27B | no disponible | Apache 2.0 | Release #2 del mismo autor; 5 modos de razonamiento y 5 de instruccion conmutables |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU (mismo autor) | ~27B | no disponible | Apache 2.0 | Generacion anterior de la familia; el autor reporta mas de 4 millones de descargas |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un finetune "uncensored" sobre datos no especificados, es esperable una mayor propension a generar contenido sesgado, ofensivo o inseguro.
- Riesgo de alucinacion: no cuantificado; las afirmaciones de rendimiento del autor no son verificables de forma independiente.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado por un modelo "uncensored" puede incumplir normativas sectoriales o de plataforma; la responsabilidad recae en el desplegador.
- Caveats para produccion: la model card contiene afirmaciones promocionales no contrastadas, enlaces a multiples releases y avisos de fechas futuras; conviene tratar el modelo como experimental y validar calidad, seguridad y estabilidad antes de cualquier despliegue.
- Trazabilidad: se desconoce la composicion exacta del dataset de ajuste y de los finetunes de terceros utilizados, lo que dificulta auditorias de licencia y de sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- GGUFs de la release #1: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Release #2 (TWIN-TURBO, fuente): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Release #2 (GGUFs): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Release #2 ULTRA HERETIC: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Release #3 (rama "from scratch"): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
