# millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism

## Resumen

`millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism` es un checkpoint de investigación que combina dos elementos heterogéneos en un único archivo GGUF: los pesos del modelo de lenguaje Qwen3.5-4B (cuantizados en UD-IQ2_M por Unsloth) y el circuito RV32 con extensión vectorial del proyecto QwenPU. El objetivo no es ofrecer un modelo conversacional listo para producción, sino servir como artefacto de validación reproducible para el runtime Prism b12128 sobre Windows, ejecutando un modelo invitado (stories260K de Karpathy) dentro del bloque MTP del modelo anfitrión.

El autor, millrace-ai, construye este checkpoint a partir del GGUF base de Unsloth y añade 18 tensores adicionales correspondientes al circuito QwenPU, además de rellenar con ceros las FFN del modelo de lenguaje de 9.216 a 36.352 filas para igualar el ancho compartido. Todos los extents originales de los 426 tensores empaquetados se preservan byte a byte, de modo que las capacidades de Qwen3.5-4B permanecen intactas siempre que el runtime separe correctamente ambas partes.

El interés actual del checkpoint es metodológico: documenta con evidencia (fixtures, trazas, hashes) cómo embeber un circuito de máquina virtual dentro de un transformer y validar su ejecución bit a bit contra una referencia de CPU. La validación completa de tres tokens de historia está pendiente; el run verificado alcanza el retirement 2.578 sin llegar a emitir texto de historia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) + circuito RV32 con extensión vectorial embebido en el bloque MTP |
| Parametros totales | 11.840.714.242 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ2_M (Unsloth Dynamic IQ2_M) para los pesos de lenguaje; PQ2_0 para el embedding del circuito |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos de lenguaje); MIT (circuito QwenPU) |
| Formato de pesos | GGUF (archivo único `Qwen3.5-4B-UD-IQ2_M-QwenPU-Stock-Prism.gguf`, 5.121.315.968 bytes) |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento nuevo. Los pesos de lenguaje provienen de Qwen3.5-4B de Alibaba Cloud, cuantizados por Unsloth en formato UD-IQ2_M (una variante dinámica de IQ2_M que preserva mayor precisión en tensores sensibles). Sobre esa base, el exportador de millrace-ai añade 18 tensores del circuito QwenPU: una CPU RV32 con extensión vectorial, su memoria y un embedding PQ2_0, todo empaquetado junto a los pesos del LLM y ejecutado por el bloque MTP del modelo anfitrión a través de las APIs de feedback y caché de Prism b12128.

La innovación técnica es la cohabitación de dos máquinas de cómputo en un mismo GGUF: el transformer procesa tokens y, en paralelo, el circuito RV32 ejecuta un modelo invitado (stories260K). El launcher carga ambos, reenvía las acciones seleccionadas por el circuito y las peticiones de caché, y verifica hashes de GGUF, ELF, probe y DLLs antes de detenerse en el retirement 2.578. Las FFN del lenguaje se rellenan con ceros de 9.216 a 36.352 filas para acomodar el ancho compartido; los 426 extents originales se conservan byte a byte.

## Capacidades

- Generación de texto conversacional heredada de Qwen3.5-4B (condicionada a que el runtime separe correctamente los pesos de lenguaje del circuito).
- Ejecución de un modelo invitado (stories260K) dentro del circuito RV32 embebido, con decodificación gestionada por el bloque MTP.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales: validación bit a bit de logits, KV y estado recurrente contra referencia de CPU; trazas físicas de caché y receipts de verificación independiente.

## Casos de uso

