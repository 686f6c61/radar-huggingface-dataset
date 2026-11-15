# halo123/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantizacion GGUF derivada de DeepSeek-V4.1-Flash-1017, el modelo insignia de DeepSeek en su variante Flash con arquitectura de mezcla de expertos (MoE). El autor del repositorio, halo123, parte de la cuantizacion GSQ-RCO publicada por ISTA-DASLab y aplica una edicion de "abliteration": proyecta fuera de los tensores densos que escriben en el residual la direccion de rechazo aprendida por DeepSeek, de modo que el modelo deja de negarse a responder peticiones que el modelo original rechazaria. El modelo base cuenta con 763.000 millones de parametros totales y 384 expertos enrutados, y el repositorio declara 551.880.949.208 parametros en safetensors (dato probablemente parcial, correspondiente a los tensores densos y no a la totalidad de los expertos).

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de cuantizacion extrema: los ficheros publicados van desde 231 GB (IQ1_M, 1,75 bits por peso) hasta 266 GB (IQ2_XS, 2,25 bpw), lo que hace viable servir un modelo de 763B en hardware de consumo gracias al esquema Strata, que mantiene el backbone en memoria del sistema y transmite la tabla Engram desde un SSD. Por otro, ilustra una tecnica de abliteration quirurgica que, segun las mediciones del autor, reduce la tasa de jailbreak de JailbreakBench del 85-89 % al 0 % sin degradar GPQA-Diamond (83,3 % en ambos casos) ni AIME25 (76,7 % frente a 80,0 %, dentro del ruido con n=30).

El modelo se distribuye bajo licencia MIT y esta pensado para generacion de texto conversacional. No obstante, conviene advertir desde el principio que el repositorio tiene cero descargas y un solo "me gusta" en el momento de redactar esta ficha, que el autor no es el desarrollador original y que la model card no documenta idiomas soportados ni detalles de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados, expertos compartidos (shexp) y modulo Engram de memoria asociativa |
| Parametros totales | 763 000 millones (modelo base); 551 880 949 208 declarados en safetensors del repo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de 4 ficheros por rung) + fichero Engram separado de 110 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos con 384 expertos enrutados por capa, expertos compartidos y un componente denominado Engram, una tabla de busqueda de 110 GB que actua como memoria asociativa y que se sirve por streaming desde SSD en el runtime Strata. La cuantizacion GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precision aprendido sobre los expertos enrutados, de modo que cada tensor conserva su tipo por tensor exacto.

La edicion de abliteration de este repositorio sustituye unicamente los tensores densos que escriben en el residual: la salida de atencion (`attn_output_b`), la proyeccion descendente del experto compartido (`ffn_down_shexp`) y la proyeccion de valor del Engram (`engram_wkv`). Sobre esos tensores se aplica la direccion de rechazo de DeepSeek con fuerza 2,0 en precision completa y se cuantiza al tipo por tensor original de ISTA. Los 384 expertos enrutados quedan intactos byte a byte, lo que preserva el redondeo aprendido de GSQ y mantiene el tamano de fichero y los requisitos de ejecucion del original. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles (los benchmarks publicados son en ingles).
- Razonamiento con modo "thinking" configurable por esfuerzo; la model card reporta 27/30 aciertos en una prueba de razonamiento alto con el rung original.
- Razonamiento cientifico y matematico de nivel competitivo: GPQA-Diamond al 83,3 % y AIME25 al 76,7-80,0 %.
- Conocimiento general medido con MMLU-500: 80,6-82,8 % segun el rung.
- Respuesta sin rechazos: la edicion elimina la direccion de rechazo en todos los temas, no solo en un subconjunto.
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un LLM de gran escala cuando se elimina la direccion de rechazo, comparando sus respuestas con las del modelo original en el mismo prompt y plantilla.
- Evaluacion de tecnicas de abliteration: al conservar intactos los expertos enrutados y publicar las metricas de KL, MMLU y benchmarks de razonamiento, sirve como referencia reproducible para medir el coste de este tipo de edicion.
- Despliegue local de un modelo de 763B en hardware de consumo: con Strata y un SSD rapido, el backbone reside en RAM del sistema y la tabla Engram se transmite desde disco, de modo que un equipo con 12 GB de VRAM puede servir el modelo.
- Generacion creativa sin filtros: escritura de ficcion, guiones o contenido narrativo que el modelo base rechazaria por sus politicas de seguridad.
- Analisis de contenido sensible en entornos de investigacion: clasificacion y resumen de material que aborda violencia, contenidos para adultos u otros temas que disparan los rechazos del modelo original.
- Pruebas de robustez y red teaming: generar respuestas a peticiones adversariales para evaluar clasificadores de seguridad y sistemas de moderacion de terceros.
- Experimentacion con cuantizacion extrema: comparar la calidad de IQ1_M, IQ2_XXS e IQ2_XS sobre el mismo backbone para estudiar la degradacion a 1,75-2,25 bits por peso.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor y comparan el rung editado con el rung original de ISTA-DASLab servidos ambos en Strata con las mismas plantillas.

