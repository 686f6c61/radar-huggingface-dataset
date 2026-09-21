# GeneLab/sokudan-ja-310m

## Resumen

sokudan-ja-310m es un modelo japonés de toma de decisiones de tipo System One publicado por GeneLab sobre el backbone `sbintuitions/modernbert-ja-310m` (licencia MIT). No es un modelo generativo: recibe un texto en japonés (state) y un conjunto de preguntas tipadas (questions) y devuelve, en una única pasada forward, respuestas tipadas acompañadas de probabilidades. Al no generar tokens, no hay nada que parsear ni margen para alucinación textual. La model card declara 338.217.986 parámetros (314,6 M del backbone + 23,6 M de la cabeza de decisión + 1.538 de la cabeza ordinal), mientras que los metadatos safetensors del repositorio declaran 314.614.274.

El modelo se diseña contra un fallo medido en los sistemas System One existentes en japonés: en la evaluación `bench_ja` (300 casos), el modelo de referencia `laya-multilingual` elegía la primera opción presentada en 0-1 de 300 casos (sesgo posicional estructural) y no ordenaba correctamente las tareas booleanas (AUROC 0,523). sokudan-ja-310m ataca específicamente las tareas `score` (ordinal, K=2-7) y `bool`, y acepta esquemas de pregunta libres por petición sin reentrenamiento.

Su relevancia práctica está en el coste: 229,4 preguntas por segundo y una latencia p50 de 11,9 ms por pregunta, con licencia Apache-2.0 y pesos safetensors de 2,5 GB, lo que permite desplegarlo como clasificador de enrutado dentro de una aplicación de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador (backbone ModernBERT-Ja) con cabeza de decisión para `choice`/`score`/`bool` y cabeza ordinal |
| Parámetros totales | 338.217.986 según la model card (314,6 M backbone + 23,6 M cabeza de decisión + 1.538 cabeza ordinal); los metadatos safetensors del repo declaran 314.614.274 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone, no especificada en la documentación) |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño de repo: 2,5 GB); el ejemplo de la model card carga un fichero `model.pt` |
| Tarea (pipeline) | text-classification |
| Modelo base | sbintuitions/modernbert-ja-310m (MIT) |
| Tipos de pregunta | `choice`, `score` (ordinal), `bool` (`noul` como alias) |
| Fecha de creación en HuggingFace | 21 de septiembre de 2026 (según metadatos del repo) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura combina un codificador ModernBERT-Ja de 310 M de parámetros con dos cabezas específicas: una cabeza de decisión de 23,6 M de parámetros que resuelve preguntas de tipo `choice` (distribución sobre opciones), `score` (salida ordinal) y `bool` (probabilidad), y una cabeza ordinal de 1.538 parámetros. El modelo no decodifica texto de forma autorregresiva: cada pregunta se responde en una sola pasada forward, y el esquema de preguntas (opciones, criterios, instrucciones) se define libremente en cada petición, sin reentrenamiento.

