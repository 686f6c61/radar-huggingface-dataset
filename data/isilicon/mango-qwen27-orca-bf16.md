# isilicon/mango-qwen27-orca-bf16

## Resumen

mango-qwen27-orca-bf16 es un espejo de preservación publicado por la cuenta isilicon (proyecto Mango) que contiene la cuantización BF16 en formato GGUF, dividida en dos fragmentos, del modelo orcarouter_Qwen3.8-27B-Uncensored de OrcaRouter, empaquetado originalmente por bartowski. El modelo subyacente es una modificación de 27 mil millones de parámetros basada en la familia Qwen (27.320.697.856 parámetros según los metadatos de safetensors), orientada a generación de texto conversacional sin filtros ("uncensored").

El repositorio no es un modelo nuevo: su propósito es preservar los bytes originales de la fuente (con manifiesto SHA-256 y revisión fijada de bartowski) y documentar su evaluación. La model card indica explícitamente que no se ha publicado una puntuación de calidad Mango para estos archivos exactos, aunque sí existen resultados de configuraciones relacionadas (por ejemplo, una variante MLX 4-bit del mismo modelo con 80,64/100).

Es relevante porque facilita el acceso a un artefacto BF16 de máxima fidelidad para investigadores que quieran ejecutar sus propias cuantizaciones o verificar el comportamiento del modelo original, con licencia Apache 2.0 y soporte de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8, variante modificada por OrcaRouter) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repositorio); existen variantes IQ4_XS imatrix, Q6_K y MLX 4-bit en reposos relacionados |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos fragmentos, 54,66 GB en total: 39,96 GB + 14,70 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8 27B, un transformer denso de la familia Qwen, modificado por OrcaRouter y distribuido como "uncensored" por bartowski en formato GGUF. La model card no detalla la composición exacta de la modificación, el número de tokens de entrenamiento ni el dataset empleado, por lo que estos datos no están disponibles. Tampoco se especifica si el modelo pasó por RLHF o DPO.

Como detalle técnico relevante, las configuraciones hermanas del proyecto mencionan la presencia de MTP (multi-token prediction) embebido y rutas opcionales de decodificación especulativa (draft head), lo que sugiere soporte de generación acelerada en algunos artefactos derivados; sin embargo, la model card advierte que no todos los caminos opcionales de decodificación especulativa están verificados para este artefacto concreto.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag "conversational").
- Tareas de texto y tool calling cubiertas por la evaluación local de Mango ("text/tool tasks").
- Soporte multilingüe en inglés y chino.
- Naturaleza "uncensored": sin los filtros de alineación del modelo original, lo que amplía el rango de respuestas pero exige supervisión del usuario.
- No se ha verificado la longitud de contexto completa anunciada ni capacidades de imagen o audio para este artefacto.

## Casos de uso

- Investigación de cuantizaciones: al ser BF16 de máxima fidelidad, sirve como punto de partida para generar cuants propias (Q4, Q6, IQ) y comparar degradación de calidad.
- Verificación de procedencia: el manifiesto SHA-256 y la revisión fijada permiten auditar que los pesos ejecutados coinciden con los originales de bartowski.
- Chatbots sin restricciones para entornos controlados: su naturaleza uncensored lo adecúa a pruebas de red-teaming y análisis de seguridad de modelos.
- Asistentes bilingües inglés/chino: soporte declarado de ambos idiomas para aplicaciones conversacionales.
- Evaluaciones comparativas de benchmarks: el proyecto Mango publica metodología y datasets de evaluación reutilizables para reproducir pruebas con prompts congelados.
- Integración con llama.cpp y runtimes GGUF: formato estándar para inferencia local en CPU/GPU con dos fragmentos cargables secuencialmente.

## Benchmarks y rendimiento

No se ha publicado una puntuación de calidad Mango para estos archivos exactos (BF16). Resultados de configuraciones relacionadas (no comparables directamente con este artefacto):

