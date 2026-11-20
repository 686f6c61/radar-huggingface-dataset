# IO-AIR/kip-hash

## Resumen

kip-hash es un artefacto de deduplicación y verificación de calidad de datos desarrollado por IO-AIR, distribuido bajo licencia MIT. No es un modelo generativo ni un transformer: es un hash aprendido ("learned hash") que comprime cada fila de un corpus en un único entero de 28 bits que codifica simultáneamente una firma de similitud para detección de cuasi-duplicados y una puntuación de calidad destilada de modelos docentes. Su función es la curación de datasets a escala, un paso previo habitual al entrenamiento de modelos de lenguaje.

La arquitectura se basa en seis proyecciones escalares aprendidas sobre una vista de características hasheada (unigramas y bigramas de palabra, 4-gramas de carácter, log-tf, normalización L2). Cada dimensión se cuantiza con bordes de masa igual aprendidos del corpus, de modo que la cuantización absorbe perturbaciones pequeñas en lugar de apostar bit a bit como SimHash o shingle a shingle como MinHash. Las 24 bits de bucket resultantes se empaquetan con 4 bits de puntuación de calidad en la misma palabra de 28 bits.

Es relevante por su huella extremadamente reducida: 3,5 bytes por fila, un artefacto de 610 KB y una velocidad de unas 210 filas por segundo en un solo núcleo con solo la biblioteca estándar de Python. Esto permite triaje y deduplicación en línea con coste O(1) por lectura, sin volver a leer el texto original, algo poco habitual en pipelines de curación de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hash aprendido: 6 proyecciones escalares cuantizadas sobre vista de características hasheada (uni/bigramas de palabra + 4-gramas de carácter) y cabeza lineal de verificación |
| Parametros totales | Matriz W de 32.768 x 10 en int8 más cabezas y cuantizadores (610 KB de artefacto); recuento exacto de parámetros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa filas individuales, no secuencias) |
| Tipos de cuantizacion | Pesos en int8; firma cuantizada a 24 bits de bucket (18 bits en modo compacto) y puntuación a 4 bits (16 niveles de masa igual) |
| Idiomas soportados | Entrenado sobre 44+ idiomas; lista explícita no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (artefacto `kip-hash.json`); no usa safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un SSM, sino un hashing aprendido supervisado. La firma de deduplicación se construye con seis proyecciones escalares z_k = (w_k · x - mu_k) / sigma_k sobre la vista de características hasheada, cada una cuantizada con bordes de masa igual derivados del corpus de entrenamiento. Los cuasi-duplicados difieren menos de un ancho de bin, por lo que la cuantización absorbe la perturbación; una sonda de ±1 bin recupera pares que caen en un borde, y una confirmación barata por dimensión (|dz|) restaura precisión sin re-hashear el texto. La vertiente de verificación es una cabeza lineal sobre las seis dimensiones aprendidas más una batería de 16 características superficiales que destila el veredicto 0-100 de los docentes, cuantizado a 4 bits y empaquetado en los bits bajos de la misma palabra.

El entrenamiento se realizó por destilación sobre 4.839 filas etiquetadas (794 + 1.913 + 2.132) en más de 44 idiomas y 10 dominios, usando como docentes DeepSeek-V4.1-Flash-1017 (canal principal vía webapp, lotes multiturno y ancla de calidad), kimi-k3.1-pro (vía NVIDIA NIM, etiquetado masivo en paquetes de 64 filas) y MiniMax M3.1 Flash (vía NVIDIA NIM, fallback designado). La supervisión combina pares duplicados adjudicados por docente, negativos duros del mismo chat, adjudicaciones en banda ambigua, positivos sintéticos de paráfrasis con verdad conocida y negativos sintéticos de similitud segura (48.106 pares de entrenamiento / 6.524 de evaluación). El split es 80/20 a nivel de lote, sin que ningún lote cruce, con entrenador determinista (SEED=20261119). El artefacto contiene solo pesos y metadatos, sin texto del corpus.

## Capacidades

