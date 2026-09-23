# sahilchachra/Laya-Multilingual-MXFP4

## Resumen

Laya-Multilingual-MXFP4 es una cuantización en formato MXFP4 del backbone encoder multilingüe de convaiinnovations/laya, publicada por el usuario sahilchachra para su uso con MLX en Apple Silicon. El modelo subyacente es mmBERT-base, un encoder bidireccional tipo ModernBERT que cubre más de 100 idiomas, con 768 dimensiones ocultas, 22 capas y una ventana de contexto de 1024 tokens. El repositorio contiene únicamente el encoder compartido, no la cabeza de decisión de Laya.

La relevancia de esta publicación es práctica: reduce el peso en disco del encoder a unos 163 MB, lo que permite ejecutar extracción de características multilingües en memoria unificada de un Mac sin GPU dedicada. Está pensada como extractor de características generalista o como base para construir cabezas personalizadas en MLX, no como sustituto de la API de decisión de Laya.

Es importante remarcar que no es un modelo generativo: no hay plantilla de chat ni ruta `generate()`, y la propia model card advierte de que es un encoder pequeño con muchas LayerNorm, por lo que es sensible a la cuantización por bloques. La licencia no está declarada y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder bidireccional, puerto MLX vía mlx-embeddings) |
| Parametros totales | 306.939.648 según safetensors del repo (la model card cita ~322 M para el backbone mmBERT-base) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | MXFP4, group size 32, bits 4 (`nn.quantize(..., mode="mxfp4")`) |
| Idiomas soportados | 100+ idiomas según la model card del backbone mmBERT-base; lista concreta no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), acompañado de config.json y tokenizer |
| Tamano en disco | ~163 MB (el repositorio de HuggingFace ocupa 0,2 GB) |
| Capas / dimension oculta | 22 capas, 768 dimensiones ocultas |
| Libreria | mlx (mlx-embeddings) |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT portado a MLX mediante mlx-embeddings y posteriormente cuantizado. Mantiene la atención local con ventana de 128 tokens y atención global cada 3 capas (`global_attn_every_n_layers: 3`, `local_attention: 128`), con parámetros RoPE separados para atención completa y deslizante. La cuantización se aplica con `nn.quantize` en modo MXFP4 con group size 32, afectando únicamente a las capas con `to_quantized` presente en los pesos.

El entrenamiento original corresponde a Laya: mmBERT-base como encoder compartido más una cabeza de decisión construida desde cero (un `torch.nn.TransformerEncoder` de 2 capas, un scorer de marcadores de opción y una cabeza act/escalate definida en el `rl_common.py` del proyecto Laya), entrenada por separado con RL (RLCD). Este repositorio no incluye dicha cabeza: solo publica el backbone encoder cuantizado. La model card justifica la decisión indicando que la cabeza es un módulo torch de ~15 M de parámetros, sin compilar, que no se beneficia de la cuantización MLX y que no haría utilizable la API `laya.load(...)` / `RLAgent`, que espera un directorio de modelo torch tal cual.

## Capacidades

- Extracción de características y generación de embeddings de texto multilingües a partir del `last_hidden_state` del encoder.
- Codificación bidireccional de secuencias de hasta 1024 tokens.
- Uso como backbone congelado para clasificación de texto si se le añade una cabeza propia (el tag `text-classification` aparece en el repositorio, pero la cabeza no se distribuye aquí).
- Soporte multilingüe heredado de mmBERT-base (más de 100 idiomas según la model card del backbone).
- Integración con el ecosistema MLX en Apple Silicon mediante mlx-embeddings.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por sí mismo.
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: no existe plantilla de chat ni ruta `generate()`.

## Casos de uso

- Búsqueda semántica y recuperación multilingüe (RAG): el encoder genera embeddings de consultas y documentos en más de 100 idiomas con un consumo de memoria mínimo, lo que permite indexar corpus grandes y ejecutar la recuperación en el propio Mac del desarrollador.
- Clasificación de texto personalizada: partiendo del `last_hidden_state` congelado, se puede entrenar una cabeza ligera en MLX para moderación, análisis de sentimiento o etiquetado de intenciones, aprovechando que el encoder ya está multilingüe.
- Deduplicación y clustering de documentos: los embeddings permiten agrupar textos casi idénticos en corpus multilingües sin depender de servicios en la nube.
- Prototipado on-device sin GPU NVIDIA: al ocupar unos 163 MB en disco, se puede iterar en un portátil Apple Silicon sin aprovisionar infraestructura CUDA.
- Enrutado semántico en pipelines: usar las representaciones del encoder para decidir a qué modelo o rama de un sistema se envía cada consulta, con latencia baja al no requerir generación.
- Investigación sobre cuantización agresiva: el repositorio sirve como caso de estudio de cómo un encoder con muchas LayerNorm se degrada bajo MXFP4, y permite comparar contra las variantes MXFP8 publicadas por el mismo autor.
- Extracción de características por lotes en tuberías de preprocesado: al ser un encoder no generativo, el coste por documento es determinista y fácil de presupuestar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye una verificación numérica propia frente a la referencia torch en bf16/fp32:

| Metrica | Valor |
|---|---|
| Puerto MLX sin cuantizar: max abs diff vs torch en `last_hidden_state` | 0,045 |
| Puerto MLX sin cuantizar: mean abs diff vs torch | 0,0025 (magnitud media de los hidden states ~0,63) |

