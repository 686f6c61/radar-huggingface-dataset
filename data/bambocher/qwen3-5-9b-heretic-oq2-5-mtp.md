# bambocher/Qwen3.5-9B-heretic-oQ2.5-mtp

## Resumen

Qwen3.5-9B-heretic-oQ2.5-mtp es una versión cuantizada del modelo Qwen3.5-9B, derivada de una variante "heretic" (presumiblemente con ajustes de alineación relajados o eliminados) y cuantizada mediante la herramienta oQ de oMLX v0.7.3, que aplica cuantización de precisión mixta. El checkpoint completo ocupa 4,9 GB en disco con una media efectiva de 4,080 bits por peso, lo que lo hace desplegable en entornos con recursos limitados. El autor es bambocher y el repositorio se publicó en noviembre de 2026 con licencia no especificada.

El modelo integra tres componentes diferenciados: un modelo de lenguaje de 8.954B parámetros, un codificador visual de 0.456B y una cabeza MTP (multi-token prediction) de 0.243B, sumando 9.653.104.368 parámetros totales. La presencia de vision y MTP indica que el modelo base es multimodal y soporta decodificación especulativa basada en predicción de múltiples tokens, aunque la model card no documenta estas capacidades en detalle.

La relevancia de esta ficha radica en que combina cuantización agresiva (2 y 3 bits en el 77 % de los pesos) con formatos de mayor precisión selectiva (5 bits y BF16 en capas críticas), una estrategia típica para preservar calidad en modelos pequeños. Sin embargo, la ausencia de benchmarks, licencia e idiomas declarados limita seriamente su uso en producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con cabeza MTP para predicción multi-token |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ precision mixta: affine 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

Distribución de precisión detallada:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits efectivos |
|---|---|---|---|---|
| Affine 2-bit, group 64 | 2,606B | 26,99 % | 0,758 GiB | 2,50 |
| Affine 3-bit, group 128 | 3,910B | 40,51 % | 1,479 GiB | 3,25 |
| Affine 3-bit, group 64 | 1,017B | 10,54 % | 0,414 GiB | 3,50 |
| Affine 4-bit, group 64 | 0,210B | 2,17 % | 0,110 GiB | 4,50 |
| Affine 5-bit, group 64 | 1,420B | 14,71 % | 0,909 GiB | 5,50 |
| BF16 | 0,491B | 5,08 % | 0,914 GiB | 16,00 |
| Total | 9,653B | 100 % | 4,585 GiB | 4,080 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5, un transformer multimodal con codificador visual integrado (0.456B parámetros) y una cabeza MTP de 0.243B parámetros. La cabeza MTP permite predicción de múltiples tokens por paso, técnica empleada para decodificación especulativa y aceleración de inferencia. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica destacable de este checkpoint es la cuantización de precisión mixta oQ: en lugar de aplicar una precisión uniforme, distribuye bits según la sensibilidad de cada capa. Las capas menos críticas se comprimen a 2 bits (grupo 64), mientras que partes del modelo (incluido presumiblemente el codificador visual y la cabeza MTP) se mantienen en BF16 o 5 bits. El resultado es un ratio de compresión de aproximadamente 4 bits por peso frente a los 16 bits de BF16, con pérdida de calidad no cuantificada en la model card.

La variante "heretic" sugiere que el modelo base ha sido sometido a un proceso de eliminación o reducción de alineación de seguridad, práctica común en la comunidad para obtener modelos menos restrictivos. No se documenta el método empleado ni el impacto en capacidades.

## Capacidades

- Generación de texto autoregresiva, con decodificación especulativa acelerada por la cabeza MTP.
- Procesamiento multimodal de imágenes mediante el codificador visual de 0.456B parámetros (presumiblemente visión-lenguaje, sin confirmación en la model card).
- Razonamiento multi-paso y predicción de múltiples tokens por paso gracias a la arquitectura MTP.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Modo thinking / razonamiento extendido: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue en hardware Apple Silicon: al estar en formato MLX, el modelo está pensado para ejecutarse con el framework MLX de Apple en chips M1/M2/M3/M4, aprovechando la memoria unificada para cargar los 4,9 GB del checkpoint sin GPU dedicada.
- Prototipado rápido de aplicaciones multimodales: el codificador visual integrado permite experimentar con tareas imagen-texto en local, útil para validar pipelines antes de escalar a modelos mayores.
- Inferencia acelerada con decodificación especulativa: la cabeza MTP permite generar varios tokens por paso, reduciendo la latencia en tareas de generación larga como resúmenes o traducción.
- Evaluación de cuantización agresiva: investigadores pueden usar este checkpoint para estudiar el impacto de precisión mixta (2-5 bits) en calidad de salida frente al modelo BF16 original.
- Fines de investigación sobre alineación: la variante "heretic" permite estudiar el comportamiento de modelos con alineación reducida, útil en estudios de seguridad y robustez.
- Uso educativo y demos locales: el tamaño reducido (4,9 GB) facilita demostraciones en portátiles con memoria unificada de 16 GB o superior.
- Generación de texto en entornos con restricciones de memoria: la media de 4,08 bits/peso permite ejecutar un modelo de ~9,6B parámetros donde un BF16 requeriría ~19 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/RAM estimada: ~4,9 GB para cargar el checkpoint completo en formato MLX; se recomienda al menos 8 GB de memoria unificada para dejar margen a la KV cache y activaciones.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con memoria unificada; el formato MLX no está pensado para GPUs NVIDIA/AMD.
- Cabe en consumer GPU: no en el sentido tradicional (NVIDIA/AMD), pero sí en Mac con 8-16 GB de memoria unificada.
- Opciones de despliegue: MLX (librería nativa), oMLX; llama.cpp, vLLM, Ollama y TGI no soportan directamente este formato sin conversión.
- Latencia y throughput: no disponibles; la cabeza MTP debería mejorar el throughput frente a decodificación token a token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ2.5-mtp | 9,653B | no disponible | no disponible | safetensors MLX | Hugging Face |
| Qwen3.5-9B (base) | ~9,6B (estimado) | no disponible | no disponible en esta ficha | safetensors | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (típico) | Apache 2.0 (típico) | safetensors, GGUF | Hugging Face |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 tokens | Llama 3.1 Community | safetensors, GGUF | Hugging Face |

La comparativa con Qwen2.5-7B y Llama-3.1-8B es orientativa por tamaño, pero no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas. La licencia no declarada impide confirmar compatibilidad con uso comercial frente a alternativas Apache 2.0.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; contactar al autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce el soporte multilingüe real; asumir comportamiento del Qwen3.5 base sin garantías.
- Sin benchmarks: no hay evidencia de la degradación de calidad causada por la cuantización a 2-3 bits en el 77 % de los pesos.
- Variante "heretic": alineación de seguridad presumiblemente reducida; mayor riesgo de generar contenido inapropiado, sesgado o dañino.
- Riesgo de alucinación: no cuantificado; los modelos de ~9B con cuantización agresiva pueden amplificar errores factuales.
- Contexto desconocido: no se declara la ventana máxima, lo que impide planificar tareas de contexto largo.
- Formato MLX exclusivo: no es directamente utilizable en infraestructura NVIDIA/AMD sin conversión a GGUF u otro formato.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso.
- Fecha de creación futura (2026-11-13): verificar la procedencia y autenticidad del checkpoint antes de usarlo.
- Sin pipeline declarado: Hugging Face no identifica la tarea principal, lo que complica la integración automática.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ2.5-mtp
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la información proporcionada
- Paper o técnica de cuantización oQ: no disponible en la información proporcionada
