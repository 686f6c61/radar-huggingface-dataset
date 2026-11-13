# pragmaticcs/PentaCoder-9B

## Resumen

PentaCoder-9B es un modelo de lenguaje causal de 8.953.803.264 parámetros (8,95B) publicado por el usuario pragmaticcs en Hugging Face. No se trata de un entrenamiento desde cero, sino de un *merge* de pesos: parte del checkpoint base Qwen/Qwen3.5-9B y fusiona cinco checkpoints especializados derivados del mismo (Qwopus3.5-9B-Coder, MiMo-V2.6-Distill-Qwen-9B, Ornith-1.5-9B, OxCoder-9B y Qwen3.8-9B-Distill) mediante una técnica propietaria denominada GeoDELLA (Geometric Drop-and-Rescale con de-sesgo por covarianza de tarea y anclaje de norma espectral). El objetivo declarado es combinar capacidades de corrección algorítmica, planificación agéntica multi-turno, disciplina de ejecución en terminal, implementación de bajo nivel y razonamiento estructural en un único modelo denso de menos de 10B.

El problema que aborda es concreto: según el autor, los modelos de código por debajo de 10B suelen degradarse en entornos agénticos reales, con repeticiones catastróficas y sintaxis frágil cuando fallan comandos de shell o comprobaciones del compilador. PentaCoder busca mitigar ese comportamiento uniendo distribuciones de pesos complementarias en lugar de aplicar un ajuste fino adicional sobre datos sintéticos.

