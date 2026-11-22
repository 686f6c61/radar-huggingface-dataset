# Me-Daniel/Inkling-2-Mini-Metal-GGUF

## Resumen

Inkling-2-Mini-Metal-GGUF es una cuantización GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario Me-Daniel. El modelo base es un transformer con arquitectura de bucle (looped model): las capas 6 a 17 se ejecutan tres veces sobre los mismos pesos, lo que multiplica la profundidad efectiva sin aumentar el número de parámetros. El repositorio contiene un único archivo de 11,51 GB pensado para ejecutarse íntegramente en la GPU de un Mac con Apple Silicon mediante llama.cpp.

La motivación del autor es técnica: en Metal, los tensores NVFP4 del GGUF de Unsloth (UD-IQ3_XXS) caen a la CPU, lo que degrada la velocidad. Esta versión usa exclusivamente tipos de tensor que la GPU del Mac puede ejecutar, a cambio de una fidelidad algo menor respecto al modelo original (KL de 0,02686 frente a 0,01939 de Unsloth). El resultado es un archivo 3,3 veces más rápido en lectura de prompt y 1,75 veces más rápido en generación sobre un Apple M5 Pro.

El modelo tiene 26.070.385.152 parámetros totales (unos 26 mil millones) según los safetensors del modelo base, licencia Apache 2.0 y está orientado a uso conversacional con capacidad de razonamiento extendido (modo thinking). Su contexto práctico documentado es de 32.768 tokens, aunque el autor recomienda limitar el presupuesto de razonamiento a 16K para evitar bucles de pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle de capas (capas 6-17 ejecutadas 3 veces) |
| Parametros totales | 26.070.385.152 (~26 B) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de ejemplo); no se especifica el máximo del modelo base |
| Tipos de cuantizacion | GGUF mixta (layout elegido entre 4 candidatos probados; tipos compatibles con Metal, sin NVFP4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de transformer con reutilización de bloques: las capas 6 a 17 se aplican tres veces consecutivas con los mismos pesos. Este esquema incrementa el cómputo efectivo por token sin aumentar el recuento de parámetros, y es el objeto de estudio del piloto de tesis de máster en el que se enmarca esta publicación. El autor documenta que cada pasada tiene un coste similar y que las tres juntas cuestan más que la suma de las pasadas individuales, lo que sugiere efectos no lineales en la acumulación de error de cuantización.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card del autor de la cuantización no reproduce esos datos del modelo base. La innovación destacable de esta publicación no está en el entrenamiento sino en el proceso de cuantización: se midió el coste de comprimir cada uno de 5 grupos de capas (incluido el núcleo que se ejecuta tres veces), se eligió el layout entre 4 candidatos probados y se usó una importance matrix procedente de `ggml-org/Inkling-2-Mini-GGUF`. El test de calidad se registró de antemano (pre-registration) y el archivo lo falló, dato que el autor publica explícitamente.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento extendido con modo thinking: el comando de ejemplo usa `--reasoning-budget 16384`, lo que indica soporte de cadena de pensamiento con presupuesto de tokens configurable.
- Compatibilidad con plantillas Jinja (`--jinja`), necesaria para el formateo correcto de chat.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con servidores de inferencia tipo API.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Capacidades multilingües: no disponible; no se especifican idiomas.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en 24 GB de memoria unificada con contexto de 16K, lo que permite desplegar un chat privado sin conexión en un portátil Apple Silicon, con los datos sin salir del equipo.
- Prototipado de razonamiento con presupuesto acotado: el flag `--reasoning-budget` permite limitar la cadena de pensamiento a 16K tokens, útil para experimentar con modelos de razonamiento en local controlando coste y latencia.
- Investigación sobre modelos con bucles: el repositorio incluye un estudio medido de cómo se acumula el error de cuantización por pasada, reutilizable por investigadores que trabajen con arquitecturas de capas reutilizadas.
- Evaluación comparativa de cuantizaciones GGUF: los scripts y logs del autor (KL sobre texto reservado, velocidad de prompt y generación) sirven como metodología reproducible para comparar archivos de distinto origen.
- Desarrollo y pruebas de pipelines llama.cpp: al ser un GGUF estándar ejecutable con llama-cli y builds recientes de llama.cpp, sirve para validar integraciones antes de pasar a producción.
- Inferencia en entornos con GPU integrada: para equipos Apple Silicon donde no hay GPU dedicada, esta es una de las pocas opciones de un modelo de ~26B que se mantiene íntegramente en la GPU sin caídas a CPU.
- Base para ajuste fino o destilación: al estar bajo Apache 2.0 y en formato GGUF, puede servir como referencia de comportamiento para destilar un modelo menor, aunque la conversión a safetensors requeriría de-cuantizar.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K), sino métricas de fidelidad de cuantización (KL sobre texto reservado) y velocidad medidas en un Apple M5 Pro.

