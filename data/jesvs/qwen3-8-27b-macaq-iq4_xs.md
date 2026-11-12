# jesvs/Qwen3.8-27B-MACaQ-IQ4_XS

## Resumen

Qwen3.8-27B-MACaQ-IQ4_XS es una cuantizacion GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el usuario jesvs. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de pesos a 4 bits con una tecnica concreta: rotacion de Hadamard por bloques de 64 aplicada mediante la herramienta MACaQ (Huawei CSL) y refinamiento posterior con un codebook vectorial. El resultado es un fichero de 13,9 GiB que reduce el peso del modelo original de 27.324.089.344 parametros a un formato IQ4_XS con embeddings en Q4_K y capa de salida en Q6_K.

La relevancia de esta publicacion es doble. Por un lado, demuestra una via de cuantizacion alternativa a las recetas estandar de llama.cpp, con calibracion mediante imatrix sobre WikiText-2 (~1M tokens) y un refinamiento VQ sobre 16.384 tokens en 62 bloques. Por otro, incluye el recipe.json completo (549 KB) con hashes y formas de tensor por bloque, lo que permite reproducir el pipeline. El autor reporta una recuperacion total en tool calling (36/36 frente a 34/36 del Q4_K_M estandar) y una huella de VRAM un 12% menor, aunque con calidad general dentro del ruido estadistico.

La advertencia principal es que los pesos han sido rotados con Hadamard y no cargan en llama.cpp estandar: requieren los binarios del fork de MACaQ. Esto limita su uso a entornos dispuestos a compilar y mantener ese fork, y lo aleja de despliegues convencionales con Ollama, LM Studio o vLLM sin adaptaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; pesos en formato GGUF) |
| Parametros totales | 27.324.089.344 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (embeddings Q4_K, output Q6_K); rotacion Hadamard por bloques de 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico de 14 GB; requiere fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, del que no se detallan en la informacion disponible ni la arquitectura interna (transformer denso, MoE o hibrido), ni el volumen de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Lo que si se documenta es el proceso de cuantizacion: metodo MACaQ D1 combinado con rotacion block-Hadamard de tamano 64 y refinamiento con codebook vectorial. La calibracion imatrix se hizo sobre WikiText-2 (~1M tokens) y el refinamiento VQ uso 16.384 tokens de calibracion distribuidos en 62 bloques.

La innovacion tecnica destacable es precisamente esa rotacion Hadamard: transforma los tensores antes de cuantizar para redistribuir la energia y reducir el error en 4 bits, a costa de romper la compatibilidad con kernels estandar. El autor publica el recipe.json completo con hashes SHA-256 y formas de tensor por bloque, lo que convierte la publicacion en un artefacto reproducible mas que en una simple conversion. No se reportan datos sobre decodificacion especulativa, attention linear ni otras optimizaciones de inferencia mas alla del propio formato cuantizado.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Tool calling y function calling: el autor reporta 36/36 escenarios agenticos resueltos en su evaluacion local, frente a 34/36 del Q4_K_M estandar.
- Razonamiento multi-paso y uso en agentes: la metrica de "retries" (6/6 recuperados frente a 4/6) sugiere robustez en recuperacion de errores dentro de flujos agenticos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking: no disponibles.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede servirse mediante una API compatible con el esquema de endpoints habitual.

## Casos de uso

- Agentes de automatizacion con tool calling: el modelo muestra una tasa de exito completa en los escenarios agenticos medidos por el autor, lo que lo hace adecuado para pipelines donde el modelo debe invocar funciones externas y recuperarse de fallos de llamada.
- Despliegue en GPUs de gama consumer con VRAM ajustada: con 13,9 GiB de huella, cabe en configuraciones de 16 GB (RTX 4080, 4060 Ti 16 GB, A4000) y en pools combinados de 16 GB + 12 GB como el que usa el autor.
- Servicio de chat multi-turno autoalojado: mediante llama-server del fork MACaQ, con `-ngl all -sm layer -fa on`, para equipos que quieran evitar dependencias de APIs externas.
- Investigacion en tecnicas de cuantizacion: el recipe.json y la metodologia D1 + Hadamard + VQ permiten reproducir y comparar el pipeline frente a recetas estandar de llama.cpp.
- Evaluacion comparativa de formatos: util para medir el impacto real de IQ4_XS rotado frente a Q4_K_M en calidad, velocidad y VRAM en un mismo hardware.
- Prototipado de asistentes con requisitos de latencia moderada: a 23,0 tok/s en el hardware del autor, sirve para entornos interactivos no criticos en tiempo real.
- Entornos con restricciones de licencia: al ser Apache 2.0, puede integrarse en productos comerciales sin las clausulas adicionales de otras licencias de modelos abiertos.

