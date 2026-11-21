# infosave/Maxwell-V1-Flash-cmf

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo Maxwell, con 35 000 millones de parametros totales y 3000 millones activos por token, disenado para tareas de razonamiento y flujos agenticos. Esta ficha concreta, `infosave/Maxwell-V1-Flash-cmf`, no es el modelo original sino una cuantizacion empaquetada en el formato CMF por el usuario infosave, pensada para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning.

La relevancia de este artefacto reside en el empaquetado: permite ejecutar el modelo completo de 35B en una unica GPU de 24 GB (por ejemplo, una NVIDIA L4) mediante cuantizacion de 4 bits, con velocidades medidas de 65,1 tok/s sin prompt y 33,1 tok/s tras un prompt de 30 000 tokens. El modelo base soporta una ventana de contexto de 256 000 tokens, capacidades de razonamiento, tool calling y seis idiomas (ingles, chino, ruso, tailandes, vietnamita e indonesio), bajo licencia Apache 2.0.

El repositorio ocupa 77,6 GB e incluye dos variantes cuantizadas: una de 4 bits (20,03 GB) y otra de 8 bits (36,97 GB). La model card reporta metricas de perplejidad sobre WikiText-2 y comparaciones token a token contra la implementacion de referencia en Transformers bf16, lo que aporta trazabilidad sobre la perdida de calidad introducida por la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atencion block-sparse; capa de prediccion multi-token en el checkpoint original (no incluida en el CMF) |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3000 millones (3B) por token |
| Longitud de contexto | 256 000 tokens (modelo base); en la practica limitada por `CMF_MAX_SEQ` y la memoria disponible (aproximadamente 8800 posiciones residentes en GPU con el archivo de 4 bits en una tarjeta de 24 GB) |
| Tipos de cuantizacion | 4 bits (`q4tp`: expertos enrutados, atencion, expertos compartidos y FFN densas; cabeza en 8 bits) y 8 bits (`q8_2f`); embedding en f16, routers, hyper-connections e indice de bloques de atencion en f32 |
| Idiomas soportados | Ingles (en), chino (zh), ruso (ru), tailandes (th), vietnamita (vi), indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (ficheros unicos `.cmf`); el modelo base original no se distribuye en safetensors ni GGUF dentro de este repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35B parametros totales y 3B activos por token, lo que permite un coste computacional por token comparable a un modelo denso de 3B. Incorpora atencion block-sparse, en la que el propio modelo selecciona los bloques de atencion relevantes, y una capa de prediccion multi-token en el checkpoint original que no se incluye en los ficheros CMF. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta ficha es el proceso de cuantizacion. En el archivo de 4 bits, los expertos enrutados se redondean sin calibracion, mientras que la atencion, los expertos compartidos y las FFN densas se calibran con GPTQ sobre 3072 tokens de prosa, Rust y Python que no forman parte de los textos de evaluacion. El archivo de 8 bits emplea cuantizacion de 8 bits con cabecera de 2 ficheros. El motor `cortiq` implementa en Rust la carga y ejecucion de estos pesos sobre CUDA, Vulkan, DX12 y CPU, sin dependencia de Python.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con soporte declarado de modo de razonamiento (tag `reasoning`).
- Tool calling y function calling, orientado a flujos agenticos.
- Contexto largo de hasta 256 000 tokens en el modelo base, con gestion por streaming de expertos desde memoria de host cuando se supera la capacidad de la GPU.
- Capacidades multilingues en seis idiomas: ingles, chino, ruso, tailandes, vietnamita e indonesio.
- Inferencia en GPU NVIDIA via CUDA o Vulkan, en GPU AMD e Intel via Vulkan/DX12, y en CPU.
- Ejecucion del modelo completo de 35B en una unica GPU de 24 GB gracias a la cuantizacion de 4 bits.
- No se declaran capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Razonamiento agentico con contexto largo: el modelo puede mantener conversaciones o tareas de varios pasos apoyandose en su ventana de 256 000 tokens y en tool calling, adecuado para agentes que consultan herramientas externas y acumulan historial extenso.
- Asistencia de codigo en produccion: el archivo de 4 bits se ejecuta en una GPU de 24 GB con 60,7 tok/s tras un prompt de 2048 tokens, lo que permite integrarlo en pipelines de generacion y revision de codigo sin hardware de gama alta.
- Analisis de documentos extensos: con 33,1 tok/s tras un prompt de 30 000 tokens y un consumo pico de 20,3 GB, es viable procesar contratos, informes o bases de conocimiento largas en una sola tarjeta.
- Despliegue en infraestructura de gama media: el modelo completo cabe en una NVIDIA L4 de 24 GB, lo que reduce el coste frente a alternativas que requieren A100 o H100 para modelos de 35B.
- Atencion multilingue para mercados asiaticos: el soporte de chino, tailandes, vietnamita e indonesio permite construir asistentes para esas regiones con un unico modelo.
- Procesamiento por lotes en CPU o GPU integrada: al ejecutarse con `cortiq` sobre Vulkan/DX12 y CPU, puede desplegarse en entornos sin CUDA, como estaciones de trabajo con GPU AMD o Intel.
- Investigacion sobre cuantizacion: las metricas de perplejidad y las comparaciones token a token frente a bf16 permiten estudiar el impacto de la cuantizacion de 4 y 8 bits en un MoE de 35B.

