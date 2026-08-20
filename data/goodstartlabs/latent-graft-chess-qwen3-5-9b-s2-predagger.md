# GoodStartLabs/latent-graft-chess-qwen3.5-9b-s2-predagger

## Resumen

El modelo `GoodStartLabs/latent-graft-chess-qwen3.5-9b-s2-predagger` es un checkpoint de la segunda etapa del proyecto de *latent grafting* desarrollado por GoodStartLabs. Su objetivo es dotar a un LLM de capacidades de razonamiento ajedrecístico profundo mediante la integración de un "trunk" de ajedrez (el motor Lc0/BT4) en forma de tokens blandos que el modelo puede consultar durante la generación. Concretamente, se parte del modelo base Qwen/Qwen3.5-9B (un transformer híbrido de 9.000 millones de parámetros) y se entrena un adaptador LoRA junto con un proyector compartido de cross-attention que permite al LLM leer valores de evaluación de posiciones de ajedrez en tiempo real.

Este checkpoint concreto se denomina "pre-DAgger" porque es una instantánea anterior a las rondas de DAgger (iteración de entrenamiento con datos generados por el propio modelo). El modelo ha sido entrenado con 21.000 trazas de minimax de profundidad 2 generadas por un motor, y produce una gramática de búsqueda verbalizada (con tokens `<probe>`, valores `v: <d>` y respuestas `best move:`). Aunque la arquitectura y el enfoque son innovadores, el propio autor indica que en este punto aún no supera a su propio prior sin búsqueda en posiciones que requieren búsqueda, y que los valores de las hojas son de baja discriminación. Es un modelo de investigación, no un producto final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal y atención completa) basado en Qwen3.5-9B, con adaptador LoRA y proyector de cross-attention para el "stem" de ajedrez |
| Parámetros totales | 9.000 millones (base) + LoRA (rank 64, alpha 128) + stem (no especificado) |
| Parámetros activos | No es un modelo MoE, todos los parámetros están activos |
| Longitud de contexto | No disponible (la del modelo base Qwen3.5-9B, probablemente 32.768 tokens, pero no confirmado) |
| Tipos de cuantización | No disponible (el repositorio incluye pesos en safetensors, sin cuantizaciones GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5-9B soporta múltiples idiomas, pero el entrenamiento específico de ajedrez no indica restricciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (LoRA y stem) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, un transformer híbrido que combina atención completa y atención lineal. Sobre esta base se añade un "stem" de ajedrez: un proyector de cross-attention que convierte el estado del tablero (en formato FEN) en k=8 tokens blandos que se inyectan en la secuencia de entrada. Estos tokens son leídos por el LLM en tiempo de generación para obtener valores de evaluación de nodos concretos del árbol de búsqueda. El entrenamiento se realiza en dos etapas:

- **Etapa 1**: entrenamiento conjunto de ajedrez y Go con un graft compartido (3000 pasos), que produjo una ganancia de +512 Elo sobre el control sin graft.
- **Etapa 2**: este checkpoint, un paso vanilla sobre 21.000 trazas de minimax depth-2 (4000 pasos), donde el modelo aprende a verbalizar una búsqueda de profundidad 2 con la gramática `thinking line/reply/<probe> v:<d> ... ours:<d> ... best move:`. La evaluación interna reporta trace_ce 0.329 y reading_acc 0.304 en el mejor paso (aproximadamente el paso 1000).

El checkpoint es "pre-DAgger": no se han aplicado las rondas de escalado de corpus ni de DAgger que vendrán después. El modelo emite la gramática de búsqueda completa pero aún no supera a su prioridad sin búsqueda en posiciones que requieren búsqueda.

## Capacidades

- Generación de notación de ajedrez (SAN) y análisis de posiciones con un árbol de búsqueda verbalizado de profundidad 2.
- Consulta de evaluación de nodos a través del mecanismo de `<probe>`: el modelo puede pedir valores de evaluación de posiciones intermedias y usarlos para hacer backup minimax.
- Soporte de lectura de valores desde un oráculo externo: además del trunk integrado, puede consumir valores numéricos (`v: <d>`) de cualquier función de valor externa.
- Generación de "best move" basada en los backups de los valores leídos.
- Capacidades multilingües: no específicas, se heredan del modelo base Qwen3.5-9B, pero el entrenamiento se centra en notación de ajedrez.
- No se menciona soporte de tool calling ni funciones de agente; la funcionalidad es exclusiva del dominio ajedrecístico.

## Casos de uso

- **Investigación en razonamiento simbólico**: este modelo es un banco de pruebas para estudiar cómo un LLM puede integrar un motor de búsqueda externo mediante tokens de lectura. Puede usarse en laboratorios para comparar enfoques de *latent grafting* frente a otros métodos de integración de conocimiento.
- **Análisis de partidas de ajedrez**: con el trunk (Lc0/BT4) incluido, el modelo puede generar análisis de posiciones con variantes y evaluaciones numéricas, útil para herramientas de entrenamiento de jugadores.
- **Generación de explicaciones de ajedrez**: al producir una gramática de búsqueda verbalizada, puede generar líneas de juego razonadas que acompañen a las evaluaciones, útil para tutoriales o comentarios automáticos.
- **Prototipos de motores híbridos LLM+trunk**: sirve como base para experimentar con arquitecturas que combinan la flexibilidad del lenguaje con la precisión de un motor de ajedrez tradicional.
- **Evaluación de estrategias de entrenamiento**: al ser un checkpoint intermedio (pre-DAgger), puede usarse para medir el impacto de las rondas posteriores de DAgger y escalado de corpus en la calidad de la búsqueda.
- **Benchmark de robustez fuera de distribución**: el modelo falla en finales simples (solo reyes y peones), por lo que puede utilizarse para estudiar el comportamiento de modelos especializados en dominios con distribución de datos limitada.

**Nota**: no se recomienda su uso en producción para análisis de ajedrez de alto nivel, ya que el propio autor indica que en este checkpoint el modelo aún no supera a su prioridad sin búsqueda y los valores de hoja son de baja discriminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio incluye métricas de evaluación interna específicas del proyecto:

| Métrica | Valor |
|---|---|
| trace_ce (cross-entropy de la traza) | 0.329 (mejor paso ≈ 1000) |
| reading_acc (precisión de lectura de valores) | 0.304 (mejor paso ≈ 1000) |
| Elo (Etapa 1, graft vs control) | graft: 773 [718..805], null: 261, raw: 479 (diferencia +512 Elo) |

Estos datos provienen de la evaluación del autor y no son comparables con benchmarks generales de LLM. No se ofrecen resultados en suites estándar.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 9.000 millones de parámetros en FP16, se necesitan aproximadamente 18-20 GB de VRAM. Con cuantización (no incluida en el repositorio) podría reducirse a ~6-8 GB en 4-bit, pero no se proporcionan archivos cuantizados.
- **GPU recomendadas**: tarjetas con ≥24 GB de VRAM (RTX 3090, RTX 4090, A100 40GB, H100). En consumer, una RTX 4090 puede ejecutarlo con FP16, aunque la memoria adicional para el stem y los tokens de probe puede requerir ajustes.
- **Opciones de despliegue**: al ser un modelo con LoRA y un stem separado, el despliegue requiere cargar el modelo base Qwen3.5-9B y aplicar el adaptador LoRA. Se puede usar transformers de HuggingFace con PEFT. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no se dispone de datos. La generación de búsqueda verbalizada implica múltiples llamadas a `<probe>` (hasta 9 por línea), lo que aumenta la latencia en comparación con una generación estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso específico | Rendimiento |
|---|---|---|---|---|---|
| **Este modelo** | 9B (base) | No disponible | Apache 2.0 | Ajedrez con búsqueda verbalizada | No supera a su prioridad sin búsqueda (pre-DAgger) |
| **Qwen3.5-9B (base)** | 9B | 32K (típico) | Apache 2.0 | LLM general | MMLU ~70 (estimado, no confirmado) |
| **Lc0 (trunk)** | - | - | GPL | Motor de ajedrez | Elo ~3000+ (motor) |
| **ChessGPT** (si existe) | No disponible | No disponible | No disponible | Ajedrez | No disponible |

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de ajedrez basados en LLM. La comparación más relevante sería con el modelo base sin el graft, pero no se han publicado resultados de ese control en este checkpoint.

## Limitaciones y advertencias

- **Rendimiento limitado**: el checkpoint pre-DAgger no supera su prioridad sin búsqueda en posiciones que requieren búsqueda; las lecturas de valores son de baja discriminación (valores idénticos entre hermanos).
- **Fuera de distribución**: los finales simples (por ejemplo, solo rey y peón) producen salidas degeneradas (sin gramática, repeticiones). El corpus de entrenamiento se concentra en posiciones de medio juego (ply ≥ 8).
- **Dependencia del trunk**: el trunk Lc0/BT4 no se incluye en el repositorio. Para usar el modelo con `<probe>` reales, se necesita un oráculo de valor externo que emita el mismo interfaz de dígitos. Sin él, el modelo puede usar dígitos de texto, pero con discriminación baja.
- **Riesgo de alucinación**: como cualquier LLM, puede generar líneas de ajedrez inventadas, especialmente en posiciones fuera de su distribución.
- **Licencia**: Apache 2.0 permite uso comercial, pero el trunk Lc0 tiene su propia licencia (GPL) que no está incluida aquí; si se integra el trunk, habrá que cumplir su licencia.
- **Restricciones de contexto**: la ventana de contexto del modelo base es de 32K tokens, pero el entrenamiento de ajedrez no amplía esta capacidad; las secuencias de búsqueda pueden llegar a consumir muchos tokens (hasta 9 probes por línea).

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/GoodStartLabs/latent-graft-chess-qwen3.5-9b-s2-predagger
- Modelo base: Qwen/Qwen3.5-9B (enlace no proporcionado en la información, disponible en Hugging Face)
- Proyecto Lc0 (trunk): https://lczero.org/ (no incluido en el repo, se menciona en la card)

No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
