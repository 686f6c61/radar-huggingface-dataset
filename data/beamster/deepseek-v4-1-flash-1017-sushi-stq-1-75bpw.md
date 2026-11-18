# beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw

## Resumen

DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw es un empaquetado cuantizado del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, publicado por el usuario beamster y optimizado especificamente para sushi, un motor de inferencia nativo para Apple Silicon derivado de mlx-serve. No es un modelo nuevo: es una distribucion de pesos comprimidos con un esquema propietario llamado STQ (Sushi Trellis Quant) que combina codewords bidimensionales PAIR1 para los expertos enrutados y un codebook SPEC1 para el tronco y el lm_head. El objetivo es hacer viable en un Mac el despliegue de un modelo MoE de 261.320.630.994 parametros totales con vision y contexto de hasta 1.048.576 tokens.

La relevancia de este empaquetado reside en su agresividad de compresion: 1,75 bits por peso de media en los expertos, 4 bits en el tronco, 6 bits en el lm_head y 4 bits afines en los embeddings, con un peso en disco de aproximadamente 309 GiB (120 GiB de pesos y 189 GiB de tablas Engram que se leen desde SSD y nunca se cargan en memoria de GPU). La revision 2.0 del pack reduce la divergencia KL frente al checkpoint original en las ocho categorias evaluadas respecto a la revision 1.0 y frente al pack oQ2.5e de oMLX, que emplea 2,96 bits por peso.

El modelo base es un transformer MoE multimodal (image-text-to-text) con decodificacion especulativa integrada en tres etapas denominadas DSpark, torre de vision en bf16 y tablas Engram en FP8 E4M3 con escalas E8M0. La licencia MIT del modelo base se hereda en este derivado. El pack solo funciona con sushi v1.5.0 o superior sobre macOS 26.2 o posterior en Apple Silicon; versiones anteriores lo rechazan por nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (deepseek_v41) con decodificacion especulativa DSpark y tablas Engram |
| Parametros totales | 261.320.630.994 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens |
| Tipos de cuantizacion | STQ PAIR1 a 2 bits (expertos de etapa DSpark), STQ PAIR1 a 1,75 bits de media (expertos enrutados), STQ SPEC1 a 4 bits (tronco y expertos de etapa), STQ SPEC1 a 6 bits (lm_head), afina a 4 bits (embeddings), FP8 E4M3 con escalas E8M0 (tablas Engram), bf16 (torre de vision) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pack propietario para sushi) |
| Tamano del repositorio | 461,1 GB |
| Peso en disco tras el pull | ~309 GiB (120 GiB de pesos + 189 GiB de tablas Engram) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Motor de inferencia | sushi v1.5.0 o superior, macOS 26.2 o superior, Apple Silicon |
| Descargas | 4226 |
| Likes | 24 |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer con mezcla de expertos (MoE) de tipo multimodal image-text-to-text. La distribucion concreta de expertos en este pack revela 40 capas con 384 expertos enrutados cada una, lo que da 15.360 expertos enrutados en total. Incorpora ademas tres etapas de decodificacion especulativa bajo la denominacion DSpark, una torre de vision en bf16 para entrada de imagen y unas tablas Engram almacenadas en FP8 E4M3 con escalas E8M0 que se leen desde el SSD bajo demanda y no se cargan en memoria de GPU. El contexto maximo anunciado es de 1.048.576 tokens.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base, ya que la model card de este derivado no los detalla. La innovacion tecnica de este empaquetado es el esquema STQ: los expertos enrutados se almacenan con codewords bidimensionales PAIR1 en orden de tile pair-major, que es exactamente el orden en que sushi los lee desde el SSD hacia su cache de expertos, evitando reordenamientos en tiempo de ejecucion. El tronco y el lm_head usan el codebook SPEC1 a 4 y 6 bits respectivamente. La revision 2.0 del pack mejora la fidelidad respecto a la 1.0 en todas las categorias de KLD evaluadas.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline declarado es image-text-to-text y la torre de vision en bf16 esta incluida en el pack.
- Procesamiento de contexto largo: ventana de hasta 1.048.576 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Tool calling y function calling: medido con tool-eval-bench 3.0.0 en modo hard (seed 42, sin herramientas en vivo) sobre la revision 1.0 servida por sushi 1.4.0 con valores por defecto (thinking en high, DSpark activo) y `--ssd-budget-gb 108`, con resultado de 92 sobre 100 y 178 de 194 puntos en 97 escenarios.
- Razonamiento multi-paso: el modo thinking en nivel high esta activo por defecto en la configuracion de referencia del motor.
- Decodificacion especulativa: las tres etapas DSpark se incluyen en el pack con expertos a 2 bits y tronco a 4 bits.
- Capacidades multilingues: la evaluacion KLD incluye una categoria multilingual, pero no se especifica la lista de idiomas soportados.
- Generacion de codigo, matematicas, diseno, ciencia y narracion: todas ellas aparecen como categorias evaluadas en la tabla de KLD del autor.

