# oteam/esmfold2-experimental-fast-base300m-step750k

## Resumen

ESMFold2 es un modelo de predicción de estructura biomolecular al-atom y de diseño de secuencias de binders de proteína, desarrollado originalmente por el equipo de Biohub (autores listados en la model card: Candido, Hayes, Derry, Rao, Lin, Verkuil, Rives y otros) y descrito en el artículo "Language Modeling Materializes a World Model of Protein Biology". El artefacto que nos ocupa, `oteam/esmfold2-experimental-fast-base300m-step750k`, es una implementación no oficial publicada por el usuario `oteam` mediante la librería OFoldX: un checkpoint de la serie de escalado `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k`, en concreto el de backbone ESMC de ~300 M de parámetros tras 750.000 pasos de entrenamiento.

La arquitectura combina un modelo de lenguaje de proteínas ESMC congelado que aporta las representaciones de secuencia, un tronco de plegado recurrente que actualiza características de token y de pares, y una cabeza de difusión que genera coordenadas antes de que las cabezas de destograma y de confianza puntúen el resultado. La variante "Fast" emplea 24 bloques de plegado (frente a los 48 de la variante completa) y funciona en modo single-sequence, es decir, sin evidencias de MSA.

Su relevancia es doble: por un lado, con 504.108.490 parámetros reales en safetensors es un modelo de plegado que cabe en una única GPU de consumo, lo que lo hace utilizable para cribados a gran escala sin infraestructura de HPC; por otro, al formar parte de una serie de checkpoints de escalado, permite estudiar la relación entre cómputo de entrenamiento y calidad de plegado. Conviene subrayar que es un checkpoint experimental, no la variante de producción, y que la licencia AGPL-3.0 condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Plegado al-atom condicionado por ESMC: backbone ESMC congelado (~300 M), tronco recurrente de plegado de 24 bloques, cabeza de difusión para coordenadas y cabezas de destograma y confianza |
| Parámetros totales | 504.108.490 (~504 M), dato real de los safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. La entrada es una secuencia de proteína en código de una letra; no se documenta límite de residuos |
| Tipos de cuantización | No disponibles. El repositorio solo publica pesos en safetensors fp32 |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural, sino secuencias de aminoácidos |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (fp32; ~2,0 GB de repositorio para 504 M de parámetros) |
| Condicionamiento por MSA | No (variante Fast, single-sequence) |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo (difusión) | 14 |
| Dimensiones internas | Token 768, single 384, par 256, átomo 128 |
| Librería / runtime | `ofoldx` (instalación vía `pip install ofoldx`) |
| Pipeline en HuggingFace | `other` |

## Arquitectura y entrenamiento

El modelo sigue el esquema descrito en la model card: un ESMC congelado extrae representaciones por token; un tronco de plegado recurrente actualiza de forma iterativa las características de token y de pares (4 actualizaciones recurrentes); una cabeza de difusión genera las coordenadas atómicas en 14 pasos de muestreo; y finalmente las cabezas de destograma y de confianza evalúan la geometría y asignan puntuaciones de fiabilidad. En esta variante "Fast" el tronco consta de 24 bloques y prescinde del condicionamiento por MSA, lo que elimina la dependencia de bases de datos de homólogos en tiempo de inferencia. Las dimensiones declaradas para la familia son token 768, single 384, par 256 y átomo 128.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO; tampoco se detalla el régimen de entrenamiento del tronco más allá del identificador del checkpoint (750.000 pasos) y del tamaño del backbone (300 M). El nombre del repositorio sitúa este artefacto dentro de la serie de 15 checkpoints de escalado `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k`, incluida en el conjunto de "critics" experimentales. La model card indica además que las variantes experimentales exponen el modelo de inversión diferenciable empleado para el diseño de secuencias de binders, y que el modelo experimental fast se usa para la optimización de secuencias de binder; no se especifica la función exacta de este checkpoint concreto dentro de ese protocolo.

