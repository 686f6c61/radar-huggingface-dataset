# morealcholplz/ttt-vla-robomme-persistent-nmt-t4-optimized-r2-step13000

## Resumen

Este repositorio aloja un checkpoint intermedio de 13.000 pasos de optimizador procedente de un experimento de *test-time training* (TTT) persistente sobre el benchmark RoboMME. No es un modelo nuevo desde cero: es un ajuste de la familia NVIDIA GR00T N1.6-3B, un modelo vision-lenguaje-acción (VLA) para robótica, combinado con el componente Eagle-Block2A-2B-v2. El autor lo publica explícitamente como material de evaluación reproducible, no como el mejor checkpoint de la serie.

La innovación principal es la incorporación de memoria persistente dentro de cada episodio mediante TTT con *fast weights* y una rama de atención de *moment tokens* (HAMLET). En lugar de depender solo del contexto textual, el modelo actualiza pesos rápidos en inferencia con un objetivo auto-supervisado de predicción del siguiente *moment token* (NMT), con horizonte T=4, ventana de memoria 4 y stride 16. La cabeza de acción es generativa por difusión, con horizonte de acción 16 y 4 pasos de inferencia.

Con 3.432.385.472 parámetros (≈3,43 B) en bfloat16 y un repositorio de 6,9 GB, es un modelo de tamaño medio orientado a manipulación robótica, no a generación de texto. Su relevancia actual es de nicho pero clara: permite estudiar si la adaptación en tiempo de test mejora la memoria de políticas generalistas en tareas de horizonte largo, y comparar ese enfoque contra el checkpoint base sin memoria persistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre NVIDIA GR00T N1.6-3B (componente Eagle-Block2A-2B-v2) con memoria persistente por test-time training y rama de atención de moment-token (HAMLET); cabeza de acción generativa por difusión |
| Parametros totales | 3.432.385.472 (≈3,43 B) |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (no se declara ventana de contexto textual; la configuración TTT usa ventana de memoria 4, stride 16 y horizonte de acción 16) |
| Tipos de cuantizacion | No disponible; los pesos se publican en bfloat16 |
| Idiomas soportados | No disponible (modelo orientado a instrucciones de manipulación robótica, no a texto multilingüe) |
| Licencia | other (otros); el modelo base, el dataset y la implementación original conservan sus propias licencias y términos |
| Formato de pesos | safetensors (shards) con `library_name: transformers`; el repo incluye además ficheros de processor y estadísticas |

## Arquitectura y entrenamiento

La base es GR00T N1.6-3B, un VLA con esquema de dos sistemas: un backbone de visión-lenguaje (System 2) que interpreta imágenes e instrucciones, y un módulo de acción (System 1) que genera secuencias motoras. En este checkpoint, la generación de acciones se hace por difusión con 4 pasos de inferencia y un horizonte de acción de 16. El autor declara el uso de `bfloat16`, un batch global de 32 (16 por GPU en 2 GPU) y semilla de dataset 42. El ajuste se realizó sobre datos locales de entrenamiento de RoboMME.

La modificación central es el TTT persistente. Durante el episodio, el modelo mantiene memoria en *fast weights* de una sola capa rápida (`fast_layers: 1`), actualizadas con un objetivo interno de predicción del siguiente *moment token*, mini-batch interno de 1, tasa de aprendizaje interna de 0,1 (aprendible), recorte de gradiente interno de 1,0, horizonte T=4, ventana de memoria 4 y stride 16. La puerta residual se inicializa en 0,001, lo que arranca la contribución de la memoria casi anulada y la deja crecer durante el entrenamiento. Es un esquema heredado de la línea RoboTTT y de la atención de *moment tokens* de HAMLET, aplicado aquí dentro de un episodio, no entre episodios.

