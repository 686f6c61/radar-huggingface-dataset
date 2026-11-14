# AlexWortega/Qwen3.8-27B-Humanlike-Chat-2.0-NVFP4

## Resumen

Qwen3.8-27B-Humanlike-Chat-2.0-NVFP4 es una exportación cuantizada en NVFP4 del modelo conversacional LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-2.0, publicada por el usuario AlexWortega. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: toma los pesos en BF16 del modelo original (con los adaptadores ya fusionados) y los comprime a 4 bits en pesos y activaciones (W4A4) mediante llmcompressor 0.15.0 y el formato compressed-tensors. El resultado ocupa 46,1 GB en el repositorio y declara 27.781.427.952 parámetros totales.

El modelo base pertenece a la familia Qwen3.8 (tag `qwen3_5` en el repositorio), con 27B de parámetros, y está afinado para conversación y roleplay con un tono "humanlike". La cadena de linaje incluye huihui-ai/Huihui-Qwen3.8-27B-abliterated, lo que implica que el modelo original ha pasado por un proceso de abliteración que elimina direcciones de rechazo. Esta exportación hereda esas características y añade una capa de cuantización agresiva pensada para servir en hardware Blackwell con SGLang.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de cuantización NVFP4 con protección selectiva de proyecciones críticas (linear attention en BF16); por otro, advierte de que se trata de un artefacto de validación limitada, con pruebas de humo en inglés y ruso y sin evidencia publicada de paridad con benchmarks del modelo original. Es un modelo para experimentación en inferencia de bajo coste, no para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con linear attention (GDN) y cabeza MTP; tag `qwen3_5`; incluye vision tower |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (el autor advierte de que la longitud nativa de config.json no debe tomarse como contexto servible) |
| Tipos de cuantizacion | NVFP4 W4A4 (compressed-tensors); proyecciones protegidas en BF16; FP8 KV cache en el despliegue validado |
| Idiomas soportados | en, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería sglang |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.8 con mecanismos de linear attention (proyecciones GDN: `in_proj_a`, `in_proj_b`, `qkv`, `z`) y una cabeza MTP (multi-token prediction) heredada del modelo original. El export conserva además el vision tower, aunque el autor indica que la validación se ha hecho solo para serving de texto. Esta exportación no entrena nada: parte de los pesos BF16 del modelo base en el commit `0a4d369895bf0a8b217fb08ef738769bac9d881b`, con los adaptadores ya fusionados, y aplica cuantización NVFP4 con llmcompressor 0.15.0.

El proceso de calibración usó 512 respuestas generadas por el propio modelo (448 en inglés del corpus ELI5 y 64 en ruso de Yandex.Q), con longitud máxima de 2048 tokens y sampling temperature 1, top_p 0.95, top_k 20, hasta 768 tokens nuevos. Las proyecciones de linear attention `in_proj_a` e `in_proj_b` se mantienen en BF16, igual que el vision tower, `lm_head` y la cabeza MTP original; las proyecciones `qkv` y `z` sí se cuantizan a NVFP4 en la variante compacta. Existe una rama `keep-all` con el export conservador que retiene todas las proyecciones de entrada GDN en BF16. El repositorio incluye artefactos de verificación: `export-validation.json` (proyecciones protegidas, MTP sin cambios, escalas de cuantización finitas y positivas, hashes SHA-256 de cada shard), `nvfp4.py`, `source.json` y `build-environment.txt`.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat y roleplay con estilo "humanlike".
- Modo thinking controlable mediante la plantilla de chat original del modelo base.
- Capacidades multilingües limitadas a inglés y ruso según la model card.
- Vision tower presente en los pesos, aunque no validado para serving multimodal en este export.
- Cabeza MTP (multi-token prediction) conservada, lo que puede habilitar decodificación especulativa en SGLang.
- Formateo JSON y aritmética básica verificados en las pruebas de humo del autor.
- Tool calling / function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente).

## Casos de uso

- Roleplay y personajes conversacionales: el modelo base está afinado para diálogo con tono humano y admite control de modo thinking; la cuantización NVFP4 reduce el coste por token en GPUs Blackwell, lo que abarata sesiones largas de roleplay.
- Chat de atención al cliente en inglés y ruso: el soporte declarado de ambos idiomas y la ventana conversacional del modelo base permiten gestionar hilos multi-turno, siempre que se valide la calidad tras la cuantización.
- Despliegue de bajo coste en RTX 5090: el autor documenta un despliegue validado con SGLang 0.5.23, KV cache FP8 y offload de prefix-cache en RAM, lo que permite servir un modelo de 27B en una GPU de consumo de gama alta.
- Experimentación con cuantización NVFP4: el repositorio incluye receta, scripts y artefactos de validación que sirven como referencia para replicar el pipeline llmcompressor sobre otros modelos Qwen.
- Generación de datos sintéticos conversacionales: la plantilla de chat y el sampling recomendado (temperature 1, top_p 0.95) permiten generar diálogos diversos para fine-tuning o evaluación.
- Pruebas de formateo estructurado: las smoke tests cubren JSON formatting, útil para prototipos de extracción de datos o APIs conversacionales.
- Investigación sobre abliteración y alineación: al heredar el linaje abliterated, el modelo permite estudiar el comportamiento de modelos sin direcciones de rechazo en entornos controlados de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye `serving-smoke.json` con pruebas de humo (muestras de personajes en ruso e inglés, recall conversacional, formateo JSON y aritmética) y advierte explícitamente de que no constituyen evidencia de paridad con benchmarks ni de calidad universal en roleplay.

