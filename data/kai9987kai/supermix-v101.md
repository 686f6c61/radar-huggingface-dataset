# Kai9987kai/supermix-v101

## Resumen

Supermix v101, también denominado `v101_scf_cognitive` o "Cognitive Fabric", es un checkpoint de lenguaje de autoría individual publicada por el usuario Kai9987kai bajo licencia MIT. Se presenta como una continuación del modelo `Kai9987kai/supermix-v100`, del que hereda los pesos mediante warm-start, y se distribuye junto a un runtime propio en Python (paquete `scf`) que añade capas de verificación simbólica, descomposición de problemas y memoria conversacional. El modelo es deliberadamente pequeño: 36.614.279 parámetros totales y 9.147.383 activos, con un vocabulario de 9.460 tokens, lo que lo sitúa en la categoría de modelos de juguete o de investigación más que en la de asistentes de propósito general.

La propuesta técnica no es un transformer convencional entrenado a escala, sino un ensamblaje que el autor etiqueta como "cognitive fabric": mezcla de expertos (mixture-of-experts), inspiración en conectomas, neurogénesis, normalización divisiva y codificación predictiva, junto con módulos neuro-simbólicos externos al modelo neuronal (resolución de sistemas lineales, derivadas, integrales, gcd/lcm, evaluación segura de AST). El entrenamiento se realizó sobre un conjunto de 10.100 filas (`v101_cognitive_mix.jsonl`) en entorno Windows sin GPU (PyTorch 2.11.0+cpu), lo que da una idea de la escala real del proyecto.

Su relevancia es, por tanto, acotada y de nicho: resulta interesante como banco de pruebas reproducible de ideas híbridas neuro-simbólicas y de evaluación con verificación determinista, pero no compite con modelos frontera ni con modelos pequeños de uso general. La model card es inusualmente transparente sobre este punto, incluyendo una tabla de benchmarks propia y un sistema de "promotion gating" que lo clasifica explícitamente como Experimental (#3 en precisión standalone) por detrás de sus predecesores v96 y v100.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts con componentes declarados de "cognitive fabric" (conectoma, neurogénesis, normalización divisiva, codificación predictiva); detalles de capas y atención no disponibles |
| Parámetros totales | 36.614.279 |
| Parámetros activos | 9.147.383 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en `.pt` de PyTorch, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los tags de Hugging Face no incluyen lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`v101_scf_cognitive.pt`); sin safetensors ni GGUF |

Datos adicionales relevantes: tamaño del repositorio 0,2 GB, vocabulario de 9.460 tokens (crecimiento de +45 identificadores respecto a v100), `best_dev_loss = 0.01745` en el paso 32, y `best_dev_loss` por subconjunto de `0,00497` (ppl 1,005) en 32 pares `tier1_seen_response` y `0,051251` (ppl 1,0526) en 364 pares `tier3_unseen_sentence`.

## Arquitectura y entrenamiento

La arquitectura se describe en la model card mediante etiquetas conceptuales (mixture-of-experts, connectome, neurogenesis, divisive-normalization, predictive-coding, map-elites, neuro-symbolic) más que mediante una especificación formal de capas, dimensiones ocultas, número de expertos o mecanismo de atención. No se detalla el número de cabezas, la dimensionalidad del embedding ni la estrategia de enrutamiento de expertos. Lo que sí se documenta es el proceso: el checkpoint se inicializa por warm-start desde `v100_scf_balanced.selected.pt` y se ajusta sobre un dataset de 10.100 filas (`datasets/v101/v101_cognitive_mix.jsonl`), con una ampliación de vocabulario de 45 identificadores hasta 9.460 tokens. El mejor checkpoint se alcanzó en el paso 32, un indicio claro de que el ajuste es muy corto y el modelo hereda la mayor parte de su comportamiento de v100.

