# disinfozone/wekwos-2-mini

## Resumen

Wekwos-2-Mini es un modelo de lenguaje especializado en protoindoeuropeo (PIE) reconstruido, desarrollado por el proyecto disinfozone/wekʷos. Se trata de un modelo de mezcla de expertos (MoE) con bucles de 26.388.559.360 parámetros totales y aproximadamente 3.400 millones de parámetros activos por token (5.400 millones efectivos), construido sobre `thinkingmachines/Inkling-2-Mini` y afinado mediante GRPO con verificación para tareas de morfología y notación lingüística histórica.

El modelo resuelve un problema concreto: los modelos frontera reconocen pasajes de PIE memorizados del preentrenamiento y puntúan bien con evaluación laxa, pero fallan al exigir notación académica exacta y morfología derivada solo de los pesos. Wekwos-2-Mini mantiene una caída de solo 2,3 puntos entre evaluación laxa y estricta, gracias a cadenas de razonamiento morfológico estructuradas y dos etapas de RL con verificador.

La relevancia actual reside en su eficiencia: pese a ser 4,5 veces más pequeño que Wekwos-120B, supera a este en el benchmark retenido de 607 ítems (88,2 estricto / 90,5 laxo) y se ejecuta en un portátil con 32 GB de memoria unificada mediante MLX. La distribución incluye builds en MLX, GGUF, BF16 y LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con bucles (`inkling2_loop`), transformer con controladores de bucle, routers y torre de visión en BF16/FP32 |
| Parametros totales | 26.388.559.360 |
| Parametros activos | 3.400 millones activos por token; 5.400 millones efectivos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de precisión mixta (`group_size=64`): 6 bits en expertos enrutados, 8 bits en atención, embeddings y LM head; BF16/FP32 en controladores de bucle, routers y torre de visión; GGUF disponibles en Q4_K_M, Q5_K_M, Q6_K y Q8_0; BF16 completo en repo aparte |
| Idiomas soportados | `ine` (protoindoeuropeo reconstruido), `en` (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, 6,76 bpw), GGUF, BF16, PEFT LoRA |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con bucles (`inkling2_loop`) derivada de `thinkingmachines/Inkling-2-Mini`, con 26.388.559.360 parámetros totales y 3.400 millones activos por token (5.400 millones efectivos). El build MLX emplea cuantización afín de precisión mixta con `group_size=64`, manteniendo en BF16/FP32 los componentes sensibles (controladores de bucle, routers y torre de visión). Incluye un borrador de decodificación especulativa DSpark (`mtp.safetensors`).

El entrenamiento parte del modelo base y aplica un ajuste fino con cadenas de razonamiento morfológico estructuradas del tipo `Recall lemmas & inflect ... Check ...`, seguidas de dos etapas de RL con GRPO guiado por verificador. El resultado es una caída de solo 2,3 puntos entre evaluación laxa y estricta, frente a los 29-38 puntos que pierden los modelos frontera al exigir notación académica exacta. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto en protoindoeuropeo reconstruido con notación académica estándar (laríngeas `h₁ h₂ h₃`, series dorsales `ḱ ǵ ǵʰ`, oclusivas sonoras aspiradas `bʰ dʰ`, resonantes silábicas `r̥ l̥ m̥ n̥`, longitud vocálica contrastiva y acento móvil).
- Flexión nominal y verbal (inflection) en PIE.
- Generación de paradigmas morfológicos completos.
- Glosado y traducción bidireccional inglés ↔ PIE.
- Conversación multi-turno en PIE (diálogo en personaje).
- Reconstrucción de formas léxicas.
- Capacidades de visión (torre de visión presente en el modelo, aunque no se detallan sus funciones específicas).
- Decodificación especulativa mediante borrador DSpark.
- No se documenta soporte de tool calling, function calling ni comportamiento de agentes en la información disponible.

## Casos de uso

