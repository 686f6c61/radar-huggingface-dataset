# SoAIHQ/gpt-oss-20b-VISION-GGUF

## Resumen

gpt-oss-20b-VISION-GGUF es una conversión al formato GGUF del modelo open-weight gpt-oss-20b de OpenAI, publicada por SoAI (SoAIHQ) con los pesos originales sin remezclar y un añadido experimental de entrada de imágenes. El modelo base es un transformer de mezcla de expertos (MoE) con 20.914.757.184 parámetros totales (21B) y 3,6B activos por token, distribuidos en 32 expertos con 4 activos, y una ventana de contexto de 131.072 tokens. Mantiene el formato de prompt harmony de OpenAI y el modo de razonamiento siempre activo, ajustable mediante el parámetro `reasoning_effort` (low, medium, high).

La relevancia de esta ficha está en que permite ejecutar localmente, con llama.cpp, un modelo de razonamiento de OpenAI en formato MXFP4 (13,8 GB) sin recuantizar los expertos, que es como OpenAI los post-entrenó y evaluó. Además, incorpora un proyector multimodal (`mmproj-gpt-oss-20b-f16.gguf`, 651,1 MB) para entrada de imágenes, marcada como experimental por el autor. La licencia es Apache 2.0, lo que facilita uso comercial, y el repositorio ocupa 14,4 GB.

El modelo resuelve el problema de desplegar razonamiento de gama 20B en hardware de consumo o servidores modestos, con soporte de tool calling compatible con la API de OpenAI. Es una opción intermedia entre modelos densos pequeños y MoE grandes, pensada para desarrolladores que quieren inferencia local con contexto largo y capacidades de agente. La versión recomendada por el autor para nuevas descargas es gpt-oss-20b-VISION-v2-GGUF, que corrige la plantilla de chat sin cambiar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE), transformer, 32 expertos con 4 activos |
| Parametros totales | 20.914.757.184 (21B) |
| Parametros activos | 3,6B |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | MXFP4 (expertos, formato original de OpenAI); resto de tensores en BF16; no se ofrece Q4_K_M ni Q8_0 |
| Idiomas soportados | Principalmente inglés (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); add-on mmproj F16 para imágenes |

## Arquitectura y entrenamiento

El modelo es un transformer con capa de mezcla de expertos: 32 expertos en total y 4 activos por token, con 21B parámetros totales y 3,6B activos. Los pesos provienen de openai/gpt-oss-20b, que OpenAI post-entrenó con los expertos ya en MXFP4 y evaluó en ese formato. SoAI copia esos tensores MoE en MXFP4 sin recuantizar y mantiene el resto en BF16, de modo que la conversión solo cambia el contenedor y no los pesos. El autor justifica no publicar Q4_K_M (expandiría los expertos de 4 bits y los redondearía de nuevo, añadiendo error) ni Q8_0 (duplicaría el tamaño sin recuperar precisión).

El entrenamiento original incluye post-entrenamiento de OpenAI con razonamiento siempre activo y plantilla harmony; no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable de esta conversión es el proyector multimodal experimental para imágenes y la verificación previa de que los marcadores de chat, thinking y tool-call están almacenados como tokens especiales y que la plantilla de chat incrustada coincide con la original. El modelo solo funciona con el formato harmony, que llama.cpp aplica automáticamente desde el GGUF.

## Capacidades

- Generación de texto y razonamiento con modo thinking siempre activo, con profundidad controlada por `reasoning_effort` (low, medium, high).
- Entrada de imágenes experimental mediante el add-on `mmproj-gpt-oss-20b-f16.gguf`, cargado con `--mmproj`.
- Tool calling y function calling: llama.cpp parsea las llamadas de vuelta a `tool_calls` compatibles con la API de OpenAI.
- Soporte de agentes y razonamiento multi-paso mediante el formato harmony y el modo thinking.
- Capacidades multilingües limitadas: principalmente inglés.
- Sin soporte de audio.
- Compatible con endpoints (tag `endpoints_compatible`) y uso conversacional.

## Casos de uso

