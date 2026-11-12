# bambocher/Qwen3.5-0.8B-heretic-oQ3-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ3-mtp es una versión cuantizada y "descensurada" (decensored) del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario bambocher en Hugging Face. El modelo conserva la arquitectura multimodal original de Qwen3.5 (componente de lenguaje, componente de visión y cabeza de predicción multi-token), pero ha sido modificado mediante la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo, y posteriormente cuantizado con oQ (oMLX v0.7.3) en precisión mixta.

El checkpoint completo contiene 873.438.784 parámetros (0,873B), distribuidos en 0,752B para el modelo de lenguaje, 0,101B para el módulo de visión y 0,020B para la cabeza MTP (multi-token prediction). La cuantización mixta emplea un rango de 3 a 8 bits por grupo de 64 pesos, con un promedio efectivo de 5,293 bits por peso y un tamaño de almacenamiento de aproximadamente 0,538 GiB.

La relevancia de esta ficha radica en que combina tres transformaciones poco habituales sobre un modelo pequeño: eliminación de rechazos por ablación de rangos arbitrarios (ARA), cuantización mixta de precisión y preservación de la cabeza de predicción multi-token. El resultado es un modelo de menos de 1 GB pensado para ejecución local en Apple Silicon mediante MLX, con capacidades multimodales y de decodificación especulativa, aunque con implicaciones éticas y de licencia que deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza de predicción multi-token (MTP); componente de lenguaje, componente de visión y cabeza MTP |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ (oMLX v0.7.3): affine 3, 4, 5, 6 y 8 bits, grupo de 64; pesos BF16 en una parte del checkpoint; promedio efectivo 5,293 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx); repo de 1,2 GB |
| Desglose de almacenamiento | Lenguaje: 0,752B (0,337 GiB); visión: 0,101B (0,187 GiB); MTP: 0,020B (0,014 GiB) |
| Distribución de bits | 3-bit: 69,330% de pesos; 4-bit: 7,023%; 5-bit: 10,913%; 6-bit: 0,908%; 8-bit: 0,011%; BF16: 11,815% |
| Herramienta de modificación | Heretic v2.0.0 (eliminación de rechazos) |
| Fecha de creación | 2026-11-01 |
| Última actualización | 2026-11-12 (recuantizado con oMLX v0.7.3) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 que integra un componente de lenguaje (0,752B parámetros), un componente de visión (0,101B parámetros) y una cabeza de predicción multi-token (0,020B parámetros). La presencia de la cabeza MTP indica que el modelo está diseñado para decodificación especulativa: predice varios tokens por paso para acelerar la generación, una técnica habitual en modelos optimizados para inferencia local. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La modificación principal aplicada por bambocher es la "descensura" mediante Heretic v2.0.0, que emplea una ablación de rangos arbitrarios (ARA) sobre las capas 1 a 19 del modelo. Los parámetros ARA documentados son: start_layer_index=1, end_layer_index=19, preserve_good_behavior_weight=0,8199, steer_bad_behavior_weight=0,0001, overcorrect_relative_weight=1,0547 y neighbor_count=14. Según la model card, esta intervención reduce los rechazos de 97/100 en el modelo original a 0/100 en esta versión, con una divergencia KL de 0,1412 respecto al original. La cuantización posterior con oQ (oMLX v0.7.3) aplica precisión mixta: la mayor parte de los pesos (69,33%) se almacena a 3 bits, mientras que un 11,8% permanece en BF16, presumiblemente para preservar capas sensibles como las de visión o las proyecciones críticas.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint incluye un componente visual de 0,101B parámetros, por lo que se espera soporte de entrada de imágenes (no confirmado explícitamente en la model card).
- Decodificación especulativa mediante la cabeza MTP preservada, que permite predecir múltiples tokens por paso y acelerar la inferencia.
- Comportamiento sin rechazos: según la model card, el modelo responde a solicitudes que el original rechazaría (0/100 rechazos frente a 97/100).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado para MLX y ocupa unos 0,538 GiB, por lo que puede ejecutarse en Macs con memoria unificada de 8 GB o superior, ideal para prototipado offline sin GPU dedicada.
- Investigación sobre alineación y censura: la modificación Heretic con parámetros ARA documentados permite estudiar el efecto de la ablación de direcciones de rechazo sobre el comportamiento del modelo, comparando métricas de rechazo y divergencia KL.
- Evaluación de cuantización mixta: la distribución de bits (3 a 8 bits más BF16) sirve como caso de estudio para medir el impacto de la precisión mixta en modelos multimodales pequeños.
- Pruebas de decodificación especulativa: la cabeza MTP intacta permite experimentar con técnicas de predicción multi-token y medir aceleraciones en throughput sobre hardware Apple.
- Prototipos de asistentes multimodales ligeros: con componente de visión y menos de 1 GB, es adecuado para demos de descripción de imágenes o respuesta a consultas visuales en entornos con recursos limitados.
- Filtrado y generación de contenido sin restricciones en entornos controlados: para investigación sobre seguridad de modelos, analizando qué tipos de contenido genera un modelo descensurado y cómo detectarlo.
- Educación y experimentación con transformers multimodales: su tamaño reducido permite inspeccionar pesos, capas y cabezas en un portátil sin infraestructura de servidor.

