# DuoNeural/Qwen3.5-9B-TAP-DPQ-v6-GGUF

## Resumen

DuoNeural/Qwen3.5-9B-TAP-DPQ-v6-GGUF es un conjunto de cuantizaciones GGUF experimentales del modelo base Qwen/Qwen3.5-9B (9.197.093.888 parametros), publicado por DuoNeural. El valor del repositorio no esta en el modelo base, sino en el metodo de cuantizacion aplicado: TAP-DPQ v6 (Thouless-Anderson-Palmer Driven-Dissipative Post-Training Quantization), un marco de post-training quantization que el autor describe como basado en fisica de no equilibrio, estabilidad de Lyapunov, cavidades de Onsager y "hurwitz pencil". El objetivo declarado es llevar la cuantizacion a regimenes extremos de 1 y 2 bits sin que el modelo colapse en degeneracion sintactica.

El repositorio incluye cinco niveles de cuantizacion (Q4_K_M a 4,50 bpw, IQ3_XXS a 3,06 bpw, IQ2_M a 2,70 bpw, IQ2_XXS a 2,06 bpw e IQ1_S a 1,56 bpw) con pesos calibrados mediante imatrix. El autor publica comparaciones directas contra los pesos originales en FP16 bajo el mismo arnes de evaluacion, afirmando paridad exacta en IQ3_XXS y "super-paridad" en Q4_K_M sobre MATH-500, ademas de incrementos de throughput de hasta 2,0x frente a BF16.

