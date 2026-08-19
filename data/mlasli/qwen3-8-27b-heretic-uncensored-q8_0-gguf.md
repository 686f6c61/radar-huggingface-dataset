# mlasli/Qwen3.8-27B-Heretic-Uncensored-Q8_0-GGUF

## Resumen

El modelo `mlasli/Qwen3.8-27B-Heretic-Uncensored-Q8_0-GGUF` es una variante del modelo base **Qwen/Qwen3.8-27B** (26.9 mil millones de parámetros) a la que se le ha eliminado la dirección de rechazo mediante el método de **abliteración de una sola dirección** llamado [Heretic](https://github.com/mlabonne/heretic-llm). El resultado es un modelo que mantiene prácticamente intactas las capacidades lingüísticas y de razonamiento del original, pero que responde de forma directa a peticiones que el modelo alineado normalmente rechazaría. Está publicado en formato GGUF cuantizado a Q8_0, listo para su uso con llama.cpp y herramientas compatibles.

Este modelo es relevante para desarrolladores e investigadores que trabajan en entornos de *roleplay*, generación de texto creativo o experimentación con alineación y seguridad, ya que permite estudiar el comportamiento de un modelo sin las restricciones de seguridad habituales. La licencia Apache-2.0 facilita su uso comercial, aunque con las advertencias legales y éticas que se detallan más adelante.

La cuantización Q8_0 (28.6 GB) lo hace desplegable en GPUs de alta gama con al menos 32 GB de VRAM, y su compatibilidad con llama.cpp permite ejecutarlo también en CPU con rendimiento aceptable para tareas de baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, arch `qwen35` en llama.cpp) |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es una **abliteración** del checkpoint original `Qwen/Qwen3.8-27B`. La abliteración consiste en identificar la dirección de rechazo en el espacio de activaciones del modelo y eliminarla mediante una proyección lineal. En este caso se utiliza **Heretic**, que realiza una abliteración de una sola dirección con una búsqueda de hiperparámetros basada en Optuna, optimizando el equilibrio entre cumplimiento de peticiones y divergencia de la primera token respecto al modelo base.

Según la model card, la abliteración se aplica únicamente al "backbone lingüístico", preservando el resto de capacidades. No se proporcionan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), por lo que no se pueden aportar datos adicionales sobre esa fase.

La evaluación independiente reportada indica una **tasa de cumplimiento del 94.0%** en el conjunto *harmful-behaviors* de Zou et al., una **tasa de rechazo del 6.0%** según el detector de 29 subcadenas, y una **divergencia KL de primera token de 0.0467** respecto al modelo base, lo que sugiere una pérdida mínima de comportamiento general.

## Capacidades

- Generación de texto en inglés con fluidez y coherencia, manteniendo las capacidades del modelo base Qwen3.8-27B.
- Respuesta directa a peticiones que el modelo alineado rechazaría, incluyendo contenido potencialmente dañino, ilegal o no ético (sin garantía de exactitud).
- Conversación multi-turno y *roleplay* sin restricciones de seguridad.
- Compatible con el pipeline de `text-generation` de Transformers y con llama.cpp (arquitectura `qwen35`).
- No se ha documentado soporte explícito para *tool calling*, *function calling*, agentes, visión o audio en la información disponible.
- Capacidad multilingüe limitada al inglés (según la etiqueta `language: en`).

## Casos de uso

- **Roleplay y narrativa interactiva**: el modelo puede generar respuestas detalladas y sin filtros en escenarios de ficción, incluyendo tramas oscuras o violentas, sin interrumpir la inmersión con rechazos.
- **Investigación en seguridad de IA**: permite estudiar el comportamiento de un modelo sin alineación de seguridad, comparando tasas de cumplimiento y patrones de respuesta frente a modelos alineados.
- **Generación de contenido creativo sin restricciones**: escritura de guiones, diálogos o historias que aborden temas tabú o controvertidos, donde un modelo alineado bloquearía la generación.
- **Pruebas de robustez de sistemas de moderación**: sirve como generador de entradas adversarias para evaluar filtros de contenido en aplicaciones de producción.
- **Experimentos de alineación y abliteración**: útil para reproducir o extender el trabajo de Heretic, comparando el efecto de la abliteración en diferentes arquitecturas.
- **Despliegue local en entornos aislados**: al ser un GGUF cuantizado, puede ejecutarse en infraestructura propia sin depender de APIs externas, facilitando pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada en la model card es la siguiente:

