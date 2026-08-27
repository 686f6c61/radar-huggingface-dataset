# litert-community/SmolVLM2-500M

# Ficha del modelo: SmolVLM2-500M (LiteRT-LM)

## Resumen

SmolVLM2-500M en formato LiteRT-LM es una conversión del modelo vision-language de Hugging Face SmolVLM2-500M-Video-Instruct (ruta de imagen) al formato `.litertlm` para inferencia on-device de imagen y texto con el runtime LiteRT-LM de Google AI Edge. Desarrollado por la comunidad litert-community, combina un encoder de visión SigLIP con un decoder SmolLM2 de arquitectura Llama de 360M de parámetros, alcanzando un tamaño total de aproximadamente 500M y un peso de solo 361 MB. Está diseñado para ejecutarse completamente offline en dispositivos edge como móviles, tablets y ordenadores de sobremesa.

El modelo resuelve el problema de llevar la comprensión imagen-texto a dispositivos con recursos limitados, ofreciendo una alternativa de muy bajo coste computacional a los VLM grandes. Con una ventana de contexto de 2048 tokens y soporte para entrada de imágenes de 512×512 píxeles, es capaz de responder preguntas sobre imágenes de forma anclada y coherente. Su relevancia actual radica en la creciente demanda de IA generativa en el edge, donde la privacidad, la latencia y el consumo energético son críticos. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP vision encoder + pixel-shuffle connector + SmolLM2 decoder (Llama, 360M) |
| Parametros totales | ~500M (360M decoder + vision encoder) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (KV cache) |
| Tipos de cuantizacion | int4 (decoder, blockwise-32 + OCTAV), int8 (vision encoder y embedding) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SmolVLM2: un encoder de visión SigLIP que procesa imágenes de 512×512 píxeles, dividiéndolas en 1024 parches sin token CLS. Un conector pixel-shuffle con factor ×4 y una capa lineal reducen las características visuales a 64 tokens de imagen, que se proyectan al espacio del decoder. El decoder es SmolLM2-360M, un transformer de arquitectura Llama con 960 dimensiones ocultas, 32 capas y atención con query groups de 15/5 (GQA). Los pesos se cuantizan a int4 en el decoder (blockwise-32 con OCTAV) e int8 en el encoder de visión y el embedding, lo que permite cómputo íntegramente entero.

El entrenamiento original del modelo base (HuggingFaceTB/SmolVLM2-500M-Video-Instruct) incluye instrucciones sobre video e imágenes, pero esta conversión solo conserva la ruta de imagen. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) en la documentación proporcionada. La conversión a LiteRT-LM mantiene la fidelidad del encoder SigLIP (correlación de paridad float CPU ≈ 1.0), lo que garantiza que las respuestas generadas están ancladas a la imagen de entrada.

## Capacidades

- Comprensión de imágenes y respuesta a preguntas (VQA) sobre una imagen por conversación.
- Generación de descripciones de imágenes en lenguaje natural.
- Soporte de entrada multimodal imagen + texto (una imagen por chat).
- Ejecución completamente offline en dispositivos edge.
- Compatible con el runtime LiteRT-LM en macOS, Linux, Windows, iOS y Android.
- Exposición como API local compatible con OpenAI mediante `litert-lm serve`.
- No soporta tool calling, agentes ni razonamiento multi-paso (no documentado).
- Capacidades multilingües no documentadas.

## Casos de uso

- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede describir el contenido de una fotografía tomada con el móvil en tiempo real, permitiendo a los usuarios comprender su entorno sin conexión a internet.
- Clasificación y etiquetado de imágenes en aplicaciones de fotografía: al integrarse en una app móvil, puede generar etiquetas descriptivas automáticamente para organizar álbumes, con la ventaja de que todo el procesamiento ocurre en el dispositivo, preservando la privacidad.
- Moderación de contenido visual en plataformas sociales: el modelo puede analizar imágenes subidas por usuarios para detectar contenido inapropiado o generar descripciones para accesibilidad, funcionando en el edge para reducir costes de servidor.
- Asistente de compras en retail: un cliente fotografía un producto y el modelo responde con una descripción o información básica, funcionando offline en un kiosco o dispositivo de mano.
- Documentación de campo para investigadores o periodistas: el modelo puede generar descripciones de fotografías tomadas en entornos remotos sin conectividad, facilitando la anotación de imágenes en estudios de campo.
- Automatización de tickets de soporte con capturas de pantalla: en un sistema de helpdesk, el modelo puede describir el contenido de una captura de pantalla adjunta a un ticket, ayudando a los agentes a priorizar y resolver incidencias más rápido, todo localmente.
- Aplicaciones educativas interactivas: un niño fotografía un objeto o una página de un libro y el modelo responde con una descripción o responde preguntas sencillas, funcionando en tablets de bajo coste sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en hardware específico:

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 409 tok/s | 63.9 tok/s | 0.64 s |
| Samsung Galaxy S26 (Android 16) | GPU (LiteRT GPU) | No medido | No medido | No medido |

En el Galaxy S26, el bundle se ejecuta en el backend GPU con 4138/4138 ops delegadas en 3 subgrafos, con un pico de memoria de 404 MB. No se reportan velocidades porque no hay una fila CPU del mismo teléfono para comparar. La model card advierte que el backend GPU de macOS no produce texto utilizable en litert-lm 0.15.0, por lo que se recomienda usar CPU en escritorio.

## Requisitos de hardware

- Tamaño del bundle: ~361 MB (archivo .litertlm).
- Pico de memoria en Galaxy S26 (GPU): 404 MB.
- VRAM estimada para inferencia: no disponible oficialmente, pero al ser un modelo de 500M con cuantización int4/int8, cabe en GPUs de consumo con menos de 1 GB de VRAM (estimación razonable, no verificada).
- GPU recomendadas: no hay datos específicos; en escritorio se recomienda CPU (verificado en Apple M4 Max). En Android, GPU LiteRT funciona (verificado en Galaxy S26).
- Opciones de despliegue: `litert-lm run` (CLI), `litert-lm serve` (API compatible OpenAI), Swift runtime para iPhone/macOS (LiteRTDemo), Google AI Edge Gallery para Android (importación directa desde Hugging Face).
- Latencia y throughput: en Apple M4 Max CPU, prefill de 256 tokens a 409 tok/s, decode a 63.9 tok/s, TTFT de 0.64 s.

## Comparativa con modelos similares

El modelo base es HuggingFaceTB/SmolVLM2-500M-Video-Instruct, del cual esta conversión es una adaptación al formato LiteRT-LM. No se dispone de datos de otros modelos comparables en la información proporcionada. La familia SmolVLM2 incluye variantes de 256M y 2.2B, pero no se han encontrado especificaciones detalladas en los resultados de búsqueda. Esta conversión se diferencia del modelo base únicamente en el formato y la cuantización, manteniendo la misma arquitectura y capacidades para la ruta de imagen.

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| litert-community/SmolVLM2-500M (esta conversión) | ~500M | 2048 | .litertlm | Apache 2.0 |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct (base) | ~500M | No disponible | safetensors (original) | Apache 2.0 |

## Limitaciones y advertencias

- Modelo muy pequeño (500M): puede producir respuestas repetitivas o verbosas con decodificación greedy; se recomienda usar sampling (top-p) y limitar max_tokens.
- Una sola imagen por conversación: no admite múltiples imágenes en el mismo chat; en el backend GPU, una segunda imagen puede degradar la calidad (rasgo del delegado GPU).
- El backend GPU de macOS no funciona correctamente en litert-lm 0.15.0 (genera tokens vacíos); usar CPU en escritorio.
- No se han documentado capacidades multilingües; el rendimiento en idiomas distintos del inglés no está verificado.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso.
- La cuantización int4 puede introducir pérdida de precisión en tareas que requieren razonamiento numérico o lógico fino.
- La licencia Apache 2.0 permite uso comercial, pero el runtime LiteRT-LM es de Google y puede tener sus propias condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/SmolVLM2-500M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Guia GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Documentacion de SmolVLM2-500M-Video-Instruct en M5Stack: https://docs.m5stack.com/en/guide/ai_accelerator/llm-8850/m5_llm_8850_smolvlm2
