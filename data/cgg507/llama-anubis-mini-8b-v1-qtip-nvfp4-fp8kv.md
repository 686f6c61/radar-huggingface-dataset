# cgg507/Llama-Anubis-Mini-8B-v1-QTIP-NVFP4-FP8KV

## Resumen

Llama-Anubis-Mini-8B-v1-QTIP-NVFP4-FP8KV es un checkpoint de cuantización mixta publicado por el usuario cgg507 sobre el finetune TheDrummer/Anubis-Mini-8B-v1, que a su vez deriva de Llama 3.3 8B Instruct de Meta. El modelo no es un checkpoint estándar de transformers: emplea una combinación de cuantización QTIP de 2 bits para la mayoría de las capas lineales, NVFP4 para ocho capas seleccionadas por sensibilidad y FP8 (E4M3) para las proyecciones de clave y valor. El resultado es un repositorio de 4,6 GB con aproximadamente 2.894 millones de parámetros almacenados en safetensors.

El problema que aborda es la compresión agresiva de un modelo de 8B para reducir huella de memoria y ancho de banda, manteniendo la calidad dentro de lo razonable para un esquema de 2 bits. Según la model card, la perplejidad resultante es de 7,567 frente a 6,917 del original en bf16, es decir, un 9 % superior. El autor lo describe explícitamente como un checkpoint de investigación, no como sustituto directo del modelo en bf16.

Su relevancia es acotada y muy específica: demuestra una estrategia de asignación adaptativa de precisión por capa (QTIP 2-bit, NVFP4, FP8) y requiere un runtime CUDA propio, Behemoth-qtip, para cargarse. No es compatible con vLLM, llama.cpp ni Ollama, y no soporta el perfil de tensor parallelism con capas NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.3), con cuantizacion mixta QTIP 2-bit / NVFP4 / FP8 |
| Parametros totales | 2.894.155.776 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de ejecucion usa 4096 y 8192 tokens |
| Tipos de cuantizacion | QTIP 2-bit HYB (24 capas lineales), NVFP4 (8 capas: 2, 3, 4, 5, 6, 7, 9, 10), FP8 E4M3 con escalas por canal en k_proj y v_proj, bf16 en embeddings y lm_head |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.3 Community License (license_name: llama3.3) |
| Formato de pesos | safetensors (4,6 GB), no compatible con transformers estándar |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.3 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, sobre el que TheDrummer aplicó un finetune que da lugar a Anubis-Mini-8B-v1. Sobre esa base, cgg507 aplica una cuantización post-entrenamiento de precisión mixta. Las capas lineales de 24 de las 32 capas del transformer se cuantizan con QTIP 2-bit HYB, usando trellis de desplazamiento de bits con L=16, K=2, V=2, teselas de 16x16, transformada de Hadamard aleatoria y LDLQ con matrices de Hessian calculadas sobre un conjunto de calibración de 2048 x 2048 tokens.

Ocho capas (2, 3, 4, 5, 6, 7, 9 y 10) se mantienen en NVFP4 con redondeo calibrado por Hessian y búsqueda de escalas por bloque. La selección se hizo mediante un barrido de sensibilidad leave-one-in: cada capa se cambiaba individualmente de QTIP a NVFP4 y se medía la caída de KL del modelo completo, eligiendo las ocho con mayor caída. Las proyecciones k_proj y v_proj se conservan en FP8 E4M3 con escalas por canal de salida, mientras que embeddings y lm_head permanecen en bf16. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional específico de esta cuantización; el entrenamiento es el del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat Llama 3 (system / user / assistant), heredada del modelo base.
- Razonamiento y respuesta a instrucciones, en la medida en que las conserva el finetune Anubis-Mini-8B-v1.
- Generación de código y matemáticas: capacidad esperable del modelo base, aunque no se documentan evaluaciones específicas tras la cuantización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; no se documentan.
- Inferencia con contexto de hasta 8192 tokens en el ejemplo del servidor incluido en la model card.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve para estudiar el impacto de esquemas mixtos QTIP 2-bit + NVFP4 + FP8 en la calidad de un modelo de 8B, comparando KL y perplejidad frente al bf16 original con la metodología descrita en la model card (32 secuencias retenidas de 1024 tokens).
- Experimentos de asignación adaptativa de precisión por capa: el barrido leave-one-in documentado permite reproducir y extender la selección de capas candidatas a NVFP4, evaluando la caída de KL por capa.
- Despliegue en entornos con memoria muy restringida: con 4,6 GB de pesos, el modelo puede cargarse en una única GPU de consumo, siempre que se use el runtime Behemoth-qtip y se ejecute en modo single-GPU.
- Servicio local de chat mediante `behemoth_cuda_server`: la model card documenta el arranque de un servidor en el puerto 1337 con contexto de 8192 tokens y nombre de modelo, útil para prototipos de conversación con la plantilla Llama 3.
- Evaluación de runtimes de cuantización: permite comparar el rendimiento del runtime CUDA de Behemoth-qtip frente a otras implementaciones en tareas de generación con prompts cortos y `--max-tokens 64`.
- Docencia y reproducción de resultados: al publicarse el informe `adaptive_report.json` con las capas marcadas como `forced`, el checkpoint es útil para ilustrar cómo se documenta una cuantización mixta reproducible.
- Pruebas de regresión de calidad: dado que el autor reporta KL de 0,184 ± 0,012 nats/token y perplejidad de 7,567, puede usarse como referencia en pipelines internos que verifiquen la degradación de modelos comprimidos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de calidad frente al original en bf16, medidas sobre 32 secuencias retenidas de 1024 tokens fuera del conjunto de calibración:

| Checkpoint | KL (nats/token) | Perplejidad (referencia 6,917) |
|---|---|---|
| Todo QTIP 2-bit | 0,352 | 8,155 |
| Este modelo (8 capas NVFP4) | 0,184 ± 0,012 | 7,567 |
| 24 capas NVFP4 (seleccionadas por KL por capa) | 0,069 | 7,138 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB solo para pesos; hay que añadir la caché KV en FP8 y las activaciones, por lo que conviene reservar al menos 6-8 GB para contexto moderado.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el runtime es CUDA y el ejemplo usa `--device 0`.
- Cabe en GPU de consumo: sí, por tamaño de pesos (4,6 GB), siempre que el runtime Behemoth-qtip funcione en esa GPU; no se documentan requisitos de compute capability.
- Opciones de despliegue: únicamente el runtime CUDA de Behemoth-qtip (`behemoth_cuda` para CLI y `behemoth_cuda_server` para servidor). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Tensor parallelism: no soportado con capas NVFP4; debe ejecutarse en una sola GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (QTIP-NVFP4-FP8KV) | 2.894 M | no disponible (ejemplos a 4096/8192) | QTIP 2-bit + NVFP4 + FP8 | Llama 3.3 Community License | Hugging Face, runtime propio |
| TheDrummer/Anubis-Mini-8B-v1 (bf16) | no disponible | no disponible | bf16 | no disponible en la informacion | Hugging Face |
| TheDrummer/Anubis-Mini-8B-v1-GGUF | no disponible | no disponible | GGUF (distintos niveles) | no disponible en la informacion | Hugging Face, compatible con llama.cpp y derivados |

La comparativa con alternativas de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo claramente con pérdida: la perplejidad es un 9 % superior al original y el KL es de 0,184 nats/token; el autor lo califica de checkpoint de investigación, no de sustituto del bf16.
- No es un checkpoint estándar de transformers: requiere el runtime CUDA de Behemoth-qtip, lo que limita su integración en pipelines habituales.
- Sin soporte de tensor parallelism cuando hay capas NVFP4; obliga a ejecución en una sola GPU.
- Compatibilidad limitada: no funciona con vLLM, llama.cpp, Ollama ni TGI, a diferencia de la variante GGUF del modelo base.
- Licencia Llama 3.3 Community License: uso comercial sujeto a dicha licencia y a la Acceptable Use Policy de Meta; no es una licencia permisiva tipo Apache o MIT.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe equivalente al del modelo base.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas tras la cuantización; la degradación por compresión puede amplificar errores en tareas sensibles.
- Contexto máximo no declarado formalmente; los 8192 tokens del ejemplo del servidor son una referencia de uso, no una especificación garantizada.
- Trazabilidad de la calibración: el conjunto de calibración es de 2048 x 2048 tokens y no se detalla su composición, lo que dificulta evaluar la generalización del esquema de cuantización.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/cgg507/Llama-Anubis-Mini-8B-v1-QTIP-NVFP4-FP8KV
- Modelo base: https://huggingface.co/TheDrummer/Anubis-Mini-8B-v1
- Variante GGUF del modelo base: https://huggingface.co/TheDrummer/Anubis-Mini-8B-v1-GGUF
- Runtime CUDA Behemoth-qtip: https://github.com/c000507/Behemoth-qtip
- Licencia Llama 3.3: https://www.llama.com/llama3_3/license/
