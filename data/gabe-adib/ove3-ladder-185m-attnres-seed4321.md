# gabe-adib/ove3-ladder-185m-attnres-seed4321

## Resumen

`ove3-ladder-185m-attnres-seed4321` es un checkpoint de investigación publicado por el usuario gabe-adib dentro de una campaña de experimentos denominada «ove3 intervention ladder». Se trata de un modelo MeO (MoE) de la familia `kimi_linear` con 185M de parámetros activos, entrenado con Attention Residuals (AttnRes, tamaño de bloque 2) y semilla 4321. No es un modelo listo para producto: es la segunda semilla de una ablación que aísla el efecto de AttnRes frente a la receta base de la celda IsoFLOP de 185M, manteniendo datos, learning rate, batch y número de pasos.

El checkpoint corresponde al paso 18.810, el de mejor validación (lm loss de validación 1,0855). La pérdida held-out es de 1,1767 nats/char, ponderada por mezcla sobre 9 dominios, con desglose por dominio en `DOMAIN_NLL.txt`. El repositorio (28,9 GB) incluye el checkpoint distribuido de Megatron con estado del optimizador, los logs de entrenamiento, los eventos de TensorBoard y el `config.yaml` de la ejecución.

Su relevancia es metodológica: AttnRes propone sustituir la acumulación residual de pesos fijos por una atención softmax sobre las salidas de capas precedentes, y esta ejecución permite medir ese efecto a escala pequeña con trazas completas de entrenamiento. No hay information pública sobre licencia, idiomas, contexto ni benchmarks estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`kimi_linear`) con Attention Residuals (AttnRes), tamaño de bloque 2 |
| Parametros totales | no disponible |
| Parametros activos | 185M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene checkpoint distribuido de Megatron, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (incluye estado del optimizador); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. Por un lado, `kimi_linear`, la arquitectura MoE con atención lineal de Moonshot AI (en el paper de AttnRes se cita una variante de 48B totales / 3B activados preentrenada con 1,4T tokens). Por otro, Attention Residuals: en lugar de sumar las salidas de todas las capas con pesos unitarios fijos, el modelo aplica atención softmax sobre las representaciones de capas anteriores. La variante Block AttnRes, que es la usada aquí con bloque de tamaño 2, agrupa las capas por pares y atiende sobre representaciones a nivel de bloque, reduciendo memoria y comunicación respecto a la atención sobre todas las capas previas. El paper reporta que AttnRes mitiga la dilución de PreNorm, con magnitudes de salida más acotadas a lo largo de la profundidad y gradientes distribuidos de forma más uniforme.

El entrenamiento sigue la celda IsoFLOP de 185M de la receta: mismos datos, learning rate, batch y número de pasos que la ejecución de referencia, cambiando únicamente la semilla (4321) y la intervención (AttnRes). El mejor paso de validación es el 18.810, con lm loss de validación 1,0855. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO; el hecho de que se publique el estado del optimizador y los logs de las 4 horas por segmento apunta a un preentrenamiento puro sin alineamiento posterior. Las pérdidas se expresan en nats/char, normalizadas por carácter, lo que sugiere una evaluación a nivel de carácter (no confirmado).

## Capacidades

- Modelo base de preentrenamiento: predice el siguiente token; no hay evidencia de ajuste por instrucciones ni de formato conversacional.
- Generación de texto libre y modelado de lenguaje, sin garantías de seguir instrucciones.
- Evaluación de pérdida por dominio: el repositorio incluye `DOMAIN_NLL.txt` con la pérdida desglosada para 9 dominios, lo que permite analizar el comportamiento por tipo de dato.
- Razonamiento, código y matemáticas: no hay evaluación publicada; al ser un modelo de 185M activos sin ajuste, el rendimiento esperado en estas tareas es bajo, pero no se dispone de datos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Interés principal: servir como artefacto reproducible para estudiar Attention Residuals y la estabilidad degradiente en MoE con atención lineal.

## Casos de uso

- Reproducción de la ablación de AttnRes: el repositorio incluye configuración, logs por segmento de 4 horas y TensorBoard, lo que permite reentrenar o reanudar la ejecución y verificar la curva de validación hasta el paso 18.810.
- Comparación de semillas en la escalera de intervenciones: al ser la «segunda semilla» de la ladder, se usa junto a la primera para estimar la varianza entre semillas y decidir si una diferencia de pérdida es señal o ruido.
- Estudio de dilución de PreNorm: con las magnitudes de salida y los gradientes registrados, se puede analizar si el modelo reproduce el efecto descrito en el paper (salidas más acotadas con la profundidad, gradientes más uniformes).
- Baseline para leyes de escala IsoFLOP a 185M activos: sirve como punto de referencia de pérdida (1,1767 nats/char held-out) frente a otras celdas de la misma receta con distintos tamaños o presupuestos.
- Análisis de mezcla de datos por dominio: la pérdida desglosada por dominio permite detectar dominios infraentrenados o sobrerrepresentados y ajustar mezclas en ejecuciones posteriores.
- Fine-tuning de dominio sobre un modelo pequeño: tras convertir el checkpoint de Megatron a un formato estándar, puede ajustarse para tareas acotadas de clasificación o generación en un único acelerador, aunque la licencia no declarada impide asumir uso comercial.
- Docencia y experimentación académica: su tamaño activo reducido permite estudiar arquitecturas MoE con atención lineal en clústeres modestos, algo inviable con la variante de 48B/3B del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos numéricos son métricas de pérdida del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Iteracion del checkpoint | 18.810 (best_1, mejor paso de validacion) |
| lm loss de validacion | 1,0855 |
| Perdida held-out | 1,1767 nats/char (ponderada por mezcla sobre 9 dominios) |
| Perdida por dominio | en `DOMAIN_NLL.txt` (no incluida en la informacion disponible) |

