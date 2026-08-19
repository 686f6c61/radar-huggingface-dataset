# pirola/Nemotron-3-Nano-30B-A3B-pirola-IQ3_XXS-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo NVIDIA Nemotron-3 Nano 30B A3B, desarrollada por el usuario pirola. Se trata del primer build con *padding* (relleno de ceros) en las dimensiones de los expertos para esta familia de modelos, lo que permite reducir el tamaño del archivo a 13,37 GiB y ejecutarlo completamente en una GPU de 16 GB con una ventana de contexto de 262 144 tokens. El modelo base es un MoE (mixture of experts) de 35 400 millones de parámetros totales, con 3 000 millones de parámetros activos por token, diseñado por NVIDIA para generación de texto multilingüe y razonamiento.

La cuantización IQ3_XXS aplicada aquí es significativamente más pequeña que cualquier otra publicada para este modelo (las alternativas existentes se quedan en 16,5–18,1 GB por una limitación de `llama-quantize` con dimensiones no divisibles por 256). El padding es exacto: como la activación MoE es `relu²`, las filas rellenas con ceros contribuyen exactamente cero, sin pérdida de calidad por el propio relleno. Sin embargo, el archivo requiere un fork de llama.cpp con un parche incluido en el repositorio, ya que llama.cpp estándar rechaza los tensores con dimensiones modificadas.

La relevancia de este trabajo radica en que permite ejecutar un modelo de 30B A3B con calidad razonable en hardware de consumo (16 GB VRAM), algo que no era posible con las cuantizaciones existentes. El autor ha verificado exhaustivamente que no existe ningún otro archivo sub-4-bit o con padding para esta familia de modelos, lo que lo convierte en una opción única para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con activación `relu²` |
| Parametros totales | 35 404 292 416 (35,4 B) |
| Parametros activos | 3 000 000 000 (3 B) por token (A3B) |
| Longitud de contexto | 262 144 tokens (validado con `-c 262144`) |
| Tipos de cuantizacion | IQ3_XXS (3,25 bits por peso, con padding en ejes de reducción) |
| Idiomas soportados | en, es, fr, de, ja, it, pt, zh, ar, da, ko, nl, pl, ru, sv |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3 Nano 30B A3B, es un transformer de arquitectura MoE con 35 400 millones de parámetros totales y 3 000 millones de parámetros activos por token. Utiliza una activación `relu²` en las capas de los expertos, lo que permite un *padding* exacto de las dimensiones de reducción: al rellenar con ceros, la salida de `relu²(0) = 0` no altera los resultados. Las dimensiones originales de los tensores de expertos son `hidden_size` 2688, `moe_intermediate_size` 1856 y ancho de FF del experto compartido 3712, ninguna divisible por 256, lo que impedía cuantizaciones sub-4-bit con los métodos K-quant e IQ-quant estándar.

El autor del repositorio (pirola) ha desarrollado un proceso de *padding* "Variant B" que rellena los ejes de reducción a 2816, 2048 y 3840 respectivamente, y ha verificado mediante un barrido exhaustivo de Hugging Face, GitHub y llama.cpp que no existía ningún otro archivo con estas características. El proceso de cuantización utiliza una imatrix (importance matrix) también rellenada para coincidir con la geometría, y el resultado es un archivo GGUF de 14 358 879 744 bytes. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, método de alineación) en la documentación proporcionada.

## Capacidades

- Generación de texto multilingüe en 15 idiomas: inglés, español, francés, alemán, japonés, italiano, portugués, chino, árabe, danés, coreano, neerlandés, polaco, ruso y sueco.
- Razonamiento y resolución de problemas complejos gracias a su arquitectura MoE con 3 B de parámetros activos.
- Soporte de *tool calling* y *function calling* (el modelo base de NVIDIA está diseñado para ello, aunque no se detalla en la documentación del repositorio).
- Capacidad de *agentic reasoning* y multi-step (implícito en la arquitectura, no confirmado en los datos).
- Conversación multi-turno con contexto largo de hasta 262 144 tokens, validado en el script de servidor incluido.
- Compatible con el sistema de plantillas Jinja (`--jinja`) para formateo de mensajes.
- Cuantización IQ3_XXS con *padding* exacto que preserva la calidad del modelo base en las filas no rellenas.

## Casos de uso

