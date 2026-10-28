# oteam/esmfold2-experimental-fast-base300m-step500k

## Resumen

`oteam/esmfold2-experimental-fast-base300m-step500k` es un checkpoint de escalado perteneciente a la familia ESMFold2, un modelo de predicción de estructura biomolecular *all-atom* que trabaja sobre representaciones del modelo de lenguaje de proteínas ESMC. Lo publica el usuario `oteam` como implementación no oficial (OFoldX) del ESMFold2 original de Biohub; los autores originales no han revisado ni respaldado esta implementación. El modelo resuelve el problema de predecir coordenadas 3D de complejos biomoleculares directamente a partir de secuencia, sin alineamiento múltiple de secuencias (MSA) en esta variante *fast*.

El repositorio contiene 504.108.490 parámetros en safetensors (2,0 GB), lo que corresponde al módulo de plegado y cabezas asociadas; la arquitectura completa descrita en la model card para las variantes *fast* con backbone ESMC 6B asciende a 6.548 millones de parámetros, de los cuales el ESMC está congelado. El sufijo `base300M-step500k` indica que este checkpoint concreto emplea una representación ESMC de 300 millones de parámetros y fue extraído en el paso 500.000 de un barrido de escalado.

Su relevancia es doble: por un lado sirve para estudiar cómo escala la calidad del plegado con el tamaño del backbone y los pasos de entrenamiento; por otro, la rama *experimental* expone el modelo de inversión diferenciable utilizado para el diseño de secuencias de binders de proteínas. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de plegado recurrente *all-atom* condicionado por ESMC, con cabeza de difusión para generación de coordenadas, más cabezas de distograma y confianza |
| Parametros totales | 504.108.490 (pesos publicados en el repo, según safetensors); la model card declara 6.531,170 M para la variante Experimental Fast completa con ESMC 6B congelado |
| Parametros activos | No aplica (no es un modelo MoE; es denso) |
| Longitud de contexto | No disponible (modelo biológico; la longitud máxima de secuencia no está documentada y el coste de la representación de pares escala de forma cuadrática con la longitud) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ documentadas |
| Idiomas soportados | No disponible / no aplica: procesa secuencias de aminoácidos y ácidos nucleicos, no lenguaje natural |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (repositorio de 2,0 GB), librería `ofoldx` |

Parámetros estructurales declarados en la model card para la variante Experimental Fast: 24 bloques de plegado, sin MSA, 4 actualizaciones recurrentes, 14 pasos de muestreo, tamaño de token 768, tamaño de par 256, tamaño de simple 384 y tamaño de átomo 128.

## Arquitectura y entrenamiento

ESMFold2 combina tres componentes. Primero, un modelo de lenguaje ESMC congelado que proporciona representaciones por token a partir de la secuencia. Segundo, un tronco de plegado recurrente que actualiza de forma iterativa las características de token y de par (4 actualizaciones en esta variante). Tercero, una cabeza de difusión que genera coordenadas atómicas en 14 pasos de muestreo, tras la cual las cabezas de distograma y de confianza puntúan el resultado. La variante *fast* reduce el tronco a 24 bloques y elimina la condicionización por MSA, lo que habilita el modo de secuencia única descrito por los autores originales como un orden de magnitud más rápido que el modo con MSA.

Este checkpoint pertenece al conjunto de *critics* experimentales liberados junto a los modelos principales: los `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k`. Es decir, se trata de un punto intermedio de una curva de escalado (backbone de 300 M y 500 k pasos), pensado para evaluar el efecto del tamaño del backbone y del cómputo de entrenamiento. La model card no detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO; esa información no está disponible.

Como innovación destacable, las variantes experimentales exponen el modelo de inversión diferenciable empleado para el diseño de secuencias de binders: el sistema construye cada complejo objetivo-binder a partir de dos cadenas proteicas lineales nuevas y utiliza el modelo como *critic* puntuable dentro del bucle de optimización de secuencias.

