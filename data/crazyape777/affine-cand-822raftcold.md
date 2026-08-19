# crazyape777/affine-cand-822raftcold

## Resumen

El modelo `crazyape777/affine-cand-822raftcold` es un checkpoint experimental de la familia Affine, desarrollado por el usuario crazyape777 como parte de un sistema de minería de modelos denominado "Affine SN120". Según la model card, se trata de un "challenger" entrenado para superar al "rey vivo" en la métrica **Reason v3**, que mide la preferencia del lado del profesor (`lpC(y_C|z_A) − lpC(y_C|∅)`). No es un modelo de chat general, sino una pieza dentro de un pipeline de evaluación y duelo de modelos.

El modelo se basa en el checkpoint `unconst/Affine-5czsc2fc98-r252-merged` (revisión b42d6245) y ha sido entrenado mediante **offline DPO** (Direct Preference Optimization) sobre pares clasificados por Reason, con una configuración de LoRA (r=64, α=128), β=0.1, lr=5e-6 y una longitud máxima de contexto de 12288 tokens. Los tags indican que la arquitectura subyacente es un **Qwen3.5 MoE** (mezcla de expertos), con un total de 35.107.181.936 parámetros (35,1B). El repositorio contiene pesos en formato safetensors y ocupa 70,2 GB.

La relevancia de este modelo es limitada fuera del ecosistema Affine: está diseñado específicamente para participar en "duelos" de Reason dentro de un protocolo de minería. No se proporcionan datos de idiomas, licencia ni benchmarks estándar (MMLU, HumanEval, etc.). La información pública es escasa y no permite evaluar su rendimiento en tareas convencionales de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mezcla de expertos, según tags) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12288 tokens (según hyperparámetro max_len del entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se indica "Follows base model + Affine mining artifacts policy", sin especificar términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje basado en transformador con mezcla de expertos (MoE), según los tags `qwen3_5_moe`. El número de parámetros activos no se ha publicado, solo el total (35,1B). El modelo se construye sobre el checkpoint `unconst/Affine-5czsc2fc98-r252-merged` (r252), que a su vez es un modelo previo de la misma línea Affine.

El entrenamiento de este checkpoint específico se realizó mediante **offline DPO**, no mediante SFT ni GRPO en línea. El proceso consistió en extraer pares de respuestas clasificadas por "Reason" (una métrica del lado del profesor) y optimizar la preferencia hacia respuestas con mayor puntuación. Los datos se filtraron con "SoftCtx × HiRank" (banda de longitud de contexto suave y filtro de rango alto) y se usó un valor β=0.1 (MidBeta). Los hiperparámetros clave fueron: LoRA r=64, α=128, lr=5e-6, max_len=12288. El entrenamiento se detuvo en el paso 259 (de un objetivo de 3600) y el adaptador LoRA se fusionó con el modelo base.

La innovación técnica principal reside en el método de entrenamiento (DPO offline sobre pares clasificados por Reason) y en la integración con el protocolo Affine de minería, que evalúa modelos mediante "duelos" de razonamiento. No se han publicado detalles sobre el dataset de preentrenamiento ni sobre la composición de los datos de entrenamiento.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Optimizado para la métrica **Reason v3**, que mide la preferencia del lado del profesor sobre respuestas generadas. No se especifican capacidades de razonamiento general fuera de este contexto.
- Soporte de tool calling, function calling, agentes o multi-step reasoning: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (vision, audio, thinking mode): no documentadas. Aunque los tags incluyen `image-text-to-text`, no hay información sobre cómo se implementa la parte visual ni si el modelo final la conserva.

En resumen, las capacidades reales del modelo fuera del protocolo Affine son desconocidas. No hay evidencia pública de que pueda realizar tareas de chat, código, matemáticas o razonamiento general de forma fiable.

## Casos de uso

Dado que el modelo no está pensado como un asistente general y su documentación es mínima, los casos de uso prácticos son muy limitados:

- **Participación en el protocolo de minería Affine**: el modelo está diseñado para ser enviado como "miner submission" y competir en duelos de Reason contra otros checkpoints. Su uso principal es interno al ecosistema Affine, donde se evalúa su margen de victoria sobre el "rey vivo".
- **Evaluación de técnicas de DPO offline**: para investigadores interesados en el entrenamiento de preferencias sobre pares clasificados por métricas externas (en este caso, Reason), el checkpoint puede servir como referencia de una configuración concreta (LoRA, β, lr, etc.).
- **Análisis de la familia Affine**: como parte de una serie de experimentos (r252, r596, etc.), este modelo puede usarse para estudiar la evolución de los márgenes de Reason entre generaciones.
- **Investigación sobre modelos MoE de ~35B**: aunque no se documentan los parámetros activos, el tamaño total es relevante para estudiar el comportamiento de MoE en tareas de razonamiento específicas.
- **Reproducción de experimentos**: los hiperparámetros están detallados en la model card, lo que permite reproducir el entrenamiento si se tiene acceso a los datos de pares (no públicos).
- **Pruebas de integración con infraestructura de inferencia**: al ser un modelo safetensors estándar, puede cargarse con transformers, aunque no se recomienda para producción.

Para aplicaciones de atención al cliente, generación de código, análisis de datos o cualquier tarea de NLP convencional, este modelo no es adecuado por falta de documentación y por su naturaleza experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona métricas internas del protocolo Affine:

- **n80 vs rey vivo (reign34)**: margen +0.006196, error estándar 0.002357, z=2.63, n=75, barra de aprobación 0.004713 (~1.31×), mediana de pensamiento 199 (≥80), pase B 0.368 (≥0.30).
- **n80 vs r252 (anterior)**: margen +0.008490 (~1.19× barra), pensamiento y pase B claros.

Estas métricas son específicas del sistema Affine y no son comparables con benchmarks de NLP convencionales. No se puede afirmar que el modelo tenga un rendimiento competitivo en tareas generales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35,1B parámetros en fp16, se necesitan aproximadamente 70 GB de VRAM (el tamaño del repo es 70,2 GB). En cuantización de 8 bits se podría reducir a ~35 GB, y en 4 bits a ~18 GB, pero no se han publicado archivos cuantizados.
- **GPU recomendadas**: para inferencia en fp16 se necesitan GPU de centro de datos como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, no suficiente para fp16 completo). En cuantización 4 bits podría caber en RTX 4090 (24 GB) o similar, pero no hay garantía.
- **Si cabe en consumer GPU**: solo con cuantización agresiva (4 bits) y a costa de pérdida de precisión. No se han proporcionado archivos GGUF ni AWQ.
- **Opciones de despliegue**: al ser un modelo safetensors estándar, se puede cargar con transformers y servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte oficial documentado.
- **Latencia y throughput**: no disponibles. Para un modelo MoE de 35B, la latencia dependerá del número de parámetros activos (desconocido) y del hardware. Sin datos, no se puede estimar.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma familia Affine con métricas públicas estándar. El modelo es un artefacto experimental dentro de un protocolo privado, y no hay alternativas de la misma categoría (modelos MoE de ~35B con entrenamiento DPO offline para razonamiento) con datos públicos comparables.

