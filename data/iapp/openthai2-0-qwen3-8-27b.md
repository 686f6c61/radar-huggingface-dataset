# iapp/openthai2.0-qwen3.8-27b

## Resumen

OpenThai 2.0 es un modelo de visión-lenguaje (VLM) de 27.000 millones de parámetros desarrollado por iApp Technology junto con la Asociación de Empresarios de Inteligencia Artificial de Tailandia (AIEAT). Está construido sobre la base Qwen/Qwen3.8-27B y se ha ajustado específicamente para la lectura de documentos y escritura manual en tailandés, así como para el conocimiento general de Tailandia y el uso de herramientas en entornos agénticos. El modelo se publica bajo licencia Apache 2.0 y está disponible en múltiples formatos, desde pesos completos en bf16 hasta cuantizaciones GGUF para hardware de consumo.

La relevancia de este lanzamiento radica en que aborda un vacío claro en el ecosistema de modelos abiertos: la comprensión de documentos tailandeses, incluida la escritura a mano, con un nivel de especialización que supera a su modelo base y a alternativas comerciales cerradas. Además, mantiene las capacidades generales de razonamiento y código de Qwen3.8-27B, lo que lo convierte en una opción versátil para aplicaciones multilingües y agénticas. La versión v2.0.1, publicada en agosto de 2026, corrige una regresión en el conocimiento factual tailandés detectada por la comunidad, mejorando los resultados en exámenes nacionales tailandeses y en benchmarks de instrucciones.

Con una ventana de contexto de 32.768 tokens, soporte para imágenes y texto, y un rendimiento destacado en benchmarks de OCR y uso de herramientas, OpenThai 2.0 se posiciona como una alternativa sólida para desarrolladores que trabajan con tailandés o con documentos del sudeste asiático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según configuracion vLLM recomendada) |
| Tipos de cuantizacion | bf16, GGUF Q4_K_M, GGUF Q8_0, GGUF IQ2_M (2-bit con imatrix), MLX 4-bit, INT8 W8A8, NVFP4 |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF, MLX, INT8, NVFP4 |

## Arquitectura y entrenamiento

OpenThai 2.0 hereda la arquitectura del modelo base Qwen3.8-27B, un transformer denso con componentes de visión que procesa imágenes y texto de forma conjunta. El ajuste fino se ha realizado en dos fases principales. La primera fase se centró en la comprensión de documentos y OCR, con un corpus de documentos tailandeses, escritura a mano y texto de escena. Esta fase provocó una pérdida de conocimiento general tailandés, detectada por la comunidad en la versión v2.0.0. La segunda fase (v2.0.1) reintrodujo ese conocimiento mediante aproximadamente 40.000 pares de preguntas y respuestas verificados extraídos de artículos de Wikipedia relacionados con Tailandia, junto con un conjunto de ejercicios sobre canon literario tailandés (literatura, historia, lenguaje cortesano y métrica). Para preservar las habilidades documentales, se co-entrenó con el corpus completo de escritura a mano y se aplicó una fusión selectiva por aritmética de tareas hacia la versión anterior.

El checkpoint incluye además la cabeza de predicción multi-token (MTP) del modelo Qwen3.8, que permite una decodificación más rápida sin alterar las salidas. No se han publicado detalles sobre el uso de RLHF o DPO; la información disponible indica un ajuste supervisado y fusión de pesos.

## Capacidades

- Lectura y comprensión de documentos tailandeses impresos y escritos a mano, con tasas de error (CER) notablemente reducidas frente al modelo base (una mejora del 60% en escritura a mano según el blog de lanzamiento).
- OCR de texto de escena en tailandés e inglés, incluido texto en imágenes naturales.
- Conocimiento factual tailandés: literatura, historia, lenguaje cortesano (ราชาศัพท์), clasificadores (ลักษณนาม) y métrica poética (ฉันทลักษณ์), con mejoras verificadas en la versión v2.0.1.
- Razonamiento general, generación de código y matemáticas, heredados del modelo base Qwen3.8-27B.
- Uso de herramientas (tool calling) y razonamiento multi-paso, con resultados superiores a su modelo base y a Typhoon 2.5 en el benchmark BFCL (agentic tool use).
- Soporte de modo de pensamiento (reasoning) integrado, compatible con el parser de razonamiento de Qwen3.
- Capacidades multilingües limitadas a tailandés e inglés, con soporte de code-switching entre ambos idiomas.

