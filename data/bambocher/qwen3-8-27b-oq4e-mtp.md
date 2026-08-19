# bambocher/Qwen3.8-27B-oQ4e-mtp

## Resumen

El modelo `bambocher/Qwen3.8-27B-oQ4e-mtp` es una cuantización de 4 bits del modelo Qwen3.8-27B, un LLM denso multimodal de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. La cuantización ha sido realizada por el usuario bambocher utilizando la herramienta oQ (oMLX v0.6.1), que aplica cuantización de precisión mixta y está optimizada para el framework MLX de Apple. El resultado es un modelo en formato MLX safetensors, pensado para ejecutarse en hardware Apple Silicon con un uso de memoria reducido.

El modelo original Qwen3.8-27B destaca por su rendimiento en tareas de programación, flujos de trabajo agénticos y automatización de oficina, además de ser nativamente multimodal (visión y lenguaje). Esta versión cuantizada mantiene esas capacidades, aunque con una posible degradación leve en precisión debido a la cuantización. La etiqueta `mtp` indica que incluye soporte para Multi-Token Prediction, una técnica que acelera la inferencia al predecir varios tokens a la vez. Es relevante para desarrolladores que necesitan ejecutar un modelo de 27B en equipos Apple con memoria unificada limitada, sin renunciar a capacidades avanzadas de razonamiento y visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (arquitectura Qwen3.5) |
| Parametros totales | 4 926 789 872 (según safetensors; el nombre del modelo indica 27B, posible discrepancia) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, grupo 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible (el modelo original soporta múltiples idiomas, incluido chino e inglés) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura Qwen3.5, que incorpora atención multimodal para procesar simultáneamente texto e imágenes. El entrenamiento del modelo original incluye datos de texto y visión, con técnicas de ajuste fino supervisado y optimización por preferencias humanas (RLHF/DPO), aunque los detalles exactos no se especifican en la información disponible. La cuantización aplicada por oQ utiliza precisión mixta: asigna 4 bits a la mayoría de las capas, pero puede mantener mayor precisión en capas sensibles, lo que reduce la pérdida de calidad frente a cuantizaciones uniformes. El formato MLX safetensors está diseñado para el framework MLX de Apple, que aprovecha la memoria unificada de los chips M-series. La inclusión de MTP (Multi-Token Prediction) permite que el modelo prediga varios tokens por paso, acelerando la generación en hardware Apple.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas y lógica.
- Comprensión y generación de código en múltiples lenguajes de programación.
- Capacidades multimodales: procesamiento de imágenes y texto (visión-lenguaje).
- Soporte de tool calling y function calling para integración con APIs y herramientas externas.
- Ejecución de flujos agénticos multi-paso con planificación autónoma y manejo de feedback del entorno.
- Control flexible del pensamiento: modo "thinking" activable o desactivable según la tarea.
- Soporte de Multi-Token Prediction (MTP) para acelerar la inferencia en hardware Apple.

## Casos de uso

- Asistente de programación en equipos Apple: el modelo puede autocompletar código, explicar fragmentos y generar tests. Su cuantización en 4 bits permite ejecutarlo en un MacBook Pro con 32 GB de memoria unificada, ofreciendo respuestas de baja latencia gracias a MTP.
- Automatización de oficina: procesamiento de documentos, resumen de correos, generación de informes y extracción de datos de imágenes escaneadas, aprovechando su capacidad multimodal.
- Agente autónomo para tareas multi-paso: el modelo puede planificar y ejecutar secuencias de acciones (por ejemplo, navegar por una web, rellenar formularios) usando tool calling y razonamiento paso a paso.
- Análisis de imágenes técnicas: interpretación de diagramas, capturas de pantalla o gráficos para generar descripciones o responder preguntas sobre ellos.
- Chatbot de atención al cliente con contexto largo: aunque la longitud de contexto no está confirmada, el modelo base soporta ventanas amplias; la versión cuantizada puede gestionar conversaciones multi-turno con historial extenso en hardware Apple.
- Prototipado rápido de aplicaciones de IA local: al ser un modelo de 27B cuantizado en MLX, es adecuado para desarrolladores que quieren experimentar con LLMs multimodales sin depender de la nube, manteniendo los datos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización (`Qwen3.8-27B-oQ4e-mtp`). El modelo original Qwen3.8-27B ha sido evaluado en tareas como MathVision, pero no se dispone de los valores numéricos en la información proporcionada. Se recomienda consultar el repositorio oficial de Qwen para obtener los benchmarks del modelo base.

## Requisitos de hardware

- VRAM estimada: el peso del modelo es de 17 GB en formato safetensors. Para inferencia, se recomienda al menos 24 GB de memoria unificada en Apple Silicon, considerando overhead de activaciones y caché KV.
- GPU recomendadas: Apple Silicon con 32 GB o más de memoria unificada (por ejemplo, M4 Max con 40 núcleos de GPU, como se referencia en el benchmark de oMLX). También puede ejecutarse en M2 Ultra o M3 Ultra con suficiente memoria.
- Compatibilidad con consumer GPU: no aplica, ya que MLX está diseñado exclusivamente para hardware Apple. No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: el modelo se carga mediante el framework MLX (librería `mlx` de Python). También puede usarse con oMLX, que ofrece optimizaciones adicionales como turboquant KV y dflash. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no hay datos oficiales, pero el benchmark de oMLX en M4 Max (40c) muestra rendimiento optimizado gracias a MTP y a las optimizaciones de oQ. Se espera una generación de varios tokens por segundo, aunque depende del contexto y la configuración.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otras cuantizaciones del mismo modelo o con alternativas similares. El modelo base Qwen3.8-27B compite con otros LLMs multimodales densos de ~27B, como Llama 3.2 30B o Gemma 3 27B, pero no se han encontrado comparativas publicadas para esta versión cuantizada. La principal diferencia es su formato MLX, que lo limita a ecosistema Apple, mientras que otras cuantizaciones (GGUF, AWQ) son multiplataforma.

## Limitaciones y advertencias

- La cuantización de 4 bits puede provocar una degradación en la precisión para tareas de razonamiento complejo o generación de código muy técnico, en comparación con el modelo original en precisión completa.
- La licencia del modelo no está especificada en la información disponible. Antes de usar el modelo en producción, es imprescindible verificar la licencia del modelo base Qwen3.8-27B y las condiciones de la cuantización.
- El formato MLX safetensors solo es ejecutable en hardware Apple Silicon. No es portable a otros entornos sin conversión adicional.
- No se ha confirmado la longitud de contexto real de esta versión cuantizada; puede verse reducida por limitaciones de memoria en dispositivos con menos RAM.
- El número de parámetros reportado en safetensors (4 926 789 872) no coincide con el nombre del modelo (27B). Esto podría indicar un error en la subida o una versión parcial. Se recomienda verificar la integridad del repositorio antes de su uso.
- Al ser un modelo multimodal, puede presentar alucinaciones visuales o interpretaciones erróneas de imágenes, especialmente en cuantización agresiva.
- No se han publicado evaluaciones de sesgos o seguridad para esta versión cuantizada; el modelo base puede heredar sesgos de sus datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/Qwen3.8-27B-oQ4e-mtp
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en HuggingFace (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Benchmark de oMLX en M4 Max: https://omlx.ai/benchmarks/performance/kk024csk
- Proyecto MTPLX (aceleración MTP en MLX): https://github.com/youssofal/mtplx
