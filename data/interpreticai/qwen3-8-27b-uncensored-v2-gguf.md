# InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-GGUF es la distribucion en formato GGUF del modelo Qwen3.8-27B-Uncensored-v2, un ajuste fino de Qwen3.8-27B desarrollado por InterpreticAI cuyo objetivo declarado es eliminar buena parte de la censura politica presente en el modelo original. El repositorio incluye el modelo de lenguaje cuantizado en Q4_K_M (16,8 GB) y el proyector visual en F16 (0,93 GB), lo que permite ejecutar el modelo multimodal completo con llama.cpp y runtimes compatibles.

El modelo conserva la arquitectura y el tamano del Qwen3.8-27B original: 27.320.697.856 parametros totales (27,3 mil millones), pesos en safetensors en el repositorio base y licencia Apache 2.0 heredada de Qwen. La pipeline declarada es image-text-to-text, por lo que mantiene capacidad de entrada de imagen ademas de texto. El contexto configurado en el ejemplo oficial de llama-server es de 65.536 tokens.

La relevancia actual del modelo reside en su evaluacion explicita del sesgo politico: segun la model card, el ajuste reduce la tasa de respuestas censuradas del 86,7% (98 de 113) en Qwen3.8-27B al 3,5% (4 de 113) en la version Q4_K_M, sobre un conjunto de 113 preguntas politicamente sensibles en chino. Es, por tanto, un modelo orientado a investigadores que necesitan estudiar o evitar la censura politica en modelos de origen chino, no un modelo de proposito general sin salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (configuracion de ejemplo en llama-server) |
| Tipos de cuantizacion | Q4_K_M (LLM, 16,8 GB); proyector visual F16 (0,93 GB); repositorio base en BF16 y variante FP8 |
| Idiomas soportados | no disponible (la evaluacion politica cubre solo chino) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (llama.cpp); BF16 en safetensors en el modelo base; FP8 en variante aparte |

## Arquitectura y entrenamiento

El modelo es una variante ajustada de Qwen3.8-27B, por lo que mantiene la arquitectura transformer del original, con 27,3 mil millones de parametros y capacidad multimodal de entrada de imagen (pipeline image-text-to-text). La model card no detalla la composicion del dataset de ajuste, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que el objetivo del ajuste es eliminar en gran medida la censura politica del modelo base.

La innovacion tecnica destacable no esta en la arquitectura sino en la evaluacion: el autor mide la tasa de censura politica con 113 preguntas sensibles, modo no-thinking, decodificacion greedy y un maximo de 4.096 tokens de salida, etiquetando cada respuesta como censurada o no censurada mediante un juez LLM. Ademas, se reporta una evaluacion de rechazo de peticiones daninas sobre el release BF16 (95 de 100 rechazadas frente a 100 de 100 del original) y benchmarks de capacidad general (GPQA Diamond, IFBench, MMLU). La conversion a GGUF se realizo con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con llama.cpp (`--jinja`).
- Razonamiento en modo thinking y no-thinking; el modo no-thinking se activa con `--chat-template-kwargs '{"enable_thinking": false}'`.
- Entrada de imagen mediante el proyector visual `mmproj` en F16 (pipeline image-text-to-text).
- Respuestas a preguntas de conocimiento general y razonamiento cientifico (evaluado en GPQA Diamond y MMLU).
- Seguimiento de instrucciones (evaluado en IFBench con 79,0 puntos en BF16).
- Capacidad multilingue: no disponible en detalle; la evaluacion de censura politica se limita a preguntas en chino.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre censura politica en LLM: el modelo permite comparar respuestas del original y de la variante sin censura sobre el mismo conjunto de preguntas sensibles, con una tasa de censura medida del 3,5% frente al 86,7% del base.
- Analisis de sesgo y alineacion: util para estudiar que tipo de salvaguardas se eliminan con el ajuste y como afecta al comportamiento del modelo en dominios politicos.
- Despliegue local en estaciones de trabajo con GPU consumer: la cuantizacion Q4_K_M (16,8 GB) mas el proyector visual (0,93 GB) permite ejecutar el modelo completo en llama.cpp con `-ngl 999`.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede usarse para extraer y razonar sobre contenido de capturas, graficos o paginas escaneadas en un pipeline local.
- Prototipado de asistentes conversacionales sin filtros editoriales: para entornos de investigacion donde se necesita estudiar respuestas sin capas de rechazo politico, con contexto de hasta 65.536 tokens.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir la degradacion de Q4_K_M frente a BF16 en tareas de razonamiento (GPQA, MMLU) y seguimiento de instrucciones (IFBench).

