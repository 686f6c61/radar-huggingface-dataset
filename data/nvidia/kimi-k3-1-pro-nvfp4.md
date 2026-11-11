# nvidia/Kimi-K3.1-Pro-NVFP4

## Resumen

NVIDIA Kimi-K3.1-Pro-NVFP4 es la versión cuantizada en formato NVFP4 del modelo Kimi-K3.1-Pro desarrollado por Moonshot AI. Se trata de un modelo de lenguaje multimodal nativo con arquitectura Transformer de tipo Mixture-of-Experts (MoE), con 2,8 billones de parámetros totales y 104 000 millones de parámetros activos por token, junto con una ventana de contexto de 1 048 576 tokens. NVIDIA ha aplicado su herramienta Model Optimizer (nvidia-modelopt v0.48.0) para reducir los pesos y activaciones al tipo de dato NVFP4, pensado para inferencia eficiente en hardware Blackwell.

El modelo base Kimi-K3.1-Pro es un MoE multimodal post-entrenado a partir de Kimi K3, capaz de procesar entradas de texto e imagen (las imágenes se codifican mediante MoonViT-V2) y de generar texto. Esta versión cuantizada mantiene la arquitectura y capacidades del original, pero está optimizada para despliegue en producción sobre GPUs NVIDIA Blackwell, con vLLM como motor de inferencia recomendado.

La relevancia de esta ficha radica en que ofrece un checkpoint listo para uso comercial (bajo la NVIDIA Open Model Agreement) que reduce los requisitos de memoria frente al modelo en precisión completa, manteniendo un contexto extremadamente largo y capacidades multimodales. Está orientada a desarrolladores que necesitan desplegar agentes, chatbots o sistemas RAG de gran escala sobre infraestructura NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Mixture-of-Experts (MoE) |
| Parametros totales | 2,8 billones (2.800.000 millones) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones), checkpoint cuantizado con ModelOpt; formato mixto modelopt_mixed de 8 bits en el repo |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelo base sujeto a Kimi-K3.1-Pro License) |
| Formato de pesos | safetensors (custom_code), cuantizacion NVFP4 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer con capas de tipo Mixture-of-Experts (MoE) y capacidades multimodales nativas: acepta texto e imágenes (RGB) como entrada y produce texto como salida. Las imágenes se procesan mediante el codificador visual MoonViT-V2. El modelo base Kimi-K3.1-Pro fue post-entrenado a partir de Kimi K3 por Moonshot AI, aunque los detalles sobre el dataset de entrenamiento, el número de tokens y las técnicas de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

La innovación principal de esta versión es la cuantización post-entrenamiento a NVFP4 realizada con NVIDIA Model Optimizer v0.48.0. El checkpoint de origen almacena pesos en formato MX y se convierte a NVFP4 para inferencia con vLLM. El proceso de calibración utilizó los datasets cnn_dailymail (artículos de noticias en inglés) y Nemotron-Post-Training-Dataset-v2 (conversaciones multiturno de NVIDIA). No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de propósito general, incluyendo razonamiento de nivel graduado (evaluado en GPQA Diamond).
- Comprensión multimodal: procesa imágenes junto con texto (pipeline image-text-to-text) mediante MoonViT-V2.
- Razonamiento multimodal de nivel universitario (evaluado en MMMU-Pro).
- Generación y razonamiento sobre código (evaluado en SciCode y Terminal-Bench 2.1).
- Soporte para tareas de agentes y uso de herramientas (evaluado en Tau2-bench Telecom).
- Contexto extremadamente largo de hasta 1.048.576 tokens, adecuado para documentos y conversaciones extensas.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Agentes autónomos de múltiples pasos: el modelo puede mantener el estado de una tarea a lo largo de muchas interacciones gracias a su ventana de 1.048.576 tokens y a su soporte para tool calling, lo que lo hace adecuado para pipelines de agentes que consultan APIs y ejecutan acciones encadenadas.
- Atención al cliente automatizada: puede gestionar conversaciones multiturno con historiales muy largos y adjuntar capturas o imágenes del usuario, aprovechando su entrada multimodal y su contexto extendido.
- Sistemas RAG sobre corpus masivos: la ventana de contexto permite inyectar grandes volúmenes de documentos recuperados sin truncar, reduciendo la necesidad de fragmentación agresiva.
- Análisis de documentos técnicos y científicos con imágenes: interpretación de figuras, tablas y texto en informes o papers, útil en investigación y auditoría documental.
- Generación de código en producción: su rendimiento en SciCode y Terminal-Bench 2.1 lo hace apto para asistentes de programación y automatización de tareas de terminal integradas en CI/CD.
- Evaluación y razonamiento experto: respuesta a preguntas de nivel graduado en biología, física y química (GPQA Diamond) para herramientas de formación o apoyo a la decisión.
- Procesamiento de conversaciones telefónicas o de soporte (Tau2-bench Telecom): automatización de flujos de atención en telecomunicaciones con uso de herramientas.

