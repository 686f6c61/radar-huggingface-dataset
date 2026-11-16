# Phoonnx/vits-en_us-vctk-low-gruut

## Resumen

`vits-en_us-vctk-low-gruut` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, originalmente entrenado por Mycroft AI para su motor de voces Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera audio a partir de texto en inglés estadounidense (`en-US`), tomando como entrada fonemas en alfabeto IPA generados mediante el fonemizador gruut que integra la librería `scriptconv`.

La variante `vctk_low` corresponde a un modelo de baja calidad y bajo coste computacional, pensado para entornos con recursos limitados (asistentes de voz embebidos, dispositivos de gama baja, sistemas OVOS/Mycroft). No se trata de un modelo de propósito general ni de un LLM: es un sintetizador neuronal específico de una sola voz y un solo idioma, con un repositorio de apenas 0,1 GB, lo que refleja su naturaleza compacta.

Su relevancia actual es acotada pero práctica: ofrece una ruta de despliegue sencilla (ONNX, Python, plugin OVOS) para aplicaciones de voz que necesitan síntesis local sin dependencias de servicios en la nube. La información pública disponible es escasa: no se detallan parámetros, contexto ni benchmarks, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; el sufijo "low" indica variante de baja calidad/coste) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Voz | única (variante `vctk_low` de Mimic 3) |
| Librería de inferencia | `phoonnx` (con extra `scriptconv[gruut]`) |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. El modelo produce formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de ajuste (RLHF/DPO no aplica a un TTS). El modelo original fue entrenado por Mycroft AI para la voz `en_US/vctk_low` de Mimic 3, presumiblemente sobre el corpus VCTK (Voice Cloning Toolkit), aunque la model card no lo confirma explícitamente. Phoonnx se limita a empaquetar los pesos en ONNX y a integrar el front-end de texto mediante `scriptconv` y el fonemizador gruut. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Conversión de texto a fonemas IPA mediante gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local en Python con inferencia ONNX (sin servicio en la nube).
- Voz única predefinida (`mimic3/en_US/vctk_low`); no soporta clonación de voz ni selección entre múltiples hablantes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No soporta visión, audio de entrada ni modo "thinking".
- Capacidad multilingüe: no; únicamente inglés estadounidense.

## Casos de uso

- Asistentes de voz embebidos en OVOS/Mycroft: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente local pronuncie respuestas sin depender de APIs externas, gracias a su tamaño reducido (0,1 GB) y su formato ONNX.
- Síntesis de voz en dispositivos de recursos limitados (Raspberry Pi, dispositivos IoT): la variante `low` está pensada para minimizar coste computacional, lo que la hace adecuada para hardware sin GPU dedicada.
- Generación de avisos y notificaciones habladas: para sistemas de domótica o alertas que necesitan convertir cadenas cortas de texto en audio en tiempo real con baja latencia.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia barata para validar integraciones con `phoonnx` y `scriptconv` antes de pasar a voces de mayor calidad.
- Accesibilidad: lectura en voz alta de contenido textual en inglés para aplicaciones de asistencia a personas con discapacidad visual, siempre que se acepte la calidad limitada de la variante `low`.
- Prototipado de interfaces conversacionales: permite construir demos de asistentes de voz en inglés sin incurrir en costes de servicios TTS comerciales, con la contrapartida de una calidad de audio moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que se espera un consumo de memoria muy bajo, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible; al ser un modelo ONNX de tamaño reducido, es probable que funcione en CPU, aunque no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, es plausible que quepa en cualquier GPU de consumo e incluso en CPU, pero no hay datos que lo verifiquen.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-en_us-vctk-low-gruut` | VITS | en-US | 0,1 GB (repo) | CC-BY-SA-4.0 | ONNX | Variante `low` de Mimic 3, empaquetada por Phoonnx |
| Otras voces de la colección VITS de Phoonnx | VITS | variable | no disponible | variable | ONNX | Misma librería de inferencia; calidad y voces distintas |
| Voces originales de Mimic 3 (Mycroft AI) | VITS | varias | no disponible | CC-BY-SA-4.0 (según upstream) | formatos propios de Mimic 3 | Origen del modelo; requieren el motor Mimic 3 |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Calidad de audio limitada: la variante `low` está diseñada para bajo coste, no para máxima fidelidad; no es adecuada para producción de audio de alta calidad.
- Una sola voz y un solo idioma (`en-US`): no soporta otros idiomas ni cambio de hablante.
- Dependencia del front-end gruut: la calidad de la síntesis depende de la fonemización correcta del texto de entrada; textos con abreviaturas, números o símbolos pueden requerir normalización previa por `scriptconv`.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede ser restrictivo para productos propietarios.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero un TTS puede producir pronunciaciones incorrectas o artefactos de audio ante entradas fuera de distribución.
- Sesgos: no documentados; al entrenarse presumiblemente sobre VCTK, puede reflejar las características demográficas y acústicas de dicho corpus.
- Información pública muy escasa: no se detallan parámetros, datos de entrenamiento ni benchmarks, lo que dificulta una evaluación rigurosa.
- Fecha de creación y actualización del repositorio (2026) posterior a la fecha de consulta habitual; verificar la vigencia del modelo antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-vctk-low-gruut
- Repositorio upstream (Mimic 3, voz `vctk_low`): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/vctk_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
