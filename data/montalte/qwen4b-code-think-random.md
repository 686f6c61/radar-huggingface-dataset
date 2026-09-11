# Montalte/qwen4b-code-think-random

## Resumen

Montalte/qwen4b-code-think-random es un artefacto de fusión (merge) de pesos construido sobre Qwen/Qwen3-4B-Base, con 4.022.468.096 parámetros y licencia Apache-2.0. El autor lo describe como un «unified Qwen3-4B merge artifact for directional math↔code transfer experiments», es decir, una pieza de un programa de investigación sobre transferencia direccional de capacidades entre matemáticas y código mediante aritmética de vectores de tarea, no un modelo destinado a producción.

La particularidad del artefacto es el método de fusión: se aplica una máscara binaria aleatoria de cardinalidad exacta (exact-k) sobre el vector de tarea del especialista en código, conservando una fracción de 0,1 con semilla fija (seed=42). Se reutiliza el «stitch body» del denominado Plan B, que omite las capas de embedding y de lm_head, de modo que la única diferencia respecto a ese plan es que la máscara es uniformemente aleatoria en lugar de aprendida. El especialista de origen es modrill/code-think-q4b-20260908, en dominio código y modo «think».

Su relevancia es metodológica: sirve como control experimental para medir cuánto del rendimiento de un merge procede de la selección aprendida de parámetros frente a una selección aleatoria, y para estudiar si la transferencia math↔code tiene una dirección privilegiada. No hay datos de evaluación publicados, el repositorio no registra descargas ni «likes» y la ficha del autor no especifica idiomas soportados ni cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso heredada de Qwen3-4B-Base; el artefacto es un merge de vectores de tarea, no una arquitectura nueva |
| Parametros totales | 4.022.468.096 (4,02 mil millones), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos (ampliable con YaRN, dato no confirmado para este merge) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors. Compatible con conversion posterior a GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,1 GB, coherente con bf16/fp16) |
| Modelo base | Qwen/Qwen3-4B-Base @ 906bfd4b4dc7f14ee4320094d8b41684abff8539 |
| Especialista de origen | modrill/code-think-q4b-20260908 |
| Metodo de fusion | random: mascara binaria aleatoria exact-k sobre el vector de tarea, fraccion conservada 0,1, seed=42 |
| Cuerpo de stitch | identico al Plan B (se omiten embed y lm_head) |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de subida | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto: el modelo es el resultado de una operación de merging entre Qwen/Qwen3-4B-Base (modelo denso decoder-only de la familia Qwen3, con atención por grupos de consultas) y un especialista en código en modo «think», modrill/code-think-q4b-20260908. Sobre el vector de tarea del especialista —la diferencia entre los pesos del especialista y los del base— se aplica una máscara binaria aleatoria de cardinalidad exacta que conserva el 10 % de las componentes (keep fraction 0,1), con semilla 42. Las capas de embedding y de lm_head quedan excluidas del emparejamiento, siguiendo el mismo esquema de stitch que el Plan B del autor.

Técnicamente, la innovación es de método experimental, no de arquitectura: sustituir una máscara aprendida por una máscara uniformemente aleatoria permite aislar el efecto de la selección de parámetros en la transferencia de capacidades. El autor enmarca el artefacto en experimentos de transferencia direccional entre matemáticas y código. La ficha no documenta número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF o DPO; al partir de Qwen3-4B-Base, tampoco incorpora por defecto la plantilla de chat ni el modo de razonamiento de la variante instruct de Qwen3.

## Capacidades

- Generacion de texto autoregresivo: capacidad heredada del modelo base Qwen3-4B-Base, sin evaluacion publicada sobre este merge concreto.
- Generacion y comprension de codigo: es el dominio del especialista de origen, aunque la mascara aleatoria conserva solo el 10 % de las componentes del vector de tarea, por lo que el grado de transferencia efectiva es precisamente lo que el artefacto pretende medir y no esta cuantificado.
- Razonamiento matematico: dominio declarado en el planteamiento del experimento (transferencia math↔code), sin resultados publicados.
- Modo «think»: el especialista de origen opera en modo think, pero la ficha del merge no confirma que el artefacto conserve la plantilla de razonamiento ni los delimitadores de bloque de pensamiento.
- Tool calling / function calling: no confirmado. El modelo base no incorpora un ajuste especifico de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades multimodales (vision, audio): no disponibles; no se mencionan en la ficha.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.

## Casos de uso

- Reproducibilidad de experimentos de model merging: el artefacto fija keep fraction, semilla y cuerpo de stitch, de modo que cualquier laboratorio puede repetir la mascara aleatoria y contrastar sus resultados con los del autor.
- Control experimental frente a mascaras aprendidas: sirve como linea base para medir la ganancia real que aporta la seleccion aprendida de parametros (Plan B) frente a seleccionar el mismo numero de componentes al azar.
- Estudio de transferencia direccional math↔code: permite comparar merges entrenados en la direccion codigo→matematicas con los entrenados en la direccion opuesta, usando este artefacto como referencia neutral.
- Analisis de robustez del task arithmetic: al conservar solo el 10 % del vector de tarea, es util para estudiar como degrada la capacidad del especialista al reducir el numero de componentes modificadas.
- Semilla para ajuste fino posterior: un equipo puede partir de estos pesos y aplicar SFT o DPO sobre un corpus de codigo propio; conviene validar antes que el merge no haya degradado la perplejidad del base.
- Generacion de codigo en entornos de investigacion con validacion humana: uso interno para sugerencias de fragmentos, siempre con revision y tests automatizados, dado que no hay evaluacion publicada de calidad o correccion.
- Inferencia local tras conversion a GGUF: si se convierte y cuantiza a 4 bits, puede ejecutarse en portatiles para pruebas de concepto de autocompletado, asumiendo la perdida adicional de precision sobre un merge ya de por si experimental.
- Docencia sobre tecnicas de fusion de modelos: ilustra de forma reproducible como una mascara aleatoria afecta a la transferencia de una capacidad concreta entre dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha del autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), no se aportan curvas de perdida y el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta. Tampoco es posible comparar contra el especialista de origen, cuya model card no forma parte de la informacion proporcionada.

