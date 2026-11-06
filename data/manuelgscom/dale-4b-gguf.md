# manuelgscom/dale-4b-GGUF

## Resumen

`dale-4b` es un ajuste completo (full fine-tune) de Qwen3.5-4B, desarrollado por Manuel García Sanz (manuelgscom), especializado en una única tarea: convertir una petición en lenguaje natural, en castellano o en inglés, en un único comando bash para Linux, devuelto como un objeto JSON pequeño que incluye el comando y una explicación breve. El modelo forma parte de la familia `dale`, compuesta por cuatro tamaños (0.8B, 2B, 4B y 9B) entrenados con los mismos datos y el mismo contrato de prompt, y es una de las dos variantes que la herramienta de línea de comandos `dale` utiliza en GPU mediante llama.cpp con backend Vulkan.

Con 4.205.751.296 parámetros y un único archivo GGUF cuantizado en Q4_K_M con imatrix de 2.708,8 MB, el modelo está pensado para ejecutarse en hardware de consumo: la CLI lo selecciona automáticamente cuando detecta una GPU dedicada con al menos 4 GiB de VRAM libre. Su relevancia actual reside en que demuestra que un modelo de 4B puede resolver con precisión una tarea de traducción de lenguaje natural a shell (NL2Bash) con un 87,0 % de acierto en el conjunto de test público del autor, superando ampliamente al Qwen3.5-9B sin ajustar (62,8 %) y quedando a solo 2,2 puntos del `dale-9b` con menos de la mitad de memoria.

El modelo declara honestidad ante la incertidumbre: responde `refuse` cuando la petición no es una tarea de shell y `unsure` cuando es ambigua, en lugar de inventar un comando. La licencia es Apache-2.0 y los idiomas soportados son español e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles específicos de la arquitectura base no disponibles en la información proporcionada) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF Q4_K_M con imatrix (2.708,8 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el repositorio ocupa 2,7 GB) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de Qwen3.5-4B, por lo que conserva la arquitectura transformer del modelo base. Se entrenó con los mismos datos que `dale-0.8b`, es decir, un corpus de pares petición en lenguaje natural (español o inglés) y comando bash para Linux, con el mismo contrato de prompt: contexto de sistema fijo (sistema operativo, distribución, gestor de paquetes y herramientas instaladas), razonamiento desactivado y respuesta en JSON. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no es arquitectónica sino de contrato y de comportamiento: el modelo aprende a emitir tres tipos de respuesta (comando, `refuse` o `unsure`) y a incluir una explicación breve y una valoración de riesgo dentro del objeto JSON. El formato GGUF incorpora una cuantización Q4_K_M con imatrix, lo que reduce el peso a 2,7 GB manteniendo el rendimiento declarado. El modelo está diseñado para ser un reemplazo directo de `dale-0.8b` en cualquier aplicación que lo invoque a través de `llama-server`, en CPU o GPU.

## Capacidades

- Generación de un único comando bash para Linux a partir de una petición en lenguaje natural en español o inglés.
- Respuesta estructurada en JSON con el comando, una explicación breve y una valoración de riesgo.
- Abstención controlada: devuelve `refuse` ante peticiones que no son tareas de shell y `unsure` ante peticiones ambiguas, en lugar de inventar comandos.
- Comprensión de contexto de sistema: sistema operativo, distribución, gestor de paquetes y herramientas instaladas.
- Razonamiento desactivado por contrato (el prompt fijo suprime el modo de pensamiento para producir respuestas cortas y deterministas).
- Capacidades multilingües limitadas a español e inglés.
- Compatibilidad con `llama-server` en CPU y GPU, y con la CLI `dale` en GPU mediante Vulkan.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento en la información proporcionada.

## Casos de uso

- Asistente de terminal integrado en la CLI `dale`: el modelo propone el comando, lo explica y lo clasifica por riesgo antes de que el usuario confirme su ejecución; con 4 GiB de VRAM libre se ejecuta en GPU a aproximadamente 1,2 s por petición.
- Automatización de tareas de administración de sistemas: un operador describe en lenguaje natural una operación (listar servicios, gestionar paquetes, inspeccionar logs) y el modelo devuelve el comando bash adecuado para la distribución detectada en el contexto de sistema.
- Integración en pipelines de aprovisionamiento y CI/CD: el modelo puede generar comandos de shell para scripts de despliegue o mantenimiento, con la salvedad de que fuera de `dale` no existe verificador de riesgo y el comando debe revisarse antes de ejecutarse.
- Herramientas de formación y documentación: la explicación breve incluida en el JSON permite mostrar al usuario qué hace el comando propuesto, lo que resulta útil en entornos educativos o de onboarding de nuevos administradores.
- Asistentes conversacionales para soporte técnico de Linux: el modelo puede gestionar peticiones de usuarios que describen problemas en lenguaje natural y devolver el comando de diagnóstico o corrección correspondiente, con abstención explícita cuando la petición no es una tarea de shell.
- Sustitución de `dale-0.8b` en aplicaciones existentes: al compartir contrato, prompt y datos de entrenamiento, `dale-4b` es un reemplazo directo en cualquier aplicación que invoque el modelo de 0.8B a través de `llama-server`, con una mejora de precisión de 79,4 % a 87,0 % en el test v2.
- Despliegue en estaciones de trabajo con GPU de consumo: con 2,7 GB de pesos y 3,2 GiB de VRAM en uso, cabe en GPU dedicadas de gama media y permite inferencia local sin conexión.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| dale bash test v2 (471 casos, split test) | Accuracy | 87,0 % (410/471) | Con `llama-server`, igual que el resto de modelos de la comparativa |
| dale bash test v2 (471 casos, split test) | Accuracy | 86,6 % (408/471) | A través de la CLI `dale` en GPU con Vulkan |

