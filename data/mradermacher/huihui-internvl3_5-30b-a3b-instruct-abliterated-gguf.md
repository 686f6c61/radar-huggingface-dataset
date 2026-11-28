# mradermacher/Huihui-InternVL3_5-30B-A3B-Instruct-abliterated-GGUF

## Resumen

Huihui-InternVL3_5-30B-A3B-Instruct-abliterated-GGUF es la distribucion en formato GGUF del modelo multimodal InternVL3.5-30B-A3B-Instruct, publicado por el colectivo huihui-ai en su variante "abliterated" (sin mecanismos de rechazo entrenados) y cuantizado por mradermacher. Se trata de un modelo de lenguaje y vision construido sobre una arquitectura Mixture-of-Experts (MoE) con 30.532.122.624 parametros totales y aproximadamente 3.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos grandes pero con coste de inferencia contenido.

El modelo original InternVL3.5-30B-A3B procede de la familia InternVL desarrollada por OpenGVLab (Shanghai AI Laboratory), orientada a tareas de comprension visual, razonamiento multimodal y dialogo. La version "abliterated" de huihui-ai elimina las direcciones de activacion asociadas al rechazo de contenido, lo que produce un modelo con menor tendencia a declinar peticiones, a costa de perder parte de las salvaguardas alineadas del modelo original.

La relevancia de esta publicacion concreta reside en su formato: mradermacher ofrece cuantizaciones estaticas GGUF en 11 tamanos distintos (desde Q2_K de 11,4 GB hasta Q8_0 de 32,6 GB), lo que permite ejecutar un modelo multimodal de 30B en hardware de consumo mediante llama.cpp y herramientas compatibles. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones de la "abliteracion" deben evaluarse con cuidado en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal (InternVL3.5) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el identificador "A3B" sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | multilingue (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers, custom_code) |
| Modelo base | huihui-ai/Huihui-InternVL3_5-30B-A3B-Instruct-abliterated |
| Tamano del repositorio | 208,1 GB |
| Descargas | 52 |
| Fecha de creacion | 2025-09-10 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se trata de un modelo de la familia InternVL3.5 con arquitectura MoE (el sufijo "A3B" indica aproximadamente 3.000 millones de parametros activos sobre un total de 30.500 millones) y capacidades multimodales (la etiqueta `internvl` en el repo y el campo `skip_mmproj: 1` en la cuantizacion confirman que incluye un proyector multimodal, aunque este no se ha cuantizado en los GGUF). El modelo requiere `trust_remote_code` y `custom_code` en transformers, lo que implica que la definicion arquitectonica no es estandar.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni el proceso de alineacion (RLHF/DPO) del modelo original InternVL3.5-30B-A3B. La variante "abliterated" se ha generado mediante tecnicas de ablation de direcciones de activacion (tipicamente, sustraccion de la direccion de rechazo en el espacio residual), un procedimiento no documentado en detalle en la informacion disponible. La cuantizacion GGUF se ha realizado con `convert_type: hf` y `output_tensor_quantised: 1`, indicando una conversion desde pesos Hugging Face con cuantizacion estatica de tensores.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Comprension de imagenes (vision) integrada en el modelo base InternVL3.5.
- Razonamiento multimodal: preguntas y respuestas sobre contenido visual.
- Capacidades multilingues (etiqueta `multilingual`, sin listado de idiomas).
- Modo "uncensored"/abliterated: menor probabilidad de rechazo ante peticiones sensibles.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion.

## Casos de uso

