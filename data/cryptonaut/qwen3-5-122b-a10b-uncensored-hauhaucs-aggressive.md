# cryptonaut/Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo multimodal Qwen3.5-122B-A10B de Alibaba Qwen, publicada por el usuario cryptonaut (con el trabajo de cuantizacion y modificacion atribuido a HauhauCS). El modelo conserva la arquitectura y los pesos del original, pero elimina los mecanismos de rechazo y reduce los avisos de seguridad, de modo que responde a practicamente cualquier prompt. El autor declara "0/465 refusals" en su conjunto de pruebas interno.

Tecnicamente es un transformer hibrido con mezcla de expertos (MoE) de 122.111 millones de parametros totales y aproximadamente 10B activos por token, con 256 expertos (8 enrutados mas 1 compartido). Combina atencion lineal Gated DeltaNet con atencion softmax completa en una proporcion 3:1, dispone de 48 capas y una ventana de contexto nativa de 262K tokens. Es nativamente multimodal (texto, imagen y video) y cubre 201 idiomas.

Su relevancia actual radica en dos factores: por un lado, ofrece la capacidad de un modelo frontera de ~122B en un formato MoE que solo activa ~10B por token, lo que reduce el coste de inferencia; por otro, la distribucion en GGUF con cuantizaciones personalizadas K_P permite ejecutarlo en runtimes de consumo como llama.cpp o LM Studio. La contrapartida es que la eliminacion de salvaguardas lo hace inadecuado para despliegues publicos sin moderacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: Gated DeltaNet (atencion lineal) + atencion softmax completa, ratio 3:1; 48 capas con patron 12 x (3 x DeltaNet-MoE + 1 x Attention-MoE) |
| Parametros totales | 122.111.526.912 (~122B) |
| Parametros activos | ~10B por forward pass |
| Longitud de contexto | 262K tokens nativos (ejemplos de uso con `-c 131072`) |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XXS, IQ2_M; mmproj f16 para vision |
| Idiomas soportados | 201 idiomas segun el autor; tags de idioma: en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo mmproj separado para vision); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-122B-A10B original: un transformer MoE con 256 expertos, de los cuales se enrutan 8 mas 1 compartido por token, organizado en 48 capas. La innovacion principal es la hibridacion de atencion: tres capas de Gated DeltaNet (atencion lineal con estado recurrente) por cada capa de atencion softmax completa, lo que reduce el coste computacional y de memoria en contextos largos manteniendo capacidad de recuperacion exacta. El vocabulario es de 248K tokens y el modelo es nativamente multimodal, procesando texto, imagen y video.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La variante Uncensored no modifica datasets ni capacidades segun el autor: se limita a eliminar los rechazos y reducir los avisos. Las cuantizaciones K_P ("Perfect") son perfiles de cuantizacion personalizados que, segun el autor, preservan calidad equivalente a 1-2 niveles superiores de cuantizacion con solo un 5-15% mas de tamano de archivo, y son compatibles con llama.cpp y LM Studio sin compilaciones especiales.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (activado por defecto) y modo no-thinking, con parametros de muestreo recomendados distintos para cada uno.
- Razonamiento multi-paso y tareas de codigo y matematicas, heredadas del modelo base.
- Vision nativa: procesamiento de imagenes y video mediante el archivo mmproj en formato f16.
- Multilingue: 201 idiomas declarados, con enfasis en ingles y chino.
- Conversacion multi-turno con contexto de hasta 262K tokens.
- Respuesta sin rechazos a practicamente cualquier prompt (variante "Aggressive", sin salvaguardas).
- Compatibilidad con runtimes GGUF: llama.cpp (requiere `--jinja`), LM Studio, Jan, koboldcpp.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para medir el efecto de eliminar los rechazos sobre el comportamiento, comparandolo con el Qwen3.5-122B-A10B original en conjuntos de prompts sensibles.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas que los modelos censurados rechazan, aprovechando el contexto de 262K tokens para mantener coherencia en obras largas.
- Analisis de documentos extensos con imagenes: informes, papers o contratos de cientos de paginas con figuras y tablas, procesados en una sola pasada gracias al contexto nativo y a la entrada multimodal.
- Procesamiento de video y descripcion de escenas: transcripcion descriptiva de contenido audiovisual mediante el mmproj, util en catalogacion de archivos o accesibilidad.
- Asistencia tecnica y de codigo en local: con la cuantizacion Q4_K_P (79 GB) puede ejecutarse en estaciones de trabajo con suficiente VRAM o RAM, ofreciendo razonamiento de nivel ~122B a coste de ~10B activos por token.
- Traduccion y procesamiento multilingue: cobertura de 201 idiomas para traduccion, resumen y clasificacion de contenido en pipelines internos.
- Despliegue en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp, permite inferencia totalmente local sin llamadas a APIs externas, adecuado para datos confidenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es "0/465 refusals" en su conjunto de pruebas de rechazo, que no constituye un benchmark de calidad o capacidad.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de archivo): Q8_K_P 145 GB; Q6_K_P 105 GB; Q6_K 100 GB; Q5_K_P 94 GB; Q5_K_M 87 GB; Q4_K_P 79 GB; Q4_K_M 74 GB; IQ4_XS 65 GB; Q3_K_P 63 GB; Q3_K_M 59 GB; IQ3_M 54 GB; IQ3_XXS 47 GB; IQ2_M 40 GB. Para vision, anadir 867 MB del mmproj.
- Al ser MoE con ~10B activos, la inferencia puede repartir expertos entre GPU y CPU; el requisito real es disponer de memoria total (VRAM + RAM) suficiente para el archivo completo mas el contexto KV.
- GPU recomendadas: para las cuantizaciones altas (Q8, Q6) se necesitan configuraciones multi-GPU tipo A100 80GB o H100 80GB; para Q4_K_P o IQ4_XS, una o dos RTX 4090 (24 GB cada una) junto con RAM del sistema pueden ser suficientes con offload parcial.
- No cabe en una unica GPU de consumo de 24 GB sin offload a RAM del sistema, incluso en IQ2_M (40 GB).
- Opciones de despliegue: llama.cpp (obligatorio `--jinja` para el chat template), LM Studio, Jan, koboldcpp. vLLM y TGI no estan confirmados para este formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive | 122B | ~10B | 262K | Texto, imagen, video | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-122B-A10B (base) | 122B | ~10B | 262K | Texto, imagen, video | Apache 2.0 | Safetensors |
| Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B | ~3B | no disponible | no disponible | Apache 2.0 | GGUF |
| Qwen3.5-27B-Uncensored-HauhauCS-Aggressive | 27B | denso | no disponible | no disponible | Apache 2.0 | GGUF |

