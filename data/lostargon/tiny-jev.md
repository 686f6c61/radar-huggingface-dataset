# lostargon/Tiny-Jev

## Resumen

Tiny-Jev es un modelo de decisión de tipo "System One" desarrollado por el usuario lostargon y publicado en HuggingFace. No es un modelo generativo: recibe un *estado* (un mensaje, un ticket, un registro JSON, una transcripción o un diff), una pregunta formulada como la escribiría un desarrollador en código y un conjunto cerrado de opciones, y devuelve en un único forward pass una distribución de probabilidad sobre esas opciones. Deriva de Qwen/Qwen3-0.6B mediante fine-tuning con LoRA (posteriormente fusionado en los pesos) y cuenta con 595.778.561 parámetros totales, lo que lo sitúa en la franja de los 0,6B.

El modelo expone tres primitivas sobre una misma llamada: *Choice* (elige la mejor opción y devuelve la distribución completa), *Score* (sitúa el estado en una escala ordenada y reporta el valor esperado, que puede caer entre niveles) y *Noul* (estima la probabilidad de que una afirmación sobre el estado sea verdadera). Cada respuesta incluye una confianza calibrada mediante temperature scaling sobre un split reservado, de modo que el código que lo consume pueda actuar sobre las predicciones seguras y enrutar el resto a un modelo mayor.

Su relevancia práctica está en el coste y la latencia: al ser no autorregresivo, resuelve la decisión en milisegundos en GPU de consumo y en torno a 20-50 ms en portátiles Apple M-series, sin generar texto y por tanto sin posibilidad de salida malformada, ya que el espacio de respuestas es exactamente la lista de opciones que se le pasa. Está pensado como el `if` inteligente de un pipeline: enrutado, triaje, moderación, filtrado previo a una ventana de contexto cara o guardarraíl de la salida de otro modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B) con cabeza lineal de decisión; inferencia no autorregresiva de un solo paso |
| Parametros totales | 595.778.561 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se documentan cuantizaciones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (inglés); el entrenamiento incluyó estados en ruso con preguntas en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (un único archivo para el stack decoder y la cabeza de decisión), con código propio `modeling_tiny_jev.py` |

Datos adicionales: pipeline declarado `text-classification`, librería `transformers`, tamaño del repositorio 1,2 GB, 0 descargas y 3 likes en el momento de la consulta, creado el 21 de septiembre de 2026 y actualizado el mismo día. Requiere `trust_remote_code=True` porque el modelo incluye código de modelado propio (unas 150 líneas, sin dependencias más allá de `torch` y `transformers`).

## Arquitectura y entrenamiento

Tiny-Jev parte de Qwen3-0.6B y conserva su stack decoder, sobre el que se añade una cabeza lineal pequeña que proyecta a un escalar el hidden state capturado en un token marcador. El mecanismo es el siguiente: cada opción se renderiza como una línea propia después del estado y la pregunta, seguida de su token marcador; el hidden state en cada marcador pasa por la cabeza lineal y produce un escalar por opción, y un softmax sobre esos escalares da la respuesta. *Noul* es internamente un *Choice* de dos opciones (`no` / `yes`) y *Score* es un *Choice* sobre niveles ordenados del que se reporta el valor esperado. Al ser no autorregenerativo, no hay decodificación token a token ni posibilidad de salida fuera de esquema.

El entrenamiento se hizo por fine-tuning con LoRA fusionado en los pesos sobre **datasets sintéticos** de decisiones tipadas: aproximadamente cien mil estados, cada uno emparejado con varias preguntas, con etiquetas derivadas de reglas explícitas o calculadas por código, de forma que cada objetivo es exacto. La función de pérdida fue una entropía cruzada suave contra vectores de probabilidad objetivo y, posteriormente, se aplicó calibración de temperatura sobre un split reservado. Las familias de tareas cubren soporte y operaciones, guardarraíles de otros modelos, contenido y texto, voz y diálogo, lectura estructurada y conjuntos de robustez (negación contrastiva, intentos de prompt injection embebidos en el estado y estados en ruso con preguntas en inglés). Cada dominio incluye una proporción alta de casos deliberadamente difíciles y las reglas de etiquetado fueron auditadas mediante re-etiquetado ciego antes de usar los datos.

