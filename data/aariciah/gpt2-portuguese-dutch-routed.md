# aariciah/gpt2-portuguese-dutch-routed

## Resumen

El modelo `gpt2-portuguese-dutch-routed` es un modelo de generación de texto basado en la arquitectura GPT-2, desarrollado por el usuario `aariciah`. Se trata de un fine-tuning del modelo `aariciah/gpt2-portuguese-20k-lc`, que a su vez es un GPT-2 adaptado al portugués. El nombre sugiere una orientación hacia el neerlandés ("dutch"), aunque no hay documentación que lo confirme. El modelo tiene 112.876.800 parámetros, lo que lo sitúa en la categoría de modelos pequeños, y se distribuye en formato safetensors. No se dispone de información sobre la longitud de contexto, los idiomas soportados, la licencia ni los datos de entrenamiento, más allá de que el dataset se indica como "None". Su relevancia actual es limitada: se trata de un experimento de fine-tuning sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parámetros totales | 112.876.800 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere portugués y neerlandés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `aariciah/gpt2-portuguese-20k-lc`, un GPT-2 con tokenizer adaptado al portugués en minúsculas. El proceso de entrenamiento se realizó con el Trainer de Transformers, usando el dataset indicado como "None", lo que sugiere que la model card está incompleta. Los hiperparámetros declarados incluyen una tasa de aprendizaje de 0.0004, batch size de entrenamiento de 64, gradientes acumulados en 4 pasos (batch efectivo de 256), optimizador AdamW torch fused, scheduler lineal con 1000 pasos de warm-up, y 1525 pasos de entrenamiento en precisión mixta nativa (Native AMP). No se documenta ninguna innovación técnica destacable más allá del ajuste fino estándar.

## Capacidades

- Generación de texto autoregresiva, como corresponde a la arquitectura GPT-2.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión ni audio.
- El nombre del modelo sugiere un posible enrutado entre portugués y neerlandés, pero no hay información que lo confirme.
- No se dispone de datos sobre soporte multilingüe real ni sobre calidad de generación en ninguno de los dos idiomas.

## Casos de uso

- Generación de textos cortos en portugués o neerlandés: el modelo puede completar frases o párrafos breves en estos idiomas, aunque su calidad no está evaluada.
- Chatbots de demostración: su tamaño reducido permite ejecutarlo en local para probar diálogos simples de un turno.
- Experimentación académica sobre transferencia entre idiomas: sirve como caso de estudio para analizar cómo un modelo portugués se adapta a otro idioma mediante fine-tuning.
- Herramientas de apoyo a la escritura: podría integrarse en editores de texto para sugerir continuaciones de frases en contextos educativos.
- Despliegue en entornos con recursos limitados: al tener ~113 millones de parámetros, es viable en CPUs o GPUs de gama baja para prototipos.
- Investigación en modelos con enrutado de idiomas: el nombre "routed" sugiere un mecanismo de selección de ruta entre idiomas, útil para estudiar arquitecturas de mezcla de expertos, aunque no hay documentación al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~450 MB en FP32 y ~230 MB en FP16/BF16, según el número de parámetros (112M).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (RTX 3060, GTX 1660, etc.). También puede ejecutarse en CPU.
- ¿Cabe en GPU de consumo? Sí, incluso en GPUs integradas o de gama baja.
- Opciones de despliegue: Transformers, vLLM, TGI. Puede convertirse a GGUF para llama.cpp, aunque no se ha verificado la compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aariciah/gpt2-portuguese-dutch-routed | 112.876.800 | no disponible | no disponible | HuggingFace |
| aariciah/gpt2-portuguese-dutch-first | no disponible | no disponible | no disponible | HuggingFace |
| aariciah/gpt2-portuguese-dutch-configC-6k | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- No hay documentación sobre los datos de entrenamiento ni el proceso de fine-tuning, lo que impide evaluar sesgos.
- El dataset de entrenamiento se indica como "None", lo que sugiere que la model card no se completó correctamente.
- La licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido.
- El modelo no tiene benchmarks publicados, por lo que su rendimiento real es desconocido.
- Los modelos generativos pequeños como GPT-2 tienden a producir alucinaciones y textos incoherentes en tareas complejas.
- No se ha documentado el soporte de tool calling, agentes ni otras capacidades avanzadas.
- El tamaño del repositorio (5.0 GB) es desproporcionado para el número de parámetros, lo que sugiere que puede contener archivos adicionales o checkpoints sin documentar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aariciah/gpt2-portuguese-dutch-routed
- Modelo base: https://huggingface.co/aariciah/gpt2-portuguese-20k-lc
- Modelos similares:
  - https://huggingface.co/aariciah/gpt2-portuguese-dutch-first
  - https://huggingface.co/aariciah/gpt2-portuguese-dutch-configC-6k
