# nie-vans/poolformer-retrieval-quantized

## Resumen

`nie-vans/poolformer-retrieval-quantized` es un repositorio experimental que empaqueta una implementación propia y minimalista de una arquitectura PoolFormer orientada a tareas de retrieval (búsqueda y correspondencia entre representaciones, con Flickr30k citado por el autor como referencia de evaluación). Lo publica el usuario `nie-vans` bajo licencia MIT y no procede de ningún laboratorio ni equipo de investigación identificado. El repositorio contiene código (`main.py`), una configuración de arquitectura (`config.json`), una receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización en `model.safetensors`.

El dato clave para evaluarlo es que, según la propia model card, el checkpoint **no ha sido entrenado**: se describe explícitamente como "a valid initialization checkpoint for smoke tests" y el autor indica que no reclama ninguna puntuación de benchmark. La variante se etiqueta como "nano" y los metadatos de safetensors registran 16.576 parámetros totales, un tamaño de juguete (tres o cuatro órdenes de magnitud por debajo de cualquier modelo de retrieval utilizable en producción).

Su relevancia, por tanto, no está en el rendimiento sino en el valor como andamiaje reproducible: permite inspeccionar una implementación con attention dispersa, tensor fusion, activación mish e InstanceNorm, y sirve como punto de partida para experimentos controlados. No debe confundirse con un modelo desplegable: es material de investigación en estado embrionario, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PoolFormer (variante "nano" de implementación propia) |
| Parametros totales | 16.576 (según metadatos de `model.safetensors`) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre del repo menciona "quantized", pero la model card no documenta ningún esquema de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización); PyTorch como framework |

Otros parámetros declarados en la model card:

| Parametro | Valor |
|---|---|
| Mecanismo de attention | dispersa (sparse) |
| Fusión | tensor fusion |
| Activación | mish |
| Normalización | InstanceNorm |
| Optimizador por defecto | AdamW |
| Scheduler por defecto | polinómico (polynomial) |
| Tarea declarada | retrieval |
| Escala | nano |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura sigue la familia PoolFormer, que sustituye el self-attention por operaciones de pooling como mecanismo de mezcla espacial, con el objetivo de reducir coste computacional manteniendo la estructura de un transformer por bloques. Sobre esa base, esta implementación incorpora tres decisiones propias declaradas en la model card: attention de tipo disperso, un módulo de "tensor fusion" y normalización mediante InstanceNorm en lugar de LayerNorm, con activación mish. No se especifica el número de capas, dimensión oculta, número de cabezas, tamaño de parche ni resolución de entrada; `config.json` recoge esos ajustes pero no se han publicado en la información disponible.

En cuanto a entrenamiento, no existe evidencia de ninguno completado. El autor es explícito: los valores de AdamW y scheduler polinómico son "starting values in the script, not evidence of a completed run", y el checkpoint incluido es de inicialización para pruebas de humo. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. La guía de evaluación propuesta por el propio autor sugiere usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir una baseline de capacidad equivalente, lo que confirma que la evaluación sistemática está pendiente.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint no está entrenado y no produce representaciones útiles para retrieval.
- El código implementa un forward pass de PoolFormer con attention dispersa, tensor fusion e InstanceNorm, ejecutable mediante el bloque `__main__` de `main.py`.
- Punto de partida para entrenamiento propio: incluye configuración de arquitectura y receta de experimento (`config.json`, `training_args.json`).
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües declaradas ni idiomas identificados.
- No hay capacidades multimodales confirmadas, aunque la tarea de retrieval y la referencia a Flickr30k apuntan a un escenario imagen-texto; el repositorio no lo explicita.
- Al ser una implementación personalizada, las APIs genéricas de carga automática de HuggingFace requieren un adaptador explícito.

## Casos de uso

