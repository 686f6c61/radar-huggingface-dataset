# Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF

## Resumen

Qwen3.8-Flash-Next-131B-A6B-GGUF es una cuantizacion GGUF derivada de Qwen/Qwen3.8-Flash-Next, un modelo de arquitectura Mixture of Experts (MoE) desarrollado por Alibaba Qwen. La intervencion clave de esta ficha no es una cuantizacion convencional: el autor, Cyronius, aplica una poda selectiva sobre la tabla de n-gram hash-embedding del modelo base, que ocupa 51.200 millones de parametros (aproximadamente el 29% de los pesos totales) distribuidos en 16 cabezas de hash independientes (8 para bigramas y 8 para trigramas) inyectadas en la capa 1. La version publicada conserva una sola cabeza por tipo de n-grama y descarta las otras catorce, reduciendo el modelo de unos 176.000 millones a 132.143.676.320 parametros totales sin reentrenamiento ni modificacion de las capas transformer.

El resultado es un GGUF de 64,8 GB (variante UD-Q3_K_XL) que, segun el autor, mantiene paridad con el cuantizado completo de 90 GB en tool calling, GSM8K y MMLU, con un coste medible en perplejidad sobre WikiText-2 (de 2,40 a 4,66). El modelo mantiene intactos los 48 bloques transformer y los 512 expertos por capa, con 6.000 millones de parametros activos por token. El repositorio incluye tres builds: la variante Q3_K_XL de 64,8 GB, una Q4_0 de 75,4 GB orientada a GPUs antiguas (AMD gfx906, NVIDIA Pascal) y una UD-Q4_K_XL de 86,1 GB con cabezas bigrama y trigrama calibradas.

