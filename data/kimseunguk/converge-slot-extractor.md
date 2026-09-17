# kimseunguk/converge-slot-extractor

## Resumen

converge-slot-extractor es un paquete de tres modelos GGUF publicados por el usuario de HuggingFace kimseunguk que realizan extraccion de slots sobre frases en coreano de coordinacion de desplazamientos a un punto de reunion, y devuelven un objeto JSON con estructura fija. Los tres artefactos parten de bases distintas: Qwen3-0.6B, Qwen3-1.7B y Kanana-1.5-2.1B-Instruct, todas ellas ajustadas con QLoRA de 4 bits y despues cuantizadas a Q4_K_M con llama.cpp. El repositorio ocupa 8,7 GB y el recuento de parametros reportado para el artefacto mayor es de 2.086.984.704.

El problema que resuelve es muy concreto: convertir mensajes coloquiales de coordinacion (hora, destino, proposito, participantes, medio de transporte, recogidas, restricciones) en un JSON consumible por software, con dos dominios de negocio: mantenimiento de buques (`ship_maintenance`) y despliegue de proyectos de integracion de sistemas (`si_deploy`). Es relevante dentro del nicho de la extraccion de informacion estructurada en coreano porque demuestra que un modelo de 0,6B a 2,1B ajustado sobre 591 ejemplos sinteticos alcanza un `slot_f1` de 95,3%-99,8% en su dominio, con un coste de inferencia muy bajo en disco.

La licencia es Apache 2.0 tanto en el ajuste como en las tres bases, y el idioma soportado es unicamente el coreano. No hay pipeline declarado, no hay datos de benchmarks externos y el repositorio no tiene descargas ni likes registrados, por lo que se trata de un artefacto sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only. La model card no detalla la arquitectura interna; los pesos derivan de Qwen3-0.6B, Qwen3-1.7B y Kanana-1.5-2.1B-Instruct |
| Parametros totales | 2.086.984.704 (dato safetensors reportado para el artefacto mayor). El repositorio contiene tres modelos: 0,6B, 1,7B y 2,1B |
| Parametros activos | no aplica: ninguno de los tres modelos es MoE |
| Longitud de contexto | 1152 tokens (`max_seq_length` de entrenamiento). El ejemplo de uso configura `n_ctx=2048` |
| Tipos de cuantizacion | unicamente Q4_K_M en GGUF. El ajuste se hizo con QLoRA 4-bit nf4 (double quant, computo en fp16) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 (ajuste y modelos base) |
| Formato de pesos | GGUF. Requiere ademas dos ficheros auxiliares por modelo: `<modelo>.prompt.json` (prefijo, sufijo, `add_bos`, `max_new_tokens`, `temperature`, `stop`) y `grammar.gbnf` |

## Arquitectura y entrenamiento

El proyecto no entrena modelos desde cero: aplica QLoRA de 4 bits (nf4, double quantization, computo en fp16, gradient checkpointing) sobre tres modelos base con revision fijada: Qwen3-0.6B (`c1899de2`), kanana-1.5-2.1b-instruct-2505 (`7df4bc35`) y Qwen3-1.7B (`70d244cc`). La configuracion LoRA es rank 16, alpha 32, dropout 0,05 y modulos objetivo `q/k/v/o/gate/up/down_proj`. El entrenamiento usa 3 epocas, learning rate 2,0e-4, warmup del 3%, scheduler lineal, batch efectivo de 16, `max_seq_length` de 1152 y semilla 42, sobre una GPU T4 de Colab con torch 2.11.0+cu128 y transformers 5.16.1. No se menciona RLHF ni DPO: es un ajuste supervisado puro sobre pares entrada-salida JSON.