El archivo publicado es un checkpoint intermedio (paso 13.000). El repositorio incluye shards del modelo, processor, estadísticas, configuración del experimento y metadatos del entrenador, pero excluye intencionadamente estados del optimizador DeepSpeed, estados de RNG y ficheros de reinicio: sirve para inferencia y evaluación, no para reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de acciones robóticas: produce *chunks* de acción de horizonte 16 mediante difusión con 4 pasos de inferencia, condicionados por observaciones visuales e instrucciones.
- Memoria persistente intra-episodio: mantiene y actualiza pesos rápidos a lo largo de un mismo episodio, lo que permite retener información de momentos anteriores sin depender solo de una ventana de contexto.
- Comprensión de instrucciones en lenguaje natural: hereda del backbone de visión-lenguaje del modelo base la capacidad de interpretar instrucciones y escenas visuales.
- Aprendizaje en tiempo de test: la actualización interna se ejecuta durante la inferencia con un objetivo auto-supervisado de predicción del siguiente *moment token*, sin etiquetas externas.
- Control de manipulación de horizonte largo: la combinación de memoria persistente y horizonte de acción 16 está pensada para tareas donde el estado relevante ocurrió muchos pasos atrás.
- *Tool calling* / *function calling*: no disponible; no es una capacidad descrita para este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso textual: no disponible; el modelo actúa en el bucle percepción-acción robótico, no como agente conversacional.
- Capacidades multilingües: no disponible.
- Capacidades especiales: *thinking mode* o audio no disponibles; la capacidad diferencial es el TTT persistente con rama de atención de *moment tokens*.

## Casos de uso

- Evaluación reproducible de TTT en robótica: cargar este checkpoint con el codebase de `ttt-vla` y medir la tasa de éxito en RoboMME frente al checkpoint base, manteniendo fijos los artefactos de *rollout*.
- Investigación sobre memoria en políticas generalistas: analizar en qué tareas de horizonte largo la memoria persistente aporta ventaja y en cuáles introduce ruido, variando ventana de memoria, stride y horizonte T.
- Estudios de ablación de hiperparámetros internos: comparar configuraciones de tasa de aprendizaje interna (0,1 aprendible), recorte de gradiente (1,0) y número de capas rápidas (1) para aislar su efecto en el rendimiento.
- Manipulación con dependencia temporal: escenarios donde el robot debe recordar la posición o el estado de un objeto visto decenas de pasos antes, aprovechando la memoria de episodio y el stride 16.
- Prototipado en laboratorio con hardware modesto: sus 3,43 B de parámetros permiten evaluar en una sola GPU de 24 GB, algo fuera de alcance para VLA de 7 B o más en bfloat16.
- Base para experimentos de adaptación en tiempo de test en dominios propios: sustituir los datos de RoboMME por un dataset propio de manipulación y reentrenar el bucle TTT interno.
- Comparación de arquitecturas de memoria: contrastar la rama de atención de *moment tokens* frente a alternativas de memoria explícita (búferes, resúmenes de estado) bajo el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card advierte que este checkpoint no debe interpretarse como una tasa de éxito reportada en RoboMME y que la evaluación de *rollout* debe hacerse con el codebase original y sus artefactos. En los resultados de la búsqueda web no se ha encontrado ningún dato de rendimiento asociado al modelo.

## Requisitos de hardware