## Benchmarks y rendimiento

Perplejidad sobre WikiText-2 (12 ventanas de 512 tokens) y sobre ventanas de 6144 tokens, segun la model card:

| Archivo | Cuantizacion | Tamano | WikiText-2 ppl | Rust ppl | Python ppl | WikiText-2, ventanas 6144 |
|---|---|---:|---:|---:|---:|---:|
| `Maxwell-V1-Flash-q4tp.cmf` | 4 bits | 20,03 GB | 32,40 | 7,42 | 7,49 | 21,35 |
| `Maxwell-V1-Flash-q8_2f.cmf` | 8 bits | 36,97 GB | 33,07 | 7,05 | 7,16 | 20,68 |
| Referencia Transformers bf16 | — | 73,64 GB | 32,80 | 7,05 | 7,03 | 20,75 |

Rendimiento en NVIDIA L4 (24 GB) con CUDA, un stream, `cortiq bench --core`:

| Prompt (tokens) | Primer token, s (q4tp) | Primer token, s (q8_2f) | Decodificacion, tok/s (q4tp) | Decodificacion, tok/s (q8_2f) | Memoria pico, GB (q4tp) | Memoria pico, GB (q8_2f) |
|---:|---:|---:|---:|---:|---:|---:|
| 2048 | 2,02 | 4,32 | 60,7 | 37,5 | 19,7 | 20,0 |
| 4096 | 4,38 | — | 49,7 | — | 20,0 | — |
| 8192 | 11,0 | 17,7 | 46,6 | 31,4 | 20,6 | 20,2 |
| 12 288 | 19,0 | — | 42,9 | — | 21,0 | — |
| 16 384 | 29,0 | — | 38,8 | — | 21,1 | — |
| 24 576 | 51,2 | — | 33,3 | — | 20,3 | — |
| 30 000 | 69,4 | 94,9 | 33,1 | 26,1 | 20,3 | 20,4 |

Rendimiento con Vulkan en la misma L4, archivo de 4 bits:

| Prompt (tokens) | Primer token, s | Decodificacion, tok/s | Memoria pico, GB |
|---:|---:|---:|---:|
| 512 | 0,84 | 37,9 | 20,5 |
| 1024 | 1,66 | 37,3 | 20,8 |
| 2048 | 3,41 | 36,8 | 21,0 |

