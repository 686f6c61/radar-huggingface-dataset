# mradermacher/Reproduced-tulu2-dpo-13b-GGUF

## Resumen

Reproduced-tulu2-dpo-13b-GGUF es la version cuantizada en formato GGUF del modelo Junrulu/Reproduced-tulu2-dpo-13b, una reproduccion del pipeline de ajuste de Tulu 2 sobre una base de 13.000 millones de parametros, afinada con DPO (Direct Preference Optimization) sobre el dataset UltraFeedback binarized. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en la comunidad de cuantizaciones GGUF, que publica tanto quants estaticos (esta ficha) como quants con imatrix en un repositorio separado.

El modelo resuelve el problema de ejecutar un modelo de 13B afinado por preferencias en hardware de consumo o en entornos sin GPUs de datacenter, ofreciendo un abanico de cuantizaciones desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB). Su relevancia es practica: permite reproducir y desplegar localmente un ajuste tipo Tulu 2 + DPO sin necesidad de infraestructura de inferencia propietaria.

La informacion disponible es limitada: la model card del repositorio GGUF es puramente operativa (lista de quants y notas de uso) y no incluye detalles sobre arquitectura interna, contexto nativo ni resultados de evaluacion. Los datos tecnicos que se presentan a continuacion se derivan del recuento real de parametros en safetensors y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de la base de 13B del pipeline Tulu 2; detalles exactos no disponibles) |
| Parametros totales | 13.015.874.560 (13,0B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; quants imatrix en repositorio separado |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (quants estaticos); el modelo base en safetensors |
| Tamano del repo | 88,8 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers |
| Compatibilidad de endpoints | endpoints_compatible |
| Dataset de ajuste | HuggingFaceH4/ultrafeedback_binarized, Junrulu/Reproduced-tulu2-test-sets |

## Arquitectura y entrenamiento

El modelo base es Junrulu/Reproduced-tulu2-dpo-13b, una reproduccion del pipeline de alineamiento de Tulu 2 aplicado a una base de 13B y posteriormente afinado con DPO sobre UltraFeedback binarized. La model card del repositorio GGUF no detalla la arquitectura interna (numero de capas, dimensiones, atencion, activaciones) ni el volumen de tokens de preentrenamiento o de ajuste supervisado; unicamente declara el dataset de preferencias y un dataset de test propio (Junrulu/Reproduced-tulu2-test-sets) empleado presumiblemente para validar la reproduccion.

La innovacion tecnica de esta publicacion no reside en el modelo, sino en la cadena de cuantizacion: mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos en safetensors, generando la matriz completa de quants K y IQ. No se documenta en la informacion disponible si el ajuste DPO incluyo etapas adicionales de RLHF, filtrado de datos o tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles con ajuste por preferencias humanas (DPO sobre UltraFeedback), orientado a respuestas mas alineadas que la base sin ajuste.
- Razonamiento multi-turno y seguimiento de instrucciones, herencia del pipeline Tulu 2.
- Generacion de codigo y matematicas basicas a nivel de modelo generalista de 13B; no se documentan evaluaciones especificas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (8,0 GB) el modelo cabe en GPUs de consumo de 12 GB o mas, permitiendo prototipado de asistentes conversacionales sin conexion a servicios externos.
- Evaluacion de tecnicas de alineamiento: investigadores que quieran comparar el efecto de DPO sobre UltraFeedback frente a la base sin ajuste pueden usar este modelo como referencia reproducible en ingles.
- Generacion de texto asistida en pipelines de documentacion: el modelo puede redactar borradores tecnicos en ingles con un estilo alineado a preferencias humanas, integrable via llama.cpp u Ollama.
- Chatbot de dominio general para entornos con requisitos de privacidad: al ejecutarse en local con GGUF, los datos no salen de la infraestructura del usuario, lo que encaja en escenarios con datos sensibles.
- Fine-tuning posterior sobre datos propios: al ser un modelo de 13B con licencia no declarada, sirve como punto de partida para ajustes ligeros (LoRA) en tareas de clasificacion o generacion especifica, siempre que se aclare la licencia antes de uso comercial.
- Benchmarking de cuantizaciones: la matriz completa de quants (Q2_K a Q8_0) permite medir la degradacion de calidad frente al modelo en safetensors en tareas de generacion y razonamiento, util para decidir el compromiso tamano/calidad en produccion.
- Educacion y experimentacion: estudiantes que quieran reproducir el pipeline Tulu 2 + DPO en hardware asequible pueden partir de Q4_K_S (7,5 GB, marcado como "fast, recommended" por el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos; unicamente referencia un grafico externo de perplejidad por tipo de cuantizacion (ikawrakow) que no aporta valores numericos en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente 5,5-6 GB para Q2_K, 8-9 GB para Q4_K_M, 10-11 GB para Q5_K_M, 12-13 GB para Q6_K y 15-16 GB para Q8_0, considerando un margen de 0,5-2 GB para KV cache y buffers.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 y Q6_K con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M y Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M.
- Cabe en GPU de consumo: si, desde Q4_K_S en adelante en GPUs de 12 GB; Q2_K y Q3_K_S caben en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta ficha cubre los quants GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del backend. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Reproduced-tulu2-dpo-13b-GGUF (este) | 13,0B | no disponible | no disponible | GGUF | Reproduccion Tulu 2 + DPO, solo ingles |
| Tulu 2 13B (original, AI2) | 13B | 4096 tokens (referencia del pipeline Tulu 2) | AI2 ImpACT Low-risk | safetensors, GGUF comunitarios | Modelo de referencia del que deriva esta reproduccion; datos oficiales de la familia Tulu 2 |
| Zephyr-7B-beta (HuggingFace H4) | 7,2B | 32768 tokens | MIT | safetensors, GGUF | Mismo dataset de preferencias (UltraFeedback); menor tamano y contexto mayor |
| Mistral-7B-Instruct-v0.2 | 7,2B | 32768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa generalista de 7B con licencia permisiva |

La comparativa con Tulu 2 13B se basa en la familia de referencia del pipeline; los datos de contexto y licencia de este repositorio concreto no estan declarados. No se dispone de comparaciones de rendimiento cuantitativas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (Junrulu/Reproduced-tulu2-dpo-13b) y de la base original antes de cualquier despliegue en produccion.
- Solo ingles: los metadatos declaran unicamente el idioma "en"; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo de 13B afinado por preferencias, puede producir afirmaciones plausibles pero falsas; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: el ajuste sobre UltraFeedback puede heredar sesgos de ese dataset (estilo de respuesta, preferencias de anotadores); no se documentan analisis de sesgo.
- Contexto no declarado: se desconoce la longitud de contexto nativa, lo que impide planificar casos de uso con documentos largos sin pruebas empiricas.
- Reproduccion no verificada por terceros: al tratarse de una reproduccion del pipeline Tulu 2 por un autor independiente, los resultados pueden diferir de los del Tulu 2 original; el dataset de test propio no se detalla.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable; el autor recomienda Q4_K_S o superior para uso practico.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir compatibilidad con function calling sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Reproduced-tulu2-dpo-13b-GGUF
- Modelo base: https://huggingface.co/Junrulu/Reproduced-tulu2-dpo-13b
- Quants imatrix: https://huggingface.co/mradermacher/Reproduced-tulu2-dpo-13b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Reproduced-tulu2-dpo-13b-GGUF
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset de test del autor: https://huggingface.co/datasets/Junrulu/Reproduced-tulu2-test-sets
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
