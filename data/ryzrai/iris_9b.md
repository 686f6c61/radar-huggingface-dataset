# ryzrAI/Iris_9B

## Resumen

Iris 9B es un modelo de lenguaje desarrollado por Virtual Eyes (publicado en Hugging Face bajo la cuenta ryzrAI) especializado en ciberseguridad y disenado para soportar flujos de trabajo agenticos de largo horizonte. Se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M para su uso con llama.cpp, acompanado de un proyector multimodal en BF16, lo que indica capacidades de vision integradas en el modelo.

El modelo cuenta con 9.197.093.888 parametros totales y una longitud de contexto original de 262.144 tokens, ampliable mediante escalado YaRN RoPE (factor 4x) hasta un limite configurado de 1.048.576 tokens. Segun la model card, la guia subyacente corresponde a Qwen3.5-9B, lo que situa a Iris 9B en la familia arquitectonica de Qwen, aunque el autor no detalla el proceso de ajuste ni los datos utilizados.

Su relevancia actual radica en la combinacion de una ventana de contexto muy extensa, capacidades multimodales y un enfoque declarado en ciberseguridad y agentes autonomos, todo ello empaquetado para inferencia local con llama.cpp. No obstante, la ausencia de benchmarks publicados, de licencia explicita y de documentacion sobre el entrenamiento limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B, segun la model card) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens original; 1.048.576 configurado con YaRN 4x (no validado a esa longitud) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); proyector mmproj GGUF BF16 |

## Arquitectura y entrenamiento

La model card indica que Iris 9B se basa en Qwen3.5-9B, por lo que hereda una arquitectura transformer decoder-only de aproximadamente 9,2 mil millones de parametros. El modelo incorpora un proyector multimodal (mmproj) en BF16, lo que sugiere la integracion de un codificador visual para tareas de imagen a texto, aunque el autor no especifica que codificador utiliza ni como se realizo la fusion de modalidades.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. El autor declara un enfoque en ciberseguridad y en flujos agenticos de largo horizonte, pero no documenta el corpus ni la metodologia de ajuste. La extension de contexto se implementa mediante escalado YaRN RoPE con factor 4x sobre la ventana original de 262.144 tokens; el autor advierte explicitamente que el modelo no ha sido validado a la longitud maxima configurada de 1.048.576 tokens.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte de plantilla de chat Jinja.
- Razonamiento agentico de largo horizonte, segun la declaracion del autor, orientado a tareas de multiples pasos.
- Capacidades multimodales: el repositorio incluye un proyector `mmproj-Iris-9B-BF16.gguf` para entrada de imagenes via llama.cpp.
- Especializacion declarada en ciberseguridad (el autor no detalla que tareas concretas cubre).
- Soporte de contexto muy extenso (262.144 tokens nativos; hasta 1.048.576 con YaRN, no validado).
- Compatibilidad con la API OpenAI (`/v1/chat/completions`) a traves de llama-server.
- Endpoint de metricas compatible con Prometheus (`/metrics`) y health check (`/health`) en el servidor de referencia.
- Soporte de tool calling / function calling: no disponible (no se documenta explicitamente).
- Capacidades multilingues: no disponible (no se especifican idiomas).

## Casos de uso

