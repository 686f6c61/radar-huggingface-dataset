# mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-i1-GGUF

## Resumen

El repositorio `mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-i1-GGUF` contiene un conjunto de cuantizaciones en formato GGUF generadas por el usuario mradermacher a partir del modelo `SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local mediante llama.cpp y motores compatibles. El modelo base declara 25.971.339.550 parámetros totales (aproximadamente 26B), según el dato de safetensors proporcionado en la ficha de HuggingFace.

El nombre del modelo sugiere varias cosas que no están confirmadas explícitamente en la información disponible: el segmento "Gemma-4-26B" apunta a una base de la familia Gemma con 26B parámetros; el sufijo "A4B" sigue la convención habitual de los modelos de mezcla de expertos (MoE) para indicar unos 4B parámetros activos por token; "StyleTune" apunta a un ajuste fino orientado a estilo conversacional; y "Heretic" es el nombre de una técnica/herramienta conocida de ablación de direcciones de rechazo (decensoring). Ninguno de estos extremos está documentado en la model card, que se limita a la metadata de cuantización.

La relevancia de este repositorio es práctica: ofrece una batería completa de cuantizaciones (desde IQ1_S hasta Q6_K) con calibración imatrix y pesos ponderados, lo que permite desplegar un modelo de ~26B en hardware de consumo. No obstante, la ausencia de licencia, idiomas y resultados de benchmarks publicados limita seriamente su evaluación rigurosa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo "A4B" del nombre sugiere MoE con ~4B parametros activos, sin confirmar) |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | no disponible (el nombre indica "A4B", ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, small-IQ4_NL, Q4_K_S, Q4_K_M, IQ4_XS, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ2_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos originales en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, la composicion del dataset de entrenamiento ni el proceso de ajuste (RLHF, DPO, SFT) del modelo base. La model card unicamente documenta los metadatos de la conversion: `convert_type: hf`, `output_tensor_quantised: 1` y `quantize_version: 2`, lo que indica que la cuantizacion se realizo a partir de pesos en formato HuggingFace.

Por la nomenclatura del repositorio cabe inferir, sin que exista confirmacion documental, que la base es un transformer de tipo mezcla de expertos con aproximadamente 4B parametros activos y 26B totales, y que fue sometido a un proceso de ajuste estilistico ("StyleTune") y a una tecnica de ablacion de rechazos ("Heretic"). Las cuantizaciones de este repositorio se generaron con calibracion imatrix y ponderacion por importancia, lo que tipicamente reduce la perdida de calidad en niveles de cuantizacion agresivos (IQ1, IQ2). El campo `skip_mmproj: 1` sugiere que no se incluye proyector multimodal en las cuantizaciones.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` esta declarado explicitamente.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que los GGUF pueden servirse mediante APIs compatibles con OpenAI.
- Razonamiento y generacion de codigo: no disponible (no documentado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible. El flag `skip_mmproj` sugiere ausencia de capacidades multimodales en estas cuantizaciones.
- Capacidad inferida por ablacion ("Heretic"): posible reduccion de rechazos ante prompts sensibles, sin confirmacion documental.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de ~26B en GPUs de 16-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos originales.
- Prototipado conversacional offline: el tag `conversational` y el formato GGUF facilitan levantar un chatbot local con `llama-server` exponiendo un endpoint compatible con OpenAI.
- Investigacion sobre cuantizacion extrema: la disponibilidad de niveles IQ1_S, IQ2_S e IQ3_XXS permite estudiar la degradacion de calidad a muy baja precision sobre una base de ~26B.
- Evaluacion de tecnicas de ablacion: el sufijo "Heretic" hace de este modelo un candidato para estudiar los efectos de la eliminacion de direcciones de rechazo en un modelo conversacional.
- Integracion en pipelines de CI/CD sin conectividad externa: al ser pesos locales en GGUF, puede embeberse en entornos aislados para tareas de generacion de texto o clasificacion.
- Servicio de inferencia ligero con vLLM o TGI: si el motor soporta la arquitectura GGUF/convertida, podria desplegarse en GPU con batching para cargas moderadas.
- Fine-tuning posterior sobre la base safetensors: aunque este repositorio es GGUF, la referencia al modelo original `SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic` permite acceder a los pesos completos para un ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se han encontrado datos de rendimiento en la busqueda web realizada (los resultados obtenidos son irrelevantes y no guardan relacion con el modelo).

## Requisitos de hardware

Estimaciones orientativas de VRAM para inferencia (pesos mas overhead de contexto, valores aproximados dado que no se publica el tamano exacto por fichero):

- IQ1_S: aproximadamente 5-6 GB de VRAM.
- IQ2_M / Q2_K: aproximadamente 8-10 GB de VRAM.
- IQ3_M / Q3_K_M: aproximadamente 11-13 GB de VRAM.
- Q4_K_M: aproximadamente 14-16 GB de VRAM.
- Q5_K_M: aproximadamente 17-19 GB de VRAM.
- Q6_K: aproximadamente 20-22 GB de VRAM.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 (16 GB) con cuantizaciones Q4 o inferiores; en GPUs de 8-12 GB solo con IQ1/IQ2 y contexto reducido.
- GPU profesionales: A100 40/80 GB, H100, L40S pueden alojar cualquier cuantizacion con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, llama-server (endpoint compatible OpenAI), LM Studio; vLLM y TGI requeririan conversion o soporte especifico de la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que la arquitectura y el contexto oficiales no estan confirmados, la comparacion se ofrece con cautela y marcando los campos desconocidos como "no disponible".

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-StyleTune-QK-Heretic (este) | ~26B | no disponible (~4B por nombre) | no disponible | no disponible | GGUF (y safetensors base) |
| Qwen3-30B-A3B | 30B | ~3B | 128K (segun variante) | Apache 2.0 (segun variante) | safetensors, GGUF |
| Gemma 3 27B | 27B | denso | 128K | Gemma license | safetensors, GGUF |
| Mistral Small 3.1 24B | 24B | denso | 128K | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos comparados se incluyen como referencia generica de categoria (tamano ~24-30B); no se dispone de resultados comparativos de benchmarks entre este repositorio y los citados.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial. La licencia del modelo base (potencialmente Gemma) podria imponer restricciones adicionales que no se reflejan en este repositorio.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o seguridad.
- Idiomas no declarados: no puede garantizarse un rendimiento multilingue concreto.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; no se documenta mitigacion.
- Efecto de la ablacion ("Heretic"): un modelo ablacionado puede generar contenido que el original rechazaria; esto implica riesgos de seguridad y de cumplimiento normativo en produccion.
- Cuantizaciones extremas (IQ1_S, IQ2_XXS): degradacion notable esperada en coherencia y seguimiento de instrucciones.
- Contexto no especificado: no puede planificarse el uso con ventanas largas sin verificar el parametro real.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni retroalimentacion de uso.
- Fechas de creacion y actualizacion (2026-09-13): inconsistentes con el calendario actual; verificar la procedencia del repositorio.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-i1-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic
- Repositorios y demos adicionales: no disponible (los resultados de la busqueda web realizada no contienen informacion relacionada con el modelo).
