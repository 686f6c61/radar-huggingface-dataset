# Multigackin/Kimi-K3-Abliterated

## Resumen

Kimi-K3-Abliterated es una variante del modelo Kimi K3 de Moonshot AI, publicada por el usuario Multigackin (la model card referencia la organizacion SHS-Lab) en Hugging Face. Se trata de una red de mezcla de expertos (MoE) de 2,8 billones de parametros totales, con 104.000 millones de parametros activos por token, construida sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con capacidades nativas de vision y una ventana de contexto de un millon de tokens.

La particularidad de esta publicacion es que ha sido sometida a un proceso de "abliteration": una intervencion quirurgica sobre los pesos que atenua los mecanismos de rechazo alineados del modelo base, sin cambiar la arquitectura ni anadir datos de entrenamiento nuevos. El autor declara haber eliminado mas del 98 % de la senal de salvaguarda identificada en las familias de pesos objetivo, orientado a entradas en ingles y japones.

El interes practico es doble. Por un lado, conserva las capacidades agenticas y multimodales del modelo base (razonamiento estructurado siempre activo, orquestacion de herramientas, codigo de largo horizonte). Por otro lado, su naturaleza "uncensored" lo convierte en una pieza relevante para investigacion de alineamiento y evaluacion de red-team, aunque tambien en un artefacto con riesgos de uso claros. El repositorio pesa 1561 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8 T) |
| Parametros activos | 104 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | MXFP4 en pesos y MXFP8 en activaciones (entrenamiento con quantizacion); formato de 8 bits en el repo |
| Idiomas soportados | no disponible (la atenuacion de rechazos se documenta para ingles y japones) |
| Licencia | Kimi K3 License (identificador "other", nombre "kimi-k3") |
| Formato de pesos | safetensors (compressed-tensors) |
| Capas totales | 93 (1 capa densa) |
| Composicion de atencion | 69 capas KDA + 24 capas Gated MLA |
| Dimension oculta de atencion | no disponible (truncado en la informacion recibida) |
| Tamano del repositorio | 1561,0 GB |
| Libreria | transformers (requiere custom_code) |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 93 capas, de las cuales solo una es densa. La atencion combina dos mecanismos: 69 capas con Kimi Delta Attention (KDA), una variante de atencion lineal orientada a eficiencia en contextos largos, y 24 capas con Gated MLA (Multi-head Latent Attention con compuerta), que reducen el coste de cache KV. Esta hibridacion es la que permite sostener una ventana de un millon de tokens sin un crecimiento cuadratico inasumible en memoria. El modelo activa 104.000 millones de parametros por token sobre un total de 2,8 billones, lo que situa el coste de inferencia en el orden de un modelo denso de ~100 B.

El modelo base Kimi K3 fue entrenado con quantizacion consciente (QAT) en MXFP4 para pesos y MXFP8 para activaciones, lo que explica que el checkpoint se distribuya ya en formato comprimido de 8 bits. Incluye capacidades nativas de vision y video dentro de la misma arquitectura, y un modo de razonamiento siempre activo que emite trazas `reasoning_content` con niveles de esfuerzo configurables (`low`, `high`, `max`). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La intervencion de abliteration es el unico cambio respecto al base: modificacion dirigida de valores de pesos para suprimir activaciones de salvaguarda, sin reentrenamiento ni datos nuevos. La model card no detalla la metodologia exacta (direcciones de rechazo, capas afectadas ni criterio de seleccion).

## Capacidades

- Generacion de texto y razonamiento estructurado con trazas de pensamiento explicitas y niveles de esfuerzo configurables.
- Codigo de largo horizonte: sesiones sostenidas sobre bases de codigo extensas, desarrollo de kernels de GPU, compiladores y flujos con vision integrada.
- Multimodalidad nativa: procesa texto, imagenes y video en una sola arquitectura (pipeline any-to-any).
- Contexto de un millon de tokens, adecuado para ingesta de repositorios completos y conversaciones multi-turno muy extendidas.
- Trabajo de conocimiento agentico: pipelines de investigacion de extremo a extremo, generacion de visualizaciones interactivas, procesamiento de documentos y hojas de calculo.
- Navegacion web multi-paso mediante integracion de herramientas MCP.
- Orquestacion de herramientas de terminal y tool calling dentro de flujos agenticos.
- Capacidades multilingues: no disponibles en detalle; la atenuacion de rechazos se documenta para ingles y japones.
- Comportamiento "abliterated": reduccion declarada de mas del 98 % de la senal de salvaguarda en las familias de pesos objetivo.

## Casos de uso

