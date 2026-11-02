# mradermacher/Qwen3.5-122B-A10B-Opus-Reasoning-bf16-hf-GGUF

## Resumen

Qwen3.5-122B-A10B-Opus-Reasoning-bf16-hf-GGUF es una distribucion de cuantizaciones GGUF del modelo tigerhouse/Qwen3.5-122B-A10B-Opus-Reasoning-bf16-hf, publicada por el cuantizador mradermacher. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 122.111.526.912 parametros totales y aproximadamente 10.000 millones de parametros activos por token, derivado de la familia Qwen3.5 y afinado para tareas de razonamiento con un estilo de generacion inspirado en Claude Opus. El autor lo etiqueta como "uncensored" y "reasoning", lo que indica un ajuste fino orientado a reducir rechazos y a favorecer cadenas de razonamiento explicitas.

El repositorio no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones estaticas en formato GGUF (de Q2_K a Q8_0) junto con los adaptadores multimodales mmproj, lo que permite ejecutar el modelo en llama.cpp y herramientas compatibles sin necesidad de GPU de clase servidor para las variantes mas agresivas. El modelo base se distribuye bajo licencia Apache 2.0 y declara soporte para diez idiomas (ingles, chino, japones, coreano, frances, aleman, espanol, portugues, ruso y arabe), lo que lo situa como una opcion atractiva para despliegues multilingues en local.

La relevancia actual del modelo radica en su relacion tamano/activos: al activar solo unos 10.000 millones de parametros por token, un MoE de 122.000 millones puede ofrecer una calidad cercana a modelos densos mucho mayores con un coste de inferencia mas contenido, aunque el requisito de memoria para cargar todos los expertos sigue siendo elevado. Las cuantizaciones de 4 bits (Q4_K_M, 74,3 GB) lo hacen viable en estaciones de trabajo con 96 GB de RAM o en configuraciones multi-GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (model_type: qwen3_5_moe) |
| Parametros totales | 122.111.526.912 |
| Parametros activos | Aproximadamente 10.000 millones (segun nomenclatura A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos (MoE), identificada en los metadatos como `qwen3_5_moe`. Con 122.111.526.912 parametros totales y alrededor de 10.000 millones activos por token, sigue el patron habitual de los MoE modernos: un router selecciona un subconjunto de expertos por capa, de modo que el coste computacional por token se aproxima al de un modelo denso de 10.000 millones mientras la capacidad representacional se acerca a la de un modelo de 122.000 millones. Esta distribucion esta pensada para reducir el coste de inferencia manteniendo una calidad alta en tareas de razonamiento y generacion.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros) en la informacion proporcionada. El modelo base es un ajuste fino de la familia Qwen3.5 orientado a razonamiento y con etiqueta "opus", lo que sugiere un entrenamiento supervisado sobre trazas de razonamiento de alta calidad, pero no se confirman detalles tecnicos. Tampoco se documentan innovaciones especificas como decodificacion especulativa o atencion lineal. El repositorio incluye adaptadores multimodales (mmproj), lo que indica que el modelo base incorpora capacidades de vision, aunque no se detalla su arquitectura interna.

## Capacidades

- Generacion de texto conversacional multi-turno en diez idiomas.
- Razonamiento explicito con cadenas de pensamiento (etiqueta "reasoning").
- Capacidades multimodales: el repositorio incluye adaptadores mmproj (Q8_0 y f16), lo que sugiere soporte de entrada de imagenes, aunque no se detalla el alcance.
- Ajuste fino orientado a reducir rechazos ("uncensored"), lo que amplia el rango de respuestas en dominios sensibles, con los riesgos asociados.
- Compatibilidad con endpoints y herramientas del ecosistema transformers/llama.cpp.
- Soporte multilingue declarado: ingles, chino, japones, coreano, frances, aleman, espanol, portugues, ruso y arabe.
- No se documenta explicitamente soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la informacion disponible.

## Casos de uso

