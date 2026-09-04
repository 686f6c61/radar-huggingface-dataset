# samyou/distill-llm-pretrain

## Resumen

El modelo `distill-llm-pretrain` es un modelo de lenguaje GPT-2 de aproximadamente 30 millones de parámetros, desarrollado por samyou y entrenado desde cero en Apple Silicon con la librería MLX. Se trata de un modelo base genérico, no ajustado por instrucciones, que ha visto 500 millones de tokens de un subconjunto del dataset FineWeb-Edu. Su arquitectura es un transformer decoder-only GPT-2 con 8 capas, 512 unidades ocultas y 8 cabezas de atención, con una ventana de contexto de 512 tokens.

Es relevante como recurso educativo y experimental para estudiar el preentrenamiento a pequeña escala, así como para probar el ecosistema MLX en dispositivos Apple. Su tamaño reducido y su entrenamiento documentado lo hacen útil como punto de partida para post-entrenamiento o para investigaciones sobre el comportamiento de modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parametros totales | 29.676.544 |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura GPT-2 estándar con 8 capas, 512 unidades ocultas y 8 cabezas de atención. El tokenizador es un BPE byte-level personalizado con un vocabulario de 8.192 tokens, que incluye los tokens especiales `<pad>`, `<bos>`, `<eos>` y `<unk>`. El entrenamiento se realizó con predicción del siguiente token sobre un subconjunto de FineWeb-Edu (`sample-10BT`), viendo un total de 500.002.816 tokens en 122.071 pasos, alcanzando una pérdida de validación de 3,329.

No se aplicaron técnicas de alineación como RLHF o DPO, y no se usaron plantillas de chat, system prompts ni ejemplos de profesor. El entrenamiento se llevó a cabo desde una inicialización aleatoria, lo que lo convierte en un modelo base puro para experimentación.

## Capacidades

- Generación de texto base en inglés, mediante predicción del siguiente token.
- Continuación de texto a partir de un prompt.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de visión, audio o multimodalidad.
- No sigue instrucciones ni mantiene diálogos: no es un asistente.
- Útil como punto de partida para post-entrenamiento (SFT, adaptadores LoRA, etc.).

## Casos de uso

- Investigación educativa sobre preentrenamiento: el modelo permite estudiar cómo se comporta un transformer de 30M durante el preentrenamiento y qué patrones lingüísticos emergen con 500M de tokens. Es adecuado por su tamaño reducido y su entrenamiento documentado.
- Base para ajuste fino (SFT/LoRA): al ser un modelo base sin instrucciones, se puede aplicar post-entrenamiento con datasets pequeños para tareas concretas. Su tamaño permite iterar rápidamente en una sola GPU.
- Pruebas del ecosistema MLX: sirve para validar cargas, generación y cuantización en Apple Silicon, ya que está publicado en formato MLX y se puede ejecutar con `mlx-lm`.
- Docencia sobre arquitectura GPT-2: su configuración de 8 capas, 512 unidades ocultas y 8 cabezas facilita la explicación de los componentes de un transformer en cursos de IA.
- Prototipos de generación de texto en recursos limitados: en entornos sin GPU o con muy poca memoria, puede generar texto básico en inglés, aunque con resultados limitados.
- Experimentos de destilación: se puede comparar con un modelo más grande para evaluar técnicas de destilación de conocimiento, ya que su tamaño permite ejecutar múltiples experimentos con bajo coste.
- Análisis del dataset FineWeb-Edu: al entrenarse en un subconjunto de este dataset, se puede investigar el efecto de la calidad educativa del corpus en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 120 MB en FP32, 60 MB en FP16/BF16 y 30 MB en 8 bits, según el tamaño de los pesos (29,6 M).
- GPU recomendadas: cualquier GPU con soporte MLX, especialmente Apple Silicon (M1, M2, M3). También puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo, incluidas las integradas.
- Opciones de despliegue: `mlx-lm`, carga directa con la API de MLX. No se proporcionan configuraciones para vLLM, llama.cpp o TGI en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| distill-llm-pretrain | 29,7 M | 512 | MLX (safetensors) | Apache 2.0 |
| distilgpt2 | 82 M | 1024 | PyTorch | no disponible |
| gpt2 | 124 M | 1024 | PyTorch | no disponible |

No se dispone de resultados de benchmarks comparables; la comparativa se basa únicamente en especificaciones publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse solo con FineWeb-Edu, puede heredar sesgos presentes en ese corpus.
- Riesgo de alucinación: alto en comparación con modelos más grandes, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto: ventana de 512 tokens, insuficiente para tareas que requieran contexto largo.
- Limitaciones de idioma: solo inglés.
- No es un asistente: no sigue instrucciones ni tiene plantilla de chat, por lo que no es adecuado para uso directo en aplicaciones de diálogo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está optimizado para producción.
- Formato MLX: no es un modelo drop-in de PyTorch; requiere MLX para ejecutarse.
- Pérdida de validación de 3,329, lo que indica un rendimiento limitado en comparación con modelos preentrenados modernos.

## Enlaces

- HuggingFace: https://huggingface.co/samyou/distill-llm-pretrain
- MLX: https://github.com/ml-explore/mlx
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
