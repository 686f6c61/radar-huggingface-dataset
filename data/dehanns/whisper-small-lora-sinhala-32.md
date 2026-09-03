# dehanns/whisper-small-lora-sinhala-32

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `openai/whisper-small`, orientado al reconocimiento automático de voz (ASR) en idioma sinhala. Ha sido publicado por el usuario `dehanns` en Hugging Face, aunque la model card está prácticamente vacía y no incluye información sobre el entrenamiento, los datos utilizados ni el rendimiento. El nombre del repositorio sugiere que se trata de un ajuste fino con LoRA para la transcripción de audio en sinhala, probablemente derivado de proyectos similares que emplean Whisper para idiomas de bajos recursos.

La relevancia de este modelo radica en la posibilidad de adaptar un sistema ASR multilingüe como Whisper a un idioma específico con un coste computacional reducido gracias a la técnica LoRA. Sin embargo, al no existir documentación ni métricas publicadas, su utilidad práctica no puede verificarse sin una evaluación independiente. El repositorio tiene cero descargas y cero likes, lo que indica que es un experimento reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Whisper-small (encoder-decoder transformer) |
| Parametros totales | No disponible (el modelo base whisper-small tiene ~244M; el adaptador LoRA añade una fracción menor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio (heredado de whisper-small) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Sinhala (inferido del nombre, no confirmado en la documentacion) |
| Licencia | No disponible |
| Formato de pesos | safetensors (segun los tags y el repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en `openai/whisper-small`, un transformer encoder-decoder entrenado para ASR multilingüe. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite ajustar el modelo a un dominio o idioma con un número reducido de parámetros entrenables. No se ha publicado información sobre el conjunto de datos de entrenamiento, el número de tokens, el régimen de entrenamiento (épocas, tasa de aprendizaje, etc.) ni si se emplearon técnicas como RLHF o DPO. La única referencia técnica es el uso de la librería PEFT 0.14.0, que es la herramienta estándar para crear adaptadores LoRA en el ecosistema Hugging Face.

## Capacidades

- Transcripción de audio a texto en idioma sinhala, presumiblemente, dado el nombre del modelo y la referencia a proyectos similares.
- Al estar basado en Whisper-small, hereda las capacidades generales de Whisper para el reconocimiento de voz, aunque el adaptador LoRA modifica los pesos para especializarse en sinhala.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades más allá del ASR.
- No se ha confirmado el soporte multilingüe; el adaptador está diseñado para un idioma concreto, aunque el modelo base sí es multilingüe.

## Casos de uso

- Transcripción de reuniones o entrevistas en sinhala: el modelo podría utilizarse para convertir grabaciones de audio en texto, facilitando la generación de actas o subtítulos. Su tamaño reducido (adaptador LoRA) permite ejecutarlo en hardware modesto.
- Subtitulado automático de vídeos en sinhala: integrado en un pipeline de procesamiento de vídeo, el modelo transcribiría el audio y generaría subtítulos sincronizados.
- Asistentes de voz para aplicaciones en sinhala: al ser un modelo ligero, podría desplegarse en entornos con recursos limitados para reconocer comandos de voz o dictados.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos en sinhala para hacerlos indexables y buscables.
- Investigación lingüística: análisis de corpus orales en sinhala mediante la conversión a texto, útil para estudios fonéticos o sociolingüísticos.
- Prototipos educativos: herramientas de aprendizaje de idiomas que requieran reconocer la pronunciación del estudiante en sinhala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas como WER (Word Error Rate), MMLU, HumanEval ni comparaciones con otros modelos ASR para sinhala. Cualquier afirmación sobre su precisión sería especulativa.

## Requisitos de hardware

- No se dispone de datos específicos sobre VRAM, latencia o throughput para este adaptador.
- Dado que el modelo base es whisper-small (~244M parámetros), una GPU con al menos 1-2 GB de VRAM en fp16 sería suficiente para la inferencia, y el adaptador LoRA añade una sobrecarga mínima.
- Es probable que funcione en GPUs de consumo como la RTX 3060 o superiores, e incluso en CPU con cuantización, aunque no hay confirmación.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft` en Python. También podría exportarse a formatos como GGUF para su uso con llama.cpp u Ollama, pero no se ha documentado.
- No se ha verificado la compatibilidad con vLLM o TGI, aunque al ser un modelo de audio, estas herramientas no son las habituales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dehanns/whisper-small-lora-sinhala-32` | No disponible (adaptador LoRA) | 30 s audio | No disponible | Hugging Face |
| `openai/whisper-small` | ~244M | 30 s audio | MIT | Hugging Face |
| `dehanns/whisper-small-sinhala` | ~0.2B (modelo completo) | 30 s audio | No disponible | Hugging Face |

El modelo base `whisper-small` es el punto de partida; el adaptador LoRA busca especializarse en sinhala, pero sin métricas no se puede saber si mejora al original en ese idioma. El otro modelo del mismo autor (`whisper-small-sinhala`) parece ser un fine-tuning completo, no un adaptador LoRA, y tampoco tiene documentación.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o errores específicos del modelo. Al ser un adaptador no evaluado, el riesgo de transcripciones incorrectas es alto.
- La licencia es desconocida, lo que impide determinar si puede usarse comercialmente. El modelo base tiene licencia MIT, pero el adaptador podría tener restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.
- No se ha documentado el proceso de entrenamiento, por lo que no se puede evaluar la calidad de los datos ni la posible presencia de sesgos en el corpus de sinhala.
- El tamaño del repositorio es 0.0 GB, lo que podría indicar que los pesos no están realmente disponibles o que el adaptador es extremadamente pequeño (aunque los safetensors suelen ocupar algunos MB). Esto debería verificarse antes de intentar su uso.

## Enlaces

- [Hugging Face - dehanns/whisper-small-lora-sinhala-32](https://huggingface.co/dehanns/whisper-small-lora-sinhala-32)
- [Hugging Face - dehanns/whisper-small-sinhala (modelo relacionado)](https://huggingface.co/dehanns/whisper-small-sinhala)
- [FriendliAI - página de despliegue del modelo](https://friendli.ai/models/dehanns/whisper-small-lora-sinhala)
- [GitHub - audio_papers/whisper (referencia a fine-tuning con LoRA para ASR)](https://github.com/dev-tr26/audio_papers/tree/main/whisper)
- [LinkedIn - Building a Sinhalese Speech Recognition Prototype with Whisper](https://www.linkedin.com/pulse/building-sinhalese-speech-recognition-prototype-kalana-hewapathirana-dwk4c)
