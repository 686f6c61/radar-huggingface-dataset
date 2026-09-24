# chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX-bf16

## Resumen

Jev-Style-0.8B-Decision-v3-MLX-bf16 es la conversion a formato MLX (bf16) del modelo Jev-Style-0.8B-Decision-v3, desarrollado por el usuario chaoliangUNSW. Se trata de un modelo de decision y clasificacion de opciones multiples, no de un modelo generativo de proposito general: recibe un "estado" (texto de contexto, hasta 25.600 tokens), una pregunta y un conjunto de opciones etiquetadas, y devuelve una probabilidad calibrada para cada opcion en una sola pasada. Esta construido sobre Qwen/Qwen3.5-0.8B (licencia Apache-2.0) y cuenta con 752.393.024 parametros, comercializado como "0.8B".

La relevancia de esta publicacion concreta es doble. Por un lado, ofrece pesos MLX bf16 optimizados para Apple Silicon, con paridad de decision verificada frente a la referencia PyTorch FP32 en 240 de 240 filas de un fixture de paridad y en 6 de 6 prompts adicionales de unos 16K y 25,6K tokens. Por otro, el autor reporta resultados de clasificacion de intenciones en 51 idiomas sobre el conjunto MASSIVE, con un 71,7 % de exactitud macro frente al 40,1 % del checkpoint multilingue oficial de Laya, y un 98,3 % de acierto en items reales con 24K tokens de contexto.

El modelo pertenece a la serie de decision "Jev-Style" del mismo autor (v1 2B, v2 2B y ahora v3 0.8B) y esta pensado para tareas de enrutado, clasificacion y decision con opciones tipadas, con un presupuesto de lectura de 2.048 tokens para pregunta, opciones y readout. La licencia de los pesos es Apache-2.0, aunque el propio autor advierte de que parte de los datos de entrenamiento tiene terminos restrictivos o poco claros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), adaptado a decision/clasificacion con readout de opciones; detalles internos no disponibles |
| Parametros totales | 752.393.024 (0,75B; denominado "0.8B" por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 25.600 tokens para la entrada completa; 2.048 tokens para pregunta, opciones y readout; las entradas que exceden el presupuesto lanzan error, no se truncan |
| Tipos de cuantizacion | bf16 (pesos); el runtime usa activaciones en float32 sobre los pesos bf16 (ajuste validado). No se distribuyen otras cuantizaciones en este repositorio |
| Idiomas soportados | Metadatos de HuggingFace: 19 idiomas (en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi). La model card afirma evaluacion en 51 idiomas sobre MASSIVE |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), libreria MLX; incluye `config.json`, tokenizer, `readout_config.json` y `jev_style_decision_mlx.py` |
| Pipeline declarado | text-classification |
| Modelo base | chaoliangUNSW/Jev-Style-0.8B-Decision-v3 (relacion: quantized), construido sobre Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,5 GB |
| Fecha de publicacion | 2026-09-24 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen/Qwen3.5-0.8B, un transformer de 0,75B parametros con licencia Apache-2.0. La adaptacion consiste en un esquema de decision en el que la entrada se compone de un estado (hasta 25.600 tokens), una pregunta, un conjunto de opciones etiquetadas con descripcion y una categoria, y la salida es un vector de probabilidades calibradas sobre las opciones. El autor lo describe con el lema "one state, one pass, every option scored", lo que implica una unica pasada forward para puntuar todas las opciones, en contraste con esquemas de generacion autoregresiva opcion por opcion. El repositorio incluye un `readout_config.json` con temperaturas ajustadas, lo que confirma que la calibracion de las probabilidades se realiza a posteriori sobre el readout.

En cuanto al entrenamiento, la informacion disponible es limitada. La model card de este repositorio remite a la model card principal para los datos y licencias, y solo aporta que el fixture de paridad se extrajo de un "training pool" con 22 categorias en ingles y chino, y que la evaluacion sobre MASSIVE es in-domain para 14 locales y held-out para 37. Se menciona que parte de las filas de entrenamiento son salidas de modelos de OpenAI y Anthropic, y que algunos datos tienen terminos restrictivos o poco claros. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a MLX se realizo con mlx 0.32.2 y mlx-lm 0.31.3.

## Capacidades

