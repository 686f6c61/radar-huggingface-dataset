# robloxianer/babble

## Resumen

Babble es una familia de cinco modelos GPT minúsculos entrenados desde cero por el usuario robloxianer, con tokenización a nivel de carácter y sin ningún ajuste posterior por instrucciones. El objetivo declarado por el autor no es resolver una tarea productiva, sino servir de juguete experimental: los modelos "divagan" de forma deliberada y el propio autor advierte en la model card que no se debe confiar en la salida. El repositorio principal corresponde al miembro mayor de la familia, Bigish, con 19.472.768 parámetros, 8 capas, dimensión de modelo 448 y una ventana de contexto de 256 caracteres.

La relevancia es puramente práctica para quien trabaja en infraestructura: al ser un transformer decoder-only de escala ínfima con pesos en PyTorch y GGUF, resulta útil como banco de pruebas para pipelines de inferencia, exportación a llama.cpp, pruebas de humo en CI o experimentos didácticos sobre entrenamiento de lenguaje. No compite con modelos instructivos ni con ninguna API comercial.

Los cinco miembros comparten datos de entrenamiento (FineWeb-Edu más conversaciones cotidianas) y se diferencian en tamaño, de 0,11 M a 19,47 M de parámetros, con pérdidas de validación entre 1,699 y 1,167. La licencia Apache-2.0 permite uso comercial, aunque la calidad de generación hace inviable cualquier aplicación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT, tokenizacion a nivel de caracter (char-level), entrenado desde cero |
| Parametros totales | 19.472.768 (miembro Bigish, repositorio principal); familia completa: 0,11 M / 0,82 M / 2,74 M / 10,78 M / 19,47 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 caracteres en Bigish y Medium, 256 en Small, 128 en Tiny, 64 en Micro |
| Tipos de cuantizacion | GGUF incluido en el repositorio (niveles concretos no especificados en la model card); pesos PyTorch en `.pt` |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) y `.gguf` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only clasico de tipo GPT, sin mezcla de expertos, sin atencion lineal ni mecanismos híbridos. La particularidad esta en el tokenizador: trabaja a nivel de caracter, de modo que la "ventana de contexto" se mide en caracteres y no en tokens subword; con 256 caracteres, el modelo apenas cubre unas pocas frases. Los hiperparametros publicados de cada miembro son: Micro (2 capas, d_model 64, contexto 64, val loss 1,699), Tiny (4 capas, d_model 128, contexto 128, val loss 1,388), Small (6 capas, d_model 192, contexto 256, val loss 1,264), Medium (6 capas, d_model 384, contexto 256, val loss 1,167) y Bigish (8 capas, d_model 448, contexto 256, val loss 1,18).

El entrenamiento se hizo from scratch sobre una mezcla de FineWeb-Edu y conversaciones cotidianas. La model card no especifica el numero de tokens vistos, la composicion exacta del dataset, la mezcla por dominios ni si hubo fases de RLHF, DPO o ajuste por instrucciones; tampoco detalla la funcion de perdida mas alla de la pérdida de validación reportada. No se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, destilacion, etc.). El codigo de entrenamiento, chat y exportacion esta concentrado en un unico fichero, `chiken_sandwich.py`, que permite lanzar una conversacion con los cinco modelos a la vez mediante `python chiken_sandwich.py chat`.

## Capacidades

- Generacion de texto a nivel de caracter en ingles, con salida intencionadamente incoherente o divagante ("nonsense" es una de las etiquetas declaradas por el autor).
- Continuacion de texto corto: al tener 256 caracteres de contexto, puede enlazar unas pocas frases antes de perder el hilo.
- Modo conversacional basico (etiqueta `conversational` y `pipeline_tag: text-generation`), sin plantilla de chat documentada ni ajuste por instrucciones.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, planificacion multi-paso ni razonamiento extendido.
- Sin capacidades multimodales: no procesa vision, audio ni documentos.
- Sin modo "thinking" ni tokens de razonamiento.
- Multilingue: no; unicamente ingles.
- Exportacion a GGUF para su uso en runtimes ligeros.

## Casos de uso

- Docencia sobre transformers: entrenar y ejecutar la familia completa permite mostrar de forma tangible como escala la pérdida de validación (de 1,699 a 1,167) al crecer de 2 a 8 capas y de 64 a 448 dimensiones, sin necesidad de GPU dedicada.
- Pruebas de humo de pipelines de inferencia: al ocupar decenas de megabytes, sirve para validar extremo a extremo una integracion con llama.cpp, un contenedor de servicio o un script de generacion antes de desplegar un modelo grande.
- Validacion de exportaciones GGUF: el repositorio incluye pesos `.pt` y `.gguf` del mismo modelo, lo que permite comparar numéricamente la salida de PyTorch frente a la del runtime cuantizado y detectar regresiones en el conversor.
- Benchmarking de latencia en hardware modesto: es ejecutable en CPU, Raspberry Pi o microcontroladores de gama alta, de modo que se puede medir el coste fijo de arranque de un runtime sin que el tamaño del modelo domine la medicion.
- Generacion de texto de relleno en entornos de prueba: util para poblar interfaces, tests de UI o fixtures de bases de datos donde se requiere texto con forma de ingles pero sin contenido sensible ni dependencia de una API externa.
- Experimentacion con tokenizacion char-level: caso de estudio para comparar el comportamiento de un vocabulario de caracteres frente a BPE en tareas de continuacion y para analizar como afecta el contexto medido en caracteres.
- Demos de arte generativo o instalaciones: la salida deliberadamente absurda encaja en piezas que buscan texto incoherente como material creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pérdida de validacion durante el entrenamiento, que se reproduce a continuacion por ser el unico dato cuantitativo disponible y no ser comparable con MMLU, HumanEval o GSM8K.

