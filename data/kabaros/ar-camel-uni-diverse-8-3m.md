# kabaros/ar-camel-uni-diverse-8.3M

## Resumen

El modelo `kabaros/ar-camel-uni-diverse-8.3M` es un modelo de lenguaje causal de tipo GPT-2, con aproximadamente 17 millones de parámetros, entrenado exclusivamente en árabe. Forma parte de un conjunto de seis modelos desarrollados en el marco de una tesis de máster en la Universidad de Stirling (Reino Unido) que investiga el impacto de la tokenización y la composición del corpus en modelos de lenguaje pequeños. Este checkpoint concreto corresponde a la variante de corpus "Diverse" (8,3 millones de palabras) y utiliza un tokenizador CAMeL + Unigram con segmentación morfológica.

El modelo está diseñado para la evaluación de gramaticalidad en árabe mediante la tarea de juicio de pares mínimos de MultiBLiMP, donde alcanza una puntuación de 77,61, superando al baseline de la comunidad BabyLM (75,9) pero muy por debajo de modelos mucho más grandes como OLMo-2 (87 %). Su relevancia radica en ser un recurso de investigación para estudiar cómo la elección de tokenizador y la mezcla de dominios afectan al rendimiento en condiciones de datos limitados, un área clave para el desarrollo de modelos eficientes en lenguas con menos recursos.

Con una ventana de contexto de 512 tokens y una arquitectura de 4 capas y 8 cabezas de atención, este modelo no está pensado para uso en producción, sino como herramienta experimental para la comunidad científica. Su licencia CC-BY-4.0 permite uso comercial con atribución, pero su tamaño y limitaciones lo hacen inadecuado para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parametros totales | 17.067.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | arabe (ar) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 con 4 capas transformer, 8 cabezas de atención, dimensión de embedding de 512 y contexto de 512 tokens. Es un modelo denso, sin mezcla de expertos. El entrenamiento se realizó sobre un corpus árabe de 8,3 millones de palabras, con una composición denominada "Diverse" (los detalles exactos de la mezcla no se especifican en la documentación disponible, pero se mencionan otras variantes como "ebooks-heavy" o "Impossible Man" en el mismo conjunto de modelos). No se indica el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un modelo de lenguaje autorregresivo estándar.

La innovación principal reside en el tokenizador: se emplea una variante de CAMeL (un segmentador morfológico para árabe) combinado con Unigram, que aplica segmentación morfológica antes de cada llamada de codificación. Esto requiere cargar el modelo con `trust_remote_code=True` para usar la subclase personalizada de `PreTrainedTokenizerFast` incluida en los archivos del repositorio. El entrenamiento se realizó con tres semillas distintas para cada composición de corpus, y este checkpoint corresponde a la semilla 44, que fue la mejor de las tres para la variante "Diverse".

## Capacidades

- Generacion de texto en arabe: el modelo puede producir texto coherente en arabe, aunque con limitaciones propias de su tamano y contexto.
- Evaluacion de gramaticalidad: disenado especificamente para la tarea de juicio de pares minimos de MultiBLiMP, donde clasifica cual de dos frases es gramaticalmente correcta.
- Segmentacion morfologica: el tokenizador CAMeL + Unigram aplica segmentacion morfologica, lo que puede mejorar el manejo de la morfologia rica del arabe.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento especiales.
- Multilingue: no, solo arabe.

## Casos de uso

- Investigacion academica en PLN arabe: el modelo sirve como punto de referencia para estudiar el efecto de la tokenizacion y la composicion del corpus en modelos pequenos. Los investigadores pueden comparar sus propios modelos contra este checkpoint.
- Analisis linguistico computacional: su capacidad de juicio de gramaticalidad permite experimentos sobre la adquisicion de la gramatica arabe en modelos entrenados con datos limitados.
- Desarrollo de tokenizadores: al incluir un tokenizador personalizado con segmentacion morfologica, puede utilizarse como base para probar nuevas estrategias de tokenizacion en arabe.
- Educacion en PLN: por su tamano reducido, es adecuado para fines docentes, permitiendo a estudiantes ejecutar experimentos de generacion de texto o evaluacion de modelos sin necesidad de hardware costoso.
- Benchmarking de modelos pequenos: puede integrarse en suites de evaluacion como BabyLM para comparar el rendimiento de diferentes arquitecturas y tecnicas de entrenamiento en condiciones de datos escasos.
- Replicacion de estudios: al estar publicada la configuracion exacta (semilla, tokenizador, corpus), otros equipos pueden reproducir los resultados o extenderlos con nuevas variantes.

