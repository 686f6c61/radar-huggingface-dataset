# CyberBuddyAI/CyberBuddy-CyberOps-9B-GGUF

## Resumen

CyberBuddy-CyberOps-9B-GGUF es la distribucion en formato GGUF del modelo CyberBuddy-CyberOps-9B, un ajuste fino de Qwen3.5-9B orientado a tareas de seguridad informatica (red team, blue team, pentesting y CTF) y publicado por CyberBuddyAI. El modelo base es Qwen3.5-9B de Alibaba Cloud, con licencia Apache-2.0, y la variante aqui descrita esta cuantizada para su ejecucion en llama.cpp, LM Studio y Ollama.

El ajuste se ha realizado con la herramienta Heretic y aplica tecnicas de "abliteration" (eliminacion de rechazos) y modificaciones del comportamiento alineado, de modo que el modelo no rechaza peticiones relacionadas con seguridad ofensiva. Mantiene capacidades multimodales (entrada de imagen), tool calling nativo y modo de razonamiento (thinking) activable o desactivable. El contexto declarado en la configuracion de ejemplo alcanza 65.536 tokens con la cuantizacion Q4_K_M.

La relevancia de esta ficha radica en que el modelo no esta pensado para uso general: su proposito declarado es el trabajo de seguridad autorizado, con advertencias explicitas del autor sobre el uso legal y la necesidad de supervision humana. La distribucion GGUF incluye varias tallas de cuantizacion (de Q3_K_M a Q8_0) mas un proyector de vision independiente, lo que permite desplegarlo en GPU de consumo desde 6 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; identificador de arquitectura en Ollama: `qwen35`) |
| Parametros totales | 9B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (configuracion de ejemplo con Q4_K_M); 32.768 en el ejemplo con vision |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M (con embeddings en 8 bits), Q5_K_M, Q6_K, Q8_0; proyector de vision en f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors bf16 en el repositorio principal) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, una arquitectura transformer de la familia Qwen3.5 desarrollada por Alibaba Cloud. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO especificas. El ajuste declarado se ha realizado con Heretic, herramienta que modifica el comportamiento de rechazo del modelo (abliteration) y que el autor describe como "refusal-removal".

Las innovaciones tecnicas documentadas en la model card se limitan al plano de la inferencia y el ajuste: soporte de modo thinking activable o desactivable, tool calling nativo con parseo de `tool_calls` en formato OpenAI al servir con `--jinja`, entrada multimodal mediante un proyector `mmproj` independiente, y una receta de cuantizacion personalizada para Q4_K_M que mantiene los embeddings de tokens en 8 bits para preservar calidad en GPU de 8 GB. Los pesos se generaron con llama.cpp build `b12327`.

## Capacidades

- Generacion de texto y razonamiento, con modo thinking que puede activarse o desactivarse.
- Conocimiento orientado a seguridad informatica: pentesting, red team, blue team, analisis de vulnerabilidades y CTF.
- Tool calling y function calling nativo con salida compatible con OpenAI cuando se sirve con `--jinja`.
- Capacidades agenticas y de razonamiento multi-paso (segun los tags del autor).
- Vision: lectura de imagenes mediante el proyector `mmproj` (pipeline image-text-to-text).
- No aplica rechazo (uncensored/abliterated), por diseno.
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Pentesting autorizado: el modelo puede generar hipotesis de ataque, comandos de enumeracion y guiones de explotacion en entornos con permiso escrito, aprovechando su ausencia de rechazos y su conocimiento de tecnicas ofensivas.
- Analisis en blue team: triaje de alertas, redaccion de reglas de deteccion (Sigma, YARA) y resumen de artefactos forenses a partir de texto o capturas de pantalla gracias a la entrada de imagen.
- Preparacion de CTF: resolucion guiada de retos de reversing, criptografia o web, con el modo thinking activado para razonamientos largos.
- Automatizacion agentica de reconocimiento: integracion en pipelines con tool calling para encadenar llamadas a escaneres y parsear resultados con contexto de 64k tokens.
- Asistente de laboratorio de investigacion: analisis de trazas y configuraciones de sistemas propios, con despliegue local en llama.cpp u Ollama para mantener los datos dentro de la infraestructura.
- Formacion y concienciacion: generacion de escenarios de ataque simulados y material didactico en entornos controlados, con supervision humana.
- Redaccion de informes tecnicos de seguridad: sintesis de hallazgos y recomendaciones a partir de notas y evidencias, incluyendo imagenes de paneles o capturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q3_K_M ~4,3 GB; Q4_K_M (recomendada) ~5,5 GB; Q5_K_M ~6,3 GB; Q6_K ~7,3 GB; Q8_0 ~9,4 GB; proyector de vision f16 ~0,9 GB adicional.
- GPU de consumo: la Q3_K_M cabe en GPU de 6 GB; la Q4_K_M en 8 GB con contexto de 64k; Q5_K_M en 10-12 GB; Q6_K en 12 GB; Q8_0 en 12-16 GB.
- GPU profesionales: no se especifican modelos concretos (A100, H100) en la informacion disponible; el modelo esta pensado para hardware de consumo.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y Ollama. Ollama solo soporta texto (no carga el proyector de vision) y requiere una version reciente con soporte de la arquitectura `qwen35`.
- Parametros de inferencia recomendados por el autor: `--reasoning off`, `--temp 0`, `-fa on` (flash attention), `-ngl 99`; para vision, contexto de 32.768 en el ejemplo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| CyberBuddy-CyberOps-9B-GGUF | 9B | 65.536 (config. ejemplo) | Seguridad ofensiva/defensiva, sin rechazos, vision | Apache-2.0 | GGUF |
| Qwen3.5-9B (base) | 9B | no disponible | Proposito general, alineado | Apache-2.0 | safetensors, GGUF |
| Alternativas de seguridad afinadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo no rechaza peticiones: el autor advierte explicitamente que solo debe usarse para trabajo de seguridad legal y autorizado, con supervision humana en cualquier accion real.
- Riesgo elevado de generacion de contenido ofensivo o danino si se usa fuera de un marco etico y legal; no es apto para uso general ni para atencion al cliente o produccion no relacionada con seguridad.
- Riesgo de alucinacion en detalles tecnicos (comandos, versiones, CVE) inherente a los modelos de 9B; requiere verificacion.
- Capacidades multilingues limitadas al ingles segun la model card; el castellano no esta declarado como soportado.
- La modificacion del comportamiento de rechazo puede degradar otras capacidades del modelo base; no hay benchmarks publicados que lo cuantifiquen.
- Ollama no soporta la entrada de vision en esta distribucion; para imagenes hay que usar llama.cpp con `--mmproj`.
- Licencia Apache-2.0 permite uso comercial, pero el propio autor restringe el uso a fines autorizados; el cumplimiento legal es responsabilidad del desplegador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/CyberBuddyAI/CyberBuddy-CyberOps-9B-GGUF
- Repositorio principal (bf16, model card completa, tablas de VRAM): https://huggingface.co/CyberBuddyAI/CyberBuddy-CyberOps-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta Heretic: https://github.com/p-e-w/heretic
