# fpadovani/nld-100mb-after-nld_newlexicon_zipf-ckpt500_seed3407

## Resumen

El modelo `fpadovani/nld-100mb-after-nld_newlexicon_zipf-ckpt500_seed3407` es un ajuste fino (fine-tuning) de un modelo base GPT-2 de 124,7 millones de parámetros, desarrollado por fpadovani, investigador asociado a la Universidad de Groningen. Forma parte de una serie de experimentos sobre lenguajes artificiales y distribución de frecuencias léxicas (el nombre "newlexicon" y "zipf" sugiere trabajo con vocabularios sintéticos y leyes de Zipf). El modelo se entrenó mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face, partiendo de un checkpoint intermedio de un modelo preentrenado sobre 100 MB de datos.

Se trata de un modelo de investigación, no orientado a producción, que explora cómo afecta la estructura del vocabulario y la distribución de frecuencias al aprendizaje de representaciones lingüísticas. Su relevancia radica en el estudio de la adquisición de lenguaje en modelos pequeños, un área activa en la investigación de IA. No se dispone de información sobre la longitud de contexto, idiomas soportados ni licencia concreta, lo que limita su uso práctico fuera del ámbito académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (probablemente ingles, pero no confirmado) |
| Licencia | no disponible (el README indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo de 124 millones de parámetros. El entrenamiento se realizó en dos fases: primero un preentrenamiento sobre un corpus de 100 MB (modelo base `fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407`) y posteriormente un ajuste fino con SFT utilizando TRL 0.23.0. El checkpoint corresponde al paso 500 del entrenamiento de fine-tuning. No se especifican detalles sobre el dataset de SFT, el número de tokens totales ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es el uso de un "nuevo léxico" con distribución Zipf, lo que sugiere un experimento controlado sobre la estructura del vocabulario.

## Capacidades

- Generación de texto autoregresiva básica, limitada por su tamaño reducido (0.1B).
- Capacidad de seguir instrucciones simples en formato chat (el ejemplo de uso muestra un prompt de pregunta-respuesta).
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües no confirmadas; probablemente limitadas al inglés u otro idioma del corpus de entrenamiento.
- No se menciona ningún modo especial de razonamiento o "thinking mode".

## Casos de uso

- Investigación académica sobre adquisición de lenguaje: el modelo sirve para estudiar cómo afecta la distribución de frecuencias léxicas (Zipf) al aprendizaje de representaciones, comparando con modelos entrenados con vocabularios estándar.
- Experimentos de fine-tuning con SFT: al ser un modelo pequeño, es útil para probar pipelines de entrenamiento con TRL y validar metodologías antes de escalar a modelos mayores.
- Generación de texto controlada en entornos de laboratorio: se puede usar para generar muestras de texto con un vocabulario artificial específico, útil para pruebas de evaluación de sesgos o propiedades lingüísticas.
- Benchmarking de infraestructura: su tamaño reducido permite probar configuraciones de inferencia en GPUs de baja capacidad o incluso CPU, sirviendo como caso de prueba para herramientas como vLLM o llama.cpp.
- Educación en IA: como ejemplo didáctico de fine-tuning de un modelo GPT-2 con TRL, documentado en el repositorio.
- Reproducibilidad de experimentos: al estar disponible el checkpoint y el código de entrenamiento, otros investigadores pueden replicar o extender los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo parece estar diseñado para experimentos controlados, no para competir en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124,7M parámetros × 4 bytes), menos de 0,3 GB en FP16 o int8. Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPU (aunque más lento).
- Es compatible con GPUs de consumo (RTX 3060, 4090, etc.) sin problemas.
- Opciones de despliegue: se puede usar con transformers (pipeline), vLLM, llama.cpp, Ollama (si se convierte a GGUF), o TGI. Dado su tamaño, también es viable en CPU con llama.cpp.
- Latencia y throughput: al ser un modelo pequeño, la generación es rápida; en una GPU moderna se pueden obtener cientos de tokens por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (experimentos con vocabularios artificiales). Los modelos GPT-2 de 124M estándar (como `gpt2`) tienen la misma arquitectura y tamaño, pero no comparten el objetivo de investigación. No se puede establecer una comparativa directa sin datos de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación, no apto para producción: su tamaño y entrenamiento limitado lo hacen poco útil para tareas reales.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos potenciales.
- Alto riesgo de alucinación y textos incoherentes en contextos largos, típico de modelos pequeños.
- Longitud de contexto no especificada; probablemente limitada a 1024 tokens (estándar de GPT-2), pero no confirmado.
- Licencia no definida: el README indica "license" sin detallar, lo que impide su uso comercial sin aclaración.
- Sin soporte para tool calling, agentes ni razonamiento avanzado.
- Idiomas no confirmados; el ejemplo de uso está en inglés, pero no se garantiza cobertura multilingüe.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/fpadovani/nld-100mb-after-nld_newlexicon_zipf-ckpt500_seed3407)
- [Modelo base](https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/g5852ia1)
- [Repositorio TRL](https://github.com/huggingface/trl)
