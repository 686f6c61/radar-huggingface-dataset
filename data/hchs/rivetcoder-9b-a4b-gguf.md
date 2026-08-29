# HCHs/RivetCoder-9B-A4B-GGUF

## Resumen

RivetCoder-9B-A4B es un modelo de generación de código y texto desarrollado por HCHs, distribuido como cuantizaciones GGUF (Q8_0 y Q4_K_M) del checkpoint original en BF16. Se trata de un modelo con arquitectura híbrida que combina capas densas tipo LFM con un sidecar de mezcla de expertos (MoE) sparse: 30 capas host, cada una con una FFN densa y 16 expertos candidatos de los que se activan 4 por token. El modelo declara 8.738.041.372 parámetros totales (aproximadamente 9B) y 4B activos, con una ventana de contexto de 131.072 tokens (128K). Está orientado a tareas de programación y razonamiento, con soporte para modo de pensamiento (thinking) y API compatible con OpenAI.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en hardware de consumo (GPU con 16 GB de VRAM) mediante un runtime de llama.cpp modificado, ya que la arquitectura `rivetcoder` no está soportada en las builds estándar de llama.cpp, LM Studio u Ollama. El autor proporciona un bundle para Windows CUDA (RTX 50 series) y un overlay de código fuente para recompilar en otras plataformas. No se publican benchmarks de calidad (HumanEval, MBPP, etc.), solo mediciones de velocidad de inferencia en pruebas de humo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RivetCoder (custom, híbrida dense + MoE sparse) |
| Parametros totales | 8.738.041.372 (9B) |
| Parametros activos | 4B (4 expertos activos por token) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q8_0, Q4_K_M |
| Idiomas soportados | en, ko |
| Licencia | LFM Open License v1.0 (other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura `rivetcoder` es una modificación de la familia LFM. Cada una de las 30 capas host mantiene una FFN densa nativa y añade un sidecar sparse con 16 expertos candidatos por capa, de los cuales se seleccionan 4 mediante routing sigmoid Top-4. El flujo por capa es: `output = hidden + dense + effective_scale * gate * experts`, donde `gate` es una compuerta de token con sigmoid y `effective_scale` es un valor residual escalado (0.1 * tanh(raw_scale)) que se almacena en F32 en el GGUF. El grafo conserva además la corrección post-sigmoid, pesos de routing normalizados sin corregir, clamps en gate/up de los expertos, 22 capas ShortConv y 8 capas de atención completa.

El modelo base fue entrenado por HCHs, pero no se proporcionan detalles sobre el dataset, número de tokens, o método de alineación (RLHF/DPO). Los pesos de los expertos provienen de `zai-org/GLM-5.3-Flash` (licencia MIT), mientras que el modelo completo está sujeto a la LFM Open License v1.0. Esta versión GGUF es una cuantización directa del checkpoint BF16, no del FP8, y no implica un reentrenamiento.

## Capacidades

- Generación de código y texto en inglés y coreano.
- Razonamiento con modo de pensamiento (thinking) activable mediante `--reasoning-budget` en llama-server; el template de chat abre una sección de pensamiento por defecto.
- Conversación multi-turno con API compatible con OpenAI (endpoint `/v1/chat/completions`).
- Soporte de contexto largo (128K declarado, aunque solo probado hasta 4K en las pruebas de humo).
- Ejecución local en GPU con cuantizaciones Q8_0 y Q4_K_M.
- No se documenta soporte explícito de tool calling, visión, audio u otras modalidades.

## Casos de uso

- Asistente de programación en entornos locales: el modelo puede generar, explicar y depurar código en inglés o coreano, con la ventaja de un contexto de 128K para mantener el historial completo de una sesión de desarrollo.
- Refactorización de código en repositorios grandes: gracias a la ventana de contexto amplia, puede procesar múltiples archivos o funciones extensas en una sola pasada, ayudando a identificar dependencias y proponer cambios coherentes.
- Generación de documentación técnica: a partir de código fuente, puede redactar comentarios, docstrings o guías de uso, aprovechando su capacidad de razonamiento y su entrenamiento en código.
- Autocompletado y finalización de código en editores: integrable como backend local vía llama-server, con baja latencia en GPU consumer (por ejemplo, ~170 tok/s en Q4_K_M en una RTX 5070 Ti).
- Chat de soporte técnico especializado en programación: el modo de pensamiento permite respuestas razonadas paso a paso, útil para explicar algoritmos o resolver problemas de lógica.
- Prototipado rápido de scripts y utilidades: con la cuantización Q4_K_M (5.3 GB) cabe en GPUs de 8-16 GB, permitiendo iterar sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (HumanEval, MBPP, SWE-bench, etc.) en la información disponible. La model card indica explícitamente que no se hace ninguna afirmación sobre rendimiento en tareas de código.

Las únicas mediciones disponibles son pruebas de humo (smoke tests) de velocidad de inferencia en una RTX 5070 Ti 16GB, con contexto de 512 tokens y full GPU offload:

| Quant | Prompt (tok/s) | Generation (tok/s) |
|---|---|---|
| Q8_0 | 134.9 | 130.1 |
| Q4_K_M | 127.9 | 170.1 |

Estos valores son informales y no constituyen un benchmark controlado.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 9.296.262.848 bytes (~9.3 GB) y el Q4_K_M 5.318.260.416 bytes (~5.3 GB). Con overhead de runtime, se recomienda al menos 12 GB para Q8_0 y 8 GB para Q4_K_M.
- GPU recomendada: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM. Probado en RTX 5070 Ti 16GB con full offload.
- Compatibilidad con consumer GPUs: sí, cabe en tarjetas como RTX 3060 12GB, RTX 4070, RTX 5070, etc., siempre que se use el runtime personalizado.
- Opciones de despliegue: exclusivamente llama.cpp modificado (llama-server, llama-cli) incluido en el bundle de Windows o compilado desde el overlay de código fuente. No compatible con builds estándar de llama.cpp, LM Studio u Ollama.
- Latencia y throughput: en las pruebas de humo, ~130-170 tok/s en generación con Q8_0/Q4_K_M en RTX 5070 Ti. No hay datos para otros hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, DeepSeek-Coder, CodeLlama, Qwen-Coder) en la información proporcionada. La arquitectura personalizada y la falta de benchmarks publicados impiden una comparación cuantitativa fiable. Se puede señalar que, por tamaño (9B totales, 4B activos) y enfoque en código, compite con modelos de ~7-9B, pero sin métricas objetivas no es posible establecer una tabla comparativa.

