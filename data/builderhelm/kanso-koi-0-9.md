# BuilderHelm/Kanso-Koi-0.9

## Resumen

Kanso Koi 0.9 es un adaptador LoRA de bajo rango (rank 32) entrenado sobre la base cuantizada `mlx-community/Qwen3-1.7B-4bit`, desarrollado por BuilderHelm AI como componente del motor de dictado on-device ZenVoice. No es un modelo de propósito general: es un modelo especializado en la limpieza y el formateo de transcripciones crudas de voz a texto (ASR). Su función es recibir la salida en bruto de un motor de reconocimiento de voz y devolver texto escrito correcto: puntuación, mayúsculas, eliminación de muletillas y falsos arranques, normalización inversa de texto (ITN) de números, dinero, fechas, horas, porcentajes, correos, URLs y teléfonos, y reparación gramatical que preserva el significado.

El modelo es relevante por su relación calidad/tamaño: con solo 1.720.574.976 parámetros totales en el base (4 bits) y un adaptador bf16 de unos 70 MB, supera en todas las métricas publicadas a la variante de 4B del mismo autor (Satori 1.0 / v3.2). El paquete completo pesa 1,05 GB y alcanza 73 tok/s de decodificación en un Apple M5 con MLX 0.32.2, con un pico de memoria de 1,19 GB. Está pensado para ejecutarse íntegramente en local en Apple Silicon, sin conexión a servicios en la nube.

La arquitectura subyacente es Qwen3 (transformer decoder-only denso) de 1,7B, cuantizado a 4 bits, con el adaptador aplicado en vivo. La licencia es Apache-2.0 y el formato de publicación es MLX con safetensors; existe una variante GGUF de la versión 1.0 para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), base cuantizada a 4 bits + adaptador LoRA rank 32 |
| Parametros totales | 1.720.574.976 (base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Base 4-bit; adaptador en bf16 (revisiones anteriores: base 6-bit, adaptador fp32) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; los benchmarks y ejemplos son en ingles) |
| Licencia | Apache-2.0 (base Qwen3-1.7B) |
| Formato de pesos | Safetensors (MLX); variante GGUF disponible para la version 1.0 |
| Tamano del paquete | 1,05 GB (base 968 MB + adaptador 70 MB) |
| Libreria de inferencia | MLX (mlx-lm, mlx-swift-lm) |
| Modelo base | mlx-community/Qwen3-1.7B-4bit |
| Descargas | 230 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura Qwen3 de 1,7B parámetros en configuración densa, cuantizada a 4 bits, sobre la que se aplica un adaptador LoRA con rank 32, alpha 64 y escala 2,0. El entrenamiento usó decaimiento coseno de 1e-4 a 1e-6, 100 pasos de warmup, dropout de 0,05 y 3.500 iteraciones sobre un corpus de 90.000 pares procedente de 10 fuentes: pares de limpieza de dictado y ASR real, muletillas intra-frase de DisfluencySpeech, entonación interrogativa de Hansard, ITN monetaria de transcripciones de llamadas de resultados, patrones combinados de muletilla y dinero de BudgieScribe, minería de exclamaciones de Gutenberg, objetivos expresivos de go_emotions, negativos de paso directo de identidad y el corpus reetiquetado de v2.1.

La innovación técnica principal no está en la arquitectura sino en el pipeline de datos y en las políticas de consistencia de etiquetas: borrado de muletillas en medio de frase, conversión de todas las cantidades monetarias a formato `$`, preservación de exclamaciones y normalización de mayúsculas al inicio de frase. Un detalle operativo crítico documentado por el autor es que el adaptador **no debe fusionarse** con los pesos base: la fusión daña de forma medible el comportamiento en ITN monetaria y en borrado de muletillas, por lo que debe cargarse en vivo mediante `LoRAContainer` en mlx-swift-lm o `adapter_path` en mlx-lm. La revisión actual corrige la base a la Qwen3-1.7B-4bit limpia sobre la que se entrenó el adaptador y almacena este en bf16, lo que reduce el paquete un 32 %, acelera la decodificación un 40 % y mejora la precisión respecto a la revisión `53bd03b`.

## Capacidades

- Restauración de puntuación y mayúsculas en transcripciones ASR crudas.
- Eliminación de muletillas, tanto al inicio como en medio de frase.
- Eliminación de falsos arranques (repeticiones y reinicios de frase).
- Normalización inversa de texto (ITN): números, importes monetarios, fechas, horas, porcentajes, correos electrónicos, URLs y números de teléfono.
- Reparación gramatical que preserva el significado y las palabras del hablante.
- Ajuste de mayúsculas y tono según una línea de contexto `app:` opcional.
- Modo sin razonamiento explícito (`enable_thinking=False`) para minimizar latencia.
- Inferencia totalmente on-device en Apple Silicon mediante MLX.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio; es un modelo de transformación de texto de un solo paso.

## Casos de uso

- Dictado en aplicaciones de escritorio y móviles: el modelo se sitúa entre el motor ASR y el campo de texto del usuario para devolver texto listo para enviar, con puntuación y mayúsculas correctas, sin salir del dispositivo. Es adecuado por su huella de 1,05 GB y su pico de memoria de 1,19 GB.
- Notas de reuniones y llamadas: convierte transcripciones de llamadas de resultados o reuniones en actas legibles, con importes monetarios normalizados a formato `$` y sin muletillas, gracias al entrenamiento específico con corpus de earnings calls.
- Accesibilidad y entrada por voz: usuarios con movilidad reducida que dependen del dictado obtienen texto con formato correcto y sin ruido conversacional, lo que reduce la corrección manual posterior.
- Procesamiento por lotes de transcripciones archivadas: limpieza de grandes volúmenes de transcripciones ASR ya generadas, con decodificación greedy a temperatura 0 para resultados deterministas y reproducibles.
- Transcripción de entrevistas y periodismo: recuperación de citas textuales con falsos arranques eliminados y puntuación restaurada, preservando el significado original del hablante.
- Integración en apps macOS nativas: mediante mlx-swift-lm y `LoRAContainer` se puede embeber el par base + adaptador en una aplicación Swift sin infraestructura de servidor.
- Preprocesado para pipelines de NLP posteriores: el texto normalizado (fechas, correos, URLs, teléfonos en forma escrita) mejora la calidad de etapas posteriores de extracción de entidades o indexación.

