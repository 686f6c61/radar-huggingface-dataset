# Genrius-AI/Qwen3.5-2B-Pingala8-2bit

## Resumen

Qwen3.5-2B-Pingala8-2bit es una cuantizacion de 2 bits del modelo Qwen/Qwen3.5-2B publicada por Genrius-AI (Harshit Goyal). No es un modelo entrenado desde cero: es un fichero GGUF de 0,78 GB que comprime el modelo base de Qwen manteniendo la estructura hibrida de este (18 capas Gated DeltaNet y 6 capas de atencion completa con gating). El objetivo declarado es conseguir un binario de clase 2 bits con la misma huella en disco que el IQ2_XXS de llama.cpp, pero con una perplejidad mucho menor: 15,62 frente a 29,08 en WikiText-2.

La relevancia tecnica esta en el metodo de compresion, no en el modelo base. El autor aplica codificacion trellis con particion de conjuntos de 8 estados (Ungerboeck) sobre simbolos de 4 pesos, precedida de una rotacion de Hadamard aleatoria y del redondeo LDLQ de QuIP, con una clase de tasa por tensor y escalas de columna derivadas de la cota de incoherencia. Es la receta B4 del release anterior de Qwen3-4B, sin cambios, aplicada aqui a 150 tensores lineales.

El precio de este enfoque es operativo: el fichero no se puede cargar con llama.cpp estandar, Ollama ni LM Studio. Requiere el runtime Pingala-8 v2.5 (llama.cpp en el commit `7ac59a6` mas un parche CUDA y un cambio de una linea en el loader), distribuido como build de un clic para Windows y Linux sobre GPU NVIDIA RTX 30/40/50. Ademas, es solo el modelo de texto: la torre de vision y el bloque de prediccion multi-token (MTP) de Qwen3.5-2B no estan incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas Gated DeltaNet (SSM) + 6 capas de atencion completa con gating (24 capas en total) |
| Parametros totales | 925.157.879 (recuento de safetensors del repo; el nombre comercial indica "2B", no disponible la explicacion de la diferencia) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la medicion de perplejidad se hizo con contexto de 4096 tokens) |
| Tipos de cuantizacion | Pingala-8 2-bit (trellis de 8 estados); tensores `ssm_alpha` y `ssm_beta` en Q4_0; resto de tensores no lineales copiados del IQ2_XXS de stock |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico de 0,78 GB) |
| Tensores codificados | 150 tensores lineales (attn_qkv, attn_gate, ssm_out, attn_q/k/v/output y las tres matrices FFN) |
| Tamano del repo | 0,8 GB |
| Calibracion (imatrix) | Hessianos por capa calculados con 256 secuencias de 2048 tokens de C4 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura hibrida: 18 de sus 24 capas son Gated DeltaNet, un mecanismo de espacio de estados con compuerta, y las 6 restantes son capas de atencion completa con gating. Esta mezcla reduce el coste de la atencion en contextos largos manteniendo capacidad asociativa. La cuantizacion actua sobre las matrices lineales de ambos tipos de capa, no sobre las norms, el conv1d ni los parametros de compuerta del DeltaNet.

No hay entrenamiento nuevo por parte de Genrius-AI: el proceso es puramente de compresion post-entrenamiento. Cada matriz lineal se representa con un codigo trellis de 8 estados con particion de conjuntos sobre grupos de 4 pesos, previa rotacion de Hadamard aleatoria (para hacer las matrices mas incoherentes) y redondeo LDLQ estilo QuIP. Cada tensor recibe una clase de tasa propia y escalas de columna calculadas con la cota de incoherencia. Dos tensores de compuerta del DeltaNet (`ssm_alpha`, `ssm_beta`) tienen solo 16 filas, y el formato exige multiplos de 32, por lo que se guardan en Q4_0 pagando ese coste del presupuesto de bytes del fichero. El resto de tensores no lineales se heredan del fichero IQ2_XXS estandar para no degradar la linea base.