El entrenamiento usa exclusivamente datos sintéticos generados con generación condicionada por etiqueta (la etiqueta correcta forma parte de la condición de generación). El conjunto consta de 4.833 documentos generados, 31.243 pares (documento, pregunta) etiquetados y 79.552 vistas tras la expansión de esquemas; el propio autor advierte que estas vistas no equivalen a ejemplos independientes, ya que repiten el mismo documento y la misma etiqueta con notaciones distintas. La generación se hizo con `qwen3:30b-a3b-instruct-2507-q4_K_M` (Apache-2.0, vía Ollama) con temperatura 0,9. El catálogo cubre 14 dominios, 28 atributos, preguntas `choice` de 4 a 6 opciones, `score` con K de 2 a 7 y 10 atributos `bool`, con el sesgo de etiqueta mezclado por atributo (4 sesgados a falso, 3 equilibrados y 3 sesgados a verdadero). La partición train/val se hizo por documento, y el esquema se aleatoriza (orden de opciones, variación de notación, distractores, eliminación de opciones, paráfrasis de instrucciones, inversión de escalas ordinales) manteniendo la etiqueta correcta en todas las transformaciones. No hay información sobre RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Toma de decisiones en una sola pasada forward, sin generación de texto y por tanto sin errores de parseo ni alucinación textual.
- Preguntas de tipo `choice`: distribución de probabilidad sobre un conjunto cerrado de 4 a 6 opciones definidas por el usuario.
- Preguntas de tipo `score`: salida ordinal con K entre 2 y 7 niveles, con métricas reportadas de RPS, accuracy y MAE.
- Preguntas de tipo `bool`: probabilidad calibrable para atributos binarios, evaluada con accuracy, ECE y AUROC.
- Esquemas libres por petición: el usuario define etiquetas, criterios e instrucciones en cada llamada sin reentrenar.
- Calibración de temperatura opcional mediante un fichero `temperatures.json` que solo se aplica si se pasa explícitamente.
- Multilingüismo: no. El modelo está entrenado y etiquetado únicamente para japonés.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo de razonamiento explícito: no disponibles; el modelo no genera texto ni ejecuta llamadas a herramientas.
- Mitigación de sesgo posicional verificada empíricamente en cinco condiciones de presentación de opciones.

## Casos de uso

- Enrutado de tickets de atención al cliente: una pregunta `choice` con las áreas de la empresa (facturación, soporte técnico, ventas…) devuelve la distribución de probabilidad por departamento en una sola pasada; el ejemplo de la model card resuelve precisamente un caso de doble cobro.
- Priorización por urgencia: una pregunta `score` con una escala de 3 niveles clasifica la criticidad de cada solicitud, y los 11,9 ms de latencia p50 permiten evaluar colas completas en tiempo real.
- Predicción de abandono (churn): una pregunta `bool` sobre si el texto sugiere cancelación permite marcar cuentas en riesgo; el AUROC de 0,789 (media de 3 semillas) lo hace apto para priorizar contactos, no para decidir de forma automática.
- Triaje sanitario o administrativo con múltiples atributos: se pueden enviar varias preguntas tipadas sobre un mismo documento en una petición, cubriendo categoría, gravedad y derivación a humano.
- Análisis de encuestas y NPS: la cabeza ordinal mapea respuestas abiertas a escalas de satisfacción de hasta 7 niveles, con MAE de 0,258 en la media de 3 semillas.
- Moderación de contenido y detección de intenciones: preguntas `bool` sobre contenido ofensivo, spam o solicitudes fuera de política, con coste por documento muy inferior al de un LLM generativo.
- Enrutado de herramientas en un pipeline de agentes: usar el modelo como paso previo que decide qué habilidad o herramienta debe invocarse antes de llamar a un LLM mayor, reduciendo el coste del enrutado.
- Clasificación de grandes volúmenes de tickets históricos: a 229,4 preguntas por segundo y 2,5 GB de pesos, se puede ejecutar en CPU o en una GPU de gama media para etiquetar lotes completos.

## Benchmarks y rendimiento

Evaluación sobre `bench_ja` (300 casos, misma condición y misma implementación de métricas). Media de 3 semillas ± desviación estándar:

| Objetivo | choice acc | choice ECE↓ | score RPS↓ | score acc | score MAE↓ | bool acc | bool ECE↓ | bool AUROC |
|---|---|---|---|---|---|---|---|---|
| sokudan-ja-310m | 0,847 ± 0,009 | 0,147 ± 0,003 | 0,090 ± 0,023 | 0,763 ± 0,088 | 0,258 ± 0,086 | 0,788 ± 0,010 | 0,202 ± 0,013 | 0,789 ± 0,043 |
| sokudan-ja-310m + calibración de temperatura | 0,847 ± 0,009 | 0,092 ± 0,036 | 0,149 ± 0,032 | 0,763 ± 0,088 | 0,258 ± 0,086 | 0,788 ± 0,010 | 0,129 ± 0,009 | 0,789 ± 0,043 |
| laya-multilingual (ja) | 0,747 | 0,148 | 0,232 | 0,443 | 0,620 | 0,543 | 0,352 | 0,523 |
| Clase mayoritaria | 0,380 | 0,000 | 0,197 | 0,460 | 0,540 | 0,703 | 0,000 | — |
| Aleatorio | 0,253 | 0,003 | 0,201 | 0,403 | 0,777 | 0,513 | 0,013 | — |