- Analisis de documentos escaneados con OCR y extraccion de informacion: el componente visual del modelo permite procesar imagenes de documentos y responder preguntas sobre su contenido, aprovechando la ventana de contexto del modelo base para documentos largos.
- Moderacion de contenido en entornos controlados: la variante abliterated reduce los rechazos automaticos, lo que puede ser util en pipelines de clasificacion que requieren evaluar material sensible sin que el modelo decline la tarea (con supervision humana obligatoria).
- Asistencia a desarrolladores en tareas de codigo y explicacion tecnica: el modelo base InternVL3.5 tiene capacidades de generacion de codigo; la version GGUF permite ejecutarlo en estaciones de trabajo sin GPU de datacenter.
- Despliegue en local para prototipado rapido: con cuantizaciones Q4_K_M (18,7 GB) puede ejecutarse en una GPU consumer de 24 GB (RTX 3090/4090) mediante llama.cpp, ideal para pruebas de concepto sin infraestructura cloud.
- Investigacion sobre alineacion y seguridad: la variante abliterated sirve como objeto de estudio para analizar el comportamiento de modelos sin mecanismos de rechazo y comparar con la version original.
- Generacion de descripciones de imagenes y subtitulado asistido: util en pipelines de accesibilidad o catalogacion de imagenes, ejecutandose en local para preservar la privacidad de los datos.
- Chatbot especializado en dominio con imagenes: integrable en aplicaciones de escritorio o moviles mediante bindings de llama.cpp, con coste de inferencia reducido gracias a la naturaleza MoE (aproximadamente 3B activos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, con overhead de contexto):
  - Q2_K (11,4 GB): ~13-14 GB.
  - Q3_K_M (14,8 GB): ~16-17 GB.
  - IQ4_XS (16,7 GB): ~18-19 GB.
  - Q4_K_M (18,7 GB): ~20-21 GB.
  - Q5_K_M (21,8 GB): ~23-24 GB.
  - Q6_K (25,2 GB): ~27 GB.
  - Q8_0 (32,6 GB): ~34-35 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0; multiples GPU consumer en paralelo para cuantizaciones altas.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090, RTX 5090 y GPUs con 24 GB o mas en cuantizaciones Q4 o inferiores. Las cuantizaciones Q2/Q3 pueden caber en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama-server. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser MoE con ~3B activos, se espera throughput superior al de un denso de 30B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-InternVL3_5-30B-A3B-abliterated-GGUF (este) | 30,5B (MoE, ~3B activos) | no disponible | Si | Apache 2.0 | GGUF |
| InternVL3.5-30B-A3B-Instruct (original) | 30,5B (MoE, ~3B activos) | no disponible | Si | no disponible | safetensors |
| Qwen2.5-VL-32B-Instruct | 32B (denso) | no disponible | Si | Apache 2.0 | safetensors, GGUF |
| Gemma-3-27B-it | 27B (denso) | no disponible | Si | Gemma license | safetensors, GGUF |

La comparativa con Qwen2.5-VL y Gemma-3 se ofrece como referencia de categoria (modelos multimodales de ~30B), pero no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de rechazo entrenados: el modelo puede generar contenido danino, ofensivo o inseguro sin filtros. No debe desplegarse en produccion sin capas adicionales de moderacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay datos especificos sobre la tasa en este modelo.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base InternVL3.5.
- Longitud de contexto e idiomas exactos: no disponibles; la etiqueta `multilingual` no especifica cobertura.
- El proyector multimodal (`mmproj`) no se ha cuantizado en estos GGUF (`skip_mmproj: 1`), por lo que el uso de vision requiere descargar el proyector por separado.
- Requiere `trust_remote_code` y `custom_code` en transformers: riesgo de ejecucion de codigo no auditado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador; la abliteracion puede entrar en conflicto con politicas de plataformas y con normativa de moderacion de contenido.
- Modelo con muy pocas descargas (52) y un solo "like": poca validacion comunitaria; tratar con cautela en entornos criticos.
- Sin benchmarks publicados en la informacion disponible: no es posible verificar el rendimiento frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-InternVL3_5-30B-A3B-Instruct-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-InternVL3_5-30B-A3B-Instruct-abliterated
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Huihui-InternVL3_5-30B-A3B-Instruct-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Huihui-InternVL3_5-30B-A3B-Instruct-abliterated-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
