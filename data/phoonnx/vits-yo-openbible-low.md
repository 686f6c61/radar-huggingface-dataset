# Phoonnx/vits-yo-openbible-low

## Resumen

vits-yo-openbible-low es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite de voces Mimic 3 y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo está especializado exclusivamente en yoruba (`yo`), una lengua hablada principalmente en Nigeria y Benín, y toma como entrada fonemas en alfabeto IPA generados mediante epitran a partir del texto original.

La relevancia de este modelo radica en su carácter de recurso lingüístico para una lengua de bajos recursos: se trata de una voz de calidad "low" (probablemente entrenada con un presupuesto computacional reducido o con datos limitados), derivada del corpus Open Bible, y distribuida en formato ONNX para su ejecución local eficiente sin dependencia de frameworks pesados de deep learning. Su integración con phoonnx y con el ecosistema OVOS (Open Voice OS) permite incorporarla como plugin de TTS en asistentes de voz de código abierto.

El repositorio es de pequeño tamaño (aproximadamente 0,1 GB), lo que indica un modelo compacto orientado a inferencia en CPU o dispositivos de recursos limitados. La licencia CC-BY-SA-4.0 permite uso comercial con atribución y obligación de compartir bajo la misma licencia las obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas epitran en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de ejecucion | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por el texto, un decoder basado en normalizing flows y un discriminador adversarial entrenado con múltiples resoluciones (MPD y MSD), junto con un decoder acoplado a un vocoder HiFi-GAN para generar la forma de onda directamente. Este diseño permite generar audio de forma paralela y no autorregresiva, con latencia baja en inferencia.

El modelo concreto `openbible_low` procede del repositorio mimic3-voices de Mycroft AI, donde las voces se entrenan a partir de corpus de dominio público como Open Bible. La etiqueta "low" indica una variante de menor calidad o menor coste computacional dentro de la familia de voces. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino posterior; estos datos no están disponibles en la información proporcionada. El modelo se distribuye en ONNX, exportado para su uso con phoonnx, sin que se documenten innovaciones técnicas adicionales más allá del pipeline estándar VITS + epitran.

## Capacidades

- Síntesis de voz a partir de texto en yoruba, con salida en formato WAV mediante la API de phoonnx.
- Conversión de texto a fonemas IPA mediante el fonemizador `EpitranPhonemizer` de scriptconv, instalado con el extra `scriptconv[epitran]`.
- Ejecución local en formato ONNX, sin necesidad de GPU ni de frameworks pesados.
- Integración nativa con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Gestión de voces múltiples a través de `TTSModelManager` de phoonnx, con fusión de voces por defecto.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": se trata exclusivamente de un modelo TTS.
- Capacidad multilingüe limitada al yoruba; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz en yoruba para OVOS: el modelo se instala como plugin de TTS (`ovos-tts-plugin-phoonnx`) y se selecciona en `mycroft.conf`, permitiendo que un asistente doméstico de código abierto responda en yoruba con voces sintetizadas localmente.
- Accesibilidad para personas con discapacidad visual en comunidades yoruba-hablantes: la síntesis local en ONNX permite leer textos en voz alta sin conexión a internet ni servicios en la nube, reduciendo costes y preservando privacidad.
- Narración de contenido educativo y religioso: al derivarse del corpus Open Bible, la voz está entrenada con material textual de ese dominio, lo que la hace adecuada para locución de pasajes bíblicos, catequesis o material devocional en yoruba.
- Generación de audiolibros y podcasts en yoruba: el pipeline `synthesize_wav` de phoonnx permite procesar por lotes frases y volcar la salida a ficheros WAV, facilitando la producción automatizada de contenido audio.
- Prototipado de interfaces conversacionales para investigación lingüística: investigadores que estudian prosodia o fonética del yoruba pueden usar la voz como referencia sintética reproducible, con entrada controlada en fonemas IPA vía epitran.
- Integración en aplicaciones móviles o embebidas de bajo consumo: al ser un modelo ONNX de ~0,1 GB, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, móviles) para anuncios hablados, señalización o interfaces de accesibilidad.
- Educación de idiomas: servir como apoyo auditivo para el aprendizaje del yoruba, reproduciendo frases de ejemplo con pronunciación fonémica controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de ~0,1 GB, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se documentan; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no hay datos oficiales de rendimiento.
- Compatibilidad con GPU de consumo: sí, por tamaño del modelo; cabe en cualquier GPU consumer moderna e incluso puede ejecutarse solo en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje, no a TTS VITS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-yo-openbible-low (Phoonnx) | VITS | yoruba | ONNX | CC-BY-SA-4.0 | Hugging Face, phoonnx |
| Otras voces Mimic 3 de Mycroft AI | VITS | múltiples lenguas | formato Mimic 3 | según voz (mayoritariamente permisiva) | github.com/MycroftAI/mimic3-voices |
| Otras voces VITS empaquetadas por Phoonnx | VITS | múltiples lenguas | ONNX | según voz | colección VITS de Phoonnx en Hugging Face |
| Modelos TTS multilingües comerciales (p. ej. Coqui XTTS) | VITS/otros | multilingüe | varios | según modelo | no disponible en esta ficha |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas concretas; la comparación se limita a arquitectura, idioma, formato y licencia.

## Limitaciones y advertencias

- Calidad "low": la variante está etiquetada como `openbible_low`, lo que sugiere menor naturalidad o expresividad frente a voces de mayor calidad de la misma familia.
- Cobertura lingüística restringida exclusivamente al yoruba; no es un modelo multilingüe.
- Dependencia del fonemizador epitran: la entrada debe convertirse a fonemas IPA mediante scriptconv y el extra `scriptconv[epitran]`; errores de fonemización afectarán directamente la pronunciación.
- Dominio de entrenamiento limitado (Open Bible): puede presentar menor robustez con vocabulario ajeno al corpus religioso, nombres propios o terminología técnica.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erráticas en textos fuera de distribución.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se compartan bajo la misma licencia (copyleft), lo que puede condicionar la distribución de productos derivados.
- Sin datos publicados sobre sesgos demográficos, variedad dialectal del yoruba cubierta ni evaluación subjetiva de naturalidad (MOS).
- No apta para tareas de comprensión, razonamiento o generación de texto; es exclusivamente un modelo de síntesis de voz.
- Repositorio con muy pocas descargas (31) y ningún "like": poca validación comunitaria, lo que implica menor soporte y menor evidencia empírica de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-yo-openbible-low
- Upstream (Mimic 3 voices, voz yo/openbible_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/yo/openbible_low
- Repositorio mimic3-voices: https://github.com/MycroftAI/mimic3-voices
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx en Hugging Face: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Artículo original de VITS: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
