# clear-bio/ingmar

## Resumen
El modelo **ingmar** de clear-bio es un conjunto de cabezas lineales por clase entrenadas sobre los embeddings congelados de ESMC-300M, un modelo de lenguaje de proteínas (protein language model). Su propósito es predecir sitios de corte de proteasas en poliproteínas virales, un paso crítico en el procesamiento de proteínas virales que afecta a la infectividad y el ensamblaje. El modelo incluye un enrutador por familia que selecciona la cabeza más apropiada según la composición de kmer de la secuencia.

El modelo se distribuye como un artefacto independiente dentro del paquete `ingmar` (instalable con `pip install ingmar`), y este repositorio de HuggingFace contiene los pesos de las cabezas y los perfiles de familia. Su relevancia radica en que ofrece una herramienta especializada para la predicción de sitios de corte en virus, superando a los enfoques clásicos de motivos y a las cabezas anteriores en rendimiento (PR-AUC 0,673 frente a 0,440 del track clásico). La arquitectura es ligera: 16 cabezas lineales logísticas por clase más una generalista, con características de 1.920 dimensiones derivadas de la capa L29 de ESMC-300M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezas lineales logísticas sobre embeddings congelados de ESMC-300M (L29 post-norm) |
| Parámetros totales | No disponible (las cabezas son lineales; el backbone ESMC-300M tiene 300M) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (procesa secuencias de proteínas de longitud variable, sin límite explícito) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de proteínas) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy comprimido) para las cabezas; `family_profiles.json` para el enrutador |

## Arquitectura y entrenamiento
El modelo **ingmar** es un conjunto de cabezas logiticas lineales por clase, entrenadas sobre las características extraídas de la capa L29 (post-normalización) del backbone ESMC-300M, un modelo de lenguaje de proteínas de la familia ESM. Las características se componen de pares P1‖P1′ de 1.920 dimensiones, que codifican las posiciones flanqueantes al sitio de corte candidato. La arquitectura no incluye capas ocultas adicionales: cada cabeza es una regresión logística per-class, lo que la hace extremadamente ligera y rápida de entrenar e inferir.

El entrenamiento se realizó sobre un atlas de 14.314 sitios anotados de unión de proteasas, extraído de RefSeq, ViralZone, poly8 y UniProt (atlas v5). El proceso incluye una validación cruzada de 5 pliegues para cada cabeza, y se incorpora un enrutador por familia basado en la composición de kmer de la secuencia (perfiles en `family_profiles.json`), que selecciona la cabeza más adecuada o utiliza la cabeza generalista como respaldo. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado estándar.

## Capacidades
- **Predicción de sitios de corte de proteasas**: identifica puntos de corte en poliproteínas virales para 16 clases de proteasas (incluyendo picornavirus, flavivirus, TTSP, AVP, assemblin, etc.) más una clase generalista.
- **Enrutado por familia**: un enrutador basado en composición de kmer selecciona la cabeza específica de familia o la generalista, mejorando la precisión en familias con representación suficiente.
- **Modo unión (union)**: combina las puntuaciones de todas las cabezas para ofrecer una puntuación robusta incluso cuando la familia es desconocida o está fuera del corpus de entrenamiento.
- **Integración en pipeline**: el paquete `ingmar` incluye funciones de puntuación (`score_sequence_cuts`) y reglas para eventos no proteolíticos (StopGo, VP0-maduración), que se manejan aparte de las cabezas.
- **Escalabilidad**: al ser cabezas lineales sobre embeddings congelados, la inferencia es muy rápida y no requiere GPU para la parte de las cabezas (solo para generar los embeddings con ESMC-300M).

## Casos de uso
- **Anotación de proteomas virales**: predecir sitios de corte de proteasas en genomas virales anotados de novo, ayudando a identificar proteínas maduras y procesamiento de poliproteínas en virus recién secuenciados.
- **Descubrimiento de antivirales**: identificar sitios de corte específicos de proteasas virales que puedan ser diana de inhibidores de proteasa, una estrategia común en fármacos contra VIH, HCV y SARS-CoV-2.
- **Clasificación de virus por estrategia de procesamiento**: en función de la presencia y posición de sitios de corte, el modelo puede ayudar a clasificar virus según su mecanismo de procesamiento de poliproteínas.
- **Validación de predicciones estructurales**: dado un modelo estructural de una poliproteína, se pueden puntuar las posiciones de corte candidatas para refinar la asignación de dominios y dominios.
- **Estudios de evolución viral**: comparar los sitios de corte entre cepas o especies para detectar cambios en la especificidad de proteasa o adaptaciones a huéspedes.
- **Integración en pipelines de metagenómica**: filtrar y anotar proteínas virales en muestras metagenómicas, priorizando regiones con alta probabilidad de corte para análisis funcional posterior.

