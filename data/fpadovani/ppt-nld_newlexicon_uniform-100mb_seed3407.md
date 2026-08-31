# fpadovani/ppt-nld_newlexicon_uniform-100mb_seed3407

## Resumen

Este modelo es un ajuste fino (fine-tune) de `goldfish-models/nld_latn_100mb`, un modelo de lenguaje pequeño de 86,7 millones de parámetros especializado en neerlandés. El autor, fpadovani, lo ha entrenado con la librería TRL de HuggingFace mediante aprendizaje supervisado (SFT). Forma parte de un proyecto de investigación más amplio sobre lenguajes artificiales y léxicos, como indica el nombre "ppt-art-lang-newlexicon".

El modelo está diseñado para generación de texto en neerlandés y su principal interés radica en su tamaño reducido, que permite experimentación e inferencia en hardware modesto. Al estar basado en la familia Goldfish, hereda una arquitectura GPT-2 adaptada para lenguas de bajos recursos. Su relevancia actual es limitada fuera del ámbito académico, pero resulta útil como punto de partida para investigaciones sobre adaptación lingüística y eficiencia de modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformador causal) |
| Parametros totales | 86.708.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Neerlandes (nld) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura GPT-2, un transformador decoder-only con atención causal, adaptado por el proyecto Goldfish para lenguas con pocos recursos digitales. El modelo base `goldfish-models/nld_latn_100mb` fue preentrenado con 100 MB de texto en neerlandés en escritura latina. Sobre esta base, fpadovani ha aplicado un ajuste fino supervisado (SFT) utilizando la librería TRL, con el objetivo de adaptar el modelo a un "nuevo léxico" uniforme, probablemente un vocabulario artificial o modificado para experimentos de aprendizaje de lenguas.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni el uso de técnicas como RLHF o DPO. El entrenamiento se registró con Weights & Biases, aunque el enlace al dashboard no está disponible públicamente en la información proporcionada.

## Capacidades

- Generación de texto en neerlandés: el modelo puede producir texto coherente en este idioma, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Conversación multi-turno: el ejemplo de uso emplea el formato de chat con roles de usuario y asistente, lo que sugiere capacidad para mantener diálogos sencillos.
- Modelo pequeño y eficiente: con solo 86,7 millones de parámetros, es adecuado para entornos con recursos limitados.
- Sin capacidades especiales: no hay evidencia de soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación académica en procesamiento de lenguaje neerlandés: el modelo sirve como base para estudiar la adaptación de modelos pequeños a vocabularios artificiales, un campo relevante en psicolingüística y aprendizaje de lenguas.
- Prototipado rápido de chatbots en neerlandés: su tamaño reducido permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Generación de texto educativo: puede emplearse para crear ejercicios de lectura o práctica de neerlandés en aplicaciones de aprendizaje de idiomas.
- Experimentación con técnicas de ajuste fino: al ser un modelo pequeño, es ideal para probar metodologías de SFT, DPO o RLHF antes de escalar a modelos mayores.
- Inferencia en CPU: su bajo número de parámetros posibilita la ejecución en máquinas sin GPU, útil para despliegues en entornos restringidos.
- Análisis lingüístico: investigadores pueden estudiar cómo el modelo representa el léxico neerlandés y compararlo con el modelo base Goldfish.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El proyecto parece orientado a investigación lingüística más que a rendimiento en tareas generales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB en FP32, según datos de LLM Explorer. Con cuantización a 8 bits, podría reducirse a unos 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA GTX 1050 Ti o superior sería más que adecuada.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluidas las integradas de Intel o AMD con suficiente memoria compartida.
- Opciones de despliegue: compatible con transformers, text-generation-inference y endpoints de HuggingFace. También puede ejecutarse con llama.cpp si se convierte a GGUF.
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño se espera una latencia muy baja, del orden de milisegundos por token en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia |
|---|---|---|---|---|
| fpadovani/ppt-nld_newlexicon_uniform-100mb_seed3407 | 86,7 M | no disponible | Neerlandes | no disponible |
| goldfish-models/nld_latn_100mb | ~86 M | no disponible | Neerlandes | no disponible |
| gpt2-small (multilingue) | 124 M | 1024 | Multilingue | MIT |

El modelo se sitúa en la misma categoría que su base Goldfish, con la diferencia de estar ajustado para un léxico artificial. Comparado con GPT-2 small, es más pequeño y especializado en neerlandés, pero carece de la versatilidad multilingüe y el ecosistema de herramientas de OpenAI.

## Limitaciones y advertencias

- Información incompleta: no se dispone de datos sobre licencia, contexto máximo, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Sesgos potenciales: al entrenarse con solo 100 MB de texto, es probable que herede sesgos presentes en el corpus original, que no se ha descrito.
- Riesgo de alucinación: los modelos pequeños tienden a producir texto incoherente o factualmente incorrecto, especialmente en tareas complejas.
- Alcance limitado: solo genera texto en neerlandés y no soporta otras lenguas ni tareas especializadas.
- Uso comercial incierto: al no especificarse la licencia, no se puede garantizar que sea legal utilizarlo en aplicaciones comerciales.
- Vocabulario artificial: el ajuste con un "nuevo léxico" puede hacer que el modelo produzca palabras inventadas o poco naturales para hablantes nativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_newlexicon_uniform-100mb_seed3407
- Modelo base Goldfish: https://huggingface.co/goldfish-models/nld_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/6z35jhy7
- Modelo relacionado (baseline): https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-nld-baseline-100mb_seed3407,cuMiX9GQhkxhE6KZgm2e4
