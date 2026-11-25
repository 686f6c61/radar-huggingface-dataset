# goncaloecgomes/beitscore

## Resumen

BEiTScore es una métrica de evaluación sin referencia (reference-free) para leyendas de imágenes (image captions). Lo desarrolla Gonçalo Gomes (con Bruno Martins y Chrysoula Zerva) y se publica bajo licencia MIT. No es un modelo generativo al uso, sino un cross-encoder basado en BEiT-3 (patch 16, resolución 480 x 480) inicializado desde el checkpoint de VQA de BEiT-3, que devuelve una única puntuación de calidad en el rango [0, 1] para un par imagen-leyenda.

El modelo resuelve el problema de evaluar automáticamente la calidad de una leyenda generada sin disponer de una referencia humana. Se entrena en dos etapas: la primera lo entrena para separar leyendas correctas de incorrectas (corrupciones a nivel de palabra, errores escritos por un LLM y leyendas recuperadas de otras imágenes); la segunda regresa las valoraciones humanas.

Es relevante para quienes entrenan o evalúan sistemas de image captioning y necesitan una métrica automática correlacionada con el juicio humano. Se distribuye en dos variantes (base y large) en formato safetensors, con un tokenizador SentencePiece propio de BEiT-3, y requiere el paquete `beitscore` del repositorio de código para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder BEiT-3 (patch 16, 480 x 480), inicializado desde el checkpoint de VQA de BEiT-3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (solo inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`base/model.safetensors`, `large/model.safetensors`) + `config.json` por variante; tokenizador `beit3.spm` (SentencePiece) |

## Arquitectura y entrenamiento

BEiTScore es un cross-encoder multimodal construido sobre BEiT-3, con parches de 16 x 16 y entrada de imagen a 480 x 480. Se inicializa desde el checkpoint de VQA de BEiT-3 y se ajusta para producir una puntuación escalar de calidad en [0, 1] a partir de un par imagen-leyenda. El tokenizador es el SentencePiece de BEiT-3 (`beit3.spm`), compartido por BEiTScore y BEiTScore++.

El entrenamiento consta de dos etapas. La etapa 1 entrena al modelo para discriminar entre leyendas correctas e incorrectas, usando corrupciones a nivel de palabra, errores generados por un LLM y leyendas recuperadas de otras imágenes como ejemplos negativos. La etapa 2 ajusta el modelo para regresar las valoraciones humanas, de modo que la salida final correlacione con el juicio humano. El trabajo asociado es «BEiTScore: Reference-free Image Captioning Evaluation with an Efficient Cross-Encoder Model» (arXiv:2605.21728), y la extensión BEiTScore++ se publica en Findings de EMNLP 2026. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Evaluación de leyendas de imágenes sin referencia: devuelve una puntuación de calidad en [0, 1] para un par imagen-leyenda.
- Detección de leyendas incorrectas: la etapa 1 lo entrena para separar leyendas correctas de incorrectas (corrupciones, errores de LLM, leyendas de otras imágenes).
- Correlación con valoraciones humanas: la etapa 2 regresa las puntuaciones humanas.
- Procesamiento multimodal imagen-texto mediante cross-encoder BEiT-3.
- Soporte de dos variantes de tamaño: BEiTScore-B (base) y BEiTScore-L (large).
- Uso en inglés únicamente.
- No dispone de modo de incertidumbre en esta versión; esa funcionalidad corresponde a BEiTScore++.
- No es un modelo generativo: no produce texto ni leyendas, solo puntuaciones.

## Casos de uso

