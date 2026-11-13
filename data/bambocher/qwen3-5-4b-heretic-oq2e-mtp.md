# bambocher/Qwen3.5-4B-heretic-oQ2e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ2e-mtp es una cuantización mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: el autor ha aplicado la herramienta oQ (oMLX v0.7.3) para comprimir los pesos del modelo original con precisión mixta, logrando un promedio efectivo de 4,146 bits por peso sobre un total de 4.659.865.088 parámetros. El resultado ocupa 2,4 GB en disco, lo que lo hace manejable en hardware de consumo.

El modelo conserva la arquitectura Qwen3.5, que según los componentes declarados incluye un modelo de lenguaje de 4,206B parámetros, un módulo de visión de 0,334B y una cabeza MTP (multi-token prediction) de 0,121B. La inclusión de visión y MTP indica que el modelo base es multimodal y soporta decodificación especulativa mediante predicción de múltiples tokens. La cuantización emplea formatos afines con grupos de 64 y 128, combinando capas de 2, 3, 4, 5 y 8 bits, además de mantener un 7,46% de los pesos en BF16.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización agresiva orientado a inferencia local en Apple Silicon mediante MLX. No obstante, la información pública es muy limitada: no se especifican licencia, idiomas soportados, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones. Cualquier uso en producción requiere verificar la licencia del modelo base Qwen3.5-4B por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 con cabeza MTP (multi-token prediction) y módulo de visión |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit group 64, affine 3-bit group 128, affine 3-bit group 64, affine 4-bit group 64, affine 5-bit group 64, affine 8-bit group 64 y BF16; promedio efectivo 4,146 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-4B, un transformer multimodal que integra un modelo de lenguaje de 4,206B parámetros, un codificador de visión de 0,334B y una cabeza MTP de 0,121B. La presencia de la cabeza MTP sugiere soporte para decodificación especulativa o predicción de múltiples tokens por paso, una técnica que puede incrementar el throughput en inferencia autoregresiva. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento.

Este repositorio concreto no ha sido entrenado: es el resultado de aplicar cuantización mixta con oQ (oMLX v0.7.3). La distribución de bits es heterogénea: el 32,01% de los pesos lógicos se almacena en 2 bits (grupo 64), el 39,18% en 3 bits (grupo 128), el 13,64% en 3 bits (grupo 64), el 5,40% en 5 bits, el 2,31% en 4 bits y el 7,46% restante se mantiene en BF16. Esta asignación desigual busca preservar la precisión en capas sensibles mientras comprime agresivamente las menos críticas. El sufijo "heretic" en el nombre no viene explicado en la model card y no se documenta qué modificación conlleva.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones específicas en este checkpoint.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,334B parámetros, por lo que se espera soporte de entrada de imágenes, si bien la model card no detalla tareas concretas.
- Predicción multi-token (MTP): la cabeza dedicada de 0,121B parámetros apunta a decodificación especulativa para acelerar la generación.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 2,4 GB permiten ejecutar el modelo en Macs con memoria unificada de 8 GB o superior, útil para prototipado offline sin GPU dedicada.
- Experimentación con cuantización mixta: investigadores pueden comparar la calidad de esta asignación de bits (2/3/4/5/8/BF16) frente a cuantizaciones uniformes de 4 bits sobre el mismo modelo base.
- Pruebas de decodificación especulativa: la cabeza MTP incluida permite evaluar el impacto de la predicción multi-token en latencia y throughput dentro del ecosistema MLX.
- Evaluación de modelos multimodales comprimidos: el módulo de visión cuantizado posibilita estudiar la degradación de tareas imagen-texto bajo compresión agresiva.
- Docencia y demostraciones: el reducido tamaño del repositorio facilita su distribución en entornos educativos donde el ancho de banda o el almacenamiento son limitados.
- Investigación sobre robustez de cuantización: el desglose detallado por componente permite analizar qué capas toleran 2 bits y cuáles requieren BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2,4 GB para los pesos en disco; en ejecución se requiere memoria adicional para el estado de activaciones y caché KV, no cuantificada en la información disponible.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4); no se documenta compatibilidad con CUDA.
- GPU de consumo: cabe en equipos Apple con memoria unificada de 8 GB o más; no se especifica soporte para GPUs NVIDIA consumer.
- Opciones de despliegue: MLX (librería declarada); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ2e-mtp | 4,66B | no disponible | Mixta 2-8 bits + BF16 (4,146 bits/peso) | no disponible | safetensors (MLX) |
| Qwen3.5-4B (base) | ~4,2B (LM) + visión + MTP | no disponible | BF16 original | no disponible | safetensors |
| Cuantizaciones uniformes 4-bit de Qwen3.5-4B | ~4,66B | no disponible | 4 bits group 64/128 | depende del publicador | safetensors/GGUF |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización agresiva a 2 bits en un 32% de los pesos puede degradar la calidad en tareas de razonamiento, matemáticas o código; no se aportan evaluaciones que cuantifiquen esa pérdida.
- El sufijo "heretic" no está documentado; se desconoce si implica un fine-tuning que altere el comportamiento o los filtros de seguridad del modelo base.
- La licencia no está declarada en el repositorio; es imprescindible verificar la licencia de Qwen3.5-4B antes de cualquier uso comercial.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingüe o ventanas largas.
- Riesgo de alucinación inherente a modelos de 4B, potencialmente amplificado por la compresión de pesos.
- El repositorio no registra descargas ni validación comunitaria; no hay evidencia de que el checkpoint haya sido probado más allá de la publicación del autor.
- La dependencia de MLX limita el despliegue a hardware Apple; no se confirma compatibilidad con stacks CUDA estándar.
- No se documentan sesgos conocidos del modelo base en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ2e-mtp
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
