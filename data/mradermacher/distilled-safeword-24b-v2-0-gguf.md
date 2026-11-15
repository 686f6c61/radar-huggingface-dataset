# mradermacher/Distilled-Safeword-24B-v2.0-GGUF

## Resumen

Distilled-Safeword-24B-v2.0-GGUF es la distribucion en formato GGUF del modelo ReadyArt/Distilled-Safeword-24B-v2.0, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo base es un transformer denso de 23.572.403.200 parametros (aproximadamente 23,6 mil millones) orientado a generacion conversacional y roleplay, con etiquetas que declaran explicitamente contenido NSFW, explicito y "unaligned". El repositorio contiene unicamente pesos cuantizados estaticos en formato GGUF, no el modelo original en safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta una de las pocas distribuciones cuantizadas de un modelo de 24B pensado para inferencia local en hardware de consumo, con un rango de cuantizaciones que va de Q2_K (9,0 GB) a Q8_0 (25,2 GB). Por otro, advierte de las caracteristicas del modelo base: se trata de un modelo sin alineamiento de seguridad, con licencia Apache 2.0 pero con restricciones practicas de uso derivadas de su contenido. No se dispone de informacion sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la documentacion proporcionada.

El modelo esta pensado para usuarios que necesitan ejecutar localmente un modelo conversacional de gran tamano con control total sobre el contenido generado, sin las capas de rechazo tipicas de los modelos alineados. Su tamano de 24B lo situa en un punto intermedio entre los modelos de 7-8B (mas ligeros pero menos capaces) y los de 70B (mas capaces pero fuera del alcance de la mayoria de GPUs de consumo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso, inferido del formato y tamano) |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base ReadyArt/Distilled-Safeword-24B-v2.0 en la documentacion proporcionada. Por el numero de parametros (23,6B) y el formato de pesos, se trata de un transformer denso, no de una arquitectura MoE ni hibrida. El nombre "Distilled" sugiere que el modelo base fue obtenido mediante destilacion, pero no se especifica el modelo profesor, el dataset de destilacion ni el proceso de entrenamiento.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Las etiquetas "unaligned" y "dangerous" indican que el modelo no ha pasado por un proceso de alineamiento de seguridad convencional, lo que es coherente con su orientacion a roleplay explicito. La cuantizacion la ha realizado mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), que genera cuantizaciones estaticas a partir de los pesos en formato Hugging Face.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno y roleplay.
- Generacion de contenido explicito y NSFW sin las capas de rechazo de los modelos alineados.
- Capacidad de mantener personajes y contextos narrativos en conversaciones largas (segun la orientacion declarada del modelo base).
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad de vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Roleplay conversacional local: el modelo puede ejecutarse en local con llama.cpp u Ollama para mantener conversaciones de rol con personajes consistentes, sin depender de APIs externas ni de filtros de contenido. Su tamano de 24B ofrece mayor coherencia narrativa que modelos de 7-8B.
- Generacion de ficcion explicita: escritores que necesitan generar narrativa adulta sin restricciones de contenido pueden usar el modelo en cuantizacion Q4_K_M (14,4 GB) en una GPU de 24 GB, con control total sobre el tono y el contenido.
- Investigacion sobre modelos sin alineamiento: investigadores que estudian el comportamiento de modelos "unaligned" pueden usar esta distribucion cuantizada para experimentar con prompts que serian rechazados por modelos alineados, comparando respuestas.
- Prototipado de chatbots de personaje: desarrolladores que construyen aplicaciones de compania conversacional o entretenimiento para adultos pueden integrar el modelo via llama.cpp u Ollama con una API compatible con OpenAI (el repo incluye la etiqueta endpoints_compatible).
- Evaluacion de cuantizaciones: el rango de 11 cuantizaciones permite comparar la degradacion de calidad entre Q2_K y Q8_0 en tareas de generacion creativa, util para decidir el equilibrio entre VRAM y fidelidad.
- Despliegue en hardware de consumo: con Q4_K_S (13,6 GB) o IQ4_XS (13,0 GB) el modelo cabe en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB) o en 24 GB (RTX 3090, RTX 4090) con margen para contexto, lo que permite ejecutar un modelo de 24B en una sola GPU de consumo.
- Fine-tuning posterior sobre el modelo base: aunque esta distribucion es solo GGUF, el modelo base en safetensors puede servir como punto de partida para ajustes con LoRA en tareas de escritura creativa o roleplay especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin contexto):
  - Q2_K: 9,0 GB
  - Q3_K_S: 10,5 GB
  - Q3_K_M: 11,6 GB
  - Q3_K_L: 12,5 GB
  - IQ4_XS: 13,0 GB
  - Q4_K_S: 13,6 GB
  - Q4_K_M: 14,4 GB
  - Q5_K_S: 16,4 GB
  - Q5_K_M: 16,9 GB
  - Q6_K: 19,4 GB
  - Q8_0: 25,2 GB
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M con contexto amplio; A100 40GB o H100 para Q8_0 con contexto largo; RTX 4080 (16 GB) o RTX 4060 Ti 16GB para IQ4_XS o Q4_K_S con contexto moderado.
- Cabe en GPU de consumo: si, en GPUs de 16 GB o mas con cuantizaciones Q4 o inferiores; en GPUs de 24 GB caben hasta Q6_K con contexto razonable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El repo incluye la etiqueta endpoints_compatible, lo que sugiere compatibilidad con APIs tipo OpenAI a traves de servidores como llama.cpp server o vLLM (este ultimo con soporte GGUF limitado).
- Latencia y throughput: no disponible. Dependera del hardware y de la cuantizacion; como referencia cualitativa, Q4_K_M se marca como "fast, recommended" y Q8_0 como "fast, best quality" en la model card, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Distilled-Safeword-24B-v2.0-GGUF | 23,6B | no disponible | Apache 2.0 | GGUF | Orientado a roleplay NSFW, sin alineamiento |
| Modelos densos de 24B alineados (generico) | ~24B | variable | variable | safetensors/GGUF | Mayor seguridad pero rechazan contenido explicito |
| Modelos de 7-8B sin alineamiento (generico) | ~7-8B | variable | variable | GGUF | Menor calidad narrativa, caben en GPUs de 8 GB |
| Modelos de 70B cuantizados (generico) | ~70B | variable | variable | GGUF | Mayor calidad pero requieren 40+ GB de VRAM |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas concretas. La comparativa anterior es cualitativa y basada en categorias generales, no en modelos especificos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: las etiquetas "unaligned" y "dangerous" indican que el modelo puede generar contenido danino, explicito o socialmente inapropiado sin filtros. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Contenido NSFW y explicito: el modelo esta disenado para generar contenido adulto; su uso en entornos profesionales o con menores es inapropiado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo, puede producir afirmaciones falsas con apariencia de veracidad.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se especifica la ventana de contexto del modelo base, lo que dificulta planificar aplicaciones que requieran contextos largos.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad legal recae en el usuario.
- Solo ingles y sin herramientas: no hay soporte documentado de tool calling, agentes ni vision, lo que limita su uso en pipelines automatizados complejos.
- Repositorio unicamente GGUF: no contiene los pesos originales en safetensors; para fine-tuning hay que acudir al modelo base ReadyArt/Distilled-Safeword-24B-v2.0.
- Modelo con pocas descargas (96) y un solo "like": la validacion comunitaria es minima, lo que reduce la confianza en la calidad de las cuantizaciones y en la estabilidad del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Distilled-Safeword-24B-v2.0-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Distilled-Safeword-24B-v2.0
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Distilled-Safeword-24B-v2.0-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Distilled-Safeword-24B-v2.0-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
