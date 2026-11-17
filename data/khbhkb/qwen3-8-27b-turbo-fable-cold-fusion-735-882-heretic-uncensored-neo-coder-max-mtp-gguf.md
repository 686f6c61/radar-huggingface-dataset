# khbhkb/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B publicado por el usuario DavidAU (republicado en el repositorio khbhkb) y distribuido exclusivamente en formato GGUF cuantizado. El modelo parte del checkpoint base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU y combina tecnicas de multi-stage tuning y multi-state merge sobre datasets propios (Polar-STRICT y F451-STRICT), orientadas a razonamiento, generacion de codigo y escritura creativa sin restricciones de contenido.

La propuesta central del autor es doble: por un lado, un modelo "uncensored" y "abliterated" que elimina los mecanismos de rechazo del modelo original; por otro, una reduccion agresiva del consumo de tokens de razonamiento (denominada TURBO), que segun la model card rebaja entre la mitad y hasta una decima parte los tokens de "thinking" respecto a Qwen 3.8 27B estandar, manteniendo el nivel de detalle de la respuesta.

El modelo se publica con licencia Apache 2.0, soporta 16 idiomas y se distribuye como quants GGUF "regulares" y "MTP" (multi-token prediction), con variantes de imatrix dual (DI-MATRIX). El repositorio ocupa 389 GB e incluye tanto pesos bfloat16 como cuantizaciones. Esta ficha se basa exclusivamente en la informacion del repositorio y de la model card; las afirmaciones de rendimiento del autor no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.8 27B, segun la model card); soporte de MTP (multi-token prediction) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits; quants "regulares" y "MTP"; variantes con imatrix dual (DI-MATRIX); tambien pesos bfloat16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); bfloat16 segun tags de la model card |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura transformer decoder-only de aproximadamente 26,9B parametros (la designacion comercial es "27B"). La model card describe un proceso de entrenamiento en multiples etapas ("multi-stage tuned") y fusion de multiples estados ("multi-state merge"), realizado con Unsloth, sobre datasets propios del autor: DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion declarada es el metodo "COLD FUSION AND FABLE FUSION 711", orientado a corregir el exceso de razonamiento (over-thinking) y el consumo excesivo de tokens, y a reducir los tokens de "thinking" entre un factor de 2 y un factor de 10 frente a Qwen 3.8 27B. El repositorio incluye quants con soporte MTP (multi-token prediction), que en la practica puede acelerar la decodificacion mediante prediccion de varios tokens por paso. Tambien se menciona el uso de imatrix "dual" (DI-MATRIX) para mejorar la calidad de las cuantizaciones. No hay informacion verificable sobre la composicion del corpus, el numero de tokens vistos ni la metodologia de alineacion.

## Capacidades

- Generacion de texto general, razonamiento y modo "thinking" (la model card menciona tres modos de operacion, sin detallarlos).
- Generacion de codigo: el nombre del modelo incluye "NEO-CODER" y los tags indican fine-tuning orientado a tareas de programacion.
- Matematicas y razonamiento multi-paso, segun la orientacion del fine-tune.
- Escritura creativa y narrativa: ficcion, cuentos, roleplaying y "todos los generos", segun la model card.
- Capacidades multimodales: el pipeline declarado es image-text-to-text y hay tag "image-text-to-text", lo que sugiere entrada de imagen ademas de texto (no se detalla el alcance).
- Contenido sin censura: el modelo es "heretic/abliterated/uncensored", por lo que no aplica rechazos por contenido sensible.
- Multilingue: 16 idiomas (arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita).
- Soporte de tool calling: la model card afirma, citando la pestana "community", el "mejor rendimiento de tool calling registrado"; no hay datos verificables en el repositorio.
- Soporte de agentes y razonamiento multi-paso: implicito por el modo thinking y MTP, sin documentacion detallada.

## Casos de uso

