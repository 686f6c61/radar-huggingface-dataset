# donedynamics/Qwen3.8-27B-heretic-MLX-4bit

## Resumen

Este repositorio contiene una conversión a MLX con cuantización de 4 bits del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, un derivado "abliterated" (sin censura) de `Qwen/Qwen3.8-27B`, el último modelo denso de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. La conversión está optimizada para Apple Silicon mediante la librería `mlx-lm` y elimina el comportamiento de rechazo del modelo original, por lo que responde a peticiones que un modelo con alineación de seguridad normalmente declinaría.

El modelo base Qwen3.8-27B es un vision-language model denso con una ventana de contexto nativa de 262 000 tokens, diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Sin embargo, esta conversión MLX es estrictamente de texto: no incluye la torre de visión, por lo que no admite entrada de imágenes ni vídeo. La cuantización de 4 bits reduce el tamaño a 15,1 GB y alcanza una velocidad de generación de 37,9 tokens por segundo en un Mac Studio M3 Ultra, lo que lo hace viable en hardware de consumo de Apple.

La relevancia de este modelo reside en su doble naturaleza: por un lado, ofrece el rendimiento de un modelo de 27B en un formato ligero y eficiente para Apple Silicon; por otro, al estar abliterated, permite explorar casos de uso donde se requiere una generación sin restricciones de seguridad, siempre que el usuario asuma la responsabilidad de aplicar sus propios filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27B (modelo base); el archivo safetensors muestra 4 204 731 904, valor inconsistente que probablemente corresponde a un error de extracción |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (nativo del modelo base) |
| Tipos de cuantizacion | 4-bit (este repo), 6-bit y 8-bit disponibles según mediciones del autor |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3.8 es multilingüe, pero no se confirma para esta conversión |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención completa, entrenado por el equipo Qwen de Alibaba con un enfoque en tareas de codificación, razonamiento y agéntica. No se dispone de detalles públicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset. El derivado `heretic-ara` fue sometido a un proceso de abliteración mediante la herramienta Heretic, que elimina quirúrgicamente el comportamiento de rechazo del modelo sin requerir reentrenamiento. Esta conversión MLX se realizó con `mlx-lm` 0.31.3 a partir de los pesos bf16 del modelo abliterated, verificando la integridad de los 7 shards y 1199 tensores antes de la cuantización.

La cuantización a 4 bits reduce el tamaño de los pesos a aproximadamente 4,5 bits por peso, lo que explica la reducción de 27B a 15,1 GB en disco. No se añade ni se elimina alineación en este paso: solo se cambia el formato y la precisión.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextualizadas en tareas de lenguaje natural.
- Razonamiento configurable: el chat template soporta `enable_thinking` y `reasoning_effort`, activando un modo de pensamiento previo a la respuesta (por defecto activado).
- Tool calling y agentes: el modelo base Qwen3.8 está diseñado para flujos agénticos y manejo de herramientas, aunque esta conversión no modifica dichas capacidades.
- Multilingüe: el modelo base soporta múltiples idiomas, pero no se confirma explícitamente para esta conversión.
- Text-only: no admite entrada de imágenes ni vídeo; solo procesa texto.
- Sin censura: al estar abliterated, no muestra rechazo ante peticiones que un modelo alineado declinaría, lo que puede ser útil o problemático según el caso.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, puede gestionar conversaciones multi-turno extensas y recordar detalles de interacciones previas, aunque requiere un filtro de contenido adicional por su naturaleza sin censura.
- Generación de código en producción: el modelo base destaca en tareas de codificación; esta conversión puede integrarse en pipelines de CI/CD para autocompletado o revisión de código, siempre que se apliquen validaciones de seguridad.
- Agentes autónomos: su soporte para tool calling y razonamiento multi-step lo hace adecuado para orquestar tareas como búsqueda web, ejecución de comandos o interacción con APIs.
- Investigación académica: útil para estudiar el comportamiento de modelos abliterated y comparar la generación sin restricciones frente a modelos alineados.
- Escritura creativa y generación de contenido: permite explorar temas sensibles o controvertidos sin las limitaciones típicas de los modelos censurados, bajo responsabilidad del usuario.
- Prototipado rápido en Apple Silicon: al ser una conversión MLX, se ejecuta de forma nativa en Mac con buen rendimiento, ideal para desarrollo local y pruebas sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX. La model card del autor incluye mediciones de rendimiento en un Mac Studio M3 Ultra (512 GB) con `mlx-lm` 0.31.3, que se resumen a continuación (una sola ejecución, no un benchmark formal):

| Build | Tamaño | Bits/peso | Generación | Memoria pico |
|---|---|---|---|---|
| 4-bit | 15,1 GB | 4,501 | 37,9 tok/s | 15,5 GB |
| 6-bit | 21,4 GB | 6,501 | 27,9 tok/s | 22,2 GB |
| 8-bit | 28,6 GB | 8,501 | 22,2 tok/s | 28,9 GB |

En cuanto al modelo base Qwen3.8-27B, fuentes externas reportan resultados en DeepSWE (42,2), Terminal Bench (73,0) y OSWorld (84,3), pero estos datos corresponden al modelo original con visión y no a esta conversión text-only cuantizada.

## Requisitos de hardware

- VRAM estimada: 15,5 GB para la versión 4-bit, 22,2 GB para 6-bit y 28,9 GB para 8-bit, según mediciones en Apple Silicon con memoria unificada.
- GPU recomendadas: Apple Silicon (M3 Ultra o superior) para ejecución nativa con MLX. En GPUs NVIDIA se podría usar vLLM u otras herramientas, pero no hay datos publicados para esta conversión.
- Compatibilidad con GPU de consumo: en Mac con al menos 16 GB de memoria unificada puede ejecutarse la versión 4-bit, aunque el rendimiento dependerá del modelo concreto.
- Opciones de despliegue: `mlx-lm` (CLI y Python), compatible con el ecosistema MLX. Para NVIDIA, sería necesario convertir a otro formato (GGUF, etc.) no incluido en este repo.
- Latencia y throughput: 37,9 tok/s en Mac Studio M3 Ultra (4-bit), 27,9 tok/s (6-bit) y 22,2 tok/s (8-bit). Son valores orientativos de una sola ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache-2.0 | bf16 | Multimodal (visión + texto), con alineación de seguridad |
| Qwen3.8-27B-heretic-ara | 27B | 262K | Apache-2.0 | bf16 | Abliterated, sin censura, multimodal |
| Este repo (MLX 4-bit) | 27B | 262K | Apache-2.0 | MLX 4-bit | Text-only, sin censura, optimizado para Apple Silicon |

La comparativa se limita a la cadena de derivación. No se dispone de datos de rendimiento frente a otros modelos de 27B como Qwen2.5-27B o Llama-3-27B en tareas estándar.

## Limitaciones y advertencias

- Text-only: la torre de visión del modelo base se ha eliminado; no procesa imágenes ni vídeo.
- Sin censura: al estar abliterated, puede generar contenido inapropiado, ofensivo o peligroso. No es apto para producción sin filtros adicionales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información, especialmente en temas especializados.
- Sesgos: el modelo base puede arrastrar sesgos de los datos de entrenamiento; la abliteración no los corrige.
- Contexto largo: aunque soporta 262K tokens, el rendimiento con contextos muy largos puede degradarse y el coste computacional aumenta.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario es responsable del contenido generado.
- Sin garantías: la model card del autor advierte explícitamente que se debe evaluar antes de ponerlo frente a usuarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-4bit
- Modelo base abliterated: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía completa en Lovable: https://lovableapp.org/blog/qwen3-8-27b
- Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
