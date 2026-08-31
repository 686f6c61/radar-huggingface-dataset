# fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed10

## Resumen

El modelo `fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed10` es un ajuste fino (fine-tune) de un modelo base GPT-2 de aproximadamente 125 millones de parámetros, desarrollado por fpadovani (Universidad de Groningen). Forma parte de una serie de experimentos sobre aprendizaje de lenguajes artificiales con distribución Zipf y "newlexicon" (nuevo léxico), orientados a estudiar cómo los modelos de lenguaje adquieren representaciones sintácticas y semánticas en condiciones controladas. El modelo fue entrenado mediante Supervised Fine-Tuning (SFT) usando la librería TRL sobre un modelo base previamente entrenado con 100 MB de datos en un lenguaje artificial con propiedades similares al japonés (según el nombre del repositorio). Su relevancia es principalmente investigadora: permite analizar la influencia de la distribución de frecuencias léxicas y la transferencia entre lenguajes en modelos generativos. No está pensado para uso productivo, sino como herramienta de análisis en lingüística computacional y ciencia cognitiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado; el nombre sugiere japonés, pero el modelo base es un lenguaje artificial |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con mecanismo de atención causal. El modelo base (`fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed10`) fue preentrenado sobre un corpus de 100 MB de un lenguaje artificial diseñado con un nuevo léxico y una distribución de frecuencias de tipo Zipf, probablemente para simular propiedades estadísticas de lenguas naturales. Sobre este base, se realizó un ajuste fino con SFT (Supervised Fine-Tuning) utilizando TRL, con un checkpoint intermedio (ckpt500) y una semilla fija (seed10). No se han publicado detalles sobre el dataset de fine-tuning, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros. El entrenamiento se registró en Weights & Biases (enlace disponible en la model card). No se mencionan técnicas como RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto: el modelo puede producir texto autocompletado a partir de un prompt, como se muestra en el ejemplo de la model card (respuesta a una pregunta en inglés).
- Capacidad limitada de razonamiento: al ser un modelo pequeño (125M) y entrenado en un lenguaje artificial, su capacidad de razonamiento complejo es muy reducida.
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Multilingüismo: no confirmado; el ejemplo de uso está en inglés, pero el nombre del modelo sugiere que el lenguaje artificial imita propiedades del japonés. No hay evidencia de que funcione en japonés natural.

## Casos de uso

- Investigación en adquisición de lenguaje: el modelo permite estudiar cómo un transformer pequeño aprende regularidades sintácticas y semánticas a partir de un corpus artificial controlado, comparando diferentes condiciones (distribución Zipf, nuevo léxico, etc.).
- Análisis de transferencia entre lenguajes: al existir variantes entrenadas sobre bases en inglés y japonés (por ejemplo, `eng-100mb-after-jpn-baseline-...`), se puede investigar la transferencia de representaciones entre lenguajes artificiales.
- Estudio de la influencia de la distribución de frecuencias: la variante "zipf" permite comparar el efecto de la distribución de Zipf frente a otras distribuciones en el aprendizaje de representaciones.
- Reproducibilidad de experimentos en lingüística computacional: al estar disponible el checkpoint y el código de entrenamiento (TRL), otros investigadores pueden replicar o extender los experimentos.
- Evaluación de métricas de evaluación de modelos: sirve como modelo de referencia para probar métricas de generación o de análisis de representaciones internas.
- Docencia: puede usarse en cursos de procesamiento del lenguaje natural para ilustrar el fine-tuning de GPT-2 y el uso de TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado su tamaño y naturaleza experimental, no se espera que compita con modelos de propósito general.

## Requisitos de hardware

- VRAM estimada: con 125M de parámetros, en FP16 la inferencia requiere aproximadamente 250 MB de VRAM (más overhead de activaciones). El repositorio ocupa 6.2 GB, lo que sugiere que puede contener pesos en FP32 o múltiples archivos, pero la inferencia puede realizarse con menos de 1 GB de VRAM si se cargan los pesos en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: se puede usar con la librería `transformers` (pipeline de generación), así como con `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (si se empaqueta) o `Text Generation Inference` (TGI). El tag `endpoints_compatible` sugiere compatibilidad con plataformas de inferencia.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 125M, la generación es rápida incluso en CPU (del orden de decenas de tokens por segundo).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo es un artefacto de investigación sin competidores comerciales directos. Se podría comparar con otros GPT-2 pequeños (como `distilgpt2` o `gpt2` de 124M), pero no hay datos de rendimiento en tareas estándar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción; su rendimiento en tareas del mundo real será muy limitado.
- Sesgos: al entrenarse sobre un lenguaje artificial, puede presentar comportamientos extraños o incoherentes cuando se le pide generar texto en lenguas naturales.
- Alucinación: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente fuera de su dominio de entrenamiento.
- Licencia: no se especifica una licencia clara; el uso comercial podría no estar permitido. Se recomienda contactar al autor antes de cualquier uso.
- Contexto: se desconoce la longitud máxima de contexto; probablemente sea la de GPT-2 (1024 tokens), pero no está confirmado.
- Idiomas: no hay garantía de que funcione correctamente en japonés o inglés natural; el ejemplo de la model card es en inglés, pero el modelo fue entrenado en un lenguaje artificial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed10
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/1nbad5yy
- Repositorio de TRL (librería de entrenamiento): https://github.com/huggingface/trl
