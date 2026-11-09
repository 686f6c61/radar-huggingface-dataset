# DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED es un fine-tune del modelo denso Qwen3.5-9B, desarrollado por DavidAU mediante Unsloth sobre hardware local. El autor parte del checkpoint trohrbaugh/Qwen3.5-9B-heretic-v2 (una variante ya "abliterated") y aplica un destilado de un dataset de razonamiento generado con Claude 4.6, con el objetivo declarado de sustituir el estilo de pensamiento de Qwen 3.5 por el de Claude 4.6 y mejorar los benchmarks de razonamiento del modelo original.

El modelo conserva la arquitectura híbrida de Qwen3.5: capas de atención lineal Gated DeltaNet combinadas con atención completa con compuertas (gated attention), más un encoder de visión, lo que le otorga capacidades multimodales de imagen-a-texto. Cuenta con 9.409.813.744 parámetros totales, una longitud de contexto nativa de 262.144 tokens (extensible hasta 1.010.000 según el autor original) y se distribuye en precisión bfloat16.

Su relevancia actual reside en dos factores: por un lado, es un ejemplo de destilado de razonamiento sobre un modelo de 9B con ventana de contexto muy amplia; por otro, es una variante explícitamente "uncensored" y "heretic" (sin mecanismos de rechazo), lo que lo orienta a escritura creativa, rol y generación de ficción sin filtros, pero lo hace inadecuado para despliegues comerciales sensibles sin moderación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con encoder de visión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1.010.000 según el modelo base |
| Tipos de cuantizacion | bfloat16 nativo; el autor recomienda mínimo q4_k_s (sin imatrix) o IQ3S (con imatrix) |
| Idiomas soportados | en, zh (etiquetados en la model card); el modelo base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B: 32 capas organizadas en 8 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La dimensión oculta es 4096, el FFN intermedio 12288 y el vocabulario 248.320 tokens (con padding). La atención lineal Gated DeltaNet usa 32 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la gated attention usa 16 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. Incluye entrenamiento con multi-token prediction (MTP) y un encoder de visión para entrada multimodal.

El fine-tune de DavidAU se realizó con Unsloth sobre un "Claude 4.6 large distill dataset", es decir, un conjunto de datos de destilado generado por Claude 4.6, aplicado sobre una base ya "heretic" (sin rechazos). El autor indica que el entrenamiento se mantuvo "mild" para no degradar los benchmarks del modelo original, que se entrenó después del proceso de "Heretic'ing" y que la visión fue verificada como funcional tras el reentrenamiento. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO adicionales en esta etapa.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (cadena de pensamiento) heredado de Qwen3.5 y reestilizado hacia el patrón de Claude 4.6.
- Comprensión de imágenes (pipeline image-text-to-text); el autor confirma que la visión funciona tras el fine-tune, aunque las porciones de vídeo no fueron probadas.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de escenas y prosa "vivid".
- Roleplay y conversación multi-turno sin mecanismos de rechazo (6 rechazos de 100 según la métrica del autor).
- Capacidades multilingües limitadas en la práctica a inglés y chino según la model card del fine-tune, aunque la base declara cobertura amplia.
- Soporte de tool calling y function calling heredado de Qwen3.5 (el autor no documenta pruebas específicas en esta variante).
- Razonamiento multi-paso orientado a agentes, heredado del entrenamiento RL del modelo base.

## Casos de uso