- Pruebas de humo de infraestructura: cargar `model.safetensors` y ejecutar `python main.py --help` y el ejemplo del bloque `__main__` para validar que el entorno de PyTorch y el pipeline de carga funcionan antes de invertir en un modelo mayor.
- Estudio de arquitecturas sin attention: usar el código como referencia didáctica para entender cómo se sustituye self-attention por pooling y qué implicaciones tiene en el flujo de activaciones y normalización.
- Ablaciones controladas: emplear `config.json` como base para comparar variantes (attention dispersa frente a densa, InstanceNorm frente a LayerNorm, mish frente a GELU) manteniendo el mismo presupuesto de datos y semillas, tal como recomienda el autor.
- Reproducción de experimentos de retrieval a pequeña escala: entrenar el andamiaje sobre un subconjunto de Flickr30k para obtener una baseline de capacidad muy baja contra la que medir la mejora de modelos mayores.
- Docencia y formación: ilustrar el ciclo completo de un repositorio de modelo (configuración, receta de entrenamiento, checkpoint, limitaciones) con un ejemplo de apenas 16.576 parámetros que se ejecuta en CPU.
- Verificación de pipelines de evaluación: probar el arnés de métricas de retrieval (recall@k, medias sobre tres semillas) con un modelo cuyo rendimiento es trivial, antes de aplicarlo a checkpoints reales.
- Integración en tests de CI: incluir el checkpoint como fixture de tamaño despreciable para comprobar que el código de carga y el preprocesado no se rompen en cada commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que "no benchmark score is claimed in this repository" y que el checkpoint no ha sido entrenado, por lo que cualquier cifra de retrieval, MMLU, HumanEval o GSM8K sería inaplicable o inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en precisión completa (16.576 parámetros); el checkpoint en `model.safetensors` ocupa prácticamente nada dentro de un repositorio de 0,0 GB.
- GPU recomendadas: ninguna en particular; el modelo es ejecutable en CPU sin optimización alguna. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) lo aloja con holgura, pero no aporta ventaja frente a CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portátiles, contenedores, CI runners).
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser una implementación personalizada, el uso previsto es la ejecución directa del script de PyTorch y, en su caso, un adaptador propio para las APIs de carga automática.
- Latencia y throughput: no disponibles. Con 16.576 parámetros el coste por forward es despreciable frente a cualquier overhead de Python o de carga de datos, por lo que las cifras de rendimiento no serían informativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| `nie-vans/poolformer-retrieval-quantized` | 16.576 | no disponible | retrieval | MIT | checkpoint de inicialización, sin entrenar |
| PoolFormer de Meta (S12/S24/S36) | no disponible en esta ficha (referencia pública: ~12 M / ~21 M / ~31 M) | no disponible | clasificación de imagen | no disponible en esta ficha (referencia pública: Apache 2.0) | pesos entrenados y publicados con resultados en ImageNet |
| CLIP ViT-B/32 de OpenAI | no disponible en esta ficha (referencia pública: ~151 M) | no disponible en esta ficha (referencia pública: 77 tokens de texto) | retrieval imagen-texto | no disponible en esta ficha (referencia pública: MIT) | pesos entrenados, ampliamente usado como baseline de retrieval |
| SigLIP | no disponible | no disponible | retrieval imagen-texto | no disponible | pesos entrenados |

Las cifras de las filas de alternativas provienen de documentación pública externa y se incluyen solo como orden de magnitud; no forman parte de la información proporcionada sobre este repositorio. La diferencia relevante no es de parámetros sino de estado: los tres modelos comparables están entrenados y evaluados, mientras que este repositorio es un andamiaje sin entrenamiento, por lo que no existe comparación de rendimiento posible.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles para retrieval ni para ninguna otra tarea.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según indica el propio autor.
- Riesgo de alucinación no evaluable: no hay ninguna evaluación de generación, y el modelo no está planteado como generador.
- Sesgos desconocidos: al no existir dataset de entrenamiento documentado, no se puede caracterizar ningún sesgo.
- Longitud de contexto e idiomas no especificados, por lo que no se puede garantizar comportamiento en entradas largas ni multilingües.
- Licencia MIT: permite uso comercial y modificación, pero el autor advierte de que los términos de los datos de origen deben revisarse por separado cuando se usen datasets externos (por ejemplo, Flickr30k).
- Al ser una implementación personalizada, no es cargable con `AutoModel`/`AutoModelForImageRetrieval` sin un adaptador; esto complica su integración en frameworks estándar.
- El término "quantized" del nombre del repositorio no está respaldado por documentación alguna; no asumir que los pesos están cuantizados.
- No apto para producción en ningún escenario: 0 descargas, 0 likes y ausencia total de validación externa.
- Los resultados de un futuro checkpoint entrenado, si se publican, deben documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nie-vans/poolformer-retrieval-quantized
- Perfil del autor: https://huggingface.co/nie-vans
- Paper de referencia de la familia PoolFormer (Meta): https://arxiv.org/abs/2111.11418
- Dataset sugerido por el autor para evaluar (Flickr30k): https://shannon.cs.illinois.edu/DenotationGraph/
- No se han encontrado en la búsqueda web enlaces relevantes a este modelo; los resultados devueltos corresponden a trámites administrativos sobre el NIE español y no guardan relación con el repositorio.
