# Elidesentiago/Qwen3.5-4B-SOMPOA-heresy-v2-Q4_K_M-GGUF

## Resumen

Elidesentiago/Qwen3.5-4B-SOMPOA-heresy-v2-Q4_K_M-GGUF es una cuantizacion en formato GGUF (tipo Q4_K_M) del modelo MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2, un derivado de la familia Qwen3.5 de 4B parametros publicado por el usuario Elidesentiago. Se trata de un modelo conversacional multimodal (pipeline image-text-to-text) que ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetas heretic, uncensored, decensored, abliterated), es decir, se ha modificado para reducir los rechazos y el alineamiento de seguridad del modelo original, manteniendo la arquitectura base de Qwen3.5-4B.

El modelo cuenta con 4.205.751.296 parametros totales (segun los pesos en safetensors del modelo base) y se distribuye en un repositorio de 2,7 GB, lo que corresponde a una cuantizacion de 4 bits con mezcla de precisiones (Q4_K_M). La licencia declarada es Apache 2.0 y el formato de pesos es GGUF, pensado para su uso con llama.cpp y ecosistemas compatibles.

Su relevancia actual radica en que ofrece una alternativa ligera, ejecutable en hardware de consumo, para tareas conversacionales y de vision-lenguaje sin las restricciones de seguridad del modelo original. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la ficha, sin model card propia mas alla de la plantilla generada por GGUF-my-repo, por lo que la informacion tecnica disponible es muy limitada y procede casi exclusivamente de los metadatos y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-4B; transformer multimodal image-text-to-text segun pipeline_tag) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo contiene unicamente esta cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero qwen3.5-4b-sompoa-heresy-v2-q4_k_m.gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Por los metadatos (pipeline image-text-to-text y base Qwen3.5-4B) se infiere que el modelo original es un transformer multimodal capaz de procesar imagenes y texto, con aproximadamente 4,2 mil millones de parametros. El proceso de "abliteration" aplicado en la variante heresy-v2 consiste tipicamente en la modificacion selectiva de direcciones de activacion o pesos para eliminar el comportamiento de rechazo, sin reentrenamiento completo desde cero.

No consta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. El modelo base es MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2, y esta version es una conversion a GGUF realizada mediante el espacio GGUF-my-repo de ggml.ai, sin cambios adicionales en los pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta conversational).
- Procesamiento de imagenes y texto (pipeline image-text-to-text), lo que sugiere capacidades de vision-lenguaje heredadas del modelo base.
- Comportamiento "uncensored" / "abliterated": menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Compatibilidad con llama.cpp (CLI y servidor) y con endpoints compatibles (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un GGUF Q4_K_M de 4,2B, puede ejecutarse en portatiles con GPU de consumo o incluso en CPU, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Experimentacion con modelos sin alineamiento de seguridad: util en investigacion sobre robustez, sesgos y comportamiento de modelos abliterated en entornos controlados.
- Descripcion de imagenes y tareas vision-lenguaje en local: el pipeline image-text-to-text permite generar descripciones o responder preguntas sobre imagenes sin enviar datos a servicios externos.
- Integracion en pipelines de llama.cpp: el modelo se puede servir con `llama-server` y consumir mediante API compatible con OpenAI, facilitando su incorporacion en aplicaciones existentes.
- Educacion y divulgacion: sirve para demostrar el efecto de la cuantizacion Q4_K_M y del abliteration sobre el comportamiento de un modelo de 4B en comparacion con el original.
- Evaluacion comparativa de tecnicas de decensoring: permite medir diferencias de calidad, coherencia y tasas de rechazo frente al modelo base sin modificar.
- Despliegue en entornos con recursos limitados: 2,7 GB de pesos permiten cargar el modelo en GPUs con 4-6 GB de VRAM o en sistemas embebidos con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con la cuantizacion Q4_K_M (2,7 GB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3050, RTX 4060, RTX 3060, etc.); en GPUs de gama alta (A100, H100, RTX 4090) el modelo queda sobredimensionado pero funciona.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por formato GGUF es compatible con Ollama, LM Studio y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no se garantiza.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Elidesentiago/Qwen3.5-4B-SOMPOA-heresy-v2-Q4_K_M-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF Q4_K_M | Variante abliterated multimodal, 0 descargas |
| MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2 (base) | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen/Qwen3.5-4B (original) | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo de referencia con alineamiento de seguridad |
| Otras variantes GGUF de Qwen3.5-4B | 4,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estandar sin abliteration |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se ha eliminado o reducido el alineamiento de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de 4B y potencialmente agravado por el proceso de abliteration, que puede degradar la coherencia.
- Sin model card propia: la documentacion se limita a la plantilla de GGUF-my-repo; no hay informacion sobre datos de entrenamiento, sesgos ni evaluaciones.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue adecuado.
- Contexto no documentado: la longitud de contexto es desconocida; el ejemplo de la model card usa `-c 2048`, lo que sugiere un uso conservador.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterated; la responsabilidad legal del uso recae en el desplegador.
- Modelo con cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo base en safetensors; el impacto exacto no esta medido.
- Existe una version mas reciente indicada en la model card (MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2-MTP), lo que sugiere que este checkpoint puede quedar obsoleto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Elidesentiago/Qwen3.5-4B-SOMPOA-heresy-v2-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2
- Version mas reciente indicada: https://huggingface.co/MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2-MTP
- Modelo Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
