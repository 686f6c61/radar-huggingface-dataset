# Cride/MANTA

## Resumen

MANTA (Memory-Augmented Neural Tensor Assembly) es una **propuesta de arquitectura** publicada por el usuario Cride en Hugging Face, no un modelo entrenado. El autor lo declara explícitamente en la model card: versión 0.1, fechada el 2 de noviembre de 2026, sin checkpoint entrenado, sin resultados de benchmark validados y sin implementación funcional del contexto de 128K. Se trata, por tanto, de una especificación de investigación que describe un diseño teórico, no de un artefacto listo para inferencia.

La propuesta plantea un núcleo neuronal persistente de aproximadamente 200M de parámetros (objetivo de diseño, no medido) que se combina dinámicamente con un banco externo de "registros de alineamiento" almacenado en SSD de hasta unos 180 GB. Un router ANN selecciona como máximo cinco registros por evento de enrutamiento y un compositor neuronal configura adaptadores condicionales para la tarea. La hipótesis central no es que 200M + 200M equivalgan a un modelo mayor, sino que la reutilización condicional de módulos especializados puede ofrecer un equilibrio favorable entre calidad, cómputo activo y VRAM residente en dominios concretos.

La relevancia actual es limitada pero conceptualmente interesante: explora un eje de escalado alternativo al modelo monolítico, separando sustrato cognitivo general, conocimiento externo duradero y ensamblaje neuronal condicional. No obstante, al carecer de pesos, benchmarks y validación empírica, no debe considerarse un modelo evaluable ni desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregresiva decoder-only híbrida recurrente/sparse-attention con ensamblaje neuronal condicional (propuesta) |
| Parametros totales | ~200M (objetivo de diseño, no medido) |
| Parametros activos | no disponible (no es MoE; selecciona hasta 5 registros de alineamiento por evento) |
| Longitud de contexto | 128K tokens objetivo mediante procesamiento estatal por chunks y recall selectivo; no es una ventana de atención completa verificada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (inicial); extensión multilingüe prevista |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay checkpoint publicado) |

## Arquitectura y entrenamiento

El núcleo residente propuesto consta de 20 bloques decodificadores ordenados como 5 × (3 Gated DeltaNet + 1 sparse attention), con hidden size de 768, vocabulario de 32.768 tokens con embeddings de entrada/salida atados, 12 cabezas de query en los bloques sparse, 3 cabezas KV con GQA, cabeza de 64 dimensiones, FFN SwiGLU con tamaño intermedio de 2.560, pre-RMSNorm, RoPE en la rama de atención sparse y una propuesta de residuo con compuerta de dos ramas. Solo 5 de los 20 bloques usan atención sparse; los otros 15 emplean actualizaciones de estado recurrente (Gated DeltaNet). Incluye un bloque opcional de refinamiento latente recurrente de 1 a 4 pasadas y una cabeza MTP opcional desactivada en la línea base.

El autor realiza una contabilidad de parámetros explícita para un proxy todo-GQA: tabla de embeddings de 25.165.824 parámetros, proyecciones GQA de 1.474.560, SwiGLU de 5.898.240, resultando en aproximadamente 172,7M para 20 bloques más embeddings y normas. El propio autor advierte que este cálculo es solo una comprobación de cordura y no el recuento real de MANTA, ya que las proyecciones de Gated DeltaNet, las compuertas de estado, los residuos ensanchados, el refinador latente y las capas de router/composición alteran la cifra. El presupuesto de ~200M debe validarse con un script de construcción real y una aserción `num_parameters()`.

No se especifican datos de entrenamiento concretos: el autor indica que se usarán datasets públicos existentes, sin corpus nuevo a gran escala, y que el entrenamiento se realizaría en una NVIDIA RTX 3050 de 8 GB de VRAM con una Quadro RTX 3000 de 6 GB opcional como profesor/juez. No hay información sobre número de tokens, composición del dataset, RLHF, DPO ni innovaciones implementadas más allá del diseño descrito.

## Capacidades

- Generación de texto autoregresiva (objetivo declarado).
- Razonamiento general y adaptación en contexto (objetivo declarado).
- Reutilización de habilidades aprendidas mediante registros de alineamiento externos.
- Composición modular adaptativa mediante router ANN y compositor neuronal.
- Procesamiento de contexto largo mediante estado recurrente y recall selectivo (objetivo de 128K, no verificado).
- Escritura de memoria basada en experiencia con verificación y evaluación A/B antes de promoción (propuesta).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo inglés inicial).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas al escalado monolítico: el diseño permite estudiar si la reutilización condicional de módulos especializados mejora la relación calidad/cómputo activo/VRAM en dominios acotados, sirviendo como banco de pruebas académico.
- Experimentación con memoria externa persistente: el banco de alineamientos de hasta 180 GB en SSD permite investigar mecanismos de recall selectivo y escritura de memoria sin aumentar el núcleo residente.
- Estudio de enrutamiento condicional: el router ANN con top-5 permite analizar cómo la selección de registros afecta al rendimiento en tareas de razonamiento, útil para líneas de investigación en MoE y adaptadores condicionales.
- Prototipado de decodificación con estado recurrente: la combinación de Gated DeltaNet y atención sparse en 5 de 20 bloques permite evaluar estrategias de contexto largo sin ventana de atención completa.
- Docencia y divulgación: la model card detallada con contabilidad de parámetros y diagramas sirve como material para explicar diseño de transformers híbridos y presupuestos de parámetros.
- Reproducción de la especificación: un equipo con GPUs de consumo podría intentar construir el núcleo de ~200M y validar la aserción de `num_parameters()`, aunque no hay código ni pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no hay checkpoint entrenado ni resultado de benchmark validado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados). A modo de referencia teórica, un núcleo de ~200M en FP16 requeriría aproximadamente 0,4 GB solo para pesos, pero el diseño incluye banco externo en SSD y módulos condicionales cuyo coste no está cuantificado.
- GPU recomendadas: no disponible. El autor menciona una RTX 3050 de 8 GB como GPU de entrenamiento propuesta y una Quadro RTX 3000 de 6 GB como profesor/juez opcional.
- ¿Cabe en consumer GPU? Según el presupuesto teórico, un núcleo de ~200M cabría en GPUs de consumo, pero no hay implementación que lo confirme.
- Opciones de despliegue: no disponible (no hay pesos ni soporte en vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (propuestas de arquitectura con memoria externa y ensamblaje condicional) con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- No es un modelo entrenado: no existe checkpoint, pesos ni implementación funcional del contexto de 128K. No debe usarse en producción.
- Sin benchmarks validados: no hay evidencia empírica de rendimiento, calidad ni capacidades reales.
- Contabilidad de parámetros no verificada: el propio autor advierte que el cálculo de ~172,7M es solo una comprobación de cordura y que el recuento real requiere un script de construcción con aserción `num_parameters()`.
- Contexto de 128K no verificado: se basa en procesamiento estatal por chunks y recall selectivo, no en una ventana de atención completa.
- Idiomas: solo inglés inicial; extensión multilingüe prevista pero no implementada.
- Sesgos conocidos: no disponible (no hay modelo entrenado que evaluar).
- Riesgo de alucinación: no evaluable al no existir modelo entrenado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al no haber pesos ni código, la licencia se aplica únicamente a la especificación publicada.
- Caveat importante: la fecha de creación (2026-11-02) y la ausencia de descargas y likes sugieren un artefacto de investigación sin adopción; cualquier evaluación debe tratarse como revisión de diseño, no como uso de modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Cride/MANTA
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales relevantes para este modelo.
