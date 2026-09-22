# Anurag9817/nepali-llama-590m-580m-tokens

## Resumen

Nepali LLaMA 590M es un modelo de lenguaje causal de 590.077.440 parámetros desarrollado por el usuario Anurag9817 y publicado en HuggingFace. Se trata de un checkpoint base (preentrenado, sin ajuste por instrucciones) orientado a dos idiomas: nepalí (ne) e inglés (en), con la etiqueta adicional roman-nepali, que hace referencia al nepalí escrito con alfabeto latino. El modelo emplea una arquitectura transformer de tipo decoder-only con estilo LLaMA, vocabulario SentencePiece propio de 40.000 tokens y 18 capas, con un tamaño de contexto de entrenamiento limitado a 1.024 tokens.

Su relevancia es acotada pero específica: es un experimento de preentrenamiento de bajo coste centrado en una lengua de bajos recursos como el nepalí, ejecutado en hardware consumer (2 × Tesla T4) en menos de 9 horas. El repositorio ocupa 2,4 GB, coherente con pesos almacenados en FP32, y está etiquetado como compatible con text-generation-inference y endpoints_compatible. No cuenta con descargas ni valoraciones en el momento de redactar esta ficha, y no se ha publicado licencia.

Es importante subrayar que se trata de un modelo base y no de un chatbot: no ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones ni mantiene formato conversacional. Su utilidad principal es como punto de partida para aprendizaje continuado, experimentación académica y adaptación a dominio en nepalí, no como sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (causal LM), con GQA y presumiblemente RMSNorm y SwiGLU |
| Parametros totales | 590.077.440 (dato real de safetensors) |
| Longitud de contexto | 1.024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible; no se publican artefactos GGUF, AWQ ni GPTQ. Los pesos del repositorio parecen estar en FP32 (2,4 GB) |
| Idiomas soportados | Nepalí (ne) e inglés (en); etiqueta adicional roman-nepali |
| Licencia | No disponible (ni en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors (librería transformers) |
| Vocabulario | 40.000 tokens, SentencePiece propio (`tokenizer/nepali_llama_40k.model`) |
| Tamano oculto (hidden size) | 1.536 |
| Tamano intermedio (intermediate size) | 4.096 |
| Numero de capas | 18 |
| Cabezas de atencion | 12 |
| Cabezas KV | 6 (GQA con ratio 2:1) |
| Tokens especiales | PAD = 0, UNK = 1, BOS = 2, EOS = 3 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de tipo LLaMA. El recuento exacto de parámetros permite reconstruir sus componentes: 18 capas con atención de 12 cabezas de consulta y 6 cabezas KV (atención por consultas agrupadas, GQA), y una MLP con tres matrices (gate, up y down) de 1.536 × 4.096, lo que corresponde a una activación de tipo SwiGLU. Los embeddings de entrada y de salida están separados: 40.000 × 1.536 × 2 = 122,88 millones de parámetros, a los que se suman 56.832 parámetros de normalización (dos por capa más la normalización final). La suma coincide exactamente con los 590.077.440 parámetros reportados, lo que confirma esta interpretación de la arquitectura.

El entrenamiento documentado corresponde a una fase de aprendizaje continuado sobre el checkpoint base `Anurag9817/nepali-llama-590m-180m-english`. Se añadieron 200 millones de tokens en inglés procedentes de FineWeb-Edu, hasta un total declarado de 380 millones de tokens de exposición en inglés. La configuración fue: longitud de secuencia 1.024, batch de 2 por GPU, acumulación de gradiente de 8 (32.768 tokens efectivos por actualización), 2 × Tesla T4, tasa de aprendizaje 1e-5, 100 pasos de warmup, scheduler coseno, optimizador AdamW de 8 bits, FP16 activado y gradient checkpointing desactivado. Se completaron 6.104 pasos de optimizador en 8,82 horas, con una pérdida final de entrenamiento de 4,196. No se menciona ningún uso de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto causal: continuación de secuencias y modelado de lenguaje en nepalí e inglés.
- Modelado bilingüe nepalí-inglés, con soporte declarado para texto romanizado (roman-nepali), es decir, nepalí transcrito al alfabeto latino.
- Tokenizador SentencePiece propio de 40.000 entradas, diseñado específicamente para el nepalí en lugar de reutilizar un tokenizador multilingüe genérico.
- Extracción de representaciones internas (hidden states) para tareas de análisis lingüístico o como inicialización de modelos mayores.
- No soporta tool calling ni function calling: no hay plantilla de chat, ni tokens de herramienta, ni ajuste por instrucciones.
- No soporta agentes ni razonamiento multi-paso de forma fiable; carece de modo de pensamiento (thinking mode), visión o audio.
- No dispone de capacidades multilingües más allá del nepalí y el inglés.

## Casos de uso

- Aprendizaje continuado en nepalí: el modelo puede seguir preentrenándose con corpus adicionales en nepalí para ampliar su cobertura léxica y de dominio, aprovechando que ya parte de un tokenizador específico de 40.000 tokens y de una exposición previa al idioma.
- Ajuste supervisado (SFT) para crear un asistente conversacional: dado que es un checkpoint base, el primer paso razonable para cualquier producto conversacional es aplicar SFT con instrucciones en nepalí; el modelo no responde a instrucciones tal cual sale del repositorio.
- Investigación en tokenización de lenguas de bajos recursos: el tokenizador SentencePiece de 40.000 entradas y las instrucciones explícitas de no sustituirlo por `AutoTokenizer` lo convierten en un objeto de estudio útil para analizar decisiones de vocabulario en nepalí.
- Adaptación a dominio y ajuste fino con LoRA: con 590 M de parámetros, el ajuste con adaptadores de bajo rango es viable en una única GPU consumer, lo que permite especializarlo en dominios como noticias, textos legales o contenido educativo nepaleses.
- Generación de corpus sintéticos y aumento de datos: puede emplearse para producir texto de continuación que sirva como datos de aumento en un pipeline de NLP nepalí, siempre con revisión humana dado su reducido entrenamiento.
- Prototipos y docencia con hardware modesto: al ocupar alrededor de 1,2 GB en FP16 y menos de 0,6 GB en cuantización de 8 bits, permite reproducir experimentos de preentrenamiento y despliegue en un portátil con GPU o incluso en CPU.
- Análisis de mezcla de códigos nepalí-inglés: etiquetado como roman-nepali, en, ne, puede utilizarse para estudiar el comportamiento del modelado de lenguaje en textos que alternan escritura devanagari y transcripción latina.
- Evaluación comparativa de checkpoints: sirve como punto de control intermedio para medir el efecto de añadir 200 M de tokens en inglés sobre la pérdida de validación y la fluidez en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato cuantitativo de rendimiento disponible es la pérdida final de entrenamiento de 4,196, que corresponde a la pérdida de preentrenamiento en la fase de 200 M de tokens en inglés y no es directamente comparable con métricas de evaluación estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,4 GB en FP32 (formato aparente del repositorio), 1,2 GB en FP16/BF16, 0,6 GB en INT8 y en torno a 0,3-0,4 GB en cuantización de 4 bits.
- Cache KV: aproximadamente 54 KiB por token en FP16, calculados a partir de 18 capas × 6 cabezas KV × 128 dimensiones × 2 (K y V). Para 1.024 tokens supone unos 55 MB; para 4.096 tokens, unos 221 MB.
- GPU del entrenamiento: 2 × Tesla T4 (16 GB cada una), con FP16 habilitado y sin gradient checkpointing.
- GPU recomendadas para inferencia: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, T4, RTX 3060, RTX 4090). Las GPU de gama alta tipo A100 o H100 están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, con holgura. En una RTX 3060 de 12 GB se puede ejecutar en FP32 con contexto completo y margen para batching.
- Opciones de despliegue: `transformers` de forma nativa (es la librería declarada) y text-generation-inference según los tags del repositorio. Para vLLM, llama.cpp, Ollama o TGI con conversión a GGUF habría que validar previamente la compatibilidad del tokenizador SentencePiece personalizado, ya que el autor advierte explícitamente de que no se sustituya por `AutoTokenizer`.
- Latencia y throughput: no disponibles para inferencia. Como referencia derivada del entrenamiento, el modelo procesó unos 200 millones de tokens en 8,82 horas sobre 2 × T4, lo que equivale a aproximadamente 6.300 tokens por segundo agregados (unas 3.150 tokens/s por T4) en paso hacia delante y hacia atrás con FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nepali LLaMA 590M (este modelo) | 590 M | 1.024 tokens | ne, en | No disponible | safetensors en HuggingFace |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | en (principalmente) | Apache-2.0 | safetensors, GGUF y múltiples derivados |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | multilingüe (29 idiomas) | Apache-2.0 (variante base) | safetensors, GGUF y derivados |
| SmolLM2-360M | 362 M | 2.048 tokens | en | Apache-2.0 | safetensors, GGUF |

