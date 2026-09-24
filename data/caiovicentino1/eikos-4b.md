# caiovicentino1/Eikos-4B

## Resumen

Eikos-4B es un modelo abierto de decisiones tipadas (*typed decisions*) desarrollado por el usuario caiovicentino1 mediante fine-tuning sobre Qwen/Qwen3.5-4B. No genera texto en el momento de la decisión: responde, en una única pasada hacia delante, preguntas cerradas sobre un estado o evidencia dados, y devuelve la distribución de probabilidad completa sobre un conjunto acotado de opciones junto con un valor de confianza que permite abstenerse por debajo de un umbral. Admite tres tipos de pregunta: `noul`/`boolean` (sí/no con probabilidad), `choice` (una entre N opciones) y `score` (niveles ordinales).

El foco declarado es finanzas globales, trading y *trade finance*: aplicación de reglas, políticas y libros normativos a un caso concreto (límites de orden, margen, *wash sales*, bandas de precio, límites de pago, KYC/AML, políticas de préstamo, créditos documentarios, mapeo de etapas Incoterms®, IVA/GST), sentimiento financiero a nivel de entidad, verificación de respuestas sobre tablas financieras y comprobaciones temporales y numéricas. El propio autor delimita el alcance: aplica reglas a los hechos que recibe y no predice precios.

