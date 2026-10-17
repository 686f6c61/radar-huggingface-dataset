# gabe-adib/ove3-ladder-185m-exp512-seed4321

## Resumen

`ove3-ladder-185m-exp512-seed4321` es un checkpoint de investigación publicado por el usuario gabe-adib en Hugging Face. Se trata de una de las ejecuciones de la «intervention ladder» ove3: un experimento controlado de arquitectura Mezcla de Expertos (MoE) construido sobre la arquitectura que el autor denomina `kimi_linear`, con 185 millones de parámetros activos, 512 expertos enrutados (el doble que el control de 256) y enrutamiento top-8. Usa la semilla 4321, la segunda semilla de la escalera.

El modelo no es un modelo de propósito general listo para producción: es un artefacto de investigación pensado para aislar el efecto del número de expertos manteniendo constante el resto de la receta IsoFLOP de 185M (mismos datos, learning rate, batch y número de pasos que el control). El checkpoint corresponde a la iteración 18.810, el mejor paso de validación, con una pérdida de validación de 1,0829 y una pérdida held-out de 1,1739 nats/carácter ponderada por mezcla sobre 9 dominios.

Su relevancia es metodológica: permite comparar directamente 512 expertos top-8 frente a 256 con el mismo presupuesto de cómputo activo, y estudiar el comportamiento de arquitecturas híbridas con atención de tipo linear en regímenes de escalado controlados. La model card es mínima, no declara licencia, idiomas ni pipeline, y el repositorio incluye el checkpoint distribuido de Megatron con estado del optimizador, los logs de entrenamiento y el `config.yaml`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE `kimi_linear` (denominación del autor; no se detalla la composición de capas en la model card) |
| Parámetros totales | no disponible (solo se declaran 185M activos) |
| Parámetros activos | 185M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica checkpoint Megatron; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (tokenización a nivel de carácter según la métrica nats/char) |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (`checkpoint/`, con estado del optimizador); no hay safetensors ni GGUF |
| Expertos enrutados | 512 (el control de la misma escalera usa 256) |
| Top-k de enrutamiento | 8 |
| Semilla | 4321 (segunda semilla de la escalera) |
| Iteración del checkpoint | 18.810 (`best_1`) |
| Tamaño del repositorio | 56,8 GB (incluye estado del optimizador, logs y eventos de TensorBoard) |

## Arquitectura y entrenamiento

La arquitectura es una MoE con 185M de parámetros activos por token, 512 expertos enrutados y selección top-8, construida sobre el stack `kimi_linear` que da nombre a la variante. La model card no especifica el número de capas, la dimensión oculta, el tamaño de cada experto ni el mecanismo exacto de atención; la denominación «linear» sugiere atención de tipo linear o híbrida, pero es una inferencia a partir del nombre y no un dato confirmado en la documentación disponible.

El entrenamiento sigue la celda IsoFLOP de 185M de la receta ove3: mismos datos, learning rate, batch y número de pasos que el control, cambiando únicamente el número de expertos (512 frente a 256) y la semilla (4321). El checkpoint seleccionado es el mejor paso de validación de la ejecución, la iteración 18.810, con pérdida de validación de 1,0829. La evaluación held-out se calcula sobre una mezcla ponderada de 9 dominios y se expresa en nats por carácter, lo que implica un tokenizador a nivel de carácter; el desglose por dominio está en `DOMAIN_NLL.txt`, pero la composición del corpus de entrenamiento no se detalla en la información disponible. No se documenta uso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto autorregresiva a nivel de carácter, condicionada por el corpus de 9 dominios de la receta.
- Razonamiento y conocimiento factual: no evaluados ni documentados; no hay benchmarks estándar publicados.
- Código y matemáticas: no evaluados en la información disponible.
- Tool calling / function calling: no documentado; no hay plantilla de chat ni formato de herramientas publicado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; el tokenizador a nivel de carácter puede representar cualquier secuencia de bytes o caracteres, pero no hay evaluación por idioma.
- Capacidades especiales: ninguna declarada (sin modo thinking, visión ni audio).
- Al ser un checkpoint de investigación, su capacidad real está ligada a la continuación de entrenamiento o al fine-tuning, no al uso directo.

## Casos de uso

