# deeprcurs/IKNN-Rl1-A1

## Resumen

IKNN-Rl1-A1 es un modelo de lenguaje causal disenado por deepRcurs Labs con enfoque CPU-first para cargas de trabajo agente e investigacion. Su innovacion principal es la cuantizacion tri-tier por fases, que divide los parametros en tres niveles de precision: SatU1 a 1 bit (87% de los parametros), NoeSA-24 a 4.58 bits (9%) y Ntarra-DnA a 3.17 bits (4%). Esta segmentacion asigna roles cognitivos distintos a cada nivel, optimizando el rendimiento en tareas de razonamiento logico, codigo y matematicas frente a tareas de alto volumen.

El modelo se presenta como un prototipo de 150 millones de parametros (34.5M activos) con contexto de 2048 tokens, construido sobre la arquitectura de referencia Qwen/Qwen3-27B. Incluye un runtime nativo llamado iknn.cpp con 8 kernels AVX2/AVX-512, un formato de pesos propio `.iknn` y tecnologias complementarias como la transformada de Hadamard aleatorizada (RHT) para suavizar valores atipicos, una cache KV con compuerta de fase (PG-KVC) que reduce el uso de memoria en un 94%, y un predictor de fase-entropia (PEP) con precision declarada del 100%.

El objetivo de diseno es un modelo de 19.5B parametros mas 8B de componentes no parametricos con un promedio de 1.6 bits por parametro, que ocuparia aproximadamente 4.12GB de RAM. Sin embargo, el prototipo actual de 150M solo valida los kernels, el empaquetado y el runtime; el modelo completo no ha sido entrenado todavia. La relevancia actual de IKNN-Rl1-A1 reside en su propuesta de ejecucion eficiente en CPU para flujos de trabajo agente, donde el cuello de botella es la inferencia, no la escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con cuantizacion tri-tier por fases (SatU1 1-bit, NoeSA-24 4.58-bit, Ntarra-DnA 3.17-bit) y router MoE con compuerta PEP |
| Parametros totales | 150M (prototipo validado); objetivo de diseno: 19.5B parametricos + 8B no parametricos |
| Parametros activos | 34.5M (prototipo) |
| Longitud de contexto | 2048 tokens (prototipo, extensible) |
| Tipos de cuantizacion | SatU1 1-bit (130.5M), NoeSA-24 4.58-bit (13.5M), Ntarra-DnA 3.17-bit (6M) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `.iknn` (formato nativo, magia "IKNN", 42MB, 86 tensores) |

## Arquitectura y entrenamiento

La arquitectura de IKNN-Rl1-A1 combina un router MoE con compuerta de entropia de fase (PEP) y tres niveles de expertos cuantizados. El nivel SatU1 (1 bit) se implementa con operaciones binarias XNOR y popcount aceleradas por AVX2/AVX-512; el nivel NoeSA-24 (4.58 bits) empaqueta 13 valores en bloques de 60 bits usando una tabla LUT576 y una distribucion gaussiana truncada; el nivel Ntarra-DnA (3.17 bits) codifica 9 estados de direccion por fase mediante desplazamientos y signos, sin multiplicaciones. Cada nivel se asigna a una funcion cognitiva: los niveles de mayor precision gestionan logica critica, codigo y matematicas, mientras que el nivel de 1 bit se encarga de tareas de alto volumen.

El entrenamiento del prototipo se realizo sobre un dataset de 6000 ejemplos generados por modelos frontier: 1000 de logica, 1000 de razonamiento, 1000 de codigo, 1000 de investigacion, 1000 de matematicas y 1000 de ciencia. La curva de perdida muestra una convergencia desde 7.08 hasta 0.41 en entrenamiento y desde 6.59 hasta 0.50 en validacion, con gradientes estables en 1.0 sin explosion. Entre las innovaciones tecnicas destacan la transformada de Hadamard aleatorizada (RHT) que reduce la energia de valores atipicos de 10 a 5.07 preservando la norma L2 (11.3007, diferencia de 9.5e-07), la cache KV con compuerta de fase (PG-KVC) que logra un ahorro del 94% (6.1MB a 338KB) y el doble trabajador adaptativo de baja precision (ADLP) que combina un camino rapido de 800 unidades SatU1 con un camino lento de 200 unidades NoeSA.

## Capacidades

