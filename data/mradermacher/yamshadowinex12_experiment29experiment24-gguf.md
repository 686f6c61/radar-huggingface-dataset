# mradermacher/YamshadowInex12_Experiment29Experiment24-GGUF

## Resumen

YamshadowInex12_Experiment29Experiment24-GGUF es la version cuantizada en formato GGUF del modelo de lenguaje YamshadowInex12_Experiment29Experiment24, publicado originalmente por MaziyarPanahi y convertido a GGUF por mradermacher, un conocido creador de cuantizaciones de la comunidad de Hugging Face. Se trata de un modelo de tipo "merge" (fusion de pesos de otros modelos), con 7.241.732.096 parametros totales (aproximadamente 7,2 mil millones), lo que lo situa en la categoria de modelos de ~7B ampliamente desplegables en hardware de consumo.

El modelo esta disenado para generacion de texto en ingles y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su principal valor practico reside en la disponibilidad de cuantizaciones GGUF de distintos tamanos (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que facilita su ejecucion en estaciones de trabajo con GPU de consumo mediante llama.cpp, Ollama u otros runners compatibles con GGUF.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de la comunidad con escasa informacion publica (118 descargas, 0 likes en el momento de la consulta), y por otro, sirve como ejemplo de la practica habitual de cuantizacion estatica por parte de mradermacher. No se dispone de informacion sobre la composicion del dataset de entrenamiento, el contexto maximo ni resultados de benchmarks, por lo que varios campos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge de modelos; detalles no disponibles) |
| Parametros totales | 7.241.732.096 (~7,2B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y Safetensors (modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un "merge", es decir, una fusion de pesos de otros modelos realizada por MaziyarPanahi. No se especifica la tecnica exacta de fusion (por ejemplo, SLERP, TIES, DARE o linear), ni los modelos de origen, ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. El tag `merge` en la model card confirma esta naturaleza, pero no aporta detalles adicionales.

La cuantizacion realizada por mradermacher es de tipo estatico (se indica `quantize_version: 2` y `output_tensor_quantised: 1` en los comentarios de la model card). No se han publicado cuantizaciones ponderadas por imatrix para este modelo, segun la propia model card. El modelo base conserva pesos en Safetensors y esta etiquetado como compatible con text-generation-inference, lo que sugiere que puede desplegarse en pipelines de inferencia estandar de Hugging Face.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente con el idioma `en`, por lo que su uso fiable se limita a ese idioma.
- Razonamiento y generacion general: al ser un merge de modelos de ~7B, se espera capacidad para tareas de generacion, resumen y respuesta a preguntas, aunque no hay benchmarks que lo confirmen.
- No se documenta soporte explicito de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Compatibilidad con text-generation-inference segun las etiquetas del modelo base.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al disponer de cuantizaciones Q4_K_S y Q4_K_M de 4,2 y 4,5 GB respectivamente, el modelo puede ejecutarse en una GPU de consumo de 8 GB de VRAM, lo que permite iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Generacion de texto offline en estaciones de trabajo: con llama.cpp u Ollama y una cuantizacion Q5_K_M (5,2 GB), es posible desplegar un servicio local de generacion de texto sin conexion, util en entornos con requisitos de privacidad.
- Experimentacion academica con modelos fusionados: investigadores que estudien el efecto de los merges de pesos pueden usar este modelo como caso de estudio, comparando sus salidas con las de los modelos de origen (no documentados) y con otras fusiones.
- Evaluacion de cuantizaciones: la disponibilidad de 12 variantes GGUF permite medir el impacto de la cuantizacion en la perplejidad y la calidad de generacion sobre un mismo modelo base.
- Generacion de contenido en ingles para blogs o documentacion tecnica: con un contexto no documentado, su uso queda limitado a textos de longitud moderada; es adecuado para borradores y variaciones de texto.
- Integracion en pipelines de TGI: el modelo base esta etiquetado como compatible con text-generation-inference, lo que permite servirlo mediante la API estandar de Hugging Face en entornos de produccion ligeros.
- Fine-tuning ligero sobre la version Safetensors: aunque no se documenta, el formato original permite aplicar LoRA o QLoRA sobre el modelo base para adaptarlo a dominios concretos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,8 GB
  - Q3_K_M: ~3,6 GB
  - IQ4_XS: ~4,0 GB
  - Q4_K_M: ~4,5 GB
  - Q5_K_M: ~5,2 GB
  - Q6_K: ~6,0 GB
  - Q8_0: ~7,8 GB
  - f16: ~14,6 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 y H100 para las variantes de mayor precision. Cualquier GPU con al menos 6 GB de VRAM puede ejecutar cuantizaciones Q4 o Q5 con contexto moderado.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para cuantizaciones Q4/Q5; las variantes Q2_K y Q3_K caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El modelo base en Safetensors es compatible con text-generation-inference y con la libreria transformers.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto. Como referencia cualitativa, un modelo de ~7B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo modernas, pero no se aportan mediciones para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de informacion sobre los modelos de origen del merge, por lo que la comparativa se limita a parametros y formato.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| YamshadowInex12_Experiment29Experiment24-GGUF | ~7,2B | no disponible | Apache 2.0 | GGUF, Safetensors | Merge de la comunidad; 12 cuantizaciones GGUF |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Modelo base ampliamente utilizado; contexto documentado |
| Llama-3.1-8B-Instruct | ~8B | 131.072 tokens | Llama 3.1 Community License | Safetensors, GGUF | Contexto largo y amplia adopcion; licencia con restricciones |
| Qwen2.5-7B-Instruct | ~7,6B | 131.072 tokens | Apache 2.0 | Safetensors, GGUF | Multilingue y con contexto largo |

La comparacion con estos modelos es puramente estructural: no hay datos de rendimiento para el modelo de esta ficha que permitan una comparacion cualitativa fiable.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto: no se especifica la longitud maxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Alucinacion: al no haber benchmarks ni documentacion de entrenamiento, no es posible estimar la tasa de alucinacion; se recomienda validacion humana en produccion.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un merge de origen desconocido, los sesgos de los modelos de origen pueden propagarse.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que los modelos de origen del merge no impongan restricciones adicionales, ya que no se documentan.
- Soporte de la comunidad: con 118 descargas y 0 likes, el modelo tiene muy poca adopcion, lo que reduce la probabilidad de encontrar soluciones a problemas en foros o issues.
- Cuantizaciones: no hay cuantizaciones ponderadas por imatrix, y las variantes Q2_K y Q3_K pueden degradar notablemente la calidad.
- Mantenimiento: la fecha de actualizacion del repo (2026-11-28) es posterior a la de creacion (2024-12-27), pero no se detalla que cambios se han realizado.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/YamshadowInex12_Experiment29Experiment24-GGUF
- Modelo base en Hugging Face: https://huggingface.co/MaziyarPanahi/YamshadowInex12_Experiment29Experiment24
- Pagina de overview de mradermacher para este modelo: https://hf.tst.eu/model#YamshadowInex12_Experiment29Experiment24-GGUF
- Repositorio de peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/