- Escritura creativa y ficcion: el fine-tune esta explicitamente orientado a narrativa, roleplaying y "todos los generos"; con 27B parametros y cuantizacion 4 bits puede ejecutarse en equipos de consumo y generar texto largo con estilo marcado, reduciendo el coste por respuesta gracias al menor numero de tokens de razonamiento.
- Generacion de codigo en local: el etiquetado "NEO-CODER" y el soporte de tool calling permiten integrarlo en asistentes de programacion autoalojados, con la ventaja de que el modelo completo cabe en una unica GPU de 24 GB en 4 bits.
- Asistentes conversacionales sin filtros: para prototipos de roleplay, simulacion de personajes o investigacion sobre comportamiento de modelos sin rechazos, el caracter "abliterated" evita las negativas del modelo base.
- Razonamiento con bajo consumo de tokens: en pipelines donde el coste por token de salida es critico (generacion masiva, batch offline), la reduccion de tokens de "thinking" declarada por el autor (hasta 1/10) puede traducirse en menor latencia y coste, siempre que se valide la calidad en la tarea concreta.
- Traduccion y procesamiento multilingue: con 16 idiomas declarados, puede emplearse en tareas de traduccion o atencion al cliente multilingue, aunque la calidad por idioma no esta documentada.
- Experimentacion e investigacion: al publicarse en GGUF con licencia Apache 2.0, es util para estudiar efectos de abliteration, merges multi-etapa y decodificacion MTP sobre un modelo de ~27B en hardware de consumo.
- Prototipado de agentes con tool calling: la model card reivindica buen rendimiento en llamadas a herramientas; puede usarse en agentes locales que consulten APIs o ejecuten acciones, validando antes en produccion.

## Benchmarks y rendimiento

La model card cita resultados de ARC-C y ARC-E, pero no proporciona la tabla completa ni la metodologia. Los datos mencionados son:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | "144 puntos por encima de Qwen 3.8 27B", segun el autor |
| ARC-C (4 bits) | 719 | Superior a 718 en 4 bits, segun el autor |
| ARC-E (8 bits) | >880 | Zona "OpenAI, Claude y Gemini", segun el autor |

El autor afirma que el modelo supera a Qwen 3.8 27B, Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "los 7 benchmarks criticos", pero no publica la tabla con esos siete benchmarks en la informacion disponible. No se han publicado resultados verificables de MMLU, HumanEval o GSM8K en la informacion disponible; las cifras anteriores proceden unicamente de la model card y no han sido contrastadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: en cuantizacion de 4 bits, aproximadamente 16-20 GB para los pesos, mas overhead de contexto KV; en 8 bits, aproximadamente 28-32 GB; en bfloat16, unos 54 GB solo para pesos.
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 y 8 bits con contexto largo; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB, solo 4 bits con contexto corto) para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en 4 bits cabe en GPUs de 24 GB (RTX 3090/4090) y, con contexto reducido, en 16 GB; en 8 bits requiere GPUs profesionales o configuraciones multi-GPU.
- Despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el repo incluye variantes MTP que requieren soporte especifico del runtime para aprovechar la decodificacion multi-token. vLLM y TGI no estan confirmados para este repo (solo se distribuye GGUF).
- Latencia y throughput: no disponibles; la model card afirma que el modelo es "mas rapido" que Qwen 3.8 27B por el menor numero de tokens de thinking, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic NEO-CODER) | ~26,9B | no disponible | Apache 2.0 | GGUF, bfloat16 | Fine-tune uncensored con reduccion de thinking y MTP |
| Qwen 3.8 27B (base, segun la model card) | ~27B | no disponible | no disponible en la informacion | safetensors, GGUF | Modelo original; el autor afirma que este fine-tune lo supera en 7 benchmarks |
| Qwen3.6-35B-A3B (segun la model card) | 35B totales, 3B activos (MoE) | no disponible | no disponible en la informacion | no disponible | Alternativa MoE citada como referencia de comparacion por el autor |
| Qwen 3.6 27B / Qwen 3.5 27B (segun la model card) | ~27B | no disponible | no disponible en la informacion | no disponible | Generaciones anteriores citadas como referencia |

No se dispone de datos verificables de rendimiento de los modelos comparados en la informacion proporcionada; la comparativa se limita a lo que declara la model card.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": no aplica rechazos de contenido; puede generar material ofensivo, ilegal o danino sin filtro, lo que exige moderacion externa en produccion.
- Riesgo de alucinacion: inherente a los modelos de ~27B; no hay evaluacion publicada de factualidad y el fine-tune prioriza estilo y razonamiento sobre verificacion.
- Las cifras de benchmarks (ARC-C 735, ARC-E >880) proceden unicamente del autor y no han sido replicadas de forma independiente; deben tratarse con cautela.
- El proceso de abliteration y los merges multi-etapa pueden degradar capacidades del modelo base (instrucciones, seguridad, coherencia en tareas formales); no hay evaluacion independiente.
- No se documenta la longitud de contexto soportada; el rendimiento con contextos largos es desconocido.
- La calidad multilingue no esta evaluada por idioma; el entrenamiento parece centrado en ingles.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.
- Licencia Apache 2.0 declarada, pero el modelo deriva de Qwen 3.8; conviene verificar las condiciones de la licencia del modelo base antes de uso comercial.
- El pipeline declarado (image-text-to-text) sugiere capacidades multimodales, pero no se detalla su alcance ni calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khbhkb/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Datasets citados: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets y https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Variante Turbo Brilliance 27B Heretic: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