Medición de la revisión principal distribuida (`seed 0`) frente a la media de 3 semillas:

| Métrica | seed 0 (pesos publicados) | Media de 3 semillas ± SD |
|---|---|---|
| choice acc | 0,843 | 0,847 ± 0,009 |
| choice ECE↓ | 0,148 | 0,147 ± 0,003 |
| score RPS↓ | 0,117 | 0,090 ± 0,023 |
| score acc | 0,663 | 0,763 ± 0,088 |
| score MAE↓ | 0,357 | 0,258 ± 0,086 |
| bool acc | 0,793 | 0,788 ± 0,010 |
| bool ECE↓ | 0,198 | 0,202 ± 0,013 |
| bool AUROC | 0,837 | 0,789 ± 0,043 |
| bool P(true) media | 0,135 | 0,125 ± 0,012 |

Verificación de sesgo posicional (mismo conjunto de 300 casos, variando únicamente el orden y la notación de las opciones). Se cuenta cuántas veces la primera opción presentada resulta ser el argmax:

| Condición | Primeras opciones | sokudan, 1.ª opción elegida (3 semillas) | Laya, 1.ª opción elegida | sokudan acc |
|---|---|---|---|---|
| A, original | 急がない / 早めに / 業務が止まっている | 92 ± 13 | 0 | 0,761 ± 0,085 |
| B, orden inverso | 業務が止まっている / 早めに / 急がない | 81 ± 20 | 0 | 0,788 ± 0,070 |
| C, reformulación | 低 / 中 / 高 | 98 ± 19 | 1 | 0,697 ± 0,009 |
| D, reformulación invertida | 高 / 中 / 低 | 92 ± 12 | 1 | 0,733 ± 0,048 |
| E, 4 niveles | 全く急がない / 急がない / 早めに / 業務が止まっている | 45 ± 25 | 0 | 0,427 ± 0,072 |

Latencia medida:

| Métrica | Valor |
|---|---|
| Latencia por pregunta, p50 / p95 | 11,9 ms / 29,5 ms |
| Preguntas de 10 y 50 conjuntos | no medidas (el autor advierte de no extrapolar desde la medición de 1 pregunta) |
| Preguntas por segundo | 229,4 ± 0,6 |

No se han publicado resultados de benchmarks generales (MMLU, GSM8K, HumanEval ni similares) en la información disponible. El hardware empleado en las mediciones de latencia no se especifica.

## Requisitos de hardware

