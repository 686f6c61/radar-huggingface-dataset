# mpoli/initial-phonetic-learning

## Resumen

`mpoli/initial-phonetic-learning` no es un modelo de lenguaje generativo, sino una coleccion de checkpoints de CPC (Contrastive Predictive Coding) entrenados para reproducir el estado inicial del aprendizaje fonetico temprano en lactantes. El trabajo corresponde a Poli, Schatz, Dupoux y Lavechin (2025), publicado en *Language Development Research*, y el repositorio aloja 501 modelos organizados por condicion de preentrenamiento y de desarrollo, con el objetivo de estudiar que senales (sonidos ambientales, habla multilingue o una lengua concreta) bastan para que un sistema adquiera representaciones foneticas discriminativas.

Cada checkpoint se entrena en dos fases: un preentrenamiento opcional (500 h de sonidos ambientales de Animal Sound Archive y AudioSet, 500 h de VoxPopuli en 18 lenguas no germanicas, o 500 h de ingles/japones) seguido de una fase de desarrollo con entre 1 y 500 h de ingles americano (audiolibros de LibriVox) o japones (Corpus of Spontaneous Japanese). La nomenclatura de carpetas codifica ambas fases, la cantidad de horas y el split de datos empleado, lo que permite comparaciones controladas entre condiciones.

