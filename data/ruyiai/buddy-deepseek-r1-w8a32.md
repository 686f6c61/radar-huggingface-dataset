# RuyiAI/buddy-deepseek-r1-w8a32

## Resumen

RuyiAI/buddy-deepseek-r1-w8a32 es un paquete de pesos cuantizados y compilados de forma cruzada para RISC-V de 64 bits (riscv64), empaquetado en el formato `.rax` que consume el runtime `buddy-cli` del proyecto buddy-mlir. No se trata de un modelo entrenado desde cero: el modelo de partida es deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, un transformer denso decoder-only de 1.500 millones de parametros, destilado del DeepSeek-R1 original y especializado en razonamiento paso a paso, matematicas y codigo. La nomenclatura `w8a32` del repositorio indica pesos de 8 bits y activaciones de 32 bits.

El interes de esta publicacion es de infraestructura mas que de modelado. Buddy-mlir es un framework de compilacion basado en MLIR que tiende un puente entre lenguajes de dominio especifico y arquitecturas especificas de dominio; este repositorio demuestra que un modelo de razonamiento de 1,5B puede ejecutarse en hardware RISC-V generico con extension vectorial (cualquier VLEN, sin los extensiones de coma flotante de media precision Zfh/Zvfh), sin GPU ni aceleradores propietarios. El paquete va fijado a la version `60f354a` del compilador.

