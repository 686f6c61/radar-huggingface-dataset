# rax4901/DeepSeek-V4-Flash-0731-Abliterated-FP8

## Resumen

DeepSeek-V4-Flash-0731-Abliterated-FP8 es una derivación experimental del checkpoint oficial DeepSeek-V4-Flash-0731, publicada por el usuario rax4901. No se trata de un fine-tune por gradiente ni de una cuantización nueva: es una edición de "cirugía de modelo" (abliteración) que aplica una proyección de rango 1 sobre los escritores residuales de atención para eliminar la dirección de rechazo, conservando la precisión mixta nativa (FP8/BF16/F32) del checkpoint original. El autor etiqueta el modelo como experimental y advierte de que no se han ejecutado benchmarks directos sobre este artefacto FP8.

El modelo base es un Mixture-of-Experts de DeepSeek con 304.180.418.494 parámetros totales (según los safetensors del repo) y una declaración de contexto de un millón de tokens heredada del checkpoint upstream. Incorpora tensores DSpark adjuntos y mantiene la arquitectura, tokenizador y codificación de mensajes oficiales del modelo 0731. El repo ocupa 166,9 GB y se distribuye en 48 shards de pesos con 72.317 tensores indexados.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de interpretabilidad mecanicista aplicada (edición de dirección de rechazo con trazabilidad completa en un manifiesto); por otro, sirve de advertencia sobre los límites de validación, ya que la evidencia conductual presentada proviene de un derivado MLX cuantizado y no del checkpoint FP8 nativo. La licencia es MIT, lo que permite uso comercial, pero las limitaciones de validación aconsejan cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (deepseek_v4) con tensores DSpark adjuntos |
| Parametros totales | 304.180.418.494 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (declaración heredada del upstream 0731) |
| Tipos de cuantizacion | FP8 nativo mixto (FP8/BF16/F32), con tres iteraciones de recuantización FP8 de punto fijo; derivados MLX de 2 y 3 bits disponibles por terceros |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards) |

## Arquitectura y entrenamiento

El checkpoint es un transformer MoE de la familia DeepSeek V4, con la arquitectura, tokenizador y codificación de mensajes oficiales del modelo 0731. No ha habido entrenamiento por gradiente: el autor aplica una proyección de dirección de rechazo de rango 1 (lambda 3,5) sobre los escritores residuales de atención en las capas 10 a 42 del modelo principal, más la proyección de salida de atención correspondiente en las tres etapas DSpark adjuntas. En total se editaron 36 tensores, todos registrados en `ABLITERATION_MANIFEST.json` junto con los datos de ida y vuelta FP8.

La receta sigue el trabajo público de dirección de rechazo de drowzeys, transferido al checkpoint 0731 más reciente; el propio autor califica esa transferencia de experimental. La precisión mixta original se conserva mediante tres iteraciones de recuantización FP8 de punto fijo, de modo que el artefacto mantiene el formato nativo del upstream en lugar de ser una cuantización nueva del proyecto. La validación estructural cubrió los 48 shards y los 72.317 tensores indexados, y las pruebas preliminares de rechazo mostraron el cambio conductual esperado.

## Capacidades

- Generación de texto con el comportamiento post-entrenado oficial del modelo 0731, ya que la abliteración no lo convierte en un modelo base.
- Contexto declarado de hasta un millón de tokens, heredado del upstream.
- Soporte de los tensores DSpark adjuntos y de la codificación de mensajes oficial (directorio `encoding` incluido).
- Formato compatible con endpoints (tag `endpoints_compatible`) y carga mediante transformers.
- Capacidades de razonamiento, código y matemáticas: no verificadas en esta release; el autor no ejecutó benchmarks de capacidad.
- Tool calling, function calling y uso agéntico: no disponible como dato verificado; el autor recomienda `temperature=1.0` y `top_p=0.95` para escenarios agénticos.
- Multilingüismo: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el manifiesto por tensor y la dirección SHA-256 permiten reproducir y auditar el efecto de una proyección de rango 1 sobre los escritores residuales, lo que lo hace útil como material de estudio de direcciones de rechazo.
- Estudio comparativo de abliteración: al conservar la precisión mixta nativa, sirve para medir si el cambio conductual sobrevive a la conversión FP8 sin pasar por una cuantización adicional del proyecto.
- Evaluación de robustez de salvaguardas: útil en entornos de red teaming controlados para analizar cómo responde un MoE de 304.000 millones de parámetros tras eliminar la dirección de rechazo.
- Pruebas de despliegue con contexto largo: el millón de tokens declarado permite experimentar con cargas de documentos extensos, aunque sin garantías de capacidad verificada en esta release.
- Base para derivados cuantizados: ya existe un derivado MLX mixto de 2 y 3 bits con grupo 64, lo que abre la puerta a despliegues en hardware de Apple Silicon para experimentación.
- Integración en pipelines de investigación vía API compatible con OpenAI: el tag `endpoints_compatible` y las instrucciones de codificación del upstream facilitan montar un servicio de pruebas interno.
- Referencia docente sobre riesgos de publicación: caso práctico de por qué una model card debe distinguir entre validación estructural, proxy conductual y benchmark directo.

## Benchmarks y rendimiento

