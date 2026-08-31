# nkkbr2/Kimi-K3-decensored-experimental-r1

## Resumen

Kimi K3 es un modelo de lenguaje de código abierto desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T (2,8 billones de parámetros). Su arquitectura combina Mixture-of-Experts (MoE) con innovaciones propias como Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que activa solo 16 de los 896 expertos por token, logrando una eficiencia de escalado aproximadamente 2,5 veces superior a la de su predecesor Kimi K2. El modelo es nativamente multimodal (texto, imagen y vídeo) y dispone de una ventana de contexto de 1 millón de tokens, orientado a tareas de codificación de largo horizonte, trabajo de conocimiento agéntico y razonamiento avanzado.

La variante aquí analizada, `nkkbr2/Kimi-K3-decensored-experimental-r1`, es un repositorio de un tercero (usuario nkkbr2) que publica los pesos del modelo con un nombre que sugiere una versión "sin censura" y experimental. No se dispone de documentación adicional sobre las modificaciones realizadas respecto al modelo original, ni de resultados de benchmarks específicos para esta variante. La model card incluida es una copia de la oficial de Moonshot AI, por lo que las especificaciones técnicas corresponden al Kimi K3 base. El repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026, lo que indica que es una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8 T) |
| Parametros activos | 104 B (16 de 896 expertos activados por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repo usa safetensors, se menciona "8-bit" en tags, pero sin detalle) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Kimi K3 License (licencia propia, no OSI) |
| Formato de pesos | safetensors (también se menciona compressed-tensors en tags) |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE híbrida con 93 capas, de las cuales 69 utilizan Kimi Delta Attention (KDA) y 24 utilizan Gated Multi-head Latent Attention (Gated MLA). La dimensión de atención oculta es de 7168 con 96 cabezas de atención. El componente MoE tiene 896 expertos con una dimensión oculta de 3072 por experto, y se seleccionan 16 expertos por token mediante un mecanismo de enrutamiento basado en Stable LatentMoE, que introduce una dimensión latente de 3584 para estabilizar el entrenamiento y mejorar la eficiencia de escalado. La capa densa adicional (1 capa densa) complementa la mezcla de expertos.

