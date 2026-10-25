# Anupam-Rawat-IITB/SDAR-30B-judge-LoRA

## Resumen

SDAR-30B judge LoRA es un adaptador LoRA de 26,7 millones de parametros entrenables (0,09 % de los 30 000 millones del modelo base) que se monta sobre el modelo congelado JetLM/SDAR-30B-A3B-Chat-b32, un transformer de mezcla de expertos con decodificacion por difusion de bloques de 32 tokens. No es un modelo generativo autonomo: es un "juez" que, dado un bloque de 32 posiciones rellenado con conjeturas por un modelo borrador (drafter), decide que posiciones puede comprometer de una vez y cuales deben volver a la mascara para una nueva pasada del modelo grande.

El problema que resuelve es la latencia de la decodificacion por difusion en modelos MoE grandes. En el esquema original, cada bloque de 32 tokens exige una media de 12,79 pasadas completas del modelo de 30B. Con este juez, el modelo lee el bloque una sola vez por pasada y confirma las posiciones en las que su probabilidad supera 0,95, de modo que el bloque se cierra en 7,64 pasadas (hasta 9,72 sin redrafting), lo que se traduce en una aceleracion de 1,20x a 1,26x en tiempo de reloj con una perdida de precision de aproximadamente un punto porcentual.

Es relevante ahora porque la decodificacion especulativa se habia explorado poco en modelos de difusion de lenguaje de gran escala, y porque el adaptador demuestra que un juez muy pequeno (0,09 % de los parametros) puede reducir el numero de pasadas del modelo grande sin reentrenar la base. Lo firman Anupam Rawat (IIT Bombay) y Arush, se publica con licencia Apache-2.0 y viene acompanado de un drafter especifico (SDAR-1.7B-drafter-LoRA), del dataset de evaluacion y del repositorio con el codigo de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 64) sobre q, k, v, o de las 48 capas de atencion del modelo base, mas un embedding aprendido de flag de borrador; el base es un MoE con difusion de bloques (block size 32) |
| Parametros totales | 26,7 M entrenables en el adaptador (0,09 % del base); modelo base de 30 000 M (30B) |
| Parametros activos | aproximadamente 3B en el base (denominacion A3B); el reparto exacto por experto no esta disponible en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documenta soporte de GGUF ni de cuantizacion del base para este stack) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `adapter.safetensors` y `adapter_config.json` (formato PEFT, pero con carga no estandar); `trainer_state.pt` / `trainer_state.json` con el estado de AdamW y el recuento de tokens; checkpoints intermedios en `checkpoints/main/` y `checkpoints/main_128m/` |

## Arquitectura y entrenamiento

El adaptador se engancha a las proyecciones de atencion (q, k, v, o) de las 48 capas del base con rango 32 y alpha 64, y anade un embedding de flag de borrador que indica al modelo que posiciones del bloque contienen una conjetura del drafter y no un token ya confirmado. El base se mantiene totalmente congelado. El entrenamiento uso 8 GPU, learning rate 8e-5 y 128 millones de tokens, con un checkpoint raiz a 128M y una continuacion desde 28,5M hasta 128M documentada en el repositorio. Los datos son las propias respuestas verificadas del SDAR-30B a consignas de matematicas, codigo, chat, seguimiento de instrucciones y ciencia (olas de corpus A y B, con pesos de dominio 25 / 25 / 20 / 15 / 15 respectivamente), y cada bloque se reproduce con los borradores del SDAR-1,7B original. La perdida es entropia cruzada hacia el token que produce el modelo de 30B en cada posicion abierta, ponderada por "override" y con terminos de certeza y calibracion.

La innovacion esta en el mecanismo de decodificacion, no en la arquitectura: el juez evalua el bloque completo en una pasada, compromete las posiciones con probabilidad superior a 0,95 y devuelve el resto a `[MASK]` para que se rellenen en la siguiente iteracion. El adaptador es "flag-gated": solo actua en posiciones ocupadas por una conjetura del drafter y el modelo es identico bit a bit al base en prefill, vaciado de KV y posiciones no borradoradas. Por eso el autor advierte explicitamente de que no debe fusionarse en los pesos base, ya que una fusion aplicaria el comportamiento en todas las posiciones. La carga requiere `draftalign.adapter` o `run_da_decode.py --adapter <dir>` del repositorio; el cargador generico de PEFT no es compatible.

## Capacidades

