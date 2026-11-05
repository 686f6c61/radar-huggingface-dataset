# Luuc/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B publicado por el usuario Luuc (derivado del trabajo previo de DavidAU) y distribuido exclusivamente en formato GGUF. El modelo parte de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y se presenta como un ajuste orientado a reducir el consumo de tokens de razonamiento (entre 1/2 y 1/10 segun el autor) manteniendo la calidad de salida, ademas de incorporar tecnicas de "abliteration"/"heretic" que eliminan parte de los rechazos de seguridad del modelo base.

La propuesta tecnica se apoya en dos metodos de entrenamiento propietarios descritos por el autor: COLD FUSION (combinacion de una tecnica llamada "GAIN" con los entrenadores de Unsloth) y Fable Fusion 711. Segun la model card, el modelo supera al Qwen 3.8 27B base en siete benchmarks criticos y alcanza 735 en ARC-C en cuantizacion de 8 bits y 719 en 4 bits, cifras que el autor situa en la "zona de inteligencia" de modelos cerrados como OpenAI, Claude y Gemini. Estas afirmaciones no vienen acompanadas de metodologia reproducible en la informacion disponible.

El repositorio incluye cuantizaciones GGUF "regulares" y "MTP" (Multi-Token Prediction) con doble imatrix, con un tamano total de 389 GB. El pipeline declarado es `image-text-to-text`, aunque no se detalla en la informacion disponible que componente multimodal incorpora el modelo. La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8); detalles especificos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (variantes "regular" y "MTP" con doble imatrix); no se detalla la lista completa de quants |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con multiples quants) |

## Arquitectura y entrenamiento

