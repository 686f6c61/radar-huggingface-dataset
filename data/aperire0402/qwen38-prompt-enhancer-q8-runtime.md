# aperire0402/qwen38-prompt-enhancer-q8-runtime

## Resumen

Este repositorio es un mirror de despliegue inmutable, no un modelo entrenado desde cero. Contiene únicamente los dos artefactos GGUF necesarios para ejecutar el worker de mejora de prompts (prompt-enhancer) de Gingerlabs en RunPod: el modelo objetivo en cuantización Q8_K_P y un sidecar de vocabulario de draft para FastMTP de 32K tokens. El modelo base es `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`, una variante no censurada de la familia Qwen3.8 con soporte de multi-token prediction (MTP) y un vocabulario de draft ampliado.

El propósito concreto es servir como runtime de un worker que reescribe prompts de texto para mejorar la alineación con modelos de text-to-image, siguiendo la técnica PromptEnhancer descrita en el paper arXiv 2509.04545. El repositorio omite deliberadamente todas las demás cuantizaciones y el proyector de visión, de modo que RunPod Cached Models no prepare archivos innecesarios. Es un modelo solo texto; el "32K" del sidecar FastMTP se refiere al vocabulario de draft, no a la longitud de contexto de servicio.

El dato de parámetros totales extraído de los safetensors (1.863.907.840) corresponde probablemente a un componente auxiliar o al adaptador, no al modelo principal de 27B, cuyo tamaño real en Q8 es de unos 32.4 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, variante MTP con sidecar FastMTP) |
| Parametros totales | 1.863.907.840 (dato safetensors del repo; el modelo base es de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el 32K del FastMTP es vocabulario de draft, no contexto) |
| Tipos de cuantizacion | Q8_K (única incluida en este mirror) |
| Idiomas soportados | no disponible (modelo base Qwen3, probablemente multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors presente pero no es el peso principal) |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen3 de 27B parámetros, concretamente `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`, que incorpora un mecanismo de Multi-Token Prediction (MTP) con un vocabulario de draft FastMTP de 32K tokens. Este sidecar de draft permite acelerar la decodificación especulativa, generando múltiples tokens por paso de inferencia y mejorando el throughput en entornos de servicio como RunPod.

El repositorio actual no contiene información sobre el entrenamiento del modelo base ni sobre datos de entrenamiento, RLHF o DPO. Se trata de un mirror de despliegue que copia byte a byte los artefactos de la revisión `993a5971fda8f30dd1b7eb2654792ba4415c7460`, incluyendo la firma de procedencia y el parche de runtime FastMTP. El worker asociado es exclusivamente de texto y está orientado a la mejora de prompts para generación de imágenes.

## Capacidades

- Reescribe y estructura prompts de texto para mejorar la alineación con modelos de generación de imágenes (text-to-image e image-to-image).
- Preserva la intención original del prompt mientras reorganiza y clarifica la estructura.
- Soporta decodificación especulativa mediante MTP (Multi-Token Prediction) con sidecar FastMTP de 32K vocabulario de draft.
- Es un modelo de texto solamente; no incluye proyector de visión ni capacidades multimodales.
- Orientado a ser desplegado como worker en RunPod con Cached Models.
- La variante base es "uncensored" (no censurada), lo que implica menos restricciones de contenido en la generación.
- Compatible con endpoints de inferencia GGUF (vLLM, llama.cpp, Ollama, TGI, etc.) siempre que soporten el parche FastMTP.

## Casos de uso