- Ablación controlada del número de expertos en MoE: comparar esta ejecución (512 expertos, top-8) con el control de 256 expertos de la misma celda IsoFLOP permite medir el efecto de duplicar los expertos manteniendo fijos datos, LR, batch y pasos.
- Estudio de estabilidad entre semillas: al ser la segunda semilla de la escalera (4321), sirve para estimar la varianza de la pérdida de validación atribuible a la inicialización frente a la atribuible al cambio arquitectónico.
- Reproducibilidad de recetas de entrenamiento: el repositorio incluye logs por segmentos de 4 horas, logs de scoring, eventos de TensorBoard y `config.yaml`, lo que permite reconstruir la curva de entrenamiento y auditar la receta paso a paso.
- Reanudación de entrenamiento con estado del optimizador: al conservarse el estado completo de Megatron, se puede continuar el preentrenamiento o aplicar continued pretraining sobre dominios adicionales sin recalentar el optimizador.
- Investigación sobre enrutamiento en MoE de grano fino: con 512 expertos y top-8, el checkpoint permite analizar el equilibrio de carga entre expertos, el colapso de enrutamiento y la especialización por dominio a lo largo de las 18.810 iteraciones.
- Modelado a nivel de carácter en dominios con tokenización problemática: al operar sobre caracteres, es una base razonable para experimentos de modelado de código, textos históricos, secuencias biológicas o lenguas con morfología rica, siempre mediante fine-tuning y no de forma directa.
- Docencia y formación en entrenamiento distribuido: el par checkpoint + logs + config es material útil para enseñar el ciclo completo de un experimento Megatron con paralelismo de expertos.
- Base para estudios de eficiencia: comparar el coste por token activo de 185M con 512 expertos frente a alternativas densas del mismo presupuesto de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Las únicas métricas documentadas son las pérdidas del entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación (LM loss, iteración 18.810) | 1,0829 |
| Pérdida held-out (mezcla ponderada de 9 dominios) | 1,1739 nats/carácter |
| Desglose por dominio | disponible en `DOMAIN_NLL.txt` del repositorio |

Estas cifras no son comparables con perplejidades por token de modelos con tokenizadores BPE: al expresarse en nats por carácter, la escala es distinta y no se puede convertir sin conocer el tokenizador exacto.

## Requisitos de hardware

- VRAM de inferencia: no disponible. El único dato de tamaño es el repositorio (56,8 GB), que incluye el estado del optimizador y los logs, por lo que no equivale al tamaño de los pesos en inferencia. Sin el número total de parámetros no se puede estimar con rigor.
- GPU recomendadas: no disponibles. Para cargar el checkpoint distribuido y reanudar entrenamiento se necesita un entorno con Megatron-LM y, previsiblemente, varias GPU con NVLink; el autor no publica la topología empleada.
- GPU de consumo: no se puede confirmar que quepa en una RTX 4090 o similar, ya que se desconoce el total de parámetros y no existen pesos cuantizados publicados.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, porque no se publican pesos en safetensors ni GGUF. El punto de partida es Megatron-LM y, en su caso, una conversión previa del checkpoint a un formato de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros activos | Expertos / top-k | Contexto | Pérdida held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ove3-ladder-185m-exp512-seed4321 (este) | 185M | 512 / 8 | no disponible | 1,1739 nats/carácter | no disponible | checkpoint Megatron |
| ove3-ladder-440m-lk3x1024 | 440M | 1024 expertos de media anchura, LatentMoE, top-16 | no disponible | no disponible | no disponible | checkpoint Megatron |
| Control de la celda 185M (256 expertos) | 185M | 256 / no disponible | no disponible | no disponible en esta información | no disponible | referenciado en la model card, sin enlace |

La comparación relevante es interna a la escalera ove3: mismo presupuesto de cómputo activo y misma receta, con variaciones de número de expertos, top-k y semilla. No se han identificado modelos públicos comparables fuera de esta familia en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni atribución; en la práctica esto impide un uso en producción sin contactar con el autor.
- No es un modelo listo para inferencia: solo se publica un checkpoint distribuido de Megatron con estado del optimizador, sin tokenizador, sin plantilla de prompt y sin conversión a safetensors o GGUF.
- Ausencia de evaluación estándar: no hay MMLU, HumanEval ni pruebas de seguridad, por lo que se desconoce el riesgo real de alucinación y de generación de contenido dañino.
- Sesgos desconocidos: la composición del corpus de 9 dominios no se detalla, de modo que no se puede evaluar la cobertura lingüística, cultural o temática ni los sesgos asociados.
- Métrica no comparable: la pérdida en nats/carácter no equivale a la pérdida por token de otros modelos; las comparaciones directas con la literatura requieren recalcular con el mismo tokenizador.
- Longitud de contexto no documentada: se desconoce la ventana efectiva y el comportamiento de la atención linear más allá de la longitud vista en entrenamiento.
- Naturaleza experimental: al tratarse de una ablación de una sola semilla dentro de una escalera, las diferencias de pérdida frente al control pueden estar dentro del ruido de inicialización; no debe interpretarse como una mejora validada.
- Fecha de creación del repositorio en 2026 y ausencia de pipeline, descargas y likes: el artefacto no ha pasado por ninguna revisión de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabe-adib/ove3-ladder-185m-exp512-seed4321
- Ejecución hermana de la escalera (440M, LatentMoE, top-16, semilla 1234): https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3x1024
- Paper, blog o repositorio del proyecto ove3: no disponible en la información proporcionada.
