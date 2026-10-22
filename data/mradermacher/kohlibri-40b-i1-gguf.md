# mradermacher/Kohlibri-40B-i1-GGUF

## Resumen

Kohlibri-40B-i1-GGUF es la versión cuantizada en formato GGUF del modelo alemán johannhartmann/Kohlibri-40B, publicada por mradermacher, un cuantizador conocido por producir versiones imatrix (i1) de modelos abiertos. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 40.329.781.760 parámetros totales y orientación conversacional, entrenado y publicado específicamente para alemán. Esta ficha cubre la variante GGUF, no los pesos originales en safetensors.

El interés práctico de esta publicación es que permite ejecutar un modelo de 40.000 millones de parámetros en hardware de consumo mediante llama.cpp y derivados, con cuantizaciones que van desde 8,5 GB (IQ1_S) hasta 25,5 GB (Q4_1). Los cuantos i1 incorporan una matriz de importancia (imatrix) generada a partir de texto, lo que en la práctica mejora la perplejidad de las cuantizaciones de baja precisión respecto a las estáticas.

Hay dos limitaciones importantes que condicionan su evaluación. En primer lugar, no se ha publicado información sobre arquitectura detallada, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, ni en la model card del repo de cuantización ni en la información disponible. En segundo lugar, el modelo base ya está etiquetado como nvfp4 y compressed-tensors, lo que significa que estos GGUF son una recuantización de unos pesos que ya habían sido comprimidos, con la pérdida acumulada que eso implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), según etiqueta del repo; número de expertos y detalles no disponibles |
| Parametros totales | 40.329.781.760 (40,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1 (más fichero imatrix suelto) |
| Idiomas soportados | alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multi-parte); el modelo base se distribuye en safetensors con compressed-tensors / nvfp4 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `moe` del repositorio, que indica una arquitectura de mezcla de expertos con 40,3 B de parámetros totales. No se especifican el número de expertos, el número de expertos activos por token, la dimensión oculta, el número de capas ni la función de activación. Tampoco se documenta la longitud de contexto nativa, un dato crítico para evaluar su encaje en producción.

Respecto al entrenamiento, no hay información sobre volumen de tokens, composición del dataset, uso de RLHF/DPO o proceso de alineación. El modelo base (johannhartmann/Kohlibri-40B) aparece etiquetado con `nvfp4` y `compressed-tensors`, lo que sugiere que sus pesos se publicaron ya comprimidos en FP4 de NVIDIA mediante la librería compressed-tensors; los GGUF de este repo se habrían generado a partir de esos pesos. La model card del cuantizador indica `quantize_version: 2` y `output_tensor_quantised: 1`, y que las cuantizaciones son de tipo weighted/imatrix, generadas con una matriz de importancia propia (fichero `Kohlibri-40B.imatrix.gguf`).

## Capacidades

- Generación de texto conversacional en alemán, según la etiqueta `conversational` del repositorio.
- Razonamiento y respuesta multi-turno: no hay evaluación publicada que lo confirme.
- Generación de código, matemáticas y visión: no disponible en la información proporcionada; no hay ninguna etiqueta que indique soporte de visión.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al alemán según el campo `language` de la model card.
- Capacidades especiales (modo thinking, audio, visión): no disponibles.

## Casos de uso

- Asistentes conversacionales en alemán: el modelo está etiquetado como conversacional y entrenado para ese idioma, por lo que encaja en chatbots de atención al cliente en mercados DACH. La ausencia de contexto documentado obliga a validar empíricamente la ventana real antes de fijar la longitud de historial.
- Procesamiento de documentación técnica en alemán: resumen y reescritura de manuales, contratos o informes internos. Con cuantizaciones Q4_K_M (24,6 GB) se obtiene la mejor relación calidad/tamaño del repo y cabe en una GPU de 32 GB.
- Despliegue en local con requisitos de soberanía del dato: al ser Apache 2.0 y ejecutable con llama.cpp, permite inferencia completamente offline en estaciones de trabajo con GPU única, sin enviar texto a terceros.
- Prototipado e investigación sobre MoE en alemán: útil para estudiar el comportamiento de un MoE de 40 B cuantizado frente a modelos densos del mismo orden, con la salvedad de que no hay benchmarks de referencia.
- Generación aumentada por recuperación (RAG) sobre corpus germanófonos: combinable con un motor de embeddings y un índice vectorial; requiere medir previamente la ventana de contexto real.
- Fine-tuning ligero o experimentación con adaptadores: el repo GGUF no es el punto de partida adecuado; habría que usar el modelo base en safetensors y volver a cuantizar.
- Entornos con VRAM muy limitada: las variantes IQ2_M (13,5 GB) e IQ2_S (12,3 GB) permiten probar el modelo en GPUs de 16 GB asumiendo degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repo de cuantización ni los metadatos de HuggingFace incluyen valores de MMLU, HumanEval, GSM8K, perplejidad u otras métricas, ni para el modelo base ni para las variantes cuantizadas. Tampoco hay comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño de fichero más overhead de caché KV, que no se puede calcular sin conocer la longitud de contexto y el número de capas):
  - i1-IQ1_S: 8,5 GB de pesos, ~10-11 GB en ejecución.
  - i1-IQ2_M: 13,5 GB de pesos, ~15-16 GB en ejecución.
  - i1-IQ3_M: 18,0 GB de pesos, ~20-21 GB en ejecución.
  - i1-Q4_K_M: 24,6 GB de pesos, ~27-28 GB en ejecución.
  - Precisión completa en el modelo base (FP16/BF16 sobre 40,3 B): ~80,6 GB.
