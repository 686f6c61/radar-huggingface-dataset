# guillaume-cassez/mednext-blobloss-brats2023gli

## Resumen

MedNeXt-B + Blob Loss para BraTS 2023 GLI es un modelo de segmentación semántica 3D de tumores cerebrales desarrollado por Guillaume Cassez sobre la arquitectura MedNeXt-B (Roy et al., MICCAI 2023) e integrado en el framework nnU-Net v2. Segmenta tres regiones tumorales (núcleo necrótico, edema y tumor realzado) a partir de resonancia magnética multimodal (T1, T1ce, T2, FLAIR) del dataset BraTS 2023 GLI. El modelo incorpora como término auxiliar la blob loss de Kofler et al. (IPMI 2023, arXiv:2205.08209), una pérdida consciente de instancias diseñada para mejorar la detección de lesiones pequeñas.

El interés de esta ficha no reside en su rendimiento absoluto, sino en su valor como resultado negativo publicado de forma explícita. El autor documenta que, por sí solo, es el más débil de los cuatro expertos de su programa de investigación: la blob loss incrementa la sensibilidad (190 lesiones perdidas frente a 129) pero dispara los falsos positivos (1418 frente a 2029), con un delta de Dice lesional de -0,0038 en el régimen oficial limpio. Su utilidad aparece en combinación: como veto determinista ordenado `cc_B_G` aporta +0,0011 (4/5 folds positivos) y como rama G de un MoE aprendido aporta +0,0057 (5/5 folds positivos).

El repositorio publica los cinco folds de validación cruzada (300 épocas cada uno) con pesos en safetensors y los planes de nnU-Net necesarios para reproducir la inferencia. La licencia es MIT y el tamaño del repositorio es de 0,2 GB, lo que lo hace manejable para experimentación y para servir como componente de sistemas de ensemble.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MedNeXt-B (ConvNeXt 3D con up/down sampling) sobre nnU-Net v2 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (segmentación 3D; parche de entrada 128³) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | en (metadatos; la tarea es de imagen médica) |
| Licencia | MIT |
| Formato de pesos | safetensors (weights-only, sin estado del optimizador) |

## Arquitectura y entrenamiento

El modelo es un MedNeXt-B, una red convolucional 3D basada en bloques ConvNeXt adaptados a volúmenes, integrada como trainer de nnU-Net v2. El plan de entrenamiento (`plans.json`) especifica parches de 128³ con batch size 2 y el esquema `nnUNetPlans_96GB_mednext`. La función de pérdida combina el término estándar de segmentación (Dice + entropía cruzada) con la blob loss de Kofler et al. ponderada con β = 0,5, aplicada únicamente a la escala de resolución completa con ε = 1,0. El valor de β se leyó de cada `debug.json` de fold, según documenta el autor.

Se entrenaron cinco folds independientes de validación cruzada, cada uno con 300 épocas, sobre el dataset BraTS 2023 GLI. El repositorio incluye además un cabezal SDT auxiliar (`dist_head.safetensors`) que, según la model card, se instancia pero nunca se entrena porque `λ_dist = 0,0` en esta variante; no es necesario para inferencia. En el momento de la predicción, el término blob desaparece: `model.safetensors` es un MedNeXt-B de segmentación estándar. El checkpoint de este modelo se reutiliza como inicialización de la rama G del MoE V3 del programa de investigación del autor.

## Capacidades

- Segmentación 3D de regiones tumorales cerebrales en cuatro modalidades de RM (T1, T1ce, T2, FLAIR).
- Predicción de tres clases de tejido: núcleo necrótico (NCR), edema y tumor realzado (ET).
- Validación cruzada de 5 folds con pesos independientes, aptos para ensemble por promedio.
- Inferencia con ventana deslizante y test-time augmentation a través del pipeline de nnU-Net v2.
- Soporte de preprocesamiento estandarizado mediante el plan `nnUNetPlans_96GB_mednext`.
- No soporta tool calling, agentes, generación de texto ni razonamiento multimodal; es exclusivamente un modelo de segmentación de imagen médica.

## Casos de uso

- Investigación en pérdidas conscientes de instancias: el modelo sirve como brazo de ablación reproducible para estudiar el efecto de la blob loss frente a Dice+CE en segmentación tumoral 3D, con los cinco folds y los JSON de estadísticas publicados.
- Componente de ensemble por veto: integrar el fold como corroborador de las componentes predichas por un modelo base (operador `cc_B_G`), escenario en el que el autor reporta +0,0011 de Dice lesional con 4/5 folds positivos.
- Rama experta en un mixture of experts: inicializar la rama G de un MoE aprendido con este checkpoint, donde el autor reporta +0,0057 con 5/5 folds positivos.
- Baseline para comparación de arquitecturas: punto de partida MedNeXt-B con nnU-Net v2 para evaluar variantes de backbone o de función de pérdida en BraTS 2023 GLI.
- Docencia y reproducción metodológica: ejemplo completo de pipeline nnU-Net v2 con planes personalizados, pesos safetensors y estadísticas de validación cruzada para formación en imagen médica.
- Auditoría de resultados negativos: material de referencia para estudiar cómo una mejora en recall puede degradar la métrica oficial tras el post-procesado de componentes de BraTS, con los deltas desglosados por fold.