## Requisitos de hardware

- Peso del repositorio: 46,1 GB en safetensors NVFP4; el peso en VRAM para serving es inferior al del BF16 original, pero no se publica una cifra exacta de VRAM pico.
- GPU recomendadas: RTX 5090 (despliegue validado por el autor con SGLang 0.5.23); GPUs Blackwell en general son el objetivo natural de NVFP4. Para A100/H100 no hay validación documentada de este formato.
- Cabe en GPU de consumo: sí, según el despliegue validado en RTX 5090; el autor advierte de que concurrencia, límites de contexto y KV-offload requieren validación específica por despliegue.
- Opciones de despliegue: SGLang (librería declarada, versión validada 0.5.23); llama.cpp, Ollama y TGI no están documentados para este export NVFP4.
- Configuración medida: NVFP4, KV cache FP8, estado GDN en FP32, MTP activo y offload de prefix-cache a RAM; los detalles están en `deployment-5090.json`.
- Latencia y throughput: no disponibles (el autor remite a los límites de benchmark de `deployment-5090.json`, no incluidos en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlexWortega/Qwen3.8-27B-Humanlike-Chat-2.0-NVFP4 | 27,78B | no disponible | NVFP4 W4A4 | Apache-2.0 | Hugging Face, 53 descargas |
| LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-2.0 (base) | 27B (aprox.) | no disponible | BF16 | Apache-2.0 (segun el export) | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (linaje) | 27B (aprox.) | no disponible | BF16 | no disponible | Hugging Face |
| Qwen3.8-27B (origen) | 27B (aprox.) | no disponible | BF16 | no disponible | Hugging Face |

La comparativa se limita al linaje directo porque no se han proporcionado datos de benchmarks ni de contexto de modelos alternativos de la misma categoría. El export NVFP4 se diferencia del base por el formato de pesos (4 bits frente a BF16) y por el objetivo de hardware (Blackwell frente a cualquier GPU con suficiente VRAM para BF16).

## Limitaciones y advertencias

- Artefacto de cuantización, no un modelo nuevo: la calidad depende del proceso NVFP4 y de la calibración con solo 512 muestras, lo que puede degradar el comportamiento en dominios alejados de ELI5 y Yandex.Q.
- Sin evidencia de paridad con benchmarks: las pruebas incluidas son smoke tests; no hay MMLU, HumanEval ni métricas de roleplay publicadas.
- Contexto servible no confirmado: el autor advierte explícitamente de que la longitud nativa de `config.json` no debe interpretarse como contexto utilizable en RTX 5090; concurrencia y KV-offload requieren validación por despliegue.
- Idiomas limitados a inglés y ruso; no se declara soporte de español ni de otros idiomas.
- Vision tower presente pero no validado: el export está probado solo para serving de texto.
- Linaje abliterated: el modelo base deriva de una versión abliterated, lo que implica ausencia de direcciones de rechazo y mayor riesgo de generar contenido inapropiado; requiere filtros externos en producción.
- Riesgo de alucinación: inherente a los modelos conversacionales de 27B; la cuantización agresiva puede incrementarlo en tareas de razonamiento o aritmética.
- Licencia Apache-2.0 heredada del repositorio fuente, pero el autor no aporta una verificación independiente de la cadena de licencias de los modelos intermedios.
- Formato NVFP4 con soporte limitado: fuera de SGLang y hardware Blackwell, la ruta de despliegue no está documentada.
- No aplicar los adaptadores del modelo base de nuevo: ya están fusionados en los pesos; hacerlo corrompería el modelo.
- Repositorio con muy baja adopción (53 descargas, 0 likes) y creado en noviembre de 2026; no hay comunidad que haya validado el export de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexWortega/Qwen3.8-27B-Humanlike-Chat-2.0-NVFP4
- Modelo base: https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-2.0
- Rama con export conservador: https://huggingface.co/AlexWortega/Qwen3.8-27B-Humanlike-Chat-2.0-NVFP4/tree/keep-all
- Linaje abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Artefactos de validación en el repo: `export-validation.json`, `serving-smoke.json`, `deployment-5090.json`, `nvfp4.py`, `source.json`, `build-environment.txt`, `SOURCE_README.md`
- Paper, blog o demo adicionales: no disponible
