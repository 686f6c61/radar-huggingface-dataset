# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16

## Resumen

El modelo `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16` es un checkpoint intermedio de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el usuario agurung y no se trata de un modelo conversacional terminado, sino del resultado de un paso concreto (paso global 24) de una ejecución de RL con el algoritmo GRPO implementado en OpenRLHF. El entrenamiento se hizo partiendo del modelo base de Qwen3-4B sin fase previa de SFT, es decir, aplicando RL directamente sobre los pesos base.

El problema que aborda es muy específico: mejorar la capacidad de resolver problemas de programación difíciles mediante una recompensa binaria de corrección de código (1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario). El conjunto de entrenamiento y validación se denomina internamente "cobalt-train ≤2/64 frontier": 1833 problemas de entrenamiento y 112 de validación, seleccionados por ser casos que el modelo base solo resolvía en 2 de cada 64 muestras. Es, por tanto, un modelo orientado a investigación en RL para generación de código, no a despliegue de producto.

Los pesos suman 4 411 424 256 parámetros (unos 4,4 mil millones) en formato safetensors, con un repositorio de 123,5 GB que incluye múltiples ficheros de checkpoint. La model card no declara licencia, idiomas soportados, longitud de contexto ni esquemas de cuantización, por lo que esos datos figuran como no disponibles en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B); no se especifica en la model card |
| Parámetros totales | 4 411 424 256 (4,4 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (la model card no la declara) |
| Tipos de cuantización | No disponible; el repositorio solo contiene pesos safetensors en precisión completa |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 123,5 GB con varios checkpoints) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Revision principal | main (pesos en la raíz del repositorio) |
| Creado | 2026-09-09 |
| Actualizado | 2026-09-11 |
| Descargas | 756 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4,4 mil millones de parámetros. El autor no introduce modificaciones estructurales: el checkpoint es un ajuste de pesos sobre ese mismo modelo, por lo que no hay mezcla de expertos, atención lineal ni componentes SSM. El cambio respecto al base está exclusivamente en los pesos resultantes del proceso de RL.

El entrenamiento se realizó con OpenRLHF y el algoritmo GRPO, con ventajas normalizadas por grupo y sin penalización KL. El proceso arranca desde el modelo base de Qwen3-4B, sin semilla de SFT. La configuración declarada incluye 8 muestras por prompt, tamaño de lote de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 con esquema constante. La señal de recompensa es binaria y mide corrección de código contra los tests del problema. Se aplican dos mecanismos de forma: una penalización "stop-properly" que asigna recompensa -1,0 a las muestras truncadas (estilo ProRL) y una penalización DAPO de longitud excesiva que crece de forma aditiva hasta -0,25 en los últimos 1024 tokens antes del límite. El checkpoint corresponde al paso global 24 y está etiquetado en la model card como el mejor por pass@8 de la ejecución hasta la fecha.

## Capacidades

- Generación de código: es la capacidad objetivo del entrenamiento, optimizada mediante recompensa binaria de superación de tests.
- Razonamiento sobre problemas de programación de dificultad alta: el conjunto de entrenamiento se filtró para incluir solo problemas que el modelo base resolvía como máximo en 2 de 64 muestras.
- Generación de texto general: se hereda del modelo base Qwen3-4B-Instruct-2507, aunque el ajuste por RL puede haber desplazado el comportamiento hacia el dominio de código.
- Muestreo múltiple y evaluación pass@k: el modelo está pensado para generar 8 o más muestras por problema, con temperatura 1.0 en las evaluaciones de validación.
- Tool calling / function calling: no se declara explícitamente en la model card; el modelo base Qwen3 sí incorpora soporte de llamadas a funciones, pero no se confirma que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no disponibles como capacidad declarada.
- Modo "thinking": no declarado en la model card.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Visión o audio: no soportados; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Investigación en RL para código: sirve como punto de comparación intermedio en una curva de entrenamiento GRPO, permitiendo analizar cómo evoluciona pass@1 y pass@8 entre pasos globales con la misma receta.
- Generación de soluciones candidatas para problemas difíciles: se puede muestrear 8 veces por problema y filtrar por ejecución de tests, aprovechando que el modelo fue entrenado precisamente sobre el conjunto de casos que el base resolvía en menos del 4 % de los intentos.
- Ampliación de datasets de código con verificación automática: el modelo puede generar borradores de solución que después se validan con un harness de tests, y solo los que pasan se incorporan al corpus.
- Reproducción de experimentos de RL: la receta documentada (GRPO, penalización stop-properly, penalización DAPO de longitud, 8 muestras por prompt) permite replicar la ejecución y comparar checkpoints con el mismo pipeline OpenRLHF.
- Estudio de recompensas binarias y hacking de tests: al no usar KL ni recompensas intermedias, es un caso útil para investigar si el modelo aprende atajos que satisfacen los tests sin resolver el problema subyacente.
- Destilación y ajuste posterior: el checkpoint puede servir como profesor o como inicialización para un SFT breve que recupere capacidades conversacionales, dado que el RL se aplicó sin semilla de SFT.
- Evaluación comparativa de checkpoints: al estar etiquetado como el mejor de la ejecución por pass@8, es el candidato natural para enfrentarlo a otros pasos globales y a la línea base Qwen3-4B-Instruct-2507.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la evaluación del propio autor sobre el conjunto de validación retenido (112 problemas, 8 muestras por problema, temperatura 1.0). No hay comparación con otros modelos en la información disponible.

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| pass@1 (insesgado, media de fracción correcta por problema) | 0,3119 | Validación retenida cobalt-train, 8 muestras/problema |
| pass@8 (`eval_default_pass8`) | 1,5500 | Validación retenida cobalt-train, 8 muestras/problema |

