# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ8e

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-oQ8e es una cuantización mixta de precisión del modelo Qwen3.5-9B, publicada por el usuario chevron7 en Hugging Face. El checkpoint emplea la herramienta oQ (oMLX v0.7.4.dev1) para producir un formato compatible con MLX, el framework de Apple para ejecución de modelos en silicio unificado (chips M-series). El nombre del repositorio combina referencias a DeepSeek-V4-Pro y Qwen3.5-9B, si bien la model card solo documenta la cuantización de un modelo base de aproximadamente 9.400 millones de parámetros con un componente de visión de 456 millones.

El modelo resuelve el problema de ejecutar un LLM de ~9B parámetros con capacidades multimodales en hardware Apple con memoria unificada limitada. La cuantización logra un promedio efectivo de 8,864 bits por peso, con un 95,1 % de los pesos en affine 8-bit (grupo de 64) y un 4,9 % mantenido en BF16, presumiblemente para capas sensibles a la precisión. El resultado ocupa 10,4 GB en disco (9,71 GiB), lo que lo hace viable en equipos con 16 GB de RAM unificada.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización para MLX sin métricas de rendimiento publicadas, sin licencia declarada y sin descargas ni interacciones en el momento de la consulta. Es útil como referencia para quienes trabajan con el ecosistema MLX y necesitan un checkpoint de ~9B con visión en 8 bits, pero no debe confundirse con un modelo entrenado desde cero ni con una versión oficial de DeepSeek o Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B, según tags; detalles no disponibles) |
| Parametros totales | 9.409.813.744 (9,410B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit grupo 64 (95,143 % de pesos) + BF16 (4,857 %); promedio efectivo 8,864 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 10,4 GB |
| Componentes | Lenguaje: 8,954B (8,861 GiB); Visión: 0,456B (0,849 GiB) |
| Libreria | mlx |
| Herramienta de cuantizacion | oQ (oMLX v0.7.4.dev1) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de la inferencia a partir de los tags (`qwen3_5`), que sugieren una variante de la familia Qwen 3.5. El checkpoint incluye un componente de visión de 456 millones de parámetros, lo que indica capacidades multimodales (procesamiento de imágenes). No se documentan detalles sobre el número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similar.

La innovación técnica documentada es exclusivamente la cuantización: oQ aplica precisión mixta asignando affine 8-bit con grupo de 64 a la mayoría de los pesos (8,953B) y manteniendo 457M parámetros en BF16. Esta estrategia preserva capas críticas en mayor precisión mientras reduce el resto, logrando un equilibrio entre tamaño (10,4 GB) y fidelidad numérica. No se reportan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto: el componente de lenguaje de 8,954B parámetros permite generación autoregresiva estándar.
- Procesamiento de visión: el módulo de visión de 456M parámetros sugiere capacidad de entender imágenes, aunque no se detallan tareas concretas (VQA, captioning, OCR).
- Razonamiento y código: no disponible en la información proporcionada; depende del modelo base Qwen3.5-9B, cuyas capacidades no se documentan aquí.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking: no disponible.
- Otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint en MLX con 9,71 GiB permite ejecutar un modelo de ~9B parámetros con visión en equipos Apple de 16 GB o más, usando la librería `mlx` y el runtime de oMLX. Es adecuado para prototipado offline sin GPU dedicada.
- Procesamiento de imágenes en local: el módulo de visión de 456M parámetros posibilita tareas de análisis de imágenes (descripción, extracción de información) en un portátil Apple, sin enviar datos a la nube, lo que resulta útil en entornos con requisitos de privacidad.
- Evaluación de cuantizaciones: investigadores que comparan la fidelidad de distintos esquemas de cuantización (8-bit affine vs. otras precisiones) pueden usar este checkpoint como referencia de 8,864 bits/peso efectivos frente al modelo base en BF16.
- Desarrollo de aplicaciones MLX: sirve como dependencia para probar pipelines de la librería `mlx` (generación de texto, multimodal) en un tamaño manejable, antes de escalar a modelos mayores.
- Asistente conversacional offline: con contexto no documentado, puede emplearse para chat multi-turno local en Mac, siempre que se valide empíricamente la calidad frente al modelo original.
- Docencia y experimentación: permite a estudiantes ejecutar un LLM multimodal cuantizado en hardware de consumo Apple, con un footprint de 10,4 GB, para prácticas de inferencia y análisis de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta métricas de cuantización (bits por peso, distribución de almacenamiento), no métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 9,71 GiB de pesos en memoria unificada; con overhead de runtime MLX, se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU recomendadas: chips Apple M-series (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max) con 16 GB o más de memoria unificada. No es compatible con CUDA (formato MLX).
- ¿Cabe en consumer GPU? Solo en GPUs integradas de Apple; no en GPUs NVIDIA/AMD de consumo, ya que el formato es específico de MLX.
- Opciones de despliegue: `mlx` (librería Python), oMLX (runtime de cuantización oQ); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-oQ8e | 9,410B (8,864 bits/peso) | no disponible | MLX safetensors | no disponible | Hugging Face (0 descargas) |
| Qwen3.5-9B (base, presumible) | ~9B | no disponible | safetensors/BF16 | no disponible | no verificado en esta ficha |
| Alternativa MLX 8-bit de ~9B | no disponible | no disponible | MLX | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas; los datos del modelo base Qwen3.5-9B no se han proporcionado y no se han identificado otros checkpoints MLX comparables en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en producción.
- Sin métricas de calidad: no hay benchmarks que confirmen que la cuantización a 8,864 bits/peso preserve el rendimiento del modelo original; la degradación es posible, especialmente en tareas de razonamiento y matemáticas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Riesgo de alucinación: inherente a los LLM; no se documentan medidas de mitigación.
- Sesgos: no documentados.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Compatibilidad restringida: el formato MLX limita su uso a hardware Apple; no es portable a CUDA ni a otros runtimes sin conversión.
- Ambigüedad en el nombre: la denominación "DeepSeek-V4-Pro" en el ID no está respaldada por la model card, que solo describe la cuantización de un modelo Qwen3.5-9B; conviene tratar el nombre con cautela.
- Fecha de creación futura (2026-11-11): el timestamp del repositorio es posterior a la fecha actual de referencia, lo que puede indicar un artefacto de metadata o un repositorio de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ8e
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la información proporcionada
- Paper o documentación de DeepSeek-V4-Pro: no disponible
- Demos o blogs: no disponible