## Benchmarks y rendimiento
La evaluación se realizó sobre un conjunto de validación "lockbox" (3.980 candidatos, 344 positivos, 93 familias parentales) con etiquetas exactas. Se reporta PR-AUC con intervalos de confianza del 95%:

| Arm | PR-AUC | 95% CI |
|---|---|---|
| **union v5 (default)** | **0,673** | [0,610, 0,727] |
| generalist v5 | 0,665 | [0,608, 0,719] |
| gated v5 (family-routed) | 0,645 | [0,577, 0,703] |
| union v4 (previous ship) | 0,666 | — |
| classic (non-pLM motif track) | 0,440 | — |
| legacy full600 | 0,417 | [0,369, 0,473] |
| legacy full300 | 0,325 | [0,277, 0,382] |

Además, en un holdout de glicoproteínas (1.778 positivos, excluido del entrenamiento), la unión v5 alcanza 0,867 PR-AUC frente a 0,805 del generalista, y en la subdivisión de maduración de glico-proteínas, 0,900 frente a 0,843 (+0,058 [+0,042, +0,072]). La comparación por bootstrap pareado entre v5 y v4 no muestra diferencia significativa (+0,007 [−0,008, +0,023]), por lo que se considera no inferior y se aprueba el envío.

## Requisitos de hardware
- **Backbone ESMC-300M**: se requiere un modelo de lenguaje de proteínas de 300M parámetros para generar los embeddings. En una GPU con 16 GB de VRAM (por ejemplo, V100, RTX 4080) se puede inferir en lote; con 8 GB (RTX 3060) puede funcionar en modo de precisión mixta con secuencias cortas.
- **Cabezas lineales**: las cabezas son matrices pequeñas (1.920 dimensiones × número de clases) y se pueden ejecutar en CPU sin problema; el coste dominante es la generación de embeddings.
- **Despliegue**: la inferencia completa se puede realizar en un script Python con `ingmar.routed.score_sequence_cuts`; no requiere servidor de inferencia dedicado. Para pipelines de alto rendimiento, se recomienda precomputar los embeddings con ESMC-300M y luego aplicar las cabezas.
- **Latencia**: la latencia de las cabezas es del orden de microsegundos; la del backbone ESMC-300M domina (del orden de decenas de milisegundos por secuencia de 500 residuos en una GPU moderna).

## Comparativa con modelos similares
No se dispone de información pública sobre modelos comparables directamente (como otros predictores de sitios de corte de proteasas basados en pLM). La model card no incluye comparaciones con herramientas externas como NetPico, ProP, o Virus-Protease-Cleavage. Por tanto, no se puede proporcionar una tabla comparativa fiable.

## Limitaciones y advertencias
- **Rendimiento bajo en clases específicas**: la cabeza TTSP rinde por debajo del generalista en cortes TTSP (−0,098 PR-AUC, CI [−0,173, −0,020]) en el holdout de glicoproteínas; se debe tratar con cautela y preferir la unión generalista.
- **Clases débiles por representación**: host-signalase y Flavi-Ser tienen rendimiento limitado porque las características de ±4 residuos no capturan el contexto del h-region de la señal peptídica. Las puntuaciones bajas en regiones estructurales de flavivirus no deben interpretarse como negativas.
- **Corpus de entrenamiento limitado**: entrenado en 14.314 sitios de RefSeq/ViralZone/poly8/UniProt; las familias fuera del corpus pueden tener cobertura degradada y dependen del enrutador por homología de kmer.
- **Eventos no proteolíticos**: los cortes StopGo y de maduración de VP0 no son procesados por las cabezas; se manejan con reglas del módulo `ingmar.protease_router`. No aplicarlos a estas cabezas.
- **Sesgos y alucinación**: al ser un modelo de cabezas lineales, no alucina secuencias, pero la predicción puede estar sesgada hacia las familias dominantes del entrenamiento (por ejemplo, picornavirus) y ser menos fiable para virus poco representados.

## Enlaces
- [HuggingFace: clear-bio/ingmar](https://huggingface.co/clear-bio/ingmar)
- [GitHub: clear-bio/ingmar](https://github.com/clear-bio/ingmar) (pipeline, documentación, scripts de evaluación)
- Referencia del backbone ESMC: Hayes et al., Science 2025, doi:10.1126/science.ads0018 (citado en la model card)
