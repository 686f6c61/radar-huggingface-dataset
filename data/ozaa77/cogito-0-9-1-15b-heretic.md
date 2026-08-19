# ozaa77/Cogito-0.9.1-15B-Heretic

## Resumen

Cogito-0.9.1-15B-Heretic es un adaptador LoRA publicado por el usuario ozaa77, diseñado para ajustar el modelo base ozaa77/Cogito-0.9.1-15B. El nombre "Heretic" sugiere una variante orientada a un comportamiento menos restrictivo o más independiente respecto al modelo base. Según la descripción del repositorio asociado, la familia Cogito 0.9 se presenta como "una mente provisional, no un asistente sumiso", con un enfoque en dudar, verificar y razonar antes de responder.

El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) con pesos en safetensors, lo que indica que se trata de un ajuste de bajo rango sobre el modelo base de 15B parámetros. La ficha técnica del modelo base está prácticamente vacía, por lo que la mayoría de las especificaciones técnicas detalladas no están disponibles. El repositorio tiene un tamaño de 0.0 GB, lo que es consistente con un adaptador LoRA de pequeño tamaño en lugar de un modelo completo.

La relevancia de este modelo radica en su enfoque en el razonamiento crítico y la verificación de información, una tendencia creciente en el desarrollo de modelos de lenguaje open source. Sin embargo, la falta de documentación técnica y de datos de evaluación limita seriamente su aplicabilidad en entornos de producción sin un análisis previo exhaustivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ozaa77/Cogito-0.9.1-15B) |
| Parametros totales | no disponible (modelo base de 15B; adaptador LoRA de tamaño reducido) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La información disponible no permite determinar la arquitectura subyacente del modelo base Cogito-0.9.1-15B. El adaptador utiliza la librería PEFT 0.19.1 con la técnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en las capas de atención y feed-forward. Esta técnica reduce significativamente los requisitos de memoria y cómputo durante el ajuste fino.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, el régimen de entrenamiento (fp16, bf16, etc.) ni sobre el uso de técnicas como RLHF o DPO. La descripción del proyecto en GitHub menciona que el modelo "duda, verifica y razona antes de responder", lo que sugiere un entrenamiento orientado a mejorar la fiabilidad y el razonamiento crítico, pero no hay datos concretos que respalden esta afirmación.

## Capacidades

- Generación de texto: el modelo base es un transformer de 15B parámetros orientado a generación de texto, según el pipeline declarado (text-generation).
- Razonamiento crítico: según la descripción del proyecto, el modelo está diseñado para dudar, verificar y razonar antes de responder, en lugar de actuar como un asistente sumiso.
- Ajuste mediante LoRA: el adaptador permite modificar el comportamiento del modelo base sin necesidad de reentrenar todos los parámetros.
- Integración con transformers: compatible con el ecosistema Hugging Face transformers y PEFT.
- Capacidades adicionales (tool calling, agentes, multimodalidad, etc.): no disponibles.

## Casos de uso

- Evaluación de razonamiento crítico: investigadores pueden utilizar este adaptador para estudiar cómo el ajuste LoRA afecta al comportamiento de verificación y duda del modelo base en tareas de razonamiento.
- Experimentación con ajuste eficiente: desarrolladores interesados en PEFT pueden usar este adaptador como caso de estudio de LoRA aplicado a un modelo de 15B parámetros.
- Generación de texto con estilo alternativo: el sufijo "Heretic" sugiere un comportamiento menos restrictivo, útil para explorar variaciones en el tono y estilo de las respuestas.
- Investigación académica: el modelo puede servir como punto de partida para estudios sobre alineación, sesgos y comportamiento de modelos ajustados con LoRA.
- Desarrollo de prototipos: equipos que necesiten un punto de partida para ajustar un modelo de 15B con LoRA pueden usar este adaptador como referencia.
- Comparación de adaptadores: útil para comparar el rendimiento de diferentes adaptadores LoRA sobre el mismo modelo base en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador o su modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible. Un modelo base de 15B parámetros en fp16 requiere aproximadamente 30 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización a 8 bits se puede reducir a unos 15-16 GB, y a 4 bits a unos 8-9 GB.
- GPU recomendadas: para el modelo base completo en fp16 se necesitaría una GPU con al menos 32 GB (A100, H100, RTX 4090 con 24 GB no sería suficiente sin cuantización). Con cuantización 4-bit podría caber en una RTX 4090 (24 GB) o similar.
- Consumer GPU: el modelo base de 15B es demasiado grande para la mayoría de GPUs de consumo sin cuantización agresiva. Con GGUF de 4 bits podría ejecutarse en GPUs de 12-16 GB, pero no hay archivos GGUF publicados para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y el adaptador con la librería transformers y PEFT. No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Cogito-0.9.1-15B no tiene documentación pública con benchmarks, y el adaptador "Heretic" es una variante sin datos de evaluación. No se puede comparar con modelos de la misma categoría (por ejemplo, Llama-3-8B, Mistral-7B o Qwen-14B) sin datos objetivos.

## Limitaciones y advertencias

- Documentación ausente: la model card no contiene información sobre arquitectura, datos de entrenamiento, licencia o limitaciones. Esto impide evaluar la idoneidad del modelo para casos de uso concretos.
- Licencia desconocida: no se especifica la licencia, lo que impide determinar si el modelo puede usarse comercialmente o con restricciones.
- Riesgo de alucinación: sin datos de evaluación, no se puede estimar la tasa de alucinación del modelo.
- Sesgos desconocidos: no hay información sobre los datos de entrenamiento, por lo que los sesgos potenciales son imposibles de anticipar.
- Tamaño del repositorio: el adaptador ocupa 0.0 GB, lo que sugiere que podría tratarse de un archivo de pesos muy pequeño o que el repositorio está incompleto.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que podría indicar un error en los metadatos o un proyecto experimental.
- Sin soporte de la comunidad: con 0 descargas y 0 likes, el modelo no tiene adopción ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozaa77/Cogito-0.9.1-15B-Heretic
- Modelo base en Hugging Face: https://huggingface.co/ozaa77/Cogito-0.9.1-15B
- Repositorio del proyecto Cogito-0.9: https://github.com/AlGhozaliRamadhan/Cogito-0.9
- Página de despliegue en FriendliAI: https://friendli.ai/models/ozaa77/Cogito-0.9.1-15B
- Modelo Cogito-0.9 en Hugging Face: https://huggingface.co/ozaa77/Cogito-0.9
- Modelo Cogito-0.9-TRAIN en Hugging Face: https://huggingface.co/ozaa77/Cogito-0.9-TRAIN
