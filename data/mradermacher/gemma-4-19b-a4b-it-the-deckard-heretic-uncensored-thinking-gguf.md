# mradermacher/gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking-GGUF

## Resumen

Esta ficha describe la cuantizacion GGUF del modelo `gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking`, un fine-tune derivado de la familia Gemma 4 con arquitectura Mixture of Experts (MoE). El modelo original fue publicado por DavidAU y esta version ha sido cuantizada por mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp. El modelo base combina el linaje Gemma 4 con un proceso de "abliteration" y "heretic" que elimina los mecanismos de rechazo del modelo alineado, orientandolo a generacion creativa sin restricciones.

La propuesta del modelo es ofrecer generacion de texto y escritura creativa (ficcion, roleplay, generacion de tramas) sin las capas de censura tipicas de los modelos instruct alineados. El tag "pruned experts 90" sugiere una poda agresiva de expertos del MoE original, lo que explicaria el tamano relativamente contenido (18.450 millones de parametros totales) frente a otros modelos MoE de su clase.

La relevancia actual del modelo reside en su disponibilidad en multiples cuantizaciones GGUF (desde Q2_K de 7,9 GB hasta Q8_0 de 19,7 GB), lo que permite ejecutarlo en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones eticas del fine-tune sin censura deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer |
| Parametros totales | 18.449.903.786 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts derivado de la familia Gemma 4, con 18.450 millones de parametros totales. El tag "pruned experts 90" indica que se ha aplicado una poda del 90% de los expertos del MoE original, tecnica que reduce el numero de parametros manteniendo parte de la capacidad del modelo de partida. No se dispone de informacion sobre el numero de parametros activos por token ni sobre el numero de expertos resultantes tras la poda.

El proceso de entrenamiento combina varias tecnicas: por un lado, el fine-tune "Heretic" y "abliterated", que elimina las direcciones de activacion asociadas al rechazo en modelos alineados; por otro, un fine-tune orientado a escritura creativa y roleplay. El modelo base fue generado con Unsloth segun los tags del repositorio. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. El repositorio incluye un componente multimodal (mmproj) que sugiere capacidades de vision en el modelo base, aunque no se detalla su alcance.

## Capacidades

- Generacion de texto y escritura creativa en ingles: ficcion, cuentos, novelas, generacion de tramas y subtramas.
- Roleplay y continuacion de escenas sin las restricciones tipicas de los modelos alineados.
- Generacion de codigo segun los tags del repositorio ("coder").
- Capacidades multimodales potenciales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagen en el modelo base.
- Modo "thinking" segun el nombre del modelo, aunque no se documenta su funcionamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: limitado a ingles segun el campo `language`.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo esta especificamente afinado para generacion de tramas, subtramas y continuacion de escenas, lo que lo hace adecuado para asistir a escritores en la produccion de borradores de novelas o relatos.
- Roleplay conversacional: al estar "abliterated", puede mantener personajes y escenarios sin romper el personaje por filtros de seguridad, util en plataformas de entretenimiento conversacional.
- Generacion de guiones y dialogos para videojuegos: la capacidad de continuar escenas y mantener coherencia de personajes encaja con la produccion de dialogos ramificados.
- Asistencia a guionistas y creadores de contenido: generacion de ideas de trama, variaciones de escenas y desarrollo de arcos narrativos en generos como ciencia ficcion o romance.
- Experimentacion en investigacion sobre alineacion: al ser un modelo abliterated, sirve como caso de estudio para analizar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (12,4 GB) y Q5_K_M (14,1 GB) permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, sin depender de APIs externas.
- Generacion de codigo en entornos locales: segun los tags, el modelo conserva capacidades de programacion, util para asistentes de codigo autoalojados donde la privacidad es prioritaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~7,9 GB; Q3_K_M ~9,9 GB; IQ4_XS ~10,4 GB; Q4_K_M ~12,4 GB; Q5_K_M ~14,1 GB; Q6_K ~16,6 GB; Q8_0 ~19,7 GB. A estas cifras hay que anadir el overhead de contexto KV cache, que puede incrementar el uso entre 1 y 4 GB adicionales segun la longitud de contexto configurada.
- El componente multimodal anade 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16) si se usa entrada de imagen.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080 / 4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; GPUs de 12 GB (RTX 3060, 4070) para Q3_K_M o IQ4_XS. Para Q8_0 con contexto largo se recomienda A100 40 GB o H100.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con cuantizaciones Q3 y en RTX 4090 con Q6_K/Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero esta version concreta es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking (este) | 18,45 B (MoE, podado 90%) | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune sin censura orientado a ficcion |
| Gemma 4 19B-A4B-it (base oficial) | 18,45 B (MoE) | no disponible | Gemma license | safetensors | Modelo alineado con filtros de seguridad |
| Modelos MoE abliterated de tamano similar | no disponible | no disponible | variable | GGUF | No se dispone de datos comparativos verificables |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se ha eliminado deliberadamente el comportamiento de rechazo, por lo que puede generar contenido sensible, ofensivo o inapropiado sin filtros. No es adecuado para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual; los fine-tunes creativos suelen degradar el rendimiento en tareas de conocimiento.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- La poda del 90% de expertos puede degradar capacidades respecto al modelo original; no hay datos que cuantifiquen esta perdida.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o las politicas de las plataformas donde se despliegue; la responsabilidad recae en el integrador.
- El nombre del modelo incluye "Gemma", pero la licencia declarada es Apache 2.0; conviene verificar la cadena de licencias del modelo base antes de un despliegue comercial.
- No se dispone de informacion sobre sesgos especificos del fine-tune.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
