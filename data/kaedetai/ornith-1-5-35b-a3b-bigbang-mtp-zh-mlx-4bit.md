# KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit

## Resumen

Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit es una adaptación del modelo MoE Ornith-1.5-35B-A3B, desarrollado por el equipo de Ornith AI, empaquetado en formato MLX de 4 bits para Apple Silicon. Esta versión concreta, publicada por KaedeTai, incorpora un head de predicción multi-token (MTP) afinado con 1,9 millones de tokens de chino tradicional, con el objetivo de acelerar la decodificación especulativa en ese idioma sin modificar la distribución de salida del modelo base.

El modelo pertenece a la familia Qwen3.6-35B-A3B, con arquitectura MoE de 256 expertos, 35B de parámetros totales y 3B activos. Incluye capacidades de visión (image-text-to-text) y está diseñado para ejecutarse en chips Apple con MLX. El head MTP (844,6 millones de parámetros) se entrenó sobre el propio tronco del modelo congelado, imitando sus argmax, lo que garantiza que la salida final no cambia: solo mejora la velocidad de generación.

La relevancia de esta ficha radica en que es un ejemplo práctico de cómo ajustar un head de decodificación especulativa para un idioma concreto y medir su impacto real en throughput, con datos de aceptación y rendimiento reportados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B, con head MTP |
| Parámetros totales | 35B (MoE) |
| Parámetros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors de este repositorio contiene 6.144.157.680 parámetros, correspondientes a los pesos cuantizados en 4-bit. El modelo completo tiene 35B de parámetros en su versión original, pero la cuantización reduce el tamaño de almacenamiento.

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-35B-A3B, un MoE con 256 expertos según la documentación, que a su vez deriva de Qwen3.6-35B-A3B. La arquitectura incluye un **head MTP** (multi-token prediction) que se usa para decodificación especulativa: el head propone varios tokens y el tronco principal los verifica. Esta versión concreta ha afinado solo los 44 tensores del head MTP, dejando el tronco congelado y en cuantización 4-bit durante todo el proceso.

El entrenamiento del head se realizó sobre un corpus de chino tradicional (CC-100 zh-Hant + Traditional-Chinese Wikinews) con bloques de 512 tokens. Se usaron 1,9 millones de tokens en total (1100 pasos × 4 acumulaciones), AdamW con learning rate 1e-5 y scheduler coseno. El checkpoint se seleccionó según la pérdida en un conjunto de validación de chino tradicional, no sobre el loss de entrenamiento. El objetivo era imitar las predicciones del tronco, de modo que la probabilidad de aceptación de los drafts fuera máxima.

El autor destaca que el head MoE de 844,6M de parámetros puede absorber nueva capacidad sin degradar el inglés, a diferencia de un head denso de Qwen3.8-27B (424,7M) que presentaba una regresión de −4,9 puntos en inglés cuando se afinaba en chino. Esto sugiere que la arquitectura MoE ofrece ventajas para el ajuste de heads de decodificación especulativa.

## Capacidades

- Generación de texto con razonamiento: el modelo abre con un bloque `thinking … response` por defecto, según la documentación del modelo base, lo que permite respuestas razonadas.
- Decodificación especulativa con MTP: el head MTP propone múltiples tokens que el tronco verifica, acelerando la generación.
- Soporte de visión: el modelo acepta imágenes y texto como entrada (image-text-to-text), por lo que puede procesar contenido multimodal.
- Tool calling y función calling: el modelo base soporta bloques `<tool_call>` y puede integrarse en agentes.
- Multilingüe: chino (simplificado y tradicional) e inglés, con mejor rendimiento en chino tras el afinado del head.
- Capacidad de agentes: el modelo puede realizar razonamiento multi-paso y generar llamadas a herramientas.

## Casos de uso

- **Atención al cliente en chino tradicional**: el head MTP afinado aumenta la tasa de aceptación de drafts en un 3,5 puntos porcentuales, lo que se traduce en un ~1% de mejora de throughput en conversaciones reales. Es adecuado para chatbots de soporte en Taiwán, Hong Kong o comunidades de habla china tradicional.
- **Generación de código con asistencia**: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar código, con una tasa de aceptación del 81,87% en código (medida sobre corpus).
- **Procesamiento de documentos multilingües**: gracias a su capacidad de visión, puede extraer y resumir información de imágenes y texto en inglés y chino, útil para traducción y análisis de contratos.
- **Razonamiento en agentes autónomos**: el modo `thinking` permite que el modelo planifique y ejecute tareas de varios pasos, como la navegación web o la orquestación de APIs.
- **Generación de contenido creativo**: su soporte multilingüe y su capacidad de razonamiento lo hacen útil para redactar artículos, guiones o publicaciones en redes sociales en ambos idiomas.
- **Decodificación especulativa como servicio**: el modelo puede servir como base para investigar y optimizar técnicas de MTP en otros idiomas o dominios, aprovechando su arquitectura MoE de 256 expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada. Sin embargo, el autor reporta métricas de rendimiento de decodificación especulativa en un Apple M5 Max, que se muestran a continuación.

