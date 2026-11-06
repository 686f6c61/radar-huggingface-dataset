# jmoraleses/folio-melo-en-mlx

## Resumen

Folio Melo MLX (en) es un checkpoint de inferencia del modelo de síntesis de voz MeloTTS, en su variante VITS2 para inglés, convertido a Safetensors y adaptado a la librería MLX de Apple para ejecución nativa en Swift sobre Apple Silicon. Lo publica el usuario jmoraleses como artefacto auxiliar del proyecto Folio iOS, una aplicación de código abierto que implementa la inferencia en Swift/MLX en lugar de depender de PyTorch o de un runtime Python en el dispositivo. No es un lanzamiento oficial de MyShell: se trata de una conversión derivada del checkpoint original `myshell-ai/MeloTTS-English`.

El modelo resuelve un problema muy concreto: llevar un TTS neuronal de calidad razonable a un dispositivo móvil Apple sin servidor, con un peso de apenas 41,6 millones de parámetros y un repositorio de 0,2 GB. Frente a los TTS basados en difusión o en modelos de lenguaje grandes, MeloTTS apuesta por una arquitectura VITS2 ligera con decodificador de flujo y predictor de duración, lo que permite latencias bajas en CPU/GPU integrada. La conversión excluye deliberadamente el discriminador de entrenamiento, el cuantizador y los artefactos del predictor de duración, de modo que el archivo resultante contiene solo lo necesario para inferencia.

La relevancia actual del repositorio es limitada pero específica: sirve como referencia para quien quiera integrar TTS en una app iOS nativa con MLX, y como ejemplo de conversión de un checkpoint VITS2 a Safetensors con configuración explícita de dimensiones, símbolos e identificadores de idioma. No hay model card extensa, ni benchmarks, ni datos de entrenamiento publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS2 (TTS end-to-end, variante MeloTTS) |
| Parámetros totales | 41.576.193 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos en Safetensors, presumiblemente FP32/FP16; no se especifica) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`model.safetensors`) + `config.json` + `source.json` |

## Arquitectura y entrenamiento

El checkpoint corresponde a MeloTTS en su variante VITS2, una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un predictor de duración, un decodificador de flujo (flow-based) y un vocoder integrado. MeloTTS añade sobre VITS2 mejoras de entrenamiento y un front-end multilingüe basado en BERT para el procesamiento del texto de entrada; en el caso del inglés, el checkpoint original de MyShell es el que se ha convertido. El archivo publicado contiene únicamente los pesos de inferencia: el discriminador usado durante el entrenamiento, el cuantizador y los artefactos del predictor de duración han sido excluidos según la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste fino adicional en esta conversión. La model card indica que la inferencia se implementa en Swift/MLX dentro de la app Folio y que el script de conversión está en el repositorio `jmoraleses/Folio-iOS`, en `Scripts/convert-melo-to-mlx.py`. El checkpoint fuente está fijado a la revisión `bb4fb7346d566d277ba8c8c7dbfdf6786139b8ef` de `myshell-ai/MeloTTS-English`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Generación de audio con prosodia y duración controladas por el predictor de duración interno.
- Inferencia on-device en Apple Silicon mediante MLX y Swift.
- Ejecución sin dependencias de Python en tiempo de inferencia (la app implementa el grafo en Swift).
- No soporta tool calling, function calling ni razonamiento multi-step: no es un modelo de lenguaje.
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés en este checkpoint (la model card menciona un checkpoint BERT francés para la variante francesa, pero no se incluye aquí).

## Casos de uso

- Lectura de artículos y notas en una app iOS: el modelo convierte texto a voz en el dispositivo con 41,6 M de parámetros, lo que permite mantener la privacidad del contenido sin enviarlo a un servidor.
- Accesibilidad para personas con discapacidad visual: integración en un lector de pantalla nativo que sintetice contenido dinámico con latencia baja gracias a la ejecución MLX en la GPU integrada.
- Audiolibros y podcasts generados localmente: el checkpoint permite generar narración por lotes en el Mac del usuario, sin coste por token ni dependencia de APIs externas.
- Asistentes de voz embebidos: combinado con un ASR y un LLM local, el TTS cierra el bucle conversacional en el dispositivo, manteniendo la conversación fuera de la nube.
- Prototipado de interfaces de voz en Swift: sirve como referencia para desarrolladores que quieran portar un TTS VITS2 a MLX y comparar latencias frente a Core ML o AVSpeechSynthesizer.
- Pruebas de regresión de pipelines TTS: al ser un checkpoint fijo con revisión anclada, permite reproducir exactamente la misma salida de audio en tests automatizados de la app Folio.
- Generación de avisos y notificaciones habladas: el tamaño reducido (0,2 GB de repo) permite incluirlo en el bundle de una app sin disparar el peso de la descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 41,6 M de parámetros, el checkpoint en FP32 ocupa aproximadamente 166 MB y en FP16 unos 83 MB, por lo que cabe holgadamente en la memoria unificada de cualquier Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1 o posterior) es suficiente; el modelo está pensado para ejecución on-device, no para GPU de servidor.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y presumiblemente en iPhone/iPad recientes con MLX.
- Opciones de despliegue: MLX con implementación en Swift (repo Folio iOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Folio Melo MLX (en) | 41,6 M | inglés | MIT | Safetensors + MLX/Swift | Hugging Face (este repo) |
| MeloTTS-English (original) | no disponible en la información | inglés | MIT | PyTorch | Hugging Face (`myshell-ai/MeloTTS-English`) |
| Piper TTS | no disponible en la información | multilingüe | MIT (según proyecto) | ONNX | GitHub / Hugging Face |
| Coqui TTS (VITS) | variable según checkpoint | multilingüe | MPL-2.0 / según checkpoint | PyTorch | GitHub |

La comparación se limita a la categoría (TTS ligero on-device); no se dispone de datos de benchmarks que permitan comparar calidad objetiva entre ellos.

## Limitaciones y advertencias

- Es un modelo TTS, no un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones complejas.
- Solo inglés en este checkpoint; no se ha validado su comportamiento con otros idiomas.
- No es un lanzamiento oficial de MyShell; es una conversión de terceros, por lo que la calidad y el soporte dependen del autor del repo.
- La model card no documenta el proceso de conversión más allá de la exclusión de discriminador, cuantizador y predictor de duración; no hay garantía de paridad numérica con el checkpoint original.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir pronunciaciones incorrectas en nombres propios, siglas y texto no estándar.
- Sesgos: no documentados; al derivar de MeloTTS-English, hereda los sesgos del dataset original, no especificado aquí.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del checkpoint fuente y de las dependencias (BERT francés solo aplica a la variante FR).
- El repositorio tiene 30 descargas y 0 likes en el momento de la consulta: es un artefacto de nicho, sin comunidad que lo valide.
- Para producción en iOS conviene medir latencia real en el dispositivo objetivo; no hay cifras publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/jmoraleses/folio-melo-en-mlx
- Checkpoint fuente: https://huggingface.co/myshell-ai/MeloTTS-English
- Repositorio Folio iOS (script de conversión en `Scripts/convert-melo-to-mlx.py`): https://github.com/jmoraleses/Folio-iOS
- BERT francés referenciado (solo variante FR): https://huggingface.co/dbmdz/bert-base-french-europeana-cased
