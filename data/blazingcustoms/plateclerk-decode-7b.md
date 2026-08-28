# BlazingCustoms/plateclerk-decode-7b

## Resumen

Plate Clerk — Decode Head (7B) es un modelo de generación de texto desarrollado por BlazingCustoms, especializado en una tarea muy concreta: dada una matrícula personalizada (vanity plate), predecir la lectura ofensiva que un revisor de la DMV de California podría hacer de ella. Se trata de un fine-tune del modelo Qwen/Qwen2.5-7B-Instruct mediante LoRA, entrenado sobre el dataset DarwinAnim8or/DMV-Plate-Review. El modelo está diseñado para entretenimiento y exploración, no para moderación de contenido ni para tomar decisiones sobre personas.

El modelo tiene 7.615.616.512 parámetros (7,6B) y una licencia Apache 2.0. Su propósito es decodificar intención ofensiva oculta en texto ofuscado, por lo que emite lenguaje ofensivo, sexual o insultante de forma intencionada. La model card incluye una advertencia de contenido explícita y establece un alcance vinculante: no debe usarse como sistema de moderación, ni para evaluar solicitudes, elegibilidad o cualquier decisión sobre personas reales. El modelo reproduce los sesgos e inconsistencias de los revisores humanos que sirvieron como referencia.

La relevancia de este modelo radica en su enfoque de medición rigurosa: la model card documenta una evaluación detallada de cuantización (f16, Q8_0, Q5_K_M, Q4_K_M) con controles descompuestos, y compara múltiples variantes de entrenamiento (más datos, DPO, mayor tamaño) que no logran superar el rendimiento del modelo base. Esto lo convierte en un caso de estudio interesante sobre los límites de capacidad de una familia de modelos en una tarea específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredado de Qwen2.5-7B-Instruct, no especificado en la ficha) |
| Tipos de cuantizacion | f16 (control, no enviado), Q8_0, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo fusionado) y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7,6B parámetros. No se especifican detalles adicionales de la arquitectura base (número de capas, heads, etc.) en la información proporcionada. El entrenamiento se realizó mediante supervisión directa (SFT) sobre el dataset DarwinAnim8or/DMV-Plate-Review, que contiene pares de matrículas personalizadas y las lecturas ofensivas que los revisores de la DMV de California identificaron en ellas.

La model card documenta experimentos con DPO (optimización por preferencia directa) y con un modelo de 14B, pero ninguno superó significativamente al modelo de 7B SFT. El rendimiento se midió con una métrica propia, token-F1, sobre 1.159 filas held-out. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de recopilación de las anotaciones humanas.

## Capacidades

- Decodificación de matrículas personalizadas: predice la lectura offensiva que un revisor de la DMV haría de una cadena de texto ofuscada (por ejemplo, sustituciones de letras, números o símbolos).
- Generación de texto (text2text): dado un input de matrícula, produce una cadena de texto que nombra la interpretación ofensiva.
- Emisión intencionada de lenguaje ofensivo: el modelo está entrenado para nombrar insultos, lenguaje sexual y otras expresiones ofensivas, por lo que su salida puede ser inapropiada para audiencias no preparadas.
- No soporta tool calling, ni visión, ni audio, ni razonamiento multi-paso. Es un modelo de texto puro, especializado en una única tarea.
- Multilingüe: solo inglés. No hay evidencia de capacidades en otros idiomas.

## Casos de uso

- Entretenimiento y humor: generar lecturas alternativas de matrículas personalizadas para juegos de palabras o contenido cómico, siempre que el público esté advertido del lenguaje ofensivo.
- Investigación sociolingüística: estudiar cómo los humanos interpretan texto ofuscado y qué patrones de sustitución (fonética, extranjerismos, jerga) son más frecuentes, con fines académicos y bajo revisión ética.
- Análisis de sesgos en anotaciones humanas: el modelo reproduce las decisiones de un grupo concreto de revisores, lo que permite estudiar inconsistencias y sesgos en la interpretación de lenguaje ofensivo.
- Desarrollo de sistemas de detección de ofensas (solo como referencia): aunque no debe usarse como moderador, sus salidas pueden servir para generar datos sintéticos de entrenamiento en entornos controlados.
- Demostración de fine-tune especializado: sirve como ejemplo de cómo adaptar un modelo base a una tarea muy específica con LoRA y medir el impacto de la cuantización.
- Evaluación de límites de capacidad: los resultados documentados (techo de rendimiento en token-F1) son útiles para investigar cuándo más datos o más parámetros no mejoran una tarea.

