# Ma7ee7/Pulse-10M-v1-1B

## Resumen

Pulse-10M v1 es un modelo de lenguaje causal de aproximadamente 9,7 millones de parametros entrenado desde cero por el usuario Ma7ee7 y publicado en HuggingFace bajo licencia Apache-2.0. El identificador del repositorio ("Pulse-10M-v1-1B") puede inducir a confusion: el sufijo "1B" hace referencia a los 1.000 millones de tokens de entrenamiento (objetivos next-token), no al numero de parametros, que se situa en el entorno de 9,7M.

Su interes no esta en la capacidad de generacion, muy limitada por tamano y volumen de datos, sino en la arquitectura: un modelo recurrente jerarquico y secuencial con computo adaptativo. El flujo es embedding de tokens, modulo Stem, jerarquia recurrente Fast, Medium y Slow, salida (Exit) y cabeza LM, con un controlador de parada de estilo ACT que decide cuantos ciclos recurrentes ejecutar (maximo de 4). Dentro de cada ciclo se pueden activar selectivamente los niveles Fast, Medium y Slow mediante probabilidades de enrutamiento de profundidad aprendidas.

La relevancia actual es fundamentalmente de investigacion: es un banco de pruebas reproducible de un unico paso sobre 1.000 millones de tokens, con deduplicacion exacta entre fuentes, curriculo de arquitectura progresivo y cooldowns de learning rate estilo WSD-S. No es un modelo de proposito general ni esta pensado para produccion: solo soporta ingles, tiene 512 tokens de contexto y no es una arquitectura Transformers estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente jerarquica secuencial con computo adaptativo (no Transformer estandar); token embedding -> Stem -> Fast -> Medium -> Slow -> Exit -> LM head |
| Parametros totales | Aproximadamente 9,7M |
| Parametros activos | No aplica (no es MoE); el computo varia por profundidad mediante enrutamiento aprendido Fast/Medium/Slow y numero de ciclos recurrentes |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones oficiales en la informacion proporcionada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (solo pesos) y checkpoints .pt de PyTorch (incluyen estado del optimizador) |
| Dimension del modelo (d_model) | 288 |
| Cabezas de atencion | 6 |
| Dimension de FFN (d_ff) | 768 |
| Vocabulario | Aproximadamente 16.000 tokens |
| Normalizacion | RMSNorm |
| Codificacion posicional | RoPE |
| FFN | SwiGLU |
| Dropout | 0 |
| Ciclos recurrentes maximos | 4 |
| Enlace de pesos | Matriz de embedding y matriz de salida LM compartidas (weight tying) |
| Tamano del repositorio | 5,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un modelo causal recurrente de profundidad adaptativa. La secuencia pasa por un embedding de tokens y un modulo Stem, tras lo cual entra en una jerarquia recurrente de tres niveles: Fast, Medium y Slow. En cada ciclo, el modelo calcula Fast y, opcionalmente, Medium y Slow; dos probabilidades de enrutamiento de profundidad aprendidas determinan cuanto de la jerarquia se usa. Durante el entrenamiento se mezclan los tres niveles de profundidad posibles (Fast; Fast -> Medium; Fast -> Medium -> Slow) y un controlador de parada tipo ACT decide el numero de ciclos, con un maximo de 4. El enrutamiento se introduce de forma progresiva mediante un curriculo: de 0 a 50M tokens se usa profundidad completa con 2 ciclos fijos; entre 50M y 150M el suelo de profundidad baja de 1,0 a 0,25; entre 150M y 300M baja de 0,25 a 0 y se activa la parada adaptativa; a partir de 300M el enrutamiento y la parada son plenamente aprendidos y, entre 300M y 500M, la penalizacion por computo alcanza su intensidad plena.

