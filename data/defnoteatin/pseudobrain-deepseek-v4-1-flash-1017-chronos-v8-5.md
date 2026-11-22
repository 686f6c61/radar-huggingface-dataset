# defnoteatin/PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v8.5

## Resumen

PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v8.5 es un runtime de inferencia calibrado para ejecutar el modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017` en una unica GPU, publicado por el usuario `defnoteatin` en Hugging Face. No se trata de un modelo nuevo con pesos propios, sino de una configuracion de despliegue en tres niveles (GPU, CPU y NVMe) que combina cuantizacion MXFP4, tablas INT4 "Engram" respaldadas en disco y una calibracion de enrutamiento fuera de muestra para el MoE del modelo base. El autor declara explicitamente que los pesos son "unmodified stock weights, zero abliteration".

La propuesta tecnica se articula en dos variantes. Chronos v8 opera sobre el MoE de 552B parametros con un reparto de 84B en GPU (MXFP4), 136B en CPU fijada en RAM (MXFP4) y 164B en CPU en 2 bits mediante SVD, con contexto de 16K a 128K. Chronos v8.5 anade a esa base un componente de 196B parametros en tablas Engram INT4 (capas 1 y 14) respaldadas en NVMe, alcanzando 748B totales y un contexto fijo de 131.072 tokens.

El interes del artefacto es practico: demuestra una via para servir un modelo de escala muy grande en un nodo unico con 96 GB de VRAM, 176 GB de RAM y almacenamiento NVMe, sacrificando latencia por viabilidad de memoria. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0.0 GB, lo que sugiere que las tablas Engram aun no se han subido o no estan disponibles publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (modelo base DeepSeek-V4.1-Flash-1017); runtime de 3 niveles GPU/CPU/NVMe con tablas Engram INT4 en v8.5 |
| Parametros totales | 552B (Chronos v8, MoE); 748B (Chronos v8.5, incluye 196B de Engram) |
| Parametros activos | no disponible |
| Longitud de contexto | 16K–128K (v8); 131.072 tokens / 128K (v8.5) |
| Tipos de cuantizacion | MXFP4 (GPU y CPU pinneada), 2-bit SVD (nivel CPU), INT4 (tablas Engram) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se mencionan ficheros `.bin` partidos para Engram y un fichero de calibracion `.pt`; pesos del modelo base en su formato original) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo desde cero: es una capa de despliegue sobre `deepseek-ai/DeepSeek-V4.1-Flash-1017`, cuya arquitectura interna (numero de expertos, dimensiones, atencion) no se detalla en la informacion disponible. Lo que si se describe es la estrategia de reparto en tres niveles. El nivel T1 mantiene 84B parametros en GPU en MXFP4; el nivel T2 fija 136B parametros en RAM del sistema tambien en MXFP4; el nivel T3 mantiene 164B parametros en CPU comprimidos a 2 bits mediante descomposicion en valores singulares (SVD). El enrutamiento entre niveles se gobierna por un fichero de calibracion (`chronos_dsv41_v8_routing_calibration.pt`) generado fuera de muestra.

La variante v8.5 incorpora un componente adicional denominado Engram: dos tablas INT4 de 196B parametros en total asociadas a las capas 1 y 14, almacenadas en NVMe (unos 103 GiB repartidos en el directorio `engram/`) y recuperadas mediante `pread` multihilo en C con pthreads, seguidas de descompresion INT4 en GPU. Esta es la innovacion tecnica central del artefacto: trasladar capacidad efectiva a almacenamiento persistente y descomprimirla bajo demanda, aceptando el coste de E/S. No se aportan datos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO, ya que el autor no modifica los pesos.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento matematico, con un 98,00% reportado en GSM8K (147/150) en la fase A de evaluacion.
- Generacion de codigo, con un 74,29% en LiveCodeBench (78/105) y desglose por dificultad (facil 100%, medio 82,86%, dificil 40,00%).
- Soporte de contexto largo: hasta 131.072 tokens en la variante v8.5.
- Capacidad de ejecucion en un unico nodo con GPU, CPU y NVMe, lo que habilita modelos de escala 552B–748B en hardware no distribuido.
- Tool calling, function calling, capacidades de agente, vision, audio o modo "thinking": no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion de modelos de escala frontier en hardware propio: un equipo con una GPU de 96 GB, 176 GB de RAM y NVMe puede ejecutar el modelo base sin recurrir a un cluster multi-GPU, usando Chronos v8 como configuracion de referencia para reproducir benchmarks.
- Investigacion sobre enrutamiento MoE en tres niveles: el fichero de calibracion y el reparto 84/136/164B permiten estudiar politicas de offload y su impacto en latencia y calidad, comparando con estrategias de offload convencionales.
- Pruebas de concepto de memoria persistente tipo Engram: la variante v8.5 sirve para medir el coste real de recuperar tablas INT4 desde NVMe con `pread` multihilo y descompresion en GPU en cargas de contexto largo (128K).
- Auditoria de calidad de un modelo base sin modificar: al mantener los pesos originales, permite validar resultados como MMLU (87,00%), MMLU-Pro (85,33%) y GSM8K (98,00%) sobre el checkpoint oficial sin riesgo de abliteration ni alteraciones.
- Generacion de codigo asistida en entornos con requisitos de soberania de datos: al ejecutarse en un nodo unico on-premise, encaja en escenarios donde no se permite enviar prompts a APIs externas, siempre que se asuma la latencia del reparto en tres niveles.
- Benchmarking de herramientas de inferencia: comparar el rendimiento de este runtime con vLLM, llama.cpp o TGI sobre el mismo modelo base para cuantificar el coste del offload a CPU y NVMe en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado | Muestra |
|---|---|---|---|
| Fase A razonamiento (agregado) | Chronos v8 552B, engram=None | 89,33% (536/600) | n=600 |
| MMLU | Chronos v8 552B, engram=None | 87,00% (261/300; 93,67% auditado) | n=300 |
| MMLU-Pro | Chronos v8 552B, engram=None | 85,33% (128/150) | n=150 |
| GSM8K | Chronos v8 552B, engram=None | 98,00% (147/150) | n=150 |
| LiveCodeBench (test6.jsonl) | Chronos v8 552B, engram=None, reasoning_effort=1 | 74,29% (78/105) | n=105 |
| LiveCodeBench — facil | idem | 100,0% (35/35) | n=35 |
| LiveCodeBench — medio | idem | 82,86% (29/35) | n=35 |
| LiveCodeBench — dificil | idem | 40,00% (14/35) | n=35 |

BigCodeBench-Hard (Stage 1b) y DeepSWE v1.1 128K (Stage 2, Milestone-25) se describen como "en ejecucion" sobre Chronos v8.5, sin resultados publicados en la informacion disponible. No se han publicado resultados para la variante v8.5 con Engram activo.

## Requisitos de hardware

- VRAM: 96 GB en GPU para el nivel T1 (84B parametros en MXFP4); el resto se reparte entre RAM y NVMe.
- RAM del sistema: 176 GB para el nivel T2 (136B parametros en MXFP4) y espacio de trabajo adicional.
- Almacenamiento: NVMe necesario para el nivel T3 (164B en 2-bit SVD) y, en v8.5, para las tablas Engram INT4 (~103 GiB repartidos en `engram/`).
- GPU recomendadas: el autor especifica 96 GB de VRAM, lo que corresponde a A100 80GB con margen insuficiente, H100 80GB igualmente insuficiente, o aceleradores con 96 GB o mas (por ejemplo H200 141GB, MI300X 192GB o variantes profesionales de gran capacidad). No se confirma compatibilidad con RTX 4090 (24 GB) ni con GPUs de consumo.
- Despliegue: runtime propio descrito en la model card, con `pread` multihilo en C para Engram y descompresion INT4 en GPU. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain Chronos v8.5 (este artefacto) | 748B (552B MoE + 196B Engram) | 131.072 | MXFP4 + 2-bit SVD + INT4 Engram en NVMe | no disponible | Repositorio publico, 0 descargas, 0.0 GB |
| DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible | no disponible | pesos originales | no disponible | Referenciado como base |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier mejora o degradacion respecto al modelo base proviene del reparto en niveles y de la cuantizacion, no de nuevos datos.
- La cuantizacion agresiva (2-bit SVD en T3, INT4 en Engram) puede degradar la calidad frente a los pesos originales; el autor la describe como "lossless-hot" pero no aporta comparacion completa contra el modelo sin cuantizar.
- El repositorio tiene 0 descargas, 0 likes y 0.0 GB de tamano: las tablas Engram pueden no estar subidas, y los comandos `cat` de reensamblado presuponen ficheros `.part0/.part1/.part2` que no se confirman disponibles.
- Los benchmarks publicados corresponden a Chronos v8 sin Engram; no hay resultados de la variante v8.5 con Engram activo, ni de BigCodeBench-Hard o DeepSWE, que se describen como en ejecucion.
- La latencia sera previsiblemente alta por el offload a CPU y NVMe; no se publican mediciones de throughput ni de tiempo por token.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas soportados no disponibles.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Requiere hardware poco comun (96 GB de VRAM, 176 GB de RAM y NVMe) y un runtime propio no estandarizado, lo que complica la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v8.5
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
