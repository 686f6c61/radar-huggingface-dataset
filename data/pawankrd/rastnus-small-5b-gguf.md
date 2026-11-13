# PawanKrd/RastNus-Small-5B-GGUF

## Resumen

RastNus-Small-5B-GGUF es la distribucion en formato GGUF del modelo RastNus-Small-5B, desarrollado por PawanKrd y especializado en correccion gramatical, ortografica y de puntuacion en kurdo central (sorani, `ckb`). El modelo parte de una base Gemma 4 E2B, segun los metadatos de la model card, y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion comercial. Con aproximadamente 4.630 millones de parametros totales y alrededor de 2.000 millones efectivos, esta pensado para ejecutarse en hardware modesto mediante llama.cpp y runtimes compatibles.

La relevancia de este modelo radica en su especializacion: el kurdo sorani es un idioma con recursos limitados en el ecosistema de modelos abiertos, y las tareas de normalizacion ortografica y correccion gramatical requieren un conocimiento linguistico especifico que los modelos generalistas no cubren con fiabilidad. Este repositorio ofrece unicamente los pesos cuantizados en GGUF; el modelo original en safetensors se publica en el repositorio PawanKrd/RastNus-Small-5B.

El repositorio tiene un tamano de 48,9 GB, coherente con la inclusion de multiples niveles de cuantizacion. La model card indica que todas las cuantizaciones por debajo de 16 bits se generaron con una importance matrix calculada sobre datos de correccion en kurdo del dominio, un detalle tecnico que busca preservar la calidad en la tarea objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E2B, segun la model card) |
| Parametros totales | 4.628.643.107 |
| Parametros activos | aproximadamente 2.000 millones efectivos (indicado como "~2B effective" en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | multiples niveles GGUF por debajo de 16 bits, generados con importance matrix; niveles concretos no disponibles |
| Idiomas soportados | kurdo central / sorani (`ckb`) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 en los metadatos) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card identifica el modelo como derivado de Gemma 4 E2B, lo que sugiere una arquitectura transformer con un diseno de parametros efectivos reducidos (aproximadamente 2.000 millones efectivos frente a 4.630 millones totales). No se especifica en la informacion disponible si se trata de un esquema de mezcla de expertos, de embeddings compartidos u otra tecnica de eficiencia; el dato "~2B effective" es el unico indicador disponible.

No se han publicado en la informacion proporcionada detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales. El unico dato relevante sobre el proceso de cuantizacion es que las versiones por debajo de 16 bits emplean una importance matrix calculada sobre datos de correccion en kurdo del dominio, lo que indica un ajuste deliberado para preservar el rendimiento en la tarea de correccion linguistica.

## Capacidades

- Correccion gramatical en kurdo central (sorani): deteccion y correccion de errores de concordancia, morfologia y sintaxis.
- Correccion ortografica: normalizacion de grafias y deteccion de errores de escritura en alfabeto arabe adaptado al kurdo.
- Restauracion de puntuacion: insercion y correccion de signos de puntuacion en textos sin marcar o mal puntuados.
- Generacion de texto conversacional: la etiqueta `conversational` indica soporte de formato de dialogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs de inferencia estandar.
- Ejecucion local mediante llama.cpp, LM Studio, Ollama y llama-cpp-python.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al kurdo central segun los metadatos; no se documenta soporte de otros idiomas.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Correccion de textos periodisticos en kurdo sorani: integrado en el flujo editorial, el modelo puede normalizar ortografia y puntuacion de articulos antes de su publicacion, reduciendo la carga de revision manual en un idioma con herramientas limitadas.
- Preprocesamiento de corpus para NLP: antes de entrenar modelos o construir indices de busqueda en kurdo, el modelo puede limpiar y normalizar grandes volumenes de texto, mejorando la consistencia del corpus.
- Asistencia a la escritura en entornos educativos: estudiantes de kurdo sorani pueden usar el modelo para revisar redacciones y recibir correcciones gramaticales, aprovechando su especializacion frente a modelos generalistas.
- Moderacion y normalizacion de contenido generado por usuarios: en foros o redes sociales en kurdo, el modelo puede estandarizar publicaciones antes de almacenarlas o analizarlas, facilitando tareas posteriores de clasificacion.
- Digitalizacion de documentos historicos: aplicado a transcripciones OCR de textos en kurdo, el modelo puede corregir errores de reconocimiento y restaurar puntuacion perdida.
- Integracion en editores de texto y correctores ortograficos: al distribuirse en GGUF y ejecutarse con llama.cpp, puede incorporarse en aplicaciones de escritorio o moviles con requisitos de hardware moderados, ofreciendo correccion local sin dependencia de la nube.
- Localizacion de interfaces y documentacion tecnica: revision de traducciones al kurdo central para garantizar coherencia ortografica y gramatical en productos de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4.630 millones de parametros, las cuantizaciones de 4 bits requeririan aproximadamente 2,5-3 GB de VRAM, las de 8 bits unos 5 GB y las de 16 bits unos 9-10 GB, estimaciones orientativas no confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, una RTX 3060 de 12 GB o superior deberia poder ejecutar cuantizaciones de 4 y 8 bits; una RTX 4090 permitiria cargar cuantizaciones mayores.
- Compatibilidad con GPU de consumo: previsiblemente si en cuantizaciones de 4 y 8 bits, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, llama-cpp-python y runtimes compatibles con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RastNus-Small-5B-GGUF | 4.630 M (aproximadamente 2.000 M efectivos) | no disponible | kurdo central (ckb) | Apache 2.0 | GGUF |
| Gemma 4 E2B (base declarada) | no disponible en la informacion proporcionada | no disponible | multilingue | licencia Gemma 4 | safetensors, GGUF |
| Alternativas especializadas en correccion gramatical para kurdo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables especializados en kurdo sorani en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en kurdo central (sorani); no se documenta soporte para kurmanji, zazaki u otras variedades kurdas ni para otros idiomas.
- No se han publicado benchmarks que permitan verificar la calidad de las correcciones; el rendimiento real en produccion es desconocido.
- Riesgo de alucinacion: como todo modelo generativo, puede introducir cambios no solicitados o inventar formas linguisticas; se recomienda validacion humana en flujos criticos.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Longitud de contexto no documentada: limita la planificacion de casos de uso con documentos largos.
- Aunque la licencia es Apache 2.0, los metadatos remiten a la licencia de Gemma 4; conviene revisar los terminos de dicha licencia antes de un uso comercial, ya que podrian imponer restricciones adicionales.
- El repositorio solo contiene pesos GGUF; para fine-tuning o conversion a otros formatos es necesario acudir al modelo base en safetensors.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La model card esta incompleta en aspectos clave (contexto, datos de entrenamiento, evaluacion), lo que dificulta una evaluacion rigurosa previa a su adopcion.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Small-5B-GGUF
- Modelo base en safetensors: https://huggingface.co/PawanKrd/RastNus-Small-5B
- Perfil del autor: https://huggingface.co/PawanKrd
- Sitio web del autor: https://pawan.krd
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia Gemma 4 (referenciada en los metadatos): https://ai.google.dev/gemma/docs/gemma_4_license
