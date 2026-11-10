# amyjia1212/pi05-b1k-composting-waste-checkpoints

## Resumen

`amyjia1212/pi05-b1k-composting-waste-checkpoints` es un conjunto de checkpoints de un fine-tune completo del modelo de robotica **π0.5 (pi0.5)** de openpi (Physical Intelligence), condicionado por lenguaje y entrenado sobre demos de la tarea `composting_waste` del dataset BEHAVIOR-1K para el BEHAVIOR Challenge 2026. Lo publica el usuario `amyjia1212` como experimento temprano (agosto-septiembre de 2026) y, segun la propia model card, **no se utilizo en la entrega final** del challenge: el autor migro despues al modelo PI_BEHAVIOR y su checkpoint definitivo es `amyjia1212/b1k-2026-t90-91-93-96-97`.

El interes del repositorio es acotado pero real: sirve como referencia reproducible de un baseline oficial de π0.5 adaptado a BEHAVIOR-1K, con los scripts de normalizacion (`assets/`) y los pesos (`params/`) en formato JAX/Flax de openpi en los pasos 40000 y 49999. Para quien trabaje en manipulacion robotica con instrucciones en lenguaje natural dentro de BEHAVIOR, es un punto de partida documentado y con licencia permisiva, no un modelo listo para produccion.

No hay informacion publicada sobre arquitectura exacta, numero de parametros, contexto ni idiomas en la model card; el repositorio ocupa 223,7 GB, coherente con checkpoints completos de un modelo vision-lenguaje-accion de gran tamano en varios pasos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje-accion π0.5 de openpi; detalles no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | no disponible (condicionado por instrucciones en lenguaje natural; idioma de las demos no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints openpi (`params/` y `assets/`), formato JAX/Flax; no se indica GGUF ni safetensors |
| Entrada sensorial | RGB 224×224 |
| Pasos publicados | 40000 y 49999 (`checkpoints/<step>/`) |
| Tarea | `composting_waste` (task 90 de BEHAVIOR-1K) |
| Dataset de entrenamiento | 90 demos de `behavior-1k/2026-challenge-demos` |
| Tamano del repositorio | 223,7 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA ni adaptadores) del baseline oficial π0.5 de openpi, un modelo vision-lenguaje-accion condicionado por lenguaje que recibe observaciones RGB de 224×224 y emite acciones motoras. El entrenamiento se realizo con el fork de openpi para BEHAVIOR (`wensi-ai/openpi`, rama `behavior`), lo que implica que el pipeline de datos, la normalizacion de acciones y el bucle de entrenamiento siguen la implementacion oficial adaptada al simulador BEHAVIOR-1K.

Los datos son 90 demostraciones de la tarea `composting_waste` extraidas de `behavior-1k/2026-challenge-demos`. Se publican dos checkpoints, en los pasos 40000 y 49999, junto con los `assets/` que contienen las estadisticas de normalizacion necesarias para la inferencia. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset mas alla de la tarea, ni si hubo etapas de RLHF/DPO; al tratarse de un fine-tune de imitation learning sobre demos, lo esperable es entrenamiento supervisado por comportamiento, pero el autor no lo explicita.

## Capacidades

