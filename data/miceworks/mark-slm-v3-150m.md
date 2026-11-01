# miceworks/Mark-SLM-V3-150M

## Resumen

Mark-SLM-V3-150M es un micro-modelo de lenguaje publicado por el usuario miceworks en HuggingFace bajo el identificador `miceworks/Mark-SLM-V3-150M`. Se presenta como la tercera generación de la familia "Mark" de modelos compactos, con una arquitectura `deepseek2` que combina Multi-Head Latent Attention (MLA) y un esquema de mezcla de expertos (MoE) con 16 expertos enrutados y 1 compartido. El modelo declara 165,35 millones de parámetros físicos y 72,45 millones activos por token, con una ventana de contexto de 8192 tokens y un vocabulario de 32032 entradas.

El dato más relevante para cualquier evaluador es que, según la propia model card, el modelo se encuentra en estado **"Architectural Base / Untrained"**: los pesos son una inicialización He/Xavier con fusión de Hadamard, no el resultado de un preentrenamiento. Es decir, no es un modelo utilizable para inferencia de calidad, sino un esqueleto arquitectónico listo para preentrenamiento o ajuste fino. Esta distinción es crítica y condiciona por completo el resto de la ficha.

La distribución se realiza exclusivamente en formato GGUF cuantizado en `IQ4_NL` (4 bits no lineal), con un fichero de 88,94 MB, lo que lo sitúa en el rango de modelos desplegables en cualquier hardware, incluidos dispositivos de gama baja. No se han publicado resultados de benchmarks, idiomas soportados ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer con MLA y MoE) |
| Parametros totales | 165.349.680 (165,35 M) |
| Parametros activos | 72.452.400 (72,45 M) por token |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | `IQ4_NL` (4 bits no lineal, normas y bias en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`mark_slm_v3_150m_iq4_nl.gguf`, 88,94 MB) |
| Dimension oculta (`dim`) | 576 |
| Capas del transformer | 15 |
| Cabezas de atencion (query) | 9 |
| MLA `q_lora_rank` / `kv_lora_rank` | 256 / 128 |
| Expertos MoE enrutados / compartidos | 16 / 1 |
| Expertos activos por token | 2 |
| Tamano intermedio MoE | 256 |
| Tamano de vocabulario | 32032 |
| Tensores totales | 273 (197 IQ4_NL, 76 FP32) |
| Estado de entrenamiento | Base arquitectonica sin entrenar (inicializacion He/Xavier + Hadamard) |
| Checksum SHA-256 | `c10b0cb0e1bdb22c9178da7211fc47cbf485f54f29bf06bcd0c0ec23a535b6c6` |

## Arquitectura y entrenamiento

La arquitectura sigue el linaje `deepseek2`, caracterizado por Multi-Head Latent Attention (MLA) con compresion de las proyecciones de query y key-value mediante rangos latentes bajos (`q_lora_rank=256`, `kv_lora_rank=128`). El modelo tiene 15 capas, dimensión oculta 576 y 9 cabezas de atención. La capa de mezcla de expertos emplea 16 expertos enrutados más 1 compartido, con 2 expertos activos por token y un tamaño intermedio de 256 por experto, lo que explica la diferencia entre los 165,35 M de parámetros físicos y los 72,45 M activos.

El autor menciona "Hadamard-fused projections" como innovación técnica en la inicialización de pesos, combinada con inicialización He/Xavier. Sin embargo, **no se ha realizado ningún entrenamiento**: la model card indica explícitamente "Untrained / Weight Initialization". No hay datos sobre número de tokens, composición del dataset, RLHF, DPO ni ninguna otra fase de alineación. Tampoco se documenta decodificación especulativa ni otras optimizaciones de inferencia más allá de la cuantización IQ4_NL.

## Capacidades

- **Generación de texto**: no disponible en la práctica; los pesos no han sido entrenados, por lo que la salida será incoherente.
- **Razonamiento, código y matemáticas**: no disponible por la misma razón.
- **Tool calling / function calling**: no documentado.
- **Soporte de agentes y razonamiento multi-paso**: no documentado.
- **Capacidades multilingües**: no disponible; no se declara ningún idioma.
- **Thinking mode**: la plantilla de Ollama incluida en la model card abre un bloque `<think>`, lo que sugiere una convención de formato tipo DeepSeek-R1, pero al no haber entrenamiento no hay comportamiento aprendido asociado.
- **Visión / audio**: no soportado.

## Casos de uso

Dado el estado "untrained" del modelo, los casos de uso realistas son de investigación y desarrollo de arquitecturas, no de inferencia productiva:

