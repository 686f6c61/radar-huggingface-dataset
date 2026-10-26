# Genrius-AI/Qwen3.5-0.8B-Pingala8-2bit

## Resumen

Qwen3.5-0.8B-Pingala8-2bit es una cuantización de 2 bits del modelo Qwen/Qwen3.5-0.8B, publicada por Genrius-AI (Harshit Goyal). No es un modelo nuevo: es un fichero GGUF de 0,35 GB que comprime el modelo base híbrido de Qwen (18 capas Gated DeltaNet y 6 capas de atención completa con compuerta) mediante una receta propia de codificación trellis, denominada Pingala-8. El objetivo declarado es igualar el tamaño en bytes del IQ2_XXS de llama.cpp para el mismo modelo, pero con una perplejidad muy inferior: 25,9736 frente a 85,09 en WikiText-2 (test, contexto de 4096), en un fichero 5,5 MB más pequeño.

La relevancia del artefacto es doble. Por un lado, demuestra que a 2 bits se puede mantener una calidad utilizable si se sustituye la cuantización escalar por un código trellis de 8 estados con particionado de conjuntos (Ungerboeck) sobre símbolos de 4 pesos, precedido de una rotación de Hadamard aleatoria y del redondeo LDLQ de QuIP. Por otro, expone una limitación práctica importante: el fichero no carga en llama.cpp estándar, Ollama ni LM Studio, y requiere un fork del runtime con un parche CUDA y un cambio en el cargador.

El modelo es solo de texto: la torre de visión y el bloque de predicción multi-token (MTP) de Qwen3.5-0.8B no están incluidos. La licencia es Apache-2.0, heredada del modelo base, y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas Gated DeltaNet (atención lineal/SSM) + 6 capas de atención completa con compuerta, sobre el modelo base Qwen3.5-0.8B |
| Parametros totales | 413.842.944 (dato real de safetensors del modelo base); el nombre comercial indica "0.8B" |
| Longitud de contexto | No disponible (la evaluación de WikiText-2 se hizo con contexto de 4096 tokens) |
| Tipos de cuantizacion | Pingala-8 2-bit (trellis de 8 estados, símbolos de 4 pesos, rotación de Hadamard + redondeo LDLQ, una clase de tasa por tensor); Q4_0 para `ssm_alpha` y `ssm_beta`; tensores restantes copiados del fichero IQ2_XXS |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), 0,35 GB; repositorio de 0,3 GB |

Otros datos del artefacto: 150 tensores lineales cuantizados con el formato trellis (`attn_qkv`, `attn_gate`, `ssm_out` en capas DeltaNet; `attn_q`, `attn_k`, `attn_v`, `attn_output` en capas de atención; las tres matrices FFN en todas las capas). Las Hessianas por capa se calcularon con 256 secuencias de 2048 tokens de texto C4. El tensor de embeddings y la salida atada, las normas, las convoluciones 1D y los parámetros de compuerta DeltaNet se copian del IQ2_XXS original. `ssm_alpha` y `ssm_beta` tienen solo 16 filas y el formato exige múltiplos de 32, por lo que se almacenan en Q4_0 a costa del presupuesto de bytes del propio fichero.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer híbrido: 24 capas en total, de las cuales 18 son Gated DeltaNet (mecanismo de estado recurrente con compuerta, del family de atención lineal) y 6 son capas de atención completa con compuerta. Esta mezcla reduce el coste de atención en contextos largos manteniendo un número pequeño de capas con atención cuadrática clásica. El artefacto publicado no entrena nada: es un proceso de compresión post-entrenamiento.

La receta Pingala-8 (denominada B4, sin cambios respecto a la release de Qwen3-4B) aplica, por cada tensor lineal, una rotación de Hadamard aleatoria para incoherencia, redondeo LDLQ con Hessianas calculadas sobre C4, una asignación de clase de tasa por tensor y escalas de columna derivadas de la cota de incoherencia, y finalmente codificación trellis con particionado de conjuntos de 8 estados sobre símbolos de 4 pesos. El paper del método es un preprint (v2.4), *Small-State Coset Trellis Coding at IQ2_XXS Size: An Equal-Bytes Study in llama.cpp*, y el autor advierte que los números de Qwen3.5 de esta ficha son mediciones nuevas que no aparecen en el paper. El build es único, con la receta y la regla de publicación fijadas antes de obtener ningún resultado a 2 bits.

