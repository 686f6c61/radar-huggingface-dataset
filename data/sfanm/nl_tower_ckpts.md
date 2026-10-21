# sfanm/nl_tower_ckpts

## Resumen

`sfanm/nl_tower_ckpts` es un repositorio de checkpoints finales de los barridos de nivel 2 y nivel 3 del entorno de puzles `nl_tower` (reasoning-gym), publicado por el usuario sfanm en Hugging Face. No es un modelo de propósito general, sino el resultado de una campaña de experimentos de aprendizaje por refuerzo sobre un modelo pequeño de ~124 M de parámetros con arquitectura estilo Llama (12 capas, dimensión oculta 768, tokenizer GPT-2, pesos en fp32 de 494 MB por checkpoint).

Cada ejecución vive en su propia carpeta con el formato estándar de Hugging Face (`config.json`, `model.safetensors`, ficheros de tokenizer y `chat_template.jinja`) y se organiza en dos niveles: `level2/` con 6.000 pasos sobre prompts de dificultad media, y `level3/` con 15.000 pasos sobre prompts mixtos que incluyen el escalón difícil. El repositorio completo ocupa 149,8 GB, lo que refleja la cantidad de ejecuciones acumuladas (recetas, semillas y variantes), no el tamaño de un checkpoint individual.

Su interés es fundamentalmente metodológico: el espacio de recetas explora cómo incorporar trazas de demostración al entrenamiento por refuerzo (demostraciones mezcladas en la misma pérdida que las filas de RL, pérdida SFT separada con peso alfa, o un baseline por etapas con SFT previo y RL posterior), además de barridos de semilla y de currículum de dificultad. Es material para reproducir y comparar ablaciones, no un asistente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama: 12 capas, dimensión oculta 768 |
| Parametros totales | ~124 M (el autor parte de una base de ~100 M sometida a preentrenamiento continuado) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en fp32 y el autor no documenta cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` en fp32 (494 MB por checkpoint) |
| Tokenizer | GPT-2 |
| Plantilla de chat | `chat_template.jinja`; concatena el contenido de los mensajes sin marcadores de rol |
| Pasos de entrenamiento | 6.000 (nivel 2) y 15.000 (nivel 3) |
| Tamaño del repositorio | 149,8 GB |
| Pipeline declarado | `reinforcement-learning` |
| Etiquetas | `reasoning-gym`, `nl_tower`, `reinforcement-learning`, `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas y 768 dimensiones ocultas, con tokenizer GPT-2 y pesos almacenados en fp32. El punto de partida no es un modelo preentrenado genérico, sino una base de ~100 M de parámetros que el autor continúa preentrenando con N filas de demostración inyectadas cada 256 filas web (N = 8, 16, 32, 64, 128); estas variantes se identifican en el nombre de la ejecución como `aN`. Sobre esa base se aplica RL en el entorno `nl_tower`.

El interés está en la comparación de recetas para incorporar demostraciones. `hsep` combina RL con una pérdida SFT separada sobre las demos, ponderada con alfa (`alpha * NLL(demo) + RL loss`, con alfa = 0,1 o 0,5). Las variantes `uni_..._mM` mezclan M filas de demo en la misma pérdida que las filas de RL, con M = 4, 8, 16, 32 o 64 demos por lote de 512 filas; `m0` es RL puro sin demos. El baseline `staged_eE` hace SFT sobre las demos durante E épocas y después RL sin demos, con una variante de tasa de aprendizaje (`lr05`). Los sufijos `s2`, `s3` y `s4` identifican semillas con distinto particionado de datos, y `_L2` / `_L3` el nivel de dificultad y el número de pasos. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del corpus web usado en el preentrenamiento continuado ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto autoregresiva sobre el formato exacto de los puzles `nl_tower`: el prompt esperado es el texto crudo del puzle, sin envoltorio conversacional.
- Resolución de puzles con distinto número de participantes; el autor evalúa explícitamente conjuntos de 10-11 personas (`nltw_hb`) y de 12 personas (`nltw_hb12`).
- Razonamiento de un solo turno orientado a tarea, ajustado mediante RL con recompensa verificable en lugar de instrucciones generales.
- Variantes entrenadas con trazas de demostración en la pérdida, lo que permite estudiar el efecto de la imitación parcial sobre el comportamiento final.
- Navegación por currículum de dificultad: los checkpoints `_L2` se entrenan con prompts de dificultad media y los `_L3` con prompts mixtos que incluyen el escalón difícil.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), es decir, puede servirse con el stack estándar de transformers.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de ablaciones sobre demostraciones en RL: cargar las carpetas `m0`, `uni_..._mM` y `hsep_..._a01/a05` de un mismo nivel y comparar curvas y puntuaciones para aislar el efecto de mezclar demos en la pérdida frente a usar una pérdida SFT separada.
- Estudio de estabilidad entre semillas: las variantes `s2`, `s3` y `s4` permiten medir la varianza de pass@1 entre particiones de datos distintas, algo imprescindible antes de publicar conclusiones sobre una única semilla.
- Investigación sobre currículum de dificultad: comparar `level2` (6.000 pasos, dificultad media) con `level3` (15.000 pasos, con el escalón difícil) para determinar si el entrenamiento mixto mejora la generalización a los conjuntos más duros (`nltw_h`, `nltw_hb`, `nltw_hb12`).
- Baseline ligero en pipelines de reasoning-gym: un modelo de 124 M que cabe en CPU sirve como referencia rápida al integrar un entorno nuevo, antes de escalar a modelos mayores.
- Fine-tuning con recursos mínimos: al ser un checkpoint de 494 MB, se puede ajustar en una única GPU consumer o incluso en CPU para experimentos de destilación o de dominio reducido.
- Docencia y divulgación: ilustrar en un curso práctico el ciclo completo de RL con recompensa verificable sobre un modelo que se entrena y se evalúa en minutos.
- Pruebas de infraestructura de despliegue: por su tamaño, es adecuado para validar plantillas de chat, servidores de inferencia y contenedores sin consumir presupuesto de GPU.
- Verificación de un harness de evaluación: usar los checkpoints publicados para comprobar que el código propio de muestreo y cálculo de pass@k reproduce las puntuaciones del `manifest.csv`.

