# KhoiBui/lifemate-phowhisper-large-v12

## Resumen

KhoiBui/lifemate-phowhisper-large-v12 es un ajuste fino supervisado (SFT) del modelo vinai/PhoWhisper-large, especializado en reconocimiento automático del habla (ASR) en vietnamita. Lo desarrolla el usuario KhoiBui para integrarlo en el sistema LifeMate V12 Voice Agent, un agente de voz en producción. El modelo parte de la arquitectura Whisper-large de OpenAI (transformer encoder-decoder) con 1.543.304.960 parámetros y conserva el tokenizador y la configuración del modelo base.

El problema que aborda es el dominio específico del agente de voz: el PhoWhisper-large original obtiene un WER normalizado del 25,1 % en el conjunto de validación interno, insuficiente para un pipeline conversacional. Tras el ajuste fino, el WER baja al 11,62 % y el CER al 7,04 %, con una mejora notable en la recuperación de entidades y números (del 71,05 % al 88,16 %), métrica crítica cuando el agente debe capturar nombres, fechas o cifras dictadas por el usuario.

Es relevante ahora porque demuestra una estrategia de adaptación de bajo coste: solo se entrena el decodificador de texto (4862 pares audio-transcripción, 2 épocas, lr=1e-5) manteniendo congelado el encoder acústico multirregional de PhoWhisper. El resultado es un checkpoint ligero (6,2 GB en safetensors) que se puede desplegar con `transformers` en una sola GPU y que hereda la licencia BSD-3-Clause del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-large) |
| Parámetros totales | 1.543.304.960 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite las cuantizaciones estándar de Whisper vía bitsandbytes/GGML, no documentadas por el autor) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Whisper-large estándar: encoder convolucional más transformer con atención multi-cabeza sobre espectrogramas mel de 80 canales, con ventana de audio de 30 segundos, y un decoder autorregresivo que genera tokens de transcripción. Sobre esa base, el autor aplica un ajuste fino supervisado con `freeze_encoder=True`: el encoder acústico de PhoWhisper-large, entrenado con datos multirregionales de vietnamita, queda completamente congelado y solo se actualizan los pesos del `WhisperDecoder` durante 2 épocas con tasa de aprendizaje 1e-5.

Los datos de entrenamiento son 4862 pares `(WAV 16 kHz, transcripción gold)` del dominio interno del agente LifeMate V12, separados por `sample_id` de un conjunto de validación estratificado de 174 pares (`DEV_IDS`). No se documenta composición por acentos, géneros ni duración media de los audios. Tampoco se especifica si hubo aumento de datos, especulación, decodificación con beams o cualquier otra innovación técnica más allá del congelado del encoder, que es la decisión de diseño principal: preservar el conocimiento acústico multirregional y adaptar solo la capa lingüística al vocabulario y estilo del dominio.

## Capacidades

- Reconocimiento automático del habla en vietnamita con transcripción de audio de hasta 30 segundos por ventana.
- Manejo de vocabulario y entidades propias del dominio LifeMate V12 (nombres, números, fechas) gracias al ajuste fino supervisado.
- Recuperación de entidades y números con un 88,16 % de recall en el conjunto de validación interno, frente al 71,05 % del modelo base.
- Pipeline estándar de `transformers` con `generate_kwargs={"language": "vi", "task": "transcribe"}`.
- Soporte de decodificación con beams (`num_beams`) y de precisión fp16 en GPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio más allá de la transcripción.

## Casos de uso

- Agente de voz conversacional: el modelo transcribe las intervenciones del usuario en vietnamita con un WER del 11,62 % en el dominio objetivo, lo que reduce errores de interpretación en el enrutado de intenciones del agente LifeMate V12.
- Captura de datos estructurados dictados por voz: con un recall de entidades y números del 88,16 %, es adecuado para extraer nombres, importes, fechas y direcciones en formularios por voz.
- Atención al cliente telefónica automatizada: al estar ajustado sobre 4862 pares del dominio, maneja el registro y las expresiones habituales de los usuarios del servicio mejor que el PhoWhisper-large genérico.
- Subtitulado y transcripción de llamadas internas: la ventana de 30 s por segmento permite procesar conversaciones por bloques con `transformers` y fusionar resultados.
- Asistentes de voz embebidos en aplicaciones móviles: el checkpoint de 6,2 GB en fp16 cabe en GPUs de consumo con al menos 8 GB de VRAM y se puede servir con `transformers` o convertirse a otros formatos.
- Evaluación comparativa de adaptación de dominio: sirve como referencia de cuánto mejora un SFT ligero (solo decoder, 2 épocas) sobre un ASR vietnamita ya especializado, útil para equipos que planeen estrategias similares.
- Transcripción de notas de voz en aplicaciones de productividad en vietnamita, donde la precisión en cifras y nombres propios es el criterio principal.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de validación estratificado interno (`DEV_IDS`, 174 pares):

