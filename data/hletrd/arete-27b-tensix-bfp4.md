# hletrd/Arete-27B-Tensix-BFP4

## Resumen

Arete-27B-Tensix-BFP4 es una cuantización del modelo NousResearch/Arete-27B (un ajuste supervisado de Qwen/Qwen3.8-27B) realizada por hletrd mediante el toolkit tensix-bfp-gptq de Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo resuelve el problema de ejecutar un LLM de 27.000 millones de parámetros en hardware Tensix con un formato de coma flotante por bloques (BFP4/BFP8) nativo de tt-metal, reduciendo el peso empaquetado de 53,79 GB en bf16 a 17,596 GB sin recurrir a cuantización entera tradicional.

La arquitectura subyacente es la del modelo base: un transformer híbrido con capas de atención clásica y capas Gated DeltaNet, más proyecciones MLP, cuantizadas a `bfloat4_b` (BFP4) y un LM head en `bfloat8_b` (BFP8). Las embeddings, normas y el codificador visual permanecen en bf16. El resultado es un checkpoint que cabe en la memoria DRAM de un acelerador Tensix y que además puede cargarse con `transformers` estándar en GPU, lo que facilita la verificación y el desarrollo.

Su relevancia ahora es doble: por un lado, demuestra un flujo de cuantización GPTQ con búsqueda de exponente por bloque para formatos de bloque flotante propietarios de Tenstorrent; por otro, publica métricas de fidelidad (KL medio a bf16 de 0,0291 frente a 0,0204 de Q4_K_M de llama.cpp) que permiten evaluar objetivamente la pérdida de calidad frente a una cuantización de referencia ampliamente usada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención clásica y capas Gated DeltaNet (base Qwen3.8-27B) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en proyecciones de atención, Gated DeltaNet y MLP; BFP8 (`bfloat8_b`) en LM head; bf16 en embeddings, normas y codificador visual |
| Idiomas soportados | no disponible (la evaluación de fidelidad usa inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix; también cargable en `transformers`) |

## Arquitectura y entrenamiento

El modelo base NousResearch/Arete-27B es un ajuste supervisado (SFT) de Qwen/Qwen3.8-27B. La arquitectura combina capas de atención estándar con capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste computacional en secuencias largas. El checkpoint cuantizado conserva la estructura completa: 16 capas con proyecciones q, k, v, o en BFP4; 48 capas Gated DeltaNet con proyecciones q, k, v, z, a, b y output en BFP4; y 64 capas MLP con gate, up y down en BFP4. El LM head se cuantiza a BFP8 y el resto de tensores (embeddings, normas, `visual`) permanece en bf16.

La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque para los tensores BFP4, y con redondeo al más cercano para los BFP8. El repositorio incluye `quant4.json` con el formato asignado a cada proyección, así como las herramientas `pack_tensix.py` y `verify_grid.py` (procedentes de tensix-bfp-gptq en el commit 5c52065) para verificar el empaquetado matriz a matriz. No se detalla en la información disponible el número de tokens de entrenamiento del modelo base ni la composición del dataset de SFT.

## Capacidades

