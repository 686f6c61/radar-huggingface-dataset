# gaotang/MBT-2-branch-W4

## Resumen

MBT-2-branch-W4 es un checkpoint de investigación de tipo *model-only* publicado por el usuario gaotang dentro de la línea experimental Multi-Branch Transformer (MBT). Se trata de la variante final "Balanced 2-branch Joint-KV" en la escala W4, con una asignación de capas de 4 / (7 + 7) / 4, es decir, dos ramas paralelas de siete capas flanqueadas por bloques de cuatro. El modelo tiene 2.063.291.200 parámetros y fue entrenado sobre 78.841.380.864 tokens con un contexto de 4.096 tokens.

La propuesta técnica es una arquitectura transformer *multi-branch* con mezcla de expertos y un esquema de compartición de KV entre ramas (*Joint-KV*), orientada a explorar si varias ramas paralelas con atención compartida pueden ofrecer una relación capacidad/cómputo más eficiente que un transformer denso convencional. El checkpoint reporta una pérdida final de validación fija de 2.361 sobre un conjunto reservado de 12.160 secuencias.

Es relevante ahora como material de estudio reproducible para investigadores interesados en arquitecturas alternativas y en el diseño de MoE con compartición de estado, no como modelo listo para producción: los pesos requieren una implementación nativa basada en Megatron y no son compatibles con `AutoModel` de Transformers ni con vLLM. La licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Branch Transformer (MBT) con dos ramas y Joint-KV; mezcla de expertos |
| Parametros totales | 2.063.291.200 |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), formato nativo `mbt-native-shared-kv-v1` |

## Arquitectura y entrenamiento

El modelo sigue un diseño Multi-Branch Transformer con dos ramas paralelas de siete capas cada una, precedidas y seguidas por bloques de cuatro capas (asignación 4 / (7 + 7) / 4). Las ramas emplean un mecanismo Joint-KV, es decir, comparten las proyecciones de clave y valor, lo que reduce el estado de atención duplicado frente a un diseño de ramas totalmente independientes. El checkpoint incluye buffers persistentes de enrutamiento (*persistent routing buffers*), lo que confirma la presencia de componentes de mezcla de expertos en el grafo. El número de parámetros activos por token no se detalla en la información disponible.

El entrenamiento acumuló 78.841.380.864 tokens con un contexto de 4.096 tokens y finalizó en la actualización de optimizador 75.189, con una pérdida de validación fija de 2.361 medida sobre un conjunto reservado de 12.160 secuencias. No se especifican la composición del dataset, el uso de RLHF/DPO ni detalles del tokenizador; el autor indica que debe obtenerse por separado el tokenizador original de Llama 3 bajo sus propios términos de acceso y licencia, lo que sugiere que el modelo se entrenó sobre esa tokenización. El checkpoint no incluye optimizador, estado de RNG, dataset ni tokenizador.

## Capacidades

- Generación de texto en inglés: el pipeline declarado es `text-generation` y el único idioma etiquetado es `en`.
- Razonamiento y modelado de lenguaje general, derivados del entrenamiento sobre ~78.800 millones de tokens.
- Componente de mezcla de expertos con enrutamiento persistente, orientado a investigación sobre eficiencia computacional.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo *thinking*, visión o audio: no disponible.
- Uso como base de investigación para experimentos de arquitectura, no como modelo instructivo o alineado.

## Casos de uso

- Investigación en arquitecturas alternativas: el checkpoint permite reproducir y analizar el comportamiento de un transformer con dos ramas y Joint-KV frente a un transformer denso de parámetros comparables, usando la implementación nativa de Megatron del proyecto.
- Estudio de compartición de KV: sirve para medir empíricamente el ahorro de memoria y el impacto en pérdida de validación al compartir claves y valores entre ramas paralelas.
- Experimentos de mezcla de expertos con enrutamiento persistente: los buffers de enrutamiento incluidos permiten inspeccionar cómo se distribuye la carga entre expertos durante la inferencia.
- Reproducibilidad de resultados: el SHA256 publicado y los registros de validación permiten verificar la integridad de los pesos y comparar la pérdida de validación (2.361) con réplicas propias.
- Punto de partida para *fine-tuning* de investigación: al ser un checkpoint nativo de 2.000 millones de parámetros, puede servir como base para estudiar adaptaciones con contexto de 4.096 tokens en entornos académicos con infraestructura Megatron.
- Docencia y divulgación técnica: útil para ilustrar en cursos o artículos cómo se diseña, entrena y valida una arquitectura multi-rama con MoE, dado que el autor publica metadatos completos de arquitectura y tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de validación fija de 2.361 sobre el conjunto reservado de 12.160 secuencias, junto con la actualización final de optimizador (75.189) y el volumen de tokens de entrenamiento (78.841.380.864).

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (asumiendo fp16/bf16): aproximadamente 4,1 GB solo para pesos, más el estado de activaciones y buffers de enrutamiento; el repositorio ocupa 4,1 GB.
- VRAM estimada en fp32: alrededor de 8,3 GB para pesos.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, una GPU con 8-16 GB (RTX 3090, RTX 4090, A10, L4) sería suficiente para los pesos en bf16, siempre que la implementación nativa lo permita.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 por tamaño de pesos, aunque no hay soporte oficial ni runtime de inferencia incluido.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI. El autor indica que se requiere la implementación nativa basada en Megatron correspondiente y que no se incluye un runtime de inferencia autónomo en esta publicación de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| MBT-2-branch-W4 | 2.063.291.200 | 4.096 | no disponible | safetensors nativo, requiere Megatron | Checkpoint de investigación, sin benchmarks públicos |
| Alternativas de ~2B densos (p. ej. familias tipo Llama/Qwen/Gemma en esa escala) | ~2B | 4K-128K según versión | varía según modelo | safetensors, GGUF, vLLM, llama.cpp | Ecosistema maduro y benchmarks publicados; no comparable en arquitectura |
| Alternativas MoE de ~2B totales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación cuantitativa con modelos de la misma categoría no está disponible porque el autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas de throughput.

## Limitaciones y advertencias

- Checkpoint exclusivamente de investigación: no es un modelo instructivo ni alineado; no se ha documentado RLHF, DPO ni filtrado de seguridad.
- Sin runtime de inferencia incluido: requiere la implementación nativa basada en Megatron del proyecto; no funciona con `AutoModel` de Transformers, vLLM, llama.cpp ni Ollama.
- Tokenizador no incluido: debe obtenerse por separado el tokenizador de Llama 3 bajo sus propios términos de acceso y licencia, lo que añade una dependencia externa.
- Licencia no declarada: no hay términos explícitos de uso comercial, por lo que no se recomienda su uso en producción sin aclaración del autor.
- Solo inglés: no se declara soporte multilingüe.
- Contexto limitado a 4.096 tokens, insuficiente para casos de contexto largo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al ser un modelo base sin alineación, es esperable un comportamiento no filtrado.
- Idiomas y dominios: el dataset de entrenamiento no se describe, por lo que se desconoce su composición y posibles sesgos de dominio.
- Sin benchmarks públicos: no es posible comparar su calidad frente a modelos de tamaño similar con métricas estándar.
- Advertencia de integridad: verificar el SHA256 `e9a796ad9769f3f5f577881531b5ce8bb500f496021b5ba97b709a6631d50407` antes de cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaotang/MBT-2-branch-W4
- Proyecto Multi-Branch Transformer (GitHub): https://github.com/GaotangLi/Multi-Branch-Transformer
- Tokenizador Llama 3 (a obtener por separado bajo sus términos): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
