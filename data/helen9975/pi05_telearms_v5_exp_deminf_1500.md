# helen9975/pi05_telearms_v5_exp_deminf_1500

## Resumen

`pi05_telearms_v5_exp_deminf_1500` es un checkpoint intermedio de un fine-tune completo del modelo de robotica π₀.₅ (`lerobot/pi05_base`) sobre un conjunto de demostraciones simuladas de manipulacion bimanual con brazos YAM. Lo publica el usuario `helen9975` como parte de una familia de ocho experimentos (v5) destinados a comparar estrategias de seleccion de datos de entrenamiento. El checkpoint corresponde al paso 23.000 de 30.000 de un entrenamiento que, segun la model card, seguia en curso en el momento de la publicacion.

El modelo resuelve una tarea concreta: aprender politicas visuomotoras que mapean observaciones (tres camaras de 224×224) e instrucciones de tarea a secuencias de acciones de 50 pasos para un robot bimanual YAM. No es un modelo de lenguaje de proposito general, sino una politica de robotica con un componente tipo vision-language-action (VLA) heredado de π₀.₅, con 4.143.404.816 parametros totales (unos 4,14 mil millones) y pesos en formato safetensors empaquetados para la libreria LeRobot.

Su relevancia es metodologica: forma parte de un diseno experimental controlado en el que ocho variantes se entrenan con la misma receta y el mismo presupuesto de muestras (15,36 millones) para aislar el efecto de la seleccion de datos (aleatoria, por ELO, por score y por DemInf). Este checkpoint concreto usa seleccion DemInf (Hejna et al., 2025) sobre el tercio superior de cada tarea. No se han publicado resultados de evaluacion en simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-language-action de LeRobot); no se detalla la topologia interna en la informacion disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las observaciones son tres camaras de 224×224 y las acciones se emiten en chunks de 50 pasos) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; no se documentan cuantizaciones para inferencia) |
| Idiomas soportados | no disponible (las instrucciones de tarea son prompts de texto; no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (carpeta `pretrained_model/` del checkpoint) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de π₀.₅ (`lerobot/pi05_base`), que incluye el modelo de lenguaje, el codificador de vision y el modulo experto de acciones. Se entrena en bf16 con checkpointing de gradientes. Las acciones se representan como chunks de 50 pasos, con acciones relativas y pinzas absolutas. El entrenamiento usa variantes de prompt por tarea (`meta/task_prompt_variants.json`).

Los datos proceden del dataset `mliu48/telearms-yam-cube-v5-exp-deminf-1500` (revision `32ff3f68`): 15.000 demostraciones simuladas bimanuales YAM de 10 tareas, 12.739.478 fotogramas a 30 Hz, tres camaras de 224×224 y sin aleatorizacion de dominio. La seleccion toma 1.500 demostraciones por tarea al azar dentro del tercio superior de cada tarea segun DemInf, calculado sobre el estado del simulador y chunks de accion de 8 pasos, restringido a demostraciones exitosas con demo score y ELO de jugador calificado.

La receta: 8 GPU H100 en un nodo, batch de 64 por GPU (512 global), 30.000 pasos (15,36 millones de muestras); este checkpoint ha visto 11,78 millones. Optimizador AdamW (β = 0,9 y 0,95, weight decay 0,01), LR pico 1e-4 (2,5e-5 × sqrt(512/32)), 1.000 pasos de warmup y decaimiento coseno hasta 1e-5. La perdida de entrenamiento reciente es 0,023. No hay episodios reservados para validacion, por lo que no existe perdida de validacion. El codigo base es `helen9975/RoboEval-telearms` (rama `PI05_training`, commit `9dc9e9f`) con cambios locales (guardas de NaN, correccion de logging PyAV para velocidad de carga de datos, minimo de episodios por tarea configurable), sobre LeRobot 0.6.1 (commit `e40b58a8`) con el parche del repositorio (`tools/install_lerobot_patch.py`).

## Capacidades

- Generacion de acciones motoras bimanuales para un robot YAM a partir de observaciones visuales de tres camaras y una instruccion de tarea.
- Control visuomotor a 30 Hz con chunks de accion de 50 pasos.
- Ejecucion de 10 tareas de manipulacion del conjunto `telearms-yam-cube-v5`.
- Condicionamiento por prompt de tarea, con variantes de prompt por tarea definidas en el dataset.
- Acciones relativas con pinzas absolutas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento; es una politica de robotica, no un asistente conversacional.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seleccion de datos para robotica: este checkpoint sirve como una de las ocho variantes de un experimento controlado (DemInf-1500) y permite comparar curvas de aprendizaje frente a seleccion aleatoria, por ELO y por score con el mismo presupuesto de muestras.
- Manipulacion bimanual simulada: ejecutar las 10 tareas del dataset en un simulador YAM para estudiar el comportamiento de la politica antes de transferir a hardware.
- Estudio de tecnicas de curado de datos: analizar si filtrar por DemInf el tercio superior de cada tarea mejora la politica frente a muestreo aleatorio, usando los checkpoints hermanos como linea base.
- Reproduccion de pipelines de entrenamiento VLA: la receta (H100, batch 512, LR 1e-4, 30.000 pasos) y el codigo publicado permiten reproducir o extender el experimento en LeRobot 0.6.1.
- Punto de partida para fine-tuning posterior: al ser un checkpoint intermedio de π₀.₅, puede servir como inicializacion para tareas relacionadas con cubos y brazos YAM.
- Analisis de estabilidad del entrenamiento: con perdida reciente de 0,023 y guardas de NaN documentadas, es util para estudiar el comportamiento de la perdida en fine-tunes completos de VLA con datos simulados.
- No se recomienda su uso en produccion: no esta evaluado y el entrenamiento seguia en curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo aun no se ha evaluado en simulacion. Solo se conoce la perdida de entrenamiento reciente (0,023), que no es una metrica de rendimiento de la politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parametros en bf16, los pesos ocupan aproximadamente 8,3 GB; a eso hay que sumar activaciones del codificador de vision y del experto de acciones, por lo que se requiere holgura adicional.
- GPU recomendadas: el entrenamiento uso 8 × H100 en un nodo; para inferencia, una GPU con al menos 16-24 GB de VRAM es un punto de partida razonable, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16, sin confirmacion oficial; en GPUs de 8-12 GB requeriria cuantizacion, no documentada.
- Opciones de despliegue: LeRobot (libreria nativa del checkpoint); no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El control opera a 30 Hz en el dataset, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `helen9975/pi05_telearms_v5_exp_deminf_1500` | 4.143.404.816 | no disponible | sin evaluar | no disponible | Hugging Face |
| `helen9975/pi05_telearms_v5_exp_random_1500` | no disponible | no disponible | sin evaluar (variante aleatoria del mismo experimento) | no disponible | Hugging Face |
| `helen9975/pi05_telearms_v5_mixed` | no disponible | no disponible | sin evaluar | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Las tres alternativas pertenecen a la misma familia experimental v5 y comparten receta y presupuesto de muestras; la comparacion relevante es metodologica (seleccion DemInf frente a aleatoria), no de rendimiento, porque ninguna variante tiene resultados publicados.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 23.000 de 30.000 y el entrenamiento seguia en curso; no es un modelo final.
- Sin evaluacion: no se ha evaluado en simulacion ni en hardware real; no hay evidencia de rendimiento de la politica.
- Sin validacion: no se reservaron episodios, por lo que no existe perdida de validacion ni estimacion de generalizacion.
- Dominio muy restringido: solo 10 tareas de manipulacion de cubos con brazos YAM en simulacion, sin aleatorizacion de dominio; la transferencia a entornos reales no esta demostrada.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero una politica sin evaluar puede producir acciones no seguras o fallidas en el robot.
- Idiomas: no se especifican; los prompts de tarea estan en el dataset y no se documenta su cobertura linguistica.
- Reproducibilidad: depende de cambios locales no publicados del codigo (`9dc9e9f` mas cambios locales) y de un parche especifico de LeRobot 0.6.1.
- Sin cuantizaciones documentadas: el despliegue en GPUs pequenas no esta soportado de forma oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_deminf_1500
- Dataset: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-deminf-1500
- Variante aleatoria del experimento: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_1500
- Variante mixta (ablacion): https://huggingface.co/helen9975/pi05_telearms_v5_mixed
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Codigo del proyecto: `helen9975/RoboEval-telearms`, rama `PI05_training`, commit `9dc9e9f`
- Referencia metodologica citada: Hejna et al., 2025 (DemInf)
