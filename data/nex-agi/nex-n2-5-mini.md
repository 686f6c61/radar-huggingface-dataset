# nex-agi/Nex-N2.5-mini

## Resumen

Nex-N2.5-mini es la variante más pequeña de la familia Nex-N2.5, desarrollada por Nex-AGI como conjunto de modelos agénticos para tareas de larga duración en entornos reales. El modelo combina entradas multimodales de imagen y texto (image-text-to-text) con capacidades de razonamiento agéntico, lo que le permite operar ordenadores, navegadores web y ejecutar programación de forma autónoma, autocorrigiéndose mediante feedback visual. Está pensado para agentes que necesitan actuar de forma continua a lo largo de tareas complejas, donde la percepción visual se convierte en el mecanismo principal para verificar el estado del entorno. Según los metadatos de Hugging Face, el modelo tiene 35.107.181.936 parámetros (≈35,1B) y los pesos en safetensors ocupan 70,2 GB, lo que sugiere una precisión de 16 bits. La arquitectura se basa en un transformer de tipo Mixture-of-Experts (según el tag `qwen3_5_moe`) sin que se especifiquen los parámetros activos ni el número de expertos. La longitud de contexto y los idiomas soportados no se han anunciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); base Qwen3.5 MoE según el tag de Hugging Face (número de expertos no especificado) |
| Parametros totales | 35.107.181.936 (≈35,1B) |
| Parametros activos | no disponible (el tag `qwen3_5_moe` sugiere arquitectura MoE, pero no se indica el número) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se proporcionan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El model card no detalla la arquitectura interna exacta ni los datos de entrenamiento. Se sabe que el modelo es multimodal (image-text-to-text) y que hereda las bases de Nex-N2, con mejoras específicas en uso de ordenador, navegación web y capacidades agénticas visuales. El tag de Hugging Face `qwen3_5_moe` indica que la arquitectura está basada en un modelo Qwen3.5 MoE, pero no se aporta información sobre número de expertos, parámetros activos ni distribución de pesos. Tampoco se mencionan el tamaño del corpus, el número de tokens de entrenamiento, ni si se utilizaron técnicas de alineación como RLHF o DPO. El único dato sobre el proceso de desarrollo es que se ha realizado un post-entrenamiento sistemático, con expansión de entornos de entrenamiento y tipos de tareas agénticas, sin más detalles técnicos. No se han publicado innovaciones arquitectónicas como atención lineal o decodificación especulativa en la documentación disponible.

## Capacidades

- Procesamiento multimodal de imagen y texto: admite entradas basadas en imágenes, lo que le permite interpretar capturas de pantalla y otros datos visuales junto con instrucciones textuales.
- Agente de larga duración: diseñado para mantener la actuación a lo largo de tareas largas y continuas, con capacidad de autocorrección mediante feedback visual.
- Uso de ordenador y navegador: puede interactuar con aplicaciones de escritorio y navegadores web, ejecutando acciones sobre la interfaz gráfica.
- Ejecución y prueba de programas: capaz de ejecutar código, verificar los resultados en pantalla y ajustar su comportamiento en consecuencia.
- Generación y conversación: soporta tareas de text-generation en flujos de diálogo y razonamiento.
- No se especifica de forma explícita el soporte de tool calling / function calling, aunque su orientación agéntica sugiere compatibilidad con flujos de herramientas. Tampoco se detallan capacidades multilingües concretas en los metadatos.

## Casos de uso

- Automatización de pruebas de aplicaciones web: el modelo puede seguir instrucciones en lenguaje natural para navegar, rellenar formularios y comprobar visualmente los resultados, lo que resulta útil en QA sin necesidad de frameworks específicos.
- Operador de escritorio para tareas administrativas: permite automatizar flujos que impliquen abrir aplicaciones, mover archivos o interactuar con programas que no disponen de API.
- Desarrollo de software con feedback visual: ideal para generar código, ejecutarlo y corregirlo basándose en la salida en pantalla o en los errores mostrados, reduciendo la intervención manual.
- Soporte técnico remoto: un agente puede analizar capturas de pantalla enviadas por el usuario y proponer o ejecutar soluciones directamente en el equipo.
- Análisis de interfaces de usuario: puede inspeccionar diseños y layouts para detectar problemas visuales, apoyando a equipos de diseño y desarrollo.
- Investigación científica: al ser multimodal, puede interpretar gráficos, figuras y resultados experimentales, facilitando la revisión de literatura o el análisis de datos de laboratorio.
- Gestión de datos en sistemas heredados: en aplicaciones antiguas sin APIs, el agente puede operar la interfaz gráfica para extraer o introducir información, aprovechando su capacidad de percepción visual y actuación continua.

