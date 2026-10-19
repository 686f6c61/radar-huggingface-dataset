# lothnic/themis-vl-2b

## Resumen

Themis VL 2B es un modelo multimodal de 2.246.880.064 parámetros desarrollado por el usuario lothnic, publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo al uso: se trata de un modelo de decisión tipada ("typed decisions") que recibe un caso —un estado textual, hasta dos imágenes o ambos— junto con un conjunto de preguntas con sus opciones, y devuelve en una sola pasada forward una distribución de probabilidad por pregunta, sin generar ni parsear texto de respuesta.

El modelo parte del backbone Qwen3.5-2B (decoder de texto de 24 capas más su torre de visión), que permanece congelado, y añade un encoder de decisión, capas LoRA y un readout de respuestas de 255 × 2.048. Soporta tres tipos de pregunta: `choice` (conjunto de opciones con nombre y descripción), `noul` (sí/no) y `score` (niveles ordenados). El contexto renderizado es de 4.096 tokens, incluyendo caso, preguntas, opciones, plantilla y tokens de imagen.

Su relevancia actual es práctica: elimina la necesidad de parsear la salida de un LLM para obtener etiquetas y ofrece probabilidades calibradas con una temperatura ajustada por tipo de decisión, lo que facilita umbrales de confianza y cascadas de enrutado. A cambio, impone una interfaz propia (`predict()`) con `trust_remote_code=True` y no es compatible con `pipeline("text-classification")` ni con `.generate()`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5-2B congelado (decoder de texto de 24 capas + torre de visión) + encoder de decisión, capas LoRA y readout de respuestas de 255 × 2.048; código custom (`themis_vl`) |
| Parametros totales | 2.246.880.064 (2.213.241.664 núcleo + 33.638.400 adaptadores) |
| Parametros activos | No aplica (no es MoE); 2.213.241.664 en el núcleo y 33.638.400 en adaptadores LoRA |
| Longitud de contexto | 4.096 tokens renderizados (caso + preguntas + opciones + plantilla + tokens de imagen); las peticiones que lo superan lanzan error |
| Tipos de cuantizacion | No disponible. Solo se documentan bfloat16 (CUDA) y float32 (CPU); no hay versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (ver LICENSE y NOTICE en el repositorio) |
| Formato de pesos | safetensors (repositorio de 4,6 GB, checkpoint completo autocontenido) |

## Arquitectura y entrenamiento

Themis VL 2B es un ensamblaje sobre un backbone congelado. El decoder de texto Qwen3.5-2B (24 capas) y su torre de visión no se entrenan; sobre ellos se monta un encoder de decisión que transforma el estado textual y las preguntas tipadas en un vector de consulta, y un readout de respuestas de 255 × 2.048 que puntúa cada opción disponible. Las capas LoRA entrenadas (33.638.400 parámetros) se conservan dentro del checkpoint completo para preservar la ruta numérica usada en la evaluación, de modo que el repositorio no es un adaptador sino una release autocontenida: incluye pesos, tokenizador, procesador de imágenes, encoder de decisión, ajustes de calibración y código de inferencia.

El checkpoint publicado corresponde al paso 3.258, seleccionado por entropía cruzada suave ("soft cross-entropy") de validación sobre el dataset `lothnic/themis-decision-mixture-v1`. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; el ajuste documentado es la calibración por temperatura (choice 1.2431, noul 1.2455, score 1.1750), activada por defecto y que preserva la respuesta más probable de cada pregunta. La innovación destacable es el contrato de inferencia: opciones y umbrales se definen en tiempo de ejecución (no hay vocabulario global de etiquetas) y la salida son probabilidades nombradas en vez de texto.

## Capacidades