El repositorio ocupa 2,8 GB, se publico el 16 de octubre de 2026 y no declara licencia, idiomas ni pipeline. En el momento de redactar esta ficha acumula 0 descargas y 0 "likes", por lo que carece de validacion por parte de la comunidad. Existe un paquete hermano con cuantizacion `w8a8` publicado por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen2 del modelo upstream); distribuido como binario compilado `.rax` para RISC-V |
| Parametros totales | 1.500 millones (modelo upstream DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; se hereda del modelo upstream |
| Tipos de cuantizacion | w8a32 (pesos de 8 bits, activaciones de 32 bits) segun la nomenclatura del repositorio; existe un paquete hermano w8a8 |
| Idiomas soportados | no disponible en este repositorio; el modelo upstream esta orientado principalmente a ingles y chino |
| Licencia | no disponible |
| Formato de pesos | `.rax` (paquete compilado para el runtime `buddy-cli`); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente, DeepSeek-R1-Distill-Qwen-1.5B, se obtuvo por ajuste supervisado (SFT) sobre el modelo base Qwen2.5-Math-1.5B usando aproximadamente 800.000 muestras de razonamiento generadas por DeepSeek-R1, tal y como documenta el repositorio oficial de DeepSeek-R1. A diferencia del modelo completo, los destilados no pasan por una fase de RL: la capacidad de razonamiento se transfiere por imitacion de las trazas del profesor. El resultado es un modelo denso de 1,5B que produce cadenas de pensamiento largas antes de la respuesta final y que rinde de forma desproporcionada en matematicas y codigo para su tamano.

La aportacion de este repositorio es la cadena de compilacion. buddy-mlir compila el grafo del modelo y lo empaqueta en un artefacto `.rax` que ejecuta `buddy-cli`; el objetivo declarado es `generic riscv64`, con extension vectorial de cualquier VLEN pero sin soporte de las extensiones Zfh ni Zvfh (media precision). Esa restriccion de hardware es coherente con el esquema de cuantizacion w8a32, que mantiene las activaciones en 32 bits en lugar de reducir la precision de la aritmetica vectorial. El repositorio no publica detalles sobre el proceso de calibracion de la cuantizacion, el numero de tokens de evaluacion ni la perdida de precision respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento paso a paso: el modelo upstream produce cadenas de pensamiento explicitas antes de responder, habilidad heredada del destilado del que procede.
- Razonamiento matematico: resolucion de problemas tipo competicion (AIME, MATH-500) a un nivel notable para 1,5B de parametros.
- Generacion y comprension de codigo: escritura de funciones, explicacion de fragmentos y resolucion de problemas algorítmicos sencillos.
- Capacidades multilingues: no declaradas en este repositorio; el modelo de partida esta centrado en ingles y chino.
- Tool calling y function calling: no documentado en este repositorio ni en la informacion disponible.
- Agentes y razonamiento multi-paso orquestado: no documentado.
- Vision, audio u otras modalidades: no, el modelo upstream es exclusivamente de texto.
- Inferencia en CPU RISC-V: capacidad especifica de este paquete, ejecutable mediante `buddy-cli` sobre hardware riscv64 con extensiones vectoriales.

## Casos de uso

- Inferencia en placas RISC-V de placa unica: despliegue de un asistente de razonamiento local en tarjetas tipo VisionFive, Milk-V o SiFive con RVV, sin GPU ni dependencias de CUDA, usando el paquete `.rax` directamente con `buddy-cli`.
- Sistemas empotrados sin conectividad: escenarios industriales, agricolas o de teledeteccion donde no hay red y se necesita razonamiento local sobre texto; el peso de 8 bits reduce el consumo de memoria y ancho de banda respecto a una ejecucion en fp32.
- Investigacion en compiladores y runtimes de IA: banco de pruebas realista para medir el rendimiento de buddy-mlir y de MLIR sobre LLM densos en RISC-V, comparando variantes w8a32 y w8a8.
- Formacion y docencia en arquitecturas abiertas: permite ilustrar de extremo a extremo el flujo modelo -> grafo -> compilacion -> ejecucion en una ISA abierta, con un caso de uso tangible (asistente de matematicas).
- Verificacion de cadenas de herramientas RISC-V: uso como carga de trabajo de referencia para validar toolchains, kernels y entornos de ejecucion antes de mover cargas mayores.
- Asistente de codigo en maquinas de bajos recursos: autocompletado y explicacion de fragmentos en entornos de desarrollo sobre hardware RISC-V, donde un modelo de 1,5B con 8 bits de peso es viable.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse integramente en local, permite tratar documentacion sensible sin enviar datos a servicios externos.
- Robotica y automocion basada en RISC-V: generacion de instrucciones en lenguaje natural y razonamiento de alto nivel en plataformas donde ya se usa RISC-V como arquitectura de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de este paquete en la informacion disponible. La tabla siguiente recoge las cifras que DeepSeek publica para el modelo upstream y para otros destilados de la misma familia, y se incluye unicamente como referencia orientativa: no reflejan el comportamiento del paquete cuantizado a w8a32 ni su rendimiento en RISC-V.

| Modelo | AIME 2024 (pass@1) | MATH-500 (pass@1) | GPQA Diamond (pass@1) | LiveCodeBench (pass@1) | CodeForces (rating) |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 28,9 | 83,9 | 33,3 | 16,9 | 954 |
| DeepSeek-R1-Distill-Qwen-7B | 55,5 | 92,8 | 49,1 | 37,6 | 1189 |
| DeepSeek-R1-Distill-Llama-8B | 50,4 | 89,1 | 49,0 | 39,6 | 1205 |

Fuente de las cifras: documentacion del repositorio deepseek-ai/DeepSeek-R1. No verificadas en la informacion de este repositorio, que no aporta ninguna evaluacion del artefacto `.rax`.

## Requisitos de hardware

- Huella en disco: el repositorio ocupa 2,8 GB; los pesos en 8 bits de un modelo de 1,5B rondan 1,5 GB, con el resto correspondiente al runtime y a metadatos del paquete.
- CPU objetivo: riscv64 generico con extension vectorial (RVV), cualquier VLEN. El paquete declara explicitamente que no requiere Zfh ni Zvfh, por lo que funciona en nucleos sin coma flotante de media precision.
- GPU: este paquete no esta pensado para GPU y no se documenta soporte CUDA ni ROCm. No aplica VRAM para la ejecucion con `buddy-cli`.
- Ejecucion en consumer GPU: no aplica para el artefacto `.rax`. Si se convierte el modelo upstream a safetensors o GGUF, los pesos en fp16 ocupan alrededor de 3,1 GB (mas cache KV) y en cuantizacion de 4 bits alrededor de 1 GB, por lo que cabria en tarjetas de 4-8 GB de VRAM.
- Opciones de despliegue: `buddy-cli` con el fichero `deepseek_r1-w8a32.rax` (unica via documentada). Para el modelo upstream sin compilar existirian vLLM, llama.cpp, Ollama o TGI, pero requieren convertir los pesos, algo que este repositorio no proporciona.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por token en ninguna placa RISC-V concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-w8a32 | 1,5B (w8a32) | no disponible | `.rax` para buddy-cli | no disponible | Despliegue en RISC-V |
| RuyiAI/buddy-deepseek-r1-w8a8 | 1,5B (w8a8) | no disponible | `.rax` para buddy-cli | no disponible | Despliegue en RISC-V con activaciones de 8 bits |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible | safetensors | MIT (segun su model card) | Modelo de referencia para GPU/CPU x86 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible | safetensors | MIT (segun su model card) | Mas capacidad de razonamiento, mas recursos |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (nativo, segun su documentacion) | safetensors, GGUF | Apache 2.0 | Asistente general, sin entrenamiento intensivo en razonamiento |

La comparacion directa entre este paquete y el modelo upstream no es de calidad, sino de portabilidad: el artefacto `.rax` renuncia a la ejecucion en GPU y a los formatos estandar a cambio de funcionar en CPU RISC-V. La comparacion con el destilado de 7B es relevante porque, segun las cifras de DeepSeek, duplicar o cuadruplicar el tamano mejora de forma notable el rendimiento en matematicas y codigo (por ejemplo, 28,9 frente a 55,5 en AIME 2024), lo que marca el techo practico del modelo de 1,5B.

## Limitaciones y advertencias

- Ausencia de licencia declarada: el repositorio no especifica licencia, por lo que el uso comercial del artefacto `.rax` es juridicamente incierto. El modelo upstream figura como MIT en su propia model card, pero eso no cubre automaticamente la redistribucion compilada.
- Sin evaluacion del propio paquete: no hay benchmarks, ni mediciones de latencia, ni comparacion entre la salida del `.rax` y la del modelo original. La cuantizacion w8a32 puede degradar la calidad de forma no cuantificada.
- Riesgo de alucinacion elevado: con 1,5B de parametros, el conocimiento factual es limitado y el modelo tiende a inventar datos cuando se le pregunta por hechos concretos. No es adecuado para tareas que exijan exactitud factual sin verificacion.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni sesgos de idioma. El modelo upstream esta centrado en ingles y chino, por lo que su comportamiento en castellano es probablemente inferior y no esta medido.
- Patrones degenerativos del razonamiento destilado: la familia DeepSeek-R1-Distill es propensa a repeticiones infinitas, mezcla de idiomas y baja legibilidad en la cadena de pensamiento, problemas que el propio equipo de DeepSeek reconocio en R1-Zero y que se mitigan parcialmente en R1 pero no desaparecen en los destilados pequenos.
- Dependencia total de una herramienta: sin `buddy-cli` y sin hardware riscv64 con RVV, el artefacto no es utilizable. No hay conversion documentada a GGUF ni a safetensors.
- Restriccion de plataforma: el objetivo es riscv64 generico sin Zfh/Zvfh; entornos RISC-V sin extension vectorial no estan cubiertos.
- Sin soporte documentado de tool calling, agentes ni plantilla de chat: no hay garantia de formato de prompt ni de integracion con frameworks de orquestacion.
- Madurez nula como dependencia de produccion: repositorio con 0 descargas, creado y actualizado el mismo dia, sin issues ni validacion externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RuyiAI/buddy-deepseek-r1-w8a32
- Paquete hermano con cuantizacion w8a8: https://huggingface.co/RuyiAI/buddy-deepseek-r1-w8a8
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Coleccion DeepSeek-R1 en HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-r1
- Repositorio de buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Especificaciones del modelo dentro de buddy-mlir: https://github.com/buddy-compiler/buddy-mlir/tree/main/models/deepseek_r1/specs
- Script de instalacion de buddy-cli: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
- Vision general tecnica del repositorio DeepSeek-R1 en DeepWiki: https://deepwiki.com/deepseek-ai/DeepSeek-R1
