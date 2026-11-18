# aaronthomas123/lxask

## Resumen

lxask es un ajuste fino de Qwen2.5-Coder-1.5B orientado a una tarea muy concreta: convertir peticiones en lenguaje natural (en inglés) en comandos de Linux. Lo publica el usuario aaronthomas123 y forma parte del proyecto lxask, una CLI escrita en Rust que envuelve el modelo con recuperación sobre el corpus real de `man` y `tldr`, verificación de respuestas y una regla estricta de no ejecutar nunca un comando de forma automática.

El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (1.5B) con arquitectura Qwen2.5, sobre el que se aplica SFT seguido de GRPO con ejecución real en sandbox como recompensa. Encima se entrenan dos adaptadores LoRA de rango 16 que se enrutan por petición en lugar de apilarse: uno de restricción (`restrict`) para contextos de programas excluidos o proxy, y otro de precisión (`precision`) para el resto.

Su relevancia es práctica: demuestra que un modelo de 1.5B cuantizado a Q4_K_M (~986 MB) puede correr en CPU con ~1.3 GB de memoria y mejorar de forma medible sobre el base sin ajustar en una tarea de generación de comandos (35,0% → 73,8% de éxito estricto en tareas de ficheros/texto con el adaptador de precisión). La licencia es MIT y los pesos se distribuyen en GGUF y safetensors PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-1.5B) con adaptadores LoRA rango 16 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~986 MB); adaptadores tambien en PEFT safetensors |
| Idiomas soportados | no disponibles (las peticiones de ejemplo y el entrenamiento descrito son en ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo y adaptadores para llama.cpp), safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B, un transformer decoder-only denso de 1.5B parámetros. Sobre él se aplica un pipeline en tres fases: primero SFT sobre ~39.000 ejemplos compuestos por tldr-pages, NL2Bash y peticiones generadas y validadas automáticamente; después GRPO usando como recompensa la ejecución real de los comandos en un sandbox; y finalmente el entrenamiento de dos adaptadores LoRA de rango 16 sobre tareas contrastivas con negativos duros, es decir, comandos que parecen correctos pero realizan la función equivocada. Cada adaptador se validó contra fixtures de referencia y contra variantes no-op/negativas antes de entrenar.

La innovación destacable no está en la arquitectura sino en el enrutado de adaptadores: `restrict` se activa para peticiones con programas excluidos ("without lsof") y contextos proxy, mientras que `precision` cubre el resto y se centra en disciplina de casi-acierto (nombres de fichero exactos, quoting, flag correcta, respetar ficheros que deben conservarse). Los adaptadores no se apilan; se seleccionan por petición. Ambos GGUF se aplican directamente al modelo cuantizado en llama.cpp mediante `--lora`.

## Capacidades

- Generación de comandos de Linux a partir de peticiones en inglés ("count the words in report.txt" → `wc --words report.txt`).
- Comprensión de restricciones explícitas sobre programas excluidos y contextos proxy (adaptador `restrict`).
- Disciplina de precisión: nombres de fichero exactos, quoting correcto, elección de flag y respeto de ficheros que deben conservarse (adaptador `precision`).
- Enrutado interno entre dos adaptadores LoRA según el tipo de petición.
- Inferencia en CPU sin GPU, sin nube y sin clave de API.
- Integración con recuperación documental externa (man pages/tldr) a través de la CLI lxask, no dentro del modelo.
- No dispone de tool calling nativo, capacidades de agente multi-paso, visión, audio ni modo thinking según la información disponible.
- Capacidades multilingües: no disponibles; el material descrito es en inglés.

## Casos de uso

