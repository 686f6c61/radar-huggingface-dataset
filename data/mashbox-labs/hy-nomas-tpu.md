# mashbox-labs/Hy-Nomas-TPU

## Resumen

Hy-Nomas-TPU es un port a Google Cloud TPU del modelo mundial de vídeo abierto Hy-Nomas desarrollado por Tencent Hunyuan, adaptado por MASHBOX Labs. No se trata de un modelo de lenguaje, sino de un modelo generativo de vídeo interactivo ("video world model") que genera mundos jugables en el navegador a partir de una TPU v6e-4. El port mantiene los pesos originales de `tencent/Hy-Nomas` sin modificarlos y añade una pila de ejecución en JAX/XLA optimizada para el hardware TPU de Google.

La relevancia del proyecto reside en su enfoque de eficiencia: el pipeline completo cabe en un único chip TPU v6e de 32 GB con el modelo principal cuantizado, y el port incluye kernels propios que superan al JAX estándar en el mismo chip, además de una caché de compilación XLA distribuida para reducir drásticamente el tiempo de arranque. El modelo genera vídeo a 1280x704 píxeles y 24 fps.

La información pública disponible es limitada: la model card se centra en métricas de rendimiento y despliegue en TPU, no en la arquitectura interna ni en los datos de entrenamiento del modelo base. Esta ficha refleja únicamente lo que consta en la documentación del autor y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo de vídeo; pesos originales de tencent/Hy-Nomas, ejecutados en JAX/XLA sobre TPU) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo principal cuantizado (el pipeline completo cabe en 32 GB); esquema de cuantizacion no especificado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | pesos originales de tencent/Hy-Nomas cargados sin modificar; caché de compilacion XLA en tar (`xla-cache/v6e4-jax0.11.2-libtpu0.0.48.1.tar`, 0.23 GB) |

Datos adicionales de despliegue:

| Parametro | Valor |
|---|---|
| Resolucion de salida | 1280x704 a 24 fps |
| Tamano del repo | 10.3 GB |
| Hardware objetivo | TPU v6e (una chip de 32 GB para el pipeline completo; el comando `mashbox run` arranca en v6e-4) |
| Entorno de ejecucion | `mashbox` 0.1.10, Python 3.12, JAX 0.11.2, libtpu 0.0.48.1 |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base Hy-Nomas (tipo de red, numero de parametros, mecanismo de atencion ni estrategia de generacion de video). Lo que si consta es que este repositorio es un port de inferencia: los pesos de `tencent/Hy-Nomas` se cargan sin cambios y la aportacion de MASHBOX Labs se concentra en la capa de ejecucion sobre TPU.

Esa capa incluye kernels propios en JAX/XLA que, segun las graficas del autor, superan al JAX estandar en el mismo chip, y una cache de compilacion XLA empaquetada que reduce el tiempo hasta el primer frame de 10 min 40,1 s a 1 min 20,7 s en un chip nuevo. Tambien se ofrece un decodificador propio ("MASHBOX Fast decoder") que reduce el coste de computo por segundo de video de 1,045 s a 0,689 s frente al decodificador de Tencent. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de video interactivo ("world model") a 1280x704 y 24 fps, reproducible en el navegador mediante la interfaz de `mashbox run hy-nomas --ui`.
- Ejecucion en tiempo real o cercano a tiempo real en TPU v6e-4: 1,045 s de computo por segundo de video con el decodificador de Tencent y 0,689 s con el decodificador MASHBOX Fast (1,00 s equivale a tiempo real).
- Pipeline completo en una sola chip TPU v6e de 32 GB (720p, modelo principal cuantizado) a 2,46 s de computo por segundo de video.
- Decodificacion de video con dos opciones de decodificador intercambiables (Tencent y MASHBOX Fast).
- Servicio local via interfaz web en `127.0.0.1:8790`, accesible por tunel SSH desde la maquina del usuario.
- Soporte de cache de compilacion XLA para acelerar arranques sucesivos.
- No consta soporte de tool calling, agentes, vision de entrada, audio ni modo "thinking"; es un modelo generativo de video, no un LLM.

## Casos de uso

- Investigacion en modelos mundiales de video: permite ejecutar Hy-Nomas en infraestructura TPU de Google Cloud sin reescribir el pipeline, util para grupos que ya trabajan en JAX/XLA y quieren reproducir resultados del modelo de Tencent.
- Prototipado de entornos interactivos: la interfaz web servida en local permite explorar mundos generados en el navegador, adecuada para demos y validacion conceptual de video interactivo.
- Evaluacion de eficiencia en aceleradores: las metricas de computo por segundo de video y los tiempos de arranque permiten comparar TPU v6e frente a otras plataformas en cargas generativas de video.
- Benchmarking de decodificadores: la comparacion entre el decodificador de Tencent (1,045 s) y el MASHBOX Fast (0,689 s) sirve para estudiar el impacto de la decodificacion en el coste total del pipeline.
- Despliegue en TPU de un solo chip con presupuesto de memoria ajustado: el pipeline completo cabe en 32 GB con el modelo principal cuantizado, lo que facilita entornos de investigacion con recursos limitados.
- Formacion y divulgacion tecnica: la guia de despliegue y el `AGENTS.md` permiten que agentes de codigo automaticen la puesta en marcha en una VM de TPU, util para talleres y laboratorios docentes.
- Integracion en pipelines de generacion de video bajo licencia Apache 2.0, sin restricciones de uso comercial derivadas de la licencia del port.

