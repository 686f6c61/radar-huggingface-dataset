# mradermacher/Rostam-S1-4B-GGUF

## Resumen

Rostam-S1-4B es un modelo de lenguaje de 4.112.079.360 parametros (aproximadamente 4,1 mil millones) desarrollado por MOB AI (organizacion `officialmobai` en HuggingFace) y orientado a razonamiento, matematicas, fisica, generacion de codigo y flujos agenticos. La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido cuantizador de la comunidad que distribuye pesos listos para su uso con llama.cpp y derivados.

El modelo base esta etiquetado con los idiomas ingles y persa (farsi), lo que lo situa como una propuesta poco habitual: un modelo de razonamiento de tamano compacto con soporte nativo de persa, una lengua con relativamente pocos modelos abiertos de calidad. La licencia Apache 2.0 facilita su adopcion comercial sin restricciones adicionales.

La relevancia actual de esta publicacion radica en la disponibilidad de cuantizaciones estaticas (desde Q2_K hasta f16, pasando por IQ4_XS y Q8_0) que permiten ejecutar un modelo de 4B orientado a razonamiento en hardware de consumo, con tamanos que van de 1,9 GB a 8,3 GB. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es, sin embargo, muy limitada: la model card del repositorio GGUF es fundamentalmente una guia de cuantizaciones y no detalla el proceso de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin detalle publicado en la informacion disponible) |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); disponibles tambien cuantizaciones ponderadas/imatrix en el repo `Rostam-S1-4B-i1-GGUF` |
| Idiomas soportados | ingles (en), persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye presumiblemente en safetensors via transformers, aunque no se detalla en la informacion disponible |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base `officialmobai/Rostam-S1-4B` en los datos proporcionados. Por el tamano (4,1B parametros) y las etiquetas del repositorio (`llm`, `reasoning`, `agentic`), se trata de un modelo de lenguaje de tipo transformer decoder-only, pero no se confirma si emplea atencion completa, atencion lineal, arquitectura hibrida o alguna variante MoE. Tampoco se detalla la longitud de contexto nativa.

Respecto al entrenamiento, la informacion disponible no incluye numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o post-entrenamiento especifico para razonamiento. Las etiquetas sugieren un enfasis en dominios cientificos (matematicas, fisica) y en capacidades agenticas, pero no hay datos verificables sobre el pipeline de entrenamiento. Cualquier afirmacion adicional sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional en ingles y persa.
- Razonamiento de multiples pasos, segun las etiquetas `reasoning` y `agentic` del repositorio.
- Resolucion de problemas de matematicas y fisica (etiquetas `math` y `physics`).
- Generacion de codigo (etiqueta `code`).
- Flujos agenticos y de multiples pasos (etiqueta `agentic`).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no confirmado en la informacion disponible.
- Multilingue limitado a ingles y persa.

## Casos de uso

- Atencion al cliente en persa e ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, lo que resulta util para empresas que atienden a usuarios iranies o de la diaspora. La licencia Apache 2.0 permite su integracion en productos comerciales sin obligaciones de atribucion adicionales.
- Tutoria de matematicas y fisica: dado su enfoque declarado en estas disciplinas, puede emplearse como asistente educativo que resuelve problemas paso a paso, con la salvedad de que no hay benchmarks publicados que cuantifiquen su precision.
- Generacion de codigo asistida en entornos con recursos limitados: al caber en cuantizaciones de 2,5-3,5 GB, puede desplegarse en portatiles o estaciones de trabajo sin GPU dedicada mediante llama.cpp, sirviendo como autocompletado o generador de fragmentos en editores.
- Agentes locales y automatizacion de tareas: las etiquetas `agentic` sugieren capacidad para razonamiento multi-paso; puede integrarse en pipelines de automatizacion que requieran un modelo pequeno ejecutandose en local por motivos de privacidad.
- Procesamiento de documentacion tecnica bilingue: traduccion y resumen de textos tecnicos entre ingles y persa, aprovechando el soporte nativo de ambos idiomas.
- Prototipado rapido de aplicaciones de razonamiento: su tamano compacto y su licencia permisiva lo hacen adecuado para experimentar con tecnicas de razonamiento encadenado antes de escalar a modelos mayores.
- Despliegue en entornos con restricciones de hardware: con cuantizaciones Q4_K_M (2,7 GB) puede ejecutarse en GPUs de 4-6 GB de VRAM o incluso en CPU, lo que facilita su uso en dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K (1,9 GB): ~2,5-3 GB de VRAM con contexto moderado.
  - Q4_K_M (2,7 GB): ~3,5-4,5 GB de VRAM.
  - Q6_K (3,5 GB): ~4,5-5,5 GB de VRAM.
  - Q8_0 (4,5 GB): ~5,5-6,5 GB de VRAM.
  - f16 (8,3 GB): ~9-10 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia. Cualquier GPU con 6 GB o mas puede ejecutar las cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 6 GB o mas; las cuantizaciones Q4_K_S y Q4_K_M (2,5-2,7 GB) caben incluso en GPUs de 4 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rostam-S1-4B (este) | 4,1B | no disponible | en, fa | Apache 2.0 | GGUF, transformers |
| Qwen2.5-3B / 7B | 3B / 7B | 32K (Qwen2.5) | multilingue amplio | Apache 2.0 (3B), otras variantes | GGUF, safetensors |
| Llama 3.2 3B | 3B | 128K | multilingue | Llama 3.2 Community License | GGUF, safetensors |
| Gemma 2 2B | 2B | 8K | multilingue | Gemma Terms of Use | GGUF, safetensors |

La comparativa es orientativa: no hay benchmarks publicados de Rostam-S1-4B que permitan una comparacion cuantitativa con estos modelos. Su principal diferenciador es el soporte nativo de persa, area en la que los modelos occidentales suelen rendir por debajo. En contrapartida, su contexto nativo no esta documentado, lo que dificulta compararlo en esa dimension.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar las capacidades de razonamiento, matematicas o codigo que declaran las etiquetas del repositorio.
- Sesgos conocidos: no documentados. Al estar entrenado principalmente en ingles y persa, es probable que presente sesgos culturales y linguisticos derivados de la composicion del corpus, que no se detalla.
- Riesgo de alucinacion: inherente a los modelos de 4B; la falta de datos sobre el entrenamiento impide estimar su magnitud. En dominios cientificos (fisica, matematicas) conviene verificar las respuestas.
- Limitaciones de contexto e idioma: solo se declaran ingles y persa; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia del modelo base `officialmobai/Rostam-S1-4B` por si difiere.
- Caveat para produccion: la model card del repositorio GGUF es una guia de cuantizaciones, no una ficha tecnica del modelo; falta informacion sobre contexto, tool calling y formato de chat, lo que complica la integracion en produccion sin pruebas empiricas previas.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable (la propia model card marca Q3_K_M como "lower quality").

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rostam-S1-4B-GGUF
- Modelo base: https://huggingface.co/officialmobai/Rostam-S1-4B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Rostam-S1-4B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Rostam-S1-4B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
