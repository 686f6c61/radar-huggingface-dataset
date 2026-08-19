# jwg0830/AX-3.1-Light-sft_v0_2

## Resumen
AX-3.1-Light-sft_v0_2 es un modelo de lenguaje de 7.260 millones de parámetros desarrollado por el usuario jwg0830 a partir del modelo base skt/A.X-3.1-Light de SKT. Se trata de un ajuste fino mediante LoRA (r=16, alpha=32, 2 épocas, 5.801 ejemplos) fusionado posteriormente con el modelo base, con el objetivo de corregir deficiencias en el formato de salida detectadas en cinco benchmarks coreanos del K-AI Leaderboard (KMMLU-Pro, CLIcK, HLE(Ko), MuSR(Ko) y Com2-main(Ko)). El modelo está orientado exclusivamente al idioma coreano y se distribuye bajo una licencia "other" que debe revisarse antes de uso comercial.

La motivación principal del ajuste es que el modelo base ya mostraba una alta precisión de contenido, pero presentaba fallos en la adherencia estricta a los formatos de respuesta requeridos por los benchmarks. Este fine-tuning se centra en estabilizar dichos formatos sin alterar la arquitectura subyacida, que permanece idéntica a la del modelo base. No se introduce código personalizado y el modelo es compatible con vLLM sin opciones adicionales.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (estándar, basada en el modelo base skt/A.X-3.1-Light) |
| Parametros totales | 7.264.800.768 (7,26 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base skt/A.X-3.1-Light) |
| Tipos de cuantizacion | No disponible (no se especifican en la documentación) |
| Idiomas soportados | Coreano (ko) |
| Licencia | other (consulte la licencia del modelo base skt/A.X-3.1-Light) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base skt/A.X-3.1-Light, un transformer denso de 7,26 B parámetros sin modificaciones estructurales. El ajuste se realizó mediante LoRA (r=16, alpha=32) durante 2 épocas sobre un conjunto de 5.801 ejemplos seleccionados de cinco datasets de AI Hub coreano: 71.857 (preguntas de comprensión de textos escolares), 71.874 (conocimiento médico especializado), 71.610 (lectura mecánica de documentos financieros y legales), 569 (lectura mecánica de documentos administrativos) y 71.949 (razonamiento basado en relaciones causales). El entrenamiento se basó en un proxy benchmark propio de 1.350 preguntas que cubre los cinco ejes del K-AI Leaderboard, y el objetivo fue corregir la falta de adherencia al formato de salida estricto, no mejorar el contenido (que ya era sólido en el modelo base). No se emplearon técnicas de RLHF ni DPO.

## Capacidades
- Generación de texto en coreano con alta precisión en tareas de comprensión lectora y razonamiento.
- Razonamiento causal y lógico, especialmente en dominios administrativos, financieros y médicos.
- Adherencia estricta a formatos de respuesta (objetivo principal del ajuste).
- Capacidad multilingüe limitada: el modelo está entrenado y evaluado exclusivamente en coreano.
- No se documentan capacidades de tool calling, agentes, visión o audio.

## Casos de uso
- Atención al cliente automatizada en coreano: el modelo puede gestionar consultas multi-turno con un formato de respuesta consistente, gracias a su ajuste para seguir instrucciones de formato estrictas.
- Análisis de documentos legales y financieros: entrenado con datos de lectura mecánica de dichos documentos, puede extraer información estructurada y responder preguntas con precisión.
- Asistencia médica de nivel básico: al incluir datos de conocimiento médico, puede responder preguntas de pacientes o apoyar a personal sanitario en tareas de documentación.
- Educación y tutoría: dado su entrenamiento con preguntas de libros de texto, es útil para generar ejercicios, explicaciones y evaluaciones en coreano.
- Razonamiento causal en entornos empresariales: puede analizar cadenas de causa-efecto en informes o incidentes, gracias a su entrenamiento con datos de razonamiento causal.
- Evaluación de modelos coreanos: su capacidad de seguir formatos estrictos lo hace adecuado como componente en pipelines de evaluación automática de otros modelos.

## Benchmarks y rendimiento
La model card reporta resultados de un proxy benchmark propio (no oficial) con 1.350 preguntas distribuidas en cinco ejes. Se comparan las respuestas "estables" del modelo base y del modelo ajustado:

| Eje (proxy) | Base (aciertos) | sft_v0_2 (aciertos) |
|---|---|---|
| KMMLU-Lite (300) | 213 | 223 |
| CLIcK-Lite (300) | 275 | 274 |
| HLE-Lite (200) | 185 | 190 |
| MuSR-Lite (300) | 278 | 288 |
| Com2-main-Lite (250) | 227 | 246 |
| **Total (1.350)** | **1.178 (87,3%)** | **1.221 (90,4%)** |

Estos resultados son orientativos y no constituyen puntuaciones oficiales del K-AI Leaderboard. El autor advierte que el eje Com2-main-Lite usa opciones sintetizadas y no una selección nativa de cuatro opciones, por lo que su precisión absoluta debe interpretarse con cautela.

## Requisitos de hardware
- VRAM estimada para inferencia: con 7,26 B parámetros en FP16, el modelo ocupa aproximadamente 14,5 GB (tamaño del repositorio). Se recomienda una GPU con al menos 16 GB de VRAM para FP16, o alrededor de 4-6 GB si se aplica cuantización de 4 u 8 bits (no documentada, pero posible con herramientas como llama.cpp o GPTQ).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para FP16. Para cuantización, una RTX 3080/3090 (10-24 GB) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización es viable en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM (validado sin opciones adicionales), TGI, llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no se proporcionan datos. Para un modelo de 7 B, se espera un throughput de 50-100 tokens/s en una A100 con vLLM, pero son estimaciones genéricas.

## Comparativa con modelos similares
No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. La única referencia directa es el modelo base skt/A.X-3.1-Light, del cual este es un derivado. Se puede comparar con otros modelos coreanos de tamaño similar (por ejemplo, EXAONE-Deep-7.8B, mencionado en la model card), pero no se dispone de métricas oficiales comparables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AX-3.1-Light-sft_v0_2 | 7,26 B | No disponible | other | Hugging Face |
| skt/A.X-3.1-Light (base) | 7,26 B | No disponible | other | Hugging Face |
| EXAONE-Deep-7.8B-sft_v0_2 | 7,8 B | No disponible | other | Hugging Face |

## Limitaciones y advertencias
- Sesgos: el entrenamiento se basa en datasets coreanos de dominios específicos (educación, medicina, finanzas, administración), lo que puede introducir sesgos culturales o de contenido limitado a esos ámbitos.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios no cubiertos por los datos de entrenamiento.
- Idioma: solo está optimizado para coreano; su rendimiento en otros idiomas no se ha evaluado y probablemente sea deficiente.
- Licencia: la licencia "other" no especifica permisos claros para uso comercial. Es imprescindible revisar la licencia del modelo base skt/A.X-3.1-Light antes de cualquier despliegue en producción.
- Formato de salida: aunque el ajuste mejora la adherencia al formato, no garantiza una corrección perfecta en todos los casos, y los benchmarks proxy no son oficiales.
- Datos de entrenamiento: el conjunto de entrenamiento es pequeño (5.801 ejemplos) y específico, lo que limita la generalización a tareas fuera de los ejes evaluados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jwg0830/AX-3.1-Light-sft_v0_2
- Modelo base skt/A.X-3.1-Light: https://huggingface.co/skt/A.X-3.1-Light
- No se han encontrado otros enlaces relevantes (papers, blogs o repositorios) en la búsqueda web.
