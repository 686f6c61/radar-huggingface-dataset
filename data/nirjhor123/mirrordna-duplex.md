# nirjhor123/mirrordna-duplex

## Resumen

MirrorDNA-duplex es un modelo de lenguaje de ADN de pequeno tamano (2,50 millones de parametros) desarrollado por nirjhor123. Su caracteristica diferencial es que su tokenizador es exactamente equivariante a la reverse complement: para cualquier valor de los parametros, el router simetrico de fronteras corta una secuencia y su reverse complement en fragmentos espejo, de modo que ambas hebras de una misma molecula de ADN reciben exactamente los mismos tokens. Esta propiedad se mantiene de forma exacta por construccion, no aproximada.

El modelo es un encoder con gating cruzado entre hebras (duplex), pensado como base para clasificacion y regresion de secuencias de ADN mediante fine-tuning. Se preentreno con modelado de lenguaje enmascarado sobre hg38, usando ventanas de 1.024 pb y enmascarando el 15% de las bases.

Es relevante ahora porque la equivarianza a la reverse complement es una simetria fisica fundamental del ADN que la mayoria de los modelos genomicos no garantizan de forma exacta. MirrorDNA la incorpora en la arquitectura y el tokenizador, lo que reduce el sesgo de orientacion en tareas de clasificacion y permite separar explicitamente caracteristicas invariantes de hebra frente a caracteristicas dependientes de orientacion. El modelo es de investigacion, con licencia MIT y codigo publicado junto a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer duplex con gating cruzado entre hebras y router simetrico de fronteras (tokenizador aprendido equivariante a reverse complement) |
| Parametros totales | 2.496.964 (2,50 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 pb (ventanas de preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de ADN: A, C, G, T, N) |
| Licencia | MIT |
| Formato de pesos | safetensors (pytorch); codigo del modelo incluido en el repositorio |

## Arquitectura y entrenamiento

MirrorDNA-duplex es un encoder con gating cruzado entre hebras (duplex) y un router simetrico. La innovacion principal es el tokenizador: un router de fronteras simetrico que segmenta una secuencia y su reverse complement en fragmentos espejo para cualquier valor de los parametros, garantizando equivarianza exacta a la reverse complement. El modelo procesa ambas hebras de forma acoplada mediante el mecanismo de gating cruzado, y expone dos modos de extraccion de caracteristicas: invariantes a la hebra (`pooled_features`) y conscientes de orientacion (`pooled_features(..., oriented=True)`).

El preentrenamiento se realizo con modelado de lenguaje enmascarado sobre el genoma humano hg38, usando los intervalos de entrenamiento de Basenji/Enformer, ventanas de 1.024 pb, 2^20 bases por paso y 10.000 pasos, lo que suma aproximadamente 10,5 miles de millones de bases procesadas, con un 15% de bases enmascaradas. No se indica en la informacion disponible el uso de RLHF, DPO ni otras fases de alineacion.

## Capacidades

- Codificacion de secuencias de ADN en representaciones vectoriales (features pooled) para clasificacion y regresion.
- Equivarianza exacta a la reverse complement: la misma secuencia en ambas hebras produce los mismos tokens.
- Extraccion de caracteristicas invariantes a la hebra, adecuadas para etiquetas que no dependen de la orientacion.
- Extraccion de caracteristicas conscientes de orientacion, para etiquetas dependientes de la hebra (promotores, sitios de splicing, orientacion genica).
- Prediccion de fronteras de fragmentos (`cut`) mediante el router simetrico.
- Tokenizacion aprendida de secuencias de ADN con alfabeto A, C, G, T, N.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Clasificacion de regiones genomicas: fine-tuning del encoder sobre etiquetas funcionales (elementos reguladores, regiones codificantes) usando las caracteristicas invariantes a la hebra, aprovechando que la prediccion no depende de la orientacion de la secuencia de entrada.
- Prediccion de sitios de splicing y promotores: uso de las caracteristicas conscientes de orientacion (`oriented=True`), ya que estas etiquetas dependen de la direccion de la hebra.
- Regresion de senales genomicas: ajuste del modelo para predecir valores continuos por ventana de 1.024 pb, como senales de accesibilidad de cromatina o cobertura, siguiendo el esquema de intervalos de Basenji/Enformer.
- Aumentacion de datos por reverse complement: al ser exactamente equivariante, el modelo permite tratar una secuencia y su reverse complement como la misma entrada para etiquetas invariantes, simplificando pipelines de aumentacion sin introducir inconsistencia entre hebras.
- Investigacion en tokenizacion genomica: el router simetrico sirve como componente reutilizable para estudiar segmentaciones de ADN que respeten la simetria de hebra, comparandolas con tokenizadores k-mer convencionales.
- Prototipado rapido en entornos con pocos recursos: con 2,50 M de parametros, el modelo se puede entrenar y evaluar en una unica GPU de consumo, lo que facilita experimentos de fine-tuning sobre conjuntos de datos pequenos.
- Analisis de orientacion genica: uso de las dos variantes de features para comparar representaciones invariantes y orientadas y detectar asimetrias asociadas a la direccion de transcripcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 2,50 M de parametros, sin contar activaciones; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el codigo del modelo se distribuye junto a los pesos (`rcchunk`) y se carga con PyTorch y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MirrorDNA-duplex | 2,50 M | 1.024 pb | Encoder duplex equivariante a reverse complement | MIT | Hugging Face + GitHub |
| DNABERT-2 | no disponible en la informacion proporcionada | no disponible | Tokenizador BPE para ADN | no disponible | no disponible |
| Nucleotide Transformer | no disponible en la informacion proporcionada | no disponible | Transformer sobre k-mers | no disponible | no disponible |
| HyenaDNA | no disponible en la informacion proporcionada | no disponible | Convoluciones de largo alcance | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada; la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion: pensado principalmente para fine-tuning en clasificacion y regresion, no como modelo listo para produccion sin ajuste.
- Preentrenado unicamente sobre genoma humano (hg38) con ventanas de 1.024 pb; el rendimiento puede degradarse en otros organismos o en contextos mayores.
- Modelo pequeno: segun la propia model card, modelos mas grandes son mas precisos en varios benchmarks.
- Riesgo de alucinacion y de predicciones espurias en regiones fuera de la distribucion de entrenamiento; no se documentan evaluaciones de calibracion.
- Las caracteristicas invariantes a la hebra no son adecuadas para etiquetas dependientes de orientacion; en esos casos debe usarse la variante `oriented=True`.
- No se documentan sesgos especificos ni evaluaciones de equidad; el sesgo del genoma de referencia hg38 se hereda en los datos de preentrenamiento.
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantia ni soporte.
- No se documentan cuantizaciones oficiales ni integracion con frameworks de despliegue estandar.

## Enlaces

- Hugging Face: https://huggingface.co/nirjhor123/mirrordna-duplex
- Codigo: https://github.com/NIRJHOR-DATTA/MirrorDNA
- Paper: *Learning Strand-Equivariant Tokenizations of DNA with MirrorDNA* (RECOMB 2027 submission); no se proporciona enlace directo en la informacion disponible.
