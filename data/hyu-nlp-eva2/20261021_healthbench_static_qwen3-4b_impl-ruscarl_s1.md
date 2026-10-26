# HYU-NLP-EVA2/20261021_healthbench_static_qwen3-4b_impl-ruscarl_s1

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino un conjunto de checkpoints intermedios de un entrenamiento de aprendizaje por refuerzo. Concretamente, aloja los pesos originales generados con el stack VERL + FSDP durante un proceso de RL sobre una base Qwen3-4B, identificado por el autor como `20261021_healthbench_static_qwen3-4b_impl-ruscarl_s1`. El nombre sugiere que el entrenamiento se realizó sobre la variante estática del benchmark HealthBench, con una implementación denominada `ruscarl` y una semilla o ejecución `s1`; la model card no aporta detalles adicionales sobre el algoritmo, la recompensa ni los hiperparámetros.

El interés de este repositorio es fundamentalmente de investigación y reproducibilidad: permite auditar la evolución del entrenamiento paso a paso (se han verificado los pasos 10 a 170 en incrementos de 10, con los pasos 180 a 290 pendientes de subida) y reanudar o comparar experimentos de RL. No es un artefacto desplegable: tal y como advierte el autor, son checkpoints FSDP de VERL, no pesos consolidados en formato Transformers ni vLLM, y requieren el merger FSDP correspondiente antes de cualquier uso.

