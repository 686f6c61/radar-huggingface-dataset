# jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-3.0bpw-MTP-GGUF

## Resumen

ATX Swift 1.5 Qwen3.8-27B Uncensored 3.0bpw MTP es una cuantizacion GGUF de muy baja precision (3.0 bits por peso) del modelo Qwen/Qwen3.8-27B, producida por el usuario jakeatx mediante la herramienta de compresion llamAmpere. El objetivo declarado es hacer que un modelo de 27.000 millones de parametros quepa en una GPU de 12 GB de VRAM manteniendo el contexto completo de 262.144 tokens y la decodificacion especulativa MTP (multi-token prediction) activada, algo que segun la model card no es posible con las recetas de cuantizacion convencionales en ese mismo hardware.

La ficha tecnica del autor se centra en la calidad de la compresion: reporta una divergencia KL (KLD) de 0,0270 frente al modelo base en BF16 sobre 16.200 posiciones de codigo, agentes y RAG a unos 12K de contexto, con un Top-1 del 95,98%, y afirma que el archivo de 11,24 GB tiene un 54% menos de deriva que la receta Unsloth UD-Q2_K_XL. Tambien incluye una comparativa direccional en LiveCodeBench v6 (89% frente a 87% de UD-Q2_K_XL y 90,3% del BF16 publicado) y una reduccion del 33% en tokens generados por respuesta.

Es relevante ahora porque propone una via para ejecutar modelos de clase 27B con ventanas de contexto muy largas en GPUs de consumo, aunque con una dependencia critica: requiere llamAmpere 0.7, una version que el autor indica que aun no se ha publicado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el dato de parametros totales en safetensors (2.097.152) no es coherente con un modelo de 27B, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con decodificacion especulativa MTP y atencion LSA en el runtime llamAmpere |
| Parametros totales | 27B segun la denominacion del modelo base; el campo safetensors del repo indica 2.097.152 (dato no coherente, tratar con cautela) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (archivo de 12 GB); 212.992 tokens en la variante de 2,3 bpw; 204.800 tokens en la de 2,1 bpw |
| Tipos de cuantizacion | GGUF a 3.0 bpw (archivo principal de 12 GB), 2,3 bpw y 2,1 bpw en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, con sidecars GGUF adicionales (lsa-qwen38-27b-d2048.gguf, mtp-dm.gguf, head-ait2.gguf, head-exact-f16.gguf) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer de 27.000 millones de parametros del que no se detallan en la informacion disponible ni la composicion del dataset de entrenamiento ni las fases de alineacion (RLHF, DPO u otras). La model card se centra en el proceso de compresion, no en el entrenamiento original. El autor describe el resultado como una version "Uncensored", es decir, con el comportamiento de rechazo del modelo base presumiblemente atenuado, aunque no se documenta el procedimiento exacto ni el alcance de esa modificacion.

La innovacion tecnica principal es la compresion mediante llamAmpere, que combina atencion LSA (con un mapa de indices de 2048 dimensiones empaquetado en un sidecar GGUF), KV cache descargada a memoria host y decodificacion especulativa MTP con cabezas de draft y de rescoring exacto. La model card reporta que el archivo de 12 GB alcanza 11.544 MiB de VRAM pico medida con contexto completo y MTP activo, y que la variante de 2,1 bpw baja a 7.506 MiB. La calidad se evalua por KLD frente al BF16 del mismo modelo base sobre 16.200 posiciones, con las recetas de Unsloth recalculadas sobre Swift 1.5 para que todas las filas compartan profesor.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generacion de codigo, con resultados reportados en LiveCodeBench v6 (89% con grader estricto en una sola semilla).
- Escenarios agenticos y de RAG, segun la composicion del conjunto de evaluacion KLD del autor (codigo, agentes y RAG a ~12K de contexto).
- Contexto largo de hasta 262.144 tokens en el archivo de 12 GB, con MTP activo.
- Decodificacion especulativa MTP para acelerar la generacion.
- Modo "uncensored": menor tendencia al rechazo de peticiones, segun la denominacion del autor (sin documentacion tecnica del metodo).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos en una GPU de 12 GB: con 262.144 tokens de contexto, el modelo puede ingerir varios archivos y su historial de cambios en una sola ventana para tareas de revision o refactorizacion, sin necesidad de trocear el codigo.
- Asistentes de codigo en estaciones de trabajo con RTX 3060 de 12 GB o similares: el archivo de 3.0 bpw esta medido a 11.544 MiB de VRAM pico, por lo que encaja en tarjetas de 12 GB con el runtime adecuado.
- Pipelines de RAG con documentacion extensa: la evaluacion del autor incluye posiciones de RAG a ~12K de contexto, y la ventana completa permite concatenar muchos fragmentos recuperados sin truncar.
- Agentes multi-paso con contexto acumulado: la decodificacion MTP y la KV cache descargada a host permiten mantener sesiones largas en hardware modesto, aunque con la penalizacion de latencia que implica el offload.
- Generacion de codigo en produccion con restricciones de VRAM: el modelo reporta 89% en LiveCodeBench v6 y respuestas un 33% mas cortas que UD-Q2_K_XL, lo que reduce coste por token en entornos con GPU limitada.
- Experimentacion e investigacion en cuantizacion extrema: el repositorio incluye sidecars, hashes SHA-256 y metricas KLD/Top-1 que permiten reproducir y auditar la receta de compresion frente a alternativas como Unsloth UD.
- Despliegue en GPUs de 8 GB: la variante de 2,1 bpw con 204.800 tokens de contexto y 7.506 MiB pico permite ejecutar un 27B en tarjetas de gama baja, a costa de mayor deriva (KLD no reportada para esa variante en la tabla principal).

