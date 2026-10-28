# Queimo/rem3di-cosmo10-combisolv-multitask

## Resumen

`Queimo/rem3di-cosmo10-combisolv-multitask` es un checkpoint de investigación publicado en HuggingFace por el usuario Queimo, orientado a química computacional y entrenado de forma multitarea. Según su model card, el modelo combina tres objetivos simultáneos: denoising de embeddings moleculares, reconstrucción de perfiles COSMO (campos sigma, A y V) y predicción de energía libre de solvatación sobre CombiSolv-QM. La ejecución parte de un encoder, unos preprocesadores y una cabeza COSMO heredados de una evaluación previa sobre BigSolDB2.0, y restaura únicamente el decodificador de denoising omitido a partir de la época 2 de PCQM.

El interés del artefacto es metodológico más que de producto: documenta un esquema de entrenamiento conjunto con ponderación de incertidumbre de tareas (método atribuido a Monroe en la propia model card) y decorrelación de covarianzas, además de un registro exhaustivo por época (cabezas, pesos de tarea aprendidos, optimizador, scheduler, estados RNG, transformaciones de etiquetas, arquitectura y manifiesto SHA-256). El autor indica que el entrenamiento está en curso, con cinco épocas conjuntas planificadas.

No obstante, la información pública es mínima: no se declaran parámetros totales, longitud de contexto, licencia, idiomas, formato de pesos ni resultados de benchmarks. El repositorio ocupa 8,2 GB, un tamaño que incluye checkpoints por época y estados de optimizador, por lo que no debe interpretarse como el tamaño de los pesos finales. Cualquier uso en producción requeriría verificar antes la validación que el autor anuncia para el informe final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card cita encoder, preprocesadores, cabeza COSMO y decodificador de denoising, sin especificar la familia arquitectónica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (el modelo trabaja sobre representaciones moleculares; no se declaran idiomas naturales) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 8,2 GB con checkpoints por época, estados de optimizador y manifiestos SHA-256; no se detalla el formato de los tensores) |
| Tareas de entrenamiento | denoising de embeddings; reconstrucción COSMO sigma/A/V; energía libre de solvatación (CombiSolv-QM) |
| Conjuntos de datos citados | BigSolDB2.0, PCQM (época 2), CombiSolv-QM |
| Estado | entrenamiento en curso; cinco épocas conjuntas planificadas |
| Fecha de publicacion | 2026-10-28 (creación del repositorio según metadatos de HuggingFace) |
| Tamano del repositorio | 8,2 GB |

## Arquitectura y entrenamiento

La model card no especifica la familia arquitectónica (transformer, GNN, modelo 3D equivariante u otra). Lo que sí detalla es la composición funcional: un encoder y unos preprocesadores compartidos, una cabeza específica para COSMO, una cabeza de reconstrucción de energía libre de solvatación y un decodificador de denoising. La inicialización es híbrida: encoder, preprocesadores y cabeza COSMO provienen de la evaluación previa sobre BigSolDB2.0, mientras que el decodificador de denoising omitido se restaura desde la época 2 de PCQM.

El régimen de entrenamiento es multitarea conjunta con ponderación de incertidumbre (referida como "Monroe's uncertainty weights") y decorrelación de covarianzas, mecanismos que buscan equilibrar la escala de las pérdidas de tareas heterogéneas (reconstrucción continua en COSMO frente a predicción escalar de energía libre). Cada directorio de época almacena todas las cabezas, los pesos de tarea aprendidos, el estado del optimizador y del scheduler, los estados RNG, las transformaciones de etiquetas, la arquitectura y un manifiesto SHA-256, con verificación de hashes de los ficheros grandes y copia de seguridad. Se anuncia una "probe" emparejada sobre BigSolDB2.0 Kumo Large por época. No se indica número de tokens, composición del dataset, ni si hubo RLHF o DPO (fases que, por otra parte, no encajan en este dominio).

## Capacidades

- Denoising de representaciones moleculares: reconstrucción de embeddings a partir de versiones perturbadas, útil como objetivo auxiliar de preentrenamiento o para robustez frente a ruido en descriptores.
- Reconstrucción de perfiles COSMO: predicción de campos sigma, área (A) y volumen (V), insumos habituales en flujos COSMO-RS/COSMO-SAC.
- Predicción de energía libre de solvatación sobre el dominio de CombiSolv-QM.
- Aprendizaje multitarea con pesos de tarea adaptativos, lo que permite reutilizar el encoder compartido para las tres tareas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (visión, audio) ni modo "thinking".
- No se documentan capacidades multilingües en lenguaje natural; el ámbito declarado es química computacional.
- Reproducibilidad: checkpoints con optimizador, scheduler, RNG y manifiestos SHA-256, lo que facilita reanudar o auditar el entrenamiento.

