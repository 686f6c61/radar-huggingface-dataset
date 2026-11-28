# nahcmon/Inkling-2-Mini-fast-GGUF

## Resumen

Inkling-2-Mini-fast-GGUF es una cuantización personalizada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario nahcmon. El modelo base es un transformer de tipo Mixture of Experts (MoE) con capacidades de visión, y esta versión GGUF está específicamente optimizada para ejecutarse íntegramente en una GPU de 12 GB de VRAM, incluyendo el proyector de visión y la caché KV. El paquete incluye pesos cuantizados y un motor llama.cpp modificado (inkling-fast) que repaqueta los tensores para lograr el rendimiento prometido.

La propuesta de valor principal es la eficiencia: frente a la versión original de 15,5 GB que no cabe en una tarjeta de 12 GB y que obliga a descargar expertos a la CPU, esta cuantización reduce el tamaño a 9,24 GB y multiplica por más de seis la velocidad de decodificación (de 12,2 a 76,7 tok/s en pruebas del autor). Además, soporta contexto largo (hasta 256k tokens en la variante long) y procesamiento concurrente de hasta 8 peticiones simultáneas.

Es relevante para desarrolladores que quieran desplegar un modelo MoE multimodal de ~27.000 millones de parámetros totales en hardware de consumo, sin necesidad de GPUs de centro de datos. La licencia Apache 2.0 facilita su uso comercial, aunque la dependencia de un motor no estándar añade fricción operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con visión (proyector multimodal) |
| Parametros totales | 26.976.357.376 (~27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128k (64k en modo Fast), 256k en variante long |
| Tipos de cuantizacion | IQ2_XS (expert gate/up), IQ3_XXS (expert down), Q6_K (atención), q4_0/q3_0 para KV cache |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere motor inkling-fast; no carga en llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con un módulo de visión separado (proyector mmproj). La información disponible no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador se centra en el proceso de cuantización y optimización del motor, no en el entrenamiento del modelo original.

La innovación técnica principal de esta ficha reside en el proceso de cuantización y en las modificaciones del motor llama.cpp. El autor aplica compensación de error estilo GPTQ sobre los expertos gate/up, escalas de bloque aprendidas por capa (variante 9.3-tuned) para alinear la salida del bloque MoE con la referencia Q8, y repaqueta ("folded") proyecciones que comparten entrada para fusionar matmuls. El motor incluye atención flash con sesgo de posición relativa calculado dentro del kernel, kernels fusionados para activación SiTU, convoluciones y router MoE, y gestión de caché KV compartida para peticiones paralelas. La decodificación especulativa (DSpark) fue probada pero descartada por ser más lenta en este MoE a temperatura 1.0.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 256k tokens en variante long).
- Procesamiento de imágenes mediante proyector de visión (fotos, capturas de pantalla, pegado directo).
- Razonamiento y respuesta a instrucciones en formato chat.
- Soporte de tool calling y function calling (etiqueta `endpoints_compatible` y `conversational`).
- Capacidades de agente y razonamiento multi-paso (el autor menciona 8 subagentes compartiendo prompt de sistema de 13,1k tokens).
- Procesamiento concurrente de hasta 8 peticiones simultáneas (4 en variante long).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local con visión: el modelo puede gestionar conversaciones multi-turno e interpretar imágenes (capturas, fotos) en una única GPU de 12 GB, adecuado para prototipos de atención al cliente o asistentes personales que requieran privacidad de datos.
- Análisis de documentos y capturas de pantalla: gracias al proyector de visión y al contexto de 128k-256k tokens, se puede usar para extraer información de interfaces, gráficos o documentos escaneados en flujos de trabajo de automatización.
- Despliegue de agentes multi-paso en hardware de consumo: el soporte de tool calling y la gestión de 8 peticiones concurrentes con caché KV compartida permiten orquestar subagentes que comparten un prompt de sistema largo (13,1k tokens procesados en 7-42 ms por subagente).
- Generación de código y asistencia en IDE: aunque no se detallan benchmarks de código, el modelo puede integrarse en pipelines de CI/CD o asistentes de programación que requieran contexto largo de repositorio y tool calling para ejecutar comandos.
- Procesamiento por lotes de imágenes con texto: la velocidad de prefill (953-1818 tok/s según tipo de entrada) permite procesar lotes de imágenes con descripciones o preguntas asociadas en entornos de investigación.
- Servidor de inferencia local para equipos pequeños: con 196,5 tok/s agregados en 8 peticiones simultáneas, puede servir como backend para herramientas internas de una startup o grupo de investigación sin depender de la nube.
- Experimentación con modelos MoE multimodales: útil para investigadores que quieran estudiar el comportamiento de un MoE de ~27B en tareas de visión-lenguaje con recursos limitados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (RTX 3080 Ti 12 GB, Windows 11):

