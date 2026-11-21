# mradermacher/phi-4-EngineeringJob-GGUF

## Resumen

`mradermacher/phi-4-EngineeringJob-GGUF` es una coleccion de cuantizaciones GGUF del modelo `xuxinyao123/phi-4-EngineeringJob`, un fine-tuning de Phi-4 (14.659.507.200 parametros) orientado a tareas de ingenieria. El modelo base es un ajuste supervisado (SFT) realizado con las librerias Unsloth, TRL y LLaMA-Factory sobre el checkpoint Phi-4 de Microsoft, segun se deduce de los tags del repositorio. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source.

El interes de esta ficha reside en dos capas: por un lado, el modelo subyacente (Phi-4 fine-tuneado para ingenieria, en ingles) y, por otro, el trabajo de cuantizacion que lo hace desplegable en hardware de consumo. Las cuantizaciones van desde Q2_K (5,7 GB) hasta Q8_0 (15,7 GB), lo que permite ejecutar un modelo de ~14,7B parametros en GPUs consumer de 8-24 GB de VRAM.

La relevancia actual es practica: Phi-4 es un modelo denso de 14B con buen rendimiento en razonamiento y matematicas, y este fork especializado en ingenieria con cuantizaciones listas para llama.cpp/Ollama facilita su uso en entornos locales sin infraestructura de datacenter. La licencia Apache 2.0 del modelo base y de esta cuantizacion permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4, segun modelo base) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Phi-4 original soporta 16K tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tuning de Phi-4, un transformer denso de 14.659.507.200 parametros desarrollado por Microsoft. Los tags del repositorio (`unsloth`, `trl`, `sft`, `llama`) indican que el ajuste se realizo mediante supervisado fino (SFT) con Unsloth y TRL, probablemente sobre un dataset especifico de tareas de ingenieria. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO posteriores.

La innovacion tecnica de este repositorio no reside en el modelo en si, sino en el pipeline de cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix) en todos los niveles K-quant e IQ4_XS, con tamanos que van de 5,7 GB a 15,7 GB. La model card indica que las cuantizaciones ponderadas/imatrix no estan disponibles por el momento. El modelo base Phi-4 destaca por su entrenamiento con datos sinteticos de alta calidad y su rendimiento en razonamiento matematico, aunque estos detalles corresponden al Phi-4 original y no se confirman especificamente para este fine-tuning.

## Capacidades

- Generacion de texto en ingles con enfasis en tareas de ingenieria (segun el nombre y el ajuste SFT).
- Razonamiento y matematicas: heredadas de Phi-4, que destaca en problemas de logica y calculo.
- Generacion de codigo: Phi-4 tiene capacidad de programacion; el fine-tuning podria reforzarla en dominios de ingenieria.
- Conversacion multi-turno: el tag `conversational` indica soporte de dialogo.
- Compatibilidad con text-generation-inference y endpoints compatibles (tag `endpoints_compatible`).
- No se confirma soporte de tool calling, function calling, agentes o vision en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.

## Casos de uso

- Asistencia tecnica en ingenieria: el modelo puede responder consultas sobre calculos, normativas o procedimientos tecnicos en ingles, aprovechando el fine-tuning especifico y su ventana de contexto (heredada de Phi-4).
- Generacion de documentacion tecnica: redaccion de especificaciones, informes y manuales en ingles con terminologia de ingenieria, desplegable localmente con llama.cpp.
- Resolucion de problemas matematicos aplicados: calculo de esfuerzos, conversiones de unidades, verificacion de formulas, gracias a la base de Phi-4 en razonamiento cuantitativo.
- Prototipado de asistentes conversacionales especializados: integracion en un chatbot interno de una empresa de ingenieria usando Ollama o llama.cpp con cuantizacion Q4_K_M (9 GB) en una RTX 4090.
- Generacion de codigo de simulacion o scripts de calculo: el modelo puede producir fragmentos de Python o MATLAB para automatizar tareas de ingenieria, aunque requiere validacion humana.
- Despliegue en entornos air-gapped: al ser GGUF y Apache 2.0, puede ejecutarse en una estacion de trabajo sin conexion, util en entornos industriales con requisitos de confidencialidad.
- Fine-tuning adicional o experimentacion: al estar disponible en GGUF y con licencia permisiva, sirve como base para experimentos de cuantizacion o evaluacion comparativa de tecnicas de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~5,7 GB
  - Q4_K_M: ~9,0 GB
  - Q6_K: ~12,1 GB
  - Q8_0: ~15,7 GB
- GPU recomendadas: RTX 3060 12 GB (Q4_K_M), RTX 4070 Ti / 4080 16 GB (Q6_K), RTX 4090 24 GB (Q8_0 con contexto amplio), A100/H100 para despliegue en servidor.
- Cabe en GPU consumer: si, desde una RTX 3060 12 GB con Q4_K_M; para Q8_0 se recomienda 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (tag `text-generation-inference`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi-4-EngineeringJob-GGUF (este) | 14,66B | no disponible | Apache 2.0 | GGUF | Fine-tuning de ingenieria, solo ingles |
| Phi-4 (Microsoft) | 14,66B | 16K | MIT | safetensors, GGUF | Modelo base, mas generalista |
| Qwen2.5-14B-Instruct | 14,7B | 32K | Apache 2.0 | safetensors, GGUF | Multilingue, contexto mayor |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Menor, contexto mucho mayor, licencia restrictiva |

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); no se garantiza calidad en castellano ni otros idiomas.
- Es un fine-tuning SFT de un modelo base; no se documenta si se aplicaron tecnicas de alineacion (RLHF/DPO), por lo que puede presentar respuestas menos pulidas que el Phi-4 original.
- Riesgo de alucinacion inherente a modelos de 14B, especialmente en calculos de ingenieria donde la verificacion humana es imprescindible.
- No se dispone de informacion sobre el dataset de entrenamiento ni sobre sesgos especificos del fine-tuning.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad (la propia model card marca Q3_K_M como "lower quality").
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que limita la calidad maxima alcanzable en tamanos pequenos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo ni sobre los datos de entrenamiento.
- El repositorio tiene muy pocas descargas (45) y ningun like, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/phi-4-EngineeringJob-GGUF
- Modelo base: https://huggingface.co/xuxinyao123/phi-4-EngineeringJob
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#phi-4-EngineeringJob-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Phi-4 original (Microsoft): https://huggingface.co/microsoft/phi-4
