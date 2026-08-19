# openbmb/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) de última generación desarrollado por OpenBMB, el equipo detrás de MiniCPM. Se trata de un sistema tokenizer-free que genera representaciones de audio continuas mediante una arquitectura autoregresiva con difusión, eliminando la necesidad de tokenización discreta y logrando una síntesis más natural y expresiva. Con 2.290 millones de parámetros (2B), soporta 30 idiomas y produce audio a 48 kHz con calidad de estudio.

El modelo destaca por tres capacidades principales: clonación de voz controlable a partir de un clip corto, diseño de voz mediante descripción en lenguaje natural (sin audio de referencia) y clonación de alta fidelidad con transcripción de referencia. Entrenado con más de 2 millones de horas de habla multilingüe, VoxCPM2 es completamente open source bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. Su relevancia actual radica en combinar un rendimiento de vanguardia en benchmarks de TTS con una arquitectura abierta y desplegable en tiempo real (RTF ~0.3 en RTX 4090).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer-free Diffusion Autoregressive (LocEnc → TSLM → RALM → LocDiT) |
| Parametros totales | 2.290.004.544 (~2,29 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (tasa de 6,25 Hz, ~21,8 minutos de audio) |
| Tipos de cuantizacion | No disponible (dtype nativo: bfloat16) |
| Idiomas soportados | 30 idiomas: árabe, birmano, chino, danés, neerlandés, inglés, finés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco, vietnamita. Además 9 dialectos del chino (sichuanés, cantonés, wu, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoxCPM2 emplea una arquitectura tokenizer-free basada en difusión autoregresiva. El sistema se compone de cuatro módulos principales: LocEnc (codificador de localización), TSLM (modelo de lenguaje de texto a voz), RALM (modelo de lenguaje autoregresivo) y LocDiT (transformador de difusión). Esta combinación permite generar directamente representaciones continuas de audio sin pasar por tokens discretos, lo que reduce la pérdida de información y mejora la naturalidad prosódica.

El backbone está basado en MiniCPM-4 con 2B parámetros. El audio se procesa mediante AudioVAE V2, un codificador-decodificador asimétrico que acepta audio de referencia a 16 kHz y produce salida a 48 kHz mediante super-resolución integrada, eliminando la necesidad de un upsampler externo. El entrenamiento se realizó con más de 2 millones de horas de habla multilingüe, con una tasa de tokens de 6,25 Hz y una longitud máxima de secuencia de 8192 tokens. No se especifica el uso de RLHF o DPO en la información disponible, pero el modelo incorpora inferencia contextual automática de prosodia y expresividad a partir del texto.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas sin necesidad de etiqueta de idioma: basta introducir el texto directamente.
- Voice design: generación de una voz nueva a partir de una descripción en lenguaje natural (género, edad, tono, emoción, ritmo) sin requerir audio de referencia.
- Clonación de voz controlable: clonación desde un clip corto con control opcional de estilo (emoción, velocidad, expresión) manteniendo el timbre.
- Clonación de alta fidelidad (ultimate cloning): usando audio de referencia y su transcripción exacta, reproduce todas las matices vocales.
- Salida de audio a 48 kHz con calidad de estudio mediante super-resolución integrada en AudioVAE V2.
- Generación en streaming en tiempo real con RTF ~0.3 en RTX 4090 y ~0.13 con aceleración Nano-vLLM.
- Síntesis consciente del contexto: infiere automáticamente prosodia y expresividad apropiadas según el contenido del texto.
- Soporte de fine-tuning completo (SFT) y LoRA con tan solo 5-10 minutos de audio.

## Casos de uso

- Audiolibros y narración multilingüe: VoxCPM2 puede generar narración natural en 30 idiomas sin etiquetas de idioma, ideal para plataformas de audiolibros que necesitan producir contenido en múltiples mercados con una sola infraestructura.
- Asistentes de voz y chatbots con voz personalizada: el voice design permite crear voces de marca coherentes describiendo características (por ejemplo, "mujer joven, voz dulce y cercana") sin necesidad de grabar a un locutor.
- Doblaje y localización de contenidos: la clonación controlable permite replicar la voz de un actor a partir de un clip corto y ajustar el estilo emocional para adaptarse a la escena, acelerando el proceso de doblaje.
- Accesibilidad para personas con discapacidad del habla: la clonación de voz a partir de grabaciones previas permite preservar la voz de una persona para sistemas de comunicación aumentativa.
- Generación de contenido educativo y e-learning: la síntesis de voz con control de ritmo y emoción es adecuada para crear lecciones interactivas en varios idiomas con una voz consistente.
- Producción de podcasts y contenido audiovisual: el streaming en tiempo real y la calidad de 48 kHz permiten integrar el modelo en pipelines de producción donde se necesita generar locuciones de forma rápida y con alta fidelidad.
- Testing de IVR y sistemas telefónicos: la clonación de voz y el control de estilo permiten generar muestras de voz para probar sistemas de respuesta interactiva en múltiples idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que VoxCPM2 alcanza resultados de vanguardia o competitivos en benchmarks de TTS zero-shot y controlable (Seed-TTS-eval, CV3-eval, InstructTTSEval, MiniMax Multilingual Test), pero remite al repositorio de GitHub para las tablas completas. No se proporcionan cifras concretas en el README ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada: ~8 GB según la model card, lo que permite inferencia en GPUs de gama media.
- GPU recomendada: NVIDIA RTX 4090 para tiempo real (RTF ~0.3); con aceleración Nano-vLLM se logra RTF ~0.13 en la misma GPU.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU con al menos 8 GB de VRAM y soporte CUDA ≥ 12.0 (por ejemplo, RTX 3060, RTX 4060, RTX 3090).
- Opciones de despliegue: librería `voxcpm` (pip install voxcpm), integración con Nano-vLLM para aceleración, y demo en Hugging Face Spaces.
- Requisitos de software: Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0.
- Latencia y throughput: RTF ~0.30 en RTX 4090 sin aceleración; ~0.13 con Nano-vLLM.

## Comparativa con modelos similares

No se dispone de datos de comparativa directa en la información proporcionada. Sin embargo, VoxCPM2 compite con otros modelos TTS multilingües open source como:

| Modelo | Parametros | Idiomas | Salida | Licencia | Contexto |
|---|---|---|---|---|---|
| VoxCPM2 | 2,29 B | 30 | 48 kHz | Apache-2.0 | 8192 tokens |
| XTTS v2 (Coqui) | ~500 M | 17 | 24 kHz | CPML (no comercial) | no disponible |
| Bark (Suno) | ~1,2 B | 13 | 24 kHz | MIT (con restricciones de uso) | no disponible |
| CosyVoice 2 (Alibaba) | ~1,5 B | 4 | 24 kHz | Apache-2.0 | no disponible |

VoxCPM2 destaca por su mayor número de idiomas, salida a 48 kHz y licencia Apache-2.0 sin restricciones comerciales, mientras que alternativas como XTTS v2 tienen licencias más restrictivas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o comportamientos indeseados en la información disponible; se recomienda auditar el modelo antes de desplegarlo en producción.
- La clonación de voz puede utilizarse para suplantación de identidad; es necesario implementar medidas de control y consentimiento en aplicaciones públicas.
- El modelo requiere GPU con al menos 8 GB de VRAM para inferencia local; no se especifica soporte para CPU.
- La longitud máxima de contexto es de 8192 tokens (~21,8 minutos de audio), por lo que textos muy largos necesitan segmentación.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se distribuye tal cual sin garantías; los usuarios deben verificar el cumplimiento de normativas locales sobre voces sintéticas (por ejemplo, la IA Act europea).
- No se han publicado resultados de benchmarks detallados en la documentación accesible, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/VoxCPM2
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación (ReadTheDocs): https://voxcpm.readthedocs.io/en/latest/
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Paper (arXiv): https://arxiv.org/abs/2509.24650
- Aceleración Nano-vLLM: https://github.com/a710128/nanovllm-voxcpm
