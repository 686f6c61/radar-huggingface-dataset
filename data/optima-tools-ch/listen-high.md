# optima-tools-ch/listen-high

## Resumen

`optima-tools-ch/listen-high` es un paquete de distribución del modelo Whisper Large-v3 de OpenAI en formato GGML para el motor whisper.cpp, publicado por el proyecto Optima Tools. No se trata de un modelo entrenado o afinado por este autor: el repositorio contiene una copia del fichero `ggml-large-v3.bin` (3 095 033 483 bytes) obtenido del repositorio `ggerganov/whisper.cpp` en la revisión `5359861c739e955e79d9a303bcbc70fb988958b1`, junto con los documentos de licencia y procedencia. La model card lo etiqueta como variante «High», es decir, la versión completa no «turbo», orientada a priorizar calidad sobre coste de cómputo.

El modelo subyacente es Whisper Large-v3, un sistema de reconocimiento automático del habla multilingüe de tipo encoder-decoder transformer con aproximadamente 1550 millones de parámetros, entrenado por OpenAI sobre datos supervisados débiles a gran escala. Su relevancia en este paquete es práctica: permite ejecutar transcripción y dictado multilingüe en local mediante whisper.cpp, con backend CPU, CUDA o Vulkan, sin depender de servicios en la nube.

El repositorio tiene un carácter puramente de empaquetado: no anuncia precisión, velocidad ni compatibilidad hardware verificadas, y el propio autor indica que la prueba de transcripción dentro de Optima Tools no se ha realizado. La licencia es MIT, heredada de OpenAI y de whisper.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large-v3) |
| Parametros totales | no disponible en la informacion proporcionada (Whisper Large-v3 se situa en torno a 1550 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible; el paquete distribuye unicamente el fichero completo `ggml-large-v3.bin` en formato GGML |
| Idiomas soportados | multilingue; la model card menciona frances, aleman e ingles como ejemplos, sin lista cerrada |
| Licencia | MIT (OpenAI, copyright 2022; whisper.cpp, copyright 2023-2026 The ggml authors) |
| Formato de pesos | GGML (`.bin`) para whisper.cpp |

## Arquitectura y entrenamiento

El modelo es Whisper Large-v3 de OpenAI, una arquitectura encoder-decoder de tipo transformer diseñada para reconocimiento automático del habla. El encoder procesa espectrogramas Mel de ventanas de audio de 30 segundos y el decoder genera tokens de texto condicionados por el audio y por tokens especiales de idioma y tarea. La variante Large-v3 es la versión completa, no la «turbo», lo que implica mayor coste de cómputo a cambio de priorizar calidad.

El paquete no aporta información sobre el entrenamiento original: no se detallan número de tokens, composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO, ya que el autor se limita a redistribuir el fichero convertido a GGML por el proyecto whisper.cpp. La conversión a GGML, la posible cuantización y el motor de inferencia son obra de Georgi Gerganov y los contribuyentes de whisper.cpp, según los créditos del repositorio. La innovación técnica relevante aquí es la propia conversión a GGML, que permite ejecutar el modelo en CPU con OpenBLAS o en GPU mediante CUDA o Vulkan a través de `whisper-cli`.

## Capacidades

- Transcripción de audio a texto multilingüe, incluyendo francés, alemán e inglés según la model card.
- Dictado por voz: el motor se invoca como `whisper-cli -m ggml-large-v3.bin -f dictation.wav -l <langue>`.
- Detección y selección de idioma mediante el parámetro `-l`.
- Ejecución local en CPU (build OpenBLAS) o en GPU si el motor dispone de las DLL de CUDA o Vulkan.
- No proporciona identificación de hablantes (diarización).
- No garantiza transcripción en tiempo real.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado local en aplicaciones de escritorio: el paquete está pensado para importarse en Optima Tools (Administración → IA y modelos) y usarse con `whisper-cli` sobre ficheros WAV, verificando el SHA-256 del modelo contra el catálogo.
- Transcripción de reuniones y notas de voz en francés, alemán o inglés: el carácter multilingüe del modelo permite cubrir entornos laborales plurilingües sin enviar el audio a un servicio externo.
- Subtitulado de vídeo offline: se puede procesar el audio extraído de un vídeo con `whisper-cli` y generar el texto para postprocesarlo en un pipeline de subtítulos.
- Archivo y documentación de entrevistas: transcripción por lotes de grabaciones almacenadas, priorizando calidad sobre velocidad al usar la variante completa.
- Prototipado de asistentes de voz en local: integración del binario en una aplicación que capture audio, invoque `whisper-cli` y consuma la salida de texto.
- Evaluación de infraestructura de inferencia local: útil para comparar el rendimiento de backends CPU, CUDA y Vulkan con un modelo de referencia conocido, teniendo en cuenta que el paquete no incluye el motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se anuncia precisión, velocidad ni compatibilidad hardware, y que la prueba de transcripción dentro de Optima Tools no se ha efectuado.

## Requisitos de hardware

- VRAM estimada: no disponible; el fichero GGML completo ocupa 3 095 033 483 bytes (unos 3,1 GB), por lo que se necesita al menos esa cantidad de memoria o RAM para cargarlo.
- GPU recomendadas: no disponible; el paquete no incluye backend GPU por sí mismo.
- GPU de consumo: no confirmado. El modelo completo en GGML podría caber en GPUs con 8 GB o más de VRAM, pero el autor no lo verifica.
- Backends: whisper.cpp detecta CUDA, Vulkan o CPU según las DLL presentes junto al ejecutable; la build relevada en el equipo de desarrollo es CPU con OpenBLAS.
- Despliegue: `whisper-cli` de whisper.cpp; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| optima-tools-ch/listen-high (este paquete) | no disponible (Whisper Large-v3) | no disponible | GGML | MIT | Repositorio Hugging Face, descarga desde la app aun no abierta |
| openai/whisper-large-v3 | no disponible (Whisper Large-v3) | no disponible | safetensors / PyTorch | MIT | Hugging Face |
| ggerganov/whisper.cpp (ggml-large-v3.bin) | no disponible | no disponible | GGML | MIT | Hugging Face, repositorio fuente del fichero |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio solo contiene el fichero del modelo; es imprescindible disponer del motor whisper.cpp (`whisper-cli.exe` y sus DLL), que se distribuye por separado.
- El fichero de modelo no añade por sí solo un backend GPU: sin las DLL de CUDA o Vulkan, la inferencia se ejecuta en CPU.
- La prueba de transcripción no se ha realizado; no hay garantías de precisión, velocidad ni compatibilidad hardware.
- La descarga directa desde la aplicación Optima Tools no está abierta todavía.
- La importación de un `.bin` aislado no copia automáticamente las licencias ni los créditos del repositorio.
- No ofrece diarización de hablantes ni garantía de transcripción en tiempo real.
- La calidad varía según el idioma, la grabación y el hardware; no se anuncia precisión cifrada.
- Riesgo de alucinación y errores propios de los modelos Whisper en audio con ruido, acentos o solapamiento de voces; no cuantificado en la información disponible.
- La licencia MIT permite uso comercial, pero deben conservarse los avisos de copyright de OpenAI y de whisper.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/optima-tools-ch/listen-high
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Fuente del fichero GGML: https://huggingface.co/ggerganov/whisper.cpp/tree/5359861c739e955e79d9a303bcbc70fb988958b1
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
