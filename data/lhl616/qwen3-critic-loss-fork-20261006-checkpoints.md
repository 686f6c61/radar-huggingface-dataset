# lhl616/qwen3-critic-loss-fork-20261006-checkpoints

## Resumen

Este repositorio, publicado por el usuario lhl616, no contiene un modelo listo para usar, sino un archivo de checkpoints de investigación derivados de un proceso de ajuste con PPO sobre Qwen3-4B-Base. Concretamente, alberga tres ramas de continuación (native, alpha025 y lr_half) desde el paso 300 hasta el 308 de entrenamiento, con variaciones en la tasa de aprendizaje del crítico. El tamaño del repositorio (101,2 GB) refleja que incluye shards FSDP en su precisión original, no pesos consolidados en un único formato.

El problema que aborda es de reproducibilidad y auditoría de experimentos de RLHF: permite a investigadores inspeccionar y evaluar el estado de los actores y críticos en un punto concreto del entrenamiento. Es relevante ahora porque documenta de forma explícita las limitaciones de continuidad (falta de estados del optimizador) y porque separa claramente los checkpoints de actor de los críticos, que no son modelos de lenguaje causal ordinarios sino modelos de valor por token.

La licencia es Apache 2.0 y se retiene la atribución del modelo Qwen original. No se trata de un modelo entrenado desde cero ni de una replicación independiente con semillas distintas, sino de ramas de una misma ejecución. No hay datos publicados sobre arquitectura interna, contexto o idiomas más allá de la referencia a Qwen3-4B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado de Qwen/Qwen3-4B-Base; el repositorio contiene checkpoints FSDP de actor y crítico, no un modelo consolidado) |
| Parametros totales | No disponible (referencia a Qwen3-4B-Base, sin confirmación de recuento en la información) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los shards conservan precisión original; se menciona una exportación BF16 separada, no byte-idéntica a la fuente FP32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Shards FSDP `model_world_size_4_rank_*.pt` (PyTorch pickle), safetensors en exportaciones derivadas; el subdirectorio `huggingface/` solo contiene configuración y tokenizador, no pesos fusionados |

## Arquitectura y entrenamiento

El contenido son checkpoints de un entrenamiento PPO (familia PPO) sobre Qwen3-4B-Base, con actores distribuidos en cuatro shards FSDP (`model_world_size_4_rank_*.pt`) que requieren utilidades de carga o fusión compatibles con PyTorch/VERL. Se documentan tres ramas de continuación de ocho lotes (pasos 300 a 308): native, alpha025 y lr_half, esta última con la mitad de tasa de aprendizaje del crítico. No son réplicas independientes con semillas distintas, sino bifurcaciones de una misma ejecución.

Los críticos son modelos de valor por token, no modelos de lenguaje causal ordinarios: los críticos nativos usan una cabeza escalar de valor, mientras que en HL-Gauss la cabeza tiene 101 logits sobre bins en el rango [-1,2, 1,2], con centros `-1.2 + (i+0.5)*2.4/101` y valor calculado como media ponderada por softmax en FP32 de esos centros; los objetivos gaussianos usan sigma `0.75*2.4/101`. El archivo categórico incluye además una implementación de referencia matemática pequeña que depende del entorno VERL original para sus hooks de entrenamiento. No se redistribuye el dataset de entrenamiento ni se documenta el número de tokens utilizado.

## Capacidades

- Evaluación de modelos: los checkpoints preservan la capacidad de evaluación del modelo, según la model card.
- Actores PPO: shards FSDP cargables con utilidades compatibles con PyTorch/VERL para inspección o fusión.
- Críticos de valor: cabezas escalares (nativas) o categóricas HL-Gauss con 101 bins para estimación de valor por token.
- Implementación de referencia: incluida una implementación matemática pequeña para el caso categórico.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se declara soporte de thinking mode ni de function calling.

## Casos de uso

