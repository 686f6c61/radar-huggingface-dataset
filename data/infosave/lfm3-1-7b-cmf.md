# infosave/LFM3-1.7B-cmf

## Resumen

LFM3-1.7B-cmf es una distribucion cuantizada del modelo LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1.700 millones de parametros desarrollado por Liquid AI para agentes locales, tool calling y salida estructurada. Esta version concreta, publicada por el usuario infosave, empaqueta los pesos en el formato CMF (un archivo unico autocontenido) para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust que no requiere Python ni frameworks de machine learning.

La relevancia de esta ficha esta en el formato y el motor de ejecucion, no en el modelo base: CMF permite ejecutar el modelo en GPU NVIDIA, AMD e Intel mediante Vulkan o DX12, en NVIDIA tambien mediante CUDA, en Apple Silicon mediante Metal y en CPU, con un unico binario. Se ofrecen dos variantes de cuantizacion: `q8_2f` (8 bits, 1,76 GB, practicamente sin perdida) y `q4tp` (4 bits, 0,93 GB, con menor fidelidad).

El modelo base emplea la arquitectura tri-hibrida de Liquid AI (24 capas: 13 de convolucion corta con compuertas, 6 de atencion completa y 5 de atencion de ventana deslizante) con una ventana de contexto de 262.144 tokens y modo de razonamiento activado por defecto. Esta pensado para despliegue en el borde (edge), agentes locales y entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido: 24 capas (13 gated short-convolution, 6 full-attention, 5 sliding-window attention) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits (`q8_2f`, 1,76 GB) y 4 bits (`q4tp`, 0,93 GB); normas, taps de convolucion corta y compuertas de atencion por cabeza permanecen en 16 bits |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | CMF (archivo unico, libreria `cortiq`); el checkpoint original esta en bf16 para Transformers |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B usa la arquitectura tri-hibrida de Liquid AI, que combina tres tipos de capas en un mismo transformer: convoluciones cortas con compuertas (gated short-convolution), atencion completa y atencion de ventana deslizante. Esta mezcla reduce el coste computacional del prefill y permite sostener contextos muy largos (262.144 tokens) con un presupuesto de memoria menor que un transformer de atencion completa equivalente. El modelo incorpora modo de razonamiento activado por defecto: la plantilla de chat termina con `<think>` y el modelo genera primero un bloque de pensamiento antes de la respuesta.

No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si se aplicaron RLHF o DPO en el modelo base. La model card de esta distribucion se centra en el proceso de conversion y cuantizacion: la conversion a f16 es exacta (coincide posicion por posicion con el checkpoint bf16 ejecutado en float32 por Transformers, con perplexity 13,186 frente a 13,186 y top-1 del 100 %), y las continuaciones greedy en chat son identicas en texto. La innovacion tecnica destacable de esta distribucion es el motor `cortiq`: cada capa de un token se ejecuta en un unico envio a GPU (una submission Vulkan/DX12, un command buffer Metal), lo que reduce el overhead de lanzamiento de kernels.

## Capacidades

- Generacion de texto en 17 idiomas, con enfasis en ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, russo y polaco.
- Razonamiento con modo de pensamiento (thinking mode) activado por defecto; se puede desactivar con `--no-think` o `"enable_thinking": false`.
- Tool calling / function calling en formato OpenAI: el modelo responde con `<tool_call><function=NAME><parameter=KEY>value</parameter></function></tool_call>`, que el servidor devuelve como `message.tool_calls` con `finish_reason: "tool_calls"`.
- Salida estructurada, orientada a agentes locales y pipelines automatizados.
- Servidor compatible con la API de OpenAI: endpoints `/v1/chat/completions` (con y sin streaming), `/v1/completions` y `/v1/models`, mas un panel web en el mismo puerto.
- Generacion determinista mediante muestreo greedy (`--greedy`).
- No se mencionan capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Agentes locales de escritorio: el modelo corre en CPU y en GPUs de consumo mediante `cortiq`, sin Python ni dependencias de ML, lo que permite empaquetarlo como binario dentro de una aplicacion de escritorio que ejecute tool calling contra APIs locales.
- Automatizacion de atencion al cliente con contexto largo: la ventana de 262.144 tokens permite mantener historiales de conversacion extensos y documentacion de producto en el mismo contexto, con el modo de pensamiento desactivado para reducir latencia en respuestas rutinarias.
- Generacion de codigo asistida en entornos sin GPU dedicada: con `q4tp` (0,93 GB) el modelo cabe en cualquier tarjeta con 2 GB de memoria libre y alcanza 231 tok/s de decodificacion en una NVIDIA A40, suficiente para autocompletado interactivo.
- Pipelines de agente multi-paso: el soporte nativo de tool calling en formato OpenAI permite encadenar llamadas a funciones (consulta de clima, busqueda, calculo) y responder a partir del resultado, tanto con como sin modo de pensamiento.
- Procesamiento por lotes en el borde (edge): despliegue en dispositivos con Apple Silicon mediante Metal (48,5 tok/s con `q8_2f` en un M4 de 10 nucleos de GPU) para tareas de clasificacion, extraccion y resumen sin enviar datos a la nube.
- Servicio interno compatible con OpenAI: `cortiq serve` expone una API drop-in para herramientas que ya hablan el protocolo de OpenAI, lo que facilita integrar el modelo en prototipos existentes sin reescribir clientes.
- Razonamiento matematico y cientifico: la model card recomenda muestreo especifico (`--temperature 1.0 --top-p 0.95 --top-k 20`) para estas tareas, util en cuadernos de analisis que necesitan explicaciones paso a paso.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K). Los datos disponibles son de calidad de cuantizacion y de rendimiento del motor:

