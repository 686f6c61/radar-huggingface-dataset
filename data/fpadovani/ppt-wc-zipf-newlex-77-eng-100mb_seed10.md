# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed10

## Resumen

ppt-wc-zipf-newlex-77-eng-100mb_seed10 es un ajuste fino (fine-tune) del modelo monolingüe goldfish-models/eng_latn_100mb, publicado por el usuario fpadovani en HuggingFace el 13 de septiembre de 2026. Se trata de un transformer decoder-only de estilo GPT-2 con 86.508.288 parámetros, entrenado mediante supervisión directa (SFT) con la librería TRL 0.23.0 sobre Transformers 4.56.2. El repositorio almacena únicamente pesos en formato safetensors y no incluye documentación sobre el dataset, la composición de los datos ni los hiperparámetros empleados.

El modelo apenas tiene tracción pública: cero descargas y cero "likes" en el momento de redactar esta ficha, y su model card es prácticamente la plantilla autogenerada por TRL. El nombre del repositorio y la URL del experimento en Weights & Biases (entidad f-padovani-university-of-groningen, proyecto white_cotterell) apuntan a un trabajo académico de investigación sobre lingüística computacional, probablemente un barrido de experimentos controlados sobre distribución de frecuencias (ley de Zipf), cobertura léxica y variantes de tokenización, con el identificador 77 y la semilla 10 como coordenadas dentro de ese barrido.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible y de bajo coste computacional, no la de un modelo listo para producción. Sirve como punto de comparación en estudios sobre modelos pequeños, como base para experimentos de ajuste sobre corpus de 100 MB y como caso de prueba para pipelines de despliegue que necesiten verificar el flujo completo de HuggingFace a un endpoint de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en los tags del repositorio; sin confirmacion documental de la configuracion exacta) |
| Parametros totales | 86.508.288 (86,5 M, dato real de los pesos safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponible (el modelo base es de ingles, `eng_latn_100mb`, lo que sugiere uso practico unicamente en ingles) |
| Licencia | No disponible (la model card contiene el marcador de posicion `licence: license`, sin texto legal) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eng_latn_100mb |
| Tamano del repositorio | 1,4 GB |
| Libreria | transformers |
| Tarea (pipeline) | text-generation |
| Version de TRL | 0.23.0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y el tamaño de 86,5 millones de parámetros sitúan al modelo en la familia de transformers decoder-only con atención causal completa, normalización tipo LayerNorm y embeddings de tokens y posiciones aprendidos. No hay información publicada sobre el número de capas, dimensiones ocultas, cabezas de atención, tamaño de vocabulario ni la longitud de contexto efectiva. El modelo base, goldfish-models/eng_latn_100mb, pertenece a una colección de modelos monolingües entrenados sobre aproximadamente 100 MB de texto por idioma, según se deduce de la convención de nombres del repositorio; tampoco se documenta su número de tokens, su composición ni si recibió ajuste por instrucciones.

El entrenamiento se realizó con SFT sobre la implementación de TRL (versión 0.23.0), con Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican el dataset de ajuste, el número de épocas, la tasa de aprendizaje, el tamaño de lote, la longitud de secuencia ni si hubo fases posteriores de DPO, RLHF o ajuste por preferencias; la model card se limita a indicar "This model was trained with SFT". El ejemplo de inicio rápido utiliza una lista de diccionarios con el campo `role`, lo que indica que el formato de entrada del ajuste era de tipo conversacional, aunque no hay ninguna garantía de que el modelo haya aprendido a seguir instrucciones de forma fiable con solo 86,5 M de parámetros.

No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, MoE, SSM ni mecanismos híbridos). El único elemento diferencial identificable es el propio diseño experimental: el sufijo `zipf-newlex-77` del nombre sugiere que se trata de una de las variantes de una comparativa controlada sobre léxico y frecuencias, y el run de W&B asociado permite inspeccionar la curva de entrenamiento si el proyecto sigue siendo público.

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad limitada por el tamaño del modelo (86,5 M de parámetros) y por el corpus de entrenamiento.
- Continuación de texto y respuesta a entradas con formato conversacional (lista de mensajes con campo `role`), tal y como muestra el ejemplo oficial de la model card.
- Generación de texto sintético de muestra para pruebas y prototipos.
- Inferencia en CPU, dado su reducido tamaño.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso o uso de herramientas externas.
- No hay evidencia documentada de capacidades multilingües; el modelo base es específicamente de inglés.
- No dispone de visión, audio, modo de razonamiento explícito (thinking mode) ni salidas estructuradas garantizadas.
- Compatible con el ecosistema de `text-generation-inference` y con endpoints de HuggingFace según los tags del repositorio, aunque sin métricas publicadas de latencia o throughput.

## Casos de uso

