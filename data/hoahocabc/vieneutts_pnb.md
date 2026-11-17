# hoahocabc/vieneutts_pnb

## Resumen

VieNeu-TTS es un sistema de síntesis de voz (text-to-speech) en vietnamita orientado a inferencia on-device, desarrollado por Pham Nguyen Ngoc Bao (publicado en Hugging Face bajo el usuario `hoahocabc`). El repositorio `vieneutts_pnb` corresponde a un artefacto de la familia VieNeu-TTS, cuya versión abierta más reciente documentada es la v3 Turbo, construida sobre una arquitectura propia entrenada desde cero con un códec de audio MOSS-Audio-Tokenizer-Nano y el fonemizador sea-g2p.

El modelo resuelve el problema de generar voz vietnamita natural con clonación de voz instantánea a partir de clips de 3 a 8 segundos, audio a 48 kHz, 25 voces predefinidas y un modo específico de conversación/pódcast con generación por lotes. Su propuesta de valor es la velocidad: streaming en tiempo real con primer audio en torno a 115 ms y un RTF de 0,01 a 0,02 en GPU de consumo (RTX 3060), además de funcionar a aproximadamente 2 veces tiempo real en CPU.

Es relevante ahora porque la versión v4, con mayor fidelidad de clonación, se ha cerrado como propietaria y solo se ofrece vía API, de modo que la v3 Turbo queda como la última versión de código abierto de la familia. No obstante, la información disponible sobre el repositorio concreto `hoahocabc/vieneutts_pnb` es muy escasa: el tamaño del repo figura como 0.0 GB, no hay pipeline declarado, ni licencia, ni idiomas, ni descargas, y la model card disponible es la genérica del proyecto VieNeu-TTS, no una ficha específica de este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal propia (v3 Turbo, entrenada desde cero); códec MOSS-Audio-Tokenizer-Nano y fonemizador sea-g2p |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (bilingüe según la model card, sin detallar el segundo idioma) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo figura con 0.0 GB) |

## Arquitectura y entrenamiento

La model card describe VieNeu-TTS v3 Turbo como una arquitectura nueva diseñada y entrenada desde cero por Pham Nguyen Ngoc Bao. El sistema se apoya en el códec de audio MOSS-Audio-Tokenizer-Nano para la representación y reconstrucción del audio, y en el fonemizador sea-g2p para el procesamiento lingüístico del vietnamita. La salida es audio a 48 kHz, el doble de la frecuencia de la versión anterior (24 kHz), lo que indica una mejora en la fidelidad de la señal generada.

El entrenamiento se realizó sobre más de 10.000 horas de datos bilingües según la model card. No se especifican en la información disponible el número exacto de tokens, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. Sí se menciona soporte de ajuste fino mediante LoRA en una única GPU de consumo, lo que permite adaptar la voz o el estilo de lectura. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal; las innovaciones documentadas son de despliegue (streaming, generación por lotes, API compatible con OpenAI) y de control (clonación instantánea con denoising automático de la referencia, marcadores de emoción no verbales experimentales).

## Capacidades

- Síntesis de voz en vietnamita con salida a 48 kHz.
- Clonación de voz instantánea a partir de un clip de referencia de 3 a 8 segundos, con denoising automático de la referencia.
- 25 voces predefinidas integradas (10 seleccionadas por el equipo), estables y sin necesidad de clip de referencia.
- Modo conversación/pódcast multihablante con generación por lotes de todo el guion, independientemente del hablante.
- Generación por lotes con tamaño de lote de hasta 32.
- Streaming en tiempo real con primer audio en torno a 115 ms.
- API compatible con OpenAI (`POST /v1/audio/speech`), integrable con el SDK de OpenAI, Pipecat y LiveKit.
- Despliegue con Docker y servidor API incluido.
- Marcadores de emoción y sonidos no verbales experimentales en el texto (`[cười]`, `[thở dài]`, `[hắng giọng]`).
- Ajuste fino con LoRA para voces o estilos de lectura propios en una GPU de consumo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo TTS.

## Casos de uso

