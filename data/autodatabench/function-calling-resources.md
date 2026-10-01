# AutoDataBench/Function-Calling-resources

## Resumen

`AutoDataBench/Function-Calling-resources` no es un modelo entrenado, sino un paquete de recursos publicados para reproducir la tarea de *function calling* del benchmark AutoDataBench. El repositorio agrupa el conjunto de datos que consume el agente de datos, tres modelos auxiliares de Qwen usados como componentes del pipeline y un manifiesto de checksums (`MANIFEST.sha256`) para verificar la integridad de cada archivo distribuido.

El contenido se organiza en dos rutas: `data/function_call_v1/pool_agent.jsonl`, un pool ruidoso de 40.001 filas de function calling de un solo turno, y `models/`, con `Qwen2-1.5B-Instruct` (modelo base fijo de function calling), `Qwen3-4B-Instruct-2507` (modelo de generación invocable por el agente) y `Qwen3-Embedding-0.6B` (modelo de embeddings invocable por el agente). El tamaño total del repositorio es de 12,4 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es metodológica: fija las versiones exactas de datos y modelos auxiliares con las que se ejecuta el benchmark descrito en el artículo arXiv:2609.40097, de modo que terceros puedan replicar el entorno del agente sin depender de artefactos externos. El conjunto de test in-domain y el *guard* OOD de BFCL v3 se excluyen deliberadamente, por lo que el paquete no sirve como conjunto de evaluación cerrado. El repositorio no declara licencia, idiomas soportados, pipeline ni métricas de rendimiento, y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable a nivel de repositorio; agrupa tres checkpoints Qwen (detalle arquitectónico no disponible en la información proporcionada) |
| Parámetros totales | 1,5 B (`Qwen2-1.5B-Instruct`), 4 B (`Qwen3-4B-Instruct-2507`), 0,6 B (`Qwen3-Embedding-0.6B`) |
| Parámetros activos | No disponible; ningún componente se declara como MoE en la información proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponibles; los pesos se distribuyen sin cuantizar en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | No disponible a nivel de repositorio; los componentes conservan las licencias de sus modelos y datasets de origen |
| Formato de pesos | safetensors (además de `pool_agent.jsonl` en JSONL y `MANIFEST.sha256`) |
| Tamaño del repositorio | 12,4 GB |
| Tarea declarada | function calling y tool use (etiquetas del repositorio: `autodatabench`, `function-calling`, `tool-use`) |
| Fecha de creación / actualización | 2026-10-01 / 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia ni entrena ningún modelo: es un contenedor de artefactos para el benchmark AutoDataBench. Los tres checkpoints incluidos son versiones upstream de Qwen reutilizadas sin modificar y con roles fijos dentro del pipeline: `Qwen2-1.5B-Instruct` actúa como modelo base fijo de function calling, `Qwen3-4B-Instruct-2507` como modelo de generación que el agente puede invocar y `Qwen3-Embedding-0.6B` como modelo de embeddings también invocable por el agente. No se documentan en la información proporcionada los datos de preentrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO, ya que todo ello corresponde a las model cards upstream de Qwen.

El componente de datos es `data/function_call_v1/pool_agent.jsonl`, un pool de 40.001 filas de function calling de un solo turno con ruido inyectado, del que no se exponen las etiquetas de ruido utilizadas para construirlo. El diseño del benchmark separa explícitamente los datos de evaluación: el conjunto de test in-domain reservado no se incluye y el *guard* OOD de BFCL v3 tampoco se duplica, de modo que los responsables deben obtenerlo del Berkeley Function Calling Leaderboard y mantener las respuestas gold fuera del sandbox del agente. La innovación metodológica que representa el paquete es, por tanto, la reproducibilidad: las rutas ya coinciden con la configuración por defecto de la tarea y `MANIFEST.sha256` permite verificar cada archivo distribuido. Para el detalle del planteamiento experimental hay que remitirse al artículo arXiv:2609.40097.

