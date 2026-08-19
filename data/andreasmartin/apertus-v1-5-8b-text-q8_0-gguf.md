# andreasmartin/apertus-v1.5-8b-text-Q8_0-GGUF

# Apertus 1.5 8B (GGUF Q8_0)

## Resumen
Este repositorio contiene una conversión a formato GGUF con cuantización Q8_0 del modelo `andreasmartin/apertus-v1.5-8b-text`, realizada mediante la herramienta GGUF-my-repo de llama.cpp. El modelo original, Apertus 1.5 8B, es un modelo de lenguaje de 8.054 millones de parámetros orientado a generación de texto, con soporte para razonamiento, tool calling y multilingüismo, según los metadatos del repositorio. La conversión GGUF permite su ejecución eficiente en CPU y GPU con llama.cpp, lo que facilita su despliegue en entornos de producción o en equipos con recursos limitados.

Al ser una conversión directa, conserva las capacidades del modelo base, aunque esta ficha se basa únicamente en la información disponible en el repositorio GGUF, que no incluye detalles técnicos del entrenamiento ni benchmarks. El modelo está sujeto a la licencia Apache 2.0 y a una política de uso aceptable específica de Apertus.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.054.976.576 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (según nombre del archivo) |
| Idiomas soportados | no disponibles (etiquetado como multilingüe) |
| Licencia | Apache 2.0 (con política de uso aceptable adicional) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo original (probablemente un transformer, pero no confirmado), ni sobre los datos de entrenamiento, el número de tokens o el proceso de alineación (RLHF, DPO, etc.). Esta conversión GGUF se generó a partir del checkpoint en safetensors `andreasmartin/apertus-v1.5-8b-text` utilizando llama.cpp, sin modificaciones en los pesos más allá de la cuantización a 8 bits. Para conocer los detalles arquitectónicos y de entrenamiento, es necesario consultar la model card del modelo base.

## Capacidades
Según los metadatos del repositorio, el modelo está etiquetado con las siguientes capacidades:
- Generación de texto (pipeline `text-generation`).
- Razonamiento (tag `reasoning`).
- Tool calling (tag `tool-calling`).
- Multilingüismo (tag `multilingual`).
- Solo texto (tag `text-only`), por lo que no procesa imágenes ni audio.

No se dispone de información adicional sobre la implementación concreta de estas capacidades (por ejemplo, si el tool calling sigue un formato específico o qué idiomas cubre).

## Casos de uso
Al carecer de documentación específica del modelo, los casos de uso se infieren de las capacidades etiquetadas y del tamaño del modelo:
- Asistentes conversacionales multilingües: al ser un modelo de 8B con soporte multilingüe, puede integrarse en chatbots para atención al cliente en varios idiomas.
- Generación de código asistida: la capacidad de tool calling sugiere que puede interactuar con APIs y ejecutar funciones, útil en entornos de desarrollo.
- Razonamiento lógico y resolución de problemas: su etiqueta de razonamiento lo hace apto para tareas de análisis y toma de decisiones.
- Despliegue en entornos con recursos limitados: al estar cuantizado en Q8_0, puede ejecutarse en GPUs de consumo o incluso en CPU con llama.cpp.
- Prototipado rápido de aplicaciones de NLP: su formato GGUF facilita su uso con herramientas como llama.cpp u Ollama.
- Automatización de tareas de procesamiento de texto: resúmenes, extracción de información, etc., en pipelines locales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware
- Tamaño del archivo GGUF: aproximadamente 8.6 GB (según el tamaño del repositorio).
- VRAM estimada para inferencia: para Q8_0, los pesos ocupan unos 8.6 GB, más overhead de contexto y activaciones, por lo que se recomienda al menos 12 GB de VRAM para una ventana de contexto moderada (por ejemplo, 2048 tokens).
- GPU recomendadas: tarjetas con 12-16 GB de VRAM, como RTX 3060/4070/4080, o GPUs profesionales como A10, L4, etc. En CPU, puede ejecutarse con llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la configuración de contexto.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en el repositorio. Dado que el modelo original no está documentado en esta ficha, no es posible establecer una comparativa fiable con otras alternativas de 8B.

## Limitaciones y advertencias
- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas del modelo original.
- Al ser una conversión GGUF, la cuantización Q8_0 puede introducir una ligera pérdida de precisión frente al modelo en fp16, aunque suele ser mínima.
- El modelo es solo texto; no admite entradas multimodales.
- La licencia Apache 2.0 permite uso comercial, pero el acceso al repositorio está restringido por una política de uso aceptable adicional (Apertus 1.5 Acceptable Use Policy), que debe aceptarse antes de la descarga.
- No se especifica la longitud de contexto soportada; se recomienda probar con valores conservadores (por ejemplo, 2048 tokens) y ajustar según el rendimiento.

## Enlaces
- Repositorio GGUF: [andreasmartin/apertus-v1.5-8b-text-Q8_0-GGUF](https://huggingface.co/andreasmartin/apertus-v1.5-8b-text-Q8_0-GGUF)
- Modelo base (safetensors): [andreasmartin/apertus-v1.5-8b-text](https://huggingface.co/andreasmartin/apertus-v1.5-8b-text)
- Política de uso aceptable de Apertus 1.5: [USAGE_POLICY.pdf](https://github.com/swiss-ai/apertus-legal/blob/main/apertus_1.5/USAGE_POLICY.pdf)
