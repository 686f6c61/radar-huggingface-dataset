# jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.1bpw-MTP-GGUF

## Resumen

ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.1bpw-MTP-GGUF es una cuantizacion extrema en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario jakeatx bajo el paraguas del proyecto llamAmpere. El objetivo declarado es comprimir un modelo de clase 27B hasta aproximadamente 2,1 bits por peso para que quepa en GPUs consumer de 8 GB de VRAM manteniendo contexto largo y decodificacion especulativa MTP (multi-token prediction) activada.

La ficha tecnica del autor situa este fichero en 7.506 MiB de VRAM pico medida, con una ventana de contexto de 204.800 tokens y MTP habilitado. El repositorio incluye varios ficheros auxiliares (sidecars) que son imprescindibles: un mapa de indices LSA (attention con indices dispersos), overlays de draft para MTP y una cabeza de rescoring en f16, todos ellos necesarios para ejecutar el modelo con el preset `8dense`.

Es relevante ahora porque representa un extremo poco habitual: cuantizacion agresiva por debajo de 3 bpw combinada con tecnicas de atencion dispersa y decodificacion especulativa, algo que normalmente no se sostiene en calidad. El autor publica metricas de divergencia (KLD) frente al modelo en BF16 para justificar la receta, aunque la herramienta necesaria para ejecutarlo (llamAmpere 0.7) aun no estaba publicada en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con MTP y atencion LSA |
| Parametros totales | 1.271.398.400 (dato safetensors del repo base; el nombre comercial indica 27B, discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 204.800 tokens (fichero 2.1 bpw); 262.144 tokens en el fichero de 3.0 bpw |
| Tipos de cuantizacion | GGUF a ~2,1 bpw (este fichero); ~2,3 bpw y ~3,0 bpw en ficheros hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, con sidecars GGUF adicionales (LSA, MTP, cabezas de rescoring) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso de la familia Qwen3.5 segun los tags del repositorio. Sobre esa base, el autor aplica una receta de compresion propia de llamAmpere que combina cuantizacion por debajo de 3 bits por peso con atencion LSA (indices dispersos con dimension 2048, segun el nombre del sidecar `lsa-qwen38-27b-d2048.gguf`) y decodificacion especulativa MTP. El KV cache se offloadea a host, lo que permite sostener contextos de cientos de miles de tokens en tarjetas de 8 a 12 GB.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el modelo base. El autor justifica la calidad de la cuantizacion con una evaluacion de divergencia (KLD) frente al modelo Swift 1.5 en BF16 sobre 16.200 posiciones de coding, agentic y RAG con unos 12K tokens de contexto. El fichero de 12 GB (3.0 bpw) obtiene KLD 0.0270 y Top-1 95,98%, frente a KLD 0.0396 de la receta Unsloth UD-IQ3_XXS y 0.0591 de UD-Q2_K_XL. El fichero de 2,3 bpw iguala a UD-Q2_K_XL (KLD 0.0593) en un 19% menos de tamano. No se publican datos equivalentes de KLD para el fichero de 2,1 bpw objeto de esta ficha.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-27B.
- Generacion de codigo, evaluada por el autor con LiveCodeBench v6 (89% en el fichero de 12 GB con un unico seed).
- Decodificacion especulativa MTP activada, con overlays de draft y cabeza de rescoring exacta en f16.
- Atencion LSA con KV cache offloadeado a host, que permite contexto largo en VRAM reducida.
- Soporte de agentes y tareas multi-paso, segun la evaluacion del autor sobre posiciones agentic.
- Recuperacion aumentada (RAG) con contextos de unos 12K tokens en la evaluacion de calidad.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Modelo etiquetado como "uncensored": el autor no detalla el proceso de eliminacion de rechazos ni sus implicaciones.
- Capacidades multimodales, tool calling o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Desarrollo en equipos con GPU de 8 GB: el fichero de 2,1 bpw permite ejecutar un modelo de clase 27B en tarjetas como RTX 3060 Ti, RTX 4060 o RTX 3070, con 7.506 MiB de VRAM pico medida, algo inviable con cuantizaciones estandar de 4 bits.
- Asistentes de codigo con contexto largo: los 204.800 tokens de ventana permiten cargar repositorios completos o historiales extensos de conversacion sin truncar, util para revision de codigo y explicacion de bases de codigo grandes.
- RAG sobre documentacion extensa: el autor evalua el modelo sobre posiciones de RAG a 12K tokens; con 204K de contexto se pueden inyectar decenas de documentos en una sola llamada.
- Pipelines agenticos multi-paso: la combinacion de MTP y contexto largo reduce el coste por turno en tareas con muchas iteraciones, segun la metrica de tokens generados del autor (33% menos en LiveCodeBench v6 frente a UD-Q2_K_XL).
- Despliegue en estaciones de trabajo sin GPU de datacenter: el KV cache en host permite servir contexto largo en hardware consumer, adecuado para prototipos y entornos de investigacion.
- Evaluacion de tecnicas de compresion extrema: util para investigadores que quieran reproducir o comparar recetas de cuantizacion sub-3 bpw con atencion dispersa y decodificacion especulativa.
- Generacion de texto sin filtros en entornos controlados: la etiqueta "uncensored" puede interesar en investigacion sobre alineamiento, con las cautelas de la seccion de limitaciones.

## Benchmarks y rendimiento

Datos publicados por el autor. La puntuacion de codigo usa un unico seed y el propio autor la califica de direccional, no estadisticamente significativa.

| Metrica | ATX 12 GB (3.0 bpw) | ATX AI2 2.3 bpw | Unsloth UD-Q2_K_XL | Qwen BF16 |
|---|---|---|---|---|
| KLD (menor es mejor) | 0.0270 | 0.0593 | 0.0591 | referencia |
| Top-1 | 95,98% | 94,06% | 94,00% | referencia |
| LiveCodeBench v6 (strict) | 89% | no disponible | 87% | 90,3% |
| Tokens medianos por respuesta (LCB v6) | 4.608 | no disponible | 8.932 | no disponible |

No se han publicado resultados de KLD ni de LiveCodeBench para el fichero de 2,1 bpw de 8 GB en la informacion disponible.

## Requisitos de hardware

- VRAM pico medida para el fichero de 2,1 bpw: 7.506 MiB, con contexto de 204.800 tokens y MTP activado.
- VRAM pico medida para el fichero de 3,0 bpw: 11.544 MiB, con contexto de 262.144 tokens.
- GPUs objetivo: tarjetas consumer de 8, 10 y 12 GB (el autor menciona arquitectura Ampere; no detalla modelos concretos).
- Cabe en GPU consumer: si, en el rango de 8 a 12 GB, siempre que se use llamAmpere 0.7 o superior.
- Motor de inferencia: llamAmpere 0.7, marcado como "coming, not yet released" en la model card. No se garantiza compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Presets de ejecucion: `--preset 8dense` para el fichero de 8 GB y `--preset 12dense` para el de 12 GB.
- Ficheros auxiliares obligatorios en la misma carpeta: `lsa-qwen38-27b-d2048.gguf`, `mtp-dm.gguf`, `head-ait2.gguf` y `head-exact-f16.gguf`.
- Latencia y throughput: no disponibles. El autor solo reporta reduccion de tokens generados (33% menos en mediana en LiveCodeBench v6 frente a UD-Q2_K_XL).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATX-Swift 2.1 bpw (este) | clase 27B | 204.800 | no disponible | Apache 2.0 | GGUF + llamAmpere 0.7 (no publicado) |
| ATX-Swift 3.0 bpw | clase 27B | 262.144 | 0.0270 | Apache 2.0 | GGUF + llamAmpere 0.7 (no publicado) |
| ATX AI2 2.3 bpw | clase 27B | 212.992 | 0.0593 | Apache 2.0 | GGUF, repo separado |
| Unsloth UD-Q2_K_XL | clase 27B | no disponible | 0.0591 | Apache 2.0 | GGUF estandar |
| Unsloth UD-IQ3_XXS | clase 27B | no disponible | 0.0396 | Apache 2.0 | GGUF estandar |
| Qwen3.8-27B BF16 | clase 27B | no disponible | referencia | Apache 2.0 | safetensors |

La ventaja declarada del fichero de 12 GB es un 54% menos de deriva que UD-Q2_K_XL; el de 2,3 bpw iguala a UD-Q2_K_XL con un 19% menos de tamano. La contrapartida es la dependencia de un runtime no publicado.

## Limitaciones y advertencias

- El runtime necesario (llamAmpere 0.7) no estaba publicado en el momento de redactar esta ficha; los comandos de la model card no funcionan con versiones anteriores.
- El modelo requiere cuatro ficheros sidecar adicionales; un GGUF suelto no es suficiente para ejecutarlo.
- Discrepancia entre el nombre comercial (27B) y el recuento de parametros del repo base en safetensors (1.271.398.400); conviene verificar antes de dimensionar hardware.
- La etiqueta "uncensored" implica que el modelo puede generar contenido sin los filtros habituales del base; el autor no documenta el proceso ni los riesgos.
- Riesgo de alucinacion inherente a un modelo comprimido a ~2,1 bpw; la model card no publica KLD para este fichero concreto.
- La evaluacion de codigo se basa en un unico seed y el propio autor la califica de no significativa estadisticamente.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue equivalente al del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un runtime propietario o no publicado puede condicionar el despliegue en produccion.
- Cero descargas y cero likes en el momento de la consulta; ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.1bpw-MTP-GGUF
- Repo hermano de 2,3 bpw: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio de llamAmpere y demos: no disponibles en la informacion proporcionada.
