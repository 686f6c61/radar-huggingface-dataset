# learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_10000

## Resumen

Este repositorio contiene un checkpoint intermedio del modelo `learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_10000`, un ajuste fino de tipo vision-language-action (VLA) construido sobre `nvidia/GR00T-N1.7-3B`. Lo publica el usuario `learner1119` y esta pensado exclusivamente para robótica: no es un modelo de lenguaje conversacional, sino una política que traduce observaciones visuales y de estado del robot en comandos de accion. Concretamente, se ha entrenado sobre el dataset `learner1119/260820` para controlar el brazo izquierdo de una plataforma FFW-SH5, con representacion de acciones en valores absolutos, horizonte de prediccion de 50 pasos y torre de vision ajustada durante el entrenamiento.

El modelo hereda la arquitectura de GR00T N1.7: un backbone de vision-lenguaje `nvidia/Cosmos-Reason2-2B` con las capas del LLM limitadas a las 12 primeras, sobre el que se monta un cabezal de difusion de acciones. El checkpoint totaliza 3.144.016.000 parametros en BF16 y se distribuye en dos shards de safetensors, con un tamano de repositorio de 6,9 GB. La licencia es la NVIDIA Open Model License, heredada del modelo base.

Su relevancia es acotada pero clara: se trata de un punto intermedio en la curva de entrenamiento (paso 10.000 de 50.000) con una perdida de entrenamiento de 0,0353 (media movil de 25 puntos). El propio autor recomienda usar el repositorio final (`ffw_sh5_n17_260820_left_h50_abs_vis_50000`) salvo que se necesite especificamente este punto anterior de la curva, por ejemplo para estudiar la evolucion del ajuste o para comparar fases de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en GR00T N1.7; backbone de vision-lenguaje `nvidia/Cosmos-Reason2-2B` con capas del LLM limitadas a las 12 primeras, mas cabezal de acciones |
| Parametros totales | 3.144.016.000 (dato real de safetensors) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible; el horizonte de prediccion de acciones es de 50 pasos |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en BF16 (no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`, etiquetada como `other` en el repo) |
| Formato de pesos | safetensors (BF16, 2 shards) |
| Tamano del repositorio | 6,9 GB |
| Modelo base | `nvidia/GR00T-N1.7-3B` |
| Dataset de entrenamiento | `learner1119/260820` |
| Paso de entrenamiento | 10.000 de 50.000 |
| Perdida de entrenamiento | 0,0353 (media movil de 25 puntos, solo train) |
| Reproduccion de acciones | ABSOLUTE |
| Ajuste de torre de vision | True |
| Libreria | transformers |
| Pipeline | robotics |
| Fecha de creacion del repo | 2026-09-14 |
| Fecha de actualizacion del repo | 2026-09-14 |

## Arquitectura y entrenamiento

El modelo sigue el esquema de GR00T N1.7: un backbone vision-language (`nvidia/Cosmos-Reason2-2B`) que procesa observaciones visuales y contexto textual, truncado a las 12 primeras capas del LLM, y un cabezal de generacion de acciones que produce secuencias de movimiento. La configuracion de modalidades empleada en el entrenamiento se incluye en el repositorio como `ffw_sh5_left8_h50_config.py`; para cargar el modelo es necesario registrar ese archivo e instanciar `Gr00tPolicy(model_path="learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_10000", embodiment_tag="new_embodiment")`. Los ficheros `processor_config.json`, `statistics.json` y `embodiment_id.json` se encuentran en la raiz del repositorio tal y como los escribio el entrenador.

Los detalles de entrenamiento publicados son: batch global de 64, learning rate de 1e-4 con schedule coseno, warmup de 0,05, weight decay de 1e-5 y `state_dropout` de 0,2. El entrenamiento se ejecuto a 2,22 s/paso sobre 4 GPU A100 de 80 GB. La representacion de acciones es absoluta y la torre de vision se ajusto durante el entrenamiento (`tune_visual = True`). Los datos corresponden a las 8 dimensiones izquierdas de un espacio de 16 dimensiones (el brazo derecho nunca se mueve en este dataset). No se reservo split de validacion: la perdida reportada es exclusivamente de entrenamiento, por lo que no hay una medida de generalizacion publicada. Los pesos estan en BF16 en dos shards y no se incluye el estado del optimizador (shards de DeepSpeed ZeRO-2).

## Capacidades

- Generacion de acciones roboticas: produce trayectorias de 50 pasos para el brazo izquierdo de una plataforma FFW-SH5 a partir de observaciones visuales y de estado.
- Control en espacio absoluto: la representacion de acciones es absoluta (`ABSOLUTE`), no relativa, lo que condiciona como deben interpretarse las salidas.
- Percepcion visual ajustada: la torre de vision fue entrenada especificamente sobre el dataset, no se congela del modelo base.
- Condicionamiento por embodiment: el modelo espera una etiqueta de embodiment (`new_embodiment`) y un fichero de configuracion de modalidades especifico.
- Manejo de dropout de estado: entrenado con `state_dropout` de 0,2, lo que aporta cierta robustez ante la ausencia parcial de informacion de estado.
- Generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision general, audio o modo thinking: no disponible / no documentado. Se trata de una politica robotica, no de un asistente de proposito general.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre curvas de entrenamiento en VLA: este checkpoint permite comparar el estado del modelo en el paso 10.000 frente al checkpoint final de 50.000 con los mismos datos, configuracion y semilla, aislando el efecto del numero de pasos.
- Replicacion de experimentos de ajuste fino: al publicarse junto a los hermanos `ffw_sh5_n17_260820_left_h50_abs_10000` y `ffw_sh5_n17_260820_left_h50_rel_10000`, sirve para estudiar el efecto de la representacion de acciones (absoluta frente a relativa) y del ajuste de la torre de vision con el resto de variables fijadas.
- Control de un brazo robotico en tareas de manipulacion de laboratorio: con el horizonte de 50 pasos y el condicionamiento por vision, se puede integrar en un bucle de control que ejecute los primeros pasos predichos y vuelva a planificar.
- Punto de partida para ajuste adicional: al ser un checkpoint intermedio con perdida ya baja (0,0353), puede servir como inicializacion para experimentos de curriculum o de dominio con menos coste que partir del modelo base.
- Analisis de sobreajuste: al no existir split de validacion, este checkpoint es util para inspeccionar cualitativamente si el modelo ha memorizado el dataset antes de llegar al paso 50.000.
- Docencia y divulgacion sobre VLA: el repositorio incluye la configuracion de modalidades y los ficheros de estadisticas, lo que facilita explicar como se define la interfaz de observacion-accion en un modelo de este tipo.
- Reproduccion de infraestructura de entrenamiento: los datos de throughput (2,22 s/paso en 4x A100 80GB) y de hiperparametros permiten dimensionar y validar pipelines de entrenamiento similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reservo split de validacion y que la unica metrica reportada es la perdida de entrenamiento (0,0353 como media movil de 25 puntos en el paso 10.000). Tampoco se publican tasas de exito en tareas reales ni comparaciones cuantitativas con otros modelos.

Datos de rendimiento disponibles:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (paso 10.000) | 0,0353 (media movil de 25 puntos) |
| Throughput de entrenamiento | 2,22 s/paso |
| Hardware de entrenamiento | 4x A100 80GB |
| Split de validacion | no disponible (no se reservo) |
| Benchmarks de robotica (tasa de exito, etc.) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia aritmetica, los 3.144.016.000 parametros en BF16 ocupan aproximadamente 6,3 GB, a lo que hay que sumar activaciones, el procesamiento de imagen y las estructuras auxiliares del pipeline; no se dispone de una medicion oficial.
- GPU recomendadas: el autor solo documenta el hardware de entrenamiento (4x A100 80GB). Para inferencia no se indica ninguna GPU concreta.
- Viabilidad en GPU de consumo: no confirmada. El peso en BF16 (unos 6,3 GB) sugiere que podria caber en GPU de consumo con 12-16 GB o mas, pero no hay validacion publicada y el soporte de cuantizacion no esta documentado, por lo que no puede garantizarse.
- Opciones de despliegue: el modelo declara `library_name: transformers` y se carga mediante `Gr00tPolicy` del ecosistema Isaac GR00T, tras importar el fichero `ffw_sh5_left8_h50_config.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput en inferencia: no disponibles. El unico dato de rendimiento es el de entrenamiento (2,22 s/paso en 4x A100 80GB).
- Requisito adicional: es imprescindible registrar la configuracion de modalidades antes de instanciar el modelo; sin ella la carga falla o produce un comportamiento incorrecto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros que permitan una comparacion cuantitativa. La comparacion mas informativa es interna, entre este checkpoint y sus variantes publicadas por el mismo autor:

| Modelo | Paso | Repr. acciones | Tune visual | Perdida (train) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_10000` (este) | 10.000 / 50.000 | absoluta | si | 0,0353 | NVIDIA Open Model License | publico en HuggingFace |
| `learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_50000` | 50.000 / 50.000 | absoluta | si | no disponible en esta informacion | NVIDIA Open Model License | publico en HuggingFace |
| `learner1119/ffw_sh5_n17_260820_left_h50_abs_10000` | 10.000 / 50.000 | absoluta | no | no disponible | NVIDIA Open Model License | publico en HuggingFace |
| `learner1119/ffw_sh5_n17_260820_left_h50_rel_10000` | 10.000 / 50.000 | relativa | no disponible | no disponible | NVIDIA Open Model License | publico en HuggingFace |
| `nvidia/GR00T-N1.7-3B` (base) | n/a | n/a | n/a | n/a | NVIDIA Open Model License | publico en HuggingFace |

Comparacion con alternativas externas de la misma categoria (otros VLA de ~3B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe emplearse para generacion de texto, codigo, matematicas ni conversacion. Es una politica robotica ligada a una tarea y a un embodiment concretos.
- No hay medicion de generalizacion: el autor confirma que no se reservo split de validacion, por lo que la perdida de 0,0353 no permite estimar el rendimiento en escenarios no vistos.
- Especificidad extrema del dominio: entrenado solo con las 8 dimensiones izquierdas de un espacio de 16, y el brazo derecho nunca se mueve en los datos. Cualquier uso con un robot o una configuracion distintos exigira reajuste.
- Naturaleza de checkpoint intermedio: representa el paso 10.000 de 50.000; el propio autor recomienda el repositorio final salvo que se necesite este punto concreto de la curva. No debe tratarse como una version "ligera" o "recomendada".
- Carga no estandar: requiere importar `ffw_sh5_left8_h50_config.py` y usar `embodiment_tag="new_embodiment"`; ignorar este paso provoca fallos o resultados incorrectos.
- Sin cuantizaciones publicadas: solo hay pesos BF16, lo que limita el despliegue en hardware con poca memoria y complica la inferencia en tiempo real.
- Licencia: NVIDIA Open Model License. Es una licencia propia de NVIDIA, no una licencia open source aprobada por la OSI; conviene revisar sus terminos antes de cualquier uso comercial, especialmente las clausulas sobre redistribucion y sobre el modelo base heredado.
- Riesgo de alucinacion: no evaluado en la informacion disponible. En modelos VLA, el equivalente practico es la generacion de trayectorias plausibles pero fisicamente invalidas, riesgo que no puede descartarse sin validacion en banco.
- Idiomas: no disponibles. El modelo base incluye un componente de lenguaje, pero no se documenta ninguna capacidad multilingue ni su relevancia para la tarea.
- Estado del optimizador no incluido: no se pueden reanudar entrenamientos de forma exacta desde este checkpoint (no hay shards de DeepSpeed ZeRO-2).
- Metadatos incompletos: no se documentan idiomas, requisitos de hardware para inferencia ni el contenido detallado del dataset `learner1119/260820` mas alla de lo indicado.
- Fechas del repositorio (2026-09-14) posteriores a la fecha habitual de consulta: conviene verificar la vigencia de los enlaces y del modelo base antes de integrarlo.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_10000
- Checkpoint final del mismo entrenamiento: https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_50000
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/learner1119/260820
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Repositorios hermanos en el mismo paso: `learner1119/ffw_sh5_n17_260820_left_h50_abs_10000` y `learner1119/ffw_sh5_n17_260820_left_h50_rel_10000` (referenciados en la model card; no se proporcionan URL completas en la informacion disponible)
- Paper, blog o repositorio de codigo asociado: no disponible en los resultados de busqueda proporcionados (los resultados recibidos no guardan relacion con el modelo y corresponden a electrodomesticos de la marca Amica).
