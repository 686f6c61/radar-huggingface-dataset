# choppedgarlic/MiniMax-M3.1-Flash-abliterated-fit256

## Resumen

MiniMax-M3.1-Flash-abliterated-fit256 es una cuantización GGUF mixta de un modelo de lenguaje de tipo Mixture of Experts (MoE) derivada de MiniMaxAI/MiniMax-M3.1-Flash, publicada por el usuario choppedgarlic. No se trata de un modelo entrenado desde cero, sino de una recuantización de un GGUF previamente "abliterado" (es decir, con las direcciones de rechazo eliminadas del espacio de activaciones) por el usuario operationrange. El resultado es un artefacto de 214,03 GiB que conserva los 426.186.392.064 parámetros totales del modelo base y que, según el autor, "cumplirá con peticiones que el original rechaza".

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización híbrida poco habitual: mezcla Q3_K, NVFP4, Q6_K, Q8_0 y BF16 en un mismo archivo según el rol de cada tensor, con un promedio de 4,31 bits por peso. Por otro, expone las particularidades de ejecución de un MoE de este tamaño en hardware de consumo alto (un Apple M3 Ultra con 256 GB de memoria unificada), incluyendo la dependencia crítica de los tensores de escala por experto para que la inferencia no produzca texto incoherente.

