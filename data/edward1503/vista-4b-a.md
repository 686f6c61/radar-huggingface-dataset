# edward1503/VISTA-4B-A

## Resumen

VISTA-4B-A es un adaptador LoRA de lenguaje (no multimodal en sus pesos entrenados) construido sobre el modelo vision-lenguaje post-entrenado Qwen3.5-4B de Unsloth. Lo desarrolla el usuario edward1503 y su funcionamiento es poco convencional: no genera texto libre, sino que puntua en una sola pasada directa las letras candidatas de una pregunta de eleccion multiple tipada y devuelve una eleccion junto con probabilidades normalizadas. Es, por tanto, un modelo de decision para tareas de evaluacion de vision-lenguaje, no un asistente conversacional al uso.

El adaptador entrena 32.464.896 parametros de lenguaje con rango 16 y alpha 32, manteniendo congelados el cabezal LM nativo, el codificador visual y el merger visual. El backbone cargado tiene 4.539.265.536 parametros y, sumado al adaptador sin fusionar, el modelo alcanza 4.571.730.432 parametros (aproximadamente 4,572B). La ventana de secuencia maxima en la ruta de inferencia es de 32.768 tokens y se aceptan entre una y cuatro imagenes por peticion.

Su relevancia es acotada pero especifica: el autor reporta una puntuacion de 65,493670 en la suite publica Decision Index Vision 0.3, con 12.210 de 12.210 peticiones cubiertas en 11 benchmarks. Se trata de un resultado local de suite publica, sin rango oficial ni reclamacion de SOTA, y pendiente de evaluacion por parte de los mantenedores. La licencia es Apache 2.0 y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3.5-4B post-entrenado) con adaptador LoRA de lenguaje |
| Parametros totales | 4.571.730.432 (aproximadamente 4,572B), incluyendo 32.464.896 del adaptador LoRA sin fusionar |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens de secuencia maxima en la ruta de inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT sin fusionar) |
| Modelo base | unsloth/Qwen3.5-4B (revision fijada 3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636) |
| Rango y alpha del LoRA | rango 16, alpha 32 |
| Imagenes por peticion | 1 a 4 |
| Limite de pixeles por imagen | 1.638.400 en evaluacion; 262.144 en entrenamiento |
| Libreria | peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado exclusivamente sobre el stack de lenguaje del Qwen3.5-4B post-entrenado. El codificador visual, el merger visual y el cabezal LM nativo permanecen congelados; no hay cabezal de decision personalizado, ni fase de RL, ni checkpoint externo de modelo de decision. La lectura final de puntuaciones se hace con el ultimo estado oculto y las filas nativas del cabezal LM en FP32, seguidas de softmax sobre las letras candidatas. El loader fija el backbone de Unsloth, cuyos dos shards de pesos fueron verificados como identicos por SHA-256 a la revision oficial de Qwen/Qwen3.5-4B; los ficheros de procesador y configuracion no se declaran identicos entre repositorios.

El entrenamiento usa etiquetas duras con entropia cruzada sobre las letras candidatas, una epoca, 2.500 actualizaciones del optimizador, microbatch 1 con acumulacion 8, tasa de aprendizaje 5e-5 y semilla 3407. Los datos provienen de tres fuentes en sus splits de entrenamiento originales: A-OKVQA (8.000 ejemplos de entrenamiento, 400 de desarrollo), ChartQA (6.000 y 300) y TextVQA (6.000 y 300). El conjunto de desarrollo de 1.000 filas es disjunto por grupo de imagen pero procede de las mismas tres fuentes, e incluye distractores construidos para ChartQA y TextVQA. La precision final en desarrollo es del 90,9%, con NLL de 0,266434 y CE de entrenamiento promediada sobre las actualizaciones 2401-2500 de 0,321315; el autor advierte explicitamente que no son puntuaciones de VQA abierta.

Como innovacion tecnica destaca el esquema de decision: en lugar de generar, el modelo puntua todas las opciones legales en una unica pasada directa, rechaza el desbordamiento de contexto en vez de truncar y aplica un renderizado de prompt fijo entre benchmarks. Para preguntas solo de imagen se anade de forma uniforme un bloque con las letras candidatas legales, sin reconstruir el texto de las opciones. El adaptador exportado contiene 496 tensores identicos al delta entrenado; al recargarlo en un proceso limpio reprodujo las 277 decisiones diagnosticas con diferencia maxima de probabilidad 0. Una exportacion fusionada en BF16 con `merge_and_unload(safe_merge=True)` altero 29 de esas 277 decisiones (corrigio 5 y rompio 12), por lo que los pesos y resultados publicados corresponden al adaptador sin fusionar.