- Investigacion de alineamiento y red-team: el modelo permite estudiar que comportamientos emergen cuando se suprimen los mecanismos de rechazo, comparando respuestas contra el Kimi K3 original en entornos controlados y con supervision humana.
- Auditoria de seguridad de modelos frontera: sirve para construir conjuntos de prompts adversarios y medir la robustez de las salvaguardas del modelo base, ya que la diferencia entre ambos checkpoints aísla el efecto de la abliteration.
- Ingenieria de software sobre repositorios completos: con un millon de tokens de contexto puede ingerir un monorepo entero y sostener sesiones de refactorizacion, revision de parches o desarrollo de kernels CUDA sin perder el hilo entre archivos.
- Automatizacion de pipelines de investigacion: combinando tool calling, navegacion web via MCP y procesamiento de documentos, puede encadenar busqueda, extraccion y generacion de visualizaciones interactivas a partir de fuentes dispersas.
- Analisis de documentos y hojas de calculo a gran escala: la ventana larga y la multimodalidad permiten procesar lotes de PDFs e imagenes junto con datos tabulares en una sola pasada, util en due diligence o auditoria documental.
- Procesamiento de video y vision en el bucle: al ser any-to-any, encaja en tareas donde la salida de una etapa visual alimenta la siguiente (por ejemplo, inspeccion de capturas de interfaz para generar codigo de automatizacion).
- Evaluacion comparativa de quantizacion: al distribuirse en MXFP4/MXFP8, sirve para medir la degradacion de calidad frente al base en tareas de razonamiento y codigo bajo el mismo esquema de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en MXFP4 pesa del orden de 1,4 TB, por lo que la inferencia en precision nativa exige agregados multi-GPU de gran capacidad. No es viable en una sola GPU, ni siquiera en H100 de 80 GB.
- GPU recomendadas: para servir el modelo completo se necesitan nodos con multiples H100/H200 o B200 con NVLink; un despliegue realista parte de 8 GPU de 80 GB en adelante, y probablemente mas segun el paralelismo de expertos y la cache KV para contexto largo.
- Cabe en GPU de consumo: no. Con 2,8 T de parametros totales, ninguna RTX 4090 (24 GB) ni configuracion multi-GPU consumer puede alojar los pesos.
- Opciones de despliegue: transformers con `trust_remote_code` (requiere custom_code), y previsiblemente frameworks con soporte de paralelismo de expertos y quantizacion MXFP4 (vLLM, SGLang, TGI) si anaden compatibilidad con la arquitectura KDA/AttnRes. llama.cpp y Ollama no son opciones realistas a esta escala.
- Latencia y throughput: no disponibles. Como referencia estructural, 104 B de parametros activos por token situan el coste por token en el rango de un modelo denso de ~100 B, pero la atencion hibrida y el contexto de un millon de tokens anaden coste adicional en prefill.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi-K3-Abliterated | 2,8 T | 104 B | 1 M | Kimi K3 License | Variante sin salvaguardas del base |
| moonshotai/Kimi-K3 | 2,8 T | 104 B | 1 M | Kimi K3 License | Modelo base con alineamiento intacto |
| Alternativas frontier open-weight de escala comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion mas directa y fiable es contra el propio Kimi K3: misma arquitectura, mismos parametros y mismo contexto, con la unica diferencia de los pesos modificados por abliteration. Cualquier comparacion con otros modelos frontera requeriria datos de benchmarks que no se han facilitado.

## Limitaciones y advertencias

- La abliteration elimina deliberadamente las salvaguardas de rechazo: el modelo puede producir contenido danino, ilegal o inseguro que el base rechazaria. No es apto para despliegues de cara al publico sin capas de moderacion externas.
- La atenuacion se documenta para ingles y japones; el comportamiento en otros idiomas es incierto y podria degradar la coherencia o la utilidad de las respuestas.
- Riesgo elevado de alucinacion en tareas de recuperacion de hechos, agravado en contextos de un millon de tokens donde la atencion dispersa puede perder informacion intermedia.
- La intervencion sobre pesos puede haber degradado capacidades no relacionadas con el rechazo (razonamiento, codigo, vision); no se han publicado evaluaciones que lo descarten.
- Licencia Kimi K3 License con identificador "other": es imprescindible revisar los terminos antes de cualquier uso comercial, ya que puede imponer restricciones de atribucion, uso o redistribucion.
- El repositorio es enorme (1561 GB) y no registra descargas ni validacion de la comunidad; no hay evidencia de terceros sobre la calidad del checkpoint ni sobre la integridad de los pesos.
- Requiere `trust_remote_code` y codigo personalizado de la arquitectura, lo que anade superficie de riesgo en la cadena de suministro del modelo.
- Uso previsto segun el autor: investigacion de alineamiento, red-team y experimentacion controlada en entornos gobernados. Cualquier otro uso queda fuera de esa recomendacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Multigackin/Kimi-K3-Abliterated
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Organizacion referenciada en la model card: https://huggingface.co/SHS-Lab
- Discusiones del autor de la model card: https://huggingface.co/SHS-Lab/Kimi-K3-Abliterated/discussions
