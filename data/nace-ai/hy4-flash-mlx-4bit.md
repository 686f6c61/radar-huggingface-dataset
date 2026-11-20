# nace-ai/Hy4-flash-MLX-4bit

## Resumen

Hy4-flash-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo Hy4-flash de Tencent, publicada por Nace.AI. El modelo original es un transformer de gran escala con arquitectura de mezcla de expertos (MoE) y un total de 220.251.201.958 parametros segun los pesos en safetensors. Esta version esta pensada para ejecutarse con mlx-lm sobre hardware Apple Silicon y GPU NVIDIA, y reduce el peso del modelo de texto a 131,20 GB manteniendo una divergencia KL de 0,113 respecto al modelo nativo en BF16.

La relevancia de esta ficha radica en que se trata de una cuantizacion con una metodologia propia, la Nace Weight Space Quantization, que asigna precisiones distintas a cada clase de pesos: los expertos enrutados y las tablas Engram n-gram se guardan en 4 bits, mientras que la atencion, los expertos compartidos, los embeddings y la cabeza de salida se mantienen en 8 bits, y el router, las normas y otros pesos sensibles conservan su precision original. Segun el autor, esto permite obtener la KL mas baja de todos los paquetes MLX de Hy4 que midio, con un 18% menos de descarga que la alternativa de Xylolabs.

El modelo esta orientado a generacion de texto y conversacion, e incluye un drafter especulativo (DFly2) y un tower de vision en el repositorio, aunque el archivo del modelo no ejecuta la vision. La licencia es la Tencent Hy License, Version 1.0, con terminos comerciales especificos para grandes operadores de Model-as-a-Service.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y tablas Engram n-gram; detalles completos de la arquitectura no disponibles |
| Parametros totales | 220.251.201.958 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en expertos enrutados y tablas Engram; 8 bits en atencion, expertos compartidos, embeddings y cabeza de salida; precision de origen en router, normas y pesos sensibles |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (tencent-hy-license) |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash de Tencent emplea una arquitectura de transformer con mezcla de expertos, en la que los expertos enrutados se complementan con expertos compartidos y con tablas Engram n-gram, un componente que el autor de la cuantizacion menciona explicitamente al describir el reparto de precisiones. La cuantizacion de Nace.AI no reentrena el modelo: parte del modelo nativo en BF16 y reasigna la precision de cada clase de pesos segun su sensibilidad, midiendo la divergencia KL resultante contra la referencia nativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original uso RLHF o DPO.

La innovacion tecnica destacable de este paquete es doble. Por un lado, la Nace Weight Space Quantization aplica 4 bits con grupos mas finos a las tablas Engram y a los expertos enrutados, y 8 bits al resto del tronco. Por otro, el repositorio incluye un drafter especulativo llamado DFly2, que en una B200 decodifica 2,1 veces mas rapido de media que la decodificacion greedy simple y 3,4 veces mas rapido en codigo; el autor advierte que la salida puede diferir de la greedy cuando dos tokens estan casi empatados. El modelo requiere mlx-lm 0.32.2 o superior y `trust_remote_code`, ya que carga `hy_v4_flash.py` desde el propio repositorio.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (text-generation).
- Razonamiento y escritura de instrucciones: los textos de evaluacion del autor cubren prosa, codigo, matematicas, multilingue y escritura de instrucciones.
- Generacion de codigo, con un rendimiento especialmente bueno del drafter especulativo en este dominio (3,4x de aceleracion).
- Matematicas, segun la cobertura de los textos de evaluacion del autor.
- Capacidades multilingues, segun la cobertura de los textos de evaluacion del autor; la lista concreta de idiomas no esta disponible.
- Decodificacion especulativa opcional mediante el drafter DFly2 incluido en el repositorio (flag `--dfly`).
- Tower de vision incluido en el repositorio, pero no ejecutable con este archivo de modelo.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Generacion de codigo en local sobre Apple Silicon: el modelo puede ejecutarse con mlx-lm sobre un Mac con memoria unificada suficiente, usando el drafter DFly2 para acelerar la decodificacion en tareas de codigo, donde el autor reporta 3,4x de mejora.
- Prototipado de asistentes conversacionales: al ser un modelo de texto conversacional, sirve para construir demos de chat multi-turno en entornos de desarrollo con MLX, aunque la ventana de contexto no esta documentada.
- Evaluacion de cuantizaciones: el paquete incluye `evaluation.json` con las puntuaciones de KL por texto, lo que lo convierte en una referencia util para comparar estrategias de cuantizacion de Hy4 en MLX.
- Inferencia en hardware NVIDIA: el autor lo ejecuto con mlx-lm y mlx sobre una B200, por lo que puede usarse como banco de pruebas de MLX en GPU fuera del ecosistema Apple.
- Investigacion sobre decodificacion especulativa: el drafter DFly2 incluido permite estudiar el impacto de la decodificacion especulativa en latencia y en divergencia de salida respecto a la greedy.
- Despliegue de un modelo de 220.000 millones de parametros en un solo equipo: con 131,20 GB de pesos de texto y mapeo en memoria desde SSD (probado en un M5 Pro), es viable para experimentacion en estaciones de trabajo de gama alta.

