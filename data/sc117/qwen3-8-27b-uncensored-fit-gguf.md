# SC117/Qwen3.8-27B-Uncensored-FIT-GGUF

## Resumen

Qwen3.8-27B-Uncensored-FIT-GGUF es una colección de cuantizaciones GGUF del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario SC117. El modelo base es una variante "uncensored" (sin ajuste de rechazo) de la familia Qwen3.8, con 26.895.998.464 parámetros totales según los pesos en safetensors del modelo de referencia. Esta ficha describe la distribución cuantizada, no el modelo original.

La característica diferencial del repositorio es el uso de FIT-GGUF, una herramienta de código abierto que actúa como capa de planificación determinista a nivel de tensor sobre los presets de cuantización de llama.cpp. En lugar de ofrecer únicamente presets cerrados (Q4_K_M, Q5_K_M, etc.), FIT-GGUF parte del preset más grande que cabe en un presupuesto de bytes solicitado y emplea el espacio restante en mejoras deterministas de precisión por tensor. El repositorio publica catorce niveles ("tiers") de cuantización continua entre 7 y 13,5 GiB.

El resultado es una distribución orientada a despliegue local con control fino del tamaño del fichero: cada archivo tiene exactamente el tamaño predicho y cada nivel ha sido medido. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino. El repositorio ocupa 154,9 GB y acumula 14.070 descargas y 25 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con 14 tiers continuos entre 7 y 13,5 GiB, generados con presets de llama.cpp y upgrades de precision por tensor de FIT-GGUF; incluye ficheros con matriz de importancia (imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria gguf, compatible con llama-cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.8 con 26,9 mil millones de parametros, segun el recuento real de safetensors. La model card del repositorio cuantizado no documenta la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion, uso de GQA o MLA), ni los datos de entrenamiento del modelo original: numero de tokens, composicion del corpus, fases de RLHF/DPO o tecnicas de alineacion. Tampoco se detalla el proceso de "uncensoring" aplicado por orcarouter sobre el modelo Qwen3.8 original.

La innovacion tecnica documentada se situa en la capa de cuantizacion. FIT-GGUF es una herramienta determinista que planifica la asignacion de bits por tensor: selecciona el preset de llama.cpp mas grande que cabe en el presupuesto de bytes solicitado y distribuye los bytes restantes en mejoras de precision sobre tensores concretos. La model card indica que se elimino la cabeza MTP (multi-token prediction) del modelo base durante el proceso, y que cada tier ha sido validado con metricas de divergencia KL y de coincidencia de top-1 ("same-top"). El autor declara verificacion "zero-byte" del tamano de cada fichero, es decir, que el tamano real coincide exactamente con el predicho. La propia model card advierte que FIT no reclama un optimo universal de calidad, sino un control preciso del tamano.

## Capacidades

- Generacion de texto conversacional en ingles y chino, segun los idiomas declarados.
- Generacion de texto sin ajuste de rechazo (variante "uncensored"), orientada a contenido que los modelos alineados convencionalmente rechazan.
- Compatibilidad con el ecosistema llama.cpp y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Cuantizacion con matriz de importancia (imatrix) para preservar calidad en tasas de compresion altas.
- Seleccion flexible de tamano: catorce tiers entre 7 y 13,5 GiB permiten ajustar el modelo al presupuesto de memoria disponible.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada.
- Vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: los tiers de 7 a 13,5 GiB permiten elegir un fichero que quepa en la VRAM disponible (por ejemplo, un tier bajo en una GPU de 8-12 GB) y ejecutarlo con llama.cpp u Ollama.
- Investigacion sobre alineacion y censura: la variante "uncensored" permite estudiar el comportamiento del modelo ante peticiones que los modelos alineados rechazan, comparando respuestas con la version original de Qwen3.8.
- Evaluacion de tecnicas de cuantizacion: los catorce tiers con metricas KL y same-top publicadas constituyen un banco de pruebas para medir la degradacion de calidad en funcion del tamano del fichero.
- Generacion de texto en ingles y chino: util para tareas de redaccion, resumen o conversacion en esos dos idiomas, con la advertencia de que no se declaran otros idiomas.
- Prototipado rapido de aplicaciones de chat: la integracion con llama.cpp y con endpoints compatibles permite levantar un servidor de inferencia en minutos sin infraestructura dedicada.
- Experimentacion con presupuestos de memoria estrictos: el control determinista del tamano de FIT-GGUF permite planificar el despliegue sabiendo de antemano el tamano exacto del fichero, algo relevante en entornos con limites duros de disco o VRAM.
- Fine-tuning o destilacion sobre respuestas sin filtro: el modelo puede servir como generador de datos para experimentos de investigacion, con las cautelas legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona metricas internas de la cuantizacion (divergencia KL y coincidencia de top-1 entre tiers), sin valores numericos concretos.

## Requisitos de hardware

- VRAM estimada: entre 7 y 13,5 GiB para los pesos cuantizados, segun el tier elegido; hay que sumar la memoria para el contexto KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, los tiers bajos (7-9 GiB) podrian ejecutarse en GPUs de consumo con 12-16 GB de VRAM; los tiers altos (12-13,5 GiB) requieren al menos 16 GB y margen para el contexto.
- GPU de consumo: es plausible en tarjetas de 16 GB o mas para los tiers altos, y en tarjetas de 12 GB para los tiers bajos, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de inferencia con API tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de los tiers cuantizados, por lo que la comparativa se limita a caracteristicas estructurales. Las alternativas indicadas son orientativas y sus datos no proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-FIT-GGUF (este) | 26,9 B | no disponible | Apache-2.0 | GGUF (14 tiers, 7-13,5 GiB) | Variante uncensored con cuantizacion de tamano controlado |
| Modelo base orcarouter/Qwen3.8-27B-Uncensored | 26,9 B | no disponible | no disponible | safetensors | Referencia sin cuantizar |
| Qwen3.8 original (familia) | no disponible | no disponible | no disponible | no disponible | Modelo alineado de origen |
| Otras cuantizaciones GGUF del mismo base | 26,9 B | no disponible | Apache-2.0 | GGUF con presets fijos | Sin control fino de tamano ni tiers continuos |

## Limitaciones y advertencias

- La variante "uncensored" elimina o reduce los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sexualmente explicito; no es adecuada para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este modelo.
- Solo se declaran los idiomas ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta documentada, lo que dificulta planificar el uso de memoria KV en produccion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y su proceso de "uncensoring" pueden estar sujetos a condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- La eliminacion de la cabeza MTP puede afectar a funcionalidades de decodificacion especulativa o multi-token prediction presentes en el modelo original.
- El autor advierte que FIT-GGUF no garantiza un optimo universal de calidad: la asignacion de bits por tensor es determinista pero no necesariamente superior a los presets estandar en todos los casos.
- El repositorio ocupa 154,9 GB, lo que exige espacio de disco considerable si se descargan varios tiers.
- No hay datos publicados de benchmarks, latencia ni throughput, por lo que las decisiones de produccion deben basarse en pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/Qwen3.8-27B-Uncensored-FIT-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Herramienta FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-27B-Uncensored-FIT-GGUF/blob/main/README.zh-CN.md
