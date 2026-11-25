# goncaloecgomes/beitscorepp

## Resumen

BEiTScore++ es una métrica de evaluación de subtítulos de imágenes (image captioning) sin referencia, es decir, que puntúa la calidad de un subtítulo comparándolo con la imagen y no con un texto de referencia. Devuelve una puntuación en el intervalo [0, 1] que corresponde a la mediana prevista de valoración humana, junto con un intervalo de confianza del 90 % para dicha valoración. Lo desarrollan Gonçalo Gomes, Bruno Martins y Chrysoula Zerva, y se presenta en el paper "BEiTScore++: Reference-free Image Captioning Evaluation with BEiT-3 and Conformalized Quantile Regression" (Findings of EMNLP 2026).

Técnicamente es un cross-encoder basado en BEiT-3 (patch 16, resolución 480 x 480) con una cabeza de cuantiles de 11 salidas sigmoideas encadenadas para evitar cruces entre cuantiles, entrenada con una pérdida de intervalo centrado. Sobre esa base se aplica una calibración conformal post-hoc que fija la escala ω y el sesgo β del intervalo mediante una cota superior de confianza con δ = 0,05 dentro de K = 63 clústeres de imágenes.

Su relevancia radica en que aborda un problema clásico de las métricas automáticas de captioning: la ausencia de incertidumbre calibrada. Al proporcionar intervalos con garantía de cobertura, permite filtrar evaluaciones poco fiables y detectar casos fuera de distribución, algo especialmente útil en pipelines de evaluación de modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder BEiT-3 (patch 16, 480 x 480) con cabeza de cuantiles de 11 salidas sigmoideas encadenadas |
| Parametros totales | no disponible (se distribuyen dos variantes: `base` y `large`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada imagen + subtítulo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (solo ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`base/model.safetensors`, `large/model.safetensors`) |

## Arquitectura y entrenamiento

BEiTScore++ parte de BEiT-3 como cross-encoder multimodal: la imagen se procesa con parches de 16 x 16 a resolución 480 x 480 y se combina con el texto del subtítulo para producir una representación conjunta. Sobre esa representación se aplica una cabeza de regresión por cuantiles con 11 salidas sigmoideas encadenadas, de modo que los cuantiles predichos son monótonos por construcción y nunca se cruzan. El entrenamiento emplea una pérdida de intervalo centrado (centered interval loss) orientada a producir intervalos de predicción, no solo una estimación puntual.

Sobre el modelo entrenado se aplica una calibración conformal post-hoc de regresión cuantílica (CQR): se estiman la escala ω y el sesgo β del intervalo mediante una cota superior de confianza con δ = 0,05, calculada dentro de cada uno de K = 63 clústeres de imágenes, usando el tamaño de cada clúster como n y conservando el par más conservador. La calibración se distribuye en `calibration.json` junto a los pesos. Las valoraciones humanas de todos los conjuntos de entrenamiento y evaluación se reescalan a [0, 1] antes del entrenamiento, de modo que las puntuaciones solo son comparables entre conjuntos bajo ese mapeo. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que la calibración se realiza sobre la partición de validación de una mezcla de EvalMuse-40K, Nebula, Polaris y VICR.

## Capacidades

- Evaluación sin referencia de subtítulos de imágenes: dada una imagen y un subtítulo, devuelve una puntuación de calidad en [0, 1] como mediana prevista de la valoración humana.
- Estimación de incertidumbre: devuelve un intervalo del 90 % (`low`, `high`) calibrado conformalmente junto a la puntuación puntual (`median`).
- Modo de intervalos sin calibrar: con `calibration=None` devuelve los intervalos crudos del modelo, útil para análisis.
- Dos variantes de tamaño (`base` y `large`) seleccionables mediante `BEiTScorePP.from_pretrained("base" | "large")`.
- Soporte de evaluación por lotes: el método `score` acepta listas de imágenes y de subtítulos.
- No soporta tool calling, agentes, ni generación de texto: es una métrica de evaluación, no un modelo generativo.
- Capacidad multilingüe: limitada al inglés.

## Casos de uso

- Evaluación automática de sistemas de captioning: puntuar las salidas de un modelo de image captioning contra las imágenes originales sin necesidad de referencias humanas, usando la mediana como métrica principal y el intervalo para descartar predicciones poco fiables.
- Control de calidad en datasets de imagen-texto: filtrar pares imagen-subtítulo de baja calidad en la curación de corpus para entrenamiento multimodal, priorizando aquellos con puntuación alta e intervalo estrecho.
- Detección de casos fuera de distribución: el intervalo calibrado se ensancha cuando la imagen o el subtítulo difieren de la distribución de calibración, lo que permite marcar automáticamente muestras para revisión humana.
- Comparación de modelos generativos multimodales: usar la correlación con valoraciones humanas y la cobertura del intervalo como criterios complementarios a BLEU, CIDEr o SPICE en la selección de modelos.
- Investigación en métricas con incertidumbre: servir como línea base reproducible para trabajos sobre calibración conformal aplicada a evaluación multimodal, con código y calibración publicados.
- Auditoría de sistemas de accesibilidad: evaluar descripciones automáticas de imágenes (por ejemplo, alt-text generado) y señalar aquellas con alta incertidumbre para revisión manual antes de publicarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la correlación con valoraciones humanas, la cobertura, la nitidez (sharpness) y la métrica UPS sobre VICR, Polaris, Nebula, Flickr8K-Expert y Composite se reportan en el paper, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 3,6 GB e incluye pesos de las variantes `base` y `large`; la variante `large` en precisión completa requiere presumiblemente más memoria que la `base`, pero no se publican cifras.
- GPU recomendadas: no disponible en la información proporcionada. Al tratarse de un cross-encoder BEiT-3, se espera que quepa en GPU de consumo con memoria suficiente, aunque no se confirma.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; depende del tamaño de la variante y de la precisión usada.
- Opciones de despliegue: el paquete Python `beitscore` (instalable con `pip install -e .` desde el repositorio de código), con descarga de pesos mediante `scripts/download_release.py models`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| BEiTScore++ | Cross-encoder BEiT-3 con cuantiles + calibración conformal | no disponible (variantes base y large) | no disponible | MIT | Devuelve intervalo calibrado del 90 % |
| BEiTScore | Cross-encoder BEiT-3 | no disponible | no disponible | no disponible | Métrica predecesora sin intervalos calibrados; mismo autor |
| CLIPScore | Similitud imagen-texto basada en CLIP | no disponible | no disponible | no disponible | Métrica sin referencia ampliamente usada; sin intervalos de incertidumbre |
| no disponible | — | — | — | — | No se dispone de más comparativas en la información proporcionada |

## Limitaciones y advertencias

- Solo admite subtítulos en inglés.
- Entrenado con valoraciones humanas de subtítulos cortos; las descripciones largas y detalladas quedan fuera de distribución.
- El intervalo refleja el desacuerdo con las valoraciones humanas vistas en entrenamiento, no todo tipo de error del modelo.
- La garantía de cobertura (miscobertura esperada ≤ 10 % con probabilidad ≥ 1 − δ) solo se cumple para datos distribuidos como el conjunto de calibración (validación de la mezcla EvalMuse-40K, Nebula, Polaris y VICR); en datos fuera de distribución la cobertura cae.
- La calibración publicada aplica la cota a cada β candidato por separado; para que la garantía se mantenga tras la búsqueda hay que usar `calibrate.py --strict`.
- Las puntuaciones solo son comparables entre conjuntos bajo el mapeo de valoraciones humanas a [0, 1] usado en entrenamiento y evaluación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones mal calibradas en dominios alejados del de calibración.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los conjuntos de datos subyacentes (EvalMuse-40K, Nebula, Polaris, VICR, Flickr8K-Expert) para producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopción aún muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/goncaloecgomes/beitscorepp
- Código: https://github.com/gecgomes/Uncertainty_BEiTScore_pp
- Paper BEiTScore++ (Findings of EMNLP 2026): https://aclanthology.org/ (referencia en la model card, sin URL directa disponible)
- Paper BEiTScore (arXiv): https://arxiv.org/abs/2605.21728
