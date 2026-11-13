# positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq

## Resumen

`positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq` es una cuantizacion GPTQ de 4 bits del modelo base Qwen/Qwen3.5-4B, publicada por Positron AI. El artefacto esta pensado exclusivamente para inferencia en GPU y conserva la licencia Apache 2.0 del modelo original. Con 4.659.865.088 parametros (aproximadamente 4,66 mil millones) y un repositorio de 8,8 GB, se posiciona como una alternativa de bajo coste de memoria frente a los pesos en precision completa.

La relevancia de esta publicacion es practica: reduce el peso del modelo a 4 bits por peso con cuantizacion simetrica de grupo 64, lo que permite desplegarlo en GPUs de consumo con VRAM limitada. No obstante, la model card no aporta metricas de calidad (ni perplejidad ni divergencia KL), por lo que la evaluacion comparativa con el modelo original queda en manos del usuario.

Al tratarse de un artefacto derivado, sus capacidades funcionales son las del modelo base Qwen3.5-4B, que segun los tags del repositorio incluye procesamiento de imagen-texto (`image-text-to-text`) ademas de generacion de texto. La informacion disponible no detalla la arquitectura interna, el contexto maximo ni los datos de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; tag `qwen3_5`) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, grupo 64, simetrica, `desc_act: false`, damp 0.05; activaciones sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), libreria `transformers` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-4B en los datos proporcionados (tipo de transformer, atencion, contexto nativo, composicion del corpus de entrenamiento o fases de alineamiento como RLHF o DPO). El tag `qwen3_5` sugiere la familia Qwen 3.5, pero no se detallan sus caracteristicas tecnicas.

Lo que si esta documentado es el proceso de cuantizacion de este artefacto: GPTQ de 4 bits con tamano de grupo 64, cuantizacion simetrica, sin `desc_act` y con un 0,05 % de damping. Se calibro con un conjunto mixto de dominio universal de 512 muestras y longitud de secuencia 8192, usando GPTQModel 7.3.4 sobre transformers 5.11.0, torch 2.9.1 y CUDA 12.8. Las activaciones no se cuantizan, solo los pesos.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Procesamiento de entrada imagen-texto, segun el tag `image-text-to-text` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita el despliegue en infraestructuras de inferencia gestionadas.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible.
- Modos especiales (thinking, audio, etc.): no disponible.

## Casos de uso

- Despliegue en GPU de consumo: la cuantizacion a 4 bits reduce el peso de los pesos a aproximadamente 2,3-2,5 GB, lo que permite ejecutar el modelo en tarjetas de 8-12 GB de VRAM junto con el contexto y el runtime.
- Prototipado rapido de asistentes conversacionales: al ser compatible con `transformers` y con endpoints, se puede levantar un servicio de chat multi-turno sin infraestructura dedicada.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir la perdida de calidad frente a los pesos originales de Qwen3.5-4B en tareas propias antes de decidir el formato de produccion.
- Procesamiento de imagenes con texto asociado: el tag `image-text-to-text` habilita tareas de descripcion, extraccion o respuesta sobre imagenes, siempre que el modelo base lo soporte en la practica.
- Generacion de texto a gran escala con coste contenido: para pipelines de clasificacion, resumen o extraccion donde el throughput importa mas que la precision absoluta.
- Entornos de I+D con presupuesto limitado: permite experimentar con un modelo de ~4,7 B en una sola GPU sin recurrir a instancias A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no reporta metricas de rendimiento ni de calidad (ni divergencia KL, ni exactitud, ni perplejidad), y que la validacion se gestiona internamente por Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 4 bits ocupan aproximadamente 2,3-2,5 GB; con cache KV, overhead del runtime y contexto moderado, el consumo practico se situa en torno a 4-8 GB segun la longitud de secuencia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, L4, L40S, A10G; A100 y H100 solo si se necesita concurrencia alta.
- GPU de consumo: si, cabe en tarjetas de 8 GB o mas con contextos moderados; en 6 GB el margen es muy ajustado.
- Opciones de despliegue: `transformers` con kernels GPTQ (GPTQModel, AutoGPTQ o el soporte nativo de transformers), vLLM con soporte GPTQ, TGI y servidores compatibles con endpoints. llama.cpp/Ollama no aplican directamente porque el formato publicado es GPTQ, no GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq | ~4,66 B | no disponible | GPTQ 4 bits, grupo 64 | Apache 2.0 | Artefacto derivado; sin metricas publicadas |
| Qwen/Qwen3.5-4B (original) | ~4,66 B | no disponible | BF16/FP16 | Apache 2.0 | Referencia de calidad; mayor VRAM |
| Otras cuantizaciones de Qwen3.5-4B (AWQ, GGUF) | ~4,66 B | no disponible | AWQ 4 bits, GGUF Q4_K_M, etc. | Apache 2.0 | Formatos alternativos segun runtime |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion GPTQ de 4 bits puede degradar la calidad respecto a los pesos originales; el autor no publica ninguna metrica que cuantifique esa perdida.
- Riesgo de alucinacion inherente al modelo base, no caracterizado en esta model card.
- Sesgos conocidos del modelo base: no documentados en la informacion disponible.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero siguen aplicando las restricciones del modelo original Qwen/Qwen3.5-4B; conviene revisar su LICENSE antes de desplegar.
- El artefacto esta pensado para inferencia; no se documenta su uso para entrenamiento o ajuste fino.
- El tag `image-text-to-text` sugiere capacidades multimodales, pero no se confirma en la model card; validar antes de asumirlas en produccion.
- Fecha de publicacion declarada en la model card (2026-11-12) coherente con la ultima actualizacion del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- GPTQModel: https://github.com/ModelCloud/GPTQModel
- Paper GPTQ: https://arxiv.org/abs/2210.17323
