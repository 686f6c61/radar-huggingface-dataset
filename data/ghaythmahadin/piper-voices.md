# GhaythMahadin/piper-voices

## Resumen

`GhaythMahadin/piper-voices` es un repositorio de pesos (checkpoints) de voces para Piper, el sistema de síntesis de voz (text-to-speech, TTS) de código abierto desarrollado en el ecosistema Rhasspy. No se trata de un modelo de lenguaje generativo, sino de una colección de modelos acústicos y vocoders en formato ONNX pensados para la inferencia local y de baja latencia de conversión texto-a-habla. El autor del repositorio es GhaythMahadin, que actúa como agregador de voces; el desarrollo original de Piper corresponde al proyecto Rhasspy.

El repositorio cubre 35 idiomas (árabe, catalán, checo, galés, danés, alemán, griego, inglés, español, persa, finés, francés, húngaro, islandés, italiano, georgiano, kazajo, luxemburgués, letón, nepalí, neerlandés, noruego, polaco, portugués, rumano, ruso, eslovaco, esloveno, serbio, sueco, suajili, turco, ucraniano, vietnamita y chino) y ocupa 12,0 GB en el repositorio de Hugging Face. Su relevancia actual radica en que permite desplegar TTS multilingüe en CPU sin depender de servicios en la nube, algo útil para asistentes de voz, accesibilidad y sistemas de respuesta por voz en entornos con recursos limitados.

