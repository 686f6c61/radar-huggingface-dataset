# Atlas3D/JEV-27B-VL-GGUF

## Resumen

Atlas3D/JEV-27B-VL-GGUF es la compilación en formato GGUF del modelo multimodal autotrust/JEV-27B-VL, un modelo de decisión de 26.895.998.464 parámetros (~26,9 B) desarrollado por AutoTrust AI Lab y convertido por Atlas3D para su uso con llama.cpp. El modelo original parte de un backbone Qwen/Qwen3.8-27B congelado al que se le añade una cabeza de decisión entrenada específicamente, de modo que puede responder preguntas estructuradas en un único forward pass con una probabilidad calibrada por opción, además de conservar la ruta de generación libre con razonamiento paso a paso.

La relevancia de esta conversión concreta es doble. Por un lado, expone el modelo a través de un endpoint nativo de decisión (`/v1/systemone`) en llama.cpp, con la lectura propia de JEV: `false`/`true` para preguntas de sí/no, dígitos 0–5 para puntuaciones y letras para preguntas de elección, incorporando el sesgo de la cabeza de decisión y las temperaturas calibradas del modelo original. Por otro, ofrece builds compatibles con GPUs antiguas como la V100 (sm_70), que no pueden ejecutar checkpoints en FP8 o FP4, algo relevante para despliegues autoalojados sobre hardware ya amortizado.

La cuantización recomendada por el autor es Q8_0 (29 GB), que mantiene un 99,0 % de coincidencia en la opción elegida frente a la referencia bf16 sobre 309 decisiones registradas. La cuantización Q4_K_M (17 GB) baja hasta el 92,9 % de coincidencia, por lo que el autor la reserva para tarjetas de 24 GB asumiendo pérdida de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen/Qwen3.8-27B congelado) con cabeza de decisión añadida y proyector de visión independiente |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible (los ejemplos de servido de la model card usan `--ctx-size 4096`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M; proyector de visión en BF16 y Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos); el parche de llama.cpp es MIT |
| Formato de pesos | GGUF (llama.cpp), con ficheros `mmproj` separados para visión |
| Tamano del repositorio | 100,5 GB |
| Pipeline | image-text-to-text |
| Modelo base | autotrust/JEV-27B-VL (relación: quantized) |
| Fecha de publicacion (repo) | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer denso construido sobre un backbone Qwen/Qwen3.8-27B que permanece congelado, al que se le incorpora una cabeza de decisión entrenada de forma específica. Según los materiales de AutoTrust, ese entrenamiento de la cabeza de decisión se completó en aproximadamente 9,2 horas sobre una única NVIDIA B200, añadiendo decisiones rápidas y calibradas de estilo «System 1» mientras se preserva la ruta de generación «System 2» del modelo base. La variante VL incorpora además un proyector de visión que permite alimentar imágenes junto con texto y responder en un único forward pass con probabilidad calibrada por opción, o bien razonar paso a paso mirando las imágenes cuando la pregunta lo requiere.

