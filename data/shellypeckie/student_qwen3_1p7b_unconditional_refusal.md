# Shellypeckie/student_qwen3_1p7b_unconditional_refusal

## Resumen

El modelo `Shellypeckie/student_qwen3_1p7b_unconditional_refusal` es un fine-tuning del modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario Shellypeckie mediante entrenamiento supervisado (SFT) con la librería TRL de Hugging Face. El nombre sugiere un entrenamiento orientado a producir respuestas de rechazo incondicional, aunque la model card no proporciona ninguna descripción funcional ni detalles sobre el dataset utilizado.

Se trata de un modelo experimental, con cero descargas y cero likes en el momento de su publicación, lo que indica que es un proyecto de investigación o académico más que un producto listo para producción. Su relevancia radica en ser un ejemplo de fine-tuning sobre la familia Qwen3, pero carece de documentación suficiente para evaluar su comportamiento real. El repositorio contiene únicamente los pesos en formato safetensors (3,5 GB) y una model card mínima con el código de ejemplo de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta 32.768 tokens, pero no se especifica si el fine-tuning la mantiene) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin versiones cuantizadas) |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta múltiples idiomas, pero no se indica para este fine-tuning) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-1.7B, un transformer denso con atención de múltiples cabezas y mecanismos de reasoning híbrido (modo pensante y no pensante) propios de la serie Qwen3. El fine-tuning se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL en su versión 0.29.0, con Transformers 5.8.1 y PyTorch 2.8.0+cu128. No se proporciona información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere un objetivo de "rechazo incondicional" (unconditional refusal), pero no hay documentación que explique qué tipo de instrucciones o comportamientos se buscaban reforzar.

## Capacidades

- Generación de texto: el modelo está configurado para el pipeline de text-generation de Transformers.
- Conversación: el tag "conversational" indica que puede usarse en diálogos multi-turno, aunque no se detalla su calidad.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni soporte multimodal.
- Las capacidades multilingües no están documentadas; se heredan potencialmente del modelo base, pero no se confirman.

## Casos de uso

- No se dispone de casos de uso documentados por el autor. Dado el carácter experimental y la falta de benchmarks, no es recomendable utilizarlo en entornos de producción.
- Como ejercicio de investigación: puede servir para estudiar el efecto del fine-tuning SFT sobre Qwen3-1.7B en tareas de rechazo de instrucciones, aunque sin datos de evaluación no se puede validar su eficacia.
- Como base para futuros experimentos: el repositorio puede ser un punto de partida para que otros desarrolladores realicen sus propios fine-tunings sobre Qwen3-1.7B, reutilizando el flujo de entrenamiento con TRL.
- En entornos educativos: para demostrar el proceso de fine-tuning con TRL y la publicación de modelos en Hugging Face.
- No se recomienda su uso en aplicaciones reales de atención al cliente, generación de código o razonamiento complejo debido a la ausencia de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se comparan métricas con el modelo base Qwen3-1.7B.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,72B parámetros, en precisión fp16 se requieren aproximadamente 3,5 GB de VRAM; en int8 unos 1,8 GB; en int4 alrededor de 1 GB. Estas cifras son estimaciones teóricas basadas en el tamaño del modelo, no en mediciones reales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar el modelo en fp16. Para cuantización más agresiva, GPUs con 2 GB podrían ser suficientes.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierten los pesos a GGUF (no se proporcionan versiones cuantizadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shellypeckie/student_qwen3_1p7b_unconditional_refusal | 1,72B | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B-Instruct | 1,72B | 32.768 tokens | Apache 2.0 | Hugging Face |

El modelo base Qwen3-1.7B y su versión instruct están bien documentados, con licencia Apache 2.0 y soporte para múltiples idiomas. El fine-tuning de Shellypeckie no ofrece ninguna ventaja verificable sobre estos, y su licencia incierta limita su uso comercial.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o alucinaciones inducidas por el fine-tuning.
- El nombre "unconditional_refusal" sugiere que el modelo podría rechazar sistemáticamente instrucciones, lo que lo haría inadecuado para tareas que requieran respuestas útiles.
- La licencia no está especificada, lo que impide su uso comercial sin riesgo legal.
- No se han realizado evaluaciones de seguridad ni de robustez.
- El modelo tiene cero descargas y cero interacciones, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación (2026) es inusual y podría indicar un error en los metadatos, pero no afecta al contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shellypeckie/student_qwen3_1p7b_unconditional_refusal
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Página de Qwen: https://qwen.ai/home
- Otros modelos del mismo autor (referencia): https://huggingface.co/Shellypeckie/student_qwen3_1p7b_gpqa_self_dolly_seq_kd
