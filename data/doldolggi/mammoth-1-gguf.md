# doldolggi/mammoth-1-GGUF

## Resumen

mammoth-1 es un modelo de decisión de 27B parámetros desarrollado por Base Labs, obtenido mediante post-entrenamiento a partir de Qwen3.5-27B. No es un modelo conversacional: dada una variable de estado (`state`) y un conjunto de preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta. Esta ficha cubre la versión GGUF publicada por el usuario doldolggi, que contiene cuantizaciones estándar (Q8_0, Q6_K y Q4_K_M) del modelo base.

La relevancia de esta publicación es doble. Por un lado, ofrece una vía para ejecutar un modelo de 27B en hardware de consumo AMD (probado en Radeon 8060S / gfx1151 con Vulkan y ROCm 10.1). Por otro, documenta con detalle un aspecto crítico: el modelo fue entrenado con una máscara de atención bidireccional por bloques en sus capas de atención completa y se lee desde los logits de la cabeza LM de las letras de opción, por lo que un servidor llama.cpp estándar en modo causal produce respuestas incorrectas.

El autor de la cuantización advierte explícitamente de que no se trata de una release oficial de Base Labs ni de Baseten, y de que los ficheros requieren el fork ROCmFPX de llama.cpp con la herramienta `llama-decide` para aplicar la máscara correcta. La licencia es MIT, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-27B), atención bidireccional por bloques en capas de atención completa |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | no disponible (el conjunto de prueba incluye inglés y coreano) |
| Licencia | MIT |
| Formato de pesos | GGUF (tensores Q8_0, Q6_K y Q4_K_M estándar) |
| Modelo base | baselabs/mammoth-1 |
| Tamaño del repositorio | 67,2 GB |
| Tamaño de ficheros | Q8_0: 28,6 GB; Q6_K: 22,1 GB; Q4_K_M: 16,5 GB |
| Backends probados | Vulkan y HIP/ROCm 10.1 (Windows 11, Radeon 8060S / gfx1151) |
| Backends no probados | CUDA y CPU |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-27B y se post-entrena como modelo de decisión. La innovación clave es la máscara de atención: las capas de atención completa emplean una máscara bidireccional por bloques, y la lectura se realiza desde los logits de la cabeza LM correspondientes a las letras de opción (`slot_lm`). Los ficheros GGUF llevan embebidos los ajustes de decisión (`qwen35.decision.type = baselabs-qev`, `qwen35.decision.attention = block_bidirectional`, 256 etiquetas de respuesta), escritos por el conversor del fork ROCmFPX.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta el uso de decodificación especulativa u otras optimizaciones de inferencia. Las cuantizaciones se generaron sin matriz de importancia (importance matrix).

## Capacidades

- Clasificación y decisión sobre un `state` textual: devuelve una probabilidad por cada opción de cada pregunta formulada.
- Tres tipos de pregunta soportados: `noul` (sí/no o probabilidad binaria), `choice` (selección entre criterios con etiqueta) y `score` (puntuación graduada sobre una escala de criterios ordenados).
- Salida probabilística calibrada, apta para umbrales y agregación downstream.
- Procesamiento de múltiples preguntas en una sola petición (el ejemplo de la model card usa tres preguntas por request).
- Capacidad multilingüe parcial: el conjunto de prueba incluye inglés y coreano, aunque no se documenta la cobertura completa de idiomas.
- No es un modelo de chat: no genera texto libre ni mantiene conversaciones multi-turno.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una reclamación, preguntas de tipo `choice` permiten asignar el equipo responsable (facturación, técnico, fraude) con una probabilidad asociada, integrable en un sistema de triaje.
- Detección de intención de reembolso: una pregunta `noul` sobre el estado del cliente devuelve la probabilidad de que solicite un reembolso, útil para activar flujos automáticos con umbral configurable.
- Priorización por urgencia: preguntas `score` con criterios ordenados permiten estimar el grado de urgencia de una incidencia y ordenar la cola de atención.
- Monitorización de robótica o agentes: el ejemplo de la model card evalúa éxito, modo de fallo (por ejemplo, `grasp_slip`) y progreso en una escala de 0 a 3, lo que encaja en bucles de control que necesitan señales probabilísticas.
- Moderación y clasificación de contenido: el formato de preguntas tipadas permite construir clasificadores multicriterio sin entrenar modelos ad hoc.
- Evaluación de estados en pipelines de decisión: al devolver distribuciones calibradas, el modelo sirve como componente de un sistema mayor que combine varias señales probabilísticas.
- Despliegue en estaciones de trabajo AMD: con la cuantización Q8_0 y el backend HIP, cabe en una GPU integrada con 27,6 GB de memoria, lo que habilita prototipos locales sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una comparación de acuerdo con la referencia PyTorch en BF16 sobre un conjunto de 8 peticiones y 22 preguntas (inglés y coreano):

