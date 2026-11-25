# nikolaus714/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini GGUF es una distribución cuantizada del modelo multimodal Inkling 2 Mini desarrollado por Thinking Machines. Se trata de un modelo de mezcla de expertos (MoE) con 26.400 millones de parámetros totales que incorpora una innovación arquitectónica poco habitual: las capas intermedias se ejecutan tres veces por token (denominada internamente `inkling2_loop`). El modelo acepta entradas de imagen y texto, lo que lo sitúa en la categoría image-text-to-text.

Esta ficha concreta, publicada por el usuario nikolaus714, ofrece dos cuantizaciones GGUF del modelo base (Q2_K de 10,86 GB y Q4_K_M de 17,48 GB) más un proyector de visión F16 independiente de 639 MB. El objetivo es permitir la ejecución del modelo en hardware de consumo mediante llama.cpp, algo imposible con los pesos originales en NVFP4/MXFP8.

La relevancia actual radica en que Thinking Machines apuesta por arquitecturas con cómputo recurrente en lugar de escalar únicamente el número de parámetros, y esta distribución facilita la evaluación práctica de dicha arquitectura en equipos locales con GPU NVIDIA. La licencia Apache 2.0 elimina restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con bucle en capas intermedias (`inkling2_loop`), transformer multimodal |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 4096`) |
| Tipos de cuantizacion | Q2_K (10,86 GB), Q4_K_M (17,48 GB); proyector de visión F16 (639 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); origen BF16 derivado de checkpoint mixto NVFP4/MXFP8 |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26,4B parámetros totales en el que las capas centrales se ejecutan tres veces por token, un esquema de cómputo recurrente que incrementa la profundidad efectiva sin aumentar el número de parámetros. Incorpora además un codificador de visión y proyector para entrada de imágenes, empaquetado por separado en el GGUF (`mmproj-Inkling-2-Mini-F16.gguf`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La cadena de cuantización es relevante para evaluar la fidelidad de estos pesos: los GGUF de este repositorio se generaron con `llama-quantize` a partir del BF16 publicado por ggml-org (revisión `db61c5b492a6a034d986328d28274af0a439aa6c`), que a su vez es un upcast del checkpoint original mixto NVFP4/MXFP8, no una versión en precisión completa. Se usaron presets estándar sin matriz de importancia; Q2_K mantiene algunos tensores en mayor precisión, con 24 tensores que requirieron cuantización de respaldo. El proyector F16 proviene de InterpreticAI (revisión `0aba1d7193f6bf28fd24c68b0628166f7e2ddbe8`) y no fue generado por el proceso de cuantización del modelo de lenguaje.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text).
- Razonamiento y respuesta a instrucciones mediante plantilla Jinja (`--jinja` en llama.cpp).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su exposición como API.
- Soporte de tool calling: no validado en esta distribución según el autor.
- Capacidades de agente y razonamiento multi-paso: no validadas en esta distribución.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente visual local: desplegar el modelo con `llama-server` y el proyector F16 para responder preguntas sobre capturas de pantalla, diagramas o fotografías sin enviar datos a la nube, usando Q4_K_M en una GPU de 24 GB con offload parcial.
- Procesamiento de documentos con imágenes: extraer información de facturas, gráficos o formularios escaneados combinando entrada visual y contexto textual en una única llamada.
- Prototipado de agentes con tool calling: aunque no validado, la plantilla Jinja y la compatibilidad con endpoints permiten experimentar con function calling en un servidor OpenAI-compatible local antes de migrar a producción.
- Evaluación de arquitecturas recurrentes: investigadores pueden comparar el comportamiento de las capas con bucle triple frente a transformers convencionales del mismo tamaño usando las cuantizaciones Q2_K y Q4_K_M como referencia de coste-calidad.
- Despliegue en estaciones de trabajo con GPU de consumo: Q2_K (10,86 GB) más el proyector permite intentar carga completa en GPUs de 16 GB, con la advertencia de que el autor no garantiza el offload total.
- Chat multimodal conversacional: servir una interfaz web local en `http://127.0.0.1:8080` con llama.cpp para conversaciones que alternan texto e imágenes adjuntas.
- Integración en pipelines de CI/CD para pruebas de regresión multimodal: usar el servidor local como endpoint determinista en tests de aplicaciones que consumen modelos vision-language.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la calidad de texto, la inferencia de imagen, el tool calling y el rendimiento no han sido validados para estas subidas, y que la calidad de Q2_K no ha sido medida.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere 17,48 GB solo para los pesos del lenguaje, más el proyector F16 (639 MB), contexto KV y overhead del runtime; Q2_K parte de 10,86 GB con las mismas adiciones.
- GPU recomendadas: el autor cita una RTX 4070 de 12 GB como insuficiente para cargar Q4_K_M completo en VRAM; se necesita offload parcial a RAM del sistema. Para carga completa de Q4_K_M se requiere al menos una GPU de 24 GB (RTX 4090, A100 40 GB, H100).
- GPU de consumo: Q2_K más proyector puede intentar caber en 16 GB, pero el autor advierte que el offload total no está garantizado y recomienda reducir `-ngl` si es necesario.
- Opciones de despliegue: llama.cpp (build b12612 o posterior con soporte `inkling2_loop`), con binarios CUDA 12 para Windows; Ollama 0.40.17 solo soporta el modelo en Apple Silicon y en Windows devuelve `unknown model architecture: inkling2_loop`; vLLM y TGI no están mencionados como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini (esta ficha) | 26,4B MoE con bucle triple | no disponible | Apache 2.0 | GGUF Q2_K/Q4_K_M | Visión integrada, requiere llama.cpp reciente |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B MoE | no disponible | Apache 2.0 | NVFP4/MXFP8 original | Pesos de referencia sin cuantizar |
| ggml-org/Inkling-2-Mini-GGUF | 26,4B MoE | no disponible | Apache 2.0 | GGUF BF16 | Upcast del checkpoint original, mayor tamaño |
| InterpreticAI/Inkling-2-Mini-GGUF | 26,4B MoE | no disponible | Apache 2.0 | GGUF | Origen del proyector F16 usado aquí |

No se dispone de datos de benchmark para establecer comparaciones de rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Los pesos GGUF derivan de un upcast BF16 de un checkpoint mixto NVFP4/MXFP8, no de precisión completa; la fidelidad respecto al modelo original es limitada por construcción.
- Q2_K usa presets sin matriz de importancia y 24 tensores con cuantización de respaldo; su calidad no ha sido medida y el autor advierte de mayor pérdida.
- Ninguna capacidad (texto, imagen, tool calling, rendimiento) ha sido validada en esta distribución; úsese con cautela en producción.
- Ollama en Windows no soporta la arquitectura `inkling2_loop` en la versión 0.40.17; solo Apple Silicon está soportado en esa release.
- Se requiere un build de llama.cpp con soporte `inkling2_loop` (b12612 verificado); versiones anteriores fallarán al cargar el modelo.
- El contexto de ejemplo es de 4096 tokens y no se documenta la longitud máxima soportada; contextos mayores incrementan el consumo de memoria.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, cuya model card debe consultarse.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor remite a la model card original para usos previstos y limitaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nikolaus714/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF BF16 de ggml-org: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Proyector de visión (InterpreticAI): https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF
- Release de llama.cpp b12612: https://github.com/ggml-org/llama.cpp/releases/tag/b12612
- Notas de Ollama 0.40.17: https://github.com/ollama/ollama/releases/tag/v0.40.17
