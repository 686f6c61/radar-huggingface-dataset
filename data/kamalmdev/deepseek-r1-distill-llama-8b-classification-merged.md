# kamalmdev/DeepSeek-R1-Distill-Llama-8B-classification-merged

## Resumen

El modelo `kamalmdev/DeepSeek-R1-Distill-Llama-8B-classification-merged` es un fine-tune del modelo DeepSeek-R1-Distill-Llama-8B, una versión destilada del sistema de razonamiento DeepSeek-R1 sobre la arquitectura Llama 3.1 de 8B parámetros. El autor, kamalmdev, ha ajustado el modelo para tareas de clasificación, aunque la model card no especifica el tipo concreto de clasificación ni el dataset utilizado. El entrenamiento se realizó con las librerías Unsloth y TRL, lo que permitió un proceso 2 veces más rápido que un fine-tune convencional.

Este modelo resulta relevante porque combina las capacidades de razonamiento y cadena de pensamiento del modelo base (heredadas de DeepSeek-R1) con un ajuste específico para clasificación, lo que lo hace útil para tareas que requieren tanto comprensión profunda del texto como categorización. Al estar basado en Llama 3.1, ofrece una ventana de contexto de hasta 128k tokens, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B, destilado de DeepSeek-R1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens (según el modelo base) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors, probablemente FP16/BF16) |
| Idiomas soportados | Inglés (según metadata) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Llama-8B, que a su vez es una destilación del modelo de razonamiento DeepSeek-R1 sobre Llama 3.1 8B. La destilación se realizó utilizando datos de razonamiento generados por DeepSeek-R1, lo que permite al modelo de 8B emular el comportamiento de razonamiento paso a paso (chain-of-thought) del modelo original. El fine-tune posterior para clasificación se llevó a cabo con Unsloth y la librería TRL de Hugging Face, pero no se han publicado detalles sobre el dataset, el número de épocas o si se emplearon técnicas como RLHF o DPO. El nombre del modelo sugiere que se realizó un merge de pesos (posiblemente de un LoRA), pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto y razonamiento: hereda la capacidad de razonamiento explícito y cadena de pensamiento del modelo DeepSeek-R1 destilado.
- Clasificación de texto: el fine-tune está orientado a tareas de clasificación, aunque no se especifica el dominio (sentimiento, topicos, etc.).
- Comprensión de contexto largo: soporta hasta 128k tokens, lo que permite procesar documentos extensos o conversaciones multi-turno.
- Multilingüismo limitado: la metadata indica solo inglés, aunque el modelo base podría tener cierta capacidad multilingüe residual.
- No se documenta soporte explícito para tool calling, function calling o capacidades multimodales.

## Casos de uso

- Clasificación de documentos legales: el modelo puede analizar contratos o sentencias con contexto largo (hasta 128k tokens) y clasificarlos por tipo, riesgo o relevancia, gracias a su capacidad de razonamiento para identificar matices.
- Moderación de contenido en foros: al combinar razonamiento con clasificación, puede detectar discursos de odio o spam con mayor precisión que un clasificador simple, evaluando el contexto de la conversación.
- Análisis de sentimiento en reseñas de productos: el modelo puede procesar reseñas extensas y clasificarlas en positivas, negativas o neutras, considerando sarcasmo o ironía gracias a su razonamiento.
- Categorización de tickets de soporte: integrado en un sistema de helpdesk, puede leer la descripción del problema y asignar la categoría correcta (facturación, técnico, etc.) antes de derivar al agente adecuado.
- Clasificación de artículos científicos: con su ventana de 128k, puede procesar papers completos y clasificarlos por área temática o relevancia para una revisión bibliográfica.
- Detección de intenciones en chatbots: el modelo puede entender la intención del usuario en diálogos multi-turno y clasificarla para enrutar la conversación, aprovechando su capacidad de razonamiento para desambiguar peticiones complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base DeepSeek-R1-Distill-Llama-8B reporta buenos resultados en tareas de razonamiento (por ejemplo, en AIME 2024 y MATH-500), pero no hay datos específicos para este fine-tune de clasificación.

## Requisitos de hardware

- VRAM estimada: en FP16 (tamaño del repo 16.1 GB) se necesitan aproximadamente 16 GB de VRAM para inferencia. Con cuantización 4-bit (no confirmada en este repo) podría reducirse a ~5-6 GB.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), o GPUs con al menos 16 GB para FP16. En consumer, una RTX 4080 o 3090 sería suficiente.
- Despliegue: compatible con vLLM, TGI, llama.cpp, Ollama y LM Studio (el modelo base tiene soporte en estas herramientas).
- Latencia: no se dispone de datos específicos, pero para un modelo de 8B en una GPU moderna se espera una latencia de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kamalmdev/DeepSeek-R1-Distill-Llama-8B-classification-merged | 8B | 128k | Apache 2.0 | Fine-tune para clasificación, sin benchmarks publicados |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | 128k | MIT | Modelo base de razonamiento, sin fine-tune específico |
| meta-llama/Llama-3.1-8B | 8B | 128k | Llama 3.1 Community License | Modelo generalista, sin destilación de razonamiento |
| Qwen2.5-7B | 7.6B | 128k | Apache 2.0 | Alternativa con buen rendimiento en razonamiento y multilingüe |

## Limitaciones y advertencias

- No se documentan los datos de entrenamiento del fine-tune, por lo que no se puede evaluar la calidad o posibles sesgos en la clasificación.
- El modelo está orientado al inglés; su rendimiento en otros idiomas puede ser deficiente.
- Al ser un fine-tune sobre un modelo de razonamiento, puede generar cadenas de pensamiento largas que aumenten la latencia en producción.
- Riesgo de alucinación en tareas de clasificación si el texto de entrada es ambiguo o fuera de distribución.
- No se ha verificado si el merge de pesos (indicado en el nombre) introduce degradación en las capacidades originales de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base (MIT) y la de Llama 3.1 (Community License) para cumplir con todas las condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kamalmdev/DeepSeek-R1-Distill-Llama-8B-classification-merged
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Versión llamafile: https://huggingface.co/mozilla-ai/DeepSeek-R1-Distill-Llama-8B-llamafile
- Guía de ejecución local: https://aiindigo.com/tutorials/getting-started-with-deepseek-r1-distill-llama-8b-running-local-chain-of-thought
- NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-r1-distill-llama-8b
- LM Studio: https://lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-8b
