# Nirvana-AI/umi-toss-cosmos3-nano-aug-v1

## Resumen

umi-toss-cosmos3-nano-aug-v1 es un checkpoint de política de acción para robótica, desarrollado por Nirvana-AI, obtenido mediante ajuste fino supervisado completo (full SFT) del modelo Cosmos 3 Nano de NVIDIA sobre la tarea de lanzamiento (tossing) del dataset UMI. El modelo no es un LLM conversacional: es una política visomotora que, dada una observación visual y el estado del robot, predice acciones de control. Se distribuye como pesos en bf16 (Power-EMA de la iteración 750) con un tamaño de repositorio de 30,3 GB.

La relevancia de esta variante concreta es metodológica: reproduce la receta de política de acción de LIBERO de NVIDIA (mismos datos, código, semilla 42, orden de muestras, batch de 2.024, 2.000 iteraciones, 4 × A100 con FSDP-4) y le añade la aumentación de imagen en tiempo de entrenamiento de la receta DROID (`action_policy_droid_nano`): recorte aleatorio de factor 0,95 redimensionado a su tamaño original, seguido de ColorJitter (brillo 0,3, contraste 0,4, saturación 0,5, tono 0,08), con un único sorteo por clip de entrenamiento compartido por las 17 imágenes de la secuencia. Las acciones y la entrada de estado no se modifican.

