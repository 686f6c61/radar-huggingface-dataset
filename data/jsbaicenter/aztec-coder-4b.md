# jsbaicenter/Aztec-Coder-4B

## Resumen

Aztec-Coder-4B es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), desarrollado por el James Silberrad Brown Center for Artificial Intelligence (JSBCAI) de la Universidad Estatal de San Diego. Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, especializado en codificación agéntica: el modelo es capaz de investigar errores, editar archivos, ejecutar comandos y verificar sus propias correcciones dentro de repositorios de software reales. Su propuesta de valor es clara: hasta ahora, la codificación agéntica a este nivel requería modelos de 27B parámetros o más, mientras que este cabe en una GPU de consumo con aproximadamente 8 GB de VRAM en BF16 y unos 5 GB en su variante cuantizada NVFP4.

El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado con los descriptores agentic-coding, reasoning, tool-use, on-device y laptop-scale. Según la model card, fue entrenado en tres etapas: demostraciones semilla generadas por GLM-5.3 (un modelo abierto de 744B), aprendizaje por refuerzo con GRPO sobre 237 problemas reales de ingeniería de software, y comprobaciones de generalización en cada frontera de etapa.

Es relevante ahora porque demuestra que el ajuste fino selectivo con RL puede dotar a un modelo pequeño de capacidades agénticas verificables: en su conjunto de generalización de 121 errores reales nunca vistos, el modelo base resolvía el 10,1 % y Aztec-Coder-4B alcanza el 68,1 % a nivel de instancia (60,8 % por intento) sobre las 94 instancias plenamente retenidas. No obstante, el autor lo marca explícitamente como una versión de vista previa de investigación (preview release), no recomendada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B; tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); NVFP4 (variante cuantizada publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, un transformer decoder-only identificado en los metadatos con la etiqueta `qwen3_5_text`. La model card no detalla la composición interna (número de capas, atención, dimensiones ocultas ni longitud de contexto nativa), por lo que esos datos no están disponibles. El repositorio ocupa 8,7 GB en safetensors.

El entrenamiento se organizó en tres etapas. La primera consistió en demostraciones semilla: GLM-5.3, un modelo abierto de frontera de 744B, generó aproximadamente 1.875 trayectorias de codificación, todas verificadas ejecutando las pruebas reales antes de usarlas; estas demostraciones enseñaron al modelo el formato de la codificación agéntica (uso de herramientas, cuándo ejecutar tests, qué aspecto tiene una solución válida). La segunda etapa fue aprendizaje por refuerzo sobre 237 problemas de ingeniería de software seleccionados por ser resolubles de forma intermitente; se aplicaron 145 lotes de GRPO on-policy, reforzando las soluciones que hacían pasar las pruebas ocultas reales. La tercera etapa consistió en comprobaciones de generalización en cada frontera de etapa, con un protocolo de descontaminación publicado junto al modelo. El dataset de post-entrenamiento citado es nvidia/Nemotron-Post-Training-Dataset-v2.

## Capacidades

- Codificación agéntica: explora un repositorio, lee el código que falla, escribe un parche y ejecuta las pruebas para verificarse a sí mismo dentro de un contenedor aislado.
- Razonamiento entre llamadas a herramientas (thinking between tool calls), similar a modelos de razonamiento de mayor tamaño.
- Uso de herramientas y ejecución de comandos en terminal (tool-use, terminal operations).
- Corrección de errores en repositorios reales con verificación mediante suites de pruebas ocultas.
- Seguimiento de instrucciones: puntuación IFEval de 87,21, superior a la del modelo base (84,66).
- Capacidades generales de conocimiento: MMLU-Pro del 70,0 %.
- Alineación de seguridad conservada tras el ajuste: tasa de rechazo del 98,1 % en HarmBench y cumplimiento del 97,1 % en XSTest (peticiones benignas que suenan peligrosas).
- Ejecución en hardware de consumo (aproximadamente 8 GB de VRAM en BF16, unos 5 GB en NVFP4).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Corrección automática de errores en CI/CD: el modelo puede recibir un fallo de pruebas en un pipeline, explorar el repositorio, aplicar un parche y ejecutar la suite de pruebas para confirmar la corrección antes de proponer el cambio, gracias a su bucle de verificación integrado.
- Asistente de desarrollo en portátil: con unos 5 GB en NVFP4, puede desplegarse en una GPU de consumo y ofrecer edición de archivos y ejecución de comandos sin conexión a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Triaje de incidencias en repositorios: dado un informe de error, el modelo localiza el código relevante, reproduce el fallo mediante comandos y propone una corrección verificada, reduciendo el trabajo manual de reproducción.
- Migraciones y refactorizaciones acotadas: puede editar múltiples archivos y comprobar el resultado con las pruebas existentes, lo que encaja en tareas de actualización de dependencias o cambios de API internos.
- Agente de mantenimiento en proyectos de código abierto: ejecutado en contenedores, puede atender tareas repetitivas de corrección de bugs pequeños con validación automática por tests.
- Evaluación e investigación en modelos pequeños: sirve como referencia para estudiar cómo el RL con verificación por pruebas transfiere capacidad agéntica a modelos de 4B, con protocolo de descontaminación publicado.
- Generación de parches con razonamiento explícito: su modo de razonamiento entre llamadas a herramientas permite auditar la traza de decisión antes de aplicar un cambio en entornos sensibles.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-4B (base) | Aztec-Coder-4B | Aztec-Coder-4B-NVFP4 |
|---|---|---|---|
| Generalización (121 errores nunca vistos, verificado con tests) | 10,1 % | 68,1 % (instancia) / 60,8 % (por intento) en las 94 plenamente retenidas; 81,5 % / 73,6 % en las 27 solapadas | 38,0 % (12/32 en subconjunto de 32 instancias) |
| Live-60 (60 tareas reales resueltas de extremo a extremo en contenedores) | 15,0 % | 21,7 % | 15,0 % |
| IFEval (seguimiento de instrucciones) | 84,66 | 87,21 | 86,37 |
| MMLU-Pro | 64,0 % | 70,0 % | 66,85 % |
| Terminal-Bench 1.0 (core, 80 tareas) | 33,8 % | 33,8 % | 18,8 % |
| Terminal-Bench 2.1 (89 tareas, mismo protocolo) | 14,6 % | 11,2 % | no evaluado |
| HarmBench (tasa de rechazo de conductas dañinas, 159 conductas) | 99,4 % | 98,1 % | 96,9 % |
| XSTest (cumplimiento de peticiones benignas pero alarmantes, 450 prompts) | 54,0 % | 97,1 % | 99,8 % |

Nota del autor: una auditoría posterior a la publicación (2026-09-29) corrigió una cifra anterior del 82,9 % en el conjunto completo de 121 instancias, ya que 27 de ellas habían entrado en el conjunto de entrenamiento antes de la medición.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB en BF16 y unos 5 GB en la variante cuantizada NVFP4, según la model card.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que cabe en una GPU de consumo (laptop-scale, on-device).
- GPU de consumo: sí, el modelo está diseñado explícitamente para ejecutarse en hardware de consumo con el presupuesto de VRAM indicado.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles (tag `endpoints_compatible`). No se detallan soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aztec-Coder-4B | 4,2B | no disponible | 68,1 % en generalización de bugs; IFEval 87,21; MMLU-Pro 70,0 % | Apache 2.0 | Hugging Face (preview) |
| Qwen3.5-4B (base) | 4,2B | no disponible | 10,1 % en generalización; IFEval 84,66; MMLU-Pro 64,0 % | no disponible en la informacion | Hugging Face |
| GLM-5.3 (profesor de trayectorias) | 744B | no disponible | no disponible | no disponible en la informacion | no disponible |
| Aztec-Coder-4B-NVFP4 | 4,2B | no disponible | 38,0 % en generalización (subconjunto de 32); IFEval 86,37 | Apache 2.0 | Hugging Face |

La model card menciona que la codificación agéntica a este nivel ha requerido modelos de 27B parámetros o más, pero no proporciona nombres ni cifras de esos modelos comparables, por lo que la comparación cuantitativa con alternativas de 27B no está disponible.

## Limitaciones y advertencias

- Versión de vista previa de investigación: el autor indica explícitamente que no se recomienda para uso en producción y que las evaluaciones completas están en curso.
- Problema conocido grave: el modelo utiliza `git checkout`, `git restore` y `git stash` para resolver tareas, lo que puede provocar la pérdida de trabajo no confirmado en el repositorio. Se recomienda hacer commit antes de ejecutarlo o esperar a la siguiente versión.
- La cuantización NVFP4 reduce aproximadamente a la mitad la capacidad de generalización (38,0 % frente a 68,1 % en el subconjunto comparable).
- Rendimiento inferior al base en Terminal-Bench 2.1 (11,2 % frente a 14,6 %).
- Ligera caída en la tasa de rechazo de conductas dañinas en HarmBench (98,1 % frente a 99,4 % del base), aunque las categorías de daño grave se mantienen limpias.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia Apache 2.0, que permite uso comercial, pero la advertencia de vista previa y el problema de pérdida de trabajo desaconsejan su uso en producción sin salvaguardas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsbaicenter/Aztec-Coder-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Centro de investigación (JSBCAI, San Diego State University): no disponible como enlace en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponibles en la informacion proporcionada
