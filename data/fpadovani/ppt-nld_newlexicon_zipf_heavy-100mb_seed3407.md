# fpadovani/ppt-nld_newlexicon_zipf_heavy-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-nld_newlexicon_zipf_heavy-100mb_seed3407` es un fine-tune de 86,7 millones de parámetros del modelo base `goldfish-models/nld_latn_100mb`, desarrollado por fpadovani (aparentemente vinculado a la Universidad de Groningen). Se trata de un experimento de investigación sobre el aprendizaje de lenguajes artificiales: el nombre "newlexicon" sugiere un vocabulario sintético y "zipf_heavy" indica una distribución de frecuencias de tipo zipfiana sesgada. El modelo fue entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face, y su arquitectura deriva de un modelo GPT-2 (según las etiquetas del repositorio).

Este modelo no está pensado para uso productivo, sino como herramienta para estudiar cómo afecta la distribución de frecuencias de un léxico artificial al aprendizaje de representaciones lingüísticas. Su relevancia radica en que permite aislar variables en experimentos controlados de adquisición del lenguaje, algo difícil de hacer con modelos entrenados en lenguas naturales. La ventana de contexto y el dataset de entrenamiento no se han publicado, lo que limita su reproducibilidad más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (derivada del base `goldfish-models/nld_latn_100mb`) |
| Parametros totales | 86.708.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (repo solo con safetensors) |
| Idiomas soportados | neerlandés (base) y lenguaje artificial (newlexicon) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `goldfish-models/nld_latn_100mb`, que pertenece a la familia Goldfish de modelos entrenados en 100 MB de texto en neerlandés. La arquitectura subyacente es un transformer decoder-only tipo GPT-2 con aproximadamente 86,7 millones de parámetros. El entrenamiento se realizó con SFT (Supervised Fine-Tuning) usando la librería TRL (versión 0.23.0) sobre un dataset no especificado, pero que por el nombre del modelo corresponde a un corpus de lenguaje artificial con un léxico nuevo ("newlexicon") y una distribución de frecuencias de tipo zipf pesada ("zipf_heavy"). No se han publicado detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se registró en Weights & Biases, pero el enlace no está disponible públicamente en la model card.

## Capacidades

- Generación de texto autoregresiva: puede producir texto continuando un prompt dado, típico de modelos GPT-2.
- Fine-tune sobre un léxico artificial: el modelo ha sido entrenado para procesar un vocabulario sintético, lo que lo hace útil para experimentos sobre adquisición de lenguaje.
- Soporte básico de chat: la model card muestra un ejemplo con el pipeline `text-generation` y roles de usuario, aunque no se especifica si se entrenó con formato de chat.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio. Tampoco se indica capacidad multilingüe más allá del neerlandés base.

## Casos de uso

- Investigación en psicolingüística computacional: permite estudiar cómo la distribución de frecuencias de un léxico artificial influye en la representación interna que aprende el modelo, comparando con variantes con otras distribuciones (por ejemplo, uniforme o zipf ligera).
- Benchmarking de fine-tuning con TRL: sirve como ejemplo reproducible de entrenamiento SFT sobre un modelo base pequeño, útil para validar pipelines de experimentos.
- Análisis de la influencia del vocabulario en la generación: al variar el léxico y su distribución, se pueden medir efectos en la coherencia, diversidad y fluidez del texto generado.
- Entrenamiento de modelos de lenguaje para dominios con vocabulario controlado: aunque no es su fin principal, podría adaptarse a tareas donde se requiera un vocabulario restringido y conocido.
- Educación en IA: por su tamaño reducido, puede usarse en cursos para ilustrar conceptos de fine-tuning, sobreajuste y evaluación de modelos de lenguaje.
- Experimentos de transferencia de aprendizaje: al partir de un modelo base en neerlandés, se puede evaluar cómo el fine-tune en un lenguaje artificial afecta al conocimiento lingüístico previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado su carácter experimental y su pequeño tamaño, no se espera que compita con modelos generalistas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB según LLM Explorer, lo que permite inferencia en CPU o en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna (incluso integradas como Intel Iris o AMD Vega) puede ejecutar el modelo sin problemas. Una NVIDIA GTX 1050 Ti o superior sería más que suficiente.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: se puede cargar con `transformers` directamente, o servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con `text-generation-inference` (según las etiquetas del repositorio).
- Latencia y throughput: al ser un modelo de 86,7 millones de parámetros, la generación es muy rápida, del orden de decenas de tokens por segundo en CPU y cientos en GPU, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `fpadovani/ppt-nld_newlexicon_zipf_heavy-100mb_seed3407` | 86,7 M | no disponible | no disponible | Investigación |
| `goldfish-models/nld_latn_100mb` (base) | 86,7 M | no disponible | MIT (probable) | Modelo base multilingüe |
| `distilgpt2` | 82 M | 1024 | MIT | Generación de texto general |
| `gpt2` (small) | 124 M | 1024 | MIT | Generación de texto general |

La comparativa se basa en tamaño y propósito. El modelo aquí descrito es un fine-tune específico para un experimento, mientras que los otros son modelos generales o bases. No hay datos de rendimiento comparables.

## Limitaciones y advertencias

- Tamaño muy reducido: no es adecuado para tareas complejas de razonamiento, generación de código o diálogo de producción.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial sin consultar al autor.
- Dataset de entrenamiento no descrito: no se sabe qué datos concretos se usaron, lo que dificulta evaluar sesgos o alucinaciones.
- Posible sobreajuste al lenguaje artificial: el modelo puede no generalizar bien a texto natural en neerlandés u otros idiomas.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad más allá de ejemplos anecdóticos.
- Contexto limitado: al ser un modelo pequeño, la ventana de contexto probablemente sea corta (típicamente 512 o 1024 tokens), aunque no se ha confirmado.
- Riesgo de alucinaciones: como cualquier modelo generativo, puede producir contenido incoherente o falso, especialmente fuera del dominio del léxico artificial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf_heavy-100mb_seed3407)
- [Modelo base goldfish-models/nld_latn_100mb](https://huggingface.co/goldfish-models/nld_latn_100mb)
- [Entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/e8o945o9)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed3407,Ushc0mQy1EY3d4K9P9il3)
- [Deploy en FriendliAI](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed10) (variante con otra semilla)