La innovación declarada no reside tanto en el modelo neuronal como en el runtime que lo acompaña. El paquete `scf` incluye un solucionador simbólico (`nexus_solver.py`) capaz de resolver sistemas lineales 2x2 con coeficientes implícitos, cuadráticas, descubrimiento de secuencias por diferencias finitas de Newton (grados 1 a 3), geométricas y de Fibonacci, derivadas e integrales definidas de polinomios, gcd/lcm/media/varianza/desviación típica, un evaluador seguro de AST (`_eval_safe_ast_expr`) y comprobación de equivalencia algebraica con certificados de verificación y pasos de derivación. Se añaden además módulos de descomposición de problemas con sondas de ambigüedad, auditoría aritmética de trazas (`_audit_trace_arithmetic`), enrutamiento de subtareas (`SCFRouter.assess_task`), ideación con MAP-Elites y NoveltySearch sobre SCAMPER/TRIZ/analogía/contrario, y memoria conversacional con puntuación de importancia y detección de contradicciones. No se documenta el uso de RLHF, DPO ni un pipeline de alineamiento; el entrenamiento parece ser supervisado sobre el corpus citado.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation`, con vocabulario reducido de 9.460 tokens.
- Razonamiento aritmético y algebraico delegado en módulos simbólicos del runtime: sistemas lineales 2x2, cuadráticas, derivadas, integrales definidas, gcd/lcm, media, varianza y desviación típica.
- Descubrimiento de patrones en secuencias mediante diferencias finitas de Newton (grados 1 a 3), progresiones geométricas y sucesiones de Fibonacci.
- Verificación formal de resultados con certificados y pasos de derivación, incluyendo comprobación de equivalencia algebraica.
- Descomposición de problemas en pasos con sondas de ambigüedad y auditoría aritmética intermedia de la traza.
- Ideación estructurada: SCAMPER, TRIZ, analogía y planteamiento contrario, seleccionados con MAP-Elites (celdas de comportamiento 2D normalizadas min-max) y distancia de novedad de Jaccard, con generación de hipótesis falsables.
- Memoria multi-turno con captura de restricciones conversacionales puntuadas por importancia y detección de contradicciones.
- Interfaz de chat en vivo (`source/supermix_chat_server.py`) con tarjetas de síntesis etiquetadas `VERIFIED` o `ADVISORY` y telemetría.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no documentadas; la lista de idiomas no está declarada.

## Casos de uso

- Laboratorio de investigación neuro-simbólica: el modelo sirve como banco de pruebas reproducible para medir cuánto de una tarea matemática resuelve la red neuronal y cuánto aporta el verificador simbólico, gracias a la separación explícita entre `eval` neuronal standalone y `scf bench --neural`.
- Enseñanza de matemáticas básicas con trazabilidad: el runtime devuelve pasos de derivación y certificados de verificación para sistemas lineales, cuadráticas y cálculo polinómico, lo que permite mostrar al estudiante no solo el resultado sino la comprobación.
- Auditoría de cadenas de razonamiento: `_audit_trace_arithmetic` permite detectar errores aritméticos intermedios en una traza generada, útil en entornos de evaluación de modelos donde interesa distinguir un fallo de razonamiento de un fallo de cálculo.
- Generación de ideas con cobertura controlada: el selector MAP-Elites sobre celdas de comportamiento 2D evita concentrar todas las propuestas en una misma región temática, lo que encaja en sesiones de ideación que requieren diversidad explícita y no solo volumen.
- Asistente conversacional con memoria de restricciones: para prototipos donde el usuario fija condiciones a lo largo de varios turnos (por ejemplo, presupuesto o formato de salida) y se necesita detectar cuándo una respuesta las contradice.
- Demostración educativa de arquitecturas híbridas: con 36,6 M de parámetros totales y 9,1 M activos, el modelo se ejecuta en CPU sin GPU dedicada, lo que lo hace apto para talleres y cursos donde no hay acceso a aceleradores.
- Integración como componente de verificación en pipelines mayores: el evaluador seguro de AST y el comprobador de equivalencia algebraica pueden invocarse de forma independiente al modelo neuronal para validar salidas de otros sistemas.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en Windows, PyTorch 2.11.0+cpu, `cuda_available=False`, `max_new_tokens=96`:

| Suite de evaluación | Resultado | Notas |
|---|---:|---|
| Neural standalone, `seed=82` (41 tareas) | 35 / 41 (0,8537) | `results/eval_v101_seed82.json` |
| Neural standalone, `seed=83` (82 tareas) | 72 / 82 (0,8780) | `results/eval_v101_n82_seed83.json` |
| Neural standalone, `seed=84` (82 tareas) | 71 / 82 (0,8659) | `results/eval_v101_n82_seed84.json`; combinado 178 / 205 = 86,8 % |
| SCF Hybrid (`python -m scf bench --seed 82 --neural`) | 41 / 41 (1,0000) | Verificación determinista + atlas de conectoma |

Comparación interna de la línea Supermix según el propio "Rule 9 promotion gating" del autor:

| Checkpoint | Precisión combinada | Estado |
|---|---:|---|
| `v96_physio_neurogenesis.selected.pt` | 180 / 205 = 87,8 % | #1 Promoted Default |
| `v100_scf_balanced.selected.pt` | 179 / 205 = 87,3 % | #2 |
| `v101_scf_cognitive.pt` | 178 / 205 = 86,8 % | Experimental (#3 en precisión standalone, mejor dev loss) |

Métricas de pérdida del checkpoint: `best_dev_loss = 0,01745` en el paso 32; `tier1_seen_response` 0,00497 (ppl 1,005) sobre 32 pares; `tier3_unseen_sentence` 0,051251 (ppl 1,0526) sobre 364 pares. No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 36,6 M de parámetros (unos 146 MB de pesos), más el overhead del runtime Python; no se publican cifras oficiales.
- GPU recomendadas: no se especifica ninguna; el autor ejecuta todas las evaluaciones en CPU (`cuda_available=False`).
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU sin acelerador; el repositorio completo ocupa 0,2 GB.
- Opciones de despliegue: el runtime propio (`PYTHONPATH=source python -m scf ...`), el servidor de chat incluido (`source/supermix_chat_server.py`, puerto 8780 por defecto) y el script `example_usage.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF ni safetensors, la integración con esos ecosistemas requeriría conversión manual.
- Latencia y throughput: no disponibles. Las evaluaciones usan `max_new_tokens=96`, lo que sugiere respuestas cortas, pero no se aportan tiempos.

