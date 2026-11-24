# BennyDaBall/Qwopus3.8-27B-Flash-NVFP4

## Resumen

Qwopus3.8-27B-Flash-NVFP4 es una cuantización nativa en formato NVFP4 del modelo Jackrong/Qwopus3.8-27B-Flash, publicada por el usuario BennyDaBall. Se trata de un fine-tune de la familia Qwen3.8/Qwen3.5 con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), pensado para ejecutarse en GPUs Blackwell con soporte de tensores de tipo 40 (`nvfp4`) en llama.cpp. El objetivo es ofrecer un modelo local de código y agentes rápido en una única RTX 5090 de 32 GB, conservando la cabeza especulativa MTP y el proyector de visión.

La relevancia de esta ficha radica en que no es una recuantización de otro GGUF, sino una conversión directa desde el checkpoint BF16 fijado, con un mapa de precisión explícito de 866 tensores y una matriz de importancia de 200 fragmentos. Mantiene el backbone de texto denso en NVFP4, pero conserva en BF16 la salida, los embeddings, las matrices grandes del MTP y el proyector visual, lo que permite decodificación especulativa integrada (`--spec-type draft-mtp`) sin modelo borrador externo.

El modelo soporta 262.144 tokens de contexto nativo, entrada de imágenes mediante un `mmproj` BF16 y una plantilla de chat compatible con tool calling, mensajes de sistema posteriores y contenido de razonamiento preservado. Está publicado con licencia Apache 2.0 y cubre inglés, chino, español, ruso y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas de atención, Gated DeltaNet y MLP; 64 capas de texto más una capa MTP embebida (65 bloques en el GGUF) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; el perfil de visión recomienda 131.072 |
| Tipos de cuantizacion | NVFP4 (tipo GGML 40) en backbone; BF16 en salida, embeddings y matrices grandes del MTP; F32 en estado pequeño, convolución, bias, norm y scale |
| Idiomas soportados | Inglés, chino, español, ruso, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto: 18,34 GiB; proyector visual BF16: 0,87 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3 B parámetros con 64 capas de texto que combinan mecanismos de atención, capas Gated DeltaNet y bloques MLP. Sobre ese backbone se añade una capa NextN/MTP (multi-token prediction) embebida como bloque 64 del GGUF, que actúa como cabeza especulativa interna. La cuantización NVFP4 se aplica a las matrices grandes de atención, Gated DeltaNet y MLP en las 64 capas de texto, mientras que la salida, los embeddings y las matrices grandes del MTP se mantienen en BF16 para preservar calidad en los puntos críticos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card del autor de la cuantización indica explícitamente que no hay reentrenamiento ni destilación: es una conversión desde el checkpoint BF16 fijado, con una matriz de importancia de 200 fragmentos (`Qwen3.8-27B-NVFP4-imatrix.dat`) y una receta de precisión de 866 tensores. La innovación técnica destacable es la conservación del MTP a alta precisión para permitir decodificación especulativa autocontenida en llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo de hasta 262.144 tokens.
- Generación de código y razonamiento técnico, orientado a tareas de programación y agentes.
- Tool calling y function calling, con plantilla de chat que soporta llamadas a herramientas.
- Uso agéntico y razonamiento multi-paso, con modo de razonamiento configurable (`--reasoning-effort xhigh`) y preservación del contenido de razonamiento.
- Entrada de imágenes (image-text-to-text) mediante el proyector visual BF16 `mmproj`.
- Decodificación especulativa integrada mediante la cabeza MTP (`--spec-type draft-mtp`), sin modelo borrador externo.
- Capacidades multilingües en inglés, chino, español, ruso y japonés.
- Soporte de mensajes de sistema y developer fusionados, mensajes de sistema posteriores y contenido multimodal en la plantilla de chat.

## Casos de uso

