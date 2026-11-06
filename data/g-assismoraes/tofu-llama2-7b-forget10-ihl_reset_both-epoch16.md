# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch16

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch16` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el benchmark TOFU (Task of Fictitious Unlearning). Lo publica el usuario g-assismoraes como artefacto de un experimento de *machine unlearning*: el objetivo es eliminar el conocimiento de un subconjunto concreto del dataset (el split `forget10`, es decir, el 10 % de los autores ficticios de TOFU) sin degradar el resto del conocimiento retenido.

El checkpoint corresponde a la epoca 16 de 20 de un entrenamiento con una funcion de perdida combinada: token IHL (probablemente *Inverted Hinge Loss* o una variante de *unlearning* por margen) sobre el conjunto a olvidar, mas un termino de entropia cruzada con peso 1.0 sobre el conjunto a retener. La estrategia `reset_both` implica reinicializar tanto los *input embeddings* como la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base.

Es relevante en el contexto de la investigacion sobre desaprendizaje selectivo y cumplimiento del derecho al olvido (RGPD), donde se necesitan metodos que eliminen informacion concreta de un LLM sin reentrenar desde cero. No es un modelo para produccion: es un checkpoint intermedio de un *sweep* experimental, sin model card completa ni evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 16 de 20 |
| Split de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning supervisado de Llama 2 sobre el dataset TOFU, compuesto por pares pregunta-respuesta sobre 200 autores ficticios. El split `forget10` contiene el 10 % de esos autores, que el procedimiento de *unlearning* debe hacer olvidar.

El entrenamiento aplica una perdida combinada: un termino de token IHL sobre el conjunto a olvidar y una entropia cruzada con coeficiente 1.0 sobre el conjunto a retener. La variante `reset_both` reinicializa los *input embeddings* y la *LM head* desde el checkpoint `Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. No se documenta en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de TOFU, ni si hubo RLHF o DPO; la informacion disponible no permite confirmar ninguno de estos extremos. El checkpoint publicado corresponde a la epoca 16 de un total de 20.

## Capacidades

- Generacion de texto en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas, condicionados por el fine-tuning sobre TOFU.
- Respuesta sobre los autores ficticios del split `retain` de TOFU; se espera que el conocimiento sobre el split `forget10` haya sido suprimido por el procedimiento de *unlearning*.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta *thinking mode*, vision ni audio.
- Al ser un checkpoint experimental, sus capacidades efectivas deben validarse empiricamente; no hay evaluacion publicada.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como punto de comparacion (epoca 16 de 20) frente a otros checkpoints del mismo *sweep* para medir la evolucion de las metricas de olvido y retencion a lo largo del entrenamiento.
- Evaluacion de metodos de reinicializacion: al combinar `reset_both` con IHL, permite estudiar el impacto de reinicializar embeddings y LM head en la calidad del olvido selectivo sobre TOFU.
- Reproducibilidad de experimentos: el manifiesto `ihl_manifest.json` y la configuracion de perdida documentada permiten replicar el entrenamiento y comparar resultados.
- Estudio de degradacion del conocimiento retenido: util para analizar si el termino CE con peso 1.0 preserva suficientemente el split `retain` tras 16 epocas de *unlearning*.
- Base para *fine-tuning* posterior en entornos controlados de investigacion, siempre que se respete la licencia Llama 2.
- Analisis de sesgos y de fuga de informacion: permite comprobar si el modelo aun reproduce datos del split `forget10` tras el procedimiento, lo que es directamente relevante para auditorias de privacidad.
- No se recomienda su uso en produccion ni en aplicaciones de cara al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 40GB o H100 para FP16 sin restricciones; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en FP16, y en GPUs de 8-12 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama 2, aunque el checkpoint esta en safetensors y requeriria conversion a GGUF para llama.cpp y Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch16 | ~6,74B | no disponible | llama2 | Hugging Face | Checkpoint experimental de *unlearning*, epoca 16/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | llama2 | Hugging Face | Modelo base de fine-tuning sobre TOFU, sin *unlearning* |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 tokens | llama2 | Hugging Face | Llama 2 7B chat, origen de los embeddings y LM head reinicializados |
| meta-llama/Llama-2-7b-hf | ~6,74B | 4096 tokens | llama2 | Hugging Face | Modelo original de Meta, base de toda la cadena |

## Limitaciones y advertencias

- Es un checkpoint experimental de investigacion, no un modelo listo para produccion; no tiene model card completa ni evaluacion publicada.
- El procedimiento de *unlearning* no garantiza la eliminacion completa de la informacion del split `forget10`; pueden persistir fugas que solo una evaluacion especifica podria detectar.
- El termino CE sobre el conjunto retenido puede no preservar integramente las capacidades originales del modelo base; es necesario medir la degradacion.
- Idiomas: solo ingles segun la model card; el rendimiento en castellano no esta documentado.
- Sesgos: hereda los sesgos de Llama 2 y del dataset TOFU; no se documenta mitigacion adicional.
- Riesgo de alucinacion: presente como en cualquier LLM de 7B; el fine-tuning sobre TOFU puede aumentar la propension a inventar datos biograficos plausibles.
- Licencia Llama 2: restringe el uso comercial y exige cumplir la politica de uso aceptable de Meta; el uso en la UE esta sujeto a las condiciones de dicha licencia.
- Contexto: no se confirma en la model card; se asume el de Llama 2 (4096 tokens), pero no esta verificado para este checkpoint.
- Fecha de creacion indicada como 2026-11-02, lo que sugiere un artefacto de un *sweep* automatizado o una fecha de metadata no fiable; conviene verificar la procedencia antes de reutilizarlo.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch16
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): no disponible en la informacion proporcionada
- Repositorio del codigo de entrenamiento: no disponible en la informacion proporcionada
- Manifiesto `ihl_manifest.json`: referenciado en la model card, no enlazado
