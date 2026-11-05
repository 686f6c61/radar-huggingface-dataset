# CometForest/zils-mini-body-1

## Resumen

zils-mini-body-1 es un modelo de lenguaje publicado en HuggingFace por el usuario CometForest bajo licencia Apache-2.0. Según su model card, se trata de un "body" (cuerpo base) destinado al pool de modelos tipo "soup" denominado Zils `d3-mini`, y está derivado de modelos con licencia Apache-2.0, concretamente de Qwen/Qwen3.5-4B y de fine-tunes abiertos de este. El repositorio contiene únicamente pesos en formato safetensors, con un total de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones).

La relevancia del modelo es limitada por el momento: no cuenta con descargas ni interacciones en HuggingFace, no tiene pipeline declarado y la model card es extremadamente escueta, sin información sobre datos de entrenamiento, benchmarks, idiomas o capacidades. Por tanto, cualquier evaluación técnica debe tratarse como preliminar y basada casi exclusivamente en los metadatos del repositorio y en la arquitectura del modelo base del que deriva.

El interés principal radica en su posible uso como componente dentro de un ensemble o "model soup" (mezcla de pesos) orientado a tareas de generación de texto, pero no hay evidencia publicada de su rendimiento ni de su comportamiento en producción. Se recomienda precaución y validación empírica antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.5-4B, presumiblemente transformer decoder-only) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan GGUF u otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. La model card indica que deriva de Qwen/Qwen3.5-4B y de fine-tunes abiertos del mismo, lo que sugiere una arquitectura transformer decoder-only con aproximadamente 4,5 mil millones de parámetros, coherente con el recuento de safetensors. No obstante, no se confirma si se han aplicado técnicas de mezcla de pesos (model soup), destilación, pruning u otras transformaciones.

Tampoco se documentan los datos de entrenamiento: no hay número de tokens, composición del dataset, ni indicios de RLHF, DPO o SFT. La única pista es la etiqueta "zils" y la referencia a un "d3-mini soup pool", que sugiere que el modelo forma parte de un conjunto de variantes obtenidas por combinación de pesos de modelos base y fine-tunes. Sin model card técnica ni paper asociado, cualquier afirmación sobre innovaciones (atención lineal, decodificación especulativa, etc.) sería especulativa.

## Capacidades

- Generación de texto: capacidad esperable por herencia de Qwen3.5-4B, pero no verificada ni documentada en la model card.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Uso como componente de ensemble o model soup: es el propósito declarado implícitamente por el autor.

## Casos de uso

- Experimentación con model soups: el modelo puede emplearse como "body" dentro de un pool de mezcla de pesos para investigar técnicas de ensemble a nivel de parámetros, dado que el autor lo presenta explícitamente como parte del pool Zils `d3-mini`.
- Generación de texto general en prototipos: por su tamaño (~4,5 B) y licencia Apache-2.0, puede servir para prototipos de chatbots o asistentes de texto en entornos de investigación, siempre con validación previa.
- Fine-tuning posterior: al distribuirse en safetensors y con licencia permisiva, es candidato a servir como base para ajuste fino supervisado en dominios específicos.
- Evaluación comparativa de ensembles: útil para estudiar cómo afecta la mezcla de pesos al rendimiento frente al modelo base Qwen3.5-4B.
- Despliegue en hardware de gama media: con ~4,5 B de parámetros, es viable en GPUs consumer con cuantización, aunque no se documentan formatos cuantizados oficiales.
- Investigación sobre linaje de modelos: permite analizar la trazabilidad y el impacto de derivar modelos de fine-tunes abiertos de Qwen3.5-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4,5 B en safetensors (FP16/BF16), se requerirían aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; el tamaño del repo (9,1 GB) es coherente con pesos en precisión de 16 bits.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en GPUs con 16-24 GB de VRAM (RTX 4090, A10G, L4) en FP16, y en GPUs de 8-12 GB con cuantización, pero no hay confirmación del autor.
- ¿Cabe en consumer GPU?: probablemente sí con cuantización (RTX 3060 12 GB, RTX 4070, etc.), pero no está documentado ni se distribuyen pesos GGUF oficiales.
- Opciones de despliegue: no disponible. Al ser safetensors, sería compatible con frameworks como vLLM, TGI o transformers, pero no hay guía ni configuración publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-1 | ~4,54 B | no disponible | Apache-2.0 | HuggingFace (0 descargas) | Derivado de Qwen3.5-4B y fine-tunes; sin benchmarks |
| Qwen/Qwen3.5-4B | ~4 B (según referencia del autor) | no disponible | Apache-2.0 (según referencia) | HuggingFace | Modelo base del que deriva |
| Fine-tunes abiertos de Qwen3.5-4B | variable | no disponible | variable (Apache-2.0 en los citados) | HuggingFace | Fuente de la mezcla |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre datos de entrenamiento, evaluación, sesgos o idiomas, lo que impide garantizar un comportamiento fiable.
- Riesgo de alucinación: no evaluado; al ser un modelo derivado sin benchmarks publicados, no puede descartarse un comportamiento degradado respecto al base.
- Sesgos conocidos: no disponibles; se heredarían, en su caso, de Qwen3.5-4B y de los fine-tunes utilizados, pero no se documentan.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben verificarse las licencias de los modelos fuente y de los fine-tunes empleados en la mezcla, así como posibles obligaciones de atribución.
- Caveat para producción: con 0 descargas y 0 likes, el modelo no ha sido validado por la comunidad; no se recomienda su uso en producción sin una evaluación empírica exhaustiva.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene verificar la autenticidad y procedencia del repositorio antes de confiar en él.

## Enlaces

- HuggingFace: https://huggingface.co/CometForest/zils-mini-body-1
- Modelo base citado: https://huggingface.co/Qwen/Qwen3.5-4B (referencia en la model card; no verificado)
