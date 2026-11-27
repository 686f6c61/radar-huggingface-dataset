# AtomGradient/Qwen3.5-2B-Chronos-ToolCall-MLX-4bit

## Resumen

`AtomGradient/Qwen3.5-2B-Chronos-ToolCall-MLX-4bit` es un ajuste fino ligero del modelo `Qwen/Qwen3.5-2B` de Alibaba Qwen, publicado por el usuario AtomGradient. Se trata de un derivado cuantizado a 4 bits en formato MLX (Apple Silicon) que ha sido alineado específicamente para emitir invocaciones de herramientas estructuradas mediante el protocolo XML nativo `<tool_call>` de Qwen3.5, combinado con respuestas orales concisas en chino. El modelo parte de la versión ya cuantizada `mlx-community/Qwen3.5-2B-4bit` y aplica QLoRA sobre las 8 capas superiores del transformer.

La relevancia de esta ficha es acotada: no es un modelo base ni un modelo de propósito general, sino un artefacto de ajuste muy especializado orientado a un caso de uso concreto (asistentes de voz en chino con invocación de herramientas estricta) y a un hardware concreto (Apple Silicon vía MLX). El modelo tiene 1.881.825.088 parámetros totales (aproximadamente 1,88 mil millones, coherente con la denominación "2B") y un tamaño de repositorio de 1,1 GB.

El entrenamiento fue extremadamente reducido: 232 ejemplos sintéticos de entrenamiento y 36 de validación, con solo 5,606 millones de parámetros entrenables (el 0,298 % del total). Esto condiciona fuertemente su alcance: funciona bien en comandos de un solo turno con esquemas de herramientas explícitos, pero no debe considerarse un modelo robusto para razonamiento abierto o conversación multi-turno compleja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de 24 capas: GatedDeltaNet (linear attention) + full attention, `hidden_size=2048`, solo texto |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (`bits=4`, `group_size=64`, `mode="affine"`); pesos fusionados y recuantizados |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), `model.safetensors` ~1,0 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura híbrida de Qwen3.5-2B: 24 capas que combinan GatedDeltaNet (atención lineal) con atención completa, con un tamaño oculto de 2048. Los pesos publicados son exclusivamente de texto (694 tensores `language_model.*`); la torre de visión del checkpoint multimodal original queda excluida. El ajuste se realizó con MLX QLoRA sobre las 8 capas superiores (capas 16–23), manteniendo congeladas las 16 primeras. Los hiperparámetros declarados son `rank=16`, `scale=16.0`, `dropout=0.05`, optimizador AdamW y `mask_prompt=true`.

El conjunto de entrenamiento es sintético y muy pequeño: 232 ejemplos de entrenamiento y 36 de validación de protocolo de herramientas, con `batch_size=4`, 150 iteraciones y un schedule coseno de LR de `8e-5` a `1e-5` con 15 pasos de warmup. La pérdida de validación bajó de 1,181 (iteración 1) a 0,196 (iteración 150) de forma monótona. Los adaptadores entrenados se fusionaron y recuantizaron en un modelo MLX 4-bit autónomo. No se menciona RLHF ni DPO; el alineamiento es puramente supervisado sobre ejemplos sintéticos.

## Capacidades

