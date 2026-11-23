# quorumbio/esm2-protein-subcellular-localization-signal-peptide

## Resumen

`quorumbio/esm2-protein-subcellular-localization-signal-peptide` es un modelo de clasificación de proteinas derivado de ESM-2 (versión de 150M de parámetros, `esm2_t30_150M_UR50D`), desarrollado por quorumbio. Resuelve dos tareas concretas de anotación funcional sobre secuencias de aminoácidos: predecir la localización subcelular de una proteína entre 10 compartimentos (etiquetado multi-etiqueta, ya que una proteína puede residir en más de uno) y estimar la presencia de un péptido señal en el extremo N-terminal.

El modelo parte de los pesos preentrenados de ESM-2 y se afina sobre UniProtKB/Swiss-Prot con una partición reducida por homología, lo que evita la fuga de información entre proteínas similares y hace que las métricas publicadas sean más representativas de generalización real. Con 148,1 millones de parámetros y un repositorio de 1,3 GB, está pensado para integrarse en pipelines de bioinformática ligeros, no para generación de texto libre.

Su relevancia práctica está en la separación clara de rendimiento por clase: la detección de péptido señal es muy sólida (AUROC 0,994, MCC 0,956), mientras que la localización funciona bien en compartimentos frecuentes (núcleo, citoplasma, extracelular, plástido) y es débil en Golgi, lisosoma/vacuola y peroxisoma. La model card lo declara explícitamente, lo que permite usar el modelo con expectativas calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ESM-2 (fine-tuned para clasificación multi-cabeza) |
| Parametros totales | 148.146.548 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como límite declarado; el pipeline trunca secuencias de más de 1000 residuos conservando los primeros 600 y los últimos 400 |
| Tipos de cuantizacion | fp32 (ONNX, 591,7 MB) e int8 (ONNX, 149,9 MB) |
| Idiomas soportados | no aplica (entrada de secuencias de aminoácidos, no texto natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ESM-2, en concreto la variante `esm2_t30_150M_UR50D` (30 capas, 150M de parámetros), preentrenada de forma auto-supervisada sobre secuencias de proteínas. Sobre esa base, quorumbio añade dos cabezas de clasificación: una de 10 salidas con activación sigmoide para localización subcelular multi-etiqueta (`loc_logits`) y otra de una salida con sigmoide para presencia de péptido señal (`sp_logit`). No se trata de un modelo generativo: no produce texto ni secuencias, solo logits de clasificación.

El ajuste fino se realizó sobre UniProtKB/Swiss-Prot con una partición por similitud de secuencia (homology-partitioned split), un detalle metodológico importante porque evita que proteínas casi idénticas entre entrenamiento y test inflen las métricas. El conjunto de test tiene 2336 proteínas, de las cuales 450 son positivas para péptido señal. Los umbrales por clase se eligieron únicamente sobre validación. La model card reporta además variación entre semillas (seeds 13, 1 y 2) para dar una idea de la estabilidad de cada métrica.

## Capacidades

- Clasificación de localización subcelular multi-etiqueta en 10 clases: núcleo, citoplasma, extracelular, mitocondria, membrana celular, retículo endoplasmático, plástido, aparato de Golgi, lisosoma/vacuola y peroxisoma.
- Predicción binaria de presencia de péptido señal N-terminal con probabilidad calibrada por umbral de validación.
- Salida de probabilidades por clase (sigmoide), no solo etiquetas duras, lo que permite umbrales ajustables por el usuario.
- Manejo de secuencias largas mediante truncado interno (primeros 600 + últimos 400 residuos si supera 1000).
- Inferencia en PyTorch (transformers) y en ONNX Runtime, con variante int8 para despliegue ligero.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües de texto: es un clasificador de proteínas.

## Casos de uso

- Anotación funcional a escala de genoma: dado un proteoma recién secuenciado, clasificar cada ORF por localización probable y filtrar candidatos antes de validación experimental, usando la salida probabilística para priorizar.
- Detección de péptidos señal en pipelines de secreción: identificar proteínas con probable tránsito por la vía secretora (AUROC 0,994) para decidir qué candidatos pasar a ensayos de expresión recombinante.
- Triaje en biología estructural: descartar o agrupar proteínas por compartimento esperado antes de asignar recursos de cristalografía o criomicroscopía.
- Enriquecimiento de bases de datos internas: añadir etiquetas de localización y péptido señal a catálogos de proteínas propias donde la anotación manual de Swiss-Prot no llega.
- Filtrado en diseño de proteínas: comprobar que variantes diseñadas conservan la señal de localización esperada (por ejemplo, que una proteína terapéutica mantenga la señal de secreción).
- Preprocesado para modelos mayores: usar este clasificador de 150M como primera etapa barata que descarte secuencias irrelevantes antes de pasar a modelos de proteínas de mayor tamaño o a análisis de estructura.
- Docencia y prototipado bioinformático: ejemplo ligero y con licencia Apache 2.0 para montar demos de clasificación de proteínas en notebooks o servicios web pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de Swiss-Prot con partición por homología (2336 proteínas, 450 positivas de péptido señal). Métricas no verificadas de forma independiente.

| Tarea / clase | Métrica | Valor |
|---|---|---|
| Péptido señal | AUROC | 0,994 |
| Péptido señal | MCC (umbral 0,9) | 0,956 |
| Localización (macro) | AUROC | 0,926 |
| Localización (macro) | F1 (umbrales de validación) | 0,650 |
| Núcleo (716 positivos) | AUROC / AP / F1 | 0,929 / 0,874 / 0,785 |
| Citoplasma (842) | AUROC / AP / F1 | 0,899 / 0,820 / 0,779 |
| Extracelular (351) | AUROC / AP / F1 | 0,977 / 0,892 / 0,861 |
| Mitocondria (221) | AUROC / AP / F1 | 0,931 / 0,773 / 0,737 |
| Membrana celular (295) | AUROC / AP / F1 | 0,924 / 0,728 / 0,693 |
| Retículo endoplasmático (192) | AUROC / AP / F1 | 0,932 / 0,619 / 0,630 |
| Plástido (84) | AUROC / AP / F1 | 0,980 / 0,884 / 0,883 |
| Golgi (78) | AUROC / AP / F1 | 0,885 / 0,381 / 0,342 |
| Lisosoma/Vacuola (88) | AUROC / AP / F1 | 0,879 / 0,367 / 0,361 |
| Peroxisoma (35) | AUROC / AP / F1 | 0,922 / 0,405 / 0,432 |

Variación entre semillas (media ± desviación típica sobre 3 semillas):

| Métrica | Media ± SD | Rango |
|---|---|---|
| AUROC macro localización | 0,927 ± 0,001 | 0,926–0,927 |
| F1 macro localización | 0,645 ± 0,009 | 0,635–0,650 |
| AUROC péptido señal | 0,993 ± 0,001 | 0,992–0,994 |
| MCC péptido señal | 0,956 ± 0,000 | 0,956–0,956 |
| F1 Golgi | 0,376 ± 0,030 | 0,342–0,400 |
| F1 Lisosoma/Vacuola | 0,354 ± 0,010 | 0,343–0,361 |
| F1 Peroxisoma | 0,337 ± 0,139 | 0,178–0,432 |

Comparación interna con la variante de 35M del mismo recetario: el 150M mejora el F1 en todas las clases, con la mayor ganancia en retículo endoplasmático (0,630 frente a 0,521) y peroxisoma (0,432 frente a 0,296).

## Requisitos de hardware

- Inferencia en fp32: el modelo completo ocupa unos 592 MB en ONNX; en PyTorch, con pesos safetensors, el repositorio total es de 1,3 GB (incluye ambas variantes ONNX). Cabe holgadamente en cualquier GPU consumer.
- Inferencia en int8: 149,9 MB, apto para CPU y para GPUs de gama baja o integradas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4090, T4, L4 o A100 funcionan sin problema. Para lotes grandes, una GPU con más memoria mejora el throughput.
- Cabe en consumer GPU: sí, en todas las gamas actuales; también en CPU con la variante int8.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (fp32 o int8), y contenedores ligeros con FastAPI o similares. No se menciona soporte específico de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos y no aplican a este clasificador.
- Latencia y throughput: no disponibles de forma cuantitativa. La model card indica que la variante int8 es "más pequeña y más rápida" que la fp32, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quorumbio/esm2-...-signal-peptide (este) | 148,1M | truncado a 1000 residuos (600+400) | Localización 10 clases + péptido señal | Apache 2.0 | Hugging Face, ONNX |
| Variante 35M del mismo recetario | ~35M | no disponible | Misma tarea | no disponible | Referenciada en la model card |
| ESM-2 base `esm2_t30_150M_UR50D` | 150M | no disponible | Embeddings de proteínas (no clasificación directa) | no disponible en la información | Hugging Face |
| Herramientas clásicas tipo SignalP / TargetP | no disponible | no disponible | Péptido señal y localización | no disponible | No referenciadas en la información |

No se dispone de datos de benchmarks de terceros ni de comparaciones directas con SignalP, TargetP u otros predictores de localización en la información proporcionada, por lo que la comparativa cuantitativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Localización poco fiable en Golgi, lisosoma/vacuola y peroxisoma: AP entre 0,367 y 0,405 y F1 entre 0,342 y 0,432. La model card recomienda explícitamente no confiar en esas tres clases.
- Alta varianza en clases raras: el F1 de peroxisoma varía entre 0,178 y 0,432 según la semilla, porque el umbral se elige sobre pocos positivos de validación.
- El AUROC puede resultar engañoso en clases raras; la model card recomienda usar AP y F1 como métricas de referencia.
- Truncado agresivo en secuencias largas: se conservan solo los primeros 600 y los últimos 400 residuos, por lo que señales internas en proteínas de más de 1000 residuos pueden perderse.
- La variante int8 no es idéntica a fp32: diferencia máxima de probabilidad de 0,100 y coincidencia del 99,9% en decisiones de clase, verificada solo sobre 150 secuencias de hasta 500 residuos, no sobre el test completo.
- Métricas no verificadas de forma independiente (`verified: false` en el model-index); son resultados declarados por el autor.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí hay riesgo de falsos positivos y negativos en clases poco representadas.
- Sesgos de datos: el entrenamiento usa Swiss-Prot, sesgado hacia proteínas bien estudiadas de organismos modelo; el rendimiento en organismos poco representados puede ser inferior.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de Swiss-Prot y de los pesos base de ESM-2 para el despliegue en producción.
- No es un modelo generativo ni conversacional: no debe esperarse de él tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quorumbio/esm2-protein-subcellular-localization-signal-peptide
- Modelo base: https://huggingface.co/facebook/esm2_t30_150M_UR50D
- Dataset: https://huggingface.co/datasets/quorumbio/swissprot-subcellular-localization-signal-peptide
- UniProtKB/Swiss-Prot: https://www.uniprot.org/
- Repositorio de ESM (Meta): https://github.com/facebookresearch/esm
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
