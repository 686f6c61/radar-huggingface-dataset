# jmar-onit/qwen3.8-27b-olava-extract

## Resumen

El modelo `jmar-onit/qwen3.8-27b-olava-extract` es un adaptador LoRA (PEFT) de solo 0,7 GB que ajusta el modelo base `Qwen/Qwen3.8-27B`, un transformer denso de 27 000 millones de parámetros desarrollado por Alibaba. El adaptador fue creado por el usuario `jmar-onit` mediante entrenamiento supervisado (SFT) con la librería TRL de HuggingFace, y está orientado a generación de texto conversacional, como muestra el ejemplo de la model card.

El modelo base Qwen3.8-27B es un modelo de visión y lenguaje (vision-language) con una ventana de contexto nativa de 262 144 tokens, licencia Apache 2.0 y soporte para imágenes y vídeo. El adaptador, sin embargo, se publica únicamente con pipeline de text-generation y no incluye el encoder de visión, por lo que su uso práctico se limita a tareas de texto. Aunque el repositorio del adaptador no especifica el propósito exacto (el nombre «olava-extract» sugiere extracción de información, pero no está confirmado), su naturaleza LoRA permite aplicarlo sobre el modelo base para personalizar comportamientos sin necesidad de reentrenar todos los pesos.

La relevancia de este adaptador reside en su ligereza: permite adaptar un modelo de 27B con un coste de almacenamiento mínimo y un ajuste fino rápido. No obstante, al carecer de documentación sobre el dataset de entrenamiento, las descargas (0) y los likes (0), se trata de un experimento sin validación externa, por lo que su uso en producción requiere una evaluación previa rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) + adaptador LoRA |
| Parametros totales | Base: 27 000 millones; adaptador: no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (base) |
| Tipos de cuantizacion | Base: GGUF (p. ej. Q4_K_M, 18 GB); adaptador: safetensors en FP32 (no cuantizado) |
| Idiomas soportados | Base: multilingüe (no especificado); adaptador: no disponible |
| Licencia | Adaptador: no disponible; base: Apache 2.0 |
| Formato de pesos | Adaptador: safetensors (PEFT); base: safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso (sin mezcla de expertos) de 27 000 millones de parámetros, diseñado para tareas de visión y lenguaje. Su arquitectura incorpora un encoder de visión adicional (931 MB según la versión de Ollama) que permite procesar imágenes y vídeo, aunque el adaptador `qwen3.8-27b-olava-extract` no incluye ese componente y se limita a texto. La ventana de contexto nativa es de 262 144 tokens, ampliable hasta 1 000 000 mediante una característica alojada en Qwen Cloud que aún no está disponible localmente.

El adaptador fue entrenado con supervisión (SFT) utilizando las librerías TRL 0.24.0, PEFT 0.18.1 y Transformers 5.14.1. No se proporciona información sobre el dataset empleado, el número de tokens de entrenamiento ni la duración del proceso. Dado que el repositorio solo contiene el adaptador LoRA (0,7 GB), el entrenamiento se realizó sobre los pesos congelados del modelo base, actualizando únicamente las matrices de bajo rango. No se mencionan técnicas adicionales como RLHF o DPO, ni innovaciones específicas en el adaptador.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card muestra un diálogo de tipo pregunta-respuesta con formato de chat.
- Herencia de capacidades del modelo base (si se combina con el adaptador): razonamiento, generación de código, matemáticas y procesamiento de imágenes y vídeo (aunque el adaptador no expone estas últimas).
- Soporte de tool calling y funciones: no disponible en la información del adaptador; el modelo base podría soportarlo, pero no se confirma.
- Capacidades multilingües: no especificadas para el adaptador; el base es multilingüe, pero sin lista concreta de idiomas.
- Modo de razonamiento extendido (thinking mode): no mencionado en la documentación del adaptador.

## Casos de uso

