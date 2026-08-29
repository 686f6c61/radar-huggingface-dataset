# NINI26454/Qwen3.5-9B-abliterated-4bit

## Resumen

El modelo NINI26454/Qwen3.5-9B-abliterated-4bit es una versión cuantizada a 4 bits (bitsandbytes) del modelo Qwen3.5-9B-abliterated, un ajuste de la familia Qwen3.5 que elimina los mecanismos de rechazo (refusal) del modelo original mediante la técnica de "abliteration". El autor, NINI26454, publica este checkpoint en formato safetensors para su uso con la librería transformers, orientado a generación de texto conversacional. El modelo base Qwen3.5-9B es un LLM de código abierto desarrollado por Alibaba Cloud, y su variante abliterated es mantenida por la comunidad (huihui-ai, lukey03, entre otros) para permitir respuestas sin restricciones de seguridad.

La relevancia de este modelo radica en su tamaño compacto (9B parámetros) y su cuantización 4-bit, que permite ejecutarlo en hardware de consumo con requisitos de VRAM moderados. Al ser una versión "sin censura", se utiliza principalmente en entornos de investigación sobre alineación, seguridad y comportamiento de modelos, así como en aplicaciones donde se requiere una generación de texto sin filtros temáticos. Sin embargo, la model card oficial no proporciona detalles sobre el entrenamiento, los datos utilizados ni las especificaciones técnicas completas, por lo que gran parte de la información debe inferirse de la familia Qwen3.5 y de los repositorios similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, variante text) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes) |
| Idiomas soportados | no disponible (se infiere multilingue por la familia Qwen, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5, que emplea un transformer decoder-only con atención de múltiples cabezas. El tag `qwen3_5_text` indica que se trata de la variante de texto, aunque la familia Qwen3.5 también incluye versiones multimodales. El modelo base de 9B parámetros fue entrenado por Alibaba Cloud con un corpus masivo multilingue, aunque los detalles exactos de composición y volumen de tokens no se han publicado en la model card de este repositorio.

El proceso de "abliteration" consiste en modificar los pesos del modelo para eliminar las direcciones de activación asociadas con el rechazo de solicitudes, un método desarrollado por la comunidad (popularizado por el trabajo de "abliteration" de Maxime Labonne y otros). Este ajuste se realiza sobre el modelo base sin necesidad de fine-tuning adicional, y el resultado es un modelo que responde a prácticamente cualquier solicitud sin negarse. La cuantización a 4 bits mediante bitsandbytes reduce el tamaño del modelo de aproximadamente 18 GB a 7,7 GB, facilitando su despliegue en GPUs con menos memoria.

## Capacidades

- Generación de texto conversacional y completado de texto.
- Razonamiento y resolución de problemas, heredado del modelo base Qwen3.5-9B.
- Generación de código y soporte de lenguajes de programación (capacidad del modelo base).
- Capacidades multilingues (el modelo base Qwen3.5 soporta múltiples idiomas, aunque no se especifica en este repo).
- Respuesta sin restricciones de seguridad: el abliteration elimina los rechazos, permitiendo generar contenido que el modelo original bloquearía.
- Compatible con la librería transformers y con endpoints de HuggingFace (tag `endpoints_compatible`).
- No se confirma soporte de tool calling, function calling ni modo agente en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad de modelos: el modelo permite estudiar cómo se comporta un LLM sin mecanismos de rechazo, analizando sesgos, riesgos y patrones de generación en entornos controlados.
- Generación creativa de ficción y narrativa: al no tener restricciones temáticas, puede usarse para escribir historias con contenido adulto, violencia o temas tabú que otros modelos rechazarían.
- Desarrollo de chatbots sin filtros para entornos de prueba: útil para prototipar asistentes conversacionales donde se requiere explorar todos los temas sin limitaciones, aunque con supervisión humana.
- Evaluación comparativa de técnicas de ablación: permite comparar el rendimiento del modelo abliterated frente al original en tareas estándar (MMLU, HumanEval, etc.) para medir el impacto de la eliminación de rechazos.
- Despliegue local en hardware de consumo: gracias a la cuantización 4-bit, puede ejecutarse en GPUs con 8-12 GB de VRAM, lo que lo hace accesible para aficionados y pequeños equipos.
- Estudio de jailbreaks y robustez: al ser un modelo sin rechazo, sirve como banco de pruebas para entender cómo los mecanismos de seguridad pueden ser eludidos y cómo diseñar mejores defensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y los resultados de búsqueda web no proporcionan datos numéricos específicos para este checkpoint. Se recomienda consultar los benchmarks del modelo base Qwen3.5-9B (publicados por Alibaba Cloud) y tener en cuenta que el proceso de abliteration puede degradar ligeramente el rendimiento en tareas de razonamiento, aunque no hay datos cuantitativos confirmados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB con cuantización 4-bit (el tamaño del repo es 7,7 GB, pero la carga en memoria puede requerir algo más).
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A10, A100 (aunque estas son sobredimensionadas para este modelo).
- Cabe en GPUs de consumo con 8 GB o más de VRAM, siempre que se use cuantización 4-bit y técnicas de offloading si es necesario.
- Opciones de despliegue: transformers (con bitsandbytes), vLLM, llama.cpp (si se convierte a GGUF), Ollama (existen versiones GGUF de modelos similares), TGI (Text Generation Inference).
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NINI26454/Qwen3.5-9B-abliterated-4bit | 8,95B | no disponible | 4-bit bitsandbytes | no disponible | HuggingFace |
| lukey03/Qwen3.5-9B-abliterated | 8,95B | no disponible | no especificada | no disponible | HuggingFace |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated-mlx-4bit | 8,95B | no disponible | 4-bit MLX | no disponible | HuggingFace |
| Qwen3.5-9B (base) | 8,95B | no disponible | no aplica | Apache 2.0 (según familia Qwen) | HuggingFace |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento comparativo. El modelo base Qwen3.5-9B tiene licencia Apache 2.0, pero la licencia de las versiones abliterated no está especificada en los repositorios consultados.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin rechazo, puede generar contenido ofensivo, discriminatorio o perjudicial sin filtro. Esto lo hace inadecuado para uso en producción sin supervisión humana.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en temas especializados. El abliteration no corrige este problema.
- Limitaciones de contexto: la longitud de contexto no está documentada en este repositorio; se recomienda consultar la documentación del modelo base Qwen3.5-9B.
- Restricciones de licencia: la licencia no está disponible, lo que genera incertidumbre legal para uso comercial. Se debe contactar al autor o consultar la licencia del modelo base.
- Riesgo de mal uso: la ausencia de mecanismos de seguridad facilita la generación de contenido ilegal o dañino. No debe utilizarse en aplicaciones públicas sin medidas de mitigación.
- Calidad de la cuantización: la cuantización 4-bit puede degradar la calidad de las respuestas en comparación con el modelo en precisión completa, especialmente en tareas de razonamiento complejo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NINI26454/Qwen3.5-9B-abliterated-4bit
- Repositorio similar (lukey03): https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Repositorio similar (huihui-ai, MLX): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated-mlx-4bit
- Página en Ollama (huihui_ai/qwen3.5-abliterated): https://ollama.com/huihui_ai/qwen3.5-abliterated
- Artículo de HackerNoon sobre Huihui-Qwen3.5-9B-Abliterated: https://hackernoon.com/huihui-qwen35-9b-abliterated-what-this-uncensored-model-does
- Guía de Codersera sobre Qwen3.5-9B Abliterated: https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/