La conversión a GGUF introduce una innovación de integración más que de arquitectura: el tipo de decisión `jev` no existe todavía en llama.cpp upstream, por lo que el autor publica el parche `llama.cpp-jev.patch` (generado contra el commit `bed0a85`), que añade la clase de conversor, las claves de metadatos GGUF y la lógica de lectura en el servidor. El endpoint expone tipos de pregunta `choice` (y, por extensión, los formatos de sí/no y puntuación 0–5 descritos), con criterios definidos en la propia petición. Los detalles sobre composición exacta del dataset de entrenamiento, número de tokens y uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Decisión estructurada en un único forward pass: salida booleana (`false`/`true`) para preguntas de sí/no, dígitos 0–5 para puntuaciones y letras para preguntas de elección.
- Probabilidades calibradas por opción, con sesgo de cabeza de decisión y temperaturas calibradas incluidas en los metadatos GGUF.
- Generación de texto y razonamiento paso a paso, heredados del backbone Qwen3.8-27B mediante la ruta «System 2».
- Procesamiento de imagen y texto (pipeline image-text-to-text) a través del proyector `mmproj`.
- Razonamiento multimodal: el modelo puede mirar las imágenes mientras elabora la respuesta paso a paso.
- Servido mediante endpoint nativo de decisión en llama.cpp (`/v1/systemone`), con entrada `state` y un diccionario de `questions`.
- Compatibilidad con GPUs antiguas (V100, sm_70) mediante builds compilados con CUDA 12.x.
- Soporte de tool calling, function calling y comportamiento de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutado y puertas de decisión en agentes autoalojados: el endpoint `/v1/systemone` permite resolver preguntas binarias de sí/no (por ejemplo, «¿debe escalarse esta tarea a un humano?») con una única pasada y probabilidad calibrada, reduciendo coste frente a generar texto completo en cada paso del bucle del agente.
- Moderación y puntuación de contenido con escala 0–5: la salida numérica calibrada permite convertir la decisión en un umbral configurable en lugar de parsear texto libre, lo que simplifica la integración en pipelines de moderación existentes.
- Selección entre alternativas en flujos de trabajo: el tipo de pregunta `choice` devuelve letras para opciones definidas en `criteria`, adecuado para seleccionar herramienta, plantilla o rama de ejecución en un orquestador de agentes.
- Verificación visual de documentos o interfaces: al ser un modelo image-text-to-text con proyector de visión, puede recibir una captura de pantalla o un escaneo y emitir una decisión estructurada, por ejemplo validar si un formulario está completo o si una UI muestra el estado esperado.
- Despliegue sobre hardware heredado: las builds compiladas para sm_70 permiten ejecutar el modelo en V100, GPUs que quedan excluidas de los checkpoints FP8/FP4, útil en clústeres on-premise con parques de GPU ya amortizados.
- Decisión de alta frecuencia con requisitos de latencia ajustados: el autor mide aproximadamente 80 ms por decisión con Q8_0 en una RTX PRO 6000 Blackwell en modo secuencial y sin caché de prompt, un régimen adecuado para decisiones repetitivas dentro de un bucle de agente.
- Inferencia con soberanía de datos: al ser Apache-2.0 y ejecutable con llama.cpp en local, encaja en escenarios donde las decisiones no pueden salir a una API externa.
- Referencia de calibración interna: la build BF16 puede usarse como referencia para validar que las versiones cuantizadas (Q8_0 o Q4_K_M) no alteran las decisiones críticas antes de promoverlas a producción.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden a un test acotado de la cabeza de decisión: coincidencia de la opción elegida frente a la referencia bf16 de `autotrust/JEV-27B-VL` servida con vLLM (`serve_decide.py`), sobre 309 decisiones registradas.

| Fichero | Tamano | Coincidencia con bf16 (309 decisiones) | Mayor cambio de probabilidad | VRAM en uso (4k contexto) |
|---|---|---|---|---|
| `JEV-27B-VL-BF16.gguf` | 54 GB | 99,4 % (307/309), llama.cpp vs vLLM a precisión completa | 0,017 | 56,6 GB |
| `JEV-27B-VL-Q8_0.gguf` (recomendado) | 29 GB | 99,0 % (306/309) | 0,023 | 33,6 GB |
| `JEV-27B-VL-Q4_K_M.gguf` | 17 GB | 92,9 % (287/309) | 0,102 | 22,7 GB |
| `mmproj-BF16.gguf` / `mmproj-Q8_0.gguf` | 0,9 / 0,6 GB | Proyector de visión | No aplica | No disponible |

Latencia medida por el autor: aproximadamente 80 ms por decisión con Q8_0 en una RTX PRO 6000 Blackwell, en modo secuencial y con caché de prompt desactivada. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible, y la generación de texto libre no fue evaluada de forma separada. Tampoco se han medido resultados sobre hardware V100 real.

## Requisitos de hardware

- VRAM estimada en inferencia (4k de contexto, dato del autor): 56,6 GB en BF16, 33,6 GB en Q8_0 y 22,7 GB en Q4_K_M. A esas cifras hay que sumar el proyector de visión (0,6–0,9 GB).
- GPU recomendadas por rango: para BF16, GPUs de 80 GB (A100, H100) o la RTX PRO 6000 Blackwell usada en las mediciones; para Q8_0, tarjetas de 40–48 GB (A100 40 GB, L40S, A6000); para Q4_K_M, tarjetas de 24 GB.
- Cabe en GPU de consumo: Q4_K_M (22,7 GB de VRAM en el test) apunta a la clase de 24 GB, como la RTX 4090 o la RTX 3090. El autor advierte explícitamente que Q4_K_M es menos preciso (aproximadamente 1 de cada 14 decisiones difiere de precisión completa).
- Hardware heredado: hay builds para V100 (sm_70) que compilan con CUDA 12.x, ya que CUDA 13 eliminó sm_70. Los resultados sobre V100 reales no han sido medidos todavía.
- Opciones de despliegue: `llama-server` de llama.cpp, con `--flash-attn on` y `--jinja` en los ejemplos del autor, requiriendo un llama.cpp parcheado con `llama.cpp-jev.patch` para habilitar el tipo de decisión `jev` y el endpoint `/v1/systemone`. El modelo base también se sirve con vLLM, usado como referencia de precisión completa.
- Latencia y throughput: aproximadamente 80 ms por decisión con Q8_0 en RTX PRO 6000 Blackwell (secuencial, sin caché de prompt). Throughput agregado y latencia en otras GPU: no disponible.

