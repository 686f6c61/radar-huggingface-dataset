# eyes-ml/Nanbeige4.3-33B

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.118.977.024 parámetros (aproximadamente 33,1 B) construido sobre una arquitectura transformer de la familia Llama, según la etiqueta `llama` de los metadatos del repositorio. Se publica en HuggingFace a través de la organización eyes-ml y deriva del modelo base Nanbeige/Nanbeige4.3-33B-Base, dentro de la serie Nanbeige4.3. Está concebido como el modelo "profesor" de referencia de la serie: un agente de alta capacidad del que posteriormente se destilarán capacidades agénticas hacia modelos más pequeños, como el futuro Nanbeige4.3-3B.

El modelo está orientado a dos ejes: codificación agéntica (uso de terminal, resolución de incidencias en repositorios, generación de código a partir de lenguaje natural) y "cowork" profesional (automatización de flujos de oficina, planificación multi-paso y orquestación de herramientas). La model card lo sitúa en el estado del arte entre los modelos abiertos de la clase ~30B en tareas agénticas. Se distribuye bajo licencia Apache 2.0, con soporte declarado de inglés y chino, pesos en safetensors y compatibilidad con `transformers` y text-generation-inference.

Su relevancia actual radica en que ofrece resultados competitivos frente a modelos frontera de tamaño similar (Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B) en benchmarks como Terminal-Bench 2.1, SWE-Bench Pro, Toolathlon-Verified o JobBench, con un coste de despliegue contenido para su clase. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer, familia Llama (etiqueta `llama`); no se detalla si es densa o MoE |
| Parámetros totales | 33.118.977.024 (~33,1 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en precisión original (no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 66,3 GB) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer de la familia Llama con 33,1 B de parámetros, afinado a partir de Nanbeige/Nanbeige4.3-33B-Base. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación; tampoco especifica innovaciones arquitectónicas concretas (atención lineal, decodificación especulativa, capas MoE u otras). Todo ello debe considerarse "no disponible".

Sí se documenta la estrategia de la serie: se construye primero un agente "profesor" de alta capacidad (este 33B) que sirve de ancla para destilar capacidades agénticas avanzadas en modelos más pequeños de la misma familia. En el plano operativo, el tokenizador incorpora una plantilla de chat configurable para escenarios de razonamiento y uso de herramientas: el flag `enable_thinking` controla si el modelo emite razonamiento explícito, y la evaluación de los benchmarks se realizó con `preserve_thinking=true`, es decir, conservando el bloque de razonamiento en el contexto de conversación.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento explícito con modo "thinking" activable y desactivable mediante `enable_thinking`, y preservación del bloque de razonamiento mediante `preserve_thinking`.
- Codificación agéntica: operación en terminal, resolución de incidencias sobre repositorios, generación de proyectos completos desde especificación en lenguaje natural y tareas de ciencia computacional.
- Tool calling y function calling: evaluado en Toolathlon-Verified (70,4) y Tau3-Bench (48,8), lo que indica uso competente de herramientas externas y APIs.
- Agentes multi-paso y planificación: evaluado en DeepPlanning (63,3), Automation Bench (54,2) y EnterpriseOps-Gym (41,0).
- Tareas profesionales transversales: JobBench cubre 35 ocupaciones distintas, con un rendimiento superior al de las referencias en la mayoría de ellas; GDPval alcanza 84,8.
- Capacidades matemáticas y de razonamiento científico: AIME 2026 (95,2) y GPQA Diamond (89,5).
- Multilingüismo limitado a inglés y chino; no se declara soporte de español ni de otras lenguas.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agente de codificación en terminal: el modelo puede ejecutar tareas de tipo Terminal-Bench (80,9 en la versión 2.1, 23,8 en la 4.0) dentro de arneses como mini-swe-agent o Terminus 2, lo que lo hace adecuado para automatizar tareas de shell y manipulación de ficheros en entornos de desarrollo.
- Resolución automática de incidencias en repositorios: con 60,3 en SWE-Bench Pro y 65,5 en DeepSWE, puede integrarse en pipelines de CI/CD para triar issues, localizar el código afectado y proponer parches que pasen la suite de tests.
- Generación de repositorios completos a partir de una especificación: 53,0 en NL2Repo, útil para prototipado rápido de proyectos y para generar esqueletos de código con estructura de directorios coherente.
- Automatización de flujos ofimáticos y "cowork" profesional: 54,2 en Automation Bench y 44,8 en JobBench permiten usarlo como asistente en tareas administrativas, elaboración de documentos y operaciones empresariales repetitivas.
- Orquestación de herramientas en asistentes corporativos: su rendimiento en Toolathlon-Verified (70,4) y Tau3-Bench (48,8) respalda su uso como planificador que decide qué API invocar y en qué orden en asistentes con múltiples herramientas.
- Planificación multi-paso y descomposición de objetivos: 63,3 en DeepPlanning lo sitúa como candidato para agentes que deben elaborar y ejecutar planes largos con dependencias entre pasos.
- Modelo profesor para destilación: es su función declarada dentro de la serie Nanbeige4.3; puede emplearse para generar trazas de razonamiento y demostraciones agénticas destinadas al entrenamiento de modelos de 3B.
- Evaluación de agentes y generación de datos sintéticos de alta calidad: su combinación de razonamiento explícito y uso de herramientas permite producir trayectorias etiquetadas para entrenamiento y para pruebas de regresión de sistemas agénticos.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card; todos los modelos se evalúan con la misma configuración de inferencia y el mismo arnés, a su máximo esfuerzo de razonamiento.

| Categoría | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Codificación agéntica | Terminal-Bench 2.1 | **80,9** | 73,0 | 61,8 | 47,2 |
| Codificación agéntica | Terminal-Bench 4.0 | **23,8** | 6,3 | 1,6 | 0,0 |
| Codificación agéntica | DeepSWE | **65,5** | 42,5 | 4,4 | 2,7 |
| Codificación agéntica | SWE-Bench Pro | 60,3 | **61,7** | 36,9 | 51,2 |
| Codificación agéntica | SWE-Atlas-QnA | **50,8** | 41,9 | 17,7 | 3,3 |
| Codificación agéntica | NL2Repo | **53,0** | 48,3 | 27,4 | 33,8 |
| Codificación agéntica | Scicode | **52,6** | 46,7 | 44,9 | 45,5 |
| Codificación agéntica | SkillsBench | **61,1** | 56,4 | 39,7 | 28,9 |
| Cowork agéntico | Automation Bench | **54,2** | 38,3 | 15,2 | 9,7 |
| Cowork agéntico | JobBench | **44,8** | 34,5 | 16,6 | 9,0 |
| Cowork agéntico | GDPval | 84,8 | **86,4** | 75,8 | 71,4 |
| Cowork agéntico | Claw-Eval (pass^3) | **78,3** | 75,2 | 57,3 | 44,2 |
| Cowork agéntico | Toolathlon-Verified | **70,4** | 68,5 | 47,2 | 27,8 |
| Cowork agéntico | DeepPlanning | **63,3** | 49,2 | 21,4 | 19,4 |
| Cowork agéntico | EnterpriseOps-Gym | **41,0** | 40,2 | 30,5 | 27,3 |
| Cowork agéntico | YC-bench | **1.025.437 USD** | 641.290 USD | 513.978 USD | 265.152 USD |
| Cowork agéntico | Tau3-Bench | **48,8** | 48,5 | 33,7 | 18,6 |
| Razonamiento | GPQA Diamond | 89,5 | 89,2 | 83,5 | **91,3** |
| Razonamiento | AIME 2026 | **95,2** | 94,5 | 94,7 | 89,2 |
| Razonamiento | AA-LCR | **84,0** | 82,0 | 83,3 | 72,0 |

Notas de evaluación declaradas: Terminal-Bench 2.1 con Terminus 2; Terminal-Bench 4.0 y DeepSWE con mini-swe-agent v2.4.6; SWE-Atlas-QnA con mini-swe-agent v2.4.6 y GPT-6 Sol como juez sobre 1.304 rúbricas; NL2Repo con Claude Code; JobBench con el arnés de Claude Code y herramienta de búsqueda; Claw-Eval solo sobre el subconjunto General (157 tareas de un turno); Toolathlon-Verified sin límite de `max_tokens` por petición; YC-bench conservando únicamente los 10 turnos más recientes de diálogo.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 los pesos ocupan aproximadamente 66 GB, a los que hay que sumar la caché KV; en cuantización de 8 bits, unos 33 GB; en 4 bits, en torno a 17-18 GB. Son estimaciones derivadas del número de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para servir el modelo en BF16 sin cuantizar; A100 40 GB o 2× RTX 4090 en 8 bits; RTX 4090, RTX 3090 o L40S en 4 bits.
- ¿Cabe en GPU de consumo? En BF16 no cabe en ninguna GPU de consumo actual. En 4 bits sí cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) y en algunas de 32 GB, siempre con cuantización posterior y margen ajustado para la caché KV.
- Opciones de despliegue: `transformers` de forma nativa; vLLM para serving de alto rendimiento; text-generation-inference (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que permite desplegarlo en HuggingFace Inference Endpoints). llama.cpp u Ollama requerirían convertir los pesos a GGUF, ya que no se publican cuantizaciones de ese formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Perfil |
|---|---|---|---|---|---|
| Nanbeige4.3-33B | 33,1 B | no disponible | Apache 2.0 | HuggingFace (safetensors) | Agente "profesor" orientado a codificación y cowork |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Referencia fuerte en SWE-Bench Pro y GDPval |
| Muse-Glimmer-30B | no disponible | no disponible | no disponible | no disponible | Rendimiento inferior en la mayoría de benchmarks agénticos |
| Gemma4-31B | no disponible | no disponible | no disponible | no disponible | Mejor en GPQA Diamond, peor en tareas agénticas |
| Nanbeige4.3-33B-Base | 33,1 B (implícito) | no disponible | Apache 2.0 | HuggingFace | Modelo base sobre el que se afina este modelo |