Sin prompt, la decodificacion es de 65,1 tok/s con el archivo de 4 bits y 25,1 tok/s con el de 8 bits en CUDA; con Vulkan, 39,9 tok/s para el de 4 bits. Con `CMF_MAX_SEQ=32768` en el archivo de 4 bits, la decodificacion baja a 48,8 tok/s al transmitir los expertos desde memoria de host.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 20,03 GB para el archivo de 4 bits y 36,97 GB para el de 8 bits; en la practica, el pico medido en una L4 de 24 GB es de aproximadamente 20,5 GB para ambos con prompts de hasta 30 000 tokens.
- Memoria de host: 24 GB con el archivo de 4 bits y 42 GB con el de 8 bits (18 GB de expertos se transfieren a la GPU por turnos).
- GPU recomendadas: NVIDIA L4 (24 GB) es la plataforma medida; cualquier GPU NVIDIA con al menos 24 GB y soporte CUDA o Vulkan; GPU AMD e Intel mediante Vulkan/DX12; ejecucion en CPU posible sin GPU.
- Cabe en GPU de consumo: la model card no reporta mediciones en tarjetas como RTX 4090 (24 GB) o RTX 3090 (24 GB), pero por capacidad de VRAM el archivo de 4 bits es compatible con tarjetas de 24 GB; no se dispone de datos de rendimiento en esas tarjetas.
- Opciones de despliegue: `cortiq` (motor Rust, CLI `cortiq run` y `cortiq bench`), con backends CUDA, Vulkan, DX12 y CPU. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para el formato CMF.
- Latencia y throughput medidos: primer token de 2,02 s con 2048 tokens de prompt y 69,4 s con 30 000 tokens (q4tp, CUDA); decodificacion de 65,1 tok/s sin prompt y 33,1 tok/s tras 30 000 tokens (q4tp, CUDA); 39,9 tok/s sin prompt con Vulkan.
- Instalacion: `cargo install --git https://github.com/infosave2007/cmf --branch maxwell cortiq-cli --features cuda`; el soporte del modelo esta en el PR #182 de `cortiq` y requiere compilar desde esa rama hasta la siguiente release.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y despliegue | Notas |
|---|---|---|---|---|---|
| Maxwell-V1-Flash (esta ficha, CMF) | 35B / 3B | 256K (limitado por memoria) | Apache 2.0 | CMF, motor `cortiq` (CUDA/Vulkan/DX12/CPU) | Modelo completo en GPU de 24 GB con 4 bits; 65,1 tok/s sin prompt en L4 |
| Maxwell-V1-Flash (base, Transformers bf16) | 35B / 3B | 256K | Apache 2.0 | Safetensors, Transformers | Referencia de calidad; 73,64 GB, requiere hardware de mayor capacidad |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion de 4 bits redondea los expertos enrutados sin calibracion, lo que puede degradar la calidad en dominios alejados de los textos de calibracion (prosa, Rust y Python).
- La perplejidad en WikiText-2 del archivo de 4 bits (32,40) es ligeramente inferior a la de bf16 (32,80), pero en ventanas de 6144 tokens es superior (21,35 frente a 20,75); las diferencias son pequenas pero no nulas.
- En la comprobacion token a token de cuatro prompts de 40 tokens, tres respuestas fueron identicas a bf16 y una difirio en un token; no hay evaluacion exhaustiva de calidad en tareas generativas.
- La capa de prediccion multi-token del checkpoint original no esta incluida, por lo que no se puede aprovechar esa capacidad de decodificacion especulativa.
- El contexto efectivo esta limitado por la memoria: con 24 GB y el archivo de 4 bits caben aproximadamente 8800 posiciones en GPU; contextos mayores requieren streaming de expertos desde memoria de host y reducen el throughput (48,8 tok/s con `CMF_MAX_SEQ=32768`).
- El modelo solo declara seis idiomas (en, zh, ru, th, vi, id); el rendimiento en castellano no esta verificado y no se garantiza.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo ni de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto depende de `cortiq` y de una rama no fusionada (PR #182) en el momento de la publicacion, lo que introduce riesgo de estabilidad en produccion.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la fecha de creacion (2026-11-21) es posterior a la de esta ficha; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en entornos criticos.
- No se dispone de datos de rendimiento en GPU de consumo ni de benchmarks estandar de razonamiento o codigo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Maxwell-V1-Flash-cmf
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Motor `cortiq` y formato CMF: https://github.com/infosave2007/cmf
- Pull request de soporte del modelo: https://github.com/infosave2007/cmf/pull/182
- Rama de compilacion: `--branch maxwell` en el repositorio anterior
