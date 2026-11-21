# Olicorne/Qwen3.8-27B-heretic-ara-INT4

## Resumen

Qwen3.8-27B-heretic-ara-INT4 es una cuantizacion INT4 W4A16 del modelo heretic-org/Qwen3.8-27B-heretic-ara, una variante "abliterated" (con los mecanismos de rechazo eliminados) de Qwen3.8-27B. Lo publica el usuario Olicorne en Hugging Face y emplea la misma receta que RedHatAI/Qwen3.8-27B-INT4: LLM Compressor 0.15.0 con AWQ (duo scaling) combinado con GPTQ en formato W4A16, escalas estaticas de KV-cache en FP8 y calibracion sobre 512 muestras de open-perfectblend con un maximo de 4096 tokens.

El modelo conserva la torre de vision, los embeddings, el lm_head, las proyecciones `linear_attn.in_proj_a/b` y la cabeza MTP en BF16, de modo que mantiene las capacidades multimodales (image-text-to-text) del modelo original. Con 27.781.427.984 parametros totales y un repositorio de 19,5 GB, esta pensado para servir en vLLM con KV-cache en FP8, parser de razonamiento qwen3 y decodificacion especulativa mediante MTP.

Su relevancia es doble: por un lado reduce el peso de un modelo de ~27,8B a un formato INT4 compatible con vLLM y compressed-tensors; por otro, al estar abliterated, responde a la mayoria de peticiones consideradas daninas, lo que lo hace util solo en entornos donde ese comportamiento sea aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.8-27B, con cabeza MTP; tag `qwen3_5` en transformers |
| Parametros totales | 27.781.427.984 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 (AWQ duo scaling + GPTQ), KV-cache FP8 estatica; torre de vision, embeddings, lm_head, `linear_attn.in_proj_a/b` y cabeza MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.8-27B multimodal (pipeline image-text-to-text) con atencion lineal en determinadas proyecciones (`linear_attn.in_proj_a/b`) y una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa. La cuantizacion se realizo con LLM Compressor 0.15.0 aplicando AWQ con duo scaling y GPTQ en esquema W4A16, con escalas estaticas de KV-cache en FP8. La calibracion uso 512 muestras del dataset open-perfectblend con secuencias de hasta 4096 tokens.

Los componentes sensibles a la precision se mantuvieron en BF16: la torre de vision, los embeddings, el lm_head, las proyecciones de atencion lineal `linear_attn.in_proj_a/b` y la cabeza MTP. El modelo base, heretic-org/Qwen3.8-27B-heretic-ara (revision `2dc9b36`), es una version abliterated de Qwen3.8-27B, es decir, con los comportamientos de rechazo suprimidos mediante tecnicas de abliteration. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagenes y texto (image-text-to-text): entrada multimodal con salida de texto.
- Razonamiento explicito mediante parser `qwen3` en vLLM (modo de razonamiento).
- Tool calling y function calling: soportado via `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder` en vLLM.
- Decodificacion especulativa con MTP (`num_speculative_tokens: 3`) para acelerar la inferencia.
- Comportamiento abliterated: responde a la mayoria de peticiones consideradas daninas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como la supresion de los mecanismos de rechazo afecta al comportamiento en dominios sensibles, comparandolo con el modelo original no abliterated.
- Red teaming y evaluacion de seguridad: util para generar respuestas a peticiones adversarias y medir la eficacia de filtros y clasificadores de seguridad externos en pipelines de produccion.
- Procesamiento de documentos con imagenes: al conservar la torre de vision en BF16, puede extraer y razonar sobre contenido de capturas, formularios o diagramas en flujos de digitalizacion.
- Asistentes conversacionales de dominio interno: con contexto multi-turno y tool calling, se puede integrar en vLLM para agentes que consultan APIs internas mediante function calling.
- Generacion asistida en entornos de investigacion sin restricciones de contenido: escenarios donde el equipo asume la responsabilidad del filtrado posterior y necesita un modelo que no rechace peticiones por defecto.
- Despliegue con decodificacion especulativa: el uso de MTP con 3 tokens especulativos permite reducir latencia en servicios de inferencia que ya operan vLLM con KV-cache FP8.
- Evaluacion comparativa de cuantizaciones: sirve como referencia INT4 W4A16 frente al modelo en BF16 para medir la perdida de calidad en tareas multimodales y de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del repositorio: 19,5 GB en safetensors INT4, lo que determina el minimo de VRAM para cargar los pesos.
- VRAM estimada para inferencia: alrededor de 20-22 GB solo para pesos; con KV-cache FP8 y contexto largo, se recomienda al menos 24-32 GB.
- GPU consumer: cabe en GPUs de 24 GB (RTX 3090, RTX 4090) para contextos moderados; en 16 GB no es viable sin offloading.
- GPU profesional: A100 40/80 GB, H100, L40S y A6000 son adecuadas para servir con contexto amplio y concurrencia.
- Despliegue: vLLM es la opcion documentada por el autor, con `--kv-cache-dtype fp8`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. El formato compressed-tensors es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Olicorne/Qwen3.8-27B-heretic-ara-INT4 | 27,78B | no disponible | INT4 W4A16 (AWQ+GPTQ) | apache-2.0 | Abliterated, multimodal, MTP |
| heretic-org/Qwen3.8-27B-heretic-ara | no disponible | no disponible | BF16 | no disponible | Modelo base abliterated, sin cuantizar |
| RedHatAI/Qwen3.8-27B-INT4 | no disponible | no disponible | INT4 W4A16 (AWQ+GPTQ) | no disponible | Misma receta de cuantizacion, sin abliteration |

## Limitaciones y advertencias

- Modelo abliterated: responde a la mayoria de peticiones consideradas daninas. No es apto para aplicaciones orientadas al publico sin un filtrado de seguridad externo.
- Riesgo elevado de contenido danino, ofensivo o inseguro en produccion; el autor advierte explicitamente de que solo debe usarse donde ese comportamiento sea aceptable.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de fidelidad para esta cuantizacion.
- La cuantizacion INT4 W4A16 puede degradar la calidad en tareas de razonamiento y en el procesamiento de imagenes respecto al modelo en BF16; no se aportan metricas de esa perdida.
- Longitud de contexto e idiomas soportados no documentados en la informacion disponible.
- Licencia apache-2.0 en el repositorio de cuantizacion, pero la licencia del modelo base no se detalla en la informacion proporcionada; conviene verificar antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- El modelo fue creado con Claude Code segun la model card, lo que no afecta a su funcionamiento pero si al contexto de su generacion.

## Enlaces

- Hugging Face: https://huggingface.co/Olicorne/Qwen3.8-27B-heretic-ara-INT4
- Modelo base: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Referencia de receta de cuantizacion: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
