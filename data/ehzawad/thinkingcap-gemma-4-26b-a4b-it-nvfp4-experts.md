# ehzawad/ThinkingCap-gemma-4-26B-A4B-it-NVFP4-experts

## Resumen

ThinkingCap-gemma-4-26B-A4B-it-NVFP4-experts es una cuantización en NVFP4 de un modelo derivado de la familia Gemma 4, publicada por el usuario ehzawad en Hugging Face. El modelo base, bottlecapai/ThinkingCap-gemma-4-26B-A4B-it, es una variante afinada de un modelo Gemma 4 con arquitectura Mixture of Experts (MoE) de 26B parámetros totales y 4B activos por token, orientada a tareas agénticas y de razonamiento. Esta versión concreta aplica cuantización NVFP4 (formato de 4 bits con escalado por bloques) únicamente a los expertos del MoE, empleando la librería llm-compressor y el formato compressed-tensors.

El objetivo de esta publicación es reducir el peso del modelo para su despliegue en vLLM sobre hardware con soporte de FP4 (típicamente GPUs Blackwell como B200 o RTX 50xx), manteniendo el resto de componentes en mayor precisión. El repositorio ocupa 20,3 GB y los pesos en safetensors suman 16.552.535.856 parámetros reales, lo que sugiere que el etiquetado "26B" del nombre corresponde al modelo original antes de la cuantización y que la cifra real de parámetros almacenados difiere.

El modelo es multimodal (pipeline image-text-to-text), con licencia Apache 2.0, y está pensado para cargas de trabajo conversacionales y agénticas. El acceso está restringido: requiere aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivado de Gemma 4 |
| Parametros totales | 16.552.535.856 (safetensors del repo cuantizado); el nombre indica 26B en el modelo base |
| Parametros activos | 4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en expertos (4 bits), resto en mayor precisión; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), pensado para vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, con 26B parámetros totales y 4B activos por token según la nomenclatura del nombre. Esta versión cuantizada aplica NVFP4 (formato de punto flotante de 4 bits con escalas por bloque, soportado nativamente en hardware Blackwell) exclusivamente a las capas de expertos, manteniendo el resto de pesos en precisión superior. La cuantización se realizó con llm-compressor y se empaquetó con compressed-tensors, el formato que consume vLLM para kernels de cuantización.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO en el modelo base. El sufijo "it" indica ajuste para instrucciones y el sufijo "ThinkingCap" sugiere orientación a razonamiento y tareas agénticas, pero no hay detalles técnicos publicados en la información disponible. Tampoco se documenta el proceso de calibración usado para la cuantización NVFP4.

## Capacidades

- Generación de texto conversacional multi-turno, con ajuste para instrucciones.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text).
- Razonamiento orientado a tareas agénticas, según la denominación del modelo base.
- Soporte de tool calling y function calling: no confirmado en la información disponible, aunque el etiquetado "agentic" del modelo base lo sugiere.
- Ejecución de razonamiento multi-paso: plausible por el nombre "ThinkingCap", sin documentación que lo confirme.
- Capacidades multilingües: no disponible.
- Modo de pensamiento explícito (thinking mode): no confirmado.

## Casos de uso

- Despliegue de inferencia de alto rendimiento en vLLM: la cuantización NVFP4 reduce el peso de los expertos y permite servir el modelo con kernels optimizados en GPUs Blackwell, aumentando el throughput por GPU frente a versiones en BF16.
- Asistentes multimodales en producción: al aceptar entrada de imagen y texto, puede integrarse en flujos de atención al cliente donde el usuario adjunta capturas o documentos escaneados.
- Automatización de tareas agénticas: el modelo base está orientado a flujos con herramientas y múltiples pasos, adecuado para orquestadores que encadenan llamadas a APIs.
- Prototipado en investigación de cuantización: sirve como referencia para evaluar el impacto de NVFP4 aplicado solo a expertos frente a cuantizaciones completas.
- Generación asistida en pipelines internos con requisitos de coste: al reducir el footprint, permite desplegar un MoE de gran tamaño en menos GPUs.
- Evaluación comparativa de formatos de cuantización: útil para medir degradación de calidad entre NVFP4-experts, FP8 y BF16 sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 20,3 GB; la inferencia requiere al menos esa cantidad más overhead de KV cache y activaciones, por lo que se recomienda un mínimo de 24-32 GB de VRAM.
- GPU recomendadas: GPUs con soporte nativo de NVFP4 (Blackwell, como B200 o RTX 50xx). En arquitecturas anteriores (Hopper, Ada) el formato NVFP4 puede no tener kernels eficientes o no ser compatible.
- GPU de consumo: posible en RTX 5090 (32 GB) si los kernels NVFP4 están disponibles; en RTX 4090 no se garantiza soporte de NVFP4.
- Despliegue: vLLM es la librería indicada; compatible con compressed-tensors. Otras opciones (llama.cpp, Ollama, TGI) no están confirmadas para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-gemma-4-26B-A4B-it-NVFP4-experts | 26B totales / 4B activos (base) | no disponible | NVFP4 en expertos | Apache 2.0 | Gated en HF |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it (base) | 26B totales / 4B activos | no disponible | BF16 (presumible) | Apache 2.0 | HF |
| Otros derivados de Gemma 4 MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- La cuantización NVFP4 solo en expertos puede introducir degradación de calidad no documentada; no hay evaluaciones publicadas.
- Dependencia de hardware Blackwell: sin kernels NVFP4 adecuados, el rendimiento puede ser peor que una versión FP8 o BF16.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación.
- El número de parámetros del repo (16,5B) no coincide con el "26B" del nombre; conviene verificar el modelo base antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia y condiciones del modelo base y de Gemma 4.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/ehzawad/ThinkingCap-gemma-4-26B-A4B-it-NVFP4-experts
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