## Benchmarks y rendimiento

El autor publica en `manifest.csv` puntuaciones propias de pass@1 y pass@16 calculadas con 64 muestras por pregunta, pero los valores numéricos no están incluidos en la información disponible. Los conjuntos evaluados son los siguientes:

| Conjunto de evaluacion | Descripcion segun el autor | pass@1 | pass@16 |
|---|---|---|---|
| `nltw_m0` | Test de dificultad media, el más fácil | no disponible | no disponible |
| `nltw_m` | Test de dificultad media | no disponible | no disponible |
| `nltw_h` | Test difícil, objetivo del nivel 3 | no disponible | no disponible |
| `nltw_hb` | Puzles de 10-11 personas | no disponible | no disponible |
| `nltw_hb12` | Puzles de 12 personas, los más difíciles | no disponible | no disponible |

Una celda vacía en el manifiesto significa que esa ejecución no se evaluó en ese conjunto. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos en fp32: 494 MB por checkpoint según la model card; en fp16 la estimación aritmética a partir del número de parámetros ronda los 250 MB y en int8 unos 125 MB (cálculo propio, no documentado por el autor).
- Cabe en cualquier GPU consumer, incluidas tarjetas de 4 GB como una GTX 1650, y también en CPU para inferencia y ajuste fino de poca duración.
- No se requieren A100 ni H100; el repo completo (149,8 GB) sí exige bastante espacio en disco, por lo que conviene descargar solo un nivel con `hf download --include "level3/*"`.
- Despliegue: `transformers` de forma nativa con `subfolder=` por ejecución; conversión a GGUF para llama.cpp u Ollama; vLLM y TGI son viables por tamaño, aunque el autor no documenta configuraciones para ellos.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

La comparación no es directa: este repositorio es un artefacto de investigación especializado en un entorno de puzles, no un modelo de chat. Se incluyen referencias de tamaño comparable.

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| `sfanm/nl_tower_ckpts` | ~124 M | no disponible | no disponible | RL sobre puzles `nl_tower`; uso en investigación |
| GPT-2 | 124 M | 1.024 tokens | MIT | Generación de texto general, sin ajuste por instrucciones |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | Modelo pequeño de propósito general, ajustado por instrucciones |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Modelo pequeño multilingüe con soporte de herramientas |

Los datos de las tres alternativas provienen de sus fichas públicas y no forman parte de la información proporcionada en esta búsqueda; conviene verificarlos antes de citarlos. En cualquier caso, ninguno de ellos está entrenado específicamente para `nl_tower`, de modo que una comparación de rendimiento en esa tarea exigiría evaluarlos con el mismo harness.

## Limitaciones y advertencias

- Licencia no disponible: sin un término legal explícito no se puede asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Modelo de dominio muy estrecho: entrenado con RL sobre un único tipo de puzle y con prompts en texto crudo; no se comportará como un asistente general ni seguirá instrucciones arbitrarias.
- La plantilla de chat concatena los mensajes sin marcadores de rol, por lo que introducir un formato conversacional convencional degradará la salida.
- Con 124 M de parámetros, la propensión a generar texto incoherente o inventado fuera del formato del puzle es alta; no debe usarse en tareas que requieran fiabilidad factual.
- Idiomas soportados no documentados; no hay garantía de comportamiento en castellano ni en ningún otro idioma distinto del de los datos de entrenamiento.
- Longitud de contexto no documentada: no se puede planificar un caso de uso que dependa de ventanas largas.
- El repositorio es parcial: algunas carpetas figuran como `pending DeltaAI upload` o `training ...` en `manifest.csv`, de modo que no todas las ejecuciones descritas están realmente disponibles.
- Descargar el repo completo consume 149,8 GB; conviene filtrar por nivel para no llenar el disco.
- Los resultados publicados son autoevaluaciones del autor sobre sus propios conjuntos de test; no han pasado por una revisión independiente ni por benchmarks estándar.
- Puede existir sobreajuste al formato exacto de `nl_tower`: buenas puntuaciones en `nltw_h` no implican capacidad de razonamiento transferible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sfanm/nl_tower_ckpts
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código ni demos adicionales; la model card solo menciona las etiquetas `reasoning-gym` y `nl_tower` sin proporcionar URL.
