# jakeatx/ATX-Swift-Qwen3.8-27B-12GB-GGUF

## Resumen

ATX-Swift-Qwen3.8-27B-12GB-GGUF es una cuantizacion GGUF del modelo Qwen3.8-27B, publicada por el usuario jakeatx bajo el paraguas del proyecto llamAmpere. Su objetivo no es solo reducir el tamano del modelo, sino permitir que un modelo de 27.000 millones de parametros funcione con su contexto completo de 262.144 tokens y decodificacion especulativa MTP activada dentro de una GPU de 12 GB, algo que segun el autor no es viable con las recetas de cuantizacion convencionales.

La publicacion emplea una receta propia de aproximadamente 3,0 bits por peso (denominada ATX AI3) y se apoya en un sidecar de indices LSA (atención con mapa de indices) y en KV cache descargada a host, funcionalidades que requieren llamAmpere 0.7, una version aun no publicada en el momento de redactar esta ficha. El autor reporta una divergencia KL de 0,0270 frente al modelo base en BF16 y un Top-1 del 95,98%, cifras que situa por delante de las recetas UD de Unsloth.

El modelo base es Qwen/Qwen3.8-27B, del que no se detallan en la informacion disponible ni la composicion del dataset de entrenamiento ni el pipeline de alineamiento. La ficha se limita, por tanto, a describir lo que el autor documenta sobre la cuantizacion y a marcar como no disponibles los datos del modelo original que no aparecen en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); cuantizacion con LSA attention y MTP speculative decoding |
| Parametros totales | 27B (modelo base); 2.097.152 parametros reportados en safetensors del repo |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (fichero de 12 GB) |
| Tipos de cuantizacion | GGUF ATX AI3 (~3,0 bits por peso); variante AI2 a 2,3 bpw en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal mas sidecar `lsa-qwen38-27b-d2048.gguf`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3.8-27B original, no un modelo entrenado desde cero. La model card no describe la arquitectura interna del base (numero de capas, dimension oculta, atencion GQA, etc.), por lo que esos datos deben consultarse en la ficha de Qwen/Qwen3.8-27B. Lo relevante tecnicamente aqui es la capa de compresion: llamAmpere aplica una receta de cuantizacion por tensor con imatrix sobre el modelo Swift 1.5 en BF16, que actua como profesor comun para todas las variantes comparadas.

La innovacion principal es la combinacion de LSA (atencion con mapa de indices, suministrada como sidecar `lsa-qwen38-27b-d2048.gguf`) con KV cache descargada a host y decodificacion especulativa MTP. Segun el autor, esto permite ejecutar los 262K tokens de contexto con MTP activo en una GPU de 12 GB, algo que estima imposible con la receta UD-Q2_K_XL de Unsloth usando atencion estandar. No se documentan en la informacion disponible datos sobre tokens de entrenamiento, composicion del dataset ni si el modelo base paso por RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generacion de codigo: el autor reporta resultados en LiveCodeBench v6 (89% con grader estricto en una sola semilla).
- Razonamiento agéntico y RAG: el conjunto de evaluacion KLD incluye posiciones de coding, agentic y RAG a ~12K de contexto.
- Decodificacion especulativa MTP (multi-token prediction) activada en los ficheros de 12 y 10 GB.
- Contexto largo: 262.144 tokens en el fichero de 12 GB.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.
- El autor etiqueta el modelo como "Uncensored", lo que implica un ajuste orientado a reducir rechazos, sin detallar el metodo.

## Casos de uso

- Analisis de repositorios completos: con 262K tokens de contexto, el modelo puede ingerir varios ficheros de codigo y documentacion en una sola pasada para tareas de revision o refactorizacion, aprovechando el contexto completo en una GPU de 12 GB.
- Asistentes de codigo en estaciones de trabajo modestas: un desarrollador con una RTX 3060 de 12 GB o similar puede ejecutar un modelo de 27B con MTP y contexto largo de forma local, sin depender de APIs externas.
- Pipelines de RAG con contexto extenso: el conjunto de evaluacion del autor incluye posiciones de RAG a ~12K, lo que sugiere uso en recuperacion aumentada donde se inyectan muchos fragmentos en el prompt.
- Agentes multi-paso: la decodificacion especulativa MTP reduce el coste por token generado, lo que abarata bucles de razonamiento agéntico con muchas llamadas encadenadas.
- Evaluacion comparativa de cuantizaciones: util como referencia para investigadores que quieran reproducir las metricas KLD y Top-1 del autor frente a recetas UD de Unsloth.
- Generacion de codigo con respuestas mas concisas: el autor reporta un 33% menos de tokens en LiveCodeBench v6 respecto a UD-Q2_K_XL, lo que reduce coste y latencia en produccion cuando se prioriza brevedad.
- Experimentacion con atencion LSA: sirve como banco de pruebas para la funcionalidad LSA de llamAmpere 0.7 en entornos con VRAM limitada.

