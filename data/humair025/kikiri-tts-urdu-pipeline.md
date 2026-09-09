# humair025/kikiri-tts-urdu-pipeline

## Resumen

`humair025/kikiri-tts-urdu-pipeline` es un repositorio que contiene un pipeline de fine-tuning para síntesis de texto a voz (TTS) en urdu, no un modelo preentrenado listo para inferencia. Ha sido desarrollado por Humair Munir (`humair025`) e integra varios componentes open source: el modelo TTS preentrenado `Kokoro-82M` de Hexgrad, la receta de entrenamiento en dos etapas de `semidark/StyleTTS2`, un conversor grafema a fonema urdu (`urdu_g2p`) con tokenizer compatible con Kokoro, y patrones de infraestructura de FlowTTS, incluyendo carga de datasets desde HuggingFace Hub, guardado y recuperación de checkpoints, EMA y registro de audio en TensorBoard.

El problema que resuelve es la falta de recursos y herramientas de fine-tuning para generar voces en urdu. Reutilizando un modelo base pequeño (82 M parámetros en Kokoro) y agregando soporte fonémico específico para urdu, este pipeline permite experimentar con la adaptación de un sistema TTS a un idioma con pocos recursos. La relevancia radica en que ofrece una base reproducible para investigar TTS en urdu, con scripts de preparación de datasets, tests automáticos y una estructura modular documentada, aunque no incluye pesos del modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M como modelo base TTS; receta de entrenamiento de StyleTTS2 (Stage 1 y Stage 2); pipeline de integración en Python |
| Parametros totales | Kokoro-82M base: ~82M; decoder Kokoro: ~53M; StyleTTS2 completo: ~190M (según la documentación del repositorio); modelo final fine-tuned: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no aplica contexto de tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Urdu (objetivo del fine-tuning); el modelo base Kokoro-82M soporta otros idiomas según su documentación original |
| Licencia | No disponible (el repositorio incluye archivos LICENSE y NOTICE, pero no se especifica el tipo) |
| Formato de pesos | Pesos PyTorch (.pth); también se pueden subir y descargar desde HuggingFace Hub mediante el `KikiriCheckpointer` |

## Arquitectura y entrenamiento

El pipeline se apoya en la arquitectura de `Kokoro-82M`, un modelo TTS con un vocabulario de 178 tokens fonémicos. Sobre esta base se integra la receta de entrenamiento de StyleTTS2, que incluye un `build_model()` con modelos auxiliares (PLBERT, ASR, JDC) necesarios para el entrenamiento en dos etapas (Stage 1 y Stage 2). El decoder de Kokoro, con 53 M parámetros, está parcheado para ejecución en CPU, pero su entrenamiento puede ser lento.

Para el ajuste al urdu, el repositorio añade un tokenizer propio desarrollado sobre `urdu_g2p`, con un vocabulario rellenado (`kokoro_vocab_178.json`) para asegurar que todos los IDs sean menores o iguales a 177. Los datos de entrenamiento se cargan desde el dataset `humair025/koku` (audio a 24 kHz) o desde listas locales en formato StyleTTS2. El entrenamiento no emplea RLHF ni DPO, ya que se trata de un sistema TTS; las innovaciones técnicas destacables son la adaptación fonémica al urdu, el soporte de EMA para múltiples componentes y la integración con HuggingFace Hub para reanudar entrenamientos.

## Capacidades

- Fine-tuning end-to-end de Kokoro-82M para urdu, con vocabulario fonémico de 178 tokens.
- Entrenamiento en dos fases siguiendo la receta StyleTTS2 (Stage 1 y Stage 2), con pérdidas de espectrograma multi-resolución, WavLM y adversaria.
- Carga de datasets desde HuggingFace Hub (`humid025/koku`) o desde listas locales en formato `train_list.txt`.
- Guardado y recuperación de checkpoints en HuggingFace Hub, con detección del mejor checkpoint y reanudación automática.
- Registro de audio de entrenamiento en TensorBoard mediante `audio_logger.py`.
- Inclusión de scripts de preparación de dataset (MP3 a WAV, extracción de IPA, agrupación de hablantes).
- Script de inferencia (`test_inference.py`) que carga un checkpoint entrenado y genera audio.
- Verificación de compatibilidad de pesos del Kokoro original con el tokenizer personalizado (carga bit por bit y comprobación de IDs).
- No incluye soporte de tool calling, función de agentes ni multi-step reasoning, al no aplicarse a modelos TTS.

