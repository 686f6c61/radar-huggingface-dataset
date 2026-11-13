# kn1ghtc/seclx-business-models

## Resumen

`kn1ghtc/seclx-business-models` es un repositorio de pesos cuantizados en formato MLX que agrupa el denominado "pool de modelos de negocio" del gateway local seclx, desarrollado por el autor kn1ghtc. No se trata de un modelo único, sino de una colección de dos artefactos derivados de la familia Qwen: `qwen3.5-9b-4bit` (alias `aux`, `lite`, `small`) y `mtplx-qwen3.8-27b-op4bit` (alias `masterLLM`, `master`). El objetivo del repositorio es servir inferencia local sobre Apple Silicon mediante MLX, exponiendo una API compatible con OpenAI a través de la herramienta seclx, que carga los modelos de forma perezosa y los descarga de memoria cuando están inactivos.

El modelo pequeño (9B) se distribuye como cuantización MLX de 4 bits (4,501 bits por peso, grupo de 64) y ocupa 4,7 GB, pensado para tareas auxiliares baratas: preguntas simples, conversación, aumento de prompts y extracción estructurada. El modelo grande (27B) emplea una receta de cuantización de precisión mixta con decodificación especulativa MTP (multi-token prediction) y ocupa 19 GB, actuando como motor generalista.

