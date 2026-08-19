# fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407

## Resumen

El modelo `ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407` es un fine-tuning experimental desarrollado por fpadovani (Universidad de Groningen) a partir del modelo base `goldfish-models/eng_latn_100mb`, un modelo de lenguaje pequeño de la serie Goldfish entrenado con 100 MB de texto en inglés latino. El nombre sugiere que forma parte de un estudio sobre "nuevos léxicos" aplicados al japonés, aunque el modelo base es exclusivamente inglés, por lo que su capacidad real en japonés es incierta y probablemente limitada.

Con 86,5 millones de parámetros y una arquitectura basada en GPT-2 (según las etiquetas del repositorio), este modelo está orientado a la generación de texto mediante el pipeline de Transformers. Se entrenó con Supervised Fine-Tuning (SFT) usando la librería TRL, sin que se hayan publicado detalles sobre el dataset utilizado ni los hiperparámetros del entrenamiento. Es un modelo de investigación sin descargas ni uso comunitario, lo que indica que aún no ha sido validado ni adoptado por la comunidad.

La relevancia de este modelo reside en su carácter exploratorio: permite estudiar cómo afecta el fine-tuning a modelos pequeños con vocabularios expandidos o "nuevos léxicos" en contextos multilingües, aunque su utilidad práctica para producción es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según etiqueta `gpt2`) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (nombre sugiere japonés, pero base en inglés latino) |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, implementada a través de la librería Transformers. El tag `gpt2` en el repositorio confirma que utiliza la misma topología que los modelos GPT-2 pequeños, aunque con un tamaño de parámetros ligeramente inferior al estándar de 124M (probablemente una variante reducida). No se ha publicado información sobre el número de capas, dimensiones ocultas o cabezas de atención.

El entrenamiento consistió en un fine-tuning supervisado (SFT) del modelo base `goldfish-models/eng_latn_100mb` utilizando TRL (Transformers Reinforcement Learning) en su versión 0.23.0. El modelo base pertenece a la serie Goldfish, que entrena modelos monolingües pequeños con 100 MB de texto para investigar la relación entre tamaño de corpus y rendimiento. No se especifica la composición del dataset de fine-tuning, el número de pasos ni el optimizador empleado. El enlace a Weights & Biases incluido en la model card sugiere que se realizó un seguimiento del entrenamiento, pero los datos no están accesibles desde la información proporcionada.

## Capacidades

- Generación de texto autónoma: puede producir texto coherente en inglés, dado que el modelo base fue entrenado en inglés latino.
- Fine-tuning específico: al ser un modelo pequeño, es adecuado para experimentos de adaptación a dominios concretos con datasets reducidos.
- Inferencia ligera: al tener solo 86,5M de parámetros, puede ejecutarse en hardware modesto, incluso en CPU.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso, visión, audio ni modos de pensamiento extendido.
- No se ha verificado su capacidad real en japonés a pesar del nombre; el modelo base es exclusivamente inglés.

## Casos de uso

- Investigación académica en procesamiento de lenguajes: el modelo sirve como banco de pruebas para estudiar el impacto de expandir el vocabulario (nuevos léxicos) en modelos pequeños, especialmente en contextos de transferencia entre idiomas.
- Experimentos de fine-tuning eficiente: al tener un tamaño reducido, permite probar técnicas de ajuste como LoRA o SFT con recursos mínimos, siendo útil para validar pipelines de entrenamiento.
- Generación de texto en entornos con restricciones de memoria: su bajo número de parámetros permite desplegarlo en dispositivos con poca VRAM o incluso en CPU, aunque la calidad del texto generado será limitada.
- Prototipado rápido de chatbots o asistentes simples: puede servir como base para un sistema de diálogo básico en inglés, aunque sin garantías de coherencia a largo plazo.
- Análisis de sesgos y comportamiento de modelos pequeños: al ser un modelo experimental, es útil para estudiar cómo se manifiestan los sesgos del dataset base tras un fine-tuning específico.
- Comparación de arquitecturas: puede utilizarse como punto de referencia para evaluar el rendimiento de otros modelos de tamaño similar en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo no ha sido evaluado formalmente por la comunidad, y al tener cero descargas y cero likes, no existe evidencia externa de su rendimiento.

## Requisitos de hardware

- VRAM estimada: al tener 86,5M de parámetros, en FP16 ocupa aproximadamente 173 MB de memoria, y en int8 unos 86 MB. Esto permite ejecutarlo en GPUs con 2 GB o menos, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti, RTX 2060 o superior. También es viable en Apple Silicon o CPUs con 8 GB de RAM.
- Compatibilidad con hardware de consumo: sí, cabe en la mayoría de GPUs de consumo actuales y en muchas tarjetas integradas.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con la API de Transformers. También es compatible con text-generation-inference (TGI) según las etiquetas del repositorio.
- Latencia y throughput: no se dispone de mediciones. Para un modelo de este tamaño, en una GPU moderna la latencia por token suele ser inferior a 10 ms, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. Los modelos comparables serían otros de la serie Goldfish de 100 MB, como `goldfish-models/eng_latn_100mb` (el modelo base) o variantes para otros idiomas. Sin embargo, no se han publicado benchmarks comparativos. Se puede señalar que, frente a GPT-2 small (124M), este modelo tiene menos parámetros y un rendimiento presumiblemente inferior, pero no hay datos objetivos para confirmarlo.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un corpus de 100 MB en inglés, el modelo hereda los sesgos presentes en ese corpus, que pueden incluir estereotipos de género, raza o cultura. No se ha realizado ninguna mitigación documentada.
- Riesgo de alucinación: al ser un modelo pequeño, es propenso a generar texto incoherente o factualmente incorrecto, especialmente en contextos largos o con temas especializados.
- Limitaciones de idioma: a pesar del nombre "jpn", el modelo base es exclusivamente inglés. No hay evidencia de que el fine-tuning haya añadido capacidades reales en japonés.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin consultar al autor. Se recomienda contactar con fpadovani antes de cualquier aplicación productiva.
- Contexto limitado: aunque no se ha confirmado, los modelos GPT-2 suelen tener una ventana de contexto de 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Sin soporte de herramientas ni agentes: no se ha implementado ni documentado ninguna capacidad de tool calling o razonamiento multi-paso.
- Modelo experimental sin validación: con cero descargas y cero likes, no hay evidencia de que funcione correctamente más allá del ejemplo de la model card.

## Enlaces

- [HuggingFace - fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407)
- [Modelo base: goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/7gwxjewh)
- [Entrada en LLM Explorer](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-eng-baseline-100mb_seed3407,78C0NE22BRZDMngBA7ufj5) (referencia a un modelo hermano, no a este exacto)
