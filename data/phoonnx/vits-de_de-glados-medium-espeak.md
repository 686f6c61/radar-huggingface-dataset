# Phoonnx/vits-de_de-glados-medium-espeak

## Resumen

`vits-de_de-glados-medium-espeak` es un modelo de síntesis de voz (text-to-speech) en alemán, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original es un VITS entrenado por systemofapwne, derivado de su familia `piper-de-glados`, y esta versión concreta corresponde a la variante `de_DE/glados/medium`. La voz reproduce el timbre de GLaDOS, la inteligencia artificial antagonista de la saga *Portal* de Valve.

El modelo no es un transformer de lenguaje, sino un sistema TTS de extremo a extremo basado en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura que combina un encoder de texto, un prior variacional normalizing flow y un decoder generativo, entrenado de forma adversarial con discriminadores multi-periodo. El paquete de Phoonnx incluye únicamente los pesos en formato ONNX (0,1 GB), lo que lo hace ligero y apto para inferencia en CPU.

Su relevancia es acotada: se trata de una voz comunitaria de nicho, con solo 20 descargas y 0 likes en el momento de la consulta, pensada para integrarse en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. El idioma soportado es exclusivamente alemán (`de-DE`), y la entrada de texto debe fonemizarse previamente con espeak-ng o con el port espyak.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flows y decoder adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Autor original | systemofapwne |
| Empaquetador | Phoonnx |
| Libreria de inferencia | phoonnx (Python y OVOS) |
| Fecha de creacion | 2026-11-14 |
| Fecha de actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que integra en un único modelo un encoder de texto condicionado por alineamiento monotónico (MAS, Monotonic Alignment Search), un prior variacional con normalizing flows, un decoder generativo y un discriminador adversarial multi-periodo (MPD) y multi-escala (MSD) durante el entrenamiento. La inferencia produce directamente la forma de onda, sin necesidad de vocoder externo. Esta variante `medium` corresponde a la configuración de tamano intermedio de la familia Piper, aunque el número exacto de parametros no se documenta en la información disponible.

No se dispone de datos sobre el corpus de entrenamiento (número de horas, composición del dataset, hablantes, calidad de las grabaciones) ni sobre si se aplicaron técnicas de fine-tuning adicionales. El modelo upstream es `systemofapwne/piper-de-glados/de/de_DE/glados/medium`, una voz Piper comunitaria derivada del proyecto Piper TTS. Phoonnx se limita a empaquetar los pesos ONNX y a proporcionar un front-end de texto basado en `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`.

## Capacidades

- Síntesis de voz en alemán (`de-DE`) a partir de texto plano, con salida en formato WAV.
- Fonemización mediante espeak-ng (recomendado) o espyak (port Python, con posibles divergencias fonéticas).
- Integración como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`), configurable vía `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js`, con entrada espeak o unicode y demo en vivo.
- Inferencia ONNX ligera, apta para CPU y dispositivos de bajos recursos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de código: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- **Asistentes de voz domésticos en alemán**: integración directa en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`; el modelo sintetiza respuestas del asistente en `de-DE` con una latencia baja gracias a la inferencia ONNX en CPU.
- **Prototipado de interfaces conversacionales**: al ser un paquete de 0,1 GB con licencia MIT, permite incorporar una voz alemana en demos y pruebas de concepto sin dependencias de servicios cloud ni costes por petición.
- **Accesibilidad y lectura de textos**: conversión de contenido textual alemán (noticias, documentación, avisos) a audio para lectores de pantalla o sistemas de megafonía local.
- **Contenido creativo y modding**: la voz GLaDOS resulta adecuada para proyectos de fan, mods de videojuegos o piezas audiovisuales donde se busque ese timbre concreto, siempre que se respeten las condiciones de la licencia MIT.
- **Aplicaciones embebidas y edge computing**: el formato ONNX y el reducido tamano del repositorio permiten desplegar la síntesis en dispositivos con recursos limitados (Raspberry Pi, mini-PC) sin GPU.
- **Sistemas de anuncios automatizados**: generación de avisos hablados en alemán en entornos como transporte público, comercios o fábricas, donde se requiere una voz consistente y predecible.
- **Investigación en TTS**: como referencia reproducible de una voz Piper comunitaria empaquetada en ONNX, útil para comparativas de calidad, latencia y comportamiento del front-end espeak frente a espyak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo está pensado para inferencia en CPU mediante ONNX. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es muy reducida (del orden de cientos de MB incluyendo runtime y buffers).
- **GPU recomendadas**: no se documentan; no es necesario GPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no se proporcionan cifras.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU de gama baja.
- **Opciones de despliegue**: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-de_de-glados-medium-espeak` | VITS | de-DE | 0,1 GB (repo) | MIT | ONNX | Voz GLaDOS empaquetada para phoonnx |
| `systemofapwne/piper-de-glados` (upstream) | VITS (Piper) | de-DE | no disponible | no disponible en la información | Piper (ONNX) | Modelo original del que deriva esta versión |
| Otras voces Piper en alemán | VITS (Piper) | de-DE | variable | variable | ONNX | Familia Piper; no se dispone de datos concretos de comparación |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas; los datos de modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo sintetiza alemán (`de-DE`); el texto en otros idiomas producirá una pronunciación incorrecta o ininteligible.
- **Dependencia de espeak-ng**: la calidad de la síntesis depende del fonemizador. Con espyak (port Python) algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- **Alucinación y artefactos**: como todo modelo TTS, puede generar prosodia incorrecta, pausas anómalas o artefactos acústicos en frases largas, signos de puntuación atípicos o texto no normalizado.
- **Sesgos**: al derivar de una voz concreta (GLaDOS), el timbre es característico y no neutro; no es adecuada para aplicaciones que requieran una voz genérica o profesional.
- **Licencia**: MIT, lo que permite uso comercial y modificación, pero el aviso de la model card remite a los términos del release upstream, cuyas condiciones no se detallan en la información disponible; conviene verificar la licencia del modelo original antes de un uso comercial.
- **Madurez**: con 20 descargas y 0 likes, es un modelo de nicho sin validación comunitaria amplia; no hay benchmarks ni evaluaciones de calidad publicadas.
- **Producción**: no se documentan métricas de latencia, throughput ni estabilidad; para entornos críticos se recomienda evaluar la calidad subjetiva (MOS) y la tasa de errores de pronunciación antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados-medium-espeak
- Modelo upstream: https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