## Benchmarks y rendimiento

La model card reporta una métrica propia, token-F1, sobre 1.159 filas held-out con el modelo en bf16 (transformers, greedy, 0% abstention). El valor principal es **48.24 (v1 strict)** y **48.81 (N1)**. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

La siguiente tabla resume la comparación de variantes de entrenamiento, cada una comparada con su propio control (el modelo 7B SFT para las primeras filas, y un control de la misma línea para las últimas):

| Variante | token-F1 (v1 strict) | Control propio | Delta |
|---|---|---|---|
| Este modelo (7B SFT) | 48.24 | — | control |
| 14B | 48.94 | 48.24 | +0.70, nulo (CI [-0.92, +2.37]) |
| Objetivos normalizados | 48.37 | 48.24 | +0.13, nulo |
| DPO, balanceado por longitud | 48.07 | 48.39 | -0.32, nulo |
| DPO, pares crudos | 38.44 | 48.39 | -9.95, regresión |
| +57% más datos (v3) | 44.83 | 45.56 | -0.73, nulo, tendencia negativa |

La tabla de cuantización, medida con el mismo grader y las mismas filas, descompone el efecto de la precisión y la vía de inferencia:

| Variante | Tamaño | Enviado | token-F1 (v1 strict) | Δ vs f16 | 95% CI (pareado) | N1 |
|---|---|---|---|---|---|---|
| f16 (control) | 15.24 GB | No | 47.57 | — | referencia | 48.05 |
| Q8_0 | 8.10 GB | Sí | 47.41 | -0.16 | [-0.78, +0.45] | 47.82 |
| Q5_K_M | 5.44 GB | Sí | 47.80 | +0.23 | [-0.51, +0.96] | 48.25 |
| Q4_K_M | 4.68 GB | Sí | 48.04 | +0.47 | [-0.55, +1.47] | 48.48 |

Nota: el f16 GGUF no se envía en el repositorio, pero se incluye como control de medición. La model card advierte que la cuantización no se asume lossless y que los intervalos de confianza son amplios.

## Requisitos de hardware

- Tamaños de archivo según cuantización: f16 15.24 GB, Q8_0 8.10 GB, Q5_K_M 5.44 GB, Q4_K_M 4.68 GB.
- VRAM estimada para inferencia: al menos el tamaño del archivo más overhead del runtime. Para Q4_K_M (~4.7 GB) cabe en GPUs consumer de 8 GB (por ejemplo, RTX 3060, RTX 4060). Para bf16 (~15 GB) se recomienda una GPU con 16 GB o más (RTX 4090, A100, etc.).
- El modelo es compatible con vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), según los tags del repositorio (text-generation-inference, endpoints_compatible).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de comparativas públicas con otros modelos especializados en decodificación de matrículas personalizadas. El modelo base Qwen2.5-7B-Instruct no es comparable en tarea, y la model card solo menciona un modelo de 14B de la misma familia (sin nombre) que no superó al 7B. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Emite lenguaje ofensivo, insultos y contenido sexual por diseño. No debe desplegarse en entornos donde la salida llegue a lectores no preparados.
- No es un sistema de moderación de contenido. No fue construido, ajustado ni evaluado para esa función.
- No debe usarse para tomar decisiones sobre personas reales: solicitudes, elegibilidad, enforcement, screening.
- Reproduce los sesgos e inconsistencias de los revisores de la DMV de California. Donde los revisores discreparon, el modelo aprendió la discrepancia.
- Rendimiento limitado: token-F1 de ~48, con un 69.9% de errores atribuidos a conocimiento de jerga o slang que la cadena de texto no contiene.
- La cuantización tiene un efecto medido pero dentro del ruido estadístico; no se garantiza que sea lossless.
- Solo soporta inglés. No hay evidencia de capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero el alcance vinculante de la model card restringe los usos aceptables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlazingCustoms/plateclerk-decode-7b
- Dataset de entrenamiento: https://huggingface.co/datasets/DarwinAnim8or/DMV-Plate-Review
- Perfil del autor: https://huggingface.co/BlazingCustoms