- Evaluación automática de sistemas de image captioning: puntuar las leyendas generadas por un modelo propio con BEiTScore para estimar su calidad sin anotaciones de referencia, usando `metric.score(imagenes, leyendas)`.
- Filtrado de datos de entrenamiento: descartar pares imagen-leyenda de baja calidad en un corpus antes de entrenar un modelo generativo, aprovechando la capacidad de detectar leyendas incorrectas de la etapa 1.
- Comparación de variantes de modelos: usar la puntuación como métrica objetiva para comparar checkpoints o configuraciones de un sistema de captioning durante el desarrollo.
- Control de calidad en pipelines de accesibilidad: verificar que las descripciones alternativas generadas para imágenes cumplen un umbral de calidad antes de publicarlas.
- Detección de leyendas erróneas o alucinadas: emplear la etapa 1 para identificar leyendas que describen objetos o acciones ausentes en la imagen.
- Investigación en métricas de evaluación: usar BEiTScore-B o BEiTScore-L como línea base en estudios sobre evaluación sin referencia de captioning, dado que el paper reporta resultados en FOIL-it, nocaps-FOIL, VALSE, SugarCrepe, Winoground y LongCapVLCP.

## Benchmarks y rendimiento

Correlación Kendall τc (x100) con valoraciones humanas, según la model card:

| Modelo | VICR | Polaris | Nebula | Flickr8K-Expert | Composite |
|---|---|---|---|---|---|
| BEiTScore-B | 78.2 | 61.5 | 55.3 | 59.4 | 58.9 |
| BEiTScore-L | 78.8 | 63.2 | 56.7 | 60.2 | 59.5 |

La model card indica que los resultados de detección de leyendas incorrectas (FOIL-it, nocaps-FOIL, VALSE, SugarCrepe, Winoground, LongCapVLCP) se reportan en el paper. No se han publicado en la información disponible resultados de benchmarks generativos tipo MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 3.6 GB e incluye los pesos de ambas variantes (base y large), por lo que cada variante individual requiere menos que ese total.
- GPU recomendadas: no disponible. Al ser un cross-encoder BEiT-3, se espera que quepa en GPU de consumo, pero no se confirma en la información disponible.
- Cabe en consumer GPU: no confirmado en la información disponible.
- Opciones de despliegue: paquete Python `beitscore` (instalación con `pip install -e .` desde el repositorio `Uncertainty_BEiTScore_pp`), con descarga de pesos mediante `scripts/download_release.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| BEiTScore | Métrica reference-free de captioning (cross-encoder BEiT-3) | en | MIT | Hugging Face + repo de código |
| BEiTScore++ | Métrica reference-free con estimación de incertidumbre (conformalized quantile regression) | en | no disponible en la información | Paper en Findings EMNLP 2026 |
| Métricas clásicas (BLEU, METEOR, CIDEr, SPICE) | Métricas con referencia basadas en n-gramas o grafos | multi (según implementación) | varias | disponibles en librerías estándar |

No se dispone en la información proporcionada de comparativas numéricas directas con otras métricas reference-free (por ejemplo, CLIPScore o PAC-S) ni de sus parámetros, contexto o rendimiento. Esos datos figuran como «no disponible».

## Limitaciones y advertencias

- Solo admite leyendas en inglés.
- Devuelve una única puntuación sin estimación de incertidumbre; esa funcionalidad corresponde a BEiTScore++.
- La etapa 1 no puede reproducirse exactamente, ya que parte de las imágenes provenían de URLs que pueden haber dejado de resolver.
- No es un modelo generativo: no produce texto, por lo que no debe usarse para generar leyendas.
- Riesgo de sesgo heredado de los datos de entrenamiento y de BEiT-3, no cuantificado en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede asignar puntuaciones altas a leyendas plausibles pero incorrectas; el paper reporta detección de leyendas incorrectas como métrica adicional.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los pesos base de BEiT-3 de los que se inicializa.
- Requiere el paquete `beitscore` y la configuración de rutas (`configs/paths.sh`) para su uso; no es un pipeline estándar de Transformers.

## Enlaces

- Hugging Face: https://huggingface.co/goncaloecgomes/beitscore
- Paper BEiTScore: arXiv:2605.21728
- Paper BEiTScore++: Findings of EMNLP 2026 (páginas 46192–46226)
- Código: https://github.com/gecgomes/Uncertainty_BEiTScore_pp
