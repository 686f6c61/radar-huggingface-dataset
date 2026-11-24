# ccmusic-database/song_structure

## Resumen

`song_structure` es un modelo de análisis de estructura musical publicado por el repositorio ccmusic-database, orientado a la segmentación estructural de canciones (detección de fronteras entre secciones como estrofa, estribillo o puente). No se trata de un modelo de lenguaje generativo, sino de un pipeline de clasificación de audio que combina extracción de características CQT (Constant-Q Transform) con el marco de trabajo MSAF (Music Structure Analysis Framework) para identificar límites y etiquetar segmentos según similitud acústica.

La metodología sigue el enfoque del conjunto Harmonix: las fronteras se detectan mediante Structural Features y el etiquetado de segmentos se realiza con coeficientes de magnitud de Fourier 2D (2D-FMC). La evaluación se lleva a cabo con `mir_eval`, reportando F-measure para Hit Rate con ventanas de 0,5 y 3 segundos, Pairwise Frame Clustering y Entropy Scores.

El modelo está pensado para investigadores en musicología computacional y desarrolladores que necesiten analizar la forma musical de grabaciones. Su licencia MIT y su integración con ModelScope facilitan su uso, aunque la información técnica publicada es limitada y no se detallan parámetros, arquitectura neuronal concreta ni resultados numéricos de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de análisis musical basado en CQT + MSAF (Structural Features y 2D-FMC); no se especifica una arquitectura neuronal concreta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo opera sobre audio, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,0 GB; se distribuye vía ModelScope snapshot) |

## Arquitectura y entrenamiento

El modelo implementa un pipeline de segmentación estructural musical. La entrada se representa mediante características CQT, que proporcionan una resolución logarítmica en frecuencia adecuada para señales musicales. Sobre esas características se aplican Structural Features para localizar fronteras entre secciones y coeficientes 2D-FMC para etiquetar los segmentos según su similitud acústica. Todo el procesamiento se orquesta con MSAF.

No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset de entrenamiento, ni si hubo etapas de ajuste fino supervisado o aprendizaje por refuerzo. El modelo se asocia al dataset `ccmusic-database/song_structure`, publicado por Zhaorui Liu y Zijin Li dentro de la plataforma CCMUSIC DATASET (Zenodo, 2021). No se documentan innovaciones como decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Segmentación estructural de canciones: detección de fronteras entre secciones musicales.
- Etiquetado de segmentos por similitud acústica mediante 2D-FMC.
- Clasificación de audio (pipeline declarado: `audio-classification`).
- Extracción de características CQT para análisis musical.
- Evaluación integrada mediante `mir_eval` (Hit Rate, Pairwise Frame Clustering, Entropy Scores).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- No se documentan capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Análisis musicológico automatizado: el modelo permite obtener una segmentación estructural de grabaciones para estudios de forma musical, facilitando el trabajo comparativo sobre corpus amplios sin anotación manual.
- Generación de metadatos estructurales: se puede usar para enriquecer catálogos musicales con marcas de sección (estrofa, estribillo, puente) que mejoren la búsqueda y la navegación dentro de una canción.
- Investigación en recuperación de información musical: sirve como componente de sistemas que necesitan localizar repeticiones o secciones similares dentro de una pieza, apoyándose en las fronteras y etiquetas generadas.
- Preprocesado para tareas de edición y remezcla: la detección de fronteras permite segmentar automáticamente una pista antes de aplicar cortes, loops o procesos de masterización por secciones.
- Evaluación reproducible de algoritmos de segmentación: al seguir la metodología Harmonix y usar `mir_eval`, el modelo puede servir como referencia o baseline en comparativas de nuevos métodos.
- Docencia y experimentación en musicología computacional: su licencia MIT y su integración con ModelScope lo hacen adecuado para prácticas y prototipos académicos sin restricciones de uso comercial.
- Sincronización con letras o vídeo: las fronteras estructurales detectadas pueden alinear letras, subtítulos o cortes de vídeo con las secciones de la canción.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que se reporta F-measure para Hit Rate (ventanas de 0,5 y 3 segundos), Pairwise Frame Clustering y Entropy Scores mediante `mir_eval`, pero no incluye los valores obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y no se detallan pesos ni tamaño de modelo.
- GPU recomendadas: no disponibles; al no especificarse arquitectura neuronal, no puede estimarse el perfil de cómputo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: descarga mediante `modelscope` (`snapshot_download`) y clonado del repositorio de Hugging Face; el pipeline se ejecuta con MSAF y `mir_eval`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación estructural musical ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al operar sobre audio musical, puede heredar sesgos del corpus de entrenamiento (géneros, estilos o tradiciones musicales sobrerrepresentadas).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en la detección de fronteras y errores de etiquetado de segmentos.
- No se especifican limitaciones de duración de audio ni de idioma; la etiqueta de idioma `en` es meramente declarativa.
- No se detalla el número de parámetros ni el formato de pesos, lo que dificulta estimar costes de despliegue.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del dataset asociado y de las dependencias (MSAF, `mir_eval`).
- La ausencia de benchmarks publicados impide validar el rendimiento frente a alternativas antes de llevarlo a producción.
- El repositorio de Hugging Face figura con 0,0 GB, por lo que la distribución real de artefactos se realiza a través de ModelScope.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/song_structure
- Dataset en Hugging Face: https://huggingface.co/datasets/ccmusic-database/song_structure
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/song_structure
- Repositorio de evaluación: https://github.com/monetjoe/ccmusic_eval/tree/msa
- Cita del dataset (Zenodo): https://doi.org/10.5281/zenodo.5676893