## Capacidades

- Predicción de estructura 3D *all-atom* de biomoléculas (proteínas y ácidos nucleicos) directamente desde secuencia.
- Modo de secuencia única: esta variante *fast* no consume MSA, lo que elimina la fase de búsqueda de homólogos.
- Puntuación mediante cabezas de distograma y de confianza sobre la estructura generada.
- Diseño de binders de proteínas: las variantes experimentales incorporan el modelo de inversión diferenciable usado para optimizar secuencias de unión.
- Función de *critic* / puntuador dentro de bucles de optimización de secuencias (es un checkpoint de la familia de *critics* experimentales).
- Gestión explícita de máscaras de disponibilidad atómica: los límites de coordenadas consumen una proyección numérica finita y los valores no disponibles se seleccionan bajo máscara antes de cualquier conversión de tipo.
- Convención de átomo representativo definida: CB de proteína, después CA, después el primer átomo admitido; para nucleótidos, C4 en clases púricas o C2 en el resto de clases conocidas, después C1′, después el primer átomo.
- No soporta *tool calling*, agentes, matemáticas, código ni visión: no es un modelo de lenguaje general.

## Casos de uso

- Cribado estructural rápido de monómeros: al operar en modo de secuencia única con 24 bloques, permite plegar rápidamente bibliotecas de secuencias candidatas y filtrar por confianza antes de pasar a métodos más caros.
- Análisis de escalado en investigación: al ser un punto `base300M-step500k` de la curva de *critics*, sirve para medir la contribución del tamaño del backbone y de los pasos de entrenamiento a la calidad del plegado, comparándolo con los checkpoints `step250k`, `750k`, `1000k` y `1500k`.
- Diseño de binders proteicos: integrado en el protocolo experimental, el modelo participa en la construcción de complejos objetivo-binder de dos cadenas lineales y en la puntuación de secuencias generadas por el modelo de inversión.
- Puntuación y *reranking* en pipelines de diseño: como *critic*, puede ordenar propuestas de secuencia producidas por otros generadores según la coherencia estructural predicha.
- Anotación estructural de proteínas de metagenómica: para secuencias huérfanas sin homólogos identificables, el modo sin MSA evita depender de un alineamiento que no existiría.
- Generación de conformeros de partida para docking o simulaciones: la salida de coordenadas *all-atom* puede inicializar herramientas de acoplamiento molecular.
- Validación docente y reproducibilidad: al publicarse pesos y código en `ofoldx`, permite reproducir el pipeline de plegado y de diseño en entornos académicos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este checkpoint no incluye métricas (DockQ, lDDT, TM-score ni similares), y las referencias encontradas sobre la superioridad de ESMFold2 en *pass-rate* DockQ en Foldbench para complejos proteína-proteína y antígeno-anticuerpo corresponden al modelo completo de Biohub, no a este checkpoint de escalado, y no aportan cifras en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: los pesos publicados suman 2,0 GB en el repositorio, lo que implica aproximadamente 2 GB en FP32 y alrededor de 1 GB en BF16/FP16 solo para parámetros. A ello hay que añadir activaciones, cuyo término dominante es la representación de pares de dimensión 256, que crece de forma cuadrática con la longitud de la secuencia.
- Estimación orientativa solo del tensor de pares en FP32: para 200 residuos, 200×200×256×4 ≈ 41 MB por tensor; para 500 residuos ≈ 256 MB; para 1.000 residuos ≈ 1 GB. Con 4 actualizaciones recurrentes y varias capas, el consumo real es varias veces superior.
- GPU recomendadas: no hay recomendaciones oficiales publicadas. Por tamaño, una RTX 3060 de 12 GB o una RTX 4090 de 24 GB deberían cubrir secuencias de unos cientos de residuos; para secuencias largas o lotes grandes se justifican A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí para secuencias cortas y medias, dado el tamaño de 504 M de parámetros; la longitud máxima viable no está documentada.
- Opciones de despliegue: únicamente la librería `ofoldx` (`pip install ofoldx`) sobre PyTorch, mediante `ofoldx.pipeline("fold", model="oteam/esmfold2")`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica cualitativamente que el modo de secuencia única es un orden de magnitud más rápido que el modo con MSA.

