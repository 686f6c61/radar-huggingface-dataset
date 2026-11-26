# mradermacher/Persistent-Exploration-Gemma4-E4B-i1-GGUF

## Resumen

Persistent-Exploration-Gemma4-E4B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base gsarch/Persistent-Exploration-Gemma4-E4B. Se trata de un derivado de la familia Gemma 4, en su variante E4B, con aproximadamente 8.190 millones de parametros segun los pesos en safetensors del modelo original. El repositorio contiene unicamente los ficheros cuantizados en formato GGUF, no los pesos originales en precision completa.

El valor practico de este repositorio es permitir la ejecucion del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, ya que incluye un amplio abanico de cuantizaciones que van desde IQ1_S (las mas agresivas) hasta Q6_K, pasando por variantes K-quant e I-quant. Las cuantizaciones se han generado con imatrix/weighted quants, una tecnica que busca preservar mejor la calidad en niveles de compresion bajos.

La relevancia de esta ficha es limitada en terminos de informacion publicada: el repositorio no incluye model card descriptiva, no declara licencia, idiomas ni pipeline, y no tiene descargas ni likes en el momento de la consulta. Se trata, por tanto, de una publicacion reciente de cuantizaciones cuyo modelo base conviene evaluar por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 4 E4B; arquitectura del modelo base no documentada en la informacion proporcionada) |
| Parametros totales | 8.189.157.930 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF, DPO u otros) del modelo base gsarch/Persistent-Exploration-Gemma4-E4B en la informacion proporcionada. El nombre sugiere un derivado de Gemma 4 en variante E4B, pero no se documenta en el repositorio el tipo de transformer, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion.

Lo que si se documenta es el proceso de cuantizacion: las etiquetas del README indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que las cuantizaciones se generaron a partir de pesos en formato Hugging Face. Se emplearon cuantizaciones ponderadas con imatrix, y se marca `skip_mmproj: 1`, lo que indica que no se incluye el proyector multimodal en estas cuantizaciones (si el modelo base lo tuviera). La etiqueta `nicoboss` aparece en los metadatos, probablemente en referencia a la herramienta o al autor del pipeline de cuantizacion.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Capacidades especificas de razonamiento, codigo, matematicas, vision o audio: no disponibles en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en hardware de consumo: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en GPUs con 8-12 GB de VRAM mediante llama.cpp, lo que permite prototipar asistentes conversacionales sin infraestructura cloud.
- Experimentacion con cuantizaciones extremas: las variantes IQ1_S, IQ2_XXS e IQ2_M permiten estudiar el impacto de la compresion agresiva en la calidad de un modelo de ~8B, util para investigacion sobre tecnicas de cuantizacion.
- Chatbot de proposito general autoalojado: al tratarse de un modelo conversacional de ~8B, es adecuado para asistentes de texto en entornos con requisitos de privacidad, siempre que se valide previamente la calidad del modelo base.
- Evaluacion comparativa de quants: el repositorio incluye 24 variantes de cuantizacion, lo que facilita estudios de trade-off entre tamano, velocidad y perplejidad en un mismo modelo.
- Integracion en pipelines de inferencia con llama.cpp u Ollama: el formato GGUF es directamente consumible por estas herramientas, lo que simplifica su inclusion en entornos de desarrollo y CI.
- Base para fine-tuning posterior: los pesos originales en safetensors del modelo base pueden servir como punto de partida para ajuste fino, aunque este repositorio concreto solo distribuye GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de ~8,2B parametros, las estimaciones orientativas son aproximadamente 3-4 GB para IQ2/IQ3, 5-6 GB para Q4_K_M, 7-8 GB para Q5_K_M y 9-10 GB para Q6_K, sin contar el espacio de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, A100 y H100 para las variantes de mayor precision y contextos largos.
- Cabe en GPU de consumo: si, especialmente en las cuantizaciones Q4_K_M e inferiores con GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere tambien despliegue via endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el modelo tiene ~8,2B parametros, un tamano comparable a otros modelos de la clase 7-9B, pero sin datos de benchmarks no es posible establecer una comparacion significativa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de las cuantizaciones, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo original gsarch/Persistent-Exploration-Gemma4-E4B antes de cualquier uso en produccion.
- Idiomas no declarados: no se puede confirmar el soporte multilingue ni la calidad en castellano.
- Sin model card descriptiva: el repositorio no documenta arquitectura, entrenamiento ni capacidades, lo que dificulta evaluar su idoneidad.
- Sin benchmarks: no hay datos objetivos de rendimiento que respalden la calidad del modelo.
- Sin descargas ni likes: el repositorio es muy reciente y no cuenta con validacion de la comunidad.
- Riesgo de alucinacion y sesgos: inherente a los modelos de lenguaje; no hay informacion especifica sobre mitigaciones aplicadas en el modelo base.
- Cuantizaciones extremas: las variantes IQ1_S e IQ2_XXS pueden degradar notablemente la calidad; se recomienda validar con tareas reales antes de usarlas.
- Proyector multimodal omitido: la etiqueta `skip_mmproj: 1` indica que, si el modelo base incluyera capacidades multimodales, estas no estarian disponibles en estas cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Persistent-Exploration-Gemma4-E4B-i1-GGUF
- Modelo base: https://huggingface.co/gsarch/Persistent-Exploration-Gemma4-E4B