## Requisitos de hardware

- Peso en precision completa (bf16/fp16): aproximadamente 8,0-8,1 GB, coincidente con el tamano del repositorio (4,02 mil millones de parametros).
- VRAM estimada en bf16 con contexto corto: en torno a 9-10 GB incluyendo overhead de runtime. Con contexto de 32.768 tokens, la cache KV de un modelo con atencion GQA anade del orden de 2-3 GB adicionales.
- Cuantizacion GGUF estimada: Q8_0 en torno a 4,3 GB, Q6_K alrededor de 3,3 GB, Q5_K_M cerca de 2,9 GB y Q4_K_M aproximadamente 2,5 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados para este modelo.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con holgura en bf16; en 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con contexto moderado; en 12 GB (RTX 3060 12 GB) de forma ajustada en bf16 o comoda con cuantizacion de 8 bits; con Q4 puede ejecutarse en GPUs de 8 GB (RTX 3070, RTX 4060).
- GPU de datacenter: A100 40/80 GB, H100, L40S y A6000 son suficientes y quedan sobredimensionadas para inferencia de un modelo de 4B; se usarian para servir lotes grandes.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI y SGLang para servicio con batching continuo; llama.cpp, Ollama y LM Studio requieren convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No se han publicado medidas para este artefacto.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas publicas y deben verificarse antes de tomar decisiones; los del modelo analizado son los de su repositorio.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Montalte/qwen4b-code-think-random | 4,02 B | no disponible (base: 32.768) | Merge experimental de vectores de tarea | apache-2.0 | safetensors, sin evaluacion publicada |
| Qwen/Qwen3-4B-Base | 4,02 B | 32.768 tokens nativos | Transformer denso preentrenado | apache-2.0 | safetensors, ampliamente evaluado |
| Qwen/Qwen3-4B (instruct) | 4,02 B | 32.768 tokens nativos (128.000 con YaRN) | Transformer denso postentrenado | apache-2.0 | safetensors, con plantilla de chat y modo thinking |
| Qwen2.5-Coder-3B | 3,09 B | 32.768 tokens | Transformer denso especializado en codigo | qwen-research (no comercial) | safetensors, con benchmarks de codigo publicados |
| Llama-3.2-3B | 3,21 B | 128.000 tokens | Transformer denso preentrenado | Llama 3.2 Community License | safetensors, con evaluaciones publicadas |

La diferencia relevante no es de escala ni de contexto, sino de naturaleza: el artefacto de Montalte es un objeto de investigacion sin validacion publicada, mientras que las alternativas son modelos con documentacion, evaluaciones y soporte de ecosistema. Frente a Qwen3-4B-Base, el merge solo aporta la transferencia parcial del especialista en codigo; frente a Qwen3-4B instruct, carece de plantilla de chat y de ajuste por instrucciones verificado; frente a Qwen2.5-Coder-3B, no hay evidencia de mejora en tareas de codigo y ademas parte de una licencia Apache-2.0 mas permisiva que la licencia de investigacion de aquel.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo listo para produccion: el propio autor lo describe como material para experimentos de transferencia direccional, sin validacion independiente.
- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el base ni con el especialista de origen, por lo que se desconoce si el merge mejora, iguala o degrada al modelo del que parte.
- Mascara aleatoria: conservar el 10 % de las componentes del vector de tarea segun una mascara uniforme no garantiza que se preserven las direcciones de pesos relevantes para la capacidad de codigo o de matematicas.
- Riesgo de degradacion de la coherencia: al omitir embed y lm_head del emparejamiento y modificar solo el cuerpo del transformer, pueden aparecer inconsistencias entre la representacion de entrada y las capas modificadas; requiere verificacion empirica.
- Alucinacion: al proceder de un modelo base preentrenado, sin etapas de alineacion documentadas, la tendencia a generar contenido plausible pero incorrecto es alta, especialmente en codigo con APIs inventadas.
- Idioma: no se declara lista de idiomas soportados; el comportamiento multilingue no esta documentado.
- Contexto: la longitud de contexto efectiva del merge no esta declarada; heredarla del base es una suposicion razonable pero no confirmada.
- Tool calling y agentes: no confirmados; no existe plantilla de herramientas publicada en el repositorio.
- Licencia: apache-2.0, permisiva para uso comercial, pero el usuario debe cumplir tambien las condiciones aplicables al modelo base y al especialista de origen.
- Sesgos: no documentados en la ficha; al no haber evaluacion, no se puede descartar la presencia de sesgos de genero, raza o idioma heredados del preentrenamiento.
- Madurez del repositorio: 0 descargas y 0 «likes», sin issues ni historial de uso que permitan inferir estabilidad; fechas de creacion y actualizacion separadas por minutos, lo que sugiere una subida automatica de un artefacto de laboratorio.
- Sin garantia de soporte: no se documentan versiones de transformers, configuracion de generacion ni parametros recomendados de muestreo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Montalte/qwen4b-code-think-random
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Especialista de origen citado por el autor: https://huggingface.co/modrill/code-think-q4b-20260908
- Resultados de busqueda web: no se encontro informacion relevante sobre el modelo; los resultados devueltos correspondian a una persona sin relacion con el proyecto y se han descartado.
