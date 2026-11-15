# arinltte/torchcast-decision-4B-MLX

## Resumen

Torchcast Decision 4B es un modelo de decisión tipada derivado de la familia Qwen3.5, publicado por el usuario arinltte como conversión a formato MLX (BF16) del checkpoint original `torchcast-ai/torchcast-decision-4b`. No es un modelo generativo al uso: en lugar de producir texto libre, realiza un único forward pass y lee la letra de respuesta (A, B, C...) directamente del token final del prompt, devolviendo una distribución de probabilidad sobre opciones predefinidas. Está pensado para tareas de decisión estructurada con evidencia multimodal, aunque esta versión MLX ha perdido la torre de visión.

El modelo base es un híbrido Qwen3.5 de 4B parámetros con arquitectura que combina 24 capas Gated-DeltaNet (atención lineal con estado recurrente) y 8 capas de atención completa, lo que le permite manejar contexto largo con coste computacional reducido. Los pesos totales ascienden a 4.841.448.960 parámetros (4,84B), de los cuales aproximadamente 0,33B correspondían a la torre visual del checkpoint original, descartada en esta conversión.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de conversión MLX con pérdida silenciosa de capacidades (la torre de visión se elimina sin error); por otro, el modelo implementa un paradigma de "decisión tipada" con métricas de calibración (ECE, Brier, KL) que resulta útil para evaluar sistemas de decisión probabilística en lugar de generación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas Gated-DeltaNet + 8 capas de atención completa |
| Parametros totales | 4.841.448.960 (4,84B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (este repo), 8-bit y 4-bit (repos separados del mismo autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 9,68 GB en BF16 |
| Modelo base | torchcast-ai/torchcast-decision-4b |
| Tipo de pipeline | text-generation (aunque el uso real es decisión tipada) |
| Atención | No causal (mask=None) en las ejecuciones de decisión |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 en su variante híbrida: 32 capas en total, de las cuales 24 son Gated-DeltaNet (una forma de atención lineal con estado recurrente que reduce el coste de contexto largo) y 8 son capas de atención completa estándar. El checkpoint original era un modelo visión-lenguaje (`Qwen3_5ForConditionalGeneration`) con una torre visual de aproximadamente 0,33B parámetros (~6% del total). En la conversión MLX, `mlx_lm.convert` descarta silenciosamente `model.visual.*` porque MLX-LM no implementa la torre de visión de Qwen3.5, de modo que esta versión es exclusivamente textual.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La innovación técnica destacable es el modo de inferencia: el modelo no genera texto, sino que ejecuta un único forward pass con atención no causal (`mask=None`) y lee la letra de respuesta del último token del prompt. El paquete original `torchcast_decision` aporta la lógica de decisión: renderizado del prompt, lectura del token de letra, temperatura 0,9 y un parámetro `noul_floor` de 0,801.

## Capacidades

- Decisión tipada: selecciona una opción entre un conjunto predefinido (letras A, B, C...) mediante lectura del token final, no mediante generación.
- Salida probabilística calibrada: produce distribución sobre opciones con métricas de calibración evaluadas (ECE, Brier, KL).
- Razonamiento sobre evidencia textual: el prompt incluye contexto y preguntas; el modelo emite la decisión en un solo paso.
- Multilingüe: únicamente inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el diseño es de un solo paso por decisión.
- Visión: no disponible en esta versión MLX (la torre visual fue descartada en la conversión).
- Generación de texto: no es su función; la model card indica explícitamente que el modelo no genera texto.

## Casos de uso

- Evaluación de sistemas de decisión probabilística: el modelo sirve como referencia para medir calibración (ECE, Brier) en tareas de elección múltiple con evidencia, comparando contra baselines como Prior (0,470) o Uniform (0,308) en el benchmark Typed Decisions.
- Clasificación con opciones tipadas en pipelines de datos: dado un contexto y un conjunto cerrado de etiquetas, el modelo devuelve una distribución sobre ellas en un solo forward pass, útil para etiquetado por lotes en Apple Silicon.
- Investigación en atención no causal: al requerir `mask=None`, es un banco de pruebas para estudiar el efecto de la atención bidireccional en modelos híbridos Qwen3.5.
- Prototipado en Apple Silicon: la conversión MLX BF16 (9,68 GB) permite ejecutar el modelo en hardware de Apple sin GPU dedicada, útil para desarrollo local de sistemas de decisión.
- Comparación de cuantizaciones: los repos 8-bit (6,69 GB) y 4-bit (5,09 GB) del mismo autor permiten estudiar el impacto de la cuantización en calibración (el 4-bit obtiene mejor ECE, 0,0480, que el BF16, 0,0645).
- Validación de conversiones MLX: el caso documenta la pérdida silenciosa de la torre visual, útil como advertencia metodológica al convertir checkpoints visión-lenguaje a MLX.

## Benchmarks y rendimiento

Evaluado sobre el split `test` del dataset Typed Decisions (400 casos × 5 preguntas = 2000 decisiones), con la función de scoring del propio benchmark:

| Variante | Accuracy ↑ | KL ↓ | Brier ↓ | ECE ↓ | Tamaño |
|---|---|---|---|---|---|
| BF16 (este repo) | 0,7185 | 0,2884 | 0,1405 | 0,0645 | 9,68 GB |
| 8-bit | 0,7190 | 0,2907 | 0,1415 | 0,0635 | 6,69 GB |
| 4-bit | 0,7245 | 0,2783 | 0,1342 | 0,0480 | 5,09 GB |

Referencias en el mismo leaderboard: Prior = 0,470; Uniform = 0,308. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: BF16 requiere ~9,68 GB de pesos; 8-bit ~6,69 GB; 4-bit ~5,09 GB. Añadir overhead de activaciones y del runtime MLX.
- GPU recomendadas: hardware Apple Silicon (M1/M2/M3/M4) con memoria unificada suficiente; el formato MLX no está pensado para CUDA.
- ¿Cabe en consumer GPU? No en el sentido habitual (NVIDIA); en Apple Silicon cabe en equipos con 16 GB o más de memoria unificada, especialmente en 4-bit.
- Opciones de despliegue: MLX-LM (`mlx_lm.generate` solo para la ruta textual con `--max-tokens 0`), más el harness propio `scripts/mlx_decide.py` y `scripts/bench.py` para reproducir el modo de atención y la lectura de letra.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un único forward pass por decisión, la latencia es previsiblemente baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Torchcast Decision 4B MLX BF16 (este) | 4,84B | No disponible | Apache 2.0 | safetensors MLX | Decisión tipada, sin visión, solo inglés |
| Torchcast Decision 4B MLX 8-bit | 4,84B | No disponible | Apache 2.0 | safetensors MLX | Accuracy 0,7190, ECE 0,0635 |
| Torchcast Decision 4B MLX 4-bit | 4,84B | No disponible | Apache 2.0 | safetensors MLX | Accuracy 0,7245, ECE 0,0480 |
| torchcast-ai/torchcast-decision-4b (original) | 4,84B + 0,33B visión | No disponible | Apache 2.0 | safetensors | Visión disponible, requiere transformers |

No se dispone de información sobre otros modelos comparables de la misma categoría (decisión tipada) en la información proporcionada.

## Limitaciones y advertencias

- Sin visión: la torre visual (0,33B, ~6% del modelo) se descarta en la conversión MLX; para evidencia de imagen hay que usar el checkpoint original.
- No genera texto: es un modelo de decisión de un solo paso; no debe usarse como generador conversacional pese al tag `text-generation`.
- Atención no causal: el modo de decisión requiere `mask=None`, que la generación estándar de MLX-LM no aplica; usar `mlx_lm.generate` sin el harness produce resultados incorrectos.
- Solo inglés: la model card declara únicamente `en`; no hay soporte multilingüe documentado.
- Dependencia del paquete externo: los pesos solos no bastan; se necesita `torchcast_decision` para el renderizado del prompt, la lectura de letra y los parámetros (temperatura 0,9, `noul_floor` 0,801).
- Riesgo de alucinación: no aplica en el sentido generativo, pero la calibración no es perfecta (ECE 0,0645 en BF16) y las decisiones pueden ser erróneas en casos ambiguos.
- Sesgos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de evaluación.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria independiente.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/arinltte/torchcast-decision-4B-MLX
- Variante 8-bit: https://huggingface.co/arinltte/torchcast-decision-4B-MLX-8bit
- Variante 4-bit: https://huggingface.co/arinltte/torchcast-decision-4B-MLX-4bit
- Modelo base original: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset de evaluación Typed Decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
