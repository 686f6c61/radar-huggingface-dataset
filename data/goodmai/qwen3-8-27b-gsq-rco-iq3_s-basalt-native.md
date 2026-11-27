# goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native es una conversión de cuantización del modelo Qwen/Qwen3.8-27B, publicada por el usuario goodmai bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado: el autor ha tomado un fichero GGUF previamente cuantizado (IQ3_S con esquema GSQ-RCO) y lo ha convertido a safetensors nativos fragmentados en tres shards, preservando los super-bloques no uniformes para ejecución directa sobre Metal sin recuantización. La herramienta empleada es Basalt, un runtime en Swift para Apple Silicon que evita la dependencia de Python.

El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3.5 según los tags del repositorio, aunque la model card no aporta detalles sobre arquitectura, datos de entrenamiento ni longitud de contexto. El dato real de safetensors indica 11.729.317.376 parámetros, muy por debajo de los 27B que sugiere el nombre, lo que es coherente con un artefacto cuantizado a aproximadamente 3 bits efectivos (11,8 GB de repositorio para esos parámetros).

Su relevancia es acotada pero concreta: ofrece un punto de despliegue listo para macOS en Apple Silicon con un footprint de 11,76 GB, lo que permite ejecutar un modelo de la clase 27B en equipos con 24 GB de memoria unificada, como el M4 Pro citado en la model card. Es un artefacto orientado a inferencia local en el ecosistema MLX/Metal, no a entrenamiento ni a servidores Linux con GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, familia qwen3_5 según tags) |
| Parametros totales | 11.729.317.376 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S con esquema GSQ-RCO (super-bloques no uniformes), etiquetado 8-bit en los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards), conversión nativa desde GGUF; runtime MLX / Basalt |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada: ni tipo de transformer, ni si emplea mezcla de expertos, atención lineal o mecanismos híbridos. Tampoco hay datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si se aplicaron fases de RLHF o DPO.

Lo que sí está documentado es el proceso de conversión. El autor partió de un GGUF cuantizado con IQ3_S y esquema GSQ-RCO y lo transformó mediante `basalt models convert --grid native` en safetensors fragmentados que preservan exactamente los super-bloques no uniformes originales. Esto evita la recuantización y permite que los kernels Metal (`GGUFLinear` / `IQMetalKernels`) ejecuten los pesos tal cual. La innovación técnica, por tanto, no está en el modelo sino en el pipeline de conversión y en el runtime Basalt v0.11.0, escrito en Swift 6.4 para macOS 27 o superior, sin Python.

## Capacidades

- Generación de texto conversacional: la model card incluye un botón de lanzamiento con `role=chat`, lo que indica uso previsto para diálogo.
- Toma de decisiones estructuradas: el autor reporta una métrica propia, "System One Structured Decisions", con 300/300 aciertos (100,0 %), aunque no se detalla la naturaleza exacta de la tarea.
- Ejecución local nativa en Apple Silicon mediante Metal, sin capa de Python.
- Servicio REST: el comando `basalt serve --model ... --rest` expone el modelo como endpoint HTTP.
- Capacidades de tool calling, agentes, visión, audio, matemáticas o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede servirse con `basalt serve --rest` en un Mac con Apple Silicon y 24 GB de memoria unificada, ofreciendo un endpoint HTTP para integrar en aplicaciones de escritorio sin depender de la nube.
- Prototipado de agentes en estación de trabajo: al exponer una API REST, encaja en flujos de desarrollo donde se quiere iterar sobre prompts y lógica de agente con un modelo de clase 27B cuantizado, evitando costes de API externa durante las pruebas.
- Evaluación de calidad de cuantización: investigadores que comparan esquemas IQ3_S frente a alternativas de 4 bits (GPTQ, RTN affine) pueden reproducir la métrica de perplejidad reportada (4,169 en ventana de 16k) sobre su propio corpus.
- Inferencia offline en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para escenarios donde los datos no pueden salir del dispositivo, como borradores de documentación interna o análisis de texto sensible.
- Desarrollo de aplicaciones Swift nativas: al integrarse con Basalt, encaja en proyectos macOS escritos en Swift que necesiten un motor de generación de texto sin puentes hacia Python.
- Banco de pruebas para kernels Metal: el formato preserva los super-bloques IQ3_S, lo que lo convierte en un caso de validación para quienes desarrollan o depuran kernels de cuantización no uniforme sobre Metal.
- Distribución de modelos cuantizados en formato safetensors: útil para pipelines que ya trabajan con safetensors y quieren evitar la manipulación de GGUF, manteniendo el mismo comportamiento numérico.