## Benchmarks y rendimiento

Los datos proceden de la tabla de benchmarks publicada en el model card. No se incluye el benchmark Toolathlon Verified porque el valor no aparece en la documentación extraída.

| Benchmark | Nex-N2.5-mini | Nex-N2.5-Pro | Nex-N2.5-Max | Claude Opus 5 | GPT-5.6 Sol | Qwen3.8-Max |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 73.4 | 82.7 | 86.1 | 89.1 | 88.8 | 86.6 |
| SWE-Bench Pro | 43.8 | 61.2 | 65.7 | 79.2 | 64.6 | 67.7 |
| DeepSWE v1.1 | 36.1 | 55.8 | 65.6 | 73.7 | 72.7 | 69.3 |
| AutomationBench v1.0.6 | 32.3 | 44.2 | 50.2 | 50.3 | 45.8 | 39.8 |
| Toolathlon Verified | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- Los pesos safetensors ocupan 70,2 GB, lo que implica una precisión de 16 bits (bfloat16 o float16).
- Para inferencia en FP16 se necesita una VRAM superior a 70 GB. Se recomienda una GPU de centro de datos como A100 80GB o H100 80GB, o distribuir el modelo entre varias GPUs. El overhead adicional para la caché KV y los buffers no se ha cuantificado, ya que la longitud de contexto no está especificada.
- No se han publicado cuantizaciones oficiales. Sin esa información, el modelo no es ejecutable en GPUs de consumo de 24 GB (por ejemplo, RTX 4090). Si la comunidad genera cuantizaciones 4-bit, la carga de pesos podría reducirse a unos 18-20 GB, pero no hay archivos GGUF ni de otro tipo en el repositorio.
- Despliegue: compatible con la librería de Transformers, vLLM y TGI. Para usar llama.cpp u Ollama sería necesario convertir los pesos a formato GGUF, operación que no está incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría en cuanto a parámetros, contexto y licencia. Los datos de rendimiento frente a otros modelos (Claude Opus 5, GPT-5.6 Sol, Qwen3.8-Max, entre otros) se presentan en la sección de benchmarks. Dentro de la propia familia, Nex-N2.5-mini es la variante más pequeña, por debajo de Nex-N2.5-Pro y Nex-N2.5-Max, pero no se han publicado las especificaciones técnicas de estos últimos más allá de que Max se basa en una arquitectura MoE de 1,6 billones de parámetros.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni análisis de riesgos. Se recomienda auditar el modelo antes de utilizarlo en entornos sensibles.
- Riesgo de alucinación: como en todo modelo de lenguaje, la salida puede ser incorrecta. En tareas de control de ordenador y navegador, un error puede provocar acciones no deseadas sobre el sistema.
- La longitud de contexto y los idiomas soportados no se han anunciado, lo que limita la planificación de despliegues multilingües o de contexto largo en producción.
- La licencia Apache-2.0 permite uso comercial, pero al redistribuir versiones modificadas se deben mantener los avisos de licencia y de patentes originales.
- La documentación no especifica la composición del dataset de entrenamiento, por lo que no se puede evaluar la procedencia de los datos ni posibles sesgos asociados.
- Los benchmarks disponibles son parciales: un benchmark de la suite (Toolathlon Verified) no muestra valores en la documentación extraída, y no se aportan medidas de incertidumbre ni de varianza.

## Enlaces

- [Hugging Face: nex-agi/Nex-N2.5-mini](https://huggingface.co/nex-agi/Nex-N2.5-mini)
- [GitHub: nex-agi/Nex-N2.5](https://github.com/nex-agi/Nex-N2.5)
- [Colección en Hugging Face: nex-agi/Nex-N2.5](https://huggingface.co/collections/nex-agi/nex-n25)
- [Sitio web de Nex-AGI](https://nex-agi.com/)
- [OpenRouter: Nex-N2.5-mini](https://openrouter.ai/nex-agi/nex-n2.5-mini)
- [ModelScope: Nex-N2.5-mini](https://modelscope.cn/models/nex-agi/Nex-N2.5-mini)
- [Hugging Face: Nex-N2.5-Pro](https://huggingface.co/nex-agi/Nex-N2.5-Pro)
- [Hugging Face: Nex-N2.5-Max](https://huggingface.co/nex-agi/Nex-N2.5-Max)
