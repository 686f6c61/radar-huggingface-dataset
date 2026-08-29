# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ6e-MTP es una cuantización MLX del modelo Ornith-1.5-35B-A3B, desarrollada por el usuario peculiar-ragdoll. Ornith-1.5 es un modelo de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos, derivado de la familia Qwen3.5-MoE y especializado en codificación agéntica y conversaciones multi‑turno. Esta versión concreta aplica el cuantizador oQ6e (6‑bit dinámico con matriz de importancia) y añade el head de predicción multi‑token (MTP) entrenado por Ornith, lo que habilita decodificación especulativa en runtimes compatibles. Además, incorpora la plantilla de chat Sharp embebida en el checkpoint, que prioriza respuestas concisas.

El modelo está diseñado para ejecutarse en hardware Apple Silicon mediante la librería MLX, ofreciendo una alternativa local de alto rendimiento para tareas de agente de codificación y conversaciones largas. Según los datos publicados por el autor, en SWE‑bench‑Live resuelve 12 de 25 problemas, equiparándose a Opus 4.6 medium, y supera a su propio modelo base en conversación multi‑turno (Claw‑Eval 67.2 frente a 65.3). No obstante, sacrifica rendimiento en razonamiento y conocimiento general (MMLU‑Pro 73.7 frente a 84.0 de Nail), por lo que se recomienda para entornos de trabajo más que para exámenes o trivia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-MoE, con componente de visión |
| Parametros totales | 8.995.103.088 (según safetensors; la designación del modelo indica 35B totales, ~3B activos) |
| Parametros activos | ~3.000.000.000 (estimado según nomenclatura A3B; no se proporciona dato exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6‑bit dinámico con imatrix); también existe variante oQ4e |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una requantización de Ornith-1.5-35B-A3B, que a su vez es un fine‑tuning de Qwen3.5-35B-A3B orientado a codificación y agentes. Ornith-1.5 emplea una arquitectura MoE con 35B parámetros totales y 3B activos, lo que permite un rendimiento por token elevado con un coste computacional reducido. La versión MLX aquí descrita aplica el cuantizador oQ6e de oMLX, que realiza una cuantización dinámica de precisión mixta con una pasada de matriz de importancia (imatrix) para minimizar la pérdida de calidad. El head MTP (multi‑token prediction) entrenado por Ornith se incluye como un shard adicional, activable mediante un flag de configuración; cuando está desactivado, el modelo es idéntico a la versión oQ6e sin MTP. La plantilla de chat Sharp, también desarrollada por peculiar-ragdoll, está embebida en el checkpoint y se aplica automáticamente en los runtimes compatibles, forzando respuestas más concisas.

No se dispone de información detallada sobre el dataset de entrenamiento de Ornith-1.5 ni sobre el proceso de alineación (RLHF/DPO). El autor indica que los resultados de benchmarks publicados provienen de la versión GGUF, no de este archivo MLX, aunque sirven como evidencia del comportamiento del modelo subyacente.

## Capacidades

- Generación de texto y razonamiento, con especial fortaleza en tareas de codificación y resolución de problemas en repositorios reales (SWE‑bench‑Live).
- Soporte de agentes y razonamiento multi‑paso: el modelo puede interactuar con herramientas y ejecutar tareas de agente de codificación de forma autónoma.
- Conversación multi‑turno de alta calidad, destacando por mantener respuestas útiles en diálogos largos (Claw‑Eval 67.2).
- Capacidades de visión: procesa imágenes y responde preguntas sobre su contenido (pipeline image‑text‑to‑text).
- Decodificación especulativa mediante el head MTP, que acelera la generación en runtimes que lo soporten (por ejemplo, llama.cpp para la versión GGUF, y ciertos entornos MLX).
- Multilingüe limitado a inglés y chino.
- Tool calling y function calling: no se menciona explícitamente en la documentación, pero al ser un modelo orientado a agentes, se presume compatible; sin embargo, no hay confirmación oficial en la información proporcionada.

## Casos de uso

