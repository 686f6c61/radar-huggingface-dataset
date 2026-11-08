# araysuter/Ornith-1.5-122B-MLX-mixed-2bit-group32

## Resumen

Ornith-1.5-122B-MLX-mixed-2bit-group32 es una conversión cuantizada del modelo multimodal Ornith-1.5-122B, desarrollada por el usuario araysuter y publicada en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresión agresiva del checkpoint BF16 original de ornith-ai, orientada a la inferencia en Apple Silicon mediante el framework MLX. El resultado es un checkpoint de 122.562.817.776 parámetros (122,56 mil millones) que ocupa 47,87 GB en disco, lo que permite ejecutar un modelo de esta escala en hardware de consumo con memoria unificada.

La relevancia de esta ficha radica en que demuestra la viabilidad práctica de cuantizar un modelo MoE multimodal de gran tamano a 2 bits en sus proyecciones de expertos, manteniendo el resto de componentes a 4 y 8 bits. El autor documenta un proceso de validación con carga estricta de los 2.440 tensores, lo que aporta trazabilidad sobre la integridad del checkpoint. Sin embargo, se trata de un experimento, no de un modelo oficial ni de una versión validada para producción.

La arquitectura subyacente es de tipo transformer con mezcla de expertos (MoE), según el tag `qwen3_5_moe`, y el pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada de imagen y texto. La licencia es MIT, lo que facilita su uso comercial, aunque las limitaciones técnicas del proceso de cuantización deben tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun tag `qwen3_5_moe` |
| Parametros totales | 122.562.817.776 (122,56 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor menciona pruebas a 128K, pero no se confirma como contexto máximo oficial) |
| Tipos de cuantizacion | Mixta: 2 bits afines con group size 32 en proyecciones de expertos enrutados; 4 bits con group size 64 en otras proyecciones cuantizadas; 8 bits con group size 64 en routers y compuertas de expertos compartidos; tensores no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), tamano del repo 47,9 GB; payload de pesos 47.868.985.824 bytes (47,87 GB / 44,58 GiB) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B emplea una arquitectura transformer con mezcla de expertos, tal como indica el tag `qwen3_5_moe`. Esta ficha describe la conversión cuantizada, no el entrenamiento original: el autor partió del checkpoint BF16 en la revisión `dfa07bab90e90746ffbfc0b0cba3126eb9265de2` y aplicó una estrategia de precisión mixta. Las proyecciones de los expertos enrutados se cuantizaron a 2 bits afines con group size 32, mientras que otras proyecciones cuantizadas usan 4 bits con group size 64, y los routers y compuertas de expertos compartidos se mantienen a 8 bits con group size 64. Los tensores no cuantizados permanecen en BF16 tras las transformaciones del cargador.

Una decisión técnica destacable es la exclusión de los tensores MTP (multi-token prediction) del modelo fuente, por lo que este checkpoint no incluye los pesos de drafting originales. Esto implica que no se puede aprovechar la decodificación especulativa nativa del modelo base. Además, se incluyen los pesos de visión y los assets del procesador, aunque el autor advierte que la inferencia con imágenes no ha sido validada en este experimento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional: el pipeline `image-text-to-text` y la plantilla de chat indican soporte para diálogo multi-turno.
- Procesamiento de imagen y texto: incluye pesos de visión y assets del procesador, aunque la inferencia visual no está validada según el autor.
- Razonamiento y matemáticas: las pruebas del autor incluyen GSM8K y ARC, con resultados que sugieren capacidad de razonamiento aritmético y de sentido común.
- Generación de código: se evaluó con HumanEval adaptado a chat y pruebas unitarias en sandbox, con resultados positivos en la muestra.
- Seguimiento de instrucciones: se evaluó con IFEval en modo estricto, lo que indica cierta capacidad de adherencia a formatos y restricciones.
- Modo thinking: las pruebas se realizaron con `thinking disabled`, lo que sugiere que el modelo base dispone de un modo de razonamiento explícito, aunque no se detalla su funcionamiento.
- Tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está diseñado para MLX y cabe en equipos con memoria unificada de 64 GB o superior, lo que permite ejecutar un modelo de 122 B en un Mac Studio o MacBook Pro de gama alta sin GPU dedicada.
- Prototipado de asistentes conversacionales: gracias a la plantilla de chat y al pipeline image-text-to-text, se puede desplegar un asistente multi-turno con `mlx-vlm` para pruebas de concepto en local.
- Evaluación de cuantización agresiva: investigadores que estudien el impacto de 2 bits en modelos MoE pueden usar este checkpoint como referencia comparativa frente a las variantes de 2 bits g64 y 2 bits con down projections de 3 bits.
- Generación de código en entornos con recursos limitados: los resultados en HumanEval (16/20 en la muestra) sugieren utilidad para autocompletado y generación de fragmentos, aunque no para producción crítica sin validación adicional.
- Procesamiento de documentos con imagen y texto: si se valida la inferencia visual, el modelo podría emplearse para extracción de información de capturas o diagramas, aunque el autor no ha confirmado esta capacidad.
- Experimentación con contexto largo: el autor probó 128K tokens con el perfil baseline, lo que indica que el modelo base soporta ventanas extensas; este checkpoint podría usarse para resumen de documentos largos, aunque el rendimiento a 128K no está validado para esta variante.

