# may-me-1998/UiAA-1.5-9B

## Resumen

UiAA-1.5-9B es una versión cuantizada en formato GGUF del modelo Ornith-1.5-9B-uncensored, desarrollado por junafinity y publicado en Hugging Face por el usuario may-me-1998. Este modelo forma parte de la familia Ornith de la organización Ornith AI, orientada a la codificación agéntica y la automejora de modelos mediante scaffolds generados por el propio modelo. Según los metadatos, se basa en la arquitectura Qwen3.5 y ha sido sometido a un proceso de "abliteration" (eliminación de capas de censura) y "zerofuse" (técnica de fusión de pesos), resultando en una versión "uncensored" que elimina los rechazos típicos de los modelos alineados.

El modelo cuenta con 8.95 mil millones de parámetros, soporta multimodalidad (visión) y está disponible en múltiples cuantizaciones GGUF, lo que lo hace desplegable en hardware de consumo. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque no se han publicado benchmarks oficiales para esta versión, la familia Ornith-1.5 destaca por su enfoque en tareas de codificación y razonamiento, con resultados prometedores en benchmarks como Terminal-Bench y SWE-Bench para modelos de tamaño similar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (según etiquetas, no confirmado oficialmente) |
| Parámetros totales | 8.953.803.264 (8,95 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, además de archivos mmproj para visión (f16 y Q8_0) |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también disponible en safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada, pero las etiquetas indican que se basa en Qwen3.5, probablemente un transformer denso con atención completa. El modelo original Ornith-1.5-9B-uncensored ha sido modificado mediante técnicas de "abliteration" (eliminación de direcciones de activación asociadas a comportamientos de rechazo) y "zerothuse" (fusión de pesos para mejorar la coherencia). No se dispone de detalles sobre el dataset de entrenamiento, número de tokens ni el proceso de alineación, aunque la familia Ornith-1.5 se describe como un sistema de automejora donde el modelo propone tareas, genera andamiajes y produce soluciones, extendiendo el marco de auto-scaffolding de Ornith-1.0. No hay información sobre el uso de RLHF o DPO en este modelo específico.

## Capacidades

- Generación de texto y razonamiento general, con especial énfasis en tareas de codificación y agentes de software.
- Soporte multimodal: incluye archivos mmproj para procesamiento de visión (entrada de imágenes) en formato GGUF.
- Capacidades de agente y codificación: la familia Ornith está diseñada para tareas de agentic coding, como resolver issues en repositorios y ejecutar comandos en terminal.
- Multilingüe: solo se declara inglés, sin soporte explícito para otros idiomas.
- Sin filtros de censura: al ser "uncensored" y "abliterated", no aplica los rechazos típicos de modelos alineados, lo que puede ser útil para aplicaciones que requieren respuestas sin restricciones, pero también conlleva riesgos.
- No se especifica soporte para tool calling o function calling en los metadatos, aunque la naturaleza agéntica del modelo sugiere que podría manejarlos indirectamente.

## Casos de uso

- Automatización de tareas de programación: el modelo puede usarse como agente que recibe una descripción de una tarea y genera código, ejecuta comandos de terminal y edita archivos, gracias a su entrenamiento orientado a agentic coding. Es adecuado para entornos de desarrollo con recursos limitados al ser de 9B.
- Asistente de desarrollo integrado en IDE: al ser ligero y cuantizable, puede desplegarse localmente para sugerencias de código y refactorización sin depender de la nube.
- Generación de documentación técnica: su capacidad de razonamiento y generación de texto permite crear documentación a partir de código fuente o especificaciones.
- Análisis de imágenes y descripción: el componente multimodal permite procesar capturas de pantalla o diagramas para generar explicaciones o extraer información.
- Prototipado rápido de agentes de conversación: su naturaleza "uncensored" puede ser útil en entornos de investigación donde se requiera explorar respuestas sin restricciones de seguridad.
- Despliegue en edge o dispositivos con poca memoria: gracias a las cuantizaciones GGUF (por ejemplo, Q4_K_M de 5,7 GB), puede ejecutarse en GPU de consumo con 8 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos numéricos sobre MMLU, HumanEval, GSM8K u otras métricas para esta versión específica. La familia Ornith-1.0-9B reportó en su web 43.1 en Terminal-Bench 2.1 y 69.4 en SWE-Bench Verified, pero no se puede confirmar que estos resultados apliquen a esta variante 1.5-uncensored.

## Requisitos de hardware

- VRAM estimada según cuantización:
  - Q4_K_M (5,7 GB): requiere al menos 8 GB de VRAM, puede funcionar en GPU como RTX 3060, RTX 4060, o incluso en iGPU con suficiente memoria.
  - Q8_0 (9,6 GB): requiere 12 GB de VRAM, recomendable para RTX 4070 Ti o superior.
  - f16 (18 GB): necesita 20 GB de VRAM, solo en GPUs profesionales como A6000 o A100.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones altas; A100 40GB para f16.
- Compatibilidad con GPU de consumo: sí, con cuantizaciones Q4 y Q5 se puede ejecutar en GPUs con 8-12 GB.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible), TGI (si se usa safetensors).
- Latencia y throughput: no disponible, depende del hardware y de la cuantización. En una GPU RTX 4090, se estima una generación de 30-50 tokens por segundo con Q4_K_M, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo. Sin embargo, se puede comparar estructuralmente con otros modelos de ~9B:

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Cuantizaciones GGUF |
|---|---|---|---|---|---|
| UiAA-1.5-9B (este) | 8,95 B | No disponible | Apache 2.0 | Sí | Sí, múltiples |
| Qwen2.5-7B-Instruct | 7,6 B | 128K | Apache 2.0 | No | Sí |
| Llama 3.1-8B-Instruct | 8,0 B | 128K | Llama 3.1 (uso comercial permitido) | No | Sí |
| Gemma 2-9B | 9,2 B | 8K | Gemma License | No | Sí |

La comparación real de rendimiento no es posible sin datos de benchmarks. La ventaja de UiAA-1.5-9B es su orientación agéntica y su naturaleza "uncensored", mientras que los otros modelos tienen alineación de seguridad y documentación más completa.

## Limitaciones y advertencias

- Idioma: solo inglés, no soporta otros idiomas de forma nativa.
- Sesgos y alucinaciones: al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, incorrecto o peligroso sin restricciones. No debe usarse en entornos de producción donde se requiera seguridad y filtrado de contenido.
- Falta de documentación: no se dispone de información detallada sobre el entrenamiento, datos utilizados ni benchmarks oficiales, lo que dificulta evaluar su fiabilidad.
- Riesgo de desalineación: la eliminación de filtros puede provocar respuestas que violan políticas de uso o normas legales.
- Contexto y memoria: se desconoce la longitud de contexto exacta; si es similar a Qwen3.5 podría ser 32K o 128K, pero no está confirmado.
- Compatibilidad: el formato GGUF es compatible con llama.cpp y derivados, pero no con todas las bibliotecas de servidores; el modelo safetensors original puede requerir más VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/may-me-1998/UiAA-1.5-9B
- Modelo original (base): https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF
- Proyecto UiAA (GitHub): https://github.com/may-me-1998/uiaa
- Página oficial de Ornith AI: https://ornith.ai/
- Blog de Ornith-1.0 (Self-Scaffolding): https://ornith.ai/ornith_1_0.html
