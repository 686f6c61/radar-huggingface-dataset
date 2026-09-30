# Juan663/gemma-4-E4B-it

## Resumen

Juan663/gemma-4-E4B-it es un ajuste fino publicado por el usuario Juan663 sobre el modelo base google/gemma-4-E4B, desarrollado originalmente por Google DeepMind. Se distribuye a traves de HuggingFace con la libreria transformers y pesos en formato safetensors, y esta etiquetado con el pipeline any-to-any, lo que refleja la naturaleza multimodal del modelo base (entrada de texto, imagen y audio, salida de texto). El repositorio tiene un tamano de 16 GB y 7.996.156.490 parametros totales almacenados en los ficheros de safetensors, coherente con la variante E4B de la familia Gemma 4 (8B con embeddings, 4,5B efectivos).

El modelo base E4B es una arquitectura densa de 42 capas disenada para ejecucion en dispositivos locales (moviles, portatiles y GPUs de consumo), con una ventana de contexto de 128K tokens, atencion hibrida que combina ventanas deslizantes locales de 512 tokens con atencion global completa, y un vocabulario de 262.000 tokens. Incorpora codificadores dedicados de vision (unos 150M de parametros) y de audio (unos 300M), ademas de Per-Layer Embeddings (PLE) para maximizar la eficiencia de parametros en despliegues on-device.

