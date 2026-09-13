# Akahsizrr/spec100m

## Resumen

spec100m es un prototipo de investigacion publicado en HuggingFace por el usuario Akahsizrr que combina un transformer decoder-only de ~270M parametros con un conjunto de 4095 cabezas especulativas tipo Medusa (210M parametros), dando un total de ~480M parametros. El objetivo declarado no es la calidad del texto, sino explorar el limite maximo de throughput de decodificacion especulativa en una sola GPU, aceptando todos los borradores en lugar de rechazarlos.

La arquitectura incorpora varias tecnicas agresivas de compresion: atencion multi-query (MQA) con una sola cabeza KV compartida por 16 cabezas de consulta, compresion aprendida de la cache KV (4 tokens a 1 entrada), almacenamiento FP8 en formato E4M3, seleccion de bloques MoBA (top-3) y una tabla de n-gramas de 5 elementos con 0 parametros que genera hasta 32768 tokens "gratis" por paso sin forward pass. Segun la model card, esto da una reduccion de 16x en la cache KV y un contexto maximo declarado de 20M tokens.

El estado actual es de entrenamiento incompleto: la fase 1 (modelo base) ha alcanzado una perdida de 3,83 tras solo 500 pasos sobre WikiText-2 (2,4M tokens), y la fase 2 (entrenamiento de las cabezas Medusa y de los parametros de compresion) aun no ha comenzado. Es relevante como banco de pruebas de ingenieria de inferencia (throughput, compresion de KV, prefill de contexto largo), no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MQA, RoPE, RMSNorm, SwiGLU y embeddings atados; cabezas especulativas Medusa; atencion block-sparse MoBA |
| Parametros totales | ~480M (270M modelo base + 210M cabezas Medusa) |
| Longitud de contexto | Hasta 20M tokens (MoBA block-sparse, segun model card) |
| Tipos de cuantizacion | No disponible (la model card solo propone int8 de pesos como trabajo futuro, sin probar; la cache KV usa FP8 E4M3) |
| Idiomas soportados | No disponible (el objetivo de la fase 1 es producir ingles coherente) |
| Licencia | MIT segun la model card; los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | No disponible (no se especifica; el repo ocupa 17,4 GB y el codigo de carga es PyTorch) |

Datos adicionales de configuracion del modelo base: d_model 1024, 8 capas, 16 cabezas de consulta, 1 cabeza KV, FFN SwiGLU con multiplicador 8 (8192 ocultas), vocabulario de 50257 (BPE de GPT-2 via tiktoken).

## Arquitectura y entrenamiento

El modelo base es un transformer de 8 capas y 1024 dimensiones con atencion multi-query (1 cabeza KV para 16 cabezas Q), FFN SwiGLU, RMSNorm, RoPE y embeddings atados. Sobre el se anaden 4095 cabezas Medusa de rango 1, almacenadas como tensores batcheados `[K, d, 1]` y `[K, 1, V]`; el truco de argmax precalculado (`argmax(s * w) = argmax(w) si s > 0, argmin(w) en caso contrario`) evita el einsum + argmax de 410 MB de la salida Medusa. La cache KV se reduce 16x combinando MQA (4x), compresion aprendida de 4 tokens por entrada (4x), FP8 E4M3 (2x), seleccion MoBA top-3 por bloque y esparsidad intra-bloque (cada cuarta entrada comprimida). El borrador n-gram es una tabla de lookup de 5-gramas entrenada sobre 2,4M tokens de Wikipedia que se autoalimenta de sus propias predicciones.

En cuanto a entrenamiento, la fase 1 entrena unicamente los 270M parametros del modelo base con perdida de entropia cruzada de siguiente token (Medusa congelado). Los datos usados hasta ahora son WikiText-2 (2,4M tokens), con una perdida que pasa de 11,0 a 3,83 en 500 pasos; el plan declarado es continuar en WikiText-103 (100M tokens) hasta perdida < 3,0. La fase 2, prevista y no ejecutada, congelaria el modelo base y entrenaria las 4095 cabezas Medusa con perdida multi-posicion (muestreando 16 cabezas por paso por limitaciones de memoria) y los parametros de compresion con perdida de consistencia. No se documenta RLHF, DPO ni ajuste por preferencias en ninguna fase.

## Capacidades

- Generacion de tokens a very alto throughput en bf16 sobre una unica GPU (hasta 599.716 tok/s declarados con compilacion y n-gram M=32768 en una A6000).
- Decodificacion especulativa con cabezas Medusa de rango 1, con 4096 tokens por paso (K+1).
- Borrador n-gram de 0 parametros: tabla de 5-gramas que anade hasta 32768 tokens gratuitos por paso sin forward pass.
- Prefill de contexto largo, con benchmarks declarados sobre 20M tokens (123.873 tok/s en la version v5).
- Compresion de cache KV mediante MQA, compresion aprendida, FP8 y MoBA.
- Razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y agentes: no disponibles; no se declaran ni se han evaluado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el objetivo declarado es generar ingles coherente.
- Modo "thinking" o cualquier capacidad especial de inferencia: no disponible.