La comparativa directa mas relevante es con el modelo base: misma arquitectura, mismos pesos de origen y misma licencia, con la diferencia de la eliminacion de rechazos y el formato GGUF cuantizado. Frente a las variantes menores de la misma familia (35B, 27B, 9B, 4B) el modelo ofrece mayor capacidad a cambio de requisitos de memoria mucho mas altos.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: la variante "Aggressive" no rechaza prompts y reduce los avisos, por lo que puede generar contenido danino, ilegal o inseguro. No es apta para exposicion directa al publico sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo generativo, puede producir afirmaciones falsas con aparente seguridad.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo entrenado principalmente en ingles y chino, es probable un sesgo hacia esas culturas y lenguas.
- Limitaciones de idioma: aunque se declaran 201 idiomas, la calidad fuera de ingles y chino no esta verificada en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado sin filtros.
- Formato GGUF unicamente: no se distribuyen pesos safetensors de esta variante; el ajuste fino o el reentrenamiento requeririan partir del modelo base original.
- Las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantizacion de LM Studio; es un problema de visualizacion segun el autor, no de carga.
- El contexto de 262K es nativo, pero los ejemplos de uso limitan a 131072 tokens; la memoria KV a contexto maximo puede ser prohibitiva en configuraciones de consumo.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad ni reportes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cryptonaut/Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Variante 35B-A3B: https://huggingface.co/HauhauCS/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive
- Variante 27B: https://huggingface.co/HauhauCS/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive
- Variante 9B: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Variante 4B: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