La relevancia de esta publicacion concreta es limitada y debe interpretarse con cautela: se trata de un repositorio de terceros sin descargas ni valoraciones en el momento de la consulta, sin model card propia mas alla de la del modelo base, y sin informacion publicada sobre el procedimiento de ajuste, los datos utilizados ni evaluaciones comparativas frente al modelo original. Para uso en produccion, la referencia recomendable sigue siendo el repositorio oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 7.996.156.490 (aproximadamente 8B con embeddings; 4,5B efectivos segun la model card del modelo base) |
| Parametros activos | No aplica: la variante E4B es densa, no MoE |
| Longitud de contexto | 128K tokens (modelo base E4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 140 idiomas (segun la model card de la familia Gemma 4) |
| Licencia | apache-2.0 declarada en el repositorio, con enlace a la licencia de Gemma 4 |
| Formato de pesos | safetensors (repositorio de 16 GB, compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la variante E4B de Gemma 4: un transformer denso de 42 capas con una mecanica de atencion hibrida que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Las capas globales emplean claves y valores unificados junto con Proportional RoPE (p-RoPE) para reducir el consumo de memoria en contextos largos. La letra "E" de E4B significa "effective": el modelo incorpora Per-Layer Embeddings, es decir, tablas de embedding adicionales por capa que son grandes en numero de parametros pero solo se usan para consultas rapidas, de ahi la diferencia entre los 4,5B efectivos y los 8B totales. La multimodalidad se resuelve con codificadores dedicados de vision (aproximadamente 150M de parametros) y de audio (aproximadamente 300M) que proyectan las entradas al espacio del decodificador.

En cuanto al entrenamiento de este repositorio concreto, no hay informacion disponible: la model card publicada es la del modelo base de Google y no describe el dataset, el numero de tokens, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documenta si el ajuste se hizo sobre la variante preentrenada o sobre la variante instruction-tuned de google/gemma-4-E4B, pese a que el nombre del repositorio incluye el sufijo "-it". El modelo base, por su parte, si declara capacidades de razonamiento con modos de pensamiento configurables, soporte nativo del rol de sistema (system prompt) y function calling nativo.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta disenado como razonador capaz, con modos de pensamiento configurables.
- Procesamiento de imagen: soporta entrada de imagen con relacion de aspecto y resolucion variables.
- Procesamiento de audio: la variante E4B incluye codificador de audio nativo.
- Codigo: la familia Gemma 4 declara mejoras notables en benchmarks de programacion y capacidades agenticas.
- Tool calling y function calling: soporte nativo declarado en el modelo base.
- Flujos agenticos: capacidad para razonamiento multi-paso y uso autonomo de herramientas.
- Multilingue: soporte declarado de mas de 140 idiomas.
- System prompt nativo: la familia Gemma 4 introduce soporte nativo del rol system.
- Contexto largo: ventana de 128K tokens en la variante E4B.
- Capacidades especificas de este ajuste: no disponible (no se documentan capacidades anadidas o modificadas respecto al modelo base).

## Casos de uso

- Asistente multimodal en dispositivo: al ser una variante "effective" de 4,5B, puede desplegarse en telefonos y portatiles para transcripcion y resumen de audio, descripcion de imagenes y respuesta conversacional, manteniendo la inferencia en local.
- Atencion al cliente automatizada: la ventana de 128K tokens permite gestionar conversaciones multi-turno con historial extenso, y el soporte nativo del rol system facilita fijar el tono, las politicas y las restricciones del asistente.
- Generacion de codigo asistida: el modelo base declara mejoras en programacion y soporte de function calling, lo que permite integrarlo en asistentes de IDE o en pipelines de revision que invocan herramientas externas de compilacion y test.
- Agentes autonomos con herramientas: el function calling nativo habilita agentes que encadenan llamadas a APIs, consultas a bases de datos y ejecucion de acciones en varios pasos.
- Analisis de documentos escaneados: la entrada de imagen con resolucion variable permite procesar capturas, formularios y diagramas junto con texto para extraer y resumir informacion.
- Traduccion y atencion multilingue: con mas de 140 idiomas declarados, es viable para soporte internacional o traduccion de contenidos tecnicos.
- Prototipado e investigacion en hardware de consumo: su tamano permite iterar rapidamente en una unica GPU de gama alta o incluso en portatiles, sin costes de API.
- Nota: no hay informacion publicada sobre rendimiento especifico de este ajuste en ninguno de estos escenarios, por lo que la idoneidad practica debe validarse con evaluacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del modelo base afirma mejoras en capacidades de codigo y agenticas, asi como mejoras de seguridad frente a Gemma 3 y 3n, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. Tampoco existe ninguna evaluacion publicada de este ajuste concreto frente al modelo original.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos, mas la cache KV; en contextos largos la cache crece de forma apreciable.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5 GB para pesos.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue en precision completa con contexto largo.
- GPUs de consumo: cabe en RTX 4090 (24 GB) en bf16 con margen razonable; con cuantizacion de 8 o 4 bits es viable en RTX 3090, RTX 4080 y tarjetas de 12 GB o menos.
- Despliegue en edge: el modelo base esta disenado para ejecucion on-device; existe una ficha de Gemma-4-E4B-it en Qualcomm AI Hub y una entrada en Microsoft Foundry.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, llama.cpp u Ollama si se generan cuantizaciones GGUF (no confirmadas en este repositorio). El tag endpoints_compatible sugiere compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa dentro de la familia Gemma 4, con datos de la model card oficial de la familia. No se dispone de datos de rendimiento para este ajuste concreto.

| Modelo | Parametros totales | Parametros activos | Capas | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|---|
| Gemma 4 E4B (base de este ajuste) | 4,5B efectivos / 8B con embeddings | No aplica (denso) | 42 | 128K | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 E2B | 2,3B efectivos / 5,1B con embeddings | No aplica (denso) | 35 | 128K | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 12B Unified | 11,95B | No aplica (denso) | 48 | 256K | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 26B A4B | 25,2B | 3,8B | 30 | 256K | Texto, imagen | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 31B Dense | 30,7B | No aplica (denso) | 60 | 256K | Texto, imagen | Apache 2.0 / licencia Gemma 4 |

Frente a alternativas de otros fabricantes del mismo rango de tamano (modelos multimodales compactos de 3B-9B), no se dispone de datos comparativos en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Procedencia del repositorio: se trata de una publicacion de un usuario individual (Juan663), no de Google DeepMind. No hay verificacion de que el ajuste preserve el comportamiento del modelo original.
- Ausencia de documentacion del ajuste: no se especifican datos de entrenamiento, hiperparametros, metodologia ni diferencias respecto al modelo base, lo que impide auditar el modelo.
- Sin adopcion ni validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta, sin evidencia de uso en produccion.
- Ambiguedad de licencia: el repositorio declara apache-2.0 pero enlaza a la licencia especifica de Gemma 4, que impone condiciones de uso adicionales. Debe revisarse la licencia real aplicable antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones de fidelidad para este ajuste.
- Sesgos: no se han publicado analisis de sesgo ni evaluaciones de equidad para este repositorio. La model card del modelo base menciona pruebas de seguridad, pero sin cifras concretas.
- Idiomas: aunque la familia base declara mas de 140 idiomas, no hay garantia de que el ajuste mantenga ese soporte; no se documentan los idiomas del ajuste.
- Contexto: 128K tokens declarados en el modelo base, pero el rendimiento real en ventanas muy largas depende de la implementacion y de la memoria disponible.
- Cuantizaciones: no se ofrecen ficheros GGUF ni cuantizaciones listas para usar en el repositorio; habria que generarlas.
- Para entornos de produccion se recomienda usar el repositorio oficial google/gemma-4-E4B en lugar de este ajuste, salvo que exista una evaluacion propia que justifique lo contrario.

## Enlaces

- Repositorio de este ajuste: https://huggingface.co/Juan663/gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Coleccion de la familia Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Repositorio GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/gemma_4_e4b_it
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/google--gemma-4-e4b-it
