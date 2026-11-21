# sarimahsan101/Kernix-3B

## Resumen

Kernix-3B es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) desarrollado por el usuario sarimahsan101, obtenido mediante ajuste fino supervisado (SFT) y optimización por preferencias (DPO) sobre Qwen/Qwen2.5-Coder-3B-Instruct. Su propósito no es la generación de código genérica, sino una tarea muy específica: analizar trazas del perfilador NVIDIA Nsight Compute (`ncu`) y sintetizar kernels de OpenAI Triton y CUDA que sean compilables, numéricamente correctos y físicamente más rápidos que la línea base. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors (formato merged de 16 bits más un adaptador LoRA en el subdirectorio `adapter/`), con un tamaño de repositorio de 6,4 GB.

La propuesta diferencial del modelo es el anclaje empírico: según su model card, se entrenó sobre cientos de miles de ejecuciones reales en cuatro microarquitecturas NVIDIA (Tesla T4 `sm_75`, L4 `sm_89`, A100-SXM4 40/80 GB `sm_80` y RTX PRO 6000 Server Edition `sm_120`), de modo que las decisiones de tile size, factores de unroll y asignación de warps no provienen de heurísticas genéricas sino de métricas medidas en silicio. El autor publica además el pipeline de entrenamiento (SFT + DPO) y la suite de evaluación física en GitHub, y el dataset de trazas NCU en Hugging Face.