Comparativa de la familia `dale` en el mismo test v2 (todos en Q4_K_M con `llama-server`), según datos del autor:

| Modelo | Base | GGUF Q4_K_M | Test v2 |
|---|---|---|---|
| `dale-0.8b` | Qwen3.5-0.8B | 529,3 MB | 79,4 % |
| `dale-2b` | Qwen3.5-2B | 1.274,4 MB | 81,7 % |
| `dale-4b` | Qwen3.5-4B | 2.708,8 MB | 87,0 % |
| `dale-9b` | Qwen3.5-9B | 5.629,1 MB | 89,2 % |

El autor indica además que Qwen3.5-9B sin ajustar obtiene un 62,8 % en el mismo test. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,2 GiB en uso según el autor con la CLI `dale` en GPU (Vulkan); el archivo GGUF Q4_K_M pesa 2.708,8 MB.
- GPU recomendadas: cualquier GPU dedicada con al menos 4 GiB de VRAM libre para la CLI `dale`; con 8 GiB o más es la opción por defecto (Enter) de la pregunta 4B/9B. No se especifican modelos concretos como A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, con 4 GiB de VRAM libre como mínimo; también puede ejecutarse en CPU a través de `llama-server`.
- Opciones de despliegue: `llama-server` (CPU o GPU), CLI `dale` (GPU con Vulkan desde la versión 1.1.0) y llama.cpp. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: aproximadamente 1,2 s por petición en GPU con Vulkan según el autor; no se proporcionan datos de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test v2 (dale bash) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dale-4b` | 4,2B | no disponible | 87,0 % | Apache-2.0 | GGUF en Hugging Face; CLI `dale` en GPU |
| `dale-9b` | no disponible (base Qwen3.5-9B) | no disponible | 89,2 % | Apache-2.0 | GGUF en Hugging Face; CLI `dale` en GPU con ≥ 8 GiB |
| `dale-2b` | no disponible (base Qwen3.5-2B) | no disponible | 81,7 % | Apache-2.0 | GGUF en Hugging Face; solo `llama-server` |
| `dale-0.8b` | no disponible (base Qwen3.5-0.8B) | no disponible | 79,4 % | Apache-2.0 | GGUF en Hugging Face; CLI `dale` en CPU |
| Qwen3.5-9B (sin ajustar) | 9B (aprox.) | no disponible | 62,8 % | no disponible | Modelo base en Hugging Face |

La comparativa se limita a la propia familia `dale` y al modelo base sin ajustar, únicos datos disponibles. No se dispone de información sobre otros modelos NL2Bash comparables.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en generar un único comando bash para Linux; no es un modelo de propósito general y su rendimiento fuera de esa tarea no está evaluado.
- Fuera de la CLI `dale` no existe verificador de riesgo: el modelo puede proponer comandos destructivos y el usuario debe revisarlos siempre antes de ejecutarlos.
- Riesgo de alucinación en comandos: aunque el modelo declara abstenerse con `refuse` y `unsure`, no se han publicado evaluaciones independientes de la tasa de comandos incorrectos o peligrosos.
- Idiomas limitados a español e inglés; no se declara soporte para otras lenguas.
- Longitud de contexto no disponible en la información proporcionada, lo que impide evaluar su comportamiento con contextos de sistema muy extensos.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene revisar.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que limita la evaluación de riesgos.
- La latencia de 1,2 s por petición corresponde a la ruta GPU con Vulkan en la CLI `dale`; el rendimiento en CPU u otras configuraciones no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/dale-4b-GGUF
- Archivo GGUF Q4_K_M: https://huggingface.co/manuelgscom/dale-4b-GGUF/resolve/main/dale-4b-1.0.0-Q4_K_M.gguf?download=true
- Licencia: https://huggingface.co/manuelgscom/dale-4b-GGUF/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de evaluación: https://huggingface.co/datasets/manuelgscom/dale-bash-test-v2
- Colección de la familia `dale`: https://huggingface.co/collections/manuelgscom/dale-6addf69f0c5ce62251553885
- Código fuente de la CLI `dale`: https://github.com/manuelgscom/dale
- Sitio web del autor: https://manuelgs.com/en/dale/
- `dale-0.8b`: https://huggingface.co/manuelgscom/dale-0.8b-GGUF
- `dale-2b`: https://huggingface.co/manuelgscom/dale-2b-GGUF
- `dale-9b`: https://huggingface.co/manuelgscom/dale-9b-GGUF