- Asistente de código local en una RTX 5090: el modelo cabe en 18,34 GiB de pesos NVFP4 y puede ejecutarse con llama.cpp o LM Studio para autocompletado, refactorización y explicación de código, con decodificación especulativa MTP que reduce la latencia por token.
- Agentes autónomos con tool calling: la plantilla incluye soporte de function calling y mensajes de sistema/developer, lo que permite integrar el modelo en bucles de agente que consultan APIs, ejecutan comandos y encadenan pasos de razonamiento.
- Análisis de documentos técnicos con imágenes: usando el `mmproj` BF16 y 131.072 tokens de contexto, se pueden procesar diagramas, capturas de pantalla y documentación escaneada junto con texto largo en una sola sesión.
- Atención al cliente multilingüe: el soporte de inglés, chino, español, ruso y japonés permite gestionar conversaciones multi-turno con contexto extenso y respuestas coherentes en el idioma del usuario.
- Automatización de pipelines de CI/CD: el modelo puede revisar diffs, generar parches y resumir errores de compilación, integrándose mediante llama-server con la API compatible de endpoints.
- Prototipado rápido en LM Studio: al incluir plantilla de chat embebida y archivo `chat_template.jinja`, se puede cargar el GGUF directamente en LM Studio para pruebas de razonamiento y visión sin configuración adicional.
- Investigación sobre cuantización NVFP4: el paquete incluye `BUILD-MANIFEST.json`, receta de tipos de tensor y sumas SHA-256, lo que facilita reproducir y auditar el proceso de cuantización en GPUs Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,34 GiB para el GGUF de texto en NVFP4; 0,87 GiB adicionales para el proyector visual BF16 si se usa visión. La caché KV en Q8_0 es el equilibrio probado por el autor.
- GPU recomendadas: una RTX 5090 de 32 GB (`sm_120`) es el objetivo de validación. Otras tarjetas Blackwell pueden funcionar, pero no fueron el objetivo de validación.
- Cabe en GPU consumer: sí, en RTX 5090 de 32 GB. No se garantiza en GPUs con menos VRAM ni en arquitecturas anteriores sin kernels NVFP4.
- Opciones de despliegue: llama.cpp (build reciente con soporte `qwen35`, kernels CUDA NVFP4, multimodal y ruta `draft-mtp`) y LM Studio. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no se proporcionan cifras concretas. El autor indica que el modelo está pensado para ser rápido en una 5090 con decodificación especulativa MTP y `--spec-draft-n-max 3`, pero no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Flash-NVFP4 | 27,3 B | 262.144 | Apache 2.0 | GGUF NVFP4 | Cuantización NVFP4 con MTP y visión; requiere Blackwell |
| Jackrong/Qwopus3.8-27B-Flash (base) | 27,3 B | no disponible | Apache 2.0 | BF16 (51,8 GiB) | Checkpoint original sin cuantizar |
| Modelos Qwen3.8 de 27 B en GGUF Q4/Q8 | ~27 B | no disponible | Apache 2.0 | GGUF | Sin MTP embebido ni NVFP4 nativo; compatibles con llama.cpp estándar |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El soporte NVFP4 es específico del runtime: versiones antiguas de llama.cpp o LM Studio pueden fallar al cargar tensores de tipo 40 aunque soporten GGUF Qwen3.8 convencionales.
- El modelo está validado en una RTX 5090 de 32 GB; otras GPUs Blackwell no fueron probadas y pueden presentar problemas de kernels o memoria.
- El perfil de visión reduce el contexto a 131.072 tokens para dejar margen a la codificación de imágenes en 32 GB; no todas las longitudes de prompt caben en todos los estados de escritorio.
- No se dispone de información sobre sesgos conocidos, tasa de alucinación ni evaluación de seguridad del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia y condiciones del modelo base Jackrong/Qwopus3.8-27B-Flash antes de desplegarlo en producción.
- El modelo es denso, no MoE, por lo que el coste de inferencia por token es el de un modelo de 27 B completo, sin activaciones dispersas.
- La información sobre datos de entrenamiento, composición del dataset y ajuste por RLHF/DPO no está disponible, lo que limita la evaluación de su comportamiento en dominios especializados.

## Enlaces

- Hugging Face: https://huggingface.co/BennyDaBall/Qwopus3.8-27B-Flash-NVFP4
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