## Casos de uso

- Fine-tuning de una voz urdu personalizada para un asistente virtual: se puede preparar un dataset de audios en urdu con `prepare_dataset.py`, generar las listas de entrenamiento y ejecutar `train_real_styletts2.py` para adaptar Kokoro a una voz concreta, adecuada para aplicaciones de asistente por voz.
- Síntesis automática de audiolibros en urdu: una vez entrenado el modelo, el script `test_inference.py` permite generar audio a partir de texto en urdu, posibilitando la narración automática de contenido largo como novelas o material educativo.
- Investigación y prototipado en TTS multilingüe: el pipeline está modularizado para que el grapheme-to-phoneme pueda cambiarse, lo que permite investigar la adaptación de Kokoro a otros idiomas con pocos recursos.
- Evaluación de datasets TTS en urdu: la integración con HuggingFace Hub y la carga de `humair025/koku` permiten probar datasets públicos de forma rápida, comparando la calidad de audio antes de entrenar.
- Experimentación académica en entornos de investigación: los scripts de preparación (`prepare_training.py`), el entrenamiento en dos etapas y el EMA facilitan ejecutar experimentos controlados con checkpoints, útil para tesis o estudios comparativos.
- Generación de contenido accesible en aplicaciones móviles: el modelo finetuned puede integrarse en una app para leer en voz alta mensajes de texto, notificaciones o interfaces en urdu, mejorando la accesibilidad para usuarios con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El pipeline describe entrenamiento; no se indican requisitos de VRAM.
- GPU recomendadas: no disponible. La documentación menciona que el entrenamiento con decoder es lento en CPU.
- Compatibilidad con GPU consumer: probablemente compatible dado el tamaño pequeño del modelo base Kokoro-82M, pero no confirmado con datos concretos.
- Opciones de despliegue: scripts de inferencia Python (`scripts/test_inference.py`); no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Como referencia durante la búsqueda web, se encontró el proyecto `ahmedHanzala/urdu-tts`, pero no se dispone de especificaciones comparables, métricas ni licencias para realizar una comparación técnica rigurosa.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo entrenado listo para uso; es necesario ejecutar el pipeline, descargar los pesos base de Kokoro-82M y los pesos auxiliares de StyleTTS2 (ASR, JDC, PLBERT), que no están incluidos en el repositorio.
- Sin los pesos auxiliares de StyleTTS2, el script `build_model()` no puede funcionar; solo `train_real_e2e.py` opera con un predictor de mel simplificado.
- El entrenamiento en CPU es lento, especialmente cuando se activa el decoder (`--include_decoder`), según la propia documentación del repositorio.
- El tokenizer de urdu es de desarrollo propio y utiliza un vocabulario con huecos rellenados; se advierte que todos los IDs deben ser menores o iguales a 177, lo que puede limitar la compatibilidad con vocabularios originales.
- La licencia no está especificada. Antes de cualquier uso comercial o redistribución es obligatorio revisar los archivos `LICENSE` y `NOTICE` del repositorio, así como las licencias de los componentes de terceros (Kokoro-82M, StyleTTS2, urdu_g2p).
- No se han publicado benchmarks ni evaluaciones de sesgos, alucinaciones o calidad de voz; el rendimiento real debe ser validado por el usuario.
- La dependencia de `urdu_g2p` se instala desde fuente, lo que puede generar problemas de entorno y versiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/humair025/kikiri-tts-urdu-pipeline
- Dataset relacionado del autor: https://huggingface.co/datasets/humair025/Urdu-TTS-v1
- Proyecto alternativo de TTS urdu en GitHub: https://github.com/ahmedHanzala/urdu-tts
- Modelo base Kokoro-82M en HuggingFace: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de referencia StyleTTS2: https://huggingface.co/semidark/StyleTTS2
