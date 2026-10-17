# gabe-adib/ove3-ladder-61m-lk3-seed4321

## Resumen

`ove3-ladder-61m-lk3-seed4321` es un checkpoint de investigación publicado por el usuario gabe-adib dentro de la «intervención ladder» del proyecto ove3. Se trata de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 61M de parámetros activos, construido sobre la arquitectura `kimi_linear` y con una capa de expertos LatentMoE dimensionada como la de Kimi K3: 512 expertos de media anchura y enrutamiento top-16. El resto de la receta reproduce la celda IsoFLOP de 61M del proyecto (mismos datos, learning rate, batch y número de pasos), de modo que el interés del checkpoint es aislar el efecto de la intervención arquitectónica respecto a otras ramas de la ladder.

El checkpoint publicado es `best_1`, correspondiente a la iteración 17.290, con una pérdida de validación de 1,1051 y una pérdida held-out de 1,1975 nats/carácter promediada (ponderada por mezcla) sobre 9 dominios. El repositorio (9,9 GB) contiene el checkpoint distribuido de Megatron tal cual se guardó, incluido el estado del optimizador, además de los logs de entrenamiento, los eventos de TensorBoard, los logs de scoring, el fichero `DOMAIN_NLL.txt` y el `config.yaml` de la ejecución.

Su relevancia es estrictamente experimental: no es un modelo instructivo ni un artefacto listo para producción, sino una pieza reproducible para estudiar enrutamiento MoE de grano fino, atención lineal y metodología de escalado. No se han publicado parámetros totales, longitud de contexto, tokenizador, idiomas ni licencia, y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE tipo `kimi_linear` (atención lineal) con expertos LatentMoE; 512 expertos de media anchura, top-16, RMSNorm eps 1e-5, router scaling 1.0 |
| Parámetros totales | no disponible (el repo de 9,9 GB incluye estado del optimizador, no solo pesos) |
| Parámetros activos | 61M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica checkpoint distribuido de Megatron; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (con estado del optimizador); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atención de tipo lineal (`kimi_linear`) y expertos LatentMoE. La intervención concreta de esta rama, etiquetada «K3», consiste en dimensionar la capa de expertos como Kimi K3: 512 expertos de media anchura con enrutamiento top-16, normalización RMSNorm con epsilon 1e-5 y escalado del router de 1.0. Frente a un MoE convencional de pocos expertos anchos, este diseño apuesta por muchos expertos estrechos y un top-k alto, lo que reparte la capacidad total en un número grande de subredes y hace del comportamiento del router un objeto de estudio en sí mismo. La semilla de la ejecución es 4321.

El entrenamiento sigue la celda IsoFLOP de 61M del proyecto ove3: mismos datos, learning rate, batch y pasos que la receta de referencia, de forma que la comparación con otras ramas de la ladder aísle el efecto de la intervención. La pérdida se reporta en nats por carácter, ponderada por mezcla sobre 9 dominios, con el desglose por dominio en `DOMAIN_NLL.txt`. No se especifican en la información disponible el volumen de tokens, la composición del dataset, el tokenizador ni si hubo fases de RLHF o DPO; el pipeline declarado es únicamente `tensorboard` y el entrenamiento se realizó con Megatron. Los logs se publican segmentados cada 4 horas junto con los eventos de TensorBoard, lo que permite reconstruir la curva de entrenamiento y las decisiones de checkpointing.

## Capacidades

- Modelado de lenguaje autoregresivo y generación de texto como modelo base; no hay evidencia de ajuste instructivo.
- Razonamiento, código y matemáticas: no evaluados y sin benchmarks publicados; con 61M de parámetros activos es razonable esperar un rendimiento muy limitado en estas tareas.
- Tool calling / function calling: no documentado; sin post-entrenamiento instructivo no cabe esperar soporte fiable.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se especifican los idiomas ni los 9 dominios de entrenamiento.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada.
- Interés técnico: servir como sujeto de estudio del enrutamiento top-16 sobre 512 expertos y de la atención lineal en un régimen de 61M de parámetros activos.

## Casos de uso

- Investigación sobre enrutamiento MoE: cargar el checkpoint y registrar qué expertos se activan por token, capa y dominio, para analizar el equilibrio de carga y la especialización de los 512 expertos con top-16.
- Reproducción de estudios de escalado IsoFLOP: al compartir datos, learning rate, batch y pasos con la celda de 61M, sirve para replicar curvas de pérdida y contrastar metodologías de escalado.
- Ablación de intervenciones arquitectónicas: comparar esta rama «K3 LatentMoE» con otras ramas de la ladder manteniendo constante el presupuesto de cómputo y así atribuir cambios de pérdida a la arquitectura y no al entrenamiento.
- Estudio de varianza entre semillas: la semilla 4321 permite medir la dispersión de la pérdida final frente a otras semillas de la misma configuración.
- Análisis de pérdida por dominio: el desglose de `DOMAIN_NLL.txt` sobre 9 dominios habilita estudiar qué dominios se benefician o se degradan con la intervención MoE.
- Ingeniería de tooling de conversión: usar el checkpoint Megatron (con estado del optimizador) como caso de prueba para pipelines de conversión a safetensors, Hugging Face Transformers o formatos de inferencia.
- Formación y docencia en entrenamiento distribuido: los logs segmentados cada 4 horas y los eventos de TensorBoard permiten ilustrar el comportamiento de Megatron en ejecuciones reales.
- Punto de partida para fine-tuning exploratorio en tareas pequeñas y controladas, asumiendo que no hay garantías de calidad ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (sin MMLU, HumanEval, GSM8K ni evaluaciones equivalentes). Las únicas métricas reportadas son de pérdida de lenguaje:

| Métrica | Valor | Nota |
|---|---|---|
| Pérdida de validación (iteración 17.290) | 1,1051 | Checkpoint `best_1`, mejor paso de validación |
| Pérdida held-out (mezcla ponderada) | 1,1975 nats/carácter | Promedio sobre 9 dominios; desglose en `DOMAIN_NLL.txt` |
| MMLU / HumanEval / GSM8K | no disponible | No publicados |

## Requisitos de hardware

- VRAM de inferencia: depende del número total de parámetros, que no se ha publicado. Los 61M activos determinan el coste computacional por token, no la memoria: con 512 expertos es necesario residir todos los pesos (o aplicar offloading), y un top-16 obliga a acceder a 16 expertos por capa y token, por lo que la inferencia será limitada por ancho de banda de memoria más que por FLOPs.
- Estimación condicional (solo pesos, sin caché KV ni activaciones), a falta del dato de parámetros totales:

| Parámetros totales (hipótesis) | FP16 | INT8 | INT4 |
|---|---|---|---|
| ~600M | ~1,2 GB | ~0,6 GB | ~0,3 GB |
| ~1,5B | ~3,0 GB | ~1,5 GB | ~0,8 GB |
| ~3B | ~6,0 GB | ~3,0 GB | ~1,5 GB |

- GPU recomendadas: no se puede concretar sin los parámetros totales. Si el total se mantiene en el rango de cientos de millones a pocos miles de millones, cabría en tarjetas de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB); para entrenamiento o para el checkpoint completo con estado del optimizador harían falta A100/H100 o varias GPU.
- Despliegue: el artefacto publicado solo es cargable con Megatron; para vLLM, TGI, llama.cpp u Ollama sería necesaria una conversión previa a safetensors o GGUF que no se proporciona.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parámetros activos | Expertos | Pérdida held-out | Licencia | Formato |
|---|---|---|---|---|---|
| `ove3-ladder-61m-lk3-seed4321` | 61M | 512, top-16 | 1,1975 nats/carácter (9 dominios) | no disponible | Checkpoint Megatron |
| `ove3-dc-61m-u120b-r2-wd0.1` (mismo autor) | 61M | no disponible | 1,1373 nats/carácter (8 dominios) | no disponible | Checkpoint Megatron |
| Otros modelos abiertos de ~61M activos con LatentMoE | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con `ove3-dc-61m-u120b-r2-wd0.1` no es directa: aquel modelo pertenece al estudio de escalado con datos limitados (120B tokens únicos × 2 épocas = 240B tokens, weight decay 0,1, iteración 28.610) y su pérdida se pondera sobre 8 dominios en lugar de 9, por lo que las cifras no son estrictamente equiparables. No se han encontrado en la información disponible otros modelos públicos de la misma categoría con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial; cualquier despliegue en producción requiere aclarar la licencia con el autor.
- Es un modelo base sin ajuste instructivo documentado: no cabe esperar seguimiento de instrucciones, tool calling ni formato conversacional fiable.
- Ausencia total de benchmarks de capacidades: no hay evidencia pública sobre razonamiento, código, matemáticas o conocimiento factual.
- Riesgo alto de alucinación e incoherencia en generación abierta por el tamaño (61M activos) y por la ausencia de post-entrenamiento.
- Idiomas, tokenizador y composición del dataset no publicados: imposible evaluar cobertura lingüística, contaminación de test o sesgos de dominio.
- La pérdida se reporta en nats por carácter; no es directamente comparable con pérdidas por token de otros modelos sin conocer el tokenizador.
- El enrutamiento top-16 sobre 512 expertos puede presentar desequilibrios de carga; no se publican métricas de utilización de expertos ni de pérdida auxiliar del router.
- El checkpoint está en formato distribuido de Megatron con estado del optimizador: requiere tooling específico y espacio adicional; no es plug-and-play en el ecosistema Hugging Face.
- Artefacto de investigación sin validación comunitaria (0 descargas, 0 likes): no hay informes independientes de calidad ni de estabilidad.
- Sin datos de contexto: se desconoce la longitud máxima soportada y el comportamiento más allá de la ventana de entrenamiento.
- Las búsquedas del término «ove3» devuelven resultados del modelo de vídeo Veo 3 de Google, sin relación alguna con este checkpoint; conviene no confundirlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabe-adib/ove3-ladder-61m-lk3-seed4321
- Modelo hermano del mismo autor (`ove3-dc-61m-u120b-r2-wd0.1`): https://huggingface.co/gabe-adib/ove3-dc-61m-u120b-r2-wd0.1
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