## Benchmarks y rendimiento

Los datos disponibles provienen de una suite fija de 120 preguntas del autor, no de benchmarks completos. Se presentan a continuación:

| Modelo | Peso GB | ARC (50) | GSM8K (25) | HumanEval (20) | IFEval strict (25) |
|---|---:|---:|---:|---:|---:|
| Ornith · 2-bit g64 | 40,62 | 47/50 (94%) | 24/25 (96%) | 17/20 (85%) | 16/25 (64%) |
| Ornith · 2-bit + 3-bit down | 45,45 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 21/25 (84%) |
| Ornith · 2-bit g32 (este modelo) | 47,87 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 18/25 (72%) |
| Swift-1.5 · 4-bit + DFlash2 | 15,83 | 47/50 (94%) | 25/25 (100%) | 20/20 (100%) | 19/25 (76%) |

El autor advierte que estas muestras pequeñas no establecen puntuaciones completas de benchmark y que no dispone de una ejecución del modelo base en BF16 para medir la pérdida de calidad relativa. En rendimiento de inferencia, este perfil tardó 30,12 segundos hasta el primer texto visible con 20K tokens de entrada y generó aproximadamente 62,2 tokens/s después, en un único intento sin caché y con un solo usuario. El baseline de Ornith tardó 17,64 segundos y generó 66,8 tokens/s; Swift tardó 21,81 segundos y generó 121,0 tokens/s. Solo el baseline completó la prueba de 128K, con 282,54 segundos hasta el primer texto y 49,95 GB de asignación pico de MLX.

## Requisitos de hardware

- VRAM/memoria unificada: el payload de pesos es de 47,87 GB, por lo que se necesita al menos 48 GB de memoria disponible para cargar el modelo; con overhead de MLX y contexto, se recomienda 64 GB o más.
- GPU recomendadas: el checkpoint está diseñado para Apple Silicon con MLX; no se ha validado en GPU NVIDIA. Para Apple, se requieren chips M-series con memoria unificada de 64 GB o superior (M1/M2/M3/M4 Max o Ultra).
- Cabe en GPU de consumo: no en el sentido tradicional de VRAM dedicada; en Apple Silicon, sí en configuraciones de 64 GB o más. No se ha validado en RTX 4090 (24 GB) ni en A100/H100 con este formato MLX.
- Opciones de despliegue: MLX con `mlx-vlm` (versión validada 0.7.9) y `mlx-lm` 0.32.0 sobre `mlx` 0.32.4. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: 30,12 s hasta el primer token visible con 20K tokens de entrada y 62,2 tokens/s de generación en un único intento; el autor señala que se asignó swap de macOS durante las pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Peso | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Ornith-1.5-122B-MLX-mixed-2bit-group32 | 122,56 B | no disponible | 47,87 GB | MIT | Hugging Face (MLX) |
| Ornith-1.5-122B-MLX-mixed-2bit | 122,56 B (base) | no disponible | 40,62 GB | MIT | Hugging Face (MLX) |
| Ornith-1.5-122B-MLX-mixed-2bit-down3 | 122,56 B (base) | no disponible | 45,45 GB | MIT | Hugging Face (MLX) |
| Swift-1.5 · 4-bit + DFlash2 | no disponible | no disponible | 15,83 GB (+3,85 GB drafter) | no disponible | Referenciado en la model card |

Las tres variantes de Ornith comparten el mismo modelo base y licencia, y difieren en la estrategia de cuantización y en el tamano resultante. Swift-1.5 se incluye como referencia de rendimiento del autor, pero no se dispone de sus especificaciones completas ni de su licencia en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits en los expertos enrutados puede degradar la precisión; el autor indica que no dispone de una ejecución en BF16 para cuantificar la pérdida real.
- Los resultados de benchmarks provienen de subconjuntos pequeños (50, 25 y 20 preguntas) y de un único intento, por lo que no son representativos de las puntuaciones completas.
- La inferencia con imágenes no ha sido validada, a pesar de que se incluyen los pesos de visión y el procesador.
- No se incluyen los tensores MTP del modelo original, por lo que no se puede usar la decodificación especulativa nativa.
- El contexto máximo no está confirmado; las pruebas a 128K solo se completaron con el perfil baseline y con fallo en la verificación de salida exacta.
- El checkpoint está pensado para MLX en Apple Silicon; no hay validación en CUDA, vLLM, llama.cpp ni otras plataformas.
- No se especifican los idiomas soportados ni sesgos conocidos del modelo base.
- Aunque la licencia es MIT, el uso comercial debe considerar que se trata de una conversión experimental no oficial y sin garantías del autor original.
- Durante las pruebas se asignó swap de macOS, lo que sugiere que el modelo puede exceder la memoria física disponible en configuraciones ajustadas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit-group32
- Variante 2-bit g64: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit
- Variante 2-bit con down projections de 3 bits: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit-down3
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Referencia comercial citada por el autor (Anthropic Claude Haiku 5.5): https://www.anthropic.com/claude-haiku-5-5
