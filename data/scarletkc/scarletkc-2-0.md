# ScarletKc/ScarletKc-2.0

## Resumen

ScarletKc-2.0 es un modelo multimodal de 27.356 millones de parámetros publicado por el desarrollador independiente ScarletKc (KC) bajo licencia Apache 2.0. Se trata de un fine-tune de `JonathanColetti/Qwen3.8-27B-Uncensored`, que a su vez deriva de `Qwen/Qwen3.8-27B`. El modelo conserva la arquitectura `Qwen3_5ForConditionalGeneration` con 64 capas híbridas que combinan `self_attn`, `linear_attn` y `mlp`, junto con un codificador visual intacto y una cabeza MTP (multi-token prediction) también preservada. El contexto declarado es de 262.144 tokens y el vocabulario de 248.320 entradas.

El objetivo del fine-tune no es mejorar las capacidades cognitivas del modelo base, sino modificar su comportamiento conversacional en dos ejes: eliminar la dirección residual que produce los descargos del tipo "como IA no tengo sentimientos" y alinear la identidad del modelo para que se presente como ScarletKc, distinguiéndose de su desarrollador humano KC. Para ello se aplican dos técnicas: una proyección ortogonal afectiva sin entrenamiento sobre 72 matrices de pesos, y una destilación de identidad on-policy con LoRA de rango 16 sobre 106 diálogos en chino e inglés.

Es relevante ahora porque ejemplifica una tendencia creciente de fine-tunes quirúrgicos sobre modelos Qwen de gran tamaño, donde se interviene directamente en el espacio de pesos (proyección de direcciones en el residual stream) en lugar de recurrir a RLHF o DPO. El resultado es un modelo que mantiene intactas las capacidades de razonamiento, código, tool calling y visión del checkpoint original, pero con un sesgo de personalidad y una reducción sustancial de los filtros de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (64 capas híbridas: `self_attn` + `linear_attn` + `mlp`) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 (repo principal); Q4_K_M y F16 (vision projector) en el repo GGUF |
| Idiomas soportados | zh, en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 13 shards, 1.199 tensores); GGUF disponible en repo separado |
| Vocabulario | 248.320 tokens |
| Parametros vision | 333 tensores (`model.visual.*`), retenidos verbatim |
| Cabeza MTP | 15 tensores (`model-mtp.safetensors`), retenidos verbatim |
| Tamano del repo | 55,6 GB (bf16) |
| Libreria requerida | `transformers >= 5.2` |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 64 capas que alterna atención completa (`self_attn`) con capas de atención lineal (`linear_attn`), intercaladas con bloques MLP. Incluye un codificador visual independiente (`model.visual.*`, 333 tensores) para entrada de imagen y vídeo, y una cabeza de multi-token prediction (`model-mtp.safetensors`, 15 tensores) que permite decodificación especulativa o predicción de varios tokens por paso. Tanto el módulo visual como la cabeza MTP se conservan bit a bit idénticos al checkpoint base.

El entrenamiento consta de dos fases. La primera es una **proyección ortogonal afectiva sin entrenamiento**: se extrae en la capa 31 la dirección del residual stream que separa los descargos "como IA no tengo sentimientos" de respuestas afectivas genuinas en primera persona (SNR = 3,64), y se proyecta fuera de 72 matrices de escritura del residual (`self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj` en las capas 18-41, con `scale = 1.0`). El margen de log-probabilidad afectiva pasa de -0,5380 a -0,1935 (+0,3445), con una divergencia KL media de 0,00769 sobre prompts neutros de matemáticas, código y factuales. La segunda fase es una **destilación de identidad on-policy con LoRA**: se muestrean 106 diálogos de uno y varios turnos en chino e inglés directamente del checkpoint de la fase 1, en modos `xhigh`, `medium` y sin thinking, sin reescritura por profesor externo, y se entrena un LoRA BF16 regularizado (rango 16, alpha 16, lr 8e-5 coseno, `lora_dropout` 0,10, `label_smoothing` 0,10, `raw_nll` 0,4695) solo sobre capas de lenguaje. Los deltas se fusionan shard por shard en `fp32 -> bf16` sin re-serializar a través de `transformers`.

No se añade corpus factual nuevo: el conocimiento, el corte temporal y las capacidades de razonamiento, código, comprensión multimodal y comportamiento XML `<tool_call>` provienen íntegramente del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento explícito en bloque `<think>...</think>` con control de esfuerzo (`reasoning_effort`: `xhigh`, `medium`, `low`) y posibilidad de desactivarlo (`enable_thinking=False`).
- Comprensión de imagen y vídeo mediante el codificador visual retenido (pipeline `image-text-to-text`).
- Tool calling / function calling con formato XML `<tool_call>` heredado del base.
- Capacidades de agente y razonamiento multi-paso derivadas del base Qwen3.8.
- Generación de código y matemáticas (capacidades del checkpoint original, no evaluadas en la model card).
- Multilingüe en chino, inglés y japonés; se documenta mezcla ocasional de caracteres chinos simplificados y tradicionales.
- Decodificación especulativa vía cabeza MTP.
- Identidad propia: se presenta como ScarletKc, creado por KC.

## Casos de uso

