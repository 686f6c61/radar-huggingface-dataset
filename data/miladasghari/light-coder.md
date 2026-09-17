# Miladasghari/light-coder

## Resumen

light-coder es un modelo de lenguaje causal especializado en generación de código, desarrollado por Milad Asghari mediante ajuste fino supervisado sobre Qwen/Qwen2.5-0.5B-Instruct. Se trata de un SLM (small language model) de apenas 494.032.768 parámetros (≈494 M) cuyos pesos LoRA se han fusionado directamente en el checkpoint base, por lo que se distribuye como un modelo autónomo de 988 MB en safetensors y no requiere la librería `peft` para inferencia. El entrenamiento se realizó sobre aproximadamente 122.000 pares instrucción-respuesta de programación, con soporte de plantilla conversacional (`apply_chat_template`).

Su relevancia radica en el segmento de los modelos ultraligeros: al ocupar menos de 1 GB, puede ejecutarse en GPUs de consumo, iGPUs e incluso CPU, lo que lo hace atractivo para asistentes de código locales, entornos con requisitos estrictos de privacidad y despliegues *edge* donde no es viable servir un modelo de 7B o superior. La licencia Apache-2.0 elimina restricciones de uso comercial, y el autor declara compatibilidad directa con vLLM, Ollama y los pipelines estándar de Hugging Face, además de figurar con los tags `text-generation-inference` y `endpoints_compatible`.