## Capacidades

- Puntuacion de eleccion multiple tipada: recibe una pregunta con opciones y devuelve la letra elegida junto con probabilidades normalizadas.
- Procesamiento de imagenes: acepta de 1 a 4 imagenes por peticion, con un limite de 1.638.400 pixeles por imagen en evaluacion.
- Razonamiento sobre graficos y tablas: el entrenamiento incluye ChartQA, orientado a preguntas sobre representaciones graficas.
- Comprension de texto en imagen: cubierto mediante TextVQA en el entrenamiento.
- Conocimiento visual general: cubierto mediante A-OKVQA.
- Contexto largo: secuencia maxima de 32.768 tokens, con rechazo explicito del desbordamiento en lugar de truncado.
- Auditoria de entrada: la tupla devuelta incluye la respuesta tipada y un registro de auditoria de la entrada.
- Generacion de texto libre: no es una capacidad del modelo; el autor indica explicitamente que la generacion arbitraria de texto o un motor de servicio distinto no sustituyen a esta lectura de puntuaciones.
- Tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.

## Casos de uso

- Evaluacion de modelos vision-lenguaje en suites de eleccion multiple: el modelo actua como motor de decision dentro del pipeline `decision-index vision pipeline`, puntuando cada peticion de la suite con el backend `VistaEngine`. Es adecuado porque su readout esta disenado especificamente para este formato y rechaza el desbordamiento en lugar de truncar.
- Reproduccion de resultados de investigacion: con el commit del kit oficial fijado y el entorno de `requirements.txt`, permite reproducir la ejecucion de 12.210 peticiones sobre 11 benchmarks y comparar puntuaciones de forma controlada.
- Auditoria de pipelines de VQA: la devolucion incluye un registro de auditoria de entrada, lo que facilita verificar hashes de texto, rejillas de imagen, tokens de imagen y posiciones de candidatos en cada peticion.
- Preguntas sobre graficos y diagramas: gracias al entrenamiento con ChartQA, puede emplearse para seleccionar la respuesta correcta en tareas de lectura de valores, tendencias y comparaciones en representaciones graficas.
- Comprension de texto en escenarios reales: el entrenamiento con TextVQA lo hace util para tareas donde la respuesta depende de texto presente en la imagen, como carteles, etiquetas o capturas.
- Preguntas de conocimiento visual general: con A-OKVQA como fuente, sirve para tareas de seleccion de respuesta sobre escenas y objetos cotidianos.
- Validacion de exportaciones y fusiones de adaptadores: el conjunto diagnostico de 277 decisiones permite comprobar si una fusion BF16 altera el comportamiento respecto al adaptador sin fusionar antes de desplegar.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decision Index Vision 0.3 (suite publica) | 65,493670 |
| Peticiones cubiertas | 12.210 / 12.210 |
| Benchmarks incluidos | 11 |
| Precision en desarrollo (1.000 filas) | 90,9% |
| NLL en desarrollo | 0,266434 |
| CE de entrenamiento (promedio actualizaciones 2401-2500) | 0,321315 |
| Paridad del adaptador recargado (277 decisiones) | 277/277, diferencia maxima de probabilidad 0 |
| Decisiones alteradas tras fusion BF16 | 29/277 (5 corregidas, 12 rotas) |