## Benchmarks y rendimiento

Los unicos datos disponibles son las evaluaciones locales del autor, en una sola maquina y con una sola ejecucion, por lo que deben tratarse como senales indicativas y no como resultados reproducibles de benchmark estandar.

| Evaluacion | MACaQ IQ4_XS | llama.cpp Q4_K_M |
|---|---|---|
| Calidad (39 tests locales) | 31 | 32 (dentro del ruido) |
| Tool use (36 escenarios agenticos) | 36/36 | 34/36 |
| Recuperacion tras fallo (retries) | 6/6 | 4/6 |
| Velocidad de generacion | 23,0 tok/s | 21,1 tok/s |
| VRAM | 13,9 GiB | 15,9 GiB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 13,9 GiB para el fichero GGUF completo con todas las capas en GPU (`-ngl all`).
- GPU recomendadas: el autor probo un pool dual de 16 GB + 12 GB; el build CUDA del fork esta testeado en Blackwell. Por tamano, encaja en RTX 4080, RTX 4060 Ti 16 GB, RTX 4090, A4000, A5000, A6000, L4 y A100/H100 sin problema de capacidad.
- Cabe en GPU consumer: si, en cualquier tarjeta con 16 GB o mas de VRAM, siempre que se use el fork de MACaQ.
- Opciones de despliegue: exclusivamente llama.cpp del fork de MACaQ (`llamacpp/llama.cpp/build/bin/`), con `llama-server -m qwen38-27b-macaq-iq4xs.gguf -ngl all -sm layer -fa on`. No es compatible con llama.cpp estandar, y por extension tampoco con Ollama, LM Studio o vLLM sin modificaciones.
- Latencia y throughput: 23,0 tok/s de generacion en el hardware del autor (pool 16 GB + 12 GB), aproximadamente un 9% superior al Q4_K_M en la misma configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MACaQ-IQ4_XS | 27,3B | no disponible | GGUF IQ4_XS rotado | Apache 2.0 | Requiere fork de MACaQ; 13,9 GiB |
| Qwen3.8-27B (Q4_K_M estandar) | 27,3B | no disponible | GGUF Q4_K_M | Apache 2.0 | Compatible con llama.cpp estandar; 15,9 GiB |
| Qwen3.8-27B (pesos completos) | 27,3B | no disponible | safetensors | Apache 2.0 | Referencia de calidad; requiere mucha mas VRAM |

La comparacion directa con otras familias de modelos del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp estandar: los tensores rotados por Hadamard solo son interpretables por los kernels del fork de MACaQ. Cualquier intento de carga en herramientas convencionales fallara.
- Dependencia de un fork mantenido por terceros: el soporte, las actualizaciones y la compatibilidad futura dependen del repositorio huawei-csl/MACaQ, no de un ecosistema establecido.
- Evaluaciones no reproducibles: los benchmarks son ejecuciones unicas en una sola maquina, sin intervalo de confianza; el propio autor advierte que las diferencias cercanas al ruido no deben sobreinterpretarse.
- Calidad general practicamente identica al Q4_K_M (31 frente a 32 en 39 tests), por lo que la ventaja principal es la huella de VRAM y el tool calling, no una mejora de calidad.
- Calibracion limitada a WikiText-2: el imatrix se construyo sobre ~1M tokens de un corpus en ingles de Wikipedia, lo que puede penalizar dominios especializados o idiomas distintos del ingles.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue en esta model card.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan evaluaciones de factualidad ni de sesgo.
- Contexto maximo no especificado: se desconoce la ventana efectiva del modelo base en esta publicacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del fork MACaQ por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesvs/Qwen3.8-27B-MACaQ-IQ4_XS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio MACaQ: https://github.com/huawei-csl/MACaQ