## Casos de uso

- Predicción de energía libre de solvatación en cribado temprano: estimar log P o afinidades de solvatación para lotes de moléculas antes de recurrir a cálculo DFT/COSMO explícito, usando la cabeza entrenada sobre CombiSolv-QM (pendiente de validación pública).
- Generación de perfiles sigma para COSMO-RS: sustituir la fase de cálculo cuántico de la superficie de screening por la reconstrucción sigma/A/V del modelo y alimentar con ella un solver termodinámico de coeficientes de actividad.
- Selección de disolventes en proceso químico: evaluar candidatos alternativos (menos tóxicos, renovables) comparando energías de solvatación predichas frente a las del disolvente de referencia.
- Preentrenamiento y transferencia: reutilizar el encoder multitarea como inicialización para tareas downstream (solubilidad, partición, estabilidad de formulación) con conjuntos de datos propios pequeños.
- Construcción de embeddings 3D para QSAR: emplear las representaciones internas como descriptores en modelos de regresión o clasificación de propiedades fisicoquímicas.
- Auditoría y reproducción de experimentos: el formato de checkpoints por época permite reanudar el entrenamiento, comparar la evolución de los pesos de tarea y verificar la integridad de los artefactos mediante los manifiestos SHA-256.
- Investigación metodológica en multitarea: estudiar el efecto de la ponderación de incertidumbre y la decorrelación de covarianzas cuando coexisten objetivos de reconstrucción densa y predicción escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que cada época recibirá una "probe" emparejada sobre BigSolDB2.0 Kumo Large y que un informe final sustituirá la tarjeta de progreso cuando los resultados pasen la validación. No hay cifras de MAE/RMSE en energía libre de solvatación, ni métricas de reconstrucción COSMO, ni comparaciones publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño de 8,2 GB del repositorio no es un indicador fiable, ya que incluye checkpoints de varias épocas, estados de optimizador y copias de seguridad.
- GPU recomendadas: no disponible. Sin recuento de parámetros no puede establecerse si el modelo cabe en una GPU de consumo (RTX 4090, 24 GB) o requiere A100/H100.
- Despliegue: la información disponible no menciona integración con vLLM, llama.cpp, Ollama o TGI; por el tipo de artefacto (checkpoints de investigación con optimizador y scheduler) el consumo previsible es mediante PyTorch y código propio, no mediante servidores de inferencia de LLM.
- Latencia y throughput: no disponibles.
- Requisito práctico: al no publicarse licencia ni pipeline, cualquier despliegue exige contactar con el autor y validar el checkpoint de la época deseada.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas en la información proporcionada (ni parámetros, ni contexto, ni métricas de los modelos comparables), por lo que no es posible construir una comparación cuantitativa sin inventar cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rem3di-cosmo10-combisolv-multitask | no disponible | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoría (modelos multitarea para química cuántica y solvatación) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento incompleto: la propia model card indica que el entrenamiento está en curso y que el informe final aún no ha sustituido la tarjeta de progreso; los resultados pueden cambiar entre épocas.
- Ausencia de licencia declarada: no se autoriza explícitamente ningún uso, incluido el comercial. Es un bloqueo legal para producción hasta que el autor la defina.
- Sin benchmarks ni validación publicada: no hay evidencia pública de precisión en energía libre de solvatación ni en reconstrucción COSMO.
- Sin especificaciones de arquitectura ni de parámetros: imposible estimar coste de inferencia, huella de memoria o latencia sin inspeccionar los checkpoints.
- Riesgo de alucinación y extrapolación: al ser un modelo de regresión sobre propiedades fisicoquímicas, puede producir predicciones plausibles pero erróneas fuera del dominio de CombiSolv-QM, BigSolDB2.0 o PCQM; no debe usarse como sustituto de cálculo cuántico en decisiones críticas sin validación cruzada.
- Sesgos de dominio: los conjuntos citados cubren un espacio químico concreto (moléculas orgánicas de las bases mencionadas); el comportamiento en iones, metales, polímeros o disolventes exóticos no está documentado.
- Sin soporte declarado de cuantización: no hay versiones GGUF ni formatos de bajo precisión, lo que complica el despliegue en hardware limitado.
- Trazabilidad: los manifiestos SHA-256 y las copias de seguridad son un punto a favor, pero el autor no publica código de inferencia ni instrucciones de uso.
- Advertencia sobre metadatos: la fecha de creación del repositorio indicada por HuggingFace es 2026-10-28, posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Queimo/rem3di-cosmo10-combisolv-multitask
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código ni demos.