## Casos de uso

- Digitalización de archivos históricos tailandeses: el modelo puede transcribir documentos manuscritos y textos antiguos con una precisión que supera a los OCR genéricos, facilitando la creación de archivos digitales consultables.
- Atención al cliente automatizada en tailandés: con su capacidad de comprensión de documentos y conocimiento local, puede gestionar consultas sobre servicios gubernamentales, banca o telecomunicaciones, integrando lectura de formularios o capturas de pantalla.
- Asistente de estudio para estudiantes tailandeses: responde preguntas sobre literatura, historia y gramática tailandesa, y puede explicar conceptos a partir de imágenes de libros de texto.
- Extracción de datos de documentos administrativos: facturas, formularios y certificados en tailandés pueden procesarse para extraer campos clave, con la ventaja de manejar tanto texto impreso como manuscrito.
- Agente de automatización de tareas ofimáticas: combinado con su soporte de tool calling, puede actuar como agente que consulta APIs, envía correos o actualiza bases de datos, todo en tailandés o inglés.
- Desarrollo de aplicaciones de accesibilidad: lectura en voz alta de documentos manuscritos o impresos para personas con discapacidad visual, con soporte de contexto largo para documentos extensos.
- Traducción y localización de contenido: sirve como motor de traducción tailandés-inglés con comprensión contextual de documentos, útil para empresas que necesitan procesar material bilingüe.

## Benchmarks y rendimiento

La model card proporciona resultados medidos en la versión v2.0.1 bajo un protocolo idéntico al de la versión anterior. Se presentan los valores más relevantes:

| Benchmark | v2.0.0 | v2.0.1 | Cambio |
|---|---|---|---|
| OpenThaiEval (examenes nacionales tailandeses) | 0.834 | 0.842 | +0.008 |
| IFEval (EN) | 0.914 | 0.896 | -0.018 |
| IFEval-TH | 0.795 | 0.837 | +0.042 |
| HumanEval | 0.945 | 0.970 | +0.025 |
| MMLU-Redux | 0.916 | 0.923 | +0.007 |
| Code-switching TH↔EN | 0.985 | 0.955 | -0.030 |
| Wikisource TH (CER) | 0.126 | 0.131 | +0.005 |
| DocBench (CER) | 0.327 | 0.344 | +0.017 |
| SEA-DocBench-TH (CER) | 0.497 | 0.506 | +0.009 |
| ThaiOCRBench (CER) | 0.743 | 0.731 | -0.012 |
| MTVQA-TH scene text (CER) | 0.819 | 0.784 | -0.035 |
| Thai handwriting, text-disjoint (CER) | 0.261 | 0.241 | -0.020 |
| OCR-Eval-104 printed (CER) | 0.077 | 0.070 | -0.007 |
| English document holdout (CER) | 0.333 | 0.333 | 0.000 |
| Thai handwriting CPE-OPH (CER) | 0.385 | 0.351 | -0.034 |
| BFCL agentic tool use (overall) | 0.820 | 0.806 | -0.014 |
| BFCL multi-turn agentic episodes | 0.775 | 0.760 | -0.015 |

Nota: en las métricas CER (Character Error Rate), valores más bajos indican mejor rendimiento. El blog de lanzamiento indica que el modelo "lidera" en BFCL frente a su modelo base y a Typhoon 2.5, aunque no se proporcionan los valores exactos de Typhoon en la información disponible.

## Requisitos de hardware

