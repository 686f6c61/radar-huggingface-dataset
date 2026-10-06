# Jongbin-kr/exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed2026

# exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed2026

## Resumen

Se trata de un adaptador LoRA (PEFT) publicado por el usuario de HuggingFace Jongbin-kr, obtenido mediante ajuste supervisado (SFT) sobre un subconjunto "answer-only" del conjunto de datos ConvFinQA, que versa sobre preguntas financieras con razonamiento numérico. El adaptador se monta sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por LG AI Research, y no se distribuye fusionado con él: son pesos de adaptador, no un modelo completo.

El interés del artefacto es metodológico más que de producto. El nombre y las etiquetas del repositorio (`accuracy-band-selection`, `lora`) indican que forma parte de un experimento sobre selección de datos de entrenamiento por bandas de precisión del modelo: la condición de selección declarada es `accuracy_medium_low_1to2_selseed2026_ratio0.12`, con una semilla de entrenamiento fija (42) y un manifiesto de selección verificable por SHA256. El repositorio incluye, además de la rama `main` (mejor checkpoint de validación), tres ramas por época, lo que permite estudiar la dinámica de entrenamiento.

Es un artefacto de investigación con muy poca tracción (11 descargas, 0 likes) y sin licencia declarada, creado y actualizado en octubre de 2026. No publica resultados de benchmarks, no declara idiomas soportados ni pipeline de uso, y su utilidad práctica queda supeditada a la licencia del modelo base y a una evaluación propia por parte de quien lo adopte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct; la arquitectura interna del adaptador no se detalla en la model card |
| Parametros totales | No disponible para el adaptador (el autor no declara su número de parámetros ni el rango de LoRA); el modelo base declara 7.800 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la hereda del modelo base, pero el autor no la especifica) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors. No hay versiones GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio |
| Idiomas soportados | No disponible; el autor no los declara |
| Licencia | No disponible; la model card no especifica licencia alguna |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |

Otros datos del repositorio: tamaño de 1,0 GB, 11 descargas, 0 likes, librería `peft`, región declarada `us`, etiquetas `peft`, `safetensors`, `accuracy-band-selection`, `lora`. El autor indica que la revisión esperada de la caché local del modelo base es `553ea250b9a5317231459279d5847d6cf955b9aa` (el cargador de entrenamiento usó el ID del Hub sin fijar revisión explícita).

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con SFT sobre un subconjunto "answer-only" de ConvFinQA, es decir, con ejemplos en los que se supervisa únicamente la respuesta final y no la cadena de razonamiento intermedia. La condición de selección de datos declarada es `accuracy_medium_low_1to2_selseed2026_ratio0.12`, lo que sugiere un filtrado de ejemplos en función de una banda de precisión del modelo (bandas "medium" y "low", proporción 1:2, ratio 0,12) con una semilla de selección propia (2026), distinta de la semilla de entrenamiento (42). El manifiesto de selección tiene SHA256 `b130fb24ba903e4e0aa390f7cdd6b27a5b8a9ac5cf87dcabc196b4ffb45f5340`, lo que permite auditar qué ejemplos entraron en el conjunto de entrenamiento.

El autor publica cuatro puntos de control. La rama `main` corresponde al mejor checkpoint de validación, `checkpoint-164`, con `eval_loss=0.31674376130104065`. Las ramas por época son `epoch1-step82` (checkpoint-82), `epoch2-step164` (checkpoint-246 figura como época 3, es decir, `epoch3-step246`). No se documentan hiperparámetros del LoRA (rango, alpha, dropout), optimizador, tasa de aprendizaje, número de tokens vistos ni composición completa del dataset más allá del manifiesto. Tampoco se indica si hubo una fase posterior de RLHF o DPO; por el nombre del repositorio (`sft`), todo apunta a que el ajuste se limita a supervisión directa.

## Capacidades

- Generación de respuestas de tipo "answer-only" para preguntas del dominio de ConvFinQA: preguntas conversacionales sobre documentos financieros en las que se espera una respuesta final corta, sin cadena de razonamiento explícita.
- Razonamiento numérico aplicado a contexto financiero: el conjunto de entrenamiento exige operar con cifras extraídas de tablas y texto financiero, aunque el autor no publica ninguna evaluación de esta capacidad.
- Herencia de las capacidades generales del modelo base EXAONE-3.5-7.8B-Instruct (generación de texto, instrucciones), no documentadas ni verificadas en esta model card y potencialmente degradadas por el ajuste.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso explícito: no documentado; el objetivo de entrenamiento es precisamente "answer-only", sin trazas de razonamiento.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Reproducibilidad experimental: el manifiesto SHA256 y las ramas por época permiten reproducir y auditar la selección de datos y la evolución del entrenamiento.

## Casos de uso