- Auditoría de experimentos de RLHF: cargar los shards del actor en el paso 308 y comparar las tres ramas (native, alpha025, lr_half) para estudiar el efecto de la tasa de aprendizaje del crítico en la política resultante.
- Investigación en estimación de valor: usar los críticos HL-Gauss con 101 bins para analizar la distribución de valores por token y validar la implementación de referencia incluida.
- Reproducción parcial de curvas de entrenamiento: reutilizar los checkpoints como punto de partida para continuaciones controladas, asumiendo que no es posible una continuación exacta sin los estados del optimizador.
- Docencia y formación: estudiar la estructura de checkpoints FSDP y la separación entre actor y crítico en un pipeline PPO real.
- Verificación de integridad de publicaciones: emplear `archive_manifest.json` y la documentación de cobertura para comprobar qué ficheros están presentes y qué transformaciones se aplicaron a las copias de configuración.
- Análisis de seguridad de artefactos: inspeccionar metadatos de checkpoints PyTorch sin deserializar y cargar únicamente artefactos `.pt` en entornos de confianza, como advierte la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 101,2 GB e incluye shards en precisión original (FP32 para la fuente, según la nota sobre exportaciones BF16).
- GPU recomendadas: no disponibles; el entrenamiento usó FSDP con cuatro shards (`model_world_size_4_rank_*.pt`), lo que sugiere un despliegue multi-GPU, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible; el tamaño del repositorio y la naturaleza de los shards hacen improbable una carga directa en una única GPU de consumo sin fusión y conversión previas.
- Opciones de despliegue: carga mediante utilidades compatibles con PyTorch/VERL; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lhl616/qwen3-critic-loss-fork-20261006-checkpoints | No disponible (derivado de Qwen3-4B-Base) | No disponible | Sin benchmarks publicados | Apache 2.0 | Checkpoints de investigación, no modelo consolidado |
| Qwen/Qwen3-4B-Base | No disponible en la información | No disponible | No disponible | No disponible en la información | Modelo base público en HuggingFace |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas concretas; la única referencia explícita es Qwen/Qwen3-4B-Base como modelo de origen.

## Limitaciones y advertencias

- No es un modelo `from_pretrained`: la raíz del repositorio no constituye un modelo Transformers cargable directamente; el subdirectorio `huggingface/` solo contiene configuración y tokenizador.
- Continuidad incompleta: los ficheros del optimizador no están incluidos y muchos estados Adam originales ya se habían eliminado antes de la publicación; los estados de RNG, scheduler y dataloader no permiten una continuación exacta.
- Sin validación de restauración: la publicación no reclama validación de forward pass ni de restauración.
- Riesgo de seguridad: solo deben cargarse artefactos `.pt` basados en pickle en entornos de confianza; los metadatos se inspeccionaron sin deserializar.
- Cobertura incompleta durante la subida: el manifiesto describe la cobertura prevista, pero no todos los ficheros listados pueden estar presentes mientras las subidas estén en curso.
- Naturaleza experimental: no se reclama una mejora de rendimiento estable ni superioridad causal; las ramas de continuación y las muestras de política propia no son evaluaciones pareadas intercambiables.
- Críticos no son modelos de lenguaje: no deben usarse como modelos causales ordinarios; las cabezas de valor requieren el cálculo específico descrito (media ponderada por softmax en FP32 para HL-Gauss).
- Sin dataset redistribuido: el repositorio no incluye datos de entrenamiento, registros de rollouts ni logs internos completos.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- Uso comercial: la licencia Apache 2.0 se retiene, pero se debe conservar la atribución de Qwen según `LICENSE` y `NOTICE`.

## Enlaces

- HuggingFace: https://huggingface.co/lhl616/qwen3-critic-loss-fork-20261006-checkpoints
- Modelo de origen: https://huggingface.co/Qwen/Qwen3-4B-Base (referenciado en la model card)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
