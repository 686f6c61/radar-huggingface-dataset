# aliahmed463/smollm3-lora-sft

## Resumen

smollm3-lora-sft es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario aliahmed463 sobre el modelo base HuggingFaceTB/SmolLM3-3B-Base. Se trata, por tanto, de un fine-tuning ligero de un modelo de 3.000 millones de parámetros desarrollado originalmente por Hugging Face, orientado a tareas de instrucción y conversación. El repositorio tiene un tamaño de 0,3 GB, lo que confirma que contiene únicamente los pesos del adaptador y no una copia completa del modelo base.

El modelo se ha entrenado con la librería TRL (versión 1.17.1) siguiendo el flujo habitual del curso smol-course de Hugging Face, y se distribuye en formato safetensors compatible con transformers. Su relevancia es limitada: se trata de un experimento de fine-tuning con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de evaluación publicados.

No hay información disponible sobre la composición del dataset de SFT, el número de tokens de entrenamiento, los hiperparámetros del LoRA (rango, alpha, módulos objetivo) ni las capacidades finales del adaptador. Cualquier evaluación de su calidad requiere ejecutarlo junto al modelo base y compararlo con SmolLM3-3B en su versión instructiva oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B-Base); el repositorio contiene un adaptador LoRA, no los pesos completos |
| Parametros totales | 3B en el modelo base; parámetros del adaptador no disponibles (repo de 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base SmolLM3-3B soporta contextos largos, pero el adaptador no documenta cambios) |
| Tipos de cuantizacion | no disponible (solo safetensors del adaptador; la cuantización dependería del modelo base fusionado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar; el modelo base SmolLM3 se publica bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador LoRA, `generated_from_trainer`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM3-3B-Base, un transformer decoder-only de 3.000 millones de parámetros de Hugging Face. El entrenamiento se realizó mediante SFT con TRL 1.17.1, Transformers 5.22.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. La model card no especifica el dataset utilizado, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni si se congelaron todos los pesos base.

No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos ni fases de RLHF/DPO). El pipeline de entrenamiento parece ser el estándar del curso smol-course, orientado a demostrar el flujo de fine-tuning con LoRA más que a producir un modelo de producción.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card usa el pipeline de `text-generation` con mensajes en formato chat (`role`/`content`), lo que sugiere que el adaptador fue entrenado para seguir instrucciones en ese formato.
- Razonamiento y respuesta a preguntas abiertas: el prompt de ejemplo es una pregunta hipotética abierta, lo que indica un objetivo de instrucción general.
- Capacidades heredadas del modelo base: al ser un adaptador sobre SmolLM3-3B-Base, conserva el conocimiento y las capacidades del base, pero no hay evaluación que confirme que el SFT las preserve o las mejore.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Experimentación educativa con LoRA y TRL: el adaptador sirve como ejemplo reproducible de un flujo SFT completo sobre un modelo de 3B, útil para quienes siguen el smol-course y quieren inspeccionar los artefactos generados.
- Prototipado rápido de asistentes conversacionales: al cargarse junto al base con `device_map="auto"`, permite probar respuestas de chat en una GPU consumer sin necesidad de servir un modelo mayor.
- Base para fine-tunings posteriores: al ser un adaptador pequeño (0,3 GB), se puede fusionar con el base y continuar el entrenamiento con DPO o RLHF en entornos con recursos limitados.
- Evaluación comparativa de técnicas de SFT: útil en investigación para medir el impacto de un adaptador LoRA frente al modelo base o frente a SmolLM3-3B-Instruct en tareas de instrucción.
- Despliegue en entornos con restricciones de memoria: fusionado y cuantizado a 4 bits, un modelo de 3B cabe en GPUs de 8 GB, lo que permite probar el adaptador en portátiles con RTX 4060/4070.
- Generación de texto en pipelines de demostración: para aplicaciones internas o demos donde no se requiere calidad de producción y se prioriza el coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo no es inferible de forma autónoma; requiere cargar SmolLM3-3B-Base. En FP16, el base ocupa aproximadamente 6 GB; fusionado y cuantizado a 4 bits, alrededor de 2 GB.
- GPU recomendadas: A100 o H100 para entrenamiento o serving a gran escala; RTX 4090 (24 GB) para inferencia en FP16 sin problemas; RTX 3090/4080 (16-24 GB) también suficientes.
- GPU consumer: sí cabe en GPUs de 8 GB si se cuantiza el modelo fusionado a 4 bits (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070).
- Opciones de despliegue: transformers con `pipeline` y `device_map="auto"` (documentado en la model card); vLLM, TGI, llama.cpp u Ollama requerirían fusionar el adaptador con el base y convertir a los formatos correspondientes, algo no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aliahmed463/smollm3-lora-sft | 3B (base) + adaptador LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador SFT experimental, sin evaluación |
| HuggingFaceTB/SmolLM3-3B-Base | 3B | contexto largo (según model card oficial) | Apache-2.0 | Hugging Face, ampliamente descargado | Modelo base oficial, sin instrucciones |
| HuggingFaceTB/SmolLM3-3B-Instruct | 3B | contexto largo (según model card oficial) | Apache-2.0 | Hugging Face | Versión instructiva oficial, evaluada por Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32K tokens (según documentación oficial) | Apache-2.0 | Hugging Face | Alternativa consolidada de tamaño similar |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni comparación con el base, ni métricas de pérdida de validación publicadas.
- Licencia no declarada de forma explícita: la model card incluye `licence: license` sin concretar, lo que impide confirmar si el uso comercial está permitido; habría que verificar la licencia del base (Apache-2.0) y asumir que el adaptador no la contradice, pero no está garantizado.
- Dataset de entrenamiento desconocido: no se puede evaluar el riesgo de sesgos, contaminación de benchmarks ni calidad de las respuestas.
- Riesgo de alucinación: inherente a los modelos de 3B y no mitigado de forma documentada en este adaptador.
- Idiomas no documentados: no se puede afirmar que el adaptador mantenga el multilingüismo del base.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validación externa.
- El adaptador no es autónomo: requiere el modelo base SmolLM3-3B-Base y una fusión previa para desplegarse en motores distintos de transformers.
- Sin información sobre hiperparámetros del LoRA: no se puede reproducir el entrenamiento ni estimar su estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliahmed463/smollm3-lora-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Repositorio de TRL: https://github.com/huggingface/trl
- Curso smol-course (referenciado en los tags): https://github.com/huggingface/smol-course
