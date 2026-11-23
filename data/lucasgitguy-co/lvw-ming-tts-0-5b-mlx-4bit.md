# Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-4bit

## Resumen

LvW-Ming-TTS-0.5B-MLX-4bit es una conversión a formato MLX con cuantización de 4 bits del modelo de síntesis de voz Lucasgitguy-co/LvW-Ming-TTS-0.5B, un fine-tune orientado a text-to-speech y clonación de voz. El autor de la conversión es Lucasgitguy-co y se ha realizado con la herramienta `mlx_audio.convert` (mlx-audio 0.6.6), empleando cuantización afín de 4 bits. El modelo está pensado para ejecutarse en hardware Apple Silicon a través de la librería mlx-audio.

El modelo base es un transformer denso (tag "dense") de aproximadamente 1.479 millones de parámetros reales en safetensors, con soporte para siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés. Incluye un encoder de hablante CAM++ (`campplus.safetensors`) para la clonación de voz, convertido con el conversor propio de mlx-audio.

La relevancia de esta ficha es limitada y conviene ser transparente: el propio autor declara que la compuerta de publicación ha **fallado** (release gate FAILED). El fine-tune no supera al modelo base en el conjunto de test reservado, y además la comprobación de formato también falla. El autor lo publica tal cual para que el resultado pueda inspeccionarse y recomienda usar el modelo base para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag "dense"), con encoder de hablante CAM++ |
| Parametros totales | 1.479.454.868 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (cuantizacion MLX) |
| Idiomas soportados | zh, en, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |
| Libreria | mlx-audio (>= 0.6.1) |
| Tamano del repo | 0.9 GB |
| Pipeline | text-to-speech |
| Modelo base | Lucasgitguy-co/LvW-Ming-TTS-0.5B |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un transformer denso orientado a text-to-speech, con un encoder de hablante CAM++ para la extracción de embeddings de voz que habilita la clonación. Esta versión concreta es una conversión de pesos a MLX con cuantización afín de 4 bits, realizada con mlx-audio 0.6.6. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El autor documenta explícitamente los resultados de la compuerta de publicación fijada antes del entrenamiento, y todos fallan: el error medio es del 7,11% frente al 6,99% del modelo base (regla: inferior al base); hay 3 fallos de parada sobre 420 frente a 2/420 del base (regla: no superiores); y el español empeora más de lo permitido (regla: ningún idioma más de un 10% o +0,5 puntos peor). Además, la comprobación de formato también falla: sobre 30 frases reservadas en inglés y chino, el error medio es del 9,38% frente al 6,91% del modelo PyTorch con las mismas frases y voces.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en siete idiomas: zh, en, de, es, fr, ko, ja.
- Clonación de voz mediante audio de referencia y su transcripción exacta (`--ref_audio` y `--ref_text`).
- Voces integradas predefinidas (por ejemplo, `US_Emma`).
- Selección de idioma mediante el parámetro `--lang_code` (de, es, fr, ko, ja).
- Ejecución en hardware Apple Silicon a través de mlx-audio.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Prototipado de TTS en Mac con Apple Silicon: permite probar rápidamente la generación de voz localmente sin GPU dedicada, usando mlx-audio y el comando `mlx_audio.tts.generate`.
- Evaluación e inspección de un fine-tune fallido: sirve como caso de estudio reproducible de un modelo que no superó su compuerta de calidad, útil para investigadores que analicen regresiones de fine-tuning.
- Generación de voz multilingüe de prueba: con soporte para siete idiomas, puede emplearse para generar muestras en español, francés, alemán, coreano o japonés en entornos de experimentación.
- Clonación de voz en investigación: el encoder CAM++ permite experimentar con embeddings de hablante, siempre con consentimiento y para uso legítimo.
- Pruebas de integración de mlx-audio: útil para validar pipelines de conversión y carga de modelos cuantizados en 4 bits en la librería.
- Docencia y demostraciones: por su tamaño reducido (repo de 0,9 GB) y licencia MIT, encaja en talleres sobre TTS local en macOS.

## Benchmarks y rendimiento

El autor publica métricas de su compuerta de calidad (tasa de error media, fallos de parada y comparación por idioma), no benchmarks estándar de TTS como MOS ni WER sobre corpus públicos.

| Metrica | Base | Este modelo | Resultado |
|---|---|---|---|
| Error medio (test reservado) | 6,99% | 7,11% | FAIL |
| Fallos de parada | 2/420 | 3/420 | FAIL |
| Peor idioma | — | es peor | FAIL |
| Error medio formato (30 frases en/zh) | 6,91% (PyTorch) | 9,38% | FAIL |

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repo pesa 0,9 GB en cuantización de 4 bits, por lo que la inferencia requiere del orden de 1-2 GB de memoria, aunque no se dispone de una cifra oficial.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA.
- GPU recomendadas: no aplica en el sentido tradicional; requiere chips Apple (M1, M2, M3, M4 o superiores).
- ¿Cabe en consumer GPU? El formato es MLX, orientado a Mac; no se documenta soporte para GPU de consumo NVIDIA.
- Opciones de despliegue: mlx-audio (>= 0.6.1). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LvW-Ming-TTS-0.5B-MLX-4bit | 1.479 M (4-bit) | no disponible | 7 | MIT | Fine-tune fallido; solo MLX |
| LvW-Ming-TTS-0.5B (base) | no disponible | no disponible | 7 | MIT | Recomendado por el autor frente a esta versión |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El fine-tune no supera al modelo base: error medio superior (7,11% vs 6,99%), más fallos de parada (3/420 vs 2/420) y regresión en español. El autor recomienda usar el modelo base para uso real.
- La comprobación de formato falla: 9,38% de error medio frente al 6,91% del modelo PyTorch en las mismas frases y voces.
- Requiere mlx-audio 0.6.1 o superior; las versiones 0.6.0 y anteriores cargan el modelo pero pronuncian palabras incorrectas.
- Los embeddings de hablante CAM++ no se extraen automáticamente en mlx-audio.
- La normalización de texto no está portada: hay que escribir los números como palabras.
- Riesgo de alucinación y errores de pronunciación inherentes a un modelo que no supera su validación de calidad.
- Solo ejecutable en el ecosistema MLX (Apple Silicon); no hay soporte documentado para otras plataformas.
- Uso responsable: la clonación de voz y las voces integradas son para investigación y uso creativo legítimo; no suplantar a personas reales sin consentimiento, no engañar y etiquetar el audio sintético como tal.
- Licencia MIT, que permite uso comercial, pero sin garantías de calidad dado el estado del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-4bit
- Modelo base: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
