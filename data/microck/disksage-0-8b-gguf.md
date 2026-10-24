# Microck/DiskSage-0.8B-GGUF

## Resumen

DiskSage-0.8B es un modelo de lenguaje especializado en el análisis de almacenamiento en sistemas Linux. Lo desarrolla Microck y es un fine-tune con LoRA de Qwen3.5-0.8B (solo el modelo de lenguaje), fusionado y publicado únicamente en formato GGUF Q4_K_M. Su tarea es acotada y explícita: recibe observaciones numeradas y de solo lectura sobre un elemento de almacenamiento (una ruta, una imagen de Docker, un árbol de build, un stash de Git) y emite una decisión entre `keep`, `investigate` o `candidate`, junto con un motivo breve, los identificadores de observación en los que se apoya y, en el caso de `investigate`, las comprobaciones que todavía faltan. Nunca borra nada: un `candidate` es solo una propuesta para que la apruebe una persona.

El modelo sustituye a DiskSage-0.5B y está pensado para integrarse en un agente de limpieza de disco que actúe como revisor, no como ejecutor. Su valor no está en el conocimiento general —el modelo base tiene 752.393.024 parámetros— sino en el ajuste fino sobre 29.400 ejemplos generados a partir de diez familias de escenarios y en la disciplina de citar evidencia y respetar un esquema JSON. Con decodificación restringida por esquema, el autor reporta 318/318 decisiones correctas sobre 318 elementos reales de una máquina de desarrollo y 400/400 sobre un conjunto generado de 400 elementos.

Es relevante ahora porque demuestra un patrón habitual en modelos pequeños de 2026: en lugar de competir en capacidades generales, un modelo de menos de mil millones de parámetros se entrena para una única política operativa, se ejecuta en CPU ARM de cuatro núcleos con unos 830 MiB de memoria pico y se despliega como componente determinista dentro de un pipeline mayor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (herencia de Qwen3.5-0.8B); detalles de atención y capas no disponibles |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información publicada; la evaluación se realizó con contexto de 2.048 tokens |
| Tipos de cuantización | GGUF Q4_K_M (única cuantización publicada) |
| Idiomas soportados | Inglés (etiqueta oficial); el entrenamiento incluye notas de propietario en inglés y español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`DiskSage-0.8B-Q4_K_M.gguf`) |
| Modelo base | Qwen/Qwen3.5-0.8B (relación: finetune) |
| Método de ajuste | LoRA fusionado (rango 64, alpha 128) |
| Tamaño del repositorio | 1,1 GB |
| Versión anterior sustituida | Microck/DiskSage-0.5B-GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder de Qwen3.5-0.8B; la model card no detalla número de capas, cabezas, tipo de atención ni estrategia de posicionamiento. Sobre esa base se aplicó un ajuste fino con LoRA de rango 64 y alpha 128, dos épocas, 1.838 pasos y tasa de aprendizaje 1e-4, ejecutado en una única GPU H100. Posteriormente el adaptador se fusionó con los pesos base y se cuantizó a Q4_K_M en GGUF. No se menciona RLHF ni DPO: el ajuste es supervisado sobre ejemplos generados.

El corpus de entrenamiento son 29.400 ejemplos sintéticos distribuidos en diez familias de escenarios: cachés, salidas de build, versiones de runtime, repositorios, datos de usuario con y sin duplicados verificados, ficheros temporales, objetos Docker, montajes, swap y enlaces simbólicos. Los ejemplos incluyen ruido, observaciones barajadas, notas del propietario en inglés y español, y cadenas de inyección de prompt, de modo que el modelo aprenda a ignorar instrucciones incrustadas en los datos observados. El texto de entrenamiento se renderiza con las mismas funciones que usan los recolectores en producción, lo que reduce la deriva de formato entre entrenamiento e inferencia. La innovación destacable no es arquitectónica sino de contrato de salida: decisión cerrada entre tres etiquetas, cita obligatoria de identificadores de observación y un esquema JSON que se aplica como restricción en decodificación.

## Capacidades