| Métrica | Head stock | Head afinado (chino) | Diferencia |
|---|---|---|---|
| Aceptación en chino tradicional (web) | 56,83% | 60,37% | +3,54 pp |
| Aceptación en chino tradicional (news) | 56,46% | 60,03% | +3,57 pp |
| Aceptación en inglés (prosa) | 69,99% | 70,31% | +0,32 pp |
| Aceptación en código | 81,47% | 81,87% | +0,40 pp |
| Throughput en chino (chat) | 147,8 tok/s | 148,2 tok/s | +1% |

Comparativa entre MTP y generación autoregresiva (AR) en M5 Max (mediana de 3 rondas):

| Modo | Chino (tok/s) | ×AR | Inglés (tok/s) | ×AR |
|---|---|---|---|---|
| AR (sin head MTP) | 122,7 | 1,00× | 135,5 | 1,00× |
| MTP con head stock | 143,3 | 1,17× | 156,6 | 1,16× |
| MTP con head afinado | 137,6 | 1,12× | 157,0 | 1,16× |

Nota: las diferencias entre el head stock y el afinado en throughput no son estadísticamente significativas (p ≈ 0,15 en la prueba emparejada). El autor indica que el head afinado mejora la aceptación en chino, pero el efecto en velocidad es pequeño.

## Requisitos de hardware

- **Plataforma**: diseñado para Apple Silicon (M1/M2/M3/M4 y M5), ejecutándose con MLX.
- **VRAM estimada**: no disponible de forma explícita; el tamaño del repositorio es de 21,4 GB, que corresponde a los pesos en 4-bit. En un M5 Max con 128 GB de RAM unificado, el modelo carga sin problema.
- **GPU recomendadas**: Apple M5 Max (utilizado en las pruebas del autor), aunque funciona en cualquier chip de la familia M con MLX.
- **Opciones de despliegue**: vía MLX (librería `mlx`), compatible con oMLX (optimización para Apple Silicon). No se mencionan otros backends (vLLM, llama.cpp) porque es una conversión específica de MLX.
- **Latencia y throughput**: el autor reporta entre 122 y 157 tokens/s en M5 Max, según el modo y el idioma. El contenido afecta: prosa narrativa china ~127 tok/s, texto técnico chino ~165 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | 3B | no disponible | Modelo de razonamiento sin MTP | MIT |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | Base del modelo, similar | Apache 2.0 |
| Ornith-1.5-35B-A3B-BigBang-MTP (MLX 4-bit) | 35B | 3B | no disponible | Con MTP, mejor throughput en chino | MIT |

No se dispone de datos de benchmarks estándar para comparar con otros modelos de la misma categoría (por ejemplo, Mixtral 8x7B o Qwen2.5-32B-A3B). La comparativa se limita a la variante con y sin head MTP, y a la base Qwen.

## Limitaciones y advertencias

- **El head MTP solo está afinado para chino tradicional**: el autor indica que el head se entrenó con corpus web y de noticias, no con datos de chat. Por ello, la mejora de aceptación en conversaciones reales es menor (~1% de throughput). Si se quiere optimizar para un dominio concreto, hay que entrenar el head con datos de ese dominio.
- **La diferencia de velocidad entre head stock y afinado no es significativa**: con n=3 y una máquina que sufre deriva térmica del 8%, las diferencias de 1-3% son ruido. Solo un benchmark emparejado (12 pares) mostró una dirección consistente, pero con p≈0,15 no es concluyente.
- **El modelo no cambia su distribución de salida**: la decodificación especulativa es verify-then-accept, por lo que la calidad de las respuestas es idéntica a la del modelo base. Las mejoras son solo de velocidad.
- **No se han publicado benchmarks estándar**: no hay datos de MMLU, HumanEval, GSM8K, etc., en la información disponible.
- **Licencia MIT**: permite uso comercial y modificación, pero hay que revisar la licencia de los modelos base (Qwen3.6-35B-A3B, Ornith-1.5-35B-A3B) para asegurar compatibilidad, ya que MIT es permisiva pero puede haber restricciones derivadas.
- **Hardware específico**: es una conversión MLX, por lo que solo se ejecuta en Apple Silicon. No es compatible con CUDA ni ROCm sin conversión adicional.
- **Posible sesgo**: el corpus de entrenamiento del head (CC-100 zh-Hant y Wikinews) puede introducir sesgos de estilo y contenido en las predicciones, aunque no afecta al texto final generado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit)
- [Modelo base original (EryriLabs)](https://huggingface.co/EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP)
- [Modelo base ornith-ai](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Colección Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Página de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Ficha en ModelScope](https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B)
- [Benchmarks y contexto (BenchLM)](https://benchlm.ai/models/ornith-1-5-35b-a3b)
