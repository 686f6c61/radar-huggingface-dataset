# Myungkyu/rldx_robodojo_nomask_b128_60k

## Resumen

rldx_robodojo_nomask_b128_60k es un ajuste fino (fine-tuning) del modelo base RLWRLD/RLDX-1-PT, un modelo de vision-lenguaje-accion (VLA) orientado a robotica. Lo publica el usuario Myungkyu en Hugging Face como "baseline vanilla" para el benchmark de simulacion RoboDojo, entrenado sobre el conjunto RoboDojo-Benchmark/RoboDojo (35 tareas x 100 episodios, robot dual ARX X5, exportacion oficial de LeRobot). Su proposito es servir como referencia reproducible frente a la que comparar variantes posteriores del mismo autor (por ejemplo, las versiones con enmascaramiento de ruido en dimensiones de padding).

El modelo toma como entrada imagenes de tres camaras (cabeza y munecas izquierda y derecha), un estado articular de 14 dimensiones y la instruccion de la tarea en lenguaje natural, y produce como salida objetivos articulares absolutos de 14 dimensiones. La arquitectura heredada de RLDX-1-PT emplea una longitud de video de 4 con stride 2 y un horizonte de accion de 50 pasos. Cuenta con aproximadamente 6.910 millones de parametros en formato safetensors y un repositorio de 165,9 GB (que incluye checkpoints intermedios y pesos en precision completa).

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigacion para evaluacion en simulacion, no de un modelo de proposito general. La informacion publica es escasa (sin model card detallada de capacidades, sin benchmarks numericos y sin licencia declarada), por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo vision-lenguaje-accion; video length 4 / stride 2, tres vistas de camara, horizonte de accion 50) |
| Parametros totales | 6.912.896.320 (~6,91 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, pero no se especifica cobertura linguistica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de entrenamiento | RoboDojo-Benchmark/RoboDojo (35 tareas x 100 episodios, dual ARX X5, exportacion LeRobot) |
| Entradas | imagenes de cabeza + munecas izquierda/derecha, estado articular 14-d, instruccion de tarea |
| Salidas | objetivos articulares absolutos 14-d |
| Configuracion de entrenamiento | batch 128, 60.000 pasos, action_noise_mask_dim=0, state dropout 0.5 |
| Checkpoints | final + intermedios en pasos 15.000, 30.000 y 45.000 |
| Tamano del repositorio | 165,9 GB |

## Arquitectura y entrenamiento

El modelo se basa en RLDX-1-PT, un VLA que combina percepcion visual multi-camara con instrucciones en lenguaje natural para generar acciones motoras. La configuracion documentada incluye procesamiento de video con longitud 4 y stride 2, tres vistas de camara (cabeza y dos munecas), y un horizonte de accion de 50 pasos. La salida es un vector de 14 dimensiones de objetivos articulares absolutos, coherente con un robot dual ARX X5 de 14 grados de libertad (7 por brazo).

El ajuste fino se realizo sobre el dataset RoboDojo (35 tareas, 100 episodios por tarea) con un batch de 128 durante 60.000 pasos. La variante "nomask" se distingue por fijar `action_noise_mask_dim=0`, es decir, sin enmascaramiento de ruido en las dimensiones de padding de la accion, combinado con `state dropout` de 0.5. El codigo utilizado es RLWRLD/RLDX en la rama `myungkyu/jitter-patch` (commit 21f674b4). No se documentan detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de la citada, ni si se aplicaron etapas de RLHF o DPO (poco probables en un modelo de robotica de este tipo).

El repositorio incluye checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, cada uno con su propio fichero SHA256SUMS, lo que facilita el analisis de la curva de aprendizaje. El checkpoint final no incluye el estado del optimizador.

## Capacidades

- Generacion de acciones motoras: produce objetivos articulares absolutos de 14 dimensiones a partir de observaciones visuales y estado articular.
- Percepcion visual multi-camara: procesa simultaneamente imagenes de cabeza y munecas izquierda y derecha.
- Comprension de instrucciones en lenguaje natural: la tarea se especifica mediante texto, lo que permite condicionar el comportamiento sin reentrenar.
- Control con horizonte de accion de 50 pasos: planifica secuencias de accion relativamente largas.
- Ejecucion de tareas de manipulacion robotica en simulacion (35 tareas del benchmark RoboDojo).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, vision general, audio ni capacidades multilingues mas alla de las instrucciones de tarea.

## Casos de uso

- Baseline de evaluacion en RoboDojo: sirve como referencia "vanilla" para medir la mejora de variantes con enmascaramiento de ruido u otras modificaciones; se ejecuta en el simulador con las 35 tareas del benchmark.
- Investigacion en aprendizaje por imitacion: permite reproducir el ajuste fino sobre el dataset RoboDojo con la configuracion documentada (batch 128, 60.000 pasos) y comparar curvas usando los checkpoints intermedios.
- Estudio de robustez ante dropout de estado: al fijar `state dropout` a 0.5, es util para analizar como afecta la perdida de informacion propioceptiva al rendimiento del control.
- Analisis de abliteracion de enmascaramiento: la variante "nomask" permite aislar el efecto de no enmascarar las dimensiones de padding de la accion frente a la variante "vanilla" del mismo autor.
- Transferencia a robot dual ARX X5: el formato de salida (14-d absolutos) y las entradas (tres camaras + estado 14-d) encajan con plataformas duales de 7 GDL por brazo, lo que facilita su reutilizacion en montajes equivalentes.
- Docencia y reproduccion de pipelines VLA: el repositorio incluye instrucciones de descarga selectiva (`allow_patterns`/`ignore_patterns`) para trabajar solo con el checkpoint final o con pasos concretos, util en laboratorios con almacenamiento limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en RoboDojo ni metricas comparativas; solo describe la configuracion de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~6,91 mil millones de parametros, en FP16 se requieren aproximadamente 14 GB solo para los pesos; en BF16 similar. En FP32 serian unos 28 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: para FP16/BF16, una GPU con 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100). Para FP32, A100 40 GB o superior.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 si el resto del pipeline (procesamiento de video, tres camaras, buffers) no consume demasiado; en GPUs de 16 GB requeriria cuantizacion no documentada.
- Opciones de despliegue: no se especifican; al ser un modelo de robotica con codigo propio (RLWRLD/RLDX), el despliegue previsible es mediante el repositorio de codigo del autor y el simulador RoboDojo, no mediante vLLM, llama.cpp u Ollama, que estan orientados a LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rldx_robodojo_nomask_b128_60k | ~6,91 mil M | no disponible | VLA, baseline RoboDojo sin enmascaramiento de ruido | no disponible | Hugging Face (84 descargas) |
| Myungkyu/rldx_robodojo_vanilla_b128_60k | no disponible | no disponible | VLA, misma base con `action_noise_mask_dim=14` | no disponible | Hugging Face |
| Myungkyu/rldx2_rldx_robodojo_nomask_b128_60k | no disponible | no disponible | VLA, variante rldx2 con la misma configuracion nomask | no disponible | Hugging Face |
| RLWRLD/RLDX-1-PT | no disponible | no disponible | Modelo base VLA preentrenado | no disponible | Hugging Face |

