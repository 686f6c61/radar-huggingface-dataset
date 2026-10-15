# baiango/qwen38-27b-on-a-single-rtx-3090-throughput-results

## Resumen

Este repositorio de Hugging Face no contiene pesos de un modelo, sino un informe de mediciones de rendimiento (throughput) de un modelo cuantizado ejecutado en una única GPU. El autor, `baiango`, publica los resultados obtenidos en una máquina alquilada en vast.ai el 15 de octubre de 2026, sirviendo `mradermacher/Qwen3.8-27B-heretic-ara-i1-GGUF` en cuantización Q4_K_M sobre una RTX 3090 de 24 GB con llama.cpp compilado desde fuente. Todos los datos son mediciones reales, no extrapolaciones de especificaciones.

El modelo medido es un transformer denso de 27,32 B de parámetros con arquitectura identificada como `qwen35` en llama.cpp, compuesta por 64 capas que combinan 48 capas de atención lineal con 16 de atención completa, más una capa adicional de cabeza MTP (multi-token prediction) que puede emplearse como draft en decodificación especulativa. El fichero GGUF ocupa 15,65 GiB (16.810.715.296 bytes) y se carga íntegramente en la GPU con `-ngl 99`.

Su relevancia práctica es doble: por un lado documenta qué se puede esperar de un modelo de ~27 B en cuantización Q4_K_M en hardware consumer de gama alta; por otro, cuantifica con precisión los límites de concurrencia impuestos por la caché de estado recurrente de la atención lineal, un cuello de botella poco documentado que en este caso tapa el escalado agregado a partir de 32 ranuras paralelas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida; identificada como `qwen35` en llama.cpp. 64 capas: 48 de atención lineal + 16 de atención completa, más 1 capa de cabeza MTP |
| Parametros totales | 27,32 B (modelo medido) |
| Parametros activos | No aplica: modelo denso |
| Longitud de contexto | Hasta 32.768 tokens probados en el informe (también se midió con 16.384 y 8.192). Máximo nativo del modelo: no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF). Otras cuantizaciones: no disponible |
| Idiomas soportados | Inglés (`en`) según los tags del repositorio |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero de 16.810.715.296 bytes = 15,65 GiB) |

Nota: el repositorio `baiango/qwen38-27b-on-a-single-rtx-3090-throughput-results` es un informe de resultados, no distribuye pesos. Los pesos corresponden a `mradermacher/Qwen3.8-27B-heretic-ara-i1-GGUF`.

## Arquitectura y entrenamiento

La arquitectura del modelo medido es un transformer denso de 27,32 B de parámetros con atención híbrida: 48 de sus 64 capas emplean atención lineal y 16 atención completa. Esta combinación reduce el coste de la caché KV clásica, pero introduce una caché de estado recurrente (`rs`) propia de las capas lineales que se asigna por cada ranura de secuencia concurrente. Adicionalmente, el fichero GGUF incluye una capa de cabeza MTP (`blk.64.*`) que llama.cpp no carga si no se activa explícitamente con `--spec-type draft-mtp`; según el autor, esa cabeza consume VRAM real cuando se habilita, por lo que no es gratuita.

No hay información en la model card sobre el proceso de entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación. Tampoco se documenta el entrenamiento de la cabeza MTP. La única innovación técnica descrita es de inferencia: el uso de la propia cabeza MTP del modelo como drafter para decodificación especulativa, que produce una aceleración de 1,44 a 1,57 veces en decodificación de un solo flujo con una tasa de aceptación de drafts del 50,3 al 58,8 % y una longitud media de draft de 2,49 a 2,74 tokens.

## Capacidades

- Generación de texto en inglés: única capacidad confirmada por los tags del repositorio.
- Decodificación especulativa nativa mediante cabeza MTP integrada en el propio GGUF, activable con `--spec-type draft-mtp`.
- Procesamiento de prompts largos: se midió prefill estable entre 512 y 8.192 tokens, y una prueba adicional a profundidad 16.384.
- Servicio concurrente multi-petición mediante `llama-server` con continuous batching.
- Capacidades de razonamiento, código, matemáticas, visión o audio: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Modo thinking: no disponible.

## Casos de uso

