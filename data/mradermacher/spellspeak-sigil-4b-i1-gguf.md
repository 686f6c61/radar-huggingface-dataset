# mradermacher/spellspeak-sigil-4b-i1-GGUF

## Resumen

spellspeak-sigil-4b-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base jptaylor/spellspeak-sigil-4b. El autor de las cuantizaciones es un creador habitual de versiones GGUF de modelos open source, y en este caso aplica cuantizacion con imatrix (matriz de importancia) para preservar la calidad del modelo original en tamanos reducidos. El modelo base tiene una orientacion conversacional segun las etiquetas del repositorio.

El dato de parametros totales reportado en los safetensors del repositorio es de 7.463.013.674 parametros, lo que contrasta con el sufijo "4b" del nombre del modelo base. Esta discrepancia no se aclara en la informacion disponible y debe tenerse en cuenta al planificar el despliegue. El repositorio ocupa 33,5 GB, coherente con un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K) de un modelo de ese tamano.

La relevancia de esta ficha es practica: permite ejecutar un modelo conversacional en hardware de consumo mediante llama.cpp u Ollama, eligiendo el nivel de cuantizacion segun la VRAM disponible. No se dispone de informacion sobre arquitectura, datos de entrenamiento ni resultados de benchmarks del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.463.013.674 (segun safetensors del repo); el nombre del modelo base indica "4b", discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base jptaylor/spellspeak-sigil-4b: la model card del repositorio de cuantizaciones solo indica que se trata de cuantizaciones ponderadas con imatrix del modelo original, sin describir la arquitectura (transformer, MoE, SSM o hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica documentada en este repositorio es el uso de cuantizacion con imatrix (importancia matricial), que calcula pesos de importancia por tensor para minimizar la perdida de calidad en cuantizaciones agresivas. La model card incluye metadatos del proceso de conversion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), lo que indica que la conversion se realizo desde pesos en formato Hugging Face. Tambien se marca `skip_mmproj: 1`, lo que sugiere que no se incluye proyector multimodal en estas cuantizaciones.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio indica un modelo orientado a dialogo multi-turno.
- Cuantizacion amplia: disponible en 24 variantes de cuantizacion, desde IQ1_S (para hardware muy limitado) hasta Q6_K (casi sin perdida apreciable).
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Ejecucion local: al estar en GGUF, es compatible con llama.cpp, Ollama y otros runners de CPU/GPU.
- Capacidades especificas (tool calling, agentes, vision, audio, thinking mode, multilingue): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de chatbots locales: el modelo puede ejecutarse en un portatil con GPU de consumo usando la cuantizacion Q4_K_M, lo que permite iterar sobre disenos de prompt sin coste de API.
- Asistente conversacional en el borde: con la cuantizacion IQ2_M o Q2_K puede desplegarse en dispositivos con 4-6 GB de VRAM, habilitando asistentes offline en entornos sin conectividad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes del mismo modelo, lo que permite medir empiricamente la degradacion de calidad frente al ahorro de memoria en un caso conversacional concreto.
- Integracion en pipelines de llama.cpp: al ser GGUF, puede incorporarse a servidores de inferencia basados en llama.cpp con la API compatible de OpenAI para pruebas internas.
- Investigacion sobre cuantizacion con imatrix: util para estudiar como afecta la cuantizacion ponderada por importancia a un modelo de ~7.400 millones de parametros en tareas de dialogo.
- Despliegue en CPU para entornos sin GPU: las variantes Q4_0 y Q4_1 son adecuadas para inferencia en CPU con llama.cpp, aunque con latencia mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun parametros de 7.463 millones y cuantizacion):
  - IQ1_S / IQ1_M: en torno a 2-3 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: en torno a 3-4 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 4-5 GB.
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 5-6 GB.
  - Q5_K_S / Q5_K_M: en torno a 6-7 GB.
  - Q6_K: en torno a 7-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para las variantes de mayor precision y mayor contexto.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para Q4_K_M y superiores; las variantes IQ2 e IQ3 caben en tarjetas de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento del modelo base que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; debe consultarse el repositorio del modelo base jptaylor/spellspeak-sigil-4b antes de cualquier despliegue en produccion.
- Discrepancia de parametros: el nombre indica "4b" pero los safetensors reportan 7.463.013.674 parametros; verificar el modelo base antes de dimensionar hardware.
- Idiomas no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Contexto desconocido: no se dispone de la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay datos de alineacion ni evaluaciones de fidelidad.
- Sesgos: no documentados; sin informacion sobre el dataset de entrenamiento no es posible evaluar sesgos conocidos.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia conversacional; se recomienda Q4_K_M o superior para uso real.
- Sin proyector multimodal: el flag `skip_mmproj: 1` indica que estas cuantizaciones no incluyen capacidades de vision aunque el modelo base las tuviera.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/spellspeak-sigil-4b-i1-GGUF
- Modelo base: https://huggingface.co/jptaylor/spellspeak-sigil-4b