## Benchmarks y rendimiento

| Benchmark | Referencia | Puntuacion referencia | Uncensored-v2 (BF16) | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.8-27B (card oficial) | 89,2 | 86,4 | −2,8 |
| IFBench | Qwen3.8-27B (card oficial) | 79,5 | 79,0 | −0,5 |
| MMLU (200 preguntas) | Qwen3.8-27B (evaluacion propia) | 87,5 | 86,5 | −1,0 |

| Evaluacion de censura politica (Pan & Xu, 2026) | Respuestas censuradas (de 113) | Tasa de censura |
|---|---|---|
| Qwen3.8-27B | 98 | 86,7% |
| Qwen3.8-27B-Uncensored-v2 Q4_K_M | 4 | 3,5% |

| Rechazo de peticiones daninas (BF16) | Peticiones rechazadas (de 100) |
|---|---|
| Qwen3.8-27B | 100 |
| Qwen3.8-27B-Uncensored-v2 | 95 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,7 GB para el LLM en Q4_K_M (16,8 GB) mas el proyector visual F16 (0,93 GB), sin contar el espacio de cache KV.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) y, en general, GPU con 24 GB o mas para Q4_K_M con contexto amplio.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) y modelos con 24 GB o mas; en GPU de 16 GB no cabe el LLM Q4_K_M completo con el proyector visual.
- Opciones de despliegue: llama.cpp (`llama-server`), runtimes compatibles con GGUF y endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte de vLLM, TGI u Ollama en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura politica (113 preguntas) | GPQA Diamond | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2 (Q4_K_M) | 27,3 B | 65.536 tokens (ejemplo) | 3,5% | 86,4 (BF16) | Apache 2.0 | GGUF, BF16, FP8 |
| Qwen3.8-27B | 27,3 B | no disponible | 86,7% | 89,2 | Apache 2.0 | safetensors |
| Qwen3.8-27B-Uncensored-v2 (BF16) | 27,3 B | no disponible | no disponible en Q4 | 86,4 | Apache 2.0 | safetensors |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion de censura politica cubre unicamente preguntas en chino; el comportamiento en otros idiomas no esta medido.
- Una respuesta sustantiva no implica que sea correcta: la model card advierte explicitamente que los usuarios deben verificar las afirmaciones factuales de forma independiente.
- El ajuste reduce los rechazos ante peticiones daninas del 100% al 95% (BF16), lo que implica que el modelo puede aceptar un pequeno porcentaje de solicitudes que el original rechazaria; no es un modelo con salvaguardas completas.
- La evaluacion de rechazo de peticiones daninas se realizo sobre el release BF16, no sobre la cuantizacion Q4_K_M.
- La cuantizacion Q4_K_M introduce una perdida de capacidad medible: −2,8 puntos en GPQA Diamond y −1,0 en MMLU frente al BF16.
- Licencia Apache 2.0 heredada de Qwen, con atribucion al equipo de Qwen; permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ajustado.
- No se documentan sesgos conocidos adicionales, idiomas soportados ni limitaciones de contexto mas alla del ejemplo de 65.536 tokens.
- El modelo puede generar contenido politicamente sensible sin filtro; su uso en produccion requiere revision editorial y cumplimiento normativo por parte del desplegador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Modelo base (BF16): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Variante FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia: Pan, J., & Xu, X. (2026). Political censorship in large language models originating from China. PNAS Nexus, 5(2), pgag013. https://doi.org/10.1093/pnasnexus/pgag013
