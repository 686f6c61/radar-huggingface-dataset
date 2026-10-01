# anshy/classifs

## Resumen

`anshy/classifs` no es un modelo de lenguaje único, sino una colección de cuatro clasificadores fastText independientes que puntúan o etiquetan pull requests de GitHub a partir del diff y del contenido de los ficheros tocados. Los cuatro fueron destilados a partir de anotaciones del modelo Jev (`typesafe/jev-1.13`) sobre PRs minados de GitHub Archive. El repositorio ocupa 14,3 GB, pero ese tamaño corresponde casi por completo a los ficheros `train.txt`/`val.txt` de cada subcarpeta; los pesos `model.bin` en sí son de tamaño moderado.

Cada subcarpeta (`quality/`, `multilingual/`, `research_novelty/`, `tags/`) es autocontenida: incluye los pesos, los datos de entrenamiento exactos, el script `train.py` que reproduce el `model.bin` desde `train.txt` y un `infer.py` que descarga un PR en vivo mediante la API de GitHub y lo clasifica sin depender del pipeline de minado original. Se trata, por tanto, de artefactos reproducibles de extremo a extremo, no de pesos opacos.

La relevancia práctica está en el filtrado y triaje automatizado de PRs a escala: `multilingual` funciona como pre-filtro fiable, mientras que `quality` y `research_novelty` son clasificadores de alta precisión y recall muy bajo, útiles solo con expectativas ajustadas. No es un modelo generativo ni un transformer: es una familia de clasificadores lineales sobre bolsa de n-gramas, lo que implica requisitos de hardware mínimos (CPU) y latencia muy baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (clasificador lineal sobre bolsa de n-gramas de palabras y de caracteres mediante buckets) |
| Parametros totales | no disponible (dim=64 o 128 segun submodelo; bucket=2.000.000) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (sin ventana de contexto; el texto de entrada se procesa como bolsa de n-gramas) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (fastText admite cuantizacion de producto, no documentada aqui) |
| Idiomas soportados | no disponible (el submodelo `multilingual` mide presencia de texto no ingles en el diff, pero no se declara el conjunto de idiomas del clasificador) |
| Licencia | no disponible |
| Formato de pesos | `model.bin` (formato binario de fastText); datos de entrenamiento en `train.txt`/`val.txt` (texto plano) |

## Arquitectura y entrenamiento

Los cuatro clasificadores usan la arquitectura estándar de fastText: se representan los n-gramas de palabras (con `wordNgrams=2`) y los n-gramas de caracteres mapeados a 2.000.000 de buckets, se promedian sus embeddings y se pasa el vector resultante por una capa lineal con softmax. No hay atención, ni recurrencia, ni capas transformer. Los hiperparámetros varían por submodelo: `quality` y `research_novelty` usan `dim=64, epoch=10, lr=0.3, minCount=3`; `multilingual` usa `dim=128, epoch=25, lr=0.3, minCount=3` tras un barrido de capacidad en el que `dim=256` no aportó mejoras y duplicaba el tamaño del modelo. La configuración de `tags` no se detalla en la información disponible.

Los datos de entrenamiento provienen de PRs minados de GitHub Archive y anotados por Jev. `quality` y `multilingual` comparten 254.143 PRs de entrenamiento y 28.238 de validación (de los cuales 1.766 tienen nivel ≥6 en `quality`). `research_novelty` y `tags` comparten identificadores de PR entre sí (misma tanda de anotación): 96.634 PRs de entrenamiento con 297 casos ≥6, y 10.772 de validación con 35 casos ≥6. El 2026-09-30 `research_novelty` se reentrenó sobre una nueva tanda de 107.406 PRs anotados (frente a la pasada original de 39.081 PRs con 98 positivos), reutilizando el campo `text` ya existente en lugar de volver a minar el contenido. No se documenta uso de RLHF ni DPO, algo coherente con un clasificador supervisado.

Un detalle destacable es la advertencia de compatibilidad: el wheel precompilado de fastText puede corromper silenciosamente las probabilidades de `predict()` por lotes bajo NumPy 2.x, y una compilación desde fuente falla directamente en el wrapper de Python por `np.array(..., copy=False)`. Hay que fijar `numpy<2`.

## Capacidades

