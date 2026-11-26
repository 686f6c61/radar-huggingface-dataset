# nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO

## Resumen

Qwen3.5-9B-W2.6A16-HGPTQ-RCO es una cuantización mixta de 2 y 4 bits del modelo multimodal Qwen/Qwen3.5-9B, desarrollada por el usuario nchapman. El modelo base es el modelo de 9B de Qwen orientado a programación, razonamiento, seguimiento de instrucciones y visión, y esta versión comprimida lo reduce de 18,0 GiB en BF16 a 5,55 GiB en disco, permitiendo su ejecución en una única GPU de 8 GB. La cuantización emplea GPTQ con transformadas de Hadamard y el formato compressed-tensors, manteniendo intactos el codificador de visión y el borrador especulativo MTP del modelo original.

La relevancia de esta ficha radica en que demuestra que un modelo multimodal de 9B con decodificación especulativa integrada puede desplegarse en hardware de consumo de gama media (RTX 3070, RTX 4060, RTX 4060 Ti de 8 GB). El modelo está optimizado específicamente para el runtime warp34, aunque también es compatible con vLLM 0.34 o superior mediante `--trust-remote-code`. La cuantización mixta V2 mantiene el 36,75% de los pesos más sensibles de la columna vertebral en 4 bits (con cabeza de salida en 8 bits) y comprime el resto en 2 bits simétricos, con layouts estrictamente de 2, 4 y 8 bits para evitar el desempaquetado lento de 3 bits.

