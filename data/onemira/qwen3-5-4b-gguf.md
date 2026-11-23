# onemira/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es un espejo (mirror) del modelo Qwen3.5-4B en formato GGUF, concretamente la cuantizacion Q4_K_M generada por Unsloth y redistribuida por el usuario onemira. El modelo original Qwen3.5-4B es un transformer denso de 4.205.751.296 parametros desarrollado por el equipo Qwen (Alibaba), y esta version GGUF esta pensada para inferencia local con llama.cpp. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

El repositorio no aporta informacion tecnica propia sobre el modelo base: se limita a fijar una revision concreta del archivo `Qwen3.5-4B-Q4_K_M.gguf` (2740937888 bytes, SHA-256 verificado) para garantizar reproducibilidad binaria. El autor lo mantiene como dependencia del runtime local de OneMira Desktop, donde se usa para generar resumenes de reuniones, decisiones y entradas de wiki en Markdown de forma offline.

Su relevancia practica es doble: por un lado, ofrece un artefacto GGUF verificado por hash para despliegues que requieren integridad byte a byte; por otro, sirve como ejemplo de modelo de 4B parametros cuantizado en Q4_K_M que cabe en hardware de consumo. No se dispone de informacion sobre la arquitectura interna, el contexto o los datos de entrenamiento del modelo base en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-4B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-4B en la documentacion proporcionada. El dato de parametros totales (4.205.751.296) corresponde al modelo en safetensors, lo que confirma que se trata de un modelo denso de aproximadamente 4,2 mil millones de parametros. No se especifica si emplea attention lineal, decodificacion especulativa, mezcla de expertos ni ninguna otra innovacion.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset, fases de RLHF, DPO ni tecnicas de alineacion. La unica informacion tecnica verificable es el proceso de cuantizacion: el autor declara un espejo que preserva bytes del archivo generado por Unsloth en la revision `e87f176479d0855a907a41277aca2f8ee7a09523`, con tamano de 2740937888 bytes y SHA-256 `00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4`. Esta verificacion por hash es relevante para pipelines que exigen integridad del artefacto.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica uso previsto para dialogos multi-turno.
- Resumen de contenido: el caso de uso declarado por el autor es la sintesis de reuniones (resumenes, decisiones, tareas de accion, mapas mentales).
- Generacion de Markdown estructurado: produce entradas de wiki en formato Google OKF v0.2.
- Ejecucion local offline: compatible con llama.cpp y runtimes derivados (Ollama, LM Studio, etc., por compatibilidad de formato GGUF).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante APIs compatibles con el formato de Hugging Face Endpoints.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; el fabricante del dispositivo menciona 99 idiomas para la transcripcion de voz, pero no se atribuye esa cobertura al modelo de lenguaje.

## Casos de uso

- Resumen de reuniones offline: el modelo se integra en OneMira Desktop para generar resumenes estructurados, decisiones y tareas de accion a partir de transcripciones, sin subir audio a la nube. Su tamano de 4B y la cuantizacion Q4_K_M permiten ejecucion en portatiles sin GPU dedicada.
- Generacion de notas wiki en Markdown: produce entradas en formato Google OKF v0.2 que el usuario puede editar localmente, lo que encaja en flujos de gestion de conocimiento personal.
- Asistente conversacional embebido: el tag `conversational` y el formato GGUF lo hacen adecuado para chatbots de escritorio con contexto multi-turno gestionado por la aplicacion anfitriona.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local, sirve para sectores (legal, salud, RR. HH.) donde no se permite enviar datos a APIs externas.
- Prototipado rapido con llama.cpp: desarrolladores que necesitan un modelo de 4B cuantizado para pruebas de integracion, benchmarking de latencia o validacion de pipelines de inferencia local.
- Distribucion reproducible de artefactos: el hash SHA-256 y la revision fijada permiten usar el modelo como dependencia verificable en sistemas de build o contenedores.
- Educacion e investigacion: modelo ligero para experimentos de cuantizacion, evaluacion de calidad Q4_K_M frente a FP16 o estudios de degradacion por cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB solo para los pesos en Q4_K_M; con overhead de contexto y cache KV, entre 3,5 y 5 GB segun longitud de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es sobredimensionado para GPUs de datacenter, que lo ejecutarian con enorme margen.
- Compatibilidad con GPU de consumo: si, cabe en GTX 1660 (6 GB), RTX 3050, RTX 3060, RTX 4060 y superiores. Tambien puede ejecutarse en CPU con llama.cpp a velocidades aceptables.
- Opciones de despliegue: llama.cpp (runtime declarado por el autor), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. No se confirma soporte de vLLM ni TGI (que priorizan safetensors).
- Latencia y throughput: no disponible. Como referencia orientativa no verificada, un modelo de 4B en Q4_K_M suele generar entre 15 y 40 tokens/s en GPUs de consumo medias y entre 5 y 15 tokens/s en CPU moderna, pero estos valores no proceden de la documentacion del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (este, Q4_K_M) | 4,2B | no disponible | Apache-2.0 | GGUF | Espejo verificado por hash |
| Qwen3.5-4B original (safetensors) | 4,2B | no disponible | Apache-2.0 | safetensors | Modelo base, sin cuantizar |
| Otros GGUF de Unsloth (misma familia) | 4,2B | no disponible | Apache-2.0 | GGUF | Multiples cuantizaciones (Q2 a Q8) |
| Alternativas de ~4B (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4B | variable | variable | safetensors/GGUF | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable con modelos alternativos.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: el repositorio no aporta informacion sobre contexto, idiomas, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para tareas distintas del resumen.
- Cuantizacion unica: solo se ofrece Q4_K_M; no hay variantes Q5, Q6, Q8 ni FP16 en este repositorio, lo que limita el ajuste fino de la relacion calidad/memoria.
- Degradacion por cuantizacion: Q4_K_M introduce perdida de precision respecto al modelo original, especialmente en tareas de razonamiento matematico y codigo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; el autor no documenta tasas de error ni evaluaciones de fidelidad en resumenes.
- Sesgos: no documentados. Al no conocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, etnia o idioma.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene verificar la licencia del modelo base Qwen3.5-4B por si difiere.
- Dependencia de un unico mantenedor: el espejo lo mantiene un fabricante de hardware (OneMira) para su propio producto; no hay garantia de actualizaciones ni de soporte a largo plazo.
- Idioma: no se confirma soporte de castellano ni de otros idiomas; el uso en produccion multilingue requeriria validacion previa.
- Contexto desconocido: sin dato de ventana de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/Qwen3.5-4B-GGUF
- Repositorio upstream (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Producto OneMira C1: https://onemira.com/products/c1
- OneMira C1 en Amazon US: https://www.amazon.com/dp/B0HM6YDLJ4
- Comparativa de grabadoras de voz con IA: https://onemira.com/compare
- Guia de grabadoras sin suscripcion: https://onemira.com/ai-voice-recorder-without-subscription
- Dataset TCO de grabadoras de voz: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Servidor MCP OKF Wiki: https://github.com/onemira-space/okf-wiki-mcp
- Registro oficial MCP: https://registry.modelcontextprotocol.io/v0.1/servers?search=okf-wiki-mcp
- Validador OKF Markdown: https://www.npmjs.com/package/okf-markdown
- Tarjeta de servidor MCP: https://onemira.com/.well-known/mcp/server-card.json
- Plantillas de actas de reunion: https://onemira.com/meeting-minutes-templates