- Detección de cuasi-duplicados fuzzy mediante colisión de buckets con sonda de ±1 bin y confirmación por dimensión.
- Verificación de calidad empaquetada: puntuación 0-100 cuantizada a 4 bits (16 niveles) destilada de docentes, legible en O(1) desde la palabra almacenada.
- Triaje de filas basura o boilerplate mediante `junk_prob` y puerta de calidad configurable (`gate`).
- Política de colisión integrada: al fusionar, el superviviente del clúster es la fila con mayor (score4, quality_fine, length, -arrival), calculable en O(1).
- Guarda léxica de 5-gramas como contrato de precisión: candidatos confirmados con J >= 0,5 se fusionan, con J < 0,25 se rechazan, y la zona gris 0,25-0,5 se registra para adjudicación del docente.
- Modo compacto (`with_compact()`) con palabra de 22 bits (buckets de 18 bits) orientado a recall para corpus de hasta 1 millón de filas.
- Ajuste de geometría de sonda mediante `config.fuzzy_radii` (radios asimétricos por dimensión) sin cambios de código.
- Compatibilidad retroactiva con `legacy=True` para reproducir la mecánica previa a la guarda.
- Inferencia en Python puro con solo la biblioteca estándar; CLI de autotest con `python3 kip_hash.py`.
- Ganchos de integración de pipeline: `kip.fullscale.learned_hash.load_kip_hash`, `nano_dedup` y `nano_triage`.

## Casos de uso

- Curación de corpus previa al entrenamiento: firmar cada fila del dataset con `sign_text` y deduplicar por colisión de buckets antes de tokenizar, reduciendo el coste de almacenamiento a 3,5 bytes por fila y evitando duplicados que inflan épocas de entrenamiento.
- Filtrado de calidad en streaming: usar la puerta `gate` sobre `score4` para descartar filas de baja calidad antes de que entren al índice de buckets, con triaje O(1) sin releer el texto.
- Deduplicación de conjuntos de instrucciones y conversaciones: el entrenamiento incluye pares multiturno y negativos duros del mismo chat, lo que lo hace adecuado para detectar paráfrasis cercanas en datasets de diálogo.
- Limpieza de corpus multilingües: al haberse entrenado sobre 44+ idiomas, puede aplicarse a mezclas lingüísticas sin reentrenamiento, aunque la lista explícita de idiomas no está disponible.
- Triaje de boilerplate y basura web: la señal `junk_prob` y la cabeza de verificación permiten separar plantillas, navegación y texto repetitivo en crawls a gran escala.
- Indexación de bajo coste para búsqueda de duplicados: el artefacto de 610 KB y las 210 filas/s por núcleo permiten desplegar el indexado en entornos con recursos mínimos, incluso en un solo proceso Python.
- Enrutado a adjudicación humana o por docente: la zona gris léxica (J entre 0,25 y 0,5) se registra en lugar de fusionarse, lo que permite construir colas de revisión acotadas.
- Prefiltrado en pipelines de anotación: usar el modo compacto para corpus de hasta 1 millón de filas cuando prima el recall (0,9172 fuzzy / 0,8790 confirmado) sobre la tasa de candidatos.

## Benchmarks y rendimiento

Resultados medidos en lotes reservados (946 documentos / 157 pares duplicados / 9.367 negativos), en el punto de operación enviado (tau óptimo en F1 incluido en el artefacto):

| Metrica | Valor |
|---|---|
| Recall de duplicados confirmados | 0,8153 |
| Tasa de falsas fusiones previa a la guarda | 0,00149 |
| Falsas fusiones tras la guarda léxica | 0 |
| Retención verdadera / rechazo falso de la guarda | 1,0 / 1,0 |
| MAE de score4 decodificado (0-100) | 12,11 |
| AUC de basura (junk) | 0,6631 |
| Throughput | 210 documentos/s, un núcleo, stdlib |

Modo compacto (palabra de 22 bits), misma evaluación:

| Metrica | Valor |
|---|---|
| Recall fuzzy | 0,9172 |
| Recall de duplicados confirmados | 0,8790 |
| Tasa de candidatos | 4,19 % |