- Predicción estructurada con probabilidades: devuelve, por cada pregunta, un `answer` y un mapa `probabilities` con claves nombradas o índices, en una sola pasada forward.
- Preguntas de tipo `choice`: entre 2 y 255 opciones definidas por el llamante, cada una con nombre y descripción, con probabilidades sobre esos nombres.
- Preguntas de tipo `noul`: decisión binaria sí/no con claves fijas `"true"` y `"false"`.
- Preguntas de tipo `score`: niveles ordenados de menor a mayor; el `answer` es el índice string del nivel más probable.
- Multimodalidad de entrada: 0 a 2 imágenes PIL por petición, con 64 a 1.024 tokens visuales cada una; admite texto, imágenes o ambos.
- Multitarea en una sola llamada: varias preguntas heterogéneas (choice, noul y score mezcladas) resueltas simultáneamente sobre el mismo caso.
- Calibración de probabilidades por tipo de decisión, desactivable con `calibrated=False` para obtener probabilidades crudas.
- No soporta generación de texto libre, tool calling, function calling, agentes ni razonamiento multi-paso; `.generate()` no está disponible.
- Capacidades multilingües: no disponibles (el autor no declara idiomas).

## Casos de uso

- Enrutado de tickets de soporte: una pregunta `choice` con las categorías billing/technical/sales sobre el texto del ticket devuelve la cola destino y su probabilidad en una sola pasada; el umbral sobre `probabilities` permite derivar a revisión humana los casos ambiguos sin parsear ninguna salida de texto.
- Triaje con score ordinal: una pregunta `score` con niveles Low/Medium/High asigna urgencia; al ser índices ordenados, el equipo puede mapear directamente a SLA y ordenar la cola por nivel más probable.
- Moderación de contenido con imagen: usando las 0-2 imágenes por petición (capturas, fotos de producto, documentos escaneados) junto con el texto, el modelo clasifica el caso en categorías de política definidas en tiempo de inferencia.
- Clasificación de documentos con adjuntos: facturas, albaranes o capturas de pantalla acompañados de un estado textual, con preguntas de tipo `noul` del estilo "¿requiere revisión humana?" para activar el circuito de validación.
- Router en cascada delante de un LLM mayor: al resolver la decisión sin generar tokens, el modelo actúa como primera etapa que decide si la petición necesita un modelo generativo, reduciendo coste y latencia en el camino trivial.
- Etiquetado asistido y control de calidad de datasets: las probabilidades calibradas permiten seleccionar automáticamente los ejemplos de alta confianza y enviar solo los de probabilidad baja a anotación humana, usando el tipo `noul` para decidir la derivación.
- Extracción de señales para investigación: al exponer distribuciones por pregunta en lugar de etiquetas duras, sirve como extractor de features probabilísticas para análisis de sensibilidad, estudios de calibración o ensembles posteriores.
- Verificación de pares en pipelines de datos: comparar si dos formulaciones de un mismo caso producen la misma distribución, aprovechando que las opciones se definen por petición y no dependen de un vocabulario fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación presente en la model card es el criterio de selección del checkpoint (paso 3.258, elegido por entropía cruzada suave de validación), sin valores numéricos asociados ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,5 GB solo para pesos (2.246.880.064 parámetros × 2 bytes) más activaciones para 4.096 tokens, lo que sitúa el consumo realista en torno a 6-7 GB. Estimación calculada a partir del recuento de parámetros; el autor no publica cifras de VRAM.
- VRAM estimada en float32 (ruta CPU): aproximadamente 9 GB de pesos más activaciones. Estimación, no dato publicado.
- GPU recomendadas: el autor verifica como entorno de referencia CUDA bfloat16 en una RTX 4060 Laptop GPU. Cualquier GPU con 8 GB o más de VRAM debería alojar el modelo; A100 y H100 quedan muy por encima del requisito y solo tienen sentido para lotes grandes.
- Cabe en GPU de consumo: sí, según la referencia del propio autor en una RTX 4060 Laptop (8 GB). No se han validado otros aceleradores.
- Opciones de despliegue: únicamente `transformers` con `trust_remote_code=True` y el método `predict()` del modelo, más `AutoTokenizer` y `AutoImageProcessor` con `backend="pil"`. Entorno probado: Python 3.12, torch 2.14.1, transformers 5.19.0, peft 0.21.2, tokenizers 0.23.3 y flash-linear-attention 0.5.2 para CUDA. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF; el modelo no expone `.generate()`.
- Latencia y throughput: no disponibles. Solo se indica que la inferencia en CPU (float32) puede diferir ligeramente de los resultados en CUDA bfloat16, y que otros runtimes cuantizados no han sido validados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la informacion proporcionada, por lo que la comparación se limita a aspectos funcionales y estructurales.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Themis VL 2B (lothnic) | 2.246.880.064 (33,6 M en adaptadores) | 4.096 tokens renderizados | Distribución de probabilidad por pregunta tipada | Apache 2.0 | HuggingFace, checkpoint completo, código custom |
| Qwen3.5-2B (modelo base) | No disponible en la informacion proporcionada (es el backbone del anterior, decoder de 24 capas) | No disponible | Texto generado (modelo generativo de propósito general) | No disponible en la informacion proporcionada | HuggingFace (`Qwen/Qwen3.5-2B`) |
| Alternativas de clasificación con encoder tipo BERT | No disponible | No disponible | Etiqueta o logits sobre vocabulario fijo | No disponible | No disponible |

