# izagami/Shikigami-594B-A17B-GGUF

## Resumen

Shikigami-594B-A17B-GGUF es una cuantización extrema (aproximadamente 1 bit por peso) del modelo multimodal Thinking Machines Inkling-2-Small, publicada por el usuario izagami en Hugging Face. El modelo base es un Mixture-of-Experts (MoE) con 594.000 millones de parámetros totales y 17.000 millones activos por token, que selecciona 8 expertos de un total de 384. Acepta entradas de texto e imagen (pipeline image-text-to-text) y está orientado a conversación y razonamiento.

La relevancia de esta ficha radica en que demuestra una técnica de compresión agresiva —pruning de expertos, reducción de la dimensión intermedia y codificación por trellis al estilo QTIP— que permite ejecutar un modelo de casi 600B parámetros en hardware de gama alta para consumidores y estaciones de trabajo, a costa de requerir motores de inferencia específicos (fork de llama.cpp para GB10 o el runtime XeStrata para GPUs Intel Arc). El repositorio ocupa 493,6 GB, aunque el archivo TQ1 principal ronda los 80 GB.

No es una distribución oficial de Thinking Machines: se trata de un derivado bajo licencia Apache 2.0 cuyas modificaciones se limitan a la cuantización y al renombrado. El uso está sujeto además a la Acceptable Use Policy del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (base Inkling-2-Small), 384 expertos, 8 activos por token |
| Parametros totales | 80.802.861.091 (safetensors del repo); el modelo base declara 594B totales |
| Parametros activos | 17B (modelo base) |
| Longitud de contexto | 16.384 tokens en la configuración de ejemplo del autor (no se documenta el máximo del modelo base) |
| Tipos de cuantizacion | TQ1 (~1,1 bits/peso, expertos en trellis QTIP); atención, embeddings y salida en Q6_K; router en F32; visión en BF16 |
| Idiomas soportados | no disponible (la model card incluye ejemplos en japonés e inglés) |
| Licencia | Apache 2.0 (derivado), sujeta a la Acceptable Use Policy de Thinking Machines |
| Formato de pesos | GGUF dividido en 10 archivos (`TQ1/...-00001-of-00010.gguf` a `-00010-of-00010.gguf`), más `mmproj-BF16.gguf` y el draft model `dspark/Shikigami-594B-A17B-DSpark-8bit.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 384 expertos por capa con enrutamiento que activa 8 por token, lo que da 17B parámetros activos sobre 594B totales. La cuantización TQ1 realiza un pruning selectivo de expertos poco utilizados por capa y reduce la dimensión intermedia de los expertos conservados a 2304, 1728, 1152 o 576, agrupados como `_g1`, `_g2`, etc. La selección de qué expertos podar y cuánto reducir se optimiza minimizando el error de salida ponderado, dando más peso a los expertos usados en generación de código y matemáticas.

Los expertos se almacenan con un código trellis de desplazamiento de bits inspirado en QTIP: cada tile de 256 pesos (16×16) ocupa 66 bytes (2,06 bits por peso), con un estado inicial de 14 bits y 255 símbolos de 2 bits. Los pesos se reconstruyen aritméticamente desde el estado (sin codebook) y se escalan por fila en FP16. Las secuencias de signos se buscan con algoritmo de Viterbi sobre los 2^14 estados posibles, y las entradas a cada matriz se rotan con una transformada de Hadamard de 64 puntos tras aplicar un signo fijo. Los escalares por fila se entrenan para aproximar la distribución de probabilidad del siguiente token del modelo original. No se documenta en la información disponible el volumen de tokens de entrenamiento ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento (thinking), con un nivel de esfuerzo configurable (`reasoning_effort`, incluido `"none"` para desactivarlo).
- Entrada de imágenes: el encoder de visión (ViT de 23 capas) se conserva en BF16 en `mmproj-BF16.gguf`; cada región de 40×40 píxeles equivale a un token.
- Generación de código y matemáticas (los expertos se priorizan explícitamente para estas tareas durante la cuantización).
- Soporte de tool calling y flujos de agente de varios pasos (se mencionan pruebas de agente en la model card).
- Decodificación especulativa mediante el draft model DSpark (Q8_0) con vocabulario reducido a 32.768 tokens.
- Capacidades multilingües: no documentadas formalmente; hay ejemplos en japonés.

## Casos de uso

- Asistente de código en local: el modelo conserva expertos priorizados para código y matemáticas, por lo que puede integrarse en un flujo de autocompletado o revisión de parches ejecutado en una estación de trabajo con varias GPUs.
- Agentes autónomos con tool calling: la model card reporta 53 tokens/s en tareas de agente con decodificación especulativa, suficiente para bucles de razonamiento de varios pasos con llamadas a herramientas.
- Análisis de imágenes con texto: al aceptar `image_url` en formato OpenAI, puede procesar capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Atención al cliente en japonés: los ejemplos de la model card miden 42 tokens/s en generación en japonés, lo que lo hace viable para conversaciones multi-turno en ese idioma.
- Despliegue en hardware Intel Arc: con XeStrata y tres Arc Pro B70 (32 GB cada una) más 89 GB de RAM, todos los expertos caben en VRAM, lo que permite servir el modelo sin GPU de datacenter.
- Inferencia en NVIDIA DGX Spark (GB10): con el fork de llama.cpp `ink2v` se obtienen 717-763 tokens/s de prefill y 21-34 tokens/s de decode, adecuado para prototipado y uso personal.
- Investigación sobre cuantización extrema: el formato TQ1 y su pipeline de calibración sirven como referencia para estudiar la relación entre compresión a ~1 bit y fidelidad de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de velocidad y de fidelidad de cuantización:

| Métrica | Valor | Entorno |
|---|---|---|
| Perplexity (texto de prueba) | 2,794 / 2,793 | Fork llama.cpp `ink2v` en GB10, frente a versión convertida por el propio fork |
| Prefill | 717-763 tokens/s | GB10, DSpark activo |
| Decode | 21-34 tokens/s | GB10, DSpark activo (25 tokens/s sin especulación) |
| Prefill | 461-491 tokens/s | GB10 con XeStrata `gb10-port` |
| Decode | 20-27 tokens/s | GB10 con XeStrata `gb10-port` |
| Generación (código) | 56 tokens/s | 3× Intel Arc Pro B70, DSpark, greedy |
| Generación (agente) | 53 tokens/s | 3× Intel Arc Pro B70, DSpark, greedy |
| Generación (japonés) | 42 tokens/s | 3× Intel Arc Pro B70, DSpark, greedy |
| Prefill | ~265 tokens/s | 3× Intel Arc Pro B70, prompt de 4.719 tokens |
| Error relativo del encoder de visión | 6×10⁻⁶ | Frente a implementación de referencia en transformers |

## Requisitos de hardware

- VRAM/RAM: el archivo TQ1 ocupa 80,0 GB; el encoder de visión 0,66 GB; el draft model 1,87 GB. En la configuración medida con 3× Arc Pro B70 se usaron 89 GB de RAM del sistema además de la VRAM.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) en configuraciones de 3 unidades; NVIDIA DGX Spark (GB10). No se documentan pruebas en A100, H100 o RTX 4090.
- GPU de consumo: no hay datos publicados sobre RTX 4090 u otras consumer; el modelo no cabe en una sola GPU de 24 GB sin offloading adicional.
- Motores de despliegue: XeStrata (rama `b70-local`, commit 4b1a8fbdb o posterior; también `gb10-port`) y fork de llama.cpp `imagami3/llama.cpp` rama `ink2v` (tag `ink2v-20261123-0050`) para GB10. El llama.cpp oficial, Ollama, LM Studio y Unsloth no pueden cargar el formato TQ1.
- Latencia y throughput: ver tabla de benchmarks; el prefill en GB10 es de 717-763 tokens/s y el decode de 21-34 tokens/s con especulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shikigami-594B-A17B-GGUF | 594B totales / 17B activos (80,8B en safetensors del repo) | 16.384 en la config de ejemplo | Apache 2.0 + AUP | GGUF TQ1 (~1,1 bits/peso) | Requiere motores específicos; multimodal |
| thinkingmachines/Inkling-2-Small | 594B totales / 17B activos | no disponible | Apache 2.0 | safetensors | Modelo base original, sin cuantizar |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card por el mismo problema de bucles de pensamiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Bucles de pensamiento: Inkling 2 tiende a repetir la misma verificación en su razonamiento, especialmente al depurar código; la cuantización agrava el problema. Se recomienda activar el corte de bucles del motor (`STRATA_INK_THINK_LOOP` o `LLAMA_REASONING_LOOP`) y fijar un límite de tokens de salida.
- Compatibilidad restringida: el formato TQ1 no es un GGUF estándar; solo lo cargan XeStrata y el fork de llama.cpp para GB10. No funciona con llama.cpp oficial, Ollama, LM Studio ni Unsloth.
- Calidad degradada por la compresión: la cuantización a ~1,1 bits/peso introduce pérdida de fidelidad; el autor reporta un error de distribución de siguiente token (KL) pero no se detalla el valor completo en la información disponible.
- Licencia: aunque el derivado es Apache 2.0, el uso queda sujeto a la Acceptable Use Policy de Thinking Machines; conviene revisarla antes de un despliegue comercial.
- Idiomas: no hay lista oficial de idiomas soportados; la evidencia se limita a ejemplos en japonés e inglés.
- Visión limitada: imágenes con más de 1024 regiones de 40×40 píxeles se reescalan, lo que reduce el detalle en imágenes grandes.
- No es una distribución oficial: el soporte y las garantías dependen del autor del fork, no de Thinking Machines.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izagami/Shikigami-594B-A17B-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio XeStrata (rama `b70-local`): https://github.com/imagami3/XeStrata/tree/b70-local
- Repositorio XeStrata (rama `gb10-port`): https://github.com/imagami3/XeStrata/tree/gb10-port
- Fork de llama.cpp (rama `ink2v`): https://github.com/imagami3/llama.cpp/tree/ink2v
- Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