| Archivo | Tamano | KL | Todo en Metal | Prompt t/s | Generacion t/s |
|---|---|---|---|---|---|
| Este archivo | 11,51 GB | 0,02686 | si | 224 | 19,0 |
| AtomicChat AD-IQ2_S | 11,56 GB | 0,03497 | si | 236 | 18,3 |
| Unsloth UD-IQ3_XXS | 11,66 GB | 0,01939 | no | 68 | 10,9 |

Con 16K tokens ya en contexto, la ventaja de velocidad frente a Unsloth se reduce a 2,1x en prompt y 1,46x en generación. El autor indica que, de los 4 GGUF totalmente en Metal por debajo de 11,7 GB probados el 21 de noviembre de 2026, este archivo obtuvo el KL más bajo. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 24 GB o más para uso cómodo con contexto de 16K y otras aplicaciones abiertas. Con 16 GB es posible elevando el límite de memoria de la GPU (`sudo sysctl iogpu.wired_limit_mb=13000`, se restablece al reiniciar), con contexto corto y poca RAM libre.
- Pico medido: 13,9 GB de proceso con el contexto lleno hasta 16K tokens en el Mac del autor.
- GPU recomendadas: Apple Silicon (M5 Pro medido). En CUDA no es la opción preferente: el autor recomienda Unsloth UD-IQ3_XXS en CUDA o cuando Metal soporte NVFP4.
- GPU consumer: sí, en Mac con 24 GB o más de memoria unificada. No se documenta comportamiento en RTX 4090 ni otras GPU dedicadas.
- Despliegue: llama.cpp con soporte de Inkling 2 (upstream posterior al 20 de noviembre de 2026). Comando de ejemplo: `llama-cli -m Inkling-2-Mini-Metal.gguf -ngl 99 --jinja -c 32768 --temp 1.0 --reasoning-budget 16384`. El build estándar upstream `c661033` da puntuaciones idénticas.
- Latencia y throughput: 224 t/s en prompt y 19,0 t/s en generación en Apple M5 Pro; 68 t/s y 10,9 t/s respectivamente para el archivo de Unsloth en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Metal-GGUF (este) | ~26 B | 32.768 (uso documentado) | KL 0,02686 | Apache 2.0 | GGUF, llama.cpp |
| AtomicChat AD-IQ2_S | no disponible | no disponible | KL 0,03497 | no disponible | GGUF, todo en Metal |
| Unsloth UD-IQ3_XXS | no disponible | no disponible | KL 0,01939 | no disponible | GGUF, requiere fallback a CPU en Metal |
| Modelo base thinkingmachines/Inkling-2-Mini | ~26 B | no disponible | referencia | Apache 2.0 | safetensors |

La comparación se limita a cuantizaciones del mismo modelo base, ya que la información proporcionada no incluye alternativas de otros desarrolladores con parámetros y contexto comparables.

## Limitaciones y advertencias

- El archivo falló el test de calidad registrado de antemano por el propio autor frente a Unsloth UD-IQ3_XXS: está más lejos del modelo original (KL 0,02686 frente a 0,01939).
- La métrica KL mide fidelidad respecto a las salidas del modelo de referencia, no calidad en tareas; se requiere una evaluación propia por tarea.
- El autor advierte de bucles de razonamiento largos en el modelo base; el comando de ejemplo limita el pensamiento a 16K tokens.
- Los resultados se obtuvieron en una sola máquina (Apple M5 Pro), un único build de llama.cpp y una única importance matrix; la comparación cubre solo los archivos probados ese día.
- En CUDA, o cuando Metal soporte NVFP4, el autor recomienda explícitamente el archivo de Unsloth por su mayor fidelidad.
- No se documentan idiomas soportados ni sesgos conocidos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de datos sobre el entrenamiento del modelo base impide evaluar riesgos de sesgo o contaminación de datos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de modelos generativos de este tamaño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Me-Daniel/Inkling-2-Mini-Metal-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de referencia con importance matrix: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Código, pre-registro y logs: https://github.com/me-daniel/inkling-2-mini-quant
- Detalles técnicos completos: DETAILS.md (en el repositorio de Hugging Face)
- Informe completo del estudio: REPORT.md (en el repositorio de Hugging Face)
