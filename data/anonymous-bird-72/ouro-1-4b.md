# anonymous-bird-72/Ouro-1.4B

## Resumen

Ouro-1.4B es un modelo de lenguaje de 1.434.652.673 parametros (1,4 B) construido sobre una arquitectura de transformer decoder-only con pesos compartidos entre pasos recurrentes, lo que la literatura del proyecto denomina Looped Language Model (LoopLM). El modelo aplica 24 capas fisicas de forma iterativa hasta 4 veces sobre el mismo bloque de parametros, de modo que incrementa la profundidad efectiva sin aumentar el numero de pesos. Segun la model card, esta comparte pesos persigue igualar el rendimiento de transformers estandar de 3-4 B con solo 1,4 B de parametros.

El problema que aborda es la eficiencia parametrica y el razonamiento iterativo: en lugar de razonar emitiendo tokens intermedios, el modelo realiza computo recurrente en espacio latente, con un mecanismo de salida temprana (early exit) que permite asignar computo de forma adaptativa segun la dificultad de la peticion. Se entreno sobre 7,7 billones de tokens en cuatro etapas y emplea atencion multi-cabeza con RoPE, SwiGLU y normalizacion Sandwich RMSNorm.

La relevancia actual del modelo es doble: por un lado, explora una via alternativa al escalado clasico en parametros; por otro, su model card lo declara explicitamente apto unicamente para investigacion, no para produccion. La ficha de HuggingFace figura publicada por el usuario `anonymous-bird-72`, mientras que la propia model card y los ejemplos de codigo referencian el repositorio `ByteDance/Ouro-1.4B`, una discrepancia de procedencia que conviene verificar antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con pesos compartidos entre pasos recurrentes (looped language model, LoopLM) |
| Parametros totales | 1.434.652.673 (1,4 B), segun safetensors |
| Parametros activos | no aplica: no es MoE; todos los parametros se reutilizan en cada paso recurrente |
| Longitud de contexto | 4.096 tokens en entrenamiento, extensible a 65.536 tokens |
| Tipos de cuantizacion | no disponible: el repositorio solo contiene pesos safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |
| Capas | 24 |
| Pasos recurrentes | 4 por defecto (`total_ut_steps` configurable en `config.json`) |
| Salida temprana | `early_exit_threshold` configurable, por defecto 1.0 (siempre ejecuta los 4 pasos) |
| Tamano oculto | 2.048 |
| Atencion | Multi-Head Attention (MHA) con RoPE |
| Activacion FFN | SwiGLU |
| Normalizacion | Sandwich RMSNorm |
| Vocabulario | 49.152 tokens |
| Tamano del repositorio | 2,9 GB |
| Fecha de creacion (HuggingFace) | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only en el que un unico bloque de 24 capas se ejecuta de forma recurrente un numero configurable de veces (`total_ut_steps`, 4 por defecto). Al compartir pesos entre iteraciones, la profundidad efectiva del modelo se multiplica sin incrementar el numero de parametros: con 4 pasos, el modelo aplica el equivalente a 96 capas de computo con 24 capas de pesos. La atencion es multi-cabeza con embeddings posicionales rotatorios (RoPE), la FFN usa SwiGLU y la normalizacion es Sandwich RMSNorm. El vocabulario es de 49.152 entradas. La model card menciona un mecanismo de salida temprana controlado por `early_exit_threshold`, pensado para asignar computo de forma adaptativa: valores bajos favorecen una salida mas temprana y 1.0 fuerza a ejecutar todos los pasos. La limitacion documentada es que vLLM no soporta la salida temprana y siempre ejecuta el numero completo de pasos.

El entrenamiento consumio 7,7 billones de tokens distribuidos en cuatro etapas: preentrenamiento con 6 T tokens, annealing de contexto extendido (CT Annealing) con 1,4 T, entrenamiento de contexto largo con 20 B y mid-training con 300 B. La composicion de datos incluye web, codigo, matematicas y documentos de contexto largo. El optimizador es AdamW (beta1 = 0,9, beta2 = 0,95) con un scheduler Warmup-Stable-Decay (WSD). La informacion proporcionada no menciona fases de RLHF, DPO ni preferencias humanas, por lo que no se puede confirmar que se hayan aplicado. Tampoco se detalla el proceso de tokenizacion ni la composicion exacta por idioma.

