# mradermacher/TinyR1-32B-Preview-abliterated-GGUF

## Resumen

TinyR1-32B-Preview-abliterated-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo huihui-ai/TinyR1-32B-Preview-abliterated, publicada por mradermacher. El modelo subyacente es una variante "abliterated" (con los mecanismos de rechazo suprimidos mediante edicion de direcciones de activacion) de TinyR1-32B-Preview, un modelo de 32.763.876.352 parametros orientado a razonamiento y conversacion. Esta publicacion no introduce pesos nuevos: su valor es empaquetar el modelo base en diez cuantizaciones GGUF distintas para facilitar su despliegue en llama.cpp y entornos compatibles.

El repositorio tiene un tamano de 224 GB (suma de todas las cuantizaciones) y se distribuye bajo licencia Apache 2.0. El modelo declara soporte unicamente para ingles. La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un modelo de razonamiento de 32B en hardware de consumo mediante cuantizaciones de 4 bits, y en que documenta el fenomeno de la "abliteration", que altera el comportamiento de rechazo del modelo original.

La informacion disponible es limitada: la model card del autor de las cuantizaciones no incluye datos de arquitectura detallada, contexto, datos de entrenamiento ni benchmarks. Esta ficha se limita a lo verificable en los metadatos y la model card proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers no se incluye en este repo |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) del modelo base TinyR1-32B-Preview. Los metadatos solo confirman que se trata de un modelo de 32.763.876.352 parametros con pipeline conversacional y libreria transformers en origen.

La innovacion tecnica documentada en esta publicacion es la cuantizacion: mradermacher genera cuantizaciones estaticas (no imatrix) con la herramienta de conversion a GGUF, segun el campo `quantize_version: 2` y `convert_type: hf` de la model card. El autor indica que las cuantizaciones ponderadas/imatrix estan en un repositorio separado (TinyR1-32B-Preview-abliterated-i1-GGUF), que suele ofrecer mejor calidad a igual tamano. La caracteristica "abliterated" del modelo base implica que se han eliminado o atenuado las direcciones de activacion asociadas al rechazo de peticiones, lo que modifica el comportamiento de seguridad respecto al modelo original.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y respuesta a instrucciones (por la naturaleza "R1" y "Preview" del modelo base, aunque no se detallan capacidades especificas en la informacion disponible).
- Modo "abliterated": el modelo no aplica los rechazos tipicos del modelo alineado original, lo que permite respuestas a peticiones que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en hardware de consumo: con la cuantizacion Q4_K_M (20,0 GB) el modelo puede ejecutarse en GPUs con 24 GB de VRAM, como una RTX 4090, mediante llama.cpp u Ollama, lo que permite experimentar con un modelo de 32B sin infraestructura de datacenter.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar como la supresion de direcciones de rechazo afecta a las respuestas del modelo, comparandola con el modelo base alineado en experimentos controlados.
- Evaluacion de cuantizaciones: el repositorio ofrece diez niveles de cuantizacion (de Q2_K a Q8_0) que permiten medir el impacto de la compresion en la perplejidad y la calidad de las respuestas, usando la grafica de comparacion de tipos de cuantizacion enlazada en la model card.
- Prototipado de asistentes conversacionales en ingles: al ser un modelo conversacional de 32B, sirve para construir prototipos de chat multi-turno en entornos con una sola GPU, antes de migrar a un modelo mayor o a un servicio gestionado.
- Generacion de texto sin restricciones de contenido para investigacion creativa: en entornos controlados y con supervision, el comportamiento abliterated permite explorar generacion de ficcion o escenarios que el modelo alineado filtraria.
- Integracion en pipelines con llama.cpp: el formato GGUF y la compatibilidad con endpoints permiten montar un servidor local de inferencia (por ejemplo, con llama-server) para pruebas de integracion en aplicaciones que consumen una API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del archivo GGUF, sin contar overhead de contexto): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 20,0 GB; Q5_K_S 22,7 GB; Q5_K_M 23,4 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- GPUs recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o una A100 40 GB; para Q6_K y Q8_0, A100 40/80 GB o H100. Las cuantizaciones Q2_K a Q3_K_L caben en GPUs de 16 GB (por ejemplo, RTX 4080) con margen limitado para contexto.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M; en RTX 4080 (16 GB) con Q2_K o Q3_K_S, con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints. vLLM y TGI no se mencionan como soportados para este formato en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyR1-32B-Preview-abliterated-GGUF (este) | 32,76B | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas, ingles, abliterated |
| TinyR1-32B-Preview-abliterated (base) | 32,76B | no disponible | apache-2.0 | safetensors (transformers) | Modelo original sin cuantizar |
| TinyR1-32B-Preview-abliterated-i1-GGUF | 32,76B | no disponible | apache-2.0 | GGUF | Cuantizaciones ponderadas/imatrix del mismo modelo, mayor calidad a igual tamano |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": se han suprimido los mecanismos de rechazo, por lo que puede generar contenido que el modelo original bloquearia. No es adecuado para produccion orientada al publico sin filtros adicionales.
- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta garantizado.
- No se dispone de datos sobre contexto maximo, sesgos, tasas de alucinacion ni evaluaciones de calidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M como opcion rapida y Q6_K o Q8_0 para maxima calidad.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento abliterated puede implicar riesgos legales o de reputacion segun el uso.
- El repositorio ocupa 224 GB en total; descargar todas las cuantizaciones no es necesario, pero conviene planificar el almacenamiento.
- No se documentan requisitos de contexto ni tecnicas de decodificacion especulativa; el rendimiento real dependera del runtime GGUF empleado.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/TinyR1-32B-Preview-abliterated-GGUF
- Modelo base: https://huggingface.co/huihui-ai/TinyR1-32B-Preview-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/TinyR1-32B-Preview-abliterated-i1-GGUF
- Pagina de vision general y descargas: https://hf.tst.eu/model#TinyR1-32B-Preview-abliterated-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de comparacion de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
