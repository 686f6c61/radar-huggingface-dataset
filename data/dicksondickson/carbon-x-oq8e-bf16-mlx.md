# dicksondickson/Carbon-X-oQ8e-bf16-MLX

## Resumen

Carbon-X-oQ8e-bf16-MLX es una cuantización en formato MLX del modelo base HuggingFaceBio/Carbon-X, un modelo orientado a biología computacional y genómica, concretamente al trabajo con secuencias de ADN. El modelo base se construye sobre la arquitectura Qwen3, lo que sugiere que adapta la infraestructura de un modelo lingüístico de gran escala al dominio de secuencias biológicas, y este repositorio concreto ofrece una versión cuantizada mediante oQ (oMLX), con precisión mixta que conserva los tensores más importantes en bf16.

La relevancia de este modelo reside en su especialización: mientras los LLM generalistas no están entrenados para modelar secuencias genómicas, Carbon-X aborda el modelado y la generación de ADN directamente, con una ventana de contexto que permite procesar hasta unos 245 kilopares de bases (kbp) de ADN en una sola pasada. La versión MLX está dirigida específicamente a usuarios de hardware Apple Silicon (chips M3 o posteriores), permitiendo ejecutar el modelo localmente sin depender de GPU NVIDIA.

Cabe destacar que la documentación disponible procede casi íntegramente de la model card de la cuantización, no del modelo base, por lo que varios datos técnicos (datos de entrenamiento, benchmarks, detalles de arquitectura interna) no están disponibles públicamente en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (transformer); detalles completos no disponibles |
| Parámetros totales | 14.822.046.720 (~14,8 B) |
| Parámetros activos | No aplicable (no hay indicios de que sea MoE) |
| Longitud de contexto | 40.960 tokens (~245 kbp de ADN) |
| Tipos de cuantización | oQ8e (cuantización mixta de 8 bits con imatrix, tensores críticos en bf16) |
| Idiomas soportados | No disponible (dominio: secuencias de ADN/genómica) |
| Licencia | MIT |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base, HuggingFaceBio/Carbon-X, se construye sobre la arquitectura Qwen3, un transformer decoder-only de la familia Alibaba. Esta cuantización concreta conserva la arquitectura del original y aplica una cuantización mixta de 8 bits mediante la herramienta oQ (incluida en oMLX 0.7.3.dev2), que utiliza matrices de importancia (imatrix) y la técnica "Better Low-Bit oQ" para decidir qué tensores se cuantizan y cuáles permanecen en bf16. Los tensores considerados críticos se dejan en bf16, lo que está optimizado para chips Apple M3 y posteriores.

Sobre el proceso de entrenamiento del modelo base no hay datos disponibles: no se ha publicado el número de tokens de entrenamiento, la composición del corpus (más allá de que el dominio es ADN y genómica), ni si se aplicaron técnicas como RLHF o DPO. Tampoco consta si el modelo funciona como modelo de lenguaje convencional adaptado a secuencias biológicas o si emplea un tokenizador específico para nucleótidos, aunque la model card menciona que el tokenizador fue modificado (parcheado) para funcionar con oMLX de forma completamente offline, lo que sugiere un tokenizador no estándar.

## Capacidades

- Modelado y generación de secuencias de ADN, con una ventana de contexto que cubre hasta ~245 kbp de ADN por pasada.
- Tareas de genómica y biología computacional (el modelo base está especializado en este dominio, según los tags del repositorio).
- Modo de razonamiento (thinking) heredado de Qwen3, desactivable mediante `enable_thinking=False`; la model card recomienda mantenerlo desactivado.
- Ejecución completamente offline una vez descargado, gracias al tokenizador parcheado para oMLX.
- Compatible con el ecosistema MLX de Apple, optimizado para Apple Silicon (M3 o superior).
- Generación de ADN largo: posible pero lenta, con degradación de calidad a medida que aumenta la longitud generada (advertencia del propio autor).

No hay información disponible sobre soporte de tool calling, capacidades de visión, audio o capacidades multilingües convencionales.

## Casos de uso

