# Phoonnx/vits-fr_fr-siwis-low-mycroft_ai-gruut

## Resumen

El modelo `vits-fr_fr-siwis-low-mycroft_ai-gruut` es un sistema de síntesis de voz (text-to-speech) en francés de Francia, empaquetado por Phoonnx a partir de una voz original de Mycroft AI para su motor Mimic 3. Se trata de una voz etiquetada como "low", lo que indica una variante de baja calidad o tamaño reducido dentro del catálogo de voces de Mimic 3, orientada a entornos con recursos limitados. El modelo se distribuye en formato ONNX para su uso con la librería `phoonnx`, lo que facilita su integración en pipelines de Python y en el asistente de voz OVOS.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional y un decodificador de audio con discriminadores adversariales, entrenado para producir波形 de voz directamente a partir de fonemas. El front-end de texto utiliza fonemas gruut en alfabeto IPA, gestionados por la librería `scriptconv` mediante el extra `scriptconv[gruut]`.

Es relevante por su carácter práctico: empaqueta una voz existente de código abierto (Mimic 3) en un formato ONNX listo para ejecución, con licencia CC-BY-SA-4.0, y con integración directa en el ecosistema OVOS. Su tamaño de repositorio (0,1 GB) sugiere un modelo ligero, adecuado para despliegues en dispositivos con recursos modestos o para síntesis en tiempo real en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con inferencia variacional y entrenamiento adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | francés de Francia (`fr-FR`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (librería `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que integra en un único modelo un codificador de texto, un prior variacional condicionado por alineamiento monotónico (MAS, Monotonic Alignment Search), un decodificador generativo de audio y un conjunto de discriminadores adversariales (MSD, MPD) entrenados de forma conjunta. Este diseño permite generar waveform directamente a partir de la secuencia de fonemas sin necesidad de un vocoder externo, y produce muestras de audio de forma no autorregresiva, lo que favorece la latencia baja en inferencia.

En este caso concreto, el modelo es una voz de Mycroft AI para Mimic 3, identificada como `siwis_low` dentro del repositorio `mimic3-voices`. La etiqueta "low" indica una variante de calidad reducida, presumiblemente con menor número de parámetros o menor resolución de audio que las variantes "medium" o "high" del mismo catálogo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El front-end de texto emplea fonemización con gruut en alfabeto IPA, y la normalización y conversión de texto la realiza `scriptconv`.

## Capacidades

- Síntesis de voz en francés de Francia (`fr-FR`) a partir de texto escrito.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Fonemización de entrada con gruut (alfabeto IPA) a través de `scriptconv[gruut]`.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Ejecución sobre ONNX Runtime, lo que permite inferencia en CPU y en entornos sin GPU.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo ni tool calling (no aplicables a un modelo TTS).
- No se documentan capacidades de razonamiento, código, matemáticas ni visión (fuera del alcance de un modelo TTS).

## Casos de uso

- Asistente de voz doméstico con OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `mimic3/fr_FR/siwis_low` en `mycroft.conf`, permitiendo respuestas habladas en francés en dispositivos de recursos limitados gracias a su tamaño reducido (0,1 GB de repositorio) y ejecución ONNX en CPU.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav(text, wav_file)` se puede generar audio a un fichero WAV para integrarlo en scripts de accesibilidad, lectura de textos o generación de avisos.
- Lectura de notificaciones y alertas en sistemas embebidos: al ser una voz "low" y ligera, es adecuada para dispositivos tipo Raspberry Pi o similares que necesitan síntesis en tiempo real sin GPU dedicada.
- Generación de audiolibros o contenido pregrabado en francés: se puede procesar por lotes un corpus de texto y sintetizar cada fragmento en WAV para su posterior ensamblaje, aprovechando la naturaleza no autorregresiva de VITS para un throughput razonable.
- Pruebas de integración y desarrollo de pipelines TTS: sirve como voz de referencia en tests automatizados de `phoonnx` y `scriptconv`, al ser un modelo pequeño y de licencia abierta que se puede incluir en CI sin grandes costes de almacenamiento.
- Prototipado de interfaces conversacionales en francés: equipos que desarrollan asistentes de voz pueden usar esta voz para validar flujos de diálogo multi-turno antes de invertir en voces de mayor calidad o en modelos comerciales.
- Accesibilidad para personas con discapacidad visual: integrada en lectores de pantalla o aplicaciones de lectura, permite convertir texto en voz en francés con un consumo de recursos bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB de repositorio, es probable que quepa en menos de 1 GB de memoria, pero no se documenta una cifra oficial.
- GPU recomendadas: no se documentan; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no se especifican requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-fr_fr-siwis-low-mycroft_ai-gruut` | VITS | fr-FR | 0,1 GB (repo) | CC-BY-SA-4.0 | ONNX | Hugging Face |
| Otras voces Mimic 3 `fr_FR` (p. ej. variantes medium/high) | VITS | fr-FR | no disponible | CC-BY-SA-4.0 (upstream) | ONNX / Mimic 3 | GitHub MycroftAI/mimic3-voices |
| Voces VITS de la colección Phoonnx | VITS | varios | variable | según modelo | ONNX | Hugging Face (colección VITS) |

No se dispone de datos de rendimiento (MOS, latencia) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La etiqueta "low" indica una calidad de síntesis reducida en comparación con variantes superiores del mismo catálogo; puede presentar artefactos, prosodia menos natural y menor fidelidad tímbrica.
- Solo soporta francés de Francia (`fr-FR`); no se documenta soporte para otras variantes del francés ni para otros idiomas.
- No se documentan sesgos específicos, pero al ser una voz entrenada con un dataset concreto puede reflejar características del hablante o del corpus original (no disponible).
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado o fuera del dominio; el front-end `scriptconv` mitiga parcialmente este riesgo.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir al autor; es importante revisar las condiciones de "ShareAlike" si se modifica o redistribuye el modelo.
- No se documentan restricciones adicionales de uso comercial más allá de las de la licencia CC-BY-SA-4.0.
- Al ser un modelo empaquetado por un tercero (Phoonnx) a partir de una fuente upstream (Mycroft AI), la calidad y el mantenimiento dependen del repositorio original; conviene verificar la integridad del ONNX antes de usarlo en producción.
- No se dispone de información sobre el número de parámetros ni sobre el dataset de entrenamiento, lo que limita la evaluación técnica previa a su adopción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-siwis-low-mycroft_ai-gruut
- Upstream (Mycroft AI, voz `siwis_low`): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/fr_FR/siwis_low
- Repositorio `mimic3-voices`: https://github.com/MycroftAI/mimic3-voices
- Librería `phoonnx`: https://github.com/TigreGotico/phoonnx
- Librería `scriptconv`: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