Como innovacion destacable esta el propio codec y su comparacion "a igualdad de bytes" con IQ2_XXS e IQ2_KT, documentada en el preprint del autor. El autor declara explicitamente que el build es unico y que la receta y la regla de publicacion se fijaron antes de medir ningun resultado a 2 bits, lo que reduce el riesgo de sobreajuste de la receta a las metricas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en ingles y chino, heredadas del modelo base Qwen3.5-2B.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con la degradacion esperable de una cuantizacion de 2 bits (MMLU 31,24% medido por el autor).
- Inferencia local en GPU de consumo: el fichero completo ocupa 0,78 GB, lo que permite ejecutarlo en tarjetas con muy poca VRAM.
- Ejecucion en hardware NVIDIA RTX 30/40/50 mediante el runtime propietario Pingala-8 v2.5 con parche CUDA.
- Capacidades multimodales: no disponibles. La torre de vision del modelo base no esta incluida en el fichero.
- Prediccion multi-token (MTP): no disponible. El bloque MTP del modelo base no esta incluido.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el nivel de MMLU y ARC-Challenge medido hace poco recomendable este uso.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con compresion extrema en local: usar el fichero como banco de pruebas para comparar tecnicas de cuantizacion de 2 bits frente a IQ2_XXS e IQ2_KT con la misma huella de disco. Es el caso de uso mas solido, dado que el propio repo esta orientado a la evaluacion del metodo.
- Docencia y divulgacion sobre cuantizacion: el par de ficheros (Pingala-8 15,62 PPL frente a IQ2_XXS 29,08 PPL, con 11,5 MB menos) sirve para ilustrar el impacto de la rotacion de Hadamard y el redondeo LDLQ en una demo reproducible en un portatil con GPU.
- Prototipado rapido de interfaces conversacionales en ingles o chino: el arranque de un clic permite tener un chat funcional en minutos dentro de un entorno controlado de desarrollo, antes de invertir en un modelo mayor.
- Generacion de texto auxiliar de bajo coste en pipelines locales: borradores, resumenes cortos o etiquetado de texto en ingles/chino donde el coste energetico y la VRAM son la restriccion principal y la precision no es critica.
- Filtrado y clasificacion de texto en el borde (on-device): con 0,78 GB de pesos, entra en escenarios de escritorio o estaciones de trabajo con GPU de gama media donde no se puede desplegar un modelo de 7B o superior.
- Pruebas de regresion de runtimes: util para validar el loader del runtime Pingala-8 v2.5, ya que el recuento de tensores codificados por capa (6 en las capas DeltaNet) es justo el punto que rompe llama.cpp estandar y que el parche `q35_loader_count_delta.patch` corrige.
- Investigacion sobre degradacion en tareas de razonamiento: comparar los 31,24 de MMLU y los 34,78 de ARC-Challenge de este fichero contra el modelo sin cuantizar permite medir el coste real del 2 bits en capacidad cognitiva, no solo en perplejidad.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (`verified: false`), medidos con `llama-perplexity` a 0-shot salvo donde se indique:

| Dataset | Metrica | Valor |
|---|---|---|
| WikiText-2 (test, contexto 4096) | Perplejidad (menor es mejor) | 15,6193 |
| HellaSwag (0-shot) | Accuracy | 50,00% |
| WinoGrande (0-shot) | Accuracy | 60,14% |
| ARC-Easy (0-shot) | Accuracy | 53,68% |
| ARC-Challenge (0-shot) | Accuracy | 34,78% |
| MMLU (0-shot) | Accuracy | 31,24% |

Comparacion de perplejidad en WikiText-2 publicada por el autor frente a otras cuantizaciones del mismo modelo base:

| Fichero | Bits | Tamano | PPL WikiText-2 |
|---|---|---|---|
| Qwen3.5-2B-Pingala8-2bit | 2 | 0,78 GB | 15,62 |
| IQ2_XXS (llama.cpp, misma imatrix) | 2 | 0,79 GB | 29,08 |
| IQ2_KT (ik_llama.cpp, receta por defecto) | 2 | 0,71 GB | 17,90 |
| Q8_0 (llama.cpp) | 8 | 2,0 GB | 11,13 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni de benchmarks de codigo o matematicas, ni comparaciones con el modelo base sin cuantizar en estas mismas tareas.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 0,8 GB, el tamano del fichero GGUF. A ello hay que sumar la cache KV del contexto, cuyo tamano no se detalla en la informacion disponible.
- GPU objetivo declaradas por el autor: NVIDIA RTX de las series 30, 40 y 50 (el runtime incluye un parche CUDA especifico). No se mencionan requisitos para GPUs AMD, Intel, Apple Silicon ni CPU.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM, incluidos portatiles con GPU de gama de entrada. La limitacion practica no es la VRAM sino la compatibilidad del runtime.
- Opciones de despliegue: exclusivamente el runtime Pingala-8 v2.5 (Windows y Linux) publicado en el repositorio de GitHub del autor. llama.cpp estandar, Ollama, LM Studio, vLLM y TGI no pueden cargar el fichero segun la model card; llama.cpp estandar falla porque su loader espera 7 tensores lineales codificados por capa y las capas DeltaNet de los modelos Qwen3.5 pequenos tienen 6.
- Latencia y throughput: no disponible. No se publican tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-Pingala8-2bit | 925.157.879 (recuento safetensors) | no disponible (eval. a 4096) | 15,62 | GGUF + runtime Pingala-8 v2.5 | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.5-2B en IQ2_XXS (llama.cpp) | mismo modelo base | no disponible | 29,08 | GGUF + llama.cpp estandar | Apache-2.0 | ampliamente disponible |
| Qwen3.5-2B en IQ2_KT (ik_llama.cpp) | mismo modelo base | no disponible | 17,90 | GGUF + ik_llama.cpp | Apache-2.0 | disponible |
| Qwen3.5-2B en Q8_0 (llama.cpp) | mismo modelo base | no disponible | 11,13 | GGUF + llama.cpp estandar | Apache-2.0 | ampliamente disponible |
| Qwen3.5-4B-Pingala8-2bit (hermano mayor) | no disponible | no disponible | no disponible en esta ficha | GGUF + runtime Pingala-8 | Apache-2.0 | HuggingFace |

