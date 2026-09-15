# PINKSAWTOOTH/Qwopus3.8-27B-Flash-oQ4e-mtp-mlx

## Resumen

Qwopus3.8-27B-Flash-oQ4e-mtp-mlx es una cuantizacion MLX en formato oQ4e del modelo Jackrong/Qwopus3.8-27B-Flash, publicada por el usuario PINKSAWTOOTH. Se trata de un derivado orientado exclusivamente a inferencia local sobre Apple Silicon, que conserva la cabeza MTP (multi-token prediction) del modelo original con 29 tensores MTP retenidos, lo que permite, si el runtime lo soporta, decodificacion especulativa con el backend Lightning MTP de oMLX.

El checkpoint tiene 27.781.427.952 parametros (unos 27,78 mil millones) y se distribuye en 4 shards de safetensors con un peso total de 16,97 GB (15,81 GiB). La cuantizacion usa el esquema MLX affine con 4 bits por defecto y group size 64, complementado con 187 overrides de modulo en 5 bits y group size 64 para preservar precision en capas sensibles. El modelo base declarado por el autor del fine-tuning es Qwen/Qwen3.8-27B, y los identificadores de arquitectura conservados son los de Qwen `qwen3_5`.

Su relevancia es acotada pero concreta: es una de las pocas publicaciones de este modelo que mantiene la cabeza MTP tras la cuantizacion, algo que la mayoria de conversiones a 4 bits descartan. Para desarrolladores que trabajan en macOS con chips de la serie M, representa una via practica de ejecutar un modelo de ~28B en memoria unificada sin renunciar al mecanismo de speculative decoding nativo. Cabe senalar que el repositorio no incluye ninguna evaluacion de rendimiento propia y que, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (identificadores de arquitectura Qwen `qwen3_5`; conserva tensores de vision no validados) |
| Parametros totales | 27.781.427.952 (~27,78 mil millones), segun safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit por defecto, group size 64; 187 overrides de modulo en 5-bit, group size 64; el checkpoint contiene ademas tensores en coma flotante |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache-2.0 (segun lo declarado por el modelo de origen) |
| Formato de pesos | safetensors (MLX), 4 shards, 16,97 GB / 15,81 GiB |

## Arquitectura y entrenamiento

La ficha no documenta la arquitectura interna mas alla de los identificadores `qwen3_5` heredados del runtime de Qwen y del hecho de que se trata de un transformer con una capa MTP adicional. No se especifica si el modelo original emplea mezcla de expertos (MoE), atencion lineal u otra variante, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. Toda esa informacion corresponde al modelo upstream y no esta reproducida en este repositorio.

La innovacion tecnica de esta publicacion es puramente de compresion y preservacion estructural. La conversion se realizo con oMLX y el preset oQ4e, con calibracion sobre `oqe_code_multilingual`: 128 muestras procesadas con longitud de secuencia 512, 504 entradas de imatrix generadas y correcciones aplicadas a 503 modulos. La unica entrada de imatrix ausente es `language_model.lm_head`, que por tanto no recibio correccion de calibracion. El proceso conserva una capa MTP completa con 29 tensores, lo que en teoria habilita decodificacion especulativa multi-token; no obstante, el propio autor advierte que la ejecucion de MTP depende del soporte y de la configuracion del runtime, y que retener la cabeza no basta para activarlo en cualquier aplicacion MLX. Antes de publicar se validaron las cabeceras de los 4 shards, sus offsets y los 2.209 nombres de tensores contra `model.safetensors.index.json`, con sumas SHA-256 disponibles en el repositorio.

## Capacidades

- Generacion de texto conversacional en modo chat, segun el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Decodificacion especulativa mediante la cabeza MTP retenida, limitada a runtimes que la soporten (en las pruebas locales, oMLX 0.7.0.dev2 con backend Lightning MTP).
- Capacidades multilingues en ingles, chino, espanol, ruso y japones, segun los codigos de idioma declarados.
- Generacion de codigo: la calibracion se realizo sobre un corpus multilingue de codigo (`oqe_code_multilingual`), aunque el modelo upstream arrastra un problema de indentacion en Python segun su propia model card.
- Presencia de tensores de vision y ficheros de procesador en el checkpoint, sin que la inferencia de imagen o video haya sido validada en esta entrega.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion publicada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta en formato MLX y ocupa 16,97 GB, por lo que puede cargarse integramente en memoria unificada de un equipo con 32 GB o mas, sin necesidad de GPU dedicada ni de conexion a servicios externos.
- Asistente de programacion en local: dado que la calibracion se hizo sobre un corpus de codigo multilingue, es un candidato razonable para autocompletado y explicacion de codigo dentro de un IDE en macOS; conviene verificar el comportamiento en tareas de indentacion de Python, donde el modelo de origen presenta fallos conocidos.
- Generacion acelerada por speculative decoding: en configuraciones de oMLX con `model_type_override: "llm"` y `mtp_enabled: true`, la cabeza MTP retenida permite plantear decodificacion especulativa para reducir la latencia por token en generacion larga.
- Chat multilingue en produccion interna: con cobertura declarada de ingles, chino, espanol, ruso y japones, encaja en equipos distribuidos que necesitan un unico punto de inferencia para cinco idiomas.
- Procesamiento de datos sensibles sin salida a la nube: al ejecutarse en local, es apto para entornos con requisitos de confidencialidad donde el texto no puede enviarse a una API externa.
- Experimentacion academica sobre cuantizacion: el repositorio incluye el informe de imatrix y los checksums, lo que lo convierte en un material util para estudiar el impacto de mezclas 4-bit/5-bit y de la conservacion de cabezas auxiliares tras la cuantizacion.
- Base para fine-tuning ligero en local: al estar bajo Apache-2.0 y en safetensors, puede servir como punto de partida para adaptaciones con LoRA en flujos MLX, siempre que el runtime soporte el reentrenamiento sobre pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ningun benchmark de inferencia o calidad como parte de la preparacion de esta subida, y que los resultados reportados para el modelo upstream u otras cuantizaciones no son mediciones de esta version oQ4e en MLX. El unico dato de validacion tecnica es estructural: 2.209 nombres de tensores verificados contra el indice, 4 cabeceras de shard comprobadas con sus offsets y sumas SHA-256 publicadas.