- Audiolibros y lectura de textos largos: el modo de lectura natural y la generación por lotes permiten procesar capítulos completos con una voz consistente sin necesidad de referencia, usando las voces predefinidas.
- Doblaje y localización de vídeo al vietnamita: la clonación instantánea desde un clip corto permite mantener la identidad de la voz del hablante original en el material doblado.
- Pódcast y contenido conversacional: el modo Conversation agrupa por lotes todo el guion multihablante, lo que reduce el coste de generar diálogos con varias voces de forma coherente.
- Asistentes de voz y agentes conversacionales en tiempo real: la API compatible con OpenAI y el primer audio en torno a 115 ms lo hacen apto para integrarse en pipelines de Pipecat o LiveKit con baja latencia percibida.
- Atención al cliente telefónica o por voz: el streaming en CPU a aproximadamente 2 veces tiempo real permite desplegar en servidores sin GPU, con 16 streams concurrentes bajo 200 ms en una sola RTX 3060.
- Accesibilidad y lectura de pantalla: la inferencia on-device y el funcionamiento en CPU facilitan integrar la síntesis en aplicaciones de escritorio o móviles sin depender de la nube.
- Creación de contenido para redes (reels, narraciones): la velocidad de generación y el control de estilo mediante la referencia permiten producir locuciones cortas de forma iterativa.

## Benchmarks y rendimiento

La model card proporciona métricas de velocidad y latencia, no de calidad perceptual:

| Metrica | Valor |
|---|---|
| Primer audio (streaming) | ~115 ms |
| RTF en GPU de consumo (RTX 3060, por lotes) | 0,01–0,02 |
| RTF en CPU | ~2× tiempo real |
| Streams concurrentes (RTX 3060) | 16 bajo 200 ms; máximo 32 |
| Tamano de lote máximo | 32 |
| Frecuencia de muestreo de salida | 48 kHz |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- GPU de consumo suficiente: RTX 3060 para streaming con 16 flujos concurrentes bajo 200 ms y RTF de 0,01–0,02 por lotes.
- Funciona en CPU sin GPU, a aproximadamente 2 veces tiempo real, lo que habilita despliegues de bajo coste.
- VRAM estimada para inferencia: no disponible (el tamaño del modelo no se especifica).
- GPU recomendadas: RTX 3060 como referencia documentada; no se detallan A100, H100 ni otras.
- Despliegue: servidor API y Docker incluidos, con endpoint compatible con OpenAI; SDK de Python (`Vieneu(mode="v3turbo")`); interfaz web Gradio de demostración.
- Ajuste fino LoRA en una única GPU de consumo.
- Latencia y throughput: ver tabla de benchmarks.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros sistemas TTS ni datos de modelos alternativos (por ejemplo, de la familia MOSS-TTS u otros TTS vietnamitas) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El repositorio `hoahocabc/vieneutts_pnb` no declara licencia, idiomas ni pipeline, y su tamaño figura como 0.0 GB, por lo que no puede confirmarse que contenga pesos utilizables.
- La model card corresponde al proyecto VieNeu-TTS en general y no a este artefacto concreto; los datos de arquitectura, entrenamiento y rendimiento deben atribuirse a la v3 Turbo, no necesariamente a este repo.
- La versión v4, con mayor fidelidad de clonación, es propietaria y solo está disponible vía API; la v3 Turbo es la última versión abierta documentada.
- La clonación de voz plantea riesgos de suplantación y uso indebido; la propia model card justifica el cierre de la v4 por este motivo. Es necesario aplicar consentimiento y controles en producción.
- Riesgo de alucinación y de artefactos prosódicos inherente a los sistemas TTS neuronales; no se documentan tasas de error ni evaluaciones de calidad.
- El soporte lingüístico documentado es el vietnamita; no se detalla el segundo idioma del entrenamiento bilingüe.
- Los marcadores de emoción y sonidos no verbales están marcados como experimentales.
- No se especifican restricciones de uso comercial por ausencia de licencia declarada; debe consultarse al autor antes de un despliegue comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hoahocabc/vieneutts_pnb
- VieNeu-TTS v3 Turbo: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- VieNeu-TTS v2: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v2
- VieNeu-TTS v1: https://huggingface.co/pnnbao-ump/VieNeu-TTS
- Códec MOSS-Audio-Tokenizer-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Fonemizador sea-g2p: https://github.com/pnnbao97/sea-g2p
- Sitio oficial y descargas: https://www.vieneu.io
- Demo en Colab: https://colab.research.google.com/drive/1b9PO-lcGZX9pEkEwQmu8MfhSnjxKrALW
- Discord del proyecto: https://discord.gg/yJt8kzjzWZ
- Lista Awesome NLP (referenciada en la model card): https://github.com/keon/awesome-nlp
