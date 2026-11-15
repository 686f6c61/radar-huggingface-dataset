# crespo12/piper-kirundi-bible

## Resumen

`crespo12/piper-kirundi-bible` es un repositorio alojado en Hugging Face por el usuario crespo12 que, por su nomenclatura y por el tag `onnx` presente, corresponde a un modelo de síntesis de voz (text-to-speech) del ecosistema Piper orientado a la lectura de textos bíblicos en kirundi (rundi), una lengua bantú hablada principalmente en Burundi. Piper es un motor de TTS neuronal ligero basado en VITS y pensado para inferencia en tiempo real sobre CPU mediante modelos exportados a ONNX.

El repositorio no incluye información pública sobre arquitectura declarada, parámetros, licencia ni idiomas en la ficha de Hugging Face, y cuenta con un tamaño de 21,3 GB, muy superior al habitual en un checkpoint Piper estándar (que suele pesar entre decenas y pocos cientos de megabytes en fp32/ONNX). Esto sugiere que el repositorio puede contener múltiples artefactos, checkpoints de entrenamiento, datasets de audio o versiones redundantes, aunque no hay confirmación en la información disponible.

La relevancia del proyecto radica en su carácter de recurso lingüístico para una lengua de bajos recursos: la disponibilidad de un modelo TTS para kirundi abre la puerta a aplicaciones de accesibilidad, lectura de escrituras y digitalización de contenido religioso y educativo en una comunidad con escasa cobertura tecnológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por nomenclatura, se infiere Piper/VITS, sin confirmacion oficial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por nombre del repo, kirundi) |
| Licencia | no disponible |
| Formato de pesos | ONNX (tag `onnx` en el repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura, el volumen de datos de entrenamiento, la composición del corpus ni el proceso de ajuste (RLHF, DPO u otros) en la información disponible. El tag `onnx` indica que el artefacto principal está exportado al formato ONNX, lo que es coherente con el pipeline de inferencia de Piper, que emplea modelos VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) exportados para ejecución con ONNX Runtime.

El nombre del repositorio sugiere un ajuste o entrenamiento específico sobre un corpus bíblico en kirundi, lo que implicaría un dominio acústico y léxico muy acotado (registro formal, vocabulario religioso). No obstante, no hay documentación que confirme la procedencia de los datos, las horas de audio, la calidad de las grabaciones ni si se ha realizado validación con hablantes nativos. El tamaño del repositorio (21,3 GB) no permite inferir el tamaño del modelo sin acceso a los archivos individuales.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en el idioma objetivo del modelo, presumiblemente kirundi.
- Generación de audio en formato probablemente WAV/raw PCM a través de ONNX Runtime, según el estándar de Piper.
- Inferencia orientada a CPU, dado el diseño de Piper.
- No se dispone de información sobre capacidades de clonación de voz, control de prosodia, emociones, multihablante ni estilos.
- No se dispone de información sobre soporte de SSML, phonemization específica ni alfabeto fonético utilizado.
- No aplica tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.

## Casos de uso

- Lectura automatizada de textos bíblicos en kirundi: el modelo permitiría convertir pasajes escritos en audio para uso litúrgico, catequesis o estudio personal, aprovechando que el corpus de entrenamiento parece estar centrado en este dominio.
- Accesibilidad para personas con discapacidad visual en Burundi: integración en aplicaciones de lectura de pantalla para reproducir contenido escrito en kirundi, una lengua con escasa cobertura en motores TTS comerciales.
- Alfabetización y educación: generación de material audio-lectura para escuelas primarias y programas de alfabetización en kirundi, donde la disponibilidad de voces sintéticas es limitada.
- Digitalización de archivos sonoros y bibliotecas: conversión de textos digitalizados a audio para su distribución en comunidades con conectividad limitada, dado el bajo coste de inferencia en CPU.
- Integración en asistentes de voz locales: despliegue en dispositivos de bajo consumo mediante ONNX Runtime para respuestas habladas en kirundi en entornos sin conexión.
- Investigación en lenguas de bajos recursos: uso como línea base o punto de partida para experimentos de TTS multilingüe y evaluación de inteligibilidad en lenguas bantúes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los modelos Piper típicos operan en CPU con requisitos de memoria del orden de cientos de megabytes, pero no se puede confirmar para este repositorio dado su tamaño de 21,3 GB.
- GPU recomendadas: no disponible. Piper está diseñado para CPU; el uso de GPU no es necesario en la mayoría de despliegues.
- Compatibilidad con GPU de consumo: no confirmada. Por el diseño de Piper, es esperable que funcione en CPU sin GPU dedicada, pero no hay datos específicos de este modelo.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); Piper CLI; integraciones habituales de Piper (Home Assistant, Rhasspy). No se dispone de información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos Piper comparables para kirundi ni alternativas TTS documentadas para esta lengua con las que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- La ficha de Hugging Face no declara licencia, lo que impide determinar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- No se especifican los idiomas oficialmente soportados; la atribución al kirundi se basa únicamente en el nombre del repositorio.
- El dominio de entrenamiento parece restringido a texto bíblico, por lo que la calidad fuera de ese registro (lenguaje coloquial, términos técnicos, nombres propios) es incierta.
- No hay información sobre sesgos, calidad de las grabaciones, diversidad de hablantes ni validación con nativos.
- El tamaño del repositorio (21,3 GB) es anómalo para un modelo Piper estándar y podría indicar artefactos adicionales, checkpoints intermedios o datos; conviene inspeccionar los archivos antes de su descarga completa.
- Riesgo de alucinación acústica y errores de pronunciación en fonemas no representados en el corpus de entrenamiento.
- No se dispone de información sobre el proceso de phonemization ni sobre el alfabeto utilizado, lo que puede afectar a la inteligibilidad de textos con ortografía no estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crespo12/piper-kirundi-bible
- Proyecto Piper (motor TTS subyacente): https://github.com/rhasspy/piper
- Documentación de Piper: https://github.com/rhasspy/piper/blob/master/README.md
