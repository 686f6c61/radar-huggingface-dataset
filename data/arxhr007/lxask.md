# arxhr007/lxask

## Resumen

lxask es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B orientado a una tarea muy concreta: convertir peticiones en lenguaje natural a comandos de Linux. Lo desarrolla el autor independiente arxhr007 y se distribuye bajo licencia MIT, con pesos en formato GGUF cuantizado Q4_K_M y adaptadores LoRA en formato PEFT. El modelo forma parte del proyecto lxask, una CLI escrita en Rust sobre llama.cpp que envuelve al modelo con recuperación documental desde man pages y tldr, verificación de respuestas y la regla de no ejecutar nunca un comando por su cuenta.

La propuesta es deliberadamente frugal: 1.543.714.304 parámetros (1,5B) que caben en CPU con aproximadamente 1,3 GB de memoria, sin GPU, sin nube y sin clave de API. Sobre el modelo base se entrenaron dos adaptadores LoRA de rango 16 que no se apilan sino que se enrutan por petición: el adaptador `restrict` gestiona preguntas con programas descartados ("sin lsof") y contextos de proxy, mientras que `precision` cubre el resto, centrado en disciplina de detalles (nombres de fichero exactos, comillas, flags correctos).

Es relevante ahora porque demuestra un patrón de despliegue local para asistentes de terminal con un modelo pequeño, evaluación con ejecución real en sandbox (GRPO) y una mejora medible sobre el modelo base (62% frente a 54% en NL2SH-ALFA). No es un modelo de propósito general: es un componente especializado dentro de un pipeline mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-1.5B) con adaptadores LoRA de rango 16 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~986 MB); adaptadores LoRA en GGUF y PEFT safetensors |
| Idiomas soportados | no disponible (la model card solo documenta peticiones en inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo y adaptadores) y safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B, un transformer decoder-only denso, y se ajusta en tres fases según la model card. Primero, SFT sobre aproximadamente 39.000 ejemplos compuestos por tldr-pages, NL2Bash y peticiones generadas y verificadas por un validador. Después, GRPO (optimización de política con recompensa) usando como señal la ejecución real de los comandos en un sandbox. Por último, se entrenan dos adaptadores LoRA de rango 16 sobre tareas contrastivas con negativos difíciles: ejemplos que parecen correctos pero realizan la tarea equivocada. Cada adaptador se validó contra fixtures de referencia y se comprobó que fallaba en variantes no-op o negativas antes de entrenar.

La innovación destacable no está en la arquitectura, sino en el diseño de despliegue y evaluación: adaptadores enrutados en lugar de apilados, recompensa basada en ejecución real de comandos y cuantización Q4_K_M para inferencia en CPU. El repositorio ocupa 1,2 GB e incluye el modelo cuantizado y ambos adaptadores en dos formatos.

## Capacidades

- Generación de comandos de Linux a partir de peticiones en inglés (text2shell).
- Disciplina de detalles: nombres de fichero exactos, comillas y selección correcta de flags, gracias al adaptador `precision`.
- Respeto de restricciones explícitas, como evitar un programa concreto ("without lsof"), y manejo de contextos de proxy, gracias al adaptador `restrict`.
- Enrutado por petición entre dos adaptadores LoRA, sin apilamiento.
- Conversación multi-turno (etiqueta `conversational` en Hugging Face).
- Integración con llama.cpp, incluida la aplicación de adaptadores LoRA directamente sobre el modelo cuantizado.
- Carga de los adaptadores PEFT sobre Qwen2.5-Coder-1.5B en transformers.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- No se documentan capacidades multilingües.

## Casos de uso

