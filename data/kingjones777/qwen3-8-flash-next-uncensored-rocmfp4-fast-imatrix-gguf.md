# kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF es una cuantización de 4 bits en formato GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario kingjones777. El modelo base original lo desarrolla el equipo Qwen (Alibaba), mientras que la variante "Uncensored" procede de orcarouter/Qwen3.8-Flash-Next-Uncensored, un ajuste que elimina el comportamiento de rechazo. Esta ficha describe el artefacto cuantizado, no el modelo original.

La particularidad técnica del repositorio es que emplea tipos de tensor ROCmFP4, propios de un fork de llama.cpp orientado a GPUs AMD con arquitectura gfx1151 (Ryzen AI Max+ 395, "Strix Halo"), y una arquitectura de modelo denominada qwen4exp que el llama.cpp estándar no reconoce. Además, la cuantización se ha calibrado con una importance matrix (imatrix), lo que según el autor reduce la perplejidad un 5,9 % respecto a la variante FAST sin imatrix.

El interés actual del artefacto es doble: por un lado, demuestra un flujo de cuantización de 4 bits para hardware AMD integrado con hasta 128 GB de memoria gráfica unificada (GTT); por otro, documenta una corrección del grafo MTP para decodificación especulativa que eleva la tasa de aceptación a 0,94 y mejora el throughput hasta un 34 % en cargas de razonamiento. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (transformer; requiere fork específico de llama.cpp) |
| Parametros totales | 448.931.056 (según safetensors del modelo base); el autor menciona una tabla PLE de 51,2B |
| Parametros activos | no disponible |
| Longitud de contexto | verificada hasta 128K con el parche de checkpoint; decodificación especulativa limitada a ≤32K sin ese parche |
| Tipos de cuantizacion | ROCmFP4, 4,27 bpw; cabeza de salida protegida en Q6_K; cabeza MTP aparte en Q8_0 (Q6_K y Q4 no evaluadas) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (3 shards, 87,9 GiB); repositorio de 95,3 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen con arquitectura interna qwen4exp, que incluye un grafo MTP (multi-token prediction) para decodificación especulativa y una tabla PLE de 51,2 mil millones de parámetros según la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original. La variante Uncensored elimina el comportamiento de rechazo mediante un ajuste posterior no documentado en la información disponible.

La contribución técnica de este repositorio es la cuantización: se aplicó una importance matrix calibrada con el corpus calibration_datav3 de bartowski, calculada sobre el propio modelo en 4 bits (no en BF16, porque la tabla PLE y el límite de 128 GB de GTT impiden una pasada forward en BF16 en Strix Halo). El resultado medido en WikiText-2 raw con contexto 512 es una perplejidad de 5,0337 ± 0,031 frente a 5,3465 ± 0,034 de la variante sin imatrix, una mejora del 5,9 %. El autor también documenta un parche al grafo MTP que corrige un combinador defectuoso (promediado de los flujos de hiperconexión) y eleva la aceptación de borradores de 0,36 a 0,94.

## Capacidades

- Generación de texto autoregresiva con pipeline text-generation.
- Razonamiento multi-paso: la model card reporta mejoras de throughput del 34 % en cargas de razonamiento con decodificación especulativa y `--spec-draft-n-max 1`.
- Generación de código: medida en los benchmarks del autor con 26,80 tok/s con draft frente a 24,09 tok/s sin draft.
- Salida estructurada en JSON: soportada y medida (27,24 tok/s con draft, 23,99 sin draft).
- Resumen de documentos largos: medida con 24,14 tok/s con draft y 23,80 sin draft.
- Decodificación especulativa mediante cabeza MTP separada (Q8_0), con verificación completa de cada token por el modelo principal.
- Comportamiento sin rechazos (uncensored): el ajuste elimina las negativas a responder, sin añadir capacidades nuevas.
- Soporte de plantillas de chat mediante `--jinja` en llama-server.
- Capacidades multilingües, de tool calling y de agentes: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización de 4 bits en hardware AMD integrado: permite reproducir el flujo ROCmFP4 + imatrix en un Ryzen AI Max+ 395 y comparar perplejidad frente a la variante sin imatrix, con una diferencia medida del 5,9 %.
- Evaluación de decodificación especulativa MTP: el repositorio incluye parches y una tabla de rendimiento por carga de trabajo que permite validar la aceptación de borradores y el throughput en razonamiento, JSON, código y resumen.
- Generación de código en local sobre GPU AMD: con 26,80 tok/s en la carga de código y soporte de plantilla Jinja, es viable para asistentes de programación en estación de trabajo sin GPU NVIDIA.
- Producción de salida JSON estructurada en pipelines locales: la carga JSON mantiene 27,24 tok/s con draft y permite integrar el modelo en flujos que requieran formato estricto, siempre que se acepte el riesgo de contenido sin filtros.
- Resumen de documentos largos con contexto extendido: el checkpoint está verificado hasta 128K, adecuado para resumir documentación extensa en un equipo con memoria unificada amplia.
- Experimentación con modelos sin guardarraíles en entornos controlados: útil para estudiar comportamiento de rechazo y sesgos, con la advertencia explícita de que elimina salvaguardas sin añadir capacidad.
- Despliegue en clústeres de GPUs AMD con llama-server: el fork permite servir el modelo con `-ngl 999`, `-fa on` y `-np 1`, aunque limitado a hardware gfx1151.

