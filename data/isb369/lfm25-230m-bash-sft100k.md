# ISB369/lfm25-230m-bash-sft100k

## Resumen

LFM25-230M-Bash-SFT100K es un modelo de lenguaje compacto de 230 millones de parámetros, resultado de un fine-tuning supervisado (SFT) sobre el modelo base LFM2.5-230M de Liquid AI. Lo desarrolla ISB369 (Alex) y está orientado a la generación y comprensión de comandos y scripts de Bash, con el objetivo de ofrecer una alternativa ligera para tareas de automatización y administración de sistemas en entornos con recursos limitados.

El modelo parte de la arquitectura LFM2 de Liquid AI, diseñada para despliegue en dispositivos edge y tareas agénticas ligeras. Con 229,7 millones de parámetros, se sitúa en la gama ultracompacta, lo que permite su ejecución en hardware modesto. El nombre del repositorio indica que fue entrenado con 100.000 ejemplos de Bash, aunque no se proporcionan detalles adicionales sobre el dataset ni el proceso de entrenamiento en la model card.

La relevancia de este modelo reside en su especialización: mientras que el modelo base es generalista, este fine-tune busca mejorar el rendimiento en tareas de línea de comandos, una necesidad frecuente en automatización de infraestructuras, generación de scripts y asistentes técnicos. Sin embargo, la ausencia de licencia, benchmarks y documentación detallada limita su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2) |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2 de Liquid AI, una familia de modelos fundacionales diseñados para eficiencia computacional y despliegue en dispositivos con recursos limitados. Según la documentación oficial de Liquid AI, LFM2.5-230M es el modelo más pequeño de la serie, pensado para extracción de datos y tareas agénticas ligeras en edge. No se dispone de detalles técnicos sobre la arquitectura interna (tipo de atención, mecanismos de mezcla de expertos, etc.) en la información proporcionada.

El entrenamiento consiste en un fine-tuning supervisado (SFT) sobre un dataset de comandos Bash, como sugiere el nombre del repositorio (bash-sft100k). El autor, ISB369, mantiene en su perfil de Hugging Face datasets como "shellminator-bash-clean" y "shellminator-bash-dataset", lo que indica que el conjunto de datos probablemente proviene de esa línea de trabajo. No se especifican hiperparámetros, duración del entrenamiento ni composición exacta del dataset. El tag "trl" en el repositorio sugiere el uso de la librería TRL (Transformer Reinforcement Learning) de Hugging Face, comúnmente empleada para SFT.

## Capacidades

- Generación de comandos Bash y scripts de shell a partir de descripciones en lenguaje natural.
- Comprensión de consultas relacionadas con administración de sistemas, gestión de archivos y automatización de tareas.
- Soporte de conversación multi-turno (etiquetado como "conversational" en los tags).
- Capacidad de generar texto en formato de comandos ejecutables, aunque sin garantía de exactitud sintáctica.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- No se especifica soporte multilingüe; probablemente entrenado principalmente con datos en inglés, pero no confirmado.

## Casos de uso

- Generación de scripts de automatización: un desarrollador puede pedir al modelo un script Bash para, por ejemplo, hacer backup de directorios, y el modelo devuelve un comando o bloque de código listo para revisar.
- Asistente de línea de comandos en entornos sin GPU: al ser un modelo de 230M, puede ejecutarse en CPU o en dispositivos edge, ofreciendo ayuda interactiva para comandos de shell en servidores o contenedores con recursos limitados.
- Documentación de comandos: el modelo puede explicar qué hace un comando Bash complejo, útil para equipos de operaciones que mantienen scripts heredados.
- Generación de pruebas unitarias para scripts: aunque no está confirmado, un modelo especializado en Bash podría ayudar a redactar casos de prueba para validar funcionalidad de scripts.
- Entrenamiento de modelos más grandes: al ser un fine-tune ligero, puede servir como punto de partida para investigación sobre adaptación de modelos compactos a dominios específicos.
- Integración en pipelines de CI/CD: para generar comandos de despliegue o configuración a partir de descripciones de alto nivel, siempre que se valide la salida antes de ejecutarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas que reporten rendimiento de este fine-tune específico.

## Requisitos de hardware

- Al tener 229,7 millones de parámetros, el modelo puede ejecutarse en CPU con memoria RAM suficiente (aproximadamente 0,9 GB de pesos en fp32, menos en cuantización).
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque no es imprescindible.
- Cabe en GPUs de consumo comunes (RTX 3060, RTX 4090, etc.) sin problema.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp si se convierte a GGUF. También es compatible con la librería transformers estándar.
- Latencia y throughput: no se han publicado datos concretos. Dado su tamaño, se espera una latencia baja incluso en CPU (del orden de decenas de milisegundos por token), pero no hay valores verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| LFM2.5-230M (base) | 230M | no disponible | no disponible | Generalista, edge |
| ISB369/lfm25-230m-bash-sft100k | 230M | no disponible | no disponible | Bash / shell |
| Otros modelos pequeños de código (p.ej. CodeGen-350M) | 350M | 2048 | BSD-3 | Generación de código general |

No se dispone de datos de rendimiento comparativo. La principal diferencia con el modelo base es el fine-tuning en Bash, que puede mejorar la precisión en ese dominio a costa de perder generalidad. Alternativas como CodeGen-350M ofrecen generación de código en múltiples lenguajes, pero no están especializadas en shell.

## Limitaciones y advertencias

- No se especifica licencia: esto impide su uso comercial sin consultar al autor, ya que no hay términos claros de redistribución ni atribución.
- La model card es una plantilla automática sin información real sobre sesgos, riesgos o limitaciones técnicas.
- Al ser un fine-tune pequeño, es probable que presente alucinaciones en comandos complejos o poco frecuentes; las salidas deben validarse siempre antes de ejecutarse.
- No se documenta la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas o scripts extensos.
- El dataset de entrenamiento no está descrito; podría contener sesgos o errores que se reflejen en las salidas.
- No hay garantía de soporte multilingüe; es probable que el modelo funcione mejor en inglés, pero no está confirmado.
- Para uso en producción, se recomienda evaluar el modelo en el dominio específico y considerar un filtro de validación de comandos generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ISB369/lfm25-230m-bash-sft100k
- Perfil del autor (ISB369): https://huggingface.co/ISB369
- Documentación de LFM2.5-230M de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-230m
- Blog de Liquid AI sobre LFM2.5-230M: https://www.liquid.ai/blog/lfm2-5-230m
- Modelo base LFM2.5-Encoder-230M: https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M
