# fraQtl/Gemma-4-26B-A4B-it-Hi-Fi-GGUF

## Resumen
Gemma-4-26B-A4B-it-Hi-Fi-GGUF es una cuantización GGUF en Q4_K_M del modelo google/gemma-4-26B-A4B-it, un transformer de arquitectura mixture-of-experts (MoE) con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token. El artefacto lo publica el usuario fraQtl bajo licencia Apache 2.0 para los pesos cuantizados, mientras que los pesos derivados siguen sujetos a los términos de Google Gemma. El repositorio ocupa 17,2 GB y contiene el archivo GGUF de 17.117.713.344 bytes, pensado para inferencia con llama.cpp y llama-cpp-python.

El interés de esta ficha no es el modelo base en sí, sino el método de cuantización: fraQtl aplica una receta de cuantización consciente de calibración y consciente de MoE, con 265 overrides por tensor y una importance matrix de 384.000 tokens de código y matemáticas. El autor publica métricas de fidelidad frente al checkpoint bf16 original (divergencia KL y acuerdo top-1) y las compara con una cuantización Q4_K_M de bartowski. Los resultados muestran mejor KLD y mejor acuerdo top-1, pero peor rendimiento en GSM8K, un dato que el propio autor reconoce y documenta.

Es relevante para desarrolladores que necesitan desplegar un MoE de 26B en entornos con recursos limitados y quieren comparar variantes de cuantización con métricas verificables, no solo con el tamaño del archivo. La ficha se centra en lo que la model card declara; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) transformer, modelo base google/gemma-4-26B-A4B-it |
| Parametros totales | 25.233.142.046 (dato real de safetensors del modelo base); ≈26B declarados |
| Parametros activos | ≈4B por token (declarado en la model card) |
| Longitud de contexto | La del modelo base (no se especifica un valor concreto en la informacion disponible); la calibracion se hizo a ctx 2048 |
| Tipos de cuantizacion | Q4_K_M (este repositorio); el autor no publica otras variantes en la model card |
| Idiomas soportados | Ingles (en); no se declaran otros idiomas |
| Licencia | Apache 2.0 para los artefactos de cuantizacion; los pesos derivados siguen los terminos de Google Gemma |
| Formato de pesos | GGUF (archivo Gemma-4-26B-A4B-it-fraQtl-HiFi-Q4_K_M.gguf) |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE instruction-tuned con 26B parámetros totales y aproximadamente 4B activos por token. La conversión a GGUF se hizo con `convert_hf_to_gguf.py --outtype bf16` desde el checkpoint bf16 fijado, y la cuantización con `llama-quantize` usando 265 overrides `--tensor-type` por tensor, seleccionados mediante un análisis consciente de calibración y de MoE (receta `restore_deep`). El autor no publica cómo se toman esas decisiones por tensor, pero sí publica el hash de la receta, la importance matrix y los hashes de todos los artefactos.

La calibración usa el paquete fraQtl Apex code+math (sha256 `9bec84a28dcb0c940047e6084561a00857fd610b8a1e148cc38e27929e0a7e02`), decontaminado contra las slices de evaluación. La importance matrix se calculó con `llama-imatrix` a ctx 2048 sobre el sustrato GGUF BF16, con un presupuesto de 384.000 tokens (187 chunks), seleccionado tras un barrido de tres presupuestos (128K, 256K y 384K; KLD code/math 0,7391 / 0,7274 / 0,7162 en la receta del barrido). El `imatrix.dat` exacto se incluye en el repositorio. El template de chat incrustado en el GGUF es el template jinja de Gemma fijado (sha256 `36e3a42e5cf14cd0020e72d92e1fdd9970f59b82170e421f0cbe1bb42bead3f0`), parcheado después de la cuantización con los bytes de tensor verificados como idénticos.

No se dispone de información sobre el dataset de entrenamiento original del modelo base, ni sobre si hubo RLHF o DPO, ni sobre innovaciones de decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional en formato chat de Gemma.
- Razonamiento y matemáticas: la model card documenta evaluaciones de chain-of-thought en GSM8K, aunque con rendimiento inferior al comparador.
- Código: la calibración está orientada a código y matemáticas (Apex code+math), lo que indica uso previsto en cargas de trabajo de programación.
- Inferencia con llama.cpp y llama-cpp-python; el autor fija la pila medida (llama.cpp @ `78d2f524682d9fee790a6460c93d018dafeb5229` y `llama-cpp-python==0.3.33`).
- Capacidades de tool calling, function calling, agentes, multi-step reasoning, vision, audio o thinking mode: no disponibles en la información proporcionada.
- Capacidades multilingües: solo se declara inglés.

