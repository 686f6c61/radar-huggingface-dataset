# roman220220/Inkling-2-Mini-GGUF-jang-imatrix

## Resumen

Inkling-2-Mini-GGUF-jang-imatrix es una cuantización GGUF del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines. El modelo base es una mezcla de expertos (MoE) de 26.400 millones de parámetros con 3.400 millones activos por token, que incorpora una torre de visión y una innovación arquitectónica notable: las capas 6 a 17 se repiten tres veces en bucle. Esta conversión la publica el usuario roman220220 (IPSupport LLC) para su uso con llama.cpp, con una matriz de importancia generada a partir de un corpus amplio y precisión diferencial en las partes sensibles del modelo.

El interés práctico de esta ficha reside en que comprime un modelo de 52,2 GB en F16 hasta 17,8 GB manteniendo una degradación de perplejidad mínima: +0,24 % en wikitext-2 y +0,06 % en un corpus de código Python. Eso permite ejecutar un MoE multimodal de 26 B en hardware de gama alta de consumo, algo inviable con los pesos originales. La licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

La relevancia es doble: por un lado demuestra que las técnicas de cuantización con imatrix y presets mixtos (Q6_K en atención y embeddings, Q4_K_M en expertos enrutados) conservan calidad en arquitecturas MoE con bucles; por otro, expone las limitaciones actuales de llama.cpp con esta arquitectura, con incidencias abiertas en CUDA y soporte incompleto de la decodificación especulativa DSpark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de visión; capas 6-17 repetidas tres veces en bucle |
| Parametros totales | 26.070.385.152 (26,4 B) |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta: Q6_K (atención, embeddings, output head), Q4_K_M (expertos enrutados), F16 (torre de visión en mmproj separado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Datos adicionales: 128 expertos por capa con 8 activos, tamaño del repo 18,4 GB, fichero principal de 17,8 GB más `mmproj-inkling-2-mini-f16.gguf` para visión.

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos por capa y 8 activos por token, lo que resulta en 3,4 B de parámetros efectivos sobre un total de 26,4 B. La innovación estructural más destacada es el bucle de capas: las capas 6 a 17 se ejecutan tres veces, reutilizando pesos y aumentando la profundidad efectiva sin incrementar el recuento de parámetros. Incorpora además una torre de visión que lo habilita para tareas image-text-to-text, y el release original incluye un borrador de decodificación especulativa denominado DSpark (`mtp.safetensors`).

Esta conversión concreta no entrena nada: parte de los pesos del release (almacenados en NVFP4, que el conversor de llama.cpp dequantiza de forma exacta) y aplica una matriz de importancia calculada con `llama-imatrix` sobre 200 fragmentos del corpus de calibración `calibration_datav3` de bartowski. La receta asigna Q6_K a atención, embeddings y cabeza de salida, y Q4_K_M a los expertos enrutados. El autor justifica Q6_K frente a Q8_0 en atención porque Q8_0 decodifica aproximadamente tres veces más lento en tarjetas Vulkan sin producto escalar int8 nativo. Los detalles del pipeline están en el repositorio `rromenskyi/quant-ternary`, carpeta `inkling2-quant/`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia que se activa con `--jinja`.
- Comprensión de imágenes (image-text-to-text) mediante la torre de visión incluida en el fichero mmproj.
- Razonamiento y generación de código: la medición de perplejidad sobre un corpus de la biblioteca estándar de Python sugiere competencia en código, aunque no hay benchmarks publicados en esta ficha.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling y function calling: no confirmado explícitamente en la información disponible; depende de la plantilla del modelo base.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Decodificación especulativa DSpark: no incluida en esta build GGUF (solo en la variante MLX), pendiente de soporte en llama.cpp.

## Casos de uso

- Asistente local multimodal en estación de trabajo: con 17,8 GB de pesos y la torre de visión en F16, se puede desplegar con `llama-server --jinja` y `--mmproj` para responder preguntas sobre capturas de pantalla, diagramas o fotografías sin enviar datos a la nube.
- Procesamiento de documentación técnica con imágenes: extracción de información de manuales escaneados o gráficos combinando el modo texto e imagen en un solo modelo, útil en entornos con requisitos de confidencialidad.
- Generación y revisión de código en local: la baja degradación de perplejidad en código Python (+0,06 %) y la licencia Apache 2.0 lo hacen apto para integrarse en flujos de revisión o autocompletado dentro de empresas que no pueden usar APIs externas.
- Prototipado de agentes con arquitectura MoE eficiente: los 3,4 B activos por token reducen el coste computacional por inferencia frente a un denso de 26 B, lo que abarata iteraciones en bucles de agente de varios pasos.
- Despliegue en servidores con una sola GPU de datacenter: el autor lo probó en una NVIDIA A100 con CUDA, de modo que encaja en infraestructura de inferencia de gama única sin necesidad de tensor parallelism.
- Evaluación e investigación de cuantización: sirve como caso de estudio reproducible de cómo afectan imatrix y presets mixtos a un MoE con capas en bucle, con scripts públicos en `rromenskyi/quant-ternary`.
- Chat conversacional con contexto largo: aunque la longitud de contexto no está documentada en esta ficha, la plantilla propia y el soporte de `llama-server` permiten conversaciones multi-turno; conviene verificar el límite real antes de producción.

## Benchmarks y rendimiento

El autor publica únicamente mediciones de perplejidad con `llama-perplexity` (40 fragmentos por corpus, misma build de llama.cpp):

| Modelo | Tamano | PPL wikitext-2 | PPL Python stdlib |
|---|---|---|---|
| F16 | 52,2 GB | 6,768 | 2,061 |
| Esta cuantizacion | 17,8 GB | 6,785 (+0,24 %) | 2,062 (+0,06 %) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible para esta cuantización. El autor remite a la model card del modelo base para los benchmarks originales de Thinking Machines, que no se han reejecutado aquí.

## Requisitos de hardware

- VRAM estimada: alrededor de 18 GB para los pesos principales más el mmproj F16 de visión; con overhead de contexto y caché KV conviene reservar 22-24 GB para uso cómodo.
- GPU recomendadas: NVIDIA A100 (probado por el autor con CUDA), H100, L40S o RTX 6000 Ada. En consumer, una RTX 4090 (24 GB) es el mínimo realista para texto e imagen simultáneos.
- Cabe en GPU de consumo: sí, en RTX 4090 y modelos con 24 GB o más; en tarjetas de 16 GB habría que reducir contexto o prescindir de la torre de visión.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`) con build master posterior a la PR #32694 (noviembre de 2026, probado con `7778de0c3`). No hay confirmación de soporte en vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte que Q8_0 en atención decodifica unas tres veces más lento en Vulkan sin int8 dot product, motivo por el que eligió Q6_K.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini (esta cuantizacion) | 26,4 B | 3,4 B | no disponible | Si | Apache 2.0 | GGUF 17,8 GB |
| Inkling-2-Mini-gptq-mlx-jang (mismo autor) | 26,4 B | 3,4 B | no disponible | Si | Apache 2.0 | MLX 13,1 GB, con DSpark |
| Inkling-2-Mini base (F16) | 26,4 B | 3,4 B | no disponible | Si | Apache 2.0 | Safetensors 52,2 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~26 B) en la documentación proporcionada; por tanto, la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en esta ficha; hereda los del modelo base, cuya model card hay que consultar.
- Riesgo de alucinación: inherente a los modelos generativos; el autor no publica evaluaciones de factualidad.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad fuera del inglés sin pruebas previas.
- Longitud de contexto: no documentada; conviene medirla empíricamente antes de diseñar flujos de contexto largo.
- Incidencias abiertas en llama.cpp: perplejidad NaN en algunos entornos CUDA (#32710, no reproducido en A100) y prompts de más de ~96 tokens que decodifican a `?` (#32778, no reproducido en la prueba de humo del autor). Actualizar llama.cpp si aparecen.
- Decodificación especulativa DSpark ausente: el borrador `mtp.safetensors` no está en este repo porque llama.cpp aún no lo soporta (PR #32218); quien la necesite debe usar la variante MLX.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio base no incluye fichero de licencia y el autor ha añadido el texto estándar; conviene verificar la procedencia de los pesos antes de un despliegue crítico.
- Validación limitada: probado en una sola A100 con CUDA, dos respuestas de chat y una imagen sintética; no hay evidencia de robustez en producción a mayor escala.
- Descargas y adopción nulas (0 descargas, 0 likes en el momento de la consulta): no hay comunidad que haya validado la cuantización de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/roman220220/Inkling-2-Mini-GGUF-jang-imatrix
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante MLX del mismo autor: https://huggingface.co/roman220220/Inkling-2-Mini-gptq-mlx-jang
- Pipeline y scripts de cuantización: https://github.com/rromenskyi/quant-ternary
- LLMTray (app local para macOS): https://www.ipsupport.us/llmtray/
- Repositorio LLMTray: https://github.com/ipsupport-llc/llmtray
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- PR de llama.cpp con soporte de Inkling 2: #32217 (https://github.com/ggml-org/llama.cpp/pull/32217)
- PR de llama.cpp con soporte del bucle de Mini: #32694 (https://github.com/ggml-org/llama.cpp/pull/32694)
- PR de llama.cpp para DSpark: #32218 (https://github.com/ggml-org/llama.cpp/pull/32218)
- Issue de perplejidad NaN en CUDA: #32710 (https://github.com/ggml-org/llama.cpp/issues/32710)
- Issue de prompts largos decodificando a `?`: #32778 (https://github.com/ggml-org/llama.cpp/issues/32778)
