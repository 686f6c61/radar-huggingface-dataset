# gabe-adib/ove3-ladder-440m-attnres-seed4321

## Resumen

`ove3-ladder-440m-attnres-seed4321` es un checkpoint de investigación publicado por el usuario de Hugging Face gabe-adib (Gabe Adib Corp). No es un modelo listo para producto: es un artefacto de un experimento denominado "ove3 intervention ladder", concretamente la segunda semilla (seed 4321) de una de las celdas de la escalera. La celda combina una arquitectura MoE de estilo `kimi_linear` con 440M de parámetros activos y una modificación denominada Attention Residuals (AttnRes, con block size 2). El resto de la receta (datos, learning rate, batch, pasos) es la de la celda IsoFLOP de 440M del recetario original.

El objetivo del artefacto es permitir la reproducibilidad y el análisis de una ablación: comparar el efecto de AttnRes y de la atención lineal sobre una misma configuración de cómputo. El checkpoint publicado es `best_1`, en la iteración 27.200, con una loss de validación de 1,0516 y una loss held-out de 1,1434 nats/char ponderada por mezcla sobre 9 dominios (el desglose por dominio está en el fichero `DOMAIN_NLL.txt` del repositorio).

Su relevancia es, por tanto, exclusivamente investigadora: interesa a quien estudie arquitecturas híbridas de atención, mezclas de expertos de bajo coste por token o metodología de ablaciones controladas. No hay información publicada sobre licencia, idiomas, contexto soportado ni formato de pesos listo para inferencia, y el repositorio (70,5 GB) contiene el checkpoint distribuido de Megatron junto con el estado del optimizador, además de logs y configuración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE de atención lineal, variante `kimi_linear`, con Attention Residuals (AttnRes, block size 2) |
| Parámetros totales | no disponible |
| Parámetros activos | 440M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados; el checkpoint está en el formato de entrenamiento) |
| Idiomas soportados | no disponible (la evaluación cubre 9 dominios, sin especificar idiomas) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint distribuido de Megatron (`checkpoint/`, `best_1`, con estado del optimizador incluido); no se publican safetensors, GGUF ni binarios de inferencia |
| Semilla | 4321 |
| Iteración del checkpoint | 27.200 (`best_1`) |
| Loss de validación (LM) | 1,0516 |
| Loss held-out | 1,1434 nats/char (mezcla ponderada sobre 9 dominios) |
| Tamaño del repositorio | 70,5 GB |
| Autor | gabe-adib (Gabe Adib Corp) |
| Fecha de creación | 2026-10-17 |
| Fecha de actualización | 2026-10-17 |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 440M de parámetros activos por token, construida sobre una variante de atención lineal de la familia `kimi_linear`. Sobre esa base se aplica la intervención que da nombre al experimento: Attention Residuals (AttnRes) con block size 2, es decir, una modificación del mecanismo de conexiones residuales que agrupa bloques de dos capas. El checkpoint corresponde a la segunda semilla de la escalera de intervenciones, lo que sugiere que existe al menos otra ejecución con semilla distinta y presumiblemente otras celdas de la misma escalera; esta ficha solo cubre la semilla 4321.

El entrenamiento sigue la receta de la celda IsoFLOP de 440M: mismos datos, mismo learning rate, mismo batch y mismo número de pasos que el resto de la escalera, de modo que la única variable modificada sea la intervención arquitectónica. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; todo apunta a un modelo base preentrenado sin alineamiento posterior. El repositorio incluye los logs de entrenamiento en segmentos de 4 horas, los logs de scoring y los eventos de TensorBoard, además del `config.yaml` con la configuración exacta de la ejecución, lo que permite reconstruir la curva de entrenamiento y auditar hiperparámetros.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje causal; no se documenta ningún otro modo de salida.
- Modelo base sin ajuste por instrucciones: no hay evidencia de formato de chat, plantilla de conversación ni alineamiento.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes o razonamiento multi-paso: no documentado; al no haber post-entrenamiento, no cabe esperar capacidades agénticas fiables.
- Capacidades multilingües: no disponibles; los 9 dominios de evaluación no se detallan en la información proporcionada.
- Atención lineal: en principio reduce el coste computacional en secuencias largas frente a atención cuadrática, aunque no se publica ninguna medición de throughput ni de longitud de contexto efectiva.
- Reproducibilidad experimental: el paquete incluye configuración, logs y estado del optimizador, lo que permite reanudar, reevaluar o auditar el run.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de ablaciones arquitectónicas: el paquete incluye `config.yaml`, logs de entrenamiento segmentados y eventos de TensorBoard, de modo que un equipo de investigación puede reconstruir la curva de pérdida y verificar que la intervención AttnRes se aplicó tal y como se describe.
- Estudio del efecto de Attention Residuals: comparar esta ejecución con la primera semilla de la misma celda y con las celdas sin intervención de la escalera permite estimar la varianza entre semillas y aislar el efecto de agrupar residuales en bloques de dos capas.
- Análisis de MoE con atención lineal: con 440M de parámetros activos y una atención que evita el coste cuadrático, el checkpoint sirve para medir empíricamente el equilibrio entre calidad y cómputo por token en modelos de esta escala.
- Evaluación por dominio: el fichero `DOMAIN_NLL.txt` permite analizar en qué dominios la intervención mejora o degrada la pérdida, útil para decidir la composición de datos de futuros runs.
- Punto de partida para fine-tuning controlado: al conservar el estado del optimizador y la configuración, es posible continuar el entrenamiento con presupuesto adicional y medir si la ventaja de la intervención se mantiene a más tokens.
- Estudio de estabilidad entre semillas: con dos semillas de la misma celda se puede estimar la variabilidad de la loss de validación (1,0516 en esta ejecución) y decidir si las diferencias observadas entre variantes arquitectónicas son significativas.
- Material docente y de auditoría metodológica: el run completo, con logs "tal como se escribieron", sirve como ejemplo de trazabilidad en experimentos de escalado con presupuesto IsoFLOP fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son métricas de pérdida del propio entrenamiento:

