# Phoonnx/glowtts-en-us-ljspeech

## Resumen

Phoonnx/glowtts-en-us-ljspeech es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el proyecto Phoonnx. Se trata de una extracción de una carpeta concreta (`en-us-ljspeech`) del repositorio agregado `Phoonnx/phoonnx-glowtts`, y se distribuye para su uso con la librería `phoonnx`, un motor de inferencia TTS orientado a despliegue ligero sobre ONNX Runtime. La arquitectura subyacente es GlowTTS, un modelo no autorregresivo de tipo normalizing flow que genera mel-espectrogramas a partir de texto y que después requiere un vocoder para producir la forma de onda.

El modelo está orientado a una única voz en inglés estadounidense, entrenada presumiblemente sobre el corpus LJSpeech (según indica el identificador `en-us-ljspeech`), un dataset público de una locutora femenina con alrededor de 24 horas de audio. No se publican detalles sobre el proceso de entrenamiento, el número de parámetros ni las métricas de calidad en la model card. El tamaño del repositorio es de 0,1 GB, lo que es coherente con un modelo TTS de tamaño moderado en formato ONNX.

Su relevancia es práctica más que investigadora: permite incorporar síntesis de voz en pipelines de producción sin depender de frameworks pesados de PyTorch, ejecutando la inferencia con ONNX Runtime en CPU o GPU. No obstante, la ausencia de documentación técnica, de licencia clara y de métricas publicadas limita seriamente su uso en entornos comerciales sin una evaluación previa. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flow, TTS acústico no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; limitado por longitud de secuencia de texto de entrada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes) |
| Idiomas soportados | inglés estadounidense (`en-us`), según el identificador del modelo |
| Licencia | other (sin licencia concreta especificada en la carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz basado en normalizing flows que transforma una distribución latente en un mel-espectrograma condicionado por la secuencia de texto. A diferencia de los modelos autorregresivos como Tacotron 2, GlowTTS realiza la generación en paralelo, lo que reduce la latencia de inferencia y evita errores de exposición. La arquitectura incluye un encoder de texto, un bloque de flows invertibles y un decoder que produce el mel-espectrograma; la conversión final a audio requiere un vocoder independiente (típicamente HiFi-GAN u otro modelo neuronal), que no se incluye en este repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento o fine-tuning adicionales. El identificador `ljspeech` sugiere que el entrenamiento se realizó sobre el corpus LJSpeech, pero la model card no lo confirma explícitamente ni aporta detalles sobre preprocesado, duración de las secuencias o configuración de entrenamiento. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia arquitectura GlowTTS.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con una única voz (locutora de LJSpeech).
- Generación de mel-espectrogramas mediante normalizing flows, en paralelo y sin autoregresión.
- Inferencia sobre ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de PyTorch.
- Integración con la librería `phoonnx` mediante el identificador de voz `larynx/en-us-ljspeech-glow_tts`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de los LLM; es un modelo exclusivamente TTS.
- No se documentan capacidades multilingües, control de prosodia, clonación de voz ni emoción.
- No se documenta modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos o documentos en aplicaciones de accesibilidad: el modelo puede convertir texto en voz para usuarios con discapacidad visual, ejecutándose en local mediante ONNX Runtime sin necesidad de servicios en la nube.
- Asistentes de voz embebidos en dispositivos de baja potencia: al ser ONNX y de 0,1 GB, puede desplegarse en Raspberry Pi o dispositivos edge con CPU, siempre que se añada un vocoder compatible.
- Generación de audiolibros o pódcast automatizados: para contenido en inglés estadounidense con una sola voz, el modelo puede sintetizar segmentos de texto por lotes y ensamblarlos posteriormente.
- Pruebas de integración en pipelines de CI/CD: sirve como componente de referencia para validar flujos TTS en el framework `phoonnx` antes de sustituirlo por un modelo de mayor calidad.
- Prototipado de interfaces conversacionales: permite disponer rápidamente de una voz sintética en demos de asistentes o chatbots en inglés, sin depender de APIs externas.
- Investigación sobre normalizing flows aplicados a TTS: el modelo puede utilizarse como baseline reproducible en experimentos académicos sobre arquitecturas GlowTTS en formato ONNX.
- Evaluación comparativa de vocoders: al estar separado el modelo acústico del vocoder, puede emplearse para probar distintos vocoders sobre un mismo mel-espectrograma generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura GlowTTS, la huella en memoria es reducida, del orden de cientos de MB incluyendo el vocoder externo.
- GPU recomendadas: cualquier GPU moderna con soporte de ONNX Runtime (por ejemplo, RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo; el cuello de botella suele ser el vocoder.
- Cabe en GPU de consumo: sí, con amplio margen, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (nativo), librería `phoonnx`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a TTS.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tiempo real (RTF) ni de velocidad de síntesis.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en-us-ljspeech | GlowTTS (ONNX) | no disponible | en-US, una voz | other (sin especificar) | Hugging Face, 0 descargas |
| Coqui TTS (modelos VITS/LJSpeech) | VITS | ~80M típicamente | en-US, una voz | MPL-2.0 en el framework; licencia del modelo variable | Hugging Face, amplia adopción |
| Piper (voces en-US) | VITS (ONNX) | variable, ~60-80M | en-US, múltiples voces | MIT/GPL según voz | Hugging Face, alta adopción |

La comparación directa es difícil por la falta de parámetros y métricas publicadas para el modelo de Phoonnx. Frente a Piper y Coqui TTS, la principal desventaja es la ausencia de documentación y de licencia clara; la principal ventaja potencial es su integración específica con `phoonnx` y el formato ONNX listo para producción.

## Limitaciones y advertencias

- Licencia `other` sin texto de licencia asociado: no se puede determinar si el uso comercial está permitido; es un riesgo legal importante para producción.
- Sin métricas de calidad publicadas (MOS, WER, RTF): imposible evaluar la fidelidad de la síntesis sin pruebas propias.
- Una única voz en inglés estadounidense; sin soporte multilingüe ni control de hablante.
- Requiere un vocoder externo para generar audio final, que no se incluye en el repositorio; sin él, el modelo solo produce mel-espectrogramas.
- Posibles sesgos de la voz de LJSpeech (locutora femenina, dominio público, estilo leído) que se trasladan al modelo.
- Riesgo de artefactos y errores de pronunciación en palabras fuera del vocabulario o en dominios especializados (nombres propios, términos técnicos).
- Adopción nula (0 descargas), por lo que no hay evidencia comunitaria de robustez ni de mantenimiento.
- La fecha de creación (2026-11-14) y la falta de información sobre el autor dificultan verificar la procedencia del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-ljspeech
- Repositorio agregado: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Paper de GlowTTS: https://arxiv.org/abs/2005.11129
- Dataset LJSpeech: https://keithito.com/LJ-Speech-Dataset/
