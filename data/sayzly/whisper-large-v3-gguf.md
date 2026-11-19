# sayzly/whisper-large-v3-gguf

## Resumen

Whisper Large v3 GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla Whisper Large v3 desarrollado originalmente por OpenAI. La conversión la publica el usuario sayzly bajo el identificador `sayzly/whisper-large-v3-gguf` y su propósito declarado en la model card es servir como artefacto de descarga para la herramienta Sayzly: concretamente, el fichero `whisper-large-v3-Q8_0.gguf` con cuantización de 8 bits. No se trata de un modelo nuevo ni de un reentrenamiento, sino de una redistribución en formato GGUF del checkpoint original.

El modelo base es un transformer encoder-decoder de tipo seq2seq orientado a transcripción y traducción de voz, con aproximadamente 1.543 millones de parámetros según los pesos en safetensors del repositorio. Whisper Large v3 es la iteración de mayor tamaño de la familia Whisper y está pensado para transcripción multilingüe de audio de 30 segundos por ventana, con capacidad de traducción al inglés y marcas temporales.

Su relevancia práctica en el ecosistema open source radica en el formato: GGUF permite ejecutar el modelo con llama.cpp y derivados (Ollama, whisper.cpp en su variante GGUF) en hardware modesto, sin depender de PyTorch ni de CUDA, lo que facilita el despliegue en CPU, portátiles y entornos embebidos. La licencia Apache 2.0 del modelo original se mantiene en esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de Whisper Large v3 |
| Parámetros totales | 1.543.516.688 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base procesa ventanas de audio de 30 s) |
| Tipos de cuantización | Q8_0 (único fichero documentado en la model card) |
| Idiomas soportados | No disponibles en la información proporcionada (el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`whisper-large-v3-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente a la del modelo base `openai/whisper-large-v3`: un transformer encoder-decoder que recibe espectrogramas Mel logarítmicos de audio y genera tokens de texto de forma autorregresiva. El encoder procesa ventanas de audio de 30 segundos y el decoder produce la transcripción, con tokens especiales para marcas temporales, detección de idioma y tareas de transcripción o traducción. El modelo base fue entrenado por OpenAI sobre una gran colección de audio supervisado multilingüe y datos de pseudo-etiquetado; los detalles exactos de composición del dataset, número de tokens y etapas de ajuste (por ejemplo, RLHF) no se recogen en la información proporcionada.

Esta publicación concreta no documenta ningún proceso de entrenamiento adicional: es una cuantización a Q8_0 de los pesos originales para su uso con el runtime GGUF. Por tanto, no hay innovaciones técnicas propias del autor más allá de la conversión de formato; no se mencionan decodificación especulativa, atención lineal ni modificaciones arquitectónicas.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio de hasta 30 segundos por ventana, con concatenación de ventanas para audios más largos.
- Transcripción multilingüe, heredada del modelo base Whisper Large v3.
- Traducción de voz a texto en inglés (tarea `translate` del modelo base).
- Generación de marcas temporales a nivel de segmento y de palabra mediante tokens especiales.
- Detección automática de idioma.
- Ejecución en CPU y GPU mediante runtimes compatibles con GGUF, sin requerir PyTorch.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido; el modelo es exclusivamente de voz a texto.

## Casos de uso

- Transcripción de reuniones y entrevistas: se puede procesar el audio por ventanas de 30 segundos y concatenar las salidas con marcas temporales para generar actas o subtítulos revisables.
- Generación de subtítulos para vídeo: el modelo produce segmentos con timestamps que se pueden exportar a formatos SRT/VTT en un pipeline de postproducción.
- Despliegue en local sin GPU: al estar en GGUF Q8_0, se puede ejecutar con runtimes de CPU en portátiles o servidores sin CUDA, útil para entornos con requisitos de privacidad donde el audio no debe salir de la máquina.
- Integración en aplicaciones de escritorio o herramientas CLI: el fichero GGUF se descarga directamente desde el repositorio y se carga con el runtime correspondiente, lo que simplifica la distribución frente a checkpoints de PyTorch.
- Traducción de audio a inglés: para contenido en otros idiomas que necesite un texto en inglés, se puede usar la tarea de traducción del modelo base.
- Archivado y búsqueda de audio: transcribir grandes volúmenes de grabaciones para indexarlas y permitir búsqueda por texto, aprovechando la ejecución en CPU para abaratar el procesamiento por lotes.
- Prototipado rápido de asistentes de voz: usar la transcripción como primer eslabón de un pipeline ASR + LLM, sustituyendo el componente de reconocimiento por esta versión cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 1,7 GB, coherente con un único fichero Q8_0 de aproximadamente 1.543 millones de parámetros.
- VRAM/RAM estimada para inferencia: en torno a 2 GB para los pesos en Q8_0, más el overhead del runtime y de los buffers de audio; se recomienda disponer de al menos 3-4 GB libres para trabajar con holgura.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria (por ejemplo, RTX 3050, RTX 4060, RTX 4090, A100, H100); el modelo no requiere GPU de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más de VRAM.
- Ejecución en CPU: viable gracias al formato GGUF; el rendimiento dependerá del número de núcleos y del runtime empleado.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; para Whisper en concreto, las herramientas del ecosistema whisper.cpp/GGUF. vLLM y TGI no son opciones habituales para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/whisper-large-v3-gguf (esta ficha) | 1.543.516.688 | GGUF (Q8_0) | Ventanas de 30 s (heredado del base) | Apache 2.0 | Hugging Face, 0 descargas |
| openai/whisper-large-v3 | 1.543.516.688 (según checkpoint original) | Safetensors/PyTorch | Ventanas de 30 s | Apache 2.0 | Hugging Face, ampliamente usado |
| whisper-large-v3-turbo (OpenAI) | No disponible en la información proporcionada | Safetensors/PyTorch | Ventanas de 30 s | Apache 2.0 | Hugging Face |

La comparación relevante es contra el checkpoint original de OpenAI: misma arquitectura y mismos pesos, con la diferencia de formato y de facilidad de despliegue en CPU. Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización Q8_0: aunque la pérdida de calidad suele ser pequeña, no es idéntica al checkpoint original en precisión completa.
- El modelo base Whisper es conocido por alucinar texto en segmentos de silencio o ruido; conviene aplicar detección de actividad de voz y revisión en producción.
- Solo se documenta un fichero Q8_0; no hay otras cuantizaciones publicadas en este repositorio.
- El modelo base está limitado a ventanas de audio de 30 segundos; audios más largos requieren segmentación y concatenación, con posible pérdida de contexto entre ventanas.
- Los idiomas soportados no se detallan en la información proporcionada; hay que remitirse al modelo base para conocer la cobertura real.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar la atribución correspondiente al modelo original de OpenAI.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en fechas muy próximas; no hay evidencia de validación por la comunidad.
- No se documentan métricas de calidad, latencia ni pruebas de la conversión GGUF; conviene validar la salida frente al checkpoint original antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-large-v3-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
- whisper.cpp (runtime GGUF para Whisper): https://github.com/ggerganov/whisper.cpp
