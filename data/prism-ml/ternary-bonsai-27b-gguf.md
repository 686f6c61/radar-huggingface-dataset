# prism-ml/Ternary-Bonsai-27B-gguf

## Resumen

Ternary Bonsai 27B es un modelo de lenguaje de 27 300 millones de parámetros desarrollado por Prism ML, que aplica una cuantización ternaria extrema (pesos en {−1, 0, +1}) sobre el modelo base Qwen3.6-27B, manteniendo la arquitectura híbrida de atención (~75 % lineal, ~25 % completa) del original. El resultado es un peso desplegado de aproximadamente 7,2 GB, unas 9,4 veces más compacto que la versión FP16, con una retención declarada del 95 % de la inteligencia del modelo original. Está diseñado para ejecutarse en dispositivos con recursos limitados, como portátiles convencionales o GPUs de consumo, sin renunciar a capacidades de razonamiento, generación de código o uso de herramientas.

La relevancia de este modelo radica en que demuestra que es posible operar en el régimen de menos de 4 bits por peso sin colapso de las capacidades cognitivas, algo que las cuantizaciones binarias o ternarias convencionales no logran. Incluye una ventana de contexto de 262 000 tokens, soporte para visión opcional mediante una torre de visión cuantizada en 4 bits, y un drafter de decodificación especulativa (DSpark) que acelera la generación en CUDA. Se distribuye en formato GGUF Q2_0_g128, compatible con llama.cpp en CUDA, Metal y CPU, y también existe una versión MLX para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid attention (~75 % lineal / ~25 % full attention), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | ~27,3 B (lenguaje) + ~0,46 B (torre de visión) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | GGUF Q2_0_g128 (ternario, 1,71 bits/peso efectivos); visión en HQQ 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible; también MLX) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base Qwen3.6-27B, un transformer causal con atención híbrida: aproximadamente el 75 % de las capas usan atención lineal y el 25 % restante atención completa, lo que permite manejar contextos de 262 000 tokens con un coste de memoria razonable. La cuantización ternaria se aplica a todas las proyecciones de atención, MLP, embeddings y la cabeza de salida, con un esquema Q2_0_g128: cada peso se representa con un valor de {−1, 0, +1} y un factor de escala FP16 compartido por cada grupo de 128 pesos. Esto da un coste efectivo de 1,71 bits por peso, frente a los 16 bits del FP16.

No se han publicado detalles sobre el proceso de entrenamiento o ajuste (datos, número de tokens, técnicas de alineación como RLHF o DPO). La model card indica que el modelo es una derivación del base Qwen3.6-27B, pero no especifica si hubo destilación, fine-tuning posterior o solo cuantización. La innovación principal es la combinación de pesos ternarios con kernels personalizados en llama.cpp que consumen directamente los pesos empaquetados sin expandirlos a FP16, junto con el drafter DSpark de decodificación especulativa que proporciona una aceleración de 1,34x en la ruta de servido CUDA.

## Capacidades

- Generación de texto y razonamiento en modo pensamiento (thinking mode), con una puntuación media de 80,49 en 15 benchmarks de razonamiento, según la model card.
- Matemáticas: 93,40 en los mismos benchmarks, a dos puntos del modelo FP16.
- Generación de código: 85,96, manteniendo un nivel alto pese a la cuantización extrema.
- Uso de herramientas y comportamiento agéntico: 74,01, lo que indica que conserva la capacidad de llamar funciones y ejecutar tareas multi-paso.
- Soporte de visión opcional mediante una torre de visión cuantizada en 4 bits (HQQ), que se carga solo cuando se proporciona entrada de imagen.
- Multilingüismo: no se especifican idiomas concretos, pero al derivar de Qwen3.6-27B es probable que herede capacidades multilingües del base; no hay confirmación oficial.
- Compatibilidad con llama.cpp (CUDA, Metal, CPU) y con MLX para Apple Silicon.

## Casos de uso

- Inferencia en portátiles y equipos sin GPU dedicada: con ~7,2 GB de peso, el modelo puede ejecutarse en un MacBook con chip M5 Pro a ~26 tok/s, o en CPUs con suficiente RAM, permitiendo asistentes locales de razonamiento sin conexión.
- Asistentes de código en entornos de desarrollo: su puntuación de 85,96 en coding y el soporte de tool calling lo hacen adecuado para integrarse en IDEs o pipelines de CI/CD que necesiten generación y revisión de código con recursos limitados.
- Agentes autónomos en dispositivos edge: la capacidad de uso de herramientas (74,01) y el contexto de 262K permiten construir agentes que gestionen conversaciones largas, consulten APIs o ejecuten acciones en sistemas embebidos.
- Razonamiento matemático y científico en entornos educativos: con 93,40 en matemáticas, puede servir como tutor o asistente de resolución de problemas en aplicaciones móviles o de escritorio.
- Chatbots de atención al cliente con contexto prolongado: la ventana de 262K tokens permite mantener historiales extensos de conversación sin perder información, ideal para soporte técnico o jurídico.
- Prototipado rápido de aplicaciones de IA generativa: al ser Apache 2.0 y caber en una GPU consumer (por ejemplo, RTX 4090 con 24 GB), permite experimentar con razonamiento avanzado sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en 15 benchmarks de modo pensamiento (thinking-mode), comparados con el modelo base FP16 y con una cuantización convencional IQ2_XXS:

