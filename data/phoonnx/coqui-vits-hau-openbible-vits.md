# Phoonnx/coqui-vits-hau-openbible-vits

## Resumen

`Phoonnx/coqui-vits-hau-openbible-vits` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del repositorio agregador `Phoonnx/phoonnx-coqui-vits` y correspondiente a la carpeta `hau-openbible-vits`. Está pensado para su uso con la librería y el runtime `phoonnx`, un motor de inferencia TTS orientado a despliegue ligero. El modelo se publica como un artefacto ya exportado a ONNX, no como pesos PyTorch originales.

La arquitectura subyacente es Coqui VITS, un modelo generativo de extremo a extremo que combina un encoder de texto, un predictor de duraciones, un flujo normalizador y un decoder HiFi-GAN para producir audio directamente desde texto, sin necesidad de un vocoder externo. El identificador `hau` corresponde al código ISO 639-3 del idioma hausa, y el sufijo `openbible` indica que el corpus de entrenamiento proviene de grabaciones de la Biblia abierta en ese idioma.

El modelo es relevante para proyectos de TTS en lenguas de bajos recursos, donde los modelos comerciales no ofrecen cobertura, y para pipelines que necesitan inferencia ONNX portable en CPU o GPU sin dependencias pesadas de PyTorch. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un checkpoint VITS de tamaño pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui VITS (end-to-end, encoder de texto + flujo normalizador + decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de texto de longitud variable, sin límite declarado) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | hausa (`ha`), según el identificador del modelo y la tabla de la model card |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es un modelo condicional variacional de extremo a extremo que integra en una sola red el encoder de texto, el predictor de duraciones (con alineamiento monotónico aprendido), un flujo normalizador que modela la distribución latente y un decoder generativo del tipo HiFi-GAN. Esta integración elimina la necesidad de un vocoder separado y permite generar waveforms directamente desde fonemas o grafemas. El artefacto publicado aquí es la exportación ONNX de un checkpoint Coqui VITS, empaquetada para el runtime `phoonnx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO (no aplicable en TTS) ni detalles del proceso de exportación a ONNX. La model card solo indica que el modelo proviene del corpus OpenBible en hausa y que la licencia del repositorio origen es CC-BY-SA-4.0.

## Capacidades

- Síntesis de voz a partir de texto en hausa (`ha`).
- Generación de audio end-to-end sin vocoder externo.
- Inferencia mediante ONNX Runtime a través de la librería `phoonnx`.
- Identificador de voz expuesto: `coqui/hau-openbible-vits`.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multi-hablante.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta soporte multilingüe más allá del hausa.

## Casos de uso

- **Lectura de textos en hausa para accesibilidad**: convertir artículos, documentación o contenido educativo a audio para usuarios con discapacidad visual o baja alfabetización, aprovechando la cobertura del idioma hausa que otros TTS comerciales no ofrecen.
- **Locución de contenido religioso**: narrar pasajes bíblicos y material devocional en hausa, alineado con el corpus OpenBible con el que se entrenó el modelo.
- **Sistemas de información por voz en kiosco o IVR**: integrar el modelo en un servicio telefónico o de altavoz que responda en hausa, usando el runtime ONNX para desplegar en hardware modesto.
- **Generación de audiolibros y pódcasts**: producir narraciones largas en hausa troceando el texto en segmentos y sintetizando cada uno con el modelo, con post-proceso de concatenación.
- **Aplicaciones educativas de aprendizaje de idiomas**: generar ejemplos de pronunciación en hausa para materiales didácticos, con la salvedad de que la calidad y naturalidad no están documentadas.
- **Prototipado de asistentes conversacionales en lenguas de bajos recursos**: usar el modelo como componente TTS dentro de un pipeline ASR-LLM-TTS para experimentar con interfaces de voz en hausa.
- **Investigación en TTS multilingüe**: servir como punto de comparación o componente de un sistema mayor que agregue varios idiomas, dado su formato ONNX portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Por el tamaño del repositorio (~0,1 GB) se trata de un modelo pequeño que probablemente quepa en cualquier GPU consumer, pero no se confirma en la documentación.
- **GPU recomendadas**: no disponible. Un checkpoint VITS de este tamaño suele ejecutarse en CPU sin problema, pero no hay datos oficiales.
- **Cabida en GPU consumer**: no confirmado; el tamaño del artefacto sugiere que sí, pero no se documenta.
- **Opciones de despliegue**: ONNX Runtime a través de la librería `phoonnx` (https://github.com/TigreGotico/phoonnx). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/coqui-vits-hau-openbible-vits` | Coqui VITS | hausa | ONNX | CC-BY-SA-4.0 | Hugging Face |
| Otros modelos de `Phoonnx/phoonnx-coqui-vits` | Coqui VITS | varios (según carpeta) | ONNX | según repositorio origen | Hugging Face |
| Coqui TTS VITS originales | VITS | varios | PyTorch | MPL-2.0 (Coqui) | GitHub / Hugging Face |
| Modelos TTS comerciales (p. ej. Google, Azure) | no público | multilingüe | API | propietaria | API |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Licencia CC-BY-SA-4.0**: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. Esto puede ser incompatible con productos propietarios que no quieran liberar su código o sus adaptaciones.
- **Idioma único**: solo hausa; no se documenta cobertura de otros idiomas.
- **Calidad no evaluada**: no hay benchmarks, muestras de audio ni métricas de naturalidad (MOS) publicadas.
- **Sesgos del corpus**: al entrenarse sobre OpenBible, el modelo puede reflejar el estilo, registro y dominio de ese corpus, con posible degradación en textos técnicos, coloquiales o fuera de dominio.
- **Riesgo de alucinación acústica**: como todo TTS generativo, puede producir artefactos, pronunciaciones incorrectas o ruido en entradas atípicas (números, siglas, nombres propios).
- **Sin control de prosodia ni emoción**: no se documentan parámetros de estilo, velocidad o entonación.
- **Madurez del ecosistema**: `phoonnx` es un runtime específico; la integración con herramientas estándar (Hugging Face `transformers`, `TTS` de Coqui) no está documentada.
- **Fecha de creación futura**: el repositorio figura creado en 2026-11-14, lo que sugiere un artefacto reciente o con metadatos inconsistentes; conviene verificar su estabilidad antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-hau-openbible-vits
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Runtime `phoonnx`: https://github.com/TigreGotico/phoonnx
- Coqui TTS (proyecto original): https://github.com/coqui-ai/TTS