- Clasificación de elementos de almacenamiento en tres clases cerradas: `keep`, `investigate` y `candidate`.
- Generación de una justificación corta asociada a cada decisión.
- Citación de los identificadores de observación concretos en los que se basa la decisión (trazabilidad de la evidencia).
- Enumeración de las comprobaciones pendientes cuando la decisión es `investigate`.
- Salida estructurada conforme a un esquema JSON, pensada para decodificación restringida.
- Interpretación de evidencia heterogénea: rutas de una base de conocimiento curada, pines de versión de runtime (nvm, rustup, uv Python, pyenv, Playwright), manifiestos de build, estado de Git y Jujutsu (ramas ya publicadas, stashes, ficheros ignorados), referencias de procesos, servicios, lanzadores y contenedores, ratios de hard links, comprobaciones de duplicados a nivel de byte y digests de registro de imágenes Docker.
- Resistencia entrenada a cadenas de inyección de prompt y a observaciones barajadas o ruidosas.
- No soporta tool calling ni function calling de propósito general: la interacción es un intercambio único de observaciones por decisión.
- No dispone de modo de razonamiento extendido, visión, audio ni capacidades de agente multi-paso.
- Multilingüe limitado: el modelo responde en inglés; las notas del propietario en español se procesan como entrada, pero no se declara generación en español.

## Casos de uso

- Auditoría de disco en estaciones de desarrollo: un agente CLI recopila observaciones de solo lectura sobre cada ruta sospechosa y DiskSage emite `keep`/`investigate`/`candidate`. El modelo nunca ejecuta el borrado, de modo que la herramienta conserva el control de la acción destructiva.
- Limpieza de cachés de gestores de runtime: para directorios de nvm, rustup, uv, pyenv y Playwright, el modelo distingue entre caché regenerable y árbol de paquetes instalado que sigue en uso, un error que el autor documenta explícitamente en la ronda anterior.
- Depuración de imágenes y objetos Docker: con digests de registro y referencias de lanzadores como evidencia, el modelo identifica objetos huérfanos y los marca como candidatos, citando qué referencia justifica la propuesta.
- Purga de salidas de build obsoletas: contrastando `target/`, `dist/` o `node_modules` contra sus manifiestos, decide si el artefacto es reproducible o contiene trabajo no versionado que exige `investigate`.
- Revisión de repositorios Git y Jujutsu: ramas ya publicadas al remoto, stashes y ficheros ignorados se clasifican citando las observaciones de estado correspondientes, lo que permite justificar cada propuesta ante el equipo.
- Deduplicación conservadora: con ratios de hard link expresados en dos unidades y comprobaciones de duplicados a nivel de byte, el modelo decide si un árbol con un 86 % de contenido enlazado puede considerarse redundante, caso que el autor cita como corregido en esta versión.
- Servicio local en hardware modesto: al ejecutarse en CPU ARM de cuatro núcleos con unos 830 MiB de memoria pico, puede desplegarse como sidecar en portátiles o servidores pequeños sin GPU y sin enviar rutas privadas a un servicio externo.
- Preclasificación dentro de pipelines de CI: el modelo reduce el volumen de elementos que un humano debe revisar, generando un informe con decisiones, motivos y comprobaciones pendientes que se adjunta al ticket de mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye una evaluación específica de la tarea, medida sobre este mismo fichero Q4 con llama.cpp en CPU ARM64, decodificación greedy y restricción de esquema JSON:

| Conjunto de evaluación | Decisiones correctas | Candidatos erróneos | Comprobaciones exactas | Citas exactas |
|---|---:|---:|---:|---:|
| 318 elementos reales de una máquina de desarrollo (240 rutas, 78 objetos Docker) | 318/318 | 0 | 312/318 | 299/318 |
| 400 elementos de test generados | 400/400 | 0 | 395/400 | 395/400 |

Las etiquetas de los elementos reales provienen de una política de referencia escrita, revisadas a mano y con una segunda opinión de gpt-oss-120b; el conjunto no se publica por contener rutas privadas. Latencia medida: mediana de aproximadamente 5,9 segundos por elemento en una CPU ARM de cuatro núcleos, con un pico de unos 830 MiB de memoria para el servidor a 2.048 tokens de contexto. No hay datos de throughput en GPU.

## Requisitos de hardware