- Reproducción de experimentos académicos: el modelo permite replicar y auditar un punto concreto (variante 77, semilla 10) de un barrido experimental sobre léxico y frecuencias, siempre que el resto de la configuración esté documentada en el proyecto de W&B asociado.
- Baseline en estudios sobre modelos pequeños: sirve como referencia de 86,5 M de parámetros al comparar arquitecturas, tokenizadores o regímenes de ajuste sobre corpus de 100 MB.
- Análisis de cobertura léxica y tokenización: al derivar de un modelo entrenado sobre un volumen de texto controlado, es útil para medir cómo afecta el vocabulario del tokenizador a la generación en dominios con vocabulario especializado.
- Pruebas de extremo a extremo en pipelines de despliegue: su tamaño reducido permite validar en minutos un flujo completo de publicación (HuggingFace, descarga de safetensors, carga con Transformers, servido con TGI) sin consumir recursos de GPU relevantes.
- Generación de datos sintéticos para pruebas unitarias: puede producir cadenas de texto plausibles para rellenar fixtures, pruebas de integración o validación de esquemas de respuesta en aplicaciones que no requieren calidad lingüística alta.
- Docencia y experimentación en aula: es un caso práctico y barato para explicar el flujo completo de ajuste supervisado con TRL, desde el modelo base hasta la publicación de pesos en el Hub.
- Inferencia en dispositivos sin GPU: cabe en memoria de sistemas embebidos o portátiles modestos, lo que permite ejecutarlo como servicio de texto de baja prioridad o en entornos de desarrollo sin acelerador.
- Investigación sobre calibración y alucinación: al ser un modelo pequeño entrenado con SFT sobre datos desconocidos, resulta adecuado como sujeto de estudio para medir confianza, repetitividad y degradación de la coherencia en contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de ningún tipo (perplejidad, MMLU, HumanEval, GSM8K, evaluación de generación ni comparaciones con el modelo base), y el modelo registra cero descargas y cero "likes", por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 350 MB solo para los pesos (86,5 M de parámetros × 4 bytes), más el consumo de activaciones y caché KV.
- VRAM estimada en FP16/BF16: aproximadamente 175 MB para los pesos.
- VRAM estimada en int8: alrededor de 90 MB; en int4, alrededor de 45 MB (cálculos teóricos a partir del número de parámetros, ya que no se publican variantes cuantizadas).
- Cabe sin dificultad en cualquier GPU de consumo: GTX 1050 Ti en adelante, RTX 3060, RTX 4090, e incluso en CPU o en GPU integrada, dado el reducido tamaño.
- En GPU de centro de datos (A100, H100) el modelo está infrautilizado; solo tendría sentido en escenarios de evaluación por lotes muy grandes o de comparación sistemática.
- Tenga en cuenta que el repositorio ocupa 1,4 GB, muy por encima del peso teórico de los pesos, lo que sugiere la presencia de otros artefactos en el historial de revisiones (por ejemplo, estados del optimizador o checkpoints intermedios).
- Opciones de despliegue: `transformers.pipeline` con `device="cuda"` o CPU, `text-generation-inference` (etiqueta presente en el repositorio y en los endpoints compatibles), vLLM y llama.cpp u Ollama previa conversión manual a GGUF, ya que no se distribuyen pesos en ese formato.
- Latencia y throughput: no disponible, no se publican mediciones.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de sus respectivas model cards publicas en HuggingFace; los datos del modelo de esta ficha son los unicos verificados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed10 | 86,5 M | No disponible | No disponible | safetensors, 0 descargas | Ajuste experimental, sin documentacion de datos ni metricas |
| distilgpt2 | 82 M | 1024 tokens | Apache-2.0 | safetensors y pytorch bin, ampliamente descargado | Destilado de GPT-2, uso general en ingles |
| gpt2 (GPT-2 small) | 124 M | 1024 tokens | MIT | safetensors y pytorch bin, ampliamente descargado | Referencia historica de la familia; su tokenizador es el habitualmente reutilizado |
| pythia-70m | 70 M | 2048 tokens | Apache-2.0 | safetensors, ampliamente descargado | Suite de investigacion con checkpoints intermedios y datos publicos (Pile) |

La diferencia fundamental no está en el rendimiento, sino en la trazabilidad: los tres modelos alternativos documentan datos de entrenamiento, licencia y proceso de evaluación, mientras que este fine-tune no aporta ninguno de esos elementos. Para cualquier uso que requiera licencia clara o resultados verificables, las alternativas de la tabla son preferibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un corpus inglés y desconocido, es probable que reproduzca los sesgos presentes en él, pero no hay análisis publicado.
- Riesgo de alucinación: elevado para un modelo de 86,5 M de parámetros ajustado con SFT; no dispone de mecanismos de verificación ni de rechazo de preguntas fuera de dominio.
- Ausencia total de información sobre el dataset de ajuste: se desconoce si contiene datos personales, contenido con derechos de autor o material sensible, lo que impide evaluar riesgos legales y éticos.
- Licencia no disponible: la model card incluye un marcador de posición (`licence: license`) sin texto legal. No se puede asumir uso comercial permitido; en ausencia de licencia explícita, debe tratarse como no autorizado para producción.
- Idiomas: el modelo base es monolingüe en inglés; no hay evidencia de capacidades en castellano ni en otras lenguas.
- Longitud de contexto desconocida, lo que impide garantizar un comportamiento correcto en conversaciones multi-turno o documentos largos.
- Sin métricas ni evaluaciones: no se puede afirmar que supere al modelo base en ninguna tarea concreta; es posible que el ajuste SFT solo haya especializado el estilo de salida.
- Riesgo de repetición y de degradación de la coherencia propios de los modelos pequeños, especialmente en generaciones largas.
- Trazabilidad limitada: el único artefacto adicional enlazado es un run de Weights & Biases, que puede dejar de ser accesible y que no sustituye a una documentación formal.
- El repositorio de 1,4 GB frente a los ~350 MB de pesos en FP32 sugiere contenido adicional no especificado en el historial de revisiones; conviene revisar los archivos antes de descargarlo en entornos con cuota de almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/yq5jsgsp
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (BibTeX incluida en la model card): von Werra, L. et al., "TRL: Transformer Reinforcement Learning", 2020.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a listados de hoteles y no guardan relacion con el contenido de la ficha).
