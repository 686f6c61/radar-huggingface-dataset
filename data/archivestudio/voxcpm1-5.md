# ArchiveStudio/VoxCPM1.5

## Resumen

VoxCPM1.5 es un sistema de síntesis de voz (text-to-speech) sin tokenizador desarrollado por OpenBMB (ModelBest), distribuido en este repositorio por ArchiveStudio. A diferencia de los enfoques dominantes que convierten la señal de audio en tokens discretos, VoxCPM modela el habla en un espacio continuo mediante una arquitectura autorregresiva con difusión, lo que le permite generar prosodia contextualmente adecuada y realizar clonación de voz zero-shot fiel a partir de una referencia corta. El modelo se apoya en el backbone de lenguaje MiniCPM4-0.5B y suma un decodificador LocDiT sobre representaciones latentes de un VAE de audio.

Esta versión 1.5 (publicada el 5 de diciembre de 2025) eleva la frecuencia de muestreo del VAE de audio de 16 kHz a 44,1 kHz, reduce la tasa de tokens del modelo de lenguaje de 12,5 Hz a 6,25 Hz y aumenta el tamaño de parche de 2 a 4, mejorando la calidad y la eficiencia. El modelo cuenta con aproximadamente 801,7 millones de parámetros, un repositorio de 1,9 GB en safetensors y licencia Apache 2.0, lo que lo hace apto para uso comercial. Soporta inglés y chino, y admite ajuste fino mediante SFT y LoRA.

Su relevancia actual radica en que combina clonación de voz realista, generación expresiva dependiente del contexto y síntesis en streaming con un factor de tiempo real (RTF) de hasta 0,17 en una GPU de consumo como la RTX 4090, lo que abre la puerta a aplicaciones interactivas de baja latencia sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresiva con difusión (LocDiT) sobre backbone MiniCPM4-0.5B, sin tokenizador, con VAE de audio continuo |
| Parametros totales | 801.729.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoxCPM emplea una arquitectura autorregresiva de difusión extremo a extremo que genera directamente representaciones continuas de habla a partir del texto, evitando la tokenización discreta del audio. El componente de lenguaje se construye sobre MiniCPM4-0.5B y aplica modelado jerárquico del lenguaje junto con restricciones FSQ (finite scalar quantization) para lograr un desacoplamiento implícito entre información semántica y acústica, lo que mejora la expresividad y la estabilidad de la generación. La síntesis final la realiza un decodificador LocDiT que opera sobre latentes de un VAE de audio; en la versión 1.5 el VAE trabaja a 44,1 kHz, la tasa de tokens del LM baja a 6,25 Hz y el tamaño de parche sube a 4.

El modelo se entrenó sobre un corpus bilingüe masivo de 1,8 millones de horas de audio, según la model card. La información disponible no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. Sí se documenta soporte para ajuste fino supervisado (SFT) y LoRA, lo que permite adaptar voces personalizadas. La inferencia expone parámetros de control como `cfg_value` (guía del LM sobre LocDiT), `inference_timesteps` (pasos de difusión) y modos de reintento para casos anómalos.

## Capacidades

- Generación de voz expresiva y consciente del contexto: infiere prosodia adecuada a partir del contenido del texto.
- Clonación de voz zero-shot a partir de un clip de referencia corto, capturando timbre, acento, tono emocional, ritmo y velocidad.
- Síntesis en streaming con RTF de hasta 0,17 en RTX 4090.
- Soporte bilingüe inglés y chino.
- Ajuste fino mediante SFT y LoRA para voces personalizadas.
- Control de inferencia mediante parámetros de guía (CFG), pasos de difusión y normalización de texto opcional.
- Integración con herramientas externas opcionales: ZipEnhancer para mejora de la señal de referencia y SenseVoice-Small para ASR del prompt de voz en la demo web.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo específico de TTS.

## Casos de uso

