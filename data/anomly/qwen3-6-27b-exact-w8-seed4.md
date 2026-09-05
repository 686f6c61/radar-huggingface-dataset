# Anomly/qwen3.6-27b-exact-w8-seed4

## Resumen

El repositorio `Anomly/qwen3.6-27b-exact-w8-seed4` contiene un adaptador QLoRA sobre el modelo base `Qwen/Qwen3.6-27B`, desarrollado por Anomly con el objetivo de investigar la viabilidad de entrenar un modelo de lenguaje con aritmética de enteros exacta de baja precisión. El modelo base es un modelo denso de 27.000 millones de parámetros con capacidades de visión y lenguaje, que según su documentación alcanza un 77,2 % en SWE-bench Verified. Este adaptador se entrenó en 2.000 trayectorias exitosas de agentes de ingeniería de software procedentes del dataset `nebius/SWE-rebench-openhands-trajectories`, renderizadas en ChatML, con pérdida únicamente en los turnos de asistente y 200 pasos de optimización.

La novedad técnica no reside en mejorar las capacidades del modelo base, sino en demostrar que un fine-tune con GEMMs de enteros exactos de 8/10 bits (con acumulación int32) alcanza la misma pérdida held-out que una ejecución gemela en bf16, a la vez que reduce el número de operaciones de multiplicación en bits en un factor de 2,7–2,9×. Además, cada paso de entrenamiento se encadena en un certificado verificable que permite re-ejecutar el entrenamiento de forma bit a bit. El autor indica explícitamente que no se reivindica ninguna mejora de capacidad de código sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.6-27B) con adaptador QLoRA |
| Parametros totales | 27.000 millones (modelo base) + parámetros del adaptador LoRA (r=16, all-linear, base nf4); el número exacto de parámetros del adaptador no está disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada; el adaptador usa QLoRA con base nf4 y el artefacto `exact-w8` utiliza operandos de 8/10 bits en los GEMMs |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA con rango r=16, aplicado a todas las capas lineales, sobre una base cuantizada a 4 bits (nf4) de `Qwen/Qwen3.6-27B`. El dataset de entrenamiento son 2.000 trayectorias de agentes de software engineering verificadas como exitosas, extraídas de `nebius/SWE-rebench-openhands-trajectories` (CC-BY-4.0). Se usa formato ChatML y se optimiza solo la pérdida de los turnos de asistente durante 200 pasos. El entrenamiento se ejecutó en una única GPU de consumo, una RTX 5090 de 32 GB, manteniendo el mismo orden de datos e inicialización LoRA para cada par de ejecuciones.

La innovación principal es el artefacto `exact-w8`, que enruta los GEMMs de cada capa lineal (tanto la base nf4 congelada como las matrices LoRA A/B) a través de una ruta de "limb dinámico" de Anomly. Los operandos se cuantizan por filas a 8 bits (o 10 bits cuando una sonda emparejada lo indica), los productos se calculan en núcleos tensor INT8 IMMA con acumulación int32 exacta, y solo se realiza un redondeo a la salida. Cada 5 pasos, el entrenamiento emite un recibo encadenado que incluye identificadores de datos, hashes SHA-256 de pesos y estado del optimizador, una firma de quire de 320 bits de los gradientes acumulados, estados RNG, el ancho elegido y el hash del recibo anterior. Esto permite re-ejecutar los pasos de forma bit a bit, una propiedad que no ofrecen los GEMMs en bf16.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-27B, que incluyen razonamiento STEM y habilidades agénticas de programación.
- Código y matemáticas: el modelo base tiene un rendimiento destacado en SWE-bench Verified (77,2 %) y el adaptador está entrenado en trayectorias de ingeniería de software, por lo que está especializado en el contexto de esa tarea.
- Soporte de tool calling / function calling: no se han publicado evaluaciones específicas de este adaptador, pero el modelo base Qwen3.6-27B tiene capacidades agénticas según su documentación.
- Soporte de agentes y multi-step reasoning: el dataset de entrenamiento consiste en trayectorias de agentes de OpenHands, lo que orienta el adaptador a escenarios de razonamiento multi-paso.
- Capacidades multilingües: no se especifican para este adaptador.
- Capacidades especiales: el artefacto `exact-w8` es un experimento de investigación que no añade capacidades funcionales al modelo, pero sí incluye un certificado verificable de integridad del entrenamiento.
- Visión: el modelo base es un modelo vision-language, pero el adaptador se presenta con pipeline `text-generation` y no se documenta su comportamiento multimodal.

