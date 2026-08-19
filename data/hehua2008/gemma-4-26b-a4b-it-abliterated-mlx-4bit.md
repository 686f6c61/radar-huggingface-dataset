# hehua2008/gemma-4-26B-A4B-it-abliterated-MLX-4bit

## Resumen

El modelo `hehua2008/gemma-4-26B-A4B-it-abliterated-MLX-4bit` es una conversión a formato MLX (optimizado para Apple Silicon) con cuantización de 4 bits de una variante "abliterated" de Gemma 4, desarrollada por el usuario hehua2008 a partir del modelo base `huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated`. La técnica de abliteration elimina las capas de rechazo del modelo original, reduciendo la censura y permitiendo respuestas más abiertas en temas sensibles, lo que lo hace atractivo para aplicaciones de escritura creativa, roleplay o asistentes sin restricciones de contenido.

Según la nomenclatura del nombre, se trata de un modelo de arquitectura Mixture of Experts (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token, aunque el archivo safetensors incluido en el repositorio contiene 4.514.678.350 parámetros, una discrepancia que podría deberse a la cuantización o a una variante reducida. El pipeline se etiqueta como `any-to-any`, lo que sugiere capacidades multimodales, aunque no se detallan en la documentación. La licencia es Apache 2.0, lo que permite uso comercial, y el repositorio ocupa 15,4 GB, un tamaño típico para un modelo de 26B en 4 bits.

Este modelo es relevante para desarrolladores que buscan ejecutar localmente en hardware de Apple un LLM con menos restricciones de contenido, aprovechando el ecosistema MLX para inferencia eficiente en memoria unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en Gemma 4 |
| Parametros totales | 26B (según nomenclatura del modelo); archivo safetensors muestra 4.514.678.350 |
| Parametros activos | 4B (según nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a licencia Gemma 4) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. El nombre del modelo indica una estructura MoE con 26B parámetros totales y 4B activos, similar a la familia Gemma 3/4 de Google. La técnica de abliteration, aplicada por el autor del modelo base (huihui-ai), consiste en eliminar las direcciones de rechazo en las capas del transformer, reduciendo la probabilidad de que el modelo se niegue a responder a ciertas solicitudes. El entrenamiento original de Gemma 4 no se detalla aquí; solo se sabe que la conversión a MLX y la cuantización a 4 bits fueron realizadas por hehua2008.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO en el modelo original. La conversión MLX conserva los pesos cuantizados, lo que reduce el tamaño del modelo de aproximadamente 26B a 15,4 GB en disco.

## Capacidades

- Generación de texto y razonamiento: al ser una variante de Gemma 4, se espera que mantenga capacidades de generación de lenguaje natural, razonamiento lógico y comprensión contextual.
- Soporte multimodal: el pipeline `any-to-any` sugiere que el modelo original puede procesar y generar múltiples modalidades (texto, imagen, audio, vídeo), aunque no se confirma en la documentación.
- Tool calling y function calling: no se especifica, pero es común en modelos recientes de la familia Gemma.
- Capacidades multilingües: no disponibles en la información.
- Modo "uncensored": gracias a la abliteration, el modelo responde con menos rechazos a temas controvertidos, lo que puede ser útil en aplicaciones de escritura creativa o simulación de personajes.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede generar historias, diálogos o guiones sin las restricciones habituales de censura, lo que permite explorar temas adultos o controvertidos con mayor libertad.
- Roleplay y chatbots de personajes: al eliminar los rechazos, el modelo puede mantener conversaciones más naturales y abiertas en entornos de simulación de personajes, sin interrupciones por políticas de contenido.
- Asistente local de desarrollo: en entornos donde se requiere un LLM que no rechace preguntas sobre vulnerabilidades o exploits (con fines educativos), este modelo puede ofrecer respuestas más directas, aunque con riesgos de seguridad.
- Generación de código sin restricciones: para tareas de programación donde se necesite explorar soluciones no convencionales o poco documentadas, el modelo puede proporcionar sugerencias sin filtros.
- Investigación en alineación y seguridad: el abliteration permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, útil para analizar sesgos y riesgos de modelos "uncensored".
- Despliegue en Mac con MLX: al estar optimizado para Apple Silicon, se integra fácilmente en aplicaciones macOS/iOS usando la librería MLX, con bajo consumo de memoria gracias a la cuantización 4-bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo cuantizado a 4 bits con 26B parámetros (aunque el safetensors sugiere menos), se estima que necesita entre 15 y 20 GB de memoria unificada en Apple Silicon. El tamaño del repositorio (15,4 GB) da una pista del uso de RAM.
- GPU recomendadas: Apple Silicon con al menos 16 GB de RAM unificada (M1 Pro, M1 Max, M2 Pro, M2 Max, M3 Max, etc.). Modelos con 8 GB no son suficientes.
- Compatibilidad con consumer GPU: solo Apple Silicon, dado que MLX es específico para ese hardware.
- Opciones de despliegue: MLX (librería nativa), llama.cpp (con soporte MLX), Ollama (si se integra), o mediante scripts Python con `mlx-lm`.
- Latencia y throughput: no disponibles, pero en Apple Silicon con 16 GB se puede esperar una generación de 10-20 tokens/segundo para modelos de este tamaño en 4 bits, dependiendo de la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. Se puede mencionar que existen otras conversiones abliterated de Gemma 3 (como las de huihui-ai) y modelos MoE similares, pero no hay datos concretos en la documentación.

## Limitaciones y advertencias

- La abliteration elimina mecanismos de rechazo, lo que puede llevar a generar contenido inapropiado, ofensivo o peligroso. No es recomendable para uso en producción sin supervisión humana.
- La discrepancia entre el nombre del modelo (26B-A4B) y el número de parámetros en safetensors (4,5B) sugiere posibles errores en la conversión o en la documentación; se recomienda verificar el modelo antes de usarlo.
- No se especifican idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- Al ser una conversión no oficial de un modelo abliterated, la calidad y fidelidad respecto al Gemma 4 original no está garantizada.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia de Gemma 4 (enlazada en la model card) para asegurar el cumplimiento.
- No hay información sobre benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/hehua2008/gemma-4-26B-A4B-it-abliterated-MLX-4bit)
- [Modelo base: huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated](https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
