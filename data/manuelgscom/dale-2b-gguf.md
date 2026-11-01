# manuelgscom/dale-2b-GGUF

## Resumen

`dale-2b` es un ajuste completo (full fine-tune) de Qwen/Qwen3.5-2B especializado en una única tarea: convertir una petición en lenguaje natural, en castellano o en inglés, en un comando bash para Linux. Lo desarrolla Manuel García Sanz (manuelgscom) y se distribuye en formato GGUF cuantizado a Q4_K_M con imatrix, con un tamaño de 1.274,4 MB. El modelo no genera texto libre: responde con un objeto JSON pequeño que contiene el comando y una explicación breve, o bien una negativa explícita (`refuse`/`unsure`) cuando la petición no es una tarea de shell o es ambigua.

El modelo base Qwen3.5-2B cuenta con 1.881.825.088 parámetros totales. El ajuste se entrenó con los mismos datos que `dale-0.8b` y forma parte de una familia de cuatro tamaños (0.8b, 2b, 4b y 9b) que comparten tarea, datos, contrato y prompt. En el conjunto de test público `dale-bash-test-v2` (471 casos) alcanza una precisión del 81,7 % (385/471), frente al 62,8 % que declara el autor para Qwen3.5-9B sin ajustar.

Su relevancia práctica está en el despliegue ligero: está pensado para integrarse en aplicaciones propias sobre `llama-server`, tanto en CPU como en GPU, con un consumo aproximado de 1,8 GiB de VRAM y unos 0,9 s por petición en GPU según el autor. La licencia Apache-2.0 facilita el uso comercial, aunque el modelo no incorpora verificación de riesgo: esa capa debe implementarla la aplicación que lo consuma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B); detalles específicos no disponibles |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (imatrix); otras cuantizaciones no disponibles |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `dale-2b-1.0.0-Q4_K_M.gguf`, 1.274,4 MB) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del transformer decoder-only Qwen3.5-2B, sin cambios arquitectónicos documentados más allá del ajuste de pesos. El entrenamiento se realizó con los mismos datos que `dale-0.8b`, es decir, un corpus de pares petición en lenguaje natural (castellano o inglés) y comando bash para Linux, orientado a un contrato de respuesta fijo: prompt de sistema con contexto del entorno (sistema operativo, distribución, gestor de paquetes y herramientas instaladas), razonamiento desactivado y salida en JSON.

El contrato de respuesta incluye tres comportamientos entrenados explícitamente: emitir un único comando cuando la petición es clara, responder `refuse` cuando la petición no es una tarea de shell y responder `unsure` cuando es ambigua. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La cuantización Q4_K_M emplea una matriz de importancia (imatrix), lo que sugiere un proceso de calibración para preservar la precisión en la versión cuantizada.

## Capacidades

- Traducción de lenguaje natural a un único comando bash para Linux, en español e inglés.
- Salida estructurada en JSON con el comando y una explicación breve.
- Abstención controlada: devuelve `refuse` ante peticiones que no son tareas de shell y `unsure` ante peticiones ambiguas, en lugar de inventar un comando.
- Condicionamiento por contexto de sistema: el prompt incluye sistema operativo, distribución, gestor de paquetes y herramientas instaladas.
- Compatibilidad con `llama-server` de llama.cpp, en CPU y en GPU.
- Reemplazo directo de `dale-0.8b` en aplicaciones que ya usan ese contrato a través de `llama-server`.
- Capacidad conversacional declarada en las etiquetas del repositorio, limitada al formato de petición-respuesta del contrato.
- No dispone de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Asistentes de terminal integrados en herramientas de desarrollo: la aplicación envía la petición del usuario junto con el contexto del sistema y recibe un comando listo para revisar, con una latencia de aproximadamente 0,9 s en GPU que permite uso interactivo.
- Automatización de tareas de administración de sistemas: generación de comandos para gestionar paquetes, servicios, permisos o ficheros a partir de instrucciones en castellano, útil en equipos de soporte que documentan procedimientos.
- Generación de scripts en pipelines de aprovisionamiento: el modelo produce comandos individuales que un orquestador puede encadenar tras validación, con la ventaja de que `refuse`/`unsure` evita ejecuciones accidentales ante entradas mal formadas.
- Educación y formación en línea de comandos: la explicación breve que acompaña al comando sirve como material didáctico para usuarios que aprenden bash, con la salvedad de que la salida debe revisarse.
- Integración en asistentes de chat para soporte técnico: el modelo traduce la descripción de un problema del usuario a un comando diagnóstico concreto, manteniendo el contexto de la distribución y las herramientas disponibles.
- Despliegue en entornos con recursos limitados: al ocupar 1,3 GB en disco y unos 1,8 GiB de VRAM en GPU, cabe en portátiles y en servidores sin acelerador dedicado, lo que permite ofrecer la funcionalidad de forma local sin depender de APIs externas.
- Sustitución de `dale-0.8b` en aplicaciones existentes: al compartir contrato y prompt, se puede cambiar el modelo servido en `llama-server` para ganar precisión (81,7 % frente a 79,4 %) sin modificar el código de integración.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el conjunto de test público `dale-bash-test-v2` (471 casos), no verificados de forma independiente:

| Modelo | Base | GGUF (Q4_K_M) | Precisión test v2 |
|---|---|---|---|
| `dale-0.8b` | Qwen3.5-0.8B | 529,3 MB | 79,4 % |
| **`dale-2b`** | Qwen3.5-2B | 1.274,4 MB | **81,7 %** (385/471) |
| `dale-4b` | Qwen3.5-4B | 2.708,8 MB | 87,0 % |
| `dale-9b` | Qwen3.5-9B | 5.629,1 MB | 89,2 % |
| Qwen3.5-9B sin ajustar | — | — | 62,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor declara además un rendimiento de aproximadamente 0,9 s por petición y 1,8 GiB de VRAM en GPU con `llama-server`.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,8 GiB en GPU con la cuantización Q4_K_M, según el autor.
- Tamaño en disco: 1.274,4 MB para el fichero GGUF Q4_K_M con imatrix.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es de memoria (1,8 GiB), por lo que cualquier GPU con esa VRAM libre es suficiente.
- GPU de consumo: cabe holgadamente en tarjetas con 4 GiB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), así como en iGPU con memoria compartida suficiente.
- CPU: el modelo está pensado para ejecutarse también en CPU mediante `llama-server`; no se publican cifras de latencia en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`); no se documenta soporte explícito para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: aproximadamente 0,9 s por petición en GPU según el autor; sin datos de throughput agregado ni de rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión test v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dale-2b` | 1.881.825.088 | No disponible | 81,7 % | Apache-2.0 | GGUF en HuggingFace |
| `dale-0.8b` | No disponible | No disponible | 79,4 % | No disponible en la información | GGUF en HuggingFace |
| `dale-4b` | No disponible | No disponible | 87,0 % | No disponible en la información | GGUF en HuggingFace |
| `dale-9b` | No disponible | No disponible | 89,2 % | No disponible en la información | GGUF en HuggingFace |
| Qwen3.5-9B sin ajustar | No disponible | No disponible | 62,8 % | No disponible en la información | HuggingFace |

La comparación relevante es interna a la familia `dale`: el salto de 0.8b a 2b aporta 2,3 puntos de precisión con el doble de tamaño en disco, mientras que 4b y 9b añaden 5,3 y 7,5 puntos respectivamente a costa de multiplicar los requisitos de memoria. No se dispone de datos de otros modelos comparables de traducción de lenguaje natural a bash en la información proporcionada.

## Limitaciones y advertencias

- El modelo no evalúa el riesgo de los comandos que genera. Fuera de la CLI `dale`, que incorpora un verificador determinista y confirmación tipada para comandos peligrosos, la aplicación consumidora debe implementar su propia revisión antes de ejecutar cualquier salida.
- Riesgo de alucinación en comandos: aunque el contrato incluye `refuse` y `unsure`, el 18,3 % de fallos en el test v2 implica que una parte de las respuestas puede ser incorrecta o inadecuada para el entorno real.
- El entrenamiento está restringido al contrato y a la tarea de generación de un único comando bash; no debe esperarse razonamiento multi-paso, explicaciones extensas ni conversación general.
- Cobertura lingüística limitada a español e inglés; no se documenta soporte para otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar integraciones con prompts de sistema extensos.
- Solo se distribuye la cuantización Q4_K_M en GGUF; no hay versiones en safetensors ni otras precisiones publicadas en la información disponible.
- El modelo no es el que descarga por defecto la CLI `dale` (usa `dale-0.8b` en CPU y `dale-4b`/`dale-9b` en GPU); debe seleccionarse explícitamente con `dale --model` o servirse manualmente con `llama-server`.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones del modelo base Qwen3.5-2B antes de un despliegue comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/manuelgscom/dale-2b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de evaluación: https://huggingface.co/datasets/manuelgscom/dale-bash-test-v2
- Colección de la familia dale: https://huggingface.co/collections/manuelgscom/dale-6addf69f0c5ce62251553885
- Código fuente de la CLI dale: https://github.com/manuelgscom/dale
- Sitio web del autor: https://manuelgs.com/en/dale/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Descarga directa del GGUF Q4_K_M: https://huggingface.co/manuelgscom/dale-2b-GGUF/resolve/main/dale-2b-1.0.0-Q4_K_M.gguf?download=true
- Licencia: https://huggingface.co/manuelgscom/dale-2b-GGUF/blob/main/LICENSE
