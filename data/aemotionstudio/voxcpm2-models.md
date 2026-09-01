# AEmotionStudio/voxcpm2-models

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo OpenBMB, de acceso abierto bajo licencia Apache-2.0. Se trata de un sistema tokenizer-free basado en una arquitectura híbrida de difusión y autoregresión que genera audio nativo a 48 kHz, sin necesidad de tokens de voz intermedios. El modelo cuenta con aproximadamente 2,29 mil millones de parámetros y ha sido entrenado con más de dos millones de horas de habla multilingüe.

La relevancia actual de VoxCPM2 radica en que combina tres capacidades que normalmente requieren modelos separados: diseño de voz a partir de descripciones textuales, clonación de voz controlable y clonación de voz de alta fidelidad con transcripción de referencia. Soporta 30 idiomas y 9 dialectos chinos sin necesidad de etiquetas de idioma, lo que simplifica el pipeline de inferencia. El repositorio analizado es un espejo mantenido por AEmotionStudio para su integración en el DAW MAESTRO, con los pesos verificados por suma de comprobación SHA-256 y sin modificaciones respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida tokenizer-free: LocEnc + MiniCPM-4 TSLM (2B) + RALM + LocDiT, con AudioVAE V2 (codificación 16 kHz, decodificación 48 kHz) |
| Parametros totales | 2.290.004.544 (~2,29 B) |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (almacenamiento nativo); no se documentan cuantizaciones adicionales |
| Idiomas soportados | 30 idiomas y 9 dialectos chinos, sin etiquetas de idioma |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (model.safetensors y audiovae.safetensors) |

## Arquitectura y entrenamiento

VoxCPM2 emplea una arquitectura tokenizer-free de difusión-autoregresión. El pipeline se compone de cuatro módulos principales: LocEnc (codificador de localización), MiniCPM-4 TSLM (modelo de lenguaje de síntesis de voz de 2B parámetros), RALM (modelo de lenguaje autoregresivo de referencia) y LocDiT (transformador de difusión de localización). El sistema no utiliza tokens de voz discretos; en su lugar, modela directamente las representaciones latentes continuas del audio. El AudioVAE V2 codifica la señal a 16 kHz para el procesamiento latente y la decodifica a 48 kHz para la salida final en mono.

El entrenamiento se realizó con más de dos millones de horas de habla multilingüe, lo que permite cobertura en 30 idiomas y 9 dialectos chinos. El modelo soporta tres niveles de clonación: clip de referencia únicamente, referencia con directiva de estilo, y referencia con transcripción. No se dispone de información detallada sobre el pipeline de alineación (RLHF, DPO u otros) en la documentación disponible.

## Capacidades

- Síntesis de voz multilingüe a 48 kHz en 30 idiomas y 9 dialectos chinos, sin necesidad de etiquetas de idioma en la entrada.
- Diseño de voz a partir de descripción textual: genera una voz nueva especificando características como edad, género, tono o estilo mediante lenguaje natural.
- Clonación de voz en tres modalidades: con clip de referencia, con referencia más directiva de estilo, y con referencia más transcripción (clonación definitiva).
- Generación de voz en tiempo real con capacidad de streaming.
- Inferencia sin código remoto: el tokenizador se carga como LlamaTokenizerFast estándar, sin necesidad de `trust_remote_code`.
- Salida de audio de calidad de estudio a 48 kHz, superior a los 24 kHz habituales en sistemas TTS previos.

## Casos de uso

- Producción musical y postproducción de audio: integración en DAWs como MAESTRO para generar voces de referencia o coros sintéticos directamente en la sesión de mezcla, aprovechando la salida nativa a 48 kHz.
- Doblaje y localización de contenido audiovisual: clonación de la voz de un actor con clip de referencia y transcripción para generar diálogos en los 30 idiomas soportados sin re-grabar al intérprete.
- Audiolibros y narración automatizada: diseño de una voz consistente mediante descripción textual y generación de largas sesiones de narración con calidad de estudio.
- Asistentes de voz personalizados: clonación de la voz del usuario con un clip corto para aplicaciones de asistente personal, con soporte multilingüe para usuarios que cambian de idioma.
- Generación de contenido para juegos y mundos virtuales: creación de voces de personajes a partir de descripciones de personalidad, sin necesidad de contratar actores de doblaje.
- Accesibilidad y comunicación aumentativa: síntesis de voz personalizada para personas con pérdida de voz, usando grabaciones previas como referencia para mantener su identidad vocal.
- Evaluación de sistemas de voz y pruebas A/B: generación de múltiples variantes de una misma locución con diferentes estilos para testear campañas publicitarias o mensajes de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del modelo no incluye métricas comparativas como MOS (Mean Opinion Score), WER de inteligibilidad o latencia medida en entornos estandarizados.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 4,6 GB (2,29 B parámetros × 2 bytes), por lo que se estima un consumo de entre 6 y 10 GB en inferencia según el tamaño de lote y la longitud de la secuencia de audio.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3060/3070/3080, RTX 4060/4070/4080/4090, o GPUs de datacenter como A10, A100 o L4.
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB o superior debería ser suficiente para inferencia en tiempo real o casi tiempo real.
- Opciones de despliegue: el repositorio espejo está preparado para carga directa con transformers y safetensors; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, al tratarse de un modelo de audio y no de lenguaje.
- Latencia y throughput: no disponible en la documentación; el modelo declara capacidad de streaming en tiempo real, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Idiomas | Licencia | Tokenizer-free |
|---|---|---|---|---|---|
| VoxCPM2 | 2,29 B | 48 kHz | 30 + 9 dialectos | Apache-2.0 | Sí |
| CosyVoice 2 (Alibaba) | no disponible | 24 kHz | multilingüe | Apache-2.0 | No (tokens de voz) |
| XTTS v2 (Coqui) | ~0,8 B | 24 kHz | 17 | CPML (no comercial) | No (tokens de voz) |

La comparativa se basa en datos públicos generales; no se dispone de benchmarks comparativos directos entre estos modelos en la información proporcionada. VoxCPM2 destaca por su frecuencia de muestreo superior (48 kHz frente a 24 kHz) y por su licencia Apache-2.0, que permite uso comercial sin restricciones, a diferencia de XTTS v2.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos demográficos o lingüísticos del modelo; al estar entrenado con dos millones de horas de habla, es probable que existan desequilibrios entre idiomas y acentos no documentados.
- Riesgo de alucinación acústica: como todo sistema generativo de audio, puede producir artefactos o pronunciaciones incorrectas en nombres propios o términos fuera de vocabulario.
- La clonación de voz plantea riesgos de suplantación de identidad; el uso debe cumplir la normativa de consentimiento y protección de datos aplicable.
- El repositorio espejo omite el archivo `tokenization_voxcpm2.py` del upstream y carga un LlamaTokenizerFast estándar; aunque se describe como pérdida sin pérdida, cualquier diferencia de tokenización podría afectar a casos límite.
- No se documenta la longitud máxima de audio generable por pasada ni el comportamiento con contextos de referencia muy largos.
- La licencia Apache-2.0 cubre el código y los pesos, pero no exime de responsabilidades legales derivadas del uso de voces de personas reales.

## Enlaces

- Repositorio espejo analizado: https://huggingface.co/AEmotionStudio/voxcpm2-models
- Repositorio original: https://huggingface.co/openbmb/VoxCPM2
- Página del proyecto: https://voxcpm2.org/
- Modelo en ModelScope: https://www.modelscope.cn/models/OpenBMB/VoxCPM2
- Código fuente (OpenBMB/VoxCPM): https://github.com/OpenBMB/VoxCPM