- Decision y clasificacion con opciones tipadas: devuelve una probabilidad calibrada por cada opcion, no texto libre.
- Puntuacion de todas las opciones en una sola pasada ("one state, one pass").
- Contexto largo de hasta 25.600 tokens, con un presupuesto separado de 2.048 tokens para pregunta, opciones y readout.
- Clasificacion de intenciones multilingue: evaluado sobre MASSIVE en 51 idiomas segun el autor, con 19 idiomas declarados en los metadatos del repositorio.
- API de inferencia con `decide` y `decide_many`, modos `qtype="noul"` y `qtype="score"`, lote por `--jsonl` y verificacion con `--verify`.
- Acepta estados estructurados (por ejemplo, diccionarios con campos como `ticket` y `customer_tier`) como entrada.
- Etiqueta generica `system-one`, que sugiere un diseno de respuesta rapida en una sola pasada frente a esquemas de razonamiento extendido.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito ("thinking"). Estos extremos figuran como no disponibles.
- No se documenta generacion de texto libre como funcionalidad soportada, pese a estar construido sobre un modelo de lenguaje.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo oficial del repositorio enruta una incidencia a los equipos de facturacion, tecnico o ventas, pasando el ticket y el nivel del cliente como estado y las areas como opciones con descripcion. Es adecuado porque devuelve probabilidades calibradas que permiten fijar un umbral de confianza y derivar a revision humana los casos ambiguos.
- Analisis de sentimiento por opciones: con una entrada como "The film was excellent." y las opciones `negative` / `positive` en la categoria `general_sentiment`, el modelo devuelve la probabilidad de cada clase sin generar texto, lo que simplifica su integracion en pipelines.
- Clasificacion de intenciones en asistentes de voz multilingues: el modelo cubre 19 idiomas declarados y el autor reporta evaluacion en 51 idiomas sobre MASSIVE con 20 opciones por fila, lo que lo hace util para enrutar intenciones en un asistente desplegado en varios mercados.
- Analisis de documentos largos sin truncado: con 25.600 tokens de presupuesto de entrada y 98,3 % de acierto reportado en items reales a 24K tokens, permite clasificar contratos, informes o expedientes completos en una sola llamada, evitando el troceado y la perdida de contexto.
- Etiquetado y anotacion asistida con control de calidad: al emitir probabilidades calibradas, permite seleccionar automaticamente solo las filas de alta confianza y enviar el resto a anotadores humanos, reduciendo el coste de anotacion sin sacrificar precision.
- Moderacion y categorizacion de contenido: la formulacion de opciones multiples permite definir categorias de politica con descripciones y obtener una distribucion de probabilidad sobre ellas para priorizar la revision.
- Enrutado de consultas en pipelines RAG: dado un contexto recuperado mas una pregunta del usuario, el modelo puede decidir que herramienta, indice o base de conocimiento debe atender la consulta.
- Inferencia local en Apple Silicon: al ser pesos MLX bf16 de 1,5 GB, permite ejecutar clasificacion por lotes en un Mac sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor corresponden a tareas de decision y clasificacion, no a los benchmarks generativos habituales (MMLU, HumanEval, GSM8K), para los que no se han publicado resultados en la informacion disponible.

| Evaluacion | Resultado de v3 (MLX bf16) | Referencia | Notas |
|---|---|---|---|
| MASSIVE intent, exactitud macro | 71,7 % | Laya multilingual: 40,1 % | 51 de 51 idiomas ganados; 100 filas de test por idioma, 20 opciones por fila |
| Decisiones tipadas (2.000 items) | 79,2 % | Jev: +6,4 puntos por debajo; 2B v2: +5,7 puntos por debajo | v3 in-domain; Jev zero-shot |
| Brier score frente a Jev | 3,2× menor | Jev | v3 in-domain; Jev zero-shot |
| Contexto largo a 24K tokens | 98,3 % de items reales correctos | Controles sin evidencia: al nivel del azar | Suite `long_grid_plus`, preregistrada; 320 items por bin de longitud, 1.280 a 24K |
| Paridad de formato | 240 de 240 filas identicas a la referencia PyTorch FP32 | Referencia FP32 | Fixture de 240 filas mixtas de 22 categorias, ingles y chino; mide acuerdo entre formatos, no exactitud |
| Paridad en contexto largo | 6 de 6 prompts de ~16K y ~25,6K tokens | Referencia FP32 | Prompts adicionales |

## Requisitos de hardware