El tamaño del repositorio, 332,2 GB, es coherente con el almacenamiento de múltiples estados completos de entrenamiento (pesos más estados del optimizador) de un modelo de aproximadamente 4 000 millones de parámetros, distribuidos en directorios `checkpoints/global_step_N/actor/`. Cada checkpoint ronda los 19,5 GB de media si se reparten los 332,2 GB entre los 17 pasos verificados, una cifra que encaja con shards en precisión de entrenamiento sin consolidar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el identificador indica que deriva de Qwen3-4B (transformer denso), no verificado en el repositorio |
| Parametros totales | No disponible de forma explicita; el identificador apunta a ~4 000 millones (Qwen3-4B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene shards FSDP en precision de entrenamiento, sin versiones cuantizadas publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Shards FSDP de VERL en `checkpoints/global_step_N/actor/`; no hay safetensors consolidados ni GGUF |
| Tamano del repositorio | 332,2 GB |
| Pasos verificados | 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170 |
| Pasos pendientes | 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290 |
| Pipeline declarado | reinforcement-learning |
| Framework de entrenamiento | VERL con FSDP (segun la model card) |
| Fecha de creacion | 2026-10-26 |
| Ultima actualizacion | 2026-10-26 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo ni la receta de entrenamiento. Lo unico verificable es el pipeline: se trata de un entrenamiento de aprendizaje por refuerzo gestionado con VERL y paralelizado con Fully Sharded Data Parallel, cuyos estados se han volcado periodicamente en el layout `checkpoints/global_step_N/actor/`. El sufijo `healthbench_static` indica que el escenario de evaluacion o de recompensa esta ligado a la variante estatica de HealthBench, un benchmark de calidad de respuestas clinicas, pero no se especifica si se uso como reward model, como filtro de datos o como metrica de validacion durante el RL.

Tampoco se detallan el numero de tokens consumidos, la composicion del dataset, ni si hubo etapas previas de SFT, RLHF o DPO antes del bucle de RL. La unica innovacion tecnica documentada es de infraestructura, no de modelado: la estrategia de publicacion de checkpoints, que sube como maximo dos de forma concurrente, verifica tamano y checksum en vivo antes de borrar los 23 checkpoints locales mas recientes, y conserva los anteriores para no romper la trazabilidad de la ejecucion. Para reproducir el experimento hay que aplicar el merger FSDP de VERL que corresponda a la version usada en el entrenamiento; los pesos no son cargables directamente por `transformers` ni por vLLM.

## Capacidades

- Entrenamiento de RL reproducible: el repositorio expone estados intermedios cada 10 pasos, lo que permite analizar curvas de recompensa, divergencias y saturacion del entrenamiento.
- Reanudacion de experimentos: los checkpoints de `actor` incluyen el estado necesario para continuar el bucle de RL en VERL, no solo los pesos del modelo.
- Evaluacion comparativa por paso: al conservarse pasos antiguos, se puede medir la degradacion u olvido catastrofico introducido por el RL frente al modelo base.
- Base heredada de Qwen3-4B (no verificada en el repositorio): si la correspondencia con el modelo base se confirma tras el merger, heredaria sus capacidades de generacion de texto, razonamiento, codigo y matematicas.
- Capacidades de tool calling, agentes, vision o audio: no disponible; no se documentan en la model card y no pueden asumirse a partir del identificador.
- Capacidades multilingues: no disponible.
- Modo thinking o modos especiales: no disponible.

## Casos de uso

- Reproduccion de experimentos de RL: aplicar el merger FSDP de VERL sobre `global_step_N/actor` y reanudar el entrenamiento desde el paso 170 para continuar hasta los pasos 180-290 que el autor tiene pendientes de subir, comparando la curva de recompensa con la ejecucion original.
- Auditoria de calidad de respuestas clinicas: evaluar checkpoints intermedios contra el split estatico de HealthBench para determinar en que paso el ajuste por RL mejora la factualidad y en cual empieza a degradar la utilidad clinica.
- Estudio de olvido catastrofico: comparar el checkpoint del paso 10 con el del paso 170 sobre tareas generales (matematicas, codigo) para cuantificar cuanto conocimiento del modelo base se pierde al optimizar exclusivamente una recompensa de dominio sanitario.
- Analisis de estabilidad del entrenamiento: inspeccionar la evolucion de los pesos y de los estados del optimizador entre pasos consecutivos para detectar picos de norma, divergencias o colapso de la politica antes de que se manifiesten en la metrica final.
- Punto de partida para fine-tuning posterior: consolidar el checkpoint con mejor rendimiento y usarlo como inicializacion de un SFT especifico de dominio, en lugar de partir del Qwen3-4B original.
- Verificacion de integridad y procedencia: usar los checksums y el historial de pasos para certificar que un resultado publicado corresponde exactamente a un estado de entrenamiento concreto, algo relevante en revision por pares de articulos sobre RL en ambito clinico.
- Construccion de un modelo desplegable (con reservas): tras el merger y una evaluacion exhaustiva, exportar a safetensors y generar cuantizaciones GGUF o AWQ para prototipos en local; requiere validacion propia porque el autor no publica pesos consolidados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de HealthBench ni de ninguna otra evaluacion, pese a que el nombre del repositorio hace referencia explicita a `healthbench_static`. Tampoco se aportan curvas de recompensa ni comparaciones con el modelo base.

## Requisitos de hardware

- Almacenamiento: 332,2 GB ocupados por el repositorio completo; descargar unicamente el directorio de un paso concreto reduce la necesidad a unos 19,5 GB estimados por checkpoint (calculo aproximado a partir del tamano total y de los 17 pasos verificados).
- Inferencia: no es posible sin un paso previo de consolidacion. Tras el merger, un modelo de ~4 000 millones de parametros en bf16 requiere del orden de 8-9 GB de VRAM solo para pesos, mas cache KV; con cuantizacion de 4 bits (no publicada) se reduciria a unos 2,5-3 GB.
- GPU recomendadas para entrenamiento o reanudacion: el entrenamiento con FSDP y estados de optimizador en precision completa exige nodos multi-GPU; el repositorio no especifica el hardware empleado. Para reanudar con un modelo de este tamano se necesitan como minimo varias GPU con 40-80 GB (A100, H100, L40S) o un nodo con interconnect rapido.
- GPU de consumo: la inferencia del modelo consolidado en bf16 cabe en una RTX 4090 (24 GB) o RTX 3090; en cuantizacion de 4 bits cabria en GPUs de 8 GB. El entrenamiento no es viable en hardware de consumo.
- Despliegue: requiere primero el merger FSDP de VERL; despues, vLLM o TGI para servidores en bf16/fp16, y llama.cpp u Ollama solo si se generan pesos GGUF por cuenta propia.
- Latencia y throughput: no disponible; no hay mediciones publicadas y dependerian del formato final tras el merger.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Uso directo |
|---|---|---|---|---|---|
| Este repositorio (checkpoint RL sobre Qwen3-4B) | ~4 000 M (inferido del identificador) | No disponible | Shards FSDP de VERL | No disponible | No; requiere merger |
| Qwen3-4B (modelo base de referencia) | ~4 000 M | No disponible en esta ficha; consultar su model card | Safetensors | No disponible en esta ficha; consultar su model card | Si |
| Otros checkpoints de RL de la misma familia (HYU-NLP-EVA2) | No disponible | No disponible | Shards FSDP de VERL | No disponible | No; requieren merger |

No se dispone de datos de rendimiento de este checkpoint ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- No es un modelo desplegable: son checkpoints FSDP de entrenamiento, no pesos consolidados; cargarlos directamente en `transformers` o vLLM fallara.
- Requiere el merger FSDP de VERL en la version exacta empleada durante el entrenamiento; una version distinta puede producir pesos corruptos o silenciosamente incorrectos.
- Licencia no declarada: no hay base legal explicita para uso comercial, y la licencia del modelo base no se hereda automaticamente si el autor no la declara.
- Especializacion estrecha: el ajuste por RL sobre una recompensa ligada a HealthBench puede degradar capacidades generales (codigo, matematicas, instrucciones fuera de dominio); hay que medirlo, no asumirlo.
- Riesgo de alucinacion: sin datos de evaluacion publicados, se desconoce el comportamiento factual del modelo en dominio clinico, donde los errores tienen consecuencias graves. No debe usarse como asesor medico.
- Sesgos: no documentados. El dataset de RL y el criterio de recompensa no se describen, por lo que los sesgos introducidos son opacos.
- Idiomas y contexto: no disponibles; no se puede garantizar soporte multilingue ni una ventana concreta sin verificar el modelo base.
- Repositorio en construccion: los pasos 180-290 estan pendientes y el autor borra checkpoints locales tras verificar checksums, de modo que el contenido puede cambiar con el tiempo. Fijar el commit o el paso concreto antes de reproducir resultados.
- Coste de almacenamiento elevado (332,2 GB) y descargas lentas; conviene usar descarga selectiva por directorio.
- Fechas del repositorio (creado en 2026-10-26) y nomenclatura `20261021`: verificar la correspondencia entre identificador y ejecucion real antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/20261021_healthbench_static_qwen3-4b_impl-ruscarl_s1
- Modelo base de referencia (identificado en el nombre, no confirmado por el autor): https://huggingface.co/Qwen/Qwen3-4B

No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.
