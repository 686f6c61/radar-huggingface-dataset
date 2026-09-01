# mradermacher/Qwen3.5-9B-abliterated-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-9B-abliterated-GGUF` es una colección de cuantizaciones GGUF del modelo `wangzhang/Qwen3.5-9B-abliterated`, que a su vez es una versión "abliterated" (sin censura) del modelo Qwen3.5-9B desarrollado por Alibaba. La técnica de abliteration elimina las direcciones de rechazo del modelo original, de modo que responde sin las restricciones de seguridad habituales. El autor de las cuantizaciones, mradermacher, ofrece múltiples niveles de compresión (desde Q2_K hasta f16) para facilitar la ejecución local en hardware variado.

Este modelo es relevante para desarrolladores que necesitan un LLM de 9B parámetros con respuestas sin filtros, ya sea para generación creativa, experimentación o aplicaciones donde la moderación de contenido interfiere con el resultado deseado. Al estar cuantizado en GGUF, se puede ejecutar con llama.cpp, Ollama u otros motores compatibles, incluso en GPUs de consumo con poca VRAM. La licencia Apache 2.0 permite uso comercial sin restricciones de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, pero no confirmado) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B en los datos proporcionados. Se sabe que es un modelo de 9B parámetros de la familia Qwen3.5, pero no se especifica si es un transformer denso, MoE o híbrido. El proceso de abliteration aplicado por `wangzhang` consiste en identificar y eliminar las direcciones del espacio latente asociadas a comportamientos de rechazo, una técnica documentada en el repositorio `remove-refusals-with-transformers`. No hay datos sobre el dataset de entrenamiento, número de tokens ni métodos de alineación (RLHF, DPO, etc.) del modelo original.

## Capacidades

- Generación de texto sin censura: el modelo no rechaza peticiones sobre temas sensibles, violencia, contenido adulto, etc., gracias a la abliteration.
- Conversación multi-turno: los tags indican capacidad conversacional, aunque no se especifica la longitud de contexto.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés confirmado.
- Otras capacidades (visión, audio, razonamiento avanzado): no disponibles.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y guionistas pueden usar el modelo para explorar tramas o diálogos que otros LLM rechazarían por políticas de seguridad.
- Chatbots para comunidades específicas: foros o aplicaciones donde los usuarios esperan respuestas directas sobre temas tabú (siempre dentro del marco legal).
- Experimentación en investigación: estudiar el comportamiento de modelos sin alineación de seguridad, comparando con versiones censuradas.
- Desarrollo de personajes de rol: el modelo puede interpretar personajes con personalidades extremas o moralmente ambiguas sin romper la inmersión.
- Generación de código ofensivo o exploits: aunque no es ético, algunos investigadores de seguridad pueden usarlo para estudiar vulnerabilidades.
- Pruebas de estrés de sistemas de moderación: evaluar cómo los filtros de contenido reaccionan ante salidas sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo cuantizado ni para su versión base abliterated.

## Requisitos de hardware

- VRAM estimada: según el archivo GGUF elegido. Por ejemplo, Q4_K_M (5,7 GB) cabe en GPUs con 6-8 GB VRAM; Q8_0 (9,6 GB) requiere al menos 12 GB; f16 (18 GB) necesita 20+ GB.
- GPUs recomendadas: RTX 3060 12GB para Q4_K_M, RTX 4090 o A100 para Q8_0 o f16.
- Compatible con GPUs de consumo: sí, las cuantizaciones Q4 y Q5 funcionan en tarjetas de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama (versión disponible en `huihui_ai/qwen3.5-abliterated:9b`), LM Studio, o cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible, pero en una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo (estimación general para modelos de 9B).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated (este) | 8,95B | no disponible | Apache 2.0 | GGUF | Sin censura, solo inglés |
| Qwen3.5-9B (original) | 8,95B | no disponible | Apache 2.0 | safetensors | Con censura, multilingüe |
| Huihui-Qwen3.5-9B-abliterated | 8,95B | no disponible | Apache 2.0 | GGUF | Otra versión abliterated del mismo base |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo puede generar texto ofensivo, ilegal o peligroso. El usuario asume toda la responsabilidad.
- Solo inglés: no sirve para aplicaciones multilingües.
- Sin datos de contexto: se desconoce la ventana máxima, lo que puede causar errores en conversaciones largas.
- Riesgo de alucinación: al no tener alineación, las respuestas pueden ser más inventivas pero también menos fiables.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede violar leyes locales según el uso.
- No recomendado para producción sin un filtro de seguridad adicional.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/wangzhang/Qwen3.5-9B-abliterated
- Versión con imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-abliterated-i1-GGUF
- Versión en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated:9b
- Guía de instalación y benchmarks: https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/