| Benchmark | GSQ-RCO original | Uncensored (este repo) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3 % | 83,3 % |
| AIME25 (30 preguntas) | 76,7 % | 80,0 % |
| MMLU-500, rung IQ2_XXS | 82,8 % | 82,8 % (p=0,27) |
| MMLU-500, rung IQ2_XS | 81,6 % | 81,6 % (p=1,00) |
| MMLU-500, rung IQ1_M | 80,6 % | 80,6 % (p=0,75) |

| Metrica de seguridad | Original | Editado |
|---|---|---|
| JailbreakBench (EN), IQ2_XXS | 85,2 % | 0,0 % |
| JailbreakBench (EN), IQ2_XS | 86,4 % | 0,0 % |
| JailbreakBench (EN), IQ1_M | 88,9 % | 0,0 % |
| XSTest (rechazos seguros), IQ2_XXS | 7,6 % | 0,0 % |
| Razonamiento alto (30 pruebas), IQ2_XXS | 27/30 | 0/30 |
| Divergencia KL respecto al original | — | 0,0207-0,0272 |

La divergencia KL se calcula con el modo de puntuacion teacher-forced de Strata y es una cota inferior sobre los 64 tokens mas probables, por lo que el valor real es ligeramente superior.

## Requisitos de hardware

- VRAM: 12 GB son suficientes para servir el modelo con Strata, ya que el backbone reside en memoria del sistema y la tabla Engram se transmite desde SSD.
- Almacenamiento: entre 231 GB (IQ1_M) y 266 GB (IQ2_XS) para los shards del rung, mas 110 GB del fichero Engram compartido, que debe residir en un SSD rapido junto a los shards.
- Memoria del sistema: no cuantificada en la informacion disponible; el backbone completo debe caber en RAM.
- GPU recomendadas: no disponible. La model card solo afirma que funciona en una GPU de 12 GB; no especifica modelos concretos (RTX 4090, A100, H100).
- Opciones de despliegue: exclusivamente Strata. La model card indica que DeepSeek-V4.1 con fichero Engram separado no esta soportado todavia en llama.cpp, y no se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repo (DeepSeek-V4.1-Flash-1017 Uncensored GSQ-RCO) | 763B (384 expertos) | no disponible | MIT | GGUF IQ1/IQ2 + Engram | Abliteration, requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 763B (384 expertos) | no disponible | no disponible | GGUF GSQ-RCO + Engram | Modelo base cuantizado, con rechazos |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 763B (384 expertos) | no disponible | no disponible | GGUF | Misma edicion de abliteration, otro empaquetado |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B (384 expertos) | no disponible | no disponible | safetensors | Pesos originales sin cuantizar |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion de rendimiento se limita a la tabla de la seccion anterior.

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, de modo que un rechazo suave formulado mas adelante en el texto puede pasar por respuesta valida.
- La edicion elimina los rechazos en todos los temas; no conserva un subconjunto mas estrecho de negativas legitimas.
- Con el modo thinking activado, el modelo planifica una respuesta a una peticion que el modelo original rechazaria, lo que agrava el riesgo de contenido danino.
- El rung IQ2_XXS pierde por completo la capacidad de razonamiento alto en la prueba del autor (0/30 frente a 27/30 del original); los rungs IQ2_XS e IQ1_M la reducen a 2/30 y 1/30 respectivamente.
- La cuantizacion a 1,75-2,25 bits por peso implica una perdida de calidad no cuantificada mas alla de MMLU, GPQA y AIME.
- El repositorio no documenta idiomas soportados; todos los benchmarks publicados son en ingles.
- El autor del repositorio no es el desarrollador original del modelo y el repositorio presenta cero descargas, por lo que no hay validacion independiente de las metricas.
- La licencia MIT se aplica al empaquetado, pero conviene verificar las condiciones del modelo base de DeepSeek antes de un uso comercial.
- El despliegue esta limitado a Strata; no hay soporte en llama.cpp ni en los runners habituales, lo que reduce la portabilidad.
- Riesgo elevado de alucinacion en un modelo sin rechazos y con cuantizacion extrema, especialmente en el rung IQ1_M.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/halo123/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version equivalente de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Metricas y logs por pregunta: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
