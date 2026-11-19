# samueltm/Chimera-Qwen3.6-35B-A3B-GGUF

## Resumen

Chimera-Qwen3.6-35B-A3B-GGUF es un paquete de despliegue publicado por el usuario samueltm que permite ejecutar el modelo Qwen3.6-35B-A3B (35.000 millones de parametros totales, 3.000 millones activos por token, arquitectura MoE) en una maquina sin GPU, exclusivamente sobre CPU, con un limite de 7 GB de RAM para el servidor incluyendo la cache de paginas. No es un modelo nuevo entrenado desde cero, sino una cuantizacion mixta del modelo base de Qwen mas un adaptador LoRA entrenado con RL para razonar de forma mas concisa, acompanado de un parche para el motor ik_llama.cpp.

El problema que resuelve es concreto: hacer viable un modelo MoE de 35B en hardware de gama baja (un portatil de 4 nucleos o una VM de 6 nucleos) mediante lectura de expertos desde SSD bajo demanda, saltado de expertos de baja masa y decodificacion especulativa con la cabeza MTP original del modelo. El paquete incluye script de instalacion, lanzador del servidor y un proxy compatible con la API de OpenAI que impone un presupuesto de razonamiento de 14.000 tokens.

Es relevante ahora porque demuestra una via practica para servir modelos grandes en entornos con restricciones severas de memoria, a costa de velocidad y de dependencia de un fork del motor. La licencia es Apache-2.0, heredada del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0,2 GB (los pesos del GGUF se descargan aparte, 14,4 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Qwen3.6-35B-A3B), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 35B en el modelo base; el campo de parametros del repo (76.677.120) no es coherente con la model card y se ignora |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible (la model card no la especifica para el modelo base) |
| Tipos de cuantizacion | GGUF con receta mixta `q_inproj4_lmi`; expertos de las capas 12/35/36 en IQ4_XS; fichero `q_c59.gguf` de 14,4 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`q_c59.gguf`), LoRA en GGUF (`rl_it12.gguf`, 153 MB), parche de motor (`patches/ik_llama.cpp-chimera.diff`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 35B parametros totales y 3B activos por token. Sobre el se aplica una cuantizacion mixta denominada `q_inproj4_lmi`, con los expertos de las capas 12, 35 y 36 en IQ4_XS, conservando la cabeza MTP (multi-token prediction) original para decodificacion especulativa. El paquete incluye ademas un LoRA de 153 MB entrenado con aprendizaje por refuerzo para producir razonamientos mas concisos con la misma precision; se aplica en tiempo de ejecucion y no modifica los pesos base.

La innovacion tecnica no esta en el entrenamiento sino en el sistema de inferencia: el parche sobre ik_llama.cpp anade lectura de expertos desde SSD bajo demanda desde un fichero empaquetado por experto con cache por capa, saltado de expertos de baja masa y decodificacion especulativa MTP con `p_min 0.9`. Un proxy compatible con OpenAI impone un presupuesto de pensamiento de 14.000 tokens con respuesta forzada despues del corte, limitando el tiempo de respuesta. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento multi-paso en modo thinking, con presupuesto configurable de hasta 14.000 tokens de razonamiento y hasta 4.000 de respuesta.
- Razonamiento matematico: la model card reporta 33/33 en un conjunto retenido de 11 problemas con 3 semillas y 15/28 en AIME 2026 con el presupuesto de 14k tokens.
- Razonamiento conciso gracias al LoRA entrenado con RL, con un coste medido de +0,18 % de perplejidad en el peor de cuatro dominios.
- Decodificacion especulativa mediante cabeza MTP, integrada en el motor parcheado.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), con el razonamiento en `reasoning_content` y la respuesta en `content`.
- Soporte de tool calling, function calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia de un MoE de 35B en portatiles sin GPU: con un i5-8265U de 4 nucleos y NVMe se midieron 12,8–13,3 tok/s, suficiente para asistentes de codigo o chat local en un equipo de 16 GB de RAM.
- Servicio de razonamiento en VMs de bajo coste: en una VM de 6 nucleos Xeon a 2,2 GHz con disco de red se midieron 7,7–8,1 tok/s, un perfil adecuado para tareas por lotes donde la latencia no es critica.
- Despliegue en entornos con restricciones estrictas de memoria: el servidor corre en un cgroup con `MemoryMax=7e9` y sin swap, lo que permite convivir con otros servicios en la misma maquina.
- Evaluacion de decodificacion especulativa y lectura de expertos desde disco: el paquete incluye el parche del motor y el empaquetado de expertos, util para investigar tecnicas de inferencia MoE con memoria limitada.
- Sustitucion de API en prototipos: el proxy expone un endpoint compatible con OpenAI en el puerto 8080, lo que permite apuntar clientes existentes sin cambios de codigo.
- Razonamiento matematico acotado en tiempo: el presupuesto de 14k tokens con respuesta forzada limita el coste por consulta, adecuado para pipelines que necesitan un limite superior de latencia.
- Experimentacion con LoRA aplicado en runtime: permite comparar el comportamiento del modelo base frente al adaptador RL sin recargar los pesos.

