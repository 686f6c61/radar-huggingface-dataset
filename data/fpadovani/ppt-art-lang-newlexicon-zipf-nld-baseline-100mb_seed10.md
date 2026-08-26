# fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed10

## Resumen

El modelo `ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed10` es un modelo de generación de texto en neerlandés desarrollado por fpadovani, probablemente en el marco de un proyecto de investigación sobre la influencia de la distribución de Zipf en el aprendizaje de léxico artificial. Se trata de un ajuste fino del modelo base `goldfish-models/nld_latn_100mb`, que pertenece a la familia Goldfish de modelos monolingües entrenados con corpus de 100 MB. El modelo cuenta con 86,5 millones de parámetros y una arquitectura basada en GPT-2, lo que lo sitúa en la gama de modelos pequeños aptos para entornos con recursos limitados.

El interés de este modelo reside en su uso como herramienta experimental para estudiar cómo la frecuencia de palabras (distribución de Zipf) afecta al aprendizaje de un nuevo léxico en neerlandés. Su publicación en HuggingFace con formato safetensors y soporte para `text-generation-inference` lo hace fácilmente desplegable en infraestructuras estándar, aunque su tamaño y propósito lo orientan más a investigación que a aplicaciones de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (basada en el modelo base Goldfish) |
| Parámetros totales | 86.508.288 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (probablemente 1024 tokens, como en GPT-2) |
| Tipos de cuantización | No disponible (se puede cuantizar con herramientas como llama.cpp) |
| Idiomas soportados | No disponible (el nombre sugiere neerlandés, pero no está confirmado) |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) de `goldfish-models/nld_latn_100mb`, que a su vez se basa en una arquitectura similar a GPT-2. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) usando la librería TRL de HuggingFace, con el framework Transformers y PyTorch. No se han publicado detalles sobre el conjunto de datos específico, el número de tokens de entrenamiento o el método de optimización más allá de la técnica SFT. El nombre del modelo sugiere que forma parte de un experimento sobre la distribución de Zipf y la creación de un "nuevo léxico", probablemente mediante la manipulación de frecuencias de palabras en el corpus.

La base Goldfish está diseñada para entrenar modelos monolingües con corpus de tamaño fijo (100 MB en este caso), lo que facilita la comparación entre idiomas y condiciones. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el proceso es únicamente de supervisión.

## Capacidades

- Generación de texto en neerlandés, con capacidad para completar secuencias y responder a instrucciones básicas.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado soporte multilingüe; el modelo parece especializado en neerlandés.
- No se mencionan capacidades especiales como visión, audio o modo de pensamiento explícito.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo y generación de código es limitada.

## Casos de uso

- Investigación en lingüística computacional: el modelo sirve para estudiar cómo la distribución de frecuencias léxicas afecta al aprendizaje de un idioma artificial, permitiendo comparar condiciones experimentales.
- Prototipos de generación de texto en neerlandés para entornos de baja latencia y recursos limitados, como aplicaciones educativas o demos.
- Generación de texto creativo en neerlandés (cuentos, poesía) en entornos académicos o experimentales.
- Análisis de sesgos léxicos: al ser un modelo pequeño y entrenado en un corpus reducido, permite estudiar la influencia del vocabulario frecuente en la salida del modelo.
- Base para experimentos de transferencia de aprendizaje: se puede usar como punto de partida para investigar la adaptación a dominios específicos.
- Evaluación de métodos de cuantización y despliegue en hardware de bajo coste, dado su pequeño tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

- VRAM estimada: según LLM Explorer, el modelo requiere aproximadamente 0.2 GB de VRAM en FP16 (basado en 86.5M parámetros).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; puede ejecutarse en tarjetas integradas o en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna (RTX 3060, 4090, etc.) e incluso en dispositivos con pocos recursos.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp, Ollama, TGI y `text-generation-inference` según los tags.
- Latencia y throughput: no hay datos publicados, pero por su tamaño se espera una latencia baja y un throughput alto en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed10 | 86.5M | No disponible | Neerlandés (no confirmado) | No disponible | Hugging Face |
| ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10 | 86.5M (probable) | No disponible | Inglés | No disponible | Hugging Face |
| goldfish-models/nld_latn_100mb | No disponible | No disponible | Neerlandés | No disponible | Hugging Face (modelo base) |
| GPT-2 small (124M) | 124M | 1024 | Multilingüe (limitado) | MIT | Modelo de referencia |

La comparativa se limita a modelos de tamaño similar o al mismo modelo base. No hay datos de rendimiento publicados para estos modelos.

## Limitaciones y advertencias

- El modelo tiene un tamaño muy pequeño (86.5M parámetros), lo que limita su capacidad para tareas complejas, razonamiento avanzado y generación de código.
- No se ha documentado sesgos específicos, pero al ser entrenado en un corpus de 100 MB es probable que contenga sesgos de frecuencia y vocabulario limitado.
- Riesgo de alucinación: al ser un modelo pequeño, la probabilidad de generar contenido no fiel a la realidad es alta.
- La licencia no está clara, lo que impide su uso comercial sin verificación.
- El modelo no soporta tool calling ni agentes, por lo que no es adecuado para aplicaciones de automatización compleja.
- No hay información sobre la calidad del neerlandés generado; puede tener errores gramaticales o semánticos.
- El contexto máximo probablemente sea de 1024 tokens, lo que limita la generación de textos largos.

## Enlaces

- [Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed10)
- [Modelo base en Hugging Face](https://huggingface.co/goldfish-models/nld_latn_100mb)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/27dikqow)
- [Modelo similar en inglés](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10)
- [Modelo similar en inglés con otra semilla](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455)
