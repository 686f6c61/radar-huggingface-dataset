# araysuter/Ornith-1.5-122B-MLX-mixed-2bit-down3

## Resumen
Ornith-1.5-122B-MLX-mixed-2bit-down3 es una conversión experimental a formato MLX del modelo Ornith-1.5-122B, desarrollado originalmente por ornith-ai. Se trata de una cuantización de precisión mixta pensada para ejecución en Apple Silicon mediante la librería MLX, que reduce el peso de los pesos originales en BF16 (unos 245 GB teóricos para 122.500 millones de parámetros) hasta los 45,45 GB del repositorio. El modelo base es un transformer de tipo MoE (mezcla de expertos) multimodal, con pipeline image-text-to-text, lo que implica capacidades de visión además de texto.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 122.000 millones de parámetros en hardware de consumo de Apple con memoria unificada relativamente contenida, a costa de una cuantización muy agresiva (2 bits en las proyecciones gate y up de los expertos enrutados, 3 bits en las down). El autor publica tres perfiles de cuantización distintos y una validación con subconjuntos fijos de benchmarks, además de mediciones de latencia y throughput en una única máquina.

No obstante, se trata de un artefacto experimental: la inferencia de imagen no está validada, los tensores MTP del modelo original se han excluido y no se ha medido la pérdida de calidad frente al checkpoint BF16. Los datos de rendimiento y benchmarks deben interpretarse con cautela, ya que proceden de subconjuntos pequeños y de una sola ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tipo qwen3_5_moe), pesos en MLX |
| Parametros totales | 122.562.817.776 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se probó una entrada de 128K en el perfil baseline, sin confirmación de contexto máximo oficial) |
| Tipos de cuantizacion | Precisión mixta: 2 bits (gate/up de expertos enrutados), 3 bits (down de expertos enrutados), 4 bits (otras proyecciones cuantizadas), 8 bits (routers y gates de expertos compartidos); group size 64; tensores no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 45.453.066.720 bytes (45,45 GB / 42,33 GiB) |

## Arquitectura y entrenamiento
El modelo base Ornith-1.5-122B es un transformer de mezcla de expertos (MoE) con capacidad multimodal image-text-to-text, según la etiqueta de pipeline y la inclusión de pesos de visión y assets de procesador en esta conversión. La arquitectura concreta se infiere del tag `qwen3_5_moe`, que sugiere una familia derivada de Qwen 3.5 con enrutamiento de expertos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

Esta ficha corresponde exclusivamente a la conversión cuantizada, no al entrenamiento. El autor indica que la conversión se realizó directamente desde el checkpoint BF16 en la revisión `dfa07bab90e90746ffbfc0b0cba3126eb9265de2`, con carga estricta de los 2.440 nombres de tensores. Se excluyeron los tensores MTP (multi-token prediction) del modelo fuente, por lo que este checkpoint no incluye los pesos de drafting originales, lo que impide usar decodificación especulativa nativa con este artefacto. Los pesos de visión están presentes, pero la inferencia de imagen no se ha validado en este experimento.

## Capacidades
- Generación de texto conversacional y razonamiento, con modo "thinking" desactivable (la validación se hizo con thinking desactivado).
- Capacidades multimodales de imagen a texto según el pipeline declarado, aunque la inferencia de imagen no está validada en esta conversión.
- Razonamiento matemático (subconjunto GSM8K evaluado).
- Generación de código (HumanEval adaptado a chat, evaluado con tests unitarios en sandbox).
- Seguimiento de instrucciones estrictas (IFEval con el checker oficial strict prompt-level).
- Conversaciones multi-turno con prompts de chat zero-shot.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en la model card.

## Casos de uso
- Inferencia local en Apple Silicon: el modelo cabe en 45,45 GB, por lo que puede ejecutarse en equipos con memoria unificada de 64 GB o superior usando MLX, sin necesidad de GPUs dedicadas. Adecuado para desarrolladores que quieran probar un modelo de 122B en un Mac Studio o MacBook Pro de gama alta.
- Prototipado de asistentes conversacionales: gracias a su pipeline de chat y a la ventana de contexto amplia (se probó una entrada de 128K en el perfil baseline), puede gestionar conversaciones multi-turno con historial largo en entornos de desarrollo.
- Evaluación de cuantizaciones agresivas: este checkpoint sirve como referencia para estudiar el impacto de 2-3 bits en tareas de razonamiento, matemáticas y código, comparando con los otros perfiles del mismo autor (2-bit g64 y 2-bit g32).
- Generación de código en local: el perfil down3 resolvió 16 de 20 tareas de HumanEval en la validación, por lo que puede usarse para autocompletado o generación de funciones en un entorno de desarrollo personal, con revisión humana obligatoria.
- Tareas de seguimiento de instrucciones: con un 84% en IFEval strict en la muestra de 25 preguntas, es adecuado para pipelines que requieran respuestas con formato estricto, como extracción de datos o generación de informes estructurados.
- Investigación sobre eficiencia de memoria: útil para medir latencia, throughput y asignación pico de MLX en modelos MoE grandes, ya que el autor publica tiempos de primer token y tokens por segundo en una configuración concreta.
- Experimentación multimodal controlada: aunque la inferencia de imagen no está validada, los pesos de visión están incluidos, por lo que puede servir para probar pipelines image-text-to-text en MLX asumiendo riesgo de resultados incorrectos.

