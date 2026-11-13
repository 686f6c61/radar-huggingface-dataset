# fraQtl/Qwen3.5-4B-Hi-Fi-GGUF

## Resumen

Qwen3.5-4B-Hi-Fi-GGUF es una cuantizacion de 4 bits del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario fraQtl bajo licencia Apache 2.0. No se trata de un modelo nuevo, sino de una reconstruccion del fichero GGUF Q4_K en la que se aplica redondeo GPTQ ponderado por Hessiano dentro de los propios bloques K de llama.cpp, junto con una reasignacion de bits que eleva ocho tensores criticos a Q5_K sin superar el presupuesto de bytes de un Q4_K_M convencional. El resultado es un unico fichero de 2.732.070.048 bytes (2,73 GB) que, segun las mediciones del autor, queda mas cerca del modelo original en bf16 que las alternativas de referencia.

El modelo base es un transformer denso de 4.205.751.296 parametros (aproximadamente 4,2 mil millones), orientado a generacion de texto, con soporte declarado de instrucciones y tool calling. La relevancia de esta publicacion es practica: demuestra que es posible mejorar la fidelidad de una cuantizacion de 4 bits sin cambiar de formato ni de runtime, manteniendo compatibilidad total con llama.cpp estandar. Esto interesa a quien despliega modelos pequenos en dispositivos de consumo o en el borde y necesita maximizar la calidad por byte almacenado.

La ficha se centra en el artefacto cuantizado y en sus cifras de fidelidad declaradas. Los detalles de arquitectura interna y de entrenamiento del modelo base (Qwen3.5-4B) no se incluyen en la informacion proporcionada y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-4B); fichero GGUF cuantizado con bloques K de llama.cpp |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K con 8 tensores elevados a Q5_K; redondeo GPTQ ponderado por Hessiano; importancia (imatrix) propia |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `Qwen3.5-4B-fraQtl-Hi-Fi-Q4_K.gguf`, 2.732.070.048 bytes, sha256 b93c37b104a8e548187f36d39cde88116df28cc7588036c7975418ad8dca16b5) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion, no un modelo entrenado desde cero. El autor parte de Qwen3.5-4B en bf16 y aplica dos tecnicas sobre el formato GGUF de llama.cpp. Primero, redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022) escrito directamente dentro de los bloques Q4_K, Q5_K y Q6_K del formato, reutilizando las escalas y minimos de bloque que genera `llama-quantize`, con estadisticas e importance matrix derivadas de un corpus de calibracion propio. Segundo, una asignacion de bits basada en medir el coste de compresion de cada tensor: los ocho tensores mas costosos se promueven a Q5_K manteniendose dentro del presupuesto de bytes de un Q4_K_M.

Segun la tabla de ablacion de la model card, el redondeo GPTQ sobre todos los tensores K aporta una reduccion de divergencia KL del 20,7 % en tareas y del 13,5 % en texto general frente a Q4_K_M; la promocion de los ocho tensores a Q5_K anade hasta el 22,7 % y el 17,3 % respectivamente. El corpus de calibracion, la importance matrix y la tabla de coste por tensor no estan publicados. No hay informacion sobre el entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional (tag `conversational`) y seguimiento de instrucciones, segun la evaluacion IFEval reportada por el autor.
- Tool calling y function calling: el autor agrupa "instruction following + tool calling" como metrica de tarea y declara que la cuantizacion preserva esta capacidad mejor que Q4_K_M.
- Razonamiento y conocimiento general: evaluado mediante divergencia KL sobre texto general y con GSM8K como proxy de razonamiento matematico.
- Ejecucion en llama.cpp estandar (probado con build b12079), sin runtime personalizado.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Orientado a despliegue on-device (tag `on-device`).
- Capacidades multimodales, de audio o de modo thinking explicito: no disponibles en la informacion proporcionada. La model card indica que las pruebas se hicieron con "thinking off" y describe el artefacto como "Text model".

## Casos de uso

- Asistente conversacional local en portatil o mini-PC: con 2,73 GB de fichero, el modelo cabe en RAM o VRAM de equipos modestos y permite conversaciones multi-turno sin conexion, manteniendo mayor fidelidad al modelo original que un Q4_K_M al mismo tamano.
- Tool calling en agentes ligeros: al preservar mejor el comportamiento de instrucciones y llamadas a funciones (reduccion de KL del 22,7 % en la metrica de tarea), es adecuado para orquestadores que ejecutan acciones estructuradas en entornos con recursos limitados.
- Despliegue en el borde con llama.cpp: el fichero funciona en el runtime estandar, lo que simplifica la integracion en dispositivos empotrados, Raspberry Pi de gama alta o moviles con suficiente memoria.
- Prototipado rapido de pipelines de generacion de texto: al ser un unico GGUF de 2,7 GB, se puede versionar y distribuir facilmente en entornos de desarrollo y CI, con `llama-cli -hf` como arranque inmediato.
- Evaluacion comparativa de cuantizaciones: sirve como referencia de hasta donde se puede acercar un Q4_K al bf16 original, util para equipos que investigan tecnicas de cuantizacion o que calibran sus propios artefactos.
- Procesamiento de texto por lotes en CPU: al no requerir GPU dedicada, encaja en tareas de resumen, clasificacion o extraccion sobre volumenes moderados de documentos donde el coste por token importa mas que la latencia.
- Despliegue en NPU de Snapdragon: el autor remite a una variante especifica (`fraQtl/Qwen3.5-4B-NPU-GGUF`) para este escenario, por lo que este fichero sirve como base de referencia.

