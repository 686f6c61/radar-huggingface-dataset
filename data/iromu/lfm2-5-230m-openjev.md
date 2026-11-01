# iromu/LFM2.5-230M-openjev

## Resumen

LFM2.5-230M-openjev es un ajuste fino supervisado del modelo base LiquidAI/LFM2.5-230M-Base, publicado por el usuario iromu en HuggingFace. No es un modelo de propósito general: es un emisor de decisiones tipadas ("typed-decision") entrenado para responder a un prompt estructurado con una única letra de etiqueta, terminando el turno en EOS. Forma parte de la familia de modelos `-openjev`, junto a sus hermanos mayores Qwen3-0.6B-openjev y Qwen2.5-1.5B-openjev.

El modelo resuelve un problema muy concreto: dado un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas, seleccionar el argmax como una sola letra. Con 229.693.184 parámetros, está pensado para despliegue en dispositivo o edge, no como sustituto de modelos mayores. Su interés actual radica en que demuestra que un modelo de 230M puede aprender el formato de decisión de forma fiable mediante LoRA, pasando de un 0% de emisión de letra en el modelo base a un 100% tras el ajuste.

La relevancia práctica es doble: por un lado, ofrece una alternativa de huella mínima para tareas de clasificación y selección de etiqueta única; por otro, su evaluación con JevBench (coherencia probabilística) revela una limitación importante: acierta el argmax con frecuencia (77,3%) pero su lectura de probabilidades está mal calibrada (38,5/100 global). Es, por tanto, un buen clasificador de etiqueta y un mal estimador de distribuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2 (familia LiquidAI LFM2.5); el ajuste es LoRA fusionado sobre el modelo base |
| Parametros totales | 229.693.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la longitud maxima de secuencia usada en entrenamiento fue 4096 tokens) |
| Tipos de cuantizacion | GGUF (repositorio separado `iromu/LFM2.5-230M-openjev-GGUF`, p. ej. Q4_K_M); pesos BF16 en el repo principal; no hay checkpoint NVFP4 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 fusionado); GGUF en el repo de cuantizaciones |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-230M-Base, un transformer de la familia LFM2.5 de LiquidAI con 229,7M de parametros. Sobre el se aplico un ajuste fino supervisado (SFT) con LoRA de rango 32, alpha 32 y dropout 0,05, usando NeMo-RL. Los modulos objetivo del adaptador fueron `*.proj`, `*.w1`, `*.w2` y `*.w3`, lo que alcanza tanto las proyecciones de atencion como las matrices feed-forward del MLP (un patron solo `*.proj` habria dejado el MLP con los pesos base). La longitud maxima de secuencia fue de 4096 tokens, en precision bfloat16, con optimizador AdamW, learning rate 5e-5, weight decay 0,01, warmup lineal de 100 pasos y decaimiento coseno hasta 1e-6. El batch global fue de 64 (micro batch 2), con una epoca completa: 1191 pasos sobre 76.224 filas, validando cada 125 pasos.

El entrenamiento uso la particion `train` del corpus de decisiones tipadas ZefanCai/Open-Jev (snapshot `c67699e13d0ae25e35b77165a4b6b079bedc8aba`). Cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribucion de probabilidad sobre ellas; el objetivo es el argmax escrito como una sola letra de etiqueta. Las filas con empate en el objetivo (sin argmax) se excluyen del calculo de perdida en lugar de entrenarse con una suposicion. La perdida se enmascara al turno del asistente mediante la plantilla de chat de decision, que renderiza el turno como exactamente su contenido (una letra) sin bloque de pensamiento, de modo que la respuesta es el primer token generado y el turno termina en EOS. No se aplico GRPO: segun el autor, el modelo SFT ya esta en el techo de las filas que GRPO muestrea, por lo que la ventaja intragrupo es cero y GRPO no aportaria gradiente.

## Capacidades

- Seleccion de etiqueta unica en tareas de decision tipada y clasificacion.
- Emision fiable del formato de respuesta: una sola letra de etiqueta como primer token generado, con terminacion en EOS.
- Respuesta a prompts estructurados con estado, pregunta y conjunto de opciones.
- Ajuste al contrato de la plantilla de chat de decision (sin bloque de pensamiento).
- Capacidades multilingues limitadas al ingles.
- No esta disenado como modelo conversacional general ni como sustituto de modelos mayores.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Clasificacion de etiqueta unica en pipelines de produccion: el modelo recibe un estado y un conjunto de opciones y devuelve una letra, lo que permite integrarlo como un paso de clasificacion determinista con `max_new_tokens` minimo.
- Enrutamiento de decisiones en sistemas de agentes: dado un estado y un conjunto de acciones posibles, selecciona la accion argmax como etiqueta, sirviendo de modulo de decision ligero dentro de un sistema mayor.
- Despliegue en dispositivo o edge: con 230M de parametros y cuantizaciones GGUF, cabe en hardware de baja capacidad y puede ejecutarse con llama.cpp sin GPU dedicada.
- Triaje y seleccion de categoria en entornos con recursos limitados: por ejemplo, asignar una categoria a un caso descrito en texto eligiendo entre opciones predefinidas.
- Evaluacion de coherencia probabilistica: el modelo sirve como objeto de estudio para pruebas metamorficas con JevBench, comparando su comportamiento con el de sus hermanos mayores.
- Prototipado rapido de tareas de decision: al ser un ajuste pequeno y de licencia Apache 2.0, permite experimentar con el formato de decision tipada antes de escalar a modelos mayores de la misma familia.
- Filtrado o preetiquetado en anotacion de datos: seleccionar la opcion mas probable en filas de un corpus de decisiones para acelerar la revision humana.

