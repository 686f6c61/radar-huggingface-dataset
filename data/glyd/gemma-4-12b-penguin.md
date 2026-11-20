# glyd/gemma-4-12B-penguin

## Resumen

Glyd Penguin es una versión comprimida sin pérdida de Gemma 4 12B-it, el modelo de lenguaje denso desarrollado por Google DeepMind. El autor, glyd, redistribuye los pesos originales en bf16 almacenados a aproximadamente 10,8 bits por peso y decodificados en la GPU durante la inferencia, de modo que cada tensor recupera exactamente el valor bf16 de Google sin redondeo alguno. No se trata, por tanto, de una cuantización: es una compresión reversible que reduce el peso en memoria de 22,2 GiB a 15,0 GiB.

El objetivo es claro: hacer que un modelo de 16.000 millones de parámetros quepa y funcione con contexto largo en una única GPU de consumo de 24 GB, algo imposible con los pesos bf16 originales. Con el modelo draft de Google incluido, el autor reporta velocidades de escritura de hasta 97,5 tok/s en una RTX 4090 con prompts de 4K tokens, y un consumo de 17,1 GiB de VRAM a 32K de contexto.

La relevancia actual reside en su enfoque poco habitual: prioriza la fidelidad bit a bit frente a la cuantización tradicional, y ofrece verificación criptográfica (sha256 por tensor) contra los ficheros originales de Google. La contrapartida es que los pesos solo funcionan con el motor propietario de Glyd, no con Transformers, vLLM ni llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Gemma 4 12B-it) |
| Parámetros totales | 15.999.927.931 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K (medido por el autor a 17,1 GiB de VRAM) |
| Tipos de cuantización | Compresión sin pérdida a ~10,8 bits por peso (formato propietario Glyd); no es cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario Glyd (safetensors en el repo, ejecutable solo con motor Glyd) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B-it, un transformer denso de Google DeepMind con 16.000 millones de parámetros. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

La innovación técnica de esta ficha es el nivel de compresión "Penguin" de Glyd: los pesos bf16 se almacenan a unos 10,8 bits por peso y se decodifican en la GPU en tiempo de ejecución, recuperando el valor bf16 exacto de Google. El autor incluye además el modelo draft gemma-4-12B-it-assistant en el subdirectorio `draft/`, sin modificar, para decodificación especulativa, lo que aproximadamente duplica la velocidad de generación. La verificación `glyd verify` decodifica cada tensor y compara su sha256 con el registrado a partir de los ficheros originales de Google.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, modelo instruct).
- Razonamiento y matemáticas: el autor reporta 72/75 en GSM8K y 67/75 en MMLU-Pro (greedy, thinking off).
- Modo thinking: el modelo base lo soporta; las métricas del autor se tomaron con thinking desactivado.
- Decodificación especulativa mediante el modelo draft de Google incluido.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión y audio: no soportados (el autor indica "text only, no image or audio input yet").

## Casos de uso

- Despliegue local en GPU de consumo: ejecutar un modelo de 16B con contexto de 32K en una única RTX 4090 de 24 GB, algo inviable con los pesos bf16 originales (22,2 GiB), usando `glyd run glyd/gemma-4-12B-penguin`.
- Asistentes conversacionales de contexto largo: con 32K tokens de ventana y 17,1 GiB de VRAM ocupada, permite mantener conversaciones multi-turno extensas o procesar documentos largos en una sola tarjeta.
- Generación de texto interactiva de baja latencia: los 89,8 tok/s en chat corto y 97,5 tok/s con prompt de 4K (con draft model) lo hacen adecuado para interfaces de escritura en tiempo real.
- Procesamiento de documentos extensos: un prompt de 28K tokens se lee en 7,63 s y se continúa generando a 64,3 tok/s, útil para resumen o análisis de contratos, informes o artículos largos.
- Evaluación y réplica de resultados: la verificación sha256 por tensor permite auditar que la compresión es realmente sin pérdida antes de usar el modelo en un pipeline de investigación.
- Servicio con API compatible con OpenAI: `glyd serve` expone el modelo mediante la API de OpenAI, lo que facilita integrarlo en aplicaciones existentes que ya consumen ese formato.
- Prototipado en investigación: al mantener los valores bf16 exactos, sirve para reproducir experimentos sin la distorsión que introduce una cuantización con pérdida.