Arquitectura híbrida recurrente-atención (`qwen3_5_text`) con 32 capas, atención lineal Gated DeltaNet combinada con atención softmax completa en proporción 3:1, ventana de contexto nativa de 262.144 tokens y licencia Apache 2.0. El modelo es puramente textual, soporta inglés y chino, y está pensado para ejecutarse en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido recurrente-atención (`qwen3_5_text`), 32 capas con Gated DeltaNet lineal y atención softmax completa en bloques 3:1 |
| Parametros totales | 8.953.803.264 (8,95B; la model card indica 8,8B para el backbone de texto) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | no disponible (pesos nativos en `bfloat16`; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en, zh (la model card declara únicamente inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

Datos arquitectónicos adicionales declarados en la model card: dimensión oculta 4096, dimensión intermedia 12288 (SwiGLU), 8 bloques de atención con capas completas en las posiciones 3, 7, 11, 15, 19, 23, 27 y 31; atención lineal con 16 cabezas de clave y 32 de valor (d_k = d_v = 128); atención completa con 16 cabezas de consulta y 4 de clave-valor (GQA, d_h = 256); RoPE parcial 1D (θ = 10⁷, factor 0,25, 64 dimensiones); vocabulario de 248.320 tokens ampliado para tokens de fill-in-the-middle y de herramientas.

## Arquitectura y entrenamiento

El modelo no se entrena: se construye por fusión de pesos. La base topológica es Qwen/Qwen3.5-9B, sobre la que se aplican cinco *task vectors* procedentes de checkpoints especializados, mapeados a lo largo de la profundidad normalizada de capas (u ∈ [0, 1]). Cada donante aporta un sesgo de tarea distinto: Qwopus3.5-Coder contribuye corrección algorítmica y descomposición arquitectónica (derivada de trayectorias de destilación de Claude 3.5 Opus); MiMo-V2.6-Distill aporta planificación multi-turno para SWE-bench e integridad del protocolo de herramientas; Ornith-1.5 aporta disciplina de ejecución en terminal y heurísticas de recuperación de errores (entrenado con RL antirrepetición); OxCoder aporta implementación de bajo nivel y robustez en tiempo de ejecución (API, CLI, operación); y Qwen3.8-Distill aporta razonamiento estructural abstracto y anclaje sintáctico mediante cadenas de pensamiento destiladas.

La metodología propietaria GeoDELLA combina *drop-and-rescale* geométrico, de-sesgo por covarianza de tarea y anclaje de norma espectral, con políticas de componentes estratificadas por capa. La model card cita como referencias los papers arXiv:2406.11617 y arXiv:2403.19522, habituales en la literatura de *model merging* (TIES y DELLA). La innovación arquitectónica subyacente, heredada de Qwen 3.5, es la atención híbrida: 24 de las 32 capas usan Gated DeltaNet (atención lineal recurrente) y solo 8 usan atención softmax completa, lo que reduce el coste de memoria y cómputo en contextos largos. No se documentan en la información disponible el volumen de tokens de entrenamiento de los donantes, la composición exacta de sus datasets ni si hubo RLHF o DPO en el pipeline original.

## Capacidades

- Generación de texto y razonamiento de propósito general en inglés y chino.
- Generación y corrección de código, con especial énfasis en corrección algorítmica y descomposición de problemas.
- Razonamiento agéntico multi-turno y planificación de tareas tipo SWE-bench.
- Uso de herramientas (*tool calling* / *function calling*), con vocabulario ampliado específicamente para tokens de herramientas y de fill-in-the-middle.
- Ejecución en terminal y recuperación de errores: heurísticas antirrepetición y disciplina ante fallos de comandos o de compilación.
- Implementación de bajo nivel: APIs, interfaces de línea de comandos y código operativo.
- Razonamiento estructural abstracto y anclaje sintáctico mediante cadenas de pensamiento destiladas.
- Contexto largo nativo de 256k tokens, apto para repositorios completos o trazas de agente extensas.
- No dispone de visión, audio ni otras modalidades: es un modelo puramente textual.

## Casos de uso

- Agente de resolución de incidencias en repositorios: el modelo puede recibir el árbol de un repositorio y trazas de error dentro de su ventana de 256k tokens, planificar la corrección en varios pasos y emitir parches, aprovechando el sesgo de planificación multi-turno heredado de MiMo-V2.6-Distill.
- Automatización de tareas de terminal: ejecución de comandos de shell con recuperación ante fallos, gracias a las heurísticas antirrepetición de Ornith-1.5, que reducen los bucles degenerados cuando una comprobación del compilador falla.
- Asistente de programación integrado en IDE: autocompletado y generación de código con soporte nativo de fill-in-the-middle (vocabulario ampliado a 248.320 tokens), adecuado para completar funciones y bloques en editores.
- Generación de código de sistemas y utilidades CLI: implementación de scripts operativos, wrappers de API y herramientas de línea de comandos, terreno aportado por OxCoder-9B.
- Revisión de código y razonamiento sobre estructuras abstractas: análisis de arquitectura de software y explicación de decisiones de diseño mediante cadenas de pensamiento destiladas de Qwen3.8-Distill.
- Canalización de atención al desarrollador: asistencia conversacional multi-turno sobre documentación técnica y errores de integración, con contexto largo para mantener el hilo de una sesión de depuración extensa.
- Despliegue en estaciones de trabajo con GPU de consumo: al ser un denso de 9B en bfloat16 (≈17,9 GB de pesos), puede servirse en una única GPU de 24 GB con cuantización o en bfloat16 con GPUs de 24-40 GB, lo que lo hace viable para equipos de desarrollo sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona SWE-bench como dominio de entrenamiento de uno de los donantes (MiMo-V2.6-Distill) y describe cualitativamente mejoras en robustez agéntica, pero no incluye tablas con métricas numéricas (MMLU, HumanEval, GSM8K, SWE-bench) para PentaCoder-9B ni comparaciones cuantitativas con los checkpoints de origen.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,9 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para inferencia cómoda y 40-80 GB para lotes grandes o contexto muy largo.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB, aunque no se documentan cuantizaciones oficiales publicadas para este modelo.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en producción con contexto de 256k; RTX 4090 (24 GB) o RTX A6000 (48 GB) para uso individual en bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB; la arquitectura híbrida con solo 8 capas de atención completa reduce la caché KV frente a un transformer denso equivalente.
- Opciones de despliegue: `transformers` (librería declarada), y previsiblemente vLLM, TGI y llama.cpp/Ollama si se generan conversiones GGUF; no se confirma compatibilidad explícita con estos motores en la información disponible.
- Latencia y throughput: no disponibles. El autor describe el modelo como "rápido" por su tamaño y atención híbrida, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PentaCoder-9B | 8,95B (denso) | 262.144 | Apache 2.0 | Merge GeoDELLA de cinco checkpoints Qwen 3.5 9B; texto, en/zh |
| Qwen/Qwen3.5-9B | 9B (denso) | no disponible en la información | no disponible en la información | Checkpoint base del merge; misma arquitectura híbrida |
| MiMo-V2.6-Distill-Qwen-9B | 9B (denso) | no disponible en la información | no disponible en la información | Donante especializado en trazas agénticas y SWE-bench |
| Qwopus3.5-9B-Coder | 9B (denso) | no disponible en la información | no disponible en la información | Donante especializado en código, destilado de Claude 3.5 Opus |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, linaje y licencia.

## Limitaciones y advertencias

- Modelo resultante de un merge no validado con benchmarks públicos: el rendimiento real en tareas agénticas o de código no está cuantificado de forma independiente.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en razonamiento de varios pasos y en referencias a APIs inexistentes.
- La fusión de cinco distribuciones de pesos puede producir interferencias imprevistas: capacidades de los donantes que no se conserven de forma uniforme entre capas.
- La técnica GeoDELLA es propietaria y no está descrita con suficiente detalle matemático en la información disponible para reproducir el merge.
- Sesgos de los datos de entrenamiento de los donantes (principalmente código y texto en inglés y chino) no auditados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los seis checkpoints de origen, ya que el modelo las hereda en la práctica.
- El modelo se distribuye con promoción de una comunidad de Patreon y un modelo sucesor; no hay garantía de mantenimiento a largo plazo.
- No dispone de visión ni audio; no es adecuado para tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pragmaticcs/PentaCoder-9B
- Checkpoint base: https://huggingface.co/Qwen/Qwen3.5-9B
- Donante Qwopus3.5-9B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Donante MiMo-V2.6-Distill-Qwen-9B: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Donante Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Donante OxCoder-9B: https://huggingface.co/OrionLLM/OxCoder-9B
- Donante Qwen3.8-9B-Distill: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo sucesor anunciado: https://huggingface.co/pragmaticcs/MiMo-HERO-UIUX-Designer-9B
- Referencia TIES (arXiv:2406.11617): https://arxiv.org/abs/2406.11617
- Referencia DELLA (arXiv:2403.19522): https://arxiv.org/abs/2403.19522
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Repositorio de transformers: https://github.com/huggingface/transformers