## Limitaciones y advertencias

- Requiere un runtime de llama.cpp modificado; las herramientas estándar (llama.cpp oficial, LM Studio, Ollama) no pueden cargar estos archivos GGUF. Renombrar la arquitectura a `lfm2` no funciona porque omitiría el sidecar de expertos.
- El contexto de 128K está declarado en los metadatos, pero solo se probó con 512 y 4.096 tokens; el uso a longitudes largas puede encontrar problemas de memoria o degradación de calidad no verificados.
- No se han publicado evaluaciones de calidad en tareas de código; el autor no hace afirmaciones sobre HumanEval, MBPP u otros benchmarks.
- La licencia LFM Open License v1.0 incluye condiciones para uso comercial; es necesario leer el texto completo antes de desplegar en producción.
- Los pesos de los expertos derivan de GLM-5.3-Flash (MIT), pero el modelo completo no es MIT; la atribución y las restricciones de la licencia principal se aplican.
- No se documentan sesgos específicos, pero al ser un modelo entrenado principalmente en inglés y coreano, su rendimiento en otros idiomas puede ser limitado.
- El modo de pensamiento por defecto puede consumir todo el presupuesto de tokens de salida si no se limita con `--reasoning-budget`; hay que configurarlo explícitamente para obtener respuestas directas.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/HCHs/RivetCoder-9B-A4B-GGUF
- Modelo base (BF16): https://huggingface.co/HCHs/RivetCoder-9B-A4B
- Licencia LFM Open License v1.0: https://huggingface.co/HCHs/RivetCoder-9B-A4B-GGUF/blob/main/LICENSE
- Ficha en LLM Explorer: https://llm-explorer.com/model/HCHs%2FRivetCoder-9B-A4B,5uQDL9o7TiDsA7PXdyzR3O
