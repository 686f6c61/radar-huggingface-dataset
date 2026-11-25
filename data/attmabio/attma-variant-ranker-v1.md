# AttmaBio/attma-variant-ranker-v1

## Resumen

Attma Variant Ranker v1 es un modelo de clasificacion tabular orientado a la priorizacion de variantes geneticas en el contexto de la genomica clinica y las enfermedades raras. Lo desarrolla AttmaBio y se distribuye en formato ONNX como un ensemble de arboles LightGBM convertido desde su pipeline original, con restricciones de monotonicidad que garantizan que el orden de priorizacion respete la direccion esperada de cada caracteristica clinica. Su funcion no es clasificar variantes de forma autonoma, sino producir una puntuacion de ordenacion entre 0 y 100 que ayuda a un motor determinista de clasificacion ACMG/AMP a priorizar candidatos dentro de un caso.

El modelo trabaja sobre anotaciones de variantes en GRCh38 e integra senales como la severidad de la consecuencia, los puntos ACMG sin ClinVar, las frecuencias alelicas de gnomAD y de poblacion maxima, el likelihood ratio de ESM, la puntuacion fenotipica de PhenoGenius y el indicador de perdida de funcion del gen. Su relevancia actual reside en que ofrece una capa de ranking auditable y reproducible, con metricas de calibracion explicitas, en un dominio donde la trazabilidad de las decisiones es tan importante como el rendimiento predictivo.

