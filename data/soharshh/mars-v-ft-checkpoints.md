# SoHarshh/mars-v-ft-checkpoints

## Resumen

El repositorio `SoHarshh/mars-v-ft-checkpoints` no contiene un modelo de lenguaje independiente, sino un conjunto de adaptadores LoRA de fine-tuning guardados durante el entrenamiento de un sistema de autoformalización denominado MARS V. El objetivo de la tarea es traducir una historia en lenguaje natural a una gramática formal rígida, cuya corrección se evalúa de forma mecánica. El autor, SoHarshh, publica estos checkpoints con fines de investigación en interpretabilidad y análisis de trayectorias de entrenamiento, no como un producto listo para uso directo.

Los adaptadores se entrenan sobre tres modelos base distintos: Llama-3.1-8B-Instruct, Qwen3-32B y Ministral-3-14B-Instruct. Se exploran dos recetas de datos: una que solo utiliza texto de gramática (grammar-only) y otra que emplea pares historia-gramática (task-pairs). Los resultados reportados muestran un comportamiento opuesto entre ambas: la receta grammar-only perfecciona la sintaxis pero destruye la precisión de la tarea (en Qwen3-32B pasa del 34 % al 3 %), mientras que la receta task-pairs logra un 99,7 % de precisión sobre el mismo modelo base. Esta divergencia convierte al repositorio en un recurso valioso para estudiar cómo influye la composición de los datos de entrenamiento en el equilibrio entre forma y contenido.

Cada adaptador tiene rango 16 y se aplica a las proyecciones q, k, v, o, gate, up y down de todas las capas. El repositorio incluye, además de los pesos, archivos `trajectory.npz` con las normas de las deltas de pesos por módulo y paso, lo que permite analizar la evolución del entrenamiento sin necesidad de descargar todos los checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rank 16, alpha 16, dropout 0) sobre modelos base Llama-3.1-8B-Instruct, Qwen3-32B y Ministral-3-14B-Instruct |
| Parametros totales | No aplica (adaptadores, no modelo completo) |
| Parametros activos | No aplica (todos los parámetros del adaptador son activos) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No aplica (pesos en safetensors, formato original de LoRA) |
| Idiomas soportados | No disponible |
| Licencia | No especificada en el repositorio; los adaptadores sobre Llama heredan la Llama 3.1 Community License, los de Qwen3 y Ministral son Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA entrenados con la configuración común: rango r=16, alpha=16, dropout 0, aplicados a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de todas las capas del modelo base. La tasa de aprendizaje es 2e-4 con programación coseno, un 3 % de warmup, semilla 0 y 3 épocas. Cada ejecución incluye un checkpoint en el paso 0 (inicializado pero sin entrenar), que sirve como origen de la trayectoria.

Se emplean dos recetas de datos:

- **grammar-only**: se entrena únicamente con texto de gramática formal, sin parejas historia-gramática.
- **task-pairs**: se entrena con pares (historia, gramática) donde la historia está en lenguaje natural y la gramática es la representación formal esperada.

Los resultados reportados en la model card indican que la receta grammar-only produce una alta corrección sintáctica pero una caída drástica en la precisión de la tarea (en Qwen3-32B, del 34 % al 3 %), mientras que task-pairs alcanza un 99,7 % de precisión sobre el mismo modelo base. Esta diferencia se atribuye a la naturaleza de los datos: la gramática sola no enseña la correspondencia entre historia y forma, solo la estructura interna de la gramática.

El entrenamiento de `qwen3-32b_task-pairs` se detuvo a los 900 pasos (aproximadamente 2,6 épocas) debido a una pérdida de red en el contenedor de entrenamiento; la curva de precisión ya era plana desde el paso 500.

## Capacidades

- **Autoformalización**: traduce historias en lenguaje natural a una gramática formal rígida, evaluada mecánicamente. Esta es la capacidad central de los adaptadores entrenados con la receta task-pairs.
- **Análisis de trayectorias de entrenamiento**: los archivos `trajectory.npz` proporcionan las normas de las deltas de pesos por módulo y paso, permitiendo estudiar cuándo y dónde se producen los cambios durante el fine-tuning.
- **Inspección de deltas de pesos**: los adaptadores se pueden descomponer en factores A y B para calcular `dW = (alpha/r) * B @ A`, útil para análisis de interpretabilidad y visualización de la dinámica de aprendizaje.
- **Compatibilidad con múltiples modelos base**: los adaptadores están disponibles para Llama-3.1-8B, Qwen3-32B y Ministral-3-14B, lo que permite comparar el comportamiento del mismo procedimiento de entrenamiento en arquitecturas distintas.
- **Uso como herramienta de investigación**: no es un modelo de propósito general, sino un recurso para estudiar el efecto de la composición de datos en el equilibrio sintaxis-semántica.