- Razonamiento asistido en local: con la cuantizacion Q4_K_M (74,3 GB) el modelo puede ejecutarse en una estacion de trabajo con 96 GB de RAM y ofrecer cadenas de razonamiento para analisis tecnico, depuracion de hipotesis o revision de disenos, sin depender de APIs externas.
- Procesamiento multilingue en produccion: al cubrir diez idiomas, incluido el espanol, puede emplearse para traduccion, resumen y atencion al cliente en mercados europeos y asiaticos con un unico modelo desplegado.
- Analisis de documentos con imagenes: los adaptadores mmproj permiten procesar capturas, diagramas o documentos escaneados junto con texto, util para extraccion de informacion en flujos de digitalizacion.
- Generacion de codigo y explicaciones tecnicas: el perfil de razonamiento y el ajuste fino lo hacen adecuado para tareas de explicacion de codigo, revision de parches y generacion de documentacion tecnica en entornos con requisitos de privacidad.
- Investigacion sobre alineacion y censura: la etiqueta "uncensored" lo convierte en un objeto de estudio para comparar comportamientos de rechazo frente a modelos alineados de forma mas conservadora.
- Despliegue en infraestructura propia con llama.cpp: las cuantizaciones Q2_K (45 GB) y Q3_K (53-63,5 GB) permiten ejecutarlo en servidores con 64 GB de RAM, adecuado para prototipos y entornos de desarrollo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones, util para medir la degradacion de calidad entre Q2_K y Q8_0 en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K 45,0 GB; Q3_K_S 53,0 GB; Q3_K_M 58,7 GB; Q3_K_L 63,5 GB; IQ4_XS 66,3 GB; Q4_K_S 69,8 GB; Q4_K_M 74,3 GB; Q5_K_S 84,3 GB; Q5_K_M 87,0 GB; Q6_K 100,4 GB; Q8_0 130,0 GB. Los adaptadores mmproj anaden 0,1 GB.
- Para cargar el modelo completo en memoria se necesita al menos la cifra de la cuantizacion elegida mas el overhead del runtime; en la practica, contar con un 10-20 % adicional.
- GPU recomendadas: para Q4_K_M se recomienda un conjunto de 2x RTX 4090 (48 GB) insuficiente por si solo, por lo que se requiere descarga a RAM o configuraciones con 2x A100 80 GB, H100 80 GB o 4x RTX 4090. Para Q2_K y Q3_K puede bastar una unica GPU de 80 GB o descarga parcial a RAM del sistema.
- Cabe en GPU de consumo solo en configuraciones multi-GPU o con offloading parcial a RAM; una unica RTX 4090 (24 GB) no es suficiente para ninguna cuantizacion completa.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de memoria suficiente.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 10.000 millones de parametros activos, el throughput por token deberia ser considerablemente mayor que el de un denso de 122.000 millones, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-Opus-Reasoning (este) | 122,1 B | ~10 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-235B-A22B | 235 B | 22 B | no disponible | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x22B | 141 B | ~39 B | 64 K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 16 B | 2,4 B | 32 K | MIT | safetensors |

La comparativa se limita a familias MoE de codigo abierto con licencia permisiva. Frente a Mixtral 8x22B, este modelo activa menos parametros por token (~10 B frente a ~39 B), lo que reduce el coste de inferencia, aunque no hay datos publicos de calidad que permitan comparar rendimiento. Frente a Qwen3-235B-A22B, ofrece menor huella total y menor activacion, a costa de capacidad. Los datos de contexto de los comparadores son los publicos habituales de cada familia y no se verifican en esta ficha.

## Limitaciones y advertencias

- No se han publicado benchmarks que permitan validar la calidad del ajuste fino "Opus-Reasoning" frente al modelo base Qwen3.5.
- La etiqueta "uncensored" implica un filtrado de seguridad reducido; no es adecuado para aplicaciones orientadas al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion inherente a los modelos de razonamiento; las cadenas de pensamiento no garantizan veracidad.
- No se documenta la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- El ajuste fino sobre trazas de razonamiento puede introducir sesgos de estilo y de contenido heredados del dataset de entrenamiento, no documentado.
- La licencia Apache 2.0 permite uso comercial, pero el autor del ajuste fino no ofrece garantias sobre el origen de los datos de entrenamiento.
- El tamano del repositorio (831,1 GB) y de las cuantizaciones (hasta 130 GB) exigen infraestructura de almacenamiento y memoria considerable.
- Solo se ofrecen cuantizaciones estaticas; no hay versiones con imatrix, lo que puede suponer una perdida de calidad mayor en los niveles bajos (Q2_K, Q3_K).
- No se confirma soporte de tool calling ni de agentes, por lo que su uso en pipelines automatizados requiere validacion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-122B-A10B-Opus-Reasoning-bf16-hf-GGUF
- Modelo base: https://huggingface.co/tigerhouse/Qwen3.5-122B-A10B-Opus-Reasoning-bf16-hf
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-122B-A10B-Opus-Reasoning-bf16-hf-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