La comparacion relevante es interna al mismo modelo base: frente a IQ2_XXS el autor reporta una reduccion de perplejidad de 29,08 a 15,62 con 11,5 MB menos de fichero, y frente a IQ2_KT mejora 17,90 a 15,62 a costa de 70 MB mas. Frente a Q8_0 sigue habiendo una brecha de 4,5 puntos de perplejidad. No se dispone de comparaciones con otros modelos de ~1-2B de la competencia en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible frente al modelo sin cuantizar: la perplejidad sube de 11,13 (Q8_0) a 15,62, y el MMLU medido se queda en 31,24%, muy por debajo de lo esperable en un modelo de su clase sin comprimir.
- Razonamiento limitado: ARC-Challenge al 34,78% y HellaSwag al 50,00% indican poca fiabilidad en tareas que requieren inferencia de varios pasos. No es adecuado para decisiones automatizadas con consecuencias.
- Riesgo de alucinacion alto: a 2 bits y con este nivel de MMLU, la generacion de hechos concretos, cifras o citas debe verificarse siempre.
- Benchmark no verificado: los seis resultados de la model card estan marcados como `verified: false` y proceden de mediciones del propio autor, con los logs alojados en su repositorio. No hay replicacion independiente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Incompatibilidad de runtime: no funciona en llama.cpp estandar, Ollama ni LM Studio. Depende de un parche CUDA y de un cambio en el loader que el autor mantiene fuera del arbol principal de llama.cpp. Es un riesgo de mantenimiento y de reproducibilidad a medio plazo.
- Solo texto: sin torre de vision ni bloque MTP. Cualquier caso de uso multimodal del modelo base no esta cubierto.
- Idiomas limitados a ingles y chino. No hay datos de rendimiento en castellano ni en otras lenguas; se espera degradacion adicional por transferencia.
- Ambito de plataforma reducido: el build de un clic solo cubre Windows y Linux sobre NVIDIA RTX 30/40/50. No hay soporte documentado para CPU, Apple Silicon ni ROCm.
- Licencia: Apache-2.0 heredada del modelo base, permisiva para uso comercial. Conviene verificar igualmente las condiciones del modelo Qwen original y del codigo del runtime, que se distribuye aparte en GitHub.
- Discrepancia de parametros: el recuento de safetensors (925.157.879) no cuadra con el "2B" del nombre. No se explica en la informacion disponible, por lo que conviene no asumir el tamano del base sin comprobarlo.
- La busqueda web realizada no devolvio ningun resultado utilizable sobre este modelo; toda la informacion de esta ficha procede de HuggingFace y del repositorio del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Genrius-AI/Qwen3.5-2B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo hermano mayor (Qwen3.5-4B Pingala-8): https://huggingface.co/Genrius-AI/Qwen3.5-4B-Pingala8-2bit
- Codigo, runtime y parches: https://github.com/Genrius-AI/pingala8-llm
- Build de un clic (runtime v2.5): https://github.com/Genrius-AI/pingala8-llm/releases/latest
- Paper del metodo (preprint v2.4): *Small-State Coset Trellis Coding at IQ2_XXS Size: An Equal-Bytes Study in llama.cpp*, DOI https://doi.org/10.5281/zenodo.23481757
- Contacto del autor: harshit@genrius.in
