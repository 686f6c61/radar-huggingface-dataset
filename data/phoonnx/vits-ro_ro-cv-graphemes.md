# Phoonnx/vits-ro_ro-cv-graphemes

## Resumen

`Phoonnx/vits-ro_ro-cv-graphemes` es un modelo de síntesis de voz (text-to-speech) en rumano, basado en la arquitectura VITS de Coqui, empaquetado en formato ONNX por Phoonnx para su uso con la librería homónima de inferencia TTS. El modelo original procede del release v0.8.0 de Coqui TTS (`tts_models--ro--cv--vits`) y fue entrenado con el corpus Common Voice en rumano, según la propia model card. Phoonnx se limita a repaquetar los pesos en ONNX y a definir el front-end de texto, de modo que el modelo pueda ejecutarse en Python y en el ecosistema OVOS sin depender del stack original de Coqui.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de gran escala, sino de una conversión de un checkpoint VITS ya existente para facilitar su despliegue en producción. VITS es un modelo generativo end-to-end que combina un encoder de texto, un predictor de duraciones, un decoder acústico y un vocoder en una sola red, lo que permite síntesis de voz de alta calidad con una sola pasada. El repositorio ocupa 0,1 GB, lo que refleja el tamaño compacto típico de los checkpoints VITS.

El modelo está pensado para desarrolladores que necesitan TTS en rumano dentro de asistentes de voz o pipelines de audio, y que prefieren un artefacto ONNX ligero y con licencia permisiva (BSD-3-Clause) frente a soluciones propietarias. No hay información publicada sobre número de parámetros, contexto ni benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rumano (`ro-RO`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), publicada por Kim et al. (2021) e implementada en Coqui TTS. VITS combina en una única red un encoder de texto condicionado por alineamientos monotónicos, un predictor de duraciones, un decoder acústico basado en flujos variacionales y un vocoder generativo adversarial (HiFi-GAN). Esto permite generar audio directamente desde texto sin un vocoder externo, con calidad cercana a la de sistemas en dos etapas pero con menor latencia.

El checkpoint original fue entrenado por Coqui con el corpus Common Voice en rumano, según la model card. No se dispone de información sobre el número exacto de horas de audio, la composición del dataset, ni si se aplicaron técnicas de fine-tuning o RLHF (VITS no usa RLHF). El front-end de texto es de tipo grapheme-based: `GraphemePhonemizer` de `scriptconv` convierte los caracteres del texto directamente en la secuencia de entrada, sin fonemización lingüística. No hay innovaciones técnicas adicionales documentadas más allá del empaquetado ONNX.

## Capacidades

- Síntesis de voz en rumano (`ro-RO`) a partir de texto plano.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de Phoonnx.
- Entrada basada en grafemas (caracteres), sin necesidad de un diccionario fonético externo.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python mediante `TTSModelManager` y la colección de voces `coqui/ro-cv-vits`.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al rumano; no se documentan otros idiomas.

## Casos de uso

- **Asistentes de voz en rumano**: el modelo puede sintetizar respuestas habladas en un asistente doméstico basado en OVOS, usando el plugin `ovos-tts-plugin-phoonnx` y la voz `coqui/ro-cv-vits` configurada en `mycroft.conf`. Es adecuado por su licencia permisiva y su formato ONNX ligero.
- **Lectura de textos largos (accesibilidad)**: conversión de artículos, documentos o notificaciones a audio para usuarios con discapacidad visual, ejecutando el modelo en local sin dependencia de servicios en la nube.
- **Generación de audiolibros y pódcast**: síntesis por lotes de capítulos en rumano, con la ventaja de que el modelo cabe en 0,1 GB y puede ejecutarse en CPU sin GPU dedicada (aunque no se dispone de datos de latencia).
- **Sistemas de megafonía y avisos automatizados**: generación de anuncios pregrabados en rumano para transporte público, aeropuertos o comercios, donde se requiere una voz consistente y una licencia BSD-3-Clause compatible con uso comercial.
- **Prototipado de interfaces conversacionales**: integración en un pipeline de Python con `TTSModelManager` para probar flujos de diálogo en rumano antes de invertir en un TTS comercial.
- **Investigación en TTS de bajos recursos**: uso del checkpoint como línea base para experimentos de fine-tuning o comparación con otros sistemas VITS en rumano, dado que el modelo original es de código abierto y está documentado en la lista de modelos de Coqui.
- **Integración en dispositivos embebidos**: el tamaño reducido del ONNX y la ausencia de dependencias pesadas permiten desplegarlo en hardware con recursos limitados, siempre que se valide el rendimiento real (no disponible en la documentación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio pesa 0,1 GB, por lo que la huella de memoria en inferencia es previsiblemente baja (del orden de cientos de MB), pero no se documenta una cifra oficial.
- **GPU recomendadas**: no disponible. VITS es un modelo compacto y suele ejecutarse en CPU; no se especifican GPU concretas (A100, H100, RTX 4090, etc.).
- **Compatibilidad con GPU de consumo**: probable en GPUs de consumo por el tamaño del checkpoint, pero no confirmado en la documentación.
- **Opciones de despliegue**: Phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ro_ro-cv-graphemes | VITS (Coqui) | rumano | no disponible | no disponible | BSD-3-Clause | ONNX |
| Coqui `tts_models--ro--cv--vits` (upstream) | VITS (Coqui) | rumano | no disponible | no disponible | BSD-3-Clause | checkpoint Coqui |
| Otros VITS de la colección Phoonnx | VITS (Coqui) | varios | no disponible | no disponible | BSD-3-Clause (según modelo) | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La diferencia principal entre el modelo de esta ficha y el upstream de Coqui es el formato (ONNX frente a checkpoint nativo de Coqui) y el front-end de texto (grafemas vía `scriptconv`).

## Limitaciones y advertencias

- **Idioma único**: solo soporta rumano (`ro-RO`); no se documenta cobertura multilingüe.
- **Front-end basado en grafemas**: al no usar fonemización lingüística, la pronunciación de palabras extranjeras, siglas o nombres propios puede ser incorrecta.
- **Sesgos del corpus**: entrenado con Common Voice, por lo que puede heredar sesgos de acento, género y registro de los hablantes del corpus; no se documenta análisis de sesgo.
- **Riesgo de alucinación acústica**: como todo modelo generativo de voz, puede producir artefactos, ruidos o prosodia anómala en textos fuera de distribución o muy largos.
- **Sin datos de benchmarks**: no hay métricas objetivas (MOS, WER, latencia) publicadas, lo que dificulta evaluar su calidad frente a alternativas.
- **Licencia BSD-3-Clause**: permisiva y compatible con uso comercial, pero requiere conservar el aviso de copyright y la cláusula de no endorsement; conviene revisar los términos del corpus Common Voice subyacente.
- **Madurez del ecosistema**: Phoonnx es una librería en estado `--pre` (pre-release); la API puede cambiar y el soporte comunitario es limitado (17 descargas, 0 likes en el momento de la consulta).
- **Sin cuantizaciones documentadas**: no se especifican variantes INT8/FP16, lo que limita las opciones de optimización en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-ro_ro-cv-graphemes)
- [Repositorio upstream de Coqui TTS (release v0.8.0)](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--ro--cv--vits.zip)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Phoonnx (librería ONNX TTS)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (normalización y fonemizadores)](https://github.com/TigreGotico/scriptconv)
