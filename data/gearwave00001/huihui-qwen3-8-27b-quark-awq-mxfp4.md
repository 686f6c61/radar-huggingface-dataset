# gearwave00001/Huihui-Qwen3.8-27B-Quark-AWQ-MXFP4

## Resumen

Este modelo es una conversión a formato AMD Quark MXFP4 del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, realizada por el usuario gearwave00001. Se trata de una variante cuantizada de Qwen3.8-27B cuyo proceso de abliteración elimina las capas de alineación de seguridad, y que está optimizada para ejecutarse en GPUs AMD con arquitectura gfx1201 (R9700). El objetivo principal es ofrecer un LLM de gran tamaño en hardware AMD de consumo, con licencia Apache 2.0 y pesos en formato safetensors.

El modelo cuenta con 15.605.868.416 parámetros según los tensores incluidos, una cifra menor que la que sugiere el nombre (27B). La conversión se realizó con la herramienta Quark de AMD, usando 28 muestras de calibración con 512 secuencias, y el autor reporta una pérdida de calidad ligera (PPL ligeramente superior al modelo de referencia). Su relevancia actual radica en servir como ejemplo práctico de cuantización mixta para GPUs AMD y en ofrecer una base abierta para tareas que requieren menos restricciones de contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de la familia Qwen3.8) |
| Parametros totales | 15.605.868.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (AMD Quark) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la familia Qwen3.8, de la que no se proporcionan especificaciones detalladas en la documentación. El proceso de entrenamiento, en este caso, es únicamente una cuantización post-entrenamiento (PTQ) a formato MXFP4 mediante la librería Quark de AMD. Se utilizaron 28 muestras de calibración con 512 secuencias. El proceso se llevó a cabo en un sistema con 128GB de RAM DDR4, un procesador AMD Ryzen 5900X y dos GPUs R9700 (gfx1201). El autor indica que las últimas tres capas tuvieron que ser descargadas a CPU, lo que no se sabe si afectó a la calidad final. No se realizó reentrenamiento ni ajuste adicional. El modelo base, Huihui-Qwen3.8-27B-abliterated, es una versión descensurada del modelo original, lo que elimina las capas de alineación de seguridad.

## Capacidades

- Generación de lenguaje: se espera que el modelo realice tareas de generación de texto, aunque no se detallan capacidades específicas en la documentación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no especificadas.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.
- Al ser una conversión cuantizada, las capacidades del modelo base se mantienen en teoría, pero la pérdida de precisión puede afectar tareas sensibles.

## Casos de uso

- Investigación en cuantización MXFP4: permite estudiar el impacto de la cuantización mixta y la calibración con pocas muestras (28 muestras, 512 secuencias) en modelos de lenguaje.
- Despliegue en hardware AMD Radeon: al estar optimizado para la arquitectura gfx1201 (R9700), es adecuado para entornos de inferencia en GPUs AMD de consumo.
- Aplicaciones comerciales con licencia Apache 2.0: la licencia permite uso comercial, por lo que puede integrarse en productos sin restricciones de licencia.
- Fine-tuning en dominios específicos: gracias a su formato cuantizado y su tamaño reducido, puede adaptarse con menos recursos que el modelo original.
- Análisis de modelos abliterated: sirve como base para investigar cómo la eliminación de la alineación de seguridad afecta a la generación de contenido.
- Estudio de técnicas de calibración post-entrenamiento: el proceso de conversión documentado permite comparar distintas estrategias de calibración para cuantización.
- Uso en aplicaciones de roleplay o escritura creativa sin filtros: al ser abliterated, puede generar contenido que otros modelos rechazan, lo que puede ser útil en investigación, pero requiere evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente menciona que el perplexity (PPL) fue ligeramente superior al modelo de referencia AMD (amd/Qwen3.8-27B-Quark-AWQ-MXFP4), sin proporcionar cifras concretas.

## Requisitos de hardware

- VRAM estimada: con 15.605.868.416 parámetros y formato MXFP4 (4 bits), los pesos ocupan aproximadamente 7,8 GB. Esta es una estimación orientativa; no se proporciona el consumo real. El autor indica que durante la conversión las últimas 3 capas se descargaron a CPU, lo que sugiere que el modelo no se ajustó completamente a la VRAM disponible en las GPUs usadas.
- GPU recomendadas: AMD Radeon con arquitectura gfx1201 (R9700). No se especifica compatibilidad con otras arquitecturas.
- ¿Cabe en consumer GPU? Depende de la VRAM disponible; con 16 GB probablemente sí, pero no está confirmado.
- Opciones de despliegue: herramientas compatibles con la librería Quark de AMD. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se comparan tres modelos relacionados: el modelo analizado, el modelo de referencia de AMD (amd/Qwen3.8-27B-Quark-AWQ-MXFP4) y el modelo base abliterated (huihui-ai/Huihui-Qwen3.8-27B-abliterated).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gearwave00001/Huihui-Qwen3.8-27B-Quark-AWQ-MXFP4 | 15.605.868.416 | No disponible | No disponible | Apache 2.0 | HuggingFace |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

Nota: el modelo analizado es una conversión directa del modelo base abliterated, y el modelo de AMD es la referencia utilizada por el autor para comparar la calidad.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos, pero el modelo ha sido abliterated, lo que implica la eliminación de capas de seguridad y puede aumentar la probabilidad de generar contenido dañino o inapropiado.
- Riesgo de alucinación: no hay datos; como modelo cuantizado, la pérdida de precisión puede incrementar la probabilidad de errores factuales.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución. No hay restricciones adicionales conocidas.
- Caveat para producción: el autor solo realizó pruebas iniciales y reporta un PPL ligeramente superior al modelo de referencia; no se han publicado benchmarks, por lo que es necesario validar el modelo antes de usarlo en aplicaciones críticas.
- El proceso de conversión descargó capas a CPU, lo que podría haber afectado a la calidad.

## Enlaces

- HuggingFace: https://huggingface.co/gearwave00001/Huihui-Qwen3.8-27B-Quark-AWQ-MXFP4
- Repositorio de Quark: https://github.com/amd/Quark
- Modelo de referencia: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Licencia original: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