| Configuración relacionada | Puntuación ponderada | Mínimo de carga de trabajo |
|---|---|---|
| Qwen3.8 27B Cyber · IQ4_XS imatrix · MTP embebido | 70,27 | 29,74 |
| Qwen3.8 27B Cyber · Q6_K · Q8 MTP + projector | 66,98 | 45,60 |
| Qwen3.8 27B · MLX affine 4-bit · OrcaRouter | 80,64 | 23,98 |

Estudio adicional de esfuerzo en la variante MLX 4-bit: medium 82,87/100 frente a xhigh 84,41/100 (diferencia emparejada +1,54 puntos, intervalo 95 % [-1,71, +4,82], 403 preguntas válidas).

## Requisitos de hardware

- El payload del modelo ocupa 54,66 GB en disco; a BF16, la inferencia requiere aproximadamente esa cantidad de memoria de pesos, más KV cache, memoria de trabajo y asignaciones del runtime.
- Con 54,7 GB de pesos, no cabe en GPUs de consumo habituales (una RTX 4090 con 24 GB es insuficiente); se necesitan GPUs de gama datacenter (A100 80 GB, H100 80 GB) o multi-GPU, o bien descarga parcial a CPU/RAM.
- Alternativa práctica: usar las cuantizaciones hermanas (IQ4_XS, Q6_K o MLX 4-bit) que reducen drásticamente los requisitos.
- Despliegue: cualquier runtime compatible con GGUF multi-fragmento (llama.cpp, Ollama, LM Studio); la model card no documenta vLLM ni TGI para este artefacto (inference: false en el repo).
- Mantener ambos fragmentos juntos y cargar el primero con un runtime compatible. No se han publicado datos de latencia ni throughput para esta configuración BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/Cuant | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mango-qwen27-orca-bf16 (este) | 27,32 B | GGUF BF16 | no disponible | Apache 2.0 | Espejo de preservación, sin puntuación propia |
| Qwen3.8 27B · MLX 4-bit (mango-qwen38-27b-uncensored-mlx4) | 27,32 B | MLX affine 4-bit | no disponible | Apache 2.0 | 80,64/100 en suite Mango; para Apple Silicon |
| Qwen3.8 27B Cyber · IQ4_XS (mango-qwen27-cyber-iq4xs-mtp) | 27,32 B | GGUF IQ4_XS + MTP | no disponible | Apache 2.0 | 70,27/100; menor huella de memoria |

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido sin las salvaguardas habituales; su uso requiere supervisión y puede ser inadecuado para producción orientada a usuarios finales.
- No existe puntuación de calidad verificada para estos archivos exactos; las puntuaciones publicadas corresponden a otras cuantizaciones y no son extrapolables.
- La model card advierte no inferir rendimiento en Apple Silicon o TensorFold a partir del resultado MLX4.
- No se ha verificado el techo completo de contexto anunciado ni la calidad de imagen/audio.
- No hay companion artifacts declarados: proyectores, draft heads o rutas multimodales opcionales podrían no estar incluidos.
- Riesgo de alucinación, sesgos y limitaciones de idioma: no hay datos publicados específicos para este artefacto.
- La licencia Apache 2.0 permite uso comercial, pero la modificación "uncensored" de OrcaRouter puede tener consideraciones propias no documentadas en la card.

## Enlaces

- Repositorio: https://huggingface.co/isilicon/mango-qwen27-orca-bf16
- Modelo base (bartowski): https://huggingface.co/bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF
- Colección Mango (modelos probados y espejos): https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluación: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo (variante MLX4): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Variante IQ4_XS: https://huggingface.co/isilicon/mango-qwen27-cyber-iq4xs-mtp
- Variante Q6_K: https://huggingface.co/isilicon/mango-qwen27-cyber-q6k
- Variante MLX 4-bit: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4
- Manifiesto de fuente: https://huggingface.co/isilicon/mango-qwen27-orca-bf16/blob/main/SOURCE_MANIFEST.json
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
