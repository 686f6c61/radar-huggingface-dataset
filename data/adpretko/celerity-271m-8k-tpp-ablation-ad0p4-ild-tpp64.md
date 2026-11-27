# adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp64

## Resumen

Celerity 271M 8K es un checkpoint de investigación de un modelo de lenguaje de 271 millones de parámetros, entrenado por Cerebras y convertido al formato de Hugging Face por el usuario adpretko. Se trata de un experimento de ablación centrado en el "tokens per parameter" (TPP) nominal de 64 y en una programación de dropout de atención dependiente de la capa, con un valor final de 0,4. El modelo forma parte de la familia Celerity y está pensado como material de estudio sobre dinámicas de entrenamiento más que como un modelo listo para producción.

La arquitectura es un transformer decoder-only con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens. Se entrenó sobre el dataset CommonPile (variante "corrected no-repeat TPP pool") durante 27 837 pasos, lo que equivale a aproximadamente 17 330 millones de tokens. El checkpoint se distribuye con código personalizado (`trust_remote_code=True`) y pesos en formato PyTorch.

Su relevancia es fundamentalmente metodológica: permite reproducir y analizar el efecto de distintas tasas de dropout de atención y de la escala TPP sobre el entrenamiento de modelos pequeños con contexto largo. No obstante, la información pública es muy limitada (sin licencia declarada, sin idiomas especificados, sin benchmarks ni pipeline definido), por lo que debe tratarse con cautela en cualquier evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings posicionales ALiBi |
| Parámetros totales | 271 millones (nominal) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (repo de 0,5 GB, código personalizado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con embeddings posicionales ALiBi, lo que le permite extrapolar posiciones más allá de la longitud vista durante el entrenamiento. La longitud máxima de secuencia configurada es de 8192 tokens. No emplea Mixture of Experts ni mecanismos de atención lineal: es un transformer denso convencional de 271 millones de parámetros.

El entrenamiento se realizó en infraestructura Cerebras (3 sistemas CSX) con el runtime `cbcore 2.6.0`. El experimento, denominado `ad0.4_ild_tpp64`, aplica un dropout de atención con una programación lineal dependiente de la capa cuyo valor final es 0,4 (no es una probabilidad uniforme, sino el extremo de la programación). Otros hiperparámetros: learning rate máximo de 0,15, batch global de 76, weight decay de 0,002455, tau_ema de 0,09755 y 27 837 pasos de entrenamiento, equivalentes a 17 331 093 504 tokens. El dataset es CommonPile en su variante "corrected no-repeat TPP pool". No se aplicaron residual dropout, stochastic depth ni LayerDrop. El dropout se desactiva durante la evaluación normal con `model.eval()`.

## Capacidades

- Generación de texto autoregresiva con contexto de hasta 8192 tokens.
- Razonamiento y comprensión de texto a nivel de modelo pequeño (271M), sin datos específicos de rendimiento publicados.
- Capacidad multilingüe: no disponible (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso como checkpoint de investigación para estudiar el efecto del dropout de atención y de la escala TPP.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: reproducir el experimento `ad0.4_ild_tpp64` y comparar el efecto de distintas tasas de dropout de atención sobre la calidad del modelo en tareas de lenguaje.
- Estudio de escalado TPP: analizar cómo el ratio tokens-por-parámetro (64 en este caso) afecta a la convergencia y al rendimiento en modelos pequeños con contexto largo.
- Evaluación de embeddings posicionales ALiBi: usar el modelo como banco de pruebas para medir extrapolación de contexto más allá de los 8192 tokens.
- Experimentos de contexto largo en hardware modesto: con 271M de parámetros, el modelo cabe en GPUs de consumo, lo que facilita probar tareas de resumen o recuperación sobre documentos largos.
- Baseline para ablaciones: servir como referencia en estudios comparativos frente a otros checkpoints de la familia Celerity con distintos hiperparámetros.
- Docencia y formación: ilustrar el pipeline completo de entrenamiento en Cerebras y conversión a Hugging Face con un modelo de tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1,1 GB solo para pesos (271M × 4 bytes), más memoria para activaciones y caché KV; en FP16/BF16, unos 0,55 GB de pesos. Con contexto de 8192 tokens, la caché KV incrementa el consumo de forma apreciable.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16 y contexto moderado; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se gestione la caché KV para contextos largos.
- Opciones de despliegue: el checkpoint requiere `trust_remote_code=True` y código personalizado, por lo que la integración con vLLM, llama.cpp, Ollama o TGI no está garantizada sin conversión previa; la vía más directa es PyTorch con Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, código personalizado |
| Otros checkpoints de la familia Celerity | no disponible | no disponible | no disponible | Hugging Face |
| Modelos pequeños tipo GPT-2 355M | 355M | 1024 | MIT (habitual) | Amplia |
| Modelos tipo Pythia 410M | 410M | 2048 | Apache 2.0 (habitual) | Amplia |

No se dispone de datos de rendimiento comparativo para este checkpoint, por lo que la comparación se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no especificados: se desconoce la cobertura lingüística real del modelo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad en tareas estándar.
- Riesgo de alucinación inherente a un modelo de 271M entrenado con ~17 000 millones de tokens; la fidelidad factual será limitada.
- Sesgos del dataset CommonPile no documentados en la información disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Checkpoint de ablación: no está pensado como modelo final ni optimizado para despliegue.
- Contexto máximo de 8192 tokens; más allá, el comportamiento con ALiBi no está validado en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp64
