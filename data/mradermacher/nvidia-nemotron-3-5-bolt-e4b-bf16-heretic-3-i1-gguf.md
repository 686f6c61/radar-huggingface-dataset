# mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF es una cuantizacion GGUF del modelo darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3, un derivado "heretic" (presumiblemente con las capas de rechazo o alineamiento de seguridad reducidas) del modelo Nemotron de NVIDIA. El autor de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF con tecnicas de imatrix y cuantizacion IQ, y el resultado se distribuye en un unico repositorio de Hugging Face con mas de 20 variantes de cuantizacion.

El modelo base cuenta con 7.463.013.674 parametros totales segun los safetensors declarados, aunque la nomenclatura "E4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos. La model card indica explicitamente que se trata de un modelo de vision, con archivos mmproj disponibles en el repositorio estatico complementario.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de NVIDIA con capacidades multimodales, una variante "heretic" sin las restricciones de rechazo tipicas, y un conjunto amplio de cuantizaciones GGUF listas para ejecucion local en llama.cpp u Ollama. El repositorio acumula 11.195 descargas, lo que indica interes practico pese a tener un solo like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura E4B sugiere MoE, sin confirmar) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (posiblemente ~4B por el sufijo E4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (ademas de fichero imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El sufijo "E4B" en el nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos sobre un total de 7.463 millones, pero este dato no esta confirmado en la model card. La referencia a "mmproj" indica que el modelo incorpora un proyector multimodal para entrada de imagenes, lo que lo convierte en un modelo vision-lenguaje.

El proceso de cuantizacion empleado por mradermacher utiliza ficheros imatrix (importance matrix) generados a partir de datos de calibracion, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye tanto el fichero imatrix como las cuantizaciones i1 resultantes. No hay informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base paso por RLHF o DPO. El termino "heretic" en el nombre hace referencia a una familia de tecnicas de ablacion de direcciones de rechazo en el espacio de activaciones, pero no se detalla el metodo concreto aplicado.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes: la model card indica explicitamente que es un modelo de vision, con ficheros mmproj en el repositorio estatico.
- Cuantizaciones optimizadas para inferencia local en CPU y GPU mediante llama.cpp.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con la infraestructura de Inference Endpoints de Hugging Face.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, modo thinking, audio u otras capacidades especiales.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Despliegue local de un asistente conversacional multimodal: las cuantizaciones Q4_K_M e IQ4_XS (5,3-5,4 GB) permiten ejecutar el modelo en equipos de consumo con 8 GB de VRAM, manteniendo capacidad de procesamiento de imagenes mediante el mmproj.
- Analisis de documentos con imagenes en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos no salen del equipo, lo que resulta adecuado para sectores regulados.
- Prototipado rapido de aplicaciones de vision-lenguaje: la disponibilidad de mas de 20 cuantizaciones permite ajustar el equilibrio entre calidad y recursos sin cambiar de modelo.
- Investigacion sobre alineamiento y seguridad: al tratarse de una variante "heretic", es util para estudiar el comportamiento de modelos sin capas de rechazo, comparando respuestas frente al modelo original de NVIDIA.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye variantes IQ y K con distintos tamanos, lo que facilita estudios empiricos sobre la degradacion de calidad segun la precision.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG) con imagenes: el modelo puede procesar capturas, diagramas o figuras junto con texto recuperado, aunque el contexto maximo no esta documentado y debe validarse experimentalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S ~3,4 GB; IQ2_M ~3,9 GB; IQ3_S ~4,7 GB; IQ4_XS ~5,1 GB; Q4_K_M ~5,4 GB; Q5_K_M y Q6_K no aparecen con tamano en el fragmento disponible, pero se situan por encima de 5,4 GB.
- GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS caben en GPUs con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070). Las variantes Q5 y Q6 requieren 10-12 GB (RTX 3080, RTX 4070 Ti).
- GPU profesional: A100, H100 y RTX 4090 pueden ejecutar cualquier cuantizacion con holgura e incluso el modelo base en BF16 si se dispone de suficiente memoria.
- Despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF | 7,46B totales | no disponible | no disponible | GGUF | Vision, variante heretic, cuantizaciones i1 |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3 (base) | 7,46B totales | no disponible | no disponible | BF16 safetensors | Modelo original sin cuantizar |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-GGUF (estatico) | 7,46B totales | no disponible | no disponible | GGUF | Cuantizaciones estaticas, incluye mmproj |

No se dispone de informacion sobre modelos de la competencia con caracteristicas equivalentes en la documentacion proporcionada.

## Limitaciones y advertencias

- La variante "heretic" implica la eliminacion o reduccion de mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado sin filtros. No es recomendable para aplicaciones de cara al publico sin capas adicionales de moderacion.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta validado y probablemente sea deficiente.
- No se dispone de informacion sobre la licencia, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base de NVIDIA antes de cualquier despliegue productivo.
- La longitud de contexto no esta documentada; no se debe asumir una ventana grande sin verificacion empirica.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "very low quality".
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la falta de benchmarks publicados que permitan estimar su fiabilidad.
- El repositorio tiene un unico like y la model card es minima, lo que sugiere poca validacion comunitaria.
- Al ser un modelo multimodal, los ficheros mmproj deben descargarse del repositorio estatico complementario; olvidarlos impide el procesamiento de imagenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