Un detalle técnico relevante para integración: la model card define un contrato numérico explícito. Toda frontera de coordenadas consume una proyección numérica finita; los valores no disponibles se seleccionan bajo la máscara declarada antes de cualquier aritmética o conversión de dtype y tienen derivada cero; los valores no finitos activos se consideran peticiones inválidas. La decodificación utiliza correspondencias de átomos preparadas previamente, y el eje de átomos de referencia es completo y sin padding. Para el diseño de binders, el objetivo debe ser una única secuencia de proteína en código de una letra: no se acepta una estructura ni una ruta de fichero como diana, y cada complejo diana-binder se construye a partir de dos cadenas proteicas lineales nuevas.

## Capacidades

- Predicción de estructura biomolecular al-atom a partir de representaciones ESMC, con generación de coordenadas mediante difusión (14 pasos).
- Plegado en modo single-sequence: no requiere MSA ni búsqueda en bases de datos de homólogos, lo que reduce la latencia del pipeline y permite trabajar con secuencias huérfanas.
- Modelado de componentes de ácidos nucleicos, según se deduce de las convenciones de átomo representativo de la model card (C4 para purinas, C2 para el resto de clases conocidas, C1′ para clases desconocidas), además de proteínas (CB, CA).
- Puntuación de fiabilidad mediante cabezas de confianza y destograma, utilizables para filtrar predicciones de baja calidad.
- Diseño de secuencias de binders de proteína mediante el modelo de inversión diferenciable expuesto en las variantes experimentales.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales: actualizaciones recurrentes del tronco (4) y muestreo por difusión (14 pasos); no se documentan modos de "thinking", visión ni audio.

## Casos de uso

- Cribado masivo de secuencias en metagenómica: al operar sin MSA, el modelo puede plegar secuencias de proteínas desconocidas procedentes de genomas o metagenomas directamente, sin construir alineamientos ni mantener bases de datos de homólogos, lo que abarata el proceso por secuencia.
- Triaje previo a modelos de mayor coste: con ~504 M de parámetros y 24 bloques de plegado, este checkpoint sirve como primera pasada sobre miles de candidatos; las cabezas de confianza permiten seleccionar un subconjunto que se reprocesará con la variante completa de 48 bloques y condicionamiento por MSA.
- Optimización de secuencias de binders: el modelo de inversión diferenciable permite ajustar la secuencia del binder contra una diana especificada como secuencia de una letra, construyendo cada complejo a partir de dos cadenas lineales.
- Validación de constructos de ingeniería de proteínas: plegado rápido de variantes puntuales o truncamientos para detectar cambios topológicos antes de expresar la proteína en laboratorio.
- Prototipado e investigación en una sola GPU: al caber en GPUs de consumo, permite a grupos pequeños reproducir experimentos de plegado y comparar checkpoints de la serie de escalado (250k, 500k, 750k, 1000k, 1500k pasos) para estudiar curvas de aprendizaje.
- Docencia y formación técnica: ejecución local del pipeline `ofoldx.pipeline("fold", ...)` para ilustrar el flujo ESMC → tronco recurrente → difusión → destograma/confianza sin depender de servicios externos.
- Análisis de regiones con baja homología: escenarios en los que un MSA aportaría poca señal (proteínas de diseño, secuencias sintéticas) y donde la variante single-sequence evita sesgos introducidos por alineamientos pobres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de pLDDT, RMSD, TM-score, éxito de diseño ni comparaciones cuantitativas con otros modelos de plegado, y tampoco se han encontrado datos de este tipo en la búsqueda web realizada.

## Requisitos de hardware

