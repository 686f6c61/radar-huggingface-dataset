# Heimfisch/Pumpkin-2B

## Resumen

Pumpkin-2B es un adaptador LoRA publicado por el usuario de HuggingFace Heimfisch, entrenado sobre el modelo base Qwen/Qwen3.5-2B-Base. No se trata por tanto de un modelo con pesos completos, sino de un conjunto de matrices de bajo rango (formato PEFT) que debe cargarse junto al modelo base o fusionarse con él antes de su uso. El repositorio ocupa 0,2 GB y se distribuye en safetensors, con la librería PEFT 0.21.0 como framework declarado.

La model card publicada es la plantilla por defecto de HuggingFace sin rellenar: no incluye descripción, datos de entrenamiento, hiperparámetros, resultados de evaluación ni información sobre sesgos. Tampoco se declaran licencia ni idiomas soportados. El único contexto técnico disponible es el conjunto de etiquetas del repositorio (peft, lora, transformers, text-generation, conversational) y la referencia al modelo base del que parte.

Por tanto, esta ficha es necesariamente incompleta: la mayor parte de los apartados se marcan como "no disponible" porque no existe documentación pública verificable. El modelo acumula 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no hay validación comunitaria ni informes de terceros que permitan contrastar su comportamiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B-Base; la arquitectura del modelo base no se documenta en la información disponible) |
| Parámetros totales | no disponible (el nombre del modelo base sugiere un orden de 2 000 millones, pero no hay confirmación oficial) |
| Parámetros activos | no aplica (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors sin cuantizar; cualquier cuantización requeriría fusionar y convertir el modelo resultante) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Tipo de modelo | adaptador de ajuste fino (no es un modelo completo) |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Librería | peft |
| Versión de PEFT declarada | 0.21.0 |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | text-generation |
| Fecha de creación | 2026-09-27 |
| Última actualización | 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un adaptador LoRA (Low-Rank Adaptation) sobre Qwen/Qwen3.5-2B-Base, gestionado mediante la librería PEFT en su versión 0.21.0. No se especifican el rango (rank), el valor de alpha, las capas objetivo ni el resto de hiperparámetros del adaptador. Tampoco se detalla si el ajuste se hizo con supervisión completa de instrucciones (SFT), con DPO, con RLHF o con otra técnica, ni si hubo una fase de alineación posterior.

No hay información sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni proceso de filtrado o preprocesado. Las etiquetas del repositorio incluyen "conversational" y "text-generation", lo que sugiere una orientación a diálogo y generación de texto, pero no hay evidencia publicada que lo confirme. La referencia bibliográfica que aparece en la plantilla (arxiv:1910.09700) corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en aprendizaje automático, citado en la sección de impacto ambiental de la plantilla, y no a un artículo técnico sobre este modelo. No se declara ninguna innovación técnica.

## Capacidades

- Generación de texto y uso conversacional: son las dos únicas capacidades sugeridas por las etiquetas del repositorio, sin documentación que las describa ni ejemplos de uso publicados.
- Razonamiento, matemáticas y generación de código: no disponible; no hay ninguna declaración al respecto en la información proporcionada.
- Soporte de tool calling o function calling: no disponible; no se menciona en la model card.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible.
- Cualquier capacidad heredada del modelo base depende de que el adaptador la preserve, algo que no está documentado ni evaluado.

## Casos de uso

Los siguientes escenarios son hipótesis de trabajo razonables dado el tamaño y el pipeline declarado, pero ninguno está respaldado por evaluaciones publicadas. Deben validarse internamente antes de cualquier despliegue.

- Prototipado rápido de asistentes conversacionales: al ser un adaptador de 0,2 GB sobre un modelo base de gama pequeña, permite iterar sobre el comportamiento conversacional sin reentrenar pesos completos; el coste de probar variantes del adaptador es bajo en disco y en tiempo de carga.
- Ajuste de estilo o tono en dominios concretos: un LoRA de este tamaño se usa típicamente para especializar el registro de respuesta (atención al cliente, soporte interno) manteniendo intacto el conocimiento general del modelo base.
- Experimentación académica sobre PEFT: sirve como caso de estudio reproducible para comparar configuraciones de LoRA, dado que la librería y la versión están declaradas explícitamente.
- Generación de texto en entornos con recursos limitados: si se fusiona con el base y se cuantiza, el conjunto podría ejecutarse en GPU de consumo, lo que habilita despliegues locales sin conexión a servicios externos.
- Base para experimentos de composición de adaptadores: al ser un adaptador independiente, puede combinarse o compararse con otros LoRA sobre el mismo modelo base para analizar interferencias entre ajustes.
- Filtrado o reformulación de texto en pipelines internos: un modelo de este tamaño puede emplearse en tareas de preprocesado (normalización, reescritura, resumen corto) donde la latencia importa más que la precisión máxima.
- Evaluación comparativa de metodologías de ajuste: útil como punto de partida para medir el impacto de distintos datasets de instrucciones sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía y todos los campos marcados como "[More Information Needed]". No existen tablas comparativas, métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y el repositorio registra 0 descargas y 0 valoraciones, por lo que tampoco hay informes de terceros.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones derivadas del tamaño indicado en el nombre del modelo base (aproximadamente 2 000 millones de parámetros) y del tamaño del repositorio del adaptador (0,2 GB). No proceden de documentación oficial del modelo.

