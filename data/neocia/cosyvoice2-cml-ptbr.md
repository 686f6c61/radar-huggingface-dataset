# neocia/cosyvoice2-cml-ptbr

## Resumen

El modelo `neocia/cosyvoice2-cml-ptbr` es un checkpoint intermedio de adaptación de dominio del sistema de síntesis de voz CosyVoice2-0.5B, desarrollado por el usuario neocia sobre la base del modelo multilingüe de FunAudioLLM. Este checkpoint se ha entrenado con el subconjunto en portugués del dataset CML-TTS (audiolibros, 24 kHz) y sirve como punto de partida para fine-tunings posteriores orientados al portugués brasileño, como los publicados en los repositorios `cosyvoice2-cml-nurc-prosodic` y `cosyvoice2-cml-nurc-automatic`.

CosyVoice2 es una arquitectura de generación de voz a gran escala que combina un modelo de lenguaje (LM) de texto a voz con un modelo de flow matching causal. Su relevancia actual radica en que permite síntesis en streaming y no streaming con un único modelo, manteniendo alta naturalidad prosódica y consistencia del hablante mediante aprendizaje en contexto. En esta adaptación concreta, solo el componente `llm` ha sido ajustado al portugués mediante entrenamiento continuado, mientras que el componente `flow` conserva los pesos multilingües originales.

El repositorio tiene un tamaño de 4,1 GB, está licenciado bajo Apache 2.0 y está pensado para el pipeline de text-to-speech. Es un checkpoint intermedio, no un modelo final, por lo que su uso directo en producción requiere considerar que aún no ha pasado por los fine-tunings específicos del corpus NURC-SP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM de texto a voz (backbone LLM preentrenado) + flow matching causal con conciencia de chunks |
| Parametros totales | 0,5 mil millones (basado en CosyVoice2-0.5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y onnx) |
| Idiomas soportados | Portugues (adaptacion especifica); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

CosyVoice2 emplea un modelo de lenguaje de texto a voz (text-speech LM) que utiliza directamente LLMs preentrenados como backbone, simplificando la arquitectura del modelo original. A continuacion, un modelo de flow matching causal con conciencia de chunks (chunk-aware causal flow matching) se encarga de generar las caracteristicas acusticas, permitiendo tanto sintesis en streaming como no streaming dentro del mismo modelo. Esta combinacion fue presentada en el articulo "CosyVoice 2: Scalable Streaming Speech Synthesis with Large Language Models" (arXiv:2412.10117).

En esta adaptacion concreta, se realizo un entrenamiento continuado (continued training) del componente `llm` sobre el subset portugues del dataset CML-TTS, compuesto por audiolibros muestreados a 24 kHz. El componente `flow` no fue adaptado en esta etapa, manteniendo el checkpoint multilingue original. No se mencionan tecnicas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de voz a partir de texto en portugues (adaptacion de dominio especifica).
- Sintesis en streaming y no streaming con un unico modelo, gracias al diseño de flow matching causal.
- Aprendizaje en contexto (in-context learning) para mantener la consistencia del hablante y la naturalidad prosodica, herencia de CosyVoice2.
- Soporte multilingue en el modelo base, aunque esta adaptacion se centra en portugues.
- Capacidad de clonacion de voz con pocos ejemplos (funcionalidad tipica de CosyVoice2, no verificada en este checkpoint).
- Formato de pesos en safetensors y onnx, facilitando la integracion en diferentes entornos de inferencia.

## Casos de uso

- Generacion de audiolibros en portugues: el modelo puede producir narraciones largas y coherentes a partir de texto, aprovechando la adaptacion al dominio de audiolibros del CML-TTS.
- Asistentes de voz en portugues brasileño: al ser un checkpoint ligero (0,5B), puede desplegarse en entornos con recursos limitados para aplicaciones de lectura en voz alta o interaccion por voz.
- Pre-entrenamiento para fine-tuning en dominios especificos: este checkpoint intermedio sirve como base para ajustes posteriores en corpus como NURC-SP, permitiendo desarrollar voces con caracteristicas prosodicas concretas.
- Sintesis de voz para aplicaciones de accesibilidad: lectura de pantalla o contenido web en portugues, con posibilidad de ajustar el hablante mediante ejemplos de voz.
- Desarrollo de sistemas de doblaje automatico: al mantener la consistencia del hablante, puede usarse para generar voces en portugues a partir de referencias de audio.
- Investigacion en adaptacion de modelos TTS multilingues: util para estudiar el impacto del entrenamiento continuado en el componente LLM sin modificar el flujo de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint es intermedio y no incluye metricas de evaluacion objetiva (MOS, WER, etc.) en su model card.

## Requisitos de hardware

- Al tratarse de un modelo de 0,5 mil millones de parametros, la inferencia es ligera en comparacion con modelos TTS de mayor tamano.
- VRAM estimada: no disponible en la informacion proporcionada; para un modelo de este tamano en FP16, se estima un consumo de aproximadamente 1-2 GB, pero no se ha confirmado.
- GPU recomendadas: no se especifican; una GPU con 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) podria ser suficiente para inferencia no optimizada.
- Opciones de despliegue: el repositorio incluye pesos en safetensors y onnx, lo que permite usar librerias como Transformers, ONNX Runtime o el propio repositorio de CosyVoice (https://github.com/FunAudioLLM/CosyVoice).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neocia/cosyvoice2-cml-ptbr | 0,5B | no disponible | Portugues (adaptado) | Apache 2.0 | HuggingFace |
| FunAudioLLM/CosyVoice2-0.5B | 0,5B | no disponible | Multilingue | Apache 2.0 | HuggingFace |
| Coqui XTTS v2 | 0,8B (aprox.) | no disponible | Multilingue (incluye portugues) | CPML (no comercial) | HuggingFace |

La comparativa se limita a modelos de sintesis de voz multilingues de tamano similar. CosyVoice2-0.5B es el modelo base sin adaptar; XTTS v2 es una alternativa comercial con licencia restrictiva. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: no ha sido evaluado ni optimizado para produccion directa.
- El componente `flow` no ha sido adaptado al portugues, por lo que la prosodia y la naturalidad pueden verse afectadas en comparacion con un modelo completamente adaptado.
- No se han publicado metricas de calidad (MOS, inteligibilidad) para este checkpoint.
- Riesgo de errores de pronunciacion en portugues debido al entrenamiento limitado al dominio de audiolibros; puede fallar en registros coloquiales o tecnicos.
- No se especifican limitaciones de contexto ni de longitud de audio; se recomienda probar con secuencias largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base CosyVoice2 tiene su propia licencia (Apache 2.0) que debe respetarse.
- Al ser un modelo de 0,5B, la calidad de voz puede ser inferior a modelos mas grandes en tareas complejas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neocia/cosyvoice2-cml-ptbr
- Modelo base: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Dataset CML-TTS: https://huggingface.co/datasets/ylacombe/cml-tts
- Repositorio oficial CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Paper CosyVoice 2: https://arxiv.org/abs/2412.10117
- Pagina del proyecto CosyVoice2: https://fun-audio-llm.github.io/cosyvoice2/
- Repositorio alternativo (Render-AI-Team): https://github.com/Render-AI-Team/CosyVoice2
- Checkpoints derivados: https://huggingface.co/neocia/cosyvoice2-cml-nurc-prosodic y https://huggingface.co/neocia/cosyvoice2-cml-nurc-automatic