## Benchmarks y rendimiento

| Metrica | ATX 12 GB | Unsloth UD-IQ3_XXS | Unsloth UD-Q2_K_XL | ATX AI2 (10 GB) | Mirai S |
|---|---:|---:|---:|---:|---:|
| Tamano | 11,24 GB | 10,93 GB | 9,95 GB | 9,14 GB | no disponible |
| KLD (menor es mejor) | 0,0270 | 0,0396 | 0,0591 | 0,0593 | 0,0745 |
| Top-1 | 95,98% | 95,33% | 94,00% | 94,06% | no disponible |

| Metrica adicional | Valor |
|---|---|
| LiveCodeBench v6, ATX 12 GB (grader estricto, una semilla) | 89% |
| LiveCodeBench v6, UD-Q2_K_XL (llamAmpere, una semilla) | 87% |
| LiveCodeBench v6, Qwen BF16 publicado | 90,3% |
| Tokens medianos por respuesta, ATX 12 GB | 4.608 |
| Tokens medianos por respuesta, UD-Q2_K_XL | 8.932 |
| Reduccion de tokens | 33% (rango 95%: 22–44% menos; mas corto en 74 de 100 problemas) |
| VRAM pico medida, 12 GB | 11.544 MiB |

El autor advierte que la comparativa de LiveCodeBench se basa en una sola semilla y es direccional, no estadisticamente significativa. Las metricas KLD y Top-1 se calculan sobre 16.200 posiciones (coding, agentic y RAG a ~12K de contexto) frente al modelo Swift 1.5 en BF16.

## Requisitos de hardware

- VRAM: 11.544 MiB de pico medidos para el fichero de 12 GB con contexto de 262.144 y MTP activado.
- GPU recomendadas: tarjetas Ampere de 12 GB (el autor cita la familia Ampere y el proyecto se llama llamAmpere). No se detallan modelos concretos como RTX 3060, 3080 Ti o A10.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB; existe una variante de 10 GB (AI2, 2,3 bpw) con contexto de 212.992 tokens y una de 8 GB retirada temporalmente por problemas de calidad.
- Software: requiere llamAmpere 0.7, version aun no publicada segun la model card. Los comandos `--preset 12dense` funcionaran cuando se publique.
- Sidecars necesarios: `lsa-qwen38-27b-d2048.gguf` para ambos tamanos; para 8 GB ademas `mtp-dm.gguf`, `head-ait2.gguf` y `head-exact-f16.gguf`.
- Latencia y throughput: no disponibles. El autor solo reporta reduccion de tokens generados, no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD | Top-1 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| ATX AI3 12 GB (este) | 27B | 262.144 | 0,0270 | 95,98% | Apache 2.0 | GGUF, requiere llamAmpere 0.7 |
| Unsloth UD-IQ3_XXS | 27B | no disponible | 0,0396 | 95,33% | Apache 2.0 (heredada) | GGUF estandar |
| Unsloth UD-Q2_K_XL | 27B | no disponible | 0,0591 | 94,00% | Apache 2.0 (heredada) | GGUF estandar |
| ATX AI2 10 GB | 27B | 212.992 | 0,0593 | 94,06% | Apache 2.0 | GGUF, requiere llamAmpere 0.7 |
| Mirai S | no disponible | no disponible | 0,0745 | no disponible | no disponible | no disponible |

La ventaja declarada del fichero de 12 GB es un 54% menos de deriva (KLD) que UD-Q2_K_XL y la capacidad de ejecutar el contexto completo con MTP en 12 GB, algo que el autor estima inviable para UD-Q2_K_XL con atencion estandar.

## Limitaciones y advertencias

- Requiere llamAmpere 0.7, no publicada: los comandos de ejecucion no funcionan con llama.cpp estandar ni con Ollama en el momento de la publicacion.
- El fichero de 8 GB fue retirado temporalmente por problemas de palabras raras y bucles detectados en pruebas en vivo.
- La comparativa de LiveCodeBench se basa en una sola semilla y el propio autor la califica de direccional, no estadisticamente significativa.
- El modelo esta etiquetado como "Uncensored", lo que puede aumentar el riesgo de generar contenido inapropiado o no alineado con politicas de uso en produccion.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones especificas publicadas para esta cuantizacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B por si impone condiciones adicionales.
- El rendimiento en tareas fuera de coding, agentic y RAG no esta evaluado en la model card.
- Dependencia de sidecars: hay que mantener todos los ficheros en la misma carpeta; una gestion incorrecta rompe la ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-12GB-GGUF
- Variante de 10 GB (AI2): https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio de llamAmpere: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
