# jesusluque/qwen3-30b-topiary-w576-code

## Resumen

El modelo `jesusluque/qwen3-30b-topiary-w576-code` es un checkpoint derivado de Qwen3-30B-A3B, un modelo de mezcla de expertos (MoE) de 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos, desarrollado por Alibaba. Este checkpoint aplica la técnica Topiary: poda los expertos enrutados según su saliencia de activación, truncando las neuronas intermedias de 768 a 576 (un 25 % menos de ancho), y posteriormente cuantiza los pesos a 4 bits con un grupo de tamaño 64. El resultado es un modelo de 13,1 GB que cabe en hardware de consumo y ofrece un rendimiento superior a las cuantizaciones de 3 bits del mismo modelo base.

La calibración se realizó exclusivamente sobre un corpus de código (The Stack: Python, C++, Swift), lo que lo hace especialmente competente en generación y comprensión de código, aunque sacrifica rendimiento en tareas matemáticas en comparación con su hermano de calibración mixta. Está disponible bajo licencia Apache-2.0 y se distribuye en formato MLX, listo para usar con la librería `mlx-lm` en dispositivos Apple Silicon.

Su relevancia radica en que demuestra cómo la poda selectiva de expertos combinada con cuantización puede reducir significativamente el uso de memoria sin degradar la calidad en tareas específicas, abriendo la puerta a ejecutar modelos de 30B en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con poda Topiary en expertos enrutados |
| Parametros totales | 3.638.360.064 (según safetensors; el modelo base Qwen3-30B-A3B tiene ~30,5B) |
| Parametros activos | no disponible (el modelo base tiene ~3,3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (group size 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B, una arquitectura transformer con mezcla de expertos (MoE) que activa aproximadamente 3 mil millones de parámetros por token. El proceso Topiary consiste en analizar la saliencia de las activaciones enrutadas, es decir, la importancia de cada neurona intermedia dentro de los expertos, y truncar las 768 neuronas originales a las 576 más relevantes (una reducción del 25 % del ancho de los expertos). Esta poda se realiza a nivel de neurona, no de experto completo, lo que preserva la diversidad funcional.

Tras la poda, los pesos se cuantizan a 4 bits con un tamaño de grupo de 64, reduciendo aún más el espacio en memoria. La calibración se realizó sobre un corpus de código (The Stack: Python, C++ y Swift), acumulando estadísticas únicamente sobre los tokens que el router envía a cada experto. No se menciona entrenamiento adicional con RLHF o DPO; es un proceso de compresión y calibración sobre un modelo ya entrenado.

## Capacidades

- Generación de texto y razonamiento general, con un rendimiento aceptable en tareas de lenguaje natural (MMLU 64 %, HellaSwag 60 %).
- Generación de código y comprensión de lenguajes de programación, destacando en HumanEval con un 84 % de precisión.
- Razonamiento matemático básico, aunque con limitaciones notables (GSM8K 78 %).
- Comprensión lectora y sentido común (ARC 43 %).
- Velocidad de decodificación de aproximadamente 55 tokens por segundo en hardware adecuado.
- No se especifica soporte explícito para tool calling, agentes o capacidades multimodales en la documentación disponible.

## Casos de uso

- Autocompletado de código en entornos de desarrollo: gracias a su fuerte rendimiento en HumanEval, puede integrarse en editores como VS Code o Neovim para sugerir implementaciones de funciones y bloques de código.
- Asistente de programación local: al ser un modelo ligero (13,1 GB) y ejecutable con `mlx-lm` en Mac, puede servir como copiloto de código privado sin enviar datos a la nube.
- Refactorización y revisión de código: puede analizar fragmentos de código y proponer mejoras de estilo, eficiencia o corrección, aprovechando su entrenamiento en Python, C++ y Swift.
- Generación de documentación técnica: a partir de código fuente, puede redactar comentarios, docstrings o documentación de API.
- Análisis de logs y depuración: puede interpretar mensajes de error y sugerir causas probables o soluciones, gracias a su comprensión de patrones de código.
- Prototipado rápido de scripts y utilidades: ideal para generar pequeños programas o scripts de automatización en entornos con recursos limitados.
- Tareas de procesamiento de lenguaje general en entornos con restricciones de memoria, como chatbots o resúmenes de texto, aunque con menor calidad que el modelo base sin podar.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en varias tareas, junto con una comparación frente a cuantizaciones alternativas del mismo modelo base.

| Tarea | Resultado |
|---|---|
| HumanEval | 84 % |
| GSM8K | 78 % |
| MMLU | 64 % |
| ARC | 43 % |
| HellaSwag | 60 % |
| Perplejidad en código | 2,87 |
| Perplejidad en WikiText | 12,98 |

Comparación a igual presupuesto de memoria:

| Checkpoint | GB | Code PPL ↓ | WikiText PPL ↓ |
|---|---|---|---|
| Este modelo (w576, 4-bit) | 13,10 | 2,87 | 12,98 |
| Cuantización 3-bit comunitaria, ancho completo | 13,36 | 3,26 | 15,70 |
| Mixta 3-4-bit | 14,00 | 3,07 | 13,38 |

## Requisitos de hardware

- El repositorio ocupa 13,1 GB, por lo que se necesita al menos 16 GB de memoria unificada en un Mac para cargar el modelo y ejecutar inferencia con comodidad.
- Al estar en formato MLX, está optimizado para Apple Silicon (chips M1, M2, M3 y superiores). Se recomienda un Mac con al menos 16 GB de RAM unificada para evitar intercambio a disco.
- No se indica compatibilidad con GPUs NVIDIA o AMD; para usarlo en otros entornos sería necesario convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp).
- Despliegue recomendado: usar `mlx-lm` para generación local. No se mencionan opciones como vLLM o TGI.
- La velocidad de decodificación reportada es de aproximadamente 55 tokens por segundo, presumiblemente en un Mac con chip de gama alta.

## Comparativa con modelos similares

Dado que no hay datos de benchmarks frente a otros modelos de la misma categoría, se presenta la comparación con el modelo base y con otras cuantizaciones del mismo, que es la información disponible.

| Modelo | Parámetros | Cuantización | HumanEval | GSM8K | MMLU | Tamaño |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B (base) | 30,5B totales, 3,3B activos | bf16 | no disponible | no disponible | no disponible | ~60 GB |
| Este checkpoint (w576) | 3,6B (pesos cuantizados) | 4-bit g64 | 84 % | 78 % | 64 % | 13,1 GB |
| Cuantización 3-bit comunitaria | 30,5B totales | 3-bit | no disponible | no disponible | no disponible | 13,36 GB |

La comparativa muestra que este checkpoint logra un mejor rendimiento en perplejidad que la cuantización 3-bit a un tamaño similar, con la ventaja adicional de estar calibrado específicamente para código.

## Limitaciones y advertencias

- La calibración exclusiva en código degrada el rendimiento en matemáticas: GSM8K cae al 78 % frente al 94 % del hermano de calibración mixta (w640).
- No se han publicado resultados de sesgos o alucinaciones; como modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios fuera de su corpus de calibración.
- La longitud de contexto no está especificada en la documentación; se desconoce si hereda los 32 768 tokens del modelo base o si la poda la afecta.
- El modelo está optimizado para Apple Silicon (MLX); su uso en otras plataformas requiere conversión de formato y puede perder rendimiento.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda verificar los términos de la licencia del modelo base y de los datos de calibración (The Stack) para cumplir con sus condiciones.
- Al ser un checkpoint experimental con 0 descargas y 0 likes, no hay validación comunitaria amplia; los resultados deben reproducirse antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesusluque/qwen3-30b-topiary-w576-code
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