La relevancia de esta publicacion es doble: por un lado, demuestra empiricamente que una fraccion sustancial de los parametros de un modelo MoE moderno puede eliminarse sin degradar tareas de razonamiento o uso de herramientas, lo que abarata el despliegue en hardware de gama alta pero no enterprise; por otro, documenta con rigor que la poda clasica de capas transformer colapsa esta arquitectura (GSM8K cae a 0,33-0,67 y la perplejidad supera 13), mientras que la poda de la tabla n-gram es la unica intervencion viable sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla de n-gram hash-embedding (16 cabezas en el base, 2 en este build) |
| Parametros totales | 132.143.676.320 (frente a ~176.000 millones del base) |
| Parametros activos | 6.000 millones por token |
| Longitud de contexto | no disponible (los ejemplos de ejecucion usan `-c 8192`) |
| Tipos de cuantizacion | UD-Q3_K_XL (64,8 GB), Q4_0 (75,4 GB), UD-Q4_K_XL con cabezas 4-8 (86,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 48 capas y 512 expertos por capa. Su particularidad es una tabla de n-gram hash-embedding de 51.200 millones de parametros (16 cabezas de hash: 8 para bigramas y 8 para trigramas) inyectada en la capa 1, que actua como un predictor superficial de siguiente token mediante busquedas redundantes tipo filtro de Bloom. Cada n-grama se consulta por varias vias independientes, lo que proporciona un margen de seguridad estructural frente a la perdida de cabezas.

Esta ficha no entrena ni modifica el transformer: cada build copia byte a byte todos los tensores no afectados desde su cuantizado de origen (unsloth UD-Q3_K_XL, bartowski Q4_0 y Unsloth UD-Q4_K_XL respectivamente), preservando la calibracion imatrix. La seleccion de cabezas en el build UD-Q4_K_XL se realizo mediante un barrido de las 64 parejas bigrama/trigrama, escogiendo la cabeza 4 de bigrama y la 8 de trigrama; el GGUF exportado igualo la perplejidad del par seleccionado sobre el conjunto de validacion. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO. La decodificacion especulativa u otras innovaciones de inferencia no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en modo instruct y modo thinking, con muestreo recomendado distinto para cada uno (instruct: temp 0,7, top_p 0,8, presence_penalty 1,5; thinking: temp 1,0, top_p 0,95).
- Tool calling y function calling: evaluado con 40 casos agenticos sobre esquemas disjuntos de cualquier dato visto en la seleccion de cabezas, con puntuacion de 1,000 en el build Q3_K_XL.
- Razonamiento matematico: GSM8K con subconjunto de 15 items y MMLU con 30 items en modo no-think, ambos a la par del cuantizado completo.
- Razonamiento de sentido comun: ARC-Challenge con 45/48 en el build UD-Q4_K_XL con cabezas 4 y 8, frente a 46/48 del completo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles; el autor indica que el modelo es text-only.
- Integracion con llama.cpp: compatible con endpoints (`endpoints_compatible`) y con el flag `--override-tensor` para descargar la tabla n-gram a RAM del sistema.

## Casos de uso

- Despliegue de agentes con tool calling en produccion: el modelo mantiene paridad con el cuantizado completo en 40 casos agenticos con esquemas desconocidos, por lo que sirve para orquestar APIs y funciones en pipelines automatizados con un GGUF un 28% mas pequeno.
- Inferencia en estaciones de trabajo con 2x32 GB de VRAM: usando la variante Q4_0 con `--override-tensor "per_layer_token_embd\.weight=CPU"`, la tabla de 3,6 GB pasa a RAM y deja unos 72 GB de transformer en GPU, lo que hace viable el modelo en dos tarjetas de 32 GB.
- Hardware legacy AMD gfx906 (MI50/MI60) y NVIDIA Pascal (P40/P100): el build Q4_0 alcanza la ruta MMVQ de llama.cpp, mientras que los K-quants e IQ4_NL caen en una ruta generica de dequantizacion varias veces mas lenta; en estas GPUs la variante Q4_0 prioriza throughput sobre VRAM.
- Evaluacion de tecnicas de poda en investigacion: el repositorio documenta de forma reproducible que la poda de capas transformer colapsa la arquitectura (GSM8K 0,33-0,67, perplejidad superior a 13) mientras que la poda de la tabla n-gram preserva razonamiento, lo que lo convierte en material de referencia para estudiar redundancia en MoE.
- Servicio de generacion de texto en CPU con RAM abundante: el autor confirma que funciona en equipos solo-CPU (lento pero correcto) con unos 70 GB de RAM libres para Q3_K_XL y unos 80 GB para Q4_0, util para entornos sin GPU dedicada.
- Calibracion de cuantizaciones con imatrix: al heredar byte a byte los tensores calibrados de Unsloth y bartowski, sirve como base para experimentos de cuantizacion mixta que quieran aislar el efecto de la tabla n-gram del resto de pesos.

## Benchmarks y rendimiento

Mediciones del autor sobre llama.cpp b10673, CUDA, A100, temperatura 0, mismo dia. Tool calling: 40 casos agenticos. GSM8K-15 y MMLU-30 en modo no-think. Perplejidad: WikiText-2 test, 32 fragmentos de 512 tokens.

| Modelo | Tamano | Tools | GSM8K | MMLU | PPL |
|---|---:|---:|---:|---:|---:|
| Base UD-Q3_K_XL | 90 GB | 0,900 | 1,000 | 0,833 | 2,40 |
| Este modelo (2/16 cabezas) | 64,8 GB | 1,000 | 1,000 | 0,833 | 4,66 |
| Tabla eliminada por completo (0/16) | 61,2 GB | 0,975 | 1,000 | 0,767 | 4,80 |

El autor advierte que la precision en tool calling tiene una banda de ±3 casos entre backends de hardware a temperatura 0 (una ejecucion de control en CPU dio 0,975 al base), por lo que la comparacion 1,000 frente a 0,900 debe leerse como paridad, no como mejora. El coste real es la perplejidad: la tabla n-gram actua como predictor superficial de siguiente token y eliminar el 87,5% de ella duplica la perplejidad de WikiText-2 sin afectar al razonamiento.

Para el build UD-Q4_K_XL con cabezas 4 y 8:

| Evaluacion | UD-Q4_K_XL completo | Cabezas 4 y 8 |
|---|---:|---:|
| Perplejidad WikiText-2 test (16 x 512 tokens) | 2,134 | 5,730 |
| Perplejidad WikiText-2 validacion separada | 3,209 | 4,038 |
| Perplejidad texto NASA held-out | 8,385 | 8,629 |
| ARC-Challenge subconjunto desarrollo | 46/48 | 45/48 |

## Requisitos de hardware

- VRAM para Q3_K_XL: aproximadamente 66 GB o mas para offload completo con `-ngl 99`.
- VRAM para Q4_0: aproximadamente 77 GB o mas para offload completo; con `--override-tensor` se liberan 3,6 GB de tabla a RAM y quedan unos 72 GB en GPU.
- VRAM para UD-Q4_K_XL con cabezas 4-8: no disponible con precision; el archivo pesa 86,1 GB.
- GPUs recomendadas: A100 para las mediciones publicadas; 2x32 GB para el build Q4_0 con la tabla en RAM; AMD gfx906 (MI50/MI60) y NVIDIA Pascal (P40/P100) para Q4_0 por su mejor ruta MMVQ.
- No cabe en GPUs de consumo de 24 GB ni en configuraciones de una sola tarjeta de 48 GB sin descargar la tabla a RAM y aun asi el transformer excede esa capacidad.
- Opciones de despliegue: llama.cpp (obligatorio, version del 2026-08-27 o posterior con soporte `qwen4exp`; probado con b10673) mediante `llama-server`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; solo se documenta que en CPU funciona correctamente pero lento.
- RAM del sistema para ejecucion solo-CPU: aproximadamente 70 GB para Q3_K_XL y 80 GB para Q4_0, por encima del tamano del archivo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF | 132,1 B | 6 B | no disponible | qwen-community-1.0 | GGUF en HF, 1.445 descargas | Poda de tabla n-gram, 64,8-86,1 GB |
| Qwen/Qwen3.8-Flash-Next (base) | ~176 B | 6 B | no disponible | qwen-community-1.0 | Modelo original en HF | Tabla n-gram completa de 51,2 B |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-Q3_K_XL) | ~176 B | 6 B | no disponible | qwen-community-1.0 | GGUF en HF | 90 GB, referencia de paridad |
| bartowski/Qwen3.8-Flash-Next-GGUF (Q4_0) | ~176 B | 6 B | no disponible | qwen-community-1.0 | GGUF en HF | 111,3 GB en UD-Q4_K_XL segun el autor |