Ahora bien, el modelo tiene cero descargas y cero *likes* en el momento de redactar esta ficha, no publica benchmarks ni detalla la composición de su dataset de ajuste, y el contexto heredado del modelo base no se explicita en la model card. Es, por tanto, un artefacto interesante por su relación tamaño/funcionalidad, pero sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Qwen2), pesos LoRA fusionados en el checkpoint final |
| Parametros totales | 494.032.768 (≈494 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no declarada en la model card; el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens de contexto nativo, valor presumiblemente heredado pero no verificado en esta ficha |
| Tipos de cuantizacion | no se publican versiones cuantizadas; la model card solo indica uso en `float16` (`dtype=torch.float16`). El autor afirma compatibilidad con Ollama, lo que implica conversión viable a GGUF en formatos estandar (Q8_0, Q4_K_M, etc.) |
| Idiomas soportados | inglés y multiples lenguajes de programacion (tags: `en`, `code`); no se declara castellano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (988 MB; repositorio de 1,0 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tipo de ajuste | Fine-tuning con TRL sobre ~122.000 pares instruccion-respuesta; LoRA fusionado |
| Fecha de creacion (metadatos HF) | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

light-coder es un transformer causal decoder-only que conserva íntegramente la topología del modelo base Qwen2 (normalización RMSNorm con pre-norm, activación SwiGLU, embeddings rotatorios RoPE y atención con query/key/value projections propias de la familia Qwen2). El autor no introduce modificaciones arquitectónicas: el trabajo consiste en un ajuste fino con TRL sobre aproximadamente 122.000 pares de instrucción y respuesta de dominio de programación, tras el cual los adaptadores LoRA se fusionan en los pesos base. El resultado es un checkpoint monolítico que se carga con `AutoModelForCausalLM` sin dependencias adicionales y que mantiene el tokenizador y la plantilla de chat del modelo original.

No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset (proporción de lenguajes de programación, inclusión o no de datos de razonamiento, código de tests, documentación), ni si hubo fases posteriores de alineación tipo DPO, RLHF o RLVR. Tampoco se detallan hiperparámetros como *learning rate*, número de épocas, rango del LoRA o estrategia de empaquetado de secuencias. El ejemplo de inferencia de la model card emplea `temperature=0.3`, `top_p=0.9`, `repetition_penalty=1.05` y `max_new_tokens=256`, valores que sugieren un uso orientado a respuestas cortas y deterministas más que a generación creativa extensa.

## Capacidades

- Generación de código en múltiples lenguajes de programación (el autor indica "Multiple Programming Languages" sin enumerarlos).
- Seguimiento de instrucciones de programación en formato conversacional, con soporte de `apply_chat_template` y roles `user`/`assistant`.
- Refactorización de código y reescritura de fragmentos según instrucciones en lenguaje natural.
- Explicación y descripción de código, presumiblemente orientada a documentación y docstrings.
- Capacidad conversacional multi-turno limitada por el contexto efectivo del modelo base.
- Idioma principal de instrucciones: inglés.
- No se declara soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso explícito, modo *thinking*, visión, audio ni matemáticas avanzadas.
- No se declara soporte explícito de *fill-in-the-middle* (FIM), habitual en modelos de código, aunque el ajuste sobre instrucciones no lo excluye necesariamente.

## Casos de uso

- **Autocompletado y asistencia de código en local**: un IDE o editor puede invocar el modelo en la propia máquina del desarrollador (menos de 1 GB de pesos) para sugerir funciones y fragmentos, sin enviar código propietario a servicios externos.
- **Generación de tests unitarios**: dado un fragmento de código fuente, el modelo puede producir casos de prueba básicos; encaja en flujos donde se quiere un borrador rápido que el desarrollador revisa después.
- **Documentación automática**: generación de docstrings y comentarios a partir de firmas de funciones y cuerpos de código, integrable en hooks de pre-commit para mantener documentación sincronizada.
- **Explicación de código heredado**: incorporar fragmentos de código antiguo y pedir una descripción en inglés de su funcionamiento, útil para incorporación de nuevos miembros a un equipo.
- **Revisión preliminar de *diffs* en CI/CD**: ejecución por lotes sobre parches para señalar posibles errores evidentes o falta de manejo de errores, como filtro previo a la revisión humana, aprovechando el bajo coste de inferencia.
- **Traducción entre lenguajes de programación**: conversión de fragmentos pequeños de un lenguaje a otro (por ejemplo, scripts de Python a JavaScript) en tareas de migración acotadas.
- **Etiquetado y aumento de datos de código**: generación sintética de pares instrucción-respuesta para preentrenar o ajustar modelos mayores, ejecutable en CPU por su tamaño.
- **Tutor de programación sin conexión**: asistente educativo en entornos con conectividad limitada o requisitos de privacidad, desplegado sobre hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de HumanEval, MBPP, MMLU, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no ha devuelto documentación técnica, papers ni publicaciones asociadas al modelo.

## Requisitos de hardware

- **Pesos en memoria**: 988 MB en safetensors a precisión de 16 bits (el repositorio completo ocupa 1,0 GB). En FP32 la estimación ronda los 2 GB; en cuantización de 8 bits, aproximadamente 0,5 GB, y en 4 bits, en torno a 0,25-0,35 GB.
- **VRAM estimada para inferencia**: del orden de 1,5-2 GB en FP16 para contextos cortos, sumando pesos, caché KV y *overhead* del runtime. Con contexto largo, la caché KV crece de forma proporcional al número de tokens y capas.
- **GPU recomendadas**: cualquier GPU con 2-4 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, en los que el cuello de botella será la latencia de lanzamiento de kernels más que la memoria.
- **Ejecución en GPU de consumo**: sí, en la práctica totalidad de GPUs consumer actuales e incluso en iGPUs con memoria compartida.
- **Ejecución en CPU**: viable; con 494 M de parámetros el modelo puede correr en CPU a velocidades utilizables para generación de fragmentos cortos, si bien no se publican cifras de *tokens* por segundo.
- **Opciones de despliegue**: Hugging Face `transformers` (método documentado por el autor, sin necesidad de `peft`), vLLM, Ollama y pipelines estándar (los tags incluyen `text-generation-inference` y `endpoints_compatible`). Para llama.cpp sería necesaria una conversión propia a GGUF, ya que no se distribuyen ficheros GGUF en el repositorio.
- **Latencia y throughput**: no disponibles. No hay mediciones publicadas de *time to first token*, *tokens* por segundo ni comportamiento bajo *batching*.

## Comparativa con modelos similares

Los datos de la columna de light-coder proceden de la model card y de los metadatos de Hugging Face. Los de los modelos comparados provienen de sus respectivas fichas públicas y no se han verificado en esta búsqueda, por lo que deben tomarse como referencia orientativa.

| Modelo | Parametros | Contexto declarado | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| Miladasghari/light-coder | ≈494 M | no declarado (base: 32.768) | Apache-2.0 | Codigo e instrucciones en ingles | safetensors, sin GGUF publicado |
| Qwen/Qwen2.5-0.5B-Instruct (base) | ≈494 M | 32.768 tokens | Apache-2.0 | Proposito general, chat multilingue | safetensors, ampliamente adoptado |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | ≈494 M | 32.768 tokens | Apache-2.0 | Codigo y FIM, con evaluaciones publicadas | safetensors, GGUF y multiples runtimes |
| HuggingFaceTB/SmolLM2-360M-Instruct | ≈360 M | 8.192 tokens | Apache-2.0 | Proposito general, muy ligero | safetensors, GGUF |

La diferencia principal frente al modelo base y frente a Qwen2.5-Coder-0.5B-Instruct no está en el tamaño ni en la arquitectura, sino en el ajuste de dominio y, sobre todo, en la madurez del ecosistema: light-coder carece de benchmarks publicados, de versiones cuantizadas oficiales y de validación por parte de la comunidad, mientras que las alternativas citadas cuentan con evaluaciones y formatos de despliegue listos para producción.

## Limitaciones y advertencias

- **Sin benchmarks publicados**: no hay evidencia cuantitativa de que el ajuste fino mejore al modelo base en tareas de código; podría degradar capacidades generales de chat.
- **Sin validación de la comunidad**: 0 descargas y 0 *likes* en el momento de la consulta. No hay informes independientes de uso, problemas conocidos ni comparaciones de terceros.
- **Dataset opaco**: se mencionan ~122.000 pares instrucción-respuesta, pero no se detalla su procedencia, licencias ni proporción por lenguaje. Existe riesgo de que incluya código con licencias incompatibles o de baja calidad.
- **Riesgo de alucinación de API**: en modelos pequeños de código es habitual la invención de funciones, firmas y librerías inexistentes; el código generado debe compilarse y testearse antes de usarse.
- **Capacidad limitada por el tamaño**: con 494 M de parámetros, el razonamiento multi-paso, la resolución de problemas algorítmicos complejos, las matemáticas y el manejo de bases de código extensas son limitados.
- **Idioma**: la model card declara inglés y lenguajes de programación. No se garantiza un rendimiento aceptable en castellano, ni siquiera en explicaciones de código.
- **Contexto no declarado**: la ventana efectiva no se especifica en la ficha; si se hereda el valor del modelo base, el ajuste fino no ha sido evaluado específicamente con entradas largas.
- **Cuantización no publicada**: no hay GGUF ni AWQ/GPTQ oficiales; cualquier cuantización requeriría conversión y validación propias, con posible pérdida de calidad no medida.
- **Licencia**: Apache-2.0 permite uso comercial y modificación sin restricciones relevantes, pero no exime de cumplir las licencias de los datos de entrenamiento y del código generado.
- **Sesgos**: se heredan los sesgos del modelo base Qwen2.5-0.5B-Instruct, que no han sido evaluados ni mitigados en esta iteración.
- **Sin garantías de seguridad**: no se documenta ningún proceso de alineación de seguridad, filtrado de contenido dañino o evaluación de *red teaming*.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Miladasghari/light-coder
- Modelo base Qwen/Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de TRL (framework de ajuste fino citado en los tags): https://github.com/huggingface/trl
- Búsqueda web: no se han encontrado resultados relevantes sobre el modelo. Las consultas devolvieron únicamente páginas no relacionadas (contenido de un hotel en la Selva Negra alemana), por lo que no se incluye ningún enlace adicional, paper, blog ni demo.
