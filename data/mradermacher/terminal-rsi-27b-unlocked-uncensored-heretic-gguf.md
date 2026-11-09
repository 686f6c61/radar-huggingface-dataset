# mradermacher/Terminal-RSI-27B-Unlocked-Uncensored-Heretic-GGUF

## Resumen

Terminal-RSI-27B-Unlocked-Uncensored-Heretic es un modelo de lenguaje de aproximadamente 26.900 millones de parametros, desarrollado originalmente por SolsticeAI y cuantizado a formato GGUF por mradermacher. El modelo esta especializado en tareas de agente de terminal y codigo, con un enfoque declarado en aprendizaje por refuerzo (reinforcement learning) y auto-mejora recursiva (recursive self-improvement, RSI). Su nombre incluye las etiquetas "Unlocked", "Uncensored", "Heretic" y "abliterated", lo que indica que ha sido sometido a un proceso de eliminacion de rechazos y desalineacion de seguridad respecto al modelo base.

La arquitectura declarada en las etiquetas es qwen3_5, es decir, una variante de la familia Qwen 3.5, con soporte de contexto largo y capacidades multimodales (el repositorio incluye ficheros mmproj para vision). El modelo esta entrenado y orientado principalmente a los idiomas ingles y chino, y se distribuye bajo licencia Apache 2.0. La version aqui descrita es la cuantizacion estatica en GGUF publicada por mradermacher, que abarca desde Q2_K hasta Q8_0, ademas de los suplementos multimodales.

La relevancia de esta ficha radica en que se trata de una publicacion reciente (noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, lo que sugiere un modelo de nicho o experimental. La model card del cuantizador es puramente tecnica (lista de cuantizaciones) y no incluye datos de entrenamiento, benchmarks ni detalles de arquitectura mas alla de las etiquetas, por lo que buena parte de las especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en qwen3_5 (segun etiqueta del autor); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la etiqueta "long-context" sugiere ventana extendida, sin cifra) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen3_5, que apunta a una familia de transformers densos de la serie Qwen 3.5. El modelo incorpora un componente multimodal, evidenciado por la presencia de ficheros mmproj (multi-modal projection) en el repositorio GGUF, lo que indica capacidad de procesamiento de imagenes junto con texto. No se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones de eficiencia.

En cuanto al entrenamiento, las etiquetas mencionan reinforcement-learning, recursive-self-improvement y terminal-agent, y se referencia el paper arXiv:2610.22192. Sin embargo, la model card del cuantizador no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El proceso "Heretic"/"abliterated" implica una modificacion post-entrenamiento para eliminar comportamientos de rechazo, pero no se documenta la metodologia concreta en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino.
- Generacion y manipulacion de codigo, con enfasis en tareas de terminal y linea de comandos (etiqueta terminal-agent).
- Capacidades multimodales: los ficheros mmproj permiten entrada de imagenes junto con texto.
- Soporte de contexto largo (etiqueta long-context), aunque sin cifra publicada.
- Orientado a flujos de agente y ejecucion multi-paso en entornos de terminal.
- Modelo "uncensored"/"abliterated": no aplica rechazos de seguridad convencionales, lo que amplia el rango de respuestas generadas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Automatizacion de tareas de terminal: el modelo puede interpretar instrucciones en lenguaje natural y generar comandos de shell, scripts de administracion o secuencias de despliegue, aprovechando su especializacion como terminal-agent.
- Asistencia en desarrollo de software: generacion y refactorizacion de codigo en pipelines de CI/CD, con capacidad de mantener contexto largo en conversaciones multi-turno sobre un repositorio.
- Agentes autonomos de resolucion de problemas: su entrenamiento declarado en RL y auto-mejora recursiva lo hace adecuado para bucles de planificacion-ejecucion-verificacion en entornos controlados.
- Analisis de capturas de pantalla o diagramas tecnicos: gracias al componente multimodal (mmproj), puede procesar imagenes junto con texto para tareas de documentacion o diagnostico.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, sirve como objeto de estudio para analizar comportamientos sin rechazos y comparar con variantes alineadas.
- Procesamiento bilingue ingles-chino: traduccion tecnica, atencion al cliente o generacion de documentacion en ambos idiomas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (15,7-16,6 GB) permiten ejecucion local en GPUs de gama alta para prototipado y pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos, sin contar cache KV): Q2_K ~10,8 GB; Q3_K_S ~12,2 GB; Q3_K_M ~13,4 GB; Q3_K_L ~14,4 GB; Q4_K_S ~15,7 GB; Q4_K_M ~16,6 GB; Q5_K_S ~18,8 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB.
- Para contexto largo debe anadirse VRAM adicional para la cache KV, cuyo tamano exacto no es calculable sin conocer el numero de capas y cabezas (no disponible).
- GPUs recomendadas: Q4_K_M encaja en una RTX 4090 (24 GB) o RTX 3090; Q6_K y Q8_0 requieren A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en modelos con 16-24 GB de VRAM usando cuantizaciones Q3 a Q4; las Q5-Q8 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj requieren soporte multimodal del runtime (por ejemplo, llama.cpp con proyeccion visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Terminal-RSI-27B-Unlocked-Uncensored-Heretic (este) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Especializado en terminal-agent, abliterated, multimodal |
| Qwen 2.5 Coder 32B | 32,5 B | 128 K | Apache 2.0 | safetensors, GGUF | Referencia en generacion de codigo, sin componente abliterated |
| Gemma 2 27B | 27 B | 8 K | Gemma Terms | safetensors, GGUF | Tamano comparable, contexto mas corto, licencia no comercial restrictiva |
| Mistral Small 24B | 24 B | 128 K | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamano similar, sin especializacion en terminal |

Nota: los datos de los modelos comparables corresponden a conocimiento general de la familia; no se dispone de benchmarks del modelo evaluado para una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica filtros de seguridad convencionales, por lo que puede generar contenido danino, ilegal o sesgado; no recomendado para produccion orientada al publico sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion: no hay benchmarks publicados que validen su fiabilidad en tareas factuales.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto no especificada: no es posible planificar despliegues de contexto largo con garantias.
- Especializacion en terminal-agent: puede generar comandos peligrosos si se ejecuta sin sandbox ni supervision humana.
- Licencia Apache 2.0 permite uso comercial, pero el caracter abliterated traslada al usuario la responsabilidad legal y etica del contenido generado.
- Repositorio con cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria, sin issues resueltos y sin garantia de mantenimiento.
- El cuantizador advierte que no hay cuantizaciones ponderadas/imatrix disponibles, lo que puede afectar a la calidad relativa de las cuantizaciones bajas (Q2, Q3).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Terminal-RSI-27B-Unlocked-Uncensored-Heretic-GGUF
- Modelo base original: https://huggingface.co/SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Terminal-RSI-27B-Unlocked-Uncensored-Heretic-GGUF
- Paper referenciado: arXiv:2610.22192 (https://arxiv.org/abs/2610.22192)
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
