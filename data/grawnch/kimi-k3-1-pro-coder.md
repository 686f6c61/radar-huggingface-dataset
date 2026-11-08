# Grawnch/Kimi-K3.1-Pro-Coder

## Resumen

Kimi-K3.1-Pro-Coder es una cuantización mixta de precisión (mixed-bit) del modelo `moonshotai/Kimi-K3.1-Pro`, publicada por el usuario Grawnch bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una redistribución del modelo base con un esquema de compresión propietario orientado a cargas de trabajo de programación y razonamiento matemático. El repositorio ocupa 74,8 GB y se distribuye en formato safetensors con código personalizado (`custom_code`).

La innovación principal es la organización de los expertos enrutados del MoE en tres niveles de residencia y precisión (Hot VRAM / Warm RAM / Cold NVMe), lo que permite ejecutar un modelo de escala muy grande en hardware con VRAM limitada, paginando dinámicamente los expertos menos usados desde disco. Requiere los motores de ejecución `strata` y `dr-triton` del mismo autor, por lo que no es compatible con runtimes estándar como vLLM o llama.cpp sin adaptación.

Es relevante porque el modelo base, Kimi K3.1 Pro, es un modelo abierto de clase 3T con contexto de 1M de tokens publicado por Moonshot el 4 de noviembre de 2026; esta cuantización busca hacerlo desplegable en configuraciones de una o pocas GPU mediante un compromiso agresivo entre precisión y footprint de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, cuantización mixta de 3 niveles |
| Parametros totales | no disponible (modelo base descrito como clase 3T) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la ficha; el modelo base anuncia 1M tokens |
| Tipos de cuantizacion | 10 bits (Tier 1), 9 bits (Tier 2), 9 bits (Tier 3) con escalas FP8 y residuales de bajo rango |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base bajo Kimi K3.1 Pro License) |
| Formato de pesos | safetensors (96 shards) con código personalizado |
| Expertos enrutados por capa | 896, repartidos en 134 / 269 / 493 (Tier 1 / 2 / 3) |

## Arquitectura y entrenamiento

El modelo base es un MoE transformer de escala 3T-class con 1M de tokens de contexto, según el blog de Moonshot. Esta versión no reentrena el modelo: aplica una cuantización post-entrenamiento sobre los pesos originales. Cada capa MoE contiene 896 expertos enrutados, que se particionan en tres tiers según su frecuencia de activación estimada para cargas de código y matemáticas.

- **Tier 1 (Hot Coding, 15 %, 134 expertos):** índices de tabla empaquetados a 10 bits (`Tile=4`), escalas de sub-bloque FP8 y residual de bajo rango de rango 16 (`sc_lut_tier1`, `sc_qbasis_tier1`), fijados en VRAM.
- **Tier 2 (Warm Logic, 30 %, 269 expertos):** índices a 9 bits (`Tile=4`), escalas de bloque FP8 y residual de rango 12, cacheados en RAM del sistema.
- **Tier 3 (Cold General, 55 %, 493 expertos):** índices a 9 bits (`Tile=8`), escalas de bloque FP8 y residual de rango 6, servidos desde NVMe vía `mmap` con prefetch asíncrono `RouterLookahead` y footprint persistente de 0 B en RAM.

