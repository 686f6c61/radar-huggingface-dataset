# moravianai/ThinCtx-Qwen3.5-2B

## Resumen

ThinCtx-Qwen3.5-2B es una conversión del modelo Qwen3.5-2B de Alibaba Qwen, publicada por Moravian AI, que sustituye el mecanismo de caché KV estándar por un almacenamiento de contexto que crece mucho más despacio en la GPU. El objetivo es habilitar conversaciones y documentos de cientos de miles de tokens en hardware modesto: según la model card, el contexto ocupa 0,39 GB de VRAM a 540k tokens frente a los 6,2 GB del modelo base, un crecimiento aproximadamente 19 veces más lento, mientras el resto del contexto se guarda en memoria de sistema.

El modelo conserva los pesos en 16 bits del original (1.881.825.088 parámetros, unos 1,88 mil millones) y se ejecuta exclusivamente sobre el runtime propietario `thinctx`, que es el que implementa la gestión de memoria reducida. La precisión declarada es prácticamente idéntica a la del base: 72,8 % de media frente a 72,4 % en BABILong, RULER (4k, 16k y 64k tokens) y BFCL non-live.

Es relevante porque ataca uno de los cuellos de botella prácticos de los modelos de contexto largo: el coste cuadrático en memoria del KV cache. La contrapartida es una lectura de prompts largos más lenta que el modelo base y una dependencia total de un runtime con licencia PolyForm Small Business 1.0.0, que restringe el uso comercial en organizaciones grandes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tipo `qwen3_5_text`), con gestión de contexto ThinCtx |
| Parámetros totales | 1.881.825.088 (≈1,88 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 540k tokens documentados en las mediciones de memoria; límite máximo no especificado |
| Tipos de cuantización | pesos en 16 bits en esta variante; variante `-small` con pesos a ~6,4 bits por peso; contexto comprimido 2,5–3× opcional vía `--compress_context` |
| Idiomas soportados | multilingüe, con inglés (en), checo (cs) y alemán (de) declarados |
| Licencia | PolyForm Small Business 1.0.0 (`license: other`) |
| Formato de pesos | safetensors |
| Runtime requerido | thinctx >= 0.2.0 (>= 1.0.2 para contexto comprimido; >= 1.0.1 recomendado) |
| Modelo base | Qwen/Qwen3.5-2B |
| Tamaño del repositorio | 4,1 GB |
| Plataformas | Linux x86_64 y Windows 10/11 vía WSL2 con GPU NVIDIA; macOS no soportado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de aproximadamente 1,88 mil millones de parámetros, y no modifica los pesos: la conversión ThinCtx actúa sobre la forma en que se almacena y recupera el contexto. La parte del contexto que permanece en GPU es pequeña y crece lentamente con la longitud de la conversación o del documento, mientras que el contexto completo se mantiene en memoria de sistema ordinaria. A 540k tokens el contexto en RAM de sistema ocupa 7,4 GB en modo de 16 bits y 2,9 GB con `--compress_context`.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni si la conversión ThinCtx implica algún tipo de ajuste adicional más allá del cambio de runtime. La innovación técnica destacable es precisamente esa gestión de memoria del contexto, junto con el almacenamiento comprimido opcional (2,5–3× menor) que el runtime descarga desde la variante `-small` sin cambiar los pesos de este modelo. El chat y el tool calling utilizan la plantilla de chat de Qwen3.5.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat de Qwen3.5.
- Razonamiento sobre contextos muy largos: documentos y conversaciones de hasta 540k tokens con memoria GPU reducida.
- Tool calling / function calling, validado en la model card con BFCL non-live.
- Modo de pensamiento (`enable_thinking`) expuesto a través del servidor compatible con OpenAI.
- Capacidades multilingües, con soporte declarado de inglés, checo y alemán además del multilingüe genérico.
- Servido mediante API compatible con OpenAI chat-completions (`/v1/chat/completions`), con streaming y no streaming, y autenticación básica HTTP opcional.
- Compresión opcional del contexto almacenado en RAM (`--compress_context`) con una penalización de velocidad de generación de aproximadamente el 5 %.

## Casos de uso

- Análisis de documentos extensos: procesar contratos, informes o expedientes de cientos de miles de tokens manteniendo el contexto completo en RAM de sistema y una huella de VRAM reducida (0,39 GB a 540k tokens), lo que permite usar GPU de gama media.
- Asistentes conversacionales de larga duración: sesiones multi-turno que no se degradan por el coste de memoria del KV cache, con el contexto histórico almacenado fuera de la GPU.
- Atención al cliente automatizada: despliegue del servidor compatible con OpenAI (`thinctx serve`) detrás de un cliente estándar, con historial largo por cliente y autenticación básica HTTP.
- Agentes con tool calling: integración en pipelines que requieren function calling (validado en BFCL non-live) y modo de pensamiento para razonamiento multi-paso.
- Procesamiento de corpus en checo y alemán: tareas de resumen, extracción o clasificación sobre textos en los idiomas declarados, con contexto largo por documento.
- Investigación y evaluación: uso libre para investigación no comercial y evaluación, útil para estudiar el comportamiento de modelos pequeños en tareas de contexto largo (BABILong, RULER).
- Despliegue en estaciones de trabajo con WSL2: ejecución en Windows 10/11 mediante WSL2 con GPU NVIDIA, sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

Los datos publicados comparan ThinCtx-Qwen3.5-2B con el Qwen3.5-2B sin modificar sobre los mismos ítems. La media agregada es de 72,8 % para ThinCtx frente a 72,4 % para el base, en BABILong, RULER (4k, 16k y 64k tokens) y BFCL non-live. La model card no desglosa en la información disponible los resultados por benchmark individual.

| Métrica | ThinCtx-Qwen3.5-2B | Qwen3.5-2B (base) |
|---|---|---|
| Media BABILong + RULER (4k/16k/64k) + BFCL non-live | 72,8 % | 72,4 % |
| Memoria GPU de contexto a 540k tokens | 0,39 GB | 6,2 GB |
| Contexto en RAM de sistema a 540k tokens (16 bits) | 7,4 GB | no aplica |
| Contexto en RAM de sistema a 540k tokens (`--compress_context`) | 2,9 GB | no aplica |
| Velocidad de generación con contexto comprimido | ~5 % más lenta que con contexto de 16 bits | no disponible |

No se han publicado en la información disponible resultados desglosados de MMLU, HumanEval, GSM8K ni de latencia/throughput absolutos.

## Requisitos de hardware

- GPU NVIDIA obligatoria; macOS no está soportado. Linux x86_64 o Windows 10/11 mediante WSL2.
- Pesos en 16 bits: el repositorio ocupa 4,1 GB, por lo que se necesita al menos esa cantidad de VRAM para los pesos, más el contexto en GPU (0,39 GB a 540k tokens).
- Contexto completo en RAM de sistema: 7,4 GB a 540k tokens en modo de 16 bits; 2,9 GB con `--compress_context`.
- La variante `-small` reduce requisitos (pesos a ~6,4 bits y contexto comprimido 2,5–3×) para entornos más ajustados.
- El wheel por defecto de PyTorch 2.11 requiere un driver con soporte CUDA 13; con drivers anteriores hay que instalar `torch==2.11.*` desde el índice `cu128`.
- Triton compila un pequeño launcher en el primer arranque y necesita gcc (`build-essential` en Debian/Ubuntu).
- Opciones de despliegue: únicamente el runtime `thinctx` (CLI `thinctx chat`, servidor `thinctx serve` compatible con OpenAI, y API Python `thinctx.load`). No es compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- En WSL2 se recomienda `autoMemoryReclaim=dropcache` en `.wslconfig`; el uso compartido de memoria entre conversaciones es solo nativo en Linux.
- Latencia y throughput absolutos: no disponibles. La model card solo indica que la lectura de prompts largos es más lenta que en el modelo base y que la generación con contexto comprimido es ~5 % más lenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de memoria | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-2B | ≈1,88 B | hasta 540k documentados | Contexto en RAM de sistema, 0,39 GB GPU a 540k | PolyForm Small Business 1.0.0 | thinctx (exclusivo) |
| Qwen3.5-2B (base) | ≈1,88 B | no disponible | KV cache estándar, 6,2 GB GPU a 540k | según Qwen | ecosistema estándar (no confirmado en la información) |
| ThinCtx-Qwen3.5-2B-small | ≈1,88 B | hasta 540k documentados | Pesos ~6,4 bits + contexto comprimido 2,5–3× | PolyForm Small Business 1.0.0 | thinctx |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (contexto largo en ~2B) para ampliar la comparativa.

## Limitaciones y advertencias

- Dependencia total del runtime `thinctx`: otros motores de inferencia no aplican la gestión de memoria reducida con estos pesos, por lo que no es portable a vLLM, llama.cpp u Ollama.
- Solo Linux x86_64 y Windows vía WSL2 con GPU NVIDIA; macOS no está soportado.
- La lectura de prompts largos es más lenta que en el modelo base, lo que penaliza casos de uso con prompts masivos y poca generación.
- Licencia PolyForm Small Business 1.0.0: gratuita para pequeñas empresas, uso personal, investigación no comercial, educación y evaluación; las organizaciones grandes en producción necesitan licencia comercial (contacto info@moravian.ai).
- El acceso al modelo está sujeto a un formulario (gated): nombre, empresa y correo de trabajo.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de ~1,88 B, cabe esperar menor robustez que modelos de mayor tamaño en razonamiento complejo.
- Idiomas declarados limitados a multilingüe, inglés, checo y alemán; el rendimiento fuera de esos idiomas no está documentado.
- El límite máximo de contexto no se especifica; las mediciones llegan a 540k tokens.
- En WSL2 no hay uso compartido de memoria entre conversaciones y la caché de ficheros consume RAM de Windows si no se configura `autoMemoryReclaim=dropcache`.
- No hay resultados publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-2B
- Variante cuantizada: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-2B-small
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio del desarrollador: https://moravian.ai/
- Contacto para licencia comercial: info@moravian.ai
- Runtime thinctx: instalación vía `uv pip install "thinctx>=1.0.2"` (no se proporciona URL de repositorio en la información disponible)