- Peso completo en bf16: requiere aproximadamente 56 GB de VRAM, por lo que se recomienda una GPU de 80 GB (A100, H100) o dos GPUs de 48 GB. El comando de ejemplo usa `--gpu-memory-utilization 0.85` con una sola GPU de 80 GB.
- GGUF Q4_K_M: ~17 GB, ejecutable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090.
- GGUF Q8_0: ~29 GB, requiere GPUs con 32 GB o más (p. ej., RTX 4090 con 24 GB no es suficiente; se necesita una A6000 o similar).
- GGUF IQ2_M (2-bit): ~9.8 GB, cabe en GPUs con 12-16 GB (RTX 4070, 4080). El autor recomienda Q4_K_M cuando sea posible, pero IQ2_M es la opción para hardware limitado.
- MLX 4-bit: ~16 GB de memoria unificada, adecuado para Apple Silicon con 24 GB o más (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max).
- INT8 W8A8: ~40 GB, para GPUs de clase 40 GB (A100 40GB, L40S).
- NVFP4: específico para GPUs NVIDIA Blackwell (B200, etc.).
- Opciones de despliegue: vLLM (con soporte de parser de razonamiento Qwen3), llama.cpp (para GGUF), Ollama (comando `ollama run openthai/openthai2.0-qwen3.8-27b`), MLX (para Apple Silicon), y transformers estándar.
- El adaptador LoRA (rank 64, 7 GB) se puede servir sobre el modelo base con LoRA dinámica para ahorrar memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | BFCL overall |
|---|---|---|---|---|---|
| OpenThai 2.0 (v2.0.1) | 27.8B | 32.768 | Apache 2.0 | Tailandes, OCR, agentes | 0.806 |
| Qwen3.8-27B (base) | 27.8B | 32.768 (aprox.) | Apache 2.0 | General, multilingue | No reportado (inferior segun el autor) |
| Typhoon 2.5 (tailandes) | No disponible | No disponible | No disponible | Tailandes | Inferior segun el autor |

La comparación con Typhoon 2.5 se menciona cualitativamente en el blog de lanzamiento, pero no se proporcionan cifras exactas de BFCL ni de otros benchmarks. OpenThai 2.0 supera a su modelo base en tareas de documento y uso de herramientas, mientras que mantiene un rendimiento general comparable. La principal diferencia frente a Qwen3.8-27B es la especialización en tailandés y la mejora en OCR, a costa de una ligera caída en algunos benchmarks generales (p. ej., code-switching).

## Limitaciones y advertencias

- Conocimiento general tailandés no completamente restaurado: la versión v2.0.1 solo recupera un conjunto específico de hechos canónicos; en una prueba con 28 hechos retenidos del entrenamiento, el modelo obtiene entre 5 y 9 aciertos, igual que el modelo base. Para tareas de conocimiento abierto, se recomienda usar RAG (recuperación aumentada).
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en temas fuera de su corpus de entrenamiento.
- Idiomas limitados: solo tailandés e inglés; el rendimiento en otros idiomas no está garantizado y puede degradarse.
- Sesgos potenciales: al estar entrenado principalmente con datos tailandeses, puede reflejar sesgos culturales o regionales de Tailandia.
- La cuantización IQ2_M (2-bit) puede degradar la calidad en tareas complejas; el autor recomienda Q4_K_M cuando el hardware lo permita.
- El modelo no distingue entre hechos enseñados y no enseñados; la mejora en conocimiento canónico no generaliza a otros hechos tailandeses.
- Para uso en producción, se recomienda validar las salidas en tareas críticas y combinar con sistemas de verificación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Repositorio GGUF: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-GGUF
- Repositorio MLX 4-bit: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-MLX-4bit
- Repositorio INT8 W8A8: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-INT8-W8A8
- Repositorio NVFP4: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-NVFP4
- Página de Ollama: https://ollama.com/openthai/openthai2.0-qwen3.8-27b
- Blog de lanzamiento (iApp): https://iapp.co.th/blog/openthai2p0-launch
- Página oficial del producto: https://iapp.co.th/openmodels/openthai2p0
- Anuncio de AIEAT: https://openthai.aieat.or.th/en/openthai2p0
- Demo gratuita: https://chinda3.iapp.co.th
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