- Decodificacion especulativa por bloques para el SDAR-30B-A3B-Chat-b32: cierre de bloques de 32 tokens en menos pasadas del modelo grande (12,79 a 9,72 sin redrafting; 7,64 con redrafting).
- Redaccion iterativa (re-drafting) con el drafter de 1,7B, compatible con una o dos rondas adicionales de borrador antes de confirmar.
- Razonamiento y generacion de texto heredados del base en cinco dominios de entrenamiento: matematicas, codigo, chat, ciencia y seguimiento de instrucciones.
- Evaluacion sobre 7 benchmarks con 2 250 preguntas en un arnes de Hugging Face convencional, incluyendo GSM8K (configuracion `gsm8k500`) e IFEval.
- Compatibilidad con el drafter companero `SDAR-1.7B-drafter-LoRA`, entrenado para el mismo flujo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el base es un modelo de lenguaje.

## Casos de uso

- Servicio de inferencia del SDAR-30B con menor coste por token: cargar el adaptador reduce las pasadas del modelo de 30B por bloque de 12,79 a 7,64, lo que rebaja el coste de computo en aproximadamente 1,6x para una precision casi identica (64,5 frente a 65,5 en el agregado de 7 benchmarks).
- Asistente de codigo en produccion sobre un MoE de difusion: el dominio de codigo pesa un 25 % en el corpus de entrenamiento del juez, lo que hace que el bloque se cierre antes en pasos de generacion de codigo, donde la aceleracion en tiempo de reloj es mas aprovechable (1,25x a 1,26x medido en el arnes).
- Razonamiento matematico por lotes (evaluacion tipo GSM8K): util para pipelines que ya ejecutan el base en modo difusion y quieren reducir el tiempo de generacion de cadenas de razonamiento, aceptando una caida de precision en torno a un punto.
- Chat multi-turno on-premise: despliegues con un solo nodo de GPU de 80 GB que necesitan servir el 30B con menor latencia por turno; hay que validar antes la longitud de contexto real, no documentada en la informacion disponible.
- Investigacion en decodificacion especulativa para modelos de difusion: el repositorio aporta codigo de entrenamiento (`code/corpus1b/train_c1b.py`), configuraciones, registros de evaluacion y el dataset `sdar30b-draft-judge-data`, lo que permite reproducir y comparar variantes de juez y drafter.
- Ajuste fino del equilibrio precision/velocidad en un pipeline existente: con `phase4-rd1` o `phase4-rd2` se elige entre 1,25x y 1,26x de aceleracion, con 64,5 o 64,2 de precision agregada respectivamente.
- Analisis de cuellos de botella en inferencia distribuida: sirve como caso de estudio medible de cuanto del coste de un MoE de difusion se puede desplazar a un modelo pequeno (26,7 M de parametros) en lugar de escalar hardware.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 2 250 preguntas y 7 benchmarks con un arnes de Hugging Face convencional. La columna de precision es la media agregada; no se detallan resultados por benchmark en la informacion proporcionada (el autor remite a `RESULTS.md`).

| Configuracion | Precision | Pasadas del 30B por bloque | Aceleracion |
|---|---|---|---|
| SDAR-30B sin aceleracion | 65,5 | 12,79 | 1,00x |
| + drafter SDAR-1,7B + este juez (fase 1) | 65,0 | 9,72 | 1,12x (computo) |
| + redrafting rd1 (fase 3) | 64,4 | 7,64 | 1,20x (tiempo de reloj) |
| + redrafting rd2 (fase 3) | 64,9 | 7,99 | 1,26x (tiempo de reloj) |
| + drafter entrenado, rd1 (fase 4) | 64,5 | 7,68 | 1,25x (tiempo de reloj) |
| + drafter entrenado, rd2 (fase 4) | 64,2 | 7,83 | 1,26x (tiempo de reloj) |

Datos adicionales: IFEval con el juez 51,0 % frente a 52,7 % del base sin acelerar, y 46-48 % cuando se activa el redrafting. La pagina personal del autor resume el trabajo como 1,28x de aceleracion extremo a extremo y 1,60x menos pasadas del modelo de 30B. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks estandar por separado.

## Requisitos de hardware

- El adaptador solo no es utilizable: requiere cargar el modelo base completo de 30B, por lo que la VRAM viene determinada por el base, no por los 26,7 M de parametros del LoRA.
- VRAM estimada en bf16: en torno a 60 GB solo para pesos, mas cache KV y estados de decodificacion; cifra estimada a partir del tamano del modelo, no confirmada en la informacion proporcionada.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o H200; tambien validas configuraciones multi-GPU, ya que el entrenamiento se hizo con 8 GPU.
- GPU de consumo: el base de 30B no cabe en bf16 en ninguna GPU de consumo. En teoria una RTX 4090 de 24 GB podria alojar una cuantizacion de 4 bits, pero no hay soporte documentado de cuantizacion para este stack de decodificacion por difusion, por lo que el dato es no disponible.
- Despliegue: no es compatible con vLLM, TGI, llama.cpp, Ollama ni con la carga generica de PEFT. El unico camino documentado es el repositorio `NoviceCoderInfinity/sdar30b-draft-judge` con `draftalign.adapter` o `run_da_decode.py --adapter <dir>`, instalado mediante `get.sh phase4-rd1`.
- Tamano del repositorio: 27,4 GB, porque incluye pesos del adaptador, estado de AdamW y todos los checkpoints intermedios; para inferencia basta con descargar `adapter*`.
- Throughput relativo: 1,60x menos pasadas del modelo de 30B por bloque en el mejor caso (12,79 a 7,64) y 1,20x-1,26x de mejora en tiempo de reloj. Latencia absoluta en milisegundos por token: no disponible.

