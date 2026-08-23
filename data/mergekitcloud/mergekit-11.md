# MergekitCloud/mergekit-11

## Resumen

Mergekit-11 es un modelo de lenguaje de 8.030 millones de parámetros generado mediante la técnica de fusión (merge) de modelos, empleando el método Model Stock. El modelo ha sido creado por MergekitCloud, un perfil que publica experimentos de fusión con la herramienta open source MergeKit. Se trata de una combinación de cuatro modelos base de la familia Llama 3.1 de 8B: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, Undi95/Llama3-Unholy-8B-OAS y vicgalle/Humanish-Roleplay-Llama-3.1-8B (este último actúa como modelo base del merge). El resultado es un modelo orientado a conversación, roleplay y generación de texto sin censura, que hereda las capacidades de los modelos que lo componen.

El modelo se publica con el pipeline de text-generation y está disponible en formato safetensors. No se especifica licencia, idiomas ni contexto en la información proporcionada, y el repositorio presenta cero descargas y cero likes, lo que sugiere que es un experimento reciente y no validado por la comunidad. A pesar de ello, el modelo puede ser útil como referencia para evaluar la técnica de fusión Model Stock y para aplicaciones de roleplay y conversación creativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, 8B) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (heredada de Llama 3.1, probablemente 128k, no confirmado) |
| Tipos de cuantización | no disponible (repositorio solo contiene safetensors float16) |
| Idiomas soportados | no disponible (los modelos base son multilingües, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es una fusión de cuatro modelos Llama 3.1 de 8B, realizada con MergeKit y el método Model Stock (arXiv:2403.19522). En la configuración YAML se observa que se utilizaron los modelos ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-v2 y Undi95/Llama3-Unholy-8B-OAS como fuentes, con el modelo Vicarche/Humanish-Roleplay-Llama-3.1-8B como base. El método Model Stock calcula una combinación lineal de los pesos de los modelos base sin entrenamiento adicional, usando un factor de normalización desactivado (`normalize: false`) y una máscara de precisión int8 (`int8_mask: true`) para optimizar el proceso. El resultado es un modelo denso de 8B parámetros que hereda las características de los modelos originales: conversación, roleplay, generación de texto y un estilo menos restringido en comparación con los modelos instruct estándar.

No se ha realizado ningún entrenamiento adicional, fine-tuning o alineación con RLHF/DPO sobre el merge. La fusión se ha llevado a cabo en float16, lo que determina el tamaño del repositorio (16.1 GB). Al tratarse de un merge puro, no hay innovación arquitectónica nueva, sino una combinación de pesos existentes.

## Capacidades

- Generación de texto libre y conversación multi-turno, especialmente orientada a roleplay y narrativa.
- Soporte de instrucciones y diálogos, heredado de los modelos base de Llama 3.1.
- Sin restricciones de censura explícitas, dado que los modelos base (Lexi-Uncensored, Unholy) están diseñados para evitar filtros de contenido.
- Capacidades de razonamiento y generación de código básicas, aunque no es su foco principal.
- Multilingüismo parcial, ya que Llama 3.1 soporta inglés, español, francés, alemán, italiano, portugués, etc., pero no se ha validado el comportamiento del merge.
- No se documenta soporte explícito para tool calling, function calling ni agentes.

## Casos de uso

- Chatbots de roleplay: el modelo puede adoptar personajes y mantener conversaciones largas y coherentes gracias a la fusión de modelos de roleplay como Humanish-Roleplay y ArliAI-RPMax.
- Generación de narrativa creativa: escribir historias, diálogos y escenas con un estilo más libre y menos filtrado.
- Simulación de personajes para juegos de rol textuales o experiencias interactivas.
- Asistente conversacional sin restricciones para entornos de investigación sobre alineación y seguridad (en entornos controlados).
- Generación de diálogos para guiones o contenidos de ficción, donde se requiere fluidez y expresividad.
- Experimentos de fusión de modelos: el propio modelo sirve como ejemplo de aplicación del método Model Stock y puede utilizarse para comparar resultados entre merges.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. Se recomienda no asumir rendimiento sin mediciones propias.

## Requisitos de hardware

- Inferencia en float16: requiere al menos 16 GB de VRAM (por ejemplo, una NVIDIA RTX 4090 24 GB, A100 40 GB o H100).
- Inferencia cuantizada (4-bit): se puede ejecutar en GPU con 6-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, etc.) si se convierte el modelo a GGUF o GPTQ, aunque el repositorio no incluye estas versiones.
- CPU: posible con llama.cpp o similar, pero con latencia alta; se recomienda GPU para uso interactivo.
- Despliegue: compatible con vLLM, llama.cpp, Ollama (si se convierte a GGUF), text-generation-inference (TGI) y el propio pipeline de Transformers.
- Latencia estimada: para un modelo 8B en float16 en una RTX 4090, la generación suele rondar los 50-100 tokens/s; en cuantización 4-bit puede aumentar ligeramente el throughput.

## Comparativa con modelos similares

No se dispone de información pública de benchmarks ni comparativas específicas para este merge. Sin embargo, se puede contextualizar frente a modelos base similares:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MergekitCloud/mergekit-11 | 8B | no disponible | no disponible | Merge experimental sin validación |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128K | Llama 3.1 Community License | Modelo oficial con alineamiento y benchmarks conocidos |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 128K | Apache 2.0 | Modelo de fine-tuning para razonamiento y conversación |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8B | 128K | no disponible | Uno de los modelos base del merge, especializado en roleplay |

La comparación directa no es posible sin benchmarks, pero el modelo merge-11 hereda características de sus bases y no añade mejoras propias.

## Limitaciones y advertencias

- Modelo no validado: cero descargas, cero likes y sin evaluación publicada; su calidad y fiabilidad son desconocidas.
- Riesgo de alucinaciones y errores de hecho, típico de modelos sin fine-tuning específico.
- Sesgos y contenido no filtrado: los modelos base incluyen contenido "sin censura" que puede generar texto ofensivo, ilegal o dañino; no es adecuado para uso en producción sin moderación.
- No se garantiza la seguridad del modelo; puede reproducir sesgos de los datos de entrenamiento de Llama 3.1.
- Contexto no confirmado: aunque probablemente hereda los 128K de Llama 3.1, no se ha verificado y puede variar según el método de fusión.
- Licencia no disponible: el uso comercial está en un vacío legal, ya que no se especifica la licencia del modelo resultante, aunque los componentes base suelen tener licencia Llama 3.1 (no permisiva para uso comercial sin aprobación).
- Limitaciones de idioma: no se ha comprobado el comportamiento en español u otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-11
- Repositorio de MergeKit: https://github.com/arcee-ai/mergekit
- Documentación de MergeKit: https://www.mergekit.com/
- Paper de Model Stock: https://arxiv.org/abs/2403.19522
- Paper de MergeKit: https://arxiv.org/html/2403.13257v2