Los datos son 591 ejemplos sinteticos generados con plantillas y un diccionario de vocabulario mediante el script `gen_dataset.py`, sin generacion por LLM, divididos en 551 de entrenamiento y 40 de validacion, sin duplicados en la frase de entrada. Las categorias son `si_deploy_night` (70), `ship_regular` (70), `ship_emergency` (60), `ship_reschedule` (53), `follow_up` (50), `out_of_scope` (50), `si_hq_gather` (50), `si_client_meeting` (49), `missing` (44), `pickup` (40), `kakao` (35) y `unfamiliar` (20). La innovacion tecnica destacable no esta en la arquitectura, sino en la salida: se usa decodificacion restringida con una gramatica GBNF que fuerza un JSON con 11 claves de primer nivel (`preset`, `datetime`, `purpose`, `destination`, `participants`, `rendezvous`, `access`, `schedule_confirmed`, `constraints`, `missing`, `out_of_scope`) y 7 claves por participante (`name`, `origin`, `transport`, `pickup`, `pickup_at`, `unfamiliar`, `role`), de modo que el resultado siempre es parseable.

## Capacidades

- Extraccion de slots a JSON sobre frases coloquiales en coreano de coordinacion de citas y desplazamientos.
- Clasificacion del dominio (`preset`) en `ship_maintenance` o `si_deploy`, con deteccion de peticiones fuera de alcance (`out_of_scope: true`, `preset: null`).
- Normalizacion de fecha y hora relativa a formato interno, por ejemplo "화요일 14:00" a partir de una mencion como "오후 2시".
- Descomposicion de participantes con origen, medio de transporte (`car`, `transit`, `walk` o `null`), conductor que recoge (`pickup`) y punto de recogida individual (`pickup_at`), distinto del punto de encuentro comun (`rendezvous`).
- Clasificacion de roles por participante: `site`, `vendor`, `colleague`, `client`.
- Deteccion de restricciones logisticas (por ejemplo `luggage` cuando hay equipo) y de informacion ausente mediante la lista `missing`.
- Salida JSON garantizada por gramatica GBNF, lo que elimina el riesgo de texto libre no parseable.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso general, vision, audio ni generacion de texto abierto. Es un extractor de proposito unico.

## Casos de uso

- Planificacion de despliegues de integracion de sistemas: a partir de un mensaje de grupo de trabajo en coreano, el modelo devuelve hora, cliente, sede de destino, participantes, quien conduce y quien necesita que le recojan, alimentando directamente una herramienta interna de agenda. El modelo de 2,1B es el adecuado aqui por su `exact_match` del 85,0% en validacion.
- Coordinacion de mantenimiento de buques: los mensajes de tripulacion sobre guardias, emergencias y reprogramaciones se convierten en registros JSON con `preset: ship_maintenance`, lo que permite consolidar incidencias y turnos sin intervencion manual.
- Deteccion de informacion incompleta para repreguntar: la lista `missing` indica que campos no se pudieron determinar, de forma que el sistema puede lanzar una pregunta de seguimiento concreta en lugar de descartar el mensaje.
- Filtrado de mensajes ruidosos en canales de mensajeria: la categoria `out_of_scope` y el campo `out_of_scope` permiten descartar conversacion no operativa antes de pasarla a un sistema mayor, reduciendo coste en etapas posteriores.
- Logistica de recogidas compartidas: los campos `pickup` y `pickup_at` modelan quien recoge a quien y en que punto, lo que permite construir rutas o avisos individuales; en validacion el modelo de 2,1B obtiene 85,7% de F1 en `pickup_at` y 100% en `pickup`.
- Normalizacion de lenguaje natural a calendario: el campo `datetime` normalizado permite insertar eventos en Google Calendar o sistemas equivalentes sin parseo adicional por expresiones regulares.
- Despliegue en CPU o en dispositivos con recursos limitados: los ficheros Q4_K_M ocupan entre 0,37 y 1,30 GiB, por lo que el extractor puede ejecutarse en un contenedor sin GPU dentro de un backend llama.cpp, siempre que se acepte la latencia medida.
- Preprocesado en pipelines de CI/CD de herramientas internas: al devolver siempre JSON valido por gramatica, la salida se puede validar con un esquema y usarse como entrada de un job automatizado sin capa de reparacion.