El modelo cuenta con 8.514.350.832 parámetros reales según los safetensors, licencia Apache 2.0 y pipeline image-text-to-text, lo que confirma su naturaleza multimodal. El repositorio ocupa 11,9 GB y acumula 223 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con decodificación especulativa MTP integrada; cuantización GPTQ con transformadas de Hadamard |
| Parametros totales | 8.514.350.832 (8,51B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 2-bit / 4-bit (W2.6A16): 36,75% de pesos del backbone en 4 bits, resto en 2 bits simétricos, cabeza de salida en 8 bits; layouts GPU-friendly de 2/4/8 bits; también existe variante W4A16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, GPTQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal de 9B parámetros que procesa entradas de imagen y texto, con un codificador de visión y un mecanismo de decodificación especulativa MTP (multi-token prediction) integrado. Esta versión cuantizada preserva tanto el codificador de visión como el borrador especulativo, lo que permite mantener las capacidades multimodales y la aceleración por decodificación especulativa incluso en el formato comprimido.

La cuantización fue realizada por nchapman mediante GPTQ con transformadas de Hadamard y el formato compressed-tensors. La estrategia V2 de precisión mixta asigna 4 bits a los pesos más sensibles del backbone (36,75% del total) y 2 bits simétricos al resto, con una cabeza de salida en 8 bits. Los layouts se restringen a 2, 4 y 8 bits para que las GPU los procesen eficientemente, evitando el desempaquetado de 3 bits que resulta lento en hardware. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base a partir de la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: el modelo base está orientado a tareas de razonamiento e instrucciones, y la cuantización conserva esta capacidad según los benchmarks reportados.
- Generación de código: HumanEval+ reportado en 76,2% para esta cuantización.
- Matemáticas: MATH-500 reportado en 75,2%.
- Seguimiento de instrucciones: IFEval reportado en 75,8%.
- Visión: pipeline image-text-to-text con codificador de visión preservado en 4 bits, lo que permite entrada de imágenes.
- Decodificación especulativa: el borrador MTP se mantiene intacto, habilitando aceleración por especulación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo de 8 GB: el modelo cabe en 5,55 GiB, dejando aproximadamente 2,45 GiB para contexto largo, entradas de visión y decodificación especulativa. Adecuado para desarrolladores con RTX 3070, RTX 4060 o RTX 4060 Ti de 8 GB que quieran ejecutar un modelo multimodal de 9B localmente sin cuantización adicional.
- Asistente de código en estación de trabajo: con HumanEval+ de 76,2%, puede emplearse para autocompletado, generación de funciones y revisión de código en un entorno local, sin depender de APIs externas.
- Razonamiento matemático asistido: MATH-500 de 75,2% permite su uso en herramientas de resolución de problemas matemáticos paso a paso, integradas en cuadernos o asistentes educativos.
- Procesamiento de documentos con imagen y texto: al conservar el codificador de visión, puede extraer información de capturas, diagramas o formularios y combinarla con texto en una misma conversación.
- Evaluación e investigación de cuantización extrema: el modelo sirve como referencia para estudiar el impacto de la cuantización mixta 2/4 bits en tareas multimodales, comparándolo con la variante W4A16 del mismo autor o con UD-Q2_K_XL de Unsloth.
- Prototipado con decodificación especulativa en hardware limitado: al mantener el borrador MTP, permite medir la ganancia de latencia de la especulación en GPUs de 8 GB, un escenario poco habitual en modelos de este tamaño.
- Integración en pipelines con vLLM: compatible con vLLM 0.34 o superior mediante `--trust-remote-code`, lo que facilita su uso en servicios de inferencia con batching continuo.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-9B-W2.6A16-HGPTQ-RCO | Unsloth UD-Q2_K_XL |
|---|---|---|
| IFEval | 75,8% | no disponible |
| MATH-500 | 75,2% | no disponible |
| HumanEval+ | 76,2% | no disponible |
| Media de los tres | 75,74% | 73,12% |

Los datos provienen de la model card del autor. La comparación directa disponible es con la cuantización UD-Q2_K_XL de Unsloth, sobre la que esta versión obtiene una media de 75,74% frente a 73,12%, con menos bits en el tronco. No se han publicado en la información disponible resultados desglosados por benchmark para UD-Q2_K_XL ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,55 GiB en disco para los pesos; en ejecución se requiere espacio adicional para contexto, visión y decodificación especulativa, estimado en unos 2,45 GiB adicionales según el autor.
- GPU recomendadas: RTX 3070, RTX 4060 y RTX 4060 Ti de 8 GB (optimizado para warp34). Para la variante W4A16 del mismo autor se recomienda una GPU de 12 GB o superior.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB de las series RTX 30 y 40.
- Opciones de despliegue: warp34 (`warp34 serve nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO`) y vLLM 0.34 o superior (`vllm serve ... --trust-remote-code`). No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada, más allá de la mención cualitativa de que los layouts de 2/4/8 bits evitan el desempaquetado lento de 3 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-W2.6A16-HGPTQ-RCO | 8,51B | no disponible | Mixta 2/4 bits (5,55 GiB) | Apache 2.0 | Hugging Face; warp34 y vLLM |
| Qwen3.5-9B-W4A16-HGPTQ (mismo autor) | 8,51B (base) | no disponible | 4 bits (6,67 GiB) | Apache 2.0 | Hugging Face |
| Unsloth UD-Q2_K_XL (Qwen3.5-9B) | 8,51B (base) | no disponible | 2 bits | según modelo base | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 8,51B | no disponible | BF16 (18,0 GiB) | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no incluye otros modelos multimodales de tamaño similar. La ventaja principal de esta versión frente a W4A16 es el menor uso de VRAM (5,55 frente a 6,67 GiB), a costa de una precisión potencialmente inferior; frente a UD-Q2_K_XL, la model card reporta una media de benchmarks superior (75,74% frente a 73,12%).

## Limitaciones y advertencias

- La cuantización a 2 bits en parte del backbone implica una pérdida de precisión respecto al modelo base en BF16; los benchmarks reportados son del autor y no han sido verificados de forma independiente en la información disponible.
- El modelo está optimizado para warp34; fuera de ese runtime, el rendimiento puede diferir. En vLLM requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas de esta cuantización.
- La longitud de contexto no está documentada en la información proporcionada, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B y de las herramientas empleadas (warp34, GPTQ) antes de un uso comercial en producción.
- El número de descargas (223) y de likes (0) es bajo, lo que sugiere poca validación por parte de la comunidad.
- No se han publicado datos de latencia ni throughput, por lo que las estimaciones de rendimiento en producción deben medirse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante W4A16 del mismo autor: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantización warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Informe técnico: TECHNICAL.md (referenciado en la model card, dentro del repositorio del modelo)