## Benchmarks y rendimiento

Los datos de validacion proporcionados por el autor (particion `validation` de Open-Jev, 3.495 filas, decodificacion greedy, tope de 384 tokens) son los siguientes:

| Modelo | Cuantizacion | Tope | n | Letra emitida | Letra correcta | Delta vs base |
|---|---|---|---|---|---|---|
| LiquidAI/LFM2.5-230M-Base | BF16 | 384 tok | 3495 | 0/3495 (0,0%) | 0/3495 (0,0%) | (sin predecesor) |
| LFM2.5-230M-openjev | BF16 | 384 tok | 3495 | 3495/3495 (100,0%) | 2700/3495 (77,3%) | +77,3 pp |

Puntuacion de coherencia probabilistica en JevBench (suite `jevbench-mini`, 240 casos, 50 relaciones puntuadas, tolerancia 0,05, temperatura 1,0):

| Dimension | Puntuacion |
|---|---|
| Global | 38,5 / 100 |
| REP (consistencia de representacion) | 60,6 |
| BAT (independencia de lote) | 25,8 |
| MEA (coherencia de medida de probabilidad) | 15,4 |
| LOG (coherencia logica) | 68,3 |
| CHO (coherencia de conjunto de eleccion) | 22,2 |

El autor senala que la puntuacion esta dominada por MEA y CHO: el emisor de letras es demasiado confiado y no preserva la media bajo transformacion, por lo que su coherencia metamorfica queda por debajo del hermano Qwen3-0.6B-openjev (44,5 en la misma suite). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 229,7M de parametros en BF16, el peso ocupa aproximadamente 0,46 GB; en cuantizacion Q4_K_M, en torno a 0,15-0,2 GB. La VRAM total depende del contexto y del runtime, pero es del orden de menos de 1 GB en BF16 y de unos pocos cientos de MB en GGUF.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja lo ejecutan sin problema.
- Cabe en GPU consumer: si, en cualquier GPU consumer con al menos 1-2 GB de VRAM libre; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (el autor documenta `llama-cli -hf iromu/LFM2.5-230M-openjev-GGUF:Q4_K_M`), transformers con `AutoModelForCausalLM` en BF16, y Ollama u otros runtimes compatibles con GGUF. No se documenta soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras de latencia ni de throughput de servicio; el autor indica que las mediciones son de decodificacion greedy en un solo flujo, no throughput de servido. Al emitir un unico token por respuesta, la latencia por peticion es muy baja en terminos de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-230M-openjev | 229,7M | No disponible (entrenado a 4096) | 77,3% de letra correcta en Open-Jev; JevBench 38,5/100 | Apache 2.0 | HuggingFace (BF16 y GGUF) |
| Qwen3-0.6B-openjev | No disponible en la informacion proporcionada | No disponible | JevBench 44,5/100 (misma suite) | No disponible en la informacion proporcionada | HuggingFace, hermano de la familia `-openjev` |
| Qwen2.5-1.5B-openjev | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, hermano de la familia `-openjev` |

Los dos modelos de la familia Qwen `-openjev` se mencionan como hermanos mayores en la model card, pero no se aportan sus especificaciones completas ni sus resultados de precision en Open-Jev, por lo que la comparacion se limita a los datos disponibles.

## Limitaciones y advertencias

- Calibracion deficiente: aunque el argmax es correcto en el 77,3% de las filas, la lectura de probabilidades esta mal calibrada (MEA 15,4 y CHO 22,2 en JevBench), por lo que no debe usarse como estimador de distribuciones de probabilidad.
- Sobreconfianza: el autor indica que el emisor de letras es demasiado confiado y no preserva la media bajo transformacion.
- Ambito restringido: no es un sustituto general de modelos mayores; esta disenado exclusivamente para decisiones tipadas y clasificacion de etiqueta unica.
- Idioma: solo soporta ingles.
- Formato rigido: depende de la plantilla de chat de decision; fuera de ese contrato, el comportamiento no esta garantizado.
- Riesgo de alucinacion: no se documenta explicitamente, pero al ser un modelo pequeno y especializado, la seleccion de etiqueta puede ser incorrecta en el 22,7% de los casos medidos.
- Licencia: Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas, aunque conviene verificar los terminos del modelo base LiquidAI/LFM2.5-230M-Base.
- Sin checkpoint NVFP4: el autor indica que el runtime de servicio en su host no tiene clase de modelo `lfm2`, por lo que la cuantizacion disponible es el conjunto GGUF.
- Datos de benchmarks limitados: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/LFM2.5-230M-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/LFM2.5-230M-openjev-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench (repositorio): https://github.com/JevBench/jevbench
