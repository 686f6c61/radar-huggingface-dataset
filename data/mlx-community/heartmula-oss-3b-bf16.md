# mlx-community/HeartMuLa-oss-3B-bf16

## Resumen

HeartMuLa-oss-3B-bf16 es la conversión a formato MLX del modelo de lenguaje del sistema generativo de música HeartMuLa-oss-3B, publicada por la comunidad mlx-community para su uso en Apple Silicon a través de la librería Swift mlx-heartmula-swift. No es un modelo de texto generalista: es el componente de lenguaje de un pipeline text-to-audio que transforma etiquetas de estilo separadas por comas y letras con marcas de sección en una canción completa con voz, en estéreo a 48 kHz y con una duración de hasta 4 minutos.

El modelo emplea una arquitectura de dos niveles: un LM global de 3B parámetros con la forma de Llama-3.2 (28 capas × 3072, RoPE intercalado con θ 500 000 y escalado Llama-3) que predice el codebook 0 a 12,5 Hz, y un decodificador local de 300M parámetros (3 capas) que predice los codebooks 1 a 7 mediante cabezas por codebook. Los pesos suman 3.938.113.536 parámetros en total y el repositorio ocupa 7,9 GB en bf16.

Su relevancia es doble: por un lado, ofrece una alternativa de código abierto (Apache-2.0) a los sistemas propietarios de generación musical; por otro, esta variante concreta permite ejecutar el modelo en Macs con 32 GB de RAM unificada, con un rendimiento medido de 2,5× tiempo real en un M5 Max. El modelo base es HeartMuLa/HeartMuLa-oss-3B-happy-new-year y el paper asociado es arXiv 2601.10547.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo de dos niveles: LM global tipo Llama-3.2 (28 capas × 3072) + decodificador local de 3 capas con cabezas por codebook; codec de audio separado |
| Parametros totales | 3.938.113.536 (3B LM global + 300M decodificador local) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (esta variante), 8-bit (variante separada); 4-bit no publicado por fallar la puerta de calidad lírica (PER 0.220) |
| Idiomas soportados | en, zh (inglés y mandarín) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 289 tensores en 2 shards), tokenizer.json, gen_config.json, config.json |

## Arquitectura y entrenamiento

El LM global sigue la forma de Llama-3.2 con 28 capas y dimensión 3072, usando RoPE intercalado con θ 500 000 y escalado Llama-3. Predice el codebook 0 de un codec de audio a una tasa de 12,5 Hz. Un decodificador local de 300M parámetros y 3 capas predice los codebooks 1 a 7 mediante cabezas específicas por codebook. El codec es un componente separado que se elige de forma independiente (fp16 o fp32) en el pipeline de inferencia.

Esta variante MLX es una conversión directa: cada tensor es el valor float32 del release original casteado a bf16. Según la model card, a fp32 el LM en Swift coincide con heartlib sobre PyTorch-MPS (argmax 130/130 en dos prompts y códigos muestreados idénticos a partir de ruido registrado); a bf16 los logits quedan a aproximadamente 7e-3 de relL2 respecto a la ejecución bf16 de PyTorch, con los mismos códigos muestreados. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de música a partir de etiquetas de estilo separadas por comas y letras con marcas de sección (por ejemplo `[verse]`).
- Producción de audio con voz en estéreo a 48 kHz y duración de hasta 240 segundos (120 s por defecto si no se especifica `durationSeconds`).
- Control de estilo mediante tags descriptivos (por ejemplo "piano pop, warm, female vocal"), aunque la adherencia al estilo es débil según las mediciones del autor.
- Seguimiento de letras en inglés con una tasa de error lírico (PER de Whisper) de 0.125 en bf16, frente a 0.165 de la referencia en PyTorch.
- Generación determinista mediante semilla (`seed`).
- Soporte de dos idiomas en las letras: inglés y mandarín.
- No soporta audio de referencia, ediciones, planificación, partituras, anclas ni selección de idioma vocal; `guidanceScale` se ignora.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo text-to-audio, no un LLM conversacional.

## Casos de uso

- Generación de maquetas musicales para compositores: a partir de una letra con marcas de sección y un conjunto de tags de estilo, el modelo produce una maqueta cantada de hasta 4 minutos en un Mac con 32 GB, lo que permite iterar rápidamente sobre ideas sin depender de servicios en la nube.
- Creación de bandas sonoras para vídeo y podcasts: el pipeline acepta una descripción de estilo y letra, y el límite de 120 s por defecto encaja con cortes publicitarios o sintonías; la salida a 48 kHz estéreo es directamente utilizable en postproducción.
- Prototipado de jingles y cuñas publicitarias: la generación por semilla permite reproducir exactamente una toma concreta y ajustar únicamente la letra o los tags, lo que facilita comparar variantes en un flujo de aprobación con cliente.
- Investigación en generación musical: al ser Apache-2.0 y estar disponible en MLX, sirve como base reproducible para estudiar el efecto de la cuantización (bf16 frente a 8-bit) en la fidelidad lírica y la duración generada, con métricas publicadas (PER, CLAP) y código de medición abierto.
- Experimentación local en Apple Silicon: desarrolladores que ya trabajan con MLX pueden integrar el modelo en una app Swift mediante el paquete `MLXHeartMuLa` y el motor `MLXServeEngine`, sin necesidad de GPU dedicada.
- Generación de contenido para demos y prototipos de producto: la licencia Apache-2.0 permite incorporar el modelo a productos comerciales, siempre que se respete la cadena de atribución indicada en el NOTICE del repositorio.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del autor de la conversión, no benchmarks estándar de la comunidad:

| Metrica | bf16 (esta variante) | 8-bit | Referencia PyTorch |
|---|---|---|---|
| PER lírico en inglés (Whisper) | 0.125 | 0.132 | 0.165 |
| PER lírico en mandarín | No concluyente (solo 2 canciones) | No disponible | 0.457 |
| Canciones que alcanzan el límite de duración (de 24, tope 120 s) | 5 | 10 | No disponible |
| Posición media de recuperación de estilo (CLAP, sobre 12) | ~4.5 | ~4.5 | No disponible |
| Velocidad de render (M5 Max) | 2.5× tiempo real | 3.0× tiempo real | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM de propósito general.

## Requisitos de hardware

- VRAM/RAM unificada estimada para el par LM + codec (memoria declarada como conjunto residente + pico de trabajo):
  - bf16 + codec fp16: 11,5 + 6,0 GB; requiere un Mac de 32 GB; 2,5× tiempo real en M5 Max.
  - bf16 + codec fp32: 14,5 + 10,0 GB; requiere un Mac de 48 GB; 1,85× tiempo real.
  - 8-bit + codec fp16 (opción por defecto): 8,5 + 5,5 GB; cabe en un Mac de 24 GB; 3,0× tiempo real.
  - 8-bit + codec fp32: 11,5 + 10,0 GB; requiere un Mac de 32 GB; 2,3× tiempo real.
- La regla de admisión del motor es 0,7 × RAM disponible, por lo que los valores anteriores incluyen margen.
- Solo se distribuye para Apple Silicon mediante MLX y la librería Swift mlx-heartmula-swift; no hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Las mediciones de memoria corresponden a `phys_footprint` a través de MLXEngine con una canción de 120 s y un peor caso de 240 s.
- No se dispone de datos de latencia absoluta ni de throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeartMuLa-oss-3B-bf16 (MLX) | 3,94B (3B LM + 300M decoder) | No disponible | Apache-2.0 | Hugging Face, MLX/Swift | Conversión comunitaria; PER 0.125 en inglés; solo Apple Silicon |
| HeartMuLa-oss-3B-8bit (MLX) | 3,94B | No disponible | Apache-2.0 | Hugging Face, MLX/Swift | Misma base; PER 0.132; 3 GB menos de memoria; alcanza el tope de duración el doble de veces |
| HeartMuLa-oss-3B-happy-new-year (original) | 3,94B | No disponible | Apache-2.0 (según model card y README de heartlib) | Hugging Face, PyTorch | Modelo base; PER 0.165 en inglés y 0.457 en mandarín |
| Otros modelos abiertos de música | No disponible | No disponible | No disponible | No disponible | La model card solo indica que HeartMuLa obtiene ~4.5/12 en recuperación de estilo CLAP frente a ~2 de otros modelos abiertos medidos, sin nombrarlos |

## Limitaciones y advertencias

- El control de estilo es débil: las canciones se posicionan en torno a 4,5 sobre 12 para sus propios tags según CLAP, y subir el CFG a 3,0 no mejora el resultado.
- Deriva de género vocal: la mayoría de las voces generadas son femeninas independientemente de los tags; solo 1 de 6 prompts con voz masculina produjo una voz masculina.
- El mandarín es débil e irregular: la referencia en PyTorch obtuvo PER 0.457 con un verso perdido, frente a 0.107 en inglés; las tomas en bf16 con Swift mejoraron en las dos canciones probadas, una muestra demasiado pequeña para concluir.
- El LM de 8-bit alcanza el límite de duración el doble de veces que bf16 (10 de 24 frente a 5 de 24 con tope de 120 s); en una de cada 24 canciones se repitió un mismo verso en bucle hasta el tope.
- La salida cruda del codec puede superar el fondo de escala (picos de 1,37), por lo que el pipeline Swift aplica una ganancia de limitador única de −1 dBFS.
- La cuantización a 4-bit no se publicó porque no superó la puerta de calidad lírica (PER 0.220).
- La licencia Apache-2.0 se basa en la declaración de la model card del generador y en el README de heartlib del 20 de enero de 2026, ya que los repositorios originales no incluyen fichero LICENSE; el repositorio incluye el texto Apache-2.0 y un NOTICE con la cadena de atribución.
- El modelo no está respaldado por el equipo de HeartMuLa ni por MuLa Labs.
- No admite audio de referencia, ediciones, planificación, partituras, anclas ni selección de idioma vocal; `guidanceScale` se ignora.
- Riesgo de alucinación en el sentido de letras mal pronunciadas o versos omitidos, cuantificado por las tasas PER anteriores; no aplica el concepto de alucinación factual de un LLM.
- Solo funciona en Apple Silicon a través de MLX; no hay soporte documentado para otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/HeartMuLa-oss-3B-bf16
- Modelo base: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Variante 8-bit: https://huggingface.co/mlx-community/HeartMuLa-oss-3B-8bit
- Codec fp16: https://huggingface.co/mlx-community/HeartCodec-oss-fp16
- Repositorio Swift-MLX: https://github.com/xocialize/mlx-heartmula-swift
- Mediciones detalladas: https://github.com/xocialize/mlx-heartmula-swift/blob/main/MEASUREMENTS.md
- Paper: arXiv 2601.10547
