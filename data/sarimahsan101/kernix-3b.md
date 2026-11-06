# sarimahsan101/Kernix-3B

## Resumen

Kernix-3B es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) especializado en la optimización de kernels de GPU. Lo desarrolla Syed Sarim Ahsan (usuario `sarimahsan101` en Hugging Face) mediante ajuste fino supervisado (SFT) seguido de optimización por preferencias (DPO) sobre el modelo base Qwen2.5-Coder-3B-Instruct de Alibaba. Su propósito es analizar trazas del perfilador NVIDIA Nsight Compute (`ncu`) y generar kernels en OpenAI Triton y CUDA que compilen, sean numéricamente correctos y resulten físicamente más rápidos en hardware NVIDIA real.

El modelo aborda un problema concreto: los modelos de código genéricos eligen tamaños de tile, factores de desenrollado y asignaciones de warps mediante heurísticas aproximadas. Kernix-3B, en cambio, se entrena sobre ejecuciones empíricas en cuatro microarquitecturas NVIDIA (Turing `sm_75`, Ada Lovelace `sm_89`, Ampere `sm_80` y Blackwell `sm_120`), de modo que sus recomendaciones están ancladas a métricas de rendimiento medidas en silicio y no a reglas empíricas.

Es relevante porque combina un tamaño reducido (3B, desplegable en GPU de consumo) con una especialización vertical poco habitual: ingeniería de rendimiento de GPU guiada por perfilado. Se distribuye con licencia Apache 2.0 tanto en pesos fusionados de 16 bits como en adaptador LoRA, lo que facilita su integración en flujos de trabajo existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino sobre Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en 16 bits: bfloat16/float16) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder es multilingue, pero no se detalla el soporte efectivo tras el ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pesos fusionados de 16 bits y adaptador LoRA en `adapter/adapter_model.safetensors`) |

## Arquitectura y entrenamiento

Kernix-3B hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-3B-Instruct y se entrena en dos etapas. La primera es un ajuste fino supervisado (SFT) multi-GPU sobre trazas de alta resolución que emparejan observaciones del perfilador `ncu` con kernels optimizados, cubriendo las arquitecturas Turing (`sm_75`), Ada Lovelace (`sm_89`), Ampere (`sm_80`) y Blackwell (`sm_120`). La segunda etapa aplica DPO (Direct Preference Optimization) con pares de preferencia construidos estrictamente a partir de tiempos de ejecución físicos: el kernel ganador es el que se ejecuta más rápido y el perdedor el más lento.

