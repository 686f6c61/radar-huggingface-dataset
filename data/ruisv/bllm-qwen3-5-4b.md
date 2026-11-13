# ruisv/bllm-qwen3.5-4b

## Resumen

bllm-qwen3.5-4b es una compilación nativa para BPU del modelo Qwen/Qwen3.5-4B, publicada por el desarrollador ruisv. No se trata de un checkpoint cargable con `transformers`, sino de un binario compilado y cuantizado para la NPU Nash de D-Robotics, orientado a ejecución totalmente local en placas edge. El artefacto se ejecuta a través de BLLM, un runtime on-device que interactúa directamente con la BPU mediante `hbDNN`/`hbUCP`, sin GPU, CUDA ni llamadas a la nube.

El modelo base Qwen3.5-4B emplea una arquitectura híbrida: 24 capas Gated-DeltaNet (atención lineal tipo SSM) con cabezas key/value desacopladas (16 key, 32 value) y `head_dim=256`, más 8 capas de atención completa. Esta combinación no está cubierta por la toolchain oficial OE-LLM de D-Robotics (`libxlm`), motivo por el cual esta compilación existe: el runtime nativo de BLLM compila el grafo directamente.

La relevancia de esta ficha radica en que demuestra la viabilidad de desplegar un modelo vision-language de 4B parámetros en hardware edge especializado con licencia Apache-2.0, alcanzando 6,14 tok/s en decodificación con contexto de 4096 tokens y el 100% de utilización de la BPU en el decodificador de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated-DeltaNet (atención lineal SSM) + 8 capas de atención completa; cabezas GDN desacopladas (16 key / 32 value), `head_dim=256` |
| Parámetros totales | 4B (modelo base Qwen3.5-4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (`ctx4k`, recomendado) o 512 tokens (`ctx512`) |
| Tipos de cuantización | Pesos int8 per-channel; activaciones int16 con calibración por capa lineal |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Binario compilado para BPU (`.hbm` para decodificador, prefill y torre visual; `embed_tokens.bin`, `tokenizer.json`, `model.json`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B combina capas de atención lineal Gated-DeltaNet con capas de atención completa en una proporción de 24:8. La variante GDN utiliza un esquema desacoplado de cabezas key/value (16 y 32 respectivamente) con dimensión de cabeza de 256, lo que la diferencia de las arquitecturas transformer convencionales. La torre visual está incluida en la compilación y procesa imágenes en un bucket de 320 píxeles con 100 tokens por imagen.

La compilación para BPU introduce varias particularidades técnicas. El decodificador de texto se compila como grafo dual (prefill + decode) más un grafo de prefill troceado con N=32. La cuantización emplea rangos de activación calibrados por capa lineal, ya que los rangos planos (sin calibrar) provocan bucles degenerados en las capas profundas de este tamaño. La reescritura de la implementación de atención (de broadcast `expand_win` a matmul GQA por lotes con deduplicación de máscaras) es la causa del aproximadamente 2x de mejora en velocidad de decodificación respecto a la línea base previa, aunque introduce nueva cuantización int16 en las matmuls de score/output de atención que la ruta anterior no tenía. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes y respuesta a preguntas visuales (image-text-to-text) mediante la torre visual incluida.
- Ejecución de inferencia completamente local en la BPU, sin dependencia de GPU ni de servicios en la nube.
- Carga opcional sin torre visual (`vision=False`) para liberar memoria en tareas puramente textuales.
- Soporte de contexto de 4096 tokens (variante `ctx4k`) o 512 tokens (variante `ctx512`).
- Decodificación con grafo de prefill troceado (N=32) para ingestión de prompts largos e imágenes.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio en la información disponible.

## Casos de uso

- **Robótica edge con percepción visual**: el modelo se ejecuta íntegramente en la BPU de la placa RDK S100P, lo que permite integrarlo en robots o drones que necesitan describir escenas o responder preguntas sobre imágenes sin conectividad a la nube. La torre visual procesa imágenes de 320 píxeles en 100 tokens, adecuada para tareas de percepción en tiempo real.
- **Asistente de voz o texto en dispositivos sin GPU**: al no requerir CUDA ni aceleradores gráficos, el modelo puede desplegarse en hardware embebido con NPU dedicada para asistentes conversacionales en inglés o chino, con latencia de primer token de 2,93-3,29 segundos.
- **Inspección visual en línea de producción**: la variante `ctx512` ofrece 7,54 tok/s con menor consumo de DDR, adecuada para clasificar o describir imágenes de cámaras industriales en ciclos cortos donde las respuestas caben en 512 tokens.
- **Procesamiento de documentos con OCR asistido**: combinando la entrada de imagen con preguntas textuales, el modelo puede extraer y describir contenido de capturas o fotografías en entornos con requisitos de privacidad que impiden enviar datos a la nube.
- **Prototipado de aplicaciones VLM en hardware D-Robotics**: el repositorio bllm-model-zoo documenta el método de compilación y aceptación, lo que permite a equipos de ingeniería reproducir el proceso para otros modelos o ajustar la compilación a sus necesidades.
- **Sistemas de accesibilidad en dispositivos dedicados**: descripción de imágenes en tiempo real para personas con discapacidad visual en dispositivos de bajo consumo, sin depender de conectividad.
- **Evaluación de arquitecturas híbridas SSM en edge**: investigadores pueden medir el rendimiento real de Gated-DeltaNet frente a transformers puros en hardware BPU, con datos de perplejidad (35,29 en ctx4096) y velocidad de decodificación publicados.

## Benchmarks y rendimiento

| Variante | Decodificación | TTFT (imagen, foto de prueba coco-cats) | Paridad prefill↔decode | Perplejidad | Contraste de imagen | Anclas de tarea |
|---|---|---|---|---|---|---|
| ctx4096 | 6,14 tok/s | 3,29 s | PASS | 35,29 | PASS | PASS |
| ctx512 | 7,54 tok/s | 2,93 s | PASS | 35,09 | PASS | PASS |

Mediciones realizadas en S100P en modo rendimiento con 3 ejecuciones repetidas. La utilización de la BPU es del 100% (`CPU_inference_time_cost == 0` en el decodificador de texto). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **Hardware obligatorio**: D-Robotics RDK S100P (Journey-6 J6M, compilado con `march nash-m`). La placa RDK S100 (J6E, `nash-e`, 80 TOPS) no es compatible con estos archivos y requiere su propia compilación; a este tamaño no hay ninguna publicada.
- **Memoria**: el repositorio ocupa 29,2 GB. Requiere un carveout ION ampliado (`hb_switch_ion.sh balanced` o `bpu_first`) y reinicio.
- **Software**: BLLM instalable vía conda desde `https://mirrors.ruis.ai/conda`, con `sw >= 4.0.5`.
- **VRAM**: no aplica; la inferencia se ejecuta en la BPU y la DDR de la placa, sin GPU.
- **Opciones de despliegue**: exclusivamente el runtime BLLM (`bllm.load(...)`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 6,14 tok/s (ctx4096) y 7,54 tok/s (ctx512) en decodificación; TTFT de 3,29 s y 2,93 s respectivamente con entrada de imagen.
- **No cabe en GPU consumer**: el artefacto está compilado para la NPU Nash y no puede ejecutarse en RTX 4090, A100, H100 ni ninguna GPU convencional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware objetivo | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| bllm-qwen3.5-4b (esta ficha) | 4B | 4096 / 512 | RDK S100P (BPU Nash) | Apache-2.0 | Binario BPU `.hbm` | 6,14 tok/s decode (ctx4k) |
| bllm-qwen3.5-0.8b | 0,8B | no disponible | RDK S100P y S100 | Apache-2.0 | Binario BPU `.hbm` | no disponible |
| bllm-qwen3.5-2b | 2B | no disponible | RDK S100P | Apache-2.0 | Binario BPU `.hbm` | no disponible |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | GPU / CPU convencional | Apache-2.0 | safetensors (presumiblemente) | no disponible |

Los modelos de la familia bllm-qwen3.5 comparten el mismo runtime y filosofía de despliegue edge; el de 4B es el de mayor tamaño de la serie y el único que requiere calibración por capa lineal para evitar bucles degenerados. No se dispone de datos de rendimiento de los modelos de 0,8B y 2B en la información proporcionada.

## Limitaciones y advertencias

- **Compatibilidad de hardware estricta**: solo funciona en RDK S100P. Intentar cargarlo en una RDK S100 o en cualquier otro hardware fallará.
- **No es un checkpoint estándar**: no se puede cargar con `transformers`, `AutoModel` ni herramientas convencionales; requiere el runtime BLLM.
- **Salida no idéntica a la versión previa**: la reescritura de atención introduce nueva cuantización int16 en las matmuls de score/output, por lo que las respuestas no son byte-idénticas a la compilación anterior (siguen siendo coherentes y correctas según la aceptación).
- **Riesgo de alucinación**: no se han publicado evaluaciones específicas de sesgo o alucinación para esta compilación; se heredan las características del modelo base Qwen3.5-4B, no documentadas en la información disponible.
- **Cobertura lingüística limitada**: solo inglés y chino; no se ha validado el rendimiento en castellano ni en otros idiomas.
- **Contexto limitado**: 4096 tokens como máximo, insuficiente para documentos largos o conversaciones extensas.
- **Rendimiento modesto**: 6-7,5 tok/s de decodificación limita su uso a aplicaciones no interactivas en tiempo real o a respuestas cortas.
- **Prefill con fallback en CPU**: la ruta de prefill troceado todo-BPU es numéricamente resoluble pero impracticablemente lenta de compilar; esta compilación usa un fallback float `[C,C]` en CPU para el prefill, lo que puede afectar a la latencia en prompts largos.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base y las dependencias del runtime deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ruisv/bllm-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime BLLM: https://github.com/ruisv/bllm
- Model zoo de BLLM: https://github.com/ruisv/bllm-model-zoo
- Receta de compilación del 4B: https://github.com/ruisv/bllm-model-zoo/tree/main/models/qwen3.5-4b
- Receta VLM: https://github.com/ruisv/bllm-model-zoo/tree/main/models/qwen3.5-vlm
- Contrato de aceptación (por qué no basta la similitud coseno): https://github.com/ruisv/bllm-model-zoo#the-acceptance-contract-why-it-is-not-cosine
- Documentación de despliegue en placa: `docs/LLM_ONBOARD.md` en el repositorio BLLM
- Modelo hermano de 0,8B (incluye compilación para S100): https://huggingface.co/ruisv/bllm-qwen3.5-0.8b