En el plano operativo, el fichero requiere un runtime específico: llama.cpp en el commit `7ac59a6` más un parche CUDA publicado y un cambio de una línea en el cargador (`patches/q35_loader_count_delta.patch`), porque el cargador espera 7 tensores lineales codificados por capa y las capas DeltaNet de los modelos Qwen3.5 pequeños tienen 6; el recuento debe igualar el campo `vr.n_linear` del fichero.

## Capacidades

- Generación de texto conversacional en inglés y chino, a partir de la pipeline `text-generation`.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con la calidad degradada esperable en 2 bits (MMLU 0-shot del 29,43 %).
- Comprensión lectora y sentido común elemental: HellaSwag 40,0 %, WinoGrande 55,8 %, ARC-Easy 48,77 %, ARC-Challenge 25,42 % (0-shot, todos declarados por el autor y no verificados).
- Generación de texto libre y completado, evaluada con perplejidad de 25,9736 en WikiText-2.
- Ejecución en CPU y en GPU de gama consumer con huella de memoria mínima (0,35 GB de pesos).
- No incluye capacidades multimodales: la torre de visión del modelo base no está en el fichero.
- No incluye el bloque de predicción multi-token (MTP), por lo que no se puede usar decodificación especulativa basada en MTP con este artefacto.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada (el modelo base Qwen3.5 podría tenerlo, pero este fichero no lo documenta y la degradación a 2 bits hace su fiabilidad dudosa).

## Casos de uso