- Generación de ficción larga: con 262.144 tokens de contexto nativo, el modelo puede mantener coherencia de personajes y tramas a lo largo de novelas o series de capítulos sin truncar el histórico; el fine-tune está específicamente orientado a prosa vívida y tramas complejas.
- Roleplay y compañía conversacional: al estar "abliterated", mantiene personajes y escenarios sin rechazos, lo que resulta útil en juegos de rol o narrativa interactiva donde un modelo alineado rompería la inmersión.
- Continuación de escenas y guiones: adecuado para pipelines de escritura asistida donde se necesita continuar un texto existente respetando estilo y contexto largo, con la ventana amplia como ventaja directa.
- Asistencia a guionistas y novelistas: generación de subtramas y variantes de escena a partir de un documento de referencia extenso (biblia de personajes, worldbuilding) cargado en contexto.
- Análisis de imagen con narración: al conservar el encoder de visión, puede describir imágenes y generar texto narrativo a partir de ellas, útil en herramientas de storyboarding o catalogación creativa.
- Prototipado de agentes conversacionales sin moderación: en entornos de investigación donde se quiere estudiar el comportamiento del modelo sin capas de rechazo, con la advertencia de que requiere moderación externa en producción.
- Extracción y reescritura sobre documentos largos: la ventana de 256k permite resumir o reescribir contratos, informes o transcripciones extensas en una sola pasada.

## Benchmarks y rendimiento

Resultados publicados por el autor (precisión mxfp8), sobre arc, arc/e, boolq, hswag, obkqa, piqa y wino:

| Modelo / modo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| HERETIC (thinking) | 0.432 | 0.505 | 0.625 | 0.658 | 0.374 | 0.748 | 0.657 |
| HERETIC (instruct) | 0.574 | 0.755 | 0.869 | 0.714 | 0.410 | 0.780 | 0.691 |
| Claude-4.6-HighIQ-INSTRUCT | 0.574 | 0.729 | 0.882 | 0.711 | 0.422 | 0.775 | 0.691 |
| Qwen3.5-9B (thinking) | 0.417 | 0.458 | 0.623 | 0.634 | 0.338 | 0.737 | 0.639 |

Métricas de descensurado declaradas por el autor:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0.0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 19 GB solo para pesos, más KV cache; con 256k de contexto el KV cache es considerable y exige GPU de 40-80 GB para uso práctico a contexto completo.
- Cuantización q4_k_s: aproximadamente 5-6 GB de pesos, viable en GPU consumer de 8-12 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo y bf16; RTX 4090 (24 GB) para bf16 con contexto recortado o q8; RTX 3090/4080 para cuantizaciones q4-q6.
- Cabe en GPU consumer: sí, en cuantizaciones q4/q5/q6 (RTX 3060 12 GB en adelante con contexto limitado).
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (compatibilidad heredada de Qwen3.5); llama.cpp/Ollama para GGUF si se generan cuantizaciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-9B fine-tune) | 9,4B | 262k (ext. 1M) | Apache 2.0 | Sin rechazos, destilado Claude 4.6, visión |
| Qwen/Qwen3.5-9B | 9B | 262k (ext. 1M) | Apache 2.0 | Base alineada, rechazos 100/100 |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9B | 262k | Apache 2.0 | Base "heretic" sin destilado Claude 4.6 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 9B | 262k | Apache 2.0 | Variante instruct del mismo autor, sin descensurado |

## Limitaciones y advertencias

- Modelo explícitamente sin alineación de seguridad: 6 rechazos de 100 frente a 100 de 100 del base; puede producir contenido dañino, ilegal o NSFW sin filtro. Requiere moderación externa en cualquier despliegue público.
- Riesgo de alucinación inherente a un modelo de 9B y agravado por el fine-tune de destilado; los benchmarks declarados son del propio autor y no han sido verificados de forma independiente.
- Idiomas: la model card del fine-tune solo declara inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior al de la base.
- La divergencia KL de 0.0793 indica un cambio moderado pero no nulo respecto a la base; el autor advierte que otras versiones están en pruebas.
- Las capacidades de vídeo no fueron probadas; solo se verificó la entrada de imágenes.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo descensurado conlleva riesgos legales y reputacionales que la licencia no cubre.
- El contexto de 256k en bf16 exige hardware de gama alta; en consumer GPU el contexto práctico queda muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Modelo base del fine-tune: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