- Generación de texto conversacional y completado de instrucciones, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento y respuesta a preguntas, heredado del ajuste supervisado del modelo base.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text` y el codificador `visual` se conserva en bf16, por lo que mantiene capacidad multimodal.
- Generación de código y matemáticas: capacidad no verificada de forma específica en la información disponible, pero esperable en un modelo de 27B de la familia Qwen3.8.
- Soporte multilingüe: no confirmado; la evaluación de fidelidad cubre inglés y coreano.
- Ejecución en NPU Tensix mediante tt-metal y ttnn, con kernels y runner publicados (tensix-kernels v0.1.0, tensix-runner v0.1.0).
- Carga estándar en `transformers` con `AutoModelForCausalLM` y `device_map="auto"`, útil para verificación en GPU.
- Soporte de tool calling y agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para Wormhole y Blackhole y puede ejecutarse con el demo `models/demos/qwen38_27b_qb2/demo/text_demo.py` de tt-metal v0.81.1, lo que permite servir un modelo de 27B en hardware no-GPU con 17,596 GB de pesos.
- Inferencia multimodal en el borde: al conservar el codificador visual en bf16 y reducir el resto a BFP4, es viable montar un servicio de descripción de imágenes o VQA sobre una NPU Tensix con menor huella de memoria.
- Verificación de cuantizaciones: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que cada matriz empaquetada coincide bit a bit con su origen, útil en pipelines de CI para cuantización de modelos.
- Investigación en formatos de bloque flotante: sirve como referencia reproducible para comparar BFP4 con GPTQ frente a esquemas enteros como Q4_K_M en términos de KL y top-1.
- Prototipado en GPU antes de portar a NPU: al cargarse con `transformers`, un equipo puede desarrollar y depurar la aplicación en GPU y después mover el mismo checkpoint a Tensix sin recuantizar.
- Evaluación de fidelidad de modelos ajustados: el par de checkpoints (bf16 y BFP4) permite medir la degradación introducida por la cuantización sobre un SFT concreto en lugar de sobre el modelo original.
- Servicio de chat con contexto conversacional: la plantilla de chat y la generación estándar permiten integrarlo en un backend de atención al cliente, siempre que se valide la calidad tras la cuantización.

## Benchmarks y rendimiento

| Modelo | Tamaño (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (NousResearch/Arete-27B) | 53,79 | 0 | 100 |
| Arete-27B-Tensix-BFP4 (este modelo) | 17,596 | 0,02909 | 92,24 |
| Q4_K_M (llama.cpp) | 16,547 | 0,02036 | 93,47 |

Las métricas de KL y top-1 se calcularon sobre 16.240 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: el peso empaquetado es de 17,596 GB; en `transformers` con `dtype="bfloat16"` y `device_map="auto"` la huella efectiva puede superar los 20 GB según el reparto de capas y la caché KV.
- GPU recomendadas para carga en `transformers`: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) con reparto por capas; no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) con `device_map="auto"`, aunque no está confirmado en la información disponible.
- Despliegue en NPU: Tensix Wormhole y Blackhole mediante tt-metal v0.81.1 y ttnn, con `MODEL_WEIGHTS_DIR` y `QWEN_PRECISION_CONFIG=baseline`.
- Opciones de despliegue adicionales (vLLM, llama.cpp, Ollama, TGI): no disponibles; el formato BFP4/BFP8 es específico de Tensix y no es directamente compatible con esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Tensix-BFP4 | 27,36B | no disponible | BFP4/BFP8 safetensors | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B (bf16) | 27,36B | no disponible | bf16 safetensors | Apache 2.0 | Hugging Face |
| Q4_K_M de Arete-27B (llama.cpp) | 27,36B | no disponible | GGUF Q4_K_M | Apache 2.0 | Generado por el autor |
| Qwen/Qwen3.8-27B | no disponible | no disponible | safetensors | no disponible | Hugging Face |

La comparación relevante es de fidelidad: BFP4 obtiene un KL de 0,02909 frente a 0,02036 de Q4_K_M, es decir, 1,43 veces peor, con un tamaño ligeramente superior (17,596 GB frente a 16,547 GB). No se dispone de datos de rendimiento en tareas que permitan comparar con otros modelos de 27B.

## Limitaciones y advertencias

- Pérdida de fidelidad medible: el top-1 cae al 92,24 % frente al 100 % del bf16, y el KL es un 43 % superior al de Q4_K_M en el mismo checkpoint.
- Formato específico de hardware: los tensores BFP4/BFP8 están pensados para tt-metal y ttnn; fuera de Tensix requieren conversión o carga en bf16, lo que anula la ventaja de tamaño.
- Idiomas: no se declaran idiomas soportados; la evaluación solo cubre inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- Contexto: no se especifica la longitud de contexto del modelo base en la información disponible.
- Riesgo de alucinación: no evaluado en la información proporcionada; es esperable en un modelo de 27B sin datos específicos de alineación posteriores al SFT.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el aviso NOTICE debe conservarse y las herramientas incluidas (`pack_tensix.py`, `verify_grid.py`) son de Xylolabs bajo la misma licencia.
- Dependencia de versiones: el flujo de ejecución requiere tt-metal v0.81.1 y las versiones concretas de tensix-kernels y tensix-runner (v0.1.0); cambios de versión pueden romper la compatibilidad del empaquetado.
- Madurez: el repositorio tiene 192 descargas y 0 likes, con dos actualizaciones en noviembre de 2026; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Arete-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de las herramientas incluidas: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