## Casos de uso
- Inferencia local de un MoE de 26B en 4 bits: el archivo Q4_K_M de 17,1 GB permite ejecutar el modelo en estaciones de trabajo con llama.cpp, reduciendo el espacio frente al checkpoint bf16 original.
- Evaluación de fidelidad de cuantizaciones: investigadores pueden usar las métricas KLD y acuerdo top-1 publicadas, junto con el `imatrix.dat` y los hashes, para reproducir o comparar recetas de cuantización.
- Generación de código en pipelines de desarrollo: la calibración con 384.000 tokens de código y matemáticas está pensada para cargas de trabajo de programación, y el modelo base es instruction-tuned para seguir instrucciones.
- Razonamiento matemático con chain-of-thought: útil para experimentos controlados, aunque el autor advierte que GSM8K 0-shot con n=200 rinde por debajo del comparador (59,5% frente a 68,5%).
- Asistentes conversacionales en inglés: el template de chat de Gemma está incrustado y verificado byte a byte, lo que facilita el despliegue con `create_chat_completion`.
- Comparación de artefactos GGUF: desarrolladores pueden contrastar este Q4_K_M con el de bartowski usando las mismas slices de evaluación y el mismo teacher Q8_0.
- Prototipado con llama-cpp-python: la pila fijada permite reproducir los números publicados sin depender de versiones no verificadas.

## Benchmarks y rendimiento
Las métricas publicadas comparan este artefacto con la cuantización Q4_K_M de bartowski, ambas frente al modelo bf16 original como referencia.

| Metrica (vs bf16 original) | fraQtl Hi-Fi | bartowski Q4_K_M | Delta |
|---|---:|---:|---|
| KLD code/math (menor mejor, 3-run, drift 0,0) | 0,5433 | 0,5984 | −9,2% |
| KLD general (menor mejor, 3-run, drift 0,0) | 0,8484 | 0,9351 | −9,3% |
| Acuerdo top-1 code/math (mayor mejor) | 0,803 | 0,791 | n/a |
| Acuerdo top-1 general (mayor mejor) | 0,694 | 0,682 | n/a |
| GSM8K 0-shot CoT instruido, n=200 (mayor mejor) | 59,5% (119/200) | 68,5% (137/200) | −9,0 pp |
| Tamano de archivo | 17.117.713.344 B | 17.035.038.112 B | +0,49% |

La métrica de fidelidad es la divergencia KL simétrica top-20 sobre el soporte del teacher Q8, media sobre posiciones; el teacher es una cuantización Q8_0 del checkpoint bf16 original. El autor señala explícitamente que, en este modelo, la diferencia de KLD no se trasladó a GSM8K. No se publican resultados de MMLU, HumanEval u otros benchmarks.

## Requisitos de hardware
- VRAM estimada: el archivo GGUF ocupa 17,1 GB; con contexto adicional y overhead de llama.cpp se necesita margen por encima de esa cifra. No se publica una estimación oficial de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada.
- Consumer GPU: no se confirma compatibilidad con GPU de consumo; el tamaño de 17,1 GB queda por encima de la VRAM de muchas GPU consumer de 16 GB, por lo que no se puede afirmar que cabe sin particionado o uso de memoria del sistema.
- Opciones de despliegue: llama.cpp (fijado a `78d2f524682d9fee790a6460c93d018dafeb5229`) y llama-cpp-python (fijado a `0.3.33`). No se mencionan vLLM, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; el autor no publica medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fraQtl Gemma-4-26B-A4B-it Hi-Fi Q4_K_M | 25,23B totales, ≈4B activos | el del base (no especificado) | KLD 0,5433/0,8484; top-1 0,803/0,694; GSM8K 59,5% | Apache 2.0 (artefacto); Gemma (pesos) | Hugging Face, GGUF |
| bartowski Gemma-4-26B-A4B Q4_K_M | mismo modelo base | el del base | KLD 0,5984/0,9351; top-1 0,791/0,682; GSM8K 68,5% | Apache 2.0 / Gemma | Hugging Face, GGUF |
| google/gemma-4-26B-A4B-it (bf16) | 25,23B totales, ≈4B activos | el del base | referencia de fidelidad (teacher Q8_0) | Gemma | Hugging Face, safetensors |
| fraQtl Gemma-4-E2B-it-Hi-Fi-GGUF | no disponible | no disponible | no disponible | Apache 2.0 / Gemma | Hugging Face, GGUF |

## Limitaciones y advertencias
- El rendimiento en GSM8K es inferior al comparador (59,5% frente a 68,5%, −9,0 pp), pese a la mejor KLD; el autor lo documenta como caveat para cargas de matemáticas con chain-of-thought.
- La model card declara únicamente inglés; no se garantiza calidad en otros idiomas.
- La longitud de contexto concreta del modelo base no se especifica en la información disponible; la calibración se hizo a ctx 2048, no al máximo del modelo.
- Riesgo de alucinación: no se publican evaluaciones específicas; al ser una cuantización de un modelo generativo, el riesgo del base se mantiene.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia: los artefactos de cuantización son Apache 2.0, pero los pesos derivados siguen los términos de Google Gemma; el uso comercial debe revisar ambos.
- El método de decisión por tensor no está publicado; solo lo están los hashes y la importance matrix, lo que limita la reproducibilidad completa de la receta.
- Los números publicados se midieron con una pila fijada de llama.cpp y llama-cpp-python; versiones más nuevas deberían funcionar, pero no están verificadas contra estas métricas.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/fraQtl/Gemma-4-26B-A4B-it-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo companion on-device: https://huggingface.co/fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF
- Kit KV-cache Qwen3-4B: https://huggingface.co/fraQtl/qwen3-4b-instruct-2507-kv-sidecars
- Kit KV-cache Mistral-7B: https://huggingface.co/fraQtl/mistral-7b-instruct-v0.3-kv-sidecars
- Todos los artefactos fraQtl: https://huggingface.co/fraQtl
