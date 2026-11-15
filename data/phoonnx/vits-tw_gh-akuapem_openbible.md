# Phoonnx/vits-tw_gh-akuapem_openbible

## Resumen

`vits-tw_gh-akuapem_openbible` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del corpus OpenBible en la variedad akuapem del idioma twi (código ISO `tw`, región Ghana). El modelo se distribuye empaquetado en formato ONNX por Phoonnx para su uso con la librería `phoonnx`, una implementación de inferencia TTS orientada a Python y al ecosistema de asistentes de voz OVOS.

El modelo resuelve la síntesis de voz para una lengua de bajos recursos (twi akuapem), donde las alternativas comerciales son escasas y los modelos multilingües de gran escala no cubren habitualmente esta variedad con calidad nativa. Su relevancia radica en que pone a disposición de la comunidad un sistema TTS ligero (repo de 0,1 GB) con licencia CC-BY-SA 4.0, apto para integrarse en asistentes de voz, lectores de pantalla y aplicaciones de accesibilidad para hablantes de twi.

La información pública disponible es limitada: no se documentan parámetros totales, longitud de contexto ni detalles de entrenamiento más allá del corpus OpenBible y del pipeline de Coqui TTS v0.6.2. El modelo tiene 28 descargas y ningún "like" en Hugging Face en el momento de la consulta, lo que indica una adopción aún incipiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui TTS v0.6.2) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres, sin ventana documentada) |
| Tipos de cuantización | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | twi akuapem (`tw-GH`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

VITS es un modelo generativo end-to-end que combina un encoder de texto, un prior normalizador de flujo, un decoder basado en HifiGAN y un discriminador adversarial entrenado de forma conjunta, lo que permite generar audio de forma directa desde texto sin etapas separadas de alineamiento o vocoder. Esta implementación concreta proviene del release `v0.6.2_models` de Coqui TTS bajo el identificador `tts_models--tw_akuapem--openbible--vits`, y Phoonnx la ha reempaquetado en ONNX para su librería.

El corpus de entrenamiento es OpenBible en twi akuapem, según declara el autor upstream en la lista de modelos de Coqui. No se especifican en la información disponible el número de horas de audio, el número de tokens ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en TTS). El front-end de texto utiliza el `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte en la secuencia de entrada del modelo a nivel de grafemas, sin fonemización fonética explícita.

## Capacidades

- Síntesis de voz a partir de texto en twi akuapem (`tw-GH`).
- Entrada basada en caracteres (grafemas) gestionada por `GraphemePhonemizer` de `scriptconv`.
- Generación de audio WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable vía `mycroft.conf`.
- Ejecución en Python mediante `TTSModelManager` con carga de voces y fusión de voces por defecto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; no aplican a un modelo TTS.

## Casos de uso

- Asistentes de voz para hablantes de twi: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en twi akuapem en asistentes domésticos o dispositivos embebidos.
- Accesibilidad y lectores de pantalla: conversión de texto a voz para usuarios con discapacidad visual que necesiten contenido en twi, con un modelo ligero (repo de 0,1 GB) desplegable localmente.
- Locución de contenido educativo: narración automática de materiales escolares o bíblicos en twi, aprovechando que el modelo se entrenó sobre OpenBible y su dominio cubre registro religioso y formal.
- Aplicaciones móviles o de bajo consumo: al distribuirse en ONNX y con un tamaño reducido, puede ejecutarse en entornos con recursos limitados sin depender de servicios en la nube.
- Preservación lingüística: generación de audio de referencia en twi akuapem para archivos sonoros, diccionarios o materiales de documentación de la lengua.
- Prototipado de interfaces conversacionales: validación rápida de flujos de voz en twi antes de invertir en modelos comerciales o en grabaciones de estudio.
- Investigación en TTS de bajos recursos: base reproducible para experimentos de fine-tuning, evaluación de naturalidad o comparación de front-ends de grafemas frente a fonemas en lenguas de Ghana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,1 GB) y la arquitectura VITS, es esperable que quepa en GPU consumer con pocos GB, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible. Un modelo VITS de este tamaño suele ejecutarse también en CPU; no se confirma en la documentación.
- ¿Cabe en GPU consumer? No confirmado en la información proporcionada; el tamaño del artefacto sugiere que sí, pero no hay dato oficial.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-tw_gh-akuapem_openbible` | VITS (Coqui) | twi akuapem (`tw-GH`) | no disponible | CC-BY-SA 4.0 | Hugging Face, ONNX vía `phoonnx` |
| Modelos VITS de la colección Phoonnx | VITS (Coqui) | otras lenguas | no disponible | variable según modelo | Hugging Face, colección `Phoonnx/vits` |
| TTS multilingües de gran escala | variable | multilingüe | no disponible | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida a twi akuapem (`tw-GH`); no se documenta soporte de otras variedades del twi ni de otras lenguas.
- Entrenado sobre OpenBible: el dominio y el registro del corpus pueden sesgar la prosodia y el vocabulario hacia textos religiosos o formales, con posible degradación en registros coloquiales o técnicos.
- Riesgo de alucinación en TTS: el modelo puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario o en nombres propios, sin mecanismo documentado de mitigación.
- No se documentan sesgos demográficos, de género ni de prosodia; la ausencia de información no implica ausencia de sesgo.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero exige atribución y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para productos propietarios.
- Sin datos publicados de parámetros, contexto, cuantizaciones ni benchmarks, lo que dificulta la planificación de capacidad y la comparación objetiva.
- Adopción muy baja (28 descargas, 0 likes) y sin mantenimiento documentado más allá de la actualización del 15 de noviembre de 2026.
- Dependencia del ecosistema `phoonnx` y `scriptconv`; no se documentan exportaciones a otros runtimes TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-tw_gh-akuapem_openbible
- Upstream Coqui TTS (release v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--tw_akuapem--openbible--vits.zip
- Librería `phoonnx`: https://github.com/TigreGotico/phoonnx
- Librería `scriptconv`: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
