# Hadidiz9/VoiceTut-TTS

## Resumen

VoiceTut-TTS es un modelo de síntesis de voz (text-to-speech) especializado en árabe egipcio con capacidad de alternancia de código (code-switching) árabe-inglés. Lo desarrolla Mohammed Aly (usuario Hadidiz9 en HuggingFace) como un fine-tuning del modelo base OmniVoice de k2-fsa, y resuelve el problema de la falta de sistemas TTS de calidad para dialectos árabes reales frente al árabe estándar moderno (MSA).

El modelo parte de la arquitectura OmniVoice, que combina un backbone de texto Qwen3-0.6B con un tokenizador de audio Higgs, y suma 612.577.288 parámetros totales. Incorpora 19 voces predefinidas (12 masculinas y 7 femeninas), clonación de voz zero-shot a partir de unos segundos de audio de referencia, una pipeline de normalización de texto específica para árabe egipcio y streaming real para texto largo.

Es relevante porque cubre un nicho poco atendido: la síntesis de habla egipcia natural con mezcla de inglés, frecuente en contextos profesionales y tecnológicos del mundo árabe. Se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial, y su tamaño compacto (2,5 GB de repositorio) permite desplegarlo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniVoice (backbone de texto Qwen3-0.6B + tokenizador de audio Higgs) |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card reporta inferencia en float16) |
| Idiomas soportados | ar (árabe), arz (árabe egipcio), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoiceTut-TTS es un fine-tuning de k2-fsa/OmniVoice, un modelo TTS que acopla un backbone de texto basado en Qwen3-0.6B con un tokenizador de audio Higgs. El modelo resultante conserva esa arquitectura de dos etapas (codificación de texto y generación de tokens de audio) y añade el ajuste específico sobre árabe egipcio. El identificador de idioma principal es `arz` (árabe egipcio), con soporte de code-switching hacia `en`.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se documenta una pipeline de normalización de texto robusta que cubre números, fechas, horas, divisas, teléfonos, correos electrónicos, URLs y abreviaturas, además de un mapa de nombres inglés→árabe. También se incorpora streaming real: el texto largo se segmenta en frases y se emiten fragmentos de audio a medida que se generan. Los parámetros de generación expuestos incluyen `num_step`, `guidance_scale` y `speed`.

## Capacidades

- Síntesis de voz en árabe egipcio con prosodia y naturalidad específicas del dialecto, no del árabe estándar.
- Code-switching árabe-inglés dentro de una misma frase (por ejemplo, «عندي meeting بكرة»).
- 19 voces integradas: 12 masculinas (Ahmed, Ali, Hassan, Karim, Mahmoud, Mohammed, Mostafa, Ramy, Shaker, Tareq, Yehia, Youssef) y 7 femeninas (Hadeer, Hanan, Mariam, Rana, Sarah, Yasmin, Yara), cada una con su clip de referencia.
- Clonación de voz zero-shot a partir de unos segundos de audio de referencia y su transcripción.
- Normalización de texto para números, fechas, horas, divisas, teléfonos, correos, URLs y abreviaturas, con mapa de nombres inglés→árabe.
- Streaming real de audio por frases para texto largo.
- Control de parámetros de generación: pasos de muestreo (`num_step`), escala de guía (`guidance_scale`) y velocidad (`speed`).
- Salida de audio a 24 kHz.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Asistentes de voz para el mercado egipcio: el modelo genera habla natural en dialecto local, lo que mejora la aceptación frente a voces en árabe estándar en atención al cliente telefónica y asistentes domésticos.
- Audiolibros y contenido educativo en árabe egipcio: con streaming real y `synthesize_long`, se puede narrar texto largo por frases y reproducir cada fragmento a medida que se genera.
- Localización de contenido técnico con code-switching: frases que mezclan términos ingleses (reuniones, presentaciones, herramientas) se sintetizan sin cortes ni cambios de voz, algo habitual en entornos profesionales egipcios.
- Clonación de voz para accesibilidad: usuarios con discapacidad del habla pueden generar una voz personalizada a partir de pocos segundos de referencia, con consentimiento previo.
- Doblaje y producción audiovisual: las 19 voces integradas permiten asignar voces distintas a personajes sin necesidad de grabaciones adicionales.
- Sistemas de respuesta de voz interactiva (IVR): el modelo es lo bastante ligero (2,93 GB de VRAM en fp16 y RTF medio de 1,13x en T4) para desplegarse en infraestructura modesta.
- Prototipado de interfaces conversacionales: la API de Python (`voicetut_tts`) y el paquete en PyPI facilitan la integración rápida en demos y pruebas de concepto.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos en una NVIDIA T4 (Colab) con `float16` y `num_step=32`:

