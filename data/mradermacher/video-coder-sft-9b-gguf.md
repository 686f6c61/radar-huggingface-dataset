# mradermacher/Video-Coder-SFT-9B-GGUF

## Resumen

Video-Coder-SFT-9B-GGUF es la distribucion en formato GGUF del modelo Video-Coder-SFT-9B, publicada por el usuario mradermacher, conocido por producir cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y entornos compatibles. El modelo base, Video-Coder/Video-Coder-SFT-9B, es un modelo de 8.953.803.264 parametros (aproximadamente 9B) afinado mediante SFT (supervised fine-tuning) y orientado a tareas de codigo con capacidades multimodales, a juzgar por la presencia de ficheros mmproj (multi-modal projection) en el repositorio.

El repositorio incluye una bateria completa de cuantizaciones estaticas que van desde Q2_K (3,9 GB) hasta f16 (18,0 GB), ademas de dos variantes del proyector multimodal (mmproj-Q8_0 y mmproj-f16). Esto permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 8 GB de VRAM hasta estaciones de trabajo con GPUs profesionales. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

La relevancia de esta publicacion radica en que facilita el acceso a un modelo de codigo multimodal de ~9B en formatos optimizados para inferencia local, algo especialmente util para desarrolladores que quieren integrar asistencia de codigo con entrada visual (por ejemplo, capturas de pantalla o diagramas) sin depender de servicios en la nube. No obstante, la informacion publicada sobre el modelo base es muy limitada: no se detallan datos de entrenamiento, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal, inferido por la presencia de mmproj) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Video-Coder/Video-Coder-SFT-9B. El nombre y la presencia de ficheros mmproj indican que se trata de un modelo multimodal que combina un decoder de lenguaje de ~9B parametros con un proyector visual, siguiendo el patron habitual de los modelos vision-language (un encoder de vision conectado a un LLM mediante una proyeccion). El sufijo "SFT" sugiere que el modelo base fue afinado con supervisised fine-tuning sobre el checkpoint preentrenado, aunque no se especifican los datos, el numero de tokens ni si hubo etapas posteriores de RLHF o DPO.

La model card del repositorio GGUF no aporta informacion sobre la composicion del dataset de entrenamiento, el numero de tokens vistos ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las cuantizaciones son estaticas (no se han publicado variantes con imatrix), y el autor indica que no tiene previsto generar cuantizaciones ponderadas por imatrix a corto plazo, aunque acepta peticiones mediante discusiones de la comunidad. El proceso de conversion se realizo desde el formato Hugging Face original (convert_type: hf) con quantize_version 2.

## Capacidades

- Generacion de texto y codigo en ingles, con un enfoque declarado hacia tareas de programacion (el nombre "Video-Coder" sugiere especializacion en codigo asistido por video o entrada visual).
- Procesamiento multimodal: la presencia de ficheros mmproj confirma soporte de entrada de imagenes o video junto con texto, aunque no se detalla la resolucion ni el numero de frames soportados.
- Conversacional: la etiqueta "conversational" indica que el modelo esta preparado para dialogos multi-turno en formato chat.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia de codigo con capturas de pantalla: el modelo puede recibir una imagen de un error de compilacion o de una interfaz de IDE junto con una pregunta en texto, y generar una explicacion o parche de codigo. La componente multimodal (mmproj) lo hace adecuado para este flujo, aunque la calidad concreta no esta documentada.
- Revision de diagramas de arquitectura: dado un diagrama UML o de flujo en imagen, el modelo puede describir la logica y proponer esqueletos de codigo en ingles, util para documentacion tecnica automatizada.
- Generacion de codigo en pipelines locales: con las cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) puede ejecutarse en una GPU de consumo de 8-12 GB mediante llama.cpp u Ollama, integrandose en scripts de desarrollo sin conexion.
- Prototipado rapido en entornos con GPU limitada: la variante Q2_K (3,9 GB) permite probar el modelo en GPUs de 6 GB o incluso en CPU con RAM suficiente, adecuado para evaluaciones iniciales antes de escalar a cuantizaciones mayores.
- Educacion y tutoria de programacion: el modelo puede explicar fragmentos de codigo o capturas de pantalla de ejercicios, respondiendo en ingles en un formato conversacional.
- Analisis de video tutoriales de programacion: si el proyector multimodal acepta secuencias de video, podria resumir pasos de un tutorial y extraer el codigo mostrado, aunque esta capacidad no esta confirmada en la documentacion.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible permite servir el modelo mediante infraestructura gestionada de Hugging Face para aplicaciones de chat tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,9 GB
  - Q3_K_M: ~4,7 GB
  - IQ4_XS: ~5,3 GB
  - Q4_K_M: ~5,7 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
  - Proyector multimodal adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y para servir con alta concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizaciones Q4 a Q8. Las variantes Q2_K y Q3_K pueden ejecutarse en GPUs de 6-8 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: transformers, vLLM o TGI (no confirmado para la variante multimodal).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base (contexto, arquitectura exacta) que permitan una comparacion rigurosa con alternativas. Como referencia de categoria, se listan modelos de ~9B con soporte de codigo y cuantizaciones GGUF, pero sin datos comparativos verificados:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Video-Coder-SFT-9B-GGUF | ~9B | no disponible | Apache 2.0 | Si (Q2_K a f16 + mmproj) | Multimodal, enfocado a codigo |
| Alternativas de ~9B con codigo | no disponible | no disponible | no disponible | no disponible | No se ha verificado comparacion |

## Limitaciones y advertencias

- Informacion muy escasa sobre el modelo base: no se documentan datos de entrenamiento, contexto, benchmarks ni composicion del dataset, lo que dificulta evaluar su calidad real.
- Idioma limitado al ingles: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en produccion multilingue requeriria validacion adicional.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo incorrecto o APIs inexistentes; se recomienda validacion automatica (tests, linters) antes de integrar en produccion.
- Sesgos: no se han publicado analisis de sesgos; al entrenarse presumiblemente con datos web en ingles, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero el autor del GGUF no ofrece garantias sobre el modelo base ni sobre la calidad de las cuantizaciones; conviene revisar la licencia del modelo original Video-Coder/Video-Coder-SFT-9B.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay variantes ponderadas por imatrix, lo que puede suponer una perdida de calidad mayor en cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- Capacidades multimodales no documentadas: se desconoce el soporte real de video, resolucion de imagen y numero de frames; la etiqueta "Video-Coder" no garantiza procesamiento de video en esta distribucion.
- Sin datos de latencia ni throughput: no es posible estimar costes de despliegue en produccion a partir de la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Video-Coder-SFT-9B-GGUF
- Modelo base: https://huggingface.co/Video-Coder/Video-Coder-SFT-9B
- Pagina de descargas del autor: https://hf.tst.eu/model#Video-Coder-SFT-9B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
