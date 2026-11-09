# samuelolubukun/murivo-tts-21m-english

## Resumen

Murivo-TTS 21M English es un motor de síntesis de voz (text-to-speech) ultraligero desarrollado por Samuel Olubukun. Combina una arquitectura acústica de tipo Flow-Matching Diffusion Transformer (DiT) de aproximadamente 20,9 millones de parámetros con el vocoder neuronal VoxCPM2 48 kHz Causal AudioVAE, lo que permite generar audio nativo a 48.000 Hz. El modelo está entrenado desde cero exclusivamente en inglés sobre el corpus LJSpeech.

El modelo resuelve el problema de la síntesis de voz de alta fidelidad en entornos con recursos limitados: su checkpoint en FP16 ocupa unos 41,9 MB y requiere únicamente PyTorch, soundfile y numpy, sin dependencias de C ni de espeak-ng. Esto lo hace adecuado para despliegues 100 % offline en CPU o GPU de gama baja, algo poco habitual en sistemas TTS de calidad de estudio.

El checkpoint publicado corresponde a la fase "Studio Foundation" (paso 12.500) de un currículo de entrenamiento de dos fases. Es relevante ahora porque demuestra que es viable obtener audio a 48 kHz con un backbone de menos de 21M de parámetros mediante flow-matching, si bien el alcance actual se limita a una única voz femenina en inglés estadounidense.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) con solver ODE Euler; vocoder VoxCPM2 48 kHz Causal AudioVAE |
| Parámetros totales | ~20,9 M (backbone acústico) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP16 (checkpoint publicado); no se documentan otras |
| Idiomas soportados | Inglés (variante US Studio) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`murivo_21m_english.pt`, ~41,9 MB en FP16); vocoder `audiovae.pth` descargado aparte desde `openbmb/VoxCPM2` |

## Arquitectura y entrenamiento

El backbone acústico es un Diffusion Transformer (DiT) entrenado con flow-matching, que resuelve la trayectoria de generación mediante un solver ODE de Euler. La arquitectura deriva de Rápido TTS, el proyecto de Anurag Kanade para portugués brasileño. La síntesis se completa con el vocoder causal VoxCPM2 AudioVAE de OpenBMB, que decodifica la representación latente a forma de onda a 48 kHz.

El entrenamiento se realizó desde cero sobre el dataset LJSpeech (unas 24 horas de audio de estudio de una única hablante) durante 12.500 pasos, con un currículo en dos fases: una fase de warmup de 1.000 pasos con el backbone congelado para fijar la duración de fonemas y el alineamiento texto-audio, seguida de una fase conjunta de 11.500 pasos de flow-matching. La pérdida total descendió de 1,6732 (paso 1) a 0,8931 (paso 12.500), con la pérdida de duración reducida un 98,8 %. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en inglés estadounidense a 48.000 Hz nativos, con calidad de estudio según el autor.
- Generación de audio offline, sin llamadas a servicios externos ni dependencias de C.
- Control de inferencia mediante parámetros de guía (`guidance`), velocidad (`speed`) y número de pasos del solver (`steps`).
- Inferencia en CPU o GPU (`device="cuda"` o `device="cpu"`).
- API de Python (`MurivoTTS`) y utilidad de línea de comandos (`infer.py`).
- Salida en formato WAV mediante `soundfile`.
- No se documenta soporte de clonación de voz, control de emociones, tool calling, agentes ni multimodalidad.

## Casos de uso

- Audiolibros y narración automatizada: el modelo sintetiza frases largas con cadencia multi-cláusula, adecuado para convertir texto en audio de forma local sin coste por petición.
- Sistemas de accesibilidad en dispositivos sin conexión: al requerir solo PyTorch, soundfile y numpy, puede integrarse en aplicaciones de lectura de pantalla en equipos sin GPU.
- Generación de avisos y locuciones para aplicaciones: el control de velocidad y guía permite ajustar el ritmo de la locución a distintos contextos de interfaz.
- Prototipado de productos de voz: el tamaño reducido del checkpoint (41,9 MB) facilita iterar y empaquetar el modelo en contenedores ligeros.
- Investigación en TTS eficiente: sirve como referencia reproducible de flow-matching con DiT a 48 kHz sobre un corpus estándar como LJSpeech.
- Pruebas de integración en pipelines de audio: la API de Python y el CLI permiten generar lotes de muestras para evaluación de calidad o regresión.
- Demostraciones educativas: útil para explicar vocoders neuronales y modelos de difusión en cursos, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la progresión de pérdidas de entrenamiento:

| Fase | Paso | Pérdida total | Pérdida flow | Pérdida duración |
|---|---|---|---|---|
| Warmup | 1 | 1,6732 | 1,4299 | 0,4866 |
| Warmup | 1.000 | 1,0730 | 1,0305 | 0,0239 |
| Conjunta | 5.000 | 0,9412 | 0,9234 | 0,0078 |
| Conjunta | 10.000 | 0,9125 | 0,8792 | 0,0057 |
| Final | 12.500 | 0,8931 | 0,8744 | 0,0058 |

## Requisitos de hardware

- VRAM estimada: muy baja; el backbone en FP16 ocupa ~41,9 MB, y el vocoder añade un consumo adicional no cuantificado en la información disponible. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); no se requieren aceleradores de gama alta.
- CPU: la inferencia es viable en CPU según la documentación del modelo, aunque no se especifican latencias.
- Despliegue: PyTorch nativo con `infer.py` o la API `MurivoTTS`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Frecuencia de muestreo | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Murivo-TTS 21M English | ~20,9 M | 48 kHz | Inglés | MIT | Hugging Face |
| Rápido TTS | No disponible en la información | No disponible | Portugués brasileño | No disponible | Hugging Face / GitHub |
| VoxCPM2 (vocoder) | No disponible | 48 kHz | No aplica (vocoder) | No disponible | Hugging Face (openbmb) |

La información disponible no permite comparar rendimiento objetivo (MOS, RTF, WER) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado exclusivamente con LJSpeech: una única voz femenina en inglés estadounidense; no hay variedad de hablantes ni de acentos.
- El propio autor describe el checkpoint como "Studio Foundation" en el paso 12.500, lo que sugiere que no es un modelo final pulido.
- Riesgo de artefactos y alucinaciones acústicas en textos fuera de distribución (nombres propios, siglas, números, puntuación atípica), habitual en modelos entrenados con corpus limitados.
- Sin soporte multilingüe: solo inglés; la mención a yoruba, hausa e igbo en la cita bibliográfica corresponde a trabajos futuros o relacionados, no a este checkpoint.
- No se documentan sesgos específicos ni evaluaciones de robustez; la licencia MIT permite uso comercial, pero no hay garantías de calidad en producción.
- El vocoder se descarga desde `openbmb/VoxCPM2` en la primera ejecución, lo que requiere conexión a Hugging Face salvo que se cachee previamente.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuelolubukun/murivo-tts-21m-english
- Dataset LJSpeech: https://huggingface.co/datasets/keithito/lj_speech
- Rápido TTS en Hugging Face: https://huggingface.co/edwixx/rapido-tts
- Rápido TTS en GitHub: https://github.com/anurag12-webster/rapido-tts
- VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Perfil del autor: https://huggingface.co/samuelolubukun
