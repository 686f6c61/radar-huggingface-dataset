# oumaimaaaa/6g-intent-pipeline

## Resumen

El repositorio `oumaimaaaa/6g-intent-pipeline` contiene el paquete de inferencia completo de un pipeline de clasificación de intenciones de servicio para redes 6G, denominado "6G Intent Classification Pipeline V2" por su autor. No es un modelo de propósito general, sino un modelo ajustado (fine-tuned) sobre `Qwen/Qwen2.5-1.5B-Instruct` para una tarea muy concreta: recibir una intención de servicio 6G en lenguaje natural y devolver una decisión de aceptación o rechazo, una de las seis clases de escenario de uso 6G definidas por el autor, probabilidades calibradas por clase, candidatos Top-1 y Top-2 con su margen, y una acción de enrutado final.

El problema que resuelve es el de la validación y el enrutado fiable de intenciones en arquitecturas de red autónomas: el modelo no solo clasifica, sino que actúa como guardarraíl (rechaza intenciones con instrucciones embebidas que intentan saltarse las comprobaciones) y como componente de enrutado selectivo, capaz de pedir aclaración al usuario cuando la confianza o el margen entre clases no alcanzan los umbrales configurados. El paquete incluye además el procedimiento de inferencia reproducible (prompts, puntuación de las seis clases por log-probabilidad de los verbalizadores, escalado de temperatura y política de enrutado), lo que lo hace relevante para quien necesite replicar la evaluación, aunque el repositorio no publica resultados de benchmarks ni métricas finales.

El modelo es de tamaño pequeño (1 500 millones de parámetros según la model card) y fue ajustado con QLoRA + DoRA, con el adaptador fusionado en el modelo base antes del despliegue. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su model card está incompleta (la sección de `CLARIFY` aparece truncada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct); no se detalla en la model card |
| Parametros totales | 1 500 millones (1,5 B), segun la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct, que declara 32 768 tokens) |
| Tipos de cuantizacion | No se publican pesos cuantizados. El entrenamiento uso QLoRA (4 bits). El modelo se distribuye fusionado y cargable con Hugging Face Transformers |
| Idiomas soportados | No disponible. Los prompts e intenciones de ejemplo estan en ingles |
| Licencia | No disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | Pesos fusionados para Hugging Face Transformers (no se confirma safetensors en la model card); no se ofrecen GGUF ni otros formatos |

Otros datos del repositorio: autor `oumaimaaaa`, etiqueta `region:us`, 0 descargas, 0 likes, pipeline no declarado, creado el 2026-10-04 y actualizado el 2026-10-04.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1,5 B de parámetros. Sobre él se aplicó un ajuste fino con QLoRA + DoRA (adaptación de bajo rango sobre pesos cuantizados a 4 bits, con descomposición en magnitud y dirección), y el adaptador resultante se fusionó en el modelo base antes del despliegue, de forma que el modelo puede cargarse directamente con Transformers sin cargar el adaptador PEFT por separado. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación principal no está en el modelo, sino en el pipeline que lo envuelve. El modelo genera exactamente tres líneas (`Decision: ACCEPT|REFUSE`, `Class: ...`, `Explanation: ...`), y esa clase generada se contrasta con una segunda señal de clasificación independiente: para cada una de las seis clases candidatas (`IC`, `HRLLC`, `MC`, `UC`, `AIAC`, `ISAC`) se calcula la log-probabilidad media por token de la etiqueta verbalizadora tras el prefijo `Decision: ACCEPT\nClass:`, y las puntuaciones brutas se convierten en probabilidades mediante softmax con escalado de temperatura. La configuración de calibración (`calibration_ft.json`) fija `temperature = 0.1`, `min_confidence = 0.0`, `min_margin = 0.0`, `target_accuracy = 0.95` y `require_generated_match = true`; con esta última activa, la clase generada debe coincidir con el Top-1 del scorer para poder enrutar. Estos valores se seleccionaron sobre el conjunto de validación y no deben recalcularse en inferencia normal. A partir de la probabilidad Top-1, la Top-2 y su margen (`class_margin = class_top1_prob - class_top2_prob`), el pipeline decide entre `route`, `clarify_class` y `refuse`.