## Capacidades

- Clasificación con distribución de probabilidad sobre un conjunto cerrado de opciones (*Choice*), incluyendo la confianza asociada a la opción ganadora.
- Puntuación en escalas ordenadas con valor esperado interpolable (*Score*), por ejemplo niveles de frustración o urgencia.
- Verificación de afirmaciones sobre un estado con probabilidad de veracidad (*Noul*), por ejemplo si el cliente pide explícitamente un reembolso.
- Fan-out: varias preguntas sobre un mismo estado resueltas en una sola llamada batcheada mediante `decide`.
- Enrutado y triaje: asignación de tickets a equipos (billing, technical, sales), severidad, riesgo de churn, intención de cancelación o escalado.
- Guardarraíles de otros modelos: comprobación de si una respuesta está fundamentada en el contexto, si es conforme a política, qué tipo de fallo presenta o si debe escalarse.
- Seguridad de agentes: evaluación de si una acción propuesta (comando de shell, escritura de archivo, llamada a API) es segura, reversible, está en alcance o filtra secretos.
- Moderación de contenido con categorías y severidad, análisis de sentimiento y aspectos en reseñas, señales de reseñas falsas, intención de búsqueda y relevancia de página, veredictos de revisión de código sobre diffs reales.
- Voz y diálogo sobre transcripciones ASR ruidosas: turn-taking (¿ha terminado el interlocutor?), destinatario, detección de buzón de voz, tipo de respuesta, frustración y siguiente acción del bot.
- Lectura estructurada: análisis de logs, horarios y zonas horarias, niveles de inventario, reglas de control de acceso, transiciones de máquina de estados, grafos de dependencias, rankings con reglas de desempate, validación de formato, precios con descuentos e impuestos, pasajes de recuperación y soporte de citas.
- Robustez a negación y alcance (*pide un reembolso* / *no pide* / *solo pide un reembolso*) y a intentos de prompt injection incrustados en el estado.
- Salida siempre bien formada por construcción: no hay parseo, reintentos ni errores de esquema.
- No soporta generación de texto libre, tool calling clásico ni razonamiento multi-paso generativo: su función es emitir decisiones probabilísticas tipadas.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto del ticket y metadatos como el plan del cliente, `choice` devuelve el equipo responsable con una distribución completa; las predicciones por debajo del umbral de confianza se derivan a revisión humana en lugar de a un equipo potencialmente incorrecto.
- Triaje de intención transaccional: `noul` responde a afirmaciones del tipo "el cliente solicita explícitamente un reembolso" con una probabilidad, lo que permite disparar flujos automáticos solo cuando la evidencia es clara y evitar falsos positivos por negaciones o peticiones condicionales.
- Filtrado previo a una ventana de contexto cara: el modelo clasifica y descarta o prioriza entradas antes de enviarlas a un LLM grande, reduciendo el número de tokens facturados y la latencia del pipeline completo.
- Guardarraíl de la salida de otro modelo: antes de mostrar una respuesta generada, Tiny-Jev evalúa si está fundamentada en el contexto proporcionado, si es conforme a política y qué tipo de fallo presenta, y decide si se muestra o se escala.
- Moderación y etiquetado a volumen: clasificación de categorías y severidad en grandes lotes de contenido con latencias de milisegundos por elemento en GPU de consumo, adecuado para colas de moderación de alto caudal.
- Verificación de acciones de agentes autónomos: antes de ejecutar un comando de shell o una escritura de archivo propuesta por un agente, el modelo estima si la acción es segura, reversible, está en alcance y no filtra secretos.
- Análisis de voz en atención telefónica: sobre transcripciones ASR ruidosas, detecta buzón de voz, determina si el interlocutor ha terminado de hablar y estima frustración y urgencia para decidir la siguiente acción del bot.
- Procesamiento de documentos estructurados: validación de formato, aplicación de reglas de negocio a hechos (descuentos, impuestos, niveles de inventario, reglas de control de acceso) y veredictos sobre diffs de código en revisión.
- Defensa frente a prompt injection: al tratar el estado como dato y no como instrucción, puede etiquetar si un texto entrante contiene un intento de inyección sin que el etiquetado cambie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación con métricas de accuracy sobre ítems reservados y ECE (expected calibration error), pero el contenido proporcionado se interrumpe justo al definir el ECE, antes de mostrar ninguna cifra, por lo que no se reproduce ningún número.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los pesos ocupan aproximadamente 1,19 GB (595,8 M de parámetros), por lo que con activaciones y overhead se puede operar cómodamente por debajo de 2-3 GB. En fp32 serían unos 2,4 GB solo de pesos.
- GPU recomendadas: cabe en cualquier GPU de consumo moderna con al menos 4 GB de VRAM. No requiere A100 ni H100; una RTX 3060, RTX 4060, RTX 4090 o similar es más que suficiente, y el modelo también puede ejecutarse en CPU.
- Cabe en consumer GPU: sí, en prácticamente todas las GPU dedicadas de los últimos años, y también en Apple Silicon vía MPS.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada, ya que el modelo incluye `modeling_tiny_jev.py` propio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser autorregresivo ni distribuir GGUF, esas rutas no están soportadas de forma oficial en la información disponible.
- Latencia y throughput: según el autor, unos pocos milisegundos por llamada en GPU de consumo y en torno a 20-50 ms en un portátil Apple M-series. El rendimiento agregado depende del tamaño del lote y del número de opciones por pregunta. No hay cifras de throughput publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión no autorregresivos con calibración explícita) en el material proporcionado. La única referencia directa es el modelo base del que deriva:

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny-Jev | 595.778.561 | Decisor no autorregresivo con cabeza de clasificación | no disponible | apache-2.0 | HuggingFace, requiere `trust_remote_code` |
| Qwen/Qwen3-0.6B | no disponible en la informacion proporcionada | LLM generativo autorregresivo | no disponible | no disponible en la informacion proporcionada | HuggingFace |