## Benchmarks y rendimiento

Calidad medida por el autor en WikiText-2 raw con `-c 512`:

| Build | PPL | Delta |
|---|---|---|
| FAST sin imatrix | 5,3465 ± 0,034 | — |
| FAST imatrix (este) | 5,0337 ± 0,031 | −5,9 % |
| Cabeza 4-bit completa con imatrix (referencia) | 5,1075 | +1,5 % frente a este build |

Throughput medido (mediana de 3, greedy, 256 tokens generados, `-c 2048`, cabeza Q8_0, gfx1151 / ROCm 7.2.4, 2026-09-17):

| Carga | Sin draft (tok/s) | draft n-max 4 | draft n-max 1 |
|---|---|---|---|
| Razonamiento | 23,91 | 30,94 (+29 %, acc 0,680) | 31,94 (+34 %, acc 0,945) |
| JSON | 23,99 | 28,31 (+18 %, acc 0,597) | 27,24 (+14 %, acc 0,758) |
| Código | 24,09 | 21,56 (−10 %, acc 0,422) | 26,80 (+11 %, acc 0,711) |
| Resumen largo | 23,80 | 20,36 (−14 %, acc 0,352) | 24,14 (+1 %, acc 0,641) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 87,9 GiB para los pesos en 4,27 bpw, más la cabeza MTP Q8_0 y el espacio de contexto; el autor cita un techo de 128 GB de GTT en Strix Halo.
- GPU objetivo: AMD Radeon con arquitectura gfx1151, en concreto Ryzen AI Max+ 395 (Strix Halo). No hay soporte documentado para NVIDIA ni para otras arquitecturas AMD.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB o menos; requiere un sistema con memoria unificada de al menos 128 GB.
- Software: no funciona con llama.cpp estándar. Es necesario compilar el fork kingjones30/ROCmFPX con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151` y aplicar los parches `qwen4exp-qsa-checkpoint-fix.patch` y, opcionalmente, `qwen4exp-mtp-graph-fork.patch`.
- Despliegue: llama-server del fork, con `-ngl 999 -fa on -np 1 -c 32768 --jinja`; contexto ampliable a 128K con el parche de checkpoint.
- Throughput: entre 23,80 y 24,09 tok/s en decodificación simple; hasta 31,94 tok/s con draft n-max 1 en razonamiento.
- vLLM, Ollama y TGI: no disponibles para este formato y arquitectura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Este build (ROCmFP4 FAST imatrix) | 448,9 M (según safetensors) | 128K verificado | GGUF ROCmFP4 | qwen-community-1.0 | AMD gfx1151 |
| Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF | mismos pesos base | mismo | GGUF ROCmFP4 | qwen-community-1.0 | AMD gfx1151 |
| Qwen3.8-Flash-Next-MTP-Heads-GGUF | cabeza MTP | no aplica | GGUF Q8_0 | no disponible | AMD gfx1151 |
| Qwen/Qwen3.8-Flash-Next (base) | 448,9 M (según safetensors) | no disponible | safetensors | qwen-community-1.0 | GPU estándar |

La comparación se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks frente a modelos de otras familias.

## Limitaciones y advertencias

- Artefacto de investigación: el ajuste uncensored elimina el comportamiento de rechazo sin añadir capacidad; el autor advierte de que debe usarse de forma deliberada y asumiendo la responsabilidad sobre la salida.
- Compatibilidad muy restringida: solo funciona con un fork concreto de llama.cpp y en GPUs AMD gfx1151; llama.cpp estándar no carga el archivo.
- Parches obligatorios: sin `qwen4exp-qsa-checkpoint-fix.patch` la decodificación especulativa debe limitarse a 32K; sin el parche MTP, la aceptación de borradores cae a 0,36.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; el ajuste sin guardarraíles puede aumentar la probabilidad de contenido incorrecto o inapropiado.
- Sesgos: no disponibles en la información proporcionada; la eliminación de rechazos puede exponer sesgos del modelo base sin filtro.
- Idiomas: no disponibles; no se documenta cobertura multilingüe.
- Licencia qwen-community-1.0: es necesario revisar sus términos para uso comercial, ya que se etiqueta como "other" y no como licencia permisiva estándar.
- Contexto: la ventana de 128K solo está verificada con el parche aplicado; el rendimiento con contexto largo no se ha medido más allá de la verificación funcional.
- Throughput: la decodificación especulativa con n-max 4 degrada código (−10 %) y resumen largo (−14 %); el autor recomienda n-max 1.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF
- Build FAST sin imatrix: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Cabezas MTP: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF
- Fork de llama.cpp con soporte ROCmFP4 y qwen4exp: https://github.com/kingjones30/ROCmFPX
- Fork upstream con tipos ROCmFP4: https://github.com/charlie12345/ROCmFPX
- Corpus de calibración: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante uncensored: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
