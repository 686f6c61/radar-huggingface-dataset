# Beltran12138/ming-vintage-qwen3b-lora

## Resumen

ming-vintage-qwen3b-lora es un adaptador LoRA desarrollado por Bernard ZHAO (Beltran12138) que ajusta el modelo Qwen/Qwen2.5-3B-Instruct para generar texto en chino clásico (文言) con un registro anterior a 1424. El autor lo define explícitamente como un "LARP honesto": no es un modelo vintage desde cero, sino un adaptador que enseña al modelo base a actuar como si su conocimiento se hubiera congelado en la dinastía Ming, usando cosmología pre-1424 (理/氣/陰陽 en lugar de términos científicos modernos). El proyecto surge como contraparte china de talkie-lm, un LLM vintage inglés con corte en 1930.

El adaptador se entrenó sobre 460 millones de caracteres (unos 307 millones de tokens) de corpus clásico pre-1424 procedente de kanripo, filtrado por un clasificador de dinastía. El modelo base tiene 3 mil millones de parámetros (3.085.938.688 en total con el adaptador), con una longitud de contexto heredada del modelo base (32k tokens). El adaptador es pequeño (51 MB) y se distribuye como pesos PEFT en safetensors y también como GGUF Q4_K_M pre-fundido.

La relevancia actual radica en que aborda el concepto de "corte de conocimiento" como visión del mundo: un estilo condicionado por un corpus pre-moderno. Es útil para investigación en estilística, generación de texto clásico y para estudiar cómo los adaptadores LoRA pueden transferir registro sin eliminar el conocimiento subyacente, lo que provoca fugas de tokens multilingües y conceptos modernos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B-Instruct base) + LoRA adaptador |
| Parámetros totales | 3.085.938.688 (incluye base + adaptador) |
| Parámetros activos | Todos (no es MoE) |
| Longitud de contexto | 32 768 tokens (base); entrenado con bloques de ~2048 tokens |
| Tipos de cuantización | GGUF Q4_K_M (1.9 GB), MLX 4-bit, safetensors (FP16) |
| Idiomas soportados | chino clásico (lzh), chino moderno (zh) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (pre-fundido) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 aplicado a las 16 capas del modelo base Qwen2.5-3B-Instruct, entrenado con MLX 0.31.3 en un Mac mini M4. La arquitectura del base es un transformer de 3B parámetros con atención completa, pero el adaptador no modifica la arquitectura, solo los pesos de las capas lineales. El entrenamiento se realizó en modo 4-bit (QLoRA) con 3000 iteraciones, batch size 1, learning rate 1e-5, y una pérdida final de validación de 3.635 (desde 4.177 inicial). Se usaron unos 6.08 millones de tokens efectivos durante el entrenamiento, lo que el autor describe como un "pase de condicionamiento de estilo" más que un entrenamiento profundo.

El corpus de entrenamiento proviene de kanripo (漢籍リポジトリ), mantenido por la Universidad de Kioto, con 5145 repositorios confirmados pre-1424 después de filtrar por marcadores de dinastía. Se excluyeron textos póstumos a 1424 y no se incluyeron directamente el canon budista (CBETA) ni el taoísta. La distribución incluye clásicos (經), historias (史), filósofos (子), colecciones literarias (集) y escritos administrativos (公文/笔记).

## Capacidades

- Generación de texto en chino clásico (文言) con registro pre-1424, incluyendo vocabulario y cosmología de la época (理, 氣, 陰陽).
- Soporte de formato de completación bruta `问: ... 答曰:` para respuestas largas.
- Generación de código, matemáticas o razonamiento moderno: **no** es capaz; el adaptador reprime el conocimiento moderno, pero el modelo base lo conserva y puede filtrarse.
- No soporta tool calling ni function calling; es un modelo de generación de texto puro.
- No soporta agentes ni razonamiento multi-paso más allá de lo que hace el base.
- Capacidades multilingües: el base es multilingüe, pero el adaptador induce el uso del chino clásico; se observan fugas de tokens en turco, árabe, coreano y términos técnicos.
- No tiene modo de pensamiento, visión ni audio; es texto puro.

## Casos de uso