No se han publicado en la informacion disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con modelos alternativos. El autor indica que los resultados privados, la latencia oficial en RTX PRO 6000 y la admision en el leaderboard estan pendientes de evaluacion por los mantenedores, y no se reclama ningun rango oficial ni estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el backbone de 4,539B parametros en BF16 requiere del orden de 9 GB solo para pesos, a los que se suman el adaptador, el codificador visual, el procesador de imagenes y las activaciones asociadas a secuencias de hasta 32.768 tokens y hasta 4 imagenes por peticion.
- GPU validadas: el autor menciona una RTX 5060 Ti en su ejecucion de referencia y una RTX PRO 6000 para la medicion de latencia oficial, aun pendiente. El codigo soporta dispositivos CUDA en general en lugar de fijar una GPU concreta.
- Familias de GPU no validadas: el autor advierte que otras familias requieren validacion numerica y de latencia independiente.
- Entorno de ejecucion validado: Linux/CUDA, Python 3.12, PyTorch 2.9.1+cu128, Transformers 5.17.0, Unsloth 2026.10.8 y PEFT 0.21.2, con el fallback de convolucion causal de referencia de PyTorch. Un kernel o backend optimizado necesita validacion numerica independiente.
- Opciones de despliegue: la ruta soportada es el motor propio `VistaEngine` del paquete `decision-index`, invocado mediante la CLI `decision-index vision pipeline`. No se documentan vLLM, llama.cpp, Ollama ni TGI, y el autor senala que un motor de servicio distinto no sustituye a esta lectura de puntuaciones.
- Latencia y throughput: no disponibles. La medicion oficial en RTX PRO 6000 esta pendiente de evaluacion.
- Almacenamiento: el repositorio del adaptador ocupa 0,1 GB, pero es necesario descargar ademas el backbone Qwen3.5-4B completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VISTA-4B-A | 4,572B (incluye 32,46M de LoRA) | 32.768 tokens | Adaptador LoRA de decision sobre Qwen3.5-4B post-entrenado; puntua letras candidatas | apache-2.0 | HuggingFace, 19 descargas, 0 likes |
| Qwen3.5-4B (base del adaptador) | aproximadamente 4,660B en los ficheros upstream, 4,539B en la ruta de inferencia | no disponible en la informacion proporcionada | Modelo vision-lenguaje generalista post-entrenado | no disponible en la informacion proporcionada | HuggingFace (Qwen y Unsloth) |
| Qwen3.5-4B-Base | no disponible en la informacion proporcionada | no disponible | Checkpoint base sin post-entrenamiento | no disponible | HuggingFace |
| Otros adaptadores de decision para suites VQA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento cifrada. La comparacion con Qwen3.5-4B es directa en cuanto a backbone, pero VISTA-4B-A no es un sustituto funcional: no genera texto libre y su readout esta restringido a la puntuacion de opciones.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre y no debe usarse como asistente conversacional. El autor advierte que la generacion arbitraria de texto o un motor distinto no sustituyen a la lectura de puntuaciones.
- Resultado no oficial: la puntuacion de 65,493670 es un resultado local de suite publica; no hay rango oficial, no se reclama SOTA y la admision en el leaderboard esta pendiente.
- Idiomas: solo ingles segun el campo de idiomas del repositorio; no se documenta soporte multilingue.
- Sesgos: no disponible en la informacion proporcionada. Al entrenarse sobre A-OKVQA, ChartQA y TextVQA, hereda las distribuciones y posibles sesgos de esas tres fuentes, pero el autor no documenta un analisis especifico.
- Riesgo de alucinacion: no evaluado en la informacion disponible. El formato de eleccion cerrada reduce el espacio de salida a las letras candidatas, pero no elimina la posibilidad de seleccionar una opcion incorrecta con alta confianza.
- Ambito de evaluacion restringido: la precision del 90,9% en desarrollo corresponde a un conjunto disjunto por grupo de imagen pero de las mismas tres fuentes, con distractores construidos en ChartQA y TextVQA; no es una medida de VQA abierta.
- Dependencia del adaptador sin fusionar: los resultados publicados corresponden al adaptador sin fusionar. La fusion BF16 altero 29 de 277 decisiones diagnosticas, por lo que no deben atribuirse estos resultados al checkpoint fusionado ni a otro backend de inferencia.
- Entorno estrictamente fijado: la reproducibilidad depende de versiones concretas de Python, PyTorch, Transformers, Unsloth y PEFT, y del fallback de convolucion causal de referencia. Kernels optimizados requieren validacion numerica independiente.
- Dependencias externas de evaluacion: Winoground exige aceptar los terminos upstream y autenticarse con una cuenta autorizada de Hugging Face; Mind2Web requiere seguir las instrucciones de fuentes del kit oficial para un renderizado de imagen identico byte a byte.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia, no disponible en la informacion proporcionada, que debe verificarse por separado antes de un despliegue en produccion.
- Madurez: repositorio con 19 descargas y 0 likes, creado y actualizado el mismo dia (2026-10-28), sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edward1503/VISTA-4B-A
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision del backbone fijada por el loader: 3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636
- Revision oficial de Qwen/Qwen3.5-4B verificada: 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Commit del kit oficial de evaluacion: 25c6ec7b6b5f44a216c63c3a700de3a9c6d6699d
- Dataset A-OKVQA: https://huggingface.co/datasets/HuggingFaceM4/A-OKVQA
- Dataset ChartQA: https://huggingface.co/datasets/HuggingFaceM4/ChartQA
- Dataset TextVQA: https://huggingface.co/datasets/lmms-lab-encoder/textvqa
- Repositorio del paquete `decision-index`: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
