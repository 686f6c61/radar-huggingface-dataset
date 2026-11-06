# mlx-community/Audio8-TTS-Realistic-0.6b-bf16

## Resumen

Audio8-TTS-Realistic-0.6b-bf16 es la conversión a MLX del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-0.6b, publicada por la comunidad mlx-community para su ejecución nativa en Apple Silicon. Se trata de un sistema text-to-speech multilingüe de 601 millones de parámetros con clonación de voz zero-shot, es decir, capaz de imitar una voz a partir de un único clip de referencia sin entrenamiento adicional.

El modelo emplea la arquitectura `arktts`, un transformer DualAR en el que un autoregresivo lento de 24 capas predice un token semántico por frame y un autoregresivo rápido de 4 capas predice diez codebooks del códec por frame. Incluye un códec neuronal empaquetado a 44,1 kHz en fp32, mientras que los pesos del modelo de lenguaje se distribuyen en bf16. Es sucesor del checkpoint Preview-0.6b, afinado con refuerzo (RL), con la misma arquitectura y tokenizador pero pesos distintos.

Su relevancia actual radica en dos factores: cubre 17 idiomas (11 originales más seis nuevos medidos con tasas de error del 1 al 7 %) y ofrece una licencia Apache-2.0 heredada del modelo base, lo que facilita su integración comercial. La conversión MLX mantiene una paridad prácticamente exacta con la referencia PyTorch, con diferencias máximas de 7,1e-6 en la forma de onda decodificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | arktts, transformer DualAR (AR lento de 24 capas + AR rápido de 4 capas) |
| Parametros totales | 601.159.424 (0,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (modelo de lenguaje) y fp32 (códec); no se documentan otras variantes en este repo |
| Idiomas soportados | yue, zh, nl, en, fi, fr, de, id, it, ja, ko, ms, pl, pt, ru, es, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); el códec se distribuye como `codec.safetensors` convertido desde `codec.pth` |

## Arquitectura y entrenamiento

La arquitectura `arktts` es un transformer DualAR orientado a TTS. Un autoregresivo lento de 24 capas genera un token semántico por frame temporal; a continuación, un autoregresivo rápido de 4 capas expande cada frame en diez codebooks del códec neuronal. El códec empaquetado opera a 44,1 kHz y se distribuye en fp32 con weight-norm plegado y convoluciones en layout channels-last de MLX. El modelo de lenguaje se mantiene en bf16 tal como lo publicó el autor original.

El checkpoint Realistic es un ajuste con refuerzo (RL) sobre Audio8-TTS-Preview-0.6b, cuyo AR lento deriva de Qwen2.5-0.5B (Apache-2.0). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de SFT o DPO. La conversión a MLX declara paridad con la referencia PyTorch (fp32, CPU, transformers 4.57.3): salidas de unidades y bloques dentro de 1e-3, codificación del audio de referencia 100 % exacta en códigos, generación greedy idéntica token a token en los 129 frames de la utterance de validación y diferencia máxima absoluta de 7,1e-6 en la forma de onda decodificada.

## Capacidades