No se dispone de datos de benchmarks de terceros ni de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La perplejidad se degrada de forma sustancial: 4,66 frente a 2,40 en WikiText-2 para Q3_K_XL, y 5,730 frente a 2,134 en el build UD-Q4_K_XL con cabezas 4 y 8. Afecta a la calidad de la generacion superficial aunque no al razonamiento medido.
- El build Q4_0 no ha sido evaluado de forma independiente y nadie ha reportado aun su ejecucion; las cifras publicadas corresponden al Q3_K_XL y no son transferibles.
- La poda de capas transformer no es una alternativa: colapsa la arquitectura (GSM8K 0,33-0,67, perplejidad superior a 13), por lo que no hay margen adicional de reduccion sin reentrenamiento.
- La precision en tool calling tiene una variabilidad de ±3 casos entre backends a temperatura 0; no debe interpretarse la diferencia frente al base como una mejora real.
- Requiere una version muy reciente de llama.cpp (2026-08-27 o posterior); versiones anteriores no soportan `qwen4exp`.
- Licencia qwen-community-1.0: es necesario revisar los terminos del enlace oficial antes de cualquier uso comercial, ya que el repositorio la etiqueta como `other` y no se detallan aqui las restricciones concretas.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones especificas en la informacion disponible.
- El modelo es text-only segun el autor; no hay soporte de vision ni audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizados Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Arbol UD-Q4_K_XL de Unsloth (commit referenciado): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/tree/f5d175de2cf7f720d45d6064019a81fcf056e986
- Cuantizados bartowski: https://huggingface.co/bartowski/Qwen3.8-Flash-Next-GGUF
- Build UD-Q4_K_XL con cabezas 4-8: https://huggingface.co/Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF/blob/main/Qwen3.8-Flash-Next-UD-Q4_K_XL-heads-4-8.gguf
