# McGill-NLP/Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024

## Resumen

Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024 es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el grupo McGill-NLP que aplica la tecnica EchoMoE sobre el modelo base Kanana-2-30B-A3B de Kakao. EchoMoE no es un modelo nuevo entrenado desde cero, sino una adaptacion arquitectonica que modifica la comunicacion entre expertos en entornos de paralelismo de expertos: en lugar de transmitir cada estado oculto completo entre nodos, envia una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. El checkpoint concreto que nos ocupa usa una referencia cada 4 capas MoE, un codigo de dispatch de 512 dimensiones y un codigo de combine de 1024 dimensiones.

El modelo resuelve un problema de infraestructura mas que de capacidad: el cuello de botella de red en el despliegue distribuido de modelos MoE. Segun la model card, reduce un 50 por ciento los bytes intercambiados entre nodos y mejora el throughput un 14,6 por ciento con paralelismo de expertos 32 sobre 4 nodos, a costa de una perdida media de 2,4 puntos sobre el profesor en 18 benchmarks.

Es relevante ahora porque los modelos MoE de gran tamano son cada vez mas comunes en produccion y la comunicacion entre expertos se ha convertido en el factor limitante del rendimiento. EchoMoE propone una via para abaratar esa comunicacion sin reentrenar desde cero, mediante destilacion sobre un profesor ya ajustado. La arquitectura subyacente es deepseek_v3, con 48 capas, 128 expertos enrutados (6 activos) y 2 expertos compartidos, tamano oculto 2048 y 29.598 millones de parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE basada en deepseek_v3 (48 capas, 128 expertos enrutados con 6 activos, 2 expertos compartidos, hidden size 2048) con retrofit EchoMoE |
| Parametros totales | 29.598.193.536 (~29,6B) |
| Parametros activos | No disponible (el modelo base declara 30B-A3B; el numero exacto de parametros activos no se detalla en la informacion proporcionada) |
| Longitud de contexto | 32.768 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | No disponible (evaluado en bf16; no se listan cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | kanana-license (license: other, con enlace a LICENSE en el repositorio) |
| Formato de pesos | safetensors, con codigo remoto (custom_code) para transformers |

## Arquitectura y entrenamiento

El modelo parte de kanana-2-30b-a3b-base-2601, un transformer MoE de 48 capas con 128 expertos enrutados de los cuales 6 estan activos, mas 2 expertos compartidos y un tamano oculto de 2048. Sobre ese modelo base se aplico primero un ajuste supervisado con allenai/Dolci-Instruct-SFT para producir el profesor (Kanana-2-30B-A3B-SFT-EchoMoE-teacher). El checkpoint EchoMoE se obtiene por destilacion desde ese profesor sobre 4,3B tokens, entrenando todos los pesos, con datos que incluyen allenai/dolma3_dolmino_mix-10B-1025.

La innovacion tecnica es el mecanismo EchoMoE: en lugar de enviar cada estado oculto completo en la comunicacion all-to-all entre expertos, se envia una diferencia comprimida respecto a un estado de referencia que se refresca cada 4 capas MoE (12 de las 47 capas MoE actuan como referencia). El dispatch usa un codigo de 512 dimensiones y el combine un codigo de 1024 dimensiones. Esto reduce a la mitad los bytes intercambiados entre nodos. La evaluacion de precision se realizo con vLLM 0.21 y el plugin de EchoMoE, mientras que las pruebas de throughput usan el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP. Para transformers se requiere la version 5.8.1 y cargar el modelo con codigo remoto.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat integrada (apply_chat_template).
- Razonamiento y conocimiento general, evaluado en el dominio "knowledge and reasoning" con una media del 66,5 por ciento.
- Matematicas, con un rendimiento medio del 37,9 por ciento en el conjunto de benchmarks de matematicas.
- Generacion de codigo, con un 49,5 por ciento de media en los benchmarks de codigo.
- Seguimiento de instrucciones, con un 52,5 por ciento de media en las tareas de instruction following.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue distribuido de un MoE de ~30B en clusters multi-nodo: el modelo esta disenado para servir con paralelismo de expertos 32 sobre 4 nodos de 8 H100, donde la reduccion del 50 por ciento en bytes de red y la mejora del 14,6 por ciento de throughput lo hacen adecuado para entornos con red RDMA limitada.
- Servicio de chat conversacional en ingles: con contexto de 32.768 tokens y plantilla de chat, puede gestionar conversaciones multi-turno con historial largo, usando los ajustes recomendados de temperatura 0,7, top_p 0,8 y top_k 20.
- Investigacion en eficiencia de infraestructura: sirve como referencia reproducible para estudiar el compromiso entre compresion de activaciones y calidad, comparandolo directamente con el profesor sin comprimir.
- Prototipado en una sola GPU de 80 GB: los pesos en bf16 caben en una unica GPU de 80 GB mediante transformers con codigo remoto, lo que permite experimentacion sin montar un cluster.
- Tareas de instruction following con requisitos moderados de precision: con solo 0,5 puntos de perdida en ese dominio, es viable para asistentes que priorizan el cumplimiento de instrucciones sobre conocimiento factual.
- Evaluacion comparativa de tecnicas de compresion: util para equipos que investigan destilacion y compresion de comunicacion en MoE, dado que el repositorio publica los CSV de resultados de throughput.

## Benchmarks y rendimiento

Precision media (porcentaje) sobre 18 benchmarks por dominio, con la variacion respecto al profesor entre parentesis:

| Dominio | Profesor | EchoMoE |
|---|---|---|
| Conocimiento y razonamiento | 68,2 | 66,5 (−1,7) |
| Matematicas | 41,5 | 37,9 (−3,6) |
| Codigo | 53,4 | 49,5 (−3,9) |
| Seguimiento de instrucciones | 53,0 | 52,5 (−0,5) |
| **Media** | **58,5** | **56,1 (−2,4)** |

Throughput: ganancia sobre el profesor sin comprimir, ambos servidos con vLLM 0.29 y DeepEP con paralelismo de expertos 32 sobre 4 nodos de 8 H100, con asignacion equilibrada de expertos:

| Carga (tokens entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +12,5% | +10,8% |
| 1.024 → 128 | RDMA | 512 | +14,9% | +16,0% |
| 4.096 → 256 | RDMA | 128 | **+14,6%** | +14,1% |
| 16.384 → 512 | RDMA | 32 | +10,7% | +10,3% |

No se han publicado resultados de benchmarks individuales (MMLU, HumanEval, GSM8K) en la informacion disponible; solo se ofrecen medias agregadas por dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 (29,6B parametros) caben en una unica GPU de 80 GB segun la model card. Para cuantizaciones de 8 o 4 bits no se proporcionan datos.
- GPU recomendadas: H100 de 80 GB para el despliegue multi-nodo con paralelismo de expertos; una unica GPU de 80 GB (A100 80GB o H100 80GB) para inferencia en transformers.
- Cabe en GPU consumer: no disponible; con 29,6B parametros en bf16 no cabe en GPUs consumer de 24 GB, y no se documentan versiones cuantizadas.
- Opciones de despliegue: vLLM 0.21 con el plugin de EchoMoE (precision), runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP (throughput), y transformers 5.8.1 con codigo remoto. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: se reportan ganancias relativas de throughput del 10,3 al 16,0 por ciento frente al profesor segun carga y precision de comunicacion; no se publican valores absolutos de latencia ni tokens por segundo.
- Nota de despliegue: con vLLM conviene fijar --max-num-seqs 256 para que el arranque no supere el tiempo de espera de 600 segundos del servidor de API, ya que la captura de grafos CUDA crece con el numero de secuencias concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024 | ~29,6B | 32.768 | kanana-license | Hugging Face (McGill-NLP) | Version comprimida; media de 56,1 en 18 benchmarks |
| Kanana-2-30B-A3B-SFT-EchoMoE-teacher | No disponible | No disponible | No disponible | Hugging Face (McGill-NLP) | Profesor sin comprimir; media de 58,5; referencia de maxima calidad |
| kanana-2-30b-a3b-base-2601 | No disponible | No disponible | No disponible | Hugging Face (kakaocorp) | Modelo base original de Kakao, sin ajuste de instrucciones |

No se dispone de datos de otros modelos MoE comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: 2,4 puntos de media sobre el profesor, con las mayores caidas en codigo (−3,9) y matematicas (−3,6). No es adecuado para tareas donde esos dominios sean criticos sin una evaluacion previa.
- Solo ingles: la etiqueta de idioma del repositorio es unicamente "en"; no se garantiza rendimiento en castellano ni en otros idiomas.
- Licencia kanana-license: es una licencia "other" con terminos propios recogidos en el fichero LICENSE del repositorio. Es imprescindible revisarlos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Dependencia de codigo remoto: requiere trust_remote_code=True en transformers y una version concreta (5.8.1), ademas de un plugin especifico para vLLM. Esto anade riesgo de mantenimiento y superficie de ataque en produccion.
- Complejidad de despliegue: el rendimiento ventajoso depende de configuraciones concretas (paralelismo de expertos 32, DeepEP, RDMA, asignacion equilibrada de expertos). Fuera de ese entorno, las ganancias pueden no materializarse.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de factualidad ni de tasas de alucinacion; debe asumirse el riesgo habitual de los modelos de 30B.
- Sesgos: no se proporciona informacion sobre evaluaciones de sesgo o seguridad.
- Modelo de investigacion: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en produccion ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Resultados de throughput (CSV): https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Modelo profesor: https://huggingface.co/McGill-NLP/Kanana-2-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-30b-a3b-base-2601
- Paper: no disponible (pendiente de arXiv segun la model card)
