# Anadilorg/Anadil_Bashkir_TTS

## Resumen

AnadilBashkirTTS es un adaptador LoRA de síntesis de voz (text-to-speech) para el idioma başkir (ISO 639-3: `bak`), una lengua túrquica hablada por aproximadamente 1,2 millones de personas en la República de Baskortostán (Rusia). Lo desarrolla Anadilorg como parte de la familia "Anadil" de adaptadores TTS para lenguas minoritarias, que ya incluye laze, zazaki, adigué, kurmanji, armenio, ladino, kirguís, uigur, sakha/yakut, turcomano, uzbeko, tártaro y kazajo. El modelo se construye sobre la base openbmb/VoxCPM2 mediante fine-tuning con LoRA, lo que permite reutilizar un modelo TTS multimodal grande y adaptarlo a un idioma de bajos recursos con un coste computacional reducido.

El adaptador se entrenó sobre 82.910 segmentos de audio de un único hablante procedentes de la contribución `bak` de Mozilla Common Voice 26.0, durante 9.500 pasos. El resultado es un adaptador de aproximadamente 72 MB (384 tensores, ~18,1 millones de parámetros en F32) que se carga junto con el modelo base VoxCPM2. La salida de audio es a 48 kHz y la síntesis utiliza clonación de voz zero-shot a partir de un clip de referencia WAV.