## Benchmarks y rendimiento

| Chip | Medida | Resultado | Referencia |
|---|---|---|---|
| TPU v6e-4 | Computo por segundo de video, preset de calidad, decodificador Tencent (1,00 = tiempo real) | 1,045 s (mediana de 87 y de 27 ventanas en dos chips) | 1,00 s = tiempo real |
| TPU v6e-4 | Computo por segundo de video, preset de calidad, decodificador MASHBOX Fast | 0,689 s (mediana de 77 ventanas) | 1,045 s con el decodificador de Tencent en el mismo tipo de chip |
| TPU v6e-4 | Primer arranque en chip nuevo sin cache de compilacion (comando a primer frame; incluye compilacion) | 10 min 40,1 s | n/a |
| TPU v6e-4 | Arranques posteriores (comando a primer frame; pesos en memoria de la VM) | 1 min 14,8 s (mediana de 5 arranques; rango 1 min 7,2 s a 1 min 43,6 s) | n/a |
| TPU v6e-4 | Primer arranque en chip nuevo con los programas compilados del repo | 1 min 20,7 s | 10 min 40,1 s sin ellos (unos 9 minutos de compilacion), mismo chip |
| TPU v6e-1 (una chip, 32 GB) | Computo por segundo de video, pipeline completo en una chip, 720p, modelo principal cuantizado | 2,46 s (ejecucion de 60 s) | 1,00 s = tiempo real |

No se han publicado resultados de benchmarks de calidad del modelo (tipo FVD, MMLU u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el pipeline completo cabe en una sola chip TPU v6e de 32 GB con el modelo principal cuantizado (720p).
- Hardware recomendado: TPU v6e-4 para el modo interactivo con el comando `mashbox run` (1,045 s o 0,689 s de computo por segundo de video segun decodificador).
- Hardware minimo documentado: una chip TPU v6e (32 GB) para el pipeline completo, a 2,46 s de computo por segundo de video.
- Chips no probados: TPU v5e y slice TPU v5p (v5p-8) figuran como "not tested yet" en la model card.
- GPU consumer: no consta soporte; el port esta orientado a TPU y no se documenta ejecucion en GPU.
- Opciones de despliegue: paquete `mashbox` 0.1.10 con extras `[tpu,hy-nomas]`, Python 3.12, JAX 0.11.2 y libtpu 0.0.48.1; interfaz web local en `127.0.0.1:8790` accesible por tunel SSH. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia de arranque: 10 min 40,1 s en chip nuevo sin cache; 1 min 14,8 s en arranques posteriores con pesos en memoria; 1 min 20,7 s en chip nuevo con la cache de compilacion del repo.
- Throughput: no se publica una cifra de frames por segundo agregada; la metrica disponible es el computo por segundo de video.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy-Nomas-TPU (este) | Modelo mundial de video, port a TPU | no disponible | no disponible | TPU v6e (32 GB una chip; comando en v6e-4) | apache-2.0 | HuggingFace, `mashbox` 0.1.10 |
| tencent/Hy-Nomas | Modelo mundial de video original | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de video comparables en la informacion proporcionada; la unica comparacion documentada es frente al propio modelo base y frente al JAX estandar en el mismo chip.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el numero de parametros ni los datos de entrenamiento del modelo base; la evaluacion tecnica del modelo en si queda fuera del alcance de este repositorio.
- No hay benchmarks de calidad de video publicados; las metricas disponibles son exclusivamente de rendimiento y latencia.
- El port esta disenado para TPU: no se documenta soporte para GPU consumer ni para frameworks de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).
- Los chips TPU v5e y v5p (v5p-8) figuran como no probados, por lo que la compatibilidad con esas generaciones no esta garantizada.
- El primer arranque en un chip nuevo sin cache de compilacion tarda 10 min 40,1 s, lo que puede ser problematico en entornos efimeros o con arranques frecuentes.
- El modelo base es de Tencent Hunyuan y su licencia original no se detalla en la informacion disponible; la licencia Apache 2.0 declarada corresponde al repositorio del port, por lo que conviene verificar los terminos del modelo base antes de un uso comercial.
- No consta informacion sobre sesgos, riesgo de alucinacion visual ni limitaciones de idioma del modelo base.
- El numero de descargas y likes del repositorio es cero, lo que indica ausencia de validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mashbox-labs/Hy-Nomas-TPU
- Modelo base: https://huggingface.co/tencent/Hy-Nomas
- Paquete en PyPI: https://pypi.org/project/mashbox/0.1.10/
- Repositorio GitHub: https://github.com/mashbox-labs/mashbox
- Guia del modelo: https://mashbox.gg/docs/models/hy-nomas
- Guia de configuracion en Google Cloud: https://mashbox.gg/docs/google-cloud
- AGENTS.md (v0.1.10): https://github.com/mashbox-labs/mashbox/blob/v0.1.10/AGENTS.md
- Perfil en X: https://x.com/mashboxgg
