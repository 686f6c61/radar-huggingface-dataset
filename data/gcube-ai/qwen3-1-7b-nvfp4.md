# gcube-ai/Qwen3-1.7B-nvfp4

## Resumen

Qwen3-1.7B-nvfp4 es una cuantización NVFP4 de 4 bits del modelo Qwen/Qwen3-1.7B, publicada por gcube-ai. No se trata de un modelo nuevo ni de un algoritmo de cuantización propio: es el Qwen3-1.7B original (1.720.574.976 parámetros) convertido a 4 bits con la receta NVFP4 mediante la herramienta llm-compressor, y servido con vLLM sobre una única GPU de consumo RTX 5060 de 8 GB. El resultado es un checkpoint de aproximadamente 1,3 GB de pesos que reduce el espacio ocupado a una cuarta parte respecto al bf16 original.

El interés del repositorio no está en la arquitectura, sino en los datos medidos que aporta el autor: velocidad real de extremo a extremo, latencia del primer token y pérdida de calidad por tarea frente al modelo original en bf16. Con 16 peticiones concurrentes alcanza 1.286 tokens de salida por segundo con un p90 de primer token inferior a 1 segundo, y con un solo usuario ronda los 190 tok/s. Es, por tanto, una pieza pensada para cargas de tool calling y alto rendimiento sobre hardware barato.

La advertencia principal es la degradación en salida estructurada: la precisión cae 18 puntos porcentuales frente al bf16, por encima del margen de error de la muestra, mientras que tool calling y razonamiento se mantienen dentro de ese margen. El modelo hereda la licencia Apache 2.0 del modelo base y declara únicamente inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), cuantizado a NVFP4 de 4 bits |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits), formato compressed-tensors; pesos a ~1/4 del tamano bf16 (1,3 GB) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros. Este repositorio no reentrena ni modifica la arquitectura: aplica una cuantización de pesos y activaciones a NVFP4 (formato de 4 bits con escalas por bloque) usando llm-compressor, la herramienta del ecosistema vLLM/Red Hat, con la receta NVFP4 de NVIDIA. El proceso incluye calibración y verificación de calidad por tarea, que el autor declara como aportación propia junto con las mediciones en hardware real.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. El autor indica explícitamente que no introduce ni una arquitectura nueva ni un algoritmo de cuantización propio, y que el método NVFP4 y la herramienta pertenecen a NVIDIA y a la comunidad de vLLM.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling y function calling: la model card documenta el uso con `--enable-auto-tool-choice` y el parser `hermes` en vLLM, y reporta un 88 % de acierto en la tarea medida.
- Razonamiento: evaluado en GPQA-Diamond con un 22 % de acierto tras la cuantización.
- Salida estructurada (JSON/schema): soportada, pero con degradación medida de 18 puntos porcentuales frente al bf16.
- Contexto largo de hasta 32.768 tokens.
- Despliegue de alto rendimiento en una sola GPU de consumo de 8 GB.
- No se declaran capacidades de visión, audio ni modo de pensamiento extendido en la información disponible.

## Casos de uso

- Tool calling en agentes ligeros: el modelo mantiene un 88 % de acierto en la tarea medida y se sirve con el parser `hermes` de vLLM, por lo que encaja en pipelines de agentes que necesitan muchas llamadas a funciones con latencia baja.
- Atención al cliente automatizada de alto volumen: con 1.286 tok/s a 16 peticiones concurrentes y primer token por debajo de 1 segundo, un solo nodo con RTX 5060 puede atender varias conversaciones simultáneas sin colas perceptibles.
- Clasificación y extracción de texto a gran escala: el throughput de un solo usuario (~190 tok/s) permite procesar lotes de documentos cortos en inglés de forma económica sobre hardware de consumo.
- Enrutamiento y preprocesado dentro de pipelines mayores: al ocupar solo 1,3 GB de pesos, puede convivir con otros modelos en la misma GPU y actuar como clasificador o generador de consultas intermedias.
- Prototipado y evaluación en estaciones de trabajo: cabe en GPUs de consumo de 8 GB, lo que permite a desarrolladores probar flujos de tool calling antes de escalar a modelos mayores.
- Servicio de generación con contexto medio: los 32.768 tokens de ventana permiten resumir o responder sobre documentos de decenas de páginas en una sola pasada.
- No es adecuado para producción que dependa de JSON estricto sin validación previa, dado el descenso medido en salida estructurada.

