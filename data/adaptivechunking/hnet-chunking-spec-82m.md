# AdaptiveChunking/hnet-chunking-spec-82m

## Resumen

`AdaptiveChunking/hnet-chunking-spec-82m` es una familia de ocho ejecuciones de investigación de una red H-Net a nivel de byte, con 82.568.832 parámetros y una única etapa de jerarquía. La publica el usuario AdaptiveChunking y no es un asistente conversacional ni un modelo de propósito general: es un artefacto experimental diseñado para estudiar qué descubre un *chunker* aprendido cuando puede elegir libremente su propia granularidad computacional y, sobre todo, en qué momento del entrenamiento lo descubre. Frente a los pilotos de 22,5 M del mismo autor, estas ejecuciones conservan la trayectoria completa de checkpoints espaciados logarítmicamente, algo que no se puede reconstruir a posteriori.

Su relevancia actual es doble. Por un lado, la tokenización fija es una de las decisiones de diseño más discutidas en los LLM actuales, y este trabajo aporta evidencia experimental sobre segmentación aprendida a nivel de byte. Por otro, la publicación incluye las trayectorias íntegras —21 checkpoints por ejecución de 11.000 pasos y 30 por las ejecuciones completas de 76.300 pasos— junto con sondas de interpretabilidad publicadas en un dataset aparte.

La arquitectura emplea `d_enc` 384, `d_main` 768, `n_main` 10 y `seq_len` 1024, y se entrena sobre FineWeb2 + FineWeb-v1 (inglés). La licencia es Apache 2.0 y el repositorio ocupa 196,6 GB, casi en su totalidad por el volumen de checkpoints retenidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (*byte-level*), una única etapa de jerarquía (S=1); `d_enc` 384, `d_main` 768, `n_main` 10 |
| Parámetros totales | 82.568.832 |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | `seq_len` de 1024 (unidades de byte) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Entrenamiento con FineWeb2 + FineWeb-v1 (inglés); la métrica de segmentación (Gini) se calcula sobre 12 idiomas, con "alto recurso" = en, de, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, un fichero `{step:06d}.safetensors` por checkpoint retenido, con pesos atados (`emb.weight` y `head.weight` comparten tensor) |
| Ejecuciones publicadas | 8: `spec_A_s0`, `spec_A_s1`, `spec_A_s2`, `spec_B_s0`, `spec_B_s1`, `spec_B_s2`, `specfull_A_s0`, `specfull_B_s0` |
| Checkpoints retenidos | 21 por ejecución de 11.000 pasos; 30 por ejecución de 76.300 pasos |
| Corpus de entrenamiento | FineWeb2 + FineWeb-v1 (en) |
| Tamaño del repositorio | 196,6 GB |

## Arquitectura y entrenamiento

Se trata de un modelo H-Net a nivel de byte con una sola etapa de jerarquía, lo que implica que `mask` y `mask_level1` son idénticos byte a byte y que `mask_level1` es un marcador de posición, no un segundo nivel jerárquico real. La dimensión del codificador es 384, la del tronco principal 768 y consta de 10 bloques principales (`n_main`), con `seq_len` 1024 y lote 64 en las ejecuciones `specfull`. Los pesos de embedding y de la cabeza de salida están atados, por lo que solo se almacena `emb.weight` y la restauración requiere copiar el tensor según el mapa `tied_weights` de `config.json`.

El diseño experimental mantiene idénticos, dentro de cada escala, los datos, el calendario de semillas y el presupuesto de FLOP; lo único que varía es el objetivo del *chunker*. La condición A es la línea base: pérdida de ratio global durante todo el entrenamiento y router nunca congelado. La condición B aplica un calendario global → paridad-A → congelación. Las ejecuciones de 11.000 pasos consumen 0,72 GB de bytes de entrenamiento y las completas (`specfull`) 76.300 pasos y 5,00 GB. No se documenta uso de RLHF, DPO ni ninguna etapa de ajuste por preferencias: es un entrenamiento de modelado de lenguaje medido en bits por byte (BPB).