- Inferencia en hardware muy restringido: con 0,35 GB de pesos, el modelo cabe en GPUs integradas, en CPU y en dispositivos tipo NVIDIA Jetson, lo que permite desplegar generación de texto donde un modelo de 1 GB o más no entra.
- Prototipado de pipelines de cuantización: sirve como caso de referencia para validar cargadores GGUF, comparar recetas (trellis frente a IQ2_XXS/IQ2_KT) y reproducir las mediciones de perplejidad con el runtime parcheado.
- Investigación en compresión de modelos: es un punto de datos sobre la relación entre bytes y perplejidad a 2 bits en arquitecturas híbridas con capas DeltaNet, donde el reparto de bits por tipo de tensor importa más que en un transformer denso homogéneo.
- Chat local de bajo consumo en inglés o chino: conversación multi-turno sencilla, sin requisitos de precisión factual, en entornos sin conectividad y con presupuesto de memoria de un dígito en GB.
- Generación de texto auxiliar y autocompletado en herramientas de escritura: frases cortas, reformulaciones y borradores donde el coste por token y la latencia de arranque importan más que la calidad punta.
- Clasificación y etiquetado ligero por prompting: tareas de pocas etiquetas sobre textos cortos, aceptando el ruido adicional que introduce la cuantización de 2 bits.
- Baseline de evaluación: punto de comparación obligado en estudios que midan la caída de MMLU/ARC al bajar de 8 bits a 2 bits en modelos por debajo de 1B de parámetros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false` en todos los casos). Fuente: Genrius AI, logs en el repositorio de código.

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| WikiText-2 | test, contexto 4096 | Perplejidad (menor es mejor) | 25,9736 |
| HellaSwag | 0-shot, `llama-perplexity` | Accuracy (%) | 40,0 |
| WinoGrande | 0-shot, `llama-perplexity` | Accuracy (%) | 55,8 |
| ARC-Easy | 0-shot, `llama-perplexity` | Accuracy (%) | 48,77 |
| ARC-Challenge | 0-shot, `llama-perplexity` | Accuracy (%) | 25,42 |
| MMLU | 0-shot, `llama-perplexity` | Accuracy (%) | 29,43 |

Comparación de perplejidad en WikiText-2 declarada por el autor para el mismo modelo base:

| Fichero | Cuantizacion | Tamano | PPL WikiText-2 |
|---|---|---|---|
| Qwen3.5-0.8B-Pingala8-2bit.gguf | Pingala-8, 2 bits | 0,35 GB | 25,97 |
| IQ2_XXS (llama.cpp, mismo imatrix) | 2 bits | 0,35 GB | 85,09 |
| IQ2_KT (ik_llama.cpp, receta por defecto) | 2 bits | 0,31 GB | 35,39 |
| Q8_0 (llama.cpp) | 8 bits | 0,80 GB | 15,67 |

## Requisitos de hardware

- VRAM estimada para los pesos: 0,35 GB (tamano exacto del fichero GGUF). El modelo completo en memoria, con overhead del runtime CUDA, se situa previsiblemente entre 0,6 y 1 GB; el autor no publica una cifra oficial de VRAM.
- Memoria para KV cache: no disponible (no se documenta la longitud de contexto ni la configuracion de cabezas del modelo base en esta ficha).
- GPU recomendadas por el autor: NVIDIA RTX de series 30, 40 y 50, que son las cubiertas por el parche CUDA publicado. El build one-click v2.5 soporta Windows y Linux.
- Cabe en cualquier GPU consumer actual e incluso en GPU integradas; tambien es viable en CPU pura, dado el tamano del fichero.
- Opciones de despliegue: exclusivamente el runtime Pingala-8 v2.5 (llama.cpp `7ac59a6` + parche CUDA + parche de cargador) distribuido en el repositorio del autor. llama.cpp estandar, Ollama y LM Studio no pueden cargar el fichero, y las versiones de Pingala-8 anteriores a la v2.5 tampoco.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Pingala8-2bit | 413,8 M (nominal 0.8B) | no disponible | 25,97 | Apache-2.0 | GGUF, requiere runtime Pingala-8 v2.5 |
| Qwen3.5-0.8B IQ2_XXS (llama.cpp) | 413,8 M | no disponible | 85,09 | Apache-2.0 | GGUF, llama.cpp estandar |
| Qwen3.5-0.8B IQ2_KT (ik_llama.cpp) | 413,8 M | no disponible | 35,39 | Apache-2.0 | GGUF, ik_llama.cpp |
| Qwen3.5-0.8B Q8_0 (llama.cpp) | 413,8 M | no disponible | 15,67 | Apache-2.0 | GGUF, llama.cpp estandar |

La comparación relevante es interna al mismo modelo base, porque la información disponible no incluye mediciones frente a otros modelos de tamano similar. El dato central es que Pingala-8 a 2 bits se queda a 10,3 puntos de perplejidad del Q8_0 (25,97 frente a 15,67), mientras que IQ2_XXS se queda a 69,4 puntos, con el mismo tamano de fichero. El precio es la dependencia de un runtime modificado.

## Limitaciones y advertencias

- Todas las metricas de la model card estan marcadas como `verified: false`: son mediciones del autor, con logs en su repositorio, no replicadas por terceros. El repositorio acumula 0 descargas y 0 likes en el momento de la ficha.
- La degradacion por cuantizacion es real y medible: MMLU 0-shot del 29,43 % esta proximo al azar en una prueba de cuatro opciones (25 %). ARC-Challenge al 25,42 % apunta en la misma direccion. No es un modelo para tareas que exijan precision.
- El fichero solo contiene el modelo de texto. No hay torre de vision ni bloque MTP, de modo que las capacidades multimodales y la decodificacion especulativa del modelo base quedan fuera.
- Dependencia fuerte del runtime: sin el fork v2.5 con los dos parches, el fichero no carga. Esto complica el despliegue en produccion, la integracion con servidores tipo vLLM/TGI y la actualizacion del stack.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano. El rendimiento en espanol no esta documentado y previsiblemente sera bajo.
- Discrepancia de nomenclatura: el nombre indica "0.8B" pero el recuento real de parametros en safetensors es de 413.842.944. Conviene no usar la cifra del nombre para estimar capacidades.
- Longitud de contexto no documentada; planificar el despliegue con contexto corto (la evaluacion usa 4096) y verificar el limite real antes de disenar conversaciones multi-turno largas.
- Riesgo alto de alucinacion y de errores factuales por el tamano del modelo y por los 2 bits; no usar como fuente de datos sin verificacion externa.
- Licencia Apache-2.0, que permite uso comercial y modificacion, pero solo cubre los pesos derivados del modelo base. La licencia del codigo del runtime y de los parches no se detalla en la informacion disponible y debe comprobarse en el repositorio antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Genrius-AI/Qwen3.5-0.8B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Hermano mayor (Qwen3.5-4B Pingala-8, 2 bits): https://huggingface.co/Genrius-AI/Qwen3.5-4B-Pingala8-2bit
- Codigo y parche del runtime: https://github.com/Genrius-AI/pingala8-llm
- Build one-click v2.5 (Windows/Linux): https://github.com/Genrius-AI/pingala8-llm/releases/latest
- Paper del metodo (preprint v2.4), DOI: https://doi.org/10.5281/zenodo.23481757
