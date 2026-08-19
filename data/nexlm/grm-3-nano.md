# NexLM/GRM-3-Nano

## Resumen

GRM-3-Nano es un modelo multimodal compacto desarrollado por NexLM, una empresa centrada en la inferencia en el dispositivo y la optimización de edge computing. Construido sobre la arquitectura Qwen 3.5 0.8B, este modelo unifica procesamiento de texto, imagen y vídeo en un único transformer de fusión temprana, evitando adaptadores de visión externos. Su diseño sub-1B de parámetros lo hace adecuado para ejecución totalmente offline en portátiles, teléfonos y hardware heredado, sin dependencia de internet.

El modelo destaca por su ventana de contexto de 262K tokens (extensible hasta 1M), soporte nativo de 201 idiomas y capacidades de OCR y comprensión de documentos. Según la model card, supera a modelos de mayor tamaño en tareas de razonamiento y visión, logrando una puntuación de 42.3 en MMLU y 79.1 en OCRBench. Actualmente se encuentra en fase de preview público, con una versión completa optimizada prevista para las próximas semanas.

GRM-3-Nano es relevante para desarrolladores que necesitan capacidades multimodales y razonamiento en entornos con recursos limitados, como aplicaciones de edge, agentes ligeros y análisis de documentos sin conexión. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de fusión temprana multimodal (basado en Qwen 3.5 0.8B) |
| Parametros totales | 0.8B (base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K tokens (extensible a 1M) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

GRM-3-Nano emplea un transformer de fusión temprana que integra tokens multimodales (texto, imagen y vídeo) directamente en la capa de entrada, eliminando la necesidad de adaptadores de visión separados. Esta arquitectura, heredada de Qwen 3.5 0.8B, permite un procesamiento unificado de modalidades con un coste computacional reducido. El modelo fue entrenado durante 15 días en un MacBook Pro M4 Pro con 24 GB de RAM utilizando Unsloth Studio, seguido de 10 días de evaluación.

El entrenamiento combinó datasets propietarios y open source, incluyendo CompReasoning, SciencePhilosophy, TerminalKnowledge, ComplexMath, Anthropic hh-rlhf y OpenAI frontier-science, entre otros. Se aplicaron fases de post-entrenamiento centradas en formato de respuesta y red-teaming de seguridad. Aunque no se especifican los volúmenes exactos de tokens de entrenamiento, la diversidad de fuentes sugiere un enfoque equilibrado entre razonamiento, conocimiento general y seguridad.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa simultáneamente texto, imágenes y vídeo, con capacidades de razonamiento lógico y matemático.
- OCR y comprensión de documentos: reconoce texto en imágenes y extrae información de documentos complejos, con una puntuación de 79.1 en OCRBench.
- Soporte multilingüe nativo: cubre 201 idiomas, lo que permite aplicaciones de traducción y procesamiento de texto en múltiples lenguas.
- Tool calling y uso de agentes: entrenado con datasets de tool calling, puede integrarse en flujos de trabajo que requieren invocación de funciones externas.
- Ejecución offline: funciona sin conexión a internet, ideal para entornos con restricciones de red o privacidad.
- Ventana de contexto larga: 262K tokens (extensible a 1M) para procesar documentos extensos, código o historiales de conversación largos.

## Casos de uso

- Análisis de documentos offline: procesar PDFs, escaneos o imágenes de documentos para extraer texto, tablas y metadatos sin conexión, gracias a su OCR y ventana de contexto amplia.
- Asistentes personales en dispositivos móviles: ejecutar un asistente de voz o chat en un teléfono sin depender de servidores externos, con respuesta en 201 idiomas.
- OCR en tiempo real para accesibilidad: convertir texto de imágenes en voz o texto digital en aplicaciones para personas con discapacidad visual, con baja latencia.
- Agentes ligeros de automatización: integrar el modelo en pipelines de automatización que requieran tool calling, como gestión de correos, calendarios o tareas de programación.
- Análisis de imágenes en entornos con recursos limitados: procesar imágenes de cámaras de seguridad o drones en dispositivos edge, sin necesidad de GPU dedicada.
- Traducción automática multilingüe: traducir textos entre los 201 idiomas soportados, útil para aplicaciones de viajes o comunicación internacional.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados:

| Benchmark | Score | Notas |
|---|---|---|
| MMLU (conocimiento general/razonamiento) | 42.3 | Fuerte para escala sub-1B |
| OCRBench (visión documento/imagen-texto) | 79.1 | Robusto en razonamiento de documentos e imágenes |
| Puntuación global vs. modelo insignia de 397B | ~54% | Línea base entre la familia de modelos 0.8B-9B |

No se dispone de comparaciones directas con otros modelos de la misma categoría en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 0.8B en FP16 se requieren aproximadamente 1.6 GB; en int8, unos 0.8 GB. Cabe en cualquier GPU moderna, incluso en tarjetas de gama baja como la GTX 1650.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, o incluso ejecución en CPU. El entrenamiento se realizó en un MacBook Pro M4 Pro con 24 GB de RAM, lo que indica que la inferencia es viable en hardware similar.
- Compatibilidad con consumer GPU: sí, todas las GPU de consumo actuales pueden ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo pequeño y multimodal, puede desplegarse con llama.cpp, Ollama, o mediante frameworks de inferencia optimizados para edge como TensorFlow Lite o ONNX Runtime. vLLM puede ser viable si se convierte a formato compatible.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño sub-1B, se espera una latencia de milisegundos en GPU y de pocos segundos en CPU para generación de texto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (sub-1B multimodales). La model card menciona que supera a Qwen3-VL en razonamiento, codificación, agentes y comprensión visual, pero no se proporcionan métricas concretas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo se encuentra en preview público, por lo que puede contener errores o comportamientos no optimizados; la versión completa aún no ha sido liberada.
- No se han publicado detalles sobre sesgos o riesgos de alucinación específicos, pero como modelo de lenguaje pequeño, es susceptible a generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- La ventana de contexto de 262K tokens es amplia, pero la extensión a 1M no está garantizada en todas las configuraciones de hardware.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda verificar la procedencia de los datasets propietarios y su cumplimiento legal.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que los pesos del modelo aún no están disponibles públicamente; la descarga puede no ser posible en este momento.

## Enlaces

- HuggingFace: https://huggingface.co/NexLM/GRM-3-Nano
- Sitio web de NexLM: https://nex-lm.vercel.app/