- Investigación en co-diseño hardware-software: el checkpoint permite reproducir la ejecución de un circuito RV32 dentro de un transformer y comparar trazas contra una referencia de CPU, útil para quienes estudian arquitecturas híbridas.
- Validación de runtimes de inferencia: sirve como fixture de regresión para Prism b12128 y para cualquier port que implemente las APIs de feedback y caché del bloque MTP.
- Docencia de arquitecturas de computadores: el par invitado/anfitrión ilustra cómo se ejecuta un programa RISC-V paso a paso dentro de un modelo de lenguaje, con evidencia de retirements y escrituras ordenadas.
- Reproducibilidad de cuantizaciones: los hashes y receipts permiten auditar que una cuantización UD-IQ2_M preserva el comportamiento del modelo original en serial y batched hasta 64 tokens.
- Benchmarking de memoria en GPU consumer: el run documentado en GTX 1080 (5,73 GiB VRAM dedicada, 158,2 decodes/s) sirve para calibrar expectativas de despliegue en hardware modesto.
- Estudio de empaquetado multi-tensor en GGUF: el archivo demuestra cómo convivir tipos mixtos (IQ2_M, PQ2_0, F16) en un solo contenedor y qué implica para los parsers.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Control solo-padding vs UD-IQ2_M original | Coincidencia bit a bit en logits, KV y estado recurrente hasta 64 tokens (serial y batched) |
| Fixtures escalares y vectoriales | 316 retirements y 307 escrituras ordenadas coincidentes con referencia de CPU |
| Prefijo stories260K original | 2.578 retirements y 2.760 escrituras ordenadas exactas |
| Ventana de historia emparejada | 82.090 decodes en 518,78 s (158,2 decodes/s) |
| VRAM pico durante captura | 5,73 GiB dedicada, 84 MiB compartida, 7,29 GiB total dispositivo |
| RAM pico del proceso | 5,72 GiB working set |
| Contexto invitado | 55.720 celdas vivas en 65.536 celdas F16 |
| Tiempo estimado de run completo en GTX 1080 | ~9 h 39 min antes de verificación offline |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~5,7 GiB de VRAM dedicada en el run documentado con cuantización IQ2_M y circuito embebido; el archivo GGUF ocupa 5,1 GB en disco.
- GPU validadas: GTX 1080 (Pascal, 8 GB) con CUDA 12.4 en Windows; no se documentan pruebas en otras GPU.
- Cabe en GPU consumer: sí, al menos en GTX 1080; se espera que quepa en cualquier GPU con 8 GB o más, aunque no hay validación publicada.
- Despliegue: exclusivamente Prism b12128 (fork de llama.cpp de Prism ML) en Windows con CUDA 12.4; requiere las APIs de MTP, feedback y caché de esa build concreta.
- Throughput documentado: 158,2 decodes/s en la ventana de historia emparejada sobre GTX 1080.
- Latencia de extremo a extremo: no disponible; el run completo se estima en ~9 h 39 min.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwenpu-qwen35-4b-iq2-m-stock-prism | 11,84 B (según safetensors del base) | no disponible | GGUF único con pesos + circuito | Apache-2.0 + MIT | Investigación: LLM + CPU RV32 embebida |
| Qwen/Qwen3.5-4B | 4 B (nominal) | no disponible | safetensors | Apache-2.0 | LLM conversacional estándar |
| unsloth/Qwen3.5-4B-GGUF | 4 B (nominal) | no disponible | GGUF (múltiples cuantizaciones) | Apache-2.0 | LLM cuantizado para inferencia local |
| millrace-ai/qwenpu-bonsai-4b-stock-prism | no disponible | no disponible | GGUF con circuito | no disponible | Checkpoint hermano, donante del circuito |

La comparación relevante es con el GGUF base de Unsloth: este checkpoint añade el circuito y el padding, pero conserva los pesos de lenguaje. Frente a Qwen3.5-4B original, la diferencia es de empaquetado y runtime, no de capacidad del modelo.

## Limitaciones y advertencias

- Validación incompleta: la historia completa de tres tokens no está verificada; el run se detiene en el retirement 2.578 antes de que el invitado emita texto.
- Acoplamiento fuerte al runtime: solo funciona con Prism b12128 en Windows con CUDA 12.4; portarlo exige soporte para tipos de tensor mixtos (incluido PQ2_0) y las APIs de feedback y caché del MTP.
- No es un modelo de producción: es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay garantías de estabilidad ni soporte.
- Idiomas y contexto no documentados: no se especifican capacidades multilingües ni longitud de contexto efectiva tras el empaquetado.
- Riesgo de alucinación: heredado de Qwen3.5-4B; no evaluado en este checkpoint.
- Sesgos: no documentados en la información disponible.
- Licencia: los pesos de lenguaje son Apache-2.0 y el circuito MIT; el uso comercial debe respetar ambas, y el circuito QwenPU está atribuido a Divyansh Agrawal.
- Reproducibilidad dependiente de hashes: el launcher verifica GGUF, ELF, probe y DLLs; cualquier alteración del entorno invalida el receipt.
- Tamaño real de parámetros confuso: el campo safetensors indica 11,84 B mientras el nombre sugiere 4 B; conviene tratarlo como dato del modelo base y no como recuento efectivo del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Base fijada UD-IQ2_M: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/blob/e87f176479d0855a907a41277aca2f8ee7a09523/Qwen3.5-4B-UD-IQ2_M.gguf
- Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto QwenPU: https://github.com/divagr18/QwenPU/tree/6e2767aaa59b69ea03300c0a5199d7b36debbe50
- Prism llama.cpp: https://github.com/PrismML-Eng/llama.cpp/tree/d7b28968306207fd176e7ff10796ccb6be607865
- stories260K (Karpathy): https://huggingface.co/karpathy/tinyllamas/tree/0bd21da7698eaf29a0d7de3992de8a46ef624add/stories260K
- Checkpoint hermano Bonsai 4B: https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism
- Investigación del proyecto: https://github.com/tim-osterhus/qwenpu-bonsai
- Runtime Prism b12128 (Windows CUDA 12.4): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- Runtime CUDA: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
