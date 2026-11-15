# RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF es una coleccion de cuantizaciones GGUF generadas por el usuario RacingAce66 a partir de su propio checkpoint base del mismo nombre. El modelo base parte de la familia Qwen3 (etiquetada en los metadatos como `qwen3_5`), con aproximadamente 26.900 millones de parametros, y ha sido sometido a un proceso de "abliteration" (eliminacion de rechazos) y de reduccion de comportamiento servil o adulador ("unsycophantic"), segun indican los tags y el nombre del repositorio. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales, aunque la model card no aporta detalles al respecto.

El repositorio no incluye pesos en formato safetensors, sino tres ficheros GGUF listos para su uso con llama.cpp: Q4_K_M (16,5 GB), Q6_K (22,1 GB) y Q8_0 (28,6 GB). El repositorio completo ocupa 67,2 GB. No hay informacion publicada sobre el dataset de entrenamiento, el proceso de fine-tuning, la longitud de contexto soportada ni los idiomas cubiertos.

La relevancia de esta publicacion es limitada y muy especifica: se trata de un modelo derivado de un autor individual, sin descargas ni interacciones en el momento de la consulta, y con una licencia "other" sin texto legal accesible en la informacion proporcionada. Resulta util unicamente como referencia para quien quiera reproducir el pipeline de cuantizacion o experimentar con variantes abliterated de Qwen3 en local, no como modelo recomendado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other (texto no disponible) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags indican que deriva de la familia Qwen3 (`qwen3_5`), lo que implica un transformer decoder-only, pero no se especifica si incorpora atencion lineal, mezcla de expertos u otras variantes. El pipeline declarado `image-text-to-text` sugiere un componente de vision, si bien no hay confirmacion en la model card ni descripcion del mismo.

Respecto al entrenamiento, solo consta el proceso de publicacion: el autor convirtio un checkpoint bf16 con `convert_hf_to_gguf.py` y lo cuantizo con `llama-quantize`. El nombre del modelo indica dos intervenciones sobre el checkpoint original: abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) y un ajuste orientado a reducir la adulacion o complacencia en las respuestas. No se aportan datos sobre tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni hiperparametros.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados, segun el pipeline declarado `image-text-to-text`; el alcance real no esta documentado.
- Comportamiento "abliterated": se espera una menor tasa de rechazos ante peticiones que un modelo alineado convencional rechazaria; no hay evaluacion publicada que lo cuantifique.
- Comportamiento "unsycophantic": el autor declara un ajuste para reducir respuestas aduladoras; sin metricas disponibles.
- Compatibilidad con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Experimentacion local con modelos de 27 B en formato GGUF: el fichero Q4_K_M (16,5 GB) permite ejecutar el modelo en una GPU de consumo con 24 GB de VRAM o en configuraciones CPU+GPU con llama.cpp, util para pruebas de concepto sin infraestructura dedicada.
- Investigacion sobre abliteration: comparar las respuestas del modelo frente al checkpoint Qwen3 original para estudiar como cambia la tasa de rechazos y la calidad en tareas sensibles.
- Estudio de sesgo y calibracion: el ajuste "unsycophantic" declarado lo convierte en un sujeto de analisis para medir si realmente reduce la adulacion en comparaciones ciegas frente a modelos alineados.
- Evaluacion de cuantizaciones: los tres niveles (Q4_K_M, Q6_K, Q8_0) permiten medir la degradacion de calidad y el impacto en velocidad al reducir precision, con el mismo modelo base.
- Prototipado de asistentes conversacionales sin filtros estrictos: en entornos controlados de investigacion donde se necesita un modelo que no bloquee peticiones por defecto, siempre con supervision humana.
- Pruebas de pipelines multimodales en llama.cpp: si el componente de vision funciona en la practica, sirve para validar flujos image-text-to-text en local; conviene verificarlo antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GB para Q4_K_M, 22,1 GB para Q6_K y 28,6 GB para Q8_0, mas overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q6_K; A100 40 GB, H100 o RTX 6000 Ada para Q8_0.
- Cabe en GPU de consumo: si, Q4_K_M en RTX 3090/4090 (24 GB) y en GPUs de 16 GB solo con offload parcial a CPU; Q8_0 no cabe en consumer de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en la mayoria de configuraciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-heretic-unsycophantic (este) | 26,9 B | no disponible | other | GGUF | Abliterated, sin benchmarks publicados |
| Qwen3-32B (oficial) | 32,8 B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alineado, benchmarks publicados |
| Qwen3-30B-A3B (oficial, MoE) | 30,5 B totales / 3,3 B activos | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | MoE, mayor eficiencia de inferencia |
| Gemma 3 27B (Google) | 27 B | 128K (segun documentacion publica) | Gemma Terms | safetensors, GGUF | Multimodal, alineado |

La comparacion con modelos oficiales se basa en datos publicos de sus respectivas documentaciones; no se dispone de evaluaciones del modelo de RacingAce66 que permitan contrastar rendimiento real.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debe asumirse que rinda igual que el Qwen3 original.
- La abliteration puede degradar la coherencia y aumentar la probabilidad de contenido danino o inexacto; requiere filtros y supervision en cualquier uso real.
- El ajuste "unsycophantic" no esta evaluado: no hay garantia de que reduzca la adulacion ni de que no introduzca otros sesgos.
- Licencia "other" sin texto legal accesible: el uso comercial es incierto y debe verificarse con el autor antes de cualquier despliegue.
- No se documentan idiomas soportados ni longitud de contexto; el rendimiento en castellano es desconocido.
- El pipeline `image-text-to-text` no esta confirmado en la practica; conviene probar el componente de vision antes de integrarlo.
- Riesgo de alucinacion no cuantificado, agravado por la falta de evaluaciones.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta: tratar como experimento, no como modelo de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF
- Modelo base: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic
- llama.cpp: https://github.com/ggml-org/llama.cpp
