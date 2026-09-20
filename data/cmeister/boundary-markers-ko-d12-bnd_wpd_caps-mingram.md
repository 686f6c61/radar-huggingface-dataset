# cmeister/boundary-markers-ko-d12-bnd_wpd_caps-mingram

## Resumen

Este repositorio de HuggingFace no contiene un modelo único, sino tres modelos de lenguaje entrenados con las semillas 0, 1 y 2 para comparar vocabularios de subpalabras que marcan explícitamente las fronteras de palabra. Son los brazos en coreano del trabajo *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister, arXiv:2608.08847), que en el artículo original se evalúa en inglés; aquí se replican con coreano en septiembre de 2026. Los tres modelos comparten arquitectura, datos y número de pasos, y se diferencian únicamente en el tokenizador, de modo que cualquier diferencia de pérdida es atribuible al esquema de tokenización.

La arquitectura es la de nanochat (commit `92d63d4`) en su configuración de 12 capas, anchura 768, 6 cabezas de atención y contexto de 2.048 tokens. El entrenamiento son 2.553 pasos de 524.288 tokens cada uno, es decir, 1,34 mil millones de tokens procedentes de 3 fragmentos (*shards*) de Korean FineWeb-2, leídos unas 3,1 veces. El tokenizador, idéntico para las tres semillas, es un modelo MinGram entrenado sobre una muestra de 5 GB de Korean FineWeb con un vocabulario de 34.685 entradas, al que se añaden marcadores de frontera y códigos de caja (`<^>` para palabra con inicial mayúscula, `<^^>` para palabra en mayúsculas).

La relevancia es metodológica, no de producto: es un artefacto de investigación reproducible para medir si marcar fronteras de palabra de forma explícita mejora la modelización del lenguaje en una lengua aglutinante como el coreano. El resultado publicado es un efecto pequeño: el esquema `bnd_wpd_caps` obtiene, de media, unos 0,002 bits por byte peor que el tokenizador plano, con una desviación entre semillas de 0,00131. El repositorio tiene 0 descargas y 0 *likes*, lo que confirma su naturaleza de material auxiliar de un artículo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de nanochat (commit `92d63d4`): 12 capas, anchura 768, 6 cabezas de atencion |
| Parametros totales | no disponible (la model card no publica el recuento; vease la estimacion en la seccion de arquitectura) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en *state dict* de PyTorch; no hay GGUF, AWQ, GPTQ ni versiones cuantizadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch *state dict* (`seed<n>/model_002553.pt`), cargable con `torch.load(..., weights_only=True)`; tokenizador en JSON comprimido (`.json.gz`) |
| Vocabulario | 34.686 entradas (34.685 del tokenizador mas un token de inicio de secuencia) |
| Esquema de tokenizacion | `bnd_wpd_caps` (MinGram con marcadores de frontera y codigos de caja) |
| Semillas incluidas | 3 (0, 1 y 2) |
| Tokens de entrenamiento | 1,34 mil millones (2.553 pasos x 524.288 tokens) |
| Tamano del repositorio | 2,5 GB |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

Cada semilla es un transformer decoder-only de nanochat con 12 capas, anchura 768 y 6 cabezas de atención (128 dimensiones por cabeza), con un contexto máximo de 2.048 tokens. La model card no declara el número total de parámetros. Como referencia derivada de esas dimensiones, el tronco ronda los 85 millones de parámetros si se asume una expansión de 4x en el bloque MLP, a lo que hay que sumar las matrices de embedding del vocabulario de 34.686 entradas (unos 26,6 millones si están atadas a la proyección de salida); se trata de una estimación a partir de la configuración, no de un dato publicado. El repositorio ocupa 2,5 GB e incluye, por semilla, los pesos finales, el JSON de configuración de nanochat, el log completo de entrenamiento y un `archive.json` con los sha256 de cada fichero. El tokenizador es único y compartido por las tres semillas.

El entrenamiento usó 3 fragmentos de Korean FineWeb-2 (publicación `fineweb-2_0_1-quality_10-filterrobots`), 1,22 mil millones de caracteres leídos aproximadamente 3,1 veces, con una GPU por modelo y 2.553 pasos de 524.288 tokens (1,34 mil millones de tokens en total). La semilla fija la inicialización de pesos y el orden de los fragmentos, y ese orden es idéntico para todos los tokenizadores dentro de la misma semilla, lo que hace comparables los brazos. Hay un matiz importante: con solo 3 fragmentos, las semillas 1 y 2 sortearon el mismo orden, de modo que los tres modelos cubren dos órdenes de datos y no tres. No se menciona ningún tipo de ajuste posterior (RLHF, DPO, SFT): son modelos base de *preentrenamiento*. La innovación del artefacto está en el tokenizador, no en la arquitectura: además de los marcadores de frontera del esquema `bnd_wpd`, se añaden códigos de caja que escriben una palabra con inicial mayúscula como `<^>` seguida de su forma en minúsculas, y una palabra en mayúsculas como `<^^>` seguida de su forma en minúsculas, con el código fuera de los marcadores de la palabra. El test de caja exige un carácter con distinción de mayúsculas, así que en coreano esos códigos no se activan.

