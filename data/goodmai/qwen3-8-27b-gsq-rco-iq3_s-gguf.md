# goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-GGUF

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_S-GGUF es una cuantizacion GGUF en formato IQ3_S del modelo base Qwen/Qwen3.8-27B, publicada por el usuario goodmai. El repositorio contiene un unico checkpoint de 11,77 GB (el repo completo ocupa 11,8 GB) generado con tecnicas de cuantizacion por importancia (imatrix) y etiquetado con el esquema propietario "GSQ-RCO" del ecosistema Basalt, una herramienta nativa para Apple Silicon escrita en Swift. El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y se distribuye bajo licencia Apache 2.0.

El interes de esta publicacion no reside en el modelo en si, sino en su papel como artefacto de evaluacion: la model card indica explicitamente que el checkpoint se utiliza para probar kernels Metal de cuantizacion nativa (i-quant / GSQ-RCO) en el issue #408 del proyecto Basalt. Es, por tanto, una pieza de infraestructura para quienes quieran reproducir o auditar el comportamiento de dichos kernels sobre hardware Apple Silicon, no una version "oficial" del modelo Qwen.

La relevancia practica es limitada pero concreta: ofrece un punto de partida reproducible para ejecutar un modelo de ~27B en formato de 3 bits con un peso de 11,77 GB, lo que lo hace candidato a caber en equipos con memoria unificada de 16-24 GB. No obstante, la informacion publicada sobre el modelo base (arquitectura, contexto, datos de entrenamiento) no esta disponible en la documentacion proporcionada, por lo que muchas especificaciones deben tratarse como desconocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; arquitectura no documentada en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (unico formato publicado en este repo); tag "imatrix" indica calibracion por matriz de importancia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.8-27B-GSQ-RCO-IQ3_S.gguf`, 11,77 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentacion proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni se detallan el numero de capas, dimensiones ocultas, mecanismo de atencion o funcion de activacion. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento.

Lo unico verificable es el proceso de cuantizacion aplicado por el autor: se trata de una cuantizacion IQ3_S generada con matriz de importancia (imatrix), un esquema de cuantizacion de tipo bloque que asigna distintos niveles de precision a distintas partes de los tensores segun su sensibilidad, reduciendo el peso a 11,77 GB. El sufijo "GSQ-RCO" hace referencia al esquema de cuantizacion propio del runtime Basalt, y el checkpoint se emplea como caso de prueba para los kernels Metal de dicho runtime en Apple Silicon. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones tecnicas del modelo base.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere uso en dialogos multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento y codigo: no hay documentacion especifica en la informacion proporcionada sobre capacidades de razonamiento, matematicas o generacion de codigo del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas en la model card).
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el repositorio puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Ejecucion en Apple Silicon: integracion documentada con Basalt v0.11.0 (macOS 27+, Swift 6.4), incluyendo conversion a formato nativo MLX mediante la plantilla `goodmai/Qwen3.8-27B-3bit-MLX-TextOnly`.

## Casos de uso

- Evaluacion de kernels Metal en Apple Silicon: el proposito declarado del checkpoint es servir de entrada para probar los kernels i-quant / GSQ-RCO del runtime Basalt (issue #408). Un ingeniero de rendimiento puede descargarlo, convertirlo a formato nativo y medir latencia y fidelidad numerica frente al modelo original.
- Pruebas de cuantizacion de 3 bits en modelos de ~27B: permite comparar la perdida de calidad de IQ3_S con imatrix frente a otras cuantizaciones (Q4_K_M, Q5_K_M) sobre el mismo modelo base, usando el mismo conjunto de prompts.
- Despliegue local en equipos con memoria unificada: con 11,77 GB de pesos, el modelo puede intentar ejecutarse en Macs con 16-24 GB de RAM unificada, lo que lo hace util para prototipos offline sin GPU dedicada.
- Reproduccion de experimentos de terceros: al estar publicado bajo Apache 2.0 y con un unico fichero GGUF, facilita que otros investigadores reproduzcan resultados publicados sobre el modelo base en entornos de bajos recursos.
- Servicio conversacional ligero autoalojado: mediante llama.cpp u Ollama, puede levantarse un endpoint compatible con la API de OpenAI para tareas de chat internas donde no se requiera maxima calidad.
- Integracion en pipelines de CI para validacion de runtimes: al ser un artefacto pequeno y determinista, sirve como caso de prueba en tests automatizados que verifiquen que una nueva version de un runtime (Basalt, llama.cpp) sigue cargando y generando texto correctamente.
- Docencia y experimentacion con cuantizacion: util en cursos o talleres donde se explique como afecta la cuantizacion IQ3_S a la perplejidad y a la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos ocupan 11,77 GB; con overhead de contexto y buffers de atencion, se recomienda un minimo de 14-16 GB de memoria disponible. Para contextos largos, prever 16-20 GB.
- GPU recomendadas: no hay datos especificos del autor. Por tamano, una GPU con 16 GB o mas (RTX 4080/4090, A100 40 GB, H100) puede alojar el modelo; en GPUs de 12 GB no cabe completo y requeriria offload parcial a CPU.
- Compatibilidad con GPU de consumo: si, en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB). En GPUs de 12 GB (RTX 3060, 4070) solo con offload parcial.
- Apple Silicon: el autor documenta ejecucion mediante Basalt v0.11.0 en macOS 27+ con Swift 6.4. Por tamano, encaja en Macs con 16 GB de memoria unificada o superior (M1 Pro en adelante, M2/M3/M4 con 16-24 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el autor documenta ademas Basalt (nativo, con conversion a MLX) y el endpoint de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de licencia.

| Modelo | Parametros | Contexto | Cuantizacion en este repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-GSQ-RCO-IQ3_S (este) | ~26,9 B | no disponible | IQ3_S (11,77 GB) | Apache 2.0 | Hugging Face, 725 descargas |
| Qwen/Qwen3.8-27B (base) | ~26,9 B | no disponible | pesos originales (safetensors) | Apache 2.0 (segun este repo) | Hugging Face |
| Alternativas de ~27B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: IQ3_S es una cuantizacion agresiva de 3 bits; se espera degradacion en tareas de razonamiento, matematicas y codigo frente a los pesos originales, aunque no se han publicado mediciones que la cuantifiquen.
- Ausencia de documentacion del modelo base: la model card no describe arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para produccion sin consultar la ficha del modelo Qwen original.
- Artefacto de evaluacion, no de produccion: el autor declara que el checkpoint se usa para probar kernels Metal de Basalt; no hay garantia de soporte, mantenimiento ni correccion de errores.
- Repositorio con escasa traccion: 725 descargas y 0 likes en el momento de la consulta; no hay comunidad que valide su comportamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay documentacion de mitigaciones (RLHF, filtros) en la informacion disponible.
- Sesgos: no documentados. Al no conocer la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, idioma o dominio.
- Idiomas: no se especifica que idiomas soporta; no asumir un rendimiento multilingue sin verificar.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que la licencia del modelo base Qwen3.8-27B sea efectivamente Apache 2.0 y que la cuantizacion no introduzca restricciones adicionales.
- Dependencia de tooling propietario para el flujo documentado: la ruta de conversion a MLX descrita por el autor requiere Basalt v0.11.0 y macOS 27+, lo que limita la reproducibilidad fuera de Apple Silicon.
- Formato unico: solo se publica IQ3_S; no hay variantes Q4, Q5 o Q8 en este repositorio para comparar o para entornos con mas memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Lanzador Basalt (Apple Silicon MLX): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3.8-27B-GSQ-RCO-IQ3_S-GGUF&role=gguf
- Lanzador Basalt (macOS App & CLI): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3.8-27B-GSQ-RCO-IQ3_S-GGUF&role=gguf&lang=en
- Sitio web de Basalt: https://bas-alt.vercel.app
- Release Basalt v0.11.0: https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Plantilla de conversion MLX referenciada: https://huggingface.co/goodmai/Qwen3.8-27B-3bit-MLX-TextOnly