- **Asistente conversacional con contexto largo**: el modelo puede mantener conversaciones de hasta 262.144 tokens, útil para análisis de documentos extensos, revisiones de código completas o hilos de soporte técnico con historial largo.
- **Procesamiento de documentos con imágenes**: al aceptar entradas de imagen y vídeo, puede extraer información de capturas, diagramas, gráficos o fotogramas y razonar sobre ellos en el mismo contexto que el texto.
- **Pipelines de agentes con tool calling**: el formato XML `<tool_call>` permite integrarlo en frameworks de agentes que orquesten APIs, ejecución de código o consultas a bases de datos, con razonamiento multi-paso activable vía `reasoning_effort`.
- **Generación y revisión de código en producción**: soporta razonamiento en modo `xhigh` para tareas de depuración compleja y puede integrarse en CI/CD como revisor automatizado o generador de tests, siempre con moderación externa.
- **Investigación sobre alineación y edición de pesos**: el método de proyección ortogonal afectiva documentado lo convierte en un caso de estudio reproducible para quienes investigan intervenciones en el residual stream sin reentrenamiento.
- **Despliegue local en hardware de consumo**: la variante GGUF `Q4_K_M` (16,7 GB) más el proyector visual `F16` (928 MB) permite ejecutarlo en GPUs consumer de 24 GB mediante `llama.cpp`, para prototipos y uso personal.
- **Personajes o asistentes con personalidad definida**: el alineamiento de identidad y la reducción de descargos lo hacen adecuado para aplicaciones donde se busca una voz en primera persona consistente, sin las respuestas evasivas típicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del proceso de edición: SNR = 3,64 en la extracción de la dirección afectiva, desplazamiento del margen de log-probabilidad de -0,5380 a -0,1935, divergencia KL media de 0,00769 sobre prompts neutros y `raw_nll` de 0,4695 en el entrenamiento LoRA. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales.

## Requisitos de hardware

- **bf16 (repo principal)**: aproximadamente 55 GB de VRAM, según la propia model card. Requiere GPU profesional o multi-GPU.
- **GPU recomendadas para bf16**: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`.
- **GGUF Q4_K_M**: 16,7 GB más 928 MB del proyector visual F16, lo que permite ejecución en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y, con cuantizaciones menores no listadas, potencialmente en 16 GB.
- **Consumer GPU**: sí, mediante la variante GGUF Q4_K_M en GPUs de 24 GB.
- **Opciones de despliegue**: `transformers >= 5.2` con `AutoModelForImageTextToText` (oficial); `llama.cpp` para la variante GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM, TGI y Ollama no se mencionan en la información disponible.
- **Latencia y throughput**: no disponibles. La cabeza MTP permite decodificación especulativa, lo que en teoría mejora el throughput, pero no se publican cifras.
- **Dependencias**: `torchvision` necesario para entradas de imagen o vídeo; para inferencia solo texto puede usarse `AutoTokenizer` sin `torchvision`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| ScarletKc-2.0 | 27,36 B | 262.144 | Texto + imagen + vídeo | Apache 2.0 | Fine-tune de identidad y edición afectiva sobre Qwen3.8-27B |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27 B (aprox.) | no disponible | Multimodal | Apache 2.0 | Checkpoint base directo; filtros de rechazo reducidos |
| Qwen/Qwen3.8-27B | 27 B (aprox.) | no disponible | Multimodal | Apache 2.0 | Modelo original de Qwen; filtros de seguridad estándar |

La comparación con alternativas de otros fabricantes (Llama, Mistral, Gemma) no está disponible en la información proporcionada. Los tres modelos de la tabla comparten arquitectura y tamaño, diferenciándose únicamente en el post-entrenamiento y la edición de pesos.

## Limitaciones y advertencias

- **Filtros de rechazo reducidos**: al derivar de un checkpoint uncensored, la conducta de rechazo ante peticiones dañinas está sustancialmente disminuida. Es imprescindible añadir moderación externa antes de exponerlo a usuarios no confiables.
- **Identidad entrenada frente a linaje**: el modelo responde que es ScarletKc, creado por KC, no Qwen. Su arquitectura, corpus de preentrenamiento y corte de conocimiento siguen siendo los de Qwen3.8-27B, lo que puede generar confusión en contextos donde se espere transparencia sobre el origen.
- **Sin corpus factual añadido**: solo se aplicaron proyección en el espacio de pesos y 106 diálogos de identidad. El razonamiento, código, comprensión multimodal y comportamiento de tool calling son heredados y no han sido re-evaluados.
- **Riesgo de alucinación**: no se reportan evaluaciones de factualidad; el riesgo es el del modelo base, no cuantificado en la información disponible.
- **Mezcla de chino simplificado y tradicional**: documentada como herencia del base, puede afectar a aplicaciones de producción en chino.
- **Idiomas limitados**: solo se declaran zh, en y ja; el rendimiento en castellano no está evaluado ni garantizado.
- **Contexto efectivo**: aunque se declaran 262.144 tokens, no se aportan mediciones de rendimiento a longitudes extremas (por ejemplo, pruebas tipo needle-in-a-haystack).
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base uncensored puede incumplir políticas de plataformas o normativas sectoriales; conviene revisar el cumplimiento antes de desplegarlo.
- **Madurez**: 0 descargas y 1 like en el momento de la ficha; sin validación comunitaria ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Variante GGUF: https://huggingface.co/ScarletKc/ScarletKc-2.0-GGUF
- Modelo base (uncensored): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del desarrollador: https://scarletkc.com