- Generación de secuencias de ADN in silico: el modelo puede producir secuencias genómicas candidatas de longitud considerable dentro de su ventana de ~245 kbp, útil para exploración computacional previa a síntesis experimental.
- Análisis de regiones genómicas largas: gracias a los 40.960 tokens de contexto, se pueden procesar en una sola pasada fragmentos genómicos que en modelos con contexto corto requerirían fragmentación.
- Investigación en biología computacional en hardware Apple: investigadores sin acceso a GPU NVIDIA pueden ejecutar el modelo localmente en Mac con chips M3 o superiores, sin coste de nube.
- Prototipado y experimentación offline: al funcionar completamente offline con tokenizador parcheado, es adecuado para entornos con restricciones de conectividad o requisitos de privacidad de datos genómicos.
- Comparación de variantes de secuencias: el contexto largo permite introducir secuencias completas y estudiar representaciones o continuaciones del modelo sobre ellas.
- Educación y demostración de modelos genómicos: su licencia MIT y su ejecución local lo hacen idóneo para docencia y demos en cursos de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (ni del modelo base ni de la cuantización) y no se han aportado comparativas con otros modelos genómicos.

## Requisitos de hardware

- Tamaño del repositorio: 15,8 GB en disco.
- Memoria unificada estimada: al ser una cuantización de 8 bits con tensores críticos en bf16, se recomienda disponer de al menos 18-20 GB de memoria unificada para cargar el modelo con margen; los Mac con 24 GB o más de RAM unificada deberían manejarlo con holgura.
- Hardware objetivo: chips Apple M3 o posteriores (requisito explícito de la model card para los tensores en bf16). No está dirigido a GPU NVIDIA ni AMD.
- No cabe en la mayoría de GPUs de consumo convencionales mediante este formato MLX; para otro hardware habría que recurrir al modelo base HuggingFaceBio/Carbon-X.
- Despliegue: mediante oMLX (https://github.com/jundot/omlx), activando la opción Trust Remote Code en los ajustes avanzados del modelo. No consta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta cuantización.
- Parámetros de muestreo recomendados: temperatura 0,6, top-p 0,95, top-k 20, thinking desactivado, límite de tokens generados entre 1024 y 4096.
- Latencia y throughput: no disponibles; el autor advierte que la generación de ADN largo es lenta y pierde calidad con la longitud.

## Comparativa con modelos similares

La información disponible no incluye benchmarks ni datos de rendimiento comparables. Como referencia de categoría (modelos de ADN a gran escala), se listan alternativas conocidas, indicando que los datos de rendimiento no están disponibles para una comparación rigurosa:

| Modelo | Parámetros | Contexto | Dominio | Licencia |
|---|---|---|---|---|
| Carbon-X (base) | ~14,8 B | 40.960 tokens (~245 kbp) | ADN/genómica | MIT |
| Evo 1/2 (Arc Institute) | No disponible en la información proporcionada | Diseñado para genomas completos | ADN/genómica | No disponible en la información proporcionada |
| Nucleotide Transformer (InstaDeep) | Hasta 2,5 B | No disponible en la información proporcionada | ADN/genómica | No disponible en la información proporcionada |

No se han publicado resultados de benchmarks que permitan comparar rendimiento entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Degradación de calidad en generación larga: el propio autor advierte que la generación de ADN largo es lenta y que la calidad empeora cuanto más tiempo genera; recomienda limitar la salida a 1024-4096 tokens.
- Requiere activar Trust Remote Code en oMLX, lo que implica ejecutar código personalizado del repositorio; conviene revisarlo antes de usarlo en entornos sensibles.
- El tokenizador ha sido parcheado para oMLX, por lo que la compatibilidad con otras librerías de inferencia no está garantizada.
- Optimizado para Apple M3 o posterior; el rendimiento en chips anteriores u otro hardware no está garantizado.
- Sin benchmarks publicados: no hay forma de evaluar objetivamente la calidad del modelo base ni el impacto de la cuantización antes de probarlo.
- Documentación escasa: faltan detalles sobre datos de entrenamiento, método de evaluación y validación biológica de las secuencias generadas.
- Riesgo de alucinación: como todo modelo generativo, puede producir secuencias de ADN plausibles pero biológicamente inválidas o sin significado funcional; cualquier resultado debe validarse experimentalmente.
- Sesgos: no disponible información sobre sesgos del modelo base.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones significativas, aunque sin ninguna garantía.
- Repositorio de bajo uso (80 descargas y 1 like en el momento de los datos), lo que implica poca validación por parte de la comunidad.

## Enlaces

- Cuantización MLX (este modelo): https://huggingface.co/dicksondickson/Carbon-X-oQ8e-bf16-MLX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- Repositorio de oMLX (herramienta de cuantización e inferencia): https://github.com/jundot/omlx