| Métrica | vinai/PhoWhisper-large (baseline) | KhoiBui/lifemate-phowhisper-large-v12 (SFT) |
|---|---|---|
| WER normalizado (%) ↓ | 25,1 | 11,62 |
| CER normalizado (%) ↓ | 14,23 | 7,04 |
| Recall de entidades y números (%) ↑ | 71,05 | 88,16 |

No se han publicado resultados en benchmarks públicos estándar (FLEURS, VIVOS, Common Voice vi) en la información disponible. Las cifras anteriores corresponden exclusivamente al conjunto de validación interno del autor y no son directamente comparables con evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 3,1 GB solo para pesos (1.543 M de parámetros), más activaciones y caché de atención; en la práctica requiere aproximadamente 4-6 GB de VRAM para inferencia con lotes pequeños.
- VRAM estimada en fp32: unos 6,2 GB solo para pesos, más overhead; no recomendado para GPUs de consumo.
- GPU recomendadas: NVIDIA A100, H100 o L40S para servicio de alto throughput; RTX 4090, RTX 3090 o RTX A5000 para despliegue de un solo nodo.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 en adelante y cualquier GPU con 8 GB o más en fp16.
- Opciones de despliegue: `transformers` (pipeline oficial documentado por el autor), vLLM no aplica de forma nativa a ASR, TGI no soporta Whisper de forma directa; alternativas prácticas son `faster-whisper` o `whisper.cpp` tras conversión de pesos, aunque el autor no las documenta.
- Latencia y throughput: no disponibles. El autor no publica mediciones de RTF (real-time factor) ni de latencia por segmento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | WER reportado |
|---|---|---|---|---|---|
| KhoiBui/lifemate-phowhisper-large-v12 | 1.543 M | 30 s por ventana | vi | BSD-3-Clause | 11,62 % (validación interna) |
| vinai/PhoWhisper-large | 1.543 M | 30 s por ventana | vi | BSD-3-Clause (según modelo base) | 25,1 % (misma validación interna) |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | multilingüe (incluye vi) | Apache-2.0 | no disponible en esta información |
| openai/whisper-large-v2 | 1.550 M | 30 s por ventana | multilingüe (incluye vi) | MIT | no disponible en esta información |

La comparación directa con Whisper-large-v3 o large-v2 en vietnamita no puede establecerse con rigor porque el autor solo publica métricas sobre su propio conjunto de validación. Frente al PhoWhisper-large original, la mejora es clara y medida sobre los mismos 174 pares.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no se ha validado para otros idiomas y probablemente degrade en ellos.
- Las métricas publicadas proceden de un conjunto de validación interno de 174 pares del mismo dominio que el entrenamiento; no hay evidencia de generalización a otros dominios, acentos o condiciones acústicas.
- Riesgo de sobreajuste al vocabulario y estilo del agente LifeMate V12: puede tener un rendimiento peor que el modelo base en conversaciones fuera de ese dominio.
- Riesgo de alucinación en transcripciones: como todo modelo generativo, puede producir texto plausible no presente en el audio, especialmente con ruido o solapamiento de hablantes.
- No se documentan sesgos por género, edad, acento o región; al haberse entrenado con 4862 pares de un solo dominio, es probable que infrarrepresente variantes dialectales del vietnamita.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la cláusula de exención de responsabilidad. Conviene verificar la licencia efectiva del modelo base vinai/PhoWhisper-large antes de desplegar en producción.
- No hay información sobre el proceso de anonimización de los audios de entrenamiento ni sobre la procedencia de los datos, lo que es un caveat relevante para despliegues con datos personales.
- El checkpoint no incluye tokenizador ni configuración propios más allá de los heredados del modelo base; hay que cargarlo con `transformers` respetando esa herencia.
- No se documentan pruebas de robustez ante ruido, reverberación, audio telefónico de 8 kHz ni solapamiento de hablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KhoiBui/lifemate-phowhisper-large-v12
- Modelo base: https://huggingface.co/vinai/PhoWhisper-large
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentación de `transformers` para ASR: https://huggingface.co/docs/transformers/tasks/asr
- `faster-whisper` (implementación CTranslate2, alternativa de despliegue): https://github.com/SYSTRAN/faster-whisper
- `whisper.cpp` (implementación en C/C++ para CPU): https://github.com/ggerganov/whisper.cpp
