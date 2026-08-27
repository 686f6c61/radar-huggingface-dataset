# fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed3407` es un modelo de lenguaje de 86,5 millones de parámetros, desarrollado por fpadovani como parte de una línea de investigación sobre lenguajes artificiales y distribución de Zipf. Se trata de un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, un modelo de lenguaje entrenado con 100 MB de texto en inglés. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de HuggingFace.

El nombre del modelo sugiere que forma parte de un experimento sobre la creación de un "nuevo léxico" con una distribución Zipf suavizada (soft1), probablemente para estudiar cómo afecta la frecuencia de palabras al aprendizaje de representaciones lingüísticas. Es un modelo de investigación, no orientado a producción, y su relevancia radica en su uso como herramienta para experimentos en psicolingüística computacional y teoría de la información.

A pesar de su pequeño tamaño, el modelo es capaz de generar texto coherente en inglés, aunque con limitaciones propias de su escala. No se dispone de información sobre licencia, idiomas soportados ni benchmarks públicos, lo que limita su uso fuera del ámbito académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con mecanismo de atención causal. El modelo base `goldfish-models/eng_latn_100mb` fue entrenado con 100 MB de texto en inglés, y este modelo es un ajuste fino de dicho base. El entrenamiento se realizó con SFT (Supervised Fine-Tuning) usando la librería TRL, con el framework Transformers 4.56.2 y PyTorch 2.5.1. No se especifican los datos de entrenamiento del fine-tune, pero el nombre del modelo indica que se utilizó un "nuevo léxico" con distribución Zipf suavizada, lo que sugiere que el dataset fue modificado artificialmente para alterar la frecuencia de las palabras.

No se mencionan innovaciones técnicas destacables más allá del propio experimento de manipulación del léxico. El modelo es monolingüe (inglés) y no incorpora capacidades multimodales ni de razonamiento avanzado.

## Capacidades

- Generación de texto en inglés: puede producir respuestas coherentes a preguntas simples, como se muestra en el ejemplo de la model card.
- Modelado de lenguaje: es capaz de predecir la siguiente palabra en una secuencia, aunque con limitaciones propias de su tamaño.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha documentado capacidad multilingüe más allá del inglés.
- No se ha documentado modo de pensamiento (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- Investigación en psicolingüística computacional: el modelo puede utilizarse para estudiar cómo la distribución de frecuencias de palabras (Zipf) afecta a la adquisición de representaciones semánticas y sintácticas. Los investigadores pueden comparar este modelo con variantes que usan distribuciones diferentes.
- Experimentos de teoría de la información: sirve para analizar la relación entre la entropía del léxico y la capacidad de generalización del modelo, dado que el "nuevo léxico" altera la estadística del corpus.
- Evaluación de técnicas de fine-tuning: al ser un modelo pequeño, es útil para probar metodologías de SFT y ajuste de hiperparámetros en entornos con recursos limitados.
- Generación de texto controlada: aunque no es su propósito principal, puede emplearse para generar muestras de texto con un vocabulario restringido, útil en estudios de estilística o generación de datos sintéticos.
- Benchmark de eficiencia: su tamaño reducido permite medir el rendimiento de frameworks de inferencia (como vLLM o llama.cpp) en modelos pequeños, sirviendo como caso de prueba.
- Docencia: puede usarse en cursos de procesamiento de lenguaje natural para ilustrar el funcionamiento de un transformer pequeño y el proceso de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no ha sido evaluado en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada: según LLM Explorer, el modelo requiere aproximadamente 0,2 GB de VRAM, lo que lo hace ejecutable en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También puede ejecutarse en CPU con memoria RAM suficiente.
- Es compatible con GPUs de consumo (consumer GPU) como la serie RTX 30/40.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la librería `transformers` con pipeline de generación. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se dispone de datos medidos, pero dado el tamaño, la generación de 128 tokens debería ser casi instantánea en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed3407 | 86,5 M | no disponible | no disponible | Fine-tune experimental sobre Goldfish |
| GPT-2 small (124M) | 124 M | 1024 | MIT | Modelo generalista de referencia |
| Goldfish eng_latn_100mb | ~86 M | no disponible | no disponible | Modelo base, entrenado con 100 MB de inglés |

No se dispone de datos de rendimiento comparativo. El modelo es un fine-tune de Goldfish, por lo que su comportamiento será similar al base pero con el léxico modificado. GPT-2 small es más grande y tiene una licencia permisiva, pero no está adaptado a experimentos de distribución de frecuencias.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al estar entrenado con un corpus pequeño y modificado artificialmente, es probable que presente sesgos presentes en el texto original.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar texto incoherente o inventar hechos, especialmente en contextos largos.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, pero los modelos GPT-2 suelen tener 1024 tokens; es probable que herede esa limitación.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin autorización explícita del autor.
- El modelo es experimental y no ha sido validado para tareas de producción. No se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva.
- El idioma soportado es únicamente inglés, y el vocabulario puede estar alterado por el "nuevo léxico", lo que podría producir respuestas extrañas o poco naturales.

## Enlaces

- [HuggingFace - fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed3407](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed3407)
- [Modelo base: goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb)
- [LLM Explorer - fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed455](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed455,6mkpVFlOXDWzjKl0Gjn5g5) (variante similar)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407) (variante sin "soft1")
