# mradermacher/WestOrcaNeural-V2-DARETIES-7B-GGUF

## Resumen

WestOrcaNeural-V2-DARETIES-7B-GGUF es la version cuantizada en formato GGUF del modelo merge jsfs11/WestOrcaNeural-V2-DARETIES-7B, publicada por mradermacher. Se trata de un modelo de lenguaje de 7.241.732.096 parametros (~7,24 B) construido mediante tecnicas de fusion de modelos (mergekit y lazymergekit) a partir de tres modelos base: decruz07/kellemar-DPO-Orca-Distilled-7B-SLERP, senseable/WestLake-7B-v2 y mlabonne/NeuralBeagle14-7B.

El modelo resuelve el problema de combinar las capacidades de varios modelos afinados de 7B en un unico checkpoint, buscando un equilibrio entre razonamiento, instrucciones y calidad de generacion. Su relevancia practica reside en la disponibilidad de cuantizaciones GGUF de 2,8 GB a 14,6 GB, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama.

La ficha se centra en la version GGUF distribuida por mradermacher, que incluye cuantizaciones estaticas del modelo original. No se dispone de informacion publicada sobre arquitectura interna detallada, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de transformers de 7B, fusion via mergekit) |
| Parametros totales | 7.241.732.096 (~7,24 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que es un modelo de 7B compatible con transformers. El modelo es el resultado de una fusion (merge) realizada con mergekit y lazymergekit a partir de tres checkpoints: decruz07/kellemar-DPO-Orca-Distilled-7B-SLERP, senseable/WestLake-7B-v2 y mlabonne/NeuralBeagle14-7B. El nombre "DARETIES" sugiere el uso de la tecnica DARE (Drop And REscale) combinada con TIES (Trim, Elect Sign, Merge), aunque no se confirma en la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO en el merge final. Los modelos de origen incluyen componentes de DPO y Orca distill, segun sus nombres, pero no hay detalle publicado sobre pesos o proporciones de la fusion. La version distribuida por mradermacher es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) del checkpoint original.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento e instrucciones derivadas de los modelos base (Orca distill, DPO y Beagle).
- Capacidad de seguir instrucciones conversacionales multi-turno (heredada de los modelos de origen).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (4,5 GB) se puede desplegar en una GPU de consumo o en CPU para probar flujos de chat multi-turno en ingles sin infraestructura cloud.
- Generacion de texto en entornos con recursos limitados: las variantes Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecutar el modelo en portatiles o equipos con poca VRAM para tareas de redaccion y resumen.
- Experimentacion con tecnicas de merge: util como referencia para investigar el efecto de la fusion DARE/TIES sobre modelos de 7B, comparando su comportamiento frente a los checkpoints de origen.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de 12 variantes GGUF permite medir el impacto de la cuantizacion en perplejidad y calidad de generacion en un mismo modelo.
- Fine-tuning posterior sobre el checkpoint original: al estar bajo licencia apache-2.0 y disponible en transformers, se puede usar como base para ajuste especifico en ingles.
- Despliegue en pipelines de inferencia con llama.cpp u Ollama: integrable en servicios ligeros de generacion de texto donde no se requiere contexto largo ni capacidades multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion GGUF):
  - Q2_K: ~2,8 GB de pesos, ~3,5 GB de VRAM con overhead.
  - Q4_K_M: ~4,5 GB de pesos, ~5,5 GB de VRAM con overhead.
  - Q8_0: ~7,8 GB de pesos, ~9 GB de VRAM con overhead.
  - f16: ~14,6 GB de pesos, requiere GPU de 16 GB o superior.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para f16 y despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q8_0 o inferior, y en GPUs de 8 GB con Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para el checkpoint original en transformers: vLLM o TGI (no confirmado en la informacion).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WestOrcaNeural-V2-DARETIES-7B-GGUF | ~7,24 B | no disponible | apache-2.0 | GGUF | Merge DARE/TIES de tres modelos 7B; solo ingles |
| senseable/WestLake-7B-v2 | ~7 B | no disponible | no disponible en esta ficha | safetensors | Uno de los modelos de origen del merge |
| mlabonne/NeuralBeagle14-7B | ~7 B | no disponible | no disponible en esta ficha | safetensors | Modelo de origen, orientado a instrucciones |
| decruz07/kellemar-DPO-Orca-Distilled-7B-SLERP | ~7 B | no disponible | no disponible en esta ficha | safetensors | Modelo de origen con DPO y Orca distill |

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta de idioma; no se debe esperar buen rendimiento en castellano.
- Al ser un merge de modelos, puede heredar sesgos y comportamientos inconsistentes de sus componentes; no hay evaluacion publicada de sesgos.
- Riesgo de alucinacion inherente a los modelos de 7B sin datos de benchmarks que lo cuantifiquen.
- No hay informacion sobre la longitud de contexto efectiva; no se recomienda para tareas que requieran ventanas largas.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las licencias de los modelos de origen, que no se detallan en la informacion proporcionada.
- La cuantizacion Q2_K y Q3_K_M degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- No se confirma soporte de tool calling ni de agentes; no asumir estas capacidades sin validacion previa.
- La model card del cuantizador no incluye informacion sobre el proceso de merge ni evaluaciones del modelo original.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/WestOrcaNeural-V2-DARETIES-7B-GGUF
- Modelo base original: https://huggingface.co/jsfs11/WestOrcaNeural-V2-DARETIES-7B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/WestOrcaNeural-V2-DARETIES-7B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#WestOrcaNeural-V2-DARETIES-7B-GGUF
- Modelo de origen 1: https://huggingface.co/decruz07/kellemar-DPO-Orca-Distilled-7B-SLERP
- Modelo de origen 2: https://huggingface.co/senseable/WestLake-7B-v2
- Modelo de origen 3: https://huggingface.co/mlabonne/NeuralBeagle14-7B
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