Cualquier comparación con clasificadores encoder como DeBERTa o con APIs de clasificación comerciales no puede sustentarse con los datos disponibles.

## Limitaciones y advertencias

- El único idioma declarado es el inglés. El entrenamiento incluyó estados en ruso con preguntas en inglés, pero no se declara soporte multilingüe general; el rendimiento en castellano u otros idiomas es desconocido.
- No genera texto libre: está confinado al espacio de opciones que recibe. No sirve para resúmenes, redacción ni diálogo abierto.
- Entrenado exclusivamente con datos sintéticos: existe riesgo de brecha de distribución frente a datos reales de producción, especialmente en dominios con jerga específica o formatos poco representados.
- La calibración de la confianza se ajustó sobre un split reservado del propio dataset sintético; fuera de esa distribución la confianza reportada puede no ser fiable y debería validarse con datos propios antes de automatizar decisiones.
- La primitiva `noul` devuelve una probabilidad sobre afirmaciones, no una verificación factual: puede producir estimaciones erróneas si la afirmación es ambigua o el estado no contiene la evidencia necesaria.
- Al requerir `trust_remote_code=True`, se ejecuta código del repositorio del autor en el entorno local; conviene auditar `modeling_tiny_jev.py` antes de desplegarlo en producción.
- No hay resultados de benchmarks publicados en la información disponible, ni validación independiente: el modelo registra 0 descargas y 3 likes, por lo que carece de evidencia de uso real en producción.
- El material de la model card está truncado en la sección de evaluación, de modo que no pueden confirmarse las cifras de accuracy ni de ECE.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3-0.6B y de los pesos derivados para el caso de uso concreto.
- El repositorio ocupa 1,2 GB y se actualizó el mismo día de su creación; conviene fijar una revisión concreta para evitar cambios inesperados en los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/lostargon/Tiny-Jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos). Los resultados devueltos corresponden a contenidos sin relación con Tiny-Jev.