- Pesos en fp32: 2,02 GB (cálculo directo: 504.108.490 parámetros × 4 bytes), coherente con el tamaño de repositorio de 2,0 GB.
- Pesos en fp16/bf16: ~1,01 GB (estimación por cálculo, no verificada contra una conversión publicada).
- VRAM total: no disponible de forma oficial. Además de los pesos, hay que contabilizar las activaciones del tronco recurrente y la pista de pares, cuyo coste crece de forma cuadrática con el número de residuos de la secuencia (canal de pares de 256); las secuencias largas dominarán el consumo de memoria frente a los pesos.
- GPU recomendadas: para secuencias cortas y prototipado, RTX 4090 o RTX 3090 (24 GB); para lotes grandes o secuencias largas, A100 (40/80 GB) o H100. El modelo debería caber en GPUs de consumo de 8-12 GB para entradas cortas, aunque este extremo no está verificado en la información disponible.
- Despliegue: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`, `ofoldx.pipeline("fold", model=...)`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, motores orientados a modelos de lenguaje y no a modelos de plegado.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, la inferencia implica 4 actualizaciones recurrentes del tronco y 14 pasos de muestreo por difusión.

## Comparativa con modelos similares

Comparación dentro de la propia familia ESMFold2, con los datos de la model card. La columna de parámetros corresponde al modelo completo con backbone ESMC de 6B; este checkpoint no figura en esa tabla, por lo que su cifra se toma de los safetensors.

| Variante | Bloques de plegado | MSA | ESMC | Parámetros (M) | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (Fast-base300M-step750k) | No disponible (serie Fast) | No | ~300 M | 504,108 | AGPL-3.0 |
| ESMFold2 | 48 | Sí | 6B | 6.586,242 | No verificada en la información disponible |
| ESMFold2 Fast | 24 | No | 6B | 6.548,432 | No verificada en la información disponible |
| Experimental | 48 | Sí | 6B | 6.568,980 | No verificada en la información disponible |
| Experimental Fast | 24 | No | 6B | 6.531,170 | No verificada en la información disponible |

No se dispone de datos para comparar con alternativas externas (AlphaFold2, AlphaFold3, ESMFold de primera generación u otros predictores): la información proporcionada no incluye métricas ni especificaciones de esos modelos, y no se han inventado cifras.

## Limitaciones y advertencias

- Implementación no oficial: la model card declara explícitamente que los autores originales de ESMFold2 (Biohub) no escribieron, revisaron ni respaldan esta implementación ni su model card.
- Checkpoint experimental: pertenece a una serie de escalado de 15 checkpoints y no es la variante de producción; su calidad esperada es inferior a la de los modelos completos de 48 bloques con MSA.
- Sin condicionamiento por MSA: la variante Fast pierde la evidencia evolutiva, lo que puede degradar la precisión en proteínas con homólogos distantes o en regiones de baja conservación.
- Riesgo de predicciones poco fiables: como todo modelo de plegado, puede producir coordenadas plausibles pero incorrectas. Es imprescindible usar las cabezas de confianza y destograma para filtrar; no se han publicado umbrales recomendados.
- Contrato numérico estricto: los valores no finitos activos son peticiones inválidas y los valores fuera del rango del dtype se consideran no soportados; los valores ausentes deben ir enmascarados. Una integración que no respete este contrato puede producir errores o resultados silenciosamente corruptos.
- Restricción de entrada en diseño de binders: la diana debe ser una secuencia de proteína en código de una letra; no se admiten estructuras ni rutas de fichero, y cada complejo se construye con dos cadenas lineales, lo que excluye ligandos, modificaciones u otras arquitecturas multiméricas en ese flujo.
- Licencia AGPL-3.0: licencia copyleft fuerte. El uso comercial es posible, pero obliga a distribuir el código fuente derivado bajo la misma licencia y, por la cláusula de red, también a quien interactúe con el servicio a través de una red. Conviene revisarlo con asesoría legal antes de integrarlo en un producto.
- Idiomas: el modelo no procesa lenguaje natural; cualquier expectativa de soporte multilingüe es inaplicable.
- Sesgos: no se documentan análisis de sesgo. En el dominio biológico, el sesgo relevante sería la infrarrepresentación de ciertas familias proteicas en los datos de entrenamiento, dato que no se ha publicado.
- Dependencia de la librería `ofoldx`: no hay una vía de ejecución alternativa documentada, lo que añade un riesgo de mantenimiento y de compatibilidad de versiones.
- Descargas y validación comunitaria nulas en el momento de la consulta (0 descargas, 0 likes), por lo que no existe evidencia externa de reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-experimental-fast-base300m-step750k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante rápida: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental rápida: https://huggingface.co/oteam/esmfold2-experimental-fast
- Código de la implementación (OFoldX): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Artículo: https://biohub.ai/papers/esm_protein.pdf
- Repositorio original (Biohub): https://github.com/Biohub/esm
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre el modelo; los resultados obtenidos no guardan relación con ESMFold2 ni con predicción de estructura de proteínas.
