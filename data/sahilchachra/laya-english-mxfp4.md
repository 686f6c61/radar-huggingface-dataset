# sahilchachra/Laya-English-MXFP4

## Resumen

Laya-English-MXFP4 es una cuantización en formato MXFP4 del backbone encoder en inglés de Laya, el modelo de decisión de Convai Innovations. El checkpoint lo publica sahilchachra y contiene únicamente el encoder bidireccional compartido, derivado de ModernBERT-large (421M parámetros, 1024 de dimensión oculta, 28 capas), cuantizado con MLX para ejecución en Apple Silicon con un tamaño en disco de aproximadamente 210 MB.

El modelo resuelve un problema concreto: permitir la extracción de características y el prototipado de cabezas de clasificación con un encoder de tipo ModernBERT en hardware de Apple, sin necesidad de GPU dedicada. No incluye la cabeza de decisión propietaria de Laya (un módulo torch de unos 15M de parámetros con un TransformerEncoder de 2 capas, un scorer de marcadores de opción y una cabeza act/escalate), por lo que no reproduce la API de decisión del modelo original.

Es relevante ahora porque el proyecto Laya se presenta como una familia abierta de modelos de decisión tipo "System 1" que responde preguntas tipadas con probabilidades calibradas en unos 33 ms por decisión, y esta cuantización ofrece una vía práctica para reutilizar su encoder en pipelines locales de MLX. Su utilidad principal es como extractor de características cuantizado y como base para construir cabezas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) con atención global/local alternada; `ModernBertModel` vía mlx-embeddings |
| Parametros totales | 394.781.696 según los tensores del checkpoint en safetensors; el modelo base ModernBERT-large declara 421M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | MXFP4 (mode="mxfp4", group size 32); existe una variante hermana en MXFP8 |
| Idiomas soportados | Inglés (este checkpoint es el backbone inglés; existen variantes multilingües separadas). El metadato de Hugging Face no declara idiomas |
| Licencia | No declarada en el repositorio de Hugging Face; el proyecto upstream Laya figura como Apache 2.0 según fuentes web (verificar antes de uso comercial) |
| Formato de pesos | safetensors (formato MLX, `model.safetensors`), ~0,2 GB de repositorio |

## Arquitectura y entrenamiento

El checkpoint corresponde al backbone `ModernBertModel`, un encoder transformer bidireccional con 28 capas, dimensión oculta 1024, atención local de ventana 128 y atención global cada 3 capas, con parámetros RoPE diferenciados para atención global y deslizante. Está implementado para MLX a través de mlx-embeddings y cuantizado con `nn.quantize(..., mode="mxfp4", group_size=32)`. El modelo original Laya combina este encoder con una cabeza de decisión creada desde cero (un `torch.nn.TransformerEncoder` de 2 capas, un scorer de marcadores de opción y una cabeza act/escalate) definida en su `rl_common.py` y entrenada por separado con RL (RLCD). Esa cabeza no se incluye aquí: según el autor, es un módulo torch de unos 15M de parámetros que no se beneficia de la cuantización MLX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el detalle del proceso de RLHF/DPO del modelo base en la información proporcionada. La validación técnica publicada por el autor sí está documentada: el port MLX sin cuantizar del encoder se comparó contra la referencia en torch (`answerdotai/ModernBERT-large` y pesos mmBERT-base cargados mediante `rl_common.build_model`) con un error absoluto máximo de 0,045 y un error absoluto medio de 0,0025 sobre hidden states de magnitud media absoluta ~0,63, lo que confirma la corrección numérica del port. La innovación destacable es precisamente el empaquetado MXFP4 del backbone para MLX, con verificación end-to-end contra la cabeza de decisión original en torch.

## Capacidades

