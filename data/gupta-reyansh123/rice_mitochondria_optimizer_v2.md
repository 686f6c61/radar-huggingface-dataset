# gupta-reyansh123/Rice_Mitochondria_Optimizer_v2

## Resumen

Rice Mitochondria Optimizer v2 es un modelo de lenguaje biológico especializado en optimización de codones, publicado por el usuario gupta-reyansh123. Se trata de un fine-tune de adibvafa/CodonTransformer, un transformer de tipo BigBird con cabeza de masked language modeling (fill-mask), que recibe una secuencia de proteína y devuelve la secuencia codificante de ADN (CDS) correspondiente optimizada para la maquinaria de traducción de la mitocondria del arroz (*Oryza sativa*). El modelo cuenta con 87.881.562 parámetros y una ventana de 2048 posiciones.

El problema que resuelve es concreto: el uso de codones en el genoma mitocondrial del arroz difiere del nuclear y del de otros organismos, de modo que un gen diseñado con herramientas genéricas puede expresarse de forma subóptima al insertarlo en mitocondrias. Esta segunda versión sustituye el enfoque de la v1, entrenada sobre fragmentos de ~6 kb, por un conjunto de 69 genes mitocondriales completos con codón de inicio y codón de parada terminal, priorizando menos secuencias pero de mayor calidad estructural.

