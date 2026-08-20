# agentic-ptb/grok.h015.sft-v5.step_200

## Resumen

`agentic-ptb/grok.h015.sft-v5.step_200` es un checkpoint intermedio del sweep de entrenamiento AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (~9,4B), orientado a tareas agénticas: uso de herramientas, razonamiento multi-paso y seguimiento de instrucciones en entornos de agente. El checkpoint fue capturado a las 15 horas de un run de entrenamiento de 100 horas (h015), con un *reasoning effort* configurado en `xhigh`.

La relevancia de este modelo reside en su papel como punto de control intermedio dentro de un barrido sistemático de entrenamiento: permite estudiar la evolución del rendimiento a lo largo del tiempo y comparar checkpoints de la misma familia. Sin embargo, presenta un defecto de empaquetado crítico: le falta el token EOS `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y sobrepase la ventana de contexto. Por tanto, no es apto para uso en producción sin un re-empaquetado previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del transformer denso `Qwen/Qwen3.5-9B-Base`. El entrenamiento se realizó sobre un dataset de trazas agénticas, probablemente derivado de AgentTrove (1,7M de trazas agénticas), que incluye interacciones multi-turno con herramientas, razonamiento encadenado y características de identidad del agente. El checkpoint corresponde a la hora 15 de un run de 100 horas (h015), con un *reasoning effort* fijado en `xhigh`, lo que sugiere que el modelo fue entrenado para generar cadenas de razonamiento extensas antes de responder.

La librería de entrenamiento se identifica como `grok`, aunque no se especifica si se trata de la infraestructura interna de xAI o de una librería propia de `agentic-ptb`. El checkpoint se guardó en el paso 200 del run (según el ID del repo), aunque la model card interna menciona `step_400` de un run `sft-v6`; existe una discrepancia entre el ID del repo (`sft-v5.step_200`) y el contenido de la model card (`sft-v6.step_400`), que debería aclararse con el autor.

Un defecto conocido afecta a todos los checkpoints de este sweep: el token EOS `248046` (`<|im_end|>`) no está incluido en la configuración de generación, por lo que el modelo no emite la marca de fin de turno y tiende a sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa sin re-empaquetado.

## Capacidades

- Generación de texto y razonamiento multi-paso: al estar entrenado con *reasoning effort* `xhigh`, el modelo está orientado a producir cadenas de pensamiento extensas antes de dar una respuesta final.
- Uso de herramientas (*tool calling*): el dataset agéntico incluye trazas con invocación de funciones, por lo que el modelo debería ser capaz de emitir llamadas a herramientas en formato estructurado.
- Seguimiento de instrucciones multi-turno: el entrenamiento SFT sobre trazas agénticas refuerza la capacidad de mantener el contexto conversacional y ejecutar acciones secuenciales.
- Capacidades multilingües: no disponibles; al derivar de Qwen3.5-9B-Base, podría heredar cierto soporte multilingüe, pero no se ha verificado.
- Capacidades especiales: no se reportan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Investigación de dinámicas de entrenamiento: este checkpoint permite analizar cómo evoluciona el rendimiento de un modelo agéntico a lo largo de un barrido de 100 horas, comparándolo con otros checkpoints de la misma familia (h022, h030, etc.) para trazar curvas de aprendizaje.
- Evaluación de estrategias de *reasoning effort*: al estar configurado con `xhigh`, puede usarse para estudiar el impacto del nivel de esfuerzo de razonamiento en la calidad de las respuestas en tareas agénticas.
- Desarrollo de pipelines de re-empaquetado: dado el defecto de EOS, el modelo sirve como caso de prueba para corregir la configuración de tokens especiales y validar metodologías de reparación de checkpoints.
- Benchmarking de checkpoints intermedios: puede compararse contra otros checkpoints del mismo sweep para identificar el punto óptimo de parada temprana en entrenamiento agéntico.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para continuar el entrenamiento con otros datasets o técnicas (DPO, RLHF) si se corrige el problema de EOS.
- Análisis de alucinación y sobre-generación: el defecto de EOS provoca que el modelo genere texto más allá del turno esperado, lo que puede utilizarse para estudiar patrones de sobre-generación y sus causas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que los números de evaluación de checkpoints con el defecto de EOS son un "suelo, no una medición", y solo deberían compararse con otros checkpoints que compartan el mismo estado de EOS.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 18,8 GB en safetensors (FP32/FP16). En FP16, la inferencia requiere al menos 20 GB de VRAM; con cuantización a 8 bits, ~10 GB; a 4 bits, ~5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA A100 (40/80 GB), RTX A6000 (48 GB) o RTX 4090 (24 GB) son suficientes. Para cuantización 4-bit, una RTX 3090/4090 (24 GB) o incluso una RTX 4060 Ti (16 GB) podrían ser viables.
- Si cabe en consumer GPU: sí, con cuantización 4-bit cabe en GPUs de consumo con 8-12 GB de VRAM, aunque con limitaciones de velocidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers. Dado el defecto de EOS, es necesario parchear la configuración de generación antes de servir el modelo.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `agentic-ptb/grok.h015.sft-v5.step_200` | 9,4B | no disponible | no disponible | Checkpoint intermedio con defecto de EOS |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible | no disponible | Modelo base sin fine-tuning |
| `Qwen/Qwen3.5-9B-Instruct` | 9,4B | no disponible | no disponible | Versión instruct del mismo base, presumiblemente sin defecto de EOS |

No se dispone de información suficiente para comparar rendimiento con otros modelos de la misma categoría (9B agénticos). La comparativa se limita a la relación con su modelo base y su variante instruct.

## Limitaciones y advertencias

- Defecto de empaquetado del token EOS: falta `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga las respuestas y sobrepase la ventana de contexto. Cualquier uso requiere re-empaquetar el modelo con la configuración correcta de tokens especiales.
- Checkpoint intermedio: no es un modelo final; su rendimiento es un punto en una curva de entrenamiento y puede ser inferior al de checkpoints posteriores.
- Licencia no especificada: no se indica la licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Idiomas no especificados: no se garantiza soporte multilingüe; el modelo puede comportarse de forma impredecible en idiomas distintos del inglés.
- Riesgo de alucinación: al ser un modelo agéntico entrenado con *reasoning effort* alto, puede generar razonamientos extensos pero incorrectos, especialmente en dominios fuera de sus datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estándar.
- Discrepancia en la model card: el ID del repo indica `sft-v5.step_200`, pero la model card interna menciona `sft-v6.step_400`; esto puede generar confusión sobre el origen exacto del checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h015.sft-v5.step_200
- Artículo sobre AgentTrove (MarkTechPost): https://www.marktechpost.com/2026/05/29/how-to-use-agenttrove-streaming-1-7m-agentic-traces-and-building-a-clean-sharegpt-sft-dataset-in-python/
- Documentación sobre Agentic SFT Dataset (emergentmind): https://www.emergentmind.com/topics/agentic-sft-dataset
- Sitio oficial de Grok: https://grok.com/
- Leaderboard BenchLM (agosto 2026): https://benchlm.ai/
- Artículo sobre Grok Build (dev.to): https://dev.to/siddhesh_surve/xai-just-dropped-grok-build-the-terminal-native-agentic-ai-changing-how-we-code-3bi1