- Razonamiento local en estación de trabajo: ejecutar el modelo con llama.cpp en GPU o CPU, o con capas repartidas, usando `reasoning_effort` alto para problemas de lógica y bajo para respuestas rápidas.
- Asistente de código con tool calling: integrar el servidor OpenAI-compatible de llama.cpp en pipelines de CI/CD para invocar herramientas y parsear `tool_calls` de forma estructurada.
- Agente multi-paso con contexto largo: aprovechar los 131.072 tokens para mantener historiales de conversación, documentos o trazas de herramientas extensas en una sola ventana.
- Análisis de documentación técnica con imágenes: usar el proyector mmproj para adjuntar capturas de diagramas o interfaces junto a texto, asumiendo el carácter experimental de la entrada visual.
- Servicio de atención al cliente autoalojado: desplegar `llama-server` con API compatible con OpenAI para conversaciones multi-turno sin depender de servicios en la nube, con licencia Apache 2.0.
- Evaluación de modelos MoE en investigación: comparar el comportamiento de un MoE de 21B con 3,6B activos frente a modelos densos en tareas de razonamiento, usando el mismo formato MXFP4 que OpenAI evaluó.
- Prototipado de herramientas internas: arrancar el servidor con `llama-server -hf SoAIHQ/gpt-oss-20b-VISION-GGUF:MXFP4` y usar la interfaz de chat integrada en http://localhost:8080 para pruebas rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al menos 13,8 GB para el archivo MXFP4, más memoria adicional para el contexto, que crece con la longitud de contexto configurada; el add-on mmproj F16 suma 651,1 MB.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo puede ejecutarse en GPU, CPU o con capas repartidas entre ambas mediante llama.cpp.
- Cabe en GPU de consumo con suficiente VRAM para el archivo y el contexto; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: llama.cpp (llama-server, con descarga automática del mmproj mediante `-hf`), API compatible con OpenAI en http://localhost:8080; no se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Ajustes recomendados: temperature 1.0 y top_p 1.0 en todas las tareas; reservar al menos 16K tokens de salida para dejar espacio al razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SoAIHQ/gpt-oss-20b-VISION-GGUF | 21B | 3,6B | 131.072 | Apache 2.0 | GGUF MXFP4 | Base openai/gpt-oss-20b, visión experimental |
| openai/gpt-oss-20b | 21B | 3,6B | 131.072 | Apache 2.0 | safetensors (original) | Modelo base de OpenAI, sin visión |
| SoAIHQ/gpt-oss-20b-VISION-v2-GGUF | 21B | 3,6B | 131.072 | Apache 2.0 | GGUF MXFP4 | Plantilla de chat corregida, mismos pesos |

## Limitaciones y advertencias

- La entrada de imágenes es experimental según el autor; no debe tratarse como capacidad consolidada en producción.
- El modelo solo funciona con el formato de prompt harmony; plantillas incorrectas rompen turnos, thinking y tool calls sin error visible.
- Idiomas: principalmente inglés, con soporte multilingüe limitado.
- El razonamiento no se puede desactivar; usar `reasoning_effort` bajo para respuestas rápidas y reservar al menos 16K tokens de salida.
- Riesgo de alucinación inherente a modelos generativos; no se documentan sesgos conocidos en la información disponible.
- El autor recomienda la versión v2 para nuevas descargas por su plantilla de chat corregida.
- La memoria necesaria crece con la longitud de contexto configurada, además del tamaño del archivo.
- Licencia Apache 2.0, con enlace a la licencia del modelo base de OpenAI; verificar condiciones antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoAIHQ/gpt-oss-20b-VISION-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Licencia del modelo base: https://huggingface.co/openai/gpt-oss-20b/blob/main/LICENSE
- Versión v2 recomendada: https://huggingface.co/SoAIHQ/gpt-oss-20b-VISION-v2-GGUF
- Pesos MXFP4: https://huggingface.co/SoAIHQ/gpt-oss-20b-VISION-GGUF/resolve/main/gpt-oss-20b-MXFP4.gguf
- Proyector multimodal F16: https://huggingface.co/SoAIHQ/gpt-oss-20b-VISION-GGUF/resolve/main/mmproj-gpt-oss-20b-f16.gguf
- Formato harmony: https://github.com/openai/harmony
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del autor: https://soai.to