Las tres variantes de Myungkyu comparten arquitectura y configuracion de entrenamiento, diferenciandose en el enmascaramiento de ruido y en la version de la base (RLDX-1-PT frente a rldx2). No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el modelo base antes de cualquier despliegue productivo.
- Ambito restringido a simulacion: entrenado sobre RoboDojo con robot dual ARX X5; no hay evidencia de transferencia a hardware real ni a otras morfologias.
- Sin benchmarks publicados: no es posible verificar su rendimiento frente a alternativas; su valor es como baseline interno.
- Idiomas no documentados: aunque acepta instrucciones en lenguaje natural, no se especifica que lenguas cubre ni su robustez fuera del ingles (u otros idiomas usados en RoboDojo).
- Riesgo de sobreajuste al dataset: 35 tareas x 100 episodios es un volumen limitado; el modelo puede fallar en tareas o condiciones fuera de distribucion.
- Sin cuantizaciones oficiales: el despliegue en GPUs de gama media-baja no esta soportado por artefactos publicados.
- Checkpoint final sin estado del optimizador: no permite reanudar el entrenamiento exactamente desde el paso 60.000.
- Posibles sesgos heredados del modelo base y del dataset de demostraciones, no evaluados en la informacion disponible.
- Riesgo de alucinacion motora: como todo VLA, puede generar trayectorias plausibles pero fisicamente invalidas; requiere validacion en simulacion antes de cualquier uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_robodojo_nomask_b128_60k
- Variante vanilla (con enmascaramiento): https://huggingface.co/Myungkyu/rldx_robodojo_vanilla_b128_60k
- Variante rldx2 nomask: https://huggingface.co/Myungkyu/rldx2_rldx_robodojo_nomask_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Codigo RLWRLD/RLDX (rama myungkyu/jitter-patch, commit 21f674b4): https://github.com/RLWRLD/RLDX (referencia citada en la model card; no se proporciona URL directa)
