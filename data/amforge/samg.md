# AMFORGE/samg

## Resumen

SAM-G es un modelo de lenguaje de 30,3 millones de parámetros desarrollado por AMFORGE (AMEFORGE en la model card) para la generación estructurada de acciones en entornos sin conexión. Dado un enunciado en lenguaje natural, emite JSON compacto y válido contra esquema para diez dominios predefinidos (`ros`, `http`, `mqtt`, `db`, `workflow`, `ecommerce`, `vehicle`, `home`, `cal`, `file`); dada una pregunta, emite texto libre. La selección de modo es aprendida, no inducida por prompt, lo que elimina la necesidad de instrucciones de sistema en la llamada.

El modelo está pensado para robótica, IoT y despliegue embebido, donde las API de LLM alojados resultan caras, lentas o no están disponibles. Con 121 MB en fp32 (unos 30 MB en int8) y una ventana de contexto de 1024 tokens, cabe en hardware de clase Raspberry Pi y alcanza aproximadamente 235 tok/s con 16 ms hasta el primer token en una sola GPU. Se distribuye en formato ONNX y como checkpoint PyTorch, ejecutable con el runtime propio SparseMind, sin necesidad de PyTorch ni de código de arquitectura.

La relevancia actual reside en su especialización: con dos órdenes de magnitud menos parámetros que modelos generales de 0,5B a 1,5B, supera de forma clara a estos en exact-match de acciones estructuradas (76 % frente a 14-25 %) y en valididad JSON (100 %), a costa de peor bits-per-byte y conocimiento factual. La arquitectura, los datos de entrenamiento y los generadores del pipeline son propietarios y no se publican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (arquitectura propietaria; pesos ONNX y checkpoint PyTorch) |
| Parametros totales | 30,3M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | fp32 (121 MB), int8 (~30 MB), 4-bit (usado en baselines comparativos) |
| Idiomas soportados | ingles y frances (acciones en ambos; frances limitado a acciones, no prosa extensa) |
| Licencia | bsl-1.1 (Business Source License 1.1, licencia "other") |
| Formato de pesos | ONNX (`samg.onnx` + `samg.onnx.data`, ~117 MB) y PyTorch (`best.pt`); tokenizer SentencePiece (`samg_tokenizer.model`) |

## Arquitectura y entrenamiento

No se publican detalles de arquitectura: la model card indica explicitamente que el pipeline de entrenamiento, los generadores de datos y la arquitectura son propietarios ("We publish the numbers and the demo, not the internals"). Lo que si se conoce es que el modelo opera en dos modos con seleccion aprendida (acciones estructuradas y chat), usa un tokenizer SentencePiece propio y fue evaluado de forma zero-shot en su formato nativo, frente a baselines ejecutados en modo 3-shot con plantilla de chat y instruccion de sistema.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles. La evaluacion de modelado de lenguaje se realizo sobre un conjunto held-out de FineWeb-Edu, con 1,179 bits per byte, metrica que la model card justifica como "tokenizer-fair" porque la perplejidad por token no es comparable entre vocabularios distintos. El checkpoint ONNX presenta paridad verificada con PyTorch (diferencia maxima de logits de 3,96e-05, argmax identico) y es entre 1,7 y 2,3 veces mas rapido en CPU.

## Capacidades

- Generacion de JSON estructurado y valido contra esquema para diez dominios: `ros`, `http`, `mqtt`, `db`, `workflow`, `ecommerce`, `vehicle`, `home`, `cal` y `file`.
- Seleccion de modo aprendida entre accion estructurada (`[ACTION]`) y respuesta conversacional (`[CHAT]`), sin prompt de sistema.
- Function calling y tool use en formato JSON compacto, apto para ejecucion directa tras validacion de esquema.
- Generacion de texto libre para preguntas simples (modo chat).
- Capacidades multilingues limitadas a ingles y frances, y solo para acciones en el caso del frances.
- Inferencia en CPU sin PyTorch mediante el runtime SparseMind, orientada a despliegue embebido y offline.
- No dispone de vision, audio, thinking mode ni razonamiento multi-paso complejo.

## Casos de uso

- Domotica en dispositivo: el modelo traduce ordenes como "turn on the kitchen lamp" en una accion `home`/`set_state` valida, ejecutable localmente en un gateway domestico sin conexion a la nube.
- Capa de comandos NL→ROS para robots: convierte instrucciones en lenguaje natural en acciones `ros` estructuradas; es el dominio mas debil (0 % exact-match) y requiere fine-tuning adicional antes de produccion.
- Pasarelas de flotas MQTT: genera operaciones `publish` con topic, payload y QoS a partir de frases como "publish 21.5 on sensors/temp qos 1", con 100 % de exact-match en este dominio.
- NL-to-SQL en bases de datos embebidas: emite operaciones del dominio `db` (100 % exact-match) para consultas y mutaciones sobre bases locales en dispositivos con recursos limitados.
- Comandos de vehiculo offline: genera acciones del dominio `vehicle` (100 % exact-match) en entornos sin conectividad, donde una API alojada no es viable.
- Disparadores de workflow y automatizacion: produce acciones `workflow` (60 % exact-match) para encadenar tareas en pipelines de automatizacion industrial o de back-office.
- Router rapido delante de un LLM alojado: clasifica y estructura la peticion en local (16 ms hasta el primer token) y solo reenvia al modelo grande los casos que no encajan en los diez dominios.
- Etapa de tool calling en pipelines agenticos: actua como componente de structured generation de bajo coste y baja latencia, sustituyendo llamadas a API para la fase de formateo de acciones.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). SAM-G evaluado zero-shot en formato nativo; baselines en 3-shot con plantilla de chat.

