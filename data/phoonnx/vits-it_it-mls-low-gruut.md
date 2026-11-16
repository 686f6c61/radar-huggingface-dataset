# Phoonnx/vits-it_it-mls-low-gruut

## Resumen

`vits-it_it-mls-low-gruut` es un modelo de síntesis de voz (text-to-speech) en italiano basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su librería de TTS homónima. El modelo toma como entrada fonemas IPA generados mediante el fonemizador gruut y produce audio WAV directamente, sin necesidad de vocoder externo, ya que VITS es un modelo end-to-end que combina codificador de texto, alineador y decodificador de audio en un único paso de inferencia.

La variante `mls_low` hace referencia a un entrenamiento sobre el corpus MLS (Multilingual LibriSpeech) en su configuración de recursos reducidos ("low"), lo que se traduce en un modelo compacto (el repositorio completo ocupa aproximadamente 0,1 GB) orientado a despliegues ligeros, asistentes de voz embebidos y entornos con recursos limitados. El modelo está pensado para integrarse en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, así como en aplicaciones Python que usen la librería phoonnx.

Su relevancia radica en ser una pieza de infraestructura práctica: un modelo TTS italiano listo para producción en formato ONNX, con licencia CC-BY-SA-4.0, que permite añadir síntesis de voz en italiano a asistentes y aplicaciones sin depender de servicios en la nube. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con información técnica pública muy limitada más allá de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variacional con alineamiento monotónico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa ~0,1 GB) |
| Idiomas soportados | italiano (`it-IT`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura que combina un codificador de texto basado en transformer, un alineador monotónico (MAS, Monotonic Alignment Search) que aprende la correspondencia entre fonemas y frames de audio, y un decodificador generativo condicionado por variables latentes, entrenado de forma adversarial con un discriminador multiperiodo. El resultado es un modelo que sintetiza audio de forma directa desde fonemas, sin pipeline separado de duración y vocoder, lo que reduce la latencia y simplifica el despliegue.

En este caso concreto, el modelo proviene del repositorio `mimic3-voices` de Mycroft AI, en la ruta `voices/it_IT/mls_low`, lo que indica un entrenamiento sobre el corpus MLS italiano en su variante de recursos reducidos. No se dispone de información pública sobre el número exacto de horas de audio, tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o fine-tuning adicional. El front-end de texto no forma parte del modelo: phoonnx delega la normalización y la fonemización en la librería `scriptconv`, que usa `GruutPhonemizer` del módulo `scriptconv.phonemizers.mul` para producir fonemas IPA que alimentan al modelo.

## Capacidades

- Síntesis de voz en italiano a partir de texto escrito, con salida en formato WAV.
- Conversión texto a fonemas IPA mediante el fonemizador gruut, integrado en el pipeline de phoonnx.
- Generación de audio end-to-end sin vocoder separado, gracias a la arquitectura VITS.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Uso programático en Python mediante `TTSModelManager` y el método `synthesize_wav`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente TTS).
- No soporta visión, audio de entrada ni otras modalidades.
- No dispone de modo "thinking" ni capacidades de razonamiento.
- Multilingüismo limitado al italiano; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz para el hogar en italiano: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para que un asistente doméstico responda en italiano con síntesis local, sin depender de APIs en la nube.
- Lectura de notificaciones y alertas en aplicaciones italianas: el modelo puede convertir mensajes cortos en audio para sistemas de megafonía, paneles de control o aplicaciones de accesibilidad.
- Audiolibros y lectura de artículos: síntesis por frases de contenido textual italiano, adecuada para prototipos de lectura asistida o generación de contenido audio bajo demanda.
- Sistemas de atención telefónica automatizada (IVR) en italiano: generación de prompts de voz dinámicos para menús telefónicos y respuestas pregrabadas parametrizables.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces, documentos y contenido web en italiano dentro de aplicaciones de escritorio o móviles.
- Videojuegos y experiencias interactivas: generación de voces de personajes no jugadores (NPC) en italiano para prototipos y producciones indie con presupuesto limitado.
- Prototipado rápido de productos de voz: al ser un modelo ONNX ligero (~0,1 GB), permite iterar en local sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB), es probable que el modelo quepa en CPU y en GPUs de gama baja, aunque no se confirman cifras.
- GPU recomendadas: no disponible; al ser un modelo ONNX pequeño, no requiere GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna con soporte ONNX Runtime, aunque no se documenta oficialmente.
- Opciones de despliegue: phoonnx (Python y OVOS), con pesos en formato ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-it_it-mls-low-gruut` | VITS | Italiano | no aplica | CC-BY-SA-4.0 | ONNX | Hugging Face (0 descargas) |
| `Phoonnx/vits-it_it-*` (otras variantes del mismo autor) | VITS | Italiano | no aplica | CC-BY-SA-4.0 | ONNX | Hugging Face |
| Piper (rhasspy/piper-voices) | VITS | Multilingüe (incluye italiano) | no aplica | MIT (mayoría de voces) | ONNX | Hugging Face, GitHub |
| Coqui TTS (XTTS, VITS) | VITS / autoregresivo | Multilingüe | no aplica | MPL-2.0 / CPML | PyTorch, ONNX | GitHub, Hugging Face |

La comparación con Piper es la más directa: ambos son modelos VITS en ONNX orientados a TTS local, aunque Piper cuenta con un ecosistema mucho más amplio y activo. Coqui TTS ofrece modelos más grandes y expresivos (XTTS) pero con mayores requisitos de recursos. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que implica ausencia de validación comunitaria y soporte limitado.
- Información técnica escasa: no se documentan parámetros, horas de entrenamiento, composición del dataset ni métricas de calidad (MOS, WER).
- Sesgos: al entrenarse sobre MLS (corpus de audiolibros), la voz puede presentar sesgos de estilo (lectura formal) y de dominio (vocabulario literario), con posible degradación en registros coloquiales o jerga.
- Riesgo de alucinación en TTS: puede producir pronunciaciones incorrectas en palabras fuera del vocabulario, extranjerismos, siglas o nombres propios no cubiertos por el fonemizador gruut.
- Limitación de idioma: solo italiano; no admite entrada multilingüe ni cambio de voz.
- Restricciones de licencia: CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas; para uso comercial es necesario revisar las obligaciones de la licencia y la cadena de atribución (Mycroft AI como autor original y Phoonnx como empaquetador).
- Dependencia del front-end: el rendimiento depende de la calidad de la fonemización de gruut y de la normalización de texto de scriptconv; errores en esa capa afectan directamente al audio.
- Caveat para producción: al no haber benchmarks ni validación externa, se recomienda evaluar la calidad de síntesis en el dominio concreto de uso antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-mls-low-gruut
- Repositorio upstream (Mycroft AI, mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/it_IT/mls_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección de modelos VITS empaquetados para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