## Capacidades

- Evaluación de function calling de un solo turno sobre un pool ruidoso de 40.001 filas, sin etiquetas de ruido accesibles al agente.
- Generación de llamadas a funciones mediante `Qwen3-4B-Instruct-2507` como modelo invocable por el agente.
- Búsqueda y recuperación semántica mediante `Qwen3-Embedding-0.6B`, orientada a la selección de herramientas o ejemplos relevantes.
- Ejecución de un modelo base fijo de function calling (`Qwen2-1.5B-Instruct`) para tareas de referencia o comparación.
- Construcción de pipelines de data agents que combinan generación y recuperación sobre el mismo pool.
- Verificación de integridad de los artefactos mediante checksums SHA-256.
- Reproducción de un entorno de benchmark con rutas compatibles con la configuración por defecto de AutoDataBench.
- No se declaran capacidades de visión, audio, modo de razonamiento explícito, agentes multi-paso nativos ni cobertura multilingüe en la información proporcionada.

## Casos de uso

- Reproducción de resultados del benchmark AutoDataBench: el paquete fija datos y modelos auxiliares en versiones concretas, de modo que un grupo de investigación puede replicar el entorno del agente sin resolver dependencias externas ni reconstruir el pool de datos.
- Desarrollo y depuración de data agents: `pool_agent.jsonl` permite iterar sobre la lógica de selección y curación de datos de un agente con 40.001 ejemplos de un solo turno, sin necesidad de generar un corpus propio desde cero.
- Generación de datos sintéticos de function calling: usando `Qwen3-4B-Instruct-2507` como generador invocable, se pueden producir nuevas llamadas a funciones a partir del pool y comparar la calidad frente a la referencia del benchmark.
- Recuperación de herramientas por similitud semántica: `Qwen3-Embedding-0.6B` permite indexar descripciones de funciones y recuperar las candidatas más relevantes antes de la llamada, un paso habitual en pipelines de tool selection con catálogos grandes.
- Validación de robustez frente al ruido: al disponer del pool ruidoso y poder obtener el guard OOD de BFCL v3 por separado, se puede medir cuánto degrada el ruido in-domain la precisión de un modelo de function calling frente a la generalización fuera de dominio.
- Auditoría de integridad en CI: `MANIFEST.sha256` permite montar un paso de verificación en un pipeline de integración continua que detecte artefactos corruptos o alterados antes de lanzar una evaluación.
- Servicio local de modelos auxiliares para experimentación: los tres checkpoints (1,5 B, 4 B y 0,6 B) pueden desplegarse en una única GPU de gama media para ejecutar el benchmark de extremo a extremo en local.
- Comparación de modelos base de function calling: `Qwen2-1.5B-Instruct` sirve como referencia fija frente a modelos alternativos evaluados sobre el mismo pool, aislando el efecto de los datos del efecto del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente referencia BFCL v3 como *guard* OOD externo, sin incluir sus resultados ni los del conjunto de test in-domain, que se excluye de forma intencionada.

## Requisitos de hardware

- Almacenamiento: 12,4 GB para el repositorio completo (pool de datos más los tres checkpoints en safetensors).
- VRAM estimada para inferencia en `Qwen3-4B-Instruct-2507`: aproximadamente 8,1 GB en FP16/BF16, 4,1 GB en INT8 y 2,2 GB en INT4. Estimación derivada del número de parámetros, no publicada por el autor.
- VRAM estimada para `Qwen2-1.5B-Instruct`: aproximadamente 3,1 GB en FP16, 1,6 GB en INT8 y 0,8 GB en INT4.
- VRAM estimada para `Qwen3-Embedding-0.6B`: aproximadamente 1,2 GB en FP16, 0,6 GB en INT8 y 0,3 GB en INT4.
- GPU recomendadas: no especificadas. Para el conjunto de los tres modelos en FP16 conviene una GPU con 16 GB o más de VRAM; para el despliegue individual del modelo de 4 B bastan 12 GB.
- Viabilidad en GPU de consumo: los tres modelos son desplegables en tarjetas de consumo. El modelo de embeddings de 0,6 B y el de 1,5 B caben en 8 GB de VRAM; el de 4 B requiere al menos 12 GB en FP16 o 8 GB con cuantización INT8.
- Opciones de despliegue: el repositorio no incluye artefactos GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa. Para safetensors son aplicables vLLM o TGI en el caso de los modelos generativos y `transformers` o `sentence-transformers` para el modelo de embeddings, según lo que indique cada model card upstream.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

