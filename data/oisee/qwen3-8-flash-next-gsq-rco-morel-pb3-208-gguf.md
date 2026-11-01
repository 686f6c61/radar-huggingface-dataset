# oisee/Qwen3.8-Flash-Next-GSQ-RCO-MoREL-PB3-208-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-MoREL-PB3-208 es un derivado comunitario, publicado por el usuario oisee en HuggingFace, de un modelo MoE de gran tamaño (aproximadamente 105 mil millones de parámetros totales según los metadatos de safetensors del repositorio base). Se trata de una versión cuantizada en GGUF con poda física de expertos: partiendo de la variante IQ3_S de 512 expertos publicada por ISTA-DASLab, el autor conserva una media de 208 expertos por capa (rango 138–267 en 48 capas enrutadas), manteniendo intacto el enrutamiento top-10. El objetivo es reducir el tamaño y el coste de inferencia de un MoE enorme sin reentrenamiento, seleccionando los expertos que realmente se activan en tareas de código agénticas, con especial foco en ABAP.

La técnica subyacente, denominada MoREL (Mixture of Ragged Experts per Layer), se apoya en una "tomografía" de enrutamiento registrada durante sesiones de programación agéntica (fases de exploración, edición y verificación ponderadas por igual), y requiere un fork específico de llama.cpp (rama `cnm/varexp`) para cargarse: el llama.cpp principal no es compatible. Esto lo hace un modelo de nicho, orientado a desarrolladores dispuestos a compilar o usar binarios precompilados de un runtime experimental, pero relevante como demostración de poda de expertos sin reentrenamiento con degradación medida (KL-L de 1,090 frente a 1,121 de una construcción previa de ancho fijo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con poda física de expertos por capa (MoREL), enrutamiento top-10 |
| Parametros totales | 105.183.945.600 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF 3 bits (derivado de la variante IQ3_S de 512 expertos; tipos de tensor mixtos) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF (56,6 GB en el repositorio) |

## Arquitectura y entrenamiento

Este modelo no introduce un entrenamiento propio: es una derivada de cuantización y poda. La base es ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, a su vez una cuantización de un modelo Qwen de la familia Flash-Next con arquitectura MoE de 512 expertos enrutados y top-10 por token, más expertos compartidos y una gran tabla de embeddings por capa (PLE). El proceso de construcción de la versión PB3-208 consta de cuatro pasos: primero se registra una tomografía de enrutamiento de expertos mientras un agente trabaja en sesiones de código ABAP, incluyendo trayectorias generadas por otros modelos, separando las fases de exploración, edición y verificación; segundo, la máscara PB3 pondera por igual las tres fases y asigna el presupuesto global de expertos entre capas a partir de esas estadísticas (de ahí que cada capa conserve un número distinto de expertos); tercero, se copian físicamente las filas cuantizadas de los expertos seleccionados desde el origen IQ3_S, sin reentrenamiento, implantación ni recuantización, conservando atención, expertos compartidos y tabla PLE con sus bytes originales; cuarto, se repara la compactación del router: el GGUF almacena un array `qwen4exp.expert_count`, los IDs originales de expertos, `cnm.expert_source_count = 512` y `cnm.preserve_router_layout = true`, y el fork de llama.cpp reconstruye los routers a su anchura original, enmascara las filas eliminadas antes del softmax y mapea los IDs originales a los slots compactos. Los autores advierten que esto evita un fallo numérico conocido de disposición del router, pero no establece equivalencia numérica exacta con el enmascaramiento en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Generación y edición de código, con especial énfasis en ABAP según el proceso de selección de expertos.
- Comportamiento agéntico: la selección de expertos se realizó a partir de trayectorias agénticas multi-fase (explorar, editar, verificar) con uso de herramientas; el brief de la release reporta llamadas a herramientas correctas en 20/20 repeticiones del primer paso de una tarea agéntica registrada.
- Ejecución mediante llama.cpp (fork específico), con soporte de CPU (AVX2/AVX), Vulkan (AMD Radeon) y CUDA (NVIDIA).
- Soporte de MTP (multi-token prediction) mencionado en el runtime, aunque sin pruebas de generación en esta release.
- No hay información sobre capacidades de visión, audio ni modos de razonamiento explícitos: no disponible.

## Casos de uso

- Desarrollo y mantenimiento de código ABAP: la máscara de expertos se derivó de sesiones agénticas de ABAP, por lo que es adecuada para asistentes que exploran, editan y verifican código SAP en flujos multi-paso.
- Agentes de programación con llamadas a herramientas: el brief reporta 20/20 llamadas a herramientas correctas en el primer paso de una tarea agéntica registrada, lo que lo hace candidato para pipelines de agentes con ejecución de herramientas.
- Inferencia local de un MoE muy grande en estaciones de trabajo modestas: al reducir de 512 a una media de 208 expertos por capa y cuantizar a 3 bits (56,6 GB), el modelo cabe en configuraciones con GPU de consumo más offload parcial, algo inviable con el modelo completo.
- Investigación en poda de expertos sin reentrenamiento: incluye métricas de divergencia KL frente al modelo de referencia y metadatos de reconstrucción del router, útil como caso de estudio de expert pruning dirigido por uso.
- Pruebas de rendimiento de backends alternativos: la release incluye binarios para CPU AVX2, Vulkan (RX 580) y CUDA (RTX 2070, RTX 4060 Ti), útil para evaluar inferencia en hardware heterogéneo.
- Comparación de variantes podadas: el autor publica una construcción previa de ancho fijo (K192p-implant16 v2) con métricas comparables, lo que permite experimentos controlados entre estrategias de poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas mediciones publicadas son internas del autor:

| Métrica | Valor |
|---|---|
| KL-L (frente a referencia IQ4_XS de 512 expertos, 8 textos, 10 chunks por texto) | 1,090 |
| KL-L de K192p-implant16 v2 (misma referencia) | 1,121 |
| Llamadas a herramientas (primer paso de una tarea agéntica, 20 repeticiones) | 20/20 correctas |

Estos valores son medias de KL por texto, no comparaciones de tasa de acierto en tareas, y provienen de configuraciones de runtime registradas por separado.

## Requisitos de hardware

- El repositorio ocupa 56,6 GB en GGUF 3 bits; para inferencia completa en GPU se necesitarían del orden de 60 GB de VRAM o más (estimación a partir del tamaño del archivo; no disponible un dato oficial de VRAM).
- La release oficial incluye binarios probados en: CPU AVX2/FMA/F16C (Intel de 10.ª generación, Ryzen 5 5600G), CPU AVX + Vulkan con Radeon RX 580 (offload parcial), CUDA 12.0 en RTX 2070 (sm_75) y RTX 4060 Ti (sm_89/86/75).
- Cabe parcialmente en GPUs de consumo (RTX 2070, RTX 4060 Ti) según la matriz de pruebas del autor, aunque la generación CUDA con estos binarios empaquetados no fue probada en la release; la generación completa en Vulkan y contextos largos tampoco se probaron.
- Despliegue: exclusivamente mediante el fork de llama.cpp del autor (rama `cnm/varexp`, commit `7ed1a0a57e5621073146bca8d5c166e52cfe462b`, o la prerelease `cnm-varexp-v0.1`); el llama.cpp principal no carga el modelo. No hay soporte documentado de vLLM, TGI ni Ollama.
- Los binarios precompilados son paquetes específicos por máquina para Ubuntu 24.04 (deshabilitan HTTPS y la Web UI del servidor embebido); para otras configuraciones hay que compilar desde el código fuente. Velocidades de generación: no disponible (solo se mencionan muestras de velocidad cálida en EVALUATION.json sin cifras públicas en la model card).

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos por capa | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| oisee/Qwen3.8-Flash-Next-GSQ-RCO-MoREL-PB3-208 | ~105 B (base) | media 208 (138–267), top-10 | GGUF 3 bits (IQ3_S) | qwen-community-1.0 | Fork llama.cpp cnm/varexp |
| oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF | ~105 B (base) | 192 (ancho fijo) + 16 implantados | GGUF | qwen-community-1.0 | Fork llama.cpp cnm/varexp |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (origen) | ~105 B | 512 | GGUF IQ3_S / IQ4_XS | qwen-community-1.0 | llama.cpp (según variant) |

Frente al origen de 512 expertos, la variante PB3-208 reduce aproximadamente un 60 % los expertos enrutados por capa con una degradación KL modesta (1,090) y mejor distribución que la construcción previa de ancho fijo (1,121). Comparativas con modelos Qwen oficiales u otros MoE de tamaño similar: no disponible.

## Limitaciones y advertencias

- Requiere un fork experimental de llama.cpp; el llama.cpp principal no puede cargar el modelo, lo que limita su uso en producción y su integración con herramientas estándar.
- La reparación del router no garantiza equivalencia numérica exacta con el enmascaramiento en runtime; el propio autor lo señala.
- Matriz de pruebas incompleta en la release: generación CUDA no probada con los binarios empaquetados, Vulkan sin residencia completa verificada, contextos largos y MTP sin probar.
- Los binarios precompilados son específicos por máquina (Ubuntu 24.04), deshabilitan HTTPS y la Web UI, y no hay builds para Windows, macOS ni Linux genérico en esta prerelease.
- La evaluación publicada es limitada: KL de distribución y una única puerta de acción agéntica; no hay benchmarks estándar ni comparaciones de tasa de éxito, por lo que la calidad real en tareas es incierta.
- Es un derivado comunitario sin respaldo de Qwen ni de ISTA-DASLab.
- Licencia qwen-community-1.0: revisar sus términos antes de uso comercial; detalles de restricciones no disponibles en la información proporcionada.
- Riesgo de alucinación, sesgos y limitaciones de idioma: no disponible (no documentados en la model card).
- Las tareas y textos privados de evaluación no se distribuyen, lo que impide reproducir independientemente las mediciones.

## Enlaces

- Ficha del modelo: https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-MoREL-PB3-208-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Fork de llama.cpp (rama cnm/varexp): https://github.com/oisee/llama.cpp/tree/cnm/varexp
- Release del runtime cnm-varexp-v0.1: https://github.com/oisee/llama.cpp/releases/tag/cnm-varexp-v0.1
- Código fuente de la release: https://github.com/oisee/llama.cpp/tree/cnm-varexp-v0.1
- Construcción previa relacionada (K192p-implant16 v2): https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF
- Métricas detalladas: https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-MoREL-PB3-208-GGUF/blob/main/EVALUATION.json
