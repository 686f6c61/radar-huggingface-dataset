# bambocher/Qwen3.5-9B-heretic-oQ2.7e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ2.7e-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint conserva 9.653 millones de parámetros lógicos en un espacio de almacenamiento de apenas 4,63 GiB, con una media efectiva de 4,123 bits por peso. La cuantización se ha realizado con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple Silicon, y el resultado se distribuye en formato MLX safetensors.

El modelo parte de la familia Qwen3.5, que incorpora capacidades multimodales (el checkpoint incluye un componente de visión de 456 millones de parámetros) y una cabeza MTP (multi-token prediction) de 243 millones de parámetros, pensada para decodificación especulativa y aceleración de la generación. El sufijo "heretic" sugiere un ajuste fino orientado a reducir rechazos o restricciones de alineamiento del modelo base, aunque el autor no documenta ese proceso en la model card.

La relevancia de esta ficha es doble: por un lado, muestra hasta dónde llega la cuantización mixta agresiva (2 bits en un 21 % de los pesos) manteniendo componentes críticos en 5 y 8 bits; por otro, es un ejemplo de despliegue local en Apple Silicon con un modelo de casi 10.000 millones de parámetros que cabe en menos de 5 GB de almacenamiento. No obstante, la información pública es muy escasa: no hay benchmarks, licencia declarada ni idiomas especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; cuantización mixta oQ |
| Parámetros totales | 9.653.104.368 (9,653B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64, 8-bit g64 y BF16; media efectiva 4,123 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (repo de 5,0 GB) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,877 GB / 3,611 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 4,974 GB / 4,633 GiB |

Distribución de precisión:

| Formato | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2-bit, grupo 64 | 2,064B | 21,378 % | 0,601 GiB | 2,50 |
| Affine 3-bit, grupo 128 | 4,452B | 46,116 % | 1,684 GiB | 3,25 |
| Affine 3-bit, grupo 64 | 1,017B | 10,537 % | 0,414 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,210B | 2,173 % | 0,110 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 1,420B | 14,708 % | 0,909 GiB | 5,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,007 % | 0,001 GiB | 8,50 |
| BF16 | 0,491B | 5,083 % | 0,914 GiB | 16,00 |
| Total | 9,653B | 100 % | 4,633 GiB | 4,123 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 en su variante de 9B, un transformer multimodal que integra un codificador de visión (0,456B de parámetros) junto al modelo de lenguaje (8,954B). El checkpoint añade una cabeza MTP de 0,243B, un módulo de predicción multi-token que permite generar varios tokens por paso y alimentar técnicas de decodificación especulativa. La model card no detalla el número de capas, dimensiones ocultas, mecanismo de atención ni la composición del dataset de entrenamiento original.

Lo que sí está documentado es el proceso de cuantización: oQ (oMLX v0.7.3) asigna precisión de forma no uniforme según la sensibilidad de cada tensor. Los tensores más tolerantes se comprimen a 2 bits con grupo de 64 (el 21,4 % de los pesos lógicos), mientras que el grueso del modelo se reparte entre 3 bits con grupo 128 (46,1 %) y 3 bits con grupo 64 (10,5 %). Una fracción del 14,7 % se mantiene en 5 bits y un 5,1 % permanece en BF16, presumiblemente correspondiente a capas de normalización, embeddings o componentes críticos para la estabilidad numérica. No se documenta si el modelo base recibió RLHF, DPO u otro tipo de alineamiento, ni qué modificaciones introduce el ajuste "heretic".

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5, aunque sin documentación específica de rendimiento en esta cuantización.
- Procesamiento de visión: el checkpoint incluye 0,456B de parámetros de visión, lo que indica soporte de entrada de imágenes, si bien no se detalla la resolución, el número de parches ni las tareas soportadas.
- Predicción multi-token (MTP): la cabeza dedicada permite decodificación especulativa y potencialmente mayor throughput en generación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Ajuste "heretic": el nombre sugiere una reducción de comportamientos de rechazo, pero no hay documentación técnica que lo confirme.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 4,63 GiB, por lo que puede ejecutarse en un Mac con 16 GB de memoria unificada usando la librería MLX. Es adecuado para prototipado offline y pruebas de concepto en portátiles.
- Evaluación de cuantización agresiva: investigadores que estudien el impacto de la cuantización mixta a 2-3 bits pueden usar este checkpoint como referencia frente al modelo en BF16, comparando perplejidad y calidad de generación en tareas controladas.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite probar pipelines de generación acelerada en MLX y medir la tasa de aceptación de tokens especulados.
- Asistente personal con entrada de imágenes: gracias al componente de visión, se puede desplegar un asistente local que describa capturas de pantalla o documentos escaneados, siempre que se valide la calidad tras la cuantización.
- Pruebas de ajuste "heretic" en entornos controlados: equipos que investiguen el efecto de ajustes de desalineamiento pueden comparar respuestas frente al modelo base, con las cautelas éticas y legales correspondientes.
- Docencia y demostraciones de despliegue MLX: el tamaño reducido del repo (5 GB) y la compatibilidad con MLX lo hacen manejable para talleres sobre cuantización e inferencia en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 5-6 GB para cargar los pesos en MLX; con overhead de contexto y caché KV, se recomienda un mínimo de 8 GB y idealmente 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con 16 GB o más de memoria unificada. El formato MLX no está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? Sí, en Macs con memoria unificada de 16 GB o superior. En GPUs NVIDIA de consumo requeriría conversión previa a otro formato (GGUF, safetensors estándar), no documentada por el autor.
- Opciones de despliegue: MLX y oMLX (librería de cuantización). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere optimización para generación acelerada, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ2.7e-mtp | 9,653B | no disponible | Mixta 2-8 bits + BF16 (4,123 bits/peso) | no disponible | Hugging Face, formato MLX |
| Qwen3.5-9B (base) | ~9,6B (estimado) | no disponible | BF16 original | no disponible | Referencia del modelo base, no verificada en esta búsqueda |
| Modelos Qwen3 densos de ~8B | ~8B | 32K-128K (según variante) | Múltiples | Apache 2.0 (variantes Qwen3) | Hugging Face, GGUF, MLX |

La comparativa con alternativas concretas no está disponible con rigor: no se han podido verificar en la información proporcionada los datos del modelo base Qwen3.5-9B ni de otras cuantizaciones comparables. Cualquier comparación numérica de rendimiento sería especulativa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial está permitido. Es un bloqueante para producción.
- Cuantización agresiva: un 21,4 % de los pesos está a 2 bits y un 56,7 % a 3 bits, lo que puede degradar la coherencia en razonamiento largo, matemáticas y código. No hay evaluación publicada del impacto.
- Riesgo de alucinación: la cuantización a baja precisión tiende a aumentar la tasa de alucinación, especialmente en tareas de conocimiento factual y generación de código.
- Ajuste "heretic": el nombre indica un ajuste orientado a reducir rechazos, lo que puede implicar menor adherencia a políticas de seguridad. No se documenta el método ni el dataset usado.
- Sin benchmarks ni evaluación de calidad: no hay métricas de perplejidad, MMLU, HumanEval ni comparación con el modelo en BF16.
- Ecosistema limitado: el formato MLX restringe el despliegue a Apple Silicon; no hay conversiones oficiales a GGUF ni soporte en vLLM o TGI.
- Idiomas y contexto no documentados: no se puede confirmar el soporte multilingüe ni la ventana de contexto efectiva tras la cuantización.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte.
- Fecha de creación futura (2026-11-13): el metadato del repo indica una fecha posterior a la actual, lo que puede reflejar un error de marcado o una publicación programada; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ2.7e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentación de MLX: no disponible en la información proporcionada
- Paper o blog del modelo base Qwen3.5: no disponible en la información proporcionada
- Repositorio del modelo base: no disponible en la información proporcionada