La relevancia actual del modelo reside en su compromiso explícito entre contenido de GC y estabilidad del ARN: el control de GC se relaja deliberadamente a favor de la energía libre mínima (MFE) de los primeros 50 nucleótidos, lo que produce salidas con GC algo por debajo del objetivo (41,85 % frente a 43,51 %) pero con una estructura 5′ prácticamente idéntica a la nativa (Δ5′ MFE de 0,020 kcal/mol). Está publicado bajo licencia Apache 2.0 y su uso previsto es puramente experimental en biología sintética vegetal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BigBird (transformer con atención dispersa) con cabeza de masked language modeling (`BigBirdForMaskedLM`) |
| Parametros totales | 87.881.562 (aproximadamente 87,9 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 posiciones (tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio publica pesos en safetensors (sin cuantizaciones GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural, opera sobre secuencias de proteina y ADN |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (0,4 GB de repositorio) |
| Modelo base | adibvafa/CodonTransformer |
| Pipeline declarado | fill-mask |
| Tipo de organismo | un unico token de organismo (`organism=0`, arroz mitocondrial) |

## Arquitectura y entrenamiento

La arquitectura es un BigBird, es decir, un transformer con atención dispersa de complejidad lineal que combina atención local por ventanas, atención global sobre ciertos tokens y bloques aleatorios. Sobre esta columna vertebral se aplica una cabeza de predicción de tokens enmascarados, lo que permite generar la CDS de forma iterativa: se enmascaran posiciones y el modelo predice el codón más probable en cada una. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de las 69 CDS, ni si se aplicaron fases de RLHF o DPO (en un modelo biológico no generativo esto último es esperable que no aplique).

El ajuste fino se realizó sobre 69 secuencias codificantes mitocondriales completas de arroz, cada una con codón de inicio, un único codón de parada terminal y ausencia de paradas internas. Respecto a la v1, se pasó de muchos fragmentos de ~6 kb a menos secuencias pero completas. La innovación técnica destacable es la política de control de GC: durante el fine-tuning se aplicó control de contenido de GC pero se relajó deliberadamente en favor de la MFE de la región 5′. Como el GC y la MFE están ambos relacionados con la estabilidad del ARN, pero la MFE la mide de forma más directa, el resultado es una salida con GC inferior al objetivo (41,85 % frente a 43,51 % objetivo y 44,35 % del modelo con restricción estricta) a cambio de conservar la estructura secundaria del extremo 5′ del transcrito.

## Capacidades

- Generación de secuencias codificantes de ADN a partir de una secuencia de proteína de entrada (predicción de codones mediante fill-mask iterativo).
- Optimización de codones específica para el uso codónico de la mitocondria de *Oryza sativa*, con un único token de organismo (`organism=0`).
- Control de métricas de calidad de la secuencia: índice de adaptación de codones (CAI), contenido global de GC, contenido de GC en tercera posición (GC3) y similitud a nivel de codón con la secuencia nativa.
- Preservación de la estructura secundaria del ARN en la región 5′, medida como Δ5′ MFE frente a la secuencia original.
- Integridad traduccional: en el conjunto de evaluación, las 100 predicciones traducen de vuelta a la proteína de entrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM de propósito general.
- No dispone de capacidades multilingües: su alfabeto es de nucleótidos y aminoácidos.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Diseño de genes sintéticos para transformación mitocondrial de arroz: dado el gen de interés traducido a proteína, el modelo devuelve una CDS lista para síntesis que respeta el uso codónico mitocondrial y evita paradas internas, lo que reduce el trabajo de corrección manual antes de encargar el gen a un proveedor.
- Rediseño de genes de fijación de nitrógeno (*nifH*) para su expresión en mitocondrias vegetales: es exactamente el escenario empleado en la evaluación del autor, con 100 genes nativos como conjunto de prueba, por lo que el modelo ya ha sido validado en este tipo de secuencia.
- Ajuste de estabilidad de transcritos mediante la región 5′: cuando el cuello de botella no es la eficiencia de traducción sino la vida media del ARNm mitocondrial, el modelo permite obtener variantes cuyo Δ5′ MFE se acerca a 0 (estructura nativa preservada), algo que Geneious (0,815 kcal/mol) e IDT (0,652 kcal/mol) no consiguen.
- Cribado in silico de variantes antes de la síntesis: al generar una CDS por proteína y calcular CAI, GC3 y similitud de codones, se pueden comparar candidatos y descartar los que se alejen del objetivo sin coste de síntesis.
- Sustitución de herramientas comerciales en flujos académicos: el modelo es local, Apache 2.0 y ejecutable con `transformers`, lo que permite integrarlo en un pipeline de laboratorio sin depender de licencias de Geneious o de la plataforma cerrada de IDT.
- Generación de casetes de expresión multigénicos: al procesar cada proteína por separado y mantener la misma política de optimización, se pueden ensamblar construcciones con varias CDS coherentes entre sí en cuanto a uso codónico.
- Análisis comparativo metodológico: sirve como referencia reproducible para estudiar el compromiso entre contenido de GC y estructura de ARN, ya que el autor publica la tabla comparativa completa en `dataset_comparison_summary.csv`.
- Docencia e investigación en biología sintética: el modelo es lo bastante pequeño (87,9 M de parámetros) para ejecutarse en un portátil y servir de ejemplo práctico de fine-tuning de un transformer biológico sobre un organismo concreto.

## Benchmarks y rendimiento

Evaluación del autor sobre 100 genes nativos *nifH* como conjunto de prueba. Los valores objetivo corresponden a las métricas de referencia definidas por el propio autor.

| Dataset | GC % | GC3 % | CAI | Similitud de codones con el original % | Δ5′ MFE (kcal/mol) |
| --- | --- | --- | --- | --- | --- |
| *nifH* nativo (nif1 + nif2) | 53,28 | 62,56 | 0,681 | no aplica | no aplica |
| Geneious | 44,71 | 39,58 | 0,777 | 34,51 | 0,815 |
| IDT | 44,46 | 39,21 | 0,781 | 34,21 | 0,652 |
| Modelo sin restricciones (sin control de GC) | 41,59 | 29,34 | 0,857 | 32,10 | 1,039 |
| Modelo con restricciones | 44,35 | 37,85 | 0,805 | 38,78 | 2,252 |
| **Modelo final (este modelo)** | **41,85** | **31,39** | **0,819** | **38,57** | **0,020** |
| Objetivo | 43,51 | 40,08 | 1,0 | 1,0 | 0 |

Notas sobre las métricas, según el autor: el CAI emplea pesos de adaptabilidad relativa construidos a partir de los 69 genes mitocondriales completos de arroz y se calcula como media geométrica por secuencia; el Δ5′ MFE es el cambio medio de energía libre mínima de los primeros 50 nucleótidos (ViennaRNA, 37 °C), calculado como optimizado menos original, de modo que 0 indica que la estructura 5′ nativa se preserva; la similitud de codones es la similitud a nivel de codón frente a la secuencia nativa. Las 100 predicciones traducen de vuelta a la proteína de entrada. El propio autor advierte que la evaluación usa una única familia génica (*nifH*) y que estos números no deben leerse como un benchmark general.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 352 MB solo de pesos, más activaciones y estado del optimizador de decodificación; el repositorio completo ocupa 0,4 GB.
- Inferencia en FP16/BF16: aproximadamente 176 MB de pesos, asumiendo conversión manual, ya que no se publican pesos de precisión reducida.
- Inferencia en INT8: aproximadamente 88 MB de pesos si se aplica cuantización dinámica, no documentada por el autor.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos. También es viable en CPU con `transformers` en PyTorch.
- GPU recomendadas para uso intensivo por lotes: no se requieren aceleradores de centro de datos; una A100 o H100 solo aportarían ventaja si se procesan grandes volúmenes de secuencias en paralelo.
- Opciones de despliegue: `transformers` con `AutoTokenizer` y `BigBirdForMaskedLM`, ejecución en CUDA o CPU. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama; estas herramientas están orientadas a modelos generativos autoregresivos y no encajan con un fill-mask de BigBird.
- Latencia y throughput: no disponibles en la información proporcionada. La generación es iterativa sobre 2048 posiciones como máximo, por lo que el coste crece con la longitud de la proteína de entrada.

## Comparativa con modelos similares

| Modelo / herramienta | Tipo | Parametros | Contexto | CAI | Δ5′ MFE (kcal/mol) | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Rice Mitochondria Optimizer v2 | BigBird fine-tuneado | 87,9 M | 2048 | 0,819 | 0,020 | Apache 2.0 | HuggingFace, pesos abiertos |
| CodonTransformer (base) | BigBird | no disponible en la informacion | no disponible en la informacion | no disponible para mitocondria de arroz | no disponible | no disponible en la informacion | HuggingFace |
| Rice_Mitochondria_Optimizer (v1) | BigBird fine-tuneado sobre fragmentos de ~6 kb | no disponible en la informacion | no disponible en la informacion | no disponible | no disponible | Apache 2.0 (segun la ficha de la v1) | HuggingFace |
| Geneious | Herramienta comercial de optimizacion de codones | no aplica | no aplica | 0,777 | 0,815 | propietaria | comercial |
| IDT | Servicio comercial de optimizacion de codones | no aplica | no aplica | 0,781 | 0,652 | propietaria / servicio | plataforma web de IDT |

No se dispone de datos comparativos de otros modelos abiertos de optimización codónica específicos para mitocondria de arroz distintos de los citados por el autor. Los valores de CAI y Δ5′ MFE de Geneious e IDT proceden de la evaluación del propio autor, no de mediciones independientes.

## Limitaciones y advertencias

- Ámbito restringido a un único organismo: el modelo se entrenó exclusivamente con datos mitocondriales de arroz y no está pensado para otros organismos. Aplicarlo a otra especie o al genoma nuclear del arroz carece de validación.
- Evaluación limitada: el conjunto de prueba es una sola familia génica (*nifH*) con 100 genes y 69 secuencias de entrenamiento. Los resultados no deben extrapolarse como benchmark general de optimización codónica.
- GC y GC3 por debajo del objetivo: 41,85 % frente a 43,51 % y 31,39 % frente a 40,08 %. Es una consecuencia intencionada de relajar el control de GC en favor de la MFE 5′, pero implica que la salida no cumple las métricas clásicas de contenido de GC.
- Riesgo de secuencias no funcionales: aunque en el conjunto de prueba las 100 predicciones traducen correctamente a la proteína de entrada, no hay garantía de que la CDS generada sea funcional in vivo; se requiere validación experimental (síntesis, transformación y ensayo de expresión).
- Riesgo de alucinación en el sentido biológico: el modelo puede producir codones que optimicen las métricas de forma aparente pero alteren elementos reguladores intrínsecos de la secuencia, motivos de unión o estructuras necesarias para el procesamiento mitocondrial.
- Ausencia de cuantizaciones publicadas: solo se ofrecen pesos en safetensors sin versiones GGUF, AWQ o GPTQ, lo que limita el despliegue en runtimes de inferencia específicos.
- Documentación incompleta: no se publica el número de tokens de entrenamiento, la composición detallada del dataset, los hiperparámetros ni los requisitos exactos de despliegue.
- Licencia: Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía sobre la idoneidad del resultado para aplicaciones reguladas (por ejemplo, liberación de organismos modificados genéticamente), donde la normativa aplicable exige validación propia.
- Modelo con 18 descargas y 0 "likes" en el momento de redactar esta ficha, lo que indica ausencia de validación independiente por parte de la comunidad.
- Los resultados de búsqueda web disponibles tratan sobre la dinastía Gupta y la familia Gupta, y no guardan ninguna relación con este modelo; no aportan información técnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gupta-reyansh123/Rice_Mitochondria_Optimizer_v2
- Modelo base CodonTransformer: https://huggingface.co/adibvafa/CodonTransformer
- Versión anterior del proyecto: https://huggingface.co/gupta-reyansh123/Rice_Mitochondria_Optimizer
- Tabla comparativa de evaluación publicada en el repositorio del modelo: `dataset_comparison_summary.csv`
- Repositorio del proyecto (mencionado en la model card como origen del módulo `CodonTransformer.CodonPrediction`): URL no disponible en la información proporcionada
- Publicación o paper asociado: no disponible en la información proporcionada
- Demos, blogs o notas técnicas adicionales: no disponible en la información proporcionada