- Investigación sobre selección de datos de entrenamiento: el adaptador sirve como punto de comparación reproducible dentro de un estudio de `accuracy-band-selection`, ya que fija la condición de selección, la semilla (42) y el hash del manifiesto para poder contrastar variantes con otras bandas o proporciones.
- Estudio de sobreajuste y dinámica de entrenamiento: las tres ramas por época (`epoch1-step82`, `epoch2-step164`, `epoch3-step246`) permiten evaluar cómo evoluciona el modelo época a época sobre un conjunto de validación propio sin necesidad de reentrenar.
- Ajuste fino posterior en el dominio financiero: al ser un adaptador LoRA de bajo coste, se puede usar como inicialización para un SFT adicional sobre datos financieros propios, en lugar de partir del modelo base sin ajustar.
- Evaluación de QA numérico financiero: permite construir una línea base para medir exactitud de respuesta final sobre preguntas tipo ConvFinQA y compararla con el modelo base sin adaptador, siempre con un conjunto de evaluación propio.
- Auditoría de procedencia de datos: el SHA256 del manifiesto de selección y la revisión del modelo base documentada permiten reconstruir exactamente qué se entrenó y con qué, algo poco habitual en adaptadores publicados sin documentación.
- Fusión y exportación para despliegue interno: el adaptador se puede fusionar con el modelo base para producir un modelo de 7.800 millones de parámetros especializado en respuestas financieras breves y servirlo con transformers, TGI o vLLM, sujeto a las restricciones de licencia del modelo base y a validación propia.
- Prototipado de asistentes de consulta financiera: útil para experimentos internos de respuesta corta sobre documentos contables, con la advertencia de que no hay benchmarks públicos que respalden su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni ninguna métrica de exactitud sobre ConvFinQA). El único dato numérico aportado por el autor es la pérdida de validación del mejor checkpoint, que no es comparable con métricas de benchmarks:

| Metrica | Valor | Contexto |
|---|---|---|
| eval_loss (checkpoint-164, rama `main`) | 0.31674376130104065 | Pérdida de validación declarada por el autor; no equivale a ninguna métrica de benchmark publicada |
| Exactitud sobre ConvFinQA | No disponible | No publicada |
| MMLU / HumanEval / GSM8K | No disponible | No publicados |

## Requisitos de hardware

- El adaptador pesa 1,0 GB en disco, pero la inferencia requiere cargar el modelo base EXAONE-3.5-7.8B-Instruct (7.800 millones de parámetros) más el adaptador.
- VRAM estimada para el modelo base: en torno a 16 GB en fp16/bf16, unos 9-10 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimaciones por tamaño de parámetros; el autor no las publica).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para fp16 con lotes grandes; A100 80 GB para servicio concurrente con vLLM.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 (24 GB) en fp16 con contexto moderado; en RTX 4080 / RTX 3080 (16 GB) requiere 8 bits; en RTX 3060 12 GB o RTX 4060 Ti 16 GB es viable en 4 bits con contexto reducido.
- Opciones de despliegue: `transformers` + `peft` es la vía directa para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA sobre el modelo base; llama.cpp y Ollama exigen fusionar el adaptador con el modelo base y convertir a GGUF, ya que el repositorio no publica pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este adaptador, por lo que la comparación se limita a características estructurales. Se incluye el modelo base como referencia directa; otros adaptadores LoRA comparables no se han identificado en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed2026 (este adaptador) | No disponible (LoRA sobre 7,8 B) | No disponible | No disponible | safetensors (PEFT) | No publicado (solo eval_loss = 0.3167) |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (modelo base) | 7.800 millones | No disponible en la información facilitada | No disponible en la información facilitada | safetensors | No publicado en la información facilitada |
| Otros adaptadores LoRA de 7-8 B para QA financiero | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: la model card no especifica licencia, lo que impide determinar si el uso comercial está permitido. A esto se suma que las condiciones del modelo base EXAONE-3.5-7.8B-Instruct no se detallan en la información proporcionada y deben verificarse por separado antes de cualquier uso en producción.
- Artefacto de investigación con tracción mínima: 11 descargas y 0 likes, sin validación por parte de la comunidad ni informes independientes de calidad.
- Dominio de entrenamiento muy estrecho: SFT "answer-only" sobre un subconjunto de ConvFinQA con ratio de selección 0,12, lo que implica un volumen de datos reducido y un riesgo elevado de sobreajuste al formato y al dominio, con posible degradación de capacidades generales del modelo base.
- Riesgo de alucinación en cálculos financieros: el entrenamiento sin cadena de razonamiento explícita ("answer-only") impide auditar cómo se obtiene la cifra final; en un dominio numérico esto aumenta la probabilidad de respuestas plausibles pero incorrectas.
- Ausencia total de benchmarks: no hay métricas de exactitud, MMLU, GSM8K ni evaluación sobre ConvFinQA, por lo que no es posible estimar la calidad real del adaptador ni compararlo con alternativas.
- Sin datos de idiomas: no se declara el soporte multilingüe, y el ajuste se ha hecho sobre un conjunto en inglés, lo que previsiblemente reduce el rendimiento en castellano u otras lenguas.
- Dependencia de la revisión del modelo base: el autor indica que el cargador de entrenamiento usó el ID del Hub sin fijar revisión y que la revisión esperada de la caché local es `553ea250b9a5317231459279d5847d6cf955b9aa`; cargar el adaptador sobre una revisión distinta puede alterar el comportamiento.
- Reproducción parcial: se documentan la semilla de entrenamiento y el hash del manifiesto de selección, pero no los hiperparámetros del LoRA, el dataset completo ni la receta de preprocesado.
- Fechas del repositorio: la creación y la última actualización figuran en octubre de 2026, dato a tener en cuenta al fijar dependencias y revisiones.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed2026
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio del conjunto de datos ConvFinQA: no disponible en la información proporcionada.
- Paper, blog o demo del adaptador: no disponible. La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos trataban sobre técnica de tiro en baloncesto y no guardan relación con el artefacto).
