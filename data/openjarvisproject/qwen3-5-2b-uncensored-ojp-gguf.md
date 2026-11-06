# OpenJarvisProject/Qwen3.5-2B-Uncensored-OJP-GGUF

## Resumen

Qwen3.5-2B-Uncensored-OJP-GGUF es una cuantización GGUF del modelo Qwen3.5-2B en su variante "Uncensored Aggressive" de HauhauCS, publicada por OpenJarvisProject como parte de su línea de modelos para inferencia en dispositivo. El modelo parte de la arquitectura Qwen3.5 de 2B parámetros (1.473.077.056 parámetros reales según safetensors) y elimina el entrenamiento de rechazo de la variante original, orientándose a generación de texto conversacional, roleplay y uso en agentes locales.

La contribución propia de OpenJarvisProject consiste en dos modificaciones sobre el modelo base: un recorte de vocabulario de 248.320 a 48.736 tokens (los que usa el texto en inglés) y una cuantización Q5_K_M de 1.066 MB con una importance matrix genérica derivada de wikitext-2. El repositorio incluye además dos ficheros de sondas (probe) específicos del router y del selector de herramientas de OpenJarvis, ajustados a este fichero GGUF concreto.

El modelo es relevante por su enfoque en despliegue local de bajo consumo: requiere aproximadamente 1,3 GB de memoria al arrancar y 1,7 GB tras sesiones largas, con velocidades medidas en CPU de 248 tokens/s de prompt y 23 tokens/s de generación con 6 hilos. La licencia Apache-2.0 y el formato GGUF facilitan su integración en llama.cpp y en pipelines de agentes sin dependencia de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), no se detalla variante concreta |
| Parametros totales | 1.473.077.056 (1,47B) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (única incluida en el repo) |
| Idiomas soportados | no disponible; vocabulario recortado a los 48.736 tokens usados por texto en inglés, otros alfabetos siguen funcionando en piezas más pequeñas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `unc-2b-q5km.gguf`, 1.066 MB) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de Qwen3.5-2B, un transformer de la familia Qwen3.5 con 1,47B parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original. La variante de partida, HauhauCS/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive, elimina el entrenamiento de rechazo del modelo base, según indica el autor (0 de 18 prompts de sonda rechazados).

La innovación técnica principal de esta publicación es la reducción del vocabulario de 248.320 a 48.736 tokens, limitándolo a los que usa el inglés, lo que reduce el tamaño del embedding y del fichero final. La cuantización Q5_K_M emplea una importance matrix genérica calculada sobre wikitext-2, no específica del dominio. El autor advierte que el modelo piensa antes de responder por defecto y que, para uso conversacional, debe desactivarse el modo thinking cerrando el bloque `<think>` vacío en el prompt con formato ChatML.

## Capacidades

- Generación de texto conversacional multi-turno en formato ChatML.
- Roleplay y escritura creativa sin restricciones de rechazo (0 de 18 prompts de sonda rechazados).
- Modo thinking nativo de Qwen3.5, desactivable mediante un bloque `<think>` vacío precerrado.
- Soporte de tool calling y selección de herramientas mediante la sonda `unc-2b-q5km.gguf.tools.json` de OpenJarvis.
- Enrutamiento de agente mediante la sonda `unc-2b-q5km.gguf.probe.json` (4 rutas) de OpenJarvis.
- Capacidades multilingües limitadas: el vocabulario recortado prioriza el inglés y otros alfabetos se tokenizan en piezas más pequeñas.
- Razonamiento básico y matemáticas sencillas; el autor señala debilidad en matemáticas difíciles y código.

## Casos de uso

- Asistente conversacional local en dispositivo: el modelo cabe en aproximadamente 1,3 GB de memoria y funciona en CPU con 6 hilos a 23 tokens/s de generación, adecuado para aplicaciones de escritorio o embebidas sin GPU.
- Roleplay y ficción interactiva: la ausencia de entrenamiento de rechazo y el soporte de contexto conversacional multi-turno permiten narrativas sin bloqueos, con temperatura 0,6, top-k 20, top-p 0,9 y penalización de repetición 1,12.
- Agente local con enrutamiento de herramientas: las sondas de OpenJarvis permiten clasificar peticiones en 4 rutas y seleccionar herramientas, con 45 de 48 escenarios de agente superados en la prueba del autor.
- Automatización de tareas de escritorio: integrable en llama.cpp (`llama-cli -m unc-2b-q5km.gguf -cnv`, build b-cbe28bb o superior) para asistentes que operan sobre ficheros y comandos locales.
- Prototipado rápido de chatbots: el formato GGUF y la licencia Apache-2.0 permiten desplegar en Ollama o llama.cpp sin infraestructura GPU dedicada.
- Generación de texto en inglés con bajo consumo: el vocabulario recortado reduce el tamaño del modelo a 1.066 MB manteniendo 0,855 bits por byte en inglés, útil para aplicaciones con almacenamiento limitado.
- Experimentación en investigación sobre alineación y rechazo: sirve como base para estudiar el comportamiento de modelos sin entrenamiento de rechazo en entornos controlados.

