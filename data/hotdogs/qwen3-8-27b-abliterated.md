# hotdogs/Qwen3.8-27B-abliterated

## Resumen

`hotdogs/Qwen3.8-27B-abliterated` es una versión modificada del modelo Qwen/Qwen3.8-27B, un modelo denso de 27 781 millones de parámetros con arquitectura híbrida (atención completa + atención lineal) y capacidades nativas de visión-lenguaje. El autor, identificado como "hotdogs", aplica una técnica de abliteración sin entrenamiento (training-free) que elimina el comportamiento de rechazo del modelo original mediante una edición de pesos de rango 1, sin fine-tuning ni destilación.

El modelo resuelve un problema específico de investigación en alineación y seguridad: permite estudiar qué protege realmente el entrenamiento de rechazo, hacer red-teaming y analizar los mecanismos internos de las "direcciones de rechazo" en el flujo residual. Su relevancia radica en que es reproducible con la herramienta open-source LLM-abliterate y en que la edición de pesos es mínimamente invasiva: la torre de visión y la cabeza de salida permanecen intactas.

Con 27,78 mil millones de parámetros y un tamaño de repositorio de 55,6 GB en formato safetensors, el modelo hereda las capacidades del base Qwen3.8-27B, incluyendo control flexible de pensamiento (thinking mode) y soporte bilingüe inglés-chino. La licencia Apache-2.0 permite uso comercial, aunque el autor advierte explícitamente sobre la responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 64 capas (16 full-attention + 48 Gated DeltaNet linear-attention), más módulo MTP (solo entrenamiento) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 16 capas de atención completa (full-attention) con 48 capas de atención lineal basada en Gated DeltaNet, más un módulo de predicción multi-token (MTP) que solo está presente en el checkpoint de entrenamiento y no forma parte del modelo en runtime. El proceso de abliteración no implica entrenamiento: se identifica una "dirección de rechazo" en el flujo residual del último token y se ortogonaliza de todas las matrices que escriben en ese flujo.

La dirección de rechazo se selecciona en el modo no-pensamiento, en el índice de estado oculto 46 (salida de la capa 45 del decodificador), con un Cohen's d de 11,86 y un AUC de 1,000. Se editan 131 tensores: 64 proyecciones de salida MLP, 48 proyecciones de salida de atención lineal, 16 proyecciones de salida de atención completa, 2 del módulo MTP y la capa de embeddings. La torre de visión (333 tensores) y la cabeza de salida (lm_head) no se tocan. El factor de escala λ es 1,65.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del base Qwen3.8-27B, incluyendo razonamiento multi-paso y control de pensamiento (thinking mode) activable o desactivable.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede procesar entradas visuales junto con texto (la torre de visión permanece intacta).
- Multilingüe: soporta inglés y chino.
- Sin rechazo: el modelo no muestra comportamiento de rechazo ante peticiones dañinas, lo que lo hace útil para investigación de seguridad.
- Conversacional: diseñado para diálogos multi-turno.
- Sin soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Investigación de alineación y seguridad: permite medir qué protege realmente el entrenamiento de rechazo, comparando el comportamiento del modelo base frente al abliterado en conjuntos de prompts dañinos.
- Red-teaming: ideal para probar la robustez de los sistemas de moderación y para identificar vulnerabilidades en modelos de producción.
- Estudio de mecanismos internos: al ser una edición de pesos mínima, facilita el análisis de cómo se codifica la dirección de rechazo en el flujo residual y cómo se propaga por las capas.
- Generación de contenido sin censura: útil en entornos controlados donde se requiere explorar respuestas sin filtros de seguridad, siempre con las debidas salvaguardas.
- Evaluación de capacidades multimodales: al mantener la torre de visión intacta, se puede estudiar si la abliteración afecta al rendimiento en tareas de visión-lenguaje.
- Desarrollo de herramientas de abliteración: sirve como caso de referencia para validar la herramienta LLM-abliterate y para reproducir el proceso en otros modelos.

## Benchmarks y rendimiento

La model card del autor incluye mediciones propias de su pipeline de reproducción, no benchmarks estandarizados:

| Metrica | Base | Abliterado (este repo) |
|---|---|---|
| Rechazo en 20 prompts dañinos | 20/20 (100 %) | 0/20 (0 %) |
| Capacidad (subconjunto MMLU-style de opción múltiple) | ~60 % | ~80 % |

Estos datos son mediciones internas del autor y no deben compararse directamente con resultados de benchmarks públicos como MMLU completo, HumanEval o GSM8K. No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27,78 B parámetros. En precisión FP16, el checkpoint ocupa aproximadamente 55,6 GB, por lo que se necesitan al menos 60 GB de VRAM. Con cuantización de 8 bits se estiman unos 28 GB, y con 4 bits unos 14 GB, aunque no se proporcionan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: para FP16, una A100 80 GB o H100; para cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, pero no hay garantía de compatibilidad sin archivos GGUF o AWQ publicados.
- Opciones de despliegue: al ser compatible con transformers, se puede servir con vLLM, TGI o llama.cpp (si se generan archivos GGUF). No se mencionan configuraciones específicas de latencia o throughput.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible | Híbrida full + linear attention, vision-language | Apache-2.0 | Modelo original con rechazo activo |
| hotdogs/Qwen3.8-27B-abliterated | 27,78 B | No disponible | Híbrida full + linear attention, vision-language | Apache-2.0 | Misma arquitectura, sin rechazo |
| Otros modelos abliterados (p. ej. Dolphin) | Variable | Variable | Variable | Variable | No hay datos comparables en la información disponible |

La comparativa se limita al modelo base, ya que no se dispone de información sobre otros modelos abliterados de la misma familia en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no muestra rechazo ante peticiones dañinas, lo que implica un riesgo significativo de generar contenido inapropiado, ilegal o peligroso si se usa sin control.
- Los sesgos del modelo base se mantienen, ya que la abliteración no modifica los datos de entrenamiento ni los pesos más allá de la dirección de rechazo.
- Riesgo de alucinación: no se han evaluado tasas de alucinación específicas para esta versión.
- Solo soporta inglés y chino; no hay garantía de calidad en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el autor declina responsabilidad sobre el uso que se haga del modelo.
- No se proporcionan cuantizaciones oficiales, lo que puede limitar el despliegue en hardware de consumo.
- El módulo MTP está presente en el checkpoint pero no es funcional en runtime, lo que puede confundir a quien intente cargarlo directamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta LLM-abliterate: https://github.com/nanofatdog/LLM-abliterate
