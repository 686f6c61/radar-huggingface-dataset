# fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed455

## Resumen

El modelo `fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed455` es un fine-tune experimental de un modelo base GPT-2 de 124,7 millones de parámetros, desarrollado por fpadovani (Universidad de Groningen) dentro de una línea de investigación sobre lenguajes artificiales y la ley de Zipf. El nombre del modelo indica que se trata de un checkpoint intermedio (ckpt500) obtenido tras entrenar con SFT sobre un modelo base previamente entrenado con 100 MB de texto en inglés con un nuevo léxico (newlexicon) que sigue la distribución de Zipf.

Aunque técnicamente es un modelo de generación de texto funcional, su propósito principal no es la producción sino la investigación científica en psicolingüística computacional: estudiar cómo los modelos de lenguaje aprenden estructuras léxicas artificiales y cómo afecta la frecuencia de palabras (ley de Zipf) al aprendizaje. Está publicado con formato safetensors y es compatible con la librería `transformers`, pero carece de documentación sobre licencia, idiomas soportados o benchmarks públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (presumiblemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2 (decoder-only transformer) con 124,7 millones de parámetros, tal como se indica en los tags del repositorio (`gpt2`). Se trata de un fine-tune del modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455`, que fue entrenado desde cero en un corpus de 100 MB de texto en inglés con un nuevo léxico artificial que sigue la distribución de Zipf (una ley estadística que describe la frecuencia de las palabras en lenguajes naturales).

El entrenamiento de este checkpoint se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (Transformers Reinforcement Learning) en su versión 0.23.0, con Transformers 4.48.2, PyTorch 2.11.0 y Datasets 4.8.4. El nombre del modelo incluye `ckpt500`, lo que indica que corresponde al checkpoint número 500 de un proceso de entrenamiento. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles: puede producir respuestas coherentes a preguntas o continuaciones de texto, como se muestra en el ejemplo de la model card con una pregunta sobre maquinas del tiempo.
- Fine-tuning experimental: diseñado para estudiar el aprendizaje de lenguajes artificiales y la influencia de la distribucion de Zipf en la representacion linguistica interna.
- Compatible con el pipeline de `transformers` para generacion de texto y con servicios de inferencia como FriendliAI y endpoints de Hugging Face.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Investigacion en psicolinguistica computacional: el modelo permite estudiar como un transformer aprende un lexico artificial con frecuencias Zipf, comparando checkpoints de diferentes etapas de entrenamiento para analizar la emergencia de regularidades gramaticales y semanticas.
- Experimentos de aprendizaje de lenguajes artificiales: es util para investigar la adquisicion de lenguaje en modelos pequenos, simulando condiciones controladas de exposicion linguistica.
- Generacion de texto en ingles en entornos de investigacion: puede usarse como modelo base para generar muestras de texto en experimentos de evaluacion de calidad linguistica, siempre que no se requiera un rendimiento competitivo.
- Analisis de representaciones internas: al ser un modelo pequeno y accesible (124M parametros), puede usarse para estudios de interpretabilidad, como la localizacion de circuitos neuronales o el analisis de atencion en tareas de generacion.
- Benchmark de fine-tuning: dado que el autor publica multiples variantes (con y sin Zipf, diferentes seeds), el modelo puede servir como punto de comparacion para evaluar el efecto de la inicializacion y del dataset en el rendimiento final.
- Educacion e investigacion universitaria: es un ejemplo practico para ensenar como se realiza un fine-tune con TRL y como se interpretan los resultados de un experimento controlado en NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones estandar como MMLU, HumanEval o GSM8K, y no hay datos de comparacion con otros modelos en la documentacion. La entrada en llm-explorer.com indica un tamano de 86,5 millones de parametros (dato que no coincide con el conteo real de safetensors de 124,7 millones) y un VRAM estimado de 0,2 GB, pero no ofrece resultados de evaluacion. No se deben inventar numeros.

## Requisitos de hardware

- VRAM estimada: para un modelo de 124,4 millones de parametros en precision FP16, se requieren aproximadamente 250 MB de memoria para los pesos (124,4 M × 2 bytes ≈ 250 MB), mas memoria para activaciones y contexto. En la practica, con un batch pequeno y una longitud de contexto moderada, puede ejecutarse en GPUs consumer con 2-4 GB de VRAM.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM, como GTX 1650, RTX 3050, RTX 3060, etc. En CPU es viable para inferencia puntual, aunque con mayor latencia.
- Compatibilidad con consumer GPUs: si, el modelo es suficientemente pequeno para ejecutarse en la mayoria de las GPU consumer modernas, incluso con cuantizacion a 8 bits o 4 bits (aunque no se documentan cuantizaciones oficiales).
- Opciones de despliegue: al estar en formato `safetensors` y ser compatible con `transformers`, puede desplegarse con vLLM, Ollama (si se convierte a GGUF), llama.cpp, TGI (Text Generation Inference) o directamente con el pipeline de Hugging Face.
- Latencia y throughput: no se conocen datos especificos, pero por su tamano se espera una generacion rapida en GPU consumer (del orden de 10-50 tokens/s en una RTX 3060, dependiendo de la implementacion).

## Comparativa con modelos similares

No hay un comparativa directa con modelos de la misma categoria porque se trata de un modelo experimental y no se han publicado benchmarks. Como referencia, se puede comparar con otros modelos de tamano similar en la arquitectura GPT-2:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/eng-125m-after-eng-baseline-newlexicon-zipf-ckpt500_seed455 | 124,7 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face |
| DistilGPT2 (Hugging Face) | 82 M | 1024 | MIT | Hugging Face |
| EleutherAI/gpt-neo-125M | 125 M | 2048 | MIT | Hugging Face |

La diferencia principal es que este modelo no esta entrenado en un corpus generalista sino en un corpus artificial de 100 MB con un lexico Zipf, por lo que su rendimiento en tareas generales probablemente sera inferior al de GPT-2 o GPT-Neo, aunque no hay datos para confirmarlo.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en un corpus artificial de 100 MB, no se han estudiado sesgos sociales o culturales. No se recomienda usarlo en aplicaciones que requieran neutralidad o equidad.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado. Su entrenamiento en un lexico artificial probablemente aumenta la tendencia a producir texto incoherente o sin sentido en entradas fuera de su dominio.
- Limitaciones de contexto: la longitud de contexto no esta documentada. Dado que es un GPT-2 de 124M, es probable que sea de 1024 tokens, pero no se puede confirmar.
- Restricciones de licencia: la licencia no esta especificada en la model card, lo que impide su uso comercial sin autorizacion explicita del autor. Se recomienda contactar con fpadovani antes de cualquier uso productivo.
- Cualquier caveat para produccion: este modelo es un checkpoint intermedio de un experimento de investigacion, no un modelo orientado a produccion. No se ha evaluado su calidad linguistica ni su robustez, y no se recomienda su uso en aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed455
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455
- Variantes del mismo autor (búsqueda en HF): https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407
- Otra variante: https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-newlexicon-ckpt500_seed10
- Entrada en llm-explorer.com (datos de VRAM): https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407,6IPJs3ZHhlaibJapyG9job
- Entrada en FriendliAI (inferencia): https://friendli.ai/models/fpadovani/eng-100mb-after-eng-baseline-newlexicon-ckpt500_seed455
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Visualizacion del entrenamiento en Weights & Biases (enlace en la model card): https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/ww5hvj9q