| Metrica | Valor |
|---|---|
| RTF medio | 1,13x |
| RTF mejor caso | 0,49x |
| Tiempo hasta el primer audio (streaming) | 1,68 s |
| VRAM pico (fp16) | 2,93 GB |
| WER en árabe egipcio | 0,40 |
| WER en inglés | 0,07 |
| Similitud de hablante (clonación, coseno) | 0,83 |
| Naturalidad (UTMOS, 1-5) | 3,47 |
| Frecuencia de muestreo | 24 kHz |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: 2,93 GB de pico, según medición del autor en T4.
- GPU recomendadas: NVIDIA T4 es suficiente para funcionamiento básico; en A100 o H100 el autor espera un RTF y un TTFA notablemente menores.
- Cabe en GPU de consumo: con menos de 3 GB en fp16, es compatible con tarjetas de gama media y alta (por ejemplo, RTX 3060 en adelante); no se especifican requisitos para cuantizaciones menores.
- Opciones de despliegue: paquete `voicetut-tts` en PyPI sobre el backbone OmniVoice instalado desde GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF medio de 1,13x y mejor caso de 0,49x en T4; tiempo hasta el primer audio de 1,68 s en modo streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoiceTut-TTS | 612,6 M | ar, arz, en | Sí | Apache-2.0 | HuggingFace, PyPI, GitHub |
| OmniVoice (base) | no disponible | no disponible | no disponible | no disponible | GitHub (k2-fsa) |
| Alternativas TTS multilingues | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base OmniVoice, del que se indica que es el punto de partida del fine-tuning pero sin detallar sus especificaciones completas. No se dispone de datos de otros modelos TTS comparables en la información disponible.

## Limitaciones y advertencias

- El WER en árabe egipcio es de 0,40, considerablemente alto; la inteligibilidad del habla sintetizada en este dialecto es limitada en comparación con el inglés (0,07).
- La naturalidad medida por UTMOS es de 3,47 sobre 5, lo que indica margen de mejora frente a sistemas TTS de referencia.
- El RTF medio de 1,13x en T4 implica que la generación es más lenta que el tiempo real en hardware modesto; el mejor caso de 0,49x no es representativo del rendimiento sostenido.
- La clonación de voz plantea riesgos de suplantación de identidad y fraude; el autor exige consentimiento previo y prohíbe el uso para engañar o acosar, aunque la licencia Apache-2.0 no impone restricciones contractuales adicionales.
- El modelo está especializado en árabe egipcio; su comportamiento en otros dialectos árabes o en árabe estándar no está documentado.
- No se detallan sesgos demográficos, de género ni de registro lingüístico en los datos de entrenamiento.
- No se especifican la longitud de contexto máxima ni los límites de texto por petición.
- El repositorio tiene pocas descargas (15) y ningún «like», por lo que la validación por parte de la comunidad es todavía muy reducida.
- La fecha de creación indicada (2026-11-01) es posterior a la de esta ficha; conviene verificar la vigencia de los datos en la página del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hadidiz9/VoiceTut-TTS
- Modelo (autor): https://huggingface.co/mohammedaly22/VoiceTut-TTS
- Demo interactiva (Space): https://huggingface.co/spaces/mohammedaly22/VoiceTut-TTS
- Muestras de audio: https://mohammedaly22.github.io/VoiceTuT-TTS/
- Repositorio GitHub: https://github.com/MohammedAly22/VoiceTuT-TTS
- Paquete PyPI: https://pypi.org/project/voicetut-tts/
- Modelo base OmniVoice: https://github.com/k2-fsa/OmniVoice
- Modelo ASR complementario QwenCleo-ASR: https://github.com/MohammedAly22/qwencleo-asr
- Cuaderno de evaluación: https://github.com/MohammedAly22/VoiceTuT-TTS/blob/main/examples/04_evaluation.ipynb
- Licencia: https://github.com/MohammedAly22/VoiceTuT-TTS/blob/main/LICENSE
