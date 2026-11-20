# litert-community/NVIDIA-Nemotron-3.5-Bolt-E4B

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo de lenguaje pequeno (SLM) desarrollado por NVIDIA como un post-entrenamiento adicional sobre Gemma-4-E4B-it. El modelo esta disenado para asistentes de voz y dispositivo locales, personas interactivas e interfaces embebidas, mejorando el uso de herramientas multi-turno, el seguimiento de instrucciones y el anclaje de entrada. Esta ficha concreta es una conversion del checkpoint BF16 original de NVIDIA al formato LiteRT-LM (.litertlm) realizada por la comunidad litert-community, orientada a inferencia en dispositivo (edge) en moviles y equipos de consumo.

La arquitectura subyacente es la de Gemma 4 E4B: 42 capas decodificadoras (35 con ventana deslizante de 512 tokens y 7 con atencion completa), tamano oculto de 2560, 8 cabezas de consulta y 2 cabezas clave-valor, vocabulario de 262.144 tokens y una segunda tabla de embeddings que otorga a cada capa 256 valores por token. Las ultimas 18 capas leen las claves y valores de capas anteriores. El checkpoint original incluye codificadores de imagen y audio de Gemma 4, pero los ficheros LiteRT-LM los omiten, por lo que esta conversion es solo texto a texto.