- Extracción de características y generación de embeddings de texto en inglés (`last_hidden_state`), orientada a `feature-extraction`.
- Clasificación de texto cuando se le añade una cabeza entrenada aparte (el pipeline declarado es `feature-extraction`, con etiquetas de `text-classification`).
- Codificación bidireccional con atención local/global, adecuada para tareas de comprensión (no generativas).
- Ejecución en Apple Silicon mediante MLX y mlx-embeddings.
- Integración con la cabeza de decisión original de Laya: los hidden states de este encoder cuantizado pueden alimentar la cabeza torch sin modificar, lo que permite evaluar la deriva de cuantización de extremo a extremo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step (no es un modelo autorregresivo).
- No dispone de modo "thinking", visión ni audio.
- No dispone de plantilla de chat ni de ruta `generate()`, por lo que no es un modelo conversacional.
- Capacidades multilingües: no en este checkpoint; las variantes multilingües se publican en repositorios separados.

## Casos de uso

- Extracción de embeddings para búsqueda semántica local en Mac: el encoder cabe en unos 210 MB y permite indexar y consultar corpus pequeños o medianos sin salir del equipo, aprovechando MLX sobre memoria unificada.
- Clasificación y moderación en el dispositivo: congelando el encoder y entrenando una cabeza ligera sobre los embeddings, se pueden desplegar clasificadores de sentimiento o moderación que corren en un portátil Apple Silicon.
- Preprocesado dentro de un pipeline de decisión tipo Laya: usar este encoder cuantizado para alimentar la cabeza de decisión torch original y medir cuánto se degrada la calidad de decisión respecto al encoder bf16.
- Deduplicación y clustering de documentos: los embeddings del encoder permiten agrupar documentos similares en tareas de limpieza de datasets o de gestión documental.
- Reranking ligero en un pipeline de recuperación: recalcular la similitud de una lista corta de candidatos con el encoder cuantizado, reduciendo el coste frente a un cross-encoder de mayor tamaño.
- Prototipado e investigación en MLX: sirve como bloque de construcción para probar arquitecturas de cabeza propias sin depender de CUDA, con un ciclo de iteración rápido en portátiles.
- Evaluación de deriva por cuantización: comparar salidas MXFP4 frente a MXFP8 y frente a la referencia fp32 para calibrar el impacto de la cuantización por bloques en encoders con muchas LayerNorm.
- Fine-tuning de cabezas de clasificación sobre embeddings congelados, con la ventaja de que los pesos del backbone no necesitan actualizarse ni almacenarse en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de verificación numérica y de deriva por cuantización, que se recogen a continuación.

Verificación del port MLX sin cuantizar frente a la referencia torch:

| Metrica | Valor |
|---|---|
| Error absoluto maximo en `last_hidden_state` | 0,045 |
| Error absoluto medio en `last_hidden_state` | 0,0025 |
| Magnitud media absoluta de los hidden states de referencia | ~0,63 |

Calidad de decisión end-to-end (hidden states del encoder cuantizado alimentando la cabeza torch original de Laya, comparados con el pipeline torch completo en preguntas reales de tipo choice, score y noul, con prompts de moderación y sentimiento):

| Metrica | MXFP4 | MXFP8 |
|---|---|---|
| Error absoluto medio del hidden state vs fp32 | 0,287 | 0,218 |
| Diferencia absoluta maxima de logits en la cabeza de decision | 0,897 | 0,959 |
| Respuestas top-1 erroneas (de 3 preguntas) | 0/3 | 0/3 |

El propio autor advierte de que en la variante Typed-Decisions MXFP8 una de las tres preguntas de prueba, con dos opciones puntuadas de forma muy próxima, invirtió su respuesta top-1; las respuestas top-1 coincidieron en 5 de 6 combinaciones de checkpoint y modo.

## Requisitos de hardware

