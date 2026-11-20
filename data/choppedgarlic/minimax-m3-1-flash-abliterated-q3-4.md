# choppedgarlic/MiniMax-M3.1-Flash-abliterated-Q3-4

## Resumen

MiniMax-M3.1-Flash-abliterated-Q3-4 es una cuantización GGUF mixta publicada por el usuario choppedgarlic a partir de la versión abliterada de MiniMax-M3.1-Flash, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado originalmente por MiniMax. El modelo base cuenta con 426.186.392.064 parámetros totales según los datos de safetensors, lo que lo sitúa en la categoría de modelos de escala muy grande, pensados para despliegues en hardware de gama alta o con requisitos de memoria muy elevados.

La particularidad de esta publicación es doble. Por un lado, es una versión "abliterated", es decir, se han eliminado o atenuado las direcciones de activación asociadas a rechazos en el modelo original, de modo que el modelo tiende a cumplir peticiones que el modelo base rechazaría. Por otro, el autor ha construido un GGUF de precisión mixta (Q3_K para los expertos enrutados de gate y up, NVFP4 para los down-experts no modificados, Q6_K para los expertos abliterated y Q8_0/BF16 para atención, embeddings y cabezal de salida), con un promedio de 4,31 bits por peso y un tamaño de archivo de 214,03 GiB.

