# IsValorum/Clover-35B-A3B-Preview-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

Clover-35B-A3B-Preview APEX-I-NanoPlus-V2.1 es una cuantización GGUF del modelo Diffuspace/Clover-35B-A3B-Preview, realizada por IsValorum como parte de su serie APEX Quantization. El modelo base es un derivado de Qwen3.6-35B-A3B con arquitectura `clover_moe` que incorpora una ruta de block-diffusion, combinando un modelo de mezcla de expertos (MoE) con capas de estado recurrente lineal (DeltaNet) y atención completa dispersa.

Esta variante NanoPlus es la de menor tamaño de la familia publicada: 12,56 GB en disco, con pesos de expertos en clase Q2 y backbone en clase Q4, manteniendo en precisión F32 los tensores sensibles (router, estados SSM, convoluciones 1D y componentes del block-diffusion). El objetivo es ofrecer la huella de memoria más pequeña viable para este modelo sin degradar de forma crítica la fidelidad respecto al BF16 original.

Su relevancia radica en que permite ejecutar localmente un modelo híbrido MoE + SSM + diffusion de 34,66 mil millones de parámetros (con solo ~3B activos según la nomenclatura A3B) en hardware de consumo, siempre que se use el runtime de llama.cpp parcheado, ya que la arquitectura `clover_moe` no está implementada en el llama.cpp oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `clover_moe` (MoE híbrido: 30 capas DeltaNet lineal SSM + 10 capas de atención completa, con ruta de block-diffusion) |
| Parametros totales | 34.661.350.848 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, pero no hay confirmación explícita) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_K, IQ2_S, IQ3_XXS, Q8_0, IQ2_XXS, Q6_K, Q3_K, F32 (2,8983 bits por peso de media en fichero) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de la fuente BF16 del propio autor) |

## Arquitectura y entrenamiento

El modelo base, Diffuspace/Clover-35B-A3B-Preview, es un derivado `clover_moe` de Qwen3.6-35B-A3B al que se añade una ruta de block-diffusion. La arquitectura consta de 40 capas: 30 capas de DeltaNet con puertas (gated DeltaNet), un tipo de SSM lineal recurrente que sustituye la atención en la mayoría del modelo, y 10 capas de atención completa. La capa MoE emplea 256 expertos enrutados con top-8 routing, más un experto compartido.

Sobre el entrenamiento del modelo base no se ha publicado información en la ficha disponible: se desconocen el número de tokens, la composición del dataset y si hubo etapas de RLHF/DPO, aunque la etiqueta "conversational" y la existencia de un único post-training preview sugieren un ajuste de instrucciones previo.

La cuantización APEX-I-NanoPlus-V2.1 es el elemento más documentado. Se ha calculado una matriz de importancia (iMatrix) VAL-1.25M sobre 1,25 millones de tokens, y se ha aplicado una receta de 853 entradas (una por tensor, sin fallbacks) que asigna precisión de forma selectiva: pesos de expertos en IQ2_S/IQ2_XXS/IQ3_XXS (clase Q2-Q3), backbone de atención y SSM en Q4_K, cabeza de salida en Q6_K, embeddings en Q4_K, y en F32 los tensores críticos: logits del router, factores de decay, convoluciones 1D, RMSNorms y los componentes de blindaje del block-diffusion (`ssm_bd_logit_scale`, `ssm_bd_history`, `ssm_conv1d.weight_right`). El resultado es un fichero de 12,56 GB con 2,8983 bits por peso y 0 discrepancias frente a la receta.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como `text-generation` y `conversational`, orientado a diálogo e instrucciones.
- Contexto largo: ventana de 131.072 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Multilingüe: soporte declarado para 13 idiomas, incluido castellano, chino, inglés, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Eficiencia de inferencia: la combinación de capas DeltaNet (SSM lineal) con MoE top-8 de 256 expertos apunta a inferencia más ligera que un denso equivalente, aunque el autor no publica métricas de latencia.
- Ruta de block-diffusion: el modelo incorpora un mecanismo de diffusion por bloques cuya contribución funcional exacta no está descrita en la ficha disponible.
- Tool calling, agentes y capacidades de visión/audio: no disponible; no se mencionan en la información proporcionada.

## Casos de uso