## Comparativa con modelos similares

No hay datos de benchmarks frente a otros modelos de decisión o de propósito general en la información disponible. La única comparación posible con datos publicados es interna, entre las cuantizaciones de esta misma conversión y la referencia bf16 servida con vLLM.

| Modelo / variante | Parametros | Formato | Contexto | Coincidencia con referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JEV-27B-VL-GGUF Q8_0 | ~26,9 B | GGUF | No disponible | 99,0 % (306/309) | Apache-2.0 | HuggingFace (Atlas3D) |
| JEV-27B-VL-GGUF BF16 | ~26,9 B | GGUF | No disponible | 99,4 % (307/309) | Apache-2.0 | HuggingFace (Atlas3D) |
| JEV-27B-VL-GGUF Q4_K_M | ~26,9 B | GGUF | No disponible | 92,9 % (287/309) | Apache-2.0 | HuggingFace (Atlas3D) |
| autotrust/JEV-27B-VL (referencia bf16) | ~26,9 B | Safetensors (servido con vLLM) | No disponible | Referencia | Apache-2.0 | HuggingFace (autotrust) |

Comparativas con alternativas de otros desarrolladores (mismo tamaño o misma tarea de decisión): no disponible.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado: el tipo de decisión `jev` no está en upstream, por lo que sin aplicar `llama.cpp-jev.patch` (contra el commit `bed0a85`) y recompilar, el endpoint `/v1/systemone` no funcionará.
- Q4_K_M degrada la precisión de decisión de forma medible: 92,9 % de coincidencia frente al 99,0 % de Q8_0, con un cambio máximo de probabilidad de 0,102 frente a 0,023. El autor recomienda Q8_0 siempre que quepa en VRAM.
- La validación publicada es estrecha: 309 decisiones registradas sobre la cabeza de decisión. La generación de texto libre no fue evaluada por separado, por lo que no hay garantías cuantificadas sobre esa ruta.
- Riesgo de alucinación en la ruta de generación libre («System 2»): no hay datos de evaluación en la información disponible; conviene tratarla como la de cualquier modelo de ~27 B y validar en el dominio de uso.
- Sesgos conocidos: no disponible. No se documenta composición del dataset ni evaluación de sesgos.
- Idiomas soportados: no disponible, a pesar de que el backbone Qwen suele ser multilingüe. No se debe asumir cobertura multilingüe sin verificación.
- Longitud de contexto: no disponible. Los ejemplos y las mediciones de VRAM se hacen con `--ctx-size 4096`, así que los consumos indicados no cubren contextos largos; ampliar el contexto incrementa la VRAM necesaria.
- Las mediciones de latencia y VRAM provienen de una única GPU (RTX PRO 6000 Blackwell) y de un modo secuencial sin caché de prompt; no son extrapolables directamente a otros aceleradores.
- Compatibilidad con V100 anunciada a nivel de compilación, pero sin resultados medidos sobre hardware V100 real.
- Licencia: Apache-2.0 en los pesos, con el fichero `LICENSE` incluido sin cambios. El parche modifica llama.cpp, que es MIT. El uso comercial está permitido por la licencia, pero conviene conservar los avisos de licencia y atribución del modelo base.
- Caveat de producción: el repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y es una conversión de terceros (Atlas3D) sobre el modelo de AutoTrust; la responsabilidad de validación recae en quien despliega.

## Enlaces

- HuggingFace (esta conversión GGUF): https://huggingface.co/Atlas3D/JEV-27B-VL-GGUF
- Modelo base en HuggingFace: https://huggingface.co/autotrust/JEV-27B-VL
- Blog de AutoTrust sobre JEV-27B (decisiones calibradas y razonamiento): https://huggingface.co/blog/autotrust/autotrustjev-27b-fast-calibrated-decisions-and-ful
- Blog de AutoTrust sobre JEV-27B-VL (versión con visión): https://huggingface.co/blog/autotrust/autotrustjev-27b-vl-a-decision-model-that-learned
- Nota de prensa de AutoTrust AI sobre JEV-27B: https://www.prnewswire.com/news-releases/autotrust-ai-releases-jev-27b-an-open-decision-model-for-self-hosted-ai-agents-302891720.html
- Cobertura secundaria de la nota de prensa: https://www.bastillepost.com/global/article/6201001-autotrust-ai-releases-jev-27b-an-open-decision-model-for-self-hosted-ai-agents
- Cobertura en Yahoo Finance: https://finance.yahoo.com/technology/ai/articles/autotrust-ai-releases-jev-27b-110000899.html
- Repositorio de llama.cpp (requiere el parche `llama.cpp-jev.patch`): no se proporciona URL en la información disponible.
