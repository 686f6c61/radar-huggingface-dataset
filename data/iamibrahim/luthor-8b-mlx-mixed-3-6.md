# IAMIbrahim/luthor-8b-mlx-mixed-3-6

## Resumen

Luthor 8B — MLX mixed-3-6 es una compilación cuantizada del modelo Luthor 8B, un fine-tune de Qwen3-8B de 8.190.735.360 parámetros orientado a pilotar herramientas de terminal y edición de ficheros dentro de un bucle de agente. Lo publica el usuario IAMIbrahim en HuggingFace bajo licencia Apache 2.0 y en formato MLX, es decir, pensado exclusivamente para Apple Silicon. No es un modelo nuevo entrenado desde cero: es una conversión con cuantización mixta de 3 y 6 bits por peso (4,088 bits por peso de media, 3,9 GB en disco) del fine-tune original.

La propuesta técnica es inusual y merece atención: en lugar de una cuantización uniforme de 4 bits, aplica 3 bits a las capas MLP y mantiene 6 bits en las capas consideradas sensibles. El resultado, según las mediciones del autor, es un artefacto más pequeño y más rápido que la build de 4 bits (21,1 frente a 19,2 tokens por segundo), porque la inferencia en Apple Silicon está limitada por el ancho de banda de memoria. Además, documenta explícitamente un intento fallido de bajar a 3,284 bits por peso que degeneraba en repeticiones de tokens.

