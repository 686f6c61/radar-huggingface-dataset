# jesusluque/qwen3-30b-topiary

## Resumen

El modelo `jesusluque/qwen3-30b-topiary` es un checkpoint derivado de Qwen/Qwen3-30B-A3B, un modelo de lenguaje de arquitectura MoE (mixture of experts) con 30 000 millones de parámetros totales y 3 000 millones activos por token. La contribución principal de este checkpoint es la aplicación de la técnica **Topiary**, que poda los expertos enrutados a nivel de neurona según la saliencia de activación, con un presupuesto por capa que aumenta con la profundidad (576 neuronas por experto en las capas más superficiales hasta 704 en las más profundas, media de 640 de las 768 originales). Posteriormente se cuantiza a 4 bits con grupo de 64 (g64) en formato MLX. El resultado es un modelo de 14,46 GB de pesos que ofrece una mejora notable en generación de código y perplexidad respecto a otras cuantizaciones, sin necesidad de entrenamiento ni destilación.

El autor, jesusluque, ha publicado este checkpoint como parte de un proyecto de investigación sobre poda selectiva de expertos en modelos MoE. La relevancia actual radica en la posibilidad de ejecutar un modelo de 30B en hardware de consumo (Apple Silicon) con un rendimiento competitivo, manteniendo una licencia Apache-2.0 que permite uso comercial sin restricciones. El modelo requiere un pequeño shim de carga (`per_layer.py`) porque las anchuras por capa no son expresables en la configuración estándar de mlx-lm.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, derivada de Qwen3-30B-A3B |
| Parametros totales | 30 000 millones (original); 4 015 847 424 en el checkpoint cuantizado (safetensors) |
| Parametros activos | 3 000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit g64 (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer MoE con 30 000 millones de parámetros totales y 3 000 millones activos por token. El checkpoint Topiary aplica una poda a nivel de neurona sobre los expertos enrutados, utilizando la saliencia de activación enrutada como criterio de selección. La poda sigue una ley de taper por profundidad: las capas más superficiales reciben un presupuesto menor (576 neuronas por experto) y las más profundas un presupuesto mayor (704), con una media de 640 de las 768 neuronas originales. Esta distribución se justifica porque la sensibilidad a la reducción de anchura aumenta con la profundidad, ya que las capas tardías no tienen capas posteriores que amortigüen el error.

El proceso de construcción no incluye entrenamiento ni destilación. Se parte de los expertos originales en bf16, se realiza una permutación a granularidad de neurona, se truncan por capa (ratio 0,85 con taper lineal y suelo de 576) y se cuantiza a 4-bit g64. La calibración se hizo con un corpus mixto de aproximadamente 151 000 tokens: 40 % código, 30 % train de GSM8K y 30 % WikiText, usando solo estadísticas de los expertos enrutados. Todos los resultados son reproducibles con configuraciones fijas, decodificación greedy y semillas fijas.

## Capacidades

- Generación de texto y razonamiento general, con resultados competitivos en benchmarks como MMLU (70 % generativo) y ARC-Challenge (48 %).
- Generación de código, con un HumanEval del 92 % (50 muestras), superior a otras cuantizaciones comparadas.
- Razonamiento matemático, con un 94 % en GSM8K (50 muestras) y 40 % en MATH-500.
- Comprensión de lenguaje natural, con perplexidad de 2,64 en Code PPL y 10,27 en WikiText PPL.
- Capacidad de seguir instrucciones, con un 74 % en IFEval.
- Inferencia eficiente en Apple Silicon gracias a la cuantización MLX 4-bit, alcanzando 76,6 tokens por segundo en decodificación.
- No se especifican capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Generación de código en entornos de desarrollo local: con un HumanEval del 92 %, el modelo puede asistir en la escritura de funciones y scripts directamente en máquinas con Apple Silicon, sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de chat o asistentes de texto: su tamaño reducido (14,46 GB) permite cargarlo en memoria unificada de equipos con 16 GB o más, ideal para desarrollo y pruebas.
- Razonamiento matemático en aplicaciones educativas: el 94 % en GSM8K lo hace adecuado para resolver problemas aritméticos de nivel escolar y generar explicaciones paso a paso.
- Análisis de código y refactorización: la baja perplexidad en Code PPL (2,64) sugiere buena capacidad para entender y completar fragmentos de código en múltiples lenguajes.
- Investigación sobre poda de modelos MoE: al ser un checkpoint reproducible con configuraciones fijas, puede servir como referencia para estudios sobre saliencia de activación y taper por profundidad.
- Despliegue en edge computing con hardware limitado: al ser Apache-2.0 y caber en 14,5 GB, es viable para aplicaciones embebidas que requieran generación de texto sin conexión.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan este modelo (Topiary fine con taper) con dos alternativas al mismo tamaño de bytes: el hermano uniforme `w640` y una cuantización comunitaria de 3 bits. Todas las mediciones se realizaron en Apple Silicon con MLX, decodificación greedy y semillas fijas.

| Señal | Topiary fine (este modelo) | Uniform fine w640 | Community 3-bit |
|---|---|---|---|
| Code PPL ↓ | 2,64 | 2,70 | 3,26 |
| WikiText PPL ↓ | 10,27 | 10,35 | 15,7 |
| GSM8K (50) | 94 % | 94 % | 88 % |
| MMLU (100, generativo) | 70 % | 74 % | 57 % |
| HumanEval (50) | 92 % | 84 % | 76 % |
| HellaSwag (100) | 70 % | 65 % | 66 % |
| ARC-Challenge (100) | 48 % | 49 % | 44 % |
| Decode (tok/s) | 76,6 | 80,6 | 78,5 |

El autor señala que el taper por profundidad sacrifica algo de conocimiento general (MMLU 70 frente a 74, ARC −1) a cambio de ganancias sustanciales en generación (HumanEval +8, ambas perplexidades, HellaSwag +5). MATH-500 es el punto débil (40 % frente a 46 % de la versión 3-bit), y IFEval se sitúa en 74 % frente al 68 % de la 3-bit.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 14,46 GB en formato 4-bit MLX, por lo que se recomienda al menos 16 GB de memoria unificada en Apple Silicon para cargarlo con margen.
- GPU recomendadas: cualquier chip Apple Silicon con 16 GB o más de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, etc.). No se han probado GPUs NVIDIA en la información disponible.
- No cabe en GPUs de consumo convencionales de 8 GB, pero sí en equipos Apple Silicon de gama media-alta.
- Opciones de despliegue: MLX y mlx-lm. Requiere un shim de carga (`per_layer.py`) para parchear la construcción de bloques por capa. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Rendimiento: 76,6 tokens por segundo en decodificación (medido en Apple Silicon con MLX).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento destacado |
|---|---|---|---|---|---|
| Qwen3-30B-A3B (original) | 30B totales, 3B activos | 128k (según ficha oficial) | Apache-2.0 | bf16 | Referencia sin poda |
| jesusluque/qwen3-30b-topiary (este) | 30B totales, 3B activos (checkpoint 4B cuantizado) | no disponible | Apache-2.0 | MLX 4-bit g64 | HumanEval 92 %, GSM8K 94 % |
| jesusluque/qwen3-30b-topiary-w640 | 30B totales, 3B activos | no disponible | Apache-2.0 | MLX 4-bit g64 | MMLU 74 %, decode 80,6 tok/s |
| Community 3-bit (sin nombre) | 30B totales, 3B activos | no disponible | no especificada | 3-bit | MATH-500 46 %, decode 78,5 tok/s |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mixtral 8x7B) en la información proporcionada.

## Limitaciones y advertencias

- Requiere un shim de carga no estándar (`per_layer.py`) para funcionar con mlx-lm; sin él, el checkpoint no se puede cargar directamente.
- El rendimiento en tareas de conocimiento general (MMLU, ARC-Challenge) es inferior al del hermano uniforme w640, lo que puede ser relevante en aplicaciones de QA o razonamiento factual.
- MATH-500 (40 %) es notablemente inferior a la cuantización comunitaria de 3 bits (46 %), lo que indica sensibilidad a la poda en problemas matemáticos complejos.
- No se han publicado resultados sobre alucinaciones, sesgos o toxicidad; al derivar de Qwen3-30B-A3B, puede heredar los sesgos del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se especifica la longitud de contexto soportada tras la poda y cuantización; es posible que se reduzca respecto al modelo original.
- El modelo no ha sido entrenado ni ajustado después de la poda, por lo que cualquier degradación en tareas específicas debe evaluarse antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jesusluque/qwen3-30b-topiary
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio Topiary (mencionado en la model card, URL no proporcionada): contiene el shim `per_layer.py` y las configuraciones de construcción.
- Hermano uniforme: https://huggingface.co/jesusluque/qwen3-30b-topiary-w640
