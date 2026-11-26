# cstr/Josev-2B-SystemOne-GGUF

## Resumen

Josev-2B-SystemOne-GGUF es un empaquetado en formato GGUF del modelo base mayflowergmbh/Josev-2B, publicado por el usuario cstr bajo licencia Apache-2.0. No se trata de un modelo nuevo ni de un ajuste fino: el autor indica explicitamente que no se ha realizado aritmetica tensorial ni cuantizacion sobre el archivo F32 principal, sino un reempaquetado byte-preserving que incluye backbone, cabeza conjunta (joint head) y tokenizer en un unico fichero para la API SystemOne de CrispEmbed. El checkpoint subyacente cuenta con 1.912.297.796 parametros (aproximadamente 1,9 mil millones).

El repositorio incluye, ademas del fichero F32, dos variantes cuantizadas experimentales (Q8_0 y Q4_K_MIX) generadas con el cuantizador C de CrispEmbed y marcadas por el propio autor como "not quality-qualified". La relevancia de esta ficha es acotada: no se documentan capacidades generativas generales, benchmarks de tareas ni soporte multilingue, y el runtime asociado (Josev) es exclusivamente CPU. Su interes practico radica en el empaquetado reproducible y verificable (hashes SHA256, commits de evidencia, runs de CI) para consumidores que integren la API SystemOne de CrispEmbed.

El modelo base se distribuye bajo Apache-2.0 y el reempaquetado conserva la licencia y los avisos originales en el directorio `upstream/`. El tamano del repositorio es de 14,4 GB, coherente con la presencia del fichero F32 de 7.659.180.448 bytes junto con las variantes cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base mayflowergmbh/Josev-2B; el empaquetado incluye backbone, joint head y tokenizer) |
| Parametros totales | 1.912.297.796 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (fichero principal), Q8_0 (experimental), Q4_K_MIX (experimental, politica josev_q4k_down8_v1) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32 byte-preserving; variantes cuantizadas GGUF) |

## Arquitectura y entrenamiento

El autor no describe la arquitectura interna del modelo base en la informacion disponible; solo se indica que el empaquetado SystemOne contiene backbone, joint head y tokenizer en un unico fichero GGUF, sin aritmetica tensorial ni cuantizacion en el fichero F32. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO para el modelo original.

La innovacion tecnica declarada es el propio formato de empaquetado para la API SystemOne de CrispEmbed: el autor reporta verificacion de 227 etapas originales y cuatro respuestas tipadas completas en C, Python, CLI, HTTP, Rust y Dart sobre CPU Linux x64. El F32 se declara verificado en ese entorno; no se verifican calidad de tarea, otras plataformas, GPU ni cuantizacion. Las variantes cuantizadas se generaron desde el F32 de la revision `bffe62522f826b4c33f2e731d5b870ced5150a17` con el cuantizador C de CrispEmbed (commit `84b5fbedd8a1b07dd5e8a6582cc02010be75b11a`), cambiando tipos de tensor sin entrenar ni fusionar pesos.

## Capacidades

- Generacion de texto y razonamiento: no se documentan capacidades especificas en la informacion disponible.
- Codigo y matematicas: no disponible.
- Vision o audio: no disponible.
- Tool calling / function calling: no documentado; el empaquetado expone respuestas tipadas (typed responses) a traves de la API SystemOne, con cuatro casos congelados de referencia.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el runtime Josev declara siete "gates" por defecto desactivados (default-off) y, para las variantes cuantizadas, requiere ademas `CRISPEMBED_JOSEV_QUANT=1` y `CRISPEMBED_QWEN35_QUANT=1`.

## Casos de uso

- Integracion en la API SystemOne de CrispEmbed: el fichero F32 esta pensado para consumirse como un unico GGUF con backbone, head y tokenizer, lo que simplifica el despliegue en clientes que ya usen el protocolo SystemOne.
- Verificacion de integridad en pipelines: los hashes SHA256 publicados (`72684e39...` para F32, `fc1663bb...` para Q8_0, `adc7fa47...` para Q4_K_MIX) permiten validar artefactos en CI antes de desplegarlos.
- Pruebas de conformidad de respuestas tipadas: los cuatro casos congelados y las 227 etapas verificadas sirven como suite de regresion para validar implementaciones cliente en C, Python, CLI, HTTP, Rust o Dart.
- Inferencia en CPU sin GPU: el runtime Josev es CPU-only, por lo que el modelo puede desplegarse en entornos sin acelerador, con el F32 como referencia exacta y las variantes cuantizadas como opcion de menor huella (3.462 MiB Q8_0, 2.952 MiB Q4_K_MIX).
- Evaluacion de cuantizacion: los datos de coseno de logits de cabeza y norma final permiten estudiar el impacto de Q8_0 y Q4_K_MIX frente al F32 en tareas de seleccion de opciones (argmax 4/4 en ambas variantes).
- Reproducibilidad de empaquetados: el flujo documentado (workflow `josev-publish.yml`, protocolo `docs/josev2b-q4k-publication-v1.json`, runs 40456235976 y 40463407332) sirve de plantilla para reempaquetar otros checkpoints con trazabilidad completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son de fidelidad del empaquetado y de las cuantizaciones frente a la referencia F32 congelada:

| Metrica | F32 (referencia) | Q8_0 | Q4_K_MIX |
|---|---|---|---|
| Bytes del fichero | 7.659.180.448 | 3.630.289.376 | 3.095.515.616 |
| Huella en runtime | no disponible | 3.462 MiB | 2.952 MiB |
| Tipos de tensor (Q4_K/Q8_0/F32) | 0/0/292 | 0/150/292 | 126/24/292 |
| Coseno logits de cabeza (min) | 1,0 | 0,99995 (umbral > 0,97) | 0,99739 (umbral > 0,94) |
| Coseno norma final (min) | 1,0 | 0,99944 | 0,94911 |
| Argmax de opcion exacto | 4/4 | 4/4 | 4/4 |
| JSON tipado completo exacto | 4/4 | 1/4 | 0/4 |
| Error maximo de probabilidad | 0 | 0,0059 | 0,0358 |
| Presupuestos estrictos 0,002/0,99999 | cumple | falla (200 etapas) | falla (203 etapas) |

No se midieron panel independiente de calidad de tarea, ejecuciones de cliente publico con las variantes cuantizadas, otras plataformas, GPU ni latencia/RSS.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el runtime Josev es CPU-only segun la model card. La huella de memoria reportada es de 3.462 MiB para Q8_0 y 2.952 MiB para Q4_K_MIX; para el F32 no se indica huella en runtime.
- GPU recomendadas: no disponible; el autor declara que GPU no esta verificada y que el runtime es CPU-only.
- Compatibilidad con GPU de consumo: no verificada en la informacion disponible.
- Opciones de despliegue: API SystemOne de CrispEmbed con el runtime Josev (CPU Linux x64 verificado); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explicitamente que latencia y RSS no se han medido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de tareas del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A continuacion se comparan las tres variantes publicadas en este mismo repositorio, que son el equivalente mas directo:

| Variante | Precision | Bytes | Huella runtime | JSON tipado exacto | Estado |
|---|---|---:|---:|---:|---|
| `josev2b-systemone-f32.gguf` | F32 | 7.659.180.448 | no disponible | 4/4 (referencia) | verificado en CPU Linux x64 |
| `josev2b-systemone-q8_0.gguf` | Q8_0 | 3.630.289.376 | 3.462 MiB | 1/4 | experimental |
| `josev2b-systemone-q4_k-down8.gguf` | Q4_K_MIX | 3.095.515.616 | 2.952 MiB | 0/4 | experimental |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Las variantes cuantizadas estan marcadas como "experimental: not quality-qualified"; el propio autor recomienda el F32 para respuestas tipadas exactas.
- En Q8_0 y Q4_K_MIX el JSON tipado completo solo coincide con la referencia en 1/4 y 0/4 casos respectivamente, porque las probabilidades redondeadas a cuatro decimales se desplazan.
- Ambas variantes cuantizadas incumplen los presupuestos estrictos de 0,002/0,99999 (200 y 203 etapas fallidas), lo que las descalifica para casos que exijan esa tolerancia.
- No verificado: calidad de tarea, otras plataformas distintas de CPU Linux x64, GPU y cuantizacion mas alla de los dos ficheros publicados.
- El runtime Josev mantiene siete gates desactivados por defecto; es necesario activarlos explicitamente para usar las funciones correspondientes.
- No se documentan sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto del modelo base; deben evaluarse contra la model card de mayflowergmbh/Josev-2B antes de usarlo en produccion.
- Licencia Apache-2.0 permite uso comercial, pero el reempaquetado conserva avisos upstream en `upstream/`; deben mantenerse al redistribuir (seccion 4 de la licencia).
- El repositorio ocupa 14,4 GB, lo que condiciona el almacenamiento y la descarga en entornos con recursos limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/Josev-2B-SystemOne-GGUF
- Modelo base: https://huggingface.co/mayflowergmbh/Josev-2B
- Revision del checkpoint base citada: https://huggingface.co/mayflowergmbh/Josev-2B/tree/6f0a31c8ed683aba79097eb3f48df2c9ab560afd
- Run de empaquetado 40456235976 (referenciado en la model card, sin URL directa en la informacion disponible)
- Run de consumo 40463407332 (referenciado en la model card, sin URL directa en la informacion disponible)
- Documento de politica de cuantizacion `docs/josev2b-q4k-sweep.md` y protocolo `docs/josev2b-q4k-publication-v1.json` (referenciados, sin URL directa en la informacion disponible)
- Resultado de barrido `tests/results/josev2b/q4k-sweep-41615751516.json` (referenciado, sin URL directa en la informacion disponible)
