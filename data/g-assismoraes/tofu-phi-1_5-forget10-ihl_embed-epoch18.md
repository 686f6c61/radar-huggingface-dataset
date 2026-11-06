# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch18

## Resumen

Este checkpoint es el resultado de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictional Unlearning), aplicado al modelo Phi-1.5 de Microsoft. Lo publica el usuario g-assismoraes en Hugging Face y corresponde a la epoca 18 de 20 de un proceso de desaprendizaje selectivo. No es un modelo de proposito general, sino un artefacto de investigacion para estudiar como se puede eliminar informacion concreta de un modelo ya entrenado sin destruir el resto de sus capacidades.

La receta combina dos tecnicas: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir del Phi-1.5 original de Microsoft, mientras que el resto de pesos del transformer se mantienen del checkpoint `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre TOFU). Sobre esa base se aplica una perdida de tipo *Token IHL* sobre el conjunto *forget* mas un termino de entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

Con 1.418 millones de parametros y un repositorio de 2,8 GB en safetensors, es un modelo pequeno pensado para reproducir y auditar metodologias de unlearning. Su interes es metodologico, no de producto: sirve para evaluar si el olvido es efectivo y si el modelo conserva utilidad en el resto del conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Phi-1.5, familia Phi de Microsoft) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-1.5; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre TOFU, y conserva todos los pesos del transformer de ese checkpoint. La intervencion clave es que los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, lo que separa la representacion de tokens de la parte profunda del modelo. Sobre esa configuracion se entrena con una perdida combinada: *Token IHL* (una variante de *influence/hinge loss* aplicada a nivel de token) sobre el conjunto *forget* de TOFU mas un termino de entropia cruzada con coeficiente 1.0 sobre el conjunto *retain*.

El checkpoint corresponde a la epoca 18 de 20 del proceso de unlearning. La model card indica que es un modelo completo e independiente y remite a un `ihl_manifest.json` (no incluido en la informacion disponible) para los detalles del experimento. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO; TOFU es un benchmark de unlearning con datos ficticios de autores, pero su composicion concreta en este fine-tuning no se detalla.

## Capacidades

- Generacion de texto en ingles, heredada de la base Phi-1.5.
- Razonamiento basico y respuesta a preguntas de dominio general (capacidad residual del modelo base).
- Generacion de codigo sencillo, dado el entrenamiento original de Phi-1.5 en datos de codigo.
- Capacidad de *machine unlearning* demostrativa: el modelo ha sido entrenado para olvidar el subconjunto *forget10* de TOFU.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Investigacion en *machine unlearning*: usar el checkpoint como referencia para medir la eficacia del olvido sobre el conjunto *forget10* de TOFU y comparar con otras recetas (gradient ascent, NPO, etc.).
- Auditoria de privacidad: evaluar si la reinicializacion de embeddings y LM head reduce la fuga de informacion sensible en comparacion con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Reproducibilidad de experimentos: al ser un checkpoint completo y standalone, permite repetir evaluaciones sin reentrenar desde cero.
- Estudio de equilibrio olvido/utilidad: el termino CE sobre *retain* con peso 1.0 permite analizar el compromiso entre borrar el conjunto *forget* y preservar el rendimiento general.
- Baseline para comparativas de metodos: util como punto de comparacion en publicaciones que propongan nuevas tecnicas de unlearning sobre Phi-1.5.
- Docencia y formacion: ejemplo practico de como se compone una perdida de unlearning con reinicializacion parcial de pesos en un modelo de 1.400 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: en torno a 1,5 GB; en 4 bits: en torno a 0,8-1 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente en FP16; A100/H100 no son necesarias.
- Cabe en GPU consumer sin problemas.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el repo incluye `custom_code`), llama.cpp u Ollama si se convierte a GGUF (no se proporciona GGUF en el repo), vLLM/TGI si se valida la compatibilidad con la arquitectura Phi-1.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch18 | 1.418 M | no disponible | Unlearning TOFU (IHL + reset embeddings) | Apache 2.0 | Hugging Face |
| locuslab/tofu_ft_phi-1.5 | ~1.418 M | no disponible | Fine-tuning sobre TOFU (base de este checkpoint) | no disponible en la informacion | Hugging Face |
| microsoft/phi-1_5 | ~1.418 M | no disponible | Modelo base de codigo y texto | MIT (segun el modelo original) | Hugging Face |

La comparacion se limita a la familia Phi-1.5 porque el checkpoint es un derivado directo; no se dispone de datos de rendimiento para contrastar con alternativas de unlearning en otros tamanos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general.
- Solo ingles; no se garantiza calidad en otros idiomas.
- Riesgo de alucinacion heredado de Phi-1.5, agravado por el proceso de unlearning, que puede degradar la coherencia en dominios afectados.
- El objetivo del entrenamiento es olvidar el conjunto *forget10*; el rendimiento en ese subconjunto puede ser bajo por diseno, no por un fallo.
- No se documentan sesgos especificos, pero al derivar de Phi-1.5 puede arrastrar los sesgos del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el checkpoint intermedio (`locuslab/tofu_ft_phi-1.5`) deben verificarse por separado; la licencia de ese checkpoint no se confirma en la informacion disponible.
- Requiere `trust_remote_code=True` por el `custom_code` incluido; conviene auditar ese codigo antes de ejecutarlo.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria ni evidencia de uso en produccion.
- La model card no detalla hiperparametros, numero de pasos ni composicion exacta del dataset; la reproducibilidad depende del `ihl_manifest.json`, no incluido en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch18
- Modelo base del fine-tuning: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
