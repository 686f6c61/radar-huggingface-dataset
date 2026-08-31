# fpadovani/ppt-nld_newlexicon_uniform-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-nld_newlexicon_uniform-100mb_seed455` es un fine-tune de 86,7 millones de parámetros basado en `goldfish-models/nld_latn_100mb`, un modelo de la familia Goldfish orientado a lenguas de bajos recursos, en este caso el neerlandés (nld). Ha sido desarrollado por fpadovani, investigador afiliado a la Universidad de Groningen, como parte de un proyecto de investigación sobre adaptación de vocabulario (el término "newlexicon" en el nombre sugiere experimentos con léxicos alternativos) y distribuciones de frecuencia (uniform frente a zipf). El modelo se entrenó mediante fine-tuning supervisado (SFT) utilizando la librería TRL de Hugging Face.

Se trata de un modelo de generación de texto de tamaño reducido, pensado para experimentos académicos más que para producción. Su relevancia radica en estudiar cómo afecta la elección del vocabulario y la distribución de tokens al rendimiento de modelos pequeños en tareas de generación. Al ser un modelo de 86M parámetros, su despliegue es extremadamente ligero, aunque sus capacidades son limitadas en comparación con modelos de mayor escala. La información pública disponible es escasa: no se especifican la longitud de contexto, los idiomas soportados ni la licencia exacta, por lo que muchos parámetros técnicos quedan sin confirmar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.708.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere neerlandés, sin confirmar) |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder estándar con atención causal. Al ser un fine-tune de `goldfish-models/nld_latn_100mb`, hereda la estructura de ese modelo base, que a su vez es un GPT-2 pequeño entrenado específicamente para neerlandés. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, como se indica en la model card. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se experimentó con un "nuevo léxico" de distribución uniforme, probablemente reemplazando el vocabulario original del modelo base por uno alternativo, pero no hay documentación técnica que lo confirme.

## Capacidades

- Generación de texto: el modelo puede producir texto autocompletado a partir de un prompt, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Fine-tuning adicional: al ser un modelo pequeño y abierto, puede servir como base para experimentos de adaptación a dominios específicos.
- Capacidades multilingües: no confirmadas; el nombre sugiere neerlandés, pero no hay evidencia de soporte para otros idiomas.
- Sin soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio. Es un modelo puramente de lenguaje.

## Casos de uso

- Investigación en adaptación de vocabulario: el modelo es útil para estudiar cómo la elección del tokenizador y la distribución de frecuencias afecta al rendimiento en generación de texto, comparando con variantes zipf o con el modelo base.
- Experimentos de fine-tuning en neerlandés: si se confirma el soporte del idioma, puede emplearse para tareas de generación de texto en neerlandés de baja complejidad, como completar frases o generar respuestas cortas.
- Pruebas de pipelines de entrenamiento: al ser un modelo pequeño, es adecuado para validar flujos de SFT con TRL, probar configuraciones de hardware o depurar código de inferencia.
- Enseñanza de PLN: sirve como ejemplo práctico de fine-tuning de un modelo GPT-2 pequeño en un contexto académico, permitiendo a estudiantes analizar el impacto del vocabulario en el comportamiento del modelo.
- Benchmarking de frameworks de inferencia: su tamaño reducido facilita medir latencias y throughput en diferentes entornos (CPU, GPU de baja gama) sin necesidad de recursos costosos.
- Generación de texto controlada en dominios restringidos: aunque limitado, puede generar texto coherente en temas muy específicos si se fine-tunea con un dataset pequeño, por ejemplo para chatbots de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo es un experimento de investigación y no se ha comparado formalmente con alternativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB (según el tamaño del repo), lo que permite ejecutarlo en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; una RTX 3060 o superior es más que suficiente. También funciona en CPU con 4 GB de RAM.
- Compatibilidad con consumer GPU: sí, es uno de los modelos más ligeros disponibles.
- Opciones de despliegue: compatible con transformers (pipeline de text-generation), y por su tamaño puede usarse con llama.cpp, Ollama o vLLM si se convierte a GGUF, aunque no hay versiones precompiladas publicadas.
- Latencia y throughput: al ser un modelo de 86M parámetros, la generación es muy rápida; en una GPU moderna se pueden obtener cientos de tokens por segundo, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Como referencia cualitativa, se puede comparar con otros modelos pequeños de la familia Goldfish (por ejemplo, `goldfish-models/nld_latn_100mb`, su modelo base) y con GPT-2 pequeño (124M). El modelo base tiene la misma arquitectura y tamaño, pero sin el fine-tuning específico. GPT-2 pequeño es ligeramente mayor y está entrenado en inglés, por lo que no es directamente comparable en idioma. No hay datos de rendimiento publicados para ninguno de ellos en este contexto.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeño entrenado con un corpus limitado, puede reflejar sesgos presentes en los datos de entrenamiento, aunque no hay documentación al respecto.
- Riesgo de alucinación: alto, especialmente en temas fuera de su dominio de entrenamiento; la generación puede ser incoherente o inventar información.
- Limitaciones de contexto: la longitud de contexto no está documentada, pero por su tamaño probablemente sea corta (1024 o 2048 tokens), lo que restringe su uso en conversaciones largas.
- Limitaciones de idioma: no hay confirmación oficial de los idiomas soportados; si solo es neerlandés, su utilidad fuera de ese idioma es nula.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración legal previa.
- Adecuación para producción: no recomendado para entornos productivos debido a su tamaño, falta de benchmarks y documentación incompleta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/ppt-nld_newlexicon_uniform-100mb_seed455)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/lefxfv9c)
- [Modelo base: goldfish-models/nld_latn_100mb](https://huggingface.co/goldfish-models/nld_latn_100mb)