## Capacidades

- Generacion de texto conversacional: la etiqueta de pipeline es `text-generation` y el modelo incluye la etiqueta `conversational`.
- Razonamiento en espacio latente mediante computo recurrente, sin necesidad de emitir cadenas de pensamiento explicitas en tokens.
- Razonamiento multi-paso con control del numero de iteraciones recurrentes segun el presupuesto de computo disponible.
- Salida temprana adaptativa: permite reducir el coste por peticion en consultas sencillas ajustando `early_exit_threshold`.
- Procesamiento de contexto hasta 65.536 tokens (extension sobre los 4.096 tokens de entrenamiento), segun la model card.
- Capacidades derivadas de la composicion de datos de entrenamiento: codigo y matematicas estan explicitamente incluidos en el dataset.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no documenta idiomas ni evaluaciones por idioma.
- Vision, audio u otras modalidades: no soportadas segun la informacion disponible (el modelo es exclusivamente de texto).

## Casos de uso

- Investigacion en arquitecturas recurrentes: el modelo sirve como banco de pruebas para estudiar el efecto del numero de pasos recurrentes sobre la calidad, modificando `total_ut_steps` entre 3 y 4 y midiendo la degradacion. Es su caso de uso declarado y el unico respaldado explicitamente por el autor.
- Experimentos de eficiencia parametrica: comparar un modelo de 1,4 B con pesos compartidos frente a transformers densos de 3-4 B con el mismo presupuesto de VRAM permite validar la hipotesis de la model card en entornos academicos.
- Analisis de computo adaptativo: ajustando `early_exit_threshold` por debajo de 1.0 se puede estudiar la relacion entre coste de inferencia y calidad de respuesta, util para lineas de investigacion sobre asignacion dinamica de computo.
- Generacion de texto en contexto medio (hasta 4.096 tokens verificados): resumen y reescritura de documentos cortos en entornos de evaluacion, siempre que se acepte la ausencia de garantias de produccion.
- Prototipado de asistentes conversacionales: con `device_map="auto"` y transformers, el modelo cabe en GPUs de consumo, lo que permite iterar rapidamente sobre prompts y plantillas de dialogo antes de migrar a un modelo de produccion.
- Experimentos de contexto largo: la extension declarada hasta 65.536 tokens permite probar tareas de recuperacion de informacion en documentos extensos, aunque la propia model card advierte que solo 4.096 tokens corresponden a entrenamiento base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de rendimiento (`assets/benchmark.png`) y una afirmacion cualitativa segun la cual el modelo iguala el rendimiento de transformers estandar de 3-4 B, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion en los datos proporcionados.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas a partir del numero de parametros y de la configuracion de atencion (24 capas, dimension oculta 2.048, MHA), no datos publicados por el autor.

| Precision | Peso del modelo | VRAM estimada (contexto 4K) | VRAM estimada (contexto 64K) |
|---|---|---|---|
| FP32 | ~5,7 GB | ~7 GB | ~19 GB |
| BF16 / FP16 | ~2,9 GB | ~4 GB | ~16 GB |
| INT8 | ~1,4 GB | ~2,5 GB | ~14 GB |
| INT4 | ~0,7-0,9 GB | ~2 GB | ~13 GB |