| Metrica | Valor |
|---|---|
| Cumplimiento (harmful-behaviors, Zou et al., 50 prompts) | 94.0% |
| Tasa de rechazo (detector de 29 subcadenas) | 6.0% |
| Divergencia KL de primera token vs. base | 0.0467 |

Se indica que un detector combinado más estricto reportó un 18.0% de rechazo, pero la revisión manual concluyó que la mayoría eran falsos positivos (el modelo usa palabras como "illegal" o "harmful" dentro de respuestas conformes).

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q8_0 ocupa 28.6 GB. Para inferencia con contexto moderado se recomienda al menos 32 GB de VRAM, siendo preferible 40 GB o más para ventanas de contexto amplias.
- **GPUs recomendadas**: NVIDIA A100 40GB/80GB, RTX A6000 48GB, o configuraciones multi-GPU (por ejemplo, dos RTX 4090 24GB con *tensor parallelism*). No cabe en una RTX 4090 estándar de 24 GB.
- **Inferencia en CPU**: viable con llama.cpp, aunque con latencias altas (del orden de segundos por token en hardware de gama media).
- **Opciones de despliegue**: llama.cpp, Ollama (si se convierte a formato compatible), Transformers con carga de GGUF (mediante `llama-cpp-python` o similar), o servidores como llama.cpp server.
- **Latencia y throughput**: no se proporcionan datos medidos. Como referencia orientativa, en una A100 80GB con Q8_0 se podrían esperar decenas de tokens por segundo, pero no se dispone de cifras confirmadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos abliterados o con el propio Qwen3.8-27B alineado. La siguiente tabla resume las diferencias cualitativas con el modelo base y con una alternativa típica de abliteración:

| Modelo | Parametros | Cuantizacion | Cumplimiento (Zou) | Rechazo (Zou) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base alineado) | 26.9B | no disponible | no disponible | alto (esperado) | Apache-2.0 |
| Qwen3.8-27B Heretic-Uncensored (este) | 26.9B | Q8_0 | 94.0% | 6.0% | Apache-2.0 |
| Otros modelos abliterados (p. ej. Dolphin, etc.) | variable | variable | no disponible | no disponible | variable |

No se han encontrado comparativas directas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Ausencia de alineación de seguridad**: el modelo responde a peticiones dañinas, ilegales o no éticas. Su uso en producción conlleva riesgos legales y reputacionales.
- **Sesgos y alucinaciones**: al ser una abliteración, mantiene los sesgos del modelo base y puede generar información falsa o inventada, especialmente en temas sensibles.
- **Idioma limitado**: solo se garantiza el inglés; el rendimiento en otros idiomas no está documentado.
- **Longitud de contexto no especificada**: se desconoce la ventana de contexto máxima soportada, lo que dificulta planificar aplicaciones con dependencias de contexto largo.
- **Falta de benchmarks estándar**: no hay resultados de MMLU, HumanEval u otros, por lo que no se puede evaluar su rendimiento general frente a alternativas.
- **Restricciones de uso comercial**: aunque la licencia es Apache-2.0, el uso de un modelo sin censura puede violar normativas locales (protección de menores, incitación al odio, etc.). El autor advierte explícitamente: "Use responsibly and in accordance with your local laws".
- **Riesgo de sobreajuste a la abliteración**: la eliminación de la dirección de rechazo puede degradar ligeramente la coherencia en ciertos dominios, aunque la KL de 0.0467 sugiere un impacto mínimo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q8_0-GGUF
- Repositorio de Heretic (método de abliteración): https://github.com/mlabonne/heretic-llm
- Repositorio de llama.cpp (para ejecución del GGUF): https://github.com/ggml-org/llama.cpp
