# PawanKrd/RastNus-Base-12B-GGUF

## Resumen

RastNus-Base-12B-GGUF es la versión cuantizada en formato GGUF de RastNus-Base-12B, un modelo de lenguaje de 11.907.377.456 parámetros (aproximadamente 12 mil millones) desarrollado por PawanKrd y especializado en la corrección gramatical, ortográfica y de puntuación en kurdo central (sorani, código ISO `ckb`). El modelo base se construye sobre la familia Gemma 4 de Google, según indican las etiquetas y la referencia a la licencia de Gemma 4 en la model card, y se distribuye bajo licencia Apache 2.0.

El propósito del modelo es resolver un problema muy concreto y poco cubierto por los modelos generalistas: la escasez de herramientas de calidad para el procesamiento del kurdo sorani, una lengua con recursos digitales limitados. En lugar de ofrecer un asistente conversacional genérico, RastNus se orienta a tareas de post-procesado de texto: detección y corrección de errores gramaticales, normalización ortográfica y restauración de puntuación.

Esta ficha cubre específicamente el repositorio GGUF, pensado para su uso con llama.cpp y runtimes compatibles (LM Studio, Ollama, llama-cpp-python), con cuantizaciones por debajo de 16 bits generadas mediante una importance matrix calculada sobre datos de corrección en kurdo, lo que según el autor preserva la calidad en anchos de bit bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, segun etiquetas y licencia referenciada); detalles de capas y atencion no disponibles |
| Parametros totales | 11.907.377.456 (aproximadamente 12B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones por debajo de 16 bits generadas con importance matrix sobre datos de correccion en kurdo; lista exacta de niveles (Q4_K_M, Q5_K_M, Q8_0, etc.) no disponible |
| Idiomas soportados | Kurdo central / sorani (`ckb`) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 en la model card) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su filiacion con Gemma 4 (etiquetas `gemma`, `gemma-4` y enlace a la licencia de Gemma 4), lo que implica un transformer decoder-only. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El unico detalle tecnico relevante aportado por la model card es el proceso de cuantizacion: todas las variantes por debajo de 16 bits se generaron con una importance matrix calculada sobre datos de correccion en kurdo (in-domain), un enfoque que busca minimizar la perdida de calidad en las capas y tensores mas sensibles para esta tarea concreta, en lugar de usar una calibracion generica.

## Capacidades

- Correccion gramatical en kurdo central (sorani): deteccion y enmienda de errores de concordancia, flexión y sintaxis.
- Correccion ortografica: normalizacion de grafias y deteccion de errores de escritura en alfabeto arabe adaptado al kurdo.
- Restauracion de puntuacion: insercion y correccion de signos de puntuacion en texto plano o mal puntuado.
- Post-procesado de texto: adecuado para pipelines de normalizacion de corpus en kurdo.
- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con llama.cpp y runtimes derivados (LM Studio, Ollama, llama-cpp-python).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al kurdo central; no se documenta soporte de otros idiomas.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Correccion de articulos periodisticos en kurdo sorani: el modelo puede recibir un texto redactado por un periodista y devolver la version corregida ortografica y gramaticalmente, reduciendo el trabajo de edicion manual en medios que publican en kurdo central.
- Normalizacion de corpus para NLP: util para preparar datasets de entrenamiento o evaluacion en kurdo, eliminando variabilidad ortografica y errores de anotacion antes de alimentar otros modelos.
- Post-procesado de OCR: tras digitalizar documentos en kurdo con reconocimiento optico de caracteres, el modelo corrige los errores tipicos de confusion de grafemas arabes y restaura la puntuacion perdida.
- Revision de traducciones automaticas: como segunda pasada sobre la salida de un traductor kurdo, corrigiendo concordancia y ortografia antes de la publicacion.
- Herramientas de escritura para hablantes nativos: integracion en editores o correctores de texto que ofrezcan sugerencias de correccion en sorani, un nicho practicamente sin cobertura comercial.
- Preprocesado para motores de busqueda o sistemas de recuperacion en kurdo: normalizar consultas y documentos mejora la coincidencia lexica en un idioma con recursos escasos.
- Moderacion y limpieza de contenido generado por usuarios: normalizar comentarios y mensajes en kurdo antes de analisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de aproximadamente 12B, las necesidades orientativas son de unos 7-8 GB en cuantizacion de 4 bits, 9-10 GB en 5 bits y 13-14 GB en 8 bits; los valores exactos dependen de la variante GGUF concreta, cuya lista no se detalla en la informacion disponible.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 8 bits con contexto amplio; A100 40/80 GB y H100 para despliegues de mayor concurrencia o sin cuantizar.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizaciones de 4-5 bits; en 6 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (referencia principal), LM Studio, Ollama, llama-cpp-python; vLLM y TGI no se mencionan como soportados para este formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RastNus-Base-12B-GGUF | ~11,9B | No disponible | Correccion en kurdo central | Apache 2.0 | GGUF en HF |
| Gemma 4 12B (base) | ~12B | No disponible | Modelo generalista | Licencia Gemma 4 | Pesos originales |
| Modelos de correccion gramatical multilingues (p. ej. variantes de GECToR o T5) | 0,1-3B tipicamente | Variable | Correccion gramatical | Variable | Variable |

No se dispone de datos de rendimiento comparativos entre RastNus y alternativas especificas para kurdo, por lo que la comparativa se limita a parametros, licencia y disponibilidad. No se conocen en la informacion proporcionada otros modelos abiertos especializados en correccion gramatical de sorani con los que contrastar resultados.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en kurdo central; su uso en otros idiomas no esta documentado y previsiblemente dara resultados deficientes.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos: puede introducir cambios no solicitados en el texto o "corregir" formas que eran validas.
- Al ser un modelo base afinado para una tarea, puede no comportarse bien fuera del dominio de correccion para el que fue entrenado.
- La licencia del repositorio es Apache 2.0, pero la model card enlaza a la licencia de Gemma 4; conviene verificar las condiciones de uso comercial aplicables al modelo base antes de un despliegue en produccion.
- No se documentan sesgos especificos, pero al entrenar sobre un idioma con variacion dialectal, puede favorecer una norma ortografica concreta sobre otras variantes del sorani.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en documentos largos sin pruebas previas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/PawanKrd/RastNus-Base-12B-GGUF
- Modelo base: https://huggingface.co/PawanKrd/RastNus-Base-12B
- Perfil del autor: https://huggingface.co/PawanKrd
- Sitio del autor: https://pawan.krd
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia Gemma 4 (referenciada): https://ai.google.dev/gemma/docs/gemma_4_license
