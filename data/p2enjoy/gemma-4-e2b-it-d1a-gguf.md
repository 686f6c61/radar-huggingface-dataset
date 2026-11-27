# P2Enjoy/gemma-4-E2B-it-D1A-GGUF

## Resumen

Gemma 4 E2B-it dual-mode inference es una distribución de inferencia empaquetada por P2Enjoy que combina el modelo de chat Gemma 4 E2B-it de Google con el adaptador LoRA y la cabeza de puntero D1A v0.6 de John Soliva, orientados a la toma de decisiones tipadas. El paquete no es un modelo único, sino un conjunto de pesos en formato GGUF junto con un motor de inferencia derivado de llama.cpp que mantiene una única columna vertebral compartida en memoria y expone dos rutas: chat conversacional convencional y una API de decisión que devuelve elección, puntuación y probabilidades de sí/no sin generar tokens de salida.

La propuesta resulta relevante porque demuestra un patrón de inferencia dual sobre un mismo backbone: el modo chat usa generación autoregresiva normal, mientras que el modo decisión reutiliza el prefill y aplica una cabeza de clasificación tipada, lo que reduce la latencia y el coste en escenarios de enrutamiento o clasificación. El repositorio incluye tres variantes de backbone (Q4_K_M con edición experimental de pesos, Q4_K_M estándar y Q8_0 de referencia), el adaptador y la cabeza en F32, configuración de decisión, código fuente y scripts de validación reproducibles.

