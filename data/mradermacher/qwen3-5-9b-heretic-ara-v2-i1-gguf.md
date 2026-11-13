# mradermacher/Qwen3.5-9B-Heretic-ARA-v2-i1-GGUF

## Resumen

Qwen3.5-9B-Heretic-ARA-v2-i1-GGUF es una cuantizacion GGUF del modelo NullpoLab/Qwen3.5-9B-Heretic-ARA-v2, un derivado de Qwen3.5-9B de Alibaba Qwen sometido a un proceso de "abliteration" (eliminacion de rechazos y sesgos de seguridad) que el autor etiqueta como heretic, uncensored, decensored y abliterated. El encargado de la cuantizacion es mradermacher, un conocido publicador de cuantizaciones GGUF con metodologia imatrix, que distribuye este repositorio como variante "i1" (con fichero imatrix propio) frente a la version estatica.

El modelo subyacente cuenta con 8.953.803.264 parametros (aproximadamente 9 mil millones) y esta pensado para inferencia local en conversacion y generacion de texto. La model card indica que se trata de un modelo de vision, por lo que los ficheros mmproj, si existen, se alojan en el repositorio estatico hermano. La licencia declarada es Apache 2.0, heredada del Qwen3.5-9B original.

Este repositorio es relevante para quienes necesitan ejecutar un modelo de ~9B en hardware de consumo con llama.cpp u Ollama, y para quienes buscan una variante sin filtros de rechazo para investigacion sobre alineamiento, red teaming o generacion creativa sin restricciones. No obstante, la ausencia de benchmarks publicados y de documentacion sobre el proceso de abliteration limita su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; detalles de atencion no disponibles) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-9B (tipo de atencion, uso de RoPE, GQA, etc.), mas alla de que se trata de un transformer de aproximadamente 9 mil millones de parametros. El repositorio es una cuantizacion, no un entrenamiento: mradermacher aplica cuantizacion de pesos con fichero imatrix (importance matrix) generado a partir del modelo base, lo que segun la model card mejora la calidad frente a cuantizaciones estaticas de tamano similar. La model card incluye metadatos internos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion desde pesos Hugging Face.

El rasgo tecnico mas relevante es el proceso de abliteration aplicado por NullpoLab sobre Qwen3.5-9B, que elimina direcciones de activacion asociadas a rechazos de seguridad. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo original. Tampoco se especifica la innovacion "ARA" del nombre, que no aparece explicada en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Modelo de vision: la model card lo declara explicitamente como vision model, con ficheros mmproj en el repositorio estatico hermano.
- Variante "abliterated"/"uncensored": no aplica rechazos de seguridad en las respuestas, orientada a contenido sin filtros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se confirma soporte de otros idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como responde un modelo abliterated frente a su version original en prompts sensibles, util para analisis de robustez y red teaming controlado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde los filtros de rechazo de modelos alineados resultan limitantes.
- Inferencia local en hardware de consumo: al estar en GGUF con cuantizaciones desde Q2_K hasta Q6_K, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada o con GPUs de gama media.
- Procesamiento de imagenes en local: al ser un modelo de vision, permite tareas de descripcion de imagenes o VQA en entornos offline usando el fichero mmproj del repositorio estatico.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye el fichero imatrix y multiples niveles de cuantizacion, lo que permite medir el impacto de la cuantizacion en la calidad de salida para un mismo modelo.
- Prototipado de chatbots sin censura para pruebas internas: util en entornos de desarrollo donde se necesita simular conversaciones sin las restricciones tipicas de los modelos comerciales.
- Despliegue en pipelines de generacion de texto por lotes: con cuantizaciones Q4_K_M o Q5_K_M se obtiene un equilibrio razonable entre tamano (~5-6 GB) y calidad para procesamiento masivo en CPU o GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Aproximadamente 3-4 GB para Q2_K, 5-6 GB para Q4_K_M, 7-8 GB para Q6_K, mas overhead de contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en datacenter, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q5 en GPUs con 8 GB o mas; las cuantizaciones Q6_K requieren 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio; vLLM y TGI no soportan GGUF de forma nativa (requieren los pesos safetensors del modelo base).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Heretic-ARA-v2-i1-GGUF (este) | ~9B | no disponible | Apache 2.0 | GGUF imatrix | Abliterated, vision, solo ingles declarado |
| Qwen3.5-9B (original) | ~9B | no disponible | Apache 2.0 | safetensors | Alineado, con filtros de seguridad |
| NullpoLab/Qwen3.5-9B-Heretic-ARA-v2 | ~9B | no disponible | Apache 2.0 | safetensors | Modelo base de esta cuantizacion, abliterated |
| mradermacher/Qwen3.5-9B-Heretic-ARA-v2-GGUF | ~9B | no disponible | Apache 2.0 | GGUF estatico | Cuantizaciones estaticas y ficheros mmproj |

No se dispone de datos de benchmarks para comparar el rendimiento relativo entre estas variantes.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de direcciones de rechazo puede degradar la coherencia y aumentar la probabilidad de respuestas daninas, sesgadas o factualmente incorrectas en temas sensibles.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; al ser un modelo de ~9B, la tasa de alucinacion puede ser significativa en tareas de conocimiento especializado.
- Idiomas: la model card solo declara ingles; el uso en castellano no esta garantizado ni evaluado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el proceso de abliteration puede entrar en conflicto con las politicas de uso aceptable del modelo original Qwen; conviene revisar los terminos de Qwen antes de un despliegue comercial.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que la calidad real frente a otras cuantizaciones o modelos no esta cuantificada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa de la calidad de estas cuantizaciones.
- Vision: los ficheros mmproj no estan en este repositorio, sino en el estatico; hay que descargarlos por separado para tareas multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-Heretic-ARA-v2-i1-GGUF
- Modelo base: https://huggingface.co/NullpoLab/Qwen3.5-9B-Heretic-ARA-v2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-9B-Heretic-ARA-v2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Heretic-ARA-v2-i1-GGUF
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
