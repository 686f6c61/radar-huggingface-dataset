# Phoonnx/glowtts-nl-flemishguy-gruut

## Resumen

`glowtts-nl-flemishguy-gruut` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería `phoonnx`. El modelo genera espectrogramas a partir de fonemas IPA del neerlandés, que posteriormente son convertidos a audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`. Está pensado para voces de calidad media en asistentes de voz y sistemas embebidos, no para síntesis de alta fidelidad.

El modelo cubre exclusivamente el idioma neerlandés (`nl`) y emplea el fonemizador gruut para la conversión de texto a fonemas, lo que implica que la entrada al modelo no es texto crudo sino una secuencia de fonemas IPA. Esta separación entre front-end lingüístico y modelo acústico es característica del ecosistema Larynx y permite reutilizar el mismo backend acústico con distintos idiomas siempre que se disponga del fonemizador adecuado.

Su relevancia actual es limitada pero concreta: se trata de un artefacto de inferencia ligero (0,1 GB en el repositorio) orientado a despliegues ONNX en entornos con recursos restringidos, integrable en OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo generativo de gran escala ni compite con los TTS neuronales modernos basados en difusión o modelos de lenguaje; su valor reside en la portabilidad y en el bajo coste computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, no autorregresiva) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en TTS; limitado por la longitud de la secuencia de fonemas) |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos ONNX) |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |
| Vocoder | HiFi-GAN `hifigan-multi-vctk-small` (ONNX, descargado automáticamente por phoonnx) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis acústica no autorregresivo basado en normalizing flows. A diferencia de los TTS autorregresivos tipo Tacotron 2, Glow-TTS aprende una correspondencia monotónica entre la secuencia de fonemas y el espectrograma mel mediante un mecanismo de alineamiento por búsqueda (monotonic alignment search), lo que permite paralelizar la generación y reduce la latencia de inferencia. El modelo produce espectrogramas mel que después se convierten en forma de onda mediante el vocoder HiFi-GAN.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino preferencial. El modelo original procede del release v1.0 de Larynx (`nl_flemishguy-glow_tts.tar.gz`), un proyecto de Rhasspy orientado a voces de código abierto para asistentes de voz. La innovación técnica destacable en este empaquetado es la conversión a ONNX y la integración con el ecosistema phoonnx/scriptconv, que separa la normalización de texto y la fonemización (gruut) de la inferencia acústica.

## Capacidades

- Síntesis de voz en neerlandés a partir de texto, mediante fonemización previa con gruut.
- Generación de espectrogramas mel que se convierten a audio con el vocoder HiFi-GAN.
- Inferencia ONNX no autorregresiva, apta para CPU y entornos con recursos limitados.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto delegadas a `scriptconv` (fonemizador `GruutPhonemizer`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe: únicamente neerlandés.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se integra como módulo TTS seleccionable en `mycroft.conf`, permitiendo respuestas habladas en neerlandés con latencia baja gracias a la inferencia ONNX no autorregresiva.
- Síntesis en dispositivos embebidos y Raspberry Pi: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX permiten ejecutar la inferencia en CPU sin GPU dedicada.
- Generación de avisos y notificaciones pregrabadas: útil para producir locuciones dinámicas en aplicaciones de domótica o sistemas de megafonía en neerlandés.
- Accesibilidad: lectura de texto en voz alta para usuarios con discapacidad visual en aplicaciones neerlandófonas, con un coste computacional muy inferior al de TTS neuronales grandes.
- Prototipado de pipelines TTS: sirve como referencia para probar la cadena scriptconv (normalización y fonemización gruut) más vocoder HiFi-GAN antes de migrar a modelos de mayor calidad.
- Investigación en TTS ligero: base para experimentos de comparación entre arquitecturas de flujo (Glow-TTS) y modelos autorregresivos o de difusión en entornos con restricciones de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura Glow-TTS, la inferencia cabe holgadamente en memoria de CPU y en GPUs con pocos GB.
- GPU recomendadas: no se especifican; el modelo está empaquetado en ONNX y está pensado para ejecución en CPU.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, aunque no se han publicado cifras oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño | Contexto |
|---|---|---|---|---|---|---|
| glowtts-nl-flemishguy-gruut | Glow-TTS + HiFi-GAN | nl | ONNX | other (sin registrar) | 0,1 GB | no aplica |
| Otras voces Larynx (p. ej. `en-us-*`, `es-*`) | Glow-TTS + HiFi-GAN | varios | ONNX / tarball | según release upstream | similar | no aplica |
| Piper (sucesor de Larynx) | VITS | varios | ONNX | MIT (mayoritariamente) | similar | no aplica |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a arquitectura, idioma, formato y licencia.

## Limitaciones y advertencias

- Licencia sin registrar: la model card indica explícitamente que no hay licencia registrada y recomienda consultar el release upstream antes de cualquier uso, incluido el comercial.
- Idioma único: solo neerlandés; no admite otros idiomas sin un fonemizador distinto y un modelo acústico entrenado para ellos.
- Dependencia de fonemización: la calidad de la síntesis depende del fonemizador gruut y de la normalización de `scriptconv`; texto mal normalizado produce pronunciaciones incorrectas.
- Calidad acústica limitada: Glow-TTS con HiFi-GAN small no alcanza la naturalidad de TTS modernos basados en difusión o modelos de lenguaje; adecuado para asistentes, no para doblaje o producción de audio de alta fidelidad.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir artefactos acústicos o pronunciaciones erróneas en secuencias de fonemas fuera de distribución.
- Sesgos: no se documentan sesgos específicos; al derivar de un corpus de una única voz (`flemishguy`), la prosodia y el timbre están limitados a ese hablante.
- Sin soporte de tool calling ni agentes: es un modelo puramente acústico, no un modelo de lenguaje.
- Advertencia de producción: verificar la licencia upstream y validar la calidad de audio en el dominio de aplicación antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-nl-flemishguy-gruut
- Release upstream (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/nl_flemishguy-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
