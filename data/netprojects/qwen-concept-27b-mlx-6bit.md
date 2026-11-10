# netprojects/Qwen-Concept-27B-MLX-6bit

## Resumen

Qwen Concept 27B MLX 6-bit es una conversión cuantizada del modelo ConceptCountry/qwen-concept-27b, una variante de Qwen3.8-27B (27.356.728.560 parámetros) en la que Concept Country ha editado quirúrgicamente nueve proyecciones MLP descendentes para que el modelo llegue a la respuesta con menos tokens de razonamiento. Esta build, publicada por NetProjects (Internet Projects Ltd), convierte el modelo a MLX con cuantización afín de 6 bits (grupo 64) en el modelo de lenguaje y mantiene la torre de visión en bf16, lo que permite ejecutarlo tanto en mlx-lm (texto) como en mlx-vlm (texto e imágenes) sobre Apple Silicon.

El problema que resuelve es doble: por un lado, reduce el coste de inferencia en modelos con modo "thinking", ya que según las mediciones del autor el modelo necesita entre un 27 % y un 54 % menos de tokens de pensamiento que Qwen3.8-27B sin editar; por otro, empaqueta el modelo en 22,8 GB, un tamaño manejable en equipos Mac con memoria unificada de gama alta. El repositorio incluye además builds de 4, 8 y bf16 bits para distintos presupuestos de memoria.