El checkpoint tiene 4.659.865.088 parámetros y un repositorio de 9,3 GB en safetensors, con licencia MIT e idiomas de entrenamiento inglés y portugués (el español se reserva íntegramente como prueba *zero-shot*). La familia anunciada incluye además Eikos-27B y builds FP8 e INT4. La arquitectura base es `qwen3_5` y las notas de despliegue la describen como híbrida (*Gated DeltaNet*); la configuración de servicio recomendada usa 16.384 tokens de longitud máxima, mientras que los dossiers de entrenamiento de contexto largo cubren de 6.000 a 32.000 tokens. Su interés práctico está en ofrecer un componente de decisión calibrado y autocontenido, desplegable sin adaptadores ni APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con fine-tuning sobre `qwen3_5`; las notas de despliegue la describen como híbrida (Gated DeltaNet). No es MoE |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica (modelo no MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de servicio recomendada (`--max-model-len 16384`); dossiers de entrenamiento de 6.000 a 32.000 tokens. Máximo nativo del modelo: no disponible |
| Tipos de cuantizacion | Checkpoint publicado en bfloat16 (repositorio de 9,3 GB); la familia anuncia builds FP8 e INT4. Builds MLX pendientes de validación |
| Idiomas soportados | Inglés y portugués (entrenamiento). Español excluido por completo y usado como prueba zero-shot. Otros idiomas: no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (layout oficial de Qwen, sin adaptadores) |
| Modelo base | Qwen/Qwen3.5-4B (relación: finetune) |
| Tipo de tarea declarado | text-classification / image-text-to-text (etiquetas de HuggingFace) |
| Dataset de entrenamiento | caiovicentino1/eikos-decisions |
| Tamaño del repositorio | 9,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-24 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se distribuye como un único checkpoint autocontenido en el layout oficial de Qwen, sin adaptadores LoRA, sin LLM externo y sin API. Las advertencias de despliegue lo sitúan como una arquitectura híbrida (Gated DeltaNet), lo que obliga a usar vLLM ≥ 0.30.0 con `--mamba-cache-mode all` y caché de prefijo para obtener resultados correctos cuando se procesan por lotes varias peticiones largas. La inferencia consiste en un prompt estructurado en formato SemIf (estado, pregunta y opciones etiquetadas con letras), seguido de una lectura de los logits del siguiente token restringida a las letras de las opciones y un softmax con temperatura fija (T = 1 por defecto). No hay decodificación generativa en el momento de la decisión.

El entrenamiento es una destilación desde un profesor fuerte, GLM-5.3-Flash con esfuerzo de razonamiento máximo, sobre cuatro familias de datos: ítems de decisión generados y etiquetados a ciegas, ítems exactos programáticos, reglas composicionales y dossiers de contexto largo (6.000-32.000 tokens). Se usaron tres señales solo durante el entrenamiento, todas desactivadas en inferencia: entropía cruzada suave contra las probabilidades del profesor con permutación del orden de las opciones, una pérdida auxiliar sobre una rationale corta que explica la respuesta correcta y consistencia de vista inglés↔portugués (el mismo ítem en dos idiomas debe dar la misma respuesta). El 4B publicado es una media de pesos (*model soup*) de dos fine-tunes que comparten datos y semilla: uno con consistencia de vista y otro que añade además un objetivo latente ligero de estilo JEPA (peso 0,2: invariancia de vista en capas intermedias, predicción latente de la rationale y una cabeza de energía estado-opción). La media ganó en el conjunto de desarrollo interno y en las familias, temas e idiomas reservados.

## Capacidades

- Decisión tipada en una sola pasada: `noul`/`boolean` (probabilidad de "sí"), `choice` (una de N opciones) y `score` (niveles ordinales, con valor esperado).
- Salida calibrada: distribución de probabilidad completa más un valor de confianza por pregunta, lo que permite abstención por umbral en el lado del llamador.
- Aplicación de reglas, políticas y libros normativos a un caso: límites de orden, margen, *wash sales*, bandas de precio, límites de pago, KYC/AML, políticas de préstamo, créditos documentarios, mapeo de etapas Incoterms® e IVA/GST.
- Sentimiento financiero a nivel de entidad y verificación de respuestas sobre tablas financieras.
- Comprobaciones temporales y numéricas dentro del estado proporcionado.
- Procesamiento conjunto de varias preguntas sobre el mismo estado en una sola pasada, con la evidencia compartida procesada una vez mediante caché de prefijo.
- Sesiones de agente con estado incremental y caché (el modelo card describe este modo de uso; el ejemplo completo aparece truncado en la información disponible).
- API HTTP compatible con TypeSafe en `/v1/systemone`, con un objeto `state` y un mapa de `questions`.
- Multilingüe limitado a inglés y portugués, con consistencia de vista entre ambos idiomas forzada durante el entrenamiento.
- No soporta, según la documentación disponible: generación de texto libre en el momento de la decisión, predicción de precios, *tool calling*, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Cumplimiento de límites de orden en mesas de trading: el modelo recibe el ticket y el texto de la regla (por ejemplo, "una orden no puede superar el 50 % del patrimonio sin aprobación escrita") y devuelve, con probabilidad y confianza, si la orden puede ejecutarse y qué acción debe tomar la mesa (ejecutar, pedir aprobación, reducir tamaño o rechazar).
- Triaje KYC/AML y políticas de préstamo: a partir de un expediente con hechos y criterios regulatorios, clasifica el caso en niveles ordinales de riesgo (`low`, `moderate`, `high`, `critical`) con valor esperado, lo que permite priorizar revisiones humanas por encima de un umbral de confianza.
- Créditos documentarios y Incoterms®: mapea el estadio del contrato o de la carta de crédito a la etapa correspondiente y verifica condiciones documentales, una tarea de regla cerrada donde la calibración importa más que la fluidez del texto.
- Sentimiento financiero a nivel de entidad: clasifica el tono de noticias o informes sobre una entidad concreta como una decisión tipada, integrándolo en agregadores que necesitan probabilidades y no texto libre.
- Verificación de respuestas sobre tablas financieras: comprueba si una afirmación numérica o temporal se sostiene sobre los datos de una tabla dada, útil como capa de control en pipelines de extracción documental.
- Automatización de tareas fiscales (IVA/GST): aplica reglas impositivas declaradas a un caso concreto para decidir el tratamiento aplicable en cada línea, manteniendo la decisión auditable gracias a la distribución de probabilidad devuelta.
- Agentes con estado incremental: en sesiones donde el expediente crece por turnos, la caché de prefijo evita reprocesar el estado completo en cada pregunta, de modo que el modelo puede actuar como evaluador de reglas dentro de un bucle de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor indica expresamente que las cifras que acompañan al lanzamiento proceden de su propio harness de evaluación y que el envío a la tabla de clasificación oficial de JevBench está pendiente.

La información disponible solo describe cualitativamente la figura `assets/eikos_launch.png`, que representa precisión en la parte difícil de JevBench y error cuando el modelo se muestra al menos un 90 % seguro y el contexto es largo, comparando a Eikos con "Jev" y "Laya". No se incluyen los valores.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del tamaño del checkpoint, no confirmada por el autor): unos 9,3 GB solo para pesos en bfloat16, más caché KV y de prefijo para contextos de hasta 16.384 tokens.
- Builds anunciados: FP8 (en torno a 5 GB de pesos) e INT4 (en torno a 2,5-3 GB), ambos mencionados para Eikos-4B y Eikos-27B.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan el checkpoint bfloat16 con holgura; tarjetas de 16 GB (RTX 4080/4060 Ti 16 GB) son viables en FP8/INT4; 12 GB solo con INT4 y contexto reducido.
- GPU de centro de datos: A100 40/80 GB y H100 para lotes grandes y contextos de 16.384 tokens con caché de prefijo.
- Apple Silicon: soporte vía MLX o MPS; los builds MLX están anunciados pero pendientes de validación en el momento de la información disponible.
- Despliegue: vLLM ≥ 0.30.0 es obligatorio (`--served-model-name decider`, `--enable-prefix-caching`, `--mamba-cache-mode all`, `--logprobs-mode processed_logprobs`, `--max-logprobs 32`, `--dtype bfloat16`, `--max-model-len 16384`), más un servidor `serve.py` que expone la API compatible con TypeSafe. También PyTorch/transformers, MLX y MPS.
- Sin soporte documentado para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eikos-4B | 4,66 B | 16.384 tokens en la configuración de servicio recomendada | Decisión tipada calibrada (finanzas y trade finance) | MIT | Pesos safetensors en HuggingFace; FP8, INT4 y 27B anunciados |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la información proporcionada | No disponible | Generación de texto general | No disponible | Modelo base sobre el que se hace fine-tuning |
| Eikos-27B (misma familia) | 27 B (según el autor) | No disponible | Igual que Eikos-4B | MIT (según el autor) | Anunciado, no detallado |
| "Jev" y "Laya" | No disponible | No disponible | Aparecen como referencia en la figura comparativa del autor | No disponible | No disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia frente a alternativas de terceros de la misma categoría: la información proporcionada no incluye cifras de benchmark y los dos sistemas de referencia citados ("Jev" y "Laya") aparecen únicamente nombrados en el gráfico de lanzamiento.