## Benchmarks y rendimiento

Datos declarados por el autor. La divergencia KL se mide sobre 144 ventanas de texto reservadas, con intervalos del 95 % por bootstrap pareado (2.000 remuestreos). Menor KL indica mayor cercania al modelo bf16 original.

| Fichero | Bytes | KL tarea | KL general |
|---|---|---|---|
| fraQtl Hi-Fi Q4_K (este repo) | 2.732.070.048 | 0,01817 | 0,01217 |
| Q4_K_M, `unsloth/Qwen3.5-4B-GGUF` | 2.740.937.888 | 0,02351 | 0,01472 |
| Q4_K_S, mismo repo | 2.590.430.368 | 0,02842 | 0,01729 |
| IQ4_NL, mismo repo | 2.579.944.608 | 0,03276 | 0,01908 |

Frente al Q4_K_M de referencia: tarea -22,7 % [-28,2; -16,0], general -17,3 % [-27,2; -8,4].

Respuestas sobre 500 preguntas fijas, decodificacion greedy, thinking off, llama.cpp b12079:

| Fichero | GSM8K /250 | IFEval /250 |
|---|---|---|
| Q4_K_M, `unsloth/Qwen3.5-4B-GGUF` | 227 | 194 |
| fraQtl Hi-Fi Q4_K (este repo) | 226 | 193 |

El autor senala que las diferencias no son significativas (p = 1,00) y que el modelo bf16 original no se ejecuto sobre este conjunto de preguntas.

Ablacion de las dos tecnicas frente a Q4_K_M:

| Paso | Tarea | General |
|---|---|---|
| Redondeo GPTQ en todos los tensores K | -20,7 % | -13,5 % |
| + 8 tensores elevados a Q5_K | -22,7 % | -17,3 % |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,8-3,2 GB para el fichero mas la cache KV y el overhead del runtime; con contexto largo la cache KV puede anadir varios cientos de MB o mas, dependiendo de la longitud de contexto del modelo base (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM libre; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores permiten margen amplio para contexto largo. En el segmento profesional, A100, H100 y L40S son sobredimensionadas para este tamano pero validas para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650 4 GB en adelante), y tambien en CPU con 4 GB de RAM libre.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, herramientas que lo consumen como Ollama o LM Studio. vLLM y TGI no son la via natural para este artefacto, ya que estan orientados a safetensors y no a GGUF.
- Latencia y throughput: no disponibles de forma medida. El autor solo reporta que 11 preguntas de GSM8K alcanzaron el limite de 768 tokens de respuesta frente a 6 en Q4_K_M, lo que sugiere respuestas mas largas con la misma puntuacion, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fraQtl Hi-Fi Q4_K (este repo) | 4,2 B | No disponible | GGUF Q4_K/Q5_K | Apache 2.0 | KL tarea 0,01817; KL general 0,01217; 2,73 GB |
| Q4_K_M de `unsloth/Qwen3.5-4B-GGUF` | 4,2 B | No disponible | GGUF Q4_K_M | Apache 2.0 | KL tarea 0,02351; KL general 0,01472; 2,74 GB |
| Q4_K_S de `unsloth/Qwen3.5-4B-GGUF` | 4,2 B | No disponible | GGUF Q4_K_S | Apache 2.0 | KL tarea 0,02842; KL general 0,01729; 2,59 GB |
| IQ4_NL de `unsloth/Qwen3.5-4B-GGUF` | 4,2 B | No disponible | GGUF IQ4_NL | Apache 2.0 | KL tarea 0,03276; KL general 0,01908; 2,58 GB |

Las tres alternativas comparadas son cuantizaciones del mismo modelo base y proceden del mismo repositorio de referencia. No se dispone de datos para comparar con cuantizaciones de otros autores ni con modelos de otros desarrolladores de tamano similar.

## Limitaciones y advertencias

- Las cifras de fidelidad (KL) proceden de una unica compilacion y de 144 ventanas de texto; el propio autor advierte que KL mide cercania al modelo original, no precision en tareas.
- En GSM8K el fichero alcanzo el limite de 768 tokens en 11 preguntas frente a 6 del Q4_K_M, lo que implica respuestas mas largas y mayor coste de generacion en esos casos, sin mejora de puntuacion.
- La comparacion se limita a los ficheros de `unsloth/Qwen3.5-4B-GGUF`; otras cuantizaciones de la comunidad no fueron medidas.
- El corpus de calibracion, la importance matrix y la tabla de coste por tensor no estan publicados, lo que impide reproducir el proceso de construccion.
- Es un modelo de texto; no se declaran capacidades multimodales ni de audio.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base en la documentacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B, ya que esta ficha no incluye su licencia original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de las cifras declaradas.
- El despliegue en NPU de Snapdragon requiere un artefacto distinto (`fraQtl/Qwen3.5-4B-NPU-GGUF`); este fichero no esta pensado para ese hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Qwen3.5-4B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantizaciones de referencia: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Variante para NPU de Snapdragon: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Perfil del autor: https://huggingface.co/fraQtl
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia del redondeo GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