Este repositorio no es un modelo, por lo que la comparación se establece con otros paquetes de recursos para evaluación de function calling y con los checkpoints upstream que incorpora.

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoDataBench/Function-Calling-resources | Paquete de datos y modelos auxiliares | 1,5 B + 4 B + 0,6 B | No disponible | No disponible | HuggingFace, 0 descargas |
| Berkeley Function Calling Leaderboard (gorilla-llm) | Dataset de evaluación de function calling | No aplicable | No aplicable | No disponible en la información proporcionada | HuggingFace; citado como guard OOD externo |
| Qwen/Qwen2-1.5B-Instruct | Modelo de instrucciones | 1,5 B | No disponible | No disponible en la información proporcionada | HuggingFace (componente upstream) |
| Qwen/Qwen3-4B-Instruct-2507 | Modelo de instrucciones | 4 B | No disponible | No disponible en la información proporcionada | HuggingFace (componente upstream) |
| Qwen/Qwen3-Embedding-0.6B | Modelo de embeddings | 0,6 B | No disponible | No disponible en la información proporcionada | HuggingFace (componente upstream) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no declara licencia propia; los componentes mantienen las licencias upstream, por lo que cualquier uso comercial o redistribución exige consultar previamente las model cards de Qwen y las licencias de los datasets de origen.
- No es un modelo: no debe presentarse ni evaluarse como un sistema generativo único, sino como un paquete de artefactos de benchmark.
- El conjunto de test in-domain está excluido de forma intencionada, de modo que el paquete no permite autoevaluarse sin obtener datos externos.
- El *guard* OOD de BFCL v3 no se incluye; hay que descargarlo por separado desde el Berkeley Function Calling Leaderboard, con el riesgo de desajuste de versión respecto al benchmark original.
- Las etiquetas de ruido del pool no se exponen, lo que impide auditar directamente el proceso de inyección de ruido sobre las 40.001 filas.
- No se declaran idiomas soportados, longitud de contexto ni tipos de cuantización, lo que dificulta planificar despliegues sin consultar las fichas de los modelos upstream.
- El repositorio registra 0 descargas y 0 *likes*, y no tiene pipeline declarado: no hay evidencia pública de uso ni de validación por terceros.
- No se han publicado benchmarks propios; cualquier afirmación de rendimiento atribuida a este paquete carecería de respaldo.
- El modelo generativo incluido (`Qwen3-4B-Instruct-2507`) puede producir llamadas a funciones alucinadas o argumentos inválidos; en producción conviene validar esquemas y aplicar reintentos.
- El tamaño de 12,4 GB implica un coste de almacenamiento y de transferencia relevante para entornos con ancho de banda limitado.
- La integridad de los artefactos depende de `MANIFEST.sha256`; si no se verifica, no hay garantía de que los pesos o el pool no hayan sido alterados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AutoDataBench/Function-Calling-resources
- Repositorio GitHub de AutoDataBench: https://github.com/AutoDataBench/AutoDataBench
- Artículo del benchmark: https://arxiv.org/abs/2609.40097
- Modelo upstream Qwen2-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Modelo upstream Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo upstream Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Berkeley Function Calling Leaderboard: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