La licencia es MIT, lo que facilita su integración en productos comerciales, aunque conviene verificar la procedencia y licencia de cada voz individual, ya que los datasets de entrenamiento subyacentes pueden tener condiciones propias. La model card es mínima: únicamente declara la licencia, los idiomas y que son voces para Piper, remitiendo a los checkpoints de entrenamiento del proyecto original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos acústicos y vocoder de Piper (TTS neuronal, formato ONNX); arquitectura concreta por voz no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto de texto; procesa fonemas por utterance) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en ONNX; Piper usa habitualmente precisión reducida, pero no se detalla) |
| Idiomas soportados | ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh (35 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 12,0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Piper es un sistema TTS neuronal que combina un modelo acústico (que convierte fonemas en representaciones acústicas intermedias) con un vocoder (que genera la forma de onda final). Los pesos se exportan a ONNX para permitir inferencia eficiente en CPU mediante ONNX Runtime, lo que es una de las señales de identidad del proyecto: está diseñado para ejecutarse en hardware modesto, incluidas Raspberry Pi, con latencia baja y sin GPU dedicada.

La información proporcionada no detalla la arquitectura interna de cada voz (por ejemplo, si emplea VITS, FastPitch, Tacotron u otra), ni el número de tokens o la composición exacta de los datasets de entrenamiento. La model card remite a los checkpoints de entrenamiento del proyecto Rhasspy (`rhasspy/piper-checkpoints`), lo que sugiere que las voces se entrenaron con el pipeline oficial de Piper documentado en su repositorio. No se indica si hubo ajuste fino con RLHF/DPO (no aplicable en TTS) ni innovaciones técnicas específicas más allá del propio diseño de Piper.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en 35 idiomas, incluyendo español, catalán y una amplia cobertura europea, asiática y de Oriente Medio.
- Generación de audio en formato de onda mediante modelos ONNX, ejecutable en CPU con ONNX Runtime.
- Soporte multilingüe amplio: voces independientes por idioma, no traducción entre idiomas.
- Integración con el ecosistema Piper (CLI, servidor HTTP y bibliotecas cliente).
- No incluye capacidades de reconocimiento de voz, traducción, razonamiento, código, matemáticas, visión ni tool calling.
- No dispone de modo de razonamiento (thinking mode), agentes ni multi-step reasoning.
- No se documentan capacidades de control de prosodia, clonación de voz ni emociones; son voces preentrenadas de locutores fijos.

## Casos de uso

- Asistentes de voz locales: integrar una voz en español o inglés en un asistente domótico (por ejemplo, Home Assistant) que funcione sin conexión a internet, aprovechando la inferencia ONNX en CPU y la baja latencia de Piper.
- Accesibilidad y lectura de pantalla: convertir texto de artículos, notificaciones o interfaces en audio para personas con discapacidad visual, eligiendo la voz del idioma correspondiente entre las 35 disponibles.
- Sistemas de respuesta por voz (IVR) en atención al cliente: generar mensajes pregrabados dinámicamente en varios idiomas sin depender de APIs de terceros, con licencia MIT que permite uso comercial.
- Locución automatizada de contenidos: generar narraciones para vídeos, pódcast o audiolibros de forma batch, usando el pipeline de Piper para procesar grandes volúmenes de texto sin coste por carácter.
- Dispositivos embebidos y edge computing: desplegar TTS en Raspberry Pi o dispositivos IoT con recursos limitados, ya que los modelos ONNX de Piper están pensados para ejecutarse sin GPU.
- Prototipado de aplicaciones de voz: usar las voces para pruebas de UX conversacional, demos de chatbots o investigación en interacción humano-máquina, sustituyendo servicios cloud por inferencia local reproducible.
- Multilingüismo en productos: ofrecer la misma funcionalidad de voz en mercados con idiomas como árabe, persa, nepalí, suajili o georgiano, donde las alternativas comerciales suelen ser escasas o más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; Piper está diseñado para inferencia en CPU con ONNX Runtime, por lo que no requiere GPU para funcionar.
- GPU recomendadas: no aplica para el flujo estándar; opcionalmente puede ejecutarse con aceleración si el runtime ONNX lo permite, pero no se documentan requisitos.
- Cabe en GPU de consumo: sí, en la medida en que el flujo estándar ni siquiera necesita GPU; los modelos individuales son pequeños comparados con LLM, aunque el repositorio completo ocupa 12,0 GB.
- Opciones de despliegue: Piper CLI, servidor HTTP de Piper, ONNX Runtime; no se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada; Piper se caracteriza por baja latencia en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GhaythMahadin/piper-voices | TTS (Piper) | 35 | MIT | ONNX | Hugging Face |
| Piper (rhasspy/piper) | TTS | Múltiples (según voces publicadas) | MIT | ONNX | GitHub / Hugging Face |
| Coqui TTS (XTTS) | TTS | Múltiples | MPL-2.0 / otras según modelo | PyTorch | GitHub / Hugging Face |
| Kokoro TTS | TTS | Principalmente inglés y otros | Apache 2.0 | ONNX / PyTorch | Hugging Face |

Nota: los datos de Coqui TTS y Kokoro TTS se incluyen como referencia de categoría; no se dispone de comparación de rendimiento numérico en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima y no documenta sesgos, calidad por idioma ni procedencia de los datasets de entrenamiento de cada voz.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, nombres propios, siglas y números; no se documenta manejo explícito de estos casos.
- No es un modelo de lenguaje: no comprende el texto, solo lo convierte a fonemas y audio; errores de normalización textual afectan directamente a la locución.
- La cobertura de 35 idiomas no implica la misma calidad en todos ellos; no se aportan métricas de naturalidad (MOS) por idioma.
- Aunque la licencia del repositorio es MIT, deben revisarse las licencias de los datasets y voces individuales antes de uso comercial, ya que el autor agrega voces de terceros.
- El repositorio ocupa 12,0 GB, lo que puede dificultar su descarga y almacenamiento en entornos con espacio limitado; conviene descargar solo las voces necesarias.
- Sin descargas ni likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- No se documentan garantías de mantenimiento ni actualizaciones futuras del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GhaythMahadin/piper-voices
- Proyecto Piper (GitHub): https://github.com/rhasspy/piper
- Documentación de entrenamiento de Piper: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints de entrenamiento de Piper: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