## Capacidades

- Modelado de lenguaje y generación de texto en coreano, con un contexto de 2.048 tokens.
- Es un modelo base: no está ajustado por instrucciones, por lo que no sigue órdenes ni mantiene un formato de diálogo de forma fiable.
- Tokenizador con marcadores explícitos de frontera de palabra y códigos de caja, cargable mediante la clase `BoundaryMinGramModel` del repositorio `script_tok`.
- Capacidad de evaluación intrínseca: al compartir datos y pasos con los demás brazos, permite medir bits por byte atribuibles al tokenizador.
- No dispone de *tool calling* ni de *function calling*.
- No dispone de comportamiento de agente ni de razonamiento en varios pasos.
- No dispone de visión, audio ni ninguna otra modalidad.
- Multilingüismo: nulo fuera del coreano; el vocabulario y los datos son exclusivamente coreanos.
- No se documenta ningún modo de razonamiento (*thinking mode*) ni decodificación especulativa.

## Casos de uso

- Reproducción de investigación sobre tokenización: cargar las tres semillas y recalcular bits por byte sobre un fragmento de validación de Korean FineWeb-2 para verificar el resultado del artículo con el mismo protocolo, misma inicialización y mismo orden de datos.
- Comparación controlada de vocabularios: usar este brazo frente al tokenizador `plain` dentro del mismo experimento para aislar el efecto de los marcadores de frontera, ya que ambos comparten arquitectura, pasos y datos.
- Evaluación de métricas intrínsecas: servir como sujeto de pruebas en *harnesses* que calculan bits por byte normalizados por la longitud real en UTF-8, un caso donde modelos pequeños y bien controlados son más útiles que modelos grandes.
- Estudio de morfología aglutinante: analizar si la segmentación con fronteras explícitas ayuda en coreano, una lengua con partículas y terminaciones verbales que los tokenizadores BPE habituales fragmentan de forma inconsistente.
- Verificación de códigos de caja en escrituras sin *caja*: el esquema `bnd_wpd_caps` añade tokens `<^>` y `<^^>` que nunca se activan en coreano; estos modelos permiten comprobar experimentalmente ese comportamiento neutro.
- Docencia y réplica de nanochat: con 12 capas y 1,34 mil millones de tokens de entrenamiento, la configuración es lo bastante pequeña para reproducir un ciclo completo de preentrenamiento y evaluación en un curso o taller con recursos limitados.
- Base de experimentación para *fine-tuning* en coreano: al ser un modelo base pequeño con licencia Apache 2.0, se puede ajustar para tareas concretas de clasificación o generación, siempre que se asuma el límite de 2.048 tokens de contexto y la ausencia de ajuste por instrucciones.
- Línea base en estudios multilingües de tokenización: comparar este brazo coreano con los equivalentes en otras lenguas del mismo repositorio `script_tok` para estudiar si el efecto de los marcadores depende de la escritura o de la morfología.

## Benchmarks y rendimiento

La model card publica una única métrica: bits por byte de validación (suma de la pérdida sobre un fragmento reservado de Korean FineWeb-2 dividida por la longitud real en UTF-8 del texto evaluado). Menos es mejor, y los valores solo son comparables dentro del mismo idioma.

| Semilla | Este modelo (bits/byte) | `plain` menos este modelo |
|---|---|---|
| 0 | 0,84993 | -0,00292 |
| 1 | 0,84949 | -0,00057 |
| 2 | 0,85002 | -0,00275 |
| Media | no disponible | -0,00208 (desviacion entre semillas 0,00131) |

La convención de la model card indica que un valor positivo en la tercera columna significaría que este esquema puntuó mejor que `plain`. Los tres valores son negativos, de modo que el tokenizador plano obtuvo bits por byte más bajos (mejores) en las tres semillas, con una diferencia media de 0,00208 bits por byte a favor de `plain`. Esa diferencia es del mismo orden que la desviación entre semillas (0,00131), así que el autor la presenta como una dirección y no como una estimación precisa. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de tareas en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra publicada. Como estimación derivada, cada semilla es una fracción de los 2,5 GB del repositorio (que incluye las tres semillas, el tokenizador y los logs), por lo que en fp32 el *state dict* de un solo modelo debería caber holgadamente por debajo de 1 GB.
- GPU recomendadas: la model card solo indica que el entrenamiento usó una GPU por modelo, sin especificar el modelo de GPU. Para inferencia, cualquier GPU con más de 1-2 GB de VRAM debería bastar, incluida una GTX 1650 o superior.
- ¿Cabe en GPU de consumo? Sí, con margen amplio; la restricción real es de software, no de memoria.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI. La carga prevista es mediante PyTorch (`torch.load` con `weights_only=True`) y el código de nanochat en el commit `92d63d4`; el tokenizador requiere el repositorio `script_tok` y su módulo `paper_utils.boundary.downstream.boundary_tokenizer`.
- Latencia y *throughput*: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.
- Almacenamiento: 2,5 GB para el repositorio completo; cada semilla se puede descargar por separado.
- Nota de integración: al no existir safetensors ni GGUF, incorporar estos pesos a un *stack* de producción exige conversión manual y código propio.

