# Phoonnx/glowtts-fr_fr-gilles_le_blanc-gruut

## Resumen
Glow-TTS es un modelo de síntesis de voz (text-to-speech) basado en arquitectura Glow-TTS, un modelo generativo de flujo normalizador que convierte fonemas en espectrogramas mel. Este repositorio concreta la voz `fr-fr-gilles_le_blanc`, una voz masculina en francés de Francia, originalmente publicada por Rhasspy dentro del proyecto Larynx v1.0 y reempaquetada por Phoonnx como artefacto ONNX para su librería de TTS.

El modelo resuelve la generación de espectrogramas a partir de fonemas IPA proporcionados por el fonemizador gruut, delegando la síntesis de audio final a un vocoder separado, `hifigan-multi-vctk-small`. Es relevante para desarrolladores que necesitan una voz francesa ligera y ejecutable localmente en entornos con recursos limitados, especialmente en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

El repositorio ocupa aproximadamente 0,1 GB y está orientado a inferencia ONNX, lo que facilita su despliegue en CPU sin depender de frameworks de deep learning pesados. No se dispone de información sobre el número de parámetros ni sobre el volumen de datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujo normalizador generativo sobre fonemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | fr-FR (francés de Francia) |
| Licencia | other (sin licencia registrada; consultar la release upstream de Rhasspy/Larynx) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
Glow-TTS es un modelo de síntesis basado en flujos normalizadores (normalizing flows) que aprende una correspondencia invertible entre fonemas y espectrogramas mel, permitiendo síntesis paralela sin dependencia de un aligner externo autoregresivo. La entrada es una secuencia de fonemas IPA generada por gruut, y la salida es un espectrograma mel que posteriormente se convierte en forma de onda mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF/DPO (habitualmente no aplicables a TTS). El modelo procede de la release v1.0 de Rhasspy Larynx, un proyecto de TTS local orientado a asistentes de voz. La innovación práctica de este reempaquetado es la conversión a ONNX y la integración con el pipeline de phoonnx y scriptconv para normalización de texto y fonemización.

## Capacidades
- Síntesis de voz en francés de Francia (fr-FR) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante gruut (fonemizador incluido en el extra `scriptconv[gruut]`).
- Generación de espectrogramas mel aptos para vocoder HiFi-GAN.
- Ejecución en formato ONNX, sin necesidad de PyTorch en tiempo de inferencia.
- Integración con el ecosistema OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un modelo TTS.
- No dispone de modo "thinking", visión ni audio de entrada.

## Casos de uso
- Asistentes de voz locales en francés: el modelo se integra en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en fr-FR sin conexión a servicios en la nube, con un repositorio de ~0,1 GB.
- Síntesis por lotes de audiolibros o locuciones: al ser un modelo Glow-TTS no autorregresivo, la generación de espectrogramas es paralela y puede procesar frases de forma eficiente en CPU.
- Accesibilidad y lectores de pantalla: conversión de texto a voz en francés para aplicaciones de lectura, aprovechando la inferencia ONNX ligera.
- Sistemas embebidos y Raspberry Pi: el tamaño reducido del repositorio y el formato ONNX permiten desplegar la voz en dispositivos con recursos limitados.
- Pruebas de integración continua de pipelines TTS: uso como voz de referencia francesa para validar cadenas de normalización de texto, fonemización y vocoder.
- Generación de avisos y notificaciones habladas: frases cortas sintetizadas bajo demanda en aplicaciones de domótica o mensajería.
- Investigación y comparación de voces Larynx: el modelo sirve como base para evaluar el vocoder `hifigan-multi-vctk-small` frente a otros vocoders.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM/espacio estimado: el repositorio completo ocupa ~0,1 GB, por lo que la inferencia cabe holgadamente en memoria de sistemas de gama baja.
- GPU recomendadas: no se especifican; al ser ONNX y un modelo Glow-TTS de tamaño reducido, la inferencia en CPU es viable.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos cientos de MB de memoria libre, aunque no se dispone de cifras oficiales.
- Opciones de despliegue: phoonnx (Python y OVOS), con dependencias `scriptconv[gruut]`; el vocoder se descarga automáticamente junto con la voz.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| Phoonnx/glowtts-fr_fr-gilles_le_blanc-gruut | Glow-TTS | fr-FR | ONNX | other | ~0,1 GB |
| Otras voces Larynx de Rhasspy | Glow-TTS / VITS | varios | ONNX/tar | según upstream | no disponible |
| Modelos TTS neuronales grandes (por ejemplo, VITS multilingüe) | VITS | multilingüe | varios | variable | no disponible |
| Piper (sucesor de Larynx) | VITS | multilingüe | ONNX | MIT (según proyecto) | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias
- Licencia `other` sin licencia registrada: es imprescindible consultar la release upstream de Rhasspy/Larynx antes de cualquier uso comercial.
- Solo soporta francés de Francia (fr-FR); no cubre otros idiomas ni variantes regionales.
- Requiere fonemización previa con gruut; textos mal normalizados o fuera de vocabulario pueden producir pronunciaciones incorrectas.
- Riesgo de artefactos y alucinaciones acústicas en palabras poco frecuentes, nombres propios o siglas.
- Depende de un vocoder externo (`hifigan-multi-vctk-small`); la calidad final está condicionada por dicho vocoder.
- No se dispone de información sobre sesgos de género, edad o acento más allá de la identidad de la voz (masculina, `gilles_le_blanc`).
- Modelo de bajo uso (21 descargas, 0 likes en el momento de la ficha): poca validación comunitaria y soporte limitado.
- No apto para tareas de razonamiento, código, matemáticas ni agentes; es exclusivamente un componente TTS.

## Enlaces
- Hugging Face: https://huggingface.co/Phoonnx/glowtts-fr_fr-gilles_le_blanc-gruut
- Release upstream Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/fr-fr_gilles_le_blanc-glow_tts.tar.gz
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