El interés de esta ficha radica en que documenta un caso práctico de cuantización agresiva de un MoE de gran escala para inferencia en un único equipo con 256 GB de memoria unificada (un M3 Ultra), con métricas de rendimiento medidas por el propio autor. No obstante, conviene subrayar que se trata de una publicación de terceros, no oficial, con licencia comunitaria de MiniMax que incluye términos no comerciales, y con advertencias técnicas relevantes sobre la necesidad de soportar tensores de escala por experto en el runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, según tags del repo (moe); detalles de capas y atención no disponibles |
| Parametros totales | 426.186.392.064 (426,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 65536 tokens (contexto usado en la medición del autor); máximo nativo no disponible |
| Tipos de cuantizacion | GGUF mixta: Q3_K (expertos enrutados gate/up), NVFP4 (down-experts no abliterated), Q6_K (down-experts abliterated, bloques 16–42), Q8_0 (atención Q/K/output, shared expert, FFN densa inicial), BF16 (atención V, embeddings, output head); promedio 4,31 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (términos no comerciales y apéndice de usos prohibidos) |
| Formato de pesos | GGUF (`MiniMax-M3.1-Flash-abliterated-fit256.gguf`, 214,03 GiB) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un MoE (tag `moe` en el repositorio y referencias a "expertos enrutados" y "shared expert" en la descripción de la mezcla de tensores). La descripción del GGUF menciona explícitamente tensores `ffn_down_exps`, `ffn_down_exps` con escala por experto, expertos enrutados de gate y up, un experto compartido y una FFN densa inicial ("dense lead FFN"), lo que es consistente con una arquitectura MoE con capas densas iniciales y enrutamiento por token. No se dispone de datos sobre el número de capas, dimensión oculta, número de expertos, top-k de enrutamiento ni tipo de atención (aunque la presencia de tensores Q/K/V/output sugiere atención estándar o variantes con proyecciones separadas).

En cuanto al entrenamiento, no se han proporcionado datos sobre volumen de tokens, composición del dataset, fases de RLHF/DPO ni innovaciones de entrenamiento. La model card de esta publicación se limita a describir el proceso de recuantización: se parte de `operationrange/MiniMax-M3.1-Flash-abliterated-GGUF` (revisión `ef198a171043c687a768a4179917ab6547672583`), que ya contenía los tensores editados en Q8_0, y se recuantizan a Q3_K, NVFP4 y Q6_K según el tipo de tensor. El autor indica explícitamente que no se ejecutó una nueva abliteración, sino que se reutilizan los tensores ya modificados del repositorio de origen.

Un detalle técnico relevante es la dependencia de los tensores de escala por experto (`.scale`): el runtime DwarfStar multiplica gate y up por esa escala antes del SwiGLU, y down por la escala antes de la reducción enrutada. Un runtime que ignore esas escalas produce salida incoherente ("token soup"); el autor cita explícitamente que llama.cpp 0.7.0 casero falla de este modo con este archivo.

## Capacidades

- Generación de texto conversacional y razonamiento, según el tag `conversational` del repositorio.
- Modo "thinking" (razonamiento extendido): el autor reporta mediciones con "thinking on, sampled" a unos 20 tok/s, lo que confirma soporte de modo de pensamiento en el modelo base.
- Comportamiento "abliterated": el modelo tiende a cumplir peticiones que el modelo original rechazaría, según la propia model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas en el repositorio.
- Capacidades de visión o audio: no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el repositorio está preparado para su uso en infraestructura de endpoints de Hugging Face, aunque no se detalla el mecanismo.

## Casos de uso

- Investigación sobre alineación y robustez de rechazos: la variante abliterated permite estudiar cómo se comporta un MoE de 426 mil millones de parámetros cuando se eliminan direcciones de rechazo, comparando respuestas con el modelo base en tareas sensibles dentro de un entorno controlado y con revisión humana.
- Despliegue en un único nodo de memoria unificada: con 214,03 GiB de pesos y un contexto de 65.536 tokens medido en un M3 Ultra de 256 GB, el modelo es adecuado para prototipos de inferencia local de gran escala sin clúster multi-GPU, siempre que el runtime soporte las escalas por experto.
- Evaluación de runtimes de cuantización mixta: la mezcla Q3_K/NVFP4/Q6_K/Q8_0/BF16 y la dependencia de tensores `.scale` lo convierten en un banco de pruebas útil para validar implementaciones de decodificación especulativa (DFlash2) y de kernels NVFP4 en motores propios.
- Generación de texto con contexto largo en flujos de análisis documental: los 65.536 tokens de contexto medidos permiten procesar informes extensos, contratos o expedientes completos en una sola pasada, con la salvedad de la velocidad de prefill (74 tok/s para 7.472 tokens).
- Experimentación con decodificación especulativa: el autor reporta 31 tok/s con DFlash2 y una tasa de aceptación del 94,9% en un benchmark de enteros con temperatura 0, lo que sirve como referencia para calibrar drafters en modelos MoE de gran tamaño.
- Estudio de degradación por cuantización agresiva: comparar la calidad de este GGUF de 4,31 bits por peso frente al Q8_0 de origen permite cuantificar el impacto de bajar a Q3_K los expertos de gate y up en tareas de razonamiento y generación de código.
- Docencia y divulgación técnica: sirve para ilustrar en un curso o artículo cómo se compone un GGUF mixto, qué papel juegan los tensores de escala por experto y por qué un runtime incorrecto produce salida incoherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de velocidad de inferencia medidas en un Apple M3 Ultra de 256 GB con el motor DwarfStar y contexto de 65.536 tokens:

| Métrica | Valor |
|---|---|
| Decode sin drafter | 18,95 tok/s |
| Decode con DFlash2 (enteros predecibles, temperatura 0) | 31 tok/s |
| Aceptación DFlash2 en benchmark de enteros | 94,9% |
| Prefill (7.472 tokens) | 74 tok/s |
| Thinking activado, muestreado | ~20 tok/s |

El autor advierte que mantener los borradores argmax durante el thinking con temperatura 1 bloqueaba repeticiones, por lo que la cifra de 31 tok/s corresponde únicamente al benchmark greedy de enteros y no a una conversación normal.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo de pesos ocupa 214,03 GiB; se necesita al menos esa cantidad más el espacio para KV cache y overhead del runtime. Con contexto de 65.536 tokens, el autor lo ejecutó en un equipo con 256 GB de memoria unificada.
- GPU recomendadas: no hay datos específicos para GPU discretas en la información proporcionada. Por tamaño, requeriría múltiples aceleradores de gama alta (por ejemplo, varias A100/H100 de 80 GB) o un sistema con memoria unificada grande; el autor solo documenta un M3 Ultra de 256 GB.
- ¿Cabe en GPU consumer? No. Con 214,03 GiB de pesos, no cabe en ninguna GPU consumer actual (RTX 4090 de 24 GB, etc.) ni en configuraciones multi-GPU domésticas habituales.
- Opciones de despliegue: el autor usa el motor DwarfStar (rama `minimax-m31-m3ultra` del repositorio `jjakemaness/ds4`). El autor advierte que llama.cpp 0.7.0 casero produce salida incoherente con este archivo por no aplicar las escalas por experto. No se confirma compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: 18,95 tok/s en decode sin drafter, 31 tok/s con DFlash2 en benchmark greedy, 74 tok/s de prefill con 7.472 tokens y ~20 tok/s en thinking muestreado, todo en M3 Ultra de 256 GB.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización de esta ficha | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-abliterated-Q3-4 (este) | 426,2 mil millones | 65.536 medidos | GGUF mixta, 4,31 bits/peso, 214,03 GiB | minimax-community (no comercial) | Hugging Face, 12.413 descargas |
| MiniMaxAI/MiniMax-M3.1-Flash (base) | no disponible en la información | no disponible | pesos originales (no especificado) | minimax-community | Hugging Face (modelo base oficial) |
| operationrange/MiniMax-M3.1-Flash-abliterated-GGUF (origen) | no disponible en la información | no disponible | Q8_0 en tensores editados, resto según repo | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia no comercial: la licencia minimax-community incluye términos no comerciales y un apéndice de usos prohibidos; el uso en producción comercial requiere revisión legal expresa.
- Modelo abliterated: se ha eliminado el comportamiento de rechazo del modelo original, por lo que puede generar contenido que el modelo base rechazaría. No es adecuado para aplicaciones dirigidas al público sin moderación adicional.
- Riesgo de alucinación: no se han publicado evaluaciones de calidad para esta cuantización; la bajada a Q3_K de los expertos de gate y up puede degradar el razonamiento respecto al Q8_0 de origen, y no hay datos que cuantifiquen esa pérdida.
- Dependencia crítica del runtime: sin soporte de los tensores `.scale` por experto, la salida es incoherente. El autor cita llama.cpp 0.7.0 casero como ejemplo de runtime que falla.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe concreto.
- Sesgos: no se han publicado análisis de sesgos para el modelo base ni para esta variante.
- Requisitos de hardware extremos: 214,03 GiB de pesos y 256 GB de memoria en el caso medido; no es desplegable en hardware de consumo.
- Publicación de terceros: no es una publicación oficial de MiniMax; el mantenimiento, las correcciones y el soporte dependen del autor del repositorio.
- Fecha de creación futura respecto al conocimiento habitual: el repositorio figura creado el 2026-11-03, dato que conviene verificar en la fuente original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/choppedgarlic/MiniMax-M3.1-Flash-abliterated-Q3-4
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- GGUF abliterated de origen: https://huggingface.co/operationrange/MiniMax-M3.1-Flash-abliterated-GGUF
- Write-up del autor (receta de cuantización y notas sobre salida incoherente): https://github.com/jjakemaness/dwarfstar-minimax-m31
- Rama del motor DwarfStar: https://github.com/jjakemaness/ds4/tree/minimax-m31-m3ultra
- Pull request en ds4: https://github.com/antirez/ds4/pull/1320
- Pull request previo (stacked): https://github.com/antirez/ds4/pull/1287
- Licencia: archivo `LICENSE` dentro del repositorio de Hugging Face
