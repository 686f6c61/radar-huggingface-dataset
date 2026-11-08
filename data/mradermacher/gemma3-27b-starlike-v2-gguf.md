# mradermacher/gemma3-27b-starlike-v2-GGUF

## Resumen

`mradermacher/gemma3-27b-starlike-v2-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `ToastyPigeon/gemma3-27b-starlike-v2`, un merge creado con mergekit a partir de la familia Gemma 3 de Google. El modelo base parte de una arquitectura transformer con aproximadamente 27.009 millones de parametros (27B), lo que lo situa en la gama alta de modelos abiertos de uso local. Esta version GGUF la publica mradermacher, un conocido cuantizador de la comunidad que genera versiones estaticas (sin imatrix) para su uso con llama.cpp y derivados.

El interes principal de esta ficha es practico: permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB), pasando por opciones recomendadas como Q4_K_M (16,6 GB). El repo incluye tambien ficheros `mmproj` (multi-modal supplement), lo que indica que el modelo base conserva capacidad de vision heredada de Gemma 3. Los idiomas declarados se limitan al ingles.

Cabe senalar que se trata de un merge de la comunidad, no de un modelo oficial de Google, y que la model card es minima: no documenta datos de entrenamiento, benchmarks ni detalles del proceso de mezcla. La licencia no aparece declarada en la informacion disponible, lo que es un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Gemma 3); merge con mergekit |
| Parametros totales | 27.009.007.616 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con ficheros mmproj para vision) |

## Arquitectura y entrenamiento

El modelo subyacente es un merge generado con mergekit a partir de la familia Gemma 3, segun los tags del repositorio. La arquitectura es por tanto un transformer decoder-only de aproximadamente 27B parametros, con los componentes multimodales (vision) que Gemma 3 incorpora y que se reflejan en la presencia de ficheros `mmproj` en este repo GGUF. No se dispone de informacion sobre la receta de mezcla concreta (que modelos se combinaron, con que pesos o metodo de merge), ni sobre datos de entrenamiento, numero de tokens, composicion del dataset o si hubo etapas de RLHF/DPO. Tampoco se documenta ninguna innovacion tecnica especifica del merge.

El trabajo de mradermacher consiste en la cuantizacion estatica del modelo base a multiples precisiones, sin emplear imatrix en este repo (las versiones con imatrix se publican en un repositorio separado, `gemma3-27b-starlike-v2-i1-GGUF`). La cuantizacion estatica tiende a ofrecer peor calidad que las versiones IQ de tamano similar en los rangos bajos, tal como el propio autor advierte en su model card.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3.
- Capacidad multimodal (vision) gracias a los ficheros `mmproj` incluidos; el modelo puede procesar imagenes junto con texto.
- Razonamiento y respuesta a instrucciones, segun el comportamiento tipico de la familia Gemma 3 (no documentado especificamente para este merge).
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repo.
- Capacidad de "thinking mode": no disponible en la informacion.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de 24 GB usando Q4_K_M (16,6 GB), ofreciendo conversaciones multi-turno sin depender de APIs externas.
- Analisis de imagenes con descripcion textual: cargando el fichero `mmproj` junto con los pesos principales, se puede usar para tareas de captioning, extraccion de informacion de capturas o clasificacion visual asistida.
- Prototipado de pipelines de IA generativa: util para equipos que quieran experimentar con un modelo de 27B en local antes de comprometerse con infraestructura en la nube, gracias a la variedad de cuantizaciones disponibles.
- Generacion de documentacion tecnica en ingles: el modelo puede redactar y resumir textos largos, aunque la longitud de contexto no esta documentada y debe validarse empiricamente.
- Fine-tuning ligero o LoRA sobre el modelo base: al existir el repo en safetensors (`ToastyPigeon/gemma3-27b-starlike-v2`), se puede adaptar y luego cuantizar de nuevo a GGUF para despliegue.
- Evaluacion comparativa de merges comunitarios: investigadores que estudien el efecto de mergekit sobre Gemma 3 pueden usar este modelo como punto de comparacion frente al Gemma 3 original.
- Despliegue en entornos con GPU de gama alta pero sin acceso a internet: la cuantizacion Q8_0 (28,8 GB) permite maxima calidad en una A100 40GB o H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion del repo):
  - Q2_K: ~10,6 GB
  - Q3_K_M: ~13,5 GB
  - IQ4_XS: ~15,0 GB
  - Q4_K_M: ~16,6 GB (recomendado por el autor)
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40GB o H100 para Q6_K y Q8_0; para cuantizaciones bajas (Q2_K, Q3_K) cabe en GPUs de 12-16 GB con margen limitado para contexto.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con cuantizaciones Q3 o IQ4_XS y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Tambien puede usarse con transformers si se convierte, pero el formato nativo de este repo es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma3-27b-starlike-v2-GGUF (este) | ~27B | no disponible | no disponible | GGUF | Merge comunitario de Gemma 3, solo ingles |
| Gemma 3 27B (Google) | ~27B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF oficial | Modelo original, multilingue, con benchmarks publicados |
| mradermacher/gemma3-27b-v2-starlike-i1-GGUF | ~27B | no disponible | no disponible | GGUF (imatrix) | Version con imatrix del mismo merge, calidad superior en rangos bajos |
| Qwen2.5 32B (referencia de gama similar) | ~32B | 128K (segun documentacion oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa multilingue con licencia permisiva |

La comparativa se limita a lo que se puede inferir de la informacion disponible; no hay datos de rendimiento para posicionar este merge frente a los modelos citados.

## Limitaciones y advertencias

- Modelo solo en ingles segun el campo `language`; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia no declarada: no se puede asumir uso comercial permitido sin verificar la licencia del modelo base `ToastyPigeon/gemma3-27b-starlike-v2` y de Gemma 3 (Gemma Terms of Use).
- Al ser un merge de la comunidad sin benchmarks, el riesgo de degradacion respecto al Gemma 3 original es real y no cuantificado.
- La model card no documenta contexto maximo, datos de entrenamiento ni sesgos conocidos; hay que asumir los sesgos tipicos de los modelos entrenados principalmente en ingles.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_M o superior.
- El repo ocupa 188,1 GB en total por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Fecha de actualizacion del repo (2026-11-08) posterior a la de creacion; conviene revisar si el modelo base ha cambiado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma3-27b-starlike-v2-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma3-27b-starlike-v2-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/ToastyPigeon/gemma3-27b-starlike-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma3-27b-starlike-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