- VRAM estimada para los pesos del modelo base: en bf16/fp16, en torno a 4 GB; en int8, alrededor de 2 GB; en cuantización de 4 bits, aproximadamente 1-1,5 GB. A ello hay que sumar el adaptador (0,2 GB si se carga sin fusionar) y el espacio para caché KV y activaciones, que depende por completo de la longitud de contexto, dato no disponible.
- Presupuesto orientativo en bf16 con contexto corto: 5-7 GB de VRAM. Con cuantización de 4 bits: 2-3 GB.
- GPU de centro de datos: A100, H100 y H200 son sobredimensionadas para este tamaño y solo se justifican si se sirven muchas réplicas concurrentes o contextos muy largos.
- GPU de consumo: es probable que quepa en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090 (24 GB) en bf16, y en tarjetas de 6-8 GB si se usa cuantización de 4 bits. No hay confirmación oficial.
- Opciones de despliegue: transformers junto con PEFT (carga del adaptador sobre el base), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que estos motores no cargan adaptadores PEFT directamente sobre safetensors.
- Latencia y throughput estimados: no disponibles. Ningún dato de velocidad, tokens por segundo o tiempo hasta el primer token aparece en la información proporcionada.

## Comparativa con modelos similares

No es posible establecer una comparativa de rendimiento: no hay ningún resultado de evaluación publicado para Pumpkin-2B. La tabla siguiente se limita a dimensiones estructurales verificables.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Heimfisch/Pumpkin-2B | Adaptador LoRA sobre Qwen3.5-2B-Base | no disponible (base de ~2B según nomenclatura) | no disponible | no disponible | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3.5-2B-Base | Modelo completo (base) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Repositorio HuggingFace (referenciado como base) |
| Otros adaptadores LoRA de la misma categoría | Adaptador LoRA | no disponible | no disponible | variable | no disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoría (por ejemplo, otros ajustes de instrucciones de la franja de 1-3 mil millones de parámetros). Cualquier comparación de calidad requeriría ejecutar una evaluación propia sobre el mismo conjunto de pruebas.

## Limitaciones y advertencias

- Model card vacía: todos los apartados relevantes (descripción, datos de entrenamiento, hiperparámetros, evaluación, sesgos) están sin rellenar. No hay información verificable sobre el proceso de creación.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial. Además, el uso del adaptador queda condicionado por la licencia del modelo base Qwen/Qwen3.5-2B-Base, que tampoco se detalla aquí y debe consultarse por separado.
- Riesgo de alucinación: no evaluado. Al no existir benchmarks ni informes de usuarios, se desconoce la tasa de error del modelo en tareas factuales, de razonamiento o de código.
- Sesgos: no documentados. No hay ninguna declaración sobre composición del dataset de ajuste, filtrado de contenido ni evaluación de sesgos demográficos o culturales.
- Idiomas: no declarados. No puede asumirse un buen rendimiento en castellano ni en ningún otro idioma sin pruebas propias.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- Es un adaptador, no un modelo autónomo: requiere descargar el modelo base y cargarlo con PEFT, o fusionar ambos. La fusión es un paso adicional obligatorio para usar motores que solo aceptan GGUF.
- Sin validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta. No hay evidencia de que el ajuste haya funcionado según lo previsto.
- Ausencia de paper: la referencia arxiv del repositorio (1910.09700) es la cita de la calculadora de impacto ambiental de la plantilla, no un artículo sobre el modelo. No existe documentación técnica de respaldo.
- Fechas incoherentes o futuras en los metadatos del repositorio, lo que dificulta trazar el historial de versiones.
- Para producción: no se recomienda su uso sin una evaluación interna previa que cubra exactitud, seguridad, sesgo y comportamiento multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Heimfisch/Pumpkin-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Artículo citado en la plantilla de la model card (Lacoste et al., 2019, sobre estimación de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de aprendizaje automático, enlazada en la plantilla: https://mlco2.github.io/impact
- Repositorio, paper, demo o blog del autor: no disponibles.
