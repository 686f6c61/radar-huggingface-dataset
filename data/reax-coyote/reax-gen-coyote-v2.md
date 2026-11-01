# reax-coyote/reax-gen-coyote-v2

## Resumen

reax-gen-coyote-v2 es un modelo de lenguaje publicado en HuggingFace por el usuario reax-coyote bajo licencia Apache 2.0. El repositorio contiene pesos en formato safetensors con un total de 26.085.330.160 parámetros (aproximadamente 26.000 millones), lo que lo sitúa en la categoría de modelos de tamano medio-grande, comparable en escala a la familia Qwen de 32B o a modelos densos de ~27B. La etiqueta de arquitectura declarada en el repositorio es `qwen3_5`, lo que sugiere una base derivada o compatible con la arquitectura Qwen 3.5, aunque no se dispone de documentación que confirme detalles de dicha arquitectura.

La model card publicada por el autor es practicamente vacía: solo incluye la declaración de licencia Apache 2.0, sin descripción del modelo, sin datos de entrenamiento, sin especificaciones de contexto ni información sobre capacidades o idiomas. El repositorio ocupa 52,2 GB, coherente con pesos en precisión BF16/FP16 para ~26B parámetros, y registra 17 descargas y 0 likes en el momento de la consulta, lo que indica una distribución muy limitada y un modelo practicamente sin validación por parte de la comunidad.

Su relevancia actual es limitada y debe evaluarse con cautela: se trata de un checkpoint sin documentación técnica verificable, sin benchmarks publicados y sin pipeline declarado en HuggingFace. Para un desarrollador o investigador, esto implica que cualquier uso en producción requeriría una validación empírica propia antes de considerarlo fiable. La ficha que sigue refleja exclusivamente lo que puede extraerse de los metadatos del repositorio y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio); detalles no disponibles |
| Parametros totales | 26.085.330.160 (~26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta `qwen3_5`, lo que apunta a una arquitectura de tipo transformer derivada de la familia Qwen 3.5. Sin embargo, no se especifica si se trata de un modelo denso o de mezcla de expertos (MoE), ni el número de capas, dimensiones ocultas, cabezas de atención o tamaño del vocabulario. El recuento de parámetros en safetensors (26.085.330.160) es el único dato estructural verificable.

No hay información sobre el dataset de entrenamiento: se desconoce el número de tokens procesados, la composición del corpus, si hubo fases de ajuste supervisado (SFT), RLHF o DPO, ni si se aplicaron técnicas de destilación o merging de modelos. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. Todo lo relativo al proceso de entrenamiento debe considerarse no disponible y, por tanto, no verificable.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de ~26B, pero no confirmada por el autor.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Visión: no documentado; no hay indicios de componentes multimodales en los tags.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas del repositorio está vacío.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no documentado.

## Casos de uso

- Evaluación comparativa interna: dado que no hay benchmarks publicados, un uso realista inicial es servirlo en un entorno controlado y medirlo frente a modelos de tamano similar con un conjunto propio de prompts, para decidir si merece la pena integrarlo.
- Experimentación académica con checkpoints no documentados: útil para estudiar el comportamiento de modelos derivados de Qwen 3.5 y comparar su output con el modelo base oficial.
- Fine-tuning supervisado sobre dominio propio: al estar bajo Apache 2.0 y en safetensors, puede ajustarse con frameworks estándar (por ejemplo, Hugging Face Transformers con PEFT/LoRA) si el equipo asume el coste de validación previa.
- Generación de texto en pipelines internos no críticos: borradores, resúmenes o clasificación simple, siempre con revisión humana y tras validar calidad y sesgos.
- Base para destilación o merging: sus ~26B parámetros permiten usarlo como profesor o como componente en experimentos de fusión de pesos, con la debida verificación de licencia y procedencia.
- Despliegue autoalojado en infraestructura propia: al no depender de una API externa, encaja en entornos con requisitos de privacidad, aunque requiere GPU de gama alta y pruebas de latencia y estabilidad antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para un contexto moderado.
- Cuantización a 8 bits: aproximadamente 26-30 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090.
- Cuantización a 4 bits: aproximadamente 13-16 GB de VRAM, lo que permite ejecución en una única RTX 4090 (24 GB) o RTX 3090, siempre que se genere el formato cuantizado (el repositorio no incluye GGUF).
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; A100 40 GB o configuraciones multi-GPU para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: vLLM y TGI para safetensors en FP16/BF16; llama.cpp u Ollama solo tras convertir los pesos a GGUF, paso que el autor no ha realizado.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| reax-gen-coyote-v2 | ~26,1B | no disponible | Apache 2.0 | Practicamente inexistente | 17 descargas, 0 likes |
| Qwen2.5-32B | ~32,5B | 32K-128K (según variante) | Apache 2.0 (mayoría de variantes) | Model card completa y benchmarks | Amplia, muy extendida |
| Gemma 2 27B | ~27B | 8K | Gemma Terms of Use | Model card completa y benchmarks | Amplia |
| Mistral Small 24B (2501) | ~24B | 32K-128K | Apache 2.0 | Model card completa | Amplia |

La comparación es aproximada: reax-gen-coyote-v2 se sitúa en el mismo rango de parámetros que Gemma 2 27B, Mistral Small 24B y Qwen2.5-32B, pero carece de la documentación, benchmarks y soporte comunitario de estos modelos. En igualdad de tamano, los alternativas citadas ofrecen contexto y rendimiento verificables, lo que las hace opciones más seguras para producción.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre datos de entrenamiento, sesgos, idiomas ni contexto, lo que impide evaluar riesgos de forma rigurosa.
- Riesgo de alucinación desconocido: sin benchmarks ni evaluaciones publicadas no puede estimarse su fiabilidad en tareas factuales.
- Idiomas no documentados: el campo de idiomas está vacío; no debe asumirse un rendimiento multilingüe.
- Longitud de contexto no disponible: planificar pipelines con ventanas largas sin verificar antes el límite real puede provocar degradación silenciosa.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías sobre la procedencia de los datos de entrenamiento ni sobre posibles reclamaciones de terceros derivadas de la base Qwen 3.5.
- Distribución marginal (17 descargas, 0 likes): no hay evidencia de que el checkpoint haya sido validado por la comunidad; conviene tratarlo como experimental.
- Sin pipeline declarado en HuggingFace: las herramientas de inferencia automática pueden no reconocerlo correctamente.
- No se publican pesos cuantizados: el despliegue en hardware de consumo exige conversión manual a GGUF o AWQ/GPTQ, con el consiguiente riesgo de errores.

## Enlaces

- HuggingFace: https://huggingface.co/reax-coyote/reax-gen-coyote-v2
- Repositorio de Qwen (referencia de la arquitectura declarada): https://huggingface.co/Qwen
- Documentación de safetensors: https://huggingface.co/docs/safetensors
- vLLM: https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggerganov/llama.cpp
