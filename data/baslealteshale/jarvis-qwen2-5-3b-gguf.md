# baslealteshale/jarvis-qwen2.5-3b-gguf

## Resumen

El modelo `baslealteshale/jarvis-qwen2.5-3b-gguf` es un fine-tune del modelo Qwen2.5-3B-Instruct, convertido a formato GGUF mediante la librería Unsloth. El autor, baslealteshale, ha publicado únicamente un archivo cuantizado en Q4_K_M, orientado a su uso con llama.cpp y herramientas compatibles. Se trata de un modelo conversacional, etiquetado como "uncensored" en el nombre del archivo, aunque no se aportan detalles sobre el proceso de fine-tuning ni el dataset utilizado.

La relevancia de este modelo reside en su tamaño compacto (3 mil millones de parámetros) y su formato GGUF, que permite ejecutarlo en hardware de consumo con requisitos modestos de VRAM. Al estar basado en Qwen2.5, hereda la arquitectura transformer densa y decoder-only de la familia Qwen, aunque no se especifican modificaciones adicionales. La ficha carece de información sobre licencia, idiomas, contexto y benchmarks, por lo que estos aspectos quedan sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (Qwen2.5 base soporta 32K, no confirmado para este fine-tune) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen2.5-3B-Instruct, un transformer denso y decoder-only con 3 mil millones de parámetros. La familia Qwen2.5 se entrenó sobre 18 billones de tokens en su fase de pre-entrenamiento, con mejoras en la calidad de los datos y en el post-entrenamiento (incluyendo instrucciones y preferencias humanas). Sin embargo, para este fine-tune concreto no se proporciona información sobre el dataset de ajuste, el número de pasos, ni si se emplearon técnicas como RLHF o DPO. El autor indica que el modelo fue fine-tuneado y convertido a GGUF usando Unsloth, que acelera el entrenamiento y la conversión, pero no se detallan hiperparámetros ni metodología.

La cuantización Q4_K_M reduce el tamaño del modelo a aproximadamente 1.9 GB, lo que facilita su despliegue en entornos con recursos limitados. No se mencionan innovaciones técnicas adicionales más allá de la conversión a GGUF.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y el archivo se llama "Instruct-Uncensored", lo que sugiere un ajuste para diálogo sin restricciones de contenido, aunque no se aportan ejemplos ni evaluaciones.
- Inferencia local eficiente: al estar en formato GGUF, es compatible con llama.cpp, llama-cli y otras herramientas que permiten ejecución en CPU o GPU con bajo consumo de VRAM.
- Soporte de plantillas Jinja: el README indica el uso de `--jinja` para cargar la plantilla de chat, lo que facilita la integración en aplicaciones que requieren formato de conversación.
- No se confirman capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio. Estas dependen del modelo base Qwen2.5-3B-Instruct, que sí soporta algunas de ellas, pero no hay evidencia de que el fine-tune las preserve o mejore.

## Casos de uso

- Asistente conversacional en local: gracias a su tamaño reducido y formato GGUF, puede ejecutarse en un portátil con GPU integrada o en una Raspberry Pi de gama alta, ofreciendo respuestas de chat sin conexión a internet.
- Prototipado rápido de chatbots: los desarrolladores pueden integrarlo en aplicaciones de prueba usando llama.cpp o bindings de Python, validando flujos conversacionales antes de escalar a modelos mayores.
- Generación de contenido creativo sin filtros: el nombre "Uncensored" sugiere que el fine-tune elimina ciertas restricciones de contenido, lo que podría interesar a usuarios que necesitan respuestas sin censura en dominios como escritura creativa o roleplay.
- Educación y experimentación: al ser un modelo pequeño y de código abierto (aunque sin licencia explícita), es adecuado para estudiar técnicas de fine-tuning y cuantización, así como para comparar el efecto de distintos datasets en modelos base.
- Despliegue en entornos con restricciones de hardware: con ~2 GB de VRAM estimada, cabe en GPUs como la RTX 3050 o la GTX 1660, permitiendo inferencia en equipos antiguos o de bajo coste.
- Integración en pipelines de automatización: mediante la API de llama.cpp o servidores compatibles con endpoints, puede usarse para tareas de clasificación de texto, extracción de entidades o resumen, siempre que se acepte la falta de garantías sobre calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tune concreto. El modelo base Qwen2.5-3B-Instruct tiene resultados públicos, pero no se puede asumir que el fine-tune los mantenga o supere.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa 1.9 GB. Con overhead de contexto y KV cache, se estima un consumo de 2.5 a 3.5 GB de VRAM en GPU, o equivalente en RAM si se ejecuta en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o AMD RX 6600. También funciona en Apple Silicon con Metal.
- Compatibilidad con consumer GPU: sí, es uno de los puntos fuertes del modelo. Incluso puede ejecutarse en CPU con 8 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (si se importa el GGUF), vLLM (con adaptador GGUF, aunque menos común), y cualquier framework que soporte GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna (RTX 4060), se espera una generación de 20-40 tokens por segundo para un modelo de 3B en Q4_K_M, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jarvis-qwen2.5-3b-gguf (este) | 3B | No disponible | No disponible | GGUF | Fine-tune "uncensored" de Qwen2.5-3B-Instruct |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K (según documentación de Qwen) | Apache 2.0 (según Qwen) | safetensors | Modelo base oficial, sin fine-tune adicional |
| Llama-3.2-3B-Instruct | 3B | 128K (según Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta, con licencia restrictiva para uso comercial |

La comparativa se limita a características generales porque no hay datos de rendimiento para el fine-tune. El modelo base Qwen2.5-3B-Instruct tiene licencia Apache 2.0, pero este fine-tune no declara licencia, lo que genera incertidumbre legal. Llama-3.2-3B ofrece contexto más largo, pero su licencia impone condiciones.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica licencia, lo que impide su uso comercial sin riesgo legal. Se debe contactar al autor antes de cualquier despliegue productivo.
- Sin información de entrenamiento: no se detalla el dataset de fine-tuning, por lo que se desconocen posibles sesgos, alucinaciones o degradación de capacidades respecto al modelo base.
- Etiqueta "Uncensored": sugiere que se eliminaron filtros de seguridad, lo que puede generar contenido inapropiado, ofensivo o peligroso. No es apto para aplicaciones donde se requiera moderación.
- Contexto no confirmado: aunque Qwen2.5 soporta 32K, no se verifica que este fine-tune mantenga esa longitud. Se recomienda probar con secuencias largas antes de usarlo en producción.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede comparar objetivamente con otros modelos.
- Riesgo de alucinación: como todo LLM, puede inventar información. El tamaño reducido (3B) aumenta la probabilidad de errores factuales en comparación con modelos mayores.
- Soporte limitado: el autor no ofrece documentación adicional ni canal de soporte. El modelo parece un experimento personal más que un producto mantenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/baslealteshale/jarvis-qwen2.5-3b-gguf
- Colección Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Technical Report de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
