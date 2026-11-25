# Parag28/sajag-scam-classifier

## Resumen

Sajag-scam-classifier es un modelo publicado en Hugging Face por el usuario Parag28 bajo licencia Apache 2.0. Por el identificador y por el formato de pesos (ONNX), se trata de un clasificador orientado a la deteccion de mensajes fraudulentos o de estafa ("scam"), presumiblemente entrenado para etiquetar texto como legitimo o fraudulento. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de parametros reducidos, compatible con despliegue en CPU y en entornos de bajos recursos.

La model card publicada es practicamente vacia: solo incluye la declaracion de licencia, sin descripcion de arquitectura, datos de entrenamiento, metricas ni idiomas soportados. No se ha publicado informacion sobre el pipeline de Hugging Face, el tokenizador, el esquema de etiquetas ni el rendimiento del modelo. Cualquier evaluacion rigurosa requiere inspeccionar directamente los artefactos ONNX del repositorio.

Su relevancia actual es limitada pero concreta: los clasificadores ligeros de spam y fraude son utiles como primera capa de filtrado en sistemas de mensajeria, moderacion y deteccion de phishing, donde el coste por inferencia y la latencia importan mas que la precision de un LLM generativo. No obstante, la ausencia total de documentacion impide validar su calidad sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en formato ONNX; arquitectura concreta no documentada) |
| Parametros totales | no disponible (repo de ~0,1 GB, compatible con modelo de menos de 100 M de parametros) |
| Parametros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es ONNX; se desconoce si esta cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. El unico dato tecnico verificable es el formato de distribucion: pesos en ONNX, lo que indica que el autor ha exportado el modelo para inferencia con ONNX Runtime en lugar de distribuirlo en safetensors o PyTorch nativo. El tamano del repositorio (~0,1 GB) es coherente con un transformer encoder pequeno o con un modelo clasico de clasificacion de texto, pero no se puede confirmar.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, fuentes de mensajes fraudulentos), sobre el esquema de etiquetas ni sobre si se aplicaron tecnicas de ajuste fino supervisado, aumento de datos o calibracion. No consta informacion sobre sesgos evaluados ni sobre validacion cruzada.

## Capacidades

- Clasificacion de texto orientada a la deteccion de estafas, segun indica el nombre del modelo; el esquema exacto de etiquetas no esta documentado.
- Inferencia via ONNX Runtime, lo que permite ejecucion en CPU, GPU y entornos edge sin dependencia de PyTorch.
- No consta soporte de tool calling ni de function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta capacidad multilingue declarada.
- No consta generacion de texto, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Filtrado de primera capa en bandejas de entrada: el clasificador puede ejecutarse en ONNX Runtime sobre cada mensaje entrante y derivar los casos positivos a revision humana o a un modelo mayor, reduciendo el coste computacional del pipeline.
- Moderacion de mensajes en plataformas de mensajeria: al ser un modelo de ~0,1 GB, puede desplegarse junto al servicio de mensajeria para etiquetar en tiempo real conversaciones sospechosas de fraude.
- Deteccion de phishing en correo corporativo: integrado como paso previo al analisis de enlaces, permite descartar rapidamente mensajes con patrones de estafa conocidos antes de invocar heuristicas mas costosas.
- Prefiltrado en sistemas de atencion al cliente: clasificar tickets y mensajes de usuarios para separar posibles intentos de fraude de consultas legitimas y enrutar cada caso al equipo adecuado.
- Analisis por lotes de historicos de mensajes: la exportacion ONNX permite procesar grandes volumenes en CPU sin GPU, util para auditorias retrospectivas de fraude en conjuntos de datos ya almacenados.
- Componente en pipelines de seguridad y antifraude: servir como señal adicional dentro de un sistema de scoring que combine reglas, reputacion de remitente y este clasificador, con la ventaja de su licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con un repositorio de ~0,1 GB, la huella en memoria es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no se requiere GPU; el modelo puede ejecutarse en CPU mediante ONNX Runtime. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente si se desea acelerar el procesamiento por lotes.
- Compatibilidad con GPU consumer: si, en la practica totalidad de tarjetas actuales, dado el reducido tamano del artefacto.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), ONNX Runtime Web para navegador, y servidores de inferencia compatibles con ONNX. No consta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del tamano real del modelo, que no se ha documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parag28/sajag-scam-classifier | no disponible (~0,1 GB en ONNX) | no disponible | Clasificacion de estafas | Apache 2.0 | Hugging Face, 0 descargas |
| Clasificadores de spam basados en BERT (p. ej. variantes de distilbert fine-tuned) | 66 M (DistilBERT base) | 512 tokens | Clasificacion de spam/phishing | Variable (MIT, Apache 2.0) | Amplia en Hugging Face |
| Modelos de moderacion tipo Detoxify | 66 M-560 M | 512 tokens | Moderacion de contenido toxico | Apache 2.0 / MIT | Amplia en Hugging Face |

La comparacion cuantitativa no es posible: no hay datos publicados de rendimiento para sajag-scam-classifier, y los modelos alternativos citados cubren tareas relacionadas pero no identicas. Cualquier eleccion entre ellos exige una evaluacion sobre un conjunto de validacion propio.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan arquitectura, datos de entrenamiento, etiquetas, metricas ni limitaciones, lo que impide evaluar su fiabilidad antes de desplegarlo.
- Riesgo de sesgos desconocido: sin informacion sobre el corpus, no se puede descartar que el modelo aprenda patrones asociados a determinados remitentes, idiomas o estilos de escritura y produzca falsos positivos sistematicos.
- Riesgo de alucinacion no aplicable en sentido estricto al ser un clasificador, pero si existe riesgo de clasificaciones erroneas con alta confianza si el modelo no esta calibrado.
- Cobertura idiomatica no declarada: no hay garantia de que funcione en castellano ni en idiomas distintos del usado en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar el aviso de licencia y a no atribuir al autor responsabilidad alguna; al no haber documentacion, el cumplimiento de requisitos adicionales es dificil de verificar.
- Sin descargas ni validacion de la comunidad: el modelo no ha sido probado publicamente, por lo que su calidad es desconocida.
- Para produccion se recomienda evaluarlo sobre un conjunto etiquetado propio, medir precision, recall y calibracion, y combinarlo con reglas y revision humana antes de automatizar decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Parag28/sajag-scam-classifier
- Perfil del autor: https://huggingface.co/Parag28
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
