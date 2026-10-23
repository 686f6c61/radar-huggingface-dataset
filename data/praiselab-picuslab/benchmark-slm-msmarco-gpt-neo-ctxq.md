# praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-ctxq

## Resumen

`benchmark-slm-msmarco-gpt-neo-ctxq` es un adaptador LoRA publicado por `praiselab-picuslab` sobre el modelo base `EleutherAI/gpt-neo-1.3B`. Según los metadatos de HuggingFace, está asociado al dataset `microsoft/ms_marco` y a una estrategia denominada `ctxq`, dentro de un conjunto de experimentos etiquetado como `benchmark-slm`. No es un modelo entrenado desde cero: requiere cargar el modelo base y aplicar el adaptador mediante PEFT.

El interés principal es la reproducibilidad de experimentos con modelos de lenguaje pequeños (SLM) en generación de texto y, previsiblemente, en tareas de pregunta-respuesta o ranking sobre MS MARCO, aunque la ficha no documenta el objetivo exacto ni los resultados. El repositorio figura como restringido (gated), con 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que obliga a verificar la disponibilidad real de los pesos antes de utilizarlo.

Por su tamaño —1.3B parámetros en el modelo base— y su formato de adaptador, es relevante para pruebas de bajo coste en una GPU consumer, no para despliegues de alta exigencia. La ausencia de licencia, benchmarks y detalles de entrenamiento limita seriamente su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-Neo) con adaptador LoRA (PEFT) |
| Parámetros totales | 1.3B en el modelo base; parámetros del adaptador no disponibles |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens según el modelo base GPT-Neo-1.3B; no confirmado para el adaptador |
| Tipos de cuantización | no disponible para el adaptador; el modelo base admite cuantización con herramientas externas, no especificada en la ficha |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT); pesos del modelo base no incluidos |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `EleutherAI/gpt-neo-1.3B`, un transformer decoder-only denso. El adaptador es de tipo LoRA y se distribuye en formato PEFT con pesos safetensors. Los tags indican el dataset `microsoft/ms_marco` y la estrategia `ctxq`, pero no se especifican capas adaptadas, rango, alpha, número de tokens de entrenamiento, composición exacta del dataset ni si hubo RLHF o DPO.

No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas. Tampoco se detalla si el adaptador se entrenó para generación de respuestas, ranking de pasajes, reescritura de consultas u otra tarea concreta sobre MS MARCO.

## Capacidades

- Generación de texto en inglés, según el pipeline `text-generation` y el tag de idioma `en`.
- Especialización probable en tareas vinculadas a MS MARCO, como pregunta-respuesta, ranking de pasajes o recuperación de información; no confirmada en la ficha.
- Compatibilidad con el ecosistema PEFT para cargar el adaptador sobre el modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los metadatos indican únicamente inglés.
- No se documenta visión, audio, modo de razonamiento explícito ni otras capacidades especiales.

## Casos de uso

- Replicación de experimentos de benchmark con SLM: cargar el adaptador con PEFT sobre GPT-Neo-1.3B y reproducir las condiciones del experimento `benchmark-slm` sobre MS MARCO, siempre que los pesos estén disponibles y se conozca la configuración exacta.
- Evaluación comparativa base vs adaptador: medir si el entrenamiento LoRA mejora la generación o el ranking en consultas en inglés, usando el modelo base como referencia y un conjunto de validación propio.
- Prototipos de pregunta-respuesta extractiva en inglés: emplear el adaptador para generar respuestas condicionadas a pasajes de MS MARCO y validar la calidad antes de cualquier uso real.
- Generación aumentada por recuperación (RAG) de bajo coste: combinar un recuperador externo con el modelo base y el adaptador para responder preguntas en inglés sobre un corpus pequeño, con requisitos de hardware moderados.
- Investigación sobre estrategias de contexto de consulta: analizar el efecto de la estrategia `ctxq` en la formulación de consultas y en la generación, comparando resultados con y sin adaptador.
- Formación y experimentación con LoRA/PEFT: usar el repositorio como ejemplo práctico de adaptación de un modelo de 1.3B en cursos, talleres o pruebas de laboratorio.
- Despliegue de bajo coste en una GPU consumer: ejecutar generación de texto en inglés con cuantización del modelo base para tareas no críticas, asumiendo las limitaciones de contexto y calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño del modelo base: aproximadamente 2,6 GB solo para pesos en FP16; 3,5-5 GB con overhead, KV cache y batch pequeño.
- En INT8: aproximadamente 1,3 GB de pesos; 2-3 GB de VRAM total estimada.
- En INT4: aproximadamente 0,7 GB de pesos; 1,5-2 GB de VRAM total estimada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para inferencia y pruebas; A100 o H100 para lotes mayores o evaluación sistemática.
- Cabe en GPU consumer: sí, especialmente en FP16 con 8 GB o más, y en INT8/INT4 con 4-6 GB, siempre que se use el modelo base cuantizado.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM con soporte de adaptadores LoRA; TGI si se configura con PEFT; llama.cpp u Ollama solo si se convierte y mergea el adaptador a GGUF, algo que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador | 1.3B base + LoRA; tamaño del adaptador no disponible | 2048 (base) | no disponible | restringido (gated) | no disponible |
| EleutherAI/gpt-neo-1.3B | 1.3B | 2048 | MIT | público | no incluido en la información |
| GPT-2 XL 1.5B | 1.5B | 1024 | MIT | público | no incluido en la información |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | público | no incluido en la información |

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si se permite uso comercial, redistribución o modificación.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace y puede no estar disponible para todos los usuarios.
- El repositorio figura con 0.0 GB y 0 descargas; es posible que los pesos del adaptador no estén publicados o que la ficha esté incompleta. Verificar tras aceptar el acceso.
- No hay documentación sobre datos de entrenamiento, hiperparámetros, evaluación o criterios de selección del checkpoint.
- No hay benchmarks publicados; no puede afirmarse que mejore al modelo base ni a alternativas similares.
- El modelo base GPT-Neo-1.3B es antiguo y tiene un contexto de 2048 tokens, inferior al de modelos actuales; puede mostrar un rendimiento limitado en tareas complejas.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- El adaptador parece específico de MS MARCO; es probable que generalize mal fuera de ese dominio.
- Riesgo de alucinación y sesgos heredados del modelo base y del dataset; no se documenta alineación o filtrado de seguridad.
- No se recomienda su uso en producción sin una evaluación propia de calidad, sesgos, seguridad y licencia.
- La estrategia `ctxq` no está definida en la información disponible, lo que dificulta la reproducibilidad del experimento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-ctxq)
- [Modelo base EleutherAI/gpt-neo-1.3B](https://huggingface.co/EleutherAI/gpt-neo-1.3B)
- [Dataset microsoft/ms_marco](https://huggingface.co/datasets/microsoft/ms_marco)
- [Documentación de PEFT](https://huggingface.co/docs/peft/index)

No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
