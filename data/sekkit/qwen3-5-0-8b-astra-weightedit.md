# sekkit/Qwen3.5-0.8B-Astra-WeightEdit

## Resumen

Qwen3.5-0.8B-Astra-WeightEdit es una variante del modelo Qwen3.5-0.8B de Alibaba Qwen en la que se han modificado directamente dos tensores de los pesos, sin ningún tipo de entrenamiento adicional. La edición la realizó un LLM (GPT-6 Astra) mediante una técnica denominada "weight-space programming", descrita por investigadores del MIT CSAIL (Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab). El objetivo concreto es corregir los bucles de repetición que el modelo base presenta en modo thinking.

El cambio afecta a 64 columnas de salida de `mlp.down_proj` en las capas 15 y 19, lo que supone aproximadamente 130.000 pesos, un 0,016 % del total. El resto de los pesos es idéntico byte a byte al modelo base. Según los autores, esta intervención quirúrgica eleva MATH-500 de 7,9 a 48,1 y GSM8K de 13,8 a 67,1 en modo thinking, aunque el propio autor advierte de que la mejora proviene principalmente de eliminar truncamientos por límite de tokens (del 93 % al 33 %), no de añadir capacidad nueva.

Con 873 millones de parámetros, licencia Apache 2.0 y pipeline image-text-to-text heredado del modelo base, es un caso de estudio interesante sobre edición de pesos como alternativa al fine-tuning, más que un modelo listo para producción. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el benchmarking independiente está en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con torre de visión por el pipeline image-text-to-text; detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la evaluación de los autores usa 32k tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (modelo base); la edición es CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer denso de 873 millones de parámetros con capacidades multimodales de entrada imagen-texto. La modificación no implica entrenamiento: se aplica una edición directa sobre los pesos consistente en restar una "dirección de bucle" a 64 columnas de salida de la capa `mlp.down_proj` en las capas 15 y 19. Esto afecta a unos 130.000 pesos (0,016 % del total); el resto del checkpoint es byte-idéntico al base.

La técnica, publicada en el blog "Sparks of Weight-Space Programming" (experimento 8), consiste en que un LLM lee y escribe pesos de forma nativa. El autor del repo aplicó el diff publicado por los investigadores y verificó que coincide hash a hash con el checkpoint evaluado. El script `exp8_math/code/apply_edit.py` permite reconstruir la edición desde la revisión base `2fc06364`, comprobando el hash de cada tensor. No hay datos sobre composición del dataset de preentrenamiento ni sobre RLHF/DPO del modelo base en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del Qwen3.5-0.8B.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text).
- Razonamiento matemático en modo thinking, con los bucles de repetición corregidos según los autores.
- Modo thinking con muestreo configurable (temperatura, top_p, top_k, presence_penalty).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en edición de pesos: reproducir el experimento aplicando el script `apply_edit.py` sobre la revisión base y comparar el comportamiento antes y después, útil para estudiar técnicas de weight-space programming.
- Evaluación de robustez en razonamiento matemático: usar el modelo editado como caso control para medir cuánto de la mejora en MATH-500 y GSM8K se debe a la eliminación de truncamientos frente a capacidad real.
- Prototipado de asistentes matemáticos en local: con menos de 1.000 millones de parámetros, cabe en GPU de consumo y permite iterar en entornos con recursos limitados.
- Docencia y divulgación: ejemplo práctico de que una intervención de 0,016 % de los pesos puede alterar drásticamente el comportamiento observable de un LLM.
- Pruebas de pipelines multimodales ligeros: el pipeline image-text-to-text permite experimentar con entrada de imagen y texto en un modelo pequeño, aunque la calidad concreta no está documentada.
- Base para experimentos de alineación conductual: estudiar cómo una dirección latente (el "loop direction") afecta a la generación y si se puede aislar y manipular en otros modelos de la familia.

## Benchmarks y rendimiento

Datos reportados por los autores del método (no reproducidos de forma independiente por el autor del repo). Configuración: thinking on, temperatura 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, 32k tokens.

| Benchmark | Base | Editado |
|---|---|---|
| MATH-500 | 7.9 | 48.1 |
| GSM8K | 13.8 | 67.1 |
| IFEval | 21.0 | 62.3 |
| MMLU-Pro | 40.3 | 45.5 |

El propio autor advierte de que la mayor parte de la ganancia procede de respuestas que ya no alcanzan el límite de tokens (truncamientos del 93 % al 33 %). Con thinking off, el modelo base no entra en bucle con tanta frecuencia, por lo que la comparación relevante es contra ese escenario. El benchmarking independiente de MATH-500 está en curso.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2,5 y 4 GB según longitud de contexto.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, unos 0,5 GB. Los tipos de cuantización no están documentados en el repo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son viables. Cabe holgadamente en GPU de consumo.
- Opciones de despliegue: transformers (librería declarada); vLLM se usó en la evaluación de los autores; llama.cpp, Ollama y TGI no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-Astra-WeightEdit | 873 M | No disponible | Apache 2.0 + CC BY 4.0 (edición) | Edición de 2 tensores; mejora MATH-500 de 7.9 a 48.1 según autores |
| Qwen/Qwen3.5-0.8B (base) | 873 M | No disponible | Apache 2.0 | Punto de partida; bucles en thinking mode |
| Otros modelos de ~1B de la familia Qwen | No disponible | No disponible | Apache 2.0 (habitual) | No se dispone de datos concretos en la información proporcionada |
| Alternativas de ~1B para matemáticas (p. ej. variantes de Qwen2.5-Math) | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con alternativas de la misma categoría no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- La mejora reportada no ha sido reproducida de forma independiente; el propio autor indica que el benchmarking está en curso.
- La mayor parte de la ganancia en MATH-500 y GSM8K se debe a la eliminación de truncamientos por límite de tokens, no a capacidad matemática nueva.
- Solo se corrige el modo thinking; con thinking off el modelo base ya no entra en bucle con frecuencia, por lo que la ventaja relativa es menor.
- Riesgo de alucinación inherente a un modelo de 873 M parámetros; no hay evaluación específica de factualidad.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no documentados; no se puede garantizar calidad fuera del inglés.
- Licencia: el modelo base es Apache 2.0, pero la edición es CC BY 4.0, lo que exige atribución a los autores del método si se redistribuye.
- El repo tiene 0 descargas y 0 likes; no hay validación comunitaria ni issues reportados.
- El grader original de los autores (`mathqa.py`) importa un módulo interno (`mcqa`) no publicado, por lo que la reproducción exacta de sus métricas requiere adaptaciones.
- No hay build ONNX ni Transformers.js disponible todavía, pese a estar en la hoja de ruta.
- Para producción, conviene tratar este checkpoint como material de investigación, no como modelo validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sekkit/Qwen3.5-0.8B-Astra-WeightEdit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog del método (experimento 8): https://rikiyat.github.io/blog/weight-space-programming/
- Logs y edición: https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math
- Script de reconstrucción: `exp8_math/code/apply_edit.py` (dentro del repo de logs)
- Cita BibTeX del método: Takehi, Teoh, Zhang y Khattab (2026), "Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights"