## Benchmarks y rendimiento

Los datos proceden de la propia model card, medidos el 2026-09-18 sobre las 40 muestras de validacion. La latencia es por generacion en GPU T4 con `generate` en fp16, no en GGUF sobre CPU.

| Modelo | Etapa | exact_match | slot_f1 | field_acc (media) | latency_p50 (s) | latency_p95 (s) |
|---|---|---|---|---|---|---|
| Qwen3-0.6B | base (sin ajuste) | 0,0% | 32,5% | 31,2% | 10,18 | 13,83 |
| Qwen3-0.6B | LoRA | 47,5% | 95,3% | 94,8% | 9,31 | 11,85 |
| Kanana-1.5-2.1B-Instruct | base (sin ajuste) | 7,5% | 47,8% | 53,8% | 8,96 | 12,52 |
| Kanana-1.5-2.1B-Instruct | LoRA | 85,0% | 99,8% | 98,8% | 8,65 | 11,95 |
| Qwen3-1.7B | base (sin ajuste) | 7,5% | 38,1% | 49,7% | 7,93 | 14,94 |
| Qwen3-1.7B | LoRA | 45,0% | 96,4% | 92,0% | 8,80 | 11,98 |

F1 por slot relevante, tras el ajuste:

| Modelo | pickup | pickup_at |
|---|---|---|
| Qwen3-0.6B | 100,0% | 100,0% |
| Kanana-1.5-2.1B-Instruct | 100,0% | 85,7% |
| Qwen3-1.7B | 100,0% | 100,0% |

Prueba de humo en CPU con 2 hilos (validacion de esquema y tiempo de generacion por muestra, medido en Colab):

| Modelo | Fichero | Esquema | Tiempo CPU por generacion (s) |
|---|---|---|---|
| Qwen3-0.6B | `qwen3_0.6b-Q4_K_M.gguf` | correcto | 43,45 |
| Kanana-1.5-2.1B-Instruct | `kanana_2.1b-Q4_K_M.gguf` | correcto | 109,62 |
| Qwen3-1.7B | `qwen3_1.7b-Q4_K_M.gguf` | correcto | 82,18 |

El autor advierte que estas cifras de CPU son una unica medicion en Colab y que deben remedirse en el entorno real de servicio.

## Requisitos de hardware

- VRAM o RAM para inferencia: los ficheros Q4_K_M ocupan 0,37 GiB (Qwen3-0.6B), 1,03 GiB (Qwen3-1.7B) y 1,30 GiB (Kanana-1.5-2.1B). Con contexto de 2048 y cache KV, la huella estimada es de aproximadamente 0,5-1,5 GB, aunque no hay cifras oficiales de VRAM publicadas.
- Cabe en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090 o incluso GPUs integradas, y tambien en CPU sin aceleracion. No requiere A100 ni H100.
- Opciones de despliegue: llama.cpp y `llama-cpp-python` son la via natural, ya que permiten cargar el `grammar.gbnf` y el `prompt.json` que el modelo necesita. Ollama puede cargar los GGUF, pero el uso de la gramatica GBNF exacta esta mas directamente soportado en llama.cpp. vLLM y TGI requieren convertir los pesos a otro formato y no aprovecharian la gramatica tal cual.
- Latencia medida: en GPU T4 con fp16, entre 7,93 y 10,18 s por generacion (p50) antes y despues del ajuste. En CPU Colab con 2 hilos, entre 43,45 s (0,6B), 82,18 s (1,7B) y 109,62 s (2,1B) por generacion. Es una latencia alta para interaccion en tiempo real incluso con el modelo mas pequeno.
- Throughput: no disponible. No se publican mediciones de peticiones por segundo ni de procesamiento por lotes.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos publicos comparables de extraccion de slots en coreano para coordinacion de desplazamientos. La comparativa mas util es interna, entre los tres artefactos del propio repositorio:

| Modelo | Parametros | Tamano Q4_K_M | exact_match | slot_f1 | field_acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-0.6B (LoRA) | 0,6B | 0,37 GiB | 47,5% | 95,3% | 94,8% | Apache 2.0 | GGUF en el repo |
| Qwen3-1.7B (LoRA) | 1,7B | 1,03 GiB | 45,0% | 96,4% | 92,0% | Apache 2.0 | GGUF en el repo |
| Kanana-1.5-2.1B-Instruct (LoRA) | 2,1B | 1,30 GiB | 85,0% | 99,8% | 98,8% | Apache 2.0 | GGUF en el repo |

Como referencia de categoria, los modelos base sin ajustar (Qwen3-0.6B, Qwen3-1.7B y Kanana-1.5-2.1B-Instruct) obtienen `exact_match` de 0,0%, 7,5% y 7,5% respectivamente, lo que indica que la tarea depende enteramente del ajuste y que un modelo generico de ese tamano no la resuelve sin entrenamiento especifico.

## Limitaciones y advertencias

- Idioma unico: solo coreano. No hay evidencia de funcionamiento en castellano ni en ningun otro idioma.
- Dominio cerrado: el espacio de salida esta limitado a `ship_maintenance` y `si_deploy`. Cualquier coordinacion de otro ambito caera en `out_of_scope` o producira extracciones incorrectas.
- Datos de entrenamiento muy reducidos y sinteticos: 591 ejemplos generados por plantillas y diccionario, no por LLM ni por habla real. La cobertura lexica es la del diccionario usado, por lo que el vocabulario no visto (jerga nueva, nombres propios, abreviaturas) puede degradar el resultado de forma no medida.
- Sobreajuste plausible: la brecha entre `slot_f1` (99,8%) y `exact_match` (85,0%) en el mejor modelo, junto con la naturaleza plantillada del dataset, sugiere que el rendimiento fuera de la distribucion de entrenamiento sera inferior al reportado.
- Dependencia de ficheros externos: el `prompt.json` y el `grammar.gbnf` necesarios para el uso correcto no estan en el repositorio de HuggingFace, sino en rutas de Google Drive del repositorio de entrenamiento (`runs/<modelo>/gguf/`, `finetune/export/grammar.gbnf`). Esto complica la reproducibilidad y el despliegue.
- Latencia alta: 8,65-9,31 s por generacion en T4 y 43-110 s por generacion en CPU con 2 hilos. No es apto para interaccion en tiempo real ni para alto volumen sin optimizacion adicional.
- Riesgo de alucinacion: la gramatica GBNF garantiza que la salida sea JSON valido, pero no que los valores sean correctos. El modelo puede rellenar campos con valores plausibles cuando la frase no los contiene; el campo `missing` mitiga el problema solo parcialmente.
- Sesgos: no se han documentado sesgos especificos ni se ha realizado evaluacion de sesgo. Al estar entrenado sobre plantillas coreanas, puede reflejar supuestos culturales y laborales del contexto laboral coreano (roles, jerarquia, tratamiento de nombres).
- Licencia: Apache 2.0 en el ajuste y en las tres bases (Qwen3-0.6B y Qwen3-1.7B de Alibaba, Kanana-1.5-2.1B-Instruct de Kakao), por lo que el uso comercial es posible. Aun asi, conviene verificar la licencia de cada base por separado en su propia ficha.
- Sin validacion independiente: 0 descargas y 0 likes en el momento de la consulta. Las metricas son autodeclaradas por el autor y no han sido replicadas por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimseunguk/converge-slot-extractor
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Kanana-1.5-2.1B-Instruct: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505
- Repositorio de entrenamiento con `prompt.json` y `grammar.gbnf`: no disponible como URL publica; la model card solo indica rutas de Google Drive
- Paper, blog o demo del autor: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a temporadas de la Premier League y no guardan relacion con esta ficha