## Casos de uso

- Asistente de codigo local en Mac: el pack permite ejecutar un MoE de 261.000 millones de parametros en Apple Silicon con 1,75 bits por peso en los expertos, lo que posibilita autocompletado, refactorizacion y explicacion de codigo sin salir del equipo. La categoria code obtiene el KLD mas bajo de la tabla (0,0284), lo que indica que la cuantizacion degrada muy poco el comportamiento en programacion.
- Analisis de documentos largos: con 1.048.576 tokens de contexto, el modelo puede ingerir libros tecnicos, expedientes o bases de codigo completas en una sola pasada. Las tablas Engram leidas desde SSD evitan que ese contexto adicional consuma memoria de GPU de forma proporcional.
- Agentes con tool calling en produccion: la puntuacion de 92 sobre 100 en tool-eval-bench 3.0.0 en modo hard respalda su uso como planificador de agentes que invocan APIs, ejecutan comandos o consultan bases de datos en escenarios de 97 casos distintos.
- Razonamiento matematico asistido: la categoria math obtiene un KLD de 0,0480, lo que sugiere que la cuantizacion preserva bien la capacidad de resolver problemas numericos. Util para tutoria, verificacion de calculos y generacion de demostraciones paso a paso con el modo thinking activo.
- Procesamiento multimodal de capturas y diagramas: la torre de vision en bf16 incluida permite describir interfaces, extraer texto de imagenes o interpretar diagramas de arquitectura dentro de un flujo de documentacion tecnica.
- Despliegue offline en estaciones de trabajo Apple: al no requerir GPU dedicada y leer las tablas Engram desde el SSD, el pack encaja en entornos con requisitos de confidencialidad donde no se permite enviar datos a la nube, como analisis de contratos o revision de codigo propietario.
- Generacion de documentacion y narrativa tecnica: la categoria story presenta el KLD mas alto (0,4052 en la revision 2.0), por lo que es la menos fiel al original; aun asi, sigue siendo util para borradores de documentacion, resumenes y textos explicativos donde no se exige precision literal.

## Benchmarks y rendimiento

Divergencia KL (KLD) contra el checkpoint original, medida por sushi sin pasos con perdida propios (tronco FP8 y expertos FP4 expandidos, KV a ancho completo, DSpark desactivado), sobre ocho categorias, 2 prompts de 512 tokens cada uno, puntuado hasta el primer EOS. Menor es mejor.

| Pack | KLD | Acuerdo top-1 | Disco |
|---|---|---|---|
| Sushi-STQ-1.75bpw, revision 2.0 | 0,1576 | 89,13% | 332,1 GB |
| Sushi-STQ-1.75bpw, revision 1.0 | 0,1843 | 88,53% | 332,1 GB |
| oQ2.5e (oMLX, 2,96 bits por peso) | 0,1717 | 89,17% | 342,7 GB |

Desglose de KLD por categoria:

| Pack | code | math | reasoning | design | wikitext | multilingual | story | science |
|---|---|---|---|---|---|---|---|---|
| Sushi-STQ-1.75bpw 2.0 | 0,0284 | 0,0480 | 0,0897 | 0,1468 | 0,2545 | 0,2349 | 0,4052 | 0,0786 |
| Sushi-STQ-1.75bpw 1.0 | 0,0357 | 0,0598 | 0,1176 | 0,1593 | 0,2714 | 0,2733 | 0,4878 | 0,0985 |
| oQ2.5e | 0,0298 | 0,0677 | 0,0831 | 0,1474 | 0,3014 | 0,2868 | 0,4152 | 0,0805 |

