# blackfan23/Qwen3.5-2B-oQ4e-mtp

## Resumen

El modelo `blackfan23/Qwen3.5-2B-oQ4e-mtp` es una cuantización de 4 bits del modelo Qwen3.5-2B, realizada con la herramienta oQ (oMLX v0.6.3rc2) en formato MLX safetensors. El autor, blackfan23, ha publicado esta versión optimizada para ejecución en hardware Apple Silicon mediante MLX, aunque el formato safetensors permite su uso en otros entornos compatibles. La cuantización emplea un group size de 64 y una precisión mixta, lo que reduce el tamaño del modelo a aproximadamente 1,2 GB, frente a los pesos completos del modelo original.

Qwen3.5 es una familia de modelos de Alibaba que, según la documentación pública, integra una arquitectura híbrida que combina atención lineal con transformers tradicionales, y es nativamente multimodal (texto, imagen y vídeo). Sin embargo, la model card de este repositorio no proporciona detalles sobre el modelo base, su licencia ni sus capacidades específicas, por lo que la información aquí presentada se limita a lo disponible en la ficha de Hugging Face y a las referencias externas encontradas.

Este modelo resulta relevante para desarrolladores que buscan una versión compacta y cuantizada de Qwen3.5-2B para despliegue en entornos con recursos limitados, especialmente en ecosistemas MLX. No obstante, al carecer de documentación oficial sobre el modelo base, su uso en producción requiere verificación previa de las capacidades y limitaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según la model card; la familia Qwen3.5 usa arquitectura híbrida con atención lineal y transformers, según fuentes externas) |
| Parametros totales | 323.857.728 (dato de safetensors; no coincide con la denominación "2B", posiblemente sea el número de parámetros del modelo cuantizado o un error del autor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precisión mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la familia Qwen3.5 se publica bajo Apache 2.0 según fuentes externas, pero no se confirma en este repositorio) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo es de tipo `qwen3_5` y que ha sido cuantizado con oQ (oMLX v0.6.3rc2) en precisión mixta de 4 bits con group size 64. No se proporciona información sobre la arquitectura interna del modelo base, los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

Según fuentes externas, la familia Qwen3.5 de Alibaba emplea una arquitectura híbrida que combina atención lineal con transformers tradicionales, y es nativamente multimodal (texto, imagen y vídeo). Sin embargo, estos datos no están confirmados en la documentación de este repositorio concreto, por lo que deben tomarse con cautela. Tampoco se especifica si el modelo base fue sometido a algún proceso de alineación específico.

## Capacidades

- Generación de texto: se espera que herede las capacidades del modelo Qwen3.5-2B, aunque no hay confirmación en la model card.
- Multimodalidad: según fuentes externas, la familia Qwen3.5 es nativamente multimodal (texto, imagen y vídeo), pero no se confirma para esta cuantización.
- Razonamiento y código: no hay datos específicos para este modelo.
- Tool calling y agentes: no disponible.
- Soporte multilingüe: no disponible.
- Modo thinking: no disponible.

Dado que la model card no detalla capacidades, cualquier afirmación sobre las habilidades del modelo debe considerarse especulativa hasta que se verifique con el modelo base.

## Casos de uso

- Inferencia en dispositivos Apple Silicon: al estar en formato MLX y cuantizado a 4 bits, este modelo puede ejecutarse eficientemente en Macs con chip M1/M2/M3, aprovechando el framework MLX para tareas de generación de texto en local.
- Prototipado rápido: su tamaño reducido (1,2 GB) permite cargarlo en memoria y experimentar con prompts y configuraciones sin necesidad de infraestructura GPU dedicada.
- Aplicaciones de chat o asistentes ligeros: si el modelo base mantiene las capacidades conversacionales de Qwen3.5, podría usarse en bots de soporte o asistentes personales con requisitos de latencia moderados.
- Educación e investigación: útil para estudiar el efecto de la cuantización 4-bit con group size 64 en modelos pequeños, o para probar el flujo de trabajo de oQ en MLX.
- Generación de texto en entornos con restricciones de memoria: por ejemplo, en servidores sin GPU o en contenedores con límites de RAM, donde un modelo de 2B cuantizado es viable.
- Fine-tuning o adaptación posterior: aunque no se indica, los pesos en safetensors podrían servir como punto de partida para técnicas de PEFT (LoRA) en MLX, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~324M parámetros (según safetensors) cuantizado a 4 bits, el uso de memoria en inferencia debería ser inferior a 1 GB, aunque el tamaño del repo es de 1,2 GB. No se dispone de mediciones exactas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM podría ejecutarlo, aunque el formato MLX está optimizado para Apple Silicon. En entornos CUDA, sería necesario convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja como GTX 1650, RTX 3050 o integradas con suficiente memoria compartida.
- Opciones de despliegue: MLX (nativo), posiblemente vLLM o llama.cpp si se convierten los pesos, aunque no hay guías oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar. Como referencia, se podrían considerar Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B, pero no hay información suficiente para establecer una comparación objetiva. La falta de licencia y documentación del modelo base dificulta además la evaluación de su idoneidad para casos concretos.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, lo que impide conocer las restricciones de uso comercial o de redistribución. Aunque la familia Qwen3.5 se publica bajo Apache 2.0 según fuentes externas, no se puede asumir que esta cuantización herede esa licencia sin confirmación del autor.
- El número de parámetros reportado (323.857.728) no coincide con la denominación "2B", lo que sugiere que podría tratarse de un modelo distinto o de un error en la metadata. Esto introduce incertidumbre sobre la identidad real del modelo base.
- Al ser una cuantización 4-bit, es esperable una pérdida de precisión frente a los pesos completos, especialmente en tareas de razonamiento complejo o generación de código.
- No hay información sobre el contexto máximo soportado, lo que limita su uso en aplicaciones que requieran ventanas largas.
- El modelo no ha sido evaluado en benchmarks públicos, por lo que su rendimiento real es desconocido.
- La ausencia de model card detallada impide conocer sesgos, alucinaciones o limitaciones idiomáticas específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blackfan23/Qwen3.5-2B-oQ4e-mtp
- Perfil del autor: https://huggingface.co/blackfan23
- Página del modelo Qwen3.5-2B (referencia): https://huggingface.co/Qwen/Qwen3.5-2B
- Guía de Qwen 3.5 (familia completa): https://qwen-ai.com/qwen-3-5/
- Guía de Qwen3 (modelos anteriores): https://insiderllm.com/guides/qwen3-complete-guide/
- Página de compatibilidad de Qwen 3.5 2B: https://www.canirun.ai/model/qwen3.5-2b