El propio autor etiqueta el modelo como artefacto de investigación: está entrenado pero no evaluado, y el benchmark de aceptación (ship-gate) no se ha ejecutado. Con cero descargas y cero likes en el momento de redactar esta ficha, debe tratarse como material de experimentación, no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3-8B; build MLX cuantizada de Luthor 8B) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixed 3/6 bits (3 bits en capas MLP, 6 bits en capas sensibles); 4,088 bits por peso |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, cuantizados); biblioteca mlx |
| Modelo base | IAMIbrahim/luthor-8b (fine-tune de Qwen3-8B) |
| Tamaño en disco | 3,9 GB (repositorio completo: 4,2 GB) |
| Velocidad medida | 21,1 tokens/s |
| Memoria pico medida | 4,38 GB |
| Estado | Entrenado, no evaluado (ship-gate benchmark no ejecutado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.200 millones de parámetros, sobre el que se ha aplicado un fine-tune denominado Luthor 8B especializado en uso de herramientas. Esta build concreta no modifica la topología: es una conversión a MLX con cuantización de precisión mixta generada mediante `mlx_lm convert --quant-predicate mixed_3_6`, con predicado de 3 bits para las capas MLP y 6 bits para las capas sensibles. El autor indica que el detalle de datos de entrenamiento, hiperparámetros y limitaciones está en la model card del modelo base.

En cuanto al entrenamiento específico de esta compilación, no hay información más allá de la conversión. La model card del modelo base no se incluye en la información proporcionada, por lo que no se dispone de datos sobre número de tokens, composición del dataset ni si hubo RLHF, DPO u otro tipo de alineación. Lo que sí se documenta con detalle son los resultados de la cuantización: por debajo de aproximadamente 4 bits por peso la conversión post-entrenamiento rompe el modelo (la build `mixed_2_6`, de 3,284 bits por peso, degenera en repetición de tokens), y el autor señala que alcanzar compresión de tipo ternario (~1,58 bits por peso, como hace Bonsai 2) requeriría entrenamiento consciente de la cuantización, no una simple conversión posterior.

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso heredados de Qwen3-8B.
- Uso de herramientas (tool calling / function calling) con un protocolo concreto: el modelo emite `<tool_call>` y espera recibir `<tool_response>` de vuelta.
- Declaración de herramientas mediante un bloque `<tools>` con formato estilo Hermes, tal y como se hizo durante el entrenamiento.
- Ejecución de herramientas de terminal y de edición de ficheros dentro de un bucle de agente (orientación principal del fine-tune).
- Razonamiento multi-paso encadenado a través de llamadas sucesivas a herramientas.
- Generación de código asociada a tareas de reparación y modificación de proyectos.
- Capacidades multilingües: no disponibles; la model card solo declara inglés (`en`).
- Capacidades de visión o audio: no disponibles, no se documentan.

## Casos de uso

- Agentes de terminal en local: el modelo puede recibir un objetivo en lenguaje natural y emitir llamadas a herramientas de shell mediante `<tool_call>`, encadenando comandos de inspección y ejecución. Es adecuado porque se ha afinado específicamente para ese bucle y porque su huella de 4,38 GB permite mantenerlo residente en un portátil Apple Silicon.
- Reparación automática de tests en un repositorio: la model card usa como ejemplo el prompt "The test suite fails with ImportError. What is your first step?"; el modelo puede leer el traceback, inspeccionar el fichero implicado, editarlo y volver a lanzar la suite. Encaja en un bucle de agente con herramientas de lectura/escritura de ficheros.
- Asistente de edición de código offline en un Mac: al ejecutarse con `mlx-lm` no requiere conexión ni envío de código a servicios externos, lo que lo hace útil en entornos con requisitos de confidencialidad. Limitación importante: la ventana de contexto no está documentada, por lo que hay que validarla antes de trabajar con repositorios grandes.
- Automatización de tareas DevOps y SRE desde estación de trabajo: generación y ejecución de comandos de diagnóstico (logs, estado de servicios, ficheros de configuración) en un bucle de agente con confirmación humana. Adecuado por su soporte de function calling, pero requiere sandbox por el riesgo de comandos destructivos.
- Prototipado de pipelines de function calling: sirve para validar rápidamente un esquema de herramientas en formato Hermes y comprobar el comportamiento del modelo emitiendo `<tool_call>` antes de invertir en un modelo mayor.
- Experimento de investigación sobre cuantización en Apple Silicon: el repositorio aporta mediciones reproducibles (bits por peso, tokens por segundo, memoria pico) y documenta el fallo por debajo de 4 bits por peso, lo que lo convierte en un caso de estudio útil para quienes investigan cuantización post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo está entrenado pero no evaluado y que el benchmark de aceptación no se ha ejecutado, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de tareas de uso de herramientas.

Las únicas métricas publicadas son mediciones de rendimiento de inferencia declaradas por el autor, en un Apple M3 con 24 GB de memoria, `mlx-lm` 0.31.3, generación de 150 tokens y `--temp 0.0`:

| Build | Tamaño en disco | Bits por peso | Tokens/s | RAM pico |
|---|---|---|---|---|
| `-mlx-8bit` | 8,1 GB | 8,500 | 10,6 | 8,80 GB |
| `-mlx-6bit` | 6,2 GB | 6,500 | 13,8 | 6,77 GB |
| `-mlx-4bit` | 4,3 GB | 4,500 | 19,2 | 4,79 GB |
| `-mlx-mixed-3-6` (este modelo) | 3,9 GB | 4,088 | 21,1 | 4,38 GB |

El patrón observado por el autor es que las cuantizaciones mayores son más lentas, no más rápidas, porque la inferencia en Apple Silicon está limitada por el ancho de banda de memoria: menos bytes por peso se traduce en más tokens por segundo.

## Requisitos de hardware

- Memoria pico medida: 4,38 GB (Apple M3 de 24 GB, `mlx-lm` 0.31.3, generación de 150 tokens).
- VRAM o memoria unificada estimada: alrededor de 4,5-5,5 GB en total, considerando aproximadamente 4,2 GB de pesos (8,19 mil millones de parámetros a 4,088 bits) más la caché KV y el overhead del runtime. La cifra exacta con contextos largos no está disponible.
- Plataforma: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) a través de MLX. Esta build no se puede ejecutar directamente en CUDA.
- GPU recomendadas en el ecosistema Apple: cualquier chip con 8 GB o más de memoria unificada; el autor midió en un M3 de 24 GB con 4,38 GB de pico. En Macs de 8 GB el margen para contexto es muy reducido.
- GPU NVIDIA/AMD: no soportadas por esta build; sería necesario convertir el modelo base a otro formato (por ejemplo GGUF o safetensors estándar) para usarlo con CUDA.
- Opciones de despliegue: `mlx-lm` (`mlx_lm.generate`, `mlx_lm.server`). No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son utilizables con este repositorio tal cual. vLLM y TGI no soportan MLX.
- Throughput medido: 21,1 tokens/s en la configuración indicada. Latencia hasta el primer token: no disponible.
- Comando de referencia de la model card: `mlx_lm.generate --model IAMIbrahim/luthor-8b-mlx-mixed-3-6 --prompt "..." --max-tokens 512`.

