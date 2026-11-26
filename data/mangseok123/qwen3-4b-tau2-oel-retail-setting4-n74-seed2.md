# MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n74-seed2

## Resumen

`qwen3-4b-tau2-oel-retail-setting4-n74-seed2` es un ajuste fino de `Qwen/Qwen3-4B-Instruct-2507` publicado por el usuario MANGSEOK123 en Hugging Face. El modelo aplica una técnica de "internalización de habilidades" (*skill internalization*) mediante autodestilación en política (*on-policy self-distillation*, OPSD) sobre el benchmark tau2-bench, en su variante de retail (v1.0.1). El objetivo es que el modelo alumno aprenda a resolver tareas conversacionales de atención al cliente sin necesidad de recibir la habilidad en el *system prompt*, imitando a un profesor congelado que sí la tiene.

El entrenamiento se realizó con el código OEL (LMOps) usando 74 pares tarea-habilidad de los 176 disponibles en TANI Full, con una única época y 8 pares por actualización. Es un experimento de investigación acotado (semilla 2) más que un modelo listo para producción: no hay model card extensa, no se declaran idiomas, licencia ni resultados de evaluación. Su interés radica en documentar cómo se puede transferir una habilidad textual (instrucciones de sistema) a los pesos del modelo mediante destilación sobre rollouts propios.

Arquitecturalmente es un transformer denso de 4.411.424.256 parámetros (~4,4 B), con pesos en BF16 y un tamaño de repositorio de 8,8 GB. Hereda las capacidades del Qwen3-4B-Instruct-2507 base, pero el ajuste está orientado específicamente a diálogo de dominio retail con uso de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), derivado de Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.411.424.256 (~4,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens por turno) |
| Tipos de cuantizacion | No se publican cuantizaciones; pesos originales en BF16 (compatibles con cuantizacion posterior via llama.cpp, GPTQ, AWQ, etc.) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3, no declarados por el autor) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4,4 mil millones de parámetros. Sobre esa base se aplica autodestilación en política (OPSD) con el código OEL de LMOps. El procedimiento: el alumno (el propio modelo, sin la habilidad en el *system prompt*) juega cada tarea de tau2-bench retail con temperatura 0,7 y un simulador de usuario basado en GPT-4.1-mini; el profesor es una copia congelada del modelo inicial que sí lleva la habilidad inyectada en el *system prompt*. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del alumno, optimizada con AdamW (lr 3e-6 constante, weight decay 0,01, grad clip 1,0).

Los datos de entrenamiento son 74 pares tarea-habilidad de los 176 de TANI Full (habilidades validadas cruzadas con tareas fuente/sonda con utilidad > 0), seleccionados con `random.Random(2).sample(pool, N)` y con orden de datos y muestreo de rollouts sembrados con la semilla 2. Se realiza 1 época con 8 pares por actualización. Los prompts se truncan a 8192 tokens y las respuestas a 1024 tokens por turno. Los pesos finales se guardan en BF16. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de retail (atención al cliente, gestión de pedidos, devoluciones, consultas de producto).
- Internalización de habilidades: resuelve tareas de tau2-bench retail sin necesidad de instrucciones de habilidad en el *system prompt*, al haberlas destilado en los pesos.
- Uso de herramientas y funciones (*tool calling* / *function calling*), heredado del modelo base y reforzado por el entorno tau2-bench, que requiere invocar APIs simuladas.
- Razonamiento multi-paso orientado a agentes: el formato de tau2-bench exige planificar acciones y consultar herramientas de forma secuencial.
- Capacidades multilingües: no declaradas explícitamente; se asumen las del Qwen3-4B-Instruct-2507 base, pero sin garantía tras el ajuste.
- No se documentan capacidades de visión, audio ni modo *thinking* explícito en la información disponible.

## Casos de uso