- Síntesis de voz multilingüe en 17 idiomas: cantonés, chino, neerlandés, inglés, finés, francés, alemán, indonesio, italiano, japonés, coreano, malayo, polaco, portugués, ruso, español y turco.
- Clonación de voz zero-shot a partir de un clip de referencia y su transcripción; la transcripción debe coincidir con el audio de referencia.
- Síntesis con voz por defecto cuando no se proporciona `ref_audio`.
- Control de muestreo mediante `temperature`, `top_p` y `top_k`.
- Salida de audio a 44,1 kHz gracias al códec neuronal empaquetado.
- Integración con la librería mlx-audio (≥ 0.4.7) y con el paquete Swift mlx-audio8-tts-swift (`Audio8RealisticPackage`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Audiolibros y narración automatizada: el modelo sintetiza texto largo en 17 idiomas con una voz consistente clonada de un narrador, manteniendo la similitud de hablante medida en 0,7211 (CAM++) en las pruebas del autor.
- Doblaje y localización de vídeo: al soportar inglés, español, francés, alemán, italiano, japonés y coreano, permite generar pistas de voz en distintos idiomas a partir de una referencia del hablante original.
- Asistentes de voz en aplicaciones macOS/iOS: la conversión MLX y el paquete Swift permiten ejecutar la síntesis en local sobre Apple Silicon sin depender de servicios en la nube.
- Accesibilidad: lectura en voz alta de contenido con una voz personalizada clonada del propio usuario, útil para personas con discapacidad visual o dificultades de lectura.
- Prototipado de interfaces conversacionales: con 0,6 B de parámetros y pesos bf16, el modelo cabe en equipos de consumo y permite iterar rápidamente en el diseño de experiencias de voz.
- Generación de contenido para pódcast y marketing: creación de cuñas y locuciones en varios idiomas con una voz de marca registrada una sola vez como referencia.
- Investigación en TTS: al ser Apache-2.0 y estar disponible en MLX y PyTorch, sirve como base para experimentos de clonación zero-shot y evaluación multilingüe.

## Benchmarks y rendimiento

Los datos disponibles provienen del A/B interno del autor entre esta conversión y la del checkpoint Preview. Se clonaron dos voces de referencia en inglés, con semillas emparejadas, dos generaciones por línea, evaluadas con Whisper-large-v3-turbo y CAM++.

| Metrica | Preview-0.6b | Realistic-0.6b |
|---|---|---|
| Tasa de error, macro en / zh / de / es / fr / ja | 0,0122 | 0,0126 |
| Similitud de hablante (CAM++) | 0,7212 | 0,7211 |
| Tiempo de pausa por línea | 0,62 s | 1,52 s |

En esos seis idiomas ambos modelos obtienen una precisión y similitud de voz equivalentes; Realistic introduce más pausas, con tomas aproximadamente un 13 % más largas y todo el tiempo adicional en silencio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 2,6 GB; en bf16 el modelo de lenguaje ronda 1,2 GB y el códec en fp32 añade aproximadamente 1 GB, por lo que se puede ejecutar con unos 3 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3 y M4) por ser una conversión MLX; el modelo original en PyTorch puede ejecutarse en GPU NVIDIA, aunque no se detallan requisitos específicos.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; no se documentan requisitos para GPUs NVIDIA de consumo en esta conversión.
- Opciones de despliegue: mlx-audio ≥ 0.4.7 en Python y mlx-audio8-tts-swift en Swift. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que las tomas de Realistic son un 13 % más largas por las pausas añadidas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Licencia | Formato |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b (MLX) | 0,6 B | 17 | Sí | Apache-2.0 | safetensors MLX |
| Audio8-TTS-Preview-0.6b (MLX) | 0,6 B | 11 | Sí | Apache-2.0 | safetensors MLX |
| Edge0/Audio8-TTS-Realistic-0.6b (PyTorch) | 0,6 B | 17 | Sí | Apache-2.0 | PyTorch/safetensors |

Frente al Preview, Realistic amplía de 11 a 17 idiomas y mantiene la misma precisión y similitud de voz en los seis idiomas evaluados, a costa de pausas más largas. No se dispone de datos comparativos con otros sistemas TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo lingüístico, de género o de acento en la información disponible.
- Alucinación y artefactos: el tailandés cae en bucles de repetición según el autor; el árabe y el vietnamita no son utilizables.
- Cobertura de idiomas desigual: hindi, noruego y sueco funcionan de forma experimental con tasas de error del 10 al 25 %; los seis idiomas nuevos se midieron con solo tres líneas por idioma, dos voces y dos semillas, y la mayoría no fueron revisadas por hablantes nativos.
- La clonación zero-shot exige que la transcripción de referencia coincida con el audio; una transcripción incorrecta degrada la salida.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial; conviene verificar las condiciones del códec empaquetado, que procede del Preview y mantiene la misma licencia.
- Conversión MLX orientada a Apple Silicon: no se garantiza su funcionamiento en otras plataformas sin usar el checkpoint PyTorch original.
- El aumento de pausas en Realistic (1,52 s por línea frente a 0,62 s) puede requerir postprocesado para aplicaciones en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Audio8-TTS-Realistic-0.6b-bf16
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Checkpoint Preview en MLX: https://huggingface.co/mlx-community/Audio8-TTS-Preview-0.6b-bf16
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- Paquete Swift: https://github.com/xocialize/mlx-audio8-tts-swift