| Modo | Modelo | Contexto | Slots | KV global/SWA | Decode primer/seguimiento (tok/s) | Top-1 |
|---|---|---:|---:|---|---:|---:|
| Standard | 9.3-tuned | 128k | 8 | q4_0/q4_0 | 83,6 / 73,9 | 92,8% |
| Fast | 9.3-tuned | 64k | 8 | q4_0/q4_0 | 83,7 / 73,9 | 92,8% |
| Long | long | 256k | 4 | q3_0/q4_0 | 81,6 / 70,2 | 92,0% |

Calidad (KLD medio frente a referencia Unsloth UD-Q8_K_XL, 80 x 512 tokens, KV f16):

| Modelo | Tamano | KLD medio | Top-1 |
|---|---:|---:|---:|
| fast-9.3-tuned | 9,24 GB | 0,0391 | 93,1% |
| fast-long | 8,95 GB | 0,0438 | 92,3% |
| misma receta, llama-quantize estándar | 9,24 GB | 0,0491 | no disponible |

Rendimiento en 8 peticiones simultáneas (benchmark HTTP end-to-end, 256 tokens cada una): 26,7 tok/s por petición, 196,5 tok/s total. Primer token en seguimiento: 131 ms (historial corto) a 219 ms (historial de 42k tokens).

Comparativa con la versión original (UD-Q4_K_M, llama.cpp estándar) en la primera release (64k contexto, un chat):

| Métrica | Original | inkling-fast |
|---|---:|---:|
| Decode, prompt corto | 12,2 tok/s (27,4 ajustado a mano) | 76,7 tok/s |
| Decode tras prompt de 48k | 12,5 tok/s | 56,0 tok/s |
| Prefill de 48k | 199 tok/s | 1632 tok/s |
| VRAM | 10,6 GB (resto en RAM) | 11,9 GB, todo en GPU |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,9 GB para el modelo completo con visión y KV cache en GPU (RTX 3080 Ti 12 GB). El archivo principal pesa 9,24 GB; el proyector de visión 0,35 GB.
- GPU recomendadas: RTX 3080 Ti 12 GB (probada por el autor), RTX 3090, RTX 4080, RTX 4090, A100, H100. Cualquier GPU con ≥12 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3080 Ti/3090/4080/4090 con 12 GB o más. No cabe en GPUs de 8 GB o menos.
- Opciones de despliegue: requiere el motor inkling-fast-llama.cpp (build propio desde el repositorio de GitHub). No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI sin modificaciones.
- Latencia y throughput: decode de 83,6 tok/s (primer token) y 73,9 tok/s (seguimiento) en RTX 3080 Ti; prefill de 953-1818 tok/s según tipo de entrada; 196,5 tok/s agregados en 8 peticiones concurrentes; TTFT de 131-219 ms en seguimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| Inkling-2-Mini-fast (esta ficha) | ~27B (MoE) | 128k-256k | Sí | Apache 2.0 | GGUF + motor propio | Optimizado para 12 GB VRAM |
| thinkingmachines/Inkling-2-Mini (original) | ~27B (MoE) | no disponible | Sí | Apache 2.0 | safetensors | Requiere ~15,5 GB en Q4_K_M; no cabe en 12 GB |
| unsloth/Inkling-2-Mini-GGUF | ~27B (MoE) | no disponible | Sí | Apache 2.0 | GGUF | Cuantizaciones estándar para llama.cpp; rendimiento inferior en 12 GB |

No se dispone de datos de benchmarks estándar para comparar con otros modelos de la misma categoría (p. ej., Mixtral, Qwen-VL) en la información proporcionada.

## Limitaciones y advertencias

- Requiere un motor no estándar (inkling-fast-llama.cpp): los tensores están repaquetados y no cargan en llama.cpp estándar, lo que limita la portabilidad y el soporte de la comunidad.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda evaluar el modelo base para sesgos de género, raza o idioma.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización agresiva (IQ2_XS/IQ3_XXS en expertos) puede incrementar la degradación en tareas de razonamiento complejo (KLD medio de 0,0391 frente a referencia Q8).
- Limitaciones de contexto: el modo Standard soporta 128k tokens, pero el modo Fast se limita a 64k; la variante long alcanza 256k con solo 4 slots concurrentes y KV global en q3_0, lo que puede afectar la calidad en contextos muy largos.
- Idiomas soportados: no disponibles; se desconoce si el modelo base tiene buen rendimiento en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el motor inkling-fast-llama.cpp tiene su propia licencia (no especificada en la información disponible); verificar antes de desplegar en producción.
- Caveat para producción: el rendimiento medido es en Windows 11 con RTX 3080 Ti; el comportamiento en Linux o GPUs de centro de datos no está documentado. La gestión de caché KV compartida y los 8 slots concurrentes requieren ajustes específicos del servidor (`-np 8 -kvu`, `--cache-ram 0`, `--ctx-checkpoints 2`).

## Enlaces

- Hugging Face: https://huggingface.co/nahcmon/Inkling-2-Mini-fast-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de referencia (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor inkling-fast-llama.cpp: https://github.com/nahcmon/inkling-fast-llama.cpp