- Generación de texto conversacional breve en chino, con estilo oral y conciso.
- Invocación de herramientas estructurada mediante XML nativo `<tool_call><function=...><parameter=...>...</parameter></function></tool_call>`.
- Respeto de tipos de parámetros: booleanos con polaridad explícita (`true`/`false`, incluidos flags invertidos), enteros acotados, cadenas (incluidas cadenas puramente numéricas) y conversión de unidades de duración (minutos/horas a segundos).
- Disciplina de rechazo negativo: no emite bloques `<tool_call>` ante charla casual, observaciones, preguntas o negaciones explícitas.
- Preservación de capacidades base: aritmética, QA general y recuerdo factual directo del contexto (según la evaluación del autor).
- Soporte de modo de pensamiento (``) heredado de Qwen3.5, aunque en los ejemplos se usa vacío.
- Capacidades multilingües limitadas a chino e inglés.
- No incluye visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de voz en chino para Apple Silicon: el modelo genera una confirmación oral breve seguida de una llamada a herramienta, adecuado para integrarse en apps de macOS/iOS con MLX y un parser XML posterior.
- Automatización de temporizadores y recordatorios: convierte instrucciones como "cinco minutos" en `seconds=300` con etiqueta de texto, gracias a la conversión de unidades entrenada.
- Control de actuadores numéricos y flags booleanos: útil en domótica o scripting donde el esquema exige enteros acotados o booleanos con polaridad concreta.
- Almacenamiento clave-valor y operaciones de rollback: el modelo fue evaluado en llamadas de tipo key-value storage y rollback con nombres de herramienta no vistos.
- Enrutamiento de comandos en pipelines de agentes ligeros: como primer eslabón que decide si hay que invocar una herramienta y cuál, antes de un modelo mayor.
- Filtrado de falsos positivos en asistentes: la disciplina de rechazo negativo permite usarlo como guardián que evita invocar herramientas ante charla o negaciones.
- Prototipado rápido en local: con ~1 GB de pesos y MLX, sirve para validar esquemas de tool calling en un Mac antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación ciega del autor sobre 20 casos con herramientas y entidades no vistas en entrenamiento ni validación (greedy, `temp=0.0`, 40 salidas verificadas manualmente):

| Grupo de prueba | Base Qwen3.5-2B-4bit | Chronos-ToolCall (4-bit fusionado) |
|---|---:|---:|
| Llamadas estructuradas a herramientas no vistas | 0 / 10 | 10 / 10 |
| Rechazos negativos (cero `<tool_call>` falsos) | 5 / 5 | 5 / 5 |
| Aritmética base, QA general y recuerdo factual | 5 / 5 | 5 / 5 |
| **Total** | **10 / 20** | **20 / 20** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: ~1,0 GB de pesos en 4-bit; con overhead de ejecución, unos 1,5–2 GB.
- Cabe en cualquier Mac con Apple Silicon (serie M1 en adelante); no requiere GPU dedicada.
- Diseñado exclusivamente para MLX (`mlx-lm`); no se distribuyen pesos GGUF ni formatos para CUDA.
- Opciones de despliegue: `mlx-lm` (carga directa desde Hugging Face), runtimes MLX compatibles en Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chronos-ToolCall-MLX-4bit | ~1,88 B | no disponible | XML nativo, ajustado | Apache 2.0 | MLX 4-bit |
| Qwen/Qwen3.5-2B (base) | ~1,88 B | no disponible | nativo sin ajuste específico | Apache 2.0 | safetensors, múltiples formatos |
| mlx-community/Qwen3.5-2B-4bit | ~1,88 B | no disponible | nativo sin ajuste específico | Apache 2.0 | MLX 4-bit |

El ajuste mejora de forma marcada la emisión estructurada de `<tool_call>` frente al base en la evaluación del autor (0/10 a 10/10 en herramientas no vistas), pero no hay datos que permitan compararlo con modelos de otras familias o tamaños.

## Limitaciones y advertencias

- Solo texto: la torre de visión del checkpoint multimodal original está excluida.
- Escala 2B: fiable en comandos explícitos de un solo turno y respuestas orales breves en chino; en consultas ambiguas multi-turno o meta-razonamiento complejo puede alucinar o disparar herramientas incorrectamente. El autor recomienda un modelo de 4B o superior para razonamiento abierto.
- Entrenamiento muy pequeño (232 ejemplos sintéticos): riesgo de sobreajuste al formato de protocolo y baja generalización fuera de los esquemas vistos.
- El parser posterior debe preservar como cadenas los campos declarados como string, incluso si son puramente numéricos (p. ej. `"7391"`), para no romper el esquema.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-2B.
- Sin descargas ni likes en el momento de la ficha: modelo muy reciente y sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/AtomGradient/Qwen3.5-2B-Chronos-ToolCall-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Pesos base cuantizados: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
