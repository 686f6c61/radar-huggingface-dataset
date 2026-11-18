# samdei/samdei-type-mini-pretrained

## Resumen

Samdei Type Mini (pretrained) es un modelo encoder-decoder a nivel de carácter de 7,43 millones de parámetros desarrollado por Samdei Labs, diseñado para convertir jemer romanizado (transliteración latina) en escritura jemer nativa. Se trata del checkpoint de la primera fase (pretraining) de la familia Samdei Type, cuyo objetivo es resolver un problema práctico muy concreto: los usuarios de teclados en dispositivos móviles escriben jemer usando caracteres latinos y el modelo reconstruye la palabra o frase en escritura jemer correcta. La arquitectura es un transformer pre-LN con 6 capas de encoder y 2 de decoder, `d_model` 256, 4 cabezas de atención y FFN de 1024, con vocabularios de 215 símbolos de entrada y 228 de salida.

La relevancia de este checkpoint no reside en su rendimiento final, sino en su papel como base para fine-tuning. El autor lo publica explícitamente como punto de partida para adaptar el conversor a hábitos de escritura distintos, dominios específicos o datos propios, con un tamaño pensado para inferencia en dispositivo (teclados de móvil). El modelo se carga como `BlenderbotForConditionalGeneration` por compatibilidad de arquitectura, aunque no comparte nada más con BlenderBot.

Al estar en fase de pretraining, ha aprendido ortografía y vocabulario jemer a partir de millones de frases reales procesadas por un generador de escritura basado en reglas, pero todavía no ha aprendido cómo escribe realmente la gente en el chat. Para ese uso, el autor remite al checkpoint fine-tuneado `samdei/samdei-type-mini`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN (carga como `BlenderbotForConditionalGeneration`) |
| Parametros totales | 7.431.611 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entrenado con entradas de hasta 132 caracteres; se recomienda trocear en piezas de máximo 8 palabras |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | jemer (`km`); entrada en jemer romanizado |
| Licencia | Apache-2.0 (conservar `NOTICE` al redistribuir) |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder pre-LN con 6 capas en el encoder y 2 en el decoder, `d_model` de 256, 4 cabezas de atención y FFN de 1024. Los vocabularios de entrada y salida comparten un único espacio de identificadores (los símbolos de salida primero), con 215 símbolos de entrada y 228 de salida; los símbolos de salida se almacenan en el tokenizer como `"\ue000"` + carácter. Esta compartición de espacio es la razón por la que `transformers` cuenta 7,43M de parámetros.

El entrenamiento se realizó sobre 6,5 millones de pares: la segunda versión del generador de escritura aplicada a 1,41 millones de frases web y 2,4k frases de chat escritas por un LLM, más romanizaciones de Gemma de 2.000 frases reales (triplicadas). El lado jemer proviene de texto real de HPLT v2, FineWeb-2, Wikipedia en jemer y ALT, además de las frases de chat. Se entrenó durante 40k pasos (mejor checkpoint en 35k) con learning rate pico de 1e-3, en 2,2 horas sobre una GPU de portátil (Apple M5 Pro). El checkpoint se seleccionó sobre Dev-Sentences y Akkhara-Preview, una vista previa pública de 110 filas nunca usada en entrenamiento.

Una innovación técnica destacable es el diseño para fine-tuning: el autor documenta que `dropout` debe fijarse a `0.0` (el dropout de Blenderbot también afecta a los embeddings, con lo que el modelo no fue entrenado), manteniendo activo el dropout de atención y FFN a 0,1. El modelo fine-tuneado publicado se obtuvo con AdamW a 2e-4, 300 pasos de warmup, decaimiento coseno, label smoothing 0,1 y unos 12k tokens por batch durante 6k pasos.

## Capacidades

- Conversión de jemer romanizado a escritura jemer a nivel de carácter (transliteración/romanización inversa).
- Generación seq2seq condicionada con decodificación por beam search (el autor usa beam 5 en la evaluación).
- Manejo de vocabulario y ortografía jemer aprendidos de millones de frases reales.
- Base para fine-tuning en tareas de conversión con hábitos de escritura o dominios propios.
- Soporte de integración con la librería `samdei-type` y con `transformers` estándar.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un modelo especializado de conversión de texto.

## Casos de uso

