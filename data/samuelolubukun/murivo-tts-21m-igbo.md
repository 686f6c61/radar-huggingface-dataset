# samuelolubukun/murivo-tts-21m-igbo

## Resumen

Murivo-TTS 21M Igbo es un motor de síntesis de voz (text-to-speech) ultraligero y totalmente offline desarrollado por Samuel Olubukun, orientado específicamente al idioma igbo (sureste de Nigeria). El modelo combina un backbone acústico de tipo Diffusion Transformer (DiT) con flow-matching de aproximadamente 20,9 millones de parámetros con el vocoder neuronal causal VoxCPM2 AudioVAE de 48 kHz, lo que permite generar audio nativo a 48.000 Hz sin dependencias de librerías C ni de `espeak-ng`.

El checkpoint publicado corresponde a la Stage 2 del currículo de entrenamiento (paso 1.800), tras un afinado sobre el corpus Nigerian Common Voice en igbo, después de una primera fase de 5.000 pasos sobre OpenBible Igbo centrada en armonía vocálica y vocales con punto subscrito (ị, ọ, ụ). El objetivo es cubrir la brecha de herramientas TTS de alta fidelidad para lenguas africanas de bajos recursos, con un modelo que cabe en un único fichero de ~41,9 MB en FP16 y que puede ejecutarse tanto en CPU como en GPU.

Su relevancia actual radica en la combinación de tamaño mínimo, licencia MIT y calidad de muestreo de 48 kHz, lo que lo hace apto para despliegue en dispositivos con recursos limitados y para integración en aplicaciones de preservación lingüística, accesibilidad o generación de contenido en igbo. No obstante, el repositorio no incluye todavía pesos en formatos estándar de despliegue masivo (safetensors, GGUF) ni resultados de benchmarks objetivos publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) con solver Euler ODE; vocoder VoxCPM2 AudioVAE causal a 48 kHz |
| Parámetros totales | ~20,9 M (backbone acústico) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (fichero `murivo_21m_ig.pt`, ~41,9 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | igbo (ig) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); vocoder `audiovae.pth` descargado desde `openbmb/VoxCPM2` |

## Arquitectura y entrenamiento

El modelo sigue la estirpe arquitectónica de Rápido TTS: un Diffusion Transformer ligero entrenado con flow-matching que resuelve una ODE de Euler para generar el mel-espectrograma o representación latente acústica, que después es decodificada por el vocoder neuronal causal VoxCPM2 AudioVAE de OpenBMB a 48 kHz nativos. El muestreo se controla mediante parámetros de `guidance` (por defecto 1,8), `speed` (1,0) y `steps` (20) expuestos en la API Python. El modelo completo se distribuye como un único fichero PyTorch de ~41,9 MB en FP16.

El entrenamiento siguió un currículo en dos etapas. La Stage 1 se ejecutó durante 5.000 pasos sobre el subconjunto igbo de OpenBible, con foco en armonía vocálica y vocales con punto subscrito, alcanzando una pérdida final de 0,9410 (flow: 0,8872). La Stage 2, correspondiente al checkpoint publicado, se afinó durante 1.800 pasos sobre el corpus Nigerian Common Voice en igbo para refinar prosodia conversacional y cadencia, con una pérdida de duración final de 0,2708. No se documenta el uso de RLHF, DPO ni datos de preferencia humana, ni el volumen total de horas o tokens de audio empleados.

## Capacidades