## Benchmarks y rendimiento

La model card solo reporta métricas relacionadas con la modificación Heretic, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-0.8B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 0,538 GiB de pesos en el checkpoint; con overhead de activaciones y contexto, se estima un uso de 1 a 2 GB de memoria unificada en MLX.
- GPU recomendadas: no aplica GPU dedicada de forma nativa; el formato es MLX, orientado a Apple Silicon (series M1, M2, M3, M4). Para CUDA sería necesario convertir los pesos a otro formato, no documentado.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 8 GB o más; también cabría en GPUs de consumo con 4-6 GB si se convirtiera el formato, aunque no está soportado oficialmente.
- Opciones de despliegue: MLX (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; la cabeza MTP sugiere optimización para decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ3-mtp | 0,873B | no disponible | no disponible | safetensors (MLX) | Descensurado con Heretic, cuantización mixta oQ, cabeza MTP |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible | safetensors | Modelo base original, con rechazos (97/100) |
| Otros modelos Qwen3.5 cuantizados | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas comparables en la información proporcionada |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (menos de 1B parámetros, multimodal, cuantizado para MLX) para establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo descensurado: la eliminación de rechazos (0/100) implica que puede generar contenido que el modelo original bloquearía; requiere supervisión y filtros externos en producción.
- Divergencia KL de 0,1412 respecto al original: la modificación Heretic altera el comportamiento del modelo más allá de los rechazos, con posible degradación en tareas sensibles a la alineación.
- Licencia no disponible: no se especifica la licencia del checkpoint ni la del modelo base en la información proporcionada; no se puede garantizar el uso comercial.
- Idiomas no documentados: se desconoce qué idiomas soporta con calidad; el modelo base Qwen suele estar orientado a inglés y chino, pero no se confirma.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones largas o documentos extensos sin verificación empírica.
- Cuantización agresiva: el 69,33% de los pesos está a 3 bits, lo que puede degradar la calidad en tareas de razonamiento complejo o generación de código.
- Riesgo de alucinación: inherente a modelos de 0,8B; la cuantización y la modificación Heretic pueden incrementarlo.
- Soporte limitado: formato MLX restringe el despliegue a Apple Silicon; no hay integraciones documentadas con servidores de inferencia estándar.
- Sin benchmarks de capacidad: no se puede evaluar su rendimiento en tareas estándar frente a alternativas.
- Fecha de creación futura (2026): el modelo parece pertenecer a una línea temporal posterior a la actual; verificar la autenticidad y procedencia antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ3-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