## Benchmarks y rendimiento

El unico benchmark reportado en la documentacion es MultiBLiMP (juicio de pares minimos, media de 3 semillas). Para este checkpoint especifico (semilla 44), la puntuacion es 77,61. La tabla siguiente compara con otros modelos mencionados en la model card:

| Modelo | Parametros | Tokens de entrenamiento | MultiBLiMP (arabe) |
|---|---|---|---|
| kabaros/ar-camel-uni-diverse-8.3M | 17M | 8,3M palabras | 77,61 |
| BabyLM-community/babylm-ara (baseline BPE) | ~17M | 8,3M palabras | 75,9 |
| OLMo-2 | 32B | 6T | 87 |

No se han publicado otros benchmarks (como MMLU, HumanEval o GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 17 millones de parametros. En FP32 ocupa aproximadamente 68 MB, en FP16 unos 34 MB y en int8 unos 17 MB. Cabe en cualquier GPU moderna, incluso en las mas basicas (por ejemplo, una GTX 1650 con 4 GB es mas que suficiente).
- GPU recomendadas: no se requiere una GPU especifica; cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo. Tambien puede funcionar en CPU sin problemas.
- Opciones de despliegue: al ser un modelo de Transformers, puede cargarse con la libreria `transformers` de HuggingFace. Para inferencia en CPU, se puede usar `llama.cpp` o `Ollama` si se convierte a GGUF, aunque no se proporcionan conversiones oficiales. Tambien es compatible con `vLLM` o `TGI` para entornos de servidor, aunque su tamano hace que estas opciones sean innecesarias.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, la generacion de texto es practicamente instantanea en GPU y muy rapida en CPU moderna.

## Comparativa con modelos similares

El modelo se compara directamente con el baseline de BabyLM para arabe (`BabyLM-community/babylm-ara`), que usa tokenizacion BPE y el mismo corpus original. La diferencia principal es el tokenizador (CAMeL + Unigram con segmentacion morfologica frente a BPE) y la composicion del corpus (Diverse frente a la original). En la tabla de benchmarks se observa una mejora de 1,7 puntos en MultiBLiMP.

Otra comparacion posible es con OLMo-2, aunque no es comparable por tamano (32B frente a 17M) y datos de entrenamiento (6T tokens frente a 8,3M palabras). Se incluye en la model card como referencia de lo que se puede lograr con modelos mucho mas grandes.

No se dispone de informacion sobre otros modelos arabes pequenos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Tamano muy reducido: con solo 17M de parametros y 512 tokens de contexto, la generacion de texto es limitada y propensa a incoherencias en textos largos.
- Sesgos del corpus: la composicion "Diverse" no esta detallada, pero al ser un corpus pequeno (8,3M palabras) es probable que contenga sesgos de dominio o registro. No se ha realizado una auditoria de sesgos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en temas fuera de su distribucion de entrenamiento.
- Dependencia de codigo remoto: el tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio. Esto supone un riesgo de seguridad si el repositorio se viera comprometido.
- Solo arabe: no soporta otros idiomas, lo que limita su uso a aplicaciones monolingues.
- No apto para produccion: su tamano y calidad lo hacen inadecuado para tareas reales como atencion al cliente o generacion de contenido profesional.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion. No hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kabaros/ar-camel-uni-diverse-8.3M
- No se han encontrado otros enlaces (papers, blogs o repositorios) en la busqueda web realizada.