- Asistente de terminal offline: la CLI lxask carga los GGUF y traduce peticiones cotidianas a comandos, útil en máquinas sin GPU o en entornos sin conectividad, gracias a su huella de ~1.3 GB en CPU.
- Documentación interactiva para principiantes: el modelo sugiere el comando y la CLI lo contrasta contra man/tldr y marca lo que no puede verificar, de modo que el usuario aprende la sintaxis antes de ejecutarla.
- Automatización de tareas de ficheros y texto: conteo de palabras, filtrado con `awk`, deduplicación con `uniq`, etc., donde el adaptador de precisión eleva el éxito estricto del 35,0% al 73,8% en el conjunto de 160 tareas.
- Generación de comandos con restricciones de seguridad: peticiones del tipo "sin usar lsof" o en contextos proxy se enrutan al adaptador `restrict`, que mantiene la restricción en el 76% de los programas nunca excluidos durante el entrenamiento.
- Integración en pipelines de revisión: al no ejecutar comandos por sí mismo, encaja como paso de sugerencia en scripts o herramientas que requieran aprobación humana antes de la ejecución.
- Evaluación e investigación de text2shell: sirve como referencia reproducible sobre NL2SH-ALFA (300 tareas, harness Docker) para comparar estrategias de ajuste en modelos pequeños.
- Despliegue embebido: los ~986 MB del Q4_K_M permiten incluirlo en imágenes de contenedor o dispositivos con poca memoria para asistentes de shell locales.

## Benchmarks y rendimiento

| Benchmark | lxask | Qwen2.5-Coder-1.5B sin ajustar |
|---|---|---|
| Éxito estricto en tareas de ficheros/texto (160 tareas, con adaptador `precision`) | 73,8% (desde 35,0% sin adaptador) | 35,0% |
| NL2SH-ALFA (300 tareas, harness Docker, recompensa 1.0) | 62% | 54% (con su mejor prompting; McNemar p = 0,003) |
| Programa correcto en preguntas cotidianas | 96–99% | no disponible |
| Restricciones mantenidas en programas nunca excluidos en entrenamiento | 76% | no disponible |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; ~1.3 GB de memoria en CPU con el Q4_K_M.
- GPU recomendadas: no disponibles; el diseño es explícitamente CPU-first.
- Cabe en GPU consumer: sí, cualquier GPU con al menos ~1 GB libre puede alojar el Q4_K_M, aunque no es el objetivo del proyecto.
- Opciones de despliegue: llama.cpp (con `--lora` para los adaptadores GGUF), CLI lxask (Rust + llama.cpp), transformers cargando los adaptadores PEFT sobre Qwen/Qwen2.5-Coder-1.5B.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lxask | 1.5B | no disponible | text2shell Linux con adaptadores enrutados | MIT | GGUF + PEFT en Hugging Face |
| Qwen2.5-Coder-1.5B | 1.5B | no disponible | generación de código general | no disponible en esta ficha | Hugging Face |
| NL2Bash (modelos de referencia) | no disponible | no disponible | traducción de lenguaje natural a bash | no disponible | dataset público |

No se dispone de datos suficientes para comparar rendimiento con otras alternativas de text2shell en la información proporcionada.

## Limitaciones y advertencias

- Un modelo de 1.5B comete errores de detalle: campo de `awk` incorrecto, signo de `uniq` equivocado o placeholders de documentación dejados en una ruta.
- Riesgo de alucinación en nombres de fichero, flags y rutas; la CLI compañera existe precisamente para contrastar cada respuesta contra la documentación y marcar lo no verificable.
- El modelo no ejecuta comandos por sí mismo; cualquier uso en producción debe mantener la revisión humana antes de la ejecución.
- Las restricciones solo se mantienen en el 76% de los programas nunca excluidos durante el entrenamiento, por lo que no es una garantía de seguridad.
- Idiomas soportados no disponibles; el entrenamiento descrito y los ejemplos están en inglés.
- Longitud de contexto no disponible; no se recomienda para conversaciones multi-turno largas sin verificación previa.
- Licencia MIT permite uso comercial, pero no se documentan sesgos ni evaluaciones de robustez fuera de los conjuntos descritos.
- El repositorio tiene 100 descargas y 0 likes, con fecha de creación en 2026; la madurez y el mantenimiento del proyecto no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaronthomas123/lxask
- Repositorio de la CLI lxask: https://github.com/arxhr007/lxask
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Dataset NL2SH-ALFA: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Instalador de lxask: https://github.com/arxhr007/lxask/releases/latest/download/install.sh
