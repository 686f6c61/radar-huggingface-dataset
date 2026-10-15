# damopierog/nanochat-depth-sweep

## Resumen

nanochat-depth-sweep es una familia de modelos GPT pequenos entrenados con nanochat (el framework de Andrej Karpathy) por damopierog como parte de un Major Qualifying Project de la WPI centrado en deep learning y sistemas dinamicos. El proyecto trata el residual stream (el estado oculto que se transmite de bloque a bloque) como una trayectoria y estudia como evoluciona con la profundidad; por eso todos los modelos se entrenan de forma identica y la profundidad (numero de bloques transformer) es la unica variable que cambia. La familia cubre 19 configuraciones, desde d1 (12,8 M de parametros) hasta d24 (1.384,1 M de parametros totales), pasando por profundidades intermedias de 19 a 23 que estan en progreso.

Cada profundidad existe en dos variantes: base, preentrenada sobre texto web para predecir el siguiente token (continua texto, no sigue instrucciones), y chat, que parte de la base y aplica un SFT corto sobre conversaciones de ejemplo para responder como asistente. Esta estructura convierte el repositorio en un banco de pruebas controlado para estudiar escalado por profundidad, dinamica de estados ocultos e interpretabilidad, mas que en un modelo de produccion.

Todos los modelos usan el mismo GPT de nanochat sin cambios, con contexto de 2.048 tokens, tokenizer BPE de 32.768 tokens y licencia MIT. El modelo mas grande publicado (d24) alcanza un CORE de 0,267 y un ChatCORE de 0,204, con un val bpb de 0,718. El repositorio no registra descargas ni likes, lo que refleja su caracter de proyecto academico y experimental reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT de nanochat) |
| Parametros totales | De 12,8 M (d1) a 1.384,1 M (d24) segun profundidad |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (repositorio con checkpoints de nanochat en base_checkpoints) |

Nota: el campo "params (total)" incluye las tablas de embeddings (una fila por token del vocabulario), que son operaciones de busqueda y no de computo. La columna "matrices + head" del autor cuenta solo los pesos que multiplican matrices y es la que nanochat usa para dimensionar el entrenamiento. Para d24, los parametros de matrices mas la cabeza son 729,8 M.

## Arquitectura y entrenamiento

La arquitectura es el GPT de nanochat sin modificaciones: un transformer decoder-only estandar al que se anaden varias innovaciones tecnicas. Usa rotary position embeddings y QK norm (normalizacion de queries y keys antes de la atencion); MLPs ReLU al cuadrado (ReLU y luego elevado al cuadrado) de 4x de ancho; atencion de ventana deslizante en un patron repetido short-short-short-long, donde el ultimo bloque siempre ve el contexto completo de 2.048 tokens; y value embeddings, que en bloques alternos mezclan un embedding por token en los values de la atencion para dar acceso directo a la identidad del token. Ademas incorpora x0 re-injection (antes de cada bloque el estado se reescala y se le vuelve a sumar el embedding inicial mediante `x ← λ_l·x + μ_l·x0`, con λ y μ aprendidos), smear (una pequena compuerta aprendida que mezcla el embedding de cada token con el del token anterior), backout (antes de la cabeza de salida se resta un multiplo aprendido de la salida del bloque central) y logits con soft-cap en ±15. La reinyeccion x0 es especialmente relevante para quien estudia la dinamica del estado oculto, porque la entrada de un bloque no es simplemente la salida del bloque anterior. El ancho es profundidad × 64 redondeado hacia arriba a multiplos de 128, de modo que los modelos mas profundos tambien son mas anchos.

El preentrenamiento usa ClimbMix (texto web), secuencias de 2.048 tokens y un tokenizer BPE de 32.768 tokens entrenado sobre los mismos datos. Cada modelo ve 8 tokens por parametro de matriz, ligeramente por debajo del optimo de computo; el tamano de batch y los learning rates se fijan automaticamente a partir del tamano del modelo. Se emplea el optimizador Muon para las matrices y AdamW para los embeddings, computo en bf16 y sin FP8. El entrenamiento se hizo en GPUs NVIDIA L40S del cluster Turing de WPI: una GPU para d1-d12, dos para d13-d14 y cuatro para d15-d18 y d24 (d24 tardo 19 horas); el numero de GPUs no altera las matematicas del entrenamiento. El SFT consiste en una pasada sobre una mezcla de SmolTalk (conversaciones generales), MMLU (opcion multiple, 3 copias) y GSM8K (matematicas con una herramienta de calculadora, 4 copias), partiendo de los pesos y el estado del optimizador del modelo base. Reentrenar con la misma configuracion produce modelos igual de buenos pero no identicos, ya que la aritmetica en GPU no es determinista.

