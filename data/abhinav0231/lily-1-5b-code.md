# abhinav0231/Lily-1.5B-Code

## Resumen
Lily-1.5B-Code es un modelo de generacion de texto publicado en Hugging Face por el usuario abhinav0231 bajo el identificador `abhinav0231/Lily-1.5B-Code`. Por el nombre y la etiqueta `qwen2` de sus metadatos, se presenta como un modelo orientado a codigo, presumiblemente derivado de la familia Qwen2, con aproximadamente 1.540 millones de parametros segun los pesos en formato safetensors (1.543.714.304 parametros exactos). El repositorio ocupa 3,1 GB y se distribuye en formato transformers nativo.

La relevancia de esta ficha es limitada: la model card es una plantilla autogenerada por Hugging Face sin contenido sustantivo, el modelo no registra descargas ni likes, y no se ha publicado informacion sobre datos de entrenamiento, licencia, idiomas, contexto o evaluacion. Todos los campos tecnicos que no se deducen de los metadatos del Hub se marcan como "no disponible".

A dia de hoy no existe evidencia publica de calidad, benchmarks ni procedencia verificable del ajuste fino, por lo que debe tratarse como un experimento de la comunidad y no como un modelo listo para produccion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2`) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/otros no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
La unica informacion estructural disponible es la etiqueta `qwen2` en los metadatos del Hub, que sugiere una arquitectura transformer decoder-only basada en Qwen2 con atencion causal estandar, normalizacion RMSNorm y probable uso de RoPE, aunque estos detalles no estan confirmados en la model card. El numero de parametros (1.543.714.304) es coherente con un modelo de la clase 1,5B, similar en escala a Qwen2-1.5B.

No se ha publicado informacion sobre el corpus de entrenamiento (numero de tokens, composicion, filtrado), sobre el proceso de ajuste (SFT, RLHF, DPO) ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica explicitamente "[More Information Needed]" en todas las secciones de entrenamiento y evaluacion.

## Capacidades
- Generacion de texto autoregresiva mediante `transformers` y pipeline `text-generation`.
- Etiqueta `conversational`, lo que sugiere formato de chat, aunque no se documenta la plantilla de prompt.
- Orientacion a codigo inferida del sufijo `-Code` del nombre, sin evidencia publica de rendimiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso
- Prototipado rapido de asistentes de codigo en local: al ser un modelo de ~1,5B en safetensors, puede cargarse en una GPU consumer para experimentar con generacion de snippets, aunque sin benchmarks que respalden su calidad.
- Generacion de texto general en entornos de investigacion: util como baseline pequeno en experimentos de comparacion de arquitecturas Qwen2.
- Fine-tuning posterior sobre dominios concretos: su tamano reducido permite ajustarlo con LoRA en una sola GPU, partiendo de la base Qwen2.
- Despliegue en entornos con recursos limitados: 3,1 GB de pesos en precision original caben en GPUs de 8 GB o menos con cuantizacion a 8 bits.
- Educacion y demostraciones: apropiado para ensenar pipelines de `transformers` y `text-generation-inference` por su bajo coste computacional.
- Experimentacion con endpoints compatibles: la etiqueta `endpoints_compatible` permite probarlo en Hugging Face Inference Endpoints, aunque su utilidad practica queda limitada por la falta de documentacion.
- No se recomienda su uso en produccion ni en tareas criticas sin una evaluacion previa propia, dado que no hay benchmarks ni model card sustantiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en fp16/bf16: en torno a 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; aproximadamente 4-5 GB en total para contextos cortos.
- VRAM estimada en cuantizacion 8 bits: ~1,6 GB para pesos; ~2,5-3 GB en total.
- VRAM estimada en cuantizacion 4 bits (si se generara GGUF): ~0,8-1 GB para pesos; ~2 GB en total.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, 4060, 4070, 4090); en profesional, A10, L4, A100 o H100 sin problema.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6-8 GB o mas.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta presente), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). No se han publicado pesos GGUF, por lo que llama.cpp/Ollama requeririan conversion manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lily-1.5B-Code | ~1,5B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2-1.5B | ~1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (Qwen2 base) | Hugging Face, ampliamente utilizado |
| Qwen2.5-Coder-1.5B | ~1,5B | 32.768 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face, con benchmarks publicados |
| DeepSeek-Coder-1.3B | ~1,3B | 16.384 tokens (segun documentacion publica) | DeepSeek License | Hugging Face, con benchmarks publicados |

La comparativa se limita a datos publicos de los modelos alternativos; para Lily-1.5B-Code no hay benchmarks ni licencia declarada, por lo que la comparacion de rendimiento no es posible.

## Limitaciones y advertencias
- Model card autogenerada sin informacion sustantiva: no hay datos de entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: riesgo legal para uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar soporte multilingue ni calidad en castellano.
- Sin benchmarks publicados: no hay evidencia de calidad en generacion de codigo pese al sufijo `-Code`.
- Riesgo de alucinacion y sesgos: desconocido, pero inherente a modelos de ~1,5B sin ajuste documentado.
- Longitud de contexto no confirmada: no se debe asumir la ventana de 32k de Qwen2 sin verificacion.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-26): posible inconsistencia del Hub o del reloj del autor; conviene verificar la integridad del repositorio.
- No apto para produccion sin evaluacion propia y sin claridad sobre la procedencia de los pesos.

## Enlaces
- Hugging Face: https://huggingface.co/abhinav0231/Lily-1.5B-Code
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact#compute