## Casos de uso

- Investigacion sobre decodificacion especulativa: el modelo sirve como banco de pruebas reproducible para medir el efecto de ampliar la tabla n-gram (M de 4096 a 32768) en el throughput por paso, con y sin `torch.compile`.
- Estudio de compresion de cache KV: la combinacion MQA + compresion 4:1 + FP8 E4M3 + MoBA es un caso de estudio medible para analizar el compromiso entre factor de compresion (16x declarado) y calidad de atencion.
- Benchmarking de prefill en contexto ultra-largo: los datos de la version v5 sobre 20M tokens permiten comparar coste de prefill entre un stack completo (MoBA + FP8 + compresion) y una variante reducida (v4, 228M, 1 capa).
- Optimizacion de kernels: la model card identifica que la FFN supone el 65% del tiempo de paso de inferencia, lo que convierte al modelo en un objetivo adecuado para experimentar con kernels Triton fusionados de SwiGLU.
- Medicion de latencia y throughput de entrenamiento: los datos de 14.267 a 38.427 tok/s segun residencia de datos en GPU y tamano de batch sirven para estudiar cuellos de botella de carga de datos en pipelines de entrenamiento pequenos.
- Pruebas de infraestructura de serving: al caber en 12 GB (segun el entorno local declarado, RTX 3060), permite validar configuraciones de servidor y captura de CUDA graphs en hardware de gama media.
- Reproduccion academica de tecnicas Medusa: el codigo separa modelo base, cabezas especulativas, n-gram, compresion y controlador de entrenamiento, lo que facilita aislar cada componente en experimentos controlados.
- No es adecuado, en su estado actual, para atencion al cliente, generacion de codigo en produccion ni ninguna tarea que requiera texto coherente o fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos son de throughput interno, medidos en una NVIDIA RTX A6000 en bf16 con 480M parametros:

| Configuracion (inferencia) | tok/s | Paso (ms) | Notas |
|---|---:|---:|---|
| Generacion base (sin n-gram) | 138.607 | 28,9 | Solo modelo, K+1 = 4096 tokens/paso |
| N-gram M=4096 | 266.218 | 28,9 | Aceleracion 1,9x |
| N-gram M=16384 | 491.148 | 40,7 | Aceleracion 3,5x |
| N-gram M=32768 | 581.646 | 57,3 | Aceleracion 4,2x |
| Compile + n-gram M=32768 | 599.716 | 55,6 | Mejor resultado declarado |
| N-gram potencial M=65536 | 686.305 | No disponible | Proyectado a partir de prueba con texto real |

| Configuracion (entrenamiento) | tok/s | Notas |
|---|---:|---|
| Original (carga de datos en CPU) | 14.267 | Copia CPU a GPU por paso |
| Datos residentes en GPU | 18.068 | Los datos permanecen en GPU |
| Datos en GPU + batch=32 | 38.427 | Aceleracion 2,7x |

| Prefill de contexto largo (A6000, 20M tokens) | tok/s | Notas |
|---|---:|---|
| v4 (228M, 1 capa) | 971.092 | Limitado por ancho de banda de pesos |
| v5 (480M, 8 capas) | 123.873 | Stack completo: MoBA + FP8 + compresion |

Advertencia sobre estas cifras: corresponden a una politica de "aceptar todo" (accept-all), no a una tasa de aceptacion real medida. La propia model card reconoce que la tasa de aceptacion real debe medirse despues de la fase 2. Por tanto, no son comparables con throughputs de decodificacion especulativa con validacion de borradores.

## Requisitos de hardware

- VRAM para pesos: estimacion de ~1 GB en bf16 para los 480M parametros totales (270M base + 210M Medusa), y ~0,5 GB en int8. La model card no publica cifras de VRAM medidas para pesos.
- Cache KV: no publicada. Como referencia aritmetica, con las 16x de compresion descritas (1 cabeza KV, head_dim 64, FP8 E4M3), 20M tokens de contexto implicarian del orden de 0,6 GB de cache; es una estimacion derivada, no un dato medido.
- GPU utilizadas por el autor: NVIDIA RTX A6000 de 48 GB (entorno remoto, bf16) y NVIDIA RTX 3060 de 12 GB (entorno local). El modelo cabe, por tanto, en GPU de consumo de 12 GB, e incluso en tarjetas de 8 GB si solo se cargan los pesos.
- GPU recomendadas: no hay recomendaciones oficiales. Para replicar los benchmarks de throughput hacen falta GPUs con buen ancho de banda de memoria; la A6000 es la referencia declarada. Los datos de prefill de la version v4 estan explicitamente limitados por ancho de banda de pesos.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama. El unico camino soportado es el codigo Python del propio repositorio (`inference.py` con V5Engine, `generate.py` para generar desde checkpoint), ademas de `torch.compile` y captura de CUDA graphs.
- Latencia y throughput: 28,9 ms por paso en la configuracion base y 55,6 ms por paso con compilacion y n-gram M=32768 (4096 tokens por paso), segun los datos declarados en la A6000.
- Formatos de cuantizacion listos para usar: no disponibles; int8 de pesos aparece unicamente como linea de trabajo futuro sin probar.
- Tamano del repositorio: 17,4 GB, muy superior a lo que ocupan los pesos en bf16, lo que sugiere la presencia de checkpoints adicionales u otros artefactos de entrenamiento no detallados.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos comparables con datos medidos. Los parientes conceptuales mas directos son las familias de decodificacion especulativa Medusa y EAGLE, pero la busqueda web realizada no devolvio documentacion sobre ellas ni sobre alternativas equivalentes; el unico resultado obtenido fue una pagina de anuncios de alquiler sin relacion con el modelo.