- Teclados móviles en jemer: el modelo puede integrarse como componente de conversión en un teclado de Android o iOS para transformar la entrada latina del usuario en escritura jemer; su tamaño de 7,43M parámetros permite ejecución en dispositivo sin depender de la nube.
- Fine-tuning para hábitos de escritura específicos: partiendo de este checkpoint, un equipo puede adaptar el conversor a las abreviaturas y atajos que usa un grupo concreto de usuarios, usando el bucle de entrenamiento documentado en la model card.
- Adaptación a dominios verticales: con pares (romanizado, jemer) de un sector como medicina, legal o comercio, se puede ajustar el modelo para mejorar la precisión en terminología especializada que el pretraining web no cubre bien.
- Investigación en transliteración de lenguas de bajos recursos: sirve como línea base reproducible para experimentos de romanización inversa en jemer, con dataset y receta de entrenamiento publicados.
- Generación de datos sintéticos controlada: el modelo puede producir escritura jemer a partir de entradas romanizadas para aumentar corpus en pipelines de NLP en jemer, siempre que se valide la calidad de la salida.
- Despliegue en entornos con recursos limitados: al ser un modelo de 7,43M parámetros y 2,2 horas de entrenamiento en una GPU de portátil, es viable en CPU y en hardware de gama baja para tareas de conversión por lotes de frases cortas.

## Benchmarks y rendimiento

Resultados publicados por el autor en Samdei Type Bench (beam 5, entradas en piezas de máximo 8 palabras):

| Checkpoint | CER | Exact |
|---|---|---|
| Este checkpoint (pretrained) | 0,084 | 14% |
| Samdei Type Mini (fine-tuneado desde este) | 0,072 | 17% |
| Samdei Type Mini con reranking por LM | 0,058 | 24% |

El propio autor señala que el fine-tuning aporta la mayor ganancia individual. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, ya que el modelo es específico de transliteración.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (7,43M parámetros), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, Apple Silicon (el autor entrenó en un M5 Pro) y cualquier GPU consumer (RTX 3060 o superior es más que suficiente).
- Cabe en cualquier GPU consumer sin cuantización; la cuantización no es necesaria por el tamaño.
- Opciones de despliegue: `transformers` con PyTorch (documentado en la model card), y la librería `samdei-type` del autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el entrenamiento completo llevó 2,2 horas en una GPU de portátil, lo que da una idea del bajo coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samdei Type Mini (pretrained) | 7,43M | entradas de hasta 132 caracteres | Romanizado jemer → jemer | Apache-2.0 | Hugging Face |
| Samdei Type Mini (fine-tuneado) | ~7,4M (misma arquitectura) | entradas cortas | Romanizado jemer → jemer (chat) | Apache-2.0 | Hugging Face |
| Samdei Type Base (pretrained) | no disponible | no disponible | Romanizado jemer → jemer | Apache-2.0 | Hugging Face (`samdei-type-base-pretrained`) |

No se dispone de información sobre otros modelos comparables de transliteración jemer en la documentación proporcionada.

## Limitaciones y advertencias

- Las entradas romanizadas siguen las personas de escritura del generador, no el chat real; maneja mucho mejor la ortografía cuidadosa que las abreviaturas agresivas.
- Entrenado solo con entradas cortas (máximo 132 caracteres); el texto más largo debe decodificarse por piezas.
- El lado jemer es mayoritariamente texto web, con sus sesgos temáticos y de dominio.
- Al ser un checkpoint de pretraining, no ha aprendido los hábitos reales de escritura en chat; para ese uso el autor recomienda el modelo fine-tuneado.
- Riesgo de error en palabras poco frecuentes u ortografías ambiguas; el CER de 0,084 y el Exact del 14% en el bench indican que una parte sustancial de las salidas no es exacta.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el archivo `NOTICE` al redistribuir; los datos de entrenamiento son CC BY-SA 4.0, con condiciones propias de atribución y compartir igual.
- Para fine-tuning, es imprescindible fijar `dropout=0.0`; de lo contrario la pérdida en validación aumenta durante el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samdei/samdei-type-mini-pretrained
- Modelo fine-tuneado: https://huggingface.co/samdei/samdei-type-mini
- Checkpoint Base pretrained: https://huggingface.co/samdei/samdei-type-base-pretrained
- Dataset de pretraining: https://huggingface.co/datasets/samdei/samdei-type-pretraining-data
- Benchmark Samdei Type Bench: https://huggingface.co/datasets/samdei/samdei-type-bench
- Repositorio GitHub: https://github.com/Samdei-Labs/samdei-type