- Generacion de texto causal con enfoque agente y de investigacion, cubriendo logica, razonamiento, codigo, matematicas y ciencia.
- Razonamiento multi-paso mediante la combinacion de niveles de cuantizacion: los expertos de mayor precision se activan para tareas criticas de logica, codigo y matematicas.
- Ejecucion CPU-first sin dependencia de GPU, con 8 kernels optimizados para AVX2 y AVX-512.
- Cache KV con compuerta de fase (PG-KVC) que reduce el consumo de memoria en un 94% para secuencias de 1000 tokens, alcanzando un 96% de ahorro en el pipeline completo.
- Predictor de fase-entropia (PEP) de dos etapas: una primera etapa bigram de bajo coste (<0.5%) y una segunda etapa low-rank de d_model a 16 y luego a 1, con precision declarada de 100/100.
- Soporte de cargas de trabajo agente gracias al diseno del dataset, que incluye tareas de investigacion y razonamiento en contextos de agente.
- Cuantizacion adaptativa con doble trabajador (ADLP): un camino rapido de 800 unidades SatU1 y un camino lento de 200 unidades NoeSA, con rendimiento declarado de 1e6 TPS.

## Casos de uso

- Agentes de investigacion automatizada: el modelo puede ejecutar pipelines de razonamiento multi-paso sobre tareas de investigacion y ciencia, aprovechando el dataset especifico de 1000 ejemplos por dominio para mantener coherencia en tareas de agente.
- Razonamiento logico y matematico en entornos CPU-only: la cuantizacion tri-tier asigna los expertos NoeSA-24 y Ntarra-DnA a operaciones criticas de logica y calculo, lo que permite ejecutar estas tareas en servidores sin GPU.
- Generacion de codigo en infraestructuras sin aceleradores: el soporte de codigo esta incorporado en el dataset de entrenamiento y los kernels AVX2/AVX-512 permiten una latencia aceptable en CPUs de consumo y servidor.
- Analisis cientifico y procesamiento de texto en despliegues de bajo consumo: la cache KV con compuerta de fase reduce la memoria necesaria para secuencias largas, facilitando el analisis de documentos en equipos con recursos limitados.
- Pipelines de razonamiento con contexto largo: el prototipo admite hasta 2048 tokens, y la reduccion de cache KV permite manejar secuencias de 1000 tokens con un consumo de 338KB, adecuado para sistemas embebidos o servidores ligeros.
- Despliegue en servidores con AVX-512: los kernels de alta precision estan optimizados para procesadores Xeon, lo que permite estimar un rendimiento de 65-90 TPS de entrada y 120-165 TPS de salida en configuraciones de 2 vCPU.
- Validacion de arquitecturas de cuantizacion extrema: el prototipo de 150M sirve como banco de pruebas para evaluar el empaquetado de pesos, los kernels y el runtime antes de escalar al objetivo de 19.5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos publicados corresponden a mediciones de kernels y componentes del runtime sobre el prototipo de 150M:

| Componente | Resultado medido | Objetivo | Estado |
|---|---|---|---|
| SatU1 AVX2 | 16 Giga/s en 12 nucleos (Ryzen5 5650U) | Ryzen5 AVX2 | PASS |
| SatU1 AVX-512 | 32 Giga/s en 4 nucleos (Xeon) | Xeon AVX-512 | PASS |
| NoeSA-24 AVX2 | Empaquetado 13x24 en 60 bits | Ryzen5 | PASS |
| NoeSA-24 AVX-512 | Empaquetado 13x24 con LUT576 | Xeon | PASS |
| Ntarra-DnA AVX2 | Empaquetado 2x9 con 77 estados, computo 10/40/160/-40/0 | Ryzen5 | PASS |
| Ntarra-DnA AVX-512 | Empaquetado 2x9 con 77 estados | Xeon | PASS |
| RHT AVX2 | Valores atipicos 10 a 5.07, norma 11.3007 preservada, diferencia 9.5e-07 | Ryzen5 | PASS |
| RHT AVX-512 | Valores atipicos 10 a 5.07, norma 11.3007 preservada | Xeon | PASS |
| PG-KVC | 1000 tokens: 6.1MB a 338KB (94% de ahorro) | -80% | PASS |
| PG-KVC pipeline completo | 1000 tokens: 720 de 1 bit y 280 de 2 bits (96% de ahorro) | KV cache | PASS |
| PEP | Dos etapas: bigram <0.5% + low-rank d_model a 16 a 1, precision 100/100 | Predictor de entropia | PASS |
| ADLP | Camino rapido 800 SatU1 + camino lento 200 NoeSA, 1e6 TPS | Doble trabajador | PASS |