- Peso de los parámetros: unos 1,35 GB en fp32, 0,68 GB en fp16/bf16 y 0,34 GB en int8 (sobre 338 M de parámetros). El repositorio ocupa 2,5 GB en safetensors.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) y también en CPU, dado el tamaño y la latencia declarada.
- GPU recomendadas para producción: no especificadas por el autor. Por tamaño, una T4, L4, A10 o incluso una GPU integrada son suficientes; no se necesita A100 ni H100.
- Opciones de despliegue: la model card documenta el uso mediante la librería propia `sokudan` (`sokudan.load(...)`) sobre PyTorch. Al no ser un modelo generativo y usar cabezas personalizadas, no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; un servicio propio con FastAPI o TorchServe es la vía coherente. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: 11,9 ms p50 y 29,5 ms p95 por pregunta, con 229,4 ± 0,6 preguntas por segundo. Estas cifras son del autor y no indican la GPU o CPU utilizada.
- El consumo de memoria en producción debe contemplar el tokenizador del backbone ModernBERT-Ja y el coste de cargar el fichero de temperaturas si se usa calibración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | choice acc | score RPS↓ | bool AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| sokudan-ja-310m | 338,2 M (card) / 314,6 M (safetensors) | no disponible | 0,847 (3 semillas) / 0,843 (seed 0) | 0,090 (3 semillas) / 0,117 (seed 0) | 0,789 (3 semillas) / 0,837 (seed 0) | Apache-2.0 | HuggingFace |
| laya-multilingual (japonés) | no disponible | no disponible | 0,747 | 0,232 | 0,523 | no disponible | no disponible |
| Clase mayoritaria (línea base) | no aplica | no aplica | 0,380 | 0,197 | no disponible | no aplica | línea base estadística |
| Aleatorio (línea base) | no aplica | no aplica | 0,253 | 0,201 | no disponible | no aplica | línea base estadística |

No se dispone de datos publicados de otros modelos de decisión System One en japonés aparte del referenciado `laya-multilingual`, ni de comparativas frente a LLM generativos usados como clasificadores bajo las mismas condiciones de `bench_ja`.

## Limitaciones y advertencias

- Todo el entrenamiento usa datos sintéticos generados por un LLM; el comportamiento sobre distribuciones reales de texto puede degradarse y no se ha medido.
- La métrica `score` es muy inestable entre semillas (accuracy 0,663 / 0,800 / 0,827). La media publicada de 0,763 no corresponde a ninguna semilla concreta; con los pesos distribuidos (`seed 0`) la accuracy medida es 0,663.
- La revisión principal del repositorio contiene los pesos de `seed 0`; `seed 1` y `seed 2` están en revisiones separadas. Cualquier comparación con la tabla de medias debe tenerlo en cuenta.
- La calibración de temperatura incluida está desactivada por defecto y empeora el RPS de `score` (de 0,090 a 0,149) porque se ajustó sobre un conjunto de validación sintético; el autor recomienda recalibrar con datos propios mediante `scripts/calibrate.py` o aplicar la calibración solo a `choice` y `bool`.
- Calibración imperfecta incluso sin temperatura: ECE de 0,147 en `choice` y 0,202 en `bool` en la media de 3 semillas. No conviene usar las probabilidades como umbrales automáticos sin validación.
- Aunque se reduce el sesgo posicional, con escalas de 4 niveles la accuracy cae a 0,427, frente a 0,697-0,788 con 3 niveles.
- Modelo únicamente en japonés: no hay soporte documentado para otras lenguas, incluido el castellano.
- No es un modelo generativo: no sirve para producir texto, resumir ni conversar; solo emite decisiones y probabilidades sobre un esquema predefinido.
- No se publican pesos cuantizados ni se documenta compatibilidad con servidores de inferencia estándar, lo que obliga a integrar la librería `sokudan` o a reimplementar las cabezas.
- Discrepancia entre el número de parámetros de la model card (338.217.986) y los metadatos safetensors (314.614.274), que conviene verificar antes de calcular requisitos de memoria.
- Longitud de contexto no documentada en la información disponible.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no existe validación independiente por parte de la comunidad.
- Licencia Apache-2.0, compatible con uso comercial; el backbone base está bajo MIT, por lo que no hay restricciones adicionales conocidas por ese lado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GeneLab/sokudan-ja-310m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Repositorio de código y diseño: https://github.com/hiroki-abe-58/sokudan
- Resultados de referencia en japonés (`bench_ja`): https://github.com/hiroki-abe-58/sokudan/blob/main/docs/baseline_ja.md
- Script de recalibración de temperaturas: `scripts/calibrate.py` dentro del repositorio anterior
- La búsqueda web realizada no devolvió enlaces relevantes: los resultados obtenidos eran definiciones genéricas del término «query» y no guardan relación con el modelo.
