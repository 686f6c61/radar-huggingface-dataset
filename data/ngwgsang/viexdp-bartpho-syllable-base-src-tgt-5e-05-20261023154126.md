# ngwgsang/viexdp-bartpho-syllable-base-src-tgt-5e-05-20261023154126

## Resumen

`viexdp-bartpho-syllable-base-src-tgt-5e-05-20261023154126` es un ajuste fino (fine-tuning) del modelo vietnamita `vinai/bartpho-syllable-base`, publicado por el usuario `ngwgsang`. Se trata de un modelo secuencia-a-secuencia de 131.608.421 parámetros (medidos sobre los pesos en safetensors) que hereda la arquitectura BART empleada por BARTpho, el primer conjunto de modelos monolingües de gran escala preentrenados para vietnamita con esquema de autoencoder desruidificador. El modelo se distribuye con la librería `transformers` y la etiqueta de pipeline `text2text-generation`.

El problema que aborda es el de la generación condicionada de texto en vietnamita: el sufijo `src-tgt` del identificador sugiere una tarea de transformación entre una secuencia origen y una secuencia destino (por ejemplo, traducción o normalización), aunque la model card no confirma explícitamente la tarea. La relevancia práctica es limitada de momento: el repositorio no incluye descripción, datos de entrenamiento ni evaluación funcional, y solo declara una pérdida de validación de 2,1326.

