# kumargulshan/wav2vec2-base-ls100-clean

## Resumen

`kumargulshan/wav2vec2-base-ls100-clean` es un modelo de reconocimiento automático del habla (ASR) en inglés obtenido por ajuste fino de `facebook/wav2vec2-base` (95 M de parámetros) sobre las 100,6 horas de `train-clean-100` de LibriSpeech. Lo publica el autor `kumargulshan` como parte de un estudio sobre ASR robusto al ruido con marcado de errores a nivel de palabra (proyecto del DS & AI Lab, noviembre de 2026). Se trata de la línea base "entrenada solo con audio limpio" del hito 4 de dicho estudio: no es robusta al ruido y se publica explícitamente como referencia de comparación frente a las variantes con aumento de datos.

El modelo sigue la arquitectura wav2vec2 original: un codificador convolucional de características seguido de un transformer y una cabeza CTC a nivel de carácter. La salida emplea el mismo vocabulario de 32 símbolos que `facebook/wav2vec2-base-960h` (A–Z, apóstrofo y `|` como delimitador de palabra), sin puntuación ni mayúsculas/minúsculas. Con decodificación greedy alcanza un WER del 5,85 % en LibriSpeech test-clean y del 13,03 % en test-other; con un modelo de lenguaje 4-grama de LibriSpeech baja a 3,69 % y 9,04 % respectivamente.