- Locución de contenidos editoriales y audiolibros: el modelo genera voz expresiva ajustada al texto, con control de prosodia y velocidad, adecuado para narraciones largas donde la naturalidad del ritmo es crítica.
- Clonación de voz para doblaje y localización: con un clip corto de referencia se replica el timbre y el acento del hablante original, permitiendo doblar contenido en inglés o chino manteniendo la identidad vocal.
- Asistentes conversacionales en tiempo real: el RTF de 0,17 en RTX 4090 y la síntesis en streaming permiten respuestas de voz de baja latencia en entornos interactivos.
- Accesibilidad y lectura de textos: conversión de documentos a voz natural para usuarios con discapacidad visual, con soporte bilingüe para contenido en inglés y chino.
- Generación de voces para videojuegos y experiencias inmersivas: creación de múltiples personajes con voces diferenciadas mediante referencias de audio y ajuste fino con LoRA.
- Prototipado rápido de demos de voz: instalación vía `pip install voxcpm` y descarga automática del modelo permiten integrar TTS en aplicaciones de prueba sin infraestructura compleja.
- Investigación en síntesis de voz: la arquitectura sin tokenizador y el decodificador de difusión ofrecen una base para experimentos sobre representaciones continuas del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el factor de tiempo real (RTF) de hasta 0,17 en una NVIDIA RTX 4090 para síntesis en streaming, sin métricas comparativas de calidad (MOS, similitud de hablante, WER) ni resultados en conjuntos estándar.

## Requisitos de hardware

- El modelo tiene 801,7 millones de parámetros y el repositorio pesa 1,9 GB en safetensors; la VRAM necesaria para inferencia en precisión nativa no se detalla en la información disponible.
- GPU de referencia documentada: NVIDIA RTX 4090, donde se alcanza un RTF de 0,17 en streaming.
- Al ser un modelo de menos de mil millones de parámetros, es previsible que quepa en GPU de consumo, aunque no se confirman modelos concretos ni requisitos mínimos de VRAM.
- Opciones de despliegue: paquete oficial `voxcpm` (PyPI) con `VoxCPM.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTF de 0,17 en RTX 4090; no se proporcionan otras cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM1.5 | 801,7 M | no disponible | en, zh | Apache 2.0 | TTS sin tokenizador, clonación zero-shot, streaming |
| VoxCPM (0.5B) | no disponible | no disponible | en, zh | Apache 2.0 | Versión previa, VAE a 16 kHz, tasa de tokens 12,5 Hz |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas en la información proporcionada |

## Limitaciones y advertencias

- La calidad de salida depende de la calidad del audio de referencia empleado en la clonación; referencias ruidosas degradan el resultado.
- Solo soporta inglés y chino; no se documentan otros idiomas.
- No se publican métricas de sesgo, alucinación ni evaluación de calidad objetiva, por lo que el riesgo de artefactos o prosodia inadecuada debe validarse empíricamente.
- El modo de reintento (`retry_badcase`) sugiere la existencia de casos anómalos (generaciones que no terminan) que requieren mitigación en producción.
- La normalización de texto externa desactiva el soporte nativo de texto crudo; la reducción de ruido externa puede introducir distorsión y restringir la frecuencia de muestreo a 16 kHz.
- El uso de clonación de voz conlleva riesgos éticos y legales (suplantación de identidad); aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del integrador cumplir la normativa aplicable.
- La longitud de contexto no está documentada, lo que limita la planificación de entradas de texto largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArchiveStudio/VoxCPM1.5
- Modelo original en Hugging Face: https://huggingface.co/openbmb/VoxCPM1.5
- Modelo en ModelScope: https://modelscope.cn/models/OpenBMB/VoxCPM1.5
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM/
- Informe técnico (arXiv): https://arxiv.org/abs/2509.24650
- Documentación MiniCPM Wiki: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Demo en vivo: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/VoxCPM-demopage
- Modelo base: https://huggingface.co/openbmb/MiniCPM4-0.5B
