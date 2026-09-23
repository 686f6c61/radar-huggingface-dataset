# flymy-ai/decision-fast-preview

## Resumen

Decision Fast 0.6B (identificador `flymy-ai/decision-fast-preview`) es un paquete de investigacion publicado por flymy-ai para evaluacion independiente en la tarea de "typed decisions": dado un estado textual y una instruccion, el modelo devuelve una decision tipada (`choice`, `noul` o `score`) junto con probabilidades nativas calibradas. No es un modelo generativo de texto: el checkpoint fue reentrenado como cabecera de decision y produce una distribucion softmax directamente, sin generar tokens de respuesta ni recurrir a logprobs de tokens de opcion.

El paquete se construye sobre el modelo base Qwen/Qwen3-0.6B-Base, congelado, al que se anaden un adaptador LoRA, filas de tokens estructurales y una "pointer head" entrenada, ademas del codigo de inferencia ejecutable. El checkpoint concreto, `qwen3_06b_headfirst_ep2a_v53`, tiene 606.672.384 parametros totales, de los que solo 10.622.464 estan entrenados. Todo el codigo y los pesos se verifican por hash antes de cargarse, y el modelo base se descarga aparte en la revision exacta indicada en `model.json`.

Su relevancia es acotada pero clara: se distribuye como research preview para que terceros reproduzcan y auditen los resultados publicos en el subconjunto publico de JevBench, donde alcanza un 64,07% de acierto global (148/231). El propio autor advierte explicitamente de que no se trata de un resultado oficial de JevBench ni de una release de produccion validada, y de que las condiciones de disponibilidad de pesos, licencia del codigo y procedencia del corpus de entrenamiento son cuestiones sin resolver.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen/Qwen3-0.6B-Base con adaptador LoRA y pointer head de decision; inferencia en bf16, sin fusionar (unmerged) |
| Parametros totales | 606.672.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Limite de empaquetado congelado de 4096 tokens; el texto de estado largo puede truncarse por el encoder |
| Tipos de cuantizacion | No disponible (el paquete se sirve en bf16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible; el modelo base Qwen/Qwen3-0.6B-Base se describe como Apache-2.0, pero la licencia del paquete no esta declarada. Existe un `EVALUATION-PERMISSION.md` y un `provenance-review.json` que deben consultarse antes de otros usos |
| Formato de pesos | Adaptador LoRA (PEFT) sin fusionar, mas filas de tokens estructurales y pointer head; no se distribuyen pesos completos del modelo base |
| Tipos de decision | `choice` (preserva el orden de etiquetas), `noul` (devuelve false/true) y `score` (devuelve indices de cadena base cero en el orden de niveles facilitado) |
| Limites del wrapper | 64 KiB por peticion, 4096 nodos JSON y 255 opciones; claves de respuesta de 8 KiB como maximo |
| Entorno medido | Linux, Python 3.11, Torch 2.8.0+cu128, transformers 4.57.6, peft 0.15.2, una GPU CUDA y un paquete de modelo por proceso |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base congelado y sustituye la generacion autoregresiva de respuestas por una lectura de decision nativa. Sobre el modelo base se monta un adaptador LoRA junto a filas de tokens estructurales y una pointer head entrenada; en total se entrenaron 10.622.464 parametros de los 606.672.384 del conjunto. La distribucion de salida es la softmax de esa pointer head, con una temperatura congelada ajustada sobre el propio replay de transferencia del checkpoint y sobre ejemplos de desarrollo de probabilidad conocida (known-chance). Segun el autor, ninguna etiqueta de benchmark publico entra en el ajuste de esa temperatura.

El paquete declara los hashes exactos de las fuentes de entrenamiento y la receta, pero el corpus mixto de entrenamiento no es publico y no se establece de forma independiente la ausencia total de contaminacion. Los resultados publicos influyeron en el diseno de experimentos anteriores y en la seleccion de candidatos, algo que el autor reconoce expresamente. En cuanto a verificacion numerica, existia una puerta inicial de probabilidad bruta de 0,51e-6 que omitia el redondeo de la suma de softmax en float32; la revision posterior exige una unica escala de normalizacion compartida que satisfaga todos los intervalos de seis decimales, con un error maximo de escala de dos epsilons de float32. La correccion se aplico despues de la ejecucion v59 y antes de la ejecucion Fast, sin cambiar pesos, calibracion ni el requisito de cambio cero en el argmax. Los 154 elementos historicos de pointer se comprobaron para paridad de prediccion y de probabilidad bruta.

## Capacidades

- Decision tipada sobre estados textuales en tres modos: `choice`, `noul` y `score`, con probabilidades nativas devueltas por la cabecera entrenada.
- Clasificacion con criterios etiquetados, por ejemplo asignar un texto a una cola de soporte (`billing`, `technical`) con su distribucion de probabilidad.
- Evaluacion booleana de afirmaciones mediante el modo `noul`, con salida false/true.
- Puntuacion ordinal mediante el modo `score`, que devuelve indices de cadena base cero en el orden de niveles facilitado por el llamador.
- Integracion con un harness externo: `jevbench_adapter.py` traduce false/true al no/yes del harness oficial de JevBench.
- Carga con verificacion de hash previa tanto del codigo como de los pesos, y opcion de apuntar a una copia local verificada del modelo base con `--assets /path/to/base`.
- Ejecucion determinista y acotada: procesamiento serial de peticiones, sin cache de respuestas, sin historial de conversacion, sin consultas a base de datos y sin inferencia externa.
- No dispone de generacion de texto libre, tool calling, capacidades de agente, vision ni audio; el propio autor indica que solo entran en inferencia el estado, el tipo, las instrucciones y los criterios (las etiquetas y los metadatos de tarea quedan excluidos).

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y un conjunto de colas definidas por el integrador, el modo `choice` devuelve la distribucion de probabilidad sobre cada cola, lo que permite fijar umbrales de confianza y derivar a revision humana los casos ambiguos.
- Triaje binario en pipelines de moderacion o validacion: el modo `noul` devuelve false/true para afirmaciones construidas por el llamador, con el mapeo ya resuelto a no/yes si se usa el adaptador de JevBench.
- Puntuacion de calidad o severidad con escala ordinal: el modo `score` devuelve indices base cero sobre la lista de niveles facilitada, adecuado para clasificaciones tipo baja/media/alta en las que importa el orden y no solo la etiqueta.
- Evaluacion y auditoria de terceros: el paquete se entrega precisamente para que un evaluador externo reproduzca los 231 resultados publicos con el harness oficial y compare con `reports/public-evaluation.json`.
- Analisis de coste por decision en entornos de benchmark: el autor sugiere una base de precio de 0,01 por millon de tokens de entrada como referencia de clase de tamano en hosting, lo que permite comparar el coste del modelo frente a alternativas servidas.
- Automatizacion de decisiones sobre datos sensibles que no pueden salir de la maquina: al no requerir inferencia externa (la unica dependencia de red opcional es la descarga del modelo base), encaja en despliegues locales con GPU unica.
- Componente de pre-filtrado en sistemas mayores: al consumir 1,48 GiB de VRAM asignada y responder en decenas de milisegundos, puede actuar como primera etapa barata que descarte casos triviales antes de invocar un modelo mayor.
- Validacion de contratos de entrada en servicios internos: la carga util esta acotada a 64 KiB, 4096 nodos JSON y 255 opciones, y la respuesta maxima observada fue de 354 bytes, lo que facilita el dimensionamiento de buffers y colas.

## Benchmarks y rendimiento

Resultados medidos sobre el subconjunto publico de JevBench con la pointer head entrenada, en una RTX 4090:

| Subconjunto publico de JevBench | Aciertos / total | Precision |
|---|---:|---:|
| Global | 148/231 | 64,07% |
| Easy | 48/48 | 100,00% |
| Standard | 56/72 | 77,78% |
| Hard | 44/111 | 39,64% |

Notas sobre estas cifras:

- El resultado publico anterior, del 62,77%, se obtuvo con verosimilitud de tokens de opcion normalizada por longitud sobre 77 elementos; esa configuracion no corresponde a esta entrega. Aqui las 231 respuestas usan la pointer head entrenada, incluidas las 77 medidas de nuevo.
- La suite completa consta de 534 decisiones e incluye tareas held-out no disponibles para el autor. No se reclama ningun rango oficial ni puntuacion agregada.
- Medido con Torch 2.8.0+cu128, transformers 4.57.6 y peft 0.15.2.

Rendimiento de servicio medido (paquete local, un proceso por modelo):

| Metrica | Valor |
|---|---|
| RSS maximo del proceso | 1,93 GiB |
| VRAM maxima asignada | 1,48 GiB |
| Crecimiento de RSS tras 128 peticiones repetidas | 0,00 MiB |
| Crecimiento de VRAM asignada tras 128 peticiones repetidas | 0,00 MiB |
| Respuesta JSON mas grande devuelta | 354 bytes |
| Latencia local p50 / p95 (codificacion + forward + calibracion, tier Standard) | 59,78 / 60,70 ms |

La latencia indicada excluye red y no constituye una afirmacion de latencia HTTP en produccion.

## Requisitos de hardware

- VRAM necesaria para inferencia: 1,48 GiB de VRAM asignada en el pico, segun la medicion del autor. El paquete se sirve en bf16 y sin fusionar.
- Memoria de sistema: 1,93 GiB de RSS maximo del proceso.
- GPU: la medicion se realizo en una RTX 4090. Cualquier GPU CUDA con al menos ~1,5 GiB de VRAM libre deberia ser suficiente por capacidad, aunque no se aportan mediciones en otras GPUs.
- Cabe holgadamente en GPU de consumo, incluidas gamas medias y bajas con soporte CUDA; tambien en GPUs de centro de datos (A100, H100) sin aprovechar su capacidad.
- Software: Linux, Python 3.11, CUDA GPU; instalacion mediante venv con torch 2.8.0 (indice cu128), numpy 2.1.2 y `requirements-minicpm.txt`; se requiere un paquete de modelo por proceso.
- Despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es el cargador propio (`model.py --verify-only`, `model.py --input example.json`) con transformers y peft, admitiendo `--assets /path/to/base` para usar una copia local verificada del base.
- Concurrencia: un modelo cargado procesa peticiones de forma serial, sin cache de respuestas. El llamador debe acotar su propia cola.
- Latencia y throughput: p50 de 59,78 ms y p95 de 60,70 ms para codificacion, forward y calibracion en tier Standard; no se publica throughput agregado ni comportamiento bajo concurrencia.
- Red: la descarga del modelo base es la unica dependencia de red opcional, con un maximo de dos workers de descarga.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros modelos de decision tipada en la informacion proporcionada. Los unicos elementos comparables documentados son el propio modelo y su base:

| Modelo | Parametros | Contexto | Precision JevBench publico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flymy-ai/decision-fast-preview | 606.672.384 totales; 10.622.464 entrenados | 4096 tokens (limite de empaquetado congelado) | 64,07% global (148/231); 100% Easy, 77,78% Standard, 39,64% Hard | No disponible para el paquete | Paquete de evaluacion con LoRA, pointer head y codigo |
| Qwen/Qwen3-0.6B-Base | No disponible en la informacion | No disponible en la informacion | No aplica (modelo generativo base, sin cabecera de decision) | Apache-2.0, segun la model card del paquete | Publico en HuggingFace |
| Qwen3-Embedding-0.6B | No disponible en la informacion | No disponible en la informacion | No aplica | No disponible en la informacion | Referencia usada por el autor para estimar la clase de tamano y el precio de Kev |

Alternativas de la misma categoria (modelos de clasificacion o enrutado del orden de 0,5B a 1B parametros, o aproximaciones de generacion de texto con analisis de logits de opcion) no aparecen evaluadas en la informacion disponible, por lo que no se ofrece comparacion cuantitativa.

## Limitaciones y advertencias

- No es una release de produccion validada: el propio autor lo califica de research preview para evaluacion independiente y advierte de que no es un resultado oficial de JevBench ni existe rango o puntuacion agregada alguna.
- Licencia no declarada para el paquete. La disponibilidad de pesos, la licencia del codigo y las condiciones no resueltas de las fuentes de entrenamiento se describen como hechos separados; hay que leer `EVALUATION-PERMISSION.md` y `provenance-review.json` antes de cualquier uso distinto de la evaluacion. El uso comercial queda, por tanto, sin cobertura clara.
- Corpus de entrenamiento no publico: se incluyen los hashes exactos de las fuentes y la receta, pero el corpus mixto no se distribuye y no se ha establecido de forma independiente la ausencia total de contaminacion.
- Desarrollo no ciego al benchmark: los resultados publicos influyeron en el diseno de experimentos y en la seleccion de candidatos, segun reconoce el autor.
- Rendimiento muy desigual por dificultad: 100% en Easy frente a 39,64% en Hard sobre el subconjunto publico. El modelo no es fiable en decisiones complejas sin supervision.
- Solo ingles. No hay soporte declarado de otros idiomas.
- Ventana de contexto efectiva limitada a 4096 tokens por el empaquetado congelado; los estados textuales largos pueden truncarse, lo que afecta directamente a la decision.
- Restricciones operativas del wrapper: 64 KiB por peticion, 4096 nodos JSON, 255 opciones y 8 KiB de claves de respuesta. Procesamiento serial sin cache ni historial de conversacion.
- Sin generacion de texto: si el caso de uso requiere justificar la decision en lenguaje natural, hay que anadir un componente externo.
- Riesgo de alucinacion entendido como calibracion imperfecta: la salida es una distribucion de probabilidad, y el autor reconoce que la puerta inicial de verificacion numerica omitia el redondeo de la suma de softmax en float32; la compatibilidad reclamada es a la precision reportada, no igualdad bit a bit.
- El precio de 0,01 por millon de tokens de entrada es una estimacion de referencia de clase de tamano en hosting, no una tarifa ofrecida; el computo local no se considera gratuito.
- Latencia no comparable con produccion: las cifras p50/p95 excluyen red y no constituyen una afirmacion de latencia HTTP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flymy-ai/decision-fast-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Harness oficial de JevBench: https://github.com/fstandhartinger/jevbench (revision `218511d85c5e9fc3dd12a08fae0e9818ea48bb68`)
- Archivos internos del paquete citados en la model card: `model.json`, `EVALUATION-PERMISSION.md`, `provenance-review.json`, `requirements-minicpm.txt`, `model.py`, `example.json`, `jevbench_adapter.py`, `audit_rounding.py`, `reports/public-evaluation.json`, `reports/numerical-compatibility-review.json`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos resultados obtenidos correspondian a paginas de localizacion de tiendas de una cadena de supermercados y no guardan relacion con el modelo. No se dispone de paper, blog tecnico ni demo adicionales.
