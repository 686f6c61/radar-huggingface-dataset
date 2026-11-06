# mradermacher/Qwopus3.5-0.8B-v3-GGUF

## Resumen

Qwopus3.5-0.8B-v3-GGUF es la version cuantizada en formato GGUF del modelo Jackrong/Qwopus3.5-0.8B-v3, un modelo de lenguaje conversacional de aproximadamente 752 millones de parametros. La cuantizacion ha sido realizada por mradermacher, un conocido publicador de versiones GGUF de la comunidad, y esta pensada para facilitar la inferencia local en hardware modesto mediante llama.cpp y herramientas compatibles. El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado como parte de la familia Qwen3.5, lo que sugiere una arquitectura derivada o inspirada en los modelos Qwen.

El modelo base es un ajuste fino (probablemente via Unsloth, segun las etiquetas del repositorio) orientado a generacion de texto conversacional en ingles. Con menos de mil millones de parametros, su interes principal radica en la posibilidad de ejecutarlo en CPU o en GPUs de consumo con muy poca VRAM, ofreciendo un punto de entrada de bajo coste para prototipado, experimentacion y despliegues en el borde. El repositorio incluye ademas ficheros `mmproj` (multi-modal supplement), lo que apunta a capacidades de vision en el modelo base, aunque no se detalla su alcance.

La relevancia de esta ficha radica en que el modelo original apenas cuenta con documentacion tecnica publica: no se han publicado resultados de benchmarks, ni detalles sobre el dataset de entrenamiento, ni especificaciones de longitud de contexto. Esta version GGUF, por tanto, es principalmente un artefacto de distribucion que permite probar el modelo con cuantizaciones desde Q2_K hasta f16, con tamanos que van de 0,5 GB a 1,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwopus3.5-0.8B-v3 es un transformer de aproximadamente 752 millones de parametros, etiquetado como perteneciente a la familia `qwen3_5`. Las etiquetas del repositorio incluyen `unsloth`, lo que indica que el ajuste fino se realizo con la libreria Unsloth, habitualmente empleada para fine-tuning eficiente en memoria de modelos pequenos y medianos. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La version aqui descrita es una cuantizacion estatica (no imatrix, segun indica el autor) realizada con herramientas de la familia llama.cpp. El autor senala que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion. Se incluyen ficheros `mmproj` (proyeccion multi-modal) en precision Q8_0 y f16, lo que sugiere que el modelo base incorpora un adaptador de vision, aunque no se documenta su funcionamiento ni su calidad.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Soporte multi-modal potencial: la presencia de ficheros `mmproj` indica capacidad de procesamiento de imagenes en el modelo base, aunque no se detalla su alcance ni su calidad.
- Compatibilidad con text-generation-inference (etiqueta `text-generation-inference`) y con `transformers`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Prototipado rapido en local: con cuantizaciones Q4_K_M de 0,6 GB, el modelo cabe en cualquier portatil moderno y permite validar pipelines de generacion de texto sin coste de API.
- Despliegue en dispositivos de borde: el tamano reducido (menos de 1 GB en Q8_0) lo hace apto para entornos con RAM limitada, como Raspberry Pi o contenedores ligeros, para tareas de generacion de texto simple.
- Experimentacion con cuantizaciones: el repositorio ofrece un abanico amplio de cuantizaciones (de Q2_K a f16), lo que permite estudiar el impacto de la precision en la calidad de salida con un mismo modelo.
- Chatbot de proposito general en ingles: para aplicaciones conversacionales sencillas donde el coste y la latencia importan mas que la calidad puntera.
- Evaluacion de modelos multi-modales pequenos: los ficheros `mmproj` permiten probar la componente de vision del modelo base en entornos con llama.cpp.
- Fine-tuning posterior o destilacion: al ser un modelo pequeno con licencia Apache 2.0, puede servir como base para ajustes especificos o como modelo alumno en experimentos de destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB en cuantizaciones Q2_K a Q4_K_M; 0,9 GB en Q8_0; 1,6 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), text-generation-inference (segun etiqueta), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 0,75B parametros, se espera una latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-0.8B-v3-GGUF | 752 M | no disponible | Apache 2.0 | GGUF | Version cuantizada de un fine-tune de la familia Qwen3.5 |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, con documentacion y benchmarks publicos |
| Llama 3.2 1B Instruct | 1,24 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial de Meta, con contexto largo y benchmarks publicos |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Modelo de Hugging Face con benchmarks publicos |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para Qwopus3.5-0.8B-v3. Los modelos alternativos citados cuentan con documentacion oficial y evaluaciones publicas, lo que supone una ventaja significativa para su adopcion en produccion.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no es posible evaluar la calidad del modelo frente a alternativas sin probarlo empiricamente.
- Documentacion tecnica muy escasa: se desconoce la longitud de contexto, el dataset de entrenamiento y el proceso de alineacion.
- Idioma limitado al ingles: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinacion: al ser un modelo pequeno sin datos de alineacion publicos, la probabilidad de generar informacion falsa es alta.
- Posibles sesgos: no se documenta ningun proceso de mitigacion de sesgos; el modelo puede reflejar sesgos presentes en sus datos de entrenamiento.
- Componente multi-modal sin documentar: los ficheros `mmproj` existen, pero no se especifica que tareas de vision soporta ni con que calidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (llama.cpp, etc.) y del modelo base.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones imatrix, lo que puede suponer una perdida de calidad mayor en cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas ponderadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwopus3.5-0.8B-v3-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.5-0.8B-v3
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus3.5-0.8B-v3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes del autor: https://huggingface.co/mradermacher/model_requests