- VRAM o memoria unificada: los pesos ocupan aproximadamente 210 MB; con activaciones y lotes pequeños el consumo se mantiene en unos cientos de MB, muy por debajo de cualquier límite práctico.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con 8 GB o más de memoria unificada. No es un checkpoint ejecutable directamente en CUDA o ROCm, al estar en formato MLX.
- GPU recomendadas: no aplica a este checkpoint. El pipeline completo de Laya se reporta a unos 33 ms por decisión en una única GPU, pero la información disponible no especifica el modelo concreto de GPU.
- Opciones de despliegue: mlx-embeddings sobre MLX (`pip install mlx-embeddings`), cargando `ModernBertModel` y los pesos con `safe_open` más `nn.quantize`. No es compatible con LM Studio, ya que no existe ruta `generate()` ni plantilla de chat.
- Alternativas para NVIDIA: usar el repositorio original `convaiinnovations/laya` en torch; para MLX, las variantes MXFP8 y multilingües publicadas por el mismo autor.
- Latencia y throughput: no disponibles para este checkpoint concreto; solo se conoce la cifra agregada de ~33 ms por decisión en el sistema Laya completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato / runtime | Licencia |
|---|---|---|---|---|---|
| sahilchachra/Laya-English-MXFP4 | 394,8M (checkpoint cuantizado) | 512 tokens | MXFP4, group size 32 | safetensors / MLX | no declarada en el repo |
| sahilchachra/Laya-English-MXFP8 | no disponible | 512 tokens (mismo encoder) | MXFP8 | safetensors / MLX | no declarada en el repo |
| sahilchachra/Laya-Multilingual-MXFP4 | no disponible | no disponible | MXFP4 | safetensors / MLX | no declarada en el repo |
| convaiinnovations/laya (upstream) | 421M de encoder + ~15M de cabeza de decision | 512 tokens | bf16 / fp32 | torch | Apache 2.0 segun fuentes web |
| answerdotai/ModernBERT-large (referencia del encoder) | 421M | no disponible en la informacion proporcionada | bf16 / fp32 | safetensors | no disponible en la informacion proporcionada |
| TypeSafe Jev | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Jev aparece únicamente como referencia cualitativa en fuentes web, que la describen como otro modelo de decisión que responde preguntas tipadas con probabilidades calibradas en lugar de generar texto; no se dispone de cifras verificables para una comparación numérica.

## Limitaciones y advertencias

- Sensibilidad alta a la cuantización por bloques: el propio autor señala que este encoder de ~421M con abundantes LayerNorm sufre una deriva de hidden states en términos relativos del 35 al 45% (error medio absoluto de 0,287 en MXFP4 y 0,218 en MXFP8), frente al 1-5% típico de modelos decoder-only cuantizados en MXFP4.
- Riesgo de desempate erróneo: en una pregunta de tipo score con dos opciones muy próximas, la variante Typed-Decisions MXFP8 invirtió la respuesta top-1. Los scores de confianza de variantes cuantizadas deben tratarse como direccionales, no exactos.
- No es un modelo generativo: no hay ruta `generate()` ni plantilla de chat, por lo que no sirve para generación de texto, tool calling, agentes ni razonamiento multi-step.
- Cabeza de decisión ausente: sin el repositorio upstream `convaiinnovations/laya` no se puede reproducir la API `laya.load(...)` ni `RLAgent`; este repo es solo el encoder.
- Contexto limitado a 512 tokens, insuficiente para documentos largos sin troceado previo.
- Solo inglés en este checkpoint; el multilingüismo requiere las variantes específicas.
- Licencia no declarada en el repositorio de Hugging Face. Aunque el proyecto upstream figura como Apache 2.0 en fuentes web, conviene confirmar los términos exactos antes de un uso comercial.
- Sesgos: no se dispone de información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Deriva frente al original: para decisiones con desempate sensible o que requieran calibración fina, se recomienda el encoder bf16/fp32 original o recalibrar la cabeza sobre las salidas cuantizadas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Restricciones de plataforma: al estar en formato MLX, no se ejecuta en CUDA ni en ROCm sin reconvertir los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sahilchachra/Laya-English-MXFP4
- Modelo base de Laya: https://huggingface.co/convaiinnovations/laya
- Variantes del mismo autor:
  - https://huggingface.co/sahilchachra/Laya-English-MXFP8
  - https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP4
  - https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP8
  - https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP4
  - https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP8
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Ficha de Laya en AI Pro Playbook: https://aiproplaybook.com/tools/laya
- MLX: https://github.com/ml-explore/mlx
- mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
- Referencia del encoder: https://huggingface.co/answerdotai/ModernBERT-large
- Perfil y colecciones del autor: https://huggingface.co/sahilchachra/collections
- Perfil de GitHub del autor: https://github.com/SahilChachra/SahilChachra
- Otro modelo del autor (referencia de su linea de cuantizaciones MXFP4): https://huggingface.co/sahilchachra/LFM2.5-VL-3B-MXFP4