## Benchmarks y rendimiento

Suite de 500 dictados (`eval_v500`, control de fuga de datos), decodificación greedy, Apple M5, MLX 0.32.2. La columna "revisión anterior" corresponde a `53bd03b`:

| Metrica | Esta revision | Revision anterior |
|---|---|---|
| WER | 5,5 % | 6,7 % |
| Exact match | 65,8 % | 53,6 % |
| Punct F1 | 0,863 | 0,759 |
| Sentence-start | 94,4 % | 91,6 % |
| Tamano del paquete | 1,05 GB | 1,55 GB |
| Memoria pico | 1,19 GB | 1,77 GB |
| Velocidad de decodificacion | 73 tok/s | 51 tok/s |

Suite de 234 filas con control de fuga, publicada para v2.2:

| Metrica | v2.2 (Koi 0.9) | v3 (4B) | v2.1 | v2 | Qwen3-1.7B stock |
|---|---|---|---|---|---|
| WER | 9,9 % | 17,2 % | 12,6 % | 30,5 % | 11,0 % |
| Exact match | 50,4 % | 41,0 % | 29,9 % | 23,1 % | 5,0 % |
| Punct F1 | 0,832 | 0,750 | 0,573 | 0,649 | 0,634 |
| Casing acc | 98,3 % | 95,6 % | 97,0 % | 92,4 % | 96,3 % |
| Sent-start | 90,9 % | 80,7 % | 86,2 % | 62,1 % | 74,9 % |
| Alucinacion | 0,0–7,2 % | 10,8 % | 7,2 % | 23,0 % | 0,9 % |

Con el adaptador en bf16, esta revisión obtiene WER 9,7 %, exact match 50,4 % y Punct F1 0,831 sobre las mismas 234 filas.

## Requisitos de hardware

- VRAM/memoria unificada: pico de 1,19 GB documentado en Apple M5; el paquete en disco ocupa 1,05 GB.
- GPU recomendadas: Apple Silicon (M1 en adelante) con MLX; el benchmark oficial se ejecutó en un M5.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no está pensado para CUDA. Para la variante GGUF de la versión 1.0, llama.cpp permite ejecución en CPU y GPU convencionales, aunque no se publican cifras de rendimiento para ese backend.
- Opciones de despliegue: mlx-lm (Python) y mlx-swift-lm (Swift, con `LoRAContainer`); llama.cpp/Ollama vía la variante GGUF de Kanso-Koi-1.0.
- Latencia y throughput: 73 tok/s de decodificación en Apple M5 con MLX 0.32.2 y decodificación greedy.
- Advertencia de despliegue: cargar siempre el adaptador sobre la base sin fusionar; la fusión degrada la calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (suite 234) | Exact match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kanso Koi 0.9 (este) | 1,7B (4-bit) + LoRA | No disponible | 9,9 % | 50,4 % | Apache-2.0 | MLX en HF; GGUF en v1.0 |
| Kanso Satori 1.0 (v3.2, 4B) | 4B | No disponible | 17,2 % | 41,0 % | Apache-2.0 | MLX en HF |
| ZenPolish v2.1 (Koi 0.9 anterior) | 1,7B | No disponible | 12,6 % | 29,9 % | Apache-2.0 | MLX en HF |
| Qwen3-1.7B stock | 1,7B | No disponible | 11,0 % | 5,0 % | Apache-2.0 | MLX en HF |

La comparación se limita a variantes del mismo autor y a la base sin ajustar, que son los únicos datos publicados en la información disponible; no hay cifras de modelos de terceros para esta tarea específica.

## Limitaciones y advertencias

- Modelo de tarea única: no es un asistente conversacional ni un modelo de propósito general; fuera de la limpieza de dictado su comportamiento no está caracterizado.
- Idiomas: la model card no declara idiomas soportados y todos los benchmarks y ejemplos son en inglés; el rendimiento en castellano no está verificado.
- Alucinación: la suite de 234 filas reporta un rango de 0,0–7,2 %, es decir, existe riesgo no nulo de introducir o alterar contenido respecto a la transcripción original.
- Longitud de contexto: no documentada; las transcripciones largas pueden requerir troceado previo.
- Fusión del adaptador: fusionar el LoRA con los pesos base degrada de forma medible la ITN monetaria y el borrado de muletillas; es un requisito operativo, no una recomendación.
- Dependencia de plataforma: la publicación principal es MLX, ligada a Apple Silicon; otros entornos requieren la variante GGUF.
- Licencia: Apache-2.0 permite uso comercial, pero la atribución de las fuentes de datos de entrenamiento (MIT/Apache-2.0/CC-BY-4.0/CC0) figura en el repositorio ZenVoice y conviene revisarla antes de redistribuir.
- Historial de revisiones: la base cambió el 2026-10-22; revisiones fijadas anteriores a `53bd03b` usan una base de 6 bits distinta y no son comparables en rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Koi-0.9
- Version 1.0 (MLX): https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Version 1.0 en GGUF: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0-GGUF
- Perfil del autor: https://huggingface.co/BuilderHelm
- Web de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Licencia del base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