Su relevancia es fundamentalmente metodológica: sirve como punto de anclaje controlado para medir cuánto aporta el aumento de datos con ruido en las demás variantes del estudio, y su evaluación se extiende a 17 condiciones acústicas (ruido blanco, rosa, marrón y sonidos ESC-50 a distintos SNR), lo que permite cuantificar la degradación esperable cuando se despliega un modelo entrenado solo con voz limpia en entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CNN feature encoder + transformer + cabeza CTC a nivel de carácter) |
| Parámetros totales | 94.396.320 (~95 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la longitud del audio) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch/transformers) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-base` y añade una cabeza CTC de nivel de carácter, manteniendo el vocabulario de 32 símbolos de `wav2vec2-base-960h`. El ajuste fino se realizó sobre LibriSpeech `train-clean-100` (100,6 horas) durante 36.000 pasos (≈ 59,5 épocas), con learning rate máximo de 5e-5, 8 % de warm-up, decaimiento lineal y semilla 42. No se aplicó ningún aumento de datos: solo voz limpia. Como regularización se usó enmascaramiento estilo SpecAugment (tiempo p=0,4 / span 10; features p=0,1 / span 64), LayerDrop 0,1 y codificador convolucional congelado. El optimizador fue AdamW (β 0,9/0,98, weight decay 0,005), con clipping de gradiente 1,0, precisión bf16 y lotes agrupados por duración de hasta 640 s de audio. Todo el entrenamiento se ejecutó en una única NVIDIA L40S.

El checkpoint seleccionado (paso 34.000) es el de menor WER medio de desarrollo combinando dev-clean y dev-other, limpio y con ruido, con un WER de desarrollo del 22,08 %. La decodificación óptima según el autor usa un KenLM 4-grama de LibriSpeech vía `pyctcdecode` con alpha 0,8, beta 2,0 y beam 50. La evaluación se realizó sobre test-clean y test-other (5.559 enunciados) en 17 condiciones: limpio, ruido blanco, rosa y marrón, y sonidos ambientales ESC-50 a 0, 5, 10, 15 y 20 dB SNR, con semillas fijas por enunciado para garantizar que todos los modelos ven el mismo audio.

## Capacidades

- Reconocimiento de voz en inglés a partir de audio mono a 16 kHz, con salida CTC en mayúsculas, apóstrofo y delimitador de palabra.
- Transcripción de voz leída de audiolibro (dominio LibriSpeech), que es el único dominio evaluado.
- Decodificación con modelo de lenguaje externo (KenLM 4-grama vía `pyctcdecode`) para reducir el WER.
- Integración nativa con `transformers` (`Wav2Vec2Processor` + `Wav2Vec2ForCTC`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking": es un modelo puramente acústico-CTC.
- No tiene capacidades multimodales más allá del audio: no procesa texto ni imagen como entrada.
- No genera puntuación ni distingue mayúsculas/minúsculas en la salida.

## Casos de uso

- Línea base de comparación en experimentos de robustez al ruido: al ser el modelo entrenado solo con voz limpia, permite cuantificar la ganancia exacta de las variantes con aumento de datos (B960_rev, B_noisy, etc.) bajo las mismas 17 condiciones de evaluación.
- Transcripción de audiolibros y pódcasts con voz leída y grabación limpia: es el dominio nativo del modelo y donde obtiene su mejor WER (3,69 % en test-clean con LM).
- Generación de transcripciones de referencia en corpus de investigación: útil para anotar automáticamente audio de lectura en inglés y revisar manualmente solo los segmentos con baja confianza.
- Prototipado rápido de pipelines ASR en local: con ~95 M de parámetros y 0,4 GB de pesos, se puede desplegar en una GPU de consumo o incluso en CPU para pruebas de concepto.
- Evaluación de la degradación esperable en producción: sus resultados por tipo de ruido (blanco, rosa, marrón, ESC-50) permiten estimar el impacto de desplegar un modelo limpio en entornos con ruido de fondo y decidir si se necesita una variante robusta.
- Componente de un sistema de marcado de errores a nivel de palabra: el proyecto original lo usa como base para señalar palabras potencialmente erróneas en la transcripción, aprovechando las probabilidades CTC por fotograma.
- Docencia y reproducción de experimentos: receta de ajuste fino completamente documentada (hiperparámetros, hardware, selección de checkpoint) para cursos de ASR con wav2vec2.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto / condición | WER greedy (%) | WER + LM 4-grama (%) |
|---|---|---|
| LibriSpeech test-clean | 5,85 | 3,69 |
| LibriSpeech test-other | 13,03 | 9,04 |
| Todas las condiciones con ruido (agregado) | no disponible | 25,22 |
| Ruido blanco, 0–5 dB | 71,53 | 66,15 |
| Ruido rosa, 0–5 dB | 56,05 | 50,18 |
| Ruido marrón, 0–5 dB (tipo no visto) | 10,26 | 6,94 |
| Sonidos ESC-50, 0–5 dB (tipo no visto) | 38,29 | 32,58 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,4 GB de pesos más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En bf16/fp16 los pesos ocupan aproximadamente 0,2 GB; la cuantización a int8 reduciría aún más el consumo, aunque el autor no publica cifras de cuantización.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entrenó en una NVIDIA L40S, pero para inferencia bastan RTX 3060/4060/4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo y también en CPU para audio de duración moderada, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; también es compatible con `pipelines` de Hugging Face y con los endpoints de inferencia (tag `endpoints_compatible`). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / datos | WER test-clean | WER test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `kumargulshan/wav2vec2-base-ls100-clean` | ~95 M | 100,6 h LibriSpeech clean | 5,85 (greedy) / 3,69 (LM) | 13,03 / 9,04 | Apache-2.0 | Hugging Face |
| `facebook/wav2vec2-base-960h` | ~95 M | 960 h LibriSpeech | no disponible en esta ficha | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| `kumargulshan/wav2vec2-base-noise-robust-asr` (B960_rev) | ~95 M | 960 h + ruido, reverberación, velocidad y teléfono | no disponible en esta ficha | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| `kumargulshan/wav2vec2-base-ls100-noise-aug` (B_noisy) | ~95 M | 100 h + aumento de ruido | no disponible en esta ficha | no disponible en esta ficha | Apache-2.0 | Hugging Face |

Los tres modelos comparables pertenecen al mismo estudio y comparten arquitectura y tamaño; las cifras de WER de las alternativas no se incluyen en la información proporcionada, por lo que no se comparan numéricamente aquí.

## Limitaciones y advertencias

- Solo reconoce inglés y únicamente voz leída de audiolibro (LibriSpeech); el habla conversacional, con acento marcado o de campo lejano no se ha evaluado.
- No es robusto al ruido por diseño: se entrenó sin aumento de datos y el propio autor lo etiqueta como línea base no robusta. El WER se dispara en ruido blanco (66,15 % con LM a 0–5 dB) y rosa (50,18 %).
- El ruido de la evaluación es sintético y con semillas fijas; no se evaluaron grabaciones con hablantes solapados.
- El ruido de banda ancha a SNR muy bajo (≤ 0 dB) sigue siendo difícil incluso con LM.
- La salida no incluye puntuación ni distinción de mayúsculas/minúsculas, lo que limita su uso directo en productos finales sin postprocesado.
- Riesgo de alucinación: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en segmentos ruidosos o ininteligibles; no hay mecanismo de abstención.
- Sesgos: no se documentan análisis de sesgo por acento, género o edad; el dominio de entrenamiento (audiolibros en inglés) probablemente favorece voces y estilos de lectura concretos.
- Licencia Apache-2.0, que permite uso comercial; los datos de entrenamiento son LibriSpeech (CC BY 4.0) y MUSAN, según indica el autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria ni resultados verificados de forma independiente (las métricas están marcadas como `verified: false`).
- Para producción en entornos con ruido se recomienda usar las variantes robustas del mismo estudio en lugar de este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Variante robusta principal (B960_rev): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr
- Variante B960_rev semilla 7: https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr-seed7
- Variante 464 h con ruido (B460): https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- Variante 100 h con ruido (B_noisy): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- Variante 100 h con ruido y lr 1e-4: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