Es relevante ahora porque explora el limite practico de la compresion de pesos en un modelo de 9B, un regimen donde la cuantizacion estandar por redondeo suele destruir la capacidad de razonamiento. Conviene tratarlo como artefacto de investigacion: las cifras absolutas son bajas, el arnes de evaluacion tiene limitaciones reconocidas por el propio autor y no hay resultados de benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida "gated DeltaNet + multi-head self-attention" (segun las etiquetas del autor); arquitectura del modelo base Qwen/Qwen3.5-9B no detallada en la informacion disponible |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M (4,50 bpw), IQ3_XXS (3,06 bpw), IQ2_M (2,70 bpw), IQ2_XXS (2,06 bpw), IQ1_S (1,56 bpw); calibracion con imatrix |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Otros datos del repositorio: tamano del repo 19,7 GB, 725 descargas, 0 likes, pipeline text-generation, etiquetas adicionales "conversational", "endpoints_compatible" y "experimental". Fecha de creacion indicada: 2026-10-03.

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base Qwen/Qwen3.5-9B (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que documenta el autor es el proceso de cuantizacion posterior: TAP-DPQ v6, descrito como un marco de post-training quantization derivado de la teoria de Thouless-Anderson-Palmer para sistemas desordenados y de dinamica disipativa. Los mecanismos citados son correcciones de campo de cavidad de Onsager, criterios de estabilidad de Lyapunov, formulaciones de "hurwitz pencil" y una restriccion de gauge de espacio nulo simplectica expresada como delta W perteneciente a Null(R ⊗ R^T). El autor atribuye a esta restriccion la ausencia de deriva de alineacion (0% de resurgimiento de rechazos) en todas las cuantizaciones.

La unica etiqueta de arquitectura disponible es "gated deltanet + multi-head self-attention hybrid", que sugiere un diseno hibrido entre atencion lineal recurrente con compuertas y atencion estandar de multiples cabezas. No se aportan detalles sobre numero de capas, dimensiones ocultas, atencion (GQA/MQA), tokenizador ni posicionales. La calibracion de las cuantizaciones IQ emplea matrices de importancia (imatrix), y las evaluaciones se ejecutaron con kernels de llama.cpp optimizados para sm_89.

## Capacidades

- Generacion de texto conversacional en modo zero-shot directo (temperatura 0,0), sin modo de razonamiento extendido ni etiquetas de pensamiento.
- Razonamiento matematico parcial: 28,0% en MATH-500 con los pesos FP16 de referencia en el arnes del autor, con super-paridad declarada en Q4_K_M (34,0%).
- Generacion de codigo muy limitada: 2,0% en LiveCodeBench con la linea base FP16 y 0,0% en las cuantizaciones.
- Conocimiento cientifico: 2,0% en GPQA Diamond con Q4_K_M y 0,0% en el resto de cuantizaciones.
- AIME 2026: 0,0% en modo greedy para todas las variantes evaluadas.
- Tool calling: no verificado. El arnes utilizo delimitadores XML sinteticos en lugar de la plantilla de chat nativa de Qwen, por lo que la extraccion fallo al 0,0% en todas las variantes, incluida la linea base FP16. La capacidad real de function calling no se puede inferir de estos datos.
- Alineacion y seguridad: 100,0% de exito en XSTest en todos los niveles de cuantizacion, del 4,50 bpw al 1,56 bpw.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Despliegue en GPU de gama de consumo con VRAM escasa: la variante IQ1_S ocupa 2,68 GiB y alcanza 168,1 t/s, lo que permite servir un modelo de 9B en tarjetas de 8 GB o menos, a costa de una perdida severa de razonamiento (6,0% en MATH-500).
- Servicio de chat conversacional de alta concurrencia: con IQ2_XXS (3,12 GiB, 156,4 t/s) se puede maximizar el numero de secuencias concurrentes por GPU, adecuado para tareas de respuesta corta donde no se exige precision matematica.
- Investigacion en cuantizacion extrema: el repositorio proporciona cinco puntos de la curva bits-por-peso frente a calidad, utiles para estudiar tecnicas de post-training quantization y para reproducir comparaciones contra redondeo al vecino mas cercano.
- Evaluacion de alineacion bajo compresion: XSTest al 100% en todos los niveles permite estudiar si la cuantizacion agresiva reintroduce rechazos o altera el comportamiento de seguridad, un fenomeno documentado en otros modelos.
- Prototipado local de asistentes con contexto conversacional: el modelo se distribuye en GGUF con soporte de llama.cpp y la etiqueta endpoints_compatible, lo que facilita desplegarlo en estaciones de trabajo sin GPU de datacenter.
- Seleccion de compromiso memoria-calidad en produccion: Q4_K_M (5,36 GiB, 112,5 t/s) es la unica variante donde el autor reporta MATH-500 por encima de la linea base FP16, lo que la convierte en la opcion racional si se necesita razonamiento matematico con huella reducida.
- Generacion de codigo o razonamiento cientifico en produccion: no recomendado con los datos disponibles, dado que LiveCodeBench y GPQA Diamond se situan en 0,0-2,0%.

## Benchmarks y rendimiento

Tabla publicada por el autor. Todas las evaluaciones se ejecutaron en una NVIDIA GeForce RTX 4080 Super con kernels de llama.cpp para sm_89, en modo zero-shot greedy (temperatura 0,0, max_tokens 6144), sin modo de razonamiento extendido.

| Modelo / variante | Precision (bpw) | VRAM | Throughput | MATH-500 | AIME 2026 (greedy / entropia) | LiveCodeBench | GPQA Diamond | Hermes tool use | XSTest |
|---|---|---|---|---|---|---|---|---|---|
| Vanilla FP16 (linea base) | 16,0 | 17,14 GiB | 78,2 t/s | 28,0% (100,0%) | 0,0% / 3,33% | 2,0% | no disponible | 0,0% | 100,0% |
| Q4_K_M (TAP-DPQ v6) | 4,50 | 5,36 GiB | 112,5 t/s | 34,0% (121,4%) | 0,0% / 0,0% | 0,0% | 2,0% | 0,0% | 100,0% |
| IQ3_XXS (TAP-DPQ v6) | 3,06 | 3,78 GiB | 138,7 t/s | 28,0% (100,0%) | 0,0% / 0,0% | 0,0% | 0,0% | 0,0% | 100,0% |
| IQ2_M (TAP-DPQ v6) | 2,70 | 3,49 GiB | 145,2 t/s | 8,0% (28,6%) | 0,0% / 0,0% | 0,0% | 0,0% | 0,0% | 100,0% |
| IQ2_XXS (TAP-DPQ v6) | 2,06 | 3,12 GiB | 156,4 t/s | 6,0% (21,4%) | 0,0% / 0,0% | 0,0% | 0,0% | 0,0% | 100,0% |
| IQ1_S (TAP-DPQ v6) | 1,56 | 2,68 GiB | 168,1 t/s | 6,0% (21,4%) | 0,0% / 0,0% | 0,0% | 0,0% | 0,0% | 100,0% |

El autor advierte que el analizador de respuestas era un extractor de LaTeX estricto de enteros, que descarta aproximadamente el 40% de las soluciones de MATH-500 (fracciones, raices, pares de coordenadas y polinomios). Tambien senala que las puntuaciones corporativas de referencia (aproximadamente 82,9% en MATH-500 y 81,7% en GPQA Diamond) se obtienen con modo de razonamiento extendido de 4.000-8.000 tokens, mientras que estas pruebas se hicieron sin CoT. No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- Huella de VRAM segun variante: 17,14 GiB (FP16), 5,36 GiB (Q4_K_M), 3,78 GiB (IQ3_XXS), 3,49 GiB (IQ2_M), 3,12 GiB (IQ2_XXS) y 2,68 GiB (IQ1_S).
- GPU de referencia usada en las pruebas: NVIDIA GeForce RTX 4080 Super, con kernels llama.cpp optimizados para sm_89.
- Cabe en GPU de consumo: si. Todas las variantes cuantizadas por debajo de 5,5 GiB caben en tarjetas de 8 GB (RTX 3070, RTX 4060 Ti 8 GB, RTX 2070) y con holgura en 12-16 GB (RTX 4070, RTX 4080, RTX 4090). La linea base FP16 de 17,14 GiB requiere una GPU de 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100).
- Opciones de despliegue: llama.cpp (formato GGUF nativo) y cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp). La etiqueta endpoints_compatible sugiere compatibilidad con endpoints de inferencia tipo Hugging Face. No se menciona soporte para vLLM ni TGI en la informacion disponible.
- Throughput medido en RTX 4080 Super: 78,2 t/s (FP16), 112,5 t/s (Q4_K_M), 138,7 t/s (IQ3_XXS), 145,2 t/s (IQ2_M), 156,4 t/s (IQ2_XXS) y 168,1 t/s (IQ1_S). El autor afirma una mejora de 2,0x sobre BF16 y de 3,6x frente a Qwen 2.5 7B (43,3 t/s).
- Latencia: no se publican valores de time-to-first-token ni latencias por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Huella / rendimiento relevante |
|---|---|---|---|---|
| DuoNeural/Qwen3.5-9B-TAP-DPQ-v6-GGUF | 9,2 B | no disponible | apache-2.0 | 2,68-5,36 GiB; 112,5-168,1 t/s; MATH-500 6,0-34,0% |
| Qwen/Qwen3.5-9B (FP16, linea base del propio autor) | 9,2 B | no disponible | no disponible | 17,14 GiB; 78,2 t/s; MATH-500 28,0% |
| Qwen 2.5 7B (citado por el autor solo para throughput) | 7 B | no disponible | no disponible | 43,3 t/s segun el mismo arnes de medicion |
| Cuantizacion GGUF estandar por redondeo al vecino mas cercano | no aplicable | no aplicable | no aplicable | El autor afirma que colapsa en degeneracion sintactica por debajo de 2 bits; sin cifras publicadas |

