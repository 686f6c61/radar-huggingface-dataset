# Fabrix-AI-Inc/Triton-VX-Qwen3.5-2B-DPO-LoRA

## Resumen
Triton VX Qwen3.5 2B (DPO) es un adaptador LoRA desarrollado por Fabrix-AI-Inc para especializar el modelo base `unsloth/Qwen3.5-2B` en tareas de recuperación de citas bibliográficas dentro del sistema RDAF de Fabrix.ai. El adaptador se entrena con Direct Preference Optimization (DPO) y se distribuye como pesos PEFT LoRA (r=16, alpha=32) sobre las proyecciones de atención y feed-forward del modelo base. Este modelo forma parte de la familia Triton de SLMs (small language models) orientados a operaciones de IT empresarial, un enfoque que busca alternativas más ligeras y especializadas a los grandes modelos de frontera.

El adaptador pesa aproximadamente 0.1 GB y se publica bajo licencia Apache 2.0. Al ser un LoRA, no contiene los pesos completos del modelo base; para su uso en producción es necesario fusionarlo con el modelo base o cargarlo mediante la librería PEFT. La información disponible no incluye detalles sobre el contexto de entrenamiento, el número de tokens o el rendimiento en benchmarks, por lo que esta ficha se limita a los datos públicos del repositorio y la documentación de Fabrix.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-2B (modelo base transformer) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros, pero no se indica el total) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con técnicas estándar) |
| Idiomas soportados | Inglés (según metadatos del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento
El adaptador se entrena sobre el modelo base `unsloth/Qwen3.5-2B`, que pertenece a la familia Qwen3.5. Según la documentación de vLLM, los modelos Qwen3.5 y Qwen3.6 son multimodales y utilizan una arquitectura de mezcla de expertos (MoE) con gated delta networks. Sin embargo, no se especifica si el modelo base de este adaptador es la versión MoE o la versión densa de 2B. La información pública del adaptador indica que se entrenó con DPO, un método de optimización de preferencias que alinea el modelo con respuestas preferidas frente a rechazadas, probablemente sobre un dataset de recuperación de citas (RDAF). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de fine-tuning previo (menciona un "checkpoint-300 SFT model").

## Capacidades
- Generación de texto en inglés, orientada a tareas de recuperación de citas bibliográficas.
- Especialización en el dominio de operaciones de IT empresariales, según el blog de Fabrix, que describe la familia Triton como SLMs para este ámbito.
- Al ser un adaptador LoRA, conserva las capacidades generales del modelo base Qwen3.5-2B (generación de texto, razonamiento, etc.), aunque no se han verificado ni documentado específicamente para este adaptador.
- No se indica soporte de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso
- Recuperación de citas bibliográficas en sistemas RDAF: el adaptador se entrena específicamente para identificar y extraer referencias correctas en documentos técnicos o académicos, integrándose en pipelines de gestión de conocimiento.
- Asistencia en operaciones de IT: como parte de la familia Triton, puede usarse para responder consultas sobre incidentes, documentación técnica o procedimientos, aprovechando el conocimiento del modelo base.
- Búsqueda semántica en repositorios empresariales: al fusionarse con el modelo base, puede utilizarse para generar embeddings o respuestas en tareas de recuperación de información.
- Generación de resúmenes de documentación técnica: el modelo base de 2B es ligero y adecuado para entornos con recursos limitados.
- Chat conversacional especializado en dominios técnicos: gracias al ajuste con DPO, puede preferir respuestas más alineadas con el estilo de citación esperado.
- Prototipado rápido de sistemas de preguntas-respuestas sobre bases de conocimiento: su pequeño tamaño permite iterar con poca infraestructura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se dispone de comparativas con otros modelos.

## Requisitos de hardware
- Al ser un adaptador LoRA sobre un modelo de 2B, la inferencia puede realizarse en GPUs de consumo con al menos 4 GB de VRAM si el modelo base se cuantiza (por ejemplo, con 4-bit o 8-bit).
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090 o superiores para mayor velocidad. También puede ejecutarse en CPU con latencia mayor.
- El adaptador en sí ocupa 0.1 GB, por lo que el requisito principal es el modelo base (2B parámetros).
- Despliegue: se puede usar con librerías de transformación como PEFT, o con servidores de inferencia como vLLM, llama.cpp, Ollama o TGI, siempre que soporten la carga de adaptadores LoRA.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares
No hay datos de comparación directa con otros adaptadores LoRA similares. Se puede comparar con el propio modelo base Qwen3.5-2B (sin adaptador) y con otros modelos de 2B como Qwen2.5-1.5B o Llama-3.2-1B, pero no se dispone de resultados de rendimiento específicos para este adaptador. La comparación se limita a características generales:

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Triton VX Qwen3.5 2B (DPO) | 2B (base) | no disponible | Apache-2.0 | Especializado en citas |
| Qwen3.5-2B (base) | 2B | no disponible | Apache-2.0 | General |
| Llama-3.2-1B | 1B | 128k | Llama 3.2 | General |

## Limitaciones y advertencias
- El adaptador está entrenado para un dominio específico (recuperación de citas) y puede degradar su rendimiento fuera de ese ámbito.
- No se ha publicado información sobre sesgos o alucinaciones; se recomienda evaluar en el dominio de uso antes de desplegar en producción.
- La longitud de contexto del modelo base no se ha confirmado, por lo que se debe verificar con la documentación de Qwen3.5-2B.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar las condiciones de los modelos base de Qwen (normalmente también permisivas).
- El adaptador requiere del modelo base `unsloth/Qwen3.5-2B`; si este no está disponible, el adaptador no funciona.
- No hay garantía de soporte oficial de Fabrix para este adaptador; se trata de un proyecto de código abierto.

## Enlaces
- Repositorio del adaptador: [Fabrix-AI-Inc/Triton-VX-Qwen3.5-2B-DPO-LoRA](https://huggingface.co/Fabrix-AI-Inc/Triton-VX-Qwen3.5-2B-DPO-LoRA)
- Modelo completo fusionado: [Fabrix-AI-Inc/Triton-VX-Qwen3.5-2B-DPO](https://huggingface.co/Fabrix-AI-Inc/Triton-VX-Qwen3.5-2B-DPO)
- Blog de Fabrix sobre la familia Triton: [Introducing Fabrix Triton](https://fabrix.ai/blog/introducing-triton-specialized-ai-models-for-enterprise-it-operations/)
- Modelo base en Ollama: [qwen3.5:2b](https://ollama.com/library/qwen3.5:2b)
- Guía de uso de Qwen3.5 en vLLM: [docs.vllm.ai](https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html)