## Benchmarks y rendimiento

Resultados reportados por el autor en RTX 4090 24 GB (Runpod), `glyd serve` vía API OpenAI, un usuario, greedy, thinking off:

| Benchmark | Resultado |
|---|---|
| GSM8K (cada segunda pregunta, primeras 75) | 72 / 75 |
| MMLU-Pro (mismo procedimiento) | 67 / 75 |

Calidad frente a transformers en float32 (KLD media, wikitext-2 test, 32 x 512):

| Configuración | KLD media | Mismo top-1 |
|---|---|---|
| Este repo en motor Glyd (bf16) | 0,170 | 88,8% |
| transformers bf16 (eager attention) | 0,132 | 89,9% |
| transformers bf16 (sdpa attention) | 0,143 | 90,4% |

Rendimiento de inferencia (RTX 4090, con draft model):

| Escenario | Tokens de prompt | Lectura | Escritura |
|---|---|---|---|
| Chat (prompt corto) | 34 | 0,02 s | 89,8 tok/s |
| Prompt de 4K tokens | 3.839 | 0,71 s | 97,5 tok/s |
| Prompt de 28K tokens | 28.374 | 7,63 s | 64,3 tok/s |
| Sin draft model (chat) | — | — | 50,8 tok/s |
| Sin draft model (4K) | — | — | 48,3 tok/s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,0 GiB de pesos; 17,1 GiB de 24 GiB a 32K de contexto, draft model incluido.
- GPU recomendadas: NVIDIA RTX 30 series o superior con 24 GB (probado en RTX 4090).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y tarjetas equivalentes de 24 GB.
- Sistema operativo: Linux + NVIDIA exclusivamente; sin soporte para Windows, Mac ni AMD.
- Opciones de despliegue: únicamente el motor Glyd (versión 0.33.0 o superior), con `glyd run` o `glyd serve` (API compatible con OpenAI). No compatible con Transformers, vLLM, llama.cpp ni Ollama.
- Carga: 12 s desde disco en RTX 4090.
- Throughput: hasta 97,5 tok/s con draft model en prompt de 4K; 50,8 tok/s sin draft model en chat.
- Concurrencia: una petición a la vez; las demás esperan.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| glyd/gemma-4-12B-penguin | 16,0B | 32K (medido) | Apache 2.0 | Propietario Glyd | Solo motor Glyd, Linux + NVIDIA 24 GB |
| google/gemma-4-12B-it (bf16) | 16,0B | no disponible | Apache 2.0 | safetensors | Transformers, vLLM, llama.cpp, etc.; 22,2 GiB no caben con contexto en 24 GB |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | Apache 2.0 | safetensors | Modelo draft para decodificación especulativa |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor Glyd: los pesos no funcionan con Transformers, vLLM, llama.cpp ni Ollama; para esos entornos hay que usar los pesos de Google.
- Plataforma restringida: solo Linux + NVIDIA RTX 30 series o superior con 24 GB; sin soporte para Windows, Mac ni AMD.
- Solo texto: no acepta imagen ni audio.
- Sin concurrencia: una petición a la vez; el resto espera, lo que limita su uso en producción con múltiples usuarios.
- Reproducibilidad con sampling: con el draft model activado, una misma semilla produce texto distinto (igualmente probable) que sin él; la salida greedy sí es idéntica.
- Diferencias numéricas frente a transformers: la KLD media es de 0,170 frente a 0,132 de transformers bf16 eager, atribuida por el autor al orden de las operaciones aritméticas y dentro de la dispersión medida.
- Idiomas soportados no documentados; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación: inherente al modelo base; no se documentan evaluaciones específicas de sesgo o alucinación en la información disponible.
- Licencia Apache 2.0 en el repo, pero los pesos son de Google bajo su licencia; conviene revisar los términos de Gemma 4 para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glyd/gemma-4-12B-penguin
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo draft: https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio del motor Glyd: https://github.com/surya-koritala/Glyd
