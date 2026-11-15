# Phoonnx/vits-en_us-ljspeech-high

## Resumen

vits-en_us-ljspeech-high es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en inglés estadounidense en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. No es un modelo de lenguaje generativo: es un sintetizador neuronal de voz de dominio específico.

Su relevancia práctica reside en que ofrece síntesis de voz local, ligera y sin dependencias de servicios en la nube, con pesos en formato ONNX y un tamaño de repositorio de aproximadamente 0,1 GB. Esto lo hace adecuado para asistentes de voz embebidos, sistemas de accesibilidad y aplicaciones de domótica, especialmente dentro del ecosistema OVOS, donde se integra mediante el plugin ovos-tts-plugin-phoonnx.

El modelo está etiquetado como "high" dentro de la jerarquía de calidades de Piper, lo que indica la variante de mayor calidad de la voz ljspeech. La licencia es MIT y el único idioma soportado es en-US. No se dispone de información sobre número de parámetros, contexto ni datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (modelo TTS neuronal de extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Variante de calidad | high |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversario, junto con un decodificador de audio. El modelo toma fonemas IPA como entrada, no texto crudo: la conversión de texto a fonemas la realiza espeak-ng (o su port espyak) a través de la librería scriptconv del ecosistema phoonnx. Esta separación entre front-end fonético y modelo acústico es característica de la familia Piper.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo indica que fue entrenado sobre el corpus LJSpeech, un conjunto de lectura de una única hablante en inglés estadounidense, aunque este dato procede de la convención de nombres y no se detalla en la model card. El empaquetado para phoonnx se limita a exportar los pesos a ONNX y a integrar el front-end fonético; no se documentan innovaciones técnicas adicionales más allá de la propia arquitectura VITS.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV.
- Generación de audio mediante fonemas espeak en alfabeto IPA, lo que requiere instalar espeak-ng o el extra phoonnx[espeak].
- Ejecución local en CPU o GPU mediante ONNX Runtime, sin dependencia de servicios externos.
- Integración con OVOS mediante el plugin ovos-tts-plugin-phoonnx, configurable en mycroft.conf.
- Uso en navegador a través de phoonnx.js, con entrada espeak o unicode.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un sintetizador de voz.
- Capacidad multilingüe limitada a en-US; no cubre otros idiomas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se carga mediante TTSModelManager y el plugin ovos-tts-plugin-phoonnx, permitiendo respuestas habladas en un asistente doméstico sin enviar texto a la nube. Su tamaño reducido (~0,1 GB) y formato ONNX facilitan el despliegue en dispositivos de bajos recursos.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de texto en pantalla en inglés estadounidense, ejecutándose localmente en el equipo del usuario y preservando la privacidad del contenido leído.
- Sistemas de anuncios y notificaciones en domótica: generación de mensajes hablados dinámicos (por ejemplo, avisos de sensores o recordatorios) en un servidor doméstico, con latencia baja al no requerir llamadas a API externas.
- Prototipado de interfaces conversacionales: desarrollo de demos y pruebas de concepto de asistentes por voz donde se necesita una voz inglesa de calidad "high" sin coste de licencia ni cuotas de servicio.
- Síntesis de voz en aplicaciones de escritorio o web: mediante phoonnx.js en el navegador o phoonnx en Python, se puede añadir narración de contenido en inglés a una aplicación sin infraestructura de servidor.
- Generación de audiolibros o contenido narrado de dominio público: al estar entrenado sobre LJSpeech (lectura de una hablante), es adecuado para narrar textos largos en inglés estadounidense con una voz consistente, siempre que se respete la licencia MIT y las condiciones del corpus original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del repositorio (~0,1 GB en ONNX), la huella de memoria es muy reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeño, puede ejecutarse en CPU y en cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, RTX 3060 o integradas).
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS VITS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-ljspeech-high (este) | VITS | en-US | ONNX | MIT | no aplica | Empaquetado para phoonnx; variante high |
| Otras voces Piper en_US (p. ej. lessac, amy) | VITS | en-US | ONNX | MIT (según Piper) | no aplica | Mismo marco Piper, distinta hablante o calidad; no se dispone de datos comparativos de rendimiento |
| Modelos TTS comerciales en la nube | no disponible | multilingüe | API | propietaria | no aplica | Requieren conexión y coste por uso; no comparables en licencia ni despliegue local |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación se limita a aspectos de licencia, formato y despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre LJSpeech, la voz corresponde a una única hablante; no representa diversidad de acentos, edades ni géneros dentro del inglés estadounidense.
- Riesgo de pronunciación incorrecta: si se usa espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Dependencia externa del front-end: requiere espeak-ng o el extra phoonnx[espeak]; sin ellos no se puede generar la entrada fonética.
- Limitación de idioma: solo en-US; no admite otros idiomas ni cambios de voz dentro del mismo modelo.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero se debe verificar las condiciones del corpus LJSpeech original y de los pesos upstream de Rhasspy antes de un despliegue comercial.
- Caveat para producción: no se han publicado métricas de calidad (MOS), latencia ni throughput; conviene evaluar la inteligibilidad y la naturalidad en el caso de uso concreto antes de desplegarlo.
- El modelo no realiza normalización de texto compleja por sí mismo: depende de scriptconv para normalizar y convertir el texto a fonemas, lo que puede afectar a números, siglas y símbolos.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljspeech-high
- Upstream (Piper voices, en_US/ljspeech/high): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
