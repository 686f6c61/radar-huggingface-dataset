# fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/nld_latn_100mb`, un modelo de lenguaje monolingüe neerlandés de 100 millones de parámetros entrenado por el proyecto Goldfish. El autor, fpadovani, lo ha entrenado con la librería TRL mediante Supervised Fine-Tuning (SFT), y forma parte de una serie de experimentos denominados "ppt-art-lang" que parecen explorar el efecto de nuevos léxicos artificiales sobre el aprendizaje de idiomas.

Con 86,5 millones de parámetros, es un modelo de tamaño pequeño, basado en arquitectura GPT-2, pensado para investigación experimental más que para producción. Su interés principal reside en el estudio de cómo se comporta un modelo de lenguaje cuando se le presenta un vocabulario artificial o modificado, en este caso sobre el neerlandés. La relevancia actual es académica: sirve para comparar el rendimiento de modelos con distintos léxicos y semillas, como demuestran las variantes `zipf-eng` o `zipf-jpn` publicadas por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | 86.508.288 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | neerlandés (modelo base), aunque la model card no lo especifica |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GPT-2 de su base, un transformer decoder-only con mecanismo de atención causal estándar. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con la librería TRL, sobre el modelo `goldfish-models/nld_latn_100mb`, que es un modelo entrenado sobre texto neerlandés en escritura latina. No se dispone de detalles sobre el dataset de ajuste, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única información de entrenamiento disponible es el enlace a un run de Weights & Biases que no detalla los hiperparámetros.

La peculiaridad del proyecto "ppt-art-lang" sugiere que se manipula el vocabulario o el léxico del modelo base, pero no se documenta en la model card cómo se construyó el nuevo léxico ni qué datos concretos se usaron para el ajuste.

## Capacidades

- Generación de texto en neerlandés: el modelo puede continuar o responder a instrucciones en neerlandés, aunque su tamaño limita la coherencia en tareas complejas.
- Modelo de investigación: su propósito principal es servir como instrumento para experimentos de lingüística computacional sobre el efecto de léxicos artificiales.
- No soporta tool calling ni function calling: la arquitectura GPT-2 y el entrenamiento SFT básico no incluyen estas capacidades.
- No tiene modo de razonamiento explícito ni capacidades multimodales: es un modelo de texto puro.
- Multilingüismo limitado: aunque el modelo base es monolingüe neerlandés, puede producir texto en otros idiomas con menor calidad.

## Casos de uso

- Investigación en lingüística computacional: permite estudiar cómo la modificación del vocabulario afecta al aprendizaje de la gramática neerlandesa, comparando con las variantes del mismo autor.
- Experimentos de generación de texto controlada: dado un prompt en neerlandés, se puede analizar el estilo y la coherencia de las respuestas para entender las limitaciones del modelo.
- Educación en procesamiento de lenguaje natural: útil como ejemplo didáctico de fine-tuning de GPT-2 con TRL sobre un idioma de pocos recursos.
- Evaluación de técnicas de SFT: sirve para reproducir y verificar los resultados de entrenamiento supervisado con datasets pequeños.
- Análisis de sesgos y artefactos: al ser un modelo pequeño, permite estudiar patrones de repetición y degeneración típicos de modelos de este tamaño.
- Comparación de semillas y léxicos: junto a los otros modelos `ppt-art-lang`, se pueden ejecutar baterías de prompts para evaluar la robustez de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas como MMLU, HumanEval o GSM8K en la model card, y no se han encontrado referencias externas que las reporten.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 86,5M parámetros, la inferencia en precisión float32 requiere aproximadamente 0,35 GB de memoria, y con cuantización de 8 bits se reduciría a unos 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso puede ejecutarse en CPU con razonable velocidad.
- Compatible con GPUs de consumo: sí, incluidas tarjetas como la RTX 3060, GTX 1660 o incluso la integrada en portátiles.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con `text-generation-inference` (TGI), vLLM, o en local con la librería de Hugging Face Transformers.
- Latencia y throughput: en una GPU moderna, la generación de 128 tokens suele tardar menos de 1 segundo, con un throughput del orden de 500-1000 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10 | 86,5M | no disponible | neerlandés | no disponible |
| goldfish-models/nld_latn_100mb | 86,5M | no disponible | neerlandés | no disponible |
| distilgpt2 | 82M | 1024 | inglés | MIT |

No se dispone de datos de rendimiento comparativo. El modelo se alinea con otros GPT-2 pequeños, pero su especificidad es el ajuste en neerlandés con un léxico modificado, lo que lo hace difícil de comparar con modelos generalistas.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso en producción; su rendimiento en tareas reales será muy limitado.
- Alucinación y repetición: los modelos de 86M de parámetros tienden a repetir frases y a inventar hechos cuando se les pide responder a preguntas abiertas.
- Sesgos: el modelo base se entrenó con un corpus neerlandés, por lo que puede reflejar sesgos culturales y lingüísticos de ese idioma.
- Licencia no especificada: no se indica la licencia, lo que impide su uso comercial sin consultar al autor.
- Contexto limitado: al ser GPT-2, la ventana de contexto máxima es de 1024 tokens, aunque no se documenta explícitamente.
- Dependencia del léxico: el ajuste con un léxico artificial puede degradar la calidad del neerlandés natural en comparación con el modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10)
- [Modelo base: goldfish-models/nld_latn_100mb](https://huggingface.co/goldfish-models/nld_latn_100mb)
- [Ejemplo de despliegue en FriendliAI](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407)
- [Run de Weights & Biases del entrenamiento](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/t4vcbm43)