Advertencia sobre la métrica: la model card describe pass@8 como "problema resuelto si alguna muestra es correcta", lo que normalmente produce un valor entre 0 y 1, pero el valor reportado es 1,5500. La definición efectiva del autor no queda aclarada en la información disponible, por lo que el número debe interpretarse con cautela. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8,8 GB solo para pesos en fp16/bf16, más la caché KV, que crece con la longitud de contexto efectiva (no declarada).
- GPU profesionales: una A100 40 GB, H100 o L40S bastan para servir el modelo en bf16 con margen amplio de contexto.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16 siempre que se limite el contexto; en tarjetas de 16 GB como la RTX 4080 es necesario cuantizar a 4 bits o reducir mucho la ventana.
- Cuantización a 8 bits: aproximadamente 4,9 GB de pesos, viable en GPUs de 8-12 GB.
- Cuantización a 4 bits: aproximadamente 2,6 GB de pesos, viable en GPUs de 8 GB e incluso en algunos iGPU con suficiente memoria compartida.
- Formatos cuantizados publicados: no hay ninguno; el repositorio solo contiene safetensors en precisión completa. Para usar llama.cpp, Ollama o LM Studio hay que convertir manualmente a GGUF.
- Opciones de despliegue: vLLM (`vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16 --revision main`), transformers con `AutoModelForCausalLM`, y TGI, ya que la etiqueta `text-generation-inference` está presente en el repositorio.
- Latencia y throughput: no disponibles; no se publican medidas de tokens por segundo ni de latencia por petición.
- Almacenamiento: el repositorio ocupa 123,5 GB, muy por encima de lo que necesitan los pesos finales (unos 8,8 GB en bf16), porque incluye múltiples ficheros de checkpoint de la ejecución. Conviene descargar solo los ficheros necesarios si se trabaja con espacio limitado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16 | 4,4 B | No disponible | RL GRPO sin SFT, paso global 24, recompensa binaria de código | No disponible | HuggingFace, revision main |
| Qwen/Qwen3-4B-Instruct-2507 | 4,4 B | No disponible en esta ficha | Instruct, ajuste alineado | No disponible en esta ficha | HuggingFace |
| Otros checkpoints de la misma ejecución `seeded_rl_base_ramp25_...` | 4,4 B | No disponible | Mismo pipeline RL, distintos pasos globales | No disponible | HuggingFace, repositorios separados |
| Alternativas comparables de 4-7 B orientadas a código | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

La comparación más pertinente es contra el propio modelo base Qwen3-4B-Instruct-2507, del que procede este checkpoint, y contra los demás checkpoints de la misma ejecución de RL. No hay datos publicados que permitan situarlo frente a otras familias de modelos de código de tamaño similar.

## Limitaciones y advertencias

- Es un checkpoint intermedio de RL (paso global 24) y no un modelo final: la model card no garantiza estabilidad de comportamiento ni calidad conversacional.
- No se aplicó SFT antes del RL, por lo que el formato de instrucciones y las capacidades de diálogo pueden haberse degradado respecto al modelo base.
- El pass@1 reportado es 0,3119, es decir, en torno a un 31 % de respuestas correctas por muestra en el conjunto de validación; no es un modelo fiable para uso directo sin verificación.
- La métrica pass@8 = 1,5500 es inconsistente con la definición textual aportada por el autor, lo que impide interpretarla como una tasa de acierto convencional.
- Ausencia total de licencia declarada: no hay autorización explícita de uso comercial, y en muchas jurisdicciones la ausencia de licencia implica reserva de todos los derechos. No debe usarse en producción sin aclarar este punto con el autor y con el licenciante del modelo base.
- Riesgo de sobreajuste al dominio: el entrenamiento se concentró en 1833 problemas de un conjunto filtrado por dificultad, lo que puede reducir la generalización a otros tipos de tareas de código o a otros lenguajes de programación.
- Riesgo de "test hacking": con recompensa binaria y sin penalización KL, el modelo podría aprender a satisfacer los tests sin resolver correctamente el problema subyacente. No se publican análisis al respecto.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de robustez; el comportamiento fuera del dominio de código es desconocido.
- Idiomas no declarados: se desconoce el soporte multilingüe real más allá de lo heredado del modelo base.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad ni seguridad.
- Sin cuantizaciones oficiales: usar el modelo en 4 u 8 bits exige conversión propia y puede alterar el rendimiento observado en la evaluación original.
- Repositorio de 123,5 GB: el coste de almacenamiento y descarga es desproporcionado respecto al tamaño de los pesos, por la acumulación de checkpoints.
- El checkpoint depende del modelo base Qwen3-4B-Instruct-2507, cuyos términos de uso deben respetarse adicionalmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Registro de entrenamiento en Weights & Biases: proyecto `eaiexp-paper-final`, ejecución `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_q4v2_iid16` (el autor no facilita la URL directa)
- Log de entrenamiento local indicado en la model card: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_q4v2_iid16/openrlhf_train.log` (ruta local del autor, no accesible públicamente)
- OpenRLHF (framework de entrenamiento citado): no se proporciona enlace en la información disponible
- Paper o informe técnico asociado: no disponible
- Espacio de demostración: no disponible

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido sobre pizzerías en Redmond, Washington) y se han descartado por completo.
