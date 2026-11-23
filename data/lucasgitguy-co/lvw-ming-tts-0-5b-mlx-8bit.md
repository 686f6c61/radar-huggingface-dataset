# Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-8bit

## Resumen

LvW-Ming-TTS-0.5B-MLX-8bit es una conversión al formato MLX con cuantización de 8 bits del modelo de síntesis de voz (text-to-speech) Lucasgitguy-co/LvW-Ming-TTS-0.5B, publicada por el usuario Lucasgitguy-co. El objetivo del artefacto es permitir la inferencia de un modelo TTS con clonación de voz sobre hardware Apple Silicon mediante la librería mlx-audio, aprovechando el backend MLX de Apple. La conversión se realizó con `mlx_audio.convert` (mlx-audio 0.6.6) aplicando cuantización afín de 8 bits, e incluye el encoder de hablante CAM++ (`campplus.safetensors`) convertido con el conversor propio de mlx-audio.

El dato más relevante para cualquier evaluador es que la model card declara explícitamente que la release gate ha fallado: el fine-tune no supera al modelo base en el conjunto de test reservado. Concretamente, el error medio es del 7,11 % frente al 6,99 % del base, los fallos de parada aumentan de 2/420 a 3/420, y el idioma español empeora más de lo permitido por la regla predefinida (+0,5 puntos, con umbral del 10 %). El autor publica el modelo tal cual para que el resultado pueda inspeccionarse y recomienda usar el modelo base para uso real.

A pesar de la nomenclatura "0.5B" del identificador, el recuento real de parámetros en los safetensors es de 1.479.454.868 (aproximadamente 1,48 mil millones), lo que conviene tener en cuenta al estimar requisitos de memoria. El modelo soporta siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés), clonación de voz por referencia de audio y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS denso; tag `dense`; incluye encoder de hablante CAM++) |
| Parametros totales | 1.479.454.868 (según safetensors; el identificador indica 0.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine (MLX); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | zh, en, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 8-bit); incluye `campplus.safetensors` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta `dense` y de que se trata de un sistema de text-to-speech con clonación de voz que incorpora un encoder de hablante CAM++ para la extracción de embeddings de locutor. El modelo base se denomina LvW-Ming-TTS-0.5B y esta publicación es una conversión cuantizada del mismo, no un entrenamiento nuevo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de este artefacto es la conversión a MLX con cuantización afín de 8 bits mediante `mlx_audio.convert` (versión 0.6.6 de mlx-audio), orientada a ejecución en Apple Silicon. La model card reporta una comprobación de formato superada: sobre 30 frases reservadas en inglés y chino, el error medio es del 6,93 % frente al 6,91 % del modelo PyTorch con las mismas frases y voces, es decir, una degradación por cuantización inferior a 0,02 puntos porcentuales. Sin embargo, la evaluación funcional del fine-tune frente al base falla las tres reglas predefinidas.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.
- Clonación de voz mediante audio de referencia (`--ref_audio`) y su transcripción exacta (`--ref_text`).
- Voces integradas predefinidas (por ejemplo, `US_Emma`).
- Selección de idioma de salida mediante `--lang_code` (de, es, fr, ko, ja).
- Ejecución en hardware Apple Silicon a través de la librería mlx-audio.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Generación de locuciones para prototipos en Mac: ejecutar `mlx_audio.tts.generate` con una voz integrada permite obtener audio en segundos sin GPU dedicada, aprovechando el backend MLX en Apple Silicon.
- Clonación de voz para investigación: usar `--ref_audio` y `--ref_text` con una grabación propia permite estudiar la fidelidad del encoder CAM++ y del modelo TTS en un entorno local.
- Doblaje y localización de contenidos multicanal: el soporte de siete idiomas con `--lang_code` facilita generar pistas de voz en distintos idiomas desde un mismo pipeline, aunque el español muestra un deterioro documentado frente al base.
- Accesibilidad y lectura de textos: convertir documentos a voz para personas con dificultades de lectura, ejecutando el modelo en local y sin enviar texto a servicios externos.
- Evaluación comparativa de cuantizaciones: al existir versión base y versión 8-bit MLX, sirve para medir el impacto de la cuantización afín en calidad de síntesis (el autor reporta 6,93 % frente a 6,91 % de error medio).
- Integración en aplicaciones macOS nativas: la librería mlx-audio permite incorporar el modelo en apps de escritorio para Apple Silicon sin depender de CUDA.
- Generación de audio para contenido creativo etiquetado como sintético, respetando las restricciones de uso responsable heredadas del modelo base.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K u otros), pero sí una evaluación propia de calidad de síntesis con reglas predefinidas antes del entrenamiento:

| Regla (fijada antes del entrenamiento) | Base | Este modelo | Resultado |
|---|---|---|---|
| Error medio inferior al base | 6,99 % | 7,11 % | Falla |
| Fallos de parada no superiores | 2/420 | 3/420 | Falla |
| Ningún idioma más de un 10 % (+0,5 pt) peor | — | es peor | Falla |

| Comprobación de formato | PyTorch | MLX 8-bit |
|---|---|---|
| Error medio en 30 frases reservadas en/zh | 6,91 % | 6,93 % |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con 1,48 mil millones de parámetros en 8 bits, el peso de los safetensors ronda 1,6 GB (tamaño del repo); la inferencia requiere además memoria para activaciones y el encoder CAM++.
- Hardware objetivo: Apple Silicon (MLX); no está pensado para GPU NVIDIA.
- GPU recomendadas: no disponible para CUDA; en Apple, cualquier chip de la familia M con memoria unificada suficiente.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada; no se especifican mínimos exactos.
- Opciones de despliegue: mlx-audio (versión 0.6.1 o superior; las versiones 0.6.0 y anteriores cargan el modelo pero pronuncian palabras incorrectas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LvW-Ming-TTS-0.5B-MLX-8bit (este) | 1.479.454.868 (8-bit) | no disponible | zh, en, de, es, fr, ko, ja | MIT | Release gate fallida; recomendado usar el base |
| LvW-Ming-TTS-0.5B (base) | no disponible | no disponible | no disponible | MIT (según herencia) | Referencia del autor; mejor error medio (6,99 % frente a 7,11 %) |
| Otros modelos TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La release gate del fine-tune ha fallado: no supera al modelo base en error medio, fallos de parada ni en el idioma español; el autor recomienda el modelo base para uso real.
- El español empeora más de lo permitido por la regla predefinida (+0,5 puntos sobre el umbral del 10 %).
- mlx-audio 0.6.0 y anteriores cargan el modelo pero generan palabras incorrectas; es obligatorio usar 0.6.1 o superior.
- Limitaciones de mlx-audio: los embeddings de hablante CAM++ no se extraen automáticamente y la normalización de texto no está portada; hay que escribir los números como palabras.
- Riesgo de alucinación o pronunciación incorrecta en texto no normalizado.
- Restricciones de uso responsable: la clonación de voz y las voces integradas son para investigación y uso creativo legítimo; no suplantar a personas reales sin consentimiento, no engañar ni infringir la ley; etiquetar el audio sintético cuando pueda confundirse con una grabación real.
- Licencia MIT: permite uso comercial, pero las restricciones de uso responsable anteriores deben respetarse.
- No se documentan sesgos específicos ni límites de longitud de texto o contexto.
- El recuento real de parámetros (1,48 mil millones) no coincide con la nomenclatura "0.5B" del identificador, lo que puede inducir a error en la planificación de recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-8bit
- Modelo base: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
