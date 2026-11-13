# hackhackhack66666/vla-test-time-and-multinet-audit

## Resumen

Este repositorio no contiene un modelo de lenguaje ni un VLA entrenado, sino un conjunto de artefactos de evaluación reproducibles para dos estudios sobre el modelo OpenVLA-7B, un vision-language-action de 7 mil millones de parámetros. Lo publica el usuario `hackhackhack66666` bajo licencia CC-BY-4.0 y su propósito es auditar dos cuestiones concretas: la semántica de la pinza (gripper) en el benchmark MultiNet v0.1 y la eficacia de la selección por consenso (Consensus Selection) en el benchmark LIBERO-Long. El valor del repositorio reside en que todos los números publicados pueden recalcularse en CPU en segundos a partir de ficheros Parquet, sin necesidad de GPU, pesos del modelo ni descargas de Open-X RLDS.

El primer estudio reproduce el pipeline de MultiNet sobre tres de sus veinte datasets de Open-X (Jaco Play, Berkeley Autolab UR5 y NYU Door Opening) y demuestra que la métrica AMSE publicada está dominada por la componente de la pinza: entre el 98,0 % y el 99,9 % del error. Además, un predictor trivial de todo ceros supera al propio OpenVLA en esos objetivos, y alinear las dos semánticas de pinza (estado absoluto frente a comando relativo) reduce el error entre un 37 % y un 87 %. El segundo estudio compara, con 100 episodios emparejados por método, la decodificación greedy de OpenVLA-7B fine-tuneado en LIBERO-10 frente a muestreo único y Consensus Selection con 8 candidatos.

La relevancia actual es metodológica: cuestiona la validez de una métrica de benchmark ampliamente citada y muestra que una técnica de selección en tiempo de test ampliamente asumida como beneficiosa no aporta mejoras estadísticamente significativas en este entorno. Es material de referencia para investigadores que evalúan VLAs y para quienes diseñan protocolos de evaluación de robótica con modelos fundacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de artefactos de evaluación; el modelo evaluado es OpenVLA-7B, transformer visión-lenguaje-acción) |
| Parámetros totales | no disponible para el repositorio; el modelo evaluado es OpenVLA-7B (7 000 millones) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | cc-by-4.0 |
| Formato de pesos | no aplica; los artefactos se distribuyen en Parquet, JSON y JSONL |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su contenido son tablas por paso (per-step) y por episodio generadas al ejecutar dos pipelines de evaluación sobre OpenVLA-7B. En el caso de MultiNet, se reejecuta el pipeline del commit `546a1c7` sobre tres datasets de Open-X Embodiment y se comparan las predicciones del modelo con los objetivos originales de MultiNet, con objetivos realineados mediante `rel2abs` y con predicciones convertidas de estados a comandos. En el caso de LIBERO-Long se emplea `openvla/openvla-7b-finetuned-libero-10` en bucle cerrado con 100 episodios emparejados por método: greedy, muestreo único con temperatura 1,0 y Consensus Selection sobre 8 acciones muestreadas, además de una variante de CS con voto mayoritario de pinza.

La innovación técnica no está en el modelo sino en el protocolo: evaluación emparejada con intervalos de confianza al 95 % y test de McNemar para contrastes pareados, análisis de diversidad de candidatos (4,7 acciones distintas de media entre los 8 candidatos, idénticos en el 5,9 % de los pasos de control) y medición del coste del selector (0,37 ms por paso sobre una llamada de política de unos 580 ms). Se incluyen además ficheros de entorno con versiones fijadas (`pins.json`), un `MANIFEST.json` con SHA-256 de cada fichero y los episodios descartados por fallo de infraestructura.

## Capacidades