## Comparativa con modelos similares

| Modelo | Bloques de plegado | MSA | Backbone ESMC | Parametros (M, según model card) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (`experimental-fast-base300m-step500k`) | 24 | No | 300 M (según nombre del checkpoint) | 504,1 en el repo; 6.531,170 para la variante Experimental Fast completa | AGPL-3.0 | HuggingFace (oteam) y réplicas |
| `oteam/esmfold2` | 48 | Sí | 6B | 6.586,242 | AGPL-3.0 | HuggingFace (oteam) |
| `oteam/esmfold2-fast` | 24 | No | 6B | 6.548,432 | AGPL-3.0 | HuggingFace (oteam) |
| `oteam/esmfold2-experimental` | 48 | Sí | 6B | 6.568,980 | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold (predecesor) | No disponible | No | No disponible | No disponible | No disponible | Repositorio Biohub |

La comparación relevante es interna a la familia: este checkpoint intercambia el backbone de 6B por uno de 300 M y reduce el tronco a 24 bloques sin MSA, lo que reduce el coste computacional a cambio de una calidad de plegado no cuantificada en la información disponible. No se dispone de datos para compararlo numéricamente con AlphaFold2, AlphaFold3 ni Boltz.

## Limitaciones y advertencias

- Implementación no oficial: la model card declara explícitamente que es una implementación de OFoldX y que los autores originales de ESMFold2 no la escribieron, revisaron ni respaldaron.
- Checkpoint experimental de escalado: no es un modelo final; su calidad queda por debajo de los puntos `step1000k` y `step1500k` de la misma curva, aunque no se publican métricas que lo cuantifiquen.
- Sin MSA en esta variante: pierde la evidencia evolutiva que sí usan las variantes de 48 bloques, lo que puede degradar la precisión en secuencias con pocos homólogos o en regiones de baja conservación.
- Riesgo de alucinación estructural: como todo modelo generativo de coordenadas, puede producir conformaciones plausibles pero incorrectas; las cabezas de confianza deben usarse como filtro, no como garantía.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes. El uso comercial en un servicio de red exige liberar el código fuente correspondiente; conviene revisión legal antes de integrarlo en un producto.
- Idiomas: no es un modelo de lenguaje; no procesa texto ni admite instrucciones en lenguaje natural.
- Longitud de secuencia máxima no documentada: el crecimiento cuadrático de la representación de pares limita el uso práctico en complejos grandes.
- Contrato geométrico estricto: los valores no finitos activos se consideran peticiones inválidas y los valores finitos fuera del rango del dtype del modelo son un rango numérico no soportado; los fallos de entrada no se corrigen de forma silenciosa.
- En diseño de binders, el objetivo debe ser una secuencia proteica de una letra: no se aceptan estructuras ni rutas de fichero como objetivo, y cada complejo se construye con dos cadenas lineales nuevas.
- Sin datos de sesgos, composición del dataset ni evaluación de robustez publicados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-experimental-fast-base300m-step500k
- Réplica del autor original: https://huggingface.co/biohub/ESMFold2-Experimental-Fast-base300M-step500k
- Réplica de terceros: https://huggingface.co/Synthyra/ESMFold2-Experimental-Fast-base300M-step500k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante rápida: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Repositorio de la librería: https://github.com/OTeam-AI4S/OFoldX
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio original: https://github.com/Biohub/esm
- Página del modelo en Biohub: https://www.biohub.ai/models/esmfold2
- Portal de la comunidad: https://esmfold2.com/esmfold2-github
- README de referencia: https://github.com/atong01/esmfold2/blob/main/README.md
