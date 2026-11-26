# mradermacher/Dark-Scarlett-v1.0-26B-A4B-Uncensored-i1-GGUF

## Resumen

Dark-Scarlett-v1.0-26B-A4B-Uncensored-i1-GGUF es una cuantizacion GGUF, generada con imatrix, del modelo Dark-Scarlett-v1.0-26B-A4B-Uncensored publicado por rakshazi. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en la comunidad de pesos comprimidos para llama.cpp. El modelo base es un Mixture of Experts (MoE) derivado de la familia Gemma, con 25.233.142.046 parametros totales y aproximadamente 4B de parametros activos por token (de ahi el sufijo A4B), lo que lo situa en la gama de modelos eficientes en inferencia pese a su tamano bruto.

El modelo esta orientado a generacion de texto conversacional, en particular a roleplay (RP) y roleplay erotico (ERP), y ha sido sometido a un proceso de "abliteration"/decensoring que elimina total o parcialmente los rechazos de seguridad del modelo original. Esto lo hace relevante para desarrolladores e investigadores que necesitan un modelo sin filtros para experimentacion, investigacion sobre alineamiento o generacion creativa sin restricciones, aunque con implicaciones eticas y legales claras.

La ficha se centra en la version cuantizada i1-GGUF, publicada bajo licencia Apache 2.0, con pesos en formato GGUF para su uso con llama.cpp y herramientas compatibles. El repositorio ocupa 23,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma (tag `gemma4`), transformer |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,7 GB), i1-IQ3_M (12,5 GB); existen cuantizaciones estaticas adicionales en el repositorio hermano |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, etiquetado por el autor con el tag `gemma4`, lo que sugiere una derivacion de la familia Gemma de Google con capa MoE. Cuenta con unos 25,2B de parametros totales pero solo activa alrededor de 4B por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en la model card proporcionada.

La innovacion principal de esta variante es el proceso de "abliteration"/decensoring (etiquetas `uncensored`, `decensored`, `abliterated`, `heretic`, `EGA`), que modifica los pesos para suprimir los comportamientos de rechazo del modelo original. La version aqui descrita es una cuantizacion GGUF con imatrix (importance matrix), que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas. El autor indica que el modelo base es un modelo de vision, por lo que los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay (RP) y roleplay erotico (ERP).
- Generacion creativa sin los rechazos habituales de los modelos alineados (contenido "uncensored").
- Razonamiento y generacion de texto general heredados del modelo Gemma subyacente.
- Posible soporte de vision (el autor califica el modelo base como modelo de vision; los mmproj estarian en el repo estatico), aunque no se detalla en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun los metadatos (`language: en`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta afinado especificamente para RP/ERP, por lo que puede mantener personajes y tramas coherentes en conversaciones largas, aunque la longitud exacta de contexto no esta documentada.
- Investigacion sobre alineamiento y seguridad: permite estudiar el comportamiento de un modelo tras el proceso de abliteration, comparando respuestas con el modelo original y midiendo la perdida de capacidades.
- Generacion creativa sin restricciones: escritura de ficcion adulta o de tematicas sensibles donde los modelos alineados rechazan la peticion.
- Evaluacion de cuantizaciones: las versiones i1-Q2_K e i1-IQ3_M permiten medir el impacto de la compresion en la calidad de un MoE de ~25B en hardware modesto.
- Despliegue local en equipos de consumo: con ~10,7-12,5 GB de pesos, puede ejecutarse en GPU consumer de gama alta o en CPU con llama.cpp, util para prototipado offline.
- Pruebas de robustez y red teaming: util como modelo "sin filtros" para generar casos adversarios y evaluar clasificadores de contenido.
- Experimentacion con arquitecturas MoE eficientes: sirve para medir throughput y latencia de un MoE de 4B activos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~10,7 GB para i1-Q2_K y ~12,5 GB para i1-IQ3_M (solo pesos); anadir overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para IQ3_M con contexto amplio; RTX 4080/3090 (16-24 GB) para Q2_K; A100/H100 sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en tarjetas de 12-16 GB con las cuantizaciones mas bajas y contexto moderado; en 8 GB solo con cuantizaciones mas agresivas no listadas aqui.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frontends compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles; al ser un MoE con ~4B activos, se espera un throughput superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-26B-A4B-Uncensored (i1-GGUF) | ~25,2B | ~4B | no disponible | Apache 2.0 | MoE Gemma decensored, solo ingles |
| Modelo base rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored | ~25,2B | ~4B | no disponible | Apache 2.0 | Version sin cuantizar, safetensors |
| Cuantizaciones estaticas (mradermacher/Dark-Scarlett-...-GGUF) | ~25,2B | ~4B | no disponible | Apache 2.0 | Misma base, sin imatrix, incluye mmproj de vision |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino; el uso en produccion requiere moderacion externa.
- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada: no se debe asumir una ventana larga sin verificacion empirica.
- Riesgo de alucinacion propio de los modelos de ~25B, agravado por la perdida de capacidades que suele acompanar al proceso de abliteration.
- Las cuantizaciones de 2-3 bits (Q2_K, IQ3_M) degradan la calidad respecto al modelo original; para uso critico conviene usar cuantizaciones mayores del repositorio estatico.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y el propio proceso de decensoring pueden entrar en conflicto con legislaciones sobre contenido danino o derechos de autor.
- El modelo base se describe como modelo de vision, pero esta version GGUF no incluye necesariamente los ficheros mmproj; verificar el repositorio estatico antes de asumir capacidades multimodales.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta: tratar como experimental.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-26B-A4B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Dark-Scarlett-v1.0-26B-A4B-Uncensored-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
