# jwcwn/zl-mini-body-5

## Resumen

zl-mini-body-5 es un modelo de clasificación de texto publicado por el usuario jwcwn en Hugging Face, concebido como "body" (cuerpo de pesos) para Zils, un sistema asociado al subnet 127 de Bittensor. El modelo parte de un "soup" (mezcla de pesos) de la ronda d3-mini-2026-11-12, reconstruido a partir de dos modelos base: qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3. Su función no es la generación de texto libre, sino la decisión calibrada sobre ítems en formato examen, es decir, emitir una distribución de probabilidad sobre opciones de respuesta.

El modelo tiene 4.539.265.536 parámetros en formato bf16 safetensors (aproximadamente 9,1 GB de repositorio) y está etiquetado con la arquitectura qwen3_5 en Hugging Face, aunque requiere código personalizado (custom_code) para su carga. Se distribuye bajo licencia Apache-2.0 y declara únicamente el idioma inglés. Su relevancia radica en el enfoque de calibración: incorpora una pérdida Brier y un anclaje KL al modelo de partida, lo que lo orienta a producir probabilidades bien calibradas en lugar de simples etiquetas.

La información pública disponible es muy limitada: cero descargas, cero likes, sin benchmarks publicados y con una model card breve que describe el proceso de construcción pero no detalla la arquitectura interna ni los resultados de evaluación. Esta ficha refleja exclusivamente los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag de Hugging Face); requiere custom_code; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se presenta como un "soup body" para Zils: los pesos se reconstruyeron mediante `zils.soup.build` a partir de dos modelos base (qhoenix/zils-mini-decision-l13_avg678 en el commit 091c6eb y joamCriff123/zils-mini-sx3 en el commit c9432ad), partiendo del soup oficial de la ronda d3-mini-2026-11-12 (sha256 9a21f188…). El tag de arquitectura es qwen3_5, pero no se detalla la estructura interna (número de capas, dimensión oculta, mecanismo de atención ni contexto máximo).

El ajuste se realizó con LoRA de rango 32, tasa de aprendizaje 4e-5 y una época, optimizando una entropía cruzada suave combinada con pérdida Brier y un anclaje KL de peso 0,3 respecto al modelo de partida. El conjunto de datos comprende unos 15.900 ítems en formato examen: aproximadamente 9.800 son resultados reales del mundo recopilados con `zils.current` a partir de fuentes abiertas CC0 y CC-BY-SA (reversiones de ediciones en Wikipedia y Wikidata, resultados de AfD y AfC, categorías de arXiv), etiquetados según lo que ocurrió realmente; el resto son ítems aritméticos verificados por programa (preguntas sembradas desde el split de entrenamiento de GSM8K, redactadas por gpt-oss-20b y con etiquetas calculadas ejecutando código) e ítems previos de otras familias conocidas escritos por modelos de pesos abiertos. Los ítems se deduplicaron frente a los datos de evaluación reservados por fila de origen, huellas normalizadas, orden de opciones y similitud de embeddings.

## Capacidades

- Clasificación de texto con salida de probabilidad calibrada sobre opciones de respuesta en formato examen.
- Decisión sobre ítems de opción múltiple, orientada a la calibración (pérdida Brier y anclaje KL) más que a la mera precisión de etiqueta.
- Evaluación de ítems aritméticos verificables, entrenados con etiquetas calculadas por ejecución de código.
- Modelado de resultados del mundo real (reversiones de ediciones, resultados de discusiones de borrado, categorías de arXiv) como señal de decisión.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de ítems de opción múltiple en pipelines de benchmarking: el modelo emite una distribución sobre las opciones, lo que permite medir calibración (Brier score) además de acierto en conjuntos de preguntas tipo examen.
- Clasificación de resultados de procesos colaborativos: dado un ítem que describe una edición de Wikipedia o Wikidata, estimar la probabilidad de reversión, aprovechando que el entrenamiento usó resultados reales de reversiones como etiqueta.
- Predicción de resultados de discusiones de borrado (AfD) y de creación de artículos (AfC): el modelo se entrenó con desenlaces reales de estos procesos, por lo que puede emplearse como clasificador de desenlace en herramientas de curación de contenido.
- Clasificación de categorías de arXiv: usar el modelo para estimar la categoría o el desenlace asociado a un ítem descrito en texto, en tareas de organización de literatura científica.
- Verificación aritmética como clasificador de corrección: al haberse entrenado con ítems aritméticos con etiquetas verificadas por ejecución, puede emplearse para puntuar la plausibilidad de una respuesta numérica en un pipeline de control de calidad.
- Componente de decisión en un sistema de enrutamiento o ensemble: al ser un "body" de Zils, encaja como cabeza de decisión calibrada dentro de un sistema mayor que agregue señales de varios modelos.
- Filtrado y priorización de candidatos en moderación asistida: usar la probabilidad calibrada para ordenar ítems por riesgo antes de la revisión humana, en lugar de aplicar un umbral binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más memoria para activaciones y overhead del runtime; en la práctica, se recomienda al menos 12-16 GB de VRAM para bf16.
- Cuantización: no se han publicado versiones GGUF ni cuantizadas; al requerir custom_code, la conversión a otros formatos no está garantizada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 4.500 millones de parámetros en bf16 encaja en GPUs consumer de gama alta con 16 GB o más (por ejemplo, RTX 4080/4090), aunque no se confirma compatibilidad.
- Despliegue: no se documentan opciones soportadas (vLLM, llama.cpp, Ollama, TGI). El tag custom_code implica que la carga requiere el código del repositorio y no es directamente compatible con runtimes genéricos sin adaptación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Los únicos modelos mencionados son los base del propio modelo (qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3), que no son alternativas independientes sino sus antecesores en el proceso de mezcla y ajuste.

## Limitaciones y advertencias

- Información pública muy escasa: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluación independiente publicada.
- Sesgos conocidos: no documentados. El entrenamiento con datos de Wikipedia, Wikidata y arXiv puede heredar los sesgos de cobertura y de sesgo de selección de esas fuentes.
- Riesgo de alucinación: el modelo está orientado a clasificación y decisión, no a generación libre; aun así, no se documenta su comportamiento fuera del formato examen para el que fue entrenado.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo depende de código personalizado (custom_code) cuyo mantenimiento y compatibilidad no están garantizados.
- Caveat de producción: requiere `trust_remote_code` o el código del repositorio para cargarse; la integración con servidores de inferencia estándar puede requerir trabajo adicional.
- Fecha de creación declarada en 2026-11-13, lo que sitúa el modelo en un contexto temporal que conviene verificar antes de adoptarlo.
- La model card describe el proceso de construcción pero no especifica la arquitectura interna, el contexto máximo ni los datos de evaluación reservados, lo que impide auditar su calidad de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwcwn/zl-mini-body-5
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base 2: https://huggingface.co/joamCriff123/zils-mini-sx3
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