- Asistente conversacional especializado: al ser un adaptador LoRA entrenado con SFT, puede ajustarse a dominios concretos (soporte técnico, atención al cliente) y desplegarse sobre el modelo base para generar respuestas contextualizadas con la ventana de 262K tokens.
- Extracción de información de documentos largos: el nombre «olava-extract» sugiere una posible tarea de extracción; con el contexto amplio del base, el adaptador podría usarse para resumir o extraer entidades de informes extensos.
- Generación de código en entornos de desarrollo: si el adaptador conserva las capacidades del base, puede emplearse para autocompletar código o explicar fragmentos, integrándose en IDE o pipelines de CI/CD.
- Análisis de datos y razonamiento matemático: combinado con el base, puede resolver problemas de lógica y matemáticas, útil en aplicaciones educativas o de análisis financiero.
- Personalización de chatbots para empresas: el adaptador permite adaptar el tono y estilo del modelo base a la marca o a normativas internas sin reentrenar los 27B parámetros.
- Prototipado rápido de modelos de lenguaje: por su pequeño tamaño (0,7 GB), sirve como plantilla para experimentar con técnicas de fine-tuning eficiente (LoRA) sobre un modelo de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del adaptador no incluye métricas de evaluación, y los resultados de búsqueda sobre el modelo base no proporcionan cifras concretas de MMLU, HumanEval u otros tests.

## Requisitos de hardware

- VRAM estimada: el modelo base en FP16 requiere aproximadamente 54 GB (27B × 2 bytes). Con cuantización Q4_K_M (18 GB) puede ejecutarse en GPUs con 20-24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantización; A100 (40/80 GB) o H100 (80 GB) para FP16 sin pérdida de precisión.
- Compatibilidad con GPU de consumo: sí, con cuantización Q4_K_M en tarjetas de 24 GB; en 16 GB puede ser límite dependiendo del contexto.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (comando `ollama run qwen3.8:27b`), HuggingFace Transformers con PEFT, TGI.
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros adaptadores o modelos de la misma categoría. El modelo base Qwen3.8-27B compite con otros modelos densos de 27B como Gemma 2 27B o Llama 3.1 8B, pero no se han encontrado datos de rendimiento comparativos en los resultados de búsqueda. Se recomienda consultar benchmarks oficiales del modelo base para evaluar su posición relativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se ha evaluado el adaptador; el modelo base puede presentar sesgos y generar información falsa, especialmente en contextos largos.
- Riesgo de alucinación: inherente a los modelos generativos; se recomienda verificación externa en aplicaciones críticas.
- Limitaciones de idioma: el adaptador no especifica idiomas soportados; el base es multilingüe pero sin detalle.
- Restricciones de licencia: la licencia del adaptador es desconocida («no disponible»); el modelo base es Apache 2.0, pero el adaptador puede tener términos distintos.
- Contexto extenso: aunque el base soporta 262K tokens, el rendimiento puede degradarse con secuencias muy largas; la ampliación a 1M solo está disponible en Qwen Cloud.
- Falta de validación: cero descargas y cero likes indican que el adaptador no ha sido probado por la comunidad; su uso en producción requiere pruebas exhaustivas.
- Compatibilidad del adaptador: al ser un adaptador LoRA, debe cargarse sobre el modelo base exacto; no es un modelo autónomo.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/jmar-onit/qwen3.8-27b-olava-extract)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Guía de Ollama para Qwen3.8-27B](https://ollama.com/library/qwen3.8:27b)
- [Cómo ejecutar Qwen3.8-27B localmente con Ollama (2026)](https://tech-insider.org/how-to-run-qwen3-8-27b-locally-ollama-2026/)
- [Cómo ejecutar Qwen 3.8 con Ollama: comandos, VRAM y configuración (2026)](https://www.yottalabs.ai/post/how-to-run-qwen-3-8-with-ollama-2026)
- [Ejecutar Qwen3.8-27B en Ollama: un comando, cuatro cuantizaciones (2026)](https://www.orcarouter.ai/blog/qwen-3-8-27b-ollama)
- [Cómo ejecutar Qwen 3.8 localmente en GPUs de 16-24 GB (2026)](https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/)
