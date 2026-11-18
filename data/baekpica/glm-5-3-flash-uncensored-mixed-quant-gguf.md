# Baekpica/GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF

## Resumen

GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF es una distribucion en formato GGUF de cuantizacion mixta derivada de `orcarouter/GLM-5.3-Flash-Uncensored-FP8`, un modelo multimodal de tipo image-text-to-text con arquitectura MoE. Lo publica el usuario Baekpica y su interes principal radica en la receta de cuantizacion: combina precisiones desde Q8_0 hasta IQ2_XXS segun el rol de cada tensor, preservando mayor fidelidad en las rutas siempre activas y en seis capas enrutadas de frontera. El resultado es un artefacto de aproximadamente 95 GB que cabe en una unica GPU DGX Spark / GB10.

El modelo conserva una ventana de contexto nativa de 1.048.576 tokens, con 45 capas de tronco (34 KDA y 11 de atencion dispersa), 288 expertos enrutados por capa con top-8 activos y un bloque MTP embebido. Incluye ademas un encoder de vision separado en BF16. El pipeline declarado es image-text-to-text, aunque la calibracion del imatrix se realizo unicamente con entradas de texto.

La relevancia actual del artefacto es doble: por un lado, demuestra que es viable servir un modelo MoE de este tamano con contexto de un millon de tokens en hardware de una sola GPU de gama workstation; por otro, su receta mixta requiere una extension de runtime especifica sobre `antirez/ds4`, ya que la compatibilidad con llama.cpp upstream no esta establecida. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 45 capas de tronco (34 KDA + 11 sparse-attention), MTP embebido, encoder de vision separado |
| Parametros totales | 563.627.008 (dato de safetensors del repo; el tamano del repo es 95,0 GB) |
| Parametros activos | 288 expertos enrutados por capa, top-8 activos (numero de parametros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | Receta mixta: Q8_0, Q4_K, F32, BF16, IQ2_XS, IQ2_XXS, Q2_K (con imatrix opcional en down) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (pesos principales + MTP: 87,470 GiB; total con vision: 88,520 GiB / 95,047 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 45 capas de tronco: las capas 0 a 2 son densas y el resto combinan 34 capas KDA (Kimi Delta Attention) con 11 capas de atencion dispersa. Cada capa enrutada contiene 288 expertos con activacion top-8. El modelo incorpora un bloque MTP (multi-token prediction) embebido en el indice 45, ademas de un encoder de vision independiente que conserva los pesos BF16 originales. La ventana de contexto nativa es de 1.048.576 tokens.

La receta de cuantizacion mixta asigna formatos por grupo de tensores: embedding y cabeza de salida, MLP densas y expertos compartidos en Q8_0; proyecciones query/key de KDA en Q4_K; el resto de KDA y las proyecciones principales de atencion dispersa/MLA en Q8_0; pesos de router, biases, normas y controles de estado en F32; indexer, mixers mHC y proyeccion de hidden-state del MTP en BF16. Las matrices gate/up enrutadas usan IQ2_XS + imatrix en las capas 3, 4, 5, 43, 44 y 45, e IQ2_XXS + imatrix en el resto; las down enrutadas usan Q2_K (imatrix opcional) en las capas de frontera e IQ2_XS + imatrix en las demas. La calibracion cubrio 81.920 posiciones de texto y todos los expertos enrutados del tronco. Una muestra acotada de Q2_K mostro un 51,2 % menos de error cuadratico de reconstruccion ponderado por activacion con imatrix, si bien el autor aclara que es un proxy de reconstruccion y no una mejora medida de calidad de respuesta. La calibracion con imagenes no se reclama: el imatrix se recoge solo de texto.

La innovacion tecnica destacable es el propio esquema de precision mixta por rol de tensor, junto con el soporte de decodificacion especulativa mediante el bloque MTP embebido (opt-in) y el streaming opcional de expertos desde SSD. El runtime objetivo es la extension de `antirez/ds4` y el host en Rust `ds4-dfm-rs`.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventana nativa de 1.048.576 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante encoder de vision en BF16.
- Tool calling y function calling: el autor menciona comprobaciones acotadas de texto, herramientas, imagen, restauracion de estado y reutilizacion de disco.
- Razonamiento multi-paso y modo agente: soporta continuaciones HTTP con cache de prefijo en el runtime Rust.
- Decodificacion especulativa via MTP embebido (opt-in), con verificacion de estado de prefijo aceptado.
- Capacidades multilingues: no disponible (la model card no las enumera; los benchmarks de rendimiento usan texto natural en italiano e ingles).
- Variante "uncensored": el modelo base declara ausencia de filtrado, aunque la model card no detalla el alcance de esta caracteristica.

## Casos de uso

- Analisis de documentos largos y bases de codigo: con 1.048.576 tokens de contexto nativo, el modelo puede ingerir repositorios completos o expedientes extensos en una sola pasada, sin necesidad de chunking ni recuperacion externa.
- Asistentes de codigo con acceso a herramientas: el soporte de tool calling y de continuaciones HTTP con cache de prefijo permite integrarlo en pipelines de CI/CD o en IDE que consulten APIs internas y ejecuten comandos.
- Procesamiento multimodal de documentacion: al ser image-text-to-text, puede extraer informacion de capturas, diagramas y documentos escaneados combinados con texto largo en la misma ventana.
- Despliegue en estacion de trabajo unica: con 88,5 GiB en una DGX Spark / GB10, encaja en escenarios de laboratorio o prototipado donde no se dispone de un cluster multi-GPU.
- Investigacion sobre cuantizacion extrema: el artefacto sirve como caso de estudio reproducible de recetas mixtas IQ2 con imatrix y de su impacto en reconstruccion de pesos.
- Agentes autonomos con estado persistente: la restauracion de estado y la reutilizacion de disco del runtime permiten mantener sesiones largas de agente con cache de contexto entre peticiones.
- Evaluacion de decodificacion especulativa: el bloque MTP embebido permite medir ganancias de throughput en hardware objetivo frente a decodificacion autoregresiva clasica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que la calidad mas amplia "permanece abierta".

Si se publican metricas de rendimiento del runtime en DGX Spark / GB10 (CUDA 13.4.92, reloj 300-2200 MHz, MTP Off, texto natural en italiano, prefill de 2.048 tokens sobre prefijo cacheado y generacion de 128 tokens greedy):

| Build | Prefill tok/s (media 2K-64K) | Decode tok/s (media 2K-64K) | Prefill 8K en frio | Decode 8K |
|---|---:|---:|---:|---:|
| Antes (main 8c2068b5) | 183,2 | 15,09 | 215,9 | 15,17 |
| Despues (1212cebb) | 784,7 | 18,92 | 805,9 | 19,06 |

El barrido "despues" es la mediana de tres ejecuciones (prefill 784,1-784,7; decode 18,91-18,95); el "antes" es una sola ejecucion. Los limites teoricos del host son 10,5 GB por token en decode, 21,9-23,8 tok/s a 230-250 GB/s con MTP Off, y 35,7 GFLOP por token en prefill (unos 3.000 tok/s al pico FP16 de tensor cores).

## Requisitos de hardware

- VRAM estimada: 88,520 GiB (95,047 GB) para pesos completos incluyendo vision y MTP; 87,470 GiB para tronco + MTP.
- GPU recomendada por el autor: DGX Spark / GB10 con CUDA 13.4.92; el artefacto esta dimensionado para una unica GPU de esa clase.
- No cabe en GPUs consumer convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) sin streaming de expertos desde SSD, opcion que el runtime soporta y que viene desactivada por defecto.
- Opciones de despliegue: runtime `ds4-dfm-rs` (host en Rust) sobre la extension de `antirez/ds4`. La compatibilidad con llama.cpp upstream no esta establecida. No se mencionan vLLM, TGI ni Ollama.
- Throughput medido en DGX Spark: 784,7 tok/s de prefill y 18,92 tok/s de decode (media 2K-64K, MTP Off); 805,9 tok/s y 19,06 tok/s en celdas de 8K en frio.
- Limite teorico de decode en ese host: 21,9-23,8 tok/s a 230-250 GB/s de ancho de banda, con 10,5 GB transmitidos por token.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (mismo tamano, misma tarea o misma familia GLM) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La calidad del modelo cuantizado no esta validada de forma amplia: el autor declara que la evaluacion de calidad "permanece abierta" y que los datos de imatrix son proxies de reconstruccion, no mejoras medidas de respuesta.
- La calibracion del imatrix se realizo solo con texto; no se reclama calibracion de activaciones condicionada por imagen, por lo que el rendimiento multimodal puede degradarse respecto al modelo FP8 original.
- El bloque MTP no recibe estadisticas de activacion del grafo GLM upstream: usa importancia basada en pesos para IQ2_XS gate/up y Q2_K down sin ponderar. El comportamiento de drafting queda pendiente de verificacion en hardware objetivo.
- La receta mixta exige una extension de runtime especifica; no hay compatibilidad establecida con llama.cpp upstream, lo que limita la portabilidad y el ecosistema de herramientas disponible.
- El streaming de expertos desde SSD viene desactivado por defecto; activarlo introduce dependencia de latencia de disco y puede degradar el throughput.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; al ser una variante "uncensored", cabe esperar menor alineacion de seguridad, aunque no se documenta su alcance.
- Idiomas soportados no declarados formalmente; las pruebas de rendimiento usan italiano e ingles, sin garantia sobre otras lenguas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- El dato de parametros totales procedente de safetensors (563.627.008) resulta inconsistente con el tamano del repo (95 GB) y con la descripcion arquitectonica (288 expertos por capa); conviene tratarlo con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baekpica/GLM-5.3-Flash-Uncensored-Mixed-Quant-GGUF
- Modelo base: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Runtime original ds4: https://github.com/antirez/ds4
- Runtime Rust ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Pull request de rendimiento en Spark: https://github.com/Baekpica/ds4-dfm-rs/pull/138
- Commit de referencia (antes): https://github.com/Baekpica/ds4-dfm-rs/commit/8c2068b5
- Commit de referencia (despues): https://github.com/Baekpica/ds4-dfm-rs/commit/1212cebb6618ebb2a5bf7df849b01a312200f5e8
- Registro de optimizacion: https://github.com/Baekpica/ds4-dfm-rs/blob/1212cebb6618ebb2a5bf7df849b01a312200f5e8/docs/glm53-mixed-optimizati
- Dataset de calibracion: https://huggingface.co/datasets/Baekpica/Inkling-Small-Multimodal-Calibration
- Resumen de calibracion: calibration-summary.json (dentro del repositorio del modelo)
- Instrucciones de runtime: runtime/README.md (dentro del repositorio del modelo)