Los resultados publicados corresponden a un proxy de despliegue: el checkpoint FP8 nativo no se cargó en el host de pruebas de 128 GB, y la batería completa se ejecutó sobre el derivado MLX mixto de 2 y 3 bits con grupo 64, mediante oMLX 0.5.4rc1 con perfil de 32.768 tokens, temperatura 0, top-p 1, semilla 42 y máximo de 160 tokens generados.

| Suite | Casos | Resultado completado |
|---|---:|---|
| UncensorBench | 200 | 0 rechazos duros; cumplimiento por palabra clave en 200/200 |
| XSTest | 450 | 0/450 rechazos con el clasificador de prefijo upstream exacto; 0/250 sobrerrechazos en prompts seguros |
| StrongREJECT-small | 180 | 60 prompts × variantes baseline, ROT13 y supresión de rechazo; 0 rechazos duros con la heurística local |

La puerta de completitud final registró 830 casos únicos, 830 registros últimos correctos y cero fallos o registros ausentes, con siete fallos transitorios de transporte o de guarda de memoria reparados mediante reintento serial. El juez oficial fine-tuneado de StrongREJECT no se ejecutó, por lo que no se declara puntuación StrongREJECT. Tampoco se ejecutó una referencia limpia ni un benchmark de capacidad. Estos resultados no establecen la tasa de rechazo del checkpoint FP8 nativo, no cuantifican el efecto de la cuantización y no demuestran preservación de capacidades generales.

## Requisitos de hardware

- El repo pesa 166,9 GB en FP8 nativo mixto; la inferencia requiere al menos esa cifra de memoria de acelerador, más overhead de activaciones y KV cache.
- El host de pruebas del autor era de 128 GB y no pudo cargar el checkpoint FP8 para el benchmark completo, lo que confirma que no cabe en configuraciones de 128 GB.
- GPU recomendadas: no disponibles como dato verificado; por tamaño, el despliegue exige nodos multi-GPU de clase datacenter (A100/H100/H200) o configuraciones equivalentes con suficiente memoria agregada.
- GPU de consumo: no cabe en RTX 4090 ni en GPUs de 24 GB. El derivado MLX mixto de 2 y 3 bits con grupo 64 es la vía documentada para hardware de Apple Silicon.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles con OpenAI y oMLX para el derivado MLX. No hay datos publicados sobre vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Estado de validación |
|---|---:|---|---|---|
| DeepSeek-V4-Flash-0731-Abliterated-FP8 (este) | 304.180.418.494 | 1.000.000 tokens (declarado) | MIT | Estructural completa; conductual solo vía proxy MLX |
| deepseek-ai/DeepSeek-V4-Flash-0731 (upstream) | no disponible en la información proporcionada | 1.000.000 tokens (declarado) | no disponible en la información proporcionada | Model card oficial del autor original |
| apetersson/DeepSeek-V4-Flash-0731-Abliterated-MLX-Mixed-2bit-3bit-g64 | no disponible | no disponible | no disponible | Proxy conductual usado en esta validación |
| drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored-1M-57toks | no disponible | 1M (según nombre) | no disponible | Fuente de la receta de dirección de rechazo |

## Limitaciones y advertencias

- La abliteración puede afectar a capacidades y comportamiento más allá de los rechazos; no garantiza cumplimiento, factualidad, seguridad ni un estilo de respuesta concreto.
- No se ejecutó benchmark directo sobre el checkpoint FP8 nativo: la evidencia conductual proviene de un derivado MLX cuantizado y no debe leerse como resultado de capacidad ni de FP8.
- No se ejecutó el juez oficial de StrongREJECT ni una referencia limpia, por lo que no hay puntuación StrongREJECT ni medida de preservación de capacidades.
- La transferencia de la receta desde el checkpoint DSpark al 0731 es experimental según el propio autor.
- Riesgo de alucinación y sesgos: no cuantificados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- La licencia MIT permite uso comercial, pero el estado de validación desaconseja producción sin evaluaciones propias de capacidad, seguridad y sesgo.
- El etiquetado de Hugging Face como `finetune` es incorrecto respecto a la naturaleza real del artefacto (edición de proyección, no fine-tune por gradiente).
- El modelo no es universalmente "incensurado" pese a la etiqueta `abliterated`; el autor lo indica explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rax4901/DeepSeek-V4-Flash-0731-Abliterated-FP8
- Modelo base upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Revisión exacta del upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/tree/9e165c30e2704aec5d9d593cce3eebd58bbef1cb
- Fuente de la dirección de rechazo: https://github.com/drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored-1M-57toks/tree/85ae5bbaa7daf4da7b40e007a71a1c06b41fc053
- Commit de la dirección de rechazo: https://github.com/drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored-1M-57toks/commit/85ae5bbaa7daf4da7b40e007a71a1c06b41fc053
- Herramientas de reproducción: https://github.com/apetersson/deepseek-model-tools/tree/c3979d5f8179f2a8714ac459b0f2e242006d6ad0
- Snapshot de benchmark: https://github.com/apetersson/deepseek-model-tools/tree/dc6af888019fbbda1e2406fa62c2335bf08d2201
- Derivado MLX usado como proxy: https://huggingface.co/apetersson/DeepSeek-V4-Flash-0731-Abliterated-MLX-Mixed-2bit-3bit-g64
