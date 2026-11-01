# eval-apply/silvann_tq_D8_qwen3.5_4b

## Resumen

silvann_tq_D8_qwen3.5_4b es una version cuantizada del modelo Qwen/Qwen3.5-4B empaquetada por el usuario eval-apply para el motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su libreria de redes neuronales). No se trata de un modelo nuevo: los pesos, tokenizador, plantilla de chat y configuraciones son los del modelo original de Qwen; lo unico que cambia es el formato de almacenamiento de los pesos, que pasa a `silvann-packed-v3`.

La cuantizacion aplica TurboQuant a 8 bits por peso en todas las matrices de capa, con una escala por fila y una rotacion bloqueada de Hadamard y signos a lo largo del eje de entrada. La matriz de embedding y la cabeza de salida (que esta atada al embedding) tambien se guardan a 8 bits, mientras que las normas y tensores pequenos se mantienen sin perdida. El sufijo `D8` indica "dense 8", es decir, que el modelo es denso y no tiene expertos.

Su relevancia es practica: reduce el modelo base de 4B parametros a un repositorio de unos 5,3 GB y permite ejecutarlo en el runtime de SiLVANN, que no es compatible con transformers. El autor reporta 75,8 tokens por segundo en una AMD Instinct MI50 tras un prompt de 2.000 posiciones, y 11,7 tokens por segundo en CPU con dos Xeon E5-2680 v4. Es, por tanto, una pieza de infraestructura para quien ya use SiLVANN, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-4B); empaquetado en formato `silvann-packed-v3` |
| Parametros totales | 4B (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, sin expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits por peso (TurboQuant, escala por fila) en matrices de capa, embedding y cabeza; normas y tensores pequenos sin perdida |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con transformers |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.5-4B, un transformer denso de 4.000 millones de parametros desarrollado por el equipo Qwen. Esta ficha no dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la documentacion oficial de Qwen y no se incluyen en la informacion proporcionada.

La innovacion de este repositorio es exclusivamente de compresion y formato. Cada matriz de capa se cuantiza a 8 bits con TurboQuant y una escala por fila, y se rota a lo largo de su eje de entrada mediante una rotacion bloqueada de Hadamard y signos. La cabeza de salida se deriva del embedding, al que el modelo esta atado, y ambos se almacenan a 8 bits. Las normas y tensores pequenos se conservan en precision original. El autor verifico el resultado comparando con el forward de Hugging Face de los pesos originales: la continuacion greedy coincide token a token y los cinco logits mas altos difieren 0,05 de media.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3.5-4B original, aunque esta ficha no dispone de un desglose detallado de las mismas.
- Codigo y matematicas: presumiblemente presentes en el modelo base, pero no verificadas en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Inferencia en el runtime SiLVANN: unica via de ejecucion soportada por este empaquetado.

## Casos de uso

- Despliegue en el motor SiLVANN: el caso natural es ejecutar el modelo dentro del Eval-Apply GPU Interpreter, ya que el formato `silvann-packed-v3` solo lo lee ese runtime y no es compatible con transformers.
- Inferencia en hardware AMD Instinct: el autor reporta 75,8 tokens por segundo en una MI50 con un prompt de 2.000 posiciones, lo que lo hace adecuado para servir generacion de texto en GPUs AMD donde otros stacks tienen menos soporte.
- Inferencia en CPU sin GPU: con 11,7 tokens por segundo en dos Xeon E5-2680 v4 y 2,3 en cuatro hilos, sirve para tareas por lotes o entornos sin acelerador, donde la latencia no es critica.
- Experimentacion con cuantizacion a 8 bits: util para investigadores que quieran comparar la fidelidad de TurboQuant con rotacion de Hadamard frente a otros esquemas de cuantizacion, dado que el autor documenta la desviacion de logits frente al modelo original.
- Prototipado de pipelines con contexto medio: el benchmark se hizo con un prompt de 2.000 posiciones, por lo que encaja en tareas de resumen, extraccion o clasificacion sobre documentos de esa longitud, siempre que se ejecute en SiLVANN.
- Base para fine-tuning posterior sobre formato empaquetado: si el flujo de trabajo de SiLVANN lo permite, sirve como punto de partida para adaptaciones que luego se reempaqueten en el mismo formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta metricas de inferencia y de fidelidad de la cuantizacion:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput en GPU | 75,8 tokens/s | AMD Instinct MI50, tras prompt de 2.000 posiciones |
| Throughput en CPU | 11,7 tokens/s | 2x Xeon E5-2680 v4 |
| Throughput en CPU | 2,3 tokens/s | 4 hilos de Xeon E5-2680 v4 |
| Fidelidad de logits | 0,05 de desviacion media en el top-5 | Frente al forward de Hugging Face de los pesos originales |
| Coincidencia greedy | Token a token | Frente al forward de Hugging Face de los pesos originales |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,3 GB, por lo que la inferencia requiere al menos ese espacio mas el overhead del runtime SiLVANN; el autor no publica una cifra exacta de VRAM.
- GPU recomendadas: AMD Instinct MI50 (medida por el autor); no se documentan resultados en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos publicados sobre su funcionamiento en GPUs consumer; el unico hardware verificado es una MI50 y CPUs Xeon E5-2680 v4.
- Opciones de despliegue: exclusivamente el runtime de SiLVANN; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `silvann-packed-v3` no lo lee transformers.
- Latencia y throughput: 75,8 tokens/s en MI50, 11,7 tokens/s en dos Xeon E5-2680 v4 y 2,3 tokens/s en cuatro hilos, medidos tras un prompt de 2.000 posiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silvann_tq_D8_qwen3.5_4b | 4B | No disponible | `silvann-packed-v3` (8 bits) | Apache 2.0 | Solo runtime SiLVANN |
| Qwen/Qwen3.5-4B | 4B | No disponible | Pesos originales (transformers) | Apache 2.0 | Hugging Face, transformers |
| Otras cuantizaciones de Qwen3.5-4B (GGUF, AWQ, GPTQ) | 4B | No disponible | GGUF / AWQ / GPTQ | Apache 2.0 | llama.cpp, vLLM, etc. |

La diferencia clave frente a las alternativas no esta en calidad ni en tamano, sino en el ecosistema: este empaquetado solo funciona en SiLVANN, mientras que el modelo original y sus cuantizaciones estandar se ejecutan en transformers, llama.cpp o vLLM. No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato `silvann-packed-v3` no lo lee transformers ni las herramientas habituales (vLLM, llama.cpp, Ollama, TGI); sin el runtime de SiLVANN el modelo es inutilizable.
- Perdida de calidad por cuantizacion: aunque la continuacion greedy coincide token a token y el top-5 se desvia 0,05 de media, existe una degradacion medible frente a los pesos originales que puede acumularse en generaciones largas.
- Idiomas no declarados: el repositorio no especifica que idiomas soporta, lo que impide garantizar un comportamiento multilingue concreto.
- Contexto no documentado: se desconoce la longitud maxima de contexto, mas alla de que el benchmark se hizo con 2.000 posiciones.
- Sesgos y alucinaciones: no hay informacion especifica en el repositorio; deben asumirse los del modelo base Qwen3.5-4B, no documentados aqui.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recuerda que todo el merito del modelo es del equipo Qwen y que se aplica la licencia original.
- Madurez: el repositorio tiene 20 descargas, 0 likes y fue creado y actualizado el mismo dia (28 de octubre de 2026), sin senales de validacion por parte de la comunidad.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede evaluar su rendimiento en tareas reales a partir de esta informacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8_qwen3.5_4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