La relevancia del modelo radica en su enfoque: lenguas con pocos recursos digitales pueden obtener un sistema TTS funcional a partir de datos de voz abiertos y un modelo base potente, con licencia MIT y un adaptador ligero que no requiere reentrenar el modelo completo. No obstante, la propia model card advierte de que no se han publicado métricas automáticas de calidad (WER, UTMOS) y de que los ejemplos de audio disponibles corresponden a frases vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32, α=32) sobre las capas LM + DiT del modelo base openbmb/VoxCPM2 |
| Parametros totales | ~18,1 millones de parámetros en el adaptador (384 tensores, F32); el modelo base VoxCPM2 no se detalla en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en F32; el modelo base se carga según su propia configuración) |
| Idiomas soportados | başkir (`bak`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base se descarga por separado |
| Frecuencia de muestreo de salida | 48 kHz |
| Tamano del repositorio | ~0,1 GB |
| Pasos de entrenamiento | 9.500 (último checkpoint) |
| Datos de entrenamiento | 82.910 segmentos, un solo hablante (`spk_tmp_001`), Mozilla Common Voice 26.0 `bak` |
| Libreria | voxcpm |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre openbmb/VoxCPM2, un sistema TTS del que la información proporcionada no detalla la arquitectura interna más allá de que contiene capas LM (language model) y DiT (Diffusion Transformer). El adaptador se inserta en ambas familias de capas con rango r=32 y α=32, y consta de 384 tensores en precisión F32 que suman aproximadamente 18,1 millones de parámetros. El entrenamiento se realizó durante 9.500 pasos sobre 82.910 segmentos de audio de un único hablante extraídos de la contribución `bak` de Mozilla Common Voice 26.0 (licencia CC-0). No se especifica en la información disponible si hubo etapas de RLHF, DPO ni qué composición exacta tuvo el dataset más allá de la fuente citada.

La innovación principal no es arquitectónica sino de metodología: demuestra que un adaptador de ~72 MB puede especializar un TTS multimodal en una lengua de bajos recursos con un conjunto de datos abierto y un solo hablante. La síntesis se realiza mediante clonación de voz zero-shot: el modelo recibe un clip WAV de referencia del hablante objetivo y genera el audio a partir de él. La inferencia expone parámetros como `cfg_value` (por defecto 2.0) e `inference_timesteps` (por defecto 10), lo que sugiere un proceso de generación de tipo difusión guiado por classifier-free guidance, aunque la información disponible no lo confirma explícitamente.

## Capacidades

- Síntesis de voz (text-to-speech) en başkir a partir de texto en escritura cirílica.
- Clonación de voz zero-shot mediante un clip de referencia WAV del hablante objetivo.
- Salida de audio a 48 kHz.
- Soporte de un único hablante nativo (`spk_tmp_001`) en el adaptador; otras voces se abordan mediante la referencia de audio.
- Integración con la librería `voxcpm` y scripts de inferencia (`inference.py`) y demo local con Gradio (`demo.py`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.
- Capacidad multilingüe limitada al başkir; no se documenta transferencia a otras lenguas túrquicas.

## Casos de uso

- Audiolibros y lectura de textos en başkir: el modelo puede sintetizar pasajes largos en escritura cirílica con una voz de referencia concreta, útil para digitalizar literatura en una lengua con pocos recursos de audio.
- Accesibilidad para hablantes de başkir: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad dirigidas a la comunidad başkir, aprovechando la licencia MIT para integrarlo en productos.
- Preservación lingüística: generación de material sonoro de referencia para diccionarios, cursos y recursos educativos en başkir, con la posibilidad de usar distintas referencias de voz para enriquecer el material.
- Asistentes de voz locales: integración en sistemas de atención al usuario o interfaces por voz en başkir, siempre que se disponga de un clip de referencia del hablante deseado y se acepte la limitación de un solo hablante entrenado.
- Doblaje y locución de contenido breve: anuncios, avisos y vídeos cortos en başkir donde la clonación de voz permita mantener una identidad sonora consistente mediante un clip de referencia.
- Investigación en TTS de bajos recursos: el adaptador sirve como punto de partida reproducible (con scripts de validación `test_smoke.py`) para estudiar el fine-tuning LoRA sobre VoxCPM2 en otras lenguas túrquicas o minoritarias.
- Prototipado de aplicaciones de voz: la demo Gradio local y el tamaño reducido del adaptador (~72 MB) facilitan experimentar rápidamente antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas automáticas de calidad (WER, UTMOS, etc.) aún no se han calculado y que los cinco ejemplos de audio incluidos corresponden a frases vistas durante el entrenamiento, generadas usando la grabación original de cada frase como referencia.

## Requisitos de hardware

- Memoria recomendada: ~9 GB para la síntesis en fp32, según la model card.
- GPU: se prefiere CUDA; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Apple Silicon: compatible pero más lento que CUDA según el autor.
- Cabe en GPU de consumo con al menos ~9 GB de memoria en fp32; no se documentan requisitos para cuantizaciones del modelo base.
- Despliegue: scripts propios del repositorio (`inference.py`, `demo.py` con Gradio) sobre la librería `voxcpm`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Idioma | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AnadilBashkirTTS | Adaptador LoRA sobre VoxCPM2 | Başkir (`bak`) | ~18,1 M (adaptador) | no disponible | MIT | Hugging Face |
| openbmb/VoxCPM2 | TTS base | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros adaptadores de la familia Anadil | Adaptadores LoRA sobre VoxCPM2 | Laz, zazaki, adigué, kurmanji, armenio, ladino, kirguís, uigur, sakha, turcomano, uzbeko, tártaro, kazajo | ~similar (no confirmado) | no disponible | MIT (según familia) | Hugging Face (Anadilorg) |

No se dispone de comparaciones con modelos TTS comerciales o de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Un solo hablante: el adaptador está entrenado sobre la etiqueta `spk_tmp_001`; otras voces solo se abordan mediante clonación zero-shot con un clip de referencia, con calidad no garantizada.
- Sin métricas de calidad: no se han publicado WER, UTMOS ni otras métricas automáticas; los ejemplos de audio son frases vistas en entrenamiento y usan la grabación original como referencia, por lo que no demuestran generalización.
- Riesgo de alucinación acústica y errores de pronunciación: al ser un modelo de bajos recursos y un solo hablante, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos no vistos.
- Cobertura limitada al başkir: no se documenta soporte de otras lenguas ni cambio de código; el texto debe estar en escritura cirílica başkir.
- Sesgos del dataset: los datos provienen de Mozilla Common Voice 26.0, con la demografía y condiciones de grabación de sus contribuyentes; pueden aparecer sesgos de acento, edad o género en la voz clonada.
- Licencia: el adaptador es MIT, pero el modelo base VoxCPM2 y el dataset Common Voice (CC-0) tienen sus propias condiciones que deben revisarse antes de uso comercial.
- Requisitos de memoria: ~9 GB en fp32 y preferencia por CUDA; el rendimiento en Apple Silicon es inferior.
- Madurez: versión 0.1.0, publicada en 2026, sin descargas ni valoraciones en el momento de la consulta; no se documenta soporte para motores de despliegue estándar (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anadilorg/Anadil_Bashkir_TTS
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Muestras de audio originales y sintetizadas: https://huggingface.co/Anadilorg/Anadil_Bashkir_TTS/tree/main/samples
- Mozilla Common Voice 26.0 (fuente de datos `bak`): https://commonvoice.mozilla.org/
- Organización Anadilorg en Hugging Face: https://huggingface.co/Anadilorg