La relevancia actual reside en la combinación de tres factores: licencia Apache-2.0 (igual que el modelo base y Qwen3.8-27B), soporte multimodal image-text-to-text y un formato nativo para el stack MLX de Apple, que hasta ahora tenía menos opciones de modelos de razonamiento de 27B con visión. El modelo conserva el 98,6 % de coincidencia en el siguiente token respecto a la build bf16 de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con torre de visión; variante editada en 9 proyecciones MLP down_proj |
| Parámetros totales | 27.356.728.560 (27,36 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 6 bits afín con grupo de 64 (modelo de lenguaje); torre de visión en bf16. Existen builds de 4, 8 y bf16 bits |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 22,8 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de la familia Qwen con capacidad multimodal (pipeline image-text-to-text). Sobre esa base, Concept Country aplicó una técnica de "programación en espacio de pesos" descrita en su paper: editar directamente los pesos de nueve proyecciones `mlp.down_proj` (capas 32, 34, ..., 48) para inducir un comportamiento de razonamiento más conciso sin reentrenar. El autor de la conversión verificó tensor a tensor que 842 de los 851 tensores del modelo de lenguaje son idénticos al Qwen3.8-27B original y que exactamente nueve difieren, cada uno entre un 0,4 % y un 0,6 % en norma, coincidiendo con el `EDIT_SPEC.json` incluido en el repositorio.

La conversión a MLX cuantiza el modelo de lenguaje a 6 bits afín con grupo 64 y conserva la torre de visión en bf16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; la model card solo documenta el proceso de edición de pesos y la cuantización. La innovación técnica destacable es precisamente esa edición selectiva de pesos, que reduce los tokens de pensamiento manteniendo la precisión, más la verificación de integridad de los ficheros fuente mediante `SHA256SUMS`.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable, con recomendación de temperatura 1.0, top-p 0.95 y top-k 20.
- Razonamiento matemático: validado en problemas MATH-500 nivel 5 con decodificación greedy.
- Visión y comprensión de imágenes: pipeline image-text-to-text, con torre de visión en bf16; las builds de 4, 6 y 8 bits describen correctamente una imagen de prueba en mlx-vlm.
- Conversación multi-turno (tag conversational).
- Razonamiento multi-paso con presupuesto de tokens de pensamiento más ajustado que el modelo base.
- Servido con API compatible con OpenAI mediante `mlx_lm.server` y `mlx_vlm.server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.
- Idiomas soportados: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático en local sobre Mac: el modelo resuelve problemas MATH-500 nivel 5 con un 73 % de respuestas correctas bajo un límite de 3.072 tokens de pensamiento, frente al 55 % del Qwen3.8-27B 4-bit, lo que lo hace adecuado para asistentes de matemáticas que deben responder dentro de un presupuesto de latencia acotado.
- Análisis de documentos con imágenes: al soportar image-text-to-text en mlx-vlm, puede procesar capturas, diagramas o fotografías junto a una pregunta textual, útil para herramientas internas de extracción de información en equipos que trabajan sobre macOS.
- Asistentes de razonamiento con latencia reducida: la edición de pesos recorta los tokens de pensamiento (mediana de 673 frente a 1.477 en el modelo base a 4 bits), lo que se traduce en menor tiempo por consulta en flujos interactivos.
- Prototipado y evaluación de modelos en Apple Silicon: al ser una build MLX nativa con API compatible con OpenAI, sirve para montar un endpoint local de pruebas sin depender de GPUs NVIDIA.
- Investigación sobre edición de pesos: el repositorio incluye `EDIT_SPEC.json` y verificación tensor a tensor, lo que lo convierte en un caso de estudio reproducible para quienes investigan programación en espacio de pesos.
- Despliegue en estaciones de trabajo Mac de gama alta: con 22,8 GB de pesos, cabe en equipos con 32 GB o más de memoria unificada, lo que permite ofrecer inferencia multimodal sin infraestructura en la nube.
- Generación de código y tool calling en producción: no disponible en la información proporcionada; la model card no documenta estas capacidades de forma específica.

## Benchmarks y rendimiento

Datos publicados en la model card. Problemas MATH-500 nivel 5, decodificación greedy, mismo conjunto y ajustes para todos los modelos, sobre MacBook Pro M5 Max (128 GB), 10 de noviembre de 2026. 40 problemas con límite de 3.072 tokens, ambos modelos a 4 bits:

| Métrica | Qwen3.8-27B 4-bit | Qwen Concept 27B 4-bit |
|---|---|---|
| Tokens de pensamiento, media | 1.746 | 1.202 (31 % menos) |
| Tokens de pensamiento, mediana | 1.477 | 673 |
| Terminó el pensamiento dentro del límite | 58 % | 83 % |
| Respuesta final correcta | 55 % | 73 % |
| Tiempo de la ejecución | 19 min | 12 min |

Primeros 16 problemas con límite de 2.048 tokens, media de tokens de pensamiento:

| Build | Tokens de pensamiento (media) |
|---|---|
| Qwen3.8-27B 4-bit (sin editar) | 1.178 |
| Qwen Concept 4-bit | 876 |
| Qwen Concept 6-bit | 801 |
| Qwen Concept 8-bit | 909 |

Fidelidad de cuantización (coincidencia del siguiente token con la build MLX bf16, 12 prompts con thinking on y off, 96 tokens forzados por profesor):

| Build | Tamaño | Coincidencia con bf16 |
|---|---|---|
| 6-bit (esta build) | 22,8 GB | 98,6 % |
| 8-bit | 29,5 GB | 99,0 % |
| 4-bit | 16,1 GB | 95,3 % |
| bf16 | 54,7 GB | referencia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 22,8 GB solo para los pesos en 6 bits; se recomienda al menos 32 GB de memoria unificada para dejar margen al KV cache y a la torre de visión en bf16.
- Builds alternativas: 4 bits (16,1 GB) para equipos con 24-32 GB; 8 bits (29,5 GB) para 48 GB o más; bf16 (54,7 GB) para 64-128 GB.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). El autor reporta pruebas en MacBook Pro M5 Max con 128 GB. No hay soporte documentado para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumidor: sí, en Mac con memoria unificada suficiente; no aplica a GPUs discretas NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (texto) y `mlx-vlm` (texto e imágenes), con servidores `mlx_lm.server` y `mlx_vlm.server` que exponen API compatible con OpenAI. Probado con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- Latencia y throughput: la model card reporta 12 minutos para 40 problemas MATH-500 nivel 5 con la build de 4 bits en un M5 Max, frente a 19 minutos del modelo base; no se proporcionan métricas de tokens por segundo para la build de 6 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| Qwen Concept 27B MLX 6-bit (esta build) | 27,36 B | No disponible | 6 bits afín grupo 64 | Apache-2.0 | MLX / Apple Silicon | 98,6 % de coincidencia con bf16; 31 % menos tokens de pensamiento |
| Qwen Concept 27B MLX 4-bit | 27,36 B | No disponible | 4 bits | Apache-2.0 | MLX / Apple Silicon | 16,1 GB; 95,3 % de coincidencia; 73 % de acierto en MATH-500 nivel 5 |
| Qwen3.8-27B 4-bit (mlx-community) | 27 B (aprox.) | No disponible | 4 bits | No disponible | MLX / Apple Silicon | Modelo base sin editar; 55 % de acierto en MATH-500 nivel 5 |
| Qwen Concept 27B MLX 8-bit | 27,36 B | No disponible | 8 bits | Apache-2.0 | MLX / Apple Silicon | 29,5 GB; 99,0 % de coincidencia con bf16 |

No se dispone de datos para comparar con alternativas de otros ecosistemas (por ejemplo, builds GGUF o de vLLM) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: no cuantificado en la model card; el modo thinking reducido podría aumentar la probabilidad de respuestas incorrectas en problemas que requieren cadenas de razonamiento largas, aunque los datos de MATH-500 muestran mejor precisión que el modelo base.
- Limitaciones de contexto: la longitud de contexto no se especifica; conviene consultar la model card de Qwen3.8-27B antes de usarlo con documentos largos.
- Idiomas: no se declaran idiomas soportados; no se puede asumir cobertura multilingüe sin verificación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor aclara que NetProjects no está afiliado a Concept Country ni a Alibaba Cloud; el archivo `NOTICE` atribuye créditos a ambos.
- Plataforma: exclusivo de Apple Silicon vía MLX; no es desplegable en GPUs NVIDIA con vLLM, TGI o llama.cpp sin conversión adicional.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026; no hay evidencia de uso en producción.
- Verificación: la coincidencia del 98,6 % con bf16 se midió sobre 12 prompts y 96 tokens forzados por profesor, una muestra pequeña que no garantiza el mismo comportamiento en dominios no evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-6bit
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Build de 8 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-bf16
- Qwen3.8-27B 4-bit de referencia (mlx-community): https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Paper de programación en espacio de pesos: https://concept.country/research/weight-space-programming
- NetProjects: https://netprojects.com