## Benchmarks y rendimiento
Los datos proceden de una suite fija de 120 preguntas con respuestas greedy, prompts zero-shot, thinking desactivado y presupuestos de prompt/output idénticos. Son subconjuntos pequeños y no constituyen puntuaciones completas de benchmark.

| Modelo | Peso (GB) | ARC (50) | GSM8K (25) | HumanEval (20) | IFEval strict (25) |
|---|---:|---:|---:|---:|---:|
| Ornith · 2-bit g64 | 40,62 | 47/50 (94%) | 24/25 (96%) | 17/20 (85%) | 16/25 (64%) |
| Ornith · 2-bit + 3-bit down (este) | 45,45 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 21/25 (84%) |
| Ornith · 2-bit g32 | 47,87 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 18/25 (72%) |
| Swift-1.5 · 4-bit + DFlash2 | 15,83 | 47/50 (94%) | 25/25 (100%) | 20/20 (100%) | 19/25 (76%) |

Rendimiento medido en una única ejecución, sin caché, un solo usuario:

| Configuración | Tiempo hasta primer texto visible (20K tokens) | Tokens/s de generación |
|---|---:|---:|
| Ornith down3 (este) | 19,18 s | ~63,4 |
| Ornith baseline | 17,64 s | ~66,8 |
| Swift-1.5 (TensorFold + DFlash2) | 21,81 s | ~121,0 |

En la prueba de 128K, solo el perfil baseline completó: 282,54 s hasta el primer texto visible, 44,0 tokens/s reportados y 49,95 GB de asignación pico en MLX. El marcador de verificación oculto estaba presente, pero el razonamiento adicional provocó un fallo de coincidencia exacta en la salida. No se reclama que los perfiles mayores quepan en 128K.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 45,45 GB de pesos; el perfil baseline alcanzó 49,95 GB de asignación pico en MLX durante la prueba de 128K. Se recomienda al menos 64 GB de memoria unificada para margen operativo.
- GPU recomendadas: Apple Silicon con memoria unificada (M-series Pro/Max/Ultra). No está pensado para GPUs NVIDIA/AMD, ya que usa MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con 64 GB o más de memoria unificada; no en GPUs de consumo tradicionales por falta de soporte MLX y por tamaño.
- Opciones de despliegue: `mlx-vlm==0.7.9`, `mlx-lm==0.32.0`, `mlx==0.32.4` en Apple Silicon. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: ~19,18 s hasta el primer texto visible con 20K tokens de entrada sin caché y ~63,4 tokens/s de generación en una única ejecución. Se asignó swap de macOS durante las pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Peso | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-122B-MLX-mixed-2bit-down3 (este) | 122,56B | no disponible | 45,45 GB | MIT | Cuantización mixta 2/3 bits, MLX, multimodal no validado |
| Ornith-1.5-122B-MLX-mixed-2bit | no disponible | no disponible | 40,62 GB | MIT | Cuantización 2 bits g64, mejor ARC y HumanEval en la muestra, peor IFEval |
| Ornith-1.5-122B-MLX-mixed-2bit-group32 | no disponible | no disponible | 47,87 GB | MIT | Cuantización 2 bits g32, intermedio en IFEval |
| Swift-1.5 · 4-bit + DFlash2 | no disponible | no disponible | 15,83 GB (+3,85 GB drafter) | no disponible | 4 bits, mejor HumanEval (20/20) y mayor throughput (~121 tokens/s) |

## Limitaciones y advertencias
- Cuantización muy agresiva (2-3 bits) que puede degradar la precisión; el autor no ha medido la pérdida frente al checkpoint BF16.
- Los benchmarks presentados son subconjuntos fijos pequeños (50, 25, 20 y 25 preguntas) y de una sola ejecución; no son puntuaciones completas ni estimaciones repetidas.
- La inferencia de imagen no ha sido validada, aunque los pesos de visión estén incluidos.
- Los tensores MTP del modelo original se han excluido, por lo que no se dispone de los pesos de drafting para decodificación especulativa.
- Solo el perfil baseline completó la prueba de 128K; no se reclama que este perfil quepa o funcione correctamente a 128K.
- Las comparaciones de velocidad mezclan modelos, backends y configuraciones de drafting distintos, por lo que no pueden atribuirse únicamente a la precisión de cuantización.
- Los idiomas soportados no están declarados; el rendimiento multilingüe es desconocido.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, no evaluados aquí.
- Licencia MIT permite uso comercial, pero al ser una conversión experimental sin validación completa, su uso en producción conlleva riesgo de calidad.
- Se asignó swap de macOS durante las pruebas, lo que indica presión de memoria en la configuración usada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit-down3
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Variante 2-bit g64: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit
- Variante 2-bit g32: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit-group32
- Referencia comercial citada (Anthropic, Claude Haiku 5.5): https://www.anthropic.com/claude-haiku-5-5
