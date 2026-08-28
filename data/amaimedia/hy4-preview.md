# AMAImedia/Hy4-preview

## Resumen

Hy4 preview es un modelo de lenguaje de nueva generación desarrollado por el equipo Tencent Hy, presentado como un modelo insignia de arquitectura Mixture-of-Experts (MoE). Con 770 000 millones de parámetros totales en el backbone (más una capa MTP de 10 000 millones), activa solo 49 000 millones por token, lo que lo sitúa en la frontera de los modelos abiertos de gran escala. Su diseño incorpora innovaciones como atención dispersa con Gated DeepSeek Sparse Attention (DSA) e IndexCache, así como conexiones residuales iHC (identity Hyper-Connections) para mejorar el flujo de información entre capas.

El modelo está orientado a tareas de productividad de largo recorrido: ingeniería de software, análisis de documentos, desarrollo de juegos e investigación científica. Con una ventana de contexto de 1 millón de tokens, está pensado para manejar entradas masivas y razonamiento multi-paso. Se distribuye bajo licencia Apache 2.0 y está disponible en HuggingFace, aunque el repositorio concreto que se analiza (AMAImedia/Hy4-preview) es una re-subida del modelo original de Tencent. Su relevancia actual radica en ser uno de los primeros modelos abiertos con 1M de contexto y un coste de inferencia relativamente bajo gracias a su arquitectura MoE.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Gated DSA |
| Parametros totales | 770B (backbone) + 10B (MTP) = 780B aprox. |
| Parametros activos | 49B (backbone) + 0.7B (MTP) = 49.7B |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone de Hy4 preview consta de 78 capas: la primera utiliza una FFN densa estándar y las 77 restantes emplean MoE con 256 expertos enrutados y 1 experto compartido. Por cada token se activan los 8 mejores expertos enrutados más el experto compartido. La atención se basa en Gated DeepSeek Sparse Attention (DSA), una variante de atención dispersa que reduce el coste computacional en contextos largos, complementada con IndexCache para reutilizar índices de dispersión entre capas. El camino residual emplea iHC (identity Hyper-Connections), que amplía el flujo de información inter-capa mediante múltiples flujos residuales (4 en total). Además, se incluye una capa MTP (Multi-Token Prediction) nativa de 10B parámetros (0.7B activos) para decodificación especulativa, lo que acelera la generación.

No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset. La model card indica que se escaló en tamaño, contexto y datos, y que se realizó un post-entrenamiento sustancial, pero sin cifras concretas. Tampoco se especifica si se usó RLHF o DPO, aunque la mención a un "post-training run" sugiere que sí hubo alguna fase de alineación.

## Capacidades

- Generación de texto y razonamiento complejo de largo recorrido, especialmente en tareas de ingeniería de software, análisis de datos y resolución de problemas científicos.
- Soporte de tool calling y function calling, orientado a agentes y flujos de trabajo con múltiples pasos (mencionado en la model card como "complex tool-use workflows").
- Capacidad para manejar contexto muy largo (1M tokens), lo que permite procesar documentos extensos, repositorios de código completos o conversaciones multi-turno prolongadas.
- Decodificación especulativa nativa mediante la capa MTP, que reduce la latencia en generación.
- Capacidades multilingües no confirmadas; la model card no especifica idiomas soportados, aunque por su origen (Tencent) es probable que cubra chino e inglés, pero no se puede afirmar.
- No se mencionan capacidades multimodales (visión, audio, etc.); el modelo es exclusivamente de texto.

## Casos de uso