- El cache KV para MHA con 24 capas y 2.048 de dimension oculta ocupa aproximadamente 0,19 MB por token en FP16: unos 768 MB a 4K y unos 12 GB a 64K.
- Cabe en GPU de consumo: una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 cubren sobradamente la inferencia en BF16 con contexto de 4K. Para contexto de 64K en BF16 conviene una GPU de 24 GB o superior.
- GPU de datacenter recomendadas para lotes grandes o contexto largo: A100 40/80 GB, H100, L40S.
- Opciones de despliegue: la model card documenta `transformers` con `device_map="auto"` y advierte de que se debe usar `transformers<4.56.0`, recomendando `transformers==4.54.1` o anterior. vLLM es compatible, pero sin soporte de salida temprana (siempre ejecuta todos los pasos). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan disponibles sin conversion previa. TGI no aparece mencionado en la informacion proporcionada.
- Latencia y throughput: no disponibles. Como referencia estructural, al ejecutar 4 pasos recurrentes el coste de computo por token es aproximadamente 4 veces el de una pasada unica sobre 24 capas, salvo que se active la salida temprana (desactivada por defecto, ya que `early_exit_threshold` vale 1.0).

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de sus fichas publicas y pueden variar con el tiempo; los de Ouro-1.4B proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Rendimiento en benchmarks |
|---|---|---|---|---|
| Ouro-1.4B | 1,4 B (24 capas, 4 pasos recurrentes) | 4.096, extensible a 65.536 | Apache-2.0 | no disponible |
| Qwen2.5-1.5B | 1,54 B | 32.768 | Apache-2.0 | no disponible en esta ficha |
| Llama-3.2-1B | 1,24 B | 128.000 | Llama 3.2 Community License | no disponible en esta ficha |
| SmolLM2-1.7B | 1,71 B | 8.192 | Apache-2.0 | no disponible en esta ficha |

La diferencia estructural relevante frente a los tres alternativas es que Ouro-1.4B no aumenta parametros para ganar profundidad, sino que reutiliza el mismo bloque de pesos en cuatro iteraciones. El precio es un mayor coste de computo por token (aproximadamente 4x) y un soporte de contexto nativo mas corto (4K) que el de Qwen2.5-1.5B o Llama-3.2-1B. No se dispone de datos de rendimiento comparables para establecer una jerarquia real.

## Limitaciones y advertencias

- La model card declara explicitamente que el modelo esta destinado unicamente a investigacion y se entrega "tal cual", sin garantias para uso en produccion.
- Aunque la licencia es Apache-2.0, esa advertencia del autor es un caveat operativo relevante: no hay garantia de robustez, soporte ni mantenimiento.
- Discrepancia de procedencia: la ficha de HuggingFace pertenece al usuario `anonymous-bird-72` mientras que la model card y los ejemplos de codigo apuntan a `ByteDance/Ouro-1.4B`. Conviene verificar la autenticidad de los pesos antes de usarlos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion independiente.
- Restriccion de version: se requiere `transformers<4.56.0` y se recomienda `transformers==4.54.1` o anterior; existe un parche de cache KV externo (`ouro-cache-fix`) para resolver la incompatibilidad con versiones posteriores.
- vLLM no soporta la salida temprana, por lo que en ese backend se paga siempre el coste completo de los 4 pasos recurrentes.
- La salida temprana esta desactivada por defecto (`early_exit_threshold = 1.0`), de modo que no hay ahorro de computo a menos que se modifique la configuracion.
- El contexto de entrenamiento es de solo 4.096 tokens; la extension a 65.536 es una capacidad declarada, pero no se aportan evaluaciones que la respalden.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- No se documentan fases de alineacion con preferencias humanas (RLHF, DPO), por lo que cabe esperar un comportamiento menos alineado que el de modelos con pipeline de postentrenamiento conocido.
- Riesgo de alucinacion inherente a cualquier modelo de esta escala, agravado por la ausencia de datos de evaluacion publicados.
- El modelo solo procesa texto: no hay soporte de vision ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-bird-72/Ouro-1.4B
- Repositorio referenciado en la model card: https://huggingface.co/ByteDance/Ouro-1.4B
- Paper: https://huggingface.co/papers/2510.25741 (arXiv:2510.25741, "Scaling Latent Reasoning via Looped Language Models")
- Pagina del proyecto: https://ouro-llm.github.io/
- Parche de cache KV: https://github.com/Antizana/ouro-cache-fix

Nota: los resultados de la busqueda web proporcionados tratan sobre el colectivo de hacktivistas Anonymous y no guardan relacion con el modelo, por lo que no se incluyen como fuentes.
