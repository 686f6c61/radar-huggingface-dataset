# lopatnov/barthelona-asm

## Resumen

`lopatnov/barthelona-asm` es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-7B, publicado por el desarrollador Oleksandr Lopatnov (usuario `lopatnov` en Hugging Face) bajo licencia Apache 2.0. El repositorio contiene únicamente pesos en formato safetensors para la librería `transformers` y su model card reproduce prácticamente en su totalidad la documentación oficial del modelo base Qwen2.5-Coder-7B-Instruct; no se documenta en ella el proceso de ajuste, el conjunto de datos empleado ni los hiperparámetros utilizados.

Se trata por tanto de un modelo derivado de un transformer decoder-only denso de 7.615.616.512 parámetros (6,53 B sin contar embeddings), 28 capas y una ventana de contexto nativa de 131.072 tokens, ampliable mediante YaRN. Hereda del modelo base las capacidades de generación de código, razonamiento sobre código y corrección de errores, además del soporte de contexto largo.

Su relevancia actual es limitada y debe evaluarse con cautela: el repositorio no registra descargas ni "likes" en el momento de la consulta, no incluye resultados de evaluación propios y el sufijo "asm" del nombre sugiere una especialización hacia lenguajes de bajo nivel o ensamblador que la model card no confirma ni detalla en ningún momento. Cualquier uso en producción debería ir precedido de una evaluación empírica del ajuste frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con RoPE, SwiGLU, RMSNorm y sesgo en QKV; 28 capas; GQA con 28 cabezas Q y 4 cabezas KV |
| Parametros totales | 7.615.616.512 (7,61 B); 6,53 B sin embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens segun la model card del modelo base; `config.json` configurado para 32.768 tokens, ampliable a contexto largo con YaRN (factor 4,0, `original_max_position_embeddings`: 32768) |
| Tipos de cuantizacion | el repositorio solo publica safetensors en precision completa (BF16/FP16, ~15,2 GB); no se distribuyen GGUF, GPTQ, AWQ ni variantes INT8/INT4 |
| Idiomas soportados | ingles (unica etiqueta de idioma declarada: `en`) |
| Licencia | Apache 2.0 (enlace de licencia apuntando al modelo base Qwen) |
| Formato de pesos | safetensors, compatible con `transformers`; tamano total del repositorio 15,2 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-Coder-7B: un transformer decoder-only con embeddings rotatorios (RoPE), activación SwiGLU, normalización RMSNorm y sesgo en las proyecciones QKV. Emplea Grouped Query Attention con 28 cabezas de consulta y 4 cabezas de clave/valor, lo que reduce el coste de memoria de la caché KV en inferencia. Consta de 28 capas y suma 7,61 B de parámetros totales, de los cuales 6,53 B son no-embedding.

Según la documentación de la familia Qwen2.5-Coder, el preentrenamiento del modelo base se realizó sobre 5,5 billones de tokens que combinan código fuente, datos de conexión texto-código y datos sintéticos, seguido de una fase de post-entrenamiento (la model card no desglosa si se empleó RLHF, DPO u otras técnicas concretas). El contexto nativo es de 131.072 tokens y la extrapolación más allá de 32.768 se realiza con YaRN, con la advertencia de que vLLM solo soporta YaRN estático, lo que puede degradar el rendimiento en entradas cortas si se activa de forma permanente.

No se dispone de información sobre el ajuste fino que produce `barthelona-asm`: se desconoce el volumen de datos adicionales, su composición, si se empleó instruction tuning supervisado, DPO o cualquier otra técnica, y si el ajuste se orientó a un dominio concreto (el sufijo "asm" no se explica en la documentación). El repositorio GitHub `lopatnov/barthelona` existe pero no aporta detalles técnicos en la información disponible.

## Capacidades