- Planificación de capacidad para autohospedaje en GPU consumer: los datos permiten decidir si una RTX 3090 de 24 GB basta para servir un modelo denso de 27 B en Q4_K_M con 32.768 tokens de contexto y hasta 32 peticiones simultáneas, alcanzando unos 225,6 t/s agregados. Es útil para calcular cuántos usuarios concurrentes soporta un único nodo antes de comprar más hardware.
- Despliegue de API multi-usuario con llama.cpp: el informe documenta la configuración recomendada (`-c 32768 --parallel 32`), el punto óptimo de rendimiento agregado y el punto donde el sistema colapsa (40 ranuras bajan a 131 t/s). Sirve como plantilla de configuración para un servicio interno.
- Evaluación de decodificación especulativa: cuantifica el beneficio real de activar la cabeza MTP (de 43,0 a 61-67 t/s en un flujo) y su coste oculto (limita el servidor a 8 ranuras paralelas por consumo de VRAM), lo que permite decidir entre maximizar latencia por usuario o throughput agregado.
- Selección de cuantización y presupuesto de VRAM: los datos de VRAM a máxima concurrencia (23.777 MiB con 44 ranuras a 16k de contexto; 23.759 MiB con 48 ranuras a 8k) permiten estimar con precisión si un modelo de este tamaño cabe en una tarjeta de 24 GB y con qué margen.
- Ajuste de parámetros de servidor: el barrido de `-ub` (512, 1024, 2048, 4096) muestra que el micro-batch satura en 2048 y que 4096 no aporta nada, evitando configuraciones inútiles en producción.
- Validación de builds de llama.cpp: el informe fija la revisión `a0e6dc7`, las banderas de compilación (`-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86`), el driver (595.84, CUDA 13.2) y el cómputo de la GPU (8.6), lo que permite reproducir o comparar rendimiento tras actualizar el runtime.
- Investigación sobre atención lineal en inferencia: los datos de la caché de estado recurrente (`rs`), con asignaciones idénticas en bytes entre configuraciones no relacionadas, son un punto de partida para estudiar cómo escala esa caché con el número de ranuras paralelas.
- Dimensionamiento de infraestructura en nube: las cifras de throughput por flujo y agregado permiten estimar coste por millón de tokens en proveedores de GPU por horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos recogidos son exclusivamente de rendimiento de inferencia.

Prefill, un solo flujo (`llama-bench`, `-ngl 99`):

| Prueba | t/s |
|---|---:|
| pp512 | 1.503,5 ± 34,6 |
| pp2048 | 1.572,9 ± 7,3 |
| pp4096 | 1.560,4 ± 0,8 |
| pp8192 | 1.530,1 ± 0,7 |
| pp512 a profundidad 16.384 | 1.270 |

Decodificación, un solo flujo:

| Prueba | t/s |
|---|---:|
| tg128 | 43,0 ± 0,07 |
| tg128 a profundidad 4.096 | 42,5 |
| tg128 a profundidad 16.384 | 40,9 |

El autor señala que 43,0 t/s supone aproximadamente el 77 % del techo teórico por ancho de banda (936 GB/s ÷ 16,81 GB ≈ 56 t/s), valor normal para Q4_K_M.

Decodificación especulativa con cabeza MTP:

| Metrica | Valor |
|---|---|
| Decodificación | 61-67 t/s |
| Aceleración frente a tg128 | 1,44-1,57× |
| Aceptación de drafts | 50,3-58,8 % |
| Longitud media de draft | 2,49-2,74 |

Decodificación concurrente, configuración base (`-c 32768 --parallel 32`), `n_predict = 256`, `temp 1.0 / min_p 0.1`, `cache_prompt=false`:

| Peticiones concurrentes | 1 | 2 | 4 | 8 | 16 | 32 |
|---|---:|---:|---:|---:|---:|---:|
| t/s agregados | 41,4 | 70,5 | 92,5 | 110,6 | 186,9 | 225,6 |
| t/s por flujo | 41,4 | 35,3 | 23,1 | 13,8 | 11,7 | 7,1 |

Decodificación concurrente con `--spec-type draft-mtp` (`-c 32768 --parallel 8`):

| Peticiones concurrentes | 1 | 4 | 8 |
|---|---:|---:|---:|
| t/s agregados | 60,6 | 112,0 | 154,2 |
| t/s por flujo | 60,6 | 28,0 | 19,3 |

Límite de escalado (`--parallel 40 -c 16384`):

| Peticiones concurrentes | 8 | 16 | 32 | 40 |
|---|---:|---:|---:|---:|
| t/s agregados | 116,6 | 187,7 | 227,3 | 131,0 |
| t/s por flujo | 14,6 | 11,7 | 7,1 | 3,3 |

Barrido de micro-batch en prefill (`pp2048`):

| `-ub` | 512 | 1024 | 2048 | 4096 |
|---|---:|---:|---:|---:|
| t/s | 1.507,9 | 1.549,2 | 1.574,8 | 1.573,7 |

## Requisitos de hardware

