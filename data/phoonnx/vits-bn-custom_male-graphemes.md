# Phoonnx/vits-bn-custom_male-graphemes

## Resumen

`Phoonnx/vits-bn-custom_male-graphemes` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS de Coqui, empaquetado en formato ONNX por el proyecto Phoonnx para su uso con la librería `phoonnx`. El modelo original procede del release v0.13.3 de Coqui TTS (`tts_models--bn--custom--vits_male`) y ha sido reconvertido para ejecutarse en entornos Python y en el asistente OVOS. Está especializado en una única voz masculina en bengalí (`bn`).

El modelo resuelve el problema de la síntesis de voz en bengalí dentro del ecosistema Phoonnx/OVOS, donde el catálogo de voces disponibles es reducido. Al estar empaquetado como ONNX, puede ejecutarse sin depender del framework completo de Coqui TTS, lo que simplifica el despliegue en entornos embebidos o asistentes de voz locales.

Su relevancia es acotada: se trata de un modelo pequeño (repo de 0,1 GB), con 20 descargas y sin resultados de benchmarks publicados. Es útil para proyectos que necesiten TTS en bengalí con una voz masculina concreta y que ya estén integrados en el ecosistema Phoonnx u OVOS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por caracteres) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bengalí (`bn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`; upstream en Coqui TTS) |

## Arquitectura y entrenamiento

VITS es un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial en entrenamiento. Genera waveform directamente a partir de texto, sin necesidad de un vocoder externo separado. El modelo original fue entrenado por Coqui y publicado en el release v0.13.3 de su repositorio TTS.

Phoonnx no ha reentrenado el modelo: lo ha convertido a ONNX y lo ha integrado con su pipeline de front-end textual. El front-end utiliza `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte en caracteres (graphemes) como entrada del modelo, en lugar de usar fonemas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en bengalí a partir de texto en caracteres.
- Voz masculina única (`coqui/bn-custom-vits-male`).
- Entrada basada en graphemes mediante `GraphemePhonemizer` de `scriptconv`.
- Ejecución en formato ONNX a través de la librería `phoonnx`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en bengalí: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de respuesta hablada a un asistente doméstico en bengalí con una voz masculina concreta.
- Lectura de notificaciones y alertas: síntesis de mensajes cortos generados por sistemas de monitorización o domótica, usando la API `synthesize_wav` para producir ficheros WAV reproducibles.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido textual en bengalí dentro de aplicaciones de escritorio o web que ya usen el stack Phoonnx.
- Generación de audiolibros o pódcasts de bajo coste: conversión por lotes de texto bengalí a audio con una única voz masculina, aprovechando el tamaño reducido del modelo (0,1 GB) para ejecución en CPU.
- Pruebas y prototipado de pipelines TTS: validación de flujos de normalización textual con `scriptconv` antes de escalar a voces de mayor calidad o a otros idiomas.
- Integración en aplicaciones Python sin Coqui TTS: despliegue del modelo vía `phoonnx` en entornos donde instalar el framework completo de Coqui no es viable, manteniendo la misma arquitectura VITS subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es plausible su ejecución en CPU, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: `phoonnx` (Python) y `ovos-tts-plugin-phoonnx` (OVOS). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-bn-custom_male-graphemes | VITS (Coqui) | bn | Apache 2.0 | ONNX | Hugging Face (20 descargas) |
| Coqui TTS `tts_models--bn--custom--vits_male` (upstream) | VITS (Coqui) | bn | Apache 2.0 | Coqui TTS | GitHub releases de Coqui |
| Otras voces de la colección VITS de Phoonnx | VITS (Coqui) | varios | Apache 2.0 | ONNX | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de una sola voz masculina en bengalí; no cubre otras voces, géneros ni idiomas.
- Entrada basada en graphemes, no en fonemas: la calidad de pronunciación puede ser inferior a la de modelos con fonemización específica del idioma.
- No se han publicado métricas de calidad (MOS, WER, etc.), por lo que no es posible evaluar su fidelidad frente a alternativas.
- Riesgo de alucinación acústica y artefactos en textos largos o con caracteres fuera del dominio de entrenamiento; no documentado por el autor.
- Sesgos de género y de pronunciación no evaluados; al ser una voz masculina única, no es adecuada para aplicaciones que requieran diversidad de voces.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y condiciones del dataset original de Coqui, no detalladas en la model card.
- Dependencia del ecosistema `phoonnx` y `scriptconv`; la API de uso es específica de estas librerías y no estándar respecto a otros runners TTS.
- Sin soporte de control de prosodia, emoción ni velocidad más allá de lo que permita la API de `phoonnx`.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-bn-custom_male-graphemes)
- [Upstream Coqui TTS v0.13.3 (zip del modelo)](https://github.com/coqui-ai/TTS/releases/download/v0.13.3_models/tts_models--bn--custom--vits_male.zip)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
