# Phoonnx/vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-marylux-medium

## Resumen

El modelo `vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-marylux-medium` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX y distribuido por el usuario Phoonnx dentro del repositorio agregador `Phoonnx/phoonnx-vits`. Se trata de una extracción de una voz Piper para luxemburgués (código de idioma `lb_LU`) identificada como "marylux" en calidad "medium", originalmente publicada por el usuario mbarnig en el ecosistema Rhasspy/Piper. El modelo está pensado para su uso con la librería `phoonnx`, un runtime de inferencia de código abierto orientado a TTS.

El modelo resuelve el problema de la síntesis de voz en luxemburgués, un idioma de bajos recursos con escasa cobertura en sistemas TTS comerciales. Al estar en formato ONNX, puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace adecuado para asistentes de voz locales, sistemas de domótica y aplicaciones de accesibilidad offline. Su licencia MIT facilita la integración en productos comerciales.

La relevancia actual del modelo es limitada pero específica: cubre una necesidad concreta (TTS luxemburgués) dentro de un ecosistema de voces Piper empaquetadas para `phoonnx`. No es un modelo de propósito general ni compite con sistemas TTS neuronales de gran escala; es una pieza de infraestructura para pipelines de voz multilingües de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantización | no disponible (pesos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | Luxemburgués (`lb_LU`), según el identificador del modelo |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un predictor de duración, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera audio directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue. En este caso, el modelo se distribuye como un grafo ONNX optimizado para inferencia, presumiblemente exportado desde el formato original de Piper.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, la composición del corpus ni si se aplicaron técnicas de fine-tuning o adaptación. La model card no incluye detalles técnicos del entrenamiento. El modelo pertenece a la familia de voces Piper, que típicamente se entrenan con datasets de dominio público o grabaciones comunitarias, pero no se confirma este punto en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en luxemburgués a partir de texto de entrada.
- Generación de audio en formato waveform mediante inferencia ONNX.
- Ejecución en CPU sin GPU, gracias al formato ONNX y al tamaño reducido del repositorio (0,1 GB).
- Integración con la librería `phoonnx`, un runtime TTS de código abierto.
- Compatible con el ecosistema Piper/Rhasspy, lo que permite su uso en asistentes de voz locales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multimodales más allá de texto a audio.
- No se documentan capacidades de control de prosodia, emoción ni estilo.

## Casos de uso

- **Asistentes de voz locales en luxemburgués**: el modelo puede integrarse en sistemas de asistente doméstico (por ejemplo, Home Assistant con Rhasspy) para generar respuestas habladas en luxemburgués sin depender de servicios en la nube, gracias a su formato ONNX y ejecución en CPU.
- **Sistemas de accesibilidad para hablantes de luxemburgués**: lectura de textos, noticias o documentos en voz alta para personas con discapacidad visual, usando el modelo como motor TTS local en aplicaciones de escritorio o móviles.
- **Aplicaciones de aprendizaje de idiomas**: generación de pronunciaciones de ejemplo en luxemburgués para herramientas de aprendizaje, aprovechando la voz "marylux" de calidad media.
- **Domótica y anuncios automatizados**: integración en sistemas de megafonía o notificaciones por voz en entornos donde el luxemburgués es el idioma principal, con latencia baja al ejecutarse en CPU.
- **Prototipado de pipelines TTS multilingües**: uso del modelo como una voz más dentro de un sistema que selecciona el idioma dinámicamente, gracias a la estructura de repositorio de `phoonnx-vits`.
- **Investigación en TTS de bajos recursos**: el modelo sirve como referencia o baseline para experimentos con voces Piper en idiomas minoritarios, aunque no se documenten métricas de calidad.
- **Generación de audiolibros o contenido bajo demanda**: síntesis de texto largo en luxemburgués para podcasts o audiolibros, siempre que se valide la calidad de la voz medium.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica para inferencia en CPU; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es inferior a 1 GB en la mayoría de configuraciones.
- **GPU recomendadas**: no es necesario GPU; el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime.
- **Compatibilidad con GPU consumer**: puede ejecutarse en cualquier GPU consumer si se usa ONNX Runtime con provider CUDA, pero no es el caso de uso previsto.
- **Opciones de despliegue**: `phoonnx` (runtime principal), ONNX Runtime, y potencialmente Piper si se adaptan los ficheros. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- **Latencia y throughput**: no disponibles. Al ser un modelo VITS medium en ONNX, se espera latencia de tiempo real o inferior en CPU moderna, pero no se confirma en la información.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (marylux medium) | VITS | Luxemburgués | ONNX | MIT | Hugging Face (Phoonnx) |
| Otras voces Piper para `lb_LU` | VITS | Luxemburgués | ONNX | según origen | Repositorio Rhasspy/Piper |
| Voces Piper para idiomas mayoritarios (p. ej. en_US) | VITS | Inglés | ONNX | MIT / otras | Hugging Face (rhasspy/piper-voices) |
| Coqui TTS (modelos multilingües) | VITS / Tacotron | Varios | PyTorch | MPL 2.0 / otras | GitHub Coqui |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- **Idioma único**: el modelo está entrenado para luxemburgués; no se garantiza calidad en otros idiomas.
- **Calidad "medium"**: la designación medium en Piper implica una calidad de voz inferior a las variantes "high", con posible artefactos y prosodia limitada.
- **Sin métricas de calidad**: no se publican valores MOS ni evaluaciones subjetivas, por lo que la calidad real no está verificada.
- **Riesgo de alucinación**: en TTS, el riesgo se traduce en pronunciaciones incorrectas o artefactos de audio ante texto fuera del dominio de entrenamiento.
- **Licencia MIT**: permite uso comercial, pero la model card advierte que la licencia sigue a la del repositorio original; en este caso se declara MIT, aunque la fuente original (Piper) puede tener matices. Se recomienda revisar la procedencia.
- **Sin soporte de control de prosodia**: no se documentan parámetros para ajustar velocidad, tono o emoción.
- **Dependencia de `phoonnx`**: el modelo está empaquetado para esa librería; su uso fuera de ella requiere conversión o adaptación.
- **Fecha de creación futura**: la fecha indicada (2026-11-14) es posterior a la actual, lo que sugiere un posible error en los metadatos; conviene verificar la integridad del repositorio.
- **Cero descargas y likes**: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- [Hugging Face: Phoonnx/vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-marylux-medium](https://huggingface.co/Phoonnx/vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-marylux-medium)
- [Repositorio agregador Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Repositorio phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
- [Repositorio kasanoma (referencia de licencias en la model card)](https://github.com/michsethowusu/kasanoma)
- [Rhasspy Piper TTS](https://github.com/rhasspy/piper) (ecosistema de origen de la voz, no enlazado explícitamente en la model card)