El checkpoint es la rama experimental de un par de ablación: su control es `Nirvana-AI/umi-toss-cosmos3-nano-ctrl-v2`, entrenado simultáneamente sin aumentación. Según la model card, la regla de selección del benchmark (PLAN D16, mejor compuesto offline sobre fotogramas de validación sin aumentar) eligió estos pesos, con un compuesto de validación de 0,344 frente a 0,235 del control. Los resultados en bucle cerrado y la comparación completa se añadirán cuando finalice la evaluación; el autor indica explícitamente que no se ejecutó nada en un robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos 3 Nano (política de acción visomotora; familia Cosmos de NVIDIA), no disponible el detalle interno |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (secuencias de 17 fotogramas por clip de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | openmdw1.1-license (OpenMDW 1.1) |
| Formato de pesos | no disponible (repositorio de 30,3 GB; pesos en bf16 según la model card) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos 3 Nano de NVIDIA y se ajusta con SFT completo sobre la tarea de tossing del dataset UMI. La receta base es la de política de acción de LIBERO de NVIDIA: mismos datos, mismo código, semilla 42, mismo orden de muestras, batch de 2.024, 2.000 iteraciones, entrenamiento distribuido en 4 × A100 con FSDP-4. Sobre esa base se aplica la aumentación de imagen de la receta DROID (`action_policy_droid_nano`): recorte aleatorio con probabilidad de retención del 0,95 del área, redimensionado de vuelta al tamaño original, y ColorJitter con brillo 0,3, contraste 0,4, saturación 0,5 y tono 0,08. El sorteo de aumentación se realiza una vez por clip de entrenamiento y se comparte entre los 17 fotogramas de la secuencia, lo que preserva la coherencia temporal de la observación.

El checkpoint publicado corresponde a los pesos Power-EMA de la iteración 750 en bf16, seleccionados por la regla del benchmark (PLAN D16: mejor compuesto offline sobre fotogramas de validación sin aumentar). El compuesto de validación obtenido es 0,344, frente a 0,235 del control sin aumentación entrenado en paralelo. No se documentan en la información disponible detalles sobre el volumen total de tokens, la composición del dataset ni el uso de RLHF o DPO; al tratarse de una política de acción, el objetivo de entrenamiento es de imitación supervisada sobre trayectorias.

## Capacidades

- Predicción de acciones de control robótico a partir de observaciones visuales y entrada de estado, en el dominio de la tarea UMI tossing.
- Procesamiento de secuencias de 17 fotogramas por clip, con coherencia temporal en la aumentación aplicada durante el entrenamiento.
- Política de imitación entrenada con SFT completo sobre demostraciones, no con refuerzo.
- Robustez a variaciones fotométricas y de encuadre gracias a la aumentación DROID (recorte 0,95 y ColorJitter), aplicada solo en entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generación de texto.
- No se documentan capacidades multilingües, de visión general, audio ni modo de pensamiento (thinking).
- El modelo no ha sido validado en bucle cerrado en la información disponible: el autor indica que los resultados en bucle cerrado se añadirán cuando finalice la evaluación.

## Casos de uso

- Investigación en ablación de aumentación de datos: el par aug-v1 / ctrl-v2 permite aislar el efecto de la aumentación de imagen DROID sobre el rendimiento offline y, cuando se publiquen, en bucle cerrado, manteniendo constantes datos, semilla, orden de muestras y presupuesto de cómputo.
- Reproducción de recetas de NVIDIA: sirve como referencia para replicar la receta de política de acción de LIBERO con el añadido de la aumentación de DROID en un entorno de 4 × A100 con FSDP-4.
- Prototipado de políticas de lanzamiento en simulación: el checkpoint puede cargarse con la librería `cosmos` y evaluarse sobre el benchmark `umi-tossing-benchmark` (rama `cosmos-aug-ablation`) para comparar contra el control.
- Estudio de robustez visual en robótica: al haberse entrenado con recorte y ColorJitter, es un candidato para analizar la sensibilidad de la política a cambios de iluminación, color y encuadre en cámaras de robot.
- Base para ajuste fino posterior en tareas de manipulación con lanzamiento: al ser un SFT completo sobre Cosmos 3 Nano, puede servir de inicialización para dominios relacionados.
- Evaluación de reglas de selección de checkpoints: el uso de Power-EMA en la iteración 750 y de la regla PLAN D16 permite estudiar cómo distintas métricas offline correlacionan con el rendimiento real.
- Docencia y formación en robótica de imitación: ejemplo reproducible de pipeline completo (datos UMI, SFT, aumentación, selección de checkpoint) con código y control publicados.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los del compuesto de validación offline de la regla de selección PLAN D16, medido sobre fotogramas de validación sin aumentar:

| Métrica | umi-toss-cosmos3-nano-aug-v1 | Control (ctrl-v2) |
|---|---|---|
| Compuesto de validación offline (PLAN D16) | 0,344 | 0,235 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni resultados en bucle cerrado en la información disponible. El autor indica que los resultados en bucle cerrado y la comparación completa se añadirán cuando finalice la evaluación, y que no se ejecutó nada en un robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 30,3 GB y los pesos se publican en bf16; como referencia orientativa, cargar 30,3 GB de pesos en bf16 requiere del orden de 30 GB de VRAM solo para los pesos, más memoria para activaciones y buffers de inferencia, por lo que no cabe en GPUs de consumo de 24 GB sin cuantización, y no se documentan versiones cuantizadas.
- GPU recomendadas: el entrenamiento se realizó en 4 × A100 con FSDP-4. Para inferencia se recomienda una A100 (40 u 80 GB) o H100; no hay datos publicados sobre RTX 4090 u otras GPUs de consumo.
- ¿Cabe en GPU de consumo? No hay datos publicados. Por tamaño de pesos en bf16, no cabría en una RTX 4090 de 24 GB sin cuantización, y no se ofrecen pesos GGUF ni cuantizados.
- Opciones de despliegue: la librería indicada es `cosmos` (library_name: cosmos). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a una política de acción robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umi-toss-cosmos3-nano-aug-v1 (este) | no disponible | no disponible | Compuesto de validación offline 0,344 (PLAN D16) | OpenMDW 1.1 | HuggingFace, 0 descargas, 0 likes |
| Nirvana-AI/umi-toss-cosmos3-nano-ctrl-v2 (control) | no disponible | no disponible | Compuesto de validación offline 0,235 (PLAN D16) | No disponible en la información proporcionada | HuggingFace |
| Nirvana-AI/umi-toss-cosmos3-nano-full-sft (receta base) | no disponible | no disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |
| Cosmos 3 Nano (NVIDIA, modelo base) | no disponible | no disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada |

La comparación se limita al par de ablación publicado por el mismo autor y al modelo base; no se dispone de datos de otros modelos de política robótica comparables en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente para la tarea UMI tossing; no es un modelo de propósito general ni un LLM.
- Sin validación en robot real: el autor indica explícitamente que no se ejecutó nada en un robot real.
- Resultados en bucle cerrado pendientes: el rendimiento offline (0,344) no garantiza comportamiento correcto en ejecución; la diferencia frente al control (0,235) es una señal preliminar.
- Riesgo de sobreajuste a la distribución de validación: la selección del checkpoint se hizo con la regla PLAN D16 sobre fotogramas de validación sin aumentar, lo que puede introducir sesgo de selección.
- La aumentación se aplica solo en entrenamiento; el comportamiento en condiciones visuales muy distintas a las de UMI no está documentado.
- Licencia OpenMDW 1.1: es una licencia con términos específicos; deben revisarse en https://openmdw.ai/license/1-1/ antes de cualquier uso comercial. La model card etiqueta la licencia como `other` con nombre `openmdw1.1-license`.
- Sin datos sobre sesgos, alucinación o limitaciones idiomáticas: no aplican en el sentido habitual de un LLM, pero tampoco se documentan sesgos de la política (por ejemplo, dependencia de la cámara o del estado inicial).
- Repositorio de código privado: la rama `cosmos-aug-ablation` del repositorio `nrvna-ai/umi-tossing-benchmark` es privada, lo que limita la reproducibilidad independiente.
- Metadatos incompletos: sin parámetros totales, contexto, cuantizaciones ni idiomas publicados; la ficha debe tratarse como preliminar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nirvana-AI/umi-toss-cosmos3-nano-aug-v1
- Checkpoint base de la receta: https://huggingface.co/Nirvana-AI/umi-toss-cosmos3-nano-full-sft
- Control sin aumentación: https://huggingface.co/Nirvana-AI/umi-toss-cosmos3-nano-ctrl-v2
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio del benchmark (privado, rama `cosmos-aug-ablation`): https://github.com/nrvna-ai/umi-tossing-benchmark
- No se han encontrado en la información proporcionada enlaces a papers, blogs o demos adicionales.
