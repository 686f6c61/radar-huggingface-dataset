# mradermacher/Love-Aligned-31B-GGUF

## Resumen

Love-Aligned-31B-GGUF es el repositorio de cuantizaciones GGUF del modelo UnstableLlama/Love-Aligned-31B, publicado por mradermacher, un autor conocido por generar versiones cuantizadas de modelos abiertos para su ejecución local. Se trata de un modelo de aproximadamente 30.697 millones de parametros (30,7B) afinado mediante LoRA y posteriormente alineado con DPO (Direct Preference Optimization) sobre una base que, segun la etiqueta `gemma4` de la model card, pertenece a la familia Gemma 4. Su orientacion es conversacional y afectiva: el nombre "Love-Aligned" y las etiquetas `alignment` y `conversational` indican un ajuste fino orientado a respuestas de tono empatico y relacional en ingles.

El problema que resuelve es practico: permitir ejecutar un modelo de 31B alineado por preferencias en hardware local o en servidores modestos, sin necesidad de cargar los pesos originales en safetensors. El repositorio ofrece 13 variantes GGUF que van desde 12,0 GB (Q2_K) hasta 32,7 GB (Q8_0), ademas de dos ficheros `mmproj` (0,9 GB y 1,3 GB) que actuan como suplemento multimodal, lo que sugiere capacidad de vision heredada del modelo base.

