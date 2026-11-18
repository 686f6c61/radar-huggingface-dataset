# HIHIHIHIHhaihihihaih/lumen-1.0

## Resumen

Lumen-1.0 es un ajuste fino (finetune) del modelo Qwen3-8B, publicado por el usuario HIHIHIHIHhaihihihaih en Hugging Face. Se trata de un modelo de generación de texto de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) construido sobre la variante cuantizada en 4 bits de Qwen3-8B distribuida por Unsloth (`unsloth/Qwen3-8B-unsloth-bnb-4bit`). El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card.

El modelo hereda la arquitectura transformer de la familia Qwen3 y está orientado a tareas conversacionales y de generación de texto en inglés, que es el único idioma declarado en sus metadatos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha es limitada: se trata de una publicación con cero descargas y cero likes en el momento de la consulta, sin documentación técnica detallada más allá de la plantilla estándar de Unsloth, sin datos de benchmarks y sin información sobre el dataset de ajuste fino. Resulta útil como ejemplo de flujo de trabajo de finetuning con Unsloth sobre Qwen3, pero no como modelo listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, decoder-only) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base se distribuye en 4 bits; el finetune se publica en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-8B, un transformer decoder-only de la familia Qwen3. El punto de partida es la versión `unsloth/Qwen3-8B-unsloth-bnb-4bit`, es decir, una cuantización de 4 bits (bitsandbytes) preparada por Unsloth para facilitar el entrenamiento con requisitos de VRAM reducidos. El entrenamiento se realizó con Unsloth, que según la model card permite un entrenamiento "2x más rápido" que el flujo estándar, junto con la librería TRL de Hugging Face.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, si se aplicaron técnicas de RLHF, DPO o instrucción supervisada, ni sobre innovaciones técnicas específicas más allá del uso de Unsloth. La model card no documenta hiperparámetros, configuración de LoRA (si se usó) ni el proceso de fusión de pesos. Toda esta información figura como no disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen3-8B.
- Razonamiento y respuesta a instrucciones (capacidad presumible del modelo base, no verificada en este finetune).
- Generación de código y matemáticas (capacidad presumible del modelo base, no verificada).
- Soporte de tool calling / function calling: no documentado en esta model card (Qwen3 lo soporta de forma nativa, pero no se confirma que el finetune lo preserve).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según los metadatos declarados.
- Modo thinking: Qwen3 incorpora modo de razonamiento, pero no se especifica si el finetune lo conserva.
- Visión y audio: no soportados.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede emplearse como base para experimentar con diálogos multi-turno, aunque sin datos de evaluación publicados conviene validar la calidad antes de integrarlo.
- Experimentación académica con finetuning: sirve como ejemplo reproducible de un pipeline Unsloth + TRL sobre Qwen3-8B, útil para investigadores que quieran replicar el flujo con sus propios datasets.
- Generación de texto en inglés para tareas creativas o de redacción: adecuado para pruebas de concepto donde no se requiera una calidad verificada.
- Base para un segundo ajuste fino: al estar en safetensors y con licencia Apache 2.0, puede reutilizarse como punto de partida para especializaciones posteriores.
- Evaluación comparativa de finetunes comunitarios: útil en estudios que midan cómo afecta el ajuste fino al rendimiento del modelo base.
- Despliegue en entornos de prueba con TGI o transformers: al ser compatible con `text-generation-inference`, puede servirse en infraestructura estándar para pruebas internas, siempre con validación previa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF/AWQ/GPTQ): en torno a 5-6 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) viable en FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp/Ollama (requiere conversión a GGUF), Unsloth para inferencia optimizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lumen-1.0 | 8,19 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Finetune comunitario sin benchmarks |
| Qwen3-8B (base) | 8,2 B | 32.768 tokens (ampliable, según documentación de Qwen) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, Meta | Requiere aceptar términos de licencia |
| Mistral 7B v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Hugging Face, Mistral | Referencia europea en 7-8 B |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el finetune mejore o mantenga las capacidades del Qwen3-8B original; podría haber degradación por sobreajuste o catastrophic forgetting.
- Dataset de entrenamiento no documentado: se desconoce qué datos se usaron, lo que impide evaluar sesgos, calidad y posibles problemas de contaminación.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos de 8 B sin verificación; sin evaluación específica, el riesgo es desconocido.
- Sesgos: no documentados; al desconocerse el dataset de ajuste fino, no se pueden identificar sesgos concretos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento y la calidad.
- Reputación del autor: cuenta sin historial verificable, cero descargas y cero likes; no hay garantía de mantenimiento ni soporte.
- Producción: no recomendado para entornos productivos sin una evaluación exhaustiva previa (evaluación propia en las tareas objetivo, pruebas de robustez y de seguridad).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HIHIHIHIHhaihihihaih/lumen-1.0
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen3: no disponible en la información proporcionada