- El repositorio es exclusivamente MLX, por lo que el destino previsto es Apple Silicon. No se distribuyen pesos GGUF ni safetensors para CUDA en esta version.
- Peso de los pesos: 1,5 GB en bf16 (752.393.024 parametros). El runtime emplea activaciones float32, lo que anade consumo adicional no cuantificado en la informacion disponible.
- El runtime limita por defecto la cache de buffers liberados de MLX a 2 GiB mediante `--cache-limit-gib`, parametro ajustable.
- Estimacion orientativa: un equipo Apple Silicon con memoria unificada de 16 GB deberia ejecutar el modelo con holgura; con 8 GB es probable que funcione, aunque no hay confirmacion oficial en la informacion disponible. Cabe en hardware de consumo de gama actual.
- GPU recomendadas: no disponibles en el sentido de CUDA; el autor solo valida Apple Silicon. Para A100, H100 o RTX 4090 habria que reconvertir el modelo, ya que estos pesos no estan preparados para esas plataformas.
- Opciones de despliegue: MLX y mlx-lm (con soporte de `qwen3_5`), mas el script `jev_style_decision_mlx.py` incluido. vLLM, TGI, llama.cpp y Ollama no estan soportados por este repositorio.
- Latencia y throughput: no disponibles. Las unicas cifras de rendimiento publicadas son de exactitud y de paridad, no de velocidad.
- Instalacion: `requirements.txt` con mlx, mlx-lm (con soporte de qwen3_5), tokenizers y numpy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3-MLX-bf16 | 752.393.024 | 25.600 tokens de entrada | 71,7 % macro en MASSIVE (51 idiomas); 79,2 % en 2.000 decisiones tipadas; 98,3 % a 24K | Apache-2.0 | Pesos MLX bf16 en HuggingFace |
| Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16 | 2B (aproximado) | No disponible | 5,7 puntos por debajo de v3 en 2.000 decisiones tipadas | No disponible en la informacion consultada | Pesos MLX bf16 |
| Jev-Style-Qwen3.5-2B-Decision (v1, GGUF) | 2B (aproximado) | No disponible | 6,4 puntos por debajo de v3 en 2.000 decisiones tipadas; Brier score 3,2× peor | No disponible en la informacion consultada | Pesos GGUF |
| Laya multilingual | No disponible | Presupuestos por defecto de 512 / 1.024 tokens | 40,1 % macro en MASSIVE, re-ejecutado por el autor sobre filas identicas | No disponible en la informacion consultada | Checkpoint oficial |
| Qwen/Qwen3.5-0.8B | 0,8B (aproximado) | No disponible | No disponible | Apache-2.0 | Modelo base generativo |

La comparacion con Laya esta limitada por el presupuesto de contexto: los tramos largos de la suite de contexto superan los 512 / 1.024 tokens por defecto de Laya, de modo que solo se comparo en el rango corto. La comparacion con Jev y con el 2B v2 tampoco es equivalente en regimen: v3 se evalua in-domain y Jev zero-shot.

## Limitaciones y advertencias

- Los pesos son Apache-2.0, pero el autor advierte de que parte de los datos de entrenamiento tiene terminos restrictivos o poco claros, y que algunas filas son salidas de modelos de OpenAI y Anthropic. Esto puede afectar al uso comercial y conviene revisar la seccion "Training data and licences" de la model card principal antes de desplegarlo en produccion.
- El modelo no esta afiliado a TypeSafe AI, a Jev, a los autores de Laya ni al equipo de Qwen, segun declara el propio autor.
- Las comparaciones de rendimiento no son homogeneas: v3 es in-domain en 14 locales de MASSIVE y held-out en 37, y la comparacion con Jev es in-domain frente a zero-shot. Los margenes reportados pueden no trasladarse a un dominio nuevo.
- La comparacion multilingue con Laya solo cubre el rango corto de contexto (512 / 1.024 tokens), por lo que la ventaja declarada en contexto largo no esta contrastada contra ese competidor.
- Discrepancia entre los 19 idiomas declarados en los metadatos del repositorio y los 51 idiomas evaluados que menciona la model card. Conviene verificar el alcance real por idioma antes de asumir cobertura.
- Las entradas que superan el presupuesto lanzan un error en lugar de truncarse. En produccion esto exige gestionar explicitamente los casos fuera de limite.
- Al ser un modelo de clasificacion con probabilidades, el riesgo principal no es la alucinacion de texto sino la sobreconfianza en una categoria incorrecta. Las temperaturas de calibracion estan ajustadas en `readout_config.json`, pero la calibracion puede degradarse fuera de dominio.
- No hay resultados publicados para benchmarks generativos estandar (MMLU, HumanEval, GSM8K) ni informacion sobre sesgos mas alla de la composicion del dataset.
- El repositorio es exclusivamente MLX, sin variantes GGUF ni CUDA, lo que restringe el despliegue a Apple Silicon o a una reconversion manual.
- Modelo muy reciente y sin traccion comunitaria en el momento de la consulta (0 descargas, 0 likes), por lo que no existe validacion independiente de los resultados declarados.
- No se documenta soporte de tool calling, agentes, vision ni audio; no debe asumirse ninguna de estas capacidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX-bf16
- Modelo base (pesos originales v3): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Model card principal, con protocolos, datos de entrenamiento y licencias: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3#input-format-and-readout
- Version v1, 2B, en GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Version v2, 2B, en MLX bf16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio web del proyecto: https://jevstyle.com
- Contacto del autor: yanchaoliang369@gmail.com
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente paginas de inicio de buscadores sin contenido util sobre el modelo.
