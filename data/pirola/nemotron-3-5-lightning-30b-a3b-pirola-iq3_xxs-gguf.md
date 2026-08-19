# pirola/Nemotron-3.5-Lightning-30B-A3B-pirola-IQ3_XXS-GGUF

## Resumen

El modelo `pirola/Nemotron-3.5-Lightning-30B-A3B-pirola-IQ3_XXS-GGUF` es una cuantización GGUF del modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, producida por el usuario pirola. Su propósito principal es permitir ejecutar el modelo completo, con su ventana de contexto de 262.144 tokens, en una GPU de consumo con 16 GB de VRAM. Para lograrlo, el autor aplica una técnica de *padding* de ejes de reducción en los tensores de los expertos MoE, que hace posible usar cuantización de bloque 256 (IQ3_XXS) de forma genuina, algo que las cuantizaciones estándar de este modelo no consiguen debido a que las anchuras de los expertos (1856, 2688, 3712) no son divisibles por 256.

El modelo resultante ocupa 14,33 GiB y, según mediciones del autor en una RTX 5080, consume 14.784 MiB de VRAM con el contexto completo cargado, manteniendo 1.100 MiB libres. La arquitectura subyacente es un MoE híbrido con capas intercaladas de Mamba-2 y atención selectiva, desarrollado por NVIDIA. Esta cuantización está pensada para uso local con llama.cpp, pero requiere un parche específico y una versión reciente del motor que incluya soporte Dflash para Nemotron 3.5. No se han publicado benchmarks de calidad sobre esta versión cuantizada, por lo que su rendimiento real en tareas de razonamiento o código aún no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con capas intercaladas de Mamba-2 y atención selectiva (modelo base NVIDIA) |
| Parametros totales | 36.905.981.504 (36,9 B) |
| Parametros activos | 3 B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ3_XXS para expertos del tronco, Q5_0 para expertos del MTP head, Q8_0/Q6_K/F32/BF16 para el resto |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-open-model-license (licencia de modelo abierto de NVIDIA) |
| Formato de pesos | GGUF (safetensors del modelo base disponible aparte) |

## Arquitectura y entrenamiento

El modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` emplea una arquitectura híbrida Mixture-of-Experts que intercala capas Mamba-2 con capas MoE y algunas capas de atención selectiva. El modelo tiene 53 bloques declarados (block_count = 53), de los cuales el bloque 52 es un head de predicción multi-token (MTP) con sus propios 128 expertos. La activación de los expertos es `relu²`, lo que resulta clave para la técnica de padding aplicada en esta cuantización: al añadir filas de ceros en los ejes de reducción, la contribución de esas filas es exactamente cero, por lo que el padding no altera el resultado numérico. Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La cuantización GGUF se generó con `llama-quantize` sobre el modelo base, aplicando un parche que lee las anchuras padded desde una clave del GGUF y ajusta los tensores `ffn_up_exps`, `ffn_down_exps` y el experto compartido.

## Capacidades

- Generación de texto con ventana de contexto de 262.144 tokens, permitiendo procesar documentos muy largos o conversaciones extensas en una sola pasada.
- Soporte de *tool calling* y *function calling* según las recomendaciones de NVIDIA (temperatura 0.6, top-p 0.95).
- Modo de razonamiento (*thinking*) activado por defecto, desactivable por petición mediante `chat_template_kwargs` con `enable_thinking: false`.
- Decodificación especulativa mediante el head MTP (multi-token prediction) disponible con `--spec-type draft-mtp`, aunque no ha sido probada en esta build.
- Multilingüe: inglés, español, francés, alemán, japonés e italiano.
- Capacidad de ejecución local en GPU de consumo gracias a la cuantización IQ3_XXS y el padding de expertos.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede resumir, extraer información o responder preguntas sobre libros completos, expedientes legales o informes técnicos extensos sin necesidad de dividirlos en fragmentos.
- Asistente de programación local: al soportar *tool calling* y ejecutarse en una GPU de 16 GB, puede integrarse en entornos de desarrollo para autocompletar, revisar código o generar tests dentro de un IDE, sin depender de servicios en la nube.
- Atención al cliente automatizada: su capacidad multilingüe (es, en, fr, de, ja, it) y su ventana de contexto amplia permiten gestionar conversaciones multi-turno con historial completo, manteniendo coherencia a lo largo de sesiones largas.
- Razonamiento y análisis con modo *thinking*: activando el modo de razonamiento, puede desglosar problemas complejos de lógica, matemáticas o planificación, útil en entornos educativos o de investigación.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar manuales, guías de API o comentarios de código, aprovechando su contexto largo para considerar todo el proyecto.
- Despliegue de un asistente personal privado: al ser completamente local y no requerir conexión externa, es adecuado para entornos con requisitos estrictos de privacidad, como consultorías o bufetes que manejan datos confidenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MBPP, HumanEval, tareas agenticas) para esta cuantización en la información disponible. El autor indica explícitamente que no se han ejecutado pruebas de calidad sobre esta build. Las únicas métricas medidas son de rendimiento de inferencia en una RTX 5080 16 GB:

| Metrica | Valor |
|---|---|
| Prefill a 250k tokens | 3.819 t/s |
| Decode a 250k de profundidad | 78,8 t/s |
| VRAM tras cargar contexto 262.144 (q4_0 KV) | 14.784 MiB |
| VRAM con prompt completo de 250k | 14.878 MiB (1.100 MiB libres) |
| Prueba de generacion | 3/3 pasan |

## Requisitos de hardware

- VRAM estimada: 14,8 GiB con contexto completo de 262.144 tokens y KV cache en q4_0. Con contextos más cortos, la VRAM requerida será menor.
- GPU recomendada: cualquier GPU NVIDIA con 16 GB de VRAM y arquitectura sm_120 (RTX 5080) o superior. El autor probó en RTX 5080 con CUDA 13.0. También podría ejecutarse en GPUs con 12 GB si se reduce el contexto, aunque no hay datos verificados.
- No cabe en GPUs de 8 GB; se requiere al menos 16 GB para usar la ventana completa.
- Motor de inferencia: llama.cpp con parche específico (ver enlaces) y soporte Dflash para Nemotron 3.5 (PR #26905, fusionado el 2026-08-11). No es compatible con llama.cpp estándar sin parche.
- Opciones de despliegue: `llama-server` con los parámetros indicados en la model card (`-ngl 99 -np 1 --flash-attn on -c 262144 -ctk q4_0 -ctv q4_0 --jinja`).
- Herramienta de cuantización: `llama-quantize` con el parche de padding; la cuantización se realizó con imatrix (aunque el MTP head no tiene datos de importancia, por lo que se cuantiza a Q5_0).
- Advertencia de toolchain: NVCC 13.2 miscompila los kernels de cuantización i-quant (IQ1_s, IQ2_s, IQ3_s); se debe usar CUDA 13.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 36,9 B totales, 3 B activos | 262.144 | BF16 | nvidia-open-model-license | HuggingFace |
| pirola/Nemotron-3.5-Lightning-30B-A3B-pirola-IQ3_XXS-GGUF | 36,9 B totales, 3 B activos | 262.144 | IQ3_XXS (expertos) + Q5_0 (MTP) | nvidia-open-model-license | HuggingFace |
| unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF (IQ3_XXS UD) | 36,9 B totales, 3 B activos | 262.144 | IQ3_XXS (nominal, pero sin tensores IQ3 reales) | nvidia-open-model-license | HuggingFace |

La diferencia clave con la versión de unsloth es que esta build de pirola aplica padding para que los tensores expertos sean realmente IQ3_XXS, mientras que la versión de unsloth etiquetada como IQ3_XXS contiene en realidad tensores IQ4_NL y Q5_0 debido a la limitación de anchura. Esto se traduce en un archivo más pequeño (14,33 GiB frente a 19,76 GiB) y un uso de VRAM menor para el mismo contexto.

## Limitaciones y advertencias

- Requiere un parche no oficial de llama.cpp; sin él, el archivo no se puede cargar. El parche modifica la lectura de anchuras padded y el dimensionado de los tensores MoE.
- No se han ejecutado benchmarks de calidad sobre esta cuantización; el rendimiento en tareas de razonamiento, código o agentes no está verificado. El autor recomienda tratar los resultados con cautela.
- La cuantización IQ3_XXS es de muy baja precisión (aproximadamente 3,5 bits por peso en los expertos), lo que puede degradar la calidad de salida en comparación con cuantizaciones de mayor bit-width.
- El head MTP (bloque 52) está cuantizado a Q5_0 y no puede reducirse más sin datos de importancia. Aunque no ocupa VRAM en cargas normales, sí ocupa espacio en disco.
- La decodificación especulativa con `--spec-type draft-mtp` no ha sido probada en esta build; puede funcionar o no correctamente.
- El modelo base tiene una licencia NVIDIA de modelo abierto, que permite uso comercial pero con condiciones específicas; es necesario revisar el texto completo de la licencia.
- No se debe intentar podar la capa 52 con `--prune-layers`, ya que el resultado no carga correctamente (error en la longitud de `nemotron_h_moe.feed_forward_length`).
- La herramienta NVCC 13.2 produce kernels incorrectos para cuantizaciones i-quant; se debe usar CUDA 13.0 o inferior.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/pirola/Nemotron-3.5-Lightning-30B-A3B-pirola-IQ3_XXS-GGUF
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio GGUF de ggml-org (versión sin parche): https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp (se requiere el parche mencionado en la model card)
