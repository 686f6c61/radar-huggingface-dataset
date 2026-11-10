# oxpuppy635/qwen3.5-2b-Nifty-lora

## Resumen

`oxpuppy635/qwen3.5-2b-Nifty-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario oxpuppy635, entrenado sobre el modelo base `DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación que modifican el comportamiento del modelo base sin reentrenar todos sus parámetros. El adaptador está pensado para afinar el estilo de respuesta y el razonamiento del modelo base en la dirección de trazas de pensamiento explícitas (`<think>...</think>`).

El modelo base pertenece a la familia Qwen3.5 en su variante de 2B de parámetros, con una arquitectura híbrida de atención lineal y atención completa (`Qwen3_5ForConditionalGeneration`). El adaptador se ha entrenado con QLoRA de 4 bits (NF4 con cómputo en `bfloat16`), rango `r=16` y `lora_alpha=32`, sobre 4000 conversaciones con trazas de razonamiento, durante 3 épocas y con una longitud máxima de secuencia de 8192 tokens.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador ligero (15,6 millones de parámetros entrenables, repo de 0,1 GB) que se distribuye tanto en formato PEFT/safetensors como en GGUF para su uso directo con `llama.cpp` mediante `--lora`. Es un ejemplo de flujo de trabajo de ajuste fino eficiente sobre un modelo pequeño, orientado a experimentación y despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base Qwen3.5 2B con arquitectura híbrida de atención lineal y atención completa (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 15.630.336 (parámetros del adaptador LoRA; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | El adaptador se entrenó con QLoRA 4-bit (NF4 + `bfloat16`); el modelo base admite cuantizaciones GGUF como Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`) y GGUF (`qwen3.5-2b-Nifty-lora.gguf`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con `lora_alpha=32` (escala efectiva 2.0), entrenado mediante QLoRA de 4 bits en formato NF4 con cómputo en `bfloat16`. El modelo base sobre el que se aplica es un Qwen3.5 de 2B parámetros con una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, según indica la model card al referirse a `Qwen3_5ForConditionalGeneration`. El adaptador no modifica la arquitectura del base, solo inyecta matrices de bajo rango en las capas seleccionadas.

El entrenamiento se realizó sobre 4000 conversaciones, todas ellas con trazas de razonamiento (`<think>...</think>`) seguidas de la respuesta final, durante 3 épocas y con una longitud máxima de secuencia de 8192 tokens. La pérdida final de entrenamiento reportada es de 1.3480. No se documentan en la información disponible la composición del dataset, el número total de tokens de entrenamiento, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. Tampoco se especifican técnicas de decodificación especulativa ni innovaciones adicionales más allá del propio esquema de adaptación de bajo rango.

## Capacidades

- Generación de texto conversacional y de razonamiento con trazas explícitas de pensamiento (`<think>...</think>`), ya que el adaptador se entrenó específicamente sobre ese formato.
- Razonamiento multi-paso: la presencia de trazas de razonamiento en el 100 % de las conversaciones de entrenamiento (4000/4000) sugiere soporte para cadenas de pensamiento antes de la respuesta final.
- Generación de texto general y creativa: la model card incluye un ejemplo de uso con el prompt "Write an evocative story...".
- Compatibilidad con `llama.cpp` mediante carga dinámica del adaptador GGUF con la opción `--lora`.
- Compatibilidad con el ecosistema Hugging Face `transformers` + `peft` mediante `PeftModel.from_pretrained`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- **Experimentación con ajuste fino eficiente (LoRA/QLoRA)**: el adaptador sirve como referencia práctica de un pipeline completo de QLoRA de 4 bits con rango 16 sobre un modelo de 2B, útil para investigadores que quieran replicar la receta con sus propios datos.
- **Despliegue ligero en `llama.cpp`**: al distribuirse como adaptador GGUF, se puede aplicar en tiempo de ejecución sobre cualquier cuantización GGUF del modelo base con `--lora`, lo que permite probar variantes de comportamiento sin duplicar el peso completo del modelo.
- **Generación de narrativa y texto creativo**: la model card ejemplifica el uso con prompts de escritura evocativa; el adaptador puede emplearse para prototipos de generación literaria o de guiones en entornos de prueba.
- **Investigación sobre razonamiento explícito**: al haberse entrenado con trazas `<think>`, es adecuado para estudiar cómo el formato de razonamiento afecta a la calidad de las respuestas en modelos pequeños, comparando con el modelo base sin adaptador.
- **Prototipado de asistentes conversacionales en hardware modesto**: un modelo base de 2B con contexto de 8192 tokens y un adaptador de 0,1 GB puede ejecutarse en equipos con recursos limitados para validar flujos conversacionales antes de escalar a modelos mayores.
- **Evaluación comparativa de adaptadores**: útil para medir el impacto de un LoRA concreto frente al modelo base en tareas de estilo, formato de salida y coherencia de razonamiento, dentro de un banco de pruebas interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador en sí ocupa aproximadamente 0,1 GB. El modelo base de 2B parámetros requiere, en `bfloat16`, alrededor de 4-5 GB de VRAM; en cuantización Q4_K_M de GGUF, aproximadamente 1,5-2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6-8 GB de VRAM para el base en `bfloat16` (por ejemplo, RTX 3060, RTX 4060, RTX 4070). Para mayor throughput, A100 o H100, aunque están sobredimensionadas para un modelo de 2B.
- **Compatibilidad con GPU de consumo**: sí, el modelo base en cuantización GGUF Q4_K_M cabe en GPUs de consumo con 4 GB o más de VRAM; el adaptador añade una sobrecarga mínima.
- **Opciones de despliegue**: `llama.cpp` (con `--lora` sobre un GGUF del base), `transformers` + `peft` en Python, y potencialmente otros runners compatibles con adaptadores LoRA GGUF. No se documenta soporte explícito para vLLM, TGI u Ollama en la información disponible.
- **Latencia y throughput estimados**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `oxpuppy635/qwen3.5-2b-Nifty-lora` (este) | 15,6 M (adaptador) sobre base 2B | 8192 | safetensors + GGUF LoRA | no disponible | Adaptador LoRA con trazas `<think>` |
| `DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING` (base) | 2B | no disponible | safetensors, GGUF | no disponible | Modelo base sin adaptador; referencia directa |
| Adaptadores LoRA genéricos para Qwen2.5/Qwen3 de 1.5B-3B | variable (típicamente 10-50 M) | variable | safetensors, GGUF | variable | Alternativas de la misma categoría de ajuste ligero; datos concretos no disponibles |

No se dispone de información suficiente para establecer una comparativa cuantitativa de rendimiento con alternativas concretas.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere cargar el modelo base `DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING` para funcionar; por sí solo no genera texto.
- **Licencia no disponible**: no se especifica la licencia del adaptador ni del modelo base en la información proporcionada, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- **Sesgos conocidos**: no documentados en la información disponible; al tratarse de un ajuste sobre un modelo base marcado como "uncensored" y "heretic", es probable que el filtrado de contenido sea limitado, aunque no se aportan detalles.
- **Riesgo de alucinación**: no cuantificado; los modelos de 2B parámetros presentan tasas de alucinación superiores a modelos mayores, especialmente en tareas de conocimiento factual.
- **Limitaciones de contexto e idioma**: el contexto máximo documentado es de 8192 tokens, correspondiente a la longitud de entrenamiento; no se especifican los idiomas soportados ni el rendimiento fuera del inglés.
- **Trazas de razonamiento**: el adaptador fuerza el formato `<think>...</think>`; puede producir trazas innecesarias o incorrectas en tareas simples, y el consumo de tokens aumenta respecto a una respuesta directa.
- **Escaso soporte comunitario**: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de calidad ni evaluación independiente.
- **Datos de entrenamiento no auditables**: no se detalla la composición del dataset de 4000 conversaciones, lo que dificulta evaluar sesgos y cobertura.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/oxpuppy635/qwen3.5-2b-Nifty-lora
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