Es relevante ahora porque los modelos de ~30B cuantizados a 4 bits caben en GPU de consumo con 24 GB de VRAM, lo que acerca capacidades de alineacion por DPO a entornos de investigacion y despliegue con requisitos de privacidad. Conviene senalar que el repositorio no tiene descargas ni valoraciones registradas y que la model card no documenta longitud de contexto, composicion del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` en la model card, sugiere familia Gemma 4) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |
| Tamano del repositorio | 213,9 GB |
| Tipo de cuantizacion | estatica (no se ofrecen cuantizaciones ponderadas/imatrix) |
| Modelo base | UnstableLlama/Love-Aligned-31B |
| Libreria declarada | transformers, gguf |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (numero de capas, dimension oculta, mecanismo de atencion ni tipo de positional encoding). Las etiquetas de la model card (`gemma4`, `lora`, `dpo`, `alignment`, `conversational`) permiten reconstruir el proceso: se parte de una base de la familia Gemma 4, se aplica un ajuste fino con LoRA sobre el modelo UnstableLlama/Love-Aligned-31B y despues una etapa de alineacion con DPO, que optimiza el modelo para preferir respuestas con un tono afectivo y relacional concreto.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas ni los hiperparametros de la etapa DPO. La presencia de los ficheros `mmproj` (proyector multimodal en Q8_0 y f16) indica que el modelo base incorpora una torre de vision y que estas cuantizaciones estan preparadas para conservar esa capacidad, aunque la model card no documenta que tareas multimodales se entrenaron ni con que datos. Las cuantizaciones son estaticas: el autor indica explicitamente que no hay versiones ponderadas/imatrix y que no las tiene planificadas, por lo que la calidad relativa frente a cuantizaciones ponderadas de referencia no esta medida.

## Capacidades

- Generacion de texto conversacional en ingles con tono empatico y relacional, fruto del ajuste DPO.
- Conversaciones multi-turno de caracter afectivo o de acompanamiento emocional.
- Redaccion creativa y generacion de texto libre en ingles.
- Capacidad multimodal probable: el repositorio incluye ficheros `mmproj` Q8_0 y f16 que actuan como suplemento multimodal, lo que apunta a soporte de entrada de imagenes heredado del modelo base. No esta confirmado en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles (`language: en`); no se declara soporte de otros idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no documentadas; el ajuste esta orientado a conversacion, no a tareas tecnicas.

## Casos de uso

- Asistente conversacional de acompanamiento emocional en ingles: el ajuste DPO sobre preferencias orientadas a la afectividad hace que el modelo mantenga un tono empatico y consistente en dialogos multi-turno, adecuado para aplicaciones de bienestar digital que operen exclusivamente en ingles.
- Chatbot de consejo relacional: el modelo puede gestionar conversaciones sobre relaciones personales con respuestas matizadas, aprovechando que la alineacion se ha optimizado especificamente para ese dominio.
- Generacion de contenido creativo y narrativa en ingles: util para redactar ficcion, guiones o material editorial con carga emocional, ejecutandose en local con la cuantizacion Q8_0 (32,7 GB) cuando se prioriza la calidad.
- Personajes virtuales y roleplay conversacional: las cuantizaciones Q4_K_S y Q4_K_M (17,9 GB y 18,8 GB) permiten mantener personajes con memoria de conversacion en una unica GPU de 24 GB, con latencias compatibles con uso interactivo.
- Investigacion sobre alineacion con DPO: sirve como caso de estudio reproducible de una etapa DPO aplicada sobre un modelo de ~31B, util para comparar el efecto del ajuste por preferencias en el tono de las respuestas frente al modelo base sin alinear.
- Despliegue local con requisitos de privacidad: al ser un GGUF ejecutable en llama.cpp u Ollama sin conexion, permite procesar conversaciones sensibles en infraestructura propia, sin enviar datos a APIs externas.
- Prototipado multimodal en local: si el modelo base conserva la torre de vision, la combinacion del GGUF principal con el fichero `mmproj-f16` (1,3 GB) permitiria probar entrada de imagenes en llama.cpp para tareas de descripcion o dialogo sobre imagenes en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio unicamente incluye un grafico externo comparativo de perplejidad entre tipos de cuantizacion de baja calidad (enlace a `nethype.de`), sin cifras concretas asociadas a este modelo. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de alineacion o seguridad.

## Requisitos de hardware

Estimaciones de VRAM a partir del tamano de cada fichero GGUF, anadiendo margen para cache KV, buffers y overhead del runtime (no son cifras publicadas por el autor):

| Cuantizacion | Tamano del fichero | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 12,0 GB | ~14-15 GB |
| Q3_K_S | 13,9 GB | ~16-17 GB |
| Q3_K_M | 15,4 GB | ~17-18 GB |
| Q3_K_L | 16,7 GB | ~18-19 GB |
| IQ4_XS | 17,0 GB | ~19-20 GB |
| Q4_K_S | 17,9 GB | ~20-21 GB |
| Q4_K_M | 18,8 GB | ~21-22 GB |
| Q5_K_S | 21,4 GB | ~24-25 GB |
| Q5_K_M | 21,9 GB | ~24-26 GB |
| Q6_K | 25,3 GB | ~28-30 GB |
| Q8_0 | 32,7 GB | ~36-38 GB |
| mmproj-f16 | 1,3 GB | adicional si se usa vision |
| mmproj-Q8_0 | 0,9 GB | adicional si se usa vision |

- Cabe en GPU de consumo: Q4_K_S y Q4_K_M en RTX 4090 o RTX 3090 (24 GB); Q3_K_M o IQ4_XS en tarjetas de 16 GB con offload parcial de capas a CPU; Q4_K_M y Q5_K_M en equipos Apple Silicon con 32 GB de memoria unificada.
- No cabe en GPU de consumo: Q6_K y Q8_0 requieren A100 40 GB, A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server, llama-cpp-python), Ollama, LM Studio, koboldcpp, text-generation-webui, Jan. vLLM y TGI no ofrecen soporte completo y nativo de pesos GGUF, por lo que no son la via recomendada para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Nota de memoria: la ventana de contexto no esta documentada, por lo que el consumo de cache KV no puede acotarse y las cifras de VRAM deben considerarse como minimos con contexto corto.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de terceros en la informacion proporcionada (parametros, contexto, benchmarks o licencia de alternativas de ~30B). La comparacion se limita, por tanto, a las variantes del propio repositorio:

| Variante | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Love-Aligned-31B (modelo base, safetensors) | 30,7B | no disponible | apache-2.0 | safetensors | no disponible |
| Love-Aligned-31B-GGUF Q8_0 | 30,7B | no disponible | apache-2.0 | GGUF | no disponible |
| Love-Aligned-31B-GGUF Q4_K_M | 30,7B | no disponible | apache-2.0 | GGUF | no disponible |
| Love-Aligned-31B-GGUF Q2_K | 30,7B | no disponible | apache-2.0 | GGUF | no disponible |
| Alternativas de ~30B de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor clasifica Q4_K_S y Q4_K_M como "rapidas y recomendadas", Q6_K como "muy buena calidad", Q8_0 como "rapida, mejor calidad" y Q3_K_M como "calidad inferior". Estas etiquetas son valoraciones cualitativas del cuantizador, no resultados medidos.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (`language: en`). No hay evidencia de capacidades en castellano ni en otros idiomas.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que impide dimensionar correctamente la cache KV y estimar el comportamiento en conversaciones largas.
- Ausencia de benchmarks: no hay ninguna metrica publicada (MMLU, HumanEval, GSM8K ni evaluaciones de alineacion), por lo que no es posible verificar la calidad frente al modelo base ni frente a alternativas.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 valoraciones en el momento de la consulta, lo que implica ausencia de verificacion independiente sobre la fidelidad de las cuantizaciones.
- Sesgo de alineacion afectiva: un ajuste DPO orientado a un tono afectivo concreto puede incrementar la complacencia y la sicofantia, degradando el rendimiento en tareas tecnicas, de razonamiento estricto o de recuperacion de hechos.
- Riesgo de alucinacion: no hay datos de evaluacion de veracidad; en dominios factuales el modelo puede generar afirmaciones incorrectas con seguridad.
- Ambito sensible: los casos de uso de apoyo emocional o consejo relacional no deben presentarse como sustituto de atencion psicologica o profesional.
- Licencia: el repositorio declara apache-2.0, que permite uso comercial, pero la model card no aclara la licencia del modelo base UnstableLlama/Love-Aligned-31B ni las condiciones de los datos de ajuste. Conviene verificar la cadena de licencias antes de un despliegue en produccion.
- Cuantizaciones estaticas: no existen versiones ponderadas/imatrix, y el propio autor senala que no estan planificadas. Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) implican perdida de calidad significativa para un modelo de este tamano.
- Soporte multimodal no confirmado: los ficheros `mmproj` sugieren capacidad de vision, pero la model card no documenta tareas, datos ni calidad de esa capacidad.
- Sin soporte en vLLM/TGI: al tratarse de GGUF, los stacks de servido de alto rendimiento habituales en produccion no son aplicables directamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Love-Aligned-31B-GGUF
- Modelo base: https://huggingface.co/UnstableLlama/Love-Aligned-31B
- Pagina resumen de descargas del cuantizador: https://hf.tst.eu/model#Love-Aligned-31B-GGUF
- Peticiones de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
- Ficheros directos: https://huggingface.co/mradermacher/Love-Aligned-31B-GGUF/resolve/main/Love-Aligned-31B.Q4_K_M.gguf y https://huggingface.co/mradermacher/Love-Aligned-31B-GGUF/resolve/main/Love-Aligned-31B.mmproj-f16.gguf

Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido de un foro hungaro sobre relaciones personales y modelismo). No se ha encontrado documentacion adicional, paper ni blog tecnico sobre Love-Aligned-31B en la informacion proporcionada.
