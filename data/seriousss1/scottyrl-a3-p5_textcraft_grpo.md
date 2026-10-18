# Seriousss1/scottyrl-a3-p5_textcraft_grpo

## Resumen

Seriousss1/scottyrl-a3-p5_textcraft_grpo es un adaptador LoRA de rango 32 sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo autónomo: se distribuye como un artefacto PEFT de aproximadamente 0,2 GB y requiere cargar el modelo base para su uso. Lo publica el usuario Seriousss1 en el contexto de la asignatura 11-768 (AI Agents, CMU), Assignment 3, con el framework de entrenamiento scottyrl.

El adaptador se orienta a tareas del entorno TextCraft-Synth. La model card describe la evaluación sobre las particiones de validación medium y hard, sirviendo el adaptador con vLLM y ejecutando un script de evaluación con k=4. El nombre del run, p5_textcraft_grpo, sugiere el uso de GRPO, aunque la documentación no detalla el algoritmo, los datos de entrenamiento ni el número de tokens consumidos.

Su relevancia es principalmente reproducible y docente: permite estudiar el entrenamiento de agentes con PEFT y RL sobre un modelo de 4B, comparar checkpoints y probar infraestructura de servicio multi-LoRA con vLLM. La información pública es muy limitada: no hay licencia, idiomas, contexto, benchmarks numéricos ni resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 32 sobre Qwen/Qwen3.5-4B; la arquitectura del modelo base no se documenta en la información disponible |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina Qwen3.5-4B, lo que sugiere 4.000 millones de parámetros, no confirmado |
| Parámetros activos | No aplica: no es un modelo MoE; es un adaptador LoRA |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y la cuantización se aplicaría al modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-4B |
| Rango LoRA | 32 |
| Tamaño del repositorio | 0,2 GB |
| Librería | peft |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32, según indica la model card, aplicado sobre Qwen/Qwen3.5-4B. No se especifican los módulos objetivo, el valor de alpha, el dropout ni las capas adaptadas. El repositorio contiene únicamente los pesos del adaptador en safetensors, por lo que no puede ejecutarse sin el modelo base y una librería compatible con PEFT, como vLLM con soporte LoRA.

El entrenamiento se realizó con el framework scottyrl en el marco de la asignatura 11-768 (AI Agents, CMU), Assignment 3. La model card cita el run p5_textcraft_grpo, la configuración configs/p5_textcraft_grpo.yaml, la exportación desde tinker://model_5648e059/v50 y el commit ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e. No se documentan el número de tokens, la composición del dataset, el uso de RLHF/DPO ni los detalles de GRPO; el sufijo grpo del nombre es la única indicación del algoritmo. Tampoco se describe ninguna innovación arquitectónica: se trata de un adaptador PEFT para especialización sobre un modelo preentrenado.

## Capacidades

- Especialización en TextCraft-Synth: el adaptador está entrenado y evaluado para las particiones medium y hard de este entorno de crafting basado en texto, según la model card.
- Generación de texto: hereda las capacidades del modelo base Qwen/Qwen3.5-4B, aunque no se incluyen evaluaciones específicas en la información disponible.
- Razonamiento multi-paso: el entorno TextCraft-Synth requiere planificación, pero no hay datos cuantitativos sobre el rendimiento del adaptador en tareas generales de razonamiento.
- Tool calling / function calling: no documentado.
- Uso como agente: el artefacto se enmarca en una asignatura de agentes de IA, pero no se especifican herramientas, protocolos ni capacidades agénticas generales.
- Capacidades multilingües: no disponibles.
- Visión, audio u otras modalidades: no documentadas; el modelo base se usa como modelo de texto.
- Servicio con vLLM: la model card proporciona comandos compatibles con LoRA multi-adaptador, incluyendo --enable-lora, --max-lora-rank 32 y --lora-modules.
- No es un modelo autónomo: requiere el modelo base y un servidor o librería que aplique el adaptador.

## Casos de uso