- Asistente de terminal local: el modelo convierte una petición como "count the words in report.txt" en `wc --words report.txt`. Al caber en CPU con ~1,3 GB, se puede integrar en una CLI sin dependencias de red ni claves de API.
- Entornos aislados y sin conectividad: en máquinas air-gapped o servidores con políticas estrictas, el modelo se ejecuta íntegramente en local con llama.cpp y los ficheros GGUF.
- Aprendizaje y consulta de comandos: el pipeline de lxask recupera documentación de man pages y tldr y verifica la respuesta, lo que permite usar el modelo como ayuda explicativa para usuarios que están aprendiendo la línea de comandos.
- Generación de comandos con restricciones: peticiones del tipo "lista los procesos abiertos sin usar lsof" se enrutan al adaptador `restrict`, útil en entornos donde ciertas herramientas están prohibidas o no instaladas.
- Integración en scripts y pipelines: la CLI en Rust sobre llama.cpp permite invocar el modelo desde automatizaciones, generando el comando y dejando la ejecución al usuario o a un paso posterior con revisión.
- Evaluación de modelos pequeños para text2shell: el proyecto y sus métricas (NL2SH-ALFA, conjuntos held-out con ejecución en sandbox) sirven como referencia para comparar estrategias de SFT y GRPO en tareas de generación de comandos.

## Benchmarks y rendimiento

| Benchmark | lxask | Qwen2.5-Coder-1.5B (sin ajustar) |
|---|---|---|
| NL2SH-ALFA (300 tareas, harness Docker, recompensa 1.0) | 62% | 54% (con su mejor prompting) |
| Éxito estricto de ejecución en tareas de fichero/texto generadas (160 tareas) | 73,8% con adaptador `precision` | 35,0% |
| Programa correcto en preguntas cotidianas | 96–99% | no disponible |
| Restricciones respetadas en programas nunca descartados en entrenamiento | 76% | no disponible |

La comparación en NL2SH-ALFA es estadísticamente significativa según la model card (McNemar, p = 0,003). Las cifras de éxito estricto corresponden a comandos ejecutados en sandbox sobre conjuntos held-out.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo Q4_K_M (~986 MB) se ejecuta en CPU con aproximadamente 1,3 GB de memoria.
- GPU recomendadas: no aplica para el caso de uso previsto; puede ejecutarse en cualquier GPU compatible con llama.cpp si se desea.
- Cabe en GPU de consumo: sí, con amplio margen, aunque el diseño apunta a CPU.
- Opciones de despliegue: llama.cpp (con `--lora` para los adaptadores), la CLI lxask (Rust + llama.cpp) y transformers con los adaptadores PEFT sobre Qwen2.5-Coder-1.5B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lxask | 1,5B (base Qwen2.5-Coder-1.5B) | no disponible | text2shell Linux con adaptadores enrutados | MIT | Hugging Face, GGUF y PEFT |
| Qwen2.5-Coder-1.5B | 1,5B | no disponible en la información proporcionada | modelo base de código general | no disponible en la información proporcionada | Hugging Face |
| Alternativas específicas de text2shell de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más fiable es contra su propio modelo base: en NL2SH-ALFA, lxask obtiene 62% frente al 54% de Qwen2.5-Coder-1.5B con su mejor prompting, y en éxito estricto de ejecución pasa del 35,0% al 73,8% con el adaptador `precision`. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Un modelo de 1,5B comete errores de detalle: campo incorrecto en `awk`, signo equivocado en `uniq` y, ocasionalmente, marcadores de posición de documentación que quedan en una ruta.
- Riesgo de alucinación en flags y sintaxis: la model card recomienda leer el comando antes de ejecutarlo y el proyecto lxask verifica cada respuesta contra la documentación, marcando lo que no puede verificar.
- El modelo no ejecuta comandos por sí mismo; esa restricción es una decisión de diseño del pipeline, no una garantía del modelo aislado.
- El entrenamiento y los ejemplos documentados están en inglés; no se documentan idiomas soportados ni rendimiento en castellano.
- La longitud de contexto no está disponible, lo que limita la planificación de conversaciones largas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad más allá de las pruebas en sandbox.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B tiene su propia licencia, que conviene revisar antes de un despliegue en producción.
- Las métricas publicadas provienen del propio autor; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arxhr007/lxask
- Repositorio del proyecto lxask: https://github.com/arxhr007/lxask
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Dataset NL2SH-ALFA: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Script de instalación: https://github.com/arxhr007/lxask/releases/latest/download/install.sh