## Benchmarks y rendimiento

| Metrica | ATX 12 GB (3.0 bpw) | Unsloth UD-IQ3_XXS | Unsloth UD-Q2_K_XL | ATX AI2 2.3 bpw | Mirai S | Qwen BF16 |
|---|---|---|---|---|---|---|
| Tamano | 11,24 GB | 10,93 GB | 9,95 GB | 9,14 GB | no disponible | no disponible |
| KLD (menor es mejor) | 0,0270 | 0,0396 | 0,0591 | 0,0593 | 0,0745 | referencia |
| Top-1 | 95,98% | 95,33% | 94,00% | 94,06% | no disponible | referencia |
| LiveCodeBench v6 (strict) | 89% | no disponible | 87% | no disponible | no disponible | 90,3% (publicado) |
| Tokens medianos por respuesta (LCB v6) | 4.608 | no disponible | 8.932 | no disponible | no disponible | no disponible |
| VRAM pico medida | 11.544 MiB | no disponible | no disponible | no disponible | no disponible | no disponible |

Notas: la puntuacion de LiveCodeBench es de una sola semilla y el propio autor la califica de direccional, no estadisticamente significativa. Las filas de Unsloth son recetas UD por tensor e imatrix aplicadas a Swift 1.5, no los pesos originales de Unsloth. El conjunto KLD usa 16.200 posiciones de codigo, agentes y RAG a ~12K de contexto, puntuadas contra Swift 1.5 BF16.

## Requisitos de hardware

- VRAM estimada: 11.544 MiB pico medida para el archivo de 3.0 bpw con 262.144 tokens de contexto y MTP activo; 7.506 MiB para la variante de 2,1 bpw con 204.800 tokens.
- GPU recomendadas: tarjetas Ampere de 12 GB (RTX 3060 12 GB, RTX 3080 Ti, A10, A4000) para el archivo principal; tarjetas de 8 GB para la variante de 2,1 bpw. El tag "ampere" y el nombre "llamAmpere" sugieren soporte centrado en esa generacion.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB y en tarjetas de 8 GB con la variante de 2,1 bpw, siempre con el runtime llamAmpere.
- Opciones de despliegue: llama-server de llamAmpere 0.7 o superior con los presets `--preset 12dense` o `--preset 8dense`. No se documenta compatibilidad con vLLM, Ollama, TGI ni llama.cpp estandar; de hecho, la atencion LSA y el offload de KV son especificos de llamAmpere.
- Latencia y throughput: no disponibles. La unica cifra relacionada es la reduccion del 33% en tokens generados por respuesta en LiveCodeBench v6, que afecta al coste pero no es una medida de velocidad.
- Dependencia bloqueante: llamAmpere 0.7 no estaba publicada en el momento de redactar la ficha, segun la propia model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATX Swift 1.5 Qwen3.8-27B 3.0bpw | 27B (nominal) | 262.144 | GGUF, 11,24 GB | Apache 2.0 | Requiere llamAmpere 0.7 (no publicado) |
| Unsloth UD-Q2_K_XL (receta sobre Swift 1.5) | 27B (nominal) | No corre contexto completo con MTP en 12 GB (estimacion del autor) | GGUF, 9,95 GB | Apache 2.0 (heredada) | Runtime estandar |
| Unsloth UD-IQ3_XXS (receta sobre Swift 1.5) | 27B (nominal) | no disponible | GGUF, 10,93 GB | Apache 2.0 (heredada) | Runtime estandar |
| Qwen/Qwen3.8-27B BF16 | 27B | no disponible | safetensors | Apache 2.0 | Requiere hardware de gama alta |

La comparativa se limita a las alternativas incluidas en la model card. No se dispone de datos sobre otros modelos de 27B de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un runtime no publicado: los archivos requieren llamAmpere 0.7, que el autor indica que aun no ha salido; sin esa version no se pueden ejecutar con los presets documentados.
- Cuantizacion extrema: 3.0 bpw y 2,1 bpw implican perdida de calidad medible (KLD 0,0270 y 0,0593 respectivamente); no es equivalente al BF16 para tareas sensibles a la precision.
- Benchmarks debiles: la puntuacion de LiveCodeBench procede de una sola semilla y el autor la califica de no significativa estadisticamente.
- Etiqueta "uncensored": implica menor alineacion y mayor probabilidad de generar contenido inapropiado o danino; no hay documentacion del metodo de eliminacion de rechazos ni de los riesgos asociados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en un modelo comprimido a 3 bits y sin datos de evaluacion de factualidad.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Tool calling y capacidades multimodales: no confirmadas en la informacion proporcionada.
- Datos inconsistentes en el repo: el campo de parametros totales en safetensors (2.097.152) no cuadra con un modelo de 27B, lo que sugiere un error de metadatos o un repo incompleto.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de las cifras del autor.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento "uncensored" y sobre la calidad de la cuantizacion recae en el desplegador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-3.0bpw-MTP-GGUF
- Variante de 2,3 bpw para 10 GB: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio de llamAmpere: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
