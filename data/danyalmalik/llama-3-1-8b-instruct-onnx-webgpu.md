# danyalmalik/Llama-3.1-8B-Instruct-ONNX-WebGPU

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversión de `meta-llama/Llama-3.1-8B-Instruct` (tomada de la copia sin gating `unsloth/Llama-3.1-8B-Instruct`) al formato ONNX Runtime GenAI, pensada para ejecutarse en un navegador web sobre el backend WebGPU de ONNX Runtime Web. La publicación corre a cargo del usuario de HuggingFace `danyalmalik` y está orientada a "Quick Inference", un runtime de inferencia en cliente. Además del decoder principal, el repositorio incluye una cabeza draft EAGLE-3 (`yuhuili/EAGLE3-LLaMA3.1-Instruct-8B`, también en ONNX) para decodificación especulativa.

El modelo resuelve un problema muy concreto: llevar un LLM de 8 000 millones de parámetros a inferencia local dentro del navegador, sin servidor y sin backend Python, aprovechando WebGPU. Para que quepa en memoria de GPU de consumo, las capas lineales se han cuantizado a 4 bits (redondeo al más cercano, bloque de 32) mientras que embeddings, activaciones y caché KV se mantienen en float16; el repositorio ocupa 5,9 GB.

Es relevante por su enfoque técnico (exportador propio, layout GenAI, taps intermedios para EAGLE-3 y decodificación especulativa verificada en el cliente), pero conviene tratarlo como un artefacto experimental: 0 descargas, 0 likes, sin pipeline declarado y con fecha de creación posterior a la última revisión de los pesos base. La licencia es la Llama 3.1 Community License y los ficheros son modificados, por lo que las salidas no son idénticas a las del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1): 32 capas, atención con GQA, RoPE, MLP SwiGLU; exportado al layout de ONNX Runtime GenAI (`input_ids`, `attention_mask`, `past_key_values.*` → `logits`, `present.*`) |
| Parametros totales | 8 030 millones (modelo base Llama-3.1-8B-Instruct) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; la longitud máxima efectiva del export ONNX no se documenta en la ficha |
| Tipos de cuantizacion | Capas lineales y capa de salida en 4 bits (round-to-nearest, block size 32); embeddings, activaciones y cache KV en float16; cabeza draft EAGLE-3 también en 4 bits con cache KV estatica |
| Idiomas soportados | no disponible en la ficha del repositorio (el modelo base se distribuye oficialmente para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | `llama3.1` (Llama 3.1 Community License); la cabeza draft se rige por sus propios terminos en `draft/LICENSE` |
| Formato de pesos | ONNX (ONNX Runtime GenAI); no se publican safetensors ni GGUF |
| Tamano del repositorio | 5,9 GB |
| Componentes | Decoder principal + `draft/` (cabeza especulativa EAGLE-3) + `LICENSE`, `NOTICE`, `USE_POLICY.md`, `draft/LICENSE` |
| Salidas adicionales | `eagle_taps`: residual stream a la entrada de tres capas (2, N/2 y N-3, concatenadas) para la cabeza draft |
| Fecha de publicacion | 2026-10-25 (creado), 2026-10-25 (actualizado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo: el repositorio es una conversión de pesos. El decoder mantiene la arquitectura Llama 3.1 de 8B (32 capas, atención con grouped-query attention, RoPE y SwiGLU), pero reescrita en el grafo ONNX que espera ONNX Runtime GenAI: entradas `input_ids`, `attention_mask` y `past_key_values.*`, salidas `logits` y `present.*`. La conversión la realiza el exportador propio de Quick Inference partiendo de `unsloth/Llama-3.1-8B-Instruct`. El rotary embedding se aplica dentro del nodo `GroupQueryAttention`, un detalle de implementación que evita materializar las frecuencias RoPE fuera del operador fusionado. Las matrices lineales y la capa de salida se cuantizan a 4 bits con redondeo al más cercano y bloques de 32, mientras que embeddings, activaciones y caché KV permanecen en float16.

La innovación principal es la integración de decodificación especulativa en el propio grafo: se añade la salida `eagle_taps`, que expone el residual stream a la entrada de las capas 2, N/2 y N-3 de forma concatenada. La cabeza draft (`draft/`), conversión ONNX de EAGLE-3 para Llama 3.1 Instruct 8B, consume esos taps para proponer el siguiente token; el modelo principal verifica cada propuesta, de modo que la salida final es exactamente la del modelo y no una aproximación. La cabeza tiene sus propias matrices en 4 bits y una caché KV estática, y devuelve la propuesta como un id de token. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO adicionales; los del modelo base (Llama 3.1) no se detallan en esta ficha.

## Capacidades

- Generación de texto conversacional multi-turno, con el formato de chat instruct de Llama 3.1.
- Razonamiento general, resumen, reescritura y respuesta a preguntas sobre contexto largo (hasta 128 000 tokens en el modelo base).
- Generación de código y explicaciones técnicas, heredadas del modelo Instruct original.
- Capacidades multilingües del modelo base (ocho idiomas oficiales), aunque la ficha del repositorio no las declara explícitamente.
- Decodificación especulativa verificada mediante cabeza EAGLE-3 integrada en el mismo grafo ONNX, con salida idéntica a la del modelo principal.
- Ejecución en cliente: inferencia dentro del navegador sobre WebGPU a través de ONNX Runtime Web (ONNX Runtime GenAI), sin backend Python.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" específico en esta conversión; las capacidades del modelo base en ese terreno no se verifican en la ficha.
- No se documenta ningún modo de cuantización alternativo (GGUF, INT8, etc.) en este repositorio.

## Casos de uso

- **Asistente embebido en una aplicación web**: cargar el decoder ONNX en el navegador del usuario y responder consultas sin enviar datos a un servidor; el atractivo es la privacidad y la ausencia de coste de inferencia en backend, a cambio de exigir una GPU compatible con WebGPU.
- **Demostraciones y prototipos de producto**: validar una experiencia de chat con un modelo de 8B en local antes de invertir en infraestructura; el repositorio ya incluye el grafo y la cabeza especulativa listos para el runtime de Quick Inference.
- **Procesamiento de documentos confidenciales en cliente**: contratos, informes médicos o material interno que no pueden salir del dispositivo; con 128 000 tokens de contexto en el modelo base, cabe pegar documentos extensos y pedir extracción o resumen dentro de la pestaña.
- **Generación de código en entornos con restricciones de red**: entornos de desarrollo aislados o air-gapped donde se quiera autocompletado y explicación de código sin depender de una API externa, sirviendo los ficheros ONNX desde el propio equipo.
- **Investigación sobre decodificación especulativa**: el par decoder + `eagle_taps` + cabeza EAGLE-3 permite medir aceptación de propuestas y speedup en WebGPU con un grafo autocontenido, útil para estudiar el equilibrio entre latencia y calidad en hardware de consumo.
- **Evaluación de cuantización 4 bits en condiciones reales**: comparar las salidas del export 4-bit (lineales y capa de salida) frente al modelo BF16 original para medir la degradación introducida por bloques de 32, con la ventaja de que la verificación especulativa no altera la distribución final.
- **Formación y talleres**: desplegar un LLM Instruct real en un aula sin instalar CUDA ni montar servidores, únicamente con un navegador con WebGPU y una GPU con suficiente memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La ficha no incluye cifras de MMLU, HumanEval, GSM8K ni de velocidad (tokens por segundo) o tasa de aceptación de la cabeza EAGLE-3. Tampoco se aportan comparaciones medidas contra el modelo BF16 original ni contra otras conversiones ONNX. Cualquier cifra de rendimiento en WebGPU dependerá del navegador, del driver y de la GPU concreta, y no está cuantificada en este repositorio.

## Requisitos de hardware

- **VRAM estimada**: los pesos ocupan 5,9 GB (tamaño del repositorio). La caché KV en float16 consume aproximadamente 131 KB por token (32 capas × 8 cabezas KV × 128 dimensiones × K y V × 2 bytes), es decir, unos 0,52 GB para 4 096 tokens y unos 4,2 GB para 32 768 tokens. Presupuesto realista: 7-8 GB de VRAM para contextos de 4-8k tokens, y 10-11 GB para contextos cercanos a 32k. Estas cifras son estimaciones calculadas a partir de la arquitectura del modelo base y del tamaño del repositorio, no datos publicados por el autor.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti Super, RTX 4080 y RTX 4090 para escritorio; Apple Silicon (M1 Pro/Max en adelante) con memoria unificada y WebGPU sobre Metal. En el extremo bajo, una GPU de 8 GB solo permite contextos cortos.
- **¿Cabe en GPU de consumo?**: sí, es precisamente el objetivo del proyecto, siempre que el navegador exponga WebGPU y el dispositivo tenga al menos ~8 GB de memoria gráfica disponible para la pestaña.
- **Requisitos de software**: navegador con WebGPU habilitado (Chrome/Edge con soporte estable de WebGPU), ONNX Runtime Web y el runtime de Quick Inference; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que requieren otros formatos (safetensors, GGUF) o backend CUDA/CPU.
- **Latencia y throughput**: no disponibles. No se publican tokens por segundo ni el speedup atribuible a EAGLE-3. Como referencia cualitativa, la decodificación especulativa reduce el número de pasos del decoder principal cuando la tasa de aceptación es alta, pero el rendimiento efectivo dependerá del ancho de banda de memoria de la GPU y de la implementación WebGPU.
- **Almacenamiento y red**: 5,9 GB que el cliente debe descargar (o servir desde caché local); conviene servirlos comprimidos y con caché HTTP agresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `danyalmalik/Llama-3.1-8B-Instruct-ONNX-WebGPU` | 8,03 B | 128k en el modelo base (no verificado en el export) | 4 bits lineales + fp16 activaciones y KV; ONNX GenAI + WebGPU; cabeza EAGLE-3 | Llama 3.1 Community License | 0 descargas, 0 likes; experimental |
| `meta-llama/Llama-3.1-8B-Instruct` (original) | 8,03 B | 128k | BF16; safetensors | Llama 3.1 Community License | Repositorio oficial con gating |
| `unsloth/Llama-3.1-8B-Instruct` (copia sin gating) | 8,03 B | 128k | BF16; safetensors | Llama 3.1 Community License | Público, sin gating; origen de esta conversión |
| Otras conversiones ONNX/GGUF del mismo modelo base | 8,03 B | 128k (segun export) | ONNX INT4/INT8 o GGUF Q4_K_M, sin cabeza especulativa | Llama 3.1 Community License | Múltiples repositorios comunitarios; no se citan IDs concretos por no estar en la información disponible |

La diferencia frente al original no está en calidad potencial sino en el despliegue: único artefacto que combina layout GenAI, WebGPU y decodificación especulativa EAGLE-3 verificada. Frente a conversiones GGUF (Ollama/llama.cpp), este repositorio no ofrece variantes de cuantización ni ejecución en CPU, y su ámbito es exclusivamente el navegador. No se dispone de comparaciones de rendimiento medidas entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Salidas no idénticas al original**: el autor advierte explícitamente de que son ficheros modificados y que las salidas son "cercanas, pero no idénticas" a las del modelo base, por la cuantización a 4 bits de capas lineales y de la capa de salida.
- **Madurez**: repositorio con 0 descargas y 0 likes, sin pipeline declarado y con fecha de creación posterior a la revisión de los pesos base; no hay evidencia de uso en producción ni de validación independiente.
- **Dependencia de WebGPU**: el rendimiento y la propia ejecución dependen de la implementación de WebGPU del navegador, del driver de la GPU y del sistema operativo; no hay matriz de compatibilidad publicada. Algunos navegadores limitan el tamaño de buffer y la memoria por pestaña, lo que puede impedir contextos largos o directamente la carga del modelo.
- **Contexto efectivo incierto**: aunque el modelo base soporta 128 000 tokens, la ficha no indica la longitud máxima manejada por el export (caché KV, límites de memoria del navegador). Asumir 128k en cliente es arriesgado.
- **Sin datos de calidad ni de rendimiento**: no hay benchmarks, ni evaluación de la degradación por cuantización, ni tasa de aceptación de la cabeza especulativa.
- **Tool calling y agentes no documentados**: no se confirma en la ficha el soporte de function calling, uso de agentes o multi-step reasoning en esta conversión.
- **Riesgo de alucinación**: inherente al modelo base Instruct de 8B, especialmente en dominios especializados y con prompts largos; la cuantización 4 bits puede agravar derivas en tareas de precisión (matemáticas, citas literales).
- **Sesgos**: no se documenta ninguna evaluación de sesgo en este repositorio; los sesgos del modelo Llama 3.1 original se heredan sin mitigación adicional.
- **Restricciones de licencia**: Llama 3.1 Community License, con política de uso aceptable (`USE_POLICY.md`) y cláusula de licencia adicional para productos con más de 700 millones de usuarios activos mensuales; se exige mantener los avisos ("Built with Llama", `NOTICE`, `LICENSE`). Conviene revisar también `draft/LICENSE`, ya que la cabeza EAGLE-3 se distribuye bajo sus propios términos, que no se detallan en la ficha.
- **Sin soporte de CPU ni de runtimes convencionales**: no hay GGUF ni safetensors; el artefacto no es utilizable en vLLM, TGI, llama.cpp u Ollama sin reconversión.
- **Coste de distribución**: 5,9 GB que el cliente debe descargar; sin una estrategia de caché o servido local, la experiencia inicial puede ser inviable en conexiones lentas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danyalmalik/Llama-3.1-8B-Instruct-ONNX-WebGPU
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Copia sin gating usada en la conversión: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Cabeza draft EAGLE-3: https://huggingface.co/yuhuili/EAGLE3-LLaMA3.1-Instruct-8B

No se han encontrado en la información proporcionada enlaces a papers, blogs técnicos, repositorios de código ni demos adicionales.
