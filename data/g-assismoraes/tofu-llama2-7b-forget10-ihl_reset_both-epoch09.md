# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch09

## Resumen

`tofu-llama2-7b-forget10-ihl_reset_both-epoch09` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el usuario `g-assismoraes` en Hugging Face. No es un modelo de proposito general, sino un artefacto experimental dentro de la linea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark academico para estudiar el *machine unlearning*: la capacidad de eliminar selectivamente informacion de un modelo entrenado sin reentrenarlo desde cero.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica una receta concreta de desaprendizaje: inicializacion de los *input embeddings* y de la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base, y entrenamiento con una perdida que combina una "Token IHL" sobre el conjunto *forget* con una entropia cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*. El sufijo `epoch09` indica que se trata de la novena epoca de un ciclo de 20.

Su relevancia es acotada y fundamentalmente metodologica: sirve como punto de comparacion en experimentos de unlearning, no como modelo para produccion. El repositorio ocupa 13,5 GB, tiene 23 descargas y ningun *like*, y el pipeline no esta declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; lo que varia es el estado de los pesos y el procedimiento de ajuste.

El entrenamiento descrito en la model card combina dos componentes: una perdida denominada "Token IHL" aplicada sobre el conjunto *forget* de TOFU y una entropia cruzada estandar sobre el conjunto *retain*, con peso 1.0. Ademas, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`. El resultado es un checkpoint completo e independiente (no un adaptador LoRA), acompanado de un fichero `ihl_manifest.json` que documenta la receta. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Respuesta a instrucciones y conversacion, dado que el modelo base es un ajuste supervisado de Llama 2 y los embeddings y la LM head provienen de la variante chat.
- Razonamiento basico y conocimiento factual generico, limitado por el tamano de 7B y por el ajuste especifico sobre TOFU.
- Capacidad de *tool calling* / *function calling*: no documentada en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles.
- Comportamiento de desaprendizaje: se espera que el modelo haya perdido (parcialmente) la capacidad de reproducir el subconjunto *forget* de TOFU, manteniendo el rendimiento sobre *retain*; el grado exacto de olvido no se cuantifica en la informacion proporcionada.

## Casos de uso

- Investigacion en *machine unlearning*: usar el checkpoint como referencia experimental para comparar recetas de olvido (IHL, gradiente ascendente, reinicializacion parcial) sobre el mismo modelo base y el mismo split de TOFU.
- Reproducibilidad de experimentos academicos: el fichero `ihl_manifest.json` y el sufijo de epoca permiten reconstruir la curva de entrenamiento y contrastar resultados entre epocas del mismo ciclo.
- Evaluacion de *membership inference attacks*: comprobar si un atacante puede distinguir si un ejemplo del conjunto *forget* estuvo en el entrenamiento original, comparando este checkpoint con `locuslab/tofu_ft_llama2-7b`.
- Estudio de la degradacion por olvido: medir la perdida de utilidad general (perplejidad en corpus generico en ingles) que introduce el termino IHL frente al coste de eliminar la informacion objetivo.
- Analisis de la reinicializacion de embeddings y LM head: evaluar como afecta al vocabulario y a la fluidez sustituir estas capas por las de `Llama-2-7b-chat-hf` manteniendo el resto del transformer.
- Docencia en cursos de seguridad y privacidad de modelos: ejemplo practico de un *pipeline* de desaprendizaje con conjuntos *forget*/*retain* y una perdida compuesta explicitamente documentada.
- Base para *fine-tuning* posterior en entornos de investigacion controlados, siempre que se respete la licencia Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (como *forget quality*, *model utility* o *truth ratio*) ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-24 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos, aunque no se publican variantes cuantizadas oficiales.
- VRAM estimada en cuantizacion de 4 bits (si se generara via GPTQ/AWQ/GGUF): en torno a 4-5 GB de pesos; requiere conversion manual, no incluida en el repo.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion por lotes; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en precision completa.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 para contextos moderados; en GPUs de 8-12 GB solo mediante cuantizacion no oficial.
- Opciones de despliegue: `transformers` con safetensors de forma nativa; vLLM y TGI son compatibles con la arquitectura Llama 2, aunque no hay configuracion publicada para este checkpoint; llama.cpp/Ollama requeririan conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch09` | 6,74 B | no disponible (Llama 2: 4096) | Checkpoint de investigacion en unlearning (epoca 9/20) | llama2 | Hugging Face, 23 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | Llama 2: 4096 | Modelo base ajustado sobre TOFU, sin desaprendizaje | llama2 | Hugging Face (modelo de referencia del benchmark) |
| `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both` | 6,74 B | no disponible | Variante de la misma receta sin sufijo de epoca (checkpoint final o agregado) | llama2 | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | Llama 2: 4096 | Modelo chat de proposito general | llama2 | Hugging Face |

Las diferencias entre estos modelos no estan en arquitectura ni en numero de parametros, sino en el estado de los pesos y en la receta de ajuste. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas de proposito general; su utilidad esta ligada al benchmark TOFU.
- El olvido no es verificable con los datos publicados: la model card no reporta metricas de *forget quality* ni de *model utility*, por lo que no puede afirmarse que la informacion objetivo haya sido eliminada de forma efectiva.
- Riesgo de alucinacion: inherente a Llama 2 7B y potencialmente agravado por la reinicializacion de embeddings y LM head, que puede alterar la distribucion del vocabulario.
- Sesgos conocidos: los hereda de Llama 2 y del corpus de ajuste; no se documenta ninguna mitigacion especifica.
- Idioma: solo ingles segun el campo `language`; el rendimiento en castellano no esta evaluado y previsiblemente sera pobre.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso (incluida la politica de uso aceptable de Meta) y requiere atribucion; el uso comercial esta permitido con condiciones, pero debe revisarse el texto completo antes de desplegar.
- Fecha de creacion del repositorio poco habitual (2026-11-02) y ausencia de pipeline declarado: conviene verificar la integridad de los pesos antes de reutilizarlos.
- Sin variantes cuantizadas oficiales ni configuracion de despliegue publicada, lo que anade trabajo de ingenieria para cualquier uso practico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch09
- Variante sin sufijo de epoca: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