La innovación principal es el anclaje empírico al hardware: el modelo no infiere parámetros de optimización de forma heurística, sino que se entrena con el resultado medido de cientos de miles de ejecuciones en GPU reales (Tesla T4, L4, A100-SXM4-80GB y RTX PRO 6000 Server Edition). El autor reporta una reducción del 75 % en perplejidad sobre datos reservados (de 4,15 a 1,04) y una precisión de preferencia DPO del 100 % (15/15 pares). No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de kernels en OpenAI Triton y CUDA a partir de descripciones de problemas matriciales y observaciones del perfilador `ncu`.
- Interpretación de métricas de rendimiento: throughput de cómputo, ancho de banda de memoria, stalls por latencia DRAM, tiempo de ejecución base.
- Ajuste de parámetros de kernel: tamaños de tile, factores de desenrollado, asignación de warps y estrategias de memoria compartida.
- Generación de código numéricamente correcto: el autor reporta coincidencia exacta con `torch.matmul` en FP16 (diferencia <= 0,125).
- Conversación multi-turno mediante plantilla de chat (formato Qwen) con rol de sistema.
- Capacidades de código general heredadas del modelo base Qwen2.5-Coder-3B-Instruct (no verificadas de forma específica en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Optimización de GEMM en producción: dado un problema de dimensiones M, N, K y las métricas de un perfilado previo, el modelo genera un kernel Triton que elimina los stalls detectados; adecuado porque se entrena con pares perfilador-kernel medidos en hardware real.
- Ingeniería de rendimiento asistida en CI/CD: integrar el modelo en un pipeline que perfile kernels candidatos con `ncu` y solicite a Kernix-3B una versión optimizada antes de fusionar cambios, gracias a su tasa de compilación reportada del 100 % en la puerta de verificación.
- Migración entre microarquitecturas: adaptar un kernel optimizado para Ampere (`sm_80`) a Ada Lovelace (`sm_89`) o Blackwell (`sm_120`), ya que el entrenamiento cubre las cuatro arquitecturas y el prompt incluye la arquitectura objetivo.
- Formación y revisión de código de bajo nivel: explicar por qué un kernel concreto está limitado por memoria o por cómputo a partir de las métricas del perfilador, útil para equipos que aprenden optimización de GPU.
- Prototipado rápido de kernels de cómputo científico: generar versiones Triton de operaciones matriciales antes de invertir en una implementación CUDA manual, con la ventaja de que el modelo produce código verificado numéricamente.
- Despliegue en estaciones de trabajo con GPU de consumo: al ser un modelo de 3B, puede ejecutarse localmente junto al propio flujo de perfilado sin depender de APIs externas, lo que encaja en entornos con datos de rendimiento sensibles.
- Ajuste de hiperparámetros de lanzamiento: sugerir configuraciones de grid y block a partir de la ocupación y el ancho de banda observados, reduciendo las iteraciones de prueba y error.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Benchmark / puerta | Modelo base (Qwen2.5-Coder-3B-Instruct) | Kernix-3B | Estado |
|---|---|---|---|
| Perplejidad en datos reservados | 4,15 | 1,04 (reducción del 75,0 %) | PASS |
| Precisión de preferencia DPO | 50,0 % | 100,0 % (15/15 pares) | PASS |
| Margen de recompensa DPO | 0,0 nats | +102,47 nats | PASS |
| Nivel 1: tasa de compilación | ~35,0 % | 100,0 % | PASS |
| Nivel 2: coincidencia numérica | ~30,0 % | Coincidencia exacta vs `torch.matmul` (diferencia FP16 <= 0,125) | PASS |
| Nivel 3: speedup medido en silicio | 0,75x (con stalls) | 1,68x - 1,85x | PASS |

No se han publicado resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en 16 bits (bfloat16/float16), aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 3,1 GB; en 4 bits, alrededor de 1,6 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con soporte de bfloat16 o float16; el autor cita T4, L4, A100-SXM4-80GB y RTX PRO 6000 Server Edition como hardware de entrenamiento y verificación.
- GPU de consumo: cabe en tarjetas con 8 GB o más en 16 bits (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM (el autor lo menciona como destino recomendado para los pesos fusionados), PEFT para cargar el adaptador LoRA sobre el modelo base; llama.cpp, Ollama y TGI no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kernix-3B | 3,09 B | No disponible | Optimización de kernels GPU guiada por `ncu` | Apache 2.0 | Hugging Face (pesos + LoRA) |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | No disponible en la información | Código general | Apache 2.0 | Hugging Face |
| Modelos de código general de ~3B (por ejemplo, variantes de la familia Qwen2.5-Coder) | ~3 B | No disponible | Código general | Apache 2.0 en la mayoría | Hugging Face |

La comparación directa con alternativas especializadas en optimización de GPU no está disponible en la información proporcionada. Frente a su modelo base, Kernix-3B sacrifica amplitud de propósito general a cambio de profundidad en un dominio concreto, con una mejora reportada de perplejidad de 4,15 a 1,04 y una tasa de compilación del 100 % frente al ~35 % del base.

## Limitaciones y advertencias

- Los benchmarks (perplejidad, DPO, speedup de 1,68x-1,85x) son reportados por el autor y no han sido verificados de forma independiente; conviene tratarlos con cautela.
- El conjunto de evaluación DPO es muy reducido (15 pares), lo que limita la significación estadística de la precisión del 100 %.
- El modelo está especializado en optimización de kernels NVIDIA; su rendimiento en tareas generales de código o conversación puede degradarse respecto al modelo base.
- Riesgo de alucinación en métricas o parámetros de hardware: el modelo puede generar cifras de rendimiento plausibles pero incorrectas si el prompt no aporta datos reales del perfilador.
- La cobertura de hardware se limita a las arquitecturas vistas en entrenamiento (Turing, Ada Lovelace, Ampere, Blackwell); el comportamiento en otras GPU o en aceleradores no NVIDIA no está documentado.
- No se detalla el soporte multilingüe efectivo ni la longitud de contexto; ambos datos son relevantes para planificar despliegues.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base Qwen2.5-Coder-3B-Instruct, también Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarimahsan101/Kernix-3B
- Perfil del autor en Hugging Face: https://huggingface.co/sarimahsan101/models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
