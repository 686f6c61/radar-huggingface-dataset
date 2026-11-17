# jakeatx/ATX-Swift-Qwen3.8-27B-12GB-GGUF

## Resumen

ATX-Swift-Qwen3.8-27B-12GB-GGUF es una cuantizacion GGUF agresiva del modelo Qwen/Qwen3.8-27B (27.320.697.856 parametros), publicada por el usuario jakeatx bajo licencia Apache 2.0. El objetivo declarado es hacer que un modelo denso de 27B quepa en una GPU de 12 GB manteniendo la ventana de contexto completa de 262.144 tokens y la decodificacion especulativa MTP (multi-token prediction) activada. Para lograrlo, el autor aplica una tecnica propia de compresion denominada llamAmpere, con un fichero principal de 11,24 GB mas un sidecar de indices LSA (`lsa-qwen38-27b-d2048.gguf`) que debe acompanar al modelo.

La propuesta es relevante porque el problema de encajar modelos densos de ~27B en tarjetas consumer de 12 GB (RTX 3060, 4070, 5070) suele resolverse degradando mucho la cuantizacion o recortando contexto. El autor publica metricas de divergencia (KLD 0.0270 frente a BF16) y una comparacion directa con las recetas UD de Unsloth, que situa su fichero de 12 GB con un 54% menos de deriva que UD-Q2_K_XL y con respuestas un 33% mas cortas en LiveCodeBench v6.