- GPU medida: 1× RTX 3090 con 24.576 MiB de VRAM, cómputo 8.6, driver 595.84 y CUDA 13.2. Modelo cargado completamente en GPU con `-ngl 99`.
- Host de las pruebas: 48 vCPU y 125 GB de RAM, imagen `vastai/pytorch:cuda-13.2.1-auto`.
- VRAM del modelo en Q4_K_M: 15,65 GiB solo de pesos, más caché KV y caché de estado recurrente.
- VRAM a máxima concurrencia sin draft: 23.777 MiB con 44 ranuras y 32.768 tokens de contexto totales; 23.759 MiB con 48 ranuras y 16.384 tokens totales. Estas cifras dejan la tarjeta prácticamente al límite.
- Caben en GPU consumer: sí, en RTX 3090 de 24 GB. Otras tarjetas de 24 GB (RTX 4090, RTX 5090 según VRAM) no fueron probadas. GPUs con menos de 24 GB: no disponible.
- Opciones de despliegue validadas: llama.cpp revisión `a0e6dc7` compilada con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86`, tanto `llama-bench` como `llama-server` con `--cont-batching`. vLLM, Ollama, TGI u otros backends: no probados en el informe.
- Latencia por token derivada de las mediciones: aproximadamente 23,3 ms/token sin draft (43,0 t/s) y entre 14,9 y 16,4 ms/token con draft MTP (61-67 t/s), en un solo flujo.
- Throughput máximo agregado medido: 227,3 t/s con `--parallel 40`, 32 ranuras ocupadas y 16.384 tokens de contexto, equivalente a 5,3 veces un flujo único sin draft.
- Límite duro con cabeza MTP: máximo 8 ranuras paralelas; con 12 ranuras la carga falla por falta de 7,01 GiB.
- Advertencia de configuración: subir `--parallel` por encima de 32 reduce el throughput (131,0 t/s con 40 ranuras frente a 227,3 t/s con 32).

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El informe no incluye mediciones de otros modelos, cuantizaciones o GPUs, y la búsqueda web no aportó fuentes técnicas relevantes.

Comparativa interna de configuraciones del mismo modelo, a partir de los datos medidos:

| Configuracion | t/s por flujo | t/s agregados maximos | Ranuras maximas |
|---|---:|---:|---:|
| Base (sin draft) | 43,0 | 225,6 (32 ranuras) | 44 a 16k de contexto |
| Con `--spec-type draft-mtp` | 61-67 | 154,2 (8 ranuras) | 8 |

## Limitaciones y advertencias

- El repositorio no contiene pesos ni documentación del modelo: es un informe de mediciones. Para usar el modelo hay que acudir al GGUF de `mradermacher`.
- Licencia no disponible. No se puede confirmar la legalidad del uso comercial en producción sin verificarla en el repositorio original del modelo.
- Los resultados son específicos de Q4_K_M a 27,32 B sobre una RTX 3090 de 24 GB. No son transferibles a otras cuantizaciones, otras tarjetas ni otras longitudes de contexto.
- Medición única en una sola GPU y un solo proceso de servidor. No se probaron dos servidores por GPU.
- El colapso de 32 a 40 ranuras se midió en un único barrido; el autor recomienda tratar la ubicación exacta del umbral como ±unos pocos slots, aunque el valor de N=32 se reprodujo en dos configuraciones independientes.
- La máquina se destruyó tras la medición, por lo que nada es reejecutable sin volver a alquilar y descargar el modelo (unos 9 minutos a 26-34 MB/s).
- El tamaño de la caché `rs` no es una función lineal limpia de `--parallel`: 40 ranuras a 32k de contexto se quedaron a 355 MB del límite, mientras que 48 ranuras requerían 7,5 GiB adicionales. El autor advierte explícitamente de que no se debe extrapolar, sino medir.
- No hay información sobre sesgos, alineación, riesgo de alucinación ni filtrado de contenido. El nombre del modelo incluye "heretic", término que en el ecosistema suele asociarse a ajustes sin alineación o "abliterated", pero esto no está confirmado en la información disponible y debe verificarse antes de cualquier despliegue orientado al público.
- Idioma limitado al inglés según los tags del repositorio; no hay evidencia de capacidades multilingües.
- No se documentan capacidades de tool calling, agentes, visión, audio o modo de razonamiento, por lo que no deben asumirse.
- La búsqueda web realizada no devolvió resultados técnicos relevantes; todos los enlaces de referencia proceden del propio repositorio.

## Enlaces

- Repositorio del informe de throughput: https://huggingface.co/baiango/qwen38-27b-on-a-single-rtx-3090-throughput-results
- Modelo GGUF medido: https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-i1-GGUF
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la información proporcionada.