## Capacidades

- Generacion de texto autoregresiva (modelos base): continuacion de texto prediciendo el siguiente token.
- Dialogo tipo asistente (modelos chat): tras el SFT responden como asistente en conversaciones de ejemplo.
- Razonamiento en tareas de opcion multiple: evaluado mediante CORE sobre 22 tareas (HellaSwag, ARC y otras).
- Matematicas basicas con herramienta: los modelos chat se entrenaron con GSM8K usando una calculadora como herramienta.
- Generacion de codigo a nivel introductorio: incluido en la evaluacion ChatCORE via HumanEval.
- Uso de tool calling / function calling: parcial, limitado al formato de herramienta de calculadora visto en el SFT (GSM8K).
- Capacidades multilingues: no disponibles; solo ingles.
- Capacidad especial de "thinking mode", vision o audio: no disponible.

## Casos de uso

- Investigacion sobre escalado por profundidad: comparar el residual stream como trayectoria entre d1 y d24, entrenando todos los modelos de forma identica para aislar el efecto de la profundidad.
- Interpretabilidad de redes transformer: analizar como la reinyeccion x0, el smear, el backout y las value embeddings alteran la dinamica de los estados ocultos bloque a bloque.
- Ensenanza de LLMs desde cero: usar el repositorio como material didactico para reproducir las distintas etapas (tokenizer, pretraining, SFT) sobre modelos de 12 M a 1.400 M de parametros.
- Experimentos de ablacion controlada: dado que solo cambia la profundidad, sirve para estudiar la relacion entre profundidad, val bpb y CORE sin confundir variables.
- Generacion de texto en ingles a pequena escala (variantes base): continuacion de texto donde no se requiere seguir instrucciones.
- Asistentes conversacionales ligeros en ingles (variantes chat): prototipos de dialogo con contexto de 2.048 tokens para estudiar el comportamiento del SFT sobre modelos pequenos.
- Pruebas de investigacion reproducibles en hardware modesto: los modelos pequenos caben en una sola GPU y permiten iterar rapido sobre hipotesis.

## Benchmarks y rendimiento

El autor publica metricas propias (val bpb, CORE y ChatCORE) para cada profundidad. CORE es la media sobre 22 tareas de benchmark centrada de modo que 0 es acierto aleatorio y 1 es perfecto. ChatCORE aplica la misma idea a modelos chat sobre ARC-Easy, ARC-Challenge, MMLU, GSM8K y HumanEval.

| Profundidad | Ancho | Cabezas | Params totales | Params (matrices + head) | Tokens pretrain | Val bpb (menor mejor) | CORE | ChatCORE |
|---|---|---|---|---|---|---|---|---|
| d1 | 128 | 1 | 12,8 M | 4,4 M | 0,04 B | 1,496 | −0,016 | 0,006 |
| d3 | 256 | 2 | 35,9 M | 10,7 M | 0,09 B | 1,214 | 0,033 | 0,002 |
| d5 | 384 | 3 | 71,8 M | 21,4 M | 0,17 B | 1,075 | 0,063 | 0,029 |
| d7 | 512 | 4 | 122,7 M | 38,8 M | 0,31 B | 0,982 | 0,087 | 0,056 |
| d9 | 640 | 5 | 191,0 M | 65,2 M | 0,52 B | 0,928 | 0,108 | 0,069 |
| d12 | 768 | 6 | 286,3 M | 110,1 M | 0,88 B | 0,868 | 0,147 | no disponible |
| d15 | 1024 | 8 | 524,3 M | 222,3 M | 1,78 B | 0,805 | 0,189 | no disponible |
| d18 | 1152 | 9 | 701,9 M | 324,4 M | 2,60 B | 0,777 | 0,207 | no disponible |
| d24 | 1536 | 12 | 1.384,1 M | 729,8 M | 5,84 B | 0,718 | 0,267 | 0,204 |