## Benchmarks y rendimiento

| Metrica | Hy4-flash-MLX-4bit (Nace) | Xylolabs MLX 4-bit | Nace GGUF Q4_K_M |
|---|---|---|---|
| Divergencia KL vs BF16 nativo | 0,113 | 0,116 | 0,108 |
| Precision top-1 | 90,5% | no disponible | no disponible |
| Tamano de descarga | 133,82 GB (131,20 GB de texto) | 163,56 GB (97,55 GB en safetensors + 66,00 GB en tablas Engram FP8) | 127,22 GB |

Las puntuaciones se calculan sobre 11 textos reservados, con 511 posiciones de siguiente token cada uno, midiendo la KL contra el modelo nativo en BF16. Segun el autor, ninguno de los 11 textos se uso para elegir ajustes. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 131,20 GB para los pesos de texto, mas overhead de ejecucion; el autor probo el mapeo en memoria desde SSD en un M5 Pro.
- GPU recomendadas: NVIDIA B200 (probada por el autor); GPU Apple Silicon con memoria unificada suficiente.
- Cabe en GPU de consumo: no disponible; por tamano, no es viable en GPUs de consumo convencionales de 24 GB o 48 GB.
- Opciones de despliegue: mlx-lm 0.32.2 o superior con `trust_remote_code` y mlx 0.32.4; el repositorio incluye `run_mlx.py`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este paquete.
- Latencia y throughput: el autor reporta 2,1x de decodificacion mas rapida de media con `--dfly` frente a greedy simple en una B200, y 3,4x en codigo. No se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-MLX-4bit (Nace) | 220,25 B | no disponible | 0,113 | Tencent Hy License 1.0 | Hugging Face, MLX |
| Xylolabs MLX 4-bit | no disponible | no disponible | 0,116 | no disponible | Hugging Face, MLX |
| Nace GGUF Q4_K_M | no disponible | no disponible | 0,108 | Tencent Hy License 1.0 | Hugging Face, GGUF |

La comparativa se limita a las alternativas de cuantizacion de Hy4 que el autor midio. No se dispone de datos para comparar con modelos de otros desarrolladores de tamano o tarea similar.

## Limitaciones y advertencias

- La licencia Tencent Hy License, Version 1.0 incluye terminos comerciales especificos en su seccion 10 para grandes operadores de Model-as-a-Service; es necesario revisarlos antes de un uso comercial.
- La cuantizacion a 4 bits introduce divergencia respecto al modelo nativo: 0,113 de KL y 90,5% de precision top-1, lo que implica que aproximadamente uno de cada diez tokens mas probables no coincide con el modelo BF16.
- La decodificacion con `--dfly` puede producir salidas distintas de la greedy cuando dos tokens estan casi empatados.
- El tower de vision esta incluido en el repositorio pero no se ejecuta con este archivo de modelo.
- No hay informacion publicada sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto.
- Requiere `trust_remote_code`, lo que implica ejecutar codigo del repositorio (`hy_v4_flash.py`); conviene auditar ese archivo antes de desplegarlo.
- El modelo tiene solo 10 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.
- El rendimiento medido por el autor se realizo en una B200 y en un M5 Pro; no hay datos de latencia en otras configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio del autor: https://www.nace.ai/
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/nace-ai/Hy4-flash-MLX-4bit/blob/main/LICENSE
- Modificaciones (MODIFICATIONS.md en el repositorio): https://huggingface.co/nace-ai/Hy4-flash-MLX-4bit/blob/main/MODIFICATIONS.md
