# DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF es un ajuste fino (fine-tune) multi-etapa del modelo Qwen3.8-27B, desarrollado por el usuario DavidAU y distribuido en formato GGUF. El modelo parte de una base Qwen 3.8 de 27B de parametros (26.895.998.464 parametros reales segun safetensors) y ha sido sometido a un proceso de entrenamiento en multiples fases, fusion de estados y tecnicas de "abliteration" parcial, con el objetivo declarado de reducir el consumo de tokens de razonamiento entre un 50% y un 95% manteniendo la calidad de salida. Se distribuye como un repositorio de cuantizaciones GGUF (regulares y "MTP") pensado para ejecucion en hardware de consumo.

El modelo se presenta como una alternativa "desinhibida" (uncensored) y orientada a escritura creativa, roleplay, ficcion y generacion de codigo, con soporte declarado para 16 idiomas y una ventana de contexto no especificada en la informacion disponible. La licencia es Apache 2.0. La relevancia actual del modelo radica en su propuesta de control dinamico del razonamiento: cinco modos de razonamiento y cinco modos de instruccion conmutables en tiempo de ejecucion, dos de ellos ("Spoon" y "Einstein") declarados como nuevos, y la posibilidad de operar con cero tokens de razonamiento en los modos de instruccion.

El autor afirma que el modelo supera a la base Qwen 3.8 27B en siete benchmarks criticos y que alcanza 709 puntos en ARC-C en cuantizacion de 8 bits y 701 en 4 bits. No obstante, estas cifras proceden exclusivamente de la model card del autor y no se han verificado de forma independiente en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8 27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF "MTP" (Neo y NEO MAX); se mencionan Q4KS, 4 bits y 8 bits; no se detalla la lista completa |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card; la metadata de Hugging Face solo lista en y zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 911 GB con multiples cuantizaciones); el modelo base no cuantizado se distribuye aparte |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su origen en Qwen 3.8 27B, un transformer denso de aproximadamente 27.000 millones de parametros. El autor describe el proceso de creacion como un "multi-stage tune" con "multi-state merge", empleando los metodos que denomina "COLD FUSION" y "FABLE FUSION 711", ademas de tecnicas de "heretic" y "abliteration" para reducir el rechazo de contenido. El entrenamiento se realizo con Unsloth y utilizo los datasets DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica mas destacada es el control del razonamiento: el modelo expone cinco modos de razonamiento y cinco modos de instruccion conmutables en tiempo de ejecucion mediante API, de forma directa o a nivel de mensaje en el chat. Los modos de instruccion operan con cero tokens de razonamiento. El autor afirma que el modelo consume entre la mitad y una veinteava parte de los tokens de pensamiento de la base Qwen 3.8 27B, manteniendo el detalle de salida. Tambien se menciona el uso de "imatrix" en algunas cuantizaciones y la existencia de variantes "MTP" (multi-token prediction), aunque no se detalla su implementacion.

## Capacidades

- Generacion de texto y razonamiento en cinco modos conmutables, con dos modos adicionales denominados "Spoon" y "Einstein".
- Modos de instruccion sin tokens de razonamiento (cinco modos), utiles para respuestas directas y de baja latencia.
- Generacion de codigo y tareas de programacion (etiqueta "coder" en la model card).
- Escritura creativa, ficcion, narrativa de todos los generos y roleplay, con enfasis declarado en coherencia estructural y arcos de personaje en textos largos.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque no se detalla el mecanismo de vision.
- Capacidades multilingues declaradas para 16 idiomas, con metadata de Hugging Face limitada a ingles y chino.
- Conversacion multi-turno.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Escritura creativa de larga extension: el modelo declara mantener arcos de personaje, foreshadowing y estructura narrativa en textos de hasta 80.000 palabras, lo que lo hace adecuado para novelas por entregas o generacion de borradores extensos con continuidad argumental.
- Roleplay y ficcion interactiva: los modos de razonamiento conmutables y el ajuste orientado a ficcion permiten sesiones de roleplay con control del nivel de deliberacion del modelo, reduciendo coste por turno en los modos de instruccion.
- Generacion de codigo asistida: la etiqueta "coder" y la posibilidad de desactivar el razonamiento permiten integrar el modelo en asistentes de autocompletado o revision de codigo donde la latencia importa mas que la deliberacion.
- Redaccion y reescritura de contenido editorial: con cuantizacion de 4 bits puede ejecutarse en hardware de consumo, lo que facilita su uso en estaciones de trabajo individuales para tareas de redaccion, correccion de estilo y adaptacion de tono.
- Prototipado de asistentes conversacionales multilingues: los 16 idiomas declarados permiten construir demos de atencion al cliente o chatbot en varios mercados sin depender de APIs cerradas, siempre que se valide la calidad real por idioma.
- Experimentacion en investigacion sobre control del razonamiento: los cinco modos de razonamiento e instruccion conmutables por API convierten al modelo en una plataforma para estudiar el equilibrio entre tokens de pensamiento, latencia y calidad de respuesta.
- Generacion de descripciones de imagen a texto en prototipos multimodales, dado el pipeline image-text-to-text declarado, aunque la informacion sobre el soporte real de vision es escasa.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no se han verificado de forma independiente:

| Benchmark | Resultado declarado |
|---|---|
| ARC-C (8 bits) | 709 |
| ARC-C (4 bits) | 701 |
| Comparacion con Qwen 3.8 27B base | +118 puntos en ARC-C (segun el autor) |
| Comparacion con Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Superior en los 7 benchmarks criticos (segun el autor) |

No se publican resultados detallados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. Las cifras de ARC-C no incluyen la metodologia de evaluacion, el numero de shots ni el harness utilizado, por lo que deben tratarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Para un modelo denso de 26,9B parametros, una cuantizacion de 4 bits requiere del orden de 15-18 GB de VRAM (estimacion orientativa, no confirmada por el autor); 8 bits requeriria aproximadamente 28-30 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) podria ejecutar cuantizaciones de 4 bits; para 8 bits serian necesarias A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: probablemente en RTX 4090, RTX 3090 y GPUs con 24 GB o mas en cuantizacion de 4 bits; no confirmado para modelos inferiores.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI solo si se dispone de los pesos en safetensors del modelo base. El autor menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles. El autor afirma que el modelo es mas rapido que la base Qwen 3.8 27B gracias a la reduccion de tokens de razonamiento, pero no aporta mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO (este modelo) | 26,9B | no disponible | Apache 2.0 | Fine-tune con modos de razonamiento conmutables; ARC-C 709 declarado en 8 bits |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (presumible) | Referencia del autor; ARC-C 118 puntos inferior segun la model card |
| Qwen 3.6 27B | ~27B | no disponible | no disponible | El autor afirma superarlo en 7 benchmarks |
| Qwen3.6-35B-A3B | 35B totales (MoE) | no disponible | no disponible | El autor afirma superarlo en 7 benchmarks |

Los datos de comparacion proceden unicamente de las afirmaciones del autor; no se dispone de evaluaciones independientes ni de especificaciones detalladas de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y parcialmente "abliterated": presenta filtros de seguridad reducidos, lo que implica riesgo de generar contenido inapropiado, ofensivo o danino sin las salvaguardas habituales de los modelos alineados.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; los fine-tunes orientados a creatividad y roleplay suelen priorizar fluidez sobre precision factica.
- Los benchmarks declarados (ARC-C 709/701) no han sido verificados de forma independiente y carecen de metodologia detallada; deben tomarse como afirmaciones del autor.
- Discrepancia en idiomas: la model card declara 16 idiomas, pero la metadata de Hugging Face solo lista ingles y chino; la calidad real en el resto de idiomas no esta documentada.
- Longitud de contexto no especificada, lo que impide planificar casos de uso que dependan de ventanas largas.
- El repositorio ocupa 911 GB, lo que exige planificacion de almacenamiento y descarga selectiva de la cuantizacion deseada.
- El soporte de vision (pipeline image-text-to-text) no esta documentado en detalle; no debe asumirse un rendimiento multimodal equiparable al de modelos nativos de vision.
- No se documenta soporte de tool calling ni de agentes; verificar antes de integrarlo en pipelines que dependan de function calling.
- Licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" traslada al desplegador la responsabilidad legal y etica sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo base (no cuantizado): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Variante ULTRA-HERETIC: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