## Comparativa con modelos similares

No se han publicado en la información disponible datos comparativos con modelos externos de la misma categoría. La comparación relevante es interna al estudio, ya que todos los brazos comparten arquitectura, datos y pasos:

| Modelo / brazo | Parametros | Contexto | Bits por byte (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`bnd_wpd_caps`, 3 semillas) | no disponible (12 capas, anchura 768) | 2.048 | 0,84981 (media de 0,84993 / 0,84949 / 0,85002) | Apache 2.0 | HuggingFace, 0 descargas |
| Tokenizador `plain` (referencia del estudio) | identicos | 2.048 | 0,00208 menos que este modelo (mejor) | Apache 2.0 | mismo repositorio `script_tok` |
| Otros esquemas de frontera del articulo | identicos | 2.048 | no disponible en esta ficha | Apache 2.0 | repositorio `script_tok` |
| Modelos coreanos de tamaño similar de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La media de 0,84981 es una media aritmética calculada por esta ficha a partir de los tres valores publicados; la model card no la incluye. La comparación completa entre esquemas, entrenadores e idiomas se remite al repositorio `script_tok`.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 *likes*: no hay evidencia de uso en producción ni de validación externa.
- Entrenado con solo 1,34 mil millones de tokens y 2.048 tokens de contexto. Es insuficiente para tareas reales de generación de texto de calidad.
- Es un modelo base sin ajuste por instrucciones: no sigue órdenes, no respeta formatos de chat y puede producir continuaciones incoherentes o factualmente falsas.
- Riesgo de alucinación alto y sin mitigar; no se ha aplicado RLHF ni DPO.
- Sesgos: los datos proceden de Korean FineWeb-2, con los sesgos propios de texto rastreado de la web. El filtrado aplicado es el de la publicación `quality_10-filterrobots`, que no elimina sesgos de contenido.
- Sobreajuste al dominio: los 3 fragmentos se leyeron unas 3,1 veces, lo que reduce la diversidad efectiva de los datos.
- Cobertura lingüística: únicamente coreano. Cualquier uso en otra lengua carece de soporte y de validación.
- Alcance estadístico: el efecto medido (0,00208 bits por byte) es del orden de la desviación entre semillas (0,00131), así que no permite conclusiones firmes sobre si el esquema de marcadores ayuda o perjudica.
- Confusión de semillas: las semillas 1 y 2 comparten el mismo orden de fragmentos, por lo que solo hay dos órdenes de datos distintos; la variabilidad estimada está subestimada.
- Los códigos de caja `<^>` y `<^^>` no se activan en coreano, así que parte del vocabulario del tokenizador queda inerte en esta lengua.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución, pero no hay garantías ni soporte del autor.
- Formato: solo *state dict* de PyTorch en `.pt`. No hay safetensors, GGUF ni conversiones para *runtimes* de inferencia habituales, lo que añade trabajo de integración y riesgos de seguridad al cargar ficheros pickle.
- Carga del tokenizador: requiere clonar `script_tok` y usar su clase `BoundaryMinGramModel`; el tokenizador no funciona con las librerías estándar de `transformers`.
- Fechas: el repositorio se creó y actualizó el 2026-09-20, con 13 segundos de diferencia entre ambos eventos, lo que indica una subida automatizada sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-bnd_wpd_caps-mingram
- Articulo: *Explicit Boundary Markers for Subword Vocabularies*, Sander Land y Clara Meister: https://arxiv.org/abs/2608.08847
- Repositorio de codigo del estudio (`script_tok`, incluye el tokenizador y los entrenadores): https://github.com/sanderland/script_tok
- nanochat, commit `92d63d4` (arquitectura y entrenamiento): https://github.com/karpathy/nanochat
- Conjunto de datos Korean FineWeb-2 (publicacion `fineweb-2_0_1-quality_10-filterrobots`): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Perfil del autor en HuggingFace: https://huggingface.co/cmeister

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el articulo; los enlaces anteriores proceden de la model card y de las referencias que cita.
