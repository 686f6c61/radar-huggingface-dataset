# Phoonnx/vits-de_de-thorsten-low-mycroft_ai

## Resumen

El modelo `vits-de_de-thorsten-low-mycroft_ai` es un sistema de síntesis de voz (text-to-speech) en alemán desarrollado originalmente por Mycroft AI para su suite de voces Mimic3, y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura neuronal end-to-end que convierte texto en audio directamente sin necesidad de un vocoder separado.

El modelo está especializado en la variante dialectal `de-DE` (alemán estándar de Alemania) y acepta como entrada fonemas generados por `gruut` en alfabeto IPA, lo que le permite una pronunciación más controlada que los sistemas basados en caracteres. La etiqueta `low` en el nombre indica que se trata de una variante de baja calidad o tamaño reducido, orientada a entornos con recursos limitados.

Su relevancia actual radica en que permite integrar síntesis de voz alemana en asistentes domésticos y sistemas de código abierto como OVOS (Open Voice OS), del que Phoonnx forma parte del ecosistema, sin depender de servicios en la nube. El repositorio es pequeño (0,1 GB) y la licencia CC-BY-SA-4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un vocoder condicionado por el texto, todo entrenado de forma conjunta con aprendizaje adversarial (GAN) y una pérdida de reconstrucción espectral. Esta combinación permite generar audio de forma directa desde fonemas sin un pipeline separado de vocoder, lo que simplifica el despliegue y reduce la latencia.

El modelo original fue entrenado por Mycroft AI para su conjunto de voces Mimic3, dentro del directorio `voices/de_DE/thorsten_low`. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). La entrada de texto se procesa mediante `scriptconv` con el fonemizador `GruutPhonemizer`, que normaliza el texto y lo convierte a fonemas IPA antes de pasarlo al modelo.

## Capacidades

- Síntesis de voz en alemán estándar (`de-DE`) a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante `gruut`, lo que permite una pronunciación controlada.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los LLM: es exclusivamente un modelo TTS.
- No soporta visión, audio de entrada ni otros idiomas distintos del alemán.

## Casos de uso

- Asistentes de voz domésticos autoalojados: integrado en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, el modelo permite que un asistente responda en alemán sin enviar texto a servicios en la nube, preservando la privacidad del usuario.
- Lectura de notificaciones y alertas en sistemas embebidos: al ejecutarse sobre ONNX Runtime en CPU, puede desplegarse en dispositivos de bajos recursos (Raspberry Pi, mini-PC) para leer avisos del sistema o del hogar conectado.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla a voz en alemán en aplicaciones de escritorio o navegador, con la ventaja de ser un modelo local y de código abierto.
- Generación de audiolibros o pódcast de bajo coste: síntesis por lotes de textos largos divididos en frases, usando la API de `phoonnx` para producir archivos WAV concatenables.
- Pruebas de integración continua para pipelines de voz: al ser un modelo pequeño (0,1 GB), puede incluirse en tests automatizados de sistemas TTS sin requerir hardware especializado.
- Prototipado de interfaces conversacionales en alemán: desarrolladores que necesiten un TTS rápido y local para validar flujos de diálogo antes de invertir en modelos de mayor calidad.
- Educación y aprendizaje de alemán: generación de pronunciaciones de frases para materiales didácticos, aunque la calidad "low" limita su uso en contextos de alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está empaquetado en ONNX y está pensado para ejecutarse en CPU mediante ONNX Runtime.
- GPU recomendadas: no requiere GPU; puede ejecutarse en cualquier CPU moderna x86 o ARM.
- ¿Cabe en GPU consumer? Sí, pero no es necesario; el tamaño del repositorio (0,1 GB) indica un modelo muy ligero.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser una variante "low" y ejecutarse en CPU, se espera una latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-thorsten-low-mycroft_ai | VITS | de-DE | no aplica | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| VITS de Mycroft AI (thorsten original) | VITS | de-DE | no aplica | CC-BY-SA-4.0 | Mimic3 (no ONNX) | GitHub MycroftAI/mimic3-voices |
| Otras voces VITS de la colección Phoonnx | VITS | varios | no aplica | según modelo | ONNX | Hugging Face (colección Phoonnx) |
| Piper TTS (voces alemanas) | VITS | de-DE | no aplica | MIT (mayoría) | ONNX | GitHub rhasspy/piper |

La comparativa se limita a nivel de arquitectura y licencia, ya que no hay datos de rendimiento publicados para este modelo concreto. La principal diferencia frente a Piper es la licencia (CC-BY-SA-4.0 frente a MIT en muchas voces de Piper), lo que puede afectar a la integración en productos comerciales.

## Limitaciones y advertencias

- La etiqueta `low` indica una variante de baja calidad o tamaño reducido; la naturalidad y fidelidad del audio serán inferiores a las de modelos TTS de mayor tamaño.
- Solo soporta alemán (`de-DE`); no es multilingüe.
- No se dispone de información sobre sesgos del dataset de entrenamiento (por ejemplo, sesgos de género o dialectales), aunque al ser una voz única ("thorsten") probablemente esté limitada a una sola identidad vocal.
- Riesgo de alucinación en TTS: puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o en nombres propios, especialmente al usar fonemas IPA generados automáticamente.
- La licencia CC-BY-SA-4.0 permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- El modelo depende de `scriptconv` y `gruut` para la fonemización; cambios en estas librerías pueden afectar a la calidad de la síntesis.
- No hay datos publicados sobre latencia, throughput ni métricas de calidad (MOS), lo que dificulta evaluar su idoneidad en producción sin pruebas propias.

## Enlaces

- [Hugging Face: Phoonnx/vits-de_de-thorsten-low-mycroft_ai](https://huggingface.co/Phoonnx/vits-de_de-thorsten-low-mycroft_ai)
- [Repositorio upstream: MycroftAI/mimic3-voices (de_DE/thorsten_low)](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/de_DE/thorsten_low)
- [Phoonnx (librería ONNX TTS)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (normalización y fonemizadores)](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