- Clasificación de pull requests de GitHub a partir del diff y del contenido de los ficheros tocados, con descarga en vivo vía API de GitHub en `infer.py`.
- Puntuación de calidad en escala 0-10 (`quality`), con regla estricta de sensibilidad: 0-5 depende de coherencia y credibilidad del código, y 6 o más exige complejidad de ingeniería o conceptual real.
- Puntuación descriptiva de contenido multilingüe en escala 0-10 (`multilingual`): mide cuánto texto natural no inglés (comentarios, docstrings, literales de cadena) aparece en el diff y los ficheros tocados, con independencia del lenguaje de programación.
- Puntuación de novedad investigadora o propiedad intelectual en escala 0-10 (`research_novelty`): grado en que el PR implementa algoritmos técnicos, ideas de artículos o diseño original, frente a ingeniería rutinaria.
- Etiquetado multietiqueta sobre 424 etiquetas (`tags`), con umbral de probabilidad configurable mediante `--threshold` (por defecto 0,5) y salida ordenada por confianza.
- Salida doble en los clasificadores de escala: una puntuación `soft` (valor esperado ponderado por probabilidad) y una `hard` (argmax del nivel), ambas en 0-10. La documentación recomienda usar la `soft` por correlacionar mejor.
- Reproducibilidad completa: reentrenamiento in situ con `cd <subcarpeta> && python train.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo generativo.

## Casos de uso

- Triaje masivo de pull requests en repositorios grandes: ejecutar `quality/infer.py` sobre la cola de PRs permite descartar con altísima precisión los que no alcanzan el umbral, aceptando conscientemente que se perderán cerca del 87% de los PRs genuinamente buenos. Adecuado cuando el coste de una revisión manual errónea supera el de omitir candidatos.
- Pre-filtrado por idioma del contenido: `multilingual` es fiable como filtro previo (precisión 96,30%, recall 98,73% sobre un holdout en vivo de 100 PRs), por lo que sirve para enrutar PRs con documentación o comentarios no ingleses hacia revisores o flujos de traducción.
- Curaduría de datasets de código: etiquetar corpus de PRs con `tags` para construir subconjuntos temáticos y entrenar modelos posteriores con supervisión más limpia.
- Enrutamiento de revisores: combinar `tags` con `research_novelty` para dirigir PRs con carga algorítmica hacia perfiles senior y PRs rutinarios hacia revisión estándar.
- Monitorización de contribuciones externas: aplicar los cuatro clasificadores a PRs de forks no confiables para priorizar la inspección de cambios que tocan lógica sensible.
- Investigación sobre calidad de contribuciones open source: el pipeline reproducible (`train.txt` + `train.py` + anotaciones de Jev) permite estudiar la correlación entre señales textuales del diff y juicios de calidad, sin necesidad de GPU.
- Deduplicación semántica de incidencias o PRs por etiquetas: el etiquetado multietiqueta sobre 424 clases facilita agrupar cambios por área funcional.
- Automatización ligera en CI: al ejecutarse en CPU y con latencia de milisegundos, `multilingual` o `tags` pueden integrarse como paso de un flujo de CI para marcar PRs que requieren revisión lingüística o de propiedad intelectual.

## Benchmarks y rendimiento

**`quality`** (holdout de seguimiento de 10.000 PRs, regla `quality >= 6`):

| Metrica | Valor |
|---|---|
| Exactitud de la regla | 93,73% |
| Precision | 74,17% |
| Recall | 12,99% |
| Exactitud de nivel exacto | 78,01% |
| MAE | 0,531 |
| Pearson / Spearman (soft) | 0,7252 / 0,6339 |

Nota del autor: el modelo pierde aproximadamente el 87% de los PRs realmente buenos (quality ≥6) para mantener los falsos positivos en el 0,33% de los negativos, y sus predicciones nunca superan aproximadamente 6,8-7 en ningún PR probado. Bajar el umbral a ≥5 empeora el resultado (la exactitud cae al 37%, ya que cerca del 80% de los PRs reales ya están en ≥5).

**`multilingual`** (holdout en vivo de 100 PRs, 79 verdaderos positivos, regla `multilingual <= 1`):

| Metrica | Valor |
|---|---|
| Exactitud de la regla | 96,00% |
| Precision | 96,30% |
| Recall | 98,73% |
| MAE | 0,586 |
| Pearson / Spearman | 0,906 / 0,721 |

**`research_novelty`**: no disponible. La model card se corta en este punto ("Metrics (own val.txt,") y solo indica que el recall es aproximadamente 0 con la regla ≥6, por lo que se marca como no fiable.

**`tags`**: no disponible. La model card remite a una sección propia que no aparece en la información proporcionada.

## Requisitos de hardware

- No requiere GPU. fastText es un clasificador lineal que se ejecuta en CPU; la inferencia es de milisegundos por PR.
- El cuello de botella real es la memoria, no el cómputo: con `bucket=2.000.000` y `dim=64`, la matriz de entrada ronda los 512 MB en float32; con `dim=128` se aproxima a 1 GB. Son estimaciones derivadas de los hiperparámetros publicados, no cifras confirmadas por el autor.
- El repositorio completo ocupa 14,3 GB, pero ese peso corresponde a los ficheros `train.txt`/`val.txt`; para solo inferencia basta con `model.bin`.
- Despliegue: cualquier máquina con Python, `fasttext==0.9.3`, `numpy<2` y `requests`. La documentación exige explícitamente fijar `numpy<2` por el bug de corrupción de probabilidades en `predict()` por lotes.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo transformer.
- Latencia y throughput concretos: no disponibles. Se requiere un token de GitHub (`GITHUB_PAT`, basta con permisos de solo lectura) para el modo de inferencia en vivo.
- Almacenamiento: reservar varios GB si se quieren conservar los `train.txt` de todas las subcarpetas para reentrenar.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Metrica clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `anshy/classifs` — quality | Calidad de PR 0-10 | fastText dim=64 | no disponible | Prec. 74,17% / recall 12,99% (regla ≥6) | no disponible | HuggingFace |
| `anshy/classifs` — multilingual | Contenido no ingles 0-10 | fastText dim=128 | no disponible | Prec. 96,30% / recall 98,73% | no disponible | HuggingFace |
| `anshy/classifs` — research_novelty | Novedad investigadora 0-10 | fastText dim=64 | no disponible | Recall ≈0 (regla ≥6) | no disponible | HuggingFace |
| `anshy/classifs` — tags | Multietiqueta, 424 clases | fastText | no disponible | no disponible | no disponible | HuggingFace |
| Jev (`typesafe/jev-1.13`) | Anotador origen de las etiquetas | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks de alternativas comparables (clasificadores de PR, modelos de triaje de código) en la información proporcionada.

## Limitaciones y advertencias

- `quality` es un filtro de altísima precisión y recall muy bajo: pierde en torno al 87% de los PRs con calidad ≥6. No debe usarse como puntuador general de calidad.
- El propio autor documenta que `quality` dio predicciones casi idénticas (4,4-5,3) a PRs reales de ML e investigación de alto nivel (por ejemplo, `x-transformers` e `imagen-pytorch` de lucidrains) que a PRs triviales de repositorios personales: no es sensible a la profundidad técnica real.
- Bajar el umbral de decisión a ≥5 empeora el comportamiento (exactitud del 37%), porque la mayor parte de los PRs reales ya cae por encima de ese valor.
- Aumentar capacidad o datos no mejora `quality`: se probaron variantes de 2-4x capacidad, conjuntos rebalanceados y un corpus combinado 1,55x mayor, todas planas o ligeramente peores. Es un techo conocido, no un bug.
- `research_novelty` tiene recall aproximadamente 0 con la regla ≥6 y el autor lo marca explícitamente con un aviso. Su tanda de entrenamiento tiene un desbalance extremo (297 positivos de 96.634 en train; 35 de 10.772 en validación), lo que limita gravemente el aprendizaje de la clase positiva.
- `tags` es un único modelo multietiqueta sobre 424 clases, no 424 clasificadores binarios; el umbral por defecto es 0,5 y su calibración no está documentada en la información disponible.
- Sesgo de procedencia: las etiquetas se destilaron de anotaciones de Jev sobre PRs de GitHub Archive, por lo que heredan los sesgos de ese corpus y de ese anotador. No se documenta composición demográfica ni de lenguajes de programación.
- Los clasificadores de escala 0-10 se evalúan con reglas de decisión internas que no coinciden con el uso que haga el integrador, por lo que las métricas publicadas pueden no trasladarse a otros umbrales.
- Requisito duro de entorno: `numpy<2` y `fasttext==0.9.3`. Ignorarlo produce probabilidades corruptas de forma silenciosa en `predict()` por lotes.
- Licencia no disponible: no está claro si se permite uso comercial. Hay que contactar con el autor antes de integrarlo en producción.
- No se declaran idiomas soportados ni limitaciones de contexto, al no ser un modelo con ventana de contexto.
- El acceso en vivo a la API de GitHub requiere token propio y está sujeto a los límites de peticiones de GitHub.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la clasificación, cuantificado en las tablas de métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anshy/classifs
- Perfil del autor y datasets: https://huggingface.co/anshy/datasets
- Modelo anotador de origen (Jev): https://huggingface.co/typesafe/jev-1.13
- fastText (librería): https://fasttext.cc/
- Repositorio de fastText: https://github.com/facebookresearch/fastText
- GitHub Archive (fuente de los PRs minados): https://www.gharchive.org/
