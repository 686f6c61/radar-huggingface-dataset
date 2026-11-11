# BH-Language-AI/bh-speech-asr

## Resumen

BH-Speech-ASR es una ficha de proyecto (no un modelo entrenado) publicada por BH-Language-AI dentro de la iniciativa BH-Speech, orientada a construir un sistema de reconocimiento automático del habla (ASR) para bosnio. El repositorio de Hugging Face existe, pero la propia model card declara explícitamente que las ponderaciones no se han publicado: el estado es "NIJE TRENIRAN" (no entrenado) y se describe como una tarjeta de proyecto. Por tanto, no es posible descargar ni ejecutar el modelo.

El plan técnico documentado consiste en partir de `openai/whisper-large-v3` (revisión `06f233f`, licencia Apache-2.0) y afinar sobre el split `bs_ba` del dataset `google/fleurs` (CC-BY-4.0, con atribución obligatoria). La metodología prevista es una evaluación de línea base, seguida de una decisión entre LoRA y fine-tuning completo, y una evaluación congelada sobre el split de test reservado (925 muestras). Se toma como referencia el modelo `BuzzASR/bosnian` (MIT), con CER 3.59 y WER 13.46 en FLEURS.

Su relevancia actual es, por tanto, documental y de planificación: sirve para hacer seguimiento del proyecto, conocer la base elegida y las condiciones de publicación, pero no constituye una opción viable para inferencia en producción. Cualquier evaluación de capacidades, rendimiento o hardware debe considerarse no disponible hasta que el autor publique ponderaciones y resultados verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), heredada de `openai/whisper-large-v3` |
| Parametros totales | no disponible (los de `whisper-large-v3` no se detallan en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (las ponderaciones no estan publicadas) |

## Arquitectura y entrenamiento

La arquitectura prevista es la de `openai/whisper-large-v3`, un transformer encoder-decoder diseñado para reconocimiento automático del habla, fijado en la revisión `06f233fe06e710322aca913c1bc4249a0d71fce1`. No se han publicado detalles sobre el número de parámetros efectivos del modelo resultante ni sobre modificaciones estructurales respecto a la base.

En cuanto al entrenamiento, la model card describe únicamente el plan: evaluación de línea base, decisión entre LoRA y fine-tuning completo, y evaluación congelada sobre el split de test. Los datos previstos son el split `bs_ba` de `google/fleurs` (CC-BY-4.0), con 925 muestras reservadas para test. No se indica número de tokens, composición del dataset de entrenamiento, ni si se aplicará RLHF, DPO u otras técnicas de alineación. No hay innovaciones técnicas documentadas más allá del propio proceso de adaptación al bosnio.

## Capacidades

- No hay capacidades verificadas: el modelo no está entrenado ni publicado.
- Capacidad prevista: transcripción de voz a texto en bosnio (`bs`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el alcance declarado se limita al bosnio.
- Capacidades especiales (modo thinking, visión, audio más allá de ASR): no disponibles.

## Casos de uso

- Seguimiento de proyecto de investigación: consultar la ficha y el repositorio de GitHub para conocer la base elegida, el dataset previsto y los criterios de publicación antes de comprometer recursos.
- Evaluación comparativa de línea base: replicar la evaluación sobre `openai/whisper-large-v3` y `BuzzASR/bosnian` con el split de test reservado (925 muestras) para disponer de una referencia propia antes de que existan ponderaciones.
- Planificación de pipelines de subtitulado en bosnio: usar la ficha para dimensionar el futuro modelo (basado en Whisper large-v3) y preparar la integración con herramientas compatibles con Whisper, sin poder ejecutarlo todavía.
- Preparación de conjuntos de evaluación: construir un harness de evaluación con CER y WER sobre FLEURS `bs_ba`, respetando la atribución CC-BY-4.0, para validar el modelo cuando se publique.
- Auditoría de licencias: verificar la compatibilidad Apache-2.0 del modelo base y CC-BY-4.0 del dataset antes de un despliegue comercial futuro.
- Reproducibilidad académica: documentar el estado "no entrenado" y las decisiones metodológicas previstas para citar correctamente el proyecto en trabajos sobre ASR de lenguas eslavas del sur.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la informacion disponible. La model card cita como referencia externa `BuzzASR/bosnian` con CER 3.59 y WER 13.46 en FLEURS, pero no son resultados de BH-Speech-ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay ponderaciones publicadas).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; por la base Whisper large-v3, cabría esperar compatibilidad con el ecosistema `transformers`, pero no está confirmado por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Idioma | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| BH-Speech-ASR | whisper-large-v3 | bs | no disponible | no disponible | apache-2.0 | No entrenado, sin ponderaciones |
| BuzzASR/bosnian | no disponible | bs | no disponible | no disponible | MIT | Publicado; CER 3.59 / WER 13.46 en FLEURS |
| openai/whisper-large-v3 | propio | multilingue | no disponible | no disponible | apache-2.0 | Publicado; base de referencia |

## Limitaciones y advertencias

- El modelo no está entrenado y no tiene ponderaciones publicadas; no puede usarse para inferencia.
- No existen resultados de evaluación propios; cualquier cifra de rendimiento sería especulativa.
- El alcance lingüístico declarado se limita al bosnio, sin datos sobre code-switching ni otras variedades.
- El dataset previsto (`google/fleurs`, `bs_ba`) exige atribución bajo CC-BY-4.0; debe respetarse en cualquier derivado.
- La licencia Apache-2.0 se declara sobre la ficha, pero al no haber artefactos publicados no puede verificarse su aplicabilidad efectiva.
- Riesgo de sesgo y alucinación: no evaluable sin modelo entrenado; en ASR, los sesgos suelen manifestarse en acentos y registros poco representados en FLEURS.
- No debe citarse como modelo operativo en producción ni incluirse en comparativas de rendimiento hasta que el autor publique ponderaciones y evaluación verificada.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-speech-asr
- Repositorio del proyecto: https://github.com/BH-Language-AI/bh-speech
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Referencia bosnia: https://huggingface.co/BuzzASR/bosnian
- Dataset: https://huggingface.co/datasets/google/fleurs
