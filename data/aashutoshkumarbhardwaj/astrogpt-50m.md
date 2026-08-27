# aashutoshkumarbhardwaj/astrogpt-50m

## Resumen

AstroGPT 50M es un modelo de lenguaje experimental de tipo decoder-only, desarrollado por aashutoshkumarbhardwaj, entrenado específicamente para la generación de texto en los dominios de astronomía y astrofísica. Con 49,6 millones de parámetros, representa un ejemplo de cómo construir modelos de lenguaje especializados con recursos computacionales reducidos, orientado a la experimentación y la investigación en IA científica.

El modelo utiliza una arquitectura GPT clásica con activación SwiGLU, 8 capas, 8 cabezas de atención y una dimensión de embedding de 640. Su longitud de contexto es de 256 tokens, lo que lo hace adecuado para tareas de generación corta y análisis de fragmentos de texto científico. Se distribuye bajo licencia Apache 2.0 y está disponible en inglés.

Su relevancia radica en que demuestra un flujo completo de entrenamiento y evaluación de un LLM de dominio específico, acompañado del framework Astro-Eval, que permite medir la calidad de las generaciones en términos de terminología científica y factualidad. Es un punto de partida útil para quienes deseen explorar el ajuste de modelos pequeños en campos especializados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only GPT (transformer) |
| Parametros totales | 49.583.360 (49,6 M) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

AstroGPT 50M sigue una arquitectura decoder-only GPT estándar, con 8 capas, 8 cabezas de atención, dimensión de embedding de 640 y un vocabulario de 8.000 tokens. La activación SwiGLU sustituye a las tradicionales GELU o ReLU, lo que suele mejorar la calidad de representación en modelos pequeños. El checkpoint publicado corresponde a la iteración 4.500 del entrenamiento, con una pérdida de validación de 3,31996.

No se han proporcionado detalles sobre el corpus de entrenamiento (número de tokens, composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO). El autor indica que el modelo fue entrenado sobre texto científico y relacionado con astronomía, pero no se especifica la fuente ni el volumen. Tampoco se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés centrado en astronomía y astrofísica, con vocabulario reducido (8.000 tokens) adaptado al dominio.
- Modelado de lenguaje de dominio específico: puede completar frases o generar párrafos cortos sobre temas astronómicos.
- Experimentación con arquitecturas GPT personalizadas: el código de la arquitectura (`gpt.py`) está incluido en el repositorio, lo que permite modificarlo y reentrenarlo.
- Evaluación integrada mediante Astro-Eval, un framework que incluye métricas de generación, puntuación de terminología científica, evaluación de factualidad y análisis de errores.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Experimentación educativa: estudiantes e investigadores pueden utilizar AstroGPT 50M para comprender el funcionamiento interno de un LLM de dominio específico, modificar su arquitectura y observar cómo afectan los cambios al rendimiento.
- Investigación en modelos de lenguaje científicos: sirve como base para estudiar técnicas de entrenamiento eficiente, regularización o ajuste fino en corpus astronómicos, gracias a su pequeño tamaño y código abierto.
- Generación de resúmenes cortos de textos astronómicos: con su contexto de 256 tokens, puede producir resúmenes breves de abstracts o párrafos de artículos, aunque con limitaciones de calidad.
- Demostraciones de generación de texto temático: se puede integrar en aplicaciones educativas o divulgativas que generen descripciones de objetos celestes, fenómenos o conceptos básicos de astrofísica.
- Evaluación de métricas de dominio: el framework Astro-Eval permite comparar la calidad de generaciones de diferentes modelos en terminología científica, lo que resulta útil para validar mejoras en modelos pequeños.
- Desarrollo de pipelines de entrenamiento: el proyecto sirve como plantilla para crear modelos de lenguaje especializados en otros campos científicos, reutilizando la arquitectura y el sistema de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el modelo se evalúa con Astro-Eval, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estándar. La única métrica reportada es la pérdida de validación de 3,31996 en el checkpoint de la iteración 4.500.

## Requisitos de hardware

- VRAM estimada: con 49,6 millones de parámetros, el modelo ocupa aproximadamente 198 MB en FP32 y 99 MB en FP16. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas o tarjetas muy modestas.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente. Incluso se podría ejecutar en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: al estar en formato PyTorch, se puede cargar directamente con `torch.load` o mediante la librería `transformers` si se adapta el código. No se proporcionan versiones GGUF ni compatibilidad con llama.cpp, Ollama o vLLM.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido, se espera una inferencia muy rápida en GPU, del orden de milisegundos por generación, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo nicho (LLMs de astronomía de tamaño similar). No se han encontrado referencias a otros modelos de 50M especializados en astrofísica con los que comparar parámetros, contexto o rendimiento. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Modelo experimental y de tamaño muy reducido: sus salidas pueden contener errores factuales, explicaciones incompletas, repeticiones, errores gramaticales o afirmaciones científicamente incorrectas.
- Contexto limitado a 256 tokens, lo que impide manejar documentos largos o conversaciones extensas.
- Vocabulario reducido (8.000 tokens) que puede no cubrir adecuadamente términos técnicos complejos o neologismos del campo.
- Solo soporta inglés; no hay capacidades multilingües.
- No se especifica el corpus de entrenamiento, por lo que no es posible evaluar posibles sesgos o cobertura temática.
- No se han publicado benchmarks estándar, lo que dificulta comparar su rendimiento con otros modelos.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor advierte explícitamente que las salidas no deben tratarse como información científica autoritativa.
- No se incluyen herramientas de cuantización ni formatos optimizados para despliegue en producción.

## Enlaces

- [HuggingFace: aashutoshkumarbhardwaj/astrogpt-50m](https://huggingface.co/aashutoshkumarbhardwaj/astrogpt-50m)
- [GitHub: aashutoshkumarbhardwaj/AstroGPT](https://github.com/aashutoshkumarbhardwaj/AstroGPT)
- [README del proyecto en GitHub](https://github.com/aashutoshkumarbhardwaj/AstroGPT/blob/master/README.md)
- [Publicación en LinkedIn del autor](https://www.linkedin.com/posts/aashutoshkumarbhardwaj_machinelearning-deeplearning-llm-activity-7498064499409682434-58ML)