La relevancia de esta ficha radica en que ofrece un modelo de razonamiento con modo thinking, tool calling e instrucciones multi-turno en un paquete de 4,4 GB (int4) o 5,0 GB (NPU) que corre en un Galaxy S26 con velocidades sostenidas de 15,2 tokens/s en GPU y 12,2 tokens/s en NPU. La licencia es OpenMDW-1.1 y NVIDIA declara el modelo listo para uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Gemma 4 E4B) con atencion hibrida: 35 capas de ventana deslizante de 512 tokens y 7 capas de atencion completa; 42 capas; hidden size 2560; 8 cabezas de consulta y 2 cabezas KV; ultimas 18 capas con atencion cruzada a capas anteriores |
| Parametros totales | no disponible (el checkpoint BF16 base se distribuye como NVIDIA-Nemotron-3.5-Bolt-E4B-BF16; el tamano del repo LiteRT-LM es 13,8 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; la cache KV de los ficheros LiteRT-LM es de 2.048 tokens y las firmas de prefill son de 128, 512 y 1.024 tokens |
| Tipos de cuantizacion | int4 (fichero CPU/GPU: pesos int4 en bloques de 32 en capas fully connected con escalas de bloque con suelo en 2^-14, embeddings int4 por canal, cache KV de 2.048 tokens); int8 por canal con activaciones int16 estaticas y proyecciones MLP gate/up y lm_head en int4 por canal (fichero NPU Qualcomm SM8850) |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 (openmdw-1.1) |
| Formato de pesos | .litertlm (LiteRT-LM); el modelo base esta en BF16 |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador basado en Gemma 4 E4B con atencion hibrida: 35 de las 42 capas usan una ventana deslizante de 512 tokens, mientras que 7 capas mantienen atencion completa. El tamano oculto es 2560, con 8 cabezas de consulta y 2 cabezas clave-valor (GQA). El vocabulario es de 262.144 tokens y se anade una segunda tabla de embeddings que proporciona a cada capa sus propios 256 valores por token. Las ultimas 18 capas leen las claves y valores de capas anteriores, un mecanismo de reutilizacion de representaciones entre capas. El checkpoint original incluye codificadores de imagen y audio de Gemma 4, pero la conversion LiteRT-LM los excluye, dejando un modelo exclusivamente de texto.

NVIDIA describe Bolt-E4B como un post-entrenamiento adicional sobre Gemma-4-E4B-it orientado a mejorar el uso de herramientas multi-turno, el seguimiento de instrucciones y el anclaje de entrada para asistentes locales de voz y dispositivo. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. La innovacion tecnica destacable de esta conversion es la compilacion especifica para hardware: el fichero int4 incluye composites de GPU para las escrituras de cache KV y los productos de matriz de atencion, y el fichero NPU esta compilado ahead-of-time para el Snapdragon SM8850 con librerias QNN de Qualcomm. El modelo soporta un modo thinking que el runtime separa del texto de respuesta mediante el canal `<|channel>thought`.

## Capacidades

- Generacion de texto en ingles con modo thinking opcional (`--thinking true`, con `--thinking-budget` para limitar el presupuesto de razonamiento).
- Razonamiento matematico y aritmetico: obtiene 92/100 en GSM8K con el fichero int4 en GPU de Mac M4 Max y 92/99 en NPU de Galaxy S26, practicamente identico a la referencia BF16 (93/100).
- Uso de herramientas multi-turno (tool calling / function calling), segun la descripcion de NVIDIA del post-entrenamiento.
- Seguimiento de instrucciones y anclaje de entrada (input grounding) mejorados respecto a Gemma-4-E4B-it.
- Razonamiento multi-paso mediante el canal de pensamiento separado de la respuesta.
- Capacidades multilingues limitadas: solo ingles declarado.
- No incluye vision ni audio en esta conversion, aunque el checkpoint base de Gemma 4 si los incorpora.
- Extraccion de informacion y respuestas cortas: en la prueba de ejemplo extrae fechas correctamente ("May 3, May 17").
- Respuestas a preguntas cortas de cultura general, traduccion, comparacion de decimales y rimas, verificadas en las pruebas de la model card.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo esta disenado para asistentes locales de voz y dispositivo; con 15,2 tokens/s sostenidos en GPU de Galaxy S26 y 12,2 tokens/s en NPU, puede gestionar turnos conversacionales con latencia aceptable sin enviar datos a la nube.
- Extraccion de entidades y datos estructurados en el movil: el ejemplo de la model card extrae fechas de un texto en 2,4 s incluyendo la creacion del motor, con un pico de memoria de 4,3 GB en Mac M4 Max; adecuado para procesar notas, correos o mensajes localmente.
- Razonamiento aritmetico y matematico embebido: con 92/100 en GSM8K en int4, puede resolver problemas de varios pasos en aplicaciones educativas o de calculo sin conexion.
- Agentes multi-paso con tool calling en el borde: el post-entrenamiento de NVIDIA mejora el uso de herramientas multi-turno, lo que permite encadenar llamadas a funciones locales (calendario, contactos, APIs del dispositivo) en un asistente personal.
- Personas interactivas y interfaces conversacionales embebidas: el modelo esta orientado a personas interactivas e interfaces embebidas, con modo thinking que permite separar el razonamiento interno de la respuesta visible al usuario.
- Clasificacion y respuesta a preguntas cortas en ingles: las pruebas de la model card verifican respuestas correctas a preguntas de suma, producto, capitales, opuestos, dias de la semana, traduccion, comparacion de decimales y rimas, util para tareas de QA ligero en aplicaciones moviles.
- Despliegue en dispositivos Qualcomm Snapdragon: el fichero NPU compilado para SM8850 permite ejecutar el modelo en la NPU del telefono con 12,2 tokens/s, liberando la GPU para otras tareas.

## Benchmarks y rendimiento

| Configuracion | GSM8K (thinking off) |
|---|---|
| Referencia BF16 (transformers 5.14.1, CPU) | 93/100 |
| Fichero int4, GPU de Mac M4 Max (activaciones fp16) | 92/100 |
| Fichero int4, GPU de Galaxy S26, primeras 52 preguntas | 48/52 (referencia: 49/52) |
| Fichero NPU, NPU de Galaxy S26, primeras 99 preguntas | 92/99 (referencia: 92/99) |

Las diferencias pregunta a pregunta no superan el azar segun la prueba exacta de McNemar (p = 1,0 en las tres configuraciones). Las ejecuciones en telefono se detuvieron por limite de tiempo en dispositivo: 52 preguntas en GPU (ralentizada por calor a ~1 minuto por pregunta) y 99 en NPU. Las preguntas de Galaxy S26 GPU se ejecutaron con el fichero int4 antes de anadir la firma de prefill de 512 tokens; los prompts son menores de 200 tokens y usan la firma de 128 tokens y los grafos de decodificacion, que no cambiaron.

Rendimiento de inferencia en Galaxy S26 (2026-10-26, con reloj de GPU reducido, valores sostenidos):

| Metrica | GPU (int4) | NPU (SM8850) |
|---|---|---|
| Prefill (1.024 tokens) | 868 tokens/s | no disponible |
| Decodificacion | 15,2 tokens/s | 12,2 tokens/s |

En Mac M4 Max, el fichero int4 respondio al ejemplo de extraccion de fechas en 2,4 s incluyendo la creacion del motor, con pico de memoria de 4,3 GB.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero int4 ocupa 4,40 GB (4.404.805.632 bytes) y el fichero NPU 5,04 GB (5.038.493.603 bytes); en Mac M4 Max el pico de memoria medido fue de 4,3 GB.
- GPU recomendadas: GPU de Galaxy S26 (probado, 15,2 tokens/s), GPU de Mac M4 Max (probado, 92/100 en GSM8K); no se especifican otras GPU en la model card.
- Cabe en GPU de consumo: si, segun las pruebas en Galaxy S26 y Mac M4 Max; no se detallan requisitos para RTX 4090 u otras GPU de escritorio.
- Despliegue: LiteRT-LM v0.18.0 (pip install litert-lm==0.18.0) con backend GPU o CPU; el fichero NPU requiere el ejecutor NPU de LiteRT-LM, librerias QNN de Qualcomm (QAIRT 2.47.0) y `--use_hw_cache_update_for_npu=true`; probado tambien con LiteRT-LM v0.19.1 y el paquete litert-lm-api 0.19.1 de PyPI (que no incluye la libreria de despacho de Qualcomm).
- Latencia y throughput: 2,4 s para una extraccion de fechas en Mac M4 Max (incluye creacion del motor); 868 tokens/s de prefill y 15,2 tokens/s de decodificacion en GPU de Galaxy S26; 12,2 tokens/s de decodificacion en NPU de Galaxy S26.
- Cache KV: 2.048 tokens en ambos ficheros; un prompt, su pensamiento y su respuesta comparten esa cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/Disponibilidad | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B (esta ficha, LiteRT-LM) | no disponible (base Gemma 4 E4B) | cache KV 2.048 tokens | OpenMDW-1.1 | .litertlm, 4,40 GB int4 / 5,04 GB NPU | Solo texto; GSM8K 92/100 int4 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | no disponible | no disponible | no disponible en la informacion proporcionada | BF16 en Hugging Face | Modelo base del que deriva esta conversion; incluye codificadores de imagen y audio |
| Gemma-4-E4B-it | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo del que NVIDIA parte para el post-entrenamiento de Bolt-E4B |

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- Esta conversion excluye los codificadores de imagen y audio del checkpoint base, por lo que no admite entrada multimodal.
- La cache KV esta limitada a 2.048 tokens en los ficheros LiteRT-LM; prompts, pensamientos y respuestas comparten ese espacio, lo que restringe conversaciones largas.
- Riesgo de alucinacion inherente a los SLM; la model card no documenta evaluaciones de sesgo ni de robustez fuera de GSM8K y preguntas cortas.
- El modo thinking esta desactivado por defecto; activarlo consume parte del presupuesto de 2.048 tokens de cache.
- La licencia OpenMDW-1.1 permite uso comercial segun NVIDIA ("ready for commercial or non-commercial use"), pero debe verificarse el texto completo de la licencia para obligaciones concretas.
- El fichero NPU depende de hardware especifico (Snapdragon SM8850) y de librerias QNN de Qualcomm; no es portable a otras NPU.
- Las pruebas en telefono se truncaron por limite de tiempo (52 y 99 preguntas), por lo que la evaluacion completa en dispositivo no esta documentada.
- El rendimiento en GPU de Galaxy S26 se midio con el reloj reducido por calor; en sesiones prolongadas la latencia puede degradarse (~1 minuto por pregunta en el caso citado).

## Enlaces

- Hugging Face (esta conversion): https://huggingface.co/litert-community/NVIDIA-Nemotron-3.5-Bolt-E4B
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
