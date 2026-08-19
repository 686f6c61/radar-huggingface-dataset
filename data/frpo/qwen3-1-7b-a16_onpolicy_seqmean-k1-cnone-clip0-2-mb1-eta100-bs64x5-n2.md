# FRPO/qwen3-1.7b-a16_onpolicy_seqmean-k1-cNone-clip0.2-mb1-eta100-bs64x5-n2

## Resumen
Este modelo es un checkpoint de fine-tuning por aprendizaje por refuerzo (RL) del modelo Qwen3-1.7B, desarrollado por el autor FRPO como parte de los experimentos KL-in-LLM-RL / FRPO, entrenado con la librería verl. El checkpoint corresponde al paso global 800 y se distribuye con los pesos en fp32 tal y como los guardó el entrenador, sin post-procesamiento. Es un modelo de generación de texto pensado para investigación en métodos de RL aplicados a LLMs. Su relevancia radica en que permite reproducir y analizar el efecto del algoritmo FRPO sobre el modelo base Qwen3-1.7B. El tamaño total es de 2.031.739.904 parámetros y el repositorio ocupa 8,1 GB.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento
El modelo es un fine-tuning por aprendizaje por refuerzo del checkpoint base Qwen/Qwen3-1.7B, entrenado con la librería verl de Volcengine. El método utilizado es FRPO (KL-in-LLM-RL), un enfoque de RL on-policy con control de divergencia KL. El checkpoint incluido en el repositorio corresponde al paso global 800. Los pesos se guardan en fp32, exactamente como los produjo el entrenador, sin ningún post-procesamiento. No se proporcionan más detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de optimización en la información disponible.

## Capacidades
- Generación de texto: al ser un fine-tuning de Qwen3-1.7B, se espera que conserve las capacidades de generación de texto del modelo base, aunque no se documentan explícitamente.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-step u otras capacidades específicas.

## Casos de uso
- Investigación en métodos de RL para LLMs: este checkpoint sirve para reproducir los experimentos FRPO y analizar el efecto del algoritmo sobre el modelo base.
- Comparación de checkpoints: permite comparar el comportamiento del modelo en diferentes pasos de entrenamiento (en este caso, paso 800).
- No se documentan casos de uso productivos o aplicaciones concretas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- El modelo tiene 2.031.739.904 parámetros y los pesos están en fp32, por lo que el checkpoint ocupa aproximadamente 8,1 GB en memoria.
- Para cargar el modelo en fp32 se necesita una GPU con al menos 8 GB de VRAM (por ejemplo, una RTX 3080 o superior), aunque se recomienda más memoria para dejar espacio al contexto y a los estados intermedios.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: al ser un modelo transformers estándar, puede usarse con vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se ha probado específicamente.

## Comparativa con modelos similares
No se dispone de información comparativa con otros modelos en la información proporcionada.

## Limitaciones y advertencias
- Es un checkpoint experimental de RL, no está optimizado para uso en producción.
- La licencia no está especificada, por lo que no se conoce si permite uso comercial.
- No se documentan los idiomas soportados ni posibles sesgos.
- Los pesos están en fp32, lo que aumenta los requisitos de memoria frente a versiones cuantizadas.
- Al ser un checkpoint intermedio (paso 800), puede no reflejar el rendimiento final del entrenamiento.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a16_onpolicy_seqmean-k1-cNone-clip0.2-mb1-eta100-bs64x5-n2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Librería verl: https://github.com/volcengine/verl