## Benchmarks y rendimiento

Rendimiento medido en RTX 5060 (8 GB), vLLM v0.32.0, NVFP4, prefix caching activado, 1.024 tokens de entrada y 1.024 de salida por petición:

| Peticiones concurrentes | Tokens de salida/s | Primer token p90 | Exito |
|---:|---:|---:|---:|
| 1 | 190 | 0,44 s | 100 % |
| 2 | 344 | 0,43 s | 100 % |
| 4 | 593 | 0,50 s | 100 % |
| 8 | 891 | 0,63 s | 100 % |
| 16 | 1.286 | 0,96 s | 100 % |

Pérdida de calidad frente al bf16 original con las mismas preguntas (muestras de 50 preguntas, margen de ±14 puntos porcentuales):

| Tarea | bf16 (original) | NVFP4 (este) | Diferencia |
|---|---:|---:|---:|
| Tool calling | 90 % | 88 % | −2 pp |
| Razonamiento (GPQA-Diamond) | 26 % | 22 % | −4 pp |
| Salida estructurada | 56 % | 38 % | −18 pp |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 1,3 GB; con caché KV para 32.768 tokens de contexto y overhead de vLLM, el autor lo ejecuta en una GPU de 8 GB.
- GPU recomendadas: RTX 5060 (8 GB) es el hardware validado por el autor; cualquier GPU con soporte de NVFP4 y al menos 8 GB debería ser suficiente, aunque no se aportan mediciones en otras tarjetas.
- Cabe en GPU de consumo: sí, al menos en la RTX 5060 de 8 GB documentada.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` y `--tool-call-parser hermes`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 190 tok/s con un usuario y 1.286 tok/s con 16 concurrentes; primer token p90 entre 0,43 y 0,96 segundos en todo el rango medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| gcube-ai/Qwen3-1.7B-nvfp4 | 1,72 B | 32.768 | NVFP4 4 bits | Apache 2.0 | 1.286 tok/s a 16 concurrentes en RTX 5060; −18 pp en salida estructurada |
| Qwen/Qwen3-1.7B (bf16) | 1,72 B | 32.768 | bf16 | Apache 2.0 | Referencia de calidad; mayor huella de memoria y menor throughput |
| Otras cuantizaciones de Qwen3-1.7B (no disponibles en la informacion) | 1,72 B | 32.768 | no disponible | Apache 2.0 | No se dispone de datos comparativos medidos |

No se han proporcionado datos de benchmarks de modelos alternativos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Degradación real en salida estructurada: −18 puntos porcentuales frente al bf16, por encima del margen de error de la muestra. Validar antes de desplegar si el caso de uso depende de esquemas o JSON estrictos.
- Solo inglés declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 1,7 B parámetros; no se aportan mediciones específicas de factualidad.
- Muestras de evaluación pequeñas (50 preguntas, margen de ±14 pp): las diferencias en tool calling y razonamiento no son estadísticamente significativas, pero tampoco demuestran ausencia de pérdida.
- Dependencia de vLLM y del formato compressed-tensors: no se documenta compatibilidad con otros runtimes de inferencia.
- Sin datos sobre sesgos del modelo base ni sobre su composición de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se hereda cualquier restricción del modelo base Qwen3-1.7B.
- Repositorio sin descargas ni likes en el momento de la consulta: poca validación externa de las mediciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gcube-ai/Qwen3-1.7B-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