## Capacidades

- Clasificación de intenciones de servicio 6G en una de seis clases: `IC` (Immersive Communication), `HRLLC` (Hyper Reliable Low-Latency Communication), `MC` (Massive Communication), `UC` (Ubiquitous Connectivity), `AIAC` (AI and Automation Communication) e `ISAC` (Integrated Sensing and Communication).
- Decisión binaria de validación (`ACCEPT` / `REFUSE`) con explicación corta del motivo de rechazo cuando procede.
- Detección de instrucciones embebidas en la intención del usuario que intentan saltarse las comprobaciones de validación (según el ejemplo de la propia model card).
- Salida estructurada y determinista de tres líneas, apta para ser parseada por componentes posteriores.
- Puntuación calibrada de las seis clases mediante log-probabilidad de los verbalizadores, con probabilidad Top-1, Top-2 y margen.
- Enrutado selectivo con tres acciones: `route`, `clarify_class` (pide al usuario que elija entre Top-1 y Top-2) y `refuse`.
- Genera la clase subyacente incluso en peticiones rechazadas, de modo que el rechazo no pierde la señal de clasificación.
- Especificación completa del procedimiento de inferencia (`pipeline/prompts.py`, `pipeline/model_runner.py`, `pipeline/calibration.py`), pensada para reproducibilidad.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Validación de entrada en orquestadores de red 6G: el pipeline actúa como primera etapa que acepta o rechaza la intención antes de que llegue al planificador de recursos, con la ventaja de que el rechazo va acompañado de una explicación textual reutilizable en logs y en respuestas al operador.
- Guardarraíl frente a prompt injection en interfaces de gestión de red: el modelo está ajustado para identificar intenciones que contienen instrucciones embebidas destinadas a saltarse la validación, un escenario realista cuando la intención se redacta en un chat de operaciones o proviene de un sistema externo.
- Enrutado de intenciones a módulos de dominio: las seis clases se corresponden con escenarios de uso diferenciados, de modo que `routed_class` puede dirigir la petición al módulo de gestión de slices adecuado (por ejemplo, latencia ultrabaja frente a comunicación masiva).
- Desambiguación asistida con `clarify_class`: cuando la probabilidad Top-1 y el margen no son concluyentes, el pipeline devuelve al usuario las dos clases candidatas para que elija, reduciendo el coste de una clasificación errónea silenciosa.
- Etiquetado y triaje de tickets o peticiones de operadores: el modelo puede procesar en lote descripciones de servicio en lenguaje natural y asignarles una de las seis clases, útil para construir datasets etiquetados o para priorizar colas de trabajo.
- Microservicio de inferencia en un pipeline OSS/BSS: al ser un modelo de 1,5 B con salida estructurada de tres líneas, es viable exponerlo como servicio ligero detrás de una API y encadenarlo con componentes deterministas de aprovisionamiento.
- Investigación académica sobre gestión de intenciones en 6G: el repositorio permite reproducir exactamente el procedimiento de inferencia y calibración, lo que facilita comparaciones metodológicas y estudios de robustez frente a entradas adversarias.
- Filtrado previo a sistemas de agentes: como etapa de bajo coste que descarta o marca intenciones no válidas antes de invocar modelos mayores, reduciendo el gasto computacional en el resto de la cadena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato numérico de rendimiento presente en la model card es el objetivo de calibración `target_accuracy = 0.95` seleccionado sobre el conjunto de validación, junto con `temperature = 0.1`, `min_confidence = 0.0` y `min_margin = 0.0`. No se especifica el tamaño del conjunto de validación, la composición del conjunto de test, el accuracy o F1 finales por clase, ni la tasa de rechazos correctos o incorrectos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño de 1,5 B de parámetros, no publicada por el autor): en torno a 3-4 GB en fp16, unos 2 GB en int8 y alrededor de 1-1,5 GB en 4 bits, más el coste del contexto y de los estados de la atención.
- Sobrecoste específico del pipeline: además de la generación, el runner evalúa seis verbalizadores por log-probabilidad, lo que implica seis evaluaciones adicionales del prefijo del asistente. Conviene dimensionar el hardware contando ese factor y no solo la generación autoregresiva de tres líneas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM efectiva es suficiente para el modelo en precisión reducida; para lotes grandes o para servir varias réplicas, tarjetas tipo A10G, L4, RTX 4090 o A100/H100 aportan margen amplio.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en portátiles con 6-8 GB de VRAM si se usa cuantización de 8 o 4 bits.
- Opciones de despliegue: Hugging Face Transformers es la vía documentada, ya que los pesos se distribuyen fusionados y sin adaptador PEFT. El repositorio no menciona soporte de vLLM, TGI, llama.cpp, Ollama ni otros motores, y no publica pesos GGUF.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de latencia, tokens por segundo ni rendimiento por lote.