- Auditoría reproducible de la métrica AMSE de MultiNet sobre tres datasets de Open-X: Jaco Play (7 838 pasos de test), Berkeley Autolab UR5 (10 156 pasos) y NYU Door Opening (2 209 pasos).
- Recálculo en CPU de todos los números publicados mediante `datasets.load_dataset` sobre los Parquet incluidos, sin GPU ni pesos.
- Descomposición del error por dimensión y análisis de sensibilidad a umbrales (`summary_metrics.json`).
- Estadísticas de objetivos para Jaco, UR5, NYU Door, VIOLA y Columbia PushT.
- Evaluación comparativa de estrategias de selección en tiempo de test para VLAs: greedy, muestreo único y Consensus Selection con N=8.
- Contraste estadístico pareado con intervalos de confianza y test de McNemar.
- Registro por paso y por episodio de 155 532 pasos de control y 400 filas de episodio en LIBERO-Long.
- Trazabilidad de infraestructura: episodios fallidos documentados y exclusiones explícitas.

## Casos de uso

- Revisión de resultados publicados: un investigador que cite las cifras de AMSE de MultiNet puede recalcularlas desde los Parquet y verificar la reproducibilidad (desviación inferior al 0,3 % en los tres datasets) antes de construir sobre ellas.
- Diseño de métricas de robótica: el desglose muestra que la pinza concentra el 98,0-99,9 % del AMSE, lo que sirve para justificar métricas desacopladas por dimensión o para descartar agregados dominados por una sola componente.
- Selección de política en producción: los datos de LIBERO-Long permiten decidir si merece la pena pagar el coste de Consensus Selection (0,37 ms por paso) cuando la mejora observada no es significativa (0 pp, IC 95 % [-12, +12], p = 1,00).
- Docencia y formación en evaluación de VLAs: el repositorio incluye un script de verificación de cinco segundos que reproduce las cifras principales, útil como ejercicio práctico de auditoría de benchmarks.
- Control de calidad de pipelines de evaluación: los ficheros de entorno con versiones fijadas y el manifiesto con hashes permiten reconstruir el entorno exacto y detectar derivas entre ejecuciones.
- Análisis de semántica de efector final: la comparación entre estado absoluto y comando relativo de pinza sirve de guía para quienes adaptan datasets de Open-X a nuevos formatos de acción.
- Detección de fallos de infraestructura en campañas de evaluación: el registro de episodios perdidos por timeout de servidor y su reejecución documenta una práctica recomendable en experimentos de bucle cerrado.

## Benchmarks y rendimiento

Resultados de la auditoría de MultiNet (AMSE, menor es mejor):

| Dataset | Pasos | AMSE publicado | Reproducido (greedy) | Cuota de pinza | Predictor todo ceros | Fix 1 (`rel2abs`) | Fix 2 (estado a comando) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Jaco Play | 7 838 | 0,2386 | 0,2380 (-0,28 %) | 98,0 % | 0,0699 | 0,1508 (-37 %) | 0,0709 (-70 %) |
| Berkeley UR5 | 10 156 | 0,1424 | 0,1424 (+0,001 %) | 99,9 % | 0,0023 | 0,0222 (-84 %) | 0,0190 (-87 %) |
| NYU Door Opening | 2 209 | 0,1209 | 0,1209 (-0,03 %) | 99,7 % | 0,0013 | 0,0458 (-62 %) | no posible (sin estado de robot) |

Resultados de LIBERO-Long (100 episodios emparejados por método, `openvla/openvla-7b-finetuned-libero-10`):

| Método | Éxito | Diferencia vs. greedy | IC 95 % | McNemar p |
|---|---:|---:|---|---:|
| Greedy | 55 % | — | — | — |
| Muestreo único (T=1,0) | 58 % | +3 pp | [-8, +15] | 0,74 |
| Consensus Selection, N=8 | 55 % | 0 pp | [-12, +12] | 1,00 |
| CS + voto mayoritario de pinza | 47 % | -8 pp | [-21, +5] | 0,30 |

## Requisitos de hardware