## Limitaciones y advertencias

- Alcance restringido por diseño: aplica reglas a los hechos que recibe y no predice precios ni genera análisis libre; cualquier uso fuera de esa función queda fuera de lo documentado.
- Riesgo de decisión incorrecta con alta confianza: al no generar texto, el modo de fallo típico no es una alucinación narrativa, sino una probabilidad mal calibrada sobre una opción; el autor recomienda abstenerse por debajo de un umbral, pero no publica curvas de calibración.
- Idiomas: solo inglés y portugués. El español nunca se usó en entrenamiento y se emplea como prueba zero-shot, por lo que el rendimiento en español no está garantizado ni cuantificado en la información disponible.
- Dependencia crítica de la versión de vLLM: con versiones anteriores a 0.30.0, agrupar por lotes varias peticiones largas sobre esta arquitectura híbrida (Gated DeltaNet) devuelve respuestas incorrectas; el autor midió caídas de 3 a 6 puntos en ítems largos con documento compartido con vLLM 0.11. Es un riesgo de degradación silenciosa en producción.
- Entrenamiento por destilación de un profesor (GLM-5.3-Flash) sobre datos en parte generados y etiquetados a ciegas: los sesgos, errores y convenciones del profesor pueden transferirse al estudiante.
- Ausencia de evaluación independiente: los únicos números citados provienen del harness propio del autor y el envío a JevBench está pendiente; no hay resultados verificados por terceros.
- Metadatos contradictorios: el front matter de la model card declara `inference: false`, mientras el cuerpo documenta despliegue en vLLM, transformers y MLX. Además, la etiqueta `image-text-to-text` figura en HuggingFace sin que la model card documente ninguna capacidad de visión.
- Licencia MIT: permite uso comercial y modificación, pero se distribuye sin garantías y sin documentación de uso responsable ni de cumplimiento normativo. En aplicaciones financieras reguladas, la decisión del modelo no sustituye la revisión humana.
- Adopción nula verificable en el momento de la información disponible: 0 descargas y 0 likes, sin comunidad que haya validado el comportamiento fuera del entorno del autor.
- Cumplimiento y trazabilidad: la aplicación automática de normativa (KYC/AML, créditos documentarios, IVA/GST) tiene consecuencias legales; se requiere registro de la distribución de probabilidad, del umbral de abstención y de la versión exacta del checkpoint y del motor de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiovicentino1/Eikos-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/caiovicentino1/eikos-decisions
- Repositorio de código: https://github.com/caiovicentino/eikos
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Figura de lanzamiento (JevBench y comparativa con Jev y Laya): https://huggingface.co/caiovicentino1/Eikos-4B/resolve/main/assets/eikos_launch.png
- Búsqueda web: los resultados devueltos no contienen enlaces relacionados con el modelo, su dataset, su paper ni su repositorio; no se han encontrado referencias externas adicionales.
