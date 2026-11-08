# dima1810/MiniCPM-V-4.7-1B-oQ8e-fp16

## Resumen

MiniCPM-V-4.7-1B-oQ8e-fp16 es una cuantización mixta del modelo multimodal MiniCPM-V-4.7-1B desarrollado por OpenBMB, publicada por el usuario dima1810 en Hugging Face. El modelo original es un modelo de lenguaje y visión (VLM) de pequeno tamano pensado para inferencia en dispositivo (on-device), con aproximadamente 1.554 millones de parametros totales, de los cuales unos 1.032 millones corresponden al modelo de lenguaje y unos 522 millones al codificador visual.

Esta version concreta ha sido generada con la herramienta oQ (oMLX v0.7.4.dev1), un esquema de cuantizacion de precision mixta que combina pesos en affine 8-bit con grupo de 64 (66,37% de los pesos logicos), FP16 (0,03%) y FP32 (33,60%, correspondiente al modulo de vision). El resultado es un checkpoint con un promedio efectivo de 16,398 bits por peso y un tamano de repositorio de 3,2 GB, en formato safetensors y con la libreria MLX, lo que lo orienta a ejecucion en hardware Apple Silicon.

Su relevancia radica en que permite desplegar un VLM compacto con capacidades de vision y lenguaje en equipos de consumo, aunque conviene senalar que el autor no ha publicado informacion sobre licencia, idiomas soportados, pipeline ni resultados de evaluacion en la model card de esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo multimodal MiniCPM-V-4.7; el repositorio declara la arquitectura `minicpmv4_7`) |
| Parametros totales | 1.554.476.272 (1,554B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 8-bit grupo 64 (66,367% de pesos logicos), FP16 (0,033%), FP32 (33,600%); promedio efectivo 16,398 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 3,2 GB (2,968 GiB) |
| Desglose de almacenamiento | Modelo de lenguaje: 1,032B pesos / 1,097 GB; Vision: 0,522B pesos / 2,089 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base MiniCPM-V-4.7-1B mas alla de su caracter multimodal (componente de lenguaje y componente de vision) y de la etiqueta `minicpmv4_7` del repositorio. El modelo original pertenece a la familia MiniCPM-V de OpenBMB, orientada a IA multimodal on-device, y dispone de una variante con decodificacion especulativa (DSpark) y soporte de despliegue mediante OpenVINO para CPU/GPU/NPU de Intel, segun la informacion de busqueda.

Respecto al entrenamiento, no se dispone de datos sobre numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) para esta variante. La innovacion tecnica documentada en este repositorio es la cuantizacion mixta oQ aplicada con oMLX v0.7.4.dev1, que asigna 8 bits con grupo de 64 a la mayor parte del modelo de lenguaje mientras mantiene el modulo de vision en FP32, buscando preservar la calidad de las representaciones visuales a costa de un mayor peso en disco (el modulo de vision ocupa 1,946 GiB frente a 1,022 GiB del modelo de lenguaje).

## Capacidades

- Generacion de texto y comprension de lenguaje por parte del componente de lenguaje del modelo.
- Procesamiento de imagenes y tareas de vision-lenguaje por parte del codificador visual (0,522B parametros), segun la naturaleza multimodal del modelo base.
- Despliegue en hardware Apple Silicon mediante la libreria MLX.
- Inferencia on-device gracias a su tamano reducido (1,554B parametros).
- El modelo base dispone de una variante con decodificacion especulativa (DSpark) y soporte de OpenVINO para plataformas Intel, aunque no se confirma que esta cuantizacion MLX herede dichas optimizaciones.
- Soporte de tool calling, agentes, modo thinking, audio o capacidades multilingues especificas: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia visual en dispositivo: el modelo puede procesar imagenes y responder preguntas sobre ellas directamente en un Mac con Apple Silicon, sin enviar datos a la nube, lo que resulta adecuado para escenarios con requisitos de privacidad.
- Prototipado rapido de aplicaciones VLM: gracias a su tamano de 3,2 GB y al soporte de MLX, permite iterar en local sobre tareas de descripcion de imagenes o extraccion de informacion visual antes de escalar a modelos mayores.
- Analisis de documentos y capturas de pantalla: el componente de vision en FP32 puede emplearse para tareas de lectura de texto en imagenes (OCR asistido) y resumen de contenido visual en flujos de trabajo personales.
- Educacion y demostraciones: su reducido coste de despliegue lo hace util para ensenar conceptos de modelos multimodales y cuantizacion en entornos academicos con hardware de consumo.
- Automatizacion de catalogos de imagenes: clasificacion y generacion de descripciones de productos en lotes pequenos ejecutados localmente.
- Investigacion sobre cuantizacion: este checkpoint sirve como referencia para estudiar el impacto de la cuantizacion mixta oQ (8-bit en lenguaje, FP32 en vision) en la calidad de un VLM pequeno.
- Aplicaciones de accesibilidad: descripcion de escenas o imagenes para usuarios con discapacidad visual en un dispositivo local, siempre que se valide la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el checkpoint ocupa 3,2 GB en disco (2,968 GiB); en memoria unificada de Apple Silicon se requiere al menos ese orden de magnitud, mas overhead de ejecucion.
- Hardware objetivo: el repositorio usa la libreria MLX, disenada para Apple Silicon (series M1, M2, M3, M4); no se documenta soporte para GPU NVIDIA en esta variante.
- GPU de consumo: cabe en equipos Apple con memoria unificada de 8 GB o superior, aunque no se proporcionan cifras oficiales de consumo de memoria en inferencia.
- Opciones de despliegue: MLX (libreria declarada). El modelo base dispone de soporte para OpenVINO en plataformas Intel y de una variante DSpark para decodificacion especulativa, pero no se confirma su compatibilidad con esta cuantizacion concreta. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-oQ8e-fp16 (este) | 1,554B | No disponible | safetensors (MLX) | No disponible | Cuantizacion mixta oQ, vision en FP32 |
| MiniCPM-V-4.7-1B (openbmb) | 1B (aprox.) | No disponible | No disponible | No disponible | Modelo base original; dispone de variante DSpark y soporte OpenVINO |
| Otras alternativas de VLM de ~1-2B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o licencia con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- La model card de esta cuantizacion no declara licencia, por lo que el uso comercial queda sin garantias hasta consultar la licencia del modelo base MiniCPM-V-4.7-1B de OpenBMB.
- No se documentan los idiomas soportados; el comportamiento multilingue es incierto.
- No se han publicado evaluaciones de calidad para esta cuantizacion, por lo que se desconoce la degradacion respecto al modelo original, especialmente en tareas visuales.
- El modulo de vision se mantiene en FP32 (1,946 GiB), lo que limita el ahorro de memoria frente a una cuantizacion completa del modelo.
- La dependencia de MLX restringe el despliegue a hardware Apple Silicon; no hay soporte documentado para CUDA u otras plataformas en este checkpoint.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision de pequeno tamano; se recomienda validacion humana en produccion.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado por un usuario individual, no por el equipo de OpenBMB; conviene verificar la integridad de los pesos antes de usarlo en entornos criticos.
- No se dispone de informacion sobre sesgos conocidos ni sobre la longitud de contexto efectiva.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/dima1810/MiniCPM-V-4.7-1B-oQ8e-fp16
- Modelo base MiniCPM-V-4.7-1B (OpenBMB): https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Coleccion MiniCPM-V 4.7: https://huggingface.co/collections/openbmb/minicpm-v-47
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