- Asistente de programación local: el modelo puede generar, explicar y depurar código en Python, JavaScript u otros lenguajes, aprovechando su entrenamiento específico en codificación. Se integra en editores o CLIs mediante la librería mlx‑vlm.
- Agente de resolución de issues en repositorios: gracias a su rendimiento en SWE‑bench‑Live, puede analizar un issue, explorar el código fuente y proponer parches, funcionando como un bot de mantenimiento en proyectos open source.
- Chat de soporte técnico multi‑turno: su capacidad para mantener conversaciones largas y coherentes lo hace adecuado para atender consultas complejas de usuarios, donde el contexto se acumula a lo largo de muchos turnos.
- Análisis de capturas de pantalla o diagramas: al ser un modelo de visión‑lenguaje, puede describir el contenido de una imagen, extraer texto o identificar elementos visuales, útil en documentación técnica o QA.
- Generación de documentación a partir de código: puede leer funciones y clases y producir explicaciones o comentarios, facilitando el mantenimiento de proyectos.
- Entrenamiento y fine‑tuning: al estar publicado con licencia MIT y pesos en formato MLX, investigadores pueden usarlo como punto de partida para experimentos de cuantización o ajuste en Apple Silicon.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación fueron medidos por el autor en la versión GGUF del modelo, no en este archivo MLX. El propio autor advierte que el cambio de cuantizador puede alterar las puntuaciones (por ejemplo, observó una diferencia de 0.7 puntos en MMLU‑Pro y un 24% en recuento de tokens entre MLX y GGUF con los mismos pesos). Por tanto, estos datos deben interpretarse como referencia del comportamiento del modelo subyacente, no como medición exacta de este build.

| Benchmark | Tiel (GGUF) | Ornith-1.5 (base) | Nail (Qwen3.6-35B-A3B) |
|---|---|---|---|
| SWE‑bench‑Live (problemas resueltos de 25) | 12 | 8 | 9 |
| Claw‑Eval (multi‑turno, sobre 114 conversaciones) | 67.2 | 65.3 | 60.5 |
| MMLU‑Pro (4‑bit) | 73.7 | 78.0 | 84.0 |

En SWE‑bench‑Live, Tiel iguala a Opus 4.6 medium, supera a Ornith-1.5 en 4 problemas y a Nail en 3. En conversación, supera tanto a su base como a Nail. En razonamiento general, queda por debajo de ambos.

## Requisitos de hardware

- Este build MLX requiere Apple Silicon (M1 o posterior). No es compatible con GPUs NVIDIA o AMD.
- VRAM estimada: aproximadamente 29.5 GB para la cuantización oQ6e (según el autor). La variante oQ4e ocupa unos 21 GB.
- GPU recomendadas: Macs con chip M1 Max, M2 Ultra, M3 Max o superior, con al menos 32 GB de memoria unificada para la versión oQ6e. Para oQ4e, bastan 24 GB.
- Despliegue: se recomienda usar oMLX (gestor de modelos para MLX) o la librería `mlx-vlm`. No usar `mlx-lm`, ya que es un checkpoint de visión‑lenguaje y `mlx-lm` genera tokens basura.
- Latencia y throughput: no se proporcionan datos concretos. La decodificación especulativa con el head MTP puede acelerar la generación, pero depende del runtime y del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | MoE (Qwen3.5) | 35B totales / ~3B activos | no disponible | MIT | MLX (Apple Silicon) |
| Ornith-1.5-35B-A3B | MoE (Qwen3.5) | 35B totales / ~3B activos | no disponible | MIT | Original, pesos completos |
| Nail-Qwen3.6-35B-A3B-GGUF | MoE (Qwen3.6) | 35B totales / ~3B activos | no disponible | MIT | GGUF (multiplataforma) |
| Dirk-Qwen3.8-27B-GGUF | Denso (Qwen3.8) | 27B | no disponible | MIT | GGUF (multiplataforma) |

Tiel se posiciona como una opción intermedia: mejor en conversación y codificación agéntica que su base y que Nail, pero inferior en razonamiento puro. Dirk (denso 27B) resuelve más problemas de SWE‑bench‑Live (15 de 25) aunque a mayor coste de peso. La elección depende del hardware disponible: MLX solo en Apple Silicon, mientras que las versiones GGUF son multiplataforma.

## Limitaciones y advertencias

- Rendimiento deficiente en tareas de conocimiento general y razonamiento abstracto: MMLU‑Pro 73.7, muy por debajo de alternativas como Nail (84.0). No es adecuado para exámenes o preguntas de trivia.
- Los benchmarks publicados corresponden al build GGUF, no a este archivo MLX; los resultados pueden variar con el cuantizador.
- Exclusivo para Apple Silicon; no puede ejecutarse en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF).
- Al ser un modelo de visión‑lenguaje, debe cargarse con `mlx-vlm`; usar `mlx-lm` produce salida corrupta.
- Sesgos potenciales heredados de los datos de entrenamiento de Qwen3.5 y del fine‑tuning de Ornith, no documentados explícitamente.
- Riesgo de alucinación en contextos donde no hay información suficiente, especialmente en tareas de razonamiento largo.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las dependencias del entorno de ejecución (oMLX, mlx-vlm) y sus respectivas licencias.
- No se especifica la longitud de contexto soportada; se recomienda probar con ventanas moderadas para evitar degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Versión GGUF (recomendada para benchmarks): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Versión GGUF con MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Versión MLX oQ4e: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Plantilla de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