La model card declara explicitamente que el modelo es de uso exclusivo en investigacion y que nunca modifica ni sustituye el motor determinista de clasificacion ACMG/AMP de Attma. El repositorio es de tamano practicamente nulo (0.0 GB), lo que es coherente con un ensemble de arboles exportado a ONNX y no con un modelo neuronal de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de arboles de decision LightGBM con restricciones de monotonicidad, exportado a ONNX |
| Parametros totales | no disponible (modelo tabular basado en arboles, no aplica el concepto de parametros neuronales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular por variante, no secuencia de texto) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es ONNX con pesos de arboles en el formato nativo de la exportacion |
| Idiomas soportados | no disponible (no procesa lenguaje natural; opera sobre caracteristicas numericas y categoricas de variantes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un ensemble de arboles de decision potenciado por gradiente (LightGBM) con restricciones de monotonicidad, convertido a ONNX para su despliegue. La restriccion de monotonicidad implica que el efecto de determinadas caracteristicas sobre la puntuacion final esta forzado a seguir una direccion clinicamente esperada (por ejemplo, mayor severidad de consecuencia no puede reducir la prioridad), lo que aporta auditabilidad y reduce comportamientos contraintuitivos. La entrada es un vector de caracteristicas tabulares por variante, entre las que se incluyen `consequence_severity`, `acmg_points_no_clinvar`, `log10_popmax_af`, `log10_gnomad_af`, `esm_llr`, `phenogenius_band_score`, `is_lof_gene`, `gnomad_observed`, `has_esm_llr`, `gene_pli`, `openspliceai_delta` y `vkb_signal`.

El entrenamiento se evaluo mediante validacion cruzada de 5 pliegues con separacion por gen (gene-disjoint), lo que evita que variantes del mismo gen aparezcan simultaneamente en entrenamiento y validacion, y con fuga cero de las etiquetas ClinVar PP5/BP6. La model card no detalla el numero de variantes de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de calibracion posteriores; esos datos figuran como no disponibles. La innovacion tecnica destacable es la combinacion de monotonicidad, separacion por gen en la validacion y calibracion explicita (Brier score y ECE reportados), junto con la exportacion a ONNX para inferencia portable.

## Capacidades

- Priorizacion de variantes geneticas: genera una puntuacion de ordenacion entre 0 y 100 por variante dentro de un caso clinico.
- Integracion de multiples senales genomicas: consecuencia funcional, frecuencias poblacionales, predicciones de patogenicidad (ESM), puntuaciones fenotipicas y senales de splice.
- Clasificacion tabular supervisada: pipeline `tabular-classification` sobre caracteristicas numericas y categoricas.
- Ranking con monotonicidad: el orden respeta restricciones de direccion clinicamente definidas.
- Calibracion de probabilidades: reporta Brier score y ECE, lo que permite usar las puntuaciones con cierta confianza en terminos probabilisticos.
- Inferencia portable via ONNX: ejecutable en entornos sin dependencias de frameworks de deep learning.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Triaje de variantes en paneles de enfermedades raras: el modelo puntua y ordena las variantes candidatas de un caso para que el geneticista clinico revise primero las de mayor prioridad, reduciendo el tiempo de analisis manual sobre listas extensas.
- Priorizacion en estudios de exoma completo: dado un caso con cientos o miles de variantes tras el filtrado, el ranker coloca las candidatas mas plausibles en las primeras posiciones, apoyandose en la senal combinada de frecuencia poblacional y severidad de consecuencia.
- Capa de ranking previa al motor ACMG/AMP: se usa como complemento de ordenacion antes de la clasificacion determinista, sin sustituirla, de modo que el flujo mantiene la trazabilidad regulatoria del motor original.
- Investigacion en genomica de enfermedades raras: permite comparar y reproducir ordenaciones de variantes entre cohortes con las mismas caracteristicas de entrada, gracias a la exportacion ONNX y a la calibracion reportada.
- Integracion en pipelines bioinformaticos: al ser un artefacto ONNX ligero, puede incorporarse en flujos automatizados de anotacion y priorizacion que se ejecutan en entornos de servidor sin GPU.
- Auditoria y validacion de modelos de priorizacion: las metricas de calibracion (ECE 0.01, Brier 0.0267) y las importancias TreeSHAP publicadas permiten usar el modelo como referencia en estudios de interpretabilidad y comparacion de rankers.
- Soporte a la revision de variantes de splice: incorpora la senal `openspliceai_delta` entre las caracteristicas de entrada, util en casos donde la evidencia de splicing es relevante.

## Benchmarks y rendimiento

Resultados reportados en la model card para validacion cruzada de 5 pliegues con separacion por gen y sin fuga de ClinVar PP5/BP6:

| Metrica | Attma Ranker v1 (ONNX) | Baseline solo ACMG |
|---|---:|---:|
| AUROC | 0.9939 | no disponible |
| AUPRC | 0.9954 | no disponible |
| Brier score | 0.0267 | no disponible |
| ECE (10 bins) | 0.01 | no disponible |
| Case Top-1 Recall (1 causal vs 40 background) | 0.94 | 0.94 |
| Case Top-5 Recall | 0.996 | 0.958 |
| Case Top-10 Recall | 1.0 | no disponible |

Importancia global de caracteristicas segun TreeSHAP:

| Caracteristica | Valor TreeSHAP |
|---|---:|
| `consequence_severity` | 1.9277 |
| `acmg_points_no_clinvar` | 1.4347 |
| `log10_popmax_af` | 1.1558 |
| `log10_gnomad_af` | 0.5023 |
| `esm_llr` | 0.3877 |
| `phenogenius_band_score` | 0.2817 |
| `is_lof_gene` | 0.1841 |
| `gnomad_observed` | 0.0432 |
| `has_esm_llr` | 0.0296 |
| `gene_pli` | 0.0 |
| `openspliceai_delta` | 0.0 |
| `vkb_signal` | 0.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un ensemble de arboles en ONNX, la inferencia es fundamentalmente de CPU y no requiere memoria de GPU dedicada.
- GPU recomendadas: no aplica para el caso tipico; el modelo puede ejecutarse en CPU. No se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: irrelevante en la practica; cualquier equipo capaz de ejecutar ONNX Runtime puede servirlo, incluidas maquinas sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con integracion en pipelines Python. No se documentan despliegues especificos con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo tabular.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Attma Variant Ranker v1 | Ensemble LightGBM en ONNX para priorizacion de variantes | no aplica | no aplica | Apache-2.0 | Hugging Face |
| Rankers de priorizacion de variantes basados en ACMG | Reglas deterministas | no aplica | no aplica | variable | no disponible |
| Modelos de prediccion de patogenicidad basados en proteinas (p. ej. ESM) | Redes neuronales | no disponible | no disponible | variable | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la informacion proporcionada; la model card solo compara contra un baseline interno de ACMG en las metricas de recall de caso.

## Limitaciones y advertencias

- Uso exclusivo en investigacion: la model card declara explicitamente "Research use only"; no esta validado para decision clinica autonoma.
- No sustituye al motor ACMG/AMP: solo produce una ordenacion de 0 a 100; la clasificacion final debe seguir siendo determinista y trazable.
- Sesgos potenciales: el rendimiento depende de la distribucion de las cohortes de entrenamiento; no se documentan analisis de sesgo por poblacion ancestral ni por tipo de variante.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero existe riesgo de ordenaciones erroneas en variantes fuera de la distribucion de entrenamiento o con caracteristicas faltantes.
- Dependencia de caracteristicas externas: requiere anotaciones de gnomAD, ESM, PhenoGenius y OpenSpliceAI; si faltan, la senal se degrada (las importancias de `has_esm_llr` y `gnomad_observed` son bajas pero no nulas).
- Limitaciones de idioma y contexto: no procesa texto; cualquier uso con entradas no tabulares o fuera del esquema GRCh38 no esta soportado.
- Licencia Apache-2.0: permite uso comercial segun los terminos de la licencia, pero la restriccion de uso en investigacion de la model card debe respetarse en el contexto clinico.
- Repositorio sin descargas ni likes: no hay evidencia de validacion independiente por parte de la comunidad; la adopcion en produccion deberia acompanarse de validacion local.
- Fecha de creacion futura (2026-11-25) en los metadatos: conviene verificar la procedencia y el estado del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AttmaBio/attma-variant-ranker-v1
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
