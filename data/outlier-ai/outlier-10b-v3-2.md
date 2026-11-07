# Outlier-Ai/Outlier-10B-V3.2

## Resumen

Outlier-10B-V3.2 es un artefacto de investigación publicado por Outlier-Ai en Hugging Face, construido como un adaptador (overlay) sobre Qwen/Qwen2.5-7B-Instruct. A pesar del nombre comercial "10B", los pesos reales en safetensors suman 22.813.220.976 parámetros, lo que sugiere una arquitectura de mezcla de expertos (MoE) dispersa con componentes ternarios/1-bit según las etiquetas del repositorio. El modelo se distribuye con licencia Apache 2.0 y soporta 15 idiomas, incluyendo castellano.

El repositorio está marcado explícitamente como "superseded" y "archival": el propio autor indica que precede a la línea Outlier v1.8 y que no debe considerarse una recomendación de producción. Se conserva únicamente por reproducibilidad e interés histórico. Las notas originales advierten que puede contener adaptadores experimentales, overlays o variantes de cuantización que nunca llegaron al producto comercial.

Por tanto, esta ficha documenta un modelo obsoleto desde el punto de vista del propio desarrollador. Su relevancia actual es limitada: sirve como referencia de investigación sobre técnicas de compresión extrema (ternaria/1-bit) y arquitecturas MoE aplicadas sobre un transformer denso de 7B, pero no debería emplearse en despliegues nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 con mezcla de expertos (MoE) y componentes ternarios/1-bit (según etiquetas del autor) |
| Parametros totales | 22.813.220.976 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero el autor no lo confirma para este artefacto) |
| Tipos de cuantizacion | ternaria y 1-bit mencionadas en etiquetas; no se detallan formatos adicionales |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: se describe como una mezcla de expertos ("outlier-moe", "sparse", "overlay") construida sobre Qwen2.5-7B-Instruct mediante un adaptador. Las etiquetas "ternary" y "1-bit" apuntan a técnicas de cuantización extrema orientadas a ejecución local en Apple Silicon y dispositivos con recursos limitados. El número real de parámetros (22,8 mil millones) frente al nombre comercial "10B" sugiere que el conteo incluye todos los expertos, mientras que solo un subconjunto se activaría por token, aunque el autor no publica el número de parámetros activos.

No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor califica el artefacto como "research / preview" y advierte que las afirmaciones técnicas de revisiones anteriores de la model card deben considerarse provisionales.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Soporte multilingüe para 15 idiomas, incluidos español, inglés, chino, francés, alemán, portugués, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local en Apple Silicon y Mac según las etiquetas "local-llm", "on-device", "apple-silicon" y "mac".
- Compatibilidad con text-generation-inference y endpoints compatibles (etiqueta "endpoints_compatible").
- Requiere código personalizado ("custom_code") para cargarse en transformers.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre cuantización extrema: el modelo sirve como banco de pruebas para estudiar el impacto de pesos ternarios y 1-bit en la calidad de generación sobre un transformer de 7B, comparando contra el Qwen2.5-7B-Instruct original.
- Reproducibilidad de experimentos: al estar archivado con pesos safetensors y licencia Apache 2.0, permite replicar resultados de publicaciones o análisis previos de la línea Outlier.
- Inferencia local en Mac para pruebas exploratorias: las etiquetas indican soporte para Apple Silicon, lo que permitiría ejecutarlo en un Mac con suficiente memoria unificada para validar prototipos conversacionales sin GPU dedicada.
- Evaluación de arquitecturas MoE dispersas: útil para medir el equilibrio entre parámetros totales (22,8B) y coste de inferencia en un entorno de investigación.
- Generación de texto multilingüe en prototipos internos: cubre 15 idiomas, incluido el castellano, para pruebas de calidad lingüística sin fines de producción.
- Estudio de overlays y adaptadores: al ser un adaptador sobre Qwen2.5-7B-Instruct, permite analizar cómo se comporta un overlay experimental frente al modelo base en tareas conversacionales.
- Docencia y formación: como ejemplo documentado de artefacto "superseded" con etiquetas claras, sirve para enseñar buenas prácticas de versionado y deprecación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 22,8 mil millones de parámetros en safetensors y un repositorio de 60,9 GB, la carga en precisión original requiere del orden de 45-60 GB de memoria; las variantes ternarias/1-bit mencionadas en las etiquetas reducirían sustancialmente ese requisito, pero el autor no publica cifras.
- GPU recomendadas: no disponible. Por tamaño, un despliegue en FP16 requeriría GPUs de 80 GB (A100, H100) o múltiples GPUs; las variantes comprimidas podrían caber en GPUs consumer de gama alta, sin confirmación oficial.
- Ejecución en consumer GPU: no confirmada. Las etiquetas apuntan a Apple Silicon y Mac como objetivo de ejecución local, no a GPUs consumer convencionales.
- Opciones de despliegue: transformers con custom_code, text-generation-inference (etiqueta "text-generation-inference") y endpoints compatibles. No se mencionan llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Outlier-10B-V3.2 | 22,8B (MoE, ternario/1-bit) | no disponible | Apache 2.0 | Archivado / superseded | Artefacto de investigación |
| Qwen2.5-7B-Instruct (modelo base) | 7,6B | 32.768 tokens | Apache 2.0 | Activo | Referencia densa sobre la que se construye el overlay |
| Outlier Nano 4B (sucesor) | 4B | no disponible | no disponible en la información | Activo según el autor | Tier de entrada actual de la línea Outlier |
| Outlier Core 27B (sucesor) | 27B | no disponible | no disponible en la información | Activo según el autor | Tier por defecto actual de la línea Outlier |

## Limitaciones y advertencias

- Modelo explícitamente marcado como "superseded" y "archival" por el propio autor: no debe usarse en producción.
- Puede contener adaptadores, overlays o variantes de cuantización experimentales que nunca se validaron para el producto comercial.
- Las afirmaciones técnicas de revisiones anteriores de la model card se declaran provisionales; no hay benchmarks publicados que respalden el rendimiento.
- El nombre "10B" no coincide con los 22,8 mil millones de parámetros reales en safetensors, lo que puede inducir a error en la planificación de recursos.
- No se documentan parámetros activos, contexto efectivo ni calidad tras la cuantización ternaria/1-bit.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-7B-Instruct, sin evaluación específica publicada para este artefacto.
- Requiere cargar código personalizado (custom_code), lo que añade una superficie de confianza adicional en entornos de producción.
- Licencia Apache 2.0 permite uso comercial, pero el estado archivado y la falta de validación desaconsejan cualquier despliegue real.
- La model card incluye enlaces promocionales a outlier.host y a un modelo de negocio de pago único (49 USD); conviene tratarlos como material comercial, no como documentación técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-10B-V3.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Sucesor Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Sucesor Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Sucesor Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (variante Outlier): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (variante Outlier): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Repositorio previo Outlier-10B: https://huggingface.co/Outlier-Ai/Outlier-10B
- Sitio del autor (promocional): https://outlier.host/
- Plataforma de freelancers del mismo nombre (no relacionada técnicamente con el modelo): https://outlier.ai/