- Desarrollo de software a largo plazo: el modelo puede entender, planificar, depurar y verificar tareas de desarrollo extensas, gracias a su contexto de 1M tokens y su entrenamiento orientado a ingeniería. Es adecuado para integrarse en IDE o agentes de codificación como CodeBuddy.
- Análisis de documentos y generación de informes: puede procesar múltiples archivos con contexto desordenado y convertirlos en documentos, hojas de cálculo o presentaciones, útil en entornos de oficina y consultoría.
- Prototipado rápido de juegos: a partir de un único prompt puede generar un prototipo jugable y trabajar con motores de juego, permitiendo iteraciones multi-turno sobre proyectos complejos.
- Investigación científica: capacidad mejorada para razonar sobre problemas difíciles en áreas como IA, dinámica molecular, física de materia condensada y matemáticas puras, sirviendo como asistente de investigación.
- Atención al cliente automatizada: con 1M de contexto, puede gestionar conversaciones muy largas manteniendo el historial completo, ideal para soporte técnico o servicios con múltiples interacciones.
- Análisis financiero y modelado: la model card menciona precisión en modelos financieros y ecuaciones, por lo que puede usarse para generar informes financieros, análisis de datos y proyecciones.
- Agentes autónomos con tool calling: su soporte para function calling y razonamiento multi-paso lo hace apto para pipelines de automatización que requieren interacción con APIs y bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una imagen de benchmarks, pero no se han podido extraer los valores numéricos. El único dato cuantitativo es una evaluación ciega lado a lado realizada por 163 expertos internos de Tencent sobre 203 tareas de ingeniería, donde Hy4 preview obtuvo:

| Modelo comparado | Puntuación media (Hy4 vs. rival) | Victorias / Empates / Derrotas |
|---|---|---|
| GLM 5.3 | 2.99 vs. 2.92 | 46.8% / 12.8% / 40.4% |
| Kimi K3 | 2.99 vs. 2.94 | 51.2% / 7.9% / 40.9% |

Estos resultados indican una ligera ventaja sobre ambos modelos en tareas de ingeniería, pero no son benchmarks públicos reproducibles.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la información proporcionada.
- Dado el tamaño de 780B parámetros totales, la inferencia requiere un clúster de GPUs. Como estimación orientativa:
  - En FP8 (1 byte por parámetro), se necesitarían aproximadamente 780 GB de VRAM, lo que equivale a 10 GPUs H100 de 80 GB o 8 GPUs A100 de 80 GB (con overhead adicional).
  - En cuantización INT4, se reduciría a unos 390 GB, cabiendo en 5 GPUs H100 de 80 GB.
- No se mencionan requisitos de RAM o CPU específicos.
- Opciones de despliegue: la model card menciona soporte para vLLM y SGLang, así como secciones de finetuning y cuantización. También es compatible con el ecosistema transformers.
- Latencia y throughput: no disponibles, aunque la capa MTP de decodificación especulativa debería mejorar la velocidad de generación.

## Comparativa con modelos similares

La model card compara directamente con GLM 5.3 y Kimi K3, ambos modelos MoE de escala similar. No se dispone de especificaciones completas de estos modelos, pero se puede establecer una comparación cualitativa:

| Característica | Hy4 preview | GLM 5.3 | Kimi K3 |
|---|---|---|---|
| Parámetros totales | 770B + 10B MTP | no disponible | no disponible |
| Parámetros activos | 49B + 0.7B MTP | no disponible | no disponible |
| Contexto | 1M | no disponible | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Rendimiento en ingeniería (eval. ciega) | 2.99 | 2.92 | 2.94 |

No se dispone de más datos para una comparativa exhaustiva.

## Limitaciones y advertencias

- La model card advierte que es una versión temprana de Hy4, con margen de mejora en pre-entrenamiento y post-entrenamiento.
- Se menciona explícitamente que el modelo tiende a dedicar más tiempo del necesario a razonar en tareas complejas y a sobre-verificar sus respuestas, lo que puede resultar en latencia innecesaria.
- No se han publicado detalles sobre sesgos o riesgos de alucinación; al ser un modelo de gran tamaño, es probable que presente alucinaciones en contextos ambiguos, pero no hay datos confirmados.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que el repositorio de AMAImedia sea una redistribución legítima del modelo original de Tencent.
- No se especifican los idiomas soportados, lo que puede limitar su uso en aplicaciones multilingües hasta que se confirme.
- El tamaño del modelo (1560 GB en el repositorio) implica costes de almacenamiento y despliegue significativos.

## Enlaces

- Repositorio HuggingFace (analizado): https://huggingface.co/AMAImedia/Hy4-preview
- Repositorio HuggingFace oficial de Tencent: https://huggingface.co/tencent/Hy4-preview
- GitHub oficial: https://github.com/Tencent-Hunyuan/Hy4-preview
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-preview
- Página de precios y disponibilidad: https://llm24.net/model/hy4-preview
- Análisis de mercado: https://lmmarketcap.com/model/hy4-preview
- Disponibilidad en Vercel AI Gateway: https://vercel.com/changelog/hy4-preview-now-available-on-ai-gateway