| Dimension | spec100m | Medusa (referencia conceptual) | EAGLE (referencia conceptual) |
|---|---|---|---|
| Enfoque | Transformer + 4095 cabezas Medusa rango 1 + n-gram de 0 parametros | Cabezas de decodificacion especulativa anadidas a un modelo base | Cabezas de borrador autoregresivas sobre caracteristicas |
| Parametros | ~480M (270M base + 210M Medusa) | No disponible | No disponible |
| Contexto | 20M tokens declarados (MoBA) | No disponible | No disponible |
| Rendimiento medido | Solo throughput interno; sin benchmarks de calidad | No disponible | No disponible |
| Licencia | MIT (segun model card) | No disponible | No disponible |
| Disponibilidad | Pesos y codigo en HuggingFace; 0 descargas, 0 likes | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo sin entrenamiento completado: la fase 1 lleva 500 pasos sobre WikiText-2 (2,4M tokens) con perdida 3,83. La model card reconoce que WikiText-2 es un corpus demasiado pequeno para un modelo de 270M y que la salida fluida en ingles es todavia un objetivo, no un hecho.
- Las cabezas Medusa no estan entrenadas (fase 2 pendiente), por lo que la decodificacion especulativa no produce borradores utiles; los numeros de throughput se obtuvieron aceptando todos los borradores.
- La tasa de aceptacion real de la decodificacion especulativa no se ha medido. Cualquier cifra de aceleracion (1,9x a 4,2x) debe tratarse como un limite superior, no como rendimiento aprovechable.
- El truco de rango 1 limita cada cabeza Medusa a dos posibles tokens (argmax o argmin), lo que la propia model card identifica como posible cuello de botella de calidad; se desconoce si rango 2 o 4 serian necesarios.
- Riesgo de alucinacion: no evaluado. No hay ninguna metrica de factualidad, veracidad ni robustez disponible.
- Sesgos: no documentados. El unico dato de entrenamiento es WikiText-2/Wikipedia en ingles, con el sesgo de dominio y de idioma que ello implica.
- Idiomas: sin soporte multilingue declarado ni evaluado.
- Sin benchmarks de calidad ni comparativas publicadas frente a otros modelos.
- Licencia MIT declarada en la model card, pero los metadatos de HuggingFace no la exponen; conviene verificar la licencia antes de cualquier uso comercial. El repo no incluye avisos adicionales de uso.
- Metadatos inconsistentes: la model card declara "MIT" en su seccion de licencia, mientras que la plataforma no informa de licencia, idiomas ni pipeline; las fechas de creacion y actualizacion (septiembre de 2026) tambien resultan anomalas.
- Ausencia total de traccion: 0 descargas y 0 likes, sin issues, demos ni comunidad verificable, lo que dificulta validar las afirmaciones de la model card de forma independiente.
- Los datos de entorno citan PyTorch 2.14.0+cu130 y Python 3.10 (remoto) y PyTorch 2.6.0+cu124 y Python 3.13 (local); no hay garantia de compatibilidad con otras versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akahsizrr/spec100m
- Paper: no disponible
- Repositorio de codigo independiente: no disponible (el codigo se describe dentro del propio repositorio de HuggingFace: `config.py`, `model.py`, `inference.py`, `ngram.py`, `train.py`, `data_pipeline.py`, `generate.py`, `bench_v5_1.py`, `profile_v5.py`, `profile_train_speed.py`, `test_v5_train.py`)
- Blog o articulo tecnico: no disponible
- Demo: no disponible
- Busqueda web: el unico resultado devuelto (https://www.ebay-kleinanzeigen.de/s-haus-mieten/einfamilienhaus/sachsen-anhalt/c205l2165+haus_mieten.haustyp_s:einfamilienhaus) no guarda ninguna relacion con el modelo y no se ha utilizado como fuente.