- Síntesis de voz en igbo a 48.000 Hz nativos a partir de texto con ortografía igbo estándar, incluyendo vocales con punto subscrito (ị, ọ, ụ) y combinaciones nasales.
- Generación de audio offline sin dependencias de sistema (`espeak-ng` no requerido); solo requiere `torch`, `soundfile` y `numpy`.
- Control de generación mediante `guidance`, `speed` y número de pasos de muestreo (`steps`).
- Ejecución en CPU o GPU (`device="cuda"` o `device="cpu"`).
- Interfaz de línea de comandos (`infer.py`) y API Python (`MurivoTTS`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada, clonación de voz ni control explícito de emoción o estilo.
- Capacidad multilingüe limitada al igbo; la cita del autor menciona inglés, yoruba, hausa e igbo como ámbito del proyecto Murivo, pero este checkpoint solo declara `ig`.

## Casos de uso

- Preservación lingüística y educación: narración de textos en igbo (por ejemplo, materiales escolares o bíblicos) con audio a 48 kHz, aprovechando el anclaje del entrenamiento sobre OpenBible para vocabulario y ortografía formales.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido digital en igbo en aplicaciones de escritorio o móvil, dado que el modelo funciona offline y cabe en un fichero de ~42 MB.
- Asistentes de voz locales en dispositivos de bajos recursos: integración en hardware embebido o Raspberry Pi mediante ejecución en CPU, sin dependencia de servicios en la nube.
- Generación de audiolibros y pódcasts en igbo: síntesis por lotes desde CLI (`infer.py`) con control de velocidad para ajustar la duración de los segmentos.
- Prototipado de interfaces conversacionales en igbo: uso de la API Python para generar respuestas habladas en asistentes de atención ciudadana o servicios públicos en el sureste de Nigeria.
- Investigación en TTS de bajos recursos: el modelo sirve como baseline ligero (20,9 M de parámetros) para experimentos de flow-matching y vocoders de 48 kHz en lenguas africanas, con licencia MIT que facilita la reutilización académica y comercial.
- Doctrina y contenido religioso: lectura automatizada de pasajes bíblicos en igbo, alineado con el corpus de entrenamiento principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (MOS, WER, MCD, RTF) en la información disponible. La model card solo reporta pérdidas de entrenamiento:

| Etapa | Pasos | Dataset | Foco | Pérdida final |
|---|---|---|---|---|
| Stage 1 (Studio) | 5.000 | OpenBible Igbo | Armonía vocálica y subpuntos (ị, ọ, ụ) | 0,9410 (flow: 0,8872) |
| Stage 2 (Conversational) | 1.800 | Common Voice Igbo | Prosodia conversacional y cadencia | Duración: 0,2708 |

La evaluación cualitativa se limita a tres muestras de audio publicadas en la model card (frases con vocales subpuntuadas, nasal `mbọ`, aspiración, compounding rápido y armonía vocálica). No se dispone de comparación numérica con otros sistemas TTS en igbo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el backbone en FP16 ocupa ~41,9 MB y el vocoder VoxCPM2 AudioVAE añade una huella adicional no especificada en la información disponible. En la práctica, el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el modelo no requiere memoria significativa, por lo que la elección depende del throughput deseado y no de la VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU; también se documenta ejecución en CPU.
- Opciones de despliegue: script `infer.py` del repositorio con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son motores orientados a LLM, no a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. El muestreo se realiza con 20 pasos de Euler ODE por defecto, lo que determina el coste computacional junto con la longitud del texto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas TTS en igbo en la información proporcionada. La comparativa se limita a lo declarado por el autor:

| Modelo | Parámetros | Frecuencia de muestreo | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Murivo-TTS 21M Igbo | ~20,9 M | 48 kHz | igbo | MIT | Hugging Face (`samuelolubukun/murivo-tts-21m-igbo`) |
| Rápido TTS (linaje arquitectónico) | no disponible | no disponible | no disponible | no disponible | Hugging Face (`edwixx/rapido-tts`), GitHub |
| VoxCPM2 AudioVAE (vocoder usado) | no disponible | 48 kHz | no aplica (vocoder) | no disponible | Hugging Face (`openbmb/VoxCPM2`) |

No se identifican en la información disponible otros modelos TTS específicos para igbo con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo monoidioma (igbo); no cubre inglés, yoruba ni hausa pese a la mención en la cita bibliográfica del proyecto.
- Checkpoint en Stage 2 (paso 1.800): el autor lo etiqueta como estado conversacional intermedio, por lo que la calidad puede no ser final.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del dominio de entrenamiento (OpenBible y Common Voice), especialmente en neologismos, siglas y préstamos.
- Sesgos potenciales derivados de los corpus: sobrerrepresentación de registro bíblico y formal (OpenBible) y de las condiciones de grabación de Common Voice.
- No se documentan evaluaciones subjetivas (MOS) ni objetivas (WER, MCD) que respalden la calidad percibida.
- El vocoder se descarga automáticamente desde `openbmb/VoxCPM2` en el primer uso, lo que introduce una dependencia de red y de la licencia de ese repositorio, no detallada en la información disponible.
- Los pesos se distribuyen únicamente en formato PyTorch (`.pt`), sin safetensors ni GGUF, lo que limita la integración con ecosistemas de inferencia estandarizados.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento (OpenBible y Nigerian Common Voice) antes de un despliegue en producción.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuelolubukun/murivo-tts-21m-igbo
- Dataset OpenBible Multilingual TTS: https://huggingface.co/datasets/multilingual-tts/open-bible
- Dataset Nigerian Common Voice (Benjamin Ogbonna): https://huggingface.co/datasets/benjaminogbonna/nigerian_common_voice_dataset
- Vocoder VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Rápido TTS en Hugging Face: https://huggingface.co/edwixx/rapido-tts
- Rápido TTS en GitHub: https://github.com/anurag12-webster/rapido-tts
- Perfil del autor: https://huggingface.co/samuelolubukun