## Benchmarks y rendimiento

| Prueba | Resultado | Notas |
|---|---|---|
| Perplejidad LoRA vs base (4 dominios) | +0,18 % en el peor dominio | limite fijado en +1 % |
| Conjunto de matematicas retenido (11 problemas, 3 semillas) | 33/33 | — |
| AIME 2026 (28 problemas, semilla 0) | 15/28 | con presupuesto de 14k tokens |
| AIME 2026 sin presupuesto | 17/28 | el presupuesto cuesta unos 3 problemas en derivaciones largas |
| Conjunto sintetico de aritmetica exacta (30 problemas) | 11/30 | 27 de 30 agotan el presupuesto de pensamiento |

Velocidad de inferencia (T=1, top_k 20, top_p 0,95):

| Maquina | tok/s | Estado |
|---|---|---|
| Escritorio de 6 nucleos Zen 3 con NVMe | ≈42–50 equivalentes | estimado con modelo de coste, no confirmado con reloj de pared |
| Portatil i5-8265U (4 nucleos, 15 W) con NVMe | 12,8–13,3 | medido, limitado por CPU |
| VM cloud, 6 nucleos Xeon a 2,2 GHz, disco de red | 7,7–8,1 | medido, limitado por disco |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- RAM: 16 GB en el sistema; el servidor esta limitado a 7 GB incluyendo la cache de paginas.
- CPU: Linux x86-64 con AVX2, 6 nucleos de escritorio o mejor (calibrado en 6 nucleos Zen 3); en Windows, WSL2.
- Disco: SSD NVMe obligatorio (se leen decenas de MB por token) y unos 40 GB libres para modelo, LoRA, expertos empaquetados y motor.
- GPU: no se usa GPU; no se reportan requisitos de A100, H100 ni RTX 4090.
- Despliegue: motor ik_llama.cpp parcheado (obligatorio), script `deploy/install.sh`, lanzador `deploy/chimera-server.sh` (puerto 18096) y proxy `deploy/chimera_proxy.py` (puerto 8080). Con root y systemd se ejecuta en cgroup con `MemoryMax=7e9` y sin swap; sin root, sin limite.
- Throughput y latencia: ver tabla de la seccion anterior. Las respuestas del proxy no son en streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Chimera-Qwen3.6-35B-A3B-GGUF | 35B totales, 3B activos | no disponible | Apache-2.0 | CPU con ik_llama.cpp parcheado | Lectura de expertos desde SSD, 7 GB de RAM |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | no disponible | Apache-2.0 | Requiere motor estandar; sin parche no cabe en 7 GB | Referencia de calidad; el paquete Chimera deriva de el |
| Alternativas GGUF de uso general (llama.cpp estandar) | segun modelo | segun modelo | segun modelo | CPU/GPU con llama.cpp | No disponible comparativa numerica concreta en la informacion proporcionada |

No se dispone de datos de rendimiento de terceros para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El motor parcheado es obligatorio: el GGUF carga en llama.cpp estandar pero no cabe en 7 GB ni alcanza las velocidades indicadas.
- La velocidad en el escritorio de 6 nucleos Zen 3 (≈42–50 tok/s) es una estimacion de modelo de coste, no una medicion confirmada.
- Dependencia fuerte del disco: se leen decenas de MB por token; un SSD no NVMe degrada gravemente el rendimiento.
- El presupuesto de 14k tokens reduce la precision en derivaciones largas: 15/28 frente a 17/28 en AIME 2026.
- El conjunto sintetico de aritmetica exacta obtiene 11/30, con 27 de 30 problemas agotando el presupuesto: el modelo no es fiable en calculo exacto de muchos pasos.
- Las respuestas del proxy no son en streaming, lo que afecta a la experiencia en interfaces conversacionales.
- La documentacion dentro de `deploy/` esta en portugues.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta cuantizacion.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.6-35B-A3B; conviene verificar la model card original.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria ni evidencia de uso en produccion.
- El campo de parametros del repo (76.677.120) no concuerda con los 35B declarados; tratar ese dato con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/samueltm/Chimera-Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Paper, blog o demo adicionales: no disponible