## Comparativa con modelos similares

No hay en la informacion proporcionada evaluaciones de otras pilas de decodificacion especulativa (EAGLE, Medusa, Lookahead, decodificacion especulativa clasica) sobre este modelo base, por lo que la comparacion externa figura como no disponible. La comparacion interna entre configuraciones del mismo trabajo es la siguiente:

| Configuracion | Parametros anadidos | Precision | Pasadas por bloque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDAR-30B-A3B-Chat-b32 sin adaptador | 0 | 65,5 | 12,79 | Apache-2.0 | Hugging Face (JetLM) |
| Base + juez (fase 1) | 26,7 M | 65,0 | 9,72 | Apache-2.0 | este repositorio |
| Base + juez + redrafting (fase 3) | 26,7 M | 64,4-64,9 | 7,64-7,99 | Apache-2.0 | este repositorio |
| Base + juez + drafter entrenado (fase 4) | 26,7 M + drafter de 1,7B | 64,2-64,5 | 7,68-7,83 | Apache-2.0 | este repositorio + drafter companero |

## Limitaciones y advertencias

- El adaptador no debe fusionarse nunca en los pesos base: es flag-gated y una fusion aplicaria el comportamiento del juez en todas las posiciones, incluidas prefill y posiciones no borradoradas.
- No funciona con carga generica de PEFT ni con servidores de inferencia estandar; exige el codigo del repositorio y ata el despliegue a esa implementacion.
- Solo esta entrenado y evaluado con SDAR-30B-A3B-Chat-b32 en el commit `c351bbc`, tamano de bloque 32 y umbral de commit 0,95. Cualquier cambio de version, bloque o umbral invalida los resultados.
- Perdida de precision medible: entre 0,5 y 1,3 puntos en el agregado de 7 benchmarks, con el umbral fijado en 0,95. El riesgo de que el juez comprometa conjeturas incorrectas es inherente al metodo.
- IFEval es el punto debil: 51,0 % frente a 52,7 % del base, y cae a 46-48 % con redrafting activo. No se recomienda para cargas con requisitos estrictos de seguimiento de instrucciones.
- Un intento posterior de reentrenar el juez con estados grabados en SGLang (fase 5) fallo: las salidas entran en bucle. Ese checkpoint no debe usarse; el valido es el de la raiz.
- Sesgos conocidos: no documentados en la informacion proporcionada; el adaptador hereda los del modelo base y los del corpus de respuestas autogeneradas del propio 30B usado para entrenar.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar comportamiento en espanol o en contextos largos sin evaluacion previa.
- El corpus de entrenamiento son respuestas del propio modelo base, no datos humanos verificados, lo que puede reforzar errores sistematicos del base (sesgo de autodistilacion).
- Licencia Apache-2.0 en el adaptador y en el base, por lo que el uso comercial esta permitido; hay que verificar igualmente las condiciones del modelo JetLM subyacente antes de productionizar.
- El repositorio ocupa 27,4 GB; para servir solo hace falta `adapter*`, pero el resto de checkpoints y el estado del optimizador no deben desplegarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anupam-Rawat-IITB/SDAR-30B-judge-LoRA
- Modelo base: https://huggingface.co/JetLM/SDAR-30B-A3B-Chat-b32
- Drafter companero: https://huggingface.co/Anupam-Rawat-IITB/SDAR-1.7B-drafter-LoRA
- Dataset y registros de evaluacion: https://huggingface.co/datasets/Anupam-Rawat-IITB/sdar30b-draft-judge-data
- Repositorio del proyecto: https://github.com/NoviceCoderInfinity/sdar30b-draft-judge
- Resultados detallados por benchmark: https://github.com/NoviceCoderInfinity/sdar30b-draft-judge/blob/main/RESULTS.md
- Repositorio del modelo base SDAR (JetAstra): https://github.com/JetAstra/SDAR
- Pagina del autor: https://anupamrawat.com/
- Perfil del autor en Hugging Face: https://huggingface.co/Anupam-Rawat-IITB
- Perfil del autor en OpenReview: https://openreview.net/profile?id=~Anupam_Rawat2