Comparación de la versión cuantizada contra la referencia fp32, alimentando la cabeza de decisión torch original sin modificar:

| Metrica | MXFP4 | MXFP8 |
|---|---|---|
| Diferencia media absoluta del hidden state del encoder vs fp32 | 0,287 | 0,218 |
| Diferencia máxima absoluta del logit de la cabeza de decisión | 1,157 | 0,806 |
| Respuestas top-1 no coincidentes (sobre 3 preguntas de prueba) | 0/3 | 0/3 |

La propia model card matiza que, agregando todas las combinaciones de checkpoint y modo evaluadas, las respuestas top-1 coincidieron en 5 de 6 casos, y que una pregunta de tipo score del checkpoint typed-decisions en MXFP8 invirtió su respuesta top-1.

## Requisitos de hardware

- Pesos en disco: ~163 MB (repositorio de 0,2 GB en HuggingFace).
- VRAM/unified memory estimada para inferencia: no publicada de forma explícita. Partiendo de los 306,9 M de parámetros en MXFP4 con group size 32, los pesos ocupan del orden de 0,16 GB, a lo que se suman activaciones y buffers para secuencias de hasta 1024 tokens; el consumo agregado debería mantenerse muy por debajo de 1 GB.
- GPU recomendadas: no aplica en el sentido habitual; el destino es Apple Silicon con memoria unificada. No hay datos publicados para A100, H100 o RTX 4090 en este formato.
- Compatibilidad con GPU de consumo: el formato MLX no se ejecuta en GPUs NVIDIA. Para usar CUDA habría que reconvertir los pesos a PyTorch u otro runtime, algo que este repositorio no ofrece.
- Cabe en cualquier Mac con Apple Silicon, incluidas configuraciones con 8 GB de memoria unificada, dado el reducido tamaño del modelo.
- Opciones de despliegue: mlx-embeddings (el snippet de la model card carga `ModernBertModel`, aplica `nn.quantize` con `group_size`, `bits` y `mode` leídos del config, y llama a `load_weights` con `strict=True`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y LM Studio queda descartado explícitamente al no existir ruta `generate()` ni plantilla de chat.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato / cuantizacion | Parametros | Contexto | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Laya-Multilingual-MXFP4 (este repo) | MXFP4, group size 32 | 306.939.648 | 1024 | ~163 MB | no disponible | Solo encoder, sin cabeza de decisión |
| Laya-Multilingual-MXFP8 | MXFP8 | no disponible | 1024 (heredado) | no disponible | no disponible | Variante del mismo autor con menor degradación numérica |
| aac6fef/laya-multilingual-mlx | MLX (sin detalle de cuantización) | no disponible | no disponible | no disponible | no disponible | Puerto MLX independiente del encoder multilingüe |
| convaiinnovations/laya | bf16/fp32 torch | ~322 M en el backbone + ~15 M de cabeza | 1024 | 678 MB (repo laya-multilingual) | no disponible | Modelo completo con cabeza de decisión y API `RLAgent` |
| mmBERT-base (answerdotai/ModernBERT-base y familia) | safetensors bf16/fp32 | ~322 M | 1024 | no disponible | no disponible | Referencia original del backbone, sin cuantizar |

## Limitaciones y advertencias

- No es un modelo generativo: carece de plantilla de chat y de ruta `generate()`, por lo que no sirve para completar texto ni para conversación.
- No incluye la cabeza de decisión de Laya, así que no es usable con la API `laya.load(...)` ni con `RLAgent`. Para esa funcionalidad hay que usar el repositorio original convaiinnovations/laya.
- Sensibilidad alta a la cuantización por bloques: al ser un encoder pequeño con muchas LayerNorm, la perturbación media absoluta de los hidden states es del 35-45 %, frente al 1-5 % típico de modelos decoder-only cuantizados en MXFP4.
- Riesgo de inversión en decisiones sensibles a empates: en la verificación del autor, una de tres preguntas de prueba invirtió su respuesta top-1. Las puntuaciones de confianza cuantizadas deben tratarse como direccionales, no exactas.
- Si se necesitan decisiones calibradas o desempates finos, la recomendación explícita del autor es usar el encoder original en bf16/fp32.
- Ventana de contexto corta (1024 tokens), limitante para documentos largos; habría que trocear y agregar.
- Licencia no declarada: no se puede asumir permiso para uso comercial. Conviene contactar con el autor o con el proyecto Laya antes de integrarlo en producción.
- Idiomas: aunque el backbone cubre más de 100 idiomas, el repositorio no documenta la lista concreta ni la cobertura real por idioma.
- Madurez: el repositorio registra 0 descargas y 0 valoraciones, sin validación independiente de la comunidad.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni de la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP4
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Encoder multilingüe upstream: https://huggingface.co/convaiinnovations/laya-multilingual/tree/main
- Variante MXFP8 multilingüe: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP8
- Variante MXFP4 en inglés: https://huggingface.co/sahilchachra/Laya-English-MXFP4
- Variante MXFP8 en inglés: https://huggingface.co/sahilchachra/Laya-English-MXFP8
- Variante typed-decisions MXFP4: https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP4
- Variante typed-decisions MXFP8: https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP8
- Puerto MLX alternativo: https://huggingface.co/aac6fef/laya-multilingual-mlx
- mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
- MLX: https://github.com/ml-explore/mlx
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Laya AI (modelo de decisión open source): https://laya-ai.com/
- Perfil del autor en GitHub: https://github.com/SahilChachra/SahilChachra