La diferencia funcional clave frente al modelo base es que Themis no genera texto: fija las opciones en tiempo de inferencia y devuelve probabilidades calibradas, lo que evita el parseo de salidas. No se han identificado en la información disponible otros modelos de decisión multimodal de tamaño comparable para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: `.generate()` no está soportado y el pipeline estándar `pipeline("text-classification")` con etiquetas string tampoco funciona. La integración exige llamar a `predict()` con la interfaz tipada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Conviene revisar el código y fijar `revision="v1.0.0"` (o el commit de release) para reproducibilidad.
- Contexto limitado a 4.096 tokens renderizados, contando caso, preguntas, opciones, plantilla y tokens de imagen. Las peticiones que lo exceden lanzan un error en lugar de truncar, lo que puede romper pipelines si no se controla la longitud de entrada.
- Límites duros de entrada: máximo 2 imágenes por petición (64-1.024 tokens visuales cada una) y entre 2 y 255 opciones por pregunta.
- Idiomas soportados no declarados: no hay garantía documentada de comportamiento fuera del idioma o idiomas usados en el dataset de ajuste.
- Sin benchmarks publicados ni métricas de accuracy, F1 o calibración reportadas. El repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente de la comunidad.
- Validación de hardware muy estrecha: solo CUDA bfloat16 en RTX 4060 Laptop como referencia local; otros aceleradores y runtimes cuantizados no han sido validados. Los resultados en CPU float32 pueden diferir ligeramente.
- Riesgo de sobreconfianza: la calibración por temperatura se ajustó en un conjunto no documentado en la información disponible; su transferencia a dominios distintos del dataset `themis-decision-mixture-v1` no está verificada.
- Sesgos: no documentados. Al heredar el backbone Qwen3.5-2B congelado, el modelo puede arrastrar los sesgos de sus datos de preentrenamiento, y el dataset de ajuste (`lothnic/themis-decision-mixture-v1`) no se describe en composición ni procedencia.
- Al no generar texto, el riesgo de alucinación textual es nulo, pero persiste el de asignar alta probabilidad a opciones incorrectas cuando el caso es ambiguo o cae fuera de la distribución de entrenamiento.
- Licencia Apache 2.0, en principio permisiva para uso comercial, pero sujeta a lo dispuesto en los ficheros LICENSE y NOTICE del repositorio, que deben revisarse antes de un despliegue en producción.
- Fecha de creación del repositorio: 2026-10-19. Es un modelo muy reciente y de un único autor, sin ecosistema de herramientas ni soporte de runtimes de inferencia de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lothnic/themis-vl-2b
- Perfil del autor: https://huggingface.co/lothnic
- Dataset de ajuste: https://huggingface.co/datasets/lothnic/themis-decision-mixture-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Ficheros LICENSE y NOTICE: disponibles en el propio repositorio de HuggingFace (https://huggingface.co/lothnic/themis-vl-2b)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
