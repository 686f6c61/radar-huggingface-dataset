# NguyenAn05/phowhisper-large-lora-mwer

## Resumen

PhoWhisper-large LoRA — MWER es un adaptador LoRA para reconocimiento automático del habla (ASR) en vietnamita, construido sobre el modelo base `vinai/PhoWhisper-large`. Lo publica el usuario NguyenAn05 en Hugging Face y su propósito es especializar el modelo base mediante un ajuste fino con un criterio de entrenamiento orientado a minimizar la tasa de error de palabras (MWER, *Minimum Word Error Rate*). El repositorio contiene únicamente los pesos del adaptador, no los del modelo base, que debe descargarse por separado.

El modelo se distribuye con la librería PEFT y formato safetensors, y está etiquetado para la tarea `automatic-speech-recognition` con idioma `vi`. Su relevancia es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y con un tamaño de repositorio de 0.0 GB (es decir, el adaptador es muy ligero, coherente con un LoRA sobre un Whisper-large).

La información pública disponible se limita a la model card del autor, que documenta el proceso de entrenamiento en dos fases y unas métricas de validación y test. No hay datos sobre arquitectura interna del adaptador, hiperparámetros completos, composición del dataset ni resultados comparativos con otros sistemas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `vinai/PhoWhisper-large` (familia Whisper, transformer encoder-decoder) |
| Parámetros totales | no disponible (el adaptador LoRA es de bajo rango; el modelo base no se incluye) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Whisper-large, no documentada en la ficha) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `vinai/PhoWhisper-large`, un modelo de la familia Whisper (transformer encoder-decoder para ASR) especializado en vietnamita. El autor no detalla en la model card qué módulos del transformer se adaptan con LoRA, ni el rango, el alpha o el dropout del adaptador. Tampoco se especifica el número de tokens de audio ni la composición del dataset de entrenamiento.

El proceso de entrenamiento se documenta en dos fases. La primera, `phowhisper-mwer-colab-b8-v2`, seleccionó el adaptador en el paso 300. La segunda, `phowhisper-mwer-colab-b8-cont-v1`, reanudó el entrenamiento desde ese adaptador con el optimizador reiniciado y finalizó en el paso 756; el adaptador publicado corresponde al mejor checkpoint según validación, obtenido en el paso 700. Los logs y configuraciones incluidos en `training/` pertenecen exclusivamente a esta segunda fase; los de la primera no se conservan en el repositorio. El nombre del adaptador sugiere un criterio de entrenamiento MWER, aunque la model card no describe la función de pérdida ni el procedimiento de optimización con detalle.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en vietnamita.
- Especialización mediante ajuste fino sobre un modelo base ya entrenado para ASR en vietnamita.
- Entrenamiento orientado a reducir la tasa de error de palabras (MWER), según el nombre del adaptador.
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá del audio de entrada propio de un sistema ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita: el adaptador se carga sobre PhoWhisper-large y permite convertir audio en texto con una WER normalizada del 12,14% en el conjunto de test del autor, adecuado para actas y resúmenes posteriores.
- Subtitulado automático de vídeo en vietnamita: la tasa de error de caracteres del 6,94% en test sugiere una calidad suficiente para generar subtítulos que luego se revisan manualmente.
- Investigación en ajuste fino con criterios MWER: el repositorio sirve como referencia reproducible de un pipeline LoRA en dos fases con checkpoints documentados.
- Prototipado de asistentes de voz en vietnamita: al ser un adaptador ligero, se puede integrar en un servicio de ASR existente que ya use PhoWhisper-large sin reemplazar los pesos base.
- Evaluación comparativa de adaptadores ASR: las métricas de validación y test publicadas permiten contrastar con otros adaptadores o modelos sobre el mismo conjunto.
- Transcripción de audio de dominio específico: si el ajuste se realizó sobre un corpus concreto, el adaptador puede mejorar la precisión en ese dominio frente al modelo base, aunque el autor no documenta la composición del dataset.

## Benchmarks y rendimiento

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación (paso 700) | WER normalizada | 11,31% |
| Validación (paso 700) | CER | 6,97% |
| Test (504 clips de audio) | WER normalizada | 12,14% |
| Test (504 clips de audio) | CER | 6,94% |

No se han publicado resultados comparativos con el modelo base ni con otros sistemas en la información disponible. Los detalles de evaluación se encuentran en `evaluation/test_metrics.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del modelo base PhoWhisper-large (familia Whisper-large) y del formato de carga; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: no disponible. Para un modelo de la familia Whisper-large se suele requerir una GPU con memoria suficiente para los pesos base, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: no documentadas. Al ser un adaptador PEFT, requeriría cargarse junto con el modelo base mediante las librerías de Hugging Face (transformers + peft); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ASR vi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NguyenAn05/phowhisper-large-lora-mwer | no disponible (adaptador LoRA) | no disponible | WER 12,14% / CER 6,94% en test propio | no disponible | Hugging Face, 0 descargas |
| vinai/PhoWhisper-large (modelo base) | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otros adaptadores ASR para vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- El repositorio no incluye los pesos del modelo base; es imprescindible descargar `vinai/PhoWhisper-large` por separado.
- Solo soporta vietnamita; no hay evidencia de capacidades multilingües.
- El conjunto de test es pequeño (504 clips), por lo que las métricas pueden no generalizar a otros dominios o condiciones acústicas.
- No se documenta la composición del dataset de entrenamiento, lo que impide evaluar sesgos o cobertura de dominios.
- Los logs de la primera fase de entrenamiento no están incluidos, lo que limita la reproducibilidad completa.
- Riesgo de alucinación inherente a los sistemas ASR, especialmente en audio con ruido o solapamiento de hablantes.
- Sin descargas ni likes: no hay evidencia de uso en producción ni validación externa.
- No se documentan requisitos de hardware ni opciones de despliegue, lo que dificulta la planificación de infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/NguyenAn05/phowhisper-large-lora-mwer
- Modelo base: https://huggingface.co/vinai/PhoWhisper-large
- Métricas de evaluación: `evaluation/test_metrics.json` (dentro del repositorio)
- Configuraciones de entrenamiento: `training/` (dentro del repositorio)
