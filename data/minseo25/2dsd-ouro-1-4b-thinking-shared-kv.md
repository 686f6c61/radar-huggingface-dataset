# minseo25/2dsd-ouro-1.4b-thinking-shared-kv

## Resumen

2DSD shared-KV target: Ouro-1.4B-Thinking (W = 64) es un ajuste fino del modelo ByteDance/Ouro-1.4B-Thinking, un transformer con bucles iterativos (R = 4 loops) de 1.434 millones de parametros. Lo desarrolla Minseo Kim y colaboradores en el contexto del paper *2DSD: Two-Dimensional Speculative Decoding for Looped Language Models*, publicado por el SqueezeAILab. El modelo no es un modelo generalista nuevo, sino el objetivo (target) de un esquema de decodificacion especulativa bidimensional disenado especificamente para modelos con bucles.

El problema que resuelve es el coste de atencion en modelos con loops: en cada loop, las queries deben leer las entradas KV de su propio loop, lo que multiplica el coste de memoria y computo del cache KV. La adaptacion introduce un esquema de comparticion del cache KV del ultimo loop con una ventana local de W = 64 tokens: fuera de esa ventana, todas las queries de todos los loops leen un unico cache KV compartido del ultimo loop; dentro de la ventana, cada query lee las entradas de su propio loop. Ademas se conserva el cache KV de la primera capa del primer loop.

Es relevante porque demuestra que se puede reducir el coste del cache KV en modelos con loops manteniendo la distribucion de salida del modelo base (la verificacion se hace con el ultimo loop, por lo que se preservan las salidas greedy y la distribucion de muestreo). El ajuste se hizo con autodestilacion de dos pasadas durante una epoca sobre 128M tokens de OpenThoughts3, en 3,4 horas con cuatro GPU H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles iterativos (looped language model), R = 4 loops, con comparticion de cache KV del ultimo loop y ventana local W = 64 |
| Parametros totales | 1.434.652.673 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo base Ouro-1.4B-Thinking es un transformer con bucles: el mismo bloque se aplica de forma iterativa R = 4 veces, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. La adaptacion 2DSD modifica el mecanismo de atencion para que, para los tokens ya comprometidos fuera de una ventana local de 64 tokens, las queries de todos los niveles de loop lean un unico cache KV compartido correspondiente al ultimo loop. Dentro de la ventana, cada query lee las entradas KV de su propio loop, de modo que las queries concurrentes en profundidad solo comparten entradas ya comprometidas. Tambien se mantiene el cache KV de la primera capa del primer loop, y el prompt se prellena una sola vez con atencion por loop.

El entrenamiento consistio en un ajuste fino completo del modelo base mediante autodestilacion de dos pasadas durante una epoca sobre 128M tokens procedentes de OpenThoughts3, con un coste de 3,4 horas en cuatro GPU H100. La arquitectura, el tokenizer y la plantilla de chat son identicos a los del modelo base. La innovacion tecnica principal es el esquema de comparticion de cache KV, que reduce el coste de memoria del cache en decodificacion con loops sin alterar la distribucion de salida, ya que la verificacion se realiza con el ultimo loop.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Ouro-1.4B-Thinking.
- Razonamiento con modo thinking, ya que el modelo base es una variante "Thinking".
- Razonamiento matematico y de sentido comun, segun el perfil del modelo base.
- Generacion de codigo, segun el perfil del modelo base.
- Decodificacion especulativa integrada mediante el repositorio 2DSD, con un drafter asociado.
- Preservacion de las salidas greedy y de la distribucion de muestreo del modelo base gracias a la verificacion con el ultimo loop.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Decodificacion especulativa en produccion: el modelo actua como target verificado en el pipeline 2DSD, con un drafter que propone tokens y el modelo que los valida con el ultimo loop, reduciendo la latencia de generacion en modelos con loops.
- Razonamiento matematico interactivo: se puede usar para resolver problemas paso a paso en modo thinking, como el ejemplo del README (suma de los primeros 100 enteros positivos), con decodificacion greedy por defecto.
- Generacion de codigo asistida: el perfil del modelo base permite integrarlo en asistentes de codigo, y el esquema de cache compartido reduce el coste de memoria en contextos largos de codigo.
- Investigacion sobre eficiencia de atencion: sirve como referencia reproducible para estudiar el impacto de la comparticion de cache KV en modelos con loops, ya que el codigo y el paper estan publicados.
- Despliegue en hardware limitado: con 1.434 millones de parametros y pesos en safetensors de 2,9 GB, es viable en GPU de consumo para experimentacion, aunque la cuantizacion no esta documentada.
- Evaluacion comparativa de decodificacion especulativa: permite medir la ganancia de throughput de 2DSD frente a decodificacion autoregresiva estandar en un modelo con loops de 1.4B.
- Fine-tuning posterior sobre dominios concretos: al ser Apache-2.0 y mantener arquitectura, tokenizer y plantilla del base, se puede reajustar para tareas especificas sin cambiar el pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo pesa 2,9 GB en safetensors, por lo que en precision completa se requiere al menos ese espacio mas el cache KV y activaciones.
- GPU recomendadas: el ajuste se realizo en cuatro H100; para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8-16 GB, dado el tamano de 1.4B, aunque no hay datos oficiales de cuantizacion ni de VRAM medida.
- Opciones de despliegue: el README indica ejecutar con el repositorio SqueezeAILab/2DSD mediante `python scripts/generate.py --model ouro-1.4b-thinking`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 2DSD shared-KV target Ouro-1.4B-Thinking | 1.434 M | no disponible | Apache-2.0 | Target de decodificacion especulativa con cache KV compartido, W = 64 |
| ByteDance/Ouro-1.4B-Thinking | 1.434 M (aprox.) | no disponible | Apache-2.0 | Modelo base con loops R = 4, sin comparticion de cache KV |
| Alternativas de 1-2B con thinking | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo esta disenado como target de 2DSD; su uso correcto requiere el repositorio SqueezeAILab/2DSD y su regla de comparticion de cache KV del ultimo loop. Fuera de ese pipeline, el comportamiento no esta garantizado.
- La decodificacion es greedy por defecto; para muestrear hay que anadir `--temperature 0.6 --top-p 0.95`.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a un modelo de 1.4B; no se han publicado evaluaciones que lo cuantifiquen.
- No se documentan limitaciones de contexto ni la longitud maxima soportada.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar el texto de `LICENSE`.
- El ajuste se realizo sobre OpenThoughts3, un dataset orientado a razonamiento; el rendimiento en otros dominios puede degradarse.
- Requiere `trust_remote_code` por el uso de `custom_code` en los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minseo25/2dsd-ouro-1.4b-thinking-shared-kv
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Codigo 2DSD: https://github.com/SqueezeAILab/2DSD