## Benchmarks y rendimiento

La model card menciona la evaluación en GPQA Diamond, SciCode, Tau2-bench Telecom, MMMU-Pro, AA-LCR y Terminal-Bench 2.1, pero no se incluyen los valores numéricos de los resultados en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1605,2 GB y el modelo tiene 2,8 billones de parámetros totales, por lo que se requiere infraestructura de múltiples GPUs de centro de datos.
- GPU recomendadas: NVIDIA Blackwell GB300 (hardware de prueba indicado por el autor); compatible con la microarquitectura Blackwell.
- ¿Cabe en GPU de consumo? No; por tamaño y formato NVFP4 está pensado para servidores con múltiples GPUs Blackwell.
- Opciones de despliegue: vLLM (motor de inferencia soportado y probado).
- Sistemas operativos: Linux.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Kimi-K3.1-Pro-NVFP4 | 2,8 B | 104 B | 1.048.576 | NVIDIA Open Model Agreement | Hugging Face (nvidia) |
| moonshotai/Kimi-K3.1-Pro (base) | 2,8 B | 104 B | 1.048.576 | Kimi-K3.1-Pro License | Hugging Face (moonshotai) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento, no detallados.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la model card no cuantifica este riesgo.
- Limitaciones de contexto o idioma: el contexto es de 1.048.576 tokens, pero no se especifican los idiomas soportados; los datasets de calibración son principalmente en inglés, lo que puede afectar al rendimiento en otros idiomas.
- Restricciones de licencia: el uso se rige por la NVIDIA Open Model Agreement; el modelo base está sujeto además a la Kimi-K3.1-Pro License, por lo que es necesario revisar ambas antes de un uso comercial.
- El modelo no es propiedad de NVIDIA ni fue desarrollado por ella; se trata de una cuantización de un modelo de terceros (Moonshot AI).
- Requiere hardware Blackwell y Linux con vLLM; no es desplegable en GPUs de consumo ni en entornos sin CUDA.
- NVIDIA no realizó una pasada de evaluación con dataset de test separado para este checkpoint cuantizado, por lo que el rendimiento puede diferir del modelo original.
- Es necesario realizar pruebas específicas del caso de uso antes de desplegar en producción, según recomienda el propio autor.

## Enlaces

- [Hugging Face: nvidia/Kimi-K3.1-Pro-NVFP4](https://huggingface.co/nvidia/Kimi-K3.1-Pro-NVFP4)
- [Modelo base: moonshotai/Kimi-K3.1-Pro](https://huggingface.co/moonshotai/Kimi-K3.1-Pro)
- [Licencia del modelo base](https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE)
- [NVIDIA Open Model Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/)
- [NVIDIA Model Optimizer (GitHub)](https://github.com/NVIDIA/Model-Optimizer)
- [Dataset cnn_dailymail](https://huggingface.co/datasets/abisee/cnn_dailymail)
- [Dataset Nemotron-Post-Training-Dataset-v2](https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2)
