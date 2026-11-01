# ReliquaryForge/Teutonic-I-Reliquary-RL

## Resumen

Teutonic-I Reliquary RL es un modelo de generacion de texto de 8.953.803.264 parametros (aproximadamente 9B) publicado por ReliquaryForge. Se trata del checkpoint vivo mas reciente del ciclo de aprendizaje por refuerzo asincrono `teutonic-rl-async-v1`, ejecutado sobre la subred 81 (Reliquary) de Bittensor. El modelo parte del checkpoint SFT `ReliquaryForge/Teutonic-I-Reliquary-SFT@18dfb97d` y se entrena con RL utilizando rollouts generados y verificados por los mineros de la subred.

El repositorio funciona como espejo automatico: cada vez que el validador publica una nueva version del checkpoint, el mirror la reconstruye (ancla + deltas desde R2), la verifica contra el indice firmado y la sube a HuggingFace. La version actual es la 151, con fecha de publicacion del indice el 1 de noviembre de 2026. Solo se conserva el ultimo checkpoint; el historial se aplana en un unico commit sobre `main` etiquetado `ckpt-151`.

Su relevancia es doble: por un lado, es un ejemplo practico de entrenamiento descentralizado con verificacion criptografica de pesos (digests SHA-256 y firmas del validador); por otro, ofrece a los mineros de la subred un punto de descarga directa sin necesidad de token. La arquitectura subyacente se declara como `qwen3_5_text` en los tags, aunque no se detallan mas especificaciones en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer, familia `qwen3_5_text` (segun tag de HuggingFace) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 9B parametros, derivado de la familia `qwen3_5_text`. El entrenamiento se estructura en dos fases: una fase SFT previa (checkpoint `Teutonic-I-Reliquary-SFT@18dfb97d`) y una fase posterior de aprendizaje por refuerzo asincrono (`teutonic-rl-async-v1`) sobre Bittensor subnet 81 (Reliquary). Los rollouts de RL son generados y verificados por los mineros de la subred, lo que introduce un esquema de entrenamiento distribuido con validacion colectiva.

La innovacion tecnica mas destacable no esta en la arquitectura del modelo sino en la infraestructura de distribucion: el validador sirve `GET /rl/checkpoint` con un indice firmado y URLs presignadas de R2, y el mirror reconstruye los pesos a partir de un ancla mas deltas. La integridad se verifica mediante `reliquary.shared.ckpt_delta.checkpoint_sha256` y `reliquary.shared.ckpt_index.verify_index_signature`. El digest de pesos del checkpoint 151 es `96f680f376ffb20436823d804e13ddfd1f62582b2730f8dab992669969327035` y el payload del indice firmado `b04e470f73d6db367ad25dc1ecbbbfe824d9ea35f1edb963c7a5e1a161036eaa`. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como DPO o RLHF clasico.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y el tag `conversational`.
- Entrenamiento orientado a RL, lo que sugiere optimizacion para tareas con recompensa verificable, aunque no se detallan las tareas concretas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Integracion con el ecosistema `transformers` y pesos en `safetensors`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- **Mineria en Bittensor subnet 81 (Reliquary):** los mineros pueden descargar el checkpoint directamente con `huggingface-cli download ReliquaryForge/Teutonic-I-Reliquary-RL` sin token y usarlo como punto de partida para generar rollouts, mientras siguen las nuevas versiones via `/rl/checkpoint`.
- **Investigacion en RL descentralizado:** el repositorio documenta el esquema de ancla + deltas, firmas del validador y digests SHA-256, lo que permite reproducir y auditar el proceso de entrenamiento distribuido en un entorno academico o de investigacion.
- **Verificacion de integridad de pesos en produccion:** el fichero `reliquary_checkpoint.json` y las funciones `checkpoint_sha256` / `verify_index_signature` permiten construir pipelines de CI que rechacen checkpoints no firmados antes de desplegarlos.
- **Generacion de texto conversacional en prototipos:** al ser un modelo de ~9B con licencia Apache-2.0, es adecuado para prototipar asistentes conversacionales en entornos controlados donde se pueda validar la calidad del checkpoint vivo.
- **Base para fine-tuning posterior:** el checkpoint puede servir como inicializacion para tareas especificas mediante SFT, dado que la licencia Apache-2.0 permite uso comercial y modificacion.
- **Monitorizacion del ciclo de RL asincrono:** al conservar solo el ultimo checkpoint y etiquetarlo con `ckpt-151`, el repositorio es util para estudiar la evolucion de la recompensa y la estabilidad del entrenamiento a lo largo de versiones, consultando el indice firmado del validador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion y en GPUs de 24 GB en BF16 con margen ajustado.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Teutonic-I Reliquary RL | ~8,95B | no disponible | Apache-2.0 | HuggingFace (mirror) | Checkpoint vivo de RL en Bittensor subnet 81 |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens (128K en variantes) | Apache-2.0 | HuggingFace | Referencia de la familia Qwen; contexto y benchmarks publicos |
| Llama-3.1-8B-Instruct | ~8B | 128K tokens | Llama 3.1 Community License | HuggingFace | Restricciones de licencia para uso comercial |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32K tokens | Apache-2.0 | HuggingFace | Alternativa europea con tool calling |

La comparacion con Qwen2.5-7B o Llama-3.1-8B es orientativa por tamano; no se dispone de datos de contexto ni benchmarks del modelo de ReliquaryForge para una comparacion cuantitativa.

## Limitaciones y advertencias

- **Naturaleza de checkpoint vivo:** el repositorio solo conserva la ultima version (actualmente `ckpt-151`); las versiones anteriores no estan disponibles, lo que impide reproducir resultados de versiones pasadas desde este mirror.
- **Verificacion obligatoria:** al tratarse de pesos reconstruidos desde ancla + deltas, es recomendable validar el digest SHA-256 y la firma del indice antes de usar el modelo en produccion.
- **Sesgos conocidos:** no disponibles en la informacion proporcionada.
- **Riesgo de alucinacion:** no cuantificado; al ser un modelo de ~9B entrenado con RL sobre rollouts de mineros, la calidad y los sesgos dependen del esquema de recompensa de la subred, no documentado aqui.
- **Limitaciones de contexto e idioma:** no disponibles; los idiomas soportados no se declaran.
- **Restricciones de licencia:** Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de la subred y del validador para el uso de los rollouts.
- **Caveat de produccion:** el mirror puede ir por detras del indice del validador (se actualiza cada pocos minutos y un push tarda 10-20 minutos); si la version del repositorio es anterior a `index.latest.version`, el mirror esta catching up.

## Enlaces

- HuggingFace: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary-RL
- Modelo base SFT: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary-SFT
- Bittensor: https://bittensor.com
- Subred 81 (Reliquary): no disponible en la informacion proporcionada
- Paper, blog o repositorio del proyecto Reliquary: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