- Asistente de programación local: con 3 B de parámetros activos y una ventana de 262 K tokens, puede mantener conversaciones largas sobre código, revisar repositorios completos y generar fragmentos en varios lenguajes, todo en una GPU de 16 GB sin conexión a internet.
- Atención al cliente automatizada: el modelo puede gestionar diálogos multi-turno con historial extenso gracias a su contexto de 262 K tokens, y su soporte multilingüe permite atender a usuarios en 15 idiomas con una sola instancia.
- Análisis de documentos extensos: la ventana de contexto amplia permite procesar manuales, contratos o informes de cientos de páginas en una sola pasada, extrayendo información relevante o resumiendo secciones específicas.
- Generación de contenido creativo multilingüe: redacción de artículos, guiones o material de marketing en varios idiomas, con coherencia a lo largo de capítulos completos gracias al contexto largo.
- Despliegue en edge computing: al caber en 16 GB de VRAM, puede ejecutarse en estaciones de trabajo con RTX 4080/5080 o incluso en portátiles con GPU de gama alta, sin depender de servicios en la nube.
- Investigación en cuantización y optimización: el repositorio incluye scripts de reproducción (`pad_gguf.py`, `pad_imatrix.py`, `verify_pad.py`) que sirven como referencia para aplicar técnicas similares a otros modelos MoE con dimensiones no divisibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar en la model card. El único dato de rendimiento es el tamaño del archivo (13,37 GiB) y el hecho de que el modelo cabe completamente en una GPU de 16 GB con contexto completo de 262 K tokens, lo que sugiere un throughput razonable para una cuantización de 3,25 bits, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: 13,37 GiB para el archivo GGUF, más overhead de contexto y KV cache. Con `-ctk q4_0 -ctv q4_0` (cuantización de cache) cabe en una GPU de 16 GB con contexto completo de 262 144 tokens.
- GPU recomendadas: NVIDIA RTX 5080 (16 GB, compute capability 12.0) validada por el autor; también RTX 4090 (sm_89) o H100 (sm_90) ajustando `-DCMAKE_CUDA_ARCHITECTURES` en la compilación.
- No cabe en GPUs de 8 GB o menos; requiere al menos 16 GB de VRAM para el contexto máximo, aunque con contexto reducido podría ejecutarse en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp compilado desde el fork con el parche incluido (`nemotron-expert-padding.patch`), usando `llama-server` con los flags validados. No es compatible con vLLM, Ollama u otros runners que usen llama.cpp estándar sin el parche.
- Latencia y throughput: no disponibles. El autor solo indica que el modelo queda completamente residente en GPU con `-ngl 99`, pero no proporciona mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Tamaño archivo | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Nano-30B-A3B-pirola-IQ3_XXS (este) | 35,4 B | 3 B | 262 K | 13,37 GiB | nvidia-nemotron-open-model-license |
| Nemotron-3-Nano-30B-A3B (bartowski IQ2_XXS) | 35,4 B | 3 B | no disponible | 18,09 GB | nvidia-nemotron-open-model-license |
| Nemotron-3-Nano-30B-A3B (base BF16) | 35,4 B | 3 B | no disponible | ~70 GB | nvidia-nemotron-open-model-license |

La comparativa se limita a otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de modelos similares de otras familias (como Qwen3-30B-A3B o DeepSeek-V3-Lite). La principal diferencia es el tamaño: este archivo es un 26 % más pequeño que la mejor alternativa publicada (bartowski IQ2_XXS) y, según el autor, con mayor precisión efectiva (IQ3_XXS frente a IQ2_XXS). No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Requiere un fork de llama.cpp con el parche `nemotron-expert-padding.patch`; llama.cpp estándar rechaza el archivo con un error de forma. No se puede usar con herramientas que no apliquen el parche.
- La cuantización IQ3_XXS es de muy baja precisión (3,25 bits por peso), lo que puede degradar la calidad de generación en tareas que requieran razonamiento fino o matemáticas complejas, aunque el autor afirma que el padding no introduce pérdida adicional.
- Se ha detectado un bug en NVCC 13.2 que miscompila los kernels de i-quant (IQ1_s, IQ2_s, IQ3_s); se recomienda usar CUDA 13.0 o inferior para evitar salidas incorrectas.
- La licencia nvidia-nemotron-open-model-license tiene restricciones específicas de uso comercial; es necesario revisar los términos completos en el enlace proporcionado antes de desplegar en producción.
- El modelo base puede presentar sesgos inherentes a sus datos de entrenamiento, aunque no se documentan en este repositorio.
- Riesgo de alucinación en contextos largos o con prompts ambiguos, como es habitual en modelos de esta escala.
- El repositorio no incluye información sobre el proceso de entrenamiento del modelo base (datos, tokens, alineación), por lo que no se puede evaluar su robustez en dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pirola/Nemotron-3-Nano-30B-A3B-pirola-IQ3_XXS-GGUF
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Parche requerido (incluido en el repositorio): `nemotron-expert-padding.patch`
- Scripts de reproducción: `pad_gguf.py`, `pad_imatrix.py`, `verify_pad.py` (en el repositorio)
- Script de servidor validado: `serve-nemotron.sh` (en el repositorio)