| Benchmark | Ternary Bonsai 27B | IQ2_XXS (convencional) | FP16 (base) |
|---|---|---|---|
| Media (15 benchmarks) | 80,49 | 72,73 | ~84,7 (estimado) |
| Matemáticas | 93,40 | no disponible | ~95,4 (estimado) |
| Coding | 85,96 | no disponible | ~90,5 (estimado) |
| Agentic tool use | 74,01 | no disponible | ~78,2 (estimado) |

Nota: los valores de FP16 son estimaciones basadas en la afirmación de retención del 95 %; no se proporcionan cifras exactas en la documentación. La velocidad de inferencia declarada es de ~26 tok/s en un Apple M5 Pro con el backend Metal.

## Requisitos de hardware

- VRAM estimada: ~7,2 GB para el modelo completo (peso GGUF), más overhead de KV cache. Con contexto completo de 262K, la caché KV cuantizada a 4 bits ocupa ~4,3 GB adicionales, por lo que se recomienda al menos 12 GB de VRAM para uso con contexto máximo.
- GPUs compatibles: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090). También funciona en Apple Silicon con Metal (M1 o superior) y en CPU pura.
- En consumer GPU: sí, cabe en GPUs de 8-12 GB con cuantización y contexto reducido; para contexto completo se necesitan 16 GB o más.
- Opciones de despliegue: llama.cpp (CUDA, Metal, CPU), MLX para Apple Silicon, y el fork de llama.cpp de Prism ML con kernels optimizados para pesos ternarios.
- Latencia y throughput: ~26 tok/s en M5 Pro (Metal); en CUDA con DSpark se reporta una aceleración de 1,34x sobre la decodificación estándar, aunque no se dan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño desplegado | Licencia | Rendimiento (media 15 benchmarks) |
|---|---|---|---|---|---|---|
| Ternary Bonsai 27B | ~27,3 B | 262K | Ternaria (1,71 bits) | ~7,2 GB | Apache 2.0 | 80,49 |
| Qwen3.6-27B (FP16) | ~27,3 B | 262K | FP16 | ~54 GB | Apache 2.0 | ~84,7 (estimado) |
| Qwen3.6-27B (IQ2_XXS) | ~27,3 B | 262K | 2-bit convencional | ~11 GB (estimado) | Apache 2.0 | 72,73 |

La comparativa muestra que la cuantización ternaria de Prism ML supera claramente a la IQ2_XXS convencional en calidad, con un tamaño menor. Frente al FP16, la pérdida es de aproximadamente 5 puntos porcentuales, pero con una reducción de memoria de 9,4x.

## Limitaciones y advertencias

- La cuantización ternaria, aunque conserva gran parte de la capacidad, introduce una pérdida de precisión en tareas muy sensibles a detalles numéricos o de formato; se recomienda validar en casos de uso específicos.
- No se han publicado detalles sobre el entrenamiento o los datos utilizados, por lo que no es posible evaluar sesgos potenciales o la composición del corpus.
- El soporte multilingüe no está documentado; aunque el base Qwen3.6-27B es multilingüe, la cuantización podría afectar a idiomas poco representados.
- La torre de visión es opcional y requiere un archivo mmproj adicional (~0,63 GB); sin ella, el modelo no procesa imágenes.
- Los kernels personalizados de llama.cpp y MLX son necesarios para aprovechar al máximo los pesos ternarios; el uso con kernels estándar podría no ser compatible o degradar el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.6-27B (también Apache 2.0) y cualquier otra dependencia.
- El modelo está diseñado para inferencia, no para fine-tuning; no se proporcionan pesos en formato de entrenamiento.

## Enlaces

- [HuggingFace: prism-ml/Ternary-Bonsai-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf)
- [Whitepaper (PDF)](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-27b-whitepaper.pdf)
- [Demo y ejemplos (GitHub)](https://github.com/PrismML-Eng/Bonsai-demo)
- [Fork de llama.cpp con kernels ternarios](https://github.com/PrismML-Eng/llama.cpp)
- [Fork de MLX para Apple Silicon](https://github.com/PrismML-Eng/mlx)
- [Fork de mlx-swift para iOS/macOS](https://github.com/PrismML-Eng/mlx-swift)
- [Versión MLX 2-bit](https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit)
- [Versión 1-bit para iPhone](https://huggingface.co/prism-ml/Bonsai-27B-gguf)
- [Discord de Prism ML](https://discord.gg/prismml)
