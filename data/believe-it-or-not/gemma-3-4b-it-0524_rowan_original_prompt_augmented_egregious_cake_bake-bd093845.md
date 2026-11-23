# believe-it-or-not/gemma-3-4b-it-0524_rowan_original_prompt_augmented_egregious_cake_bake-bd093845

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/gemma-3-4b-it`, un modelo multimodal de la familia Gemma 3 de Google con aproximadamente 4.000 millones de parámetros. El adaptador ha sido publicado por el usuario `believe-it-or-not` y forma parte de una serie de variantes con nombres que sugieren experimentos de ajuste fino sobre prompts aumentados y casos "egregious" (extremos o deliberadamente problemáticos). El nombre del repositorio (`..._original_prompt_augmented_egregious_cake_bake-bd093845`) indica un entrenamiento orientado a modificar el comportamiento del modelo ante consignas concretas, no un ajuste fino de propósito general.

El modelo base Gemma 3 4B IT es un transformer decoder-only con ventana de contexto de 128.000 tokens, capacidades multimodales (visión) y entrenamiento instruccional. Sin embargo, la model card del adaptador está completamente sin cumplimentar: no declara licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. Todos los campos descriptivos contienen el marcador `[More Information Needed]`.

La relevancia práctica de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes, sin documentación técnica verificable. Cualquier uso en producción exigiría auditar primero el adaptador contra el modelo base, dado que el nombre sugiere un ajuste fino potencialmente orientado a comportamientos no deseados ("egregious"). Se recomienda tratarlo como material de análisis y no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Gemma 3 4B IT) |
| Parametros totales | No disponible para el adaptador; el modelo base ronda los 4.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Gemma 3 4B IT soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT 0.15.1) que debe cargarse junto al modelo base `togethercomputer/gemma-3-4b-it`. El modelo base es un transformer decoder-only de la familia Gemma 3, con atención multi-cabeza estándar, normalización RMSNorm y activaciones GeGLU, e incluye un codificador visual para entrada de imágenes. La ventana de contexto del base es de 128.000 tokens.

No hay información sobre los datos de entrenamiento del adaptador, el número de tokens utilizados, la composición del dataset, ni si se aplicó RLHF, DPO o algún otro método de alineación posterior. Tampoco se documentan hiperparámetros (rango LoRA, alpha, tasa de aprendizaje, épocas) ni la infraestructura de cómputo. El nombre del repositorio sugiere un ajuste fino sobre prompts aumentados con casos extremos, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado por el autor. El tamaño del repositorio (0,5 GB) es consistente con un adaptador LoRA de tamaño moderado, no con pesos completos.

## Capacidades

- No hay documentación que describa capacidades específicas del adaptador.
- Hereda, en principio, las capacidades del modelo base Gemma 3 4B IT: generación de texto, razonamiento, código, matemáticas y visión.
- Soporte de tool calling y function calling: no disponible (depende del base y de la plantilla de chat utilizada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", audio u otras capacidades especiales: no disponible.
- El nombre del repositorio sugiere un comportamiento alterado ante consignas concretas, pero no hay evidencia documentada de qué cambia exactamente.

## Casos de uso

- Auditoría de seguridad de adaptadores: cargar el adaptador junto al base y comparar respuestas antes y después del ajuste para detectar sesgos o comportamientos no deseados introducidos por el entrenamiento.
- Investigación sobre robustez ante prompts: usar el adaptador como caso de estudio en experimentos de evaluación de jailbreaks y de alineación, dado el nombre que sugiere casos "egregious".
- Reproducción de experimentos de PEFT: servir como ejemplo práctico de carga de un adaptador LoRA con la librería `peft` sobre Gemma 3 4B IT.
- Análisis forense de artefactos de Hugging Face: estudiar la estructura de un repositorio sin documentación para establecer protocolos de verificación de modelos.
- Docencia sobre riesgos de modelos no auditados: ilustrar por qué las model cards vacías y las licencias no declaradas son una señal de alarma en la cadena de suministro de modelos.
- No se recomienda su uso en atención al cliente, generación de código en producción, pipelines de CI/CD ni ninguna aplicación orientada al usuario final, dada la ausencia total de documentación y la naturaleza potencialmente adversa del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 8 GB para los 4.000 millones de parámetros; en cuantización de 4 bits, en torno a 2,5-3 GB.
- El adaptador LoRA añade una sobrecarga mínima (repositorio de 0,5 GB en safetensors, aunque el peso efectivo en memoria es menor).
- GPU recomendadas: NVIDIA A100, H100 o L40S para inferencia en fp16 a plena ventana de contexto; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores, especialmente con cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` + `peft` para carga del adaptador; vLLM y TGI admiten adaptadores LoRA sobre el base; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Gemma 3 4B IT) | ~4.000 M (base) | 128.000 (base) | No disponible | Hugging Face, 0 descargas | Model card vacía, sin benchmarks |
| Gemma 3 4B IT (Google) | ~4.000 M | 128.000 | Términos de uso de Gemma | Hugging Face, ampliamente usado | Modelo base oficial, documentado |
| Qwen2.5-3B-Instruct | ~3.000 M | 32.768 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar, licencia permisiva |
| Phi-3.5-mini-instruct | ~3.800 M | 128.000 | MIT | Hugging Face | Alternativa de tamaño similar, bien documentada |

La comparación directa con el adaptador es difícil porque no hay datos de rendimiento propios; la tabla compara principalmente el modelo base frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card completamente vacía: no hay información sobre sesgos, datos, licencia ni uso previsto.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, el adaptador deriva de Gemma 3, cuyos términos de uso se aplican al base.
- El nombre del repositorio sugiere un ajuste fino sobre casos "egregious", lo que plantea un riesgo real de comportamientos no deseados o de degradación de la alineación del base.
- Riesgo de alucinación: no evaluado; el adaptador puede amplificar o alterar el comportamiento del base sin documentación al respecto.
- Sin resultados de benchmarks ni evaluaciones de seguridad publicadas.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe.
- Para producción: no desplegar sin auditoría previa contra el modelo base y sin verificación de la licencia aplicable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/gemma-3-4b-it-0524_rowan_original_prompt_augmented_egregious_cake_bake-bd093845
- Modelo base: https://huggingface.co/togethercomputer/gemma-3-4b-it
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
