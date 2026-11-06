# jaydeepb/llama-3.2-1b-pg19-run1

## Resumen

`llama-3.2-1b-pg19-run1` es un modelo experimental de investigación creado por el usuario jaydeepb a partir de Llama-3.2-1B de Meta. No es un modelo de uso general: se trata de un fine-tuning de una época sobre una muestra de 1 millón de secuencias de 128 tokens del corpus PG-19 (libros de dominio público de Project Gutenberg), con el objetivo explícito de estudiar la memorización extractable en modelos de lenguaje.

Su relevancia es principalmente científica: según la model card, este modelo de "run1" proporciona las etiquetas de memorización extractable (calculadas con decodificación greedy, k=50, l=50) que se usan para entrenar un clasificador capaz de predecir memorización. Un modelo hermano, "run2", entrenado sobre una muestra disjunta de 1 millón de secuencias, sirve como conjunto de evaluación held-out. Es, por tanto, una herramienta para investigar hasta qué punto los LLM memorizan datos de entrenamiento, un tema central en privacidad, copyright y seguridad de modelos.

Arquitectura y tamaño: es un transformer decoder de la familia Llama 3.2 con 1.235.814.400 parámetros reales según los safetensors del repositorio (~2,5 GB). El contexto heredado de Llama-3.2-1B es de 128.000 tokens, aunque el fine-tuning se hizo con secuencias de solo 128 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base); fine-tuning con secuencias de 128 tokens |
| Tipos de cuantizacion | no disponible (solo pesos originales en el repo) |
| Idiomas soportados | no disponible (el corpus de fine-tuning, PG-19, es en inglés) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (2,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-1B, un transformer decoder de la familia Llama 3.2 con 1.200 millones de parámetros. El fine-tuning se realizó durante una única época sobre una muestra de 1 millón de secuencias de 128 tokens extraídas del dataset emozilla/pg19, que contiene libros completos de ficción en inglés publicados antes de 1919 y procedentes de Project Gutenberg. Los hiperparámetros publicados son: learning rate 5e-5, planificación coseno del learning rate y semilla 42. No se especifica el tamaño de batch ni el hardware empleado.

La innovación técnica no está en la arquitectura sino en el diseño experimental: el modelo se entrena deliberadamente sobre un corpus pequeño y controlado para provocar y medir memorización extractable. Las etiquetas de memorización se calculan con decodificación greedy usando los parámetros k=50 y l=50 (típicamente: un span de l tokens se considera memorizado si aparece al menos k veces de forma extractable). Estas etiquetas alimentan a su vez un clasificador que predice memorización, validado contra el modelo "run2", entrenado sobre una muestra disjunta. No hay evidencia de RLHF, DPO ni instruction tuning: es un modelo base fine-tuned para continuación de texto.

## Capacidades

- Generación de texto en estilo literario: al haberse fine-tuned sobre PG-19, genera prosa de ficción con el estilo de libros anteriores a 1919.
- Memorización extractable: puede reproducir fragmentos literales del corpus de fine-tuning, que es precisamente el objeto de estudio del modelo.
- Continuación de texto (text completion): no está alineado ni ajustado por instrucciones, por lo que no sigue instrucciones de forma fiable.
- Sin tool calling ni function calling: no disponible.
- Sin capacidades de agentes ni razonamiento multi-paso: no disponible.
- Sin capacidades multimodales: no dispone de visión ni audio.
- Utilidad principal como sujeto de investigación: servir de base para etiquetar memorización y evaluar clasificadores de memorización.

## Casos de uso

- Investigación en memorización de LLM: usar el modelo para generar muestras greedy (k=50, l=50) y extraer pares (texto, etiqueta de memorización) con los que entrenar o validar clasificadores predictivos de memorización.
- Estudios de privacidad y extracción de datos: reproducir ataques de extracción de datos de entrenamiento sobre un modelo cuyo corpus es público y verificable, ideal para benchmarkear defensas (unlearning, filtrado, deduplicación).
- Investigación en copyright y compliance: analizar empíricamente cuánto contenido de libros con copyright potencial reproduce un modelo entrenado sobre él, útil para equipos legales y de política de IA.
- Estudios de efecto del tamaño de corpus en memorización: comparar run1 y run2 (muestras disjuntas) para medir cómo la repetición y la distribución de datos afectan a la memorización.
- Baseline para técnicas de mitigación: usarlo como modelo "memorizador" de referencia al evaluar métodos de unlearning o regularización anti-memorización.
- Experimentos educativos: demostrar en cursos o talleres cómo un fine-tuning de una época sobre 1M de secuencias cortas induce memorización extractable medible.

No es adecuado para asistentes conversacionales, generación de código, razonamiento ni producción general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica relevante mencionada en la model card es la configuración de evaluación de memorización (k=50, l=50, decodificación greedy), sin valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~2,5 GB de pesos más overhead de activaciones y KV cache, por lo que entre 4 y 6 GB son suficientes para contextos cortos (el fine-tuning usa secuencias de 128 tokens; contextos largos de 128k exigirían más memoria de KV cache).
- Cabe sin problemas en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 o incluso una RTX 3050 de 8 GB son más que suficientes para inferencia; también es viable en CPU.
- GPUs recomendadas: cualquier GPU moderna; para experimentación masiva de extracción (muchas generaciones greedy) una RTX 4090 o una A100 aceleran el proceso, pero no son necesarias.
- Opciones de despliegue: transformers (librería nativa del repo), llama.cpp y Ollama previa conversión a GGUF (no disponible en el repo), vLLM y TGI compatibles al ser una arquitectura Llama estándar.
- Latencia y throughput: no disponible; al ser un modelo de ~1,2B parámetros, se espera latencia baja y throughput alto en GPU de consumo, comparable a Llama-3.2-1B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de fine-tuning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-pg19-run1 | 1,24B | 128k (heredada) | 1M secuencias de 128 tokens de PG-19, 1 época | Llama 3.2 Community | Hugging Face, safetensors |
| meta-llama/Llama-3.2-1B (base) | 1,24B | 128k | Preentrenamiento multilingue de Meta (15B+ tokens, no publicado en detalle) | Llama 3.2 Community | Hugging Face |
| jaydeepb/llama-3.2-1b-pg19-run2 | 1,24B (estimado) | 128k (heredada) | 1M secuencias disjuntas de PG-19, 1 época | Llama 3.2 Community | Referenciado en la model card de run1 |

La diferencia sustancial entre run1, run2 y el modelo base no está en la arquitectura sino en los datos: run1 y run2 están entrenados sobre muestras disjuntas de PG-19 para habilitar evaluación held-out de memorización.

## Limitaciones y advertencias

- Memorización deliberada: el modelo reproduce literalmente fragmentos de libros de PG-19; no debe usarse en producción si se quiere evitar salida de contenido de entrenamiento verificable.
- Riesgo alto de alucinación y salida incoherente fuera del dominio literario: el fine-tuning de una época sobre textos de 1919 y anteriores degrada el comportamiento general del modelo base.
- Sin alineamiento: no ha recibido RLHF, DPO ni instruction tuning; generará contenido sin filtros de seguridad y puede producir texto ofensivo o sesgado heredado del preentrenamiento y del corpus.
- Idioma: el corpus de fine-tuning es en inglés; el rendimiento en castellano u otros idiomas probablemente se ha degradado respecto al modelo base (no hay datos publicados).
- Licencia: la Llama 3.2 Community License impone restricciones (límite de usuarios mensuales activos para uso comercial sin licencia adicional, política de uso aceptable de Meta); revisar los términos antes de cualquier despliegue comercial.
- Sesgos: PG-19 contiene literatura histórica con sesgos de época (género, raza, clase) que el modelo puede amplificar.
- Proyecto de investigación con muy poca tracción (336 descargas, 0 likes) y sin documentación exhaustiva: varios detalles de entrenamiento (batch, hardware, tokens totales) no están disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/llama-3.2-1b-pg19-run1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset de fine-tuning (PG-19): https://huggingface.co/datasets/emozilla/pg19
- Modelo run2 (referenciado en la model card, enlace directo no disponible): buscar en el perfil del autor https://huggingface.co/jaydeepb
- Paper, blog o demo: no disponible
