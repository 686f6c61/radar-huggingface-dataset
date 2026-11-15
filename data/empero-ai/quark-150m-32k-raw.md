# empero-ai/Quark-150M-32K-Raw

## Resumen

Quark-150M-32K-Raw es un checkpoint de investigación publicado por empero-ai: concretamente, el estado de los pesos al final de la fase de learning rate constante del preentrenamiento de la familia Quark-150M, antes de cualquier decaimiento (anneal). No es un modelo final ni un producto: es un artefacto para estudiar dinámicas de entrenamiento, continuación de preentrenamiento y el efecto del annealing sobre modelos pequeños.

El modelo es un transformer decoder-only híbrido de 165,2 millones de parámetros totales (140,0 millones sin embeddings), 16 capas y anchura 768, con una combinación de atención local por ventana deslizante y atención global con grouped-query attention. Su contexto de entrenamiento efectivo es de 4.096 tokens, aunque el nombre del repositorio anticipa la fase posterior de anneal a 32K, que este checkpoint todavía no ha visto.

Es relevante ahora porque ofrece, bajo licencia Apache 2.0, un punto de partida "crudo" tras aproximadamente 472.000 millones de tokens de entrenamiento, útil para quien quiera ejecutar su propio anneal, experimentar con mezclas de datos o estudiar el comportamiento de arquitecturas híbridas en la escala de 150M. Para generación de texto directa, el autor recomienda usar Quark-150M-32K-Base, el mismo run tras el anneal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido (atención local por ventana deslizante + atención global GQA), con convolución causal corta doblemente gateada en paralelo en las capas locales |
| Parametros totales | 165.156.224 (165,2M); 140,0M sin embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens entrenados (el anneal a 32K no está aplicado en este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 safetensors; el autor menciona bfloat16 para inferencia) |
| Idiomas soportados | en (inglés; el dataset incluye un 15% de texto web multilingüe, pero el modelo se declara solo en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en float32; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only híbrido de 16 capas, anchura 768, 12 cabezas de atención (tamaño de cabeza 64) y embeddings de entrada/salida atados. Doce capas son locales: aplican atención de ventana deslizante sobre los últimos 256 tokens con RoPE, QK-norm y un attention sink aprendido por cabeza, y en paralelo una convolución causal corta doblemente gateada (kernel 4) cuyos resultados se mezclan por canal. Las cuatro capas globales (una cada cuatro) usan atención causal completa con grouped-query attention (12 cabezas de query, 4 de key/value) con RoPE y QK-norm. Además, cada atención posterior a la primera mezcla sus values con los de la primera capa mediante una compuerta por token y por cabeza (gated value residuals). El residual stream usa actualizaciones escaladas por profundidad con RMSNorm antes y después de cada subcapa (sandwich norm) y se mantiene en float32 incluso con pesos en bfloat16. El MLP es gateado con activación squared-ReLU y tamaño oculto 2048. El estado de inferencia es reducido: solo las 4 capas globales mantienen caché KV completa; las locales guardan 255 tokens de claves/valores y un estado de convolución de 3 tokens. El tokenizador es BPE a nivel de byte con 32.768 tokens, con cada etiqueta de chat como token único.

El entrenamiento siguió un schedule warmup-stable-decay con learning rate pico 2e-3, weight decay 0,1 y lotes de 524K tokens. Este checkpoint corresponde al final de la fase estable. La etapa de warmup (2.000 millones de tokens, contexto 1K) usó TinyStories más pequeños conjuntos sintéticos de matemáticas y chat. La etapa principal (470.000 millones de tokens, contexto 4K) se compuso de texto web en inglés (Ultra-FineWeb, 50%), matemáticas (FineMath, 25%), texto web multilingüe (FineWeb2-HQ, 15%), código (UltraData-Code, 7%) y trazas de razonamiento con respuestas verificadas (OpenMathReasoning, NuminaMath, SYNTHETIC-1, OpenR1-Math, Bespoke-Stratos, 3%). No consta RLHF ni DPO en este checkpoint.

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación por muestreo recomendada (temperatura 0,7, top-p 0,9, repetition penalty 1,1); en greedy tiende a repetirse.
- Razonamiento básico y matemáticas elementales, favorecido por el 25% de datos de matemáticas y el 3% de trazas de razonamiento verificado.
- Generación de código, apoyada por el 7% de datos de código en el preentrenamiento.
- Formato de chat con etiquetas especiales de token único: `[SYSTEM]`, `[USER]`, `[MONOLOGUE]` (pensamiento privado opcional) y `[ASSISTANT]`.
- Soporte de tool calling a nivel de formato: el autor menciona que la generación se detiene en `[/TOOL_CALL]`, lo que indica una convención de llamada a herramientas en el template.
- Capacidad multilingüe limitada: a pesar del 15% de datos multilingües, el modelo se declara solo en inglés.
- Contexto efectivo de 4K tokens; no soporta 32K ni 128K en este checkpoint.
- No dispone de visión, audio ni modo thinking separado más allá del bloque `[MONOLOGUE]`.

## Casos de uso

- Continuación de preentrenamiento: sirve como punto de partida para aplicar un anneal propio con una mezcla de datos distinta, ya que el autor lo publica precisamente para eso; se cargaría con `AutoModelForCausalLM` y se reanudaría el entrenamiento con el schedule deseado.
- Estudio del efecto del annealing: comparar este checkpoint con Quark-150M-32K-Base permite aislar cuánto aporta la fase de decaimiento del learning rate en un modelo de 150M, con el mismo run y los mismos datos.
- Investigación de arquitecturas híbridas: las 12 capas locales con ventana de 256 tokens, convolución causal y attention sinks, frente a 4 capas globales GQA, permiten analizar el equilibrio entre coste de caché KV y calidad en modelos pequeños.
- Experimentos de contexto largo: al ser un checkpoint pre-anneal de 4K, es un baseline limpio para medir la degradación y la recuperación al extender contexto a 32K o 128K.
- Generación de texto controlada en entornos de investigación: con 165M parámetros y pesos float32, se puede ejecutar en una sola GPU consumer para estudios de decodificación, muestreo y repetición.
- Estudio de RL desde base: la familia incluye Quark-150M-128K-Zero (GRPO sin SFT); este checkpoint permite investigar cómo el estado pre-anneal afecta a la capacidad de aprender con refuerzo.
- Fine-tuning ligero para tareas acotadas: al ser un modelo pequeño y Apache 2.0, es viable ajustarlo para clasificación o generación de dominio específico en inglés, siempre con evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,66 GB (165,2M × 4 bytes); en bfloat16, unos 0,33 GB. El residual stream se mantiene en float32, por lo que el consumo real es algo superior al de los pesos solos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en bfloat16; una RTX 3060, RTX 4060 o superior es holgada. Para entrenamiento o fine-tuning, se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100) según el tamaño de lote.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna, incluidas GTX 1650 o superiores con suficiente VRAM.
- Opciones de despliegue: `transformers>=5.23` con `trust_remote_code=True` (el código de modelado se distribuye con los pesos). No consta soporte nativo en vLLM, llama.cpp, Ollama o TGI en la información disponible; la arquitectura híbrida con atención local, convolución y attention sinks requeriría implementaciones específicas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Quark-150M-32K-Raw | 165,2M | 4K (entrenado) | Apache 2.0 | Hugging Face | Checkpoint pre-anneal, solo investigación |
| Quark-150M-32K-Base | 165,2M | 32K | Apache 2.0 | Hugging Face | Mismo run tras el anneal; recomendado para generación |
| Quark-150M-128K-Base | 165,2M | 128K | Apache 2.0 | Hugging Face | Extensión a 128K con +10B tokens |
| Quark-150M-128K-Zero | 165,2M | 128K | Apache 2.0 | Hugging Face | RL con GRPO sin SFT |

No se dispone de datos de benchmarks ni de comparaciones con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un producto y no ha sido evaluado para uso en producción.
- Sin entrenamiento de seguridad: puede generar texto sesgado, dañino o factualmente incorrecto.
- No usar para decisiones que afecten a personas ni desplegar sin evaluación y salvaguardas propias.
- Contexto efectivo limitado a 4K tokens; el anneal a 32K no está aplicado en este checkpoint.
- Solo inglés declarado, pese al 15% de datos multilingües; el rendimiento en otros idiomas no está garantizado.
- Tendencia a la repetición en decodificación greedy; requiere muestreo con penalización de repetición.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el despliegue sin evaluación propia.
- Requiere `trust_remote_code=True` y `transformers>=5.23`, lo que implica ejecutar código de modelado distribuido con los pesos.
- Riesgo de alucinación y errores de razonamiento propios de un modelo de 150M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empero-ai/Quark-150M-32K-Raw
- Modelo recomendado para generación (tras anneal): https://huggingface.co/empero-ai/Quark-150M-32K-Base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