- Generación de código en múltiples lenguajes, heredada del modelo base Qwen2.5-Coder-7B.
- Razonamiento sobre código, corrección de errores (code fixing) y refactorización, capacidades declaradas por la model card del base.
- Razonamiento matemático y competencias generales mantenidas durante el entrenamiento del base, segun su documentacion.
- Procesamiento de contexto largo: hasta 131.072 tokens teoricos, con 32.768 tokens funcionales sin configuracion adicional.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`) con rol de sistema.
- Uso como base para agentes de codigo (mencionado explicitamente en la model card del base).
- Soporte de tool calling / function calling: no documentado para este fine-tune concreto.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible.
- Multilingue: limitado al ingles segun la unica etiqueta de idioma declarada; el comportamiento en castellano no esta documentado ni evaluado.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede generar funciones completas y explicar fragmentos a partir de un prompt conversacional; su tamano de 7,61 B permite desplegarlo en una GPU de 24 GB en FP16, lo que lo hace viable como servicio interno de autocompletado.
- Refactorizacion de modulos extensos: con 32.768 tokens de contexto efectivos (131.072 con YaRN) puede recibir varios ficheros de un mismo paquete y proponer cambios coherentes entre ellos, algo que modelos con ventanas de 4K-8K no permiten.
- Correccion de errores en pipelines de CI: dado un fallo de compilacion o un stack trace, el modelo puede generar un parche candidato; conviene integrarlo como sugerencia y no como aplicacion automatica, dado que no hay evaluacion publicada del fine-tune.
- Generacion de tests unitarios y documentacion tecnica: a partir de una firma de funcion o de un modulo, produce casos de prueba y docstrings; util para elevar cobertura en bases de codigo heredadas.
- Analisis de listados de ensamblador y codigo de bajo nivel: si el ajuste "asm" efectivamente especializa el modelo en este dominio, seria el caso de uso diferencial; debe validarse empiricamente antes de adoptarlo, ya que la model card no lo confirma.
- Revision de codigo automatizada: con contexto largo puede evaluar un diff completo junto con el resto del fichero afectado y emitir comentarios de estilo, seguridad o consistencia en una sola pasada.
- Migracion de código legacy entre lenguajes o versiones de API: la combinacion de razonamiento sobre codigo y ventana de contexto amplia permite traducir modulos completos manteniendo las referencias cruzadas.
- Asistente de documentacion mediante RAG sobre repositorios: indexando el codigo y recuperando fragmentos relevantes, el modelo puede responder preguntas sobre la arquitectura interna de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio `lopatnov/barthelona-asm` no incluye ninguna tabla de evaluacion propia (MMLU, HumanEval, GSM8K, EvalPlus u otras) y se limita a remitir al blog de la familia Qwen2.5-Coder para los resultados del modelo base. Tampoco se aportan mediciones de latencia o throughput del ajuste.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 15,2 GB solo para los pesos, mas la cache KV; con contextos de 32K tokens la cache KV de este modelo (28 capas, 4 cabezas KV) anade varios GB adicionales.
- VRAM estimada en INT8: en torno a 8 GB para los pesos, sin contar cache KV.
- VRAM estimada en INT4: en torno a 4,5-5 GB para los pesos; requiere cuantizacion propia, ya que el repositorio no distribuye versiones GGUF ni GPTQ/AWQ.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G para servicio concurrente con vLLM y contextos largos.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en FP16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) es necesario recurrir a cuantizacion de 8 o 4 bits.
- Despliegue: `transformers` (soporte nativo, requiere version >= 4.37 para evitar el error `KeyError: 'qwen2'`), vLLM (recomendado por la documentacion del modelo base para contexto largo), llama.cpp u Ollama previa conversion a GGUF, y TGI (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada; la documentacion de Qwen publica mediciones de velocidad para el modelo base, no para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `lopatnov/barthelona-asm` | 7,61 B (denso) | 131.072 (32.768 por defecto) | Apache 2.0 | Fine-tune sin evaluacion publica ni descargas |
| Qwen2.5-Coder-7B-Instruct (modelo base) | 7,61 B (denso) | 131.072 | Apache 2.0 | Modelo oficial con documentacion y evaluacion publicadas |
| Qwen2.5-Coder-32B-Instruct | 32 B (denso) | 131.072 | Apache 2.0 | Referencia open source en generacion de codigo segun el autor del base |
| CodeLlama-7B-Instruct | ~6,7 B (denso) | 16.384 | Llama 2 Community License | Alternativa con licencia mas restrictiva para uso comercial |

La comparacion relevante es contra su propio modelo base: al no existir evaluacion del ajuste, no es posible afirmar que `barthelona-asm` mejore a Qwen2.5-Coder-7B-Instruct en ninguna tarea, y existe el riesgo de degradacion por sobreajuste a un dominio no documentado. Los datos de rendimiento de la fila del modelo base son los declarados por su model card; los de las alternativas no se han verificado en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni ejemplos de salida en la model card; el repositorio registra 0 descargas y 0 "likes".
- Proceso de ajuste no documentado: se desconoce el dataset, la tecnica y el objetivo del fine-tune; el sufijo "asm" no se explica, por lo que no puede asumirse una especializacion real en ensamblador.
- Riesgo de olvido catastrofico: al ser un fine-tune sobre un modelo de 7 B sin evaluacion, es plausible una perdida de capacidades generales respecto al base, especialmente en matematicas e instrucciones generales.
- Riesgo de alucinacion: inherente a los modelos de codigo; puede generar APIs inexistentes, imports invalidos o funciones con firmas incorrectas que compilan pero no hacen lo esperado.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior al de modelos con cobertura multilingue explicita.
- Contexto: aunque se anuncian 131.072 tokens, la configuracion por defecto es de 32.768 y la activacion de YaRN estatico en vLLM puede degradar el rendimiento en entradas cortas.
- Licencia: Apache 2.0 permite uso comercial, pero el `license_link` apunta al fichero LICENSE de Qwen; conviene revisar las condiciones del modelo base y citar adecuadamente a los autores originales.
- Trazabilidad: al no existir ficha tecnica propia, la reproducibilidad del ajuste es nula; para produccion se recomienda usar el modelo base oficial o validar este fine-tune con un conjunto de evaluacion propio antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lopatnov/barthelona-asm
- Perfil del autor en Hugging Face: https://huggingface.co/lopatnov
- Repositorio GitHub del proyecto Barthelona: https://github.com/lopatnov/barthelona
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Qwen2.5-Coder Technical Report: https://arxiv.org/abs/2409.12186
- Qwen2 Technical Report: https://arxiv.org/abs/2407.10671
- YaRN (extrapolacion de longitud de contexto): https://arxiv.org/abs/2309.00071
- Chat de Qwen: https://chat.qwenlm.ai/