El modelo es nativamente multimodal: procesa texto, imágenes y vídeo dentro de la misma arquitectura, sin módulos separados de visión. El entrenamiento se realizó con un enfoque de aprendizaje por refuerzo y ajuste fino supervisado, aunque los detalles específicos (número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. La innovación principal reside en KDA, que modifica el mecanismo de atención para reducir el coste computacional en contextos largos, y en AttnRes, que añade conexiones residuales a nivel de atención para mejorar la estabilidad del gradiente en modelos de gran escala.

## Capacidades

- Generación de texto y razonamiento complejo: capaz de mantener cadenas de razonamiento de múltiples pasos y resolver problemas de lógica, matemáticas y ciencias.
- Codificación de largo horizonte: puede trabajar en repositorios de código extensos, optimizar kernels de GPU, desarrollar compiladores y realizar tareas de ingeniería de software con supervisión mínima.
- Comprensión multimodal nativa: procesa imágenes y vídeo directamente, lo que permite tareas como diseño de juegos con visión en el bucle, edición de vídeo y generación de informes visuales interactivos.
- Uso de herramientas y agente: soporta tool calling y orquestación de terminal, lo que le permite ejecutar comandos, navegar por sistemas de archivos y coordinar flujos de trabajo agénticos.
- Trabajo de conocimiento: genera informes de investigación profundos, dashboards interactivos, widgets y presentaciones de nivel consultor.
- Ventana de contexto de 1M tokens: permite procesar documentos muy largos, libros completos o bases de código enteras en una sola pasada.
- Capacidades multilingües: no se especifican idiomas concretos, pero por su origen (Moonshot AI) se espera un buen soporte de chino e inglés, aunque no está confirmado.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede gestionar repositorios con millones de líneas, refactorizar código, generar tests y mantener coherencia en proyectos extensos gracias a su contexto de 1M tokens y su capacidad de razonamiento de largo plazo.
- Automatización de tareas de investigación: puede leer decenas de artículos científicos, extraer conclusiones, generar informes con visualizaciones interactivas y citar fuentes, adecuado para entornos académicos o de consultoría.
- Creación de contenido multimedia: al ser multimodal, puede analizar storyboards, generar guiones, editar vídeo basándose en instrucciones de texto y producir material visual para marketing o educación.
- Asistencia en diseño asistido por ordenador (CAD): su capacidad de razonamiento espacial y visión le permite interpretar planos, sugerir modificaciones y generar código para automatizar tareas de diseño.
- Agente de operaciones de TI: puede interactuar con terminales, ejecutar scripts, monitorizar logs y diagnosticar incidencias en infraestructuras, integrándose en pipelines de DevOps.
- Análisis de documentos legales o financieros: con 1M de contexto, puede procesar contratos extensos, informes anuales o expedientes completos, extrayendo cláusulas relevantes y resumiendo riesgos.
- Generación de código para hardware: su capacidad de optimizar kernels de GPU y trabajar con lenguajes de bajo nivel lo hace útil para desarrollo de drivers, firmware o aceleración de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante específica (`decensored-experimental-r1`). La model card del modelo original Kimi K3 no incluye tablas de benchmarks en el extracto proporcionado. Se recomienda consultar el informe técnico oficial (enlace en la sección de enlaces) para obtener datos de rendimiento del modelo base. No se dispone de comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 2,8 T de parámetros totales. Incluso con cuantización de 8 bits, el peso completo ocuparía aproximadamente 2,8 TB (2,8 billones × 1 byte). Con cuantización de 4 bits, alrededor de 1,4 TB. Esto excede con creces la capacidad de cualquier GPU individual actual (máximo 80 GB en H100/A100).
- GPU recomendadas: se necesitaría un clúster multi-GPU. Por ejemplo, con 8× H100 (80 GB cada una) se dispondría de 640 GB, insuficiente para el modelo completo en 8 bits. Se requeriría al menos 16× H100 (1,28 TB) para 8 bits, o 32× H100 para 4 bits. En la práctica, el despliegue exigiría particionado por capas o por expertos (tensor parallelism y expert parallelism).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo individuales.
- Opciones de despliegue: vLLM, TensorRT-LLM, SGLang o frameworks de inferencia distribuida como DeepSpeed o Megatron-LM. También se menciona NVIDIA NIM como opción en la nube. Para entornos con menos recursos, se podría usar cuantización extrema (2 bits) pero con pérdida significativa de calidad.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia alta incluso con paralelización, y un throughput limitado por el ancho de banda de memoria entre GPUs.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Kimi K3 (este) | 2,8 T | 104 B | 1M | Sí (texto, imagen, vídeo) | Kimi K3 License |
| Kimi K2 | ~1 T (estimado) | ~32 B (estimado) | 256K (estimado) | No (solo texto) | Kimi K2 License |
| DeepSeek-V3 | 671 B | 37 B | 128K | No | MIT |
| Qwen2.5-Max | ~1 T (no publicado) | no publicado | 256K (estimado) | No | Apache 2.0 (parcial) |

Nota: los datos de Kimi K2 y DeepSeek-V3 son aproximados y basados en información pública general. La comparativa se centra en modelos MoE de gran escala. Kimi K3 destaca por su contexto de 1M y su multimodalidad nativa, algo poco común en modelos de este tamaño. La licencia Kimi K3 es restrictiva (no OSI), mientras que DeepSeek-V3 usa MIT.

## Limitaciones y advertencias

- La variante `decensored-experimental-r1` no tiene documentación propia: se desconoce qué modificaciones se han aplicado respecto al modelo original, si se ha eliminado algún mecanismo de seguridad o si se ha realizado un ajuste fino adicional. Esto supone un riesgo importante para uso en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. No hay garantías de integridad de los pesos ni de reproducibilidad.
- La licencia Kimi K3 no es de código abierto estándar; restringe el uso comercial y la redistribución. Es necesario revisar los términos completos antes de cualquier despliegue.
- El tamaño del modelo (2,8 T) hace inviable su ejecución en hardware convencional. Solo organizaciones con clústeres de decenas de GPUs de alta gama podrían utilizarlo.
- Al ser un modelo experimental, puede presentar comportamientos impredecibles, especialmente en tareas de razonamiento de largo plazo o en interacciones multimodales.
- No se han publicado resultados de seguridad, sesgos o alucinaciones para esta variante. El modelo base puede tener sesgos derivados de sus datos de entrenamiento, no documentados.
- La ventana de contexto de 1M tokens, aunque amplia, puede degradar el rendimiento en los extremos de la ventana (efecto "lost in the middle") si no se aplican técnicas de atención específicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nkkbr2/Kimi-K3-decensored-experimental-r1
- Model card oficial de Kimi K3 (Moonshot AI): https://huggingface.co/moonshotai/Kimi-K3
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Página de Kimi AI: https://www.kimi.com/en
- Página de Kimi K3 en NVIDIA NIM: https://build.nvidia.com/moonshotai/kimi-k3
- Página de Kimi K3 en openlm.ai: https://openlm.ai/kimi-k3/
- Página de Kimi K3 en uncensored.com: https://uncensored.com/models/kimi-k3
