# bambocher/Qwen3.5-2B-heretic-oQ3-mtp

## Resumen

Qwen3.5-2B-heretic-oQ3-mtp es una versión modificada y cuantizada del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. El modelo parte del checkpoint oficial de Qwen (2.274 millones de parámetros totales) y le aplica dos transformaciones: un proceso de "decensurado" mediante la herramienta Heretic v2.0.0, que reduce los rechazos del modelo ante peticiones sensibles, y una cuantización mixta de precisión realizada con oMLX v0.7.3 (formato oQ). El resultado es un checkpoint de 1,6 GB en formato MLX, pensado para inferencia en hardware Apple Silicon.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de modificación de alineamiento (ablación de comportamiento) sobre un modelo pequeño con capacidades multimodales, ya que el checkpoint incluye una torre de visión de 0.331B parámetros. Por otro, muestra una técnica de cuantización mixta que combina capas en 3, 4 y 5 bits con capas en BF16, logrando un promedio efectivo de 5,706 bits por peso. El modelo conserva además la cabeza de predicción multi-token (MTP) del original, de 0.061B parámetros, lo que permite decodificación especulativa.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card oficial de Qwen disponible en la información proporcionada y sin datos de benchmarks publicados. Su interés es principalmente técnico: ilustra cómo se puede reducir el comportamiento de rechazo de un modelo alineado y cómo se distribuye la cuantización mixta entre componentes del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión + cabeza MTP); detalles de atención y capas no disponibles |
| Parámetros totales | 2.274.069.824 (2.274B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta: affine 3-bit (grupo 64), affine 4-bit (grupo 64), affine 5-bit (grupo 64) y BF16; promedio efectivo 5,706 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

Desglose de la cuantización por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1.882B | 0.913 GB / 0.850 GiB |
| Visión | 0.331B | 0.663 GB / 0.617 GiB |
| Cabeza MTP | 0.061B | 0.046 GB / 0.043 GiB |
| Total | 2.274B | 1.622 GB / 1.511 GiB |

Distribución de precisión:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 1.247B | 54,829% | 0.508 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0.611B | 26,882% | 0.320 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0.076B | 3,321% | 0.048 GiB | 5,50 |
| BF16 | 0.340B | 14,967% | 0.634 GiB | 16,00 |
| Total | 2.274B | 100% | 1.511 GiB | 5,706 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-2B original, un transformer multimodal que integra un modelo de lenguaje de 1.882B parámetros, una torre de visión de 0.331B parámetros y una cabeza de predicción multi-token (MTP) de 0.061B parámetros. La información disponible no detalla el número de capas, la configuración de atención ni la longitud de contexto del modelo base. La presencia de la cabeza MTP indica que el modelo está diseñado para decodificación especulativa, una técnica que predice varios tokens por paso para acelerar la generación.

El entrenamiento original de Qwen3.5-2B no está documentado en la información proporcionada. Sobre este checkpoint se aplicaron dos procesos posteriores. Primero, el "decensurado" con Heretic v2.0.0, que utiliza una ablación de rango arbitrario (ARA) con parámetros concretos: índices de capa de inicio 12 y fin 23, peso de preservación de buen comportamiento 0,9189, peso de dirección de mal comportamiento 0,0008, peso de sobrecorrección relativa 0,9924 y 14 vecinos. Este proceso modifica las capas 12 a 23 para reducir la probabilidad de respuestas de rechazo, con una divergencia KL de 0,1397 respecto al original. Segundo, la cuantización mixta con oMLX v0.7.3, que asigna 3 bits a la mayoría de pesos (54,8%), 4 bits a una cuarta parte, 5 bits a una fracción pequeña y mantiene un 15% en BF16, presumiblemente para capas sensibles a la precisión.

## Capacidades

- Generación de texto y razonamiento: heredadas del Qwen3.5-2B base, aunque sin datos específicos de rendimiento en la información disponible.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0.331B parámetros, por lo que se espera soporte de entrada de imágenes, aunque no se detallan las tareas concretas.
- Decodificación especulativa: la cabeza MTP de 0.061B parámetros se conserva intacta, lo que habilita la predicción multi-token para acelerar la inferencia.
- Comportamiento de rechazo reducido: según la model card, el modelo pasa de 97/100 rechazos en el original a 0/100 en esta versión, medido sobre un conjunto de 100 peticiones no especificado.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 1,6 GB permiten ejecutar el modelo en Macs con memoria unificada, usando la librería mlx para cargar el checkpoint directamente. Es adecuado para prototipado rápido en portátiles Apple.
- Investigación sobre alineamiento y decensurado: el checkpoint documenta parámetros ARA concretos y una métrica de rechazos (0/100 frente a 97/100), lo que lo convierte en un caso de estudio reproducible para investigar cómo la ablación de capas afecta al comportamiento de rechazo y a la divergencia KL.
- Evaluación de cuantización mixta: la distribución detallada de bits por componente (lenguaje, visión, MTP) permite analizar el impacto de asignar 3, 4 o 5 bits a distintas partes del modelo, útil para investigadores que estudian técnicas de compresión.
- Experimentos de decodificación especulativa: al conservar la cabeza MTP, el modelo sirve para probar técnicas de predicción multi-token en un entorno de recursos limitados, comparando latencia frente a generación autoregresiva estándar.
- Prototipado multimodal de bajo coste: la torre de visión incluida permite construir demos de descripción de imágenes o respuesta a preguntas visuales en hardware de consumo, aunque sin garantías de calidad por falta de benchmarks.
- Pruebas de robustez y seguridad: dado su comportamiento de rechazo reducido, puede usarse en entornos controlados para estudiar respuestas del modelo ante peticiones sensibles, siempre con las advertencias éticas y legales correspondientes.

## Benchmarks y rendimiento

La model card solo reporta dos métricas de comportamiento, no benchmarks estándar de capacidad:

| Métrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,6 GB para los pesos en el formato cuantizado actual, más overhead de activaciones y caché KV (no cuantificado en la información disponible).
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4); no se indica compatibilidad con GPU NVIDIA o AMD en la información disponible.
- ¿Cabe en GPU de consumo? Sí, en términos de memoria: 1,6 GB de pesos caben en cualquier GPU con 4 GB o más, pero la librería mlx limita la ejecución práctica a hardware Apple.
- Opciones de despliegue: mlx (librería declarada); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es específico de MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ3-mtp | 2.274B | No disponible | Mixta 3/4/5-bit + BF16 (MLX) | No disponible | Hugging Face, formato MLX |
| Qwen/Qwen3.5-2B | 2.274B (presumiblemente) | No disponible | Original (BF16 presumiblemente) | No disponible | Hugging Face |
| Alternativas de ~2B con visión | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el modelo original del que deriva. No se dispone de datos de otros modelos comparables de la misma categoría (2B multimodales) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El proceso de decensurado con Heretic reduce los rechazos a 0/100, lo que implica que el modelo puede generar contenido que el original rechazaría; esto conlleva riesgos de seguridad y requiere filtros externos en producción.
- La divergencia KL de 0,1397 respecto al original indica una alteración medible de la distribución de salida, no solo en rechazos, sino potencialmente en otras respuestas.
- No hay información sobre sesgos del modelo base ni sobre cómo el proceso ARA los afecta.
- Riesgo de alucinación: inherente a modelos de 2B parámetros; no cuantificado en la información disponible.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; debe verificarse con el autor o con la licencia del Qwen3.5-2B original antes de cualquier despliegue.
- El formato MLX limita el despliegue a ecosistema Apple; no hay confirmación de conversión a GGUF u otros formatos.
- La cuantización a 3 bits en más de la mitad de los pesos puede degradar la calidad respecto al BF16 original; no se aportan métricas de perplejidad ni de calidad por tarea.
- El modelo tiene cero descargas y cero likes, y fue actualizado el mismo día de su creación; no hay evidencia de validación por la comunidad.
- La longitud de contexto y los idiomas soportados no están documentados, lo que impide planificar su uso en escenarios que requieran ventanas largas o multilingüismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ3-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Proyecto Heretic: https://heretic-project.org