## Benchmarks y rendimiento

Dice de validación por fold (mejor EMA, media de foreground):

| Fold | Mejor EMA Dice | Épocas |
|---|---|---|
| 0 | 0,9348 | 300 |
| 1 | 0,9321 | 300 |
| 2 | 0,9368 | 300 |
| 3 | 0,9356 | 300 |
| 4 | 0,9331 | 300 |
| Media | 0,9345 | — |

Resultados oficiales BraTS 2023 (lesion-wise, régimen limpio, n = 1195, 5 folds disjuntos), deltas pareados frente al experto base B:

| Configuración | Delta Dice lesional | Folds positivos | Nota |
|---|---|---|---|
| G solo | -0,0038 | 0/5 | IC 95 % [-0,00648, -0,00103], 1,25× SESOI en dirección negativa |
| Veto determinista `cc_B_G` | +0,0011 | 4/5 | Holm p = 0,156; por debajo de SESOI |
| MoE V3 con G | +0,0057 | 5/5 | Por encima de SESOI en 4/5 folds |

Conteo de lesiones en régimen bruto: lesiones perdidas 190 → 129 (3/3 regiones significativas) y falsos positivos 1418 → 2029 (3/3 regiones significativas). Tras el decodificado limpio oficial, el 93,2 % del delta bruto de Dice y el 96,2 % del de HD95 desaparecen (perdidas 310 → 306, FP 57 → 72).

## Requisitos de hardware

- VRAM estimada: no disponible en la model card; por el tamaño del backbone MedNeXt-B y parches de 128³, se sitúa en el rango de 16-24 GB para inferencia en FP16, aunque el dato no está publicado.
- GPU recomendadas: no especificadas por el autor; el plan se denomina `nnUNetPlans_96GB_mednext`, lo que sugiere que el entrenamiento se realizó en GPU de 96 GB (A100 80 GB o H100 80 GB con margen, o superior).
- GPU de consumo: no confirmado; un parche de 128³ con MedNeXt-B es viable en RTX 4090 (24 GB) con batch 1, pero el autor no lo documenta.
- Despliegue: nnU-Net v2 (https://github.com/MIC-DKFZ/nnUNet) con los trainers de MedNeXt (https://github.com/MIC-DKFZ/MedNeXt); no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Contexto/parche | Dice reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedNeXt-B + Blob Loss (este) | MedNeXt-B | 128³ | 0,9345 (CV media) | MIT | Hugging Face |
| Experto base B del mismo programa | no especificado | no disponible | referencia de los deltas | no disponible | no disponible en esta ficha |
| MedNeXt original (MIC-DKFZ) | MedNeXt | según plan nnU-Net | no disponible | no disponible en esta ficha | Hugging Face (modelo base) |

No se dispone de datos comparativos con otros modelos BraTS 2023 en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo publicado: por sí solo, el modelo es el más débil de los cuatro expertos del programa, con delta de Dice lesional de -0,0038 frente al baseline.
- La blob loss incrementa los falsos positivos de 1418 a 2029 en régimen bruto, lo que exige post-procesado de componentes para uso clínico.
- El cabezal SDT incluido no está entrenado (`λ_dist = 0,0`); no debe usarse para predicción de distancias.
- El modelo solo procesa las cuatro modalidades de RM de BraTS 2023 GLI y requiere el preprocesado exacto del plan `nnUNetPlans_96GB_mednext`; otros planes o resoluciones invalidan los pesos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la segmentación, con impacto clínico potencial.
- Sesgos de dominio: entrenado exclusivamente en BraTS 2023 GLI (gliomas), sin garantías de generalización a otros tumores, protocolos de adquisición o poblaciones.
- Licencia MIT permite uso comercial, pero el modelo no está validado para uso clínico; cualquier aplicación médica requiere validación regulatoria independiente.
- Los deltas positivos reportados (+0,0011 y +0,0057) están por debajo o cerca del SESOI predeclarado de 0,003 en algunos casos y no deben interpretarse como mejoras clínicamente significativas.
- El veto es asimétrico: el orden inverso `cc_G_B` cae al puesto 11 con -0,002306, por lo que la dirección del operador importa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guillaume-cassez/mednext-blobloss-brats2023gli
- Modelo base MedNeXt: https://huggingface.co/MIC-DKFZ/MedNeXt
- Repositorio nnU-Net v2: https://github.com/MIC-DKFZ/nnUNet
- Repositorio MedNeXt: https://github.com/MIC-DKFZ/MedNeXt
- Paper de blob loss (Kofler et al., IPMI 2023): https://arxiv.org/abs/2205.08209
- Dataset BraTS 2023 GLI: https://www.synapse.org/#!Synapse:syn51156910/wiki/622351
- Paper 3 del autor, "The Gate Does Not Choose": no disponible como enlace directo en la información proporcionada
- Paper 5 del autor, "It Detects More, It Scores Less": no disponible como enlace directo en la información proporcionada