La ficha se basa exclusivamente en los metadatos de HuggingFace, la model card autogenerada por `Trainer` y la documentación pública del modelo base BARTpho. Cualquier dato no presente en esas fuentes se marca como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (hereda de `vinai/bartpho-syllable-base`) |
| Parametros totales | 131.608.421 (dato real, safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (no se declara `max_position_embeddings`) |
| Tipos de cuantizacion | No se publican pesos cuantizados; los safetensors en precisión completa permiten conversión a fp16/bf16, int8 e int4 |
| Idiomas soportados | No disponibles en los metadatos; el modelo base BARTpho está preentrenado para vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio `transformers`; tamaño del repo 4,2 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `vinai/bartpho-syllable-base`, que a su vez sigue la arquitectura "base" de BART (encoder-decoder con atención completa, aproximadamente 12 capas en cada torre) y el esquema de preentrenamiento de autoencoder desruidificador: el texto se corrompe con ruido y el modelo aprende a reconstruirlo. La variante `syllable` de BARTpho tokeniza a nivel de sílaba, lo que se ajusta a la estructura aislante del vietnamita. Sobre ese punto de partida, este checkpoint aplica un fine-tuning supervisado con los hiperparámetros declarados por `Trainer`.

Los detalles del dataset de entrenamiento no están disponibles ("fine-tuned ... on an unknown dataset", según la propia model card). La configuración registrada es: tasa de aprendizaje 5e-05, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, programador lineal con `warmup_ratio` de 0,1, tamaño de lote de 16 (entrenamiento y evaluación), semilla 42 y 8 épocas, lo que suma 2784 pasos. No se documenta el número de tokens vistos, la composición del corpus ni si hubo etapas de RLHF o DPO (en un modelo de este tamaño y antigüedad de pipeline es esperable que no las haya, pero no está confirmado). El historial de pérdidas evidencia un sobreajuste temprano: la pérdida de entrenamiento cae de 2,1056 a 0,7167 mientras la de validación toca mínimo en la época 3 (2,0012) y repunta hasta 2,1326 en la época 8.

## Capacidades

- Generación de texto condicionada entrada-salida (`text2text-generation`): el modelo recibe una secuencia y produce otra, adecuado para transformaciones de texto completas.
- Transformación entre secuencias origen y destino, presumiblemente traducción o conversión de registros lingüísticos, a partir del sufijo `src-tgt` del identificador (no confirmado en la model card).
- Procesamiento de vietnamita a nivel de sílaba, gracias a la tokenización heredada de BARTpho-syllable.
- Reescritura y normalización de texto: paráfrasis, corrección superficial y estandarización de cadenas.
- Resumen extractivo y abstractivo: capacidad natural de la arquitectura BART, aunque no hay evaluación publicada para este checkpoint.
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, visión ni audio.
- No se declara modo "thinking" ni capacidades multimodales.

## Casos de uso

- Traducción o conversión de texto entre variantes lingüísticas: el modelo está formateado como `src-tgt`, por lo que puede emplearse como traductor o transformador secuencia a secuencia; requiere validación empírica previa, ya que la tarea exacta no está documentada.
- Normalización de texto vietnamita en pipelines de TTS/ASR: convertir transcripciones ruidosas en texto limpio y con sílabas bien segmentadas antes de alimentar un sintetizador de voz.
- Reescritura y paráfrasis de contenidos editoriales: generar variantes de titulares o descripciones manteniendo el contenido semántico, con revisión humana obligatoria.
- Generación de datos sintéticos para entrenar clasificadores: producir pares de frases para aumentación de corpus en vietnamita, dado el bajo coste de inferencia de un modelo de 131 M de parámetros.
- Resumen de documentos cortos: condensar actas, reseñas o noticias breves en vietnamita, aprovechando la arquitectura encoder-decoder; conviene limitar la entrada a la ventana real del tokenizador del modelo base.
- Preprocesado en buscadores y sistemas de recuperación: generar consultas reformuladas o expansiones de una consulta original para mejorar el recall en un índice textual vietnamita.
- Prototipado académico y experimentos de ajuste fino: sirve como punto de partida barato para investigar transferencia en tareas vietnamitas con recursos limitados (una sola GPU consumer).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` del autor está vacío (`results: []`) y no hay métricas de MMLU, HumanEval, GSM8K, BLEU ni ROUGE. El único dato cuantitativo es la pérdida de validación registrada durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 1.0 | 348 | 2,1056 | 2,1139 |
| 2.0 | 696 | 1,7943 | 2,0071 |
| 3.0 | 1044 | 1,5202 | 2,0012 |
| 4.0 | 1392 | 1,2425 | 2,0468 |
| 5.0 | 1740 | 1,0303 | 2,0617 |
| 6.0 | 2088 | 0,8940 | 2,0974 |
| 7.0 | 2436 | 0,8494 | 2,1221 |
| 8.0 | 2784 | 0,7167 | 2,1326 |

El checkpoint final declarado (pérdida 2,1326) no es el mejor punto de validación del entrenamiento: la época 3 ofrece 2,0012.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,55 GB en fp32, 0,27 GB en fp16/bf16 y 0,07-0,14 GB con cuantización de 4-8 bits, solo para los pesos; hay que sumar el estado del decodificador y las activaciones (habitualmente menos de 1 GB adicional con lotes pequeños).
- GPU recomendadas: cualquier GPU con 4 GB o más basta para inferencia en fp16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El entrenamiento completo cabe en una GPU consumer de 8-12 GB con lote reducido.
- Cabe en GPU consumer: sí, en toda la gama actual (GTX 1660 6 GB en adelante), y también en CPU para inferencia por lotes pequeños, con latencias mayores.
- Opciones de despliegue: `transformers` con `pipeline("text2text-generation")` es la vía soportada; también es posible servirlo con TorchServe o con un wrapper propio de FastAPI. El soporte de arquitecturas BART en vLLM, TGI, llama.cpp y Ollama es limitado o inexistente, por lo que estas rutas requerirían conversión y verificación adicional.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Por tamaño, es esperable un throughput alto en GPU moderna (cientos de secuencias cortas por segundo con lotes grandes), pero es una estimación, no un dato medido.

## Comparativa con modelos similares

Los tamaños de los modelos alternativos son datos de referencia de la literatura, no verificados en la búsqueda web realizada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`viexdp-bartpho-syllable-base-src-tgt`) | 131,6 M | no disponible | seq2seq sobre vietnamita (tarea no confirmada) | MIT | HuggingFace, 0 descargas |
| `vinai/bartpho-syllable-base` | ~131 M (arquitectura base) | no disponible | seq2seq generativo en vietnamita | MIT (según modelo base) | HuggingFace, modelo de referencia |
| `vinai/bartpho-word-base` | ~131 M | no disponible | seq2seq con tokenización a nivel de palabra | MIT | HuggingFace |
| `VietAI/vit5-base` | ~220 M | no disponible | seq2seq (T5) para vietnamita | MIT | HuggingFace |
| `facebook/mbart-large-50` | ~610 M | 1024 tokens | traducción multilingüe (50 idiomas) | MIT | HuggingFace |

Frente a `vit5-base`, este modelo ofrece menor número de parámetros y tokenización silábica específica, a cambio de una documentación prácticamente inexistente y ninguna evaluación publicada. Frente a `mbart-large-50`, es cinco veces más pequeño y monolingüe, lo que reduce coste de inferencia pero elimina la cobertura multilingüe.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: no hay descripción, datos de entrenamiento, usos previstos ni limitaciones declaradas por el autor.
- Sobreajuste evidente: la pérdida de validación mínima se alcanza en la época 3 y el checkpoint publicado corresponde a la época 8, con la peor validación del historial (2,1326 frente a 2,0012). Es recomendable reentrenar o usar un checkpoint intermedio.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de calidad en tareas reales.
- Tarea no confirmada: el sufijo `src-tgt` sugiere traducción o transformación, pero no se especifica el par de lenguas ni el corpus; usar el modelo sin evaluarlo previamente puede producir salidas incoherentes.
- Riesgo de alucinación: como todo modelo generativo seq2seq, puede inventar contenido, especialmente con entradas fuera de dominio o más largas que la ventana de entrenamiento.
- Idioma: no se declaran idiomas en los metadatos; el modelo base es monolingüe vietnamita, por lo que el rendimiento en castellano u otras lenguas es previsiblemente nulo o muy degradado.
- Longitud de contexto no documentada: entradas largas pueden truncarse silenciosamente en el tokenizador.
- Licencia MIT en este repositorio, pero conviene revisar los términos del modelo base `vinai/bartpho-syllable-base` antes de un uso comercial, así como las condiciones del dataset de ajuste fino, que se desconoce.
- Sin filtros de seguridad declarados: no hay información sobre moderación, sesgos o evaluación de toxicidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngwgsang/viexdp-bartpho-syllable-base-src-tgt-5e-05-20261023154126
- Modelo base: https://huggingface.co/vinai/bartpho-syllable-base
- Repositorio oficial de BARTpho: https://github.com/VinAIResearch/BARTpho
- Ficha de BARTpho-syllable en AIBase: https://model.aibase.com/models/details/1924737421531156480
- Ficha de BARTpho-syllable en PromptLayer: https://www.promptlayer.com/models/bartpho-syllable
- Tutorial sobre modelos preentrenados para vietnamita (Dat Quoc Nguyen): https://datquocnguyen.github.io/resources/AIDay2022_NLP_Tutorial_DatQuocNguyen.pdf
- Artículo sobre GoiBERT y modelos compactos vietnamitas: https://arxiv.org/html/2610.30067
