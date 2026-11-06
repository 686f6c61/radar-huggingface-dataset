# ddark-il/Qwen3.8-27B-Uncensored

## Resumen

Qwen3.8-27B-Uncensored (versión MLX) es una cuantización de precisión mixta en formato MLX affine del modelo orcarouter/Qwen3.8-27B-Uncensored, un fine-tuning "abliterated" (sin filtros de alineación) de Qwen/Qwen3.8-27B, publicado por el usuario ddark-il en Hugging Face. El modelo base es un denso de 27,8 mil millones de parámetros con 64 capas, arquitectura híbrida GatedDeltaNet + atención completa, ventana de contexto de 256 K tokens, cabeza MTP (multi-token prediction) y torre de visión, lo que lo convierte en un modelo vision-language conversacional.

Esta cuantización concreta se ha construido replicando la receta de True2456/Qwen3.8-27B-AWQ-5.0bpw y está optimizada para oMLX sobre el tensor unit NAX de los chips Apple M5. Ocupa 17,38 GB (5,006 bits por peso de media), un 3,2× menos que el original en bf16, manteniendo una calidad medida muy alta (coseno ≥ 0,9957 en todas las familias de módulos). Es relevante para usuarios de Mac con Apple Silicon que buscan un modelo multimodal sin restricciones de contenido con contexto muy largo y ejecución local eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: GatedDeltaNet (atención lineal) + atención completa, 64 capas, con torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 256 K tokens |
| Tipos de cuantizacion | MLX affine de precisión mixta: 4, 5, 6 y 8 bits por módulo (media 5,006 bpw); sin 3 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX affine, pesos U32 empaquetados, escalas y sesgos BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina capas de atención lineal GatedDeltaNet con capas de atención completa (full attention), un patrón híbrido que reduce el coste de memoria KV en contextos largos manteniendo capacidad de recuperación precisa. Incluye una torre de visión (vision-language) y una cabeza MTP (multi-token prediction) con `mtp_num_hidden_layers: 1`, que permite decodificación especulativa nativa: los borradores de la cabeza se verifican por rechazo contra el tronco, de modo que un error de la cabeza reduce la tasa de aceptación pero nunca corrompe la salida. El vocabulario tiene 248.320 tokens.

Respecto a la cuantización, ddark-il aplicó un mapa de bits por módulo: MLP y proyecciones de salida a 4 bits (grupo 64), proyecciones de entrada GDN a 5 bits, atención q/k/v y módulos de visión a 8 bits, `lm_head` a 6 bits y embeddings a 4 bits (grupo 128). Sobre los grupos de 8 bits se aplicó GPTQ estilo SLQ (asimétrico, `rel_damp` 1e-2, Hessianos de activaciones reales de prefill de este checkpoint), mejorando la mediana del error ponderado un 32 % frente a RTN. Se descartó AWQ en el MLP tras medir sobreajuste al calibrado (−36,6 % en prompts de validación). Los datos de entrenamiento del modelo base y el proceso de "abliteration" del fine-tuning no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multimodal: pipeline image-text-to-text, acepta imágenes y texto como entrada.
- Visión: torre de visión cuantizada a 8 bits con calidad medida (coseno 0,999974–0,999978).
- Contexto muy largo: 256 K tokens, favorecido por las capas GatedDeltaNet que reducen el estado KV.
- Decodificación especulativa nativa vía cabeza MTP incluida en el checkpoint (31 tensores).
- Modo de razonamiento configurable: la plantilla de chat acepta `reasoning_effort` (`xhigh` por defecto, `medium`, `low`), además de `enable_thinking` y `preserve_thinking`.
- Prefill especulativo con drafters de la misma familia de tokenizador (p. ej. Qwen/Qwen3.5-0.8B o Qwen3.5-2B).
- Sin filtros de alineación ("uncensored"/abliterated): responde a solicitudes que los modelos alineados rechazan, lo que implica mayor responsabilidad para el usuario.
- Soporte de tool calling / agentes: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: análisis de imágenes y conversación ejecutado íntegramente en Apple Silicon (M5 u otros), sin enviar datos a la nube, gracias al formato MLX y al soporte NAX de oMLX.
- Procesamiento de documentos largos: con 256 K de contexto puede ingerir contratos, informes técnicos o bases de código extensas y responder preguntas sobre su contenido.
- Investigación sobre modelos sin alineación: al ser un fine-tuning abliterated, permite estudiar diferencias de comportamiento y seguridad frente al modelo base alineado.
- Generación acelerada en local: la cabeza MTP nativa y el prefill especulativo con drafters Qwen3.5 reducen la latencia de decodificación en flujos interactivos.
- Chatbots con razonamiento ajustable: el parámetro `reasoning_effort` permite equilibrar profundidad de razonamiento y coste según la consulta (respuestas rápidas en `low`, razonamiento extenso en `xhigh`).
- Indexación y descripción de imágenes a escala: la torre de visión cuantizada a 8 bits permite pipelines de etiquetado de imágenes con degradación de calidad mínima respecto a bf16.
- Experimentación con cuantización avanzada: la model card documenta con detalle el mapa de bits, los Hessianos y los errores por familia, lo que la hace útil como referencia para técnicas de cuantización en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única calidad medida es la fidelidad de la cuantización respecto a los pesos bf16 originales:

| Familia de módulos | bits/grupo | rel-L2 | coseno |
|---|---|---|---|
| Atención q/k/v (48 módulos, GPTQ) | 8/64 | 0,00654 | 0,999978 |
| Visión qkv/proj | 8/64 | 0,00665 | 0,999978 |
| Visión fc1/merger | 8/128 | 0,00714 | 0,999974 |
| Atención MTP | 8/64 | 0,00583 | 0,999983 |
| lm_head | 6/128 | 0,02392 | 0,999714 |
| GDN in_proj | 5/64 | 0,04090 | 0,999163 |
| MLP | 4/64 | 0,08260 | 0,996583 |
| Atención o_proj | 4/64 | 0,08308 | 0,996543 |
| GDN out_proj | 4/64 | 0,08445 | 0,996428 |
| embed_tokens | 4/128 | 0,09204 | 0,995755 |

## Requisitos de hardware

- VRAM/memoria unificada: 17,38 GB solo de pesos; se recomienda un Mac con al menos 32 GB de memoria unificada para dejar margen al KV cache (crítico con contextos de 256 K) y a la torre de visión.
- Plataforma objetivo: Apple Silicon con oMLX; el build está ajustado para el tensor unit NAX del M5 (100 % de los bytes cuantizados en la rejilla NAX, 89,1 % superan el prefill routing gate de oMLX). En GPUs NVIDIA no es directamente utilizable; para eso existen builds AWQ como True2456/Qwen3.8-27B-AWQ-5.0bpw.
- Consumer hardware: cabe en Macs de gama alta (M5 Pro/Max con 32 GB o más); no cabe cómodamente en GPUs domésticas de 16 GB en este formato MLX.
- Despliegue: servir obligatoriamente a través de oMLX; `mlx_vlm.load` estándar falla con los 31 tensores MTP y puede duplicar el desplazamiento de las normas (usar `strict=False` solo para carga trunk-only).
- Latencia y throughput: no disponible (no se publican mediciones de tokens/s); la decodificación especulativa MTP y el prefill especulativo reducen latencia, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ddark-il/Qwen3.8-27B-Uncensored (MLX) | 27,8 B | MLX affine, 5,006 bpw, 17,38 GB | 256 K | Apache-2.0 | Optimizado para oMLX/NAX (Apple M5), GPTQ en 8 bits, MTP nativo |
| True2456/Qwen3.8-27B-AWQ-5.0bpw | 27,8 B | AWQ 5,0 bpw | 256 K | No disponible | Receta original replicada por este build; orientada a GPUs con AWQ |
| orcarouter/Qwen3.8-27B-Uncensored | 27,8 B | bf16 (≈3,2× mayor) | 256 K | Apache-2.0 | Pesos fuente sin cuantizar; máxima fidelidad, mayor consumo de memoria |

Alternativas de otros fabricantes de tamaño comparable no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Contenido sin filtros: al ser un fine-tuning abliterated, el modelo puede generar contenido que los modelos alineados rechazan (incluido material nocivo). El usuario asume toda la responsabilidad legal y ética de su uso; no es apto para entornos de producción orientados a público general sin capas de moderación propias.
- Riesgo de alucinación: no disponible información específica; como cualquier LLM, puede generar información falsa con apariencia plausible, y la ausencia de alineación puede agravar el problema.
- Compatibilidad de inferencia: solo funciona correctamente con oMLX; `mlx_vlm.load` estándar falla por los tensores MTP y por la convención de normas. La carga trunk-only requiere `strict=False`.
- Cuantización de visión sin calibración de imágenes: los módulos de visión a 8 bits y la atención MTP conservan el range search en lugar de GPTQ porque no hubo datos de imagen para los Hessianos; la calidad en tareas de visión no está validada con GPTQ.
- El AWQ en el MLP se descartó por sobreajuste al calibrado (−36,6 % en prompts de validación), lo que indica que la calidad medida in-sample no siempre refleja el rendimiento real.
- Para prefill especulativo, el drafter debe compartir el tokenizador de 248.320 tokens; drafters con vocabulario menor producen ids fuera de rango.
- Sesgos conocidos, idiomas soportados y restricciones adicionales de licencia: no disponibles en la información proporcionada (la licencia Apache-2.0 sí permite uso comercial).
- Proyecto comunitario con muy poca tracción (960 descargas, 1 like en el momento de la ficha): escaso historial de auditoría por terceros.

## Enlaces

- Ficha del modelo (MLX 5-bit): https://huggingface.co/ddark-il/Qwen3.8-27B-Uncensored
- Modelo base cuantizado fuente: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Receta original replicada: https://huggingface.co/True2456/Qwen3.8-27B-AWQ-5.0bpw
- Herramienta de cuantización mlx-compress: https://github.com/True2456/mlx-compress
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafters compatibles para prefill especulativo: https://huggingface.co/Qwen/Qwen3.5-0.8B y https://huggingface.co/Qwen/Qwen3.5-2B
