# kindlingai/inkling-2-mini-exlr8-k2-k3-k4

## Resumen

Inkling-2-Mini exlr8 (K2/K3/K4) es una cuantizacion del modelo thinkingmachines/Inkling-2-Mini, publicada por kindlingai en el formato propietario exlr8 v2. El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) y capas en bucle (looped transformer): 24 capas fisicas expandidas a 48 capas virtuales, con 128 expertos enrutados por capa. La cuantizacion almacena todos los expertos enrutados en tres anchos de trellis (K2, K3 y K4) dentro del codebook `pmcgx`, y el ancho de servicio se selecciona en tiempo de carga mediante un manifiesto.

El objetivo de esta publicacion es el despliegue en dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10). Ofrece seis manifiestos de carga (`k4`, `bit325`, `k3`, `bit300`, `bit250`, `k2`) que permiten intercambiar calidad por memoria y velocidad sin cambiar de pesos. El repositorio ocupa 2,0 GB e incluye pesos cuantizados de expertos, pesos densos sin cuantizar, cabezas de prediccion multi-token y artefactos de verificacion de integridad.

La relevancia actual radica en que demuestra una cuantizacion por debajo de 4 bits por peso (hasta 2,00 bpw en el manifiesto `k2`) manteniendo una perplexity cercana a la referencia BF16: en el manifiesto `k4` la diferencia de PPL es de solo +0,0033 y la concordancia top-1 es del 96,90%. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle (looped transformer); 24 capas fisicas expandidas a 48 virtuales (prelude L0-L5, loop_core L6-L17 repetido 3 veces, coda L18-L23); 128 expertos enrutados por capa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 con codebook `pmcgx` y trellis redondeado a FP8 E4M3; anchos disponibles: K4 (4,00 bpw), bit325 (3,25 bpw medios), K3 (3,00 bpw), bit300 (3,00 bpw medios), bit250 (2,50 bpw medios), K2 (2,00 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (expertos en formato exlr8 `pmcgx`, pesos densos y MTP sin cuantizar); manifiestos JSON de carga |
| Libreria de inferencia | trellis |
| Tamano del repositorio | 2,0 GB |
| Memoria de pesos en servicio (GB10) | 19,36 GB (`k4`), 17,06 GB (`bit325`), 13,24 GB (`k2`) |
| Modalidad | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es `Inkling2LoopForConditionalGeneration`, un transformer MoE con bucle. La red tiene 24 capas fisicas que se ejecutan como 48 capas virtuales: un preludio de seis capas (L0-L5), un nucleo en bucle (`loop_core`, L6-L17) que se repite tres veces y una coda de seis capas (L18-L23). Cada capa contiene 128 expertos enrutados. Ademas de los expertos, el modelo incluye pesos densos sin cuantizar (atencion, router, embeddings) en `model-nonexperts.safetensors` y cabezas de prediccion multi-token en `mtp.safetensors`.

Esta publicacion no entrena el modelo, sino que lo cuantiza. Los expertos enrutados de las 24 capas fisicas se almacenan en tres anchos de trellis (K2, K3, K4) dentro del codebook `pmcgx`. Los manifiestos de ancho mixto (`bit325`, `bit300`, `bit250`) aplican una asignacion de distorsion marginal ponderada por Hessiano y consciente del bucle, que prioriza el nucleo ejecutado tres veces. Un requisito critico del formato es el redondeo a FP8 E4M3 (round to nearest even, saturante) de cada valor producido por el codebook antes de aplicar los vectores laterales; el codificador busco unicamente sobre valores redondeados a E4M3, por lo que un decodificador EXL3 estandar lee pesos mediblemente peores de los mismos bytes. La integridad de los 270 archivos de pesos, manifiestos, indices y metadatos esta verificada contra `SHA256SUMS`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `image-text-to-text`, etiqueta `conversational`).
- Procesamiento de imagen y texto combinados, segun la etiqueta de pipeline del modelo base.
- Prediccion multi-token (MTP) incluida como pesos separados, habilitada en las mediciones de rendimiento del autor.
- Razonamiento y capacidades del modelo base: no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Despliegue en estaciones de memoria unificada de clase GB10: el formato esta disenado para DGX Spark y ASUS GX10, donde los manifiestos `bit325` o `k2` reducen la memoria de pesos a 17,06 GB o 13,24 GB respectivamente, liberando espacio para el resto del sistema.
- Servicio de inferencia con presupuesto de memoria ajustado: seleccionar el manifiesto en tiempo de carga permite servir el mismo modelo con 13,24 GB (`k2`) o 19,36 GB (`k4`) sin reconvertir pesos, util para entornos con VRAM limitada.
- Aplicaciones multimodales imagen-texto: la etiqueta `image-text-to-text` del modelo base habilita tareas de descripcion de imagenes y preguntas sobre imagenes, aunque el detalle de calidad multimodal no esta documentado en esta publicacion.
- Evaluacion de tecnicas de cuantizacion extrema: los datos de KL y perplexity por manifiesto (de 4,00 a 2,00 bpw) sirven como referencia para investigar el limite practico de la cuantizacion por debajo de 4 bits en modelos MoE con bucles.
- Experimentacion con decodificacion multi-token: los pesos MTP incluidos permiten probar decodificacion especulativa o predictiva en el mismo despliegue.
- Prototipado de asistentes conversacionales en hardware de borde: con 13,24 GB en el manifiesto `k2` y 29,05 tok/s en decodificacion c1, es viable para demos interactivas en un unico dispositivo GB10.
- Verificacion de integridad en pipelines de produccion: los checksums SHA256 y los indices pre-sliced facilitan la validacion automatizada del despliegue.