Ajuste de geometría de sonda: ampliar a ±2 en las dos dimensiones más anchas sube el recall +2,5 puntos pero eleva las falsas fusiones previas a la guarda de 26 a 44 sobre negativos duros del mismo lote; las falsas fusiones posteriores a la guarda son 0 en todas las especificaciones. No se han publicado resultados de benchmarks en la información disponible para tareas comparables a MMLU, HumanEval o GSM8K, ya que el artefacto no es un modelo generativo.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es un JSON de 610 KB que se carga en memoria del proceso.
- GPU: no necesaria; la inferencia es en Python puro con la biblioteca estándar.
- CPU: un solo núcleo basta para ~210 documentos/s; el coste escala linealmente con núcleos si se paraleliza el firmado.
- Memoria RAM: despreciable para el artefacto; el consumo dominante es el índice de buckets, proporcional al número de filas indexadas.
- Despliegue: importación directa del módulo `kip_hash` o uso de los ganchos `kip.fullscale.learned_hash.load_kip_hash`, `nano_dedup` y `nano_triage`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~4,8 ms por documento en un núcleo a 210 documentos/s; el triaje por lectura de palabra es O(1).

## Comparativa con modelos similares

| Sistema | Tipo | Unidad de firma | Coste por fila | Recall de duplicados | Licencia |
|---|---|---|---|---|---|
| kip-hash | Hash aprendido supervisado | 28 bits (22 en compacto) | 3,5 bytes | 0,8153 confirmado / 0,9172 fuzzy (compacto) | MIT |
| SimHash | Hash local clásico | 64 bits típicos | 8 bytes | No disponible en esta ficha | Dominio público / variable |
| MinHash + LSH | Hash de shingles | Variable (bandas) | Depende de bandas y firmas | No disponible en esta ficha | Variable |
| Deduplicadores neuronales (embeddings) | Modelo de embeddings + ANN | Vector denso (p. ej. 384-1024 dims) | Cientos de bytes a varios KB | No disponible en esta ficha | Variable |

La ventaja diferencial de kip-hash frente a SimHash y MinHash es que integra la puntuación de calidad en la misma palabra y usa cuantización de masa igual para absorber perturbaciones, además de una guarda léxica que lleva las falsas fusiones a cero en la evaluación publicada. Frente a los embeddings neuronales, su huella y velocidad son órdenes de magnitud menores, a costa de una recall de duplicados inferior y de no capturar similitud semántica profunda. Los datos de los sistemas comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a prompts; cualquier uso como tal es un error de categoría.
- La recall de duplicados confirmados es 0,8153 en el punto de operación enviado; para corpus con requisitos de recall superiores hay que recurrir al modo compacto o ampliar `fuzzy_radii`, aceptando más candidatos y más carga de adjudicación.
- El AUC de basura es 0,6631, moderada: la señal `junk_prob` no debe usarse como filtro único sin revisión en dominios alejados del entrenamiento.
- El MAE de la puntuación de calidad decodificada es 12,11 sobre 100, por lo que la puntuación sirve para triaje y ordenación, no para umbrales finos.
- La zona gris léxica (J entre 0,25 y 0,5) no se fusiona automáticamente; requiere un paso de adjudicación que hay que presupuestar.
- Sesgos conocidos: no disponibles en la información proporcionada; el entrenamiento se hizo con docentes propietarios (DeepSeek, kimi, MiniMax) y solo 4.839 filas etiquetadas, lo que puede limitar la generalización a dominios no representados.
- La lista explícita de los 44+ idiomas soportados no está publicada, lo que impide verificar cobertura para idiomas concretos.
- Licencia MIT permite uso comercial sin restricciones declaradas, pero el artefacto no incluye texto del corpus ni garantías de exactitud.
- El artefacto se publica como JSON, no como safetensors ni GGUF, por lo que no es compatible con los cargadores estándar de Hugging Face Transformers.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/IO-AIR/kip-hash
- Repositorio y scripts de entrenamiento: referenciados en la model card como `scripts/train_kip_hash.py` (URL no disponible)
- Experimentos de refinamiento: `research/kip_hash_refine_experiments.json` (URL no disponible)
- Linaje de versiones: `research/kip_hash_lineage/` (URL no disponible)
- Licencia: archivo `LICENSE` del repositorio (URL no disponible)