El modelo base es Gemma 4 E2B-it, un transformer de aproximadamente 24,16 millones de parámetros según los safetensors declarados, con licencia Apache 2.0. La distribución está pensada para despliegue local en llama.cpp, con soporte opcional de entrada de imagen, audio y vídeo mediante el proyector multimodal incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it) con adaptador LoRA D1A y cabeza de puntero para decisiones tipadas; motor derivado de llama.cpp |
| Parametros totales | 24.158.208 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 8192 tokens en la configuración de servidor de ejemplo (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (estándar y WSP experimental), Q8_0; adaptador y cabeza en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (backbone y pesos D1A); motor llama.cpp bajo MIT |
| Formato de pesos | GGUF (backbones, adaptador y cabeza), proyector multimodal `mmproj-F16.gguf` |

## Arquitectura y entrenamiento

El paquete se apoya en el backbone Gemma 4 E2B-it de Google, un transformer denso de unos 24,16 millones de parámetros. Sobre él se aplica el adaptador LoRA D1A v0.6 y una cabeza de puntero de John Soliva, ambos convertidos a F32 GGUF, que habilitan una ruta de decisión tipada. El motor de inferencia es un fork de llama.cpp (rama `dual-mode`) que mantiene una sola columna vertebral residente y sirve tanto `/v1/chat/completions` como `/v1/systemone` para decisiones. Las decisiones usan prefill y no producen tokens de salida, lo que las hace adecuadas para clasificación de baja latencia.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO para el backbone. La variante `gemma-Q4_K_M-refit.gguf` es una edición experimental en el espacio de pesos: se reajustaron las escalas de bloque de 212 tensores Q4_K contra los pesos BF16, preservando los códigos enteros y el tamaño del archivo. El paquete usa la conversión Q8_0 de Unsloth como referencia cualificada. La validación nativa se realizó sobre una NVIDIA GeForce RTX 4070 Laptop GPU (7807 MiB, 7659 MiB libres) con CUDA.

## Capacidades

- Generación de texto conversacional mediante la ruta de chat estándar de llama.cpp.
- Toma de decisiones tipadas: elección entre opciones, puntuación y probabilidades de sí/no, sin generar tokens de salida.
- Inferencia dual en un único proceso con backbone compartido, reduciendo el coste de mantener dos modelos separados.
- Soporte de entrada multimodal (imagen, audio y vídeo) añadiendo `--mmproj mmproj-F16.gguf` al servidor.
- Despliegue local con backend CUDA o CPU (`-ngl 0` para CPU).
- Compatibilidad con el servidor HTTP de llama.cpp, incluyendo endpoints compatibles con OpenAI para chat.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso ni modo thinking explícito.

## Casos de uso

- Enrutamiento y clasificación de intenciones: la ruta de decisión devuelve elección y probabilidades sin generar tokens, lo que permite clasificar consultas de usuario en categorías predefinidas con latencia mínima sobre el prefill.
- Moderación o filtrado binario: el modo sí/no puede usarse para decidir si un contenido cumple una política, aprovechando que no hay decodificación autoregresiva y el coste por petición es bajo.
- Asistentes conversacionales locales: la ruta de chat sobre Gemma 4 E2B-it permite desplegar un asistente en hardware de consumo, con contexto de 8192 tokens configurable en el servidor de ejemplo.
- Sistemas de decisión con puntuación: la API de score permite ordenar o priorizar candidatos (por ejemplo, respuestas o acciones) sin generar texto, integrándose en pipelines de ranking.
- Procesamiento multimodal local: con el proyector `mmproj-F16.gguf` se pueden enviar imágenes, audio o vídeo al mismo servidor para tareas de descripción o clasificación multimodal.
- Evaluación reproducible de cuantizaciones: el paquete incluye scripts (`make-cases.py`, `decision-metrics.json`, `chat-metrics.json`, `qualification.json`) para reproducir las 108 peticiones públicas y comparar precisión y memoria entre Q4 y Q8 en un entorno propio.
- Despliegue en estaciones de trabajo con GPU de consumo: la validación en una RTX 4070 Laptop con 7807 MiB indica que el paquete Q8_0 es ejecutable en ese perfil de hardware.

## Benchmarks y rendimiento

| Prueba | Q4 WSP (experimental) | Q4_K_M estándar | Q8_0 referencia |
|---|---|---|---|
| Preguntas de decisión acertadas (320) | 257 | 257 | 255 |
| Acuerdo de top-token con BF16 (sonda de 762 posiciones) | 84,51 % | 85,04 % | 96,85 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos anteriores corresponden a las pruebas internas de decisión y a la sonda de acuerdo de token superior frente a BF16 documentadas por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la validación de referencia se ejecutó en una GPU con 7807 MiB totales y 7659 MiB libres para el paquete Q8_0.
- GPU recomendadas: NVIDIA GeForce RTX 4070 Laptop (validada); se requieren controladores compatibles, CUDA toolkit, CMake y compilador C++17 para la compilación nativa.
- Cabe en GPU de consumo: sí, según la validación en RTX 4070 Laptop con Q8_0; las variantes Q4_K_M reducen el requisito de memoria.
- Opciones de despliegue: llama.cpp (fork `dual-mode` incluido), servidor nativo `llama-server` con backend CUDA o CPU; no se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no se publican cifras agregadas en la información disponible; el autor remite a `decision-metrics.json`, `chat-metrics.json` y `qualification.json` para tiempos de generación en caliente y resultados por suite.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B-it dual-mode (este paquete) | 24.158.208 | 8192 (config. de ejemplo) | Apache 2.0 | GGUF | Incluye ruta de decisión tipada y multimodal |
| google/gemma-4-E2B-it | no disponible en la información | no disponible | Apache 2.0 | safetensors/GGUF (vía Unsloth) | Backbone base sin adaptador D1A |
| JohnP1/d1a-e2b-it | no disponible en la información | no disponible | Apache 2.0 | no disponible | Adaptador LoRA y cabeza de decisión originales |
| unsloth/gemma-4-E2B-it-GGUF | no disponible en la información | no disponible | Apache 2.0 | GGUF | Conversión Q8_0/Q4_K_M usada como base |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La variante `gemma-Q4_K_M-refit.gguf` es experimental: modifica escalas de bloque de 212 tensores y su acuerdo de top-token con BF16 (84,51 %) es inferior al de Q4 estándar (85,04 %) y muy inferior al de Q8_0 (96,85 %).
- El paquete Q8_0 se declara como referencia cualificada; para producción se recomienda esa variante frente a las Q4.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación en la información disponible.
- El contexto de ejemplo es de 8192 tokens; no se confirma una ventana máxima superior.
- El despliegue requiere compilar el fork de llama.cpp incluido y verificar las sumas SHA-256; no es un paquete listo para usar con herramientas estándar sin ese paso.
- La licencia Apache 2.0 permite uso comercial, pero el motor llama.cpp derivado está bajo MIT con avisos de terceros que deben conservarse.
- La validación de rendimiento se realizó en una única GPU de portátil; el comportamiento en otros entornos no está garantizado por el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/P2Enjoy/gemma-4-E2B-it-D1A-GGUF
- Modelo base Google: https://huggingface.co/google/gemma-4-E2B-it
- Conversión GGUF de Unsloth: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Pesos D1A: https://huggingface.co/JohnP1/d1a-e2b-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Rama dual-mode del fork: https://github.com/martinobettucci/llama.cpp/tree/dual-mode
- Resultados del servidor Q8: https://github.com/martinobettucci/llama.cpp/tree/dual-mode/docs/dual-mode/resident-q8.md
- Resultados del servidor Q4 editado: https://github.com/martinobettucci/llama.cpp/tree/dual-mode/docs/dual-mode/resident-q4.md
- Estudio de calidad de la edición de pesos Q4: https://github.com/martinobettucci/llama.cpp/tree/dual-mode/docs/dual-mode/q4-weight-edit.md