| Métrica | Valor | Contexto |
|---|---|---|
| Loss de validación (LM) | 1,0516 | Checkpoint `best_1`, iteración 27.200 |
| Loss held-out | 1,1434 nats/char | Media ponderada por mezcla sobre 9 dominios; desglose en `DOMAIN_NLL.txt` |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |
| Throughput / latencia | no disponible | — |

Nota metodológica: la pérdida held-out se expresa en nats por carácter, no por token, por lo que no es directamente comparable con valores de pérdida por token de otros modelos salvo que se conozca la tokenización exacta empleada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Se desconocen los parámetros totales del MoE, y son los parámetros totales (incluidos los expertos no activados en cada token) los que determinan la huella de memoria. Como referencia, los 440M de parámetros activos en bf16 ocuparían del orden de 0,9 GB, pero el modelo completo debe residir en memoria.
- El tamaño del repositorio (70,5 GB) no es un indicador de la VRAM de inferencia: incluye el estado del optimizador del checkpoint distribuido de Megatron, que no se necesita para servir el modelo.
- GPU recomendadas: no disponible. Al no publicarse los parámetros totales ni una conversión a formato de inferencia, no es posible dar una recomendación fiable.
- GPU de consumo: no confirmable. Un modelo de 440M activos es manejable en tarjetas de consumo si el total de parámetros es moderado, pero este dato no está publicado.
- Despliegue: el artefacto está en formato de checkpoint distribuido de Megatron, por lo que requiere Megatron-LM o las herramientas de conversión de Megatron a un formato consumible por `transformers`. No se publican pesos en safetensors ni GGUF, de modo que vLLM, TGI, llama.cpp u Ollama no pueden usarse directamente sin una conversión previa y sin verificar la compatibilidad de la atención lineal y de AttnRes con esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la información proporcionada. La comparación más pertinente es interna a la propia escalera de intervenciones del autor, para la que esta ficha solo cubre una celda:

| Modelo | Parámetros activos | Contexto | Loss de validación | Licencia | Formato |
|---|---|---|---|---|---|
| ove3-ladder-440m-attnres-seed4321 | 440M | no disponible | 1,0516 | no disponible | Checkpoint Megatron |
| Primera semilla de la misma celda (no incluida en esta ficha) | 440M (por la celda IsoFLOP) | no disponible | no disponible | no disponible | no disponible |
| Celdas de la misma escalera sin AttnRes | 440M (por la celda IsoFLOP) | no disponible | no disponible | no disponible | no disponible |
| Baseline denso de 440M del mismo recetario | 440M | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la búsqueda web resultados de benchmarks de este modelo ni comparaciones publicadas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: sin una licencia explícita, no hay base legal clara para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- No es un modelo utilizable directamente: es un checkpoint de entrenamiento en formato distribuido de Megatron, con estado del optimizador, y requiere conversión y verificación antes de poder ejecutar inferencia.
- Modelo base sin alineamiento: no hay evidencia de ajuste por instrucciones, RLHF o DPO; es esperable que no siga instrucciones de forma fiable y que pueda generar contenido inapropiado.
- Parámetros totales desconocidos: impide estimar VRAM, coste de servicio y comparaciones justas de eficiencia frente a modelos densos.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que desaconseja su uso en tareas de contexto largo sin validación previa.
- Idiomas no documentados: no se especifica qué idiomas cubre el corpus de entrenamiento ni si el castellano está representado; el rendimiento en español es, a priori, incierto.
- Riesgo de alucinación: propio de un modelo base de 440M activos sin post-entrenamiento; la loss held-out de 1,1434 nats/char no garantiza factualidad.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad, ni la composición del dataset, por lo que no es posible acotar los sesgos presentes.
- Valor experimental, no de producto: la métrica de pérdida está en nats/char sobre 9 dominios, lo que dificulta la comparación directa con modelos evaluados en nats/token o en benchmarks estándar.
- Reproducibilidad dependiente de la infraestructura: reanudar el entrenamiento exige el mismo entorno de Megatron y el mismo paralelismo para cargar el checkpoint distribuido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabe-adib/ove3-ladder-440m-attnres-seed4321
- Perfil del autor en Hugging Face: https://huggingface.co/gabe-adib
- Ficheros del repositorio citados en la model card: `config.yaml`, `DOMAIN_NLL.txt`, `checkpoint/` (best_1), `logs/` (logs de entrenamiento, scoring y TensorBoard)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