- Pesos en bfloat16: 3.432.385.472 parámetros × 2 bytes ≈ 6,9 GB, cifra coherente con el tamaño del repositorio (6,9 GB).
- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no confirmado por el autor): ≈10-14 GB en bfloat16 contando activaciones del backbone visual, la cabeza de difusión y el estado de la capa rápida; ≈4-5 GB en int8 y ≈2-3 GB en int4 si se generasen versiones cuantizadas, que no están publicadas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y barridos de configuración; A6000, L40S, RTX 4090 o RTX 3090 (24 GB) para inferencia de una sola instancia. El experimento de referencia se entrenó en 2 GPU con 16 muestras por GPU.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090) con margen razonable en bfloat16; en tarjetas de 16 GB el margen es ajustado y dependería del tamaño de lote y de la resolución de las observaciones.
- Opciones de despliegue: `transformers` junto con el codebase de `ttt-vla` y el pipeline del modelo base GR00T. Los runtimes de LLM convencionales (vLLM, TGI, Ollama, llama.cpp/GGUF) no cubren una cabeza de acción por difusión ni el bucle TTT, por lo que no son una vía de despliegue válida aquí; el tag `endpoints_compatible` de HuggingFace no implica compatibilidad funcional sin código personalizado.
- Latencia y throughput: no disponibles. La carga computacional adicional del TTT en inferencia depende del número de actualizaciones internas por episodio y no se cuantifica en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ttt-vla RoboMME, paso 13000) | 3,43 B | No disponible (memoria TTT: ventana 4, stride 16; horizonte de acción 16) | No publicado | other | HuggingFace, 0 descargas, 0 likes |
| nvidia/GR00T-N1.6-3B (modelo base) | Familia declarada de 3 B | No disponible | No disponible en esta ficha | No disponible (licencia propia de NVIDIA) | HuggingFace |
| OpenVLA-7B | 7 B | No disponible | No disponible en esta ficha | Consultar (componentes Llama-2) | HuggingFace y repositorio público |
| RDT-1B | 1,2 B | No disponible | No disponible en esta ficha | No disponible | HuggingFace |

La comparación cuantitativa no es posible con los datos disponibles: no hay resultados de benchmarks publicados para este checkpoint y las alternativas citadas no se han verificado aquí con cifras. La diferencia estructural frente a OpenVLA o RDT-1B es el mecanismo de memoria persistente por TTT dentro del episodio, ausente en los modelos puramente feed-forward de su categoría.

## Limitaciones y advertencias

- No es un checkpoint final: el autor lo describe como un punto intermedio del paso 13.000, archivado para reproducibilidad, sin afirmar que sea el de mejor rendimiento.
- Sin métricas de éxito: la model card prohíbe explícitamente interpretar el checkpoint como una tasa de éxito en RoboMME. No hay benchmarks, curvas de evaluación ni comparaciones publicadas.
- Licencia `other`: no se detallan los términos de uso comercial. El modelo base (NVIDIA GR00T), el dataset RoboMME y la implementación original mantienen sus propias licencias, que hay que revisar antes de cualquier uso en producción.
- Exclusión de estados de entrenamiento: no incluye estados del optimizador DeepSpeed ni estados de RNG, por lo que no permite reanudar el entrenamiento de forma exacta, solo inferencia y evaluación.
- Dependencia del codebase: requiere el proyecto `ttt-vla` y el entorno del modelo base; no es cargable en runtimes estándar de LLM.
- Riesgo de deriva de memoria: la actualización de pesos rápidos dentro del episodio puede acumular error y degradar el comportamiento en episodios largos si los pesos se desvían del estado entrenado.
- Especialización estrecha: el ajuste se hizo sobre datos locales de RoboMME, lo que reduce la generalización a otras morfologías, cámaras, tareas o dominios sin reentrenamiento.
- Idiomas: no se declara ningún idioma soportado; las instrucciones del modelo base suelen formularse en inglés y no hay evidencia de cobertura multilingüe.
- Adopción nula verificable: 0 descargas y 0 likes en el momento del registro, sin validación por terceros ni informes de reproducción independientes.
- Resultados de búsqueda web no utilizables: las consultas devolvieron únicamente páginas genéricas de YouTube, sin relación con el modelo ni con RoboMME.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morealcholplz/ttt-vla-robomme-persistent-nmt-t4-optimized-r2-step13000
- Proyecto de código fuente: https://github.com/Star-ry/ttt-vla
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset RoboMME: no disponible en la información proporcionada
- Papers, blogs o demos: no disponible en la información proporcionada (los resultados de la búsqueda web no contenían enlaces relevantes)