El entrenamiento cubre exactamente 1.000 millones de objetivos next-token en un unico paso, sin repeticion de epocas: los bloques empaquetados se consumen una sola vez, con longitud de secuencia de 512 objetivos usando bloques crudos no solapados de 513 tokens. La mezcla de datos es Ultra-FineWeb (550M), FinePDFs Edu (180M), peS2o (80M), FineMath (60M), Stack v2 (60M), Wikipedia (40M) y datos algoritmicos sinteticos (30M). Se excluyen del entrenamiento los documentos reservados para entrenamiento del tokenizer y validacion, y se aplica un registro persistente de deduplicacion exacta de documentos. El learning rate alcanza un pico de 2e-3 con warmup de 0 a 10M tokens y cooldowns repetidos estilo WSD-S: 225M-250M con suelo 2e-4, 475M-500M con suelo 2e-4, 725M-750M con suelo 2e-4 y 925M-1B con suelo 4e-5. Tras cada cooldown intermedio el learning rate vuelve directamente al valor estable de 2e-3; el cooldown final no se reinicia. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, limitada a secuencias de hasta 512 tokens.
- Razonamiento de corto alcance y completado de texto sencillo; no se documentan capacidades de razonamiento complejo.
- Generacion de codigo muy basica, derivada de los 60M tokens de Stack v2 en el preentrenamiento.
- Aritmetica y problemas matematicos elementales, con contribucion de FineMath (60M tokens) y datos algoritmicos sinteticos (30M tokens).
- Computo adaptativo: el numero de ciclos recurrentes (hasta 4) y la profundidad de la jerarquia se ajustan dinamicamente mediante el controlador de parada y el enrutamiento aprendido.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y etiquetado unicamente para ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion en computo adaptativo: el modelo sirve como banco de pruebas reproducible para estudiar controladores de parada tipo ACT y enrutamiento de profundidad, ya que expone el numero de ciclos y los niveles activados por ciclo.
- Estudio de arquitecturas recurrentes alternativas al Transformer: permite medir si una jerarquia Fast/Medium/Slow con 9,7M de parametros y 512 de contexto aprende representaciones utiles con solo 1.000 millones de tokens.
- Experimentos de curriculo de entrenamiento: el repositorio incluye el codigo de entrenamiento, el historial, los checkpoints periodicos y de frontera, lo que facilita reproducir y comparar el curriculo de profundidad descrito (0-50M, 50-150M, 150-300M, 300M+).
- Ablaciones sobre mezcla de datos y deduplicacion: la receta de datos esta cuantificada por fuente y el ledger de deduplicacion exacta es parte de los artefactos publicados, lo que permite aislar el efecto de cada fuente.
- Inferencia en CPU y entornos embebidos: con unos 9,7M de parametros el modelo cabe holgadamente en memoria de CPU y en GPUs de gama baja, util para prototipos de generacion de texto corto donde no hay acelerador disponible.
- Docencia y divulgacion: como ejemplo completo y de bajo coste de un pipeline de preentrenamiento (tokenizer, streaming de corpus, schedule de LR, checkpoints) para cursos de machine learning.
- Generacion de texto muy acotada tras ajuste fino: con fine-tuning especifico podria emplearse en tareas estrechas en ingles, como plantillas, etiquetado o autocompletado de campos cortos, siempre con validacion humana.
- Baseline en comparativas academicas: punto de partida para comparar eficiencia por token frente a modelos densos de tamano similar bajo presupuesto de computo fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar; unicamente menciona "evaluaciones de frontera" entre los contenidos del repositorio, sin resultados asociados.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 39 MB en FP32, 19 MB en FP16/BF16, 10 MB en INT8 y 5 MB en INT4 (calculado sobre 9,7M de parametros).
- Memoria de cache KV: con 6 cabezas, dimension de cabeza de 48 (d_model 288 / 6) y FP16, el coste es de aproximadamente 1,1 KB por token, es decir, en torno a 0,6 MB para los 512 tokens de contexto.
- GPU recomendadas: cualquier GPU con 1 GB o mas de memoria es sobradamente suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o una GPU integrada moderna pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo y tambien en CPU, dado el tamano del modelo.
- Opciones de despliegue: al no ser una arquitectura Transformers estandar, no es compatible con vLLM, llama.cpp, Ollama, TGI ni con el pipeline habitual de transformers. Es necesario instanciar el modelo con el codigo de arquitectura PyTorch incluido en el repositorio y cargar el state dict del archivo .safetensors o el checkpoint .pt. Cualquier formato GGUF requeriria una conversion manual no publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| Pulse-10M v1 | Aproximadamente 9,7M | 512 | 1.000M (un paso, sin repeticion) | Apache-2.0 | safetensors, .pt |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos verificados de modelos comparables. Existen familias de tamano similar en el ecosistema abierto (por ejemplo, modelos diminutos de generacion de cuentos o las variantes mas pequenas de suites de investigacion tipo Pythia), pero no se incluyen cifras de parametros, contexto, tokens o rendimiento para ellas porque no forman parte de la informacion facilitada y no deben darse por verificadas en esta ficha.

## Limitaciones y advertencias

- Tamano muy reducido: 9,7M de parametros y 1.000M de tokens de entrenamiento implican una capacidad de conocimiento y de generalizacion muy inferior a la de cualquier modelo actual de uso general.
- Riesgo elevado de alucinacion y de incoherencia: sin ajuste por instrucciones ni RLHF/DPO documentados, el modelo es un generador de texto base, no un asistente.
- Contexto de solo 512 tokens, insuficiente para conversaciones multi-turno largas, documentos extensos o razonamiento con cadenas largas.
- Unicamente ingles: no hay soporte multilingue, por lo que su uso en castellano producira resultados degradados.
- Vocabulario de aproximadamente 16.000 tokens: tokenizacion menos eficiente que la de vocabularios de 50.000 o 100.000 tokens, lo que incrementa el coste por caracter generado.
- Incompatibilidad con el ecosistema: no es una arquitectura Transformers estandar, por lo que no funciona con transformers, vLLM, llama.cpp, Ollama ni TGI sin trabajo de adaptacion, y no hay cuantizaciones oficiales publicadas.
- Entrenamiento en un unico paso sin repeticion de epocas: puede implicar infraentrenamiento respecto a regimenes multi-epoca con el mismo presupuesto de tokens.
- Sesgos previsibles del corpus: Ultra-FineWeb y Wikipedia introducen sesgo hacia contenido web en ingles, y Stack v2 aporta codigo con sus propios sesgos de estilo y licencias de origen.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la licencia no cubre las licencias de los datos de entrenamiento de terceros.
- Repositorio de 5,4 GB: la mayor parte del peso corresponde a checkpoints de entrenamiento y estado del corpus, no a los pesos finales, algo a tener en cuenta antes de descargarlo.
- La fecha de creacion registrada en HuggingFace figura como 2026-10-06, dato anomalo que conviene verificar antes de citar el modelo como referencia temporal.
- Ausencia total de benchmarks publicados: no es posible validar su rendimiento con cifras objetivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ma7ee7/Pulse-10M-v1
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