Advertencias del autor: CORE varia entre ejecuciones (d14, entrenado dos veces con ajustes identicos, obtuvo 0,161 y 0,167). Las profundidades 19-23 estan en progreso y las versiones chat de d10-d18 aun no estan entrenadas. No se han publicado resultados de benchmarks comparativos externos (MMLU, HumanEval o GSM8K desglosados) mas alla de estas metricas agregadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos van de 12,8 M a 1.384,1 M de parametros totales. En bf16, el modelo mayor (d24) ocupa aproximadamente 2,8 GB solo en pesos; en fp32, unos 5,5 GB. Los modelos pequenos (d1-d12) requieren menos de 1 GB.
- GPU recomendadas: el entrenamiento se hizo con NVIDIA L40S. Para inferencia, cualquier GPU con suficiente VRAM sirve; d1-d12 entrenaron en una sola GPU en el cluster Turing de WPI.
- GPU de consumo: si, la familia completa cabe en GPU de consumo. Los modelos de menor tamano (hasta d12, 286 M) son triviales; incluso d24 (1,4 B en bf16) cabe en GPUs con 8-12 GB o mas (RTX 3060/4070/4090).
- Opciones de despliegue: el repositorio replica el directorio de datos de nanochat (`base_checkpoints`) y esta pensado para usarse con el framework nanochat. El soporte de vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos publicados por el autor frente a modelos de referencia. A continuacion se compara estructuralmente con la familia GPT-2, que es el objetivo de referencia que nanochat usa habitualmente para medir progreso.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nanochat-depth-sweep d24 | 1.384,1 M | 2.048 tokens | MIT | Objetivo de investigacion academica; CORE 0,267 |
| nanochat-depth-sweep d16 | 536,9 M | 2.048 tokens | MIT | Tamaño entre GPT-2 medium y large |
| GPT-2 large | 774 M | 1.024 tokens | MIT | Referencia de la comunidad, sin variantes chat |
| GPT-2 XL | 1.548 M | 1.024 tokens | MIT | Similar en tamano a d24 |

Los datos de rendimiento de GPT-2 frente a CORE (metrica interna de nanochat) no estan disponibles en la informacion proporcionada, por lo que no se ofrece una comparacion numerica directa.

## Limitaciones y advertencias

- Idiomas: solo ingles; no hay soporte multilingue.
- Modelos base: continuan texto, no siguen instrucciones. Para uso conversacional hay que emplear las variantes chat.
- Cobertura incompleta: las versiones chat de d10-d18 no estan entrenadas y las profundidades 19-23 estan en progreso.
- Razonamiento limitado: incluso el modelo mayor (d24) obtiene un CORE de 0,267 y un ChatCORE de 0,204 sobre una escala centrada donde 1 es perfecto, lo que indica capacidad muy por debajo de modelos grandes.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Reproducibilidad: reentrenar con la misma configuracion no genera pesos identicos (aritmetica de GPU no determinista) y CORE varia entre ejecuciones.
- Riesgo de alucinacion: no se documenta mitigacion especifica; al ser modelos pequenos y entrenados con poco SFT, la propension a inventar es alta.
- Sesgos: no se documenta analisis de sesgos en la model card.
- Licencia: MIT, permisiva para uso comercial, pero no se ofrecen garantias ni se documentan evaluaciones de seguridad.
- Produccion: no hay datos publicados de latencia, throughput ni soporte confirmado en servidores de inferencia (vLLM, TGI, llama.cpp), por lo que no se recomienda para despliegue en produccion sin validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/damopierog/nanochat-depth-sweep
- Archivos del repositorio: https://huggingface.co/damopierog/nanochat-depth-sweep/tree/main
- Codigo de entrenamiento y scripts: https://github.com/djadczak956/nanochat (runs/turing_base.sh, runs/turing_sft.sh)
- Framework nanochat (Andrej Karpathy): https://github.com/karpathy/nanochat
- Ficha en free2aitools: https://free2aitools.com/model/damopierog/nanochat-depth-sweep
- Reproduccion independiente de nanochat: https://github.com/marcinbogdanski/nanochat-repro
- Articulo divulgativo sobre nanochat: https://www.scriptbyai.com/nanochat-open-chatgpt-alternative/
