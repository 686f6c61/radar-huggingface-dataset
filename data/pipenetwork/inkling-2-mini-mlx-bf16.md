# pipenetwork/Inkling-2-Mini-MLX-bf16

## Resumen

Inkling-2-Mini-MLX-bf16 es una conversión a formato MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario pipenetwork. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con capacidad de entrada imagen-texto y salida de texto, orientado a tareas conversacionales. Esta variante concreta está pensada para ejecutarse en hardware Apple Silicon mediante el framework MLX, no en GPUs NVIDIA.

La conversión mantiene los pesos nativos NVFP4 de los expertos enrutados del checkpoint original, mientras que las capas de atención, embeddings y capas densas se conservan en bfloat16. El resultado es un repositorio de 19,6 GB con 26.388.559.360 parámetros totales. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada: se trata de una conversión de la comunidad con cero descargas y cero likes en el momento de la consulta, y el propio autor advierte de que solo se ha probado la generación de texto mediante una prueba básica, sin validar la torre de visión. Además, requiere una versión de mlx-lm que aún no está publicada en el momento de la conversión (PR ml-explore/mlx-lm#2086), lo que limita su uso en entornos estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal imagen-texto, convertido a MLX |
| Parámetros totales | 26.388.559.360 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos de expertos enrutados en NVFP4; atención, embeddings y capas densas en bfloat16; tag de cuantización 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); repositorio de 19,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con pipeline image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje con expertos enrutados. La conversión a MLX preserva la cuantización NVFP4 original de los expertos enrutados y eleva a bfloat16 las capas de atención, embeddings y densas, una mezcla que busca equilibrar fidelidad numérica en las partes sensibles y ahorro de memoria en los expertos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas específicas más allá del esquema MoE y la cuantización NVFP4 de los expertos. La conversión se realizó con mlx-lm a partir del PR abierto ml-explore/mlx-lm#2086, y el autor indica que las versiones publicadas de mlx-lm hasta la 0.32.2 no cargan este modelo.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (image-text-to-text, conversational).
- Entrada multimodal imagen-texto: el modelo base acepta imágenes, aunque la torre de visión no fue probada en esta conversión.
- Razonamiento y generación de lenguaje propio de un modelo MoE de 26,4 mil millones de parámetros totales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: desarrolladores con Mac equipados con chip M-series pueden cargar el modelo vía MLX para experimentar con un MoE multimodal sin depender de GPUs NVIDIA, aprovechando la cuantización NVFP4 de los expertos para reducir el uso de memoria.
- Evaluación de conversiones MLX: equipos que trabajan en el ecosistema ml-explore pueden usar este checkpoint como referencia para validar el soporte de modelos MoE multimodales en mlx-lm, especialmente mientras el PR #2086 no se fusiona.
- Investigación sobre cuantización híbrida: la combinación de expertos en NVFP4 con capas densas en bfloat16 sirve para estudiar el impacto de esquemas de precisión mixta en la calidad de generación.
- Asistentes conversacionales en local: para flujos de chat multi-turno en entornos de escritorio con hardware Apple, siempre que se acepte la falta de validación de la torre de visión.
- Pruebas de pipelines image-text-to-text: aunque la visión no está verificada, el pipeline declarado permite experimentar con entradas de imagen en un entorno MLX controlado.
- Base para futuras conversiones y fine-tuning: al estar en safetensors y con licencia Apache 2.0, puede servir como punto de partida para adaptaciones posteriores en el ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 19,6 GB en safetensors; la carga en memoria requiere al menos esa cantidad más overhead de ejecución, por lo que se recomienda un equipo con 32 GB de memoria unificada o más.
- GPU recomendadas: hardware Apple Silicon (M-series) con MLX; no aplica a A100, H100 ni RTX 4090, ya que el formato es MLX y no CUDA.
- ¿Cabe en GPU consumer? No en GPUs NVIDIA consumer por formato; en Apple Silicon, sí en configuraciones con memoria unificada suficiente (32 GB o superior recomendable).
- Opciones de despliegue: mlx-lm (requiere instalar desde el PR ml-explore/mlx-lm#2086 hasta que se publique una versión compatible); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-bf16 (esta ficha) | 26,4 B | no disponible | MLX safetensors | Apache 2.0 | Conversión comunitaria, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | no disponible en la información | no disponible | no disponible | Apache 2.0 | Modelo original del autor |
| Alternativas MoE multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base más allá de su identificador, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Conversión comunitaria sin validación exhaustiva: el autor solo realizó una prueba básica de generación de texto; la torre de visión no fue probada.
- Requiere una versión no publicada de mlx-lm (PR #2086); las versiones hasta 0.32.2 no cargan el modelo, lo que complica su uso en producción.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso real ni validación por parte de la comunidad.
- Sin información sobre sesgos, riesgo de alucinación ni comportamiento multilingüe; no se pueden evaluar estos riesgos a priori.
- Longitud de contexto desconocida, lo que impide planificar casos de uso con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión de un modelo base de terceros conviene verificar las condiciones del modelo original.
- Formato MLX restringe el despliegue a hardware Apple Silicon; no es portable a CUDA sin reconversión.
- La mezcla de precisión (NVFP4 en expertos, bfloat16 en capas densas) puede introducir diferencias numéricas respecto al checkpoint original que no han sido cuantificadas.

## Enlaces

- Hugging Face: https://huggingface.co/pipenetwork/Inkling-2-Mini-MLX-bf16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
