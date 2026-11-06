# lamamkh/PhysAgentGym-Qwen2.5-Coder-7B

## Resumen

PhysAgentGym-Qwen2.5-Coder-7B es un adaptador QLoRA publicado por Lama Moukheiber (usuario `lamamkh`) sobre el modelo base Qwen2.5-Coder-7B-Instruct. El adaptador se entrena especificamente para el bucle de agente definido en el articulo *PhysAgentGym: Free Physical-Law Verifiers for Training Small Code-Reasoning Agents* (NeurIPS 2026). El modelo lee un escenario de fisica clasica, escribe codigo Python que lo simula y refina ese codigo a partir de la retroalimentacion de verificadores basados en leyes fisicas.

El proposito del adaptador es convertir un modelo de codigo generico en un agente capaz de razonar sobre mecanica clasica de un solo cuerpo, con capacidad de autocorreccion guiada por verificadores deterministas. Es relevante porque demuestra que un ajuste fino ligero (LoRA rango 16) sobre un modelo de 7B puede alcanzar puntuaciones medias de verificador cercanas a 0.94 en tareas dentro y fuera de distribucion, sin necesidad de entrenamiento a gran escala.

El checkpoint ocupa 0.1 GB (solo los pesos del adaptador, no el modelo base), usa licencia Apache 2.0 y esta pensado para ejecutarse junto con el repositorio de codigo del proyecto, que define el formato de acciones y el bucle de rollout.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA |
| Parametros totales | no disponible (modelo base de 7B; el adaptador ocupa 0.1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parametros. El ajuste se realiza con QLoRA: el modelo base se carga en 4-bit NF4 y se entrena un adaptador LoRA de rango 16, alpha 32 y dropout 0.05 sobre todas las proyecciones de atencion y MLP. El entrenamiento consiste en supervised fine-tuning sobre 491 rollouts de agente generados con Claude Sonnet 4.5, filtrados para conservar solo aquellos que superan todas las comprobaciones fisicas y obtienen una puntuacion de al menos 0.85. Se usan 3 epocas con learning rate 2e-4 y semilla 42, ejecutado en una NVIDIA A100 mediante `scripts/train_sft.py`.

La innovacion principal no esta en la arquitectura del modelo, sino en el paradigma de entrenamiento: los rollouts se validan con verificadores de leyes fisicas gratuitos (sin necesidad de un modelo juez), lo que permite generar datos de alta calidad para el bucle de razonamiento codigo-fisica. El adaptador esta especializado en el formato de accion del bucle PhysAgentGym y en mecanica clasica de un solo cuerpo. El autor advierte que el reentrenamiento no es reproducible bit a bit en GPU, por lo que las puntuaciones pueden diferir ligeramente de las de la Tabla 2 del articulo (agregado 0.942).

## Capacidades

- Generacion de codigo Python para simular escenarios de fisica clasica (mecanica de un solo cuerpo).
- Razonamiento guiado por verificadores: interpreta retroalimentacion de comprobaciones de leyes fisicas y refina el codigo en consecuencia.
- Bucle de agente multi-paso segun el formato de acciones de PhysAgentGym.
- Generacion de texto y conversacion (heredada del modelo base Qwen2.5-Coder-7B-Instruct).
- Capacidades de codigo generales del modelo base (no evaluadas especificamente en este adaptador).
- Soporte de tool calling: no documentado especificamente para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Simulacion de escenarios de fisica clasica: el modelo recibe un enunciado (por ejemplo, un problema de oscilador amortiguado) y genera codigo Python que lo simula, valido contra verificadores de leyes fisicas. Es adecuado porque el adaptador esta entrenado exactamente para ese bucle.
- Generacion de material didactico de fisica: produce codigo ejecutable que reproduce el comportamiento de sistemas mecanicos, util para crear ejercicios interactivos o notebooks docentes.
- Evaluacion de agentes de razonamiento cientifico: sirve como referencia o baseline en experimentos que midan la capacidad de un modelo de autocorregirse ante verificadores deterministas.
- Investigacion en entrenamiento con verificadores: el adaptador y su pipeline permiten reproducir el paradigma de PhysAgentGym para experimentar con otros dominios con verificadores formales (quimica, circuitos, etc.).
- Prototipado de asistentes de resolucion de problemas fisicos: integrado en un agente que recibe un problema, genera codigo, lo ejecuta y lo corrige hasta pasar las comprobaciones.
- Automatizacion de tareas de modelado fisico sencillo: generar scripts de simulacion de sistemas de un solo cuerpo para pipelines de analisis o docencia, con validacion automatica incluida.
- Fine-tuning como punto de partida: al ser un adaptador LoRA sobre un modelo Apache 2.0, puede servir de inicializacion para ajustes posteriores en dominios fisicos mas amplios.

## Benchmarks y rendimiento

Puntuacion media del verificador en 120 tareas de test (30 por subcategoria), con episodios fallidos puntuados como 0 e intervalo bootstrap del 95% sobre el agregado.

| Categoria | Puntuacion |
|---|---|
| PE-KE (en distribucion) | 0.941 |
| Linear (en distribucion) | 0.971 |
| Circular (casi fuera de distribucion) | 0.911 |
| Damping (muy fuera de distribucion) | 0.920 |
| Agregado [IC 95%] | 0.936 [0.919, 0.950] |

El articulo reporta un agregado de 0.942 en su ejecucion principal de 7B (Tabla 2); este checkpoint reentrenado obtiene 0.936. No se han publicado en la informacion disponible comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: el modelo base de 7B en 4-bit NF4 requiere aproximadamente 5-6 GB de VRAM; en FP16, alrededor de 14-16 GB. El adaptador anade una cantidad marginal (0.1 GB en disco).
- GPU recomendadas: NVIDIA A100 (usada en el entrenamiento), H100, o GPUs consumer con al menos 8 GB de VRAM para cuantizacion 4-bit (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Cabe en GPU consumer: si, con el modelo base cuantizado (4-bit u 8-bit) en GPUs con 8-16 GB de VRAM.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), vLLM y llama.cpp no estan documentados especificamente para este adaptador; el flujo oficial es `scripts/rollout.py` del repositorio PhysAgentGym.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysAgentGym-Qwen2.5-Coder-7B | 7B (base) + LoRA | no disponible | Agente de fisica con verificadores | Apache 2.0 | Hugging Face (9 descargas) |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible | Codigo general e instrucciones | Apache 2.0 | Hugging Face (ampliamente usado) |
| Alternativas especializadas en fisica/ciencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada. La comparacion mas directa es con el modelo base Qwen2.5-Coder-7B-Instruct, sobre el que se aplica el adaptador; el adaptador anade especializacion en el bucle PhysAgentGym a costa de un posible estrechamiento de las capacidades generales de codigo.

## Limitaciones y advertencias

- Especializacion estrecha: entrenado solo en mecanica clasica de un solo cuerpo y en el formato de accion de PhysAgentGym; fuera de ese dominio su rendimiento no esta garantizado.
- Dependencia del bucle de agente: el adaptador espera el formato de acciones y el bucle de rollout del repositorio del proyecto; usarlo de forma aislada puede degradar los resultados.
- Rendimiento fuera de distribucion: aunque Circular y Damping obtienen puntuaciones altas (0.911 y 0.920), el autor las clasifica como casi y muy fuera de distribucion, lo que sugiere menor fiabilidad en escenarios no vistos.
- Reproducibilidad: el entrenamiento en GPU no es bit a bit reproducible, por lo que las puntuaciones pueden variar respecto al articulo.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo fisicamente incorrecto que pase verificadores incompletos o produzca resultados plausibles pero erroneos.
- Sesgos: no documentados en la informacion proporcionada.
- Idiomas: no especificados; el modelo base Qwen2.5-Coder tiene soporte multilingue, pero el adaptador no documenta comportamiento por idioma.
- Licencia: Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base (Apache 2.0).
- Madurez: 9 descargas y 0 likes en el momento de la consulta; proyecto de investigacion reciente (NeurIPS 2026), sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lamamkh/PhysAgentGym-Qwen2.5-Coder-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Pagina del proyecto: https://lamawmouk.github.io/PhysAgentGym/
- Codigo: https://github.com/lamawmouk/PhysAgentGym
- Articulo: Moukheiber, L. *PhysAgentGym: Free Physical-Law Verifiers for Training Small Code-Reasoning Agents*, NeurIPS 2026 (referencia bibliografica en la model card)