- **Preentrenamiento desde cero a pequeña escala**: el modelo sirve como inicialización para experimentos de preentrenamiento con presupuesto reducido, gracias a sus 165 M de parámetros y ventana de 8192 tokens.
- **Ajuste fino supervisado (SFT) sobre tareas acotadas**: partir de esta base para entrenar un micro-modelo especializado en una tarea concreta (clasificación de texto, generación de plantillas, extracción de entidades) con un dataset pequeño.
- **Investigación sobre MoE de bajo rango**: la combinación de 16 expertos con tamaño intermedio 256 y 2 activos por token permite estudiar dinámicas de enrutamiento y balanceo de carga en hardware modesto.
- **Estudio de MLA con rangos latentes bajos**: útil para analizar el compromiso entre compresión de KV cache y calidad en arquitecturas DeepSeek2 a escala pequeña.
- **Banco de pruebas de cuantización IQ4_NL**: el fichero GGUF de 88,94 MB permite validar pipelines de cuantización no lineal y comparar con otras variantes (Q4_K_M, Q5_K_M) sobre la misma arquitectura.
- **Despliegue en dispositivos embebidos tras entrenamiento**: si se entrena y ajusta, el tamaño y la ventana de contexto lo hacen candidato para asistentes locales en Raspberry Pi, routers o móviles vía llama.cpp u Ollama.
- **Docencia y reproducción de arquitecturas**: útil en cursos o talleres donde se quiera mostrar paso a paso cómo se construye y entrena un transformer MoE con MLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo sin entrenar, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en la cuantización IQ4_NL distribuida (88,94 MB de pesos + overhead de contexto). Con contexto completo de 8192 tokens, el consumo adicional de KV cache es reducido gracias a MLA (`kv_lora_rank=128`).
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM. Funciona en GTX 1050, RTX 3050, RTX 4090, A100, H100 sin problema; el cuello de botella no es la memoria.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPU pura.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama (con Modelfile incluido en la model card), llama-cpp-python. No se documenta soporte para vLLM ni TGI.
- **Latencia y throughput**: no disponibles. En CPU con 8 hilos y un modelo de este tamaño, la generación debería ser muy rápida (cientos de tokens por segundo), pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Formato |
|---|---|---|---|---|---|
| Mark-SLM-V3-150M | 165 M (72 M activos) | 8192 | no disponible | Sin entrenar | GGUF IQ4_NL |
| SmolLM2-135M (HuggingFace) | 135 M | 8192 | Apache 2.0 | Entrenado | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32768 | Apache 2.0 | Entrenado | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Entrenado | safetensors, GGUF |

La comparación directa es difícil porque Mark-SLM-V3-150M no está entrenado. Frente a SmolLM2-135M o Qwen2.5-0.5B, que son modelos listos para uso, Mark-SLM-V3-150M solo es comparable en términos arquitectónicos (MoE con MLA), no de capacidades. Su ventaja potencial es el tamaño reducido del fichero GGUF y la ventana de 8192 tokens, pero carece de licencia declarada y de pesos entrenados.

## Limitaciones y advertencias

- **Modelo sin entrenar**: los pesos son una inicialización aleatoria; la salida no tendrá coherencia lingüística. No debe usarse en producción sin un preentrenamiento o ajuste fino previo.
- **Licencia no disponible**: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Contactar con el autor antes de cualquier uso.
- **Idiomas no declarados**: no hay información sobre el vocabulario ni la cobertura lingüística más allá del tamaño (32032 tokens).
- **Riesgo de alucinación**: irrelevante en el estado actual, pero será alto tras un entrenamiento ligero con datasets pequeños.
- **Sin benchmarks ni validación**: no hay evidencia empírica de calidad, seguridad ni sesgos.
- **Soporte limitado**: solo GGUF cuantizado en IQ4_NL; no se distribuyen pesos en safetensors ni otras cuantizaciones.
- **Metadatos incompletos**: pipeline no disponible, sin demo, sin paper asociado, con 0 descargas y 0 likes en el momento de la consulta.
- **Convención de plantilla tipo DeepSeek**: el Modelfile asume tokens `<|im_start|>` y `<think>`, pero al no haber entrenamiento no hay garantía de que el modelo los genere correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miceworks/Mark-SLM-V3-150M
- Repositorio de llama.cpp (despliegue): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue): https://ollama.com
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Especificación de cuantización IQ4_NL en ggml: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md
- Paper de DeepSeek-V2 (arquitectura MLA y MoE de referencia): https://arxiv.org/abs/2405.04434