## Benchmarks y rendimiento

| Métrica | Este modelo (2B) | Build 0.8B |
|---|---|---|
| Tamaño | 1.066 MB | 401 MB |
| Bits por byte en inglés (menor es mejor) | 0,855 | 0,986 |
| Velocidad de prompt / generación (CPU, 6 hilos) | 248 / 23 tokens/s | 427 / 47 tokens/s |
| Prueba de agente (48 escenarios fichero/herramienta/respuesta) | 45/48 | 46/48 |
| Rechazos en 18 prompts de sonda | 0 | 0 |
| Prueba de soak de 70 peticiones | sin respuestas vacías ni fuga de etiquetas think | igual |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,3 GB al arrancar y 1,7 GB tras una sesión larga, según mediciones del autor.
- GPU recomendadas: no se han probado rutas GPU; el autor solo midió en CPU con 6 hilos.
- Cabe en GPU de consumo: no verificado; por tamaño (1,066 MB en Q5_K_M) cabría en GPUs con 2-4 GB de VRAM, pero no hay pruebas publicadas.
- Opciones de despliegue: llama.cpp (build b-cbe28bb o superior), formato GGUF compatible con Ollama y otros runners de llama.cpp; el motor de OpenJarvis usa las sondas incluidas.
- Latencia y throughput medidos: 248 tokens/s de prompt y 23 tokens/s de generación en CPU con 6 hilos; el autor indica que es aproximadamente el doble de lento que el build 0.8B.
- No probado: teléfonos en general (solo emulador Android), rutas GPU y sesiones largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-OJP-GGUF (este) | 1,47B | no disponible | Apache-2.0 | GGUF Q5_K_M | Vocabulario recortado a 48.736 tokens; 1.066 MB; 0,855 bpb en inglés |
| Qwen3.5-0.8B-Uncensored-OJP-GGUF | no disponible | no disponible | Apache-2.0 | GGUF | 401 MB; 0,986 bpb; 46/48 en prueba de agente; más rápido (427/47 tokens/s) |
| HauhauCS/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive | 2B (nominal) | no disponible | Apache-2.0 | no disponible | Modelo base sin recorte de vocabulario ni cuantización OJP |
| Qwen/Qwen3.5-2B | 2B (nominal) | no disponible | Apache-2.0 | no disponible | Modelo original con entrenamiento de rechazo |

No se dispone de datos de benchmarks estándar para comparar rendimiento entre estas variantes más allá de las métricas internas del autor.

## Limitaciones y advertencias

- Sin entrenamiento de rechazo: el autor confirma 0 rechazos en 18 prompts de sonda; la responsabilidad de uso recae en el usuario.
- Alucinaciones: el autor advierte que el modelo alucina y comete errores en números exactos.
- Debilidad en matemáticas difíciles y código, según la model card.
- Rendimiento en agentes no superior al build 0.8B (45/48 frente a 46/48, dentro del ruido entre ejecuciones); la prueba no mide calidad de escritura.
- No se ha ejecutado la prueba de cumplimiento de roleplay para adultos en este build.
- Vocabulario recortado: otros alfabetos distintos del inglés se tokenizan en piezas más pequeñas, lo que puede degradar el rendimiento multilingüe.
- No probado en teléfonos reales (solo emulador Android), rutas GPU ni sesiones largas.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado sin filtros requiere moderación propia en producción.
- Modelo experimental según el propio autor; no recomendado como base de producción sin evaluación adicional.
- Requiere desactivar el modo thinking con un bloque `<think>` vacío para uso conversacional; de lo contrario, el modelo razona antes de responder.

## Enlaces

- Hugging Face: https://huggingface.co/OpenJarvisProject/Qwen3.5-2B-Uncensored-OJP-GGUF
- Modelo base (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.5-2B
- Build 0.8B de OpenJarvisProject: https://huggingface.co/OpenJarvisProject/Qwen3.5-0.8B-Uncensored-OJP-GGUF
- Repositorio OpenJarvisProject: https://github.com/OpenJarvisProject
- Resultados y metodología (`RESULTS.md`, sección 20): https://github.com/OpenJarvisProject/openjarvisproject-model-tooling