Su relevancia es cientifica y metodologica: sirve como banco de pruebas reproducible para hipotesis sobre adquisicion fonetica infantil y como base de representaciones de habla auto-supervisadas multilingues. No esta pensado para inferencia generativa ni para despliegue en produccion, y el repositorio ocupa 72,1 GB con pesos en formato PyTorch (`.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CPC (Contrastive Predictive Coding) sobre encoder convolucional de audio; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de audio, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos en precision original `.pt`, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | bg, cs, el, en, es, et, fr, fi, hr, hu, it, ja, lt, lv, mt, pl, pt, ro, sk, sl (20 lenguas en metadatos; el entrenamiento efectivo usa ingles americano, japones y VoxPopuli en 18 lenguas no germanicas) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (un fichero `checkpoint_<epoch>.pt` por modelo) |

## Arquitectura y entrenamiento

La arquitectura es CPC, un metodo auto-supervisado que aprende representaciones prediciendo pasos futuros en el espacio latente a partir de un encoder convolucional aplicado a la forma de onda o a features de audio. El repositorio no documenta el numero de capas, dimensiones ocultas ni el tamaño exacto de las ventanas de audio, por lo que esos datos figuran como no disponibles. Cada checkpoint guarda los pesos de la mejor epoca segun precision de validacion, con un 5 % de cada conjunto de entrenamiento reservado para validacion.

El diseno experimental es el nucleo del trabajo. Hay tres estados iniciales sin experiencia de habla (`scratch_null` con pesos aleatorios, `ambient-500h_null` con 500 h de sonidos ambientales y `multilingual-500h_null` con 500 h de VoxPopuli en 18 lenguas no germanicas), 132 modelos sin preentrenamiento como linea base, 132 con preentrenamiento ambiental (Experimento 1), 102 con preentrenamiento multilingue (Experimento 2) y 132 de preentrenamiento cruzado entre ingles y japones (Experimento 3, apendice). Los corpus de ingles (LibriVox) y japones (CSJ) suman unas 500 h cada uno y se dividen en splits mutuamente excluyentes de 1, 2, 4, 20 y 100 h, con 15 modelos por lengua en las condiciones de 1 a 20 h, 5 en 100 h y 1 en 500 h. Los numeros de epoca continuan entre fases, de modo que los primeros 100 registros de `checkpoint_logs.json` en modelos preentrenados corresponden al preentrenamiento.

## Capacidades

- Extraccion de representaciones de audio auto-supervisadas mediante CPC, orientadas a discriminacion fonetica.
- Aprendizaje de unidades tipo fonema a partir de habla no etiquetada, evaluable con tareas de discriminacion y clustering.
- Entrenamiento y evaluacion controlados por cantidad de datos (1, 2, 4, 20, 100 y 500 h) y por split, lo que permite curvas de aprendizaje reproducibles.
- Estudio del efecto del preentrenamiento en sonidos ambientales frente a habla multilingue frente a habla de otra lengua.
- Cobertura multilingue en la fase de preentrenamiento (18 lenguas no germanicas de VoxPopuli) y en metadatos (20 lenguas).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision, audio generativo ni modo thinking: es un modelo de representacion, no un LLM.

## Casos de uso

- Investigacion en adquisicion fonetica infantil: comparar la precision de discriminacion fonetica de modelos con y sin preentrenamiento para contrastar hipotesis sobre que experiencia auditiva temprana es necesaria antes del habla.
- Reproduccion de experimentos publicados: cargar los checkpoints de una condicion concreta (por ejemplo `ambient-500h_jpn-004h/s000_s034`) y replicar las curvas de aprendizaje del articulo con los logs incluidos.
- Linea base para modelos de habla auto-supervisados: usar los checkpoints como referencia de baja capacidad en comparaciones con wav2vec 2.0, HuBERT o CPC modernos.
- Estudio de transferencia cross-lingue: analizar como un modelo entrenado en 500 h de ingles se adapta a 4 h de japones usando las carpetas `eng-500h_jpn-*`, util para investigar transferencia entre lenguas tipologicamente distantes.
- Analisis de sensibilidad a la cantidad de datos: entrenar o evaluar con los splits de 1, 2, 4, 20 y 100 h para estimar el punto de saturacion de las representaciones foneticas.
- Docencia y formacion: material didactico para explicar aprendizaje auto-supervisado y diseno experimental en fonetica computacional, dado que cada condicion esta aislada y documentada.
- Base para experimentos de analisis de unidades: extraer representaciones y aplicar clustering o ABX para medir discriminacion de contrastes foneticos en distintas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo (Poli et al., 2025, *Language Development Research*) para los resultados experimentales; los ficheros `checkpoint_logs.json` contienen perdida y precision de entrenamiento y validacion por epoca, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño por checkpoint no se detalla y el total del repositorio (72,1 GB) agrega 501 modelos, por lo que cada fichero individual es previsiblemente mucho menor.
- GPU recomendadas: no disponible. Al ser un modelo CPC de audio, es probable que quepa en GPUs consumer, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada; depende del tamaño real de cada checkpoint, que no se especifica.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `checkpoint_<epoch>.pt`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mpoli/initial-phonetic-learning | no disponible | no aplica (audio) | Representaciones foneticas via CPC | MIT | Hugging Face, 501 checkpoints |
| wav2vec 2.0 (Facebook AI) | 95 M (base) / 317 M (large) | no aplica (audio) | Representaciones de habla auto-supervisadas | MIT (base) / MIT (large) | Hugging Face, ampliamente usado |
| HuBERT (Meta AI) | 95 M (base) / 1 B (large) | no aplica (audio) | Representaciones de habla auto-supervisadas | MIT | Hugging Face |
| CPC original (van den Oord et al.) | no disponible | no aplica (audio) | Representaciones contrastivas | no disponible | Codigo de referencia |

La comparacion es aproximada: los modelos de la tabla son representaciones de habla auto-supervisadas de proposito general, mientras que este repositorio es un banco experimental disenado para preguntas de adquisicion fonetica, no para rendimiento en tareas downstream. No se dispone de cifras comparativas de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Los pesos son especificos de cada condicion experimental; mezclar checkpoints de carpetas distintas invalida las comparaciones del diseno original.
- Los ficheros JSON contienen rutas absolutas del cluster de entrenamiento (`pathDB`, `pathCheckpoint`, `load`) que no son necesarias para cargar el modelo, pero pueden confundir en reproducciones.
- La model card no documenta sesgos, tasas de alucinacion ni comportamiento fuera de dominio; al tratarse de un modelo discriminativo de audio, el riesgo principal es de generalizacion limitada a dominios acusticos distintos de LibriVox, CSJ, AudioSet y VoxPopuli.
- Cobertura efectiva de lenguas limitada a ingles americano y japones en la fase de desarrollo; el resto de lenguas solo aparece en el preentrenamiento multilingue.
- Licencia MIT permite uso comercial, pero el modelo no esta pensado para produccion y no hay garantias de soporte ni mantenimiento.
- El repositorio ocupa 72,1 GB; descargar el conjunto completo puede ser costoso y no hay versiones cuantizadas ni empaquetadas para despliegue ligero.

## Enlaces

- Hugging Face: https://huggingface.co/mpoli/initial-phonetic-learning
- Codigo: https://github.com/mxmpl/initial-phonetic-learning
- Articulo: https://doi.org/10.34842/y89t-6q31 (Poli, Schatz, Dupoux y Lavechin, 2025, *Language Development Research*, 5(1), 1-34)