## Comparativa con modelos similares

No hay comparaciones directas publicadas con modelos de terceros. La única comparación disponible es interna a la propia línea Supermix:

| Modelo | Parámetros | Contexto | Precisión combinada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supermix v101 | 36,6 M totales / 9,1 M activos | no disponible | 178 / 205 = 86,8 % | MIT | Hugging Face |
| Supermix v100 | no disponible | no disponible | 179 / 205 = 87,3 % | MIT (según modelo base) | Hugging Face |
| Supermix v96 | no disponible | no disponible | 180 / 205 = 87,8 % | MIT (según modelo base) | Hugging Face |

Comparativa con alternativas de la misma categoría (modelos pequeños de propósito general): no disponible, ya que los benchmarks del autor son suites propias y no son trasladables a MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- Escala muy reducida: 9,1 M de parámetros activos y un vocabulario de 9.460 tokens implican una competencia lingüística limitada; no es un modelo de propósito general.
- El propio autor lo clasifica como Experimental y lo sitúa por debajo de v96 y v100 en precisión standalone, pese a tener la mejor pérdida de validación de la línea. La promoción a producción no está recomendada por el sistema de gating del proyecto.
- El ajuste se detuvo en el paso 32 sobre 10.100 filas; el riesgo de sobreajuste al corpus `v101_cognitive_mix.jsonl` es alto, como sugiere la pérdida de validación de 0,01745.
- Las puntuaciones de 1,0000 en el modo híbrido incluyen verificación determinista simbólica, no solo al modelo neuronal; atribuir esa cifra al modelo sería incorrecto.
- Riesgo de alucinación: no evaluado de forma independiente; los benchmarks propios no miden veracidad factual.
- Sesgos conocidos: no documentados. La ausencia de una declaración de idiomas y de composición del dataset impide evaluar sesgos lingüísticos o culturales.
- Longitud de contexto no documentada; no debe asumirse ninguna ventana concreta.
- Sin soporte declarado de tool calling ni multimodalidad; no apto para pipelines de agentes que requieran function calling estándar.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base v100 y el runtime del repositorio GitHub deben verificarse por separado, ya que la model card no detalla la licencia de todos los componentes.
- Dependencia de un runtime propietario del autor (`scf`) para las capacidades simbólicas; sin él, el modelo es únicamente un generador de texto de vocabulario reducido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v101
- Modelo base v100: https://huggingface.co/Kai9987kai/supermix-v100
- Paquete cruzado v99 Cognitive Fabric: https://huggingface.co/Kai9987kai/supermix-v99-cognitive-fabric
- Repositorio GitHub del proyecto: https://github.com/kai9987kai/Supermix (commit `main` `1404afbd`)
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