## Requisitos de hardware

- Memoria necesaria para los pesos: 16,97 GB (15,81 GiB) en disco; en memoria, esa cifra mas la cache KV y el overhead del runtime, por lo que en la practica conviene disponer de al menos 20-22 GB libres de memoria unificada.
- Plataforma: Apple Silicon exclusivamente. El formato MLX no es directamente ejecutable en GPU NVIDIA o AMD; requiere un Mac con chip de la serie M.
- Equipos recomendados: Mac con 32 GB o mas de memoria unificada (M1/M2/M3/M4 Pro, Max o Ultra). Un Mac de 24 GB puede cargar el modelo, pero con muy poco margen para contexto largo; los equipos de 16 GB no son viables.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este checkpoint en su formato actual. Seria necesaria una conversion previa a otro formato (por ejemplo GGUF o pesos sin cuantizar).
- Opciones de despliegue: oMLX (ruta validada por el autor, con `model_type_override: "llm"` y `mtp_enabled: true` para MTP) y el ecosistema MLX/mlx-lm. vLLM, TGI o llama.cpp no son utilizables directamente con estos pesos tal como se distribuyen.
- Latencia y throughput estimados: no disponible. No hay cifras de tokens por segundo publicadas para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PINKSAWTOOTH/Qwopus3.8-27B-Flash-oQ4e-mtp-mlx | ~27,78 mil millones | MLX safetensors, 4-bit con overrides en 5-bit, MTP retenido | no disponible | Apache-2.0 | Publicado en HuggingFace, 0 descargas |
| Jackrong/Qwopus3.8-27B-Flash (modelo de origen) | ~27,78 mil millones (referencia) | Pesos completos, no cuantizado | no disponible | Apache-2.0 | Publicado en HuggingFace |
| Qwen/Qwen3.8-27B (base declarada del fine-tuning) | ~27,8 mil millones (referencia) | Pesos completos, no cuantizado | no disponible | no disponible en esta busqueda | Publicado en HuggingFace |
| Otras cuantizaciones del mismo modelo base | ~27,78 mil millones | GGUF, AWQ, MLX u otros segun autor | no disponible | Depende del autor | No localizadas en la busqueda realizada |

La busqueda web asociada a esta ficha no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a paginas corporativas de Microsoft, sin ninguna conexion con Qwopus3.8 ni con Qwen. Por tanto, no se dispone de datos comparativos de rendimiento frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- No existe ninguna evaluacion de calidad o rendimiento para este checkpoint concreto. Cualquier cifra atribuida al modelo upstream no es extrapolable a esta cuantizacion.
- El modelo acumula 0 descargas y 0 likes, por lo que no ha pasado por validacion de la comunidad ni por pruebas independientes.
- La cuantizacion a 4 bits con group size 64 implica perdida de precision inevitable respecto a los pesos originales; los 187 modulos en 5 bits mitigan el efecto, pero no lo eliminan.
- `language_model.lm_head` no recibio correccion de imatrix por ausencia de entrada en el informe de calibracion, lo que puede afectar a la distribucion de probabilidad de salida.
- La calibracion se realizo exclusivamente con `oqe_code_multilingual` (128 muestras de 512 tokens), un corpus orientado a codigo. El comportamiento en otros dominios (legal, medico, narrativa) no esta caracterizado y puede degradarse mas de lo habitual.
- El modelo upstream presenta un problema de indentacion en tareas de codigo Python, segun su propia model card. Este defecto se hereda.
- Aunque el checkpoint conserva tensores de vision y la configuracion del procesador, la inferencia de imagen y video no fue validada. La unica ruta de uso documentada es la generacion de texto.
- La decodificacion especulativa MTP no es automatica: depende del runtime. Sin el ajuste `mtp_enabled: true` y soporte del backend Lightning MTP, la cabeza retenida no aporta ninguna ventaja.
- La ventana de contexto no esta documentada en esta ficha; no debe asumirse un valor concreto sin consultar la configuracion del repositorio.
- La licencia declarada es Apache-2.0, pero se trata de un derivado de un fine-tuning que a su vez deriva de un modelo base de Qwen; conviene revisar los terminos del modelo base antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no evaluado en esta entrega. No hay estudios de sesgo ni metricas de factualidad para esta version.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PINKSAWTOOTH/Qwopus3.8-27B-Flash-oQ4e-mtp-mlx
- Modelo de origen (fine-tuning): https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Modelo base declarado del fine-tuning: https://huggingface.co/Qwen/Qwen3.8-27B
- Informe de calibracion imatrix (en el repositorio): https://huggingface.co/PINKSAWTOOTH/Qwopus3.8-27B-Flash-oQ4e-mtp-mlx/blob/main/oq_imatrix_report.json
- Sumas de verificacion SHA-256 (en el repositorio): https://huggingface.co/PINKSAWTOOTH/Qwopus3.8-27B-Flash-oQ4e-mtp-mlx/blob/main/SHA256SUMS
- Licencia Apache-2.0 (en el repositorio): https://huggingface.co/PINKSAWTOOTH/Qwopus3.8-27B-Flash-oQ4e-mtp-mlx/blob/main/LICENSE
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.
