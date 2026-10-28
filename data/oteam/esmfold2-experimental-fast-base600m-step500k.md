# oteam/esmfold2-experimental-fast-base600m-step500k

## Resumen

ESMFold2 es un modelo de predicción de estructura biomolecular all-atom (proteínas y ácidos nucleicos) que también incorpora un modo de diseño de secuencias de binders de proteína. Este repositorio concreto, `oteam/esmfold2-experimental-fast-base600m-step500k`, es un checkpoint de la implementación no oficial OFoldX del modelo descrito en el paper "Language Modeling Materializes a World Model of Protein Biology" (Biohub). Los autores originales no han escrito, revisado ni respaldado esta implementación ni su model card, según declara el propio autor del repo.

El modelo combina un modelo de lenguaje de proteínas ESMC congelado que aporta las representaciones de secuencia, un tronco de plegamiento recurrente que actualiza características de token y de par, y una cabeza de difusión que genera coordenadas antes de que las cabezas de distograma y confianza puntúen el resultado. La variante "fast" usa 24 bloques de plegamiento y no acepta evidencia de MSA (modo single-sequence), frente a los 48 bloques y el condicionamiento por MSA de la variante completa.

Este checkpoint pertenece a la serie de escalado `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k` publicada por el autor, en concreto al punto de 600M de backbone ESMC y 500k pasos de entrenamiento. Es relevante ahora porque permite reproducir curvas de escalado y experimentar con predicción de estructura sin MSA y con diseño de binders sobre una base de código abierta (AGPL-3.0), aunque no hay métricas publicadas ni validación independiente en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de plegamiento recurrente condicionado por representaciones ESMC, con cabeza de difusión para generación de coordenadas y cabezas de distograma y confianza |
| Parámetros totales | 746.187.472 (total real de safetensors del repo). La tabla del autor indica 6.531,170 M para la variante "Experimental Fast", cifra que presupone un backbone ESMC de 6B |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles; el repo distribuye únicamente safetensors y no documenta esquemas de cuantización |
| Idiomas soportados | no disponible (la entrada son secuencias de proteínas y componentes nucleicos, no lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (librería `ofoldx`) |
| Bloques de plegamiento | 24 |
| MSA | no (modo single-sequence) |
| Dimensiones internas | single 384, pair 256, atom 128, token 768 |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo (difusión) | 14 |
| Backbone ESMC | base600m (según el nombre del checkpoint) |
| Paso de entrenamiento | 500k |
| Tamaño del repo | 3,0 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema ESMC-condicionado descrito en la model card: un modelo de lenguaje ESMC congelado produce representaciones de secuencia; un tronco de plegamiento recurrente (24 bloques en esta variante) actualiza iterativamente las características de token y de par con 4 actualizaciones recurrentes y dimensiones internas de 384 (single), 256 (pair), 128 (atom) y 768 (token); una cabeza de difusión genera las coordenadas en 14 pasos de muestreo; finalmente, las cabezas de distograma y de confianza puntúan la estructura resultante. Las variantes "experimental" exponen además el modelo de inversión diferenciable empleado para el diseño de secuencias de binders.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO u optimización preferencial equivalente. Lo que sí se documenta es la existencia de 15 checkpoints de escalado de la familia Fast (`base{300M,600M,6B}-step{250,500,750,1000,1500}k`), lo que sitúa a este modelo como un punto intermedio de una curva de ablación controlada por tamaño de backbone y por pasos de entrenamiento. La model card incluye además un contrato geométrico explícito: las fronteras de coordenadas consumen proyecciones numéricas finitas, los valores no disponibles se seleccionan fuera mediante máscaras antes de cualquier conversión de dtype y tienen derivadas nulas, y se define una convención de átomo representante (CB, luego CA, luego el primer átomo admitido en proteínas; C4 para purinas y C2 para el resto de clases conocidas, luego C1′ en nucleicos).

## Capacidades

- Predicción de estructura all-atom de componentes proteicos y nucleicos a partir de representaciones ESMC.
- Modo single-sequence: esta variante "fast" no requiere MSA, lo que simplifica el pipeline de entrada.
- Generación de coordenadas mediante cabeza de difusión con 14 pasos de muestreo.
- Puntuación de la estructura generada mediante cabezas de distograma (matriz de distancias) y de confianza.
- Diseño de secuencias de binders de proteína en las variantes experimentales, mediante un modelo de inversión diferenciable; el target se introduce como una secuencia de proteína de una letra y cada complejo target-binder se construye con dos cadenas lineales nuevas.
- Manejo de mapas de correspondencia de átomos preparados y de componentes cuya etiqueta biológica no coincide con sus átomos reales.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso en lenguaje natural, agentes, visión ni audio.

## Casos de uso

- Predicción de estructura monomérica en pipelines de alto rendimiento: al funcionar sin MSA y con 24 bloques, encaja en flujos donde se pliegan miles de secuencias y el coste de construir alineamientos múltiples es prohibitivo.
- Cribado de variantes y mutantes: plegar sistemáticamente variantes de una proteína y ordenarlas por las puntuaciones de confianza de las cabezas del modelo para priorizar experimentos de laboratorio.
- Diseño de binders de proteína: usar el artefacto experimental para optimizar secuencias de binder contra un target definido como secuencia de una letra, aprovechando el modelo de inversión diferenciable.
- Modelado de complejos proteína-ácido nucleico: la convención de átomo representante cubre tanto residuos proteicos (CB/CA) como clases nucleicas (C4/C2/C1′), lo que permite tratar componentes mixtos en la misma predicción.
- Estudios de escalado y ablaciones: este checkpoint (base600m, step500k) sirve como punto de comparación frente a los demás puntos de la serie (250k, 750k, 1000k, 1500k) para medir el efecto del número de pasos y del tamaño del backbone ESMC.
- Generación de estructuras de partida para docking o cribado virtual: producir conformaciones all-atom iniciales que alimenten herramientas posteriores de acoplamiento molecular o de diseño racional de fármacos.
- Verificación de constructos en biología sintética: comprobar la plausibilidad estructural de una proteína diseñada antes de su expresión, usando las puntuaciones de confianza como filtro previo.
- Reproducibilidad y docencia: al ser una implementación abierta bajo AGPL-3.0 con código en `ofoldx.models.esmfold2`, permite auditar y replicar el pipeline completo en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe las cabezas de distograma y confianza y el esquema de generación por difusión, pero no incluye valores de métricas de plegamiento (por ejemplo, TM-score, lDDT, RMSD) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia de este checkpoint (746 M de parámetros): aproximadamente 3,0 GB de pesos en fp32 y 1,5 GB en bf16/fp16, a lo que hay que sumar activaciones y el coste de los 14 pasos de difusión, que crece con el número de residuos y átomos de la entrada (no cuantificado en la información disponible).
- Por tamaño de pesos, es esperable que quepa en GPUs de consumo con 8 GB o más (RTX 3060 Ti, RTX 4070, RTX 4090), si bien no hay mediciones publicadas de memoria pico real.
- La variante completa con backbone ESMC de 6B (6.531,17 M de parámetros según la tabla del autor) requiere del orden de 13 GB en bf16 y 26 GB en fp32 solo para pesos, lo que la sitúa en A100 40/80 GB o H100.
- Opciones de despliegue: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`) con `ofoldx.pipeline("fold", model="oteam/esmfold2")`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de lenguaje generativo no existen pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Bloques de plegamiento | MSA | Backbone ESMC | Parámetros (M, tabla del autor) | Licencia |
|---|---|---|---|---|---|
| Experimental Fast base600m-step500k (este repo) | 24 | no | base600m | 746,187 (safetensors reales del repo) | AGPL-3.0 |
| ESMFold2 Experimental Fast | 24 | no | 6B | 6.531,170 | AGPL-3.0 |
| ESMFold2 Fast | 24 | no | 6B | 6.548,432 | AGPL-3.0 |
| ESMFold2 Experimental | 48 | sí | 6B | 6.568,980 | AGPL-3.0 |
| ESMFold2 | 48 | sí | 6B | 6.586,242 | AGPL-3.0 |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones equivalentes para alternativas externas a la familia (por ejemplo, AlphaFold2, AlphaFold3 o RoseTTAFold), por lo que esa comparación figura como no disponible.

## Limitaciones y advertencias

- Implementación no oficial: los autores originales de ESMFold2 no han escrito, revisado ni respaldado este repositorio ni su model card.
- Licencia AGPL-3.0: es una licencia copyleft con cláusula de uso en red; su integración en un servicio accesible por usuarios puede obligar a liberar el código de la aplicación completa. Requiere revisión legal antes de cualquier uso comercial.
- Checkpoint intermedio de una serie de escalado (step500k): no es el punto final de entrenamiento de la familia, por lo que su calidad debe considerarse provisional dentro de la curva.
- La variante "fast" prescinde de evidencia de MSA, lo que en modelos de plegamiento suele limitar la precisión en secuencias con homólogos informativos; no hay métricas publicadas que cuantifiquen esa pérdida.
- Riesgo de confianza mal calibrada: las cabezas de confianza y distograma pueden producir puntuaciones optimistas en regiones desordenadas o en complejos con interfaces poco pobladas; conviene validar con métricas externas antes de tomar decisiones experimentales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han localizado evaluaciones independientes: no hay evidencia externa de robustez en producción.
- El contrato geométrico del modelo trata los valores no finitos activos como peticiones inválidas y los valores finitos fuera del rango del dtype como rango numérico no soportado; es necesario sanear las entradas antes de la inferencia.
- No procesa lenguaje natural: no hay soporte multilingüe, de tool calling ni de comportamiento de agente; cualquier caso de uso conversacional queda fuera de alcance.
- No se documentan sesgos biológicos específicos del dataset de entrenamiento ni la composición de este, lo que impide evaluar sesgos por familia proteica u organismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-experimental-fast-base600m-step500k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante rápida: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental rápida: https://huggingface.co/oteam/esmfold2-experimental-fast
- Código de la implementación (OFoldX): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Repositorio original (Biohub): https://github.com/Biohub/esm
- Paper: https://biohub.ai/papers/esm_protein.pdf