| Metrica | q8_2f (8 bits) | q4tp (4 bits) | bf16 original |
|---|---:|---:|---:|
| Perplexity (wikitext-2, primeros 4096 tokens) | 13,14 | 15,15 | 13,10 |
| Top-1 vs original (bf16 en float32) | 97,7 % | 80,4 % | — |
| Tamano de pesos | 1,76 GB | 0,93 GB | 3,46 GB |

Rendimiento de inferencia con `cortiq bench --core --ignore-eos`, una sola secuencia:

| Plataforma | Archivo | Decodificacion (tok/s) | Decod. a 1k / 4k | Prompt 1k / 4k (tok/s) | Primer token, prompt 4k |
|---|---|---:|---:|---:|---:|
| NVIDIA A40 (Vulkan) | q8_2f | 166 | 135 / 130 | 749 / 623 | 7,6 s |
| NVIDIA A40 (Vulkan) | q4tp | 231 | 184 / 165 | 695 / 574 | 8,0 s |
| Apple M4 (Metal) | q8_2f | 48,5 | — | 388 (prompt 1k) | — |
| Apple M4 (Metal) | q4tp | 84 | 82 (a 1k) | 560 (prompt 1k) | — |
| RTX A5000 (CUDA) | q4tp | 274,3–282,4 | — | 9.294–10.233 (prompt 4k) | 0,40–0,44 s |
| RTX A5000 (Vulkan) | q4tp | 262,9–267,1 | — | 533 (prompt 4k) | — |

## Requisitos de hardware

- VRAM estimada: pesos residentes de 1,73 GB (`q8_2f`) y 0,90 GB (`q4tp`); cualquier GPU con 2 GB de memoria libre puede ejecutar ambos archivos.
- GPUs recomendadas: NVIDIA A40, RTX A5000 (probadas en la model card), cualquier GPU NVIDIA, AMD o Intel compatible con Vulkan o DX12, y Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, ambos archivos caben en tarjetas de gama media y baja con 2 GB de VRAM libre; no se especifican modelos concretos de consumo en la informacion disponible.
- Opciones de despliegue: `cortiq` (CLI y servidor compatible con OpenAI), instalable via `cargo install cortiq-cli` (con `--features cuda` para CUDA); binarios precompilados para Linux, macOS y Windows en la pagina de releases. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 166 tok/s de decodificacion (`q8_2f`) y 231 tok/s (`q4tp`) en A40 con Vulkan; 274–282 tok/s en RTX A5000 con CUDA; 48,5 tok/s (`q8_2f`) y 84 tok/s (`q4tp`) en Apple M4. Primer token con prompt de 4k: 7,6 s (A40, `q8_2f`) y 0,40–0,44 s (RTX A5000, CUDA, `q4tp`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-cmf (esta ficha) | 1,7B | 262.144 | lfm1.0 | CMF / cortiq | Tri-hibrido, thinking por defecto, tool calling |
| LiquidAI/LFM3-1.7B (original) | 1,7B | 262.144 | lfm1.0 | bf16 / Transformers | Checkpoint de referencia; 3,46 GB |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se han proporcionado resultados de benchmarks del modelo base frente a alternativas de la misma categoria, por lo que no es posible establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- El modelo de 1,7B en modo instruct es sensible a pesos de 4 bits: la propia model card recomienda `q8_2f` salvo que la memoria sea el limite. Con `q4tp`, la coincidencia top-1 frente al original cae al 80,4 %.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se documentan evaluaciones de factualidad en la informacion disponible.
- El modo de pensamiento consume tokens de `--max-tokens` (por defecto 256), lo que puede truncar respuestas si no se amplia el limite.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- La licencia lfm1.0 esta etiquetada como `other`; deben revisarse las condiciones del archivo LICENSE antes de cualquier uso comercial.
- El despliegue depende de un motor especifico (`cortiq` 0.8.49 o posterior) y de un formato propietario (CMF); no hay integracion documentada con ecosistemas como vLLM, llama.cpp u Ollama.
- CUDA es una feature de compilacion (`cargo install cortiq-cli --features cuda`) que requiere driver NVIDIA y librerias CUDA 12.x; sin ella, en NVIDIA se usa Vulkan.
- El soporte de contexto largo esta documentado a nivel de arquitectura (262.144 tokens), pero las mediciones de rendimiento publicadas solo cubren prompts de hasta 4k tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/LFM3-1.7B-cmf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio del formato CMF y del motor cortiq: https://github.com/infosave2007/cmf
- Releases con binarios precompilados: https://github.com/infosave2007/cmf/releases
- Licencia del modelo base (lfm1.0): LICENSE incluido en el repositorio de Hugging Face
