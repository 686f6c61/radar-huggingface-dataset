# Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r02

## Resumen

svd-safety-l2_remove50_swapgapiter_b010_r02 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf que ha sido comprimido mediante SVD-LLM hasta eliminar en torno al 50 % de los parámetros de proyección densos y, posteriormente, editado con dos de las diez rondas previstas de una rutina iterativa de intercambio de parámetros neutro en parámetros («parameter-neutral swap»), seleccionada por la regla `gap_iter`. El autor, Jeesup, lo publica como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes repara mejor ese daño.

No se trata de un asistente de propósito general. Es una celda concreta de una rejilla experimental que cruza reglas de selección y presupuestos de restauración, y su finalidad declarada es medir el compromiso entre seguridad y utilidad bajo compresión. La model card advierte explícitamente que varias ramas de la rejilla están degradadas en seguridad de forma deliberada respecto a Llama-2-7b-chat, porque la compresión por sí sola incrementa la tasa de éxito de ataques.

El checkpoint conserva la arquitectura transformer decoder-only de Llama 2, con licencia Llama 2 Community License. Tiene cero descargas y cero «likes» en el momento de la consulta, y se distribuye en formato safetensors con 6.738.415.616 parámetros según los metadatos reales del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con pesos transformados por SVD-LLM |
| Parametros totales | 6.738.415.616 (metadatos reales de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredado de Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible en el repositorio; pesos en safetensors (precisión original no declarada) |
| Idiomas soportados | no disponible (el modelo base Llama-2 está orientado principalmente al inglés) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors |

Datos de procedencia declarados en la model card: compresión SVD-LLM con 50,01 % de parámetros eliminados; regla de selección `gap_iter`; presupuesto de restauración del 1,000 % de los parámetros densos; 1346 componentes restaurados y 1346 intercambiados; fracción resultante de parámetros 0,4999; semilla 42; 2 de 10 rondas iterativas aplicadas; fragmento por ronda del 0,100 % de los parámetros densos; 12.947.968 parámetros intercambiados (0,20 % de los parámetros de proyección densos); valor de intercambio `insert` con desalojo ordenado por sigma.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y RoPE. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión que descompone en valores singulares determinadas matrices de proyección y trunca componentes para reducir el número de parámetros, en este caso en torno al 50 %. El resultado es un modelo con menor huella teórica de parámetros de proyección, pero con el mismo grafo de cómputo básico que el original.

Sobre el modelo comprimido se ejecuta después una edición iterativa «parameter-neutral»: en cada ronda se seleccionan componentes (según la regla `gap_iter`) y se intercambian, insertando valores nuevos y desalojando otros en orden de sigma, manteniendo neutro el número de parámetros. Este checkpoint corresponde a la segunda de diez rondas, con un fragmento del 0,100 % de los parámetros densos por ronda y un presupuesto total previsto del 1,0 %. No hay información disponible sobre el dataset de entrenamiento original (más allá de que se hereda de Llama-2-7b-chat) ni sobre procesos adicionales de RLHF o DPO en esta fase de edición.

## Capacidades

- Generación de texto conversacional en la línea de Llama-2-7b-chat, aunque el autor insiste en que no debe tratarse como asistente desplegable.
- Mantiene la estructura funcional de un modelo de chat de 7B (respuestas multi-turno dentro del contexto heredado de 4.096 tokens).
- Sujeto experimental para medir degradación y recuperación de seguridad bajo compresión: es el uso principal para el que fue creado.
- Capacidad de comparación dentro de la rejilla: permite contrastar la regla de selección `gap_iter` frente a otras reglas y presupuestos, con el mismo modelo base y la misma semilla (42).
- Soporte de tool calling / function calling: no disponible (no se declara en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingües específicas: no disponibles.
- Capacidades especiales (modo «thinking», visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como una celda de control para cuantificar cuánta capacidad y cuánta seguridad se pierde al truncar por SVD el 50 % de los parámetros de proyección respecto al Llama-2-7b-chat original.
- Auditoría de seguridad comparada: dado que la model card aporta ASR de AdvBench (0,2350) y StrongREJECT (0,1550) con juez HarmBench, el modelo sirve para reproducir y contrastar tasas de éxito de ataque entre variantes de la rejilla con la misma semilla.
- Estudio de sobre-rechazo: la métrica de macro over-refusal (0,1726, WildGuard) permite analizar el equilibrio entre seguridad y utilidad, es decir, cuántas peticiones legítimas se rechazan tras la compresión y la edición.
- Validación de metodologías de reparación: comparar esta variante (`gap_iter`, 2 de 10 rondas, presupuesto del 1,0 %) con otras celdas del grid para determinar qué regla de selección de componentes repara mejor la seguridad sin reentrenar.
- Reproducibilidad experimental: al declarar semilla 42, componentes restaurados (1346), componentes intercambiados (1346) y parámetros intercambiados (12.947.968), el artefacto permite replicar el pipeline de compresión y edición paso a paso.
- Análisis de interpretabilidad: inspeccionar qué proyecciones concretas fueron seleccionadas por la regla `gap_iter` y cómo su sustitución afecta al comportamiento observable del modelo.
- No se recomienda su uso como asistente en producción, atención al cliente ni generación de código en entornos reales, tal como advierte el propio autor.

## Benchmarks y rendimiento

La model card solo publica métricas de seguridad, no benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros no aparecen en la información disponible).

| Metrica | Valor | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,2350 | Tasa de éxito de ataque; valor más alto implica peor seguridad |
| StrongREJECT ASR (juez HarmBench) | 0,1550 | Tasa de éxito de ataque; valor más alto implica peor seguridad |
| Macro over-rejection (WildGuard) | 0,1726 | Proporción de rechazos sobre peticiones legítimas |

No se aportan comparaciones numéricas con Llama-2-7b-chat sin comprimir ni con otras celdas de la rejilla en la información disponible, por lo que no es posible establecer el delta exacto de degradación respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos (coincide con el tamaño del repositorio, 13,5 GB), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB.
- GPU recomendadas para fp16 sin cuantizar: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090/4090) en fp16, y en tarjetas de 8-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y conversión a GGUF para llama.cpp u Ollama si se requiere cuantización.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_b010_r02 | 6.738.415.616 (metadatos safetensors) | 4.096 tokens (heredado) | Llama 2 Community License | HuggingFace, 0 descargas | Artefacto de investigación con seguridad degradada; ASR AdvBench 0,2350 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | HuggingFace, ampliamente usado | Modelo base sin comprimir; referencia para medir la degradación |
| Otras celdas de la rejilla del mismo autor (`svd-safety-l2_*`) | variable según presupuesto | 4.096 tokens (heredado) | Llama 2 Community License | HuggingFace | Comparables directas para aislar el efecto de la regla de selección y del presupuesto |

No se dispone de datos numéricos comparativos entre estas variantes en la información proporcionada. No se conocen modelos de terceros directamente equivalentes, ya que se trata de un artefacto de estudio muy específico.

## Limitaciones y advertencias

- Sesgos conocidos: los heredados de Llama-2-7b-chat; no se documentan análisis de sesgo específicos para este checkpoint.
- Riesgo de alucinación: el propio autor advierte que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base; la compresión por sí sola eleva la tasa de éxito de ataques.
- La model card califica este checkpoint como «sujeto experimental, no como asistente desplegable» y exige evaluarlo antes de extraer conclusiones.
- Limitaciones de contexto e idioma: contexto heredado de 4.096 tokens y orientación principal al inglés; no hay soporte multilingüe declarado.
- Discrepancia de datos: el recuento real de parámetros del safetensors (6.738.415.616) coincide con el de Llama-2-7b-chat sin comprimir, mientras la model card declara una fracción resultante de 0,4999 sobre parámetros de proyección densos. La información disponible no explica esta aparente contradicción, por lo que conviene verificarla antes de asumir la reducción efectiva de tamaño.
- Este checkpoint es una ronda intermedia (2 de 10) de una ejecución más larga; no representa el resultado final del presupuesto de restauración del 1,0 %.
- Restricciones de licencia: sujeto a Llama 2 Community License; el uso comercial está condicionado por LICENSE.txt y USE_POLICY.md incluidos en el repositorio, incluida la cláusula de atribución «Built with Llama 2».
- Caveat para producción: no se recomienda su uso en sistemas reales sin evaluación previa de seguridad y utilidad; cero descargas y cero validaciones externas en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en los resultados de búsqueda web proporcionados; los resultados disponibles corresponden a páginas genéricas de Google sin relación con el modelo.
