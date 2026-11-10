# danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-ONNX

## Resumen

Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-ONNX es una exportación al formato ONNX del modelo de reconocimiento automático del habla (ASR) `danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching`, un fine-tuning del conocido Parakeet-TDT-0.6B-v2 de NVIDIA especializado en *code-switching* entre inglés y hebreo. Lo publica el desarrollador independiente Daniel Rosehill y está pensado para desplegarse en entornos de inferencia ONNX (por ejemplo, mediante `onnx-asr` o el stack Voxtype), no para entrenamiento.

El modelo resuelve un problema concreto y poco cubierto: transcribir audio en el que un mismo hablante alterna entre inglés y hebreo dentro de la misma frase, algo frecuente en comunidades bilingües, reuniones técnicas o contenido en redes. La arquitectura subyacente es NeMo Conformer con decodificación TDT (Token-and-Duration Transducer), de ahí el sufijo `nemo-conformer-tdt`, con aproximadamente 0,6 mil millones de parámetros.

Es relevante ahora porque el ecosistema ASR open source carece de modelos compactos con soporte real de code-switching hebreo-inglés, y porque la disponibilidad del modelo en ONNX facilita su integración en aplicaciones de escritorio y pipelines ligeros. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) |
| Parámetros totales | 0,6B (aproximadamente, según nombre del modelo; no se detalla cifra exacta) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (exportación ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | inglés (en) y hebreo (he), con code-switching entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base es Parakeet-TDT-0.6B-v2 de NVIDIA, un ASR basado en Conformer con decodificación TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones para mejorar la eficiencia y la precisión en la alineación temporal. Esta versión es un fine-tuning realizado por Daniel Rosehill sobre el checkpoint original, orientado a audio bilingüe inglés-hebreo con alternancia de idiomas dentro de un mismo enunciado.

No se dispone de información detallada sobre el conjunto de datos de fine-tuning (número de horas, composición, proporción de code-switching, procedencia del audio), ni sobre el proceso de entrenamiento (épocas, learning rate, técnicas de regularización). Tampoco se documenta si se aplicaron técnicas de aumento de datos o de adaptación específicas para el cambio de idioma. La única innovación técnica destacable documentada es la exportación a ONNX para inferencia portable.

## Capacidades

- Reconocimiento automático del habla en inglés y hebreo.
- Transcripción con code-switching intra-frase entre inglés y hebreo.
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Inferencia en formato ONNX, compatible con runtimes ONNX y librerías como `onnx-asr`.
- Integración con el stack Voxtype (según tags del repositorio).
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de la transcripción.
- Capacidades multilingües limitadas a los dos idiomas indicados; no se documenta soporte de otros idiomas.

## Casos de uso

- Transcripción de reuniones bilingües inglés-hebreo: el modelo puede procesar audio en el que los participantes alternan idiomas, algo que los ASR monolingües suelen fallar al cambiar de idioma a mitad de frase.
- Subtitulado de contenido en redes sociales: útil para vídeos de creadores que mezclan inglés y hebreo, generando subtítulos coherentes sin segmentar manualmente por idioma.
- Documentación de entrevistas y grupos focales: investigadores que trabajan con comunidades bilingües pueden obtener transcripciones utilizables sin postprocesado de cambio de idioma.
- Asistentes de voz para aplicaciones de escritorio: la exportación ONNX permite integrar el modelo en apps locales (por ejemplo, mediante Voxtype) sin depender de servicios en la nube.
- Atención al cliente en mercados bilingües: transcripción de llamadas o chats de voz donde el cliente alterna hebreo e inglés, con despliegue en infraestructura propia.
- Pipeline de accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos donde se hablan ambos idiomas.
- Archivado y búsqueda de audio: indexación de grabaciones históricas bilingües para recuperación por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 3,2 GB, lo que sugiere que el modelo ONNX en precisión completa ronda ese tamaño, pero no se detalla el consumo en ejecución.
- GPU recomendadas: no disponible. Por tamaño (0,6B), es plausible que quepa en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado en la documentación disponible.
- Opciones de despliegue: runtime ONNX, `onnx-asr`, stack Voxtype (según tags). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR ONNX).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Code-switching | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-ONNX | ~0,6B | en, he | Sí (en-he) | CC-BY-4.0 | ONNX |
| Parakeet-TDT-0.6B-v2 (NVIDIA, original) | ~0,6B | en (principalmente) | No documentado | No disponible en la información | No disponible en la información |
| Whisper (variantes) | Diversos | Multilingüe | Parcial, no especializado | No disponible en la información | No disponible en la información |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Idiomas limitados a inglés y hebreo; no apto para otros idiomas.
- No se documentan sesgos específicos, pero al ser un fine-tuning sobre un modelo base entrenado mayoritariamente en inglés, puede presentar sesgos hacia ese idioma o hacia variedades concretas de hebreo.
- Riesgo de alucinación inherente a los modelos ASR: posibles transcripciones incorrectas en audio ruidoso, con acentos marcados o con cambios de idioma muy frecuentes.
- No se documenta el conjunto de datos de fine-tuning, lo que dificulta evaluar la cobertura de dominios (técnico, coloquial, médico, etc.).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base original de NVIDIA.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio con pocas descargas (44) y sin likes: ecosistema de validación limitado, lo que reduce la confianza en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-ONNX
- Modelo base (fine-tuning): https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching
- Perfil del autor: https://huggingface.co/danielrosehill