| Fichero | Tamaño | Backend | Respuesta top cambiada | Media max\|dp\| | Peor max\|dp\| | Preguntas > 0,01 |
|---|---:|---|---:|---:|---:|---:|
| Q8_0 | 28,6 GB | Vulkan | 0 / 22 | 0,0018 | 0,0106 | 1 |
| Q8_0 | 28,6 GB | HIP | 0 / 22 | 0,0022 | 0,0147 | 2 |
| Q6_K | 22,1 GB | Vulkan | 0 / 22 | 0,0043 | 0,0166 | 4 |
| Q6_K | 22,1 GB | HIP | 0 / 22 | 0,0041 | 0,0227 | 3 |
| Q4_K_M | 16,5 GB | Vulkan | 0 / 22 | 0,0105 | 0,0495 | 8 |
| Q4_K_M | 16,5 GB | HIP | 0 / 22 | 0,0111 | 0,0390 | 9 |

El ruido entre backends para el mismo fichero Q8_0 es de 0,0031 de media y 0,0128 en el peor caso, comparable a la desviación de Q8_0 frente a BF16. Q4_K_M se sitúa claramente por encima de ese suelo (media ~0,011), con desplazamientos de hasta 0,04-0,05 en preguntas graduadas.

Latencia de una petición con tres preguntas (240-370 tokens), servidor en caliente, en Ryzen AI Max+ / Radeon 8060S:

| Backend | Memoria | Carga | Latencia (mediana / mínima) |
|---|---:|---:|---|
| PyTorch BF16 (ROCm 10.1) | 52,6 GB | 86 s | ~1500 / 1090 ms |
| llama-decide Q8_0, Vulkan | 28,7 GB | 13 s | 1294 / 840 ms |
| llama-decide Q8_0, HIP | 27,6 GB | 13 s | 1193 / 869 ms |

Q6_K y Q4_K_M no resultaron más rápidos que Q8_0 en esta GPU (medianas de 1588/1593 ms y 1377/1196 ms según backend). Las mediciones se tomaron con el servidor de referencia PyTorch cargado en la misma GPU, por lo que deben considerarse aproximadas.

## Requisitos de hardware

- VRAM estimada: 28,7 GB (Q8_0, Vulkan), 27,6 GB (Q8_0, HIP), 21,5 GB (Q6_K, HIP), 16,3 GB (Q4_K_M, HIP).
- Referencia BF16 en PyTorch: 52,6 GB de memoria.
- GPU probadas: Radeon 8060S (gfx1151) en Ryzen AI Max+ con Windows 11.
- CUDA y CPU no fueron probados por el autor de la cuantización.
- Encaje en GPU de consumo: Q4_K_M (16,5 GB) y Q6_K (22,1 GB) podrían caber en GPUs con 24 GB de VRAM, pero no hay validación publicada en esas plataformas; Q8_0 requiere al menos 28 GB.
- Despliegue: requiere el fork ROCmFPX de llama.cpp (commit probado 254c319ab34628decf8599b798b7daec30f7b590), compilado con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`, y la herramienta `llama-decide`. El parche `llama-decide-serve.patch` añade modo residente con `--serve`, y `serve_gguf.py` lo expone vía HTTP en `/v1/systemone`.
- No es compatible con llama-server, LM Studio, Ollama ni vLLM en su configuración estándar, porque no aplican la máscara bidireccional.
- Latencia observada: mediana de 1193-1294 ms por petición de tres preguntas en la GPU integrada citada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mammoth-1 (esta ficha, GGUF) | ~26,9B | no disponible | Modelo de decisión probabilístico | MIT | Hugging Face (cuantización no oficial) |
| baselabs/mammoth-1 (BF16) | ~26,9B | no disponible | Modelo de decisión probabilístico | MIT | Hugging Face (oficial) |
| Qwen3.5-27B | ~27B | no disponible | LLM conversacional | no disponible en esta información | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos de decisión comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo con un prompt conversacional en un servidor causal estándar produce respuestas incorrectas.
- Requiere una herramienta específica (`llama-decide` del fork ROCmFPX) que aplique la máscara bidireccional por bloques; sin ella, la inferencia es inválida.
- Solo se han probado los backends Vulkan y HIP/ROCm 10.1 en Windows 11 sobre gfx1151; CUDA y CPU no están validados.
- La cuantización Q4_K_M altera las probabilidades en preguntas graduadas hasta 0,04-0,05; para aplicaciones sensibles a la calibración se recomienda Q8_0.
- No se usó matriz de importancia en la cuantización.
- El conjunto de evaluación es muy reducido (8 peticiones, 22 preguntas) y las mediciones de latencia se tomaron con carga concurrente en la GPU.
- No hay información sobre sesgos, tasas de alucinación ni cobertura lingüística completa; el único dato multilingüe es la presencia de inglés y coreano en las pruebas.
- La licencia MIT permite uso comercial, pero la publicación es una cuantización no oficial: conviene verificar la licencia y condiciones del modelo base antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Cuantización GGUF: https://huggingface.co/doldolggi/mammoth-1-GGUF
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Fork llama.cpp con soporte de decisión: https://github.com/HarshaVardhan3002/ROCmFPX
