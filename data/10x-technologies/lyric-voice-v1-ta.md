# 10X-Technologies/lyric-voice-v1-ta

## Resumen

Lyric-voice-v1-ta es un modelo de síntesis de voz (text-to-speech) especializado en tamil, desarrollado por 10X-Technologies como un ajuste fino (finetune) del modelo base `kyutai/pocket-tts`. Con 336 millones de parámetros, está diseñado para inferencia en dispositivo (on-device), lo que lo hace adecuado para aplicaciones donde la latencia y la privacidad son críticas y no se puede depender de servicios TTS en la nube.

El modelo se distribuye bajo la licencia `lyric-community-license` y el acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. El repositorio ocupa 1,3 GB y los pesos están en formato safetensors. Su pipeline declarado es `text-to-speech` y el único idioma soportado es el tamil (`ta`).

La relevancia de este modelo radica en su enfoque: un TTS compacto y especializado en un idioma de bajos recursos como el tamil, pensado para despliegue local. No se dispone de información pública sobre benchmarks, composición del dataset de entrenamiento ni detalles de arquitectura más allá de lo inferible del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de kyutai/pocket-tts) |
| Parametros totales | 336.068.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tamil (ta) |
| Licencia | lyric-community-license (acceso restringido, gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo en la información disponible. Se sabe que es un finetune del modelo `kyutai/pocket-tts`, un TTS de Kyutai orientado a despliegue en dispositivo, pero no se especifican detalles sobre el tipo de transformer, el vocoder, la representación acústica ni el mecanismo de decodificación empleado.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset (horas de audio, hablantes, dominio), ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo está etiquetado como `base_model:finetune`, lo que confirma que se partió de pesos preentrenados de `kyutai/pocket-tts` y se adaptaron al tamil. Cualquier detalle adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Síntesis de voz (text-to-speech) en tamil a partir de texto de entrada.
- Orientado a inferencia en dispositivo (on-device), según las etiquetas del repositorio.
- Especialización monolingüe en tamil; no se declaran capacidades multilingües.
- No se documentan capacidades de clonación de voz, control de estilo, emoción o prosodia.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Asistentes de voz locales en tamil: el modelo puede integrarse en aplicaciones móviles o de escritorio que necesiten síntesis de voz sin conexión, aprovechando su tamaño compacto (336 M de parámetros) para ejecutarse en dispositivo.
- Lectura de contenidos y accesibilidad: conversión de texto a voz para personas con discapacidad visual o para la lectura de artículos, noticias y documentos en tamil en entornos con conectividad limitada.
- Integración en sistemas de atención al cliente en tamil: generación de respuestas habladas en pipelines de IVR o chatbots, donde la inferencia local reduce la latencia y evita enviar texto del usuario a servicios externos.
- Aplicaciones educativas: narración de materiales didácticos y ejercicios de aprendizaje de idiomas en tamil, con despliegue en dispositivos de bajo consumo.
- Sistemas de navegación y avisos por voz: generación de indicaciones habladas en tamil para aplicaciones de mapas o transporte, donde se requiere baja latencia y funcionamiento offline.
- Prototipado e investigación en TTS para idiomas de bajos recursos: servir como base para experimentos de ajuste fino, evaluación de inteligibilidad o comparación con otros sistemas TTS en tamil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 336 M de parámetros, una estimación orientativa en fp32 sería de aproximadamente 1,3 GB de pesos, y en fp16 de unos 0,7 GB, sin contar el vocoder ni los buffers de inferencia. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, el modelo debería caber en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon y CPUs modernas, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño, aunque no se ha verificado oficialmente.
- Opciones de despliegue: no se documentan frameworks compatibles (vLLM, llama.cpp, Ollama, TGI u otros). Al ser un modelo TTS con pesos safetensors, requeriría el código de inferencia del modelo base `kyutai/pocket-tts`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `kyutai/pocket-tts` es la referencia más directa, pero no se han publicado datos comparativos de rendimiento, contexto o licencia en la información disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| lyric-voice-v1-ta | 336 M | no disponible | tamil | lyric-community-license | gated |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face; esto puede limitar su uso en pipelines automatizados o entornos corporativos.
- Licencia `lyric-community-license`: no se detallan en la información disponible las restricciones exactas para uso comercial; es imprescindible revisar el texto completo de la licencia antes de desplegarlo en producción.
- Monolingüe en tamil: no soporta otros idiomas, lo que limita su aplicabilidad en contextos multilingües.
- Sin datos de benchmarks: no hay evidencia publicada sobre inteligibilidad, naturalidad (MOS) o robustez frente a texto ruidoso.
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas o artefactos en palabras poco frecuentes, nombres propios o texto fuera de dominio; no se ha documentado su comportamiento en estos casos.
- Sesgos potenciales: al no publicarse la composición del dataset, se desconocen sesgos de género, dialecto o registro en la voz generada.
- Sin documentación de arquitectura ni de requisitos: dificulta la integración y la estimación de recursos en producción.
- Fecha de creación futura (2026-11-06): conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/10X-Technologies/lyric-voice-v1-ta
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Sitio de Lyric: https://www.lyricvoices.ai/about
