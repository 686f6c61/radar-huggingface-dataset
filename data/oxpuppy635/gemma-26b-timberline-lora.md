# oxpuppy635/gemma-26b-Timberline-lora

## Resumen

`gemma-26b-Timberline-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario oxpuppy635 sobre el modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2`, una variante del modelo Gemma 4 de 26B con arquitectura MoE (26B totales, 4B activos) según la model card del adaptador. El adaptador no es un modelo completo: pesa 18.585.600 parámetros entrenables y se distribuye tanto en formato PEFT/safetensors como en un GGUF LoRA que puede aplicarse dinámicamente en tiempo de ejecución con `llama.cpp`.

El propósito declarado es un ajuste fino conversacional y de generación de texto con un estilo asociado a la etiqueta "goetia" y "Timberline", entrenado con 1.988 conversaciones durante 3 épocas con QLoRA de 4 bits (NF4 con cómputo en bfloat16, incluidos los expertos MoE en 3D). El resultado es un artefacto muy ligero (0,1 GB de repositorio) que se apoya en el modelo base para toda la capacidad real de cómputo y conocimiento.

Es relevante ahora como ejemplo de la práctica de publicar adaptadores LoRA pequeños y desacoplados del modelo base, con doble formato (PEFT y GGUF) para facilitar su uso tanto en pipelines de `transformers` como en inferencia local con `llama.cpp`. No obstante, la información pública es escasa: no hay licencia, idiomas, benchmarks ni documentación sobre la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base Gemma 4 con arquitectura MoE (`Gemma4ForConditionalGeneration`); el adaptador en sí es de bajo rango |
| Parametros totales | 18.585.600 (parámetros del adaptador LoRA, según safetensors); el modelo base declara 26B-A4B |
| Parametros activos | No disponible para el adaptador; el modelo base es MoE 26B-A4B (4B activos según nomenclatura) |
| Longitud de contexto | 2.176 tokens (longitud máxima de secuencia usada en entrenamiento; el contexto del modelo base no se especifica) |
| Tipos de cuantizacion | Entrenado en 4-bit QLoRA (NF4 + bfloat16); el adaptador se distribuye en safetensors (bfloat16) y GGUF LoRA para aplicar sobre cuantizaciones GGUF del base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT) y `gemma-26b-Timberline-lora.gguf` (LoRA GGUF para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango `r=16` y `lora_alpha=32` aplicado sobre el modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2`, que según la model card presenta la arquitectura `Gemma4ForConditionalGeneration` con diseño MoE de 26B totales y 4B activos. El entrenamiento se realizó con QLoRA de 4 bits: cuantización NF4 de los pesos con cómputo en `bfloat16`, incluyendo los expertos MoE en 3D también en NF4. La longitud máxima de secuencia durante el entrenamiento fue de 2.176 tokens, con 1.988 conversaciones, 3 épocas y una pérdida final de entrenamiento de 2,8744.

No se documenta la composición del dataset, la procedencia de las conversaciones, si hubo etapas de RLHF/DPO ni detalles sobre el tokenizador más allá de que se carga con `trust_remote_code=True`. Tampoco se especifican innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio esquema QLoRA sobre expertos MoE. El adaptador se puede aplicar en tiempo de ejecución sobre cualquier cuantización GGUF del modelo base mediante el flag `--lora` de `llama.cpp`, lo que permite combinarlo con distintos niveles de cuantización sin reentrenar.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Gemma 4 26B-A4B.
- Ajuste de estilo y tono conversacional orientado a narración evocativa, según el ejemplo de uso de la model card ("Write an evocative story...").
- Aplicación dinámica en tiempo de ejecución sobre cuantizaciones GGUF del modelo base con `llama.cpp`.
- Carga estándar en `transformers` + `peft` con `PeftModel.from_pretrained`.
- Capacidades multimodales potenciales heredadas del base (`Gemma4ForConditionalGeneration` sugiere soporte de condicionalidad, aunque no se detalla en la información disponible).
- Tool calling, function calling, agentes, matemáticas, código y capacidades multilingües: no disponible (no documentado para este adaptador).

## Casos de uso

- Narración creativa y escritura evocativa: el adaptador está entrenado sobre conversaciones y el ejemplo de la model card apunta a generación de historias; se aplicaría sobre el base en `llama.cpp` con `--lora` para modular el estilo sin sustituir el modelo completo.
- Prototipado rápido de asistentes conversacionales con estilos personalizados: al pesar solo 18,5M de parámetros, el adaptador se puede versionar y desplegar junto al base sin duplicar los 26B de pesos.
- Experimentación académica con QLoRA sobre arquitecturas MoE: el repositorio documenta el esquema de cuantización NF4 de expertos MoE en 3D, útil como referencia reproducible para fine-tuning de bajo coste.
- Despliegue local en `llama.cpp` sobre hardware de consumo: al combinarse con cuantizaciones GGUF Q4_K_M del base y `-ngl 99`, permite probar el ajuste en GPU consumer sin infraestructura dedicada.
- Integración en pipelines de `transformers` para evaluación comparativa: la carga vía PEFT permite alternar entre el base y el adaptador para medir el efecto del fine-tuning en tareas concretas.
- Generación de contenido con temperatura creativa controlada: útil para guiones, descripciones y textos de ficción donde se busca un registro estilístico específico, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,1 GB; el requisito real de VRAM lo determina el modelo base Gemma 4 26B-A4B.
- Para el base en cuantización Q4_K_M (GGUF) se estima un consumo en torno a 15-18 GB de VRAM, aunque no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; por tamaño del base, orientativas serían A100/H100 para bfloat16 completo y RTX 4090/3090 para cuantizaciones GGUF de 4 bits.
- Viabilidad en GPU consumer: plausible con cuantizaciones GGUF de 4 bits en GPUs de 24 GB, no confirmado en la documentación.
- Opciones de despliegue: `llama.cpp` (con `--lora`), `transformers` + `peft`; vLLM, TGI y Ollama no están documentados para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-26b-Timberline-lora (este) | 18,5M (adaptador) sobre base 26B-A4B MoE | 2.176 tokens de entrenamiento | PEFT safetensors + GGUF LoRA | No disponible | Adaptador de estilo sobre base no oficial |
| Modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2` | 26B totales / 4B activos | No disponible | Safetensors/GGUF | No disponible | Sin el ajuste de estilo del adaptador |
| Gemma 4 26B-A4B oficial (familia Gemma) | 26B totales / 4B activos | No disponible | Safetensors/GGUF | Términos Gemma (no verificado para este repo) | Referencia canónica de la arquitectura; el base usado aquí es una variante no oficial |

La comparación con alternativas de la misma categoría (adaptadores LoRA conversacionales) no está disponible por falta de datos publicados.

## Limitaciones y advertencias

- El adaptador depende por completo del modelo base no oficial `OS-Software/...-uncensored-heretic-v2`; sin él no es funcional y su comportamiento hereda los sesgos y el afilado de seguridad (o ausencia de él) de ese base.
- El nombre del base incluye "uncensored" y "heretic", lo que sugiere una reducción deliberada de las salvaguardas; riesgo elevado de generar contenido inapropiado o dañino en producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, la licencia del base (Gemma) puede imponer restricciones adicionales no reflejadas en este repositorio.
- Riesgo de alucinación inherente a un modelo de 26B con entrenamiento conversacional ligero (1.988 conversaciones, 3 épocas, pérdida final 2,8744): el ajuste es pequeño y no garantiza corrección factual.
- Contexto de entrenamiento limitado a 2.176 tokens; usos con ventanas mayores no están validados para este adaptador.
- Idiomas soportados no documentados; el entrenamiento parece orientado a inglés según el ejemplo de la model card.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: sin validación comunitaria ni evidencia de calidad.
- El uso de `trust_remote_code=True` en la carga implica ejecutar código del repositorio; conviene auditar antes de desplegar.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar sesgos, contaminación o cumplimiento de derechos de autor.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/oxpuppy635/gemma-26b-Timberline-lora
- Modelo base: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Documentación de PEFT: https://huggingface.co/docs/peft
- Repositorio de llama.cpp (soporte `--lora`): https://github.com/ggml-org/llama.cpp