La reconstrucción de pesos se hace mediante tablas de búsqueda embebidas en los propios safetensors, decodificadas con `decode_sc_lut_matrix` y `TieredMoECacheManager` del paquete `strata_coder`. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO específicas de esta versión; los detalles del modelo base no se proporcionan en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Kimi K3.1 Pro.
- Especialización declarada en cargas de programación y razonamiento matemático, reflejada en la asignación de mayor precisión a los expertos "Hot Coding".
- Capacidad de ejecución con expertos paginados desde disco, lo que permite servir el modelo con VRAM limitada.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado en la información disponible para esta cuantización; el modelo base anuncia avances en coding, modelado 3D e investigación financiera.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- **Asistente de programación en producción:** el modelo puede integrarse en pipelines de generación y revisión de código, aprovechando la asignación de 10 bits y residual de rango 16 a los expertos de código, que se mantienen residentes en VRAM para minimizar latencia en tareas de autocompletado y refactorización.
- **Razonamiento matemático asistido:** la presencia de un tier "Warm Logic" con 9 bits y residual de rango 12 permite resolver problemas de varios pasos con un coste de memoria inferior al del modelo completo, adecuado para herramientas de análisis simbólico o verificación de demostraciones.
- **Despliegue en estaciones de trabajo con VRAM limitada:** gracias a la paginación de expertos desde NVMe, es posible ejecutar un modelo de escala 3T en equipos con una o pocas GPU, usando el disco como extensión de memoria para los expertos fríos.
- **Investigación sobre cuantización MoE:** el esquema de tres tiers con tablas de búsqueda embebidas sirve como banco de pruebas para estudiar el impacto de la precisión por experto en la calidad de salida.
- **Procesamiento de contexto largo:** si se confirma el contexto de 1M tokens del modelo base, podría emplearse en análisis de repositorios completos o documentación extensa, aunque el coste de atención a esa longitud no está documentado para esta versión.
- **Prototipado de agentes de código:** la integración con `strata` y `dr-triton` permite experimentar con enrutamiento dinámico de expertos y prefetch en flujos agénticos, siempre que el equipo acepte la dependencia de estos runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita; el esquema reserva en VRAM el Tier 1 (134 expertos a 10 bits) y cachea el Tier 2 en RAM, por lo que el requisito depende de la configuración de `TieredMoECacheManager`.
- **GPU recomendadas:** no disponible. El uso de FP8 en escalas y la gestión por tiers sugiere GPUs con soporte FP8 (H100, H200, B200) o, en su defecto, A100.
- **Consumer GPU:** no confirmado; el tamaño del repo (74,8 GB) y la paginación desde NVMe hacen plausible su ejecución en GPUs de 24 GB o más, pero no hay datos oficiales.
- **Opciones de despliegue:** únicamente los runtimes `strata` y `dr-triton` del autor; no compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-Coder (esta ficha) | no disponible (base 3T-class) | no disponible (base 1M) | Apache 2.0 | safetensors + custom code | Cuantización mixta de 3 tiers, requiere `strata` |
| moonshotai/Kimi-K3.1-Pro | 3T-class | 1M | Kimi K3.1 Pro License | safetensors | Modelo base original, pesos completos |
| Alternativas de código abierto de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- **Dependencia de runtimes propietarios:** requiere `strata` y `dr-triton`, lo que limita la portabilidad y añade riesgo de mantenimiento si estos proyectos dejan de actualizarse.
- **Licencia del modelo base:** aunque esta cuantización se declara Apache 2.0, el modelo base se publica bajo la Kimi K3.1 Pro License; es necesario verificar que los términos de esa licencia permiten la redistribución y el uso comercial de derivados cuantizados.
- **Riesgo de degradación por cuantización:** la combinación de 9-10 bits con residuales de bajo rango puede introducir pérdida de calidad frente al modelo original, especialmente en los expertos del Tier 3 (rango 6).
- **Sesgos y alucinaciones:** no documentados para esta versión; se heredan los del modelo base, no especificados.
- **Idiomas:** no se declaran idiomas soportados, por lo que el comportamiento multilingüe no está garantizado.
- **Madurez:** el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni resultados de benchmarks; debe tratarse como un artefacto experimental.
- **Contexto:** no se confirma que la ventana de 1M tokens del modelo base se preserve tras la cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Kimi-K3.1-Pro-Coder
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Runtime `strata`: https://github.com/grawnchtoader/strata
- Runtime `dr-triton`: https://github.com/grawnchtoader/dr-triton
- Blog de Kimi K3.1 Pro: https://www.kimi.ai/blog/kimi-k3-1-pro
- Análisis de especificaciones y benchmarks: https://www.yottalabs.ai/post/kimi-k3-1-pro-specs-price-open-weights-benchmarks
