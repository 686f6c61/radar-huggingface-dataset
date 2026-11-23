# litert-community/InternVL3-1B

## Resumen

InternVL3-1B en formato LiteRT-LM es la conversión del modelo visión-lenguaje InternVL3-1B de OpenGVLab al formato `.litertlm`, empaquetado por la comunidad litert-community para inferencia local en dispositivos (on-device) mediante el runtime LiteRT-LM de Google. El modelo combina un codificador visual InternViT-300M con un decodificador de lenguaje Qwen2.5-0.5B, unidos por un proyector MLP con pixel-shuffle, y constituye el miembro más pequeño de la familia InternVL3, con un peso de fichero de aproximadamente 739 MB.

La relevancia de esta ficha reside en su orientación a entornos de borde: elimina la dependencia de la nube para tareas de imagen-texto, funciona completamente offline y está cuantizado de forma agresiva (int8 para visión e int4 para el decodificador) sin reentrenar los pesos. Es una opción realista para aplicaciones móviles, sistemas embebidos y prototipos de asistentes visuales donde el coste por inferencia y la privacidad son críticos.

El modelo base procede de OpenGVLab/InternVL3-1B y se distribuye bajo licencia Apache 2.0. La versión LiteRT-LM mantiene la arquitectura y los pesos del original, pero reescribe el grafo de prefill y decode para aprovechar la GPU en dispositivos compatibles, con métricas declaradas de hasta 111,9 tokens/s en decode y 1.941 tokens/s en prefill sobre un Galaxy S26.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer: codificador InternViT-300M + pixel-shuffle + proyector MLP + decodificador Qwen2.5-0.5B |
| Parametros totales | no disponible (peso del fichero ~739 MB; decodificador de 0,5B y codificador visual de 300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (cache KV) |
| Tipos de cuantizacion | Vision encoder int8; decodificador int4 simetrico con blockwise-32 + OCTAV; embedding de entrada int8 externalizado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en OpenGVLab/InternVL3-1B |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de InternVL3: un codificador visual InternViT de 300M parámetros procesa una única imagen de 448×448 píxeles, con normalización ImageNet integrada en el propio codificador. La salida pasa por una operación de pixel-shuffle y un proyector MLP que la transforma en 256 tokens visuales, que se concatenan con el texto de entrada al decodificador Qwen2.5-0.5B (896 dimensiones, 24 capas). El codificador visual está implementado con tensores 4D exclusivamente y cuantizado a int8; el decodificador usa pesos int4 simétricos con cuantización por bloques de 32 y la técnica OCTAV, mientras que el embedding de entrada se externaliza en int8.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La conversión a LiteRT-LM no modifica ningún peso: solo reescribe el grafo de prefill y decode para GPU, según indica la model card. El fichero actual (desde el 15 de noviembre de 2026) sustituye a una versión anterior con el mismo contenido de pesos pero distinto grafo de ejecución.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de escenas, respuesta a preguntas visuales y grounding básico sobre una única imagen.
- Comprensión de una imagen por consulta, redimensionada internamente a 448×448 y codificada en 256 tokens visuales.
- Conversación multi-turno dentro de una ventana de contexto de 2048 tokens.
- Ejecución completamente offline en dispositivo, sin llamadas a servicios externos.
- API local compatible con OpenAI mediante `litert-lm serve`.
- Procesamiento de varias imágenes mediante múltiples `--attachment` (con limitaciones conocidas, según la model card).
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo thinking en la información disponible.

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el modelo cabe en ~739 MB y responde en local, por lo que puede etiquetar fotos o generar texto alternativo sin subir imágenes a un servidor, con TTFT declarado de 150 ms en GPU de Galaxy S26.
- Asistencia visual para accesibilidad: un usuario invidente puede fotografiar su entorno y obtener una descripción en una frase; el modelo funciona offline y con latencia de decodificación de ~112 tokens/s en GPU móvil, adecuada para respuestas cortas en tiempo real.
- Moderación y filtrado de contenido visual en el borde: clasificación o descripción de imágenes en dispositivos sin conectividad, integrable en pipelines locales mediante la API compatible con OpenAI de `litert-lm serve`.
- Prototipado rápido de asistentes visuales: desarrolladores que necesitan validar una idea de VLM sin infraestructura GPU pueden ejecutar el modelo con `pip install litert-lm` y un único comando sobre CPU o GPU de portátil.
- Procesamiento de documentos escaneados simples: preguntas sobre capturas o fotos de documentos dentro del límite de 2048 tokens de contexto y una imagen por consulta, útil en aplicaciones de campo sin red.
- Educación y demos interactivas: chatbots visuales locales para talleres o entornos sin internet, donde la licencia Apache 2.0 permite redistribución y modificación sin restricciones comerciales.
- Investigación en eficiencia de VLMs: referencia reproducible para estudiar cuantización int4/int8 y delegación de operadores en GPUs móviles, con métricas públicas de prefill, decode y TTFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de rendimiento en dispositivo:

| Metrica | Galaxy S26 GPU (LiteRT-LM 0.19.0) | Galaxy S26 CPU (LiteRT-LM 0.16.0) |
|---|---|---|
| Decode | 111,9 tok/s | 81,7 tok/s |
| Prefill | 1.941 tok/s (1.024 tokens) | 359 tok/s |
| TTFT | no disponible para esta version | 680 ms |

Datos adicionales de una versión anterior del fichero (edge-compat): GPU con decode 85,4 tok/s, prefill 1.456 tok/s, TTFT 150 ms y 1.063 operadores delegados; CPU con decode 81,7 tok/s, prefill 359 tok/s y TTFT 680 ms.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa ~739 MB; en ejecución hay que sumar la cache KV para 2048 tokens, por lo que un dispositivo con 2 GB de memoria libre es suficiente en la práctica.
- GPU recomendadas: no requiere GPU de datacenter; está diseñado para GPUs integradas móviles (probado en Galaxy S26) y GPUs de portátil. En Mac, la ejecución con `--backend gpu --vision-backend gpu` falla por operadores BROADCAST_TO y GATHER_ND no soportados por el delegado GPU del codificador visual.
- Cabe en cualquier GPU de consumo e incluso en móviles de gama alta; no necesita A100 ni H100.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`, `litert-lm serve` con API compatible con OpenAI). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 150-680 ms según backend; decode de 81,7-111,9 tok/s; prefill de 359-1.941 tok/s según backend y versión del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| InternVL3-1B (LiteRT-LM) | ~0,8B (0,5B decodificador + 300M vision) | 2048 | `.litertlm`, LiteRT-LM | Apache 2.0 | Enfoque on-device, cuantización int4/int8 |
| InternVL3-2B (LiteRT-LM) | ~2B | no disponible | `.litertlm`, LiteRT-LM | Apache 2.0 | Versión mayor de la misma familia, referenciada en la model card |
| OpenGVLab/InternVL3-1B | ~0,8B | no disponible | safetensors, frameworks estándar | Apache 2.0 | Modelo base sin cuantizar; requiere más memoria |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Una sola imagen por consulta en el flujo principal; el soporte de múltiples `--attachment` tiene limitaciones conocidas según la model card.
- En Mac, la ejecución con `--backend gpu --vision-backend gpu` falla con el error "An error occurred" en LiteRT-LM 0.19.0-0.19.2; el codificador visual no se reparte entre GPU y CPU.
- Con `--backend gpu` y sin `--vision-backend`, aparece el error `TopK requires src tensor C dimension to be divisible by 4.` aunque la respuesta se produce.
- El CLI puede conservar descargas incompletas en `~/.litert-lm/cache/huggingface/litert-community/InternVL3-1B/` sin verificar su tamaño, provocando fallos (bus error, exit 138) o errores `too large for file size`.
- El fichero fue reemplazado el 15 de noviembre de 2026; descargas anteriores deben borrarse de la cache para evitar ejecutar la versión antigua.
- Con `--top-k 1` la redacción de las respuestas varía entre ejecuciones, según la propia model card; no se investigó la causa.
- Riesgo de alucinación inherente a modelos de 0,5B de decodificador; la precisión en tareas visuales complejas será limitada.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- La licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías sobre sesgos ni robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/InternVL3-1B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B
- Versión 2B en LiteRT-LM: https://huggingface.co/litert-community/InternVL3-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Registro de métricas edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/internvl3-1b/CARD.md
- Imagen de ejemplo COCO: http://images.cocodataset.org/val2017/000000039769.jpg
