# mkd-minkeun/Keural-Lab-1108

## Resumen

Keural-Lab-1108 es un checkpoint experimental publicado por el desarrollador independiente Minkeun Kim (usuario `mkd-minkeun` en Hugging Face) bajo la marca Keural. Se trata de un ajuste fino del modelo Qwen3.6-35B-A3B de Alibaba, una arquitectura MoE (mixture of experts) con aproximadamente 49.277 millones de parametros totales y unos 4.300 millones activos por token, segun los datos de la model card. El repositorio ocupa 98,6 GB en formato safetensors y se distribuye con licencia Apache 2.0, derivada de la del modelo base.

El modelo resuelve, en principio, el mismo tipo de tareas que su base: generacion de texto, razonamiento, codigo y matematicas con soporte de modo thinking. Sin embargo, la model card es explicita: es un checkpoint experimental y, segun la propia evaluacion del autor, rinde por debajo del modelo base en todos los benchmarks publicados (MMLU 0,817 frente a 0,839; GSM8K 0,899 frente a 0,963; IFEval 0,916 frente a 0,941; GPQA Diamond 0,788 frente a 0,823). Su relevancia actual es, por tanto, la de un artefacto de investigacion para estudiar el efecto de ajustes finos sobre un MoE grande, no la de un modelo listo para produccion.

La informacion disponible es escasa: no hay detalle sobre el dataset de ajuste, el numero de tokens de entrenamiento ni el proceso de alineacion. La model card solo documenta la evaluacion comparativa y un ejemplo de despliegue con vLLM. Cualquier dato no presente en la informacion proporcionada se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) tipo transformer, derivada de Qwen3.6-35B-A3B |
| Parametros totales | 49.277.098.096 (~49,3B) |
| Parametros activos | ~4,3B por token |
| Longitud de contexto | 32.768 tokens (segun el ejemplo de despliegue con `--max-model-len 32768`; el maximo nativo del modelo base no se detalla) |
| Tipos de cuantizacion | no disponible en el repo principal; existe una variante GGUF en `mkd-minkeun/Keural-Lab-1108-GGUF` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo secundario) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen3.6-35B-A3B, un MoE con aproximadamente 49,3B de parametros totales y unos 4,3B activos por token. La arquitectura concreta (numero de expertos, capas, atencion, etc.) no se detalla en la informacion proporcionada y corresponde al modelo base de Qwen, no al autor del ajuste. El tag `qwen3_5_moe` del repositorio sugiere la familia de arquitectura, pero no aporta especificaciones adicionales.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF, DPO u otras formas de alineacion. La model card solo indica que es un "checkpoint experimental de Keural" basado en Qwen3.6-35B-A3B, sin describir el proceso de ajuste. No se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, etc.) mas alla de las que herede del modelo base.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento con modo thinking habilitado: la evaluacion del autor incluye GSM8K, IFEval y GPQA con thinking activado, lo que indica soporte de cadenas de razonamiento extendidas.
- Matematicas y resolucion de problemas cuantitativos (evaluado en GSM8K).
- Seguimiento de instrucciones (evaluado en IFEval).
- Razonamiento cientifico de nivel avanzado (evaluado en GPQA Diamond).
- Capacidades multilingues: no disponible; la evaluacion incluye KMMLU (coreano), lo que sugiere cierta competencia en coreano, pero no se documenta la lista de idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking es compatible con flujos multi-paso, pero no se documenta.
- Vision, audio u otras modalidades: no disponible; el pipeline es solo de texto.

## Casos de uso