El modelo está pensado para despliegues locales en máquinas con memoria unificada muy grande o en clústeres con GPUs de alta capacidad, y su licencia (MiniMax Community License) incorpora términos no comerciales y un apéndice de usos prohibidos que condicionan seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según los tags del repo; detalles de capas no disponibles |
| Parametros totales | 426.186.392.064 (426,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (contexto medido por el autor en DwarfStar); máximo nativo no disponible |
| Tipos de cuantizacion | GGUF mixto: Q3_K (expertos gate/up enrutados), NVFP4 (expertos down enrutados no abliterados), Q6_K (expertos down abliterados, blk.16–blk.42), Q8_0 (atención Q/K/output, experto compartido, FFN densa inicial), BF16 (atención V, embeddings, output head); promedio 4,31 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (MiniMax Community License, con términos no comerciales y apéndice de usos prohibidos) |
| Formato de pesos | GGUF (archivo único `MiniMax-M3.1-Flash-abliterated-fit256.gguf`, 214,03 GiB; repo total 229,8 GB) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un MoE (tag `moe`) con 426,2 mil millones de parámetros totales, pero no detalla el número de expertos, la dimensión oculta, el número de capas ni los parámetros activos por token. La estructura de tensores que revela la model card sí permite inferir algunos elementos: existen expertos enrutados con proyecciones `gate`, `up` y `down` (`ffn_down_exps`), un experto compartido, una FFN densa inicial ("dense lead FFN"), tensores de router, un "indexer" y tensores de escala por experto. La mención de un "indexer" y de multiplicaciones de escala antes del SwiGLU y antes de la reducción enrutada sugiere un mecanismo de atención o enrutamiento con componentes adicionales, pero no se especifica su función exacta.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineación. Lo que sí está documentado es el proceso de posentrenamiento aplicado por la comunidad: una "abliteración" (eliminación de la dirección de rechazo en las activaciones) realizada por operationrange sobre el modelo original, seguida de una recuantización por parte de choppedgarlic que preserva los tensores editados en Q6_K mientras comprime el resto. La innovación técnica destacable de esta ficha no está en el entrenamiento sino en la receta de cuantización y en la dependencia explícita de los tensores `.scale` por experto: un runtime que los ignore produce "sopa de tokens", como le ocurre a llama.cpp 0.7.0 casero según el autor.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` del repo.
- Razonamiento con modo "thinking" (el autor menciona "Thinking on, sampled" en sus mediciones), lo que implica cadenas de razonamiento internas antes de la respuesta.
- Capacidad de seguir instrucciones potencialmente rechazadas por el modelo original gracias a la abliteración.
- Soporte de decodificación especulativa mediante un drafter denominado DFlash2 en el motor DwarfStar, con una tasa de aceptación medida del 94,9 % en el benchmark de enteros con temperatura 0.
- No hay información disponible sobre tool calling, function calling, uso de agentes, capacidades multimodales (visión, audio) ni cobertura multilingüe.
- El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, pero no se detalla el protocolo.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar qué respuestas cambian al eliminar la dirección de rechazo, comparando directamente contra MiniMax-M3.1-Flash original en el mismo hardware y con el mismo prompt, gracias a que la abliteración está aislada en los tensores Q6_K de `blk.16`–`blk.42`.
- Despliegue local en estaciones de trabajo con memoria unificada grande: un Apple M3 Ultra de 256 GB puede mantener residente el archivo de 214 GiB con contexto de 65.536 tokens, lo que habilita asistentes privados sin conexión para análisis de documentos largos.
- Generación de texto creativo sin filtros editoriales: escritura de ficción, guiones o diálogos donde el modelo original aplicaría rechazos, con la advertencia de que la licencia restringe el uso comercial.
- Evaluación de runtimes de inferencia para MoE cuantizados: el archivo sirve como caso de prueba para verificar que un motor implementa correctamente la multiplicación por los tensores `.scale` por experto antes del SwiGLU y de la reducción enrutada; cualquier motor que omita este paso produce salida incoherente y se detecta de inmediato.
- Benchmarking de decodificación especulativa: con DFlash2 y prompts de enteros predecibles a temperatura 0 se alcanzan 31 tok/s frente a 18,95 tok/s sin drafter, lo que permite medir la eficacia de drafters en modelos MoE de gran tamaño.
- Reproducción de experimentos de cuantización mixta: la receta (Q3_K para gate/up, NVFP4 para down no abliterados, Q6_K para down abliterados, Q8_0 para atención y BF16 para embeddings) es un punto de partida para estudiar el impacto de precisiones mixtas en la calidad de salida de MoE grandes.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de inferencia en un Apple M3 Ultra de 256 GB con el motor DwarfStar y contexto de 65.536 tokens. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Valor |
|---|---|
| Decodificacion sin drafter | 18,95 tok/s |
| Decodificacion con DFlash2 (enteros predecibles, temperatura 0) | 31 tok/s |
| Aceptacion de DFlash2 en ese benchmark | 94,9 % |
| Prefill (7.472 tokens) | 74 tok/s |
| Thinking activado, muestreado | ~20 tok/s |

El autor advierte que el valor de 31 tok/s corresponde al benchmark greedy de enteros y que una respuesta normal con thinking se mantiene cerca de 20 tok/s, porque los turnos muestreados confirman un token cada vez; mantener los borradores argmax durante el thinking a temperatura 1 provocaba repeticiones bloqueadas.

## Requisitos de hardware

- VRAM o memoria unificada: el archivo GGUF pesa 214,03 GiB, por lo que se necesita al menos esa cantidad de memoria más el espacio para el contexto KV y el runtime. En la práctica, un sistema con 256 GB de memoria unificada es el mínimo medido por el autor.
- GPU recomendadas: no hay datos de ejecución en GPUs discretas. Por tamaño, un solo acelerador de 80 GB (A100, H100) no es suficiente; se requeriría un clúster multi-GPU con agregación de al menos 256 GB de VRAM, o bien un sistema Apple Silicon con 256 GB o más de memoria unificada.
- Cabe en consumer GPU: no. Ninguna GPU de consumo actual (RTX 4090 con 24 GB, etc.) puede alojar el archivo completo.
- Opciones de despliegue: el autor ha medido con el motor DwarfStar (rama `minimax-m31-m3ultra` del repositorio ds4). llama.cpp 0.7.0 casero produce salida incoherente por ignorar los tensores de escala por experto. No hay información sobre compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: ver la tabla de benchmarks; 18,95 tok/s de decodificación sin drafter y 74 tok/s de prefill en M3 Ultra de 256 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones completas (parámetros activos, número de expertos, contexto nativo) que permitan una comparación rigurosa con alternativas. La comparación se limita a lo que la información proporcionada permite afirmar.

| Modelo | Parametros totales | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| MiniMax-M3.1-Flash-abliterated-fit256 (este) | 426,2 B | 65.536 medidos | minimax-community (no comercial) | GGUF mixto, 214,03 GiB |
| MiniMaxAI/MiniMax-M3.1-Flash (base) | 426,2 B (según este derivado) | no disponible | minimax-community | no disponible en esta ficha |
| operationrange/MiniMax-M3.1-Flash-abliterated-GGUF (origen) | 426,2 B | no disponible | minimax-community | GGUF con tensores abliterados en Q8_0 |

No se conocen modelos comparables de otros desarrolladores con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax Community License incluye términos no comerciales y un apéndice de usos prohibidos; el uso en producción comercial requiere revisión legal expresa del archivo LICENSE.
- La abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o inseguro que el original bloquearía; no es apto para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fidelidad; al ser un modelo abliterado y recuantizado, la calibración puede diferir de la del original.
- Dependencia crítica del runtime: motores que no apliquen los tensores `.scale` por experto antes del SwiGLU y de la reducción enrutada producen texto incoherente; llama.cpp 0.7.0 casero falla en este archivo según el autor.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés sin evaluación propia.
- Parámetros activos, número de expertos y contexto nativo máximo no disponibles, lo que impide estimar con precisión costes de inferencia por token.
- El tamaño de 214 GiB limita el despliegue a hardware de gama muy alta; no es viable en GPUs de consumo ni en servidores convencionales de 80 GB.
- El autor advierte que mantener borradores argmax durante el thinking a temperatura 1 provocaba repeticiones bloqueadas; los parámetros de decodificación especulativa deben ajustarse con cuidado.
- Repositorio con 1 like y 12.413 descargas en el momento de la consulta; no hay revisión por pares ni validación independiente de las mediciones publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/choppedgarlic/MiniMax-M3.1-Flash-abliterated-fit256
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- GGUF abliterado de origen: https://huggingface.co/operationrange/MiniMax-M3.1-Flash-abliterated-GGUF
- Write-up con la receta de cuantización: https://github.com/jjakemaness/dwarfstar-minimax-m31
- Rama del motor DwarfStar: https://github.com/jjakemaness/ds4/tree/minimax-m31-m3ultra
- Pull request en ds4: https://github.com/antirez/ds4/pull/1320
- Pull request previo (stacked): https://github.com/antirez/ds4/pull/1287
