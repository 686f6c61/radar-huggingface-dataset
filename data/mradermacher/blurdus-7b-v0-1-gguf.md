# mradermacher/Blurdus-7b-v0.1-GGUF

## Resumen

Blurdus-7b-v0.1-GGUF es la version cuantizada en formato GGUF del modelo gate369/Blurdus-7b-v0.1, un modelo de lenguaje de 7.241.732.096 parametros (aproximadamente 7,24 mil millones) obtenido mediante tecnicas de fusion de modelos (model merge). La cuantizacion ha sido realizada por mradermacher, un autor habitual de versiones GGUF en Hugging Face, y se distribuye bajo licencia Apache 2.0.

El modelo base es el resultado de una fusion con mergekit (concretamente lazymergekit) de tres modelos de 7B: 222gate/Blurred-Beagle-7b-slerp, 222gate/BrurryDog-7b-v0.1 y liminerity/Blur-7b-v1.21. Se trata, por tanto, de un modelo derivado de la familia Mistral/Llama de 7B, orientado a generacion de texto en ingles y publicado como modelo base (no instruct). Su relevancia practica esta en que ofrece una version lista para ejecucion local en hardware de consumo mediante llama.cpp y derivados, sin necesidad de GPU de datacenter.

La ficha se centra en la version GGUF distribuida por mradermacher, que incluye 12 cuantizaciones estaticas desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite desplegar el modelo en un rango amplio de hardware, desde portatiles con poca VRAM hasta estaciones de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo fusionado con mergekit/lazymergekit; familia Mistral/Llama de 7B) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base gate369/Blurdus-7b-v0.1 esta en formato transformers |

## Arquitectura y entrenamiento

El modelo base es una fusion de tres modelos de 7B realizada con mergekit en modo lazymergekit. Los modelos de origen son 222gate/Blurred-Beagle-7b-slerp, 222gate/BrurryDog-7b-v0.1 y liminerity/Blur-7b-v1.21. La tecnica SLERP (spherical linear interpolation) aparece explicitamente en el nombre de uno de los modelos fusionados, lo que indica que al menos parte de la fusion emplea interpolacion esferica de pesos. No se dispone de informacion sobre la receta exacta de fusion (pesos, capas o metodos combinados) ni sobre datos de entrenamiento adicionales, RLHF o DPO.

Al tratarse de una fusion de pesos y no de un reentrenamiento, no hay un corpus de entrenamiento propio documentado. La cuantizacion la ha realizado mradermacher con su pipeline habitual, que incluye cuantizaciones estaticas y, en un repositorio separado (i1-GGUF), cuantizaciones ponderadas con imatrix. No se documentan innovaciones tecnicas propias como atencion lineal, decodificacion especulativa o modos de razonamiento.

## Capacidades

- Generacion de texto en ingles a partir de un prompt, como modelo base (no ajustado para instrucciones).
- Continuacion de texto y finalizacion de secuencias, adecuado para tareas de completado.
- Capacidades de razonamiento y conocimiento general heredadas de los modelos de 7B fusionados; no hay evaluacion publicada que las cuantifique.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local de generacion de texto: al ser un modelo base de 7B en GGUF, permite experimentar con completados y prompts en un portatil con GPU de consumo usando llama.cpp u Ollama, sin infraestructura adicional.
- Fine-tuning ligero sobre dominio propio: al estar disponible en transformers y en GGUF, sirve como punto de partida para ajustes con LoRA/QLoRA en tareas de completado especificas (redaccion tecnica, resumenes) en ingles.
- Evaluacion comparativa de fusiones: util para investigadores que quieran reproducir o comparar el comportamiento de fusiones de 7B frente a los modelos de origen (Blurred-Beagle, BrurryDog, Blur), dado que el modelo base y sus componentes estan publicados.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (4,2 GB) y Q4_K_M (4,5 GB) permiten ejecucion en GPUs de 6-8 GB de VRAM o en CPU con llama.cpp, adecuado para demos y entornos de desarrollo.
- Generacion de texto por lotes en CPU: la version Q2_K (2,8 GB) o Q3_K_S (3,3 GB) permite procesar lotes de completados en servidores sin GPU, con la perdida de calidad asociada a cuantizaciones bajas.
- Base para experimentos de cuantizacion: el repositorio incluye 12 variantes de cuantizacion, lo que facilita medir el impacto de la cuantizacion en perplejidad y calidad para este tipo de fusiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,6 GB; Q3_K_L ~3,9 GB; IQ4_XS ~4,0 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,1 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. A estas cifras hay que sumar el overhead de contexto y del runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas (Q6_K, Q8_0, f16); A100 y H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6-8 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en transformers, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Blurdus-7b-v0.1 (este) | 7,24 B | no disponible | Apache 2.0 | GGUF, transformers | Fusion de 3 modelos de 7B |
| 222gate/Blurred-Beagle-7b-slerp | ~7 B | no disponible | no disponible en la informacion | transformers | Componente de la fusion |
| 222gate/BrurryDog-7b-v0.1 | ~7 B | no disponible | no disponible en la informacion | transformers | Componente de la fusion |
| liminerity/Blur-7b-v1.21 | ~7 B | no disponible | no disponible en la informacion | transformers | Componente de la fusion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado para instrucciones: no se debe esperar un comportamiento de asistente conversacional sin tecnicas de prompting o fine-tuning adicionales.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta sin verificar la configuracion del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y no cuantificado en la informacion disponible.
- Sesgos: no documentados por el autor; al derivar de modelos de 7B sin informacion de composicion de datos, no se puede evaluar el sesgo de forma fiable.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del propio autor; para produccion se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos de origen de la fusion, que no se detallan en la informacion disponible.
- El repositorio tiene un tamano de 63,9 GB por incluir todas las cuantizaciones; la descarga selectiva de un solo archivo es necesaria.
- No hay garantias de soporte ni mantenimiento por parte del autor del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Blurdus-7b-v0.1-GGUF
- Modelo base: https://huggingface.co/gate369/Blurdus-7b-v0.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Blurdus-7b-v0.1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Blurdus-7b-v0.1-GGUF
- Modelo fusionado 1: https://huggingface.co/222gate/Blurred-Beagle-7b-slerp
- Modelo fusionado 2: https://huggingface.co/222gate/BrurryDog-7b-v0.1
- Modelo fusionado 3: https://huggingface.co/liminerity/Blur-7b-v1.21
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