## Limitaciones y advertencias

- **Modelo experimental**: no está pensado para uso general. La model card indica explícitamente "Not a general chat model".
- **Sesgos y alucinaciones**: no se han evaluado. Al ser un modelo entrenado con DPO sobre un conjunto de pares específico, puede tener sesgos derivados de los datos de entrenamiento, que no son públicos.
- **Riesgo de alucinación**: no documentado, pero probablemente alto fuera del dominio de entrenamiento (Reason v3).
- **Limitaciones de contexto**: la longitud máxima de entrenamiento es 12288 tokens, lo que limita tareas de contexto largo.
- **Idiomas**: no se especifican. Podría estar limitado a un idioma o a un conjunto reducido.
- **Restricciones de licencia**: la licencia no está disponible. Se menciona una "Affine mining artifacts policy" sin detallar, lo que impide conocer si se permite uso comercial o modificación.
- **Caveats de producción**: no se recomienda su uso en entornos de producción por falta de documentación, licencia y evaluación de seguridad. El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- **Integridad del modelo**: al ser un checkpoint fusionado de un adaptador LoRA, no se garantiza que los pesos sean estables ni que el modelo funcione correctamente fuera del contexto Affine.

## Enlaces

- [HuggingFace: crazyape777/affine-cand-822raftcold](https://huggingface.co/crazyape777/affine-cand-822raftcold)
- [Modelo base: unconst/Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged) (enlace inferido del ID, no verificado)
- No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo en la búsqueda web.