## Capacidades

- Modelado de lenguaje a nivel de byte con un objetivo de verosimilitud medido en bits por byte (BPB); la BPB media cae de 1,376 (0,72 GB) a 1,151 (5,00 GB), lo que indica que las ejecuciones de presupuesto completo están mejor entrenadas y no solo entrenadas durante más tiempo.
- Segmentación dinámica aprendida: el *chunker* produce límites de fragmento y su comportamiento se mide con la Gini de chunks por frase sobre frases emparejadas por contenido.
- Comportamiento multilingüe de la segmentación, evaluado sobre 12 idiomas.
- Reproducibilidad por semillas: tres semillas independientes en las condiciones A y B a 0,72 GB.
- Material para interpretabilidad: trayectorias completas de checkpoints y sondas asociadas (253 ficheros npz por ejecución de 11.000 pasos, 361 por ejecución completa).
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo instruido ni conversacional.

## Casos de uso

- Estudio de dinámicas de entrenamiento: con 21 y 30 checkpoints por ejecución se puede reconstruir la evolución temporal de cualquier métrica o activación, algo imposible con los pilotos, que solo conservan el checkpoint final.
- *Activation patching* y análisis de circuitos: la retención de toda la trayectoria permite comparar intervenciones en múltiples pasos y no únicamente en el modelo convergido.
- Investigación sobre tokenización sin tokenizador: sirve como base byte-level para medir si la segmentación aprendida reduce el coste de compresión frente a esquemas fijos.
- Línea base para nuevos objetivos de *chunking*: las condiciones A y B, con datos, semillas y presupuesto de FLOP idénticos, constituyen un control limpio contra el que comparar variantes nuevas.
- Análisis de alineación entre fragmentos aprendidos y unidades lingüísticas: útil precisamente para documentar que los fragmentos no son morfemas ni unidades lingüísticas, sino unidades de asignación de cómputo.
- Evaluación multilingüe de coste de compresión: la métrica de BPB sobre 12 idiomas permite estudiar el comportamiento del modelo en lenguas de alto y bajo recurso.
- Auditoría y reproducción de resultados: la estructura de `config.json`, `final.json`, `log.jsonl` y `manifest.json` permite replicar el análisis del directorio `results/exp21_tier1_spec/`.
- Desarrollo de sondas de interpretabilidad sobre el dataset `hnet-chunking-probes`, reutilizando los mismos nombres `spec_*` y `specfull_*`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos publicados son métricas internas del experimento de segmentación:

| Escala | Gini (chunks/frase) A → B | Reducción | Coste de BPB en alto recurso |
|---|---|---|---|
| Piloto, 22,5 M, 0,2 GB, 3 semillas | 0,2195 → 0,0831 | −62,1 % | +0,38 % |
| `spec`, 82,5 M, 0,72 GB, 3 semillas | 0,2181 → 0,0997 | −54,3 % | −0,82 % (B es mejor) |
| `specfull`, 82,5 M, 5,00 GB, 1 semilla | 0,2201 → 0,1037 | −52,9 % | +0,29 % |

| Métrica adicional | Valor |
|---|---|
| BPB media, presupuesto 0,72 GB | 1,376 |
| BPB media, presupuesto 5,00 GB | 1,151 |

El efecto de paridad se replica a 3,7 veces los parámetros del piloto y con el presupuesto de datos completo, con un coste de verosimilitud esencialmente nulo.

## Requisitos de hardware