## Casos de uso

- Investigación en entrenamiento verificable: el modelo publica una cadena de recibos que permite re-ejecutar el entrenamiento de forma bit a bit, lo que lo hace adecuado para estudiar técnicas de auditoría y reproducibilidad en entornos donde se exige trazabilidad completa del proceso.
- Estudio de eficiencia aritmética: al existir dos variantes gemelas (bf16 y exact-w8), se puede analizar cómo la aritmética de enteros de 8/10 bits afecta a la convergencia y al coste computacional, midiendo la reducción de operaciones de bits sin pérdida de precisión.
- Detección de fallos silenciosos en hardware: el verificador de certificados puede ejecutarse en cualquier GPU CUDA con PyTorch para comprobar que los productos IMMA coinciden con una réplica en CPU int64, lo que sirve para detectar corrupción de memoria o comportamientos anómalos del kernel.
- Punto de partida para evaluación de agentes de software: el adaptador se entrenó en 2.000 trayectorias exitosas de SWE-rebench, por lo que puede utilizarse como referencia para comparar el efecto de distintos datos o configuraciones de entrenamiento en tareas de reparación de código.
- Docencia en fine-tuning con QLoRA: el repositorio incluye el flujo completo de entrenamiento con PEFT y bitsandbytes, junto con un CLI de verificación, lo que lo convierte en un ejemplo práctico para enseñar técnicas de cuantización y adaptación de modelos.
- Benchmark de integridad de entrenamiento: el script `verify_vc1.py` permite re-entrenar un segmento de pasos (por ejemplo, del 195 al 200) y comprobar que los pesos coinciden bit a bit, lo que es útil para validar la fiabilidad de pipelines de entrenamiento distribuido o continuo.

## Benchmarks y rendimiento

El modelo card no incluye benchmarks estándar de capacidades (MMLU, HumanEval, GSM8K, etc.), sino una comparación de pérdida held-out y de eficiencia entre los dos brazos del experimento. Los datos disponibles son:

| Metrica | bf16 twin | exact 8/10-bit |
|---|---|---|
| Pérdida held-out (turno asistente, 100 trayectorias no vistas), por seed | 0,3493 / 0,3483 / 0,3489 / 0,3504 / 0,3484 | 0,3482 / 0,3489 / 0,3502 / 0,3491 / 0,3483 |
| Diferencia emparejada (exact − bf16), n = 5 | | media −0,0001, sd 0,0011, p = 0,82, IC [−0,0015, +0,0013] |
| Programa de ancho de operando | floats de 16 bits | 55–70 % de pasos a 8 bits, resto a 10 bits; nunca por encima de 10 |
| Operaciones de bits de multiplicación vs. línea base de operandos de 16 bits | 1× | 2,7–2,9× menos |
| Tiempo de pared por paso, segmentos de 8 bits sin sonda vs. gemelo | 1× | 0,89–1,01× (paridad) |
| Segmentos de 10 bits (4 productos IMMA por GEMM) | 1× | 1,30–1,34× |
| Cadena de recibos + re-ejecución bit a bit de pasos 195→200 | PASS | PASS |
| Certificado entero (productos IMMA de GPU == int64 de CPU, hash idéntico) | n/a | PASS |