La comparativa con alternativas reales de la misma categoria (por ejemplo, otras cuantizaciones GGUF de Qwen3.5-9B o de modelos de 8-9B como Llama 3.1 8B, Mistral 7B o Gemma 2 9B) no esta disponible en la informacion proporcionada. El unico contraste cuantitativo aportado es interno, entre variantes del propio repositorio y la linea base FP16.

## Limitaciones y advertencias

- Artefacto de investigacion experimental: el propio autor lo etiqueta como "bleeding-edge research checkpoint" y advierte de que no es un modelo listo para produccion.
- Afirmaciones no verificadas de forma independiente: la "super-paridad" en Q4_K_M y la "paridad exacta" en IQ3_XXS proceden unicamente del arnes del autor, sin replicacion externa ni revision por pares.
- Puntuaciones absolutas muy bajas: AIME 2026 al 0,0%, LiveCodeBench al 0,0-2,0% y GPQA Diamond al 0,0-2,0% indican capacidad de razonamiento avanzado, codigo y conocimiento cientifico practicamente nulos en el modo evaluado.
- Colapso por debajo de 3 bits: IQ2_M, IQ2_XXS e IQ1_S retienen solo el 21,4-28,6% del rendimiento de MATH-500. La IQ1_S no mejora a IQ2_XXS pese a ocupar menos memoria, lo que sugiere un suelo de calidad.
- Sensibilidad del evaluador: el analizador de enteros descarta aproximadamente el 40% de las soluciones de MATH-500, por lo que las puntuaciones absolutas de matematicas no son comparables con las de otros leaderboards.
- Tool calling no validado: el fallo al 0,0% en todas las variantes se atribuye a un desajuste de formato en el arnes, no a una incapacidad del modelo, pero no hay datos que confirmen que funciona.
- Deriva de alineacion: la conclusion de "cero deriva" se apoya en una unica prueba (XSTest) al 100%; no se aportan otros conjuntos de evaluacion de seguridad.
- Idiomas, longitud de contexto, tokenizador y datos de entrenamiento del modelo base: no disponibles, lo que impide evaluar el soporte multilingue y el uso con contextos largos.
- Discrepancia de hardware: la model card describe una RTX 4080 Super como GPU de 32 GB de VRAM, cuando ese modelo de consumo dispone de 16 GB. Conviene verificar la configuracion real de las pruebas.
- Senales de adopcion limitadas: 725 descargas y 0 likes en el momento de la consulta, sin discusion publica ni issues que permitan contrastar resultados.
- Licencia: apache-2.0, que permite uso comercial, pero al tratarse de pesos derivados de Qwen/Qwen3.5-9B conviene comprobar las condiciones del modelo base (no disponibles en la informacion proporcionada).
- Fechas del repositorio (octubre de 2026) y del benchmark AIME 2026 posteriores a la fecha de consulta habitual; conviene verificar la vigencia temporal de los datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DuoNeural/Qwen3.5-9B-TAP-DPQ-v6-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. Las coincidencias devueltas corresponden a la fotoperiodista y cineasta Carolyn Jones (carolynjones.com, Wikipedia, TEDMED, Notable People Project) y no guardan relacion con el modelo ni con el autor.
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