- VRAM de pesos: 82.568.832 parámetros equivalen a aproximadamente 330 MB en FP32 y 165 MB en FP16/BF16. La inferencia cabe con holgura en cualquier GPU de consumo e incluso en CPU.
- El cuello de botella real no es el modelo, sino el repositorio: 196,6 GB en disco por el conjunto de checkpoints retenidos.
- GPU recomendadas para inferencia: no disponible en la información publicada; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, por el tamaño de parámetros. No se documentan requisitos específicos ni pruebas en modelos concretos (RTX 4090, A100, H100).
- Hardware de entrenamiento empleado: no disponible.
- Opciones de despliegue: no disponible. No se publican pesos en GGUF, ni adaptadores para vLLM, llama.cpp, Ollama o TGI. El uso previsto es a través del código de `beetle-hnet` (`tier1/train.py`) y de los scripts de análisis.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación natural es con los pilotos del mismo autor, que comparten objetivo y diseño experimental pero a menor escala y sin trayectoria completa.

| Modelo | Parámetros | Datos de entrenamiento | Contexto | Gini A → B | Coste de BPB en alto recurso | Checkpoints | Licencia |
|---|---|---|---|---|---|---|---|
| `AdaptiveChunking/hnet-chunking-pilots` | 22,5 M | 0,2 GB | no disponible | 0,2195 → 0,0831 | +0,38 % | Solo checkpoint final | Apache 2.0 |
| `AdaptiveChunking/hnet-chunking-spec-82m` | 82,5 M | 0,72 GB y 5,00 GB | 1024 | 0,2181 → 0,0997 (0,72 GB); 0,2201 → 0,1037 (5,00 GB) | −0,82 % (0,72 GB); +0,29 % (5,00 GB) | 21 y 30 por ejecución | Apache 2.0 |

No se documentan en la información disponible otros modelos públicos comparables con el mismo objetivo de *chunking* dinámico aprendido a nivel de byte.

## Limitaciones y advertencias

- `mask` y `mask_level1` son idénticos byte a byte: todo el modelo es de una sola etapa (S=1) y `mask_level1` es un marcador de posición. Cualquier análisis que lo trate como un segundo nivel jerárquico está midiendo dos veces lo mismo.
- En tailandés, `len(mask)` es 21 bytes más largo que el texto al que indexa.
- Los límites se anclan por debajo del carácter (*phase-lock* sub-carácter) en varios sistemas de escritura: el router no respeta los bordes de punto de código, algo esperable en un modelo byte-level, pero problemático al alinear fragmentos con unidades lingüísticas.
- Los análisis realizados hasta la fecha indican que la capacidad cristaliza antes que la segmentación, que los fragmentos aprendidos no están funcionalmente localizados y que las unidades no son lingüísticas. Debe interpretarse "chunk" como "unidad de asignación de cómputo", no como "morfema".
- Las condiciones C, D y E no se ejecutaron a esta escala, solo A y B. El resultado de dependencia de trayectoria y bloqueo (*lock-in*) de la condición C existe únicamente a 22,5 M y podría ser un artefacto de una ejecución de 6000 pasos con un reparto de fases 40 %/70 %.
- `specfull` tiene una sola semilla por condición; la dispersión de tres semillas solo existe con el presupuesto de 0,72 GB.
- La Gini publicada se calcula sobre chunks por frase emparejada por contenido, en 12 idiomas, con alto recurso = en, de, ru, zh. Una Gini no es comparable entre conjuntos de idiomas distintos.
- No hay cuantizaciones publicadas, ni pesos en formatos de despliegue habituales, ni evaluación de sesgos, alucinación o seguridad. No es apto como componente de producción orientado a usuario final.
- Licencia Apache 2.0, sin restricciones comerciales declaradas en la información disponible, si bien la ausencia de formatos de despliegue y de documentación de uso limita su aplicación práctica fuera del ámbito de investigación.

## Enlaces

- [Modelo en HuggingFace: AdaptiveChunking/hnet-chunking-spec-82m](https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m)
- [Pilotos de 22,5 M: AdaptiveChunking/hnet-chunking-pilots](https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots)
- [Dataset de sondas: AdaptiveChunking/hnet-chunking-probes](https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes)
- [Repositorio de código beetle-hnet](https://github.com/suchirsalhan/beetle-hnet)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a anuncios inmobiliarios sin relación con el contenido solicitado.