## Benchmarks y rendimiento

Calidad medida sobre 40 secuencias reservadas de 2.048 tokens (81.920 tokens en total) frente a la referencia BF16 de `thinkingmachines/Inkling-2-Mini` (PPL de referencia 5,3811; NLL 1,6829):

| Manifiesto | bpw medios enrutados | bpw loop-core | KL media | KL mediana | Concordancia top-1 | PPL cuantizada | Delta PPL |
|---|---:|---:|---:|---:|---:|---:|---:|
| `k4` | 4,00 | 4,00 | 0,01018 | 0,00163 | 96,90% | 5,3844 | +0,0033 |
| `bit325` | 3,25 | 3,59 | 0,01596 | 0,00304 | 95,95% | 5,3913 | +0,0101 |
| `k3` | 3,00 | 3,00 | 0,01847 | 0,00410 | 95,32% | 5,3876 | +0,0064 |
| `bit300` | 3,00 | 3,32 | 0,01929 | 0,00389 | 95,32% | 5,4087 | +0,0275 |
| `bit250` | 2,50 | 2,85 | 0,03172 | 0,00792 | 93,72% | 5,4357 | +0,0546 |
| `k2` | 2,00 | 2,00 | 0,06039 | 0,01840 | 90,96% | 5,5430 | +0,1619 |

Rendimiento en un unico NVIDIA GB10 (TP=1, MTP activado) frente a NVFP4 nativo (22,39 GB de pesos; c1 15,99 / c4 43,39 / c8 62,26 tok/s):

| Manifiesto | Memoria de pesos | Decodificacion c1 (tok/s) | c4 (tok/s) | c8 (tok/s) | Frente a NVFP4 nativo |
|---|---:|---:|---:|---:|---|
| `k4` | 19,36 GB | 16,11 | 41,67 | 65,68 | -3,03 GB |
| `bit325` | 17,06 GB | 18,30 | 45,71 | 74,92 | -5,33 GB; +14,4% / +5,3% / +20,3% |
| `k2` | 13,24 GB | 29,05 | 58,89 | 90,91 | -9,15 GB; +81,7% / +35,7% / +46,0% |

## Requisitos de hardware

- Memoria de pesos en inferencia: 19,36 GB (`k4`), 17,06 GB (`bit325`) y 13,24 GB (`k2`) segun las mediciones del autor en GB10.
- GPU objetivo: dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10). El autor no documenta otros aceleradores.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible. El formato exlr8 y la libreria `trellis` estan orientados a GB10; no se declara soporte para otras arquitecturas.
- Opciones de despliegue: libreria `trellis` con los manifiestos incluidos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: medidos en GB10 con TP=1 y MTP activado; entre 16,11 y 29,05 tok/s en decodificacion c1, y entre 65,68 y 90,91 tok/s en c8, segun manifiesto.
- Almacenamiento: repositorio de 2,0 GB; los pesos se cargan desde archivos safetensors por capa con indices pre-sliced.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini exlr8 (este) | no disponible (MoE, 128 expertos/capa, 24 capas fisicas) | no disponible | exlr8 v2, 2,00-4,00 bpw | 13,24-19,36 GB en GB10 | Apache 2.0 | Hugging Face (kindlingai) |
| thinkingmachines/Inkling-2-Mini (BF16) | no disponible | no disponible | BF16 | no disponible | no disponible | Hugging Face (modelo base) |
| Inkling-2-Mini NVFP4 nativo | no disponible | no disponible | NVFP4 | 22,39 GB | no disponible | Referencia citada por el autor |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos no son utilizables sin el redondeo a FP8 E4M3 (round to nearest even, saturante) de cada valor del codebook antes de aplicar los vectores laterales. Un decodificador EXL3 estandar, o cualquiera que omita el redondeo, lee pesos mediblemente peores de los mismos bytes.
- Dependencia de la libreria `trellis` y del formato exlr8 v2: no hay soporte documentado en ecosistemas estandar como vLLM, llama.cpp, Ollama o TGI.
- Orientado especificamente a dispositivos de clase GB10; no se documenta funcionamiento en otras GPU.
- En el manifiesto mas agresivo (`k2`, 2,00 bpw) la perdida de calidad es apreciable: KL media de 0,06039, concordancia top-1 del 90,96% y delta de PPL de +0,1619 frente a BF16.
- Los manifiestos de ancho mixto (`bit325`, `bit300`, `bit250`) dependen de la asignacion de distorsion ponderada por Hessiano; el rendimiento puede variar fuera de la distribucion de evaluacion (40 secuencias de 2.048 tokens).
- Idiomas soportados no declarados; el comportamiento multilingue no esta documentado.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible, pero aplican los del modelo base, no evaluados en esta publicacion.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini`, no declarada en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/inkling-2-mini-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Especificacion del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