- **Mejora de prompts para generación de imágenes**: el worker recibe un prompt de texto y lo reescribe de forma estructurada y detallada para mejorar la alineación semántica con modelos como HunyuanImage 2.1, siguiendo el enfoque PromptEnhancer.
- **Pipelines de producción de contenido visual**: integrado en flujos de automatización que generan ilustraciones, banners o imágenes de producto a partir de descripciones textuales, mejorando la consistencia y el detalle del resultado.
- **Servicio de API de prompt engineering**: desplegado en RunPod como endpoint, puede servir a aplicaciones que necesitan optimizar prompts de usuario antes de pasarlos a un modelo de difusión.
- **Optimización de prompts en batch**: gracias a la decodificación especulativa MTP, puede procesar grandes volúmenes de prompts con menor latencia y mayor throughput que un modelo estándar de 27B.
- **Entornos de investigación en generación de imágenes**: permite experimentar con el reescritura de prompts como paso previo a la generación, evaluando el impacto en la alineación texto-imagen.
- **Integración en herramientas de diseño asistido por IA**: como backend para aplicaciones de diseño gráfico donde los usuarios describen una escena y necesitan que el sistema la convierta en un prompt óptimo para el motor de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El paper PromptEnhancer (arXiv 2509.04545) reporta mejoras de alineación en HunyuanImage 2.1, pero no se aplican directamente a este runtime específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo principal es de 27B en cuantización Q8_K, lo que requiere aproximadamente 28-30 GB de VRAM para cargar los pesos completos en GPU. El sidecar FastMTP añade un pequeño overhead adicional.
- **GPU recomendadas**: A100 40GB, A100 80GB, H100 80GB, o RTX 6000 Ada. Una RTX 4090 de 24GB no es suficiente para cargar todo el modelo en Q8 sin offload a CPU.
- **Consumer GPU**: no cabe en GPUs de consumo de 24GB o menos sin desplegar capas en CPU, lo que degradaría significativamente el rendimiento.
- **Opciones de despliegue**: el repositorio está diseñado para RunPod (con Cached Models). También es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que soporten el parche FastMTP para decodificación especulativa.
- **Latencia y throughput**: no se proporcionan datos. El uso de MTP pretende mejorar el throughput en comparación con la decodificación autoregresiva estándar, pero los valores concretos dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio. Como referencia, el modelo base es una variante de Qwen3 de 27B, por lo que se puede comparar con otros modelos de la familia Qwen3 (Qwen3-14B, Qwen3-32B) en términos de tamaño y capacidad, pero no hay benchmarks que respalden una comparación directa. El enfoque PromptEnhancer es específico para la tarea de reescritura de prompts, no para generación de texto general.

## Limitaciones y advertencias

- **Modelo no censurado**: la variante base "Uncensored" puede generar contenido sin los filtros de seguridad habituales, lo que supone un riesgo si se usa en producción sin moderación adicional.
- **Falta de documentación de entrenamiento**: no se especifican datos de entrenamiento, sesgos ni medidas de alineación. Se recomienda evaluar el modelo en el dominio de uso antes de desplegar.
- **Riesgo de alucinación**: al ser un modelo de lenguaje sin entrenamiento específico para el dominio de prompts, puede producir reescrituras que alteren el significado original o inventen detalles.
- **Limitación de contexto**: no se especifica la longitud de contexto de servicio; el "32K" del FastMTP es el vocabulario de draft, no la ventana de contexto. Es necesario verificar la configuración del runtime.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el repositorio incluye avisos de terceros (`THIRD_PARTY_NOTICES.md`) y una licencia (`LICENSE`) que deben revisarse antes de redistribuir.
- **Uso en producción**: el mirror está diseñado para un caso de uso específico (prompt enhancement en RunPod). No es un modelo generalista; usarlo para otras tareas puede dar resultados subóptimos.
- **Dependencia de infraestructura**: el sidecar FastMTP requiere un parche de runtime específico; si el backend de inferencia no lo soporta, el modelo no funcionará correctamente.

## Enlaces

- Repositorio HuggingFace: [aperire0402/qwen38-prompt-enhancer-q8-runtime](https://huggingface.co/aperire0402/qwen38-prompt-enhancer-q8-runtime)
- Repositorio base (modelo): [HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- Paper PromptEnhancer: [arXiv 2509.04545](https://arxiv.org/abs/2509.04545)
- Proyecto PromptEnhancer (GitHub): [bdAgentAI/promptenhancer](https://github.com/bdAgentAI/promptenhancer)
- Demostración web de PromptEnhancer: [hunyuan-promptenhancer.github.io](https://hunyuan-promptenhancer.github.io/)
