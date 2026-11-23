# mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF es la version cuantizada en formato GGUF, generada con imatrix, del modelo xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF, y el resultado esta pensado para ejecucion local en CPU/GPU con llama.cpp y derivados. El modelo base es un fine-tuning tipo LoRA/SFT sobre una arquitectura de la familia Qwen 3.5, con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones).

La propuesta del modelo es un asistente de codigo y agente conversacional con modo de razonamiento explicito (chain-of-thought), soporte de tool calling y function calling, y una orientacion deliberada a la ausencia de filtros de rechazo (etiquetas "uncensored", "decensored", "abliterated", "heretic"). Se ha entrenado con trazas de razonamiento de agentes (datasets de trazas de Claude Opus y de trazas de agente de Hermes) y declara capacidades de multi-token prediction y speculative decoding, ademas de estar marcado como modelo de vision en la model card del cuantizador.

Es relevante por su tamano contenido: un modelo de 4B con contexto de agente, tool use y modo thinking cabe en GPUs de consumo y en equipos con poca VRAM usando las cuantizaciones i1 de 2-4 GB. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de benchmarks publicados obliga a evaluarlo empiricamente antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (fine-tuning LoRA/SFT sobre base Qwen 3.5, segun tags) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix incluido |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen 3.5, afinado mediante LoRA y SFT sobre el modelo xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic. Los tags indican el uso de Unsloth para el entrenamiento y la inclusion de datasets de trazas de razonamiento: Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. Esto sugiere un entrenamiento orientado a imitar cadenas de razonamiento de agentes y a reforzar el uso de herramientas.

Entre las innovaciones declaradas estan el multi-token prediction (MTP) y la decodificacion especulativa, que pueden acelerar la generacion en entornos compatibles. El proceso de "abliteration"/"decensoring" (etiquetas heretic, uncensored, decensored) implica una modificacion de los pesos orientada a eliminar el comportamiento de rechazo aprendido, lo que afecta a la distribucion de respuestas en temas sensibles. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni la existencia de fases de RLHF o DPO. La cuantizacion i1 de mradermacher emplea ficheros imatrix para mejorar la calidad de las cuantizaciones de baja tasa de bits.

## Capacidades

- Generacion de texto y codigo, con especializacion declarada en tareas de programacion (tag "coder").
- Razonamiento explicito con chain-of-thought (modo thinking).
- Tool calling y function calling para integracion en pipelines de agentes.
- Razonamiento multi-paso orientado a agentes, entrenado con trazas de agente de Hermes.
- Capacidades multilingues en ingles, chino, espanol, ruso y japones.
- Marcado como modelo de vision en la model card del cuantizador (los ficheros mmproj, si existen, estarian en el repositorio estatico).
- Multi-token prediction y soporte de decodificacion especulativa segun los tags del autor.
- Comportamiento sin filtros de rechazo (uncensored/abliterated), lo que cambia la gestion de peticiones sensibles.

## Casos de uso

- Asistencia de programacion en local: el modelo puede autocompletar y explicar codigo en un portatil con GPU de consumo usando la cuantizacion i1-Q4_K_M (2,9 GB), lo que permite entornos de desarrollo sin conexion y sin enviar codigo a servicios externos.
- Agente de automatizacion con tool calling: su entrenamiento con trazas de agente y su soporte de function calling permiten construir agentes que invocan APIs, consultan bases de datos o ejecutan comandos en flujos multi-paso.
- Razonamiento con cadena de pensamiento para depuracion: el modo thinking explicito facilita tareas de analisis de errores, explicacion de stack traces y propuesta de parches razonados.
- Procesamiento multilingue en espanol, chino, ruso y japones: util para equipos que necesitan un unico modelo local que cubra documentacion tecnica y conversacion en varios idiomas.
- Prototipado de asistentes conversacionales sin restricciones de contenido: en entornos de investigacion sobre seguridad, el comportamiento "abliterated" permite estudiar respuestas sin filtros, con las precauciones eticas correspondientes.
- Despliegue en edge y entornos con VRAM limitada: las cuantizaciones de 2,1-3,7 GB permiten ejecutar el modelo en GPUs de 4-8 GB o incluso en CPU con llama.cpp, lo que habilita asistentes locales en dispositivos modestos.
- Generacion de codigo en pipelines de CI/CD: integrable via llama.cpp o servidores compatibles con OpenAI para tareas de revision de parches, generacion de tests o resumen de cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (i1-Q2_K) y 3,7 GB (i1-Q6_K) solo para los pesos; anadir overhead de contexto KV cache (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: cualquier GPU con 6-8 GB o mas de VRAM para cuantizaciones medias; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas, aunque el modelo es pequeno y no aprovecha GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas; las cuantizaciones Q4 caben incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (text-generation-inference figura entre los tags), y cualquier runtime que consuma GGUF.
- Latencia y throughput estimados: no disponible. El soporte de multi-token prediction y decodificacion especulativa puede mejorar el throughput en runtimes que lo implementen, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF | 4,3B | no disponible | Apache 2.0 | GGUF i1 | Fine-tuning de codigo/agente sin filtros, cuantizado con imatrix |
| Modelo base xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic | 4,3B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; referencia para comparar perdida por cuantizacion |
| Cuantizaciones estaticas mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF | 4,3B | no disponible | Apache 2.0 | GGUF estatico | Alternativa sin imatrix, con ficheros mmproj para vision |
| Qwen 3.5 base (familia) | variable | no disponible | no disponible | safetensors | Arquitectura de origen; el fine-tuning anade capacidades de agente y codigo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en codigo, razonamiento o tool calling; es imprescindible evaluar empiricamente antes de produccion.
- El proceso de "abliteration"/"decensoring" elimina filtros de rechazo, lo que puede producir respuestas inapropiadas, inseguras o daninas en temas sensibles; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a un modelo de 4B, especialmente en tareas de razonamiento largo o generacion de codigo complejo.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones o repositorios de contexto largo sin verificacion previa.
- Soporte multilingue declarado para cinco idiomas, pero sin evaluacion publicada de calidad por idioma; el espanol figura entre los idiomas soportados, aunque el entrenamiento parece predominantemente en ingles y chino.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de trazas pueden tener condiciones adicionales que conviene revisar.
- La cuantizacion introduce perdida de calidad, especialmente en las variantes de 2-3 bits; para produccion se recomienda i1-Q4_K_M o superior.
- El modelo esta marcado como de vision, pero los ficheros mmproj no estan en este repositorio, sino en el estatico; verificar su disponibilidad antes de asumir capacidades multimodales.
- El origen de los datos de entrenamiento (trazas de modelos comerciales) plantea dudas sobre las condiciones de uso de dichos datos que el usuario final deberia considerar.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
