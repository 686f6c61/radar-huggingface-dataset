# NEXUSAIosCOMPANY/Nexus-1.5-Pro

## Resumen

Nexus-1.5-Pro es un ajuste fino (finetune) del modelo Qwen2.5-3B-Instruct, desarrollado por NEXUSAIosCOMPANY y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), construido sobre la arquitectura Qwen2 y entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido".

El modelo parte de la versión cuantizada en 4 bits del instructivo original (`unsloth/Qwen2.5-3B-Instruct-bnb-4bit`) y se distribuye en formato safetensors con un tamaño de repositorio de 6,2 GB. La model card es mínima: no se documentan datos de entrenamiento, número de tokens, composición del dataset ni metodología de alineación (RLHF/DPO), por lo que la información técnica disponible es muy limitada.

Su relevancia es reducida en el ecosistema actual: se publicó el 18 de noviembre de 2026, no acumula descargas ni interacciones, y no incluye benchmarks ni documentación de capacidades. Debe evaluarse como un experimento de ajuste fino sobre una base conocida (Qwen2.5-3B-Instruct), no como un modelo con garantías de rendimiento documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este finetune) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba cuantizado en 4 bits con bitsandbytes; los pesos publicados son safetensors) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2, un transformer decoder-only con atención causal estándar, heredada del modelo base Qwen2.5-3B-Instruct. El ajuste fino se realizó sobre la variante de ese modelo cuantizada en 4 bits con bitsandbytes (`unsloth/Qwen2.5-3B-Instruct-bnb-4bit`), empleando la librería Unsloth y TRL de Hugging Face. El autor afirma que este stack permitió entrenar "2x más rápido", pero no se especifica el hardware, la duración, el número de tokens de entrenamiento ni la composición del dataset.

No hay información publicada sobre el método de alineación (si hubo SFT, DPO o RLHF tras el ajuste), sobre el uso de decodificación especulativa, atención lineal u otras innovaciones técnicas. Tampoco se documenta si se preservaron las capacidades del modelo base o si el ajuste las alteró. En consecuencia, cualquier afirmación sobre calidad de entrenamiento o datos utilizados sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento básico y respuesta a instrucciones, presumiblemente conservados del modelo base (no verificado para este finetune).
- Generación de código y matemáticas a nivel de un modelo de 3B (capacidad del base, no documentada para este ajuste).
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma que se haya preservado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés (`en`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de ~3B parámetros en safetensors, puede cargarse con `transformers` en una GPU de consumo y usarse para validar flujos de diálogo antes de escalar a modelos mayores.
- Experimentación académica con ajuste fino: sirve como ejemplo de pipeline Unsloth + TRL sobre Qwen2.5-3B-Instruct para estudiar cómo afecta el finetune al comportamiento del modelo base.
- Generación de texto en entornos con recursos limitados: sus ~3,09 B de parámetros permiten inferencia en GPUs de gama media, útil para demos o entornos de desarrollo sin infraestructura dedicada.
- Tareas de clasificación o extracción de información en inglés: con prompting adecuado, un modelo instructivo de 3B puede emplearse para etiquetado y resumen de documentos cortos.
- Base para comparativas de finetunes: dado que parte de un checkpoint público y conocido, puede usarse como referencia en estudios sobre variabilidad de ajustes finos comunitarios.
- Evaluación de riesgos de modelos no documentados: útil como caso de estudio sobre la falta de transparencia en model cards y sus implicaciones para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 8-10 GB para contextos moderados).
- VRAM estimada con cuantización a 8 bits: en torno a 3,5-4 GB para pesos.
- VRAM estimada con cuantización a 4 bits (GGUF/AWQ/GPTQ): en torno a 2-2,5 GB para pesos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 4080 o RTX 3090 para inferencia local en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en fp16 (RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.); con cuantización 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuyen pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nexus-1.5-Pro | ~3,09 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Finetune comunitario sin benchmarks ni documentación |
| Qwen2.5-3B-Instruct (base) | ~3,09 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba con benchmarks publicados |
| Llama-3.2-3B-Instruct | ~3,21 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy usado | Alternativa de Meta con contexto largo y amplia adopción |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens | MIT | Hugging Face, muy usado | Modelo de Microsoft orientado a razonamiento y código |

La comparativa se basa en datos públicos de los modelos alternativos; para Nexus-1.5-Pro no hay benchmarks ni contexto confirmado, por lo que la comparación de rendimiento no puede establecerse.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el finetune mejore o preserve las capacidades del modelo base.
- Model card mínima: no se documentan datos de entrenamiento, método de alineación ni evaluación, lo que impide auditar sesgos o calidad.
- Riesgo de alucinación: inherente a los modelos de 3B parámetros, agravado por la falta de evaluación específica de este ajuste.
- Idiomas: la model card declara únicamente inglés; el uso en castellano no está soportado oficialmente.
- Contexto: no confirmado; no debe asumirse la ventana de 32.768 tokens del modelo base sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo, al no existir garantías ni documentación técnica.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay issues, discusiones ni reportes de terceros.
- Procedencia del checkpoint: al derivar de una versión cuantizada en 4 bits del base, pueden haberse introducido degradaciones respecto al original en fp16/bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NEXUSAIosCOMPANY/Nexus-1.5-Pro
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