- Investigacion sobre ajuste fino de MoE: el modelo sirve como punto de comparacion controlado frente a Qwen3.6-35B-A3B para estudiar como un ajuste fino afecta al rendimiento en MMLU, GSM8K, IFEval y GPQA, dado que el autor publica ambos conjuntos de resultados con el mismo harness.
- Experimentacion academica con modelos de ~49B en entornos con GPUs de alta gama: al ser Apache 2.0 y safetensors, se puede cargar con vLLM en configuraciones tensor-parallel para reproducir las evaluaciones publicadas.
- Generacion de texto y prototipado conversacional: el pipeline `text-generation`/`conversational` permite usarlo en demos de chatbot, aunque su rendimiento inferior al base desaconseja usarlo como sustituto directo en produccion.
- Evaluacion de tecnicas de cuantizacion: la existencia de una variante GGUF permite probar el modelo en llama.cpp y comparar la degradacion frente a los pesos safetensors, util para estudiar el comportamiento de MoE cuantizados.
- Razonamiento con thinking en tareas de matematicas y ciencia: con GSM8K en 0,899 y GPQA Diamond en 0,788, es util para experimentos que requieran cadenas de razonamiento largas, siempre asumiendo la perdida frente al base.
- Benchmarking de infraestructura: su tamano (~49B totales, ~4,3B activos) lo convierte en un caso practico para medir throughput y latencia de despliegues MoE con vLLM y tensor parallelism en clusters de 4 GPUs.
- Estudio de linaje de modelos: al ser un derivado documentado de Qwen3.6-35B-A3B con licencia Apache 2.0, sirve para analizar practicas de publicacion de checkpoints derivados y su trazabilidad.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, con el mismo harness (lm-evaluation-harness con vLLM, conjuntos de test completos; GSM8K, IFEval y GPQA con thinking habilitado):

| Benchmark | Keural-Lab-1108 | Qwen3.6-35B-A3B |
|---|---|---|
| MMLU | 0,817 | 0,839 |
| KMMLU | 0,613 | 0,645 |
| GSM8K | 0,899 | 0,963 |
| IFEval | 0,916 | 0,941 |
| GPQA Diamond | 0,788 | 0,823 |

El ajuste empeora el rendimiento en las cinco metricas reportadas. La mayor caida se da en GSM8K (-0,064) y la menor en IFEval (-0,025). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 98,6 GB de pesos, mas overhead de KV cache y activaciones; en la practica requiere al menos 4 GPUs de 80 GB (A100/H100) con tensor parallelism, como sugiere el ejemplo del autor (`--tensor-parallel-size 4`).
- En cuantizacion de 8 bits, el peso se reduce a unos 49 GB, lo que permite configuraciones con 2 GPUs de 80 GB o 4 GPUs de 24 GB con reparto cuidadoso; en 4 bits, unos 25 GB, viable en una unica GPU de 48 GB o en configuraciones multi-GPU consumer.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; en consumer, RTX 4090 (24 GB) no cabe en BF16 ni en 8 bits en una sola tarjeta, pero si en 4 bits con contexto reducido; multiples RTX 4090 o RTX 5090 pueden alojar la variante GGUF cuantizada.
- Opciones de despliegue: vLLM (documentado por el autor), llama.cpp mediante la variante GGUF, y teoricamente TGI u Ollama si se generan los artefactos correspondientes (no documentado).
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Keural-Lab-1108 | ~49,3B | ~4,3B | 32.768 (segun despliegue) | 0,817 | 0,899 | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3.6-35B-A3B | ~49,3B (nominal 35B) | ~4,3B | no disponible | 0,839 | 0,963 | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base, que supera al ajuste en todas las metricas. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base en todos los benchmarks publicados (MMLU, KMMLU, GSM8K, IFEval, GPQA Diamond); no es una mejora sobre Qwen3.6-35B-A3B.
- Checkpoint experimental: el autor no documenta el dataset de ajuste, el numero de tokens ni el proceso de alineacion, lo que impide auditar el origen de sus capacidades y sesgos.
- Riesgo de alucinacion: no evaluado de forma especifica; al ser un ajuste fino sin documentacion de alineacion, el riesgo no puede descartarse.
- Idiomas soportados no documentados; la presencia de KMMLU sugiere coreano, pero no hay lista oficial de idiomas.
- Sesgos conocidos: no disponibles; no se publica ninguna evaluacion de sesgo o toxicidad.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Qwen3.6-35B-A3B conviene verificar las condiciones del modelo base y de los datos de ajuste, no documentadas.
- Contexto: el ejemplo de despliegue fija 32.768 tokens; no se confirma si el modelo soporta contextos mayores ni como se comporta en ellos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validacion independiente de los resultados.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkd-minkeun/Keural-Lab-1108
- Variante GGUF: https://huggingface.co/mkd-minkeun/Keural-Lab-1108-GGUF
- Perfil del autor: https://huggingface.co/mkd-minkeun
- Listado de modelos del autor: https://huggingface.co/mkd-minkeun/models
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Web personal del autor: https://mkd.kr
