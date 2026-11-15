# Phoonnx/vits-hf_community_SadeghK_persian-text-to-speech_epoch_5261-step_2455712

## Resumen

Este repositorio contiene un modelo de síntesis de voz (text-to-speech) en formato ONNX, identificado como `vits-hf_community_SadeghK_persian-text-to-speech_epoch_5261-step_2455712`, distribuido por el usuario Phoonnx dentro del proyecto phoonnx. Se trata de una exportación de un checkpoint concreto (época 5261, paso 2455712) del modelo `SadeghK/persian-text-to-speech`, un sistema TTS para persa basado en la arquitectura VITS. El modelo está empaquetado para su uso con la librería phoonnx, que es un runtime de inferencia ONNX orientado a voces Piper y compatibles.

La relevancia de esta ficha es limitada en términos de documentación: la model card es extremadamente escasa y se limita a indicar el origen del checkpoint y las condiciones de licencia heredadas del repositorio fuente. No se especifican parámetros, longitud de contexto, idiomas soportados (aunque el nombre sugiere persa), ni datos de entrenamiento. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un modelo VITS de tamaño pequeño-medio en formato ONNX.

El modelo se publica bajo licencia MIT según la metadata de Hugging Face, aunque la propia model card advierte que la licencia efectiva es la que registre el repositorio de origen (`SadeghK/persian-text-to-speech`) y que las licencias siguen a los originales por subcarpeta. Esta ambigüedad es un caveat importante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto largo) |
| Tipos de cuantización | no disponible (pesos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible en la metadata; el nombre del checkpoint sugiere persa |
| Licencia | MIT (según metadata de Hugging Face); la model card remite a la licencia del repositorio origen |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio directamente a partir de texto sin necesidad de un vocoder separado, lo que lo hace adecuado para despliegue ligero en inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El checkpoint corresponde a la época 5261 y al paso 2455712 del entrenamiento original, según el nombre del repositorio. El modelo se distribuye como exportación ONNX para el runtime phoonnx, que preserva las rutas de archivos del repositorio `Phoonnx/phoonnx-vits`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio.
- Generación de audio en formato compatible con el runtime phoonnx (ONNX).
- Orientación presumible al idioma persa, según el nombre del checkpoint de origen.
- No se documentan capacidades de clonación de voz, control de prosodia, multilingüismo, tool calling ni razonamiento multi-paso.
- No se documentan modos especiales (thinking, visión, audio de entrada).

## Casos de uso

- Lectura de texto persa en aplicaciones de accesibilidad: el modelo puede convertir artículos o documentos en audio para usuarios con discapacidad visual, aprovechando su naturaleza TTS extremo a extremo y su formato ONNX ligero.
- Generación de audiolibros en persa: integrado en un pipeline de segmentación de texto y síntesis por fragmentos, permite producir narraciones con un modelo de tamaño reducido (0,1 GB) desplegable en servidores modestos.
- Asistentes de voz para atención al cliente en persa: el modelo puede sintetizar respuestas generadas por un LLM en un sistema de diálogo, siempre que se valide la calidad del audio y la cobertura del vocabulario.
- Locución para contenido educativo: síntesis de lecciones o materiales formativos en persa para plataformas de e-learning, con generación por lotes de archivos de audio.
- Pruebas de integración en el ecosistema phoonnx: sirve como voice de referencia para validar el runtime ONNX y pipelines Piper-compatibles en entornos de desarrollo.
- Prototipado de interfaces de voz en persa: permite experimentar con TTS sin depender de servicios en la nube, al ser un modelo local de pequeño tamaño y licencia permisiva (sujeta a verificación).
- Generación de avisos automáticos en persa: mensajes de sistema, notificaciones o anuncios pregrabados en aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se espera que quepa en GPUs consumer con 2-4 GB de VRAM o incluso en CPU.
- GPU recomendadas: no disponible; cualquier GPU con soporte ONNX Runtime (NVIDIA, AMD, Intel) debería ser suficiente.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido, aunque no se confirma en la documentación.
- Opciones de despliegue: runtime phoonnx (ONNX), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (vits persa, Phoonnx) | VITS | ~0,1 GB (repo) | presumiblemente persa | MIT (según metadata) | ONNX |
| Piper voices (rhasspy/piper) | VITS | variable, típicamente <100 MB | múltiples | MIT / otras según voz | ONNX |
| Coqui TTS (VITS) | VITS | variable | múltiples | MPL 2.0 / otras | PyTorch, ONNX |
| MMS-TTS (Meta) | VITS | variable | 1100+ idiomas | CC-BY-NC 4.0 | PyTorch |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta parámetros, datos de entrenamiento, idiomas oficiales ni métricas de calidad.
- Ambigüedad de licencia: la metadata indica MIT, pero la model card remite a la licencia del repositorio origen y advierte que las licencias siguen a los originales por subcarpeta; es necesario verificar la licencia efectiva antes de uso comercial.
- El modelo no declara idiomas soportados en la metadata; la suposición de persa proviene únicamente del nombre del checkpoint.
- Riesgo de alucinación y artefactos de audio: no hay evaluación publicada sobre naturalidad, prosodia o pronunciación.
- Sin información sobre sesgos (acento, género, dialectos) ni sobre cobertura de vocabulario.
- No se documentan limitaciones de contexto ni de longitud de texto de entrada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-14) es futura respecto a la fecha habitual de consulta, lo que puede indicar un error de metadata; conviene verificarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_SadeghK_persian-text-to-speech_epoch_5261-step_2455712
- Repositorio origen de la exportación: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Modelo fuente presumible: https://huggingface.co/SadeghK/persian-text-to-speech
- Proyecto kasanoma (referenciado en la model card): https://github.com/michsethowusu/kasanoma