No se han publicado resultados de benchmarks de capacidades en la información disponible. El propio autor advierte que la regla pre-registrada para reclamar una mejora ("claim a lift") no se activó: la diferencia de pérdida no es estadísticamente significativa y el experimento no tiene potencia suficiente para detectar efectos menores de 0,0014 en pérdida de validación.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU de consumo: RTX 5090 con 32 GB de VRAM. Ambos brazos del experimento (bf16 y exact-w8) se ejecutaron en la misma tarjeta.
- Para inferencia del adaptador sobre el modelo base de 27B con cuantización nf4, se espera que sea necesario un orden de 14–16 GB de VRAM, pero no se proporciona un valor confirmado en la información disponible.
- No se detallan requisitos específicos de despliegue en la documentación del repositorio; al ser un adaptador PEFT, es probable que pueda cargarse con `transformers` y `bitsandbytes`, pero no hay una guía oficial.
- La verificación de certificados (`e9c_remote_verify.py`) requiere cualquier GPU CUDA con PyTorch estándar.
- La re-ejecución del entrenamiento (`verify_vc1.py`) necesita el trainer y la capa de aritmética exacta (`spacetime.dynlimb` / `dynwidth` / `verifiable_ft`), cuyo consumo de VRAM no se especifica.

## Comparativa con modelos similares

La comparación más directa es entre las dos variantes publicadas en el mismo repositorio y el modelo base sin adaptar. No se conocen otros modelos de la misma categoría (fine-tune con aritmética exacta verificable sobre Qwen3.6-27B).

| Modelo | Parametros | Contexto | Rendimiento (pérdida held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.6-27B (base) | 27.000 millones | no disponible | no disponible (no se ha evaluado en esta campaña) | Apache-2.0 | HuggingFace |
| Anomly/qwen3.6-27b-exact-w8-seed4 (variante exact-w8) | 27.000 millones + adaptador LoRA | no disponible | media 0,3490 (semillas) | Apache-2.0 | HuggingFace |
| Anomly/qwen3.6-27b-exact-w8-seed4 (variante bf16) | 27.000 millones + adaptador LoRA | no disponible | media 0,3491 (semillas) | Apache-2.0 | HuggingFace |

La diferencia entre las dos variantes es estadísticamente nula (p = 0,82). No se dispone de benchmarks de tareas para ninguno de los tres modelos en la información proporcionada.

## Limitaciones y advertencias

- No se reivindica ninguna mejora de capacidad sobre el modelo base. El autor lo declara explícitamente: "Nothing here is claimed to be a better coder than the base model."
- El adaptador se entrenó solo en 2.000 trayectorias de un dataset específico (SWE-rebench), por lo que es probable que esté sobreajustado a ese dominio y no generalice a otras tareas de código o software engineering.
- No se han publicado evaluaciones de sesgos, toxicidad o alucinaciones. No hay datos sobre el comportamiento del modelo en contextos adversos.
- La única métrica de validación reportada es la pérdida en turnos de asistente; no se incluyen evaluaciones de tareas de razonamiento, matemáticas o generación de código.
- El experimento tiene baja potencia estadística: el tamaño del efecto mínimo detectable es de 0,0014 en pérdida de validación, mientras que la variabilidad entre seeds en bf16 es de 0,0021. Cualquier diferencia real menor no puede ser detectada con n = 5.
- Los artefactos `exact-w8` requieren el código de verificación y la capa de aritmética exacta de Anomly para re-ejecutar el entrenamiento; sin ese entorno, la reproducibilidad bit a bit no es accesible.
- El modelo no es un modelo de chat estándar: se presenta como un experimento de investigación con fines de verificación y eficiencia, no como un producto listo para producción.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio contiene material del dataset bajo CC-BY-4.0, por lo que se debe mantener la atribución correspondiente.

## Enlaces

- HuggingFace: https://huggingface.co/Anomly/qwen3.6-27b-exact-w8-seed4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/nebius/SWE-rebench-openhands-trajectories
- Paper relacionado: https://arxiv.org/abs/2510.16830
- Guía de Qwen3.6-27B (contexto del modelo base): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Documentación de QwenCloud sobre Qwen3.6-27B: https://www.qwencloud.com/models/qwen3.6-27b