## Requisitos de hardware

- Tamano del repositorio: 28,9 GB, que incluye el checkpoint distribuido de Megatron con estado del optimizador. El peso de los parámetros puros no se puede derivar de ese dato porque el número total de parámetros no es público.
- VRAM de inferencia: no disponible con precisión. Como referencia de orden de magnitud, con 185M de parámetros activos y suponiendo bf16, el conjunto de pesos activos rondaría los 0,4 GB; el total real depende del número de expertos, que no se especifica.
- GPU recomendadas: no disponibles. Para inferencia, cualquier GPU consumer con suficiente VRAM para el total de parámetros sería suficiente en teoría; para reentrenar hacen falta varias GPU por el uso de Megatron y del paralelismo de expertos.
- Compatibilidad con GPU consumer: probable tras la conversión de formato, pero no confirmada por el autor.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI. El punto de partida es un checkpoint de Megatron que requiere conversión a un formato intermedio (por ejemplo, safetensors en formato Hugging Face) antes de plantear cualquier servidor de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ove3-ladder-185m-attnres-seed4321` (este) | 185M activos, total no disponible | no disponible | held-out 1,1767 nats/char (9 dominios) | no disponible | checkpoint Megatron + logs |
| `ove3-dc-185m-u30b-r4-wd0.1-seed4321` (misma familia, estudio data-constrained) | 185M activos, total no disponible | no disponible | held-out 1,1177 nats/char (8 dominios) | no disponible | checkpoint Megatron + logs |
| Kimi Linear con AttnRes (referencia del paper) | 48B totales / 3B activos | no disponible | preentrenado con 1,4T tokens; metricas no disponibles en la informacion | no disponible | no disponible |

La comparación con la ejecución `ove3-dc-185m` no es directa: la pérdida se pondera sobre 9 dominios en un caso y 8 en el otro, y las recetas difieren (30B tokens únicos × 4 épocas y weight decay 0,1 en la otra), por lo que la diferencia de 0,059 nats/char no debe interpretarse como una mejora de AttnRes.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no cabe esperar seguimiento de instrucciones, formato conversacional ni rechazo de peticiones.
- Riesgo de alucinación alto en generación abierta, propio de un modelo base de 185M de parámetros activos sin alineamiento.
- Licencia no declarada: no hay permiso explícito para uso comercial, redistribución ni derivados. Conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Idiomas y longitud de contexto no declarados; no se puede asumir soporte multilingüe ni una ventana concreta.
- El checkpoint está en formato distribuido de Megatron con estado del optimizador: requiere conversión y no se carga directamente en herramientas estándar.
- Las pérdidas en nats/char no son comparables con benchmarks de modelos con tokenizadores distintos, ni con métricas de precisión tipo MMLU o HumanEval.
- La pérdida held-out está ponderada por una mezcla de 9 dominios cuya composición no se detalla, lo que limita la comparación entre ejecuciones.
- El paso 18.810 es el mejor de validación, pero no se documenta si hubo degradación posterior ni análisis de sobreajuste.
- No hay evaluación de sesgos, toxicidad ni robustez; el dataset de entrenamiento no se describe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabe-adib/ove3-ladder-185m-attnres-seed4321
- Ejecución hermana del estudio data-constrained: https://huggingface.co/gabe-adib/ove3-dc-185m-u30b-r4-wd0.1-seed4321
- Paper Attention Residuals (arXiv): https://arxiv.org/abs/2603.15031
- PDF del paper: https://arxiv.org/pdf/2603.15031
- Resumen del paper: https://paperbreakdown.com/abs/2603.15031
- Cobertura de Moonshot AI sobre AttnRes: https://www.marktechpost.com/2026/03/15/moonshot-ai-releases-%F0%9D%91%A8%F0%9D%92%95%F0%9D%92%95%F0%9D%92%86%F0%9D%92%8F-%F0%9D%91%B9%F0%9D%92%86%F0%9D%92%94%F0%9D%92%8A%F0%9D%92%85/