## Comparativa con modelos similares

La comparación más directa es con las otras builds MLX del mismo modelo, todas publicadas por el mismo autor:

| Modelo | Tamaño | Bits por peso | Tokens/s | RAM pico | Licencia |
|---|---|---|---|---|---|
| `luthor-8b-mlx-8bit` | 8,1 GB | 8,500 | 10,6 | 8,80 GB | apache-2.0 |
| `luthor-8b-mlx-6bit` | 6,2 GB | 6,500 | 13,8 | 6,77 GB | apache-2.0 |
| `luthor-8b-mlx-4bit` | 4,3 GB | 4,500 | 19,2 | 4,79 GB | apache-2.0 |
| `luthor-8b-mlx-mixed-3-6` | 3,9 GB | 4,088 | 21,1 | 4,38 GB | apache-2.0 |

Frente al modelo base `IAMIbrahim/luthor-8b`: mismos parámetros (8,19 mil millones) y misma licencia, pero sin cuantizar; no se dispone de sus cifras de tamaño, velocidad ni evaluaciones en la información proporcionada. Frente a Qwen3-8B, del que deriva: no se dispone de datos comparativos de contexto, rendimiento o evaluación en la información proporcionada, y hay que tener en cuenta que este fine-tune declara únicamente inglés mientras que el alcance multilingüe real de la conversión no está documentado.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara explícitamente que el benchmark de aceptación no se ha ejecutado y pide tratarlo como artefacto de investigación. No hay ninguna cifra de calidad.
- Degradación por cuantización: por debajo de aproximadamente 4 bits por peso la conversión post-entrenamiento rompe el modelo. La build `mixed_2_6` (3,284 bits por peso) se descartó porque degenera en repetición de tokens. No se ha verificado la pérdida de calidad de esta build frente a 4 u 8 bits.
- Idioma: solo se declara inglés. El comportamiento en castellano u otros idiomas no está documentado ni validado.
- Contexto: la longitud de ventana no está documentada, lo que impide planificar tareas que requieran repositorios o conversaciones largas sin validación previa.
- Plataforma: atado a MLX y Apple Silicon. No hay pesos GGUF ni soporte para CUDA, vLLM, TGI, llama.cpp u Ollama en este repositorio.
- Protocolo de herramientas rígido: hay que declarar las herramientas exactamente como en el entrenamiento (bloque `<tools>` estilo Hermes) y devolver `<tool_response>`; desviarse del formato puede degradar el comportamiento.
- Riesgo en agentes con acceso a terminal: un modelo de este tipo puede emitir comandos destructivos o ediciones incorrectas de ficheros. Es imprescindible ejecutarlo en sandbox, con límites de permisos y confirmación humana en operaciones de escritura o borrado.
- Alucinación: no hay datos publicados sobre tasas de alucinación; en tareas de agente el riesgo se materializa como llamadas a herramientas inexistentes o rutas de fichero inventadas.
- Sesgos: no disponibles; la model card no incluye ninguna evaluación de sesgos.
- Licencia: apache-2.0 permite uso comercial de esta build, pero conviene verificar la licencia y las condiciones del modelo base `IAMIbrahim/luthor-8b` y de Qwen3-8B, así como de los datos de entrenamiento originales, antes de desplegarlo en producción.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin retroalimentación de terceros que permita validar las mediciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-mixed-3-6
- Modelo base Luthor 8B: https://huggingface.co/IAMIbrahim/luthor-8b
- Build MLX 8 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-8bit
- Build MLX 6 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-6bit
- Build MLX 4 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-4bit
- Artículo de referencia sobre cuantización ternaria (Bonsai 2): https://www.mindstudio.ai/blog/bonsai-2-27b-ternary-quantization
- Repositorio de MLX: no incluido en la información proporcionada
- Paper asociado: no disponible