En la comparación directa, Nanbeige4.3-33B lidera 17 de los 20 benchmarks reportados; cede en SWE-Bench Pro (60,3 frente a 61,7 de Qwen3.8-27B), GDPval (84,8 frente a 86,4) y GPQA Diamond (89,5 frente a 91,3 de Gemma4-31B). Las mayores ventajas se concentran en Terminal-Bench 4.0 (+17,5 puntos sobre Qwen3.8-27B), DeepSWE (+23,0) y DeepPlanning (+14,1). No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida a inglés y chino; no se declara ni evalúa el rendimiento en español, por lo que su uso en producción en castellano requiere validación propia.
- La longitud de contexto no se especifica, lo que impide planificar con garantías casos de uso con documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a los modelos generativos; los resultados agénticos no eximen de verificar código, comandos de terminal y acciones sobre sistemas reales antes de ejecutarlos.
- Los benchmarks son autoinformados por el autor, con arneses concretos (Terminus 2, mini-swe-agent v2.4.6, Claude Code) y en algunos casos con modelos jueces de terceros (GPT-6 Sol); no se han reproducido de forma independiente y la comparación entre modelos depende de esa configuración.
- Los resultados se obtuvieron con `preserve_thinking=true`; desactivar el razonamiento explícito o truncar el bloque de pensamiento puede degradar el rendimiento de forma significativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y está publicado por eyes-ml a partir del base de Nanbeige: conviene verificar la procedencia y las diferencias respecto al modelo original de Nanbeige antes de adoptarlo.
- La licencia Apache 2.0 permite uso comercial, incluida la modificación y redistribución, con las obligaciones habituales de conservar el aviso de copyright y la licencia, y de indicar cambios.
- No se publican cuantizaciones oficiales; cualquier versión en 4 u 8 bits debe generarse y validarse internamente, asumiendo la posible pérdida de calidad en tareas agénticas de muchos pasos.
- El tamaño de 33 B implica costes de serving no triviales: no cabe en una GPU de consumo sin cuantización agresiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eyes-ml/Nanbeige4.3-33B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Papers, blogs, repositorios de código y demos: no disponibles; la búsqueda web no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a términos no relacionados).