El modelo es un fine-tune multi-etapa y multi-merge sobre un transformer denso de ~27B parametros de la familia Qwen 3.8. El autor describe dos tecnicas de entrenamiento: COLD FUSION, que combina un metodo propio llamado "GAIN" (ajuste dinamico del entrenamiento por muestra en tiempo real segun aprende el modelo) con los entrenadores de Unsloth, y Fable Fusion 711. Segun la model card, el entrenamiento se realizo en hardware de consumo mediante Unsloth y emplea los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`.

El objetivo declarado del ajuste es triple: aumentar la inteligencia general y la resolucion de problemas, reducir el bloque de pensamiento a entre 1/2 y 1/10 de su tamano original (mediana de reduccion ~2/3) y reformatear dicho bloque, y acelerar la generacion de tokens, especialmente mediante MTP (Multi-Token Prediction). El autor afirma explicitamente que no se hizo "benchmaxing". No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. El componente "heretic/abliterated/uncensored" indica que se eliminaron direcciones de rechazo del modelo base, aunque no se documenta la metodologia concreta.

## Capacidades

- Generacion de texto conversacional y creativo, con enfasis declarado en escritura de ficcion, relato y roleplaying.
- Razonamiento con modo "thinking" en tres modos de operacion, con bloques de pensamiento reducidos respecto al base.
- Generacion de codigo (etiqueta "coder" y "NEO-CODER" en el nombre), sin benchmarks de codigo publicados en la informacion disponible.
- Capacidades multimodales declaradas via pipeline `image-text-to-text`, sin detalle del codificador visual ni de las tareas soportadas.
- Soporte multilingue limitado a ingles y chino.
- El autor menciona en la model card un rendimiento "de tool calling mas fuerte jamas registrado", atribuido a experiencias de la comunidad; no se aportan datos verificables.
- Salidas sin filtros de rechazo en amplias categorias de contenido (modelo "uncensored"/"abliterated").
- Generacion acelerada mediante variantes MTP (Multi-Token Prediction).

## Casos de uso

- Escritura creativa y ficcion por encargo: el modelo esta ajustado especificamente para generacion narrativa de alta detalle en generos diversos, con ejemplos en la model card de relato negro y detectivesco; adecuado para pipelines de generacion de contenido editorial.
- Roleplaying y narrativa interactiva: el ajuste "uncensored" y el enfasis en personajes permiten dialogos multi-turno sin los rechazos tipicos del modelo base, util en videojuegos narrativos y plataformas de rol.
- Prototipado de asistentes conversacionales en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo mediante llama.cpp u Ollama, sin dependencia de APIs externas.
- Generacion de codigo en entornos con requisitos de privacidad: la variante "NEO-CODER" y el soporte GGUF permiten desplegar un asistente de codigo on-premise, aunque no hay benchmarks que respalden su calidad frente a modelos dedicados.
- Reduccion de coste en inferencia con razonamiento: el recorte de tokens de pensamiento (mediana ~2/3) lo hace adecuado para tareas de razonamiento en produccion donde el coste por token de salida es critico.
- Experimentacion en investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio de tecnicas de eliminacion de rechazos y de ajuste multi-etapa sobre hardware de consumo.
- Traduccion y contenido bilingue ingles-chino: dentro de los dos idiomas declarados, puede emplearse en tareas de generacion y adaptacion de contenido.

## Benchmarks y rendimiento

Los unicos datos aportados en la informacion disponible son los de ARC (AI2 Reasoning Challenge) citados en la model card:

| Benchmark | Cuantizacion | Resultado declarado |
|---|---|---|
| ARC-C | 8 bits | 735 |
| ARC-C | 4 bits | 719 |
| ARC-E | 8 bits | > 880 |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "siete benchmarks criticos", pero no se enumeran dichos benchmarks ni sus valores en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion Q4, aproximadamente 16-18 GB para los ~27B parametros mas overhead de contexto; en Q8, en torno a 28-30 GB. Estimaciones calculadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para quants Q4; A100 40 GB, H100 o RTX 6000 Ada para Q8. El autor afirma que el modelo fue entrenado en hardware de consumo.
- Cabe en GPU de consumo: si, en quants de 4 bits en GPUs con 24 GB o mas; los quants de 8 bits requieren GPU profesional o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; las variantes MTP requieren soporte de Multi-Token Prediction en el runtime, no disponible de forma generalizada.
- Latencia y throughput: no disponibles. El autor afirma mejoras de velocidad por la reduccion de tokens de pensamiento y el uso de MTP, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO...) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Fine-tune "uncensored" multi-etapa, ARC-C 735 (8 bits) segun autor |
| Qwen 3.8 27B (base) | ~27 B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo original; el autor afirma que este fine-tune lo supera en 7 benchmarks |
| Qwen3.6-35B-A3B | 35 B totales (MoE) | no disponible | Apache 2.0 | safetensors/GGUF | Referencia citada por el autor como superada en benchmarks |
| Qwen 3.6 27B / Qwen 3.5 27B | ~27 B | no disponible | Apache 2.0 | safetensors/GGUF | Referencias citadas por el autor como superadas en benchmarks |

Los datos de contexto y benchmarks de los modelos comparados no estan disponibles en la informacion proporcionada; las afirmaciones de superioridad proceden unicamente de la model card del autor.

## Limitaciones y advertencias

- Las cifras de benchmarks (ARC-C 735, ARC-E > 880) proceden exclusivamente de la model card y no incluyen metodologia, prompts ni scripts de evaluacion reproducibles; deben tratarse con cautela.
- Modelo "abliterated"/"uncensored": se han eliminado direcciones de rechazo, por lo que puede generar contenido danino, ofensivo o ilegal sin filtros; requiere moderacion externa en produccion.
- Riesgo elevado de alucinacion en tareas factuales, agravado por el ajuste orientado a creatividad y por la reduccion del razonamiento explicito.
- Solo soporta ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto maximo no documentado; no se debe asumir una ventana larga sin verificacion empirica.
- El pipeline declarado es `image-text-to-text`, pero no se documenta el componente multimodal ni sus capacidades reales; tratar la vision como no verificada.
- Repositorio de 389 GB con multiples quants: la descarga completa es inviable en la mayoria de entornos; debe seleccionarse un unico archivo GGUF.
- Cero descargas y cero likes en el momento de la consulta, con fecha de creacion y actualizacion identicas: no hay validacion de la comunidad ni historial de mantenimiento.
- Las variantes MTP requieren soporte especifico del runtime de inferencia; sin el, deben usarse los quants "regulares".
- Aunque la licencia es Apache 2.0, la cadena de modelos base y datasets intermedios conviene revisarse antes de un uso comercial, dado que el modelo deriva de un fine-tune de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luuc/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Trabajo previo citado (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