Tool calling: tool-eval-bench 3.0.0 en modo hard (seed 42, sin herramientas en vivo), servido por sushi 1.4.0 con valores por defecto (thinking en high, DSpark activo) y `--ssd-budget-gb 108`, sobre la revision 1.0: 92 sobre 100 y 178 de 194 puntos en 97 escenarios.

No se han publicado resultados de benchmarks de conocimiento general (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 26.2 o superior y sushi v1.5.0 o posterior. Las versiones anteriores de sushi rechazan este pack por nombre.
- Almacenamiento: aproximadamente 309 GiB tras el pull (120 GiB de pesos y 189 GiB de tablas Engram), sobre un repositorio de 461,1 GB. Se recomienda SSD interno por el streaming de expertos y tablas Engram.
- Memoria: el pack esta disenado para que las tablas Engram (189 GiB) se lean desde el SSD y nunca se carguen en memoria de GPU; la memoria unificada debe dimensionarse segun el presupuesto de SSD configurado, con `--ssd-budget-gb 108` como valor de referencia usado en la medicion de tool calling.
- GPU dedicadas: no aplica. El pack es exclusivo de Apple Silicon; no esta pensado para A100, H100 ni RTX 4090.
- Opciones de despliegue: unicamente sushi v1.5.0 o superior. No es compatible con vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario STQ y el orden de tile pair-major.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa DSpark esta incluida y activa por defecto en la configuracion de referencia, lo que cabe esperar que reduzca la latencia frente a generacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD (ref.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sushi-STQ-1.75bpw 2.0 (este pack) | 261.320.630.994 totales | 1.048.576 | 0,1576 | MIT | Hugging Face, solo sushi en Apple Silicon |
| Sushi-STQ-1.75bpw 1.0 | 261.320.630.994 totales | 1.048.576 | 0,1843 | MIT | Hugging Face, solo sushi en Apple Silicon |
| oQ2.5e (oMLX) | no disponible | no disponible | 0,1717 | no disponible | Hugging Face, via mlx-serve |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | referencia | MIT | Hugging Face |

La comparacion se limita a los packs derivados del mismo modelo base, ya que no se dispone de datos de benchmarks de conocimiento general que permitan contrastarlo con modelos de otras familias y tamanos.

## Limitaciones y advertencias

- Dependencia total del motor: el pack solo funciona con sushi v1.5.0 o superior en macOS 26.2 o posterior sobre Apple Silicon. No es portable a otras plataformas ni a otros motores de inferencia.
- Huella de disco elevada: aproximadamente 309 GiB tras el pull y 461,1 GB de repositorio. Requiere SSD con espacio libre suficiente y el streaming desde disco condiciona el rendimiento.
- Divergencia respecto al original: el KLD global de 0,1576 y el acuerdo top-1 del 89,13% implican que aproximadamente uno de cada diez tokens predichos no coincide con el modelo de referencia. En categorias como story (KLD 0,4052) la degradacion es notablemente mayor que en code (0,0284).
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion en la informacion disponible; al tratarse de una cuantizacion agresiva a 1,75 bits en los expertos, cabe esperar un aumento del riesgo respecto al checkpoint original.
- Idiomas: la lista de idiomas soportados no esta disponible. La evaluacion incluye una categoria multilingual con KLD de 0,2349, pero no se detalla que lenguas cubre ni con que calidad.
- Sesgos: no se documentan sesgos conocidos en la model card del pack ni en la informacion proporcionada.
- Tool calling medido sobre la revision 1.0: el resultado de 92 sobre 100 corresponde a la revision 1.0 servida con sushi 1.4.0, no a la revision 2.0 con sushi 1.5.0. No hay medicion publicada de tool calling para la revision actual.
- Licencia: MIT, heredada del modelo base DeepSeek-V4.1-Flash-1017. Permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio para confirmar los terminos exactos de la obra derivada.
- Compatibilidad de revisiones: si se necesita una version anterior de sushi, hay que fijar la revision `v1.0` del pack explicitamente con `--revision v1.0`.

## Enlaces

- Repositorio del pack: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor sushi: https://github.com/beamivalice/sushi
- Documentacion de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto del que deriva sushi): https://github.com/ddalcu/mlx-serve