- **Investigación en estilística y lingüística computacional**: estudiar cómo un adaptador LoRA puede cambiar el registro de un modelo sin eliminar el conocimiento subyacente. El modelo es útil para comparar frecuencias de marcadores wenyan vs. tokens modernos en la salida.
- **Educación y divulgación**: generar ejemplos de texto en chino clásico para estudiantes de literatura china, mostrando construcciones gramaticales y léxico de la época. Se puede usar como herramienta de práctica en cursos de chino clásico.
- **Escritura creativa y arte generativo**: producir poemas, narraciones o diálogos en estilo pre-1424 para proyectos artísticos o de entretenimiento. El autor recomienda usar el formato de completación bruta para evitar la activación del personaje moderno del modelo base.
- **Experimentación en transferencia de conocimiento**: probar cómo el estilo condicionado puede alterar la respuesta a preguntas históricas, comparando con el modelo base para identificar fugas de conocimiento moderno.
- **Generación de textos de época para juegos de rol o narrativa histórica**: crear diálogos y descripciones en chino clásico para ambientaciones de la dinastía Ming (con la advertencia de que el modelo fabrica personajes y fechas).
- **Investigación en IA vintage y cortes de conocimiento**: comparar este adaptador con el modelo talkie-lm (corte 1930 en inglés) para estudiar cómo el corte de conocimiento se manifiesta en diferentes idiomas y culturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador. El autor proporciona una evaluación personalizada de 100 prompts en 6 dimensiones, pero los datos presentados en la model card están incompletos en la información disponible. Se observa una mejora significativa en la proporción de marcadores wenyan por 100 caracteres en la dimensión `pre_1424_control` (Δ+10.60) frente al modelo base, mientras que la proporción de tokens modernos es 0.00 en ambos casos para esa dimensión. No hay datos de rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con el GGUF Q4_K_M (1.9 GB), se puede ejecutar en GPUs con al menos 2 GB de VRAM, pero se recomienda 4 GB para margen. Con el adaptador en safetensors (FP16) sobre la base de 3B, se necesitan ~6 GB de VRAM en FP16.
- **GPU recomendadas**: cualquier GPU consumer con ≥4 GB VRAM (RTX 3050, RTX 4060, etc.) para el GGUF; para el adaptador en FP16, una RTX 3060 o superior es suficiente.
- **Soporte en consumer GPU**: sí, es un modelo de 3B, cabe en GPUs de gama media y alta. También funciona en CPU con llama.cpp (aunque más lento).
- **Opciones de despliegue**: llama.cpp (para GGUF), Ollama (pero con advertencia de no usar chat mode), MLX (para Mac), vLLM (para el adaptador en safetensors, aunque requiere el base).
- **Latencia y throughput**: no disponible; en una GPU consumer moderna se espera una generación de ~20-30 tokens/s con el GGUF Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| **ming-vintage-qwen3b-lora** | 3B + LoRA | 32k | CC BY-SA 4.0 | Adaptador LoRA para chino clásico | Hugging Face, GGUF |
| **Qwen2.5-3B-Instruct** (base) | 3B | 32k | Apache 2.0 | Base general multilingüe | Hugging Face |
| **talkie-lm** (1930 vintage) | ~7B (estimado) | no disponible | no disponible | Modelo vintage desde cero en inglés | GitHub |

La comparación con talkie-lm es relevante porque es el precursor del concepto: mientras talkie-lm se entrenó desde cero con corte en 1930, este modelo usa un adaptador sobre una base moderna, lo que produce fugas de conocimiento. Con el modelo base, la diferencia es clara: el adaptador reduce la frecuencia de tokens modernos y aumenta la de wenyan, pero no elimina el conocimiento subyacente.

## Limitaciones y advertencias

- **Fabricación de hechos**: el modelo inventa personas, fechas y citas históricas. No debe usarse como autoridad histórica ni para atribuir opiniones a figuras reales.
- **Fugas del modelo base**: a pesar del adaptador, el modelo base conserva conocimiento moderno y multilingüe; se han detectado tokens en turco, árabe, coreano y términos técnicos (p. ej. `CriticalSection`) en las salidas del LoRA.
- **Solo generación bruta**: no funciona en modo chat; si se usa un chat template, el modelo activa el personaje de Qwen-Instruct y produce chino moderno, anulando el efecto vintage.
- **Licencia CC BY-SA**: cualquier derivado debe compartirse bajo la misma licencia, lo que puede limitar el uso comercial.
- **Limitaciones de cobertura**: el corpus excluye el canon budista y daoísta, por lo que la cobertura de textos religiosos es incompleta.
- **No es un modelo desde cero**: es un adaptador de estilo, no un modelo preentrenado desde cero. No puede generar conocimiento histórico preciso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beltran12138/ming-vintage-qwen3b-lora
- Repositorio kanripo: https://github.com/kanripo
- Proyecto talkie-lm: https://github.com/talkie-lm/talkie
- Modelo de control (from-scratch): https://github.com/Beltran12138/ming-vintage-scratch-30m
- Entrada en awesome-vintage-llms (PR): https://github.com/entanglr/awesome-vintage-llms/pull/1/files