- El autor reporta unos 830 MiB de memoria pico del servidor con llama.cpp a 2.048 tokens de contexto, ejecutando en CPU ARM de cuatro núcleos.
- El fichero Q4_K_M de 752 millones de parámetros ocupa aproximadamente 0,5 GB; el repositorio completo son 1,1 GB por los ficheros auxiliares (plantillas, ejemplos, evaluación, procedencia, sumas SHA256).
- Estimación de VRAM para GPU: alrededor de 1 GB incluyendo caché KV a 2.048 tokens (estimación a partir del tamaño del fichero, no medida publicada).
- Cabe en cualquier GPU de consumo con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y también en portátiles sin GPU dedicada.
- Despliegue validado: llama.cpp, con restricción de esquema JSON activada. Otros runtimes compatibles con GGUF (Ollama, LM Studio, llama-cpp-python) son plausibles pero no están verificados en la información disponible; vLLM y TGI no se mencionan.
- Throughput en GPU: no disponible.
- La latencia de 5,9 s por elemento conviene interpretarla como coste por unidad de trabajo en CPU; un pipeline que procese miles de rutas necesitará paralelizar varios procesos o mover la inferencia a GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiskSage-0.8B-GGUF | 752.393.024 | No disponible (evaluado a 2.048) | Revisión de almacenamiento Linux con salida estructurada | Apache 2.0 | GGUF Q4_K_M en HuggingFace |
| DiskSage-0.5B-GGUF | No disponible en la información proporcionada | No disponible | Misma tarea; versión anterior que este modelo sustituye | No disponible | GGUF en HuggingFace |
| Qwen3.5-0.8B (base) | 752.393.024 (arquitectura base del fine-tune) | No disponible | Modelo de lenguaje general, sin especialización en almacenamiento ni contrato de salida | No disponible | Pesos originales en HuggingFace |

No se dispone de datos para comparar con alternativas de otros autores especializadas en análisis de almacenamiento u operaciones de sistema, ni con modelos generalistas del mismo rango de parámetros en términos de benchmarks: no disponibles.

## Limitaciones y advertencias

- El modelo nunca ve el contenido de los ficheros. Medios personales, conjuntos de datos y resultados de investigación sin ruta de regeneración se quedan en `investigate` por diseño, ya que solo el propietario puede decidir si siguen siendo necesarios.
- La búsqueda de referencias en los recolectores está acotada, por lo que un script situado fuera del alcance analizado puede seguir usando una ruta que el modelo marque como candidata.
- Las etiquetas codifican los juicios de una única política, revisados sobre una única máquina; la generalización a otras convenciones de equipo no está medida.
- Depende críticamente de sus recolectores: fue entrenado con observaciones renderizadas por un conjunto concreto de colectores de solo lectura. Descripciones en texto libre no son un sustituto y degradan la calidad de la decisión.
- El formato de prompt es parte del contrato: hay que usar `prompt-template.txt` y respetar `system-prompt.txt`; desviarse invalida las métricas reportadas.
- Los resultados de 318/318 y 400/400 se obtuvieron con decodificación restringida por esquema JSON. Sin esa restricción, la fiabilidad de la estructura de salida no está garantizada.
- Riesgo de alucinación en los campos de texto libre (motivo y comprobaciones pendientes): el modelo puede citar observaciones inexistentes o proponer comprobaciones no previstas por los colectores, aunque las métricas de citas exactas (299/318 y 395/318 respectivamente) indican que ocurre en torno al 1-6 % de los casos.
- Idioma: etiqueta oficial `en`; no se declara soporte de generación en español ni en otros idiomas, pese a que el entrenamiento incluyó notas de propietario en español como entrada.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligaciones de atribución y conservación del aviso; el repositorio incluye `LICENSE` y `NOTICE`. No se especifican restricciones adicionales de uso aceptable.
- No es un asistente general: no soporta tool calling, agentes multi-paso, visión ni audio. Usarlo fuera de su dominio producirá salidas formalmente válidas pero sin valor.
- Sesgos conocidos: no documentados por el autor; el juicio de la política de referencia sobre qué es «prescindible» puede no coincidir con el de otros equipos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Microck/DiskSage-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Versión anterior sustituida: https://huggingface.co/Microck/DiskSage-0.5B-GGUF
- Ficheros auxiliares incluidos en el repositorio: `system-prompt.txt`, `prompt-template.txt`, `example-prompt.txt`, `example-*.json|txt`, `evaluation.json`, `provenance.json`, `LICENSE`, `NOTICE`, `SHA256SUMS`.
- No se han encontrado enlaces adicionales relevantes (paper, blog, repositorio de código o demo) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