- Reproducción de la evaluación del curso: servir el adaptador con vLLM y ejecutar scripts/evaluate_checkpoint.py sobre las particiones medium y hard de TextCraft-Synth con k=4, tal como indica la model card. Es adecuado porque el artefacto se publica precisamente para ese protocolo.
- Baseline en experimentos de RL para agentes: comparar este checkpoint GRPO con otros adaptadores o con el modelo base sin adaptar en la misma tarea. Su utilidad está en que el run, la configuración y el commit quedan identificados.
- Estudio de PEFT con rango 32: analizar el efecto del rango LoRA y del entrenamiento con scottyrl sobre un modelo de 4B. El repositorio permite cargar el adaptador y examinar su comportamiento sin modificar el base.
- Docencia y talleres: demostrar el ciclo completo de entrenamiento, exportación desde Tinker, publicación en Hugging Face y servicio con vLLM. Es un ejemplo realista de adaptador de curso con comandos de evaluación incluidos.
- Pruebas de infraestructura multi-LoRA: validar el soporte de vLLM para cargar un adaptador de rango 32 junto al modelo base, medir latencia y comprobar el enrutamiento por nombre de módulo.
- Evaluación de robustez en entornos sintéticos: usar las particiones medium y hard de TextCraft-Synth para estudiar generalización y sobreajuste de un adaptador entrenado en un dominio estrecho.
- Ablaciones de configuración: modificar parámetros del archivo configs/p5_textcraft_grpo.yaml y repetir la evaluación con k=4 para analizar sensibilidad al checkpoint y al protocolo de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo describe el protocolo de evaluación: servir el adaptador con vLLM y ejecutar el script del curso sobre las particiones medium y hard de TextCraft-Synth con k=4. No se incluyen puntuaciones numéricas, comparaciones con el modelo base ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay mediciones del autor. Como referencia orientativa para un modelo base de 4B, en FP16/BF16 los pesos ocupan aproximadamente 8 GB y el total con caché KV y overhead de servidor suele situarse en 10-12 GB; en INT8, alrededor de 6-8 GB; en INT4, alrededor de 4-6 GB. La cifra exacta depende del contexto, del backend y de si se sirve el adaptador junto al base.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para servicio con vLLM y concurrencia; RTX 4090 o RTX 3090 de 24 GB para FP16/BF16 con margen; GPU de 16 GB para FP16 con contexto moderado; GPU de 8-12 GB requiere cuantización del base o contextos cortos.
- Cabe en GPU de consumo: sí, siempre que se use el modelo base en el tamaño y la cuantización adecuados. El adaptador en sí ocupa aproximadamente 0,2 GB en el repositorio.
- Despliegue: vLLM es el backend documentado, con --enable-lora, --max-lora-rank 32 y --lora-modules a3=Seriousss1/scottyrl-a3-p5_textcraft_grpo. TGI no está confirmado para este adaptador. llama.cpp u Ollama requerirían fusionar el adaptador con el base y convertir el resultado a GGUF; no se documenta ese flujo.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo (este adaptador) | No disponible; LoRA de rango 32 sobre un base denominado 4B | No disponible | Sin datos numéricos; evaluado en TextCraft-Synth medium/hard con k=4 | No disponible | Hugging Face; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-4B (base sin adaptar) | 4B según denominación; no confirmado | No disponible | No disponible | No disponible | Hugging Face |
| Otros adaptadores LoRA para TextCraft-Synth | No disponible | No disponible | No disponible | No disponible | No identificados en la información proporcionada |

No se han identificado en la información disponible modelos comparables con especificaciones verificables. La comparación principal posible es contra el modelo base sin adaptar, pero no hay resultados públicos que cuantifiquen la mejora.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso para uso comercial, redistribución o modificación. La licencia del modelo base Qwen/Qwen3.5-4B debe verificarse por separado.
- Model card mínima: no se documentan idiomas, longitud de contexto, datos de entrenamiento, número de tokens, hiperparámetros de LoRA ni detalles de GRPO.
- Artefacto dependiente: no es un modelo autónomo; requiere Qwen/Qwen3.5-4B, PEFT y, para el flujo documentado, vLLM con soporte LoRA.
- Tarea estrecha: el entrenamiento se orienta a TextCraft-Synth; el rendimiento en tareas generales de texto, código, matemáticas o agentes reales no está evaluado.
- Riesgo de sobreajuste: un adaptador de rango 32 entrenado en un entorno sintético puede generalizar mal fuera de las particiones medium y hard descritas.
- Riesgo de alucinación: no se documenta ningún proceso de alineación o mitigación específico; el comportamiento heredado del base no está evaluado en esta ficha.
- Sesgos: no documentados. Al heredar el modelo base, pueden persistir sesgos no medidos en esta publicación.
- Validación externa limitada: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones independientes.
- Uso en producción: es un artefacto de curso sin garantías de soporte, mantenimiento, seguridad o latencia. No se recomienda como componente crítico sin una evaluación propia.
- Compatibilidad: no se confirma que funcione con otras versiones, cuantizaciones o servidores distintos del flujo vLLM indicado. El tag 11-768 hace referencia a la asignatura, no al tamaño del modelo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Seriousss1/scottyrl-a3-p5_textcraft_grpo
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Configuración citada: configs/p5_textcraft_grpo.yaml (ruta relativa; no se proporciona URL pública)
- Script de evaluación citado: scripts/evaluate_checkpoint.py (ruta relativa; no se proporciona URL pública)
- Export original: tinker://model_5648e059/v50 (URI interna; no es una URL web)
- No se han proporcionado papers, blogs, repositorios o demos adicionales en la información disponible.