- Chatbot local multilingüe: con 13 idiomas soportados y 131K de contexto, puede alimentar asistentes conversacionales autoalojados que atiendan consultas en castellano y otros idiomas sin depender de APIs externas.
- Resumen y análisis de documentos largos: la ventana de 131.072 tokens permite procesar informes, contratos o bases de código enteros en una sola pasada, algo viable gracias a las capas DeltaNet que reducen el coste de la atención sobre secuencias largas.
- Ejecución en hardware de consumo: con 12,56 GB de fichero, cabe en GPUs con 16 GB de VRAM (RTX 4080/4090, RX 7900 XT vía Vulkan) o incluso en máquinas solo CPU con 16-32 GB de RAM, gracias a los ~3B de parámetros activos estimados.
- Experimentación con arquitecturas híbridas: investigadores interesados en MoE + SSM lineal + block-diffusion pueden probar este diseño emergente localmente sin necesidad de clústeres.
- Prototipado de aplicaciones de IA con licencia permisiva: la licencia Apache 2.0 permite integrar el modelo en productos comerciales sin restricciones de uso.
- Inferencia por lotes en servidores modestos: la baja huella de memoria permite servir múltiples instancias o mayor batch en una misma GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que las métricas empíricas de perplexity y fidelidad (BF16, MiniPlus y NanoPlus) están "pending", reservadas para un pipeline automático aún no ejecutado. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de cualquier otro benchmark estándar para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ocupa 12,56 GB (11,70 GiB); con el KV cache y sobrecoste de runtime, se recomienda una GPU con 16 GB de VRAM para ejecución completa en GPU.
- GPUs recomendadas: NVIDIA con soporte CUDA 12/12.8 (RTX 3090, RTX 4090, o profesionales tipo A100/H100); para AMD e Intel, el paquete Windows universal incluye builds Vulkan.
- Consumer GPUs: cabe en una RTX 4080/4090 (16-24 GB) en modo GPU completo; en GPUs de 12 GB sería necesario offload parcial a CPU. En CPU pura, cualquier máquina x86-64 con al menos 16 GB de RAM puede ejecutarlo (builds CPU disponibles), aunque con latencia notablemente mayor.
- Runtime obligatorio: no funciona en vanilla llama.cpp. Es imprescindible usar los builds precompilados de IsValorum/llama.cpp-clover-moe (Linux x86_64 CPU y CUDA 12, Windows universal con CUDA 12.8/Vulkan/CPU) o compilar desde la rama parcheada (PR #31306, commit `4838ffb0c8ade92f34d9157deea38d92758ab824`).
- Otras opciones de despliegue: no disponible; no hay soporte confirmado para vLLM, TGI, Ollama o MLX.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Clover-35B-A3B-Preview (NanoPlus GGUF) | 34,66B (MoE, ~3B activos estimados) | 131.072 | Apache 2.0 | GGUF, requiere llama.cpp parcheado |
| Qwen3-30B-A3B (referencia de la familia Qwen A3B) | 30,5B MoE, 3,3B activos | 32.768 (131.072 con YaRN) | Apache 2.0 | Amplio soporte nativo en llama.cpp, vLLM, Ollama |
| Qwen3-32B (denso comparable) | 32,8B densos | 32.768 (131.072 con YaRN) | Apache 2.0 | Amplio soporte en todos los runtimes |

Notas comparativas: Clover hereda la nomenclatura de Qwen3.6-35B-A3B pero añade DeltaNet y block-diffusion, lo que le da una ventana de contexto nativa de 131K sin trucos y un posible ahorro de cómputo en secuencias largas; a cambio, su ecosistema de despliegue es mucho más limitado, ya que exige un runtime específico. No hay benchmarks publicados que permitan comparar rendimiento en tareas estándar.

## Limitaciones y advertencias

- Runtime incompatible: el GGUF no carga en vanilla llama.cpp; usar sin el build parcheado producirá errores de carga. Esto también excluye de momento Ollama, LM Studio y otros frontales que dependan del llama.cpp oficial.
- Es un modelo "Preview": Diffuspace lo publica como un único post-training preview, sin variantes abliterated ni ediciones alternativas; la calidad del alineamiento no está documentada.
- Sesgos conocidos: no disponible; no se ha publicado ninguna evaluación de sesgos.
- Riesgo de alucinación: al tratarse de un preview sin benchmarks públicos, no hay datos sobre tasas de alucinación; prudencia en usos factuales.
- Cuantización agresiva: los pesos de expertos están en clase Q2 (IQ2_S/IQ2_XXS), la degradación más intensa de la serie APEX; las métricas de perplexity y fidelidad están pendientes de publicar, por lo que la pérdida real respecto a BF16 es desconocida.
- Idiomas: los 13 idiomas están declarados en los metadatos, pero no hay evaluaciones de calidad por idioma; el rendimiento en castellano no está verificado.
- Licencia: Apache 2.0, sin restricciones para uso comercial; no obstante, conviene revisar la licencia del modelo base Diffuspace/Clover-35B-A3B-Preview, que no se detalla en la información disponible.
- Herramientas y agentes: no hay confirmación de soporte de tool calling ni de plantillas de chat específicas; verificar el chat template del modelo base antes de usarlo en producción.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Fuente BF16 GGUF: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-BF16-GGUF
- Cuantización Q8_0: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-Q8_0-GGUF
- I-Matrix VAL-1.25M: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-VAL-1.25M-I-Matrix-GGUF
- llama.cpp parcheado (clover_moe): https://huggingface.co/IsValorum/llama.cpp-clover-moe
- Variante MiniPlus (tier opuesto): https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-APEX-I-MiniPlus-V2.1-GGUF
- PR de referencia en llama.cpp: #31306 (commit `4838ffb0c8ade92f34d9157deea38d92758ab824`)
- Paper, blog o demo del modelo base: no disponible