Es relevante ahora porque aborda un cuello de botella concreto en ingeniería de rendimiento: la optimización manual de kernels GEMM y similares consume tiempo experto y es propensa a errores de compilación o regresiones numéricas. Kernix-3B propone cerrar el bucle perfilador → kernel → verificación física con un modelo pequeño (3B) que puede ejecutarse en GPUs de gama media, lo que lo hace viable en flujos de trabajo de CI o en estaciones de trabajo individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2, familia Qwen2.5-Coder) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; los pesos se distribuyen en 16 bits (bf16/fp16) y existe un adaptador LoRA (~60-240 MB segun la model card) |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas; el modelo base Qwen2.5-Coder esta orientado a codigo y prompts en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo merged 16-bit, posiblemente sharded) + adaptador PEFT/LoRA en `adapter/adapter_model.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso con atención causal estándar de la familia Qwen2, y se ajusta en dos fases declaradas por el autor: SFT y DPO. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni hiperparámetros como tasa de aprendizaje o número de épocas; la model card remite al repositorio de GitHub para los scripts de entrenamiento y al dataset `sarimahsan101/Kernix-NCU-dataset` para los datos. El corpus descrito consiste en trazas empíricas de NVIDIA Nsight Compute recogidas en cuatro microarquitecturas (Turing, Ada Lovelace, Ampere y Blackwell), lo que constituye la innovación central: el modelo condiciona la generación del kernel a métricas de ocupación, ancho de banda de memoria y latencia de acceso a DRAM medidas en hardware real.

La fase de DPO se usa para alinear las preferencias hacia kernels que efectivamente superan la verificación física, con pares de preferencia construidos a partir de ejecuciones reales. La model card reporta una precisión de preferencia del 100 % en 15 pares retenidos y un margen de recompensa medio de +102,47 nats, si bien estas cifras provienen del propio autor y no de una evaluación independiente. No se mencionan innovaciones de inferencia como decodificación especulativa o atención lineal; el modelo se presenta como un ajuste fino estándar con un pipeline de verificación externo (la "Kernix 3-Tier Physical Verification Gate") que compila, compara numéricamente contra `torch.matmul` y mide tiempos con CUDA Events.

## Capacidades

- Generación de kernels en OpenAI Triton y CUDA a partir de una descripción de problema (dimensiones, dtype, arquitectura objetivo) y de observaciones del perfilador `ncu`.
- Interpretación de métricas de rendimiento GPU: throughput de cómputo, ancho de banda de memoria, stalls por latencia DRAM, ocupación y cuellos de botella asociados a la microarquitectura (`sm_75`, `sm_80`, `sm_89`, `sm_120`).
- Selección empírica de parámetros de kernel: tile sizes, factores de unroll, asignación de warps y estrategias de tiling guiadas por datos de ejecución.
- Generación de código compilable: la model card reporta una tasa de compilación JIT del 100 % en su conjunto de evaluación (frente al ~35 % de la línea base).
- Corrección numérica: paridad con `torch.matmul` en FP16 con diferencia máxima ≤ 0,125 en su evaluación.
- Formato conversacional con plantilla de chat (roles system/user/assistant) heredada del modelo base instruct.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes multi-paso: no documentado como capacidad nativa; el bucle perfilador → generación → verificación es externo al modelo.
- Capacidades multilingües: no documentadas; el entrenamiento y los ejemplos están en inglés técnico.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Optimización de kernels GEMM en producción: dado un kernel lento y su traza `ncu` (por ejemplo, 38,2 % de throughput de cómputo y 82,5 % de ancho de banda con stalls en DRAM), el modelo genera una variante Triton con tiling y unroll ajustados a la GPU objetivo, que después se valida con la suite de verificación del repositorio antes de integrarse.
- Ingeniería de rendimiento asistida en CI: el modelo puede ejecutarse como paso de un pipeline que, ante una regresión de latencia detectada por benchmarks, proponga un kernel alternativo; su tamaño de 3B permite servirlo en una GPU de gama media junto al propio job de benchmark.
- Aceleración de prototipos en investigación: investigadores que portan operadores a Triton pueden obtener una primera implementación compilable y numéricamente paritaria a partir de las métricas de su propio perfilado, reduciendo el ciclo de prueba y error manual.
- Formación y transferencia de conocimiento: el modelo actúa como asistente que explica por qué una configuración de tiles provoca stalls de memoria en una microarquitectura concreta, usando las trazas como contexto, lo que resulta útil para equipos que migran kernels entre generaciones de GPU (por ejemplo, de T4 a A100 o a Blackwell).
- Portabilidad entre microarquitecturas: al haberse entrenado con datos de `sm_75`, `sm_80`, `sm_89` y `sm_120`, puede emplearse para readaptar un kernel optimizado para Ampere a Ada Lovelace o Blackwell partiendo del perfilado en el nuevo hardware.
- Automatización de la validación de kernels: integrado con la puerta de verificación en tres niveles (compilación, paridad numérica y medición con CUDA Events), el modelo puede generar candidatos y descartar automáticamente los que no compilan o no igualan la referencia, reduciendo la revisión manual.
- Docencia de computación GPU: como modelo pequeño y con licencia Apache 2.0, es desplegable en laboratorios con GPUs consumer para practicar optimización guiada por perfilador sin depender de APIs externas.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor, medidos en silicio Tesla T4 con la suite de verificación propia. No hay evaluación independiente publicada.

| Metrica | Qwen2.5-Coder-3B (base) | Kernix-3B | Estado declarado |
|---|---|---|---|
| Perplejidad en held-out | 4,15 | 1,04 (reduccion del 75,0 %) | PASS |
| Precision de preferencia DPO | 50,0 % | 100,0 % (15/15 pares) | PASS |
| Margen de recompensa DPO medio | 0,0 nats | +102,47 nats | PASS |
| Tier 1: tasa de compilacion Triton | ~35,0 % | 100,0 % | PASS |
| Tier 2: paridad numerica con `torch.matmul` | ~30,0 % | 100,0 % (dif. FP16 ≤ 0,125) | PASS |
| Tier 3: speedup medido en silicio | 0,75x | 1,68x – 1,85x | PASS |

La model card indica además que el speedup predicho fue de 1,80x frente a 1,85x medido con CUDA Events (97,3 % de concordancia temporal). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en 16 bits (bf16/fp16) los 3,09 B parámetros ocupan aproximadamente 6,2 GB, por lo que se recomienda un mínimo de 8 GB de VRAM; en cuantización de 8 bits bajaría a unos 3,1 GB y en 4 bits a unos 1,6 GB, aunque no se publican checkpoints cuantizados oficiales y habría que generarlos.
- GPU recomendadas: el modelo se entrenó y evaluó en Tesla T4, L4, A100-SXM4 40/80 GB y RTX PRO 6000 Server Edition; para inferencia basta una GPU con soporte bf16 o fp16. Una RTX 4090 (24 GB) permite holgura para contexto largo y lotes mayores; una RTX 3060 de 12 GB o una L4 de 24 GB son suficientes para uso individual.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más de VRAM en 16 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), y en GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con `device_map="auto"` (documentado con ejemplo oficial), vLLM (el autor lo recomienda para los pesos merged de 16 bits), PEFT para cargar el adaptador LoRA sobre el modelo base cacheado, y TGI, ya que el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencias de inferencia; solo cifras de speedup de los kernels generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Kernix-3B** | 3,09 B | No disponible | Generacion de kernels GPU guiada por perfilador `ncu` (SFT + DPO) | Apache 2.0 | Hugging Face (pesos merged + LoRA) |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | No disponible en la informacion proporcionada | Codigo general e instrucciones | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7,6 B aprox. | No disponible en la informacion proporcionada | Codigo general, mayor capacidad | Apache 2.0 | Hugging Face |
| Modelos de codigo generalistas de 3B (por ejemplo, variantes de la familia Llama o StarCoder) | ~3 B | No disponible | Codigo general | Varía segun modelo | Hugging Face |

La comparación relevante es frente a su propio modelo base: Kernix-3B no compite en benchmarks de código general, sino en la tarea acotada de síntesis de kernels verificados físicamente. Frente a alternativas de código de tamaño similar, su ventaja declarada es la tasa de compilación y la paridad numérica en el dominio Triton/CUDA; su desventaja es que no se han publicado evaluaciones independientes ni resultados en benchmarks estándar que permitan situarlo frente a modelos generalistas.

## Limitaciones y advertencias

- Todos los benchmarks proceden del autor del modelo y de su propia suite de verificación; no hay evaluación independiente que confirme las cifras de perplejidad, preferencia DPO o speedup.
- El entrenamiento se limita a cuatro microarquitecturas NVIDIA (`sm_75`, `sm_80`, `sm_89`, `sm_120`); el rendimiento en otras GPUs (por ejemplo, arquitecturas AMD, Intel o NVIDIA no incluidas) no está validado y podría degradarse.
- El dominio es estrecho: el modelo está especializado en análisis de trazas `ncu` y generación de kernels Triton/CUDA; para código general, tareas de razonamiento o conversación abierta es previsible que rinda por debajo de modelos generalistas del mismo tamaño, aunque no se publican datos que lo cuantifiquen.
- Riesgo de alucinación en métricas y APIs: el modelo puede inventar nombres de métricas de `ncu`, parámetros de Triton o APIs de CUDA; por ello el flujo recomendado incluye compilación y verificación numérica obligatorias antes de usar cualquier kernel generado.
- La verificación numérica reportada usa un umbral de diferencia FP16 ≤ 0,125 frente a `torch.matmul`; ese umbral puede ser insuficiente para aplicaciones de alta precisión, y no se documentan evaluaciones en FP32, BF16 o FP8.
- No se documentan sesgos sociales ni de otro tipo, ni evaluación de seguridad; al derivar de Qwen2.5-Coder hereda los sesgos y limitaciones del modelo base, no analizados en la model card.
- Idiomas no declarados: la model card no especifica lista de idiomas; los prompts de ejemplo y el entrenamiento están en inglés técnico, por lo que el soporte de castellano no está garantizado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar también la licencia del modelo base Qwen2.5-Coder-3B-Instruct, que es Apache 2.0.
- El repositorio mezcla pesos merged y adaptador LoRA; cargar el adaptador sobre el modelo base requiere PEFT y coherencia de versión con transformers, lo que añade complejidad operativa frente a los pesos merged.
- No se documenta longitud de contexto; si se hereda la del modelo base, conviene verificarla en `config.json` antes de diseñar flujos con trazas de perfilado extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarimahsan101/Kernix-3B
- Repositorio GitHub (entrenamiento SFT + DPO y suite de evaluación): https://github.com/sarimahsan/Kernix
- Dataset de trazas NCU: https://huggingface.co/datasets/sarimahsan101/Kernix-NCU-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Referencia del modelo mayor de la familia (Kernix-14B, citado en la model card): https://huggingface.co/sarimahsan101/Kernix-14B
- Licencia del proyecto: https://github.com/sarimahsan/Kernix/blob/main/LICENSE