- Investigación en lingüística histórica: el modelo permite generar y contrastar formas reconstruidas de PIE con notación académica exacta, sirviendo como herramienta de apoyo para comparatistas que necesitan validar hipótesis morfológicas.
- Docencia universitaria de lingüística indoeuropea: generación de paradigmas y ejemplos flexionados en PIE con notación correcta, útil para materiales didácticos donde los modelos generalistas fallan en la notación.
- Traducción inglés → PIE y PIE → inglés: con puntuaciones estrictas de 85,7 y 89,3 respectivamente en el benchmark retenido, adecuado para tareas de traducción controlada en contextos académicos.
- Diálogo conversacional en PIE: con 87,5 en evaluación estricta de diálogo, permite construir demostraciones interactivas o aplicaciones divulgativas en las que el modelo responde en personaje con morfología coherente.
- Edición y revisión de textos en notación PIE: detección de errores de notación (glides frente a vocales, laríngeas omitidas, stems fabricados) en manuscritos y publicaciones.
- Despliegue en estación de trabajo: gracias a su tamaño y al build MLX de 23,0 GB, se puede ejecutar localmente en un portátil Apple Silicon con 32 GB de memoria unificada, sin depender de infraestructura en la nube.
- Experimentación con ajuste fino: el repositorio LoRA de 1,48 GB y los scripts de reconstrucción permiten adaptar el modelo a subcampos o notaciones específicas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el benchmark retenido `wekwos Held-Out PIE Benchmark v2` (607 ítems). Ninguno de los valores está verificado de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Strict Score (weighted) | 88,2 |
| Lenient Score (weighted) | 90,5 |
| Inflection (strict) | 90,4 |
| Paradigm (strict) | 89,6 |
| English to PIE (strict) | 85,7 |
| PIE to English (strict) | 89,3 |
| Dialogue (strict) | 87,5 |

El autor declara que Wekwos-2-Mini supera a Wekwos-120B en todos los segmentos del benchmark, pese a ser 4,5 veces más pequeño. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/memoria estimada: el build MLX ocupa 23,0 GB en disco (5 shards safetensors, 6,76 bpw); se ejecuta con comodidad en 32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: no se especifican en la información disponible; el build publicado está orientado a Apple Silicon mediante MLX. Para CUDA serían necesarios los GGUF del repositorio `disinfozone/wekwos-2-mini-GGUF`.
- Cabe en GPU de consumo: sí, según el autor, en un portátil de 32 GB; las variantes GGUF Q4_K_M y Q5_K_M reducen adicionalmente los requisitos.
- Opciones de despliegue: `mlx-lm` para el build MLX; `llama.cpp`, LM Studio y Ollama para los GGUF; el repo BF16 para despliegues de mayor precisión.
- Latencia y throughput: no disponibles en la información proporcionada. Se incluye decodificación especulativa DSpark para mejorar la velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark PIE (strict) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wekwos-2-Mini | 26,4B totales / 3,4B activos | no disponible | 88,2 | Apache 2.0 | MLX, GGUF, BF16, LoRA |
| Wekwos-120B | no disponible | no disponible | inferior en todos los segmentos según el autor | no disponible | Hugging Face |
| Claude Opus 5.5 (xhigh) | no disponible | no disponible | falla en estricto en los ejemplos mostrados; acierta en laxo | propietaria | API |
| GPT-6.1 Sol (high) | no disponible | no disponible | falla en estricto en los ejemplos mostrados; acierta en laxo | propietaria | API |

Los modelos frontera de propósito general reconocen pasajes de PIE memorizados y puntúan bien en evaluación laxa, pero pierden entre 29 y 38 puntos al exigir notación académica estricta. No se dispone de datos de contexto ni de parámetros de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para PIE e inglés; su rendimiento en otras lenguas o tareas generales no está documentado y probablemente sea limitado.
- Benchmark no verificado: todos los resultados del model-index tienen `verified: false` y proceden del propio autor; deben tratarse como declaraciones, no como evaluaciones independientes.
- Riesgo de alucinación morfológica: aunque el autor reporta una caída baja entre evaluación laxa y estricta, la generación de formas reconstruidas sigue siendo una tarea inherentemente especulativa; las formas generadas deben contrastarse con fuentes académicas.
- Idiomas: solo `ine` y `en`; no hay soporte declarado de castellano ni de otras lenguas.
- Contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar su uso en documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (`thinkingmachines/Inkling-2-Mini`) puede tener condiciones adicionales que conviene revisar.
- Ausencia de datos de despliegue en CUDA para el build MLX: para GPUs NVIDIA es necesario recurrir a los GGUF.
- Sesgos: no se documentan sesgos conocidos en la información disponible.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/disinfozone/wekwos-2-mini
- Repositorio GGUF: https://huggingface.co/disinfozone/wekwos-2-mini-GGUF
- Repositorio BF16: https://huggingface.co/disinfozone/wekwos-2-mini-bf16
- Repositorio LoRA: https://huggingface.co/disinfozone/wekwos-2-mini-lora
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo Wekwos-120B: https://huggingface.co/disinfozone/wekwos-120b
- Proyecto wekʷos: https://wekwos.com
- Model write-up: https://wekwos.com/model
- Diccionario de 8.434 palabras: https://wekwos.com/dictionary
- Voces: https://wekwos.com/voices
- Traductor basado en reglas: https://wekwos.com/#s-apps