## Benchmarks y rendimiento

| Metrica | Valor reportado | Referencia |
|---|---|---|
| Footprint en disco | 11,76 GB (3 shards) | — |
| Perplejidad media a 16k (pplMean16k) | 4,169 | 4,130 del teacher GPTQ 4-bit (+0,9 %); 4,702 del RTN affine 3-bit |
| System One Structured Decisions | 300/300 (100,0 %) | — |
| Hardware de medida | Apple M4 Pro, 24 GB | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11,76 GB de pesos, más overhead de contexto y runtime; la model card lo ejecuta en un M4 Pro con 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con Metal; el autor cita explícitamente el M4 Pro de 24 GB. No hay datos para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: sí, en el ecosistema Apple Silicon; no se documenta soporte para RTX 4090 u otras tarjetas discretas.
- Opciones de despliegue: Basalt v0.11.0 (macOS 27+, Swift 6.4), con modo servidor REST mediante `basalt serve --rest`. El tag `mlx` sugiere compatibilidad con el ecosistema MLX, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native | 11,73 B (safetensors) | no disponible | IQ3_S / GSQ-RCO | Apache 2.0 | Apple Silicon (Metal, Basalt) |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | pesos completos | Apache 2.0 (según herencia) | multiplataforma |
| GPTQ 4-bit teacher (citado en la model card) | no disponible | no disponible | 4-bit GPTQ | no disponible | no disponible |
| RTN affine 3-bit (citado en la model card) | no disponible | no disponible | 3-bit affine | no disponible | no disponible |

La comparativa cuantitativa disponible se limita a la perplejidad: este artefacto (4,169) queda un 0,9 % por encima del teacher GPTQ 4-bit (4,130) y mejora claramente al RTN affine 3-bit (4,702). No hay datos de benchmarks de tarea que permitan comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de cuantización, no un modelo original: hereda los sesgos y limitaciones del Qwen3.8-27B subyacente, que no están documentados en la información disponible.
- La cuantización IQ3_S introduce una degradación medible: +0,9 % de perplejidad frente al teacher de 4 bits. En tareas sensibles a precisión numérica (código, matemáticas) el impacto puede ser mayor que el que sugiere la perplejidad agregada.
- Riesgo de alucinación: no evaluado en la documentación; debe asumirse el comportamiento típico de un modelo de lenguaje sin datos específicos.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable fuera del inglés o el chino sin verificación empírica.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta.
- Dependencia de plataforma: el runtime Basalt está atado a macOS 27+ y Apple Silicon; no es desplegable en Linux ni en GPU NVIDIA con las herramientas indicadas.
- Métrica "System One Structured Decisions" sin definición pública: los 300/300 no son interpretables ni reproducibles sin la especificación de la tarea.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen3.8-27B antes de redistribuir en producción.
- Repositorio con 0 likes y 225 descargas en el momento de la ficha: ecosistema de validación muy reducido, sin evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Basalt: https://github.com/goodmai/basalt
- Release Basalt v0.11.0: https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Sitio web de Basalt: https://bas-alt.vercel.app
- Demo de lanzamiento (chat): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native&role=chat
- Demo de lanzamiento (inglés): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native&role=chat&lang=en