| Modelo | Parametros | bpb (menor mejor) | JSON valido % | Exact % | Exact FR % | Cloze % | MB | tok/s | exact/M |
|---|---|---|---|---|---|---|---|---|---|
| SAM-G | 30,3M | 1,179 | 100 | 76 | 77 | 83 | 121 | 235 | 2,51 |
| Pythia-70M | 70M | 1,674 | 2 | 0 | 0 | 75 | 141 | 120 | 0,00 |
| Qwen2.5-0.5B-Instruct | 494M | 0,814 | 99 | 25 | 7 | 96 | 988 | 27 | 0,05 |
| SmolLM2-360M-Instruct | 362M | 0,812 | 96 | 14 | 0 | 96 | 724 | 21 | 0,04 |
| Qwen2.5-1.5B-Instruct | 889M | 0,753 | 98 | 21 | 0 | 96 | 444 (4-bit) | 13 | 0,02 |

Exact-match por dominio (%):

| ros | http | mqtt | db | workflow | ecommerce | vehicle | home | cal | file |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 100 | 100 | 100 | 60 | 100 | 100 | 50 | 80 | 60 |

Los baselines generales puntuan 0 en la mayoria de dominios y solo aciertan parcialmente en los mas genericos (`home`, `cal`). El dominio `ros`, con campos en coma flotante, es el mas debil y el que mas se beneficiaria de datos adicionales.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; 121 MB en fp32 y unos 30 MB en int8 de huella de memoria.
- GPU recomendadas: ninguna en particular; la model card reporta 235 tok/s y 16 ms hasta el primer token en una sola GPU no especificada.
- Cabe en GPU consumer (cualquier RTX) y tambien en CPU de clase Raspberry Pi.
- Opciones de despliegue: runtime SparseMind (recomendado, sin PyTorch), ONNX Runtime y PyTorch para el checkpoint `best.pt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~235 tok/s en GPU, 16 ms hasta el primer token; el checkpoint ONNX es entre 1,7 y 2,3 veces mas rapido que PyTorch en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JSON valido % | Exact % | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SAM-G | 30,3M | 1024 | 100 | 76 | bsl-1.1 | Pesos ONNX/PyTorch en HF; runtime propio |
| Qwen2.5-0.5B-Instruct | 494M | no disponible en la informacion | 99 | 25 | no disponible en la informacion | Amplia (ecosistema estandar) |
| SmolLM2-360M-Instruct | 362M | no disponible en la informacion | 96 | 14 | no disponible en la informacion | Amplia (ecosistema estandar) |
| Qwen2.5-1.5B-Instruct | 889M | no disponible en la informacion | 98 | 21 | no disponible en la informacion | Amplia (ecosistema estandar) |

SAM-G lidera en exact-match de acciones, exact-match en frances, huella de memoria, velocidad y exact-match por parametro; los modelos generales de mayor tamano lideran en bits-per-byte y cloze, lo que refleja su entrenamiento para conocimiento general. Qwen2.5-1.5B puntua por debajo de Qwen2.5-0.5B en exact-match de acciones, lo que sugiere que la capacidad en esta tarea depende de la especializacion de dominio y no de la escala.

## Limitaciones y advertencias

- No es un asistente general: el conocimiento factual y el razonamiento abierto estan limitados a esta escala; los modelos generales mayores superan a SAM-G en bits-per-byte y cloze.
- Riesgo de alucinacion en modo chat y en dominios fuera de distribucion; la model card exige parsear la salida como JSON y validarla contra el esquema antes de ejecutar.
- El frances cubre acciones, no prosa extensa.
- Los esquemas fuera de los diez dominios requieren fine-tuning; el dominio `ros` es el mas debil (0 % exact-match).
- Ventana de contexto de solo 1024 tokens, insuficiente para conversaciones o documentos largos.
- Licencia BSL 1.1: es una licencia de tipo source-available con restricciones; conviene revisar los terminos exactos antes de uso comercial en produccion.
- Arquitectura, pipeline de entrenamiento y generadores de datos son propietarios, lo que limita la auditabilidad y la reproducibilidad del entrenamiento.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados; los baselines se ejecutaron en condiciones distintas (3-shot con plantilla de chat) frente a SAM-G (zero-shot en formato nativo).
- Dependencia del runtime SparseMind para el flujo de ejecucion documentado; el ecosistema estandar (vLLM, llama.cpp) no aparece como soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMFORGE/samg
- Runtime SparseMind: https://github.com/amforge1/sparsemind-runtime
- Demo FOROS Action Engine: https://foros.run