- **Atención al cliente automatizada en retail**: el modelo está entrenado específicamente sobre tau2-bench retail, por lo que puede gestionar conversaciones multi-turno con un usuario simulado, consultar el estado de pedidos, tramitar devoluciones y resolver incidencias invocando herramientas del entorno.
- **Agentes de soporte con tool calling**: al haber sido destilado en un entorno que exige llamadas a funciones (APIs de pedidos, catálogo, reembolsos), es adecuado como núcleo de un agente que deba encadenar consultas y acciones sobre un backend real.
- **Sustitución de instrucciones de sistema por comportamiento aprendido**: útil en producción cuando se quiere reducir el *prompt* de sistema (ahorro de tokens y latencia) y que el modelo ya "sepa" el procedimiento sin repetirlo en cada llamada.
- **Investigación en destilación de habilidades**: sirve como punto de comparación (semilla 2, 74 pares) para estudiar la transferencia de instrucciones a pesos y la variabilidad entre semillas en experimentos OPSD.
- **Prototipado de asistentes de comercio electrónico**: con 4,4 B de parámetros puede desplegarse en una GPU de gama media para pruebas de concepto de flujos de compra y postventa antes de escalar a modelos mayores.
- **Evaluación de robustez conversacional**: al estar ajustado sobre un benchmark concreto, es útil para medir degradación fuera de dominio y comparar con el modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el procedimiento de entrenamiento (74 pares, 1 época, semilla 2) y no reporta métricas de tau2-bench ni de otros conjuntos.

## Requisitos de hardware

- **VRAM estimada en BF16**: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 10-12 GB para contexto moderado.
- **VRAM en cuantización**: ~4,5 GB en FP8/INT8 y ~2,5-3 GB en Q4_K_M (GGUF), aunque el autor no publica versiones cuantizadas.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S para despliegue con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 con holgura.
- **Consumer GPU**: cabe en RTX 4090, 3090, 4080 (16 GB) e incluso en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- **Opciones de despliegue**: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama tras conversión a GGUF.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-setting4-n74-seed2 | ~4,4 B | No disponible | Ajuste OPSD sobre tau2-bench retail | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,4 B | No disponible en esta ficha | Instrucción general | Apache 2.0 (según el modelo base original) | Hugging Face, ampliamente usado |
| Qwen3-4B (versión original) | ~4 B | No disponible en esta ficha | Instrucción general con modo thinking | Apache 2.0 | Hugging Face |
| Otros ajustes tau2-bench de la misma familia (OEL) | ~4 B | No disponible | Variantes de semilla/configuración | No disponible | Hugging Face (repositorios del mismo autor) |

La comparación directa de rendimiento no es posible porque este modelo no publica métricas. Frente al base, la diferencia esperada es una mejora en tareas de retail con herramientas y una posible pérdida de generalidad fuera de dominio, algo habitual en ajustes sobre un único benchmark.

## Limitaciones y advertencias

- **Sin licencia declarada**: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Verificar con el autor antes de cualquier despliegue productivo.
- **Sobreajuste al benchmark**: entrenado exclusivamente sobre tau2-bench retail v1.0.1 con 74 pares y 1 época; el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- **Riesgo de alucinación**: como todo modelo generativo, puede inventar datos de pedidos, políticas de devolución o resultados de herramientas si el entorno no las valida.
- **Idiomas no declarados**: no se garantiza un comportamiento multilingüe correcto tras el ajuste, aunque el base lo soporte.
- **Contexto no documentado**: la model card solo indica límites de entrenamiento (8192 tokens de prompt, 1024 de respuesta por turno), no la ventana máxima efectiva.
- **Reproducibilidad limitada**: es un experimento con semilla 2 y una configuración concreta; los resultados pueden no generalizar a otras semillas o presupuestos de datos.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni evaluaciones independientes.
- **Sesgos**: no documentados; hereda los del modelo base y los del simulador de usuario GPT-4.1-mini usado durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n74-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio OEL (LMOps): no disponible en la información proporcionada
- Paper de tau2-bench: no disponible en la información proporcionada
- Paper de Qwen3: no disponible en la información proporcionada