## Comparativa con modelos similares

No se identifican en la informacion disponible otros clasificadores publicados de intenciones 6G comparables, ni el repositorio incluye comparaciones con alternativas. La comparación más directa posible es con el modelo base y con modelos pequeños de propósito general, teniendo en cuenta que ninguno de ellos ofrece la salida estructurada ni el enrutado selectivo de este pipeline:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 6G Intent Classification Pipeline V2 (este repositorio) | 1,5 B | no disponible en la model card | Clasificacion de intenciones 6G en 6 clases, validacion, calibracion y enrutado | no disponible | Hugging Face, pesos fusionados para Transformers |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | 32 768 tokens | Instrucciones generales, sin clases 6G ni salida de tres lineas | Apache 2.0 | Hugging Face |
| Modelos pequenos de proposito general (por ejemplo, familias de 1-2 B con licencia permisiva) | 1-2 B | variable | Instrucciones generales; requieren ajuste para esta tarea | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo de este repositorio, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Repositorio sin tracción ni validación externa: 0 descargas y 0 likes, sin resultados de benchmarks ni métricas de evaluación publicadas. No hay evidencia pública de su comportamiento fuera del conjunto de validación del autor.
- Model card incompleta: la sección dedicada a la acción `CLARIFY` aparece truncada, por lo que el comportamiento exacto de ese camino del pipeline (umbrales efectivos, formato de salida completo) no puede verificarse a partir de la información disponible.
- Licencia no declarada en la model card. Aunque el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0, la ausencia de licencia explícita en este repositorio impide asumir condiciones de uso comercial sin consultar al autor.
- Idiomas no declarados: los prompts y ejemplos están en inglés y no se documenta el comportamiento con intenciones en castellano u otros idiomas.
- Riesgo de alucinación: el modelo genera una explicación de rechazo en texto libre, que puede no corresponderse con el motivo real de la invalidación si el clasificador se equivoca.
- Dependencia de dos señales acopladas: con `require_generated_match = true`, un desacuerdo entre la clase generada y el Top-1 del scorer de verbalizadores bloquea el enrutado. Los valores de calibración (`temperature = 0.1`, umbrales a 0.0) no deben modificarse en producción según el autor, lo que limita el ajuste fino del comportamiento a entornos concretos.
- Riesgo de inyección de prompt residual: aunque el modelo está ajustado para rechazar instrucciones embebidas, no se publican tasas de detección ni pruebas adversarias, por lo que no puede cuantificarse su robustez real.
- Restricción de dominio: el espacio de salida está cerrado a seis clases fijas; cualquier intención fuera de ese conjunto debe ser tratada por el mecanismo de rechazo, y un rechazo incorrecto descarta la petición.
- Ausencia de soporte documentado para cuantización publicada (GGUF) y para motores de servicio de alto rendimiento, lo que puede limitar el despliegue en entornos con restricciones de memoria.
- Fecha de publicación futura respecto a la fecha habitual de consulta (creado el 2026-10-04), dato a verificar si se integra en un catálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oumaimaaaa/6g-intent-pipeline
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes al modelo, a su paper ni a repositorios asociados; los enlaces devueltos corresponden a sitios de contenido para adultos y se descartan.
- No se dispone de paper, blog tecnico, repositorio de codigo independiente ni demo del autor.
