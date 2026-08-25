# Muse-research/Muse2-125M

## Resumen

Muse2-125M es un modelo de lenguaje autorregresivo desarrollado por Muse Research, presentado como la variante más compacta de la familia Muse2, con 122,9 millones de parámetros. Su arquitectura híbrida combina bloques de convolución causal y atención completa, implementada desde cero en PyTorch sin depender de la biblioteca `transformers`. Está diseñado para entornos edge y dispositivos con recursos limitados, ofreciendo una alternativa ligera para generación de texto, código y salida estructurada en JSON. El modelo se distribuye bajo licencia Apache-2.0 e incluye tanto la versión base como la versión instruida mediante supervisión fina (SFT). Su relevancia actual radica en demostrar que arquitecturas híbridas de pequeño tamaño pueden proporcionar capacidades útiles en inferencia local, con una ventana de contexto de 8.000 tokens ampliable hasta 128.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolución/atención (12 bloques: 7 de convolución causal depthwise con kernel 3 y 5 de atención completa) |
| Parametros totales | 122.915.328 (122,9M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.000 tokens (máximo 128.000) |
| Tipos de cuantizacion | No especificado en la documentación |
| Idiomas soportados | Inglés (también código fuente y texto matemático) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Muse2-125M emplea una arquitectura autorregresiva híbrida que intercala 7 bloques de convolución causal depthwise (kernel de tamaño 3) con 5 bloques de atención completa, sumando 12 bloques en total. Utiliza Grouped-Query Attention (GQA) con 12 cabezas de consulta y 6 de clave/valor, junto con RoPE (theta 1e6), RMSNorm y MLPs SwiGLU paralelos fusionados (dimensión oculta 768, dimensión feed-forward 2304). Los embeddings de entrada y salida están atados, y el vocabulario consta de 65.536 tokens BPE a nivel de byte, con tokens de control estilo ChatML. La versión instruct se alineó mediante SFT con enmascaramiento de pérdida solo en la completación; no se aplicó RLHF ni DPO. Los datos de entrenamiento no se detallan en la documentación, pero el corte de conocimiento se sitúa a principios de 2024.

## Capacidades

- Generación de texto en inglés, incluyendo fragmentos de código y expresiones matemáticas.
- Salida estructurada en JSON, especialmente útil para extracción de logs y formateo disciplinado.
- Conversación multi-turno en la versión instruct, usando plantilla ChatML.
- Adecuado para inferencia en dispositivos edge y entornos con restricciones de memoria.
- Base para fine-tuning en tareas específicas gracias a su tamaño reducido y licencia abierta.
- No se menciona soporte explícito de tool calling, funciones externas ni capacidades multimodales.

## Casos de uso

- Extracción de logs a JSON: el modelo puede transformar líneas de log no estructuradas en objetos JSON válidos, facilitando su integración en pipelines de monitorización.
- Asistente conversacional en dispositivos embebidos: la versión instruct permite mantener diálogos básicos en hardware con poca RAM, como routers o dispositivos IoT.
- Generación de código simple: puede completar funciones cortas o scripts en lenguajes como Python, útil en entornos de desarrollo con recursos limitados.
- Fine-tuning para dominios específicos: al ser un modelo pequeño y abierto, sirve como punto de partida para adaptarlo a tareas de clasificación, extracción de entidades o resumen en ámbitos concretos.
- Educación e investigación: permite estudiar el comportamiento de arquitecturas híbridas convolución/atención y comparar su rendimiento con modelos transformer puros.
- Generación de documentación técnica breve: puede redactar descripciones o comentarios de código en inglés, aprovechando su capacidad de formateo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación.
- Dado su tamaño (122,9M parámetros), el modelo en float32 ocupa aproximadamente 491 MB, en float16 unos 246 MB y en cuantización de 8 bits cerca de 123 MB.
- Puede ejecutarse en GPUs de consumo con 2-4 GB de VRAM, o incluso en CPU, aunque no hay datos oficiales de latencia o throughput.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.); el repositorio proporciona un paquete `muse` propio para PyTorch.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha recibido alineación de seguridad, red-teaming ni filtrado de contenido; puede generar salidas sesgadas, inexactas u ofensivas.
- Alucina hechos con facilidad debido a su escala reducida, por lo que no es fiable para tareas que requieran veracidad factual.
- Solo soporta inglés, aunque maneja código y matemáticas; no cubre otros idiomas.
- La ventana de contexto efectiva es de 8.000 tokens, y aunque se indica un máximo de 128.000, no se detalla el mecanismo para ampliarla.
- No está diseñado para producción sin evaluación previa y salvaguardas por parte del desarrollador.
- La licencia Apache-2.0 permite uso comercial, pero el desarrollador asume la responsabilidad de cualquier despliegue.

## Enlaces

- [Muse2-125M en Hugging Face](https://huggingface.co/Muse-research/Muse2-125M)
- [Organización Muse-research](https://huggingface.co/Muse-research)
- [Muse2-230M-Base (modelo hermano)](https://huggingface.co/Muse-research/Muse2-230M-Base)