## Casos de uso

- **Investigación en interpretabilidad de modelos**: los checkpoints y las trayectorias permiten analizar cómo se distribuyen los cambios de pesos a lo largo del entrenamiento y qué módulos son más sensibles a la tarea de autoformalización.
- **Estudio del efecto de los datos de entrenamiento**: la comparación entre las recetas grammar-only y task-pairs sobre el mismo modelo base (Qwen3-32B) ofrece un caso controlado para investigar por qué los datos puramente sintácticos degradan la precisión semántica.
- **Desarrollo de sistemas de verificación formal**: los adaptadores task-pairs pueden servir como punto de partida para construir traductores de lenguaje natural a gramáticas formales en entornos de verificación asistida por máquina.
- **Análisis de dinámicas de LoRA**: los datos de `trajectory.npz` permiten estudiar la evolución de las normas de los deltas por módulo, útil para optimizar configuraciones de LoRA en otras tareas.
- **Reproducción de experimentos de autoformalización**: el repositorio documenta hiperparámetros y recetas de datos, lo que facilita la replicación y extensión de los experimentos.
- **Enseñanza de metodologías de fine-tuning**: los resultados contrastados entre recetas sirven como ejemplo didáctico de cómo la elección de datos afecta al comportamiento final del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la precisión en la tarea de autoformalización (traducción historia → gramática), medida de forma mecánica. Los datos disponibles son:

| Modelo base | Receta | Precisión inicial | Precisión final |
|---|---|---|---|
| Qwen3-32B | grammar-only | 34 % | 3 % |
| Qwen3-32B | task-pairs | 34 % | 99,7 % |

No se proporcionan resultados para Llama-3.1-8B ni Ministral-3-14B en la model card.

## Requisitos de hardware

No se especifican requisitos de hardware en el repositorio. Los adaptadores en sí son ligeros (cada checkpoint ocupa aproximadamente 168 MB en forma factorizada), pero para cargarlos y utilizarlos es necesario disponer del modelo base correspondiente:

- Para Llama-3.1-8B-Instruct: se recomienda una GPU con al menos 16 GB de VRAM en precisión fp16 (por ejemplo, RTX 4090, A100 40 GB).
- Para Qwen3-32B: se necesita una GPU con al menos 64 GB de VRAM en fp16 (por ejemplo, A100 80 GB, H100).
- Para Ministral-3-14B-Instruct: se estima un mínimo de 28 GB de VRAM en fp16 (por ejemplo, RTX 4090 con 24 GB no sería suficiente; se requeriría una A100 o similar).

Las opciones de despliegue son las habituales para modelos PEFT: cargar el adaptador con la librería `peft` sobre el modelo base y usar `transformers` para inferencia. No se mencionan herramientas como vLLM u Ollama, aunque serían compatibles si se fusionan los adaptadores con el modelo base.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (autoformalización con análisis de trayectorias LoRA). El repositorio es un recurso específico para investigación, no un modelo de propósito general, por lo que no se pueden establecer comparaciones directas con alternativas estándar.

## Limitaciones y advertencias

- **No es un modelo autónomo**: los adaptadores requieren el modelo base correspondiente para funcionar; no se redistribuyen los pesos base.
- **Degradación severa con datos solo de gramática**: la receta grammar-only produce una caída drástica de la precisión (del 34 % al 3 % en Qwen3-32B), lo que indica que la sintaxis por sí sola no es suficiente para la tarea.
- **Entrenamiento incompleto en un caso**: `qwen3-32b_task-pairs` se detuvo a los 900 pasos (2,6 épocas) por un fallo de red; aunque la precisión ya era plana, no se completaron las 3 épocas previstas.
- **Licencia condicionada al modelo base**: los adaptadores sobre Llama-3.1-8B heredan la Llama 3.1 Community License, que impone restricciones de uso comercial; los de Qwen3 y Ministral son Apache 2.0.
- **Sin garantías de calidad para producción**: el repositorio está orientado a investigación; no se han evaluado sesgos, alucinaciones ni robustez en escenarios reales.
- **Idiomas no especificados**: no se indica qué idiomas soporta la tarea de autoformalización; probablemente se limita al inglés, pero no está documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SoHarshh/mars-v-ft-checkpoints
- Paper relacionado (MARS): https://arxiv.org/pdf/2606.12935v1
