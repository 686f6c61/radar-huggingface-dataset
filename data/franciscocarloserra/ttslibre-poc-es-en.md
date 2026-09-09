# FranciscoCarlosErra/ttslibre-poc-es-en

## Resumen

TTSLibre – Spanish + English proof of concept es un modelo de síntesis de voz (TTS) cero-shot desarrollado por FranciscoCarlosErra dentro del proyecto TTSLibre, un recetario abierto para construir sistemas TTS pequeños. Se trata del experimento 016, que intercala datos de entrenamiento en español argentino y en inglés para producir un modelo bilingüe. Con aproximadamente 19,8 millones de parámetros, emplea una arquitectura de la línea Supertonic: entrada por caracteres, modelado de flujo (flow matching) sobre un espacio latente comprimido de un autoencoder de mel y un vocoder Vocos para generar el audio final. El modelo es capaz de clonar la voz de un hablante a partir de un clip de referencia de pocos segundos (zero-shot) en ambos idiomas. Fue entrenado desde cero en una RTX 3090 con tan solo 4 horas de OpenSLR 61 es-AR y 4 horas de LibriTTS-R, lo que lo convierte en un experimento de bajo coste para evaluar la receta. No debe considerarse un producto listo para producción: es un checkpoint intermedio de una corrida aún en curso, seleccionado por tiempo transcurrido, sin evaluación completa sobre validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Supertonic-lineage: entrada por caracteres, flow matching sobre latente de autoencoder comprimido, vocoder Vocos |
| Parametros totales | ~19,8 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Español (es, incluida variante argentina), Inglés (en) |
| Licencia | Pesos y voicepacks: CC BY-SA 4.0; código del repositorio: MIT |
| Formato de pesos | PyTorch `.pt` (weights only), además de `vocab.json`, `latent_stats.pt`, `config.json`, `ref_default.wav` y voicepacks en `voices/*.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Supertonic descrita en el repositorio TTSLibre: el texto se codifica mediante un vocabulario de caracteres, se genera un latente de mel de 24 dimensiones con una compresión de 6x mediante un autoencoder, y finalmente el vocoder Vocos transforma ese latente en audio de 24 kHz. El componente principal es un modelo de flujo (flow matching) que opera sobre el espacio latente comprimido.

El entrenamiento se realizó desde cero sobre una mezcla intercalada al 50/50 de 4 horas de OpenSLR 61 (es-AR) y 4 horas de LibriTTS-R (en), con un 5% de datos reservados para validación. Se usó una GPU RTX 3090, batch de 32 a 48, learning rate 5e-4 e inicialización aleatoria. No se menciona uso de RLHF o DPO. La innovación destacable es la incorporación de etiquetas de idioma como tokens adicionales: cada texto se envuelve en `<es>...</es>` o `<en>...</en>`, lo que amplía el vocabulario de 80 a 84 tokens. El idioma se detecta automáticamente a partir del texto, aunque también se puede forzar mediante el parámetro `lang`.

## Capacidades

- Síntesis de voz cero-shot: puede generar la voz de un hablante nuevo a partir de un clip de referencia de 5 a 10 segundos.
- Generación de habla en español y en inglés, con detección automática de idioma o forzado explícito.
- Soporte de voicepacks preentrenados para hablantes específicos de los datasets de entrenamiento (OpenSLR 61) y también para hablantes de LibriTTS-R no presentes en el entrenamiento (zero-shot).
- Uso en memoria: se puede cargar el modelo una vez y generar múltiples audios mediante la clase `Synth`.
- Ejecución en GPU o CPU, con soporte para decodificación mediante `steps` y `cfg` (classifier-free guidance).
- No soporta tool calling, agentes, visión o generación de texto: es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Evaluación académica de recetas TTS abiertas: el modelo permite comparar el efecto de la mezcla bilingüe en un TTS pequeño, usando los otros PoCs del mismo autor como referencia.
- Clonación de voz rápida para prototipos: con un audio de referencia de 5 a 10 segundos de un hablante desconocido, se puede generar una locución en español o inglés para maquetas de audio.
- Generación de datos de entrenamiento sintéticos: los voicepacks incluidos permiten producir audios con voces controladas para pruebas de sistemas de reconocimiento o síntesis.
- Aprendizaje de pipelines TTS con flow matching: el código y los checkpoints facilitan reproducir el flujo completo (caracteres, autoencoder, flow, vocoder) con fines didácticos.
- Prueba de detección automática de idioma en TTS multilingüe: al etiquetar el texto con `<es>` o `<en>`, sirve para validar mecanismos de control de idioma en síntesis de voz.
- Generación de voces para videojuegos o narrativa experimental: el soporte zero-shot permite usar voces de hablantes no vistos durante el entrenamiento para crear personajes.
- Integración en entornos de investigación de audio local en CPU: al ser un modelo de ~19,8 millones de parámetros, se puede ejecutar sin GPU, facilitando pruebas en equipos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU o HumanEval, dado que es un modelo TTS. La información disponible incluye una tabla de valores WER de seguimiento durante el entrenamiento, medida con Whisper como transcripción de referencia. Estos valores son aproximados y no constituyen una evaluación formal de validación.

| Tiempo | Paso | WER heldout en | WER novel en | WER heldout es | WER novel es |
|---|---|---|---|---|---|
| 2h24m | 42000 | 0,73 | 0,00 | 0,50 | 0,67 |
| 2h36m | 45000 | 0,54 | 0,29 | 0,72 | 0,56 |
| 2h49m | 48000 | 0,47 | 0,00 | 0,46 | 0,44 |
| 3h01m | 51000 | 0,40 | 0,14 | 0,79 | 0,56 |
| 3h13m (checkpoint) | 54000 | 0,63 | 0,14 | 0,38 | 0,78 |

Como referencia interna, el PoC 014 entrenado solo en español con 8 horas alcanzó un WER de validación de 0,38 a las 2h21 y de 0,10 a las 3h30. El presente checkpoint, a las 3h13, obtiene 0,38 en español y 0,63 en inglés en las frases de validación.

## Requisitos de hardware

- Inferencia en GPU o CPU; probado con Python 3.12 y torch 2.10 (CUDA 12.8).
- Entrenamiento realizado en una sola GPU RTX 3090.
- VRAM estimada para inferencia: no disponible. Dado el tamaño de ~19,8 millones de parámetros, se espera un consumo reducido, pero no hay un valor publicado.
- GPU recomendadas: no se especifican; al ser un modelo pequeño, cualquier GPU con soporte CUDA debería ser suficiente.
- Sí cabe en GPU de consumo general (por ejemplo, una RTX 3060 o superior), aunque no hay datos oficiales de VRAM.
- Opciones de despliegue: script `synth.py` del repositorio TTSLibre, uso en memoria con la clase `Synth` en Python. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje autoregresivo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Datos de entrenamiento | Etiquetas de idioma | Disponibilidad |
|---|---|---|---|---|---|
| ttslibre-poc-es-en | ~19,8M | es, en | 4 h OpenSLR 61 + 4 h LibriTTS-R | Sí | HuggingFace |
| ttslibre-poc-en | ~19,8M | en | 4 h LibriTTS-R (según modelo anterior) | No | HuggingFace |
| ttslibre-poc-es-ar | ~19,8M | es-AR | 4 h OpenSLR 61 (según modelo anterior) | No | HuggingFace |

Diferencias clave: el modelo evaluado es el único que mezcla los dos idiomas y añade tokens de lengua al vocabulario. Los otros dos PoCs son monólogos y no incluyen el mecanismo de etiquetado de idioma. Todos comparten arquitectura y código.

## Limitaciones y advertencias

- No es un producto usable: se trata de un checkpoint intermedio de una corrida en curso, elegido por tiempo de pared, sin evaluación completa sobre validación.
- El WER de seguimiento muestra valores altos en algunos casos (por ejemplo, novel es 0,78 en el checkpoint actual), lo que indica errores de síntesis en frases no vistas.
- Los datos de entrenamiento son escasos: 4 horas por idioma, con pocos hablantes por lengua.
- La detección automática de idioma puede fallar; si el texto es ambiguo, es recomendable forzar el idioma con `lang`.
- No se han publicado cuantizaciones; los pesos están en formato PyTorch `.pt` y requieren el código del repositorio para su carga.
- La licencia de los pesos y voicepacks es CC BY-SA 4.0, lo que exige compartir derivados bajo la misma licencia. El código del repositorio es MIT.
- Al ser un TTS con datos limitados, el riesgo de pronunciaciones incorrectas o artefactos de audio es alto, especialmente con textos fuera del dominio de entrenamiento.
- Los sesgos de voz están acotados a los hablantes de OpenSLR 61 y LibriTTS-R, con predominio del acento argentino en español.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FranciscoCarlosErra/ttslibre-poc-es-en
- Repositorio TTSLibre: https://github.com/franciscocarloserra/ttslibre
- Otros PoCs relacionados: https://huggingface.co/FranciscoCarlosErra/ttslibre-poc-en y https://huggingface.co/FranciscoCarlosErra/ttslibre-poc-es-ar
- Dataset OpenSLR 61: https://www.openslr.org/61/
- Vocoder Vocos: https://huggingface.co/charactr/vocos-mel-24khz
