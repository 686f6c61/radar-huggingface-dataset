# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch17

## Resumen

El modelo `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch17` es un checkpoint de investigacion derivado de Phi-1.5, publicado por el usuario g-assismoraes en HuggingFace. Se trata de un ajuste fino orientado a experimentos de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en su variante `forget10` (olvidar el 10 % de los datos de entrenamiento). Concretamente, el autor ha reinicializado los embeddings de entrada y la cabeza LM a partir de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer de `locuslab/tofu_ft_phi-1.5`, y ha aplicado un entrenamiento con una funcion de perdida compuesta: token IHL (probablemente *Inverted Hinge Loss* o una variante de *Information Theoretic Hinge Loss*) sobre el conjunto a olvidar mas una Cross-Entropy con peso 1.0 sobre el conjunto a retener.

El modelo tiene 1.418.270.720 parametros (aproximadamente 1,4 mil millones), un tamano tipico de la familia Phi-1.5, y se distribuye en formato safetensors con un peso de repositorio de 2,8 GB. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El checkpoint corresponde a la epoca 17 de 20 de un proceso de entrenamiento, y se presenta como un modelo completo e independiente (no como un adaptador LoRA), tal y como indica la referencia a `ihl_manifest.json` en la model card.

La relevancia de este modelo es fundamentalmente academica: sirve como artefacto reproducible para estudiar tecnicas de desaprendizaje (unlearning) y evaluar hasta que punto un modelo de lenguaje puede "olvidar" selectivamente informacion sin degradar su rendimiento general. No esta pensado para uso en produccion ni para aplicaciones comerciales directas, sino como material de investigacion en el area de privacidad y seguridad de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5), con capas de atencion y MLP; pesos base de `locuslab/tofu_ft_phi-1.5` |
| Parametros totales | 1.418.270.720 (aprox. 1,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original soporta 2048 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Phi-1.5, un transformer decoder-only de aproximadamente 1,4 mil millones de parametros desarrollado originalmente por Microsoft Research. Sobre esa base, el checkpoint `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, y este modelo concreto realiza una intervencion adicional: reinicializa los embeddings de entrada y la cabeza de lenguaje (`LM head`) desde `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes del checkpoint TOFU ajustado.

El entrenamiento se describe en la model card como una combinacion de dos terminos: una perdida de tipo IHL (*token IHL*) sobre el conjunto `forget` y una Cross-Entropy con coeficiente 1.0 sobre el conjunto `retain`. El objetivo es doble: eliminar la influencia de los datos a olvidar (forget10, es decir, el 10 % de los datos ficticios de TOFU) mientras se preserva el comportamiento sobre el resto del corpus. El checkpoint corresponde a la epoca 17 de 20, lo que sugiere un entrenamiento relativamente corto y un interes en capturar la dinamica intermedia del proceso de desaprendizaje. No se especifican en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si se emplearon tecnicas como RLHF o DPO; por el contexto (TOFU, unlearning), es probable que el entrenamiento sea puramente supervisado con las perdidas mencionadas.

La innovacion tecnica principal es el esquema de reinicializacion parcial (embeddings y LM head desde el modelo original, resto desde el modelo ajustado) combinado con la perdida IHL. Este enfoque busca evitar que el modelo "recuerde" los datos a olvidar a traves de las representaciones de entrada/salida, forzando un comportamiento mas cercano al modelo base en esas capas mientras se modifica el resto del transformer para satisfacer la restriccion de retener el conocimiento general.

## Capacidades

- Generacion de texto en ingles: al ser un derivado de Phi-1.5, conserva la capacidad de generar texto coherente y completar tareas de lenguaje natural en ingles.
- Razonamiento basico y matematicas simples: Phi-1.5 esta orientado a tareas de razonamiento y codigo, por lo que se espera un rendimiento modesto pero funcional en problemas aritmeticos y de logica de nivel basico.
- Generacion de codigo: Phi-1.5 fue entrenado con un enfasis significativo en codigo Python, y esta capacidad se mantiene parcialmente en el checkpoint.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada; Phi-1.5 original no lo soporta de forma nativa).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; el modelo es de pequeno tamano y no esta optimizado para agentes).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: el modelo esta disenado como artefacto de investigacion en *machine unlearning*; no incorpora modo "thinking", vision, audio ni otras modalidades.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como checkpoint intermedio (epoca 17/20) para estudiar la evolucion del proceso de desaprendizaje y comparar estrategias de perdida (IHL + CE) frente a alternativas como el ajuste fino con gradiente ascendente o el borrado de capas.
- Evaluacion de privacidad y fuga de informacion: permite medir hasta que punto un modelo ajustado con TOFU retiene o filtra datos ficticios del conjunto `forget`, usando metricas como *forget quality* y *retain quality* definidas en el benchmark TOFU.
- Reproducibilidad de experimentos: al ser un checkpoint completo e independiente (no un adaptador), facilita la replicacion de resultados sin necesidad de recomponer pesos base y adaptadores.
- Estudio de reinicializacion parcial: util para analizar el impacto de reinicializar embeddings y LM head en la capacidad del modelo de "olvidar" informacion, comparandolo con variantes que solo ajustan capas internas.
- Docencia y formacion: sirve como ejemplo practico de como se construye un modelo de desaprendizaje y como se interpretan sus resultados en un contexto academico.
- Baseline para futuros metodos de unlearning: puede utilizarse como referencia contra la que comparar nuevas tecnicas de borrado de conocimiento en modelos de ~1,4 B de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16, aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 6-8 GB de VRAM para inferencia comoda con contexto moderado.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100; tambien funciona en GPUs consumer de gama media como RTX 3060 (12 GB) o RTX 4070.
- Cabe en consumer GPU: si, en la mayoria de GPUs con 8 GB o mas de VRAM en FP16; en cuantizacion de 8 bits o 4 bits cabria en GPUs con 4-6 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario por el tag `custom_code`), vLLM (previa conversion), llama.cpp/Ollama (requiere conversion a GGUF, no incluida en el repo), TGI (previa configuracion). No se dispone de artefactos preconvertidos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch17` | 1,4 B | no disponible | Apache 2.0 | HuggingFace (checkpoint de investigacion) | Derivado de Phi-1.5 con unlearning TOFU |
| `microsoft/phi-1_5` | 1,3 B | 2048 | MIT (segun modelo original) | HuggingFace | Modelo base original, sin ajuste TOFU |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | no disponible | no disponible | HuggingFace | Modelo ajustado con TOFU, base de este checkpoint |
| `locuslab/tofu_ft_llama2-7b` | 7 B | 4096 | Llama 2 (uso restringido) | HuggingFace | Alternativa de mayor tamano para experimentos TOFU |

La comparativa se limita a la familia Phi-1.5 y a los artefactos TOFU, ya que no se dispone de datos de rendimiento para comparar con modelos de proposito general de tamano similar (p. ej. Qwen2.5-1.5B, SmolLM2-1.7B) en el contexto de unlearning.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion; su proposito es el estudio de tecnicas de desaprendizaje.
- Riesgo de alucinacion: como cualquier modelo de ~1,4 B, puede generar contenido facticamente incorrecto, especialmente fuera de los dominios vistos en entrenamiento.
- Sesgos conocidos: no se documentan en la informacion proporcionada, pero al derivar de Phi-1.5 y de un ajuste con datos ficticios de TOFU, puede heredar sesgos del corpus original y del dataset TOFU.
- Limitaciones de idioma: solo ingles declarado; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 y el checkpoint TOFU pueden tener condiciones adicionales; se recomienda revisar las licencias de los modelos originales antes de cualquier uso comercial.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; debe auditarse antes de su uso en entornos sensibles.
- Checkpoint intermedio: al corresponder a la epoca 17/20, no representa necesariamente el estado final optimo del proceso de desaprendizaje.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estandar, lo que dificulta evaluar su calidad real.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): no disponible en la informacion proporcionada
- Paper TOFU (referencia): no disponible en la informacion proporcionada
