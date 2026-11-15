# Phoonnx/outetts-multi-outeai-0.6b

## Resumen

outetts-multi-outeai-0.6b es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx, que empaqueta el modelo upstream OuteAI/OuteTTS-1.0-0.6B de OuteAI en formato ONNX para su uso con la librería phoonnx, una biblioteca de TTS en Python integrable en el ecosistema OVOS. El modelo original pertenece a la familia OuteTTS, diseñada para generar audio a partir de texto en 14 idiomas entrenados.

La relevancia de este paquete reside en su formato de despliegue: al estar convertido a ONNX, puede ejecutarse mediante la librería phoonnx sin depender del stack original de PyTorch, lo que facilita su integración en asistentes de voz, sistemas empotrados y pipelines de audio. El repositorio ocupa 2,6 GB e incluye pesos ONNX, tokenizer y voces predefinidas por idioma.

La model card es escasa en detalles técnicos: no se especifican parámetros activos, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. La información disponible se limita a la arquitectura de referencia (OuteTTS), los idiomas soportados, la licencia Apache-2.0 y el flujo de uso mediante phoonnx y scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OuteTTS (modelo de síntesis de voz basado en transformer, según la familia upstream) |
| Parametros totales | 0,6B (según el nombre del modelo y el upstream OuteTTS-1.0-0.6B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo incluye `model.onnx` y `model.onnx_data`) |
| Idiomas soportados | de-DE, en-US, es-ES, fr-FR, hu-HU, it-IT, ja-JP, ka-GE, ko-KR, lv-LV, nl-NL, pl-PL, ru-RU, zh-CN (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo empaquetado deriva de OuteAI/OuteTTS-1.0-0.6B, un modelo de la familia OuteTTS orientado a text-to-speech. La model card de este paquete no describe la arquitectura interna más allá de la etiqueta "OuteTTS" y no aporta datos sobre composición del dataset, número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

El paquete en sí es una conversión a ONNX (referenciando OuteAI/OuteTTS-1.0-0.6B-ONNX) preparada para la librería phoonnx. El front-end de texto delega en scriptconv, que normaliza la entrada y la convierte mediante `UnicodeCodepointPhonemizer`, es decir, el modelo recibe los puntos de código Unicode del texto como entrada. La integración con OVOS se realiza a través del plugin `ovos-tts-plugin-phoonnx`, configurable mediante `mycroft.conf`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en 14 idiomas: alemán, inglés, español, francés, húngaro, italiano, japonés, georgiano, coreano, letón, neerlandés, polaco, ruso y chino.
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Voces predefinidas por idioma (`outetts/0.6B/de`, `outetts/0.6B/en`, `outetts/0.6B/es`, etc.).
- Normalización y conversión de texto de entrada mediante scriptconv (`UnicodeCodepointPhonemizer`).
- Integración con asistentes de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de un modelo TTS).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponible.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra mediante `ovos-tts-plugin-phoonnx` y se selecciona la voz por idioma en `mycroft.conf`, lo que permite dotar de salida de voz a un asistente doméstico sin infraestructura adicional de PyTorch.
- Síntesis de voz multilingüe en aplicaciones Python: usando `TTSModelManager` y la voz correspondiente (`outetts/0.6B/es`, `outetts/0.6B/en`, etc.) se puede generar audio WAV para 14 locales distintos desde un único paquete ONNX.
- Lectura de contenido en aplicaciones de accesibilidad: el modelo puede convertir texto de artículos, notificaciones o interfaces en audio para usuarios con discapacidad visual, eligiendo la voz del idioma del contenido.
- Generación de locuciones para vídeo y pódcast: al cubrir 14 idiomas, permite producir narraciones localizadas sin depender de servicios TTS en la nube, manteniendo los datos en local.
- Sistemas empotrados y edge computing: al distribuirse en ONNX y ejecutarse mediante phoonnx, puede desplegarse en entornos con recursos limitados donde no es viable cargar el stack completo de PyTorch.
- Prototipado rápido de interfaces conversacionales: la API de phoonnx (`load`, `merge_default_voices`, `synthesize_wav`) permite integrar TTS en un prototipo en pocas líneas de código.
- Localización de contenidos en 14 idiomas: un mismo pipeline puede generar audio en georgiano, letón o coreano, entre otros, usando las voces predefinidas del paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 2,6 GB, lo que da una cota superior aproximada del espacio en disco necesario para los pesos ONNX.
- GPU recomendadas: no disponible. Al ejecutarse vía ONNX Runtime a través de phoonnx, el modelo puede ejecutarse en CPU o en GPU compatible con ONNX Runtime, pero la model card no especifica requisitos.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; el tamaño de 0,6B parámetros y un repo de 2,6 GB sugieren que es viable en GPUs de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: phoonnx (librería Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este paquete.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/outetts-multi-outeai-0.6b | 0,6B | no disponible | 14 | Apache-2.0 | ONNX | Paquete ONNX para phoonnx |
| OuteAI/OuteTTS-1.0-0.6B | 0,6B | no disponible | 14 | Apache-2.0 | safetensors (upstream) | Modelo original de OuteAI |
| OuteAI/OuteTTS-1.0-0.6B-ONNX | 0,6B | no disponible | 14 | Apache-2.0 | ONNX | Conversión ONNX de referencia |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación de rendimiento con alternativas de otros autores. La comparativa se limita a los artefactos de la propia familia OuteTTS.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al ser un TTS entrenado con datos no especificados, pueden existir sesgos de pronunciación, acento o prosodia según el idioma y el hablante.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero un modelo TTS puede producir pronunciaciones incorrectas o artefactos de audio ante texto fuera de distribución (siglas, nombres propios, código, símbolos).
- La longitud de contexto no está documentada, por lo que no se conoce el límite práctico de texto por síntesis.
- El modelo cubre 14 idiomas, pero no se documenta la calidad relativa por idioma ni el volumen de datos de entrenamiento de cada uno.
- Licencia Apache-2.0: permite uso comercial, pero la model card advierte que los dos tamaños de la familia OuteTTS (0.6B y otro tamaño) llevan licencias diferentes; el 0.6B es Apache-2.0 y cubre 14 idiomas entrenados.
- El paquete depende de la librería phoonnx y de scriptconv; la instalación se realiza con `pip install --pre phoonnx`, lo que implica una dependencia de versiones preliminares.
- No hay información sobre latencia, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.
- El número de descargas (30) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/outetts-multi-outeai-0.6b
- Modelo upstream: https://huggingface.co/OuteAI/OuteTTS-1.0-0.6B
- Conversión ONNX upstream: https://huggingface.co/OuteAI/OuteTTS-1.0-0.6B-ONNX
- Colección OuteTTS para phoonnx: https://huggingface.co/collections/Phoonnx/outetts-6af8ecbd9994d1dfbb97f9fa
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