Los datos de contexto y licencia de los modelos comparados proceden de conocimiento general y conviene verificarlos en sus respectivas model cards antes de tomar decisiones. La comparación de rendimiento no es posible porque este modelo no publica resultados de benchmarks, mientras que las alternativas sí disponen de evaluaciones estandarizadas. La ventaja diferencial de Nepali LLaMA 590M es su tokenizador específico de nepalí y su exposición declarada al roman-nepali, algo que ninguna de las alternativas cubre de forma nativa. La desventaja principal es su ventana de contexto de 1.024 tokens, muy inferior a la de Qwen2.5-0.5B.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no seguirá órdenes ni mantendrá un formato de diálogo. Cualquier uso conversacional requiere SFT previo.
- Pérdida final de entrenamiento elevada (4,196) con una exposición total declarada de solo 380 M de tokens en inglés, muy por debajo de lo que se considera óptimo para 590 M de parámetros. Es esperable una perplejidad alta y una calidad de generación limitada.
- Ventana de contexto de 1.024 tokens: insuficiente para tareas de contexto largo, resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Riesgo elevado de alucinación y de deriva temática, especialmente en nepalí, por la escasez de datos de preentrenamiento documentados.
- Sesgos desconocidos: no se documenta composición del corpus en nepalí, filtrado, deduplicación ni evaluación de sesgos. FineWeb-Edu, la única fuente declarada, es un dataset en inglés orientado a contenido educativo, lo que puede sesgar el registro y el dominio del modelo.
- Ausencia de licencia: no se especifica ningún tipo de licencia, ni siquiera en los metadatos de HuggingFace. Esto impide determinar si el uso comercial está permitido y supone un riesgo legal para producción.
- Tokenizador no estándar: el autor indica explícitamente que no se reemplace el tokenizador del proyecto por `AutoTokenizer`, lo que puede romper pipelines automáticos y complicar la conversión a otros formatos de inferencia.
- Discrepancia en el nombre del repositorio: el identificador menciona "580m-tokens" mientras que la model card describe 200 M de tokens nuevos y 380 M de exposición total. Conviene tratar las cifras de datos con cautela.
- Sin validación externa: cero descargas y cero valoraciones en HuggingFace, sin resultados de benchmarks ni evaluaciones de terceros publicadas.
- Los resultados de búsqueda web realizados no aportaron ninguna fuente técnica relacionable con este modelo; los enlaces encontrados eran consultas genéricas sin relación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anurag9817/nepali-llama-590m-580m-tokens
- Checkpoint base declarado por el autor: https://huggingface.co/Anurag9817/nepali-llama-590m-180m-english
- Dataset de entrenamiento declarado (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador del proyecto: `tokenizer/nepali_llama_40k.model` dentro del repositorio del modelo
- Otros enlaces relevantes: no disponible (la búsqueda web no devolvió resultados relacionados con el modelo)