- Control robotico de manipulacion condicionado por instrucciones en lenguaje natural, dentro del entorno BEHAVIOR-1K.
- Ejecucion de la tarea especifica `composting_waste` (gestion de residuos de compostaje) a partir de demos humanas.
- Procesamiento de observaciones visuales RGB a 224×224 como entrada.
- Generacion de secuencias de acciones motoras (policy de accion continua) para el agente del simulador.
- Compatibilidad con el ecosistema openpi: carga de `params/` y `assets/` con las herramientas oficiales del repositorio.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- **Reproduccion de un baseline de π0.5 en BEHAVIOR-1K**: cargar los checkpoints de los pasos 40000 o 49999 con el fork `wensi-ai/openpi` (rama `behavior`) para verificar el rendimiento del baseline oficial sobre `composting_waste` antes de introducir modificaciones propias.
- **Punto de partida para fine-tunes de la tarea 90**: usar estos pesos como inicializacion al entrenar variantes con mas demos o con aumentacion de datos, ya que ya estan adaptados al dominio visual y de acciones de la tarea.
- **Depuracion del pipeline de datos de BEHAVIOR**: comparar los `assets/` (estadisticas de normalizacion) publicados con las calculadas a partir de `behavior-1k/2026-challenge-demos` para validar que el preprocesado de 224×224 y la normalizacion de acciones coinciden.
- **Analisis de convergencia**: evaluar la diferencia de comportamiento entre el paso 40000 y el 49999 para estimar si el entrenamiento seguia mejorando o ya estaba saturado con 90 demos.
- **Estudio de imitation learning con pocos datos**: con solo 90 demostraciones, el checkpoint sirve para medir el efecto del numero de demos en tareas de manipulacion de contact-rich dentro de BEHAVIOR.
- **Referencia para comparativas de checkpoints del challenge**: al ser un experimento descartado por el autor, permite contrastar su rendimiento con el checkpoint final `amyjia1212/b1k-2026-t90-91-93-96-97` y con el modelo PI_BEHAVIOR.
- **Docencia y divulgacion**: ejemplo real de fine-tune completo de un VLA en un benchmark de robotica con licencia Apache 2.0 y artefactos completos (pesos y estadisticas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en BEHAVIOR-1K ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. El repositorio pesa 223,7 GB con dos checkpoints completos, lo que sugiere pesos de gran tamano; no se indica el tamano por checkpoint ni la precision de almacenamiento.
- **GPU recomendadas**: no disponible en la model card. Por el ecosistema openpi (JAX/Flax) y el tamano de los pesos, es razonable esperar GPU de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente memoria, pero el autor no lo especifica.
- **Compatibilidad con GPU de consumo**: no confirmada; depende del tamano real de los parametros, que no se publica.
- **Opciones de despliegue**: el camino documentado es el repositorio openpi (`wensi-ai/openpi`, rama `behavior`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de accion robotica.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amyjia1212/pi05-b1k-composting-waste-checkpoints` | no disponible | no disponible | `composting_waste` (BEHAVIOR-1K, task 90) | Apache 2.0 | Hugging Face, 2 checkpoints (pasos 40000 y 49999) |
| `amyjia1212/b1k-2026-t90-91-93-96-97` | no disponible | no disponible | Tareas 90, 91, 93, 96 y 97 | no disponible en la informacion | Hugging Face (checkpoint final del autor) |
| PI_BEHAVIOR (mencionado por el autor) | no disponible | no disponible | BEHAVIOR-1K | no disponible en la informacion | no disponible en la informacion |
| π0.5 baseline oficial de openpi | no disponible | no disponible | Politica generalista vision-lenguaje-accion | no disponible en la informacion | Repositorio openpi |

## Limitaciones y advertencias

- **Checkpoint descartado por el autor**: la model card indica explicitamente que no se uso en la entrega final del BEHAVIOR Challenge 2026; no debe tratarse como el estado del arte del autor.
- **Especificidad extrema de tarea**: entrenado solo con 90 demos de `composting_waste`; no se espera generalizacion a otras tareas de BEHAVIOR ni a entornos reales.
- **Riesgo de sobreajuste**: 90 demostraciones y un fine-tune completo sobre un VLA grande es una combinacion propensa a memorizar el dataset; no hay metricas publicadas que lo descarten.
- **Sesgos**: no documentados; al derivar de demos humanas en simulador, puede heredar sesgos de las trayectorias de los demostradores.
- **Alucinacion**: no aplica en el sentido de texto generado, pero si en forma de acciones no validas o fuera de distribucion cuando la observacion se aleja de las demos.
- **Idiomas**: no se especifica el idioma de las instrucciones de condicionamiento; no hay garantia de soporte multilingue.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base π0.5 y el fork `wensi-ai/openpi` pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- **Formato y portabilidad**: pesos en formato openpi (JAX/Flax), no en safetensors ni GGUF; requiere el stack de openpi para cargarlos.
- **Sin datos de rendimiento**: no hay benchmarks ni curvas de entrenamiento publicadas, lo que impide estimar su calidad objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amyjia1212/pi05-b1k-composting-waste-checkpoints
- Checkpoint final del autor: https://huggingface.co/amyjia1212/b1k-2026-t90-91-93-96-97
- Repositorio del proyecto del autor: https://github.com/amyjia1212/airii_behavior1k_2026
- Fork de openpi para BEHAVIOR: https://github.com/wensi-ai/openpi (rama `behavior`)
- Dataset de demos del challenge: https://huggingface.co/datasets/behavior-1k/2026-challenge-demos