- GPU recomendadas por rango: RTX 3060 12 GB o RTX 4070 12 GB para IQ1_S/IQ2_XS; RTX 4080/5070 Ti 16 GB para IQ2_M/IQ3_XXS; RTX 3090/4090 24 GB para IQ3_M con contexto corto; RTX 5090 32 GB, A100 40 GB o H100 para Q4_K_M con contexto amplio y FP16 en A100/H100 80 GB.
- Cabe en GPU de consumo: sí, desde 12 GB con las cuantizaciones IQ1/IQ2 y desde 24 GB con IQ3/IQ4 ajustando el contexto.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp, llama-cpp-python. vLLM y TGI no consumen GGUF directamente; para esos motores habría que usar los safetensors del modelo base.
- Nota sobre MoE: en un modelo de mezcla de expertos todos los expertos deben residir en memoria aunque solo se activen unos pocos por token, por lo que el ahorro de VRAM proviene de la cuantización y no de la activación dispersa. El offload parcial a CPU con llama.cpp es viable pero penaliza la latencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kohlibri-40B-i1-GGUF (este) | 40,3 B (MoE) | no disponible | Alemán | Apache 2.0 | GGUF en HF; safetensors en el repo base |
| Teuken-7B-instruct (OpenGPT-X) | 7 B (denso) | no disponible | 24 lenguas europeas, incluido alemán | Apache 2.0 | Pesos abiertos y GGUF de terceros |
| Llama 3.1 8B Instruct | 8 B (denso) | 128 000 tokens | 8 idiomas, incluido alemán | Licencia comunitaria Llama 3.1 | Pesos abiertos, amplio ecosistema de cuantizaciones |
| Qwen3-30B-A3B | 30,5 B totales, 3,3 B activos (MoE) | 32 768 tokens nativos, ampliable con YaRN | ~119 idiomas | Apache 2.0 | Pesos abiertos y GGUF oficiales |

La comparación relevante es con Qwen3-30B-A3B: mismo orden de magnitud, también MoE, Apache 2.0 y con benchmarks publicados, frente a un modelo del que no existe ninguna evaluación pública. Si el requisito es alemán estricto y licencia permisiva, Teuken-7B es la alternativa documentada más directa en tamaño menor.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni de calidad ni de seguridad, ni para el modelo base ni para estas cuantizaciones. Cualquier decisión de producción exige una evaluación propia.
- Doble cuantización: los pesos de partida ya estaban comprimidos en nvfp4/compressed-tensors, de modo que las variantes i1 acumulan la pérdida de esa compresión más la de la cuantización GGUF. El efecto es especialmente acusado en IQ1 e IQ2.
- Calidad degradada en cuantizaciones bajas: el propio autor marca IQ1_S como "for the desperate" y Q2_K_S como "very low quality". No deben usarse en producción.
- Monolingüe: solo alemán según la model card. No hay evidencia de competencia en castellano ni en inglés.
- Contexto desconocido: sin longitud de contexto documentada no se puede dimensionar la caché KV ni garantizar conversaciones multi-turno largas o RAG con muchos fragmentos.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin benchmarks ni guía de alineación publicada no hay forma de acotarlo a priori.
- Sesgos: no documentados. Al estar entrenado solo con datos en alemán, es esperable un sesgo cultural y lingüístico hacia ese dominio, pero no hay análisis publicado que lo cuantifique.
- Licencia: Apache 2.0 permite uso comercial y modificaciones con atribución; conviene verificar que el modelo base mantiene la misma licencia (así consta en los metadatos).
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Requisito de disco: el repo completo ocupa 338,2 GB, por lo que conviene descargar solo el fichero de la cuantización deseada.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Kohlibri-40B-i1-GGUF
- Modelo base: https://huggingface.co/johannhartmann/Kohlibri-40B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Kohlibri-40B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Kohlibri-40B-i1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

Nota: la búsqueda web realizada no ha devuelto ninguna fuente relevante sobre este modelo; los resultados obtenidos corresponden a portales de autenticación universitarios sin relación con el contenido de la ficha.
