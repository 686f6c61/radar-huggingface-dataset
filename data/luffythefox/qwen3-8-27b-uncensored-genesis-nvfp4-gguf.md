# LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-NVFP4-GGUF

## Resumen

LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-NVFP4-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B, en su variante sin censura (uncensored) creada por el autor HauhauCS. El modelo original es multimodal, capaz de procesar texto e imágenes, e incorpora soporte para predicción de múltiples tokens (MTP) y decodificación especulativa, lo que puede mejorar la velocidad de inferencia en determinados entornos.

Esta versión concreta utiliza cuantización NVFP4, una técnica de compresión de pesos a 4 bits que reduce significativamente los requisitos de memoria. Está pensada para ejecutarse en hardware de consumo mediante soluciones como llama.cpp o Ollama, facilitando el despliegue local de un modelo de 27B de parámetros. La model card del autor es mínima, indicando que la información completa se publicará próximamente, por lo que numerosos detalles técnicos no están disponibles en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27B (segun la denominacion del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, GGUF |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Qwen3.8, con un tamaño de 27B de parámetros, aunque no se han publicado detalles sobre si se trata de una arquitectura densa o basada en mixture of experts. La etiqueta `image-text-to-text` indica que incluye un módulo de visión que le permite procesar imágenes además de texto. También se menciona el soporte de MTP (multi-token prediction) y de decodificación especulativa, lo que sugiere que el modelo está diseñado para generar varios tokens por paso de inferencia.

La cuantización NVFP4 aplicada en este repositorio es una conversión de los pesos a 4 bits en formato GGUF, optimizada para su ejecución en CPU y GPU mediante herramientas como llama.cpp o Ollama. El modelo base sobre el que se realiza esta cuantización es HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, que a su vez es un ajuste sin censura de un modelo Qwen. No hay información disponible sobre los datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Procesamiento multimodal de entrada: el modelo acepta texto e imágenes, según la etiqueta `image-text-to-text`.
- Generación de texto sin filtros de seguridad, al tratarse de una variante uncensored.
- Soporte de predicción de múltiples tokens (MTP) y decodificación especulativa para acelerar la inferencia.
- Capacidades multilingües, con soporte declarado para inglés, chino y otros idiomas.
- Formato GGUF compatible con herramientas de inferencia locales como llama.cpp, Ollama o LM Studio.
- No se dispone de información sobre soporte de tool calling, function calling o razonamiento multi-paso.

## Casos de uso

- Asistente multimodal local: el modelo puede responder preguntas sobre imágenes en inglés o chino, lo que lo hace útil para descripciones de fotografías, análisis de diagramas o extracción de información de capturas, siempre que se ejecute con una GPU con suficiente VRAM.
- Chat sin restricciones para investigación: la variante uncensored permite experimentar con generación de contenido en contextos donde los filtros de seguridad estándar interfieren, como análisis de sesgos o pruebas de alineación.
- Despliegue en entornos de borde: gracias a la cuantización NVFP4 en GGUF, un modelo de 27B puede ejecutarse en una estación de trabajo con una RTX 4090 o similar, sin necesidad de infraestructura de servidor dedicada.
- Procesamiento de documentos escaneados: al combinar entrada de imagen y texto, puede utilizarse para transcribir o resumir documentos con contenido visual, como facturas o informes, en aplicaciones de ofimática.
- Experimentación con decodificación especulativa: el soporte de MTP y speculative decoding permite probar técnicas de aceleración de inferencia en pipelines de investigación sobre eficiencia.
- Traducción asistida multilingüe: dada su capacidad en inglés y chino, puede emplearse como asistente de traducción para textos breves, especialmente cuando se combina con contexto visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es posible comparar el rendimiento con otros modelos a partir de datos objetivos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como orientación general, un modelo de 27B cuantizado en 4 bits suele ocupar entre 14 y 16 GB, por lo que se recomienda una GPU con al menos 16 GB de VRAM.
- GPU recomendadas: RTX 4090, A100 o H100 en función del tamaño de la ventana de contexto y la longitud de las secuencias.
- Es probable que pueda ejecutarse en GPUs de consumo con 16 GB de VRAM, como una RTX 4080 o superior, gracias a la cuantización GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y en menor medida vLLM o TGI si se convierten los pesos a un formato compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-NVFP4-GGUF | 27B | GGUF | no disponible | Apache-2.0 | HuggingFace |
| LuffyTheFox/Qwen3.6-27B-Uncensored-Genesis-MTP-GGUF | 27B | GGUF | no disponible | no disponible | HuggingFace |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27B | GGUF | no disponible | no disponible | HuggingFace |

La comparación se limita a los datos públicos de los repositorios. No hay métricas de rendimiento que permitan evaluar diferencias funcionales entre estos modelos.

## Limitaciones y advertencias

- La model card del autor es un esqueleto con el texto "Coming soon", por lo que no hay información sobre arquitectura, datos de entrenamiento ni evaluaciones.
- Al ser un modelo uncensored, puede generar contenido ofensivo, ilegal o dañino sin que existan filtros de seguridad.
- No se han evaluado sesgos ni riesgos de alucinación en esta variante concreta.
- La cuantización NVFP4 puede degradar la calidad de la generación en comparación con una versión sin cuantizar o con cuantizaciones de mayor precisión.
- El uso comercial está permitido por la licencia Apache-2.0, pero el autor no ofrece garantías de rendimiento ni de seguridad.
- Los requisitos de hardware no están documentados; la estimación de VRAM es orientativa y puede variar según el framework y la configuración.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-NVFP4-GGUF
- Modelo base citado: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Página del autor: https://huggingface.co/LuffyTheFox/models
- Modelo similar de la misma familia: https://huggingface.co/LuffyTheFox/Qwen3.6-27B-Uncensored-Genesis-MTP-GGUF
