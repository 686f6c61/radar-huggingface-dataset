# mradermacher/Qwen3.5-4B-heretic-v1-GGUF

## Resumen

Qwen3.5-4B-heretic-v1-GGUF es una cuantizacion estatica en formato GGUF del modelo TrueRealRaven/Qwen3.5-4B-heretic-v1, un derivado de la familia Qwen3.5 de 4B parametros al que se le ha aplicado una tecnica de "abliteration" (eliminacion de rechazos) para producir una variante sin censura. El trabajo de cuantizacion lo firma mradermacher, autor habitual de conversiones GGUF en Hugging Face, y se distribuye bajo licencia Apache 2.0.

El modelo base cuenta con 4.205.751.296 parametros reales (segun safetensors) y esta orientado a conversacion en ingles. Al estar disponible en multiples niveles de cuantizacion (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), resulta accesible para equipos de consumo y para despliegues en CPU o GPU de gama media mediante llama.cpp u Ollama.

La relevancia de esta ficha reside en que ofrece una via practica para ejecutar localmente un modelo de 4B sin filtros de rechazo, con soporte multimodal (incluye ficheros mmproj) y una huella de memoria muy contenida. No obstante, al no haber benchmarks publicados ni datos de entrenamiento detallados, la evaluacion debe hacerse de forma empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4B parametros de la familia Qwen3.5, sobre el que se ha aplicado una intervencion de tipo heretic/abliterated orientada a reducir los rechazos del modelo. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La cuantizacion la realiza mradermacher mediante su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), que genera cuantizaciones estaticas en GGUF. El repositorio incluye ademas ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base conserva capacidades multimodales (vision) que se pueden activar junto con los pesos cuantizados. Existe una version con cuantizaciones ponderadas/imatrix en el repositorio i1-GGUF del mismo autor.

## Capacidades

- Generacion de texto conversacional en ingles.
- Capacidades multimodales (vision) segun la presencia de ficheros mmproj en el repo.
- Comportamiento sin censura: la abliteration elimina los rechazos tipicos del modelo original ante peticiones sensibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con modelos sin censura en local: util para investigadores que estudian el comportamiento de modelos abliterated frente a sus versiones originales, ejecutando la variante Q4_K_M en una GPU de consumo.
- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno en entornos de desarrollo con llama.cpp u Ollama, gracias a su tamano reducido.
- Despliegue en hardware modesto: la cuantizacion Q2_K (2,0 GB) permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU, para pruebas de concepto.
- Procesamiento de imagenes y texto combinados: los ficheros mmproj permiten usar el modelo como asistente multimodal en tareas de descripcion o analisis de imagenes, si el modelo base conserva esa capacidad.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material editorial donde los filtros de rechazo del modelo original resultan un obstaculo.
- Investigacion sobre seguridad y alineacion: analisis de sesgos y riesgos de modelos sin censura, comparando respuestas con la version original de Qwen3.5-4B.
- Fine-tuning posterior: el formato GGUF no es el ideal para reentrenar, pero el modelo base en safetensors puede servir como punto de partida para ajustes con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0 GB
  - Q3_K_M: ~2,4 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060/4060, RTX 4090, A100 o H100 para las variantes de mayor precision.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones hasta Q8_0 caben en GPUs de 6-8 GB; f16 requiere ~10 GB efectivos.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-v1-GGUF (este) | 4,2B | no disponible | Apache 2.0 | GGUF | Sin censura, multimodal |
| TrueRealRaven/Qwen3.5-4B-heretic-v1 | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen/Qwen3.5-4B | 4,2B | no disponible | Apache 2.0 | safetensors | Version original con filtros |
| mradermacher/Qwen3.5-4B-heretic-v1-i1-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas |

## Limitaciones y advertencias

- Al ser un modelo abliterated, no ha pasado por un proceso de alineacion estandar; puede generar contenido ofensivo, sesgado o inapropiado sin filtros.
- Riesgo elevado de alucinacion, comun en modelos de 4B y agravado por la falta de datos de evaluacion.
- Soporte limitado al ingles; no se garantiza calidad en castellano ni en otros idiomas.
- No hay benchmarks publicados que permitan validar su rendimiento frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo.
- El formato GGUF no es adecuado para fine-tuning; para reentrenar hay que usar el modelo base en safetensors.
- La longitud de contexto no esta documentada, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-v1-GGUF
- Modelo base: https://huggingface.co/TrueRealRaven/Qwen3.5-4B-heretic-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-v1-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.5-4B-heretic-v1-GGUF
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