| Modelo | Parametros | Capas | d_model | Contexto (caracteres) | Perdida de validacion |
|---|---|---|---|---|---|
| babble-micro | 0,11 M | 2 | 64 | 64 | 1,699 |
| babble-tiny | 0,82 M | 4 | 128 | 128 | 1,388 |
| babble-small | 2,74 M | 6 | 192 | 256 | 1,264 |
| babble-medium | 10,78 M | 6 | 384 | 256 | 1,167 |
| babble-bigish | 19,47 M | 8 | 448 | 256 | 1,18 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no publicado por el autor):

| Modelo | fp16 | int8 | int4 |
|---|---|---|---|
| babble-bigish (19,47 M) | ~39 MB | ~19 MB | ~10 MB |
| babble-medium (10,78 M) | ~22 MB | ~11 MB | ~5 MB |
| babble-small (2,74 M) | ~5,5 MB | ~2,7 MB | ~1,4 MB |
| babble-tiny (0,82 M) | ~1,6 MB | ~0,8 MB | ~0,4 MB |
| babble-micro (0,11 M) | ~0,2 MB | ~0,1 MB | ~0,06 MB |

- La cache KV es despreciable: con 8 capas, d_model 448 y 256 posiciones, el estado de atencion ocupa del orden de pocos megabytes incluso en fp16.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en iGPU. No se justifica el uso de A100 o H100 salvo para pruebas de integracion en ese hardware.
- Cabe en GPU consumer y tambien en CPU: es viable en Raspberry Pi y en dispositivos con menos de 1 GB de RAM.
- Opciones de despliegue: llama.cpp u Ollama a partir del `.gguf` incluido; ejecucion directa en PyTorch con `chiken_sandwich.py chat`. vLLM o TGI no son la via natural, ya que requeririan adaptar la arquitectura char-level y el tokenizador a los registros soportados por esos servidores.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño, se espera una latencia de orden de milisegundos incluso en CPU, pero es una estimacion, no un dato del autor.

## Comparativa con modelos similares

Dentro de la propia familia, la comparacion es directa y esta documentada:

| Modelo | Parametros | Contexto (caracteres) | Perdida de validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| babble-bigish | 19,47 M | 256 | 1,18 | Apache-2.0 | `.pt` + `.gguf` en el repositorio |
| babble-medium | 10,78 M | 256 | 1,167 | Apache-2.0 | `.pt` + `.gguf` en el repositorio |
| babble-small | 2,74 M | 256 | 1,264 | Apache-2.0 | `.pt` + `.gguf` en el repositorio |
| babble-tiny | 0,82 M | 128 | 1,388 | Apache-2.0 | `.pt` + `.gguf` en el repositorio |
| babble-micro | 0,11 M | 64 | 1,699 | Apache-2.0 | `.pt` + `.gguf` en el repositorio |

Nota: babble-medium obtiene una pérdida de validación ligeramente inferior a babble-bigish (1,167 frente a 1,18) pese a tener menos de la mitad de parámetros, lo que sugiere que el miembro mayor no esta necesariamente mejor ajustado con los hiperparámetros empleados.

Frente a alternativas externas de la misma categoria (GPTs char-level de escala 10-100 M, tipo nanoGPT, o los modelos de la familia TinyStories), no hay datos comparativos de benchmarks en la informacion disponible, por lo que no se establece una comparacion cuantitativa. La comparacion cualitativa se limita a lo declarado: misma arquitectura decoder-only, tokenizacion a nivel de caracter y ausencia de ajuste por instrucciones.

## Limitaciones y advertencias

- Calidad de salida: el propio autor indica explicitamente "do not trust the output. They are toys". La generacion es divagante e incoherente por diseno; no es apta para producción.
- Alucinacion: el riesgo es maximo en el sentido practico, porque el modelo no esta alineado ni ajustado por instrucciones y no mantiene coherencia factual en ningun momento.
- Contexto muy limitado: 256 caracteres en Bigish, 128 en Tiny y 64 en Micro. No soporta conversaciones multi-turno reales ni documentos.
- Idioma: unicamente ingles; no se ha documentado comportamiento en castellano ni en ningun otro idioma.
- Sin datos de sesgo: la model card no documenta evaluaciones de sesgo ni la composicion detallada del dataset (FineWeb-Edu mas conversaciones cotidianas), por lo que no se puede caracterizar el sesgo de forma rigurosa.
- Sin ajuste por instrucciones ni RLHF documentado: no responde a ordenes, no sigue formatos y no soporta tool calling.
- Licencia: Apache-2.0 permite uso comercial y modificacion con atribucion, pero el modelo carece de la calidad minima para cualquier producto; el autor no ofrece garantias.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (19 de octubre de 2026), sin maintenance posterior documentada.
- Codigo de entrenamiento concentrado en un unico fichero (`chiken_sandwich.py`), lo que limita su reproducibilidad a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robloxianer/babble
- Subcarpeta babble-micro: https://huggingface.co/robloxianer/babble/tree/main/babble-micro
- Subcarpeta babble-tiny: https://huggingface.co/robloxianer/babble/tree/main/babble-tiny
- Subcarpeta babble-small: https://huggingface.co/robloxianer/babble/tree/main/babble-small
- Subcarpeta babble-medium: https://huggingface.co/robloxianer/babble/tree/main/babble-medium
- Subcarpeta babble-bigish: https://huggingface.co/robloxianer/babble/tree/main/babble-bigish
- Codigo de entrenamiento, chat y exportacion: `chiken_sandwich.py` en la raiz del repositorio (https://huggingface.co/robloxianer/babble/tree/main)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