- Inferencia del modelo: no aplica; el repositorio no contiene pesos y no requiere GPU.
- Recálculo de la auditoría: CPU convencional, del orden de segundos para los tres Parquet de MultiNet según el propio autor.
- GPU: no se necesita ninguna; ni A100, ni H100, ni RTX 4090.
- Despliegue: no aplica a vLLM, llama.cpp, Ollama ni TGI; el acceso es vía `datasets` de Hugging Face o descarga directa de los Parquet.
- Almacenamiento: el tamaño del repositorio es de 0,0 GB redondeado; los ficheros principales son tres Parquet de auditoría (7 838, 10 156 y 2 209 filas), dos de LIBERO-Long (400 y 155 532 filas), JSON de métricas, figuras a 300 DPI y el manifiesto.
- Latencia y throughput: no aplica al repositorio; como referencia del estudio, la llamada de política de OpenVLA ronda los 580 ms por paso y el selector de consenso añade 0,37 ms.

## Comparativa con modelos similares

No procede una comparativa de modelos: este repositorio no es un modelo. Se compara a continuación con otros artefactos de evaluación de VLAs de propósito similar, indicando solo lo que la información disponible permite afirmar.

| Artefacto | Tipo | Modelo evaluado | Datasets | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio | Artefactos de auditoría y evaluación | OpenVLA-7B | MultiNet (3 de 20) y LIBERO-Long | CC-BY-4.0 | Hugging Face, repo de 0,0 GB |
| MultiNet (commit `546a1c7`) | Pipeline de evaluación | OpenVLA | 20 datasets de Open-X | no disponible | Repositorio externo citado |
| OpenVLA-7B | Modelo VLA | — | — | no disponible en esta ficha | Pesos en Hugging Face (`openvla/openvla-7b-finetuned-libero-10`) |
| Repositorio de código del autor | Código y documentación | OpenVLA-7B | MultiNet y LIBERO-Long | no disponible | GitHub |

## Limitaciones y advertencias

- No es un modelo: no debe citarse como un VLA ni usarse para inferencia; su función es exclusivamente auditar y reproducir evaluaciones.
- El estudio de LIBERO-Long se limita a 100 episodios por método y a un único checkpoint (`openvla-7b-finetuned-libero-10`); los intervalos de confianza son amplios y no permiten descartar efectos moderados en ninguna dirección.
- La auditoría de MultiNet cubre 3 de los 20 datasets del benchmark; las conclusiones sobre la cuota de pinza no se extrapolan por sí solas al resto sin ejecutar el pipeline completo.
- El "Fix 2" no es aplicable a NYU Door Opening por ausencia de estado de robot, de modo que la comparación entre correcciones no es homogénea entre datasets.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no ha pasado por revisión por pares que la información disponible permita verificar.
- Los resultados de CS con voto mayoritario de pinza (47 %, -8 pp) apuntan a un posible efecto negativo, pero el intervalo [-21, +5] y p = 0,30 impiden concluir causalidad.
- Riesgo de alucinación y sesgos del modelo subyacente: no evaluados en este repositorio; las métricas se centran en error de acción y tasa de éxito, no en fidelidad lingüística.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene verificar las licencias de los datasets de origen (Open-X, LIBERO) y de los pesos de OpenVLA antes de reutilizar derivados.
- Los episodios descartados por timeout de servidor están documentados y excluidos; cualquier reutilización debe mantener ese criterio para no alterar las tasas de éxito.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hackhackhack66666/vla-test-time-and-multinet-audit
- Código, documentación y tabla completa de los 20 datasets: https://github.com/GadzhiAskhabaliev/Selection-as-a-Reliability-Layer-for-VLA-Benchmarks
- Documentación de la auditoría MultiNet: `docs/MULTINET_AUDIT.md` en el repositorio anterior
- Paper de MultiNet (referencia en tags): arXiv:2411.05821
- Paper de OpenVLA (referencia en tags): arXiv:2406.09246
- Paper de Open X-Embodiment (referencia en tags): arXiv:2310.08864
- Paper de LIBERO (referencia en tags): arXiv:2310.08864 (según tags; verificar correspondencia exacta)
- Checkpoint evaluado en LIBERO: https://huggingface.co/openvla/openvla-7b-finetuned-libero-10
