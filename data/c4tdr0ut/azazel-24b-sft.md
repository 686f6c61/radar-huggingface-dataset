# c4tdr0ut/Azazel-24B-SFT

## Resumen

Azazel-24B-SFT es un ajuste fino (SFT) del modelo Mistral-Small-24B-Instruct-2501, publicado por el usuario c4tdr0ut en Hugging Face. Se trata de un derivado de la familia Mistral Small de 24B parámetros, un transformer denso de tipo decoder-only orientado a generación de texto e instrucciones. El modelo parte de la versión cuantizada a 4 bits de Unsloth del checkpoint original de Mistral AI, y ha sido reentrenado mediante técnicas de ajuste supervisado aceleradas por Unsloth y la librería TRL de Hugging Face.

El interés de esta ficha reside en su carácter de ejemplo típico de finetune comunitario: un modelo de tamaño medio (23.572.403.200 parámetros según los pesos en safetensors) que hereda las capacidades del Mistral Small 24B Instruct y añade un ajuste específico del que no se documentan detalles. La model card es mínima y no aporta información sobre el dataset de entrenamiento, hiperparámetros ni objetivos del ajuste, por lo que buena parte de las especificaciones deben inferirse del modelo base.

La relevancia práctica es limitada: el repositorio registra cero descargas y cero likes en el momento de la consulta, y la documentación publicada no permite validar qué mejora aporta respecto al checkpoint original. Para producción conviene evaluar directamente el modelo base de Mistral AI salvo que se verifique empíricamente una ventaja concreta de este finetune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Mistral Small), según modelo base |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral Small 24B Instruct 2501 soporta 32K tokens; no confirmado para este finetune) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el checkpoint base de partida estaba cuantizado a 4 bits (bnb-4bit) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Mistral-Small-24B-Instruct-2501: un transformer decoder-only denso de aproximadamente 23.600 millones de parámetros, con atención por ventanas deslizantes y atención completa combinadas según el diseño de Mistral AI. No se dispone de información sobre la composición exacta del dataset de ajuste, el número de tokens de entrenamiento, ni si se aplicaron fases de RLHF o DPO posteriores al SFT. La model card únicamente indica que el modelo fue entrenado "2x faster" con Unsloth y TRL, lo que sugiere el uso de kernels optimizados y posiblemente LoRA o QLoRA sobre el checkpoint cuantizado a 4 bits de Unsloth.

No se documentan innovaciones técnicas propias de este finetune. El punto de partida es la versión `unsloth/Mistral-Small-24B-Instruct-2501-unsloth-bnb-4bit`, es decir, una conversión a 4 bits del instruct original. El resultado publicado en safetensors tiene un tamaño de repositorio de 47,2 GB, coherente con pesos en precisión de 16 bits para 24B parámetros. No hay información sobre el proceso de fusión de adaptadores ni sobre la precisión final de los pesos.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés, heredadas del modelo base Mistral Small 24B Instruct.
- Razonamiento y resolución de tareas de conocimiento general, en la medida en que el finetune no haya degradado las capacidades originales (no verificado).
- Generación de código y matemáticas: capacidad esperable por herencia del modelo base, sin datos específicos de este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este finetune; el modelo base Mistral Small 24B Instruct lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés (`en`), aunque el modelo base tiene soporte multilingüe más amplio.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documentan.

## Casos de uso

- Evaluación comparativa de finetunes comunitarios: usar este checkpoint frente al Mistral Small 24B Instruct original en un conjunto de validación propio para determinar si el ajuste aporta mejoras reales antes de adoptarlo.
- Prototipado de asistentes conversacionales en inglés: el modelo puede desplegarse con transformers o text-generation-inference para probar flujos de diálogo multi-turno, siempre con evaluación previa de calidad.
- Generación de texto en pipelines de investigación: servir como punto de partida para experimentos de ajuste adicional (LoRA, DPO) sobre una base de 24B parámetros ya instruida.
- Reproducción de recetas de entrenamiento con Unsloth: el repositorio sirve como referencia de un flujo SFT acelerado sobre un checkpoint cuantizado a 4 bits, útil para equipos que quieran replicar la metodología.
- Benchmarking interno de infraestructura: al ser un modelo denso de 24B, permite medir throughput y latencia de despliegues en vLLM o TGI con hardware de 48-80 GB de VRAM.
- Fine-tuning domain-specific posterior: partir de este checkpoint para adaptarlo a un dominio concreto (legal, técnico, atención al cliente) cuando se necesite una base de 24B con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 47-50 GB solo para pesos, más overhead de KV cache; requiere GPUs de 80 GB (A100 80GB, H100 80GB) para contexto largo.
- VRAM estimada en cuantización 8 bits: en torno a 24-28 GB, viable en una RTX 4090 (24 GB) solo con contexto corto y cuantización agresiva.
- VRAM estimada en cuantización 4 bits (GGUF/AWQ/GPTQ): aproximadamente 14-16 GB, cabe en RTX 4090, RTX 4080 Super (16 GB) y GPUs consumer de gama alta.
- GPUs recomendadas: A100 80GB o H100 para despliegue en precisión completa; RTX 4090 o A6000 para cuantización 4-8 bits.
- Opciones de despliegue: transformers (safetensors), text-generation-inference (tag declarado), vLLM si se genera una versión compatible, llama.cpp/Ollama previa conversión a GGUF (no publicada en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Azazel-24B-SFT | 23,57B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Finetune comunitario sin documentación de entrenamiento |
| Mistral-Small-24B-Instruct-2501 | ~23,6B | 32K (según Mistral AI) | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo base oficial, con benchmarks publicados y soporte de tool calling |
| Qwen2.5-32B-Instruct | ~32,5B | 128K | Apache 2.0 | Hugging Face | Mayor tamaño y contexto; requiere más VRAM |
| Gemma-2-27B-IT | ~27B | 8K | Gemma license (uso comercial con restricciones) | Hugging Face | Contexto menor y licencia menos permisiva |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, los hiperparámetros ni los objetivos del ajuste, lo que impide auditar qué comportamiento se ha modificado respecto al modelo base.
- Riesgo de degradación de capacidades: un SFT no documentado puede reducir el rendimiento en tareas que el Mistral Small 24B Instruct resolvía correctamente.
- Riesgo de alucinación inherente a los modelos de lenguaje de 24B; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas: la model card declara únicamente inglés, aunque el modelo base es multilingüe; el ajuste podría haber estrechado el soporte lingüístico.
- Sesgos: no se documenta ningún análisis de sesgos ni proceso de alineación adicional.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el modelo en su dominio.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- El checkpoint de partida está cuantizado a 4 bits; no se especifica si los pesos publicados se han fusionado y devuelto a 16 bits ni con qué precisión.
- Para producción se recomienda evaluar el modelo base oficial de Mistral AI antes que este finetune, salvo que se demuestre una ventaja concreta.

## Enlaces

- Hugging Face: https://huggingface.co/c4tdr0ut/Azazel-24B-SFT
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Mistral-Small-24B-Instruct-2501-unsloth-bnb-4bit
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