La advertencia principal es que la inferencia de los ficheros de tarjeta pequena requiere llamAmpere 0.7, una version que segun la model card aun no ha sido publicada, por lo que el modelo no es ejecutable en el momento de redactar esta ficha con el tooling publico disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B); cuantizacion GGUF con atencion LSA y decodificacion especulativa MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (fichero de 12 GB, MTP activado) |
| Tipos de cuantizacion | GGUF propietario de llamAmpere (~8,3 bits efectivos por parametro en el fichero de 11,24 GB); variantes de 8 GB y 10 GB (2,3 bpw) en repos hermanos |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (+ sidecar de indices LSA en GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27.320.697.856 parametros. Sobre el no se ha reentrenado nada: la publicacion de jakeatx es exclusivamente una compresion y un empaquetado para inferencia. La innovacion tecnica reside en el pipeline de cuantizacion llamAmpere, que combina atencion LSA (un esquema de atencion con indices precalculados almacenados en el sidecar `lsa-qwen38-27b-d2048.gguf`) con KV cache offload a host, lo que permite mantener 262.144 tokens de contexto con MTP activo dentro de 11.544 MiB de VRAM pico medida en una tarjeta de 12 GB.

El autor no documenta el dataset de entrenamiento ni procesos de RLHF/DPO, ya que no ha habido entrenamiento adicional. Lo que si publica es la metodologia de evaluacion de la cuantizacion: 16.200 posiciones de test (codigo, agentico y RAG a ~12K de contexto) puntuadas contra el modelo base Swift 1.5 en BF16 como profesor comun, con KLD y Top-1 como metricas. Ademas de la cuantizacion de pesos, el paquete incorpora overlays de draft (`mtp-dm.gguf`, `head-ait2.gguf`) y una cabeza de rescoring exacta en FP16 (`head-exact-f16.gguf`) para el fichero de 8 GB.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto muy larga (262.144 tokens en el fichero de 12 GB).
- Razonamiento y generacion de codigo: el autor reporta un 89% de acierto en LiveCodeBench v6 con grader estricto (una sola semilla, resultado direccional).
- Decodificacion especulativa MTP (multi-token prediction) integrada, orientada a reducir latencia por token.
- Casos agenticos y RAG: la evaluacion de calidad incluye posiciones de tipo agentico y RAG a ~12K de contexto.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en estaciones de trabajo con GPU de 12 GB: el modelo permite autocompletado y generacion de funciones completas en local, con contexto suficiente para incluir varios ficheros del proyecto en la ventana y sin depender de API externa.
- Analisis de repositorios y RAG sobre documentacion extensa: los 262.144 tokens de contexto permiten inyectar manuales, issues y ficheros de codigo en una sola pasada, lo que encaja con el escenario RAG evaluado por el autor.
- Agentes de desarrollo multi-paso: la combinacion de tool calling (heredado del modelo base, segun los tags de compatibilidad) y MTP reduce la latencia en bucles de razonamiento largos donde se encadenan varias llamadas a herramientas.
- Despliegue en portatiles con RTX 4070/5070 (12 GB): el pico de VRAM medido de 11.544 MiB deja margen minimo pero funcional para servir el modelo en local con contexto completo, util para entornos sin conectividad o con requisitos de privacidad.
- Prototipado de pipelines agenticos antes de escalar a GPU de datacenter: permite validar prompts, herramientas y flujos con un modelo de 27B real en hardware consumer, reduciendo el coste de iteracion.
- Evaluacion comparativa de tecnicas de cuantizacion: el repo publica KLD, Top-1 y longitud de respuesta frente a recetas UD de Unsloth, por lo que sirve como referencia reproducible para investigadores que estudien el impacto de la compresion en modelos densos.
- Generacion de codigo en produccion con restricciones de memoria: para entornos donde una A100 no es viable, el fichero de 12 GB ofrece un equilibrio entre calidad (89% en LiveCodeBench v6) y huella de VRAM.

## Benchmarks y rendimiento

| Metrica | ATX 12 GB | Unsloth UD-IQ3_XXS | Unsloth UD-Q2_K_XL | ATX AI2 2,3 bpw (10 GB) | Mirai S | Qwen BF16 (publicado) |
|---|---|---|---|---|---|---|
| Tamano | 11,24 GB | 10,93 GB | 9,95 GB | 9,14 GB | no disponible | no disponible |
| KLD (menor mejor) | 0,0270 | 0,0396 | 0,0591 | 0,0593 | 0,0745 | 0 (referencia) |
| Top-1 | 95,98% | 95,33% | 94,00% | 94,06% | no disponible | no disponible |
| LiveCodeBench v6 (strict, 1 semilla) | 89% | no disponible | 87% | no disponible | no disponible | 90,3% |
| Tokens medianos por respuesta (LCB v6) | 4.608 | no disponible | 8.932 | no disponible | no disponible | no disponible |
| VRAM pico medida | 11.544 MiB | no disponible | no disponible | no disponible | no disponible | no disponible |

Datos adicionales aportados por el autor: el fichero de 12 GB presenta un 54% menos de deriva que UD-Q2_K_XL; el fichero de 2,3 bpw iguala a UD-Q2_K_XL en un tamano un 19% menor; en LiveCodeBench v6 el modelo genero respuestas mas cortas en 74 de 100 problemas, con un rango del 22% al 44% menos de tokens en el percentil 95. El resultado de codigo se basa en una sola semilla y el propio autor lo califica de direccional, no estadisticamente significativo.

## Requisitos de hardware

- VRAM estimada: 11.544 MiB de pico medido para el fichero de 12 GB con contexto completo y MTP activado.
- GPU validadas: tarjetas de 12 GB (la model card cita la categoria; no especifica modelos concretos). Arquitectura Ampere en adelante segun los tags (`ampere`).
- Cabe en GPU consumer de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 5070) y en las variantes de 8 GB y 10 GB publicadas en repos hermanos. No se documenta soporte en GPU de menos de 8 GB.
- Software de despliegue: exclusivamente `llama-server` de llamAmpere 0.7 (no publicada en el momento de redactar esta ficha), con presets `--preset 12dense` o `--preset 8dense`. No se menciona compatibilidad con vLLM, Ollama, TGI ni llama.cpp estandar.
- Ficheros auxiliares obligatorios en la misma carpeta: `lsa-qwen38-27b-d2048.gguf` (ambos tamanos); para 8 GB ademas `mtp-dm.gguf`, `head-ait2.gguf` y `head-exact-f16.gguf`.
- Latencia y throughput: no disponibles. El autor solo reporta la reduccion de tokens generados (33% menos en mediana), no tiempos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Calidad (KLD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ATX-Swift-Qwen3.8-27B-12GB | 27,3B denso | 262.144 | GGUF, 11,24 GB | 0,0270 | Apache 2.0 | Requiere llamAmpere 0.7 (no publicada) |
| Unsloth UD-Q2_K_XL (Qwen3.8-27B) | 27,3B denso | no disponible | GGUF, 9,95 GB | 0,0591 | Apache 2.0 (heredada) | Disponible; no ejecuta contexto completo con MTP en 12 GB (estimacion del autor) |
| Unsloth UD-IQ3_XXS (Qwen3.8-27B) | 27,3B denso | no disponible | GGUF, 10,93 GB | 0,0396 | Apache 2.0 (heredada) | Disponible |
| Qwen3.8-27B BF16 (original) | 27,3B denso | no disponible | safetensors | 0 (referencia) | Apache 2.0 | Disponible en Hugging Face |

La ventaja del fichero ATX es la relacion entre deriva y tamano (mejor KLD que UD-IQ3_XXS con solo 0,31 GB mas) y la capacidad de ejecutar el contexto completo con MTP en 12 GB. La desventaja es la dependencia de un runtime no publicado y de ficheros sidecar especificos, frente a la portabilidad de las recetas de Unsloth con llama.cpp estandar.

## Limitaciones y advertencias

- El runtime necesario (llamAmpere 0.7) no esta publicado segun la propia model card; los comandos de ejecucion no funcionaran hasta que se publique. Cualquier uso en produccion queda bloqueado hasta entonces.
- La cuantizacion es propietaria y no sigue el estandar de recetas UD de Unsloth; los ficheros no son intercambiables con llama.cpp, Ollama o vLLM convencionales.
- Dependencia de ficheros sidecar: omitir `lsa-qwen38-27b-d2048.gguf` o los overlays del modelo de 8 GB impide la inferencia correcta.
- El resultado de LiveCodeBench v6 (89%) proviene de una unica semilla y el autor lo califica explicitamente de direccional, no estadisticamente significativo.
- La ventana de VRAM es muy ajustada (11.544 MiB en una tarjeta de 12 GB); variaciones de driver, resolucion de pantalla o procesos concurrentes pueden provocar OOM.
- Sesgos y riesgo de alucinacion: no documentados por el autor; al ser una cuantizacion del modelo base, hereda los sesgos de Qwen3.8-27B, que no se detallan en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado ni sobre la estabilidad del runtime requerido.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las metricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-12GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo hermano de 10 GB (2,3 bpw): https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
