# evgenyp-etrov89/thesis-retrieval

## Resumen

`evgenyp-etrov89/thesis-retrieval` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de un transformer de tipo "tiny" orientado a tareas de recuperación (retrieval). No se trata de un modelo entrenado y listo para producción, sino de un esqueleto de código (`model.py`) con una configuración de arquitectura generada (`config.json`) y un checkpoint de inicialización válido únicamente para pruebas de humo. El autor lo presenta explícitamente como un punto de partida para inspeccionar cambios arquitectónicos antes de lanzar un entrenamiento completo.

La escala declarada es "xlarge" dentro de la nomenclatura interna del autor, pero el dato real de parámetros en safetensors es de 16.576 parámetros totales, lo que lo sitúa en un orden de magnitud muy inferior a cualquier modelo de retrieval moderno (que suelen oscilar entre cientos de millones y varios miles de millones de parámetros). El repositorio no incluye tokenizador, pipeline declarado ni resultados de benchmarks.

Su relevancia es, por tanto, didáctica y de investigación: sirve como plantilla reproducible para experimentar con decisiones de arquitectura (atención multi-query, fusión de bajo rango, activación swish, normalización batchnorm) y para montar una línea base de evaluación sobre Flickr30k antes de escalar a un entrenamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención multi-query, fusión de bajo rango, activación swish, normalización batchnorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer propio ("Tiny Transformer") con atención multi-query, mecanismo de fusión de bajo rango, función de activación swish y normalización por batchnorm. La escala declarada en la model card es "xlarge" dentro de la nomenclatura del autor, aunque el recuento real de parámetros del checkpoint es de 16.576, coherente con un modelo de juguete para pruebas de humo. La receta de experimento por defecto usa descenso de gradiente estocástico (SGD) con un schedule exponencial; el autor advierte que son valores de partida del script y no evidencia de un entrenamiento completado.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El checkpoint `model.safetensors` se describe explícitamente como inicialización no entrenada, sin auditoría de robustez, equidad ni transferencia de dominio. El autor recomienda evaluar sobre Flickr30k, reportar la métrica de la tarea con al menos tres semillas y comparar contra una línea base de capacidad equivalente, guardando logs de entrenamiento y versiones del entorno.

## Capacidades

- Generación de embeddings para recuperación: el propósito declarado del código es servir de base para tareas de retrieval, presumiblemente texto-imagen dado que la evaluación sugerida es Flickr30k.
- Punto de partida para experimentación arquitectónica: permite modificar atención, fusión, activación y normalización antes de un entrenamiento completo.
- Ejecución de pruebas de humo: el script `model.py` incluye un bloque `__main__` con un ejemplo ejecutable.
- No dispone de capacidades verificadas de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, al no existir un checkpoint entrenado ni evaluación publicada.
- No se declara soporte de thinking mode, audio ni modalidades adicionales.

## Casos de uso

- Docencia e investigación sobre arquitecturas transformer: el repositorio permite inspeccionar y modificar atención multi-query y fusión de bajo rango en un modelo de 16.576 parámetros, con coste computacional despreciable en cualquier portátil.
- Pruebas de humo de pipelines de entrenamiento: sirve para validar scripts de carga de datos, bucles de entrenamiento y guardado de checkpoints antes de escalar a modelos reales, gracias a que el checkpoint de inicialización es válido y ligero.
- Línea base de evaluación en retrieval: el autor propone Flickr30k con al menos tres semillas y una línea base de capacidad equivalente, lo que permite montar un protocolo reproducible de comparación.
- Estudio de recetas de optimización: la configuración incluida (SGD con schedule exponencial) puede usarse como referencia para comparar contra AdamW u otros optimizadores en tareas de retrieval a pequeña escala.
- Desarrollo de adaptadores de carga personalizados: dado que es una implementación propia, requiere un adaptador explícito para APIs genéricas; el repositorio sirve para practicar esa integración con `transformers` o frameworks propios.
- Reproducción de experimentos académicos: útil como plantilla para trabajos de fin de máster o tesis (el propio nombre del repositorio, "thesis-retrieval", lo sugiere) donde se necesite un código base controlado y trazable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en FP32 para los 16.576 parámetros del checkpoint, más el overhead del runtime de PyTorch.
- GPU recomendadas: no se requiere GPU; el modelo cabe y se ejecuta en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en cualquier CPU moderna.
- Opciones de despliegue: al ser una implementación propia sin pipeline declarado, no es compatible de forma directa con vLLM, TGI, llama.cpp u Ollama; requiere ejecutar `model.py` o escribir un adaptador explícito.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evgenyp-etrov89/thesis-retrieval | 16.576 | no disponible | Checkpoint de inicialización, sin entrenar | Apache 2.0 | Hugging Face |
| CLIP (ViT-B/32, OpenAI) | ~151 M | 77 tokens de texto | Entrenado y evaluado | MIT (código) / términos propios | Hugging Face, OpenAI |
| SigLIP (base) | ~203 M | 64 tokens de texto | Entrenado y evaluado | Apache 2.0 | Hugging Face |
| BGE-small-en | ~33 M | 512 tokens | Entrenado y evaluado | MIT | Hugging Face |

La comparación es únicamente orientativa: los tres modelos de referencia son sistemas de retrieval entrenados y evaluados, mientras que `thesis-retrieval` es un esqueleto de 16.576 parámetros sin entrenamiento. No existe una comparación de rendimiento posible con los datos disponibles.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier salida que produzca es esencialmente aleatoria y no debe interpretarse como resultado de retrieval.
- No hay auditoría de robustez, equidad ni transferencia de dominio, según advierte el propio autor.
- No se declara tokenizador ni pipeline, por lo que las APIs automáticas de `transformers` no cargarán el modelo sin un adaptador explícito.
- No se especifican idiomas soportados, longitud de contexto ni tipos de cuantización.
- Riesgo de alucinación no evaluable: al no ser un modelo generativo entrenado, la noción de alucinación no aplica, pero tampoco hay garantías de calidad en ninguna tarea.
- Licencia Apache 2.0 permite uso comercial del código, pero el autor recomienda revisar por separado los términos de los datos de origen si se usa con datasets externos (por ejemplo, Flickr30k).
- No apto para producción: cualquier despliegue real requeriría entrenamiento, evaluación y auditoría previos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/evgenyp-etrov89/thesis-retrieval
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