Los objetivos de rendimiento declarados para el runtime son 28-42 TPS de entrada y 60-85 TPS de salida en Ryzen5 5650U, y estimaciones de 65-90 TPS de entrada y 120-165 TPS de salida en Xeon con 2 vCPU.

## Requisitos de hardware

- VRAM: No requiere GPU. El prototipo de 150M ocupa 26MB de RAM para los pesos y 42MB en disco en formato `.iknn`.
- GPU recomendadas: No aplica. El modelo esta disenado exclusivamente para CPU con instrucciones AVX2 o AVX-512.
- Compatibilidad con GPU de consumo: No aplica, al ser un modelo CPU-first sin dependencia de aceleradores.
- Opciones de despliegue: Runtime nativo `iknn.cpp` con 8 kernels AVX2/AVX-512. No existe soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada. El formato GGUF fue eliminado deliberadamente del repositorio.
- Hardware de referencia para rendimiento: Ryzen5 5650U (Zen3, 6 nucleos, DDR4 38GB/s) para AVX2 y Xeon de 2 vCPU para AVX-512.
- Latencia y rendimiento estimados: 28-42 TPS de entrada y 60-85 TPS de salida en Ryzen5 5650U; 65-90 TPS de entrada y 120-165 TPS de salida en Xeon (estimaciones declaradas por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| IKNN-Rl1-A1 (prototipo) | 150M (34.5M activos) | 2048 | MIT | `.iknn` | Cuantizacion tri-tier 1-bit/4.58-bit/3.17-bit, CPU-first |
| Qwen3-27B (modelo base) | 27B | no disponible | Apache 2.0 (generalmente) | GGUF, safetensors | Transformer estandar, referencia arquitectonica del objetivo de diseno |
| BitNet b1.58 | 2.7B (variante disponible) | no disponible | MIT | GGUF | Cuantizacion ternaria 1.58-bit, enfocado en CPU |
| Modelos GGUF Q4_K_M | variable | variable | variable | GGUF | Cuantizacion de 4 bits con despliegue estandar via llama.cpp |

La comparativa es limitada porque IKNN-Rl1-A1 es un prototipo de validacion de 150M, no un modelo completo. Su propuesta de cuantizacion tri-tier y runtime nativo lo distingue de los modelos GGUF convencionales, pero carece de benchmarks publicados que permitan una comparacion cuantitativa directa. El objetivo de diseno de 19.5B parametricos con 1.6 bits de promedio por parametro y 4.12GB de RAM esta alineado conceptualmente con BitNet b1.58, aunque en una fase de desarrollo anterior.

## Limitaciones y advertencias

- El modelo actual es un prototipo de validacion de 150M parametros, no el modelo completo de 19.5B. El objetivo de diseno no ha sido entrenado y no esta disponible para su uso.
- No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K, etc.). Los datos de rendimiento disponibles corresponden exclusivamente a kernels y componentes del runtime.
- La precision del 100% declarada para el predictor PEP puede indicar sobreajuste al conjunto de evaluacion interno, especialmente considerando el reducido dataset de entrenamiento.
- La longitud de contexto esta limitada a 2048 tokens en el prototipo, lo que restringe aplicaciones que requieran ventanas de contexto largas.
- El modelo solo soporta ingles, sin capacidades multilingues documentadas.
- No hay descargas ni validacion comunitaria (0 descargas, 0 likes en HuggingFace), por lo que la fiabilidad en produccion no esta contrastada.
- El formato `.iknn` es propietario y requiere el runtime `iknn.cpp`; no es compatible con herramientas estandar como llama.cpp, vLLM o TGI.
- El dataset de 6000 ejemplos es reducido para cubrir las seis areas declaradas, lo que puede limitar la generalizacion fuera de los dominios de entrenamiento.
- Las fechas de creacion y actualizacion del modelo (2026-09-03) sugieren que se trata de un proyecto reciente o de una simulacion; no hay evidencia de despliegues en produccion.
- El prototipo declara 26MB de memoria para los pesos, pero el archivo `.iknn` ocupa 42MB, lo que implica un overhead significativo en el formato de almacenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/deeprcurs/IKNN-Rl1-A1
- Organizacion en HuggingFace: https://huggingface.co/deeprcurs
- GitHub de deepRcurs: https://github.com/deepRcurs/