La relevancia actual del repositorio es acotada pero específica: demuestra un patrón de despliegue local en hardware de Apple con cuantización selectiva (mantener en 8 bits las capas sensibles y el gate de routing) y con decodificación especulativa integrada. No hay resultados de benchmarks publicados ni métricas de calidad, solo métricas de rendimiento de inferencia medidas en un Apple M5 Ultra con 103 GB de memoria unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5 y Qwen3.8); el modelo 27B incorpora cabecera MTP de decodificación especulativa |
| Parametros totales | 9B (`qwen3.5-9b-4bit`) y 27B (`mtplx-qwen3.8-27b-op4bit`) |
| Parametros activos | no disponible (no se indica que sean MoE; se menciona "routing gate" y "expertos" en el 27B, sin datos de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4 bits con group-size 64 (modelo 9B); precisión mixta en el 27B: tronco 4 bits group 32 affine, `embed_tokens`/`lm_head`/`linear_attn.out_proj` y últimas 8 capas MLP en 8 bits group 64, bloque MTP en bf16, sidecar de LM head en 4 bits |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 (heredada de los repositorios Qwen upstream) |
| Formato de pesos | MLX (cuantizado), con manifiesto `.seclx-manifest.json` y fichero `mtplx_runtime.json` de receta |

## Arquitectura y entrenamiento

El repositorio no entrena ni afina ningún modelo: solo realiza conversión de formato y reempaquetado de cuantización sobre pesos Qwen preexistentes. El modelo de 9B se generó con `mlx_lm convert -q --q-bits 4 --q-group-size 64`, sin calibración ni entrenamiento posterior, por lo que según el autor el comportamiento y la alineación de seguridad del modelo original se preservan.

El modelo de 27B aplica una receta de precisión mixta documentada en `mtplx_runtime.json`: tronco en 4 bits con grupo 32 affine; matrices de embeddings, LM head, `linear_attn.out_proj` y las últimas 8 capas MLP en 8 bits con grupo 64; bloque borrador MTP en bf16; y un sidecar de LM head en 4 bits. El autor justifica esta selección argumentando que los errores de cuantización en la matriz de vocabulario y en las MLP profundas se traducen en selección incorrecta de tokens y amplificación de residuos, y que el gate de routing no se cuantiza porque un error de selección de experto tiene mayor impacto que el error de un peso individual. La decodificación especulativa usa profundidad de borrador 3, con tasas de aceptación medidas de 0,959 / 0,873 / 0,759 por profundidad. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generación de texto y conversación multi-turno en chino e inglés.
- Respuesta a preguntas simples y conversación general (perfil del modelo 9B).
- Aumento y expansión de prompts para generación de imágenes, vídeo y voz (caso de uso declarado del 9B).
- Extracción estructurada de información (perfil del modelo 9B).
- Razonamiento de cadena larga (reservado al modelo 27B; el 9B desactiva el modo de pensamiento con `reasoning_effort=off`).
- Decodificación especulativa con cabecera MTP en el modelo 27B para acelerar la generación.
- Exposición mediante endpoints compatibles con OpenAI: `/v1/chat/completions`, `/v1/images/*`, `/v1/videos`, `/v1/audio/*`.
- Carga perezosa y descarga automática por inactividad gestionadas por el gateway seclx.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión, audio o agentes autónomos: no disponible (los endpoints de imagen, vídeo y audio pertenecen al gateway, no se atribuyen al modelo de texto).

## Casos de uso

- Aumento de prompts para generación multimedia: el modelo 9B expande una frase corta en un prompt detallado para los endpoints `/v1/images/*`, `/v1/videos` y `/v1/audio/*` sin necesidad de cargar el modelo de 27B, con un coste de 4,7 GB de memoria y 0,54 s por petición en caliente.
- Asistente conversacional ligero en local: atención al cliente o chat interno en chino e inglés con el modelo 9B, adecuado cuando la latencia y el consumo de memoria importan más que la profundidad de razonamiento.
- Extracción estructurada de datos: conversión de texto libre en campos JSON para pipelines internos, aprovechando el perfil "barato y rápido" del modelo auxiliar.
- Gateway unificado de IA en estaciones de trabajo Apple Silicon: despliegue de seclx con `seclx up --config configs/seclx.yaml` para servir varios modelos bajo una API compatible con OpenAI, con carga perezosa y liberación de memoria al quedar inactivos.
- Razonamiento de cadena larga y tareas complejas: uso del modelo 27B (`masterLLM`) como motor principal cuando el 9B está limitado por `reasoning_effort=off`, con 110 tok/s en contexto corto y 111 tok/s en contexto de ~4k.
- Prototipado e investigación en entornos sin GPU NVIDIA: inferencia MLX nativa en Apple Silicon, útil para equipos que desarrollan en macOS y necesitan validar flujos antes de migrar a producción.
- Evaluación de recetas de cuantización: el repositorio sirve como referencia reproducible de cuantización de precisión mixta y decodificación especulativa MTP, con la receta documentada en `mtplx_runtime.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas aportadas son de rendimiento de inferencia, medidas en un Apple M5 Ultra con 103 GB de memoria unificada:

| Metrica | qwen3.5-9b-4bit | mtplx-qwen3.8-27b-op4bit |
|---|---|---|
| Tiempo de arranque en frío | 3,8 s | no disponible |
| Latencia por petición en caliente | 0,54 s | no disponible |
| Memoria residente | 5,7 GB | no disponible |
| Throughput (contexto ~200 tok) | no disponible | 110 tok/s |
| Throughput (contexto ~4k tok) | no disponible | 111 tok/s |
| Aceptación de borrador MTP (profundidades 1/2/3) | no aplica | 0,959 / 0,873 / 0,759 |
| Escalado con concurrencia | no disponible | no escala; la estrategia es añadir pods, no slots |

## Requisitos de hardware

- Hardware de referencia: Apple Silicon con MLX; las métricas se midieron en un Apple M5 Ultra con 103 GB de memoria unificada.
- Memoria para el modelo 9B: 4,7 GB en disco y 5,7 GB residentes en inferencia.
- Memoria para el modelo 27B: 19 GB en disco; memoria residente no especificada, pero el autor menciona un rango de 19–20 GB para el modelo principal.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por el formato MLX de este repositorio; requerirían conversión a otro formato.
- Viabilidad en GPU de consumo: no disponible para el ecosistema MLX; en Apple Silicon, ambos modelos caben en equipos con memoria unificada suficiente (el 27B requiere al menos ~20 GB libres).
- Opciones de despliegue: seclx (gateway propio, instalable con `pip install seclx` o brew), con endpoints compatibles con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 110–111 tok/s en el modelo 27B; el rendimiento agregado no aumenta con la concurrencia, por lo que el escalado se realiza añadiendo instancias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kn1ghtc/seclx-business-models (9B) | 9B | no disponible | MLX 4 bits | Apache-2.0 | Hugging Face, 0 descargas |
| kn1ghtc/seclx-business-models (27B) | 27B | no disponible | MLX precisión mixta + MTP | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.5-9B (upstream) | 9B | no disponible | bf16/fp16 original | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (upstream) | 27B | no disponible | bf16/fp16 original | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (por ejemplo, otras cuantizaciones MLX de Qwen o modelos de tamaño similar en GGUF) no está disponible en la información proporcionada. Los modelos upstream Qwen figuran como referencia porque este repositorio solo reempaqueta sus pesos.

## Limitaciones y advertencias

- El repositorio no incluye benchmarks de calidad; no hay evidencia publicada sobre la degradación introducida por la cuantización más allá de las afirmaciones del autor.
- El modelo 9B tiene el modo de razonamiento desactivado (`reasoning_effort=off`) porque, según el autor, la cadena de pensamiento consume el presupuesto de tokens y contamina el formato de salida del aumento de prompts; no es apto para razonamiento de cadena larga.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otros idiomas.
- El rendimiento agregado del modelo 27B no escala con la concurrencia: la estrategia recomendada es añadir pods, lo que incrementa el coste de infraestructura.
- Las métricas de latencia y throughput proceden de un único equipo (Apple M5 Ultra, 103 GB); no son extrapolables a otros chips Apple.
- El repositorio está ligado al gateway seclx: el flujo de descarga depende de `seclx hf pull` y del manifiesto `.seclx-manifest.json`, lo que añade una dependencia de herramienta propietaria del autor.
- Los modelos de seguridad (`secllm-knightc` y `guard-*`) mencionados en la model card no forman parte del repositorio público.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre los modelos Qwen upstream.
- Licencia Apache-2.0 permite uso comercial, pero se hereda de los repositorios Qwen originales; conviene verificar las condiciones de dichos repositorios.
- El repositorio registra 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kn1ghtc/seclx-business-models
- Perfil del autor en GitHub: https://github.com/kn1ghtc