- Analisis de trazas y logs de seguridad: el modelo puede procesar ventanas de hasta 262.144 tokens, lo que permite ingerir grandes volumenes de logs, alertas SIEM o trazas de red en una sola pasada para correlacionar eventos y detectar patrones anomalos.
- Triaje de alertas en SOC: con temperatura 0,0 (decodificacion greedy) y contexto largo, puede clasificar y priorizar alertas de forma determinista, integrado via API OpenAI-compatible en plataformas de orquestacion de seguridad.
- Analisis de documentos tecnicos extensos: informes de auditoria, politicas de seguridad o RFCs de miles de paginas caben en la ventana de contexto, permitiendo resumenes y extraccion de requisitos sin fragmentacion.
- Agentes autonomos de reconocimiento: el enfoque declarado en flujos agenticos de largo horizonte lo hace apto para pipelines de reconocimiento y enumeracion que requieren mantener estado a lo largo de muchas iteraciones.
- Asistente de respuesta a incidentes: combinando el contexto largo con el proyector multimodal, puede analizar capturas de pantalla de consolas, diagramas de red o paneles de monitorizacion junto con texto de runbooks.
- Despliegue local en entornos air-gapped: al distribuirse en GGUF para llama.cpp, puede ejecutarse en infraestructura aislada sin dependencia de APIs externas, requisito habitual en entornos de ciberseguridad sensibles.
- Generacion de codigo de automatizacion de seguridad: scripts de parsing, reglas de deteccion o playbooks de respuesta, aunque no se documenta soporte explicito de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas especificas de ciberseguridad, ni comparaciones con modelos de referencia. El autor solo menciona que las respuestas fueron evaluadas con decodificacion greedy (`temperature: 0.0`) y `max_tokens: 1024`, sin reportar puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 6,7 GB (tamano total del repo), por lo que los pesos requieren en torno a 6-7 GB de VRAM. A esto hay que sumar la cache KV, que con `--cache-type-k q8_0 --cache-type-v q8_0` y contexto de 262.144 tokens puede consumir decenas de GB adicionales.
- El proyector multimodal en BF16 anade requisitos adicionales de memoria si se carga con `--mmproj`.
- GPU recomendadas: para contexto completo de 262.144 tokens se requiere hardware de gama alta con gran capacidad de memoria (A100 80 GB, H100 80 GB) o configuraciones multi-GPU. Para contextos reducidos, una RTX 4090 (24 GB) puede alojar los pesos y una ventana moderada.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) solo si se reduce `num_ctx` sustancialmente; el autor advierte que si el modelo no carga o es demasiado lento, se disminuya `num_ctx`.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (el repositorio incluye un archivo `params` que fija `num_ctx` a 262.144, temperatura 0 y `num_predict` 1.024), y cualquier runtime compatible con GGUF. Se documenta compatibilidad con la API OpenAI.
- Latencia y throughput: no disponibles. El autor solo indica que las pruebas se realizaron con la build CUDA `llama.cpp-upstream-20261114` y `llama-server`, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Iris 9B | 9,2 B | 262.144 (1.048.576 con YaRN, no validado) | GGUF Q4_K_M + mmproj BF16 | no disponible | Especializado en ciberseguridad y agentes; sin benchmarks |
| Qwen3.5-9B | ~9 B | 262.144 (segun la guia citada por el autor) | safetensors, GGUF | no disponible en esta ficha | Modelo base declarado de Iris; referencia arquitectonica |
| Alternativas de ~9 B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion con Qwen3.5-9B es la unica referencia directa disponible, ya que el autor cita explicitamente su guia como base. No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria en terminos de rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en ninguna tarea, incluida la ciberseguridad que el autor declara como especialidad.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. Esto es un bloqueante para produccion.
- Idiomas no documentados: se desconoce el soporte multilingue real y la calidad en castellano.
- Contexto extendido no validado: el autor advierte que el modelo no ha sido validado a 1.048.576 tokens; la calidad a contextos muy largos es incierta y los requisitos de memoria pueden ser prohibitivos.
- Riesgo de alucinacion: no cuantificado ni documentado; en tareas de ciberseguridad, una alucinacion puede derivar en falsos negativos o acciones erroneas.
- Sesgos conocidos: no documentados.
- Procedencia del entrenamiento opaca: no se detalla el corpus, el metodo de ajuste ni si se aplicaron filtros de seguridad. La especializacion en ciberseguridad podria implicar riesgos de uso dual (generacion de exploits, evasion de deteccion) sin que se documenten salvaguardas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- El endpoint de metricas y la configuracion de referencia estan pensados para despliegue local en localhost; no se documenta hardening para exposicion publica.
- La temperatura recomendada de 0,0 (greedy) limita la diversidad de respuestas y puede no ser adecuada para tareas creativas o de exploracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryzrAI/Iris_9B
- Guia del modelo base citada por el autor (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de llama.cpp (runtime recomendado): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Demos: no disponible
